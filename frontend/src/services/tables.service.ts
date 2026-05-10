import api from '../lib/api'
import type { TableStatusDto } from '../types'

export const tablesService = {
  getAll: async (): Promise<TableStatusDto[]> => {
    const { data } = await api.get('/tables')
    return data
  },
}
