import * as THREE from "three";
import { Sky } from "three/addons/objects/Sky.js";
import { mergeGeometries, mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { PLANOS_CAMARA, type EstadoCampo } from "./estado";

/* ---------------------------------------------------------------
   Escena 3D del hero: una parcela bajo riego por aspersión al
   atardecer.

   Todo es procedural (sin modelos ni texturas descargadas): el suelo
   con camellones y surcos, miles de plantas instanciadas con viento, la
   tubería, los aspersores con rocío de partículas, la bomba, las
   sondas, el tractor y el paisaje de fondo. El realismo sale de la luz:
   cielo físico con el sol bajo, sombras suaves, neblina y un mapeo de
   tonos como el de una cámara.

   La escena no anima nada por su cuenta salvo el viento, el rocío y el
   polvo: todo el relato lo dicta `estado`, que interpola la timeline de
   GSAP con el scroll.

   Unidades en metros. Y hacia arriba; las hileras corren a lo largo de
   Z, hacia el horizonte (Z negativo).
   --------------------------------------------------------------- */

export type OpcionesCampo = {
  /** Celulares y tabletas: menos plantas, partículas y resolución. */
  ligero: boolean;
  /** false = un solo cuadro fijo (movimiento reducido). */
  animado: boolean;
};

export type Campo = {
  dispose: () => void;
};

/* ----- Trazado del campo ----- */
const FILA = 0.8; // separación entre hileras
const CAMPO = { x0: -24, x1: 24, z0: 2, z1: -60 };
const CALLE_Z = -64;
const PRINCIPAL_Z = 3;
/* La principal cruza las hileras apoyada sobre los camellones. */
const ALTO_TUBO = 0.17;
const BOMBA = new THREE.Vector3(-27.5, 0, 3);
const POZO = new THREE.Vector3(-27.3, 0, 6.6);
/* Marco de aspersión de 12 × 12 m: cuatro laterales por surco. */
const LATERALES_X = [-18, -6, 6, 18];
const ASPERSORES_Z = [-2, -14, -26, -38, -50];
const ALTO_ELEVADOR = 1.1;
const SONDAS: [number, number][] = [
  [-11.6, -20],
  [0.4, -33],
  [12.4, -9],
];
/* Sol bajo a la derecha, apenas por delante: contraluz lateral sobre el
   rocío, sombras largas a lo ancho de las hileras y el cielo del lado
   izquierdo más oscuro, detrás del texto. */
const SOL = new THREE.Vector3(0.86, 0.13, -0.48).normalize();

/* ----- Planos de cámara (posición, punto de mira) ----- */
const PLANOS: [number[], number[]][] = [
  [[-4, 5.5, 17], [6, 0.5, -26]], // 0 llegada
  [[0, 4.2, 12], [0, 0.6, -30]], // 1 el campo
  [[5, 6.5, 2], [0, 0.5, -64]], // 2 el tractor al fondo
  [[-18.8, 3.3, 11.5], [-25.5, 0.4, 2]], // 3 instalación: la bomba y la línea
  [[-8.6, 1.5, -14.5], [-11.6, 0.4, -20]], // 4 la sonda
  [[-23.2, 2.1, 8.6], [-27.2, 0.5, 3]], // 5 la bomba en marcha
  [[-19, 3.2, 9.5], [8, 0.3, 1]], // 6 el agua por la principal
  [[2.5, 3.6, 10], [-1, 1.2, -22]], // 7 los aspersores
  [[1.2, 0.95, 0.4], [1.4, 0.6, -12]], // 8 a la altura del cultivo
  [[-12, 19, 24], [3, 0, -24]], // 9 vista de dron final
];
if (PLANOS.length !== PLANOS_CAMARA) throw new Error("PLANOS_CAMARA desalineado");

const tramo = (v: number, a: number, b: number) => THREE.MathUtils.clamp((v - a) / (b - a), 0, 1);
const suave = (v: number) => v * v * (3 - 2 * v);

/* ----- Ruido procedural (para texturas y relieve) ----- */
function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
/* Ruido de valor periódico: la textura se repite sin costuras. */
function ruido(x: number, y: number, periodo: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const m = (n: number) => ((n % periodo) + periodo) % periodo;
  const a = hash(m(xi), m(yi));
  const b = hash(m(xi + 1), m(yi));
  const c = hash(m(xi), m(yi + 1));
  const d = hash(m(xi + 1), m(yi + 1));
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x: number, y: number, periodo: number, octavas = 5) {
  let suma = 0;
  let amp = 0.5;
  let f = 1;
  for (let i = 0; i < octavas; i++) {
    suma += amp * ruido(x * f, y * f, periodo * f);
    amp *= 0.5;
    f *= 2;
  }
  return suma;
}

/* Textura de color y su mapa de normales, generadas en un canvas. */
function texturasSuelo(tam: number, paleta: [THREE.Color, THREE.Color, THREE.Color], escala: number, grano: number) {
  const alto = new Float32Array(tam * tam);
  const color = document.createElement("canvas");
  color.width = color.height = tam;
  const cc = color.getContext("2d")!;
  const img = cc.createImageData(tam, tam);
  const c = new THREE.Color();
  for (let y = 0; y < tam; y++) {
    for (let x = 0; x < tam; x++) {
      const u = (x / tam) * escala;
      const v = (y / tam) * escala;
      const base = fbm(u, v, escala);
      const terron = ruido(u * grano, v * grano, escala * grano);
      const h = base * 0.65 + terron * 0.35;
      alto[y * tam + x] = h;
      c.copy(paleta[0]).lerp(paleta[1], THREE.MathUtils.clamp(base * 1.4 - 0.2, 0, 1));
      c.lerp(paleta[2], Math.pow(terron, 3) * 0.6);
      const i = (y * tam + x) * 4;
      img.data[i] = c.r * 255;
      img.data[i + 1] = c.g * 255;
      img.data[i + 2] = c.b * 255;
      img.data[i + 3] = 255;
    }
  }
  cc.putImageData(img, 0, 0);

  const normal = document.createElement("canvas");
  normal.width = normal.height = tam;
  const nc = normal.getContext("2d")!;
  const nimg = nc.createImageData(tam, tam);
  const at = (x: number, y: number) => alto[((y + tam) % tam) * tam + ((x + tam) % tam)];
  const fuerza = 5;
  for (let y = 0; y < tam; y++) {
    for (let x = 0; x < tam; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * fuerza;
      const dy = (at(x, y + 1) - at(x, y - 1)) * fuerza;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * tam + x) * 4;
      nimg.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      nimg.data[i + 1] = ((-dy / len) * 0.5 + 0.5) * 255;
      nimg.data[i + 2] = (1 / len) * 255;
      nimg.data[i + 3] = 255;
    }
  }
  nc.putImageData(nimg, 0, 0);

  const mapa = new THREE.CanvasTexture(color);
  mapa.colorSpace = THREE.SRGBColorSpace;
  const normales = new THREE.CanvasTexture(normal);
  for (const t of [mapa, normales]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
  }
  return { mapa, normales };
}

