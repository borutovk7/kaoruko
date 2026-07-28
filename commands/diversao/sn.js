import { aleatorio, escapeHtml } from '../../utils/helpers.js';
export const description = 'Responde sim ou nao';
export const aliases = ['simounao'];
export const uso = '/sn devo sair hoje?';
export const cooldown = 2;
const RESPOSTAS = [
  'Sim! ',
  'Nao. ',
  'Com certeza! ',
  'Nem pensar. ',
  'Talvez... ',
  'Obviamente sim! ',
  'Melhor nao. ',
  'Pode ir! ',
];
export default async function sn(ctx) {
  if (!ctx.q) {
    await ctx.uso(`${ctx.prefix}sn devo sair hoje?`);
    return;
  }
  await ctx.responderComApagar(
    `<b>${escapeHtml(ctx.q)}</b>\n\n${aleatorio(RESPOSTAS) ?? 'Talvez...'}`
  );
}
