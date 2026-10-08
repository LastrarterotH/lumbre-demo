/* ============================================================
   egipto/valle
   El valle del Nilo en 3D: el río que cruza por el frente con su crecida (ajet, péret, shemu: el agua sube y
   baja de verdad), la tierra negra de la vega con sus campos en cuencas (inundados, verdes, dorados), la
   tierra roja del desierto con sus ondas de viento, el papiro y los lotos de la orilla, las palmeras y los
   sicómoros, el poblado de los artesanos, las mastabas, el canal del shaduf y la losa del diorama.
   La geometría del río es la del motor 2D (NILO, ejeNilo, niloAgua de 11-materiales): la querencia del papiro,
   la barca y los toques caen donde el motor los espera.
   ============================================================ */
import * as THREE from 'three';
import { azar, fundir, PAL } from '../kit.js';
import { palmera } from '../sumer/monumentos.js';
import { EG } from './monumentos.js';

export const E0 = 2, E1 = 18, LADO = E1 - E0, CENTRO = 10;
export const NILO = { ax: 19.6, ay: 5.1, bx: 8.6, by: 20.4 };
const DX = NILO.bx - NILO.ax, DY = NILO.by - NILO.ay, L = Math.hypot(DX, DY), L2 = L * L;
export const NN = { x: -DY / L, y: DX / L };             // la normal del eje: + hacia la orilla oeste (la del templo)
export const HUELLA = 2.35, VEGA = 3.15;                 // NILO_HUELLA y NILO_VEGA del motor
export function ejeNilo(u) { return { x: NILO.ax + DX * u + Math.sin(u * 6.5) * 0.3, y: NILO.ay + DY * u + Math.cos(u * 5) * 0.22 }; }
export function puntoNilo(u, perp = 0) { const m = ejeNilo(u); return { x: m.x + NN.x * perp, z: m.y + NN.y * perp }; }
/* (t, e): t a lo largo del eje y e la distancia con signo al meandro (+ al oeste) */
export function enNilo(x, z) {
  const t = ((x - NILO.ax) * DX + (z - NILO.ay) * DY) / L2, m = ejeNilo(t), e = (x - m.x) * NN.x + (z - m.y) * NN.y;
  return { t, e, d: Math.abs(e) };
}
export function distVega(x, z) {                         // distNiloVega: al eje recto, acotado
  let t = ((x - NILO.ax) * DX + (z - NILO.ay) * DY) / L2; t = Math.max(0, Math.min(1, t));
  return Math.hypot(x - (NILO.ax + t * DX), z - (NILO.ay + t * DY));
}
export const aguaDe = cre => 1.55 * cre - 0.15;         // niloAgua(): 1,94 en ajet · 1,32 en péret · 1,09 en shemu

/* ---------- el relieve: el cauce y su orilla en rampa, por donde el agua sube y baja con el año ---------- */
const ss = k => k * k * (3 - 2 * k);
function perfil(d) {
  if (d < 0.55) return -0.38;
  if (d < 1.0) return -0.38 + 0.18 * ss((d - 0.55) / 0.45);
  if (d < 2.2) return -0.2 + 0.18 * ((d - 1.0) / 1.2);
  if (d < 2.45) return -0.02 + 0.02 * ss((d - 2.2) / 0.25);
  return 0;
}
/* el canal del shaduf: nace en el río y llega al pie del shaduf, que sube el agua a la acequia de los campos */
export const SHADUF = { x: 9.15, y: 13.5 };
export const CANAL = [puntoNilo(0.686, 0.95), { x: 9.7, z: 13.82 }];   // termina bajo el balde del shaduf
export const ACEQUIA = [{ x: 8.9, z: 13.28 }, { x: 8.02, z: 14.5 }];   // corre por el borde alto de la vega, río abajo, y riega los campos
function dSeg(x, z, a, b) {
  const dx = b.x - a.x, dz = b.z - a.z, q = dx * dx + dz * dz;
  let t = ((x - a.x) * dx + (z - a.z) * dz) / q; t = Math.max(0, Math.min(1, t));
  return Math.hypot(x - (a.x + t * dx), z - (a.z + t * dz));
}
export const dCanal = (x, z) => Math.min(dSeg(x, z, CANAL[0], CANAL[1]), dSeg(x, z, ACEQUIA[0], ACEQUIA[1]));
/* LA MESETA DE GUIZA: la necrópolis se alza sobre la roca del desierto, con su escarpe mirando al valle. Por delante
   del escarpe, el poblado y la Casa de la Vida; arriba, solo las pirámides. */
export const ALTO_MESETA = 0.3;
const BORDE = [[1.5, 5.55], [6.0, 5.55], [6.55, 5.15], [8.0, 5.15], [8.3, 4.72], [11.0, 4.72], [11.4, 1.6]];
export function bordeMeseta(x) {
  if (x >= BORDE.at(-1)[0]) return -9;
  for (let i = 0; i < BORDE.length - 1; i++) { const [a, za] = BORDE[i], [b, zb] = BORDE[i + 1]; if (x < b) return x <= a ? za : za + (zb - za) * (x - a) / (b - a); }
  return -9;
}
export const meseta = (x, z) => ALTO_MESETA * ss(Math.max(0, Math.min(1, (bordeMeseta(x) - z) / 0.22)));
export function altura(x, z) {
  const m = meseta(x, z); if (m > 0) return m;
  let h = perfil(enNilo(x, z).d);
  const dc = dSeg(x, z, CANAL[0], CANAL[1]);
  if (dc < 0.13 && h > -0.12) { const k = Math.min(1, (0.13 - dc) / 0.06); h = Math.min(h, -0.12 * ss(k)); }
  return h;
}
export const nivelNilo = cre => perfil(aguaDe(cre));
export const NIVEL_ACEQUIA = 0.03;

