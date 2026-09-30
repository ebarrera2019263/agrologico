/* ---------------------------------------------------------------
   Configuración del sitio.
   Todo el contenido editable vive aquí: cambiá estos valores y la
   página entera se actualiza. No hace falta tocar los componentes.
   --------------------------------------------------------------- */

export const empresa = {
  nombre: "Agrologico",
  descriptor: "Soluciones y tecnologías",

  /* Número de WhatsApp en formato internacional, solo dígitos.
     502 = Guatemala. PENDIENTE: confirmar el número real de WhatsApp;
     el de abajo todavía es de ejemplo. */
  whatsapp: "50255555555",
  whatsappVisible: "+502 5555 5555",

  telefono: "6632-4158",
  telefonoEnlace: "+50266324158",
  correo: "ventas@agrologico.com",

  direccion: "Km 27 Carretera al Salvador, CAES Industrial, Sección C, Bodega 14",
  ciudad: "Guatemala",

  horario: [
    { dias: "Lunes a viernes", horas: "7:00 – 17:00" },
    { dias: "Sábado", horas: "7:00 – 12:00" },
    { dias: "Domingo", horas: "Cerrado" },
  ],

  redes: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
  },

  /* Mapa embebido de Google Maps. Se busca el parque industrial por
     nombre: así el pin cae sobre el lugar real y no sobre coordenadas
     aproximadas. Para afinarlo al número de bodega, lo ideal es pegar
     aquí el iframe que da Google Maps en «Compartir → Insertar un mapa»
     desde la ficha de Google Business de la empresa. */
  mapa:
    "https://maps.google.com/maps?q=" +
    encodeURIComponent("CAES Parque Industrial, Km 27 Carretera a El Salvador, Guatemala") +
    "&z=14&output=embed",
} as const;

export const mensajeWhatsApp =
  "Hola Agrológico, me gustaría recibir asesoría sobre sus productos.";

