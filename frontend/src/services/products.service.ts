import api from '../lib/api'
import type { ProductDto } from '../types'

export const productsService = {
  getAll: async (categoryId?: string): Promise<ProductDto[]> => {
    const { data } = await api.get('/products', {
      params: categoryId ? { categoryId } : undefined,
    })
    return data
  },
}
