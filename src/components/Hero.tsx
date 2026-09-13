import { enlaceWhatsApp } from "../data/site";
import { IconoWhatsApp } from "./Iconos";

/* Anotación de plano: una cifra técnica colgada de una línea guía,
   como las acotaciones de un diseño de riego. */
function Acotacion({
  clase,
  dato,
  etiqueta,
  lado = "izquierda",
}: {
  clase: string;
  dato: string;
  etiqueta: string;
  lado?: "izquierda" | "derecha";
}) {
  return (
    <div className={`absolute hidden items-center gap-2 lg:flex ${clase}`}>
      {lado === "derecha" && <span className="h-px w-8 bg-maiz" />}
      <span className="bg-tinta/85 px-2.5 py-1.5 backdrop-blur-sm">
        <span className="block font-display text-base font-bold leading-none text-maiz">{dato}</span>
        <span className="block pt-0.5 text-[0.7rem] leading-none text-mineral/70">{etiqueta}</span>
      </span>
      {lado === "izquierda" && <span className="h-px w-8 bg-maiz" />}
    </div>
  );
}

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden bg-tinta text-mineral">
      {/* Trama de parcela muy tenue detrás de todo */}
      <div className="parcela pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-[78rem] gap-12 px-5 pb-16 pt-32 sm:px-8 sm:pb-20 sm:pt-36 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-40">
        {/* Columna de texto */}
        <div className="max-w-[34rem]">
          <p className="flex items-center gap-3 text-sm text-mineral/65">
            <span className="h-px w-10 bg-agua" />
            Cobertura técnica en seis departamentos
          </p>

          <h1 className="mt-6 font-display text-[clamp(2.75rem,7.5vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.035em]">
            El agua llega
            <br />
            hasta donde
            <br />
            usted siembra.
          </h1>

          <p className="mt-7 max-w-[46ch] text-lg leading-relaxed text-mineral/80">
            Diseñamos e instalamos sistemas de riego, y surtimos la finca con
            fertilizantes, semilla y equipo. Un agrónomo visita su parcela antes de
            que compre nada.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center rounded-full bg-maiz px-7 py-4 font-semibold text-tinta transition-colors hover:bg-[#f2ba33]"
            >
              Pedir una visita técnica
            </a>
            <a
              href="#servicios"
              className="inline-flex items-center justify-center rounded-full border border-mineral/30 px-7 py-4 font-semibold text-mineral transition-colors hover:border-mineral/60 hover:bg-mineral/5"
            >
              Ver lo que manejamos
            </a>
          </div>

          <p className="mt-8 text-sm text-mineral/55">
            La visita de diagnóstico no tiene costo y se agenda dentro de 48 horas.
          </p>
        </div>

        {/* Panel de campo: la foto leída como un plano de riego */}
        <figure className="relative">
          <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/4] lg:aspect-[4/5]">
            <img
              src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=75&auto=format&fit=crop"
              alt="Plantas de maíz recién emergidas en hileras sobre suelo húmedo"
              width={1200}
              height={1500}
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
            <div
              className="absolute inset-0 bg-gradient-to-tr from-tinta/70 via-tinta/10 to-transparent"
              aria-hidden="true"
            />

            {/* Capa de anotación: la línea de goteo y sus emisores */}
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 400 500"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line x1="0" y1="150" x2="400" y2="150" stroke="var(--color-agua)" strokeWidth="2" opacity="0.85" />
              <line
                x1="0"
                y1="330"
                x2="400"
                y2="330"
                stroke="var(--color-agua)"
                strokeWidth="1.5"
                strokeDasharray="10 8"
                opacity="0.5"
              />
            </svg>

            {/* Las gotas: el único movimiento no provocado de la página */}
            <div className="absolute inset-x-0 top-[30%]" aria-hidden="true">
              <div className="relative mx-auto flex w-full max-w-none justify-around px-[12%]">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="gota block h-2.5 w-1.5 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-agua"
                    style={{ animationDelay: `${i * 0.45}s` }}
                  />
                ))}
              </div>
            </div>
          </div>

          <Acotacion clase="left-0 top-[26%] -translate-x-1/3" dato="1.6 L/h" etiqueta="caudal por emisor" />
          <Acotacion
            clase="right-0 top-[62%] translate-x-1/3"
            dato="0.30 m"
            etiqueta="entre emisores"
            lado="derecha"
          />

          <figcaption className="mt-4 text-sm text-mineral/55">
            Maíz en etapa temprana bajo riego por goteo, Sacatepéquez.
          </figcaption>
        </figure>
      </div>

      {/* Franja de confianza al pie del hero */}
      <div className="relative border-t border-mineral/15">
        <div className="mx-auto flex max-w-[78rem] flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-sm text-mineral/70">
            Atendemos desde la parcela familiar hasta la finca comercial.
          </p>
          <a
            href={enlaceWhatsApp()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-agua transition-colors hover:text-mineral"
          >
            <IconoWhatsApp className="h-4 w-4" />
            Consultar disponibilidad por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
