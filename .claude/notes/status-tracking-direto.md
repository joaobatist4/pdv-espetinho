# Status tracking para itens "Direto" (não-cozinha)

## Contexto

Itens com `goesToKitchen = false` (ex: bebidas, porções prontas) são entregues diretamente
pelo garçom sem passar pela cozinha. Atualmente eles entram com status `Aguardando` e
nunca avançam, pois o fluxo de status só está ativado para itens de cozinha.

## O que foi desativado

- Badge de status (Aguardando / Preparando / Pronto / Entregue) em itens diretos
- Botões "Marcar Preparando / Pronto / Entregue" em itens diretos
- Fundo colorido por status em itens diretos (ficou neutro)

**Arquivos afetados:**
- `frontend/src/features/orders/OrdersPage.tsx` — modal de detalhe do pedido
- `frontend/src/features/pdv/PdvPage.tsx` — seção "ENVIADOS AO PEDIDO"

## Implementação futura

Quando fizer sentido, pode-se ativar um fluxo simplificado para itens diretos:

**Opção A — Dois estados apenas (Aguardando → Entregue):**
- Garçom clica em "Marcar Entregue" na tela de Pedidos
- Sem "Preparando" nem "Pronto" no meio
- Bom para confirmar que o garçom efetivamente entregou

**Opção B — Automático:**
- Ao adicionar um item direto ao pedido, já setá-lo como `Entregue` automaticamente
- Remove a responsabilidade do garçom de confirmar
- Mais simples, mas perde rastreabilidade

**Backend já suporta:** o `UpdateOrderItemStatus` funciona para qualquer item,
independente de `GoesToKitchen`. Basta reabilitar na UI.

## Para reativar

Em `OrdersPage.tsx`, remova a condição `{item.goesToKitchen && ...}` no badge
e altere `canAdvance` para não filtrar por `goesToKitchen`.

Em `PdvPage.tsx`, remova a condição `{item.goesToKitchen && ...}` no badge.
