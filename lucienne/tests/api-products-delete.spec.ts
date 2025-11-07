import { test, expect } from "@playwright/test";

test.describe("DELETE /api/products", () => {
  test("debería eliminar un producto existente", async ({ request }) => {
    // primero creamos un producto temporal
    const createRes = await request.post("/api/products", {
      data: {
        title: "Producto temporal",
        color: "Azul",
        price: 5000,
        stock: 10,
      },
    });
    const created = await createRes.json();

    // eliminamos por ID
    const deleteRes = await request.delete(`/api/products?id=${created.id}`);
    expect(deleteRes.ok()).toBeTruthy();

    const deleted = await deleteRes.json();
    expect(deleted.id).toBe(created.id);
  });

  test("debería devolver 400 si no se pasa ID", async ({ request }) => {
    const res = await request.delete("/api/products");
    expect(res.status()).toBe(400);
  });
});
