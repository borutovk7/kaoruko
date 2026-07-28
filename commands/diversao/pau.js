import { escapeHtml, inteiroAleatorio } from '../../utils/helpers.js';
export const description = 'Mede o tamanho (zoeira)';
export const uso = '/pau';
export const cooldown = 2;
export default async function pau(ctx) {
  const tamanho = inteiroAleatorio(36);
  let comentario;
  if (tamanho < 13) comentario = 'so a fimose ';
  else if (tamanho <= 14) comentario = 'passou da media ';
  else if (tamanho <= 16) comentario = 'eita, vai pegar manga?';
  else if (tamanho <= 19) comentario = 'calma man, a mina nao e um poco ';
  else if (tamanho <= 24) comentario = 'voce tem um poste no meio das pernas';
  else comentario = 'vai procurar petroleo com isso?';
  const alvo = ctx.q || ctx.nome;
  await ctx.responderComApagar(
    `<b>MEDIDOR</b>\n\n<b>Alvo:</b> ${escapeHtml(alvo)}\n\n` +
      `<b>Tamanho:</b> ${tamanho}cm\n<i>${comentario}</i>`
  );
}
