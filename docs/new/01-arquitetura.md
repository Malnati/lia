# Arquitetura — Aneety Platform

## Visão

Aneety Platform será uma plataforma white-label para operar pedidos de produtos ou serviços customizados. O domínio genérico envolve consumidor, produtor, entrega, evidências, mapas, rastreabilidade em tempo real e garantia de qualidade do pedido e do item personalizado. Lia será o primeiro tenant/marca, e os fluxos odontológicos do MVP ficam como carga inicial de demonstração, seeds e massas de teste.

A implementação nasce na org `https://github.com/Aneety`, com `Aneety/ai` como repositório orquestrador. Cada responsabilidade ou derivação deve ter repositório próprio e ser linkada como submódulo no orquestrador. A documentação canônica de todos os projetos/repositórios deve viver em `Aneety/.github` (`https://github.com/Aneety/.github.git`), incluindo arquitetura, catálogo de repositórios, guias, ADRs e especificações. Assets reutilizáveis devem viver em `Aneety/assets` (`https://github.com/Aneety/assets.git`) com versão SVG canônica.

## Regra de módulos e submódulos

Toda responsabilidade deve existir sob `aneety-platform/apps/<responsabilidade>/...` dentro do repo orquestrador `Aneety/ai`. Dentro de cada responsabilidade, o nome do diretório deve seguir o padrão `aneety-platform/apps/<responsabilidade>/<mfe|mc|gw|worker|fe|job|auto|db|pkg|core|int|wl>-<nome>`.

```text
Aneety/ai
  aneety-platform/
    apps/
      <responsabilidade>/
        mfe-<nome>       Microfrontend Single SPA.
        mc-<nome>        Microserviço quando a responsabilidade exigir runtime próprio futuro.
        gw-<nome>        Gateway Kong/API gateway ou equivalente futuro.
        worker-<nome>    BFF ou workload HTTP serverless em Cloudflare/serverless/Hono.
        fe-<nome>        Frontend não operacional ou superfície fora do Single SPA.
        job-<nome>       Job batch, RAG, agente ou rotina operacional.
        auto-<nome>      Automação Codex/Cursor/Cron.
        db-<nome>        Migrations, RLS, seeds e schema do BFF.
        pkg-<nome>       Pacote compartilhado local da responsabilidade.
        core-<nome>      Contrato/domínio central compartilhado.
        int-<nome>       Integração ou adapter externo.
        wl-<nome>        Workload operacional não coberto por worker, microserviço ou job.
    tests/
    scripts/
```

Cada diretório folha representa um submódulo Git quando existir implementação própria. A lista define categorias possíveis; não obriga toda responsabilidade a possuir todos os módulos. Cada responsabilidade será criada somente quando houver contrato, owner, dados, aceite, custo zero sempre e limite de escopo.

## Runtime alvo do MVP

- Todos os frontends operacionais serão microfrontends Single SPA.
- BFFs do MVP serão `worker-<nome>` em Cloudflare/serverless/Hono.
- Gateway inicial será `worker-gateway`, também em Cloudflare/serverless/Hono.
- Gateway futuro será `gw-<nome>` com Kong/API gateway ou equivalente.
- Banco do MVP será Supabase/Postgres com schema por BFF.
- Banco futuro será Postgres com banco de dados por BFF, preservando contratos e migrations.
- Storage atua como adapter para bytes; metadados, autorização e lifecycle pertencem ao schema do BFF responsável.
- Pagamentos atuam como adapter; pedido e conciliação permanecem no domínio Aneety.
- Mapas, localização, mensagens, IA, observabilidade e integrações futuras entram por interfaces substituíveis.
- Documentação oficial fica em `Aneety/.github`: guias de usuário, documentação de desenvolvedor, especificações, ADRs, arquitetura e catálogo de repositórios.
- Assets reutilizáveis ficam em `Aneety/assets`, versionados em SVG e referenciados pelos repos de implementação quando necessário.

## Fluxo de dados

