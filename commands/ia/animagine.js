import { ia } from '../../core/api.js';
import { cortar, escapeHtml } from '../../utils/helpers.js';
export const description = 'Gera imagem estilo anime por IA';
export const aliases = ['animeia'];
export const uso = '/animagine um gato astronauta no espaco';
export const cooldown = 15;
export default async function cmdanimagine(ctx) {
  if (!ctx.q) {
    await ctx.uso(`${ctx.prefix}animagine um gato astronauta`, 'Descreva a imagem que voce quer.');
    return;
  }
  const carregando = await ctx.carregando(' Desenhando...');
  try {
    const url = await ia.animagine(ctx.q);
    await carregando.apagar();
    await ctx.enviarFoto(url, `<b>Imagem gerada</b>\n<i>${escapeHtml(cortar(ctx.q, 300))}</i>`, {
      reply_markup: ctx.tecladoApagar(),
    });
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
