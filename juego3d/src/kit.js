/* ============================================================
   kit
   La paleta del fogón, los tres estilos de los bocetos y la fábrica de mallas. Todo el mundo se
   construye pidiéndole piezas al kit (K.malla, K.esfera, K.mat…), así que cambiar de estilo es
   cambiar de kit: la misma escena sale facetada, entintada o de arcilla sin tocar sus dibujos.
   ============================================================ */
import * as THREE from 'three';
import { RoundedBoxGeometry } from '../vendor/addons/RoundedBoxGeometry.js';
import { mergeVertices, mergeGeometries } from '../vendor/addons/BufferGeometryUtils.js';

export const PAL = {
  estepa: ['#bcbd6d', '#b5b665', '#c2c374', '#b9ba6a', '#bfc06f'],   // los cinco tonos de SILVESTRE
  arena: ['#e8d4a2', '#e2cd98', '#ecdbaa', '#ddc790', '#e5d29c'],
  labio: '#8fae55', corte1: '#c9a36a', corte2: '#a9825c', piedrita: '#bfa176', piedritaD: '#8a6a4a',
  agua: '#6fb8d4', aguaHondo: '#4a8fb5', orilla: '#c9a976',
  troncoL: '#7a5636', troncoD: '#5e4128',
  copaD: '#4c7a34', copaM: '#66984a', copaL: '#86b761',
  pinoD: '#3f6b3a', pinoL: '#55874a', seco: '#8a7258',
  piedraL: '#b9b3a4', piedraD: '#8f8a7c', roca: '#a39d90', rocaD: '#86806f', musgo: '#7fa05a', boca: '#241d1a',
  maderaL: '#b98a5e', maderaD: '#96703f', paja: '#d9b56b', pajaD: '#b8913f',
  piel: ['#f2c9a0', '#dcae84', '#c08a60', '#9a6a45'], pelo: ['#3a2a1e', '#5a3d25', '#2a1f18'], canas: '#e9e4d8',
  cuero: '#a5774a', cueroC: '#c49a68', cueroD: '#7e5732', chal: '#b5533c',
  mamut: '#7a5636', mamutC: '#946b45', mamutD: '#5e4128', marfil: '#f3ead2',
  fuego: '#ffb13b', fuegoC: '#ffe68a', fuegoR: '#ff6a2a',
  flor: ['#f2d16b', '#e8a7b4', '#f6f1e3'],
  pez: '#e8904a',
  tinta: '#3b2a1e',
  blob: { guia: '#d98a4e', abuela: '#e2dccf', aprendiz: ['#8cc5a8', '#e8a87c', '#9bb7d9', '#e6c96a', '#d69ac0'] },
};

export const ESTILOS = {
  maqueta: { clave: 'maqueta', letra: 'A', nombre: 'Maqueta', lema: 'facetas de papel, sol y sombras suaves', det: 1, seg: 0.6, flat: true },
  tinta:   { clave: 'tinta',   letra: 'B', nombre: 'Tinta',   lema: 'tres tonos de luz y contorno de tinta',  det: 3, seg: 1.0, toon: true, tinta: true },
  arcilla: { clave: 'arcilla', letra: 'C', nombre: 'Arcilla', lema: 'formas redondas, luz suave, miniatura',  det: 5, seg: 1.7, suave: true },
};

/* Lo que es del kit y comparten todas las épocas (desarmar no lo suelta; K.podar suelta lo que la época nueva no usa).
   Un WeakSet y no una marca en userData: un material clonado copia su userData y pasaría por compartido. */
const DEL_KIT = new WeakSet();
export const esDelKit = x => DEL_KIT.has(x);

