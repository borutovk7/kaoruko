import { logos } from '../../core/api.js';
export const description = 'Logo estilo mascoteavatar (2 textos)';
export const uso = '/mascoteavatar texto1/texto2';
export const cooldown = 5;
export default async function mascoteavatar(ctx) {
  const partes = ctx.q
    .split('/')
    .map((p) => p.trim())
    .filter(Boolean);
  if (partes.length < 2) {
    await ctx.uso(
      `${ctx.prefix}mascoteavatar Kaoruko/Waguri`,
      'Preciso de dois textos separados por barra (/ ).'
    );
    return;
  }
  const carregando = await ctx.carregando(' Criando sua logo...');
  try {
    const imagem = await logos.doisTextos('/api/mascoteavatar', partes[0] ?? '', partes[1] ?? '');
    await carregando.apagar();
    await ctx.enviarFoto(imagem, '<b>Aqui esta sua logo!</b>', {
      reply_markup: ctx.tecladoApagar(),
    });
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
