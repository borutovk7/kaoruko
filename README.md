<div align="center">

# 🦊 Kaoruko Waguri

**Bot de Telegram completo em ESM com SQLite, sistema VIP em 5 planos e Painel Web**

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Telegram](https://img.shields.io/badge/Telegram-Bot-26A5E4?logo=telegram)](https://t.me/)

**285 comandos** • API **Okarun System**

</div>

---

## 📸 Menu Principal

![Menu do Bot](https://res.cloudinary.com/wagurinuvem/image/upload/v1785035523/waguri/fotomenu_1785035522128_jpg_1785035522132_f4jita.jpg)

---

## ✨ Funcionalidades

- **285 comandos** organizados em categorias e carregados dinamicamente.
- **Sistema VIP** robusto com 5 planos e controle de limites e cooldowns diários.
- **Painel Web** administrativo com tema roxo/rosa, gráfico de uso de 14 dias, controle total de usuários, grupos, VIPs e logs em tempo real.
- **Design unificado** em todos os comandos para uma experiência visual padronizada e limpa.
- **Okarun System API** totalmente integrada para disponibilizar recursos e funcionalidades avançadas.
- **Banco de Dados SQLite** via `better-sqlite3` utilizando modo WAL para máxima velocidade e confiabilidade.
- **Administração de grupos** e comandos exclusivos de donos/administradores.

---

## 🚀 Instalação e Execução

### Requisitos Mínimos
- **Node.js** v20 ou superior.
- **Git** instalado para clonar e versionar.
- Compilação nativa para o `@boruto_vk7/better-sqlite3` (funciona nativamente inclusive no Termux).

### Passo a Passo de Instalação

1. **Clonar o Repositório:**
   ```bash
   git clone https://github.com/borutovk7/kaoruko.git
   cd kaoruko
   ```

2. **Instalar as Dependências:**
   ```bash
   npm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   Copie o arquivo `.env.example` para `.env` e preencha suas chaves:
   ```bash
   cp .env.example .env
   nano .env
   ```

4. **Verificar Diagnósticos e Tipos:**
   Você pode rodar testes rápidos de diagnóstico para validar sua configuração da API e estrutura do bot:
   ```bash
   npm run check    # Executa o diagnóstico completo do bot e conexão com a API
   npm run tipos    # Verifica a consistência de tipos (opcional)
   ```

5. **Iniciar o Bot:**
   * **Em Desenvolvimento (com recarregamento automático ao salvar):**
     ```bash
     npm run dev
     ```
   * **Em Produção:**
     ```bash
     npm start
     ```
   * **Gerenciamento em Segundo Plano (Produção Recomendado):**
     ```bash
     pm2 start index.js --name kaoruko
     ```

---

## 📋 Variáveis de Ambiente (.env)

| Variável | Descrição | Onde obter |
|---------|---------|------------|
| `BOT_TOKEN` | Token de acesso do seu bot | [@BotFather](https://t.me/BotFather) |
| `OKARUN_APIKEY` | Chave de autenticação da API Okarun | [Okarun System API](https://api.okarunsystem.com.br) |
| `BOT_OWNERS` | Lista de IDs de Telegram dos donos (separados por vírgula) | [@userinfobot](https://t.me/userinfobot) |
| `PAINEL_ADMIN_EMAIL` | Email administrativo padrão para primeiro acesso ao painel | Definir no `.env` |
| `PAINEL_ADMIN_SENHA` | Senha administrativa padrão para o painel | **Troque após o primeiro acesso** |
| `PAINEL_PORT` | Porta onde o painel web irá rodar | Padrão: `4091` |

---

## 🖥️ Painel Web & Administração de Contas

O painel é responsivo, dinâmico e oferece controle total das atividades do bot em tempo real.

### Segurança de Acesso
* Senhas criptografadas usando **PBKDF2-SHA512** com 120.000 iterações e *salt* individual por conta.
* Sessões seguras de 7 dias armazenadas em cookies do tipo **HttpOnly**.
* Bloqueio temporário de 15 minutos após 5 tentativas de login incorretas consecutivas.

### Comandos de Contas no Telegram (Exclusivo para Donos)
A conta de administrador definida no `.env` é gerada automaticamente na primeira inicialização. Você pode gerenciar as contas de acesso através do bot usando:

```text
/conta criar pessoa@email.com senha123 123456789  # Cria conta e vincula ao ID Telegram
/conta listar                                      # Lista as contas existentes
/conta senha pessoa@email.com novaSenha            # Altera a senha de uma conta
/conta vincular pessoa@email.com 123456789         # Vincula a conta a um ID de Telegram
/conta excluir pessoa@email.com                    # Remove uma conta do painel
```

Você também pode habilitar o registro público no site alterando a flag no seu `.env`:
`PAINEL_REGISTRO_ABERTO=true`

---

## 👑 Sistema VIP e Limites

Os limites diários de requisições de comandos são calculados diretamente no banco de dados e são redefinidos automaticamente à meia-noite (UTC). A limpeza rotineira dos dados e expiração dos planos VIPs ocorre diariamente às 03:00.

| Plano | Limite Diário | Cooldown entre Comandos |
|---|---|---|
| **Free** | 50 requisições | 5 segundos |
| **Bronze** | 150 requisições | 2 segundos |
| **Prata** | 400 requisições | 1 segundo |
| **Ouro** | 1.000 requisições | Sem cooldown |
| **Diamante** | Ilimitado | Sem cooldown |

### Comandos de Gerenciamento VIP (Exclusivo para Donos)
```text
/vip                             # Exibe o seu plano atual, histórico de VIP e uso diário
/addvip 123456789 ouro 30d       # Concede VIP Ouro por 30 dias para o ID correspondente
/addvip 123456789 diamante vitalicio # Concede VIP vitalício
/delvip 123456789                # Remove o plano VIP do usuário
/listvip                         # Lista todos os usuários VIP ativos
```

---

## 🛠️ Comandos Principais

### Menu e Informações
* `/menu` - Menu interativo principal do bot.
* `/ping` - Status de latência e conexão do bot com a API Okarun.
* `/vip` - Consulta de limites, planos e estatísticas do usuário.
* `/painel` - Retorna as informações e o link de acesso ao painel web.

### Downloads e Mídias
* `/play` - Pesquisa e download de músicas e vídeos do YouTube.
* `/tiktok` - Download de vídeos do TikTok sem marca d'água.
* `/instagram` - Download de reels e mídias do Instagram.
* `/ytmp3` / `/ytmp4` - Download direto de áudio ou vídeo do YouTube via link.

### Diversão (Mais de 70 comandos)
* `/dado`, `/escolher`, `/casal`, `/hacker`, `/sadboy` e diversos outros comandos divertidos de interação, memes e zoação.

### Logos e Textos Artísticos (146 comandos)
* Uma vasta gama de geradores de imagem com designs e efeitos de texto personalizados (ex: `/neon`, `/3dgold`, `/graffiti`).

### Inteligência Artificial
* `/ia`, `/ia2` - Assistentes conversacionais integrados.
* `/imagine`, `/animagine` - Geradores de imagens via IA.
* `/removebg` - Remove o fundo de imagens de forma automática.
* `/toanime`, `/tohd` - Filtros e melhorias de imagem.

---

## 🖼️ Design Unificado

Todos os comandos compartilham da mesma estrutura de design unificada para manter a coerência estética do bot:

```js
import { gerarHeader, gerarFooter } from '../utils/design.js';

export default async function comando(ctx) {
  ctx._startTime = Date.now();

  let texto = gerarHeader(ctx, 'TÍTULO');
  texto += `\n┃\n┃ Conteúdo aqui...`;
  texto += `\n┃\n${gerarFooter(ctx)}`;

  await ctx.sendTextWithMedia(ctx.botConfig.assets.headerImage, texto);
}
```

---

## 💻 Desenvolvimento de Novos Comandos

Criar novos comandos para o Kaoruko Waguri é extremamente simples. O sistema possui **autoload dinâmico por pasta**.

Basta criar um novo arquivo `.js` na respectiva subpasta de `commands/`. O nome do arquivo determinará o nome do comando e a subpasta definirá a categoria.

### Exemplo de Comando (`commands/pesquisa/clima.js`):
```js
import { requisitar, acharCampo } from '../../core/api.js';
import { escapeHtml } from '../../utils/helpers.js';

export const description = 'Clima de uma cidade';
export const aliases = ['tempo'];
export const uso = '/clima Manaus';
export const cooldown = 5;

/** @param {import('../../types/index.js').CommandContext} ctx */
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

### O que você tem disponível no `ctx` (Contexto do Comando):

| Categoria | Propriedades / Métodos Disponíveis |
|---|---|
| **Dados Recebidos** | `ctx.q`, `ctx.args`, `ctx.prefix`, `ctx.userId`, `ctx.chatId`, `ctx.nome`, `ctx.username`, `ctx.isGroup`, `ctx.isPrivate`, `ctx.respondida`, `ctx.waguri`, `ctx.botConfig` |
| **Envio de Mensagens** | `ctx.responder()`, `ctx.responderComApagar()`, `ctx.erro()`, `ctx.uso()`, `ctx.carregando()`, `ctx.enviarFoto()`, `ctx.enviarVideo()`, `ctx.enviarAudio()`, `ctx.enviarDocumento()`, `ctx.sendTextWithMedia()`, `ctx.react()` |
| **Permissões & Limites** | `ctx.isDono`, `ctx.isVip`, `ctx.plano`, `ctx.limite()`, `ctx.garantirAdmin()` |

---

## 📁 Estrutura de Diretórios

```
kaoruko/
├── .env                    # Configuração local (Ignorado pelo Git)
├── .env.example            # Exemplo de configuração limpa
├── .gitignore              # Arquivos e pastas ignorados no commit
├── LICENSE                 # Termos da Licença MIT
├── COPYRIGHT.md            # Direitos Autorais proprietários
├── index.js                # Arquivo de inicialização principal
├── jsconfig.json           # Auxiliar para autocompletes no editor
├── package.json            # Scripts e dependências do projeto
├── database/               # Pasta reservada para os bancos SQLite
├── types/
│   └── index.d.ts          # Definições de tipo para o Contexto (JSDoc)
├── config/
│   └── index.js            # Arquivo de carregamento de configurações
├── core/                   # Núcleo funcional e lógico do bot
├── commands/               # Autoload de Comandos (285 comandos)
│   ├── registry.js         # Registrador dinâmico de comandos
│   ├── download/
│   ├── ia/
│   ├── logos/
│   ├── diversao/
│   ├── pesquisa/
│   ├── dono/
│   └── info/
├── events/                 # Manipulação de eventos do Telegram (mensagens, callbacks)
├── painel/                 # Servidor Express e arquivos estáticos do Painel Web
└── utils/                  # Utilitários gerais (logger, auxiliares de texto e banner)
```

---

## 📜 Direitos Autorais

**© 2025-2026 Eduardo Develop**

* **Desenvolvedor e Dono Atual:** Eduardo Develop
* **Empresa:** Lagos Soluções
* **Criador da API:** Okarun System API (https://api.okarunsystem.com.br)

Este software é protegido por direitos autorais proprietários de Eduardo Develop. Veja os arquivos [LICENSE](LICENSE) e [COPYRIGHT.md](COPYRIGHT.md) para ler todos os detalhes de termos e restrições de uso.

---

## 📄 Licença

Este projeto está sob a licença **MIT** — veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

**Feito com ❤️ por Eduardo Develop**  
**Lagos Soluções • Okarun System API**

</div>
