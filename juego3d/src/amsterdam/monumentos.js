/* ============================================================
   amsterdam/monumentos
   Las piezas grandes de Ámsterdam (Época 9, docs/era9-plan.md), en el idioma de bloques del proyecto con el color de la
   época: el ladrillo oscuro de la ciudad, la piedra arenisca de los remates, los marcos blancos de las ventanas, los
   postigos verdes, el agua de los canales.
   - La casa consistorial del Dam POR ETAPAS (se construyó de 1648 a 1665): la vieja casa gótica (que ardió en 1652) y el
     campo de pilotes; la planta baja con el andamio; el cuerpo entero; la cúpula con Atlas cargando el globo del cielo.
   - Las casas de los canales, altas y angostas, con su frontón a la calle (escalonado, de campana o de cuello) y la viga
     del aparejo arriba (para subir los muebles por la ventana); la Iglesia Nueva, la torre del Westerkerk con su corona,
     los molinos de los bastiones (el de papel, que da los pliegos), los puentes de ladrillo y el levadizo blanco, el fluyt
     del IJ y las barcas de los canales.
   Escala: 1 = una baldosa; una persona adulta mide ~0,9. El frente de cada pieza mira a +z.
   EL REPLANTEO (2026-10-04): al final del archivo, las piezas nuevas en variantes para la hoja juego3d/bocetos/amsterdam.html
   (el héroe por etapas, la segunda pieza, las casas en tres idiomas, el navío del IJ, el olmo). Lo de arriba sigue igual y es
   lo que usa hoy la época.
   ============================================================ */
import * as THREE from 'three';
import { crearPersona } from '../actores.js';
import { pon, caja, propia, textura, matTex, figura } from '../agora/monumentos.js';

export const AM = {
  ladrillo: '#8f4630', ladrilloD: '#713624', ladrilloL: '#a85a3e', arenisca: '#e6d8b4', areniscaD: '#c8b890',
  blanco: '#f2eee4', verde: '#3d6a4a', teja: '#7c3a2a', pizarra: '#4a525c', plomo: '#7a838e', madera: '#6a4a30', maderaD: '#4a321e',
  piedra: '#e8dcbc', piedraD: '#cbbd98', oro: '#d4a93e', agua: '#5f8090', cobre: '#5f9a84', negro: '#26221e', vela: '#efe6d2'
};

/* ---------- las texturas ---------- */
const matRep = (K, clave, t, rx, ry) => matTex(K, clave + rx + 'x' + ry, (() => { const c = t.clone(); c.needsUpdate = true; c.repeat.set(rx, ry); c.wrapS = c.wrapT = THREE.RepeatWrapping; return c; })());
/* la fachada de ladrillo con sus ventanas de marco blanco y cuarterones, y los postigos verdes abajo */
const texFachada = (base = AM.ladrillo, clave = 'am-fachada') => textura(clave, 64, 64, (g, w, h) => {
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < h; y += 4) { g.fillRect(0, y, w, 0.8); for (let x = (y / 4) % 2 ? 0 : 4; x < w; x += 8) g.fillRect(x, y, 0.8, 4); }
  for (const x of [10, 38]) for (const y of [8, 36]) {
    g.fillStyle = AM.blanco; g.fillRect(x, y, 16, 20);
    g.fillStyle = '#3a4a56'; g.fillRect(x + 2, y + 2, 5, 7); g.fillRect(x + 9, y + 2, 5, 7); g.fillRect(x + 2, y + 11, 5, 7); g.fillRect(x + 9, y + 11, 5, 7);
    g.fillStyle = AM.arenisca; g.fillRect(x - 1, y - 2, 18, 2);   // el dintel de piedra
  }
}, { repetir: true });
const texFachadaD = () => texFachada(AM.ladrilloD, 'am-fachadaD');
const texFachadaL = () => texFachada(AM.ladrilloL, 'am-fachadaL');
/* la fachada clásica de la casa consistorial: arenisca, pilastras y filas de ventanas altas */
const texClasica = () => textura('am-clasica', 64, 64, (g, w, h) => {
  g.fillStyle = AM.piedra; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,104,70,.25)'; for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 1);
  g.fillStyle = AM.piedraD; g.fillRect(0, 0, 4, h); g.fillRect(32, 0, 4, h);   // las pilastras
  for (const x of [12, 44]) { g.fillStyle = '#3a4650'; g.fillRect(x, 10, 10, 22); g.fillRect(x, 40, 10, 16); g.fillStyle = AM.blanco; g.fillRect(x + 4.5, 10, 1, 22); g.fillRect(x, 20, 10, 1); g.fillRect(x + 4.5, 40, 1, 16); }
}, { repetir: true });
const texTeja = () => textura('am-teja', 64, 64, (g, w, h) => {
  g.fillStyle = AM.teja; g.fillRect(0, 0, w, h);
  g.fillStyle = '#5e2a1e'; for (let y = 0; y < h; y += 8) { g.fillRect(0, y, w, 1.6); for (let x = (y / 8) % 2 ? 4 : 0; x < w; x += 8) g.fillRect(x, y, 1.2, 8); }
}, { repetir: true });

/* ---------- el frontón: la silueta de la fachada que da a la calle ---------- */
function perfilFronton(tipo, w, alto) {
  const s = new THREE.Shape(), m = w / 2;
  s.moveTo(-m, 0);
  if (tipo === 'escalonado') {                         // el frontón escalonado: peldaños a cada lado hasta el remate
    const n = 3, pa = alto / (n + 1), px = m / (n + 1.4);
    let x = -m, y = 0;
    for (let k = 0; k < n; k++) { y += pa; s.lineTo(x, y); x += px; s.lineTo(x, y); }
    s.lineTo(x, alto); s.lineTo(-x, alto);
    for (let k = 0; k < n; k++) { s.lineTo(-x, y); x -= px; s.lineTo(-x, y); y -= pa; }
    s.lineTo(m, 0);
  } else if (tipo === 'campana') {                     // el frontón de campana: curvas que se abren abajo y se cierran arriba
    s.lineTo(-m, alto * 0.15); s.quadraticCurveTo(-m * 0.15, alto * 0.25, -m * 0.4, alto * 0.75); s.lineTo(-m * 0.3, alto * 0.92);
    s.quadraticCurveTo(0, alto * 1.08, m * 0.3, alto * 0.92); s.lineTo(m * 0.4, alto * 0.75); s.quadraticCurveTo(m * 0.15, alto * 0.25, m, alto * 0.15); s.lineTo(m, 0);
  } else {                                             // el frontón de cuello: hombros bajos y un cuello alto con su remate
    s.lineTo(-m, alto * 0.3); s.lineTo(-m * 0.45, alto * 0.42); s.lineTo(-m * 0.45, alto * 0.88); s.lineTo(0, alto * 1.02); s.lineTo(m * 0.45, alto * 0.88); s.lineTo(m * 0.45, alto * 0.42); s.lineTo(m, alto * 0.3); s.lineTo(m, 0);
  }
  return s;
}
/* ---------- LA CASA DEL CANAL: alta y angosta, de ladrillo, con su frontón a la calle (+z), la viga del aparejo y la escalera de la puerta ---------- */
export function casa(K, w, d, h, { fronton = 'escalonado', tono = 0, pisos = 3 } = {}) {
  const g = new THREE.Group(), tex = [texFachada, texFachadaD, texFachadaL][tono % 3], base = [AM.ladrillo, AM.ladrilloD, AM.ladrilloL][tono % 3];
  const cuerpo = caja(K, w, h, d, base, { grosor: 0.004 }); cuerpo.position.y = h / 2; g.add(cuerpo);
  const mf = matRep(K, 'am-fach' + tono, tex(), Math.max(1, Math.round(w / 0.2)), Math.max(1, Math.round(h / 0.2)));
  const fr = new THREE.Mesh(propia(new THREE.PlaneGeometry(w, h)), mf); fr.position.set(0, h / 2, d / 2 + 0.002); g.add(fr);
  const lat = matRep(K, 'am-fach' + tono, tex(), Math.max(1, Math.round(d / 0.2)), Math.max(1, Math.round(h / 0.2)));
  [-1, 1].forEach(l => { const p = new THREE.Mesh(propia(new THREE.PlaneGeometry(d, h)), lat); p.position.set(l * (w / 2 + 0.002), h / 2, 0); p.rotation.y = l * Math.PI / 2; g.add(p); });
  /* el tejado detrás del frontón, empinado, a lo largo de z */
  const alto = w * 1.0, s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, alto * 0.85); s.closePath();
  const tg = propia(new THREE.ExtrudeGeometry(s, { depth: d - 0.04, bevelEnabled: false })); tg.translate(0, 0, -(d - 0.04) / 2);
  const techo = K.malla(tg, matRep(K, 'am-teja', texTeja(), 2, 2), { grosor: 0.003 }); techo.position.y = h; g.add(techo);
  /* el frontón: la fachada sube sobre el tejado con su silueta */
  const fg = propia(new THREE.ExtrudeGeometry(perfilFronton(fronton, w, alto), { depth: 0.035, bevelEnabled: false }));
  const fm = K.malla(fg, base, { grosor: 0.003 }); fm.position.set(0, h, d / 2 - 0.035); g.add(fm);
  const ve = caja(K, w * 0.22, alto * 0.22, 0.01, AM.blanco, { sinTinta: true }); ve.position.set(0, h + alto * 0.32, d / 2 + 0.003); g.add(ve);   // la ventana del desván
  pon(g, caja(K, 0.02, 0.02, 0.09, AM.maderaD, { sinTinta: true }), 0, h + alto * 0.72, d / 2 + 0.04);   // la viga del aparejo
  pon(g, caja(K, w * 0.32, 0.03, 0.06, AM.arenisca, { sinTinta: true }), 0, h + (fronton === 'campana' ? alto * 0.95 : alto * 0.98), d / 2 - 0.01);   // el remate de piedra
  pon(g, caja(K, w * 0.3, 0.13, 0.012, '#3a2e22', { sinTinta: true }), -w * 0.18, 0.07, d / 2 + 0.004);   // la puerta
  pon(g, caja(K, w * 0.4, 0.035, 0.08, AM.arenisca, { grosor: 0.002 }), -w * 0.18, 0.018, d / 2 + 0.04);   // el escalón de la puerta (el stoep)
  return g;
}

/* ---------- LA CASA CONSISTORIAL DEL DAM, por etapas (0: la vieja casa gótica y los pilotes · 1: la planta baja con el andamio · 2: el cuerpo entero · 3: la cúpula y Atlas) ---------- */
function andamio(K, w, h) {
  const g = new THREE.Group();
  for (let k = 0; k <= Math.round(w / 0.14); k++) pon(g, K.malla(K.cilindro(0.005, 0.005, h, 3), AM.madera, { sinTinta: true }), -w / 2 + k * 0.14, h / 2, 0);
  for (let y = 0.12; y < h; y += 0.14) pon(g, caja(K, w, 0.008, 0.05, AM.madera, { sinTinta: true }), 0, y, 0.02);
  return g;
}
export function stadhuis(K, etapa = 3) {
  const g = new THREE.Group(), W = 1.7, D = 1.0, H1 = 0.24, H = 0.62;
  if (etapa === 0) {
    /* la casa gótica vieja (ardió en 1652), con su torre, y el campo de pilotes de la nueva (13 659 troncos clavados en el barro) */
    const vi = new THREE.Group(); pon(g, vi, -0.45, 0, 0.1);
    pon(vi, caja(K, 0.6, 0.32, 0.4, AM.ladrilloD, { grosor: 0.004 }), 0, 0.16, 0);
    const s = new THREE.Shape(); s.moveTo(-0.3, 0); s.lineTo(0.3, 0); s.lineTo(0, 0.24); s.closePath();
    const tg = propia(new THREE.ExtrudeGeometry(s, { depth: 0.38, bevelEnabled: false })); tg.translate(0, 0, -0.19);
    pon(vi, K.malla(tg, AM.pizarra, { grosor: 0.003 }), 0, 0.32, 0);
    pon(vi, caja(K, 0.12, 0.52, 0.12, AM.ladrilloD, { grosor: 0.003 }), 0.26, 0.26, 0.14);
    pon(vi, K.malla(K.cono(0.1, 0.22, 4), AM.pizarra, { grosor: 0.002 }), 0.26, 0.63, 0.14).rotation.y = Math.PI / 4;
    for (let x = 0.0; x < 0.85; x += 0.1) for (let z = -0.35; z < 0.4; z += 0.1) pon(g, K.malla(K.cilindro(0.012, 0.014, 0.05, 5), AM.madera, { sinTinta: true }), 0.2 + x, 0.025, z);
  }
  if (etapa >= 1) {
    pon(g, caja(K, W, H1, D, AM.piedra, { grosor: 0.004 }), 0, H1 / 2, 0);
    const m = matRep(K, 'am-clasica', texClasica(), 8, 1), m2 = matRep(K, 'am-clasica', texClasica(), 5, 1);
    const fr = new THREE.Mesh(propia(new THREE.PlaneGeometry(W, H1)), m); fr.position.set(0, H1 / 2, D / 2 + 0.002); g.add(fr);
    const la = new THREE.Mesh(propia(new THREE.PlaneGeometry(D, H1)), m2); la.position.set(W / 2 + 0.002, H1 / 2, 0); la.rotation.y = Math.PI / 2; g.add(la);
    for (let k = 0; k < 7; k++) pon(g, caja(K, 0.08, 0.14, 0.012, '#3a2e22', { sinTinta: true }), -0.36 + k * 0.12, 0.07, D / 2 + 0.006);   // las siete arcadas de la entrada (una por cada provincia)
  }
  if (etapa === 1) { const an = andamio(K, W, 0.52); an.position.set(0, 0, D / 2 + 0.06); g.add(an); }
  if (etapa >= 2) {
    pon(g, caja(K, W, H - H1, D, AM.piedra, { grosor: 0.004 }), 0, H1 + (H - H1) / 2, 0);
    const m = matRep(K, 'am-clasica', texClasica(), 8, 2), m2 = matRep(K, 'am-clasica', texClasica(), 5, 2);
    const fr = new THREE.Mesh(propia(new THREE.PlaneGeometry(W, H - H1)), m); fr.position.set(0, H1 + (H - H1) / 2, D / 2 + 0.002); g.add(fr);
    const la = new THREE.Mesh(propia(new THREE.PlaneGeometry(D, H - H1)), m2); la.position.set(W / 2 + 0.002, H1 + (H - H1) / 2, 0); la.rotation.y = Math.PI / 2; g.add(la);
    pon(g, caja(K, W + 0.04, 0.04, D + 0.04, AM.piedraD, { grosor: 0.003 }), 0, H + 0.02, 0);   // la cornisa
    const s = new THREE.Shape(); s.moveTo(-0.32, 0); s.lineTo(0.32, 0); s.lineTo(0, 0.16); s.closePath();   // el frontón del centro, con su relieve
    pon(g, K.malla(propia(new THREE.ExtrudeGeometry(s, { depth: 0.04, bevelEnabled: false })), AM.piedraD, { grosor: 0.003 }), 0, H + 0.04, D / 2 - 0.03);
    const t2 = new THREE.Shape(); t2.moveTo(-W / 2, 0); t2.lineTo(W / 2, 0); t2.lineTo(W / 2 - 0.2, 0.14); t2.lineTo(-W / 2 + 0.2, 0.14); t2.closePath();
    const tg = propia(new THREE.ExtrudeGeometry(t2, { depth: D - 0.1, bevelEnabled: false })); tg.translate(0, 0, -(D - 0.1) / 2);
    pon(g, K.malla(tg, AM.plomo, { grosor: 0.003 }), 0, H + 0.04, 0);   // el techo de plomo, casi plano
  }
  if (etapa === 2) { const an = andamio(K, 0.4, 0.4); an.position.set(0, H + 0.04, 0); g.add(an); }
  if (etapa >= 3) {
    /* la cúpula del campanario (con su carillón) y, en lo alto del frontón de atrás, Atlas con el globo del cielo */
    pon(g, K.malla(K.cilindro(0.13, 0.15, 0.2, 8), AM.piedra, { grosor: 0.003 }), 0, H + 0.28, 0);
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; pon(g, K.malla(K.cilindro(0.008, 0.008, 0.14, 4), AM.blanco, { sinTinta: true }), Math.cos(a) * 0.12, H + 0.45, Math.sin(a) * 0.12); }
    pon(g, K.malla(K.esfera(0.13, 0.7), AM.cobre, { grosor: 0.003 }), 0, H + 0.55, 0).scale.set(1, 0.75, 1);
    pon(g, K.malla(K.cilindro(0.01, 0.01, 0.16, 4), AM.cobre, { sinTinta: true }), 0, H + 0.7, 0);
    pon(g, K.malla(K.esfera(0.025, 0.4), AM.oro, { sinTinta: true }), 0, H + 0.79, 0);   // la veleta de la coca dorada
    const at = crearPersona(K, { piel: 1, pelo: 'rizos', colorPelo: '#c8b890', barba: '#c8b890', ropa: 'corta', colorRopa: AM.piedraD, chal: undefined });
    at.obj.scale.setScalar(0.26); at.obj.position.set(0, H + 0.2, -D / 2 + 0.06); at.obj.rotation.y = Math.PI; g.add(at.obj);   // Atlas
    pon(g, K.malla(K.esfera(0.08, 0.6), AM.oro, { grosor: 0.002 }), 0, H + 0.48, -D / 2 + 0.06);   // el globo del cielo sobre sus hombros
  }
  return g;
}

/* ---------- LA IGLESIA NUEVA, junto al Dam: gótica, de ladrillo, con su torre que nunca se terminó ---------- */
export function nieuweKerk(K) {
  const g = new THREE.Group();
  pon(g, caja(K, 1.0, 0.42, 0.42, AM.ladrilloD, { grosor: 0.004 }), 0, 0.21, 0);
  const s = new THREE.Shape(); s.moveTo(-0.22, 0); s.lineTo(0.22, 0); s.lineTo(0, 0.3); s.closePath();
  const tg = propia(new THREE.ExtrudeGeometry(s, { depth: 1.0, bevelEnabled: false })); tg.translate(0, 0, -0.5);
  const te = K.malla(tg, AM.pizarra, { grosor: 0.003 }); te.rotation.y = Math.PI / 2; te.position.y = 0.42; g.add(te);
  for (let k = 0; k < 4; k++) pon(g, caja(K, 0.06, 0.22, 0.008, '#3a4650', { sinTinta: true }), -0.36 + k * 0.24, 0.24, 0.212);   // los ventanales
  pon(g, caja(K, 0.22, 0.5, 0.22, AM.ladrilloD, { grosor: 0.004 }), 0.6, 0.25, 0.0);
  pon(g, K.malla(K.cono(0.07, 0.3, 6), AM.plomo, { grosor: 0.002 }), 0.6, 0.65, 0.0);   // el chapitel provisional (la torre quedó sin hacer)
  return g;
}
/* ---------- LA TORRE DEL WESTERKERK (1638): cuerpos que se angostan y, en la punta, la corona imperial ---------- */
export function westertoren(K) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.3, 0.5, 0.3, AM.ladrillo, { grosor: 0.004 }), 0, 0.25, 0);
  pon(g, caja(K, 0.24, 0.28, 0.24, AM.arenisca, { grosor: 0.003 }), 0, 0.64, 0);
  pon(g, K.malla(K.cilindro(0.09, 0.1, 0.2, 8), AM.arenisca, { grosor: 0.003 }), 0, 0.88, 0);
  pon(g, K.malla(K.cilindro(0.06, 0.07, 0.14, 8), AM.cobre, { grosor: 0.002 }), 0, 1.05, 0);
  pon(g, K.malla(K.esfera(0.06, 0.5), '#3f6ab8', { grosor: 0.002 }), 0, 1.17, 0);   // la corona imperial, azul y oro
  pon(g, K.malla(K.toro(0.06, 0.01, Math.PI * 2, 0.5), AM.oro, { sinTinta: true }), 0, 1.15, 0).rotation.x = Math.PI / 2;
  pon(g, K.malla(K.cono(0.012, 0.12, 4), AM.oro, { sinTinta: true }), 0, 1.27, 0);
  return g;
}

/* ---------- EL MOLINO DEL BASTIÓN: el cuerpo octogonal, la cabeza que mira al viento y las cuatro aspas que giran ---------- */
export function molino(K, { papel = false } = {}) {
  const g = new THREE.Group(); g.userData.vivo = true;
  pon(g, K.malla(K.cilindro(0.16, 0.24, 0.5, 8), papel ? AM.maderaD : '#5a5048', { grosor: 0.004 }), 0, 0.25, 0);
  pon(g, K.malla(K.cilindro(0.26, 0.26, 0.04, 8), AM.madera, { grosor: 0.003 }), 0, 0.18, 0);   // la galería
  const cab = K.malla(K.capsula(0.13, 0.1, 0.6), AM.teja, { grosor: 0.003 }); cab.rotation.x = Math.PI / 2; cab.position.y = 0.55; g.add(cab);
  const eje = new THREE.Group(); eje.position.set(0, 0.55, 0.2); g.add(eje); g.userData.aspas = eje;
  for (let k = 0; k < 4; k++) {
    const a = new THREE.Group(); a.rotation.z = k * Math.PI / 2; eje.add(a);
    a.add(pon(new THREE.Group(), caja(K, 0.02, 0.5, 0.02, AM.madera, { grosor: 0.0015 }), 0, 0.25, 0));
    const tela = caja(K, 0.1, 0.4, 0.008, AM.vela, { grosor: 0.0015 }); tela.position.set(0.06, 0.29, 0.01); a.add(tela);
  }
  if (papel) for (let k = 0; k < 3; k++) pon(g, caja(K, 0.16, 0.012, 0.12, '#fffaf0', { grosor: 0.0012 }), 0.32, 0.02 + k * 0.013, 0.1);   // las resmas al pie
  return g;
}

