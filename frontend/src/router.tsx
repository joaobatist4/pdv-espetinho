import { Navigate, createBrowserRouter } from 'react-router-dom'
import { useAuthStore } from './stores/auth.store'
import AppLayout from './features/layout/AppLayout'
import LoginPage from './features/auth/LoginPage'
import PdvPage from './features/pdv/PdvPage'
import OrdersPage from './features/orders/OrdersPage'
import StockPage from './features/stock/StockPage'
import CadastroPage from './features/cadastro/CadastroPage'
import DashboardPage from './features/dashboard/DashboardPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <PdvPage /> },
      { path: 'pedidos', element: <OrdersPage /> },
      { path: 'estoque', element: <StockPage /> },
      { path: 'cadastro', element: <CadastroPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
    ],
  },
])
