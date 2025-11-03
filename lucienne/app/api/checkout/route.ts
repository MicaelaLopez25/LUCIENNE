import { NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { prisma } from "@/lib/prisma";
import * as z from "zod";

const EsquemaDeLaOrdenCompra = z.object({
  nombre_del_producto: z.string(),
  precio_del_producto: z.number(), // mejor usar number en vez de float32
});

type OrdenDeCompra = z.infer<typeof EsquemaDeLaOrdenCompra>;

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orden_de_compra = parsear_orden_de_compra(body);

    const ordenDeCompraRegistrada = await registrar_orden_de_compra(
      orden_de_compra
    );

    const HOST_URL =
      process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000";

    const preferenceData = {
      items: [
        {
          id: ordenDeCompraRegistrada.id.toString(), // ✅ agregado
          title: orden_de_compra.nombre_del_producto,
          quantity: 1,
          unit_price: orden_de_compra.precio_del_producto,
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: `${HOST_URL}/success`,
        failure: `${HOST_URL}/failure`,
        pending: `${HOST_URL}/pending`,
      },
      notification_url: `${HOST_URL}/api/webhook?order_id=${ordenDeCompraRegistrada.id}`,
      external_reference: ordenDeCompraRegistrada.id.toString(),
      auto_return: "approved",
    };

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });

    return NextResponse.json({ init_point: result.init_point });
  } catch (error: any) {
    console.error("Error al crear la preferencia:", error);
    return NextResponse.json(
      { message: "Error al crear la orden", error: error.message },
      { status: 500 }
    );
  }
}

const parsear_orden_de_compra = (posible_orden: any): OrdenDeCompra => {
  try {
    return EsquemaDeLaOrdenCompra.parse(posible_orden);
  } catch (error) {
    throw Error("La orden no cumple con los datos necesarios.");
  }
};

const registrar_orden_de_compra = async (orden: OrdenDeCompra) => {
  try {
    return await prisma.order.create({
      data: { total: orden.precio_del_producto },
    });
  } catch (error) {
    throw Error("No se pudo registrar la orden de compra.");
  }
};
