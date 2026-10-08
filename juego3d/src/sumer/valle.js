/* ============================================================
   sumer/valle
   El valle de Sumer en 3D: la llanura de limo, el río que la cruza por el sureste con su crecida, los
   canales de riego que salen de él, los campos en damero que cambian con el año, las datileras, los
   tamariscos y los carrizos de la orilla, y la losa del diorama con el corte del río en su borde.
   La geometría del río y los canales es la del motor 2D (RIO_SUMER y los canales de 03-terreno), así la
   querencia del barro, la barca y los toques caen donde el motor los espera.
   ============================================================ */
import * as THREE from 'three';
import { azar, fundir, PAL } from '../kit.js';
import { SU, palmera } from './monumentos.js';

export const E0 = 2, E1 = 18, LADO = E1 - E0, CENTRO = 10;
export const RIO = { ax: 19.0, ay: 6.8, bx: 9.0, by: 18.6 };
const RDX = RIO.bx - RIO.ax, RDY = RIO.by - RIO.ay, RL2 = RDX * RDX + RDY * RDY;
const RN = { x: -0.763, y: -0.646 };                  // la normal del eje (hacia el noroeste)
const wob = t => 0.3 * Math.sin(7.3 * t + 0.6);      // el serpenteo (03-terreno)
/* (t, e): t a lo largo del eje (0 en la cabecera, 1 en la boca) y e la distancia con signo a la línea del cauce */
export function enRio(x, z) {
  const t = ((x - RIO.ax) * RDX + (z - RIO.ay) * RDY) / RL2, s = (x - RIO.ax) * RN.x + (z - RIO.ay) * RN.y;
  return { t, e: s - wob(t), dEje: Math.abs(s) };
}
export function puntoRio(u, perp = 0) { return { x: RIO.ax + RDX * u + RN.x * (wob(u) + perp), z: RIO.ay + RDY * u + RN.y * (wob(u) + perp) }; }
export const CANALES = [[5.6, 11.5, 15.8, 10.6], [9.0, 11.15, 9.6, 16.4], [12.6, 10.85, 13.1, 13.9]];
function dSeg(x, z, [ax, az, bx, bz]) {
  const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz;
  let t = ((x - ax) * dx + (z - az) * dz) / L2; t = Math.max(0, Math.min(1, t));
  return Math.hypot(x - (ax + t * dx), z - (az + t * dz));
}
export const dCanal = (x, z) => Math.min(...CANALES.map(c => dSeg(x, z, c)));
export const CAMPO_TEMPLO = { x0: 3.6, y0: 10.2, x1: 6.12, y1: 12.43 };
/* lo que se construye en el patio y alrededor: ahí no hay sembrado ni pasto alto */
export const PATIO = { x0: 7.0, y0: 5.0, x1: 13.6, y1: 10.4 };
export const enPatio = (x, z) => x > PATIO.x0 && x < PATIO.x1 && z > PATIO.y0 && z < PATIO.y1;
export const enZigurat = (x, z) => x > 3.9 && x < 8.1 && z > 1.5 && z < 7.2;

/* ---------- el relieve: el cauce hundido, los canales con sus bordos ---------- */
export const FONDO_RIO = -0.34;
export function altura(x, z) {
  const { e } = enRio(x, z), d = Math.abs(e);
  let h = 0;
  if (d < 1.35) { const k = Math.min(1, (1.35 - d) / 0.7); h = FONDO_RIO * k * k * (3 - 2 * k); }
  const dc = dCanal(x, z);
  if (dc < 0.13) { const k = Math.min(1, (0.13 - dc) / 0.06); h = Math.min(h, -0.08 * k * k * (3 - 2 * k)); }
  else if (dc < 0.25 && h > -0.05) h = Math.max(h, 0.035 * Math.sin(Math.PI * (dc - 0.13) / 0.12));   // el bordo de tierra del canal
  return h;
}
export const nivelRio = cre => -0.13 + 0.26 * (cre - 1);   // la crecida sube el agua (1,22 la cubre hasta la orilla húmeda)
export const NIVEL_CANAL = -0.03;

