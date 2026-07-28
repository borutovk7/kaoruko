import { getByCategory } from "../commands/registry.js";
import { toUnicodeBoldUpper, aleatorio } from "../utils/helpers.js";
const SUBMENU_TEMPLATE = {
  header: `╭══════════════════════╗
╰╮ 𝙳𝙰𝚃𝙰: {{DATA}}
╭┤ 𝙷𝙾𝚁𝙰: {{HORA}}
╰╮ 𝙿𝙸𝙽𝙶: {{PING}}ms
╭┤ 𝚂𝚃𝙰𝚃𝚄𝚂: 𝙾𝙽𝙻𝙸𝙽𝙴
┃╰═════════════════════╝
╰╔═════════════════════╗
╭┤ {{CATEGORY_NAME}}
┃╚═════════════════════╝`,
  commandLine: `┃\n┃ {{EMOJI}} {{PREFIX}}{{CMD_NAME}}`,
  footer: `\n╰╔═════════════════════╗\n╭┤ {{BOT_NAME}}\n╰╚═════════════════════╝`,
};
const FATE_EMOJIS = ["", "", "", "", "", "", "", "", "", "", ""];
export function generateMenuCommand(category) {
  return async (ctx) => {
    const startTime = Date.now();
    const commands = getByCategory(category);
    if (commands.length === 0) {
      await ctx.responder(
        `> Nenhum feitico encontrado na categoria ${category}`,
      );
      return;
    }
    const ping = Date.now() - startTime;
    const now = new Date();
    const localDate = now.toLocaleDateString("pt-BR", {
      timeZone: ctx.botConfig.timezone,
    });
    const localTime = now.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: ctx.botConfig.timezone,
    });
    let bodyText = SUBMENU_TEMPLATE.header
      .replace("{{DATA}}", localDate)
      .replace("{{HORA}}", localTime)
      .replace("{{PING}}", String(ping))
      .replace(
        "{{CATEGORY_NAME}}",
        ctx.toUnicodeBoldUpper(`COMANDOS ${category.toUpperCase()}`),
      );
    for (const cmd of commands) {
      const emoji = aleatorio(FATE_EMOJIS) ?? "";
      bodyText +=
        "\n" +
        SUBMENU_TEMPLATE.commandLine
          .replace("{{EMOJI}}", emoji)
          .replace("{{PREFIX}}", ctx.prefix)
          .replace("{{CMD_NAME}}", toUnicodeBoldUpper(cmd.name));
    }
    bodyText += SUBMENU_TEMPLATE.footer.replace(
      "{{BOT_NAME}}",
      ctx.botConfig.name.toUpperCase(),
    );
    await ctx.sendTextWithMedia(ctx.botConfig.assets.headerImage, bodyText);
  };
}
