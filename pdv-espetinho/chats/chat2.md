# Gestão de Insumos

_Started 2026-05-06 17:34 UTC_

---

## User

No estoque eu preciso cadastrar Insumos também, além de produtos que são vendidos no estabelecimento. Como podemos fazer ?

## Assistant

_[tool: list_files]_

_[tool: read_file]_

_[tool: read_file]_

Vou olhar a estrutura geral do app e o módulo de cadastro pra entender o sistema visual atual antes de propor a solução.

_[tool: read_file]_

_[tool: read_file]_

Ótimo, entendi a estrutura. Vou propor e implementar a solução para cadastrar **Insumos** (matéria-prima/ingredientes) separadamente dos Produtos vendidos.

## Conceito

Hoje o `Estoque` é controlado apenas para itens com `stock: true` no MENU (basicamente bebidas — produtos de revenda). Para **insumos** (carne, carvão, óleo, gás, palitos, farinha, etc.), o ideal é tratá-los como uma entidade **paralela**, não como produto vendável:

| | **Produto** | **Insumo** |
|---|---|---|
| Aparece no PDV | ✅ Sim | ❌ Não |
| Tem preço de venda | ✅ Sim | ❌ Não (tem custo) |
| Controle de estoque | Opcional (bebidas) | ✅ Sempre |
| Categorias | espetos, pratos… | Carnes, Hortifruti, Descartáveis, Gás/Carvão, Limpeza… |
| Unidade | un, espeto, prato | kg, g, L, ml, un, pacote |

Vou implementar:

1. **Nova aba "🥩 Insumos"** no módulo Cadastro com CRUD completo (nome, categoria, unidade, custo, estoque mínimo, fornecedor opcional)
2. **Filtro/toggle "Produtos | Insumos"** no módulo Estoque para alternar entre as duas visões, com entrada/baixa/ajuste igual aos produtos
3. **Categorias específicas de insumo** (Carnes, Hortifruti, Descartáveis, Gás/Carvão, Limpeza, Outros)
4. **Reducer actions** novas: `ADD_SUPPLY`, `UPDATE_SUPPLY`, `REMOVE_SUPPLY`, `SUPPLY_ENTRY`, `SUPPLY_ADJUST`
5. **Card de resumo** no Estoque mostrando custo total imobilizado em insumos
6. **(Futuro/opcional)** vincular insumo→produto pra dar baixa automática (ex: 1 espeto de carne = 0,12 kg de carne bovina). Posso adicionar se quiser, mas começaria simples.

Quer que eu siga com essa implementação? Posso ir direto, ou prefere:

- **(A)** Implementação simples — só o cadastro + estoque de insumos paralelo (recomendo começar por aqui)
- **(B)** Implementação completa — incluindo a "ficha técnica" (vínculo produto↔insumo com baixa automática no fechamento da mesa)
- **(C)** Algo intermediário — cadastro + ficha técnica manual (sem baixa automática agora)

Me confirma a opção e eu já parto pra implementar.

## User

A

## Assistant

_[tool: snip]_

Vou implementar a opção A: cadastro de insumos paralelo + visão de estoque dedicada. Plano:

1. `data.js` — categorias de insumo + insumos seed + estoque seed
2. Reducer (HTML) — actions de insumo
3. `module-cadastro.jsx` — nova aba **Insumos**
4. `module-estoque.jsx` — toggle **Produtos | Insumos**

_[tool: update_todos]_

### 1) `data.js` — categorias + seeds

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

### 2) Reducer (HTML) — actions de insumo

_[tool: str_replace_edit]_

(Pulei essa edição vazia.) Adicionando as actions de insumo:

_[tool: str_replace_edit]_

E adicionando `supplies` ao estado inicial:

_[tool: str_replace_edit]_

### 3) Cadastro — nova aba **Insumos**

_[tool: str_replace_edit]_

_[tool: snip]_

Agora adicionar (a) filtro de categoria de insumo após o de produtos, (b) a aba Insumos em si, e (c) o modal:

_[tool: str_replace_edit]_

Agora a aba Insumos em si — vou inserir após a tabela de produtos:

_[tool: str_replace_edit]_

_[tool: snip]_

Agora o modal de insumo (insiro antes do modal de Mesa):

_[tool: str_replace_edit]_

### 4) Estoque — toggle Produtos | Insumos

_[tool: write_file]_

_[tool: snip]_

Pequeno detalhe: o `EstoqueModule` antes filtrava `MENU.filter(p => p.stock)` mas agora os "produtos personalizados" também podem ter `stock: true`. Vou já ajustar para incluir extras:

_[tool: str_replace_edit]_

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

Pronto! Implementei o cadastro de **Insumos** separado dos produtos vendidos.