/* qué es cada baldosa: la huella del río, la vega negra o la arena roja (la regla del 2D, 03-terreno) */
export function tipoBaldosa(cx, cy) {
  if (enNilo(cx + 0.5, cy + 0.5).d < HUELLA) return 'ribera';
  if (distVega(cx + 0.5, cy + 0.5) < VEGA) return 'vega';
  return 'arena';
}
const ARENA = ['#e8d4a2', '#e2cd98', '#ecdbaa', '#ddc790', '#e5d29c'];
export function tonoArena(cx, cy) {
  const dn = Math.sin(0.9 * cx + 0.5 * cy) + Math.sin(0.4 * cx - 0.8 * cy);
  return dn > 0.8 ? '#efe0b4' : dn < -0.8 ? '#d8c288' : ARENA[Math.abs(cx * 7 + cy * 13) % 5];
}
/* los sitios que ocupa la época (monumentos, poblado, saberes): ahí no hay campos ni matas */
export const RESERVAS = [];
export const reservado = (x, z, m = 0) => RESERVAS.some(r => r.r ? Math.hypot(x - r.x, z - r.z) < r.r + m : x > r.x0 - m && x < r.x1 + m && z > r.z0 - m && z < r.z1 + m);

/* ---------- el suelo: celdas de ¼, pintadas por baldosa y hundidas en el cauce ---------- */
export function suelo(K) {
  const RES = 4, N = LADO * RES, s = 1 / RES, pos = [], celdas = [], hondo = [];
  const tri = (a, b, d, cx, cz) => { for (const q of [a, b, d]) pos.push(q[0], q[1], q[2]); celdas.push(cx, cz); hondo.push((a[1] + b[1] + d[1]) / 3); };
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s, cx = Math.floor(x0 + s / 2), cz = Math.floor(z0 + s / 2);
    const v = (x, z) => [x, altura(x, z), z];
    tri(v(x0, z0), v(x0, z1), v(x1, z0), cx, cz); tri(v(x1, z0), v(x0, z1), v(x1, z1), cx, cz);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const col = new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3); geo.setAttribute('color', col);
  geo.computeVertexNormals();
  const c = new THREE.Color(), c2 = new THREE.Color(), tipos = new Map();
  const tipo = (cx, cz) => { const k = cx * 100 + cz; if (!tipos.has(k)) tipos.set(k, tipoBaldosa(cx, cz)); return tipos.get(k); };
  /* se repinta con el año: la paleta de la estación egipcia (ESTACIONES_EGIPTO del motor) */
  const pintar = pal => {
    for (let t = 0; t < hondo.length; t++) {
      const cx = celdas[2 * t], cz = celdas[2 * t + 1], tp = tipo(cx, cz);
      const h = hondo[t];
      c.set(tp === 'ribera' ? pal.ribera : tp === 'vega' ? pal.vega[Math.abs(cx * 7 + cz * 13) % 5] : tonoArena(cx, cz));
      if (h > 0.015 && h < ALTO_MESETA - 0.02) c.set((cx + cz) % 2 ? '#c29a62' : '#b48c58');          // el escarpe de roca
      else if (h >= ALTO_MESETA - 0.02) c.lerp(c2.set('#f1e4c2'), 0.35);                                 // la arena clara de la meseta
      if (h < -0.015) c.lerp(c2.set(pal.humedo), Math.min(1, -h / 0.1));             // la orilla mojada
      if (h < -0.2) c.lerp(c2.set('#5f5f45'), Math.min(0.75, (-h - 0.2) / 0.16));      // el lecho, bajo el agua
      for (let k = 0; k < 3; k++) col.setXYZ(t * 3 + k, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };
  const m = K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false });
  m.userData.suelo = true; m.userData.pintar = pintar; m.userData.vivo = true;
  return m;
}

