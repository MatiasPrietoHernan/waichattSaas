import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { CartProvider } from "@/contexts/cart-context"
import { Toaster } from "@/components/ui/toaster"
import AuthProvider from "@/components/auth/AuthProvider"

export const metadata: Metadata = {
  title: "EcommerceHub",
  description: "Plataforma completa para crear tu tienda online con gestión de productos y carrito de compras",
    generator: 'next.js',
}



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