/* ----- Geometría de una planta joven: hojas en lanza que se arquean ----- */
function geometriaPlanta() {
  const hojas: THREE.BufferGeometry[] = [];
  const base = new THREE.Color("#35521f");
  const punta = new THREE.Color("#8bb043");
  const tmp = new THREE.Color();
  const N = 7;
  const definiciones = [
    { largo: 0.46, ancho: 0.05, ang: 0.2, abre: 1.0 },
    { largo: 0.5, ancho: 0.055, ang: 2.3, abre: 0.9 },
    { largo: 0.42, ancho: 0.05, ang: 4.1, abre: 1.1 },
    { largo: 0.36, ancho: 0.045, ang: 1.2, abre: 0.6 },
    { largo: 0.32, ancho: 0.04, ang: 3.3, abre: 0.5 },
    { largo: 0.26, ancho: 0.035, ang: 5.3, abre: 0.3 },
  ];
  for (const h of definiciones) {
    const pos: number[] = [];
    const col: number[] = [];
    const idx: number[] = [];
    const dir = new THREE.Vector2(Math.cos(h.ang), Math.sin(h.ang));
    for (let s = 0; s <= N; s++) {
      const t = s / N;
      const horiz = Math.sin(t * 1.3) * h.largo * 0.75 * h.abre;
      const vert = 0.08 + t * h.largo * 0.95 - t * t * h.largo * 0.5 * h.abre;
      const ancho = h.ancho * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.08)) * (1 - t * 0.25);
      const torsion = t * 0.6;
      const px = -dir.y * Math.cos(torsion);
      const pz = dir.x * Math.cos(torsion);
      const cx = dir.x * horiz;
      const cz = dir.y * horiz;
      /* Tres vértices por fila: la nervadura central más baja que los
         bordes, como la hoja real doblada en V. */
      pos.push(cx + px * ancho, vert + ancho * 0.25, cz + pz * ancho);
      pos.push(cx, vert, cz);
      pos.push(cx - px * ancho, vert + ancho * 0.25, cz - pz * ancho);
      tmp.copy(base).lerp(punta, t);
      for (let k = 0; k < 3; k++) col.push(tmp.r, tmp.g, tmp.b);
      if (s < N) {
        const i = s * 3;
        idx.push(i, i + 3, i + 1, i + 1, i + 3, i + 4, i + 1, i + 4, i + 2, i + 2, i + 4, i + 5);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    hojas.push(g);
  }
  const tallo = new THREE.CylinderGeometry(0.011, 0.017, 0.26, 5, 1, true).translate(0, 0.13, 0);
  tallo.deleteAttribute("uv");
  const colTallo: number[] = [];
  for (let i = 0; i < tallo.attributes.position.count; i++) colTallo.push(base.r, base.g, base.b);
  tallo.setAttribute("color", new THREE.Float32BufferAttribute(colTallo, 3));
  return mergeGeometries([...hojas, tallo])!;
}

/* Inyección común al material de la planta y a su material de sombra:
   crecimiento por instancia y vaivén con el viento. */
const VERTICE_PLANTA = /* glsl */ `
  #include <begin_vertex>
  vec3 baseInst = (instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  float azarInst = fract(sin(dot(baseInst.xz, vec2(12.9898, 78.233))) * 43758.5453);
  float crece = clamp(uCrecimiento * 1.3 - azarInst * 0.3, 0.0, 1.0);
  transformed *= mix(0.42, 1.0, crece);
  float altoV = max(transformed.y, 0.0);
  float viento = sin(uTiempo * 1.7 + baseInst.x * 0.31 + baseInst.z * 0.23) * 0.6
    + sin(uTiempo * 3.1 + baseInst.z * 0.7 + baseInst.x) * 0.25;
  transformed.x += viento * 0.32 * altoV * altoV;
  transformed.z += viento * 0.18 * altoV * altoV;
`;

