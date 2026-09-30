import { useCallback, useEffect, useRef, useState } from "react";
import { galeria } from "../data/site";
import { pausarScroll, reanudarScroll } from "../movimiento/scroll";

/* Cada formato ocupa un lugar distinto en la retícula, para que la
   galería se lea como un conjunto de parcelas y no como una cuadrícula
   de miniaturas iguales. */
const tramo: Record<string, string> = {
  ancho: "aspect-[4/3] sm:col-span-2 sm:aspect-[16/10]",
  alto: "aspect-[4/3] sm:row-span-2 sm:aspect-auto",
  cuadro: "aspect-[4/3] sm:aspect-square",
};

export function Galeria() {
  const [indice, setIndice] = useState<number | null>(null);
  const dialogo = useRef<HTMLDivElement>(null);
  const disparador = useRef<HTMLButtonElement | null>(null);

  const cerrar = useCallback(() => {
    setIndice(null);
    disparador.current?.focus();
  }, []);

  const mover = useCallback((paso: number) => {
    setIndice((actual) =>
      actual === null ? actual : (actual + paso + galeria.length) % galeria.length,
    );
  }, []);

  useEffect(() => {
    if (indice === null) return;

    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
      if (e.key === "ArrowRight") mover(1);
      if (e.key === "ArrowLeft") mover(-1);
    };

    document.addEventListener("keydown", alTeclear);
    document.body.style.overflow = "hidden";
    pausarScroll();
    dialogo.current?.focus();

    return () => {
      document.removeEventListener("keydown", alTeclear);
      document.body.style.overflow = "";
      reanudarScroll();
    };
  }, [indice, cerrar, mover]);

  const foto = indice === null ? null : galeria[indice];

  return (
    <section id="galeria" className="mx-auto max-w-[78rem] px-5 py-20 sm:px-8 sm:py-28">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.02]">
            Trabajo en finca
          </h2>
          <p className="mt-4 max-w-[48ch] leading-relaxed text-tinta-suave">
            Instalaciones, visitas y cultivos de clientes con los que trabajamos.
            Tocá una foto para verla completa.
          </p>
        </div>
      </div>

      <div className="surco mt-8 mb-10" />

      <ul className="grid auto-rows-auto grid-cols-1 gap-3 sm:grid-cols-3">
        {galeria.map((item, i) => (
          <li key={item.src} className={tramo[item.formato]}>
            <button
              type="button"
              onClick={(e) => {
                disparador.current = e.currentTarget;
                setIndice(i);
              }}
              className="group relative block h-full w-full overflow-hidden bg-linea text-left"
            >
              <img
                src={item.src}
                alt={item.alt}
                loading="lazy"
                className="foto-marco absolute inset-x-0 -top-[8%] h-[116%] w-full object-cover transition-[scale] duration-500 group-hover:scale-[1.04]"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-tinta/90 to-transparent p-4 pt-10">
                <span className="block font-display text-base font-semibold text-mineral">
                  {item.titulo}
                </span>
                <span className="block text-sm text-mineral/70">{item.lugar}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Visor */}
      {foto && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-tinta/95 p-4 backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={foto.titulo}
          tabIndex={-1}
          ref={dialogo}
          onClick={(e) => {
            if (e.target === e.currentTarget) cerrar();
          }}
        >
          <button
            type="button"
            onClick={cerrar}
            className="absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-mineral/30 text-mineral transition-colors hover:bg-mineral/10 sm:right-8 sm:top-8"
          >
            <span className="sr-only">Cerrar</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          <figure className="max-h-full w-full max-w-4xl">
            <img
              src={foto.src}
              alt={foto.alt}
              className="max-h-[70vh] w-full object-contain"
            />
            <figcaption className="mt-4 flex items-center justify-between gap-4 text-mineral">
              <span>
                <span className="block font-display text-lg font-semibold">{foto.titulo}</span>
                <span className="block text-sm text-mineral/65">{foto.lugar}</span>
              </span>
              <span className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => mover(-1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-mineral/30 transition-colors hover:bg-mineral/10"
                >
                  <span className="sr-only">Foto anterior</span>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => mover(1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-mineral/30 transition-colors hover:bg-mineral/10"
                >
                  <span className="sr-only">Foto siguiente</span>
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </section>
  );
}
