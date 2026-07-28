import { ia } from '../../core/api.js';
import { extrairUrl, links } from '../../utils/helpers.js';
export const description = 'Melhora a qualidade de uma imagem';
export const aliases = ['hd', 'melhorar'];
export const uso = '/tohd <link da imagem>';
export const cooldown = 10;
export default async function cmdtohd(ctx) {
  const url = extrairUrl(ctx.q) || ctx.q.trim();
  if (!url || !links.qualquer(url)) {
    await ctx.uso(
      `${ctx.prefix}tohd https://exemplo.com/foto.jpg`,
      'Manda o link direto da imagem.'
    );
    return;
  }
  const carregando = await ctx.carregando(' Processando a imagem...');
  try {
    const resultado = await ia.melhorarHd(url);
    await carregando.apagar();
    await ctx.enviarFoto(resultado, '<b>Pronto!</b>', {
      reply_markup: ctx.tecladoApagar(),
    });
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
