# Agrológico — sitio informativo

**En línea:** https://ebarrera2019263.github.io/agrologico/

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
| **WhatsApp** | `empresa.whatsapp` | **PENDIENTE** — sigue siendo de ejemplo. Solo dígitos con código de país: `502########` |
| WhatsApp visible | `empresa.whatsappVisible` | como se muestra: `+502 ####-####` |
| Correo | `empresa.correo` | `ventas@agrologico.com` es supuesto, confirmar |
| Redes sociales | `empresa.redes` | URLs, hoy apuntan a la raíz de cada red |

Ya están puestos y confirmados el teléfono (6632-4158), la dirección (Km 27
Carretera al Salvador, CAES Industrial, Sección C, Bodega 14) y el mapa.

## El logo

Vectorizado desde `LOGO AGROLOGICO 2025 AF.pdf`, en tres archivos dentro de
`src/assets/`:

- `logo.svg` — a color, para fondos claros
- `logo-blanco.svg` — el logotipo en blanco hueso, para fondos oscuros (es
  el que usan la barra y el pie); la marca conserva sus colores
- `isotipo.svg` — solo la «a» con las dos hojas

El favicon (`public/favicon.svg`) es la marca sobre el verde de la empresa.

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

- **Colores**: tomados del logo oficial. Los cuatro de marca son exactos:

  | Color | Hex | Dónde está en el logo |
  |---|---|---|
  | Verde petróleo | `#005949` | Logotipo «Agrologico» y bajada |
  | Verde vivo | `#009A46` | La «a» |
  | Verde hoja | `#6CBE45` | Hoja derecha |
  | Ámbar | `#FBAD18` | Hoja izquierda |

  Los neutros (`#00382E` para fondos oscuros, `#F1F5F3` para fondo claro)
  se derivaron del verde petróleo para que todo lea como una familia.
  Están definidos en `src/index.css`.
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

El sitio ya está publicado en GitHub Pages. **Cada push a `main` lo
actualiza solo**: el flujo de `.github/workflows/deploy.yml` compila y
despliega en menos de un minuto.

```bash
git add -A
git commit -m "Actualiza los datos de contacto"
git push
```

Para ver cómo va el despliegue: `gh run watch`, o la pestaña Actions del
repositorio.

Si los cambios no se ven de inmediato, es caché del navegador: recargá con
Cmd+Shift+R.

### Si algún día se mueve a un dominio propio

1. En `vite.config.ts`, cambiá `base: '/agrologico/'` por `base: '/'`.
2. Actualizá la URL de `og:image` en `index.html`.
3. Configurá el dominio en Settings → Pages del repositorio.

`npm run build` también deja todo en `dist/` si se prefiere subirlo a mano
a Netlify, Vercel o Cloudflare Pages.