/* ---------- LOS PUENTES: el de ladrillo con su arco, y el levadizo de madera blanca ---------- */
export function puente(K, largo, ancho = 0.36, { levadizo = false } = {}) {   // cruza a lo largo de z
  const g = new THREE.Group();
  if (levadizo) {
    pon(g, caja(K, ancho, 0.04, largo, AM.blanco, { grosor: 0.003 }), 0, 0.02, 0);
    [-1, 1].forEach(l => { pon(g, caja(K, 0.03, 0.42, 0.03, AM.blanco, { grosor: 0.002 }), l * (ancho / 2 - 0.02), 0.21, 0); });
    pon(g, caja(K, ancho, 0.03, 0.03, AM.blanco, { grosor: 0.002 }), 0, 0.42, 0);
    [-1, 1].forEach(l => pon(g, caja(K, 0.02, 0.02, largo * 0.6, AM.blanco, { sinTinta: true }), l * (ancho / 2 - 0.02), 0.4, 0, 0).rotation.x = 0.0);
  } else {
    pon(g, caja(K, ancho, 0.05, largo, AM.ladrilloD, { grosor: 0.003 }), 0, 0.03, 0);
    const arco = K.malla(K.toro(largo / 2 * 0.7, 0.04, Math.PI, 0.6), AM.ladrilloD, { grosor: 0.003 }); arco.rotation.y = Math.PI / 2; arco.position.y = -0.12; arco.scale.set(1, 0.6, 1); g.add(arco);
    [-1, 1].forEach(l => pon(g, caja(K, 0.025, 0.07, largo, AM.arenisca, { grosor: 0.0015 }), l * (ancho / 2 - 0.012), 0.09, 0));   // los pretiles de piedra
  }
  return g;
}

/* ---------- EL FLUYT DEL IJ: casco redondo, tres palos y velas cuadradas; y la barca de los canales ---------- */
export function fluyt(K) {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-0.6, 0.14); s.quadraticCurveTo(-0.58, -0.02, -0.3, -0.06); s.lineTo(0.42, -0.06); s.quadraticCurveTo(0.66, -0.02, 0.62, 0.18); s.lineTo(0.5, 0.2); s.lineTo(-0.5, 0.16); s.closePath();
  const geo = propia(new THREE.ExtrudeGeometry(s, { depth: 0.24, bevelEnabled: false })); geo.translate(0, 0, -0.12);
  g.add(K.malla(geo, AM.maderaD, { grosor: 0.003 }));
  pon(g, caja(K, 0.22, 0.12, 0.2, AM.madera, { grosor: 0.002 }), -0.42, 0.24, 0);   // el castillo de popa
  pon(g, caja(K, 0.02, 0.05, 0.02, AM.oro, { sinTinta: true }), -0.52, 0.33, 0);
  [[-0.2, 0.62], [0.08, 0.72], [0.34, 0.56]].forEach(([x, h]) => {
    pon(g, K.malla(K.cilindro(0.008, 0.01, h, 4), AM.maderaD, { sinTinta: true }), x, 0.16 + h / 2, 0);
    pon(g, caja(K, 0.012, h * 0.34, 0.26, AM.vela, { grosor: 0.0015 }), x + 0.012, 0.16 + h * 0.48, 0);
    pon(g, caja(K, 0.012, h * 0.26, 0.2, AM.vela, { grosor: 0.0015 }), x + 0.012, 0.16 + h * 0.82, 0);
  });
  pon(g, caja(K, 0.004, 0.06, 0.1, '#c8541e', { sinTinta: true }), 0.08, 0.16 + 0.76, 0);   // la bandera naranja, blanca y azul (aquí, la naranja)
  return g;
}
export function barca(K, { carga = 'libros', persona = true } = {}) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.5, 0.05, 0.16, AM.madera, { grosor: 0.003 }), 0, 0.02, 0);
  [-1, 1].forEach(l => { const p = caja(K, 0.08, 0.04, 0.16, AM.maderaD, { grosor: 0.002 }); p.position.set(l * 0.27, 0.035, 0); p.rotation.z = l * -0.4; g.add(p); });
  if (carga === 'libros') for (let k = 0; k < 3; k++) pon(g, caja(K, 0.1, 0.06, 0.1, k % 2 ? '#c9b48a' : '#a8916a', { grosor: 0.002 }), -0.12 + k * 0.1, 0.075, 0);   // los fardos de pliegos
  if (carga === 'queso') for (let k = 0; k < 4; k++) pon(g, K.malla(K.cilindro(0.04, 0.04, 0.03, 10), '#e8b84a', { grosor: 0.0015 }), -0.12 + k * 0.08, 0.065, 0);
  if (persona) {
    const p = crearPersona(K, { piel: 0, pelo: 'corto', colorPelo: '#7a5a34', ropa: 'corta', colorRopa: '#3f4f6a', chal: undefined });
    p.obj.scale.setScalar(0.4); p.obj.position.set(0.18, 0.04, 0); p.obj.rotation.y = -Math.PI / 2; g.add(p.obj);
    const pe = K.malla(K.cilindro(0.004, 0.004, 0.55, 3), AM.maderaD, { sinTinta: true }); pe.position.set(0.23, 0.2, 0.04); pe.rotation.z = 0.35; g.add(pe);
  }
  return g;
}

/* ============================================================
   EL REPLANTEO VISUAL (2026-10-04, docs/replanteo-visual.md): las piezas grandes en variantes para la hoja
   juego3d/bocetos/amsterdam.html. La elegida entra al juego por VARIANTES, sin reescribirla.
   - El héroe POR ETAPAS (0-3), como crece hoy la casa consistorial: 'dam', la casa consistorial de Jacob van Campen
     (1648-1665) terminada en el Dam, con la Iglesia Nueva y la Waag, como la pintó Gerrit Berckheyde; 'obra', la misma
     en obra hacia 1655 (los pilotes, la grúa de rueda, los andamios del cuadro de Lingelbach y la casa gótica vieja que
     pintó Saenredam y que ardió en 1652); 'westerkerk', la iglesia del oeste de Hendrick de Keyser (1620-1631) con su
     torre de 85 m (1638) y la corona imperial de Maximiliano.
   - La segunda pieza: la torre del Westerkerk, el molino sobre su bastión o la Montelbaanstoren.
   - Las casas de los canales en tres idiomas: los frontones escalonados de De Keyser (ladrillo rojo con franjas de
     arenisca, como la casa Bartolotti), los de cuello de Vingboons (desde 1640) con la casa doble clasicista de la
     curva del Herengracht, y los almacenes del puerto con su frontón de pico y las puertas de carga.
   Escala del replanteo: la casa consistorial (80 × 57 m) mide 4,5 × 3,1 baldosas (unos 18 m por baldosa) y la vertical
   va un 15 % más alta para que se lea, como en las otras épocas; una persona mide ~1,0.
   ============================================================ */
export const VARIANTES = { heroe: 'dam', segunda: 'westertoren', casas: 'keyser', tablero: 'gradas' };   // las que eligió el usuario en la hoja (AAAB, 2026-10-04): las usa el juego

export const AMB = {
  aren: '#ecdfba', arenL: '#f7eed6', arenD: '#d6c49a', arenS: '#bba97e',     // la arenisca de Bentheim, crema amarillenta
  plomo: '#77838e', plomoL: '#8f9ba5', plomoD: '#5a6570',                   // el plomo y la pizarra de los techos
  cobre: '#8dbba7', cobreD: '#64927f', bronce: '#6e9c86', oro: '#e6b84a', oroD: '#b98b2c',
  rojo: '#b85a3f', rojoL: '#cb6d50', rojoD: '#954530',                      // el ladrillo rojo
  cafe: '#93603f', cafeL: '#a8714f', cafeD: '#724a33',                      // el ladrillo café
  morado: '#7a5258', moradoL: '#906269', moradoD: '#5c3c43',                // el ladrillo morado oscuro
  ocre: '#c08a4e', gris: '#a3a49c',
  blanco: '#f8f4ea', vidrio: '#43505f', vidrioL: '#7189a0',
  postRojo: '#b83c2c', postVerde: '#3f7e52', puerta: '#2f5340', puertaR: '#7a2e24',
  teja: '#c0673f', tejaD: '#99502f', pizarra: '#626d7a', pizarraD: '#4d5764',
  madera: '#8f6544', maderaD: '#5f422a', maderaL: '#b08658', andamio: '#b89366',
  agua: '#4d9fcb', aguaL: '#7fc4e0', aguaD: '#3a81b2',
  muelle: '#cfa883', muelleL: '#dcb994', muelleD: '#b08562', muro: '#a65d43',
  pasto: '#98c362', pastoL: '#acd170', pastoD: '#7ba84b', tierra: '#c9ae84',
  hoja: '#6fa34a', hojaL: '#8dbd5c', hojaD: '#56873a', tronco: '#6e5640',
  gotico: '#cdb48f', goticoD: '#ae9672', rosa: '#cf947a', rosaD: '#ad755e',   // la piedra de la Iglesia Nueva; el ladrillo rosado de la casa vieja
  velas: '#f2ead6', casco: '#6a4a30', cascoD: '#3f2c1f',
};
const hashA = (a, b = 0, c = 0) => { const s = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return s - Math.floor(s); };
const lienzo = (K, clave, w, h, pinta) => matTex(K, clave, textura(clave, w, h, pinta, { repetir: true }));
/* una lámina con la textura repetida ru × rv veces (la textura, con RepeatWrapping) */
function lam(mat, w, h, ru = 1, rv = 1) {
  const geo = propia(new THREE.PlaneGeometry(w, h)), uv = geo.getAttribute('uv');
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * ru, uv.getY(i) * rv);
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; return m;
}
const ESC = 0.16;   // lo que mide en el mundo una vuelta de las texturas de material (ladrillo, pizarra, teja)

/* ---------- los materiales del replanteo ---------- */
function matLadrillo(K, color) {   // el ladrillo con sus juntas claras y un tono distinto por pieza
  return lienzo(K, 'amb-lad' + color, 64, 64, (g, w, h) => {
    g.fillStyle = color; g.fillRect(0, 0, w, h);
    for (let y = 0, f = 0; y < h; y += 8, f++) for (let x = f % 2 ? -8 : 0; x < w; x += 16) {
      const k = hashA(x, y, 3); g.fillStyle = k > 0.5 ? `rgba(255,236,210,${(k - 0.5) * 0.24})` : `rgba(40,20,10,${(0.5 - k) * 0.24})`; g.fillRect(x + 1, y + 1, 15, 7);
    }
    g.fillStyle = 'rgba(244,230,206,.38)';
    for (let y = 0, f = 0; y < h; y += 8, f++) { g.fillRect(0, y, w, 1); for (let x = f % 2 ? 8 : 0; x < w; x += 16) g.fillRect(x, y, 1, 8); }
  });
}
function matPizarra(K, color = AMB.pizarra) {   // la pizarra azulada en hiladas, con las juntas trabadas
  return lienzo(K, 'amb-piz' + color, 64, 64, (g, w, h) => {
    g.fillStyle = color; g.fillRect(0, 0, w, h);
    for (let y = 0, f = 0; y < h; y += 8, f++) for (let x = f % 2 ? -6 : 0; x < w; x += 12) {
      const k = hashA(x, y, 5); g.fillStyle = k > 0.5 ? `rgba(220,232,245,${(k - 0.5) * 0.3})` : `rgba(20,25,35,${(0.5 - k) * 0.25})`; g.fillRect(x + 1, y + 1, 11, 7);
    }
    g.fillStyle = 'rgba(30,36,46,.45)'; for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 1.2);
  });
}
function matTejaR(K, color = AMB.teja) {   // la teja holandesa (pan): ondas en hiladas
  return lienzo(K, 'amb-teja' + color, 64, 64, (g, w, h) => {
    g.fillStyle = color; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 8) for (let x = 0; x < w; x += 8) {
      g.fillStyle = 'rgba(255,220,190,.22)'; g.fillRect(x + 1, y + 1, 3, 6);
      g.fillStyle = 'rgba(70,25,12,.3)'; g.fillRect(x + 5, y + 1, 2.5, 6);
    }
    g.fillStyle = 'rgba(70,25,12,.45)'; for (let y = 0; y < h; y += 8) g.fillRect(0, y + 7, w, 1.2);
  });
}
/* una losa con la textura a escala del mundo (los faldones de los techos) */
function losaTex(K, mat, w, h, d, o = {}) {
  const geo = propia(new THREE.BoxGeometry(w, h, d)), uv = geo.getAttribute('uv'), n = geo.getAttribute('normal');
  for (let i = 0; i < uv.count; i++) {
    const nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i));
    const [a, b] = ny > 0.5 ? [w, d] : nx > 0.5 ? [d, h] : [w, h];
    uv.setXY(i, uv.getX(i) * a / ESC, uv.getY(i) * b / ESC);
  }
  return K.malla(geo, mat, o);
}
/* EL TECHO A CUATRO AGUAS: la cumbrera a lo largo del lado mayor; uv en metros del mundo para la pizarra */
function geoTejado4(w, d, h) {
  const ex = w >= d, r = Math.min(w, d) / 2, hx = w / 2, hz = d / 2;
  const A = [-hx, 0, -hz], B = [hx, 0, -hz], C = [hx, 0, hz], D = [-hx, 0, hz];
  const R1 = ex ? [-hx + r, h, 0] : [0, h, -hz + r], R2 = ex ? [hx - r, h, 0] : [0, h, hz - r];
  const caras = ex ? [[D, C, R2, R1], [B, A, R1, R2], [A, D, R1], [C, B, R2]] : [[D, C, R2], [B, A, R1], [A, D, R2, R1], [C, B, R1, R2]];
  const pos = [], uv = [];
  for (const f of caras) {
    const e0 = f[0], e1 = f[1], L = Math.hypot(e1[0] - e0[0], e1[2] - e0[2]), ux = (e1[0] - e0[0]) / L, uz = (e1[2] - e0[2]) / L;
    const UV = p => [((p[0] - e0[0]) * ux + (p[2] - e0[2]) * uz) / ESC, p[1] / (ESC * 0.55)];
    const tris = f.length === 4 ? [[0, 1, 2], [0, 2, 3]] : [[0, 1, 2]];
    for (const t of tris) for (const i of t) { pos.push(...f[i]); uv.push(...UV(f[i])); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.computeVertexNormals(); return propia(geo);
}
const tejado4 = (K, w, d, h, mat, gr = 0.006) => K.malla(geoTejado4(w, d, h), mat, { grosor: gr });

/* ---------- LAS ESTATUAS DE BRONCE (la Paz, la Prudencia, la Justicia, Atlas): de pie, con su atributo ---------- */
function estatuaBronce(K, alto, atributo = null) {
  const g = figura(K, alto, { color: AMB.bronce, manto: AMB.cobreD, gr: 0.002 });
  if (atributo === 'rama') pon(g, K.malla(K.cilindro(0.004, 0.004, alto * 0.5, 4), AMB.bronce, { sinTinta: true }), alto * 0.16, alto * 0.86, 0).rotation.z = -0.5;   // la rama de olivo de la Paz
  if (atributo === 'espada') { pon(g, K.malla(K.cilindro(0.004, 0.004, alto * 0.55, 4), AMB.bronce, { sinTinta: true }), alto * 0.17, alto * 0.75, 0); pon(g, caja(K, alto * 0.3, 0.005, 0.005, AMB.bronce, { sinTinta: true }), -alto * 0.18, alto * 0.7, 0); }   // la espada y la balanza
  if (atributo === 'espejo') pon(g, K.malla(K.esfera(alto * 0.07, 0.4), AMB.bronce, { sinTinta: true }), alto * 0.16, alto * 0.74, 0.02);
  return g;
}
/* Atlas con la esfera del cielo sobre los hombros (Artus Quellinus; está en el frontón de atrás, mirando al poniente) */
function atlas(K, alto = 0.34) {
  const g = new THREE.Group();
  const cu = figura(K, alto, { color: AMB.bronce, gr: 0.002 }); cu.rotation.x = 0.18; g.add(cu);
  [-1, 1].forEach(l => { const b = K.malla(K.capsula(alto * 0.045, alto * 0.32, 0.5), AMB.bronce, { grosor: 0.0015 }); b.position.set(l * alto * 0.15, alto * 0.95, 0); b.rotation.z = l * -0.5; g.add(b); });
  const es = K.malla(K.esfera(alto * 0.42, 0.7), AMB.cobre, { grosor: 0.003 }); es.position.set(0, alto * 1.32, 0.02); g.add(es);
  pon(g, K.malla(K.toro(alto * 0.43, alto * 0.02, Math.PI * 2, 0.5), AMB.oro, { sinTinta: true }), 0, alto * 1.32, 0.02).rotation.x = 1.2;   // la eclíptica
  return g;
}

/* ============================================================
   LA CASA CONSISTORIAL DE VAN CAMPEN: 80 × 57 m → 4,5 × 3,1. Veintitrés vanos al frente y dieciséis al costado; el
   cuerpo del centro (siete vanos) y los pabellones de las esquinas (tres) adelantados; dos órdenes de pilastras (compuesto
   abajo, corintio arriba), cada uno con su piso alto y su entresuelo; abajo, siete arcos chicos (uno por cada provincia):
   no tiene gran portal, para que ningún rey entrara a caballo, dice la leyenda. Los frontones de Quellinus: la Doncella de
   Ámsterdam con los dioses del mar al frente, Atlas atrás. Encima, la cúpula del carillón con la coca dorada de veleta.
   `hasta`: 1 la planta baja · 2 el primer orden · 3 el cuerpo entero con los frontones · 4 los techos · 5 la cúpula y
   las estatuas. El frente mira a +z.
   ============================================================ */
export const SV = { W: 4.5, D: 3.1, H: 1.55, n: 23, nl: 16 };
SV.b = SV.W / SV.n; SV.bl = SV.D / SV.nl; SV.hT = 0.5;   // el alto del techo de la Sala sobre la cornisa (las crujías, más bajas)
const NIVELES_SV = [0, 0.31, 0.985, SV.H];   // dónde termina cada tramo del cuerpo
/* la textura de un vano: los sillares trabados, la imposta, las ventanas altas con su marco blanco y sus cuarterones, los
   entresuelos, el friso y las guirnaldas; 'arcos': el vano de la entrada, con su arco */
function pintaVano(tipo, ancho = SV.b) {
  return (g, w, h) => {
    const Y = u => h - u / SV.H * h, X = u => u / ancho * w;
    g.fillStyle = AMB.aren; g.fillRect(0, 0, w, h);
    for (let y = 0, f = 0; y < SV.H; y += 0.052, f++) {
      const k = hashA(f, 7), a = Y(y + 0.052), b = Y(y);
      g.fillStyle = k > 0.5 ? `rgba(255,248,226,${(k - 0.5) * 0.35})` : `rgba(150,128,80,${(0.5 - k) * 0.2})`; g.fillRect(0, a, w, b - a);
      g.fillStyle = 'rgba(140,118,76,.3)'; g.fillRect(0, b - 1, w, 1); g.fillRect((f % 2 ? 0.28 : 0.74) * w, a, 1, b - a);
    }
    g.fillStyle = AMB.arenD; g.fillRect(0, Y(0.035), w, Y(0) - Y(0.035));                                   // el zócalo
    g.fillStyle = AMB.arenL; g.fillRect(0, Y(0.31), w, Y(0.28) - Y(0.31)); g.fillRect(0, Y(0.985), w, Y(0.905) - Y(0.985)); g.fillRect(0, Y(SV.H), w, Y(1.475) - Y(SV.H));
    g.fillStyle = 'rgba(120,100,60,.4)'; g.fillRect(0, Y(0.28), w, 1.5); g.fillRect(0, Y(0.905), w, 1.5); g.fillRect(0, Y(1.475), w, 1.5);
    const vent = (y0, y1, an, filas, cols) => {
      const x0 = X((ancho - an) / 2), x1 = X((ancho + an) / 2), a = Y(y1), b = Y(y0);
      g.fillStyle = AMB.arenS; g.fillRect(x0 - 3.5, a - 3.5, x1 - x0 + 7, b - a + 7);
      g.fillStyle = AMB.blanco; g.fillRect(x0 - 1.6, a - 1.6, x1 - x0 + 3.2, b - a + 3.2);
      g.fillStyle = AMB.vidrio; g.fillRect(x0, a, x1 - x0, b - a);
      g.fillStyle = 'rgba(170,200,225,.35)'; g.fillRect(x0, a, (x1 - x0) * 0.45, (b - a) * 0.5);
      g.fillStyle = AMB.blanco; for (let i = 1; i < cols; i++) g.fillRect(x0 + (x1 - x0) * i / cols - 0.7, a, 1.4, b - a); for (let j = 1; j < filas; j++) g.fillRect(x0, a + (b - a) * j / filas - 0.7, x1 - x0, 1.4);
    };
    if (tipo === 'arcos') {
      const x0 = X((ancho - 0.112) / 2), x1 = X((ancho + 0.112) / 2), top = Y(0.2), r = (x1 - x0) / 2, cx = (x0 + x1) / 2;
      g.fillStyle = AMB.arenS; g.beginPath(); g.moveTo(x0 - 4, Y(0)); g.lineTo(x0 - 4, top); g.arc(cx, top, r + 4, Math.PI, 0); g.lineTo(x1 + 4, Y(0)); g.fill();
      g.fillStyle = '#3c332a'; g.beginPath(); g.moveTo(x0, Y(0)); g.lineTo(x0, top); g.arc(cx, top, r, Math.PI, 0); g.lineTo(x1, Y(0)); g.fill();
    } else vent(0.1, 0.23, 0.07, 2, 2);
    vent(0.37, 0.71, 0.088, 4, 2); vent(0.765, 0.875, 0.078, 2, 2); vent(1.035, 1.31, 0.088, 3, 2); vent(1.355, 1.455, 0.078, 2, 2);
    g.strokeStyle = AMB.arenS; g.lineWidth = 2.4; g.beginPath(); g.moveTo(X(0.02), Y(1.535)); g.quadraticCurveTo(X(ancho / 2), Y(1.485), X(ancho - 0.02), Y(1.535)); g.stroke();   // las guirnaldas del friso
  };
}
const matVano = (K, tipo = 'ala') => lienzo(K, 'amb-vano-' + tipo, 64, 512, pintaVano(tipo));
/* el tímpano de Quellinus: al frente, la Doncella de Ámsterdam entronizada entre tritones que soplan caracolas, nereidas
   y caballos de mar; atrás, el mismo fondo con los vientos */
function matTimpano(K, tema = 'doncella') {
  return matTex(K, 'amb-timp' + tema, textura('amb-timp' + tema, 512, 112, (g, w, h) => {
    g.fillStyle = AMB.arenD; g.fillRect(0, 0, w, h);
    const fig = (x, y, rx, ry, rot = 0) => { g.fillStyle = 'rgba(120,96,60,.5)'; g.beginPath(); g.ellipse(x + 2, y + 2, rx, ry, rot, 0, 7); g.fill(); g.fillStyle = AMB.arenL; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 7); g.fill(); };
    const n = 13;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, x = u * w, alto = h * (1 - Math.abs(u - 0.5) * 2) * 0.9, k = Math.abs(i - (n - 1) / 2);
      if (k >= 5) { fig(x, h - 9, 22, 7, i < n / 2 ? 0.1 : -0.1); fig(x + (i < n / 2 ? -14 : 14), h - 16, 6, 6); continue; }   // los tritones recostados en las puntas
      if (k === 0) { fig(x, h - alto * 0.42, 15, alto * 0.42); fig(x, h - alto * 0.9, 7, 7); g.fillStyle = AMB.oro; g.fillRect(x - 7, h - alto - 3, 14, 4); continue; }   // la Doncella, con su corona
      const hb = Math.max(16, alto - 12); fig(x, h - hb / 2 - 2, 9, hb / 2, (i < n / 2 ? -1 : 1) * 0.15); fig(x + (i < n / 2 ? 3 : -3), h - hb - 6, 5.5, 5.5);
      if (k === 3) { g.strokeStyle = AMB.arenL; g.lineWidth = 3; g.beginPath(); g.moveTo(x, h - hb); g.lineTo(x + (i < n / 2 ? 14 : -14), h - hb - 14); g.stroke(); }   // la caracola que soplan
    }
  }));
}
/* el tambor del carillón: ocho arcos abiertos entre pares de columnas */
const matTambor = K => lienzo(K, 'amb-tambor', 256, 64, (g, w, h) => {
  g.fillStyle = AMB.aren; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 8; i++) {
    const x = i * 32;
    g.fillStyle = AMB.arenL; g.fillRect(x + 1, 0, 5, h); g.fillRect(x + 26, 0, 5, h);   // las columnas pareadas
    g.fillStyle = '#3c3a38'; g.beginPath(); g.moveTo(x + 9, h - 4); g.lineTo(x + 9, 24); g.arc(x + 16, 24, 7, Math.PI, 0); g.lineTo(x + 23, h - 4); g.fill();
    g.fillStyle = AMB.arenS; g.fillRect(x, h - 5, 32, 5);
  }
});
/* la esfera del reloj: azul con las horas de oro */
const matReloj = K => matTex(K, 'amb-reloj', textura('amb-reloj', 64, 64, (g, w, h) => {
  g.fillStyle = AMB.aren; g.fillRect(0, 0, w, h);
  g.fillStyle = '#28406e'; g.beginPath(); g.arc(32, 32, 28, 0, 7); g.fill();
  g.strokeStyle = AMB.oro; g.lineWidth = 3; g.beginPath(); g.arc(32, 32, 27, 0, 7); g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.fillStyle = AMB.oro; g.fillRect(32 + Math.cos(a) * 21 - 2, 32 + Math.sin(a) * 21 - 2, 4, 4); }
  g.strokeStyle = AMB.oro; g.lineWidth = 3; g.beginPath(); g.moveTo(32, 32); g.lineTo(32, 14); g.moveTo(32, 32); g.lineTo(44, 36); g.stroke();
}));

