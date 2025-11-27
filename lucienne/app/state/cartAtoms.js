import { atom } from 'jotai';

// --- Tipo de dato Item del Carrito ---
// { id: string, name: string, variant: string, unitPrice: number, quantity: number, imageUrl: string }

const initialCart = [
  // Datos de prueba para que puedas ver el carrito lleno inicialmente
  {
    id: 'prod-101',
    name: 'Vestido "LUCIENNE" Noche',
    variant: 'Negro S',
    unitPrice: 125.99,
    quantity: 1,
    imageUrl: 'https://via.placeholder.com/50', 
  },
  {
    id: 'prod-205',
    name: 'Cárdigan Tejido',
    variant: 'Beige M',
    unitPrice: 55.00,
    quantity: 3,
    imageUrl: 'https://via.placeholder.com/50',
  },
];

// 1. Átomo Base: Lista de artículos en el carrito
export const cartItemsAtom = atom(initialCart);

// 2. Átomo Derivado: Contador Total de Ítems (para el badge)
export const totalItemsCountAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((total, item) => total + item.quantity, 0);
});

// 3. Átomo Derivado: Total General del Carrito
export const cartTotalAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((total, item) => {
    const itemSubtotal = item.unitPrice * item.quantity;
    return total + itemSubtotal;
  }, 0);
});

// Función de ayuda para cálculos en la UI
export const calculateItemSubtotal = (unitPrice, quantity) => {
    return (unitPrice * quantity).toFixed(2);
};