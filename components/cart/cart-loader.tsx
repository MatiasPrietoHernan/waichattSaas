"use client"

import { useEffect, useRef } from 'react'
import { useCart, getCartFromApi } from '@/contexts/cart-context'
import { useSearchParams } from 'next/navigation'

export function CartLoader() {
  const { setCart } = useCart()
  const searchParams = useSearchParams()
  const loadedCartId = useRef<string | null>(null)
  
  useEffect(() => {
    const idCart = searchParams.get('idCart')
    
    // Solo cargar si hay idCart y no se ha cargado ya este carrito
    if (idCart && idCart !== loadedCartId.current) {
      console.log("Cargando carrito con ID:", idCart)
      
      const loadCart = async () => {
        try {
          const cartItems = await getCartFromApi(idCart)
          if (cartItems.length > 0) {
            setCart(cartItems)
            loadedCartId.current = idCart 
          }
        } catch (error) {
        }
      }
      
      loadCart()
    }
  }, [searchParams])

  return null
}