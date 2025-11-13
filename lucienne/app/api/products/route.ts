import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET → listar productos con búsqueda en título Y color
export async function GET(req: Request) {
  const url = new URL(req.url);
  const searchTerm = url.searchParams.get("search") || "";

  let where: any = {};

  if (searchTerm) {
    where.OR = [
      {
        title: {
          contains: searchTerm,
        },
      },
      {
        color: {
          contains: searchTerm,
        },
      },
    ];
  }

  try {
    const products = await prisma.product.findMany({
      where: where,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error al buscar productos:", error);
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
      where: { id: parseInt(id) },
    });

    return NextResponse.json(deletedProduct);
  } catch (error) {
    return NextResponse.json(
      { error: "Producto no encontrado" },
      { status: 404 }
    );
  }
}

// *** FUNCIÓN CRÍTICA PARA EL DESCUENTO DE STOCK ***
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    let { id, cantidad } = body;

    // Convertir a número siempre (esto ya lo hacías, ¡excelente!)
    const numericId = Number(id);
    const numericCantidad = Number(cantidad);

    // Validación correcta
    if (isNaN(numericId) || isNaN(numericCantidad)) {
      return NextResponse.json(
        { error: "ID o cantidad inválidos" },
        { status: 400 }
      );
    }

    // Buscar producto
    const product = await prisma.product.findUnique({
      where: { id: numericId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    // Chequear stock
    if (product.stock < numericCantidad) {
      return NextResponse.json(
        { error: "Stock insuficiente" },
        { status: 400 }
      );
    }

    // Actualizar stock
    const updated = await prisma.product.update({
      where: { id: numericId },
      data: {
        stock: product.stock - numericCantidad,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error PATCH en la API:", error);
    // Aseguramos que cualquier error de Prisma devuelva un 500
    return NextResponse.json(
      { error: "Error interno del servidor al actualizar stock" },
      { status: 500 }
    );
  }
}
