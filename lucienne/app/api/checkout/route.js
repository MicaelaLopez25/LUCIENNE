import { NextResponse } from "next/server";
import mercadopago from "mercadopago";
import { prisma } from "@/lib/prisma"; // Importación nombrada de Prisma (correcto)

// Ruta POST para crear la preferencia de pago
export async function POST(request) {
  // --- Inicialización de Mercado Pago (Dentro de la función) ---
  const mpConfig = new mercadopago.MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
  });

  const preferenceClient = new mercadopago.Preference(mpConfig);
  // -----------------------------------------------------------

  try {
    const body = await request.json();

    // --- 1. Crear el pedido en estado PENDIENTE en tu BD (Prisma) ---
    const newOrder = await prisma.order.create({
      data: {
        total: body.total, // Asegúrate de recibir el total del carrito
        // status: "PENDING" (usará el default si está definido en tu esquema)
        // Aquí podrías guardar una referencia al carrito o usuario
      },
    });

    // --- 2. Crear la preferencia en Mercado Pago ---
    const HOST_URL =
      process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000";

    // Usamos 'preferenceClient' en lugar de 'mercadopago.preferences'
    const preference = await preferenceClient.create({ 
      body: {
        items: body.items, // Items del carrito de compra
        back_urls: {
          success: `${HOST_URL}/success`, // URL de tu frontend
          failure: `${HOST_URL}/failure`,
          pending: `${HOST_URL}/pending`,
        },
        // CRÍTICO: El webhook apunta a tu otra ruta de Next.js
        // Pasamos el ID del pedido como query parameter
        notification_url: `${HOST_URL}/api/webhook?order_id=${newOrder.id}`, 
        // Usamos tu ID de pedido como external_reference para identificarlo luego
        external_reference: newOrder.id.toString(),
        auto_return: "approved",
      }
    });

    // Retorna la URL de pago para que el frontend redirija
    return NextResponse.json({ init_point: preference.init_point });
  } catch (error) {
    console.error("Error al crear la preferencia:", error);
    return NextResponse.json(
      { message: "Error al crear la orden", error: error.message },
      { status: 500 }
    );
  }
}
