export type OrderType = "table" | "delivery"

export interface CartItem {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  selectedSize?: string
  selectedExtras?: string[]
  totalPrice: number
}

export interface OrderInfoTable {
  type: "table"
  tableNumber: string
}

export interface OrderInfoDelivery {
  type: "delivery"
  name: string
  phone: string
  address: string
}

export type OrderInfo = OrderInfoTable | OrderInfoDelivery

export interface OrderSummary {
  items: CartItem[]
  subtotal: number
  taxes: number
  deliveryFee: number
  discount: number
  total: number
  promoCode?: string
}

export interface OrderRecord {
  id: string
  createdAt: string
  type: OrderType
  tableNumber?: string
  name?: string
  phone?: string
  address?: string
  items: CartItem[]
  total: number
}

export interface StoredOrder extends OrderRecord {
  status: "received" | "accepted" | "preparing" | "ready" | "served" | "delivered"
}

export interface AdminConfig {
  passwordHash?: string
}
