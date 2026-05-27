# REQ — Lia

## Origem

Exportado e atualizado nesta conversa em 2026-05-27.

Link de referência inicial: <https://chatgpt.com/share/6a16552b-9da0-83e9-be3f-51058ccc2eec>

## Regra central

`REQ.md` é a fonte de verdade da plataforma Lia. Em caso de divergência entre código, README, automações, testes ou deploys, este arquivo prevalece.

A decisão vigente substitui o escopo antigo mock-first/MongoDB: **Lia deve evoluir para Supabase/Postgres real, Supabase Auth, API NestJS publicada em VPS HTTPS e frontends separados por repositório**. O termo “mock backend” não deve ser usado para a base principal daqui em diante.

## Visão do produto

**Lia** é uma plataforma white-label para operação de pedidos de prótese dentária no Paraguai, cobrindo:

- pedidos feitos por consultórios, clínicas e bureaus;
- produção de moldes por consultórios ou equipes associadas;
- produção de próteses por laboratórios/bureaus;
- retirada, entrega e rastreio operacional;
- pagamento online;
- administração de usuários, perfis, permissões, tenants e operação.

A operação inicial é Lia, mas a plataforma deve permitir configuração por tenant/marca, sem acoplar os fluxos centrais ao nome Lia.

## Repositórios e responsabilidades

| Repositório | URL pública | Responsabilidade |
| --- | --- | --- |
| `Malnati/lia` | <https://malnati.github.io/lia/> | Portal integrador, contrato `REQ.md`, navegação entre apps, status público e documentação de arquitetura. |
| `Malnati/lia-backend` | API em VPS HTTPS; Pages opcional para docs/status | API NestJS real conectada ao Supabase/Postgres. Não é mock. |
| `Malnati/lia-core` | <https://malnati.github.io/lia-core/> | ESM estático com tipos, validações, tenants, roles, permissões e cliente compartilhado. |
| `Malnati/lia-pwa` | <https://malnati.github.io/lia-pwa/> | PWA mobile/offline-first para operação em campo. |
| `Malnati/lia-desktop` | <https://malnati.github.io/lia-desktop/> | App desktop operacional para atendimento, produção e logística. |
| `Malnati/lia-dashboard` | <https://malnati.github.io/lia-dashboard/> | Administrativo para consultórios, clínicas e bureau; CRUD usuários/perfis. |

Todos os repositórios devem ser clonados em `/Users/mal/GitHub/malnati`.

## Stack alvo

- Package manager: `pnpm`.
- Frontends: React + Vite + TypeScript.
- PWA: mobile-first, offline-first, service worker e IndexedDB para fila local.
- Core: ESM estático publicado via GitHub Pages.
- Backend: NestJS + TypeScript.
- Banco real: Supabase/Postgres.
- Autenticação: Supabase Auth.
- Autorização: Row-Level Security no Supabase + validação de permissões no backend.
- Anexos: Supabase Storage, bucket `order-attachments`.
- Deploy frontend/core/portal: GitHub Actions + GitHub Pages.
- Deploy API: VPS HTTPS.
- Segredos: service role e JWT secret apenas em backend/secrets; nunca em frontend ou Git.

## Atores envolvidos

- Operadores de produção de modelos/moldes: dentistas, assistentes, enfermeiros e operadores de consultório.
- Operadores de produção de próteses: protéticos, assistentes e operadores de bureau/laboratório.
- Entregadores: Uber, mototáxi, Bolt, independentes, privados ou exclusivos.
- Administradores: donos de consultórios, clínicas e bureau.
- Administrador de plataforma: gestão global de tenants, perfis e configuração.

## Roles e permissões mínimas

Roles iniciais:

- `model_production_operator`
- `prosthesis_production_operator`
- `delivery_operator`
- `clinic_admin`
- `bureau_admin`
- `platform_admin`

Permissões mínimas:

- pedidos: criar, listar, editar, cancelar;
- checkpoints: registrar retirada/entrega/check-in/check-out;
- anexos: enviar, listar e baixar fotos/assinaturas;
- pagamentos: criar intenção, consultar status e conciliar;
- usuários: criar, listar, editar, ativar/inativar;
- perfis: criar, listar, editar e associar permissões;
- tenants: configurar marca, cores, textos e operação;
- dashboard: visualizar métricas administrativas conforme perfil.

## Modelo de dados Postgres inicial

Tabelas mínimas no Supabase/Postgres:

- `tenants`
- `access_profiles`
- `app_users`
- `orders`
- `order_checkpoints`
- `attachments`
- `payment_intents`
- `sync_events`

Requisitos de modelagem:

- Todas as tabelas operacionais devem ter `tenant_id`.
- `app_users` deve referenciar `auth.users`.
- Chaves primárias devem usar UUID.
- Datas devem usar `timestamptz`.
- Índices obrigatórios para `tenant_id`, status operacional, status de pagamento, responsáveis e datas de atualização.
- RLS deve impedir acesso cross-tenant.
- Policies devem diferenciar leitura/escrita administrativa e operacional.

## API NestJS alvo

Prefixo global: `/api`.

Endpoints mínimos:

- `GET /api/health`
- `GET /api/db/health`
- `GET /api/orders`
- `POST /api/orders`
- `PATCH /api/orders/:id`
- `PATCH /api/orders/:id/status`
- `PATCH /api/orders/:id/checkpoints/:checkpointKey`
- `POST /api/orders/:id/attachments`
- `GET /api/orders/:id/attachments`
- `GET /api/orders/:id/attachments/:attachmentId/file`
- `POST /api/orders/:id/payment-intents`
- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`
- `GET /api/access-profiles`
- `POST /api/access-profiles`
- `PATCH /api/access-profiles/:id`

Regras:

- Frontends devem autenticar com Supabase Auth.
- Frontends chamam API NestJS usando `VITE_API_URL`.
- API valida JWT Supabase e permissões.
- API usa chave segura apenas no backend para operações privilegiadas.
- API deve validar CORS por ambiente.

## Frontend PWA (`lia-pwa`)

Requisitos:

- Mobile-first.
- Offline-first para operação em campo.
- Fila local em IndexedDB para pedidos, checkpoints, anexos e pagamentos pendentes.
- Sincronização com API real quando online.
- Login Supabase.
- Views mínimas: pedidos, novo pedido, retirada, entrega, anexos, pagamento, sync e perfil.
- Pagamento online deve deixar claro que requer conexão.
- E2E deve rodar contra URL pública do Pages e API real/staging quando disponível.

## Frontend desktop (`lia-desktop`)

Requisitos:

- App operacional desktop para atendimento, produção e logística.
- Login Supabase.
- Listagem e edição de pedidos.
- Checkpoints de produção de molde, produção de prótese, retirada e entrega.
- Upload/consulta de anexos.
- Integração via `lia-core` e API NestJS.

## Dashboard (`lia-dashboard`)

Requisitos:

- Administrativo para consultórios, clínicas e bureau.
- Login Supabase.
- CRUD de usuários.
- CRUD de perfis de acesso.
- Associação usuário ↔ perfil ↔ tenant.
- Controle de status ativo/inativo.
- Métricas por tenant e operação.
- Personalização white-label de marca, cores, textos e operação.

## Core (`lia-core`)

Deve publicar ESM estático com:

- tipos de domínio;
- roles e permissões;
- validações comuns;
- config de tenants;
- cliente HTTP comum para API;
- helpers de status, pagamento e checkpoints;
- contratos de erro compartilhados.

## White-label

- Nome, marca, cores, logo e textos principais devem ser configuráveis por tenant.
- Lia é o primeiro tenant.
- Fluxos centrais devem permanecer genéricos para consultórios, produção de moldes, produção de próteses e logística.
- O dashboard deve permitir gerir a configuração visual por tenant.

## Status de pedido planejados

- `draft`
- `awaiting_payment`
- `paid`
- `pickup_scheduled`
- `picked_up`
- `in_model_production`
- `model_ready`
- `in_prosthesis_production`
- `prosthesis_ready`
- `ready_for_delivery`
- `delivery_scheduled`
- `delivered`
- `cancelled`

## Checkpoints operacionais

- retirada check-in;
- retirada check-out;
- produção de molde início;
- produção de molde conclusão;
- produção de prótese início;
- produção de prótese conclusão;
- entrega check-in;
- entrega check-out.

## Requisitos não funcionais

- O backend real não deve ser publicado no GitHub Pages como runtime; Pages do backend pode conter apenas docs/status estático.
- GitHub Pages deve publicar apenas artefatos estáticos.
- API real deve rodar em VPS com HTTPS.
- Antes de qualquer container local, executar `podman info`.
- Usar Podman/Podman Desktop, não Docker Desktop.
- Não depender de instalação global de pacotes Python.
- Supabase secrets não podem ser commitados.
- Service role nunca pode ser exposta nos frontends.

## Variáveis de ambiente

Frontends:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

Backend:

- `PORT`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `CORS_ORIGIN`
- `PAYMENT_GATEWAY_PROVIDER`

## GitHub Pages

Workflow esperado por repo estático:

- Trigger em push para `main`.
- Build do app/core correspondente.
- Deploy via Actions oficiais:
  - `actions/configure-pages@v6`
  - `actions/upload-pages-artifact@v5`
  - `actions/deploy-pages@v5`

URLs esperadas:

- <https://malnati.github.io/lia/>
- <https://malnati.github.io/lia-core/>
- <https://malnati.github.io/lia-pwa/>
- <https://malnati.github.io/lia-desktop/>
- <https://malnati.github.io/lia-dashboard/>

## Validação obrigatória

Por repo alterado:

- `pnpm lint`
- `pnpm test`
- `pnpm build`

Backend/Supabase:

- migrations aplicadas;
- RLS habilitado;
- policies testadas;
- `GET /api/health` OK;
- `GET /api/db/health` OK;
- JWT ausente/inválido retorna 401;
- usuário sem permissão retorna 403;
- isolamento cross-tenant comprovado.

E2E publicado:

- portal abre todos os links;
- login Supabase;
- CRUD usuários/perfis;
- criar pedido;
- sincronizar PWA offline para API/Postgres;
- atualizar checkpoints desktop;
- anexar foto/assinatura;
- criar intenção de pagamento;
- validar persistência via API.

## Monitoramento recorrente

O monitoramento deve:

1. Ler este `REQ.md` em todo ciclo.
2. Validar repos locais e remotos.
3. Comparar requisitos com código, docs, workflows, Pages e API.
4. Priorizar lacunas de arquitetura antes de novos E2E.
5. Não declarar 100% sem evidência objetiva.
6. Se faltarem secrets/projeto Supabase/VPS, registrar bloqueio objetivo e implementar apenas partes sem segredo: REQ, scaffolds, migrations SQL, tipos, testes unitários e docs.

## Histórico legado

O scaffold inicial usava frontend mock-first browser-side, IndexedDB, MongoDB/Mongoose e API NestJS separada. Esse histórico explica commits antigos e parte da UI atual, mas não é mais a arquitetura alvo. Qualquer menção a `mock`, `VITE_API_MODE=mock`, `/lia/mock/`, MongoDB, Mongoose ou GridFS deve ser tratada como dívida de migração, exceto quando estiver marcada explicitamente como histórico legado.
