// ── Módulo Estoque ──

function EstoqueModule({ state, dispatch, user, showToast }) {
  const [view, setView] = React.useState("produtos"); // produtos | insumos
  const [search, setSearch] = React.useState("");
  const [catFilter, setCatFilter] = React.useState("todos");
  const [supplyCatFilter, setSupplyCatFilter] = React.useState("todos");
  const [entryModal, setEntryModal] = React.useState(null); // { ...item, kind: 'product'|'supply' }
  const [entryQty, setEntryQty] = React.useState("");
  const [entryNote, setEntryNote] = React.useState("");
  const [entryUnitCost, setEntryUnitCost] = React.useState("");

  const stockProducts = [...MENU, ...(state.extraProducts || [])].filter(p => p.stock);
  const supplies = state.supplies || [];

  const stockItem = (id) => state.stock[id] || { qty: 0, min: 5 };
  const isLow = (id) => { const s = stockItem(id); return s.qty <= s.min; };
  const isLowSupply = (s) => (s.qty || 0) <= (s.min || 0);

  const lowProdCount = stockProducts.filter(p => isLow(p.id)).length;
  const lowSupplyCount = supplies.filter(isLowSupply).length;
  const lowCount = view === "produtos" ? lowProdCount : lowSupplyCount;

  // Filters
  const prodCategories = ["todos", ...new Set(stockProducts.map(p => p.cat))];
  const supplyCategories = ["todos", ...Object.keys(SUPPLY_CAT_LABELS)];

  const filteredProducts = stockProducts.filter(p => {
    const matchCat = catFilter === "todos" || p.cat === catFilter;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });
  const filteredSupplies = supplies.filter(s => {
    const matchCat = supplyCatFilter === "todos" || s.cat === supplyCatFilter;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.supplier || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  function handleEntry() {
    const qty = parseFloat(String(entryQty).replace(",", "."));
    if (!qty || qty <= 0) { showToast("Informe uma quantidade válida", "warn"); return; }
    const unitCost = entryUnitCost ? parseFloat(String(entryUnitCost).replace(",", ".")) : null;
    if (entryUnitCost && (isNaN(unitCost) || unitCost < 0)) { showToast("Valor pago inválido", "warn"); return; }
    if (entryModal.kind === "product") {
      dispatch({ type: "STOCK_ENTRY", productId: entryModal.id, qty: Math.round(qty), note: entryNote });
      showToast(`✅ +${Math.round(qty)} ${entryModal.unit || "un"} de ${entryModal.name}`);
    } else {
      dispatch({
        type: "SUPPLY_ENTRY",
        supplyId: entryModal.id,
        qty,
        unitCost,
        note: entryNote,
        supplier: entryModal.supplier || "",
      });
      showToast(`✅ +${qty} ${entryModal.unit} de ${entryModal.name}${unitCost ? ` (${fmt(unitCost * qty)})` : ""}`);
    }
    setEntryModal(null);
    setEntryQty("");
    setEntryNote("");
    setEntryUnitCost("");
  }

  function handleAdjustProduct(productId, delta) {
    dispatch({ type: "STOCK_ADJUST", productId, delta });
  }
  function handleAdjustSupply(supplyId, delta) {
    dispatch({ type: "SUPPLY_ADJUST", supplyId, delta });
  }

  // Header summaries
  const prodTotalValue = stockProducts.reduce((s, p) => s + (stockItem(p.id).qty * p.price), 0);
  const supplyTotalValue = supplies.reduce((s, x) => s + ((x.qty || 0) * (x.cost || 0)), 0);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Estoque"
        subtitle={view === "produtos" ? "Controle de mercadorias e bebidas para venda" : "Controle de matérias-primas e materiais de consumo"}
        actions={
          lowCount > 0 && (
            <div style={{ background: C.dangerBg, color: C.danger, borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 700 }}>
              ⚠️ {lowCount} ite{lowCount !== 1 ? "ns" : "m"} com estoque baixo
            </div>
          )
        }
      />

      {/* View toggle: Produtos | Insumos */}
      <div style={{ display: "flex", gap: 4, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 4, alignSelf: "flex-start" }}>
        {[
          { id: "produtos", icon: "🏪", label: "Produtos", count: stockProducts.length, low: lowProdCount },
          { id: "insumos",  icon: "🥩", label: "Insumos",  count: supplies.length,      low: lowSupplyCount },
        ].map(t => {
          const active = view === t.id;
          return (
            <button key={t.id} onClick={() => { setView(t.id); setSearch(""); }} style={{
              border: "none", borderRadius: 9, padding: "9px 18px", cursor: "pointer",
              fontFamily: "inherit", fontSize: 13, fontWeight: 700,
              background: active ? C.amber : "transparent",
              color: active ? "#fff" : C.textMid,
              display: "flex", alignItems: "center", gap: 8, transition: "all .15s",
            }}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
              <span style={{
                background: active ? "rgba(255,255,255,.25)" : C.bg,
                color: active ? "#fff" : C.textMid,
                borderRadius: 99, padding: "1px 8px", fontSize: 11, fontWeight: 800,
              }}>{t.count}</span>
              {t.low > 0 && (
                <span style={{
                  background: active ? "rgba(255,255,255,.25)" : C.dangerBg,
                  color: active ? "#fff" : C.danger,
                  borderRadius: 99, padding: "1px 7px", fontSize: 11, fontWeight: 800,
                }}>!{t.low}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: 10 }}>
        <Input
          placeholder={view === "produtos" ? "🔍  Buscar produto…" : "🔍  Buscar insumo ou fornecedor…"}
          value={search}
          onChange={setSearch}
          style={{ flex: 1 }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {view === "produtos" && prodCategories.map(c => (
            <button key={c} onClick={() => setCatFilter(c)} style={{
              borderRadius: 8, padding: "8px 14px", fontSize: 13,
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              background: catFilter === c ? C.amber : C.surface,
              color: catFilter === c ? "#fff" : C.textMid,
              border: `1px solid ${catFilter === c ? C.amber : C.border}`,
            }}>
              {c === "todos" ? "Todos" : CAT_ICONS[c] + " " + CAT_LABELS[c]}
            </button>
          ))}
          {view === "insumos" && supplyCategories.map(c => (
            <button key={c} onClick={() => setSupplyCatFilter(c)} style={{
              borderRadius: 8, padding: "8px 14px", fontSize: 13,
              fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              background: supplyCatFilter === c ? C.amber : C.surface,
              color: supplyCatFilter === c ? "#fff" : C.textMid,
              border: `1px solid ${supplyCatFilter === c ? C.amber : C.border}`,
            }}>
              {c === "todos" ? "Todos" : SUPPLY_CAT_ICONS[c] + " " + SUPPLY_CAT_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 12 }}>
        {view === "produtos" ? (
          <>
            <StatCard label="Valor em Estoque (venda)" value={prodTotalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} icon="📦" color={C.amber} />
            <StatCard label="Itens com Estoque Baixo" value={lowProdCount} sub="Abaixo do mínimo" icon="⚠️" color={C.danger} />
            <StatCard label="Total de Produtos" value={stockProducts.length} sub="com controle de estoque" icon="🏪" color={C.info} />
          </>
        ) : (
          <>
            <StatCard label="Valor em Estoque (custo)" value={supplyTotalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} icon="🥩" color={C.amber} />
            <StatCard label="Insumos Abaixo do Mínimo" value={lowSupplyCount} sub="Precisam reposição" icon="⚠️" color={C.danger} />
            <StatCard label="Total de Insumos" value={supplies.length} sub="cadastrados" icon="📋" color={C.info} />
          </>
        )}
      </div>

      {/* Table — Produtos */}
      {view === "produtos" && (
        <Card style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ overflow: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {["Produto", "Categoria", "Qtd. Atual", "Mínimo", "Status", "Ações"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: h === "Ações" ? "center" : "left",
                      fontSize: 12, fontWeight: 700, color: C.textMid,
                      letterSpacing: ".5px", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(p => {
                  const s = stockItem(p.id);
                  const low = isLow(p.id);
                  const pct = Math.min(100, Math.round((s.qty / Math.max(1, s.min * 3)) * 100));
                  return (
                    <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600, color: C.text }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: C.textMid }}>{fmt(p.price)}/{p.unit}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge color={C.amberLight} textColor={C.amber}>{CAT_ICONS[p.cat]} {CAT_LABELS[p.cat]}</Badge>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontWeight: 800, fontSize: 18, color: low ? C.danger : C.text }}>{s.qty}</span>
                          <div style={{ width: 60, height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: pct + "%", background: low ? C.danger : C.success, borderRadius: 3 }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: C.textMid }}>{s.min} un</td>
                      <td style={{ padding: "12px 16px" }}>
                        {low
                          ? <Badge color={C.dangerBg} textColor={C.danger}>⚠️ Baixo</Badge>
                          : <Badge color={C.successBg} textColor={C.success}>✅ OK</Badge>
                        }
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          <button onClick={() => handleAdjustProduct(p.id, -1)} style={adjBtn} title="Retirar 1">−</button>
                          <button onClick={() => setEntryModal({ ...p, kind: "product" })} style={{ ...adjBtn, background: C.amber, color: "#fff", border: "none" }} title="Entrada de estoque">+</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr><td colSpan={6}><Empty icon="📦" msg="Nenhum produto encontrado" /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Table — Insumos */}
      {view === "insumos" && (
        <Card style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ overflow: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {["Insumo", "Categoria", "Estoque", "Mínimo", "Custo Total", "Status", "Ações"].map(h => (
                    <th key={h} style={{
                      padding: "12px 16px", textAlign: h === "Ações" ? "center" : "left",
                      fontSize: 12, fontWeight: 700, color: C.textMid,
                      letterSpacing: ".5px", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSupplies.map(s => {
                  const low = isLowSupply(s);
                  const pct = Math.min(100, Math.round(((s.qty || 0) / Math.max(1, (s.min || 1) * 3)) * 100));
                  return (
                    <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 600, color: C.text }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: C.textMid }}>{fmt(s.cost)}/{s.unit}{s.supplier ? " · " + s.supplier : ""}</div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <Badge color={C.amberLight} textColor={C.amber}>{SUPPLY_CAT_ICONS[s.cat]} {SUPPLY_CAT_LABELS[s.cat]}</Badge>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontWeight: 800, fontSize: 18, color: low ? C.danger : C.text }}>{s.qty}</span>
                          <span style={{ fontSize: 12, color: C.textMid }}>{s.unit}</span>
                          <div style={{ width: 50, height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: pct + "%", background: low ? C.danger : C.success, borderRadius: 3 }} />
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", color: C.textMid }}>{s.min} {s.unit}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>{fmt((s.qty || 0) * (s.cost || 0))}</td>
                      <td style={{ padding: "12px 16px" }}>
                        {low
                          ? <Badge color={C.dangerBg} textColor={C.danger}>⚠️ Baixo</Badge>
                          : <Badge color={C.successBg} textColor={C.success}>✅ OK</Badge>
                        }
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          <button onClick={() => handleAdjustSupply(s.id, -1)} style={adjBtn} title="Retirar 1">−</button>
                          <button onClick={() => setEntryModal({ ...s, kind: "supply" })} style={{ ...adjBtn, background: C.amber, color: "#fff", border: "none" }} title="Entrada de estoque">+</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredSupplies.length === 0 && (
                  <tr><td colSpan={7}><Empty icon="🥩" msg="Nenhum insumo encontrado — cadastre em Cadastro › Insumos" /></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Entry Modal */}
      <Modal open={!!entryModal} onClose={() => setEntryModal(null)} title={`Entrada de Estoque — ${entryModal?.name}`} width={420}>
        {entryModal && (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: C.bg, borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: C.textMid }}>Estoque atual</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: C.text }}>
                {entryModal.kind === "product" ? stockItem(entryModal.id).qty : (entryModal.qty || 0)} {entryModal.unit || "un"}
              </span>
            </div>
            <Input label={`Quantidade recebida (${entryModal.unit || "un"})`} value={entryQty} onChange={setEntryQty} type="number" placeholder="Ex: 24" autoFocus />

            {entryModal.kind === "supply" && (
              <div style={{ background: C.bg, borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textMid, letterSpacing: ".5px", textTransform: "uppercase" }}>
                  💰 Valor pago (opcional)
                </div>
                <Input label={`Valor por ${entryModal.unit} (R$)`} value={entryUnitCost} onChange={setEntryUnitCost} type="number" placeholder={entryModal.lastPaid ? String(entryModal.lastPaid).replace(".",",") : (entryModal.cost ? String(entryModal.cost).replace(".",",") : "0,00")} />
                {entryUnitCost && entryQty && (() => {
                  const u = parseFloat(String(entryUnitCost).replace(",","."));
                  const q = parseFloat(String(entryQty).replace(",","."));
                  if (isNaN(u) || isNaN(q)) return null;
                  return (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <span style={{ color: C.textMid }}>Total da compra</span>
                      <span style={{ fontWeight: 800, color: C.text }}>{fmt(u * q)}</span>
                    </div>
                  );
                })()}
                {entryUnitCost && entryModal.cost && (() => {
                  const u = parseFloat(String(entryUnitCost).replace(",","."));
                  const ref = entryModal.cost;
                  if (isNaN(u) || !ref) return null;
                  const pct = ((u - ref) / ref) * 100;
                  if (Math.abs(pct) < 0.5) return null;
                  const up = u > ref;
                  return (
                    <div style={{ fontSize: 12, color: up ? C.danger : C.success, fontWeight: 600 }}>
                      {up ? "⬆" : "⬇"} {Math.abs(pct).toFixed(1)}% vs custo de referência ({fmt(ref)})
                    </div>
                  );
                })()}
                {entryModal.lastPaid && (
                  <div style={{ fontSize: 11, color: C.textLight }}>
                    Última compra: {fmt(entryModal.lastPaid)}/{entryModal.unit}
                    {entryModal.lastPurchaseAt ? " em " + new Date(entryModal.lastPurchaseAt).toLocaleDateString("pt-BR") : ""}
                  </div>
                )}
              </div>
            )}

            <Input label="Observação (opcional)" value={entryNote} onChange={setEntryNote} placeholder="Ex: Nota fiscal 1234" />
            {entryQty && parseFloat(String(entryQty).replace(",",".")) > 0 && (
              <div style={{ background: C.successBg, borderRadius: 8, padding: "10px 16px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: C.success }}>Novo estoque</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: C.success }}>
                  {(entryModal.kind === "product" ? stockItem(entryModal.id).qty : (entryModal.qty || 0)) + parseFloat(String(entryQty).replace(",","."))} {entryModal.unit || "un"}
                </span>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="secondary" onClick={() => setEntryModal(null)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
              <Btn variant="primary" onClick={handleEntry} style={{ flex: 1, justifyContent: "center" }} icon="✅">Confirmar Entrada</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

const adjBtn = {
  width: 30, height: 30, border: `1px solid ${C.border}`, borderRadius: 6,
  background: C.bg, cursor: "pointer", fontSize: 16, fontWeight: 700,
  color: C.textMid, display: "flex", alignItems: "center", justifyContent: "center",
};

Object.assign(window, { EstoqueModule });
