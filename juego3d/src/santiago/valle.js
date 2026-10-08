/* ============================================================
   santiago/valle
   Santiago de Chile en 3D (Época 10): el pie de la cordillera al fondo, que sube hacia las cumbres; el Mapocho, bajo en
   verano y crecido en invierno, entre sus tajamares; la Chimba al otro lado, con sus chacras; la ciudad en damero, con sus
   calles de tierra y sus manzanas de casas de patio; la Plaza de Armas; la Alameda con sus álamos y, al sur, las chacras y
   las viñas. La geometría es la del motor (09h-santiago, espejada en lugares.js).
   ============================================================ */
import * as THREE from 'three';
import { azar, PAL } from '../kit.js';
import { SA, casa } from './monumentos.js';
import * as L from './lugares.js';

export const E0 = 2, E1 = 18, LADO = E1 - E0, CENTRO = 10;
export const NIVEL = -0.1;
export const RESERVAS = [];
export const reservado = (x, z, m = 0) => RESERVAS.some(r => r.r ? Math.hypot(x - r.x, z - r.z) < r.r + m : x > r.x0 - m && x < r.x1 + m && z > r.z0 - m && z < r.z1 + m);
export const enAlameda = (x, z) => z > L.ALAMEDA.z0 && z < L.ALAMEDA.z1 && x > L.DAMERO.x0 - 0.6 && x < L.DAMERO.x1 + 0.6;
export const enChimba = (x, z) => z < L.MAPOCHO.z0 && !L.enAndes(x, z);
export const alSur = (x, z) => z > L.ALAMEDA.z1;

const ss = k => k * k * (3 - 2 * k);
export function altura(x, z) {
  if (L.enAndes(x, z)) return 0.02 + 0.55 * ss(Math.min(1, (L.ANDES - x - z) / 3.2));
  if (z > L.MAPOCHO.z0 && z < L.MAPOCHO.z1) return Math.abs(x - L.PUENTE.x) < 0.2 ? 0 : -0.26;   // el lecho del río (el puente pasa por arriba)
  return 0;
}

/* ---------- las casas de patio: una por lado de cada manzana libre, mirando a su calle ---------- */
export const CASAS = (() => {
  const out = [], r = azar(1541), P = L.DAMERO, hueco = P.paso - P.calle;
  for (let i = 0; i < Math.round((P.x1 - P.x0) / P.paso); i++) for (let j = 0; j < Math.round((P.y1 - P.y0) / P.paso); j++) {
    const cx = P.x0 + (i + 0.5) * P.paso, cz = P.y0 + (j + 0.5) * P.paso;
    out.push([cx, cz + hueco / 2 - 0.13, 0, hueco - 0.04, 0.26, r()]);            // el lado sur, a la calle de enfrente
    out.push([cx, cz - hueco / 2 + 0.13, Math.PI, hueco - 0.04, 0.26, r()]);      // el norte
    out.push([cx - hueco / 2 + 0.13, cz, -Math.PI / 2, hueco - 0.6, 0.26, r()]); // el poniente
    out.push([cx + hueco / 2 - 0.13, cz, Math.PI / 2, hueco - 0.6, 0.26, r()]);  // el oriente
  }
  return out;
})();

