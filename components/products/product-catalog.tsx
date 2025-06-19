"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./product-card"
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

export function ProductCatalog() {
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
      <section className="py-8" id="productos">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-gray-600">Cargando productos...</span>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-8 bg-white" id="productos">
      <div className="container mx-auto px-4">
        {/* Título simple */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-light text-gray-900 mb-2">Productos</h2>
          <div className="w-16 h-0.5 bg-emerald-500 mx-auto"></div>
        </div>

        <ProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg">No se encontraron productos</p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory("all")
                setSearchTerm("")
              }}
              className="mt-4"
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
