import { db } from "./db.js";
import { logAviso } from "../utils/logger.js";

const VALIDADE = 24 * 60 * 60 * 1000;

let telegram = null;

export function ligarTelegram(instancia) {
  telegram = instancia;
}

function guardar(tipo, alvoId, dados, mime, fileId) {
  db.prepare(
    `
    INSERT INTO avatares (tipo, alvo_id, file_id, dados, mime, buscado_em)
    VALUES (@tipo, @alvo, @file, @dados, @mime, @em)
    ON CONFLICT(tipo, alvo_id) DO UPDATE SET
      file_id = @file, dados = @dados, mime = @mime, buscado_em = @em
  `,
  ).run({
    tipo,
    alvo: String(alvoId),
    file: fileId ?? null,
    dados: dados ?? null,
    mime: mime ?? "image/jpeg",
    em: Date.now(),
  });
}

async function baixarDoTelegram(tipo, alvoId) {
  if (!telegram) return null;

  try {
    let fileId = null;

    if (tipo === "usuario") {
      const fotos = await telegram.getUserProfilePhotos(Number(alvoId), 0, 1);
      const primeira = fotos?.photos?.[0];
      if (!primeira || primeira.length === 0) return null;
      fileId = primeira[primeira.length - 1].file_id;
    } else {
      const chat = await telegram.getChat(Number(alvoId));
      fileId = chat?.photo?.big_file_id ?? chat?.photo?.small_file_id ?? null;
      if (!fileId) return null;
    }

    const link = await telegram.getFileLink(fileId);
    const resposta = await fetch(String(link));
    if (!resposta.ok) return null;

    const buffer = Buffer.from(await resposta.arrayBuffer());
    const bruto = resposta.headers.get("content-type") ?? "";
    const mime = bruto.startsWith("image/") ? bruto : "image/jpeg";

    guardar(tipo, alvoId, buffer, mime, fileId);
    return { dados: buffer, mime };
  } catch (err) {
    const msg = err?.message ?? String(err);
    if (!/not found|PHOTO|chat not found|user not found/i.test(msg)) {
      logAviso(`[avatar] ${tipo} ${alvoId}: ${msg}`);
    }
    guardar(tipo, alvoId, null, "none", null);
    return null;
  }
}

export async function obterAvatar(tipo, alvoId) {
  const linha = db
    .prepare("SELECT * FROM avatares WHERE tipo = ? AND alvo_id = ?")
    .get(tipo, String(alvoId));

  const fresco = linha && Date.now() - linha.buscado_em < VALIDADE;

  if (fresco) {
    if (!linha.dados) return null;
    return { dados: linha.dados, mime: linha.mime };
  }

  const baixado = await baixarDoTelegram(tipo, alvoId);
  if (baixado) return baixado;

  if (linha?.dados) return { dados: linha.dados, mime: linha.mime };
  return null;
}

export function limparAvataresAntigos(dias = 7) {
  const corte = Date.now() - dias * 86400000;
  return db.prepare("DELETE FROM avatares WHERE buscado_em < ?").run(corte)
    .changes;
}
