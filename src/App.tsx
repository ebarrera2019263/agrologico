import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { Nosotros } from "./components/Nosotros";
import { TiposRiego } from "./components/TiposRiego";
import { Servicios } from "./components/Servicios";
import { Marcas } from "./components/Marcas";
import { Galeria } from "./components/Galeria";
import { Contacto } from "./components/Contacto";
import { Footer } from "./components/Footer";
import { BotonWhatsApp } from "./components/BotonWhatsApp";
import { useRecorrido } from "./movimiento/useRecorrido";

export default function App() {
  useRecorrido();

  return (
    <>
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-maiz focus:px-5 focus:py-3 focus:font-semibold focus:text-tinta"
      >
        Saltar al contenido
      </a>

      <Header />

      <main id="contenido">
        <Hero />
        <TiposRiego />
        <Nosotros />
        <Servicios />
        <Marcas />
        <Galeria />
        <Contacto />
      </main>

      <Footer />
      <BotonWhatsApp />
    </>
  );
}