export function enlaceWhatsApp(mensaje: string = mensajeWhatsApp) {
  return `https://wa.me/${empresa.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

/* --- Navegación ------------------------------------------------ */

export const secciones = [
  { id: "inicio", nombre: "Inicio" },
  { id: "tipos-riego", nombre: "Riego" },
  { id: "nosotros", nombre: "Nosotros" },
  { id: "servicios", nombre: "Servicios" },
  { id: "marcas", nombre: "Marcas" },
  { id: "galeria", nombre: "Galería" },
  { id: "contacto", nombre: "Contacto" },
] as const;

/* --- Sistemas de riego ------------------------------------------ */

export type TipoRiego = {
  id: "goteo" | "microaspersion" | "aspersion-fija" | "aspersion-movil" | "pivote" | "hidroponia";
  nombre: string;
  texto: string;
};

export const tiposRiego: TipoRiego[] = [
  {
    id: "goteo",
    nombre: "Riego por goteo",
    texto: "Lleva el agua directo a la raíz y reduce el gasto de agua y energía.",
  },
  {
    id: "microaspersion",
    nombre: "Microaspersión",
    texto: "Rocía el agua en gotas finas. Es común en frutales y viveros.",
  },
  {
    id: "aspersion-fija",
    nombre: "Aspersión fija",
    texto: "Los aspersores quedan instalados de forma permanente en el campo.",
  },
  {
    id: "aspersion-movil",
    nombre: "Aspersión móvil",
    texto: "Los aspersores se trasladan de un lote a otro según se necesite.",
  },
  {
    id: "pivote",
    nombre: "Pivote central",
    texto: "Un brazo gira sobre un punto central. Pensado para extensiones grandes.",
  },
  {
    id: "hidroponia",
    nombre: "Hidroponía",
    texto: "Cultivo sin suelo, con el agua y los nutrientes controlados.",
  },
];

/* --- Servicios ------------------------------------------------- */

export type Servicio = {
  id: string;
  titulo: string;
  resumen: string;
  detalles: string[];
  icono: "riego" | "protegida" | "nutricion" | "semilla" | "proteccion" | "equipo" | "asesoria";
};

export const servicios: Servicio[] = [
  {
    id: "riego",
    titulo: "Sistemas de riego",
    resumen:
      "Diseñamos, instalamos y damos mantenimiento a riego por goteo, aspersión y microaspersión según el cultivo y la topografía de la finca.",
    detalles: [
      "Levantamiento topográfico y cálculo hidráulico",
      "Cintilla, manguera, aspersores y accesorios",
      "Bombas, filtros y cabezales de control",
      "Programadores y automatización",
    ],
    icono: "riego",
  },
  {
    id: "protegida",
    titulo: "Agricultura protegida",
    resumen:
      "Invernaderos, macrotúneles y casas malla para controlar luz, temperatura y humedad. Cultivo más parejo, menos plaga y cosecha fuera de temporada.",
    detalles: [
      "Cubiertas plásticas para invernadero",
      "Malla sombra y malla antiinsectos",
      "Estructuras, perfiles y sujeción",
      "Acolchado plástico para camas",
    ],
    icono: "protegida",
  },
  {
    id: "nutricion",
    titulo: "Nutrición vegetal",
    resumen:
      "Fertilizantes granulados, solubles y foliares. Armamos el plan de fertilización a partir del análisis de suelo de su parcela.",
    detalles: [
      "Análisis de suelo y foliar",
      "Fórmulas completas y elementos menores",
      "Fertirriego y bioestimulantes",
      "Enmiendas y correctores de pH",
    ],
    icono: "nutricion",
  },
  {
    id: "semillas",
    titulo: "Semillas y material vegetativo",
    resumen:
      "Semilla certificada de hortalizas, granos básicos y pastos, seleccionada por adaptación a la altura y el clima de la región.",
    detalles: [
      "Hortalizas híbridas y de polinización abierta",
      "Maíz, frijol y arroz",
      "Pastos y forrajes",
      "Pilones y material de vivero",
    ],
    icono: "semilla",
  },
  {
    id: "proteccion",
    titulo: "Protección de cultivos",
    resumen:
      "Manejo integrado de plagas y enfermedades, con productos registrados y acompañamiento sobre dosis, mezcla y tiempos de reingreso.",
    detalles: [
      "Insecticidas, fungicidas y herbicidas",
      "Control biológico y productos orgánicos",
      "Coadyuvantes y adherentes",
      "Equipo de protección personal",
    ],
    icono: "proteccion",
  },
  {
    id: "equipo",
    titulo: "Equipo y herramienta",
    resumen:
      "Bombas de mochila, motobombas, aspersoras, herramienta manual y repuestos. Servicio de taller para lo que ya tiene en la finca.",
    detalles: [
      "Bombas manuales y motorizadas",
      "Motoguadañas y motosierras",
      "Herramienta manual y de poda",
      "Repuestos y servicio de taller",
    ],
    icono: "equipo",
  },
  {
    id: "asesoria",
    titulo: "Asesoría técnica en finca",
    resumen:
      "Nuestros agrónomos visitan la parcela, diagnostican en campo y dejan un plan escrito. La visita es parte del servicio, no un extra.",
    detalles: [
      "Visita de diagnóstico sin costo",
      "Plan de manejo por ciclo de cultivo",
      "Capacitación al personal de campo",
      "Seguimiento durante la temporada",
    ],
    icono: "asesoria",
  },
];

/* --- Marcas ---------------------------------------------------
   Logos en /public/marcas/. `alto` ajusta el tamaño visual de cada
   logo para que todos pesen parecido (los apilados necesitan más
   altura que los horizontales).
   ---------------------------------------------------------------- */

export type Marca = {
  nombre: string;
  logo: string;
  alto: "bajo" | "medio" | "alto";
};

export const marcas: Marca[] = [
  { nombre: "Nelson", logo: "nelson.webp", alto: "bajo" },
  { nombre: "Metzer", logo: "metzer.svg", alto: "alto" },
  { nombre: "Ridder", logo: "ridder.svg", alto: "bajo" },
  { nombre: "Antelco", logo: "antelco.webp", alto: "medio" },
  { nombre: "Mago", logo: "mago.svg", alto: "medio" },
  { nombre: "Asthor", logo: "asthor.webp", alto: "bajo" },
];

/* --- Cifras (Nosotros) ----------------------------------------- */

export const cifras = [
  { valor: "18", unidad: "años", nota: "acompañando productores" },
  { valor: "1,400", unidad: "hectáreas", nota: "bajo riego instalado" },
  { valor: "6", unidad: "departamentos", nota: "con cobertura técnica" },
  { valor: "48", unidad: "horas", nota: "para atender una visita" },
];

/* --- Galería ---------------------------------------------------
   Reemplazá cada `src` por las fotos reales del negocio.
   Recomendado: 1600 px de ancho, formato .webp, bajo /public/img/.
   ---------------------------------------------------------------- */

export type Foto = {
  src: string;
  alt: string;
  titulo: string;
  lugar: string;
  formato: "alto" | "ancho" | "cuadro";
};

export const galeria: Foto[] = [
  {
    src: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=1400&q=70&auto=format&fit=crop",
    alt: "Vista de parcelas cultivadas en hileras paralelas hasta el horizonte",
    titulo: "Parcelas bajo riego",
    lugar: "Jutiapa",
    formato: "ancho",
  },
  {
    src: "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1000&q=70&auto=format&fit=crop",
    alt: "Manos colocando plántulas en una bandeja de germinación",
    titulo: "Pilones en bandeja",
    lugar: "Vivero central",
    formato: "alto",
  },
  {
    src: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=1000&q=70&auto=format&fit=crop",
    alt: "Camas altas con lechuga y cebollín en plena producción",
    titulo: "Hortaliza en cama alta",
    lugar: "Chimaltenango",
    formato: "cuadro",
  },
  {
    src: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1000&q=70&auto=format&fit=crop",
    alt: "Pala de mano con una muestra de suelo oscuro",
    titulo: "Muestreo de suelo",
    lugar: "Zacapa",
    formato: "cuadro",
  },
  {
    src: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&q=70&auto=format&fit=crop",
    alt: "Canastos con chile, pepino, zanahoria y güisquil recién cosechados",
    titulo: "Cosecha de hortaliza",
    lugar: "Sacatepéquez",
    formato: "ancho",
  },
  {
    src: "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=1000&q=70&auto=format&fit=crop",
    alt: "Productora trasplantando plántulas sobre acolchado en el surco",
    titulo: "Trasplante en campo",
    lugar: "Sacatepéquez",
    formato: "alto",
  },
];

/* --- Motivos de contacto (formulario) -------------------------- */

export const motivos = [
  "Cotización de sistema de riego",
  "Cotización de agricultura protegida",
  "Compra de insumos",
  "Visita técnica a mi finca",
  "Análisis de suelo",
  "Servicio de taller o repuestos",
  "Otro",
];
