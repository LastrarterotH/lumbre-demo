/* ============================================================
   paris/monumentos
   Las piezas grandes de París (Época 8, 1120-1257, docs/era8-plan.md), en el idioma de bloques del proyecto con el color de
   la época: la caliza clara de la cuenca de París (la «pierre de Paris» con que se hizo todo), la pizarra y el plomo de los
   techos, las casas de entramado con su revoque, las vidrieras azules y rojas.
   - Notre-Dame POR ETAPAS: en 1120 estaba la vieja catedral de San Esteban; la nueva se empezó en 1163 por el coro, la nave
     se cerró hacia 1200 y la fachada con sus dos torres se terminó hacia 1250. La obra crece con la época: la vieja iglesia
     y los cimientos; el coro con su grúa de rueda; la nave con sus arbotantes; la fachada con el rosetón, la galería de los
     reyes y la aguja sobre el crucero.
   - La abadía de San Víctor (la iglesia, el claustro, el pozo y la casa de los canónigos), Santa Genoveva en lo alto de la
     Montaña con su torre (la torre llamada de Clovis sigue en pie), el Châtelet que guarda el Grand Pont, el Louvre de Felipe
     Augusto (hacia 1200) con su torre redonda, la muralla de Felipe Augusto (1190-1215) con sus torres y la puerta de San
     Víctor, los dos puentes con casas y molinos, las barcas del Sena y las casas de entramado.
   La fachada de Notre-Dame mira a +x (en la isla real mira al poniente: aquí manda la cámara, como en el Templo Mayor).
   Escala: 1 = una baldosa; una persona adulta mide ~0,9.
   EL REPLANTEO (2026-10-04, docs/replanteo-visual.md): al final del archivo, las piezas nuevas en variantes para la hoja
   juego3d/bocetos/paris.html (la catedral a su escala, la segunda pieza, los barrios). Lo de arriba sigue igual: es lo que
   usa hoy la época, hasta que el usuario elija.
   ============================================================ */
import * as THREE from 'three';
import { crearPersona } from '../actores.js';
import { pon, caja, propia, textura, matTex, figura } from '../agora/monumentos.js';

export const PA = {
  piedra: '#e6dcc2', piedraD: '#cbbf9f', piedraL: '#f1eadb', piedraO: '#a99c7e',
  pizarra: '#56606e', pizarraD: '#414a56', plomo: '#7c8590', teja: '#a85a40', tejaD: '#87432f',
  revoque: '#f0e7d2', revoqueD: '#ddd0b2', entramado: '#5a3a24', madera: '#7a5232', maderaD: '#4e3220',
  azul: '#2f4f9a', rojo: '#a8261e', oro: '#d4a93e', verde: '#4f7a3e', verdeD: '#3a5e2e', negro: '#2a2622',
  agua: '#6f8fa0', pergamino: '#f1e6cc', paja: '#d2b46a', hierro: '#3e3a36', bronce: '#a87a3a'
};

/* ---------- las texturas ---------- */
const matRep = (K, clave, t, rx, ry) => matTex(K, clave + rx + 'x' + ry, (() => { const c = t.clone(); c.needsUpdate = true; c.repeat.set(rx, ry); c.wrapS = c.wrapT = THREE.RepeatWrapping; return c; })());
/* el entramado: el revoque claro entre las vigas oscuras (montantes, travesaño y las cruces de San Andrés) */
const texEntramado = () => textura('pa-entramado', 64, 64, (g, w, h) => {
  g.fillStyle = PA.revoque; g.fillRect(0, 0, w, h);
  g.fillStyle = PA.entramado;
  g.fillRect(0, 0, w, 4); g.fillRect(0, h - 4, w, 4); g.fillRect(0, h / 2 - 2, w, 4);
  for (const x of [0, 30, 60]) g.fillRect(x, 0, 4, h);
  g.lineWidth = 3.4; g.strokeStyle = PA.entramado;
  g.beginPath(); g.moveTo(4, h / 2); g.lineTo(30, 4); g.moveTo(34, 4); g.lineTo(60, h / 2); g.moveTo(4, h - 4); g.lineTo(30, h / 2); g.moveTo(34, h / 2); g.lineTo(60, h - 4); g.stroke();
}, { repetir: true });
/* los sillares de la caliza: hiladas con sus juntas */
const texSillar = () => textura('pa-sillar', 64, 64, (g, w, h) => {
  g.fillStyle = PA.piedra; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,104,78,.35)';
  for (let y = 0; y < h; y += 16) { g.fillRect(0, y, w, 1.6); const o = (y / 16) % 2 ? 16 : 0; for (let x = o; x < w; x += 32) g.fillRect(x, y, 1.6, 16); }
  g.fillStyle = 'rgba(255,255,255,.12)'; for (let y = 2; y < h; y += 16) g.fillRect(0, y, w, 1.2);
}, { repetir: true });
/* la pizarra: escamas en hiladas */
const texPizarra = (clave = 'pa-pizarra', base = PA.pizarra, raya = PA.pizarraD) => textura(clave, 64, 64, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  g.fillStyle = raya; for (let y = 0; y < h; y += 8) { g.fillRect(0, y, w, 1.5); const o = (y / 8) % 2 ? 4 : 0; for (let x = o; x < w; x += 8) g.fillRect(x, y, 1.2, 8); }
  g.fillStyle = 'rgba(255,255,255,.10)'; for (let y = 2; y < h; y += 8) g.fillRect(0, y, w, 1);
}, { repetir: true });
const texTeja = () => texPizarra('pa-teja', PA.teja, PA.tejaD);
/* el rosetón: los pétalos de vidrio azul y rojo alrededor del ojo, con la tracería de piedra */
const texRoseton = () => textura('pa-roseton', 128, 128, (g, w) => {
  const c = w / 2; g.fillStyle = PA.piedraD; g.fillRect(0, 0, w, w);
  g.fillStyle = PA.piedra; g.beginPath(); g.arc(c, c, 62, 0, 7); g.fill();
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; g.fillStyle = k % 2 ? PA.azul : PA.rojo; g.beginPath(); g.moveTo(c + Math.cos(a) * 22, c + Math.sin(a) * 22); g.arc(c, c, 56, a - 0.17, a + 0.17); g.closePath(); g.fill(); }
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2 + 0.26; g.fillStyle = k % 2 ? '#3f6ab8' : PA.oro; g.beginPath(); g.arc(c + Math.cos(a) * 36, c + Math.sin(a) * 36, 5, 0, 7); g.fill(); }
  g.fillStyle = PA.azul; g.beginPath(); g.arc(c, c, 18, 0, 7); g.fill(); g.fillStyle = PA.oro; g.beginPath(); g.arc(c, c, 8, 0, 7); g.fill();
  g.strokeStyle = PA.piedraL; g.lineWidth = 2.2; for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; g.beginPath(); g.moveTo(c + Math.cos(a) * 18, c + Math.sin(a) * 18); g.lineTo(c + Math.cos(a) * 60, c + Math.sin(a) * 60); g.stroke(); }
  g.beginPath(); g.arc(c, c, 60, 0, 7); g.stroke();
});
/* las ventanas góticas: lancetas apuntadas con su vidrio azul, en fila (el claristorio de la nave) */
const texLancetas = () => textura('pa-lancetas', 64, 64, (g, w, h) => {
  g.fillStyle = PA.piedra; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,104,78,.25)'; for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 1.4);
  for (const x of [8, 40]) { g.fillStyle = '#26324a'; g.beginPath(); g.moveTo(x, h - 8); g.lineTo(x, 22); g.quadraticCurveTo(x, 8, x + 8, 6); g.quadraticCurveTo(x + 16, 8, x + 16, 22); g.lineTo(x + 16, h - 8); g.closePath(); g.fill();
    g.fillStyle = PA.azul; g.fillRect(x + 3, 24, 4, 26); g.fillStyle = PA.rojo; g.fillRect(x + 9, 24, 4, 26); g.fillStyle = PA.oro; g.beginPath(); g.arc(x + 8, 16, 3, 0, 7); g.fill(); }
}, { repetir: true });
/* la galería de los reyes: veintiocho reyes de Judá en sus nichos (aquí, una fila de figuras) */
const texReyes = () => textura('pa-reyes', 128, 32, (g, w, h) => {
  g.fillStyle = PA.piedraD; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 8; k++) { const x = k * 16; g.fillStyle = '#8f8266'; g.fillRect(x + 2, 3, 12, h - 6); g.fillStyle = PA.piedraL; g.beginPath(); g.arc(x + 8, 9, 3.2, 0, 7); g.fill(); g.fillRect(x + 5, 12, 6, h - 16); g.fillStyle = PA.oro; g.fillRect(x + 5, 5, 6, 2); }
}, { repetir: true });
/* los portales: tres arcos apuntados con sus figuras (aquí, el tímpano oscuro y las arquivoltas) */
const texPortales = () => textura('pa-portales', 192, 96, (g, w, h) => {
  g.fillStyle = PA.piedra; g.fillRect(0, 0, w, h);
  [[32, 52], [96, 60], [160, 52]].forEach(([cx, ht]) => {
    for (let k = 3; k >= 0; k--) { g.fillStyle = k % 2 ? PA.piedraD : PA.piedraO; g.beginPath(); g.moveTo(cx - 20 - k * 3, h); g.lineTo(cx - 20 - k * 3, h - ht + 18); g.quadraticCurveTo(cx - 20 - k * 3, h - ht - 4 - k * 3, cx, h - ht - 10 - k * 3); g.quadraticCurveTo(cx + 20 + k * 3, h - ht - 4 - k * 3, cx + 20 + k * 3, h - ht + 18); g.lineTo(cx + 20 + k * 3, h); g.closePath(); g.fill(); }
    g.fillStyle = '#3a2e22'; g.fillRect(cx - 14, h - ht * 0.55, 28, ht * 0.55);   // las puertas
    g.fillStyle = PA.maderaD; g.fillRect(cx - 1, h - ht * 0.55, 2, ht * 0.55);
  });
});
/* la tabla de lancetas de una fachada de piedra para los edificios menores */
function lienzo(K, g, w, d, h, y0, tex, clave, rep = 0.25) {
  const m = matRep(K, clave, tex(), Math.max(1, Math.round(w / rep)), Math.max(1, Math.round(h / rep))), m2 = matRep(K, clave, tex(), Math.max(1, Math.round(d / rep)), Math.max(1, Math.round(h / rep)));
  [[0, d / 2 + 0.002, 0, w, m], [w / 2 + 0.002, 0, Math.PI / 2, d, m2], [0, -d / 2 - 0.002, Math.PI, w, m], [-w / 2 - 0.002, 0, -Math.PI / 2, d, m2]].forEach(([x, z, ry, l, mm]) => {
    const p = new THREE.Mesh(propia(new THREE.PlaneGeometry(l, h)), mm); p.position.set(x, y0 + h / 2, z); p.rotation.y = ry; g.add(p);
  });
}

/* ---------- el tejado a dos aguas, empinado como los de París (con su textura de pizarra, teja o plomo) ---------- */
export function tejado(K, ancho, largo, alto, { tipo = 'pizarra', gr = 0.004, piñon = PA.piedra } = {}) {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-ancho / 2, 0); s.lineTo(ancho / 2, 0); s.lineTo(0, alto); s.closePath();
  const geo = propia(new THREE.ExtrudeGeometry(s, { depth: largo, bevelEnabled: false })); geo.translate(0, 0, -largo / 2);
  g.add(K.malla(geo, piñon, { grosor: gr }));
  const v = 0.025, ang = Math.atan2(alto, ancho / 2), lado = Math.hypot(ancho / 2, alto) + v;
  const tx = tipo === 'teja' ? texTeja() : tipo === 'plomo' ? texPizarra('pa-plomo', PA.plomo, '#68707a') : texPizarra();
  const mat = matRep(K, 'pa-techo-' + tipo, tx, Math.max(1, Math.round(lado * 6)), Math.max(1, Math.round((largo + 2 * v) * 6)));
  [-1, 1].forEach(l => {
    const ag = K.malla(K.caja(lado, 0.018, largo + 2 * v), mat, { grosor: gr });
    const cx = l * (ancho / 4 + Math.cos(ang) * v / 2), cy = alto / 2 - Math.sin(ang) * v / 2;
    ag.rotation.z = -l * ang; ag.position.set(cx + l * Math.sin(ang) * 0.009, cy + Math.cos(ang) * 0.009, 0); g.add(ag);
  });
  pon(g, caja(K, 0.022, 0.022, largo + 2 * v, tipo === 'teja' ? PA.tejaD : PA.pizarraD, { grosor: gr }), 0, alto + 0.012, 0);
  return g;
}

/* ---------- la casa de París: piso bajo de piedra o entramado, piso alto en voladizo, tejado empinado con el piñón a la calle ---------- */
export function casa(K, w, d, h, { piedra = false, techo = 'teja', pisos = 2, tienda = false } = {}) {
  const g = new THREE.Group(), h1 = h * 0.5, h2 = h - h1;
  const bajo = caja(K, w, h1, d, piedra ? PA.piedra : PA.revoqueD, { grosor: 0.004 }); bajo.position.y = h1 / 2; g.add(bajo);
  if (piedra) lienzo(K, g, w, d, h1, 0, texSillar, 'pa-sillar-c', 0.2);
  if (pisos > 1) {
    const alto = caja(K, w + 0.04, h2, d + 0.04, PA.revoque, { grosor: 0.004 }); alto.position.y = h1 + h2 / 2; g.add(alto);
    lienzo(K, g, w + 0.04, d + 0.04, h2, h1, texEntramado, 'pa-entr', 0.16);
    pon(g, caja(K, w + 0.06, 0.016, d + 0.06, PA.entramado, { sinTinta: true }), 0, h1 + 0.008, 0);   // la viga del voladizo
  }
  const t = tejado(K, w + 0.08, d + 0.08, Math.max(0.12, w * 0.8), { tipo: techo, piñon: PA.revoque }); t.position.y = pisos > 1 ? h : h1; g.add(t);   // el piñón mira a la calle (+z)
  pon(g, caja(K, 0.1, 0.13, 0.024, '#3a2e22', { sinTinta: true }), w * 0.18, 0.065, d / 2 + 0.006);   // la puerta
  if (tienda) { pon(g, caja(K, w * 0.4, 0.012, 0.12, PA.madera, { grosor: 0.002 }), -w * 0.2, h1 * 0.55, d / 2 + 0.06); pon(g, caja(K, w * 0.38, 0.05, 0.1, PA.maderaD, { grosor: 0.002 }), -w * 0.2, 0.06, d / 2 + 0.06); }   // el postigo bajado de la tienda, que hace de mostrador
  [-0.22, 0.22].forEach(fx => pon(g, caja(K, 0.06, 0.07, 0.01, '#33302c', { sinTinta: true }), w * fx, pisos > 1 ? h1 + h2 * 0.55 : h1 * 0.7, d / 2 + (pisos > 1 ? 0.026 : 0.006)));   // las ventanas
  pon(g, caja(K, 0.05, 0.14, 0.05, PA.piedraD, { grosor: 0.002 }), w * 0.22, (pisos > 1 ? h : h1) + Math.max(0.12, w * 0.8) * 0.45, -d * 0.2);   // la chimenea
  return g;
}

/* ---------- NOTRE-DAME, por etapas (0: la vieja San Esteban y los cimientos · 1: el coro con la grúa · 2: la nave y los arbotantes · 3: la fachada, las torres y la aguja) ---------- */
function grua(K) {   // la grúa de rueda: un hombre camina adentro de la rueda y la cuerda sube la piedra
  const g = new THREE.Group(); g.userData.vivo = true;
  [-1, 1].forEach(l => pon(g, caja(K, 0.02, 0.5, 0.02, PA.madera, { grosor: 0.002 }), 0, 0.25, l * 0.06));
  const brazo = caja(K, 0.5, 0.025, 0.025, PA.madera, { grosor: 0.002 }); brazo.position.set(0.16, 0.5, 0); brazo.rotation.z = 0.25; g.add(brazo);
  const rueda = K.malla(K.toro(0.12, 0.012, Math.PI * 2, 0.6), PA.maderaD, { grosor: 0.002 }); rueda.position.set(-0.04, 0.14, 0); g.add(rueda); g.userData.rueda = rueda;
  for (let k = 0; k < 4; k++) { const r = caja(K, 0.23, 0.008, 0.008, PA.maderaD, { sinTinta: true }); r.rotation.z = k * Math.PI / 4; rueda.add(r); }
  pon(g, K.malla(K.cilindro(0.003, 0.003, 0.32, 3), '#c9b88a', { sinTinta: true }), 0.39, 0.4, 0);
  pon(g, caja(K, 0.06, 0.05, 0.05, PA.piedra, { grosor: 0.002 }), 0.39, 0.22, 0);   // el sillar que sube
  return g;
}
function andamio(K, w, h) {
  const g = new THREE.Group();
  for (let k = 0; k <= Math.round(w / 0.12); k++) pon(g, K.malla(K.cilindro(0.005, 0.005, h, 3), PA.madera, { sinTinta: true }), -w / 2 + k * 0.12, h / 2, 0);
  for (let y = 0.12; y < h; y += 0.14) pon(g, caja(K, w, 0.008, 0.05, PA.madera, { sinTinta: true }), 0, y, 0.02);
  return g;
}
function viejaSanEsteban(K) {   // la catedral merovingia de San Esteban, delante de la obra (se demolió hacia 1200)
  const g = new THREE.Group();
  pon(g, caja(K, 0.34, 0.26, 0.6, PA.piedraD, { grosor: 0.004 }), 0, 0.13, 0);
  const t = tejado(K, 0.38, 0.64, 0.16, { tipo: 'teja', piñon: PA.piedraD }); t.position.y = 0.26; g.add(t);
  pon(g, caja(K, 0.14, 0.42, 0.14, PA.piedraD, { grosor: 0.004 }), 0.0, 0.21, 0.34);
  const ag = K.malla(K.cono(0.11, 0.16, 4), PA.tejaD, { grosor: 0.003 }); ag.rotation.y = Math.PI / 4; ag.position.set(0, 0.5, 0.34); g.add(ag);
  pon(g, caja(K, 0.08, 0.12, 0.01, '#3a2e22', { sinTinta: true }), 0, 0.06, 0.412);
  return g;
}
export function notreDame(K, etapa = 3) {
  const raiz = new THREE.Group(), g = new THREE.Group(); raiz.add(g);
  const L = 1.5, W = 0.34, H = 0.5, WA = 0.13, HA = 0.27;   // la nave: largo (de la fachada al ábside), ancho, alto; las naves laterales
  const zF = L / 2, zA = -L / 2;                          // la fachada a +z (después se gira para que mire a +x), el ábside a -z
  const tramo = (z0, z1) => {                             // un tramo de nave con sus naves laterales, claristorio, techo de plomo y arbotantes
    const len = z1 - z0, zc = (z0 + z1) / 2, t = new THREE.Group();
    pon(t, caja(K, W, H, len, PA.piedra, { grosor: 0.004 }), 0, H / 2, zc);
    lienzo(K, t, W, len, H * 0.42, H * 0.55, texLancetas, 'pa-lanc', 0.16); t.children.slice(-4).forEach(m => { m.position.z += zc; });
    [-1, 1].forEach(l => { pon(t, caja(K, WA, HA, len, PA.piedraD, { grosor: 0.004 }), l * (W / 2 + WA / 2), HA / 2, zc); const tl = caja(K, WA + 0.02, 0.016, len, PA.plomo, { grosor: 0.002 }); tl.position.set(l * (W / 2 + WA / 2), HA + 0.03, zc); tl.rotation.z = l * -0.35; t.add(tl); });
    const te = tejado(K, W + 0.04, len, 0.3, { tipo: 'plomo', piñon: PA.piedra }); te.position.set(0, H, zc); t.add(te);
    /* los arbotantes: el estribo afuera y el arco que empuja el muro de la nave */
    for (let z = z0 + 0.12; z < z1 - 0.04; z += 0.2) [-1, 1].forEach(l => {
      pon(t, caja(K, 0.05, HA + 0.12, 0.05, PA.piedra, { grosor: 0.003 }), l * (W / 2 + WA + 0.03), (HA + 0.12) / 2, z);
      pon(t, K.malla(K.cono(0.03, 0.07, 4), PA.piedraD, { grosor: 0.002 }), l * (W / 2 + WA + 0.03), HA + 0.15, z);   // el pináculo
      const a = caja(K, 0.17, 0.022, 0.03, PA.piedraL, { grosor: 0.002 }); a.position.set(l * (W / 2 + WA * 0.55), HA + 0.1, z); a.rotation.z = l * 0.5; t.add(a);
    });
    return t;
  };
  const absideCoro = () => {
    const t = new THREE.Group();
    t.add(tramo(zA + 0.18, -0.05));
    const ab = K.malla(K.cilindro(W / 2, W / 2, H, 12), PA.piedra, { grosor: 0.004 }); ab.position.set(0, H / 2, zA + 0.18); t.add(ab);
    const ca = K.malla(K.cono(W / 2 + 0.02, 0.26, 12), PA.plomo, { grosor: 0.003 }); ca.position.set(0, H + 0.13, zA + 0.18); t.add(ca);
    const am = K.malla(K.cilindro(W / 2 + WA, W / 2 + WA, HA, 14), PA.piedraD, { grosor: 0.004 }); am.position.set(0, HA / 2, zA + 0.18); t.add(am);   // el deambulatorio
    return t;
  };
  if (etapa === 0) {
    const sv = viejaSanEsteban(K); sv.position.set(0, 0, 0.35); g.add(sv);
    for (let k = 0; k < 4; k++) pon(g, caja(K, W + 2 * WA, 0.04, 0.06, PA.piedraO, { grosor: 0.002 }), 0, 0.02, zA + 0.1 + k * 0.16);   // los cimientos del coro, trazados en el suelo
    const gr = grua(K); gr.position.set(0.4, 0, zA + 0.3); gr.rotation.y = Math.PI; g.add(gr); g.userData.grua = gr;
  }
  if (etapa >= 1) g.add(absideCoro());
  if (etapa === 1) {
    const sv = viejaSanEsteban(K); sv.position.set(0, 0, 0.42); g.add(sv);
    const an = andamio(K, W + 2 * WA, H * 0.6); an.position.set(0, 0, 0.0); g.add(an);
    const gr = grua(K); gr.position.set(0.42, 0, 0.0); gr.rotation.y = Math.PI; g.add(gr); g.userData.grua = gr;
  }
  if (etapa >= 2) {
    g.add(tramo(-0.05, zF - 0.12));
    /* el crucero: los brazos del transepto, con el rosetón del sur (el brazo que se ve) */
    pon(g, caja(K, W + 2 * WA + 0.24, H * 0.94, 0.26, PA.piedra, { grosor: 0.004 }), 0, H * 0.47, -0.18);
    const tt = tejado(K, 0.28, W + 2 * WA + 0.24, 0.28, { tipo: 'plomo', piñon: PA.piedra }); tt.rotation.y = Math.PI / 2; tt.position.set(0, H * 0.94, -0.18); g.add(tt);
    const rs = new THREE.Mesh(propia(new THREE.CircleGeometry(0.1, 24)), matTex(K, 'pa-roseton', texRoseton())); rs.position.set(-(W / 2 + WA + 0.12) - 0.003, H * 0.55, -0.18); rs.rotation.y = -Math.PI / 2; g.add(rs);
  }
  if (etapa === 2) {
    pon(g, caja(K, W + 2 * WA + 0.06, 0.42, 0.14, PA.piedra, { grosor: 0.004 }), 0, 0.21, zF - 0.05);   // la fachada, hasta el rosetón
    const an = andamio(K, W + 2 * WA + 0.1, 0.62); an.position.set(0, 0, zF + 0.04); g.add(an);
    const gr = grua(K); gr.position.set(0.0, 0.42, zF - 0.05); gr.scale.setScalar(0.8); g.add(gr); g.userData.grua = gr;
  }
  if (etapa >= 3) {
    /* LA FACHADA: los tres portales, la galería de los reyes, el rosetón, la galería alta y las dos torres */
    const FW = W + 2 * WA + 0.06, fz = zF - 0.05;
    pon(g, caja(K, FW, 0.66, 0.14, PA.piedra, { grosor: 0.004 }), 0, 0.33, fz);
    const pt = new THREE.Mesh(propia(new THREE.PlaneGeometry(FW, FW / 2)), matTex(K, 'pa-portales', texPortales())); pt.position.set(0, FW / 4, fz + 0.072); g.add(pt);
    const ry = new THREE.Mesh(propia(new THREE.PlaneGeometry(FW, 0.05)), matRep(K, 'pa-reyes', texReyes(), 3, 1)); ry.position.set(0, FW / 2 + 0.035, fz + 0.072); g.add(ry);
    const rs = new THREE.Mesh(propia(new THREE.CircleGeometry(0.1, 28)), matTex(K, 'pa-roseton', texRoseton())); rs.position.set(0, 0.47, fz + 0.073); g.add(rs);
    pon(g, caja(K, FW * 0.36, 0.05, 0.03, PA.piedraL, { grosor: 0.002 }), 0, 0.64, fz + 0.07);   // la galería alta entre las torres
    [-1, 1].forEach(l => {
      const tx = l * (FW / 2 - 0.085);
      pon(g, caja(K, 0.17, 0.36, 0.17, PA.piedra, { grosor: 0.004 }), tx, 0.66 + 0.18, fz);
      for (const dz of [0.088]) { const v = caja(K, 0.03, 0.2, 0.004, '#2a2e3a', { sinTinta: true }); v.position.set(tx - 0.035, 0.86, fz + dz); g.add(v); const v2 = v.clone(); v2.position.x = tx + 0.035; g.add(v2); }   // las aberturas de las campanas
      pon(g, caja(K, 0.19, 0.025, 0.19, PA.piedraL, { grosor: 0.002 }), tx, 1.03, fz);   // la cornisa de las torres (sin aguja: así quedaron)
      [-1, 1].forEach(a => [-1, 1].forEach(b => pon(g, K.malla(K.cono(0.012, 0.05, 4), PA.piedraD, { sinTinta: true }), tx + a * 0.08, 1.07, fz + b * 0.08)));
    });
    /* la aguja sobre el crucero (la flèche del siglo XIII), de plomo y madera */
    const ag = K.malla(K.cono(0.04, 0.46, 8), PA.plomo, { grosor: 0.003 }); ag.position.set(0, H + 0.28 + 0.23, -0.18); g.add(ag);
    pon(g, K.malla(K.cilindro(0.05, 0.05, 0.08, 8), PA.plomo, { grosor: 0.002 }), 0, H + 0.3, -0.18);
    pon(g, caja(K, 0.004, 0.05, 0.03, PA.oro, { sinTinta: true }), 0, H + 0.76, -0.18);   // la cruz de la punta
  }
  g.rotation.y = Math.PI / 2;                             // la fachada mira a +x
  return raiz;
}