/* un frente de vanos sobre un plano: la textura del tramo [y0, y1] del alto, repetida n veces */
function frente(K, g, tipo, w, n, y0, y1, x, z, ry = 0) {
  const m = lam(matVano(K, tipo), w, y1 - y0, n, (y1 - y0) / SV.H);
  const uv = m.geometry.getAttribute('uv'); for (let i = 0; i < uv.count; i++) uv.setY(i, y0 / SV.H + uv.getY(i));   // el tramo de la textura que toca a esa altura
  m.position.set(x, (y0 + y1) / 2, z); m.rotation.y = ry; g.add(m); return m;
}
/* las pilastras de un frente (a lo largo de x en z, o girado): cada una con su capitel; abajo el orden compuesto, arriba el corintio */
function pilastras(K, g, xs, z, y0, y1, { ry = 0, ancho = 0.034 } = {}) {
  const h = y1 - y0;
  for (const x of xs) {
    const p = new THREE.Group(); p.position.set(0, 0, 0);
    pon(p, caja(K, ancho, h - 0.03, 0.014, AMB.arenL, { sinTinta: true }), x, y0 + (h - 0.03) / 2, z + 0.007);
    pon(p, caja(K, ancho + 0.016, 0.03, 0.022, AMB.arenL, { grosor: 0.0012 }), x, y1 - 0.015, z + 0.011);   // el capitel
    pon(p, caja(K, ancho + 0.01, 0.014, 0.02, AMB.arenD, { sinTinta: true }), x, y0 + 0.007, z + 0.01);    // la basa
    if (ry) { const q = new THREE.Group(); q.rotation.y = ry; q.add(p); g.add(q); } else g.add(p);
  }
}
const vanosX = (x0, n, b) => Array.from({ length: n + 1 }, (_, k) => x0 + k * b);
/* EL CUERPO, hasta el nivel pedido */
export function stadhuisVC(K, hasta = 5, { conAtlas = true } = {}) {
  const g = new THREE.Group(), { W, D, H, b, bl } = SV, Wc = b * 7, Wp = b * 3, Dp = bl * 3, Dc = bl * 5;
  // la planta: el anillo de crujías alrededor de dos patios, con la Sala de los Ciudadanos (46 × 19 m) cruzando por el medio
  const dF = 0.86, wL = 0.68, wC = 1.36, cw = W / 2 - wL - wC / 2, cd = D - 2 * dF, cxP = wC / 2 + cw / 2;
  const yTop = hasta >= 3 ? H : NIVELES_SV[Math.min(hasta, 2)];
  const tramos = [[0, 0.31], [0.31, 0.985], [0.985, H]].filter(([, y1]) => y1 <= yTop + 1e-6);
  pon(g, caja(K, W + 0.12, 0.035, D + 0.12, AMB.arenD, { grosor: 0.004 }), 0, 0.0175, 0);   // el zócalo sobre el Dam
  [1, -1].forEach(s => pon(g, caja(K, W, yTop, dF, AMB.aren, { grosor: 0.006 }), 0, yTop / 2, s * (D / 2 - dF / 2)));
  [-1, 1].forEach(l => pon(g, caja(K, wL, yTop, cd + 0.02, AMB.aren, { grosor: 0.006 }), l * (W / 2 - wL / 2), yTop / 2, 0));
  pon(g, caja(K, wC, yTop, cd + 0.02, AMB.aren, { grosor: 0.006 }), 0, yTop / 2, 0);
  [-1, 1].forEach(l => { const pa = lam(matDam(K), cw, cd, cw / ESC, cd / ESC); pa.rotation.x = -Math.PI / 2; pa.position.set(l * cxP, 0.037, 0); g.add(pa); });   // el piso de los patios
  const sale = 0.07, saleP = 0.05, saleL = 0.04;
  /* una faja de piedra que da la vuelta por fuera (imposta o cornisa): cuatro barras, para no tapar los patios */
  const faja = (ym, hc, vu, gr = 0.004) => {
    [1, -1].forEach(s => pon(g, caja(K, W + 2 * vu, hc, vu + 0.06, AMB.arenL, { grosor: gr }), 0, ym, s * (D / 2 + vu / 2 - 0.03)));
    [1, -1].forEach(l => pon(g, caja(K, vu + 0.06, hc, D + 2 * vu, AMB.arenL, { grosor: gr }), l * (W / 2 + vu / 2 - 0.03), ym, 0));
  };
  for (const [y0, y1] of tramos) {
    // el frente (+z) y el de atrás (-z): las alas, el cuerpo del centro y los pabellones
    frente(K, g, 'ala', W, SV.n, y0, y1, 0, D / 2 + 0.002);
    frente(K, g, 'ala', W, SV.n, y0, y1, 0, -D / 2 - 0.002, Math.PI);
    [1, -1].forEach(s => {
      pon(g, caja(K, Wc, y1 - y0, sale, AMB.aren, { grosor: 0.004 }), 0, (y0 + y1) / 2, s * (D / 2 + sale / 2));
      frente(K, g, y0 === 0 && s > 0 ? 'arcos' : 'ala', Wc, 7, y0, y1, 0, s * (D / 2 + sale + 0.002), s > 0 ? 0 : Math.PI);
      [-1, 1].forEach(l => {
        pon(g, caja(K, Wp, y1 - y0, saleP, AMB.aren, { grosor: 0.004 }), l * (W / 2 - Wp / 2), (y0 + y1) / 2, s * (D / 2 + saleP / 2));
        frente(K, g, 'ala', Wp, 3, y0, y1, l * (W / 2 - Wp / 2), s * (D / 2 + saleP + 0.002), s > 0 ? 0 : Math.PI);
      });
    });
    // los costados (±x): el pabellón de cada esquina y el cuerpo del centro, un poco adelantados
    [1, -1].forEach(l => {
      const f = frente(K, g, 'ala', D, SV.nl, y0, y1, 0, 0); f.position.set(l * (W / 2 + 0.002), (y0 + y1) / 2, 0); f.rotation.y = l * Math.PI / 2;
      pon(g, caja(K, saleL, y1 - y0, Dc, AMB.aren, { grosor: 0.004 }), l * (W / 2 + saleL / 2), (y0 + y1) / 2, 0);
      const c = frente(K, g, 'ala', Dc, 5, y0, y1, 0, 0); c.position.set(l * (W / 2 + saleL + 0.002), (y0 + y1) / 2, 0); c.rotation.y = l * Math.PI / 2;
      [-1, 1].forEach(s => {
        pon(g, caja(K, saleP, y1 - y0, Dp, AMB.aren, { grosor: 0.004 }), l * (W / 2 + saleP / 2), (y0 + y1) / 2, s * (D / 2 - Dp / 2));
        const p = frente(K, g, 'ala', Dp, 3, y0, y1, 0, 0); p.position.set(l * (W / 2 + saleP + 0.002), (y0 + y1) / 2, s * (D / 2 - Dp / 2)); p.rotation.y = l * Math.PI / 2;
      });
    });
    // las caras de los patios (con sus ventanas, como las de afuera)
    [-1, 1].forEach(l => {
      [[0, -cd / 2 - 0.002 + 0.0, 0, cw], [Math.PI, cd / 2 + 0.002, 0, cw]].forEach(([r, z, , len]) => { const q = frente(K, g, 'ala', len, Math.round(len / SV.b), y0, y1, l * cxP, z, r); q.position.z = r ? cd / 2 - 0.001 : -cd / 2 + 0.001; });
      [[Math.PI / 2, wC / 2 + 0.001], [-Math.PI / 2, W / 2 - wL - 0.001]].forEach(([r, x]) => { const q = frente(K, g, 'ala', cd, Math.round(cd / SV.bl), y0, y1, 0, 0); q.position.set(l * x, (y0 + y1) / 2, 0); q.rotation.y = l > 0 ? r : -r; });
    });
    // las pilastras (no en la planta baja, que es de sillares): al frente y en los dos costados
    if (y0 > 0) {
      const ya = y0 === 0.31 ? 0.31 : 0.985, yb = y0 === 0.31 ? 0.905 : 1.475;
      const xsAla = vanosX(-W / 2, SV.n, b).filter(x => Math.abs(x) > Wc / 2 + 0.01 && Math.abs(x) < W / 2 - Wp - 0.01);
      pilastras(K, g, xsAla, D / 2, ya, yb);
      pilastras(K, g, vanosX(-Wc / 2, 7, b), D / 2 + sale, ya, yb);
      [-1, 1].forEach(l => pilastras(K, g, vanosX(l * (W / 2 - Wp / 2) - Wp / 2, 3, b), D / 2 + saleP, ya, yb));
      [-1, 1].forEach(l => {
        const xsL = vanosX(-D / 2, SV.nl, bl).filter(z => Math.abs(z) > Dc / 2 + 0.01 && Math.abs(z) < D / 2 - Dp - 0.01);
        pilastras(K, g, xsL, W / 2, ya, yb, { ry: l * Math.PI / 2 });
        pilastras(K, g, vanosX(-Dc / 2, 5, bl), W / 2 + saleL, ya, yb, { ry: l * Math.PI / 2 });
        [-1, 1].forEach(s => pilastras(K, g, vanosX(s * (D / 2 - Dp / 2) - Dp / 2, 3, bl), W / 2 + saleP, ya, yb, { ry: l * Math.PI / 2 }));
      });
    }
    // la imposta o la cornisa que cierra el tramo, con los resaltos del centro y de los pabellones
    const hc = y1 === H ? 0.075 : 0.03, vu = y1 === H ? 0.05 : 0.016, ym = y1 === H ? H + hc / 2 : y1 - hc / 2;
    faja(ym, hc, vu);
    [1, -1].forEach(s => {
      pon(g, caja(K, Wc + 2 * vu, hc, sale + vu, AMB.arenL, { grosor: 0.003 }), 0, ym, s * (D / 2 + (sale + vu) / 2));
      [-1, 1].forEach(l => pon(g, caja(K, Wp + 2 * vu, hc, saleP + vu, AMB.arenL, { grosor: 0.003 }), l * (W / 2 - Wp / 2), ym, s * (D / 2 + (saleP + vu) / 2)));
    });
  }
  const yC = H + 0.075;   // encima de la cornisa
  if (hasta >= 3) {
    // los frontones del cuerpo del centro, con el tímpano y las cornisas inclinadas
    const fh = 0.32, fw = Wc + 0.08;
    [1, -1].forEach(s => {
      const sh = new THREE.Shape(); sh.moveTo(-fw / 2, 0); sh.lineTo(fw / 2, 0); sh.lineTo(0, fh); sh.closePath();
      const fg = propia(new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: false })); fg.translate(0, 0, -0.06);
      const fm = K.malla(fg, AMB.arenL, { grosor: 0.004 }); fm.position.set(0, yC, s * (D / 2 + sale - 0.02)); g.add(fm);
      const tr = new THREE.Shape(), m = 0.07; tr.moveTo(-fw / 2 * (1 - m * 1.8), fh * m * 0.7); tr.lineTo(fw / 2 * (1 - m * 1.8), fh * m * 0.7); tr.lineTo(0, fh * (1 - m * 1.4)); tr.closePath();
      const tg = propia(new THREE.ShapeGeometry(tr)), uv = tg.getAttribute('uv'), p = tg.getAttribute('position');
      for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + fw / 2) / fw, p.getY(i) / fh);
      const ti = new THREE.Mesh(tg, matTimpano(K, s > 0 ? 'doncella' : 'vientos')); ti.position.set(0, yC, s * (D / 2 + sale + 0.042)); if (s < 0) ti.rotation.y = Math.PI; g.add(ti);
      const ang = Math.atan2(fh, fw / 2), lar = Math.hypot(fw / 2, fh) + 0.03;
      [-1, 1].forEach(l => { const c = caja(K, lar, 0.035, 0.14, AMB.arenL, { grosor: 0.003 }); c.position.set(l * fw / 4, yC + fh / 2 + 0.012, s * (D / 2 + sale - 0.02)); c.rotation.z = -l * ang; g.add(c); });
      if (hasta >= 5) {   // las estatuas: al frente la Paz, la Prudencia y la Justicia; atrás Atlas, la Templanza y la Vigilancia
        if (s > 0) pon(g, estatuaBronce(K, 0.26, 'rama'), 0, yC + fh, D / 2 + sale - 0.02);
        else if (conAtlas) pon(g, atlas(K, 0.36), 0, yC + fh - 0.01, -D / 2 - sale + 0.02, Math.PI);
        [-1, 1].forEach(l => pon(g, estatuaBronce(K, 0.22, l < 0 ? 'espejo' : 'espada'), l * (fw / 2 - 0.04), yC, s * (D / 2 + sale - 0.02)));
      }
    });
  }
  if (hasta >= 4) {
    // los techos de plomo: las crujías de adelante y de atrás, las de los costados, la Sala más alta en el medio y los
    // techos propios de los pabellones de las esquinas, con sus bolas doradas; las chimeneas en las cumbreras
    const mP = matPizarra(K, AMB.plomo), hF = 0.38, hL = 0.3;
    [1, -1].forEach(s => pon(g, tejado4(K, W - 0.06, dF - 0.02, hF, mP), 0, yC, s * (D / 2 - dF / 2)));
    [-1, 1].forEach(l => pon(g, tejado4(K, wL - 0.02, cd + 0.3, hL, mP), l * (W / 2 - wL / 2), yC, 0));
    pon(g, tejado4(K, wC - 0.02, D - 0.5, SV.hT, mP), 0, yC, 0);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([l, s]) => {
      pon(g, tejado4(K, Wp + saleP + 0.04, Dp + saleP + 0.04, 0.5, mP, 0.004), l * (W / 2 - Wp / 2 + saleP / 2), yC, s * (D / 2 - Dp / 2 + saleP / 2));
      pon(g, K.malla(K.esfera(0.035, 0.5), AMB.oro, { grosor: 0.0015 }), l * (W / 2 - Wp / 2 + saleP / 2), yC + 0.53, s * (D / 2 - Dp / 2 + saleP / 2));
    });
    for (const s of [1, -1]) for (const x of [-1.25, -0.85, 0.85, 1.25]) {
      pon(g, caja(K, 0.07, 0.2, 0.1, AMB.arenD, { grosor: 0.003 }), x, yC + hF + 0.04, s * (D / 2 - dF / 2));
      pon(g, caja(K, 0.09, 0.025, 0.12, AMB.arenS, { grosor: 0.002 }), x, yC + hF + 0.15, s * (D / 2 - dF / 2));
    }
  }
  if (hasta >= 5) { const cu = cupulaVC(K, 0); cu.scale.setScalar(0.94); cu.position.y = yC + SV.hT - 0.1; g.add(cu); }
  g.userData.alto = hasta >= 5 ? yC + SV.hT - 0.1 + 1.56 * 0.94 : hasta >= 4 ? yC + SV.hT : yTop;
  return g;
}
/* LA CÚPULA DEL CARILLÓN: la base cuadrada con los relojes, el tambor octogonal con los arcos abiertos y su balaustrada, la
   cúpula de cobre, la linterna y la veleta de la coca, el barco viejo del escudo de la ciudad */
