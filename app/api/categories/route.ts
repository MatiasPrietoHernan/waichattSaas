// app/api/categories/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/database";

export async function GET() {
  try {
    const db = await connectDB();
    if (!db || !db.connection || !db.connection.db) {
      throw new Error("Database connection failed");
    }
    const col = db.connection.db.collection(process.env.DATABSE_COLECCTION_PROD || "");

    // Todas las categorías (no borrados), con conteo
    const rows = await col.aggregate([
      { $match: { is_deleted: { $ne: true } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]).toArray();

    const categories = rows
      .map(r => ({ name: String(r._id ?? "").trim(), count: r.count }))
      .filter(c => c.name.length > 0);

    return NextResponse.json({ categories });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ categories: [] }, { status: 200 });
  }
}