export function crearCampo(contenedor: HTMLElement, estado: EstadoCampo, opciones: OpcionesCampo): Campo {
  const { ligero, animado } = opciones;

  /* ----- Renderizador ----- */
  const renderer = new THREE.WebGLRenderer({ antialias: !ligero, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, ligero ? 1.25 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.8;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.domElement.className = "hc-lienzo";
  contenedor.appendChild(renderer.domElement);
  const anisotropia = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const escena = new THREE.Scene();
  const camara = new THREE.PerspectiveCamera(42, 1, 0.1, 9000);

  /* ----- Cielo físico y luz ambiental a partir de él ----- */
  const cielo = new Sky();
  cielo.scale.setScalar(8000);
  const uCielo = cielo.material.uniforms;
  uCielo.turbidity.value = 4.5;
  uCielo.rayleigh.value = 2.2;
  uCielo.mieCoefficient.value = 0.005;
  uCielo.mieDirectionalG.value = 0.86;
  uCielo.sunPosition.value.copy(SOL).multiplyScalar(1000);
  uCielo.cloudCoverage.value = 0.28;
  uCielo.cloudDensity.value = 0.35;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const escenaCielo = new THREE.Scene();
  escenaCielo.add(cielo);
  const entorno = pmrem.fromScene(escenaCielo, 0.02);
  escena.environment = entorno.texture;
  escena.environmentIntensity = 0.55;
  escena.add(cielo);
  escena.fog = new THREE.Fog("#c4b89e", 45, 2400);

  const sol = new THREE.DirectionalLight("#ffd3a3", 3.1);
  sol.castShadow = true;
  sol.shadow.mapSize.set(ligero ? 1024 : 2048, ligero ? 1024 : 2048);
  sol.shadow.camera.left = -34;
  sol.shadow.camera.right = 34;
  sol.shadow.camera.top = 34;
  sol.shadow.camera.bottom = -34;
  sol.shadow.camera.near = 1;
  sol.shadow.camera.far = 220;
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.04;
  sol.shadow.radius = 3;
  escena.add(sol, sol.target);
  escena.add(new THREE.HemisphereLight("#b9d2ea", "#5a4830", 0.45));

  /* ----- Texturas procedurales ----- */
  const tamTex = ligero ? 256 : 512;
  const tierra = texturasSuelo(
    tamTex,
    [new THREE.Color("#3b2a1c"), new THREE.Color("#6b4f35"), new THREE.Color("#8a6d4c")],
    6,
    8,
  );
  const pasto = texturasSuelo(
    tamTex,
    [new THREE.Color("#46622a"), new THREE.Color("#6c873b"), new THREE.Color("#909452")],
    8,
    12,
  );
  for (const t of [tierra.mapa, tierra.normales, pasto.mapa, pasto.normales]) t.anisotropy = anisotropia;
  pasto.mapa.repeat.set(3600, 3600);
  pasto.normales.repeat.set(3600, 3600);

  /* ----- Pasto alrededor y calle del fondo ----- */
  const suelo = new THREE.Mesh(
    new THREE.PlaneGeometry(12000, 12000).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: pasto.mapa, normalMap: pasto.normales, normalScale: new THREE.Vector2(0.3, 0.3), roughness: 1 }),
  );
  suelo.position.y = -0.03;
  suelo.receiveShadow = true;
  escena.add(suelo);

  const calle = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 4.2).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ map: tierra.mapa, color: "#c9b28c", roughness: 1 }),
  );
  calle.position.set(0, 0.005, CALLE_Z);
  calle.receiveShadow = true;
  escena.add(calle);

  /* ----- Aspersores (posiciones y orden de apertura) ----- */
  const aspersores = LATERALES_X.flatMap((x) => ASPERSORES_Z.map((z) => new THREE.Vector3(x, ALTO_ELEVADOR + 0.06, z)));
  const distancias = aspersores.map((a) => Math.hypot(a.x - BOMBA.x, a.z - BOMBA.z));
  const dMin = Math.min(...distancias);
  const dMax = Math.max(...distancias);
  const umbrales = distancias.map((d) => ((d - dMin) / (dMax - dMin)) * 0.72);
  const uRiego = { value: 0 };
  const uTiempo = { value: 0 };

  /* ----- Parcela: camellones y surcos con relieve real ----- */
  {
    const ancho = CAMPO.x1 - CAMPO.x0 + 4;
    const fondo = CAMPO.z0 - CALLE_Z + 2;
    const centroZ = (CAMPO.z0 + CALLE_Z) / 2 + 1;
    const geo = new THREE.PlaneGeometry(ancho, fondo, ligero ? 280 : 560, ligero ? 60 : 110).rotateX(-Math.PI / 2);
    geo.translate(0, 0, centroZ);
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const fila = (x - CAMPO.x0) / FILA;
      const dentro = THREE.MathUtils.smoothstep(x, CAMPO.x0 - 1.5, CAMPO.x0 - 0.2) * (1 - THREE.MathUtils.smoothstep(x, CAMPO.x1 + 0.2, CAMPO.x1 + 1.5));
      const perfil = 0.5 + 0.5 * Math.cos(2 * Math.PI * fila);
      const y = (0.1 * Math.pow(perfil, 0.8) + (fbm(x * 0.5, z * 0.5, 999, 3) - 0.5) * 0.04) * dentro;
      pos.setY(i, y);
      uv.setXY(i, x / 2.2, z / 2.2);
    }
    geo.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      map: tierra.mapa,
      normalMap: tierra.normales,
      normalScale: new THREE.Vector2(0.6, 0.6),
      roughness: 0.96,
    });
    const n = aspersores.length;
    const uAsp = { value: aspersores.map((a, i) => new THREE.Vector3(a.x, a.z, umbrales[i])) };
    /* Suelo mojado: círculos que crecen alrededor de cada aspersor
       abierto; la tierra se oscurece y brilla un poco. */
    material.onBeforeCompile = (shader) => {
      shader.uniforms.uRiego = uRiego;
      shader.uniforms.uAsp = uAsp;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vMundo;")
        .replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvMundo = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `#include <common>\nvarying vec3 vMundo;\nuniform float uRiego;\nuniform vec3 uAsp[${n}];`,
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          float humedo = 0.0;
          for (int i = 0; i < ${n}; i++) {
            vec3 a = uAsp[i];
            float act = clamp((uRiego - a.z) / 0.28, 0.0, 1.0);
            float radio = 7.8 * act;
            float d = distance(vMundo.xz, a.xy);
            humedo = max(humedo, smoothstep(radio, radio - 3.0, d) * act);
          }
          humedo *= 0.82 + 0.18 * sin(vMundo.x * 1.7) * sin(vMundo.z * 1.3);
          diffuseColor.rgb *= mix(1.0, 0.52, humedo);`,
        )
        .replace(
          "#include <roughnessmap_fragment>",
          "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.45, humedo);",
        );
    };
    const parcela = new THREE.Mesh(geo, material);
    parcela.receiveShadow = true;
    escena.add(parcela);
  }

  /* ----- Cultivo: plantas instanciadas sobre los camellones ----- */
  const uCrecimiento = { value: 1 };
  const uVerdor = { value: 1 };
  {
    const geo = geometriaPlanta();
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, side: THREE.DoubleSide, roughness: 0.62 });
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, { uTiempo, uCrecimiento, uVerdor });
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uTiempo;\nuniform float uCrecimiento;")
        .replace("#include <begin_vertex>", VERTICE_PLANTA);
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform float uVerdor;")
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
          vec3 seco = mix(vec3(lum), diffuseColor.rgb, 0.4) * vec3(1.1, 1.0, 0.68);
          diffuseColor.rgb = mix(seco * 0.92, diffuseColor.rgb * 1.12, uVerdor);`,
        );
    };
    const sombra = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
    sombra.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, { uTiempo, uCrecimiento });
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uTiempo;\nuniform float uCrecimiento;")
        .replace("#include <begin_vertex>", VERTICE_PLANTA);
    };

    const paso = ligero ? 0.95 : 0.62;
    const saltoFilas = ligero ? 2 : 1;
    const matrices: THREE.Matrix4[] = [];
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Vector3();
    const p = new THREE.Vector3();
    const filas = Math.round((CAMPO.x1 - CAMPO.x0) / FILA);
    for (let f = 0; f <= filas; f += saltoFilas) {
      const x = CAMPO.x0 + f * FILA;
      for (let z = CAMPO.z0 - 0.3; z > CAMPO.z1; z -= paso) {
        const r = hash(f * 7.1, z * 3.3);
        if (r < 0.04) continue; // alguna falla en la hilera, como en campo
        p.set(x + (hash(z, f) - 0.5) * 0.06, 0.09, z + (r - 0.5) * 0.2);
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), hash(f, z * 1.7) * Math.PI * 2);
        const s = 0.82 + hash(z * 2.1, f * 1.3) * 0.4;
        e.set(s, s * (0.9 + r * 0.2), s);
        matrices.push(m.clone().compose(p, q, e));
      }
    }
    const cultivo = new THREE.InstancedMesh(geo, material, matrices.length);
    matrices.forEach((mat, i) => cultivo.setMatrixAt(i, mat));
    cultivo.customDepthMaterial = sombra;
    cultivo.castShadow = !ligero;
    cultivo.receiveShadow = true;
    cultivo.frustumCulled = false;
    escena.add(cultivo);
  }

  /* ----- Tubería: se tiende y se llena de agua ----- */
  type Tubo = { uInstalado: { value: number }; uAgua: { value: number } };
  function tubo(puntos: THREE.Vector3[], radio: number, color: string): Tubo {
    const camino = new THREE.CurvePath<THREE.Vector3>();
    for (let i = 0; i < puntos.length - 1; i++) camino.add(new THREE.LineCurve3(puntos[i], puntos[i + 1]));
    const largo = camino.getLength();
    const geo = new THREE.TubeGeometry(camino, Math.max(8, Math.round(largo * 2)), radio, 10, false);
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.05 });
    const u = { uInstalado: { value: 1 }, uAgua: { value: 1 } };
    /* El tramo aún no tendido se descarta; el tramo con agua lleva un
       brillo tenue que avanza, como en un gemelo digital del sistema. */
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, u, { uTiempo, uLargo: { value: largo } });
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying float vLargo;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLargo = uv.x;");
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying float vLargo;\nuniform float uInstalado;\nuniform float uAgua;\nuniform float uTiempo;\nuniform float uLargo;",
        )
        .replace(
          "#include <clipping_planes_fragment>",
          "#include <clipping_planes_fragment>\nif (vLargo > uInstalado) discard;",
        )
        .replace(
          "#include <emissivemap_fragment>",
          `#include <emissivemap_fragment>
          float lleno = step(vLargo, uAgua) * step(0.0005, uAgua);
          float bandas = 0.5 + 0.5 * sin(vLargo * uLargo * 1.4 - uTiempo * 7.0);
          float frente = smoothstep(uAgua - 6.0 / uLargo, uAgua, vLargo) * lleno;
          totalEmissiveRadiance += vec3(0.22, 0.62, 0.85) * lleno * (0.12 + 0.12 * bandas) + vec3(0.5, 0.85, 1.0) * frente * 0.6;`,
        );
    };
    const malla = new THREE.Mesh(geo, material);
    malla.castShadow = true;
    malla.receiveShadow = true;
    escena.add(malla);
    return u;
  }

  const salida = new THREE.Vector3(BOMBA.x + 0.2, 0.62, BOMBA.z);
  const tuboCaptacion = tubo(
    [
      new THREE.Vector3(POZO.x, 0.55, POZO.z),
      new THREE.Vector3(POZO.x, 0.2, POZO.z - 0.6),
      new THREE.Vector3(BOMBA.x + 0.2, 0.2, BOMBA.z + 0.6),
      new THREE.Vector3(BOMBA.x + 0.2, 0.45, BOMBA.z + 0.2),
    ],
    0.05,
    "#c4c7c0",
  );
  const tuboDescarga = tubo(
    [
      salida,
      new THREE.Vector3(salida.x, 0.95, salida.z),
      new THREE.Vector3(salida.x + 0.7, 0.95, salida.z),
      new THREE.Vector3(salida.x + 0.7, ALTO_TUBO, salida.z),
      new THREE.Vector3(salida.x + 1.2, ALTO_TUBO, PRINCIPAL_Z),
    ],
    0.055,
    "#c4c7c0",
  );
  const inicioPrincipal = salida.x + 1.2;
  const finPrincipal = LATERALES_X[LATERALES_X.length - 1] + 0.3;
  const tuboPrincipal = tubo(
    [new THREE.Vector3(inicioPrincipal, ALTO_TUBO, PRINCIPAL_Z), new THREE.Vector3(finPrincipal, ALTO_TUBO, PRINCIPAL_Z)],
    0.065,
    "#c4c7c0",
  );
  const tubosLaterales = LATERALES_X.map((x) =>
    tubo(
      [
        new THREE.Vector3(x, ALTO_TUBO, PRINCIPAL_Z),
        new THREE.Vector3(x, 0.05, PRINCIPAL_Z - 0.6),
        new THREE.Vector3(x, 0.05, ASPERSORES_Z[ASPERSORES_Z.length - 1] - 1),
      ],
      0.03,
      "#1d2220",
    ),
  );

  /* ----- Aspersores: elevador galvanizado y cabezal de impacto ----- */
  const metal = new THREE.MeshStandardMaterial({ color: "#9aa3a2", metalness: 0.85, roughness: 0.38 });
  const laton = new THREE.MeshStandardMaterial({ color: "#b08a4a", metalness: 0.9, roughness: 0.32 });
  const elevadores = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.018, 0.02, ALTO_ELEVADOR, 8).translate(0, ALTO_ELEVADOR / 2, 0),
    metal,
    aspersores.length,
  );
  const cabezales = new THREE.InstancedMesh(
    mergeGeometries([
      new THREE.CylinderGeometry(0.032, 0.04, 0.08, 10).translate(0, 0.04, 0),
      new THREE.BoxGeometry(0.16, 0.018, 0.022).translate(0.04, 0.1, 0),
      new THREE.CylinderGeometry(0.012, 0.012, 0.09, 6).rotateZ(Math.PI / 2.6).translate(0.07, 0.07, 0),
    ])!,
    laton,
    aspersores.length,
  );
  for (const malla of [elevadores, cabezales]) {
    malla.castShadow = true;
    malla.frustumCulled = false;
    escena.add(malla);
  }

  /* Rocío: partículas en balística simple, calculadas en la GPU. Un
     chorro que gira y una bruma alrededor, a contraluz del sol. */
  const porAspersor = ligero ? 220 : 700;
  const uPx = { value: 1 };
  {
    const n = aspersores.length * porAspersor;
    const origen = new Float32Array(n * 3);
    const semilla = new Float32Array(n * 4);
    const umbral = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const a = Math.floor(i / porAspersor);
      origen.set([aspersores[a].x, aspersores[a].y + 0.1, aspersores[a].z], i * 3);
      semilla.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
      umbral[i] = umbrales[a];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(origen, 3));
    geo.setAttribute("aSemilla", new THREE.BufferAttribute(semilla, 4));
    geo.setAttribute("aUmbral", new THREE.BufferAttribute(umbral, 1));
    const material = new THREE.ShaderMaterial({
      uniforms: { uTiempo, uRiego, uPx, uColor: { value: new THREE.Color("#e3f5ff") } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexShader: /* glsl */ `
        attribute vec4 aSemilla;
        attribute float aUmbral;
        uniform float uTiempo;
        uniform float uRiego;
        uniform float uPx;
        varying float vAlfa;
        void main() {
          float act = clamp((uRiego - aUmbral) / 0.12, 0.0, 1.0);
          float vida = fract(uTiempo * (0.6 + aSemilla.w * 0.3) + aSemilla.x);
          float t = vida * 1.2;
          float chorro = step(aSemilla.z, 0.6);
          float fase = fract(sin(dot(position.xz, vec2(12.9898, 78.233))) * 43758.5453) * 6.2831;
          float az = mix(aSemilla.y * 6.2831, uTiempo * 0.9 + fase + (aSemilla.y - 0.5) * 0.3, chorro);
          float elev = mix(0.18, 0.5, fract(aSemilla.w * 7.3));
          float v = mix(3.5, 8.8, mix(aSemilla.y, 0.75 + 0.25 * aSemilla.w, chorro));
          vec3 dir = vec3(cos(az) * cos(elev), sin(elev), sin(az) * cos(elev));
          vec3 p = position + dir * v * t;
          p.y -= 4.9 * t * t;
          float sobreSuelo = step(0.05, p.y);
          vAlfa = act * sobreSuelo * (1.0 - vida * 0.7) * smoothstep(0.0, 0.06, vida) * mix(0.35, 1.0, chorro);
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          /* La bruma (fuera del chorro) va en gotas más grandes y tenues. */
          gl_PointSize = act > 0.0 ? mix(0.12, 0.05 + aSemilla.z * 0.04, chorro) * uPx / -mv.z : 0.0;
          gl_PointSize = max(gl_PointSize, act > 0.0 ? 1.5 : 0.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vAlfa;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.05, d) * vAlfa * 0.9;
          gl_FragColor = vec4(uColor, a);
        }
      `,
    });
    const rocio = new THREE.Points(geo, material);
    rocio.frustumCulled = false;
    escena.add(rocio);
  }

  /* ----- Bomba centrífuga con motor eléctrico, sobre su base ----- */
  const bomba = new THREE.Group();
  const rotor = new THREE.Group();
  const led = new THREE.MeshStandardMaterial({ color: "#1b2a1f", emissive: "#6cff7a", emissiveIntensity: 0 });
  const luzBomba = new THREE.PointLight("#7fd6ff", 0, 6, 2);
  {
    const concreto = new THREE.MeshStandardMaterial({ color: "#6d6961", roughness: 0.95 });
    const acero = new THREE.MeshStandardMaterial({ color: "#2c3331", metalness: 0.6, roughness: 0.5 });
    const pinturaMotor = new THREE.MeshStandardMaterial({ color: "#1f5670", metalness: 0.35, roughness: 0.42 });
    const pinturaBomba = new THREE.MeshStandardMaterial({ color: "#1f4f6e", metalness: 0.45, roughness: 0.45 });
    const agregar = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      m.receiveShadow = true;
      bomba.add(m);
      return m;
    };
    agregar(new THREE.BoxGeometry(1.9, 0.16, 1.3), concreto, 0, 0.08, 0);
    agregar(new THREE.BoxGeometry(1.35, 0.06, 0.46), acero, 0, 0.19, 0);
    const motor = agregar(new THREE.CylinderGeometry(0.21, 0.21, 0.56, 28), pinturaMotor, -0.28, 0.45, 0);
    motor.rotation.z = Math.PI / 2;
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      const aleta = agregar(new THREE.BoxGeometry(0.5, 0.025, 0.02), pinturaMotor, -0.28, 0.45 + Math.sin(a) * 0.215, Math.cos(a) * 0.215);
      aleta.rotation.x = a;
    }
    agregar(new THREE.BoxGeometry(0.16, 0.1, 0.14), pinturaMotor, -0.22, 0.7, 0);
    const piloto = new THREE.Mesh(new THREE.SphereGeometry(0.018, 10, 8), led);
    piloto.position.set(-0.22, 0.76, 0.07);
    bomba.add(piloto);
    const tapa = agregar(new THREE.CylinderGeometry(0.2, 0.2, 0.06, 28), acero, -0.59, 0.45, 0);
    tapa.rotation.z = Math.PI / 2;
    /* Ventilador visible por la rejilla trasera: lo que gira al arrancar. */
    rotor.position.set(-0.63, 0.45, 0);
    for (let i = 0; i < 5; i++) {
      const aspa = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.17, 0.045), acero);
      aspa.position.y = 0.08;
      const brazo = new THREE.Group();
      brazo.rotation.x = (i / 5) * Math.PI * 2;
      brazo.add(aspa);
      rotor.add(brazo);
    }
    bomba.add(rotor);
    const acople = agregar(new THREE.CylinderGeometry(0.06, 0.06, 0.12, 12), acero, 0.04, 0.45, 0);
    acople.rotation.z = Math.PI / 2;
    const voluta = agregar(new THREE.CylinderGeometry(0.23, 0.23, 0.2, 28), pinturaBomba, 0.2, 0.45, 0);
    voluta.rotation.z = Math.PI / 2;
    agregar(new THREE.CylinderGeometry(0.07, 0.07, 0.14, 14), pinturaBomba, 0.2, 0.62, 0);
    /* Tapa de la voluta con su aro de pernos. */
    const aro = agregar(new THREE.TorusGeometry(0.2, 0.018, 8, 32), acero, 0.31, 0.45, 0);
    aro.rotation.y = Math.PI / 2;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      agregar(new THREE.SphereGeometry(0.014, 6, 4), acero, 0.32, 0.45 + Math.sin(a) * 0.2, Math.cos(a) * 0.2);
    }
    /* Manómetro sobre la descarga. */
    const manometro = agregar(
      new THREE.CylinderGeometry(0.05, 0.05, 0.02, 20),
      new THREE.MeshStandardMaterial({ color: "#f1efe8", roughness: 0.3 }),
      0.2 + 0.7,
      0.78,
      0.07,
    );
    manometro.rotation.x = Math.PI / 2;
    manometro.name = "manometro";
    luzBomba.position.set(0, 0.9, 0.6);
    bomba.add(luzBomba);

    /* Brocal del pozo con su tapa metálica. */
    const brocal = new THREE.MeshStandardMaterial({ color: "#5b5750", roughness: 0.95 });
    const pozo = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.44, 0.5, 28), brocal);
    pozo.position.set(POZO.x - BOMBA.x, 0.25, POZO.z - BOMBA.z);
    pozo.castShadow = pozo.receiveShadow = true;
    bomba.add(pozo);
    const tapaPozo = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.03, 28), acero);
    tapaPozo.position.set(POZO.x - BOMBA.x, 0.515, POZO.z - BOMBA.z);
    tapaPozo.castShadow = tapaPozo.receiveShadow = true;
    bomba.add(tapaPozo);
  }
  bomba.position.copy(BOMBA);
  escena.add(bomba);
  const manometro = bomba.getObjectByName("manometro")!;

  /* ----- Sondas de humedad con panel solar y antena ----- */
  const sondas: THREE.Group[] = [];
  const ledSonda = new THREE.MeshStandardMaterial({ color: "#2a200c", emissive: "#fbad18", emissiveIntensity: 0 });
  {
    const blanco = new THREE.MeshStandardMaterial({ color: "#e9e7e0", roughness: 0.45 });
    const panel = new THREE.MeshStandardMaterial({ color: "#1c2b44", metalness: 0.7, roughness: 0.22 });
    const acero = new THREE.MeshStandardMaterial({ color: "#8e9796", metalness: 0.8, roughness: 0.4 });
    for (const [x, z] of SONDAS) {
      const g = new THREE.Group();
      const piezas: [THREE.BufferGeometry, THREE.Material, number, number, number][] = [
        [new THREE.CylinderGeometry(0.012, 0.012, 0.75, 6), acero, 0, 0.37, 0],
        [new THREE.BoxGeometry(0.13, 0.1, 0.06), blanco, 0, 0.72, 0],
        [new THREE.CylinderGeometry(0.004, 0.004, 0.3, 4), acero, 0.05, 0.92, 0],
      ];
      for (const [geo, mat, px, py, pz] of piezas) {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(px, py, pz);
        m.castShadow = true;
        g.add(m);
      }
      const solar = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.01, 0.15), panel);
      solar.position.set(0, 0.8, 0);
      solar.rotation.x = -0.5;
      solar.castShadow = true;
      g.add(solar);
      const piloto = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), ledSonda);
      piloto.position.set(0.04, 0.73, 0.032);
      g.add(piloto);
      g.position.set(x, 0, z);
      escena.add(g);
      sondas.push(g);
    }
  }

  /* ----- Tractor con cultivador, por la calle del fondo ----- */
  const tractor = new THREE.Group();
  const ruedas: THREE.Mesh[] = [];
  {
    const pintura = new THREE.MeshStandardMaterial({ color: "#c38a1a", metalness: 0.35, roughness: 0.42 });
    const chasis = new THREE.MeshStandardMaterial({ color: "#262624", metalness: 0.5, roughness: 0.6 });
    const caucho = new THREE.MeshStandardMaterial({ color: "#151515", roughness: 0.92 });
    const vidrio = new THREE.MeshStandardMaterial({ color: "#1d2a2c", metalness: 0.9, roughness: 0.08, transparent: true, opacity: 0.55 });
    const pieza = (geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      m.castShadow = true;
      tractor.add(m);
      return m;
    };
    pieza(new THREE.BoxGeometry(1.9, 0.85, 0.9), pintura, 0.95, 1.15, 0);
    pieza(new THREE.BoxGeometry(3.1, 0.35, 0.72), chasis, 0.3, 0.72, 0);
    pieza(new THREE.BoxGeometry(1.35, 1.15, 1.35), vidrio, -0.7, 2.05, 0);
    pieza(new THREE.BoxGeometry(1.5, 0.09, 1.55), pintura, -0.7, 2.68, 0);
    for (const [px, pz] of [[-1.35, 0.66], [-1.35, -0.66], [-0.05, 0.66], [-0.05, -0.66]]) {
      pieza(new THREE.BoxGeometry(0.06, 1.2, 0.06), chasis, px, 2.05, pz);
    }
    pieza(new THREE.CylinderGeometry(0.045, 0.05, 0.9, 8), chasis, 1.35, 1.95, 0.28);
    for (const z of [0.86, -0.86]) {
      const trasera = pieza(new THREE.CylinderGeometry(0.85, 0.85, 0.48, 28), caucho, -0.7, 0.85, z);
      trasera.rotation.x = Math.PI / 2;
      ruedas.push(trasera);
      const guarda = pieza(new THREE.CylinderGeometry(0.95, 0.95, 0.52, 20, 1, true, 0, Math.PI), pintura, -0.7, 0.9, z);
      guarda.rotation.x = Math.PI / 2;
      guarda.rotation.z = Math.PI / 2;
      const delantera = pieza(new THREE.CylinderGeometry(0.5, 0.5, 0.32, 22), caucho, 1.55, 0.5, z * 0.88);
      delantera.rotation.x = Math.PI / 2;
      ruedas.push(delantera);
    }
    /* Cultivador de arrastre. */
    pieza(new THREE.BoxGeometry(0.18, 0.14, 2.5), chasis, -2.35, 0.55, 0);
    pieza(new THREE.BoxGeometry(0.9, 0.1, 0.12), chasis, -1.85, 0.62, 0);
    for (let i = 0; i < 6; i++) pieza(new THREE.BoxGeometry(0.05, 0.5, 0.05), chasis, -2.4, 0.3, -1.1 + i * 0.44);
  }
  escena.add(tractor);

  /* Polvo que levanta el cultivador: se queda atrás y se disipa. */
  const uPolvo = { value: 0 };
  const uTractor = { value: new THREE.Vector3() };
  {
    const n = ligero ? 0 : 140;
    const semilla = new Float32Array(n * 4);
    for (let i = 0; i < n * 4; i++) semilla[i] = Math.random();
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    geo.setAttribute("aSemilla", new THREE.BufferAttribute(semilla, 4));
    const material = new THREE.ShaderMaterial({
      uniforms: { uTiempo, uPolvo, uTractor, uPx, uColor: { value: new THREE.Color("#b49a74") } },
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        attribute vec4 aSemilla;
        uniform float uTiempo;
        uniform float uPolvo;
        uniform vec3 uTractor;
        uniform float uPx;
        varying float vAlfa;
        void main() {
          float edad = fract(uTiempo * 0.45 + aSemilla.x);
          vec3 p = uTractor + vec3(-2.6 - edad * 5.0, 0.2 + edad * 1.6 * aSemilla.y, (aSemilla.z - 0.5) * 2.4 * (0.6 + edad));
          vAlfa = uPolvo * (1.0 - edad) * smoothstep(0.0, 0.1, edad) * 0.22;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (0.5 + edad * 1.6) * uPx / -mv.z;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vAlfa;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          gl_FragColor = vec4(uColor, smoothstep(0.5, 0.1, d) * vAlfa);
        }
      `,
    });
    const polvo = new THREE.Points(geo, material);
    polvo.frustumCulled = false;
    escena.add(polvo);
  }

  /* ----- Paisaje de fondo: arboledas y volcanes en la neblina ----- */
  {
    /* Cada árbol es un racimo irregular de copas con su tronco, con
       color por vértice (más oscuro abajo); lejos y en la neblina se
       leen como arboledas reales. */
    const geoArbol = (() => {
      const partes: THREE.BufferGeometry[] = [];
      const oscuro = new THREE.Color("#2a4520");
      const claro = new THREE.Color("#66913d");
      const c = new THREE.Color();
      for (let k = 0; k < 7; k++) {
        const r = 0.55 + hash(k, 3.1) * 0.45;
        /* Vértices soldados: el sombreado queda suave, sin facetas. */
        const g = mergeVertices(new THREE.IcosahedronGeometry(r, 2).deleteAttribute("uv").deleteAttribute("normal"));
        g.translate((hash(k, 1.3) - 0.5) * 1.4, 2.2 + hash(k, 2.7) * 1.3, (hash(k, 5.9) - 0.5) * 1.4);
        const pos = g.attributes.position;
        const col: number[] = [];
        for (let i = 0; i < pos.count; i++) {
          const v = new THREE.Vector3().fromBufferAttribute(pos, i);
          const bulto = 1 + (ruido(v.x * 2.3 + 10, v.y * 2.3 + v.z * 1.7, 999) - 0.5) * 0.45;
          pos.setXYZ(i, v.x * bulto, v.y + (bulto - 1) * 0.4, v.z * bulto);
          c.copy(oscuro).lerp(claro, THREE.MathUtils.clamp((v.y - 1.8) / 2.2, 0, 1) * (0.7 + hash(i, k) * 0.3));
          col.push(c.r, c.g, c.b);
        }
        g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
        partes.push(g);
      }
      const tronco = new THREE.CylinderGeometry(0.12, 0.18, 2.4, 6).translate(0, 1.2, 0);
      tronco.deleteAttribute("uv");
      tronco.deleteAttribute("normal");
      const marron = new THREE.Color("#3a2c1f");
      tronco.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(Array.from({ length: tronco.attributes.position.count }, () => [marron.r, marron.g, marron.b]).flat(), 3),
      );
      partes.push(tronco);
      const g = mergeGeometries(partes)!;
      g.computeVertexNormals();
      return g;
    })();
    const n = ligero ? 90 : 220;
    const arboles = new THREE.InstancedMesh(geoArbol, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }), n);
    const m = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const lado = i % 3;
      let x: number;
      let z: number;
      if (lado === 0) {
        x = -62 - hash(i, 1) * 110;
        z = 30 - hash(i, 2) * 200;
      } else if (lado === 1) {
        x = 62 + hash(i, 3) * 110;
        z = 30 - hash(i, 4) * 200;
      } else {
        x = (hash(i, 5) - 0.5) * 340;
        z = -95 - hash(i, 6) * 120;
      }
      const esc = 1.6 + hash(i, 7) * 1.8;
      m.compose(
        new THREE.Vector3(x, 0, z),
        new THREE.Quaternion().setFromAxisAngle(THREE.Object3D.DEFAULT_UP, hash(i, 8) * 6.28),
        new THREE.Vector3(esc * (0.85 + hash(i, 9) * 0.3), esc * (0.9 + hash(i, 10) * 0.4), esc),
      );
      arboles.setMatrixAt(i, m);
    }
    arboles.castShadow = !ligero;
    arboles.receiveShadow = true;
    escena.add(arboles);

    /* Volcanes lejanos en perspectiva aérea: silueta azulada arriba
       que se funde con la bruma del horizonte en la base. No usan la
       neblina de la escena (a esa distancia quedarían del color de la
       niebla y no del cielo). Las laderas llevan barrancos y la cara
       que mira al sol queda más clara, para que se lean con volumen. */
    const solXZ = new THREE.Vector2(SOL.x, SOL.z).normalize();
    const volcan = (x: number, z: number, alto: number, radio: number, semilla: number) => {
      const perfil = Array.from({ length: 14 }, (_, i) => {
        const t = i / 13;
        /* Cono cóncavo con el cráter apenas truncado. */
        const r = radio * (0.04 + 0.96 * Math.pow(t, 1.6));
        return new THREE.Vector2(r, alto * (1 - Math.pow(t, 0.75)));
      });
      const geo = new THREE.LatheGeometry(perfil, 160);
      const cima = new THREE.Color("#4d6270");
      const base = new THREE.Color("#c4bca6");
      const luz = new THREE.Color("#9fa99f");
      const c = new THREE.Color();
      const pos = geo.attributes.position;
      const col: number[] = [];
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const altura = v.y / alto;
        const ang = Math.atan2(v.z, v.x);
        /* Barrancos: surcos radiales más marcados a media ladera. */
        const barranco = (ruido(ang * 9 + semilla, altura * 3, 999) - 0.5) * 0.14 * Math.sin(Math.PI * Math.min(1, altura * 1.4));
        const r = Math.hypot(v.x, v.z) * (1 + barranco);
        pos.setXYZ(i, Math.cos(ang) * r, v.y, Math.sin(ang) * r);
        const alSol = Math.max(0, (Math.cos(ang) * solXZ.x + Math.sin(ang) * solXZ.y));
        c.copy(base).lerp(cima, Math.pow(altura, 0.55));
        c.lerp(luz, alSol * 0.35 * Math.min(1, altura * 2));
        c.multiplyScalar(1 - Math.max(0, -barranco) * 1.6);
        col.push(c.r, c.g, c.b);
      }
      geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      const malla = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, fog: false }));
      malla.position.set(x, -5, z);
      escena.add(malla);
    };
    volcan(-1400, -3000, 330, 1300, 1);
    volcan(900, -3400, 420, 1500, 7);
    volcan(2100, -3600, 300, 1200, 13);
  }

  /* ----- Cámara tipo dron ----- */
  const rutaPos = new THREE.CatmullRomCurve3(PLANOS.map(([p]) => new THREE.Vector3(...p)), false, "centripetal");
  const rutaMira = new THREE.CatmullRomCurve3(PLANOS.map(([, t]) => new THREE.Vector3(...t)), false, "centripetal");
  const mira = new THREE.Vector3();

  /* ----- Tamaño ----- */
  function ajustar() {
    const ancho = contenedor.clientWidth || 1;
    const alto = contenedor.clientHeight || 1;
    renderer.setSize(ancho, alto, false);
    camara.aspect = ancho / alto;
    /* En vertical se abre el encuadre para no perder el sistema. */
    camara.fov = camara.aspect < 1 ? 62 : 42;
    camara.updateProjectionMatrix();
    uPx.value = alto * renderer.getPixelRatio() / (2 * Math.tan(THREE.MathUtils.degToRad(camara.fov) / 2));
  }
  ajustar();

  /* ----- Cuadro a cuadro: la escena sigue al estado ----- */
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  let tractorPrevio = estado.tractor;
  let reloj = 0;
  let ultimo = performance.now();

  function cuadro() {
    const ahora = performance.now();
    const dt = Math.min(0.05, (ahora - ultimo) / 1000);
    ultimo = ahora;
    if (animado) reloj += dt;
    uTiempo.value = reloj;
    uCielo.time.value = reloj;

    uCrecimiento.value = estado.crecimiento;
    uVerdor.value = estado.verdor;
    uRiego.value = estado.riego;

    /* Tendido: primero captación, descarga y principal; luego cada lateral. */
    const sis = estado.sistema;
    tuboCaptacion.uInstalado.value = tramo(sis, 0, 0.18);
    tuboDescarga.uInstalado.value = tramo(sis, 0.12, 0.28);
    manometro.visible = tuboDescarga.uInstalado.value > 0.6;
    tuboPrincipal.uInstalado.value = tramo(sis, 0.22, 0.55);
    tubosLaterales.forEach((t, i) => (t.uInstalado.value = tramo(sis, 0.45 + i * 0.1, 0.7 + i * 0.1)));

    /* Agua: el frente recorre la principal y entra a cada lateral cuando
       lo alcanza. */
    const ag = estado.agua;
    tuboCaptacion.uAgua.value = tramo(ag, 0, 0.12);
    tuboDescarga.uAgua.value = tramo(ag, 0.1, 0.22);
    const frentePrincipal = tramo(ag, 0.2, 0.55);
    tuboPrincipal.uAgua.value = frentePrincipal;
    tubosLaterales.forEach((t, i) => {
      const llega = (LATERALES_X[i] - inicioPrincipal) / (finPrincipal - inicioPrincipal);
      const inicio = 0.2 + 0.35 * llega;
      t.uAgua.value = tramo(ag, inicio, inicio + 0.4);
    });

    /* Aspersores: se montan uno tras otro sobre sus elevadores. */
    aspersores.forEach((a, i) => {
      const k = suave(tramo(estado.aspersores, (i / aspersores.length) * 0.7, (i / aspersores.length) * 0.7 + 0.3));
      s.set(1, Math.max(k, 0.0001), 1);
      m.compose(p.set(a.x, 0.02, a.z), q.identity(), s);
      elevadores.setMatrixAt(i, m);
      s.setScalar(Math.max(k, 0.0001));
      m.compose(p.set(a.x, 0.02 + ALTO_ELEVADOR * k, a.z), q.setFromAxisAngle(THREE.Object3D.DEFAULT_UP, reloj * 0.9 * tramo(estado.riego, umbrales[i], umbrales[i] + 0.1) + i), s);
      cabezales.setMatrixAt(i, m);
    });
    elevadores.instanceMatrix.needsUpdate = true;
    cabezales.instanceMatrix.needsUpdate = true;

    /* Sondas: salen del suelo; el piloto parpadea al transmitir. */
    sondas.forEach((g, i) => {
      const k = suave(tramo(estado.sondas, i * 0.2, i * 0.2 + 0.6));
      g.scale.set(1, Math.max(k, 0.0001), 1);
      g.visible = k > 0.001;
    });
    ledSonda.emissiveIntensity = estado.sondas >= 1 ? 1.5 + Math.sin(reloj * 6) * 1.2 : 0;

    /* Bomba: piloto, ventilador, un temblor mínimo y un brillo frío. */
    const b = estado.bomba;
    led.emissiveIntensity = b * 3;
    rotor.rotation.x += dt * 28 * b;
    luzBomba.intensity = b * 1.4;
    bomba.position.set(BOMBA.x + Math.sin(reloj * 90) * 0.003 * b, BOMBA.y, BOMBA.z);

    /* Tractor: cruza la calle; las ruedas giran según la distancia. */
    const xTractor = THREE.MathUtils.lerp(-48, 48, estado.tractor);
    tractor.position.set(xTractor, 0, CALLE_Z);
    ruedas.forEach((r, i) => (r.rotation.y = -(xTractor / (i % 2 === 0 ? 0.85 : 0.5))));
    const velocidad = Math.abs(estado.tractor - tractorPrevio) / Math.max(dt, 0.001);
    tractorPrevio = estado.tractor;
    uPolvo.value = THREE.MathUtils.lerp(uPolvo.value, Math.min(1, velocidad * 6), 0.08);
    uTractor.value.set(xTractor, 0, CALLE_Z);

    /* Cámara: sigue la ruta con un vaivén leve, como un dron en el aire. */
    const c = THREE.MathUtils.clamp(estado.camara, 0, 1);
    rutaPos.getPoint(c, camara.position);
    rutaMira.getPoint(c, mira);
    camara.position.y += Math.sin(reloj * 0.6) * 0.04;
    camara.position.x += Math.sin(reloj * 0.37) * 0.05;
    camara.lookAt(mira);

    /* El sol sigue el foco para que la sombra sea nítida donde se mira. */
    sol.target.position.set(mira.x, 0, mira.z);
    sol.position.copy(sol.target.position).addScaledVector(SOL, 90);

    renderer.render(escena, camara);
  }

  /* ----- Ciclo: solo corre mientras el hero está en pantalla ----- */
  let corriendo = false;
  const arrancar = () => {
    if (corriendo) return;
    corriendo = true;
    ultimo = performance.now();
    renderer.setAnimationLoop(cuadro);
  };
  const parar = () => {
    corriendo = false;
    renderer.setAnimationLoop(null);
  };
  const visible = new IntersectionObserver(([entrada]) => {
    if (!animado) return;
    if (entrada.isIntersecting) arrancar();
    else parar();
  });
  visible.observe(contenedor);
  const redimension = new ResizeObserver(() => {
    ajustar();
    if (!animado) cuadro();
  });
  redimension.observe(contenedor);
  cuadro();

  return {
    dispose() {
      parar();
      visible.disconnect();
      redimension.disconnect();
      escena.traverse((obj) => {
        const malla = obj as THREE.Mesh;
        if (malla.geometry) malla.geometry.dispose();
        const materiales = malla.material ? (Array.isArray(malla.material) ? malla.material : [malla.material]) : [];
        for (const mat of materiales) mat.dispose();
      });
      for (const t of [tierra.mapa, tierra.normales, pasto.mapa, pasto.normales]) t.dispose();
      entorno.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    },
  };
}
