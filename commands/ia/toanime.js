import { ia } from '../../core/api.js';
import { extrairUrl, links } from '../../utils/helpers.js';
export const description = 'Transforma uma foto em estilo anime';
export const aliases = ['viraranime'];
export const uso = '/toanime <link da imagem>';
export const cooldown = 10;
export default async function cmdtoanime(ctx) {
  const url = extrairUrl(ctx.q) || ctx.q.trim();
  if (!url || !links.qualquer(url)) {
    await ctx.uso(
      `${ctx.prefix}toanime https://exemplo.com/foto.jpg`,
      'Manda o link direto da imagem.'
    );
    return;
  }
  const carregando = await ctx.carregando(' Processando a imagem...');
  try {
    const resultado = await ia.paraAnime(url);
    await carregando.apagar();
    await ctx.enviarFoto(resultado, '<b>Pronto!</b>', {
      reply_markup: ctx.tecladoApagar(),
    });
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
