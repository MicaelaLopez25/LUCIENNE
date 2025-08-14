"use client";

import { useState } from "react";
import "./Navbar.css";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="navbar">
      <div className="logo">LUCIENNE</div>
      <div className="iconos">
        <span>👤</span>
        <span>🛒</span>
      </div>
      {/* Botón para móviles */}
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>

      {/* El menú de navegación usa la clase condicional */}
      <nav className={`menu ${isMenuOpen ? "open" : ""}`}>
        <a href="#">INICIO</a>
        <a href="#">CONTACTO</a>
        <a href="#">PRODUCTOS</a>
      </nav>
    </header>
  );
}
