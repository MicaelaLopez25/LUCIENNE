import "./ProductosDestacados.css";

const productos = [
  { id: 1, nombre: "Producto 1", imagen: "/img/producto1.jpg" },
  { id: 2, nombre: "Producto 2", imagen: "/img/producto2.jpg" },
  { id: 3, nombre: "Producto 3", imagen: "/img/producto1.jpg" },
  { id: 4, nombre: "Producto 4", imagen: "/img/producto2.jpg" },
];

export default function ProductosDestacados() {
  return (
    <section className="productos">
      <h2>PRODUCTOS DESTACADOS</h2>
      <div className="grilla">
        {productos.map((p) => (
          <div className="producto" key={p.id}>
            <div
              className="imagen"
              style={{ backgroundImage: `url(${p.imagen})` }}
            ></div>
            <p>{p.nombre}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
