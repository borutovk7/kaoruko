import { escapeHtml, inteiroAleatorio } from '../../utils/helpers.js';
export const description = 'Mede o quanto alguem e retardado';
export const uso = '/retardado @fulano';
export const cooldown = 2;
export const oculto = true;
export default async function retardado(ctx) {
  const respondida = ctx.respondida;
  const alvo =
    respondida && 'from' in respondida && respondida.from
      ? [respondida.from.first_name, respondida.from.last_name].filter(Boolean).join(' ')
      : ctx.q || ctx.nome;
  const porcento = inteiroAleatorio(101);
  const decimal = String(inteiroAleatorio(100)).padStart(2, '0');
  const barra = '█'.repeat(Math.round(porcento / 10)).padEnd(10, '░');
  await ctx.responderComApagar(
    `<b>MEDIDOR DE RETARDADO</b>\n\n` +
      `<b>Alvo:</b> ${escapeHtml(alvo)}\n\n` +
      `<code>${barra}</code> <b>${porcento},${decimal}%</b>`
  );
}
