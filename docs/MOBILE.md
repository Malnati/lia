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
6. Manter fila local offline-first no app `lia-pwa`.
7. Ao voltar conexão, sincronizar com `api.aneety.com`.
8. Confirmar persistência no Supabase/Postgres real.

## Regras mobile

- Pagamento online deve exigir conexão.
- Anexos devem respeitar limite de 5 MB e tipos `image/webp`, `image/jpeg`, `image/png`.
- Service role nunca pode aparecer no PWA.
- O portal `lia` apenas aponta para o PWA; a implementação mobile pertence ao repo `lia-pwa`.

## Estado atual

O app mobile evolui no repo `/Users/mal/GitHub/malnati/lia-pwa` e publica em <https://pwa.aneety.com/>. Este repo `lia` publica somente o portal orquestrador.
