export interface Product {
  product_id: number
  title: string
  description: string
  sales_price: number | null
  category?: string
  id_subcategory: number
  subcategory: string
  image_urls?: string
  stock: number
}
export interface ProductPayload {
  product_id?: number
  p_title: string;
  p_description: string;
  p_sales_price: number | null;
  p_id_subcategory: number;
  p_image_urls: string;
  p_stock: number;
}

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
}

export interface ImportResult {
  success: boolean
  message: string
  products?: Product[]
  errors?: string[]
}