function cupulaVC(K, y0) {
  const g = new THREE.Group(); g.position.y = y0;
  pon(g, caja(K, 0.7, 0.32, 0.7, AMB.aren, { grosor: 0.004 }), 0, 0.16, 0);
  pon(g, caja(K, 0.76, 0.04, 0.76, AMB.arenL, { grosor: 0.003 }), 0, 0.34, 0);
  const rl = matReloj(K);
  [[0, 0.352, 0], [Math.PI / 2, 0.352, 0], [-Math.PI / 2, 0.352, 0], [Math.PI, 0.352, 0]].forEach(([r]) => { const q = lam(rl, 0.2, 0.2); q.position.set(Math.sin(r) * 0.352, 0.17, Math.cos(r) * 0.352); q.rotation.y = r; g.add(q); });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, c]) => pon(g, K.malla(K.cilindro(0.025, 0.03, 0.08, 6), AMB.arenL, { grosor: 0.0015 }), a * 0.33, 0.4, c * 0.33));   // los jarrones de las esquinas
  const tb = new THREE.Mesh(propia(new THREE.CylinderGeometry(0.27, 0.29, 0.5, 8, 1, true)), matTambor(K)); tb.position.y = 0.61; tb.rotation.y = Math.PI / 8; g.add(tb);
  const tbT = K.malla(K.cilindro(0.265, 0.285, 0.5, 8), AMB.aren, { grosor: 0.004 }); tbT.scale.setScalar(0.985); tbT.position.y = 0.61; tbT.rotation.y = Math.PI / 8; g.add(tbT);
  for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2; pon(g, K.malla(K.cilindro(0.012, 0.012, 0.46, 5), AMB.arenL, { grosor: 0.0012 }), Math.cos(a) * 0.3, 0.6, Math.sin(a) * 0.3); }   // las columnas, en las aristas
  pon(g, K.malla(K.cilindro(0.34, 0.34, 0.04, 8), AMB.arenL, { grosor: 0.003 }), 0, 0.38, 0).rotation.y = Math.PI / 8;   // la balaustrada
  pon(g, K.malla(K.cilindro(0.33, 0.3, 0.06, 8), AMB.arenL, { grosor: 0.003 }), 0, 0.89, 0).rotation.y = Math.PI / 8;
  const cu = K.malla(propia(new THREE.SphereGeometry(0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2)), AMB.cobre, { grosor: 0.004 }); cu.position.y = 0.92; cu.scale.y = 1.05; g.add(cu);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, n = K.malla(K.toro(0.3, 0.008, Math.PI / 2, 0.5), AMB.cobreD, { sinTinta: true }); n.position.y = 0.92; n.rotation.y = -a; n.scale.y = 1.05; g.add(n); }   // las nervaduras
  pon(g, K.malla(K.cilindro(0.07, 0.08, 0.14, 8), AMB.aren, { grosor: 0.002 }), 0, 1.28, 0);
  pon(g, K.malla(K.esfera(0.075, 0.5), AMB.cobre, { grosor: 0.002 }), 0, 1.35, 0).scale.y = 0.7;
  pon(g, K.malla(K.cilindro(0.006, 0.006, 0.14, 4), AMB.oroD, { sinTinta: true }), 0, 1.45, 0);
  const coca = new THREE.Group(); coca.position.set(0, 1.5, 0); g.add(coca);   // la coca dorada
  pon(coca, caja(K, 0.1, 0.025, 0.03, AMB.oro, { grosor: 0.001 }), 0, 0, 0);
  pon(coca, caja(K, 0.005, 0.07, 0.005, AMB.oro, { sinTinta: true }), 0, 0.04, 0);
  pon(coca, caja(K, 0.045, 0.045, 0.004, AMB.oro, { sinTinta: true }), 0.005, 0.045, 0);
  return g;
}

/* ---------- LO QUE RODEA AL HÉROE EN EL DAM ---------- */
/* la ventana gótica alta: el arco apuntado con sus parteluces y la tracería */
const matGotica = K => matTex(K, 'amb-gotica', textura('amb-gotica', 64, 160, (g, w, h) => {
  g.fillStyle = AMB.gotico; g.fillRect(0, 0, w, h);
  g.fillStyle = AMB.goticoD; g.beginPath(); g.moveTo(4, h); g.lineTo(4, 44); g.quadraticCurveTo(4, 6, 32, 2); g.quadraticCurveTo(60, 6, 60, 44); g.lineTo(60, h); g.fill();
  g.fillStyle = '#4b5462'; g.beginPath(); g.moveTo(9, h - 4); g.lineTo(9, 46); g.quadraticCurveTo(9, 12, 32, 8); g.quadraticCurveTo(55, 12, 55, 46); g.lineTo(55, h - 4); g.fill();
  g.fillStyle = 'rgba(160,190,215,.3)'; g.fillRect(9, 50, 22, h - 60);
  g.fillStyle = AMB.gotico; [20, 32, 44].forEach(x => g.fillRect(x - 1.5, 40, 3, h - 44)); for (let y = 70; y < h - 8; y += 28) g.fillRect(9, y, 46, 2.5);
  g.strokeStyle = AMB.gotico; g.lineWidth = 3; g.beginPath(); g.arc(32, 30, 11, 0, 7); g.stroke(); g.beginPath(); g.arc(20, 44, 7, Math.PI, 0); g.arc(44, 44, 7, Math.PI, 0); g.stroke();
}));
/* LA IGLESIA NUEVA (siglo XV): la iglesia gótica de piedra y ladrillo junto al Dam, con su gran ventanal hacia la plaza,
   los contrafuertes, los techos de pizarra empinados, el campanil de la cumbrera y el muñón de la torre que Van Campen
   empezó en 1646 y quedó sin hacer: la plata se fue a la casa consistorial. La nave a lo largo de z; el hastial, a +z. */
export function nieuweKerk2(K) {
  const g = new THREE.Group(), w = 1.3, L = 2.45, hm = 0.82, hr = 0.78, mg = matGotica(K), mP = matPizarra(K);
  pon(g, caja(K, w, hm, L, AMB.gotico, { grosor: 0.005 }), 0, hm / 2, 0);
  const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, hr); sh.closePath();
  const hg = propia(new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false }));
  pon(g, K.malla(hg, AMB.gotico, { grosor: 0.004 }), 0, hm, L / 2 - 0.04);   // el hastial de la plaza
  const v = lam(mg, 0.5, 1.15); v.position.set(0, 0.7, L / 2 + 0.003); g.add(v);   // el gran ventanal
  [-1, 1].forEach(l => { const a = losaTex(K, mP, Math.hypot(w / 2, hr) + 0.05, 0.025, L - 0.02, { grosor: 0.004 }); a.rotation.z = -l * Math.atan2(hr, w / 2); a.position.set(l * w / 4, hm + hr / 2 + 0.01, -0.02); g.add(a); });
  pon(g, caja(K, 0.03, 0.03, L - 0.02, AMB.pizarraD, { sinTinta: true }), 0, hm + hr + 0.015, -0.02);
  for (let k = 0; k < 5; k++) [-1, 1].forEach(l => {   // los contrafuertes y las ventanas altas de los costados
    const z = -L / 2 + 0.25 + k * (L - 0.5) / 4;
    pon(g, caja(K, 0.08, hm * 0.9, 0.08, AMB.goticoD, { grosor: 0.003 }), l * (w / 2 + 0.04), hm * 0.45, z);
    if (k < 4) { const q = lam(mg, 0.2, 0.5); q.position.set(l * (w / 2 + 0.003), 0.42, z + (L - 0.5) / 8); q.rotation.y = l * Math.PI / 2; g.add(q); }
  });
  [-1, 1].forEach(l => pon(g, caja(K, 0.12, hm + 0.25, 0.12, AMB.goticoD, { grosor: 0.003 }), l * (w / 2 + 0.02), (hm + 0.25) / 2, L / 2 - 0.02));   // los estribos del hastial, con su pináculo
  [-1, 1].forEach(l => pon(g, K.malla(K.cono(0.07, 0.22, 4), AMB.goticoD, { grosor: 0.002 }), l * (w / 2 + 0.02), hm + 0.36, L / 2 - 0.02).rotation.y = Math.PI / 4);
  // el campanil de la cumbrera: la linterna octogonal y la aguja
  const cr = new THREE.Group(); cr.position.set(0, hm + hr - 0.05, 0.2); g.add(cr);
  pon(cr, K.malla(K.cilindro(0.09, 0.1, 0.22, 8), AMB.plomoL, { grosor: 0.002 }), 0, 0.11, 0);
  pon(cr, K.malla(K.cono(0.1, 0.75, 8), AMB.plomo, { grosor: 0.002 }), 0, 0.6, 0);
  pon(cr, K.malla(K.esfera(0.025, 0.4), AMB.oro, { sinTinta: true }), 0, 0.99, 0);
  // el muñón de la torre, atrás, con su techo provisional
  pon(g, caja(K, 0.62, 1.0, 0.62, AMB.goticoD, { grosor: 0.004 }), 0, 0.5, -L / 2 - 0.25);
  pon(g, caja(K, 0.66, 0.05, 0.66, AMB.gotico, { grosor: 0.003 }), 0, 1.0, -L / 2 - 0.25);
  pon(g, tejado4(K, 0.62, 0.62, 0.22, mP, 0.003), 0, 1.025, -L / 2 - 0.25);
  return g;
}
/* LA WAAG DEL DAM (1565): la casa de pesar de piedra, abierta abajo en arcos donde se pesaba la mercadería, con el piso de
   arriba, la balaustrada, el techo empinado de buhardillas y la torrecilla de la esquina; la demolió Luis Bonaparte en 1808 */
export function waagDam(K) {
  const g = new THREE.Group(), w = 1.0, d = 0.72, h1 = 0.34, h2 = 0.3, mP = matPizarra(K);
  pon(g, caja(K, w, 0.04, d, AMB.arenD, { grosor: 0.003 }), 0, 0.02, 0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, 1], [0, -1], [-1, 0], [1, 0]].forEach(([a, b]) => pon(g, caja(K, 0.09, h1, 0.09, AMB.aren, { grosor: 0.003 }), a * (w / 2 - 0.045), 0.04 + h1 / 2, b * (d / 2 - 0.045)));   // los pilares de los arcos
  pon(g, caja(K, w - 0.12, h1 * 0.8, d - 0.12, '#4a4038', { sinTinta: true }), 0, 0.04 + h1 * 0.4, 0);   // la sombra de la sala de pesar
  pon(g, caja(K, 0.5, 0.1, 0.06, AMB.madera, { grosor: 0.002 }), 0, 0.3, d / 2 - 0.08);   // la viga de la balanza
  pon(g, caja(K, w + 0.02, 0.05, d + 0.02, AMB.arenL, { grosor: 0.003 }), 0, 0.04 + h1 + 0.025, 0);
  const y2 = 0.04 + h1 + 0.05;
  pon(g, caja(K, w, h2, d, AMB.aren, { grosor: 0.004 }), 0, y2 + h2 / 2, 0);
  for (let k = 0; k < 4; k++) [[0, d / 2], [Math.PI, -d / 2]].forEach(([r, z]) => { const v = caja(K, 0.1, 0.15, 0.012, AMB.vidrio, { sinTinta: true }); v.position.set(-0.36 + k * 0.24, y2 + h2 / 2, z + Math.sign(z) * 0.006); g.add(v); });
  for (let k = 0; k < 3; k++) [-1, 1].forEach(l => pon(g, caja(K, 0.012, 0.15, 0.1, AMB.vidrio, { sinTinta: true }), l * (w / 2 + 0.006), y2 + h2 / 2, -0.22 + k * 0.22));
  pon(g, caja(K, 0.16, 0.12, 0.014, '#b03a2e', { sinTinta: true }), 0, y2 + h2 * 0.55, d / 2 + 0.01);   // el escudo de la ciudad
  pon(g, caja(K, 0.05, 0.1, 0.016, '#222', { sinTinta: true }), 0, y2 + h2 * 0.55, d / 2 + 0.012);
  const y3 = y2 + h2;
  pon(g, caja(K, w + 0.04, 0.06, d + 0.04, AMB.arenL, { grosor: 0.003 }), 0, y3 + 0.03, 0);   // la balaustrada
  pon(g, tejado4(K, w - 0.06, d - 0.06, 0.56, mP), 0, y3 + 0.06, 0);
  for (let k = 0; k < 3; k++) [-1, 1].forEach(s => {   // las buhardillas
    const bu = new THREE.Group(); bu.position.set(-0.28 + k * 0.28, y3 + 0.16, s * (d / 2 - 0.12)); bu.rotation.y = s > 0 ? 0 : Math.PI; g.add(bu);
    pon(bu, caja(K, 0.09, 0.1, 0.08, AMB.aren, { grosor: 0.002 }), 0, 0.05, 0);
    pon(bu, caja(K, 0.05, 0.06, 0.01, AMB.vidrio, { sinTinta: true }), 0, 0.05, 0.045);
    const t = new THREE.Shape(); t.moveTo(-0.055, 0); t.lineTo(0.055, 0); t.lineTo(0, 0.07); t.closePath();
    pon(bu, K.malla(propia(new THREE.ExtrudeGeometry(t, { depth: 0.09, bevelEnabled: false })), AMB.pizarraD, { grosor: 0.0015 }), 0, 0.1, -0.045);
  });
  const to = new THREE.Group(); to.position.set(w / 2 - 0.02, 0, d / 2 - 0.02); g.add(to);   // la torrecilla de la esquina
  pon(to, K.malla(K.cilindro(0.08, 0.08, 1.0, 8), AMB.aren, { grosor: 0.003 }), 0, 0.5 + y2 - 0.3, 0);
  pon(to, K.malla(K.cilindro(0.1, 0.1, 0.03, 8), AMB.arenL, { grosor: 0.002 }), 0, y2 + 0.72, 0);
  pon(to, K.malla(K.esfera(0.085, 0.5), AMB.plomo, { grosor: 0.002 }), 0, y2 + 0.78, 0).scale.y = 1.3;
  pon(to, K.malla(K.cono(0.03, 0.22, 6), AMB.plomo, { grosor: 0.0015 }), 0, y2 + 0.98, 0);
  return g;
}
/* LA CASA CONSISTORIAL VIEJA, la que pintó Saenredam: la galería gótica de arcos sobre columnas con el techo de cobre
   verde y sus pináculos, la torre de ladrillo rosado con el reloj, y el ala larga con su campanil. Ardió el 7 de julio de
   1652, con la nueva a medio hacer. `quemada`: los muros negros, sin techos. */
export function oudStadhuis(K, { quemada = false } = {}) {
  const g = new THREE.Group(), cq = c => quemada ? '#' + new THREE.Color(c).lerp(new THREE.Color('#3c3430'), 0.6).getHexString() : c;
  const ga = new THREE.Group(); g.add(ga);   // la galería
  pon(ga, caja(K, 1.0, 0.06, 0.6, cq(AMB.arenD), { grosor: 0.003 }), 0, 0.03, 0.1);
  for (let k = 0; k < 4; k++) pon(ga, K.malla(K.cilindro(0.03, 0.035, 0.3, 8), cq(AMB.aren), { grosor: 0.002 }), -0.42 + k * 0.28, 0.21, 0.36);
  pon(ga, caja(K, 0.94, 0.3, 0.44, '#3e3630', { sinTinta: true }), 0, 0.21, 0.08);
  pon(ga, caja(K, 1.0, 0.06, 0.6, cq(AMB.aren), { grosor: 0.003 }), 0, 0.39, 0.1);
  pon(ga, caja(K, 0.96, 0.34, 0.56, cq('#e4cc94'), { grosor: 0.004 }), 0, 0.59, 0.1);
  for (let k = 0; k < 3; k++) pon(ga, caja(K, 0.12, 0.16, 0.012, quemada ? '#1e1a18' : AMB.vidrio, { sinTinta: true }), -0.3 + k * 0.3, 0.6, 0.385);
  if (!quemada) {
    pon(ga, tejado4(K, 0.98, 0.58, 0.46, '#79a98a'), 0, 0.76, 0.1);
    [-1, 1].forEach(l => pon(ga, K.malla(K.cono(0.025, 0.2, 6), '#5f8f70', { grosor: 0.0015 }), l * 0.2, 1.3, 0.1));
  } else for (let k = 0; k < 5; k++) { const v = caja(K, 0.02, 0.02, 0.62, '#1e1a18', { sinTinta: true }); v.position.set(-0.4 + k * 0.2, 0.8 + (k % 2) * 0.04, 0.1); v.rotation.x = (k % 3 - 1) * 0.2; ga.add(v); }   // las vigas carbonizadas
  // la torre
  const to = new THREE.Group(); to.position.set(0.62, 0, -0.12); g.add(to);
  const ht = quemada ? 1.15 : 1.42;
  pon(to, caja(K, 0.34, ht, 0.34, cq(AMB.rosa), { grosor: 0.004 }), 0, ht / 2, 0);
  for (const y of [0.5, 0.95]) pon(to, caja(K, 0.36, 0.03, 0.36, cq(AMB.arenL), { sinTinta: true }), 0, y, 0);
  pon(to, caja(K, 0.1, 0.22, 0.012, quemada ? '#1e1a18' : AMB.vidrio, { sinTinta: true }), 0, 0.78, 0.176);
  if (!quemada) {
    const r = lam(matReloj(K), 0.14, 0.14); r.position.set(0, 1.18, 0.172); to.add(r);
    pon(to, caja(K, 0.4, 0.05, 0.4, AMB.arenL, { grosor: 0.002 }), 0, ht + 0.025, 0);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => pon(to, caja(K, 0.05, 0.08, 0.05, AMB.arenL, { grosor: 0.0015 }), a * 0.17, ht + 0.09, b * 0.17));
  }
  // el ala larga de ladrillo con su campanil
  const al = new THREE.Group(); al.position.set(-0.85, 0, -0.18); g.add(al);
  pon(al, caja(K, 0.7, 0.48, 0.5, cq(AMB.rosaD), { grosor: 0.004 }), 0, 0.24, 0);
  for (let k = 0; k < 3; k++) pon(al, caja(K, 0.1, 0.14, 0.012, quemada ? '#1e1a18' : AMB.vidrio, { sinTinta: true }), -0.22 + k * 0.22, 0.28, 0.256);
  if (!quemada) {
    const t = new THREE.Shape(); t.moveTo(-0.25, 0); t.lineTo(0.25, 0); t.lineTo(0, 0.36); t.closePath();
    const tg = propia(new THREE.ExtrudeGeometry(t, { depth: 0.7, bevelEnabled: false })); tg.translate(0, 0, -0.35);
    const te = K.malla(tg, '#79a98a', { grosor: 0.003 }); te.rotation.y = Math.PI / 2; te.position.y = 0.48; al.add(te);
    pon(al, K.malla(K.cilindro(0.04, 0.04, 0.14, 6), '#5f8f70', { grosor: 0.0015 }), -0.15, 0.9, 0);
    pon(al, K.malla(K.cono(0.045, 0.32, 6), '#5f8f70', { grosor: 0.0015 }), -0.15, 1.12, 0);
  }
  return g;
}

/* ---------- LA OBRA: los pilotes, el martinete, la grúa de rueda, los andamios y los sillares ---------- */
/* el campo de pilotes: la ciudad está sobre pilotes de pino clavados en la turba hasta la arena (bajo la casa consistorial
   hay 13 659); aquí, una grilla de cabezas de pilote sobre el barro de la zanja */
