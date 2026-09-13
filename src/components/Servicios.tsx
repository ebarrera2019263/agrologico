import { servicios } from "../data/site";
import { iconos } from "./Iconos";

export function Servicios() {
  return (
    <section id="servicios" className="bg-tinta text-mineral">
      <div className="mx-auto max-w-[78rem] px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-[42rem]">
          <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.02]">
            Todo lo que necesita
            <br />
            el ciclo del cultivo
          </h2>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-mineral/75">
            Seis líneas de trabajo que se cruzan entre sí: el riego define la
            nutrición, la nutrición define el rendimiento y la asesoría amarra
            todo el plan.
          </p>
        </div>

        <ul className="mt-14 grid gap-px overflow-hidden border border-mineral/15 bg-mineral/15 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((servicio) => {
            const Icono = iconos[servicio.icono];
            return (
              <li key={servicio.id} className="group bg-tinta p-7 transition-colors hover:bg-[#17301f] sm:p-9">
                <Icono className="h-9 w-9 text-agua" />

                <h3 className="mt-6 font-display text-xl font-bold leading-snug">
                  {servicio.titulo}
                </h3>

                <p className="mt-3 text-[0.95rem] leading-relaxed text-mineral/70">
                  {servicio.resumen}
                </p>

                <ul className="mt-6 space-y-2 border-t border-mineral/15 pt-5">
                  {servicio.detalles.map((detalle) => (
                    <li key={detalle} className="flex gap-3 text-sm leading-snug text-mineral/65">
                      <span className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-maiz" aria-hidden="true" />
                      {detalle}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>

        <div className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-[44ch] text-mineral/70">
            ¿No encuentra lo que busca? Conseguimos producto por pedido especial.
          </p>
          <a
            href="#contacto"
            className="inline-flex items-center justify-center rounded-full bg-maiz px-7 py-3.5 font-semibold text-tinta transition-colors hover:bg-[#f2ba33]"
          >
            Consultar por un producto
          </a>
        </div>
      </div>
    </section>
  );
}
