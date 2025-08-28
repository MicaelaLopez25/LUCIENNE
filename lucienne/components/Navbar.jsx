"use client";

import { useState } from "react";
import styles from "./Navbar.module.css";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>LUCIENNE</div>
      <div className={styles.iconos}>
        <span>👤</span>
        <span>🛒</span>
      </div>
      {/* Botón para móviles */}
      <button className={styles.menu} onClick={toggleMenu}>
        ☰
      </button>

      {/* El menú de navegación usa la clase condicional */}
      <nav className={`${styles.menu} ${isMenuOpen ? `${styles.open}` : ""}`}>
        <Link href="/">INICIO</Link>
        <Link href="/">CONTACTO</Link>
        <Link href="/productos">PRODUCTOS</Link>
      </nav>
    </header>
  );
}
