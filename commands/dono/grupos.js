import { listarGrupos } from '../../core/storage.js';
import { cortar, escapeHtml } from '../../utils/helpers.js';
export const description = 'Lista os grupos onde o bot esta';
export const aliases = ['listargrupos'];
export const uso = '/grupos';
export const soDono = true;
export default async function grupos(ctx) {
  const lista = listarGrupos(50);
  if (lista.length === 0) {
    await ctx.responderComApagar(' Nenhum grupo registrado.');
    return;
  }
  const linhas = [`<b>GRUPOS (${lista.length})</b>`, ''];
  lista
    .sort((a, b) => b.mensagens - a.mensagens)
    .slice(0, 50)
    .forEach((g, i) => {
      linhas.push(
        `${i + 1}. <b>${escapeHtml(cortar(g.titulo, 40))}</b>\n<code>${g.id}</code> · ${g.mensagens} msgs`
      );
    });
  await ctx.responderComApagar(linhas.join('\n'));
}
