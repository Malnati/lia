# Processos — Aneety Platform

## Desenvolvimento

1. Contrato primeiro: requisito, interface e critério de aceite antes da implementação.
2. Responsabilidade primeiro: definir `aneety-platform/apps/<responsabilidade>/...` antes de criar módulo.
3. Repositório primeiro: quando uma responsabilidade virar implementação própria, criar repo na org `https://github.com/Aneety` e linkar como submódulo em `Aneety/ai`.
4. Documentação central primeiro: registrar cada projeto/repositório em `Aneety/.github` com objetivo, owner, status, runtime, dados, contratos e links antes de tratá-lo como responsabilidade ativa.
5. Assets centrais primeiro: registrar todo asset reutilizável em SVG no repo `Aneety/assets` antes de reutilizá-lo em microfrontends, documentação, apresentação, marketing ou operação.
6. Banco antes da UI: schema do BFF, migrations, RLS, seeds e fixtures antes do microfrontend que depende dos dados.
7. BFF antes do microfrontend: endpoints, erros, permissões e testes de contrato antes de fluxos visuais.
8. Gateway antes da integração pública: rota, CORS, versão de contrato e encaminhamento pelo `worker-gateway` antes do E2E publicado.
9. Microfrontends em incrementos pequenos: cada `mfe-<nome>` evolui por fatias testáveis e integradas ao Single SPA.
10. Mapas e rastreabilidade em tempo real por contrato: eventos de localização, status e evidência devem ter schema, permissão e teste antes da UI.
11. Testes por módulo: unitários em contratos/pacotes, integração nos BFFs, E2E público por fluxo crítico.
12. Deploy por ambiente: build, smoke, publicação e E2E com evidência objetiva.
13. Revisão de copy: telas finais usam linguagem de produto e tarefa; detalhes técnicos ficam fora da UI comum.

## Operação

- Seed E2E controlado, idempotente e sem segredos no Git.
- Smoke público para microfrontend, gateway, BFF, banco, login, pedido, checkpoint, anexo, mapa, rastreabilidade e administração.
- Verificação de secrets antes de deploy real, sem imprimir valores.
- Backup/export Postgres documentado antes de dados reais relevantes.
- Monitoramento recorrente orientado ao contrato, não a histórico de implementação.
- Registro de bloqueios objetivos: DNS, secret ausente, policy falha, migration pendente, E2E sem credencial, mapa indisponível ou evento de rastreabilidade atrasado.
- Documentação oficial vive em `Aneety/.github`; GitHub Pages, se existir, publica ou aponta somente para documentação originada dessa fonte.
- Assets reutilizáveis vivem em `Aneety/assets`, com SVG canônico e histórico versionado.

## Migração do MVP para Aneety Platform

1. Extrair requisitos úteis do MVP atual e docs existentes.
2. Reescrever requisitos no vocabulário white-label genérico, mantendo Lia como tenant inicial.
3. Reclassificar pedidos, moldes, próteses, retirada, entrega e evidências odontológicas como demo, seeds e massas de teste.
4. Ignorar decisões temporárias que pertenciam ao protótipo.
5. Definir responsabilidades genéricas antes de criar diretórios concretos.
6. Criar repositórios próprios na org `Aneety` somente quando houver responsabilidade, owner, dados, custo zero sempre e aceite.
7. Linkar cada repo de responsabilidade como submódulo no orquestrador `Aneety/ai`.
8. Documentar o repo, a responsabilidade e seus contratos em `Aneety/.github`.
9. Migrar ou redesenhar assets reutilizáveis em SVG no repo `Aneety/assets`.
10. Implementar primeiro contratos compartilhados, `db-<nome>` e `worker-<nome>` da responsabilidade.
11. Integrar o `mfe-<nome>` Single SPA somente depois do BFF e do schema estarem verificáveis.
12. Migrar evidências úteis: screenshots, E2E, nomes de status, permissões, fluxos, mapas, rastreabilidade e componentes shadcn.
13. Não copiar código sem revisar contrato, segurança, isolamento por tenant e copy de usuário final.

## Gate de conclusão por incremento

- Requisito rastreado.
- Responsabilidade registrada em `aneety-platform/apps/<responsabilidade>/...`.
- Repositório próprio na org `Aneety` definido quando houver implementação própria.
- Submódulo linkado em `Aneety/ai` quando o repo existir.
- Documentação do projeto/repositório registrada em `Aneety/.github`.
- Assets reutilizáveis registrados em SVG no repo `Aneety/assets`.
- Prefixo técnico conforme contrato de nomes.
- Migration aplicada em ambiente de teste.
- RLS/policies verificadas.
- BFF com teste de 401/403 e caso feliz.
- Eventos de mapa e rastreabilidade testados quando o fluxo exigir localização ou status em tempo real.
- Microfrontend com estados de carregando, vazio, erro e sucesso quando houver UI.
- E2E ou smoke executado quando houver URL publicada.
- Documentação publicada ou apontada a partir de `Aneety/.github` quando houver guia, especificação ou documentação de desenvolvedor.
- Sem segredos em diffs, logs ou bundle.

## Gate de serviços externos

Antes de aceitar qualquer dependência externa, confirmar:

- função semântica classificada, sem usar marca como requisito de produto;
- custo zero sempre ou redesenho do incremento;
- dados trafegados/armazenados e segredos envolvidos;
- owner do módulo e contrato local versionado;
- adapter substituível ou plano de saída;
- testes smoke/E2E cobrindo a função e o modo de falha;
- ausência de segredo privilegiado em frontend, Git, bundle, log ou screenshot.

Se qualquer fornecedor exigir upgrade pago, runtime não permitido, lock-in de autenticação, lock-in de domínio, lock-in de mapas ou acesso direto de frontend a banco/segredo, o incremento fica bloqueado até redesenho.
