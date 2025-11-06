// app/productos/page.jsx

"use client";

import { useEffect, useState, useCallback } from "react";
import "./productos.css";
import { ShoppingCart } from "lucide-react"; // icono carrito
import { useSearch } from "../../components/SearchContext";

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  // 💡 ESTADO NUEVO: Rastrear el color seleccionado por producto
  const [selectedColors, setSelectedColors] = useState({});

  const { searchTerm } = useSearch();

  const fetchData = useCallback(async (term) => {
    // 💡 Construir la URL con el término de búsqueda
    const url = term
      ? `/api/products?search=${encodeURIComponent(term)}`
      : "/api/products";

    try {
      const res = await fetch(url);
      const data = await res.json();
      setProductos(data);
      console.log(data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  }, []);

  // Efecto para fetch/filtrado
  useEffect(() => {
    fetchData(searchTerm);
  }, [searchTerm, fetchData]);

  // 💡 FUNCIÓN NUEVA: Actualiza el estado del color seleccionado
  const handleColorSelect = (productId, color) => {
    setSelectedColors((prev) => ({
      ...prev,
      [productId]: color, // Asigna el color al ID del producto
    }));
  };

  // --- FUNCIONALIDAD EXISTENTE: handleBuy (Añadiendo validación de color) ---
  const handleBuy = async (productId) => {
    try {
      const producto = productos.find((p) => p.id === productId);
      const selectedColor = selectedColors[productId]; // Obtener el color seleccionado

      if (!producto) return;

      // Asume que si el producto tiene un campo 'color' lleno, requiere selección
      const hasColors = producto.color && producto.color.length > 0;

      // ⚠️ VALIDACIÓN DE COLOR
      if (hasColors && !selectedColor) {
        alert("Por favor, selecciona un color antes de comprar.");
        return;
      }

      if (producto.stock <= 0) {
        alert("Este producto está agotado y no puede comprarse.");
        return;
      }

      // El resto de tu lógica de PATCH sigue igual:
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: productId,
          cantidad: 1,
          // Opcional: Si tu backend necesita saber el color:
          // color: selectedColor
        }),
      });

      if (res.ok) {
        const updated = await res.json();
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

      {searchTerm && <h2>Resultados para: "{searchTerm}"</h2>}

      <section className="productos-grid">
        {productos.length === 0 && (
          <p>
            {searchTerm
              ? `No se encontraron productos que coincidan con "${searchTerm}".`
              : "No hay productos disponibles."}
          </p>
        )}

        {productos.map((p) => {
          // 💡 Lógica para dividir el string de colores
          const colors = p.color
            ? p.color
                .split(",")
                .map((c) => c.trim())
                .filter((c) => c.length > 0)
            : [];
          const currentSelectedColor = selectedColors[p.id];
          const hasColors = colors.length > 0;

          return (
            <div
              key={p.id}
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
                {/* 💡 BLOQUE DE SELECCIÓN DE COLORES */}
                {hasColors && (
                  <div className="color-selector">
                    <p className="color-label">COLORES:</p>
                    <div className="color-options">
                      {colors.map((color) => (
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

              {/* --- CAMPO DE STOCK AGREGADO --- */}
              <div className="producto-stock">CANTIDAD: {p.stock}</div>

              <button
                className="agregar-carrito-btn"
                onClick={() => handleBuy(p.id)}
                // Deshabilitar si está agotado O si tiene colores pero ninguno ha sido seleccionado
                disabled={p.stock <= 0 || (hasColors && !currentSelectedColor)}
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
