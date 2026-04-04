# Guia completo — Bee App + Webhook Contentful

Documentação em português: visão dos dois projetos, arquitetura, Contentful do zero, variáveis de ambiente, execução local e produção.

---

## 1. Visão geral

| Projeto | Função |
|--------|--------|
| **bee-app** | Site React (Vite): lista produtos do Contentful via GraphQL, idiomas (NL/EN/…), cartão com estoque e modal “avisar quando voltar ao estoque”. Ao inscrever o e-mail, **cria uma entrada** no Contentful (tipo *E-mail registration*) com referência ao produto. |
| **webhook-api-contentful-bees** | Backend Node/Express (local) ou **Vercel** (produção): recebe **webhook** do Contentful quando um **produto** é publicado. Se `inStock` for verdadeiro, busca inscrições daquele produto e envia **e-mail** (Gmail via Nodemailer), depois pode remover a inscrição. |

**Resumo do fluxo:** utilizador pede notificação → entrada *E-mail registration* no Contentful → quando o produto volta ao estoque e é **publicado**, o webhook dispara → o servidor envia os e-mails para quem se inscreveu naquele produto.

### 1.1 Como foi feito (resumo)

- **bee-app:** SPA com Vite e React; lista de produtos via **GraphQL** (token CDA); modal “avisar-me” grava no Contentful com **Management API** (token CMA). Textos e locales tratados com i18next; queries geradas a partir do ID do tipo de produto (`…Collection`).
- **webhook:** Servidor **Express** em desenvolvimento (`POST /webhook`) e **função serverless** na Vercel (`POST /api/vercelWebhook`) com a mesma regra de negócio; **Nodemailer** envia e-mail HTML; testes com **Jest**; utilitários para ler `inStock` e nomes em vários locales no payload do webhook.
- **Contentful:** modelo em dois tipos — **produto** (o webhook filtra por este tipo) e **E-mail registration** (referência ao produto + email). Os IDs API têm de bater com as variáveis `VITE_*` / `CONTENTFUL_*`.

---

## 2. Arquitetura (como se ligam)

```
Contentful (space único)
    │
    ├─ GraphQL (CDA) ──────────────► bee-app (VITE_* tokens de leitura)
    │
    ├─ Management API (CMA) ───────► bee-app cria entradas "E-mail registration"
    │                               (token de gestão no browser — ver segurança §11)
    │
    └─ Webhook HTTP (publish produto) ► webhook-api-contentful-bees
                                        (CMA: lista inscrições + envia e-mail)
```

- **Mesmo space** e **mesmos identificadores** de tipo de conteúdo (`beeeezzz`, `eMailRegistration`, etc.) nos dois `.env`.
- O webhook **não** usa o token de *Delivery*; usa **CMA** + Gmail.

---

## 3. Projeto bee-app (frontend)

### 3.1 Stack

- React 19, Vite 6, TypeScript, Tailwind, i18next.
- **graphql-request** → API GraphQL do Contentful (Content Delivery API).
- **Registo de e-mail:** `POST` à Management API (`registerEmailContentful` em `src/services/contentfulService.ts`).

### 3.2 O que o código assume (modelo de produto)

A query GraphQL usa a coleção **`{VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID}Collection`** — por exemplo `beeeezzzCollection` se o ID do tipo for `beeeezzz`.

Campos esperados no tipo **Produto** (API IDs devem existir no modelo):

- `productNameEnglish`, `productNameDutch`
- `descriptionEnglish`, `descriptionDutch`
- `inStock` (booleano)
- `image` → `url`

PT/DE podem existir no modelo; se não existirem, a app pode mapear a partir do inglês.

### 3.3 Variáveis de ambiente (bee-app)

Ficheiro: `.env` (não commitar). Ver `.env.example`.

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `VITE_CONTENTFUL_SPACE_ID` | Sim | ID do space (Settings → General). |
| `VITE_CONTENTFUL_ACCESS_TOKEN_DELIVERY_API` | Sim | Token **Content Delivery API** (só leitura pública/preview conforme configuração). Usado no GraphQL. |
| `VITE_CONTENTFUL_ACCESS_TOKEN_MANAGEMENT` | Sim | Token **Content Management API** (criar entradas de inscrição). |
| `VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID` | Recomendado | ID API do tipo *Produto* (ex.: `beeeezzz`). Se falhar, a query GraphQL não bate no campo certo. |
| `VITE_CONTENTFUL_EMAIL_REGISTRATION_CONTENT_TYPE_ID` | **Sim** para “avisar-me” | ID API do tipo *E-mail registration* (ex.: `eMailRegistration`). **Tem de ser `VITE_` — senão o Vite ignora.** |
| `VITE_CONTENTFUL_EMAIL_REGISTRATION_*_FIELD_ID` | Opcional | Só se os Field IDs em Contentful forem diferentes dos padrões (`email`, `language`, `relatedProduct`). |

