/* ---------------------------------------------------------------
   Configuración del sitio.
   Todo el contenido editable vive aquí: cambiá estos valores y la
   página entera se actualiza. No hace falta tocar los componentes.
   --------------------------------------------------------------- */

export const empresa = {
  nombre: "Agrológico",
  descriptor: "Insumos y riego para el campo",

  /* Número de WhatsApp en formato internacional, solo dígitos.
     502 = Guatemala. Cambialo por el número real del negocio. */
  whatsapp: "50255555555",
  whatsappVisible: "+502 5555 5555",

  telefono: "+502 2222 3333",
  correo: "ventas@agrologico.com",

  direccion: "Km 18.5 Carretera al Atlántico, Bodega 4",
  ciudad: "Ciudad de Guatemala, Guatemala",

  horario: [
    { dias: "Lunes a viernes", horas: "7:00 – 17:00" },
    { dias: "Sábado", horas: "7:00 – 12:00" },
    { dias: "Domingo", horas: "Cerrado" },
  ],

  redes: {
    facebook: "https://facebook.com/",
    instagram: "https://instagram.com/",
  },

  /* Coordenadas para el mapa embebido (Google Maps). */
  mapa: "https://www.google.com/maps?q=14.6349,-90.5069&z=14&output=embed",
} as const;

export const mensajeWhatsApp =
  "Hola Agrológico, me gustaría recibir asesoría sobre sus productos.";

export function enlaceWhatsApp(mensaje: string = mensajeWhatsApp) {
  return `https://wa.me/${empresa.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

/* --- Navegación ------------------------------------------------ */

export const secciones = [
  { id: "inicio", nombre: "Inicio" },
  { id: "nosotros", nombre: "Nosotros" },
  { id: "servicios", nombre: "Servicios" },
  { id: "galeria", nombre: "Galería" },
  { id: "contacto", nombre: "Contacto" },
] as const;

/* --- Servicios ------------------------------------------------- */

export type Servicio = {
  id: string;
  titulo: string;
  resumen: string;
  detalles: string[];
  icono: "riego" | "nutricion" | "semilla" | "proteccion" | "equipo" | "asesoria";
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
  "Compra de insumos",
  "Visita técnica a mi finca",
  "Análisis de suelo",
  "Servicio de taller o repuestos",
  "Otro",
];
