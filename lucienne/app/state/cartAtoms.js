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
    imageUrl: 'https://placehold.co/50x50/ff99aa/000000?text=V-N', 
  },
  {
    id: 'prod-205',
    name: 'Cárdigan Tejido',
    variant: 'Beige M',
    unitPrice: 55.00,
    quantity: 3,
    imageUrl: 'https://placehold.co/50x50/ccccff/000000?text=C-B',
  },
];

// 1. Átomo Base: Lista de artículos en el carrito (Lectura y Escritura)
export const cartItemsAtom = atom(initialCart);

// 2. Átomo de escritura: Agrega o actualiza un producto al carrito
export const addToCartAtom = atom(
  null, // No tiene valor de lectura
  (get, set, productToAdd) => {
    const currentItems = get(cartItemsAtom);
    
    // Generamos un ID de item único basado en el ID del producto y su variante (color+talle)
    const itemKey = `${productToAdd.id}-${productToAdd.variant}`;
    
    // Intentamos encontrar el ítem en el carrito
    const existingItemIndex = currentItems.findIndex(
      (item) => `${item.id}-${item.variant}` === itemKey
    );

    if (existingItemIndex > -1) {
      // Caso 1: El producto con esta variante ya existe, solo incrementamos la cantidad
      const newItems = [...currentItems];
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newItems[existingItemIndex].quantity + productToAdd.quantity,
      };
      set(cartItemsAtom, newItems);
    } else {
      // Caso 2: El producto es nuevo, lo agregamos al final
      const newItems = [...currentItems, productToAdd];
      set(cartItemsAtom, newItems);
    }
  }
);

// 3. Átomo de escritura: Elimina un producto del carrito
export const removeItemFromCartAtom = atom(
  null, // No tiene valor de lectura
  (get, set, itemKeyToRemove) => {
    const currentItems = get(cartItemsAtom);
    
    // Filtramos para crear una nueva lista sin el ítem cuya clave coincida
    const newItems = currentItems.filter(
      (item) => `${item.id}-${item.variant}` !== itemKeyToRemove
    );
    
    // Actualizamos el estado
    set(cartItemsAtom, newItems);
  }
);


// 4. Átomo Derivado: Contador Total de Ítems (para el badge)
export const totalItemsCountAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((total, item) => total + item.quantity, 0);
});

// 5. Átomo Derivado: Total General del Carrito
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