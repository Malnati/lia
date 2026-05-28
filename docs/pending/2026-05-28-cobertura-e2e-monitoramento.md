# Registro de conversa — cobertura E2E e monitoramento Lia

- Data: 2026-05-28
- Escopo: Lia / REQ.md / cobertura smoke e E2E / monitoramento agendado
- Origem: registro solicitado em conversa Codex

## Perguntas registradas

Todos os requisitos foram atendidos? Todas as funcionalidades estão cobertas pelos testes smoke e e2e? Os ciclos de testes, correções, validações estão completando com sucesso em 100%? Todos os casos de exceção estão cobertos pelos testes e2e? A implementação de coberturas de testes e2e está sendo incremental e iterativa, conforme alcançado 100% de uma cobertura analisa-se os funcionalidades para encontrar e identificar casos de exceção ainda não cobertos e então implementa-se? Existe um plano de implementação sendo seguido e ajustado conforme as analises de cada ciclos, etapas, conclusões em REQ.md? O monitoramento agendado está sempre fazendo estas perguntas e agindo conforme as respostas (deve ser assim)?

## Resposta registrada

Resposta curta: **não para “tudo/100%”**. **Sim para baseline operacional atual.**

### Estado real atual

- **Arquitetura/base:** ok. `REQ.md` foi relido; repos limpos; URLs `aneety.com`/subdomínios 200; API e `db/health` ok.
- **CI/Pages atual:** ok em `lia` main `96a1341`.
- **Smoke/E2E existentes cobrem:**
  - portal + URLs publicadas;
  - API health/db health;
  - login via modelo de banco;
  - CRUD usuários/perfis;
  - 401 sem token e 403 sem permissão em parte do backend;
  - PWA offline happy path;
  - desktop checkpoint/anexo;
  - fluxo cross-app feliz portal → API → desktop → PWA → dashboard.

### O que ainda não está 100%

- **Nem todos os requisitos de produto do `REQ.md` estão implementados/cobertos.**
- **Nem todas as funcionalidades têm E2E completo.**
- **Nem todos os casos de exceção estão cobertos.** Faltam, por exemplo:
  - token expirado/malformado, usuário inativo, isolamento tenant/RLS por endpoint;
  - payload inválido em pedidos, usuários, perfis, status e anexos;
  - upload grande/tipo inválido/falha de storage;
  - retry/conflito/duplicidade no sync offline;
  - pagamento com sucesso/falha/cancelamento/webhook; hoje é `pending_gateway`;
  - estados shadcn de erro/vazio/loading em todas as superfícies.

### Sobre o processo incremental

**Sim, o processo certo é exatamente esse:** só ampliar E2E quando a cobertura atual está verde; depois analisar lacunas/exceções; implementar a próxima menor cobertura; validar; publicar; repetir.

A automação já aponta nessa direção, mas **ainda não há uma matriz formal “REQ.md → teste → exceções → status” versionada**. Isso é a principal lacuna de governança.

### Ajuste recomendado

Próximo passo deve ser criar/seguir uma matriz de cobertura:

- requisito do `REQ.md`;
- funcionalidade;
- smoke existente;
- E2E happy path;
- E2E exceções;
- status: coberto/parcial/lacuna;
- próxima cobertura mínima.

E a automação deve consultar essa matriz em todo ciclo antes de criar novos testes.