**Comando:** `npm install` → `npm run dev` (geralmente `http://localhost:5173`).

---

## 4. Projeto webhook-api-contentful-bees (backend)

### 4.1 Stack

- Express (`api/localWebhook.ts`) na porta **3000**, rota `POST /webhook`.
- Produção: **Vercel** com `api/vercelWebhook.ts` (mesma lógica).
- Nodemailer (Gmail), `dotenv`, testes Jest.

### 4.2 Lógica do webhook

1. Contentful envia o corpo da **entrada publicada** (produto).
2. Se `inStock` **não** estiver verdadeiro → responde 200 e não envia e-mails.
3. Lê nomes NL/EN do payload.
4. **CMA:** lista entradas do tipo *E-mail registration* cuja referência ao produto é o `sys.id` do payload.
5. Envia um e-mail por inscrição (template em `locales/emailTemplates.json`), depois pode apagar a entrada (comportamento definido em `utils/utils.ts`).

### 4.3 Variáveis de ambiente (webhook)

| Variável | Obrigatório | Descrição |
|----------|-------------|-----------|
| `CONTENTFUL_SPACE_ID` | Sim | Mesmo space que o bee-app. |
| `CONTENTFUL_ACCESS_TOKEN_MANAGEMENT_API` | Sim | Token **CMA** (ler/eliminar inscrições). |
| `CONTENTFUL_EMAIL_REGISTRATION_CONTENT_TYPE_ID` | Sim | **Mesmo** identificador API que `VITE_CONTENTFUL_EMAIL_REGISTRATION_CONTENT_TYPE_ID` no bee-app. |
| `CONTENTFUL_EMAIL_RELATED_PRODUCT_FIELD_ID` | Opcional | Só se o campo de referência não se chamar `relatedProduct` (valor **só** o ID do campo, sem locale). |
| `EMAIL_USER` | Sim | Conta Gmail que envia. |
| `EMAIL_PASS` | Sim | **Palavra-passe de aplicação** Google (não a password normal). |

**Local:** `npm install` → `npm run dev` → `http://localhost:3000/webhook`.

---

## 5. Contentful — conta e space do zero

### 5.1 Criar conta e space

