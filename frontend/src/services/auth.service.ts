import api from '../lib/api'
import type { AuthUser } from '../types'

export const authService = {
  login: async (email: string, password: string): Promise<AuthUser> => {
    const { data } = await api.post('/auth/login', { email, password })
    return data
  },
}
