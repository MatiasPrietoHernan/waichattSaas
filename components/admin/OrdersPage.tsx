"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { CalendarIcon, Search, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { cn } from "@/lib/utils"
import type { Product as UIProduct, OrderItem as UIOrderItem, Order as UIOrder, QuoteItem} from "../../types/IOrdersPage"
import {fetchProducts,fetchQuotesForProduct,fetchOrders,postOrder,patchOrderStatus,labelFromQuote} from '@/lib/OrdersPageFunctions'


/* ------------------ Página ------------------ */
const OrdersPage = () => {
  const [orders, setOrders] = useState<UIOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [phoneFilter, setPhoneFilter] = useState("")
  const [dateFilter, setDateFilter] = useState<Date>()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set())

  // creación
  const [orderItems, setOrderItems] = useState<UIOrderItem[]>([])
  const [selectedProduct, setSelectedProduct] = useState<UIProduct | null>(null)
  const [productSearch, setProductSearch] = useState("")
  const [searchResults, setSearchResults] = useState<UIProduct[]>([])
  const [quantity, setQuantity] = useState(1)
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [quotes, setQuotes] = useState<QuoteItem[]>([])
  const [customerPhone, setCustomerPhone] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [planLabelMap, setPlanLabelMap] = useState<Record<string, string>>({})

  /* ------- cargar órdenes con filtros (server) ------- */
  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    const t = setTimeout(() => {
      fetchOrders({ phone: phoneFilter, status: statusFilter, date: dateFilter })
        .then((data) => { if (active) setOrders(data) })
        .catch((e) => { if (active) setError(typeof e === "string" ? e : e?.message || "Error") })
        .finally(() => { if (active) setLoading(false) })
    }, 250)
    return () => { active = false; clearTimeout(t) }
  }, [phoneFilter, statusFilter, dateFilter])

  /* ------- buscar productos (debounced) ------- */
  useEffect(() => {
    let active = true
    if (!productSearch.trim()) { setSearchResults([]); return }
    const t = setTimeout(() => {
      fetchProducts(productSearch)
        .then(items => { if (active) setSearchResults(items) })
        .catch(() => { if (active) setSearchResults([]) })
    }, 200)
    return () => { active = false; clearTimeout(t) }
  }, [productSearch])

  /* ------- cotizar financiación al elegir producto ------- */
  useEffect(() => {
    let active = true
    setQuotes([])
    setSelectedPlanId("")
    if (!selectedProduct) return
    ;(async () => {
      try {
        // Para pedir cotización necesitamos los campos “originales” por si tu API trae includeCodes/groupKey.
        // Como el buscador usa la versión UI, pedimos otra vez a /api/products/id si querés máxima fidelidad.
        // Para simplificar, usamos selectedProduct tal cual (ya trae sales_price y financing.planIds).
        const qts = await fetchQuotesForProduct(selectedProduct as any)
        if (!active) return
        setQuotes(qts)
        // actualizar labels encontrados (planId => label)
        setPlanLabelMap(prev => {
          const next = { ...prev }
          qts.forEach(it => { next[it.planId] = labelFromQuote(it) })
          return next
        })
      } catch (e: any) {
        setError(e?.message || "No se pudieron obtener planes")
      }
    })()
    return () => { active = false }
  }, [selectedProduct])

  const addProductToOrder = () => {
    if (!selectedProduct || !selectedPlanId) return
    const subtotal = selectedProduct.sales_price * quantity
    const newItem: UIOrderItem = {
      product: selectedProduct,
      quantity,
      financing: selectedPlanId, // guardamos planId (o code:*) como string
      subtotal,
    }
    setOrderItems(prev => [...prev, newItem])
    setSelectedProduct(null)
    setProductSearch("")
    setQuantity(1)
    setSelectedPlanId("")
    setQuotes([])
  }

  const removeProductFromOrder = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleCreateOrder = async () => {
    if (orderItems.length === 0 || !customerPhone || !customerName) return
    try {
      setLoading(true)
      setError(null)

      const itemsPayload = orderItems.map((it) => {
        const f = it.financing || ""
        if (/^code:\d+$/.test(f)) {
          // si quedó un id sintético por código (viene de una orden histórica)
          const code = Number(f.split(":")[1])
          return { productId: it.product._id, quantity: it.quantity, financing: { code } }
        }
        // preferimos planId
        return { productId: it.product._id, quantity: it.quantity, financing: f ? { planId: f } : undefined }
      })

      await postOrder({
        customer: { name: customerName, phone: customerPhone },
        items: itemsPayload,
        notes: "",
        currency: "ARS",
      })

      // refrescar listado
      const refreshed = await fetchOrders({ phone: phoneFilter, status: statusFilter, date: dateFilter })
      setOrders(refreshed)

      // cerrar y limpiar
      setIsModalOpen(false)
      setOrderItems([])
      setSelectedProduct(null)
      setProductSearch("")
      setQuantity(1)
      setSelectedPlanId("")
      setQuotes([])
      setCustomerPhone("")
      setCustomerName("")
    } catch (e: any) {
      setError(e?.message || "Error creando la orden")
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: "vendido" | "en_proceso" | "cancelado") => {
    try {
      // optimista
      setOrders((prev) => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      const updated = await patchOrderStatus(orderId, newStatus)
      setOrders((prev) => prev.map(o => o.id === orderId ? updated : o))
    } catch (e: any) {
      setError(e?.message || "No se pudo actualizar el estado")
      const refreshed = await fetchOrders({ phone: phoneFilter, status: statusFilter, date: dateFilter })
      setOrders(refreshed)
    }
  }

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const next = new Set(prev)
      if (next.has(orderId)) next.delete(orderId)
      else next.add(orderId)
      return next
    })
  }

  /* ------------------ Render ------------------ */
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Órdenes</h1>
            <p className="text-gray-600 mt-0.5 text-sm">Gestiona pedidos y ventas</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white h-9 px-3 text-sm" disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Orden
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg">Crear Nueva Orden</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-sm">Agregar Producto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {/* Product Search */}
                      <div className="relative">
                        <Label htmlFor="product-search" className="text-xs">Producto</Label>
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                          <Input
                            id="product-search"
                            placeholder="Buscar producto..."
                            value={productSearch}
                            onChange={(e) => setProductSearch(e.target.value)}
                            className="pl-8 h-9 text-sm"
                          />
                        </div>
                        {productSearch && searchResults.length > 0 && (
                          <div className="mt-1 border rounded-md max-h-48 overflow-y-auto absolute z-10 bg-white w-full text-sm">
                            {searchResults.map((product) => (
                              <div
                                key={product._id}
                                className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => {
                                  setSelectedProduct(product)
                                  setProductSearch(product.title)
                                }}
                              >
                                <div className="font-medium">{product.title}</div>
                                <div className="text-xs text-gray-500">
                                  ${product.sales_price.toLocaleString()} - Stock: {product.stock}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quantity */}
                      <div>
                        <Label htmlFor="quantity" className="text-xs">Cantidad</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
                          className="h-9 text-sm"
                        />
                      </div>

                      {/* Financing (dinámico desde /api/financing/quote) */}
                      <div>
                        <Label htmlFor="financing" className="text-xs">Financiación</Label>
                        <Select
                          value={selectedPlanId}
                          onValueChange={setSelectedPlanId}
                          disabled={!selectedProduct || quotes.length === 0}
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder={selectedProduct ? (quotes.length ? "Seleccionar plan" : "Sin planes disponibles") : "Seleccioná un producto"} />
                          </SelectTrigger>
                          <SelectContent>
                            {quotes.map(q => (
                              <SelectItem key={q.planId} value={q.planId} className="text-sm">
                                {labelFromQuote(q)} — cuota ${q.monthly.toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Add Product Button */}
                      <div className="flex items-end">
                        <Button
                          onClick={addProductToOrder}
                          disabled={!selectedProduct || !selectedPlanId}
                          className="w-full bg-green-600 hover:bg-green-700 h-9 text-sm"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {orderItems.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3 text-sm">Productos en la Orden</h3>
                      <div className="space-y-2">
                        {orderItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="flex-1">
                              <div className="font-medium text-sm">{item.product.title}</div>
                              <div className="text-xs text-gray-600">
                                Cantidad: {item.quantity} | Plan: {planLabelMap[item.financing || ""] || "—"} | Subtotal: ${item.subtotal.toLocaleString()}
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeProductFromOrder(index)}
                              className="h-8 px-2 text-xs text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                        <div className="text-right font-semibold text-base">
                          Total: ${orderItems.reduce((sum, item) => sum + item.subtotal, 0).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Customer Info */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3 text-sm">Información del Cliente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="customer-name" className="text-xs">Nombre del Cliente</Label>
                        <Input
                          id="customer-name"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="customer-phone" className="text-xs">Teléfono</Label>
                        <Input
                          id="customer-phone"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="h-9 text-sm"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  onClick={handleCreateOrder}
                  className="w-full bg-green-600 hover:bg-green-700 h-10 text-sm"
                  disabled={orderItems.length === 0 || !customerPhone || !customerName || loading}
                >
                  Crear Orden
                </Button>

                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label htmlFor="phone-filter" className="text-xs">Filtrar por teléfono</Label>
                <Input
                  id="phone-filter"
                  placeholder="Número de teléfono..."
                  value={phoneFilter}
                  onChange={(e) => setPhoneFilter(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs">Filtrar por fecha</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal h-9 text-sm",
                        !dateFilter && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFilter ? format(dateFilter, "PPP", { locale: es }) : "Seleccionar fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="status-filter" className="text-xs">Estado</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-sm">Todos</SelectItem>
                    <SelectItem value="en_proceso" className="text-sm">En Proceso</SelectItem>
                    <SelectItem value="vendido" className="text-sm">Vendido</SelectItem>
                    <SelectItem value="cancelado" className="text-sm">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPhoneFilter("")
                    setDateFilter(undefined)
                    setStatusFilter("all")
                  }}
                  className="w-full h-9 text-sm"
                  disabled={loading}
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
            {loading && <p className="text-xs text-gray-500 mt-2">Cargando…</p>}
            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-2">
          {orders.map((order) => (
            <Card key={order.id}>
              <Collapsible>
                <CardContent className="p-4">
                  <CollapsibleTrigger className="w-full" onClick={() => toggleOrderExpansion(order.id)}>
                    <div className="flex justify-between items-center cursor-pointer hover:bg-gray-50 rounded-md transition-colors px-2 py-1.5">
                      {expandedOrders.has(order.id) ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                      <div className="flex items-center gap-2 min-w-0">
                        <h3 className="font-semibold text-base truncate">Orden #{order.id}</h3>
                        <Badge className={cn("text-[10px] px-2 py-0.5 text-white", {
                          "bg-green-600": order.status === "vendido",
                          "bg-yellow-600": order.status === "en_proceso",
                          "bg-red-600": order.status === "cancelado",
                        })}>
                          {order.status === "vendido" ? "Vendido" : order.status === "en_proceso" ? "En Proceso" : "Cancelado"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="truncate max-w-[140px]">{order.customerName}</span>
                        <span>{format(order.createdAt, "dd/MM/yyyy")}</span>
                        <span className="font-bold text-sm">${order.total.toLocaleString()}</span>
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded">
                          {order.items.length} prod.
                        </span>
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-gray-500">Detalles de la orden</span>
                        <Select
                          value={order.status}
                          onValueChange={(value: "vendido" | "en_proceso" | "cancelado") =>
                            updateOrderStatus(order.id, value)
                          }
                        >
                          <SelectTrigger className="w-32 h-9 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en_proceso" className="text-sm">En Proceso</SelectItem>
                            <SelectItem value="vendido" className="text-sm">Vendido</SelectItem>
                            <SelectItem value="cancelado" className="text-sm">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 mb-3">
                        {order.items.map((item, index) => (
                          <div key={index} className="p-2 bg-gray-50 rounded-md">
                            <div className="font-medium text-sm">{item.product.title}</div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-600 mt-1">
                              <div>Cantidad: {item.quantity}</div>
                              <div>Precio: ${item.product.sales_price.toLocaleString()}</div>
                              <div>Plan: {planLabelMap[item.financing || ""] || "—"}</div>
                              <div>Subtotal: ${item.subtotal.toLocaleString()}</div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-700">
                        <div>
                          <span className="font-medium">Cliente:</span> {order.customerName}
                        </div>
                        <div>
                          <span className="font-medium">Teléfono:</span> {order.customerPhone}
                        </div>
                        <div>
                          <span className="font-medium">Fecha:</span> {format(order.createdAt, "dd/MM/yyyy")}
                        </div>
                        <div>
                          <span className="font-medium text-sm">Total:</span>{" "}
                          <span className="text-sm font-bold">${order.total.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </CardContent>
              </Collapsible>
            </Card>
          ))}

          {!loading && orders.length === 0 && (
            <Card>
              <CardContent className="p-4 text-center text-gray-500 text-sm">
                No se encontraron órdenes que coincidan con los filtros aplicados.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrdersPage
