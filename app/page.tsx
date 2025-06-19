import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ProductCatalog } from "@/components/products/product-catalog"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Espaciado para el header fixed */}
      <div className="pt-24">
        <main>
          <ProductCatalog />
        </main>
      </div>
      <Footer />
    </div>
  )
}
