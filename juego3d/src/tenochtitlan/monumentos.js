/* ============================================================
   tenochtitlan/monumentos
   Las piezas grandes de Tenochtitlan (Época 7, docs/era7-plan.md), en el idioma de bloques del proyecto con el color de la
   época: el estuco blanco que brillaba al sol, las bandas pintadas de rojo y azul, la piedra rojiza del tezontle.
   - el Templo Mayor: la pirámide de cuatro cuerpos con la doble escalinata y los dos santuarios en lo alto (Tláloc, azul y
     blanco; Huitzilopochtli, rojo), las serpientes al pie de las alfardas;
   - el coatepantli, el muro de serpientes del recinto; el templo redondo de Ehécatl y el juego de pelota;
   - las casas (calli) de estuco con azotea, el temazcal, la canoa (acalli), el embarcadero, el acueducto de Chapultepec,
     los volcanes del fondo y el águila sobre el nopal, la señal de la fundación.
   Las proporciones son de maqueta (como la Acrópolis o la Ciudad Redonda): legibles desde la cámara del juego.
   ============================================================ */
import * as THREE from 'three';
import { crearPersona } from '../actores.js';
import { pon, caja, propia, textura, matTex } from '../agora/monumentos.js';

export const TE = {
  estuco: '#efe8da', estucoD: '#d9cfbb', estucoL: '#f8f4ea',
  tezontle: '#94503f', tezontleD: '#743a2e', piedra: '#b9a88c', piedraD: '#9a8a70',
  rojo: '#b8352f', rojoD: '#8e2622', azul: '#3f7fb8', azulL: '#7fb2d8', turquesa: '#2f9a8a', ocre: '#d09a3a', negro: '#2a221c',
  oro: '#d4a93e', madera: '#8a5e3a', maderaD: '#5e3e24', paja: '#c9a95e', pajaD: '#a8884a',
  verde: '#5f8a3a', verdeD: '#3f6a2a', nopal: '#5a8a4a', agua: '#5f9aa0', nieve: '#f4f6f8', roca: '#7a7468', rocaD: '#5e5a52'
};

/* ---------- las texturas ---------- */
/* la greca escalonada (xicalcoliuhqui): el adorno de las bandas, en rojo, blanco y negro */
const greca = () => textura('te-greca', 128, 32, (g, w, h) => {
  g.fillStyle = TE.rojo; g.fillRect(0, 0, w, h);
  g.fillStyle = TE.estucoL;
  for (let k = 0; k < 4; k++) {
    const x = k * 32;
    g.beginPath(); g.moveTo(x + 2, h - 4); g.lineTo(x + 2, 8); g.lineTo(x + 22, 8); g.lineTo(x + 22, 18); g.lineTo(x + 12, 18); g.lineTo(x + 12, 14); g.lineTo(x + 18, 14); g.lineTo(x + 18, 12); g.lineTo(x + 6, 12); g.lineTo(x + 6, h - 4); g.closePath(); g.fill();
  }
  g.fillStyle = TE.negro; g.fillRect(0, 0, w, 3); g.fillRect(0, h - 3, w, 3);
}, { repetir: true });
/* las rayas del santuario de Tláloc: azul y blanco, en franjas verticales */
const rayasTlaloc = () => textura('te-tlaloc', 64, 64, (g, w, h) => {
  for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? TE.estucoL : TE.azul; g.fillRect(k * 8, 0, 8, h); }
  g.fillStyle = TE.negro; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(8 + k * 16, 14, 4.5, 0, 7); g.fill(); }   // los ojos anteojeros de Tláloc, en fila
}, { repetir: true });
/* los cráneos estilizados del santuario de Huitzilopochtli: aquí, círculos blancos sobre rojo (como el friso de estuco) */
const frisoHuitzil = () => textura('te-huitzil', 64, 32, (g, w, h) => {
  g.fillStyle = TE.rojo; g.fillRect(0, 0, w, h);
  g.fillStyle = TE.estucoL; for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(8 + k * 16, 16, 5.5, 0, 7); g.fill(); }
  g.fillStyle = TE.negro; for (let k = 0; k < 4; k++) { g.fillRect(5 + k * 16, 14, 2, 2); g.fillRect(9 + k * 16, 14, 2, 2); }
}, { repetir: true });
/* las serpientes del coatepantli: cabezas de perfil en relieve pintado */
const serpientes = () => textura('te-serpientes', 128, 32, (g, w, h) => {
  g.fillStyle = TE.estucoD; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 4; k++) {
    const x = k * 32 + 4;
    g.fillStyle = TE.turquesa; g.beginPath(); g.ellipse(x + 12, 17, 12, 8, 0, 0, 7); g.fill();
    g.fillStyle = TE.rojo; g.fillRect(x + 20, 18, 6, 3);                       // la lengua
    g.fillStyle = TE.negro; g.beginPath(); g.arc(x + 15, 13, 2, 0, 7); g.fill();
    g.fillStyle = TE.ocre; for (let q = 0; q < 3; q++) g.fillRect(x + 2 + q * 5, 20, 3, 3);   // las escamas
  }
}, { repetir: true });
const matRep = (K, clave, t, rx, ry) => matTex(K, clave + rx + 'x' + ry, (() => { const c = t.clone(); c.needsUpdate = true; c.repeat.set(rx, ry); c.wrapS = c.wrapT = THREE.RepeatWrapping; return c; })());
/* una banda pintada (la greca) alrededor de una caja de w × d, a la altura y, de alto h */
function banda(K, g, w, d, y, h, tex = greca, clave = 'gr') {
  const m = matRep(K, 'te-banda-' + clave, tex(), Math.max(1, Math.round(w / 0.25)), 1), m2 = matRep(K, 'te-banda-' + clave, tex(), Math.max(1, Math.round(d / 0.25)), 1);
  [[0, d / 2 + 0.003, 0, w, m], [w / 2 + 0.003, 0, Math.PI / 2, d, m2], [0, -d / 2 - 0.003, Math.PI, w, m], [-w / 2 - 0.003, 0, -Math.PI / 2, d, m2]].forEach(([x, z, ry, l, mm]) => {
    const p = new THREE.Mesh(propia(new THREE.PlaneGeometry(l, h)), mm); p.position.set(x, y, z); p.rotation.y = ry; g.add(p);
  });
}

/* ---------- EL TEMPLO MAYOR ---------- */
/* cuatro cuerpos en talud, la doble escalinata con sus alfardas y, arriba, los dos santuarios con su crestería. Mira a +z
   (en la ciudad real miraba al poniente: aquí manda la cámara). */
export function temploMayor(K) {
  const g = new THREE.Group(), N = 4, B = 1.5, H = 0.22;
  for (let k = 0; k < N; k++) {                         // los cuerpos, cada uno más chico, en talud (el borde de arriba, más angosto)
    const w0 = B - k * 0.25, w1 = w0 - 0.07, y0 = k * H;
    const geo = new THREE.CylinderGeometry(w1 / Math.SQRT2, w0 / Math.SQRT2, H, 4, 1); geo.rotateY(Math.PI / 4); propia(geo);
    const m = K.malla(geo, k % 2 ? TE.estucoD : TE.estuco, { grosor: 0.006 }); m.position.y = y0 + H / 2; g.add(m);
    pon(g, caja(K, w1 + 0.02, 0.025, w1 + 0.02, TE.tezontle, { grosor: 0.003 }), 0, y0 + H, 0);   // el filo de cada cuerpo, de tezontle
  }
  const top = N * H, wT = B - N * 0.25 + 0.2;
  pon(g, caja(K, wT, 0.04, wT, TE.estuco, { grosor: 0.004 }), 0, top + 0.02, 0);
  /* la doble escalinata en la cara de adelante: dos rampas con escalones y tres alfardas */
  const largo = Math.hypot(B / 2 - wT / 2 + 0.1, top), ang = Math.atan2(top, B / 2 - wT / 2 + 0.1);
  [-0.22, 0.22].forEach(x => {
    const esc = new THREE.Group(); esc.position.set(x, top / 2, B / 2 - (B / 2 - wT / 2) / 2 + 0.06); esc.rotation.x = ang; g.add(esc);   // la rampa sube hacia adentro (-z)
    esc.add(ubicar(caja(K, 0.36, 0.05, largo, TE.estucoL, { grosor: 0.003 }), 0, 0, 0));
    for (let k = 0; k < 9; k++) esc.add(ubicar(caja(K, 0.34, 0.012, 0.03, TE.estucoD, { sinTinta: true }), 0, 0.03, -largo / 2 + 0.05 + k * (largo - 0.1) / 8));
  });
  [-0.42, 0, 0.42].forEach(x => {                       // las alfardas (los pasamanos), con la cabeza de serpiente al pie
    const al = new THREE.Group(); al.position.set(x, top / 2 + 0.02, B / 2 - (B / 2 - wT / 2) / 2 + 0.06); al.rotation.x = ang; g.add(al);
    al.add(ubicar(caja(K, 0.07, 0.08, largo, x === 0 ? TE.rojo : TE.estuco, { grosor: 0.003 }), 0, 0.02, 0));
    const cab = K.malla(K.esfera(0.075, 0.6), x === 0 ? TE.turquesa : TE.verde, { grosor: 0.003 }); cab.scale.set(0.9, 0.7, 1.3); cab.position.set(x, 0.06, B / 2 + 0.08); g.add(cab);
    pon(g, K.malla(K.cono(0.02, 0.06, 4), TE.rojo, { sinTinta: true }), x, 0.04, B / 2 + 0.19).rotation.x = Math.PI / 2;
  });
  /* los dos santuarios: Tláloc (azul y blanco, a la izquierda) y Huitzilopochtli (rojo, a la derecha) */
  [[-1, 'tlaloc'], [1, 'huitzil']].forEach(([l, quien]) => {
    const s = new THREE.Group(); s.position.set(l * 0.27, top + 0.04, -0.04); g.add(s);
    const cuerpo = K.malla(K.caja(0.4, 0.3, 0.42), '#ffffff', { grosor: 0.004 }); cuerpo.position.y = 0.15; s.add(cuerpo);
    cuerpo.material = quien === 'tlaloc' ? matRep(K, 'te-tlaloc-m', rayasTlaloc(), 2, 1) : K.mat(TE.rojo);
    const boca = K.malla(K.caja(0.16, 0.2, 0.01), TE.negro, { sinTinta: true }); boca.position.set(0, 0.1, 0.215); s.add(boca);
    if (quien === 'huitzil') { const fr = new THREE.Mesh(propia(new THREE.PlaneGeometry(0.4, 0.08)), matRep(K, 'te-huitzil-m', frisoHuitzil(), 4, 1)); fr.position.set(0, 0.26, 0.212); s.add(fr); }
    /* la crestería: el techo alto, con su remate */
    const techo = K.malla(K.caja(0.42, 0.24, 0.42), quien === 'tlaloc' ? TE.azulL : TE.estuco, { grosor: 0.004 }); techo.position.y = 0.42; techo.scale.set(1, 1, 1); s.add(techo);
    const rem = K.malla(propia(new THREE.CylinderGeometry(0.0, 0.22, 0.2, 4, 1).rotateY(Math.PI / 4)), quien === 'tlaloc' ? TE.azul : TE.rojoD, { grosor: 0.003 }); rem.position.y = 0.64; s.add(rem);
    for (let k = 0; k < 5; k++) pon(s, K.malla(K.caja(0.04, 0.06, 0.02), TE.estucoL, { sinTinta: true }), -0.16 + k * 0.08, 0.57, 0.215);   // las almenas de la crestería
    pon(s, K.malla(K.cilindro(0.03, 0.04, 0.12, 6), '#3a2a20', { sinTinta: true }), 0, 0.06, 0.32);   // el brasero de la puerta
  });
  g.userData.alto = top + 0.75;
  g.userData.ficha = { titulo: 'El Templo Mayor', texto: 'Tláloc y Huitzilopochtli en lo alto: el centro del mundo mexica' };
  return g;
}
const ubicar = (m, x, y, z) => { m.position.set(x, y, z); return m; };

/* ---------- EL COATEPANTLI, el muro de serpientes del recinto ---------- */
export function coatepantli(K, w, d, { puertas = [] } = {}) {
  const g = new THREE.Group(), H = 0.2, G = 0.08;
  const lados = [[0, -d / 2, w, 0], [w / 2, 0, d, Math.PI / 2], [0, d / 2, w, Math.PI], [-w / 2, 0, d, -Math.PI / 2]];
  lados.forEach(([x, z, l, ry], k) => {
    const hueco = puertas.includes(k), tramos = hueco ? [[-l / 4 - 0.1, l / 2 - 0.2], [l / 4 + 0.1, l / 2 - 0.2]] : [[0, l]];
    for (const [c, ll] of tramos) {
      const seg = new THREE.Group(); seg.position.set(x + Math.cos(ry) * c, 0, z - Math.sin(ry) * c); seg.rotation.y = ry; g.add(seg);
      seg.add(ubicar(caja(K, ll, H, G, TE.estucoD, { grosor: 0.004 }), 0, H / 2, 0));
      const tex = new THREE.Mesh(propia(new THREE.PlaneGeometry(ll, H * 0.7)), matRep(K, 'te-serp', serpientes(), Math.max(1, Math.round(ll / 0.3)), 1)); tex.position.set(0, H / 2, G / 2 + 0.003); tex.rotation.y = 0; seg.add(tex);
      const tex2 = tex.clone(); tex2.position.z = -G / 2 - 0.003; tex2.rotation.y = Math.PI; seg.add(tex2);
      for (let q = 0; q < Math.floor(ll / 0.14); q++) seg.add(ubicar(caja(K, 0.06, 0.05, G + 0.02, TE.estuco, { grosor: 0.002 }), -ll / 2 + 0.07 + q * 0.14, H + 0.025, 0));   // las almenas de caracol
    }
  });
  g.userData.ficha = { titulo: 'El coatepantli', texto: 'el muro de serpientes del recinto sagrado' };
  return g;
}

/* ---------- EL TEMPLO REDONDO DE EHÉCATL, el dios del viento ---------- */
export function temploEhecatl(K) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.6, 0.18, 0.6, TE.estucoD, { grosor: 0.004 }), 0, 0.09, 0);
  pon(g, caja(K, 0.18, 0.18, 0.2, TE.estuco, { grosor: 0.003 }), 0, 0.09, 0.38);   // la escalera
  pon(g, K.malla(K.cilindro(0.24, 0.25, 0.3, 16), TE.estuco, { grosor: 0.005 }), 0, 0.33, 0);
  pon(g, K.malla(K.caja(0.1, 0.16, 0.01), TE.negro, { sinTinta: true }), 0, 0.26, 0.245);
  const techo = K.malla(K.cono(0.3, 0.34, 16), TE.paja, { grosor: 0.004 }); techo.position.y = 0.65; g.add(techo);
  pon(g, K.malla(K.toro(0.25, 0.018, Math.PI * 2, 0.6), TE.rojo, { sinTinta: true }), 0, 0.46, 0).rotation.x = Math.PI / 2;
  g.userData.ficha = { titulo: 'El templo de Ehécatl', texto: 'redondo, para que el viento no choque con esquinas' };
  return g;
}

