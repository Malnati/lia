# Guia mobile/PWA — Lia

## URL alvo

- PWA mobile: <https://pwa.aneety.com/>
- API real: <https://api.aneety.com/>

## Fluxo alvo

1. Acessar `pwa.aneety.com` no celular.
2. Instalar como PWA quando o navegador oferecer.
3. Entrar com Supabase Auth.
4. Criar pedido.
5. Registrar retirada, produção, entrega e anexos mesmo offline.
6. Manter fila local IndexedDB para ações pendentes.
7. Ao voltar conexão, sincronizar com `api.aneety.com`.
8. Confirmar persistência no Supabase/Postgres.

## Regras mobile

- Pagamento online deve exigir conexão.
- Anexos devem respeitar limite de 5 MB e tipos `image/webp`, `image/jpeg`, `image/png`.
- Service role nunca pode aparecer no PWA.

## Estado atual

O app mobile real será evoluído no repo `lia-pwa`. O PWA legado neste repo permanece temporário para consulta e testes históricos.