/* ---------- LA ABADÍA DE SAN VÍCTOR: la iglesia, el claustro con su pozo y la casa de los canónigos (el campanario es la campana, saber 58) ---------- */
export function abadia(K) {
  const g = new THREE.Group();
  /* la iglesia, a lo largo de x, con su ábside redondo al este (+x) */
  const ig = new THREE.Group(); pon(g, ig, 0, 0, -0.45);
  pon(ig, caja(K, 1.2, 0.36, 0.34, PA.piedra, { grosor: 0.004 }), 0, 0.18, 0);
  lienzo(K, ig, 1.2, 0.34, 0.14, 0.18, texLancetas, 'pa-lanc-ab', 0.16);
  const t = tejado(K, 0.38, 1.24, 0.24, { tipo: 'pizarra' }); t.rotation.y = Math.PI / 2; t.position.y = 0.36; ig.add(t);
  const ab = K.malla(K.cilindro(0.17, 0.17, 0.32, 12), PA.piedra, { grosor: 0.004 }); ab.position.set(0.6, 0.16, 0); ig.add(ab);
  const ca = K.malla(K.cono(0.18, 0.16, 12), PA.pizarra, { grosor: 0.003 }); ca.position.set(0.6, 0.4, 0); ig.add(ca);
  pon(ig, caja(K, 0.12, 0.16, 0.012, '#3a2e22', { sinTinta: true }), -0.3, 0.08, 0.176);   // la puerta del claustro
  /* el claustro: las cuatro galerías de arcos alrededor del jardín con el pozo */
  const cl = new THREE.Group(); pon(g, cl, 0, 0, 0.12);
  const CW = 0.86, CD = 0.66;
  pon(cl, caja(K, CW - 0.2, 0.012, CD - 0.2, '#7f9a52', { sinTinta: true, sombra: false }), 0, 0.006, 0);   // el jardín
  [[0, CD / 2, CW, 0], [0, -CD / 2, CW, 0], [CW / 2, 0, CD, Math.PI / 2], [-CW / 2, 0, CD, Math.PI / 2]].forEach(([x, z, l, ry]) => {
    const ga = new THREE.Group(); pon(cl, ga, x, 0, z, ry);
    pon(ga, caja(K, l, 0.03, 0.14, PA.piedraD, { grosor: 0.003 }), 0, 0.2, 0);
    const tg = caja(K, l + 0.02, 0.014, 0.18, PA.pizarra, { grosor: 0.002 }); tg.position.y = 0.23; tg.rotation.x = 0.3; ga.add(tg);
    for (let k = 0; k < Math.round(l / 0.1); k++) pon(ga, K.malla(K.cilindro(0.01, 0.01, 0.18, 5), PA.piedraL, { sinTinta: true }), -l / 2 + 0.05 + k * 0.1, 0.09, 0.05);
  });
  const po = new THREE.Group(); pon(cl, po, 0, 0, 0);
  po.add(pon(new THREE.Group(), K.malla(K.cilindro(0.05, 0.05, 0.06, 10), PA.piedraD, { grosor: 0.002 }), 0, 0.03, 0));
  [-1, 1].forEach(l => po.add(pon(new THREE.Group(), caja(K, 0.01, 0.12, 0.01, PA.maderaD, { sinTinta: true }), l * 0.05, 0.1, 0)));
  po.add(pon(new THREE.Group(), caja(K, 0.12, 0.01, 0.01, PA.maderaD, { sinTinta: true }), 0, 0.16, 0));
  /* la casa de los canónigos, al sur del claustro, con el dormitorio arriba */
  const ca2 = casa(K, 0.9, 0.24, 0.34, { piedra: true, techo: 'pizarra' }); ca2.position.set(0, 0, 0.6); g.add(ca2);
  return g;
}

/* ---------- SANTA GENOVEVA en lo alto de la Montaña: la iglesia de la abadía con su torre románica ---------- */
export function santaGenoveva(K) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.8, 0.3, 0.3, PA.piedraD, { grosor: 0.004 }), 0, 0.15, 0);
  const t = tejado(K, 0.34, 0.84, 0.2, { tipo: 'teja', piñon: PA.piedraD }); t.rotation.y = Math.PI / 2; t.position.y = 0.3; g.add(t);
  pon(g, caja(K, 0.18, 0.66, 0.18, PA.piedra, { grosor: 0.004 }), 0.22, 0.33, 0.18);
  lienzo(K, g, 0.18, 0.18, 0.18, 0.4, texLancetas, 'pa-lanc-tg', 0.09); g.children.slice(-4).forEach(m => { m.position.x += 0.22; m.position.z += 0.18; });
  const ag = K.malla(K.cono(0.14, 0.2, 4), PA.pizarra, { grosor: 0.003 }); ag.rotation.y = Math.PI / 4; ag.position.set(0.22, 0.76, 0.18); g.add(ag);
  return g;
}

/* ---------- EL CHÂTELET: la fortaleza que guarda la entrada del Grand Pont, con sus dos torres redondas ---------- */
export function chatelet(K) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.5, 0.34, 0.34, PA.piedraD, { grosor: 0.004 }), 0, 0.17, 0);
  lienzo(K, g, 0.5, 0.34, 0.34, 0, texSillar, 'pa-sillar-ch', 0.12);
  pon(g, caja(K, 0.12, 0.18, 0.02, '#2a2420', { sinTinta: true }), 0, 0.09, 0.175);
  [-1, 1].forEach(l => {
    pon(g, K.malla(K.cilindro(0.11, 0.12, 0.5, 12), PA.piedra, { grosor: 0.004 }), l * 0.26, 0.25, 0.14);
    pon(g, K.malla(K.cono(0.13, 0.24, 12), PA.pizarra, { grosor: 0.003 }), l * 0.26, 0.62, 0.14);
  });
  for (let k = 0; k < 5; k++) pon(g, caja(K, 0.05, 0.05, 0.05, PA.piedraD, { grosor: 0.002 }), -0.2 + k * 0.1, 0.36, 0.15);   // las almenas
  return g;
}

/* ---------- EL LOUVRE de Felipe Augusto: el recinto cuadrado con torres en las esquinas y la gran torre redonda al centro ---------- */
export function louvre(K) {
  const g = new THREE.Group(), S = 0.9;
  [[0, S / 2, S, 0], [0, -S / 2, S, 0], [S / 2, 0, S, Math.PI / 2], [-S / 2, 0, S, Math.PI / 2]].forEach(([x, z, l, ry]) => { const m = caja(K, l, 0.22, 0.06, PA.piedra, { grosor: 0.004 }); m.position.set(x, 0.11, z); m.rotation.y = ry; g.add(m); });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { pon(g, K.malla(K.cilindro(0.07, 0.08, 0.32, 10), PA.piedra, { grosor: 0.003 }), a * S / 2, 0.16, b * S / 2); pon(g, K.malla(K.cono(0.09, 0.16, 10), PA.pizarra, { grosor: 0.003 }), a * S / 2, 0.4, b * S / 2); });
  pon(g, K.malla(K.cilindro(0.16, 0.17, 0.62, 16), PA.piedraL, { grosor: 0.004 }), 0, 0.31, 0);   // la Grosse Tour
  pon(g, K.malla(K.cono(0.18, 0.3, 16), PA.pizarra, { grosor: 0.003 }), 0, 0.77, 0);
  pon(g, caja(K, 0.12, 0.14, 0.02, '#2a2420', { sinTinta: true }), 0, 0.07, S / 2 + 0.032);
  return g;
}

/* ---------- LA MURALLA de Felipe Augusto: lienzo almenado, torres redondas y puertas ---------- */
export function muralla(K, largo) {
  const g = new THREE.Group();
  pon(g, caja(K, largo, 0.24, 0.07, PA.piedraD, { grosor: 0.004 }), 0, 0.12, 0);
  for (let x = -largo / 2 + 0.04; x < largo / 2; x += 0.09) pon(g, caja(K, 0.045, 0.04, 0.075, PA.piedraD, { grosor: 0.0015 }), x, 0.26, 0);
  return g;
}
export function torreMuralla(K, alto = 0.34) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.085, 0.095, alto, 10), PA.piedra, { grosor: 0.003 }), 0, alto / 2, 0);
  pon(g, K.malla(K.cono(0.105, 0.16, 10), PA.pizarra, { grosor: 0.003 }), 0, alto + 0.08, 0);
  return g;
}
export function puertaMuralla(K) {
  const g = new THREE.Group();
  [-1, 1].forEach(l => { const t = torreMuralla(K, 0.42); t.position.x = l * 0.22; g.add(t); });
  pon(g, caja(K, 0.32, 0.12, 0.09, PA.piedraD, { grosor: 0.003 }), 0, 0.34, 0);   // el arco sobre el paso
  return g;
}

/* ---------- LOS PUENTES: el Petit Pont con sus casas encima (ahí tenía su escuela Adam du Petit-Pont) y el Grand Pont con los cambistas ---------- */
export function puente(K, largo, { casas = 2 } = {}) {   // a lo largo de z
  const g = new THREE.Group();
  pon(g, caja(K, 0.42, 0.06, largo, PA.piedra, { grosor: 0.004 }), 0, 0.0, 0);
  for (let k = 0; k < 2; k++) pon(g, caja(K, 0.46, 0.2, 0.08, PA.piedraD, { grosor: 0.003 }), 0, -0.12, -largo / 4 + k * largo / 2);   // las pilas
  [-1, 1].forEach(l => { for (let k = 0; k < casas; k++) { const c = casa(K, 0.13, Math.min(0.2, largo / casas - 0.02), 0.32, { techo: 'teja', tienda: true }); c.position.set(l * 0.15, 0.03, -largo / 2 + (k + 0.5) * largo / casas); c.rotation.y = l > 0 ? -Math.PI / 2 : Math.PI / 2; g.add(c); } });
  return g;
}
/* el molino de barca: amarrado bajo el puente, con su rueda que gira con la corriente */
export function molinoBarca(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  pon(g, caja(K, 0.36, 0.06, 0.16, PA.maderaD, { grosor: 0.003 }), 0, 0.02, 0);
  pon(g, caja(K, 0.2, 0.14, 0.14, PA.madera, { grosor: 0.003 }), -0.06, 0.12, 0);
  const t = tejado(K, 0.16, 0.22, 0.1, { tipo: 'teja', piñon: PA.madera }); t.rotation.y = Math.PI / 2; t.position.set(-0.06, 0.19, 0); g.add(t);
  const r = new THREE.Group(); r.position.set(0.12, 0.05, 0.12); g.add(r); g.userData.rueda = r;
  for (let k = 0; k < 6; k++) { const p = caja(K, 0.02, 0.18, 0.05, PA.madera, { grosor: 0.0015 }); p.rotation.z = k * Math.PI / 6; r.add(p); }
  return g;
}

/* ---------- LA BARCA del Sena: plana, con su carga (toneles de vino, heno, piedra de las canteras) y el que la empuja con la pértiga ---------- */
export function barca(K, { carga = 'toneles', persona = true } = {}) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.62, 0.05, 0.2, PA.madera, { grosor: 0.003 }), 0, 0.02, 0);
  [-1, 1].forEach(l => { const p = caja(K, 0.1, 0.04, 0.2, PA.maderaD, { grosor: 0.002 }); p.position.set(l * 0.33, 0.04, 0); p.rotation.z = l * -0.4; g.add(p); });
  if (carga === 'toneles') for (let k = 0; k < 3; k++) pon(g, K.malla(K.cilindro(0.045, 0.045, 0.1, 8), '#8a6040', { grosor: 0.002 }), -0.15 + k * 0.11, 0.08, 0, 0).rotation.x = Math.PI / 2;
  if (carga === 'heno') pon(g, K.malla(K.capsula(0.07, 0.2, 0.5), PA.paja, { grosor: 0.002 }), -0.04, 0.09, 0).rotation.z = Math.PI / 2;
  if (carga === 'piedra') for (let k = 0; k < 3; k++) pon(g, caja(K, 0.08, 0.06, 0.08, PA.piedra, { grosor: 0.002 }), -0.16 + k * 0.1, 0.075, 0);
  if (carga === 'pieles') for (let k = 0; k < 3; k++) pon(g, caja(K, 0.12, 0.012, 0.14, '#e8dcc2', { grosor: 0.0015 }), -0.12, 0.05 + k * 0.014, 0);
  if (persona) {
    const p = crearPersona(K, { piel: 1, pelo: 'corto', colorPelo: '#4a3424', ropa: 'corta', colorRopa: '#8a7a5a', chal: undefined });
    p.obj.scale.setScalar(0.42); p.obj.position.set(0.22, 0.04, 0); p.obj.rotation.y = -Math.PI / 2; g.add(p.obj);
    const pe = K.malla(K.cilindro(0.004, 0.004, 0.62, 3), PA.maderaD, { sinTinta: true }); pe.position.set(0.27, 0.22, 0.04); pe.rotation.z = 0.35; g.add(pe);
  }
  return g;
}

/* ============================================================
   EL REPLANTEO VISUAL (2026-10-04): las piezas en variantes para la hoja juego3d/bocetos/paris.html
   El usuario: «Notre-Dame parece una caja de fósforo». La de arriba mide 1,7 × 0,9 × 1,3; la de aquí, la de verdad a la
   escala del juego: 128 m de largo, 48 de ancho, la bóveda de la nave a 33 m, el caballete del techo a 43 m, las torres de
   69 m y la aguja del siglo XIII de ~78 m (Aubert, «Notre-Dame de Paris, sa place dans l'architecture», 1920; el corte y la
   planta de Viollet-le-Duc, «Dictionnaire raisonné», 1854-1868; las fotos aéreas de los Archives nationales). Lo largo va a
   0,043 baldosas por metro (5,5 de punta a punta) y lo alto a 0,049 (las torres en 3,4): un 15 % más generoso en vertical,
   como todo monumento del juego, para que se lea desde el celular.
   La obra crece como creció (Aubert; Erlande-Brandenburg, «Notre-Dame de Paris», 1991): el coro 1163-1182, la nave
   1182-1200, la fachada hasta la rosa 1200-1225, las torres 1225-1250; la aguja del crucero, hacia 1220-1230. La fachada
   mira a +z (al poniente) y el flanco sur a +x: así la veían los estudiantes desde la orilla izquierda.
   ============================================================ */
export const VARIANTES = { catedral: 'completa', segunda: 'sanvictor', casas: 'entramado', tablero: 'orilla' };   // la recomendación de la hoja, hasta que el usuario elija

export const ND = {   // la caliza de París (el «liais» de las canteras de la ciudad, crema), el plomo del techo, los vidrios
  cal: '#ebe0c5', calL: '#f6f0e1', calD: '#d6c8a6', calS: '#bcac87', calO: '#a3926f',
  plomo: '#93a0ad', plomoL: '#b0bbc6', plomoD: '#74808e', plomoS: '#5f6a77',
  vidrio: '#2b3654', azul: '#3a5cb0', rojo: '#b23a2c', oro: '#e2b64c', verde: '#4f8a4a', violeta: '#6a4a8a',
  madera: '#94683e', maderaD: '#654429', maderaL: '#b98a56', hierro: '#3a3633', hueco: '#3a3330',
  teja: '#bf5a3e', tejaD: '#9c4430', tejaL: '#d27052', pizarra: '#5f6b7c', pizarraD: '#4a5565',
  revoque: '#f3e9d2', ocre: '#e7c98f', rosa: '#efd2bd', blanco: '#f5f1e6', entramado: '#6b4528',
  paja: '#d9bb72', pajaD: '#b8964e', pasto: '#9cbf5e', pastoD: '#7fa64a', tierra: '#d9c59a',
};
const EH = 0.043, EV = 0.0493;                                                         // baldosas por metro: en planta y en alto
export const ESCALA_ND = { planta: EH, alto: EV };
const XN = 0.28, XT = 0.56, XA = 0.82, XC = 1.03, XX = 1.10;                           // la nave alta (12 m), la tribuna, la nave lateral, las capillas (1235-1250), los brazos del crucero
const YC = 1.68, YR = 2.12, YT = 1.0, YT2 = 1.14, YA = 0.62, YA2 = 0.74, YCH = 0.5;     // el muro alto (34 m), el caballete (43 m), la tribuna, la nave lateral, las capillas
const Z0 = 2.75, ZF = 2.19, ZT0 = 0.43, ZT1 = -0.17, ZA = -1.72;                       // la fachada, el fondo de las torres, el crucero, el centro del ábside (el muro del fondo, a -2,75)

/* ---------- el arco apuntado ---------- */
/* la silueta (y hacia arriba): de pie a pie pasando por la clave; luz w y alto total h (con los pies rectos) */
function puntosApuntado(w, h, n = 7) {
  const r = Math.min(h * 0.62, w * 0.87), hs = h - r, R = (w * w / 4 + r * r) / w, c = R - w / 2, a = Math.atan2(r, c), P = [[-w / 2, 0]];
  for (let i = 0; i <= n; i++) { const t = Math.PI - a * i / n; P.push([c + R * Math.cos(t), hs + R * Math.sin(t)]); }
  for (let i = 1; i <= n; i++) { const t = a * (1 - i / n); P.push([-c + R * Math.cos(t), hs + R * Math.sin(t)]); }
  P.push([w / 2, 0]);
  return P;
}
/* el marco de un portal o de una ventana: la arquivolta y las jambas, de grosor t y saliente prof (sale hacia +z) */
function marcoApuntado(K, w, h, t, prof, color = ND.cal, gr = 0.003) {
  const fuera = puntosApuntado(w, h), dentro = puntosApuntado(w - 2 * t, h - t).reverse(), s = new THREE.Shape();
  fuera.forEach(([x, y], i) => i ? s.lineTo(x, y) : s.moveTo(x, y)); dentro.forEach(([x, y]) => s.lineTo(x, y)); s.closePath();
  return K.malla(propia(new THREE.ExtrudeGeometry(s, { depth: prof, bevelEnabled: false })), color, { grosor: gr });
}
/* el mismo arco en el lienzo de una textura (y hacia abajo): pies en `base`, alto total h */
function pathApuntado(g, cx, base, w, h) {
  const r = Math.min(h * 0.62, w * 0.87), hs = base - (h - r), R = (w * w / 4 + r * r) / w, c = R - w / 2, a = Math.atan2(r, c);
  g.moveTo(cx - w / 2, base); g.lineTo(cx - w / 2, hs);
  g.arc(cx + c, hs, R, Math.PI, Math.PI + a, false); g.arc(cx - c, hs, R, -a, 0, false);
  g.lineTo(cx + w / 2, base); g.closePath();
}
const repetida = (K, clave, t, rx, ry) => { const kx = Math.max(1, Math.round(rx)), ky = Math.max(1, Math.round(ry)); return matRep(K, clave, t, kx, ky); };
const plano = (K, mat, w, h) => new THREE.Mesh(propia(new THREE.PlaneGeometry(w, h)), mat);
/* una lámina con textura pegada a una cara: (x, y, z) su centro, ry hacia dónde mira (0: +z, π/2: +x) */
function lamina(g, K, mat, w, h, x, y, z, ry = 0) { const p = plano(K, mat, w, h); p.position.set(x, y, z); p.rotation.y = ry; p.receiveShadow = true; g.add(p); return p; }
/* el pináculo gótico: el fuste de cuatro caras y la aguja con su remate */
function pinaculo(K, r, h, color = ND.cal, gr = 0.002) {
  const g = new THREE.Group();
  pon(g, caja(K, r * 2, h * 0.38, r * 2, color, { grosor: gr }), 0, h * 0.19, 0);
  const ag = K.malla(K.cono(r * 1.25, h * 0.62, 4), color, { grosor: gr }); ag.rotation.y = Math.PI / 4; ag.position.y = h * 0.38 + h * 0.31; g.add(ag);
  return g;
}