/* ---------- EL JUEGO DE PELOTA (tlachtli): la cancha en forma de I con sus anillos ---------- */
export function juegoPelota(K) {
  const g = new THREE.Group(), L = 0.9, A = 0.26;
  pon(g, caja(K, L, 0.02, A, '#d8c9a6', { sinTinta: true, sombra: false }), 0, 0.01, 0);
  [-1, 1].forEach(l => {
    pon(g, caja(K, L - 0.2, 0.16, 0.12, TE.estuco, { grosor: 0.004 }), 0, 0.08, l * (A / 2 + 0.06));
    pon(g, caja(K, 0.2, 0.08, A + 0.36, TE.estucoD, { grosor: 0.003 }), l * (L / 2 + 0.05), 0.04, 0);
    const an = K.malla(K.toro(0.035, 0.012, Math.PI * 2, 0.6), TE.piedraD, { grosor: 0.002 }); an.position.set(0, 0.13, l * (A / 2 + 0.002)); g.add(an);   // los anillos de piedra
  });
  pon(g, K.malla(K.esfera(0.03, 0.5), '#2a221c', { sinTinta: true }), 0.12, 0.04, 0.02);   // la pelota de hule
  g.userData.ficha = { titulo: 'El juego de pelota', texto: 'la cancha del tlachtli, con sus anillos de piedra' };
  return g;
}

/* ---------- LA CASA (calli): estuco blanco, azotea, puerta y la banda pintada; a veces con huerto o temazcal ---------- */
export function casa(K, w, d, h, { banda: bd = true, color = TE.estuco, temazcal = false } = {}) {
  const g = new THREE.Group();
  pon(g, caja(K, w, h, d, color, { grosor: 0.008 }), 0, h / 2, 0);
  pon(g, caja(K, w + 0.03, 0.03, d + 0.03, TE.estucoD, { grosor: 0.003 }), 0, h + 0.015, 0);
  pon(g, caja(K, 0.12, h * 0.6, 0.02, '#4a3420', { sinTinta: true }), w * 0.15, h * 0.3, d / 2 + 0.006);
  if (bd) pon(g, caja(K, w + 0.004, 0.035, d + 0.004, TE.rojo, { sinTinta: true }), 0, h * 0.82, 0);
  if (temazcal) { const t = K.malla(K.esfera(0.13, 0.6), TE.piedra, { grosor: 0.004 }); t.scale.set(1, 0.7, 1); t.position.set(-w / 2 - 0.12, 0.05, d * 0.2); g.add(t); }
  return g;
}

/* ---------- LA CANOA (acalli): el tronco ahuecado, el remero y la carga ---------- */
export function canoa(K, { remero = true, carga = 'amate', color = TE.madera } = {}) {
  const g = new THREE.Group();
  const casco = K.malla(K.capsula(0.08, 0.5, 0.6), color, { grosor: 0.004 }); casco.rotation.z = Math.PI / 2; casco.scale.set(1, 1, 0.75); casco.position.y = 0.02; g.add(casco);
  pon(g, caja(K, 0.56, 0.01, 0.1, TE.maderaD, { sinTinta: true }), 0, 0.075, 0);
  if (carga === 'amate') for (let k = 0; k < 3; k++) pon(g, caja(K, 0.1, 0.05, 0.08, k % 2 ? '#cfae7c' : '#a9824e', { grosor: 0.002 }), -0.1 + k * 0.11, 0.105, 0);
  else if (carga === 'maiz') for (let k = 0; k < 4; k++) pon(g, K.malla(K.capsula(0.02, 0.06, 0.5), '#e8c45a', { sinTinta: true }), -0.12 + k * 0.07, 0.1, 0.01).rotation.z = Math.PI / 2;
  if (remero) {
    const p = crearPersona(K, { piel: 2, pelo: 'corto', colorPelo: '#1e1610', ropa: 'corta', colorRopa: '#efe6d2' }); p.anim(0, { pose: 'pertiga', instantaneo: true });
    p.obj.scale.setScalar(0.62); p.obj.position.set(0.22, 0.07, 0); p.obj.rotation.y = -Math.PI / 2; g.add(p.obj); g.userData.remero = p;
  }
  g.userData.ficha = { titulo: 'La canoa', texto: 'por el lago y los canales iba todo en canoa' };
  return g;
}

/* ---------- EL EMBARCADERO: el muelle de madera con sus postes ---------- */
export function embarcadero(K, largo = 0.9) {
  const g = new THREE.Group();
  pon(g, caja(K, largo, 0.04, 0.42, TE.madera, { grosor: 0.004 }), largo / 2, 0.05, 0);
  for (let k = 0; k < 4; k++) [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.02, 0.02, 0.3, 5), TE.maderaD, { grosor: 0.002 }), 0.1 + k * (largo - 0.15) / 3, -0.06, l * 0.19));
  for (let k = 0; k < 6; k++) pon(g, caja(K, 0.01, 0.042, 0.42, TE.maderaD, { sinTinta: true }), 0.08 + k * largo / 6, 0.052, 0);
  return g;
}

/* ---------- EL ACUEDUCTO DE CHAPULTEPEC (lo mandó hacer Nezahualcóyotl, 1466): dos caños de mampostería sobre la calzada ---------- */
export function acueducto(K, largo) {
  const g = new THREE.Group();
  pon(g, caja(K, largo, 0.12, 0.12, TE.piedra, { grosor: 0.004 }), 0, 0.06, 0);
  [-1, 1].forEach(l => {
    pon(g, caja(K, largo, 0.04, 0.035, TE.estucoD, { grosor: 0.002 }), 0, 0.14, l * 0.032);
    pon(g, caja(K, largo, 0.005, 0.025, TE.agua, { sinTinta: true }), 0, 0.158, l * 0.032);
  });
  return g;
}

/* ---------- LOS VOLCANES: Popocatépetl, el que humea, e Iztaccíhuatl, la mujer dormida ---------- */
export function popocatepetl(K) {
  const g = new THREE.Group();
  const pc = K.malla(propia(new THREE.CylinderGeometry(0.16, 1.15, 2.1, 9, 1)), TE.roca, { grosor: 0.008 }); pc.position.y = 1.05; g.add(pc);
  const pn = K.malla(propia(new THREE.CylinderGeometry(0.16, 0.5, 0.6, 9, 1)), TE.nieve, { grosor: 0.004 }); pn.position.y = 1.82; g.add(pn);
  const humo = new THREE.Group(); humo.position.y = 2.2; humo.userData.vivo = true; g.add(humo); g.userData.humo = humo;
  [[0, 0, 0.16], [0.1, 0.2, 0.2], [0.24, 0.42, 0.25]].forEach(([x, y, r]) => { const b = K.malla(K.esfera(r, 0.5), '#e8e4dc', { sinTinta: true, transparent: true, opacity: 0.75 }); b.position.set(x, y, 0); humo.add(b); });
  g.userData.ficha = { titulo: 'El Popocatépetl', texto: 'el monte que humea' };
  return g;
}
export function iztaccihuatl(K) {
  const g = new THREE.Group();
  [[-0.55, 1.15, 0.7], [0, 1.4, 0.85], [0.6, 1.25, 0.75]].forEach(([x, h, r]) => {   // la cabeza, el pecho y los pies de la mujer dormida
    const c = K.malla(propia(new THREE.CylinderGeometry(0.22, r, h, 8, 1)), TE.rocaD, { grosor: 0.007 }); c.position.set(x, h / 2, 0); g.add(c);
    const n = K.malla(propia(new THREE.CylinderGeometry(0.22, 0.38, 0.32, 8, 1)), TE.nieve, { grosor: 0.003 }); n.position.set(x, h - 0.16, 0); g.add(n);
  });
  g.userData.ficha = { titulo: 'El Iztaccíhuatl', texto: 'la mujer dormida' };
  return g;
}

/* ---------- EL TIANGUIS DE TLATELOLCO: el gran mercado, con sus puestos en hileras ---------- */
/* Bernal Díaz cuenta que los soldados que habían estado en Constantinopla y en Roma no habían visto una plaza tan grande
   ni tan ordenada: cada mercancía en su calle. */
export function tianguis(K, filas = 2, cols = 3) {
  const g = new THREE.Group(), GENEROS = [['#e8c45a', 'maiz'], ['#b8352f', 'chile'], ['#6a4a2a', 'cacao'], ['#efe6d2', 'manta'], ['#a8683e', 'barro'], ['#5f8a3a', 'verdura']];
  for (let f = 0; f < filas; f++) for (let c = 0; c < cols; c++) {
    const p = new THREE.Group(), [col, que] = GENEROS[(f * cols + c) % GENEROS.length]; p.position.set((c - (cols - 1) / 2) * 0.52, 0, (f - (filas - 1) / 2) * 0.55); g.add(p);
    p.add(ubicar(caja(K, 0.38, 0.012, 0.3, TE.paja, { sinTinta: true, sombra: false }), 0, 0.006, 0));   // el petate del puesto
    [-1, 1].forEach(a => [-1, 1].forEach(b => p.add(ubicar(K.malla(K.cilindro(0.01, 0.01, 0.4, 4), TE.maderaD, { sinTinta: true }), a * 0.18, 0.2, b * 0.14))));
    const toldo = K.malla(K.caja(0.44, 0.012, 0.36), (f + c) % 2 ? TE.estucoL : '#e8d8b8', { grosor: 0.002 }); toldo.position.y = 0.4; toldo.rotation.x = 0.1; p.add(toldo);
    if (que === 'barro') for (let k = 0; k < 3; k++) p.add(ubicar(K.malla(K.esfera(0.05, 0.5), col, { grosor: 0.002 }), -0.1 + k * 0.1, 0.05, 0)); 
    else if (que === 'manta') for (let k = 0; k < 3; k++) p.add(ubicar(caja(K, 0.1, 0.03, 0.14, [TE.estucoL, TE.rojo, TE.azul][k], { grosor: 0.0015 }), -0.1 + k * 0.1, 0.03 + k * 0.03, 0));
    else for (let k = 0; k < 4; k++) p.add(ubicar(K.malla(K.esfera(0.045, 0.4), col, { grosor: 0.002 }), -0.1 + (k % 2) * 0.12, 0.04 + Math.floor(k / 2) * 0.05, (k % 2) * 0.05));   // los montoncitos de maíz, chile, cacao, verdura
  }
  g.userData.ficha = { titulo: 'El tianguis de Tlatelolco', texto: 'el gran mercado: cada mercancía en su calle' };
  return g;
}

/* ---------- EL ÁGUILA SOBRE EL NOPAL: la señal de la fundación (hacia 1325) ---------- */
export function aguilaNopal(K) {
  const g = new THREE.Group();
  pon(g, K.malla(K.roca(0.16, 77), TE.piedra, { grosor: 0.004 }), 0, 0.08, 0).scale.set(1.3, 0.7, 1.1);
  const n = new THREE.Group(); n.position.y = 0.14; g.add(n);
  [[0, 0.1, 0, 0.1], [-0.08, 0.22, 0.02, 0.08], [0.09, 0.24, -0.02, 0.085], [0, 0.34, 0, 0.075]].forEach(([x, y, z, r]) => { const p = K.malla(K.esfera(r, 0.5), TE.nopal, { grosor: 0.003 }); p.scale.set(1, 1.2, 0.35); p.position.set(x, y, z); n.add(p); });
  [[-0.07, 0.3], [0.1, 0.33]].forEach(([x, y]) => pon(n, K.malla(K.esfera(0.02, 0.4), TE.rojo, { sinTinta: true }), x, y, 0.03));   // las tunas
  const a = new THREE.Group(); a.position.set(0, 0.52, 0); n.add(a);
  pon(a, K.malla(K.esfera(0.07, 0.6), '#6a4a2a', { grosor: 0.003 }), 0, 0, 0).scale.set(1, 1.2, 0.9);
  pon(a, K.malla(K.esfera(0.04, 0.5), '#f0e8d8', { grosor: 0.002 }), 0.02, 0.09, 0.02);
  pon(a, K.malla(K.cono(0.015, 0.04, 4), TE.ocre, { sinTinta: true }), 0.06, 0.09, 0.02).rotation.z = -Math.PI / 2;
  [-1, 1].forEach(l => { const ala = K.malla(K.caja(0.16, 0.012, 0.09), '#5a3e22', { grosor: 0.002 }); ala.position.set(l * 0.09, 0.03, 0); ala.rotation.z = l * 0.5; a.add(ala); });
  g.userData.ficha = { titulo: 'El águila sobre el nopal', texto: 'donde se fundó la ciudad, hacia 1325' };
  return g;
}

export { greca, rayasTlaloc, frisoHuitzil, serpientes, banda };

/* ====================================================================================================================
   EL REPLANTEO (2026-10-04, docs/replanteo-visual.md): las piezas a la vara de Atenas y Alejandría, en variantes para la
   hoja juego3d/bocetos/tenochtitlan.html. Lo de arriba sigue igual (el juego de hoy lo usa tal cual); lo de abajo es nuevo
   y entra al juego con la elección del usuario (VARIANTES).
   EN QUÉ SE APOYA:
   - El Templo Mayor de la etapa VII (hacia 1502-1521): unos 100 × 80 m de base y 42-45 m de alto, cerca de 60 m con los
     santuarios (Matos Moctezuma, «Vida y muerte en el Templo Mayor», 1986); cuatro cuerpos en talud, la doble escalinata
     al poniente con las alfardas que arriba cambian de pendiente (los «dados») y abajo terminan en cabezas de serpiente;
     un templete en cada esquina del frente de la plataforma; arriba, Tláloc al norte (azul y blanco, con el chac mool en
     su puerta) y Huitzilopochtli al sur (rojo con su decoración blanca), con sus cresterías; la piedra de Coyolxauhqui al
     pie de la escalinata de Huitzilopochtli. Las maquetas de Ignacio Marquina (Museo Nacional de Antropología, Museo del
     Templo Mayor) y los dibujos de Durán y del Códice Florentino.
   - El templo redondo de Ehécatl, frente al Templo Mayor y mirándolo: un cilindro de unos 14 m sobre su basamento redondo
     con un rectángulo al frente, el techo cónico con almenas y la puerta en fauces de serpiente; hasta 32 m de alto.
   - El calmécac: la casa con el friso de círculos del Códice Mendoza (f. 61r) y el número 19 de la maqueta de Marquina;
     el telpochcalli y el teocalli de cada calpulli (Sahagún, libro III, apéndice; Calnek, 1988).
   - Las casas: Sahagún, libro XI; Michael E. Smith, «At Home with the Aztecs» (2016): adobe sobre un cimiento de piedra,
     techo plano de vigas y tierra o de zacate, los cuartos alrededor de un patio; el metate, el comal sobre las tres piedras
     (tenamaztli), el cuexcomatl (el granero de barro con su sombrero de zacate) y el temazcal.
   Escala: el Templo Mayor mide 4,2 baldosas de frente (unos 20 m por baldosa); una persona, ~0,9 (la gente va a otra escala
   que los edificios, como en todas las épocas). El frente de cada pieza mira a +z; en el tablero, el templo mira al poniente.
   ==================================================================================================================== */
