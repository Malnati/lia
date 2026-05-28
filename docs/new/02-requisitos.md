# Requisitos — Aneety Platform

## Produto

Aneety Platform deve oferecer operação white-label de próteses dentárias, iniciando com Lia como primeiro tenant.

### Pedidos

- Criar, listar, editar, cancelar e acompanhar pedidos.
- Registrar cliente, contato, produto, endereço, observações, status e pagamento.
- Permitir responsáveis por etapa e histórico de atualização.

### Produção de moldes

- Registrar início e conclusão da produção de modelo/molde.
- Permitir responsáveis, data/hora, notas e evidências.
- Separar produção feita por consultório, equipe associada ou operador terceiro.

### Produção de próteses

- Enviar demanda para bureau/produtor.
- Permitir aceite, rejeição, cancelamento e andamento.
- Registrar início, conclusão, responsável e evidências.

### Retirada e entrega

- Criar demandas de coleta e entrega.
- Permitir aceite/rejeição por entregador.
- Registrar check-in, check-out, origem, destino, responsável e evidências.

### Anexos e evidências

- Suportar fotos e assinaturas em checkpoints críticos.
- Armazenar metadados no banco com tenant, pedido, ator, origem, destino, data/hora, tipo e permissão.
- Controlar tamanho, tipo, acesso e lifecycle.

### Pagamentos

- Criar intenção de pagamento.
- Consultar status.
- Conciliar pagamento com pedido.
- Permitir operação sem corromper pedido quando provedor externo estiver indisponível.

### Marketplace operacional

- Listar consultórios, bureaus/produtores e entregadores.
- Filtrar por tipo e ordenar por nome, proximidade, favoritos e pontuação.
- Favoritar/desfavoritar atores por tenant.
- Enviar demandas de produção e entrega.
- Registrar motivos simples de rejeição.

### White-label por tenant

- Configurar nome, marca, logo, cores, textos principais e operação.
- Manter fluxos centrais genéricos.
- Lia é a primeira configuração de marca.

### Administração

- Gerir usuários, identidades, perfis, permissões e status ativo/inativo.
- Associar usuário, tenant e perfil.
- Exibir métricas por tenant e operação.

## Técnico

- Autenticação própria em banco: identidades, credenciais, sessões, tokens, expiração, revogação e rotação.
- Autorização por tenant, perfil e permissões, aplicada na API e reforçada por RLS.
- Isolamento cross-tenant obrigatório.
- PWA offline-first com fila local para pedidos, checkpoints, anexos e pagamentos pendentes.
- API única para frontends, com erros JSON padronizados, 401 para sessão ausente/inválida e 403 para permissão insuficiente.
- E2E público somente em `aneety.com`.
- Frontends não exigem variável pública de banco para login.
- Migrations e seeds ficam versionados no monorepo.
- Cada app usa shadcn/ui e tokens semânticos.

### Serviços externos por função semântica

- Hospedagem, API, banco, storage, CI, DNS/CDN, pagamentos, mensagens, e-mail, mapas, IA, observabilidade, filas e analytics devem ser requisitos por função, não por fornecedor.
- Qualquer serviço usado deve declarar dados tratados, segredos envolvidos, custo, alternativa de saída, contrato local e testes de degradação.
- Serviços pagos ou upgrades de plano não são caminho obrigatório enquanto o requisito exigir custo zero.
- Autenticação de usuário final pertence ao modelo de dados e à API Aneety; provedor externo de identidade pode existir apenas como adapter opcional futuro, nunca como requisito de login.
- Se um serviço externo ficar indisponível, a plataforma deve preservar integridade do pedido, sessão, permissões, anexos e auditoria conforme o contrato local.
