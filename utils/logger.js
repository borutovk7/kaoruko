import chalk from "chalk";
import botConfig from "../config/index.js";
function agora() {
  return new Date().toLocaleString("pt-BR", { timeZone: botConfig.timezone });
}
export function logInfo(msg, ...extra) {
  console.log(chalk.cyan(`[${agora()}] ℹ ${msg}`), ...extra);
}
export function logSucesso(msg, ...extra) {
  console.log(chalk.green(`[${agora()}] ok ${msg}`), ...extra);
}
export function logAviso(msg, ...extra) {
  console.log(chalk.yellow(`[${agora()}] !  ${msg}`), ...extra);
}
export function logErro(msg, err) {
  globalThis.__capturarErro?.(msg, err);
  console.error(chalk.red(`[${agora()}] x  ${msg}`));
  if (err !== undefined) {
    if (err instanceof Error && err.stack) {
      console.error(
        chalk.red.dim(err.stack.split("\n").slice(0, 3).join("\n")),
      );
    } else {
      console.error(chalk.red.dim(String(err)));
    }
  }
}
export function logComando(dados) {
  console.log(
    chalk.magenta(`[${agora()}] >  /${dados.comando}`) +
      chalk.gray(` · ${dados.usuario} (${dados.userId})`) +
      chalk.gray(` · ${dados.chat} (${dados.chatId})`),
  );
}
export default { logInfo, logSucesso, logAviso, logErro, logComando };
