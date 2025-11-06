"use client";

import { useEffect, useState, useCallback } from "react";
import "./productos.css";
import { ShoppingCart } from "lucide-react"; // icono carrito (puedes usar react-icons también)
import { useSearch } from "../../components/SearchContext";

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);

  const { searchTerm } = useSearch();

  const fetchData = useCallback(async (term) => {
    // 💡 Construir la URL con el término de búsqueda, si existe
    const url = term
      ? `/api/products?search=${encodeURIComponent(term)}` // Usamos `search` en el query
      : "/api/products";

    try {
      const res = await fetch(url);
      const data = await res.json();
      setProductos(data);
      console.log(data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      // Opcional: mostrar un mensaje al usuario
    }
  }, []); // Dependencias vacías, solo se crea una vez

  // Efecto que se ejecuta al montar y CADA VEZ que cambia 'searchTerm'
  useEffect(() => {
    // 💡 Llamamos a fetchData con el término actual del contexto
    fetchData(searchTerm);
  }, [searchTerm, fetchData]); // Depende de `searchTerm` y `fetchData`

  // --- FUNCIONALIDAD EXISTENTE: handleBuy ---
  const handleBuy = async (productId) => {
    try {
      const producto = productos.find((p) => p.id === productId);
      if (!producto) return;
      if (producto.stock <= 0) {
        alert("Este producto está agotado y no puede comprarse.");
        return;
      }

      // PATCH para descontar 1 unidad (simulación de compra)
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, cantidad: 1 }),
      });

      if (res.ok) {
        const updated = await res.json();
        // 💡 Actualizamos el estado de productos
        setProductos((prev) =>
          prev.map((p) => (p.id === updated.id ? updated : p))
        );
        alert("Compra realizada correctamente ✅");
      } else {
        const error = await res.json();
        alert(error.error || "Error al comprar producto");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión con el servidor");
    }
  };

  // --- FUNCIONALIDAD EXISTENTE: handleDelete ---
  const handleDelete = async (productId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

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
  // --- FIN DE LA FUNCIÓN ---

  return (
    <div className="productos-container">
      <h1>PRODUCTOS</h1>

      {/* 💡 Muestra lo que se está buscando si hay un término */}
      {searchTerm && <h2>Resultados para: "{searchTerm}"</h2>}

      <section className="productos-grid">
        {/* 💡 Muestra mensaje si no hay resultados */}
        {productos.length === 0 && (
          <p>
            {searchTerm
              ? `No se encontraron productos que coincidan con "${searchTerm}".`
              : "No hay productos disponibles."}
          </p>
        )}

        {productos.map((p) => (
          <div
            key={p.id}
            // Mantenemos tu className existente
            className={`producto-card ${p.stock <= 0 ? "agotado" : ""}`}
          >
            {/* --- BOTÓN DE ELIMINAR AGREGADO --- */}
            <button onClick={() => handleDelete(p.id)} className="delete-btn">
              &times;
            </button>

            {/* Imagen */}
            <img src={`${p.image}`} alt={p.title} className="producto-img" />

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
        ))}
      </section>
    </div>
  );
}
