import { escapeHtml, inteiroAleatorio } from '../../utils/helpers.js';
export const description = 'Calcula a chance de alguma coisa acontecer';
export const uso = '/chance de eu ficar rico';
export const cooldown = 2;
export default async function chance(ctx) {
  if (!ctx.q) {
    await ctx.uso(`${ctx.prefix}chance de eu ficar rico`);
    return;
  }
  const porcento = inteiroAleatorio(101);
  const decimal = String(inteiroAleatorio(100)).padStart(2, '0');
  await ctx.responderComApagar(
    `<b>CHANCE</b>\n\n<i>${escapeHtml(ctx.q)}</i>\n\n<b>Resultado:</b> ${porcento},${decimal}%`
  );
}
