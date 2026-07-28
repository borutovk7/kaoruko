import botConfig from '../../config/index.js';
import { bloquear } from '../../core/storage.js';
import { escapeHtml } from '../../utils/helpers.js';
export const description = 'Bloqueia um usuario de usar o bot';
export const aliases = ['bloquear'];
export const uso = '/ban (respondendo)';
export const soDono = true;
export default async function ban(ctx) {
  const respondida = ctx.respondida;
  const alvo =
    respondida && 'from' in respondida && respondida.from
      ? { id: String(respondida.from.id), nome: respondida.from.first_name }
      : /^\d+$/.test(ctx.args[0] ?? '')
        ? { id: ctx.args[0] ?? '', nome: `ID ${ctx.args[0]}` }
        : null;
  if (!alvo) {
    await ctx.uso(`${ctx.prefix}ban 123456789`);
    return;
  }
  if (botConfig.ehDono(alvo.id)) {
    await ctx.erro('Nao da pra banir um dono.');
    return;
  }
  bloquear(alvo.id, ctx.args.slice(1).join(' '));
  await ctx.responderComApagar(` <b>${escapeHtml(alvo.nome)}</b> foi bloqueado.`);
}
