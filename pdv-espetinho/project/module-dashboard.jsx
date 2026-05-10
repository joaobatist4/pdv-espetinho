// ── Módulo Dashboard ──

function DashboardModule({ state, user }) {
  const [period, setPeriod] = React.useState("hoje");
  const [selectedDay, setSelectedDay] = React.useState(null); // date string or null

  const now = new Date();
  const todayStr = now.toDateString();
  const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
  const monthAgo = new Date(now); monthAgo.setDate(now.getDate() - 30);

  const filterSales = (sales) => {
    if (period === "hoje") return sales.filter(s => new Date(s.closedAt).toDateString() === todayStr);
    if (period === "semana") return sales.filter(s => new Date(s.closedAt) >= weekAgo);
    return sales.filter(s => new Date(s.closedAt) >= monthAgo);
  };

  const sales = filterSales(state.salesHistory);

  // When a day is selected, filter top products to that day only
  const topProductSales = selectedDay
    ? state.salesHistory.filter(s => new Date(s.closedAt).toDateString() === selectedDay)
    : sales;

  const revenue = sales.reduce((s, o) => s + o.total, 0);
  const avgTicket = sales.length ? revenue / sales.length : 0;
  const openRevenue = state.orders
    .filter(o => o.status === "aberto")
    .reduce((s, o) => s + o.items.reduce((ss, i) => ss + i.qty * i.price, 0), 0);

  // Top products (filtered by selected day or current period)
  const productTotals = {};
  topProductSales.forEach(s => s.items.forEach(i => {
    if (!productTotals[i.name]) productTotals[i.name] = { qty: 0, revenue: 0, cat: i.cat };
    productTotals[i.name].qty += i.qty;
    productTotals[i.name].revenue += i.qty * i.price;
  }));
  const topProducts = Object.entries(productTotals)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 8);

  // Payment breakdown
  const payBreakdown = {};
  sales.forEach(s => {
    payBreakdown[s.payment] = (payBreakdown[s.payment] || 0) + s.total;
  });
  const payLabels = { dinheiro: "💵 Dinheiro", pix: "📱 PIX", debito: "💳 Débito", credito: "💳 Crédito", fiado: "📝 Fiado", misto: "🔀 Misto" };

  // Daily chart (last 14 days)
  const dailyData = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now); d.setDate(now.getDate() - i);
    const dayStr = d.toDateString();
    const daySales = state.salesHistory.filter(s => new Date(s.closedAt).toDateString() === dayStr);
    dailyData.push({
      label: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      fullLabel: d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }),
      dateStr: dayStr,
      value: daySales.reduce((s, o) => s + o.total, 0),
      count: daySales.length,
      isToday: dayStr === todayStr,
      isSelected: selectedDay === dayStr,
    });
  }
  const maxVal = Math.max(...dailyData.map(d => d.value), 1);

  // Compare with previous period
  const prevStart = new Date(period === "hoje"
    ? (new Date(now).setDate(now.getDate() - 1))
    : period === "semana"
    ? (new Date(now).setDate(now.getDate() - 14))
    : (new Date(now).setDate(now.getDate() - 60))
  );
  const prevEnd = new Date(period === "hoje"
    ? (new Date(now).setDate(now.getDate() - 1))
    : period === "semana" ? weekAgo : monthAgo
  );
  const prevSales = state.salesHistory.filter(s => {
    const d = new Date(s.closedAt);
    return d >= prevStart && d < (period === "hoje" ? new Date(now).setHours(0,0,0,0) : prevEnd);
  });
  const prevRevenue = prevSales.reduce((s, o) => s + o.total, 0);
  const revenueChange = prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

  // Selected day revenue
  const selectedDayRevenue = selectedDay
    ? state.salesHistory.filter(s => new Date(s.closedAt).toDateString() === selectedDay).reduce((s, o) => s + o.total, 0)
    : null;
  const selectedDayLabel = selectedDay
    ? new Date(selectedDay).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })
    : null;

  function handleBarClick(d) {
    if (d.value === 0) return;
    setSelectedDay(prev => prev === d.dateStr ? null : d.dateStr);
  }

  // Clear selected day when period changes
  React.useEffect(() => { setSelectedDay(null); }, [period]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do negócio"
        actions={
          <div style={{ display: "flex", gap: 6 }}>
            {[["hoje","Hoje"],["semana","7 dias"],["mes","30 dias"]].map(([v,l]) => (
              <button key={v} onClick={() => setPeriod(v)} style={{
                border: `1px solid ${period === v ? C.amber : C.border}`,
                borderRadius: 8, padding: "7px 16px", fontSize: 13,
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                background: period === v ? C.amber : C.surface,
                color: period === v ? "#fff" : C.textMid,
              }}>{l}</button>
            ))}
          </div>
        }
      />

      {/* KPI cards */}
      <div style={{ display: "flex", gap: 12 }}>
        <StatCard
          label="Faturamento"
          value={revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          sub={prevRevenue > 0 ? `${revenueChange >= 0 ? "▲" : "▼"} ${Math.abs(revenueChange).toFixed(1)}% vs período anterior` : "Sem comparativo"}
          icon="💰"
          color={C.amber}
        />
        <StatCard label="Pedidos Fechados" value={sales.length} sub={`Ticket médio: ${fmt(avgTicket)}`} icon="🧾" color={C.info} />
        <StatCard label="Em Aberto Agora" value={fmt(openRevenue)} sub={`${state.orders.filter(o => o.status === "aberto").length} mesa${state.orders.filter(o => o.status === "aberto").length !== 1 ? "s" : ""} ativas`} icon="🔥" color={C.warn} />
        <StatCard label="Estoque Baixo" value={MENU.filter(p => p.stock && (state.stock[p.id]?.qty || 0) <= (state.stock[p.id]?.min || 5)).length} sub="Itens abaixo do mínimo" icon="⚠️" color={C.danger} />
      </div>

      {/* Charts row */}
      <div style={{ display: "flex", gap: 14, flex: 1, minHeight: 0 }}>

        {/* Daily bar chart */}
        <Card style={{ flex: 2, padding: 24, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>Faturamento — últimos 14 dias</div>
            {selectedDay && (
              <button onClick={() => setSelectedDay(null)} style={{
                border: "none", background: C.amberLight, color: C.amber,
                borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4,
              }}>
                ✕ Limpar seleção
              </button>
            )}
          </div>

          {/* Selected day summary */}
          {selectedDay && (
            <div style={{
              background: C.amberLight, borderRadius: 10, padding: "10px 16px",
              marginBottom: 14, display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 18 }}>📅</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: C.amber, textTransform: "capitalize" }}>{selectedDayLabel}</div>
                <div style={{ fontSize: 12, color: C.brownMid }}>
                  {fmt(selectedDayRevenue)} · {topProductSales.length} pedido{topProductSales.length !== 1 ? "s" : ""}
                  {" — "}produtos mais vendidos no painel ao lado
                </div>
              </div>
            </div>
          )}

          <div style={{ flex: 1, display: "flex", alignItems: "flex-end", gap: 4 }}>
            {dailyData.map((d, i) => {
              const barH = Math.max(4, (d.value / maxVal) * 180);
              const isActive = d.isSelected;
              const isHover = d.value > 0;
              const barColor = isActive ? C.amber
                : d.isToday ? C.amber + "99"
                : d.value > 0 ? C.amber + "55"
                : C.border;
              return (
                <div
                  key={i}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: d.value > 0 ? "pointer" : "default" }}
                  onClick={() => handleBarClick(d)}
                  title={d.value > 0 ? `${d.fullLabel}: ${fmt(d.value)} (${d.count} pedido${d.count !== 1 ? "s" : ""})` : d.fullLabel}
                >
                  {/* Value label */}
                  <div style={{
                    fontSize: 9, color: isActive ? C.amber : C.textMid, fontWeight: isActive ? 800 : 500,
                    minHeight: 12, textAlign: "center",
                  }}>
                    {d.value > 0 ? fmt(d.value).replace("R$ ","").replace(",00","") : ""}
                  </div>

                  {/* Bar */}
                  <div style={{
                    width: "100%", borderRadius: "4px 4px 0 0",
                    height: barH + "px",
                    background: barColor,
                    transition: "all .2s",
                    outline: isActive ? `2px solid ${C.amber}` : "none",
                    outlineOffset: 1,
                    position: "relative",
                  }}>
                    {isActive && (
                      <div style={{
                        position: "absolute", top: -6, left: "50%", transform: "translateX(-50%)",
                        width: 8, height: 8, background: C.amber, borderRadius: "50%",
                      }} />
                    )}
                  </div>

                  {/* Date label */}
                  <div style={{
                    fontSize: 9, fontWeight: isActive || d.isToday ? 800 : 400,
                    color: isActive ? C.amber : d.isToday ? C.amber + "bb" : C.textLight,
                    whiteSpace: "nowrap",
                  }}>
                    {d.label}
                  </div>
                </div>
              );
            })}
          </div>

          {!selectedDay && (
            <div style={{ textAlign: "center", fontSize: 11, color: C.textLight, marginTop: 10 }}>
              Clique em uma barra para ver os produtos mais vendidos naquele dia
            </div>
          )}
        </Card>

        {/* Right column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Top products */}
          <Card style={{ flex: 1, padding: 20, overflow: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>🏆 Mais Vendidos</div>
              {selectedDay && (
                <Badge color={C.amberLight} textColor={C.amber}>
                  {new Date(selectedDay).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}
                </Badge>
              )}
            </div>
            {topProducts.length === 0 && <Empty icon="📊" msg={selectedDay ? "Sem vendas neste dia" : "Sem dados no período"} />}
            {topProducts.map(([name, data], i) => (
              <div key={name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: i === 0 ? "#FFD700" : i === 1 ? "#C0C0C0" : i === 2 ? "#CD7F32" : C.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800,
                  color: i < 3 ? "#fff" : C.textMid, flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                  <div style={{ fontSize: 11, color: C.textMid }}>{data.qty} un · {fmt(data.revenue)}</div>
                </div>
                {/* Mini bar */}
                <div style={{ width: 40, height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: (data.qty / topProducts[0][1].qty * 100) + "%", background: C.amber, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </Card>

          {/* Payment breakdown */}
          <Card style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: C.text, marginBottom: 14 }}>💳 Pagamentos</div>
            {Object.entries(payBreakdown).length === 0 && <div style={{ fontSize: 13, color: C.textLight }}>Sem dados</div>}
            {Object.entries(payBreakdown).sort((a,b) => b[1]-a[1]).map(([method, val]) => {
              const pct = revenue > 0 ? (val / revenue) * 100 : 0;
              return (
                <div key={method} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: C.text }}>{payLabels[method] || method}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{pct.toFixed(1)}%</span>
                  </div>
                  <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: pct + "%", background: C.amber, borderRadius: 3, transition: "width .3s" }} />
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { DashboardModule });
