import { download } from "../../core/api.js";
import {
  cortar,
  escapeHtml,
  extrairUrl,
  links,
  numeroCurto,
} from "../../utils/helpers.js";
export const description = "Baixa video, foto ou carrossel do Instagram";
export const aliases = ["insta", "ig", "instavideo", "instamp4", "igdl"];
export const uso = "/instagram https://www.instagram.com/reel/ID/";
export const cooldown = 5;
function montarLegenda(dados) {
  const linhas = ["<b>INSTAGRAM</b>", ""];
  if (dados.autor) linhas.push(`<b>Autor:</b> ${escapeHtml(dados.autor)}`);
  if (dados.curtidas !== undefined) {
    linhas.push(`<b>Curtidas:</b> ${numeroCurto(dados.curtidas)}`);
  }
  if (dados.comentarios !== undefined) {
    linhas.push(`<b>Comentarios:</b> ${numeroCurto(dados.comentarios)}`);
  }
  if (dados.legenda) {
    linhas.push("", `<i>${escapeHtml(cortar(dados.legenda, 400))}</i>`);
  }
  return linhas.join("\n");
}
async function enviarMidia(ctx, midia, legenda) {
  const opcoes = { reply_markup: ctx.tecladoApagar() };
  try {
    if (midia.tipo === "image") {
      await ctx.enviarFoto(midia.url, legenda, opcoes);
    } else if (midia.tipo === "audio") {
      await ctx.enviarAudio(midia.url, { caption: legenda, ...opcoes });
    } else {
      await ctx.enviarVideo(midia.url, legenda, opcoes);
    }
  } catch (err) {
    const desc = err instanceof Error ? err.message : String(err);
    if (
      /too big|failed to get http url content|wrong file identifier/i.test(desc)
    ) {
      await ctx.enviarDocumento(midia.url, { caption: legenda, ...opcoes });
      return;
    }
    throw err;
  }
}
export default async function instagram(ctx) {
  const url = extrairUrl(ctx.q) || ctx.q.trim();
  if (!url) {
    await ctx.uso(
      `${ctx.prefix}instagram https://www.instagram.com/reel/CZIV8TyBbTA/`,
      "Manda o link do post, reel ou foto.",
    );
    return;
  }
  if (!links.instagram(url)) {
    await ctx.erro(
      "Esse link nao e do Instagram. Manda algo tipo:\n<code>https://www.instagram.com/reel/ID/</code>",
    );
    return;
  }
  const carregando = await ctx.carregando(" Baixando do Instagram...");
  try {
    const dados = await download.instagram(url);
    const legenda = montarLegenda(dados);
    await carregando.apagar();
    const visuais = dados.midias.filter(
      (m) => m.tipo === "video" || m.tipo === "image",
    );
    if (visuais.length > 1) {
      const grupo = visuais.slice(0, 10).map((midia, indice) => ({
        type: midia.tipo === "image" ? "photo" : "video",
        media: midia.url,
        ...(indice === 0
          ? { caption: cortar(legenda, 1024), parse_mode: "HTML" }
          : {}),
      }));
      try {
        await ctx.ctx.replyWithMediaGroup(grupo, {
          reply_to_message_id: ctx.messageId,
        });
        if (visuais.length > 10) {
          await ctx.responder(
            `ℹ Esse post tem ${visuais.length} midias, mandei as 10 primeiras.`,
          );
        }
        return;
      } catch {}
    }
    const principal = visuais[0] ?? dados.midias[0];
    if (!principal) {
      await ctx.erro("Nao achei midia nesse post.");
      return;
    }
    await enviarMidia(ctx, principal, legenda);
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
