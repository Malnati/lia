# Arquitetura — Aneety Platform

## Visão

Aneety Platform será um monorepo modular para operar pedidos de prótese dentária em modo white-label. Lia será o primeiro tenant/marca. A arquitetura separa responsabilidade de negócio, microfrontend, BFF, gateway, banco, integrações, automações e contratos compartilhados sem fragmentar prematuramente a implementação em vários repositórios.

## Regra de módulos do monorepo

Toda responsabilidade deve existir sob `aneety-platform/apps/<responsabilidade>/...`. Dentro de cada responsabilidade, o nome do diretório deve seguir o padrão `aneety-platform/apps/<responsabilidade>/<mfe|mc|gw|worker|fe|job|auto|db|pkg|core|int|wl>-<nome>`.

```text
aneety-platform/
  apps/
    <responsabilidade>/
      mfe-<nome>       Microfrontend Single SPA.
      worker-<nome>    BFF ou workload HTTP serverless em Cloudflare/serverless/Hono.
      db-<nome>        Migrations, RLS, seeds e schema do BFF.
      pkg-<nome>       Pacote compartilhado local da responsabilidade.
      core-<nome>      Contrato/domínio central compartilhado.
      int-<nome>       Integração ou adapter externo.
      job-<nome>       Job batch, RAG, agente ou rotina operacional.
      auto-<nome>      Automação Codex/Cursor/Cron.
      wl-<nome>        Workload operacional não coberto por worker, microserviço ou job.
```

O contrato acima é genérico. Este ciclo documental não lista responsabilidades concretas; cada responsabilidade será criada somente quando houver contrato, owner, dados, aceite e limite de escopo.

## Runtime alvo do MVP

- Todos os frontends operacionais serão microfrontends Single SPA.
- BFFs do MVP serão `worker-<nome>` em Cloudflare/serverless/Hono.
- Gateway inicial será `worker-gateway`, também em Cloudflare/serverless/Hono.
- Gateway futuro será `gw-<nome>` com Kong/API gateway ou equivalente.
- Banco do MVP será Supabase/Postgres com schema por BFF.
- Banco futuro será Postgres com banco de dados por BFF, preservando contratos e migrations.
- Storage atua como adapter para bytes; metadados, autorização e lifecycle pertencem ao schema do BFF responsável.
- Pagamentos atuam como adapter; pedido e conciliação permanecem no domínio Aneety.
- Observabilidade, mensagens, mapas, IA e integrações futuras entram por interfaces substituíveis.

## Fluxo de dados

1. Usuário entra por um microfrontend Single SPA publicado sob `aneety.com`.
2. O microfrontend chama `worker-gateway` para login, sessão e roteamento de operações.
3. `worker-gateway` valida borda, CORS, versão de contrato e encaminha para o BFF `worker-*` da responsabilidade.
4. O BFF valida sessão própria, resolve tenant, usuário, perfil e permissões.
5. O BFF executa regra de domínio e persiste no schema Supabase/Postgres da sua responsabilidade.
6. RLS e policies reforçam isolamento por tenant dentro de cada schema.
7. Apps nunca recebem segredo privilegiado nem acessam banco diretamente.

## Evolução planejada

- `worker-gateway` é escolha de MVP para custo zero e simplicidade operacional.
- Quando tráfego, governança ou roteamento exigirem, gateway migra para `gw-*` Kong/API gateway.
- Schemas Supabase/Postgres por BFF são escolha de MVP para isolamento lógico e velocidade.
- Quando operação exigir isolamento físico, cada BFF migra para Postgres com banco de dados por BFF.
- A migração futura não pode alterar contratos de microfrontend, sessão, permissão, erro ou auditoria sem ADR explícita.

## Limites semânticos de serviços externos

Cloudflare, GitHub, Supabase, provedores de storage, pagamento, e-mail, mapas, IA, observabilidade ou qualquer serviço equivalente são **meios substituíveis**, não requisitos de produto por marca. A decisão arquitetural deve sempre registrar a função semântica exercida:

- hospedagem estática de microfrontends;
- runtime stateless de gateway e BFF;
- banco transacional relacional;
- autenticação e autorização modeladas no banco da plataforma;
- armazenamento de bytes com metadados e permissão no schema do BFF responsável;
- versionamento, PR e CI;
- DNS/CDN;
- integrações auxiliares como pagamentos, mensagens, e-mail, mapas, IA, filas, analytics e observabilidade.

Limites obrigatórios:

- nenhum serviço pago, proprietário ou específico de fornecedor pode virar caminho obrigatório de aceite;
- SDK, claim, id de usuário, URL ou recurso exclusivo de fornecedor não pode definir regra de domínio;
- cada integração deve ter contrato local, dados tratados, segredos, custo, owner, testes e plano de saída;
- smoke/E2E validam a função semântica, não apenas o nome do fornecedor;
- frontends nunca dependem de banco, IdP externo ou chave pública de fornecedor para autenticação.

## Regras arquiteturais

- Custo zero enquanto possível; qualquer dependência paga vira bloqueio até decisão explícita.
- Segredos ficam somente em gateway, BFF, CI seguro ou ambiente local ignorado pelo Git.
- Frontends não acessam banco diretamente para autenticação ou autorização.
- UI de usuário final não expõe nomes de infraestrutura, banco, runtime, framework, secrets ou fornecedores.
- Termos técnicos ficam em docs internas, logs técnicos, runbooks e telas de operador técnico quando existirem.
- Cada módulo deve ter contrato, testes e owner claro antes de expandir escopo.
