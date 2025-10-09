import { prisma } from "../../lib/prisma";

async function globalSetup() {
  console.log("Ejecutando globalSetup: Inicializando entorno de pruebas...");

  // 1. Limpia la base de datos existente.
  await prisma.product.deleteMany();
  // 2. Inserta datos de prueba.
  await prisma.product.createMany({
    data: [
      {
        title: "pijamadelanda",
        price: 120000,
        color: "azul",
        stock: 1,
        image: "jdsfj",
      },
    ],
  });

  console.log("Datos de prueba insertados correctamente.");
}

export default globalSetup;
