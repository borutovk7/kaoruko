import botConfig from "../config/index.js";
import { ehVip, planoDe, usoDe } from "./vip.js";
import {
  cortar,
  escapeHtml,
  fatiar,
  toUnicodeBoldUpper,
  LIMITE_LEGENDA,
} from "../utils/helpers.js";
export function tecladoApagar(userId, extras = []) {
  return {
    inline_keyboard: [
      ...extras,
      [{ text: " Apagar", callback_data: `del:${userId}` }],
    ],
  };
}
function nomeCompleto(from) {
  return (
    [from.first_name, from.last_name].filter(Boolean).join(" ").trim() ||
    "Usuario"
  );
}
export function criarContexto(ctx, waguri) {
  const msg = ctx.message;
  const from = ctx.from;
  const chat = ctx.chat;
  if (!msg || !from || !chat) return null;
  const tipoChat = chat.type === "supergroup" ? "group" : chat.type;
  const isGroup = tipoChat === "group";
  const isPrivate = tipoChat === "private";
  const texto =
    "text" in msg && typeof msg.text === "string"
      ? msg.text
      : "caption" in msg && typeof msg.caption === "string"
        ? msg.caption
        : "";
  const prefix = botConfig.prefixes.find((p) => texto.startsWith(p)) ?? "";
  const semPrefixo = prefix ? texto.slice(prefix.length).trim() : "";
  const partes = semPrefixo.split(/\s+/).filter(Boolean);
  const comando = prefix
    ? ((partes[0] ?? "").split("@")[0]?.toLowerCase() ?? "")
    : "";
  const args = partes.slice(1);
  const userId = String(from.id);
  const chatId = chat.id;
  const messageId = msg.message_id;
  const nome = nomeCompleto(from);
  const respondida =
    "reply_to_message" in msg && msg.reply_to_message
      ? msg.reply_to_message
      : undefined;
  const contexto = {
    ctx,
    waguri,
    msg,
    from,
    chat: chat,
    texto,
    prefix,
    comando,
    args,
    q: args.join(" ").trim(),
    userId,
    chatId,
    messageId,
    nome,
    username: from.username ?? "",
    isGroup,
    isPrivate,
    nomeChat: isGroup && "title" in chat ? (chat.title ?? "Grupo") : nome,
    isDono: botConfig.ehDono(userId),
    isAdmin: false,
    isVip: ehVip(userId),
    plano: planoDe(userId),
    limite: () => usoDe(userId),
    respondida,
    async responder(txt, opcoes = {}) {
      let ultima;
      for (const parte of fatiar(txt)) {
        try {
          ultima = await ctx.reply(parte, {
            parse_mode: "HTML",
            reply_to_message_id: messageId,
            link_preview_options: { is_disabled: true },
            ...opcoes,
          });
        } catch (err) {
          if (!/can't parse entities/i.test(err.message ?? "")) throw err;
          ultima = await ctx.reply(parte.replace(/<[^>]*>/g, ""), {
            reply_to_message_id: messageId,
            link_preview_options: { is_disabled: true },
            ...opcoes,
          });
        }
      }
      return ultima;
    },
    async responderComApagar(txt, opcoes = {}) {
      return contexto.responder(txt, {
        reply_markup: tecladoApagar(userId),
        ...opcoes,
      });
    },
    async erro(txt) {
      return contexto.responderComApagar(`${escapeHtml(txt)}`);
    },
    async uso(exemplo, explicacao = "") {
      return contexto.responderComApagar(
        ` <b>Faltou informacao</b>${explicacao ? `\n\n${escapeHtml(explicacao)}` : ""}` +
          `\n\n<b>Exemplo:</b>\n<code>${escapeHtml(exemplo)}</code>`,
      );
    },
    async carregando(txt = " Processando...") {
      let enviada;
      try {
        enviada = await ctx.reply(txt, {
          parse_mode: "HTML",
          reply_to_message_id: messageId,
        });
      } catch {
        return {
          id: 0,
          editar: async () => {},
          apagar: async () => {},
        };
      }
      const id = enviada.message_id;
      return {
        id,
        async editar(novo) {
          try {
            await ctx.telegram.editMessageText(chatId, id, undefined, novo, {
              parse_mode: "HTML",
            });
          } catch {}
        },
        async apagar() {
          try {
            await ctx.telegram.deleteMessage(chatId, id);
          } catch {}
        },
      };
    },
    async enviarFoto(url, legenda = "", opcoes = {}) {
      return ctx.replyWithPhoto(
        { url },
        {
          caption: cortar(legenda, LIMITE_LEGENDA),
          parse_mode: "HTML",
          reply_to_message_id: messageId,
          ...opcoes,
        },
      );
    },
    async enviarVideo(url, legenda = "", opcoes = {}) {
      return ctx.replyWithVideo(
        { url },
        {
          caption: cortar(legenda, LIMITE_LEGENDA),
          parse_mode: "HTML",
          reply_to_message_id: messageId,
          supports_streaming: true,
          ...opcoes,
        },
      );
    },
    async enviarAudio(url, opcoes = {}) {
      return ctx.replyWithAudio(
        { url },
        {
          parse_mode: "HTML",
          reply_to_message_id: messageId,
          ...opcoes,
        },
      );
    },
    async enviarDocumento(url, opcoes = {}) {
      return ctx.replyWithDocument(
        { url },
        {
          parse_mode: "HTML",
          reply_to_message_id: messageId,
          ...opcoes,
        },
      );
    },
    async sendTextWithMedia(imagem, txt, opcoes = {}) {
      try {
        await contexto.enviarFoto(imagem, txt, {
          reply_markup: tecladoApagar(userId),
          ...opcoes,
        });
      } catch {
        await contexto.responderComApagar(txt, opcoes);
      }
    },
    async react(emoji = "") {
      try {
        await ctx.telegram.callApi("setMessageReaction", {
          chat_id: chatId,
          message_id: messageId,
          reaction: [{ type: "emoji", emoji }],
        });
      } catch {}
    },
    tecladoApagar(extras) {
      return tecladoApagar(userId, extras);
    },
    async garantirAdmin() {
      if (!isGroup) return false;
      if (contexto.isAdmin) return true;
      try {
        const membro = await ctx.telegram.getChatMember(chatId, from.id);
        contexto.isAdmin =
          membro.status === "administrator" || membro.status === "creator";
      } catch {
        contexto.isAdmin = false;
      }
      return contexto.isAdmin;
    },
    toUnicodeBoldUpper,
    botConfig,
  };
  return contexto;
}