**O que foi adicionado:**

1. **Cadastro › Insumos** — nova aba com CRUD completo: nome, categoria (Carnes, Hortifruti, Mercearia, Descartáveis, Gás & Carvão, Limpeza, Outros), unidade de compra (kg, g, L, ml, un, pacote, caixa, fardo), custo, estoque atual, mínimo e fornecedor opcional.

2. **Estoque › toggle Produtos | Insumos** — alterna entre as duas visões. Cada uma tem busca, filtro por categoria, cards de resumo (valor imobilizado, itens em alerta) e botões de entrada/baixa rápida.

3. **19 insumos seed** já cadastrados (carne bovina, carvão, palitos, marmitex, gás, etc.) para você ver o sistema cheio.

Insumos não aparecem no PDV — ficam só no controle interno, como deve ser.

**Próximos passos possíveis** (quando quiser):
- Ficha técnica: vincular produto↔insumo (ex: 1 espeto = 0,12 kg de carne) para baixa automática no fechamento.
- Histórico de movimentações de estoque (entradas, saídas, ajustes).
- Relatório de compras sugerido (insumos abaixo do mínimo agrupados por fornecedor).

## User

Apply comment

## Assistant

O comentário aponta para um `<input>` dentro de um Modal no Cadastro. Provavelmente é o segundo input do modal de insumo que está estourando do modal — preciso checar.

_[tool: eval_js_user_view]_

Confirmado: o "Estoque mínimo" está estourando o modal porque tem 3 inputs side-by-side num modal de 520px. Vou empilhar em duas linhas.

_[tool: snip]_

O usuário quer que os campos da linha "Categoria + Unidade" tenham o mesmo tamanho. Vou ajustar os flex e separar a linha de custo/estoque/mínimo em duas linhas pra resolver os dois pontos.

_[tool: str_replace_edit]_

_[tool: snip]_

Pronto. Os 5 campos do modal de Insumo agora ficam num grid 2 colunas com tamanhos iguais (Categoria | Unidade na 1ª linha, Custo | Estoque na 2ª, Mínimo na 3ª) — nada estoura mais o modal e todos os campos têm a mesma largura.O usuário quer cadastro de categorias de insumo (e provavelmente de produto também). Vou adicionar uma aba "Categorias" no Cadastro com CRUD para ambos os tipos.

_[tool: read_file]_

Vou implementar uma aba "Categorias" com CRUD para categorias de produto e de insumo. Primeiro, adicionar reducer actions no HTML e seeds em data.js.

_[tool: str_replace_edit]_

_[tool: snip]_

Adicionando reducer actions e estado inicial pras categorias customizadas:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

Agora atualizo o `module-cadastro.jsx` adicionando a aba **Categorias** com CRUD para ambos os tipos. Vou primeiro injetar state, handlers, derivados, tabs e dropdowns dinâmicos:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

Agora vou:
1. Atualizar os filtros/badges/dropdowns nos lugares que ainda usam `CAT_LABELS`/`SUPPLY_CAT_LABELS` direto, pra ler das listas mescladas
2. Adicionar a aba **Categorias** + modal

_[tool: grep]_

_[tool: snip]_

Substituindo todas as referências hardcoded para usar as listas dinâmicas:

_[tool: str_replace_edit]_

_[tool: snip]_

Agora a aba **Categorias** + modal. Inserindo após a aba Insumos:

_[tool: str_replace_edit]_

_[tool: snip]_

Agora o modal de Categoria, antes do modal de Mesa:

_[tool: str_replace_edit]_

_[tool: snip]_

Entendi — o usuário está vendo o modal de Insumo (5 children: Categoria, Unidade, Custo, Estoque, Mínimo) e quer registrar o **valor pago** na compra/última entrada para depois cruzar informações (custo histórico vs venda).

Vou adicionar:
1. Campo **"Último valor pago"** + **"Data da última compra"** no modal de Insumo
2. Registrar **histórico de compras** automaticamente quando uma entrada de estoque é feita (no modal de entrada do Estoque), pedindo o valor pago
3. Ao confirmar entrada, salvar `{ supplyId, qty, unitCost, total, date, note, supplier }` em `state.purchaseHistory` para cruzamento posterior

_[tool: str_replace_edit]_

Vou continuar a implementação adicionando o registro de compras (histórico) que se vincula ao insumo.

_[tool: str_replace_edit]_

_[tool: snip]_

Agora atualizar o modal de cadastro de Insumo (em module-cadastro.jsx) com os 2 novos campos: **Último valor pago** + **Data da última compra**:

_[tool: str_replace_edit]_

_[tool: str_replace_edit]_

_[tool: snip]_

