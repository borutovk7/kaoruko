import { aleatorio, escapeHtml } from '../../utils/helpers.js';
export const description = 'Escolhe uma opcao entre varias';
export const aliases = ['escolha', 'sorteio'];
export const uso = '/escolher pizza / hamburguer / sushi';
export const cooldown = 2;
export default async function escolher(ctx) {
  const opcoes = ctx.q.split(/\s*(?:\/|,|\sou\s)\s*/i).filter(Boolean);
  if (opcoes.length < 2) {
    await ctx.uso(
      `${ctx.prefix}escolher pizza / hamburguer / sushi`,
      'Separe as opcoes com barra ou virgula.'
    );
    return;
  }
  const escolhida = aleatorio(opcoes) ?? opcoes[0] ?? '';
  await ctx.responderComApagar(`<b>Eu escolho:</b>\n\n<b>${escapeHtml(escolhida.trim())}</b>`);
}
