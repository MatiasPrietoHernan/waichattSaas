import { AdminDashboard } from "@/components/admin/AdminDashboard"
import { AdminHeader } from "@/components/admin/AdminHeader"

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </main>
    </div>
  )
}
