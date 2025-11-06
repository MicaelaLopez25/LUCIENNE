import { test, expect } from "@playwright/test";

test.describe("PATCH /api/products", () => {
  test("debería descontar stock correctamente", async ({ request }) => {
    // Creamos un producto con stock
    const createRes = await request.post("/api/products", {
      data: {
        title: "Producto con stock",
        color: "Verde",
        price: 12000,
        stock: 10,
      },
    });
    const product = await createRes.json();

    // Enviamos PATCH
    const patchRes = await request.patch("/api/products", {
      data: { id: product.id, cantidad: 3 },
    });

    expect(patchRes.ok()).toBeTruthy();

    const updated = await patchRes.json();
    expect(updated.stock).toBe(product.stock - 3);
  });

  test("debería devolver error si falta ID o cantidad", async ({ request }) => {
    const res = await request.patch("/api/products", {
      data: { id: null, cantidad: 2 },
    });
    expect(res.status()).toBe(400);
  });
});
