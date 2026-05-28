# Modelagem de banco de dados — Aneety Platform

## Princípios

- Postgres é a fonte transacional.
- No MVP, a operação usa Supabase/Postgres com schema por BFF.
- No futuro, a operação deve poder migrar para Postgres com banco de dados por BFF.
- Cada schema pertence ao `db-<nome>` da mesma responsabilidade do BFF `worker-<nome>`.
- Cada schema deve ser independente dos demais schemas.
- Quando for necessário relacionar um dado com outro dado de outro schema, a ligação lógica deve usar identificadores externos com sufixo `_eid` (`External ID`), não dependência física direta entre schemas.
- As modelagens devem assumir migração futura para bases de dados completamente separadas, inclusive em servidores Postgres distintos.
- Essas definições são obrigatórias para todas as modelagens de dados.
- Toda entidade operacional tem `tenant_id`.
- Chaves primárias usam UUID.
- Datas usam `timestamptz`.
- Nenhum registro pode ser excluído fisicamente do banco.
- Toda alteração operacional deve criar um novo registro com nova versão, preservando o histórico anterior.
- Exclusão lógica marca todos os registros da mesma série histórica com a mesma data-hora em `deleted_at`.
- Todas as tabelas devem ter `created_at` e `deleted_at`.
- Índices mínimos cobrem `tenant_id`, status, responsáveis e `updated_at`.
- RLS é obrigatório em tabelas expostas ou sensíveis.
- Credenciais são armazenadas apenas como hash forte e salgado, nunca em texto puro.
- Sessões têm expiração, revogação, rotação e vínculo explícito com identidade, tenant e perfil efetivo.
- Frontends e microfrontends Single SPA nunca acessam banco diretamente.
- Mapas e rastreabilidade em tempo real usam eventos e snapshots com permissão por tenant/perfil; fornecedor de mapa não define regra de domínio.
- Pedidos, moldes, próteses, retirada, entrega e evidências odontológicas são seeds/demo/test mass, não limite do modelo.

## Posse e isolamento

- Cada BFF acessa somente o schema da sua responsabilidade, salvo contrato explícito em `core-<nome>` ou `pkg-<nome>`.
- Dependência entre schemas deve passar por contrato versionado, não por leitura informal de tabela alheia.
- Funções auxiliares ficam em schema privado e com `search_path` fixo quando aplicável.
- RLS deve reforçar tenant, perfil e permissões mesmo quando o acesso partir de BFF privilegiado.
- Migração futura para banco físico por BFF deve preservar nomes semânticos, contratos HTTP e políticas de autorização.

## Tabelas conceituais iniciais

As tabelas abaixo são modelo conceitual mínimo. A posse definitiva será definida quando cada responsabilidade receber seu `db-<nome>` e schema do BFF.

### `tenants`

Representa organizações/marcas operando na plataforma. Campos mínimos: `id`, `slug`, `name`, `status`, `created_at`, `updated_at`, `deleted_at`.

### `tenant_branding`

Configuração white-label por tenant. Campos mínimos: `id`, `tenant_id`, `brand_name`, `logo_url`, `primary_color`, `secondary_color`, `texts`, `created_at`, `updated_at`, `deleted_at`.

### `app_identities`

Identidade de acesso própria da plataforma. Campos mínimos: `id`, `tenant_id`, `email`, `phone`, `display_name`, `status`, `created_at`, `updated_at`, `deleted_at`.

### `auth_credentials`

Credenciais vinculadas à identidade. Campos mínimos: `id`, `tenant_id`, `identity_id`, `credential_type`, `password_hash`, `password_updated_at`, `revoked_at`, `created_at`, `deleted_at`.

### `auth_sessions`

Sessões e tokens próprios. Campos mínimos: `id`, `tenant_id`, `identity_id`, `access_token_hash`, `refresh_token_hash`, `expires_at`, `refresh_expires_at`, `revoked_at`, `created_at`, `last_seen_at`, `deleted_at`.

### `app_users`

Usuário operacional dentro de um tenant. Campos mínimos: `id`, `tenant_id`, `identity_id`, `access_profile_id`, `full_name`, `email`, `phone`, `role`, `is_active`, `created_at`, `updated_at`, `deleted_at`.

### `access_profiles`

Perfis de acesso por tenant. Campos mínimos: `id`, `tenant_id`, `name`, `role`, `is_system`, `created_at`, `updated_at`, `deleted_at`.

### `permissions`

Catálogo de permissões. Campos mínimos: `id`, `key`, `description`, `scope`, `created_at`, `deleted_at`.

### `access_profile_permissions`

Associação entre perfil e permissões. Campos mínimos: `id`, `tenant_id`, `access_profile_id`, `permission_id`, `created_at`, `deleted_at`.

### `orders`

Pedido customizado. Campos mínimos: `id`, `tenant_id`, `client_reference`, `consumer_name`, `consumer_phone`, `delivery_address`, `product_or_service`, `customization_spec`, `quality_status`, `status`, `payment_status`, `assigned_to`, `notes`, `version`, `created_at`, `updated_at`, `deleted_at`.

### `order_checkpoints`

