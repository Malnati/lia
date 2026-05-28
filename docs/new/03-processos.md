# Processos — Aneety Platform

## Desenvolvimento

1. Contrato primeiro: requisito, interface e critério de aceite antes da implementação.
2. Banco antes da UI: schema, migrations, RLS, seeds e fixtures antes das telas que dependem dos dados.
3. API antes dos frontends: endpoints, erros, permissões e testes de contrato antes de fluxos visuais.
4. Apps em incrementos pequenos: portal, API, PWA, desktop e dashboard evoluem por fatias testáveis.
5. Testes por módulo: unitários em pacotes, integração na API, E2E público por fluxo crítico.
6. Deploy por ambiente: build, smoke, publicação e E2E com evidência objetiva.
7. Revisão de copy: telas finais usam linguagem de produto e tarefa; detalhes técnicos ficam fora da UI comum.

## Operação

- Seed E2E controlado, idempotente e sem segredos no Git.
- Smoke público para portal, API, banco, login, pedido, checkpoint, anexo e dashboard.
- Verificação de secrets antes de deploy real, sem imprimir valores.
- Backup/export Postgres documentado antes de dados reais relevantes.
- Monitoramento recorrente orientado ao contrato, não a histórico de implementação.
- Registro de bloqueios objetivos: DNS, secret ausente, policy falha, migration pendente, E2E sem credencial.

## Migração do MVP para Aneety Platform

1. Extrair requisitos úteis do MVP atual e docs existentes.
2. Reescrever requisitos no vocabulário Aneety, mantendo Lia como tenant inicial.
3. Ignorar decisões temporárias que pertenciam ao protótipo.
4. Implementar primeiro `packages/core`, `packages/db` e `apps/api`.
5. Só depois expandir `apps/pwa`, `apps/desktop` e `apps/dashboard`.
6. Migrar evidências úteis: screenshots, E2E, nomes de status, permissões, fluxos e componentes shadcn.
7. Não copiar código sem revisar contrato, segurança, isolamento por tenant e copy de usuário final.

## Gate de conclusão por incremento

- Requisito rastreado.
- Migration aplicada em ambiente de teste.
- RLS/policies verificadas.
- API com teste de 401/403 e caso feliz.
- UI com estados de carregando, vazio, erro e sucesso.
- E2E ou smoke executado quando houver URL publicada.
- Sem segredos em diffs, logs ou bundle.

## Gate de serviços externos

Antes de aceitar qualquer dependência externa, confirmar:

- função semântica classificada, sem usar marca como requisito de produto;
- custo zero ou decisão explícita de bloqueio;
- dados trafegados/armazenados e segredos envolvidos;
- owner do módulo e contrato local versionado;
- adapter substituível ou plano de saída;
- testes smoke/E2E cobrindo a função e o modo de falha;
- ausência de segredo privilegiado em frontend, Git, bundle, log ou screenshot.

Se qualquer fornecedor exigir upgrade pago, runtime não permitido, lock-in de autenticação, lock-in de domínio ou acesso direto de frontend a banco/segredo, o incremento fica bloqueado até redesenho.
