"use client"

import { useState } from "react"
import { useCart } from "@/contexts/cart-context"
import { CartItem } from "./cart-item"
import { CheckoutForm } from "./checkout-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, CreditCard, ArrowLeft } from "lucide-react"
import Link from "next/link"

export function CartPage() {
  const [showCheckout, setShowCheckout] = useState(false)
  const { items, getTotalPrice } = useCart()

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = getTotalPrice()

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-600 mb-8">Parece que no has agregado ningún producto a tu carrito todavía.</p>
        <Link href="/">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Continuar Comprando
          </Button>
        </Link>
      </div>
    )
  }

  if (showCheckout) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <CheckoutForm
              items={items}
              totalPrice={totalPrice * 1.1}
              onBack={() => setShowCheckout(false)}
              onClose={() => (window.location.href = "/")}
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Carrito de Compras</h1>
        <p className="text-gray-600">
          {totalItems} producto{totalItems !== 1 ? "s" : ""} en tu carrito
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Productos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío:</span>
                <span>Gratis</span>
              </div>
              <div className="flex justify-between">
                <span>Impuestos:</span>
                <span>${(totalPrice * 0.1).toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${(totalPrice * 1.1).toFixed(2)}</span>
              </div>

              <div className="space-y-3 pt-4">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowCheckout(true)}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceder al Pago
                </Button>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continuar Comprando
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
