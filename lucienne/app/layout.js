import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SearchProvider } from "@/components/SearchContext";
import "./globals.css"; 

export const metadata = {
  title: "Lucienne",
  description: "Tienda de indumentaria",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <SearchProvider>
          <Navbar />
          {children}
        </SearchProvider>
        <Footer />
      </body>
    </html>
  );
}
