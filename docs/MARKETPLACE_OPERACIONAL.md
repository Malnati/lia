# Marketplace operacional — Lia

## Objetivo

Definir o fluxo de marketplace operacional para que consultórios, bureaus/produtores de próteses e entregadores possam ser encontrados, avaliados, selecionados e acionados dentro dos aplicativos Lia.

Este documento complementa `REQ.md` e descreve requisitos de produto e processo. Não define implementação de banco, API ou interface nesta etapa.

## Atores listados no marketplace

O marketplace deve exibir três tipos de atores operacionais:

- **Consultórios**: unidades que solicitam produção, retiradas, entregas e serviços relacionados ao fluxo de prótese.
- **Bureaus/produtores de próteses**: laboratórios, bureaus ou protéticos que recebem demandas de produção de próteses.
- **Entregadores**: operadores de coleta e entrega que transportam modelos, próteses e demais itens do fluxo operacional.

## Listagem, filtros e ordenação

O consultório deve poder acessar o marketplace no Desktop e no PWA para listar atores disponíveis.

A listagem deve oferecer filtro por tipo:

- consultórios;
- bureaus/produtores de próteses;
- entregadores.

A listagem deve permitir ordenar resultados por:

- nome;
- proximidade;
- favoritos;
- pontuação.

## Card e perfil do ator operacional

Cada item listado deve exibir, quando aplicável ao tipo de ator:

- nome público;
- avatar ou imagem de identificação;
- localização aproximada;
- preço, faixa de preço ou preço inicial;
- pontuação de clientes satisfeitos;
- contato operacional;
- disponibilidade de atendimento;
- indicador de favorito.

A localização deve ser aproximada. O marketplace não deve expor endereço completo sem intenção explícita do ator e autorização compatível com o fluxo.

## Favoritos

O consultório deve poder favoritar e desfavoritar atores do marketplace.

Regras:

- favorito pertence ao consultório/tenant logado;
- favoritos devem influenciar a ordenação quando o usuário escolher ordenar por favoritos;
- o estado favorito deve aparecer na listagem e no perfil do ator;
- desfavoritar não remove histórico, pedidos ou demandas já existentes.

## Demandas para bureaus/produtores de próteses

O consultório deve poder selecionar um bureau/produtor de próteses e enviar uma demanda de produção.

O bureau/produtor de próteses deve poder:

- receber a demanda requisitada pelo consultório;
- aceitar a demanda;
- rejeitar a demanda.

A rejeição deve registrar motivo simples e liberar o consultório para escolher outro bureau/produtor de próteses.

Estados mínimos da demanda de produção:

- `enviada`;
- `aceita`;
- `rejeitada`;
- `cancelada`.

## Demandas para entregadores

Entregadores devem poder receber demandas criadas por consultórios ou por bureaus/produtores de próteses.

O entregador deve poder:

- visualizar a demanda recebida;
- aceitar a demanda;
- rejeitar a demanda.

Estados mínimos da demanda de entrega:

- `oferecida`;
- `aceita`;
- `rejeitada`;
- `retirada`;
- `entregue`.

## Fotos de retirada e evidências de entrega

As entregas devem registrar evidências por foto em pontos críticos do fluxo.

Requisitos:

- ao retirar o modelo no consultório, o entregador deve poder tirar foto do modelo;
- ao retirar a prótese no bureau/produtor de próteses, o entregador deve poder tirar foto da prótese;
- as fotos devem representar evidências de check-in/check-out de entregas;
- cada evidência deve registrar origem, destino, data/hora, ator responsável e tipo de checkpoint.

Tipos mínimos de evidência:

- check-in de retirada no consultório;
- check-out de retirada no consultório;
- check-in de retirada no bureau/produtor de próteses;
- check-out de retirada no bureau/produtor de próteses;
- check-in de entrega no destino;
- check-out de entrega no destino.

## Superfícies do produto

O fluxo deve estar disponível nas superfícies operacionais:

- **Desktop**: uso operacional em atendimento, produção e logística.
- **PWA**: uso móvel em campo, especialmente por entregadores e operadores que precisam registrar fotos.

O dashboard administrativo pode configurar, auditar ou moderar participantes do marketplace, mas o fluxo operacional principal pertence ao Desktop e ao PWA.
