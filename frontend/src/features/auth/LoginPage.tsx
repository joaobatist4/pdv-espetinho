import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth.store'
import { authService } from '../../services/auth.service'

export default function LoginPage() {
  const [email, setEmail] = useState(() => {
    try { return localStorage.getItem('pdv_remember_email') ?? '' } catch { return '' }
  })
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake] = useState(false)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await authService.login(email.trim(), password)
      try {
        if (remember) localStorage.setItem('pdv_remember_email', email.trim().toLowerCase())
        else localStorage.removeItem('pdv_remember_email')
      } catch {}
      setAuth(user)
      navigate('/')
    } catch {
      setShake(true)
      setError('E-mail ou senha incorretos.')
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: '#1A0F08' }}>

      {/* ── Painel esquerdo — branding ── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{
          flex: '1.1',
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(232,146,10,.18), transparent 60%),' +
            'radial-gradient(ellipse at 80% 80%, rgba(220,38,38,.12), transparent 55%),' +
            'linear-gradient(135deg, #2D1A0E 0%, #1A0F08 100%)',
        }}
      >
        {/* Linhas decorativas */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'repeating-linear-gradient(115deg, transparent 0 80px, rgba(232,146,10,.04) 80px 81px)',
          }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-4">
          <img src="/logo.png" alt="Espetim do Bigode" className="w-16 h-16 object-contain" />
          <div>
            <div className="font-black text-lg tracking-wide" style={{ color: '#E8920A' }}>
              Espetim do Bigode
            </div>
            <div className="text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,.45)' }}>
              Sistema PDV
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="relative max-w-md">
          <div className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: '#E8920A' }}>
            Bem-vindo de volta
          </div>
          <h1 className="text-4xl font-black leading-tight text-white m-0" style={{ letterSpacing: '-.5px' }}>
            Gestão completa para o seu espetinho — em um só lugar.
          </h1>
          <p className="mt-5 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,.55)' }}>
            Caixa, pedidos, estoque de produtos e insumos, controle de mesas e relatórios.
            Tudo que você precisa para tocar o dia-a-dia.
          </p>
        </div>

        <div className="relative text-xs" style={{ color: 'rgba(255,255,255,.25)' }}>
          © {new Date().getFullYear()} Espetim do Bigode
        </div>
      </div>

      {/* ── Painel direito — formulário ── */}
      <div
        className="flex flex-col justify-center px-8 py-12 w-full lg:w-auto overflow-y-auto"
        style={{ flex: '0 0 440px', background: '#FAFAF8' }}
      >
        {/* Logo mobile */}
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <img src="/logo.png" alt="Espetim do Bigode" className="w-12 h-12 object-contain" />
          <div>
            <div className="font-black text-base" style={{ color: '#E8920A' }}>Espetim do Bigode</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest">Sistema PDV</div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-black m-0" style={{ color: '#2D1A0E', letterSpacing: '-.3px' }}>
            Acessar conta
          </h2>
          <p className="text-sm mt-1" style={{ color: '#9E8E80' }}>
            Acesse sua conta com e-mail e senha.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
          style={{ animation: shake ? 'shake .4s ease' : undefined }}
        >
          {/* E-mail */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold tracking-wide" style={{ color: '#2D1A0E' }}>
              E-MAIL
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A89180' }}>
                ✉️
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                autoFocus
                required
                className="w-full rounded-xl text-sm outline-none pl-10 pr-4 py-3"
                style={{
                  border: `1.5px solid ${error && !email ? '#DC2626' : '#E8DDD0'}`,
                  color: '#2D1A0E',
                  background: '#fff',
                  fontFamily: 'inherit',
                  transition: 'border-color .15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#E8920A')}
                onBlur={(e) => (e.target.style.borderColor = error && !email ? '#DC2626' : '#E8DDD0')}
              />
            </div>
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-baseline">
              <label className="text-xs font-bold tracking-wide" style={{ color: '#2D1A0E' }}>
                SENHA
              </label>
              <button
                type="button"
                onClick={() => alert('Procure o administrador para redefinir sua senha.')}
                className="text-xs font-semibold bg-transparent border-none cursor-pointer p-0"
                style={{ color: '#E8920A', fontFamily: 'inherit' }}
              >
                Esqueci a senha
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: '#A89180' }}>
                🔒
              </span>
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="w-full rounded-xl text-sm outline-none pl-10 pr-11 py-3"
                style={{
                  border: `1.5px solid ${error && !password ? '#DC2626' : '#E8DDD0'}`,
                  color: '#2D1A0E',
                  background: '#fff',
                  fontFamily: 'inherit',
                  transition: 'border-color .15s',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#E8920A')}
                onBlur={(e) =>
                  (e.target.style.borderColor = error && !password ? '#DC2626' : '#E8DDD0')
                }
              />
              <button
                type="button"
                onClick={() => setShowPwd((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer text-sm p-1"
                style={{ color: '#A89180' }}
                title={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Lembrar e-mail */}
          <label className="flex items-center gap-2 cursor-pointer select-none text-sm" style={{ color: '#5C3317' }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
              style={{ accentColor: '#E8920A' }}
            />
            Lembrar meu e-mail neste dispositivo
          </label>

          {/* Erro */}
          {error && (
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold"
              style={{ background: '#FEE2E2', color: '#991B1B' }}
            >
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3.5 text-sm font-black text-white border-none transition-all"
            style={{
              background: loading ? '#C9760A' : '#E8920A',
              boxShadow: '0 4px 14px rgba(232,146,10,.35)',
              fontFamily: 'inherit',
              letterSpacing: '.3px',
              cursor: loading ? 'wait' : 'pointer',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#D17F00' }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#E8920A' }}
          >
            {loading ? 'Entrando...' : 'Entrar →'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0) }
          20%,60%  { transform: translateX(-8px) }
          40%,80%  { transform: translateX(8px) }
        }
      `}</style>
    </div>
  )
}