/* ---------- el suelo ---------- */
export function suelo(K) {
  const RES = 5, N = LADO * RES, s = 1 / RES, pos = [], hondo = [], cen = [];
  const tri = (a, b, d) => { for (const q of [a, b, d]) pos.push(q[0], q[1], q[2]); hondo.push((a[1] + b[1] + d[1]) / 3); cen.push((a[0] + b[0] + d[0]) / 3, (a[2] + b[2] + d[2]) / 3); };
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s, v = (x, z) => [x, altura(x, z), z];
    tri(v(x0, z0), v(x0, z1), v(x1, z0)); tri(v(x1, z0), v(x0, z1), v(x1, z1));
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const col = new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3); geo.setAttribute('color', col);
  geo.computeVertexNormals();
  const c = new THREE.Color(), c2 = new THREE.Color();
  const pintar = pal => {
    for (let t = 0; t < hondo.length; t++) {
      const h = hondo[t], x = cen[2 * t], z = cen[2 * t + 1], tab = Math.abs(Math.floor(x * 2) * 7 + Math.floor(z * 2) * 13) % 5;
      if (L.enAndes(x, z)) c.set(pal.campo[tab]).lerp(c2.set('#8a8068'), 0.55 + 0.3 * Math.min(1, (L.ANDES - x - z) / 3));   // el pie de la cordillera: tierra y espino
      else if (Math.hypot(x - L.PLAZA.x, z - L.PLAZA.y) < 0.46) c.set(((Math.floor(x * 5) + Math.floor(z * 5)) % 2) ? '#c8b894' : '#bfae8a');   // la plaza
      else if (L.enDamero(x, z) && L.enCalle(x, z)) c.set('#c4ae88');                                                       // las calles de tierra
      else if (L.enDamero(x, z)) c.set(pal.campo[tab]).lerp(c2.set('#a89a78'), 0.5);                                        // los patios
      else if (enAlameda(x, z)) c.set('#cbb894');                                                                           // el paseo
      else if (alSur(x, z)) c.set(pal.campo[tab]).lerp(c2.set(Math.floor(x * 1.6) % 3 === 0 ? '#7a8a4a' : '#9aa25a'), 0.4);   // las chacras y las viñas
      else c.set(pal.campo[tab]).lerp(c2.set('#9a9a62'), 0.35);                                                             // la Chimba y las orillas
      if (h < -0.03) c.lerp(c2.set('#6a5e4a'), Math.min(1, (-h - 0.03) / 0.15));
      for (let k = 0; k < 3; k++) col.setXYZ(t * 3 + k, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };
  const m = K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false });
  m.userData.suelo = true; m.userData.pintar = pintar; m.userData.vivo = true;
  return m;
}

/* ---------- el agua del Mapocho: una franja turbia que sube y baja con el año, con su corriente ---------- */
export function agua(K, vivos) {
  const g = new THREE.Group(), x0 = E0, x1 = E1;
  const geo = new THREE.PlaneGeometry(x1 - x0, L.MAPOCHO.z1 - L.MAPOCHO.z0 - 0.04, 32, 1); geo.rotateX(-Math.PI / 2); geo.userData.propia = true;
  const rio = new THREE.Mesh(geo, K.mat('#7a9a92', { transparent: true, opacity: 0.92 })); rio.position.set((x0 + x1) / 2, NIVEL, (L.MAPOCHO.z0 + L.MAPOCHO.z1) / 2); rio.receiveShadow = true; rio.userData.vivo = true; g.add(rio);
  const onda = new THREE.PlaneGeometry(0.34, 0.025); onda.userData.propia = true;
  const olas = [], rr = azar(1782);
  for (let k = 0; k < 16; k++) { const m = new THREE.Mesh(onda, new THREE.MeshBasicMaterial({ color: '#eae4d4', transparent: true, opacity: 0.3, depthWrite: false })); m.rotation.x = -Math.PI / 2; g.add(m); olas.push({ m, x: x0 + rr() * (x1 - x0), z: L.MAPOCHO.z0 + 0.12 + rr() * 0.36, f: rr() }); }
  vivos.push(t => olas.forEach(o => { const f = (t * 0.1 + o.f) % 1; let x = o.x + f * 1.2; if (x > x1 - 0.2) x -= (x1 - x0 - 0.4); o.m.position.set(x, rio.position.y + 0.006, o.z); o.m.material.opacity = Math.abs(x - L.PUENTE.x) < 0.3 ? 0 : 0.28 * Math.sin(Math.PI * f); }));
  /* los tajamares: los muros de piedra de las dos orillas */
  [L.MAPOCHO.z0, L.MAPOCHO.z1].forEach(z => { const m = K.malla(K.caja(x1 - x0, 0.3, 0.06), SA.piedra, { grosor: 0.004 }); m.position.set((x0 + x1) / 2, -0.12, z); g.add(m); });
  return { g, rio };
}

