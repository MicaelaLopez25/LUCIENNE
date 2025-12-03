// app/state/cartAtoms.js

import { atom } from 'jotai';

// --- Tipo de dato Item del Carrito (Actualizado con maxStock) ---
// { id: string, name: string, variant: string, unitPrice: number, quantity: number, imageUrl: string, maxStock: number }

const initialCart = [
  // Datos de prueba, ahora con maxStock para la validación
  {
    id: 'prod-101',
    name: 'Vestido "LUCIENNE" Noche',
    variant: 'Negro S',
    unitPrice: 125.99,
    quantity: 1,
    imageUrl: 'https://placehold.co/50x50/ff99aa/000000?text=V-N',
    maxStock: 5, // Stock máximo para este producto/color
  },
  {
    id: 'prod-205',
    name: 'Cárdigan Tejido',
    variant: 'Beige M',
    unitPrice: 55.00,
    quantity: 3,
    imageUrl: 'https://placehold.co/50x50/ccccff/000000?text=C-B',
    maxStock: 8, // Stock máximo para este producto/color
  },
];

// Datos mockeados de un producto complejo con colores/stock, necesarios para la modificación de variante en el carrito
// En una app real, esto vendría de una consulta a la API al cargar CartPage.
const MOCK_PRODUCT_DETAILS = [
  { id: 'prod-101', colors: ['Negro S', 'Rojo M'], stocks: { 'Negro S': 5, 'Rojo M': 3 }, price: 125.99, name: 'Vestido "LUCIENNE" Noche', imageUrl: 'https://placehold.co/50x50/ff99aa/000000?text=V-N' },
  { id: 'prod-205', colors: ['Beige M', 'Gris M'], stocks: { 'Beige M': 8, 'Gris M': 2 }, price: 55.00, name: 'Cárdigan Tejido', imageUrl: 'https://placehold.co/50x50/ccccff/000000?text=C-B' },
  // ... más productos si fuera necesario
];

// 1. Átomo Base: Lista de artículos en el carrito (Lectura y Escritura)
export const cartItemsAtom = atom(initialCart);
export const mockProductDetailsAtom = atom(MOCK_PRODUCT_DETAILS); // Átomo para detalles de productos (mock)

// Función de utilidad para generar la clave única de un ítem
const getItemKey = (item) => `${item.id}-${item.variant}`;

// 2. Átomo de escritura: Agrega o actualiza un producto al carrito
// (Se mantiene igual que la versión anterior)
export const addToCartAtom = atom(
  null,
  (get, set, productToAdd) => {
    const currentItems = get(cartItemsAtom);
    const itemKey = getItemKey(productToAdd);

    const existingItemIndex = currentItems.findIndex(
      (item) => getItemKey(item) === itemKey
    );

    if (existingItemIndex > -1) {
      const newItems = [...currentItems];
      // Verifica el límite de stock antes de incrementar
      const maxStock = newItems[existingItemIndex].maxStock;
      const newQuantity = newItems[existingItemIndex].quantity + productToAdd.quantity;
      
      newItems[existingItemIndex] = {
        ...newItems[existingItemIndex],
        quantity: newQuantity > maxStock ? maxStock : newQuantity,
      };
      set(cartItemsAtom, newItems);
    } else {
      set(cartItemsAtom, [...currentItems, productToAdd]);
    }
  }
);

// 3. Átomo de escritura: Elimina un producto del carrito
export const removeItemFromCartAtom = atom(
  null,
  (get, set, itemKeyToRemove) => {
    const currentItems = get(cartItemsAtom);
    const newItems = currentItems.filter(
      (item) => getItemKey(item) !== itemKeyToRemove
    );
    set(cartItemsAtom, newItems);
  }
);

// 4. Átomo de escritura: Modifica la cantidad o la variante de un ítem existente
export const updateCartItemAtom = atom(
  null,
  (get, set, { oldItemKey, newQuantity, newVariant }) => {
    const currentItems = get(cartItemsAtom);
    const itemIndex = currentItems.findIndex(item => getItemKey(item) === oldItemKey);
    
    if (itemIndex === -1) return; // No se encontró el ítem original
    
    const originalItem = currentItems[itemIndex];
    let newItems = [...currentItems];

    // --- Lógica de Modificación de Cantidad (Criterio 1 y 2) ---
    if (newQuantity !== undefined && newQuantity !== originalItem.quantity) {
      const maxStock = originalItem.maxStock;
      const safeQuantity = Math.max(1, Math.min(newQuantity, maxStock));

      newItems[itemIndex] = {
        ...originalItem,
        quantity: safeQuantity,
      };
      set(cartItemsAtom, newItems);
      return;
    }

    // --- Lógica de Modificación de Variante (Criterio 3) ---
    if (newVariant && newVariant !== originalItem.variant) {
      const newKey = `${originalItem.id}-${newVariant}`;
      const existingNewItemIndex = currentItems.findIndex(item => getItemKey(item) === newKey);
      
      // Obtener detalles del nuevo stock/precio (mockeado)
      const productDetails = get(mockProductDetailsAtom).find(p => p.id === originalItem.id);
      const newMaxStock = productDetails.stocks[newVariant] || 10; // Stock de la nueva variante
      
      if (existingNewItemIndex > -1) {
        // Caso A: La nueva variante ya existe -> Fusionar (Criterio 3 Fusión)
        const itemToMerge = newItems[existingNewItemIndex];
        const newTotalQuantity = originalItem.quantity + itemToMerge.quantity;
        
        // La cantidad máxima es el stock de la variante destino
        const safeTotalQuantity = Math.min(newTotalQuantity, newMaxStock); 

        // 1. Eliminar el ítem original (el que se está cambiando)
        newItems.splice(itemIndex, 1);
        
        // El índice del ítem destino podría haber cambiado después del splice, así que lo buscamos de nuevo
        const itemToUpdateIndex = newItems.findIndex(item => getItemKey(item) === newKey);
        
        // 2. Actualizar el ítem destino con la cantidad fusionada
        newItems[itemToUpdateIndex] = {
          ...itemToMerge,
          quantity: safeTotalQuantity,
          // Actualizamos la variante y el stock por si acaso
          variant: newVariant, 
          maxStock: newMaxStock,
        };
        
      } else {
        // Caso B: La nueva variante es única -> Reemplazar (Criterio 3 Reemplazo)
        newItems[itemIndex] = {
          ...originalItem,
          variant: newVariant,
          // Actualizamos stock del producto a la nueva variante
          maxStock: newMaxStock, 
        };
      }
      
      set(cartItemsAtom, newItems);
    }
  }
);


// 5. Átomo Derivado: Contador Total de Ítems
export const totalItemsCountAtom = atom((get) => {
  const items = get(cartItemsAtom);
  return items.reduce((total, item) => total + item.quantity, 0);
});

// 6. Átomo Derivado: Total General del Carrito
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