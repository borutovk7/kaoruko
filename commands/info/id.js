import { escapeHtml } from '../../utils/helpers.js';
export const description = '🆔 Mostra seu ID e o ID do chat';
export const uso = '/id';
export const cooldown = 3;
export default async function id(ctx) {
  const respondida = ctx.respondida;
  const linhas = [
    '<b>🆔 IDENTIFICADORES</b>',
    '',
    `<b>Voce:</b> ${escapeHtml(ctx.nome)}`,
    `<b>Seu ID:</b> <code>${ctx.userId}</code>`,
    `<b>ID do chat:</b> <code>${ctx.chatId}</code>`,
    `<b>Tipo:</b> ${ctx.isGroup ? 'grupo' : 'privado'}`,
  ];
  if (respondida && 'from' in respondida && respondida.from) {
    linhas.push(
      '',
      `<b>Respondido:</b> ${escapeHtml(respondida.from.first_name)}`,
      `<b>ID dele(a):</b> <code>${respondida.from.id}</code>`
    );
  }
  await ctx.responderComApagar(linhas.join('\n'));
}
