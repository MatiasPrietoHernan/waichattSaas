import { NextResponse } from "next/server"

// Datos de ejemplo - en producción esto vendría de una base de datos
const sampleProducts = [
  {
    id: "1",
    name: "Smartphone Premium",
    description: "Teléfono inteligente de última generación con cámara de 108MP",
    price: 899.99,
    salePrice: 749.99,
    category: "Electrónicos",
    image: "/placeholder.svg?height=300&width=300",
    stock: 15,
  },
  {
    id: "2",
    name: "Laptop Gaming",
    description: "Laptop para gaming con procesador Intel i7 y tarjeta gráfica RTX",
    price: 1299.99,
    salePrice: null,
    category: "Computadoras",
    image: "/placeholder.svg?height=300&width=300",
    stock: 8,
  },
  {
    id: "3",
    name: "Auriculares Bluetooth",
    description: "Auriculares inalámbricos con cancelación de ruido",
    price: 199.99,
    salePrice: 149.99,
    category: "Audio",
    image: "/placeholder.svg?height=300&width=300",
    stock: 25,
  },
  {
    id: "4",
    name: "Smartwatch",
    description: "Reloj inteligente con monitor de salud y GPS",
    price: 299.99,
    salePrice: null,
    category: "Wearables",
    image: "/placeholder.svg?height=300&width=300",
    stock: 12,
  },
  {
    id: "5",
    name: "Tablet Pro",
    description: "Tablet profesional con pantalla de 12 pulgadas y stylus incluido",
    price: 699.99,
    salePrice: 599.99,
    category: "Tablets",
    image: "/placeholder.svg?height=300&width=300",
    stock: 20,
  },
  {
    id: "6",
    name: "Cámara Digital",
    description: "Cámara DSLR profesional con lente 18-55mm",
    price: 799.99,
    salePrice: null,
    category: "Fotografía",
    image: "/placeholder.svg?height=300&width=300",
    stock: 6,
  },
]

export async function GET() {
  try {
    return NextResponse.json(sampleProducts)
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
