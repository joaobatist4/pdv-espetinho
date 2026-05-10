import api from '../lib/api'
import type { CartItem, KitchenTicketDto, OrderDetailDto, OrderItemStatus, PaymentMethod } from '../types'

export const ordersService = {
  getOpen: async (): Promise<OrderDetailDto[]> => {
    const { data } = await api.get('/orders')
    return data
  },

  getById: async (id: string): Promise<OrderDetailDto> => {
    const { data } = await api.get(`/orders/${id}`)
    return data
  },

  getKitchenTicket: async (id: string): Promise<KitchenTicketDto> => {
    const { data } = await api.get(`/orders/${id}/kitchen-ticket`)
    return data
  },

  create: async (tableId: string): Promise<{ id: string }> => {
    const { data } = await api.post('/orders', { tableId })
    return data
  },

  addItems: async (orderId: string, items: CartItem[]): Promise<void> => {
    await api.post(`/orders/${orderId}/items`, {
      orderId,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
    })
  },

  updateItemStatus: async (orderId: string, itemId: string, status: OrderItemStatus): Promise<void> => {
    await api.patch(`/orders/${orderId}/items/${itemId}/status`, { status })
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
}