Etapas e evidências do pedido. Campos mínimos: `id`, `tenant_id`, `order_id`, `key`, `label`, `completed`, `requires_quality_approval`, `actor_user_id`, `occurred_at`, `notes`, `created_at`, `updated_at`, `deleted_at`.

### `quality_reviews`

Revisões de qualidade do pedido ou item personalizado. Campos mínimos: `id`, `tenant_id`, `order_id`, `checkpoint_id`, `review_status`, `reviewer_user_id`, `notes`, `occurred_at`, `created_at`, `deleted_at`.

### `attachments`

Metadados de fotos, assinaturas e arquivos. Campos mínimos: `id`, `tenant_id`, `order_id`, `checkpoint_id`, `kind`, `filename`, `content_type`, `size_bytes`, `storage_adapter`, `storage_path`, `captured_at`, `created_at`, `deleted_at`.

### `payment_intents`

Intenções e conciliação de pagamento. Campos mínimos: `id`, `tenant_id`, `order_id`, `provider_adapter`, `amount`, `currency`, `status`, `checkout_url`, `provider_reference`, `created_at`, `updated_at`, `deleted_at`.

### `sync_events`

Fila e auditoria de sincronização offline. Campos mínimos: `id`, `tenant_id`, `app_user_id`, `device_id`, `entity`, `entity_id`, `operation`, `status`, `payload`, `error_message`, `created_at`, `updated_at`, `deleted_at`.

### `marketplace_actors`

Consumidores, produtores, operadores e entregadores listáveis. Campos mínimos: `id`, `tenant_id`, `actor_type`, `public_name`, `avatar_url`, `approx_location`, `price_label`, `score`, `contact_label`, `availability`, `status`, `created_at`, `updated_at`, `deleted_at`.

### `marketplace_favorites`

Favoritos por tenant/usuário. Campos mínimos: `id`, `tenant_id`, `app_user_id`, `actor_id`, `created_at`, `deleted_at`.

### `production_demands`

Demandas para produtores, operadores ou equipes responsáveis pelo produto/serviço customizado. Campos mínimos: `id`, `tenant_id`, `order_id`, `requested_by_actor_id`, `producer_actor_id`, `status`, `rejection_reason`, `created_at`, `updated_at`, `deleted_at`.

### `delivery_demands`

Demandas para entregadores. Campos mínimos: `id`, `tenant_id`, `order_id`, `requested_by_actor_id`, `delivery_actor_id`, `origin_label`, `destination_label`, `status`, `rejection_reason`, `created_at`, `updated_at`, `deleted_at`.

### `delivery_evidences`

Fotos e evidências de retirada/entrega. Campos mínimos: `id`, `tenant_id`, `delivery_demand_id`, `order_id`, `checkpoint_key`, `attachment_id`, `origin_label`, `destination_label`, `actor_user_id`, `occurred_at`, `created_at`, `deleted_at`.

### `tracking_events`

Eventos de rastreabilidade em tempo real para status, localização e evidências. Campos mínimos: `id`, `tenant_id`, `order_id`, `actor_user_id`, `event_type`, `status`, `latitude`, `longitude`, `accuracy_meters`, `occurred_at`, `metadata`, `created_at`, `deleted_at`.

### `map_snapshots`

Snapshots calculados para exibição de mapas e acompanhamento operacional. Campos mínimos: `id`, `tenant_id`, `order_id`, `delivery_demand_id`, `current_status`, `last_latitude`, `last_longitude`, `last_event_at`, `route_summary`, `visibility_scope`, `created_at`, `updated_at`, `deleted_at`.

### `audit_events`

Auditoria de ações sensíveis. Campos mínimos: `id`, `tenant_id`, `actor_identity_id`, `actor_user_id`, `action`, `entity`, `entity_id`, `metadata`, `created_at`, `deleted_at`.

### `demo_seed_cases`

Catálogo de seeds e massas de teste. Campos mínimos: `id`, `tenant_id`, `scenario_key`, `vertical_label`, `description`, `payload`, `created_at`, `updated_at`, `deleted_at`.

## Índices mínimos

- `tenant_id` em todas as tabelas operacionais.
- `(tenant_id, status, updated_at desc)` em pedidos, demandas, pagamentos e sync.
- `(tenant_id, order_id, occurred_at desc)` em eventos de rastreabilidade.
- `(tenant_id, order_id, updated_at desc)` em snapshots de mapa.
- FKs com índice líder.
- `auth_sessions` por hash de token e expiração.
- `app_identities` por `(tenant_id, email)` e `(tenant_id, phone)` quando aplicável.
- `marketplace_actors` por `(tenant_id, actor_type, status)`.

## RLS e policies

- Nenhuma leitura cross-tenant.
- Usuário comum lê apenas dados do tenant vinculado.
- Escrita depende de permissão efetiva no perfil.
- Admin de tenant não atravessa tenant.
- Admin de plataforma opera com trilha de auditoria.
- Dados de mapa e localização respeitam escopo de visibilidade por tenant, pedido, perfil e etapa.
- Policies devem funcionar no schema do BFF e continuar portáveis para banco físico futuro.