/* qué es cada baldosa: la ribera, un campo del damero o limo (la regla del 2D, 03-terreno) */
export function tipoBaldosa(cx, cy) {
  const d = enRio(cx + 0.5, cy + 0.5).dEje;
  if (d < 2.2) return 'ribera';
  if (cy >= 9 && cy <= 16 && d > 2.4 && (cx + (cy & 1)) % 3 !== 0) return 'campo';
  return 'limo';
}
const esCampoSembrado = (cx, cy) => tipoBaldosa(cx, cy) === 'campo' && !enPatio(cx + 0.5, cy + 0.5) &&
  !(cx + 0.5 > CAMPO_TEMPLO.x0 - 0.3 && cx + 0.5 < CAMPO_TEMPLO.x1 + 0.3 && cy + 0.5 > CAMPO_TEMPLO.y0 - 0.3 && cy + 0.5 < CAMPO_TEMPLO.y1 + 0.3);

/* ---------- el suelo: una malla de celdas de ¼, pintada por baldosa y hundida en el cauce ---------- */
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
  const c = new THREE.Color(), c2 = new THREE.Color();
  /* se repinta con el año: la paleta de la estación de Sumer (ESTACIONES_SUMER del motor) */
  const pintar = pal => {
    for (let t = 0; t < hondo.length; t++) {
      const cx = celdas[2 * t], cz = celdas[2 * t + 1], tipo = tipoBaldosa(cx, cz), par = (cx + cz) % 2 === 0;
      c.set(tipo === 'ribera' ? (par ? pal.riberaA : pal.riberaB) : tipo === 'campo' ? (par ? pal.campoA : pal.campoB) : pal.limo[(cx * 7 + cz * 13) % 5]);
      const h = hondo[t];
      if (h < -0.02) c.lerp(c2.set(pal.humedo), Math.min(1, -h / 0.12));          // la orilla mojada
      if (h < -0.16) c.lerp(c2.set('#6f6a4a'), Math.min(0.75, (-h - 0.16) / 0.18));   // el lecho, bajo el agua
      for (let k = 0; k < 3; k++) col.setXYZ(t * 3 + k, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };
  const m = K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false });
  m.userData.suelo = true; m.userData.pintar = pintar; m.userData.vivo = true;
  return m;
}

