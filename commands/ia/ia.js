import { ia } from '../../core/api.js';
import { escapeHtml, fatiar } from '../../utils/helpers.js';
export const description = 'Conversa com a IA (GPT-4)';
export const aliases = ['gpt', 'chatgpt', 'gpt4'];
export const uso = '/ia me explica o que e buraco negro';
export const cooldown = 8;
export default async function cmdia(ctx) {
  if (!ctx.q) {
    await ctx.uso(`${ctx.prefix}ia me explica o que e buraco negro`, 'Faca sua pergunta.');
    return;
  }
  const carregando = await ctx.carregando(' Pensando...');
  try {
    const resposta = await ia.gpt4(ctx.q);
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
