import { create } from 'zustand'
import type { CartItem } from '../types'

interface CartState {
  selectedTableId: string | null
  selectedOrderId: string | null
  items: CartItem[]
  setTable: (tableId: string, orderId: string | null) => void
  clearTable: () => void
  addItem: (item: CartItem) => void
  removeItem: (productId: string) => void
  changeQty: (productId: string, delta: number) => void
  clearItems: () => void
}

export const useCartStore = create<CartState>((set) => ({
  selectedTableId: null,
  selectedOrderId: null,
  items: [],
  setTable: (tableId, orderId) => set({ selectedTableId: tableId, selectedOrderId: orderId }),
  clearTable: () => set({ selectedTableId: null, selectedOrderId: null, items: [] }),
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === item.productId)
      if (existing)
        return {
          items: state.items.map((i) =>
            i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i
          ),
        }
      return { items: [...state.items, item] }
    }),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
  changeQty: (productId, delta) =>
    set((state) => ({
      items: state.items
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0),
    })),
  clearItems: () => set({ items: [] }),
}))
