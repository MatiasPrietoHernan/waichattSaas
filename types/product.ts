
export interface IProduct {
    _id: string
    name: string
    description?: string
    price: number
    salePrice?: number | null
    category: string
    image: string
    stock: number
}