"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import { Product } from "@/lib/types"
interface ProductListProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (productId: number) => void
}


export function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-gray-600 mb-4">No hay productos registrados</p>
          <p className="text-sm text-gray-500">Agrega tu primer producto o importa un archivo CSV/Excel</p>
        </CardContent>
      </Card>
    )
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="relative">
            <Image
              src={product.image_urls || "/placeholder.svg"}
              alt={product.title}
              width={300}
              height={200}
              className="w-full h-48 object-cover"
            />
            
            <div className="absolute top-2 right-2 flex space-x-1">
              {product.sales_price && product.sales_price < product.sales_price && (
                <Badge className="bg-red-500">
                  -{Math.round(((product.sales_price - product.sales_price) / product.sales_price) * 100)}%
                </Badge>
              )}
              {product.stock === 0 && <Badge variant="destructive">Agotado</Badge>}
              {product.stock > 0 && product.stock <= 5 && (
                <Badge variant="outline" className="bg-yellow-100">
                  Poco Stock
                </Badge>
              )}
            </div>
          </div>

          <CardContent className="p-4">
            <div className="mb-2">
              <Badge variant="secondary" className="text-xs">
                {product.subcategory}
              </Badge>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{product.title}</h3>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {product.sales_price && product.sales_price < product.sales_price ? (
                  <>
                    <span className="text-lg font-bold text-green-600">${product.sales_price}</span>
                    <span className="text-sm text-gray-500 line-through">${product.sales_price}</span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-gray-900">${product.sales_price}</span>
                )}
              </div>
              <span className="text-sm text-gray-600">Stock: {product.stock}</span>
            </div>

            <div className="flex justify-between space-x-2">
              <Button size="sm" variant="outline" onClick={() => onEdit(product)} className="flex-1">
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDelete(product.product_id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
