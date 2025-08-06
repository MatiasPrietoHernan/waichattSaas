"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Upload, Trash2, ImageIcon } from "lucide-react"
import { Product } from "@/lib/types"
import { getSubcategory } from "@/lib/methods/get_products"

// Tipos simulados para el ejemplo
interface Subcategory {
  id_subcategory: number;
  subcategory: string;
}


interface ProductPayload {
  p_title: string;
  p_description: string;
  p_sales_price: number | null;
  p_id_subcategory: number;
  p_stock: number;
}

interface ProductFormProps {
  product?: Product | null;
  onSave: (productData: Partial<ProductPayload> & { id?: number }, imageFiles?: File[]) => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    price: product?.sales_price || 0,
    salePrice: product?.sales_price || "",
    id_subcategory: product?.id_subcategory || 0,
    stock: product?.stock || 0,
  });

  const [loading, setLoading] = useState(false);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Estados para manejo de imágenes
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar imágenes existentes si estamos editando
  useEffect(() => {
    if (product?.image_urls) {
      const images = Array.isArray(product.image_urls) 
        ? product.image_urls 
        : [product.image_urls];
      setExistingImages(images);
    }
  }, [product]);

  const fetchSubcategories = async () => {
    try {
      setLoadingSubcategories(true);
      const data = await getSubcategory();
      setSubcategories(data);
    }
    catch (error) {
      console.error("Error fetching subcategories:", error);
      alert("Error al cargar las sub-categorías. Inténtalo de nuevo.");
    } finally {
      setLoadingSubcategories(false);
    }
  }
  useEffect(() => {
    fetchSubcategories();
  }, []);

  // Limpiar URLs de preview cuando el componente se desmonte
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validar tipos de archivo
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/');
      if (!isValid) {
        alert(`${file.name} no es un archivo de imagen válido`);
      }
      return isValid;
    });

    if (validFiles.length === 0) return;

    // Limpiar previews anteriores
    previewUrls.forEach(url => URL.revokeObjectURL(url));

    // Crear nuevos previews
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(validFiles);
    setPreviewUrls(newPreviewUrls);
  };

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    // Limpiar URL del preview eliminado
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar que hay al menos una imagen (nueva o existente)
    if (selectedFiles.length === 0 && existingImages.length === 0) {
      alert("Debes agregar al menos una imagen del producto");
      return;
    }

    setLoading(true);

    try {
      const productDataToSave = {
        p_title: formData.title,
        p_description: formData.description,
        p_sales_price: formData.salePrice ? Number.parseFloat(formData.salePrice.toString()) : null,
        p_id_subcategory: Number(formData.id_subcategory),
        p_stock: formData.stock,
      };

      if (product?.product_id) {
        // Editando: incluir el ID
        onSave({ id: product.product_id, ...productDataToSave }, selectedFiles);
      } else {
        // Creando nuevo producto
        onSave(productDataToSave, selectedFiles);
      }

    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error al guardar el producto. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{product ? "Editar Producto" : "Agregar Nuevo Producto"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica del producto */}
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

            {/* Sección de imágenes */}
            <div className="space-y-4">
              <div>
                <Label>Imágenes del Producto</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-dashed"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {selectedFiles.length > 0 ? 'Cambiar imágenes' : 'Subir imágenes'}
                  </Button>
                </div>
              </div>

              {/* Imágenes existentes (solo en modo edición) */}
              {existingImages.length > 0 && (
                <div>
                  <Label>Imágenes actuales</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {existingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <img
                          src={url}
                          alt={`Imagen existente ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeExistingImage(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview de nuevas imágenes */}
              {previewUrls.length > 0 && (
                <div>
                  <Label>Nuevas imágenes</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                    {previewUrls.map((url, index) => (
                      <div key={`preview-${index}`} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeFile(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                        <div className="absolute bottom-1 left-1 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                          {selectedFiles[index]?.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mensaje si no hay imágenes */}
              {selectedFiles.length === 0 && existingImages.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No hay imágenes seleccionadas</p>
                  <p className="text-sm text-gray-400">Selecciona al menos una imagen para el producto</p>
                </div>
              )}
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