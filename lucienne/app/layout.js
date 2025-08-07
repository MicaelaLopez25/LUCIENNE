export const metadata = {
  title: "Lucienne",
  description: "Tienda de indumentaria",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
