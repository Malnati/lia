# REQ — Lia

## Origem

Exportado e atualizado nesta conversa em 2026-05-27.

Link de referência inicial: <https://chatgpt.com/share/6a16552b-9da0-83e9-be3f-51058ccc2eec>

## Regra central

`REQ.md` é a fonte de verdade da plataforma Lia. Em caso de divergência entre código, README, automações, testes ou deploys, este arquivo prevalece.

A decisão vigente substitui o escopo antigo mock-first/MongoDB/NestJS/VPS/GitHub Pages: **Lia deve evoluir para Supabase/Postgres real, Supabase Auth, API serverless leve em Cloudflare Workers Free + Hono, frontends estáticos no Cloudflare Pages Free e domínios sob `aneety.com`**. O termo “mock backend” não deve ser usado para a base principal daqui em diante. Qualquer instrução operacional que mande validar `/lia/mock/`, `VITE_API_MODE=mock`, pagamento mock, backend browser-side ou E2E contra adapter local é obsoleta e deve ser substituída por validação contra Supabase/Postgres real + API Worker.

Atualização operacional de 2026-05-27: o projeto Supabase `mqxwdyhtsvzzehmdfhtj` está conectado ao Codex via MCP usando `SUPABASE_KEY` como PAT local (`bearer_token_env_var`, sem OAuth obrigatório). O banco real recebeu as migrations `0001_initial_schema`, `0002_harden_database_functions` e `0003_add_foreign_key_indexes`. O monitoramento deve tratar esse estado como baseline vigente, não como experimento.

## Visão do produto

**Lia** é uma plataforma white-label para operação de pedidos de prótese dentária no Paraguai, cobrindo:

- pedidos feitos por consultórios, clínicas e bureaus;
- produção de moldes por consultórios ou equipes associadas;
- produção de próteses por laboratórios/bureaus;
- retirada, entrega e rastreio operacional;
- pagamento online;
- administração de usuários, perfis, permissões, tenants e operação.

A operação inicial é Lia, mas a plataforma deve permitir configuração por tenant/marca, sem acoplar os fluxos centrais ao nome Lia.

## Repositórios, domínios e responsabilidades

| Repositório | URL pública | Responsabilidade |
| --- | --- | --- |
| `Malnati/lia` | <https://aneety.com/> | Portal orquestrador/integrador, contrato `REQ.md`, navegação entre apps, status público e documentação de arquitetura. |
| `Malnati/lia-backend` | <https://api.aneety.com/> | API Cloudflare Worker + Hono conectada ao Supabase/Postgres. Não é mock. |
| `Malnati/lia-core` | <https://core.aneety.com/> | ESM estático com tipos, validações, tenants, roles, permissões e cliente compartilhado. |
| `Malnati/lia-pwa` | <https://pwa.aneety.com/> | PWA mobile/offline-first para operação em campo. |
| `Malnati/lia-desktop` | <https://desktop.aneety.com/> | App desktop operacional para atendimento, produção e logística. |
| `Malnati/lia-dashboard` | <https://dashboard.aneety.com/> | Administrativo para consultórios, clínicas e bureau; CRUD usuários/perfis. |

Todos os repositórios devem existir, ser clonados e ser publicados a partir dos seus próprios diretórios em `/Users/mal/GitHub/malnati`:

- `/Users/mal/GitHub/malnati/lia` — orquestrador/portal e contrato de requisitos.
- `/Users/mal/GitHub/malnati/lia-backend` — API Worker/Hono e migrations Supabase.
- `/Users/mal/GitHub/malnati/lia-core` — pacote ESM compartilhado.
- `/Users/mal/GitHub/malnati/lia-dashboard` — administrativo.
- `/Users/mal/GitHub/malnati/lia-desktop` — operação desktop.
- `/Users/mal/GitHub/malnati/lia-pwa` — operação mobile/PWA.

Cada projeto deve ser implementado, testado, commitado, enviado e publicado no seu respectivo repositório. O repositório `lia` não deve voltar a concentrar backend, core, dashboard, desktop ou PWA como implementação principal; ele orquestra a plataforma e aponta para os demais apps.

## Stack alvo

- Package manager: `pnpm`.
- Frontends: React + Vite + TypeScript, publicados como assets estáticos no Cloudflare Pages Free.
- PWA: mobile-first, offline-first, service worker e IndexedDB para fila local.
- Core: ESM estático publicado via Cloudflare Pages Free.
- Backend: Cloudflare Workers Free + Hono + TypeScript.
- Banco real: Supabase/Postgres Free, projeto `mqxwdyhtsvzzehmdfhtj`.
- Autenticação: Supabase Auth.
- Autorização: Row-Level Security no Supabase + validação de permissões no Worker.
- Anexos: Supabase Storage, bucket `order-attachments`.
- Domínio: zona Cloudflare `aneety.com`, sem serviços pagos.
- Segredos: service role apenas no Worker/Cloudflare secrets; nunca em frontend, Pages, Git ou bundle.
- Operação Codex/Supabase: MCP `supabase` com `SUPABASE_KEY` em `bearer_token_env_var`; não depender de `codex mcp login` OAuth se o endpoint `/authorize` falhar.

