import { ALTO, ANCHO, EMISORES, LARGO_LINEA, LINEA, MANOMETRO, SUELO } from "../data/riego";

/* ---------------------------------------------------------------
   Sistema de riego: corte de terreno de una hilera bajo goteo.

   Es un esquema técnico, no una ilustración decorativa: cabezal con
   filtro y regulador, la cintilla sobre el camellón, un emisor frente a
   cada planta cada 0.30 m y el bulbo húmedo que se forma bajo tierra.
   El dibujo se sirve en su estado final (todo visible); la coreografía
   en src/movimiento lo construye paso a paso con el scroll.
   --------------------------------------------------------------- */

/* Generador con semilla fija: el dibujo es idéntico en cada visita. */
function generador(semilla: number) {
  let s = semilla;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

const azar = generador(7);
const motas = Array.from({ length: 170 }, () => ({
  x: azar() * ANCHO,
  y: SUELO + 16 + azar() * (ALTO - SUELO - 24),
  r: 0.8 + azar() * 2.2,
  o: 0.2 + azar() * 0.45,
}));
const terrones = Array.from({ length: 46 }, (_, i) => ({
  x: (i / 46) * ANCHO + azar() * 18,
  rx: 3 + azar() * 6,
  ry: 2 + azar() * 3,
}));
const piedras = [
  { x: 150, y: 560, r: 16 },
  { x: 405, y: 640, r: 11 },
  { x: 575, y: 598, r: 20 },
  { x: 890, y: 662, r: 14 },
  { x: 1110, y: 590, r: 18 },
  { x: 740, y: 690, r: 9 },
];

/* Raíces fibrosas: una principal y varias laterales por planta. */
function raices(semilla: number) {
  const r = generador(semilla);
  const lineas = ["M0 0 C3 40 -4 80 -1 128"];
  for (let i = 0; i < 9; i++) {
    const lado = i % 2 ? 1 : -1;
    const y0 = 4 + r() * 46;
    const largo = 50 + r() * 70;
    const abre = lado * (22 + r() * 40);
    lineas.push(
      `M0 ${y0.toFixed(1)} C${(abre * 0.4).toFixed(1)} ${(y0 + 14).toFixed(1)} ${(abre * 0.9).toFixed(1)} ${(y0 + largo * 0.5).toFixed(1)} ${(abre * 1.1).toFixed(1)} ${(y0 + largo).toFixed(1)}`,
    );
  }
  return lineas;
}

const pasos = [
  {
    titulo: "Cabezal de riego",
    texto:
      "El agua entra por un filtro de anillos que retiene arena y sedimento, y un regulador mantiene la presión estable en toda la línea.",
  },
  {
    titulo: "La cintilla recorre el surco",
    texto:
      "Una manguera delgada corre junto a cada hilera. El agua avanza sin encharcar el pasillo ni mojar el follaje.",
  },
  {
    titulo: "Un emisor frente a cada planta",
    texto:
      "Cada gotero entrega 1.6 litros por hora y van espaciados a 0.30 m, calibrados según el cultivo y el tipo de suelo.",
  },
  {
    titulo: "El agua llega a la raíz",
    texto:
      "Bajo tierra se forma un bulbo húmedo justo donde están las raíces. Se evapora menos, crece menos maleza y la planta rinde más.",
  },
];

const hojas = [
  "M0 -46 C30 -70 70 -78 112 -58 C74 -64 36 -58 0 -38 Z",
  "M0 -84 C-32 -112 -76 -120 -116 -98 C-76 -106 -34 -98 0 -76 Z",
  "M0 -124 C26 -156 62 -172 100 -176 C62 -164 28 -144 0 -116 Z",
  "M0 -158 C-22 -186 -50 -206 -86 -214 C-50 -198 -24 -178 0 -150 Z",
  "M0 -196 C10 -222 26 -244 46 -262 C24 -236 12 -218 0 -188 Z",
  "M0 -214 C-6 -236 -14 -252 -26 -270 C-12 -246 -6 -232 0 -208 Z",
];
const nervios = [
  "M0 -42 C34 -64 70 -68 106 -59",
  "M0 -80 C-34 -106 -72 -110 -110 -99",
  "M0 -120 C28 -150 62 -164 94 -174",
  "M0 -154 C-24 -182 -50 -198 -80 -211",
];

function Planta({ x, fondo = false }: { x: number; fondo?: boolean }) {
  return (
    <g transform={`translate(${x} ${SUELO})${fondo ? " scale(0.72)" : ""}`} opacity={fondo ? 0.38 : 1}>
      {!fondo && (
        <g className="riego-raiz" fill="none" stroke="#b9a58a" strokeLinecap="round">
          {raices(x).map((d, i) => (
            <path key={i} d={d} strokeWidth={i === 0 ? 2.6 : 1.6} />
          ))}
        </g>
      )}
      <g className={fondo ? "riego-planta-fondo" : "riego-planta"}>
        <path d="M0 0 C2 -70 -2 -150 0 -232" fill="none" stroke={fondo ? "#2f7d3c" : "var(--color-agua)"} strokeWidth="6" strokeLinecap="round" />
        {hojas.map((d, i) => (
          <path key={d} d={d} fill={fondo ? "#2f7d3c" : i % 2 ? "url(#hoja-b)" : "url(#hoja-a)"} />
        ))}
        {!fondo &&
          nervios.map((d) => (
            <path key={d} d={d} fill="none" stroke="#d6f2c4" strokeOpacity="0.45" strokeWidth="1.2" />
          ))}
      </g>
    </g>
  );
}

export function SistemaRiego() {
  return (
    <section
      id="sistema"
      aria-labelledby="sistema-titulo"
      className="riego relative overflow-hidden bg-tinta text-mineral"
    >
      <div className="riego-escena mx-auto max-w-[78rem] px-5 py-20 sm:px-8 sm:py-28">
        <div className="riego-cabecera">
          <h2
            id="sistema-titulo"
            className="max-w-[14ch] font-display text-[clamp(2rem,4.5vw,3rem)] font-extrabold leading-[1.02] [text-wrap:balance]"
          >
            Así llega el agua hasta la raíz
          </h2>
          <p className="riego-intro mt-5 max-w-[46ch] leading-relaxed text-mineral/75">
            Un sistema de goteo bien diseñado entrega el agua justa, planta por
            planta. Este es el recorrido que instalamos en campo.
          </p>
        </div>

        {/* Avance de los cuatro pasos (solo con la coreografía activa) */}
        <div className="riego-avance" aria-hidden="true">
          {pasos.map((paso) => (
            <span key={paso.titulo} className="riego-tramo">
              <span className="riego-tramo-lleno" />
            </span>
          ))}
        </div>

        <ol className="riego-pasos">
          {pasos.map((paso, i) => (
            <li key={paso.titulo} className="riego-paso">
              <span className="font-display text-sm font-bold text-maiz">
                Paso {i + 1} de {pasos.length}
              </span>
              <h3 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-[1.75rem]">
                {paso.titulo}
              </h3>
              <p className="mt-3 max-w-[44ch] leading-relaxed text-mineral/75">{paso.texto}</p>
            </li>
          ))}
        </ol>

        <figure className="riego-diagrama">
          <div className="riego-ventana">
            <div className="riego-lienzo">
              <svg
                viewBox={`0 0 ${ANCHO} ${ALTO}`}
                className="absolute inset-0 h-full w-full"
                role="img"
                aria-label="Corte de una hilera con riego por goteo: cabezal con filtro y regulador, cintilla con un emisor frente a cada planta y bulbos de humedad alrededor de las raíces."
              >
                <defs>
                  <radialGradient id="bulbo" cx="50%" cy="38%" r="60%">
                    <stop offset="0%" stopColor="var(--color-riego)" stopOpacity="0.62" />
                    <stop offset="55%" stopColor="var(--color-riego)" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="var(--color-riego)" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="hoja-a" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3f9b3a" />
                    <stop offset="100%" stopColor="var(--color-agua)" />
                  </linearGradient>
                  <linearGradient id="hoja-b" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stopColor="#8bd35f" />
                    <stop offset="100%" stopColor="var(--color-milpa-claro)" />
                  </linearGradient>
                  <linearGradient id="aire" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a3b32" />
                    <stop offset="100%" stopColor="#0e4a3d" />
                  </linearGradient>
                  <clipPath id="bajo-suelo">
                    <rect x="0" y={SUELO} width={ANCHO} height={ALTO - SUELO} />
                  </clipPath>
                  <pattern id="reticula" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M40 0H0V40" fill="none" stroke="rgba(241,245,243,0.06)" strokeWidth="1" />
                  </pattern>
                </defs>

                {/* Aire con retícula de plano */}
                <rect width={ANCHO} height={SUELO} fill="url(#aire)" />
                <rect width={ANCHO} height={SUELO} fill="url(#reticula)" />

                {/* Suelo por horizontes, con transición ondulada */}
                <rect x="0" y={SUELO} width={ANCHO} height={ALTO - SUELO} fill="#34261b" />
                <path d={`M0 500 C 220 488, 420 516, 640 500 S 1020 488, ${ANCHO} 504 V${ALTO} H0 Z`} fill="#2a1f16" />
                <path d={`M0 628 C 260 618, 480 640, 700 626 S 1060 618, ${ANCHO} 632 V${ALTO} H0 Z`} fill="#221911" />
                {motas.map((m, i) => (
                  <circle key={i} cx={m.x} cy={m.y} r={m.r} fill="#65503b" opacity={m.o} />
                ))}
                {piedras.map((p) => (
                  <path
                    key={p.x}
                    d={`M${p.x - p.r} ${p.y} C${p.x - p.r} ${p.y - p.r * 0.9} ${p.x + p.r * 0.8} ${p.y - p.r} ${p.x + p.r} ${p.y - p.r * 0.1} C${p.x + p.r * 1.1} ${p.y + p.r * 0.7} ${p.x - p.r * 0.6} ${p.y + p.r * 0.8} ${p.x - p.r} ${p.y} Z`}
                    fill="#4a3a2b"
                    stroke="#5d4a37"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Bulbos húmedos: se tocan entre sí y forman la franja mojada */}
                <g clipPath="url(#bajo-suelo)">
                  {EMISORES.map((x) => (
                    <ellipse key={x} className="riego-bulbo" cx={x} cy={SUELO + 64} rx="104" ry="124" fill="url(#bulbo)" />
                  ))}
                  {EMISORES.map((x) => (
                    <g key={x} className="riego-isolinea" fill="none" stroke="var(--color-riego)" strokeWidth="1.3" strokeDasharray="5 6" strokeOpacity="0.5">
                      <ellipse cx={x} cy={SUELO + 40} rx="52" ry="66" />
                      <ellipse cx={x} cy={SUELO + 56} rx="84" ry="104" />
                    </g>
                  ))}
                </g>

                {/* Hilera de fondo: da profundidad al surco */}
                {[210, 390, 570, 750, 930, 1110].map((x) => (
                  <Planta key={x} x={x} fondo />
                ))}

                {/* Superficie del camellón con terrones */}
                <path
                  d={`M0 ${SUELO} C 200 ${SUELO - 6}, 400 ${SUELO + 4}, 600 ${SUELO - 3} S 1000 ${SUELO + 3}, ${ANCHO} ${SUELO - 2}`}
                  fill="none"
                  stroke="#7a604a"
                  strokeWidth="3"
                />
                {terrones.map((t) => (
                  <ellipse key={t.x} cx={t.x} cy={SUELO + 2} rx={t.rx} ry={t.ry} fill="#5a4531" />
                ))}

                {EMISORES.map((x) => (
                  <Planta key={x} x={x} />
                ))}

                {/* Cabezal: toma, filtro de anillos, manómetro y válvula */}
                <g className="riego-cabezal">
                  <rect x="40" y={LINEA - 118} width="48" height="124" rx="13" fill="#0b4336" stroke="var(--color-agua)" strokeWidth="2" />
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <path key={i} d={`M49 ${LINEA - 96 + i * 16} H79`} stroke="var(--color-agua)" strokeOpacity="0.55" strokeWidth="2.5" strokeLinecap="round" />
                  ))}
                  <path d={`M64 ${LINEA - 118} V${LINEA - 134}`} stroke="var(--color-agua)" strokeWidth="3" />
                  <rect x="52" y={LINEA - 144} width="24" height="12" rx="3" fill="var(--color-agua)" />
                  <path d={`M${MANOMETRO.x} ${LINEA - 6} V${MANOMETRO.y + 26}`} stroke="var(--color-mineral)" strokeOpacity="0.6" strokeWidth="3" />
                  <circle cx={MANOMETRO.x} cy={MANOMETRO.y} r="27" fill="#0b4336" stroke="var(--color-mineral)" strokeOpacity="0.85" strokeWidth="2.5" />
                  <path
                    d={`M${MANOMETRO.x - 19} ${MANOMETRO.y + 14} A 23 23 0 1 1 ${MANOMETRO.x + 19} ${MANOMETRO.y + 14}`}
                    fill="none"
                    stroke="var(--color-mineral)"
                    strokeOpacity="0.35"
                    strokeWidth="2"
                  />
                  <path
                    d={`M${MANOMETRO.x - 6} ${MANOMETRO.y - 22} A 23 23 0 0 1 ${MANOMETRO.x + 16} ${MANOMETRO.y - 16}`}
                    fill="none"
                    stroke="var(--color-agua)"
                    strokeWidth="4"
                  />
                  <line className="riego-aguja" x1={MANOMETRO.x} y1={MANOMETRO.y} x2={MANOMETRO.x} y2={MANOMETRO.y - 20} stroke="var(--color-maiz)" strokeWidth="3" strokeLinecap="round" />
                  <circle cx={MANOMETRO.x} cy={MANOMETRO.y} r="4" fill="var(--color-maiz)" />
                  <rect x="158" y={LINEA - 12} width="14" height="24" rx="3" fill="#0b4336" stroke="var(--color-mineral)" strokeOpacity="0.6" strokeWidth="2" />
                  <path d={`M165 ${LINEA - 12} V${LINEA - 26} M156 ${LINEA - 26} H174`} stroke="var(--color-mineral)" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
                </g>

                {/* Tubería y cintilla: la funda, el agua y el flujo */}
                <path d={`M0 ${LINEA} H${LARGO_LINEA}`} stroke="#062a22" strokeWidth="13" strokeLinecap="round" fill="none" />
                <path d={`M0 ${LINEA - 3.5} H${LARGO_LINEA}`} stroke="#ffffff" strokeOpacity="0.08" strokeWidth="2" fill="none" />
                <path className="riego-agua" d={`M0 ${LINEA} H${LARGO_LINEA}`} stroke="var(--color-riego)" strokeWidth="6" strokeLinecap="round" fill="none" />
                <path className="riego-flujo" d={`M0 ${LINEA} H${LARGO_LINEA}`} stroke="#e3f6fc" strokeOpacity="0.75" strokeWidth="2" strokeDasharray="4 22" fill="none" />

                {/* Estacas que sostienen la cintilla sobre el camellón */}
                {[210, 570, 930].map((x) => (
                  <path key={x} d={`M${x} ${LINEA - 4} V${SUELO + 14}`} stroke="#7a604a" strokeWidth="3" />
                ))}

                {/* Emisores con su destello al recibir agua */}
                {EMISORES.map((x) => (
                  <g key={x}>
                    <circle className="riego-destello" cx={x} cy={LINEA} r="18" fill="var(--color-riego)" opacity="0.3" />
                    <rect x={x - 9} y={LINEA - 8} width="18" height="16" rx="3" fill="#0b4336" stroke="var(--color-riego)" strokeWidth="2" />
                  </g>
                ))}

                {/* Gotas (animadas en bucle cuando el emisor ya gotea) */}
                <g className="riego-gotas">
                  {EMISORES.map((x) => (
                    <path
                      key={x}
                      className="riego-gota"
                      d={`M${x} ${LINEA + 9} c0 0 -5 6.5 -5 10 a5 5 0 0 0 10 0 c0 -3.5 -5 -10 -5 -10 Z`}
                      fill="var(--color-riego)"
                    />
                  ))}
                </g>

                {/* Cota: separación entre emisores */}
                <g className="riego-cota" stroke="var(--color-maiz)" strokeWidth="2" fill="none">
                  <path d={`M${EMISORES[1]} 62 H${EMISORES[2]}`} />
                  <path d={`M${EMISORES[1]} 50 V74 M${EMISORES[2]} 50 V74`} />
                  <path d={`M${EMISORES[1]} 78 V${LINEA - 16} M${EMISORES[2]} 78 V${LINEA - 16}`} strokeDasharray="4 6" strokeOpacity="0.5" />
                </g>

                {/* Guías de las etiquetas */}
                <path className="riego-guia riego-guia-caudal" d={`M${EMISORES[4]} ${LINEA - 18} V84`} stroke="var(--color-maiz)" strokeWidth="1.5" strokeDasharray="4 5" fill="none" />
                <path className="riego-guia riego-guia-bulbo" d={`M${EMISORES[3] - 30} ${SUELO + 120} L760 640 H700`} stroke="var(--color-riego)" strokeWidth="1.5" strokeDasharray="4 5" fill="none" />
                <path className="riego-guia riego-guia-cabezal" d={`M64 ${LINEA - 146} V112 H112`} stroke="var(--color-agua)" strokeWidth="1.5" strokeDasharray="4 5" fill="none" />
              </svg>

              {/* Etiquetas en HTML para que se lean a cualquier tamaño */}
              <span className="riego-etiqueta riego-etiqueta-cabezal" style={{ left: "9.8%", top: "15.6%" }}>
                <b>Filtro + regulador</b>
                presión estable
              </span>
              <span className="riego-etiqueta riego-etiqueta-cota is-cota" style={{ left: "47.5%", top: "8.6%" }}>
                <b>0.30 m</b>
                entre emisores
              </span>
              <span className="riego-etiqueta riego-etiqueta-caudal is-centro" style={{ left: "85%", top: "11.4%" }}>
                <b>1.6 L/h</b>
                por emisor
              </span>
              <span className="riego-etiqueta riego-etiqueta-bulbo is-derecha" style={{ left: "58.3%", top: "88.9%" }}>
                <b>Bulbo húmedo</b>
                en la zona de raíces
              </span>
            </div>
          </div>
        </figure>
      </div>
    </section>
  );
}
