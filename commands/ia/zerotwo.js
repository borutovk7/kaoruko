import { ia } from '../../core/api.js';
import { escapeHtml, fatiar } from '../../utils/helpers.js';
export const description = 'Conversa com a personagem Zero Two';
export const aliases = ['02'];
export const uso = '/zerotwo me explica o que e buraco negro';
export const cooldown = 8;
export default async function cmdzerotwo(ctx) {
  if (!ctx.q) {
    await ctx.uso(`${ctx.prefix}zerotwo me explica o que e buraco negro`, 'Faca sua pergunta.');
    return;
  }
  const carregando = await ctx.carregando(' Pensando...');
  try {
    const resposta = await ia.zerotwo(ctx.q);
    await carregando.apagar();
    if (!resposta.trim()) {
      await ctx.erro('A IA nao respondeu nada. Tenta reformular.');
      return;
    }
    for (const parte of fatiar(escapeHtml(resposta), 3800)) {
      await ctx.responder(parte);
    }
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
