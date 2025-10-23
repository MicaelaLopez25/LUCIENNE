"use client";

import { useEffect, useState } from "react";
import "./productos.css";
import { ShoppingCart } from "lucide-react";

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProductos(data);
      console.log(data);
    };
    fetchData();
  }, []);

  // 🚨 FUNCIÓN MODIFICADA: Ahora inicia la transacción con Mercado Pago
  const handleBuy = async (productId) => {
    const producto = productos.find((p) => p.id === productId);

    if (!producto || producto.stock <= 0) {
      alert(
        producto ? "Este producto está agotado." : "Producto no encontrado."
      );
      return;
    }

    // 1. Prepara los datos en el formato que Mercado Pago espera (Array de Items)
    const itemsMP = [
      {
        id: producto.id.toString(),
        title: producto.title,
        description: `Compra del producto: ${producto.title}`,
        unit_price: producto.price,
        currency_id: "ARS", // Ajusta la moneda si es necesario (ej: "MXN", "PEN")
        quantity: 1, // Asumimos la compra de 1 unidad por el momento
      },
    ];

    // 2. Llama a la ruta de Checkout que creamos
    try {
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: itemsMP,
          total: producto.price, // Pasa el total de la compra (simple por ahora)
        }),
      });

      if (checkoutRes.ok) {
        const data = await checkoutRes.json();

        // 3. Redirige al cliente al portal de pago de Mercado Pago
        const initPoint = data.init_point;

        if (initPoint) {
          window.location.href = initPoint; // Redirección
        } else {
          alert("No se pudo obtener la URL de pago de Mercado Pago.");
        }
      } else {
        const error = await checkoutRes.json();
        console.error("Error en /api/checkout:", error);
        alert("Error al iniciar el pago. Intenta más tarde.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor de pago.");
    }
  };
  // 🚨 FIN DE FUNCIÓN MODIFICADA

  // --- La función handleDelete permanece igual ---
  const handleDelete = async (productId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }
    // ... tu lógica de fetch DELETE ...
    try {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProductos(productos.filter((p) => p.id !== productId));
        console.log("Producto eliminado exitosamente");
      } else {
        console.error("Error al eliminar el producto");
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };
  // --- Fin de handleDelete ---

  return (
    <div className="productos-container">
      <h1>PRODUCTOS</h1>
      <section className="productos-grid">
        {productos.map((p) => (
          <div
            key={p.id}
            className={`producto-card ${p.stock <= 0 ? "agotado" : ""}`}
          >
            {/* ... JSX anterior (imagen, título, precio, stock) ... */}

            <button onClick={() => handleDelete(p.id)} className="delete-btn">
              &times;
            </button>
            <img src={`${p.image}`} alt={p.title} className="producto-img" />
            <div className="producto-info">
              <h2 className="producto-titulo">{p.title}</h2>
              <p className="producto-precio">
                ${p.price.toLocaleString("es-AR")}
              </p>
            </div>
            <div className="producto-stock">CANTIDAD: {p.stock}</div>

            <button
              className="agregar-carrito-btn"
              onClick={() => handleBuy(p.id)} // Llama a la nueva función de pago
              disabled={p.stock <= 0}
            >
              {p.stock > 0 ? "Pagar con MP" : "Agotado"}
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
