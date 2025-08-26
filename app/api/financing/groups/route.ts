
import { NextResponse } from "next/server";
import connectDB from "@/lib/database";
import FinancingGroup from "@/schemas/financing.groups.schema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  await connectDB();
  const groups = await FinancingGroup.find().sort({ active: -1, order: 1, name: 1 }).lean();
  return NextResponse.json({ groups });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const body = await req.json();
  const created = await FinancingGroup.create(body);
  return NextResponse.json(created, { status: 201 });
}
