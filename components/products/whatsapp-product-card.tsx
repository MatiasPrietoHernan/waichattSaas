"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Star, X } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { IProduct } from "@/types/product"
import { useState } from "react"


interface WhatsAppProductCardProps {
  product: IProduct
}

export function WhatsAppProductCard({ product }: WhatsAppProductCardProps) {
  const { addItem } = useCart()
  const [showImageModal, setShowImageModal] = useState(false)

  const displayPrice = product.sales_price ?? product.price ?? 0

  const handleAddToCart = () => {
    addItem({
      id: product._id,
      name: product.title,
      price: product.sales_price,
      image: product.image,
      financing: product.financing
    })
  }

  const hasDiscount = product.sales_price && product.sales_price < product.sales_price
  const discountPercentage = hasDiscount ? Math.round(((product.sales_price - product.sales_price!) / product.sales_price) * 100) : 0

  return (
    <>
    <div className="product-message w-full flex flex-col">
      <div className="relative overflow-hidden rounded-t-lg group cursor-pointer"  
        onClick={(e) => {
        e.stopPropagation();      // <- clave
        setShowImageModal(true);
  }}>
        <Image
          src={product.image || "/placeholder.svg"}
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

      <div className="p-3 md:p-4 flex-1 flex flex-col">
        <div className="mb-3">
          <Badge variant="secondary" className="text-xs">
            {product.subcategory}
          </Badge>
        </div>

        <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base line-clamp-1">{product.title}</h3>
        <p className="text-gray-600 text-xs md:text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="flex items-center mb-3">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 md:h-3.5 md:w-3.5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-xs md:text-sm text-gray-500 ml-2">(4.8)</span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {hasDiscount ? (
              <>
                <span className="text-base md:text-lg font-bold text-emerald-600">
                  ${product.sales_price!.toFixed(2)}
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
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-xs py-2 mt-auto"
        >
          <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-2" />
          {product.stock === 0 ? "Agotado" : "Agregar al Carrito"}
        </Button>
      </div>
    </div>

      {showImageModal && (
  <div
    className="fixed inset-0 z-[9999] bg-black/75 flex items-center justify-center p-3 md:p-6"
    onClick={() => setShowImageModal(false)}
  >
    {/* PANEL */}
    <div
      className="relative w-full max-w-[clamp(320px,60vw,820px)]"   // <-- desktop más chico
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={() => setShowImageModal(false)}
        className="absolute -top-10 right-0 text-white hover:text-gray-300 md:-top-12"
        aria-label="Cerrar"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="bg-white rounded-lg overflow-hidden">
        {/* IMAGEN */}
        <div className="relative w-full">
          <div className="relative w-full aspect-[4/3] md:aspect-[16/10] lg:aspect-[3/2] 
                          max-h-[70vh] md:max-h-[65vh] lg:max-h-[55vh]">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.title}
              fill
              className="object-contain"
              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 70vw, 60vw"
            />
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-base md:text-lg mb-2">{product.title}</h3>
          <p className="text-gray-600 text-sm md:text-base max-h-[20vh] overflow-y-auto">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  </div>
)}

    </>
  )
}
