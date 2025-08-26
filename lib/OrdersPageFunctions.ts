import type { Product as UIProduct, OrderItem as UIOrderItem, Order as UIOrder, ApiProduct,ApiProductsList, 
  QuoteItem, QuoteResponse,ApiOrderItem, ApiOrder,  ApiListResponse  } from "@/types/IOrdersPage"

export async function fetchProducts(q: string): Promise<UIProduct[]> {
  if (!q.trim()) return []
  const sp = new URLSearchParams({ q, limit: "10", page: "1" })
  const res = await fetch(`/api/products?${sp.toString()}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Error buscando productos")
  const json: ApiProductsList = await res.json()
  return json.items.map(p => ({
    _id: p._id,
    title: p.title,
    sales_price: typeof p.sales_price === "number" ? p.sales_price : (p.price ?? 0),
    category: p.category,
    subcategory: p.subcategory || "",
    stock: p.stock,
    financing: {
      mode: p.financing?.mode ?? "inherit",
      // ojo: tu UI espera planIds:string[] acá
      planIds: p.financing?.planIds ?? [],
    },
  }))
}

export async function fetchQuotesForProduct(p: ApiProduct | UIProduct): Promise<QuoteItem[]> {
  const price = (p as any).sales_price ?? (p as any).price ?? 0
  const fin = (p as any).financing || {}
  const sp = new URLSearchParams()
  sp.set("price", String(price))

  // prioridad: planIds -> sino groupKey; downPct si viene
  if (Array.isArray(fin.planIds) && fin.planIds.length > 0) {
    sp.set("planIds", fin.planIds.join(","))
  } else if (fin.groupKey) {
    sp.set("groupKey", fin.groupKey)
  }
  if (typeof fin.downPct === "number") sp.set("downPct", String(fin.downPct))

  const res = await fetch(`/api/financing/quote?${sp.toString()}`, { cache: "no-store" })
  if (!res.ok) throw new Error("Error consultando financiación")
  const json: QuoteResponse = await res.json()

  // si el producto usa includeCodes (override por códigos), filtrá client-side
  const includeCodes: number[] = (p as any)?.financing?.includeCodes ?? []
  const items = Array.isArray(includeCodes) && includeCodes.length > 0
    ? json.items.filter(it => includeCodes.includes(it.code))
    : json.items

  return items
}

// helper: rango local del día seleccionado
function getLocalDayRange(d: Date) {
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  const end   = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
  return { start, end };
}

export async function fetchOrders(params: { phone?: string; status?: string; date?: Date }) {
  const sp = new URLSearchParams();
  if (params.phone) sp.set("phone", params.phone);
  if (params.status && params.status !== "all") sp.set("status", params.status);

  if (params.date) {
    const { start, end } = getLocalDayRange(params.date); // <- día local
    sp.set("dateFrom", start.toISOString());              // <- enviamos ISO
    sp.set("dateTo", end.toISOString());
  }

  sp.set("pageSize", "100");

  const res = await fetch(`/api/orders?${sp.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  const json: ApiListResponse = await res.json();
  return json.data.map(mapApiOrderToUI);
}


export async function postOrder(payload: {
  customer: { name: string; phone: string }
  items: { productId: string; quantity: number; financing?: { planId?: string; code?: number } }[]
  notes?: string
  currency?: "ARS" | "USD"
}) {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      shippingTotal: 0,
      discountTotal: 0,
      currency: payload.currency || "ARS",
    }),
  })
  if (!res.ok) throw new Error(await res.text())
  const json = await res.json()
  return mapApiOrderToUI(json.data as ApiOrder)
}

export async function patchOrderStatus(id: string, status: "en_proceso" | "vendido" | "cancelado") {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) throw new Error(await res.text())
  const json = await res.json()
  return mapApiOrderToUI(json.data as ApiOrder)
}

export function mapApiOrderToUI(o: ApiOrder): UIOrder {
  return {
    id: o._id,
    items: o.items.map<UIOrderItem>(it => ({
      product: {
        _id: it.productId,
        title: it.productTitle,
        sales_price: it.unitPrice,
        category: it.category,
        subcategory: it.subcategory || "",
        stock: 0,
        financing: { mode: "inherit", planIds: [] },
      },
      quantity: it.quantity,
      // guardamos planRef o un id sintético por código (para rotular)
      financing:
        (it.financing?.planRef && /^[a-f0-9]{24}$/i.test(it.financing.planRef))
          ? it.financing.planRef
          : (typeof it.financing?.planCode === "number" ? `code:${it.financing.planCode}` : ""),
      subtotal: it.subTotal,
    })),
    customerPhone: o.customer.phone,
    customerName: o.customer.name,
    status: o.status,
    createdAt: new Date(o.createdAt),
    total: o.totals.grandTotal,
  }
}

export const labelFromQuote = (q: QuoteItem) =>
  `${q.months} CUOTAS - recargo ${(q.surchargePct * 100).toFixed(0)}%`