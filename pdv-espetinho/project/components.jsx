// ── Shared Components ──

const fmt = (v) => `R$ ${Number(v).toFixed(2).replace(".", ",")}`;
const fmtTime = (ms) => {
  const d = Math.floor((Date.now() - ms) / 60000);
  if (d < 1) return "agora";
  if (d < 60) return `${d}min`;
  return `${Math.floor(d / 60)}h${String(d % 60).padStart(2, "0")}`;
};
const fmtDate = (d) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

// ── Design tokens ──
const C = {
  amber:    "#E8920A",
  amberLight:"#FFF4E0",
  brown:    "#2D1A0E",
  brownMid: "#5C3317",
  cream:    "#FAFAF8",
  bg:       "#F4F3F0",
  surface:  "#FFFFFF",
  border:   "#E8E5DF",
  text:     "#1A1208",
  textMid:  "#6B5B4E",
  textLight:"#9E8E80",
  success:  "#16A34A",
  successBg:"#DCFCE7",
  warn:     "#D97706",
  warnBg:   "#FEF3C7",
  danger:   "#DC2626",
  dangerBg: "#FEE2E2",
  info:     "#2563EB",
  infoBg:   "#DBEAFE",
};

const roleColors = {
  admin:     { bg: "#EDE9FE", text: "#5B21B6" },
  gerente:   { bg: "#DBEAFE", text: "#1D4ED8" },
  garconete: { bg: "#DCFCE7", text: "#15803D" },
  cozinha:   { bg: "#FEF3C7", text: "#92400E" },
};

const statusColors = {
  livre:     { bg: C.successBg, text: C.success, label: "Livre" },
  ocupada:   { bg: C.warnBg,    text: C.warn,    label: "Ocupada" },
  conta:     { bg: C.dangerBg,  text: C.danger,  label: "Conta pedida" },
};

const orderStatusColors = {
  aguardando: { bg: "#FEF3C7", text: "#92400E", label: "Aguardando" },
  preparando: { bg: "#DBEAFE", text: "#1D4ED8", label: "Preparando" },
  pronto:     { bg: C.successBg, text: C.success, label: "Pronto" },
  entregue:   { bg: "#F3F4F6", text: "#6B7280", label: "Entregue" },
};

// ── Badge ──
function Badge({ children, color = C.amberLight, textColor = C.amber }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 10px", borderRadius: 99,
      fontSize: 11, fontWeight: 700, letterSpacing: ".5px",
      background: color, color: textColor,
      whiteSpace: "nowrap",
    }}>{children}</span>
  );
}

// ── Button ──
function Btn({ children, onClick, variant = "primary", size = "md", disabled, style: s, icon }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    border: "none", borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
    fontWeight: 600, fontFamily: "inherit", transition: "all .15s",
    opacity: disabled ? .5 : 1,
  };
  const sizes = {
    sm: { padding: "6px 14px", fontSize: 13 },
    md: { padding: "9px 20px", fontSize: 14 },
    lg: { padding: "12px 28px", fontSize: 15 },
  };
  const variants = {
    primary:  { background: C.amber, color: "#fff" },
    secondary:{ background: C.surface, color: C.text, border: `1px solid ${C.border}` },
    ghost:    { background: "transparent", color: C.textMid },
    danger:   { background: C.danger, color: "#fff" },
    success:  { background: C.success, color: "#fff" },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...sizes[size], ...variants[variant], ...s }}>
      {icon && <span>{icon}</span>}{children}
    </button>
  );
}

// ── Card ──
function Card({ children, style: s, onClick, hover }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.surface, borderRadius: 12,
        border: `1px solid ${C.border}`,
        boxShadow: hov && hover ? "0 4px 20px rgba(0,0,0,.08)" : "0 1px 4px rgba(0,0,0,.04)",
        transition: "box-shadow .2s",
        cursor: onClick ? "pointer" : "default",
        ...s,
      }}>{children}</div>
  );
}

// ── Modal ──
function Modal({ open, onClose, title, children, width = 520 }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,.45)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: C.surface, borderRadius: 16, width, maxWidth: "95vw",
        maxHeight: "88vh", display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(0,0,0,.2)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px", borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{
            border: "none", background: C.bg, borderRadius: 8,
            width: 32, height: 32, cursor: "pointer", fontSize: 18, color: C.textMid,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>
        <div style={{ overflow: "auto", flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

// ── Input ──
function Input({ label, value, onChange, type = "text", placeholder, style: s, autoFocus }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0, ...s }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoFocus={autoFocus}
        style={{
          border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 14px",
          fontSize: 14, color: C.text, background: C.surface, outline: "none",
          fontFamily: "inherit", width: "100%", boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// ── Select ──
function Select({ label, value, onChange, options, style: s }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5, minWidth: 0, ...s }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        border: `1px solid ${C.border}`, borderRadius: 8, padding: "9px 14px",
        fontSize: 14, color: C.text, background: C.surface, outline: "none",
        fontFamily: "inherit", cursor: "pointer", width: "100%", boxSizing: "border-box",
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ── Stat Card ──
function StatCard({ label, value, sub, icon, color = C.amber }) {
  return (
    <Card style={{ padding: "20px 24px", flex: 1 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 13, color: C.textMid, fontWeight: 500, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: "-.5px" }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: C.textMid, marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: color + "22", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>{icon}</div>
      </div>
    </Card>
  );
}

// ── Table Status Badge ──
function TableBadge({ status }) {
  const s = statusColors[status] || { bg: C.bg, text: C.textMid, label: status };
  return <Badge color={s.bg} textColor={s.text}>{s.label}</Badge>;
}

// ── Empty state ──
function Empty({ icon = "📭", msg }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: C.textLight }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14 }}>{msg}</div>
    </div>
  );
}

// ── Toast notification ──
function useToast() {
  const [toasts, setToasts] = React.useState([]);
  const show = React.useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);
  const ToastContainer = () => (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === "error" ? C.danger : t.type === "warn" ? C.warn : C.success,
          color: "#fff", padding: "12px 20px", borderRadius: 10,
          fontSize: 14, fontWeight: 600, boxShadow: "0 4px 16px rgba(0,0,0,.2)",
          animation: "slideIn .2s ease",
        }}>{t.msg}</div>
      ))}
    </div>
  );
  return { show, ToastContainer };
}

// ── Page Header ──
function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: C.textMid, margin: "4px 0 0" }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: "flex", gap: 10 }}>{actions}</div>}
    </div>
  );
}

Object.assign(window, {
  fmt, fmtTime, fmtDate,
  C, roleColors, statusColors, orderStatusColors,
  Badge, Btn, Card, Modal, Input, Select, StatCard, TableBadge, Empty, useToast, PageHeader,
});
