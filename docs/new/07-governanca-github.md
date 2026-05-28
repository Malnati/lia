# Governança GitHub — Aneety Platform

## Objetivo da governança

Controlar a execução da Aneety Platform com rastreabilidade objetiva entre arquitetura, requisitos, processos, ciclos, evidências e trabalho operacional.

GitHub Issues e GitHub Projects devem organizar o trabalho visível, mas não substituem os documentos normativos. Cada item executado precisa apontar para fonte documental, critério de aceite, ciclo de cobertura, evidência esperada e evidência final.

Este documento é governança de transição. A documentação canônica futura deve viver em `Aneety/.github`; `docs/new` mantém a base normativa do novo produto enquanto a migração do MVP Lia para Aneety Platform estiver em andamento.

## Fontes de verdade e precedência

A precedência documental é:

1. `01-arquitetura.md` — decisões estruturais, runtime, responsabilidades, submódulos, NFR estruturais, limites de fornecedores e documentação canônica.
2. `02-requisitos.md` — requisitos de produto, técnicos e critérios verificáveis de aceite.
3. `03-processos.md` — modo de execução, gates operacionais e sequência de validação.
4. `06-ciclos-cobertura.md` — ordem incremental dos ciclos, gates de E2E e critérios de conclusão.
5. `07-descricao-produto.md` — descrição funcional e comercial do produto Aneety Platform.

Regras:

- Issue, Project, PR, comentário ou automação não pode alterar contrato por conta própria.
- Se GitHub Project disser "Done", mas a fonte documental ou a evidência estiver ausente, o ciclo continua aberto.
- Se houver conflito entre Issue e documento normativo, vale o documento normativo até existir PR documental aprovado.
- Decisão arquitetural nova exige atualização documental antes de virar implementação.

## Papel do GitHub

GitHub é permitido para versionamento, revisão, PRs, CI, Issues, Projects e documentação.

GitHub não é runtime operacional da plataforma. GitHub Pages, quando existir, só pode publicar ou apontar documentação mantida em `Aneety/.github`; nunca app, smoke, E2E, fluxo operacional ou URL pública de aceite.

Referências operacionais do próprio GitHub:

