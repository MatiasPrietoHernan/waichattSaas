"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

interface Product {
  id: string
  title: string
  description: string
  sales_price: number | null
  category: string
  subcategory:string
  image_urls: string
  stock: number
}

interface WhatsAppProductCardProps {
  product: Product
}

export function WhatsAppProductCard({ product }: WhatsAppProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.title,
      price: product.sales_price || product.sales_price || 0,
      image: product.image_urls,
    })
  }

  const hasDiscount = product.sales_price && product.sales_price < product.sales_price
  const salePrice = product.sales_price ?? 0
  const discountPercentage = hasDiscount ? Math.round(((salePrice - salePrice) / salePrice) * 100) : 0

  return (
    <div className="product-message">
      <div className="relative overflow-hidden rounded-t-lg">
        <Image
          src={product.image_urls || "/placeholder.svg"}
          alt={product.title}
          width={400}
          height={250}
          className="w-full h-48 md:h-52 lg:h-56 object-cover"
        />
        {hasDiscount && (
          <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600 text-xs">-{discountPercentage}%</Badge>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <Badge variant="outline" className="absolute top-3 right-3 bg-white text-xs">
            Últimas {product.stock}
          </Badge>
        )}
        {product.stock === 0 && (
          <Badge variant="destructive" className="absolute top-3 right-3 text-xs">
            Agotado
          </Badge>
        )}
      </div>

      <div className="p-4 md:p-5">
        <div className="mb-3">
          <Badge variant="secondary" className="text-xs">
            {product.subcategory}
          </Badge>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base line-clamp-1">{product.title}</h3>
        <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2">{product.description}</p>

        

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {hasDiscount ? (
              <>
                <span className="text-base md:text-lg font-bold text-emerald-600">
                  ${product.sales_price!}
                </span>
                <span className="text-xs md:text-sm text-gray-400 line-through">${product.sales_price}</span>
              </>
            ) : (
              <span className="text-base md:text-lg font-bold text-gray-900">${product.sales_price}</span>
            )}
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          size="sm"
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs md:text-sm py-2.5 md:py-3"
        >
          <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-2" />
          {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
        </Button>
      </div>
    </div>
  )
}
