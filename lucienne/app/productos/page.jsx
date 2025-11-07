// app/productos/page.jsx (Versión Final Simplificada)

"use client";

import { useEffect, useState, useCallback } from "react";
import "./productos.css";
import { ShoppingCart } from "lucide-react";
import { useSearch } from "../../components/SearchContext"; // Asegura la ruta correcta

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [selectedColors, setSelectedColors] = useState({}); 
  const { searchTerm } = useSearch(); // Solo necesitamos el searchTerm

  // fetchData ahora solo depende del searchTerm
  const fetchData = useCallback(async (term) => {
    // 💡 La URL solo necesita el parámetro 'search'
    const url = term
      ? `/api/products?search=${encodeURIComponent(term)}`
      : "/api/products";

    try {
      const res = await fetch(url);
      const data = await res.json();
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  }, []);

  // Efecto que se ejecuta al montar y CADA VEZ que cambia 'searchTerm'
  useEffect(() => {
    fetchData(searchTerm);
    // Nota: Eliminamos globalColorFilter de las dependencias.
  }, [searchTerm, fetchData]); 
  
  // 💡 Función para seleccionar un color (solo para la compra, no para el filtro)
  const handleColorSelect = (productId, color) => {
    setSelectedColors(prev => ({
      ...prev,
      [productId]: color, 
    }));
  };

  // --- handleBuy y handleDelete se mantienen sin cambios ---
  const handleBuy = async (productId) => {
    try {
      const producto = productos.find((p) => p.id === productId);
      const selectedColor = selectedColors[productId];
      const hasColors = producto.color && producto.color.split(',').map(c => c.trim()).filter(c => c.length > 0).length > 0;
      
      if (!producto) return;
      if (hasColors && !selectedColor) {
         alert("Por favor, selecciona un color antes de comprar.");
         return;
      }
      if (producto.stock <= 0) {
        alert("Este producto está agotado y no puede comprarse.");
        return;
      }

      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, cantidad: 1 }),
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

  const handleDelete = async (productId) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) return;
    try {
      const res = await fetch(`/api/products?id=${productId}`, { method: "DELETE" });
      if (res.ok) {
        setProductos(productos.filter((p) => p.id !== productId));
      } else {
        console.error("Error al eliminar el producto");
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };
  // --- FIN DE FUNCIONES ---

  return (
    <div className="productos-container">
      <h1>PRODUCTOS</h1>

      {/* 💡 Se elimina el bloque de filtro global de color */}

      {searchTerm && <h2>Resultados de la búsqueda: "{searchTerm}"</h2>}

      <section className="productos-grid">
        {productos.length === 0 && (
          <p>
            {searchTerm
              ? `No se encontraron productos que coincidan con "${searchTerm}".`
              : "No hay productos disponibles."}
          </p>
        )}

        {productos.map((p) => {
          const colors = p.color ? p.color.split(',').map(c => c.trim()).filter(c => c.length > 0) : [];
          const currentSelectedColor = selectedColors[p.id];
          const hasColors = colors.length > 0;
          
          return (
            <div
              key={p.id}
              className={`producto-card ${p.stock <= 0 ? "agotado" : ""}`}
            >
              <button onClick={() => handleDelete(p.id)} className="delete-btn">
                &times;
              </button>

              <img src={`${p.image}`} alt={p.title} className="producto-img" />

              <div className="producto-info">
                <h2 className="producto-titulo">{p.title}</h2>
                {hasColors && (
                    <div className="color-selector">
                        <p className="color-label">COLORES:</p>
                        <div className="color-options">
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    className={`color-btn ${currentSelectedColor === color ? 'selected' : ''}`}
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