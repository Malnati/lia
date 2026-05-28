# Aneety Platform — documentação de transição

Status: **MVP Lia encerrado como linha de implementação; Aneety Platform inicia como sucessor.**

Este diretório registra a estratégia para descontinuar o MVP atual sem apagar código, histórico, evidências, decisões ou aprendizados. A implementação nova deve nascer em um repositório futuro, `Malnati/aneety-platform`, com monorepo modular e com Lia como primeiro tenant/marca.

## Índice

1. [Estratégia de descontinuação do MVP](00-estrategia-descontinuacao-mvp.md)
2. [Arquitetura](01-arquitetura.md)
3. [Requisitos](02-requisitos.md)
4. [Processos](03-processos.md)
5. [Modelagem de banco de dados](04-modelagem-banco.md)
6. [Estrutura de repositórios](05-estrutura-repositorios.md)

## Fontes aproveitadas

- `REQ.md` — contrato vigente da plataforma Lia.
- `README.md` — estado atual do portal integrador e publicação por domínio.
- `docs/MARKETPLACE_OPERACIONAL.md` — fluxo de marketplace operacional.
- `docs/COVERAGE_MATRIX.md` — lacunas e critérios de cobertura.
- Guias mobile, desktop e administração — evidências de fluxos, telas e critérios de aceite.
- Repositórios Lia anteriores — evidências de Worker/Hono, Postgres/RLS, shadcn/ui, E2E, core, apps e publicação.

## Decisões travadas

- Nome estratégico: **Aneety Platform**.
- Lia: primeiro tenant/marca, não nome rígido da plataforma.
- Repositório novo: `Malnati/aneety-platform`.
- Estrutura: monorepo modular por responsabilidade.
- Regra de diretório: `aneety-platform/apps/<responsabilidade>/<mfe|mc|gw|worker|fe|job|auto|db|pkg|core|int|wl>-<nome>`.
- Frontends operacionais: microfrontends Single SPA em `mfe-<nome>`.
- BFFs MVP: `worker-<nome>` em Cloudflare/serverless/Hono.
- Gateway MVP: `worker-gateway`.
- Gateway futuro: `gw-<nome>` Kong/API gateway.
- Banco MVP: Supabase/Postgres com schema por BFF.
- Banco futuro: Postgres com banco de dados por BFF.
- Autenticação: identidade, credenciais, sessões e permissões próprias no Postgres, via gateway/BFF, sem provedor externo obrigatório.
- Serviços externos por semântica: Cloudflare, GitHub, Supabase ou qualquer fornecedor equivalente são meios substituíveis; requisitos devem declarar função, dados, segredos, custo, contrato local, testes e plano de saída.
- Este repositório recebe apenas documentação de transição; a nova implementação nasce no novo monorepo.
