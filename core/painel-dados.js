import { db } from "./db.js";
import botConfig from "../config/index.js";
import { PLANOS, PLANO_FREE } from "./vip.js";

const hoje = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: botConfig.timezone });

function enriquecer(linha) {
  const dono = botConfig.ehDono(linha.id);
  const plano = dono
    ? { chave: "dono", nome: "Dono" }
    : linha.plano
      ? { chave: linha.plano, nome: PLANOS[linha.plano]?.nome ?? linha.plano }
      : { chave: "free", nome: PLANO_FREE.nome };

  return {
    id: linha.id,
    nome: linha.nome || linha.id,
    username: linha.username || "",
    comandos: linha.comandos ?? 0,
    primeiroUso: linha.primeiro_uso,
    ultimoUso: linha.ultimo_uso,
    usosHoje: linha.usos_hoje ?? 0,
    bloqueado: Boolean(linha.bloqueado),
    ehBot: Boolean(linha.eh_bot),
    idioma: linha.idioma || "",
    tgPremium: Boolean(linha.tg_premium),
    tipoChat: linha.tipo_chat || "private",
    dono,
    plano,
    vip: Boolean(linha.plano),
    vitalicio: Boolean(linha.vitalicio),
    expiraEm: linha.expira_em,
  };
}

export function listarUsuarios({
  busca = "",
  filtro = "todos",
  pagina = 1,
  porPagina = 25,
} = {}) {
  const termo = `%${String(busca).trim().toLowerCase()}%`;
  const temBusca = String(busca).trim().length > 0;

  const condicoes = [];
  if (temBusca)
    condicoes.push(
      "(LOWER(u.nome) LIKE @termo OR LOWER(u.username) LIKE @termo OR u.id LIKE @termo)",
    );
  if (filtro === "vip") condicoes.push("v.id IS NOT NULL");
  if (filtro === "bots") condicoes.push("u.eh_bot = 1");
  if (filtro === "humanos") condicoes.push("u.eh_bot = 0");
  if (filtro === "premium") condicoes.push("u.tg_premium = 1");
  if (filtro === "bloqueados") condicoes.push("b.id IS NOT NULL");
  if (filtro === "donos") {
    const lista =
      botConfig.owners
        .map((o) => `'${String(o).replace(/'/g, "")}'`)
        .join(",") || "''";
    condicoes.push(`u.id IN (${lista})`);
  }

  const where = condicoes.length > 0 ? `WHERE ${condicoes.join(" AND ")}` : "";
  const limite = Math.min(Math.max(Number(porPagina) || 25, 1), 100);
  const offset = (Math.max(Number(pagina) || 1, 1) - 1) * limite;

  const base = `
    FROM usuarios u
    LEFT JOIN vip v ON v.id = u.id
    LEFT JOIN bloqueados b ON b.id = u.id
    ${where}
  `;

  const total = db.prepare(`SELECT COUNT(*) c ${base}`).get({ termo }).c;

  const linhas = db
    .prepare(
      `
      SELECT u.*, v.plano, v.vitalicio, v.expira_em,
             b.id AS bloqueado,
             (SELECT usos FROM uso_diario d WHERE d.user_id = u.id AND d.dia = @dia) AS usos_hoje
      ${base}
      ORDER BY u.ultimo_uso DESC
      LIMIT @limite OFFSET @offset
    `,
    )
    .all({ termo, dia: hoje(), limite, offset });

  return {
    usuarios: linhas.map(enriquecer),
    total,
    pagina: Math.max(Number(pagina) || 1, 1),
    paginas: Math.max(Math.ceil(total / limite), 1),
  };
}

export function detalheUsuario(id) {
  const uid = String(id);

  const linha = db
    .prepare(
      `
      SELECT u.*, v.plano, v.vitalicio, v.expira_em, v.usos_total, v.desde AS vip_desde,
             b.id AS bloqueado, b.motivo AS bloqueio_motivo,
             (SELECT usos FROM uso_diario d WHERE d.user_id = u.id AND d.dia = @dia) AS usos_hoje
      FROM usuarios u
      LEFT JOIN vip v ON v.id = u.id
      LEFT JOIN bloqueados b ON b.id = u.id
      WHERE u.id = @uid
    `,
    )
    .get({ uid, dia: hoje() });

  if (!linha) return null;

  return {
    ...enriquecer(linha),
    usosTotalVip: linha.usos_total ?? 0,
    vipDesde: linha.vip_desde,
    bloqueioMotivo: linha.bloqueio_motivo ?? "",
    historico: db
      .prepare(
        "SELECT * FROM vip_historico WHERE user_id = ? ORDER BY em DESC LIMIT 15",
      )
      .all(uid),
    ultimosDias: db
      .prepare(
        "SELECT dia, usos FROM uso_diario WHERE user_id = ? ORDER BY dia DESC LIMIT 7",
      )
      .all(uid),
  };
}

