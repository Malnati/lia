# Guia mobile — Lia PWA

Use este guia no app publicado em <https://malnati.github.io/lia/>. O backend ativo no GitHub Pages é sempre o mock browser-side em IndexedDB.

## 1. Abrir e conferir o modo mock

1. Acesse <https://malnati.github.io/lia/> no celular ou em viewport mobile.
2. Confirme o topo com a marca **Lia** e o botão **Mock**.
3. Confira o cartão **Offline pendente** para ver quantos itens estão aguardando sincronização local.

## 2. Criar novo pedido

1. Toque em **Novo pedido +** ou na aba **Novo pedido**.
2. Preencha:
   - **Cliente**;
   - **Telefone**;
   - **Endereço de entrega**;
   - **Produto**; o padrão é `Molde prótese`;
   - **Observações do pedido**.
3. Toque em **Salvar novo pedido offline**.
4. O app mostra a mensagem de pedido salvo offline e adiciona o pedido à fila de sincronização.

## 3. Sincronizar com mock backend

1. Toque no botão **Sincronizar** no cartão superior ou abra a aba **Sync**.
2. Na aba **Sync**, confira **Itens pendentes** e as operações em fila.
3. Toque em **Sincronizar agora**.
4. Aguarde a mensagem `Sincronização concluída: ... enviados, 0 falhas.`.

## 4. Executar retirada

1. Selecione o pedido na aba **Pedidos**.
2. Abra a aba **Retirada**.
3. Toque em **Marcar retirada check-in**.
4. Toque em **Marcar retirada check-out**.
5. Volte à aba **Sync** para sincronizar as atualizações pendentes.

## 5. Executar entrega

1. Selecione o pedido na aba **Pedidos**.
2. Abra a aba **Entrega**.
3. Toque em **Marcar entrega check-in**.
4. Toque em **Marcar entrega check-out**.
5. Volte à aba **Sync** para sincronizar as atualizações pendentes.

## 6. Pagamento mock e anexos

1. Na aba **Pedidos**, role até o detalhe do pedido selecionado.
2. Toque em **Criar pagamento mock** para enfileirar a intenção de pagamento mock.
3. Use **Adicionar foto do molde** para salvar imagem compactada offline.
4. Assine no canvas e toque em **Salvar assinatura** para enfileirar assinatura offline.
5. Sincronize pela aba **Sync**.

## 7. Administrar o mock

1. Toque em **Mock** no topo.
2. Use **Atualizar export** para revisar o JSON do mock browser-side.
3. Use **Resetar seed mock** para limpar o estado remoto mock e recriar os pedidos iniciais.
4. Toque em **← Voltar ao app** para retornar.
