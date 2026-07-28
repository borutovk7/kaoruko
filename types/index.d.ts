import type { Telegraf, Context } from 'telegraf';
import type {
  Message,
  User,
  Chat,
  InlineKeyboardMarkup,
  InlineKeyboardButton,
} from 'telegraf/types';

export type Categoria =
  | 'download'
  | 'ia'
  | 'pesquisa'
  | 'logos'
  | 'diversao'
  | 'grupo'
  | 'dono'
  | 'info';

export type ChavePlano = 'free' | 'bronze' | 'prata' | 'ouro' | 'diamante' | 'dono';

export interface Plano {
  chave: ChavePlano;
  nome: string;
  emoji: string;
  limiteDiario: number;
  cooldown: number;
  prioridade: number;
  beneficios: string[];
}

export interface UsoDiario {
  usados: number;
  limite: number;
  restantes: number;
}

export interface MensagemCarregando {
  id: number;
  editar(texto: string): Promise<void>;
  apagar(): Promise<void>;
}

export interface OpcoesEnvio {
  reply_markup?: InlineKeyboardMarkup;
  caption?: string;
  title?: string;
  performer?: string;
  thumbnail?: { url: string };
  [chave: string]: unknown;
}

export interface CommandContext {
  ctx: Context;
  waguri: Telegraf;
  msg: Message;
  from: User;
  chat: Chat;

  texto: string;
  prefix: string;
  comando: string;
  args: string[];
  q: string;

  userId: string;
  chatId: number;
  messageId: number;
  nome: string;
  username: string;

  isGroup: boolean;
  isPrivate: boolean;
  nomeChat: string;

  isDono: boolean;
  isAdmin: boolean;
  isVip: boolean;
  plano: Plano;
  limite(): UsoDiario;

  respondida: Message | undefined;

  responder(texto: string, opcoes?: OpcoesEnvio): Promise<Message.TextMessage | undefined>;
  responderComApagar(texto: string, opcoes?: OpcoesEnvio): Promise<Message.TextMessage | undefined>;
  erro(texto: string): Promise<Message.TextMessage | undefined>;
  uso(exemplo: string, explicacao?: string): Promise<Message.TextMessage | undefined>;
  carregando(texto?: string): Promise<MensagemCarregando>;

  enviarFoto(url: string, legenda?: string, opcoes?: OpcoesEnvio): Promise<Message.PhotoMessage>;
  enviarVideo(url: string, legenda?: string, opcoes?: OpcoesEnvio): Promise<Message.VideoMessage>;
  enviarAudio(url: string, opcoes?: OpcoesEnvio): Promise<Message.AudioMessage>;
  enviarDocumento(url: string, opcoes?: OpcoesEnvio): Promise<Message.DocumentMessage>;
  sendTextWithMedia(imagem: string, texto: string, opcoes?: OpcoesEnvio): Promise<void>;
  react(emoji?: string): Promise<void>;

  tecladoApagar(extras?: InlineKeyboardButton[][]): InlineKeyboardMarkup;
  garantirAdmin(): Promise<boolean>;

  toUnicodeBoldUpper(texto: string): string;
  botConfig: BotConfig;
}

export type CommandHandler = (ctx: CommandContext) => Promise<unknown>;

export interface CommandModule {
  default: CommandHandler;
  description?: string;
  aliases?: string[];
  uso?: string;
  soDono?: boolean;
  soAdmin?: boolean;
  soGrupo?: boolean;
  soPrivado?: boolean;
  premium?: boolean;
  cooldown?: number;
  oculto?: boolean;
}

export interface RegisteredCommand {
  name: string;
  handler: CommandHandler;
  category: Categoria;
  description: string;
  uso: string;
  aliases: string[];
  isAlias: boolean;
  soDono: boolean;
  soAdmin: boolean;
  soGrupo: boolean;
  soPrivado: boolean;
  premium: boolean;
  cooldown: number;
  oculto: boolean;
}

export interface BotConfig {
  name: string;
  token: string;
  prefixes: string[];
  owners: string[];
  groupLink: string;
  timezone: string;
  okarun: { baseUrl: string; apikey: string; timeout: number };
  painel: { enabled: boolean; port: number; urlPublica: string };
  assets: { headerImage: string; menuImage: string; errorImage: string };
  ehDono(userId: string | number): boolean;
  validar(): string[];
}

export interface VideoInfo {
  titulo: string;
  url: string;
  canal: string;
  duracao: string;
  views: string | number | undefined;
  thumbnail: string | undefined;
  publicado: string | undefined;
  descricao: string | undefined;
}

export interface MidiaDownload {
  url: string;
  tipo: 'video' | 'image' | 'audio' | 'document';
  thumbnail?: string;
  qualidade?: string;
}

export interface ResultadoInstagram {
  midias: MidiaDownload[];
  autor: string | undefined;
  legenda: string | undefined;
  curtidas: string | number | undefined;
  comentarios: string | number | undefined;
}

export interface ResultadoYoutube {
  titulo: string;
  canal: string;
  duracao: string;
  views: string | number | undefined;
  thumbnail: string | undefined;
  audioUrl: string | undefined;
  videoUrl: string | undefined;
  arquivoUrl: string | undefined;
  bruto: unknown;
}

export interface VipRegistro {
  id: string;
  plano: Exclude<ChavePlano, 'free' | 'dono'>;
  expira_em: number | null;
  vitalicio: 0 | 1;
  desde: number;
  concedido_por: string;
  usos_hoje: number;
  usos_total: number;
}

export interface SessaoWeb {
  id: string;
  nome: string;
  papel: 'dono' | 'vip' | 'free';
  plano: Plano;
}
