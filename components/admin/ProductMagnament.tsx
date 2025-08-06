"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Upload, Download } from "lucide-react"
import ProductForm from "./product-form"
import { ProductList } from "./product-list"
import { ImportDialog } from "./import-dialog"
// Importa las funciones actualizadas que manejan imágenes
import { 
  deleteProductWithImages, 
  getAllProducts, 
  addProductWithImages, 
  updateProductWithImages 
} from "@/lib/methods/get_products"
import { Product } from "@/lib/types"

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([])
  const [showForm, setShowForm] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await getAllProducts()
      setProducts(response)
    } catch (error) {
      console.error("Error fetching products:", error)
      // Aquí podrías agregar una notificación de error
    } finally {
      setLoading(false)
    }
  }

  // FUNCIÓN ACTUALIZADA: Ahora maneja imágenes
  const handleProductSaved = async (productData: any, imageFiles?: File[]) => {
    try {
      setLoading(true)

      if (editingProduct) {
        // Actualizar producto existente
        console.log("Updating product with data:", productData)
        await updateProductWithImages(
          productData, 
          imageFiles, 
          false // No mantener imágenes existentes si se suben nuevas
        )
        console.log("Producto actualizado exitosamente")
      } else {
        // Crear nuevo producto
        if (!imageFiles || imageFiles.length === 0) {
          throw new Error('Se requiere al menos una imagen para crear un producto')
        }
        
        console.log("Creating new product with data:", productData)
        const newProductId = await addProductWithImages(productData, imageFiles)
        console.log("Nuevo producto creado con ID:", newProductId)
      }

      // Refrescar la lista de productos
      await fetchProducts()
      
      // Cerrar el formulario y limpiar estado
      setShowForm(false)
      setEditingProduct(null)
      
      // Aquí podrías agregar una notificación de éxito
      
    } catch (error:any) {
      console.error("Error saving product:", error)
      // Mostrar error al usuario
      alert(`Error al guardar el producto: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    console.log("Editing product:", product)
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleCreate = () => {
    console.log("Creating new product")
    setEditingProduct(null)
    setShowForm(true)
  }

  // FUNCIÓN ACTUALIZADA: Ahora elimina imágenes del Storage también
  const handleDelete = async (productId: number) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto? Esta acción también eliminará todas las imágenes asociadas.")) {
      return
    }

    try {
      setLoading(true)
      console.log("Deleting product with ID:", productId)
      
      // Usar la función que elimina tanto el producto como sus imágenes del Storage
      await deleteProductWithImages(productId)
      
      console.log("Producto eliminado exitosamente")
      
      // Actualizar la lista local (más eficiente que refetch completo)
      setProducts(products.filter((p) => p.product_id !== productId))
      
      // Aquí podrías agregar una notificación de éxito
      
    } catch (error: any) {
      console.error("Error deleting product:", error)
      alert(`Error al eliminar el producto: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    console.log("Form cancelled")
    setShowForm(false)
    setEditingProduct(null)
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

  // Calcular estadísticas
  const totalProducts = products.length
  const productsInStock = products.filter((p) => p.stock > 0).length
  const outOfStockProducts = products.filter((p) => p.stock === 0).length
  // Corrigiendo la lógica para productos con descuento
  const productsWithDiscount = products.filter((p) => {
    // Asumiendo que tienes un precio regular y un precio de oferta
    return p.sales_price && p.sales_price && p.sales_price < p.sales_price
  }).length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Productos</h1>
          <p className="text-gray-600">Administra tu catálogo de productos</p>
        </div>

        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            onClick={downloadTemplate}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Plantilla
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowImport(true)}
            disabled={loading}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar
          </Button>
          <Button 
            onClick={handleCreate}
            disabled={loading}
          >
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
            <div className="text-2xl font-bold">{totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">En Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{productsInStock}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Agotados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{outOfStockProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Con Descuento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{productsWithDiscount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
            Cargando...
          </div>
        </div>
      )}

      {/* Product List */}
      <ProductList 
        products={products} 
        onEdit={handleEdit} 
        onDelete={handleDelete}
        loading={loading}
      />

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleProductSaved}
          onCancel={handleCancel}
        />
      )}

      {/* Import Dialog */}
      {showImport && (
        <ImportDialog 
          onClose={() => setShowImport(false)} 
          onImportComplete={fetchProducts} 
        />
      )}
    </div>
  )
}