/* ---------- las texturas de la catedral ---------- */
/* el sillar de la caliza: hiladas con sus juntas, cada piedra de un tono apenas distinto */
const texSillarND = () => textura('nd-sillar', 128, 128, (g, w, h) => {
  g.fillStyle = ND.cal; g.fillRect(0, 0, w, h);
  const tonos = ['#ece1c7', '#e6dabd', '#efe6cf', '#e3d6b8', '#eadfc3'];
  for (let y = 0, f = 0; y < h; y += 16, f++) for (let x = (f % 2) * -16, k = 0; x < w; x += 32, k++) { g.fillStyle = tonos[(f * 3 + k * 7) % 5]; g.fillRect(x + 1, y + 1, 31, 15); }
  g.fillStyle = 'rgba(120,100,70,.32)'; for (let y = 0, f = 0; y < h; y += 16, f++) { g.fillRect(0, y, w, 1.4); for (let x = (f % 2) * 16; x < w; x += 32) g.fillRect(x, y, 1.4, 16); }
  g.fillStyle = 'rgba(255,255,255,.16)'; for (let y = 2; y < h; y += 16) g.fillRect(0, y, w, 1.2);
}, { repetir: true });
/* el plomo del techo: las planchas con sus juntas levantadas que bajan por el faldón */
const texPlomo = () => textura('nd-plomo', 64, 64, (g, w, h) => {
  g.fillStyle = ND.plomo; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 16) { g.fillStyle = ND.plomoD; g.fillRect(x, 0, 2, h); g.fillStyle = ND.plomoL; g.fillRect(x + 2, 0, 2, h); }
  g.fillStyle = 'rgba(70,80,95,.25)'; for (let y = 0; y < h; y += 32) g.fillRect(0, y, w, 1.5);
}, { repetir: true });
/* LA ROSA: los pétalos de vidrio (azul y rojo con medallones de oro) alrededor del ojo, con la tracería de piedra */
const texRosaND = (clave = 'nd-rosa', n = 24) => textura(clave, 256, 256, (g, w) => {
  const c = w / 2; g.fillStyle = ND.calD; g.fillRect(0, 0, w, w);
  g.fillStyle = ND.cal; g.beginPath(); g.arc(c, c, 126, 0, 7); g.fill();
  g.fillStyle = ND.vidrio; g.beginPath(); g.arc(c, c, 114, 0, 7); g.fill();
  for (let k = 0; k < n; k++) {                          // los pétalos de afuera: lancetas que irradian
    const a = k / n * Math.PI * 2, da = Math.PI / n * 0.78;
    g.fillStyle = k % 2 ? ND.azul : ND.rojo; g.beginPath(); g.moveTo(c + Math.cos(a) * 54, c + Math.sin(a) * 54); g.arc(c, c, 110, a - da, a + da); g.closePath(); g.fill();
    g.fillStyle = k % 3 ? ND.oro : '#7ea0d8'; g.beginPath(); g.arc(c + Math.cos(a) * 96, c + Math.sin(a) * 96, 6, 0, 7); g.fill();
  }
  for (let k = 0; k < n / 2; k++) { const a = (k + 0.5) / (n / 2) * Math.PI * 2; g.fillStyle = k % 2 ? '#4a6fc2' : ND.violeta; g.beginPath(); g.arc(c + Math.cos(a) * 42, c + Math.sin(a) * 42, 11, 0, 7); g.fill(); }
  g.fillStyle = ND.azul; g.beginPath(); g.arc(c, c, 26, 0, 7); g.fill(); g.fillStyle = ND.oro; g.beginPath(); g.arc(c, c, 13, 0, 7); g.fill();
  g.strokeStyle = ND.calL; g.lineWidth = 4;              // la tracería
  for (let k = 0; k < n; k++) { const a = (k + 0.5) / n * Math.PI * 2; g.beginPath(); g.moveTo(c + Math.cos(a) * 30, c + Math.sin(a) * 30); g.lineTo(c + Math.cos(a) * 112, c + Math.sin(a) * 112); g.stroke(); }
  for (const r of [28, 56, 112]) { g.beginPath(); g.arc(c, c, r, 0, 7); g.stroke(); }
  g.lineWidth = 2.4; for (let k = 0; k < n; k++) { const a = k / n * Math.PI * 2; g.beginPath(); g.arc(c + Math.cos(a) * 84, c + Math.sin(a) * 84, 13, 0, 7); g.stroke(); }
  g.strokeStyle = ND.calS; g.lineWidth = 3; g.beginPath(); g.arc(c, c, 124, 0, 7); g.stroke();
});
/* un portal: las arquivoltas con sus figuras, el tímpano en tres registros, el dintel, el parteluz con su estatua, las
   puertas con los herrajes de hierro y las estatuas de las jambas. Pintado en el gris de la piedra con los restos de
   color que se le encontraron (el oro, el rojo y el azul del siglo XIII). tema: 'juicio' (el del centro), 'virgen', 'ana' */
const texPortalND = (tema) => textura('nd-portal-' + tema, 128, 192, (g, w, h) => {
  g.fillStyle = '#a99a7a'; g.fillRect(0, 0, w, h);
  const cx = w / 2, base = h, ar = h * 0.98;
  for (let k = 0; k < 5; k++) {                          // las arquivoltas, de afuera hacia adentro, con sus figuras chicas
    const ww = w - k * 14, hh = ar - k * 11;
    g.fillStyle = k % 2 ? '#c9bb98' : '#d8cba9'; g.beginPath(); pathApuntado(g, cx, base, ww, hh); g.fill();
    g.fillStyle = k % 2 ? 'rgba(90,75,55,.45)' : 'rgba(120,100,70,.4)';
    for (let i = 0; i < 9; i++) { const u = i / 8, xx = cx + (ww / 2 - 4) * Math.cos(Math.PI * (1 - u)) * 0.98, yy = base - hh * 0.42 - Math.sin(Math.PI * u) * hh * 0.5; g.fillRect(xx - 2, yy - 3, 4, 6); }
  }
  const tw = w - 70, th = ar - 55, ty = base - h * 0.42;   // el tímpano: el arco interior sobre el dintel
  g.save(); g.beginPath(); pathApuntado(g, cx, ty, tw, th - h * 0.42 + 4); g.clip();
  g.fillStyle = '#d9ccaa'; g.fillRect(0, 0, w, h);
  const reg = (y0, alto, n, col) => { for (let i = 0; i < n; i++) { const x = cx - tw / 2 + (i + 0.5) * tw / n; g.fillStyle = col[i % col.length]; g.fillRect(x - 2.6, y0 - alto, 5.2, alto); g.fillStyle = '#efe4c8'; g.beginPath(); g.arc(x, y0 - alto - 2, 2.4, 0, 7); g.fill(); } };
  reg(ty, 12, 8, ['#b9a988', '#c2876a', '#b9a988', '#8fa0c0']);                                // el registro de abajo: los muertos que se levantan (o la vida de la Virgen)
  g.fillStyle = '#c4b590'; g.fillRect(0, ty - 15, w, 2.5);
  reg(ty - 17, 12, 6, ['#b9a988', '#a99070', '#c9a35a']);                                       // el del medio: el pesaje de las almas
  g.fillStyle = '#c4b590'; g.fillRect(0, ty - 32, w, 2.5);
  if (tema === 'juicio') { g.fillStyle = ND.oro; g.beginPath(); g.arc(cx, ty - 44, 8, 0, 7); g.fill(); g.fillStyle = '#c8b791'; g.fillRect(cx - 5, ty - 46, 10, 16); g.fillStyle = '#efe4c8'; g.beginPath(); g.arc(cx, ty - 49, 3.4, 0, 7); g.fill(); reg(ty - 34, 10, 2, ['#b9a988']); }   // Cristo en majestad, con su aureola de oro
  else { g.fillStyle = '#7f90b8'; g.fillRect(cx - 6, ty - 50, 12, 16); g.fillStyle = ND.oro; g.fillRect(cx - 5, ty - 54, 10, 4); g.fillStyle = '#efe4c8'; g.beginPath(); g.arc(cx, ty - 52, 3.2, 0, 7); g.fill(); }    // la Virgen coronada
  g.restore();
  g.fillStyle = '#c8ba96'; g.fillRect(cx - tw / 2 - 2, ty, tw + 4, 7);                         // el dintel
  g.fillStyle = 'rgba(90,75,55,.4)'; for (let i = 0; i < 10; i++) g.fillRect(cx - tw / 2 + 3 + i * tw / 10, ty + 1, 3, 5);
  const py = ty + 7, pw = tw - 2;                          // las dos hojas de la puerta, de madera con sus herrajes
  g.fillStyle = '#5a3d26'; g.fillRect(cx - pw / 2, py, pw, base - py);
  g.strokeStyle = '#2f2622'; g.lineWidth = 1.6;
  for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { const yy = py + 8 + i * (base - py - 14) / 3; g.beginPath(); g.moveTo(cx + s * 3, yy); g.bezierCurveTo(cx + s * 10, yy - 4, cx + s * 16, yy + 3, cx + s * (pw / 2 - 3), yy - 2); g.stroke(); }
  g.fillStyle = '#d8cba9'; g.fillRect(cx - 3.5, py, 7, base - py);                             // el parteluz con su estatua
  g.fillStyle = '#efe4c8'; g.fillRect(cx - 2.5, py + 6, 5, 22); g.beginPath(); g.arc(cx, py + 4, 2.6, 0, 7); g.fill();
  for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {   // las estatuas de las jambas, que se abren hacia afuera
    const x = cx + s * (pw / 2 + 5 + i * 7);
    g.fillStyle = 'rgba(70,58,44,.5)'; g.fillRect(x - 3.5, py - 4, 7, base - py + 4);
    g.fillStyle = i % 2 ? '#d9cdae' : '#e6dbbf'; g.fillRect(x - 2.6, py + 2, 5.2, 28); g.beginPath(); g.arc(x, py - 1, 2.6, 0, 7); g.fill();
    g.fillStyle = '#b3a37f'; g.fillRect(x - 3, py + 31, 6, 3);
  }
});
/* la galería de los reyes: los nichos de arco trilobulado (las estatuas van en bulto) */
const texReyesND = () => textura('nd-reyes', 256, 32, (g, w, h) => {
  g.fillStyle = ND.calD; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 14; k++) {
    const x = k * w / 14 + w / 28;
    g.fillStyle = '#7c6e56'; g.beginPath(); pathApuntado(g, x, h - 2, 13, h - 5); g.fill();
    g.fillStyle = ND.calL; g.fillRect(x + w / 28 - 1.5, 2, 3, h - 4);
  }
  g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(0, 0, w, 1.5);
}, { repetir: true });
/* la baranda calada (la galería de la Virgen, el remate de las torres): cuadrifolios */
const texBaranda = () => textura('nd-baranda', 64, 16, (g, w, h) => {
  g.fillStyle = ND.cal; g.fillRect(0, 0, w, h);
  for (let x = 8; x < w; x += 16) { g.fillStyle = '#6f6350'; for (const [dx, dy] of [[-3, 0], [3, 0], [0, -3], [0, 3]]) { g.beginPath(); g.arc(x + dx, h / 2 + dy, 2.8, 0, 7); g.fill(); } }
  g.fillStyle = ND.calL; g.fillRect(0, 0, w, 2); g.fillStyle = ND.calS; g.fillRect(0, h - 2, w, 2);
}, { repetir: true });
/* el claristorio: por tramo, dos lancetas y una rosa chica bajo el arco (las ventanas agrandadas hacia 1225) */
const texClaristorio = () => textura('nd-clar', 64, 128, (g, w, h) => {
  g.fillStyle = ND.cal; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,100,70,.22)'; for (let y = 0; y < h; y += 14) g.fillRect(0, y, w, 1.3);
  g.fillStyle = ND.calD; g.beginPath(); pathApuntado(g, w / 2, h - 6, 46, h - 12); g.fill();
  g.fillStyle = ND.vidrio; g.beginPath(); pathApuntado(g, w / 2, h - 8, 40, h - 18); g.fill();
  for (const dx of [-10, 10]) { g.fillStyle = dx < 0 ? '#41589a' : '#8a3a3a'; g.beginPath(); pathApuntado(g, w / 2 + dx, h - 10, 15, h * 0.62); g.fill(); g.fillStyle = 'rgba(226,182,76,.55)'; g.fillRect(w / 2 + dx - 2, h * 0.5, 4, 5); g.fillRect(w / 2 + dx - 2, h * 0.7, 4, 5); }
  g.fillStyle = '#5a6fb8'; g.beginPath(); g.arc(w / 2, h * 0.27, 9, 0, 7); g.fill();
  g.strokeStyle = ND.calL; g.lineWidth = 2.4; g.beginPath(); g.moveTo(w / 2, h * 0.36); g.lineTo(w / 2, h - 8); g.stroke(); g.beginPath(); g.arc(w / 2, h * 0.27, 9, 0, 7); g.stroke();
  g.fillStyle = ND.calS; g.fillRect(0, h - 4, w, 4);
}, { repetir: true });
/* las ventanas de la tribuna y de las naves laterales: una rosa chica sobre dos lancetas cortas */
const texTribuna = () => textura('nd-trib', 64, 64, (g, w, h) => {
  g.fillStyle = ND.calD; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,100,70,.22)'; for (let y = 0; y < h; y += 12) g.fillRect(0, y, w, 1.2);
  g.fillStyle = ND.vidrio; g.beginPath(); pathApuntado(g, w / 2, h - 6, 34, h - 14); g.fill();
  g.fillStyle = '#4c63a8'; g.beginPath(); g.arc(w / 2, h * 0.36, 8, 0, 7); g.fill();
  g.strokeStyle = ND.calL; g.lineWidth = 2; g.beginPath(); g.moveTo(w / 2, h * 0.5); g.lineTo(w / 2, h - 6); g.stroke(); g.beginPath(); g.arc(w / 2, h * 0.36, 8, 0, 7); g.stroke();
}, { repetir: true });
/* las ventanas de las capillas (1235-1250): cuatro luces con sus rosetas, el gótico radiante */
const texCapilla = () => textura('nd-capilla', 64, 96, (g, w, h) => {
  g.fillStyle = ND.cal; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,100,70,.22)'; for (let y = 0; y < h; y += 12) g.fillRect(0, y, w, 1.2);
  g.fillStyle = ND.calD; g.beginPath(); pathApuntado(g, w / 2, h - 6, 48, h - 14); g.fill();
  g.fillStyle = ND.vidrio; g.beginPath(); pathApuntado(g, w / 2, h - 8, 42, h - 20); g.fill();
  for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#8a3f3a' : '#425c9e'; g.fillRect(w / 2 - 19 + i * 10, h * 0.45, 8, h * 0.45); }
  for (const dx of [-10, 10]) { g.fillStyle = '#5a72b8'; g.beginPath(); g.arc(w / 2 + dx, h * 0.38, 6, 0, 7); g.fill(); }
  g.fillStyle = ND.oro; g.beginPath(); g.arc(w / 2, h * 0.24, 6, 0, 7); g.fill();
  g.strokeStyle = ND.calL; g.lineWidth = 1.8; for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(w / 2 - 20 + i * 10, h * 0.44); g.lineTo(w / 2 - 20 + i * 10, h - 8); g.stroke(); }
}, { repetir: true });
/* el campanario: los dos vanos altísimos de cada cara de las torres, con sus columnillas y las tablas de los abat-sons */
const texCampanario = () => textura('nd-campanario', 128, 256, (g, w, h) => {
  g.fillStyle = ND.cal; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,100,70,.24)'; for (let y = 0; y < h; y += 14) g.fillRect(0, y, w, 1.3);
  for (const dx of [-27, 27]) {
    const x = w / 2 + dx;
    g.fillStyle = ND.calD; g.beginPath(); pathApuntado(g, x, h - 10, 44, h - 26); g.fill();
    g.fillStyle = ND.calS; g.beginPath(); pathApuntado(g, x, h - 12, 36, h - 34); g.fill();
    g.fillStyle = '#26232a'; g.beginPath(); pathApuntado(g, x, h - 14, 26, h - 44); g.fill();
    g.fillStyle = '#4c443e'; for (let y = 60; y < h - 18; y += 10) g.fillRect(x - 12, y, 24, 3);   // las tablas inclinadas de los abat-sons
    g.fillStyle = ND.calL; g.fillRect(x - 23, 40, 3, h - 52); g.fillRect(x + 20, 40, 3, h - 52);   // las columnillas
  }
  g.fillStyle = ND.calL; g.fillRect(w / 2 - 3, 30, 6, h - 40);
  g.fillStyle = ND.calS; g.fillRect(0, 0, w, 6); g.fillStyle = ND.calL; g.fillRect(0, 6, w, 2);
});
/* la gran galería de la fachada: los arcos trilobulados sobre las columnillas, calados (lo que no es piedra, es cielo) */
const texGaleria = () => textura('nd-galeria', 256, 48, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  g.fillStyle = ND.cal; g.fillRect(0, 0, w, 12);
  const n = 16;
  for (let k = 0; k < n; k++) {
    const x = (k + 0.5) * w / n;
    g.fillStyle = ND.cal; g.fillRect(x - w / n / 2, 10, w / n, 18);
    g.globalCompositeOperation = 'destination-out'; g.beginPath(); pathApuntado(g, x, h + 2, w / n - 4, 34); g.fill(); g.globalCompositeOperation = 'source-over';
    g.strokeStyle = ND.calD; g.lineWidth = 1.6; g.beginPath(); g.arc(x, 18, 3, 0, 7); g.stroke();
  }
  g.fillStyle = ND.calS; g.fillRect(0, 10, w, 2);
  g.fillStyle = ND.calL; g.fillRect(0, 0, w, 2);
}, { repetir: true });
/* el hastial calado del crucero: sobre la rosa, una rosa chica y la tracería del triángulo */
const texHastial = () => textura('nd-hastial', 128, 96, (g, w, h) => {
  g.fillStyle = ND.cal; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,100,70,.22)'; for (let y = 0; y < h; y += 12) g.fillRect(0, y, w, 1.2);
  g.fillStyle = ND.calD; g.beginPath(); g.arc(w / 2, h * 0.62, 20, 0, 7); g.fill();
  g.fillStyle = ND.vidrio; g.beginPath(); g.arc(w / 2, h * 0.62, 16, 0, 7); g.fill();
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; g.fillStyle = k % 2 ? ND.azul : ND.rojo; g.beginPath(); g.arc(w / 2 + Math.cos(a) * 9, h * 0.62 + Math.sin(a) * 9, 4, 0, 7); g.fill(); }
  for (const dx of [-34, 34]) { g.fillStyle = ND.calD; g.beginPath(); pathApuntado(g, w / 2 + dx, h - 6, 16, 36); g.fill(); }
});
/* la iglesia vieja (la catedral de antes de 1163): ventanas de medio punto, románicas */
const texRomanica = () => textura('nd-romanica', 64, 64, (g, w, h) => {
  g.fillStyle = '#ddd0b0'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(110,90,62,.3)'; for (let y = 0; y < h; y += 10) { g.fillRect(0, y, w, 1.2); for (let x = (y / 10 % 2) * 8; x < w; x += 16) g.fillRect(x, y, 1.2, 10); }
  for (const x of [16, 48]) { g.fillStyle = '#c4b28c'; g.beginPath(); g.arc(x, 26, 9, Math.PI, 0); g.lineTo(x + 9, 50); g.lineTo(x - 9, 50); g.fill(); g.fillStyle = '#3a3330'; g.beginPath(); g.arc(x, 27, 6, Math.PI, 0); g.lineTo(x + 6, 48); g.lineTo(x - 6, 48); g.fill(); }
}, { repetir: true });
/* el plomo de los faldones: las juntas corren pendiente abajo (en la cara de arriba de una caja, a lo largo de u) */
const texPlomoF = () => textura('nd-plomoF', 64, 64, (g, w, h) => {
  g.fillStyle = ND.plomo; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 16) { g.fillStyle = ND.plomoD; g.fillRect(0, y, w, 2); g.fillStyle = ND.plomoL; g.fillRect(0, y + 2, w, 2); }
  g.fillStyle = 'rgba(70,80,95,.22)'; for (let x = 0; x < w; x += 32) g.fillRect(x, 0, 1.5, h);
}, { repetir: true });
/* los vanos gemelos de las torres bajo la galería: dos lancetas ciegas y un óculo bajo el arco grande */
const texGemelas = () => textura('nd-gemelas', 96, 112, (g, w, h) => {
  g.fillStyle = ND.cal; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,100,70,.22)'; for (let y = 0; y < h; y += 12) g.fillRect(0, y, w, 1.2);
  g.fillStyle = ND.calD; g.beginPath(); pathApuntado(g, w / 2, h - 4, 84, h - 8); g.fill();
  for (const dx of [-20, 20]) { g.fillStyle = ND.calS; g.beginPath(); pathApuntado(g, w / 2 + dx, h - 6, 30, 66); g.fill(); g.fillStyle = ND.vidrio; g.beginPath(); pathApuntado(g, w / 2 + dx, h - 8, 22, 58); g.fill(); g.fillStyle = 'rgba(178,58,44,.55)'; g.fillRect(w / 2 + dx - 2, h - 40, 4, 12); }
  g.fillStyle = ND.calS; g.beginPath(); g.arc(w / 2, 30, 15, 0, 7); g.fill(); g.fillStyle = '#5a6a9a'; g.beginPath(); g.arc(w / 2, 30, 11, 0, 7); g.fill();
  g.strokeStyle = ND.calL; g.lineWidth = 2; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; g.beginPath(); g.moveTo(w / 2, 30); g.lineTo(w / 2 + Math.cos(a) * 11, 30 + Math.sin(a) * 11); g.stroke(); }
});

