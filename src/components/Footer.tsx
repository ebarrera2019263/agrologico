import { Logo } from "./Logo";
import { empresa, secciones, servicios, enlaceWhatsApp } from "../data/site";

export function Footer() {
  return (
    <footer id="pie" className="bg-tinta text-mineral">
      <div className="mx-auto max-w-[78rem] px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Logo className="h-12 w-auto" />
            <p className="mt-5 max-w-[34ch] leading-relaxed text-mineral/65">
              {empresa.descriptor}. Riego, nutrición, semilla y asesoría técnica
              para productores de la región.
            </p>
            <a
              href={enlaceWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-block font-semibold text-agua hover:text-maiz"
            >
              {empresa.whatsappVisible}
            </a>
          </div>

          <nav aria-label="Secciones">
            <h2 className="font-display text-sm font-semibold text-maiz">Secciones</h2>
            <ul className="mt-4 space-y-2.5">
              {secciones.map(({ id, nombre }) => (
                <li key={id}>
                  <a href={`#${id}`} className="text-mineral/70 hover:text-mineral">
                    {nombre}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Servicios">
            <h2 className="font-display text-sm font-semibold text-maiz">Servicios</h2>
            <ul className="mt-4 space-y-2.5">
              {servicios.map((s) => (
                <li key={s.id}>
                  <a href="#servicios" className="text-mineral/70 hover:text-mineral">
                    {s.titulo}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-mineral/15 pt-7 text-sm text-mineral/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {empresa.nombre}. Todos los derechos reservados.
          </p>
          <p>
            {empresa.direccion}, {empresa.ciudad}
          </p>
        </div>
      </div>
    </footer>
  );
}
