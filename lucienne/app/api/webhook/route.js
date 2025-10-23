// Este controlador estará dentro de la ruta: /api/webhook

import { NextResponse } from "next/server";
import mercadopago from "mercadopago";
import prisma from "@/lib/prisma";

// Configuración de Mercado Pago
mercadopago.configure({
  access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

export async function POST(request) {
  // Mercado Pago envía la información CRÍTICA en los parámetros de búsqueda (query)
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const dataId = searchParams.get("data.id"); // ID de la notificación

  try {
    // Solo procesamos si es una notificación de pago y tiene un ID de datos
    if (type === "payment" && dataId) {
      // --- 1. Consultar a Mercado Pago para obtener el estado oficial ---
      const paymentResponse = await mercadopago.payment.findById(dataId);
      const paymentData = paymentResponse.body;

      const status = paymentData.status;
      const mpPaymentId = paymentData.id.toString();
      const orderId = parseInt(paymentData.external_reference);

      // --- 2. Verificar el estado y actualizar la BD (Prisma) ---
      if (status === "approved") {
        console.log(
          `✅ Pago APROBADO ID: ${mpPaymentId}. Actualizando pedido ${orderId}`
        );

        // CRITERIO CUMPLIDO: El pedido solo se procesa si el pago fue aprobado
        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "APPROVED", // Cambia el estado
            paymentId: mpPaymentId, // Guarda el ID de MP
          },
        });

        // Aquí iría tu lógica de negocio final (ej. enviar email, descontar stock de productos relacionados)
      } else if (status === "pending") {
        // Actualizar a pendiente si lo consideras necesario
        console.log(
          `🟡 Pago PENDIENTE ID: ${mpPaymentId}. Revisar estado más tarde.`
        );
      } else {
        console.log(
          `❌ Pago RECHAZADO ID: ${mpPaymentId}. No actualizar pedido.`
        );
      }
    }

    // Es CRÍTICO retornar un 200 o 204 a Mercado Pago
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error en Webhook o al actualizar DB:", error);
    return new NextResponse(null, { status: 500 });
  }
}

// Para cumplir con requisitos de Next.js, también puedes definir la función GET si es necesaria
export function GET(request) {
  return POST(request);
}
