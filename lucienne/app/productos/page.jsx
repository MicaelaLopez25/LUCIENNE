"use client";

import { useEffect, useState, useCallback } from "react";
import "./productos.css";
import { useSearch } from "../../components/SearchContext";

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [selectedColors, setSelectedColors] = useState({});
  const { searchTerm } = useSearch();

  // --- GET productos (con búsqueda) ---
  const fetchData = useCallback(async (term) => {
    const url = term
      ? `/api/products?search=${encodeURIComponent(term)}`
      : "/api/products";

    try {
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  }, []);

  useEffect(() => {
    fetchData(searchTerm);
  }, [searchTerm, fetchData]);

  // --- Selección de color (Se mantiene, solo para marcar visualmente si lo deseas) ---
  const handleColorSelect = (productId, color) => {
    setSelectedColors((prev) => ({
      ...prev,
      [productId]: color,
    }));
  };

  // --- COMPRAR (PATCH) ---
  const handleBuy = async (productId) => {
    // *** CORRECCIÓN: Quitamos el console.log para limpiar el código
    const numericId = Number(productId);

    try {
      const producto = productos.find(
        (p) => Number(p.id) === Number(productId)
      );
      if (!producto) return;

      // 🛑 ELIMINAMOS TODA LA LÓGICA DE VALIDACIÓN DE COLOR AQUÍ:
      // Si la intención es que el color no afecte la compra, ya no necesitamos:
      /*
      const validColors = producto.color
        ? producto.color
            .split(",")
            .map((c) => c.trim())
            .filter((c) => c.length > 0)
        : [];

      const hasColors = validColors.length > 0;
      const selectedColor = selectedColors[producto.id]; 

      if (hasColors && !selectedColor) {
        alert("Por favor, selecciona un color antes de comprar.");
        return;
      }
      */
      // ------------------------------------------------------------------------

      if (producto.stock <= 0) {
        alert("Este producto está agotado.");
        return;
      }

      // --- LLAMADA PATCH ---
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          id: numericId, // Usamos el ID numérico para la API
          cantidad: 1,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Error al comprar");
        return;
      }

      const updated = await res.json();

      // Actualizar estado local
      setProductos((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );

      alert("Compra realizada correctamente");
    } catch (error) {
      console.error("Error en handleBuy:", error);
      alert("Error de conexión");
    }
  };

  // --- ELIMINAR (Sin cambios) ---
  const handleDelete = async (productId) => {
    if (!confirm("¿Eliminar producto?")) return;
    try {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: "DELETE",
        cache: "no-store",
      });
      if (res.ok) {
        setProductos((prev) => prev.filter((p) => p.id !== productId));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="productos-container">
      <h1>PRODUCTOS</h1>

      {searchTerm && <h2>Resultados: "{searchTerm}"</h2>}

      <section className="productos-grid">
        {productos.length === 0 && (
          <p>
            {searchTerm
              ? `No se encontraron productos para "${searchTerm}".`
              : "No hay productos disponibles."}
          </p>
        )}

        {productos.map((p) => {
          const validColors = p.color
            ? p.color
                .split(",")
                .map((c) => c.trim())
                .filter((c) => c.length > 0)
            : [];
          const hasColors = validColors.length > 0;
          const currentSelectedColor = selectedColors[p.id];

          return (
            <div
              key={p.id}
              className={`producto-card ${p.stock <= 0 ? "agotado" : ""}`}
            >
              <button onClick={() => handleDelete(p.id)} className="delete-btn">
                &times;
              </button>

              <img src={p.image} alt={p.title} className="producto-img" />

              <div className="producto-info">
                <h2 className="producto-titulo">{p.title}</h2>

                {/* La selección de color se mantiene, pero solo a nivel visual */}
                {hasColors && (
                  <div className="color-selector">
                    <p className="color-label">COLORES:</p>
                    <div className="color-options">
                      {validColors.map((color) => (
                        <button
                          key={color}
                          className={`color-btn ${
                            currentSelectedColor === color ? "selected" : ""
                          }`}
                          onClick={() => handleColorSelect(p.id, color)}
                        >
                          {color.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <p className="producto-precio">
                  ${p.price.toLocaleString("es-AR")}
                </p>
              </div>

              <div className="producto-stock">CANTIDAD: {p.stock}</div>

              <button
                className="agregar-carrito-btn"
                onClick={() => handleBuy(p.id)}
                // ✅ ÚNICA VALIDACIÓN: Solo se deshabilita si el stock es 0 o menos.
                disabled={p.stock <= 0}
                data-testid={`buy-btn-${p.id}`}
              >
                {p.stock > 0 ? "Comprar" : "Agotado"}
              </button>
            </div>
          );
        })}
      </section>
    </div>
  );
}
