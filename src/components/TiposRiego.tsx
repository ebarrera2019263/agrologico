import type { ReactNode } from "react";
import { enlaceWhatsApp, tiposRiego, type TipoRiego } from "../data/site";

/* ---------------------------------------------------------------
   Los seis sistemas de riego que instala Agrológico.

   Remata el recorrido animado: después de ver cómo funciona un sistema,
   el productor ve cuáles existen y pregunta por el suyo. Cada fila abre
   WhatsApp con el sistema ya escrito en el mensaje. Es una lista, no
   una retícula de tarjetas: se lee de corrido, como un catálogo técnico.
   --------------------------------------------------------------- */

/* Pictogramas de línea, 48×48, trazados con currentColor. */
const pictogramas: Record<TipoRiego["id"], ReactNode> = {
  goteo: (
    <>
      <path d="M4 18 H44" />
      <path d="M20 15 H28 V21 H20 Z" />
      <path d="M24 27 C24 27 19.5 32.5 19.5 36 A4.5 4.5 0 0 0 28.5 36 C28.5 32.5 24 27 24 27 Z" />
      <path d="M8 44 H40" />
    </>
  ),
  microaspersion: (
    <>
      <path d="M24 44 V26" />
      <path d="M19.5 26 H28.5" />
      <path d="M22 22 C17 17 11 18 7 25" />
      <path d="M26 22 C31 17 37 18 41 25" />
      <path d="M10 31 H11 M16 28 H17 M31 28 H32 M37 31 H38" />
      <path d="M8 44 H40" />
    </>
  ),
  "aspersion-fija": (
    <>
      <path d="M24 44 V16" />
      <path d="M19.5 16 H28.5" />
      <path d="M22 13 C13 7 6 12 3 26" />
      <path d="M26 13 C35 7 42 12 45 26" />
      <path d="M4 44 H44" />
    </>
  ),
  "aspersion-movil": (
    <>
      <path d="M24 32 V14" />
      <path d="M19.5 14 H28.5" />
      <path d="M22 11 C15 6 9 10 6 20" />
      <path d="M26 11 C33 6 39 10 42 20" />
      <path d="M9 32 H39" />
      <path d="M14 40 A4 4 0 1 0 14 39.9 Z" />
      <path d="M34 40 A4 4 0 1 0 34 39.9 Z" />
      <path d="M2 46 H46" />
    </>
  ),
  pivote: (
    <>
      <path d="M8 44 V16" />
      <path d="M4 44 H12" />
      <path d="M8 18 H44" />
      <path d="M8 18 L18 28 L28 18 L38 28 L44 18" />
      <path d="M18 28 V36 M38 28 V36" />
      <path d="M15 40 A3 3 0 1 0 15 39.9 Z" />
      <path d="M35 40 A3 3 0 1 0 35 39.9 Z" />
    </>
  ),
  hidroponia: (
    <>
      <path d="M5 28 H43 V35 H5 Z" />
      <path d="M16 28 V20 C12 20 10 17 9 13 C13 13 15 16 16 20 C17 16 19 13 23 13 C22 17 20 20 16 20" />
      <path d="M32 28 V21 C28 21 26 18 25 14 C29 14 31 17 32 21 C33 17 35 14 39 14 C38 18 36 21 32 21" />
      <path d="M14 35 V41 M18 35 V43 M30 35 V41 M34 35 V43" />
    </>
  ),
};

export function TiposRiego() {
  return (
    <section id="tipos-riego" aria-labelledby="tipos-riego-titulo" className="bg-tinta text-mineral">
      <div className="mx-auto grid max-w-[78rem] gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <h2
            id="tipos-riego-titulo"
            className="max-w-[15ch] font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.02] [text-wrap:balance]"
          >
            Seis sistemas de riego, uno para cada finca
          </h2>
          <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-mineral/85 [text-wrap:pretty]">
            El sistema correcto depende del cultivo, el terreno, el agua
            disponible y el tamaño del lote. En la visita de diagnóstico lo
            medimos antes de recomendarle nada.
          </p>
          <a
            href="#contacto"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-full bg-maiz px-7 py-3.5 font-semibold text-tinta transition-colors hover:bg-[#ffc04a]"
          >
            Pedir visita de diagnóstico
          </a>
        </div>

        <ul className="tipos-riego border-t border-mineral/15">
          {tiposRiego.map((tipo) => (
            <li
              key={tipo.id}
              className="tipo-riego grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-x-5 gap-y-3 border-b border-mineral/15 py-7 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-7"
            >
              <svg
                viewBox="0 0 48 48"
                className="h-12 w-12 text-riego sm:h-14 sm:w-14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {pictogramas[tipo.id]}
              </svg>
              <div>
                <h3 className="font-display text-xl font-bold leading-tight sm:text-2xl">{tipo.nombre}</h3>
                <p className="mt-1.5 max-w-[48ch] leading-relaxed text-mineral/85">{tipo.texto}</p>
              </div>
              <a
                href={enlaceWhatsApp(`Hola Agrológico, me interesa un sistema de ${tipo.nombre.toLowerCase()} para mi finca.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="col-start-2 inline-flex min-h-11 items-center gap-2 justify-self-start font-semibold text-maiz underline decoration-maiz/40 underline-offset-4 transition-colors hover:decoration-maiz sm:col-start-3"
              >
                Consultar
                <span className="sr-only"> sobre {tipo.nombre} por WhatsApp</span>
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 8 H13 M9 4 L13 8 L9 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
