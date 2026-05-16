import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'
import { C, roleColors } from '../../lib/tokens'
import type { Permission } from '../../types'

const navItems: { to: string; label: string; icon: string; permission: Permission | null }[] = [
  { to: '/',          label: 'PDV / Caixa', icon: '🧾', permission: 'Pdv' },
  { to: '/pedidos',   label: 'Pedidos',     icon: '📋', permission: 'Orders' },
  { to: '/estoque',   label: 'Estoque',     icon: '📦', permission: 'Stock' },
  { to: '/cadastro',  label: 'Cadastro',    icon: '⚙️',  permission: 'Registration' },
  { to: '/dashboard', label: 'Dashboard',   icon: '📊', permission: 'Dashboard' },
]

export default function AppLayout() {
  const { user, hasPermission, logout } = useAuthStore()
  const navigate = useNavigate()
  const pathname = window.location.pathname

  const handleNav = (to: string) => navigate(to)
  const handleLogout = () => { logout(); navigate('/login') }

  const rc = roleColors[user?.role ?? ''] ?? { bg: C.bg, text: C.textMid }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, flexShrink: 0, background: C.brown,
        display: 'flex', flexDirection: 'column',
        boxShadow: '2px 0 12px rgba(0,0,0,.15)',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 18px 16px',
          borderBottom: '1px solid rgba(255,255,255,.08)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <img src="/logo.png" alt="Logo" style={{ width: 42, height: 42, objectFit: 'contain', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 13, color: C.amber, lineHeight: 1.2 }}>Espetim do Bigode</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.35)', letterSpacing: 1, textTransform: 'uppercase' }}>Sistema PDV</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, label, icon, permission }) => {
            if (permission && !hasPermission(permission)) return null
            const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)
            return (
              <button
                key={to}
                onClick={() => handleNav(to)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8, border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                  background: isActive ? C.amber : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,.6)',
                  transition: 'all .15s', textAlign: 'left', width: '100%',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,.08)' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 16 }}>{icon}</span>
                <span>{label}</span>
              </button>
            )
          })}
        </nav>

        {/* User info + logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', marginBottom: 4 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: rc.bg, color: rc.text,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 13, flexShrink: 0,
            }}>
              {user?.userName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.userName}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{user?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 12px', border: 'none', borderRadius: 8,
            background: 'transparent', color: 'rgba(255,255,255,.45)',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
            transition: 'all .15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.08)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span>🚪</span> Sair
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top bar */}
        <div style={{
          height: 52, display: 'flex', alignItems: 'center',
          padding: '0 28px', background: C.surface,
          borderBottom: `1px solid ${C.border}`,
          justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ fontSize: 13, color: C.textLight }}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto', padding: 28, background: C.bg }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
