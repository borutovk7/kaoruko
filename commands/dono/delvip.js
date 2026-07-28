import { removerVip, obterVip, PLANOS } from '../../core/vip.js';
import { escapeHtml } from '../../utils/helpers.js';

export const description = 'Remove o VIP de um usuario';
export const aliases = ['removeprem', 'delprem', 'rmvip'];
export const uso = '/delvip (respondendo)';
export const soDono = true;

export default async function delvip(ctx) {
  const r = ctx.respondida;
  const alvo =
    r && r.from
      ? { id: String(r.from.id), nome: r.from.first_name ?? 'Usuario' }
      : /^\d+$/.test(ctx.args[0] ?? '')
        ? { id: ctx.args[0], nome: `ID ${ctx.args[0]}` }
        : null;

  if (!alvo) {
    await ctx.uso(`${ctx.prefix}delvip 123456789`);
    return;
  }

  const atual = obterVip(alvo.id);
  if (!atual) {
    await ctx.erro('Esse usuario nao e VIP.');
    return;
  }

  const info = PLANOS[atual.plano] ?? PLANOS.bronze;
  removerVip(alvo.id, ctx.userId);

  await ctx.responderComApagar(
    ` VIP <b>${info.nome}</b> de <b>${escapeHtml(alvo.nome)}</b> foi removido.`
  );
}
