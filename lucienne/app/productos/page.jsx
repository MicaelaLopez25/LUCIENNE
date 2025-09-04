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
          </div>
        ))}
      </section>
    </div>
  );
}
