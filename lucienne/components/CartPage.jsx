
'use client'; 

import React, { useState } from 'react';
// Importamos useSetAtom y useAtomValue
import { useAtomValue, useSetAtom } from 'jotai'; 

// Ajuste en la ruta de importación de los átomos
import {
  cartItemsAtom,
  cartTotalAtom,
  calculateItemSubtotal,
  removeItemFromCartAtom,
  updateCartItemAtom, // 💡 Átomo para la modificación (Cantidad/Variante)
  mockProductDetailsAtom // 💡 Átomo para obtener variantes mockeadas
} from '../app/state/cartAtoms'; 


// Componente para manejar el mensaje de stock insuficiente (no usamos alert)
const StockMessage = ({ message }) => {
    if (!message) return null;
    return (
        <p style={{ 
            color: 'red', 
            fontSize: '0.9em', 
            fontWeight: 'bold', 
            margin: '5px 0 0 0' 
        }}>
            ⚠️ {message}
        </p>
    );
};


// Componente para renderizar una fila de artículo
// Ahora acepta 'onRemove' y 'onUpdate'
const CartItem = ({ item, onRemove, onUpdate }) => {
  // Estado local para mensaje de stock o validación
  const [stockError, setStockError] = useState(''); 
  const subtotal = calculateItemSubtotal(item.unitPrice, item.quantity);
  const itemKey = `${item.id}-${item.variant}`;
  
  // Obtenemos los detalles mockeados para saber qué colores tiene este producto
  const productDetails = useAtomValue(mockProductDetailsAtom).find(p => p.id === item.id);
  // Lista de variantes disponibles (ej: 'Negro S', 'Rojo M')
  const availableVariants = productDetails ? productDetails.colors : [item.variant]; 

  // --- Manejar cambio de Cantidad (HU-03 Criterio 1 y 2) ---
  const handleQuantityChange = (e) => {
    const newQuantity = Number(e.target.value);
    
    // Si es menor a 1, lo forzamos a 1 (Criterio 1)
    if (newQuantity < 1) {
      onUpdate({ oldItemKey: itemKey, newQuantity: 1 });
      return;
    }
    
    // Validación de stock (Criterio 2)
    if (newQuantity > item.maxStock) {
        setStockError(`Máximo stock disponible: ${item.maxStock}`);
        // Actualizamos a la cantidad máxima, el átomo se encarga de aplicar el Math.min
        onUpdate({ oldItemKey: itemKey, newQuantity: item.maxStock });
        return;
    }

    setStockError(''); // Limpiar error si es válido
    onUpdate({ oldItemKey: itemKey, newQuantity });
  };
  
  // --- Manejar cambio de Variante (Color) (HU-03 Criterio 3) ---
  const handleVariantChange = (e) => {
    const newVariant = e.target.value;
    setStockError('');
    // Llamamos a la lógica de fusión/reemplazo en Jotai
    onUpdate({ oldItemKey: itemKey, newVariant });
  };


  const itemStyle = {
    display: 'grid',
    // Estructura: Producto | Precio | Cantidad | Subtotal | Eliminar
    gridTemplateColumns: '3fr 1fr 1fr 1fr 0.5fr', 
    gap: '20px',
    padding: '15px 0',
    borderBottom: '1px solid #eee',
    alignItems: 'center',
    textAlign: 'center'
  };

  return (
    <div style={itemStyle}>
      {/* 1. Producto: Imagen, Nombre, Variante (Modificable) */}
      <div style={{ display: 'flex', alignItems: 'center', textAlign: 'left', flexDirection: 'column', paddingRight: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              style={{ width: '60px', height: '60px', marginRight: '15px', objectFit: 'cover', borderRadius: '4px' }} 
              onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/60x60/cccccc/000000?text=IMG' }}
            />
            <div>
              <p style={{ fontWeight: 'bold', margin: 0, fontSize: '1em' }}>{item.name}</p>
              {/* Selector de Variante (Criterio 3) */}
              <select 
                value={item.variant} 
                onChange={handleVariantChange}
                style={{ 
                    padding: '5px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc',
                    marginTop: '5px',
                    fontSize: '0.9em'
                }}
              >
                {availableVariants.map(variant => (
                    <option key={variant} value={variant}>{variant.toUpperCase()}</option>
                ))}
              </select>
            </div>
        </div>
        <StockMessage message={stockError} />
      </div>

      {/* 2. Precio Unitario */}
      <div>${item.unitPrice.toFixed(2)}</div>

      {/* 3. Cantidad (Input para Modificación - Criterio 1) */}
      <div>
        <input
            type="number"
            value={item.quantity}
            onChange={handleQuantityChange}
            min="1"
            max={item.maxStock} // Límite visual, la lógica principal está en Jotai
            style={{ 
                width: '60px', 
                padding: '5px', 
                textAlign: 'center', 
                borderRadius: '4px',
                border: '1px solid #9d3345',
            }}
        />
      </div> 

      {/* 4. Subtotal por Artículo */}
      <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>${subtotal}</div>
      
      {/* 5. Botón Eliminar */}
      <div>
        <button 
          onClick={() => onRemove(itemKey)} 
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            color: '#9d3345', 
            fontSize: '1.5em',
            transition: 'color 0.2s'
          }} 
          aria-label="Eliminar producto"
          title="Eliminar ítem del carrito"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

// Componente principal de la página del carrito
export const CartPage = () => {
  // Leemos los átomos del estado de la lista de ítems y el total
  const cartItems = useAtomValue(cartItemsAtom);
  const cartTotal = useAtomValue(cartTotalAtom);
  
  // OBTENEMOS la función para eliminar y modificar
  const removeItemFromCart = useSetAtom(removeItemFromCartAtom); 
  const updateCartItem = useSetAtom(updateCartItemAtom); // 💡 Hook para la modificación

  // Estilos de la cabecera
  const headerStyle = {
    fontWeight: 'bold',
    borderBottom: '2px solid #333',
    padding: '10px 0',
    textAlign: 'center',
    display: 'grid',
    gridTemplateColumns: '3fr 1fr 1fr 1fr 0.5fr',
    gap: '20px',
    fontSize: '0.9em'
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '800px', margin: 'auto' }}>
        <h2 style={{ color: '#333' }}>🛒 Tu Carrito de Compras</h2>
        <p style={{ color: '#666' }}>Tu carrito de **LUCIENNE** está vacío. ¡Te invitamos a explorar nuestra colección!</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '30px auto', padding: '20px' }}>
      <h1 style={{ borderBottom: '1px solid #ccc', paddingBottom: '15px', color: '#9d3345' }}>Mi Carrito</h1>

      {/* Encabezado de la lista */}
      <div style={headerStyle}>
        <div style={{textAlign: 'left'}}>PRODUCTO Y VARIANTE</div>
        <div>PRECIO UNITARIO</div>
        <div>CANTIDAD</div>
        <div>SUBTOTAL</div>
        <div></div> 
      </div>

      {/* Lista de Items */}
      {cartItems.map((item) => (
        <CartItem 
          key={`${item.id}-${item.variant}`} 
          item={item} 
          onRemove={removeItemFromCart}
          onUpdate={updateCartItem} // 💡 Pasamos la función de modificación
        />
      ))}

      {/* Total General */}
      <div 
        style={{ 
          marginTop: '30px', 
          borderTop: '2px solid #333', 
          paddingTop: '15px', 
          textAlign: 'right' 
        }}>
        <p style={{ fontSize: '1.8em', fontWeight: 'bold', margin: 0 }}>
          TOTAL: <span style={{ color: '#9d3345' }}>${cartTotal.toFixed(2)}</span>
        </p>
        <button style={{ 
            backgroundColor: '#9d3345', 
            color: 'white', 
            padding: '10px 20px', 
            border: 'none', 
            borderRadius: '5px', 
            fontSize: '1.2em', 
            marginTop: '15px',
            cursor: 'pointer'
        }}>
            FINALIZAR COMPRA
        </button>
      </div>
    </div>
  );
};