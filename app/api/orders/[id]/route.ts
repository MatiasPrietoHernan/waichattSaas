// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/database";

// ⚠️ Ajustá la ruta al modelo de órdenes correcto:
import OrderModel from "@/schemas/order.schema";

import { z } from "zod";
import { normalizePhone } from "@/lib/phone";

const ZPatch = z.object({
  status: z.enum(["en_proceso", "vendido", "cancelado"]).optional(),
  notes: z.string().optional(),
  customer: z
    .object({
      name: z.string().min(1).optional(),
      phone: z.string().min(5).optional(),
      email: z.string().email().optional().nullable(),
      docNumber: z.string().optional().nullable(),
    })
    .optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const order = await OrderModel.findById(params.id);
    if (!order) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    return NextResponse.json({ data: order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error obteniendo orden" }, { status: 400 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await req.json();
    const input = ZPatch.parse(body);

    const order = await OrderModel.findById(params.id);
    if (!order) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });

    // Cambiar estado (como en tu UI)
    if (input.status && input.status !== order.status) {
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        at: new Date(),
        from: order.status as any,
        to: input.status as any,
      });
      order.status = input.status as any;
    }

    // Notas
    if (typeof input.notes === "string") {
      order.notes = input.notes;
    }

    // Cliente
    if (input.customer) {
      order.customer = {
        ...order.customer.toObject(),
        ...input.customer,
        phone:
          input.customer.phone != null
            ? normalizePhone(input.customer.phone)
            : order.customer.phone,
      } as any;
    }

    await order.save();
    return NextResponse.json({ data: order });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.flatten() }, { status: 422 });
    }
    return NextResponse.json({ error: err.message || "Error actualizando orden" }, { status: 400 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const deleted = await OrderModel.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ error: "Orden no encontrada" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error eliminando orden" }, { status: 400 });
  }
}

export const dynamic = "force-dynamic";
