import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";
import { iniciarScroll, detenerScroll } from "./scroll";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, useGSAP);

/* ---------------------------------------------------------------
   Recorrido de riego: la coreografía completa de la página.

   Un solo gesto grande (el hero se acerca a la parcela hasta llenar la
   pantalla) y, después, un gesto propio por sección en lugar de la
   misma entrada repetida. Todo el contenido existe y es visible sin
   JavaScript; GSAP solo parte de un estado previo cuando corre. Si el
   sistema pide menos movimiento no se registra nada.
   --------------------------------------------------------------- */

const salida = "expo.out";

function entradaHero() {
  const tl = gsap.timeline({ defaults: { ease: salida } });

  SplitText.create(".hero-titulo", {
    type: "lines",
    mask: "lines",
    linesClass: "linea-mascara",
    autoSplit: true,
    onSplit: (self) =>
      tl.from(self.lines, { yPercent: 108, duration: 1.25, stagger: 0.11 }, 0.15),
  });

  /* La escena 3D del campo (Hero.tsx) aparece sola al terminar de
     cargar; su recorrido con el scroll vive en el propio componente. */
  tl.from(".hero-kicker", { scaleX: 0, duration: 0.9 }, 0.2)
    .from(".hero-entrada", { y: 22, autoAlpha: 0, duration: 1, stagger: 0.09 }, 0.55);
}

/* Sistemas de riego: cada pictograma se traza como un plano y el
   texto de la fila entra detrás. */
function tiposRiego() {
  ScrollTrigger.batch(".tipo-riego", {
    start: "top 88%",
    once: true,
    onEnter: (filas) => {
      const tl = gsap.timeline();
      filas.forEach((fila, i) => {
        tl.from(fila.querySelectorAll("svg path"), { drawSVG: "0%", duration: 1.1, stagger: 0.06, ease: "power2.inOut" }, i * 0.1).from(
          fila.querySelectorAll("h3, p, a"),
          { y: 18, autoAlpha: 0, duration: 0.8, stagger: 0.06, ease: salida },
          i * 0.1 + 0.15,
        );
      });
    },
  });
}

function tuberia() {
  gsap.to(".progreso-riego", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
  });
}

function titulos() {
  gsap.utils.toArray<HTMLElement>("main section h2.font-extrabold").forEach((titulo) => {
    SplitText.create(titulo, {
      type: "lines",
      mask: "lines",
      linesClass: "linea-mascara",
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.lines, {
          yPercent: 108,
          duration: 1.1,
          stagger: 0.1,
          ease: salida,
          scrollTrigger: { trigger: titulo, start: "top 86%" },
        }),
    });
  });
}

function surcos() {
  gsap.utils.toArray<HTMLElement>(".surco").forEach((surco) => {
    gsap.from(surco, {
      scaleX: 0,
      transformOrigin: "left center",
      ease: "none",
      scrollTrigger: { trigger: surco, start: "top 92%", end: "top 55%", scrub: 0.5 },
    });
  });
}

