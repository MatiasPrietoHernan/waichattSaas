import { NextResponse } from "next/server"
import { IProduct } from "@/types/product"
import connectDB from "@/lib/database"
import { ObjectId } from "mongodb"


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
      ...product,
      stock: product.stock || 0,
    }
    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 500 })
    }

    const collection = db.connection.db?.collection<IProduct>(process.env.DATABSE_COLECCTION_PROD || "");
    if (!collection) {
      return NextResponse.json({ error: "Colección no encontrada" }, { status: 500 })
    }

    await collection.insertOne(newProduct);

    return NextResponse.json(newProduct, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
  }
}


export async function PUT(request: Request) {
  try {
    const product = await request.json();
    console.log(product)
    const { id, ...updateData } = product;

    const db = await connectDB();
    if (!db) {
      return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 500 });
    }

    const collection = db.connection.db?.collection<IProduct>(process.env.DATABSE_COLECCTION_PROD || "");
    if (!collection) {
      return NextResponse.json({ error: "Colección no encontrada" }, { status: 500 });
    }

    const updatedProduct = await collection.findOneAndUpdate(
      { _id: typeof id === "string" && ObjectId.isValid(id) ? new ObjectId(id) : id },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 });
  }
}


export async function DELETE(request: Request) {
try {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  console.log("ID recibido:", id);

  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 });
  }

  const db = await connectDB();
  if (!db) {
    return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 500 });
  }

  const collection = db.connection.db?.collection<IProduct>(process.env.DATABSE_COLECCTION_PROD || "");
  if (!collection) {
    return NextResponse.json({ error: "Colección no encontrada" }, { status: 500 });
  }

  const result = await collection.deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ message: "Producto eliminado correctamente" }, { status: 200 });
} catch (error) {
  return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 });
}

}
