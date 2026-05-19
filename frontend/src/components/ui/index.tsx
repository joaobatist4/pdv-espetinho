import { useState, useCallback } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { C } from '../../lib/tokens'

// ── Badge ──
export function Badge({
  children,
  color = C.amberLight,
  textColor = C.amber,
  style,
}: {
  children: ReactNode
  color?: string
  textColor?: string
  style?: CSSProperties
}) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 10px', borderRadius: 99,
      fontSize: 11, fontWeight: 700, letterSpacing: '.5px',
      background: color, color: textColor, ...style,
      whiteSpace: 'nowrap',
    }}>{children}</span>
  )
}

// ── Button ──
export function Btn({
  children, onClick, variant = 'primary', size = 'md',
  disabled, style: s, icon,
}: {
  children?: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  style?: CSSProperties
  icon?: ReactNode
}) {
  const base: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: 'none', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600, fontFamily: 'inherit', transition: 'all .15s',
    opacity: disabled ? .5 : 1,
  }
  const sizes: Record<string, CSSProperties> = {
    sm: { padding: '6px 14px', fontSize: 13 },
    md: { padding: '9px 20px', fontSize: 14 },
    lg: { padding: '12px 28px', fontSize: 15 },
  }
  const variants: Record<string, CSSProperties> = {
    primary:  { background: C.amber, color: '#fff' },
    secondary:{ background: C.surface, color: C.text, border: `1px solid ${C.border}` },
    ghost:    { background: 'transparent', color: C.textMid },
    danger:   { background: C.danger, color: '#fff' },
    success:  { background: C.success, color: '#fff' },
  }
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...s }}
    >
      {icon && <span>{icon}</span>}{children}
    </button>
  )
}

// ── Card ──
export function Card({
  children, style: s, onClick, hover,
}: {
  children: ReactNode
  style?: CSSProperties
  onClick?: () => void
  hover?: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.surface, borderRadius: 12,
        border: `1px solid ${C.border}`,
        boxShadow: hov && hover ? '0 4px 20px rgba(0,0,0,.08)' : '0 1px 4px rgba(0,0,0,.04)',
        transition: 'box-shadow .2s',
        cursor: onClick ? 'pointer' : 'default',
        ...s,
      }}
    >{children}</div>
  )
}

// ── Modal ──
export function Modal({
  open, onClose, title, children, width = 520,
}: {
  open: boolean
  onClose: () => void
  title: string
  children?: ReactNode
  width?: number
}) {
  if (!open) return null
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,.45)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: C.surface, borderRadius: 16, width, maxWidth: '95vw',
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,.2)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px', borderBottom: `1px solid ${C.border}`,
        }}>
          <div style={{ fontWeight: 700, fontSize: 17, color: C.text }}>{title}</div>
          <button onClick={onClose} style={{
            border: 'none', background: C.bg, borderRadius: 8,
            width: 32, height: 32, cursor: 'pointer', fontSize: 18, color: C.textMid,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
        <div style={{ overflow: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  )
}

// ── Input ──
export function Input({
  label, value, onChange, type = 'text', placeholder, style: s, autoFocus,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  style?: CSSProperties
  autoFocus?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0, ...s }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>{label}</label>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoFocus={autoFocus}
        style={{
          border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px',
          fontSize: 14, color: C.text, background: C.surface, outline: 'none',
          fontFamily: 'inherit', width: '100%', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

// ── Select ──
export function Select({
  label, value, onChange, options, style: s,
}: {
  label?: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  style?: CSSProperties
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0, ...s }}>
      {label && <label style={{ fontSize: 13, fontWeight: 600, color: C.textMid }}>{label}</label>}
      <select value={value} onChange={e => onChange(e.target.value)} style={{
        border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 14px',
        fontSize: 14, color: C.text, background: C.surface, outline: 'none',
        fontFamily: 'inherit', cursor: 'pointer', width: '100%', boxSizing: 'border-box',
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

// ── StatCard ──
export function StatCard({
  label, value, sub, icon, color = C.amber,
}: {
  label: string
  value: ReactNode
  sub?: string
  icon: string
  color?: string
}) {
  return (
    <Card style={{ padding: '20px 24px', flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13, color: C.textMid, fontWeight: 500, marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: '-.5px' }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: C.textMid, marginTop: 4 }}>{sub}</div>}
        </div>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22,
        }}>{icon}</div>
      </div>
    </Card>
  )
}

// ── Empty state ──
export function Empty({ icon = '📭', msg }: { icon?: string; msg: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: C.textLight }}>
      <div style={{ fontSize: 36, marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: 14 }}>{msg}</div>
    </div>
  )
}

// ── Page Header ──
export function PageHeader({
  title, subtitle, actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: C.textMid, margin: '4px 0 0' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
    </div>
  )
}

// ── Toast ──
export function useToast() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([])

  const show = useCallback((msg: string, type = 'success') => {
    const id = Date.now()
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  function ToastContainer() {
    return (
      <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'error' ? C.danger : t.type === 'warn' ? C.warn : C.success,
            color: '#fff', padding: '12px 20px', borderRadius: 10,
            fontSize: 14, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,.2)',
          }}>{t.msg}</div>
        ))}
      </div>
    )
  }

  return { show, ToastContainer }
}
