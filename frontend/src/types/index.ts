export type Role = 'Admin' | 'Gerente' | 'Garconete' | 'Cozinha'
export type Permission =
  | 'Pdv' | 'Pedidos' | 'Estoque' | 'EstoqueBebidas' | 'Dashboard' | 'Cadastro' | 'Usuarios'

export type TableType = 'Mesa' | 'Balcao'
export type TableStatus = 'Livre' | 'Ocupada' | 'ContaPedida'
export type OrderStatus = 'Aberto' | 'Fechado' | 'Cancelado'
export type OrderItemStatus = 'Aguardando' | 'Preparando' | 'Pronto' | 'Entregue'
export type PaymentMethod = 'Dinheiro' | 'Pix' | 'Debito' | 'Credito' | 'Fiado' | 'Misto'

export interface AuthUser {
  token: string
  userId: string
  userName: string
  role: Role
  permissions: Permission[]
}

export interface TableStatusDto {
  id: string
  label: string
  type: TableType
  status: TableStatus
  currentOrderId?: string
  currentTotal: number
  itemCount: number
  openedAt?: string
}

export interface OrderItemDetailDto {
  id: string
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  goesToKitchen: boolean
  status: OrderItemStatus
  total: number
}

export interface OrderDetailDto {
  id: string
  tableId: string
  tableLabel: string
  attendantName: string
  status: OrderStatus
  openedAt: string
  closedAt?: string
  total: number
  items: OrderItemDetailDto[]
}

export interface ProductDto {
  id: string
  name: string
  categoryId: string
  categoryName: string
  categorySlug: string
  subcategory: string
  price: number
  unit: string
  goesToKitchen: boolean
  hasStock: boolean
  isActive: boolean
}

export interface StockItemDto {
  productId: string
  productName: string
  categorySlug: string
  quantity: number
  minimumQuantity: number
  isBelowMinimum: boolean
}

export interface SupplyDto {
  id: string
  name: string
  categorySlug: string
  unit: string
  costPerUnit: number
  quantity: number
  minimumQuantity: number
  supplier: string
  isBelowMinimum: boolean
}

export interface UserDto {
  id: string
  name: string
  email: string
  role: Role
  permissions: Permission[]
  isActive: boolean
  createdAt: string
}

export interface DashboardDto {
  revenue: number
  orderCount: number
  avgTicket: number
  openRevenue: number
  openTableCount: number
  lowStockCount: number
  topProducts: { productName: string; totalQty: number; totalRevenue: number; category: string }[]
  paymentBreakdown: { method: string; total: number; percentage: number }[]
  dailyChart: { date: string; revenue: number; orderCount: number }[]
}

export interface KitchenTicketDto {
  orderId: string
  tableLabel: string
  openedAt: string
  items: { productName: string; quantity: number }[]
}

export interface CartItem {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  goesToKitchen: boolean
}
