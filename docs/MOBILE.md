# Guia mobile — Lia PWA

Use este guia no app publicado em <https://malnati.github.io/lia/>. O backend ativo no GitHub Pages é sempre o mock browser-side em IndexedDB.

## 1. Abrir e conferir o modo mock

1. Acesse <https://malnati.github.io/lia/> no celular ou em viewport mobile.
2. Confirme o topo com a marca **Lia** e o botão **Mock**.
3. Confira o badge **Operação Lia** e a indicação **White-label pronto para outras operações**.
4. Confira o cartão **Offline pendente** para ver quantos itens estão aguardando sincronização local.

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
5. Se houver falha, confira a mensagem no item pendente; criação de pedido exige cliente, telefone e endereço, checkpoint exige pedido existente e `checkpointKey`, anexo/pagamento exigem pedido existente no mock, e operação desconhecida indica fila local corrompida.

## 4. Consultórios e moldes

1. Toque na aba **Consultórios**.
2. Confira os KPIs de consultórios/clientes ativos, moldes em produção e pedidos aguardando conclusão.
3. Use a lista para revisar os consultórios que pedem próteses e os moldes em fluxo.

## 5. Produção de próteses

1. Toque na aba **Produção**.
2. Confira o pipeline da empresa de próteses.
3. Revise pedidos no pipeline, próteses em produção e próteses prontas para entrega.

## 6. Executar retirada

1. Selecione o pedido na aba **Pedidos**.
2. Abra a aba **Retirada**.
3. Toque em **Marcar retirada check-in**.
4. Toque em **Marcar retirada check-out**.
5. Volte à aba **Sync** para sincronizar as atualizações pendentes.

## 7. Executar entrega

1. Selecione o pedido na aba **Pedidos**.
2. Abra a aba **Entrega**.
3. Toque em **Marcar entrega check-in**.
4. Toque em **Marcar entrega check-out**.
5. Volte à aba **Sync** para sincronizar as atualizações pendentes.

## 8. Pagamento mock e anexos

1. Na aba **Pedidos**, role até o detalhe do pedido selecionado.
2. Toque em **Criar pagamento mock** para enfileirar a intenção de pagamento mock; a intenção só sincroniza se o pedido existir no mock.
3. Use **Adicionar foto do molde** para salvar imagem compactada offline.
4. Assine no canvas e toque em **Salvar assinatura** para enfileirar assinatura offline.
5. Sincronize pela aba **Sync** e confira tentativas/erros se algum item ficar pendente.

## 9. Administrar o mock

1. Toque em **Mock** no topo.
2. Use **Atualizar export** para revisar o JSON do mock browser-side.
3. Use **Resetar seed mock** para limpar o estado remoto mock e recriar os pedidos iniciais.
4. Toque em **← Voltar ao app** para retornar.
