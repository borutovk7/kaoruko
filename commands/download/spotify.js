import { download, acharUrl, acharCampo } from "../../core/api.js";
import { cortar, escapeHtml, extrairUrl, links } from "../../utils/helpers.js";
export const description = "Baixa musica do Spotify";
export const aliases = ["spot"];
export const uso = "/spotify https://open.spotify.com/track/ID";
export const cooldown = 5;
export default async function cmdspotify(ctx) {
  const url = extrairUrl(ctx.q) || ctx.q.trim();
  if (!url) {
    await ctx.uso(
      "/spotify https://open.spotify.com/track/ID",
      "Manda o link junto com o comando.",
    );
    return;
  }
  if (!links.spotify(url)) {
    await ctx.erro("Esse link nao e do Spotify.");
    return;
  }
  const carregando = await ctx.carregando(" Baixando...");
  try {
    const bruto = await download.spotify(url);
    const midia = acharUrl(bruto);
    await carregando.apagar();
    if (!midia) {
      await ctx.erro("A API nao devolveu nenhum arquivo pra esse link.");
      return;
    }
    const titulo = acharCampo(bruto, [
      "title",
      "titulo",
      "name",
      "desc",
      "nickname",
    ]);
    const legenda = titulo
      ? `<b>${escapeHtml(cortar(String(titulo), 200))}</b>`
      : "<b>Download concluido</b>";
    try {
      await ctx.enviarAudio(midia, {
        caption: legenda,
        reply_markup: ctx.tecladoApagar(),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/too big|failed to get http url content/i.test(msg)) {
        await ctx.enviarDocumento(midia, {
          caption: legenda,
          reply_markup: ctx.tecladoApagar(),
        });
        return;
      }
      throw err;
    }
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