/* El degradé del sombreado en tres tonos (estilo B). */
export const GRAD = (() => {
  const t = new THREE.DataTexture(new Uint8Array([85, 165, 255]), 3, 1, THREE.RedFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true; DEL_KIT.add(t);
  return t;
})();

/* LA TINTA. Casco invertido: la malla se infla por su normal y se pinta solo por dentro. Las normales
   se promedian por posición (atributo `nt`) para que las cajas y las facetas no abran grietas en el
   contorno. */
export function normalesDeTinta(geo) {
  if (geo.getAttribute('nt')) return geo;
  const pos = geo.getAttribute('position'), nor = geo.getAttribute('normal');
  const k = i => Math.round(pos.getX(i) * 1000) + ',' + Math.round(pos.getY(i) * 1000) + ',' + Math.round(pos.getZ(i) * 1000);
  const acc = new Map();
  for (let i = 0; i < pos.count; i++) {
    const kk = k(i); let a = acc.get(kk);
    if (!a) { a = [0, 0, 0]; acc.set(kk, a); }
    a[0] += nor.getX(i); a[1] += nor.getY(i); a[2] += nor.getZ(i);
  }
  const nt = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const a = acc.get(k(i)), l = Math.hypot(a[0], a[1], a[2]) || 1;
    nt[i * 3] = a[0] / l; nt[i * 3 + 1] = a[1] / l; nt[i * 3 + 2] = a[2] / l;
  }
  geo.setAttribute('nt', new THREE.BufferAttribute(nt, 3));
  return geo;
}
const tintas = new Map();
export function materialTinta(grosor) {
  if (tintas.has(grosor)) return tintas.get(grosor);
  const m = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(PAL.tinta) }, uGrosor: { value: grosor } },
    vertexShader: `attribute vec3 nt; uniform float uGrosor;
      void main() {
        vec4 p = vec4(position + nt * uGrosor, 1.0);
        #ifdef USE_INSTANCING
          p = instanceMatrix * p;
        #endif
        gl_Position = projectionMatrix * modelViewMatrix * p;
      }`,
    fragmentShader: `uniform vec3 uColor;
      void main() { gl_FragColor = vec4(uColor, 1.0);
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide,
  });
  DEL_KIT.add(m);   // compartido por todas las épocas: desarmar no lo libera
  tintas.set(grosor, m);
  return m;
}

export function crearKit(clave, op = {}) {
  const E = ESTILOS[clave], detalle = op.detalle || 1;   // detalle < 1: menos caras por curva (el modo liviano de los celulares)
  const mats = new Map(), geos = new Map();
  const K = { E, clave };

  /* Material con textura (pinturas, telas): mismo sombreado del estilo, sin pasar por la caché. */
  K.matMapa = (map, o = {}) => E.toon ? new THREE.MeshToonMaterial({ gradientMap: GRAD, map, ...o })
    : E.suave ? new THREE.MeshStandardMaterial({ roughness: 0.62, metalness: 0, map, ...o })
    : new THREE.MeshLambertMaterial({ flatShading: true, map, ...o });

  /* El material del estilo. `o` admite emissive, transparent, opacity, side… */
  K.mat = (color, o = {}) => {
    const key = color + '|' + JSON.stringify(o);
    if (mats.has(key)) return mats.get(key);
    let c = color;
    if (E.suave && typeof color === 'string' && !o.vertexColors) {   // la arcilla: un punto más de color, como pintada a mano
      const col = new THREE.Color(color), hsl = {}; col.getHSL(hsl);
      col.setHSL(hsl.h, Math.min(1, hsl.s * 1.18), Math.min(0.92, hsl.l * 1.03)); c = col;
    }
    const base = { color: c, ...o };
    const m = E.toon ? new THREE.MeshToonMaterial({ gradientMap: GRAD, ...base })
            : E.suave ? new THREE.MeshStandardMaterial({ roughness: 0.62, metalness: 0, ...base })
            : new THREE.MeshLambertMaterial({ flatShading: true, ...base });
    DEL_KIT.add(m);   // de la caché: lo comparten las épocas, desarmar no lo libera
    mats.set(key, m);
    return m;
  };

  const n = (base, min = 3) => Math.max(min, Math.round(base * E.seg * detalle));
  const memo = (key, f) => { if (!geos.has(key)) { const g = f(); DEL_KIT.add(g); geos.set(key, g); } return geos.get(key); };
  /* I4 del QA general: la caché de formas vivía toda la sesión, y al cruzar quedaban en la GPU las de las épocas
     anteriores (~210 al llegar a Egipto). Tras armar una época se sueltan las que ya nada usa en la escena; si
     algo las vuelve a pedir, se crean de nuevo. */
  K.podar = escena => {
    const vivas = new Set(); escena.traverse(o => { if (o.geometry) vivas.add(o.geometry); for (const m of [].concat(o.material || [])) vivas.add(m); });
    let n = 0; for (const [key, g] of geos) if (!vivas.has(g)) { g.dispose(); geos.delete(key); n++; }
    // y los materiales de la caché que la época nueva no usa: cada uno guardaba sus variantes de shader (una por cada número
    // de luces de cada época), y los programas crecían de cruce en cruce (QA entero, 2026-10-03)
    for (const [key, m] of mats) if (!vivas.has(m)) { m.dispose(); mats.delete(key); n++; }
    return n;
  };

  /* Geometrías con el grano del estilo: la maqueta facetada, la tinta lisa, la arcilla muy redonda. */
  /* q: el detalle (1 normal; menos para lo que en pantalla mide pocos píxeles: ojos, manos, pies) */
  K.esfera = (r = 1, q = 1) => memo('e' + r + '_' + q, () => E.flat ? new THREE.IcosahedronGeometry(r, q < 0.6 ? 0 : E.det) : new THREE.SphereGeometry(r, n(18 * q, 5), n(12 * q, 4)));
  K.roca = (r = 1, semilla = 1) => memo('r' + r + '_' + semilla, () => {
    const g = E.flat ? new THREE.IcosahedronGeometry(r, 1) : new THREE.IcosahedronGeometry(r, E.suave ? 4 : 2);
    const p = g.getAttribute('position'), v = new THREE.Vector3(), rnd = azar(semilla);
    const off = [rnd() * 9, rnd() * 9, rnd() * 9];
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const d = 1 + 0.16 * Math.sin(v.x * 2.1 / r + off[0]) * Math.cos(v.z * 1.7 / r + off[1]) + 0.08 * Math.sin(v.y * 3.3 / r + off[2]);
      v.multiplyScalar(d); p.setXYZ(i, v.x, v.y, v.z);
    }
    g.deleteAttribute('normal'); g.deleteAttribute('uv');
    const r2 = E.flat ? g : mergeVertices(g);   // lisa en B y C: sin soldar, cada cara tendría su normal
    r2.computeVertexNormals();
    return r2;
  });
  K.cilindro = (rt, rb, h, radial = 10) => memo(`c${rt}_${rb}_${h}_${radial}`, () => new THREE.CylinderGeometry(rt, rb, h, n(radial, 5)));
  K.cono = (r, h, radial = 10) => memo(`k${r}_${h}_${radial}`, () => new THREE.ConeGeometry(r, h, n(radial, 5)));
  K.capsula = (r, largo, q = 1) => memo(`p${r}_${largo}_${q}`, () => new THREE.CapsuleGeometry(r, largo, n(4 * q, 2), n(12 * q, 6)));
  K.caja = (w, h, d) => memo(`b${w}_${h}_${d}`, () => E.suave
    ? new RoundedBoxGeometry(w, h, d, 3, Math.min(w, h, d) * 0.22)
    : new THREE.BoxGeometry(w, h, d));
  K.toro = (r, tubo, arco = Math.PI * 2, q = 1) => memo(`t${r}_${tubo}_${arco}_${q}`, () => new THREE.TorusGeometry(r, tubo, n(8 * q, 4), n(24 * q, 10), arco));

  /* La pieza: una malla con sombra y, en el estilo B, su casco de tinta. */
  K.malla = (geo, color, o = {}) => {
    const { sinTinta, grosor, sombra = true, recibe = true, ...mo } = o;
    const m = new THREE.Mesh(geo, typeof color === 'string' ? K.mat(color, mo) : color);
    m.castShadow = sombra; m.receiveShadow = recibe;
    if (E.tinta && !sinTinta) {
      const h = new THREE.Mesh(normalesDeTinta(geo), materialTinta(grosor ?? 0.026));
      h.raycast = () => {}; h.userData.tinta = true;
      m.add(h);
    }
    return m;
  };
  K.instancias = (geo, color, cuantas, o = {}) => {
    const { sinTinta, grosor, sombra = true, recibe = true, ...mo } = o;
    const m = new THREE.InstancedMesh(geo, K.mat(color, mo), cuantas);
    m.castShadow = sombra; m.receiveShadow = recibe;
    if (E.tinta && !sinTinta) {
      const h = new THREE.InstancedMesh(normalesDeTinta(geo), materialTinta(grosor ?? 0.02), cuantas);
      h.instanceMatrix = m.instanceMatrix; h.raycast = () => {}; h.frustumCulled = false;
      m.userData.casco = h; m.add(h);
    }
    return m;
  };
  return K;
}

/* Azar con semilla (el mulberry32 del juego 2D): el mundo sale igual en cada estilo y en cada carga. */
export function azar(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* LA TINTA DE LA PIEL: el mismo casco invertido, pero para mallas con esqueleto (las personas). */
let tintaPiel = null;
export function materialTintaPiel(grosor = 0.018) {
  if (tintaPiel) return tintaPiel;
  tintaPiel = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(PAL.tinta) }, uGrosor: { value: grosor } },
    vertexShader: `#include <common>
      #include <skinning_pars_vertex>
      attribute vec3 nt; uniform float uGrosor;
      void main() {
        vec3 transformed = position + nt * uGrosor;
        #include <skinbase_vertex>
        #include <skinning_vertex>
        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
      }`,
    fragmentShader: `uniform vec3 uColor;
      void main() { gl_FragColor = vec4(uColor, 1.0);
        #include <colorspace_fragment>
      }`,
    side: THREE.BackSide,
  });
  return tintaPiel;
}

/* FUNDIR LO QUIETO. Las mallas que no se mueven se funden por material en una sola (con su casco de
   tinta): de cientos de llamadas de dibujo a unas pocas. Se salta todo lo marcado `userData.vivo`
   (personas, llamas, ovejas, lo que se anima o se prende y apaga), lo instanciado, lo transparente y
   los cascos. */
export function fundir(K, raiz, grosor = 0.022) {   // grosor: el de la tinta de lo fundido (las miniaturas, como la Acrópolis, piden uno fino)
  raiz.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(raiz.matrixWorld).invert(), m = new THREE.Matrix4();
  const grupos = new Map(), quitar = [];
  const andar = o => {
    for (const h of o.children) {
      if (h.userData.vivo) continue;
      const esFundible = h.isMesh && !h.isInstancedMesh && !h.isSkinnedMesh && !h.userData.tinta && h.visible &&
        h.material && !Array.isArray(h.material) && h.material.visible !== false && !h.material.transparent &&
        h.children.every(c => c.userData.tinta);
      if (esFundible) {
        const clave = h.material.uuid + '|' + h.castShadow + '|' + h.receiveShadow;
        if (!grupos.has(clave)) grupos.set(clave, { mat: h.material, sombra: h.castShadow, recibe: h.receiveShadow, geos: [] });
        const conMapa = !!h.material.map;                  // las texturas (jeroglíficos, marcas) conservan sus uv
        if (conMapa && !h.geometry.getAttribute('uv')) continue;
        let g2 = h.geometry.index ? h.geometry.toNonIndexed() : h.geometry.clone();
        for (const a of Object.keys(g2.attributes)) if (!['position', 'normal', 'color', ...(conMapa ? ['uv'] : [])].includes(a)) g2.deleteAttribute(a);
        if (h.material.vertexColors && !g2.getAttribute('color')) continue;
        if (!h.material.vertexColors && g2.getAttribute('color')) g2.deleteAttribute('color');
        g2.applyMatrix4(m.multiplyMatrices(inv, h.matrixWorld));
        grupos.get(clave).geos.push(g2); quitar.push(h);
      } else andar(h);
    }
  };
  andar(raiz);
  for (const h of quitar) h.parent.remove(h);
  for (const { mat, sombra, recibe, geos } of grupos.values()) {
    if (!geos.length) continue;
    const geo = mergeGeometries(geos, false); if (!geo) continue;
    geo.userData.propia = true; geos.forEach(g => g.dispose());   // la fundida es de esta pieza: se libera con ella
    const malla = new THREE.Mesh(geo, mat); malla.castShadow = sombra; malla.receiveShadow = recibe;
    if (K.E.tinta) { const h = new THREE.Mesh(normalesDeTinta(geo), materialTinta(grosor)); h.raycast = () => {}; h.userData.tinta = true; malla.add(h); }
    raiz.add(malla);
  }
  return raiz;
}

/* EL FUNDIDO (2026-09-28: «los cambios tienen que ser más suaves»). Quien se va o llega se desvanece en
   vez de aparecer de golpe, como en el 2D. La primera vez, el objeto recibe copias propias de sus
   materiales con alphaHash (transparencia por tramado: no pide ordenar nada y respeta la tinta); el
   casco de tinta se apaga cuando la figura ya es más aire que cuerpo. a: 0 (no está) … 1 (está). */
export function opacidad(obj, a) {
  a = Math.max(0, Math.min(1, a));
  if (obj.userData.opa === a) return;
  if (!obj.userData.mats) {
    if (a >= 1) { obj.visible = true; return; }
    obj.userData.mats = []; obj.userData.cascos = [];
    obj.traverse(o => {
      if (!o.isMesh || (o.material && o.material.visible === false)) return;
      if (o.userData.tinta || o.material.isShaderMaterial) { obj.userData.cascos.push(o); return; }
      o.material = o.material.clone(); o.material.alphaHash = true; obj.userData.mats.push(o.material);
    });
  }
  obj.userData.opa = a;
  obj.visible = a > 0.02;
  for (const m of obj.userData.mats) m.opacity = a;
  for (const c of obj.userData.cascos) c.visible = a > 0.7;
}

