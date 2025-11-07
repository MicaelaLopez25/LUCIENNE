
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


// GET → listar productos con búsqueda en título Y color
export async function GET(req: Request) {
  const url = new URL(req.url);
  const searchTerm = url.searchParams.get("search") || ""; // Solo necesitamos 'search'

  // 💡 Objeto WHERE
  let where: any = {};

  // 💡 Si hay un término de búsqueda, usamos el operador OR de Prisma
  if (searchTerm) {
    where.OR = [
      {
        // Buscar en el título
        title: {
          contains: searchTerm,
        },
      },
      {
        // Buscar en el campo de color
        color: {
          contains: searchTerm,
        },
      },
    ];
  }

  try {
    const products = await prisma.product.findMany({
      where: where, // Aplica el filtro OR
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error al buscar productos:", error);
    // Asegúrate de que este catch devuelva un 500 para evitar que el frontend falle
    return NextResponse.json(
      { error: "Error interno del servidor al buscar productos" },
      { status: 500 }
    );
  }
}



// POST → crear producto
export async function POST(req: Request) {
  const body = await req.json();
  const newProduct = await prisma.product.create({
    data: {
      title: body.title,
      price: body.price,
      color: body.color,
      stock: body.stock,
      image: body.image,
    },
  });
  return NextResponse.json(newProduct);
}


// DELETE → eliminar producto
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json(
      { error: "Producto ID no proporcionado" },
      { status: 400 }
    );
  }

  try {
    const deletedProduct = await prisma.product.delete({
      where: { id: parseInt(id) }, // Convertimos el ID a número entero
    });

    return NextResponse.json(deletedProduct);
  } catch (error) {
    return NextResponse.json(
      { error: "Producto no encontrado" },
      { status: 404 }
    );
  }
}

// PATCH actualiza/descuenta stock
export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, cantidad } = body;

    if (!id || !cantidad) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    // Buscar producto actual
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Verificar stock disponible
    if (product.stock < cantidad) {
      return NextResponse.json(
        { error: "Stock insuficiente" },
        { status: 400 }
      );
    }

    // Descontar stock
    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        stock: product.stock - cantidad,
      },
    });

    // Responder con el producto actualizado
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error PATCH:", error);
    return NextResponse.json(
      { error: "Error al actualizar stock" },
      { status: 500 }
    );
  }
}
