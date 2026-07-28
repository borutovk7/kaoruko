import { pesquisa, acharCampo } from '../../core/api.js';
import { cortar, ehUrlHttp, escapeHtml } from '../../utils/helpers.js';
export const description = 'Horoscopo do dia';
export const aliases = ['signo'];
export const uso = '/horoscopo aries';
export const cooldown = 5;
export default async function cmdhoroscopo(ctx) {
  if (!ctx.q) {
    await ctx.uso('/horoscopo aries', 'Digite o que voce quer buscar.');
    return;
  }
  const carregando = await ctx.carregando(' Buscando...');
  try {
    const bruto = await pesquisa.horoscopo(ctx.q);
    await carregando.apagar();
    const lista = Array.isArray(bruto) ? bruto : [bruto];
    if (lista.length === 0) {
      await ctx.erro('Nao achei nada com isso.');
      return;
    }
    const linhas = ['<b>HOROSCOPO DO DIA</b>', ''];
    for (const [_i, item] of lista.slice(0, 8).entries()) {
      const texto = acharCampo(item, ['horoscopo', 'previsao', 'texto', 'description', 'mensagem']);
      if (texto) linhas.push(escapeHtml(cortar(String(texto), 2500)));
    }
    const campoImagem = acharCampo(lista[0], [
      'image',
      'thumbnail',
      'imagem',
      'foto',
      'capa',
      'icon',
    ]);
    const imagem = ehUrlHttp(campoImagem) ? campoImagem : undefined;
    if (imagem && lista.length === 1) {
      await ctx.enviarFoto(imagem, linhas.join('\n'), { reply_markup: ctx.tecladoApagar() });
      return;
    }
    await ctx.responderComApagar(linhas.join('\n'));
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
