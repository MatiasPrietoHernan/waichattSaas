"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Package, CreditCard } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useToast } from "@/hooks/use-toast"

interface CheckoutFormProps {
  items: Array<{
    id: string
    name: string
    price: number
    image: string
    quantity: number
  }>
  totalPrice: number
  onBack: () => void
  onClose: () => void
}

export function CheckoutForm({ items, totalPrice, onBack, onClose }: CheckoutFormProps) {
  const [loading, setLoading] = useState(false)
  const [needsShipping, setNeedsShipping] = useState(false)
  const [token, setToken] = useState<string | null>('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJqZWN0Ijoie1xuKzU0OTM4MTYwNzkyMTIsXG4xMzVcbn0iLCJpYXQiOjE3NTA0NDYxODR9.JpJT9AaR6zBdSovHvi0sZ350oYWfOGLywRAhDLDjvyI')
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  })
  const { clearCart } = useCart()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Validación básica
    if (!formData.name || !formData.phone) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa nombre y teléfono",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    if (needsShipping && !formData.address) {
      toast({
        title: "Dirección requerida",
        description: "Por favor ingresa tu dirección de envío",
        variant: "destructive",
      })
      setLoading(false)
      return
    }

    const sendToWebhook = async ()=>{
      const response = await fetch("https://pgwebhookpg.pgdevtuc.tech/webhook/waichattsaas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(
          {
          items: items.map((item) => ({
            id: item.id,
            title: item.name,
            unit_price: item.price,
            quantity: item.quantity
          })),
          totalPrice,
          needsShipping,
          formData,
          token
        })
      })
    }

    sendToWebhook()

    // Simulación de procesamiento del pedido
    setTimeout(() => {
      toast({
        title: "¡Pedido realizado!",
        description: `Gracias ${formData.name}, tu pedido ha sido procesado exitosamente`,
      })

      // Limpiar carrito y cerrar
      clearCart()
      onClose()
      setLoading(false)
    }, 2000)
  }

  const shippingCost = needsShipping ? 10 : 0
  const finalTotal = totalPrice + shippingCost

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="font-semibold text-gray-900">Finalizar Pedido</h3>
          <p className="text-sm text-gray-600">Completa tus datos</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
        {/* Datos del cliente */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Datos del Cliente</h4>

          <div>
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Tu nombre completo"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              required
            />
          </div>
        </div>

        {/* Opciones de envío */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">Entrega</h4>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="shipping"
              checked={needsShipping}
              onCheckedChange={(checked) => setNeedsShipping(checked as boolean)}
            />
            <Label htmlFor="shipping" className="text-sm">
              Necesito envío a domicilio (+$10.00)
            </Label>
          </div>

          {needsShipping && (
            <div>
              <Label htmlFor="address">Dirección de Envío *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Calle, número, colonia, ciudad, código postal"
                rows={3}
                required
              />
            </div>
          )}
        </div>

        {/* Resumen del pedido */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="font-medium text-gray-900 flex items-center">
            <Package className="h-4 w-4 mr-2" />
            Resumen del Pedido
          </h4>

          <div className="space-y-2 text-sm">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-600">
                  {item.name} x{item.quantity}
                </span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">${totalPrice.toFixed(2)}</span>
            </div>

            {needsShipping && (
              <div className="flex justify-between">
                <span className="text-gray-600">Envío:</span>
                <span className="font-medium">${shippingCost.toFixed(2)}</span>
              </div>
            )}

            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Total:</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </form>

      {/* Footer con botón */}
      <div className="border-t pt-4">
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          {loading ? (
            "Procesando..."
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Finalizar Pedido (${finalTotal.toFixed(2)})
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