/* ---------- el agua del Nilo: una lámina ancha y lenta que sube con la crecida ---------- */
export function rio(K, vivos) {
  const g = new THREE.Group(), RES = 4, s = 1 / RES, pos = [], prof = [];
  for (let i = 0; i < LADO * RES; i++) for (let j = 0; j < LADO * RES; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s;
    const hs = [altura(x0, z0), altura(x1, z0), altura(x0, z1), altura(x1, z1)];
    if (Math.min(...hs) > -0.012 || enNilo(x0 + s / 2, z0 + s / 2).d > 2.3 && dCanal(x0 + s / 2, z0 + s / 2) > 0.2) continue;
    const q = [[x0, z0, hs[0]], [x0, z1, hs[2]], [x1, z0, hs[1]], [x1, z0, hs[1]], [x0, z1, hs[2]], [x1, z1, hs[3]]];
    for (const [x, z, h] of q) { pos.push(x, 0, z); prof.push(h); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const col = new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3); geo.setAttribute('color', col);
  geo.computeVertexNormals();
  const agua = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, transparent: true, opacity: 0.88 })); agua.receiveShadow = true; agua.userData.vivo = true; g.add(agua);
  agua.userData.ficha = { titulo: 'El Nilo', texto: 'sube en ajet, deja el limo negro y vuelve a su cauce' };
  const c = new THREE.Color(), c2 = new THREE.Color();
  const pintar = pal => {
    for (let i = 0; i < prof.length; i++) {
      const k = Math.min(1, Math.max(0, (-prof[i] - 0.06) / 0.28));
      if (k < 0.5) c.set(pal.aguaBaja).lerp(c2.set(pal.cauce), k * 2); else c.set(pal.cauce).lerp(c2.set(pal.hondo), (k - 0.5) * 2);
      col.setXYZ(i, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };
  const api = { g, agua, pintar, nivel: nivelNilo(1), crecida: 1 };
  /* la corriente: ocho hebras largas y lentas (el Nilo es más ancho y más callado que el río de Sumer) */
  const hebra = new THREE.PlaneGeometry(0.8, 0.04);
  const vetas = Array.from({ length: 8 }, (_, i) => {
    const m = new THREE.Mesh(hebra, new THREE.MeshBasicMaterial({ color: '#eef8fb', transparent: true, opacity: 0.35, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; g.add(m); return { m, f: i * 0.29 % 1, v: 0.005 + (i % 3) * 0.0018, perp: -0.62 + (i * 0.17) % 1.24 };
  });
  /* el limo en suspensión: manchas pálidas que la crecida arrastra */
  const limos = Array.from({ length: 5 }, (_, i) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.3, 12), new THREE.MeshBasicMaterial({ color: '#cebe8e', transparent: true, opacity: 0, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.scale.set(1.6, 0.6, 1); g.add(m); return { m, i };
  });
  /* los peces que remontan bajo la lámina (sin saltos: el 2D los quiso callados) */
  const PECES = [{ u0: 0.32, vel: 0.0045, perp: 0.35, tam: 1.0 }, { u0: 0.62, vel: -0.0032, perp: -0.42, tam: 0.8 }, { u0: 0.47, vel: 0.006, perp: 0.08, tam: 0.65 }];
  const peces = PECES.map(f => {
    const p = new THREE.Group(); p.userData.vivo = true;
    const cu = K.malla(K.esfera(0.12), '#3f6f7c', { sombra: false, sinTinta: true }); cu.scale.set(0.42 * f.tam, 0.3, 1.05 * f.tam); p.add(cu);
    const co = K.malla(K.cono(0.07, 0.12, 4), '#3f6f7c', { sombra: false, sinTinta: true }); co.rotation.x = -Math.PI / 2; co.position.z = -0.15 * f.tam; co.scale.x = 0.3; p.add(co);
    g.add(p); return { p, ...f };
  });
  /* EL HIPOPÓTAMO: cada 41 s asoma los ojos, las orejas y el lomo, resopla y se hunde (el 2D lo pidió de perfil) */
  const hipo = new THREE.Group(); hipo.userData.vivo = true; g.add(hipo);
  { const cu = '#6a5f6b', cara = '#78606e';
    const lomo = K.malla(K.esfera(0.3), cu, { grosor: 0.01 }); lomo.scale.set(0.75, 0.5, 1.25); hipo.add(lomo);
    const cab = K.malla(K.caja(0.28, 0.2, 0.3), cara, { grosor: 0.008 }); cab.position.set(0, 0.04, 0.42); hipo.add(cab);
    const hoc = K.malla(K.caja(0.32, 0.16, 0.16), cara, { grosor: 0.008 }); hoc.position.set(0, 0.0, 0.6); hipo.add(hoc);
    [-1, 1].forEach(l => {
      const o = K.malla(K.esfera(0.04), '#2a2226', { sinTinta: true }); o.position.set(l * 0.09, 0.16, 0.38); hipo.add(o);
      const or = K.malla(K.esfera(0.035), '#b98a96', { sinTinta: true }); or.scale.set(0.6, 1, 0.6); or.position.set(l * 0.11, 0.18, 0.3); hipo.add(or);
      const n = K.malla(K.esfera(0.02), '#3a2a30', { sinTinta: true }); n.position.set(l * 0.07, 0.085, 0.68); hipo.add(n);
    });
  }
  const anillo = new THREE.Mesh(new THREE.RingGeometry(0.4, 0.46, 28), new THREE.MeshBasicMaterial({ color: '#eef8fb', transparent: true, opacity: 0, depthWrite: false }));
  anillo.rotation.x = -Math.PI / 2; g.add(anillo);
  const dentro = p => p.x > E0 + 0.25 && p.x < E1 - 0.25 && p.z > E0 + 0.25 && p.z < E1 - 0.25;
  vivos.push(t => {
    const w = aguaDe(api.crecida);
    agua.position.y = api.nivel;
    vetas.forEach(v => {
      const f = (t * v.v + v.f) % 1, u = 0.02 + f * 0.96, p = puntoNilo(u, v.perp * w), q = puntoNilo(Math.min(1, u + 0.01), v.perp * w);
      v.m.position.set(p.x, api.nivel + 0.004, p.z); v.m.rotation.z = -Math.atan2(q.z - p.z, q.x - p.x);
      v.m.visible = dentro(p); v.m.material.opacity = (0.22 + 0.2 * Math.sin(t * 0.9 + v.f * 20)) * Math.sin(Math.PI * f);
    });
    const turbio = Math.max(0, (api.crecida - 0.95) / 0.4);
    limos.forEach(({ m, i }) => {
      const u = (t * 0.004 + i * 0.21) % 1, p = puntoNilo(u, (-0.5 + (i * 0.27) % 1.0) * w), q = puntoNilo(Math.min(1, u + 0.01), 0);
      m.position.set(p.x, api.nivel + 0.003, p.z); m.rotation.z = -Math.atan2(q.z - p.z, q.x - p.x);
      m.visible = turbio > 0.02 && dentro(p); m.material.opacity = turbio * (0.3 + 0.2 * Math.sin(t * 0.7 + i));
    });
    peces.forEach(f => {
      const u = 0.26 + (((f.u0 + t * f.vel) % 0.5) + 0.5) % 0.5, p = puntoNilo(u, f.perp * w), q = puntoNilo(u + (f.vel >= 0 ? 0.012 : -0.012), f.perp * w);
      f.p.position.set(p.x, api.nivel - 0.08, p.z); f.p.rotation.y = Math.atan2(q.x - p.x, q.z - p.z); f.p.visible = dentro(p);
    });
    const CIC = 41, fh = ((t % CIC) + CIC) % CIC;
    if (fh < 13) {
      const k = fh / 13, sube = Math.sin(k * Math.PI), u = 0.4 + Math.sin(t * 0.02) * 0.06, p = puntoNilo(u, -w * 0.3), q = puntoNilo(u + 0.01, -w * 0.3);
      hipo.visible = true; hipo.position.set(p.x, api.nivel - 0.2 + sube * 0.17, p.z); hipo.rotation.y = Math.atan2(q.x - p.x, q.z - p.z) + 0.6;
      const ca = k - 0.55; anillo.position.set(p.x, api.nivel + 0.005, p.z);
      anillo.material.opacity = ca > 0 ? 0.5 * (1 - ca / 0.45) : 0; anillo.scale.setScalar(ca > 0 ? 0.7 + ca * 3 : 0.7);
    } else { hipo.visible = false; anillo.material.opacity = 0; }
  });
  api.hipo = hipo;
  return api;
}

/* ---------- el canal del shaduf y la acequia de los campos ---------- */
export function canales(K) {
  const g = new THREE.Group();
  const tramo = (a, b, y, ancho, color) => {
    const Lc = Math.hypot(b.x - a.x, b.z - a.z), ang = Math.atan2(b.z - a.z, b.x - a.x);
    const m = K.malla(K.caja(Lc, 0.01, ancho), color, { sinTinta: true, sombra: false }); m.position.set((a.x + b.x) / 2, y, (a.z + b.z) / 2); m.rotation.y = -ang; g.add(m);
    return m;
  };
  const [a, b] = ACEQUIA;                              // la acequia: dos bordos de tierra y el agua en medio, más alta que el río
  const Lc = Math.hypot(b.x - a.x, b.z - a.z), ang = Math.atan2(b.z - a.z, b.x - a.x);
  [-1, 1].forEach(l => { const m = K.malla(K.caja(Lc, 0.06, 0.07), '#7d6a44', { sinTinta: true }); m.position.set((a.x + b.x) / 2 + Math.sin(ang) * l * 0.1, 0.03, (a.z + b.z) / 2 - Math.cos(ang) * l * 0.1); m.rotation.y = -ang; g.add(m); });
  tramo(a, b, NIVEL_ACEQUIA, 0.13, '#6f9fb0');
  return g;
}

/* ---------- los campos de la vega: cuencas que el año viste (ajet inundadas, péret verdes, shemu doradas) ---------- */
export const MIES = [
  { h: 0.0, c: '#7f9a54', n: 0, agua: 1 },               // ajet: el agua de la crecida en las cuencas
  { h: 0.3, c: '#7fa843', n: 0.8, agua: 0 },             // péret: el grano brota en el limo
  { h: 0.62, c: '#d6b24e', n: 1, agua: 0 },              // shemu: el trigo y la cebada dorados
];
export function campos(K) {
  const g = new THREE.Group(), r = azar(3003), cuencas = [], mata = [];
  for (let cx = E0; cx < E1; cx++) for (let cy = E0; cy < E1; cy++) {
    const x = cx + 0.5, z = cy + 0.5, d = enNilo(x, z).d;
    if (d < 2.05 || distVega(x, z) > VEGA - 0.05 || reservado(x, z, 0.3) || dCanal(x, z) < 0.35) continue;
    if (x < E0 + 0.5 || z < E0 + 0.5 || x > E1 - 0.5 || z > E1 - 0.5) continue;
    cuencas.push([x, z]);
    for (let k = 0; k < 16; k++) mata.push([x - 0.36 + (k % 4) * 0.24 + (r() - 0.5) * 0.06, z - 0.36 + Math.floor(k / 4) * 0.24 + (r() - 0.5) * 0.06, r()]);
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  /* los bordos de tierra que cierran cada cuenca */
  const bordos = K.instancias(K.caja(0.96, 0.05, 0.06), '#6f5e3c', cuencas.length * 2, { sinTinta: true, sombra: false });
  cuencas.forEach(([x, z], i) => {
    m4.compose(v.set(x, 0.02, z - 0.47), q.identity(), s.set(1, 1, 1)); bordos.setMatrixAt(i * 2, m4);
    q.setFromEuler(e.set(0, Math.PI / 2, 0)); m4.compose(v.set(x - 0.47, 0.02, z), q, s.set(1, 1, 1)); bordos.setMatrixAt(i * 2 + 1, m4);
  });
  const lamina = K.instancias(K.caja(0.9, 0.008, 0.9), '#6f9aa0', cuencas.length, { sinTinta: true, sombra: false, transparent: true, opacity: 0.75 });
  cuencas.forEach(([x, z], i) => { m4.compose(v.set(x, 0.012, z), q.identity(), s.set(1, 1, 1)); lamina.setMatrixAt(i, m4); });
  const mies = K.instancias(K.cono(0.045, 0.3, 4), '#d6b24e', mata.length, { sinTinta: true });
  mies.frustumCulled = false;
  g.add(bordos, lamina, mies);
  const api = { g, cuencas };
  api.vestir = (i, k = 0, j = i) => {
    const A = MIES[i] || MIES[1], B = MIES[j] || A, h = A.h + (B.h - A.h) * k, n = A.n + (B.n - A.n) * k;
    mies.material.color.set(A.c).lerp(new THREE.Color(B.c), k);
    lamina.visible = A.agua + (B.agua - A.agua) * k > 0.5;
    mata.forEach(([x, z, rr], i2) => {
      const vis = rr < n && h > 0.02, hh = Math.max(0.02, h) * (0.75 + rr * 0.5);
      q.setFromEuler(e.set((rr - 0.5) * 0.35, rr * 6, (rr - 0.5) * 0.35));
      m4.compose(v.set(x, 0.02 + 0.15 * hh, z), q, s.set(1, vis ? hh / 0.3 : 0.001, 1)); mies.setMatrixAt(i2, m4);
    });
    mies.instanceMatrix.needsUpdate = true;
  };
  return api;
}

/* ---------- la losa del diorama: el corte de tierra, con el Nilo asomando por su borde ---------- */
export function losa(K) {
  const g = new THREE.Group();
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const xa = eje === 'x' ? fijo : u, za = eje === 'x' ? u : fijo, xb = eje === 'x' ? fijo : u1, zb = eje === 'x' ? u1 : fijo;
      const h0 = altura(xa, za), h1 = altura(xb, zb), top0 = Math.min(h0, 0), top1 = Math.min(h1, 0);
      const tp = tipoBaldosa(Math.floor((xa + xb) / 2 - (eje === 'x' ? 0.01 : 0)), Math.floor((za + zb) / 2 - (eje === 'x' ? 0 : 0.01)));
      quad(P(u, top0), P(u1, top1), P(u1, top1 - 0.12), P(u, top0 - 0.12), top0 < -0.03 ? '#7c7c4e' : tp === 'arena' ? '#cbb06a' : '#8aa04e');
      quad(P(u, top0 - 0.12), P(u1, top1 - 0.12), P(u1, -0.46), P(u, -0.46), tp === 'arena' ? '#c9a36a' : PAL.corte1);
      quad(P(u, -0.46), P(u1, -0.46), P(u1, -1.05), P(u, -1.05), PAL.corte2);
      const nv = nivelNilo(1);
      if (h0 < nv || h1 < nv) quad(P(u, nv), P(u1, nv), P(u1, Math.min(nv, top1)), P(u, Math.min(nv, top0)), '#537f8d');
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals(); geo.userData.propia = true;
    const m = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide })); m.receiveShadow = false; return m;
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const caja = (w, h, d, x, y, z, color) => { const m = K.malla(K.caja(w, h, d), color, { grosor: 0.03, sombra: false, recibe: false }); m.position.set(x, y, z); g.add(m); };
  caja(LADO, 0.46, 0.06, CENTRO, -0.23, E0 + 0.03, '#c9a36a'); caja(0.06, 0.46, LADO, E0 + 0.03, -0.23, CENTRO, '#c9a36a');
  caja(LADO - 0.02, 0.6, LADO - 0.02, CENTRO, -0.76, CENTRO, PAL.corte2);
  const r = azar(1998);
  for (let i = 0; i < 16; i++) {                        // piedritas y tiestos en el corte
    const izq = r() < 0.5, s = E0 + 0.4 + r() * (LADO - 0.8), y = -(0.3 + r() * 0.65), rr = 0.06 + r() * 0.06;
    const p = K.malla(K.roca(rr, 60 + i), i % 4 ? PAL.piedrita : '#a8583a', { sinTinta: true, sombra: false, recibe: false }); p.scale.set(1.4, 0.8, 1.4);
    if (izq) p.position.set(s, y, E1 + 0.005); else p.position.set(E1 + 0.005, y, s);
    if (altura(izq ? s : E1, izq ? E1 : s) > -0.05) g.add(p);
  }
  return g;
}

/* ---------- lo pisado: la explanada ante la puerta del templo y la senda que viene del poblado ---------- */
const SENDA = [[[4.5, 7.75], [6.4, 8.15], [8.3, 8.45], [9.45, 7.4]], [[9.45, 8.3], [9.45, 10.2], [9.7, 11.6]]];
export function pisado(K) {
  const g = new THREE.Group(), r = azar(414);
  const ex = new THREE.Mesh(new THREE.CircleGeometry(1, 28), K.mat('#d6bd88', { transparent: true, opacity: 0.55, depthWrite: false }));
  ex.rotation.x = -Math.PI / 2; ex.scale.set(1.75, 1.0, 1); ex.position.set(9.5, 0.004, 8.35); ex.receiveShadow = true; g.add(ex);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), eje = new THREE.Vector3(0, 1, 0), pasos = [];
  for (const tramo of SENDA) for (let i = 0; i < tramo.length - 1; i++) {
    const [a, b] = [tramo[i], tramo[i + 1]], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 3.4);
    for (let k = 0; k < n; k++) pasos.push([a[0] + (b[0] - a[0]) * k / n + (r() - 0.5) * 0.28, a[1] + (b[1] - a[1]) * k / n + (r() - 0.5) * 0.28, r() * 3]);
  }
  const huellas = K.instancias(K.cilindro(0.15, 0.15, 0.01, 12), '#b39a68', pasos.length, { sinTinta: true, sombra: false, transparent: true, opacity: 0.4, depthWrite: false });
  pasos.forEach(([x, z, a], i) => { q.setFromAxisAngle(eje, a); m4.compose(v.set(x, 0.006, z), q, s.set(1, 1, 0.55)); huellas.setMatrixAt(i, m4); });
  g.add(huellas);
  return g;
}

