import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tablesService } from "../../services/tables.service";
import { ordersService } from "../../services/orders.service";
import { productsService } from "../../services/products.service";
import { employeesService } from "../../services/employees.service";
import { useCartStore } from "../../stores/cart.store";
import { C, tableStatusColors, orderItemStatusColors } from "../../lib/tokens";
import {
  Badge,
  Btn,
  Card,
  Modal,
  Input,
  PageHeader,
  Empty,
  useToast,
} from "../../components/ui";
import type { PaymentMethod } from "../../types";
import { fmt, fmtElapsed } from "../../lib/utils";

const paymentMethods = [
  { value: "Cash", label: "💵 Dinheiro" },
  { value: "Pix", label: "📱 PIX" },
  { value: "Debit", label: "💳 Débito" },
  { value: "Credit", label: "💳 Crédito" },
  { value: "OnTab", label: "📝 Fiado" },
];

const qtyBtnStyle: React.CSSProperties = {
  width: 26,
  height: 26,
  border: `1px solid ${C.border}`,
  borderRadius: 6,
  background: C.bg,
  cursor: "pointer",
  fontSize: 16,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  color: C.textMid,
};

export default function PdvPage() {
  const qc = useQueryClient();
  const { show: showToast, ToastContainer } = useToast();
  const {
    selectedTableId,
    selectedOrderId,
    selectedEmployeeId,
    items,
    setTable,
    clearTable,
    addItem,
    removeItem,
    changeQty,
    updateNote,
    clearItems,
  } = useCartStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeCat, setActiveCat] = useState("");
  const [paymentModal, setPaymentModal] = useState(false);
  const [payments, setPayments] = useState<
    { method: PaymentMethod; value: string }[]
  >([{ method: "Cash", value: "" }]);

  const [employeeModal, setEmployeeModal] = useState(false);
  const [pendingTableId, setPendingTableId] = useState<string | null>(null);
  const [matriculaInput, setMatriculaInput] = useState("");
  const [matriculaError, setMatriculaError] = useState("");

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: employeesService.getAll,
  });

  const { data: tables = [] } = useQuery({
    queryKey: ["tables"],
    queryFn: tablesService.getAll,
    refetchInterval: 15000,
  });
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: () => productsService.getAll(),
    enabled: !!selectedTableId,
  });
  const { data: orderDetail } = useQuery({
    queryKey: ["order-detail", selectedOrderId],
    queryFn: () => ordersService.getById(selectedOrderId!),
    enabled: !!selectedOrderId,
    refetchInterval: 15000,
  });

  const cats = [...new Set(products.map((p) => p.categorySlug))];
  const cat = activeCat || cats[0] || "";
  const filtered = searchTerm
    ? products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : products.filter((p) => p.categorySlug === cat);

  const table = tables.find((t) => t.id === selectedTableId);
  const cartTotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const orderTotal = table?.currentTotal ?? 0;
  const total = cartTotal + orderTotal;

  const paidSoFar = payments.reduce(
    (s, p) => s + (parseFloat(p.value.replace(",", ".")) || 0),
    0,
  );
  const remaining = total - paidSoFar;

  const sendItems = useMutation({
    mutationFn: async (cartItems: typeof items) => {
      let orderId = selectedOrderId;
      if (!orderId) {
        const created = await ordersService.create(selectedTableId!, selectedEmployeeId!);
        orderId = created.id;
      }
      await ordersService.addItems(orderId, cartItems);
      return orderId;
    },
    onSuccess: (orderId) => {
      setTable(selectedTableId!, orderId);
      clearItems();
      qc.invalidateQueries({ queryKey: ["tables"] });
      qc.invalidateQueries({ queryKey: ["order-detail", orderId] });
      showToast("✅ Pedido enviado!");
    },
  });

  const closeOrder = useMutation({
    mutationFn: ({
      orderId,
      pmts,
    }: {
      orderId: string;
      pmts: { method: PaymentMethod; amount: number }[];
    }) => ordersService.close(orderId, pmts),
    onSuccess: () => {
      clearTable();
      setPaymentModal(false);
      qc.invalidateQueries({ queryKey: ["tables"] });
      showToast("✅ Conta fechada!");
    },
  });

  const adjustOrderItem = useMutation({
    mutationFn: ({ itemId, delta }: { itemId: string; delta: number }) =>
      ordersService.adjustItemQuantity(selectedOrderId!, itemId, delta),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["order-detail", selectedOrderId] });
      qc.invalidateQueries({ queryKey: ["tables"] });
    },
  });

  const printBill = useMutation({
    mutationFn: (orderId: string) => ordersService.printBill(orderId),
    onSuccess: () => showToast("🖨️ Conta enviada para impressão!"),
  });

  const cancelOrder = useMutation({
    mutationFn: (orderId: string) => ordersService.cancel(orderId),
    onSuccess: () => {
      clearItems();
      clearTable();
      setCancelModal(false);
      qc.invalidateQueries({ queryKey: ["tables"] });
      showToast("🗑️ Pedido cancelado");
    },
  });

  const [cancelModal, setCancelModal] = useState(false);

  function openPaymentModal() {
    setPayments([{ method: "Cash", value: "" }]);
    setPaymentModal(true);
  }

  function handleCheckout() {
    if (Math.abs(remaining) > 0.01) {
      showToast(
        `Valor informado (${fmt(paidSoFar)}) não bate com o total (${fmt(total)})`,
        "warn",
      );
      return;
    }
    if (!selectedOrderId) return;
    closeOrder.mutate({
      orderId: selectedOrderId,
      pmts: payments.map((p) => ({
        method: p.method,
        amount: parseFloat(p.value.replace(",", ".")) || 0,
      })),
    });
  }

  // ── Modal de identificação do atendente ──
  const employeeModalJsx = (
    <Modal open={employeeModal} onClose={() => setEmployeeModal(false)} title="Identificação do atendente" width={360}>
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 6 }}>
            Matrícula
          </label>
          <input
            autoFocus
            value={matriculaInput}
            onChange={e => {
              const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5);
              setMatriculaInput(v);
              setMatriculaError("");
            }}
            onKeyDown={e => {
              if (e.key === "Enter") {
                const found = employees.find(emp => emp.isActive && emp.matricula === matriculaInput);
                if (!found) { setMatriculaError("Matrícula não encontrada ou funcionário inativo."); return; }
                setTable(pendingTableId!, null, found.id);
                setEmployeeModal(false);
              }
            }}
            placeholder="Ex: A3K9Z"
            style={{
              width: "100%", boxSizing: "border-box",
              border: `2px solid ${matriculaError ? C.danger : C.border}`,
              borderRadius: 8, padding: "10px 14px",
              fontSize: 22, fontWeight: 700, letterSpacing: 6,
              fontFamily: "monospace", color: C.text,
              background: C.bg, outline: "none", textAlign: "center",
              textTransform: "uppercase",
            }}
          />
          {matriculaError && (
            <div style={{ fontSize: 12, color: C.danger, marginTop: 6 }}>{matriculaError}</div>
          )}
          {(() => {
            const preview = matriculaInput.length === 5
              ? employees.find(e => e.isActive && e.matricula === matriculaInput)
              : null;
            if (!preview) return null;
            return (
              <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: C.amberLight, border: `1px solid ${C.amber}44`, display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.amber, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                  {preview.name.trim().split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>{preview.name}</div>
                  <div style={{ fontSize: 11, color: C.textMid }}>Funcionário encontrado ✓</div>
                </div>
              </div>
            );
          })()}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="secondary" onClick={() => setEmployeeModal(false)} style={{ flex: 1, justifyContent: "center" }}>
            Cancelar
          </Btn>
          <Btn
            style={{ flex: 1, justifyContent: "center" }}
            onClick={() => {
              const found = employees.find(emp => emp.isActive && emp.matricula === matriculaInput);
              if (!found) { setMatriculaError("Matrícula não encontrada ou funcionário inativo."); return; }
              setTable(pendingTableId!, null, found.id);
              setEmployeeModal(false);
            }}
          >
            Confirmar
          </Btn>
        </div>
      </div>
    </Modal>
  );

  // ── Grade de mesas ──
  if (!selectedTableId) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <PageHeader
          title="PDV / Caixa"
          subtitle="Selecione uma mesa ou balcão para iniciar"
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {tables.map((t) => {
            const sc = tableStatusColors[t.status] ?? {
              bg: C.bg,
              text: C.textMid,
              label: t.status,
            };
            return (
              <Card
                key={t.id}
                hover
                onClick={() => {
                  if (t.status === "Available") {
                    setPendingTableId(t.id);
                    setMatriculaInput("");
                    setMatriculaError("");
                    setEmployeeModal(true);
                  } else if (t.currentOrderId) {
                    setTable(t.id, t.currentOrderId);
                  }
                }}
                style={{ padding: 18, cursor: "pointer" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}
                  >
                    {t.type === "Counter" ? "🍺" : "🪑"} {t.label}
                  </span>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: sc.text,
                      display: "inline-block",
                      marginTop: 3,
                    }}
                  />
                </div>
                <div style={{ fontSize: 12, marginBottom: 6 }}>
                  <Badge color={sc.bg} textColor={sc.text}>
                    {sc.label}
                  </Badge>
                </div>
                {t.currentTotal > 0 && (
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: C.text,
                      marginTop: 6,
                    }}
                  >
                    {fmt(t.currentTotal)}
                  </div>
                )}
                {t.openedAt && t.itemCount > 0 && (
                  <div style={{ fontSize: 11, color: C.textMid, marginTop: 2 }}>
                    {t.itemCount} ite{t.itemCount !== 1 ? "ns" : "m"} ·{" "}
                    {fmtElapsed(t.openedAt)}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
        {employeeModalJsx}
        <ToastContainer />
      </div>
    );
  }

  // ── Detalhe: mesa selecionada ──
  return (
    <div style={{ height: "100%", display: "flex", gap: 16, minHeight: 0 }}>
      {/* Cardápio */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          minWidth: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => {
              clearTable();
              setSearchTerm("");
              setActiveCat("");
            }}
            style={{
              border: "none",
              background: C.bg,
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
              fontSize: 14,
              color: C.textMid,
              fontWeight: 600,
              fontFamily: "inherit",
            }}
          >
            ← Voltar
          </button>
          <div style={{ fontWeight: 800, fontSize: 18, color: C.text }}>
            {table?.label}
          </div>
          {table && (
            <Badge
              color={tableStatusColors[table.status]?.bg ?? C.bg}
              textColor={tableStatusColors[table.status]?.text ?? C.textMid}
            >
              {tableStatusColors[table.status]?.label ?? table.status}
            </Badge>
          )}
        </div>

        <Input
          placeholder="🔍  Buscar produto…"
          value={searchTerm}
          onChange={setSearchTerm}
        />

        {!searchTerm && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCat(c)}
                style={{
                  border: "none",
                  borderRadius: 8,
                  padding: "7px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background: cat === c ? C.amber : C.surface,
                  color: cat === c ? "#fff" : C.textMid,
                  outline: `1px solid ${cat === c ? C.amber : C.border}`,
                }}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div
          style={{
            flex: 1,
            overflow: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
            gap: 8,
            alignContent: "start",
          }}
        >
          {filtered.map((p) => {
            const inCart = items.find((i) => i.productId === p.id);
            return (
              <div
                key={p.id}
                onClick={() =>
                  addItem({
                    productId: p.id,
                    productName: p.name,
                    unitPrice: p.price,
                    quantity: 1,
                    goesToKitchen: p.goesToKitchen,
                  })
                }
                style={{
                  background: inCart ? C.amberLight : C.surface,
                  border: `1.5px solid ${inCart ? C.amber : C.border}`,
                  borderRadius: 10,
                  padding: "12px 14px",
                  cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: C.text,
                    marginBottom: 4,
                    lineHeight: 1.3,
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontSize: 12, color: C.textMid }}>
                  {fmt(p.price)}
                </div>
                {p.goesToKitchen && (
                  <div style={{ fontSize: 10, color: C.amber, marginTop: 4 }}>
                    🍳 Cozinha
                  </div>
                )}
                {inCart && (
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.amber,
                      marginTop: 4,
                    }}
                  >
                    × {inCart.quantity} no carrinho
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <Empty icon="🔍" msg="Nenhum produto encontrado" />
          )}
        </div>
      </div>

      {/* Comanda */}
      <div
        style={{
          width: 320,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          minHeight: 0,
        }}
      >
        <Card
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15, color: C.text }}>
              🧾 Comanda — {table?.label}
            </span>
            {selectedOrderId && (
              <button
                onClick={() => printBill.mutate(selectedOrderId)}
                disabled={printBill.isPending}
                title="Imprimir conta"
                style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 7,
                  background: C.surface,
                  cursor: "pointer",
                  padding: "4px 10px",
                  fontSize: 13,
                  color: C.textMid,
                  fontFamily: "inherit",
                  fontWeight: 600,
                  opacity: printBill.isPending ? 0.5 : 1,
                }}
              >
                🖨️ A conta
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflow: "auto" }}>
            {/* Itens já enviados ao pedido */}
            {(orderDetail?.items.length ?? 0) > 0 && (
              <div
                style={{
                  padding: "12px 16px",
                  borderBottom:
                    items.length > 0 ? `1px solid ${C.border}` : "none",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: C.textMid,
                    fontWeight: 700,
                    marginBottom: 10,
                    letterSpacing: ".5px",
                  }}
                >
                  ENVIADOS AO PEDIDO
                </div>
                {orderDetail!.items.map((item) => {
                  const sc = orderItemStatusColors[item.status];
                  const canEdit = true;
                  const isLoading =
                    adjustOrderItem.isPending &&
                    adjustOrderItem.variables?.itemId === item.id;
                  return (
                    <div key={item.id} style={{ marginBottom: 8 }}>
                      {/* Linha 1: nome, badge, qty, total */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.productName}
                          </div>
                          <div style={{ fontSize: 11, color: C.textMid }}>
                            {fmt(item.unitPrice)} un
                          </div>
                        </div>
                        {item.goesToKitchen && (
                          <Badge color={sc.bg} textColor={sc.text}>{sc.label}</Badge>
                        )}
                        {canEdit ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <button onClick={() => adjustOrderItem.mutate({ itemId: item.id, delta: -1 })} disabled={adjustOrderItem.isPending} style={{ ...qtyBtnStyle, background: C.dangerBg, borderColor: C.dangerBg, color: C.danger }}>−</button>
                            <span style={{ fontSize: 13, fontWeight: 700, minWidth: 20, textAlign: 'center', color: isLoading ? C.textLight : C.text }}>{isLoading ? '…' : item.quantity}</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: 13, fontWeight: 700, color: C.textMid, minWidth: 24, textAlign: 'center' }}>{item.quantity}×</span>
                        )}
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, minWidth: 48, textAlign: 'right' }}>
                          {fmt(item.total)}
                        </div>
                      </div>
                      {/* Linha 2: observação em largura total */}
                      {item.note && (
                        <div style={{ fontSize: 11, color: C.amber, fontStyle: 'italic', marginTop: 3 }}>
                          📝 {item.note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Carrinho local (ainda não enviado) */}
            <div style={{ padding: "12px 16px" }}>
              {items.length > 0 && (
                <div
                  style={{
                    fontSize: 11,
                    color: C.amber,
                    fontWeight: 700,
                    marginBottom: 10,
                    letterSpacing: ".5px",
                  }}
                >
                  A ENVIAR
                </div>
              )}
              {items.length === 0 && (orderDetail?.items.length ?? 0) === 0 && (
                <Empty icon="🛒" msg="Adicione itens ao pedido" />
              )}
              {items.map((item) => (
                <div key={item.productId} style={{ marginBottom: 10 }}>
                  {/* Linha 1: nome, qty, total, remover */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.productName}
                      </div>
                      <div style={{ fontSize: 12, color: C.textMid }}>
                        {fmt(item.unitPrice)} × {item.quantity}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <button onClick={() => changeQty(item.productId, -1)} style={qtyBtnStyle}>−</button>
                      <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantity}</span>
                      <button onClick={() => changeQty(item.productId, 1)} style={qtyBtnStyle}>+</button>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text, minWidth: 48, textAlign: 'right' }}>
                      {fmt(item.unitPrice * item.quantity)}
                    </div>
                    <button onClick={() => removeItem(item.productId)} style={{ width: 24, height: 24, border: 'none', borderRadius: 6, background: C.dangerBg, color: C.danger, cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                  </div>
                  {/* Linha 2: observação em largura total */}
                  <textarea
                    value={item.note ?? ''}
                    onChange={e => updateNote(item.productId, e.target.value)}
                    placeholder="Observação..."
                    maxLength={100}
                    rows={2}
                    style={{ fontSize: 12, color: C.text, border: `1px solid ${C.border}`, borderRadius: 6, background: C.bg, outline: 'none', width: '100%', marginTop: 5, fontFamily: 'inherit', padding: '5px 8px', resize: 'none', lineHeight: 1.4, boxSizing: 'border-box' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div
            style={{ borderTop: `1px solid ${C.border}`, padding: "14px 16px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                Total
              </span>
              <span style={{ fontSize: 20, fontWeight: 800, color: C.amber }}>
                {fmt(total)}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {items.some((i) => i.goesToKitchen) && (
                <Btn
                  onClick={() => sendItems.mutate(items)}
                  disabled={sendItems.isPending}
                  variant="secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                  icon={sendItems.isPending ? undefined : "🍳"}
                >
                  {sendItems.isPending ? "Enviando…" : "Enviar à Cozinha"}
                </Btn>
              )}
              {items.length > 0 && !items.some((i) => i.goesToKitchen) && (
                <Btn
                  onClick={() => sendItems.mutate(items)}
                  disabled={sendItems.isPending}
                  variant="secondary"
                  style={{ width: "100%", justifyContent: "center" }}
                  icon={sendItems.isPending ? undefined : "➕"}
                >
                  {sendItems.isPending ? "Adicionando…" : "Adicionar ao Pedido"}
                </Btn>
              )}
              {total > 0 && (
                <Btn
                  onClick={openPaymentModal}
                  variant="primary"
                  style={{ width: "100%", justifyContent: "center" }}
                  icon="💳"
                >
                  Fechar Conta
                </Btn>
              )}
              {total === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    fontSize: 13,
                    color: C.textLight,
                  }}
                >
                  Mesa sem consumo
                </div>
              )}
              {selectedOrderId && (
                <button
                  onClick={() => setCancelModal(true)}
                  style={{
                    width: "100%",
                    border: "none",
                    background: "transparent",
                    color: C.danger,
                    padding: "6px 0",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    textDecoration: "underline",
                  }}
                >
                  Cancelar pedido
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Modal pagamento */}
      <Modal
        open={paymentModal}
        onClose={() => setPaymentModal(false)}
        title="Fechar Conta"
        width={460}
      >
        <div
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              background: C.bg,
              borderRadius: 10,
              padding: "14px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 13, color: C.textMid, fontWeight: 600 }}>
              Total a pagar
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.amber }}>
              {fmt(total)}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.textMid }}>
              Formas de pagamento
            </div>
            {payments.map((line, idx) => {
              const lineVal = parseFloat(line.value.replace(",", ".")) || 0;
              const isLast = idx === payments.length - 1;
              const suggestion =
                isLast && payments.length > 1 && remaining > 0
                  ? remaining
                  : null;
              const isCash = line.method === "Cash";
              const otherPaid = payments
                .filter((_, i) => i !== idx)
                .reduce(
                  (s, p) => s + (parseFloat(p.value.replace(",", ".")) || 0),
                  0,
                );
              const change =
                isCash && lineVal > total - otherPaid + 0.005
                  ? lineVal - (total - otherPaid)
                  : null;
              return (
                <div
                  key={idx}
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <div
                    style={{ display: "flex", gap: 8, alignItems: "center" }}
                  >
                    <select
                      value={line.method}
                      onChange={(e) =>
                        setPayments((prev) =>
                          prev.map((x, i) =>
                            i === idx
                              ? {
                                  ...x,
                                  method: e.target.value as PaymentMethod,
                                }
                              : x,
                          ),
                        )
                      }
                      style={{
                        border: `1px solid ${C.border}`,
                        borderRadius: 8,
                        padding: "9px 12px",
                        fontSize: 14,
                        color: C.text,
                        background: C.surface,
                        outline: "none",
                        fontFamily: "inherit",
                        cursor: "pointer",
                        flex: 1,
                      }}
                    >
                      {paymentMethods.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                    <div style={{ position: "relative", flex: 1 }}>
                      <input
                        type="number"
                        value={line.value}
                        onChange={(e) =>
                          setPayments((prev) =>
                            prev.map((x, i) =>
                              i === idx ? { ...x, value: e.target.value } : x,
                            ),
                          )
                        }
                        placeholder={
                          suggestion ? suggestion.toFixed(2) : "0,00"
                        }
                        style={{
                          border: `1px solid ${C.border}`,
                          borderRadius: 8,
                          padding: "9px 14px",
                          fontSize: 14,
                          color: C.text,
                          background: C.surface,
                          outline: "none",
                          fontFamily: "inherit",
                          width: "100%",
                        }}
                      />
                      {suggestion && !line.value && (
                        <button
                          onClick={() =>
                            setPayments((prev) =>
                              prev.map((x, i) =>
                                i === idx
                                  ? { ...x, value: remaining.toFixed(2) }
                                  : x,
                              ),
                            )
                          }
                          style={{
                            position: "absolute",
                            right: 6,
                            top: "50%",
                            transform: "translateY(-50%)",
                            border: "none",
                            background: C.amberLight,
                            color: C.amber,
                            borderRadius: 5,
                            padding: "2px 7px",
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: "pointer",
                            fontFamily: "inherit",
                          }}
                        >
                          restante
                        </button>
                      )}
                    </div>
                    {payments.length > 1 && (
                      <button
                        onClick={() =>
                          setPayments((prev) =>
                            prev.filter((_, i) => i !== idx),
                          )
                        }
                        style={{
                          width: 32,
                          height: 32,
                          border: "none",
                          borderRadius: 8,
                          background: C.dangerBg,
                          color: C.danger,
                          cursor: "pointer",
                          fontSize: 16,
                          fontWeight: 700,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                  {change !== null && (
                    <div
                      style={{
                        background: C.successBg,
                        borderRadius: 7,
                        padding: "7px 14px",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          color: C.success,
                          fontWeight: 600,
                        }}
                      >
                        Troco (dinheiro)
                      </span>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          color: C.success,
                        }}
                      >
                        {fmt(change)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
            {payments.length < 4 && (
              <button
                onClick={() =>
                  setPayments((prev) => [
                    ...prev,
                    { method: "Pix" as PaymentMethod, value: "" },
                  ])
                }
                style={{
                  border: `1.5px dashed ${C.border}`,
                  borderRadius: 8,
                  padding: 9,
                  background: "transparent",
                  color: C.textMid,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                ＋ Adicionar forma de pagamento
              </button>
            )}
          </div>
          <div
            style={{
              borderTop: `1px solid ${C.border}`,
              paddingTop: 14,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
              }}
            >
              <span style={{ color: C.textMid }}>Informado</span>
              <span
                style={{
                  fontWeight: 700,
                  color: paidSoFar >= total - 0.005 ? C.success : C.text,
                }}
              >
                {fmt(paidSoFar)}
              </span>
            </div>
            {remaining > 0.005 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <span style={{ color: C.danger, fontWeight: 600 }}>
                  Faltando
                </span>
                <span style={{ fontWeight: 800, color: C.danger }}>
                  {fmt(remaining)}
                </span>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              variant="secondary"
              onClick={() => setPaymentModal(false)}
              style={{ flex: 1, justifyContent: "center" }}
            >
              Cancelar
            </Btn>
            <Btn
              variant="success"
              onClick={handleCheckout}
              disabled={Math.abs(remaining) > 0.005}
              style={{ flex: 1, justifyContent: "center" }}
              icon="✅"
            >
              Confirmar
            </Btn>
          </div>
        </div>
      </Modal>

      <Modal
        open={cancelModal}
        onClose={() => setCancelModal(false)}
        title="Cancelar pedido"
        width={420}
      >
        <div
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              background: C.dangerBg,
              borderRadius: 10,
              padding: "14px 16px",
              display: "flex",
              gap: 12,
              alignItems: "flex-start",
            }}
          >
            <div style={{ fontSize: 22 }}>⚠️</div>
            <div style={{ fontSize: 13, color: C.danger, lineHeight: 1.5 }}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>
                Esta ação não pode ser desfeita.
              </div>
              Todos os itens deste pedido serão descartados e a mesa voltará ao
              status <b>Livre</b>. O cancelamento não gera venda.
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Btn
              variant="secondary"
              onClick={() => setCancelModal(false)}
              style={{ flex: 1, justifyContent: "center" }}
            >
              Voltar
            </Btn>
            <Btn
              variant="danger"
              onClick={() =>
                selectedOrderId && cancelOrder.mutate(selectedOrderId)
              }
              disabled={cancelOrder.isPending}
              style={{ flex: 1, justifyContent: "center" }}
              icon="🗑️"
            >
              {cancelOrder.isPending ? "Cancelando…" : "Cancelar pedido"}
            </Btn>
          </div>
        </div>
      </Modal>


      <ToastContainer />
    </div>
  );
}
