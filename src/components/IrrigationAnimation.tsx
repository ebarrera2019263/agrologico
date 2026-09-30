import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./IrrigationAnimation.css";

gsap.registerPlugin(ScrollTrigger);

/* ---------------------------------------------------------------
   Sistema de riego inteligente, contado con el scroll.

   Tanque → bomba → reparto por zonas → cultivo, con una sonda de
   humedad que decide cuándo arrancar. Cada zona usa uno de los
   sistemas que instala Agrológico: goteo, microaspersión y aspersión.

   El marcado se sirve en su estado final (sistema activo) para que sin
   JavaScript o con movimiento reducido se lea completo; la timeline
   parte de un estado previo solo cuando va a animar, y ctx.revert() lo
   deja todo como estaba al desmontar.
   --------------------------------------------------------------- */

const SUELO = 740;
const BOMBA = { x: 360, y: 330 };
const HUMEDAD = { inicial: 58, baja: 32, optima: 68, umbral: 35 };

/* Centro de cada zona y el sistema que la riega. */
const ZONAS = [
  { x: 120, sistema: "Goteo" },
  { x: 360, sistema: "Microaspersión" },
  { x: 600, sistema: "Aspersión" },
] as const;
const PLANTAS = ZONAS.flatMap(({ x }) => [x - 58, x + 58]);
/* Las sondas quedan entre hileras para no chocar con los elevadores. */
const SONDAS = [240, 480, 600];

const TUBOS = {
  entrada: "M556 60 H440",
  tanque: "M360 196 V292",
  bomba: "M360 368 V440",
};
const RAMALES = [
  "M360 440 H138 Q120 440 120 458 V728",
  "M360 440 V672",
  "M360 440 H582 Q600 440 600 458 V520",
];

/* Zona 1 · goteo: una cintilla sobre el camellón con un gotero al pie
   de cada planta. El agua sale del elevador hacia los dos lados. */
const CINTILLAS = ["M120 734 H30", "M120 734 H210"];
const GOTEROS = [62, 178];

/* Zona 2 · microaspersión: un microaspersor bajo, en estaca, que
   reparte gotas finas en un radio corto. */
const MICRO = { x: 360, y: 680 };
const neblina = [
  `M${MICRO.x} ${MICRO.y} Q${MICRO.x - 26} ${MICRO.y - 14} ${MICRO.x - 56} ${MICRO.y + 18}`,
  `M${MICRO.x} ${MICRO.y} Q${MICRO.x - 20} ${MICRO.y + 4} ${MICRO.x - 44} ${MICRO.y + 38}`,
  `M${MICRO.x} ${MICRO.y} Q${MICRO.x + 26} ${MICRO.y - 14} ${MICRO.x + 56} ${MICRO.y + 18}`,
  `M${MICRO.x} ${MICRO.y} Q${MICRO.x + 20} ${MICRO.y + 4} ${MICRO.x + 44} ${MICRO.y + 38}`,
];
const gotasNeblina = [
  [MICRO.x - 50, MICRO.y + 10],
  [MICRO.x - 38, MICRO.y + 30],
  [MICRO.x + 38, MICRO.y + 30],
  [MICRO.x + 50, MICRO.y + 10],
];

/* Zona 3 · aspersión: aspersor alto con arcos amplios sobre el follaje. */
const ASPERSOR = { x: 600, y: 542 };
const arcos = [
  `M${ASPERSOR.x} ${ASPERSOR.y} Q${ASPERSOR.x - 70} ${ASPERSOR.y + 6} ${ASPERSOR.x - 104} 660`,
  `M${ASPERSOR.x} ${ASPERSOR.y} Q${ASPERSOR.x - 34} ${ASPERSOR.y + 14} ${ASPERSOR.x - 50} 664`,
  `M${ASPERSOR.x} ${ASPERSOR.y} Q${ASPERSOR.x + 34} ${ASPERSOR.y + 14} ${ASPERSOR.x + 50} 664`,
  `M${ASPERSOR.x} ${ASPERSOR.y} Q${ASPERSOR.x + 70} ${ASPERSOR.y + 6} ${ASPERSOR.x + 104} 660`,
];
const gotasAspersor = [
  [ASPERSOR.x - 104, 650],
  [ASPERSOR.x - 76, 628],
  [ASPERSOR.x - 50, 654],
  [ASPERSOR.x + 50, 654],
  [ASPERSOR.x + 76, 628],
  [ASPERSOR.x + 104, 650],
];

/* Momento (en unidades de la timeline) en que empieza cada etapa. */
const T = {
  captacion: 0,
  bomba: 2.2,
  distribucion: 4.6,
  monitoreo: 6.8,
  riego: 8.4,
  activo: 10.8,
  fin: 13.4,
};

