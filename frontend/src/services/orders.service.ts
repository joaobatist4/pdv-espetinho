import api from '../lib/api'
import type { CartItem, OrderDetailDto, OrderReportParams, PagedResult, OrderReportItemDto, PaymentMethod } from '../types'

export const ordersService = {
  getOpen: async (): Promise<OrderDetailDto[]> => {
    const { data } = await api.get('/orders')
    return data
  },

  getById: async (id: string): Promise<OrderDetailDto> => {
    const { data } = await api.get(`/orders/${id}`)
    return data
  },

  getReport: async (params: OrderReportParams): Promise<PagedResult<OrderReportItemDto>> => {
    const { data } = await api.get('/orders/report', { params })
    return data
  },

  create: async (tableId: string, employeeId: string): Promise<{ id: string }> => {
    const { data } = await api.post('/orders', { tableId, employeeId })
    return data
  },

  addItems: async (orderId: string, items: CartItem[]): Promise<void> => {
    await api.post(`/orders/${orderId}/items`, {
      orderId,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        note: i.note ?? null,
      })),
    })
  },

  adjustItemQuantity: async (orderId: string, itemId: string, delta: number): Promise<void> => {
    await api.patch(`/orders/${orderId}/items/${itemId}/quantity`, { delta })
  },

  removeItem: async (orderId: string, itemId: string): Promise<void> => {
    await api.delete(`/orders/${orderId}/items/${itemId}`)
  },

  close: async (
    orderId: string,
    payments: { method: PaymentMethod; amount: number }[]
  ): Promise<{ saleId: string }> => {
    const { data } = await api.post(`/orders/${orderId}/close`, {
      orderId,
      attendantId: '00000000-0000-0000-0000-000000000000',
      payments,
    })
    return data
  },

  cancel: async (orderId: string): Promise<void> => {
    await api.post(`/orders/${orderId}/cancel`)
  },

  printBill: async (orderId: string): Promise<void> => {
    await api.post(`/orders/${orderId}/print-bill`)
  },
}
