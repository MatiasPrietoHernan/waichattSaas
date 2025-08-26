// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";
import { z } from "zod";

import OrderModel from "@/schemas/order.schema";
import ProductModel from "@/schemas/productos.schema";
import FinancingPlanModel from "@/schemas/financing-plan.schema";

import { Types } from "mongoose";
import { normalizePhone } from "@/lib/phone";

/* ==================== Validaciones (zod) ==================== */
const ZCustomer = z.object({
  name: z.string().min(1),
  phone: z.string().min(5),
  email: z.string().email().optional().nullable(),
  docNumber: z.string().optional().nullable(),
});

const ZItemInput = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1),
  financing: z
    .object({
      planId: z.string().optional(),
      code: z.number().optional(),
    })
    .partial()
    .optional(),
});

const ZCreateOrder = z.object({
  customer: ZCustomer,
  items: z.array(ZItemInput).min(1),
  currency: z.enum(["ARS", "USD"]).optional().default("ARS"),
  notes: z.string().optional(),
  shippingTotal: z.number().min(0).optional().default(0),
  discountTotal: z.number().min(0).optional().default(0),
});

/* ==================== Helpers ==================== */
function toObjectId(id: string) {
  if (!Types.ObjectId.isValid(id)) throw new Error("ObjectId inválido");
  return new Types.ObjectId(id);
}

async function resolvePlan(planInput?: { planId?: string; code?: number }) {
  if (!planInput) return null;
  if (planInput.planId) {
    const plan = await FinancingPlanModel.findById(planInput.planId).lean();
    if (!plan || Array.isArray(plan)) throw new Error("FinancingPlan no encontrado por planId");
    return plan;
  }
  if (typeof planInput.code === "number") {
    const plan = await FinancingPlanModel.findOne({ code: planInput.code }).lean();
    if (!plan || Array.isArray(plan)) throw new Error("FinancingPlan no encontrado por code");
    return plan;
  }
  return null;
}

function pickUnitPrice(p: any): number {
  const v = typeof p?.sales_price === "number" ? p.sales_price : p?.price;
  if (typeof v !== "number") throw new Error("El producto no tiene price/sales_price numérico");
  return v;
}

function startEndOfDay(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  const end = new Date(d);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ==================== GET /api/orders ==================== */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const pageSize = Math.min(Math.max(parseInt(searchParams.get("pageSize") || "20", 10), 1), 100);

    const phone = searchParams.get("phone") || "";
    const status = searchParams.get("status") || ""; // "en_proceso" | "vendido" | "cancelado"
    const date = searchParams.get("date");           // YYYY-MM-DD (un día)
    const dateFrom = searchParams.get("dateFrom");   // ISO
    const dateTo = searchParams.get("dateTo");       // ISO

    const filter: any = {};

    // Teléfono: prefijo normalizado (coincide con tu UI que filtra por "includes")
    if (phone) {
      const norm = normalizePhone(phone);
      // Regex anclada al inicio para que pueda usar índice:
      filter["customer.phone"] = { $regex: "^" + escapeRegex(norm) };
    }

    // Estado
    if (status) filter.status = status;

    // Fecha
    if (date) {
      const range = startEndOfDay(date);
      if (range) filter.createdAt = { $gte: range.start, $lte: range.end };
    } else if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    // Orden
    const sortParam = searchParams.get("sort") || "-createdAt";
    const sort: any = {};
    if (sortParam.startsWith("-")) sort[sortParam.slice(1)] = -1;
    else sort[sortParam] = 1;

    const [data, total] = await Promise.all([
      OrderModel.find(filter).sort(sort).skip((page - 1) * pageSize).limit(pageSize).lean(),
      OrderModel.countDocuments(filter),
    ]);

    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasMore: page * pageSize < total,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error listando órdenes" }, { status: 400 });
  }
}

/* ==================== POST /api/orders ==================== */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const json = await req.json();
    console.log("POST /api/orders body:", json);
    const input = ZCreateOrder.parse(json);

    const normPhone = normalizePhone(input.customer.phone);

    // Construir ítems con snapshot
    let itemsSubTotal = 0;
    let surchargeTotal = 0;

    const builtItems: any[] = [];
    for (const raw of input.items) {
      const product = await ProductModel.findById(raw.productId).lean();
      console.log("Producto:", product);
      if (!product) throw new Error("Producto no encontrado");

      const unitPrice = pickUnitPrice(product);
      const subTotal = unitPrice * raw.quantity;

      let financingSnap: any = undefined;
      let grandTotal = subTotal;

      if (raw.financing) {
        const plan = await resolvePlan(raw.financing);
        if (!plan) throw new Error("Plan de financiación no encontrado");

        const surchargePct = plan.surchargePct ?? 0;
        const months = plan.months ?? null;

        const surchargeAmount = subTotal * surchargePct;
        const totalWithSurcharge = subTotal + surchargeAmount;
        const installmentAmount = months ? totalWithSurcharge / months : null;

        financingSnap = {
          planRef: plan._id,
          modeApplied: product?.financing?.mode ?? "inherit",
          groupKey: product?.financing?.groupKey ?? "default",
          planCode: plan.code ?? null,
          months,
          surchargePct,
          downPct: product?.financing?.downPct ?? null,
          surchargeAmount,
          totalWithSurcharge,
          installmentAmount,
        };

        grandTotal = totalWithSurcharge;
        surchargeTotal += surchargeAmount;
      }

      itemsSubTotal += subTotal;

      builtItems.push({
        productId: product._id,
        productTitle: product.title,
        category: product.category,
        subcategory: product.subcategory ?? null,
        unitPrice,
        quantity: raw.quantity,
        financing: financingSnap,
        subTotal,
        grandTotal,
      });
    }

    const totals = {
      itemsSubTotal,
      surchargeTotal,
      discountTotal: input.discountTotal ?? 0,
      shippingTotal: input.shippingTotal ?? 0,
      grandTotal: itemsSubTotal + surchargeTotal - (input.discountTotal ?? 0) + (input.shippingTotal ?? 0),
    };

    const doc = await OrderModel.create({
      status: "en_proceso",
      customer: { ...input.customer, phone: normPhone },
      items: builtItems,
      notes: input.notes ?? null,
      currency: input.currency ?? "ARS",
      totals,
      statusHistory: [{ to: "en_proceso", at: new Date() }],
    });

    return NextResponse.json({ data: doc }, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.flatten() }, { status: 422 });
    }
    return NextResponse.json({ error: err.message || "Error creando orden" }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