/* ---------- el agua del río: una malla sobre el cauce, que sube con la crecida ---------- */
export function rio(K, vivos) {
  const g = new THREE.Group(), RES = 4, s = 1 / RES, pos = [], prof = [];
  for (let i = 0; i < LADO * RES; i++) for (let j = 0; j < LADO * RES; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s;
    const hs = [altura(x0, z0), altura(x1, z0), altura(x0, z1), altura(x1, z1)];
    if (Math.min(...hs) > -0.04 || Math.abs(enRio(x0 + s / 2, z0 + s / 2).e) > 1.45) continue;
    const q = [[x0, z0, hs[0]], [x0, z1, hs[2]], [x1, z0, hs[1]], [x1, z0, hs[1]], [x0, z1, hs[2]], [x1, z1, hs[3]]];
    for (const [x, z, h] of q) { pos.push(x, 0, z); prof.push(h); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const col = new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3); geo.setAttribute('color', col);
  geo.computeVertexNormals();
  const mat = K.mat('#ffffff', { vertexColors: true, transparent: true, opacity: 0.86 });
  const agua = new THREE.Mesh(geo, mat); agua.receiveShadow = true; agua.userData.vivo = true; g.add(agua);
  agua.userData.ficha = { titulo: 'El río', texto: 'trae el agua, el limo y el barro de las tablillas' };
  const c = new THREE.Color(), c2 = new THREE.Color();
  /* los colores del agua: somera en la orilla, el cauce y lo hondo al medio (la estación los trae) */
  const pintar = pal => {
    for (let i = 0; i < prof.length; i++) {
      const k = Math.min(1, Math.max(0, (-prof[i] - 0.05) / 0.26));
      if (k < 0.5) c.set(pal.aguaBaja).lerp(c2.set(pal.cauce), k * 2); else c.set(pal.cauce).lerp(c2.set(pal.hondo), (k - 0.5) * 2);
      col.setXYZ(i, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };
  /* las vetas de la corriente: seis trazos claros que bajan por el cauce */
  const vetas = Array.from({ length: 8 }, (_, i) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.035), new THREE.MeshBasicMaterial({ color: '#eaf6f8', transparent: true, opacity: 0.4, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; g.add(m); return { m, f: i / 8, perp: ((i * 37) % 10 - 5) * 0.12 };
  });
  /* los peces del río: sombras bajo el agua que de tanto en tanto saltan, con su anillo (19, 23 y 29 s, como el 2D) */
  const peces = [0, 1, 2].map(i => {
    const p = new THREE.Group(); p.userData.vivo = true;
    const cu = K.malla(K.esfera(0.11), '#5e8f9e', { sombra: false, sinTinta: true }); cu.scale.set(0.45, 0.4, 1); p.add(cu);
    const co = K.malla(K.cono(0.07, 0.13, 4), '#5e8f9e', { sombra: false, sinTinta: true }); co.rotation.x = Math.PI / 2; co.position.z = -0.14; co.scale.x = 0.3; p.add(co);
    const anillo = new THREE.Mesh(new THREE.RingGeometry(0.18, 0.22, 24), new THREE.MeshBasicMaterial({ color: '#eef8fb', transparent: true, opacity: 0, depthWrite: false })); anillo.rotation.x = -Math.PI / 2;
    g.add(p, anillo); return { p, anillo, u0: [0.3, 0.55, 0.72][i], per: [19, 29, 23][i], perp: [0.3, -0.25, 0.1][i] };
  });
  const api = { g, agua, pintar, nivel: nivelRio(1) };
  vivos.push(t => {
    peces.forEach((f, i) => {
      const u = f.u0 + 0.05 * Math.sin(t * 0.07 + i), p = puntoRio(u, f.perp + 0.15 * Math.sin(t * 0.3 + i)), q = puntoRio(u + 0.01, f.perp);
      const c = (t + i * 7.3) % f.per, salto = c < 1.1 ? Math.sin(c / 1.1 * Math.PI) : 0;
      f.p.position.set(p.x, api.nivel - 0.09 + salto * 0.5, p.z); f.p.rotation.y = Math.atan2(q.x - p.x, q.z - p.z) + Math.PI; f.p.rotation.x = salto ? -Math.cos(c / 1.1 * Math.PI) * 0.9 : 0;
      const ca = c - 1.1; f.anillo.position.set(p.x, api.nivel + 0.006, p.z);
      f.anillo.material.opacity = ca > 0 && ca < 2 ? 0.5 * (1 - ca / 2) : 0; f.anillo.scale.setScalar(ca > 0 ? 0.6 + ca * 1.4 : 0.6);
    });
    agua.position.y = api.nivel;
    vetas.forEach(v => {
      const u = 0.02 + ((t * 0.018 + v.f) % 1) * 0.96, p = puntoRio(u, v.perp), q = puntoRio(Math.min(1, u + 0.01), v.perp);
      v.m.position.set(p.x, api.nivel + 0.004, p.z); v.m.rotation.z = -Math.atan2(q.z - p.z, q.x - p.x);
      const dentro = p.x > E0 + 0.2 && p.x < E1 - 0.2 && p.z > E0 + 0.2 && p.z < E1 - 0.2;
      v.m.visible = dentro; v.m.material.opacity = 0.35 * Math.sin(Math.PI * ((t * 0.018 + v.f) % 1));
    });
  });
  return api;
}

/* ---------- los canales: el agua que el río presta a los campos ---------- */
export function canales(K, vivos) {
  const g = new THREE.Group(), destellos = [];
  CANALES.forEach(([ax, az, bx, bz], ci) => {
    const L = Math.hypot(bx - ax, bz - az), ang = Math.atan2(bz - az, bx - ax);
    const agua = K.malla(K.caja(L, 0.01, 0.17), '#6f9fb0', { sinTinta: true, sombra: false }); agua.position.set((ax + bx) / 2, NIVEL_CANAL, (az + bz) / 2); agua.rotation.y = -ang; g.add(agua);
    const brillo = K.malla(K.caja(L, 0.012, 0.04), '#9fcbd8', { sinTinta: true, sombra: false }); brillo.position.set((ax + bx) / 2, NIVEL_CANAL + 0.004, (az + bz) / 2); brillo.rotation.y = -ang; g.add(brillo);
    const n = [4, 3, 2][ci];
    for (let k = 0; k < n; k++) {                       // los destellos bajan del río hacia los campos
      const d = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.05), new THREE.MeshBasicMaterial({ color: '#f4fbfd', transparent: true, opacity: 0.7, depthWrite: false }));
      d.rotation.x = -Math.PI / 2; d.rotation.z = -ang; g.add(d); destellos.push({ d, a: [ax, az], b: [bx, bz], f: k / n, desdeRio: ci === 0 ? 1 : 0 });
    }
  });
  vivos.push(t => destellos.forEach(s => {
    let u = (t * 0.022 + s.f) % 1; if (s.desdeRio) u = 1 - u;   // el canal madre nace en el río (su extremo este)
    s.d.position.set(s.a[0] + (s.b[0] - s.a[0]) * u, NIVEL_CANAL + 0.008, s.a[1] + (s.b[1] - s.a[1]) * u);
    s.d.material.opacity = 0.7 * Math.sin(Math.PI * ((t * 0.022 + s.f) % 1));
  }));
  // las compuertas de adobe donde el canal sale del río y donde se reparte
  [[15.55, 10.62], [9.02, 11.25], [12.62, 10.95]].forEach(([x, z], i) => {
    const c = new THREE.Group(); c.position.set(x, 0, z); g.add(c);
    [-1, 1].forEach(l => { const p = K.malla(K.caja(0.1, 0.16, 0.1), SU.adobeD, { grosor: 0.008 }); p.position.set(l * 0.14, 0.05, 0); c.add(p); });
    const t = K.malla(K.caja(0.34, 0.04, 0.08), SU.madera, { grosor: 0.006 }); t.position.y = 0.15; c.add(t);
    c.rotation.y = i === 0 ? 0.1 : i === 1 ? 1.45 : 1.4;
  });
  return g;
}

/* ---------- los campos: surcos y la mies que cambia con el año ---------- */
/* etapa del año → { alto, color } de la mies: siembra = brotes, lluvias = verde, crecida = oro (se siega antes
   de que suba el río), verano = rastrojo */
export const MIES = {
  siembra: { h: 0.22, c: '#8fb055', n: 0.55 }, lluvias: { h: 0.55, c: '#6f9a3e', n: 1 },
  crecida: { h: 0.75, c: '#d9b650', n: 1 }, verano: { h: 0.18, c: '#c9b27a', n: 0.6 },
};
export function campos(K) {
  const g = new THREE.Group(), r = azar(2002), surcos = [], mata = [];
  for (let cx = E0; cx < E1; cx++) for (let cy = E0; cy < E1; cy++) {
    if (!esCampoSembrado(cx, cy)) continue;
    const vertical = (cx + cy) % 2 === 0;
    for (let k = 0; k < 4; k++) {
      const x = vertical ? cx + 0.16 + k * 0.23 : cx + 0.5, z = vertical ? cy + 0.5 : cy + 0.16 + k * 0.23;
      if (Math.abs(altura(x, z)) > 0.01 || dCanal(x, z) < 0.3) continue;
      surcos.push([x, z, vertical]);
      for (let m = 0; m < 5; m++) {
        const u = -0.36 + m * 0.18 + (r() - 0.5) * 0.06;
        mata.push([vertical ? x + (r() - 0.5) * 0.05 : x + u, vertical ? z + u : z + (r() - 0.5) * 0.05, r()]);
      }
    }
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  const lomos = K.instancias(K.caja(0.9, 0.05, 0.08), '#8d7446', surcos.length, { sinTinta: true, sombra: false });
  surcos.forEach(([x, z, vert], i) => { q.setFromEuler(e.set(0, vert ? Math.PI / 2 : 0, 0)); m4.compose(v.set(x, 0.02, z), q, s.set(1, 1, 1)); lomos.setMatrixAt(i, m4); });
  g.add(lomos);
  const mies = K.instancias(K.cono(0.05, 0.3, 4), '#d9b650', mata.length, { sinTinta: true });
  mies.frustumCulled = false; g.add(mies);
  const api = { g, mies, lomos, etapa: '' };
  /* la mies del año: se re-escala cuando cambia la estación (h, color) */
  api.vestir = (clave, k = 0, sig = null) => {
    const A = MIES[clave] || MIES.lluvias, B = sig ? (MIES[sig] || A) : A;
    const h = A.h + (B.h - A.h) * k, n = A.n + (B.n - A.n) * k;
    mies.material.color.set(A.c).lerp(new THREE.Color(B.c), k);
    mata.forEach(([x, z, rr], i) => {
      const vis = rr < n, hh = h * (0.75 + rr * 0.5);
      q.setFromEuler(e.set((rr - 0.5) * 0.35, rr * 6, (rr - 0.5) * 0.35));
      m4.compose(v.set(x, 0.03 + 0.15 * hh, z), q, s.set(1, vis ? hh / 0.3 : 0.001, 1)); mies.setMatrixAt(i, m4);
    });
    mies.instanceMatrix.needsUpdate = true;
  };
  return api;
}

/* ---------- el campo del templo: cebada madura todo el año, con sus gavillas ---------- */
export function campoTemplo(K) {
  const g = new THREE.Group(), R = CAMPO_TEMPLO, r = azar(88), pts = [];
  const tierra = K.malla(K.caja(R.x1 - R.x0, 0.04, R.y1 - R.y0), '#9c8250', { sinTinta: true, sombra: false }); tierra.position.set((R.x0 + R.x1) / 2, 0.01, (R.y0 + R.y1) / 2); g.add(tierra);
  const bordo = [[R.x0, R.y0, R.x1, R.y0], [R.x0, R.y1, R.x1, R.y1], [R.x0, R.y0, R.x0, R.y1], [R.x1, R.y0, R.x1, R.y1]];
  bordo.forEach(([a, b, c, d]) => { const L = Math.hypot(c - a, d - b), m = K.malla(K.caja(a === c ? 0.08 : L, 0.06, a === c ? L : 0.08), SU.adobeD, { sinTinta: true }); m.position.set((a + c) / 2, 0.03, (b + d) / 2); g.add(m); });
  for (let x = R.x0 + 0.12; x < R.x1 - 0.08; x += 0.17) for (let z = R.y0 + 0.12; z < R.y1 - 0.08; z += 0.17) pts.push([x + (r() - 0.5) * 0.06, z + (r() - 0.5) * 0.06, r()]);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  const tallos = K.instancias(K.cono(0.045, 0.42, 4), '#d7b24c', pts.length, { sinTinta: true });
  const espigas = K.instancias(K.capsula(0.025, 0.07, 0.6), '#e8c867', pts.length, { sinTinta: true, sombra: false });
  pts.forEach(([x, z, rr], i) => {
    const h = 0.85 + rr * 0.35; q.setFromEuler(e.set((rr - 0.5) * 0.3, rr * 6, (rr - 0.5) * 0.3));
    m4.compose(v.set(x, 0.21 * h, z), q, s.set(1, h, 1)); tallos.setMatrixAt(i, m4);
    m4.compose(v.set(x + (rr - 0.5) * 0.04, 0.42 * h + 0.03, z), q, s.set(1, 1, 1)); espigas.setMatrixAt(i, m4);
  });
  g.add(tallos, espigas);
  [[R.x0 + 0.35, R.y1 + 0.3], [R.x0 + 0.85, R.y1 + 0.35]].forEach(([x, z], i) => {   // las gavillas atadas, fuera del campo
    const gv = new THREE.Group(); gv.position.set(x, 0, z); gv.rotation.y = i * 0.8; g.add(gv);
    const t = K.malla(K.cilindro(0.08, 0.1, 0.34, 8), '#d7b24c', { grosor: 0.008 }); t.position.y = 0.17; gv.add(t);
    const a = K.malla(K.cilindro(0.085, 0.085, 0.04, 8), SU.atadura, { sinTinta: true }); a.position.y = 0.18; gv.add(a);
    const p = K.malla(K.cono(0.12, 0.14, 8), '#e8c867', { grosor: 0.008 }); p.position.y = 0.41; gv.add(p);
  });
  g.userData.ficha = { titulo: 'El campo del templo', texto: 'la cebada de Inanna: lo que se cosecha se cuenta, y lo contado se escribe' };
  return g;
}

/* ---------- la losa del diorama: el corte de tierra, con el río asomando por su borde ---------- */
export function losa(K, cre = 1) {
  const g = new THREE.Group(), BANDAS = [[0, PAL.labio], [-0.12, PAL.corte1], [-0.3, PAL.corte1], [-0.46, PAL.corte2]];
  /* el borde que se ve (x = E1 y z = E1) sigue el relieve: donde pasa el río, la tierra se hunde y asoma el agua */
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const h0 = altura(eje === 'x' ? fijo : u, eje === 'x' ? u : fijo), h1 = altura(eje === 'x' ? fijo : u1, eje === 'x' ? u1 : fijo);
      const top0 = Math.min(h0, 0), top1 = Math.min(h1, 0);
      quad(P(u, top0), P(u1, top1), P(u1, top1 - 0.12), P(u, top0 - 0.12), top0 < -0.03 ? '#8f9c5e' : PAL.labio);
      quad(P(u, top0 - 0.12), P(u1, top1 - 0.12), P(u1, -0.46), P(u, -0.46), PAL.corte1);
      quad(P(u, -0.46), P(u1, -0.46), P(u1, -1.05), P(u, -1.05), PAL.corte2);
      const nv = nivelRio(cre);
      if (h0 < nv || h1 < nv) quad(P(u, nv), P(u1, nv), P(u1, Math.min(nv, top1)), P(u, Math.min(nv, top0)), '#5d95a6');   // el agua asoma por el corte
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide })); m.receiveShadow = false; return m;
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const caja = (w, h, d, x, y, z, color) => { const m = K.malla(K.caja(w, h, d), color, { grosor: 0.03, sombra: false, recibe: false }); m.position.set(x, y, z); g.add(m); };
  caja(LADO, 0.46, 0.06, CENTRO, -0.23, E0 + 0.03, PAL.corte1); caja(0.06, 0.46, LADO, E0 + 0.03, -0.23, CENTRO, PAL.corte1);   // los bordes que no se ven
  caja(LADO - 0.02, 0.6, LADO - 0.02, CENTRO, -0.76, CENTRO, PAL.corte2);
  const r = azar(1999);
  for (let i = 0; i < 16; i++) {                      // piedritas y tiestos en el corte
    const izq = r() < 0.5, s = E0 + 0.4 + r() * (LADO - 0.8), y = -(0.3 + r() * 0.65), rr = 0.06 + r() * 0.06;
    const p = K.malla(K.roca(rr, 30 + i), i % 4 ? PAL.piedrita : SU.terracotaD, { sinTinta: true, sombra: false, recibe: false }); p.scale.set(1.4, 0.8, 1.4);
    if (izq) p.position.set(s, y, E1 + 0.005); else p.position.set(E1 + 0.005, y, s);
    if (altura(izq ? s : E1, izq ? E1 : s) > -0.05) g.add(p);
  }
  return g;
}