/* ---------- la losa del diorama ---------- */
export function losa(K) {
  const g = new THREE.Group();
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const xa = eje === 'x' ? fijo : u, za = eje === 'x' ? u : fijo, xb = eje === 'x' ? fijo : u1, zb = eje === 'x' ? u1 : fijo;
      const h0 = altura(xa, za), h1 = altura(xb, zb);
      quad(P(u, h0), P(u1, h1), P(u1, Math.min(h1, 0) - 0.1), P(u, Math.min(h0, 0) - 0.1), h0 < -0.03 ? '#6a6248' : '#c4ae88');
      quad(P(u, Math.min(h0, 0) - 0.1), P(u1, Math.min(h1, 0) - 0.1), P(u1, -0.46), P(u, -0.46), PAL.corte1);
      quad(P(u, -0.46), P(u1, -0.46), P(u1, -1.05), P(u, -1.05), PAL.corte2);
      if (h0 < NIVEL || h1 < NIVEL) quad(P(u, NIVEL), P(u1, NIVEL), P(u1, Math.min(NIVEL, h1)), P(u, Math.min(NIVEL, h0)), '#6a6a58');
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals(); geo.userData.propia = true;
    const m = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide })); m.receiveShadow = false; return m;
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const caja = (w, h, d, x, y, z, color) => { const m = K.malla(K.caja(w, h, d), color, { grosor: 0.03, sombra: false, recibe: false }); m.position.set(x, y, z); g.add(m); };
  caja(LADO, 0.46, 0.06, CENTRO, -0.23, E0 + 0.03, PAL.corte1); caja(0.06, 0.46, LADO, E0 + 0.03, -0.23, CENTRO, PAL.corte1);
  caja(LADO - 0.02, 0.6, LADO - 0.02, CENTRO, -0.76, CENTRO, PAL.corte2);
  const r = azar(1842);
  for (let i = 0; i < 16; i++) {                        // los cantos rodados del Mapocho y la greda de las tejas
    const izq = r() < 0.5, s = E0 + 0.4 + r() * (LADO - 0.8), y = -(0.3 + r() * 0.65), rr = 0.05 + r() * 0.06;
    const p = K.malla(K.roca(rr, 180 + i), i % 3 ? PAL.piedrita : SA.teja, { sinTinta: true, sombra: false, recibe: false }); p.scale.set(1.4, 0.8, 1.4);
    if (izq) p.position.set(s, y, E1 + 0.005); else p.position.set(E1 + 0.005, y, s);
    g.add(p);
  }
  return g;
}

/* ---------- las casas de patio ---------- */
export function casas(K) {
  const g = new THREE.Group(), puestas = []; g.userData.puestas = puestas;
  CASAS.forEach(([x, z, rot, w, d, k], i) => {
    if (reservado(x, z, 0.02) || w < 0.15) return;
    const c = casa(K, w, d, 0.24 + k * 0.06, { zaguan: k > 0.3, tono: i }); c.position.set(x, 0, z); c.rotation.y = rot; g.add(c); puestas.push([x, z, w, d, rot, i]);
  });
  return g;
}

