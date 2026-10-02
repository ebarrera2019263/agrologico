import { useRef, useState } from "react";
import { enlaceWhatsApp, marcas, productosPorMarca } from "../data/site";
import { IconoWhatsApp } from "./Iconos";

const base = import.meta.env.BASE_URL;
const logoDe = (nombre: string) => marcas.find((m) => m.nombre === nombre)?.logo;

/* Una pestaña por marca: así cada línea se ve completa, con su foto
   grande, sin apilar cinco bloques casi iguales uno tras otro. */
export function ProductosMarca() {
  const [activa, setActiva] = useState(0);
  const pestanas = useRef<(HTMLButtonElement | null)[]>([]);
  const linea = productosPorMarca[activa];
  const logo = logoDe(linea.marca);

  const alTeclear = (e: React.KeyboardEvent) => {
    const paso = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!paso) return;
    e.preventDefault();
    const siguiente = (activa + paso + productosPorMarca.length) % productosPorMarca.length;
    setActiva(siguiente);
    pestanas.current[siguiente]?.focus();
  };

  return (
    <section id="productos" className="mx-auto max-w-[78rem] px-5 pb-20 sm:px-8 sm:pb-28">
      <div className="max-w-[42rem]">
        <h2 className="font-display text-[clamp(1.75rem,3.6vw,2.5rem)] font-extrabold leading-[1.05]">
          Productos de cada marca
        </h2>
        <p className="mt-4 max-w-[52ch] leading-relaxed text-tinta-suave">
          Elija una marca para ver lo que manejamos de su línea. Si no ve la
          pieza que busca, pregúntenos: trabajamos el catálogo completo.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Marcas"
        onKeyDown={alTeclear}
        className="mt-10 flex flex-wrap gap-2"
      >
        {productosPorMarca.map(({ marca }, i) => {
          const seleccionada = i === activa;
          return (
            <button
              key={marca}
              ref={(el) => {
                pestanas.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`pestana-${marca}`}
              aria-selected={seleccionada}
              aria-controls="panel-productos"
              tabIndex={seleccionada ? 0 : -1}
              onClick={() => setActiva(i)}
              className={`shrink-0 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                seleccionada
                  ? "border-tinta bg-tinta text-mineral"
                  : "border-linea bg-white text-tinta-suave hover:border-tinta/40 hover:text-tinta"
              }`}
            >
              {marca}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="panel-productos"
        aria-labelledby={`pestana-${linea.marca}`}
        className="mt-6 grid overflow-hidden border border-linea bg-white lg:grid-cols-[1.35fr_1fr]"
      >
        <img
          key={linea.foto}
          src={`${base}productos/${linea.foto}`}
          alt={`Productos ${linea.marca}: ${linea.productos.join(", ").toLowerCase()}`}
          width={1200}
          height={900}
          loading="lazy"
          className="aspect-[4/3] w-full object-contain p-4 sm:p-8 animate-[aparecer_0.4s_ease-out]"
        />

        <div className="flex flex-col border-t border-linea p-7 sm:p-10 lg:border-l lg:border-t-0">
          {logo && (
            <img
              src={`${base}marcas/${logo}`}
              alt={linea.marca}
              className="h-12 w-auto self-start object-contain sm:h-14"
            />
          )}

          <p className="mt-6 leading-relaxed text-tinta-suave">{linea.resumen}</p>

          <ul className="mt-6 border-t border-linea pt-5">
            {linea.productos.map((producto) => (
              <li key={producto} className="flex gap-3 py-1.5 leading-snug">
                <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-maiz" aria-hidden="true" />
                {producto}
              </li>
            ))}
          </ul>

          <a
            href={enlaceWhatsApp(`Hola Agrológico, quiero cotizar productos ${linea.marca}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center gap-2 self-start rounded-full bg-milpa-claro px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-milpa lg:mt-auto"
          >
            <IconoWhatsApp className="h-4 w-4" />
            Cotizar productos {linea.marca}
          </a>
        </div>
      </div>
    </section>
  );
}
