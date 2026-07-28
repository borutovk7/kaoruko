import { pesquisa, acharCampo } from '../../core/api.js';
import { ehUrlHttp, escapeHtml } from '../../utils/helpers.js';
export const description = 'Tabela do Brasileirao';
export const aliases = ['brasileiro'];
export const uso = '/brasileirao';
export const cooldown = 5;
export default async function cmdbrasileirao(ctx) {
  const carregando = await ctx.carregando(' Buscando...');
  try {
    const bruto = await pesquisa.brasileirao();
    await carregando.apagar();
    const lista = Array.isArray(bruto) ? bruto : [bruto];
    if (lista.length === 0) {
      await ctx.erro('Nao achei nada com isso.');
      return;
    }
    const linhas = ['<b>TABELA DO BRASILEIRAO</b>', ''];
    for (const [i, item] of lista.slice(0, 8).entries()) {
      const time = acharCampo(item, ['time', 'nome', 'name', 'team']);
      const pontos = acharCampo(item, ['pontos', 'points', 'pts']);
      const pos = acharCampo(item, ['posicao', 'position', 'pos']);
      if (time)
        linhas.push(
          `${pos ?? i + 1}. <b>${escapeHtml(String(time))}</b>${pontos !== undefined ? ` — ${pontos} pts` : ''}`
        );
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