/* ---------- las piezas de la catedral ---------- */
/* el techo a dos aguas de plomo, empinado (55°): el caballete a lo largo de z, el hastial de piedra en cada punta */
function techoPlomo(K, ancho, largo, alto, { gr = 0.004, piñon = ND.cal, cresta = true } = {}) {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-ancho / 2, 0); s.lineTo(ancho / 2, 0); s.lineTo(0, alto); s.closePath();
  const geo = propia(new THREE.ExtrudeGeometry(s, { depth: largo, bevelEnabled: false })); geo.translate(0, 0, -largo / 2);
  g.add(K.malla(geo, piñon, { grosor: gr }));
  const v = 0.022, ang = Math.atan2(alto, ancho / 2), lado = Math.hypot(ancho / 2, alto) + v;
  const mat = repetida(K, 'nd-plomoF', texPlomoF(), lado * 2, largo * 7);
  [-1, 1].forEach(l => {
    const ag = K.malla(K.caja(lado, 0.02, largo + 0.01), mat, { grosor: gr });
    ag.rotation.z = -l * ang; ag.position.set(l * (ancho / 4 + Math.cos(ang) * v / 2) + l * Math.sin(ang) * 0.01, alto / 2 - Math.sin(ang) * v / 2 + Math.cos(ang) * 0.01, 0); g.add(ag);
  });
  if (cresta) pon(g, caja(K, 0.028, 0.03, largo + 0.02, ND.plomoD, { grosor: gr }), 0, alto + 0.012, 0);   // la cresta de plomo del caballete
  return g;
}
/* el faldón de una nave baja: de (x1, y1), contra el muro alto, a (x2, y2), sobre el muro de afuera; l: el lado */
function faldon(g, K, x1, y1, x2, y2, len, zc, l) {
  const dx = x2 - x1, dy = y2 - y1, lar = Math.hypot(dx, dy) + 0.03, ang = Math.atan2(dy, dx);
  const m = K.malla(K.caja(lar, 0.02, len + 0.01), repetida(K, 'nd-plomoF', texPlomoF(), lar * 2, len * 7), { grosor: 0.002 });
  m.position.set(l * (x1 + x2) / 2, (y1 + y2) / 2 + 0.012, zc); m.rotation.z = l * ang; g.add(m);
}
/* el arbotante: el arco que salta desde el estribo y empuja el muro alto. u: hacia afuera desde el muro; y0 en el estribo, y1 contra el muro */
function arbotante(K, span, y0, y1, ancho = 0.038) {
  const s = new THREE.Shape(), e = 0.032, caida = Math.min(0.2, (y1 - y0) * 0.5 + 0.08);
  s.moveTo(0, y1); s.lineTo(span, y0); s.lineTo(span, y0 - caida);
  s.quadraticCurveTo(span * 0.82, y1 - e - 0.03, 0, y1 - e - 0.05); s.closePath();
  const geo = propia(new THREE.ExtrudeGeometry(s, { depth: ancho, bevelEnabled: false, curveSegments: 7 })); geo.translate(0, 0, -ancho / 2);
  return K.malla(geo, ND.calL, { grosor: 0.002 });
}
/* el estribo (la culée): el pilar macizo de afuera, con su pináculo; de xi a xo (hacia afuera), alto h */
function estribo(K, xi, xo, h, ancho = 0.075) {
  const g = new THREE.Group();
  pon(g, caja(K, xo - xi, h, ancho, ND.cal, { grosor: 0.003 }), (xi + xo) / 2, h / 2, 0);
  pon(g, caja(K, (xo - xi) * 0.55, 0.06, ancho + 0.012, ND.calD, { grosor: 0.002 }), xo - (xo - xi) * 0.275, h * 0.55, 0);   // el retallo
  const p = pinaculo(K, 0.028, 0.3, ND.calL); p.position.set(xo - 0.05, h, 0); g.add(p);
  return g;
}
/* UN TRAMO de la nave o del coro, de za a zb (za > zb), con nB tramos: la nave alta con el claristorio y el techo de
   plomo, las tribunas, las naves laterales, las capillas (si las hay) y los arbotantes en las líneas de pilares.
   arbotantes: 'largos' (los de un solo salto, de hacia 1225) o 'dobles' (los primeros, en dos tramos con un pilar en medio) */
function ndTramo(K, za, zb, nB, { capillas = true, extremos = [true, true], hasta = 'todo', arbotantes = 'largos' } = {}) {
  const g = new THREE.Group(), len = za - zb, zc = (za + zb) / 2, paso = len / nB, alto = hasta === 'todo';
  if (alto) {
    pon(g, caja(K, 2 * XN, YC, len, ND.cal, { grosor: 0.004 }), 0, YC / 2, zc);
    const te = techoPlomo(K, 2 * XN + 0.07, len, YR - YC); te.position.set(0, YC, zc); g.add(te);
  }
  [-1, 1].forEach(l => {
    if (alto) {
      lamina(g, K, repetida(K, 'nd-clar', texClaristorio(), nB, 1), len - 0.02, YC - YT2 - 0.03, l * (XN + 0.002), (YC + YT2) / 2 - 0.005, zc, l * Math.PI / 2);
      pon(g, caja(K, 0.03, 0.03, len, ND.calL, { grosor: 0.002 }), l * (XN + 0.01), YC - 0.012, zc);   // la cornisa
    }
    pon(g, caja(K, XT - XN, YT, len, ND.calD, { grosor: 0.004 }), l * (XN + XT) / 2, YT / 2, zc);             // la tribuna
    lamina(g, K, repetida(K, 'nd-trib', texTribuna(), nB, 1), len - 0.02, YT - YA2 - 0.05, l * (XT + 0.002), (YT + YA2) / 2, zc, l * Math.PI / 2);
    faldon(g, K, XN, YT2, XT, YT, len, zc, l);
    pon(g, caja(K, XA - XT, YA, len, ND.cal, { grosor: 0.004 }), l * (XT + XA) / 2, YA / 2, zc);              // la nave lateral de afuera
    faldon(g, K, XT, YA2, XA, YA, len, zc, l);
    if (capillas) {                                                                                         // las capillas entre los estribos (1235-1250), cada una con su hastial
      pon(g, caja(K, XC - XA, YCH, len, ND.cal, { grosor: 0.004 }), l * (XA + XC) / 2, YCH / 2, zc);
      lamina(g, K, repetida(K, 'nd-capilla', texCapilla(), nB, 1), len - 0.02, YCH - 0.09, l * (XC + 0.002), YCH / 2 + 0.01, zc, l * Math.PI / 2);
      for (let k = 0; k < nB; k++) { const t = tejado(K, paso - 0.08, XC - XA + 0.02, 0.13, { tipo: 'plomo', piñon: ND.cal, gr: 0.002 }); t.rotation.y = Math.PI / 2; t.position.set(l * (XA + XC) / 2, YCH, za - (k + 0.5) * paso); g.add(t); }
    } else lamina(g, K, repetida(K, 'nd-trib', texTribuna(), nB, 1), len - 0.02, YA - 0.14, l * (XA + 0.002), YA / 2 + 0.02, zc, l * Math.PI / 2);
    if (!alto) return;
    for (let k = 0; k <= nB; k++) {                                                                         // los estribos y los arbotantes
      if ((k === 0 && !extremos[0]) || (k === nB && !extremos[1])) continue;
      const z = za - k * paso, s = new THREE.Group(); s.position.z = z; if (l < 0) s.rotation.y = Math.PI; g.add(s);
      const xi = capillas ? XC - 0.2 : XA - 0.03;
      s.add(estribo(K, xi, XC + 0.04, 1.26));
      if (arbotantes === 'largos') { const a = arbotante(K, xi - XN, 1.22, 1.56); a.position.x = XN; s.add(a); }
      else {
        pon(s, caja(K, 0.07, 1.22, 0.07, ND.cal, { grosor: 0.003 }), XT, 0.61, 0); const p = pinaculo(K, 0.024, 0.22, ND.calL); p.position.set(XT, 1.22, 0); s.add(p);
        const a1 = arbotante(K, xi - XT - 0.035, 1.06, 1.2); a1.position.x = XT + 0.035; s.add(a1);
        const a2 = arbotante(K, XT - 0.035 - XN, 1.3, 1.56); a2.position.x = XN; s.add(a2);
      }
    }
  });
  return g;
}
/* EL ÁBSIDE: la cabecera redonda en gradas (el deambulatorio doble y el muro alto), con sus techos en media vuelta y los
   arbotantes que irradian. Sin las capillas de la cabecera: son de 1296-1330 */
function ndAbside(K, { hasta = 'todo', arbotantes = 'largos' } = {}) {
  const g = new THREE.Group(), t0 = Math.PI / 2, tl = Math.PI, N = 16;
  const medio = (r, y0, y1, mat, abierto = false) => { const m = K.malla(propia(new THREE.CylinderGeometry(r, r, y1 - y0, N, 1, abierto, t0, tl)), mat, { grosor: 0.004 }); m.position.set(0, (y0 + y1) / 2, ZA); g.add(m); return m; };
  const cono = (r0, r1, y0, y1, n = 8) => { const m = K.malla(propia(new THREE.CylinderGeometry(r1, r0, y1 - y0, N, 1, r1 > 0, t0, tl)), repetida(K, 'nd-plomo', texPlomo(), n, 1), { grosor: 0.003 }); m.position.set(0, (y0 + y1) / 2, ZA); g.add(m); return m; };
  medio(XA, 0, YA, repetida(K, 'nd-trib', texTribuna(), 7, 1)); cono(XA + 0.03, XT, YA, YA2, 10);
  medio(XT, YA2 - 0.02, YT, repetida(K, 'nd-trib', texTribuna(), 6, 1)); cono(XT + 0.03, XN, YT, YT2, 8);
  if (hasta !== 'todo') return g;
  medio(XN, YT2 - 0.02, YC, repetida(K, 'nd-clar', texClaristorio(), 5, 1)); cono(XN + 0.035, 0, YC, YR, 8);
  for (let i = 0; i < 5; i++) {                                                                             // los estribos y los arbotantes que irradian
    const th = t0 + tl * (i + 0.5) / 5, s = new THREE.Group(); s.position.set(0, 0, ZA); s.rotation.y = th - Math.PI / 2; g.add(s);
    const xi = XA - 0.03;
    s.add(estribo(K, xi, XC + 0.02, 1.24, 0.07));
    if (arbotantes === 'largos') { const a = arbotante(K, xi - XN, 1.2, 1.56, 0.055); a.position.x = XN; s.add(a); }   // más gruesos que los de la nave: aquí se ven de canto
    else { pon(s, caja(K, 0.065, 1.2, 0.065, ND.cal, { grosor: 0.003 }), XT, 0.6, 0); const a1 = arbotante(K, xi - XT - 0.03, 1.05, 1.18, 0.05); a1.position.x = XT + 0.03; s.add(a1); const a2 = arbotante(K, XT - 0.03 - XN, 1.28, 1.56, 0.05); a2.position.x = XN; s.add(a2); }
  }
  return g;
}
/* la fachada de un brazo del crucero (mira a +z local): el portal con su gablete, la claraboya de lancetas, la rosa y el
   hastial calado, entre dos torrecillas con pináculo. rosa: 'grande' (las de 1250-1260, de 13 m) o 'chica' (la primera) */
function fachadaCrucero(K, rosa = 'grande') {
  const g = new THREE.Group(), W = ZT0 - ZT1;
  [-1, 1].forEach(l => { pon(g, caja(K, 0.07, 1.92, 0.08, ND.cal, { grosor: 0.003 }), l * (W / 2 - 0.01), 0.96, 0.02); const p = pinaculo(K, 0.03, 0.34, ND.calL); p.position.set(l * (W / 2 - 0.01), 1.92, 0.02); g.add(p); });
  const m = marcoApuntado(K, 0.25, 0.5, 0.035, 0.035); g.add(m);
  lamina(g, K, matTex(K, 'nd-portal-ana', texPortalND('ana')), 0.18, 0.47, 0, 0.235, 0.001);
  const gs = new THREE.Shape(); gs.moveTo(-0.15, 0); gs.lineTo(0.15, 0); gs.lineTo(0, 0.17); gs.closePath();
  const gb = K.malla(propia(new THREE.ExtrudeGeometry(gs, { depth: 0.03, bevelEnabled: false })), ND.cal, { grosor: 0.002 }); gb.position.set(0, 0.47, 0.012); g.add(gb);   // el gablete sobre el portal
  lamina(g, K, repetida(K, 'nd-trib', texTribuna(), 4, 1), W - 0.12, 0.22, 0, 0.8, 0.002);                  // la claraboya
  pon(g, caja(K, W - 0.06, 0.025, 0.05, ND.calL, { grosor: 0.002 }), 0, 0.93, 0.02);
  const r = rosa === 'grande' ? 0.265 : 0.17, yr = rosa === 'grande' ? 1.26 : 1.3;
  const dc = new THREE.Mesh(propia(new THREE.CircleGeometry(r, 32)), matTex(K, 'nd-rosa-crucero', texRosaND('nd-rosa-crucero', rosa === 'grande' ? 32 : 16))); dc.position.set(0, yr, 0.003); g.add(dc);
  const an = K.malla(K.toro(r + 0.006, 0.014, Math.PI * 2, 0.8), ND.calL, { grosor: 0.002 }); an.position.set(0, yr, 0.012); g.add(an);
  // el hastial: el triángulo calado sobre el muro alto, con sus crochets y el remate
  const hs = new THREE.Shape(); hs.moveTo(-W / 2 - 0.03, 0); hs.lineTo(W / 2 + 0.03, 0); hs.lineTo(0, YR - YC + 0.06); hs.closePath();
  const hg = propia(new THREE.ShapeGeometry(hs)), uv = hg.getAttribute('uv'), p = hg.getAttribute('position');
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + W / 2 + 0.03) / (W + 0.06), p.getY(i) / (YR - YC + 0.06));
  const hm = new THREE.Mesh(hg, matTex(K, 'nd-hastial', texHastial())); hm.position.set(0, YC, 0.006); g.add(hm);
  for (let k = 1; k < 5; k++) [-1, 1].forEach(l => { const u = k / 5; pon(g, K.malla(K.cono(0.012, 0.035, 4), ND.calL, { sinTinta: true }), l * (W / 2 + 0.03) * (1 - u), YC + (YR - YC + 0.06) * u + 0.012, 0.008); });
  const rem = pinaculo(K, 0.02, 0.16, ND.calL); rem.position.set(0, YR + 0.05, 0.004); g.add(rem);
  return g;
}
/* EL CRUCERO: los dos brazos con su techo a lo ancho y sus fachadas (la del sur, la que se ve desde la orilla izquierda) */
function ndCrucero(K, { rosa = 'grande' } = {}) {
  const g = new THREE.Group(), zc = (ZT0 + ZT1) / 2, W = ZT0 - ZT1;
  pon(g, caja(K, 2 * XX, YC, W, ND.cal, { grosor: 0.004 }), 0, YC / 2, zc);
  const te = techoPlomo(K, W + 0.07, 2 * XX + 0.02, YR - YC); te.rotation.y = Math.PI / 2; te.position.set(0, YC, zc); g.add(te);
  [-1, 1].forEach(l => {
    [ZT0, ZT1].forEach((z, j) => lamina(g, K, repetida(K, 'nd-clar', texClaristorio(), 2, 1), XX - XN - 0.08, YC - YT2 - 0.03, l * (XN + XX) / 2 + l * 0.02, (YC + YT2) / 2, z + (j ? -0.002 : 0.002), j ? Math.PI : 0));
    const f = fachadaCrucero(K, rosa); f.position.set(l * XX, 0, zc); f.rotation.y = l * Math.PI / 2; g.add(f);
  });
  return g;
}
/* un rey de Judá en su nicho: el cuerpo, el manto, la cabeza y la corona */
function rey(K, alto = 0.15) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(alto * 0.13, alto * 0.18, alto * 0.74, 6), ND.calL, { grosor: 0.0015 }), 0, alto * 0.37, 0);
  pon(g, K.malla(K.esfera(alto * 0.12, 0.4), ND.calL, { grosor: 0.0015 }), 0, alto * 0.83, 0);
  pon(g, K.malla(K.cilindro(alto * 0.1, alto * 0.1, alto * 0.08, 6), ND.oro, { sinTinta: true }), 0, alto * 0.95, 0);
  return g;
}
/* LA FACHADA DEL OESTE. hasta: 'rosa' (1200-1225: los tres portales, la galería de los reyes y la rosa) o 'galeria' (con la
   gran galería). torres: 'no' | 'completas' (1250, con su baranda y sus pináculos) | 'obra' (hacia 1240: la del norte
   terminada sin remate, la del sur a dos tercios) */
function ndFachada(K, { hasta = 'galeria', torres = 'completas' } = {}) {
  const g = new THREE.Group(), FW = 1.76, zc = (Z0 + ZF) / 2, D = Z0 - ZF, hB = 1.73;
  const sillar = (w, h) => repetida(K, 'nd-sillar', texSillarND(), w * 5, h * 5);
  pon(g, caja(K, FW, hB, D, ND.cal, { grosor: 0.005 }), 0, hB / 2, zc);
  lamina(g, K, sillar(FW, hB), FW, hB, 0, hB / 2, Z0 + 0.001);
  [-1, 1].forEach(l => lamina(g, K, sillar(D, hB), D, hB, l * (FW / 2 + 0.001), hB / 2, zc, l * Math.PI / 2));
  pon(g, caja(K, FW + 0.12, 0.04, 0.16, ND.calD, { grosor: 0.003 }), 0, 0.02, Z0 + 0.04);                        // las gradas del atrio
  /* los cuatro contrafuertes que parten la fachada en tres, con estatuas a la altura de los portales (la Iglesia y la
     Sinagoga en los del medio) */
  [-0.85, -0.235, 0.235, 0.85].forEach((x, i) => {
    pon(g, caja(K, 0.095, 0.86, 0.075, ND.cal, { grosor: 0.003 }), x, 0.43, Z0 + 0.037);
    pon(g, caja(K, 0.08, hB - 0.86, 0.05, ND.cal, { grosor: 0.003 }), x, 0.86 + (hB - 0.86) / 2, Z0 + 0.025);
    const f = figura(K, 0.14, { color: ND.calL, manto: i === 1 ? '#c9b48a' : ND.cal, cabeza: ND.calL, gr: 0.0015 }); f.position.set(x, 0.38, Z0 + 0.08); g.add(f);
    pon(g, caja(K, 0.08, 0.03, 0.05, ND.calL, { grosor: 0.0015 }), x, 0.55, Z0 + 0.08);                       // el doselete sobre la estatua
  });
  [[-0.545, 0.32, 0.68, 'virgen'], [0, 0.37, 0.77, 'juicio'], [0.545, 0.32, 0.68, 'ana']].forEach(([x, w, h, tema]) => {   // los tres portales
    const m = marcoApuntado(K, w, h, 0.04, 0.045); m.position.set(x, 0, Z0); g.add(m);
    lamina(g, K, matTex(K, 'nd-portal-' + tema, texPortalND(tema)), w - 0.06, h - 0.03, x, (h - 0.03) / 2, Z0 + 0.002);
  });
  /* la galería de los reyes: los veintiocho reyes de Judá, de lado a lado */
  lamina(g, K, repetida(K, 'nd-reyes', texReyesND(), 2, 1), FW, 0.2, 0, 0.965, Z0 + 0.003);
  pon(g, caja(K, FW + 0.08, 0.03, 0.09, ND.calL, { grosor: 0.003 }), 0, 0.85, Z0 + 0.045);
  for (let i = 0; i < 28; i++) { const r = rey(K, 0.15); r.position.set(-FW / 2 + 0.03 + (i + 0.5) * (FW - 0.06) / 28, 0.865, Z0 + 0.03); g.add(r); }
  pon(g, caja(K, FW + 0.06, 0.05, 0.085, ND.cal, { grosor: 0.003 }), 0, 1.095, Z0 + 0.04);                     // la galería de la Virgen
  lamina(g, K, repetida(K, 'nd-baranda', texBaranda(), 18, 1), FW + 0.06, 0.05, 0, 1.095, Z0 + 0.083);
  /* la rosa del oeste (9,6 m), bajo su arco, con la Virgen y dos ángeles delante; a los lados, los vanos gemelos */
  const rs = new THREE.Mesh(propia(new THREE.CircleGeometry(0.205, 32)), matTex(K, 'nd-rosa', texRosaND())); rs.position.set(0, 1.42, Z0 + 0.004); g.add(rs);
  const an = K.malla(K.toro(0.212, 0.014, Math.PI * 2, 0.8), ND.calL, { grosor: 0.002 }); an.position.set(0, 1.42, Z0 + 0.014); g.add(an);
  const ar = marcoApuntado(K, 0.44, 0.58, 0.028, 0.03); ar.position.set(0, 1.13, Z0); g.add(ar);
  [[0, 0.15], [-0.1, 0.12], [0.1, 0.12]].forEach(([x, a]) => { const f = figura(K, a, { color: ND.calL, manto: x ? ND.cal : '#8fa0c8', cabeza: ND.calL, gr: 0.0015 }); f.position.set(x, 1.12, Z0 + 0.055); g.add(f); });
  [-1, 1].forEach(l => { const m = marcoApuntado(K, 0.44, 0.52, 0.026, 0.026); m.position.set(l * 0.545, 1.14, Z0); g.add(m); lamina(g, K, matTex(K, 'nd-gemelas', texGemelas()), 0.39, 0.49, l * 0.545, 1.385, Z0 + 0.002); });
  if (hasta === 'rosa') return g;
  /* LA GRAN GALERÍA: las columnillas y los arcos calados de lado a lado; detrás de las torres, su muro; en medio, el cielo */
  pon(g, caja(K, FW + 0.04, 0.03, D + 0.02, ND.calL, { grosor: 0.003 }), 0, hB + 0.015, zc);
  for (let i = 0; i < 31; i++) { const x = -FW / 2 + 0.03 + i * (FW - 0.06) / 30; if ([-0.85, -0.235, 0.235, 0.85].some(b => Math.abs(b - x) < 0.03)) continue; pon(g, K.malla(K.cilindro(0.0075, 0.0075, 0.24, 6), ND.calL, { grosor: 0.0012 }), x, hB + 0.15, Z0 - 0.02); }
  [-0.85, -0.235, 0.235, 0.85].forEach(x => pon(g, caja(K, 0.07, 0.38, 0.06, ND.cal, { grosor: 0.003 }), x, hB + 0.19, Z0 - 0.015));
  const tg = texGaleria(), mg = matTex(K, 'nd-galeria', (() => { const c = tg.clone(); c.needsUpdate = true; c.repeat.set(2, 1); c.wrapS = THREE.RepeatWrapping; return c; })());
  mg.alphaTest = 0.5; mg.side = THREE.DoubleSide;
  lamina(g, K, mg, FW, 0.12, 0, hB + 0.31, Z0 - 0.012);
  pon(g, caja(K, FW + 0.04, 0.035, 0.07, ND.cal, { grosor: 0.003 }), 0, YR - 0.02, Z0 - 0.02);
  lamina(g, K, repetida(K, 'nd-baranda', texBaranda(), 18, 1), FW + 0.04, 0.035, 0, YR - 0.02, Z0 + 0.016);
  if (torres === 'no') return g;
  /* LAS DOS TORRES (69 m): sobre la galería, cada cara con sus dos vanos altísimos, los contrafuertes de esquina, la cornisa,
     la baranda calada y los pináculos (sin agujas: así quedaron) */
  const TW = 0.64, TD = D - 0.09, tz = ZF + 0.02 + TD / 2;
  [-1, 1].forEach(l => {
    const tx = l * (0.235 + TW / 2), sur = l > 0;
    const top = torres === 'obra' ? (sur ? 2.78 : 3.22) : 3.3, t = new THREE.Group(); t.position.set(tx, 0, tz); g.add(t);
    pon(t, caja(K, TW, top - hB, TD, ND.cal, { grosor: 0.005 }), 0, hB + (top - hB) / 2, 0);
    const hv = Math.min(top - 0.06, 3.24) - 2.16, fr = Math.min(1, hv / 1.08);
    const mc = fr >= 0.99 ? matTex(K, 'nd-campanario', texCampanario()) : matTex(K, 'nd-campanario-' + fr.toFixed(2), (() => { const c = texCampanario().clone(); c.needsUpdate = true; c.repeat.set(1, fr); c.offset.set(0, 0); return c; })());   // a medio subir: solo la parte de abajo de los vanos
    if (hv > 0.2) [[0, TD / 2 + 0.002, 0, TW], [TW / 2 + 0.002, 0, Math.PI / 2, TD], [-TW / 2 - 0.002, 0, -Math.PI / 2, TD], [0, -TD / 2 - 0.002, Math.PI, TW]].forEach(([x, z, ry, w]) => lamina(t, K, mc, w - 0.08, hv, x, 2.16 + hv / 2, z, ry));
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => {                                                   // los contrafuertes de esquina
      const hc = Math.min(top, 3.2) - 2.12;
      pon(t, caja(K, 0.075, hc, 0.05, ND.cal, { grosor: 0.003 }), a * (TW / 2 - 0.05), 2.12 + hc / 2, b * (TD / 2 + 0.02));
      pon(t, caja(K, 0.05, hc, 0.075, ND.cal, { grosor: 0.003 }), a * (TW / 2 + 0.02), 2.12 + hc / 2, b * (TD / 2 - 0.05));
    });
    if (torres === 'completas' || (torres === 'obra' && !sur)) pon(t, caja(K, TW + 0.07, 0.035, TD + 0.07, ND.calL, { grosor: 0.003 }), 0, top - 0.01, 0);   // la cornisa
    if (torres === 'completas') {
      [[0, TD / 2 + 0.03, TW + 0.06, 0], [0, -TD / 2 - 0.03, TW + 0.06, 0], [TW / 2 + 0.03, 0, TD + 0.06, Math.PI / 2], [-TW / 2 - 0.03, 0, TD + 0.06, Math.PI / 2]].forEach(([x, z, w, ry]) => {
        const b = caja(K, w, 0.075, 0.025, ND.cal, { grosor: 0.002 }); b.position.set(x, top + 0.045, z); b.rotation.y = ry; t.add(b);
        lamina(t, K, repetida(K, 'nd-baranda', texBaranda(), w * 10, 1), w, 0.07, x + Math.sin(ry) * 0.0135 * Math.sign(x || 1), top + 0.045, z + Math.cos(ry) * 0.0135 * Math.sign(z || 1), ry + (x < 0 || z < 0 ? Math.PI : 0));
      });
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const p = pinaculo(K, 0.026, 0.18, ND.calL); p.position.set(a * (TW / 2 + 0.02), top + 0.01, b * (TD / 2 + 0.02)); t.add(p); });
      pon(t, caja(K, TW - 0.02, 0.02, TD - 0.02, ND.plomoD, { grosor: 0.002 }), 0, top + 0.01, 0);
    }
    if (torres === 'obra' && sur) {                                                                              // la del sur, en obra: sillares sueltos arriba, el andamio y la grúa
      for (let i = 0; i < 7; i++) pon(t, caja(K, 0.09, 0.05 + (i % 3) * 0.03, 0.08, ND.calL, { grosor: 0.002 }), -TW / 2 + 0.06 + (i % 4) * 0.17, top + 0.03, (i < 4 ? 1 : -1) * (TD / 2 - 0.05));
      const an2 = andamioND(K, TW + 0.12, 0.62, 0.07); an2.position.set(0, top - 0.5, TD / 2 + 0.05); t.add(an2);
      const an3 = andamioND(K, TD + 0.1, 0.62, 0.07); an3.rotation.y = Math.PI / 2; an3.position.set(TW / 2 + 0.05, top - 0.5, 0); t.add(an3);
      const gr = gruaRuedaND(K, 0.9); gr.position.set(-0.05, top, -0.02); gr.rotation.y = -0.5; t.add(gr); g.userData.gruaTorre = gr;
    }
  });
  return g;
}
/* LA AGUJA DEL CRUCERO (hacia 1220-1230, ~78 m): el tambor, la linterna abierta y la flecha de plomo con la cruz.
   armazon: la flecha todavía en madera, sin el plomo (hacia 1240, en la variante en obra) */
