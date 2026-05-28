# Arquitetura — Aneety Platform

## Visão

Aneety Platform será um monorepo modular para operar pedidos de prótese dentária em modo white-label. Lia será o primeiro tenant/marca. A arquitetura separa produto, domínio, API, banco, apps e design system sem fragmentar prematuramente a implementação em vários repositórios.

## Módulos do monorepo

```text
apps/portal      Portal institucional, status e navegação entre superfícies.
apps/api         API HTTP stateless, autenticação própria, regras de domínio e adapters.
apps/pwa         Operação mobile/offline-first para campo e entregadores.
apps/desktop     Operação desktop para atendimento, produção e logística.
apps/dashboard   Administração de tenants, usuários, perfis, permissões e marca.
packages/core    Tipos de domínio, status, permissões, contratos e validações.
packages/db      Migrations, schema, seeds, policies e fixtures controladas.
packages/api-client Cliente HTTP tipado para os apps.
packages/ui-tokens Tokens white-label, temas e contratos visuais compartilháveis.
```

## Runtime alvo

- Frontends e core publicados como assets estáticos sob `*.aneety.com`.
- API pública em `https://api.aneety.com`, stateless, versionada e testável.
- Postgres como fonte transacional de tenants, identidades, pedidos, anexos, pagamentos, marketplace e auditoria.
- Storage como adapter para bytes; metadados, autorização e lifecycle pertencem ao banco.
- Pagamentos como adapter; pedido e conciliação permanecem no domínio Aneety.
- Observabilidade, mensagens, mapas e integrações futuras entram por interfaces substituíveis.

## Fluxo de dados

1. Usuário entra por portal, PWA, desktop ou dashboard.
2. App chama a API Aneety para login, sessão e operações.
3. API valida sessão própria, resolve tenant, usuário, perfil e permissões.
4. API executa regra de domínio e persiste em Postgres.
5. RLS e policies reforçam isolamento por tenant.
6. Apps nunca recebem segredo privilegiado.

## Regras arquiteturais

- Custo zero enquanto possível; qualquer dependência paga vira bloqueio até decisão explícita.
- Segredos ficam somente em runtime backend, CI seguro ou ambiente local ignorado pelo Git.
- Frontends não acessam banco diretamente para autenticação ou autorização.
- UI de usuário final não expõe nomes de infraestrutura, banco, runtime, framework, secrets ou fornecedores.
- Termos técnicos ficam em docs internas, logs técnicos, runbooks e telas de operador técnico quando existirem.
- Cada módulo deve ter contrato, testes e owner claro antes de expandir escopo.
