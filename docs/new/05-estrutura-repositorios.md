# Estrutura de repositórios — Aneety Platform

## Decisão

O novo projeto deve nascer como `Malnati/aneety-platform`, em monorepo modular. Os repositórios Lia anteriores viram fontes históricas e referências de aprendizado, não base de implementação contínua.

## Regra obrigatória de estrutura

Cada responsabilidade deve refletir a estrutura `aneety-platform/apps/<responsabilidade>/<mfe|mc|gw|worker|fe|job|auto|db|pkg|core|int|wl>-<nome>`.

```text
aneety-platform/
  apps/
    <responsabilidade>/
      mfe-<nome>
      mc-<nome>
      gw-<nome>
      worker-<nome>
      fe-<nome>
      job-<nome>
      auto-<nome>
      db-<nome>
      pkg-<nome>
      core-<nome>
      int-<nome>
      wl-<nome>
  docs/
  tests/
  scripts/
```

A lista acima define categorias possíveis. Não obriga toda responsabilidade a possuir todos os módulos.

## Glossário de prefixos

- `worker-<nome>`: Cloudflare/serverless/Hono.
- `mfe-<nome>`: microfrontend Single SPA.
- `mc-<nome>`: microserviço NestJS.
- `fe-<nome>`: frontend React.
- `gw-<nome>`: gateway Kong/API gateway.
- `job-<nome>`: Bash/Python/SQL/RAG/agents/job batch.
- `auto-<nome>`: Codex/Cursor/Cron/automação.
- `db-<nome>`: módulo/diretório de banco, migrations, RLS, seeds.
- `pkg-<nome>`: pacote compartilhado.
- `core-<nome>`: contrato/domínio central compartilhado.
- `int-<nome>`: integração/adapters externos.
- `wl-<nome>`: workload operacional não coberto por worker/mc/job.

## Regras de runtime e evolução

- Todos os frontends operacionais devem ser `mfe-<nome>` Single SPA.
- BFFs do MVP devem ser `worker-<nome>` em Cloudflare/serverless/Hono.
- Gateway do MVP deve ser `worker-gateway` em Cloudflare/serverless/Hono.
- Gateway futuro deve usar `gw-<nome>` com Kong/API gateway.
- Banco do MVP deve usar Supabase/Postgres com schema por BFF, versionado em `db-<nome>`.
- Banco futuro deve usar Postgres com banco de dados por BFF.
- `mc-<nome>` NestJS é categoria permitida para microserviço futuro, mas não substitui o BFF Worker do MVP.
- `fe-<nome>` React é permitido para frontend não operacional ou superfície sem integração Single SPA; frontends operacionais usam `mfe-<nome>`.

## Responsabilidades

- O nome em `<responsabilidade>` representa um domínio, capacidade ou fronteira operacional, não tecnologia.
- A criação de uma responsabilidade exige contrato, owner, dados tratados, segredos, custo, critérios de aceite e plano de teste.
- Uma responsabilidade pode conter microfrontend, BFF, schema, pacote, contrato, integração, automação e job quando necessário.
- Dependência entre responsabilidades deve passar por gateway, BFF ou contrato compartilhado versionado.
- Nenhuma responsabilidade deve depender de tabela, segredo ou runtime interno de outra sem contrato explícito.

## Regras de migração

- Lia entra como primeiro tenant/marca dentro da Aneety Platform.
- Código atual só deve ser copiado se passar por revisão de contrato, segurança, isolamento por tenant e UI copy.
- Não importar estrutura multi-repo antiga para o novo ciclo.
- Documentos atuais continuam úteis como fonte, mas o contrato novo deve ser escrito no monorepo.
- Cada módulo novo deve ter teste e owner antes de virar dependência de outro módulo.
