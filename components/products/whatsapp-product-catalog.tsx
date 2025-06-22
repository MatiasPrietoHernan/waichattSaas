"use client"

import { useState, useEffect } from "react"
import { WhatsAppProductCard } from "./whatsapp-product-card"
import { ProductFilters } from "./product-filters"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

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


export function WhatsAppProductCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")



  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, selectedCategory, searchTerm])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products")
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    let filtered = products

    if (selectedCategory !== "all") {
      filtered = filtered.filter((product) => product.category === selectedCategory)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    setFilteredProducts(filtered)
  }

  const categories = ["all", ...Array.from(new Set(products.map((p) => p.category)))]

  if (loading) {
    return (
      <div className="whatsapp-bg min-h-screen pt-24">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-gray-600">Cargando productos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="whatsapp-bg min-h-screen pt-24">
      {/* Indicador de fecha estilo WhatsApp */}
      <div className="text-center py-4">
        <div className="inline-block bg-white bg-opacity-90 rounded-full px-3 py-1 shadow-sm">
          <span className="text-xs text-gray-600">Hoy</span>
        </div>
      </div>

      {/* Filtros */}
      <div className="px-4 mb-4">
        <ProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
      </div>
      {/* Productos */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="bg-white bg-opacity-90 rounded-lg p-6 mx-4 shadow-sm">
            <p className="text-gray-600 text-lg mb-4">No se encontraron productos</p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory("all")
                setSearchTerm("")
              }}
              className="bg-white"
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4 pb-20">
          {filteredProducts.map((product) => (
            <WhatsAppProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
