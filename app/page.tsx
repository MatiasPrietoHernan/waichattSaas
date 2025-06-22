import { WhatsAppHeader } from "@/components/layout/whatsapp-header"
import { WhatsAppProductCatalog } from "@/components/products/whatsapp-product-catalog"
import { FloatingCartButton } from "@/components/products/floating-cart-button"
import { redirect } from "next/navigation"
import { validateToken } from "@/lib/validateToken"


export default async function HomePage({ searchParams }: { searchParams: { token?: string } }) {
  const token = searchParams.token
  const secret = process.env.NEXTAUTH_SECRET || "default"

  if (!token) {
    redirect("/sessionExpired")
  }

  try {
    const isValid = validateToken(token)
    if (!isValid) {
      redirect("/sessionExpired")
    }

    return (
      <div className="min-h-screen">
        <WhatsAppHeader />
        <main>
          <WhatsAppProductCatalog />
        </main>
        <FloatingCartButton />
      </div>
    )
  } catch (err) {
    redirect("/sessionExpired")
  }
}