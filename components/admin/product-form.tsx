"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { IProduct } from "@/types/product"
import { FinancingMode, Plan } from "@/types/IProductFormAdmin"
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
    image: product?.image || "",
    stock: product?.stock || 0,

    // financiación
    financing_mode: product?.financing?.mode ?? ("inherit" as FinancingMode),
    financing_planIds: product?.financing?.planIds ?? ([] as string[]),
  })

  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // ---- planes disponibles (GET /api/financing/plans)
  const [plans, setPlans] = useState<Plan[]>([])
  const [plansLoading, setPlansLoading] = useState(false)

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setPlansLoading(true)
        const res = await fetch("/api/financing/plans?active=1")
        const data = await res.json()
        setPlans(Array.isArray(data?.plans) ? data.plans : [])
      } catch (e) {
        console.error("No se pudieron cargar planes", e)
        setPlans([])
      } finally {
        setPlansLoading(false)
      }
    }
    loadPlans()
  }, [])

  const selectedPlans = useMemo(
    () => plans.filter(p => formData.financing_planIds.includes(p._id)),
    [plans, formData.financing_planIds]
  )

  const togglePlan = (id: string) => {
    setFormData(prev => {
      const set = new Set(prev.financing_planIds)
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...prev, financing_planIds: Array.from(set) }
    })
  }

  const clearPlans = () =>
    setFormData(prev => ({ ...prev, financing_planIds: [] }))

  // ---- imagen
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
      setFormData((prev) => ({ ...prev, image: data.publicUrl }))
    } catch (err) {
      console.error(err)
      alert("No se pudo subir la imagen")
    } finally {
      setUploading(false)
    }
  }

  // ---- submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const financing =
        formData.financing_mode === "disabled"
          ? { mode: "disabled" }
          : formData.financing_mode === "override"
          ? { mode: "override", planIds: formData.financing_planIds }
          : { mode: "inherit" }

      const productData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        sales_price:
          formData.sales_price !== "" ? Number.parseFloat(formData.sales_price.toString()) : null,
        price: Number(formData.price),
        image: formData.image,
        stock: Number(formData.stock),
        financing,                                  // 👈 guardamos selección
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{product ? "Editar Producto" : "Agregar Nuevo Producto"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* -------- campos básicos -------- */}
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
                  value={formData.sales_price as any}
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

            {/* -------- IMAGEN -------- */}
            <div className="space-y-2">
              <Label>Imagen del producto</Label>
              <Input type="file" accept="image/*" onChange={handleFile} />
              {uploading && <p className="text-sm text-muted-foreground">Subiendo imagen…</p>}
              {formData.image && (
                <div className="flex items-center gap-3">
                  <img src={formData.image} alt="preview" className="h-20 w-20 object-cover rounded" />
                  <code className="text-xs break-all">{formData.image}</code>
                </div>
              )}
            </div>

            {/* -------- FINANCIACIÓN -------- */}
            <div className="space-y-3 rounded-md border p-3">
              <Label className="text-sm">Financiación</Label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="financing_mode"
                    value="inherit"
                    checked={formData.financing_mode === "inherit"}
                    onChange={() => setFormData(prev => ({ ...prev, financing_mode: "inherit" }))}
                  />
                  <span className="text-sm">Heredar (global)</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="financing_mode"
                    value="override"
                    checked={formData.financing_mode === "override"}
                    onChange={() => setFormData(prev => ({ ...prev, financing_mode: "override" }))}
                  />
                  <span className="text-sm">Sobrescribir en este producto</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="financing_mode"
                    value="disabled"
                    checked={formData.financing_mode === "disabled"}
                    onChange={() => setFormData(prev => ({ ...prev, financing_mode: "disabled", financing_planIds: [] }))}
                  />
                  <span className="text-sm">Deshabilitar</span>
                </label>
              </div>

              {formData.financing_mode === "override" && (
                <div className="space-y-2">
                  {/* chips seleccionados */}
                  <div className="flex flex-wrap gap-2">
                    {selectedPlans.map(p => (
                      <span
                        key={p._id}
                        className="inline-flex items-center text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-1"
                      >
                        {p.description} · {p.months} cuotas
                        <button
                          type="button"
                          onClick={() => togglePlan(p._id)}
                          className="ml-2 text-emerald-700/70 hover:text-emerald-900"
                          aria-label="Quitar"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    {selectedPlans.length > 0 && (
                      <button type="button" onClick={clearPlans} className="text-xs text-red-600 hover:underline">
                        Quitar todas
                      </button>
                    )}
                  </div>

                  {/* lista scrolleable de planes */}
                  <div className="max-h-56 overflow-y-auto rounded-md border">
                    {plansLoading && (
                      <div className="p-3 text-sm text-muted-foreground">Cargando planes…</div>
                    )}
                    {!plansLoading && plans.length === 0 && (
                      <div className="p-3 text-sm text-muted-foreground">No hay planes activos.</div>
                    )}
                    {plans.map((p) => (
                      <label
                        key={p._id}
                        className="flex items-center justify-between px-3 py-2 border-b last:border-0"
                      >
                        <div>
                          <div className="text-sm font-medium">{p.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {p.months} cuotas · recargo {(p.surchargePct * 100).toFixed(0)}%
                            {p.group ? ` · grupo ${p.group}` : ""}
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={formData.financing_planIds.includes(p._id)}
                          onChange={() => togglePlan(p._id)}
                        />
                      </label>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Elegí uno o varios planes. Si dejás vacío, no se mostrará financiación para este producto.
                  </p>
                </div>
              )}
            </div>

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