/* ---------- el desierto: las ondas del viento en la arena y sus piedras ---------- */
export function desierto(K) {
  const g = new THREE.Group(), r = azar(515), ondas = [], piedras = [];
  for (let k = 0; k < 900 && ondas.length < 150; k++) {
    const x = E0 + 0.3 + r() * (LADO - 0.6), z = E0 + 0.3 + r() * (LADO - 0.6);
    if (distVega(x, z) < VEGA + 0.2 || reservado(x, z, 0.25)) continue;
    const hm = meseta(x, z); if (hm > 0.01 && hm < ALTO_MESETA - 0.01) continue;   // ni en el escarpe
    ondas.push([x, z, 0.35 + r() * 0.35]);
    if (r() < 0.12) piedras.push([x + 0.2, z + 0.1, 0.03 + r() * 0.04]);
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  const rizos = K.instancias(K.caja(1, 0.012, 0.035), '#c9ae76', ondas.length, { sinTinta: true, sombra: false });
  ondas.forEach(([x, z, l], i) => { q.setFromEuler(e.set(0, 0.55 + Math.sin(x * 0.7) * 0.25, 0)); m4.compose(v.set(x, altura(x, z) + 0.004, z), q, s.set(l, 1, 1)); rizos.setMatrixAt(i, m4); });
  const ps = K.instancias(K.roca(1, 7), '#b8a07a', piedras.length, { sinTinta: true });
  piedras.forEach(([x, z, rr], i) => { m4.compose(v.set(x, altura(x, z) + rr * 0.3, z), q.identity(), s.set(rr * 1.4, rr * 0.7, rr * 1.2)); ps.setMatrixAt(i, m4); });
  g.add(rizos, ps);
  return g;
}

/* ---------- lo que crece: palmeras, sicómoros, el papiro, los lotos, los juncos y la hierba de la orilla ---------- */
export const PALMERAS = [[2.9, 8.2, 1.5], [16.0, 5.5, 1.55], [7.3, 16.6, 1.35], [8.3, 15.6, 1.45], [7.9, 13.9, 1.3],
  [16.7, 9.2, 1.45], [17.3, 7.4, 1.35], [13.2, 16.9, 1.4], [12.5, 14.8, 1.3], [4.6, 11.3, 1.35]];
export const SICOMOROS = [[4.7, 10.6]];   // uno solo, junto al poblado: a la derecha tapaba a los que escuchan la Kemyt
export const PAPIROS = [[16.6, 12.7], [16.35, 13.9], [14.2, 16.05], [11.75, 13.45], [9.6, 15.1], [12.9, 9.9], [15.9, 8.2]];
export function vegetacion(K, vivos) {
  const g = new THREE.Group(), palmas = [], matas = [], r = azar(81);
  PALMERAS.forEach(([x, z, h], i) => { if (reservado(x, z, 0.1)) return; const p = palmera(K, h, i + 3); p.position.set(x, 0, z); g.add(p); palmas.push(p); });
  SICOMOROS.forEach(([x, z], i) => {                  // el sicómoro: el árbol de Hathor, copa ancha y baja, tronco claro
    const t = new THREE.Group(); t.position.set(x, 0, z); g.add(t);
    const tr = K.malla(K.cilindro(0.07, 0.12, 0.55, 8), '#a89878', { grosor: 0.01 }); tr.position.y = 0.27; t.add(tr);
    [[0.46, 0, 0.78, 0, '#5f8a3a'], [0.34, 0.3, 0.9, 0.12, '#6f9a45'], [0.34, -0.28, 0.86, -0.1, '#557f34'], [0.3, 0.05, 1.05, -0.2, '#6f9a45']].forEach(([rr, dx, y, dz, c]) => { const m = K.malla(K.esfera(rr), c, { grosor: 0.014 }); m.scale.set(1.15, 0.72, 1.1); m.position.set(dx, y, dz); t.add(m); });
    for (let k = 0; k < 7; k++) { const f = K.malla(K.esfera(0.03), '#c9a23e', { sinTinta: true, sombra: false }); f.position.set(Math.cos(k * 0.9 + i) * 0.45, 0.62 + (k % 3) * 0.1, Math.sin(k * 0.9 + i) * 0.4); t.add(f); }   // los higos
  });
  /* EL PAPIRO: matas de tallos altos de sección triangular con su penacho en umbela, en la orilla anegable */
  const tallo = K.cilindro(0.012, 0.02, 1, 3), umbela = K.cono(0.11, 0.1, 7);
  PAPIROS.forEach(([x, z], i) => {
    const mata = new THREE.Group(); mata.userData.vivo = true; mata.position.set(x, Math.min(0, altura(x, z)), z); g.add(mata); matas.push(mata);
    for (let j = 0; j < 11; j++) {
      const h = 0.65 + r() * 0.55, a = (j / 11) * Math.PI * 2 + r(), rr = 0.03 + r() * 0.12;
      const t = K.malla(tallo, '#6f9a3a', { sinTinta: true }); t.scale.set(1, h, 1); t.position.set(Math.cos(a) * rr, h / 2, Math.sin(a) * rr); t.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12); mata.add(t);
      const u = K.malla(umbela, j % 3 ? '#8fb24a' : '#a9c25a', { sinTinta: true }); u.rotation.x = Math.PI; u.position.set(Math.cos(a) * (rr + h * 0.12), h + 0.03, Math.sin(a) * (rr + h * 0.12)); mata.add(u);
    }
    fundir(K, mata);
  });
  /* los juncos de la orilla (los del 2D y algunos más), sobre el barro */
  const junco = K.cilindro(0.014, 0.022, 0.5, 4);
  [[16.9, 10.0], [15.6, 12.2], [11.1, 13.9], [9.8, 15.3], [13.1, 14.9], [15.2, 11.1]].forEach(([x, z]) => {
    const mata = new THREE.Group(); mata.userData.vivo = true; mata.position.set(x, Math.min(0, altura(x, z)), z); g.add(mata); matas.push(mata);
    for (let j = 0; j < 7; j++) { const h = 0.4 + r() * 0.5, a = (j / 7) * Math.PI * 2 + r(), c = K.malla(junco, '#7f8e46', { sinTinta: true }); c.scale.set(0.8, h, 0.8); c.position.set(Math.cos(a) * 0.07, 0.25 * h, Math.sin(a) * 0.07); c.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); mata.add(c); }
    fundir(K, mata);
  });
  /* LOS LOTOS: hojas flotantes y flores azules (el loto azul, la flor del sol que se abre de día), siempre en el agua */
  const lotos = new THREE.Group(); lotos.userData.vivo = true; g.add(lotos);
  const hoja = new THREE.CircleGeometry(0.1, 10, 0.3, Math.PI * 2 - 0.6);
  for (let k = 0; k < 16; k++) {
    const u = 0.3 + r() * 0.5, lado = r() < 0.5 ? 1 : -1, p = puntoNilo(u, lado * (0.95 + r() * 0.12));
    if (p.x < E0 + 0.3 || p.x > E1 - 0.3 || p.z < E0 + 0.3 || p.z > E1 - 0.3) continue;
    const h = new THREE.Mesh(hoja, K.mat('#5f8f45', { side: THREE.DoubleSide })); h.rotation.set(-Math.PI / 2, 0, r() * 6); h.position.set(p.x, 0, p.z); h.scale.setScalar(0.8 + r() * 0.5); lotos.add(h);
    if (k % 3 === 0) { const f = K.malla(K.cono(0.05, 0.07, 6), '#6f8fd8', { sinTinta: true }); f.rotation.x = Math.PI; f.position.set(p.x + 0.06, 0.04, p.z); lotos.add(f); }
  }
  /* la hierba de la orilla, fuera del agua de la crecida y de lo construido */
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
  const lugares = [];
  for (let k = 0; k < 1200 && lugares.length < 130; k++) {
    const x = E0 + 0.3 + r() * (LADO - 0.6), z = E0 + 0.3 + r() * (LADO - 0.6), d = enNilo(x, z).d;
    if (d < 1.95 || d > 3.3 || reservado(x, z, 0.2) || dCanal(x, z) < 0.25 || (distVega(x, z) < VEGA && d > 2.05)) continue;
    lugares.push([x, z]);
  }
  for (let k = 0; k < 400 && lugares.length < 170; k++) {   // matas secas del desierto, muy pocas
    const x = E0 + 0.3 + r() * (LADO - 0.6), z = E0 + 0.3 + r() * (LADO - 0.6);
    if (distVega(x, z) < VEGA + 0.5 || reservado(x, z, 0.3) || meseta(x, z) > 0.01 || r() < 0.7) continue;
    lugares.push([x, z]);
  }
  const pasto = K.instancias(K.cono(0.05, 0.26, 4), '#8fa63a', lugares.length * 3, { sinTinta: true, sombra: false });
  lugares.forEach(([x, z], i) => { const seco = distVega(x, z) > VEGA; for (let j = 0; j < 3; j++) { e.set((r() - 0.5) * 0.7, r() * 3, (r() - 0.5) * 0.7); q.setFromEuler(e); const h = (seco ? 0.45 : 0.7) + r() * 0.6; m4.compose(v.set(x + (r() - 0.5) * 0.16, Math.max(0, altura(x, z)) + 0.12 * h, z + (r() - 0.5) * 0.16), q, s.set(1, h, 1)); pasto.setMatrixAt(i * 3 + j, m4); } });
  g.add(pasto);
  vivos.push(t => {
    matas.forEach((m, i) => { m.rotation.z = 0.05 * Math.sin(t * 1.0 + i); m.rotation.x = 0.035 * Math.sin(t * 0.75 + i * 2); });
    palmas.forEach((p, i) => { const c = p.userData.copa; if (c) { c.rotation.z = 0.03 * Math.sin(t * 0.7 + i); c.rotation.x = 0.02 * Math.sin(t * 0.55 + i * 1.7); } });
  });
  return { g, pasto, lotos };
}

