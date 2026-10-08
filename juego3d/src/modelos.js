/* ============================================================
   modelos
   Los objetos chicos que viven en dos lugares a la vez: en el mundo (las luces recogibles, lo que
   vuela al HUD, el saber que sube) y en la interfaz (los íconos, horneados con estos mismos modelos).
   Así un ocre del suelo y el ocre del contador son el mismo ocre.
   ============================================================ */
import * as THREE from 'three';
import { PAL } from './kit.js';

/* Los materiales del forrajeo, como montoncito en el suelo. */
export function modeloMaterial(K, k) {
  const g = new THREE.Group();
  if (k === 'lena') [[0, 0.06, 0, 0.3, '#8a6a4a'], [0.06, 0.06, 0.1, -0.4, '#a3805c'], [0.02, 0.15, 0.05, 0.1, '#8a6a4a']].forEach(([x, y, z, r, c]) => { const l = K.malla(K.cilindro(0.045, 0.05, 0.34, 7), c, { grosor: 0.012 }); l.rotation.set(0, r, Math.PI / 2); l.position.set(x, y, z); g.add(l); });
  else if (k === 'fibra') for (let i = 0; i < 7; i++) { const f = K.malla(K.cono(0.03, 0.34, 4), i % 2 ? '#a8904e' : '#cdb877', { grosor: 0.008 }); f.position.set((i - 3) * 0.03, 0.15, 0); f.rotation.z = (i - 3) * 0.12; g.add(f); }
  else if (k === 'ocre') [[0, 0.07, 0, 0.1], [0.1, 0.05, 0.06, 0.07], [-0.08, 0.05, 0.05, 0.065]].forEach(([x, y, z, r], i) => { const o = K.malla(K.roca(r, 120 + i), i ? '#d98a4a' : '#b8642c', { grosor: 0.01 }); o.position.set(x, y, z); g.add(o); });
  else if (k === 'hueso') [0.4, -0.5].forEach((r, i) => { const h = K.malla(K.capsula(0.03, 0.22), i ? '#f4eeda' : '#e6ddc6', { grosor: 0.01 }); h.rotation.set(0, r, Math.PI / 2); h.position.set(0, 0.04 + i * 0.05, i * 0.04); g.add(h); });
  else if (k === 'silex') [[0, 0.05, 0], [0.09, 0.04, 0.05], [-0.07, 0.04, 0.06]].forEach(([x, y, z], i) => { const s = K.malla(K.cono(0.06, 0.12, 4), i ? '#b3bcc4' : '#8f99a2', { grosor: 0.01 }); s.position.set(x, y, z); s.rotation.set(0.3 * i, i, 1.2); g.add(s); });
  else if (k === 'grano') { const h = K.malla(K.cilindro(0.07, 0.09, 0.3, 8), '#c9a84a', { grosor: 0.012 }); h.position.y = 0.15; g.add(h); const c = K.malla(K.cono(0.12, 0.14, 8), '#e4c96a', { grosor: 0.012 }); c.position.y = 0.36; g.add(c); const a = K.malla(K.toro(0.075, 0.014), '#8a6842', { sinTinta: true }); a.rotation.x = Math.PI / 2; a.position.y = 0.19; g.add(a); }
  else if (k === 'cera') {                              // el panal: dos panes de cera con sus celdas hexagonales y una abeja que lo ronda
    [[0, 0.05, 0, 0.13, '#e0b84a'], [0.09, 0.035, 0.08, 0.09, '#d4a838']].forEach(([x, y, z, r, c]) => { const p = K.malla(K.cilindro(r, r, y * 1.4, 6), c, { grosor: 0.01 }); p.position.set(x, y * 0.7, z); g.add(p);
      for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3, h = K.malla(K.cilindro(r * 0.2, r * 0.2, 0.006, 6), '#b8862a', { sinTinta: true }); h.position.set(x + Math.cos(a) * r * 0.5, y * 1.4 + 0.004, z + Math.sin(a) * r * 0.5); g.add(h); } });
    const ab = K.malla(K.esfera(0.025, 0.5), '#3a2c1c', { sinTinta: true }); ab.scale.set(1, 0.8, 1.4); ab.position.set(-0.08, 0.2, 0.05); g.add(ab);
    [-1, 1].forEach(l => { const al = K.malla(K.esfera(0.02, 0.4), '#f2f0e6', { sinTinta: true }); al.scale.set(1.2, 0.3, 0.8); al.position.set(-0.08 + l * 0.025, 0.225, 0.05); g.add(al); });
  }
  else if (k === 'atencion') {   // EL FUTURO: la atención, un rato de calma: tres anillos cálidos uno dentro de otro, como una diana, y una brasita en el centro (el contrario de la chispa azul)
    [[0.13, '#e3a23c'], [0.09, '#f6d27e'], [0.05, '#e3a23c']].forEach(([r, c], i) => { const a = K.malla(K.cilindro(r, r, 0.03 + i * 0.012, 18), c, { grosor: 0.006 }); a.position.y = 0.02 + i * 0.012; g.add(a); });
    const b = new THREE.Mesh(K.esfera(0.03, 0.5), new THREE.MeshBasicMaterial({ color: '#fff3cf' })); b.position.y = 0.08; g.add(b);
  }
  return g;
}

