import { NextResponse } from "next/server"
import connectDB from "@/lib/database"
import FinancingPlan from "@/schemas/financing-plan.schema"

export async function GET(req: Request) {
  await connectDB()

  const { searchParams } = new URL(req.url)
  const groupKey = searchParams.get("group") // opcional

  const q: any = { active: true }
  if (groupKey) q.$or = [{ groupKey }, { groupKey: { $exists: false } }, { groupKey: null }]

  const plans = await FinancingPlan
    .find(q)
    .select({ description: 1, months: 1, surchargePct: 1, groupKey: 1, active: 1 })
    .sort({ months: 1 })
    .lean()

  // si más adelante querés que esto salga de DB, cambialo acá
  const defaultDownPct = 0.15

  return NextResponse.json({ defaultDownPct, plans })
}