/* ---------- el poblado de los artesanos (al oeste, junto a la necrópolis) ---------- */
export const CASAS = [[3.15, 6.25, 0.85, 0.9, 0.38, 'pan'], [4.2, 6.0, 0.95, 0.8, 0.45, 'escalera'], [3.45, 7.4, 0.8, 0.75, 0.34, '']];
export const HORNO = { x: 4.85, y: 7.55 }, CORRAL = [[3.0, 8.4], [3.75, 8.4], [3.75, 9.0]];
export function poblado(K) {
  const g = new THREE.Group(), AD = ['#d8b980', '#c49c64', '#ab8550'];
  CASAS.forEach(([x0, z0, w, d, H, extra], i) => {
    const c = new THREE.Group(); c.position.set(x0 + w / 2, 0, z0 + d / 2); g.add(c);
    const cu = K.malla(K.caja(w, H, d), AD[i % 2], { grosor: 0.012 }); cu.position.y = H / 2; c.add(cu);
    const pret = K.malla(K.caja(w + 0.02, 0.05, d + 0.02), AD[2], { grosor: 0.008 }); pret.position.y = H + 0.02; c.add(pret);   // el pretil de la azotea
    const puerta = K.malla(K.caja(0.15, 0.26, 0.02), '#3a2a1c', { sinTinta: true }); puerta.position.set(-w * 0.18, 0.13, d / 2 + 0.005); c.add(puerta);
    const din = K.malla(K.caja(0.2, 0.03, 0.03), '#8b5a3a', { sinTinta: true }); din.position.set(-w * 0.18, 0.275, d / 2 + 0.01); c.add(din);
    const ven = K.malla(K.caja(0.1, 0.05, 0.02), '#3a2a1c', { sinTinta: true }); ven.position.set(w * 0.22, H * 0.78, d / 2 + 0.005); c.add(ven);
    if (extra === 'pan') for (let k = 0; k < 5; k++) { const p = K.malla(K.esfera(0.04), '#c8904a', { sinTinta: true }); p.scale.y = 0.55; p.position.set(-0.18 + k * 0.09, H + 0.06, 0.05 * (k % 2)); c.add(p); }   // el pan secándose en la azotea
    if (extra === 'escalera') {                        // la escalera de palos a la azotea
      const e2 = new THREE.Group(); e2.position.set(w / 2 + 0.06, 0, 0.05); e2.rotation.z = -0.18; c.add(e2);
      [-1, 1].forEach(l => { const p = K.malla(K.cilindro(0.012, 0.012, H + 0.12, 5), '#8b5a3a', { sinTinta: true }); p.position.set(0, (H + 0.12) / 2, l * 0.08); e2.add(p); });
      for (let k = 1; k < 5; k++) { const p = K.malla(K.cilindro(0.008, 0.008, 0.16, 4), '#8b5a3a', { sinTinta: true }); p.rotation.x = Math.PI / 2; p.position.y = k * H / 5; e2.add(p); }
    }
    if (i === 0) {                                     // la sombra de palma en la azotea
      const tol = K.malla(K.caja(w * 0.55, 0.02, 0.32), '#b8a06a', { grosor: 0.004 }); tol.position.set(0.1, H + 0.22, -0.12); c.add(tol);
      [-1, 1].forEach(l => { const p = K.malla(K.cilindro(0.012, 0.012, 0.2, 5), '#8b5a3a', { sinTinta: true }); p.position.set(0.1 + l * w * 0.24, H + 0.11, -0.12); c.add(p); });
    }
    const tin = K.malla(K.cilindro(0.06, 0.08, 0.2, 10), '#b5643a', { grosor: 0.006 }); tin.position.set(w / 2 - 0.1, 0.1, d / 2 + 0.12); c.add(tin);   // la tinaja del agua
  });
  // el horno del pan: una cúpula de barro con su boca
  const h = new THREE.Group(); h.position.set(HORNO.x, 0, HORNO.y); g.add(h);
  const cup = K.malla(K.esfera(0.2), '#b88a58', { grosor: 0.01 }); cup.scale.set(1, 0.85, 1); cup.position.y = 0.06; h.add(cup);
  const boca = K.malla(K.caja(0.1, 0.09, 0.03), '#2a1c14', { sinTinta: true }); boca.position.set(0, 0.08, 0.19); h.add(boca);
  [[4.05, 7.05], [4.22, 7.12]].forEach(([x, z], k) => { const j = K.malla(K.cilindro(0.05, 0.065, 0.18, 10), k ? '#a8583a' : '#b5643a', { grosor: 0.005 }); j.position.set(x, 0.09, z); g.add(j); });   // las jarras de agua
  // el corral de la cabra: una tapia baja de adobe
  for (let i = 0; i < CORRAL.length - 1; i++) {
    const [a, b] = [CORRAL[i], CORRAL[i + 1]], Lc = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const m = K.malla(K.caja(Lc, 0.16, 0.07), AD[1], { grosor: 0.006 }); m.position.set((a[0] + b[0]) / 2, 0.08, (a[1] + b[1]) / 2); m.rotation.y = -Math.atan2(b[1] - a[1], b[0] - a[0]); g.add(m);
  }
  g.userData.ficha = { titulo: 'El poblado', texto: 'las casas de los artesanos que trabajan para la necrópolis' };
  return g;
}

