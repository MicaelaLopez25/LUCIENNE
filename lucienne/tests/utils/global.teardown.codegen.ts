import { prisma } from "../../lib/prisma";

async function globalTeardown() {
  console.log("Ejecutando globalTeardown: Limpiando entorno de pruebas...");

  try {
    await prisma.product.deleteMany();
    console.log("Datos de prueba eliminados correctamente.");
  } catch (error) {
    console.log("ha ocurrido un error", error);
  }
  // Limpia los datos de prueba para evitar residuos.
}

export default globalTeardown;
