import { inteiroAleatorio } from '../../utils/helpers.js';
export const description = 'Rola um dado';
export const aliases = ['rolar', 'dice'];
export const uso = '/dado 20';
export const cooldown = 2;
export default async function dado(ctx) {
  const lados = Math.min(Math.max(Number.parseInt(ctx.q, 10) || 6, 2), 1000);
  const valor = inteiroAleatorio(lados) + 1;
  await ctx.responderComApagar(
    ` Rolei um dado de <b>${lados}</b> lados...\n\nDeu <b>${valor}</b>!`
  );
}
