"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { IProduct } from "@/types/product"

interface ProductFormProps {
  product?: IProduct | null
  onSave: () => void
  onCancel: () => void
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    price: product?.sales_price || 0,
    sales_price: product?.sales_price ?? "",
    category: product?.category || "",
    image: product?.image || "",          // <- publicUrl vive acá
    stock: product?.stock || 0,
  })

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // NUEVO: subir archivo a /api/upload y setear formData.image con publicUrl
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Error subiendo imagen")
      // data.publicUrl viene del backend y es el path público en MinIO
      setFormData((prev) => ({ ...prev, image: data.publicUrl }))
    } catch (err) {
      console.error(err)
      alert("No se pudo subir la imagen")
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const productData = {
        ...formData,
        salePrice: formData.sales_price ? Number.parseFloat(formData.sales_price.toString()) : null,
        ...(product?._id ? { id: product._id } : {}),
      }

      const response = await fetch("/api/products", {
        method: product ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })

      if (response.ok) onSave()
      else {
        const data = await response.json()
        alert(data?.error || "Error guardando producto")
      }
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{product ? "Editar Producto" : "Agregar Nuevo Producto"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre del Producto</Label>
                <Input
                  id="name"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="price">Precio Regular</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="salePrice">Precio de Oferta (Opcional)</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  value={formData.sales_price}
                  onChange={(e) => setFormData({ ...formData, sales_price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            {/* --- SECCIÓN DE IMAGEN --- */}
            <div className="space-y-2">
              <Label>Imagen del producto</Label>

              {/* Subida de archivo */}
              <Input type="file" accept="image/*" onChange={handleFile} />
              {uploading && <p className="text-sm text-muted-foreground">Subiendo imagen…</p>}

              {/* Preview si ya hay URL */}
              {formData.image && (
                <div className="flex items-center gap-3">
                  <img src={formData.image} alt="preview" className="h-20 w-20 object-cover rounded" />
                  <code className="text-xs break-all">{formData.image}</code>
                </div>
              )}

              {/* Fallback: permitir pegar URL manual (opcional) */}
              <div className="space-y-1">
                <Label htmlFor="image">o pegar URL manual</Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://minio.waichatt.com/productos/public/archivo.jpg"
                />
              </div>
            </div>
            {/* --- FIN IMAGEN --- */}

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || uploading}>
                {loading ? "Guardando..." : product ? "Actualizar" : "Crear Producto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
