import { pesquisa, acharCampo } from '../../core/api.js';
import { cortar, ehUrlHttp, escapeHtml, numeroCurto } from '../../utils/helpers.js';
export const description = 'Informacoes de um usuario do GitHub';
export const aliases = ['gh'];
export const uso = '/github torvalds';
export const cooldown = 5;
export default async function cmdgithub(ctx) {
  if (!ctx.q) {
    await ctx.uso('/github torvalds', 'Digite o que voce quer buscar.');
    return;
  }
  const carregando = await ctx.carregando(' Buscando...');
  try {
    const bruto = await pesquisa.github(ctx.q);
    await carregando.apagar();
    const lista = Array.isArray(bruto) ? bruto : [bruto];
    if (lista.length === 0) {
      await ctx.erro('Nao achei nada com isso.');
      return;
    }
    const linhas = ['<b>INFORMACOES DE UM USUARIO DO GITHUB</b>', ''];
    for (const [_i, item] of lista.slice(0, 8).entries()) {
      const login = acharCampo(item, ['login', 'username', 'nome', 'name']);
      const bio = acharCampo(item, ['bio', 'description']);
      const repos = acharCampo(item, ['public_repos', 'repos']);
      const seguidores = acharCampo(item, ['followers', 'seguidores']);
      if (login) linhas.push(`<b>${escapeHtml(String(login))}</b>`);
      if (bio) linhas.push(`<i>${escapeHtml(cortar(String(bio), 200))}</i>`);
      if (repos !== undefined) linhas.push(` Repos: ${numeroCurto(repos)}`);
      if (seguidores !== undefined) linhas.push(` Seguidores: ${numeroCurto(seguidores)}`);
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
