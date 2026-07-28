import { pesquisa, acharCampo } from '../../core/api.js';
import { ehUrlHttp, escapeHtml } from '../../utils/helpers.js';
export const description = 'Gera nicks estilizados';
export const aliases = ['nick'];
export const uso = '/gerarnick Kaoruko';
export const cooldown = 5;
export default async function cmdgerarnick(ctx) {
  if (!ctx.q) {
    await ctx.uso('/gerarnick Kaoruko', 'Digite o que voce quer buscar.');
    return;
  }
  const carregando = await ctx.carregando(' Buscando...');
  try {
    const bruto = await pesquisa.nick(ctx.q);
    await carregando.apagar();
    const lista = Array.isArray(bruto) ? bruto : [bruto];
    if (lista.length === 0) {
      await ctx.erro('Nao achei nada com isso.');
      return;
    }
    const linhas = ['<b>GERA NICKS ESTILIZADOS</b>', ''];
    for (const [_i, item] of lista.slice(0, 8).entries()) {
      if (typeof item === 'string') {
        linhas.push(`<code>${escapeHtml(item)}</code>`);
        continue;
      }
      const nicks = item;
      for (const v of Object.values(nicks)) {
        if (typeof v === 'string') linhas.push(`<code>${escapeHtml(v)}</code>`);
      }
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
