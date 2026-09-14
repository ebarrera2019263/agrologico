import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { IconoWhatsApp } from "./Iconos";
import { secciones, enlaceWhatsApp } from "../data/site";

export function Header() {
  const [abierto, setAbierto] = useState(false);
  const [compacto, setCompacto] = useState(false);
  const [activa, setActiva] = useState<string>("inicio");

  /* Fondo sólido en cuanto la página se despega del hero. */
  useEffect(() => {
    const alScroll = () => setCompacto(window.scrollY > 24);
    alScroll();
    window.addEventListener("scroll", alScroll, { passive: true });
    return () => window.removeEventListener("scroll", alScroll);
  }, []);

  /* Marca en el menú la sección que se está viendo. */
  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        const visible = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiva(visible.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: [0, 0.25, 0.5] },
    );
    secciones.forEach(({ id }) => {
      const nodo = document.getElementById(id);
      if (nodo) observador.observe(nodo);
    });
    return () => observador.disconnect();
  }, []);

  /* Con el menú móvil abierto, el fondo no debe desplazarse. */
  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        compacto || abierto
          ? "bg-tinta text-mineral shadow-[0_1px_0_rgba(255,255,255,0.12)]"
          : "bg-transparent text-mineral"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[78rem] items-center justify-between gap-6 px-5 sm:px-8">
        <a href="#inicio" className="shrink-0" aria-label="Agrológico, ir al inicio">
          <Logo className="h-9 w-auto" />
        </a>

        {/* Navegación de escritorio */}
        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {secciones.map(({ id, nombre }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  aria-current={activa === id ? "true" : undefined}
                  className={`relative block px-4 py-2 text-[0.95rem] font-medium transition-colors ${
                    activa === id ? "text-maiz" : "text-mineral/80 hover:text-mineral"
                  }`}
                >
                  {nombre}
                  <span
                    className={`absolute inset-x-4 bottom-0.5 h-px bg-maiz transition-opacity ${
                      activa === id ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={enlaceWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-milpa-claro px-5 py-2.5 text-[0.95rem] font-semibold text-white transition-colors hover:bg-milpa"
          >
            <IconoWhatsApp className="h-4 w-4" />
            Escribinos
          </a>
        </div>

        {/* Botón de menú móvil */}
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          aria-controls="menu-movil"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-mineral/30 lg:hidden"
        >
          <span className="sr-only">{abierto ? "Cerrar menú" : "Abrir menú"}</span>
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            {abierto ? (
              <>
                <path d="M6 6l12 12" />
                <path d="M18 6L6 18" />
              </>
            ) : (
              <>
                <path d="M4 8h16" />
                <path d="M4 16h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* Panel móvil */}
      <div
        id="menu-movil"
        hidden={!abierto}
        className="border-t border-mineral/15 bg-tinta lg:hidden"
      >
        <nav aria-label="Principal móvil" className="px-5 pb-8 pt-4 sm:px-8">
          <ul className="divide-y divide-mineral/10">
            {secciones.map(({ id, nombre }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={() => setAbierto(false)}
                  className="flex items-baseline justify-between py-4 font-display text-2xl font-semibold text-mineral"
                >
                  {nombre}
                  {activa === id && <span className="text-sm font-sans text-maiz">viendo</span>}
                </a>
              </li>
            ))}
          </ul>
          <a
            href={enlaceWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setAbierto(false)}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-milpa-claro px-6 py-4 font-semibold text-white"
          >
            <IconoWhatsApp className="h-5 w-5" />
            Escribinos por WhatsApp
          </a>
        </nav>
      </div>
    </header>
  );
}
