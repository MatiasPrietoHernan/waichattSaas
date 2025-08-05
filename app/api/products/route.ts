import { NextResponse } from "next/server"
import { getAllProducts } from "@/lib/methods/get_products"

export async function GET() {
  try {
    const products = await getAllProducts()
    return NextResponse.json(products, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}
