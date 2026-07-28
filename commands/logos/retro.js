import { logos } from '../../core/api.js';
export const description = 'Logo estilo retro (3 textos)';
export const uso = '/retro t1/t2/t3';
export const cooldown = 5;
export default async function retro(ctx) {
  const partes = ctx.q
    .split('/')
    .map((p) => p.trim())
    .filter(Boolean);
  if (partes.length < 3) {
    await ctx.uso(
      `${ctx.prefix}retro Kaoruko/Waguri/Bot`,
      'Preciso de tres textos separados por barra (/ ).'
    );
    return;
  }
  const carregando = await ctx.carregando(' Criando sua logo...');
  try {
    const imagem = await logos.tresTextos(
      '/api/ephoto/retro',
      partes[0] ?? '',
      partes[1] ?? '',
      partes[2] ?? ''
    );
    await carregando.apagar();
    await ctx.enviarFoto(imagem, '<b>Aqui esta sua logo!</b>', {
      reply_markup: ctx.tecladoApagar(),
    });
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
