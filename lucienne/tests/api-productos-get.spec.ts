import { test, expect } from "@playwright/test";

test.describe("GET /api/products", () => {
  test("debería listar productos sin filtro", async ({ request }) => {
    const response = await request.get("/api/products");
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test("debería buscar productos por título o color", async ({ request }) => {
    const searchTerm = "rojo"; // cambia según tus datos
    const response = await request.get(`/api/products?search=${searchTerm}`);
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
    // si hay resultados, al menos uno debe coincidir
    if (data.length > 0) {
      expect(
        data.some(
          (p: any) =>
            p.title.toLowerCase().includes(searchTerm) ||
            p.color.toLowerCase().includes(searchTerm)
        )
      ).toBeTruthy();
    }
  });
});