/* ---------- lo pisado: el patio de tierra apisonada de la edubba y los senderos que lo unen ---------- */
const SENDEROS = [[[7.6, 7.7], [6.9, 7.2], [6.2, 6.95]], [[11.9, 9.6], [13.2, 10.6], [14.6, 11.3], [15.3, 11.8]], [[12.2, 7.4], [14.0, 7.2], [15.6, 6.6]], [[8.6, 10.2], [8.9, 11.1]]];
export function pisado(K) {
  const g = new THREE.Group(), r = azar(313);
  const forma = new THREE.Shape(), pts = [[7.55, 7.3], [11.2, 7.15], [12.95, 7.6], [13.05, 9.9], [11.2, 10.25], [7.7, 10.1], [7.35, 8.6]];
  pts.forEach(([x, z], i) => i ? forma.lineTo(x, -z) : forma.moveTo(x, -z));
  const geo = new THREE.ShapeGeometry(forma); geo.rotateX(-Math.PI / 2);
  const patio = new THREE.Mesh(geo, K.mat('#c8ae7c', { transparent: true, opacity: 0.55, depthWrite: false })); patio.position.y = 0.004; patio.receiveShadow = true; g.add(patio);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), eje = new THREE.Vector3(0, 1, 0), pasos = [];
  for (const tramo of SENDEROS) for (let i = 0; i < tramo.length - 1; i++) {
    const [a, b] = [tramo[i], tramo[i + 1]], n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 3.4);
    for (let k = 0; k < n; k++) pasos.push([a[0] + (b[0] - a[0]) * k / n + (r() - 0.5) * 0.3, a[1] + (b[1] - a[1]) * k / n + (r() - 0.5) * 0.3, r() * 3]);
  }
  const huellas = K.instancias(K.cilindro(0.16, 0.16, 0.01, 12), '#a88e5c', pasos.length, { sinTinta: true, sombra: false, transparent: true, opacity: 0.38, depthWrite: false });
  pasos.forEach(([x, z, a], i) => { q.setFromAxisAngle(eje, a); m4.compose(v.set(x, 0.006, z), q, s.set(1, 1, 0.55)); huellas.setMatrixAt(i, m4); });
  g.add(huellas);
  return g;
}
export function barrio(K) {
  const g = new THREE.Group();
  CASAS.forEach(([x, z, w, d, ry], i) => {
    const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c);
    const H = 0.5 + (i % 2) * 0.12;
    const cuerpo = K.malla(K.caja(w, H, d), i % 2 ? SU.adobe : SU.adobeL, { grosor: 0.012 }); cuerpo.position.y = H / 2; c.add(cuerpo);
    const techo = K.malla(K.caja(w + 0.04, 0.06, d + 0.04), SU.adobeD, { grosor: 0.01 }); techo.position.y = H + 0.03; c.add(techo);
    for (let k = 0; k < 4; k++) { const v = K.malla(K.cilindro(0.022, 0.022, 0.12, 6), SU.palmaD, { grosor: 0.004 }); v.rotation.x = Math.PI / 2; v.position.set(-w / 2 + 0.15 + k * (w - 0.3) / 3, H - 0.03, d / 2 + 0.05); c.add(v); }
    const puerta = K.malla(K.caja(0.16, 0.28, 0.02), '#3a2a1c', { sinTinta: true }); puerta.position.set(w * 0.2, 0.14, d / 2 + 0.005); c.add(puerta);
    const ven = K.malla(K.caja(0.1, 0.06, 0.02), '#3a2a1c', { sinTinta: true }); ven.position.set(-w * 0.25, H * 0.7, d / 2 + 0.005); c.add(ven);
    if (i % 2 === 0) { const tol = K.malla(K.caja(w * 0.6, 0.02, 0.3), SU.estera, { grosor: 0.004 }); tol.position.set(0, H + 0.2, 0); c.add(tol); [-1, 1].forEach(l => { const p = K.malla(K.cilindro(0.015, 0.015, 0.2, 5), SU.madera, { sinTinta: true }); p.position.set(l * w * 0.28, H + 0.1, 0); c.add(p); }); }   // la sombra de caña en la azotea
    const tin = K.malla(K.cilindro(0.08, 0.1, 0.22, 10), SU.terracota, { grosor: 0.006 }); tin.position.set(w / 2 + 0.12, 0.11, d / 2 - 0.12); c.add(tin);
  });
  g.userData.ficha = { titulo: 'El barrio', texto: 'las casas de la ciudad, de adobe y techo plano, alrededor del templo' };
  return g;
}

