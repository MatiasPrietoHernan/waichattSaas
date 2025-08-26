"use client"

import { LoginForm } from "@/components/auth/login-form"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
export default function LoginPage() {
  const {data: session, status} = useSession()
  const router = useRouter()
  useEffect(()=> {
    if(status === "loading") return; 
    if (!session || (session.user as any).role === "admin") {
      router.push("/admin")
    }
  },[session, status, router])
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <LoginForm />
    </div>
  )
}
