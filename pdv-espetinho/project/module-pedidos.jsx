// ── Módulo Pedidos ──

function PedidosModule({ state, dispatch, user, showToast }) {
  const [filter, setFilter] = React.useState("todos");
  const [selected, setSelected] = React.useState(null);

  const openOrders = state.orders.filter(o => o.status === "aberto");

  const filtered = openOrders.filter(o => {
    if (filter === "cozinha") return o.items.some(i => i.kitchen && i.status !== "entregue");
    if (filter === "prontos") return o.items.some(i => i.status === "pronto");
    return true;
  });

  const pendingCount = openOrders.reduce((s, o) =>
    s + o.items.filter(i => i.kitchen && (i.status === "aguardando" || i.status === "preparando")).length, 0);

  function advanceStatus(orderId, itemIdx) {
    const order = state.orders.find(o => o.id === orderId);
    const item = order.items[itemIdx];
    const next = { aguardando: "preparando", preparando: "pronto", pronto: "entregue", entregue: "entregue" };
    const nextStatus = next[item.status];
    dispatch({ type: "UPDATE_ITEM_STATUS", orderId, itemIdx, status: nextStatus });
    const labels = { preparando: "⏳ Preparando", pronto: "✅ Pronto!", entregue: "📦 Entregue" };
    if (labels[nextStatus]) showToast(`${item.name} — ${labels[nextStatus]}`);
  }

  const selOrder = selected ? state.orders.find(o => o.id === selected) : null;
  const tableFor = (id) => state.tables.find(t => t.id === id);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Pedidos"
        subtitle="Acompanhe e atualize o status dos pedidos em aberto"
        actions={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {pendingCount > 0 && (
              <div style={{ background: C.dangerBg, color: C.danger, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700 }}>
                🔥 {pendingCount} item{pendingCount !== 1 ? "s" : ""} na cozinha
              </div>
            )}
          </div>
        }
      />

      {/* Filters */}
      <div style={{ display: "flex", gap: 8 }}>
        {[["todos","Todos"], ["cozinha","🍳 Cozinha"], ["prontos","✅ Prontos"]].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} style={{
            border: "none", borderRadius: 8, padding: "7px 16px", fontSize: 13,
            fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            background: filter === v ? C.amber : C.surface,
            color: filter === v ? "#fff" : C.textMid,
            border: `1px solid ${filter === v ? C.amber : C.border}`,
          }}>{l}</button>
        ))}
      </div>

      {/* Orders grid */}
      {filtered.length === 0
        ? <Empty icon="🎉" msg="Nenhum pedido pendente" />
        : (
          <div style={{ flex: 1, overflow: "auto", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14, alignContent: "start" }}>
            {filtered.map(order => {
              const tbl = tableFor(order.tableId);
              const kitchenItems = order.items.filter(i => i.kitchen);
              const hasReady = kitchenItems.some(i => i.status === "pronto");
              const hasPending = kitchenItems.some(i => i.status === "aguardando" || i.status === "preparando");
              return (
                <Card key={order.id} hover onClick={() => setSelected(order.id)} style={{ padding: 18, cursor: "pointer", borderLeft: `4px solid ${hasPending ? C.warn : hasReady ? C.success : C.border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: C.text }}>{tbl?.label || "Mesa"}</div>
                      <div style={{ fontSize: 12, color: C.textMid }}>
                        {order.id} · {order.attendant} · {fmtTime(order.openedAt)}
                      </div>
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: C.amber }}>{fmt(order.items.reduce((s, i) => s + i.qty * i.price, 0))}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {order.items.map((item, idx) => {
                      const sc = orderStatusColors[item.status];
                      return (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ fontSize: 13, color: C.text }}>{item.qty}× {item.name}</div>
                          <Badge color={sc.bg} textColor={sc.text}>{sc.label}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        )
      }

      {/* Detail Modal */}
      <Modal open={!!selOrder} onClose={() => setSelected(null)} title={`Pedido ${selOrder?.id} — ${tableFor(selOrder?.tableId)?.label}`} width={540}>
        {selOrder && (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 12, fontSize: 13, color: C.textMid }}>
              <span>👩‍💼 {selOrder.attendant}</span>
              <span>🕐 {fmtTime(selOrder.openedAt)}</span>
              <span style={{ marginLeft: "auto", fontWeight: 700, color: C.amber, fontSize: 16 }}>
                {fmt(selOrder.items.reduce((s, i) => s + i.qty * i.price, 0))}
              </span>
            </div>

            {selOrder.items.map((item, idx) => {
              const sc = orderStatusColors[item.status];
              const canAdvance = item.kitchen && item.status !== "entregue";
              const nextLabels = { aguardando: "Marcar Preparando", preparando: "Marcar Pronto", pronto: "Marcar Entregue" };
              return (
                <div key={idx} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", borderRadius: 10,
                  background: sc.bg + "66", border: `1px solid ${sc.bg}`,
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{item.qty}× {item.name}</div>
                    <div style={{ fontSize: 12, color: C.textMid, marginTop: 2 }}>
                      {fmt(item.price)} un · {item.kitchen ? "🍳 Cozinha" : "🏃 Direto"}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <Badge color={sc.bg} textColor={sc.text}>{sc.label}</Badge>
                    {canAdvance && (
                      <button onClick={() => advanceStatus(selOrder.id, idx)} style={{
                        border: "none", background: C.amber, color: "#fff",
                        borderRadius: 6, padding: "4px 10px", fontSize: 11, fontWeight: 700,
                        cursor: "pointer", fontFamily: "inherit",
                      }}>{nextLabels[item.status]}</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}

Object.assign(window, { PedidosModule });