export const VARIANTES = { templo: 'recinto', segunda: 'telpochcalli', casas: 'macehual', tablero: 'isla' };

/* ---------- los ayudantes de la geometría ---------- */
/* el cuerpo en talud: una caja cuya cara de arriba (w1 × d1) es más chica que la de abajo (w0 × d0) */
export function geoTalud(w0, d0, w1, d1, h) {
  const g = new THREE.BoxGeometry(w0, h, d0), p = g.getAttribute('position');
  for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) p.setXYZ(i, p.getX(i) * w1 / w0, p.getY(i), p.getZ(i) * d1 / d0);
  g.computeVertexNormals(); return propia(g);
}
/* un perfil (u = z, v = y) extruido a lo ancho de x, centrado: escalinatas, alfardas */
function geoPerfil(puntos, ancho) {
  const s = new THREE.Shape(); puntos.forEach(([u, v], i) => i ? s.lineTo(u, v) : s.moveTo(u, v)); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: ancho, bevelEnabled: false, curveSegments: 2 });
  g.rotateY(-Math.PI / 2); g.translate(ancho / 2, 0, 0); return propia(g);
}
/* la escalinata: n escalones de (largo, 0), abajo adelante, a (0, alto), arriba atrás */
function perfilEscalera(alto, largo, n) {
  const p = [[largo, 0]], r = alto / n, t = largo / n;
  for (let k = 0; k < n; k++) p.push([largo - k * t, (k + 1) * r], [largo - (k + 1) * t, (k + 1) * r]);
  p.push([0, 0]); return p;
}
/* la alfarda: sobresale de los escalones y arriba se para más y remata en el dado, el rasgo de la arquitectura mexica */
function perfilAlfarda(alto, largo, { sobre = 0.1, dado = 0.2, f = 0.8, atras = 0.1, pie = 0.05 } = {}) {
  const uc = largo * (1 - f), vc = alto * f, ud = uc - largo * (1 - f) * 0.45;
  return [[largo + pie, 0], [largo + pie, sobre], [uc, vc + sobre], [ud, alto + dado], [-atras, alto + dado], [-atras, 0]];
}
/* los tres tonos de un material liso: cada cara se pinta según su normal y su altura */
export function pintarCaras(geo, fn) {
  const gg = geo.index ? geo.toNonIndexed() : geo, p = gg.getAttribute('position'), col = [], a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), k = new THREE.Color();
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
    n.subVectors(c, b).cross(a.clone().sub(b)).normalize();
    k.set(fn(n, (a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3));
    for (let j = 0; j < 3; j++) col.push(k.r, k.g, k.b);
  }
  gg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); gg.computeVertexNormals(); gg.userData.propia = true; return gg;
}
const conColor = (K, geo, o = {}) => K.malla(geo, '#ffffff', { vertexColors: true, ...o });
const tresTonos = (arriba, frente, lado) => n => n.y > 0.5 ? arriba : n.y < -0.5 ? lado : (n.z > 0.4 || n.x > 0.4) ? frente : lado;
const cilindroP = (rt, rb, h, seg) => propia(new THREE.CylinderGeometry(rt, rb, h, seg, 1));

/* ---------- las texturas nuevas ---------- */
/* el muro de Tláloc: franjas verticales azules y blancas */
const texTlalocMuro = () => textura('te7-tlm', 64, 64, (g, w, h) => {
  for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? TE.estucoL : TE.azul; g.fillRect(k * 16, 0, 16, h); }
  g.fillStyle = 'rgba(30,50,80,.25)'; for (let k = 0; k < 4; k += 2) g.fillRect(k * 16 + 13, 0, 3, h);
}, { repetir: true });
/* la crestería de Tláloc, abajo: blanca con barras azules; arriba: azul con los anillos de jade (chalchihuites, el agua) */
const texTlalocCresta = () => textura('te7-tlc1', 64, 64, (g, w, h) => {
  g.fillStyle = TE.estucoL; g.fillRect(0, 0, w, h);
  g.fillStyle = TE.azul; for (let k = 0; k < 3; k++) g.fillRect(6 + k * 21, 10, 9, h - 20);
  g.fillStyle = '#2f5f8f'; g.fillRect(0, 0, w, 5); g.fillRect(0, h - 5, w, 5);
}, { repetir: true });
const texTlalocCresta2 = () => textura('te7-tlc2', 64, 32, (g, w, h) => {
  g.fillStyle = TE.azul; g.fillRect(0, 0, w, h);
  g.strokeStyle = TE.estucoL; g.lineWidth = 4; for (let k = 0; k < 2; k++) { g.beginPath(); g.arc(16 + k * 32, 16, 8, 0, 7); g.stroke(); }
  g.fillStyle = TE.estucoL; for (let k = 0; k < 2; k++) { g.beginPath(); g.arc(16 + k * 32, 16, 2.5, 0, 7); g.fill(); }
}, { repetir: true });
/* la crestería de Huitzilopochtli: roja, con dos hileras de cráneos blancos estilizados (círculos con sus cuencas) */
const texHuitzilCresta = () => textura('te7-hzc1', 64, 64, (g, w, h) => {
  g.fillStyle = TE.rojo; g.fillRect(0, 0, w, h);
  for (let f = 0; f < 2; f++) for (let k = 0; k < 2; k++) {
    const x = 16 + k * 32 + (f ? 0 : 0), y = 17 + f * 30;
    g.fillStyle = TE.estucoL; g.beginPath(); g.arc(x, y, 9, 0, 7); g.fill(); g.fillRect(x - 5, y + 4, 10, 7);
    g.fillStyle = TE.negro; g.fillRect(x - 5, y - 2, 4, 4); g.fillRect(x + 1, y - 2, 4, 4); g.fillRect(x - 3, y + 7, 6, 2);
  }
  g.fillStyle = TE.rojoD; g.fillRect(0, 0, w, 4); g.fillRect(0, h - 4, w, 4);
}, { repetir: true });
/* el friso de círculos blancos sobre rojo: el del calmécac en el Códice Mendoza */
const texCirculos = () => textura('te7-circ', 64, 16, (g, w, h) => {
  g.fillStyle = TE.rojo; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 4; k++) { g.fillStyle = TE.estucoL; g.beginPath(); g.arc(8 + k * 16, 8, 5.5, 0, 7); g.fill(); g.strokeStyle = TE.negro; g.lineWidth = 1; g.stroke(); }
}, { repetir: true });
/* el adobe: hiladas de bloques de barro, un poco desparejos, con su junta */
const texAdobe = (base = '#cdb48c') => textura('te7-adobe' + base, 64, 64, (g, w, h) => {
  const c = new THREE.Color(base); g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let f = 0; f < 6; f++) for (let k = -1; k < 3; k++) {
    const x = k * 26 + (f % 2) * 13, y = f * 10.7, t = c.clone().multiplyScalar(0.94 + ((f * 7 + k * 3) % 5) * 0.025);
    g.fillStyle = '#' + t.getHexString(); g.fillRect(x + 1, y + 1, 24, 9);
  }
  g.fillStyle = 'rgba(90,70,45,.28)'; for (let f = 0; f <= 6; f++) g.fillRect(0, f * 10.7, w, 1.2);
}, { repetir: true });
/* el bajareque: el carrizo trenzado y el lodo, con los parches donde se ve la trama */
const texBajareque = () => textura('te7-bajareque', 64, 64, (g, w, h) => {
  g.fillStyle = '#c9ad84'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,90,55,.35)'; for (let x = 2; x < w; x += 6) g.fillRect(x, 0, 2, h);
  g.fillStyle = '#d8c09a'; [[8, 6, 22, 18], [36, 30, 24, 20], [6, 40, 18, 16]].forEach(([x, y, a, b]) => { g.beginPath(); g.ellipse(x + a / 2, y + b / 2, a / 2, b / 2, 0.3, 0, 7); g.fill(); });
}, { repetir: true });
/* el zacate: las capas del techo de paja, con sus mechones */
const texZacate = () => textura('te7-zacate', 64, 64, (g, w, h) => {
  g.fillStyle = '#d2ae62'; g.fillRect(0, 0, w, h);
  for (let f = 0; f < 4; f++) {
    g.fillStyle = '#a8843e'; g.fillRect(0, f * 16 + 13, w, 3);
    for (let x = 0; x < w; x += 3) { g.fillStyle = (x * 7 + f) % 3 ? 'rgba(150,115,50,.5)' : 'rgba(240,215,140,.6)'; g.fillRect(x, f * 16 + 2, 1.5, 11); }
  }
}, { repetir: true });
/* la piedra de Coyolxauhqui: el disco labrado, con la diosa entre sus atavíos (aquí, sus formas en relieve) y el ocre que conserva */
const texCoyolxauhqui = () => textura('te7-coyol', 128, 128, (g, w, h) => {
  g.fillStyle = '#cdbba0'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#8f7a60'; g.lineWidth = 3; g.beginPath(); g.arc(64, 64, 60, 0, 7); g.stroke();
  g.fillStyle = 'rgba(176,96,60,.45)'; g.beginPath(); g.arc(50, 46, 16, 0, 7); g.fill();               // la cabeza con su tocado
  g.strokeStyle = '#7a6650'; g.lineWidth = 2.5;
  [[50, 46, 16], [86, 40, 9], [40, 92, 11], [88, 88, 12], [64, 66, 14]].forEach(([x, y, r]) => { g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke(); });
  g.lineWidth = 6; g.strokeStyle = '#a89070'; [[64, 66, 98, 30], [64, 66, 26, 100], [64, 66, 104, 96], [64, 66, 30, 40]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.quadraticCurveTo((a + c) / 2 + 10, (b + d) / 2 - 10, c, d); g.stroke(); });
  g.fillStyle = '#e8dcc4'; for (let k = 0; k < 7; k++) { g.beginPath(); g.arc(30 + k * 11, 18 + (k % 2) * 4, 3, 0, 7); g.fill(); }   // los cascabeles
}, {});

