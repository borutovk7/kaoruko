import { fecharDb } from '../../core/db.js';
import { logAviso } from '../../utils/logger.js';
export const description = 'Reinicia o bot';
export const aliases = ['reiniciar'];
export const uso = '/restart';
export const soDono = true;
export default async function restart(ctx) {
  await ctx.responder(' Reiniciando... volto em alguns segundos.');
  logAviso(`Reinicio solicitado por ${ctx.nome} (${ctx.userId})`);
  fecharDb();
  setTimeout(() => process.exit(0), 800);
}