function ndAguja(K, { armazon = false } = {}) {
  const g = new THREE.Group(), c = armazon ? ND.madera : ND.plomoD, y0 = YR - 0.04;
  pon(g, K.malla(K.cilindro(0.085, 0.095, 0.2, 8), armazon ? ND.maderaD : ND.plomo, { grosor: 0.003 }), 0, y0 + 0.1, 0);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; pon(g, caja(K, 0.014, 0.28, 0.014, c, { grosor: 0.0015 }), Math.cos(a) * 0.072, y0 + 0.34, Math.sin(a) * 0.072); }
  pon(g, K.malla(K.cilindro(0.088, 0.088, 0.03, 8), c, { grosor: 0.002 }), 0, y0 + 0.49, 0);
  if (armazon) {                                                                                                 // la flecha en madera: los cuatro pies derechos que convergen y los anillos
    const H = 1.25, yb = y0 + 0.5;
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + Math.PI / 4, r = 0.07, p = K.malla(K.cilindro(0.006, 0.008, Math.hypot(H, r), 4), ND.madera, { grosor: 0.0012 }); p.position.set(Math.cos(a) * r / 2, yb + H / 2, Math.sin(a) * r / 2); p.rotation.z = Math.cos(a) * Math.atan2(r, H); p.rotation.x = -Math.sin(a) * Math.atan2(r, H); g.add(p); }
    for (let k = 1; k < 5; k++) { const rr = 0.07 * (1 - k / 5); pon(g, K.malla(K.cilindro(rr, rr, 0.012, 8), ND.madera, { grosor: 0.001 }), 0, yb + H * k / 5, 0); }
    pon(g, K.malla(K.cilindro(0.003, 0.003, 1.3, 3), '#c9b38a', { sinTinta: true }), 0.12, yb + 0.3, 0);       // la soga de subir el plomo
  } else {
    const fl = K.malla(K.cono(0.078, 1.3, 8), repetida(K, 'nd-plomo', texPlomo(), 8, 1), { grosor: 0.003 }); fl.position.y = y0 + 0.5 + 0.65; g.add(fl);
    [0.3, 0.62].forEach(u => pon(g, K.malla(K.cilindro(0.078 * (1 - u) + 0.006, 0.078 * (1 - u) + 0.006, 0.02, 8), ND.plomoL, { grosor: 0.0015 }), 0, y0 + 0.5 + 1.3 * u, 0));
    pon(g, caja(K, 0.008, 0.11, 0.008, ND.oro, { grosor: 0.001 }), 0, y0 + 1.86, 0); pon(g, caja(K, 0.05, 0.008, 0.008, ND.oro, { grosor: 0.001 }), 0, y0 + 1.88, 0);   // la cruz
  }
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const p = pinaculo(K, 0.02, 0.16, armazon ? ND.madera : ND.plomo); p.position.set(a * 0.1, y0, b * 0.1); g.add(p); });
  return g;
}
/* LA CATEDRAL VIEJA (la de antes de 1163, románica: la nave alta con sus naves bajas, la torre del oeste con su chapitel y el
   ábside), donde la obra nueva va a poner la nave: siguió en uso hasta que el coro nuevo se consagró */
function viejaCatedralND(K) {
  const g = new THREE.Group(), L = 1.7, rom = (w, h) => repetida(K, 'nd-romanica', texRomanica(), w * 4, 1);
  pon(g, caja(K, 0.42, 0.7, L, '#ddd0b0', { grosor: 0.004 }), 0, 0.35, 0);
  [-1, 1].forEach(l => { lamina(g, K, rom(L), L - 0.04, 0.22, l * 0.212, 0.56, 0, l * Math.PI / 2); pon(g, caja(K, 0.2, 0.4, L, '#d4c6a4', { grosor: 0.004 }), l * 0.31, 0.2, 0); lamina(g, K, rom(L), L - 0.04, 0.2, l * 0.412, 0.2, 0, l * Math.PI / 2);
    const t = caja(K, 0.24, 0.02, L + 0.02, ND.tejaD, { grosor: 0.002 }); t.position.set(l * 0.31, 0.43, 0); t.rotation.z = -l * 0.32; g.add(t); });
  const te = tejado(K, 0.48, L + 0.04, 0.24, { tipo: 'teja', piñon: '#ddd0b0' }); te.position.y = 0.7; g.add(te);
  const ab = K.malla(propia(new THREE.CylinderGeometry(0.21, 0.21, 0.6, 12, 1, false, Math.PI / 2, Math.PI)), '#ddd0b0', { grosor: 0.004 }); ab.position.set(0, 0.3, -L / 2); g.add(ab);
  const ca = K.malla(propia(new THREE.CylinderGeometry(0, 0.23, 0.22, 12, 1, false, Math.PI / 2, Math.PI)), ND.tejaD, { grosor: 0.003 }); ca.position.set(0, 0.71, -L / 2); g.add(ca);
  const to = new THREE.Group(); to.position.z = L / 2 + 0.12; g.add(to);
  pon(to, caja(K, 0.3, 1.12, 0.26, '#d8caa8', { grosor: 0.004 }), 0, 0.56, 0);
  lamina(to, K, matTex(K, 'nd-romanica', texRomanica()), 0.26, 0.26, 0, 0.88, 0.132); lamina(to, K, matTex(K, 'nd-romanica', texRomanica()), 0.22, 0.26, 0.152, 0.88, 0, Math.PI / 2);
  const ch = K.malla(K.cono(0.24, 0.44, 4), ND.tejaD, { grosor: 0.003 }); ch.rotation.y = Math.PI / 4; ch.position.y = 1.34; to.add(ch);
  pon(to, caja(K, 0.11, 0.2, 0.01, ND.hueco, { sinTinta: true }), 0, 0.1, 0.132);
  return g;
}
/* ---------- la obra ---------- */
/* el andamio de madera: los pies derechos en dos filas, los largueros, las tablas y las cruces */
function andamioND(K, w, h, d = 0.07) {
  const g = new THREE.Group(), n = Math.max(2, Math.round(w / 0.13));
  for (let i = 0; i <= n; i++) for (const z of [0, d]) pon(g, K.malla(K.cilindro(0.0045, 0.0055, h, 4), ND.madera, { grosor: 0.001 }), -w / 2 + i * w / n, h / 2, z);
  for (let y = 0.14; y < h; y += 0.16) { for (const z of [0, d]) pon(g, caja(K, w, 0.007, 0.007, ND.madera, { grosor: 0.0008 }), 0, y, z); pon(g, caja(K, w, 0.006, d + 0.01, ND.maderaL, { grosor: 0.0008 }), 0, y + 0.006, d / 2); }
  for (let i = 0; i < n; i += 2) { const b = caja(K, 0.006, Math.hypot(w / n, h * 0.5), 0.006, ND.maderaD, { sinTinta: true }); b.position.set(-w / 2 + (i + 0.5) * w / n, h * 0.4, d); b.rotation.z = Math.atan2(w / n, h * 0.5); g.add(b); }
  return g;
}
/* LA GRÚA DE RUEDA: la rueda donde camina un peón (gira: userData.rueda), el mástil, la pluma, la soga y el sillar que sube */
export function gruaRuedaND(K, s = 1) {
  const g = new THREE.Group(); g.userData.vivo = true; g.scale.setScalar(s);
  const rueda = new THREE.Group(); rueda.position.set(-0.12, 0.2, 0); g.add(rueda); g.userData.rueda = rueda;
  [-0.045, 0.045].forEach(z => { const t = K.malla(K.toro(0.18, 0.01, Math.PI * 2, 0.7), ND.maderaD, { grosor: 0.0015 }); t.position.z = z; rueda.add(t); });
  for (let k = 0; k < 4; k++) { const r = caja(K, 0.36, 0.012, 0.012, ND.madera, { grosor: 0.001 }); r.rotation.z = k * Math.PI / 4; rueda.add(r); }
  for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; pon(rueda, caja(K, 0.012, 0.012, 0.1, ND.madera, { sinTinta: true }), Math.cos(a) * 0.18, Math.sin(a) * 0.18, 0); }
  [-1, 1].forEach(l => { const p = caja(K, 0.018, 0.26, 0.018, ND.madera, { grosor: 0.0012 }); p.position.set(-0.12 + l * 0.06, 0.1, 0.07); p.rotation.z = l * 0.25; g.add(p); });
  pon(g, caja(K, 0.026, 0.84, 0.026, ND.madera, { grosor: 0.0015 }), 0.05, 0.42, 0);                            // el mástil
  const pl = caja(K, 0.72, 0.022, 0.022, ND.madera, { grosor: 0.0015 }); pl.position.set(0.3, 0.8, 0); pl.rotation.z = 0.32; g.add(pl);   // la pluma
  const tie = caja(K, 0.012, 0.42, 0.012, ND.maderaD, { sinTinta: true }); tie.position.set(0.18, 0.62, 0); tie.rotation.z = -0.9; g.add(tie);
  pon(g, K.malla(K.cilindro(0.003, 0.003, 0.5, 3), '#c9b38a', { sinTinta: true }), 0.64, 0.66, 0);              // la soga
  pon(g, caja(K, 0.09, 0.06, 0.07, ND.calL, { grosor: 0.0015 }), 0.64, 0.39, 0);                                 // el sillar
  pon(g, caja(K, 0.12, 0.03, 0.12, ND.maderaD, { grosor: 0.0012 }), 0.05, 0.015, 0);
  return g;
}
/* un montón de sillares recién labrados, con alguno a medio cortar */
function sillaresND(K, n = 7, semilla = 3) {
  const g = new THREE.Group();
  for (let i = 0; i < n; i++) { const a = (i * 2.399 + semilla) % 6.28, r = 0.05 + (i % 3) * 0.06, h = 0.05 + (i % 2) * 0.02; pon(g, caja(K, 0.11, h, 0.08, i % 3 ? ND.calL : ND.cal, { grosor: 0.0018 }), Math.cos(a) * r, h / 2 + (i > 4 ? 0.06 : 0), Math.sin(a) * r, a); }
  return g;
}
/* la logia de los canteros: el cobertizo de madera con techo de teja donde se labraba la piedra, con el banco y las plantillas */
function logiaND(K) {
  const g = new THREE.Group();
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => pon(g, caja(K, 0.03, 0.34, 0.03, ND.madera, { grosor: 0.0015 }), a * 0.28, 0.17, b * 0.15));
  pon(g, caja(K, 0.6, 0.3, 0.025, ND.revoque, { grosor: 0.002 }), 0, 0.15, -0.15);
  const t = tejado(K, 0.4, 0.68, 0.18, { tipo: 'teja', piñon: ND.madera, gr: 0.002 }); t.rotation.y = Math.PI / 2; t.position.y = 0.34; g.add(t);
  pon(g, caja(K, 0.32, 0.03, 0.12, ND.maderaD, { grosor: 0.0015 }), 0, 0.14, 0.02); pon(g, caja(K, 0.1, 0.06, 0.07, ND.calL, { grosor: 0.0015 }), 0.05, 0.185, 0.02);
  [[-0.12, 0.008], [0.14, -0.01]].forEach(([x, r]) => { const p = caja(K, 0.07, 0.11, 0.004, '#e8dcc2', { grosor: 0.001 }); p.position.set(x, 0.22, -0.135); p.rotation.z = r; g.add(p); });   // las plantillas de madera colgadas
  return g;
}
/* la carreta de bueyes con un bloque de las canteras de la orilla izquierda */
function carretaND(K, piedra = true) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.34, 0.03, 0.18, ND.madera, { grosor: 0.0015 }), 0, 0.1, 0);
  [-1, 1].forEach(l => { const r = K.malla(K.cilindro(0.075, 0.075, 0.02, 10), ND.maderaD, { grosor: 0.0015 }); r.rotation.x = Math.PI / 2; r.position.set(0, 0.075, l * 0.1); g.add(r); });
  pon(g, caja(K, 0.3, 0.01, 0.01, ND.maderaD, { sinTinta: true }), 0.3, 0.1, 0);                                    // la vara
  if (piedra) pon(g, caja(K, 0.16, 0.09, 0.12, ND.calL, { grosor: 0.0018 }), -0.02, 0.16, 0);
  return g;
}

/* ============================================================
   LAS CASAS DE PARÍS hacia 1200 (la vara: pocas, con carácter, tres tonos, su puerta y su ventana y algo afuera)
   - El entramado (pan de bois): la planta baja de piedra con el arco de la tienda y los postigos que de día bajan como
     mostrador, los pisos de madera y yeso que vuelan sobre la calle, el piñón a la calle con la viga de la polea. París
     revocaba su entramado con el yeso de Montmartre: por eso las casas se ven claras, crema, ocre y rosadas.
   - La piedra: las casas de los canónigos y de los ricos, de sillar, con los vanos gemelos de medio punto (como las casas
     románicas de Cluny) o apuntados con trébol, el alero a la calle y la torrecilla de la escalera.
   - El arrabal: los burgos de San Marcelo y San Germán, donde vivían los estudiantes pobres: muros de barro encalado entre
     postes, techos de paja hasta casi el suelo, la huerta con su cerca de varas trenzadas.
   (Viollet-le-Duc, «Maison», en el Dictionnaire, t. VI; Le Goff, «La civilisation de l'Occident médiéval», 1964; el plano
   de Truschet y Hoyau, hacia 1550, para el color de los techos de teja y pizarra.)
   ============================================================ */
/* el entramado: el yeso entre las vigas, con la ventana de postigos. estilo: 'cruces' (cruces de San Andrés), 'postes'
   (pies derechos apretados) o 'riostras' (las diagonales de las esquinas). ventana: false en los muros de los costados */
