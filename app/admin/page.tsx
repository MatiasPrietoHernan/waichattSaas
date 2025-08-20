import { ProductManagement } from "@/components/admin/ProductMagnament"
import { AdminHeader } from "@/components/admin/AdminHeader"
import {redirect} from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions  } from "@/app/api/auth/[...nextauth]/route";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
   if (!session || (session.user as any).role !== "admin") redirect("/login");
  return (
    <div className="min-h-screen bg-gray-100">
      <AdminHeader />
      <main className="container mx-auto px-4 py-8">
        <ProductManagement />
      </main>
    </div>
  )
}
