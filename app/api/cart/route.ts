import { NextResponse } from "next/server"
import connectDB from "@/lib/database"
import { ObjectId } from "mongodb";


export async function GET(req: Request) {
    try {
        const db = await connectDB();
        if (!db) {
            return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 500 })
        }
        const { searchParams } = new URL(req.url);
        const idCart = searchParams.get("idCart");

        if (!idCart) return NextResponse.json({ error: "error al obtener el id" })

        const collection = db.connection.db?.collection(process.env.DATABSE_COLECCTION_CARR || "");
        const _id = new ObjectId(idCart)
        const productsMongo = await collection?.findOne({ _id });
        const products = productsMongo?.products;
        if (products && products.length > 0) {
            return NextResponse.json({ products: products }, { status: 200 })
        } else {
            return NextResponse.json({ products: [] }, { status: 404 })
        }
    } catch (error) {
        return NextResponse.json({products:[], error: "Error al obtener productos" }, { status: 500 })
    }
}

