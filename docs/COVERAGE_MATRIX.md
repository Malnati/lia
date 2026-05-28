# Matriz de cobertura — Lia

`REQ.md` é a fonte de verdade. Esta matriz registra evidência mínima para smoke/E2E e lacunas antes de declarar 100%.

| Requisito | Evidência atual | Status |
| --- | --- | --- |
| Runtime único dos frontends | `lia`, `lia-core`, `lia-pwa`, `lia-desktop` e `lia-dashboard` devem publicar apps somente em Cloudflare Pages sob `*.aneety.com`. GitHub fica para versionamento, CI e PR. | Obrigatório |
| GitHub Pages não é runtime de app | `pnpm test:runtime-contract` deve fazer grep/classificação de `github.io`, `GitHub Pages` e `gh-pages`; workflows de app com GitHub Pages bloqueiam conclusão. | Obrigatório |
| GitHub Pages como documentação | Permitido apenas para guias de usuário/documentação; páginas assim devem apontar o uso real para `*.aneety.com`. | Permitido com restrição |
| E2E publicado | Playwright deve usar `aneety.com` e falhar se links/app URLs resolverem para `github.io` ou branch `gh-pages`. | Obrigatório |
| Guias de usuário | Guias mobile, desktop e dashboard devem explicar que app real roda em Cloudflare Pages e API real em Worker/Hono. | Obrigatório |
| Marketplace operacional | `docs/MARKETPLACE_OPERACIONAL.md` registra fluxo de listagem, favoritos, demandas para bureaus/produtores, entregadores e evidências por foto. Ainda não há schema/API/UI/E2E; próxima etapa deve quebrar em requisitos implementáveis por repo. | Lacuna planejada |

## Checklist incremental

1. Validar contrato em `REQ.md`.
2. Validar workflows dos repositórios locais existentes.
3. Rodar smoke/teste de contrato anti-GitHub Pages.
4. Rodar E2E publicado em `aneety.com` quando credenciais e URLs estiverem disponíveis.
5. Só depois ampliar novas coberturas funcionais/exceções.
