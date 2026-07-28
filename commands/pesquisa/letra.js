import { pesquisa, acharCampo } from '../../core/api.js';
import { cortar, ehUrlHttp, escapeHtml } from '../../utils/helpers.js';
export const description = 'Busca a letra de uma musica';
export const aliases = ['letras', 'lyrics'];
export const uso = '/letra evidencias';
export const cooldown = 5;
export default async function cmdletra(ctx) {
  if (!ctx.q) {
    await ctx.uso('/letra evidencias', 'Digite o que voce quer buscar.');
    return;
  }
  const carregando = await ctx.carregando(' Buscando...');
  try {
    const bruto = await pesquisa.letra(ctx.q);
    await carregando.apagar();
    const lista = Array.isArray(bruto) ? bruto : [bruto];
    if (lista.length === 0) {
      await ctx.erro('Nao achei nada com isso.');
      return;
    }
    const linhas = ['<b>BUSCA A LETRA DE UMA MUSICA</b>', ''];
    for (const [_i, item] of lista.slice(0, 8).entries()) {
      const t = acharCampo(item, ['title', 'titulo', 'musica']);
      const artista = acharCampo(item, ['artist', 'artista', 'author']);
      const letra = acharCampo(item, ['lyrics', 'letra', 'text']);
      if (t) linhas.push(`<b>${escapeHtml(String(t))}</b>`);
      if (artista) linhas.push(`<i>${escapeHtml(String(artista))}</i>`);
      if (letra) linhas.push('', escapeHtml(cortar(String(letra), 3000)));
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