/* ---------- lo que crece: los álamos de la Alameda, los naranjos de los patios, las viñas del sur, el espino del cerro ---------- */
export function vegetacion(K, vivos) {
  const g = new THREE.Group(), r = azar(1810);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
  const alamos = [];
  for (let x = L.DAMERO.x0 - 0.4; x < L.DAMERO.x1 + 0.5; x += 0.32) for (const z of [L.ALAMEDA.z0 + 0.08, L.ALAMEDA.z1 - 0.08]) alamos.push([x, z, r()]);
  for (let x = E0 + 0.3; x < E1 - 0.2; x += 0.42) if (!L.enAndes(x, L.MAPOCHO.z0 - 0.2)) alamos.push([x, L.MAPOCHO.z0 - 0.22, r()]);   // los álamos de la orilla de la Chimba
  const tr = K.instancias(K.cilindro(0.012, 0.018, 1, 5), '#6a5a42', alamos.length, { grosor: 0.002 });
  const co = K.instancias(K.cono(1, 1, 6), '#6f8a3a', alamos.length, { grosor: 0.006 });
  alamos.forEach(([x, z, k], i) => { const h = 0.55 + k * 0.2; m4.compose(v.set(x, 0.12, z), q.identity(), s.set(1, 0.24, 1)); tr.setMatrixAt(i, m4); m4.compose(v.set(x, 0.24 + h / 2, z), q.identity(), s.set(0.07, h, 0.07)); co.setMatrixAt(i, m4); });
  /* los naranjos y limoneros de los patios */
  const nar = [];
  for (let i = 0; i < 12; i++) for (let j = 0; j < 5; j++) { const cx = L.DAMERO.x0 + (i + 0.5) * L.DAMERO.paso, cz = L.DAMERO.y0 + (j + 0.5) * L.DAMERO.paso; if (r() < 0.6 && !reservado(cx, cz, 0)) nar.push([cx + (r() - 0.5) * 0.2, cz + (r() - 0.5) * 0.15]); }
  const nt = K.instancias(K.esfera(1, 0.5), '#4f7a3a', Math.max(1, nar.length), { grosor: 0.005 });
  nar.forEach(([x, z], i) => { m4.compose(v.set(x, 0.18, z), q.identity(), s.set(0.13, 0.12, 0.13)); nt.setMatrixAt(i, m4); });
  /* las viñas del sur y las chacras de la Chimba, en hileras */
  const vid = [];
  for (let x = E0 + 0.3; x < E1 - 0.2; x += 0.16) for (let z = L.ALAMEDA.z1 + 0.35; z < E1 - 0.2; z += 0.14) if (Math.floor(x / 2) % 2 === 0) vid.push([x, z]);
  for (let x = E0 + 0.3; x < E1 - 0.2; x += 0.18) for (let z = E0 + 0.3; z < L.MAPOCHO.z0 - 0.45; z += 0.16) if (!L.enAndes(x, z) && Math.floor(x / 1.5) % 2 === 1) vid.push([x, z]);
  const vi = K.instancias(K.esfera(1, 0.4), '#6f8a3a', Math.max(1, vid.length), { sinTinta: true });
  vid.forEach(([x, z], i) => { m4.compose(v.set(x, 0.04, z), q.identity(), s.set(0.05, 0.04, 0.035)); vi.setMatrixAt(i, m4); });
  /* el espino de las faldas */
  const esp = [];
  for (let k = 0; k < 1200 && esp.length < 70; k++) { const x = E0 + r() * 6, z = E0 + r() * 6; if (L.enAndes(x, z) && L.ANDES - x - z < 2.6) esp.push([x, z, r()]); }
  const es = K.instancias(K.esfera(1, 0.4), '#7a7a4a', Math.max(1, esp.length), { grosor: 0.004 });
  esp.forEach(([x, z, k], i) => { m4.compose(v.set(x, altura(x, z) + 0.05, z), q.identity(), s.set(0.08, 0.06, 0.08)); es.setMatrixAt(i, m4); });
  g.add(tr, co, nt, vi, es);
  return {
    g,
    vestir(i, k, j) {                                   // los álamos: verde claro, verde, oro del otoño, desnudos y grises; las viñas, verdes y en otoño rojas
      const C = ['#8aa04a', '#6f8a3a', '#e0b83a', '#8a8070'], Vd = ['#7a9a4a', '#6f8a3a', '#a84a2a', '#7a6a5a'];
      co.material.color.copy(new THREE.Color(C[i]).lerp(new THREE.Color(C[j]), k));
      vi.material.color.copy(new THREE.Color(Vd[i]).lerp(new THREE.Color(Vd[j]), k));
    },
  };
}
