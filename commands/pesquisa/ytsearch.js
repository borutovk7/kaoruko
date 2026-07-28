import { pesquisa, acharCampo } from '../../core/api.js';
import { cortar, ehUrlHttp, escapeHtml, numeroCurto } from '../../utils/helpers.js';
export const description = 'Pesquisa videos no YouTube';
export const aliases = ['ytbusca'];
export const uso = '/ytsearch lofi hip hop';
export const cooldown = 5;
export default async function cmdytsearch(ctx) {
  if (!ctx.q) {
    await ctx.uso('/ytsearch lofi hip hop', 'Digite o que voce quer buscar.');
    return;
  }
  const carregando = await ctx.carregando(' Buscando...');
  try {
    const bruto = await pesquisa.youtube(ctx.q);
    await carregando.apagar();
    const lista = Array.isArray(bruto) ? bruto : [bruto];
    if (lista.length === 0) {
      await ctx.erro('Nao achei nada com isso.');
      return;
    }
    const linhas = ['<b>PESQUISA VIDEOS NO YOUTUBE</b>', ''];
    for (const [i, item] of lista.slice(0, 8).entries()) {
      const v = item;
      linhas.push(`<b>${i + 1}. ${escapeHtml(cortar(v.titulo, 80))}</b>`);
      linhas.push(
        `${escapeHtml(v.canal)}${v.duracao ? ` · ${escapeHtml(v.duracao)}` : ''}${v.views !== undefined ? ` · ${numeroCurto(v.views)}` : ''}`
      );
      linhas.push(`${escapeHtml(v.url)}`);
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
