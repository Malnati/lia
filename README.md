# Lia

[![CI](https://github.com/Malnati/lia/actions/workflows/ci.yml/badge.svg)](https://github.com/Malnati/lia/actions/workflows/ci.yml)
[![Deploy frontend to GitHub Pages](https://github.com/Malnati/lia/actions/workflows/pages.yml/badge.svg)](https://github.com/Malnati/lia/actions/workflows/pages.yml)

**Lia** é um PWA offline-first para pedidos, retirada, entrega, anexos e pagamento mock de moldes para prótese dentária.

- Demo pública: <https://malnati.github.io/lia/>
- Mock backend browser-side: <https://malnati.github.io/lia/mock/>
- Repositório frontend: <https://github.com/Malnati/lia>
- Repositório backend separado: <https://github.com/Malnati/lia-backend>
- Frontend publicado no GitHub Pages: `apps/web`
- Requisitos versionados: [`REQ.md`](REQ.md)

> Até segunda ordem, este repositório é **frontend-only** e o GitHub Pages usa **somente mock browser-side**. O backend real foi movido para `/Users/mal/GitHub/malnati/lia-backend`.

## Stack

- **Frontend:** React, Vite, TypeScript, PWA/service worker, Dexie/IndexedDB
- **Mock backend:** adapter JavaScript interno persistido em IndexedDB
- **Deploy frontend:** GitHub Actions + GitHub Pages
- **Package manager:** pnpm

## Features do MVP

- Cadastro e acompanhamento de pedidos de `Molde prótese` com formulário real.
- Views funcionais para **Pedidos**, **Novo pedido**, **Retirada**, **Entrega** e **Sync**.
- Operação inicial **Lia** configurada em camada white-label com nome, textos e cores por tenant.
- Admin mock para **Consultórios** que pedem próteses e produzem moldes.
- Admin mock para **Produção** da empresa de próteses e prontidão de entrega.
- Fluxo operacional com retirada check-in/check-out e entrega check-in/check-out.
- Fila de sincronização offline persistida no IndexedDB.
- Mock backend estático/browser-side para GitHub Pages e desenvolvimento frontend sem API real.
- Deep link direto para `/lia/mock/` no GitHub Pages.
- Edição local de pedidos, anexos de foto compactada e assinatura do cliente via canvas.
- Pagamento online em modo abstração/mock; integração real Pagopar/Bancard fica no backend separado.

## Prints das telas

Os prints abaixo devem ser regenerados sempre que houver implementação ou correção visual.

### App mobile PWA

![Lia PWA em viewport mobile com white-label, consultórios, produção, fila offline e pedidos](docs/screenshots/lia-mobile.png)

### Painel desktop/admin

![Lia painel desktop/admin com white-label, consultórios, produção, checkpoints, pagamento mock e anexos offline](docs/screenshots/lia-desktop.png)

### Mock backend no GitHub Pages

![Lia mock backend browser-side com export JSON e fila local pendente](docs/screenshots/lia-mock-backend.png)

## Guias de usuário

- [Guia mobile/PWA](docs/MOBILE.md)
- [Guia desktop/admin](docs/DESKTOP.md)

## Arquitetura

```text
lia/
├── apps/
│   └── web/      # React PWA publicado em https://malnati.github.io/lia/
└── .github/workflows/
    ├── ci.yml
    └── pages.yml
```

O GitHub Pages publica apenas o frontend estático. Como Pages não executa backend, o modo padrão do build público é `VITE_API_MODE=mock`, que usa IndexedDB no navegador como mock backend.

## Setup local

```bash
pnpm install
cp .env.example .env
pnpm dev
```

URLs locais padrão:

- Frontend: <http://localhost:5173/lia/>
- Mock admin local: <http://localhost:5173/lia/mock/>

## Variáveis de ambiente

| Variável | Uso | Exemplo |
| --- | --- | --- |
| `VITE_API_MODE` | Adapter do frontend; manter `mock` neste repo até segunda ordem | `mock` |

## Scripts

```bash
pnpm lint      # typecheck do frontend
pnpm test      # testes unitários do frontend
pnpm build     # build do frontend + fallback Pages /mock/
pnpm test:e2e  # Playwright contra GitHub Pages publicado
pnpm build:web # build do frontend para Pages
pnpm preview:web
```

## Mock browser-side

O mock não usa MSW em produção para não conflitar com o service worker PWA. Ele é um adapter JavaScript interno que persiste dados em IndexedDB:

- `orders`
- `syncQueue`
- `attachments`
- `mockBackend`

A subpágina `/lia/mock/` mostra modo ativo, export JSON, reset de seed e fila local pendente. O build gera `mock/index.html` e `404.html` para manter o deep link funcionando no GitHub Pages.

A fila preserva dependências básicas: criação de pedido roda antes de atualizações, checkpoints, anexos e pagamento quando itens têm o mesmo timestamp. O mock rejeita criação de pedido com `customerName`, `customerPhone` ou `deliveryAddress` em branco, checkpoint sem `checkpointKey`, operação de sincronização desconhecida e intenção de pagamento para pedido inexistente. Se uma fila corrompida tiver payload inválido, operação inválida ou referenciar pedido inexistente, a sincronização mantém o item pendente, incrementa tentativas e exibe o erro em **Sync**.

## White-label e telas administrativas

A operação inicial fica configurada em `apps/web/src/config/tenant.ts`. Essa camada concentra nome da operação, marca, textos principais e cores para permitir futuras marcas/tenants sem acoplar os fluxos centrais ao nome Lia.

As telas **Consultórios** e **Produção** usam dados do mock browser-side para dar visibilidade a:

- consultórios/clientes que pedem próteses;
- moldes em produção;
- pipeline da empresa de próteses;
- próteses prontas para entrega.

## Backend real

O backend NestJS foi separado para o projeto [`lia-backend`](https://github.com/Malnati/lia-backend) em `/Users/mal/GitHub/malnati/lia-backend`.

Este repo não contém mais API, MongoDB, compose local nem dados de backend.

## E2E contra GitHub Pages

Os testes Playwright ficam em `tests/e2e/` e devem chamar sempre o app publicado:

```bash
PLAYWRIGHT_BASE_URL=https://malnati.github.io/lia/ pnpm test:e2e
```

O workflow de Pages executa E2E após o deploy usando a URL publicada pelo próprio GitHub Pages. Não use localhost para E2E.

Alterações em `tests/e2e/` ou `playwright.config.ts` também disparam o workflow de Pages, garantindo que correções de cobertura sejam validadas contra o app publicado.

## Deploy no GitHub Pages

O workflow `.github/workflows/pages.yml` executa em push para `main` e publica `apps/web/dist` com:

```env
VITE_API_MODE=mock
```

Configuração importante do Vite:

```ts
base: '/lia/'
```

URL esperada do Pages:

<https://malnati.github.io/lia/>

## Status do Pages

- Fonte: GitHub Actions workflow.
- Conteúdo publicado: somente frontend React PWA.
- Backend: fora deste repo e fora do Pages.
- Mock: browser-side/IndexedDB até segunda ordem.

## Design

O conceito visual aprovado está versionado em [`docs/design/lia-concept.png`](docs/design/lia-concept.png).
