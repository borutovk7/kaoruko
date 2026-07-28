import { logos } from '../../core/api.js';
export const description = 'Logo estilo shadow';
export const uso = '/shadow texto';
export const cooldown = 5;
export default async function shadow(ctx) {
  if (!ctx.q) {
    await ctx.uso(`${ctx.prefix}shadow Kaoruko`, 'Insira um texto pra eu fazer sua logo!');
    return;
  }
  const carregando = await ctx.carregando(' Criando sua logo...');
  try {
    const imagem = await logos.umTexto('/api/ephoto/metal', ctx.q);
    await carregando.apagar();
    await ctx.enviarFoto(imagem, '<b>Aqui esta sua logo!</b>', {
      reply_markup: ctx.tecladoApagar(),
    });
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
