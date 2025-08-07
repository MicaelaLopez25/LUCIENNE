import "./Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="logo">LUCIENNE</div>
      <nav className="menu">
        <a href="#">INICIO</a>
        <a href="#">CONTACTO</a>
        <a href="#">PRODUCTOS</a>
      </nav>
      <div className="iconos">
        <span>👤</span>
        <span>🛒</span>
      </div>
    </header>
  );
}