/* ---------- las piezas chicas del Templo Mayor ---------- */
/* la cabeza de serpiente de piedra, con las fauces abiertas, los colmillos, la lengua bífida y la voluta de la nariz */
export function cabezaSerpiente(K, s = 1) {
  const g = new THREE.Group(), P = '#cfc2a4', PD = '#ab9c7e'; g.scale.setScalar(s);
  pon(g, caja(K, 0.2, 0.12, 0.2, P, { grosor: 0.004 }), 0, 0.07, 0);                               // el cráneo
  pon(g, caja(K, 0.2, 0.05, 0.12, P, { grosor: 0.003 }), 0, 0.12, 0.15);                            // la quijada de arriba
  pon(g, caja(K, 0.18, 0.04, 0.11, PD, { grosor: 0.003 }), 0, 0.022, 0.14);                         // la de abajo
  pon(g, caja(K, 0.16, 0.05, 0.08, TE.rojoD, { sinTinta: true }), 0, 0.066, 0.14);                  // la boca abierta
  [-1, 1].forEach(l => {
    pon(g, K.malla(K.cono(0.013, 0.05, 4), '#f4efe2', { sinTinta: true }), l * 0.062, 0.075, 0.19).rotation.x = Math.PI;   // los colmillos
    pon(g, K.malla(K.esfera(0.024, 0.5), TE.negro, { grosor: 0.002 }), l * 0.086, 0.135, 0.04);                         // los ojos
    pon(g, caja(K, 0.055, 0.035, 0.08, PD, { grosor: 0.002 }), l * 0.07, 0.165, 0.03);                                  // las cejas
  });
  pon(g, K.malla(K.toro(0.032, 0.013, Math.PI * 1.4, 0.6), P, { grosor: 0.002 }), 0, 0.165, 0.17).rotation.y = Math.PI / 2;   // la voluta
  pon(g, caja(K, 0.026, 0.006, 0.08, TE.rojo, { sinTinta: true }), 0, 0.045, 0.22);                  // la lengua
  return g;
}
/* el brasero grande de barro, con el moño al frente y la brasa */
export function braseroGrande(K, s = 1, fuego = true) {
  const g = new THREE.Group(); g.scale.setScalar(s);
  pon(g, K.malla(K.cilindro(0.1, 0.075, 0.17, 12), '#b5683c', { grosor: 0.003 }), 0, 0.085, 0);
  pon(g, K.malla(K.toro(0.098, 0.016, Math.PI * 2, 0.6), '#8e4a2a', { grosor: 0.002 }), 0, 0.17, 0).rotation.x = Math.PI / 2;
  [-1, 1].forEach(l => pon(g, K.malla(K.esfera(0.03, 0.5), TE.estucoL, { grosor: 0.002 }), l * 0.035, 0.1, 0.085));   // el moño
  pon(g, caja(K, 0.03, 0.05, 0.02, TE.estucoL, { grosor: 0.0015 }), 0, 0.1, 0.095);
  if (fuego) { const f = K.malla(K.cono(0.05, 0.13, 6), '#ffb13b', { emissive: '#ff8a2a', emissiveIntensity: 0.9, sinTinta: true }); f.position.y = 0.23; f.userData.llama = true; g.add(f); }
  return g;
}
/* la piedra de Coyolxauhqui, tendida al pie de la escalinata de Huitzilopochtli (3,25 m) */
export function coyolxauhqui(K, r = 0.17) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(r, r, 0.03, 24), TE.piedraD, { grosor: 0.003 }), 0, 0.015, 0);
  const cara = new THREE.Mesh(propia(new THREE.CircleGeometry(r * 0.97, 24)), matTex(K, 'te7-coyol', texCoyolxauhqui())); cara.rotation.x = -Math.PI / 2; cara.position.y = 0.032; g.add(cara);
  return g;
}
/* el chac mool: recostado, las rodillas arriba, la cabeza vuelta al costado y el recipiente en el vientre */
export function chacmool(K, s = 1) {
  const g = new THREE.Group(), P = '#c9b896'; g.scale.setScalar(s);
  pon(g, caja(K, 0.12, 0.025, 0.24, TE.piedraD, { grosor: 0.002 }), 0, 0.0125, 0);
  pon(g, caja(K, 0.09, 0.04, 0.08, P, { grosor: 0.002 }), 0, 0.045, -0.02);                          // la cadera
  const t = caja(K, 0.09, 0.04, 0.1, P, { grosor: 0.002 }); t.position.set(0, 0.075, -0.09); t.rotation.x = -0.55; g.add(t);   // el torso, apoyado en los codos
  [-1, 1].forEach(l => { const m = caja(K, 0.035, 0.035, 0.09, P, { grosor: 0.0015 }); m.position.set(l * 0.026, 0.085, 0.04); m.rotation.x = 0.8; g.add(m);
    const c = caja(K, 0.035, 0.07, 0.035, P, { grosor: 0.0015 }); c.position.set(l * 0.026, 0.06, 0.09); g.add(c); });               // las piernas dobladas
  const cab = caja(K, 0.06, 0.06, 0.055, P, { grosor: 0.002 }); cab.position.set(0, 0.125, -0.135); cab.rotation.y = 1.1; g.add(cab);   // la cabeza, mirando al costado
  pon(g, K.malla(K.cilindro(0.03, 0.025, 0.02, 10), TE.rojo, { grosor: 0.0015 }), 0, 0.1, -0.04);    // el recipiente
  return g;
}
/* el templete de la esquina de la plataforma: el cuarto con su entrada de pilares, el friso pintado y las almenas */
function templete(K) {
  const g = new THREE.Group(), W = 0.85, D = 0.75;
  pon(g, caja(K, W, 0.06, D, TE.estucoD, { grosor: 0.004 }), 0, 0.03, 0);
  pon(g, caja(K, W - 0.08, 0.28, D - 0.12, TE.estuco, { grosor: 0.004 }), 0, 0.2, -0.04);
  pon(g, caja(K, 0.42, 0.2, 0.02, '#2a1e18', { sinTinta: true }), 0, 0.16, D / 2 - 0.095);
  [-1, 1].forEach(l => pon(g, caja(K, 0.065, 0.25, 0.065, TE.estucoL, { grosor: 0.002 }), l * 0.12, 0.185, D / 2 - 0.07));
  pon(g, caja(K, W, 0.05, D, TE.estucoL, { grosor: 0.004 }), 0, 0.365, 0);
  const fr = caja(K, W - 0.06, 0.07, D - 0.06, '#ffffff', { grosor: 0.003 }); fr.material = matRep(K, 'te7-circ-t', texCirculos(), 4, 1); fr.position.y = 0.425; g.add(fr);
  pon(g, caja(K, W - 0.02, 0.03, D - 0.02, TE.estucoL, { grosor: 0.003 }), 0, 0.475, 0);
  for (let k = 0; k < 5; k++) pon(g, caja(K, 0.07, 0.07, 0.04, TE.estucoL, { grosor: 0.002 }), -0.32 + k * 0.16, 0.525, D / 2 - 0.04);
  return g;
}
/* un santuario de lo alto: el basamento con sus gradas, los muros con la puerta y la crestería de dos cuerpos con sus almenas */
function santuario(K, quien, W = 1.25, D = 1.05) {
  const g = new THREE.Group(), tl = quien === 'tlaloc', H = 0.5, y1 = 0.08 + H;
  pon(g, caja(K, W + 0.1, 0.08, D + 0.1, TE.estucoD, { grosor: 0.004 }), 0, 0.04, 0);
  for (let k = 0; k < 2; k++) pon(g, caja(K, 0.5, 0.04 * (2 - k), 0.06, TE.estucoL, { grosor: 0.002 }), 0, 0.02 * (2 - k), D / 2 + 0.08 + k * 0.06);
  const muro = K.malla(K.caja(W, H, D), tl ? matRep(K, 'te7-tlm', texTlalocMuro(), Math.round(W / 0.3), 1) : K.mat(TE.rojo), { grosor: 0.005 }); muro.position.y = 0.08 + H / 2; g.add(muro);
  if (tl) banda(K, g, W, D, y1 - 0.05, 0.1, texTlalocCresta2, 'tl7');
  else banda(K, g, W, D, y1 - 0.06, 0.12, frisoHuitzil, 'hz7');
  pon(g, caja(K, 0.36, 0.34, 0.02, '#2a1e18', { sinTinta: true }), 0, 0.08 + 0.17, D / 2 + 0.006);                       // la puerta, oscura
  [-1, 1].forEach(b => pon(g, caja(K, 0.07, 0.38, 0.05, TE.estucoL, { grosor: 0.003 }), b * 0.215, 0.08 + 0.19, D / 2 + 0.02));   // las jambas
  pon(g, caja(K, 0.52, 0.06, 0.06, tl ? '#2f5f8f' : TE.rojoD, { grosor: 0.003 }), 0, 0.08 + 0.4, D / 2 + 0.025);            // el dintel
  const c1 = K.malla(geoTalud(W + 0.04, D + 0.04, W - 0.08, D - 0.08, 0.34), matRep(K, tl ? 'te7-tlc1' : 'te7-hzc1', tl ? texTlalocCresta() : texHuitzilCresta(), Math.round(W / 0.32), 1), { grosor: 0.005 });
  c1.position.y = y1 + 0.17; g.add(c1);
  pon(g, caja(K, W - 0.04, 0.045, D - 0.04, TE.estucoL, { grosor: 0.004 }), 0, y1 + 0.362, 0);
  const c2 = K.malla(geoTalud(W - 0.14, D - 0.14, W - 0.24, D - 0.24, 0.26), matRep(K, tl ? 'te7-tlc2' : 'te7-hzc2', tl ? texTlalocCresta2() : greca(), Math.round(W / 0.3), tl ? 2 : 2), { grosor: 0.005 });
  c2.position.y = y1 + 0.385 + 0.13; g.add(c2);
  const y3 = y1 + 0.645;
  pon(g, caja(K, W - 0.2, 0.04, D - 0.2, TE.estucoL, { grosor: 0.003 }), 0, y3 + 0.02, 0);
  const mx = (W - 0.3) / 2, mz = (D - 0.3) / 2;
  for (let k = 0; k < 7; k++) [-1, 1].forEach(l => pon(g, caja(K, 0.07, 0.085, 0.045, tl && k % 2 ? TE.azul : TE.estucoL, { grosor: 0.002 }), -mx + k * mx / 3, y3 + 0.08, l * mz));
  for (let k = 1; k < 5; k++) [-1, 1].forEach(l => pon(g, caja(K, 0.045, 0.085, 0.07, tl && k % 2 ? TE.azul : TE.estucoL, { grosor: 0.002 }), l * mx, y3 + 0.08, -mz + k * mz / 2.5));
  return g;
}

/* ---------- EL TEMPLO MAYOR (huei teocalli) DE LA ETAPA VII ---------- */
/* Las etapas en que creció: cada tlatoani encerró el templo de su antecesor en uno más grande (las siete que excavó el
   Proyecto Templo Mayor desde 1978). Para el juego, cuatro: II (hacia 1390), IV (Moctezuma I, 1440-1469), VI (Ahuízotl,
   hacia 1486) y VII (hacia 1502). */
export const ETAPAS_TEMPLO = [{ s: 0.46, n: 'II', anio: 'hacia 1390' }, { s: 0.64, n: 'IV', anio: '1440-1469' }, { s: 0.82, n: 'VI', anio: 'hacia 1486' }, { s: 1, n: 'VII', anio: 'hacia 1502' }];
export function templo7(K, etapa = 3) {
  const g = new THREE.Group(), s = ETAPAS_TEMPLO[etapa].s;
  const PW = 5.4, PH = 0.18, PD = 5.05, pz = 0.075;                                   // la plataforma
  const W0 = 4.2, D0 = 3.3, zc = -0.55, N = 4, HT = 0.58, REC = 0.18, TAL = 0.1;      // los cuatro cuerpos
  const yT = PH + N * HT, dT = D0 - 2 * (N - 1) * REC - 2 * TAL, zF = zc + dT / 2;
  const NE = 26, alto = yT - PH, largo = alto / Math.tan(54 * Math.PI / 180), WS = 1.1, C = 0.16, AO = 0.18;
  /* la plataforma, con sus tres gradas al frente entre los templetes */
  g.add(ubicar(conColor(K, pintarCaras(geoTalud(PW, PD, PW - 0.06, PD - 0.06, PH), tresTonos(TE.estucoL, TE.estuco, TE.estucoD)), { grosor: 0.008 }), 0, PH / 2, pz));
  for (let k = 0; k < 3; k++) pon(g, caja(K, 3.0 - k * 0.1, (k + 1) * PH / 3, 0.08, k % 2 ? TE.estuco : TE.estucoL, { grosor: 0.003 }), 0, (k + 1) * PH / 6, pz + PD / 2 + 0.04 + (2 - k) * 0.08);
  /* los cuerpos en talud, con la moldura de cada remate */
  for (let k = 0; k < N; k++) {
    const w0 = W0 - 2 * k * REC, d0 = D0 - 2 * k * REC, w1 = w0 - 2 * TAL, d1 = d0 - 2 * TAL, y0 = PH + k * HT;
    g.add(ubicar(conColor(K, pintarCaras(geoTalud(w0, d0, w1, d1, HT - 0.04), tresTonos(TE.estucoL, k % 2 ? '#ece4d4' : TE.estuco, TE.estucoD)), { grosor: 0.007 }), 0, y0 + (HT - 0.04) / 2, zc));
    pon(g, caja(K, w1 + 0.03, 0.04, d1 + 0.03, TE.estucoD, { grosor: 0.004 }), 0, y0 + HT - 0.02, zc);
  }
  /* la doble escalinata: los escalones de estuco y las alfardas con sus dados (la del centro es doble: una por escalinata) */
  const esc = pintarCaras(geoPerfil(perfilEscalera(alto, largo, NE), WS), n => n.y > 0.5 ? TE.estucoL : n.z > 0.5 ? '#e2dac8' : TE.estucoD);
  [-1, 1].forEach(l => g.add(ubicar(conColor(K, esc, { grosor: 0.004 }), l * (C + WS / 2), PH, zF - 0.01)));
  const alf = w => pintarCaras(geoPerfil(perfilAlfarda(alto, largo, { sobre: alto / NE + 0.07 }), w), tresTonos(TE.estucoL, TE.estuco, TE.estucoD));
  const aExt = alf(AO), aCen = alf(0.15);
  [-1, 1].forEach(l => {
    g.add(ubicar(conColor(K, aExt, { grosor: 0.004 }), l * (C + WS + AO / 2), PH, zF));
    g.add(ubicar(conColor(K, aCen, { grosor: 0.004 }), l * 0.085, PH, zF));
    [C + WS + AO / 2, 0.085].forEach(x => pon(g, braseroGrande(K, 0.42, false), l * x, yT + 0.2, zF - 0.02));   // los braseritos sobre los dados
  });
  /* las cabezas de serpiente al pie de las alfardas */
  if (etapa >= 1) [-1, 1].forEach(l => { pon(g, cabezaSerpiente(K, 1.3), l * (C + WS + AO / 2), PH, zF + largo + 0.14); pon(g, cabezaSerpiente(K, 0.95), l * 0.1, PH, zF + largo + 0.12); });
  /* arriba, los dos santuarios: Tláloc al norte (a la izquierda del que mira el frente) y Huitzilopochtli al sur */
  const zS = zc - dT / 2 + 0.12 + 0.525;
  [[-1, 'tlaloc'], [1, 'huitzil']].forEach(([l, q]) => {
    pon(g, santuario(K, q), l * 0.72, yT, zS);
    [-1, 1].forEach(b => pon(g, braseroGrande(K, 0.6), l * 0.72 + b * 0.5, yT, zS + 0.66));         // el fuego que no se apagaba
    if (q === 'tlaloc') pon(g, chacmool(K, 1.1), l * 0.72, yT, zS + 0.78);
  });
  if (etapa >= 1) {
    pon(g, coyolxauhqui(K), C + WS / 2, PH, pz + PD / 2 - 0.24);                                     // al pie de Huitzilopochtli
    [-1, 1].forEach(l => pon(g, braseroGrande(K, 1), l * 2.15, PH, pz + PD / 2 - 0.13));
  }
  if (etapa >= 2) [-1, 1].forEach(l => pon(g, templete(K), l * 2.15, PH, 1.9));
  if (etapa >= 3) [-1.95, -2.6, 1.95, 2.6].forEach(x => { const c = cabezaSerpiente(K, 0.55); c.position.set(x, 0.0, pz + PD / 2 - 0.02); g.add(c); });   // las serpientes del frente de la plataforma
  g.scale.setScalar(s);
  g.userData.alto = (yT + 1.33) * s; g.userData.base = [PW * s, PD * s];
  g.userData.ficha = { titulo: 'El Templo Mayor', texto: 'Tláloc y Huitzilopochtli en lo alto: el centro del mundo mexica' };
  return g;
}
/* el piso estucado de una plaza: losas claras con sus juntas, y el borde de un escalón */
export function pisoEstuco(K, w, d, { color = '#efe8d8', alto = 0.03 } = {}) {
  const g = new THREE.Group(), tonos = ['#efe8d8', '#ebe3d1', '#f2ecdd', '#e7dfcb'];
  const geo = new THREE.PlaneGeometry(w, d, Math.ceil(w * 2), Math.ceil(d * 2)).toNonIndexed(); geo.rotateX(-Math.PI / 2);
  const col = [], c = new THREE.Color(), pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i += 3) { const px = (pos.getX(i) + pos.getX(i + 1) + pos.getX(i + 2)) / 3, pz = (pos.getZ(i) + pos.getZ(i + 1) + pos.getZ(i + 2)) / 3; c.set(tonos[Math.abs(Math.floor(px * 2 + 40) * 7 + Math.floor(pz * 2 + 40) * 13) % 4]); for (let j = 0; j < 3; j++) col.push(c.r, c.g, c.b); }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); geo.computeVertexNormals(); propia(geo);
  const top = K.malla(geo, '#ffffff', { vertexColors: true, sinTinta: true, sombra: false }); top.position.y = alto + 0.001; g.add(top);
  pon(g, caja(K, w, alto, d, '#ddd3bd', { grosor: 0.006, sombra: false }), 0, alto / 2, 0);
  return g;
}
/* EL TEMPLO MAYOR, en tres lecturas:
   'plaza'      el templo solo, en medio de su plaza estucada: la silueta más limpia;
   'recinto'    el recinto sagrado apretado: el coatepantli, el templo redondo de Ehécatl que lo mira de frente, el juego de
                pelota y el calmécac (la maqueta de Marquina, en chico);
   'tlatelolco' el templo gemelo de Tlatelolco con el gran mercado a su lado (Bernal Díaz subió sus gradas con Moctezuma y
                desde arriba vio el mercado, las tres calzadas, el acueducto y las canoas: Historia verdadera, cap. XCII). */
export function hueyTeocalli(K, variante = VARIANTES.templo, etapa = 3) {
  const g = new THREE.Group();
  if (variante === 'plaza') {
    g.add(pisoEstuco(K, 7.0, 6.6));
    const t = templo7(K, etapa); t.position.set(0, 0.03, -0.45); g.add(t);
    [-1, 1].forEach(l => { pon(g, braseroGrande(K, 1.25), l * 1.1, 0.03, 2.95); });
    pon(g, cuauhxicalco(K), 2.75, 0.03, 2.55);
  } else if (variante === 'recinto') {
    const W = 7.6, D = 7.2;
    g.add(pisoEstuco(K, W - 0.1, D - 0.1));
    const t = templo7(K, etapa); t.scale.multiplyScalar(0.9); t.position.set(0, 0.03, -1.25); g.add(t);
    const mu = coatepantli(K, W, D, { puertas: [1, 2, 3] }); g.add(mu);
    const eh = temploRedondo(K); eh.scale.setScalar(0.82); eh.rotation.y = Math.PI; eh.position.set(0, 0.03, 2.32); g.add(eh);   // mira al Templo Mayor
    const pe = tlachtli(K); pe.scale.setScalar(0.92); pe.position.set(2.45, 0.03, 2.35); g.add(pe);
    const ca = calmecacGrande(K, { templo: false }); ca.scale.setScalar(0.58); ca.position.set(-2.45, 0.03, 2.3); g.add(ca);
    pon(g, cuauhxicalco(K), 2.75, 0.03, 0.55);
    [-1, 1].forEach(l => pon(g, braseroGrande(K, 1.1), l * 0.75, 0.03, 3.25));
  } else {
    const t = templo7(K, etapa); t.scale.multiplyScalar(0.84); t.position.set(-2.55, 0.03, 0); g.add(t);
    g.add(ubicar(pisoEstuco(K, 4.9, 4.6), -2.55, 0, 0.12));
    const m = mercado(K); m.position.set(2.5, 0, 0.1); g.add(m);
  }
  g.userData.ficha = { titulo: 'El Templo Mayor', texto: 'Tláloc y Huitzilopochtli en lo alto: el centro del mundo mexica' };
  return g;
}
/* el cuauhxicalco: la plataforma redonda, baja, de las ceremonias (los números 17 de la maqueta de Marquina) */
function cuauhxicalco(K) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.36, 0.38, 0.14, 20), TE.estuco, { grosor: 0.004 }), 0, 0.07, 0);
  pon(g, K.malla(K.cilindro(0.39, 0.39, 0.035, 20), TE.rojo, { grosor: 0.002 }), 0, 0.095, 0);
  pon(g, caja(K, 0.2, 0.1, 0.14, TE.estucoL, { grosor: 0.003 }), 0, 0.05, 0.42);
  return g;
}

