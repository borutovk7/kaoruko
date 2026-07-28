import { db } from "./db.js";

export function registrarUsuario({
  id,
  nome,
  username,
  ehBot = false,
  idioma = "",
  tgPremium = false,
  tipoChat = "private",
}) {
  const uid = String(id);
  const agora = Date.now();

  db.prepare(
    `
    INSERT INTO usuarios (id, nome, username, comandos, primeiro_uso, ultimo_uso, eh_bot, idioma, tg_premium, tipo_chat)
    VALUES (@id, @nome, @user, 1, @agora, @agora, @bot, @idioma, @prem, @chat)
    ON CONFLICT(id) DO UPDATE SET
      nome = COALESCE(NULLIF(@nome, ''), nome),
      username = COALESCE(NULLIF(@user, ''), username),
      comandos = comandos + 1,
      ultimo_uso = @agora,
      eh_bot = @bot,
      idioma = COALESCE(NULLIF(@idioma, ''), idioma),
      tg_premium = @prem,
      tipo_chat = @chat
  `,
  ).run({
    id: uid,
    nome: nome ?? "",
    user: username ?? "",
    agora,
    bot: ehBot ? 1 : 0,
    idioma: idioma ?? "",
    prem: tgPremium ? 1 : 0,
    chat: tipoChat ?? "private",
  });

  return db.prepare("SELECT * FROM usuarios WHERE id = ?").get(uid);
}

export function obterUsuario(id) {
  return (
    db.prepare("SELECT * FROM usuarios WHERE id = ?").get(String(id)) ?? null
  );
}

export function contarUsuarios() {
  return db.prepare("SELECT COUNT(*) c FROM usuarios").get().c;
}

export function topUsuarios(limite = 10) {
  return db
    .prepare("SELECT * FROM usuarios ORDER BY comandos DESC LIMIT ?")
    .all(limite);
}

export function registrarGrupo(chat) {
  if (!chat || chat.id === undefined) return;
  const id = String(chat.id);
  const agora = Date.now();

  db.prepare(
    `
  INSERT INTO grupos (id, titulo, tipo, desde, mensagens)
  VALUES (@id, @titulo, @tipo, @agora, 1)
  ON CONFLICT(id) DO UPDATE SET
  titulo = @titulo,
  mensagens = mensagens + 1
  `,
  ).run({
    id,
    titulo: chat.title ?? "Grupo sem titulo",
    tipo: chat.type ?? "group",
    agora,
  });
}

export function listarGrupos(limite = 100) {
  return db
    .prepare("SELECT * FROM grupos ORDER BY mensagens DESC LIMIT ?")
    .all(limite);
}

export function contarGrupos() {
  return db.prepare("SELECT COUNT(*) c FROM grupos").get().c;
}

export function bloquear(userId, motivo = "") {
  db.prepare(
    `
  INSERT INTO bloqueados (id, motivo, em) VALUES (?,?,?)
  ON CONFLICT(id) DO UPDATE SET motivo = excluded.motivo, em = excluded.em
  `,
  ).run(String(userId), motivo, Date.now());
}

export function desbloquear(userId) {
  return (
    db.prepare("DELETE FROM bloqueados WHERE id = ?").run(String(userId))
      .changes > 0
  );
}

export function estaBloqueado(userId) {
  return (
    db.prepare("SELECT 1 FROM bloqueados WHERE id = ?").get(String(userId)) !==
    undefined
  );
}

export function listarBloqueados() {
  return db.prepare("SELECT * FROM bloqueados ORDER BY em DESC").all();
}

export function registrarUsoComando(comando, deuErro = false) {
  db.prepare(
    `
  INSERT INTO estatisticas (comando, usos, erros, ultimo) VALUES (?, 1, ?, ?)
  ON CONFLICT(comando) DO UPDATE SET
  usos = usos + 1,
  erros = erros + ?,
  ultimo = ?
  `,
  ).run(comando, deuErro ? 1 : 0, Date.now(), deuErro ? 1 : 0, Date.now());
}

export function topComandos(limite = 10) {
  return db
    .prepare("SELECT * FROM estatisticas ORDER BY usos DESC LIMIT ?")
    .all(limite);
}

export function registrarUsuarioNoGrupo(userId, grupoId) {
  db.prepare(
    `
    INSERT INTO usuario_grupos (user_id, grupo_id, visto_em, mensagens)
    VALUES (?,?,?,1)
    ON CONFLICT(user_id, grupo_id) DO UPDATE SET
      visto_em = excluded.visto_em,
      mensagens = mensagens + 1
  `,
  ).run(String(userId), String(grupoId), Date.now());
}

export function gruposDoUsuario(userId) {
  return db
    .prepare(
      `
    SELECT g.id, g.titulo, g.tipo, ug.mensagens, ug.visto_em
    FROM usuario_grupos ug
    JOIN grupos g ON g.id = ug.grupo_id
    WHERE ug.user_id = ?
    ORDER BY ug.visto_em DESC
  `,
    )
    .all(String(userId));
}

export function membrosDoGrupo(grupoId, limite = 50) {
  return db
    .prepare(
      `
    SELECT u.id, u.nome, u.username, u.eh_bot, ug.mensagens, ug.visto_em
    FROM usuario_grupos ug
    JOIN usuarios u ON u.id = ug.user_id
    WHERE ug.grupo_id = ?
    ORDER BY ug.mensagens DESC
    LIMIT ?
  `,
    )
    .all(String(grupoId), limite);
}

export function contarMembrosVistos(grupoId) {
  return db
    .prepare("SELECT COUNT(*) c FROM usuario_grupos WHERE grupo_id = ?")
    .get(String(grupoId)).c;
}

export function salvarMembros(grupoId, { membros, botAdmin, username }) {
  db.prepare(
    `UPDATE grupos SET membros = ?, membros_em = ?, bot_admin = ?, username = ? WHERE id = ?`,
  ).run(
    Number(membros) || 0,
    Date.now(),
    botAdmin ? 1 : 0,
    username ?? "",
    String(grupoId),
  );
}

export function totalMembros() {
  return db.prepare("SELECT COALESCE(SUM(membros), 0) s FROM grupos").get().s;
}
