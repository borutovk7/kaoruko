import botConfig from '../../config/index.js';
import { listarVips, estatisticasVip, PLANOS } from '../../core/vip.js';
import { escapeHtml, cortar } from '../../utils/helpers.js';

export const description = 'Lista os membros VIP';
export const aliases = ['listprem', 'vips'];
export const uso = '/listvip';
export const soDono = true;

export default async function listvip(ctx) {
  const lista = listarVips();

  if (lista.length === 0) {
    await ctx.responderComApagar(' Nenhum membro VIP ainda.');
    return;
  }

  const stats = estatisticasVip();
  const linhas = [`<b>MEMBROS VIP (${lista.length})</b>`, ''];

  for (const p of stats.porPlano) {
    const info = PLANOS[p.plano] ?? PLANOS.bronze;
    linhas.push(`${info.nome}: ${p.c}`);
  }
  linhas.push('', '━━━━━━━━━━━━━━━━━━', '');

  lista.slice(0, 40).forEach((v, i) => {
    const info = PLANOS[v.plano] ?? PLANOS.bronze;
    const nome = v.nome ? cortar(v.nome, 24) : v.id;
    const quando = v.vitalicio
      ? 'vitalicio'
      : new Date(v.expira_em).toLocaleDateString('pt-BR', { timeZone: botConfig.timezone });

    linhas.push(
      `${i + 1}. <b>${escapeHtml(nome)}</b>\n` +
        ` <code>${v.id}</code> · ${quando} · ${v.usos_total} usos`
    );
  });

  await ctx.responderComApagar(linhas.join('\n'));
}