const ETAPAS = [
  {
    titulo: "Captación de agua",
    texto: "El tanque recibe el agua del pozo, del río o de la cosecha de lluvia y la guarda lista para regar.",
    inicio: T.captacion,
  },
  {
    titulo: "Activación de bomba",
    texto: `La sonda marca humedad por debajo del umbral de ${HUMEDAD.umbral}\u00a0% y el controlador enciende la bomba.`,
    inicio: T.bomba,
  },
  {
    titulo: "Distribución inteligente",
    texto: "La tubería principal se divide por zonas. Cada zona tiene su válvula y el sistema de riego que pide su cultivo.",
    inicio: T.distribucion,
  },
  {
    titulo: "Monitoreo de humedad",
    texto: "Una sonda por zona mide el suelo y le avisa al controlador cuándo abrir y cuándo cerrar cada válvula.",
    inicio: T.monitoreo,
  },
  {
    titulo: "Riego automatizado",
    texto: "Goteo directo a la raíz, microaspersión en gotas finas y aspersión para cubrir el lote.",
    inicio: T.riego,
  },
  {
    titulo: "Sistema de riego activo",
    texto: "La humedad vuelve al rango óptimo. Con goteo, hasta 90\u00a0% del agua llega a la planta.",
    inicio: T.activo,
  },
];

/* Hoja en forma de lanza, apuntando hacia arriba desde su base. */
const HOJAS = [
  "M0 -18 C10 -30 24 -34 36 -30 C26 -24 14 -20 0 -14 Z",
  "M0 -30 C-10 -44 -24 -50 -38 -46 C-26 -40 -14 -34 0 -26 Z",
  "M0 -46 C8 -60 20 -68 30 -70 C20 -62 10 -54 0 -42 Z",
  "M0 -56 C-6 -68 -16 -76 -26 -80 C-16 -70 -8 -62 0 -52 Z",
];

function Planta({ viva }: { viva: boolean }) {
  return (
    <g className={viva ? "ia-planta-viva" : "ia-planta-seca"}>
      <path d="M0 0 C1 -24 -1 -46 0 -74" fill="none" strokeWidth="3.5" strokeLinecap="round" />
      {HOJAS.map((d) => (
        <path key={d} d={d} />
      ))}
    </g>
  );
}

function Gotas({ puntos, r = 2.6 }: { puntos: readonly (readonly number[])[]; r?: number }) {
  return puntos.map(([cx, cy]) => (
    <circle key={`${cx}-${cy}`} className="ia-gota" cx={cx} cy={cy} r={r} fill="#9fdcef" />
  ));
}