/* ---------- EL TEMPLO REDONDO DE EHÉCATL ---------- */
export function temploRedondo(K) {
  const g = new THREE.Group(), PW = 1.9, PD = 2.1, PH = 0.1, cz = -0.2, R = [0.82, 0.71, 0.6], HT = 0.26;
  g.add(ubicar(conColor(K, pintarCaras(geoTalud(PW, PD, PW - 0.04, PD - 0.04, PH), tresTonos(TE.estucoL, TE.estuco, TE.estucoD)), { grosor: 0.005 }), 0, PH / 2, 0));
  R.forEach((r, k) => {                                   // el basamento redondo de tres cuerpos, con su moldura
    const y0 = PH + k * HT;
    g.add(ubicar(conColor(K, pintarCaras(cilindroP(r - 0.04, r, HT - 0.03, 28), n => n.y > 0.5 ? TE.estucoL : k % 2 ? '#ece4d4' : TE.estuco), { grosor: 0.005 }), 0, y0 + (HT - 0.03) / 2, cz));
    pon(g, K.malla(K.cilindro(r - 0.03, r - 0.03, 0.03, 28), TE.estucoD, { grosor: 0.003 }), 0, y0 + HT - 0.015, cz);
  });
  const yB = PH + R.length * HT;
  for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2; if (Math.abs(Math.sin(a / 2)) < 0.12) continue; pon(g, caja(K, 0.05, 0.06, 0.03, TE.rojo, { grosor: 0.0015 }), Math.sin(a) * 0.55, yB + 0.03, cz + Math.cos(a) * 0.55, a); }   // las almenas rojas del basamento
  /* la escalinata del frente, sobre el rectángulo adosado, con sus alfardas */
  const alto = yB - PH, largo = alto / Math.tan(52 * Math.PI / 180), zF = cz + R[2] - 0.08;
  g.add(ubicar(conColor(K, pintarCaras(geoPerfil(perfilEscalera(alto, largo, 9), 0.46), n => n.y > 0.5 ? TE.estucoL : n.z > 0.5 ? '#e2dac8' : TE.estucoD), { grosor: 0.003 }), 0, PH, zF));
  [-1, 1].forEach(l => g.add(ubicar(conColor(K, pintarCaras(geoPerfil(perfilAlfarda(alto, largo, { sobre: alto / 9 + 0.05, dado: 0.1 }), 0.09), tresTonos(TE.estucoL, TE.estuco, TE.estucoD)), { grosor: 0.003 }), l * 0.275, PH, zF)));
  /* el cilindro del santuario, la franja turquesa, la puerta en fauces de serpiente y las almenas rojas */
  const RS = 0.42, HS = 0.56;
  g.add(ubicar(conColor(K, pintarCaras(cilindroP(RS, RS, HS, 28), n => n.y > 0.5 ? TE.estucoD : TE.estuco), { grosor: 0.005 }), 0, yB + HS / 2, cz));
  pon(g, K.malla(K.cilindro(RS + 0.006, RS + 0.006, 0.07, 28), TE.turquesa, { grosor: 0.002 }), 0, yB + HS - 0.16, cz);
  for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; pon(g, caja(K, 0.06, 0.07, 0.03, TE.rojo, { grosor: 0.0015 }), Math.sin(a) * (RS - 0.02), yB + HS + 0.035, cz + Math.cos(a) * (RS - 0.02), a); }
  const zp = cz + RS;
  pon(g, caja(K, 0.2, 0.28, 0.04, '#2a1e18', { sinTinta: true }), 0, yB + 0.14, zp - 0.01);
  pon(g, caja(K, 0.36, 0.07, 0.1, TE.rojo, { grosor: 0.002 }), 0, yB + 0.31, zp + 0.02);              // la quijada de arriba
  pon(g, caja(K, 0.34, 0.035, 0.12, TE.rojoD, { grosor: 0.002 }), 0, yB + 0.018, zp + 0.03);           // la de abajo, en el umbral
  for (let k = 0; k < 4; k++) {
    pon(g, K.malla(K.cono(0.016, 0.06, 4), '#f4efe2', { sinTinta: true }), -0.09 + k * 0.06, yB + 0.255, zp + 0.06).rotation.x = Math.PI;   // los colmillos
    pon(g, K.malla(K.cono(0.013, 0.045, 4), '#f4efe2', { sinTinta: true }), -0.09 + k * 0.06, yB + 0.05, zp + 0.07);
  }
  [-1, 1].forEach(l => { pon(g, K.malla(K.esfera(0.035, 0.5), TE.estucoL, { grosor: 0.002 }), l * 0.11, yB + 0.39, zp + 0.03); pon(g, K.malla(K.esfera(0.018, 0.5), TE.negro, { sinTinta: true }), l * 0.11, yB + 0.39, zp + 0.06); });   // los ojos de la serpiente
  /* el techo cónico de zacate, con su alero y el remate */
  const te = K.malla(propia(new THREE.ConeGeometry(0.52, 0.74, 24, 1, true)), matRep(K, 'te7-zac-c', texZacate(), 6, 2), { grosor: 0.005 }); te.position.set(0, yB + HS + 0.37 + 0.02, cz); g.add(te);
  pon(g, K.malla(K.toro(0.5, 0.03, Math.PI * 2, 0.6), '#a8843e', { grosor: 0.002 }), 0, yB + HS + 0.03, cz).rotation.x = Math.PI / 2;
  pon(g, K.malla(K.cilindro(0.05, 0.07, 0.08, 10), TE.turquesa, { grosor: 0.002 }), 0, yB + HS + 0.76, cz);
  pon(g, K.malla(K.esfera(0.05, 0.5), TE.rojo, { grosor: 0.002 }), 0, yB + HS + 0.84, cz);
  g.userData.alto = yB + HS + 0.88;
  g.userData.ficha = { titulo: 'El templo de Ehécatl', texto: 'redondo, para que el viento no choque con esquinas' };
  return g;
}

/* ---------- EL JUEGO DE PELOTA (tlachtli), en I, con sus anillos ---------- */
export function tlachtli(K) {
  const g = new THREE.Group(), L = 1.5, A = 0.4;
  pon(g, caja(K, L + 0.9, 0.02, 1.1, '#e4d8bc', { sinTinta: true, sombra: false }), 0, 0.01, 0);
  [-1, 1].forEach(l => {
    const lado = new THREE.Group(); lado.position.z = l * (A / 2 + 0.16); lado.rotation.y = l > 0 ? 0 : Math.PI; g.add(lado);   // cada lado mira a la cancha (-z de su marco)
    lado.add(ubicar(conColor(K, pintarCaras(geoTalud(L, 0.32, L, 0.16, 0.12), tresTonos(TE.estucoL, TE.estuco, TE.estucoD)), { grosor: 0.004 }), 0, 0.06, 0.0));   // la banqueta en talud
    pon(lado, caja(K, L, 0.22, 0.14, TE.estuco, { grosor: 0.004 }), 0, 0.23, 0.09);
    pon(lado, caja(K, L + 0.02, 0.03, 0.17, TE.estucoL, { grosor: 0.002 }), 0, 0.355, 0.09); pon(lado, caja(K, L, 0.035, 0.01, TE.rojo, { sinTinta: true }), 0, 0.3, 0.015);
    const an = K.malla(K.toro(0.05, 0.016, Math.PI * 2, 0.6), TE.piedraD, { grosor: 0.002 }); an.position.set(0, 0.27, 0.01); lado.add(an);   // el anillo de piedra
    [-1, 1].forEach(e => pon(g, caja(K, 0.42, 0.18, 0.14, TE.estucoD, { grosor: 0.003 }), e * (L / 2 + 0.24), 0.09, l * 0.48));             // los cabezales
  });
  [-1, 1].forEach(e => pon(g, caja(K, 0.12, 0.18, 1.1, TE.estucoD, { grosor: 0.003 }), e * (L / 2 + 0.4), 0.09, 0));
  pon(g, K.malla(K.esfera(0.035, 0.5), TE.negro, { sinTinta: true }), 0.18, 0.045, 0.02);         // la pelota de hule
  g.userData.ficha = { titulo: 'El juego de pelota', texto: 'la cancha del tlachtli, con sus anillos de piedra' };
  return g;
}

/* ---------- EL CALMÉCAC: la casa del linaje, junto al templo ---------- */
/* La plataforma con su escalinata, los cuartos alrededor del patio, el pórtico de pilares al frente, el friso de círculos
   del Códice Mendoza y las almenas; con `templo`, atrás, el templo de su dios (el de México era de Quetzalcóatl). */
export function calmecacGrande(K, { templo = true } = {}) {
  const g = new THREE.Group(), PW = 3.0, PD = templo ? 3.3 : 2.4, PH = 0.26, z0 = templo ? 0.45 : 0, H = 0.48, y0 = PH;
  g.add(ubicar(conColor(K, pintarCaras(geoTalud(PW, PD, PW - 0.05, PD - 0.05, PH), tresTonos(TE.estucoL, TE.estuco, TE.estucoD)), { grosor: 0.006 }), 0, PH / 2, z0 - (templo ? 0.45 : 0)));
  const zf = z0 + 1.2;                                    // el frente del edificio
  g.add(ubicar(conColor(K, pintarCaras(geoPerfil(perfilEscalera(PH, 0.28, 4), 0.8), n => n.y > 0.5 ? TE.estucoL : TE.estuco), { grosor: 0.003 }), 0, 0, zf));
  /* las alas: la de atrás y las de los lados; el patio en medio */
  const ala = (w, d, x, z) => { pon(g, caja(K, w, H, d, TE.estuco, { grosor: 0.005 }), x, y0 + H / 2, z); pon(g, caja(K, w + 0.04, 0.05, d + 0.04, TE.estucoL, { grosor: 0.003 }), x, y0 + H + 0.025, z); };
  ala(PW - 0.2, 0.72, 0, z0 - 1.2 + 0.36);
  [-1, 1].forEach(l => ala(0.68, 1.68, l * (PW / 2 - 0.1 - 0.34), z0 + 0.36 - 0.0));
  /* el pórtico: los pilares del frente con su viga, entre las alas */
  for (let k = 0; k < 5; k++) { const x = -0.64 + k * 0.32; pon(g, caja(K, 0.08, H - 0.04, 0.08, TE.estucoL, { grosor: 0.0025 }), x, y0 + (H - 0.04) / 2, zf - 0.06); pon(g, caja(K, 0.1, 0.06, 0.1, TE.rojo, { grosor: 0.002 }), x, y0 + 0.03, zf - 0.06); }
  pon(g, caja(K, 1.6, 0.06, 0.16, TE.estucoL, { grosor: 0.003 }), 0, y0 + H - 0.01, zf - 0.06);
  banda(K, g, PW - 0.2, 2.4 - 0.0, y0 + H - 0.07, 0.1, texCirculos, 'cal7');
  [g.children[g.children.length - 4], g.children[g.children.length - 3], g.children[g.children.length - 2], g.children[g.children.length - 1]].forEach(p => { p.position.z += z0; });   // el friso va con el edificio
  /* las puertas que dan al patio y las almenas del borde */
  [[0, z0 - 0.84 + 0.001, 0], [-0.87, z0 + 0.36, Math.PI / 2], [0.87, z0 + 0.36, -Math.PI / 2]].forEach(([x, z, ry]) => { const p = caja(K, 0.22, 0.3, 0.02, '#2a1e18', { sinTinta: true }); p.position.set(x + Math.sin(ry) * 0.01, y0 + 0.15, z + Math.cos(ry) * 0.012); p.rotation.y = ry; g.add(p); });
  for (let k = 0; k < 11; k++) pon(g, caja(K, 0.08, 0.08, 0.05, k % 2 ? TE.estucoL : TE.rojo, { grosor: 0.002 }), -1.4 + k * 0.28, y0 + H + 0.09, z0 - 1.2 + 0.04);
  [-1, 1].forEach(l => { for (let k = 0; k < 7; k++) pon(g, caja(K, 0.05, 0.08, 0.08, k % 2 ? TE.estucoL : TE.rojo, { grosor: 0.002 }), l * (PW / 2 - 0.12), y0 + H + 0.09, z0 - 1.1 + k * 0.36); });
  /* el patio: el piso, el brasero y los petates con los códices */
  pon(g, caja(K, 1.6, 0.012, 1.0, '#f2ecdd', { sinTinta: true, sombra: false }), 0, y0 + 0.006, z0 + 0.45);
  pon(g, braseroGrande(K, 0.7), 0, y0, z0 + 0.35);
  [-0.45, 0.45].forEach(x => { pon(g, caja(K, 0.3, 0.012, 0.2, TE.paja, { sinTinta: true }), x, y0 + 0.014, z0 + 0.6); pon(g, caja(K, 0.22, 0.01, 0.08, '#f2e6c4', { grosor: 0.001 }), x, y0 + 0.026, z0 + 0.6); });
  if (templo) {
    const t = new THREE.Group(); t.position.set(0, y0, z0 - 1.65); g.add(t);
    const N = 4, HT = 0.33;
    for (let k = 0; k < N; k++) { const w = 1.15 - k * 0.16, d = 0.95 - k * 0.14; t.add(ubicar(conColor(K, pintarCaras(geoTalud(w, d, w - 0.08, d - 0.08, HT - 0.03), tresTonos(TE.estucoL, TE.estuco, TE.estucoD)), { grosor: 0.004 }), 0, k * HT + (HT - 0.03) / 2, 0)); pon(t, caja(K, w - 0.06, 0.03, d - 0.06, TE.estucoD, { grosor: 0.002 }), 0, (k + 1) * HT - 0.015, 0); }
    const sh = new THREE.Group(); sh.position.y = N * HT; t.add(sh);
    pon(sh, caja(K, 0.46, 0.3, 0.38, TE.estuco, { grosor: 0.004 }), 0, 0.15, 0);
    pon(sh, caja(K, 0.16, 0.2, 0.02, '#2a1e18', { sinTinta: true }), 0, 0.1, 0.2);
    const fr = caja(K, 0.5, 0.1, 0.42, '#ffffff', { grosor: 0.003 }); fr.material = matRep(K, 'te7-circ-s', texCirculos(), 3, 1); fr.position.y = 0.35; sh.add(fr);
    pon(sh, caja(K, 0.52, 0.03, 0.44, TE.estucoL, { grosor: 0.002 }), 0, 0.415, 0);
    for (let k = 0; k < 4; k++) pon(sh, K.malla(K.cono(0.035, 0.1, 6), '#ff9a3a', { emissive: '#ff7a2a', emissiveIntensity: 0.5, grosor: 0.0015 }), -0.18 + k * 0.12, 0.48, 0.15);   // las llamas del friso (el glifo del Mendoza)
  }
  g.userData.alto = templo ? y0 + 4 * 0.33 + 0.53 : y0 + H + 0.13;
  g.userData.ficha = { titulo: 'El calmécac', texto: 'la casa del linaje: los cantos, la cuenta de los días, los códices' };
  return g;
}

