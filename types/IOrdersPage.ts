export interface Product { 
  _id: string
  title: string
  sales_price: number
  category: string
  subcategory: string
  stock: number
  financing: {
    mode: string
    planIds: string[]
  }
}
export interface OrderItem {
  product: Product
  quantity: number
  financing: string
  subtotal: number
}
export interface Order {
  id: string
  items: OrderItem[]
  customerPhone: string
  customerName: string
  status: "vendido" | "en_proceso" | "cancelado"
  createdAt: Date
  total: number
}

export type ApiProduct = {
  _id: string
  title: string
  price?: number
  sales_price?: number
  category: string
  subcategory?: string
  stock: number
  financing?: {
    mode?: "inherit" | "override" | "disabled"
    planIds?: string[] // puede venir o no
    includeCodes?: number[] // alternativa por códigos
    groupKey?: string
    downPct?: number | null
  }
}
export type ApiProductsList = {
  items: ApiProduct[]
  total: number
  page: number
  limit: number
  totalPages: number
  summary: { inStock: number; outOfStock: number; discounted: number }
}
export type QuoteItem = {
  planId: string
  code: number
  description: string
  months: number
  surchargePct: number
  monthly: number
  total: number
  downAmount: number
  downPct: number
}
export type QuoteResponse = {
  price: number
  downPct: number
  items: QuoteItem[]
}
export type ApiOrderItem = {
  productId: string
  productTitle: string
  category: string
  subcategory?: string | null
  unitPrice: number
  quantity: number
  financing?: {
    planRef?: string | null
    planCode?: number | null
    months?: number | null
    surchargePct?: number | null
    totalWithSurcharge?: number | null
    installmentAmount?: number | null
    modeApplied: "inherit" | "override" | "disabled"
  }
  subTotal: number
  grandTotal: number
}
export type ApiOrder = {
  _id: string
  status: "en_proceso" | "vendido" | "cancelado"
  customer: { name: string; phone: string }
  items: ApiOrderItem[]
  totals: { grandTotal: number }
  createdAt: string
}
export 
type ApiListResponse = {
  data: ApiOrder[]
  pagination: { page: number; pageSize: number; total: number; totalPages: number; hasMore: boolean }
}