/* ---------- lo que crece: datileras, tamariscos, carrizos y el pasto ralo del limo ---------- */
export const PALMERAS = [[2.8, 4.7, 1.7], [16.0, 5.7, 1.5], [4.0, 13.0, 1.6], [2.6, 7.1, 1.45], [3.2, 8.3, 1.3], [2.5, 15.6, 1.55], [3.6, 16.6, 1.35],
  [17.3, 5.0, 1.6], [7.2, 16.9, 1.5], [6.2, 15.4, 1.3], [13.9, 2.7, 1.45], [2.7, 11.2, 1.4], [17.4, 2.6, 1.3]];
export const TAMARISCOS = [[3.4, 5.9], [5.1, 16.4], [2.6, 13.9], [12.8, 3.6]];
/* el barrio: casas de adobe con techo plano y su patio, en el rincón del noreste (la ciudad que rodea al templo) */
export const CASAS = [[15.1, 3.0, 1.1, 0.9, 0.2], [16.45, 3.75, 0.95, 1.0, -0.15], [14.75, 4.55, 0.85, 0.8, 0.1], [15.75, 5.35, 0.9, 0.75, 0.05]];
export function vegetacion(K, vivos) {
  const g = new THREE.Group(), palmas = [], carrizos = [];
  PALMERAS.forEach(([x, z, h], i) => { const p = palmera(K, h, i + 1); p.position.set(x, 0, z); g.add(p); palmas.push(p); });
  TAMARISCOS.forEach(([x, z], i) => {                 // el tamarisco del desierto, con su flor rosada
    const t = new THREE.Group(); t.position.set(x, 0, z); g.add(t);
    const tr = K.malla(K.cilindro(0.04, 0.07, 0.4, 6), SU.palmaD, { grosor: 0.008 }); tr.position.y = 0.2; t.add(tr);
    [[0.3, 0, 0.5, 0, '#7f9a64'], [0.22, 0.15, 0.62, 0.05, '#93ad73'], [0.2, -0.14, 0.58, -0.05, '#7f9a64']].forEach(([r, dx, y, dz, c]) => { const m = K.malla(K.esfera(r), c); m.scale.set(1, 0.8, 1); m.position.set(dx, y, dz); t.add(m); });
    for (let k = 0; k < 6; k++) { const f = K.malla(K.esfera(0.035), '#e6a9bf', { sinTinta: true, sombra: false }); f.position.set(Math.cos(k * 1.1 + i) * 0.26, 0.55 + (k % 3) * 0.07, Math.sin(k * 1.1 + i) * 0.26); t.add(f); }
  });
  /* los carrizos de la orilla: matas que se mecen, sobre el barro húmedo, lejos del cauce hondo */
  const r = azar(71), junco = K.cilindro(0.016, 0.026, 0.6, 4);
  for (let k = 0; k < 34;) {
    const u = 0.1 + r() * 0.8, lado = r() < 0.5 ? -1 : 1, p = puntoRio(u, lado * (1.02 + r() * 0.3));
    if (p.x < E0 + 0.3 || p.x > E1 - 0.3 || p.z < E0 + 0.3 || p.z > E1 - 0.3 || dCanal(p.x, p.z) < 0.4) { k++; continue; }
    const mata = new THREE.Group(); mata.userData.vivo = true; mata.position.set(p.x, altura(p.x, p.z), p.z); g.add(mata); carrizos.push(mata);
    for (let j = 0; j < 7; j++) {                     // tallos finos, hojas en abanico y algún penacho de flor
      const h = 0.45 + r() * 0.75, c = K.malla(junco, '#869648', { sinTinta: true });
      c.scale.set(0.8, h, 0.8); const a = (j / 7) * Math.PI * 2 + r(); c.position.set(Math.cos(a) * 0.08, 0.3 * h, Math.sin(a) * 0.08); c.rotation.set(Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3); mata.add(c);
      if (j % 3 === 0) { const e = K.malla(K.capsula(0.04, 0.12, 0.6), '#d9c89a', { sinTinta: true }); e.scale.set(0.8, 1, 0.8); e.position.set(c.position.x * 1.9 + Math.cos(a) * 0.05, 0.6 * h + 0.02, c.position.z * 1.9 + Math.sin(a) * 0.05); e.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); mata.add(e); }   // el penacho de la flor, que se dobla
      if (j % 2) { const hoja = K.malla(K.caja(0.03, 0.005, 0.32), '#869648', { sinTinta: true }); hoja.position.set(Math.cos(a) * 0.14, 0.18 + r() * 0.12, Math.sin(a) * 0.14); hoja.rotation.set(0.9, a, 0); mata.add(hoja); }
    }
    fundir(K, mata); k++;
  }
  /* el pasto ralo del limo y alguna flor, fuera de lo construido, del agua y de lo sembrado */
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
  const lugares = [];
  for (let k = 0; k < 900 && lugares.length < 150; k++) {
    const x = E0 + 0.3 + r() * (LADO - 0.6), z = E0 + 0.3 + r() * (LADO - 0.6);
    if (altura(x, z) < -0.01 || dCanal(x, z) < 0.3 || enPatio(x, z) || enZigurat(x, z) || tipoBaldosa(Math.floor(x), Math.floor(z)) === 'campo' || CASAS.some(([cx, cz]) => Math.hypot(x - cx, z - cz) < 0.8)) continue;
    if (x > CAMPO_TEMPLO.x0 - 0.2 && x < CAMPO_TEMPLO.x1 + 0.2 && z > CAMPO_TEMPLO.y0 - 0.2 && z < CAMPO_TEMPLO.y1 + 0.6) continue;
    lugares.push([x, z]);
  }
  const pasto = K.instancias(K.cono(0.05, 0.26, 4), '#8f9a4e', lugares.length * 3, { sinTinta: true, sombra: false });
  lugares.forEach(([x, z], i) => { for (let j = 0; j < 3; j++) { e.set((r() - 0.5) * 0.7, r() * 3, (r() - 0.5) * 0.7); q.setFromEuler(e); const h = 0.7 + r() * 0.7; m4.compose(v.set(x + (r() - 0.5) * 0.16, 0.12 * h, z + (r() - 0.5) * 0.16), q, s.set(1, h, 1)); pasto.setMatrixAt(i * 3 + j, m4); } });
  g.add(pasto);
  ['#f2d16b', '#e8a7b4', '#f6f1e3'].forEach((cf, fi) => {
    const lista = lugares.filter((_, i) => i % 7 === fi), f = K.instancias(K.esfera(0.045), cf, lista.length, { sinTinta: true, sombra: false });
    lista.forEach(([x, z], i) => { m4.compose(v.set(x + 0.12, 0.05, z - 0.1), q.identity(), s.set(1, 0.7, 1)); f.setMatrixAt(i, m4); }); g.add(f);
  });
  vivos.push(t => {
    carrizos.forEach((m, i) => { m.rotation.z = 0.06 * Math.sin(t * 1.1 + i); m.rotation.x = 0.04 * Math.sin(t * 0.8 + i * 2); });
    palmas.forEach((p, i) => { const c = p.userData.copa; c.rotation.z = 0.03 * Math.sin(t * 0.7 + i); c.rotation.x = 0.02 * Math.sin(t * 0.55 + i * 1.7); });
  });
  return { g, pasto };
}