/* ---------- EL TEOCALLI DEL CALPULLI Y SU TELPOCHCALLI ---------- */
/* Cada barrio tenía su templo y, al pie, la casa de los jóvenes: ahí dormían, desde ahí salían a trabajar (el tequio) y
   le llevaban la leña al templo (Sahagún, libro III, apéndice, cap. 4). El santuario del barrio, con su techo de zacate. */
/* el teocalli del calpulli: tres cuerpos en talud, la escalinata con sus alfardas y, arriba, el santuario de techo de zacate
   con sus braseros. El frente mira a +z; `userData.cima` es la altura de la plataforma de arriba (donde va el secreto) */
export function teocalliCalpulli(K) {
  const t = new THREE.Group();
  const N = 3, HT = 0.38, W0 = 1.55, D0 = 1.32;
  for (let k = 0; k < N; k++) { const w = W0 - k * 0.26, d = D0 - k * 0.24; t.add(ubicar(conColor(K, pintarCaras(geoTalud(w, d, w - 0.1, d - 0.1, HT - 0.03), tresTonos('#efe6d2', k % 2 ? '#e6dcc6' : '#ebe1cc', '#d2c6ac')), { grosor: 0.005 }), 0, k * HT + (HT - 0.03) / 2, 0)); pon(t, caja(K, w - 0.07, 0.03, d - 0.07, TE.tezontle, { grosor: 0.002 }), 0, (k + 1) * HT - 0.015, 0); }
  const yT = N * HT, dT = D0 - (N - 1) * 0.24 - 0.1, largo = yT / Math.tan(55 * Math.PI / 180);
  t.add(ubicar(conColor(K, pintarCaras(geoPerfil(perfilEscalera(yT, largo, 10), 0.4), n => n.y > 0.5 ? TE.estucoL : n.z > 0.5 ? '#e2dac8' : TE.estucoD), { grosor: 0.003 }), 0, 0, dT / 2 - 0.01));
  [-1, 1].forEach(l => t.add(ubicar(conColor(K, pintarCaras(geoPerfil(perfilAlfarda(yT, largo, { sobre: yT / 10 + 0.05, dado: 0.1 }), 0.08), tresTonos(TE.estucoL, TE.estuco, TE.estucoD)), { grosor: 0.003 }), l * 0.24, 0, dT / 2)));
  const sh = new THREE.Group(); sh.position.set(0, yT, -0.08); t.add(sh);
  pon(sh, caja(K, 0.62, 0.32, 0.5, TE.estuco, { grosor: 0.004 }), 0, 0.16, 0);
  pon(sh, caja(K, 0.626, 0.06, 0.506, TE.rojo, { sinTinta: true }), 0, 0.27, 0);
  pon(sh, caja(K, 0.18, 0.22, 0.02, '#2a1e18', { sinTinta: true }), 0, 0.11, 0.255);
  const techo = K.malla(propia(new THREE.ConeGeometry(0.52, 0.6, 4, 1)), matRep(K, 'te7-zac-t', texZacate(), 3, 1), { grosor: 0.004 }); techo.rotation.y = Math.PI / 4; techo.scale.set(1.0, 1, 0.82); techo.position.y = 0.32 + 0.3; sh.add(techo);
  pon(sh, K.malla(K.cilindro(0.02, 0.02, 0.12, 6), TE.maderaD, { grosor: 0.0015 }), 0, 0.96, 0);
  [-1, 1].forEach(l => pon(sh, braseroGrande(K, 0.45), l * 0.24, 0, 0.36));
  t.userData.cima = yT; t.userData.alto = yT + 1.05;
  t.userData.ficha = { titulo: 'El teocalli del barrio', texto: 'el templo del calpulli: cada barrio tenía el suyo, con su telpochcalli al pie' };
  return t;
}
/* la casa del telpochcalli: la casa larga de adobe y estuco (con `ramada`, la ramada al frente; con `patio`, el patio, el
   tambor, la leña y las coas). El frente mira a +z */
export function casaTelpochcalli(K, { ramada = true, patio = true } = {}) {
  /* el telpochcalli: la casa larga de adobe y estuco, con su ramada al frente, el patio, el tambor, la leña y las coas */
  const c = new THREE.Group();
  pon(c, caja(K, 1.62, 0.07, 0.72, TE.piedraD, { grosor: 0.004 }), 0, 0.035, 0);
  const mu = K.malla(K.caja(1.56, 0.52, 0.66), matRep(K, 'te7-adobe-t', texAdobe('#d6bf98'), 5, 3), { grosor: 0.005 }); mu.position.y = 0.07 + 0.26; c.add(mu);
  pon(c, caja(K, 1.564, 0.05, 0.664, TE.rojo, { sinTinta: true }), 0, 0.52, 0);
  pon(c, caja(K, 1.64, 0.05, 0.74, '#a88a62', { grosor: 0.004 }), 0, 0.615, 0);
  pon(c, caja(K, 1.58, 0.045, 0.68, '#c9b18a', { grosor: 0.003 }), 0, 0.655, 0);
  for (let k = 0; k < 7; k++) pon(c, K.malla(K.cilindro(0.016, 0.016, 0.09, 6), TE.maderaD, { grosor: 0.0015 }), -0.72 + k * 0.24, 0.57, 0.37).rotation.x = Math.PI / 2;   // las cabezas de las vigas
  [-0.45, 0.35].forEach(x => pon(c, caja(K, 0.19, 0.32, 0.02, '#2a1e18', { sinTinta: true }), x, 0.23, 0.335));
  if (ramada) {
    const ra = new THREE.Group(); ra.position.set(0, 0, 0.6); c.add(ra);   // la ramada de horcones y zacate
    [-0.7, 0, 0.7].forEach(x => pon(ra, K.malla(K.cilindro(0.018, 0.022, 0.44, 6), TE.madera, { grosor: 0.0015 }), x, 0.22, 0.12));
    const rt = K.malla(K.caja(1.6, 0.035, 0.36), matRep(K, 'te7-zac-r', texZacate(), 4, 1), { grosor: 0.003 }); rt.position.set(0, 0.46, -0.02); rt.rotation.x = 0.22; ra.add(rt);
  }
  if (patio) {
    pon(c, caja(K, 1.7, 0.01, 1.0, '#ddc9a0', { sinTinta: true, sombra: false }), 0, 0.005, 1.0);   // el patio de tierra apisonada
    const hu = new THREE.Group(); hu.position.set(-0.45, 0, 1.15); c.add(hu);   // el huéhuetl
    pon(hu, K.malla(K.cilindro(0.06, 0.07, 0.22, 10), TE.madera, { grosor: 0.002 }), 0, 0.11, 0);
    pon(hu, K.malla(K.cilindro(0.061, 0.061, 0.008, 10), '#d8c49a', { sinTinta: true }), 0, 0.224, 0);
    for (let k = 0; k < 7; k++) { const l = K.malla(K.cilindro(0.022, 0.022, 0.42, 6), k % 2 ? TE.madera : TE.maderaD, { grosor: 0.0015 }); l.rotation.z = Math.PI / 2; l.position.set(0.45, 0.025 + Math.floor(k / 3) * 0.042, 1.2 + (k % 3) * 0.046 - (Math.floor(k / 3) % 2) * 0.02); c.add(l); }   // la leña para el templo
    [0.62, 0.7, 0.78].forEach((x, k) => { const co = K.malla(K.cilindro(0.008, 0.008, 0.42, 5), TE.maderaD, { grosor: 0.0012 }); co.position.set(x, 0.2, 0.39); co.rotation.z = -0.25 + k * 0.05; c.add(co); pon(c, caja(K, 0.03, 0.06, 0.012, TE.madera, { sinTinta: true }), x - 0.05, 0.02, 0.39); });   // las coas
  }
  return c;
}
export function teocalliBarrio(K) {
  const g = new THREE.Group();
  const t = teocalliCalpulli(K); t.position.set(-0.55, 0, -0.45); g.add(t);
  const c = casaTelpochcalli(K); c.position.set(0.62, 0, 0.55); g.add(c);
  g.userData.alto = t.userData.alto;
  g.userData.ficha = { titulo: 'El telpochcalli', texto: 'la casa de los jóvenes del barrio, al pie de su templo' };
  return g;
}
/* LA SEGUNDA PIEZA: 'ehecatl' (el templo redondo), 'calmecac' (la escuela de los nobles, con su templo) o 'telpochcalli' (el
   teocalli del barrio y la escuela de todos) */
export function segundaPieza(K, variante = VARIANTES.segunda) {
  return variante === 'ehecatl' ? temploRedondo(K) : variante === 'calmecac' ? calmecacGrande(K) : teocalliBarrio(K);
}

/* ---------- EL MERCADO DE TLATELOLCO: la plaza con portales, las calles de cada mercancía y el momoxtli de los jueces ---------- */
/* Cortés (segunda carta): «una plaza tan grande como dos veces la de Salamanca, toda cercada de portales alrededor». */
function portal(K, largo, prof = 0.38, H = 0.4) {
  const g = new THREE.Group(), n = Math.round(largo / 0.32);
  pon(g, caja(K, largo, 0.05, prof, TE.estucoD, { grosor: 0.003 }), 0, 0.025, 0);
  pon(g, caja(K, largo, H, 0.08, TE.estuco, { grosor: 0.004 }), 0, H / 2 + 0.05, -prof / 2 + 0.04);
  for (let k = 0; k <= n; k++) pon(g, caja(K, 0.06, H, 0.06, TE.estucoL, { grosor: 0.002 }), -largo / 2 + 0.04 + k * (largo - 0.08) / n, H / 2 + 0.05, prof / 2 - 0.05);
  pon(g, caja(K, largo + 0.04, 0.05, prof + 0.04, TE.estucoL, { grosor: 0.003 }), 0, H + 0.075, 0);
  pon(g, caja(K, largo + 0.05, 0.04, 0.03, TE.rojo, { sinTinta: true }), 0, H + 0.06, prof / 2 + 0.01);
  return g;
}
export function mercado(K) {
  const g = new THREE.Group(), W = 4.4, D = 4.4;
  pon(g, caja(K, W, 0.02, D, '#e6d8b8', { sinTinta: true, sombra: false }), 0, 0.01, 0);
  const pa = portal(K, W, 0.4); pa.position.set(0, 0.02, -D / 2 + 0.2); g.add(pa);
  const pb = portal(K, D - 0.4, 0.4); pb.rotation.y = -Math.PI / 2; pb.position.set(W / 2 - 0.2, 0.02, 0.2); g.add(pb);
  const t1 = tianguis(K, 2, 4); t1.position.set(-0.55, 0.02, -0.8); g.add(t1);
  const t2 = tianguis(K, 2, 4); t2.position.set(-0.55, 0.02, 1.15); t2.rotation.y = 0; g.add(t2);
  const mo = new THREE.Group(); mo.position.set(1.15, 0.02, 0.2); g.add(mo);   // el momoxtli, donde se sentaban los jueces del mercado
  pon(mo, caja(K, 0.6, 0.2, 0.6, TE.estuco, { grosor: 0.004 }), 0, 0.1, 0);
  pon(mo, caja(K, 0.62, 0.04, 0.62, TE.rojo, { grosor: 0.002 }), 0, 0.2, 0);
  pon(mo, caja(K, 0.22, 0.1, 0.16, TE.estucoL, { grosor: 0.002 }), 0, 0.05, 0.38);
  pon(mo, caja(K, 0.4, 0.012, 0.3, TE.paja, { sinTinta: true }), 0, 0.226, 0);
  g.userData.ficha = { titulo: 'El mercado de Tlatelolco', texto: 'cada mercancía en su calle; los jueces, en medio' };
  return g;
}