function texEntramadoC(estilo, yeso, madera = ND.entramado, ventana = true) {
  return textura(`ent-${estilo}-${yeso}-${madera}-${ventana}`, 64, 64, (g, w, h) => {
    g.fillStyle = yeso; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(0,0,0,.05)'; for (let i = 0; i < 40; i++) g.fillRect((i * 37) % w, (i * 23) % h, 3, 2);
    g.fillStyle = madera; g.fillRect(0, 0, w, 4); g.fillRect(0, h - 5, w, 5); g.fillRect(0, 0, 4, h); g.fillRect(w - 4, 0, 4, h);
    g.lineWidth = 3.4; g.strokeStyle = madera;
    if (estilo === 'postes') { for (let x = 10; x < w - 6; x += 9) g.fillRect(x, 0, 3, h); g.fillRect(0, h * 0.52, w, 3); }
    else if (estilo === 'cruces') { g.fillRect(w / 2 - 2, 0, 4, h); g.fillRect(0, h * 0.55, w, 3); g.beginPath(); g.moveTo(4, h * 0.56); g.lineTo(w / 2 - 2, h - 5); g.moveTo(w / 2 - 2, h * 0.56); g.lineTo(4, h - 5); g.moveTo(w / 2 + 2, h * 0.56); g.lineTo(w - 4, h - 5); g.moveTo(w - 4, h * 0.56); g.lineTo(w / 2 + 2, h - 5); g.stroke(); }
    else { g.fillRect(w / 3 - 1.5, 0, 3, h); g.fillRect(2 * w / 3 - 1.5, 0, 3, h); g.beginPath(); g.moveTo(4, h * 0.45); g.lineTo(w / 3, 4); g.moveTo(w - 4, h * 0.45); g.lineTo(2 * w / 3, 4); g.moveTo(4, h * 0.6); g.lineTo(w / 3, h - 5); g.moveTo(w - 4, h * 0.6); g.lineTo(2 * w / 3, h - 5); g.stroke(); }
    if (ventana) {
      const vx = estilo === 'riostras' ? w / 2 : w * 0.72, vy = h * 0.2, vw = 16, vh = 20;
      g.fillStyle = madera; g.fillRect(vx - vw / 2 - 3, vy - 3, vw + 6, vh + 6);
      g.fillStyle = '#2c2a2e'; g.fillRect(vx - vw / 2, vy, vw, vh);
      g.fillStyle = '#6f8aa0'; g.fillRect(vx - vw / 2 + 2, vy + 2, vw / 2 - 3, vh / 2 - 3);                        // el reflejo del vidrio o del lienzo encerado
      g.fillStyle = madera; g.fillRect(vx - 1.2, vy, 2.4, vh); g.fillRect(vx - vw / 2, vy + vh / 2 - 1, vw, 2.4);
      g.fillStyle = '#8a6a42'; g.fillRect(vx + vw / 2 + 3, vy - 1, 7, vh + 2);                                      // el postigo abierto
    }
  }, { repetir: true });
}
/* la planta baja de la tienda: el sillar, el arco ancho del obrador y la puerta de la casa */
const texTienda = (arco = 'apuntado') => textura('pa-tienda-' + arco, 64, 48, (g, w, h) => {
  g.fillStyle = '#e4d6b4'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(110,90,62,.3)'; for (let y = 0; y < h; y += 8) { g.fillRect(0, y, w, 1.1); for (let x = (y / 8 % 2) * 7; x < w; x += 14) g.fillRect(x, y, 1.1, 8); }
  g.fillStyle = '#c9b78f'; g.beginPath(); arco === 'apuntado' ? pathApuntado(g, 22, h, 36, h - 6) : (g.moveTo(4, h), g.lineTo(4, 22), g.arc(22, 22, 18, Math.PI, 0), g.lineTo(40, h), g.closePath()); g.fill();
  g.fillStyle = '#3a302a'; g.beginPath(); arco === 'apuntado' ? pathApuntado(g, 22, h, 30, h - 10) : (g.moveTo(7, h), g.lineTo(7, 22), g.arc(22, 22, 15, Math.PI, 0), g.lineTo(37, h), g.closePath()); g.fill();
  g.fillStyle = '#a8784a'; for (let i = 0; i < 4; i++) g.fillRect(10 + i * 6, h - 16, 4, 6);                        // lo que se vende, en el fondo
  g.fillStyle = '#c9b78f'; g.fillRect(45, 12, 14, h - 12); g.fillStyle = '#5e3f28'; g.fillRect(47, 15, 10, h - 15);  // la puerta de la casa
  g.fillStyle = '#2f2622'; g.fillRect(48, 22, 8, 1.5); g.fillRect(48, 36, 8, 1.5); g.fillStyle = '#c9a35a'; g.fillRect(54, 30, 2, 2);
});
/* la fachada de piedra: por piso, los vanos gemelos (de medio punto, románicos, o apuntados con trébol, góticos) */
const texPiedraVanos = (tipo) => textura('pa-piedra-' + tipo, 64, 48, (g, w, h) => {
  g.fillStyle = ND.cal; g.fillRect(0, 0, w, h);
  const tonos = ['#ebe0c5', '#e4d8bb', '#efe6cf'];
  for (let y = 0, f = 0; y < h; y += 8, f++) for (let x = (f % 2) * -7, k = 0; x < w; x += 14, k++) { g.fillStyle = tonos[(f + k) % 3]; g.fillRect(x + 1, y + 1, 13, 7); }
  g.fillStyle = 'rgba(110,90,62,.28)'; for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 1);
  for (const cx of [20, 46]) {
    g.fillStyle = ND.calS; g.beginPath(); tipo === 'gotica' ? pathApuntado(g, cx, h - 8, 18, 30) : (g.moveTo(cx - 9, h - 8), g.lineTo(cx - 9, 20), g.arc(cx, 20, 9, Math.PI, 0), g.lineTo(cx + 9, h - 8), g.closePath()); g.fill();
    for (const dx of [-4, 4]) { g.fillStyle = '#2e2b2e'; g.beginPath(); tipo === 'gotica' ? pathApuntado(g, cx + dx, h - 10, 6, 20) : (g.moveTo(cx + dx - 3, h - 10), g.lineTo(cx + dx - 3, 24), g.arc(cx + dx, 24, 3, Math.PI, 0), g.lineTo(cx + dx + 3, h - 10), g.closePath()); g.fill(); }
    g.fillStyle = ND.calL; g.fillRect(cx - 1, 24, 2, h - 34);                                                         // la columnilla del medio
    if (tipo === 'gotica') { g.fillStyle = '#2e2b2e'; g.beginPath(); g.arc(cx, 18, 2.6, 0, 7); g.fill(); }
    g.fillStyle = ND.calD; g.fillRect(cx - 11, h - 8, 22, 2.5);
  }
});
/* el muro del arrabal: barro encalado entre postes toscos, con la puerta baja y el ventanuco */
const texArrabal = (cal, conPuerta = true) => textura(`pa-arrabal-${cal}-${conPuerta}`, 64, 40, (g, w, h) => {
  g.fillStyle = cal; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,96,60,.12)'; for (let i = 0; i < 30; i++) g.fillRect((i * 29) % w, (i * 17) % h, 5, 3);
  g.fillStyle = 'rgba(150,120,80,.35)'; g.fillRect(0, h - 5, w, 5);                                                  // el zócalo salpicado de barro
  g.fillStyle = '#6a4a2c'; for (const x of [0, 21, 42, 60]) g.fillRect(x, 0, 4, h); g.fillRect(0, 0, w, 3);
  if (conPuerta) { g.fillStyle = '#4f3622'; g.fillRect(26, 12, 12, h - 12); g.fillStyle = '#3a2818'; g.fillRect(26, 12, 12, 2); g.fillRect(31, 12, 1.5, h - 12); g.fillStyle = '#2c2a2e'; g.fillRect(48, 12, 8, 7); g.fillStyle = '#7a5a36'; g.fillRect(56, 11, 4, 9); }
});
/* la paja del techo: las hiladas de bálago, gruesas y peinadas */
const texPajaT = () => textura('pa-paja-techo', 64, 64, (g, w, h) => {
  g.fillStyle = ND.paja; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 10) { g.fillStyle = ND.pajaD; g.fillRect(0, y, w, 2); g.fillStyle = 'rgba(255,240,190,.35)'; g.fillRect(0, y + 3, w, 1.5); }
  g.fillStyle = 'rgba(120,90,40,.25)'; for (let i = 0; i < 70; i++) g.fillRect((i * 13) % w, (i * 7) % h, 1, 5);
}, { repetir: true });
/* las cuatro caras de una caja con su textura (frente y fondo con `mf`, costados con `ml`) */
function caras(g, K, w, h, d, y0, mf, ml, { z0 = 0, fondo = true } = {}) {
  lamina(g, K, mf, w, h, 0, y0 + h / 2, z0 + d / 2 + 0.002);
  if (fondo) lamina(g, K, ml, w, h, 0, y0 + h / 2, z0 - d / 2 - 0.002, Math.PI);
  [-1, 1].forEach(l => lamina(g, K, ml, d, h, l * (w / 2 + 0.002), y0 + h / 2, z0, l * Math.PI / 2));
}
/* EL ENTRAMADO con el piñón a la calle (+z). pisos: los altos de madera que vuelan, cada uno un poco más afuera */
export function casaEntramado(K, { w = 0.42, d = 0.5, h1 = 0.3, hp = 0.25, pisos = 2, vol = 0.035, yeso = ND.revoque, madera = ND.entramado, estilo = 'cruces', techo = 'teja', tienda = true, letrero = null, arco = 'apuntado', alero = false } = {}) {
  const g = new THREE.Group();
  pon(g, caja(K, w, h1, d, '#e4d6b4', { grosor: 0.003 }), 0, h1 / 2, 0);
  lamina(g, K, matTex(K, 'pa-tienda-' + arco, texTienda(arco)), w, h1, 0, h1 / 2, d / 2 + 0.002);
  [-1, 1].forEach(l => lamina(g, K, repetida(K, 'pa-sillarC', texSillarND(), d * 5, h1 * 5), d, h1, l * (w / 2 + 0.002), h1 / 2, 0, l * Math.PI / 2));
  if (tienda) {                                                                                                      // los postigos de la tienda: el de abajo, mostrador; el de arriba, alero
    pon(g, caja(K, w * 0.5, 0.018, 0.09, ND.maderaL, { grosor: 0.0015 }), -w * 0.16, h1 * 0.42, d / 2 + 0.045);
    const al = caja(K, w * 0.52, 0.014, 0.1, ND.madera, { grosor: 0.0015 }); al.position.set(-w * 0.16, h1 * 0.92, d / 2 + 0.04); al.rotation.x = 0.35; g.add(al);
    for (let i = 0; i < 3; i++) pon(g, K.malla(K.esfera(0.018, 0.4), ['#c98a3a', '#9a4a32', '#d8b24a'][i], { grosor: 0.001 }), -w * 0.28 + i * w * 0.12, h1 * 0.42 + 0.02, d / 2 + 0.05);   // lo que se vende
  }
  const mf = matTex(K, `ent-${estilo}-${yeso}-${madera}-true`, texEntramadoC(estilo, yeso, madera, true)), ml = matTex(K, `ent-${estilo}-${yeso}-${madera}-false`, texEntramadoC(estilo, yeso, madera, false));
  let y = h1, dd = d;
  for (let k = 1; k <= pisos; k++) {
    const zc = k * vol / 2; dd = d + k * vol;
    pon(g, caja(K, w + 0.01, hp, dd, yeso, { grosor: 0.003 }), 0, y + hp / 2, zc);
    caras(g, K, w + 0.01, hp, dd, y, mf, ml, { z0: zc });
    pon(g, caja(K, w + 0.03, 0.022, 0.03, madera, { grosor: 0.0015 }), 0, y + 0.011, zc + dd / 2 - 0.006);           // la viga del voladizo
    for (const x of [-w / 2 + 0.03, w / 2 - 0.03]) pon(g, caja(K, 0.02, 0.04, 0.03, madera, { sinTinta: true }), x, y - 0.012, zc + dd / 2 - 0.03);   // las ménsulas
    y += hp;
  }
  const zt = pisos * vol / 2, ht = Math.max(0.16, w * 0.85);
  if (alero) {                                                                                                       // el alero a la calle: el caballete paralelo a la fachada y la buhardilla con su puerta de la polea
    const ha = dd * 0.62, t = tejado(K, dd + 0.08, w + 0.08, ha, { tipo: techo, piñon: yeso, gr: 0.003 }); t.rotation.y = Math.PI / 2; t.position.set(0, y, zt); g.add(t);
    const bz = zt + dd * 0.22, by = y + ha * 0.28;
    pon(g, caja(K, 0.13, 0.15, 0.12, yeso, { grosor: 0.002 }), 0, by + 0.075, bz);
    const bt = tejado(K, 0.16, 0.14, 0.09, { tipo: techo, piñon: yeso, gr: 0.0015 }); bt.position.set(0, by + 0.15, bz + 0.01); g.add(bt);
    pon(g, caja(K, 0.06, 0.08, 0.004, ND.maderaD, { sinTinta: true }), 0, by + 0.06, bz + 0.062);
    pon(g, caja(K, 0.015, 0.015, 0.08, madera, { grosor: 0.001 }), 0, by + 0.17, bz + 0.09);
    pon(g, caja(K, 0.06, 0.12, 0.06, '#cdbf9f', { grosor: 0.002 }), w * 0.36, y + ha * 0.55, zt - dd * 0.12);
    if (letrero) { pon(g, caja(K, 0.12, 0.008, 0.008, ND.hierro, { sinTinta: true }), w / 2 + 0.05, h1 + 0.06, d / 2 + 0.03); pon(g, caja(K, 0.008, 0.08, 0.07, letrero, { grosor: 0.0012 }), w / 2 + 0.1, h1 + 0.015, d / 2 + 0.03); }
    g.userData.alto = y + ha; return g;
  }
  const t = tejado(K, w + 0.07, dd + 0.08, ht, { tipo: techo, piñon: yeso, gr: 0.003 }); t.position.set(0, y, zt); g.add(t);
  const ps = new THREE.Shape(); ps.moveTo(-w / 2 + 0.03, 0); ps.lineTo(w / 2 - 0.03, 0); ps.lineTo(0, ht - 0.04); ps.closePath();   // el piñón con su entramado
  const pg = propia(new THREE.ShapeGeometry(ps)), uv = pg.getAttribute('uv'), pp = pg.getAttribute('position');
  for (let i = 0; i < pp.count; i++) uv.setXY(i, (pp.getX(i) + w / 2) / w, pp.getY(i) / ht);
  const pm = new THREE.Mesh(pg, matTex(K, `ent-riostras-${yeso}-${madera}-true`, texEntramadoC('riostras', yeso, madera, true))); pm.position.set(0, y + 0.005, zt + dd / 2 + 0.042); g.add(pm);
  const vg = caja(K, 0.02, 0.02, 0.09, madera, { grosor: 0.0012 }); vg.position.set(0, y + ht - 0.06, zt + dd / 2 + 0.07); g.add(vg);   // la viga de la polea
  pon(g, caja(K, 0.06, 0.12, 0.06, '#cdbf9f', { grosor: 0.002 }), w * 0.28, y + ht * 0.5, zt - dd * 0.2);           // la chimenea
  if (letrero) {                                                                                                     // el letrero colgado de su hierro
    pon(g, caja(K, 0.12, 0.008, 0.008, ND.hierro, { sinTinta: true }), w / 2 + 0.05, h1 + 0.06, d / 2 + 0.03);
    pon(g, caja(K, 0.008, 0.08, 0.07, letrero, { grosor: 0.0012 }), w / 2 + 0.1, h1 + 0.015, d / 2 + 0.03);
  }
  g.userData.alto = y + ht; return g;
}
/* LA CASA DE PIEDRA: sillar, los vanos gemelos por piso, el portal de la planta baja y, si se pide, la torrecilla de la escalera.
   alero: el caballete paralelo a la calle (el alero a la calle) en vez del piñón */
export function casaPiedra(K, { w = 0.5, d = 0.42, hp = 0.27, pisos = 2, vanos = 'romana', techo = 'teja', alero = true, torre = false, cal = ND.cal } = {}) {
  const g = new THREE.Group(), h = hp * (pisos + 1) * 0.92;
  pon(g, caja(K, w, h, d, cal, { grosor: 0.003 }), 0, h / 2, 0);
  const vv = matTex(K, 'pa-piedra-' + vanos, texPiedraVanos(vanos)), sl = repetida(K, 'pa-sillarC', texSillarND(), d * 5, h * 5);
  for (let k = 1; k <= pisos; k++) lamina(g, K, vv, w - 0.02, hp * 0.9, 0, (k + 0.5) * hp * 0.92, d / 2 + 0.002);
  { const ar = vanos === 'romana' ? 'redondo' : 'apuntado'; lamina(g, K, matTex(K, 'pa-tienda-' + ar, texTienda(ar)), w - 0.02, hp * 0.92, 0, hp * 0.46, d / 2 + 0.002); }
  [-1, 1].forEach(l => lamina(g, K, sl, d, h, l * (w / 2 + 0.002), h / 2, 0, l * Math.PI / 2));
  lamina(g, K, repetida(K, 'pa-sillarC', texSillarND(), w * 5, h * 5), w, h, 0, h / 2, -d / 2 - 0.002, Math.PI);
  for (let k = 1; k <= pisos; k++) pon(g, caja(K, w + 0.02, 0.018, d + 0.02, ND.calL, { grosor: 0.0015 }), 0, k * hp * 0.92, 0);   // las impostas
  const ht = (alero ? d : w) * 0.72, t = tejado(K, (alero ? d : w) + 0.07, (alero ? w : d) + 0.06, ht, { tipo: techo, piñon: cal, gr: 0.003 });
  if (alero) t.rotation.y = Math.PI / 2; t.position.y = h; g.add(t);
  if (alero) { const dm = caja(K, 0.12, 0.13, 0.1, cal, { grosor: 0.002 }); dm.position.set(-w * 0.22, h + ht * 0.3, d * 0.24); g.add(dm); const dt = tejado(K, 0.15, 0.12, 0.08, { tipo: techo, piñon: cal, gr: 0.0015 }); dt.position.set(-w * 0.22, h + ht * 0.3 + 0.065, d * 0.26); g.add(dt); pon(g, caja(K, 0.05, 0.05, 0.004, '#2e2b2e', { sinTinta: true }), -w * 0.22, h + ht * 0.3 + 0.01, d * 0.24 + 0.052); }   // la buhardilla
  pon(g, caja(K, 0.07, 0.15, 0.07, ND.calD, { grosor: 0.002 }), w * 0.32, h + ht * 0.55, -d * 0.15);              // la chimenea
  if (torre) {                                                                                                       // la torrecilla de la escalera de caracol, con su chapitel de pizarra
    const r = 0.075, tx = w / 2 + 0.02, tz = d / 2 - 0.04;
    pon(g, K.malla(K.cilindro(r, r, h + 0.12, 10), cal, { grosor: 0.003 }), tx, (h + 0.12) / 2, tz);
    for (let k = 0; k < 3; k++) pon(g, caja(K, 0.012, 0.05, 0.01, '#2e2b2e', { sinTinta: true }), tx + 0.045, 0.18 + k * 0.2, tz + 0.06);
    pon(g, K.malla(K.cono(r + 0.02, 0.24, 10), ND.pizarra, { grosor: 0.002 }), tx, h + 0.12 + 0.12, tz);
  }
  g.userData.alto = h + ht; return g;
}
/* LA CASA DEL ARRABAL: un piso de barro encalado y el techo de paja que baja casi hasta el suelo; o el albergue de dos pisos */
export function casaArrabal(K, { w = 0.5, d = 0.36, h = 0.3, techo = 'paja', cal = ND.blanco, dos = false, cobertizo = false } = {}) {
  const g = new THREE.Group(), H = dos ? h * 1.8 : h;
  pon(g, caja(K, w, H, d, cal, { grosor: 0.003 }), 0, H / 2, 0);
  const mf = matTex(K, `pa-arrabal-${cal}-true`, texArrabal(cal, true)), ml = matTex(K, `pa-arrabal-${cal}-false`, texArrabal(cal, false));
  lamina(g, K, mf, w, h, 0, h / 2, d / 2 + 0.002);
  if (dos) lamina(g, K, matTex(K, `ent-postes-${cal}-${ND.entramado}-true`, texEntramadoC('postes', cal, '#6a4a2c', true)), w, H - h, 0, h + (H - h) / 2, d / 2 + 0.002);
  [-1, 1].forEach(l => lamina(g, K, ml, d, H, l * (w / 2 + 0.002), H / 2, 0, l * Math.PI / 2));
  const ht = d * 0.95;
  if (techo === 'paja') {                                                                                            // el bálago: grueso, con el lomo de barro y hierba arriba
    const ang = Math.atan2(ht, d / 2 + 0.06), lado = Math.hypot(d / 2 + 0.06, ht) + 0.04, mat = repetida(K, 'pa-paja-techo', texPajaT(), lado * 3, w * 3);
    [-1, 1].forEach(l => { const s = K.malla(K.caja(w + 0.1, 0.05, lado), mat, { grosor: 0.003 }); s.rotation.x = l * ang; s.position.set(0, H + ht / 2 - 0.02, l * (d / 4 + 0.03)); g.add(s); });
    [-1, 1].forEach(l => { const s = new THREE.Shape(); s.moveTo(-d / 2 - 0.02, 0); s.lineTo(d / 2 + 0.02, 0); s.lineTo(0, ht - 0.02); s.closePath(); const m = K.malla(propia(new THREE.ExtrudeGeometry(s, { depth: 0.01, bevelEnabled: false })), cal, { grosor: 0.002 }); m.rotation.y = Math.PI / 2; m.position.set(l * w / 2 - 0.005, H, 0); g.add(m); });
    const lo = K.malla(K.cilindro(0.03, 0.03, w + 0.12, 6), '#8a8a50', { grosor: 0.002 }); lo.rotation.z = Math.PI / 2; lo.position.y = H + ht + 0.005; g.add(lo);
  } else { const t = tejado(K, d + 0.08, w + 0.08, ht, { tipo: techo, piñon: cal, gr: 0.003 }); t.rotation.y = Math.PI / 2; t.position.y = H; g.add(t); }
  if (cobertizo) {                                                                                                   // el cobertizo de la leña, con su techo de tablas
    [-1, 1].forEach(l => pon(g, caja(K, 0.02, 0.22, 0.02, '#6a4a2c', { grosor: 0.0012 }), w / 2 + 0.2, 0.11, l * (d / 2 - 0.04)));
    const tc = caja(K, 0.26, 0.015, d + 0.04, ND.maderaD, { grosor: 0.0015 }); tc.position.set(w / 2 + 0.11, 0.24, 0); tc.rotation.z = -0.3; g.add(tc);
    for (let i = 0; i < 6; i++) { const l = K.malla(K.cilindro(0.016, 0.016, 0.16, 6), i % 2 ? '#8a6a42' : '#a07a4a', { grosor: 0.001 }); l.rotation.x = Math.PI / 2; l.position.set(w / 2 + 0.06 + (i % 3) * 0.035, 0.02 + Math.floor(i / 3) * 0.032, 0); g.add(l); }
  }
  g.userData.alto = H + ht; return g;
}
/* ---------- lo de afuera ---------- */
export function tonel(K) { const g = new THREE.Group(); pon(g, K.malla(K.cilindro(0.04, 0.045, 0.1, 10), '#8a6040', { grosor: 0.0015 }), 0, 0.05, 0); [0.02, 0.08].forEach(y => pon(g, K.malla(K.cilindro(0.046, 0.046, 0.008, 10), ND.hierro, { sinTinta: true }), 0, y, 0)); return g; }
export function pozo(K, techado = true) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.08, 0.085, 0.1, 12), ND.calD, { grosor: 0.002 }), 0, 0.05, 0);
  pon(g, K.malla(K.cilindro(0.065, 0.065, 0.004, 12), '#4f6f78', { sinTinta: true }), 0, 0.098, 0);
  [-1, 1].forEach(l => pon(g, caja(K, 0.015, 0.2, 0.015, ND.maderaD, { grosor: 0.001 }), l * 0.075, 0.2, 0));
  pon(g, K.malla(K.cilindro(0.012, 0.012, 0.17, 6), ND.madera, { grosor: 0.001 }), 0, 0.26, 0).rotation.z = Math.PI / 2;
  if (techado) { const t = tejado(K, 0.2, 0.12, 0.07, { tipo: 'teja', piñon: ND.madera, gr: 0.0015 }); t.rotation.y = Math.PI / 2; t.position.y = 0.3; g.add(t); }
  pon(g, K.malla(K.cilindro(0.02, 0.016, 0.03, 8), '#8a6a42', { grosor: 0.001 }), 0.03, 0.17, 0);
  return g;
}
/* la cerca de varas trenzadas (el plessis) de la huerta, de largo l */
export function cerca(K, l) { const g = new THREE.Group(); pon(g, caja(K, l, 0.08, 0.018, '#9a7a4a', { grosor: 0.0015 }), 0, 0.05, 0); for (let x = -l / 2; x <= l / 2 + 1e-6; x += 0.12) pon(g, caja(K, 0.014, 0.11, 0.014, '#6a4a2c', { sinTinta: true }), x, 0.055, 0); return g; }
export function almiar(K) { const g = new THREE.Group(); pon(g, K.malla(K.cilindro(0.1, 0.11, 0.12, 10), ND.paja, { grosor: 0.002 }), 0, 0.06, 0); pon(g, K.malla(K.cono(0.11, 0.14, 10), ND.pajaD, { grosor: 0.002 }), 0, 0.19, 0); return g; }
export function huerta(K, w, d) {
  const g = new THREE.Group();
  pon(g, caja(K, w, 0.012, d, '#9a7a52', { sinTinta: true, sombra: false }), 0, 0.006, 0);
  for (let z = -d / 2 + 0.05; z < d / 2; z += 0.08) for (let x = -w / 2 + 0.05; x < w / 2; x += 0.07) pon(g, K.malla(K.esfera(0.024, 0.4), (Math.round(x * 50 + z * 30)) % 3 ? '#6f9a48' : '#8ab05a', { grosor: 0.001 }), x, 0.024, z);
  return g;
}
/* los árboles de París: el olmo de copa redonda (tres tonos), el álamo de la orilla, el sauce, el frutal del huerto, la vid */
export function arbolPa(K, tipo = 'olmo', s = 1, semilla = 1) {
  const g = new THREE.Group(), r = n => { const x = Math.sin(semilla * 91.7 + n * 37.3) * 43758.5; return x - Math.floor(x); };
  const tr = (h, rr) => pon(g, K.malla(K.cilindro(rr * 0.7, rr, h, 6), '#6b5338', { grosor: 0.002 }), 0, h / 2, 0);
  if (tipo === 'alamo') { tr(0.4 * s, 0.03 * s); const c = K.malla(K.esfera(0.13 * s, 0.5), '#5f8a3e', { grosor: 0.004 }); c.scale.set(1, 3.0, 1); c.position.y = 0.62 * s; g.add(c); const c2 = K.malla(K.esfera(0.09 * s, 0.4), '#7fa652', { grosor: 0.003 }); c2.scale.set(1, 2.4, 1); c2.position.set(0.03 * s, 0.78 * s, 0.03 * s); g.add(c2); return g; }
  if (tipo === 'sauce') { tr(0.24 * s, 0.035 * s); [[0, 0.36, 0, 0.17, '#8aa45a'], [0.08, 0.3, 0.04, 0.12, '#a2b86c'], [-0.07, 0.3, -0.03, 0.12, '#748f48']].forEach(([x, y, z, rr, c]) => { const m = K.malla(K.esfera(rr * s, 0.5), c, { grosor: 0.003 }); m.scale.set(1, 1.3, 1); m.position.set(x * s, y * s, z * s); g.add(m); }); return g; }
  if (tipo === 'frutal') { tr(0.16 * s, 0.025 * s); [[0, 0.24, 0, 0.12, '#6f9a48'], [0.05, 0.29, 0.03, 0.08, '#8ab35a']].forEach(([x, y, z, rr, c]) => pon(g, K.malla(K.esfera(rr * s, 0.45), c, { grosor: 0.003 }), x * s, y * s, z * s)); for (let i = 0; i < 4; i++) pon(g, K.malla(K.esfera(0.014 * s, 0.3), i % 2 ? '#d84a32' : '#e6b23a', { sinTinta: true }), Math.cos(i * 1.7) * 0.1 * s, 0.22 * s + (i % 2) * 0.05 * s, Math.sin(i * 1.7) * 0.1 * s); return g; }
  tr(0.3 * s, 0.035 * s);                                                                                            // el olmo
  [[0, 0.44, 0, 0.2, '#557f38'], [0.1, 0.5, 0.05, 0.15, '#6f9a46'], [-0.09, 0.47, -0.04, 0.15, '#4b7232'], [0.02, 0.6, 0.02, 0.12, '#88b35a']].forEach(([x, y, z, rr, c], i) => pon(g, K.malla(K.esfera(rr * s * (0.9 + r(i) * 0.2), 0.5), c, { grosor: 0.004 }), x * s, y * s, z * s));
  return g;
}

