import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET → listar productos
export async function GET() {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
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
