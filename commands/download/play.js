import { pesquisa } from "../../core/api.js";
import { guardar } from "../../core/cache.js";
import {
  barraProgresso,
  cortar,
  escapeHtml,
  extrairUrl,
  links,
  numeroCurto,
} from "../../utils/helpers.js";
export const description =
  "Busca uma musica no YouTube e escolhe audio ou video";
export const aliases = ["musica", "yt"];
export const uso = "/play 3 dias virado";
export const cooldown = 5;
function montarCard(video) {
  const linhas = [
    "<b>YOUTUBE PLAY</b>",
    "",
    `<b>Titulo:</b> ${escapeHtml(cortar(video.titulo, 120))}`,
    `<b>Canal:</b> ${escapeHtml(video.canal)}`,
  ];
  if (video.duracao)
    linhas.push(`<b>Duracao:</b> ${escapeHtml(video.duracao)}`);
  if (video.views !== undefined)
    linhas.push(`<b>Views:</b> ${numeroCurto(video.views)}`);
  if (video.publicado)
    linhas.push(`<b>Postado:</b> ${escapeHtml(video.publicado)}`);
  linhas.push(
    "",
    `<code>0:00 ${barraProgresso(0)} ${escapeHtml(video.duracao)}</code>`,
    "",
    "<i>Escolha abaixo o formato que voce quer </i>",
  );
  return linhas.join("\n");
}
function tecladoPlay(token, userId) {
  return {
    inline_keyboard: [
      [
        {
          text: " Audio (MP3)",
          callback_data: `play:audio:${token}:${userId}`,
        },
        {
          text: " Video (MP4)",
          callback_data: `play:video:${token}:${userId}`,
        },
      ],
      [{ text: " Apagar", callback_data: `del:${userId}` }],
    ],
  };
}
export default async function play(ctx) {
  if (!ctx.q) {
    await ctx.uso(
      `${ctx.prefix}play 3 dias virado`,
      "Manda o nome da musica ou o link.",
    );
    return;
  }
  const carregando = await ctx.carregando(" Procurando no YouTube...");
  try {
    const termo = ctx.q;
    let video;
    if (links.youtube(termo)) {
      const url = extrairUrl(termo) || termo;
      const [achado] = await pesquisa.youtube(url).catch(() => []);
      video = achado ?? {
        titulo: "Video do YouTube",
        url,
        canal: "Desconhecido",
        duracao: "",
        views: undefined,
        thumbnail: undefined,
        publicado: undefined,
        descricao: undefined,
      };
    } else {
      const resultados = await pesquisa.youtube(termo);
      const primeiro = resultados[0];
      if (!primeiro) throw new Error("sem resultado");
      video = primeiro;
    }
    const estado = {
      url: video.url,
      titulo: video.titulo,
      canal: video.canal,
      duracao: video.duracao,
      thumbnail: video.thumbnail,
    };
    const token = guardar(estado);
    const teclado = tecladoPlay(token, ctx.userId);
    const legenda = montarCard(video);
    await carregando.apagar();
    if (video.thumbnail) {
      try {
        await ctx.enviarFoto(video.thumbnail, legenda, {
          reply_markup: teclado,
        });
        return;
      } catch {}
    }
    await ctx.responder(legenda, { reply_markup: teclado });
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
