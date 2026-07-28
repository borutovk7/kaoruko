import { logos } from '../../core/api.js';
export const description = 'Logo estilo graffitiwall (2 textos)';
export const uso = '/graffitiwall texto1/texto2';
export const cooldown = 5;
export default async function graffitiwall(ctx) {
  const partes = ctx.q
    .split('/')
    .map((p) => p.trim())
    .filter(Boolean);
  if (partes.length < 2) {
    await ctx.uso(
      `${ctx.prefix}graffitiwall Kaoruko/Waguri`,
      'Preciso de dois textos separados por barra (/ ).'
    );
    return;
  }
  const carregando = await ctx.carregando(' Criando sua logo...');
  try {
    const imagem = await logos.doisTextos(
      '/api/ephoto/graffitiwall',
      partes[0] ?? '',
      partes[1] ?? ''
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
