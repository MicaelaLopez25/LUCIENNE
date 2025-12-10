import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";


export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // 1. Validar campos
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    // 2. Validar contraseña segura
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!regex.test(password)) {
      return NextResponse.json(
        { error: "La contraseña debe tener 8 caracteres, una mayúscula y un número" },
        { status: 400 }
      );
    }

    // 3. Validar si el email existe
    const userExists = await prisma.user.findUnique({
      where: { email }
    });

    if (userExists) {
      return NextResponse.json(
        { error: "El email ya está registrado" },
        { status: 409 }
      );
    }

    // 4. Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Crear usuario en BD
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "cliente"
      }
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