/* ============================================================
   LA SEGUNDA PIEZA (alto 2-3): 'sanvictor' (la abadía de los canónigos, la escuela del claustro), 'genoveva' (la Montaña
   con su abadía en lo alto y las viñas) o 'louvre' (el castillo de Felipe Augusto, 1190-1202)
   ============================================================ */
/* la torre románica: los vanos gemelos de medio punto, piso por piso */
const texTorreRom = () => textura('pa-torre-rom', 64, 96, (g, w, h) => {
  g.fillStyle = '#e2d5b4'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(110,90,62,.28)'; for (let y = 0; y < h; y += 8) { g.fillRect(0, y, w, 1.1); for (let x = (y / 8 % 2) * 7; x < w; x += 14) g.fillRect(x, y, 1.1, 8); }
  for (const [y0, hh] of [[10, 34], [54, 30]]) for (const cx of [20, 44]) {
    g.fillStyle = '#c4b28c'; g.beginPath(); g.moveTo(cx - 9, y0 + hh); g.lineTo(cx - 9, y0 + 9); g.arc(cx, y0 + 9, 9, Math.PI, 0); g.lineTo(cx + 9, y0 + hh); g.fill();
    g.fillStyle = '#2e2a2c'; g.beginPath(); g.moveTo(cx - 6, y0 + hh); g.lineTo(cx - 6, y0 + 10); g.arc(cx, y0 + 10, 6, Math.PI, 0); g.lineTo(cx + 6, y0 + hh); g.fill();
    g.fillStyle = '#e8dcbc'; g.fillRect(cx - 1, y0 + 12, 2, hh - 12);
  }
  g.fillStyle = '#c9b993'; g.fillRect(0, 48, w, 3);
});
/* una iglesia románica de abadía: nave con sus naves bajas, crucero, ábside y torre sobre el crucero o al costado.
   Mira al poniente (+x); el claustro queda al sur (+z) */
function iglesiaAbadia(K, { L = 1.45, W = 0.4, H = 0.66, torre = 'crucero', techo = 'pizarra', aguja = true } = {}) {
  const g = new THREE.Group(), cal = '#e2d5b4', rom = n => repetida(K, 'nd-romanica', texRomanica(), n, 1);
  const x0 = -L / 2, xc = x0 + 0.42;                                                       // el crucero, cerca del ábside (al este, -x)
  pon(g, caja(K, L, H, W, cal, { grosor: 0.004 }), 0, H / 2, 0);
  [-1, 1].forEach(l => { lamina(g, K, rom(4), L - 0.5, 0.2, 0.2, H - 0.14, l * (W / 2 + 0.002), l > 0 ? 0 : Math.PI);
    pon(g, caja(K, L - 0.45, H * 0.58, 0.15, '#d8caa8', { grosor: 0.003 }), 0.22, H * 0.29, l * (W / 2 + 0.075)); lamina(g, K, rom(3), L - 0.5, H * 0.4, 0.22, H * 0.3, l * (W / 2 + 0.152), l > 0 ? 0 : Math.PI);
    const t = caja(K, L - 0.43, 0.018, 0.2, techo === 'pizarra' ? ND.pizarraD : ND.tejaD, { grosor: 0.0015 }); t.position.set(0.22, H * 0.6 + 0.02, l * (W / 2 + 0.08)); t.rotation.x = l * 0.42; g.add(t); });
  const te = tejado(K, W + 0.06, L + 0.04, W * 0.7, { tipo: techo, piñon: cal, gr: 0.003 }); te.rotation.y = Math.PI / 2; te.position.y = H; g.add(te);
  pon(g, caja(K, 0.3, H, W + 0.5, cal, { grosor: 0.004 }), xc, H / 2, 0);                  // el crucero
  const tc = tejado(K, 0.34, W + 0.54, W * 0.7, { tipo: techo, piñon: cal, gr: 0.003 }); tc.position.set(xc, H, 0); g.add(tc);
  const ab = K.malla(propia(new THREE.CylinderGeometry(W * 0.45, W * 0.45, H * 0.85, 12, 1, false, Math.PI, Math.PI)), cal, { grosor: 0.004 }); ab.position.set(x0, H * 0.425, 0); g.add(ab);
  const ca = K.malla(propia(new THREE.CylinderGeometry(0, W * 0.47, W * 0.4, 12, 1, false, Math.PI, Math.PI)), techo === 'pizarra' ? ND.pizarra : ND.teja, { grosor: 0.003 }); ca.position.set(x0, H * 0.85 + W * 0.2, 0); g.add(ca);
  // la fachada del poniente: el portal de medio punto, el óculo y los contrafuertes
  pon(g, caja(K, 0.03, 0.2, 0.13, '#cdbd96', { grosor: 0.002 }), L / 2 + 0.01, 0.1, 0); pon(g, caja(K, 0.006, 0.15, 0.09, ND.hueco, { sinTinta: true }), L / 2 + 0.025, 0.075, 0);
  pon(g, K.malla(K.cilindro(0.05, 0.05, 0.01, 12), '#4a5f9a', { sinTinta: true }), L / 2 + 0.004, H * 0.66, 0).rotation.z = Math.PI / 2;
  [-1, 1].forEach(l => pon(g, caja(K, 0.05, H * 0.8, 0.05, cal, { grosor: 0.002 }), L / 2 + 0.02, H * 0.4, l * (W / 2 - 0.02)));
  if (torre) {
    const tx = torre === 'crucero' ? xc : L / 2 - 0.15, tz = torre === 'crucero' ? 0 : W / 2 + 0.2, TH = 0.78, TW = 0.3;
    pon(g, caja(K, TW, H + TH, TW, '#e2d5b4', { grosor: 0.004 }), tx, (H + TH) / 2, tz);
    [[0, TW / 2 + 0.002, 0], [TW / 2 + 0.002, 0, Math.PI / 2], [0, -TW / 2 - 0.002, Math.PI], [-TW / 2 - 0.002, 0, -Math.PI / 2]].forEach(([x, z, ry]) => lamina(g, K, matTex(K, 'pa-torre-rom', texTorreRom()), TW - 0.03, TH - 0.06, tx + x, H + TH / 2, tz + z, ry));
    pon(g, caja(K, TW + 0.04, 0.03, TW + 0.04, '#d8caa8', { grosor: 0.002 }), tx, H + TH, tz);
    if (aguja) { const a = K.malla(K.cono(TW * 0.62, 0.72, 8), '#d2c3a0', { grosor: 0.003 }); a.rotation.y = Math.PI / 8; a.position.set(tx, H + TH + 0.36, tz); g.add(a); [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a2, b]) => { const p = pinaculo(K, 0.02, 0.14, '#d8caa8'); p.position.set(tx + a2 * TW * 0.42, H + TH, tz + b * TW * 0.42); g.add(p); }); pon(g, caja(K, 0.006, 0.07, 0.006, ND.hierro, { sinTinta: true }), tx, H + TH + 0.76, tz); }
    else { const a = K.malla(K.cono(TW * 0.78, 0.32, 4), techo === 'pizarra' ? ND.pizarra : ND.teja, { grosor: 0.003 }); a.rotation.y = Math.PI / 4; a.position.set(tx, H + TH + 0.16, tz); g.add(a); }
    g.userData.alto = H + TH + (aguja ? 0.8 : 0.32);
  }
  return g;
}
/* el claustro: cuatro galerías de arcos sobre columnillas pareadas alrededor del jardín con el pozo */
function claustro(K, S = 1.15, { techo = 'teja' } = {}) {
  const g = new THREE.Group(), P = 0.17;
  pon(g, caja(K, S - 2 * P, 0.014, S - 2 * P, ND.pasto, { sinTinta: true, sombra: false }), 0, 0.007, 0);
  [[0, -(S / 2 - P / 2), 0], [0, S / 2 - P / 2, Math.PI], [S / 2 - P / 2, 0, -Math.PI / 2], [-(S / 2 - P / 2), 0, Math.PI / 2]].forEach(([x, z, ry]) => {
    const ga = new THREE.Group(); ga.position.set(x, 0, z); ga.rotation.y = ry; g.add(ga);
    pon(ga, caja(K, S, 0.012, P, '#ddd0b0', { sinTinta: true }), 0, 0.006, 0);
    pon(ga, caja(K, S, 0.05, 0.035, '#e2d5b4', { grosor: 0.0015 }), 0, 0.025, P / 2 - 0.02);                       // el murete
    for (let k = 0; k < 8; k++) { const xx = -S / 2 + P + 0.03 + k * (S - 2 * P - 0.06) / 7; [-0.012, 0.012].forEach(d => pon(ga, K.malla(K.cilindro(0.007, 0.007, 0.14, 5), '#efe6cf', { grosor: 0.001 }), xx + d, 0.12, P / 2 - 0.02)); }
    pon(ga, caja(K, S, 0.05, 0.04, '#e2d5b4', { grosor: 0.0015 }), 0, 0.215, P / 2 - 0.02);
    const t = caja(K, S + 0.02, 0.016, P + 0.06, techo === 'teja' ? ND.teja : ND.pizarra, { grosor: 0.0015 }); t.position.set(0, 0.27, 0.01); t.rotation.x = 0.4; ga.add(t);
    pon(ga, caja(K, S, 0.24, 0.025, '#d8caa8', { grosor: 0.0015 }), 0, 0.12, -P / 2 + 0.012);                      // el muro de atrás
  });
  const po = pozo(K, false); po.scale.setScalar(0.9); g.add(po);
  return g;
}
/* el muro bajo del recinto, con su portería */
function recinto(K, x0, x1, z0, z1, { puerta = 'x1', alto = 0.16 } = {}) {
  const g = new THREE.Group(), cal = '#ddd0b0';
  const tramo = (ax, az, bx, bz) => { const l = Math.hypot(bx - ax, bz - az); if (l < 0.02) return; const m = caja(K, l, alto, 0.05, cal, { grosor: 0.002 }); m.position.set((ax + bx) / 2, alto / 2, (az + bz) / 2); m.rotation.y = -Math.atan2(bz - az, bx - ax); g.add(m); };
  const zm = (z0 + z1) / 2;
  tramo(x0, z0, x1, z0); tramo(x0, z1, x1, z1); tramo(x0, z0, x0, z1);
  if (puerta === 'x1') {
    tramo(x1, z0, x1, zm - 0.12); tramo(x1, zm + 0.12, x1, z1);
    const p = new THREE.Group(); p.position.set(x1, 0, zm); g.add(p);
    [-1, 1].forEach(l => pon(p, caja(K, 0.1, 0.34, 0.08, cal, { grosor: 0.002 }), 0, 0.17, l * 0.14));
    pon(p, caja(K, 0.12, 0.08, 0.36, cal, { grosor: 0.002 }), 0, 0.3, 0);
    const t = tejado(K, 0.4, 0.16, 0.12, { tipo: 'teja', piñon: cal, gr: 0.002 }); t.rotation.y = Math.PI / 2; t.position.y = 0.34; p.add(t);
  } else tramo(x1, z0, x1, z1);
  return g;
}
/* LA ABADÍA DE SAN VÍCTOR (1113: la fundó Guillermo de Champeaux, el maestro de Abelardo, y allí escribió Hugo el
   Didascalicon): la iglesia con su torre sobre el crucero, el claustro, el ala del capítulo con la biblioteca arriba (la
   librería de San Víctor fue de las grandes de París), el huerto y el canal que los canónigos le sacaron al Bièvre en 1148 */
function sanVictor(K) {
  const g = new THREE.Group();
  const ig = iglesiaAbadia(K, { L: 1.75, W: 0.42, H: 0.68, torre: 'crucero' }); ig.position.set(0.05, 0, -0.68); g.add(ig);
  const cl = claustro(K, 1.15); cl.position.set(0.2, 0, 0.17); g.add(cl);
  const al = casaPiedra(K, { w: 1.1, d: 0.36, hp: 0.25, pisos: 1, vanos: 'gotica', techo: 'teja', alero: true }); al.rotation.y = Math.PI / 2; al.position.set(-0.6, 0, 0.17); g.add(al);   // el capítulo abajo; arriba, el dormitorio y la librería
  g.add(recinto(K, -1.35, 1.6, -1.2, 1.55));
  const ca = new THREE.Group(); ca.position.set(0.1, 0, 1.12); g.add(ca);                                          // el canal del Bièvre, con su puentecito
  pon(ca, caja(K, 2.9, 0.012, 0.16, '#6f9fb0', { sinTinta: true, sombra: false }), 0, 0.012, 0);
  [-1, 1].forEach(l => pon(ca, caja(K, 2.9, 0.03, 0.03, '#cdbd96', { grosor: 0.0015 }), 0, 0.015, l * 0.095));
  pon(ca, caja(K, 0.14, 0.025, 0.26, ND.madera, { grosor: 0.0015 }), 0.75, 0.04, 0);
  [[-1.0, 1.38], [-0.7, 1.4], [-0.4, 1.36], [0.35, 1.38], [1.15, 1.36], [1.35, 0.6], [1.35, -0.1], [-1.15, 0.7]].forEach(([x, z], i) => { const a = arbolPa(K, i % 3 ? 'frutal' : 'olmo', i % 3 ? 1.4 : 1.15, i + 3); a.position.set(x, 0, z); g.add(a); });
  const hu = huerta(K, 0.5, 0.26); hu.position.set(1.0, 0, 0.85); g.add(hu);
  g.userData.ficha = { titulo: 'La abadía de San Víctor', texto: 'los canónigos del claustro: aquí Hugo escribió que nada de lo que se aprende es superfluo' };
  return g;
}
/* el monte: una loma con su meseta y sus viñas en hileras; color por cara (viña, hierba, camino) */
export function loma(K, rx, rz, h, { vinas = true, semilla = 5, camino = true } = {}) {
  const g = new THREE.Group(), N = 36, geo = new THREE.PlaneGeometry(rx * 2.08, rz * 2.08, N, N).toNonIndexed(); geo.rotateX(-Math.PI / 2);
  const alt = (x, z) => { const d = Math.hypot(x / rx, z / rz); if (d >= 1) return -0.02; const k = Math.min(1, (1 - d) / 0.6); return h * k * k * (3 - 2 * k) - 0.02; };
  const p = geo.getAttribute('position'); for (let i = 0; i < p.count; i++) p.setY(i, alt(p.getX(i), p.getZ(i)));
  geo.computeVertexNormals();
  const col = [], c = new THREE.Color();
  for (let i = 0; i < p.count; i += 3) {
    const x = (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3, z = (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3, y = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3, d = Math.hypot(x / rx, z / rz);
    const ang = Math.atan2(z, x), cam = camino && Math.abs(((ang + Math.PI * 2) % (Math.PI * 2)) - (0.6 + d * 2.2)) < 0.12 && d < 0.95;
    if (d >= 1) c.set(ND.pasto); else if (cam) c.set('#e2cf9e'); else if (y > h * 0.86) c.set(['#a6c466', '#9cbc5e'][Math.floor((x + z) * 4) & 1]);
    else if (vinas && d > 0.25) c.set(Math.floor(y * 26) % 2 ? '#8faa52' : '#b39a62'); else c.set('#9abb5c');
    for (let j = 0; j < 3; j++) col.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); propia(geo);
  g.add(K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false }));
  if (vinas) {                                                                                                       // las cepas de la viña, en hileras sobre las curvas de nivel
    const cep = [], m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3();
    for (let k = 3; k < 22; k++) { const y = (k + 0.5) / 26; if (y > h * 0.84) break; for (let a = 0; a < Math.PI * 2; a += 0.11) { let lo = 0, hi = 1; for (let it = 0; it < 14; it++) { const mid = (lo + hi) / 2; alt(Math.cos(a) * rx * mid, Math.sin(a) * rz * mid) > y ? lo = mid : hi = mid; } const x = Math.cos(a) * rx * lo, z = Math.sin(a) * rz * lo; if (camino && Math.abs(a - (0.6 + lo * 2.2)) < 0.16) continue; cep.push([x, alt(x, z), z]); } }
    const vi = K.instancias(K.esfera(1, 0.35), '#5f7f3a', cep.length, { sinTinta: true });
    cep.forEach(([x, y, z], i) => { m4.compose(v.set(x, y + 0.025, z), q.identity(), s.set(0.03, 0.035, 0.03)); vi.setMatrixAt(i, m4); });
    g.add(vi);
  }
  g.userData.alt = alt; return g;
}
/* SANTA GENOVEVA EN LO ALTO DE LA MONTAÑA: la loma con sus viñas (el clos de la abadía), la iglesia de la abadía con la torre
   románica (la base de la que hoy llaman torre de Clovis), el claustro, el muro y, en la ladera, San Esteban del Monte (1222).
   Al pie, la disputa: en estas laderas enseñó Abelardo cuando lo echaron de la Cité */
/* lo de arriba de la Montaña (sin la loma): la iglesia de la abadía con su torre, el claustro y el muro */
export function genovevaCima(K) {
  const top = new THREE.Group();
  const ig = iglesiaAbadia(K, { L: 1.15, W: 0.36, H: 0.55, torre: 'lado', techo: 'teja', aguja: false }); ig.position.set(0.0, 0, -0.18); top.add(ig);
  const cl = claustro(K, 0.62, { techo: 'teja' }); cl.position.set(0.08, 0, 0.42); top.add(cl);
  top.add(recinto(K, -0.78, 0.78, -0.62, 0.8, { alto: 0.12 }));
  top.userData.alto = ig.userData.alto;
  return top;
}
function genovevaMontana(K) {
  const g = new THREE.Group(), H = 0.62, lo = loma(K, 1.75, 1.5, H); g.add(lo);
  const top = genovevaCima(K); top.position.y = H - 0.025; g.add(top); const ig = { userData: top.userData };
  const se = iglesiaAbadia(K, { L: 0.62, W: 0.24, H: 0.36, torre: null, techo: 'teja' }); se.position.set(0.95, lo.userData.alt(0.95, -0.55) - 0.01, -0.55); g.add(se);
  [[-1.2, 0.5], [-1.0, -0.8], [1.35, 0.55], [-0.4, 1.25], [0.6, -1.25]].forEach(([x, z], i) => { const a = arbolPa(K, i % 2 ? 'olmo' : 'frutal', i % 2 ? 1.0 : 1.3, 30 + i); a.position.set(x, lo.userData.alt(x, z) - 0.01, z); g.add(a); });
  g.userData.alto = H + (ig.userData.alto || 0);
  g.userData.ficha = { titulo: 'Santa Genoveva', texto: 'la abadía en lo alto de la Montaña, entre viñas: en sus laderas nació la universidad' };
  return g;
}
/* el foso con agua alrededor de un recinto (un anillo rectangular), y el borde de piedra */
function foso(K, w, d, a = 0.22) {
  const g = new THREE.Group(), agua = '#6f9fb0';
  [[0, -(d / 2 + a / 2), w + 2 * a, a], [0, d / 2 + a / 2, w + 2 * a, a], [-(w / 2 + a / 2), 0, a, d], [w / 2 + a / 2, 0, a, d]].forEach(([x, z, ww, dd]) => pon(g, caja(K, ww, 0.01, dd, agua, { sinTinta: true, sombra: false }), x, 0.006, z));
  [[0, -(d / 2 + a + 0.02), w + 2 * a + 0.08, 0.04], [0, d / 2 + a + 0.02, w + 2 * a + 0.08, 0.04], [-(w / 2 + a + 0.02), 0, 0.04, d + 2 * a + 0.08], [w / 2 + a + 0.02, 0, 0.04, d + 2 * a + 0.08]].forEach(([x, z, ww, dd]) => pon(g, caja(K, ww, 0.04, dd, '#cdbd96', { grosor: 0.0015 }), x, 0.02, z));
  return g;
}
/* EL LOUVRE DE FELIPE AUGUSTO (1190-1202): el recinto casi cuadrado (72 × 78 m) con sus torres redondas y las dos puertas de
   torres gemelas, el foso con agua y, al medio, la Gran Torre (15 m de diámetro, 31 m de alto) con su foso seco, su
   cadalso de madera y el chapitel de pizarra. El rey guardaba ahí el tesoro y los archivos */
function louvreFA(K) {
  const g = new THREE.Group(), W = 2.4, D = 2.6, HM = 0.42, cal = '#e4d8bb';
  pon(g, caja(K, W, 0.03, D, '#d8cba9', { sinTinta: true }), 0, 0.015, 0);                                       // el patio
  g.add(foso(K, W + 0.1, D + 0.1));
  const sl = (w, h) => repetida(K, 'nd-sillar', texSillarND(), w * 5, h * 5);
  const muro = (ax, az, bx, bz) => {
    const l = Math.hypot(bx - ax, bz - az), m = new THREE.Group(); m.position.set((ax + bx) / 2, 0, (az + bz) / 2); m.rotation.y = -Math.atan2(bz - az, bx - ax); g.add(m);
    pon(m, caja(K, l, HM, 0.1, cal, { grosor: 0.003 }), 0, HM / 2, 0); lamina(m, K, sl(l, HM), l, HM, 0, HM / 2, 0.052); lamina(m, K, sl(l, HM), l, HM, 0, HM / 2, -0.052, Math.PI);
    for (let x = -l / 2 + 0.05; x < l / 2; x += 0.1) pon(m, caja(K, 0.05, 0.05, 0.11, cal, { grosor: 0.0012 }), x, HM + 0.025, 0);   // las almenas
  };
  const torre = (x, z, r, h, cono = true) => {
    pon(g, K.malla(K.cilindro(r, r * 1.06, h, 12), cal, { grosor: 0.003 }), x, h / 2, z);
    for (let k = 0; k < 2; k++) pon(g, caja(K, 0.012, 0.06, 0.01, ND.hueco, { sinTinta: true }), x + r * 0.7, h * (0.35 + k * 0.3), z + r * 0.7);
    if (cono) pon(g, K.malla(K.cono(r * 1.18, r * 2.2, 12), ND.pizarra, { grosor: 0.003 }), x, h + r * 1.1, z);
  };
  const cs = [[-W / 2, -D / 2], [W / 2, -D / 2], [W / 2, D / 2], [-W / 2, D / 2]];
  for (let i = 0; i < 4; i++) { const [ax, az] = cs[i], [bx, bz] = cs[(i + 1) % 4]; if (i === 1 || i === 2) { const mx = (ax + bx) / 2, mz = (az + bz) / 2, ux = (bx - ax), uz = (bz - az), l = Math.hypot(ux, uz); muro(ax, az, mx - ux / l * 0.22, mz - uz / l * 0.22); muro(mx + ux / l * 0.22, mz + uz / l * 0.22, bx, bz); [-1, 1].forEach(s => torre(mx + s * ux / l * 0.2, mz + s * uz / l * 0.2, 0.1, 0.56)); pon(g, caja(K, 0.12, 0.012, 0.36, ND.madera, { grosor: 0.0015 }), mx + (i === 1 ? 0.2 : 0), 0.02, mz + (i === 2 ? 0.2 : 0)).rotation.y = i === 1 ? Math.PI / 2 : 0; } else muro(ax, az, bx, bz); }
  cs.forEach(([x, z]) => torre(x, z, 0.14, 0.64));
  [[-W / 2, -D / 4], [-W / 2, D / 4], [-W / 4, -D / 2], [W / 4, -D / 2]].forEach(([x, z]) => torre(x, z, 0.1, 0.56));
  [[-W / 2 + 0.25, 0, 0.36, D - 0.5], [0, -D / 2 + 0.22, W - 0.5, 0.3]].forEach(([x, z, w, d], i) => {             // los aposentos del rey contra los muros del fondo
    pon(g, caja(K, w, 0.36, d, ND.revoque, { grosor: 0.003 }), x, 0.18, z);
    const t = tejado(K, Math.min(w, d) + 0.06, Math.max(w, d) + 0.04, 0.22, { tipo: 'teja', piñon: ND.revoque, gr: 0.002 }); if (i === 1) t.rotation.y = Math.PI / 2; t.position.set(x, 0.36, z); g.add(t);
  });
  // LA GRAN TORRE: el foso seco, el talud, el fuste con sus saeteras, el cadalso de madera y el chapitel
  const sec = K.malla(K.cilindro(0.5, 0.5, 0.02, 24), '#8f8268', { sinTinta: true, sombra: false }); sec.position.y = 0.03; g.add(sec);
  const tt = K.malla(propia(new THREE.CylinderGeometry(0.31, 0.37, 1.5, 20)), repetida(K, 'nd-sillar', texSillarND(), 8, 6), { grosor: 0.004 }); tt.position.y = 0.75; g.add(tt);
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + 0.3; pon(g, caja(K, 0.014, 0.09, 0.01, ND.hueco, { sinTinta: true }), Math.cos(a) * 0.335, 0.5 + (k % 2) * 0.45, Math.sin(a) * 0.335).rotation.y = -a + Math.PI / 2; }
  pon(g, K.malla(K.cilindro(0.36, 0.36, 0.12, 20), ND.madera, { grosor: 0.003 }), 0, 1.55, 0);                    // el cadalso
  for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; pon(g, caja(K, 0.012, 0.12, 0.012, ND.maderaD, { sinTinta: true }), Math.cos(a) * 0.362, 1.55, Math.sin(a) * 0.362); }
  pon(g, K.malla(K.cono(0.39, 0.66, 20), ND.pizarra, { grosor: 0.004 }), 0, 1.61 + 0.33, 0);
  pon(g, caja(K, 0.006, 0.1, 0.006, ND.oro, { sinTinta: true }), 0, 2.32, 0);
  pon(g, caja(K, 0.12, 0.03, 0.22, ND.calD, { grosor: 0.0015 }), 0.34, 0.06, 0.34).rotation.y = -Math.PI / 4;     // el puente sobre el foso seco
  g.userData.ficha = { titulo: 'El Louvre', texto: 'el castillo de Felipe Augusto: la Gran Torre guardaba el tesoro y los archivos del rey' };
  return g;
}
export function segunda(K, variante = VARIANTES.segunda) {
  return variante === 'genoveva' ? genovevaMontana(K) : variante === 'louvre' ? louvreFA(K) : sanVictor(K);
}

