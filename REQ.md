# REQ — Lia

## Origem

Exportado desta conversa em 2026-05-27.

Link de referência inicial: <https://chatgpt.com/share/6a16552b-9da0-83e9-be3f-51058ccc2eec>

## Visão do produto

**Lia** é um app Mobile PWA, offline-first, para prestação de serviço no Paraguai relacionado a **moldes para prótese dentária**.

O app deve permitir cadastro de clientes, criação e acompanhamento de pedidos, check-in/check-out de recolhimento no local, check-in/check-out de entrega e cobrança via gateway de pagamento. O frontend será publicado no GitHub Pages; o backend fica preparado para VPS.

## Stack definida

- Monorepo com `pnpm`.
- Frontend: React + Vite + TypeScript + PWA.
- Backend: NestJS + MongoDB + Mongoose.
- Infra local: Podman Compose com MongoDB.
- Deploy frontend: GitHub Actions + GitHub Pages.
- URL pública: <https://malnati.github.io/lia/>
- Repo: <https://github.com/Malnati/lia>

## Requisitos funcionais

### Frontend PWA

- Deve ser mobile-first.
- Deve usar `base: "/lia/"` no Vite para compatibilidade com GitHub Pages.
- Deve oferecer interface inicial com:
  - pedidos;
  - novo pedido;
  - retirada;
  - entrega;
  - sincronização offline;
  - status de pagamento;
  - painel desktop/admin simples.
- Deve exibir fila de sincronização offline.
- Deve deixar claro que pagamento online requer conexão com internet.
- Deve incluir manifest PWA e service worker básico.
- Deve funcionar publicado em `https://malnati.github.io/lia/`.

### Backend NestJS

- Deve expor API sob prefixo `/api`.
- Deve conectar ao MongoDB usando `MongooseModule.forRootAsync`.
- Deve usar `ConfigModule` para variáveis de ambiente.
- Deve ter CORS configurável por `CORS_ORIGIN`.
- Deve ter validação global via `ValidationPipe`.
- Endpoints mínimos:
  - `GET /api/health`
  - `GET /api/orders`
  - `POST /api/orders`
  - `PATCH /api/orders/:id/status`

### Modelo inicial de pedido

Campos esperados:

- cliente;
- telefone;
- endereço de entrega;
- produto, inicialmente `Molde prótese`;
- status do pedido;
- status de pagamento;
- checkpoints operacionais;
- flag de sincronização pendente;
- observações.

Status inicial planejado:

- `draft`
- `awaiting_payment`
- `paid`
- `pickup_scheduled`
- `picked_up`
- `in_production`
- `ready_for_delivery`
- `delivery_scheduled`
- `delivered`
- `cancelled`

Checkpoints operacionais:

- retirada check-in;
- retirada check-out;
- entrega check-in;
- entrega check-out.

## Requisitos não funcionais

- O backend não deve ser publicado no GitHub Pages.
- O GitHub Pages deve publicar apenas `apps/web/dist`.
- A API deve estar pronta para rodar localmente ou em VPS.
- O projeto deve ser validado com:
  - `pnpm lint`;
  - `pnpm test`;
  - `pnpm build`.
- Antes de qualquer container, executar `podman info`.
- Usar Podman/Podman Desktop, não Docker Desktop.
- Não depender de instalação global de pacotes Python.

## GitHub Pages

Workflow esperado:

- `.github/workflows/pages.yml`
- Trigger em push para `main`.
- Build apenas de `apps/web`.
- Deploy via Actions oficiais:
  - `actions/configure-pages@v6`
  - `actions/upload-pages-artifact@v5`
  - `actions/deploy-pages@v5`

Configuração do Pages:

- `build_type: workflow`
- URL: <https://malnati.github.io/lia/>
- HTTPS enforced.

## Metadados GitHub definidos

Descrição:

> Lia — PWA offline-first para pedidos, retirada, entrega e pagamento de moldes para prótese dentária.

Homepage:

<https://malnati.github.io/lia/>

Topics:

- `react`
- `vite`
- `typescript`
- `pwa`
- `offline-first`
- `nestjs`
- `mongodb`
- `mongoose`
- `github-pages`
- `dental-prosthetics`
- `paraguay`
- `payment-gateway`
- `logistics`

## Resultado implementado nesta conversa

Commit criado e enviado:

```text
4a1f638 feat: scaffold lia pwa and api
```

Arquivos principais criados:

```text
apps/web/
apps/api/
.github/workflows/ci.yml
.github/workflows/pages.yml
compose.yaml
.env.example
pnpm-workspace.yaml
package.json
README.md
docs/design/lia-concept.png
```

Validações feitas:

- `pnpm install` concluído.
- `pnpm lint` passou.
- `pnpm test` passou.
- `pnpm build` passou.
- `podman info` passou após iniciar Podman Desktop.
- `podman compose up -d mongo` passou.
- API validada:
  - `GET /api/health`
  - `GET /api/orders`
  - `POST /api/orders`
- Frontend validado no Browser/IAB:
  - preview local `/lia/`;
  - viewport mobile;
  - GitHub Pages publicado.
- GitHub Actions:
  - CI: success;
  - Deploy frontend to GitHub Pages: success.

## Decisões e assumptions

- OAuth Google fica como placeholder inicial.
- Gateway de pagamento real fica fora do scaffold inicial.
- Pagamento não deve funcionar offline.
- Fluxos offline cobrem dados operacionais, pedidos, fotos/assinaturas futuramente e fila de sincronização.
- Backend será publicado futuramente em VPS ou outro host, não no GitHub Pages.
- O frontend deve aceitar `VITE_API_URL` para apontar para a API real.

## Próximos passos recomendados

1. Implementar autenticação Google OAuth real.
2. Persistir fila offline com IndexedDB/Dexie.
3. Conectar frontend à API real usando `VITE_API_URL`.
4. Implementar upload/compactação de fotos e assinatura do cliente.
5. Escolher gateway no Paraguai: Pagopar ou Bancard vPOS.
6. Criar deploy da API na VPS com HTTPS e backups do MongoDB.
7. Adicionar roles: admin, técnico, laboratório e cliente.

## Atualização de escopo — 2026-05-27

- O repositório `Malnati/lia` passa a ser frontend-only para GitHub Pages.
- O backend real foi transferido para `/Users/mal/GitHub/malnati/lia-backend` e para o repositório `Malnati/lia-backend`.
- Até segunda ordem, o frontend deve usar somente `VITE_API_MODE=mock` no GitHub Pages.
- Este repositório não deve conter `apps/api`, `compose.yaml`, MongoDB local ou dados de backend.
