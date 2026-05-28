# Guia desktop/admin — Lia

## URL alvo

- Portal: <https://aneety.com/>
- Desktop operacional: <https://desktop.aneety.com/>
- Dashboard administrativo: <https://dashboard.aneety.com/>
- API real: <https://api.aneety.com/>

GitHub Pages, se existir para este conteúdo, é somente guia de usuário. O aplicativo desktop/admin real roda no Cloudflare Pages em `desktop.aneety.com` e `dashboard.aneety.com`.

## Fluxo operacional alvo

1. Acessar `desktop.aneety.com`.
2. Entrar com autenticação Lia modelada no banco de dados.
3. Listar pedidos do tenant autorizado.
4. Abrir pedido.
5. Atualizar dados operacionais, status e checkpoints.
6. Consultar/anexar fotos e assinaturas.
7. Acompanhar pagamento e entrega.
8. Sincronizar com `api.aneety.com`, persistindo no Supabase/Postgres.

## Fluxo administrativo alvo

1. Acessar `dashboard.aneety.com`.
2. Entrar com perfil administrativo.
3. Criar/editar/inativar usuários.
4. Criar/editar perfis de acesso.
5. Associar usuário, perfil e tenant.
6. Configurar marca, cores, textos e operação white-label.
7. Validar métricas por consultório, clínica ou bureau.


## Limites de serviços no guia desktop/admin

O usuário deve usar os domínios `aneety.com`; nomes de fornecedores são detalhe operacional. Qualquer serviço externo usado por hospedagem, API, banco, storage, autenticação, pagamento ou telemetria deve respeitar o contrato semântico do `REQ.md`: custo zero, dados e secrets documentados, adapter substituível e sem dependência de IdP externo para login.

## Estado atual

Desktop e dashboard evoluem nos repos `/Users/mal/GitHub/malnati/lia-desktop` e `/Users/mal/GitHub/malnati/lia-dashboard`, publicados em seus subdomínios próprios. Este repo `lia` publica somente o portal orquestrador e status da plataforma.
