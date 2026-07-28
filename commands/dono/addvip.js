import ms from 'ms';
import botConfig from '../../config/index.js';
import { adicionarVip, PLANOS, ORDEM_PLANOS } from '../../core/vip.js';
import { escapeHtml } from '../../utils/helpers.js';

export const description = 'Da VIP pra um usuario';
export const aliases = ['addprem', 'addpremium', 'setvip'];
export const uso = '/addvip (respondendo) ouro 30d';
export const soDono = true;

function alvoDoComando(ctx) {
  const r = ctx.respondida;
  if (r && r.from) return { id: String(r.from.id), nome: r.from.first_name ?? 'Usuario' };
  const arg = (ctx.args.find((a) => /^\d+$/.test(a) && !/^\d+[smhdwy]$/.test(a)) ?? '').trim();
  if (arg) return { id: arg, nome: `ID ${arg}` };
  return null;
}

export default async function addvip(ctx) {
  const alvo = alvoDoComando(ctx);

  if (!alvo) {
    await ctx.uso(
      `${ctx.prefix}addvip 123456789 ouro 30d`,
      `Responda a mensagem ou passe o ID.\n\nPlanos: ${ORDEM_PLANOS.join(', ')}\nTempo: 1d, 7d, 30d ou "vitalicio"`
    );
    return;
  }

  const termos = ctx.args.map((a) => a.toLowerCase());
  const plano = ORDEM_PLANOS.find((p) => termos.includes(p)) ?? 'bronze';
  const tempoTexto = termos.find((t) => /^\d+[smhdwy]$/.test(t)) ?? null;
  const vitalicio = termos.some((t) => ['vitalicio', 'ilimitado', 'perm', 'unlimited'].includes(t));

  const info = PLANOS[plano];

  if (vitalicio) {
    adicionarVip(alvo.id, { plano, duracaoMs: null, por: ctx.userId });
    await ctx.responderComApagar(
      `<b>${escapeHtml(alvo.nome)}</b> agora e VIP <b>${info.nome} vitalicio</b>!\n\n` +
        info.beneficios.map((b) => `• ${b}`).join('\n')
    );
    return;
  }

  let duracao = 0;
  try {
    const v = ms(tempoTexto ?? '30d');
    if (typeof v === 'number' && Number.isFinite(v)) duracao = v;
  } catch {
    duracao = 0;
  }

  if (duracao <= 0) {
    await ctx.erro('Tempo invalido. Use algo como: 1d, 7d, 30d ou "vitalicio".');
    return;
  }

  const registro = adicionarVip(alvo.id, { plano, duracaoMs: duracao, por: ctx.userId });
  const expira = new Date(registro.expira_em).toLocaleString('pt-BR', {
    timeZone: botConfig.timezone,
  });

  await ctx.responderComApagar(
    `<b>${escapeHtml(alvo.nome)}</b> virou VIP <b>${info.nome}</b>!\n\n` +
      `<b>Expira em:</b> ${expira}\n\n` +
      info.beneficios.map((b) => `• ${b}`).join('\n')
  );
}
