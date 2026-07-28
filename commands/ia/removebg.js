import { ia } from '../../core/api.js';
import { extrairUrl, links } from '../../utils/helpers.js';
export const description = 'Remove o fundo de uma imagem';
export const aliases = ['rembg', 'tirarfundo'];
export const uso = '/removebg <link da imagem>';
export const cooldown = 10;
export default async function cmdremovebg(ctx) {
  const url = extrairUrl(ctx.q) || ctx.q.trim();
  if (!url || !links.qualquer(url)) {
    await ctx.uso(
      `${ctx.prefix}removebg https://exemplo.com/foto.jpg`,
      'Manda o link direto da imagem.'
    );
    return;
  }
  const carregando = await ctx.carregando(' Processando a imagem...');
  try {
    const resultado = await ia.removerFundo(url);
    await carregando.apagar();
    await ctx.enviarFoto(resultado, '<b>Pronto!</b>', {
      reply_markup: ctx.tecladoApagar(),
    });
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
