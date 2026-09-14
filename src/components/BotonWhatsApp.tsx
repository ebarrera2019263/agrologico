import { useEffect, useState } from "react";
import { IconoWhatsApp } from "./Iconos";
import { enlaceWhatsApp } from "../data/site";

/* Botón flotante. Aparece al dejar el hero para no competir con la
   llamada a la acción principal, y se retira sobre el pie de página. */
export function BotonWhatsApp() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alScroll = () => {
      const pie = document.getElementById("pie");
      const topePie = pie ? pie.getBoundingClientRect().top : Infinity;
      setVisible(window.scrollY > 600 && topePie > window.innerHeight * 0.85);
    };
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  return (
    <a
      href={enlaceWhatsApp()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir a Agrológico por WhatsApp"
      className={`fixed bottom-5 right-5 z-40 inline-flex items-center gap-3 rounded-full bg-[#25D366] py-3.5 pl-4 pr-5 font-semibold text-[#00382e] shadow-[0_8px_24px_rgba(0,56,46,0.3)] transition-all duration-300 hover:bg-[#1fb757] sm:bottom-8 sm:right-8 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <IconoWhatsApp className="h-6 w-6" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
