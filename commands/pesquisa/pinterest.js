import { pesquisa, acharUrl } from '../../core/api.js';
import { cortar, escapeHtml, aleatorio } from '../../utils/helpers.js';
export const description = 'Procura imagens no Pinterest';
export const aliases = ['pin', 'pinterest2'];
export const uso = '/pinterest paisagem anime';
export const cooldown = 5;
export default async function pinterest(ctx) {
  if (!ctx.q) {
    await ctx.uso(`${ctx.prefix}pinterest paisagem anime`, 'Digite o que buscar.');
    return;
  }
  const carregando = await ctx.carregando(' Procurando imagens...');
  try {
    const bruto = await pesquisa.pinterest(ctx.q);
    await carregando.apagar();
    const lista = Array.isArray(bruto) ? bruto : [bruto];
    const urls = [];
    for (const item of lista) {
      const url = typeof item === 'string' ? item : acharUrl(item);
      if (url) urls.push(url);
    }
    if (urls.length === 0) {
      await ctx.erro('Nao achei imagens com esse termo.');
      return;
    }
    const escolhidas = urls.slice(0, 5);
    try {
      const grupo = escolhidas.map((url, i) => ({
        type: 'photo',
        media: url,
        ...(i === 0 ? { caption: ` Pinterest: ${cortar(ctx.q, 80)}` } : {}),
      }));
      await ctx.ctx.replyWithMediaGroup(grupo, { reply_to_message_id: ctx.messageId });
    } catch {
      const uma = aleatorio(urls);
      if (uma) {
        await ctx.enviarFoto(uma, ` Pinterest: ${escapeHtml(cortar(ctx.q, 80))}`, {
          reply_markup: ctx.tecladoApagar(),
        });
      }
    }
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
