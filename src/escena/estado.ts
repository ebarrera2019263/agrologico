/* ---------------------------------------------------------------
   Estado de la escena 3D del hero.

   Es un objeto plano: la timeline de GSAP interpola sus valores con el
   scroll y la escena (campo.ts) los lee en cada cuadro. Así la
   coreografía no depende de que Three.js ya haya cargado, y este
   archivo no arrastra Three.js al paquete principal.

   Todos los valores van de 0 a 1.
   --------------------------------------------------------------- */

export type EstadoCampo = {
  /** Recorrido de la cámara por los planos del relato. */
  camara: number;
  /** Avance del tractor por la calle del fondo. */
  tractor: number;
  /** Tendido de la tubería (captación, principal y laterales). */
  sistema: number;
  /** Aparición de los aspersores sobre sus elevadores. */
  aspersores: number;
  /** Las sondas de humedad salen del suelo. */
  sondas: number;
  /** La bomba en marcha. */
  bomba: number;
  /** El agua recorre la tubería. */
  agua: number;
  /** Los aspersores se abren, del más cercano a la bomba al más lejano. */
  riego: number;
  /** El cultivo crece. */
  crecimiento: number;
  /** El cultivo toma color. */
  verdor: number;
};

/* Estado con el sistema completo regando: es lo que se muestra sin
   animación (movimiento reducido o pantallas muy bajas). */
export function estadoFinal(): EstadoCampo {
  return {
    camara: 0,
    tractor: 1,
    sistema: 1,
    aspersores: 1,
    sondas: 1,
    bomba: 1,
    agua: 1,
    riego: 1,
    crecimiento: 1,
    verdor: 1,
  };
}

/* Número de planos de cámara definidos en campo.ts. */
export const PLANOS_CAMARA = 10;
export const plano = (indice: number) => indice / (PLANOS_CAMARA - 1);
