import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { enlaceWhatsApp } from "../data/site";
import { estadoFinal, plano, type EstadoCampo } from "../escena/estado";
import type { Campo } from "../escena/campo";
import { IconoWhatsApp } from "./Iconos";
import "./Hero.css";

gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------------
   Hero: el campo contado con el scroll, en 3D.

   Al llegar se lee el titular con la parcela detrás. Al bajar, el texto
   cede y una cámara tipo dron recorre el proceso: el tractor prepara el
   terreno, se tiende la tubería, la sonda detecta humedad baja, la
   bomba arranca, el agua recorre las líneas, los aspersores se abren y
   el cultivo responde. Cierra con el mensaje y la llamada a la visita.

   La escena (src/escena/campo.ts, Three.js) se carga aparte para no
   retrasar el titular. Esta timeline solo mueve números en `estado`;
   la escena los lee en cada cuadro. Sin WebGL queda el fondo liso y el
   texto; con movimiento reducido se dibuja un solo cuadro del sistema
   completo, sin fijar la sección.
   --------------------------------------------------------------- */

const HUMEDAD = { inicial: 58, baja: 32, optima: 68 };

const ETAPAS = [
  "Un campo listo para producir",
  "Preparación del terreno",
  "Instalación del sistema de riego",
  "La sonda mide la humedad del suelo",
  "La bomba entra en marcha",
  "Riego por aspersión, línea por línea",
  "Un cultivo sano y parejo",
];

/* Momento (en unidades de la timeline) de cada etapa. */
const T = {
  campo: 0.6,
  tractor: 1.1,
  sistema: 3.6,
  sensor: 5.4,
  bomba: 6.5,
  agua: 6.9,
  riego: 8.3,
  cultivo: 10,
  mensaje: 11.5,
  fin: 13,
};
const INICIO_ETAPAS = [T.campo, T.tractor, T.sistema, T.sensor, T.bomba, T.riego, T.cultivo];

const CONSULTA_ANIMAR = "(prefers-reduced-motion: no-preference) and (min-height: 540px)";

