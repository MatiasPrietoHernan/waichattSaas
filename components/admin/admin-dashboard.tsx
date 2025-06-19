"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react"

export function AdminDashboard() {
  const stats = [
    {
      title: "Total Productos",
      value: "156",
      change: "+12%",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Pedidos Hoy",
      value: "23",
      change: "+8%",
      icon: ShoppingCart,
      color: "text-green-600",
    },
    {
      title: "Clientes Activos",
      value: "1,234",
      change: "+15%",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Ventas del Mes",
      value: "$12,450",
      change: "+22%",
      icon: TrendingUp,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Resumen de tu tienda online</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <p className="text-xs text-green-600 mt-1">{stat.change} desde el mes pasado</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Smartphone Premium", sales: 45, revenue: "$33,750" },
                { name: "Laptop Gaming", sales: 32, revenue: "$41,600" },
                { name: "Auriculares Bluetooth", sales: 28, revenue: "$4,200" },
                { name: "Smartwatch", sales: 24, revenue: "$7,200" },
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.sales} ventas</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Nuevo pedido #1234", time: "Hace 5 minutos", type: "order" },
                { action: "Producto agregado: Tablet Pro", time: "Hace 1 hora", type: "product" },
                { action: "Cliente registrado: Juan Pérez", time: "Hace 2 horas", type: "user" },
                { action: "Pedido completado #1230", time: "Hace 3 horas", type: "order" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      activity.type === "order"
                        ? "bg-green-500"
                        : activity.type === "product"
                          ? "bg-blue-500"
                          : "bg-purple-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-600">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
