"use client";

import { useEffect, useState, useCallback } from "react";
import "./productos.css";
import { useSearch } from "../../components/SearchContext";
// 💡 IMPORTACIONES DE JOTAI
import { useSetAtom } from 'jotai';
import { addToCartAtom } from '../state/cartAtoms'; 

export default function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [selectedColors, setSelectedColors] = useState({});
  const { searchTerm } = useSearch();

  // 💡 HOOK: Obtenemos la función para agregar al carrito (setter de Jotai)
  const addToCart = useSetAtom(addToCartAtom);

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

  // --- Selección de color (Solo para Carrito) ---
  const handleColorSelect = (productId, color) => {
    setSelectedColors((prev) => ({
      ...prev,
      [productId]: color,
    }));
  };

  // --- 1. FUNCIÓN "COMPRAR AHORA" (Modifica stock inmediatamente, no usa color) ---
  const handleBuyNow = async (product) => {
    const numericId = Number(product.id);

    if (product.stock <= 0) {
      alert("Este producto está agotado.");
      return;
    }

    try {
      // --- LLAMADA PATCH para decrementar stock ---
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          id: numericId, 
          cantidad: 1, // Decrementamos 1 unidad
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

      // Opcional: Redirigir a checkout o mostrar modal
      alert(`Compra rápida de "${product.title}" realizada correctamente. Stock actualizado.`);
    } catch (error) {
      console.error("Error en handleBuyNow:", error);
      alert("Error de conexión");
    }
  };

  // --- 2. FUNCIÓN "AGREGAR AL CARRITO" (Usa Jotai, requiere color si existe) ---
  const handleAddToCart = (product) => {
    // 1. VALIDACIÓN BÁSICA DE STOCK
    if (product.stock <= 0) {
      alert("Este producto está agotado y no puede ser agregado al carrito.");
      return;
    }

    // 2. VALIDACIÓN DE VARIANTE (COLOR): Obligatorio solo si el producto tiene colores
    const validColors = product.color
      ? product.color
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c.length > 0)
      : [];
    
    const hasColors = validColors.length > 0;
    const selectedColor = selectedColors[product.id];

    if (hasColors && !selectedColor) {
      // Muestra un mensaje claro si debe seleccionar un color
      alert("Por favor, selecciona un color antes de agregarlo al carrito.");
      return;
    }

    // 3. CONSTRUCCIÓN DEL ÍTEM
    const item = {
      id: String(product.id), 
      name: product.title,
      unitPrice: product.price,
      quantity: 1, 
      imageUrl: product.image || 'https://placehold.co/50x50/cccccc/000000?text=IMG',
      
      // Si tiene colores, la variante es el color seleccionado. Si no, es "Única".
      variant: hasColors ? `${selectedColor.toUpperCase()}` : 'Única', 
    };

    // 4. LLAMADA AL ÁTOMO DE ESCRITURA DE JOTAI
    addToCart(item);

    // Feedback visual
    alert(`"${product.title} - ${item.variant}" agregado al carrito.`);
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
          const isDisabled = p.stock <= 0;

          // Se deshabilita el botón de Agregar al Carrito si requiere color y no se ha seleccionado
          const disableAddToCart = hasColors && !currentSelectedColor;


          return (
            <div
              key={p.id}
              className={`producto-card ${isDisabled ? "agotado" : ""}`} 
            >
              <button onClick={() => handleDelete(p.id)} className="delete-btn">
                &times;
              </button>

              <img 
                src={p.image || 'https://placehold.co/250x300/e0e0e0/000000?text=LUCIENNE'} 
                alt={p.title} 
                className="producto-img" 
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/250x300/e0e0e0/000000?text=LUCIENNE' }}
              />

              <div className="producto-info">
                <h2 className="producto-titulo">{p.title}</h2>

                {/* Selección de Color (Solo para Carrito) */}
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
                {/* Indicador de color seleccionado para el carrito */}
                {hasColors && currentSelectedColor && (
                  <small style={{display: 'block', marginTop: '5px', color: '#9d3345', fontWeight: 'bold'}}>
                    Seleccionado: {currentSelectedColor.toUpperCase()}
                  </small>
                )}
                
                {/* Mensaje de requisito de color */}
                {hasColors && !currentSelectedColor && !isDisabled && (
                    <small style={{display: 'block', marginTop: '5px', color: 'red'}}>
                        *Selecciona un color para agregar al carrito.
                    </small>
                )}


                <p className="producto-precio">
                  ${p.price.toLocaleString("es-AR")}
                </p>
              </div>

              <div className="producto-stock">STOCK: {p.stock}</div>

              {/* 💡 CONTENEDOR DE DOBLE BOTÓN */}
              <div className="button-group">
                {/* 1. BOTÓN "AGREGAR AL CARRITO" (Requiere color si aplica, usa Jotai) */}
                <button
                    className="carrito-btn"
                    onClick={() => handleAddToCart(p)}
                    disabled={isDisabled || disableAddToCart} // Deshabilitado por stock o por falta de color
                >
                    {isDisabled ? "SIN STOCK" : "Agregar al Carrito"}
                </button>
                
                {/* 2. BOTÓN "COMPRAR AHORA" (Solo se deshabilita por stock, usa API PATCH) */}
                <button
                    className="comprar-ahora-btn"
                    onClick={() => handleBuyNow(p)}
                    disabled={isDisabled} 
                >
                    Comprar Ahora
                </button>
              </div> {/* Fin button-group */}

            </div>
          );
        })}
      </section>
    </div>
  );
}