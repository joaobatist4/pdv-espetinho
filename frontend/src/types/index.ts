export type Role = 'Admin' | 'Manager' | 'Waiter' | 'Kitchen'
export type Permission =
  | 'Pdv' | 'Orders' | 'Stock' | 'BeverageStock' | 'Dashboard' | 'Registration' | 'Users'

export type TableType = 'Table' | 'Counter'
export type TableStatus = 'Available' | 'Occupied' | 'BillRequested'
export type OrderStatus = 'Open' | 'Closed' | 'Cancelled'
export type OrderItemStatus = 'Pending' | 'Preparing' | 'Ready' | 'Delivered'
export type PaymentMethod = 'Cash' | 'Pix' | 'Debit' | 'Credit' | 'OnTab' | 'Mixed'

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
  note?: string
  status: OrderItemStatus
  total: number
}

export interface OrderPaymentDto {
  method: string
  amount: number
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
  payments: OrderPaymentDto[]
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

export type MovementType = 'Entry' | 'Exit' | 'Adjustment'

export interface StockMovementDto {
  id: string
  type: MovementType
  quantityBefore: number
  quantityAfter: number
  createdAt: string
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

export interface OrderReportItemDto {
  id: string
  tableLabel: string
  attendantName: string
  status: OrderStatus
  openedAt: string
  closedAt?: string
  total: number
  itemCount: number
  itemsSummary: string
}

export interface PagedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface OrderReportParams {
  status?: string
  dateFrom?: string
  dateTo?: string
  search?: string
  page: number
  pageSize: number
}

export interface EmployeeDto {
  id: string
  name: string
  matricula: string
  isActive: boolean
}

export interface CartItem {
  productId: string
  productName: string
  unitPrice: number
  quantity: number
  goesToKitchen: boolean
  note?: string
}
