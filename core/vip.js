import { db } from "./db.js";
import botConfig from "../config/index.js";

export const PLANOS = {
  bronze: {
    nome: "Bronze",
    emoji: "",
    limiteDiario: 150,
    cooldown: 2,
    prioridade: 1,
    beneficios: [
      "150 comandos por dia",
      "Cooldown reduzido pra 2s",
      "Sem anuncio no rodape",
    ],
  },
  prata: {
    nome: "Prata",
    emoji: "",
    limiteDiario: 400,
    cooldown: 1,
    prioridade: 2,
    beneficios: [
      "400 comandos por dia",
      "Cooldown de 1s",
      "Downloads em fila prioritaria",
    ],
  },
  ouro: {
    nome: "Ouro",
    emoji: "",
    limiteDiario: 1000,
    cooldown: 0,
    prioridade: 3,
    beneficios: [
      "1000 comandos por dia",
      "Sem cooldown",
      "Acesso a comandos exclusivos",
    ],
  },
  diamante: {
    nome: "Diamante",
    emoji: "",
    limiteDiario: Infinity,
    cooldown: 0,
    prioridade: 4,
    beneficios: [
      "Comandos ilimitados",
      "Sem cooldown",
      "Suporte direto com o dono",
    ],
  },
};

export const PLANO_FREE = {
  nome: "Free",
  emoji: "",
  limiteDiario: 50,
  cooldown: 5,
  prioridade: 0,
  beneficios: ["50 comandos por dia"],
};

export const ORDEM_PLANOS = ["bronze", "prata", "ouro", "diamante"];

function hoje() {
  return new Date().toLocaleDateString("en-CA", {
    timeZone: botConfig.timezone,
  });
}

function registrarHistorico(userId, acao, plano, duracao, por) {
  db.prepare(
    "INSERT INTO vip_historico (user_id, acao, plano, duracao, por, em) VALUES (?,?,?,?,?,?)",
  ).run(
    String(userId),
    acao,
    plano ?? null,
    duracao ?? null,
    String(por ?? ""),
    Date.now(),
  );
}

export function obterVip(userId) {
  const id = String(userId);
  const linha = db.prepare("SELECT * FROM vip WHERE id = ?").get(id);
  if (!linha) return null;

  if (!linha.vitalicio && linha.expira_em && Date.now() > linha.expira_em) {
    db.prepare("DELETE FROM vip WHERE id = ?").run(id);
    registrarHistorico(id, "expirou", linha.plano, null, "sistema");
    return null;
  }
  return linha;
}

export function ehVip(userId) {
  return obterVip(userId) !== null;
}

export function planoDe(userId) {
  if (botConfig.ehDono(userId)) {
    return { chave: "dono", ...PLANOS.diamante, nome: "Dono", emoji: "" };
  }
  const vip = obterVip(userId);
  if (!vip) return { chave: "free", ...PLANO_FREE };
  const plano = PLANOS[vip.plano] ?? PLANOS.bronze;
  return { chave: vip.plano, ...plano };
}

export function adicionarVip(
  userId,
  { plano = "bronze", duracaoMs = null, por = "" } = {},
) {
  const id = String(userId);
  if (!PLANOS[plano]) throw new Error(`Plano invalido: ${plano}`);

  const agora = Date.now();
  const atual = obterVip(id);
  const vitalicio = duracaoMs === null;

  let expiraEm = null;
  if (!vitalicio) {
    const base =
      atual && !atual.vitalicio && atual.expira_em && atual.expira_em > agora
        ? atual.expira_em
        : agora;
    expiraEm = base + duracaoMs;
  }

  db.prepare(
    `
  INSERT INTO vip (id, plano, expira_em, vitalicio, desde, concedido_por, usos_hoje, usos_total, reset_em)
  VALUES (@id, @plano, @expira, @vit, @desde, @por, 0, @total, 0)
  ON CONFLICT(id) DO UPDATE SET
  plano = @plano,
  expira_em = @expira,
  vitalicio = @vit,
  concedido_por = @por
  `,
  ).run({
    id,
    plano,
    expira: expiraEm,
    vit: vitalicio ? 1 : 0,
    desde: atual ? atual.desde : agora,
    por: String(por),
    total: atual ? atual.usos_total : 0,
  });

  registrarHistorico(id, atual ? "renovou" : "ativou", plano, duracaoMs, por);
  return obterVip(id);
}

