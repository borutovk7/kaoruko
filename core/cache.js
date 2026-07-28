import crypto from "node:crypto";

const TTL = 3600 * 1000;
const LIMPEZA = 300 * 1000;

const itens = new Map();

function limpar() {
  const agora = Date.now();
  for (const [chave, item] of itens) {
    if (item.expiraEm < agora) itens.delete(chave);
  }
}

const timer = setInterval(limpar, LIMPEZA);
timer.unref?.();

export function guardar(dados, ttl = TTL) {
  const token = crypto.randomBytes(6).toString("hex");
  itens.set(token, { dados, expiraEm: Date.now() + ttl });
  return token;
}

export function recuperar(token) {
  const item = itens.get(token);
  if (!item) return undefined;

  if (item.expiraEm < Date.now()) {
    itens.delete(token);
    return undefined;
  }
  return item.dados;
}

export function esquecer(token) {
  return itens.delete(token);
}

export function tamanhoCache() {
  return itens.size;
}
