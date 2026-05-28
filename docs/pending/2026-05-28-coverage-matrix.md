# Plano — Matriz incremental de cobertura Lia

## Resumo
Criar uma matriz versionada de cobertura para impedir declarações genéricas de “100%” e guiar o monitor a evoluir E2E por ciclos: validar verde atual → identificar próxima lacuna/exceção → implementar menor cobertura → repetir.

## Mudanças principais
- Criar `/Users/mal/GitHub/malnati/lia/docs/COVERAGE_MATRIX.md` como fonte rastreável depois de `REQ.md`.
- Registrar para cada requisito: funcionalidade, repo dono, evidência atual, smoke, E2E happy path, E2E exceções, status (`Completa`, `Parcial`, `Lacuna`, `Bloqueada`) e próxima ação.
- Atualizar `/Users/mal/GitHub/malnati/lia/README.md` para apontar a matriz como critério de cobertura.
- Atualizar a automação `lia-completion-and-pages-e2e-monitor` para, em todo ciclo:
  - ler `REQ.md`;
  - ler a matriz;
  - não declarar 100% se houver linha parcial/lacuna;
  - escolher a próxima exceção de maior prioridade somente quando baseline atual estiver verde.

## Cobertura inicial esperada na matriz
- Completa/parcial: portal, URLs publicadas, health/db health, login via modelo de banco, CRUD usuários/perfis, pedido, checkpoint, anexo, PWA offline/sync happy path, pagamento pendente.
- Lacunas explícitas: token expirado/malformado, usuário inativo, isolamento tenant/RLS, payload inválido, upload inválido/grande, falha storage, conflito/retry offline, pagamento sucesso/falha/cancelamento/webhook, estados shadcn erro/vazio/loading por superfície.

## Test Plan
- Validar política semântica de serviços externos: função, dados, secrets, custo, adapter e plano de saída.
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `PLAYWRIGHT_BASE_URL=https://aneety.com/ LIA_E2E_ENABLED=0 pnpm test:e2e`
- Validar que a automação atualizada cita a matriz e mantém REQ.md como fonte primária.

## Assumptions
- Não mudar schema/API neste PR.
- Não adicionar novo E2E funcional junto com a matriz; a matriz define a próxima cobertura incremental.
- `auth_leaked_password_protection` deve ser registrado como limitação externa do provedor; autenticação de aceite deve migrar para modelo de banco da Lia.
