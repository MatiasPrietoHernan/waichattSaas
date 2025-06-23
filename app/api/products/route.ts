import { NextResponse } from "next/server"
import { IProduct } from "@/types/product"
import connectDB from "@/lib/database"


export async function GET() {
  try {
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 500 })
    }
    const collection = db.connection.db?.collection<IProduct>(process.env.DATABSE_COLECCTION_PROD || "");
    const products = (await collection?.find({}).toArray())?.map(p => ({ id: p._id, ...p }))
    return NextResponse.json(products || [], { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const product = await request.json()
    const newProduct = {
      id: Date.now().toString(),
      ...product,
      stock: product.stock || 0,
    }

    // En producción, aquí guardarías en la base de datos
    sampleProducts.push(newProduct)

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}
