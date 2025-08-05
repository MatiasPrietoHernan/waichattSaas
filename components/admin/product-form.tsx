"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"
import { getSubcategory } from "@/lib/methods/get_products"
import {ProductPayload} from "@/lib/types" 
import {Product} from "@/lib/types" 

// Suponiendo que Subcategory tiene esta estructura
interface Subcategory {
  id_subcategory: number;
  subcategory: string;
}

interface ProductFormProps {
  product?: Product | null;
  // Modifica onSave para que reciba el objeto del producto
  onSave: (productData: Partial<ProductPayload> & { id?: number }) => void;
  onCancel: () => void;
}

export function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    price: product?.sales_price || 0,
    salePrice: product?.sales_price || "",
    id_subcategory: product?.id_subcategory || 0,
    image: product?.image_urls || "",
    stock: product?.stock || 0,
  });

  const [loading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(true);

  // useEffect para cargar las subcategorías
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const data = await getSubcategory();
        setSubcategories(data);
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      } finally {
        setLoadingSubcategories(false);
      }
    };

    fetchSubcategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepara el objeto de datos que será enviado
      const productDataToSave = {
        p_title: formData.title,
        p_description: formData.description,
        p_sales_price: formData.salePrice ? Number.parseFloat(formData.salePrice.toString()) : null,
        p_id_subcategory: Number(formData.id_subcategory),
        p_image_urls: formData.image,
        p_stock: formData.stock,
      };

      // Si estamos editando, añadimos el id al objeto de datos
      if (product?.product_id) {
        onSave({ id: product.product_id, ...productDataToSave });
        console.log("Updating product with data:", { id: product.product_id, ...productDataToSave });
      } else {
        console.log("Creating new product with data:", productDataToSave);
        onSave(productDataToSave);
      }

    } catch (error) {
      console.error("Error saving product:", error);
    } finally {
      setLoading(false);
    }
  };

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
                <Label htmlFor="id_subcategory">Sub-Categoría</Label>
                {loadingSubcategories ? (
                  <p>Cargando subcategorías...</p>
                ) : (
                  <select
                    id="id_subcategory"
                    value={formData.id_subcategory}
                    onChange={(e) => setFormData({ ...formData, id_subcategory: Number(e.target.value) })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  >
                    <option value="" disabled>
                      Seleccionar una sub-categoría
                    </option>
                    {subcategories.map((subcat) => (
                      <option key={subcat.id_subcategory} value={subcat.id_subcategory}>
                        {subcat.subcategory}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
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
                  value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: e.target.value })}
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

            <div>
              <Label htmlFor="image">URL de la Imagen</Label>
              <Input
                id="image"
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://ejemplo.com/imagen.jpg"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : product ? "Actualizar" : "Crear Producto"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}