const REPO = "test-repo-1";
const USER = "github-username";

import { test, expect } from "@playwright/test";

// Test para crear y verificar un producto en la API
test("test sobre la api de products", async ({ request }) => {
  // Datos del nuevo producto
  const productData = {
    title: "Nueva Pijama de Prueba",
    price: 15000,
    color: "azul",
    stock: 50,
    image: "nueva/pijama/azul.jpg",
  };

  // Realiza la solicitud POST para crear el producto
  const newProductResponse = await request.post(`/api/products`, {
    data: productData,
  });

  // Asegura que la solicitud POST fue exitosa (código 201 Created)
  expect(newProductResponse.ok()).toBeTruthy();

  // Convierte la respuesta a JSON
  const newProduct = await newProductResponse.json();
  // Asegura que los datos del producto creado coinciden con los enviados
  expect(newProduct).toEqual(
    expect.objectContaining({
      title: productData.title,
      price: productData.price,
      color: productData.color,
      stock: productData.stock,
      image: productData.image,
    })
  );

  // Opcional: Verifica si el producto recién creado aparece en la lista de productos
  const productsListResponse = await request.get(`/api/products`);
  expect(productsListResponse.ok()).toBeTruthy();
  const productsList = await productsListResponse.json();

  // Asegura que el producto creado se encuentra en la lista de todos los productos
  expect(productsList).toContainEqual(
    expect.objectContaining({
      title: productData.title,
    })
  );
});