/* La chispa de curiosidad: una estrella dorada de cuatro puntas (una sola geometría para todas). */
const GEO_CHISPA = new THREE.OctahedronGeometry(0.16, 0);
export function chispa(K) {
  const g = new THREE.Group();
  const e = K.malla(GEO_CHISPA, '#ffd24a', { emissive: '#ffb020', emissiveIntensity: 0.8, grosor: 0.012 });
  e.scale.set(1, 1.4, 0.35); g.add(e); g.userData.estrella = e;
  return g;
}

/* El saber: un libro abierto (el 📖 del juego). */
export function libro(K) {
  const g = new THREE.Group();
  const tapa = K.malla(K.caja(0.78, 0.04, 0.54), '#8a5a2e', { grosor: 0.014 }); tapa.position.y = 0.02; g.add(tapa);
  [-1, 1].forEach(l => {
    const hoja = new THREE.Group(); hoja.rotation.z = l * 0.22; g.add(hoja);
    const h = K.malla(K.caja(0.36, 0.05, 0.48), '#f4ecd6', { grosor: 0.012 }); h.position.set(l * 0.19, 0.07, 0); hoja.add(h);
    for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(K.caja(0.24, 0.008, 0.018), K.mat('#b9a98a')); r.position.set(l * 0.19, 0.1, -0.15 + i * 0.1); hoja.add(r); }
  });
  return g;
}
export function cestoConBayas(K) {
  const g = new THREE.Group();
  const c = K.malla(K.cilindro(0.2, 0.14, 0.18, 12), '#a8844f', { grosor: 0.014 }); c.position.y = 0.09; g.add(c);
  const b = K.malla(K.toro(0.2, 0.025), '#8a6a3c', { grosor: 0.01 }); b.rotation.x = Math.PI / 2; b.position.y = 0.18; g.add(b);
  [[0, 0], [0.08, 0.05], [-0.07, 0.06], [0.03, -0.08], [-0.05, -0.05]].forEach(([x, z], i) => { const f = K.malla(K.esfera(0.055), i % 2 ? '#c94f43' : '#8c3f6a', { grosor: 0.01 }); f.position.set(x, 0.21, z); g.add(f); });
  return g;
}
export function estrella(K) {
  const s = new THREE.Shape();
  for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.14 : 0.32; i ? s.lineTo(Math.cos(a) * r, -Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, -Math.sin(a) * r); }
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 2 }); geo.center();
  const g = new THREE.Group(); const m = K.malla(geo, '#ffd24a', { emissive: '#ffb020', emissiveIntensity: 0.25, grosor: 0.014 }); m.rotation.y = 0.5; g.add(m);
  return g;
}
export function cuenco(K) {
  const g = new THREE.Group();
  const geo = new THREE.LatheGeometry([[0.001, 0], [0.12, 0.01], [0.2, 0.08], [0.22, 0.16]].map(([r, y]) => new THREE.Vector2(r, y)), 20);
  g.add(K.malla(geo, '#b98457', { grosor: 0.014 }));
  const s = K.malla(K.cilindro(0.2, 0.2, 0.01, 18), '#e8a04a', { sinTinta: true }); s.position.y = 0.14; g.add(s);
  [[-0.05, 0.28], [0.06, 0.38]].forEach(([x, y], i) => { const v = K.malla(K.esfera(0.06 - i * 0.012), '#f4efe6', { grosor: 0.01 }); v.position.set(x, y, 0); g.add(v); });
  return g;
}
export function mano(K) {
  const s = new THREE.Shape();
  s.absellipse(0, 0, 0.14, 0.16, 0, Math.PI * 2);
  const g = new THREE.Group(), mat = '#a24e30';
  const palma = K.malla(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1 }), mat, { grosor: 0.012 }); g.add(palma);
  [[-0.13, 0.12, 0.7, 0.13], [-0.06, 0.2, 0.2, 0.18], [0.02, 0.22, 0, 0.2], [0.09, 0.2, -0.15, 0.18], [0.16, 0.02, -0.9, 0.12]].forEach(([x, y, r, l]) => {
    const d = K.malla(K.capsula(0.032, l), mat, { grosor: 0.01 }); d.position.set(x, y + l / 2 - 0.02, 0.03); d.rotation.z = r; g.add(d);
  });
  g.rotation.x = -0.35;
  return g;
}
export function ovillo(K) {
  const g = new THREE.Group();
  g.add(K.malla(K.esfera(0.2), '#b8642c', { grosor: 0.014 }));
  [[0.3, 0], [1.2, 0.8], [2.1, -0.5]].forEach(([a, b]) => { const t = K.malla(K.toro(0.2, 0.018), '#d98a4a', { sinTinta: true }); t.rotation.set(a, b, 0); g.add(t); });
  const cola = K.malla(K.cilindro(0.012, 0.012, 0.3, 4), '#d98a4a', { sinTinta: true }); cola.position.set(0.22, -0.12, 0.05); cola.rotation.z = 1.2; g.add(cola);
  return g;
}
export function pez(K) {
  const g = new THREE.Group();
  const c = K.malla(K.esfera(0.2), '#5e93a6', { grosor: 0.014 }); c.scale.set(1.3, 0.62, 0.45); g.add(c);
  const cola = K.malla(K.cono(0.13, 0.18, 4), '#4d7f92', { grosor: 0.012 }); cola.rotation.z = Math.PI / 2; cola.position.x = -0.3; cola.scale.z = 0.35; g.add(cola);
  const o = K.malla(K.esfera(0.025), '#1e1612', { sinTinta: true }); o.position.set(0.16, 0.04, 0.08); g.add(o);
  g.rotation.y = -0.5;
  return g;
}
export function hierba(K) {
  const g = new THREE.Group();
  const tallo = K.malla(K.cilindro(0.012, 0.016, 0.4, 4), '#5d8a3c', { grosor: 0.008 }); tallo.position.y = 0.2; g.add(tallo);
  [[0.1, 0.22, -0.9], [-0.1, 0.28, 0.9], [0.08, 0.36, -0.7], [-0.02, 0.44, 0]].forEach(([x, y, r]) => { const h = K.malla(K.esfera(0.07, 0.6), '#7fae59', { grosor: 0.008 }); h.scale.set(0.45, 1, 0.2); h.position.set(x, y, 0); h.rotation.z = r; g.add(h); });
  return g;
}
export function tamborIcono(K) {
  const g = new THREE.Group();
  const c = K.malla(K.cilindro(0.2, 0.22, 0.34, 14), '#6e4d33', { grosor: 0.014 }); c.position.y = 0.17; g.add(c);
  const p = K.malla(K.cilindro(0.195, 0.195, 0.025, 14), '#d9b98a', { grosor: 0.01 }); p.position.y = 0.35; g.add(p);
  const b = K.malla(K.toro(0.212, 0.02), '#a24e30', { sinTinta: true }); b.rotation.x = Math.PI / 2; b.position.y = 0.2; g.add(b);
  const q = K.malla(K.cilindro(0.015, 0.02, 0.36, 5), '#8a6f4d', { grosor: 0.008 }); q.rotation.set(0.5, 0, 1.1); q.position.set(0.12, 0.45, 0.05); g.add(q);
  return g;
}
