"use client";

import { useState } from "react";
import styles from "./Navbar.module.css";
import Link from "next/link";
import { useSearch } from "./SearchContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { searchTerm, setSearchTerm } = useSearch();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearchChange = (e) => {
    // 💡 AHORA solo actualiza el estado GLOBAL del Contexto
    setSearchTerm(e.target.value); 
  };
  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>LUCIENNE</div>
      {/* Barra de búsqueda */}
      <div className={styles.search}>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm} // 💡 El valor sigue siendo el del estado global
          onChange={handleSearchChange}
        />
      </div>
      <div className={styles.iconos}>
        <span>👤</span>
        <span>🛒</span>
      </div>
      {/* Botón para móviles */}
      <button className={styles["menu-toggle"]} onClick={toggleMenu}>
        ☰
      </button>

      {/* El menú de navegación usa la clase condicional */}
      <nav className={`${styles.menu} ${isMenuOpen ? styles.open : ""}`}>
        <Link href="/">INICIO</Link>
        <Link href="/">CONTACTO</Link>
        <Link href="/productos">PRODUCTOS</Link>
      </nav>
    </header>
  );
}
