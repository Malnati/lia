# Processos — Aneety Platform

## Desenvolvimento

1. Contrato primeiro: requisito, interface e critério de aceite antes da implementação.
2. Responsabilidade primeiro: definir `aneety-platform/apps/<responsabilidade>/...` antes de criar módulo.
3. Banco antes da UI: schema do BFF, migrations, RLS, seeds e fixtures antes do microfrontend que depende dos dados.
4. BFF antes do microfrontend: endpoints, erros, permissões e testes de contrato antes de fluxos visuais.
5. Gateway antes da integração pública: rota, CORS, versão de contrato e encaminhamento pelo `worker-gateway` antes do E2E publicado.
6. Microfrontends em incrementos pequenos: cada `mfe-<nome>` evolui por fatias testáveis e integradas ao Single SPA.
7. Testes por módulo: unitários em contratos/pacotes, integração nos BFFs, E2E público por fluxo crítico.
8. Deploy por ambiente: build, smoke, publicação e E2E com evidência objetiva.
9. Revisão de copy: telas finais usam linguagem de produto e tarefa; detalhes técnicos ficam fora da UI comum.

## Operação

- Seed E2E controlado, idempotente e sem segredos no Git.
- Smoke público para microfrontend, gateway, BFF, banco, login, pedido, checkpoint, anexo e administração.
- Verificação de secrets antes de deploy real, sem imprimir valores.
- Backup/export Postgres documentado antes de dados reais relevantes.
- Monitoramento recorrente orientado ao contrato, não a histórico de implementação.
- Registro de bloqueios objetivos: DNS, secret ausente, policy falha, migration pendente, E2E sem credencial.

## Migração do MVP para Aneety Platform

1. Extrair requisitos úteis do MVP atual e docs existentes.
2. Reescrever requisitos no vocabulário Aneety, mantendo Lia como tenant inicial.
3. Ignorar decisões temporárias que pertenciam ao protótipo.
4. Definir responsabilidades genéricas antes de criar diretórios concretos.
5. Implementar primeiro contratos compartilhados, `db-<nome>` e `worker-<nome>` da responsabilidade.
6. Integrar o `mfe-<nome>` Single SPA somente depois do BFF e do schema estarem verificáveis.
7. Migrar evidências úteis: screenshots, E2E, nomes de status, permissões, fluxos e componentes shadcn.
8. Não copiar código sem revisar contrato, segurança, isolamento por tenant e copy de usuário final.

## Gate de conclusão por incremento

- Requisito rastreado.
- Responsabilidade registrada em `aneety-platform/apps/<responsabilidade>/...`.
- Prefixo técnico conforme contrato de nomes.
- Migration aplicada em ambiente de teste.
- RLS/policies verificadas.
- BFF com teste de 401/403 e caso feliz.
- Microfrontend com estados de carregando, vazio, erro e sucesso quando houver UI.
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
