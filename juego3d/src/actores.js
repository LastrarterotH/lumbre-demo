/* ============================================================
   actores
   Las personas de Lumbre 3D (la elección del 2026-09-28: estilo tinta, gente persona). Cada persona
   tiene un esqueleto chico: caderas → muslo → rodilla → canilla, y hombro → brazo → codo → antebrazo
   → mano. Las poses son ángulos objetivo por articulación; anim() los persigue con suavidad, así que
   sentarse, pararse o agacharse se ve como un movimiento y no como un salto.
   Mira hacia +z local. Medidas antes de la escala: cadera a 0,27, cabeza a 0,82, alto total ~1,02.
   ============================================================ */
import * as THREE from 'three';
import { PAL, normalesDeTinta, materialTintaPiel } from './kit.js';
import { mergeGeometries } from '../vendor/addons/BufferGeometryUtils.js';

export const PIELES = ['#f2c9a0', '#dcae84', '#c08a60', '#9a6a45'];
const ESCALA = { adulto: 0.88, nino: 0.64, anciana: 0.8 };

/* opciones: { edad, piel (0-3), pelo: 'greñas'|'melena'|'revuelto'|'moño'|'corto'|'rapado'|'trenza'|'rizos'|'mechon'|'peluca', colorPelo,
   barba, disco, ropa: 'tunica'|'corta'|'falda'|'traje'|'kaunakes', colorRopa, colorMechon, orla, torsoDesnudo, sinFlecos,
   vincha, pluma, collar, usej (el collar ancho de Egipto), corona ('doble'|'nemes'), turbante (su color; cola: false sin la
   cola que cae atrás), velo (su color), penacho (true o sus colores), tonsura (true | 'ancha'), capucha (su color), bonete (su color), pielHombro, chal, titulo, texto }
   LA PERSONA ES UNA SOLA MALLA CON ESQUELETO (2026-09-28): cada parte se pega a su hueso con el color
   horneado en los vértices, así que una persona son dos llamadas de dibujo (cuerpo y tinta) en vez de
   setenta. Las poses mueven huesos; el parpadeo escala el hueso de los ojos. */
