import { getCategories, getByCategory, getAllCommands } from '../registry.js';
import { escapeHtml, toUnicodeBoldUpper } from '../../utils/helpers.js';
export const description = 'Mostra o menu principal';
export const aliases = ['help', 'ajuda', 'comandos', 'start'];
export const uso = '/menu';
export const cooldown = 3;
const EMOJI_CATEGORIA = {
  download: '',
  ia: '',
  pesquisa: '',
  logos: '',
  diversao: '',
  grupo: '',
  dono: '',
  info: 'ℹ',
};
const HEADER = `╭══════════════════════╗
╰╮ 𝙳𝙰𝚃𝙰: {{DATA}}
╭┤ 𝙷𝙾𝚁𝙰: {{HORA}}
╰╮ 𝙿𝙸𝙽𝙶: {{PING}}ms
╭┤ 𝚂𝚃𝙰𝚃𝚄𝚂: 𝙾𝙽𝙻𝙸𝙽𝙴
┃╰═════════════════════╝
╰╔═════════════════════╗
╭┤ {{BOT_NAME}}
┃╚═════════════════════╝`;
const FOOTER = `\n╰╔═════════════════════╗\n╭┤ {{BOT_NAME}}\n╰╚═════════════════════╝`;
export default async function menu(ctx) {
  const inicio = Date.now();
  const now = new Date();
  const data = now.toLocaleDateString('pt-BR', { timeZone: ctx.botConfig.timezone });
  const hora = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ctx.botConfig.timezone,
  });
  const plano = `${ctx.plano.nome.toUpperCase()}`;
  const uso = ctx.limite();
  const limiteTxt = uso.limite === Infinity ? '∞' : `${uso.usados}/${uso.limite}`;
  const ping = Date.now() - inicio;
  let texto = HEADER.replace('{{DATA}}', data)
    .replace('{{HORA}}', hora)
    .replace('{{PING}}', String(ping))
    .replace('{{BOT_NAME}}', ctx.toUnicodeBoldUpper(ctx.botConfig.name));
  texto += `\n┃\n┃ ${toUnicodeBoldUpper('USUARIO')}: ${escapeHtml(ctx.nome)}`;
  texto += `\n┃ ${toUnicodeBoldUpper('PLANO')}: ${plano}`;
  texto += `\n┃ ${toUnicodeBoldUpper('COMANDOS')}: ${getAllCommands().length}`;
  texto += `\n┃ ${toUnicodeBoldUpper('USO HOJE')}: ${limiteTxt}`;
  texto += `\n┃`;
  texto += `\n╰╔═════════════════════╗`;
  texto += `\n╭┤ ${toUnicodeBoldUpper('CATEGORIAS')}`;
  texto += `\n┃╚═════════════════════╝`;
  for (const categoria of getCategories()) {
    if (categoria === 'dono' && !ctx.isDono) continue;
    const total = getByCategory(categoria).length;
    if (total === 0) continue;
    const emoji = EMOJI_CATEGORIA[categoria] ?? '';
    texto += `\n┃\n┃ ${emoji} ${ctx.prefix}menu${categoria} ${toUnicodeBoldUpper(`(${total})`)}`;
  }
  texto += `\n┃`;
  texto += FOOTER.replace('{{BOT_NAME}}', ctx.botConfig.name.toUpperCase());
  await ctx.sendTextWithMedia(ctx.botConfig.assets.menuImage, texto);
}
