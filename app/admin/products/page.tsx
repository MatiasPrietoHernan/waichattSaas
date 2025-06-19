import { ProductManagement } from "@/components/admin/product-management"
import { AdminHeader } from "@/components/admin/admin-header"

export default function AdminProductsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <ProductManagement />
      </main>
    </div>
  )
}
