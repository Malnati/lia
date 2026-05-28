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
- `docs/MOBILE.md` — fluxo mobile/PWA.
- `docs/DESKTOP.md` — fluxo desktop/admin.
- Repositórios irmãos `lia-backend`, `lia-core`, `lia-pwa`, `lia-desktop` e `lia-dashboard` — evidências de API, core, apps, E2E, shadcn/ui, Worker/Hono e Postgres/RLS.

## Decisões travadas

- Nome estratégico: **Aneety Platform**.
- Lia: primeiro tenant/marca, não nome rígido da plataforma.
- Repositório novo: `Malnati/aneety-platform`.
- Estrutura: monorepo modular com apps e pacotes.
- Autenticação: identidade, credenciais, sessões e permissões próprias no Postgres, via API, sem provedor externo obrigatório.
- Este repositório recebe apenas documentação de transição; a nova implementação nasce no novo monorepo.