/* ---------- LO DE AFUERA DE LAS CASAS: lo que se ve en el patio de cualquier casa del valle ---------- */
export function metate(K) {                               // la piedra de moler el maíz, de basalto, con su mano
  const g = new THREE.Group(), B = '#56504a';
  const p = caja(K, 0.1, 0.025, 0.16, B, { grosor: 0.002 }); p.position.y = 0.05; p.rotation.x = 0.18; g.add(p);
  [[-0.035, 0.06], [0.035, 0.06], [0, -0.06]].forEach(([x, z]) => pon(g, K.malla(K.cilindro(0.012, 0.01, 0.045, 5), B, { sinTinta: true }), x, 0.022, z));
  const m = K.malla(K.cilindro(0.014, 0.014, 0.12, 6), '#6a625a', { grosor: 0.0015 }); m.rotation.z = Math.PI / 2; m.position.set(0, 0.075, 0.02); g.add(m);
  return g;
}
export function comal(K, fuego = true) {                  // el comal de barro sobre las tres piedras (tenamaztli), con sus tortillas
  const g = new THREE.Group();
  for (let k = 0; k < 3; k++) { const a = k * 2.1; pon(g, K.malla(K.roca(0.035, 60 + k), '#7a7068', { grosor: 0.002 }), Math.cos(a) * 0.065, 0.03, Math.sin(a) * 0.065); }
  pon(g, K.malla(K.cilindro(0.1, 0.09, 0.015, 14), '#9a5a36', { grosor: 0.002 }), 0, 0.068, 0);
  [[-0.03, 0.01], [0.035, -0.02]].forEach(([x, z]) => pon(g, K.malla(K.cilindro(0.032, 0.032, 0.006, 10), '#f3e7c4', { sinTinta: true }), x, 0.079, z));
  if (fuego) pon(g, K.malla(K.cono(0.035, 0.05, 6), '#ff9a3a', { emissive: '#ff7a2a', emissiveIntensity: 0.7, sinTinta: true }), 0, 0.03, 0);
  return g;
}
export function olla(K, s = 1, color = '#a8683e') {       // la olla de barro con su boca y su asa
  const g = new THREE.Group(); g.scale.setScalar(s);
  const perfil = [[0.0, 0], [0.05, 0.005], [0.075, 0.04], [0.07, 0.085], [0.045, 0.11], [0.05, 0.13], [0.04, 0.13]].map(([x, y]) => new THREE.Vector2(x, y));
  const geo = propia(new THREE.LatheGeometry(perfil, 12));
  g.add(K.malla(geo, color, { grosor: 0.002 }));
  pon(g, K.malla(K.toro(0.06, 0.006, Math.PI * 2, 0.5), '#2a221c', { sinTinta: true }), 0, 0.075, 0).rotation.x = Math.PI / 2;   // la raya pintada
  return g;
}
export function guajolote(K, s = 1, color = '#3a2e28') {  // el guajolote, con su cola abierta y su moco rojo
  const g = new THREE.Group(); g.scale.setScalar(s);
  const c = K.malla(K.esfera(0.05, 0.6), color, { grosor: 0.002 }); c.scale.set(0.9, 0.85, 1.15); c.position.y = 0.075; g.add(c);
  const cola = K.malla(propia(new THREE.CircleGeometry(0.07, 10, 0, Math.PI)), color, { grosor: 0.002, side: THREE.DoubleSide }); cola.position.set(0, 0.09, -0.05); cola.rotation.x = -0.25; g.add(cola);
  pon(g, K.malla(K.cilindro(0.008, 0.012, 0.06, 5), '#6f8fb0', { sinTinta: true }), 0, 0.13, 0.05);
  pon(g, K.malla(K.esfera(0.016, 0.5), '#7f9fc0', { grosor: 0.001 }), 0, 0.165, 0.055);
  pon(g, K.malla(K.esfera(0.01, 0.4), '#c8392f', { sinTinta: true }), 0, 0.15, 0.07);
  [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.005, 0.005, 0.04, 4), '#c88a5a', { sinTinta: true }), l * 0.02, 0.02, 0));
  return g;
}
export function xolo(K, s = 1) {                          // el xoloitzcuintle: sin pelo, gris oscuro, las orejas paradas
  const g = new THREE.Group(), C = '#4a4648'; g.scale.setScalar(s);
  const c = K.malla(K.capsula(0.03, 0.08, 0.6), C, { grosor: 0.002 }); c.rotation.x = Math.PI / 2; c.position.y = 0.075; g.add(c);
  [[-0.02, 0.04], [0.02, 0.04], [-0.02, -0.04], [0.02, -0.04]].forEach(([x, z]) => pon(g, K.malla(K.cilindro(0.008, 0.007, 0.06, 5), C, { sinTinta: true }), x, 0.03, z));
  pon(g, K.malla(K.esfera(0.028, 0.5), C, { grosor: 0.002 }), 0, 0.105, 0.075);
  pon(g, K.malla(K.cono(0.012, 0.03, 4), C, { grosor: 0.001 }), 0, 0.1, 0.105).rotation.x = Math.PI / 2;
  [-1, 1].forEach(l => pon(g, K.malla(K.cono(0.012, 0.035, 4), C, { grosor: 0.001 }), l * 0.016, 0.14, 0.07));
  const cola = K.malla(K.cilindro(0.004, 0.006, 0.06, 4), C, { sinTinta: true }); cola.position.set(0, 0.09, -0.07); cola.rotation.x = -0.7; g.add(cola);
  return g;
}
export function maguey(K, s = 1, semilla = 1) {           // el maguey: las pencas gruesas, azul verde, abiertas en roseta
  const g = new THREE.Group(); g.scale.setScalar(s);
  for (let k = 0; k < 9; k++) {
    const a = k * 2.4 + semilla, inc = k < 5 ? 0.85 : 0.45, h = k < 5 ? 0.22 : 0.26;
    const p = K.malla(K.cono(0.03, h, 4), k % 2 ? '#7d9a86' : '#6a8a74', { grosor: 0.0015 }); p.scale.set(1, 1, 0.45);
    p.position.set(Math.sin(a) * 0.05, h * 0.38, Math.cos(a) * 0.05); p.rotation.set(inc, a, 0, 'YXZ'); g.add(p);
  }
  return g;
}
export function nopal(K, s = 1) {                         // el nopal con sus tunas rojas
  const g = new THREE.Group(); g.scale.setScalar(s);
  [[0, 0.07, 0, 0.06, 0], [-0.05, 0.16, 0, 0.05, 0.4], [0.055, 0.17, 0, 0.05, -0.35], [0.0, 0.24, 0, 0.045, 0.1]].forEach(([x, y, z, r, rz]) => { const p = K.malla(K.esfera(r, 0.5), '#6a9a4a', { grosor: 0.0015 }); p.scale.set(0.85, 1.15, 0.3); p.position.set(x, y, z); p.rotation.z = rz; g.add(p); });
  [[-0.07, 0.21], [0.08, 0.22], [0.02, 0.29]].forEach(([x, y]) => pon(g, K.malla(K.esfera(0.013, 0.4), '#c8392f', { sinTinta: true }), x, y, 0.012));
  return g;
}
export function milpa(K, n = 8, sep = 0.12, semilla = 3) {   // unas matas de maíz con su elote, en hilera
  const g = new THREE.Group();
  for (let k = 0; k < n; k++) {
    const x = (k % 4) * sep, z = Math.floor(k / 4) * sep, h = 0.24 + ((k * 7 + semilla) % 5) * 0.02;
    pon(g, K.malla(K.cilindro(0.006, 0.009, h, 5), '#7a9a42', { sinTinta: true }), x, h / 2, z);
    [0, 2.1, 4.2].forEach((a, j) => { const hj = K.malla(K.cono(0.016, 0.13, 3), j % 2 ? '#8aaa4a' : '#6f8f3a', { sinTinta: true }); hj.scale.set(1, 1, 0.3); hj.position.set(x + Math.sin(a + k) * 0.03, h * (0.45 + j * 0.15), z + Math.cos(a + k) * 0.03); hj.rotation.set(1.0, a + k, 0, 'YXZ'); g.add(hj); });
    pon(g, K.malla(K.capsula(0.008, 0.025, 0.5), '#e8c45a', { sinTinta: true }), x + 0.012, h * 0.62, z);
  }
  return g;
}
function petateChiles(K) {                                // el petate con los chiles poniéndose al sol
  const g = new THREE.Group();
  pon(g, caja(K, 0.22, 0.01, 0.16, TE.paja, { sinTinta: true, sombra: false }), 0, 0.005, 0);
  for (let k = 0; k < 14; k++) pon(g, K.malla(K.capsula(0.008, 0.02, 0.4), k % 4 ? '#b8352f' : '#d8562a', { sinTinta: true }), -0.08 + (k % 5) * 0.04, 0.016, -0.05 + Math.floor(k / 5) * 0.045).rotation.z = Math.PI / 2;
  return g;
}

/* ---------- LAS CASAS ---------- */
/* la casa de la gente común (macehualtin): adobe sobre el cimiento de piedra, a veces estucada (con el rodapié rojo o la banda),
   el techo plano de vigas y tierra con su pretil y las cabezas de las vigas asomando, la puerta con su dintel de madera y su
   manta; en la azotea, lo que se pone a secar */
function escaleraMano(K, alto) {                          // la escalera de mano para subir a la azotea
  const g = new THREE.Group();
  [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.008, 0.008, alto, 5), TE.madera, { grosor: 0.0012 }), l * 0.045, alto / 2, 0));
  for (let k = 0; k < Math.floor(alto / 0.09); k++) pon(g, K.malla(K.cilindro(0.006, 0.006, 0.1, 4), TE.maderaD, { sinTinta: true }), 0, 0.07 + k * 0.09, 0).rotation.z = Math.PI / 2;
  g.rotation.order = 'YXZ'; g.rotation.x = -0.28; return g;
}
export function casaMacehual(K, { w = 0.72, d = 0.6, h = 0.6, estuco = false, banda: bd = false, rodapie = false, tono = '#cdb48c', manta = '#e8dcc0', ventana = false, escalera = false, azotea = null } = {}) {
  const g = new THREE.Group(), y0 = 0.08;
  pon(g, caja(K, w + 0.04, y0, d + 0.04, TE.piedraD, { grosor: 0.004 }), 0, y0 / 2, 0);
  for (let k = 0; k < Math.round(w / 0.09); k++) pon(g, caja(K, 0.06, 0.035, 0.012, k % 2 ? '#8a7a62' : '#a8977c', { sinTinta: true }), -w / 2 + 0.05 + k * 0.09, 0.04 + (k % 2) * 0.012, d / 2 + 0.021);   // las piedras del cimiento
  const mu = K.malla(K.caja(w, h - y0, d), estuco ? K.mat(TE.estuco) : matRep(K, 'te7-ad-' + tono, texAdobe(tono), Math.max(1, Math.round(w / 0.24)), Math.max(1, Math.round(h / 0.16))), { grosor: 0.005 }); mu.position.y = y0 + (h - y0) / 2; g.add(mu);
  if (rodapie) pon(g, caja(K, w + 0.006, 0.11, d + 0.006, '#b0503a', { sinTinta: true }), 0, y0 + 0.055, 0);
  if (bd) pon(g, caja(K, w + 0.006, 0.045, d + 0.006, TE.rojo, { sinTinta: true }), 0, h - 0.07, 0);
  pon(g, caja(K, w + 0.08, 0.035, d + 0.08, '#8a6a46', { grosor: 0.004 }), 0, h + 0.0175, 0);                  // las vigas y el tablazón
  pon(g, caja(K, w + 0.05, 0.035, d + 0.05, estuco ? TE.estucoL : '#c8ae84', { grosor: 0.003 }), 0, h + 0.052, 0);   // la tierra apisonada (o la cal) de la azotea
  const cp = estuco ? TE.estuco : '#d6be96';                                                                      // el pretil
  [[0, (d + 0.05) / 2 - 0.015, w + 0.05, 0.03], [0, -(d + 0.05) / 2 + 0.015, w + 0.05, 0.03], [(w + 0.05) / 2 - 0.015, 0, 0.03, d - 0.01], [-(w + 0.05) / 2 + 0.015, 0, 0.03, d - 0.01]].forEach(([x, z, a, b]) => pon(g, caja(K, a, 0.045, b, cp, { grosor: 0.0015 }), x, h + 0.09, z));
  const nv = Math.max(3, Math.round(w / 0.12));
  for (let k = 0; k < nv; k++) pon(g, K.malla(K.cilindro(0.016, 0.016, 0.1, 6), TE.maderaD, { grosor: 0.0012 }), -w / 2 + 0.06 + k * (w - 0.12) / (nv - 1), h + 0.012, d / 2 + 0.04).rotation.x = Math.PI / 2;   // las cabezas de las vigas
  const dh = Math.min(0.36, h - 0.16), px = w * 0.18;
  pon(g, caja(K, 0.19, dh, 0.012, '#2a1e18', { sinTinta: true }), px, y0 + dh / 2, d / 2 + 0.004);
  pon(g, caja(K, 0.19, dh * 0.62, 0.008, manta, { sinTinta: true }), px, y0 + dh - dh * 0.31, d / 2 + 0.012);       // la manta, recogida a un lado
  pon(g, caja(K, 0.28, 0.035, 0.035, TE.maderaD, { grosor: 0.0015 }), px, y0 + dh + 0.018, d / 2 + 0.012);          // el dintel
  if (ventana) pon(g, caja(K, 0.09, 0.08, 0.012, '#2a1e18', { sinTinta: true }), -w * 0.26, y0 + (h - y0) * 0.6, d / 2 + 0.004);
  if (escalera) pon(g, escaleraMano(K, h + 0.16), w / 2 + 0.06, 0.0, -d * 0.15, Math.PI / 2);
  if (azotea === 'maiz') { pon(g, caja(K, w * 0.6, 0.008, d * 0.55, TE.paja, { sinTinta: true }), 0, h + 0.074, 0); for (let k = 0; k < 10; k++) pon(g, K.malla(K.capsula(0.012, 0.035, 0.5), k % 3 ? '#e8c45a' : '#c8503a', { sinTinta: true }), -w * 0.24 + (k % 5) * w * 0.12, h + 0.088, -d * 0.12 + Math.floor(k / 5) * d * 0.24).rotation.z = Math.PI / 2; }
  if (azotea === 'ollas') { pon(g, olla(K, 0.9), -w * 0.2, h + 0.07, -d * 0.1); pon(g, olla(K, 0.7, '#b8784a'), w * 0.1, h + 0.07, d * 0.08); }
  return g;
}
/* la casa de los principales (pipiltin): sobre su plataforma, estucada y bruñida, con pórtico de pilares, friso pintado,
   almenas y el patio con su jardín (Sahagún, libro XI: «casas de los señores»; los jardines de Nezahualcóyotl) */