function nosotros() {
  /* El lema se "riega" palabra por palabra al ritmo del scroll. */
  SplitText.create(".nosotros-lema", {
    type: "words",
    autoSplit: true,
    onSplit: (self) =>
      gsap.fromTo(
        self.words,
        { opacity: 0.16 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: { trigger: ".nosotros-lema", start: "top 82%", end: "bottom 48%", scrub: 0.4 },
        },
      ),
  });

  /* La foto sube como un nivel de agua y la imagen se asienta. */
  const foto = gsap.timeline({
    scrollTrigger: { trigger: ".foto-nivel", start: "top 90%", end: "top 30%", scrub: 0.6 },
  });
  foto
    .from(".foto-nivel", { clipPath: "inset(100% 0% 0% 0%)", ease: "power2.out" }, 0)
    .from(".foto-nivel img", { scale: 1.3, yPercent: 8, ease: "none" }, 0);

  /* Cifras: la regla se traza y el dato cuenta hasta su valor real. */
  const cifras = gsap.utils.toArray<HTMLElement>(".cifra");
  const tl = gsap.timeline({ scrollTrigger: { trigger: cifras[0]?.parentElement, start: "top 82%" } });
  cifras.forEach((cifra, i) => {
    const valor = cifra.querySelector<HTMLElement>(".cifra-valor");
    const inicio = i * 0.14;
    tl.from(cifra, { "--trazo": 0, duration: 1.1, ease: salida }, inicio).from(
      cifra.querySelector("dd"),
      { y: 26, autoAlpha: 0, duration: 0.9, ease: salida },
      inicio + 0.1,
    );
    if (valor) {
      const texto = valor.textContent ?? "";
      const final = Number(texto.replace(/[^\d]/g, ""));
      const conteo = { n: 0 };
      tl.to(
        conteo,
        {
          n: final,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => {
            valor.textContent = Math.round(conteo.n).toLocaleString("en-US");
          },
          onComplete: () => {
            valor.textContent = texto;
          },
        },
        inicio + 0.1,
      );
    }
  });
}

function servicios() {
  gsap.utils.toArray<HTMLElement>(".servicio").forEach((celda) => {
    const columna = Number(getComputedStyle(celda).getPropertyValue("--col")) || 0;
    const tl = gsap.timeline({
      delay: columna * 0.12,
      scrollTrigger: { trigger: celda, start: "top 84%" },
      defaults: { ease: salida },
    });
    tl.from(celda.querySelectorAll("svg path"), { drawSVG: "0%", duration: 1.3, stagger: 0.07, ease: "power2.inOut" }, 0)
      .from(celda.querySelector("h3"), { y: 24, autoAlpha: 0, duration: 0.9 }, 0.15)
      .from(celda.querySelector("p"), { y: 20, autoAlpha: 0, duration: 0.9 }, 0.25)
      .from(celda.querySelectorAll("li"), { x: -12, autoAlpha: 0, duration: 0.7, stagger: 0.05 }, 0.4)
      .from(celda.querySelectorAll("li > span"), { scale: 0, duration: 0.5, stagger: 0.05, ease: "back.out(3)" }, 0.5);
  });
}

function marcas() {
  ScrollTrigger.batch(".marca img", {
    start: "top 88%",
    once: true,
    onEnter: (logos) =>
      gsap.from(logos, {
        y: 36,
        autoAlpha: 0,
        filter: "grayscale(1)",
        duration: 1,
        stagger: 0.09,
        ease: salida,
        clearProps: "filter",
      }),
  });
}

function galeria() {
  ScrollTrigger.batch("#galeria li", {
    start: "top 88%",
    once: true,
    onEnter: (fotos) =>
      gsap.from(fotos, {
        clipPath: "inset(0% 0% 100% 0%)",
        duration: 1.3,
        stagger: 0.13,
        ease: "expo.inOut",
        clearProps: "clipPath",
      }),
  });

  gsap.utils.toArray<HTMLElement>(".foto-marco").forEach((foto) => {
    gsap.fromTo(
      foto,
      { yPercent: -7 },
      {
        yPercent: 7,
        ease: "none",
        scrollTrigger: { trigger: foto.parentElement, start: "top bottom", end: "bottom top", scrub: true },
      },
    );
  });
}

export function useRecorrido() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        movimiento: "(prefers-reduced-motion: no-preference)",
      },
      (contexto) => {
        const { movimiento } = contexto.conditions as Record<string, boolean>;
        if (!movimiento) return;

        iniciarScroll();
        entradaHero();
        tiposRiego();
        tuberia();
        titulos();
        surcos();
        nosotros();
        servicios();
        marcas();
        galeria();

        /* Las fotos diferidas cambian la altura de la página al cargar. */
        const alCargar = () => ScrollTrigger.refresh();
        window.addEventListener("load", alCargar);

        return () => {
          window.removeEventListener("load", alCargar);
          detenerScroll();
        };
      },
    );
  });
}