export function IrrigationAnimation() {
  const seccionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const aguaRef = useRef<SVGPathElement[]>([]);
  const tanqueRef = useRef<SVGGElement>(null);
  const nivelTanqueRef = useRef<SVGRectElement>(null);
  const bombaRef = useRef<SVGGElement>(null);
  const rotorRef = useRef<SVGGElement>(null);
  const equiposRef = useRef<SVGGElement[]>([]);
  const plantasRef = useRef<SVGGElement[]>([]);
  const etapasRef = useRef<HTMLLIElement[]>([]);
  const tarjetaRef = useRef<HTMLDivElement>(null);
  const humedadRef = useRef<HTMLSpanElement>(null);
  const medidorRef = useRef<HTMLSpanElement>(null);
  const ctaFinalRef = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    const seccion = seccionRef.current;
    const svg = svgRef.current;
    const humedad = humedadRef.current;
    const medidor = medidorRef.current;
    const nivelTanque = nivelTanqueRef.current;
    const bomba = bombaRef.current;
    const rotor = rotorRef.current;
    const tarjeta = tarjetaRef.current;
    const ctaFinal = ctaFinalRef.current;
    if (!seccion || !svg || !humedad || !medidor || !nivelTanque || !bomba || !rotor || !tarjeta || !ctaFinal) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          animar: "(prefers-reduced-motion: no-preference) and (min-height: 520px)",
          movil: "(max-width: 1023.98px)",
        },
        (contexto) => {
          const { animar, movil } = contexto.conditions as Record<string, boolean>;
          if (!animar) return;

          seccion.classList.add("ia--animada");

          /* Selector acotado a la sección: nunca toca el resto del documento. */
          const q = gsap.utils.selector(seccion);
          const etapas = etapasRef.current;
          const [aguaEntrada, aguaTanque, aguaBomba, ...aguaResto] = aguaRef.current;
          const aguaRamales = aguaResto.slice(0, RAMALES.length);
          const aguaCintillas = aguaResto.slice(RAMALES.length);
          const equipos = equiposRef.current;
          const plantas = plantasRef.current;

          /* Cada trazo arranca vacío: el guion mide el largo real del
             path (getTotalLength) y el offset lo empuja fuera de vista.
             Animar el offset a 0 lo llena. El hueco lleva un margen
             extra para que la punta redondeada no asome como un punto
             mientras el tubo está vacío. */
          const vaciar = (trazos: Element[]) =>
            trazos.forEach((trazo) => {
              const largo = (trazo as SVGGeometryElement).getTotalLength();
              gsap.set(trazo, { strokeDasharray: `${largo} ${largo + 20}`, strokeDashoffset: largo + 10 });
            });

          vaciar(aguaRef.current);
          vaciar(q(".ia-ramal-funda, .ia-cintilla-funda"));
          vaciar(q(".ia-chorro"));

          /* ----- Estado inicial: sistema instalado, sin agua ----- */
          gsap.set(etapas.slice(1), { autoAlpha: 0, y: 28 });
          gsap.set(q(".ia-avance-lleno"), { scaleX: 0 });
          gsap.set(nivelTanque, { scaleY: 0, transformOrigin: "50% 100%" });
          gsap.set(tarjeta, { autoAlpha: 0, y: 18 });
          gsap.set(q(".ia-chip"), { autoAlpha: 0, y: 8 });
          gsap.set(q(".ia-led-on"), { autoAlpha: 0 });
          gsap.set(medidor, { scaleX: HUMEDAD.inicial / 100, transformOrigin: "0% 50%" });
          gsap.set(q(".ia-bomba-luz"), { autoAlpha: 0, scale: 0.6, svgOrigin: `${BOMBA.x} ${BOMBA.y}` });
          gsap.set(q(".ia-bomba-anillo"), { autoAlpha: 0, scale: 1, svgOrigin: `${BOMBA.x} ${BOMBA.y}` });
          gsap.set(q(".ia-bomba-carcasa"), { stroke: "#2b6156" });
          gsap.set(q(".ia-bomba-marcha"), { autoAlpha: 0 });
          gsap.set(q(".ia-bomba-espera"), { autoAlpha: 1 });
          gsap.set(q(".ia-valvula, .ia-zona"), { autoAlpha: 0, scale: 0.4, transformOrigin: "50% 50%" });
          gsap.set(q(".ia-equipo-cuerpo"), { autoAlpha: 0, scale: 0.3, transformOrigin: "50% 0%" });
          gsap.set(q(".ia-rocio"), { autoAlpha: 0 });
          gsap.set(q(".ia-bulbo"), { scale: 0, transformOrigin: "50% 0%" });
          gsap.set(q(".ia-sonda"), { autoAlpha: 0, y: 26 });
          gsap.set(q(".ia-senal path"), { autoAlpha: 0 });
          gsap.set(q(".ia-suelo-humedo"), { opacity: 0 });
          gsap.set(plantas, { autoAlpha: 0, scaleY: 0.08, scaleX: 0.5, transformOrigin: "50% 100%" });
          gsap.set(q(".ia-planta-viva"), { opacity: 0 });
          gsap.set(q(".ia-flujo-capa"), { autoAlpha: 0 });

          const lectura = { valor: HUMEDAD.inicial };
          const pintarHumedad = () => {
            humedad.textContent = String(Math.round(lectura.valor));
          };
          pintarHumedad();

          /* ----- Bucles ambientales: corren solo mientras su parte del
             sistema está encendida, y se detienen al volver atrás. ----- */
          const giro = gsap.to(rotor, {
            rotation: 360,
            svgOrigin: `${BOMBA.x} ${BOMBA.y}`,
            duration: 0.8,
            ease: "none",
            repeat: -1,
            paused: true,
          });
          const flujo = gsap.to(q(".ia-flujo"), {
            strokeDashoffset: -24,
            duration: 0.6,
            ease: "none",
            repeat: -1,
            paused: true,
          });
          const rocio = gsap.timeline({ repeat: -1, paused: true });
          rocio.to(q(".ia-chorro-flujo"), { strokeDashoffset: -28, duration: 0.7, ease: "none" }, 0);
          q(".ia-gota").forEach((gota, i) => {
            rocio.fromTo(
              gota,
              { y: -6, autoAlpha: 0 },
              { keyframes: [{ autoAlpha: 1, duration: 0.2 }, { y: 16, autoAlpha: 0, duration: 0.5, ease: "power2.in" }] },
              (i * 0.17) % 0.7,
            );
          });

          const alternar = (animacion: gsap.core.Animation, encendida: boolean) => {
            if (encendida && animacion.paused()) animacion.play();
            else if (!encendida && !animacion.paused()) animacion.pause();
          };
          const arranqueBomba = T.bomba + 1.6;
          const arranqueFlujo = T.distribucion + 1.5;
          const arranqueRiego = T.riego + 0.3;

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: seccion,
              start: "top top",
              end: movil ? "+=1900" : "+=2400",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
            onUpdate: () => {
              const t = tl.time();
              alternar(giro, t >= arranqueBomba);
              alternar(flujo, t >= arranqueFlujo);
              alternar(rocio, t >= arranqueRiego);
            },
          });

          /* ----- Textos y avance: uno a la vez, en el mismo lugar ----- */
          ETAPAS.forEach((etapa, i) => {
            const siguiente = ETAPAS[i + 1]?.inicio ?? T.fin;
            tl.to(q(".ia-avance-lleno")[i], { scaleX: 1, duration: siguiente - etapa.inicio }, etapa.inicio);
            if (i === 0) return;
            tl.to(etapas[i - 1], { autoAlpha: 0, y: -28, scale: 0.98, duration: 0.35, ease: "power2.in" }, etapa.inicio - 0.4)
              .fromTo(
                etapas[i],
                { autoAlpha: 0, y: 28, scale: 0.98 },
                { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "power2.out", immediateRender: false },
                etapa.inicio - 0.05,
              );
          });

          /* 1 · Captación: entra agua al tanque y lo llena. */
          tl.to(aguaEntrada, { strokeDashoffset: 0, duration: 0.5 }, 0.1)
            .to(nivelTanque, { scaleY: 0.86, duration: 1.4, ease: "power1.inOut" }, 0.4);

          /* 2 · La sonda detecta humedad baja y arranca la bomba. */
          tl.to(tarjeta, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, T.bomba)
            .to(lectura, { valor: HUMEDAD.baja, duration: 0.8, ease: "power1.inOut", onUpdate: pintarHumedad }, T.bomba + 0.2)
            .to(medidor, { scaleX: HUMEDAD.baja / 100, duration: 0.8, ease: "power1.inOut" }, T.bomba + 0.2)
            .to(q(".ia-chip-baja"), { autoAlpha: 1, y: 0, duration: 0.25 }, T.bomba + 0.9)
            .to(aguaTanque, { strokeDashoffset: 0, duration: 0.6 }, T.bomba + 1.0)
            .to(nivelTanque, { scaleY: 0.78, duration: 2.4 }, T.bomba + 1.0)
            .to(q(".ia-bomba-luz"), { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power2.out" }, arranqueBomba)
            .to(q(".ia-bomba-anillo"), { keyframes: [{ autoAlpha: 0.8, duration: 0.05 }, { autoAlpha: 0, scale: 1.7, duration: 0.55, ease: "power2.out" }] }, arranqueBomba)
            .to(q(".ia-bomba-carcasa"), { stroke: "#4fb8dc", duration: 0.3 }, arranqueBomba)
            .to(q(".ia-bomba-espera"), { autoAlpha: 0, duration: 0.2 }, arranqueBomba)
            .to(q(".ia-bomba-marcha"), { autoAlpha: 1, duration: 0.2 }, arranqueBomba + 0.1)
            .to(q(".ia-led-bomba .ia-led-on"), { autoAlpha: 1, duration: 0.2 }, arranqueBomba)
            .from(bomba, { scale: 0.96, svgOrigin: `${BOMBA.x} ${BOMBA.y}`, duration: 0.4, ease: "power3.out" }, arranqueBomba);

          /* 3 · Distribución: línea principal, ramales por zona, válvulas
             y el equipo de cada zona (cintilla, microaspersor, aspersor). */
          tl.to(aguaBomba, { strokeDashoffset: 0, duration: 0.45 }, T.distribucion)
            .to(q(".ia-ramal-funda"), { strokeDashoffset: 0, duration: 0.55, stagger: 0.08, ease: "power1.out" }, T.distribucion + 0.1)
            .to(q(".ia-valvula"), { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.08, ease: "power3.out" }, T.distribucion + 0.45)
            .to(q(".ia-zona"), { autoAlpha: 1, scale: 1, duration: 0.3, stagger: 0.08 }, T.distribucion + 0.6)
            .to(aguaRamales, { strokeDashoffset: 0, duration: 1, stagger: 0.12 }, T.distribucion + 0.45)
            .to(q(".ia-cintilla-funda"), { strokeDashoffset: 0, duration: 0.5, ease: "power1.out" }, T.distribucion + 0.9)
            .to(q(".ia-equipo-cuerpo"), { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.1, ease: "power3.out" }, T.distribucion + 1.0)
            .to(aguaCintillas, { strokeDashoffset: 0, duration: 0.5 }, T.distribucion + 1.45)
            .to(q(".ia-led-valvulas .ia-led-on"), { autoAlpha: 1, duration: 0.2 }, T.distribucion + 1.2)
            .to(q(".ia-flujo-capa"), { autoAlpha: 1, duration: 0.3 }, arranqueFlujo - 0.2);

          /* 4 · Monitoreo: una sonda por zona emerge del suelo y reporta. */
          tl.to(q(".ia-sonda"), { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.15, ease: "power2.out" }, T.monitoreo + 0.1)
            .to(q(".ia-senal path"), { autoAlpha: 1, duration: 0.2, stagger: 0.07 }, T.monitoreo + 0.5)
            .to(q(".ia-led-sondas .ia-led-on"), { autoAlpha: 1, duration: 0.2 }, T.monitoreo + 0.7);

          /* 5 · Riego: las zonas se abren una tras otra, cada una con su
             sistema; la humedad sube. */
          equipos.forEach((equipo, i) => {
            const inicio = T.riego + i * 0.5;
            const g = gsap.utils.selector(equipo);
            const chorros = g(".ia-chorro");
            const bulbos = g(".ia-bulbo");
            if (chorros.length) {
              tl.to(chorros, { strokeDashoffset: 0, duration: 0.55, stagger: 0.05, ease: "power1.out" }, inicio + 0.05);
            }
            tl.to(g(".ia-rocio"), { autoAlpha: 1, duration: 0.3 }, inicio + 0.3);
            if (bulbos.length) {
              tl.to(bulbos, { scale: 1, duration: 1.4, stagger: 0.1, ease: "power2.out" }, inicio + 0.4);
            }
          });
          tl.to(q(".ia-chip-baja"), { autoAlpha: 0, y: -8, duration: 0.2 }, T.riego + 0.5)
            .to(q(".ia-chip-riego"), { autoAlpha: 1, y: 0, duration: 0.25 }, T.riego + 0.6)
            .to(lectura, { valor: HUMEDAD.optima, duration: 1.8, ease: "power1.inOut", onUpdate: pintarHumedad }, T.riego + 0.6)
            .to(medidor, { scaleX: HUMEDAD.optima / 100, duration: 1.8, ease: "power1.inOut" }, T.riego + 0.6)
            .to(q(".ia-suelo-humedo"), { opacity: 1, duration: 1.8 }, T.riego + 0.6);

          /* 6 · Sistema activo: el cultivo crece y toma color. */
          tl.to(plantas, { autoAlpha: 1, scaleY: 1, scaleX: 1, duration: 0.8, stagger: 0.12, ease: "power2.out" }, T.activo - 0.4)
            .to(q(".ia-planta-viva"), { opacity: 1, duration: 0.7, stagger: 0.1 }, T.activo + 0.3)
            .to(q(".ia-chip-riego"), { autoAlpha: 0, y: -8, duration: 0.2 }, T.activo)
            .to(q(".ia-chip-optima"), { autoAlpha: 1, y: 0, duration: 0.25 }, T.activo + 0.1)
            .to({}, { duration: 0.1 }, T.fin - 0.1);

          if (movil) {
            gsap.set(ctaFinal, { autoAlpha: 0, y: 12 });
            tl.to(tarjeta, { autoAlpha: 0, y: -12, duration: 0.3, ease: "power2.in" }, T.activo + 0.9)
              .to(ctaFinal, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" }, T.activo + 1.1);
          }

          /* El hero fija su propia sección y se crea después que esta
             (el efecto de App corre después que el de sus hijos). Se
             reordenan los triggers según su posición en la página para
             que este calcule su inicio con el espacio del hero ya sumado. */
          const orden = requestAnimationFrame(() => {
            ScrollTrigger.sort();
            ScrollTrigger.refresh();
          });

          return () => {
            cancelAnimationFrame(orden);
            seccion.classList.remove("ia--animada");
            humedad.textContent = String(HUMEDAD.optima);
          };
        },
      );
    }, seccion);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={seccionRef}
      id="sistema"
      aria-labelledby="sistema-titulo"
      className="ia"
    >
      <div className="ia-escena">
        <div className="ia-texto">
          <h2 id="sistema-titulo" className="ia-titulo font-extrabold">
            Así trabaja un sistema de riego automatizado
          </h2>

          <div className="ia-control">
            <div className="ia-avance" aria-hidden="true">
              {ETAPAS.map((etapa) => (
                <span key={etapa.titulo} className="ia-avance-tramo">
                  <span className="ia-avance-lleno" />
                </span>
              ))}
            </div>
            <a href="#tipos-riego" className="ia-saltar">
              Saltar animación
            </a>
          </div>

          <ol className="ia-etapas">
            {ETAPAS.map((etapa, i) => (
              <li
                key={etapa.titulo}
                ref={(el) => {
                  if (el) etapasRef.current[i] = el;
                }}
                className="ia-etapa"
              >
                <span className="ia-etapa-numero">
                  Paso {i + 1} de {ETAPAS.length}
                </span>
                <h3 className="ia-etapa-titulo">{etapa.titulo}</h3>
                <p className="ia-etapa-texto">{etapa.texto}</p>
              </li>
            ))}
          </ol>

          {/* En celular el botón ocupa el lugar de la tarjeta al final del
              recorrido, para no restarle alto al dibujo en cada etapa. */}
          <div className="ia-panel">
            <div ref={tarjetaRef} className="ia-tarjeta">
              <div className="ia-lectura">
                <span className="ia-tarjeta-etiqueta">
                  Humedad<span className="ia-etiqueta-larga"> del suelo</span>
                </span>
                <span className="ia-valor">
                  <span ref={humedadRef}>{HUMEDAD.optima}</span>&nbsp;%
                </span>
                <span className="ia-medidor" aria-hidden="true">
                  <span ref={medidorRef} className="ia-medidor-lleno" />
                  <span className="ia-medidor-umbral" style={{ left: `${HUMEDAD.umbral}%` }} />
                </span>
                <span className="ia-umbral">Umbral de riego: {HUMEDAD.umbral}&nbsp;%</span>
              </div>
              <div className="ia-chips">
                <span className="ia-chip ia-chip-baja">Nivel bajo detectado</span>
                <span className="ia-chip ia-chip-riego">Riego en curso</span>
                <span className="ia-chip ia-chip-optima">Nivel óptimo</span>
              </div>
              <ul className="ia-estado">
                <li className="ia-led-bomba">
                  <span className="ia-led"><span className="ia-led-on" /></span>Bomba
                </li>
                <li className="ia-led-valvulas">
                  <span className="ia-led"><span className="ia-led-on" /></span>Válvulas
                </li>
                <li className="ia-led-sondas">
                  <span className="ia-led"><span className="ia-led-on" /></span>Sondas
                </li>
              </ul>
            </div>
            <a ref={ctaFinalRef} href="#contacto" className="ia-cta ia-cta-final">
              Cotizar mi sistema de riego
            </a>
          </div>

          <a href="#contacto" className="ia-cta ia-cta-principal">
            Cotizar mi sistema de riego
          </a>
        </div>

        <div className="ia-diagrama">
          <svg
            ref={svgRef}
            viewBox="0 0 720 820"
            role="img"
            aria-labelledby="ia-svg-titulo"
            className="ia-svg"
          >
            <title id="ia-svg-titulo">
              Esquema de riego: tanque, bomba y tres zonas con válvula y sonda de humedad, regadas por goteo,
              microaspersión y aspersión
            </title>
            <defs>
              <linearGradient id="ia-agua-tanque" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#6fcbe8" />
                <stop offset="1" stopColor="#1f7fa3" />
              </linearGradient>
              <linearGradient id="ia-suelo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#2a2319" />
                <stop offset="1" stopColor="#15110b" />
              </linearGradient>
              <linearGradient id="ia-suelo-agua" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#1d4a55" />
                <stop offset="1" stopColor="#10252b" />
              </linearGradient>
              <radialGradient id="ia-luz">
                <stop offset="0" stopColor="#4fb8dc" stopOpacity="0.45" />
                <stop offset="1" stopColor="#4fb8dc" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="ia-bulbo" cx="0.5" cy="0.15" r="0.75">
                <stop offset="0" stopColor="#4fb8dc" stopOpacity="0.4" />
                <stop offset="1" stopColor="#4fb8dc" stopOpacity="0" />
              </radialGradient>
              <clipPath id="ia-tanque-interior">
                <rect x="290" y="48" width="140" height="138" rx="8" />
              </clipPath>
            </defs>

            {/* Suelo y humedad */}
            <rect x="0" y={SUELO} width="720" height={820 - SUELO} fill="url(#ia-suelo)" />
            <rect className="ia-suelo-humedo" x="0" y={SUELO} width="720" height={820 - SUELO} fill="url(#ia-suelo-agua)" />
            <path d={`M0 ${SUELO} H720`} stroke="#5b4a33" strokeWidth="2" />
            {Array.from({ length: 18 }, (_, i) => (
              <path
                key={i}
                d={`M${20 + i * 40} ${SUELO + 20 + (i % 3) * 12} h${10 + (i % 4) * 4}`}
                stroke="#ffffff"
                strokeOpacity="0.06"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ))}

            {/* Fundas de tubería (el tubo vacío) */}
            <g fill="none" stroke="#0c4439" strokeWidth="14" strokeLinecap="round">
              <path d={TUBOS.entrada} />
              <path d={TUBOS.tanque} />
              <path d={TUBOS.bomba} />
              {RAMALES.map((d) => (
                <path key={d} className="ia-ramal-funda" d={d} />
              ))}
            </g>
            <g fill="none" stroke="#0c4439" strokeWidth="8" strokeLinecap="round">
              {CINTILLAS.map((d) => (
                <path key={d} className="ia-cintilla-funda" d={d} />
              ))}
            </g>

            {/* Agua en las tuberías: strokeDasharray/offset desde getTotalLength() */}
            <g fill="none" stroke="#4fb8dc">
              {[TUBOS.entrada, TUBOS.tanque, TUBOS.bomba, ...RAMALES, ...CINTILLAS].map((d, i) => (
                <path
                  key={d}
                  ref={(el) => {
                    if (el) aguaRef.current[i] = el;
                  }}
                  className="ia-agua"
                  d={d}
                  strokeWidth={i >= 3 + RAMALES.length ? 4 : 7}
                />
              ))}
            </g>
            <g className="ia-flujo-capa" fill="none" stroke="#dff5fc" strokeOpacity="0.7" strokeWidth="2" strokeDasharray="5 19">
              {[TUBOS.tanque, TUBOS.bomba, ...RAMALES].map((d) => (
                <path key={d} className="ia-flujo" d={d} />
              ))}
            </g>

            {/* Captación */}
            <g className="ia-svg-etiqueta ia-solo-amplio" textAnchor="end">
              <text x="556" y="42">Captación</text>
            </g>
            <rect x="552" y="50" width="10" height="20" rx="2" fill="#2b6156" />

            {/* Tanque */}
            <g ref={tanqueRef}>
              <rect x="330" y="24" width="60" height="14" rx="4" fill="#123f36" stroke="#2b6156" strokeWidth="2" />
              <rect x="280" y="36" width="160" height="160" rx="16" fill="#08322a" stroke="#2b6156" strokeWidth="3" />
              <g clipPath="url(#ia-tanque-interior)">
                <rect ref={nivelTanqueRef} x="290" y="48" width="140" height="138" fill="url(#ia-agua-tanque)" opacity="0.9" />
              </g>
              {[70, 100, 130, 160].map((y) => (
                <path key={y} d={`M418 ${y} h12`} stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" />
              ))}
              <g className="ia-svg-etiqueta" textAnchor="end">
                <text x="262" y="122">Tanque</text>
              </g>
            </g>

            {/* Bomba */}
            <g ref={bombaRef}>
              <circle className="ia-bomba-luz" cx={BOMBA.x} cy={BOMBA.y} r="90" fill="url(#ia-luz)" />
              <circle className="ia-bomba-anillo" cx={BOMBA.x} cy={BOMBA.y} r="46" fill="none" stroke="#4fb8dc" strokeWidth="2" />
              <rect x="400" y="310" width="46" height="40" rx="6" fill="#0c3b32" stroke="#2b6156" strokeWidth="2" />
              {[318, 326, 334, 342].map((y) => (
                <path key={y} d={`M408 ${y} h22`} stroke="#ffffff" strokeOpacity="0.14" strokeWidth="2" />
              ))}
              <circle cx="438" cy="330" r="4" fill="#2b6156" />
              <circle className="ia-bomba-marcha" cx="438" cy="330" r="4" fill="#6cbe45" />
              <circle className="ia-bomba-carcasa" cx={BOMBA.x} cy={BOMBA.y} r="40" fill="#0a332b" stroke="#4fb8dc" strokeWidth="4" />
              <g ref={rotorRef} fill="#4fb8dc" fillOpacity="0.85">
                {[0, 72, 144, 216, 288].map((a) => (
                  <path
                    key={a}
                    d={`M${BOMBA.x} ${BOMBA.y} C${BOMBA.x + 6} ${BOMBA.y - 10} ${BOMBA.x + 18} ${BOMBA.y - 22} ${BOMBA.x + 4} ${BOMBA.y - 27} C${BOMBA.x - 2} ${BOMBA.y - 18} ${BOMBA.x - 3} ${BOMBA.y - 8} ${BOMBA.x} ${BOMBA.y} Z`}
                    transform={`rotate(${a} ${BOMBA.x} ${BOMBA.y})`}
                  />
                ))}
                <circle cx={BOMBA.x} cy={BOMBA.y} r="6" fill="#dff5fc" />
              </g>
              <g className="ia-svg-etiqueta">
                <text x="466" y="324">Bomba</text>
                <text x="466" y="352" className="ia-svg-dato ia-bomba-espera">En espera</text>
                <text x="466" y="352" className="ia-svg-dato ia-svg-dato-on ia-bomba-marcha">En marcha</text>
              </g>
            </g>

            {/* Válvulas y número de zona */}
            {ZONAS.map(({ x }, i) => (
              <g key={x}>
                <g className="ia-valvula">
                  <rect x={x - 9} y="477" width="18" height="18" rx="3" transform={`rotate(45 ${x} 486)`} fill="#0c3b32" stroke="#6cbe45" strokeWidth="2" />
                </g>
                <text className="ia-zona ia-svg-etiqueta ia-svg-zona ia-solo-amplio" x={x + 18} y="492">
                  Z{i + 1}
                </text>
              </g>
            ))}

            {/* Zona 1 · goteo */}
            <g
              ref={(el) => {
                if (el) equiposRef.current[0] = el;
              }}
            >
              <g className="ia-bulbos" fill="url(#ia-bulbo)">
                {GOTEROS.map((x) => (
                  <ellipse key={x} className="ia-bulbo" cx={x} cy={SUELO + 24} rx="34" ry="22" />
                ))}
              </g>
              <g className="ia-equipo-cuerpo">
                <rect x="112" y="726" width="16" height="16" rx="3" fill="#123f36" stroke="#4fb8dc" strokeWidth="2" />
                {GOTEROS.map((x) => (
                  <rect key={x} x={x - 6} y="729" width="12" height="10" rx="2" fill="#123f36" stroke="#9fdcef" strokeWidth="1.5" />
                ))}
              </g>
              <g className="ia-rocio">
                <Gotas puntos={GOTEROS.flatMap((x) => [[x, 746], [x, 752]])} r={2.2} />
              </g>
            </g>

            {/* Zona 2 · microaspersión */}
            <g
              ref={(el) => {
                if (el) equiposRef.current[1] = el;
              }}
            >
              <g fill="none" stroke="#9fdcef" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.75">
                {neblina.map((d) => (
                  <path key={d} className="ia-chorro" d={d} />
                ))}
              </g>
              <g className="ia-rocio">
                <g fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeDasharray="1 7" strokeOpacity="0.8">
                  {neblina.map((d) => (
                    <path key={d} className="ia-chorro-flujo" d={d} />
                  ))}
                </g>
                <Gotas puntos={gotasNeblina} r={1.8} />
              </g>
              <g className="ia-equipo-cuerpo">
                <path d={`M${MICRO.x} ${MICRO.y + 6} V${SUELO + 8}`} stroke="#8aa39c" strokeWidth="3" strokeLinecap="round" />
                <rect x={MICRO.x - 9} y={MICRO.y - 8} width="18" height="14" rx="3" fill="#123f36" stroke="#4fb8dc" strokeWidth="2" />
              </g>
            </g>

            {/* Zona 3 · aspersión */}
            <g
              ref={(el) => {
                if (el) equiposRef.current[2] = el;
              }}
            >
              <g fill="none" stroke="#9fdcef" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.85">
                {arcos.map((d) => (
                  <path key={d} className="ia-chorro" d={d} />
                ))}
              </g>
              <g className="ia-rocio">
                <g fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 12" strokeOpacity="0.8">
                  {arcos.map((d) => (
                    <path key={d} className="ia-chorro-flujo" d={d} />
                  ))}
                </g>
                <Gotas puntos={gotasAspersor} />
              </g>
              <g className="ia-equipo-cuerpo">
                <rect x={ASPERSOR.x - 12} y="518" width="24" height="16" rx="4" fill="#123f36" stroke="#4fb8dc" strokeWidth="2" />
                <path d={`M${ASPERSOR.x - 6} 540 H${ASPERSOR.x + 6}`} stroke="#dff5fc" strokeWidth="4" strokeLinecap="round" />
              </g>
            </g>

            {/* Sondas de humedad, una por zona */}
            {SONDAS.map((x) => (
              <g key={x} className="ia-sonda">
                <g className="ia-senal" fill="none" stroke="#fbad18" strokeWidth="2" strokeLinecap="round">
                  <path d={`M${x - 8} 700 Q${x} 692 ${x + 8} 700`} />
                  <path d={`M${x - 15} 692 Q${x} 678 ${x + 15} 692`} />
                </g>
                <path d={`M${x} 722 V774`} stroke="#8aa39c" strokeWidth="3" strokeLinecap="round" />
                <rect x={x - 9} y="706" width="18" height="18" rx="4" fill="#0c3b32" stroke="#fbad18" strokeWidth="2" />
                <circle cx={x} cy="715" r="2.5" fill="#fbad18" />
              </g>
            ))}

            {/* Cultivo: capa apagada y capa viva, que se funden al regar */}
            {PLANTAS.map((x, i) => (
              <g key={x} transform={`translate(${x} ${SUELO})`}>
                <g
                  ref={(el) => {
                    if (el) plantasRef.current[i] = el;
                  }}
                  className="ia-planta"
                >
                  <Planta viva={false} />
                  <Planta viva />
                </g>
              </g>
            ))}

            {/* Nombre del sistema de cada zona, sobre el suelo */}
            <g className="ia-svg-etiqueta ia-svg-sistema" textAnchor="middle">
              {ZONAS.map(({ x, sistema }) => (
                <text key={x} className="ia-zona" x={x} y="808">
                  {sistema}
                </text>
              ))}
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
