import { test, expect } from "@playwright/test";

test.describe("POST /api/products", () => {
  test("debería crear un nuevo producto", async ({ request }) => {
    const newProduct = {
      title: "Zapatilla de prueba",
      color: "Negro",
      price: 19999,
      stock: 5,
    };

    const response = await request.post("/api/products", {
      data: newProduct,
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.title).toBe(newProduct.title);
    expect(data.color).toBe(newProduct.color);
    expect(data.stock).toBe(newProduct.stock);
  });
});
