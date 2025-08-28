import "./productos.css";

export default function ProductosPage() {
  return (
    <div className="productos-container">
      <h1>PRODUCTOS</h1>
      <section className="productos-grid">
        <div className="producto-card">Producto 1</div>
        <div className="producto-card">Producto 2</div>
        <div className="producto-card">Producto 3</div>
        <div className="producto-card">Producto 4</div>
        <div className="producto-card">Producto 5</div>
        <div className="producto-card">Producto 6</div>
      </section>
    </div>
  );
}
