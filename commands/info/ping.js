import os from 'node:os';
import { verificarKey } from '../../core/api.js';
import { contarUsuarios, contarGrupos } from '../../core/storage.js';
import { estatisticasVip } from '../../core/vip.js';
import { getAllCommands } from '../registry.js';
import { cortar, escapeHtml, tamanhoLegivel, tempoLegivel } from '../../utils/helpers.js';
export const description = 'Mostra o status do bot e da API';
export const aliases = ['status', 'info'];
export const uso = '/ping';
export const cooldown = 5;
export default async function ping(ctx) {
  const inicio = Date.now();
  const carregando = await ctx.carregando(' Medindo...');
  const key = await verificarKey();
  const latencia = Date.now() - inicio;
  const ramTotal = os.totalmem();
  const ramLivre = os.freemem();
  const agora = new Date().toLocaleString('pt-BR', { timeZone: ctx.botConfig.timezone });
  const linhas = [
    `<b>STATUS · ${escapeHtml(ctx.botConfig.name)}</b>`,
    '',
    `<b>Latencia:</b> ${latencia}ms`,
    `<b>Online ha:</b> ${tempoLegivel(process.uptime())}`,
    `<b>Agora:</b> ${agora}`,
    '',
    `<b>API Okarun:</b> ${key.ok ? ' conectada' : `${escapeHtml(cortar(key.motivo ?? '', 80))}`}`,
    `<b>Endpoint:</b> <code>${escapeHtml(ctx.botConfig.okarun.baseUrl)}</code>`,
    '',
    `<b>RAM:</b> ${tamanhoLegivel(ramTotal - ramLivre)} / ${tamanhoLegivel(ramTotal)}`,
    `<b>Sistema:</b> ${os.platform()} ${os.arch()}`,
    `<b>Node:</b> ${process.version}`,
    '',
    `<b>Comandos:</b> ${getAllCommands().length}`,
    `<b>Usuarios:</b> ${contarUsuarios()}`,
    `<b>Grupos:</b> ${contarGrupos()}`,
    `<b>VIPs:</b> ${estatisticasVip().total}`,
  ];
  await carregando.apagar();
  await ctx.responderComApagar(linhas.join('\n'));
}