## Restrições de custo zero

- Não usar Cloudflare Containers, Workers Paid, Logpush, Vectorize, add-ons pagos ou domínio customizado do Supabase.
- Não usar Cloudflare Pages Functions para servir assets estáticos.
- O Worker deve permanecer dentro do plano Free; se a solução exigir plano pago, bloquear e reportar.
- Supabase deve permanecer no plano Free; se exigir upgrade, bloquear e reportar.

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
- Funções auxiliares de RLS devem ficar em schema não exposto (`private`) e ser referenciadas explicitamente nas policies.
- Funções públicas devem ter `search_path` fixo quando aplicável.
- FKs devem ter índices líderes para evitar advisory de performance por foreign key sem índice.

## API Cloudflare Worker + Hono alvo

Host: <https://api.aneety.com/>.

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
- Frontends chamam a API usando `VITE_API_URL=https://api.aneety.com`.
- API valida JWT Supabase e permissões.
- API usa service role apenas no backend para operações privilegiadas.
- API deve validar CORS por ambiente e permitir apenas domínios `aneety.com` esperados.
- API deve retornar erros JSON padronizados, com 401 para token ausente/inválido e 403 para permissão insuficiente.

## Frontend PWA (`lia-pwa`)

Requisitos:

- Mobile-first.
- Offline-first para operação em campo.
- Fila local em IndexedDB para pedidos, checkpoints, anexos e pagamentos pendentes.
- Sincronização com API real quando online.
- Login Supabase.
- Views mínimas: pedidos, novo pedido, retirada, entrega, anexos, pagamento, sync e perfil.
- Pagamento online deve deixar claro que requer conexão.
- E2E deve rodar contra `https://pwa.aneety.com` e `https://api.aneety.com` quando disponível.

## Frontend desktop (`lia-desktop`)

Requisitos:

- App operacional desktop para atendimento, produção e logística.
- Login Supabase.
- Listagem e edição de pedidos.
- Checkpoints de produção de molde, produção de prótese, retirada e entrega.
- Upload/consulta de anexos.
- Integração via `lia-core` e `https://api.aneety.com`.

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
- cliente HTTP comum para `https://api.aneety.com`;
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

- O backend real deve ser Cloudflare Worker; Pages do backend pode conter apenas docs/status estático.
- Antes de qualquer container local, executar `podman info`.
- Usar Podman/Podman Desktop, não Docker Desktop.
- Não depender de instalação global de pacotes Python.
- Supabase secrets não podem ser commitados.
- Service role nunca pode ser exposta nos frontends.
- `.env` local pode conter credenciais temporárias, mas deve permanecer ignorado pelo Git.
- O PAT `SUPABASE_KEY` é somente para MCP/CLI local; não deve virar variável de frontend nem Cloudflare secret do Worker.

## Variáveis de ambiente

Fonte local temporária de credenciais: `/Users/mal/GitHub/malnati/lia/.env`.

Fonte local real atual:

- `SUPABASE_KEY` — PAT local para MCP/Codex; não publicar, não usar em frontend.
- `SUPABASE_PROJECT_URL` — URL do projeto Supabase; mapear para `SUPABASE_URL`/`VITE_SUPABASE_URL` quando a ferramenta exigir esse nome.
- `SUPABASE_PUBLISHABLE_KEY` — chave pública Supabase; mapear para `VITE_SUPABASE_PUBLISHABLE_KEY` ou `VITE_SUPABASE_ANON_KEY` enquanto código legado exigir esse nome.
- `SUPABASE_DIRECT_CONNECTION_STRING` — conexão Postgres direta para diagnóstico/migrations controladas; nunca imprimir.
- `SUPABASE_CLI_SETUP_COMMANDS` — comandos auxiliares locais, se presentes; não executar automaticamente ao carregar `.env`.

Frontends:

- `VITE_SUPABASE_URL` derivado de `SUPABASE_PROJECT_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY` preferencialmente; `VITE_SUPABASE_ANON_KEY` só como compatibilidade temporária
- `VITE_API_URL=https://api.aneety.com`

Backend Worker:

- `SUPABASE_URL` derivado de `SUPABASE_PROJECT_URL`
- `SUPABASE_PUBLISHABLE_KEY` ou compatibilidade `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` quando disponível como Cloudflare secret; nunca Git/frontend
- `CORS_ORIGINS`
- `LIA_DEFAULT_TENANT_ID`
- `PAYMENT_GATEWAY_PROVIDER`