export function casaPilli(K, { w = 1.3, d = 1.05, h = 0.62, friso = 'greca', alto2 = false } = {}) {
  const g = new THREE.Group();
  pon(g, caja(K, w + 0.08, 0.12, d + 0.08, TE.estucoD, { grosor: 0.004 }), 0, 0.06, 0);
  for (let k = 0; k < 2; k++) pon(g, caja(K, 0.34, 0.06 * (2 - k), 0.06, TE.estucoL, { grosor: 0.002 }), w * 0.2, 0.03 * (2 - k), d / 2 + 0.07 + k * 0.06);
  const y0 = 0.12, fondo = d * 0.5;
  pon(g, caja(K, w, h, fondo, TE.estucoL, { grosor: 0.005 }), 0, y0 + h / 2, -d / 2 + fondo / 2);             // los cuartos del fondo
  pon(g, caja(K, w * 0.32, h, d - fondo, TE.estuco, { grosor: 0.005 }), -w / 2 + w * 0.16, y0 + h / 2, d / 2 - (d - fondo) / 2);   // el ala del costado
  for (let k = 0; k < 3; k++) pon(g, caja(K, 0.06, h - 0.02, 0.06, TE.estucoL, { grosor: 0.002 }), -w / 2 + w * 0.32 + 0.12 + k * (w * 0.68 - 0.18) / 2, y0 + h / 2, -d / 2 + fondo + 0.06);   // el pórtico
  pon(g, caja(K, w * 0.68, 0.05, 0.16, TE.estucoL, { grosor: 0.003 }), w * 0.16, y0 + h - 0.0, -d / 2 + fondo + 0.04);
  pon(g, caja(K, 0.2, 0.28, 0.012, '#2a1e18', { sinTinta: true }), w * 0.16, y0 + 0.14, -d / 2 + fondo + 0.002);
  const fr = caja(K, w + 0.01, 0.07, fondo + 0.01, '#ffffff', { grosor: 0.002 }); fr.material = friso === 'greca' ? matRep(K, 'te7-pgr', greca(), Math.round(w / 0.25), 1) : matRep(K, 'te7-pci', texCirculos(), Math.round(w / 0.25), 1); fr.position.set(0, y0 + h - 0.05, -d / 2 + fondo / 2); g.add(fr);
  pon(g, caja(K, w + 0.04, 0.04, fondo + 0.04, TE.estucoL, { grosor: 0.003 }), 0, y0 + h + 0.02, -d / 2 + fondo / 2);
  pon(g, caja(K, w * 0.32 + 0.04, 0.04, d - fondo + 0.02, TE.estucoL, { grosor: 0.003 }), -w / 2 + w * 0.16, y0 + h + 0.02, d / 2 - (d - fondo) / 2);
  const nm = Math.round(w / 0.14); for (let k = 0; k < nm; k++) pon(g, caja(K, 0.05, 0.06, 0.04, TE.estucoL, { grosor: 0.0015 }), -w / 2 + 0.05 + k * (w - 0.1) / (nm - 1), y0 + h + 0.07, -d / 2 + fondo - 0.02);
  if (alto2) {                                            // el cuarto de arriba, sobre la azotea
    pon(g, caja(K, w * 0.4, h * 0.6, fondo * 0.8, TE.estuco, { grosor: 0.004 }), w * 0.22, y0 + h + 0.04 + h * 0.3, -d / 2 + fondo * 0.45);
    pon(g, caja(K, w * 0.4 + 0.04, 0.04, fondo * 0.8 + 0.04, TE.estucoL, { grosor: 0.003 }), w * 0.22, y0 + h + 0.06 + h * 0.6, -d / 2 + fondo * 0.45);
    pon(g, caja(K, w * 0.404, 0.04, fondo * 0.804, TE.rojo, { sinTinta: true }), w * 0.22, y0 + h + h * 0.5, -d / 2 + fondo * 0.45);
  }
  /* el patio con su jardín: las flores (cempasúchil, dalias) y un árbol chico */
  const jx = w * 0.16, jz = d / 2 - (d - fondo) / 2 + 0.02;
  pon(g, caja(K, w * 0.6, 0.02, (d - fondo) * 0.7, '#7aa04a', { sinTinta: true, sombra: false }), jx, y0 + 0.01, jz);
  for (let k = 0; k < 9; k++) pon(g, K.malla(K.esfera(0.022, 0.4), ['#f2a13a', '#e8c43a', '#d8506a'][k % 3], { sinTinta: true }), jx - w * 0.26 + (k % 5) * w * 0.12, y0 + 0.035, jz - 0.08 + Math.floor(k / 5) * 0.14);
  const ar = new THREE.Group(); ar.position.set(jx + w * 0.18, y0, jz); g.add(ar);
  pon(ar, K.malla(K.cilindro(0.015, 0.02, 0.2, 6), TE.madera, { grosor: 0.0015 }), 0, 0.1, 0);
  pon(ar, K.malla(K.esfera(0.11, 0.6), '#5f8a3a', { grosor: 0.003 }), 0, 0.25, 0);
  pon(ar, K.malla(K.esfera(0.06, 0.5), '#7fa64e', { grosor: 0.002 }), 0.04, 0.3, 0.05);
  return g;
}
/* el jacal de la chinampa: muros de bajareque (carrizo y lodo) y techo de zacate en cuatro aguas, con su alero */
export function jacal(K, { w = 0.62, d = 0.5, h = 0.4, techo = 0.44, color = null } = {}) {
  const g = new THREE.Group();
  pon(g, caja(K, w + 0.03, 0.04, d + 0.03, '#8a7a62', { grosor: 0.003 }), 0, 0.02, 0);
  const mu = K.malla(K.caja(w, h, d), color ? K.mat(color) : matRep(K, 'te7-baj', texBajareque(), Math.max(1, Math.round(w / 0.3)), 1), { grosor: 0.005 }); mu.position.y = 0.04 + h / 2; g.add(mu);
  pon(g, caja(K, 0.13, h * 0.75, 0.012, '#2a1e18', { sinTinta: true }), -w * 0.15, 0.04 + h * 0.375, d / 2 + 0.004);
  const r = Math.hypot(w + 0.14, d + 0.14) / 2, t = K.malla(propia(new THREE.ConeGeometry(r, techo, 4, 1)), matRep(K, 'te7-zac-j', texZacate(), 3, 1), { grosor: 0.004 });
  t.rotation.y = Math.PI / 4; t.scale.set((w + 0.14) / (r * Math.SQRT2), 1, (d + 0.14) / (r * Math.SQRT2)); t.position.y = 0.04 + h + techo / 2 - 0.01; g.add(t);
  pon(g, K.malla(K.cono(0.03, 0.06, 5), '#a8843e', { grosor: 0.0015 }), 0, 0.04 + h + techo + 0.01, 0);
  return g;
}
/* el cuexcomatl: el granero de barro en forma de olla, sobre su base de piedras, con el sombrero de zacate */
export function cuexcomatl(K, s = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s);
  pon(g, K.malla(K.cilindro(0.15, 0.16, 0.05, 12), '#8a7a62', { grosor: 0.002 }), 0, 0.025, 0);
  const perfil = [[0.0, 0], [0.09, 0.0], [0.15, 0.12], [0.16, 0.22], [0.13, 0.3], [0.0, 0.3]].map(([x, y]) => new THREE.Vector2(x, y));
  const cu = K.malla(propia(new THREE.LatheGeometry(perfil, 14)), '#b89a72', { grosor: 0.003 }); cu.position.y = 0.05; g.add(cu);
  [0, 0.06, 0.12].forEach((y, k) => { const c = K.malla(propia(new THREE.ConeGeometry(0.2 - k * 0.03, 0.12, 14, 1, true)), matRep(K, 'te7-zac-q', texZacate(), 4, 1), { grosor: 0.003 }); c.position.y = 0.36 + y; g.add(c); });
  pon(g, K.malla(K.cono(0.06, 0.1, 8), '#a8843e', { grosor: 0.002 }), 0, 0.53, 0);
  return g;
}
/* el temazcal: el baño de vapor, una cúpula baja de piedra y lodo con su puertita y el fogón al costado */
export function temazcal(K, s = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s);
  const d = K.malla(K.esfera(0.2, 0.7), '#a8957a', { grosor: 0.003 }); d.scale.set(1.1, 0.62, 1); g.add(d);
  pon(g, caja(K, 0.08, 0.08, 0.02, '#2a1e18', { sinTinta: true }), 0, 0.04, 0.195);
  pon(g, K.malla(K.cilindro(0.06, 0.07, 0.08, 8), '#8a7a62', { grosor: 0.002 }), 0.2, 0.04, -0.05);
  return g;
}
/* LOS ÁRBOLES DEL LAGO */
/* el ahuejote (Salix bonplandiana): el sauce alto y angosto de las chinampas, que sujeta la tierra con sus raíces */
export function ahuejote(K, s = 1, semilla = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s);
  const h = 0.95 + ((semilla * 37) % 10) * 0.03;
  pon(g, K.malla(K.cilindro(0.02, 0.03, h * 0.55, 6), '#6a5236', { grosor: 0.002 }), 0, h * 0.275, 0);
  const c = K.malla(K.esfera(0.12, 0.7), semilla % 2 ? '#6f9a48' : '#7aa64e', { grosor: 0.005 }); c.scale.set(1, 3.4, 1); c.position.y = h * 0.62; g.add(c);
  const c2 = K.malla(K.esfera(0.08, 0.6), '#94bc62', { grosor: 0.003 }); c2.scale.set(1, 2.6, 1); c2.position.set(0.035, h * 0.72, 0.04); g.add(c2);
  return g;
}
/* el ahuehuete (Taxodium mucronatum): el árbol viejo del valle, de tronco enorme y copa ancha (los de Chapultepec) */
export function ahuehuete(K, s = 1, semilla = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s);
  pon(g, K.malla(K.cilindro(0.06, 0.1, 0.42, 8), '#7a5e44', { grosor: 0.003 }), 0, 0.21, 0);
  [[0, 0.62, 0, 0.3, '#4f7a3a'], [0.2, 0.52, 0.06, 0.2, '#5f8a42'], [-0.18, 0.55, -0.05, 0.21, '#46703a'], [0.04, 0.8, 0.02, 0.2, '#6a9648']].forEach(([x, y, z, r, c], k) => { const m = K.malla(K.esfera(r, 0.7), c, { grosor: 0.005 }); m.scale.set(1, 0.78, 1); m.position.set(x * (1 + (semilla % 3) * 0.1), y, z); g.add(m); });
  return g;
}

/* ---------- EL BARRIO: cada idioma de casa, como un grupito de cuatro a seis casas distintas, con lo de afuera ---------- */
/* 'macehual' (los cuartos de la gente común alrededor del patio), 'pilli' (las casas de los principales, con su jardín) o
   'chinampa' (los jacales sobre la huerta flotante, con su granero, su temazcal, sus ahuejotes y su canoa) */
export function barrio(K, variante = VARIANTES.casas, { suelo = true } = {}) {
  const g = new THREE.Group(), en = (o, x, z, ry = 0) => { o.position.set(x, 0, z); o.rotation.y = ry; g.add(o); return o; };
  if (variante === 'macehual') {
    pon(g, caja(K, 1.35, 0.008, 1.15, '#e2d0a6', { sinTinta: true, sombra: false }), 0.05, 0.004, 0.1);   // el patio barrido
    en(casaMacehual(K, { w: 0.84, d: 0.62, h: 0.62, tono: '#cdb48c', azotea: 'maiz' }), -0.62, -0.9);
    en(casaMacehual(K, { w: 0.68, d: 0.58, h: 0.6, estuco: true, banda: true, rodapie: true, manta: '#3f7fb8', ventana: true }), 0.55, -0.92);
    en(casaMacehual(K, { w: 0.72, d: 0.56, h: 0.56, tono: '#d8c09a', escalera: true }), 1.25, 0.18, -Math.PI / 2);
    en(casaMacehual(K, { w: 0.62, d: 0.54, h: 0.68, estuco: true, manta: '#b8352f', azotea: 'ollas' }), -1.25, 0.28, Math.PI / 2);
    en(casaMacehual(K, { w: 0.58, d: 0.5, h: 0.52, tono: '#c4a47c', ventana: true }), 0.32, 1.25, Math.PI);
    const ra = new THREE.Group(); en(ra, -0.4, 0.82);   // la cocina de ramada, con el metate y el comal
    [[-0.24, -0.18], [0.24, -0.18], [-0.24, 0.18], [0.24, 0.18]].forEach(([x, z]) => pon(ra, K.malla(K.cilindro(0.014, 0.017, 0.42, 5), TE.madera, { grosor: 0.0012 }), x, 0.21, z));
    pon(ra, K.malla(K.caja(0.6, 0.04, 0.48), matRep(K, 'te7-zac-r2', texZacate(), 2, 1), { grosor: 0.003 }), 0, 0.43, 0);
    en(metate(K), -0.48, 0.76, 0.5); en(comal(K), -0.22, 0.88);
    en(olla(K, 1.3), -0.66, 1.08); en(olla(K, 0.9, '#b8784a'), -0.55, 1.15); en(olla(K, 1.6, '#9a5a36'), 0.7, -0.45);
    en(guajolote(K, 1.1), 0.3, 0.25, 0.8); en(guajolote(K, 0.9, '#4a3a30'), 0.48, 0.45, -1.2); en(xolo(K, 1.1), -0.05, -0.25, 2.2);
    en(maguey(K, 1.3, 1), 1.5, -0.7); en(maguey(K, 1.0, 3), 1.35, 1.0); en(nopal(K, 1.2), -1.5, -0.5);
    en(petateChiles(K), 0.68, 0.62, 0.3); en(cuexcomatl(K, 0.85), 0.95, 0.95);
    en(milpa(K, 8, 0.12, 2), -1.55, 0.95); en(temazcal(K, 1), -0.05, 1.35);
  } else if (variante === 'pilli') {
    en(casaPilli(K, { w: 1.3, d: 1.05, h: 0.64, alto2: true }), -0.62, -0.52);
    en(casaPilli(K, { w: 1.1, d: 0.95, h: 0.58, friso: 'circulos' }), 0.9, -0.55, -Math.PI / 2);
    en(casaMacehual(K, { w: 0.6, d: 0.5, h: 0.54, estuco: true, banda: true, ventana: true }), -0.95, 0.9, Math.PI / 2);   // los cuartos de los que servían
    en(casaMacehual(K, { w: 0.54, d: 0.48, h: 0.5, tono: '#d8c09a', escalera: true }), 0.1, 1.05, Math.PI);
    pon(g, caja(K, 0.9, 0.012, 0.5, '#7aa04a', { sinTinta: true, sombra: false }), 0.45, 0.006, 0.5);   // la huerta de flores
    for (let k = 0; k < 14; k++) pon(g, K.malla(K.esfera(0.025, 0.4), ['#f2a13a', '#e8c43a', '#d8506a', '#f2ead8'][k % 4], { sinTinta: true }), 0.1 + (k % 7) * 0.11, 0.03, 0.4 + Math.floor(k / 7) * 0.18);
    en(ahuehuete(K, 0.75, 2), 1.15, 0.85); en(maguey(K, 1.0, 2), -0.2, 0.55); en(olla(K, 1.4, '#a8683e'), 0.05, 0.25); en(guajolote(K, 1.0), -0.35, 0.3, 1.0);
    for (let k = 0; k < 6; k++) pon(g, caja(K, 0.3, 0.12, 0.05, TE.estuco, { grosor: 0.002 }), -1.25 + k * 0.32 + (k > 2 ? 0.55 : 0), 0.06, 1.42);   // el murete del frente
  } else {
    /* la chinampa: la huerta de tierra entre canales, con sus estacas y sus ahuejotes */
    const CH = new THREE.Group(); g.add(CH);
    const tierra = (w, d, x, z) => { pon(CH, caja(K, w, 0.08, d, '#7a6248', { grosor: 0.004 }), x, -0.02, z); pon(CH, caja(K, w - 0.02, 0.012, d - 0.02, '#8fb35a', { sinTinta: true, sombra: false }), x, 0.026, z); };
    if (suelo) tierra(2.6, 0.95, 0, -0.55), tierra(2.6, 0.75, 0, 0.75);
    if (suelo) for (let k = 0; k < 9; k++) [[-0.55 - 0.475], [0.75 + 0.375]].forEach(([z]) => pon(CH, K.malla(K.cilindro(0.01, 0.01, 0.12, 4), TE.maderaD, { sinTinta: true }), -1.25 + k * 0.31, 0.0, z));
    en(jacal(K, { w: 0.66, d: 0.52, h: 0.42, techo: 0.46 }), -0.72, -0.6);
    en(jacal(K, { w: 0.52, d: 0.46, h: 0.36, techo: 0.4 }), 0.08, -0.68, 0.0);
    en(jacal(K, { w: 0.58, d: 0.46, h: 0.38, techo: 0.42, color: '#e8dcc4' }), 0.95, 0.72, Math.PI);
    en(cuexcomatl(K, 1.0), 0.75, -0.6); en(temazcal(K, 0.9), -1.05, 0.7);
    en(milpa(K, 12, 0.11, 5), -0.55, 0.55); en(milpa(K, 8, 0.11, 7), 0.15, 0.6);
    [-1.2, -0.3, 0.55, 1.2].forEach((x, k) => en(ahuejote(K, 1.0, k + 1), x, -1.0));
    en(ahuejote(K, 0.9, 7), 1.25, 1.1);
    en(olla(K, 1.2), -0.35, -0.3); en(guajolote(K, 1.0), 0.35, -0.3, 0.6); en(petateChiles(K), 0.45, 0.2, -0.2);
    if (suelo) { const ca = canoa(K, { carga: 'maiz' }); ca.position.set(-0.4, -0.03, 0.12); g.add(ca); }   // por el canal de en medio
  }
  return g;
}
