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

## Limites semânticos de serviços externos

Cloudflare, GitHub, Supabase, provedores de storage, pagamento, e-mail, mapas, IA, observabilidade ou qualquer serviço equivalente são **meios substituíveis**, não requisitos de produto por marca. A decisão arquitetural deve sempre registrar a função semântica exercida:

- hospedagem estática de frontend/core;
- runtime stateless de API;
- banco transacional relacional;
- autenticação e autorização modeladas no banco da plataforma;
- armazenamento de bytes com metadados e permissão no Postgres;
- versionamento, PR e CI;
- DNS/CDN;
- integrações auxiliares como pagamentos, mensagens, e-mail, mapas, IA, filas, analytics e observabilidade.

Limites obrigatórios:

- nenhum serviço pago, proprietário ou específico de fornecedor pode virar caminho obrigatório de aceite;
- SDK, claim, id de usuário, URL ou recurso exclusivo de fornecedor não pode definir regra de domínio;
- cada integração deve ter contrato local, dados tratados, segredos, custo, owner, testes e plano de saída;
- smoke/E2E validam a função semântica, não apenas o nome do fornecedor;
- frontends nunca dependem de banco, IdP externo ou chave pública de fornecedor para autenticação.

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
