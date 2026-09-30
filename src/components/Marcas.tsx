import { marcas } from "../data/site";

/* Altura máxima del logo según su forma, para que un logo apilado
   (Metzer) y uno horizontal (Nelson) se lean del mismo tamaño. */
const altura: Record<string, string> = {
  bajo: "max-h-10 sm:max-h-12",
  medio: "max-h-14 sm:max-h-16",
  alto: "max-h-20 sm:max-h-24",
};

export function Marcas() {
  return (
    <section id="marcas" className="mx-auto max-w-[78rem] px-5 py-20 sm:px-8 sm:py-28">
      <div className="max-w-[42rem]">
        <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.02]">
          Marcas que distribuimos
        </h2>
        <p className="mt-4 max-w-[52ch] leading-relaxed text-tinta-suave">
          Trabajamos con fabricantes de riego y agricultura protegida que
          conocemos en campo. Si necesita un producto de estas líneas, lo
          cotizamos y lo instalamos.
        </p>
      </div>

      <div className="surco mt-8 mb-10" />

      <ul className="grid grid-cols-2 gap-px overflow-hidden border border-linea bg-linea sm:grid-cols-3">
        {marcas.map(({ nombre, logo, alto }) => (
          <li
            key={nombre}
            className="flex h-32 items-center justify-center bg-white px-6 sm:h-44 sm:px-10"
          >
            <img
              src={`${import.meta.env.BASE_URL}marcas/${logo}`}
              alt={nombre}
              loading="lazy"
              className={`w-auto max-w-full object-contain ${altura[alto]}`}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
