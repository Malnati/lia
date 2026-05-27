# Lia

[![CI](https://github.com/Malnati/lia/actions/workflows/ci.yml/badge.svg)](https://github.com/Malnati/lia/actions/workflows/ci.yml)

**Lia** é o portal integrador da plataforma white-label para pedidos, produção, retirada, entrega, anexos, pagamentos e administração de próteses dentárias.

- Domínio oficial alvo: <https://aneety.com/>
- API real alvo: <https://api.aneety.com/>
- Core: <https://core.aneety.com/>
- PWA mobile: <https://pwa.aneety.com/>
- Desktop operacional: <https://desktop.aneety.com/>
- Dashboard administrativo: <https://dashboard.aneety.com/>
- Requisitos versionados: [`REQ.md`](REQ.md)

> Decisão vigente: Cloudflare Pages Free para frontends estáticos, Cloudflare Workers Free + Hono para API, Supabase/Postgres Free para base real. Não usar NestJS, VPS, Render, MongoDB ou mock browser-side como arquitetura alvo.

## Arquitetura alvo

- `Malnati/lia`: portal integrador em `aneety.com` e fonte do contrato `REQ.md`.
- `Malnati/lia-backend`: API Worker + Hono em `api.aneety.com`.
- `Malnati/lia-core`: contratos ESM, roles, permissões e cliente comum em `core.aneety.com`.
- `Malnati/lia-pwa`: PWA mobile/offline-first em `pwa.aneety.com`.
- `Malnati/lia-desktop`: app operacional desktop em `desktop.aneety.com`.
- `Malnati/lia-dashboard`: administrativo com CRUD usuários/perfis em `dashboard.aneety.com`.

## Stack

- **Portal/frontends:** React, Vite, TypeScript e Cloudflare Pages Free.
- **API:** Cloudflare Workers Free + Hono.
- **Banco:** Supabase/Postgres Free.
- **Auth:** Supabase Auth + RLS.
- **Segredos:** somente `.env` local ou Cloudflare secrets; nunca Git/frontend.

## Estado atual

Este repositório ainda contém o PWA legado com persistência browser-side para preservar histórico e validações existentes enquanto os repos separados assumem a implementação real. Qualquer menção a mock/Pages antigo é dívida de migração, conforme [`REQ.md`](REQ.md).

## Prints das telas

Os prints abaixo são do PWA legado e devem ser regenerados quando houver mudança visual. Esta mudança alterou arquitetura/domínios/configuração, não layout.

### App mobile PWA

![Lia PWA em viewport mobile com white-label, consultórios, produção, fila offline e pedidos](docs/screenshots/lia-mobile.png)

### Painel desktop/admin

![Lia painel desktop/admin com white-label, consultórios, produção, checkpoints, pagamento mock e anexos offline](docs/screenshots/lia-desktop.png)

### Tela legado de adapter local

![Lia adapter local legado com export JSON e fila local pendente](docs/screenshots/lia-mock-backend.png)

## Guias de usuário

- [Guia mobile/PWA](docs/MOBILE.md)
- [Guia desktop/admin](docs/DESKTOP.md)

## Setup local

```bash
pnpm install
cp .env.example .env
pnpm dev
```

URLs locais padrão:

- Portal/PWA legado: <http://localhost:5173/>

## Variáveis de ambiente

| Variável | Uso | Segurança |
| --- | --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Deploy local Cloudflare | local/secret |
| `CLOUDFLARE_API_TOKEN` ou `CLOUDFLARE_KEY` | Deploy local Cloudflare | secret |
| `SUPABASE_URL` | Projeto Supabase | público |
| `SUPABASE_ANON_KEY` | Frontends Supabase Auth/RLS | público |
| `SUPABASE_SERVICE_ROLE_KEY` | Worker/admin only | secret backend |
| `VITE_API_URL` | API pública | `https://api.aneety.com` |
| `VITE_PUBLIC_BASE_PATH` | Base Vite | `/` para Cloudflare Pages |

## Scripts

```bash
pnpm lint               # typecheck do portal/PWA legado
pnpm test               # testes unitários
pnpm build              # build local padrão
pnpm build:cloudflare   # build para Cloudflare Pages em aneety.com
pnpm deploy:cloudflare  # deploy local para Cloudflare Pages Free
pnpm test:e2e           # Playwright contra URL publicada em PLAYWRIGHT_BASE_URL ou aneety.com
```

## Deploy Cloudflare Pages Free

Usar credenciais locais de `/Users/mal/GitHub/malnati/lia/.env` sem imprimir valores:

```bash
set -a; . ./.env; set +a
export CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN:-$CLOUDFLARE_KEY}"
pnpm deploy:cloudflare
```

Projeto Cloudflare Pages esperado: `lia`.
Domínio esperado: `https://aneety.com/`.

## Segurança

- `.env` é ignorado pelo Git.
- `SUPABASE_SERVICE_ROLE_KEY` nunca deve entrar em bundle frontend.
- Se `SUPABASE_URL` ou keys reais faltarem, bloquear deploy real e implementar apenas scaffolds, docs, tipos e testes.

## E2E publicado

```bash
PLAYWRIGHT_BASE_URL=https://aneety.com/ pnpm test:e2e
```

E2E nunca deve usar localhost como alvo final.