export function pilotes(K, w, d, paso = 0.16) {
  const g = new THREE.Group();
  pon(g, caja(K, w, 0.02, d, '#8a7458', { sinTinta: true }), 0, 0.01, 0);
  const nx = Math.floor(w / paso), nz = Math.floor(d / paso), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s = new THREE.Vector3(1, 1, 1);
  const im = K.instancias(K.cilindro(0.022, 0.024, 0.07, 6), '#b89466', nx * nz, { grosor: 0.002 });
  let i = 0;
  for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) { m4.compose(v.set(-w / 2 + (a + 0.5) * w / nx, 0.035 + hashA(a, b) * 0.02, -d / 2 + (b + 0.5) * d / nz), q, s); im.setMatrixAt(i++, m4); }
  g.add(im);
  return g;
}
/* el martinete (heistelling): el armazón alto con la roldana, el pisón colgando y las cuerdas que tiraban veinte hombres */
export function martinete(K) {
  const g = new THREE.Group(), h = 0.95;
  [-1, 1].forEach(l => { const p = K.malla(K.cilindro(0.014, 0.018, h, 5), AMB.madera, { grosor: 0.002 }); p.position.set(l * 0.12, h / 2, 0); p.rotation.z = l * -0.1; g.add(p); });
  const tr = K.malla(K.cilindro(0.012, 0.012, h * 1.05, 5), AMB.madera, { grosor: 0.002 }); tr.position.set(0, h / 2, -0.2); tr.rotation.x = 0.4; g.add(tr);
  pon(g, K.malla(K.toro(0.04, 0.01, Math.PI * 2, 0.5), AMB.maderaD, { sinTinta: true }), 0, h, 0);
  pon(g, caja(K, 0.12, 0.13, 0.12, AMB.maderaD, { grosor: 0.002 }), 0, h * 0.45, 0);   // el pisón
  pon(g, K.malla(K.cilindro(0.003, 0.003, h * 0.5, 3), '#5a4a3a', { sinTinta: true }), 0, h * 0.75, 0);
  for (let k = 0; k < 6; k++) { const a = (k / 6) * Math.PI * 2, c = K.malla(K.cilindro(0.003, 0.003, 0.9, 3), '#7a6a52', { sinTinta: true }); c.position.set(Math.cos(a) * 0.22, h * 0.55, Math.sin(a) * 0.22 + 0.1); c.lookAt(0, h, 0); c.rotateX(Math.PI / 2); g.add(c); }
  return g;
}
/* la grúa de obra con su rueda de andar (la movían hombres caminando adentro) y un sillar colgando */
export function grua(K, alto = 1.25) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.3, 0.06, 0.3, AMB.maderaD, { grosor: 0.002 }), 0, 0.03, 0);
  pon(g, K.malla(K.cilindro(0.02, 0.025, alto, 6), AMB.madera, { grosor: 0.002 }), 0, alto / 2, 0);
  const rueda = K.malla(K.toro(0.2, 0.014, Math.PI * 2, 0.6), AMB.maderaL, { grosor: 0.002 }); rueda.position.set(0, 0.24, 0.2); g.add(rueda);
  for (let k = 0; k < 4; k++) { const r = caja(K, 0.4, 0.01, 0.01, AMB.madera, { sinTinta: true }); r.position.set(0, 0.24, 0.2); r.rotation.z = k * Math.PI / 4; g.add(r); }
  const pl = K.malla(K.cilindro(0.012, 0.016, 0.85, 5), AMB.madera, { grosor: 0.002 }); pl.position.set(0.3, alto - 0.12, 0); pl.rotation.z = -1.0; g.add(pl);   // la pluma
  pon(g, K.malla(K.cilindro(0.003, 0.003, 0.5, 3), '#5a4a3a', { sinTinta: true }), 0.64, alto - 0.6, 0);
  pon(g, caja(K, 0.14, 0.08, 0.1, AMB.aren, { grosor: 0.002 }), 0.64, alto - 0.88, 0);
  return g;
}
/* el andamio de palos amarrados y tablones (el del cuadro de Lingelbach) frente a una cara de ancho w y alto h */
export function andamiaje(K, w, h, { paso = 0.24, piso = 0.2 } = {}) {
  const g = new THREE.Group(), n = Math.max(1, Math.round(w / paso));
  for (let k = 0; k <= n; k++) for (const z of [0.03, 0.14]) pon(g, K.malla(K.cilindro(0.006, 0.007, h, 4), AMB.andamio, { sinTinta: true }), -w / 2 + k * w / n, h / 2, z);
  for (let y = piso; y < h; y += piso) { pon(g, caja(K, w, 0.012, 0.13, AMB.maderaL, { grosor: 0.0012 }), 0, y, 0.085); pon(g, caja(K, w, 0.008, 0.008, AMB.andamio, { sinTinta: true }), 0, y + 0.07, 0.145); }
  for (let k = 0; k < n; k += 2) { const d = K.malla(K.cilindro(0.004, 0.004, Math.hypot(w / n, piso * 2), 3), AMB.andamio, { sinTinta: true }); d.position.set(-w / 2 + (k + 0.5) * w / n, piso * 1.5, 0.15); d.rotation.z = Math.atan2(w / n, piso * 2); g.add(d); }
  return g;
}
/* los sillares de arenisca que llegaban de Bentheim por agua, apilados en la obra */
export function sillares(K, n = 9, semilla = 3) {
  const g = new THREE.Group();
  for (let k = 0; k < n; k++) {
    const x = (hashA(k, semilla) - 0.5) * 0.9, z = (hashA(k, semilla, 2) - 0.5) * 0.5, pila = k % 3 === 0 ? 2 : 1;
    for (let p = 0; p < pila; p++) pon(g, caja(K, 0.14, 0.07, 0.1, p % 2 ? AMB.arenL : AMB.aren, { grosor: 0.002 }), x, 0.035 + p * 0.07, z, hashA(k, 9) * 0.6);
  }
  return g;
}
/* el empedrado del Dam: adoquines claros en espiga, con la faja de piedra del borde */
const matDam = K => lienzo(K, 'amb-dam', 64, 64, (g, w, h) => {
  g.fillStyle = '#e3dccb'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 8) for (let x = (y / 8) % 2 ? -4 : 0; x < w; x += 8) { const k = hashA(x, y, 11); g.fillStyle = `rgba(${k > 0.5 ? '255,252,242' : '150,136,110'},${Math.abs(k - 0.5) * 0.45})`; g.fillRect(x + 1, y + 1, 6, 6); }
  g.fillStyle = 'rgba(140,120,90,.35)'; for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 1);
});
export function empedrado(K, w, d) {
  const g = new THREE.Group(), m = lam(matDam(K), w, d, w / ESC, d / ESC); m.rotation.x = -Math.PI / 2; m.position.y = 0.012; g.add(m);
  pon(g, caja(K, w, 0.012, d, '#d6ccb6', { sinTinta: true, sombra: false }), 0, 0.006, 0);
  return g;
}

/* ============================================================
   EL HÉROE, POR ETAPAS. Devuelve el grupo con el origen en el centro de la casa consistorial (o de la iglesia), el frente
   a +z, y en userData la caja de la casa (`caja`) y de todo el conjunto.
   - 'dam' (terminada, con el Dam): 0 la casa vieja y el campo de pilotes con el martinete · 1 la planta baja y el primer
     orden entre andamios (la vieja sigue en pie) · 2 el cuerpo entero con sus frontones y el techo; la vieja ya ardió;
     el andamio de la cúpula · 3 la cúpula del carillón, las estatuas de bronce y Atlas. Siempre: la Iglesia Nueva y la Waag.
   - 'obra' (el Dam de 1652-1655): 0 la casa vieja entera, los pilotes y dos martinetes · 1 la planta baja con la grúa de
     rueda · 2 el incendio: la vieja quemada y la nueva hasta el segundo orden, toda en andamios · 3 la inauguración de
     1655, con la casa techada, el ala derecha todavía en andamios y la cúpula por hacer, con la grúa en el techo.
   - 'westerkerk' (1620-1638): 0 los pilotes y el martinete · 1 los muros y el arranque de la torre entre andamios · 2 la
     iglesia techada con sus dos hastiales y la torre de ladrillo con un techo provisorio · 3 la torre entera con la corona.
   ============================================================ */
export function heroe(K, variante = VARIANTES.heroe, etapa = 3, { plaza = true } = {}) {
  if (variante === 'westerkerk') return westerkerkHeroe(K, etapa, { plaza });
  const g = new THREE.Group(), { W, D } = SV, obra = variante === 'obra';
  if (plaza) { const dam = empedrado(K, W + 2.6, 1.7); dam.position.set(0.95, 0, D / 2 + 0.85); g.add(dam); }   // el Dam, delante de la casa (en el tablero lo pinta el suelo)
  const kerk = nieuweKerk2(K); kerk.position.set(W / 2 + 0.95, 0, -0.55); g.add(kerk);
  if (!obra) { const wa = waagDam(K); wa.position.set(W / 2 + 0.85, 0, D / 2 + 0.95); g.add(wa); }
  else { const si = sillares(K, 12, 5); si.position.set(W / 2 + 0.85, 0, D / 2 + 0.9); g.add(si); }
  const vieja = (q = false) => { const o = oudStadhuis(K, { quemada: q }); o.position.set(-W / 2 + 1.0, 0, D / 2 + 0.8); g.add(o); return o; };
  if (etapa === 0) {
    vieja();
    const pi = pilotes(K, W, D - 0.4); pi.position.set(0, 0, -0.2); g.add(pi);
    const mt = martinete(K); mt.position.set(0.6, 0, -0.3); g.add(mt);
    if (obra) { const m2 = martinete(K); m2.position.set(-1.0, 0, -0.6); m2.rotation.y = 0.8; g.add(m2); const si = sillares(K, 8, 9); si.position.set(1.6, 0, 0.6); g.add(si); }
  } else if (etapa === 1) {
    vieja();
    g.add(stadhuisVC(K, obra ? 1 : 2));
    const hA = obra ? 0.45 : 1.1;
    const af = andamiaje(K, W, hA); af.position.set(0, 0, D / 2 + 0.08); g.add(af);
    const al = andamiaje(K, D, hA); al.position.set(W / 2 + 0.06, 0, 0); al.rotation.y = Math.PI / 2; g.add(al);
    if (obra) { const gr = grua(K, 1.3); gr.position.set(-0.6, 0, -0.4); g.add(gr); }
  } else if (etapa === 2) {
    if (obra) {
      vieja(true);
      g.add(stadhuisVC(K, 2));
      const af = andamiaje(K, W, 1.2); af.position.set(0, 0, D / 2 + 0.08); g.add(af);
      const al = andamiaje(K, D, 1.2); al.position.set(W / 2 + 0.06, 0, 0); al.rotation.y = Math.PI / 2; g.add(al);
      const gr = grua(K, 1.6); gr.position.set(0.3, 0, -0.3); g.add(gr);
    } else {
      g.add(stadhuisVC(K, 4));
      const ac = andamiaje(K, 0.8, 0.9, { paso: 0.2, piso: 0.18 }); ac.position.set(0, SV.H + 0.075 + SV.hT - 0.15, -0.45); g.add(ac);
      const ac2 = andamiaje(K, 0.8, 0.9, { paso: 0.2, piso: 0.18 }); ac2.position.set(0, SV.H + 0.075 + SV.hT - 0.15, 0.45); ac2.rotation.y = Math.PI; g.add(ac2);
    }
  } else {
    if (obra) {
      g.add(stadhuisVC(K, 4, { conAtlas: false }));
      const af = andamiaje(K, 1.6, 1.62); af.position.set(W / 2 - 0.8, 0, D / 2 + 0.08); g.add(af);
      const al = andamiaje(K, D, 1.62); al.position.set(W / 2 + 0.06, 0, 0); al.rotation.y = Math.PI / 2; g.add(al);
      const y = SV.H + 0.075 + SV.hT - 0.15;
      [[0, -0.42, 0], [0, 0.42, Math.PI], [0.42, 0, Math.PI / 2], [-0.42, 0, -Math.PI / 2]].forEach(([x, z, r]) => { const a = andamiaje(K, 0.84, 1.15, { paso: 0.21, piso: 0.19 }); a.position.set(x, y, z); a.rotation.y = r; g.add(a); });
      const gr = grua(K, 1.25); gr.position.set(1.15, SV.H + 0.075 + 0.12, 0.62); gr.rotation.y = -2.2; g.add(gr);   // la grúa en el techo, subiendo la piedra de la cúpula
      [[-1.6, 0.2], [1.6, 0.2]].forEach(([x, z]) => { const m = K.malla(K.cilindro(0.006, 0.006, 0.5, 4), AMB.maderaD, { sinTinta: true }); m.position.set(x, SV.H + 0.075 + 0.6, z); g.add(m);
        [AMB.postRojo, '#f6f2ea', '#26221e'].forEach((c, i) => pon(g, caja(K, 0.004, 0.035, 0.16, c, { sinTinta: true }), x, SV.H + 0.075 + 0.78 - i * 0.035, z + 0.09)); });   // las banderas de la ciudad, para la inauguración
      const si = sillares(K, 8, 13); si.position.set(-1.2, 0, D / 2 + 0.9); g.add(si);
    } else g.add(stadhuisVC(K, 5));
  }
  g.userData.caja = { w: W, d: D };
  return g;
}

/* ============================================================
   LA TORRE DEL WESTERKERK (Hendrick de Keyser y su hijo Pieter, 1638; 85 m, la más alta de la ciudad): el fuste de ladrillo
   con sus esquinas y fajas de arenisca y las troneras largas de las campanas; la balaustrada; el cuerpo cuadrado de piedra
   con el escudo de Ámsterdam y «ANNO 1638»; los dos cuerpos octogonales de madera forrada en plomo, el del reloj (de esfera
   roja) y el de las campanas, con columnas y bolas azules en las esquinas; la linterna y, arriba, la corona imperial que
   Maximiliano le dio a la ciudad en 1489 (azul, con aros de oro, perlas y piedras rojas), la bola dorada y la veleta.
   `alto`: el alto total (6 en el héroe C, 2,9 como segunda pieza). `hasta`: 'ladrillo' para la etapa con techo provisorio.
   ============================================================ */
const matPiedraTorre = K => lienzo(K, 'amb-torreP', 64, 64, (g, w, h) => {
  g.fillStyle = AMB.aren; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(140,118,76,.3)'; for (let y = 0; y < h; y += 10) { g.fillRect(0, y, w, 1); g.fillRect(((y / 10) % 2 ? 20 : 44), y, 1, 10); }
});
function escudoAmsterdam(K, s) {   // rojo con la faja negra y las tres cruces de San Andrés en blanco, coronado
  const g = new THREE.Group();
  pon(g, caja(K, 0.16 * s, 0.2 * s, 0.012, '#c0392b', { grosor: 0.001 }), 0, 0, 0);
  pon(g, caja(K, 0.06 * s, 0.2 * s, 0.014, '#1e1c1c', { sinTinta: true }), 0, 0, 0.001);
  for (let k = 0; k < 3; k++) [-1, 1].forEach(l => { const c = caja(K, 0.05 * s, 0.009 * s, 0.016, '#f6f2ea', { sinTinta: true }); c.position.set(0, (k - 1) * 0.06 * s, 0.002); c.rotation.z = l * Math.PI / 4; g.add(c); });
  pon(g, K.malla(K.esfera(0.05 * s, 0.4), AMB.oro, { sinTinta: true }), 0, 0.14 * s, 0).scale.set(1.3, 0.7, 0.5);
  return g;
}
export function torreWester(K, alto = 6, { hasta = 'corona', conIglesia = false } = {}) {
  const g = new THREE.Group(), s = alto / 6, mL = matLadrillo(K, AMB.rojoD), mP = matPiedraTorre(K);
  const a1 = 0.95 * s, h1 = 2.85 * s;
  // el fuste de ladrillo, en dos tramos
  pon(g, caja(K, a1, h1, a1, AMB.rojoD, { grosor: 0.006 }), 0, h1 / 2, 0);
  [[0, 1], [Math.PI / 2, 1], [-Math.PI / 2, 1], [Math.PI, 1]].forEach(([r]) => { const f = lam(mL, a1, h1, a1 / ESC * 1.4, h1 / ESC * 1.4); f.position.set(Math.sin(r) * (a1 / 2 + 0.002), h1 / 2, Math.cos(r) * (a1 / 2 + 0.002)); f.rotation.y = r; g.add(f); });
  for (let y = 0.1 * s; y < h1; y += 0.16 * s) [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b], i) => {   // las esquinas de sillares, alternadas
    const lx = (Math.round(y / (0.16 * s)) + i) % 2 ? 0.12 * s : 0.07 * s;
    pon(g, caja(K, lx, 0.07 * s, lx, AMB.aren, { sinTinta: true }), a * (a1 / 2 - lx / 2 + 0.006), y, b * (a1 / 2 - lx / 2 + 0.006));
  });
  for (const y of [0.05, 1.45, 2.1, 2.82]) pon(g, caja(K, a1 + 0.03 * s, 0.06 * s, a1 + 0.03 * s, AMB.arenL, { grosor: 0.003 }), 0, y * s, 0);   // las fajas y la cornisa
  [0, Math.PI / 2].forEach(r => [1, -1].forEach(l => {   // la puerta abajo; las troneras largas de las campanas arriba
    const q = new THREE.Group(); q.rotation.y = r + (l < 0 ? Math.PI : 0); g.add(q);
    pon(q, caja(K, 0.22 * s, 0.4 * s, 0.014, '#3a2e26', { sinTinta: true }), 0, 0.27 * s, a1 / 2 + 0.008);
    pon(q, caja(K, 0.3 * s, 0.05 * s, 0.02, AMB.arenL, { sinTinta: true }), 0, 0.5 * s, a1 / 2 + 0.01);
    [-1, 1].forEach(e => pon(q, caja(K, 0.1 * s, 0.55 * s, 0.014, '#3c3632', { sinTinta: true }), e * 0.12 * s, 2.45 * s, a1 / 2 + 0.008));
    pon(q, caja(K, 0.34 * s, 0.04 * s, 0.018, AMB.arenL, { sinTinta: true }), 0, 2.75 * s, a1 / 2 + 0.01);
    pon(q, caja(K, 0.18 * s, 0.24 * s, 0.014, '#3c3632', { sinTinta: true }), 0, 1.75 * s, a1 / 2 + 0.008);
  }));
  if (hasta === 'ladrillo') {   // el techo provisorio de tablas
    pon(g, tejado4(K, a1 + 0.04, a1 + 0.04, 0.35 * s, matPizarra(K, AMB.plomoD), 0.004), 0, h1, 0);
    g.userData.alto = h1 + 0.35 * s; return g;
  }
  // la balaustrada
  const a2 = 0.98 * s; pon(g, caja(K, a2, 0.03 * s, a2, AMB.arenL, { grosor: 0.003 }), 0, h1 + 0.015 * s, 0);
  for (let k = 0; k < 7; k++) [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([u, v]) => { const t = -a2 / 2 + 0.07 * s + k * (a2 - 0.14 * s) / 6; pon(g, K.malla(K.cilindro(0.012 * s, 0.014 * s, 0.07 * s, 5), AMB.arenL, { sinTinta: true }), u ? u * (a2 / 2 - 0.02 * s) : t, h1 + 0.065 * s, v ? v * (a2 / 2 - 0.02 * s) : t); });
  pon(g, caja(K, a2, 0.025 * s, a2, AMB.arenL, { grosor: 0.002 }), 0, h1 + 0.11 * s, 0);
  // el cuerpo de piedra, con el escudo y las pilastras de las esquinas
  const a3 = 0.78 * s, y3 = h1 + 0.03 * s, h3 = 0.82 * s;
  pon(g, caja(K, a3, h3, a3, AMB.aren, { grosor: 0.005 }), 0, y3 + h3 / 2, 0);
  [[0], [Math.PI / 2], [-Math.PI / 2], [Math.PI]].forEach(([r]) => { const f = lam(mP, a3, h3, a3 / ESC * 1.5, h3 / ESC * 1.5); f.position.set(Math.sin(r) * (a3 / 2 + 0.002), y3 + h3 / 2, Math.cos(r) * (a3 / 2 + 0.002)); f.rotation.y = r; g.add(f);
    const q = new THREE.Group(); q.rotation.y = r; g.add(q);
    const es = escudoAmsterdam(K, 1.4 * s); es.position.set(0, y3 + h3 * 0.42, a3 / 2 + 0.012); q.add(es);
    pon(q, caja(K, 0.4 * s, 0.05 * s, 0.012, '#3a3430', { sinTinta: true }), 0, y3 + h3 * 0.82, a3 / 2 + 0.008);   // ANNO 1638
    pon(q, caja(K, 0.3 * s, 0.012 * s, 0.014, AMB.oro, { sinTinta: true }), 0, y3 + h3 * 0.82, a3 / 2 + 0.012);
  });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => pon(g, caja(K, 0.08 * s, h3, 0.08 * s, AMB.arenL, { grosor: 0.002 }), a * (a3 / 2 - 0.02 * s), y3 + h3 / 2, b * (a3 / 2 - 0.02 * s)));
  const y4 = y3 + h3;
  pon(g, caja(K, a3 + 0.12 * s, 0.07 * s, a3 + 0.12 * s, AMB.arenL, { grosor: 0.003 }), 0, y4 + 0.035 * s, 0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => pon(g, K.malla(K.esfera(0.05 * s, 0.5), '#3f78c8', { grosor: 0.0015 }), a * (a3 / 2 + 0.02 * s), y4 + 0.12 * s, b * (a3 / 2 + 0.02 * s)));   // las bolas azules
  // los cuerpos octogonales: el del reloj, el de las campanas y la linterna
  const oct = (r, h, y, reloj) => {
    pon(g, K.malla(K.cilindro(r * 0.92, r * 0.92, h, 8), AMB.plomoL, { grosor: 0.004 }), 0, y + h / 2, 0).rotation.y = Math.PI / 8;
    for (let i = 0; i < 8; i++) { const a = (i + 0.5) / 8 * Math.PI * 2; pon(g, K.malla(K.cilindro(0.022 * s, 0.025 * s, h * 0.92, 6), AMB.arenL, { grosor: 0.0015 }), Math.cos(a) * r, y + h * 0.48, Math.sin(a) * r); }
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const v = caja(K, r * 0.42, h * (reloj ? 0.32 : 0.6), 0.02, '#34302e', { sinTinta: true }); v.position.set(Math.cos(a) * r * 0.9, y + h * (reloj ? 0.72 : 0.52), Math.sin(a) * r * 0.9); v.rotation.y = -a + Math.PI / 2; g.add(v); }
    if (reloj) [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach(r2 => {   // las esferas rojas del reloj, con su aro de oro
      const q = new THREE.Group(); q.rotation.y = r2; g.add(q);
      const c = K.malla(K.cilindro(r * 0.34, r * 0.34, 0.02, 14), '#b8382c', { grosor: 0.0015 }); c.rotation.x = Math.PI / 2; c.position.set(0, y + h * 0.36, r * 0.86 + 0.012); q.add(c);
      const o = K.malla(K.toro(r * 0.32, 0.008 * s, Math.PI * 2, 0.4), AMB.oro, { sinTinta: true }); o.position.set(0, y + h * 0.36, r * 0.86 + 0.024); q.add(o);
    });
    pon(g, K.malla(K.cilindro(r * 1.12, r * 1.05, 0.06 * s, 8), AMB.arenL, { grosor: 0.003 }), 0, y + h + 0.03 * s, 0).rotation.y = Math.PI / 8;
    return y + h + 0.06 * s;
  };
  let y = oct(0.36 * s, 0.68 * s, y4 + 0.07 * s, true);
  y = oct(0.29 * s, 0.56 * s, y, false);
  y = oct(0.2 * s, 0.32 * s, y, false);
  // la corona imperial
  pon(g, K.malla(K.cilindro(0.21 * s, 0.2 * s, 0.07 * s, 14), AMB.oro, { grosor: 0.002 }), 0, y + 0.035 * s, 0);
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; pon(g, K.malla(K.esfera(0.022 * s, 0.4), i % 2 ? '#c0392b' : '#f6f2ea', { sinTinta: true }), Math.cos(a) * 0.21 * s, y + 0.04 * s, Math.sin(a) * 0.21 * s); }
  const cu = K.malla(propia(new THREE.SphereGeometry(0.19 * s, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2)), '#3f78c8', { grosor: 0.003 }); cu.position.y = y + 0.07 * s; cu.scale.y = 1.15; g.add(cu);
  [0, Math.PI / 2].forEach(r => { const ar = K.malla(K.toro(0.195 * s, 0.014 * s, Math.PI, 0.5), AMB.oro, { sinTinta: true }); ar.position.y = y + 0.07 * s; ar.rotation.y = r; ar.scale.y = 1.15; g.add(ar); });
  y += 0.07 * s + 0.22 * s;
  pon(g, K.malla(K.esfera(0.06 * s, 0.5), AMB.oro, { grosor: 0.002 }), 0, y + 0.05 * s, 0);
  pon(g, K.malla(K.cilindro(0.008 * s, 0.008 * s, 0.32 * s, 4), '#2a2622', { sinTinta: true }), 0, y + 0.25 * s, 0);
  pon(g, caja(K, 0.12 * s, 0.01 * s, 0.01 * s, '#2a2622', { sinTinta: true }), 0, y + 0.24 * s, 0);
  pon(g, caja(K, 0.08 * s, 0.06 * s, 0.01 * s, AMB.oro, { sinTinta: true }), 0.02 * s, y + 0.38 * s, 0);   // la veleta del gallo
  g.userData.alto = y + 0.42 * s;
  if (conIglesia) {   // un tramo de la nave detrás, para que se lea que es la torre de una iglesia
    const n = new THREE.Group(); n.position.set(-a1 / 2 - 0.45 * s * 2, 0, 0); g.add(n);
    pon(n, caja(K, 1.0 * s * 2, 1.25 * s, 1.3 * s, AMB.rojo, { grosor: 0.004 }), 0, 0.625 * s, 0);
    const f = lam(matLadrillo(K, AMB.rojo), 2.0 * s, 1.25 * s, 2 * s / ESC, 1.25 * s / ESC); f.position.set(0, 0.625 * s, 0.65 * s + 0.002); n.add(f);
    const f2 = lam(matLadrillo(K, AMB.rojo), 2.0 * s, 1.25 * s, 2 * s / ESC, 1.25 * s / ESC); f2.position.set(0, 0.625 * s, -0.65 * s - 0.002); f2.rotation.y = Math.PI; n.add(f2);
    for (const l of [1, -1]) for (let k = 0; k < 3; k++) { pon(n, caja(K, 0.18 * s, 0.7 * s, 0.014, AMB.vidrio, { sinTinta: true }), -0.6 * s + k * 0.6 * s, 0.62 * s, l * (0.65 * s + 0.008)); pon(n, caja(K, 0.24 * s, 0.76 * s, 0.01, AMB.arenL, { sinTinta: true }), -0.6 * s + k * 0.6 * s, 0.63 * s, l * (0.65 * s + 0.004)); }   // las ventanas altas, a los dos lados
    const t = new THREE.Shape(); t.moveTo(-0.7 * s, 0); t.lineTo(0.7 * s, 0); t.lineTo(0, 0.75 * s); t.closePath();
    const tg = propia(new THREE.ExtrudeGeometry(t, { depth: 2.0 * s, bevelEnabled: false })); tg.translate(0, 0, -1.0 * s);
    const te = K.malla(tg, AMB.pizarra, { grosor: 0.004 }); te.rotation.y = Math.PI / 2; te.position.y = 1.25 * s; n.add(te);
  }
  return g;
}
/* EL WESTERKERK ENTERO (el héroe C): la nave de ladrillo con sus fajas de piedra y las ventanas altas de medio punto, los
   dos brazos del norte con sus hastiales de volutas y pináculos, el techo de pizarra y la torre en el extremo de poniente,
   sobre el Prinsengracht. La nave a lo largo de x, los hastiales a +z, la torre a +x (la que mira a la cámara). */
