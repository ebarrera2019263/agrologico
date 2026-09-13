# Agrológico — sitio informativo

Maqueta de la página de Agrológico: riego, nutrición vegetal, semilla,
protección de cultivos, equipo y asesoría técnica en finca.

Cinco secciones en una sola página (Inicio, Nosotros, Servicios, Galería y
Contacto), con formulario de contacto y botón flotante de WhatsApp.

## Cómo correrlo

```bash
npm install     # solo la primera vez
npm run dev     # servidor de desarrollo en http://localhost:5173
npm run build   # genera el sitio listo para publicar en dist/
npm run preview # revisa el resultado del build
```

## Qué editar

Casi todo el contenido vive en un solo archivo: **`src/data/site.ts`**.
Ahí están el número de WhatsApp, teléfono, correo, dirección, horario, los
seis servicios con sus detalles, las cifras de la sección Nosotros y la
galería. Cambiando esos valores se actualiza la página completa sin tocar
los componentes.

Lo primero que hay que reemplazar, porque ahora son datos de ejemplo:

| Dato | Dónde | Formato |
|---|---|---|
| WhatsApp | `empresa.whatsapp` | solo dígitos con código de país: `50255555555` |
| WhatsApp visible | `empresa.whatsappVisible` | como se muestra: `+502 5555 5555` |
| Teléfono, correo, dirección | `empresa.*` | texto |
| Ubicación del mapa | `empresa.mapa` | URL de Google Maps con `&output=embed` |
| Redes sociales | `empresa.redes` | URLs |

## Fotografías

Las imágenes actuales son de Unsplash y están puestas como referencia.
Para las fotos reales del negocio:

1. Guardalas en `public/img/`.
2. Cambiá el `src` en `galeria` (`src/data/site.ts`) a `/img/nombre.webp`.
3. También la foto del hero (`src/components/Hero.tsx`) y la de Nosotros
   (`src/components/Nosotros.tsx`).

Recomendado: `.webp`, 1600 px de ancho como máximo, y escribir siempre el
`alt` describiendo lo que se ve — de eso dependen los lectores de pantalla
y el posicionamiento en buscadores.

## Formulario de contacto

El formulario valida en el navegador (nombre, teléfono y mensaje) pero
**todavía no envía a ningún lado**: simula el envío y muestra la pantalla de
confirmación. Para conectarlo, buscá el comentario en
`src/components/Contacto.tsx` dentro de la función `enviar` y elegí:

- Un servicio sin servidor propio: Formspree, Web3Forms o Basin. Es pegar la
  URL del formulario y listo.
- Un endpoint propio: `POST /api/contacto` con el objeto `datos`.

Mientras tanto, el enlace «Mandarlo por WhatsApp» que está junto al botón sí
funciona: arma el mensaje con lo que la persona escribió y lo abre en
WhatsApp. Si el sitio sale al aire antes de conectar el formulario, esa es la
vía que va a recibir las consultas.

## Estructura

```
src/
  data/site.ts          contenido y datos de contacto  ← empezar aquí
  components/
    Header.tsx          barra fija, menú móvil, marca de sección activa
    Hero.tsx            portada
    Nosotros.tsx        historia y cifras
    Servicios.tsx       las seis líneas de trabajo
    Galeria.tsx         retícula de fotos con visor
    Contacto.tsx        formulario, datos y mapa
    Footer.tsx          pie
    BotonWhatsApp.tsx   botón flotante
    Iconos.tsx          íconos dibujados como esquemas de riego
    Logo.tsx            marca
  index.css             colores, tipografías y estilos base
```

## Diseño

- **Colores** (definidos en `src/index.css`): verde milpa `#1F5D3A`, azul de
  riego `#1B9AAA`, amarillo maíz `#E3A81C`, tierra `#8C5A2B`, fondo mineral
  `#E9EEE7`, tinta `#12261B`.
- **Tipografías**: Archivo para titulares, IBM Plex Sans para texto.
- **Movimiento**: una sola animación, las gotas del hero. Se apaga sola si el
  sistema operativo pide menos movimiento.

## Antes de publicar

- [ ] Reemplazar los datos de contacto y el número de WhatsApp
- [ ] Subir las fotos reales
- [ ] Conectar el envío del formulario
- [ ] Ajustar la ubicación del mapa
- [ ] Agregar la imagen `public/img/og.jpg` (1200×630) para cuando se
      comparta el enlace en redes o WhatsApp
- [ ] Revisar los textos de Nosotros y las cifras, que hoy son de ejemplo

## Publicarlo

`npm run build` deja todo en `dist/`. Esa carpeta se sube tal cual a
Netlify, Vercel, Cloudflare Pages o cualquier hosting estático.
