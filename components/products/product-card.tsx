"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"

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

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.image,
      quantity: 1,
    })

    toast({
      title: "Producto agregado",
      description: `${product.name} se agregó al carrito`,
    })
  }

  const hasDiscount = product.salePrice && product.salePrice < product.price
  const discountPercentage = hasDiscount ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group">
      <div className="relative overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          width={300}
          height={300}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <Badge className="absolute top-3 left-3 bg-red-500 hover:bg-red-600">-{discountPercentage}%</Badge>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <Badge variant="outline" className="absolute top-3 right-3 bg-white">
            Últimas {product.stock}
          </Badge>
        )}
        {product.stock === 0 && (
          <Badge variant="destructive" className="absolute top-3 right-3">
            Agotado
          </Badge>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <Badge variant="secondary" className="text-xs">
            {product.category}
          </Badge>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center mb-3">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">(4.8)</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {hasDiscount ? (
              <>
                <span className="text-lg font-semibold text-emerald-600">${product.salePrice!.toFixed(2)}</span>
                <span className="text-sm text-gray-400 line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-lg font-semibold text-gray-900">${product.price.toFixed(2)}</span>
            )}
          </div>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
        </Button>
      </div>
    </div>
  )
}
