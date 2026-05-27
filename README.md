# Lia

[![CI](https://github.com/Malnati/lia/actions/workflows/ci.yml/badge.svg)](https://github.com/Malnati/lia/actions/workflows/ci.yml)
[![Deploy frontend to GitHub Pages](https://github.com/Malnati/lia/actions/workflows/pages.yml/badge.svg)](https://github.com/Malnati/lia/actions/workflows/pages.yml)

**Lia** é um PWA offline-first para pedidos, retirada, entrega e pagamento de moldes para prótese dentária.

- Demo pública: <https://malnati.github.io/lia/>
- Repositório: <https://github.com/Malnati/lia>
- Frontend publicado no GitHub Pages: `apps/web`
- Backend preparado para VPS: `apps/api`

## Stack

- **Frontend:** React, Vite, TypeScript, PWA/service worker
- **Backend:** NestJS, TypeScript, MongoDB, Mongoose
- **Infra local:** Podman Compose com MongoDB
- **Deploy frontend:** GitHub Actions + GitHub Pages
- **Package manager:** pnpm

## Features do MVP

- Login Google representado na interface como placeholder de SSO.
- Cadastro e acompanhamento de pedidos de `Molde prótese`.
- Fluxo operacional com retirada check-in/check-out e entrega check-in/check-out.
- Fila de sincronização offline com ação de sincronizar.
- Status de pagamento com aviso: pagamento online depende de internet.
- API NestJS com healthcheck e endpoints iniciais de pedidos.

## Arquitetura

```text
lia/
├── apps/
│   ├── web/      # React PWA publicado em https://malnati.github.io/lia/
│   └── api/      # NestJS API para VPS ou ambiente local
├── compose.yaml  # MongoDB local via Podman
└── .github/workflows/
    ├── ci.yml
    └── pages.yml
```

O GitHub Pages publica apenas o frontend estático. A API não é exposta pelo Pages; ela deve rodar localmente ou em VPS e ser apontada pelo `VITE_API_URL` no build do frontend.

## Setup local

```bash
pnpm install
cp .env.example .env
cp apps/api/.env.example apps/api/.env
```

Antes de subir containers, confirme o runtime Podman:

```bash
podman info
podman compose up -d mongo
```

Rodar tudo em modo desenvolvimento:

```bash
pnpm dev
```

Rodar separadamente:

```bash
pnpm dev:web
pnpm dev:api
```

URLs locais padrão:

- Frontend: <http://localhost:5173/lia/>
- API: <http://localhost:3000/api>
- Healthcheck: <http://localhost:3000/api/health>

## Variáveis de ambiente

| Variável | Uso | Exemplo |
| --- | --- | --- |
| `PORT` | Porta da API NestJS | `3000` |
| `MONGODB_URI` | Conexão MongoDB | `mongodb://localhost:27017/lia` |
| `CORS_ORIGIN` | Origem permitida para o frontend local | `http://localhost:5173` |
| `VITE_API_URL` | URL pública/local da API consumida pelo React | `http://localhost:3000/api` |
| `GOOGLE_CLIENT_ID` | Futuro Google OAuth/SSO | vazio no scaffold |
| `PAYMENT_GATEWAY_PROVIDER` | Futuro gateway no Paraguai | `pagopar` |
| `PAYMENT_GATEWAY_PUBLIC_KEY` | Chave pública futura do gateway | vazio no scaffold |

## Scripts

```bash
pnpm lint      # typecheck dos apps
pnpm test      # testes unitários
pnpm build     # build API + frontend
pnpm build:web # build apenas do frontend para Pages
```

## Deploy no GitHub Pages

O workflow `.github/workflows/pages.yml` executa em push para `main` e publica `apps/web/dist`.

Configuração importante do Vite:

```ts
base: '/lia/'
```

URL esperada do Pages:

<https://malnati.github.io/lia/>

## Status do Pages

- Fonte: GitHub Actions workflow.
- Conteúdo publicado: somente frontend React PWA.
- Backend: fora do Pages; usar VPS ou ambiente local.

## Design

O conceito visual aprovado está versionado em [`docs/design/lia-concept.png`](docs/design/lia-concept.png).