function westerkerkHeroe(K, etapa = 3, { plaza = true } = {}) {
  const g = new THREE.Group(), L = 3.5, w = 1.35, hm = 1.2, mL = matLadrillo(K, AMB.rojo), mP = matPizarra(K);
  const xT = L / 2 + 0.47, xN = -0.15;   // el centro de la torre y el de la nave
  if (plaza) { const pl = empedrado(K, 5.0, 1.15); pl.position.set(0.3, 0, w / 2 + 0.62 + 0.4); g.add(pl); }   // el Westermarkt
  if (etapa === 0) {
    const pi = pilotes(K, L + 0.9, w + 0.3); pi.position.set(xN + 0.3, 0, 0); g.add(pi);
    const mt = martinete(K); mt.position.set(xT - 0.1, 0, 0); g.add(mt);
    const si = sillares(K, 12, 21); si.position.set(-0.6, 0, w / 2 + 0.9); g.add(si);
    g.userData.caja = { w: L + 1.0, d: w }; return g;
  }
  const hN = etapa === 1 ? 0.7 : hm;
  pon(g, caja(K, L, hN, w, AMB.rojo, { grosor: 0.006 }), xN, hN / 2, 0);
  [1, -1].forEach(sz => { const f = lam(mL, L, hN, L / ESC, hN / ESC); f.position.set(xN, hN / 2, sz * (w / 2 + 0.002)); if (sz < 0) f.rotation.y = Math.PI; g.add(f); });
  for (const y of [0.06, 0.62, hm - 0.04]) if (y < hN) pon(g, caja(K, L + 0.02, 0.04, w + 0.02, AMB.arenL, { sinTinta: true }), xN, y, 0);
  for (let k = 0; k < 6; k++) [1, -1].forEach(sz => {   // las ventanas altas de medio punto, con su marco de piedra
    const x = xN - L / 2 + 0.3 + k * (L - 0.6) / 5;
    if (sz > 0 && (k === 1 || k === 4)) return;   // ahí están los brazos
    pon(g, caja(K, 0.26, Math.min(0.7, hN - 0.3), 0.012, AMB.arenL, { sinTinta: true }), x, 0.22 + Math.min(0.7, hN - 0.3) / 2, sz * (w / 2 + 0.006));
    pon(g, caja(K, 0.2, Math.min(0.64, hN - 0.34), 0.014, AMB.vidrio, { sinTinta: true }), x, 0.22 + Math.min(0.7, hN - 0.3) / 2, sz * (w / 2 + 0.009));
  });
  // los dos brazos del norte con sus hastiales
  for (const k of [1, 4]) {
    const x = xN - L / 2 + 0.3 + k * (L - 0.6) / 5, bw = 0.95, bz = 0.42;
    pon(g, caja(K, bw, hN, bz, AMB.rojo, { grosor: 0.005 }), x, hN / 2, w / 2 + bz / 2);
    const f = lam(mL, bw, hN, bw / ESC, hN / ESC); f.position.set(x, hN / 2, w / 2 + bz + 0.002); g.add(f);
    pon(g, caja(K, 0.34, Math.min(0.78, hN - 0.2), 0.012, AMB.arenL, { sinTinta: true }), x, 0.2 + Math.min(0.78, hN - 0.2) / 2, w / 2 + bz + 0.006);
    pon(g, caja(K, 0.28, Math.min(0.72, hN - 0.24), 0.014, AMB.vidrio, { sinTinta: true }), x, 0.2 + Math.min(0.78, hN - 0.2) / 2, w / 2 + bz + 0.009);
    if (etapa >= 2) {
      const sh = new THREE.Shape(), m = bw / 2; sh.moveTo(-m, 0); sh.lineTo(-m, 0.12); sh.quadraticCurveTo(-m * 0.55, 0.16, -m * 0.5, 0.38); sh.lineTo(-m * 0.3, 0.42); sh.lineTo(-m * 0.3, 0.62); sh.lineTo(0, 0.74); sh.lineTo(m * 0.3, 0.62); sh.lineTo(m * 0.3, 0.42); sh.lineTo(m * 0.5, 0.38); sh.quadraticCurveTo(m * 0.55, 0.16, m, 0.12); sh.lineTo(m, 0); sh.closePath();
      pon(g, K.malla(propia(new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false })), AMB.rojo, { grosor: 0.004 }), x, hm, w / 2 + bz - 0.05);
      pon(g, caja(K, bw * 0.62, 0.035, 0.07, AMB.arenL, { grosor: 0.002 }), x, hm + 0.38, w / 2 + bz - 0.02);
      [-1, 1].forEach(l => { pon(g, K.malla(K.cono(0.03, 0.16, 6), AMB.arenL, { grosor: 0.0015 }), x + l * m, hm + 0.2, w / 2 + bz - 0.02); pon(g, K.malla(K.esfera(0.03, 0.4), AMB.arenL, { sinTinta: true }), x + l * m * 0.3, hm + 0.66, w / 2 + bz - 0.02); });
      pon(g, K.malla(K.esfera(0.04, 0.4), AMB.oro, { sinTinta: true }), x, hm + 0.78, w / 2 + bz - 0.02);
      pon(g, caja(K, 0.12, 0.16, 0.012, AMB.vidrio, { sinTinta: true }), x, hm + 0.3, w / 2 + bz + 0.003);
      const t = new THREE.Shape(); t.moveTo(-bw / 2, 0); t.lineTo(bw / 2, 0); t.lineTo(0, 0.62); t.closePath();
      const tg = propia(new THREE.ExtrudeGeometry(t, { depth: bz + w / 2, bevelEnabled: false }));
      pon(g, K.malla(tg, AMB.pizarra, { grosor: 0.003 }), x, hm, 0);
    }
  }
  if (etapa >= 2) {   // el techo de la nave
    const t = new THREE.Shape(); t.moveTo(-w / 2 - 0.03, 0); t.lineTo(w / 2 + 0.03, 0); t.lineTo(0, 0.82); t.closePath();
    const tg = propia(new THREE.ExtrudeGeometry(t, { depth: L + 0.04, bevelEnabled: false })); tg.translate(0, 0, -(L + 0.04) / 2);
    const te = K.malla(tg, AMB.pizarra, { grosor: 0.005 }); te.rotation.y = Math.PI / 2; te.position.set(xN, hm, 0); g.add(te);
    [-1, 1].forEach(l => {   // los faldones de pizarra encima del prisma
      const q = new THREE.Group(); q.rotation.y = Math.PI / 2; q.position.set(xN, hm, 0); g.add(q);
      const a = losaTex(K, mP, Math.hypot(w / 2 + 0.03, 0.82) + 0.04, 0.02, L + 0.06, { sinTinta: true }); a.rotation.z = -l * Math.atan2(0.82, w / 2 + 0.03); a.position.set(l * (w / 4 + 0.008), 0.41 + 0.012, 0); q.add(a);
    });
    const sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(0, 0.82); sh.closePath();   // el hastial de levante
    const hg = K.malla(propia(new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false })), AMB.rojo, { grosor: 0.004 }); hg.rotation.y = -Math.PI / 2; hg.position.set(xN - L / 2 + 0.04, hm, 0); g.add(hg);
  } else {
    const af = andamiaje(K, L, 1.0); af.position.set(xN, 0, w / 2 + 0.06); g.add(af);
    const si = sillares(K, 10, 7); si.position.set(-0.4, 0, w / 2 + 1.0); g.add(si);
  }
  // la torre
  const torre = etapa === 1 ? (() => { const t = new THREE.Group(); pon(t, caja(K, 0.95, 0.8, 0.95, AMB.rojoD, { grosor: 0.005 }), 0, 0.4, 0); const a = andamiaje(K, 0.95, 1.1); a.position.z = 0.5; t.add(a); const a2 = andamiaje(K, 0.95, 1.1); a2.rotation.y = Math.PI / 2; a2.position.x = 0.5; t.add(a2); return t; })()
    : torreWester(K, 6, { hasta: etapa === 2 ? 'ladrillo' : 'corona' });
  torre.position.set(xT, 0, 0); g.add(torre);
  if (etapa === 1) { const gr = grua(K, 1.5); gr.position.set(xT - 0.3, 0, -1.0); g.add(gr); }
  g.userData.caja = { w: L + 0.95, d: w + 0.42 };
  return g;
}

/* ============================================================
   LA SEGUNDA PIEZA (alto 2-3): 'westertoren', la torre con un tramo de su iglesia; 'molino', el molino de cuerpo octogonal
   con su balcón (un molino de bastión: sobre cada baluarte de la muralla había uno) sobre el baluarte de tierra con su
   revestimiento de ladrillo y el foso; 'montelbaan', la Montelbaanstoren del Oudeschans: la torre de defensa de ladrillo
   de 1516 con el remate blanco de madera que le puso Hendrick de Keyser en 1606, sobre su muelle y con una barca.
   ============================================================ */
export function segunda(K, variante = VARIANTES.segunda) {
  if (variante === 'molino') return molinoBastion(K);
  if (variante === 'montelbaan') { const m = montelbaanstoren(K), g = new THREE.Group(); m.scale.setScalar(0.9); g.add(m); g.userData.alto = m.userData.alto * 0.9; return g; }
  return torreWester(K, 2.9, { conIglesia: true });
}
/* el baluarte: el pentágono de tierra con el talud de pasto, el revestimiento de ladrillo al pie y el foso alrededor */
export const BALUARTE = [[-0.95, -0.7], [0.95, -0.7], [0.95, 0.25], [0, 1.15], [-0.95, 0.25]];   // la planta del baluarte, la punta a +z
export function baluarte(K, { esc = 1, alto = 0.4, foso = true } = {}) {
  const g = new THREE.Group();
  const P = BALUARTE.map(([x, z]) => [x * esc, z * esc]);
  const forma = f => { const s = new THREE.Shape(); P.forEach(([x, z], i) => { const p = [x * f, -z * f]; i ? s.lineTo(...p) : s.moveTo(...p); }); s.closePath(); return s; };
  const mu = new THREE.ExtrudeGeometry(forma(1), { depth: alto * 0.45, bevelEnabled: false }); mu.rotateX(-Math.PI / 2);
  g.add(K.malla(propia(mu), AMB.muro, { grosor: 0.006 }));   // el pie de ladrillo
  const ta = new THREE.ExtrudeGeometry(forma(0.8), { depth: 0.01, bevelEnabled: true, bevelThickness: alto * 0.55, bevelSize: 0.16 * esc, bevelSegments: 1 }); ta.rotateX(-Math.PI / 2);
  pon(g, K.malla(propia(ta), AMB.pasto, { grosor: 0.006 }), 0, alto * 0.45, 0);   // el talud de pasto
  if (foso) { const fo = new THREE.ExtrudeGeometry(forma(1.28), { depth: 0.01, bevelEnabled: false }); fo.rotateX(-Math.PI / 2); const f = new THREE.Mesh(propia(fo), K.mat(AMB.agua)); f.position.y = -0.03; f.receiveShadow = true; g.add(f); }
  g.userData.cima = alto * 0.45 + alto * 0.55 + 0.01;
  return g;
}
/* el molino de cuerpo octogonal (achtkante bovenkruier): la base de ladrillo, el cuerpo de caña que se angosta, el balcón de
   tablas a media altura, el capuchón que gira con el viento, las cuatro aspas de enrejado con su lona y la cola con la rueda */
export function molinoGrande(K, { aspasVivas = true } = {}) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.38, 0.4, 0.26, 8), AMB.muro, { grosor: 0.004 }), 0, 0.13, 0).rotation.y = Math.PI / 8;
  pon(g, caja(K, 0.14, 0.2, 0.02, AMB.puerta, { sinTinta: true }), 0, 0.1, 0.37);
  const cuerpo = K.malla(K.cilindro(0.22, 0.35, 1.0, 8), lienzo(K, 'amb-cania', 32, 64, (c, w, h) => { c.fillStyle = '#9d8d6a'; c.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 2) { c.fillStyle = `rgba(${hashA(x, 1) > 0.5 ? '255,240,210' : '60,48,30'},${0.08 + hashA(x, 2) * 0.12})`; c.fillRect(x, 0, 1.2, h); } }), { grosor: 0.005 });
  cuerpo.position.y = 0.76; cuerpo.rotation.y = Math.PI / 8; g.add(cuerpo);
  for (const [y, z] of [[0.58, 0.33], [1.0, 0.27]]) { pon(g, caja(K, 0.08, 0.1, 0.012, AMB.blanco, { sinTinta: true }), 0, y, z); pon(g, caja(K, 0.05, 0.07, 0.014, AMB.vidrio, { sinTinta: true }), 0, y, z + 0.002); }
  // el balcón (la stelling)
  pon(g, K.malla(K.cilindro(0.56, 0.56, 0.03, 8), AMB.madera, { grosor: 0.003 }), 0, 0.48, 0).rotation.y = Math.PI / 8;
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; pon(g, K.malla(K.cilindro(0.006, 0.006, 0.12, 4), AMB.maderaD, { sinTinta: true }), Math.cos(a) * 0.54, 0.55, Math.sin(a) * 0.54);
    const p = K.malla(K.cilindro(0.008, 0.008, 0.36, 4), AMB.maderaD, { sinTinta: true }); p.position.set(Math.cos(a) * 0.45, 0.32, Math.sin(a) * 0.45); p.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); g.add(p); }
  pon(g, K.malla(K.toro(0.54, 0.006, Math.PI * 2, 0.5), AMB.maderaD, { sinTinta: true }), 0, 0.61, 0).rotation.x = Math.PI / 2;
  // el capuchón
  const cap = K.malla(K.capsula(0.2, 0.22, 0.6), '#8a7a5a', { grosor: 0.004 }); cap.rotation.x = Math.PI / 2; cap.position.set(0, 1.3, 0.02); cap.scale.set(1.05, 1, 0.85); g.add(cap);
  pon(g, caja(K, 0.46, 0.02, 0.04, AMB.blanco, { sinTinta: true }), 0, 1.25, 0.2);
  // la cola hasta el balcón, con la rueda de girar
  const co = K.malla(K.cilindro(0.012, 0.012, 1.0, 4), AMB.maderaD, { sinTinta: true }); co.position.set(0, 0.9, -0.42); co.rotation.x = -0.55; g.add(co);
  const ru = K.malla(K.toro(0.08, 0.008, Math.PI * 2, 0.4), AMB.maderaD, { sinTinta: true }); ru.position.set(0, 0.56, -0.62); g.add(ru);
  // las aspas
  const eje = new THREE.Group(); eje.position.set(0, 1.32, 0.3); eje.rotation.x = -0.12; g.add(eje); g.userData.aspas = eje; if (aspasVivas) g.userData.vivo = true;
  pon(eje, K.malla(K.cilindro(0.04, 0.04, 0.08, 8), AMB.maderaD, { grosor: 0.002 }), 0, 0, 0).rotation.x = Math.PI / 2;
  const reja = lienzo(K, 'amb-reja', 32, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#7a5a3a'; for (let y = 0; y < h; y += 10) c.fillRect(0, y, w, 2); c.fillRect(0, 0, 2, h); c.fillRect(w - 2, 0, 2, h); });
  for (let k = 0; k < 4; k++) {
    const a = new THREE.Group(); a.rotation.z = k * Math.PI / 2 + 0.35; eje.add(a);
    a.add(pon(new THREE.Group(), caja(K, 0.025, 0.86, 0.025, '#6a4a30', { grosor: 0.0015 }), 0, 0.43, 0.04));
    const rj = new THREE.Mesh(propia(new THREE.PlaneGeometry(0.15, 0.7)), new THREE.MeshBasicMaterial({ map: reja.map, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); rj.position.set(0.09, 0.5, 0.045); a.add(rj);
    const lona = caja(K, 0.13, k % 2 ? 0.42 : 0.62, 0.006, AMB.velas, { grosor: 0.0012 }); lona.position.set(0.09, k % 2 ? 0.62 : 0.52, 0.05); a.add(lona);
  }
  g.userData.alto = 1.32 + 0.86;
  return g;
}
export function molinoBastion(K, { foso = true } = {}) {
  const g = new THREE.Group(), b = baluarte(K, { esc: 1.0, foso }); g.add(b);
  const m = molinoGrande(K); m.position.set(0, b.userData.cima, -0.05); m.rotation.y = 0.5; g.add(m);
  [[0.6, -0.4], [-0.62, -0.35], [0.5, 0.2]].forEach(([x, z], i) => { const t = iep(K, 0.6 + i * 0.08, 30 + i); t.position.set(x, b.userData.cima, z); g.add(t); });
  g.userData.alto = b.userData.cima + m.userData.alto;
  return g;
}
/* la Montelbaanstoren: el fuste octogonal de ladrillo de 1516 con su cornisa, y el remate blanco de madera de 1606 (el cuerpo
   del reloj, dos linternas abiertas de columnas y la aguja con su veleta); al pie, el muelle del Oudeschans con su barca */
export function montelbaanstoren(K) {
  const g = new THREE.Group(), mL = matLadrillo(K, AMB.rojoD);
  pon(g, caja(K, 2.0, 0.06, 1.2, AMB.muelle, { grosor: 0.004 }), 0, -0.03, 0.2);
  const ag = new THREE.Mesh(propia(new THREE.PlaneGeometry(2.0, 0.7)), K.mat(AMB.agua)); ag.rotation.x = -Math.PI / 2; ag.position.set(0, -0.08, 1.15); g.add(ag);
  pon(g, caja(K, 2.0, 0.1, 0.04, AMB.muro, { grosor: 0.003 }), 0, -0.07, 0.8);
  const fu = new THREE.Mesh(propia(new THREE.CylinderGeometry(0.36, 0.38, 1.05, 8, 1, true)), mL); fu.position.y = 0.525; fu.rotation.y = Math.PI / 8; g.add(fu);
  const fu2 = K.malla(K.cilindro(0.355, 0.375, 1.05, 8), AMB.rojoD, { grosor: 0.006 }); fu2.position.y = 0.525; fu2.rotation.y = Math.PI / 8; g.add(fu2);
  const uv = fu.geometry.getAttribute('uv'); for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 14, uv.getY(i) * 6.5);
  for (const y of [0.35, 0.72]) { const v = caja(K, 0.07, 0.12, 0.014, '#3a3430', { sinTinta: true }); v.position.set(0, y, 0.37); g.add(v); }
  pon(g, caja(K, 0.16, 0.24, 0.016, '#3a3430', { sinTinta: true }), 0.0, 0.12, 0.372);
  pon(g, K.malla(K.cilindro(0.42, 0.4, 0.08, 8), AMB.arenL, { grosor: 0.004 }), 0, 1.09, 0).rotation.y = Math.PI / 8;
  // el remate de madera blanca
  const bl = '#f4efe2', blD = '#dcd5c4';
  pon(g, caja(K, 0.44, 0.34, 0.44, bl, { grosor: 0.004 }), 0, 1.3, 0);
  [0, Math.PI / 2, Math.PI, -Math.PI / 2].forEach(r => { const q = new THREE.Group(); q.rotation.y = r; g.add(q); const c = lam(matReloj(K), 0.2, 0.2); c.position.set(0, 1.3, 0.222); q.add(c); });
  pon(g, caja(K, 0.5, 0.04, 0.5, blD, { grosor: 0.003 }), 0, 1.49, 0);
  const lin = (r, h, y) => {
    for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; pon(g, K.malla(K.cilindro(0.016, 0.018, h, 5), bl, { grosor: 0.0015 }), Math.cos(a) * r, y + h / 2, Math.sin(a) * r); }
    pon(g, K.malla(K.cilindro(r * 0.6, r * 0.6, h * 0.9, 8), '#5a5a5e', { sinTinta: true }), 0, y + h / 2, 0);
    pon(g, K.malla(K.cilindro(r * 1.12, r * 1.08, 0.05, 8), blD, { grosor: 0.003 }), 0, y + h + 0.025, 0).rotation.y = Math.PI / 8;
    return y + h + 0.05;
  };
  let y = lin(0.2, 0.34, 1.51); y = lin(0.15, 0.28, y);
  pon(g, K.malla(K.esfera(0.12, 0.5), bl, { grosor: 0.003 }), 0, y + 0.06, 0).scale.y = 1.2;
  pon(g, K.malla(K.cilindro(0.05, 0.06, 0.12, 8), bl, { grosor: 0.002 }), 0, y + 0.22, 0);
  pon(g, K.malla(K.cono(0.05, 0.36, 8), blD, { grosor: 0.002 }), 0, y + 0.46, 0);
  pon(g, K.malla(K.esfera(0.025, 0.4), AMB.oro, { sinTinta: true }), 0, y + 0.66, 0);
  pon(g, caja(K, 0.07, 0.05, 0.006, AMB.oro, { sinTinta: true }), 0.02, y + 0.74, 0);
  const ba = barca(K, { carga: 'libros', persona: false }); ba.scale.setScalar(1.3); ba.position.set(0.55, -0.07, 1.12); g.add(ba);
  g.userData.alto = y + 0.78;
  return g;
}

