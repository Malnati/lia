# Aneety Platform — documentação de transição

Status: **MVP Lia encerrado como linha de implementação; Aneety Platform inicia como sucessor.**

Este diretório registra a estratégia para descontinuar o MVP atual sem apagar código, histórico, evidências, decisões ou aprendizados. A implementação nova deve nascer na org `https://github.com/Aneety`, com `Aneety/ai` como repositório orquestrador. Todos os projetos/repositórios Aneety devem ser clonados em `/Users/mal/GitHub/Aneety/*`, pareando `https://github.com/Aneety/<repo>` com `/Users/mal/GitHub/Aneety/<repo>`. Cada responsabilidade ou derivação com implementação própria deve ter repo próprio e ser linkada como submódulo no caminho correspondente em `aneety-platform/apps/<responsabilidade>/...`.

## Índice

1. [Estratégia de descontinuação do MVP](00-estrategia-descontinuacao-mvp.md)
2. [Arquitetura](01-arquitetura.md)
3. [Requisitos](02-requisitos.md)
4. [Processos](03-processos.md)
5. [Modelagem de banco de dados](04-modelagem-banco.md)
6. [Estrutura de repositórios](05-estrutura-repositorios.md)
7. [Ciclos de desenvolvimento por cobertura](06-ciclos-cobertura.md)

## Fontes aproveitadas

- `REQ.md` — contrato vigente da plataforma Lia.
- `README.md` — estado atual do portal integrador e publicação por domínio.
- `docs/MARKETPLACE_OPERACIONAL.md` — fluxo de marketplace operacional.
- `docs/COVERAGE_MATRIX.md` — lacunas e critérios de cobertura.
- Guias mobile, desktop e administração — evidências de fluxos, telas e critérios de aceite.
- Repositórios Lia anteriores — evidências de Worker/Hono, Postgres/RLS, shadcn/ui, E2E, core, apps e publicação.
- Fluxos odontológicos de pedidos, moldes, próteses, retirada, entrega e evidências — carga inicial de demonstração, seeds e massas de teste.

## Decisões travadas

- Nome estratégico: **Aneety Platform**.
- Produto: white-label genérico para produto/serviço customizado com consumidor, produtor, entrega, evidências, qualidade, mapas e rastreabilidade em tempo real.
- Lia: primeiro tenant/marca, não nome rígido da plataforma.
- Org GitHub: `https://github.com/Aneety`.
- Clone root local obrigatório: `/Users/mal/GitHub/Aneety/*`.
- Regra remoto/local: `https://github.com/Aneety/<repo>` -> `/Users/mal/GitHub/Aneety/<repo>`.
- Repositório orquestrador de implementação: `Aneety/ai` (`https://github.com/Aneety/ai.git`, clone local `/Users/mal/GitHub/Aneety/ai`).
- Repositório canônico de documentação de todos os projetos/repositórios: `Aneety/.github` (`https://github.com/Aneety/.github.git`, clone local `/Users/mal/GitHub/Aneety/.github`).
- Repositório canônico de assets reutilizáveis: `Aneety/assets` (`https://github.com/Aneety/assets.git`, clone local `/Users/mal/GitHub/Aneety/assets`), sempre com versão SVG para logos, ícones, ilustrações, diagramas, marcas, pictogramas e demais assets reutilizáveis.
- Estrutura: repos próprios por responsabilidade/derivação, linkados como submódulos.
- Regra de diretório: `aneety-platform/apps/<responsabilidade>/<mfe|mc|gw|worker|fe|job|auto|db|pkg|core|int|wl>-<nome>`.
- Documentação: guias de usuário, documentação de desenvolvedor, especificações, ADRs, arquitetura e catálogo de repositórios devem viver em `Aneety/.github`; repos de implementação mantêm apenas README mínimo com link para essa fonte canônica.
- Assets: todo asset reutilizável do projeto deve ser versionado em SVG no repo `Aneety/assets`; repos de implementação devem consumir ou referenciar esse acervo, não manter cópias divergentes.
- Frontends operacionais: microfrontends Single SPA em `mfe-<nome>`.
- BFFs MVP: `worker-<nome>` em Cloudflare/serverless/Hono.
- Gateway MVP: `worker-gateway`.
- Gateway futuro: `gw-<nome>` Kong/API gateway.
- Banco MVP: Supabase/Postgres com schema por BFF.
- Banco futuro: Postgres com banco de dados por BFF.
- Autenticação: identidade, credenciais, sessões e permissões próprias no Postgres, via gateway/BFF, sem provedor externo obrigatório.
- Serviços externos por semântica: Cloudflare, GitHub, Supabase, mapas ou qualquer fornecedor equivalente são meios substituíveis; requisitos devem declarar função, dados, segredos, custo, contrato local, testes e plano de saída.
- Custo: custo zero sempre; dependência paga bloqueia ou exige redesenho.
- Este repositório recebe apenas documentação de transição; a nova implementação nasce no orquestrador `Aneety/ai` e a documentação oficial deve ser transferida para `Aneety/.github`.
