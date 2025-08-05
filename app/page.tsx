import { WhatsAppHeader } from "@/components/layout/whatsapp-header"
import { WhatsAppProductCatalog } from "@/components/products/whatsapp-product-catalog"
import { FloatingCartButton } from "@/components/products/floating-cart-button"
import { CartLoader } from "@/components/cart/cart-loader"
import { redirect } from "next/navigation"
import { validateToken } from "@/lib/validateToken"

export default async function HomePage() {


    return (
      <div className="min-h-screen">
        <WhatsAppHeader />
        <main>
          <WhatsAppProductCatalog />
        </main>
        <FloatingCartButton />
        <CartLoader />
      </div>
    );

}