/* ============================================================
   LAS CASAS DE LOS CANALES, a la escala del replanteo: angostas y altas (de 6 a 9 m de frente: 0,34-0,52), de tres a cinco
   pisos, con el frontón a la calle y el techo empinado detrás. Ventanas de cruz con marco blanco y vidrios emplomados,
   postigos rojos o verdes en los pisos de abajo, la viga del aparejo con su gancho arriba (los muebles y la mercadería
   suben por fuera), la puerta con su montante y la escalinata (stoep) sobre el sótano, la piedra con el dibujo de la casa.
   Estilos: 'trap' el escalonado (De Keyser: franjas y dinteles de arenisca, pináculos); 'trapGrande' la casa ancha de
   esquina a lo Bartolotti; 'hals' el de cuello (Vingboons, desde 1640: hombros con sus volutas de piedra y el frontoncito
   arriba); 'klok' el de campana; 'lijst' la fachada de piedra con cornisa; 'dubbel' la casa doble clasicista con pilastras y
   frontón (la curva de oro del Herengracht); 'tuit' el almacén de frontón en pico con las puertas de carga.
   El frente mira a +z; el origen, al pie del centro.
   ============================================================ */
const PISO = 0.16, ZOC = 0.075;
function ventanaCruz(K, g, x, y, z, vw, vh, post = null) {
  pon(g, caja(K, vw + 0.014, vh + 0.014, 0.01, AMB.blanco, { sinTinta: true }), x, y, z + 0.005);
  pon(g, caja(K, vw - 0.004, vh - 0.004, 0.01, AMB.vidrio, { sinTinta: true }), x, y, z + 0.007);
  pon(g, caja(K, vw * 0.4, vh * 0.32, 0.011, AMB.vidrioL, { sinTinta: true }), x - vw * 0.22, y + vh * 0.22, z + 0.0075);   // el cielo en el vidrio
  pon(g, caja(K, 0.007, vh - 0.004, 0.012, AMB.blanco, { sinTinta: true }), x, y, z + 0.009);
  pon(g, caja(K, vw - 0.004, 0.007, 0.012, AMB.blanco, { sinTinta: true }), x, y + vh * 0.12, z + 0.009);
  if (post) [-1, 1].forEach(l => pon(g, caja(K, vw * 0.48, vh * 0.5, 0.008, post, { sinTinta: true }), x + l * (vw * 0.76), y - vh * 0.24, z + 0.004));
}
function puertaCasa(K, g, x, z, { lado = 1, ancha = false, color = AMB.puerta } = {}) {
  const dw = ancha ? 0.11 : 0.085, dh = 0.16, y0 = ZOC;
  pon(g, caja(K, dw + 0.02, dh + 0.016, 0.01, AMB.arenL, { sinTinta: true }), x, y0 + dh / 2, z + 0.005);
  pon(g, caja(K, dw, dh * 0.7, 0.012, color, { sinTinta: true }), x, y0 + dh * 0.35, z + 0.007);
  pon(g, caja(K, dw, dh * 0.22, 0.012, AMB.vidrio, { sinTinta: true }), x, y0 + dh * 0.84, z + 0.007);
  // la escalinata sobre el sótano, de lado, con su baranda de hierro
  pon(g, caja(K, dw + 0.06, ZOC, 0.11, AMB.arenD, { grosor: 0.002 }), x, ZOC / 2, z + 0.055);
  for (let k = 0; k < 2; k++) pon(g, caja(K, 0.055, ZOC * (2 - k) / 3, 0.1, AMB.arenD, { grosor: 0.0015 }), x + lado * (dw / 2 + 0.06 + k * 0.05), ZOC * (2 - k) / 6, z + 0.055);
  pon(g, caja(K, 0.006, 0.07, 0.006, '#26221e', { sinTinta: true }), x - lado * (dw / 2 + 0.025), ZOC + 0.035, z + 0.105);
  pon(g, caja(K, dw + 0.05, 0.005, 0.005, '#26221e', { sinTinta: true }), x, ZOC + 0.07, z + 0.105);
  pon(g, caja(K, 0.05, 0.045, 0.01, '#3a3430', { sinTinta: true }), x - lado * (dw / 2 + 0.06), 0.025, z + 0.005);   // la puertita del sótano
}
/* el frontón: la silueta que sube sobre la cornisa (forma en el plano XY, de -w/2 a w/2 y de 0 al alto gh) */
function siluetaFronton(estilo, w, gh) {
  const s = new THREE.Shape(), m = w / 2;
  s.moveTo(-m, 0);
  if (estilo === 'trap' || estilo === 'trapGrande') {
    const n = w > 0.5 ? 4 : 3, top = Math.max(0.07, w * 0.2), px = (m - top / 2) / n, pa = gh * 0.82 / n;
    let x = -m, y = 0;
    for (let k = 0; k < n; k++) { y += pa; s.lineTo(x, y); x += px; s.lineTo(x, y); }
    s.lineTo(x, gh); s.lineTo(-x, gh);
    for (let k = 0; k < n; k++) { s.lineTo(-x, y); x -= px; s.lineTo(-x, y); y -= pa; }
    s.lineTo(m, 0);
  } else if (estilo === 'hals') {
    const c = m * 0.46;
    s.lineTo(-m, gh * 0.2); s.lineTo(-c - 0.01, gh * 0.24); s.quadraticCurveTo(-c, gh * 0.3, -c, gh * 0.5); s.lineTo(-c, gh * 0.84); s.lineTo(c, gh * 0.84); s.lineTo(c, gh * 0.5); s.quadraticCurveTo(c, gh * 0.3, c + 0.01, gh * 0.24); s.lineTo(m, gh * 0.2); s.lineTo(m, 0);
  } else if (estilo === 'klok') {
    s.lineTo(-m, gh * 0.12); s.bezierCurveTo(-m * 0.55, gh * 0.18, -m * 0.25, gh * 0.4, -m * 0.4, gh * 0.72); s.quadraticCurveTo(-m * 0.3, gh * 0.95, 0, gh);
    s.quadraticCurveTo(m * 0.3, gh * 0.95, m * 0.4, gh * 0.72); s.bezierCurveTo(m * 0.25, gh * 0.4, m * 0.55, gh * 0.18, m, gh * 0.12); s.lineTo(m, 0);
  } else {   // 'tuit': el pico del almacén, con su remate recto
    const c = Math.max(0.05, w * 0.14);
    s.lineTo(-c, gh * 0.86); s.lineTo(-c, gh); s.lineTo(c, gh); s.lineTo(c, gh * 0.86); s.lineTo(m, 0);
  }
  return s;
}
export function casaCanal(K, op = {}) {
  const { estilo = 'trap', w = 0.42, d = 0.9, pisos = 4, ladrillo = AMB.rojo, post = AMB.postVerde, puerta = -1, techo = 'teja', semilla = 1, afuera = null, piedra = null } = op;
  const g = new THREE.Group(), H = ZOC + pisos * PISO, zf = d / 2, mL = matLadrillo(K, ladrillo);
  const almacen = estilo === 'tuit', fachadaPiedra = estilo === 'lijst', clasica = estilo === 'dubbel' || estilo === 'lijst', keyser = estilo === 'trap' || estilo === 'trapGrande';
  const base = fachadaPiedra ? AMB.aren : ladrillo;
  pon(g, caja(K, w, H, d, base, { grosor: 0.004 }), 0, H / 2, 0);
  if (!fachadaPiedra) { const f = lam(mL, w, H, w / ESC, H / ESC); f.position.set(0, H / 2, zf + 0.002); g.add(f); }
  [-1, 1].forEach(l => { const p = lam(mL, d, H, d / ESC, H / ESC); p.position.set(l * (w / 2 + 0.002), H / 2, 0); p.rotation.y = l * Math.PI / 2; g.add(p); });
  pon(g, caja(K, w + 0.006, ZOC, 0.018, AMB.arenD, { sinTinta: true }), 0, ZOC / 2, zf + 0.009);   // el zócalo de piedra
  // las ventanas, piso por piso; abajo, la puerta
  const nv = estilo === 'dubbel' ? 5 : w >= 0.56 ? 4 : w >= 0.4 ? 3 : 2;
  const paso = (w - 0.06) / nv, vw = Math.min(0.088, paso - 0.04), xs = Array.from({ length: nv }, (_, i) => -w / 2 + 0.03 + paso * (i + 0.5));
  const iPuerta = estilo === 'dubbel' ? 2 : puerta < 0 ? 0 : puerta > 0 ? nv - 1 : Math.floor(nv / 2);
  for (let f = 0; f < pisos; f++) {
    const y = ZOC + f * PISO + PISO * 0.52, vh = PISO * (f === pisos - 1 ? 0.52 : 0.64);
    xs.forEach((x, i) => {
      if (f === 0 && i === iPuerta) return;
      if (almacen && i === Math.floor(nv / 2)) {   // la columna de las puertas de carga, con sus postigos de tablas
        pon(g, caja(K, vw + 0.01, PISO * 0.72, 0.012, AMB.maderaD, { sinTinta: true }), x, y, zf + 0.006);
        [-1, 1].forEach(l => pon(g, caja(K, vw * 0.52, PISO * 0.7, 0.01, post, { sinTinta: true }), x + l * vw * 0.78, y, zf + 0.004));
        return;
      }
      ventanaCruz(K, g, x, y, zf, almacen ? vw * 0.6 : vw, almacen ? vh * 0.6 : vh, f <= 1 || almacen ? post : null);
      if (keyser || clasica) pon(g, caja(K, vw + 0.026, 0.018, 0.012, AMB.arenL, { sinTinta: true }), x, y + vh / 2 + 0.018, zf + 0.006);   // el dintel de piedra
    });
    if (keyser && f < pisos) { pon(g, caja(K, w + 0.004, 0.013, 0.012, AMB.arenL, { sinTinta: true }), 0, ZOC + f * PISO + 0.008, zf + 0.006); pon(g, caja(K, w + 0.004, 0.009, 0.01, AMB.arenL, { sinTinta: true }), 0, ZOC + f * PISO + PISO * 0.52, zf + 0.005); }   // las franjas de arenisca
  }
  puertaCasa(K, g, xs[iPuerta], zf, { lado: iPuerta === 0 ? 1 : -1, ancha: clasica, color: hashA(semilla, 4) > 0.5 ? AMB.puerta : AMB.puertaR });
  if (piedra) { pon(g, caja(K, 0.07, 0.055, 0.012, AMB.arenL, { sinTinta: true }), xs[iPuerta], ZOC + PISO * 1.02, zf + 0.006); pon(g, caja(K, 0.05, 0.035, 0.014, piedra, { sinTinta: true }), xs[iPuerta], ZOC + PISO * 1.02, zf + 0.007); }   // la piedra con el dibujo de la casa
  if (estilo === 'dubbel') [-1, -0.36, 0.36, 1].forEach(t => pon(g, caja(K, 0.03, H - ZOC - 0.02, 0.016, AMB.arenL, { grosor: 0.0012 }), t * (w / 2 - 0.03), ZOC + (H - ZOC) / 2, zf + 0.008));   // las pilastras gigantes
  // arriba: el frontón y el techo; o la cornisa con el techo paralelo a la calle
  const mT = techo === 'pizarra' ? matPizarra(K) : matTejaR(K);
  if (clasica) {
    pon(g, caja(K, w + 0.04, 0.04, 0.05, AMB.arenL, { grosor: 0.003 }), 0, H + 0.02, zf - 0.005);
    pon(g, tejado4(K, w - 0.02, d - 0.04, 0.34, mT, 0.004), 0, H, -0.01);
    if (estilo === 'dubbel') {
      const t = new THREE.Shape(), fw = w * 0.42; t.moveTo(-fw / 2, 0); t.lineTo(fw / 2, 0); t.lineTo(0, 0.12); t.closePath();
      pon(g, K.malla(propia(new THREE.ExtrudeGeometry(t, { depth: 0.04, bevelEnabled: false })), AMB.arenL, { grosor: 0.003 }), 0, H + 0.04, zf - 0.03);
      pon(g, caja(K, 0.06, 0.04, 0.012, AMB.arenS, { sinTinta: true }), 0, H + 0.085, zf + 0.012);
    } else for (let k = 0; k < 6; k++) pon(g, K.malla(K.cilindro(0.008, 0.01, 0.05, 5), AMB.arenL, { sinTinta: true }), -w / 2 + 0.03 + k * (w - 0.06) / 5, H + 0.065, zf - 0.005);   // la balaustrada
    [-1, 1].forEach(l => { const bu = caja(K, 0.08, 0.09, 0.08, AMB.blanco, { grosor: 0.0015 }); bu.position.set(l * w * 0.25, H + 0.1, zf - 0.2); g.add(bu); pon(g, caja(K, 0.05, 0.05, 0.01, AMB.vidrio, { sinTinta: true }), l * w * 0.25, H + 0.1, zf - 0.155); });   // las buhardillas
    pon(g, caja(K, 0.06, 0.18, 0.08, ladrillo, { grosor: 0.002 }), w * 0.3, H + 0.3, -d * 0.25);   // la chimenea
  } else {
    const gh = keyser ? 0.3 + w * 0.32 : estilo === 'hals' ? w * 1.05 : estilo === 'klok' ? w * 0.95 : w * 0.85;
    const fg = propia(new THREE.ExtrudeGeometry(siluetaFronton(estilo, w, gh), { depth: 0.035, bevelEnabled: false }));
    pon(g, K.malla(fg, ladrillo, { grosor: 0.003 }), 0, H, zf - 0.035);
    const ff = lam(mL, w, gh, w / ESC, gh / ESC); ff.position.set(0, H + gh / 2, zf + 0.0005); ff.visible = false;   // (el ladrillo del frontón lo pone su color)
    // el techo empinado detrás, de tejas o pizarra
    const rh = Math.min(gh * 0.86, w * 0.9), ang = Math.atan2(rh, w / 2), lar = Math.hypot(w / 2, rh) + 0.03;
    [-1, 1].forEach(l => { const a = losaTex(K, mT, lar, 0.022, d - 0.05, { grosor: 0.003 }); a.rotation.z = -l * ang; a.position.set(l * (w / 4 + 0.006), H + rh / 2 + 0.008, -0.025); g.add(a); });
    const tb = new THREE.Shape(); tb.moveTo(-w / 2, 0); tb.lineTo(w / 2, 0); tb.lineTo(0, rh); tb.closePath();
    pon(g, K.malla(propia(new THREE.ExtrudeGeometry(tb, { depth: 0.03, bevelEnabled: false })), ladrillo, { grosor: 0.003 }), 0, H, -d / 2);   // el hastial de atrás
    pon(g, caja(K, 0.05, 0.16, 0.07, ladrillo, { grosor: 0.002 }), w * 0.22, H + rh * 0.62, -d * 0.18);   // la chimenea
    // las piedras del frontón según el estilo
    if (keyser) {
      const n = w > 0.5 ? 4 : 3, top = Math.max(0.07, w * 0.2), px = (w / 2 - top / 2) / n, pa = gh * 0.82 / n;
      for (let k = 0; k < n; k++) [-1, 1].forEach(l => {
        const x = l * (w / 2 - px * k - px / 2), y = H + pa * (k + 1);
        pon(g, caja(K, px + 0.012, 0.014, 0.05, AMB.arenL, { grosor: 0.0012 }), x, y + 0.007, zf - 0.018);
        if (k % 2 === 0) pon(g, K.malla(K.cono(0.012, 0.06, 4), AMB.arenL, { sinTinta: true }), l * (w / 2 - px * k - 0.012), y + 0.04, zf - 0.018);   // los pináculos
      });
      pon(g, caja(K, top + 0.02, 0.016, 0.05, AMB.arenL, { grosor: 0.0012 }), 0, H + gh + 0.008, zf - 0.018);
      pon(g, K.malla(K.esfera(0.018, 0.4), AMB.arenL, { sinTinta: true }), 0, H + gh + 0.03, zf - 0.018);
      ventanaCruz(K, g, 0, H + gh * 0.42, zf - 0.002, Math.min(0.08, w * 0.2), 0.09, post);
      pon(g, caja(K, w + 0.004, 0.013, 0.012, AMB.arenL, { sinTinta: true }), 0, H + 0.006, zf + 0.006);
      if (estilo === 'trapGrande') [-1, 1].forEach(l => pon(g, caja(K, 0.03, H - ZOC, 0.016, AMB.arenL, { sinTinta: true }), l * (w / 2 - 0.015), ZOC + (H - ZOC) / 2, zf + 0.007));   // las esquinas de piedra
    } else if (estilo === 'hals') {
      const c = w / 2 * 0.46;
      [-1, 1].forEach(l => {   // las volutas (klauwstukken) en los hombros y el jarrón de la esquina
        const v = new THREE.Shape(); v.moveTo(0, 0); v.lineTo(w / 2 - c, 0); v.quadraticCurveTo(0.02, gh * 0.06, 0, gh * 0.3); v.closePath();
        const vm = K.malla(propia(new THREE.ExtrudeGeometry(v, { depth: 0.045, bevelEnabled: false })), AMB.arenL, { grosor: 0.0015 }); vm.scale.x = -l; vm.position.set(l * c, H + gh * 0.2, zf - 0.04); g.add(vm);
        pon(g, K.malla(K.cilindro(0.012, 0.016, 0.045, 6), AMB.arenL, { sinTinta: true }), l * (w / 2 - 0.02), H + gh * 0.2 + 0.022, zf - 0.02);
      });
      const t = new THREE.Shape(), fw = c * 2 + 0.04; t.moveTo(-fw / 2, 0); t.lineTo(fw / 2, 0); t.quadraticCurveTo(0, gh * 0.34, -fw / 2, 0);
      pon(g, K.malla(propia(new THREE.ExtrudeGeometry(t, { depth: 0.05, bevelEnabled: false })), AMB.arenL, { grosor: 0.0015 }), 0, H + gh * 0.84, zf - 0.04);   // el frontoncito curvo
      pon(g, caja(K, c * 2 + 0.03, 0.014, 0.05, AMB.arenL, { grosor: 0.0012 }), 0, H + gh * 0.84, zf - 0.02);
      pon(g, caja(K, w + 0.016, 0.022, 0.03, AMB.arenL, { grosor: 0.0015 }), 0, H + 0.011, zf);
      ventanaCruz(K, g, 0, H + gh * 0.52, zf - 0.002, Math.min(0.075, c * 1.4), 0.1, null);
    } else if (estilo === 'klok') {
      pon(g, caja(K, w * 0.36, 0.02, 0.05, AMB.arenL, { grosor: 0.0012 }), 0, H + gh + 0.005, zf - 0.02);
      pon(g, caja(K, w + 0.016, 0.022, 0.03, AMB.arenL, { grosor: 0.0015 }), 0, H + 0.011, zf);
      ventanaCruz(K, g, 0, H + gh * 0.5, zf - 0.002, Math.min(0.08, w * 0.22), 0.1, null);
      [-1, 1].forEach(l => pon(g, K.malla(K.esfera(0.03, 0.4), AMB.arenL, { sinTinta: true }), l * w * 0.3, H + gh * 0.28, zf - 0.01));   // los adornos de fruta
    } else {   // el almacén: sin adornos, con una ventanita de carga más
      pon(g, caja(K, 0.06, 0.08, 0.012, AMB.maderaD, { sinTinta: true }), 0, H + gh * 0.45, zf + 0.002);
    }
    // la viga del aparejo con su gancho (en los almacenes, con la cuerda y un fardo subiendo)
    const yv = H + gh * (estilo === 'hals' ? 0.76 : 0.8);
    pon(g, caja(K, 0.025, 0.025, 0.12, AMB.maderaD, { grosor: 0.001 }), 0, yv, zf + 0.04);
    if (almacen) { pon(g, K.malla(K.cilindro(0.003, 0.003, 0.5, 3), '#5a4a3a', { sinTinta: true }), 0, yv - 0.25, zf + 0.09); pon(g, caja(K, 0.08, 0.07, 0.07, '#c9a46a', { grosor: 0.0015 }), 0, yv - 0.48, zf + 0.09); }
    else pon(g, caja(K, 0.008, 0.03, 0.008, '#26221e', { sinTinta: true }), 0, yv - 0.025, zf + 0.095);
  }
  // algo afuera
  const xa = xs[iPuerta === 0 ? nv - 1 : 0], za = zf + 0.12;
  if (afuera === 'barril' || afuera === 'barriles') for (let k = 0; k < (afuera === 'barriles' ? 3 : 1); k++) { pon(g, K.malla(K.cilindro(0.035, 0.035, 0.08, 10), AMB.madera, { grosor: 0.0015 }), xa + k * 0.075, 0.04, za); pon(g, K.malla(K.toro(0.036, 0.005, Math.PI * 2, 0.4), '#3a3430', { sinTinta: true }), xa + k * 0.075, 0.06, za).rotation.x = Math.PI / 2; }
  if (afuera === 'banco') { pon(g, caja(K, 0.18, 0.02, 0.05, AMB.madera, { grosor: 0.0015 }), xa, 0.06, za); [-1, 1].forEach(l => pon(g, caja(K, 0.015, 0.06, 0.04, AMB.maderaD, { sinTinta: true }), xa + l * 0.07, 0.03, za)); }
  if (afuera === 'macetas') for (let k = 0; k < 3; k++) { pon(g, K.malla(K.cilindro(0.018, 0.014, 0.03, 8), '#b8673f', { grosor: 0.001 }), xa - 0.05 + k * 0.05, 0.015, za); pon(g, K.malla(K.esfera(0.022, 0.4), k % 2 ? '#e2363e' : '#f4c63a', { sinTinta: true }), xa - 0.05 + k * 0.05, 0.045, za); }
  if (afuera === 'carretilla') { const c = new THREE.Group(); c.position.set(xa, 0, za + 0.02); c.rotation.y = 0.4; g.add(c); pon(c, caja(K, 0.14, 0.04, 0.08, AMB.maderaL, { grosor: 0.0015 }), 0, 0.06, 0); pon(c, K.malla(K.cilindro(0.03, 0.03, 0.012, 10), AMB.maderaD, { grosor: 0.001 }), 0.08, 0.03, 0).rotation.x = Math.PI / 2; [-1, 1].forEach(l => pon(c, caja(K, 0.1, 0.008, 0.008, AMB.maderaD, { sinTinta: true }), -0.1, 0.07, l * 0.03)); }
  if (afuera === 'farol') { pon(g, K.malla(K.cilindro(0.006, 0.008, 0.36, 4), '#26221e', { sinTinta: true }), xa, 0.18, za + 0.06); pon(g, caja(K, 0.04, 0.05, 0.04, '#3a3632', { grosor: 0.001 }), xa, 0.38, za + 0.06); }
  if (afuera === 'fardos') for (let k = 0; k < 3; k++) pon(g, caja(K, 0.07, 0.06, 0.06, k % 2 ? '#c9a46a' : '#b08a52', { grosor: 0.0015 }), xa + (k % 2) * 0.07, 0.03 + (k === 2 ? 0.06 : 0), za, k * 0.3);
  if (afuera === 'libros') {   // la librería: el letrero con el libro abierto y la mesa con los pliegos en la vereda
    pon(g, K.malla(K.cilindro(0.004, 0.004, 0.12, 3), '#26221e', { sinTinta: true }), xa, ZOC + PISO * 1.25, zf + 0.06).rotation.x = Math.PI / 2;
    pon(g, caja(K, 0.08, 0.06, 0.008, '#f8f4ea', { grosor: 0.001 }), xa, ZOC + PISO * 1.25 - 0.04, zf + 0.11);
    pon(g, caja(K, 0.14, 0.012, 0.08, AMB.madera, { grosor: 0.001 }), xa, 0.09, za); [-1, 1].forEach(l => pon(g, caja(K, 0.01, 0.09, 0.07, AMB.maderaD, { sinTinta: true }), xa + l * 0.06, 0.045, za));
    for (let k = 0; k < 3; k++) pon(g, caja(K, 0.035, 0.012, 0.03, ['#9a2a1e', '#3f5f8a', '#f2ead6'][k], { sinTinta: true }), xa - 0.04 + k * 0.04, 0.102, za);
  }
  g.userData.alto = H; g.userData.w = w;
  return g;
}

