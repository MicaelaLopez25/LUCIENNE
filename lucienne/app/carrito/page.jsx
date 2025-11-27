// app/carrito/page.jsx

// Este componente principal necesita 'use client' si usa componentes hijos 
// que consumen hooks de Jotai, como CartPage.
'use client'; 

import React from 'react';
// Importa el componente de la vista que ya diseñamos
import { CartPage } from '../../components/CartPage'; 

// Componente de página para la ruta /carrito
export default function CarritoPage() {
  return (
    <main style={{ padding: '20px' }}>
      {/* Aquí puedes añadir un wrapper o layout específico si lo necesitas */}
      <CartPage /> 
    </main>
  );
}