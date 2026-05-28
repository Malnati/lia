# Estrutura de repositórios — Aneety Platform

## Decisão

O novo projeto deve nascer como `Malnati/aneety-platform`, em monorepo modular. Os repositórios atuais `lia`, `lia-backend`, `lia-core`, `lia-pwa`, `lia-desktop` e `lia-dashboard` viram fontes históricas e referências de aprendizado, não base de implementação contínua.

## Estrutura proposta

```text
aneety-platform/
  apps/
    portal/
    api/
    pwa/
    desktop/
    dashboard/
  packages/
    core/
    db/
    api-client/
    ui-tokens/
  docs/
  tests/
  scripts/
```

## Responsabilidades

### `apps/portal`

Portal público, status, navegação, documentação visível e ponto de entrada para tenants.

### `apps/api`

API HTTP stateless, autenticação própria, autorização, regras de domínio, adapters de storage/pagamento e integração com Postgres.

### `apps/pwa`

Operação mobile/offline-first para campo, entregadores, pedidos, checkpoints, anexos, pagamentos e sincronização.

### `apps/desktop`

Operação desktop para atendimento, produção de moldes, produção de próteses, logística, anexos e acompanhamento.

### `apps/dashboard`

Administração de usuários, perfis, permissões, tenants, marca, métricas e configuração white-label.

### `packages/core`

Tipos de domínio, status, permissões, roles, contratos de erro, validações e helpers compartilhados.

### `packages/db`

Migrations, schema, seeds, policies, fixtures, checks de segurança e scripts controlados de banco.

### `packages/api-client`

Cliente HTTP tipado para apps, com sessão, erros padronizados e contratos compartilhados.

### `packages/ui-tokens`

Tokens white-label, tema base, nomes semânticos e contratos visuais sem componentes pesados.

### `docs`

Contrato do novo produto, arquitetura, runbooks, ADRs, critérios de aceite e guias internos.

### `tests`

E2E cross-app, fixtures públicas, smoke publicado e validações de regressão.

### `scripts`

Automação local/CI: validações, seed, export, checks de secrets e publicação.

## Regras de migração

- Lia entra como primeiro tenant/marca dentro da Aneety Platform.
- Código atual só deve ser copiado se passar por revisão de contrato, segurança, isolamento por tenant e UI copy.
- Não importar estrutura multi-repo antiga para o novo ciclo.
- Documentos atuais continuam úteis como fonte, mas o contrato novo deve ser escrito no monorepo.
- Cada módulo novo deve ter teste e owner antes de virar dependência de outro módulo.