Cloudflare local/deploy:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN` ou alias local `CLOUDFLARE_KEY`

## Cloudflare Pages e Workers

Deploy esperado por repo estático:

- `lia` → Cloudflare Pages project `lia`, domínio `aneety.com`.
- `lia-core` → Cloudflare Pages project `lia-core`, domínio `core.aneety.com`.
- `lia-pwa` → Cloudflare Pages project `lia-pwa`, domínio `pwa.aneety.com`.
- `lia-desktop` → Cloudflare Pages project `lia-desktop`, domínio `desktop.aneety.com`.
- `lia-dashboard` → Cloudflare Pages project `lia-dashboard`, domínio `dashboard.aneety.com`.

Deploy esperado do backend:

- `lia-backend` → Cloudflare Worker `lia-backend`, custom domain `api.aneety.com`.

## Validação obrigatória

Por repo alterado:

- `pnpm lint` quando existir;
- `pnpm test` quando existir;
- `pnpm build` quando existir.

Backend/Supabase:

- `pnpm wrangler check`;
- `pnpm wrangler deploy --dry-run`;
- MCP `supabase` configurado com `bearer_token_env_var=SUPABASE_KEY` e projeto `mqxwdyhtsvzzehmdfhtj`;
- `list_migrations` deve mostrar `0001_initial_schema`, `0002_harden_database_functions` e `0003_add_foreign_key_indexes`;
- `list_tables` deve mostrar as tabelas mínimas em `public` com RLS habilitado;
- `get_advisors(security)` deve retornar 0 lints antes de declarar conclusão;
- `get_advisors(performance)` deve ser registrado; `unused_index` em banco recém-criado/vazio não bloqueia sozinho, mas FKs sem índice bloqueiam;
- migrations aplicadas quando secrets/projeto existirem, sempre versionadas também em `lia-backend/supabase/migrations`;
- RLS habilitado;
- policies testadas;
- `GET /api/health` OK;
- `GET /api/db/health` OK ou `not_configured` se faltarem secrets/route;
- JWT ausente/inválido retorna 401;
- usuário sem permissão retorna 403;
- isolamento cross-tenant comprovado.

E2E publicado:

- E2E alvo deve usar apenas URLs publicadas em `aneety.com` e API/Supabase real;
- testes contra `/mock`, adapter local, pagamento mock ou backend browser-side não contam como cobertura vigente e devem ser migrados/removidos gradualmente;
- portal abre todos os links em `aneety.com`;
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

1. Ler este `REQ.md` inteiro em todo ciclo e tratar este arquivo como contrato superior a automações antigas.
2. Validar repos locais e remotos, branch/SHA/PR e trabalho humano pendente antes de alterar qualquer coisa, garantindo que cada projeto esteja no seu repositório próprio em `/Users/mal/GitHub/malnati` e não concentrado no orquestrador `lia`.
3. Comparar requisitos com código, docs, workflows, Cloudflare Pages, Worker API e Supabase real.
4. Verificar MCP Supabase sem expor segredos: `codex mcp get supabase`, `codex mcp list`, `list_migrations`, `list_tables`, `get_advisors(security)` e `get_advisors(performance)` quando a ferramenta estiver disponível; nunca executar/source `.env` inteiro, apenas parsear chaves necessárias.
5. Validar que regras antigas de mock foram substituídas: não seguir instruções que mandem chamar `/lia/mock/`, `VITE_API_MODE=mock`, adapter browser-side ou GitHub Pages antigo como alvo de aceitação.
6. Priorizar lacunas de arquitetura, banco, RLS, migrations, secrets Cloudflare e Worker API antes de novos E2E.
7. Não declarar 100% sem evidência objetiva por arquivo/linha, comando, MCP output, URL, workflow ou screenshot.
8. Validar publicação por repositório: `lia` → `https://aneety.com`, `lia-backend` → `https://api.aneety.com`, `lia-core` → `https://core.aneety.com`, `lia-pwa` → `https://pwa.aneety.com`, `lia-desktop` → `https://desktop.aneety.com` e `lia-dashboard` → `https://dashboard.aneety.com`.
9. Se faltarem DNS, routes, secrets Cloudflare ou acesso Supabase, registrar bloqueio objetivo e implementar apenas partes sem segredo: REQ, scaffolds, migrations SQL, tipos, testes unitários e docs.
10. Só ampliar E2E quando REQ, docs, screenshots, smoke, Supabase advisors, Cloudflare deploy e E2E vigente estiverem verdes.

## Histórico legado

O scaffold inicial usava frontend mock-first browser-side, IndexedDB, MongoDB/Mongoose, GitHub Pages e API NestJS separada. Esse histórico explica commits antigos, screenshots e testes legados, mas não é mais arquitetura alvo nem critério de aceite. Qualquer menção a `mock`, `VITE_API_MODE=mock`, `/lia/mock/`, pagamento mock, adapter browser-side, GitHub Pages como hosting alvo, NestJS, VPS, Render, MongoDB, Mongoose ou GridFS deve ser tratada como dívida de migração quando aparecer em código, testes, README, automações ou workflows. A única exceção permitida é documentação histórica claramente marcada como legado; mesmo assim, monitoramento não deve executar essas rotas como validação de sucesso.