1. Usuário entra por um microfrontend Single SPA publicado sob `aneety.com`.
2. O microfrontend chama `worker-gateway` para login, sessão e roteamento de operações.
3. `worker-gateway` valida borda, CORS, versão de contrato e encaminha para o BFF `worker-*` da responsabilidade.
4. O BFF valida sessão própria, resolve tenant, usuário, perfil e permissões.
5. O BFF executa regra de domínio e persiste no schema Supabase/Postgres da sua responsabilidade.
6. RLS e policies reforçam isolamento por tenant dentro de cada schema.
7. Eventos de status, localização e evidência alimentam mapas e rastreabilidade em tempo real por contrato local.
8. Apps nunca recebem segredo privilegiado nem acessam banco diretamente.

## Evolução planejada

- `worker-gateway` é escolha de MVP para custo zero sempre e simplicidade operacional.
- Quando tráfego, governança ou roteamento exigirem, gateway migra para `gw-*` Kong/API gateway sem gasto obrigatório.
- Schemas Supabase/Postgres por BFF são escolha de MVP para isolamento lógico e velocidade.
- Quando operação exigir isolamento físico, cada BFF migra para Postgres com banco de dados por BFF sem quebrar contratos.
- A migração futura não pode alterar contratos de microfrontend, sessão, permissão, erro, auditoria, mapa ou rastreabilidade sem ADR explícita.

## Limites semânticos de serviços externos

Cloudflare, GitHub, Supabase, provedores de storage, pagamento, e-mail, mapas, IA, observabilidade ou qualquer serviço equivalente são **meios substituíveis**, não requisitos de produto por marca. A decisão arquitetural deve sempre registrar a função semântica exercida:

- hospedagem estática de microfrontends;
- runtime stateless de gateway e BFF;
- banco transacional relacional;
- autenticação e autorização modeladas no banco da plataforma;
- armazenamento de bytes com metadados e permissão no schema do BFF responsável;
- versionamento, PR, CI e submódulos Git;
- documentação centralizada em `Aneety/.github`;
- acervo de assets reutilizáveis em SVG centralizado em `Aneety/assets`;
- DNS/CDN;
- integrações auxiliares como pagamentos, mensagens, e-mail, mapas, IA, filas, analytics e observabilidade.

Limites obrigatórios:

- nenhum serviço pago, proprietário ou específico de fornecedor pode virar caminho obrigatório de aceite;
- SDK, claim, id de usuário, URL ou recurso exclusivo de fornecedor não pode definir regra de domínio;
- cada integração deve ter contrato local, dados tratados, segredos, custo, owner, testes e plano de saída;
- smoke/E2E validam a função semântica, não apenas o nome do fornecedor;
- frontends nunca dependem de banco, IdP externo ou chave pública de fornecedor para autenticação;
- GitHub Pages não hospeda operação transacional; se existir, deve publicar ou apontar somente para documentação mantida em `Aneety/.github`.

## Regras arquiteturais

- Custo zero sempre; qualquer dependência paga vira bloqueio até redesenho ou decisão formal que não seja critério obrigatório do MVP.
- Segredos ficam somente em gateway, BFF, CI seguro ou ambiente local ignorado pelo Git.
- Frontends não acessam banco diretamente para autenticação ou autorização.
- UI de usuário final não expõe nomes de infraestrutura, banco, runtime, framework, secrets ou fornecedores.
- Termos técnicos ficam em docs internas, logs técnicos, runbooks e telas de operador técnico quando existirem.
- Cada módulo deve ter contrato, testes e owner claro antes de expandir escopo.
- Cada implementação com responsabilidade própria deve viver em repo próprio na org `Aneety` e entrar no orquestrador `Aneety/ai` como submódulo.
- Todos os projetos/repositórios devem ser documentados em `Aneety/.github`; repos de implementação mantêm apenas README mínimo, badges e links para a documentação canônica.
- Todos os assets reutilizáveis devem ser versionados em SVG no repo `Aneety/assets`; repos de implementação não devem criar variações locais sem registrar a fonte SVG canônica.
