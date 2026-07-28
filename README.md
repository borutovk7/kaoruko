# Kaoruko Waguri

Bot de Telegram em ESM puro, com SQLite, VIP em 4 níveis e painel web com login por e-mail e senha.

**285 comandos** · API [OKARUN](https://api.okarunsystem.com.br)

---

## Rodar

```bash
npm install
nano .env          # já vem pronto, só preencher
npm run check
npm start
```

O `.env` já está incluído. Preencha:

| Variável | Onde pegar |
|---|---|
| `BOT_TOKEN` | [@BotFather](https://t.me/BotFather) |
| `OKARUN_APIKEY` | https://api.okarunsystem.com.br |
| `BOT_OWNERS` | Seu ID no [@userinfobot](https://t.me/userinfobot) |
| `PAINEL_ADMIN_EMAIL` | E-mail do primeiro login no painel |
| `PAINEL_ADMIN_SENHA` | **Troque** — vem com `trocaessasenha123` |

```bash
npm run dev      # recarrega ao salvar
npm run check    # diagnóstico
npm run tipos    # checa tipos (opcional)
```

---

## Login do painel

Acesso por **e-mail e senha**, só isso.

A conta do `.env` é criada sozinha no primeiro boot. Depois disso dá pra criar mais contas de dois jeitos:

```
/conta criar pessoa@email.com senha12345 123456789
/conta listar
/conta senha pessoa@email.com novaSenha
/conta vincular pessoa@email.com 123456789
/conta excluir pessoa@email.com
```

Ou pelo próprio painel, na aba **Admin**.

O terceiro argumento do `criar` é o ID do Telegram — quando vinculado, o painel mostra o uso real e o VIP da pessoa.

**Segurança:** senha em PBKDF2-SHA512 com 120 mil iterações e salt por conta, comparação em tempo constante, bloqueio de 15 min após 5 tentativas erradas, sessão de 7 dias em cookie HttpOnly. Rotas de admin devolvem 401 sem sessão e 403 pra quem não é dono.

`PAINEL_REGISTRO_ABERTO=true` libera auto-cadastro no site. Vem desligado.

---

## Sistema VIP

| Plano | Limite/dia | Cooldown |
|---|---|---|
| Free | 50 | 5s |
| Bronze | 150 | 2s |
| Prata | 400 | 1s |
| Ouro | 1.000 | nenhum |
| Diamante | ilimitado | nenhum |

- Limite diário contado no banco, reseta à meia-noite
- Cooldown varia conforme o plano
- Renovar **soma** tempo em vez de sobrescrever
- Histórico de ativação, renovação e remoção
- Expiração automática com faxina diária às 3h

```
/vip                            seu plano, uso do dia e histórico
/addvip 123456789 ouro 30d      dar VIP (dono)
/addvip 123456789 diamante vitalicio
/delvip 123456789
/listvip
```

---

## Site

Tema escuro rosa/roxo, navegação por hash sem recarregar, busca de comandos com filtro por categoria, cards de plano, barra de uso e responsivo.

**Sem emoji no HTML** — os ícones são [Font Awesome 6.5.2](https://cdnjs.cloudflare.com) via CDN, e as fontes (Outfit + JetBrains Mono) vêm do Google Fonts.

Páginas: Início, Comandos, Planos, Painel (logado) e Admin (dono).

### Painel Admin

Seis abas com dados do banco em tempo real:

| Aba | O que mostra |
|---|---|
| **Usuários** | Todos os usuários do bot, com busca por nome/@user/ID, filtro (todos, VIP, donos, bloqueados) e paginação. Clique numa linha pra abrir o perfil completo |
| **Grupos** | Todos os grupos onde o bot está, com contagem de mensagens, tipo e desde quando |
| **Donos** | Quem está em `BOT_OWNERS`, se já usou o bot e quantos comandos rodou |
| **VIPs** | Conceder, listar e remover VIP |
| **Contas** | Contas de acesso ao painel |
| **Métricas** | Gráfico de 14 dias, comandos mais usados, usuários mais ativos |

No topo, oito indicadores: usuários, ativos hoje, novos em 7 dias, grupos, VIPs, donos, comandos hoje e bloqueados.

Clicando num usuário abre um modal com plano, uso de hoje, total de comandos, primeiro e último uso, histórico de VIP, uso dos últimos 7 dias — e botão pra **bloquear ou desbloquear** direto dali (dono não pode ser bloqueado).

---

## Banco

`@boruto_vk7/better-sqlite3`, que compila no Termux. Nada de JSON.

Tabelas: `usuarios`, `grupos`, `vip`, `vip_historico`, `bloqueados`, `uso_diario`, `estatisticas`, `contas`, `sessoes`. WAL ligado, índices e transações nas escritas em lote.

> O `package.json` traz `"boruto": { "sqliteVersion": "^12.9.0" }`. Sem isso o wrapper tenta compilar `better-sqlite3@^1.0.14`, que não existe, e o install quebra.

---

## Estrutura

```
kaoruko/
├── .env                    já preenchido, só editar
├── index.js
├── types/index.d.ts        tipos (comandos são .js)
├── jsconfig.json           autocomplete no editor
├── config/index.js
├── core/
│   ├── api.js              cliente OKARUN
│   ├── db.js               SQLite + schema
│   ├── vip.js              planos, limites, histórico
│   ├── auth.js             contas, senhas, sessões
│   ├── storage.js
│   ├── router.js
│   ├── contexto.js
│   ├── cache.js
│   └── menu-generator.js
├── commands/
│   ├── registry.js         autoload por pasta
│   ├── download/ (13)   ia/ (8)        pesquisa/ (21)
│   ├── logos/ (146)     diversao/ (72)
│   └── grupo/ (2)       dono/ (9)      info/ (5)
├── events/
├── painel/
│   ├── server.js
│   └── public/             index.html · estilo.css · app.js
├── utils/
│   ├── banner.js           showBanner2 / showBanner3
│   ├── helpers.js
│   └── logger.js
└── scripts/check.js
```

---

## Criar comando

Cria o arquivo e pronto. Nome do arquivo = comando, pasta = categoria.

`commands/pesquisa/clima.js` vira `/clima`

```js
import { requisitar, acharCampo } from '../../core/api.js';
import { escapeHtml } from '../../utils/helpers.js';

export const description = 'Clima de uma cidade';
export const aliases = ['tempo'];
export const uso = '/clima Manaus';
export const cooldown = 5;

export default async function clima(ctx) {
  if (!ctx.q) {
    await ctx.uso(`${ctx.prefix}clima Manaus`, 'Digite a cidade.');
    return;
  }

  const carregando = await ctx.carregando('Consultando...');

  try {
    const dados = await requisitar('/api/clima', { cidade: ctx.q });
    await carregando.apagar();
    await ctx.responderComApagar(`<b>${escapeHtml(ctx.q)}</b>: ${acharCampo(dados, ['temp'])} graus`);
  } catch (err) {
    await carregando.apagar();
    throw err;
  }
}
```

Aparece sozinho no `/menu`, no `/menupesquisa` e no site.

### Autocomplete sem TypeScript

Os comandos são `.js`. Pra ter tipo no editor, uma linha de JSDoc:

```js
/** @param {import('../../types/index.js').CommandContext} ctx */
export default async function clima(ctx) {
  ctx.  // o editor sugere tudo
}
```

### O que o ctx tem

| Dados | Envio | Permissão |
|---|---|---|
| `ctx.q` `ctx.args` `ctx.prefix` | `ctx.responder()` | `ctx.isDono` |
| `ctx.userId` `ctx.chatId` | `ctx.responderComApagar()` | `ctx.isVip` |
| `ctx.nome` `ctx.username` | `ctx.erro()` `ctx.uso()` | `ctx.plano` |
| `ctx.isGroup` `ctx.isPrivate` | `ctx.carregando()` | `ctx.limite()` |
| `ctx.respondida` | `ctx.enviarFoto/Video/Audio/Documento()` | `ctx.garantirAdmin()` |
| `ctx.waguri` `ctx.botConfig` | `ctx.sendTextWithMedia()` `ctx.react()` | |

Flags: `soDono` `soAdmin` `soGrupo` `soPrivado` `premium` `cooldown` `oculto`

---

## Notas

- Node 20 ou maior
- Produção: `pm2 start index.js --name kaoruko`
- `/restart` fecha o banco e sai com código 0, o pm2 sobe de novo
- Backup: copie `database/kaoruko.db` junto com o `.db-wal` e `.db-shm`
- Pra expor o painel na internet, preencha `PAINEL_URL` e ponha atrás de HTTPS
