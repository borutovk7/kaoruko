import { escapeHtml, inteiroAleatorio } from '../../utils/helpers.js';
export const description = 'Mede a compatibilidade entre duas pessoas';
export const aliases = ['ship'];
export const uso = '/casal Joao / Maria';
export const cooldown = 2;
export default async function casal(ctx) {
  const partes = ctx.q.split(/\s*(?:\/|\se\s|\sx\s)\s*/i).filter(Boolean);
  if (partes.length < 2) {
    await ctx.uso(`${ctx.prefix}casal Joao / Maria`, 'Separe os dois nomes com uma barra.');
    return;
  }
  const nome1 = partes[0] ?? '';
  const nome2 = partes[1] ?? '';
  const porcento = inteiroAleatorio(101);
  const coracoes = ''.repeat(Math.max(1, Math.round(porcento / 20)));
  const veredito =
    porcento < 25
      ? 'Melhor ficar na amizade... '
      : porcento < 50
        ? 'Tem potencial, mas precisa se esforcar '
        : porcento < 75
          ? 'Combinam bastante! '
          : 'Foi feito um pro outro! ';
  await ctx.responderComApagar(
    `<b>MEDIDOR DE CASAL</b>\n\n` +
      `<b>${escapeHtml(nome1.trim())}</b> <b>${escapeHtml(nome2.trim())}</b>\n\n` +
      `${coracoes}\n<b>${porcento}% de compatibilidade</b>\n\n<i>${veredito}</i>`
  );
}
