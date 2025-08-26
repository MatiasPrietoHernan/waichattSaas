import { NextResponse } from "next/server"
import { NextRequest } from "next/server"
import connectDB from "@/lib/database"
import FinancingPlan from "@/schemas/financing-plan.schema"

// opcional: valida/normaliza
function normalize(p: any) {
  return {
    code: typeof p.code === "number" ? p.code : undefined,
    description: String(p.description || "").trim(),
    months: Number(p.months),
    surchargePct: Number(p.surchargePct),
    groupKey: p.groupKey ? String(p.groupKey) : "default",
    active: Boolean(p.active),
    minPrice: p.minPrice == null ? null : Number(p.minPrice),
    maxPrice: p.maxPrice == null ? null : Number(p.maxPrice),
    includeCategories: Array.isArray(p.includeCategories)
      ? p.includeCategories
      : (typeof p.includeCategories === "string" && p.includeCategories.length
          ? p.includeCategories.split("|").map((s:string)=>s.trim()).filter(Boolean)
          : []),
    excludeCategories: Array.isArray(p.excludeCategories)
      ? p.excludeCategories
      : (typeof p.excludeCategories === "string" && p.excludeCategories.length
          ? p.excludeCategories.split("|").map((s:string)=>s.trim()).filter(Boolean)
          : []),
  }
}

export async function POST(req: NextRequest) {
  await connectDB()
  const body = await req.json()
  if (!Array.isArray(body)) {
    return NextResponse.json({ error: "Se esperaba un array de planes" }, { status: 400 })
  }

  // upsert por code o description+months
  const ops = body.map((raw) => {
    const doc = normalize(raw)
    const filter = doc.code
      ? { code: doc.code }
      : { description: doc.description, months: doc.months }
    return {
      updateOne: {
        filter,
        update: { $set: doc },
        upsert: true,
      },
    }
  })

  await FinancingPlan.bulkWrite(ops, { ordered: false })
  return NextResponse.json({ ok: true, count: ops.length })
}
