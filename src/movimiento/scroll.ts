import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/* Scroll suavizado con Lenis, sincronizado con el reloj de GSAP para
   que ScrollTrigger y el scroll avancen en el mismo cuadro. En pantallas
   táctiles Lenis deja el scroll nativo, así que el celular no pierde
   inercia ni gana peso. */

let lenis: Lenis | null = null;

const alAvanzar = (tiempo: number) => lenis?.raf(tiempo * 1000);

export function iniciarScroll() {
  if (lenis) return lenis;

  lenis = new Lenis({
    /* Los saltos de ancla respetan el scroll-padding-top del html, que
       ya deja libre la barra fija; no hace falta sumar otro margen. */
    anchors: true,
    lerp: 0.11,
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(alAvanzar);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function detenerScroll() {
  gsap.ticker.remove(alAvanzar);
  lenis?.destroy();
  lenis = null;
}

/* El menú móvil y el visor de fotos bloquean el fondo: Lenis escucha la
   rueda del mouse aunque el body tenga overflow hidden, así que hay que
   pausarlo explícitamente. */
export function pausarScroll() {
  lenis?.stop();
}

export function reanudarScroll() {
  lenis?.start();
}