const cO = new THREE.Object3D(), cM = new THREE.Matrix4();
const GEO_HIT = new THREE.CapsuleGeometry(0.34, 0.5, 2, 6), MAT_HIT = new THREE.MeshBasicMaterial({ visible: false });
export function crearPersona(K, o = {}) {
  const edad = o.edad || 'adulto', sc = ESCALA[edad];
  const piel = PIELES[o.piel ?? 0], pelo = o.colorPelo || (edad === 'anciana' ? PAL.canas : PAL.pelo[0]);
  const ropa = o.colorRopa || (edad === 'nino' ? PAL.cueroC : PAL.cuero);
  const g = new THREE.Group(), cuerpo = new THREE.Group(); g.add(cuerpo); cuerpo.scale.setScalar(sc);
  g.userData.vivo = true;
  const huesos = [], partes = [];
  const hueso = (padre, x, y, z) => { const h = new THREE.Bone(); h.position.set(x, y, z); if (padre) padre.add(h); huesos.push(h); return h; };
  const parte = (h, geo, color, p = [0, 0, 0], esc = [1, 1, 1], rot = [0, 0, 0]) => partes.push({ h, geo, color, p, esc, rot });
  const raiz = hueso(null, 0, 0, 0);

  // --- piernas ---
  const pierna = lado => {
    const cad = hueso(raiz, lado * 0.075, 0.27, 0);
    parte(cad, K.capsula(o.pantalon ? 0.062 : 0.058, 0.02, 0.6), o.pantalon || piel, [0, -0.065, 0]);   // pantalon: las piernas de la gente de hoy (el futuro)
    const rod = hueso(cad, 0, -0.13, 0);
    parte(rod, K.capsula(o.pantalon ? 0.056 : 0.052, 0.03, 0.6), o.pantalon || piel, [0, -0.065, 0]);
    parte(rod, K.esfera(0.058, 0.45), o.zapato || PAL.cueroD, [0, -0.135, 0.025], [0.9, 0.5, 1.35]);
    return { cad, rod };
  };
  const pI = pierna(-1), pD = pierna(1);

  // --- tronco (pivota en la cadera: agacharse es inclinarlo) ---
  const tronco = hueso(raiz, 0, 0.27, 0);
  const larga = o.ropa === 'falda' || o.ropa === 'traje' || o.ropa === 'kaunakes' || o.ropa === 'tunica';
  parte(tronco, K.cilindro(0.14, 0.185, 0.34, 12), o.torsoDesnudo ? piel : ropa, [0, 0.17, 0]);
  parte(tronco, K.cilindro(0.185, larga ? 0.24 : 0.205, larga ? 0.26 : 0.12, 12), ropa, [0, larga ? -0.1 : -0.03, 0]);
  if (o.ropa === 'kaunakes') for (let k = 0; k < 3; k++) for (let i = 0; i < 11; i++) {   // la falda de mechones de lana de Sumer
    const a = (i / 11) * Math.PI * 2 + k * 0.3, r = 0.2 + k * 0.018;
    parte(tronco, K.cono(0.035, 0.08, 4), o.colorMechon || ropa, [Math.sin(a) * r, -0.02 - k * 0.085, Math.cos(a) * r], [1, 1, 1], [Math.PI, 0, 0]);
  }
  if (o.ropa === 'tunica') parte(tronco, K.toro(0.2, 0.02, Math.PI * 2, 0.5), o.orla || PAL.cueroD, [0, -0.22, 0], [1.15, 1.15, 1], [Math.PI / 2, 0, 0]);   // la orla del bajo
  if (!larga && !o.sinFlecos) for (let i = 0; i < 7; i++) {                 // flecos del cuero
    const a = (i / 7) * Math.PI * 2 + 0.2;
    parte(tronco, K.cono(0.03, 0.07, 4), PAL.cueroD, [Math.sin(a) * 0.19, -0.12, Math.cos(a) * 0.19], [1, 1, 1], [Math.PI, 0, 0]);
  }
  parte(tronco, K.esfera(0.15, 0.6), ropa, [0, 0.31, 0], [1.2, 0.5, 0.95]);
  if (o.pielHombro) parte(tronco, K.esfera(0.13, 0.6), '#75624f', [-0.1, 0.33, 0], [1.1, 0.55, 1.05], [0, 0, 0.35]);
  if (o.chal) parte(tronco, K.toro(0.165, 0.055, Math.PI * 2, 0.6), o.chal, [0, 0.31, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
  if (o.usej) { const [c1, c2] = o.usej === true ? ['#2a64ad', '#e2ac45'] : o.usej; parte(tronco, K.cilindro(0.2, 0.2, 0.025, 16), c1, [0, 0.33, 0.01], [1.05, 1, 0.9]); parte(tronco, K.cilindro(0.165, 0.165, 0.03, 16), c2, [0, 0.335, 0.01], [1.05, 1, 0.9]); }   // el collar ancho de cuentas (el usej)
  if (o.collar) for (let i = 0; i < 7; i++) {
    const a = (i / 6 - 0.5) * 2.2;
    parte(tronco, K.cono(0.018, 0.05, 4), '#efe8d4', [Math.sin(a) * 0.13, 0.29, Math.cos(a) * 0.13 + 0.02], [1, 1, 1], [Math.PI, 0, 0]);
  }

  // --- brazos ---
  const brazo = lado => {
    const hom = hueso(tronco, lado * 0.2, 0.29, 0);
    parte(hom, K.capsula(0.048, 0.05, 0.6), piel, [0, -0.07, 0]);
    const codo = hueso(hom, 0, -0.14, 0);
    parte(codo, K.capsula(0.044, 0.04, 0.6), piel, [0, -0.06, 0]);
    const mano = hueso(codo, 0, -0.135, 0);
    parte(mano, K.esfera(0.05, 0.45), piel);
    return { hom, codo, mano };
  };
  const bI = brazo(-1), bD = brazo(1);

  // --- cabeza ---
  const cabeza = hueso(tronco, 0, 0.55, 0);
  parte(cabeza, K.esfera(0.2, 0.8), piel);
  const peinado = o.pelo || 'corto';
  if (peinado !== 'rapado' && peinado !== 'mechon') parte(cabeza, K.esfera(0.212, 0.8), pelo, [0, 0.06, -0.035], [1.02, 0.78, 1.02]);   // rapado: la cabeza limpia de los sacerdotes y los novicios de Sumer
  if (peinado === 'mechon') { parte(cabeza, K.esfera(0.206, 0.8), '#' + new THREE.Color(piel).lerp(new THREE.Color(pelo), 0.4).getHexString(), [0, 0.03, -0.01], [1.0, 0.9, 1.0]); parte(cabeza, K.capsula(0.042, 0.16, 0.5), pelo, [0.17, -0.06, -0.02], [1, 1, 0.8], [0, 0, 0.15]); }   // la cabeza rapada con el mechón de la infancia de Egipto (la sombra del cabello, y la trenza al costado)
  if (peinado === 'peluca') { parte(cabeza, K.esfera(0.222, 0.8), pelo, [0, 0.05, -0.03], [1.05, 0.82, 1.05]); [-1, 1].forEach(l => parte(cabeza, K.caja(0.07, 0.24, 0.2), pelo, [l * 0.185, -0.07, -0.04])); parte(cabeza, K.caja(0.34, 0.26, 0.1), pelo, [0, -0.06, -0.16]); }   // la peluca de Egipto: cae recta hasta los hombros
  if (peinado === 'greñas') for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    parte(cabeza, K.cono(0.06, 0.16, 5), pelo, [Math.sin(a) * 0.11, 0.19, Math.cos(a) * 0.1 - 0.04], [1, 1, 1], [Math.cos(a) * 0.6, 0, -Math.sin(a) * 0.6]);
  }
  if (peinado === 'melena') parte(cabeza, K.capsula(0.13, 0.12, 0.7), pelo, [0, -0.05, -0.1], [1.25, 1, 0.7]);
  if (peinado === 'revuelto') [[0.1, 0.17, 0.02], [-0.09, 0.18, -0.03], [0.02, 0.21, -0.1]].forEach(q => parte(cabeza, K.esfera(0.075, 0.5), pelo, q));
  if (peinado === 'moño') parte(cabeza, K.esfera(0.085, 0.55), pelo, [0, 0.14, -0.17]);
  if (peinado === 'trenza') { parte(cabeza, K.esfera(0.07, 0.5), pelo, [0, 0.05, -0.2]); parte(cabeza, K.capsula(0.045, 0.2, 0.5), pelo, [0, -0.12, -0.22], [1, 1, 0.9], [0.25, 0, 0]); }
  if (peinado === 'rizos') { [-1, 1].forEach(l => { for (let i = 0; i < 3; i++) parte(cabeza, K.esfera(0.058 - i * 0.006, 0.45), pelo, [l * 0.2, -0.02 - i * 0.075, -0.04]); }); parte(cabeza, K.capsula(0.12, 0.1, 0.6), pelo, [0, -0.06, -0.12], [1.3, 1, 0.7]); }   // los bucles laterales y el pelo recogido atrás (Enheduanna, en su disco)
  if (o.barba) parte(cabeza, K.capsula(0.09, 0.08, 0.6), o.barba === true ? pelo : o.barba, [0, -0.19, 0.08], [1.05, 1, 0.8], [0.35, 0, 0]);
  if (o.disco) parte(cabeza, K.cilindro(0.075, 0.075, 0.018, 12), o.disco, [0, 0.24, 0.04], [1, 1, 1], [Math.PI / 2 - 0.25, 0, 0]);
  if (o.vincha) parte(cabeza, K.toro(0.2, 0.024, Math.PI * 2, 0.5), o.vincha === true ? '#8a6247' : o.vincha, [0, 0.07, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
  if (o.pluma) parte(cabeza, K.esfera(0.05, 0.45), '#ece6d8', [0.16, 0.2, -0.06], [0.45, 2.2, 0.45], [0, 0, -0.5]);
  if (o.corona === 'doble') {                          // la doble corona del faraón: la roja del Bajo Egipto abraza a la blanca del Alto
    parte(cabeza, K.cilindro(0.2, 0.19, 0.16, 14), '#c94f43', [0, 0.16, -0.01]);
    parte(cabeza, K.caja(0.1, 0.22, 0.05), '#c94f43', [0, 0.28, -0.17]);
    parte(cabeza, K.capsula(0.09, 0.2, 0.6), '#f2ead2', [0, 0.36, 0.0], [1, 1, 1]);
    parte(cabeza, K.cilindro(0.012, 0.012, 0.16, 5), '#e8a51e', [0.1, 0.3, 0.12], [1, 1, 1], [0.6, 0, -0.5]);   // la espiral de la roja
    parte(cabeza, K.capsula(0.018, 0.04, 0.4), '#e8a51e', [0, 0.18, 0.2]);   // el ureo
  }
  if (o.corona === 'nemes') {
    parte(cabeza, K.esfera(0.225, 0.8), '#e2ac45', [0, 0.05, -0.03], [1.08, 0.8, 1.05]);
    [-1, 1].forEach(l => parte(cabeza, K.caja(0.08, 0.3, 0.16), '#2a64ad', [l * 0.2, -0.12, 0.0]));
    parte(cabeza, K.capsula(0.018, 0.04, 0.4), '#e8a51e', [0, 0.2, 0.19]);
  }
  if (o.turbante) {                                    // el turbante de Bagdad (la ʿimama): dos vueltas de tela, la copa y la cola que cae atrás
    const tu = o.turbante, tuD = '#' + new THREE.Color(tu).multiplyScalar(0.86).getHexString();
    parte(cabeza, K.esfera(0.16, 0.7), tu, [0, 0.15, -0.025], [1.0, 0.58, 1.0]);
    parte(cabeza, K.toro(0.168, 0.046, Math.PI * 2, 0.55), tuD, [0, 0.12, -0.02], [1.0, 1.0, 1], [Math.PI / 2 + 0.14, 0, 0]);
    parte(cabeza, K.toro(0.135, 0.042, Math.PI * 2, 0.55), tu, [0.01, 0.18, -0.03], [1.0, 1.0, 1], [Math.PI / 2 - 0.16, 0, 0.1]);
    if (o.cola !== false) parte(cabeza, K.capsula(0.028, 0.13, 0.5), tuD, [0.05, -0.06, -0.19], [1.2, 1, 0.6], [0.2, 0, 0.12]);
  }
  if (o.penacho) {                                     // el penacho de plumas (de quetzal y de garza) de los señores mexicas, con su diadema
    const cols = o.penacho === true ? ['#2f8a5a', '#3fa06a', '#58b47a', '#3fa06a', '#2f8a5a'] : o.penacho;
    parte(cabeza, K.toro(0.19, 0.03, Math.PI * 2, 0.5), '#d4a93e', [0, 0.1, 0], [1, 1, 1], [Math.PI / 2, 0, 0]);
    cols.forEach((c, k) => { const a = (k - (cols.length - 1) / 2) * 0.32; parte(cabeza, K.capsula(0.035, 0.28, 0.5), c, [Math.sin(a) * 0.12, 0.38, -0.12], [1, 1, 0.5], [-0.35, 0, -a]); });
  }
  if (o.velo) {                                        // el velo (el jimar): cubre el pelo, enmarca la cara y cae sobre los hombros
    parte(cabeza, K.esfera(0.214, 0.8), o.velo, [0, 0.035, -0.04], [1.02, 0.97, 0.98]);
    parte(cabeza, K.capsula(0.12, 0.06, 0.6), o.velo, [0, -0.17, -0.1], [1.35, 1, 0.75]);
  }
  if (o.tonsura) parte(cabeza, K.cilindro(o.tonsura === 'ancha' ? 0.12 : 0.075, o.tonsura === 'ancha' ? 0.12 : 0.075, 0.03, 12), piel, [0, 0.2, -0.03], [1, 1, 1], [-0.12, 0, 0]);   // la tonsura de los clérigos de París: la coronilla rapada (ancha la de los canónigos, chica la de los estudiantes)
  if (o.capucha) parte(tronco, K.esfera(0.13, 0.6), o.capucha, [0, 0.44, -0.12], [1.15, 0.7, 0.75], [0.4, 0, 0]);   // la capucha de la capa, caída sobre la espalda
  if (o.bonete) { parte(cabeza, K.cilindro(0.17, 0.2, 0.08, 12), o.bonete, [0, 0.17, -0.02]); parte(cabeza, K.esfera(0.03, 0.4), o.bonete, [0, 0.23, -0.02]); }   // el bonete redondo de los maestros (el pileus de la licencia)
  if (o.futou) {                                       // el futou de los Song: el gorro negro de gasa laqueada, la copa y el lóbulo de atrás; con `alas`, las dos alas largas y tiesas de los funcionarios
    const fu = o.futou === true ? '#1f1d22' : o.futou;
    parte(cabeza, K.esfera(0.2, 0.7), fu, [0, 0.1, -0.03], [1.04, 0.62, 1.04]);
    parte(cabeza, K.capsula(0.09, 0.06, 0.6), fu, [0, 0.2, -0.09], [1.25, 1, 0.9]);
    if (o.alas) [-1, 1].forEach(l => parte(cabeza, K.caja(0.36, 0.014, 0.035), fu, [l * 0.33, 0.13, -0.15]));
  }
  if (o.panuelo) parte(cabeza, K.esfera(0.21, 0.7), o.panuelo, [0, 0.11, -0.05], [1.03, 0.7, 1.08], [-0.25, 0, 0]);   // el pañuelo blando de los letrados (el fujin), atado atrás
  const rubor = '#' + new THREE.Color(piel).lerp(new THREE.Color('#e27b5a'), 0.45).getHexString();
  [-1, 1].forEach(l => parte(cabeza, K.esfera(0.034, 0.35), rubor, [l * 0.12, -0.06, 0.165], [1, 0.6, 0.35]));
  const ojos = hueso(cabeza, 0, 0, 0);
  [-1, 1].forEach(l => parte(ojos, K.esfera(0.03, 0.35), '#241a14', [l * 0.075, 0, 0.185]));

  // --- el horneado: cada parte, en la pose de reposo, pegada a su hueso ---
  raiz.updateMatrixWorld(true);
  const col = new THREE.Color();
  const geos = partes.map(q => {
    const g2 = q.geo.index ? q.geo.toNonIndexed() : q.geo.clone();
    for (const a of Object.keys(g2.attributes)) if (a !== 'position' && a !== 'normal') g2.deleteAttribute(a);
    cO.position.fromArray(q.p); cO.scale.fromArray(q.esc); cO.rotation.set(q.rot[0], q.rot[1], q.rot[2]); cO.updateMatrix();
    g2.applyMatrix4(cM.multiplyMatrices(q.h.matrixWorld, cO.matrix));
    const n = g2.getAttribute('position').count, cs = new Float32Array(n * 3), si = new Uint16Array(n * 4), sw = new Float32Array(n * 4);
    col.set(q.color); const hi = huesos.indexOf(q.h);
    for (let i = 0; i < n; i++) { cs[i * 3] = col.r; cs[i * 3 + 1] = col.g; cs[i * 3 + 2] = col.b; si[i * 4] = hi; sw[i * 4] = 1; }
    g2.setAttribute('color', new THREE.BufferAttribute(cs, 3));
    g2.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4));
    g2.setAttribute('skinWeight', new THREE.BufferAttribute(sw, 4));
    return g2;
  });
  const geo = mergeGeometries(geos, false); geo.userData.propia = true; geos.forEach(g => g.dispose());   // propia: se libera con la persona
  if (K.E.tinta) normalesDeTinta(geo);
  const malla = new THREE.SkinnedMesh(geo, K.mat('#ffffff', { vertexColors: true }));
  malla.add(raiz); malla.updateMatrixWorld(true);
  const esqueleto = new THREE.Skeleton(huesos);
  malla.bind(esqueleto); malla.castShadow = true; malla.receiveShadow = true; malla.frustumCulled = false;
  cuerpo.add(malla);
  if (K.E.tinta) {
    const casco = new THREE.SkinnedMesh(geo, materialTintaPiel());
    casco.bind(esqueleto, malla.bindMatrix); casco.frustumCulled = false; casco.raycast = () => {}; casco.userData.tinta = true;
    cuerpo.add(casco);
  }

  g.userData.ficha = o.titulo ? { titulo: o.titulo, texto: o.texto || '' } : undefined;
  const hit = new THREE.Mesh(GEO_HIT, MAT_HIT);   // el blanco del dedo: una sola geometría para todos (QA: cada persona dejaba la suya)
  hit.position.y = 0.55 * sc; hit.scale.setScalar(sc / 0.88); g.add(hit);

  const J = { pIx: pI.cad.rotation, rIx: pI.rod.rotation, pDx: pD.cad.rotation, rDx: pD.rod.rotation, bI: bI.hom.rotation, cI: bI.codo.rotation, bD: bD.hom.rotation, cD: bD.codo.rotation, tr: tronco.rotation, ca: cabeza.rotation };
  const actual = {}; let alturaY = 0, primera = true;

  const p = {
    obj: g, sc, alto: 1.02 * sc, manoI: bI.mano, manoD: bD.mano, cabeza, fase: Math.random() * 9, op: o,   // op: para hornear su retrato
    /* Sujeta un objeto en la mano (el objeto se orienta a lo largo del antebrazo). */
    sostener(obj, mano = 'D') { (mano === 'D' ? bD.mano : bI.mano).add(obj); return obj; },
    anim(t, e = {}) {
      const pose = POSES[e.pose || (e.andando ? 'andar' : 'quieto')] || POSES.quieto;
      const obj = {}, ph = t + this.fase;
      const y = pose(obj, ph, e, sc);
      const k = primera ? 1 : Math.min(1, (e.dt ?? 0.016) * 10);   // suavizado entre poses
      primera = false;
      for (const [nom, val] of Object.entries(obj)) {
        const [art, eje] = nom.split('.');
        const prev = actual[nom] ?? 0, nv = prev + (val - prev) * (e.instantaneo ? 1 : k);
        actual[nom] = nv; J[art][eje] = nv;
      }
      for (const nom of Object.keys(actual)) if (!(nom in obj)) { const [art, eje] = nom.split('.'); actual[nom] *= 1 - k; J[art][eje] = actual[nom]; }
      alturaY += ((y ?? 0) - alturaY) * (e.instantaneo ? 1 : k);
      cuerpo.position.y = alturaY;
      const c = (t + this.fase * 1.37) % 4.3;
      ojos.scale.y = c < 0.28 ? Math.max(0.12, 1 - 0.88 * Math.sin(Math.PI * c / 0.28)) : 1;
    },
  };
  return p;
}

/* LAS POSES. Cada una escribe ángulos en `o` (articulación.eje) y devuelve la altura del cuerpo.
   Convención: rotation.x negativo lleva el miembro hacia adelante (+z). */
const agacharCadera = sc => (0.183 - 0.27) * sc;
export const POSES = {
  quieto(o, t) {
    o['bI.z'] = 0.1; o['bD.z'] = -0.1; o['ca.y'] = 0.3 * Math.sin(t * 0.45); o['tr.x'] = 0.02 * Math.sin(t * 1.15);
    return 0;
  },
  andar(o, t) {
    const w = Math.sin(t * 9);
    o['pIx.x'] = 0.55 * w; o['pDx.x'] = -0.55 * w;
    o['rIx.x'] = Math.max(0, w) * 0.7; o['rDx.x'] = Math.max(0, -w) * 0.7;
    o['bI.x'] = -0.45 * w; o['bD.x'] = 0.45 * w; o['bI.z'] = 0.1; o['bD.z'] = -0.1; o['cI.x'] = -0.3; o['cD.x'] = -0.3;
    o['tr.x'] = 0.06;
    return 0.022 * Math.abs(Math.cos(t * 9));
  },
  /* sentado sobre algo de altura e.asiento (0,2 por defecto: un tronco) */
  sentado(o, t, e, sc) {
    o['pIx.x'] = o['pDx.x'] = -1.5; o['rIx.x'] = o['rDx.x'] = 1.45;
    o['bI.x'] = o['bD.x'] = -0.35; o['cI.x'] = o['cD.x'] = -0.9; o['bI.z'] = 0.15; o['bD.z'] = -0.15;
    o['ca.x'] = 0.05 * Math.sin(t * 0.8); o['ca.y'] = 0.2 * Math.sin(t * 0.3);
    return (e.asiento ?? 0.2) - 0.27 * sc;
  },
  /* en el suelo, con las piernas cruzadas: los sentaditos del corro */
  suelo(o, t, e, sc) {
    o['pIx.x'] = o['pDx.x'] = -1.45; o['pIx.z'] = 0.55; o['pDx.z'] = -0.55; o['rIx.x'] = o['rDx.x'] = 2.3;
    o['bI.x'] = o['bD.x'] = -0.3; o['cI.x'] = o['cD.x'] = -1.0; o['bI.z'] = 0.2; o['bD.z'] = -0.2;
    o['ca.x'] = 0.04 * Math.sin(t * 1.8); o['tr.x'] = 0.05;
    return 0.07 - 0.27 * sc;
  },
  /* de pie, contando: los brazos dibujan la historia en el aire */
  narrar(o, t) {
    const a = Math.sin(t * 1.6), b = Math.sin(t * 1.6 + 1.9);
    o['bI.x'] = -1.1 - 0.5 * a; o['bI.z'] = 0.5 + 0.3 * b; o['cI.x'] = -0.7;
    o['bD.x'] = -1.2 - 0.5 * b; o['bD.z'] = -0.5 - 0.3 * a; o['cD.x'] = -0.6;
    o['ca.x'] = -0.08 + 0.06 * a; o['ca.y'] = 0.25 * Math.sin(t * 0.5); o['tr.x'] = -0.04;
    return 0.01 * Math.abs(a);
  },
  /* sentada y narrando con las manos (la Abuela) */
  narrarSentada(o, t, e, sc) {
    const y = POSES.sentado(o, t, e, sc), a = Math.sin(t * 1.6);
    o['bI.x'] = -0.9 - 0.35 * a; o['cI.x'] = -0.9; o['bD.x'] = -0.9 + 0.35 * a; o['cD.x'] = -0.9; o['bI.z'] = 0.35; o['bD.z'] = -0.35;
    return y;
  },
  /* sentado al tambor: golpes alternados */
  tocar(o, t, e, sc) {
    const y = POSES.sentado(o, t, e, sc), a = Math.max(0, Math.sin(t * 7)), b = Math.max(0, Math.sin(t * 7 + Math.PI));
    o['bI.x'] = -0.75 - 0.5 * a; o['cI.x'] = -0.6 + 0.4 * a; o['bD.x'] = -0.75 - 0.5 * b; o['cD.x'] = -0.6 + 0.4 * b;
    o['bI.z'] = 0.25; o['bD.z'] = -0.25; o['tr.x'] = 0.15; o['ca.x'] = 0.1 + 0.05 * Math.sin(t * 7);
    return y;
  },
  /* de pie frente a la pared, el brazo arriba que pinta en círculos */
  pintar(o, t) {
    o['bD.x'] = -2.0 + 0.15 * Math.sin(t * 3); o['bD.z'] = -0.15 + 0.15 * Math.cos(t * 3); o['cD.x'] = -0.3;
    o['bI.x'] = -0.5; o['cI.x'] = -1.2; o['bI.z'] = 0.2; o['ca.x'] = -0.25; o['tr.x'] = -0.05;
    return 0;
  },
  /* sentada, tallando: una mano sujeta, la otra va y viene */
  tallar(o, t, e, sc) {
    const y = POSES.sentado(o, t, e, sc), a = Math.sin(t * 4);
    o['bI.x'] = -0.9; o['cI.x'] = -0.9; o['bI.z'] = 0.1;
    o['bD.x'] = -0.8 + 0.2 * a; o['cD.x'] = -1.1 - 0.25 * a; o['bD.z'] = -0.1;
    o['tr.x'] = 0.3; o['ca.x'] = 0.35;
    return y;
  },
  /* de pie en la orilla, con la caña hacia el agua */
  pescar(o, t) {
    const a = Math.sin(t * 0.9);
    o['bD.x'] = -0.9 + 0.05 * a; o['cD.x'] = -0.4; o['bI.x'] = -0.8 + 0.05 * a; o['cI.x'] = -0.6; o['bI.z'] = -0.25; o['bD.z'] = 0.1;
    o['ca.x'] = 0.15; o['tr.x'] = 0.05;
    return 0;
  },
  pescarSentado(o, t, e, sc) {
    const y = POSES.suelo(o, t, e, sc), a = Math.sin(t * 0.9);
    o['bD.x'] = -1.0 + 0.05 * a; o['cD.x'] = -0.4; o['bI.x'] = -0.9; o['cI.x'] = -0.6; o['bI.z'] = -0.25;
    o['ca.x'] = 0.2;
    return y;
  },
  /* agachada junto a la mata: recoge y vuelve */
  agachado(o, t, e, sc) {
    const a = Math.sin(t * 1.2);
    o['pIx.x'] = -1.1; o['pDx.x'] = -1.1; o['rIx.x'] = 1.9; o['rDx.x'] = 1.9; o['pIx.z'] = 0.15; o['pDx.z'] = -0.15;
    o['tr.x'] = 0.55 + 0.12 * a; o['bD.x'] = -1.1 - 0.3 * a; o['cD.x'] = -0.4; o['bI.x'] = -0.5; o['cI.x'] = -1.1;
    o['ca.x'] = 0.1;
    return agacharCadera(sc);
  },
  /* el cazador que acecha, lanza en mano */
  acechar(o, t, e, sc) {
    const a = Math.sin(t * 0.7);
    o['pIx.x'] = -1.3; o['rIx.x'] = 1.6; o['pDx.x'] = -0.2; o['rDx.x'] = 1.4;
    o['tr.x'] = 0.5 + 0.05 * a; o['bD.x'] = -1.5; o['cD.x'] = -0.2; o['bD.z'] = -0.2; o['bI.x'] = -0.9; o['cI.x'] = -0.8;
    o['ca.x'] = -0.35;
    return agacharCadera(sc) + 0.02;
  },
  /* con la azada: sube y baja */
  labrar(o, t) {
    const a = Math.sin(t * 2.2), g = Math.max(0, a);
    o['bD.x'] = -2.2 + 1.6 * g; o['bI.x'] = -2.0 + 1.6 * g; o['cD.x'] = -0.3; o['cI.x'] = -0.3; o['bI.z'] = -0.3; o['bD.z'] = 0.3;
    o['tr.x'] = 0.15 + 0.35 * g; o['pIx.x'] = -0.3; o['pDx.x'] = 0.25; o['rIx.x'] = 0.3;
    return -0.01 * g;
  },
  /* sentado al telar o al barro: las dos manos adelante, trabajando */
  tejer(o, t, e, sc) {
    const y = POSES.sentado(o, t, e, sc), a = Math.sin(t * 3);
    o['bI.x'] = -1.3 + 0.2 * a; o['bD.x'] = -1.3 - 0.2 * a; o['cI.x'] = -0.5; o['cD.x'] = -0.5; o['bI.z'] = 0.2; o['bD.z'] = -0.2;
    o['tr.x'] = 0.1;
    return y;
  },
  moldear(o, t, e, sc) {
    const y = POSES.suelo(o, t, e, sc), a = Math.sin(t * 2.5);
    o['bI.x'] = -0.95; o['bD.x'] = -0.95; o['cI.x'] = -0.9 + 0.15 * a; o['cD.x'] = -0.9 - 0.15 * a; o['bI.z'] = 0.35; o['bD.z'] = -0.35;
    o['tr.x'] = 0.35; o['ca.x'] = 0.3;
    return y;
  },
  /* en cuclillas junto al fogón, frotando la vara entre las palmas (el primer gesto del juego): e.frota = recién */
  frotar(o, t, e, sc) {
    const y = POSES.agachado(o, t, e, sc), v = e.frota ? Math.sin(t * 18) : 0.15 * Math.sin(t * 1.3);
    o['bI.x'] = -1.15 + 0.3 * v; o['bD.x'] = -1.15 - 0.3 * v; o['cI.x'] = -0.75; o['cD.x'] = -0.75; o['bI.z'] = 0.32; o['bD.z'] = -0.32;
    o['tr.x'] = 0.62; o['ca.x'] = 0.4;
    return y;
  },
  /* SUMER. Sentado en la estera, la tablilla en la mano izquierda y el cálamo en la derecha: presiona cuñas */
  escribir(o, t, e, sc) {
    const y = POSES.suelo(o, t, e, sc), a = Math.sin(t * 1.3), toque = Math.abs(Math.sin(t * 6.5));
    o['bI.x'] = -1.05; o['cI.x'] = -1.25; o['bI.z'] = 0.3;
    o['bD.x'] = -0.85 + 0.08 * a; o['cD.x'] = -1.0 - 0.18 * toque; o['bD.z'] = -0.28;
    o['tr.x'] = 0.28; o['ca.x'] = 0.42; o['ca.y'] = 0.1 * a;
    return y;
  },
  /* sentado dictando: la tablilla en el regazo y la mano que marca el ritmo de las palabras */
  dictar(o, t, e, sc) {
    const y = POSES.suelo(o, t, e, sc), a = Math.sin(t * 2.2);
    o['bI.x'] = -0.6; o['cI.x'] = -0.9; o['bI.z'] = 0.25;
    o['bD.x'] = -1.5 - 0.35 * a; o['cD.x'] = -0.55; o['bD.z'] = -0.35 - 0.1 * a;
    o['tr.x'] = -0.02; o['ca.x'] = -0.1; o['ca.y'] = 0.25 * Math.sin(t * 0.7);
    return y;
  },
  /* de pie, leyendo en voz alta la tablilla que sostiene con las dos manos (el recitador) */
  leer(o, t) {
    const a = Math.sin(t * 1.1);
    o['bI.x'] = -1.15; o['cI.x'] = -1.1; o['bI.z'] = 0.18; o['bD.x'] = -1.15; o['cD.x'] = -1.1; o['bD.z'] = -0.18;
    o['ca.x'] = 0.28 + 0.05 * a; o['tr.x'] = 0.04;
    return 0;
  },
  /* los brazos en alto con la ofrenda (el oferente arriba del templo) */
  ofrendar(o, t) {
    const a = Math.sin(t * 1.5);
    o['bI.x'] = -2.75 - 0.08 * a; o['bD.x'] = -2.75 - 0.08 * a; o['cI.x'] = -0.25; o['cD.x'] = -0.25; o['bI.z'] = 0.22; o['bD.z'] = -0.22;
    o['ca.x'] = -0.35; o['tr.x'] = -0.08;
    return 0;
  },
  /* de pie en la barca, empujando la pértiga */
  pertiga(o, t) {
    const a = Math.sin(t * 1.6);
    o['bD.x'] = -1.3 + 0.5 * a; o['bI.x'] = -0.9 + 0.5 * a; o['cD.x'] = -0.5; o['cI.x'] = -0.7; o['bI.z'] = 0.1; o['bD.z'] = -0.2;
    o['tr.x'] = 0.2 + 0.15 * a; o['pIx.x'] = -0.25; o['pDx.x'] = 0.2;
    return 0;
  },
  /* cantando con los brazos abiertos hacia el cielo (Enheduanna, de noche) */
  cantar(o, t) {
    const a = Math.sin(t * 1.2);
    o['bI.x'] = -1.9 - 0.25 * a; o['bI.z'] = 0.75; o['cI.x'] = -0.2; o['bD.x'] = -1.9 - 0.25 * a; o['bD.z'] = -0.75; o['cD.x'] = -0.2;
    o['ca.x'] = -0.4; o['tr.x'] = -0.1;
    return 0;
  },
  /* La Mayor: de pie con el bastón, que alza cada tanto */
  baston(o, t) {
    const c = (t % 7) / 7, alza = c > 0.75 ? Math.sin((c - 0.75) / 0.25 * Math.PI) : 0;
    o['bD.x'] = -0.5 - 1.3 * alza; o['cD.x'] = -0.7 + 0.5 * alza; o['bD.z'] = -0.1; o['bI.z'] = 0.12;
    o['ca.y'] = 0.3 * Math.sin(t * 0.4); o['ca.x'] = -0.1 * alza;
    return 0.02 * alza;
  },
  /* de pie, raspando la piel del bastidor: las dos manos suben y bajan juntas */
  raspar(o, t) {
    const a = Math.sin(t * 2.6);
    o['bI.x'] = -1.25 - 0.3 * a; o['bD.x'] = -1.25 - 0.3 * a; o['cI.x'] = -0.5; o['cD.x'] = -0.5; o['bI.z'] = 0.15; o['bD.z'] = -0.15;
    o['tr.x'] = 0.12; o['ca.x'] = 0.1;
    return 0;
  },
  /* la seña de la cacería: la mano abierta en alto, el cuerpo agachado para no espantar */
  senal(o, t, e, sc) {
    const y = POSES.acechar(o, t, e, sc), a = Math.sin(t * 1.3);
    o['bI.x'] = -2.6; o['bI.z'] = 0.35 + 0.15 * a; o['cI.x'] = -0.2; o['ca.x'] = -0.4; o['ca.y'] = 0.3;
    return y;
  },
  /* de rodillas leyendo el rastro: una mano toca la huella */
  rastrear(o, t, e, sc) {
    const y = POSES.agachado(o, t, e, sc), a = Math.sin(t * 0.8);
    o['tr.x'] = 0.75; o['bD.x'] = -0.7 + 0.1 * a; o['cD.x'] = -0.2; o['bI.x'] = -0.3; o['cI.x'] = -1.3; o['ca.x'] = 0.35; o['ca.y'] = 0.2 * a;
    return y - 0.02 * sc;
  },
  /* caminando con la antorcha en alto (los iniciados de Eleusis): la derecha arriba y adelante */
  antorcha(o, t) {
    const y = POSES.andar(o, t);
    o['bD.x'] = -2.55 + 0.05 * Math.sin(t * 4.5); o['cD.x'] = -0.15; o['bD.z'] = -0.12;
    return y;
  },
  /* cargando el cesto en la cabeza (la acarreadora) */
  cargar(o, t) {
    const y = POSES.andar(o, t);
    o['bI.x'] = -2.9; o['cI.x'] = -0.5; o['bI.z'] = 0.25;
    return y;
  },
  /* LA FIESTA DEL FINAL (fiesta.js): un paso alternado con su brinco y la cadera que se mece; e.estilo elige los brazos
     (0: arriba, saludando; 1: las palmas; 2: abiertos, como en una ronda) */
  bailar(o, t, e) {
    const w = Math.sin(t * 6.5), u = Math.sin(t * 3.25), est = (e && e.estilo) || 0;
    o['pIx.x'] = -0.55 * Math.max(0, w); o['rIx.x'] = 0.9 * Math.max(0, w);
    o['pDx.x'] = -0.55 * Math.max(0, -w); o['rDx.x'] = 0.9 * Math.max(0, -w);
    o['tr.z'] = 0.13 * u; o['tr.x'] = -0.03; o['ca.z'] = -0.1 * u; o['ca.x'] = -0.08 + 0.06 * Math.abs(w);
    if (est === 1) {
      const c = Math.abs(Math.sin(t * 6.5));
      o['bI.x'] = o['bD.x'] = -1.25; o['bI.z'] = 0.18 + 0.4 * c; o['bD.z'] = -0.18 - 0.4 * c; o['cI.x'] = o['cD.x'] = -0.95;
    } else if (est === 2) {
      o['bI.z'] = 1.25 + 0.3 * u; o['bD.z'] = -1.25 + 0.3 * u; o['cI.x'] = o['cD.x'] = -0.35; o['bI.x'] = o['bD.x'] = -0.2;
    } else {
      o['bI.z'] = 2.55 + 0.3 * u; o['bD.z'] = -2.55 + 0.3 * u; o['cI.x'] = -0.35 - 0.3 * Math.max(0, w); o['cD.x'] = -0.35 - 0.3 * Math.max(0, -w);
    }
    return 0.03 * Math.abs(Math.cos(t * 6.5));
  },
  /* sentada, dando palmas al ritmo (la Abuela en la fiesta del final) */
  palmasSentada(o, t, e, sc) {
    const y = POSES.sentado(o, t, e, sc), c = Math.abs(Math.sin(t * 6.5));
    o['bI.x'] = o['bD.x'] = -1.2; o['bI.z'] = 0.15 + 0.35 * c; o['bD.z'] = -0.15 - 0.35 * c; o['cI.x'] = o['cD.x'] = -1.0;
    o['ca.z'] = 0.08 * Math.sin(t * 3.25);
    return y;
  },
};

/* ---------- utilería que se sostiene o se deja en el suelo ---------- */
export function lanza(K, largo = 1.2) {
  const g = new THREE.Group();
  const a = K.malla(K.cilindro(0.018, 0.022, largo, 5), PAL.troncoL, { grosor: 0.01 }); a.position.y = 0; g.add(a);
  const p = K.malla(K.cono(0.04, 0.13, 4), '#9aa4ac', { grosor: 0.01 }); p.position.y = largo / 2 + 0.06; g.add(p);
  return g;
}
export function cana(K) {
  const g = new THREE.Group();
  const c = K.malla(K.cilindro(0.012, 0.018, 1.1, 5), '#8a6a44', { grosor: 0.008 }); c.position.y = 0.3; g.add(c);
  return g;
}
export function baston(K) {
  const b = K.malla(K.cilindro(0.022, 0.026, 0.95, 6), '#8a6f4d', { grosor: 0.01 });
  const g = new THREE.Group(); b.position.y = -0.2; g.add(b);
  const nudo = K.malla(K.esfera(0.04), '#75583c', { grosor: 0.01 }); nudo.position.y = 0.27; g.add(nudo);
  return g;
}
export function azada(K) {
  const g = new THREE.Group();
  const m = K.malla(K.cilindro(0.016, 0.02, 0.8, 5), PAL.troncoL, { grosor: 0.01 }); m.position.y = -0.1; g.add(m);
  const h = K.malla(K.caja(0.03, 0.08, 0.14), '#8f8a7c', { grosor: 0.01 }); h.position.set(0, -0.48, 0.05); g.add(h);
  return g;
}
export function cesto(K, relleno = '#e4c96a') {
  const g = new THREE.Group();
  const c = K.malla(K.cilindro(0.16, 0.11, 0.14, 12), '#a8844f', { grosor: 0.012 }); g.add(c);
  const r = K.malla(K.cilindro(0.15, 0.15, 0.03, 12), relleno, { sinTinta: true }); r.position.y = 0.07; g.add(r);
  return g;
}
