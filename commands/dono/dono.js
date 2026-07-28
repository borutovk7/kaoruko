import os from "node:os";
import botConfig from "../../config/index.js";
import {
  obterUsuario,
  contarUsuarios,
  contarGrupos,
  topComandos,
} from "../../core/storage.js";
import { planoDe, usoDe, estatisticasVip } from "../../core/vip.js";
import { contaPorEmail, listarContas } from "../../core/auth.js";
import { resumoGeral } from "../../core/painel-dados.js";
import {
  escapeHtml,
  tempoLegivel,
  tamanhoLegivel,
  numeroCurto,
} from "../../utils/helpers.js";

export const description = "Mostra as informacoes do dono do bot";
export const aliases = ["owner", "criador", "meudono"];
export const uso = "/dono";
export const soDono = true;
export const cooldown = 5;

const IDIOMAS = {
  pt: "Portugues",
  "pt-br": "Portugues (BR)",
  en: "Ingles",
  es: "Espanhol",
  ru: "Russo",
  ar: "Arabe",
  hi: "Hindi",
  id: "Indonesio",
  fr: "Frances",
  de: "Alemao",
  it: "Italiano",
  ja: "Japones",
  ko: "Coreano",
  zh: "Chines",
};

export default async function dono(ctx) {
  const registro = obterUsuario(ctx.userId);
  const plano = planoDe(ctx.userId);
  const uso = usoDe(ctx.userId);
  const resumo = resumoGeral();
  const vips = estatisticasVip();

  const conta =
    listarContas().find((c) => String(c.telegram_id) === String(ctx.userId)) ??
    null;
  const contaEnv = botConfig.painel.adminEmail
    ? contaPorEmail(botConfig.painel.adminEmail)
    : null;

  const dataBr = (v) =>
    v
      ? new Date(v).toLocaleString("pt-BR", { timeZone: botConfig.timezone })
      : "nunca";

  const idioma = registro?.idioma
    ? (IDIOMAS[registro.idioma.toLowerCase()] ?? registro.idioma)
    : "nao informado";

  const linhas = [
    `<b>PERFIL DO DONO</b>`,
    "",
    `<b>Nome:</b> ${escapeHtml(ctx.nome)}`,
    ctx.username ? `<b>Usuario:</b> @${escapeHtml(ctx.username)}` : null,
    `<b>ID:</b> <code>${escapeHtml(ctx.userId)}</code>`,
    `<b>Idioma:</b> ${escapeHtml(idioma)}`,
    registro?.tg_premium ? `<b>Telegram Premium:</b> sim` : null,
    "",
    `<b>Plano:</b> ${escapeHtml(plano.nome)}`,
    `<b>Limite diario:</b> ${uso.limite === Infinity ? "ilimitado" : uso.limite}`,
    `<b>Usou hoje:</b> ${uso.usados} comando(s)`,
    `<b>Comandos no total:</b> ${numeroCurto(registro?.comandos ?? 0)}`,
    `<b>Primeiro uso:</b> ${dataBr(registro?.primeiro_uso)}`,
    "",
    "<b>ACESSO AO PAINEL</b>",
    "",
  ];

  if (conta) {
    linhas.push(
      `<b>E-mail:</b> <code>${escapeHtml(conta.email)}</code>`,
      `<b>Papel:</b> ${escapeHtml(conta.papel)}`,
      `<b>Vinculo:</b> ligado a este ID`,
      `<b>Ultimo login:</b> ${dataBr(conta.ultimo_login)}`,
    );
  } else if (contaEnv) {
    linhas.push(
      `<b>E-mail:</b> <code>${escapeHtml(contaEnv.email)}</code>`,
      `<b>Papel:</b> ${escapeHtml(contaEnv.papel)}`,
      `<b>Vinculo:</b> nao esta ligado a este ID`,
      "",
      `Use <code>${ctx.prefix}conta vincular ${escapeHtml(contaEnv.email)} ${escapeHtml(ctx.userId)}</code>`,
    );
  } else {
    linhas.push(
      "Nenhuma conta do painel ligada a voce.",
      `Crie com <code>${ctx.prefix}conta criar seu@email.com suaSenha ${escapeHtml(ctx.userId)}</code>`,
    );
  }

  linhas.push(
    "",
    `<b>Painel:</b> ${escapeHtml(botConfig.painel.urlPublica || `http://localhost:${botConfig.painel.port}`)}`,
    "",
    "<b>NUMEROS DO BOT</b>",
    "",
    `<b>Usuarios:</b> ${resumo.usuarios.total} (${resumo.usuarios.ativosHoje} ativos hoje)`,
    `<b>Grupos:</b> ${resumo.grupos.total}`,
    `<b>VIPs:</b> ${vips.total}`,
    `<b>Donos cadastrados:</b> ${botConfig.owners.length}`,
    `<b>Comandos executados:</b> ${numeroCurto(resumo.comandos.execucoes)}`,
    "",
    "<b>SERVIDOR</b>",
    "",
    `<b>Online ha:</b> ${tempoLegivel(process.uptime())}`,
    `<b>RAM:</b> ${tamanhoLegivel(os.totalmem() - os.freemem())} / ${tamanhoLegivel(os.totalmem())}`,
    `<b>Node:</b> ${process.version}`,
  );

  const mais = topComandos(3);
  if (mais.length > 0) {
    linhas.push(
      "",
      `<b>Mais usado:</b> ${mais.map((c) => `${ctx.prefix}${escapeHtml(c.comando)} (${c.usos})`).join(", ")}`,
    );
  }

  await ctx.sendTextWithMedia(
    botConfig.assets.menuImage,
    linhas.filter((l) => l !== null).join("\n"),
  );
}
