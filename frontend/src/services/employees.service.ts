import api from '../lib/api'
import type { EmployeeDto } from '../types'

export const employeesService = {
  getAll: async (): Promise<EmployeeDto[]> => {
    const { data } = await api.get('/employees')
    return data
  },

  create: async (name: string): Promise<{ id: string }> => {
    const { data } = await api.post('/employees', { name })
    return data
  },

  update: async (id: string, name: string): Promise<void> => {
    await api.put(`/employees/${id}`, { id, name })
  },

  toggle: async (id: string): Promise<void> => {
    await api.patch(`/employees/${id}/toggle`)
  },
}
