import { listarGrupos } from '../../core/storage.js';
import { escapeHtml, sleep } from '../../utils/helpers.js';
export const description = 'Envia uma mensagem pra todos os grupos';
export const aliases = ['tm', 'broadcast'];
export const uso = '/transmitir mensagem aqui';
export const soDono = true;
export const cooldown = 30;
export default async function transmitir(ctx) {
  if (!ctx.q) {
    await ctx.uso(`${ctx.prefix}transmitir Manutencao as 20h!`);
    return;
  }
  const lista = listarGrupos(500);
  if (lista.length === 0) {
    await ctx.erro('O bot ainda nao esta em nenhum grupo.');
    return;
  }
  const aviso = await ctx.carregando(` Enviando pra ${lista.length} grupos...`);
  let ok = 0;
  let falhou = 0;
  for (const grupo of lista) {
    try {
      await ctx.waguri.telegram.sendMessage(
        grupo.id,
        `<b>AVISO DO DONO</b>\n\n${escapeHtml(ctx.q)}`,
        { parse_mode: 'HTML' }
      );
      ok += 1;
    } catch {
      falhou += 1;
    }
    await sleep(120);
  }
  await aviso.apagar();
  await ctx.responderComApagar(
    `<b>Transmissao concluida</b>\n\nEnviadas: ${ok}\nFalharam: ${falhou}`
  );
}
