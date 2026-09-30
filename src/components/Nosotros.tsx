import { cifras } from "../data/site";

export function Nosotros() {
  return (
    <section id="nosotros" className="mx-auto max-w-[78rem] px-5 py-20 sm:px-8 sm:py-28">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.02]">
            Somos la casa
            <br />
            agrícola de la región
          </h2>
          <div className="surco mt-8" />

          <figure className="foto-nivel mt-8 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1000&q=70&auto=format&fit=crop"
              alt="Cuadrilla cosechando hortaliza en el campo al amanecer"
              width={1000}
              height={667}
              loading="lazy"
              className="aspect-[3/2] w-full object-cover"
            />
          </figure>
        </div>

        <div className="lg:pt-4">
          <p className="nosotros-lema text-xl leading-relaxed text-tinta">
            Agrológico nació en 2008 como una bodega de insumos a la orilla de la
            carretera. Hoy tenemos taller, vivero y un equipo de agrónomos que pasa
            más tiempo en las fincas que en la oficina.
          </p>

          <p className="mt-5 max-w-[60ch] leading-relaxed text-tinta-suave">
            Lo que no cambió es la forma de trabajar: primero vemos el terreno,
            medimos el agua disponible y revisamos el suelo. Después recomendamos.
            Un sistema de riego mal dimensionado cuesta más que uno bien hecho, y
            un fertilizante aplicado sin análisis se va con la lluvia.
          </p>

          <p className="mt-5 max-w-[60ch] leading-relaxed text-tinta-suave">
            Trabajamos con productores de hortaliza, café, granos básicos y
            ganadería. Damos crédito a clientes recurrentes y facturamos para que
            la inversión quede documentada.
          </p>

          {/* Cifras: dato arriba, contexto abajo, sin tarjetas */}
          <dl className="mt-12 grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4 lg:gap-x-6">
            {cifras.map(({ valor, unidad, nota }, i) => (
              <div
                key={nota}
                className="cifra relative pt-4 before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-milpa"
                style={{ "--i": i } as React.CSSProperties}
              >
                <dt className="sr-only">{nota}</dt>
                <dd>
                  <span className="cifra-valor block font-display text-4xl font-extrabold leading-none tracking-[-0.04em] text-milpa">
                    {valor}
                  </span>
                  <span className="mt-1.5 block font-display text-sm font-semibold text-tinta">
                    {unidad}
                  </span>
                  <span className="mt-1 block text-sm leading-snug text-tinta-suave">{nota}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