1. Aceder a [contentful.com](https://www.contentful.com) e criar conta (ou login).
2. **Create space** → nome (ex.: “Blank”) → escolher **Empty** ou template vazio.
3. Anotar **Space ID**: *Settings* (ícone da roda) → *General settings* → **Space ID**.

### 5.2 Tokens (API keys)

1. *Settings* → *API keys*.
2. **Content Delivery / Preview API** — criar ou usar chave existente; copiar **Content Delivery API — access token** → `VITE_CONTENTFUL_ACCESS_TOKEN_DELIVERY_API` (bee-app).
3. **Content management tokens** (ou *Settings* → *CMA tokens*): criar **Personal access token** com permissão para o space → usar no bee-app (`VITE_CONTENTFUL_ACCESS_TOKEN_MANAGEMENT`) e no webhook (`CONTENTFUL_ACCESS_TOKEN_MANAGEMENT_API`).  
   - Em produção, preferir variáveis no painel Vercel / servidor, nunca expor CMA no cliente em apps públicos (ver §11).

### 5.3 Ambiente

Por defeito usa-se **master**. O código aponta para `environments/master` nas URLs CMA. Webhooks filtram por `master` se configurado assim.

---

## 6. Modelo de conteúdo (content types)

### 6.1 Tipo *Produto* (ex.: API ID `beeeezzz`)

Criar em *Content model* → *Add content type*:

- **API identifier** (ID): ex. `beeeezzz` — este valor vai para `VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID`.
- Campos (tipos típicos):
  - Texto curto localizado: nomes e descrições EN/NL (os API IDs devem bater com o que está em `queries.ts`: `productNameEnglish`, `productNameDutch`, etc.).
  - Boolean localizado: `inStock`.
  - Referência média (Asset): `image`.

**GraphQL:** a coleção será `beeeezzzCollection` (nome do tipo + `Collection`).

### 6.2 Tipo *E-mail registration* (ex.: API ID `eMailRegistration`)

- **API identifier:** ex. `eMailRegistration` — **tem de ser igual** em:
  - `VITE_CONTENTFUL_EMAIL_REGISTRATION_CONTENT_TYPE_ID` (bee-app)
  - `CONTENTFUL_EMAIL_REGISTRATION_CONTENT_TYPE_ID` (webhook)
- Campos sugeridos:
  - **email** — texto curto (pode ser “Entry title”).
  - **language** (ou o Field ID que definir) — texto.
  - **Related product** — referência a **uma entrada**, tipo de conteúdo = o **Produto** acima. Field ID comum: `relatedProduct`.

Sem este tipo alinhado nos dois projetos, as inscrições não aparecem nas queries do webhook.

### 6.3 Locales

*Settings* → *Locales*. O código usa valores localizados (ex. `en-US`) em inscrições e lê locales no webhook. Garantir que **inglês** e **holandês** (ou os que usar) existem e que os campos do produto têm valores nesses locales.

---

## 7. Configuração passo a passo (associar tudo)

### 7.1 bee-app

1. Copiar `.env.example` → `.env`.
2. Preencher `VITE_CONTENTFUL_SPACE_ID`, tokens CDA e CMA, `VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID`, `VITE_CONTENTFUL_EMAIL_REGISTRATION_CONTENT_TYPE_ID`.
3. `npm install` && `npm run dev`.
4. Verificar se a grelha de produtos carrega. Testar “avisar quando em stock”: deve aparecer uma **nova entrada** em *Content* → tipo *E-mail registration*.

### 7.2 webhook (local + ngrok)

1. No repositório do webhook: `.env` com `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN_MANAGEMENT_API`, `CONTENTFUL_EMAIL_REGISTRATION_CONTENT_TYPE_ID`, Gmail.
2. `npm install` && `npm run dev` — o terminal deve mostrar `Server running on http://localhost:3000`.
3. Noutro terminal, expõe essa porta com **ngrok** (ver secção seguinte).
4. No Contentful, cria o webhook com a URL HTTPS do ngrok + `/webhook`.

#### O que é o ngrok

O Contentful precisa de um endereço **HTTPS público** para enviar o POST do webhook. No teu PC o servidor só escuta em `localhost:3000`, inacessível da internet. O **ngrok** cria um túnel: tráfego `https://xxxx.ngrok-free.app` → `http://localhost:3000`.

#### Instalar o ngrok

1. Criar conta gratuita em [ngrok.com](https://ngrok.com) e fazer login.
2. No painel, copiar o **authtoken** (necessário na primeira utilização).
3. Instalar o binário:
   - **macOS (Homebrew):** `brew install ngrok/ngrok/ngrok`
   - **Windows / Linux:** ver [downloads](https://ngrok.com/download) ou gestor de pacotes.
4. Registar o token (uma vez por máquina):

   ```bash
   ngrok config add-authtoken <TEU_TOKEN>
   ```

#### Correr o túnel

1. Garante que o webhook está a correr: `npm run dev` no projeto `webhook-api-contentful-bees` (porta **3000** — definida em `api/localWebhook.ts`).
2. Noutro terminal:

   ```bash
   ngrok http 3000
   ```

3. O ngrok mostra uma linha **Forwarding**, por exemplo:

   `https://a1b2-34-56-78-90.ngrok-free.app -> http://localhost:3000`

4. Copia só a parte **HTTPS** (não uses `http://127.0.0.1`).

#### URL a colar no Contentful

Junta o domínio do ngrok com a rota do Express:

```text
https://<subdominio>.ngrok-free.app/webhook
```

Exemplo: se o Forwarding for `https://abc123.ngrok-free.app`, o webhook fica:

`https://abc123.ngrok-free.app/webhook`

**Importante:** no código local a rota é `/webhook`; na Vercel em produção é `/api/vercelWebhook` — não misturar.

#### Configurar o webhook no Contentful

*Settings* → *Webhooks* → *Add webhook*:

| Campo | Valor típico |
|-------|----------------|
| **URL** | `https://<ngrok>/webhook` |
| **Nome** | Ex.: “Product In Stock (local)” |
| **Triggers** | Pelo menos **Publish** em **Entry** (para o produto voltar ao stock e publicar). |
| **Filters** | Content type = ID do **Produto** (ex. `beeeezzz`); environment = `master` (se usares master). |

Grava e publica um produto de teste para veres o pedido no terminal do Express e no [dashboard ngrok](https://dashboard.ngrok.com) (pedidos HTTP), se tiveres conta.

#### Limitações úteis a saber

- No **plano grátis**, o subdomínio **muda** cada vez que reinicias o ngrok (tens de atualizar a URL no Contentful ou usar um domínio reservado nos planos pagos).
- O primeiro acesso a URLs `*.ngrok-free.app` pode mostrar uma **página intermédia** do ngrok no browser; chamadas **servidor a servidor** (Contentful → ngrok) normalmente **não** são bloqueadas por isso.
- Se a porta não for 3000, usa `ngrok http <porta>` coerente com o `PORT` no código.

#### Alternativa ao ngrok

**Cloudflare Tunnel** (`cloudflared`), **localtunnel**, ou testar só em **produção** na Vercel com a URL `/api/vercelWebhook` — evita túnel local.

### 7.3 Produção (Vercel)

1. Deploy do repositório `webhook-api-contentful-bees` na Vercel.
2. Nas *Environment Variables*, definir as mesmas chaves que no `.env` local (nomes **sem** `VITE_`).
3. URL pública do handler na Vercel (ficheiro `api/vercelWebhook.ts`):  
   `https://<teu-projeto>.vercel.app/api/vercelWebhook`  
   (exemplo público antigo no README do webhook: `webhook-api-contentful-bees.vercel.app`.)
4. No Contentful, o webhook deve usar **essa** URL completa (com `/api/vercelWebhook`), não a rota local `/webhook` do Express.

---

## 8. Adicionar um novo produto

1. *Content* → *Add entry* → escolher o tipo **Produto** (`beeeezzz` ou o ID que configurou).
2. Preencher nomes, descrições, imagem, **inStock** (ex. `false` se quiser testar “avisar-me”).
3. **Publish** (o site GraphQL só vê conteúdo publicado com o token CDA configurado).
4. Para testar e-mails: pôr produto **fora de stock**, inscrever pelo site, depois editar produto **inStock = true** e **Publish** de novo → o webhook deve correr e enviar e-mails.

---

## 9. Fluxo “avisar-me” até ao e-mail

1. Utilizador submete e-mail no bee-app → **POST** CMA cria entrada *E-mail registration* com link para o `productId`.
2. Gestor (ou tu) altera o produto para em stock e **publica**.
3. Contentful chama o URL do webhook com o JSON da entrada produto.
4. Servidor confirma `inStock`, busca inscrições com aquele `productId`, envia e-mails.

Se não houver inscrições, a resposta JSON indica fila 0 — comportamento normal.

---

## 10. Problemas frequentes

| Sintoma | Causa provável |
|--------|----------------|
| Grelha vazia / erro GraphQL | `VITE_CONTENTFUL_PRODUCT_CONTENT_TYPE_ID` errado; campos com API IDs diferentes; produtos em rascunho. |
| Inscrição não cria entrada | `VITE_CONTENTFUL_EMAIL_REGISTRATION_CONTENT_TYPE_ID` em falta ou **sem prefixo `VITE_`**; Field IDs errados; token CMA inválido. |
| Webhook 200 mas 0 e-mails | Nenhuma entrada *E-mail registration* para esse `productId`; tipo de conteúdo ID diferente entre app e webhook. |
| Webhook não dispara | Filtro de content type no webhook não bate com o tipo publicado; URL/ngrok errado; evento não é Publish. |
| E-mail não chega | `EMAIL_USER` / `EMAIL_PASS`; Gmail a bloquear “apps menos seguras” — usar **app password**. |

---

## 11. Segurança (importante)

- O bee-app usa **CMA no browser** para criar inscrições: é simples para protótipos, mas **expõe o token de gestão** a quem usa o site. Para produção séria, o ideal é um **endpoint no servidor** (ex. função serverless) que recebe o e-mail e cria a entrada com o CMA só no backend.
- Nunca commitar `.env` com tokens reais; usar `.gitignore` e variáveis nos serviços (Vercel, etc.).

---

## 12. Comandos rápidos

| Onde | Comando |
|------|---------|
| bee-app | `npm run dev` · `npm run build` · `npm test` |
| webhook | `npm run dev` · `npm test` · `npm run deploy` (Vercel CLI) |

---

## 13. Estrutura de pastas (referência)

- **bee-app:** `src/services/contentfulService.ts` (produtos + registo), `src/services/graphqlClient.ts`, `src/components/Card.tsx`, `src/pages/HomePage/`.
- **webhook:** `api/localWebhook.ts`, `api/vercelWebhook.ts`, `utils/utils.ts`, `utils/contentfulWebhookFields.ts`.

---

*Última atualização: documentação alinhada ao código dos repositórios bee-app e webhook-api-contentful-bees.*
