// app/api/financing/quote/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import FinancingPlan from "@/schemas/financing-plan.schema";

const DEFAULT_DOWN_PCT = 0.15;

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const price = Number(searchParams.get("price") || 0);
  const groupKey = searchParams.get("groupKey") || undefined;
  const downPctParam = searchParams.get("downPct");
  const downPct = downPctParam != null ? Number(downPctParam) : DEFAULT_DOWN_PCT;

  // ⬇️ nuevo: soportar planIds
  const planIdsParam = searchParams.get("planIds");
  const planIds = planIdsParam ? planIdsParam.split(",").filter(Boolean) : [];

  const q: any = { active: true };
  if (planIds.length > 0) {
    q._id = { $in: planIds };              // cuando especificás planes, filtramos por esos
  } else if (groupKey) {
    q.$or = [{ groupKey }, { groupKey: null }, { groupKey: { $exists: false } }];
  }

  const plans = await FinancingPlan
    .find(q)
    .select("_id code description months surchargePct groupKey") // seleccioná lo necesario
    .lean();

  const downAmount = price * downPct;
  const balance = Math.max(0, price - downAmount);

  const items = plans
    .map((p) => {
      const total = balance * (1 + (p.surchargePct ?? 0));
      return {
        planId: String(p._id),                // ⬅️ DEVOLVÉ planId
        code: p.code,
        description: p.description,
        months: p.months,
        surchargePct: p.surchargePct ?? 0,
        monthly: total / p.months,
        total,
        downAmount,
        downPct,
      };
    })
    .sort((a, b) => a.months - b.months || a.surchargePct - b.surchargePct);

  return NextResponse.json({ price, downPct, items });
}