/* EL OLMO de los muelles: el tronco y la copa de tres o cuatro bultos, en dos verdes (en el juego, instanciado) */
export function iep(K, h = 0.9, semilla = 1) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.022, 0.034, h * 0.6, 6), AMB.tronco, { grosor: 0.003 }), 0, h * 0.3, 0);
  const B = [[0, 0.74, 0, 0.27], [0.15, 0.62, 0.06, 0.19], [-0.14, 0.64, -0.05, 0.2], [0.03, 0.9, -0.05, 0.17]];
  B.forEach(([x, y, z, r], i) => { const c = K.malla(K.esfera(r * h / 0.9 * (0.9 + hashA(semilla, i) * 0.2), 0.6), [AMB.hoja, AMB.hojaL, AMB.hojaD, AMB.hoja][(i + semilla) % 4], { grosor: 0.005 }); c.position.set(x * h, y * h, z * h); c.scale.y = 0.86; g.add(c); });
  return g;
}

/* LA FILA SOBRE SU CANAL (la tarjeta de las casas): cinco casas distintas a lo largo de x, el muelle de ladrillo con sus
   olmos, el borde de piedra, el agua del canal con una barca y la otra orilla */
export const FILAS = {
  keyser: [
    { estilo: 'trap', w: 0.44, pisos: 4, ladrillo: AMB.rojo, post: AMB.postVerde, puerta: -1, afuera: 'barril', piedra: '#3f6ab8' },
    { estilo: 'trap', w: 0.36, pisos: 3, ladrillo: AMB.rojoL, post: AMB.postRojo, puerta: 1, afuera: 'macetas', techo: 'pizarra' },
    { estilo: 'trapGrande', w: 0.62, pisos: 4, ladrillo: AMB.rojo, post: AMB.postRojo, puerta: 0, afuera: 'banco', piedra: AMB.oro },
    { estilo: 'trap', w: 0.4, pisos: 4, ladrillo: AMB.cafe, post: AMB.postVerde, puerta: -1, afuera: 'libros' },
    { estilo: 'trap', w: 0.34, pisos: 3, ladrillo: AMB.rojoD, post: AMB.postVerde, puerta: 1, afuera: 'farol', techo: 'pizarra' },
  ],
  vingboons: [
    { estilo: 'hals', w: 0.42, pisos: 4, ladrillo: AMB.cafe, post: AMB.postVerde, puerta: -1, afuera: 'macetas' },
    { estilo: 'dubbel', w: 0.86, pisos: 3, ladrillo: AMB.morado, post: AMB.postVerde, techo: 'pizarra', afuera: 'banco' },
    { estilo: 'hals', w: 0.38, pisos: 4, ladrillo: AMB.moradoL, post: AMB.postRojo, puerta: 1, afuera: 'farol', piedra: AMB.postRojo },
    { estilo: 'klok', w: 0.36, pisos: 3, ladrillo: AMB.rojo, post: AMB.postVerde, puerta: -1, afuera: 'barril' },
    { estilo: 'lijst', w: 0.5, pisos: 4, ladrillo: AMB.cafeD, post: AMB.postVerde, puerta: 1, techo: 'pizarra', afuera: 'libros' },
  ],
  pakhuis: [
    { estilo: 'tuit', w: 0.5, pisos: 5, ladrillo: AMB.cafeD, post: AMB.postVerde, afuera: 'fardos' },
    { estilo: 'tuit', w: 0.46, pisos: 5, ladrillo: AMB.rojoD, post: AMB.postRojo, afuera: 'barriles' },
    { estilo: 'trap', w: 0.34, pisos: 3, ladrillo: AMB.rojo, post: AMB.postVerde, puerta: 1, afuera: 'libros', piedra: AMB.oro },
    { estilo: 'tuit', w: 0.52, pisos: 4, ladrillo: AMB.morado, post: AMB.postVerde, afuera: 'carretilla' },
    { estilo: 'hals', w: 0.36, pisos: 3, ladrillo: AMB.cafe, post: AMB.postRojo, puerta: -1, afuera: 'barril' },
  ],
};
export function filaCasas(K, variante = VARIANTES.casas, { d = 0.75, agua = true } = {}) {
  const g = new THREE.Group(), lista = FILAS[variante] || FILAS.keyser;
  const total = lista.reduce((a, c) => a + c.w, 0) + 0.02 * (lista.length - 1);
  let x = -total / 2;
  lista.forEach((c, i) => { const h = casaCanal(K, { ...c, d, semilla: i + 3 }); h.position.set(x + c.w / 2, 0, 0); g.add(h); x += c.w + 0.02; });
  const L = total + 0.6, zq = d / 2;
  pon(g, losaTex(K, matDam(K), L, 0.03, 0.6, { sinTinta: true }), 0, -0.015, zq + 0.3 - 0.02);   // el muelle empedrado
  pon(g, caja(K, L, 0.02, d + 0.9, AMB.pasto, { sinTinta: true, sombra: false }), 0, -0.01, -0.43);   // los jardines de atrás
  if (agua) {
    pon(g, caja(K, L, 0.26, 0.05, AMB.muro, { grosor: 0.004 }), 0, -0.13, zq + 0.6);                 // el borde de ladrillo del canal
    pon(g, caja(K, L, 0.035, 0.07, AMB.arenD, { grosor: 0.002 }), 0, -0.012, zq + 0.6);               // con su piedra de remate
    const ag = new THREE.Mesh(propia(new THREE.PlaneGeometry(L, 0.95)), K.mat(AMB.agua)); ag.rotation.x = -Math.PI / 2; ag.position.set(0, -0.16, zq + 0.6 + 0.5); ag.receiveShadow = true; g.add(ag);
    for (let k = 0; k < 6; k++) { const o = caja(K, 0.22, 0.004, 0.014, AMB.aguaL, { sinTinta: true, sombra: false }); o.position.set(-L / 2 + 0.3 + k * L / 6, -0.155, zq + 0.85 + (k % 3) * 0.18); g.add(o); }
    pon(g, caja(K, L, 0.26, 0.05, AMB.muro, { grosor: 0.004 }), 0, -0.13, zq + 1.6);
    pon(g, caja(K, L, 0.03, 0.3, AMB.muelle, { grosor: 0.002 }), 0, -0.015, zq + 1.77);
    const ba = barca(K, { carga: variante === 'pakhuis' ? 'queso' : 'libros' }); ba.scale.setScalar(1.25); ba.position.set(total * 0.18, -0.15, zq + 1.05); ba.rotation.y = 0.15; g.add(ba);
  }
  [-1, 1].forEach((l, k) => { const t = iep(K, 0.78 + k * 0.1, k + 1); t.position.set(l * (total / 2 + 0.12), 0, zq + 0.42); g.add(t); });   // los olmos del muelle, en las puntas para que se vean las fachadas
  [[-0.35, 0.95], [0.6, 1.0]].forEach(([u, h], k) => { const t = iep(K, h, k + 7); t.position.set(u * total / 2, 0, -d / 2 - 0.3); g.add(t); });   // y los de los jardines de atrás, asomando sobre los techos
  g.userData.total = total;
  return g;
}

/* ============================================================
   LOS BARCOS DEL IJ (las siluetas verticales del fondo): 'retour', el navío de las Indias con su popa alta y plana de oro
   y azul y tres palos; 'fluit', el fluyt de casco de pera, el carguero que hizo rica a la ciudad; 'boeier', el yate chico de
   vela de cangreja con sus orzas a los costados. Proa a +x.
   ============================================================ */
export function navio(K, tipo = 'retour') {
  const g = new THREE.Group(), R = tipo === 'retour', F = tipo === 'fluit', B = tipo === 'boeier';
  const L = R ? 1.7 : F ? 1.25 : 0.62, M = R ? 0.4 : F ? 0.34 : 0.22, h = R ? 0.24 : F ? 0.2 : 0.1, popa = R ? 0.22 : F ? 0.14 : 0.04;
  const s = new THREE.Shape();
  s.moveTo(-L / 2, h + popa); s.lineTo(-L / 2 + 0.02, -0.06); s.quadraticCurveTo(-L / 2 + 0.1, -0.1, -L / 2 + 0.25, -0.1); s.lineTo(L / 2 - 0.3, -0.1);
  s.quadraticCurveTo(L / 2 - 0.05, -0.08, L / 2, h + 0.06); s.lineTo(L / 2 - 0.12, h); s.lineTo(-L / 2 + 0.35, h); s.lineTo(-L / 2 + 0.3, h + popa); s.closePath();
  const geo = propia(new THREE.ExtrudeGeometry(s, { depth: M, bevelEnabled: false })); geo.translate(0, 0, -M / 2);
  const casco = K.malla(geo, AMB.casco, { grosor: 0.004 }); g.add(casco);
  if (F) casco.scale.z = 0.9;
  [-1, 1].forEach(l => { pon(g, caja(K, L - 0.35, 0.03, 0.012, '#d8a24a', { sinTinta: true }), 0.0, h * 0.62, l * (M / 2 + 0.004)); pon(g, caja(K, L - 0.3, 0.05, 0.01, AMB.cascoD, { sinTinta: true }), 0, -0.07, l * (M / 2 + 0.003)); });   // la faja ocre y la obra viva
  if (!B) {
    pon(g, caja(K, 0.025, popa + h * 0.9, M * 0.9, R ? '#3f5f8a' : AMB.casco, { grosor: 0.002 }), -L / 2 - 0.004, (h + popa) / 2 + 0.02, 0);   // el espejo de popa
    if (R) { pon(g, caja(K, 0.03, 0.08, M * 0.5, AMB.oro, { sinTinta: true }), -L / 2 - 0.01, h + popa - 0.03, 0); for (let k = 0; k < 3; k++) pon(g, caja(K, 0.02, 0.04, 0.05, AMB.vidrioL, { sinTinta: true }), -L / 2 - 0.012, h + 0.08, -0.1 + k * 0.1); }
    pon(g, caja(K, 0.32, 0.04, M * 0.94, AMB.madera, { grosor: 0.002 }), -L / 2 + 0.17, h + popa + 0.02, 0);
    const bp = K.malla(K.cilindro(0.008, 0.01, 0.5, 5), AMB.maderaD, { sinTinta: true }); bp.position.set(L / 2 + 0.12, h + 0.14, 0); bp.rotation.z = -1.15; g.add(bp);   // el bauprés
  }
  const palos = R ? [[0.45, 1.45], [0.0, 1.75], [-0.5, 1.15]] : F ? [[0.35, 1.2], [0.0, 1.38], [-0.38, 0.92]] : [[0.08, 0.82]];
  palos.forEach(([x, alto], i) => {
    pon(g, K.malla(K.cilindro(0.01, 0.016, alto, 5), AMB.maderaD, { sinTinta: true }), x, h + alto / 2, 0);
    if (B) {   // la vela de cangreja y el foque
      const v = new THREE.Shape(); v.moveTo(0, 0); v.lineTo(-0.34, 0); v.lineTo(-0.3, 0.5); v.lineTo(0, 0.72); v.closePath();
      const vm = K.malla(propia(new THREE.ShapeGeometry(v)), AMB.ocre, { grosor: 0.0015, side: THREE.DoubleSide }); vm.position.set(x - 0.01, h + 0.06, 0.01); g.add(vm);
      const fq = new THREE.Shape(); fq.moveTo(0, 0); fq.lineTo(0.28, 0); fq.lineTo(0, 0.6); fq.closePath();
      const fm = K.malla(propia(new THREE.ShapeGeometry(fq)), AMB.velas, { grosor: 0.0015, side: THREE.DoubleSide }); fm.position.set(x + 0.02, h + 0.05, 0.012); g.add(fm);
      [-1, 1].forEach(l => { const o = K.malla(K.esfera(0.08, 0.5), AMB.cascoD, { grosor: 0.0015 }); o.scale.set(0.9, 1.5, 0.12); o.position.set(0.0, h * 0.2, l * (M / 2 + 0.01)); g.add(o); });   // las orzas
      return;
    }
    const ancho = (R ? 0.62 : 0.5) * (i === 1 ? 1 : 0.85);
    [[0.42, true], [0.7, true], [0.92, false]].forEach(([u, puesta], k) => {   // las vergas: el trinquete y la gavia con la vela puesta; el juanete aferrado
      if (i === 2 && k === 2) return;
      const a = ancho * (1 - k * 0.22), y = h + alto * u;
      pon(g, K.malla(K.cilindro(0.006, 0.006, a, 4), AMB.maderaD, { sinTinta: true }), x, y, 0).rotation.x = Math.PI / 2;
      if (puesta) { const v = caja(K, 0.012, alto * (k === 0 ? 0.26 : 0.22), a * 0.92, AMB.velas, { grosor: 0.0015 }); v.position.set(x + 0.02, y - alto * (k === 0 ? 0.13 : 0.11), 0); v.rotation.z = 0.05; g.add(v); }
      else pon(g, K.malla(K.cilindro(0.014, 0.014, a * 0.9, 5), AMB.velas, { sinTinta: true }), x, y - 0.012, 0).rotation.x = Math.PI / 2;
    });
    const pe = caja(K, 0.004, 0.025, 0.18, i === 1 ? AMB.postRojo : '#f6f2ea', { sinTinta: true }); pe.position.set(x - 0.01, h + alto + 0.01, -0.09); g.add(pe);   // el gallardete
  });
  if (!B) {   // la bandera del Príncipe en la popa: naranja, blanco y azul
    const xb = -L / 2 + 0.04, yb = h + popa;
    pon(g, K.malla(K.cilindro(0.005, 0.005, 0.36, 4), AMB.maderaD, { sinTinta: true }), xb, yb + 0.18, 0);
    ['#e8862e', '#f6f2ea', '#2f5f9a'].forEach((c, k) => pon(g, caja(K, 0.004, 0.045, 0.2, c, { sinTinta: true }), xb - 0.004, yb + 0.33 - k * 0.045, -0.1));
  }
  g.userData.alto = h + palos.reduce((m, p) => Math.max(m, p[1]), 0);
  return g;
}
