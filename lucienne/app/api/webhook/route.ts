import { NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { prisma } from "@/lib/prisma";

// Tipamos el request explícitamente como `Request`
export async function POST(request: Request): Promise<NextResponse> {
  // --- Inicialización de Mercado Pago ---
  const mpConfig = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
  });

  const paymentClient = new Payment(mpConfig);
  // --------------------------------------

  // Obtenemos los parámetros enviados por Mercado Pago
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const dataId = searchParams.get("data.id"); // ID de la notificación
  const orderIdFromQuery = searchParams.get("order_id"); // order_id agregado en tu preferencia

  try {
    // Solo procesamos si es una notificación de pago y contiene un ID
    if (type === "payment" && dataId) {
      // --- 1. Consultar a Mercado Pago para obtener datos del pago ---
      const paymentData = await paymentClient.get({ id: dataId });

      const status = paymentData.status as string;
      const mpPaymentId = paymentData.id?.toString() || "";

      const orderId = parseInt(
        paymentData.external_reference || orderIdFromQuery || ""
      );

      if (!orderId) {
        console.error("❌ Order ID no encontrado en la notificación.");
        return new NextResponse("Order ID no encontrado", { status: 400 });
      }

      // --- 2. Actualizar la base de datos según el estado del pago ---
      if (status === "approved") {
        console.log(`✅ Pago APROBADO ID: ${mpPaymentId}. Pedido ${orderId}`);

        await prisma.order.update({
          where: { id: orderId },
          data: {
            status: "APPROVED",
            paymentId: mpPaymentId,
          },
        });

        // Aquí podrías agregar lógica adicional:
        // enviar email, descontar stock, registrar logs, etc.
      } else if (status === "pending") {
        console.log(`🟡 Pago PENDIENTE ID: ${mpPaymentId}.`);
      } else {
        console.log(`❌ Pago RECHAZADO ID: ${mpPaymentId}.`);
      }
    }

    // Mercado Pago requiere una respuesta 200 o 204 siempre
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("Error en Webhook o al actualizar DB:", error);
    return new NextResponse(error.message, { status: 500 });
  }
}

// En caso de que Mercado Pago haga GET al webhook
export function GET(request: Request): Promise<NextResponse> {
  return POST(request);
}
