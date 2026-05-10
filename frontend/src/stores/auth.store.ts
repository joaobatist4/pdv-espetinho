import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthUser, Permission } from '../types'

interface AuthState {
  user: AuthUser | null
  token: string | null
  setAuth: (user: AuthUser) => void
  logout: () => void
  hasPermission: (permission: Permission) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user) => set({ user, token: user.token }),
      logout: () => set({ user: null, token: null }),
      hasPermission: (permission) => {
        const { user } = get()
        if (!user) return false
        if (user.role === 'Admin') return true
        return user.permissions.includes(permission)
      },
    }),
    { name: 'pdv-auth' }
  )
)
