import { getCommand } from '../registry.js';
import { sugerir } from '../../core/router.js';
import { escapeHtml } from '../../utils/helpers.js';
export const description = 'Explica como usar um comando';
export const aliases = ['comando'];
export const uso = '/ajudacmd play';
export const cooldown = 3;
export default async function ajudacmd(ctx) {
  if (!ctx.q) {
    await ctx.uso(`${ctx.prefix}ajudacmd play`, 'Diga qual comando voce quer entender.');
    return;
  }
  const nome = ctx.q.trim().toLowerCase().replace(/^[/#]/, '');
  const cmd = getCommand(nome);
  if (!cmd) {
    const sugestao = sugerir(nome);
    await ctx.erro(
      `Nao existe o comando <code>${escapeHtml(nome)}</code>.` +
        (sugestao ? `\n\nVoce quis dizer <code>${ctx.prefix}${sugestao}</code>?` : '')
    );
    return;
  }
  const linhas = [
    `<b>${ctx.prefix}${escapeHtml(cmd.name)}</b>`,
    '',
    escapeHtml(cmd.description || 'Sem descricao.'),
    '',
    `<b>Categoria:</b> ${escapeHtml(cmd.category)}`,
  ];
  if (cmd.aliases.length > 0) {
    linhas.push(
      `<b>Atalhos:</b> ${cmd.aliases.map((a) => `<code>${ctx.prefix}${a}</code>`).join(' ')}`
    );
  }
  if (cmd.uso) linhas.push('', `<b>Exemplo:</b>\n<code>${escapeHtml(cmd.uso)}</code>`);
  const restricoes = [];
  if (cmd.soDono) restricoes.push('so dono');
  if (cmd.soAdmin) restricoes.push('so admin');
  if (cmd.soGrupo) restricoes.push('so em grupo');
  if (cmd.soPrivado) restricoes.push('so no privado');
  if (cmd.premium) restricoes.push('premium');
  if (restricoes.length > 0) linhas.push('', `<b>Restricoes:</b> ${restricoes.join(', ')}`);
  await ctx.responderComApagar(linhas.join('\n'));
}
