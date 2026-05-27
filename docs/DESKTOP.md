# Guia desktop/admin — Lia

## URL alvo

- Portal: <https://aneety.com/>
- Desktop operacional: <https://desktop.aneety.com/>
- Dashboard administrativo: <https://dashboard.aneety.com/>
- API real: <https://api.aneety.com/>

## Fluxo operacional alvo

1. Acessar `desktop.aneety.com`.
2. Entrar com Supabase Auth.
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

## Estado atual

O desktop/dashboard ainda estão em scaffolds separados. O PWA legado deste repo serve apenas como histórico até os repos `lia-desktop` e `lia-dashboard` assumirem os fluxos reais.
