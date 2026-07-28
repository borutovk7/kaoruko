import botConfig from '../../config/index.js';
import { escapeHtml } from '../../utils/helpers.js';

export const description = 'Mostra o endereco do painel web';
export const aliases = ['site', 'web'];
export const uso = '/painel';
export const cooldown = 10;

export default async function painel(ctx) {
  const url = botConfig.painel.urlPublica || `http://localhost:${botConfig.painel.port}`;

  await ctx.responderComApagar(
    [
      '<b>PAINEL WEB</b>',
      '',
      `<b>Endereco:</b> ${escapeHtml(url)}`,
      '',
      'O acesso e feito com <b>e-mail e senha</b>.',
      botConfig.painel.registroAberto
        ? 'Voce pode criar sua conta direto no site, em "Criar agora".'
        : 'O registro esta fechado. Peca uma conta ao dono do bot.',
      '',
      'No painel voce ve seu plano, o uso do dia e o historico da assinatura.',
    ].join('\n')
  );
}
