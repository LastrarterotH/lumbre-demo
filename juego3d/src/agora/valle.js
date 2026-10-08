/* ============================================================
   agora/valle
   El llano de Atenas en 3D: el campo del Ática (pasto seco que el año viste: verde en primavera, dorado en
   verano, ocre en otoño, verde gris con las lluvias), el arroyo del Ilisos que cruza la esquina del sureste
   con su orilla de juncos, el agnocasto y el plátano del Fedro, el empedrado del ágora con el altar de los
   Doce Dioses y el mojón que dice «soy el límite del ágora», la Vía Panatenaica, las casas de la ciudad,
   el olivar con sus colmenas, los cipreses y la losa del diorama.
   La geometría del arroyo es la del motor 2D (ILISOS, ejeIlisos, ilisosAgua de 09b-agora): la querencia de
   los materiales, las colmenas y los toques caen donde el motor los espera.
   ============================================================ */
import * as THREE from 'three';
import { azar, PAL } from '../kit.js';
import { AT, olivo, platano, colmena, herma, altar } from './monumentos.js';

const ubic = (m, x, y, z, rx = 0, ry = 0, rz = 0) => { m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx, ry, rz); return m; };
export const E0 = 2, E1 = 18, LADO = E1 - E0, CENTRO = 10;
export const ILISOS = { ax: 19.2, ay: 8.4, bx: 11.0, by: 20.0 };
const DX = ILISOS.bx - ILISOS.ax, DY = ILISOS.by - ILISOS.ay, L = Math.hypot(DX, DY), L2 = L * L;
const NN = { x: -DY / L, y: DX / L };
export function ejeIlisos(u) { return { x: ILISOS.ax + DX * u + Math.sin(u * 7.1) * 0.22, y: ILISOS.ay + DY * u + Math.cos(u * 5.3) * 0.16 }; }
export function puntoIlisos(u, perp = 0) { const m = ejeIlisos(u); return { x: m.x + NN.x * perp, z: m.y + NN.y * perp }; }
export function enIlisos(x, z) {
  const t = ((x - ILISOS.ax) * DX + (z - ILISOS.ay) * DY) / L2, m = ejeIlisos(t), e = (x - m.x) * NN.x + (z - m.y) * NN.y;
  return { t, e, d: Math.abs(e) };
}
export const aguaDe = cre => 0.62 * cre;                 // ilisosAgua(): el semiancho del agua, que crece con las lluvias

/* ---------- el relieve: el lecho angosto del arroyo y su orilla; lo demás es llano ---------- */
const ss = k => k * k * (3 - 2 * k);
function perfil(d) {
  if (d < 0.35) return -0.22;
  if (d < 0.78) return -0.22 + 0.16 * ss((d - 0.35) / 0.43);
  if (d < 1.08) return -0.06 + 0.06 * ss((d - 0.78) / 0.3);
  return 0;
}
export const altura = (x, z) => perfil(enIlisos(x, z).d);
export const nivelIlisos = cre => perfil(aguaDe(cre));

/* ---------- dónde vive cada cosa del llano ---------- */
export const PLAZA = { x0: 8.3, x1: 11.6, z0: 6.85, z1: 9.7 };                   // el empedrado del ágora
export const ALTAR12 = { x: 8.95, y: 8.95 };                                       // el altar de los Doce Dioses: el kilómetro cero de Atenas
export const HORO = { x: 8.45, y: 9.55 };                                          // el mojón del ágora, en la esquina de la plaza
export const VIA = [[16.9, 12.4], [13.2, 10.1], [11.2, 8.9], [8.2, 7.6], [6.6, 6.2], [4.0, 5.6], [2.4, 4.6]];   // la Vía Panatenaica, del Dipilón a la Acrópolis
export const OLIVOS = [[3.55, 6.9, 0.95], [4.6, 6.75, 0.8], [3.6, 8.95, 0.85], [5.85, 9.0, 0.85], [5.9, 6.0, 0.7]];   // en 3D, por el borde del olivar: el centro es de la Academia
export const COLMENAS = [[4.0, 9.85], [5.2, 9.75]];
export const PLATANO = { x: 14.4, y: 12.9 };
/* el campo del Ática fuera de la ciudad: la viña, la era de trillar, el pozo, más olivos y, cruzando el Ilisos, el
   altar de Bóreas, donde el viento del norte raptó a Oritía (Fedro, 229b-c) */
