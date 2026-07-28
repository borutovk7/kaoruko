import { ia } from '../../core/api.js';
import { cortar, escapeHtml } from '../../utils/helpers.js';
export const description = 'Gera uma imagem por IA';
export const aliases = ['iaimg', 'gerarimagem'];
export const uso = '/imagine um gato astronauta no espaco';
export const cooldown = 15;
export default async function cmdimagine(ctx) {
  if (!ctx.q) {
    await ctx.uso(`${ctx.prefix}imagine um gato astronauta`, 'Descreva a imagem que voce quer.');
    return;
  }
  const carregando = await ctx.carregando(' Desenhando...');
  try {
    const url = await ia.imagem(ctx.q);
    await carregando.apagar();
    await ctx.enviarFoto(url, `<b>Imagem gerada</b>\n<i>${escapeHtml(cortar(ctx.q, 300))}</i>`, {
      reply_markup: ctx.tecladoApagar(),
    });
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
