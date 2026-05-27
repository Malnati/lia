# Guia desktop/admin — Lia

Use este guia no painel desktop do app publicado em <https://malnati.github.io/lia/>. O GitHub Pages usa somente mock browser-side em IndexedDB; não há backend real neste repositório.

## 1. Visão geral do painel

1. Acesse <https://malnati.github.io/lia/> em viewport desktop.
2. No painel **Painel administrativo Lia**, confira o chip **mock / Mock browser-side** no topo.
3. Use a navegação lateral para alternar entre **Pedidos**, **Novo pedido**, **Retirada**, **Entrega** e **Sincronização**.
4. O cartão lateral **Offline pendente** mostra o volume de operações locais aguardando sync.

## 2. Pedidos

1. Abra **Pedidos** na navegação lateral.
2. Selecione um cartão de pedido.
3. Confira o detalhe com:
   - linha do tempo operacional;
   - dados do cliente;
   - endereço;
   - status de pagamento;
   - observações;
   - anexos offline.
4. Edite **Observações** e clique em **Salvar edição** para enfileirar atualização offline.

## 3. Novo pedido

1. Abra **Novo pedido**.
2. Preencha **Cliente**, **Telefone**, **Endereço de entrega**, **Produto** e **Observações do pedido**.
3. Clique em **Salvar novo pedido offline**.
4. O pedido aparece em **Pedidos** e a operação `create_order` entra na fila local.

## 4. Retirada

1. Selecione o pedido em **Pedidos**.
2. Abra **Retirada**.
3. Clique em **Marcar retirada check-in** quando o operador chegar ao local.
4. Clique em **Marcar retirada check-out** ao concluir a coleta.
5. Sincronize para gravar os checkpoints no mock backend.

## 5. Entrega

1. Selecione o pedido em **Pedidos**.
2. Abra **Entrega**.
3. Clique em **Marcar entrega check-in** quando o operador chegar ao destino.
4. Clique em **Marcar entrega check-out** ao concluir a entrega.
5. Sincronize para gravar os checkpoints no mock backend.

## 6. Pagamento, fotos e assinatura

1. Em **Pedidos**, abra o detalhe do pedido.
2. Clique em **Criar pagamento mock** para registrar a intenção de pagamento no mock.
3. Use o campo de foto para anexar imagem do molde.
4. Colete assinatura no canvas e clique em **Salvar assinatura**.
5. Todas as ações entram na fila local e devem ser sincronizadas.

## 7. Sincronização e inspeção do mock

1. Abra **Sincronização**.
2. Revise cada item pendente: operação, pedido e tentativas.
3. Clique em **Sincronizar agora**.
4. Abra <https://malnati.github.io/lia/mock/> diretamente ou pelo link **Mock**.
5. Clique em **Atualizar export** para confirmar os dados gravados no mock.
6. Use **Resetar seed mock** quando precisar voltar ao estado inicial.