export const VINA = { x0: 5.2, x1: 8.4, z0: 13.6, z1: 16.6 };
export const ERA = { x: 3.55, y: 15.3 }, POZO = { x: 6.15, y: 11.75 }, BOREAS = { x: 15.9, y: 15.7 };
export const OLIVOS_CAMPO = [[8.9, 12.2, 0.9], [2.9, 17.1, 0.85], [9.6, 16.9, 0.8], [16.6, 17.0, 0.8], [13.6, 17.2, 0.75], [16.9, 8.4, 0.75]];
export const CIPRESES = [[2.6, 13.4, 1.0], [2.85, 14.6, 0.85], [16.9, 3.0, 1.0], [17.4, 4.3, 0.85], [7.6, 16.9, 0.9], [17.4, 6.1, 0.8]];
/* las casas de la ciudad (las del 2D): [x0, z0, ancho, fondo, alto, lo que tienen a la puerta] */
export const CASAS = [[3.15, 10.6, 0.85, 0.9, 0.4, 'tinaja'], [4.2, 10.35, 0.95, 0.8, 0.48, 'telar'], [3.45, 11.85, 0.8, 0.75, 0.36, '']];
function dSeg(x, z, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], q = dx * dx + dz * dz;
  let t = ((x - a[0]) * dx + (z - a[1]) * dz) / q; t = Math.max(0, Math.min(1, t));
  return Math.hypot(x - (a[0] + t * dx), z - (a[1] + t * dz));
}
export const dVia = (x, z) => { let d = 9; for (let i = 0; i < VIA.length - 1; i++) d = Math.min(d, dSeg(x, z, VIA[i], VIA[i + 1])); return d; };
export const enPlaza = (x, z) => x > PLAZA.x0 && x < PLAZA.x1 && z > PLAZA.z0 && z < PLAZA.z1;

/* los sitios que ocupa la época (monumentos, casas, saberes): ahí no crecen matas */
export const RESERVAS = [];
export const reservado = (x, z, m = 0) => RESERVAS.some(r => r.r ? Math.hypot(x - r.x, z - r.z) < r.r + m : x > r.x0 - m && x < r.x1 + m && z > r.z0 - m && z < r.z1 + m);

/* qué es cada baldosa: la orilla del arroyo, el empedrado, la vía o el campo */
export function tipoBaldosa(cx, cz) {
  const x = cx + 0.5, z = cz + 0.5;
  if (enIlisos(x, z).d < 1.1) return 'ribera';
  if (enPlaza(x, z)) return 'plaza';
  return 'campo';
}

/* ---------- el suelo: celdas de ¼, pintadas por baldosa y hundidas en el lecho ---------- */
export function suelo(K) {
  const RES = 4, N = LADO * RES, s = 1 / RES, pos = [], celdas = [], hondo = [], cen = [];
  const tri = (a, b, d, cx, cz) => { for (const q of [a, b, d]) pos.push(q[0], q[1], q[2]); celdas.push(cx, cz); hondo.push((a[1] + b[1] + d[1]) / 3); cen.push((a[0] + b[0] + d[0]) / 3, (a[2] + b[2] + d[2]) / 3); };
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
  const LOSAS = ['#ddd2b8', '#d4c8ab', '#e3d9c1', '#cfc2a3', '#d9cdb1'];
  /* se repinta con el año: la paleta de la estación del Ática (ESTACIONES_AGORA del motor) */
  const pintar = pal => {
    for (let t = 0; t < hondo.length; t++) {
      const cx = celdas[2 * t], cz = celdas[2 * t + 1], tp = tipo(cx, cz), h = hondo[t], x = cen[2 * t], z = cen[2 * t + 1];
      if (enPlaza(x, z)) { const i = Math.floor(x * 2.5) * 7 + Math.floor(z * 2.5) * 13; c.set(LOSAS[Math.abs(i) % 5]); if ((Math.floor(x * 2.5) + Math.floor(z * 2.5)) % 2) c.multiplyScalar(0.97); }
      else if (dVia(x, z) < 0.26) c.set(Math.abs(Math.floor(x * 4) * 3 + Math.floor(z * 4) * 5) % 3 ? '#d8c9a2' : '#cfbf96');   // la vía: tierra apisonada y gravilla
      else c.set(tp === 'ribera' ? pal.ribera : pal.campo[Math.abs(cx * 7 + cz * 13) % 5]);
      if (h < -0.015) c.lerp(c2.set(pal.humedo), Math.min(1, -h / 0.08));             // la orilla mojada
      if (h < -0.12) c.lerp(c2.set('#6a6650'), Math.min(0.75, (-h - 0.12) / 0.1));      // el lecho de cantos, bajo el agua
      for (let k = 0; k < 3; k++) col.setXYZ(t * 3 + k, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };
  const m = K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false });
  m.userData.suelo = true; m.userData.pintar = pintar; m.userData.vivo = true;
  return m;
}