export function listarGruposDetalhado({
  busca = "",
  pagina = 1,
  porPagina = 25,
} = {}) {
  const termo = `%${String(busca).trim().toLowerCase()}%`;
  const where = String(busca).trim()
    ? "WHERE LOWER(titulo) LIKE @termo OR id LIKE @termo"
    : "";

  const limite = Math.min(Math.max(Number(porPagina) || 25, 1), 100);
  const offset = (Math.max(Number(pagina) || 1, 1) - 1) * limite;

  const total = db
    .prepare(`SELECT COUNT(*) c FROM grupos ${where}`)
    .get({ termo }).c;

  const grupos = db
    .prepare(
      `SELECT * FROM grupos ${where} ORDER BY mensagens DESC LIMIT @limite OFFSET @offset`,
    )
    .all({ termo, limite, offset });

  return {
    grupos: grupos.map((g) => ({
      id: g.id,
      titulo: g.titulo,
      tipo: g.tipo,
      desde: g.desde,
      mensagens: g.mensagens,
      membros: g.membros ?? 0,
      membrosEm: g.membros_em ?? 0,
      botAdmin: Boolean(g.bot_admin),
      username: g.username ?? "",
    })),
    total,
    pagina: Math.max(Number(pagina) || 1, 1),
    paginas: Math.max(Math.ceil(total / limite), 1),
  };
}

export function listarDonos() {
  return botConfig.owners.map((id) => {
    const u = db.prepare("SELECT * FROM usuarios WHERE id = ?").get(String(id));
    return {
      id: String(id),
      nome: u?.nome ?? "Ainda nao usou o bot",
      username: u?.username ?? "",
      comandos: u?.comandos ?? 0,
      ultimoUso: u?.ultimo_uso ?? null,
      registrado: Boolean(u),
    };
  });
}

export function resumoGeral() {
  const agora = Date.now();
  const dia = hoje();

  const q = (sql, ...p) => db.prepare(sql).get(...p);

  return {
    usuarios: {
      total: q("SELECT COUNT(*) c FROM usuarios").c,
      ativosHoje: q(
        "SELECT COUNT(DISTINCT user_id) c FROM uso_diario WHERE dia = ?",
        dia,
      ).c,
      novos7d: q(
        "SELECT COUNT(*) c FROM usuarios WHERE primeiro_uso > ?",
        agora - 7 * 86400000,
      ).c,
      bloqueados: q("SELECT COUNT(*) c FROM bloqueados").c,
      bots: q("SELECT COUNT(*) c FROM usuarios WHERE eh_bot = 1").c,
      humanos: q("SELECT COUNT(*) c FROM usuarios WHERE eh_bot = 0").c,
      tgPremium: q("SELECT COUNT(*) c FROM usuarios WHERE tg_premium = 1").c,
      noPrivado: q(
        "SELECT COUNT(*) c FROM usuarios WHERE tipo_chat = 'private'",
      ).c,
      emGrupo: q("SELECT COUNT(*) c FROM usuarios WHERE tipo_chat = 'group'").c,
      porIdioma: db
        .prepare(
          `SELECT COALESCE(NULLIF(idioma, ''), 'desconhecido') idioma, COUNT(*) c
           FROM usuarios GROUP BY 1 ORDER BY c DESC LIMIT 8`,
        )
        .all(),
    },
    grupos: {
      total: q("SELECT COUNT(*) c FROM grupos").c,
      mensagens: q("SELECT COALESCE(SUM(mensagens), 0) s FROM grupos").s,
      membros: q("SELECT COALESCE(SUM(membros), 0) s FROM grupos").s,
      comBotAdmin: q("SELECT COUNT(*) c FROM grupos WHERE bot_admin = 1").c,
    },
    vips: {
      total: q("SELECT COUNT(*) c FROM vip").c,
      vitalicios: q("SELECT COUNT(*) c FROM vip WHERE vitalicio = 1").c,
      porPlano: db
        .prepare("SELECT plano, COUNT(*) c FROM vip GROUP BY plano")
        .all(),
      expirando7d: q(
        "SELECT COUNT(*) c FROM vip WHERE vitalicio = 0 AND expira_em BETWEEN ? AND ?",
        agora,
        agora + 7 * 86400000,
      ).c,
    },
    comandos: {
      execucoes: q("SELECT COALESCE(SUM(usos), 0) s FROM estatisticas").s,
      erros: q("SELECT COALESCE(SUM(erros), 0) s FROM estatisticas").s,
      hoje: q(
        "SELECT COALESCE(SUM(usos), 0) s FROM uso_diario WHERE dia = ?",
        dia,
      ).s,
    },
    donos: botConfig.owners.length,
  };
}

export function usoUltimosDias(dias = 14) {
  return db
    .prepare(
      `
      SELECT dia, SUM(usos) usos, COUNT(DISTINCT user_id) usuarios
      FROM uso_diario
      GROUP BY dia
      ORDER BY dia DESC
      LIMIT ?
    `,
    )
    .all(dias)
    .reverse();
}
