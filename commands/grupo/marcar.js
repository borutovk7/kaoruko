import { escapeHtml } from '../../utils/helpers.js';
export const description = 'Marca os administradores do grupo';
export const aliases = ['todos', 'admins'];
export const uso = '/marcar aviso importante';
export const soGrupo = true;
export const soAdmin = true;
export const cooldown = 30;
export default async function marcar(ctx) {
  try {
    const admins = await ctx.waguri.telegram.getChatAdministrators(ctx.chatId);
    const mencoes = admins
      .filter((a) => !a.user.is_bot)
      .map((a) => `<a href="tg://user?id=${a.user.id}">${escapeHtml(a.user.first_name)}</a>`)
      .join(' · ');
    await ctx.responder(`<b>ATENCAO</b>\n\n${ctx.q ? `${escapeHtml(ctx.q)}\n\n` : ''}${mencoes}`);
  } catch {
    await ctx.erro('Nao consegui listar os admins desse grupo.');
  }
}
