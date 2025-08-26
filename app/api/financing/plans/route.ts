import connectDB from "@/lib/database";
import FinancingPlan from "@/schemas/financing-plan.schema";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const groupKey = searchParams.get("group"); // opcional

  const q: any = {};
  if (groupKey) q.$or = [{ groupKey }, { groupKey: { $exists: false } }, { groupKey: null }];

  const plans = await FinancingPlan
    .find(q)
    .select({ description: 1, months: 1, surchargePct: 1, groupKey: 1, active: 1 })
    .sort({ months: 1 })
    .lean();

  const defaultDownPct = 0.15;

  return NextResponse.json({ defaultDownPct, plans });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const plan = new FinancingPlan(body);
  await plan.save();
  return NextResponse.json(plan, { status: 201 });
}