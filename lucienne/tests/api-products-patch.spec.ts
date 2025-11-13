import { test, expect } from "@playwright/test";

// URL base de tu API (ajusta si es necesario)
const BASE_URL = "http://localhost:3000/api/products";

// Datos para crear un producto de prueba
const newProductData = {
  title: "Camiseta de Prueba Stock",
  price: 25.0,
  color: "rojo",
  stock: 50,
  image: "test-image.jpg",
};

test.describe("API /api/products - PATCH (Descuento de Stock)", () => {
  let createdProductId: number;

  // 1. Antes de cada test: Crear un producto inicial para operar
  test.beforeEach(async ({ request }) => {
    // Usamos POST para crear un producto con stock conocido
    const postResponse = await request.post(BASE_URL, {
      data: newProductData,
    });
    expect(postResponse.ok()).toBeTruthy();
    const product = await postResponse.json();
    createdProductId = product.id; // Guardamos el ID para usarlo en el PATCH y limpieza

    // Verificación inicial de stock (opcional pero buena práctica)
    expect(product.stock).toBe(newProductData.stock);
  });

  // 2. Después de cada test: Limpiar el producto creado
  test.afterEach(async ({ request }) => {
    // Usamos DELETE para limpiar la base de datos
    const deleteResponse = await request.delete(
      `${BASE_URL}?id=${createdProductId}`
    );
    expect(deleteResponse.ok()).toBeTruthy();
  });

  // --- Casos de Éxito ---

  test("debe descontar el stock correctamente y devolver el producto actualizado", async ({
    request,
  }) => {
    const amountToDeduct = 10;
    const expectedStock = newProductData.stock - amountToDeduct;

    // Ejecutar la función crítica PATCH
    const patchResponse = await request.patch(BASE_URL, {
      data: {
        id: createdProductId,
        cantidad: amountToDeduct,
      },
    });

    // 1. Verificar el código de estado
    expect(patchResponse.ok()).toBeTruthy();
    expect(patchResponse.status()).toBe(200);

    const updatedProduct = await patchResponse.json();

    // 2. Verificar el stock actualizado en la respuesta
    expect(updatedProduct.stock).toBe(expectedStock);

    // 3. Verificación adicional con GET (para asegurar la persistencia en DB)
    const getResponse = await request.get(
      `${BASE_URL}?search=${newProductData.title}`
    );
    expect(getResponse.ok()).toBeTruthy();
    const productsList = await getResponse.json();
    const productInDB = productsList.find(
      (p: any) => p.id === createdProductId
    );

    expect(productInDB).toBeDefined();
    expect(productInDB.stock).toBe(expectedStock);
  });

  // --- Casos de Error ---

  test("debe fallar con 400 y mensaje de stock insuficiente", async ({
    request,
  }) => {
    const amountToDeduct = newProductData.stock + 1; // Mayor que el stock disponible

    // Ejecutar PATCH con stock excesivo
    const patchResponse = await request.patch(BASE_URL, {
      data: {
        id: createdProductId,
        cantidad: amountToDeduct,
      },
    });

    // 1. Verificar el código de estado 400
    expect(patchResponse.status()).toBe(400);

    const errorBody = await patchResponse.json();

    // 2. Verificar el mensaje de error
    expect(errorBody.error).toBe("Stock insuficiente");

    // 3. Verificar que el stock no haya cambiado (opcional, pero clave)
    const getResponse = await request.get(
      `${BASE_URL}?search=${newProductData.title}`
    );
    const productsList = await getResponse.json();
    const productInDB = productsList.find(
      (p: any) => p.id === createdProductId
    );
    expect(productInDB.stock).toBe(newProductData.stock);
  });

  test("debe fallar con 404 si el ID no existe", async ({ request }) => {
    const nonExistentId = 999999;

    const patchResponse = await request.patch(BASE_URL, {
      data: {
        id: nonExistentId,
        cantidad: 1,
      },
    });

    // 1. Verificar el código de estado 404
    expect(patchResponse.status()).toBe(404);

    const errorBody = await patchResponse.json();

    // 2. Verificar el mensaje de error
    expect(errorBody.error).toBe("Producto no encontrado");
  });

  test("debe fallar con 400 si se envían datos inválidos (ID no numérico)", async ({
    request,
  }) => {
    const patchResponse = await request.patch(BASE_URL, {
      data: {
        id: "abc", // ID inválido
        cantidad: 1,
      },
    });

    expect(patchResponse.status()).toBe(400);
    const errorBody = await patchResponse.json();
    expect(errorBody.error).toBe("ID o cantidad inválidos");
  });
});