/* ============================================================
   LA CATEDRAL: catedral(K, variante, etapa)
   variante: 'completa' (hacia 1250: las torres, la aguja, las rosas del crucero y las capillas de la nave), 'obra' (el
   taller vivo hacia 1240: la torre del sur a dos tercios con su andamio y su grúa, la aguja todavía en madera, la logia de
   los canteros, los sillares y las carretas) o 'isla' (la catedral completa en la punta de la Cité: el atrio, el Hôtel-Dieu,
   el palacio del obispo, las casas de los canónigos del claustro, el muelle).
   etapa: 0 (1163: la catedral vieja y los cimientos del coro), 1 (1182: el coro consagrado), 2 (1200-1225: la nave y la
   fachada hasta la rosa) o 3 (la que dice la variante). La fachada mira a +z; el flanco sur, a +x.
   ============================================================ */
/* una sala del Hôtel-Dieu: piedra, lancetas altas por los costados, el hastial con su ventanal hacia el atrio y la espadaña */
function salaHospital(K, L = 2.0, W = 0.36, H = 0.46) {
  const g = new THREE.Group();
  pon(g, caja(K, W, H, L, ND.cal, { grosor: 0.003 }), 0, H / 2, 0);
  [-1, 1].forEach(l => lamina(g, K, repetida(K, 'nd-trib', texTribuna(), L / 0.22, 1), L - 0.04, H - 0.08, l * (W / 2 + 0.002), H / 2, 0, l * Math.PI / 2));
  const t = tejado(K, W + 0.06, L + 0.04, W * 0.85, { tipo: 'teja', piñon: ND.cal, gr: 0.003 }); t.position.y = H; g.add(t);
  lamina(g, K, matTex(K, 'nd-gemelas', texGemelas()), W * 0.8, H * 0.9, 0, H * 0.5, L / 2 + 0.002);
  pon(g, caja(K, 0.05, 0.14, 0.04, ND.cal, { grosor: 0.0015 }), 0, H + W * 0.85 + 0.04, L / 2 - 0.02);
  return g;
}
/* LA PUNTA DE LA CITÉ alrededor de la catedral: la isla con su muelle de piedra, el atrio enlosado, el Hôtel-Dieu sobre el
   brazo chico del Sena, el palacio del obispo con su capilla y su jardín, las casas de los canónigos (en el claustro de
   Notre-Dame estaba la escuela de la catedral: allí enseñaron Guillermo de Champeaux y Abelardo, y allí vivía el canónigo
   Fulberto con su sobrina Eloísa) y el arranque del Petit-Pont */
function islaND(K) {
  const g = new THREE.Group();
  const s = new THREE.Shape(), X0 = -1.85, X1 = 2.3, Z0i = -3.35, Z1i = 4.3, r = 0.9;
  s.moveTo(X0 + r, Z0i); s.lineTo(X1 - r, Z0i); s.quadraticCurveTo(X1, Z0i, X1, Z0i + r); s.lineTo(X1, Z1i - 0.3); s.quadraticCurveTo(X1, Z1i, X1 - 0.3, Z1i); s.lineTo(X0 + 0.3, Z1i); s.quadraticCurveTo(X0, Z1i, X0, Z1i - 0.3); s.lineTo(X0, Z0i + r); s.quadraticCurveTo(X0, Z0i, X0 + r, Z0i);
  const isla = K.malla(propia(new THREE.ExtrudeGeometry(s, { depth: 0.22, bevelEnabled: false, curveSegments: 6 })), '#d9cba6', { grosor: 0.004 }); isla.rotation.x = Math.PI / 2; isla.position.y = 0.0; g.add(isla);   // el muelle: la isla de piedra, a ras del agua
  const pa = new THREE.Mesh(propia(new THREE.PlaneGeometry(2.7, 1.45)), repetida(K, 'nd-sillar', texSillarND(), 6, 3)); pa.rotation.x = -Math.PI / 2; pa.position.set(0.05, 0.004, Z0 + 0.74); pa.receiveShadow = true; g.add(pa);   // el atrio enlosado
  pon(g, caja(K, 1.0, 0.008, 1.2, ND.pasto, { sinTinta: true, sombra: false }), 1.7, 0.004, -2.6);                 // el jardín del obispo, en la punta
  const hd = new THREE.Group(); hd.position.set(1.72, 0, 2.6); g.add(hd);                                          // el Hôtel-Dieu: dos salas sobre el agua
  [-0.2, 0.2].forEach(dx => { const sa = salaHospital(K, 2.2, 0.36, 0.44); sa.position.x = dx; hd.add(sa); });
  const pal = casaPiedra(K, { w: 1.2, d: 0.42, hp: 0.26, pisos: 2, vanos: 'romana', techo: 'teja', alero: true, torre: true }); pal.rotation.y = Math.PI / 2; pal.position.set(1.75, 0, -0.85); g.add(pal);   // el palacio del obispo (el de Mauricio de Sully)
  const cap = iglesiaAbadia(K, { L: 0.62, W: 0.24, H: 0.42, torre: null, techo: 'pizarra' }); cap.position.set(1.7, 0, 0.62); g.add(cap);   // su capilla
  [[-1.5, 3.55, 0.36], [-1.52, 2.85, 0.32], [-1.5, 1.95, 0.38], [-1.52, 0.95, 0.34]].forEach(([x, z, w], i) => {   // las casas de los canónigos
    const c = i % 2 ? casaEntramado(K, { w, d: 0.42, pisos: 1, estilo: 'riostras', yeso: [ND.revoque, ND.ocre][i % 2], techo: 'pizarra', tienda: false }) : casaPiedra(K, { w: w + 0.06, d: 0.38, pisos: 1, vanos: 'gotica', alero: false, techo: 'teja' });
    c.rotation.y = Math.PI / 2; c.position.set(x, 0, z); g.add(c);
  });
  const sj = iglesiaAbadia(K, { L: 0.5, W: 0.22, H: 0.34, torre: null, techo: 'teja' }); sj.rotation.y = Math.PI / 2; sj.position.set(-0.95, 0, 3.75); g.add(sj);   // San Juan el Redondo, el baptisterio
  [[1.95, -2.3, 'olmo'], [1.5, -2.9, 'frutal'], [1.95, -2.95, 'olmo'], [-1.45, -1.4, 'olmo'], [-1.3, -2.4, 'olmo'], [0.6, -3.05, 'sauce']].forEach(([x, z, t], i) => { const a = arbolPa(K, t, t === 'frutal' ? 1.3 : 1.05, 50 + i); a.position.set(x, 0, z); g.add(a); });
  const pp = new THREE.Group(); pp.position.set(X1 + 0.45, 0, 3.75); g.add(pp);                                   // el arranque del Petit-Pont, con su casa encima
  pon(pp, caja(K, 0.9, 0.06, 0.42, ND.calD, { grosor: 0.003 }), 0, 0.0, 0);
  for (const x of [-0.18, 0.24]) pon(pp, caja(K, 0.1, 0.22, 0.46, ND.cal, { grosor: 0.002 }), x, -0.12, 0);
  const cp = casaEntramado(K, { w: 0.3, d: 0.3, h1: 0.24, hp: 0.22, pisos: 1, estilo: 'postes', yeso: ND.rosa, tienda: true }); cp.rotation.y = -Math.PI / 2; cp.position.set(0.05, 0.03, -0.05); pp.add(cp);
  const mu = new THREE.Group(); mu.position.set(X1 + 0.02, 0, -1.9); g.add(mu);                                   // el puerto del obispo: la escalera al agua y una barca
  for (let k = 0; k < 4; k++) pon(mu, caja(K, 0.06, 0.03, 0.4, ND.calD, { grosor: 0.0015 }), 0.03 + k * 0.05, -0.02 - k * 0.03, 0);
  const b = barca(K, { carga: 'piedra', persona: false }); b.rotation.y = Math.PI / 2; b.position.set(0.45, -0.1, 0.35); mu.add(b);
  g.userData.agua = { x0: X0 - 0.9, x1: X1 + 1.1, z0: Z0i - 0.8, z1: Z1i + 0.6 };
  return g;
}
export { salaHospital, iglesiaAbadia, claustro, recinto, pinaculo, andamioND, sillaresND, carretaND };
export function catedral(K, variante = VARIANTES.catedral, etapa = 3) {
  const raiz = new THREE.Group(), g = new THREE.Group(); raiz.add(g);
  const e = Math.max(0, Math.min(3, Math.round(etapa))), obra = variante === 'obra', isla = variante === 'isla', gruas = [];
  const grua = (x, y, z, ry = 0, s = 1) => { const gr = gruaRuedaND(K, s); gr.position.set(x, y, z); gr.rotation.y = ry; g.add(gr); gruas.push(gr); return gr; };
  const andamio = (w, h, x, y, z, ry = 0) => { const a = andamioND(K, w, h); a.position.set(x, y, z); a.rotation.y = ry; g.add(a); return a; };
  if (isla) raiz.add(islaND(K));
  if (e <= 1) { const v = viejaCatedralND(K); v.position.set(0, 0, 1.45); g.add(v); }                              // la catedral vieja, en uso mientras se levanta el coro
  if (e === 0) {                                                                                                     // 1163: los cimientos del coro y los primeros muros del deambulatorio
    const ab = K.malla(propia(new THREE.CylinderGeometry(XA, XA, 0.34, 16, 1, true, Math.PI / 2, Math.PI)), ND.cal, { grosor: 0.004 }); ab.position.set(0, 0.17, ZA); g.add(ab);
    pon(g, K.malla(propia(new THREE.CylinderGeometry(XA + 0.06, XA + 0.06, 0.05, 16, 1, false, Math.PI / 2, Math.PI)), ND.calO, { grosor: 0.003 }), 0, 0.025, ZA);
    [-1, 1].forEach(l => { pon(g, caja(K, 0.07, 0.34, ZT1 - ZA, ND.cal, { grosor: 0.003 }), l * XA, 0.17, (ZT1 + ZA) / 2); pon(g, caja(K, 0.16, 0.05, ZT1 - ZA + 0.3, ND.calO, { grosor: 0.002 }), l * XA, 0.025, (ZT1 + ZA) / 2 + 0.15); });
    for (let i = 0; i < 6; i++) { const th = Math.PI / 2 + Math.PI * (i + 0.5) / 6; pon(g, K.malla(K.cilindro(0.035, 0.035, 0.5 + (i % 2) * 0.22, 8), ND.calL, { grosor: 0.002 }), Math.sin(th) * XN, (0.5 + (i % 2) * 0.22) / 2, ZA + Math.cos(th) * XN); }   // los pilares del hemiciclo
    for (let k = 0; k < 4; k++) [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.035, 0.035, 0.42 - k * 0.08, 8), ND.calL, { grosor: 0.002 }), l * XN, (0.42 - k * 0.08) / 2, ZA + 0.35 + k * 0.38));
    andamio(1.2, 0.5, 0, 0, ZA - XA - 0.1); andamio(1.4, 0.45, XA + 0.06, 0, (ZT1 + ZA) / 2, Math.PI / 2);
    grua(0.0, 0, ZA + 0.3, -0.6);
    const sl = sillaresND(K, 9, 2); sl.position.set(0.65, 0, -0.35); g.add(sl);
  }
  if (e >= 1) { const arb = e >= 3 ? 'largos' : 'dobles'; g.add(ndTramo(K, ZT1, ZA, 5, { capillas: false, extremos: [false, false], arbotantes: arb })); g.add(ndAbside(K, { arbotantes: arb })); }
  if (e === 1) {                                                                                                     // 1182: el coro consagrado; el crucero empieza a subir
    pon(g, caja(K, 2 * XX, 0.66, ZT0 - ZT1, ND.cal, { grosor: 0.004 }), 0, 0.33, (ZT0 + ZT1) / 2);
    [-1, 1].forEach(l => andamio(ZT0 - ZT1 + 0.1, 0.62, l * (XX + 0.05), 0.0, (ZT0 + ZT1) / 2, Math.PI / 2));
    andamio(2 * XX, 0.6, 0, 0.0, ZT0 + 0.05);
    grua(0.1, 0.66, (ZT0 + ZT1) / 2, 0.4);
  }
  if (e >= 2) {
    g.add(ndCrucero(K, { rosa: e >= 3 ? 'grande' : 'chica' }));
    g.add(ndTramo(K, ZF, ZT0, 6, { capillas: e >= 3, extremos: [false, false], arbotantes: e >= 3 ? 'largos' : 'dobles' }));
    g.add(ndFachada(K, e === 2 ? { hasta: 'rosa', torres: 'no' } : { hasta: 'galeria', torres: obra ? 'obra' : 'completas' }));
  }
  if (e === 2) {                                                                                                     // 1200-1225: la fachada hasta la rosa, con el andamio arriba y la grúa
    andamio(1.8, 0.5, 0, 1.73, Z0 + 0.03); [-1, 1].forEach(l => andamio(0.56, 0.5, l * 0.91, 1.73, (Z0 + ZF) / 2, Math.PI / 2));
    for (let i = 0; i < 6; i++) pon(g, caja(K, 0.09, 0.06, 0.08, ND.calL, { grosor: 0.0018 }), -0.7 + i * 0.27, 1.76, Z0 - 0.2 - (i % 2) * 0.12);
    grua(-0.2, 1.73, (Z0 + ZF) / 2, 0.3);
  }
  if (e >= 3) { const ag = ndAguja(K, { armazon: obra }); ag.position.z = (ZT0 + ZT1) / 2; g.add(ag); }
  if (obra) {                                                                                                        // el taller: la logia de los canteros, los sillares, la carreta de las canteras
    const lg = logiaND(K); lg.position.set(XC + 0.5, 0, -0.9); lg.rotation.y = Math.PI / 2; g.add(lg);
    [[XC + 0.45, 0.3], [XC + 0.7, 1.4], [0.55, Z0 + 0.45]].forEach(([x, z], i) => { const s = sillaresND(K, 6 + i, i); s.position.set(x, 0, z); g.add(s); });
    const ca = carretaND(K); ca.position.set(XC + 0.6, 0, 2.2); ca.rotation.y = -0.4; g.add(ca);
    const ca2 = carretaND(K, true); ca2.position.set(-0.5, 0, Z0 + 0.55); ca2.rotation.y = 1.2; g.add(ca2);
    if (e === 3) grua(XC + 0.35, 0, 0.6, -1.2, 1.1);                                                                  // la que sube el plomo de los techos de las capillas
  }
  g.traverse(o => { if (o.userData.gruaTorre) gruas.push(o.userData.gruaTorre); });
  raiz.userData.gruas = gruas;
  raiz.userData.ficha = { titulo: 'Notre-Dame de París', texto: 'la catedral nueva de Mauricio de Sully: 128 m de largo, la bóveda a 33 m, las torres de 69 m' };
  return raiz;
}

/* ============================================================
   LOS BARRIOS: un grupito de casas de cada idioma, con lo de afuera (para la hoja y para las maquetas del tablero).
   barrio(K, variante, semilla): 'entramado' | 'piedra' | 'arrabal'. El frente de las casas mira a +z (la calle).
   ============================================================ */
const letreroAl = (K, g, x, y, z, color) => { pon(g, caja(K, 0.1, 0.008, 0.008, ND.hierro, { sinTinta: true }), x, y, z); pon(g, caja(K, 0.008, 0.07, 0.06, color, { grosor: 0.0012 }), x + 0.045, y - 0.04, z); };
export function barrio(K, variante = VARIANTES.casas) {
  const g = new THREE.Group(), en = (o, x, z, ry = 0) => { o.position.set(x, 0, z); o.rotation.y = ry; g.add(o); return o; };
  if (variante === 'piedra') {
    en(casaPiedra(K, { w: 0.62, d: 0.44, pisos: 2, vanos: 'romana', techo: 'teja', alero: true }), -0.95, -0.1);
    en(casaPiedra(K, { w: 0.42, d: 0.46, pisos: 2, vanos: 'gotica', techo: 'pizarra', alero: false, torre: true }), -0.35, -0.16);
    en(casaPiedra(K, { w: 0.36, d: 0.38, hp: 0.25, pisos: 3, vanos: 'romana', techo: 'teja', alero: false, cal: '#e6d9b9' }), 0.26, -0.12);
    const can = en(new THREE.Group(), 0.98, -0.05);                                                                 // la casa del canónigo con su patio cercado, su pozo y su peral
    const cc = casaPiedra(K, { w: 0.5, d: 0.36, pisos: 1, vanos: 'gotica', techo: 'teja', alero: true }); cc.position.z = -0.25; can.add(cc);
    can.add(recinto(K, -0.32, 0.36, -0.08, 0.5, { puerta: 'x1', alto: 0.14 }));
    const po = pozo(K); po.position.set(-0.1, 0, 0.22); can.add(po);
    const ar = arbolPa(K, 'frutal', 1.3, 7); ar.position.set(0.18, 0, 0.28); can.add(ar);
    const ca = carretaND(K, false); en(ca, -0.62, 0.42, 0.3);
    [[-0.05, 0.3], [0.03, 0.36]].forEach(([x, z]) => en(tonel(K), x, z));
    en(arbolPa(K, 'olmo', 1.15, 3), -1.45, -0.35);
  } else if (variante === 'arrabal') {
    en(casaArrabal(K, { w: 0.52, d: 0.38, cobertizo: true }), -1.05, -0.2);
    const al = en(casaArrabal(K, { w: 0.5, d: 0.4, dos: true, techo: 'teja', cal: ND.ocre }), -0.28, -0.25);       // el albergue de los estudiantes, con el ramo de la taberna
    letreroAl(K, al, 0.25, 0.4, 0.22, '#5f8a3e');
    [[-0.12, 0.08], [0.0, 0.1]].forEach(([x, z]) => en(tonel(K), -0.28 + x, z));
    pon(g, caja(K, 0.3, 0.025, 0.07, ND.madera, { grosor: 0.0015 }), -0.46, 0.09, 0.08);
    en(casaArrabal(K, { w: 0.42, d: 0.34, cal: ND.blanco }), 0.42, -0.3, -0.12);
    en(casaArrabal(K, { w: 0.64, d: 0.42, h: 0.34, cal: '#efe4cc' }), 1.12, -0.05, -0.3);                          // la granja con su granero
    en(almiar(K), 1.05, 0.45); en(carretaND(K, false), 0.62, 0.42, 0.9);
    const hu = huerta(K, 0.55, 0.32); hu.position.set(-0.85, 0, 0.42); g.add(hu);
    const ce = cerca(K, 0.62); ce.position.set(-0.85, 0, 0.62); g.add(ce); const ce2 = cerca(K, 0.36); ce2.rotation.y = Math.PI / 2; ce2.position.set(-1.16, 0, 0.44); g.add(ce2);
    en(pozo(K), 0.25, 0.35);
    [[-1.55, -0.4], [0.05, -0.62], [1.62, -0.5]].forEach(([x, z], i) => en(arbolPa(K, i === 1 ? 'olmo' : 'frutal', i === 1 ? 1.1 : 1.35, 11 + i), x, z));
  } else {                                                                                                           // el entramado: la calle de las tiendas
    let x = -1.4;
    [[0.4, 2, ND.revoque, 'cruces', 'teja', '#b03a2c', -0.02, false], [0.62, 1, ND.ocre, 'postes', 'pizarra', null, 0.08, true], [0.34, 3, ND.rosa, 'riostras', 'teja', '#3a5cb0', -0.06, false], [0.42, 2, ND.blanco, 'cruces', 'teja', null, 0.02, false], [0.38, 1, '#ecd9a8', 'postes', 'teja', '#e2b64c', 0.04, false]].forEach(([w, pisos, yeso, estilo, techo, letrero, dz, alero], i) => {
      en(casaEntramado(K, { w, d: 0.5, h1: 0.26, hp: 0.22, pisos, yeso, estilo, techo, letrero, tienda: i !== 3, arco: i % 2 ? 'redondo' : 'apuntado', alero }), x + w / 2, -0.15 + dz);
      x += w + 0.015;
    });
    en(pozo(K), -0.35, 0.5); [[0.5, 0.32], [0.58, 0.4], [0.5, 0.45]].forEach(([xx, z]) => en(tonel(K), xx, z));
    en(carretaND(K, false), 1.15, 0.5, -0.5);
    en(arbolPa(K, 'olmo', 1.2, 5), -1.6, 0.1);
  }
  return g;
}
