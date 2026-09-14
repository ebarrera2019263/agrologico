import { useState, type FormEvent } from "react";
import { empresa, motivos, enlaceWhatsApp } from "../data/site";
import { IconoWhatsApp } from "./Iconos";

type Campos = {
  nombre: string;
  telefono: string;
  correo: string;
  motivo: string;
  cultivo: string;
  mensaje: string;
};

const vacio: Campos = {
  nombre: "",
  telefono: "",
  correo: "",
  motivo: motivos[0],
  cultivo: "",
  mensaje: "",
};

type Errores = Partial<Record<keyof Campos, string>>;

function validar(datos: Campos): Errores {
  const errores: Errores = {};

  if (datos.nombre.trim().length < 3) {
    errores.nombre = "Escriba su nombre completo.";
  }

  const telefono = datos.telefono.replace(/[\s()+-]/g, "");
  if (!/^\d{8,15}$/.test(telefono)) {
    errores.telefono = "Necesitamos un teléfono de 8 dígitos o más.";
  }

  if (datos.correo.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(datos.correo.trim())) {
    errores.correo = "Ese correo no parece válido.";
  }

  if (datos.mensaje.trim().length < 10) {
    errores.mensaje = "Cuéntenos un poco más para poder ayudarle.";
  }

  return errores;
}

const etiquetaCampo = "block font-display text-sm font-semibold text-tinta";
const campo =
  "mt-2 w-full border border-linea bg-white px-4 py-3.5 text-tinta placeholder:text-tinta-suave/55 transition-colors focus:border-agua focus:outline-none";