export function Hero() {
  const seccionRef = useRef<HTMLElement>(null);
  const escenaRef = useRef<HTMLDivElement>(null);
  const textoRef = useRef<HTMLDivElement>(null);
  const etapasRef = useRef<HTMLLIElement[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const humedadRef = useRef<HTMLSpanElement>(null);
  const medidorRef = useRef<HTMLSpanElement>(null);
  const mensajeRef = useRef<HTMLDivElement>(null);
  /* Estado que comparten la timeline y la escena 3D. */
  const estadoRef = useRef<EstadoCampo>(estadoFinal());

  /* ----- Escena 3D: se carga aparte y se libera al desmontar ----- */
  useEffect(() => {
    const seccion = seccionRef.current;
    const contenedor = escenaRef.current;
    if (!seccion || !contenedor) return;
    let campo: Campo | null = null;
    let cancelado = false;
    const animado = window.matchMedia(CONSULTA_ANIMAR).matches;
    const ligero = window.matchMedia("(max-width: 1023.98px)").matches;

    import("../escena/campo")
      .then(({ crearCampo }) => {
        if (cancelado) return;
        campo = crearCampo(contenedor, estadoRef.current, { ligero, animado });
        contenedor.classList.add("hc-escena--lista");
      })
      .catch(() => {
        /* Sin WebGL (o si el paquete no carga) queda el fondo liso. */
        seccion.classList.add("hc--sin3d");
      });

    return () => {
      cancelado = true;
      campo?.dispose();
    };
  }, []);

  /* ----- Coreografía con el scroll ----- */
  useLayoutEffect(() => {
    const seccion = seccionRef.current;
    const texto = textoRef.current;
    const panel = panelRef.current;
    const humedad = humedadRef.current;
    const medidor = medidorRef.current;
    const mensaje = mensajeRef.current;
    const estado = estadoRef.current;
    if (!seccion || !texto || !panel || !humedad || !medidor || !mensaje) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          animar: CONSULTA_ANIMAR,
          vertical: "(max-aspect-ratio: 1/1)",
          movil: "(max-width: 767.98px)",
        },
        (contexto) => {
          const { animar, vertical, movil } = contexto.conditions as Record<string, boolean>;
          if (!animar) return;

          seccion.classList.add("hc--animada");

          /* Selector acotado a la sección: nunca toca el resto del documento. */
          const q = gsap.utils.selector(seccion);
          const etapas = etapasRef.current;

          /* ----- Estado inicial: parcela sembrada, sin sistema ----- */
          gsap.set(estado, {
            camara: 0,
            tractor: 0,
            sistema: 0,
            aspersores: 0,
            sondas: 0,
            bomba: 0,
            agua: 0,
            riego: 0,
            crecimiento: 0,
            verdor: 0,
          });
          gsap.set(etapas, { autoAlpha: 0, y: 16 });
          gsap.set(q(".hc-avance"), { autoAlpha: 0 });
          gsap.set(q(".hc-avance-lleno"), { scaleX: 0 });
          gsap.set(mensaje, { autoAlpha: 0 });
          gsap.set(q(".hc-mensaje-linea"), { yPercent: 40, autoAlpha: 0 });
          gsap.set(panel, { autoAlpha: 0, y: 16 });
          gsap.set(q(".hc-chip"), { autoAlpha: 0, y: 6 });
          gsap.set(medidor, { scaleX: HUMEDAD.inicial / 100, transformOrigin: "0% 50%" });

          const lectura = { valor: HUMEDAD.inicial };
          const pintarHumedad = () => {
            humedad.textContent = String(Math.round(lectura.valor));
          };
          pintarHumedad();

          const camara = (indice: number, duracion: number, en: number) =>
            tl.to(estado, { camara: plano(indice), duration: duracion, ease: "power2.inOut" }, en);

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: seccion,
              start: "top top",
              end: movil ? "+=3600" : "+=4800",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          /* ----- El texto de llegada cede y la escena queda sola -----
             Arranca apenas después de 0 para no leer el estado a medio
             camino de la entrada con que carga la página. */
          tl.fromTo(texto, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -48, duration: 0.5, ease: "power2.in", immediateRender: false }, 0.05)
            .fromTo(q(".hc-velo"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.7, immediateRender: false }, 0.1)
            .fromTo(q(".hero-franja"), { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, 0.05);

          /* ----- Leyenda de cada etapa y avance ----- */
          INICIO_ETAPAS.forEach((inicio, i) => {
            const siguiente = INICIO_ETAPAS[i + 1] ?? T.mensaje;
            tl.to(q(".hc-avance-lleno")[i], { scaleX: 1, duration: siguiente - inicio }, inicio)
              .to(etapas[i], { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }, inicio)
              .to(etapas[i], { autoAlpha: 0, y: -16, duration: 0.3, ease: "power2.in" }, siguiente - 0.35);
          });
          tl.to(q(".hc-avance"), { autoAlpha: 1, duration: 0.3 }, T.campo - 0.1).to(
            q(".hc-avance"),
            { autoAlpha: 0, duration: 0.3 },
            T.mensaje - 0.2,
          );

          /* 1–2 · El campo y el tractor preparando el terreno al fondo. */
          camara(1, 0.8, 0);
          camara(2, 1.0, 0.8);
          tl.to(estado, { tractor: 1, duration: T.sistema - T.tractor + 0.4 }, T.tractor);

          /* 3 · Instalación: la cámara baja a la bomba y se tiende la línea. */
          camara(3, 1.0, T.sistema - 0.4);
          tl.to(estado, { sistema: 1, duration: 1.4, ease: "power1.inOut" }, T.sistema)
            .to(estado, { aspersores: 1, duration: 1.0 }, T.sistema + 0.8)
            .to(estado, { sondas: 1, duration: 0.6 }, T.sistema + 1.3);

          /* 5 · Sensor: la cámara va a la sonda; la lectura cae bajo el umbral. */
          camara(4, 0.9, T.sensor - 0.4);
          tl.to(panel, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, T.sensor)
            .to(lectura, { valor: HUMEDAD.baja, duration: 0.7, ease: "power1.inOut", onUpdate: pintarHumedad }, T.sensor + 0.2)
            .to(medidor, { scaleX: HUMEDAD.baja / 100, duration: 0.7, ease: "power1.inOut" }, T.sensor + 0.2)
            .to(q(".hc-chip-baja"), { autoAlpha: 1, y: 0, duration: 0.25 }, T.sensor + 0.8);

          /* 6 · Bomba: de vuelta a la bomba, que arranca. */
          camara(5, 0.8, T.bomba - 0.5);
          tl.to(estado, { bomba: 1, duration: 0.4, ease: "power2.out" }, T.bomba + 0.1);

          /* 4 · Agua: la cámara sigue la principal mientras se llena. */
          camara(6, 0.9, T.agua);
          tl.to(estado, { agua: 1, duration: 1.4 }, T.agua + 0.1);

          /* 7 · Aspersores: se abren del más cercano a la bomba al más lejano. */
          camara(7, 1.0, T.riego - 0.5);
          tl.to(estado, { riego: 1, duration: 1.8 }, T.riego)
            .to(q(".hc-chip-baja"), { autoAlpha: 0, y: -6, duration: 0.2 }, T.riego + 0.3)
            .to(q(".hc-chip-riego"), { autoAlpha: 1, y: 0, duration: 0.25 }, T.riego + 0.4)
            .to(lectura, { valor: HUMEDAD.optima, duration: 1.9, ease: "power1.inOut", onUpdate: pintarHumedad }, T.riego + 0.4)
            .to(medidor, { scaleX: HUMEDAD.optima / 100, duration: 1.9, ease: "power1.inOut" }, T.riego + 0.4);

          /* 8 · Cultivo: la cámara baja a la altura de las plantas, que crecen. */
          camara(8, 1.0, T.cultivo - 0.4);
          tl.to(estado, { crecimiento: 1, duration: 1.2, ease: "power2.out" }, T.cultivo)
            .to(estado, { verdor: 1, duration: 1.2 }, T.cultivo + 0.2)
            .to(q(".hc-chip-riego"), { autoAlpha: 0, y: -6, duration: 0.2 }, T.cultivo + 0.6)
            .to(q(".hc-chip-optima"), { autoAlpha: 1, y: 0, duration: 0.25 }, T.cultivo + 0.7);

          /* Final: el dron sube y aparece el mensaje con la llamada a la
             visita. En vertical el panel cede su lugar al mensaje. */
          camara(9, 1.4, T.mensaje - 0.6);
          if (vertical) {
            tl.to(panel, { autoAlpha: 0, y: -12, duration: 0.3, ease: "power2.in" }, T.mensaje - 0.3);
          }
          tl.to(q(".hc-velo"), { autoAlpha: 1, duration: 0.5 }, T.mensaje - 0.2)
            .to(mensaje, { autoAlpha: 1, duration: 0.01 }, T.mensaje)
            .to(q(".hc-mensaje-linea"), { yPercent: 0, autoAlpha: 1, duration: 0.6, stagger: 0.12, ease: "power3.out" }, T.mensaje)
            .to({}, { duration: 0.1 }, T.fin - 0.1);

          /* Los triggers de secciones posteriores se crean en otro efecto;
             se reordenan por posición para que todos cuenten el espacio
             que reserva este pin. */
          const orden = requestAnimationFrame(() => {
            ScrollTrigger.sort();
            ScrollTrigger.refresh();
          });

          return () => {
            cancelAnimationFrame(orden);
            seccion.classList.remove("hc--animada");
            humedad.textContent = String(HUMEDAD.optima);
          };
        },
      );
    }, seccion);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={seccionRef} id="inicio" className="hc relative overflow-hidden text-mineral">
      {/* ----- Escena 3D (el lienzo lo agrega campo.ts) ----- */}
      <div
        ref={escenaRef}
        className="hc-escena"
        role="img"
        aria-label="Parcela sembrada en hileras con un sistema de riego por aspersión: bomba, tubería principal, laterales, aspersores y sondas de humedad"
      />

      {/* Velo de lectura: oscurece el campo detrás del texto */}
      <div className="hc-velo" aria-hidden="true" />

      {/* ----- Texto de llegada ----- */}
      <div className="hc-contenido relative mx-auto flex max-w-[78rem] flex-col px-5 pt-32 sm:px-8 sm:pt-36 lg:pt-40">
        <div ref={textoRef} className="hero-texto max-w-[34rem]">
          <p className="hero-entrada flex items-center gap-3 text-sm text-mineral/85">
            <span className="hero-kicker h-px w-10 origin-left bg-agua" />
            Cobertura técnica en seis departamentos
          </p>

          <h1 className="hero-titulo mt-6 font-display text-[clamp(2.75rem,7.5vw,4.5rem)] font-extrabold leading-[0.95] tracking-[-0.035em]">
            El agua llega
            <br />
            hasta donde
            <br />
            usted siembra.
          </h1>

          <p className="hero-entrada hc-descripcion mt-7 max-w-[46ch] text-lg leading-relaxed text-mineral/90">
            Diseñamos e instalamos sistemas de riego, y surtimos la finca con
            fertilizantes, semilla y equipo. Un agrónomo visita su parcela antes de
            que compre nada.
          </p>

          <div className="hero-entrada mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#contacto"
              className="inline-flex items-center justify-center rounded-full bg-maiz px-7 py-4 font-semibold text-tinta transition-colors hover:bg-[#ffc04a]"
            >
              Pedir una visita técnica
            </a>
            <a
              href="#servicios"
              className="inline-flex items-center justify-center rounded-full border border-mineral/30 bg-tinta/40 px-7 py-4 font-semibold text-mineral transition-colors hover:border-mineral/60 hover:bg-mineral/5"
            >
              Ver lo que manejamos
            </a>
          </div>

          <p className="hero-entrada hc-nota mt-8 text-sm text-mineral/80">
            La visita de diagnóstico no tiene costo y se agenda dentro de 48 horas.
          </p>
        </div>
      </div>

      {/* ----- Capa del relato: leyendas, sensor y mensaje final.
          Solo existe mientras la escena está fijada. ----- */}
      <div className="hc-capa">
        <div className="hc-capa-interior">
          <div className="hc-relato">
            <div className="hc-avance">
              {ETAPAS.map((etapa) => (
                <span key={etapa} className="hc-avance-tramo">
                  <span className="hc-avance-lleno" />
                </span>
              ))}
            </div>
            <ol className="hc-etapas">
              {ETAPAS.map((etapa, i) => (
                <li
                  key={etapa}
                  ref={(el) => {
                    if (el) etapasRef.current[i] = el;
                  }}
                  className="hc-etapa"
                >
                  {etapa}
                </li>
              ))}
            </ol>

            <div ref={mensajeRef} className="hc-mensaje">
              <p className="hc-mensaje-titulo font-display font-extrabold">
                <span className="hc-mensaje-linea">Riego inteligente.</span>
                <span className="hc-mensaje-linea">Cultivos más eficientes.</span>
              </p>
              <p className="hc-mensaje-linea hc-mensaje-texto">
                Diseñamos, instalamos y damos seguimiento a su sistema de riego.
              </p>
              <a href="#contacto" className="hc-mensaje-linea hc-mensaje-cta">
                Pedir una visita técnica
              </a>
            </div>
          </div>

          <div ref={panelRef} className="hc-panel">
            <div className="hc-lectura">
              <span className="hc-panel-etiqueta">Humedad del suelo</span>
              <span className="hc-valor">
                <span ref={humedadRef}>{HUMEDAD.optima}</span>&nbsp;%
              </span>
              <span className="hc-medidor">
                <span ref={medidorRef} className="hc-medidor-lleno" />
                <span className="hc-medidor-umbral" />
              </span>
            </div>
            <div className="hc-chips">
              <span className="hc-chip hc-chip-baja">Nivel bajo detectado</span>
              <span className="hc-chip hc-chip-riego">Riego en curso</span>
              <span className="hc-chip hc-chip-optima">Nivel óptimo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Franja de confianza al pie del hero */}
      <div className="hero-franja hc-franja border-t border-mineral/15">
        <div className="mx-auto flex max-w-[78rem] flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-sm text-mineral/85">Atendemos desde la parcela familiar hasta la finca comercial.</p>
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
