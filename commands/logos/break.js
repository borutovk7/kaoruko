import { logos } from '../../core/api.js';
export const description = 'Logo estilo break';
export const uso = '/break texto';
export const cooldown = 5;
export default async function cmd_break(ctx) {
  if (!ctx.q) {
    await ctx.uso(`${ctx.prefix}break Kaoruko`, 'Insira um texto pra eu fazer sua logo!');
    return;
  }
  const carregando = await ctx.carregando(' Criando sua logo...');
  try {
    const imagem = await logos.umTexto('/api/ephoto/3dcrack', ctx.q);
    await carregando.apagar();
    await ctx.enviarFoto(imagem, '<b>Aqui esta sua logo!</b>', {
      reply_markup: ctx.tecladoApagar(),
    });
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
