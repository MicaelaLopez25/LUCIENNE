import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="bloque">
        <h3>CATEGORÍAS</h3>
        <p>INICIO</p>
        <p>PRODUCTOS</p>
        <p>CONTACTO</p>
      </div>
      <div className="bloque">
        <h3>MEDIOS DE PAGO</h3>
        <img src="/img/mercado-pago.png" alt="MP" />
        <img src="/img/naranja.png" alt="Naranja" />
      </div>
      <div className="bloque">
        <h3>CONTACTANOS</h3>
        <p>📞 +111111111</p>
        <p>📧 queonda@gmail</p>
      </div>
      <div className="bloque">
        <h3>REDES SOCIALES</h3>
        <p>Insta: </p>
        <p>WhatsApp: </p>
      </div>
    </footer>
  );
}
