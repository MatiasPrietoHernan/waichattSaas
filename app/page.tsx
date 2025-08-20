import { WhatsAppHeader } from "@/components/layout/whatsapp-header"
import { WhatsAppProductCatalog } from "@/components/products/whatsapp-product-catalog"
import { FloatingCartButton } from "@/components/products/floating-cart-button"
import { CartLoader } from "@/components/cart/cart-loader"
import { redirect } from "next/navigation"
import { validateToken } from "@/lib/validateToken"

export default async function HomePage() {
  //const id = searchParams?.id;

  // if (!id || id.length !== 24) {
  //   redirect("/sessionExpired");
  // }

  // try {
  //   const isValid = await validateToken(id);

  //   if (!isValid) {
  //     redirect("/sessionExpired");
  //   }

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
  // } catch (err) {
  //   redirect("/sessionExpired");
  // }
}