- [GitHub Projects](https://docs.github.com/issues/planning-and-tracking-with-projects/learning-about-projects/about-projects/) permite acompanhar issues e pull requests em views de tabela, board e roadmap.
- [Views de Projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects/customizing-views-in-your-project) permitem filtrar, ordenar, agrupar e visualizar itens por campos.
- [Issue forms/templates](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository) podem padronizar entradas futuras em `.github/ISSUE_TEMPLATE`.

## Modelo de Issues

Criar uma issue por incremento, lacuna, decisão, bloqueio ou evidência relevante.

Não usar uma issue para misturar responsabilidades independentes. Se um trabalho tocar banco, backend, microfrontend e documentação, a issue principal deve declarar a responsabilidade do ciclo e linkar subtarefas ou PRs por camada.

### Título

Usar o padrão:

```text
[ciclo][responsabilidade] ação objetiva
```

Exemplos:

```text
[banco][pedidos] criar schema inicial de pedidos customizados
[backend][pedidos] publicar contrato HTTP de criação de pedido
[governanca][documentacao] formalizar labels e campos do Project
[bloqueio][deploy] registrar domínio sem resolução pública
```

### Corpo obrigatório

Toda issue deve conter:

- **Fonte documental:** link para `01-arquitetura.md`, `02-requisitos.md`, `03-processos.md`, `06-ciclos-cobertura.md` ou `07-descricao-produto.md`.
- **Ciclo:** um valor da ordem fixa definida em `06-ciclos-cobertura.md`.
- **Responsabilidade:** domínio ou capacidade em `aneety-platform/apps/<responsabilidade>/...`.
- **Owner:** pessoa responsável por conduzir a issue até fechamento.
- **Critério de aceite:** condição objetiva de conclusão.
- **Evidência esperada:** teste, smoke, build, log, screenshot, PR, diff, URL pública ou documento atualizado.
- **Repo afetado:** repositório onde o trabalho será implementado ou documentado.
- **Riscos:** segredo, custo, lock-in, dado real, permissão, arquitetura ou dependência externa.
- **Links:** PRs, documentos, issues relacionadas, runs de CI, evidências e decisões.

### Modelo textual mínimo

```markdown
## Fonte documental

- Documento:
- Seção:

## Ciclo e responsabilidade

- Ciclo:
- Responsabilidade:
- Repo afetado:
- Owner:

## Critério de aceite

-

## Evidência esperada

-

## Riscos e bloqueios

-

## Links

-
```

## Taxonomia de labels

Labels devem classificar tipo, ciclo e status. Evitar labels que dupliquem texto livre sem melhorar filtro ou relatório.

### Tipo

- `tipo:requisito`
- `tipo:arquitetura`
- `tipo:processo`
- `tipo:bug`
- `tipo:bloqueio`
- `tipo:evidencia`

### Ciclo

- `ciclo:repositorio`
- `ciclo:deploy`
- `ciclo:publicacao`
- `ciclo:banco`
- `ciclo:jobs`
- `ciclo:backend`
- `ciclo:microfrontend`
- `ciclo:smoke`
- `ciclo:teste`
- `ciclo:documentacao`
- `ciclo:governanca`

### Status

- `status:triagem` — item ainda sem fonte documental, owner ou aceite completo.
- `status:pronto` — item pronto para entrar em ciclo.
- `status:em-ciclo` — item em execução ativa.
- `status:validacao` — implementação feita, aguardando evidência final ou revisão.
- `status:bloqueado` — item parado por decisão, dependência, acesso, dado, secret, custo, runtime, arquitetura ou evidência ausente.

Regras:

- Cada issue deve ter no mínimo um `tipo:*`, um `ciclo:*` e um `status:*`.
- Issue bloqueada deve registrar causa objetiva e próxima ação.
- Issue de evidência deve linkar o artefato verificável.

## Modelo de GitHub Project

O Project deve ser org-level em `Aneety`, não restrito a um repositório antigo da Lia.

GitHub Projects deve funcionar como painel de execução e auditoria. O Project organiza items, mas a verdade continua nos documentos versionados e nas evidências linkadas.

### Views obrigatórias

- **Backlog tabela:** todos os itens abertos, agrupados por ciclo e responsabilidade.
- **Board por status:** colunas por `status:*`, com foco em fluxo operacional.
- **Roadmap por ciclo:** visão temporal ou sequencial para planejar a ordem `repositorio` -> `deploy` -> `publicação` -> `banco` -> `jobs` -> `backend` -> `microfrontend` -> `smoke` -> `teste` -> `documentação` -> `governança`.
- **Validação por evidência:** itens em validação, agrupados por tipo de evidência e bloqueio.

### Campos obrigatórios

- **Status:** triagem, pronto, em ciclo, validação, bloqueado, concluído.
- **Ciclo:** uma etapa da ordem fixa de `06-ciclos-cobertura.md`.
- **Responsabilidade:** domínio/capacidade da plataforma.
- **Repo destino:** repositório onde a mudança será feita.
- **Owner:** responsável pela conclusão.
- **Prioridade:** alta, média ou baixa.
- **Gate:** requisito, arquitetura, processo, DB, job, backend, microfrontend, smoke, teste, documentação ou governança.
- **Evidência:** link ou descrição curta da evidência esperada/final.
- **Bloqueio:** vazio quando livre; causa objetiva quando bloqueado.

### Regras de atualização

- Mover para `em ciclo` somente se a etapa anterior estiver verde com evidência.
- Mover para `validacao` somente com PR, diff ou artefato pronto para revisão.
- Mover para `concluido` somente com evidência final linkada.
- Não usar item draft sem issue vinculada para trabalho executável; draft só pode representar nota temporária de triagem.

## Fluxo de ciclo

Antes de iniciar um ciclo:

1. Confirmar fonte documental e critério de aceite.
2. Confirmar ciclo pela ordem fixa de `06-ciclos-cobertura.md`.
3. Confirmar responsabilidade e repo destino.
4. Confirmar owner.
5. Confirmar evidência esperada.
6. Abrir ou atualizar issue.
7. Adicionar issue ao Project.
8. Marcar `status:pronto`.

Durante o ciclo:

1. Mover para `status:em-ciclo`.
2. Executar apenas a responsabilidade declarada.
3. Linkar PRs, commits, checks, screenshots, logs ou documentos.
4. Registrar bloqueios com causa objetiva.
5. Não expandir E2E se algum gate anterior estiver vermelho ou sem evidência.

Para fechar o ciclo:

1. Mover para `status:validacao`.
2. Verificar PR, docs, testes e smoke aplicáveis.
3. Conferir ausência de segredos em diff, log, screenshot e bundle.
4. Conferir ausência de vazamento técnico em UI final.
5. Linkar evidência final.
6. Fechar issue.
7. Mover Project para `concluido`.

## Definition of Done

Uma issue só pode ser concluída quando todos os itens aplicáveis forem verdadeiros:

- Requisito rastreado para fonte documental.
- Arquitetura e processo sincronizados.
- Ciclo correto preservado.
- Owner declarado.
- Repo afetado correto.
- Critério de aceite cumprido.
- Evidência objetiva anexada ou linkada.
- Testes, smoke ou validação manual aplicável registrados.
- Sem segredo em diff, log, screenshot, bundle, fixture pública ou documentação de usuário final.
- Sem UI final com vazamento técnico de infraestrutura, banco, runtime, framework, secrets, fornecedor ou ferramenta interna.
- Custo zero preservado.
- Dependência externa classificada por função semântica quando aplicável.
- Project atualizado com status final.

## Regras de bloqueio

Bloquear a issue quando faltar qualquer item essencial:

- Fonte documental.
- Owner.
- Critério de aceite.
- Evidência esperada.
- Decisão arquitetural.
- Repo destino.
- Permissão, secret ou acesso necessário.
- Smoke, teste ou validação obrigatória.
- Plano de saída para fornecedor externo.
- Garantia de custo zero.
- Confirmação de que GitHub não virou runtime operacional.

Bloqueio deve registrar:

- causa objetiva;
- impacto;
- próxima ação;
- responsável;
- data ou condição para reavaliação.

Project `Done` sem evidência não fecha ciclo. Issue fechada sem evidência deve ser reaberta ou substituída por issue de correção de governança.

## Evolução futura

Depois que o processo manual estiver validado, criar incremento próprio para:

- issue forms em `.github/ISSUE_TEMPLATE/*.yml`;
- labels padronizadas via script ou GitHub CLI;
- configuração documentada do org-level Project;
- automação leve para adicionar issue ao Project;
- validação de campos obrigatórios;
- relatórios de ciclo, bloqueio e evidência;
- integração com CI para linkar checks relevantes.

Essa evolução futura deve ser uma issue própria de `ciclo:governanca`, sem criar automações antes de validar o fluxo manual.
