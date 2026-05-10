import api from '../lib/api'
import type { DashboardDto } from '../types'

export const dashboardService = {
  get: async (period = 'hoje'): Promise<DashboardDto> => {
    const { data } = await api.get('/dashboard', { params: { period } })
    return data
  },
}