export function Contacto() {
  const [datos, setDatos] = useState<Campos>(vacio);
  const [errores, setErrores] = useState<Errores>({});
  const [estado, setEstado] = useState<"listo" | "enviando" | "enviado">("listo");

  const actualizar = (clave: keyof Campos) => (valor: string) => {
    setDatos((previo) => ({ ...previo, [clave]: valor }));
    if (errores[clave]) {
      setErrores((previo) => ({ ...previo, [clave]: undefined }));
    }
  };

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const encontrados = validar(datos);
    setErrores(encontrados);

    if (Object.keys(encontrados).length > 0) {
      const primero = Object.keys(encontrados)[0];
      document.getElementById(primero)?.focus();
      return;
    }

    setEstado("enviando");

    /* --------------------------------------------------------------
       Conectar aquí el envío real. Dos caminos usuales:

       1) Servicio sin backend (Formspree, Web3Forms, Basin):
          await fetch("https://formspree.io/f/TU_ID", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(datos),
          });

       2) Endpoint propio: POST a /api/contacto

       Mientras tanto simulamos la espera para mostrar los estados.
       -------------------------------------------------------------- */
    await new Promise((r) => setTimeout(r, 700));

    setEstado("enviado");
  }

  /* Si el formulario falla, el cliente no debería quedarse sin vía:
     el mismo contenido se puede mandar por WhatsApp. */
  const respaldoWhatsApp = enlaceWhatsApp(
    `Hola Agrológico. Soy ${datos.nombre || "un productor"}. ` +
      `Motivo: ${datos.motivo}. ${datos.cultivo ? `Cultivo: ${datos.cultivo}. ` : ""}` +
      `${datos.mensaje || ""}`,
  );

  return (
    <section id="contacto" className="bg-mineral-claro">
      <div className="mx-auto max-w-[78rem] px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-[42rem]">
          <h2 className="font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.02]">
            Cuéntenos qué necesita{" "}
            <br className="hidden sm:block" />
            su parcela
          </h2>
          <p className="mt-6 max-w-[54ch] text-lg leading-relaxed text-tinta-suave">
            Respondemos el mismo día hábil. Si prefiere hablar de una vez,
            escríbanos por WhatsApp y le contesta un agrónomo.
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          {/* Formulario */}
          <div>
            {estado === "enviado" ? (
              <div className="border-l-4 border-milpa bg-white p-8">
                <h3 className="font-display text-2xl font-bold text-milpa">Mensaje recibido</h3>
                <p className="mt-3 max-w-[48ch] leading-relaxed text-tinta-suave">
                  Gracias, {datos.nombre.split(" ")[0]}. Un agrónomo le llama al{" "}
                  {datos.telefono} dentro del día hábil para agendar la visita.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDatos(vacio);
                    setEstado("listo");
                  }}
                  className="mt-6 font-semibold text-agua-profunda underline underline-offset-4 hover:text-milpa"
                >
                  Enviar otra consulta
                </button>
              </div>
            ) : (
              <form onSubmit={enviar} noValidate className="grid gap-6 sm:grid-cols-2">
                <Campo
                  id="nombre"
                  etiqueta="Nombre completo"
                  valor={datos.nombre}
                  alCambiar={actualizar("nombre")}
                  error={errores.nombre}
                  autoComplete="name"
                  placeholder="Juan Pérez"
                />

                <Campo
                  id="telefono"
                  etiqueta="Teléfono"
                  tipo="tel"
                  valor={datos.telefono}
                  alCambiar={actualizar("telefono")}
                  error={errores.telefono}
                  autoComplete="tel"
                  placeholder="5555 5555"
                />

                <Campo
                  id="correo"
                  etiqueta="Correo"
                  opcional
                  tipo="email"
                  valor={datos.correo}
                  alCambiar={actualizar("correo")}
                  error={errores.correo}
                  autoComplete="email"
                  placeholder="juan@correo.com"
                />

                <div>
                  <label htmlFor="motivo" className={etiquetaCampo}>
                    Motivo
                  </label>
                  <select
                    id="motivo"
                    name="motivo"
                    value={datos.motivo}
                    onChange={(e) => actualizar("motivo")(e.target.value)}
                    className={campo}
                  >
                    {motivos.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <Campo
                    id="cultivo"
                    etiqueta="Cultivo y área aproximada"
                    opcional
                    valor={datos.cultivo}
                    alCambiar={actualizar("cultivo")}
                    placeholder="Tomate, 2 manzanas"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="mensaje" className={etiquetaCampo}>
                    ¿Qué necesita?
                  </label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    rows={5}
                    value={datos.mensaje}
                    onChange={(e) => actualizar("mensaje")(e.target.value)}
                    aria-invalid={errores.mensaje ? true : undefined}
                    aria-describedby={errores.mensaje ? "mensaje-error" : undefined}
                    placeholder="Tengo un pozo a 300 metros de la parcela y quiero saber si alcanza la presión para riego por goteo."
                    className={`${campo} resize-y ${errores.mensaje ? "border-tierra" : ""}`}
                  />
                  {errores.mensaje && (
                    <p id="mensaje-error" className="mt-2 text-sm text-tierra">
                      {errores.mensaje}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={estado === "enviando"}
                    className="inline-flex items-center justify-center rounded-full bg-milpa px-8 py-4 font-semibold text-white transition-colors hover:bg-milpa-claro disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {estado === "enviando" ? "Enviando…" : "Enviar consulta"}
                  </button>

                  <a
                    href={respaldoWhatsApp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 font-semibold text-agua-profunda underline underline-offset-4 hover:text-milpa"
                  >
                    <IconoWhatsApp className="h-4 w-4" />
                    Mandarlo por WhatsApp
                  </a>
                </div>

                <p className="sm:col-span-2 text-sm text-tinta-suave">
                  Usamos sus datos solo para responder esta consulta.
                </p>
              </form>
            )}
          </div>

          {/* Datos de la empresa */}
          <div>
            <dl className="space-y-7">
              <Dato titulo="Bodega y oficinas">
                {empresa.direccion}
                <br />
                {empresa.ciudad}
              </Dato>

              <Dato titulo="Teléfono">
                <a href={`tel:${empresa.telefonoEnlace}`} className="hover:text-milpa">
                  {empresa.telefono}
                </a>
                <br />
                <a
                  href={enlaceWhatsApp()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-milpa"
                >
                  {empresa.whatsappVisible} (WhatsApp)
                </a>
              </Dato>

              <Dato titulo="Correo">
                <a href={`mailto:${empresa.correo}`} className="hover:text-milpa">
                  {empresa.correo}
                </a>
              </Dato>

              <Dato titulo="Horario de atención">
                <ul className="space-y-1">
                  {empresa.horario.map(({ dias, horas }) => (
                    <li key={dias} className="flex justify-between gap-4 border-b border-linea pb-1">
                      <span>{dias}</span>
                      <span className="text-tinta">{horas}</span>
                    </li>
                  ))}
                </ul>
              </Dato>
            </dl>

            <div className="mt-8 overflow-hidden border border-linea">
              <iframe
                src={empresa.mapa}
                title="Ubicación de Agrológico en el mapa"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-64 w-full border-0 grayscale-[0.35]"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* --- piezas del formulario ------------------------------------- */

function Campo({
  id,
  etiqueta,
  valor,
  alCambiar,
  error,
  tipo = "text",
  opcional,
  ...resto
}: {
  id: string;
  etiqueta: string;
  valor: string;
  alCambiar: (v: string) => void;
  error?: string;
  tipo?: string;
  opcional?: boolean;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={etiquetaCampo}>
        {etiqueta}
        {opcional && <span className="font-sans font-normal text-tinta-suave"> (opcional)</span>}
      </label>
      <input
        id={id}
        name={id}
        type={tipo}
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${campo} ${error ? "border-tierra" : ""}`}
        {...resto}
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-sm text-tierra">
          {error}
        </p>
      )}
    </div>
  );
}

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="border-t-2 border-milpa pt-4">
      <dt className="font-display text-sm font-semibold text-milpa">{titulo}</dt>
      <dd className="mt-2 leading-relaxed text-tinta-suave">{children}</dd>
    </div>
  );
}
