'use client'; 

import React from 'react';
import { useAtomValue } from 'jotai';
// Importa el átomo derivado que calcula el total de la cantidad de ítems
// Asegúrate que esta ruta es correcta para llegar a app/state/cartAtoms.js
import { totalItemsCountAtom } from '../app/state/cartAtoms'; 

export const CartIcon = () => {
  // Hook de Jotai para leer el valor calculado del contador
  const totalCount = useAtomValue(totalItemsCountAtom);

  return (
    <button 
      aria-label="Ver Carrito" 
      style={{ 
        position: 'relative', 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer',
        padding: '5px' 
      }}
    >
      {/* Ícono de carrito estándar */}
      <span role="img" style={{ fontSize: '1.5em' }}>🛒</span>
      
      {/* Badge (contador dinámico) */}
      {totalCount > 0 && (
        <span 
          style={{
            position: 'absolute',
            top: -5,
            right: -5,
            background: '#9d3345', // Color de marca sugerido
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '0.7em',
            fontWeight: 'bold',
            lineHeight: 1
          }}
        >
          {totalCount}
        </span>
      )}
    </button>
  );
};