import botConfig from '../../config/index.js';
import { PLANOS, PLANO_FREE, ORDEM_PLANOS, obterVip, usoDe, historicoDe } from '../../core/vip.js';
import { escapeHtml } from '../../utils/helpers.js';

export const description = 'Mostra os planos VIP e seu status';
export const aliases = ['planos', 'premium', 'meuplano'];
export const uso = '/vip';
export const cooldown = 5;

export default async function vip(ctx) {
  const plano = ctx.plano;
  const uso = usoDe(ctx.userId);
  const registro = obterVip(ctx.userId);

  const linhas = [`<b>SEU PLANO: ${plano.nome.toUpperCase()}</b>`, ''];

  const limite = uso.limite === Infinity ? '∞' : uso.limite;
  const restantes = uso.restantes === Infinity ? '∞' : uso.restantes;
  linhas.push(`<b>Uso hoje:</b> ${uso.usados}/${limite} · restam ${restantes}`);
  linhas.push(`<b>Cooldown:</b> ${plano.cooldown === 0 ? 'nenhum' : `${plano.cooldown}s`}`);

  if (registro) {
    const validade = registro.vitalicio
      ? 'vitalicio '
      : new Date(registro.expira_em).toLocaleString('pt-BR', { timeZone: botConfig.timezone });
    linhas.push(`<b>Validade:</b> ${validade}`);
    linhas.push(`<b>Total usado:</b> ${registro.usos_total} comandos`);

    const hist = historicoDe(ctx.userId, 3);
    if (hist.length > 0) {
      linhas.push('', '<b>Historico:</b>');
      for (const h of hist) {
        const quando = new Date(h.em).toLocaleDateString('pt-BR', { timeZone: botConfig.timezone });
        linhas.push(` • ${h.acao} ${h.plano ?? ''} — ${quando}`);
      }
    }
  }

  linhas.push('', '━━━━━━━━━━━━━━━━━━', '', '<b>PLANOS DISPONIVEIS</b>', '');

  linhas.push(` <b>${PLANO_FREE.nome}</b> — ${PLANO_FREE.limiteDiario}/dia`);
  linhas.push('');

  for (const chave of ORDEM_PLANOS) {
    const p = PLANOS[chave];
    const limiteTxt = p.limiteDiario === Infinity ? 'ilimitado' : `${p.limiteDiario}/dia`;
    linhas.push(`<b>${p.nome}</b> — ${limiteTxt}`);
    for (const b of p.beneficios) linhas.push(` • ${b}`);
    linhas.push('');
  }

  linhas.push('━━━━━━━━━━━━━━━━━━');
  linhas.push(
    botConfig.groupLink
      ? `\nPra assinar, fale no grupo:\n${escapeHtml(botConfig.groupLink)}`
      : '\nFale com o dono do bot pra assinar.'
  );

  await ctx.responderComApagar(linhas.join('\n'));
}