export function removerVip(userId, por = "") {
  const id = String(userId);
  const atual = obterVip(id);
  if (!atual) return false;
  db.prepare("DELETE FROM vip WHERE id = ?").run(id);
  registrarHistorico(id, "removeu", atual.plano, null, por);
  return true;
}

export function listarVips() {
  const agora = Date.now();
  return db
    .prepare(
      `
  SELECT v.*, u.nome, u.username
  FROM vip v
  LEFT JOIN usuarios u ON u.id = v.id
  WHERE v.vitalicio = 1 OR v.expira_em IS NULL OR v.expira_em > ?
  ORDER BY v.vitalicio DESC, v.expira_em DESC
  `,
    )
    .all(agora);
}

export function limparVipsExpirados() {
  const agora = Date.now();
  const vencidos = db
    .prepare(
      "SELECT id, plano FROM vip WHERE vitalicio = 0 AND expira_em IS NOT NULL AND expira_em < ?",
    )
    .all(agora);

  if (vencidos.length === 0) return 0;

  const remover = db.transaction((linhas) => {
    for (const l of linhas) {
      db.prepare("DELETE FROM vip WHERE id = ?").run(l.id);
      registrarHistorico(l.id, "expirou", l.plano, null, "sistema");
    }
  });
  remover(vencidos);
  return vencidos.length;
}

export function consumirUso(userId) {
  const id = String(userId);
  const dia = hoje();
  const plano = planoDe(id);

  if (plano.chave === "dono" || plano.limiteDiario === Infinity) {
    return {
      permitido: true,
      usados: 0,
      limite: Infinity,
      restantes: Infinity,
    };
  }

  const linha = db
    .prepare("SELECT usos FROM uso_diario WHERE user_id = ? AND dia = ?")
    .get(id, dia);
  const usados = linha ? linha.usos : 0;

  if (usados >= plano.limiteDiario) {
    return {
      permitido: false,
      usados,
      limite: plano.limiteDiario,
      restantes: 0,
    };
  }

  db.prepare(
    `
  INSERT INTO uso_diario (user_id, dia, usos) VALUES (?,?,1)
  ON CONFLICT(user_id, dia) DO UPDATE SET usos = usos + 1
  `,
  ).run(id, dia);

  if (ehVip(id)) {
    db.prepare(
      "UPDATE vip SET usos_total = usos_total + 1, usos_hoje = ? WHERE id = ?",
    ).run(usados + 1, id);
  }

  return {
    permitido: true,
    usados: usados + 1,
    limite: plano.limiteDiario,
    restantes: plano.limiteDiario - usados - 1,
  };
}

export function usoDe(userId) {
  const id = String(userId);
  const plano = planoDe(id);
  const linha = db
    .prepare("SELECT usos FROM uso_diario WHERE user_id = ? AND dia = ?")
    .get(id, hoje());
  const usados = linha ? linha.usos : 0;
  return {
    usados,
    limite: plano.limiteDiario,
    restantes:
      plano.limiteDiario === Infinity
        ? Infinity
        : Math.max(0, plano.limiteDiario - usados),
  };
}

export function historicoDe(userId, limite = 10) {
  return db
    .prepare(
      "SELECT * FROM vip_historico WHERE user_id = ? ORDER BY em DESC LIMIT ?",
    )
    .all(String(userId), limite);
}

export function limparUsoAntigo(dias = 7) {
  const corte = new Date(Date.now() - dias * 86400000).toLocaleDateString(
    "en-CA",
    {
      timeZone: botConfig.timezone,
    },
  );
  const r = db.prepare("DELETE FROM uso_diario WHERE dia < ?").run(corte);
  return r.changes;
}

export function estatisticasVip() {
  const total = db.prepare("SELECT COUNT(*) c FROM vip").get().c;
  const porPlano = db
    .prepare("SELECT plano, COUNT(*) c FROM vip GROUP BY plano")
    .all();
  const vitalicios = db
    .prepare("SELECT COUNT(*) c FROM vip WHERE vitalicio = 1")
    .get().c;
  return { total, vitalicios, porPlano };
}
