import { pesquisa, acharUrl } from '../../core/api.js';
import { cortar, escapeHtml, aleatorio } from '../../utils/helpers.js';
export const description = 'Procura imagens no Google';
export const aliases = ['gimage'];
export const uso = '/googleimg gato fofo';
export const cooldown = 5;
export default async function googleimg(ctx) {
  if (!ctx.q) {
    await ctx.uso(`${ctx.prefix}googleimg gato fofo`, 'Digite o que buscar.');
    return;
  }
  const carregando = await ctx.carregando(' Procurando...');
  try {
    const bruto = await pesquisa.googleImagem(ctx.q);
    await carregando.apagar();
    const lista = Array.isArray(bruto) ? bruto : [bruto];
    const urls = [];
    for (const item of lista) {
      const url = typeof item === 'string' ? item : acharUrl(item);
      if (url) urls.push(url);
    }
    const escolhida = aleatorio(urls);
    if (!escolhida) {
      await ctx.erro('Nao achei imagens com esse termo.');
      return;
    }
    await ctx.enviarFoto(escolhida, `${escapeHtml(cortar(ctx.q, 100))}`, {
      reply_markup: ctx.tecladoApagar(),
    });
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
