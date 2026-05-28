# Estratégia de descontinuação do MVP Lia

## Objetivo

Encerrar o MVP Lia como linha ativa de implementação e preservar seu valor como evidência histórica, fonte de requisitos e aprendizado técnico. O sucessor é **Aneety Platform**, uma plataforma white-label para operação de próteses dentárias, com Lia como primeiro tenant.

## Motivos para encerrar a linha atual

- O MVP acumulou pivôs de arquitetura, produto, runtime, autenticação e publicação em pouco tempo.
- A divisão em vários repositórios surgiu antes de contratos, banco e processos estarem estáveis.
- Partes da implementação e testes ainda carregam decisões temporárias de protótipo e autenticação transitória.
- O contrato atual evoluiu mais rápido que a base de código, criando diferença entre intenção, documentação e apps publicados.
- Um novo monorepo permite recomeçar com limites claros, sem apagar o aprendizado nem manter dívida como base permanente.

## O que preservar

- Domínio de negócio de prótese dentária no Paraguai.
- Fluxo de pedidos, produção de moldes, produção de próteses, retirada, entrega e evidências.
- Marketplace operacional para consultórios, bureaus/produtores e entregadores.
- PWA offline-first para campo e entregadores.
- Desktop operacional para atendimento, produção e logística.
- Dashboard administrativo para usuários, perfis, tenants, permissões e white-label.
- API HTTP em Worker/Hono.
- Postgres relacional com RLS e migrations versionadas.
- shadcn/ui, Tailwind e tokens semânticos nos frontends.
- Publicação sob `aneety.com` e custo zero enquanto possível.

## O que não carregar para o sucessor

- Protótipo local no navegador como critério de aceite.
- Backend convencional de servidor como arquitetura final.
- Banco documental do primeiro desenho como fonte transacional.
- Publicação operacional em páginas de documentação ou preview de fornecedor.
- Login de frontend acoplado a chave pública de banco ou provedor externo de identidade.
- Segredos, chaves privilegiadas ou credenciais em frontend, Git, screenshots ou logs.
- Apps finais espalhados em múltiplos repositórios antes de estabilizar contratos.

## Processo de arquivamento

1. Criar branch ou tag final do MVP com data e commit de referência.
2. Manter todos os repositórios `lia-*` acessíveis como fontes históricas.
3. Atualizar o README principal do projeto atual em etapa posterior, apontando para o novo repositório quando ele existir.
4. Preservar screenshots, E2E, migrations e contratos como evidência, não como base obrigatória de implementação.
5. Bloquear novas features no MVP atual; aceitar apenas correções documentais ou segurança de transição.
6. Criar checklist de evidências para cada decisão transferida ao novo monorepo.

## Checklist mínimo de evidências

- Requisito rastreado para fonte original.
- Decisão registrada em `docs/new`.
- Regra de custo e runtime explicitada.
- Dados, segredos e permissões classificados.
- Migração ou schema proposto antes da UI.
- Teste ou critério de aceite associado.
