"use client";

import { useState, useEffect } from "react";
import styles from "./Navbar.module.css";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);  // Almacenar los productos en estado
  const [isClient, setIsClient] = useState(false); // Para evitar SSR

  // Efecto que solo se ejecuta en el cliente
  useEffect(() => {
    setIsClient(true); // Actualiza el estado cuando el componente se monta en el cliente
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Actualizar el término de búsqueda
    fetchProducts(e.target.value); // Llamar a la función para actualizar los productos
  };

  // Función para obtener los productos filtrados desde la API
  const fetchProducts = async (term) => {
    const response = await fetch(`/api/products?search=${term}`);
    const data = await response.json();
    setProducts(data);  // Actualizar el estado con los productos filtrados
  };

  if (!isClient) return null; // Evita el renderizado en el servidor

  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>LUCIENNE</div>
      
      {/* Barra de búsqueda */}
      <div className={styles.search}>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={handleSearchChange} // Llamar a la función cada vez que cambia el input
        />
      </div>

      <div className={styles.iconos}>
        <span>👤</span>
        <span>🛒</span>
      </div>

      <button className={styles["menu-toggle"]} onClick={toggleMenu}>
        ☰
      </button>

      <nav className={`${styles.menu} ${isMenuOpen ? styles.open : ""}`}>
        <Link href="/">INICIO</Link>
        <Link href="/">CONTACTO</Link>
        <Link href="/productos">PRODUCTOS</Link>
      </nav>

      {/* Mostrar los productos filtrados */}
      <div className={styles.productList}>
        {products.length > 0 ? (
          products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <img src={product.image} alt={product.title} />
              <h3>{product.title}</h3>
              <p>{product.description}</p>
              <p>${product.price}</p>
            </div>
          ))
        ) : (
          <p>No se encontraron productos.</p>
        )}
      </div>
    </header>
  );
}
