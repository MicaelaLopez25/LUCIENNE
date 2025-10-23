// Este controlador estará dentro de la ruta: /api/checkout

import { NextResponse } from 'next/server';
import mercadopago from 'mercadopago';
import prisma from '@/lib/prisma'; // Asumo que tienes tu instancia de prisma en @/lib/prisma

// 1. Configuración de Mercado Pago (se hace aquí o globalmente)
mercadopago.configure({
    access_token: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

// Ruta POST para crear la preferencia de pago
export async function POST(request) {
    try {
        const body = await request.json();
        
        // --- 1. Crear el pedido en estado PENDIENTE en tu BD (Prisma) ---
        const newOrder = await prisma.order.create({
            data: {
                total: body.total, // Asegúrate de recibir el total del carrito
                // status: "PENDING" (usará el default)
                // Aquí podrías guardar una referencia al carrito o usuario
            },
        });

        // --- 2. Crear la preferencia en Mercado Pago ---
        const HOST_URL = process.env.NEXT_PUBLIC_HOST_URL || 'http://localhost:3000';

        const preference = await mercadopago.preferences.create({
            items: body.items, // Items del carrito de compra
            back_urls: {
                success: `${HOST_URL}/success`, // URL de tu frontend
                failure: `${HOST_URL}/failure`,
                pending: `${HOST_URL}/pending`,
            },
            // CRÍTICO: El webhook apunta a tu otra ruta de Next.js
            notification_url: `${HOST_URL}/api/webhook?order_id=${newOrder.id}`, 
            // Usamos tu ID de pedido como external_reference para identificarlo luego
            external_reference: newOrder.id.toString(), 
            auto_return: 'approved',
        });

        // Retorna la URL de pago para que el frontend redirija
        return NextResponse.json({ init_point: preference.body.init_point });

    } catch (error) {
        console.error("Error al crear la preferencia:", error);
        return NextResponse.json({ message: "Error al crear la orden", error: error.message }, { status: 500 });
    }
}