/* ---------- el agua del Ilisos: angosta, clara y ligera; crece con las lluvias del invierno ---------- */
export function rio(K, vivos) {
  const g = new THREE.Group(), RES = 4, s = 1 / RES, pos = [], prof = [];
  for (let i = 0; i < LADO * RES; i++) for (let j = 0; j < LADO * RES; j++) {
    const x0 = E0 + i * s, z0 = E0 + j * s, x1 = x0 + s, z1 = z0 + s;
    const hs = [altura(x0, z0), altura(x1, z0), altura(x0, z1), altura(x1, z1)];
    if (Math.min(...hs) > -0.012 || enIlisos(x0 + s / 2, z0 + s / 2).d > 1.0) continue;
    const q = [[x0, z0, hs[0]], [x0, z1, hs[2]], [x1, z0, hs[1]], [x1, z0, hs[1]], [x0, z1, hs[2]], [x1, z1, hs[3]]];
    for (const [x, z, h] of q) { pos.push(x, 0, z); prof.push(h); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  const col = new THREE.Float32BufferAttribute(new Float32Array(pos.length), 3); geo.setAttribute('color', col);
  geo.computeVertexNormals(); geo.userData.propia = true;
  const agua = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, transparent: true, opacity: 0.86 })); agua.receiveShadow = true; agua.userData.vivo = true; g.add(agua);
  const c = new THREE.Color(), c2 = new THREE.Color();
  const pintar = pal => {
    for (let i = 0; i < prof.length; i++) {
      const k = Math.min(1, Math.max(0, (-prof[i] - 0.05) / 0.17));
      if (k < 0.5) c.set(pal.aguaBaja).lerp(c2.set(pal.cauce), k * 2); else c.set(pal.cauce).lerp(c2.set(pal.hondo), (k - 0.5) * 2);
      col.setXYZ(i, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };
  const api = { g, agua, pintar, nivel: nivelIlisos(1), crecida: 1 };
  /* la corriente: seis hebras claras y rápidas, y dos peces (el 2D los dibuja igual) */
  const hebra = new THREE.PlaneGeometry(0.5, 0.03);
  const vetas = Array.from({ length: 6 }, (_, i) => {
    const m = new THREE.Mesh(hebra, new THREE.MeshBasicMaterial({ color: '#f0fbff', transparent: true, opacity: 0.4, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; g.add(m); return { m, f: i * 0.31 % 1, v: 0.009 + (i % 3) * 0.003, perp: -0.6 + (i * 0.23) % 1.2 };
  });
  const peces = [{ u0: 0.3, vel: 0.006, perp: 0.3 }, { u0: 0.7, vel: -0.005, perp: -0.3 }].map(f => {
    const p = new THREE.Group(); p.userData.vivo = true;
    const cu = K.malla(K.esfera(0.08), '#3d5f6a', { sombra: false, sinTinta: true }); cu.scale.set(0.4, 0.3, 1.1); p.add(cu);
    g.add(p); return { p, ...f };
  });
  const dentro = p => p.x > E0 + 0.25 && p.x < E1 - 0.25 && p.z > E0 + 0.25 && p.z < E1 - 0.25;
  vivos.push(t => {
    const w = aguaDe(api.crecida);
    agua.position.y = api.nivel;
    vetas.forEach(v => {
      const f = (t * v.v + v.f) % 1, u = 0.02 + f * 0.96, p = puntoIlisos(u, v.perp * w), q = puntoIlisos(Math.min(1, u + 0.01), v.perp * w);
      v.m.position.set(p.x, api.nivel + 0.004, p.z); v.m.rotation.z = -Math.atan2(q.z - p.z, q.x - p.x);
      v.m.visible = dentro(p); v.m.material.opacity = (0.25 + 0.2 * Math.sin(t * 1.1 + v.f * 20)) * Math.sin(Math.PI * f);
    });
    peces.forEach(f => {
      const u = 0.15 + (((f.u0 + t * f.vel) % 0.7) + 0.7) % 0.7, p = puntoIlisos(u, f.perp * w), q = puntoIlisos(u + (f.vel >= 0 ? 0.012 : -0.012), f.perp * w);
      f.p.position.set(p.x, api.nivel - 0.05, p.z); f.p.rotation.y = Math.atan2(q.x - p.x, q.z - p.z); f.p.visible = dentro(p);
    });
  });
  return api;
}

/* ---------- la losa del diorama: el corte de tierra, con el Ilisos asomando por el borde ---------- */
export function losa(K) {
  const g = new THREE.Group();
  const pared = (fijo, eje) => {
    const pos = [], col = [], c = new THREE.Color(), paso = 0.125;
    const quad = (p0, p1, p2, p3, color) => { c.set(color); for (const p of [p0, p1, p2, p0, p2, p3]) { pos.push(...p); col.push(c.r, c.g, c.b); } };
    for (let u = E0; u < E1 - 1e-6; u += paso) {
      const u1 = u + paso, P = (uu, y) => eje === 'x' ? [fijo, y, uu] : [uu, y, fijo];
      const xa = eje === 'x' ? fijo : u, za = eje === 'x' ? u : fijo, xb = eje === 'x' ? fijo : u1, zb = eje === 'x' ? u1 : fijo;
      const h0 = altura(xa, za), h1 = altura(xb, zb), top0 = Math.min(h0, 0), top1 = Math.min(h1, 0);
      quad(P(u, top0), P(u1, top1), P(u1, top1 - 0.1), P(u, top0 - 0.1), top0 < -0.03 ? '#7c7c56' : '#a9a062');
      quad(P(u, top0 - 0.1), P(u1, top1 - 0.1), P(u1, -0.46), P(u, -0.46), PAL.corte1);
      quad(P(u, -0.46), P(u1, -0.46), P(u1, -1.05), P(u, -1.05), PAL.corte2);
      const nv = nivelIlisos(1);
      if (h0 < nv || h1 < nv) quad(P(u, nv), P(u1, nv), P(u1, Math.min(nv, top1)), P(u, Math.min(nv, top0)), '#5b8a98');
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.computeVertexNormals(); geo.userData.propia = true;
    const m = new THREE.Mesh(geo, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide })); m.receiveShadow = false; return m;
  };
  g.add(pared(E1, 'x'), pared(E1, 'z'));
  const caja = (w, h, d, x, y, z, color) => { const m = K.malla(K.caja(w, h, d), color, { grosor: 0.03, sombra: false, recibe: false }); m.position.set(x, y, z); g.add(m); };
  caja(LADO, 0.46, 0.06, CENTRO, -0.23, E0 + 0.03, PAL.corte1); caja(0.06, 0.46, LADO, E0 + 0.03, -0.23, CENTRO, PAL.corte1);
  caja(LADO - 0.02, 0.6, LADO - 0.02, CENTRO, -0.76, CENTRO, PAL.corte2);
  const r = azar(1999);
  for (let i = 0; i < 16; i++) {                        // piedritas y tiestos de cerámica en el corte (en Atenas, de figuras negras)
    const izq = r() < 0.5, s = E0 + 0.4 + r() * (LADO - 0.8), y = -(0.3 + r() * 0.65), rr = 0.06 + r() * 0.06;
    const p = K.malla(K.roca(rr, 70 + i), i % 4 ? PAL.piedrita : '#b5603a', { sinTinta: true, sombra: false, recibe: false }); p.scale.set(1.4, 0.8, 1.4);
    if (izq) p.position.set(s, y, E1 + 0.005); else p.position.set(E1 + 0.005, y, s);
    if (altura(izq ? s : E1, izq ? E1 : s) > -0.05) g.add(p);
  }
  return g;
}

/* ---------- la plaza: el altar de los Doce Dioses en su cerco, el mojón del ágora y los hermas ---------- */
export function plaza(K) {
  const g = new THREE.Group();
  const a = new THREE.Group(); a.position.set(ALTAR12.x, 0, ALTAR12.y); g.add(a);
  [[0, -0.36, 0.78, 0.06], [0, 0.36, 0.78, 0.06], [-0.36, 0, 0.06, 0.78], [0.36, 0, 0.06, 0.78]].forEach(([x, z, w, d], i) => {   // el parapeto del cerco, con su entrada al frente
    if (i === 1) { [-1, 1].forEach(l => { const m = K.malla(K.caja(0.26, 0.2, 0.06), AT.marmol, { grosor: 0.005 }); m.position.set(l * 0.26, 0.1, z); a.add(m); }); return; }
    const m = K.malla(K.caja(w, 0.2, d), AT.marmol, { grosor: 0.005 }); m.position.set(x, 0.1, z); a.add(m);
  });
  const al = altar(K, 0.85); a.add(al);
  /* el mojón: «ΗΟΡΟΣ ΕΙΜΙ ΤΕΣ ΑΓΟΡΑΣ», «soy el límite del ágora» (hacia 500 a. C., hallado en su lugar) */
  const h = new THREE.Group(); h.position.set(HORO.x, 0, HORO.y); g.add(h);
  h.add(ubic(K.malla(K.caja(0.16, 0.4, 0.1), AT.marmol, { grosor: 0.004 }), 0, 0.2, 0));
  const c = document.createElement('canvas'); c.width = 96; c.height = 192; const cg = c.getContext('2d');
  cg.fillStyle = AT.marmol; cg.fillRect(0, 0, 96, 192); cg.fillStyle = '#5a5246'; cg.font = '600 19px Georgia, serif'; cg.textAlign = 'center';
  ['ΗΟΡΟΣ', 'ΕΙΜΙ', 'ΤΕΣ', 'ΑΓΟ', 'ΡΑΣ'].forEach((f, i) => cg.fillText(f, 48, 36 + i * 32));
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; tx.userData.propia = true;
  const lam = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.36), K.matMapa(tx)); lam.geometry.userData.propia = true; lam.position.set(0, 0.2, 0.051); h.add(lam);
  /* los hermas de la esquina del noroeste: el pilar de Hermes que cuida las puertas y los caminos */
  [[8.05, 9.95], [7.75, 9.7]].forEach(([x, z]) => { const m = herma(K, 0.55); m.position.set(x, 0, z); m.rotation.y = 0.6; g.add(m); });
  return g;
}

/* ---------- las casas de la ciudad: muros encalados, tejas, la puerta baja y lo que tienen afuera ---------- */
export function casas(K) {
  const g = new THREE.Group();
  CASAS.forEach(([x0, z0, w, d, h, cosa], i) => {
    const c = new THREE.Group(); c.position.set(x0 + w / 2, 0, z0 + d / 2); g.add(c);
    c.add(ubic(K.malla(K.caja(w, h, d), '#f0e9d8', { grosor: 0.01 }), 0, h / 2, 0));
    pon(c, K.malla(K.caja(w + 0.02, 0.05, d + 0.02), '#d9cfb8', { sinTinta: true }), 0, 0.025, 0);   // el zócalo de piedra
    const ang = 0.42, lado = (d / 2 + 0.06) / Math.cos(ang);
    [-1, 1].forEach(l => { const t = K.malla(K.caja(w + 0.1, 0.03, lado), l < 0 ? AT.tejaD : AT.tejaL, { grosor: 0.008 }); t.rotation.x = l * ang; t.position.set(0, h + Math.sin(ang) * lado / 2 - 0.01, l * Math.cos(ang) * lado / 2); c.add(t); });
    const fr = new THREE.Shape(); fr.moveTo(-d / 2, 0); fr.lineTo(d / 2, 0); fr.lineTo(0, Math.tan(ang) * d / 2); fr.closePath();
    [-1, 1].forEach(l => { const m = K.malla(new THREE.ShapeGeometry(fr), '#e3dccb', { sinTinta: true, side: THREE.DoubleSide }); m.geometry.userData.propia = true; m.rotation.y = Math.PI / 2; m.position.set(l * w / 2, h, 0); c.add(m); });
    pon(c, K.malla(K.caja(0.2, h * 0.6, 0.02), '#4a3a28', { sinTinta: true }), w * 0.1, h * 0.3, d / 2 + 0.006);   // la puerta
    pon(c, K.malla(K.caja(0.1, 0.08, 0.02), '#4a3a28', { sinTinta: true }), -w * 0.28, h * 0.72, d / 2 + 0.006);   // el ventanuco alto
    if (cosa === 'tinaja') { const v = K.malla(K.esfera(0.09), '#b9784a', { grosor: 0.005 }); v.scale.set(1, 1.3, 1); v.position.set(w / 2 + 0.12, 0.11, d * 0.2); c.add(v); }
    if (cosa === 'telar') {                              // el telar vertical apoyado en el muro, con sus pesas de barro
      [-1, 1].forEach(l => pon(c, K.malla(K.cilindro(0.012, 0.012, 0.5, 5), AT.madera, { grosor: 0.003 }), w / 2 + 0.06, 0.25, l * 0.16));
      pon(c, K.malla(K.caja(0.02, 0.3, 0.3), '#c9b48a', { sinTinta: true }), w / 2 + 0.06, 0.3, 0);
      for (let k = 0; k < 5; k++) pon(c, K.malla(K.cono(0.018, 0.04, 5), '#a8583a', { sinTinta: true }), w / 2 + 0.07, 0.13, -0.12 + k * 0.06);
    }
  });
  return g;
}
const pon = (padre, m, x, y, z) => { m.position.set(x, y, z); padre.add(m); return m; };

/* ---------- lo que crece: olivos, el plátano y el agnocasto del Ilisos, cipreses, matas de tomillo, la hierba
   del Ática y los juncos de la orilla. La hierba y las flores cambian con el año. ---------- */
export function vegetacion(K, vivos) {
  const g = new THREE.Group(), r = azar(4004);
  [...OLIVOS, ...OLIVOS_CAMPO].forEach(([x, z, sc], i) => { const o = olivo(K, 1.55 * sc, i + 11); o.position.set(x, 0, z); o.userData.ficha = { titulo: 'El olivo', texto: 'el árbol de Atenea: de sus aceitunas sale el aceite del gimnasio y de las lámparas' }; g.add(o); });
  const pl = platano(K, 1.75, 5); pl.position.set(PLATANO.x, 0, PLATANO.y); g.add(pl);
  /* el agnocasto en flor junto al plátano: «alto y frondoso, y en plena flor» (Fedro, 230b) */
  const ag = new THREE.Group(); ag.position.set(PLATANO.x + 0.75, 0, PLATANO.y - 0.35); g.add(ag);
  [[0, 0.32, 0, 0.2], [0.14, 0.26, 0.08, 0.15], [-0.12, 0.27, -0.05, 0.15]].forEach(([x, y, z, rr]) => pon(ag, K.malla(K.esfera(rr, 0.7), '#6f8a56', { grosor: 0.004 }), x, y, z));
  for (let k = 0; k < 9; k++) { const a = k * 0.7, f = K.malla(K.cono(0.025, 0.12, 5), '#a58ac9', { sinTinta: true }); f.position.set(Math.cos(a) * 0.17, 0.42 + (k % 3) * 0.05, Math.sin(a) * 0.15); g.add(f); f.position.add(ag.position); }
  CIPRESES.forEach(([x, z, sc]) => {
    const c = new THREE.Group(); c.position.set(x, 0, z); g.add(c);
    pon(c, K.malla(K.cilindro(0.04, 0.05, 0.2, 6), AT.troncoOl, { grosor: 0.004 }), 0, 0.1, 0);
    const copa = K.malla(K.esfera(0.24 * sc, 0.8), '#3f5f3a', { grosor: 0.006 }); copa.scale.set(1, 3.4, 1); copa.position.y = 0.2 + 0.8 * sc; c.add(copa);
  });
  /* las matas (tomillo y lentisco), la hierba seca y las flores de primavera: instancias sobre el campo libre */
  const matas = [], hierba = [], flores = [], juncos = [];
  for (let k = 0; k < 2600 && (matas.length < 70 || hierba.length < 420); k++) {
    const x = E0 + 0.25 + r() * (LADO - 0.5), z = E0 + 0.25 + r() * (LADO - 0.5), d = enIlisos(x, z).d;
    if (reservado(x, z, 0.15) || enPlaza(x, z) || dVia(x, z) < 0.35 || (x > VINA.x0 - 0.2 && x < VINA.x1 + 0.2 && z > VINA.z0 - 0.2 && z < VINA.z1 + 0.2) || Math.hypot(x - ERA.x, z - ERA.y) < 1.0) continue;
    if (d < 1.15) { if (d > 0.62 && d < 1.0 && juncos.length < 90) juncos.push([x, z, r()]); continue; }
    if (r() < 0.16 && matas.length < 70) matas.push([x, z, 0.07 + r() * 0.07]);
    else if (hierba.length < 420) { hierba.push([x, z, r()]); if (r() < 0.35) flores.push([x + 0.05, z + 0.03, r()]); }
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(), e = new THREE.Euler();
  const ma = K.instancias(K.esfera(1, 0.6), '#7d8a5c', matas.length, { grosor: 0.01 });
  matas.forEach(([x, z, rr], i) => { m4.compose(v.set(x, rr * 0.55, z), q.identity(), s.set(rr * 1.3, rr * 0.9, rr * 1.3)); ma.setMatrixAt(i, m4); });
  const hi = K.instancias(K.cono(0.03, 0.16, 4), '#b8ac6a', hierba.length, { sinTinta: true });
  hierba.forEach(([x, z, rr], i) => { q.setFromEuler(e.set((rr - 0.5) * 0.5, rr * 6, (rr - 0.5) * 0.4)); m4.compose(v.set(x, 0.07, z), q, s.set(1, 0.7 + rr * 0.6, 1)); hi.setMatrixAt(i, m4); });
  const FL = ['#d9483b', '#e8e2f2', '#c27ad0'];                          // amapolas, margaritas y anémonas
  const fl = FL.map((cc, j) => { const lista = flores.filter((f, i) => i % 3 === j); const m = K.instancias(K.esfera(0.028, 0.5), cc, lista.length, { sinTinta: true, sombra: false }); lista.forEach(([x, z], i) => { m4.compose(v.set(x, 0.1, z), q.identity(), s.set(1, 0.7, 1)); m.setMatrixAt(i, m4); }); return m; });
  const ju = K.instancias(K.cono(0.018, 0.4, 4), '#7f9a5a', juncos.length, { sinTinta: true });
  juncos.forEach(([x, z, rr], i) => { q.setFromEuler(e.set((rr - 0.5) * 0.3, rr * 6, (rr - 0.5) * 0.3)); m4.compose(v.set(x, altura(x, z) + 0.18, z), q, s.set(1, 0.7 + rr * 0.6, 1)); ju.setMatrixAt(i, m4); });
  g.add(ma, hi, ju, ...fl);
  vivos.push(t => { const w = Math.sin(t * 0.8) * 0.04; ju.rotation.z = w * 0.02; });
  return {
    g, hierba: hi, flores: fl,
    /* el año: la hierba verdea en primavera y en las lluvias y se dora en verano; las flores, solo en primavera */
    vestir(i, k, j) {
      const H = ['#a9b46a', '#cdb86a', '#bba664', '#9fac72'], col = new THREE.Color(H[i]).lerp(new THREE.Color(H[j]), k);
      hi.material.color.copy(col);
      const f = (i === 0 ? 1 - k : 0) + (j === 0 ? k : 0);
      fl.forEach(m => { m.visible = f > 0.05; m.scale.setScalar(Math.max(0.05, f)); });
    },
  };
}

/* ---------- las colmenas del olivar: la querencia de la cera ---------- */
export function colmenas(K, vivos) {
  const g = new THREE.Group(), abejas = [];
  COLMENAS.forEach(([x, z], i) => {
    const c = new THREE.Group(); c.position.set(x, 0, z); c.rotation.y = 0.2 - i * 0.3; g.add(c);
    c.add(ubic(K.malla(K.caja(0.42, 0.08, 0.3), AT.rocaL, { grosor: 0.005 }), 0, 0.04, 0));   // el banco de piedra
    [-0.1, 0.1].forEach(dx => { const h = colmena(K); h.position.set(dx, 0.06, 0); c.add(h); });
    for (let k = 0; k < 4; k++) { const b = K.malla(K.esfera(0.012, 0.4), '#3a2c1c', { sinTinta: true, sombra: false }); b.userData.vivo = true; g.add(b); abejas.push({ b, x, z, k, i }); }
  });
  vivos.push(t => abejas.forEach(({ b, x, z, k, i }) => { const a = t * (2.4 + k * 0.3) + k * 1.7 + i; b.position.set(x + Math.cos(a) * (0.18 + k * 0.04), 0.2 + 0.06 * Math.sin(a * 1.3), z + 0.12 + Math.sin(a) * 0.12); }));
  return g;
}

/* ---------- el campo: la viña en hileras, la era de trillar, el pozo y el altar de Bóreas ---------- */
export function campo(K) {
  const g = new THREE.Group(), r = azar(5005);
  /* la viña: cepas bajas en hileras, cada una atada a su estaca (así las pintan los vasos del Ática) */
  const cepas = [];
  for (let z = VINA.z0 + 0.25; z < VINA.z1; z += 0.5) for (let x = VINA.x0 + 0.2; x < VINA.x1; x += 0.36) cepas.push([x + (r() - 0.5) * 0.05, z + (r() - 0.5) * 0.04, r()]);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
  const hoja = K.instancias(K.esfera(1, 0.6), '#5f8a3e', cepas.length, { grosor: 0.01 });
  const estaca = K.instancias(K.cilindro(0.008, 0.01, 0.34, 4), AT.maderaD, cepas.length, { sinTinta: true });
  const uva = K.instancias(K.esfera(0.03, 0.5), '#5a3a6a', cepas.length, { sinTinta: true, sombra: false });
  cepas.forEach(([x, z, rr], i) => {
    m4.compose(v.set(x, 0.2, z), q.identity(), s.set(0.14 + rr * 0.04, 0.11, 0.12)); hoja.setMatrixAt(i, m4);
    m4.compose(v.set(x + 0.05, 0.17, z), q.identity(), s.set(1, 1, 1)); estaca.setMatrixAt(i, m4);
    m4.compose(v.set(x - 0.06, 0.12, z + 0.08), q.identity(), s.set(1, 1.3, 1)); uva.setMatrixAt(i, m4);
  });
  g.add(hoja, estaca, uva);
  for (let z = VINA.z0 + 0.25; z < VINA.z1; z += 0.5) { const m = K.malla(K.caja(VINA.x1 - VINA.x0, 0.012, 0.16), '#a88f5c', { sinTinta: true, sombra: false }); m.position.set((VINA.x0 + VINA.x1) / 2, 0.006, z); g.add(m); }   // la tierra arada de cada hilera
  /* la era: el círculo empedrado donde se trilla el grano, con su borde de piedras */
  const era = new THREE.Group(); era.position.set(ERA.x, 0, ERA.y); g.add(era);
  era.add(ubic(K.malla(K.cilindro(0.82, 0.84, 0.03, 28), '#d6c7a2', { grosor: 0.006, sombra: false }), 0, 0.015, 0));
  for (let k = 0; k < 22; k++) { const a = k / 22 * Math.PI * 2, p = K.malla(K.roca(0.06, 300 + k), k % 2 ? AT.rocaL : AT.roca, { sinTinta: true }); p.position.set(Math.cos(a) * 0.86, 0.04, Math.sin(a) * 0.86); p.scale.set(1.2, 0.8, 1); era.add(p); }
  for (let k = 0; k < 7; k++) { const a = k * 0.9, m = K.malla(K.cono(0.05, 0.08, 5), '#d9b56b', { sinTinta: true }); m.position.set(Math.cos(a) * 0.4, 0.06, Math.sin(a) * 0.3); era.add(m); }   // las gavillas
  const pa = K.malla(K.cono(0.2, 0.32, 8), '#d9b56b', { grosor: 0.006 }); pa.position.set(0.3, 0.19, -0.25); era.add(pa);   // la parva de paja
  /* el pozo con su brocal y la polea */
  const po = new THREE.Group(); po.position.set(POZO.x, 0, POZO.y); g.add(po);
  po.add(ubic(K.malla(K.cilindro(0.17, 0.18, 0.2, 12), AT.poros, { grosor: 0.006 }), 0, 0.1, 0));
  po.add(ubic(K.malla(K.cilindro(0.13, 0.13, 0.01, 12), '#2a3a40', { sinTinta: true }), 0, 0.2, 0));
  [-1, 1].forEach(l => po.add(ubic(K.malla(K.cilindro(0.012, 0.012, 0.36, 4), AT.madera, { grosor: 0.003 }), l * 0.15, 0.36, 0)));
  po.add(ubic(K.malla(K.cilindro(0.01, 0.01, 0.34, 4), AT.madera, { grosor: 0.003 }), 0, 0.53, 0, 0, 0, Math.PI / 2));
  /* el altar de Bóreas, del otro lado del Ilisos: una piedra con su ofrenda */
  const bo = altar(K, 0.8, false); bo.position.set(BOREAS.x, 0, BOREAS.y); bo.rotation.y = 0.5; g.add(bo);
  return g;
}
