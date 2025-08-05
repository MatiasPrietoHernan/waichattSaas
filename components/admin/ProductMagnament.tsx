"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Upload, Download } from "lucide-react"
import { ProductForm } from "./product-form"
import { ProductList } from "./product-list"
import { ImportDialog } from "./import-dialog"
// Importa las funciones de Supabase para crear y actualizar
import { deleteProduct, getAllProducts, addProduct, updateProduct } from "@/lib/methods/get_products"
import { Product } from "@/lib/types"

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await getAllProducts()
      setProducts(response)
    } catch (error) {
      console.error("Error fetching products:", error)
    }
  }

  // MODIFICACIÓN: Esta función ahora maneja tanto la creación como la actualización
  const handleProductSaved = async (productData: any) => {
    try {
      if (editingProduct) {
        // Si hay un producto en edición, lo actualizamos
        await updateProduct({ ...productData, id: editingProduct.product_id });
      } else {
        // Si no, creamos un nuevo producto
        // Asume que la función `createProduct` existe y tiene un parámetro `productData`
        await addProduct(productData);
      }
      fetchProducts();
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async (productId: number) => {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      try {
        console.log(productId)
        const response = await deleteProduct(productId)
        console.log("Producto eliminado:", response)
        setProducts(products.filter((p) => p.product_id !== productId))
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  const downloadTemplate = () => {
    const csvContent =
      "Nombre,Descripción,Precio,Categoría,URL de Imagen,Precio Oferta,Stock\n" +
      "Producto Ejemplo,Descripción del producto,99.99,Categoría,https://ejemplo.com/imagen.jpg,79.99,10"

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "plantilla_productos.csv"
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Productos</h1>
          <p className="text-gray-600">Administra tu catálogo de productos</p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Descargar Plantilla
          </Button>
          <Button variant="outline" onClick={() => setShowImport(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Productos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">En Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p) => p.stock > 0).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Agotados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.filter((p) => p.stock === 0).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Con Descuento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.sales_price && p.sales_price < p.sales_price).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product List */}
      <ProductList products={products} onEdit={handleEdit} onDelete={handleDelete} />

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleProductSaved}
          onCancel={() => {
            setShowForm(false)
            setEditingProduct(null)
          }}
        />
      )}

      {/* Import Dialog */}
      {showImport && <ImportDialog onClose={() => setShowImport(false)} onImportComplete={fetchProducts} />}
    </div>
  )
}