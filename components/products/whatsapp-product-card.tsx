"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number | null
  category: string
  image: string
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
      name: product.name,
      price: product.salePrice || product.price,
      image: product.image,
      quantity: 1,
    })
    // NO abrir carrito automáticamente - solo agregar el producto
  }

  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercentage = hasDiscount ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0

  return (
    <div className="product-message">
      <div className="relative overflow-hidden rounded-t-lg">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={300}
          height={200}
          className="w-full h-40 object-cover"
        />
        {hasDiscount && (
          <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600 text-xs">-{discountPercentage}%</Badge>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <Badge variant="outline" className="absolute top-2 right-2 bg-white text-xs">
            Últimas {product.stock}
          </Badge>
        )}
        {product.stock === 0 && (
          <Badge variant="destructive" className="absolute top-2 right-2 text-xs">
            Agotado
          </Badge>
        )}
      </div>

      <div className="p-3">
        <div className="mb-2">
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
        </div>

        <h3 className="font-semibold text-gray-900 mb-1 text-sm line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 text-xs mb-2 line-clamp-2">{product.description}</p>

        <div className="flex items-center mb-2">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">(4.8)</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            {hasDiscount ? (
              <>
                <span className="text-sm font-bold text-emerald-600">${product.salePrice!.toFixed(2)}</span>
                <span className="text-xs text-gray-400 line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-sm font-bold text-gray-900">${product.price.toFixed(2)}</span>
            )}
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          size="sm"
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs py-2"
        >
          <ShoppingCart className="h-3 w-3 mr-1" />
          {product.stock === 0 ? "Agotado" : "Agregar"}
        </Button>
      </div>
    </div>
  )
}