/* ---------- las mastabas: tumbas de nobles en talud, con su falsa puerta mirando al este ---------- */
export const MASTABAS = [[14.3, 3.7, 1.4, 0.9, 0.36], [15.9, 4.6, 0.9, 0.6, 0.26]];
export function mastabas(K, tronco) {
  const g = new THREE.Group();
  MASTABAS.forEach(([x0, z0, w, d, H]) => {
    const m = K.malla(tronco(w, d, w - 0.12, d - 0.12, H), EG.caliza, { grosor: 0.012 }); m.geometry.userData.propia = true; m.position.set(x0 + w / 2, 0, z0 + d / 2); g.add(m);
    const fp = K.malla(K.caja(0.16, H * 0.8, 0.02), EG.calizaD, { grosor: 0.004 }); fp.position.set(x0 + w * 0.7, H * 0.4, z0 + d - 0.03); g.add(fp);   // la falsa puerta
    const fp2 = K.malla(K.caja(0.07, H * 0.6, 0.02), '#6e5a3e', { sinTinta: true }); fp2.position.set(x0 + w * 0.7, H * 0.33, z0 + d - 0.018); g.add(fp2);
  });
  g.userData.ficha = { titulo: 'Las mastabas', texto: 'las casas de eternidad de los nobles, con su falsa puerta para el alma' };
  return g;
}
