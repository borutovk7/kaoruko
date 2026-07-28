import { pesquisa, acharCampo } from '../../core/api.js';
import { cortar, ehUrlHttp, escapeHtml, numeroCurto } from '../../utils/helpers.js';
export const description = 'Informacoes de um perfil do Instagram';
export const aliases = ['instastalk'];
export const uso = '/igstalk instagram';
export const cooldown = 5;
export default async function cmdigstalk(ctx) {
  if (!ctx.q) {
    await ctx.uso('/igstalk instagram', 'Digite o que voce quer buscar.');
    return;
  }
  const carregando = await ctx.carregando(' Buscando...');
  try {
    const bruto = await pesquisa.instagramUser(ctx.q);
    await carregando.apagar();
    const lista = Array.isArray(bruto) ? bruto : [bruto];
    if (lista.length === 0) {
      await ctx.erro('Nao achei nada com isso.');
      return;
    }
    const linhas = ['<b>INFORMACOES DE UM PERFIL DO INSTAGRAM</b>', ''];
    for (const [_i, item] of lista.slice(0, 8).entries()) {
      const u = acharCampo(item, ['username', 'login', 'nome']);
      const nomeCompleto = acharCampo(item, ['full_name', 'fullName', 'name']);
      const bio = acharCampo(item, ['biography', 'bio']);
      const seg = acharCampo(item, ['followers', 'seguidores', 'follower_count']);
      const seguindo = acharCampo(item, ['following', 'seguindo', 'following_count']);
      const posts = acharCampo(item, ['posts', 'media_count', 'publicacoes']);
      if (u) linhas.push(`<b>@${escapeHtml(String(u))}</b>`);
      if (nomeCompleto) linhas.push(escapeHtml(String(nomeCompleto)));
      if (bio) linhas.push(`<i>${escapeHtml(cortar(String(bio), 250))}</i>`);
      if (seg !== undefined) linhas.push(` Seguidores: ${numeroCurto(seg)}`);
      if (seguindo !== undefined) linhas.push(` Seguindo: ${numeroCurto(seguindo)}`);
      if (posts !== undefined) linhas.push(` Posts: ${numeroCurto(posts)}`);
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
