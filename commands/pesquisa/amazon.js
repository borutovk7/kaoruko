import { pesquisa, acharCampo, acharUrl } from '../../core/api.js';
import { cortar, ehUrlHttp, escapeHtml } from '../../utils/helpers.js';
export const description = 'Pesquisa produtos na Amazon';
export const uso = '/amazon fone bluetooth';
export const cooldown = 5;
export default async function cmdamazon(ctx) {
  if (!ctx.q) {
    await ctx.uso('/amazon fone bluetooth', 'Digite o que voce quer buscar.');
    return;
  }
  const carregando = await ctx.carregando(' Buscando...');
  try {
    const bruto = await pesquisa.amazon(ctx.q);
    await carregando.apagar();
    const lista = Array.isArray(bruto) ? bruto : [bruto];
    if (lista.length === 0) {
      await ctx.erro('Nao achei nada com isso.');
      return;
    }
    const linhas = ['<b>PESQUISA PRODUTOS NA AMAZON</b>', ''];
    for (const [i, item] of lista.slice(0, 8).entries()) {
      const titulo = acharCampo(item, ['title', 'titulo', 'name', 'nome']);
      const desc2 = acharCampo(item, ['description', 'descricao', 'texto', 'snippet', 'sinopse']);
      const link = acharUrl(item);
      const preco = acharCampo(item, ['preco', 'price', 'valor']);
      if (titulo) linhas.push(`<b>${i + 1}. ${escapeHtml(cortar(String(titulo), 90))}</b>`);
      if (preco) linhas.push(`${escapeHtml(String(preco))}`);
      if (desc2) linhas.push(`${escapeHtml(cortar(String(desc2), 160))}`);
      if (link) linhas.push(`${escapeHtml(String(link))}`);
      linhas.push('');
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
