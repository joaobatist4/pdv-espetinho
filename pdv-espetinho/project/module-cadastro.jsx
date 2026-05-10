// ── Módulo Cadastro: Produtos, Usuários, Mesas, Unidades ──

function CadastroModule({ state, dispatch, user, showToast }) {
  const [tab, setTab] = React.useState("produtos");
  const [search, setSearch] = React.useState("");
  const [catFilter, setCatFilter] = React.useState("todos");

  // ── Product state ──
  const [prodModal, setProdModal] = React.useState(null);
  const emptyProd = { name: "", cat: "espetos", subcat: "", price: "", unit: "un", kitchen: false, stock: false };
  const [prodForm, setProdForm] = React.useState(emptyProd);

  // ── User state ──
  const [userModal, setUserModal] = React.useState(null);
  const emptyUser = { name: "", role: "garconete", pin: "", permissions: ["pdv","pedidos"] };
  const [userForm, setUserForm] = React.useState(emptyUser);

  function togglePerm(permId) {
    setUserForm(f => ({
      ...f,
      permissions: f.permissions.includes(permId)
        ? f.permissions.filter(p => p !== permId)
        : [...f.permissions, permId],
    }));
  }

  function applyRolePreset(role) {
    setUserForm(f => ({ ...f, role, permissions: ROLE_PERMISSIONS[role] || [] }));
  }

  // ── Table state ──
  const [tableModal, setTableModal] = React.useState(null);
  const emptyTable = { label: "", type: "mesa" };
  const [tableForm, setTableForm] = React.useState(emptyTable);

  // ── Unit state ──
  const [unitModal, setUnitModal] = React.useState(null);
  const [unitForm, setUnitForm] = React.useState({ name: "", abbr: "" });

  // ── Supply (insumo) state ──
  const [supplyModal, setSupplyModal] = React.useState(null);
  const emptySupply = { name: "", cat: "carnes", unit: "kg", cost: "", qty: "", min: "", supplier: "", lastPaid: "", lastPurchaseAt: "" };
  const [supplyForm, setSupplyForm] = React.useState(emptySupply);
  const [supplyCatFilter, setSupplyCatFilter] = React.useState("todos");

  // ── Category state ──
  const [catModal, setCatModal] = React.useState(null); // { kind, mode } | null
  const emptyCat = { id: "", label: "", icon: "📁" };
  const [catForm, setCatForm] = React.useState(emptyCat);
  const [catKindTab, setCatKindTab] = React.useState("produto"); // produto | insumo

  // ── Delete confirm ──
  const [deleteConfirm, setDeleteConfirm] = React.useState(null);

  // ─────────────────── Handlers ───────────────────

  function openNewProd()   { setProdForm(emptyProd); setProdModal("new"); }
  function openEditProd(p) { setProdForm({ ...p, price: String(p.price) }); setProdModal(p); }
  function openNewUser()   { setUserForm(emptyUser); setUserModal("new"); }
  function openEditUser(u) { setUserForm({ ...u, permissions: u.permissions || [] }); setUserModal(u); }
  function openNewTable()  { setTableForm(emptyTable); setTableModal("new"); }
  function openEditTable(t){ setTableForm({ ...t }); setTableModal(t); }
  function openNewUnit()   { setUnitForm({ name: "", abbr: "" }); setUnitModal("new"); }
  function openEditUnit(u) { setUnitForm({ ...u }); setUnitModal(u); }
  function openNewSupply()   { setSupplyForm(emptySupply); setSupplyModal("new"); }
  function openEditSupply(s) { setSupplyForm({ ...s, cost: String(s.cost ?? ""), qty: String(s.qty ?? ""), min: String(s.min ?? ""), lastPaid: String(s.lastPaid ?? ""), lastPurchaseAt: s.lastPurchaseAt ? new Date(s.lastPurchaseAt).toISOString().slice(0,10) : "" }); setSupplyModal(s); }
  function openNewCat(kind)   { setCatForm({ id: "", label: "", icon: kind === "produto" ? "📦" : "📁" }); setCatModal({ kind, mode: "new" }); }
  function openEditCat(kind, c) { setCatForm({ ...c }); setCatModal({ kind, mode: c }); }

  function saveProd() {
    if (!prodForm.name.trim()) { showToast("Informe o nome do produto", "warn"); return; }
    const price = parseFloat(String(prodForm.price).replace(",", "."));
    if (!prodForm.price || isNaN(price) || price <= 0) { showToast("Informe um preço válido", "warn"); return; }
    const product = { ...prodForm, price, name: prodForm.name.trim() };
    if (prodModal === "new") {
      dispatch({ type: "ADD_PRODUCT", product: { ...product, id: Date.now() } });
      showToast("✅ Produto cadastrado!");
    } else {
      dispatch({ type: "UPDATE_PRODUCT", product: { ...product, id: prodModal.id } });
      showToast("✅ Produto atualizado!");
    }
    setProdModal(null);
  }

  function saveUser() {
    if (!userForm.name.trim()) { showToast("Informe o nome", "warn"); return; }
    if (!userForm.pin || userForm.pin.length < 4) { showToast("PIN deve ter ao menos 4 dígitos", "warn"); return; }
    const u = { ...userForm, permissions: userForm.permissions || [] };
    if (userModal === "new") {
      dispatch({ type: "ADD_USER", user: { ...u, id: Date.now(), avatar: userForm.name.trim()[0].toUpperCase() } });
      showToast("✅ Usuário criado!");
    } else {
      dispatch({ type: "UPDATE_USER", user: { ...u } });
      showToast("✅ Usuário atualizado!");
    }
    setUserModal(null);
  }

  function saveTable() {
    if (!tableForm.label.trim()) { showToast("Informe o nome da mesa", "warn"); return; }
    if (tableModal === "new") {
      dispatch({ type: "ADD_TABLE_CUSTOM", table: { label: tableForm.label.trim(), type: tableForm.type, status: "livre", id: Date.now() } });
      showToast("✅ Mesa cadastrada!");
    } else {
      dispatch({ type: "UPDATE_TABLE", table: { ...tableModal, label: tableForm.label.trim(), type: tableForm.type } });
      showToast("✅ Mesa atualizada!");
    }
    setTableModal(null);
  }

  function saveUnit() {
    if (!unitForm.name.trim()) { showToast("Informe o nome da unidade", "warn"); return; }
    if (unitModal === "new") {
      dispatch({ type: "ADD_UNIT", unit: { ...unitForm, id: Date.now(), name: unitForm.name.trim(), abbr: unitForm.abbr.trim() || unitForm.name.trim() } });
      showToast("✅ Unidade cadastrada!");
    } else {
      dispatch({ type: "UPDATE_UNIT", unit: { ...unitForm, name: unitForm.name.trim(), abbr: unitForm.abbr.trim() || unitForm.name.trim() } });
      showToast("✅ Unidade atualizada!");
    }
    setUnitModal(null);
  }

  function saveSupply() {
    if (!supplyForm.name.trim()) { showToast("Informe o nome do insumo", "warn"); return; }
    const cost = parseFloat(String(supplyForm.cost).replace(",", "."));
    const qty  = parseFloat(String(supplyForm.qty).replace(",", "."));
    const min  = parseFloat(String(supplyForm.min).replace(",", "."));
    const lastPaid = supplyForm.lastPaid ? parseFloat(String(supplyForm.lastPaid).replace(",", ".")) : null;
    if (isNaN(cost) || cost < 0) { showToast("Informe um custo válido", "warn"); return; }
    if (lastPaid != null && (isNaN(lastPaid) || lastPaid < 0)) { showToast("Último valor pago inválido", "warn"); return; }
    const supply = {
      ...supplyForm,
      name: supplyForm.name.trim(),
      supplier: (supplyForm.supplier || "").trim(),
      cost,
      qty: isNaN(qty) ? 0 : qty,
      min: isNaN(min) ? 0 : min,
      lastPaid: lastPaid,
      lastPurchaseAt: supplyForm.lastPurchaseAt ? new Date(supplyForm.lastPurchaseAt).getTime() : null,
    };
    if (supplyModal === "new") {
      dispatch({ type: "ADD_SUPPLY", supply: { ...supply, id: Date.now() } });
      showToast("✅ Insumo cadastrado!");
    } else {
      dispatch({ type: "UPDATE_SUPPLY", supply: { ...supply, id: supplyModal.id } });
      showToast("✅ Insumo atualizado!");
    }
    setSupplyModal(null);
  }

  function saveCat() {
    if (!catForm.label.trim()) { showToast("Informe o nome da categoria", "warn"); return; }
    const kind = catModal.kind;
    const isNew = catModal.mode === "new";
    const slug = (catForm.id || catForm.label).toString().trim()
      .toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
    const cat = { id: isNew ? slug + "_" + Date.now().toString(36) : catForm.id, label: catForm.label.trim(), icon: catForm.icon || "📁" };
    const action = kind === "produto"
      ? (isNew ? "ADD_PROD_CAT" : "UPDATE_PROD_CAT")
      : (isNew ? "ADD_SUPPLY_CAT" : "UPDATE_SUPPLY_CAT");
    dispatch({ type: action, cat });
    showToast(isNew ? "✅ Categoria cadastrada!" : "✅ Categoria atualizada!");
    setCatModal(null);
  }

  function confirmDelete(type, item) { setDeleteConfirm({ type, item }); }
  function doDelete() {
    const { type, item } = deleteConfirm;
    if (type === "prod")   { dispatch({ type: "REMOVE_PRODUCT", productId: item.id }); showToast(`"${item.name}" removido`); }
    if (type === "user")   { dispatch({ type: "REMOVE_USER", userId: item.id }); showToast(`Usuário ${item.name} removido`); }
    if (type === "table")  { dispatch({ type: "REMOVE_TABLE", tableId: item.id }); showToast(`${item.label} removida`); }
    if (type === "unit")   { dispatch({ type: "REMOVE_UNIT", unitId: item.id }); showToast(`Unidade "${item.name}" removida`); }
    if (type === "supply") { dispatch({ type: "REMOVE_SUPPLY", supplyId: item.id }); showToast(`Insumo "${item.name}" removido`); }
    if (type === "prodCat")   { dispatch({ type: "REMOVE_PROD_CAT", catId: item.id }); showToast(`Categoria "${item.label}" removida`); }
    if (type === "supplyCat") { dispatch({ type: "REMOVE_SUPPLY_CAT", catId: item.id }); showToast(`Categoria "${item.label}" removida`); }
    setDeleteConfirm(null);
  }

  // ─────────────────── Derived data ───────────────────

  // Merged categories (base + custom) — defined first because other derived data references them
  const baseProdCats = Object.keys(CAT_LABELS).map(k => ({ id: k, label: CAT_LABELS[k], icon: CAT_ICONS[k] || "📁", base: true }));
  const allProdCats  = [...baseProdCats, ...(state.extraProdCats || []).map(c => ({ ...c, base: false }))];
  const baseSupplyCats = Object.keys(SUPPLY_CAT_LABELS).map(k => ({ id: k, label: SUPPLY_CAT_LABELS[k], icon: SUPPLY_CAT_ICONS[k] || "📁", base: true }));
  const allSupplyCats  = [...baseSupplyCats, ...(state.extraSupplyCats || []).map(c => ({ ...c, base: false }))];
  const prodCatLabel   = (id) => allProdCats.find(c => c.id === id) || { id, label: id, icon: "📁" };
  const supplyCatLabel = (id) => allSupplyCats.find(c => c.id === id) || { id, label: id, icon: "📁" };

  const allProducts = [...MENU, ...(state.extraProducts || [])];
  const isExtra = (p) => (state.extraProducts || []).some(ep => ep.id === p.id);
  const cats = ["todos", ...allProdCats.map(c => c.id)];

  const allUnits = [
    ...(["un","espeto","prato","porção","dose","taça","garrafa","jarra","kg"].map((u,i) => ({ id: "base-"+i, name: u, abbr: u, base: true }))),
    ...(state.units || []),
  ];
  const unitOptions = allUnits.map(u => ({ value: u.abbr || u.name, label: u.name }));

  const filteredProds = allProducts.filter(p => {
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const mc = catFilter === "todos" || p.cat === catFilter;
    return ms && mc;
  });
  const filteredUsers   = state.users.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()));
  const filteredTables  = state.tables.filter(t => !search || t.label.toLowerCase().includes(search.toLowerCase()));
  const filteredUnits   = allUnits.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()));

  const supplies = state.supplies || [];

  const supplyCats = ["todos", ...allSupplyCats.map(c => c.id)];
  const filteredSupplies = supplies.filter(s => {
    const ms = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.supplier || "").toLowerCase().includes(search.toLowerCase());
    const mc = supplyCatFilter === "todos" || s.cat === supplyCatFilter;
    return ms && mc;
  });

  const tabs = [
    { id: "produtos",   label: "📦 Produtos" },
    { id: "insumos",    label: "🥩 Insumos" },
    { id: "categorias", label: "🏷️ Categorias" },
    { id: "mesas",      label: "🪑 Mesas" },
    { id: "unidades",   label: "📐 Unidades" },
    { id: "usuarios",   label: "👥 Usuários" },
  ];

  const newActions = {
    produtos:   openNewProd,
    insumos:    openNewSupply,
    categorias: () => openNewCat(catKindTab),
    mesas:      openNewTable,
    unidades:   openNewUnit,
    usuarios:   openNewUser,
  };
  const newLabels = {
    produtos:   "Novo Produto",
    insumos:    "Novo Insumo",
    categorias: catKindTab === "produto" ? "Nova Cat. de Produto" : "Nova Cat. de Insumo",
    mesas:      "Nova Mesa",
    unidades:   "Nova Unidade",
    usuarios:   "Novo Usuário",
  };

  // ─────────────────── Render ───────────────────

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Cadastro"
        subtitle="Produtos, mesas, unidades e usuários"
        actions={<Btn icon="➕" onClick={newActions[tab]}>{newLabels[tab]}</Btn>}
      />

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: `2px solid ${C.border}` }}>
        {tabs.map(({ id, label }) => (
          <button key={id} onClick={() => { setTab(id); setSearch(""); setCatFilter("todos"); }} style={{
            border: "none", background: "transparent", padding: "10px 22px",
            fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            color: tab === id ? C.amber : C.textMid,
            borderBottom: `2px solid ${tab === id ? C.amber : "transparent"}`,
            marginBottom: -2, whiteSpace: "nowrap",
          }}>{label}</button>
        ))}
      </div>

      {/* Search + cat filter */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Input placeholder="🔍  Buscar…" value={search} onChange={setSearch} style={{ flex: 1, minWidth: 180 }} />
        {tab === "produtos" && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {cats.map(c => (
              <button key={c} onClick={() => setCatFilter(c)} style={{
                border: `1px solid ${catFilter === c ? C.amber : C.border}`,
                borderRadius: 8, padding: "8px 13px", fontSize: 12,
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                background: catFilter === c ? C.amber : C.surface,
                color: catFilter === c ? "#fff" : C.textMid,
              }}>
                {c === "todos" ? "Todos" : prodCatLabel(c).icon + " " + prodCatLabel(c).label}
              </button>
            ))}
          </div>
        )}
        {tab === "insumos" && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {supplyCats.map(c => (
              <button key={c} onClick={() => setSupplyCatFilter(c)} style={{
                border: `1px solid ${supplyCatFilter === c ? C.amber : C.border}`,
                borderRadius: 8, padding: "8px 13px", fontSize: 12,
                fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                background: supplyCatFilter === c ? C.amber : C.surface,
                color: supplyCatFilter === c ? "#fff" : C.textMid,
              }}>
                {c === "todos" ? "Todos" : supplyCatLabel(c).icon + " " + supplyCatLabel(c).label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ══ PRODUTOS ══ */}
      {tab === "produtos" && (
        <Card style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ overflow: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: C.bg, position: "sticky", top: 0 }}>
                  {["Produto", "Categoria", "Preço", "Unidade", "Cozinha", "Estoque", "Ações"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: ".5px", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProds.map(p => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ fontWeight: 600, color: C.text }}>{p.name}</div>
                      {p.subcat && <div style={{ fontSize: 11, color: C.textLight }}>{p.subcat}</div>}
                      {isExtra(p) && <span style={{ fontSize: 10, background: C.amberLight, color: C.amber, borderRadius: 4, padding: "1px 6px", fontWeight: 700 }}>Personalizado</span>}
                    </td>
                    <td style={{ padding: "10px 16px" }}>
                      <Badge color={C.amberLight} textColor={C.amber}>{prodCatLabel(p.cat).icon} {prodCatLabel(p.cat).label}</Badge>
                    </td>
                    <td style={{ padding: "10px 16px", fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>{fmt(p.price)}</td>
                    <td style={{ padding: "10px 16px", color: C.textMid, fontSize: 13 }}>{p.unit}</td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>{p.kitchen ? "✅" : <span style={{ color: C.textLight }}>—</span>}</td>
                    <td style={{ padding: "10px 16px", textAlign: "center" }}>{p.stock ? "✅" : <span style={{ color: C.textLight }}>—</span>}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn size="sm" variant="secondary" onClick={() => openEditProd(p)}>Editar</Btn>
                        {isExtra(p) && <Btn size="sm" variant="danger" onClick={() => confirmDelete("prod", p)}>Remover</Btn>}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredProds.length === 0 && <tr><td colSpan={7}><Empty icon="📦" msg="Nenhum produto encontrado" /></td></tr>}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textLight }}>
            {filteredProds.length} produto{filteredProds.length !== 1 ? "s" : ""} · {(state.extraProducts || []).length} personalizado{(state.extraProducts || []).length !== 1 ? "s" : ""}
          </div>
        </Card>
      )}

      {/* ══ INSUMOS ══ */}
      {tab === "insumos" && (
        <Card style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", gap: 12, padding: "14px 16px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
            <div style={{ flex: 1, fontSize: 13, color: C.textMid }}>
              <strong style={{ color: C.text }}>{filteredSupplies.length}</strong> insumo{filteredSupplies.length !== 1 ? "s" : ""}
              {" · "}
              <strong style={{ color: C.text }}>
                {filteredSupplies.reduce((s, x) => s + (x.qty || 0) * (x.cost || 0), 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </strong> em estoque
              {" · "}
              <strong style={{ color: C.danger }}>
                {filteredSupplies.filter(x => (x.qty || 0) <= (x.min || 0)).length}
              </strong> abaixo do mínimo
            </div>
            <div style={{ fontSize: 12, color: C.textLight, alignSelf: "center" }}>
              Insumos não aparecem no PDV — apenas no controle de estoque.
            </div>
          </div>
          <div style={{ overflow: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: C.bg, position: "sticky", top: 0 }}>
                  {["Insumo", "Categoria", "Custo", "Estoque", "Mínimo", "Fornecedor", "Ações"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: ".5px", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSupplies.map(s => {
                  const low = (s.qty || 0) <= (s.min || 0);
                  return (
                    <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ fontWeight: 600, color: C.text }}>{s.name}</div>
                        <div style={{ fontSize: 11, color: C.textLight }}>por {s.unit}</div>
                      </td>
                      <td style={{ padding: "10px 16px" }}>
                        <Badge color={C.amberLight} textColor={C.amber}>{supplyCatLabel(s.cat).icon} {supplyCatLabel(s.cat).label}</Badge>
                      </td>
                      <td style={{ padding: "10px 16px", fontWeight: 700, color: C.text, whiteSpace: "nowrap" }}>{fmt(s.cost)}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{ fontWeight: 800, color: low ? C.danger : C.text }}>{s.qty}</span>
                        <span style={{ fontSize: 12, color: C.textMid }}> {s.unit}</span>
                      </td>
                      <td style={{ padding: "10px 16px", color: C.textMid, fontSize: 13 }}>{s.min} {s.unit}</td>
                      <td style={{ padding: "10px 16px", color: C.textMid, fontSize: 13 }}>{s.supplier || <span style={{ color: C.textLight }}>—</span>}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Btn size="sm" variant="secondary" onClick={() => openEditSupply(s)}>Editar</Btn>
                          <Btn size="sm" variant="danger" onClick={() => confirmDelete("supply", s)}>Remover</Btn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredSupplies.length === 0 && <tr><td colSpan={7}><Empty icon="🥩" msg="Nenhum insumo cadastrado" /></td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ══ CATEGORIAS ══ */}
      {tab === "categorias" && (
        <Card style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {/* Sub-tabs: Produto vs Insumo */}
          <div style={{ display: "flex", gap: 4, padding: "12px 16px", borderBottom: `1px solid ${C.border}`, background: C.bg }}>
            {[
              { id: "produto", icon: "📦", label: "de Produto", count: allProdCats.length },
              { id: "insumo",  icon: "🥩", label: "de Insumo",  count: allSupplyCats.length },
            ].map(t => {
              const active = catKindTab === t.id;
              return (
                <button key={t.id} onClick={() => setCatKindTab(t.id)} style={{
                  border: "none", borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 700,
                  background: active ? C.amber : "transparent",
                  color: active ? "#fff" : C.textMid,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <span>{t.icon}</span>
                  <span>Categorias {t.label}</span>
                  <span style={{
                    background: active ? "rgba(255,255,255,.25)" : C.surface,
                    color: active ? "#fff" : C.textMid,
                    borderRadius: 99, padding: "1px 8px", fontSize: 11, fontWeight: 800,
                  }}>{t.count}</span>
                </button>
              );
            })}
          </div>

          <div style={{ overflow: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: C.bg, position: "sticky", top: 0 }}>
                  {["Categoria", "Identificador", "Itens", "Tipo", "Ações"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: ".5px", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(catKindTab === "produto" ? allProdCats : allSupplyCats)
                  .filter(c => !search || c.label.toLowerCase().includes(search.toLowerCase()))
                  .map(c => {
                    const itemCount = catKindTab === "produto"
                      ? allProducts.filter(p => p.cat === c.id).length
                      : supplies.filter(s => s.cat === c.id).length;
                    const inUse = itemCount > 0;
                    return (
                      <tr key={c.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 8, background: C.amberLight,
                              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                            }}>{c.icon}</div>
                            <span style={{ fontWeight: 600, color: C.text }}>{c.label}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ fontFamily: "monospace", background: C.bg, borderRadius: 6, padding: "3px 10px", fontSize: 12, color: C.textMid }}>{c.id}</span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {itemCount > 0
                            ? <span style={{ fontWeight: 700, color: C.text }}>{itemCount} {catKindTab === "produto" ? "produto" : "insumo"}{itemCount !== 1 ? "s" : ""}</span>
                            : <span style={{ color: C.textLight, fontSize: 13 }}>vazia</span>
                          }
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {c.base
                            ? <Badge color={C.bg} textColor={C.textMid}>Padrão</Badge>
                            : <Badge color={C.amberLight} textColor={C.amber}>Personalizada</Badge>
                          }
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            {!c.base && <Btn size="sm" variant="secondary" onClick={() => openEditCat(catKindTab, c)}>Editar</Btn>}
                            {!c.base && !inUse && <Btn size="sm" variant="danger" onClick={() => confirmDelete(catKindTab === "produto" ? "prodCat" : "supplyCat", c)}>Remover</Btn>}
                            {!c.base && inUse && <span style={{ fontSize: 11, color: C.warn }}>Em uso — não pode remover</span>}
                            {c.base && <span style={{ fontSize: 12, color: C.textLight }}>Categoria do sistema</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textLight }}>
            {catKindTab === "produto"
              ? `${(state.extraProdCats || []).length} personalizada${(state.extraProdCats || []).length !== 1 ? "s" : ""} · ${baseProdCats.length} padrão`
              : `${(state.extraSupplyCats || []).length} personalizada${(state.extraSupplyCats || []).length !== 1 ? "s" : ""} · ${baseSupplyCats.length} padrão`
            }
          </div>
        </Card>
      )}

      {/* ══ MESAS ══ */}
      {tab === "mesas" && (
        <Card style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ overflow: "auto", flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, padding: 20, alignContent: "start" }}>
              {filteredTables.map(t => {
                const sc = statusColors[t.status] || { bg: C.bg, text: C.textMid, label: t.status };
                const hasOrder = state.orders.some(o => o.tableId === t.id && o.status === "aberto");
                return (
                  <Card key={t.id} style={{ padding: 16, position: "relative" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ fontSize: 22 }}>{t.type === "balcao" ? "🍺" : "🪑"}</div>
                      <Badge color={sc.bg} textColor={sc.text}>{sc.label}</Badge>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: C.text, marginBottom: 4 }}>{t.label}</div>
                    <div style={{ fontSize: 12, color: C.textMid, marginBottom: 12 }}>
                      {t.type === "balcao" ? "Balcão" : "Mesa"} · ID {t.id}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Btn size="sm" variant="secondary" onClick={() => openEditTable(t)} style={{ flex: 1, justifyContent: "center" }}>Editar</Btn>
                      {!hasOrder && t.status === "livre" && (
                        <Btn size="sm" variant="danger" onClick={() => confirmDelete("table", t)}>×</Btn>
                      )}
                    </div>
                    {hasOrder && (
                      <div style={{ fontSize: 11, color: C.warn, marginTop: 8, textAlign: "center" }}>Mesa com pedido ativo</div>
                    )}
                  </Card>
                );
              })}
              {filteredTables.length === 0 && <Empty icon="🪑" msg="Nenhuma mesa encontrada" />}
            </div>
          </div>
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textLight }}>
            {state.tables.filter(t => t.type === "mesa").length} mesa{state.tables.filter(t => t.type === "mesa").length !== 1 ? "s" : ""} · {state.tables.filter(t => t.type === "balcao").length} balcão/balcões
          </div>
        </Card>
      )}

      {/* ══ UNIDADES ══ */}
      {tab === "unidades" && (
        <Card style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ overflow: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: C.bg, position: "sticky", top: 0 }}>
                  {["Nome da Unidade", "Abreviação", "Tipo", "Ações"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: ".5px", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUnits.map(u => (
                  <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "11px 16px", fontWeight: 600, color: C.text }}>{u.name}</td>
                    <td style={{ padding: "11px 16px" }}>
                      <span style={{ fontFamily: "monospace", background: C.bg, borderRadius: 6, padding: "3px 10px", fontSize: 13, fontWeight: 700, color: C.amber }}>{u.abbr || u.name}</span>
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      {u.base
                        ? <Badge color={C.bg} textColor={C.textMid}>Padrão</Badge>
                        : <Badge color={C.amberLight} textColor={C.amber}>Personalizada</Badge>
                      }
                    </td>
                    <td style={{ padding: "11px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {!u.base && <Btn size="sm" variant="secondary" onClick={() => openEditUnit(u)}>Editar</Btn>}
                        {!u.base && <Btn size="sm" variant="danger" onClick={() => confirmDelete("unit", u)}>Remover</Btn>}
                        {u.base && <span style={{ fontSize: 12, color: C.textLight }}>Unidade padrão do sistema</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${C.border}`, fontSize: 12, color: C.textLight }}>
            {allUnits.filter(u => !u.base).length} unidade{allUnits.filter(u => !u.base).length !== 1 ? "s" : ""} personalizada{allUnits.filter(u => !u.base).length !== 1 ? "s" : ""} · {allUnits.filter(u => u.base).length} padrão
          </div>
        </Card>
      )}

      {/* ══ USUÁRIOS ══ */}
      {tab === "usuarios" && (
        <Card style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ overflow: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: C.bg, position: "sticky", top: 0 }}>
                  {["Usuário", "Perfil", "Permissões", "PIN", "Ações"].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: ".5px", borderBottom: `1px solid ${C.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => {
                  const rc = roleColors[u.role] || { bg: C.bg, text: C.textMid };
                  return (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: "50%", background: rc.bg, color: rc.text, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>{u.avatar}</div>
                          <span style={{ fontWeight: 600, color: C.text }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "11px 16px" }}><Badge color={rc.bg} textColor={rc.text}>{ROLE_LABELS[u.role]}</Badge></td>
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {(u.permissions || []).map(p => {
                            const pDef = ALL_PERMISSIONS.find(x => x.id === p);
                            return (
                              <span key={p} style={{ fontSize: 11, background: C.bg, color: C.textMid, borderRadius: 4, padding: "2px 6px", border: `1px solid ${C.border}` }}>
                                {pDef ? pDef.icon + " " + pDef.label : p}
                              </span>
                            );
                          })}
                          {(u.permissions || []).length === 0 && <span style={{ color: C.textLight, fontSize: 13 }}>Sem acesso</span>}
                        </div>
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <span style={{ fontFamily: "monospace", background: C.bg, borderRadius: 4, padding: "3px 8px", letterSpacing: 2 }}>{"•".repeat(u.pin.length)}</span>
                      </td>
                      <td style={{ padding: "11px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <Btn size="sm" variant="secondary" onClick={() => openEditUser(u)}>Editar</Btn>
                          {u.id !== user.id && <Btn size="sm" variant="danger" onClick={() => confirmDelete("user", u)}>Remover</Btn>}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ══ Modal: Produto ══ */}
      <Modal open={!!prodModal} onClose={() => setProdModal(null)} title={prodModal === "new" ? "Novo Produto" : "Editar Produto"} width={500}>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Nome do produto *" value={prodForm.name} onChange={v => setProdForm(f => ({ ...f, name: v }))} placeholder="Ex: Espeto de Frango Especial" autoFocus />
          <div style={{ display: "flex", gap: 12 }}>
            <Select label="Categoria *" value={prodForm.cat} onChange={v => setProdForm(f => ({ ...f, cat: v }))}
              options={allProdCats.map(c => ({ value: c.id, label: c.icon + " " + c.label }))} style={{ flex: 1 }} />
            <Input label="Subcategoria" value={prodForm.subcat} onChange={v => setProdForm(f => ({ ...f, subcat: v }))} placeholder="Ex: Aves…" style={{ flex: 1 }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <Input label="Preço (R$) *" value={prodForm.price} onChange={v => setProdForm(f => ({ ...f, price: v }))} placeholder="0,00" type="number" style={{ flex: 1 }} />
            <Select label="Unidade" value={prodForm.unit} onChange={v => setProdForm(f => ({ ...f, unit: v }))}
              options={unitOptions} style={{ flex: 1 }} />
          </div>
          <div style={{ background: C.bg, borderRadius: 10, padding: "14px 16px", display: "flex", gap: 24 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", userSelect: "none" }}>
              <input type="checkbox" checked={prodForm.kitchen} onChange={e => setProdForm(f => ({ ...f, kitchen: e.target.checked }))} style={{ width: 16, height: 16, accentColor: C.amber, cursor: "pointer" }} />
              🍳 Vai para a cozinha
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, cursor: "pointer", userSelect: "none" }}>
              <input type="checkbox" checked={prodForm.stock} onChange={e => setProdForm(f => ({ ...f, stock: e.target.checked }))} style={{ width: 16, height: 16, accentColor: C.amber, cursor: "pointer" }} />
              📦 Controle de estoque
            </label>
          </div>
          {prodForm.name && prodForm.price && (
            <div style={{ background: C.amberLight, borderRadius: 10, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.brownMid }}>{prodForm.name}</div>
                <div style={{ fontSize: 12, color: C.brownMid }}>{prodCatLabel(prodForm.cat).label}{prodForm.subcat ? " · " + prodForm.subcat : ""}{prodForm.kitchen ? " · 🍳" : ""}</div>
              </div>
              <div style={{ fontWeight: 800, fontSize: 18, color: C.amber }}>
                {(() => { const p = parseFloat(String(prodForm.price).replace(",",".")); return isNaN(p) ? "" : fmt(p); })()}
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn variant="secondary" onClick={() => setProdModal(null)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
            <Btn variant="primary" onClick={saveProd} style={{ flex: 1, justifyContent: "center" }} icon="💾">Salvar Produto</Btn>
          </div>
        </div>
      </Modal>

      {/* ══ Modal: Insumo ══ */}
      <Modal open={!!supplyModal} onClose={() => setSupplyModal(null)} title={supplyModal === "new" ? "Novo Insumo" : "Editar Insumo"} width={520}>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Nome do insumo *" value={supplyForm.name} onChange={v => setSupplyForm(f => ({ ...f, name: v }))} placeholder="Ex: Carne bovina (alcatra), Carvão vegetal…" autoFocus />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Select label="Categoria *" value={supplyForm.cat} onChange={v => setSupplyForm(f => ({ ...f, cat: v }))}
              options={allSupplyCats.map(c => ({ value: c.id, label: c.icon + " " + c.label }))} />
            <Select label="Unidade de compra" value={supplyForm.unit} onChange={v => setSupplyForm(f => ({ ...f, unit: v }))}
              options={[
                { value: "kg", label: "kg" },
                { value: "g", label: "g" },
                { value: "L", label: "L" },
                { value: "ml", label: "ml" },
                { value: "un", label: "un" },
                { value: "pacote", label: "pacote" },
                { value: "caixa", label: "caixa" },
                { value: "fardo", label: "fardo" },
              ]} />
            <Input label="Custo por unidade (R$) *" value={supplyForm.cost} onChange={v => setSupplyForm(f => ({ ...f, cost: v }))} placeholder="0,00" type="number" />
            <Input label="Estoque atual" value={supplyForm.qty} onChange={v => setSupplyForm(f => ({ ...f, qty: v }))} placeholder="0" type="number" />
            <Input label="Estoque mínimo" value={supplyForm.min} onChange={v => setSupplyForm(f => ({ ...f, min: v }))} placeholder="0" type="number" />
          </div>
          <Input label="Fornecedor (opcional)" value={supplyForm.supplier} onChange={v => setSupplyForm(f => ({ ...f, supplier: v }))} placeholder="Ex: Frigorífico Boa Carne" />

          {/* Última compra — para cruzar com custo e detectar variação de preço */}
          <div style={{ background: C.bg, borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.textMid, letterSpacing: ".5px", textTransform: "uppercase" }}>
              💰 Última compra
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Input label={`Valor pago por ${supplyForm.unit} (R$)`} value={supplyForm.lastPaid} onChange={v => setSupplyForm(f => ({ ...f, lastPaid: v }))} placeholder="0,00" type="number" />
              <Input label="Data da compra" value={supplyForm.lastPurchaseAt} onChange={v => setSupplyForm(f => ({ ...f, lastPurchaseAt: v }))} type="date" />
            </div>
            {supplyForm.lastPaid && supplyForm.cost && (() => {
              const lp = parseFloat(String(supplyForm.lastPaid).replace(",","."));
              const c  = parseFloat(String(supplyForm.cost).replace(",","."));
              if (isNaN(lp) || isNaN(c) || c === 0) return null;
              const diff = lp - c;
              const pct = ((lp - c) / c) * 100;
              if (Math.abs(pct) < 0.5) return null;
              const up = diff > 0;
              return (
                <div style={{ fontSize: 12, color: up ? C.danger : C.success, fontWeight: 600 }}>
                  {up ? "⬆" : "⬇"} {up ? "Aumento" : "Redução"} de {Math.abs(pct).toFixed(1)}% em relação ao custo de referência ({fmt(c)})
                </div>
              );
            })()}
            <div style={{ fontSize: 11, color: C.textLight, lineHeight: 1.5 }}>
              Estes valores são usados para cruzar com o custo de referência e detectar variações de preço.
              Novas compras registradas via <strong>Estoque › Entrada</strong> também são guardadas no histórico.
            </div>
          </div>

          {supplyForm.name && supplyForm.cost && (
            <div style={{ background: C.amberLight, borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: C.brownMid }}>{supplyForm.name}</div>
                <div style={{ fontSize: 12, color: C.brownMid }}>
                  {supplyCatLabel(supplyForm.cat).label} · custo por {supplyForm.unit}
                  {supplyForm.qty && ` · ${supplyForm.qty} ${supplyForm.unit} em estoque`}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: C.amber }}>
                  {(() => { const p = parseFloat(String(supplyForm.cost).replace(",",".")); return isNaN(p) ? "" : fmt(p); })()}
                </div>
                {supplyForm.qty && supplyForm.cost && (() => {
                  const c = parseFloat(String(supplyForm.cost).replace(",","."));
                  const q = parseFloat(String(supplyForm.qty).replace(",","."));
                  if (isNaN(c) || isNaN(q)) return null;
                  return <div style={{ fontSize: 11, color: C.brownMid }}>Total: {fmt(c * q)}</div>;
                })()}
              </div>
            </div>
          )}

          <div style={{ background: C.bg, borderRadius: 8, padding: "10px 14px", fontSize: 12, color: C.textMid, lineHeight: 1.5 }}>
            <strong style={{ color: C.text }}>Insumos</strong> são matérias-primas e materiais de consumo (carnes, carvão, descartáveis, limpeza). Não aparecem no PDV — só no controle de estoque.
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn variant="secondary" onClick={() => setSupplyModal(null)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
            <Btn variant="primary" onClick={saveSupply} style={{ flex: 1, justifyContent: "center" }} icon="💾">Salvar Insumo</Btn>
          </div>
        </div>
      </Modal>

      {/* ══ Modal: Categoria ══ */}
      <Modal open={!!catModal} onClose={() => setCatModal(null)}
        title={catModal?.mode === "new"
          ? `Nova Categoria de ${catModal.kind === "produto" ? "Produto" : "Insumo"}`
          : `Editar Categoria`}
        width={420}>
        {catModal && (() => {
          const ICON_OPTS = catModal.kind === "produto"
            ? ["🔥","🍽️","🥗","🍺","🥤","🍰","☕","🍕","🍔","🌮","🥟","🍣","🍜","🥘","📦"]
            : ["🥩","🥬","🌾","🥡","🔥","🧽","🥚","🧀","🍅","🌶️","🍞","🧂","🧴","📦","🛒"];
          return (
            <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <Input label="Nome da categoria *" value={catForm.label} onChange={v => setCatForm(f => ({ ...f, label: v }))} placeholder="Ex: Sobremesas, Embalagens…" autoFocus />

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>Ícone</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, background: C.bg, borderRadius: 10, padding: 10 }}>
                  {ICON_OPTS.map(ic => {
                    const active = catForm.icon === ic;
                    return (
                      <button key={ic} onClick={() => setCatForm(f => ({ ...f, icon: ic }))} style={{
                        width: 38, height: 38, borderRadius: 8, fontSize: 18,
                        border: `2px solid ${active ? C.amber : "transparent"}`,
                        background: active ? C.amberLight : C.surface,
                        cursor: "pointer", fontFamily: "inherit",
                      }}>{ic}</button>
                    );
                  })}
                </div>
              </div>

              {catForm.label && (
                <div style={{ background: C.amberLight, borderRadius: 10, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontSize: 22 }}>{catForm.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: C.brownMid }}>{catForm.label}</div>
                    <div style={{ fontSize: 11, color: C.brownMid }}>
                      Categoria de {catModal.kind === "produto" ? "Produto" : "Insumo"}
                      {catModal.mode === "new" ? " — aparecerá ao cadastrar novos itens" : ""}
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <Btn variant="secondary" onClick={() => setCatModal(null)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
                <Btn variant="primary" onClick={saveCat} style={{ flex: 1, justifyContent: "center" }} icon="💾">Salvar</Btn>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* ══ Modal: Mesa ══ */}
      <Modal open={!!tableModal} onClose={() => setTableModal(null)} title={tableModal === "new" ? "Nova Mesa / Balcão" : `Editar — ${tableModal?.label}`} width={420}>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Nome *" value={tableForm.label} onChange={v => setTableForm(f => ({ ...f, label: v }))} placeholder="Ex: Mesa 11, Balcão VIP…" autoFocus />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>Tipo</label>
            <div style={{ display: "flex", gap: 10 }}>
              {[["mesa","🪑 Mesa"], ["balcao","🍺 Balcão"]].map(([v, l]) => (
                <button key={v} onClick={() => setTableForm(f => ({ ...f, type: v }))} style={{
                  flex: 1, padding: "12px", border: `2px solid ${tableForm.type === v ? C.amber : C.border}`,
                  borderRadius: 10, background: tableForm.type === v ? C.amberLight : C.surface,
                  cursor: "pointer", fontFamily: "inherit", fontSize: 14, fontWeight: 700,
                  color: tableForm.type === v ? C.amber : C.textMid, transition: "all .15s",
                }}>{l}</button>
              ))}
            </div>
          </div>
          {tableModal === "new" && (
            <div style={{ background: C.bg, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.textMid }}>
              A nova {tableForm.type === "balcao" ? "balcão" : "mesa"} <strong style={{ color: C.text }}>"{tableForm.label || "…"}"</strong> será criada com status <Badge color={C.successBg} textColor={C.success}>Livre</Badge>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn variant="secondary" onClick={() => setTableModal(null)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
            <Btn variant="primary" onClick={saveTable} style={{ flex: 1, justifyContent: "center" }} icon="💾">Salvar</Btn>
          </div>
        </div>
      </Modal>

      {/* ══ Modal: Unidade ══ */}
      <Modal open={!!unitModal} onClose={() => setUnitModal(null)} title={unitModal === "new" ? "Nova Unidade de Medida" : "Editar Unidade"} width={400}>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Nome completo *" value={unitForm.name} onChange={v => setUnitForm(f => ({ ...f, name: v }))} placeholder="Ex: Quilograma, Litro, Dúzia…" autoFocus />
          <Input label="Abreviação" value={unitForm.abbr} onChange={v => setUnitForm(f => ({ ...f, abbr: v }))} placeholder={unitForm.name || "Ex: kg, L, dz"} />
          <div style={{ background: C.bg, borderRadius: 8, padding: "10px 14px", fontSize: 13, color: C.textMid }}>
            Esta unidade ficará disponível no campo <strong>Unidade</strong> ao cadastrar produtos.
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn variant="secondary" onClick={() => setUnitModal(null)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
            <Btn variant="primary" onClick={saveUnit} style={{ flex: 1, justifyContent: "center" }} icon="💾">Salvar</Btn>
          </div>
        </div>
      </Modal>

      {/* ══ Modal: Usuário ══ */}
      <Modal open={!!userModal} onClose={() => setUserModal(null)} title={userModal === "new" ? "Novo Usuário" : "Editar Usuário"} width={480}>
        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>

          <Input label="Nome *" value={userForm.name} onChange={v => setUserForm(f => ({ ...f, name: v, avatar: v.trim()[0]?.toUpperCase() || "" }))} placeholder="Nome do usuário" autoFocus />

          {/* Role + preset */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>Perfil (rótulo)</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {Object.entries(ROLE_LABELS).map(([k, v]) => {
                const rc = roleColors[k] || { bg: C.bg, text: C.textMid };
                const active = userForm.role === k;
                return (
                  <button key={k} onClick={() => applyRolePreset(k)} style={{
                    border: "2px solid " + (active ? rc.text : C.border),
                    borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                    background: active ? rc.bg : C.surface,
                    color: active ? rc.text : C.textMid,
                    fontFamily: "inherit", fontSize: 13, fontWeight: 700,
                    transition: "all .15s",
                  }}>{v}</button>
                );
              })}
            </div>
            <div style={{ fontSize: 12, color: C.textLight }}>Selecionar um perfil preenche as permissões automaticamente — você pode ajustar abaixo.</div>
          </div>

          {/* Permissions checkboxes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>Permissões</label>
            <div style={{ background: C.bg, borderRadius: 10, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
              {ALL_PERMISSIONS.map(perm => {
                const checked = (userForm.permissions || []).includes(perm.id);
                return (
                  <label key={perm.id} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", userSelect: "none" }}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => togglePerm(perm.id)}
                      style={{ width: 16, height: 16, accentColor: C.amber, cursor: "pointer", flexShrink: 0 }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>
                        {perm.icon} {perm.label}
                      </div>
                      <div style={{ fontSize: 12, color: C.textMid }}>{perm.desc}</div>
                    </div>
                    {checked && <span style={{ fontSize: 11, background: C.successBg, color: C.success, borderRadius: 4, padding: "1px 7px", fontWeight: 700 }}>Ativo</span>}
                  </label>
                );
              })}
            </div>
          </div>

          <Input label="PIN (4+ dígitos) *" value={userForm.pin} onChange={v => setUserForm(f => ({ ...f, pin: v }))} type="password" placeholder="••••" />

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Btn variant="secondary" onClick={() => setUserModal(null)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
            <Btn variant="primary" onClick={saveUser} style={{ flex: 1, justifyContent: "center" }} icon="💾">Salvar</Btn>
          </div>
        </div>
      </Modal>

      {/* ══ Delete Confirm ══ */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirmar remoção" width={380}>
        {deleteConfirm && (
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            <p style={{ color: C.textMid, fontSize: 14, lineHeight: 1.6 }}>
              Remover <strong style={{ color: C.text }}>"{deleteConfirm.item.name || deleteConfirm.item.label}"</strong>?
              {deleteConfirm.type === "prod"  && " O produto não aparecerá mais no PDV."}
              {deleteConfirm.type === "table" && " A mesa será removida permanentemente."}
              {deleteConfirm.type === "unit"  && " A unidade não estará mais disponível."}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <Btn variant="secondary" onClick={() => setDeleteConfirm(null)} style={{ flex: 1, justifyContent: "center" }}>Cancelar</Btn>
              <Btn variant="danger" onClick={doDelete} style={{ flex: 1, justifyContent: "center" }}>Remover</Btn>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

Object.assign(window, { CadastroModule });
