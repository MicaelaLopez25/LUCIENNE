import Navbar from "@/components/Navbar";
import Banner from "@/components/Banner";
import ProductosDestacados from "@/components/ProductosDestacados";
import Footer from "@/components/Footer";
import "./globals.css";

export default function Home() {
  return (
    <>
      <Navbar />
      <Banner />
      <ProductosDestacados />
      <Footer />
    </>
  );
}