Atualizar `saveSupply` pra persistir lastPaid/lastPurchaseAt:

_[tool: str_replace_edit]_

_[tool: snip]_

Agora adicionar os campos no modal:

_[tool: str_replace_edit]_

_[tool: snip]_

Agora atualizar o **modal de entrada de estoque** (Estoque) pra também pedir valor pago, alimentando o histórico e atualizando lastPaid:

_[tool: str_replace_edit]_

_[tool: snip]_

Atualizar `handleEntry` para enviar `unitCost`/`supplier` e atualizar o modal de entrada:

_[tool: str_replace_edit]_

_[tool: snip]_

Atualizar o JSX do modal de entrada para incluir os campos de valor pago (apenas para insumos):

_[tool: str_replace_edit]_

_[tool: snip]_

Adicionar `purchaseHistory` ao initial state e mostrar a coluna "Última compra" na tabela de insumos:

_[tool: str_replace_edit]_

_[tool: snip]_

Atualizar reducer `SUPPLY_ENTRY` para gravar histórico e `lastPaid`/`lastPurchaseAt`:

_[tool: grep]_

_[tool: read_file]_

Reducer já estava atualizado. Agora marcar todos os todos como concluídos e verificar:

_[tool: update_todos]_

_[tool: done]_

_[tool: update_todos]_

_[tool: fork_verifier_agent]_

Pronto! Adicionei o **rastreamento de preço de compra** dos insumos:

**No Cadastro (Insumos):**
- Bloco **"💰 Última compra"** com valor pago por unidade + data da compra
- Aviso automático de variação % vs. custo de referência (alerta vermelho se subiu, verde se desceu)

**No Estoque (modal de Entrada):**
- Campo opcional de valor pago por unidade ao registrar entrada
- Cálculo automático do total da compra
- Comparativo % com o custo de referência
- Mostra o valor da última compra como dica

**Histórico:**
- Cada entrada com valor pago é gravada em `purchaseHistory` (data, qty, valor, fornecedor, nota), pronto para virar relatório de compras no futuro.
- O `lastPaid` e `lastPurchaseAt` do insumo são atualizados automaticamente.

**Próximos passos sugeridos** (se quiser):
- Tela de **histórico de compras** por insumo (gráfico de evolução de preço)
- Alertas no dashboard quando preço subir mais que X%
- Relatório "compras do mês" agrupado por fornecedor

## User

Verifier agent check completed

## Assistant

Vou investigar o erro no módulo Cadastro:

_[tool: read_file]_

Vou ver o contexto da linha 497 (a tabela de categorias) para entender o que está faltando:

_[tool: read_file]_

Vou buscar onde `allProdCats` e `allSupplyCats` são definidos:

_[tool: grep]_

Achei o bug: `cats` na linha 184 é referenciado **antes** de `allProdCats` ser definido na linha 205. JavaScript com `const` lança `ReferenceError` por hoisting temporal dead zone. Vou mover as definições de cats merged pra antes:

_[tool: read_file]_

_[tool: str_replace_edit]_

_[tool: snip]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Bug corrigido — era um TDZ no `module-cadastro.jsx`: `cats` referenciava `allProdCats` antes da declaração. Movi as definições de categorias para o topo do bloco "Derived data". Agora o módulo Cadastro renderiza normalmente.

## User

Apply comment

## Assistant

Vou ver o trecho do modal de produto onde estão Preço e Unidade:

_[tool: grep]_

Os dois já têm `flex: 1`. Vou checar se um deles tem um sufixo/wrapper que deixa diferentes:

_[tool: read_file]_

_[tool: snip]_

Vou checar o problema. Categoria/Subcategoria também têm `flex: 1`. Deixa eu verificar o componente `Input` vs `Select` para ver se algum tem `width` diferente:

_[tool: grep]_

Vou procurar nos componentes:

_[tool: grep]_

_[tool: grep]_

Achei. O `style: s` está sendo desestruturado mas não é aplicado em lugar nenhum no wrapper. Vou ler:

_[tool: read_file]_

Achei o bug! O `style.flex` está sendo aplicado no `<input>` interno, não no `<div>` wrapper. Como o wrapper é o filho direto do flex container, o `flex: 1` precisa ir nele. Vou corrigir movendo o style para o wrapper e mantendo `width: 100%` no input:

_[tool: str_replace_edit]_

Pronto! O bug estava no componente: o `flex: 1` passado via `style` estava indo para o `<input>`/`<select>` interno em vez do `<div>` wrapper, então o flex não era respeitado pelo container externo. Agora o style vai pro wrapper e o input usa `width: 100%`. Os pares Preço/Unidade e Categoria/Subcategoria devem ficar com tamanhos iguais.

