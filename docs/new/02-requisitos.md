# Requisitos — Aneety Platform

## Produto

Aneety Platform deve oferecer operação white-label para produtos e serviços customizados. O fluxo central precisa acomodar consumidor, produtor, pedido, personalização, garantia de qualidade, retirada, entrega, evidências, mapas e rastreabilidade em tempo real. Lia é a primeira configuração de marca; os fluxos odontológicos do MVP são carga inicial de demonstração, seeds e massas de teste.

### Pedidos customizados

- Criar, listar, editar, cancelar e acompanhar pedidos.
- Registrar consumidor, contato, produto/serviço, especificação de personalização, endereço, observações, status e pagamento.
- Permitir responsáveis por etapa e histórico de atualização.
- Exibir rastreabilidade em tempo real do pedido, incluindo etapa atual, responsável, localizações relevantes e pendências de qualidade.

### Produção ou execução customizada

- Enviar demanda para produtor, operador ou equipe responsável.
- Permitir aceite, rejeição, cancelamento e andamento.
- Registrar início, conclusão, responsável, notas, checklist de qualidade e evidências.
- Separar execução feita por equipe própria, equipe associada ou operador terceiro.

### Garantia de qualidade

- Registrar checkpoints de qualidade antes, durante e depois da produção ou execução.
- Bloquear avanço quando evidência obrigatória, aprovação ou correção estiver pendente.
- Manter trilha de auditoria para alterações sensíveis de status, responsável, localização e aprovação.

### Retirada, entrega e mapas

- Criar demandas de coleta e entrega.
- Permitir aceite/rejeição por entregador.
- Registrar check-in, check-out, origem, destino, responsável, localização operacional e evidências.
- Exibir mapas para acompanhamento de retirada, entrega, origem, destino e eventos relevantes.
- Manter rastreabilidade em tempo real para consumidor e operação, respeitando permissões por tenant e perfil.

### Anexos e evidências

- Suportar fotos, assinaturas e documentos em checkpoints críticos.
- Armazenar metadados no banco com tenant, pedido, ator, origem, destino, data/hora, localização quando aplicável, tipo e permissão.
- Controlar tamanho, tipo, acesso e lifecycle.

### Pagamentos

- Criar intenção de pagamento.
- Consultar status.
- Conciliar pagamento com pedido.
- Permitir operação sem corromper pedido quando provedor externo estiver indisponível.

### Marketplace operacional

- Listar consumidores, produtores, operadores e entregadores conforme o tenant permitir.
- Filtrar por tipo e ordenar por nome, proximidade, favoritos, disponibilidade e pontuação.
- Favoritar/desfavoritar atores por tenant.
- Enviar demandas de produção, execução, coleta e entrega.
- Registrar motivos simples de rejeição.

### White-label por tenant

- Configurar nome, marca, logo, cores, textos principais, fluxos ativos e operação.
- Manter fluxos centrais genéricos para qualquer produto ou serviço customizado.
- Lia é a primeira configuração de marca.

### Carga inicial de demonstração e testes

- Manter pedidos, moldes, próteses, retirada, entrega e evidências do MVP odontológico como seed/demo/test mass.
- Usar o fluxo odontológico para validar pedidos customizados, produção por terceiros, checklists de qualidade, anexos, mapas, rastreabilidade, coleta e entrega.
- Não tratar a vertical odontológica do Paraguai como limite do produto ou requisito exclusivo de domínio.

### Administração

- Gerir usuários, identidades, perfis, permissões e status ativo/inativo.
- Associar usuário, tenant e perfil.
- Exibir métricas por tenant, operação, qualidade, produção, entrega e rastreabilidade.

## Técnico

- Org GitHub oficial: `https://github.com/Aneety`.
- Clone root local obrigatório: `/Users/mal/GitHub/Aneety/*`.
- Todo remoto `https://github.com/Aneety/<repo>` deve corresponder ao clone local `/Users/mal/GitHub/Aneety/<repo>`.
- Repo orquestrador de implementação: `Aneety/ai` (`https://github.com/Aneety/ai.git`, clone local `/Users/mal/GitHub/Aneety/ai`).
- Repo canônico de documentação: `Aneety/.github` (`https://github.com/Aneety/.github.git`, clone local `/Users/mal/GitHub/Aneety/.github`).
- Repo canônico de assets reutilizáveis: `Aneety/assets` (`https://github.com/Aneety/assets.git`, clone local `/Users/mal/GitHub/Aneety/assets`).
- Cada responsabilidade/derivação deve ter repositório próprio, clone local em `/Users/mal/GitHub/Aneety/<repo>` e link como submódulo no orquestrador.
- Cada projeto/repositório deve estar documentado em `Aneety/.github`, incluindo objetivo, owner, status, runtime, dados, contratos, critérios de aceite e links operacionais.
- Todo asset reutilizável do projeto deve estar versionado em SVG no repo `Aneety/assets`, incluindo logos, ícones, ilustrações, diagramas, marcas, pictogramas e elementos visuais compartilhados.
- Todos os frontends operacionais devem ser microfrontends Single SPA.
- Cada responsabilidade deve viver em `aneety-platform/apps/<responsabilidade>/...`.
- Cada microfrontend deve usar `mfe-<nome>` e chamar somente gateway/BFF, nunca banco direto.
- Gateway do MVP deve ser `worker-gateway` em Cloudflare/serverless/Hono.
- Cada BFF do MVP deve ser `worker-<nome>` em Cloudflare/serverless/Hono.
- Cada BFF deve possuir contrato HTTP, erros JSON padronizados, 401 para sessão ausente/inválida e 403 para permissão insuficiente.
- Banco do MVP deve ser Supabase/Postgres com schema por BFF.
- Banco futuro deve ser Postgres com banco de dados por BFF.
- Autenticação própria em banco: identidades, credenciais, sessões, tokens, expiração, revogação e rotação.
- Autorização por tenant, perfil e permissões, aplicada no gateway/BFF e reforçada por RLS.
- Isolamento cross-tenant obrigatório.
- Experiência offline-first deve manter fila local para pedidos, checkpoints, anexos, mapas, rastreabilidade e pagamentos pendentes.
- E2E público somente em `aneety.com`.
- Guias de usuários, documentação de desenvolvedor, especificações, ADRs, arquitetura e catálogo de repositórios vivem em `Aneety/.github`; GitHub Pages, se existir, deve publicar ou apontar somente para essa documentação.
- Assets reutilizáveis devem ser consumidos de `Aneety/assets` ou referenciar sua fonte SVG canônica nesse repositório.
- Frontends não exigem variável pública de banco para login.
- Migrations e seeds ficam versionados no submódulo `db-<nome>` da responsabilidade.
- Cada microfrontend usa shadcn/ui e tokens semânticos.

### Serviços externos por função semântica

- Hospedagem, gateway, BFF, banco, storage, CI, DNS/CDN, pagamentos, mensagens, e-mail, mapas, IA, observabilidade, filas e analytics devem ser requisitos por função, não por fornecedor.
- Qualquer serviço usado deve declarar dados tratados, segredos envolvidos, custo, alternativa de saída, contrato local e testes de degradação.
- Serviços pagos ou upgrades de plano não são caminho obrigatório: custo zero sempre.
- Autenticação de usuário final pertence ao modelo de dados e ao gateway/BFF Aneety; provedor externo de identidade pode existir apenas como adapter opcional futuro, nunca como requisito de login.
- Se um serviço externo ficar indisponível, a plataforma deve preservar integridade do pedido, sessão, permissões, anexos, mapas, rastreabilidade e auditoria conforme o contrato local.
