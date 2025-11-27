
'use client'; 

import React from 'react';
// Importamos useSetAtom además de useAtomValue
import { useAtomValue, useSetAtom } from 'jotai'; 

import {
  cartItemsAtom,
  cartTotalAtom,
  calculateItemSubtotal,
  removeItemFromCartAtom // 💡 Importación del átomo para eliminar
} from '../app/state/cartAtoms'; 

// Componente para renderizar una fila de artículo
// Acepta 'onRemove' para la función de eliminación
const CartItem = ({ item, onRemove }) => {
  const subtotal = calculateItemSubtotal(item.unitPrice, item.quantity);
  
  // Clave única del ítem (ID de Producto + Variante/Color)
  const itemKey = `${item.id}-${item.variant}`; 

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
      {/* Producto: Imagen, Nombre, Variante */}
      <div style={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
        <img 
          src={item.imageUrl} 
          alt={item.name} 
          style={{ width: '60px', height: '60px', marginRight: '15px', objectFit: 'cover', borderRadius: '4px' }} 
          // Placeholder para evitar errores de imagen
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/60x60/cccccc/000000?text=IMG' }}
        />
        <div>
          <p style={{ fontWeight: 'bold', margin: 0, fontSize: '1em' }}>{item.name}</p>
          <small style={{ color: '#666', fontSize: '0.9em' }}>{item.variant}</small>
        </div>
      </div>

      {/* Precio Unitario */}
      <div>${item.unitPrice.toFixed(2)}</div>

      {/* Cantidad (solo lectura por ahora) */}
      <div>{item.quantity}</div> 

      {/* Subtotal por Artículo */}
      <div style={{ fontWeight: 'bold', fontSize: '1.1em' }}>${subtotal}</div>
      
      {/* Botón Eliminar (AHORA FUNCIONAL) */}
      <div>
        <button 
          onClick={() => onRemove(itemKey)} // Llama a la función de eliminación con la clave única del ítem
          style={{ 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            color: '#9d3345', // Color de marca para el botón de eliminar
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
  
  // 💡 OBTENEMOS la función para eliminar del carrito mediante el átomo de escritura
  const removeItemFromCart = useSetAtom(removeItemFromCartAtom); 

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
        <div style={{textAlign: 'left'}}>PRODUCTO</div>
        <div>PRECIO UNITARIO</div>
        <div>CANTIDAD</div>
        <div>SUBTOTAL</div>
        <div></div> 
      </div>

      {/* Lista de Items */}
      {cartItems.map((item) => (
        // Pasamos la función removeItemFromCart como prop onRemove
        <CartItem 
          key={`${item.id}-${item.variant}`} 
          item={item} 
          onRemove={removeItemFromCart}
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
      </div>
    </div>
  );
};