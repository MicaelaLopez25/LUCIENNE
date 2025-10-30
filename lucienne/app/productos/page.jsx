"use client";

import { useEffect, useState } from "react";
import "./productos.css";
import { ShoppingCart } from "lucide-react"; // icono carrito (puedes usar react-icons también)

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/products"); // endpoint que ya hiciste
      const data = await res.json();
      setProductos(data);
      console.log(data);
    };
    fetchData();
  }, []);

  const handleBuy = async (productId) => {
    try {
      const producto = productos.find((p) => p.id === productId);
      if (!producto) return;

      if (producto.stock <= 0) {
        alert("Este producto está agotado y no puede comprarse.");
        return;
      }

      // 🔹 1. Crear la orden de pago con Mercado Pago
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: producto.title,
          price: producto.price,
        }),
      });

      const data = await res.json();
      if (data.init_point) {
        // 🔹 2. Redirigir al checkout de Mercado Pago
        window.location.href = data.init_point;
        return;
      } else {
        alert("No se pudo iniciar el pago con Mercado Pago.");
        return;
      }
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor o Mercado Pago");
    }
  };

  // --- FUNCIÓN NUEVA PARA ELIMINAR ---
  const handleDelete = async (productId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    try {
      // ANTES: fetch(`/api/products/${productId}`, ...
      // AHORA: La URL incluye el ID como un parámetro de consulta "?id="
      const res = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // La lógica para actualizar la UI no cambia
        setProductos(productos.filter((p) => p.id !== productId));
        console.log("Producto eliminado exitosamente");
      } else {
        console.error("Error al eliminar el producto");
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  // --- FIN DE LA FUNCIÓN ---

  return (
    <div className="productos-container">
      <h1>PRODUCTOS</h1>
      <section className="productos-grid">
        {productos.map((p) => (
          <div key={p.id} className="producto-card">
            {/* Icono carrito */}
            <div className="cart-icon">
              <ShoppingCart size={20} />
            </div>

            <div
              key={p.id}
              className={`producto-card ${p.stock <= 0 ? "agotado" : ""}`}
            >
              {/* --- BOTÓN DE ELIMINAR AGREGADO --- */}
              <button onClick={() => handleDelete(p.id)} className="delete-btn">
                &times; {/* Este es el símbolo de la "X" */}
              </button>

              {/* Imagen */}
              <img
                src={`${p.image}`} // ⚠️ asegúrate que las imágenes estén en /public
                alt={p.title}
                className="producto-img"
              />

              {/* Info */}
              <div className="producto-info">
                <h2 className="producto-titulo">{p.title}</h2>
                <p className="producto-precio">
                  ${p.price.toLocaleString("es-AR")}
                </p>
              </div>

              {/* --- CAMPO DE STOCK AGREGADO --- */}
              <div className="producto-stock">CANTIDAD: {p.stock}</div>

              <button
                className="agregar-carrito-btn"
                onClick={() => handleBuy(p.id)}
                disabled={p.stock <= 0}
              >
                {p.stock > 0 ? "Comprar" : "Agotado"}
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
