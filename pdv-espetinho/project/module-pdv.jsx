// ── Módulo PDV / Caixa ──

function PDVModule({ state, dispatch, user, showToast }) {
  const [selectedTable, setSelectedTable] = React.useState(null);
  const [cart, setCart] = React.useState([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [activeCat, setActiveCat] = React.useState("espetos");
  const [paymentModal, setPaymentModal] = React.useState(false);
  // Multi-payment: array of { method, value }
  const [payments, setPayments] = React.useState([{ method: "dinheiro", value: "" }]);

  function openPaymentModal() {
    setPayments([{ method: "dinheiro", value: "" }]);
    setPaymentModal(true);
  }

  function addPaymentLine() {
    setPayments(p => [...p, { method: "pix", value: "" }]);
  }

  function removePaymentLine(idx) {
    setPayments(p => p.filter((_, i) => i !== idx));
  }

  function updatePaymentLine(idx, key, val) {
    setPayments(p => p.map((line, i) => i === idx ? { ...line, [key]: val } : line));
  }

  const paymentMethods = [
    { value: "dinheiro", label: "💵 Dinheiro" },
    { value: "pix",      label: "📱 PIX" },
    { value: "debito",   label: "💳 Débito" },
    { value: "credito",  label: "💳 Crédito" },
    { value: "fiado",    label: "📝 Fiado" },
  ];
  const payLabels = { dinheiro: "Dinheiro", pix: "PIX", debito: "Débito", credito: "Crédito", fiado: "Fiado" };

  const table = selectedTable ? state.tables.find(t => t.id === selectedTable) : null;
  const tableOrder = selectedTable ? state.orders.find(o => o.tableId === selectedTable && o.status === "aberto") : null;

  const allItems = tableOrder ? [
    ...tableOrder.items.map(i => ({ ...i, fromOrder: true })),
    ...cart,
  ] : cart;

  const cartTotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
  const orderTotal = tableOrder ? tableOrder.items.reduce((s, i) => s + i.qty * i.price, 0) : 0;
  const total = cartTotal + orderTotal;

  const cats = [...new Set(MENU.map(p => p.cat))];

  // Merge base MENU with extra products from state
  const allMenuProducts = React.useMemo(() => {
    const extras = state.extraProducts || [];
    const overriddenIds = new Set(extras.map(e => e.id));
    return [
      ...MENU.filter(p => !overriddenIds.has(p.id)),
      ...extras,
    ];
  }, [state.extraProducts]);

  const filtered = allMenuProducts.filter(p => {
    const matchCat = p.cat === activeCat;
    const matchSearch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return searchTerm ? matchSearch : matchCat;
  });

  function addToCart(product) {
    setCart(prev => {
      const ex = prev.find(i => i.productId === product.id);
      if (ex) return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { productId: product.id, name: product.name, qty: 1, price: product.price, kitchen: product.kitchen, status: "pendente" }];
    });
  }

  function changeQty(productId, delta) {
    setCart(prev => prev
      .map(i => i.productId === productId ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0)
    );
  }

  function removeFromCart(productId) {
    setCart(prev => prev.filter(i => i.productId !== productId));
  }

  function removeOrderItem(itemIdx) {
    dispatch({ type: "REMOVE_ORDER_ITEM", tableId: selectedTable, itemIdx });
    showToast("Item removido da comanda", "warn");
  }

  function handleSendToKitchen() {
    const kitchenItems = cart.filter(i => i.kitchen);
    if (kitchenItems.length === 0) {
      showToast("Nenhum item para enviar à cozinha", "warn");
      return;
    }
    dispatch({ type: "ADD_ORDER_ITEMS", tableId: selectedTable, items: cart });
    setCart([]);
    showToast(`✅ Pedido enviado à cozinha!`);
  }

  function handleCheckout() {
    const paidTotal = payments.reduce((s, p) => s + (parseFloat(String(p.value).replace(",", ".")) || 0), 0);
    if (Math.abs(paidTotal - total) > 0.01) {
      showToast(`Valor informado (${fmt(paidTotal)}) não bate com o total (${fmt(total)})`, "warn");
      return;
    }
    const summary = payments.map(p => `${payLabels[p.method]} ${fmt(parseFloat(String(p.value).replace(",", ".")) || 0)}`).join(" + ");
    dispatch({
      type: "CLOSE_TABLE",
      tableId: selectedTable,
      extraItems: cart,
      payment: payments.length === 1 ? payments[0].method : "misto",
      payments,
      total,
    });
    showToast(`✅ Conta fechada! ${summary}`);
    setCart([]);
    setPaymentModal(false);
    setSelectedTable(null);
  }

  const paidSoFar = payments.reduce((s, p) => s + (parseFloat(String(p.value).replace(",", ".")) || 0), 0);
  const remaining = total - paidSoFar;
  const cashLine = payments.find(p => p.method === "dinheiro");
  const cashChange = cashLine ? Math.max(0, (parseFloat(String(cashLine.value).replace(",", ".")) || 0) - (remaining + (parseFloat(String(cashLine.value).replace(",", ".")) || 0) - (total - (paidSoFar - (parseFloat(String(cashLine.value).replace(",", ".")) || 0)))) ) : null;

  // ── Left: table grid ──
  if (!selectedTable) {
    return (
      <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
        <PageHeader
          title="PDV / Caixa"
          subtitle="Selecione uma mesa ou balcão para iniciar"
          actions={
            <Btn size="sm" variant="secondary" icon="➕" onClick={() => {
                const n = state.tables.filter(t => t.type === "mesa").length + 1;
                dispatch({ type: "ADD_TABLE_CUSTOM", table: { id: Date.now(), label: `Mesa ${n}`, type: "mesa", status: "livre" } });
              }}>
              Nova mesa
            </Btn>
          }
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
          {state.tables.map(t => {
            const sc = statusColors[t.status];
            const ord = state.orders.find(o => o.tableId === t.id && o.status === "aberto");
            const tTotal = ord ? ord.items.reduce((s, i) => s + i.qty * i.price, 0) : 0;
            return (
              <Card key={t.id} hover onClick={() => setSelectedTable(t.id)} style={{ padding: 18, cursor: "pointer" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>
                    {t.type === "balcao" ? "🍺" : "🪑"} {t.label}
                  </span>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: sc.text, display: "inline-block", marginTop: 3 }}></span>
                </div>
                <div style={{ fontSize: 12, marginBottom: 6 }}>
                  <Badge color={sc.bg} textColor={sc.text}>{sc.label}</Badge>
                </div>
                {tTotal > 0 && (
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginTop: 6 }}>{fmt(tTotal)}</div>
                )}
                {ord && (
                  <div style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>
                    {ord.items.length} iten{ord.items.length !== 1 ? "s" : ""} · {fmtTime(ord.openedAt)}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Detail: mesa selecionada ──
  return (
    <div style={{ height: "100%", display: "flex", gap: 16, minHeight: 0 }}>
      {/* Left: menu */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => { setSelectedTable(null); setCart([]); }} style={{
            border: "none", background: C.bg, borderRadius: 8, padding: "8px 14px",
            cursor: "pointer", fontSize: 14, color: C.textMid, fontWeight: 600, fontFamily: "inherit",
          }}>← Voltar</button>
          <div style={{ fontWeight: 800, fontSize: 18, color: C.text }}>{table.label}</div>
          <TableBadge status={table.status} />
          {tableOrder && (
            <span style={{ fontSize: 12, color: C.textMid }}>
              Aberta há {fmtTime(tableOrder.openedAt)} · {tableOrder.attendant}
            </span>
          )}
        </div>

        {/* Search */}
        <Input
          placeholder="🔍  Buscar produto…"
          value={searchTerm}
          onChange={setSearchTerm}
        />

        {/* Category tabs */}
        {!searchTerm && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {cats.map(c => (
              <button key={c} onClick={() => setActiveCat(c)} style={{
                border: "none", borderRadius: 8, padding: "7px 14px",
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                background: activeCat === c ? C.amber : C.surface,
                color: activeCat === c ? "#fff" : C.textMid,
                border: `1px solid ${activeCat === c ? C.amber : C.border}`,
              }}>
                {CAT_ICONS[c]} {CAT_LABELS[c]}
              </button>
            ))}
          </div>
        )}

        {/* Product grid */}
        <div style={{ flex: 1, overflow: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: 8, alignContent: "start" }}>
          {filtered.map(p => {
            const inCart = cart.find(i => i.productId === p.id);
            return (
              <div key={p.id} onClick={() => addToCart(p)} style={{
                background: inCart ? C.amberLight : C.surface,
                border: `1.5px solid ${inCart ? C.amber : C.border}`,
                borderRadius: 10, padding: "12px 14px", cursor: "pointer",
                transition: "all .15s",
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: C.textMid }}>{fmt(p.price)}</div>
                {p.kitchen && <div style={{ fontSize: 10, color: C.amber, marginTop: 4 }}>🍳 Cozinha</div>}
                {inCart && <div style={{ fontSize: 11, fontWeight: 700, color: C.amber, marginTop: 4 }}>× {inCart.qty} no carrinho</div>}
              </div>
            );
          })}
          {filtered.length === 0 && <Empty icon="🔍" msg="Nenhum produto encontrado" />}
        </div>
      </div>

      {/* Right: cart */}
      <div style={{ width: 320, display: "flex", flexDirection: "column", gap: 12 }}>
        <Card style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, fontWeight: 700, fontSize: 15, color: C.text }}>
            🧾 Comanda — {table.label}
          </div>

          {/* Existing order items */}
          {tableOrder && tableOrder.items.length > 0 && (
            <div style={{ padding: "12px 16px 0", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, color: C.textMid, fontWeight: 700, marginBottom: 8, letterSpacing: ".5px" }}>ITENS ENVIADOS</div>
              {tableOrder.items.map((item, idx) => {
                const sc = orderStatusColors[item.status];
                return (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: C.textMid }}>{item.qty}× {item.name}</div>
                      <Badge color={sc.bg} textColor={sc.text}>{sc.label}</Badge>
                    </div>
                    <div style={{ fontSize: 13, color: C.textMid, minWidth: 52, textAlign: "right" }}>{fmt(item.qty * item.price)}</div>
                    <button
                      onClick={() => removeOrderItem(idx)}
                      title="Remover item"
                      style={{
                        width: 24, height: 24, border: "none", borderRadius: 6,
                        background: C.dangerBg, color: C.danger,
                        cursor: "pointer", fontSize: 13, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>×</button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Cart items */}
          <div style={{ flex: 1, overflow: "auto", padding: "12px 16px" }}>
            {cart.length === 0 && !tableOrder && <Empty icon="🛒" msg="Adicione itens ao pedido" />}
            {cart.length === 0 && tableOrder && <div style={{ padding: "10px 0 4px", fontSize: 13, color: C.textLight, textAlign: "center" }}>Adicione mais itens acima</div>}
            {cart.map((item) => (
              <div key={item.productId} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                  <div style={{ fontSize: 12, color: C.textMid }}>{fmt(item.price)} × {item.qty}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <button onClick={() => changeQty(item.productId, -1)} style={qtyBtnStyle}>−</button>
                  <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: "center" }}>{item.qty}</span>
                  <button onClick={() => changeQty(item.productId, 1)} style={qtyBtnStyle}>+</button>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text, minWidth: 48, textAlign: "right" }}>{fmt(item.qty * item.price)}</div>
                <button
                  onClick={() => removeFromCart(item.productId)}
                  title="Remover item"
                  style={{
                    width: 24, height: 24, border: "none", borderRadius: 6,
                    background: C.dangerBg, color: C.danger,
                    cursor: "pointer", fontSize: 13, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>×</button>
              </div>
            ))}
          </div>

          {/* Total + actions */}
          <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Total</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.amber }}>{fmt(total)}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cart.some(i => i.kitchen) && (
                <Btn onClick={handleSendToKitchen} variant="secondary" style={{ width: "100%", justifyContent: "center" }} icon="🍳">
                  Enviar à Cozinha
                </Btn>
              )}
              {cart.length > 0 && !cart.some(i => i.kitchen) && (
                <Btn onClick={() => { dispatch({ type: "ADD_ORDER_ITEMS", tableId: selectedTable, items: cart }); setCart([]); showToast("Itens adicionados!"); }}
                  variant="secondary" style={{ width: "100%", justifyContent: "center" }} icon="➕">
                  Adicionar ao Pedido
                </Btn>
              )}
              {total > 0 && (
                <Btn onClick={openPaymentModal} variant="primary" style={{ width: "100%", justifyContent: "center" }} icon="💳">
                  Fechar Conta
                </Btn>
              )}
              {total === 0 && (
                <div style={{ textAlign: "center", fontSize: 13, color: C.textLight }}>Mesa sem consumo</div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Payment Modal */}
      <Modal open={paymentModal} onClose={() => setPaymentModal(false)} title="Fechar Conta" width={460}>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Total */}
          <div style={{ background: C.bg, borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>Total a pagar</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.amber }}>{fmt(total)}</div>
          </div>

          {/* Payment lines */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid }}>Formas de pagamento</div>
            {payments.map((line, idx) => {
              const lineVal = parseFloat(String(line.value).replace(",", ".")) || 0;
              const isLast = idx === payments.length - 1;
              // Auto-fill suggestion: remaining when typing in last field
              const suggestion = isLast && payments.length > 1 && remaining > 0 ? remaining : null;
              const isCash = line.method === "dinheiro";
              // Troco só para dinheiro: quanto foi pago nessa linha vs quanto ela "cobre"
              const otherPaid = payments.filter((_, i) => i !== idx).reduce((s, p) => s + (parseFloat(String(p.value).replace(",", ".")) || 0), 0);
              const thisCover = total - otherPaid;
              const troco = isCash && lineVal > thisCover + 0.005 ? lineVal - thisCover : null;

              return (
                <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {/* Method selector */}
                    <select
                      value={line.method}
                      onChange={e => updatePaymentLine(idx, "method", e.target.value)}
                      style={{
                        border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 12px",
                        fontSize: 14, color: C.text, background: C.surface, outline: "none",
                        fontFamily: "inherit", cursor: "pointer", flex: 1,
                      }}
                    >
                      {paymentMethods.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>

                    {/* Value input */}
                    <div style={{ position: "relative", flex: 1 }}>
                      <input
                        type="number"
                        value={line.value}
                        onChange={e => updatePaymentLine(idx, "value", e.target.value)}
                        placeholder={suggestion ? suggestion.toFixed(2) : "0,00"}
                        style={{
                          border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 14px",
                          fontSize: 14, color: C.text, background: C.surface, outline: "none",
                          fontFamily: "inherit", width: "100%",
                        }}
                      />
                      {suggestion && !line.value && (
                        <button
                          onClick={() => updatePaymentLine(idx, "value", remaining.toFixed(2))}
                          style={{
                            position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                            border: "none", background: C.amberLight, color: C.amber,
                            borderRadius: 5, padding: "2px 7px", fontSize: 11, fontWeight: 700,
                            cursor: "pointer", fontFamily: "inherit",
                          }}
                        >restante</button>
                      )}
                    </div>

                    {/* Remove line */}
                    {payments.length > 1 && (
                      <button onClick={() => removePaymentLine(idx)} style={{
                        width: 32, height: 32, border: "none", borderRadius: 8,
                        background: C.dangerBg, color: C.danger, cursor: "pointer",
                        fontSize: 16, fontWeight: 700, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>×</button>
                    )}
                  </div>

                  {/* Troco por linha */}
                  {troco !== null && (
                    <div style={{ background: C.successBg, borderRadius: 7, padding: "7px 14px", display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 13, color: C.success, fontWeight: 600 }}>Troco (dinheiro)</span>
                      <span style={{ fontSize: 14, fontWeight: 800, color: C.success }}>{fmt(troco)}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add payment line */}
            {payments.length < 4 && (
              <button onClick={addPaymentLine} style={{
                border: `1.5px dashed ${C.border}`, borderRadius: 8, padding: "9px",
                background: "transparent", color: C.textMid, cursor: "pointer",
                fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                ＋ Adicionar forma de pagamento
              </button>
            )}
          </div>

          {/* Running total */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: C.textMid }}>Informado</span>
              <span style={{ fontWeight: 700, color: paidSoFar >= total - 0.005 ? C.success : C.text }}>{fmt(paidSoFar)}</span>
            </div>
            {remaining > 0.005 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C.danger, fontWeight: 600 }}>Faltando</span>
                <span style={{ fontWeight: 800, color: C.danger }}>{fmt(remaining)}</span>
              </div>
            )}
            {remaining < -0.005 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C.warn, fontWeight: 600 }}>Excedente</span>
                <span style={{ fontWeight: 800, color: C.warn }}>{fmt(Math.abs(remaining))}</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="secondary" onClick={() => setPaymentModal(false)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
            <Btn
              variant="success"
              onClick={handleCheckout}
              disabled={Math.abs(remaining) > 0.005}
              style={{ flex: 1, justifyContent: "center" }}
              icon="✅"
            >Confirmar</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}

const qtyBtnStyle = {
  width: 26, height: 26, border: `1px solid ${C.border}`, borderRadius: 6,
  background: C.bg, cursor: "pointer", fontSize: 16, display: "flex",
  alignItems: "center", justifyContent: "center", fontWeight: 700, color: C.textMid,
};

Object.assign(window, { PDVModule });
