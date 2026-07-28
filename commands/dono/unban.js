import { desbloquear } from '../../core/storage.js';
import { escapeHtml } from '../../utils/helpers.js';
export const description = 'Desbloqueia um usuario';
export const aliases = ['desbloquear'];
export const uso = '/unban (respondendo)';
export const soDono = true;
export default async function unban(ctx) {
  const respondida = ctx.respondida;
  const alvo =
    respondida && 'from' in respondida && respondida.from
      ? { id: String(respondida.from.id), nome: respondida.from.first_name }
      : /^\d+$/.test(ctx.args[0] ?? '')
        ? { id: ctx.args[0] ?? '', nome: `ID ${ctx.args[0]}` }
        : null;
  if (!alvo) {
    await ctx.uso(`${ctx.prefix}unban 123456789`);
    return;
  }
  desbloquear(alvo.id);
  await ctx.responderComApagar(` <b>${escapeHtml(alvo.nome)}</b> foi desbloqueado.`);
}
