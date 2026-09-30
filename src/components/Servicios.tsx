import { servicios } from "../data/site";
import { iconos } from "./Iconos";

/* Siete servicios no llenan una retícula de dos o tres columnas, así
   que el riego (la especialidad) y la asesoría ocupan doble ancho para
   cerrar cada fila sin huecos. En esas tarjetas anchas los detalles se
   reparten en dos columnas. */
const ancho: Record<string, string> = {
  riego: "sm:col-span-2",
  asesoria: "lg:col-span-2",
};
const detallesAnchos: Record<string, string> = {
  riego: "sm:columns-2 sm:gap-8",
  asesoria: "lg:columns-2 lg:gap-8",
};

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
            Siete líneas de trabajo que se cruzan entre sí: el riego y la
            cobertura definen el ambiente del cultivo, la nutrición define el
            rendimiento y la asesoría amarra todo el plan.
          </p>
        </div>

        <ul className="mt-14 grid gap-px overflow-hidden border border-mineral/15 bg-mineral/15 sm:grid-cols-2 lg:grid-cols-3">
          {servicios.map((servicio, i) => {
            const Icono = iconos[servicio.icono];
            return (
              <li
                key={servicio.id}
                style={{ "--col": i % 3 } as React.CSSProperties}
                className={`servicio group bg-tinta p-7 ${ancho[servicio.id] ?? ""} transition-colors hover:bg-[#004c3d] sm:p-9`}>
                <Icono className="h-9 w-9 text-agua" />

                <h3 className="mt-6 font-display text-xl font-bold leading-snug">
                  {servicio.titulo}
                </h3>

                <p className="mt-3 max-w-[60ch] text-[0.95rem] leading-relaxed text-mineral/70">
                  {servicio.resumen}
                </p>

                <ul className={`mt-6 border-t border-mineral/15 pt-5 ${detallesAnchos[servicio.id] ?? ""}`}>
                  {servicio.detalles.map((detalle) => (
                    <li key={detalle} className="flex break-inside-avoid gap-3 pb-2 text-sm leading-snug text-mineral/65">
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
            className="inline-flex items-center justify-center rounded-full bg-maiz px-7 py-3.5 font-semibold text-tinta transition-colors hover:bg-[#ffc04a]"
          >
            Consultar por un producto
          </a>
        </div>
      </div>
    </section>
  );
}
