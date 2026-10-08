/* ============================================================
   alejandria/monumentos
   Las piezas grandes de Alejandría (Época 5, siglo III a. C. al IV d. C.) en 3D, en variantes para la hoja de
   bocetos (juego3d/bocetos/alejandria.html): el Faro, el Museo con la Biblioteca, el Serapeo y los barcos. La
   elegida por el usuario se fija en VARIANTES y es la que usa la época.
   EL CUIDADO (la vara de siempre: que los alejandrinos estén orgullosos de nosotros):
   - El Faro de Sóstrato de Cnido (hacia 297-280 a. C.): tres cuerpos, cuadrado, octogonal y cilíndrico, como lo
     reconstruyó Thiersch (1909) desde las monedas romanas de Alejandría y las descripciones árabes; los tritones
     que soplan caracolas en las esquinas, la estatua de arriba (Zeus Salvador, probablemente) y el fuego. La
     dedicatoria la copia Luciano (Cómo debe escribirse la historia, 62): «Sóstrato, hijo de Dexífanes, de Cnido,
     a los dioses salvadores, por los navegantes». Al pie había colosos de granito de un Ptolomeo como faraón y
     de su reina como Isis (los sacó del agua Jean-Yves Empereur en 1995).
   - Del Museo solo se sabe lo que dice Estrabón (XVII 1, 8): un paseo, una exedra con asientos y una gran casa
     donde los sabios comían juntos. De la Biblioteca no queda nada: la de Pérgamo, su rival, sí (una sala con
     nichos para los rollos y la estatua de Atenea). Ptolomeo IV le levantó un templo a Homero (Eliano, Historias
     varias XIII 22). Los rollos llevaban colgando su etiqueta, el sillybos.
   - El Serapeo, en la colina de Racotis: el templo de Serapis de Ptolomeo III con la biblioteca hija en sus
     pórticos; los romanos lo rehicieron grande, con «cien escalones» (Rufino, Historia eclesiástica II 23), y en
     297 d. C. levantaron ahí la columna de granito rojo que sigue en pie. La estatua de Serapis (de Briaxis)
     era oscura, con el cesto del grano en la cabeza y Cerbero a los pies.
   - Los barcos: el gran navío del grano (Luciano, El navío: la popa en cuello de cisne dorado), el mercante
     griego con el ojo pintado en la proa, y la barca del puerto: los hombres del rey revisaban los barcos y se
     llevaban los libros para copiarlos (Galeno, Comentario a las Epidemias III de Hipócrates, II 4).
   Escala: 1 = una baldosa; una persona adulta mide ~0,9. El frente de cada pieza mira a +z. Los barcos van a
   la escala del juego, más chicos que los reales.
   ============================================================ */
import * as THREE from 'three';
import { tronco, escalera, palmera } from '../sumer/monumentos.js';
import { esfinge } from '../egipto/monumentos.js';
import { crearPersona } from '../actores.js';
import { AT, pon, caja, propia, textura, matTex, lamina, estrias, entablamento, tejado, palmeta, grabado, columnaJonica, columnaDorica, figura, estatua, templo, altar, anfora } from '../agora/monumentos.js';

export const AL = {
  caliza: '#ebdfc4', calizaL: '#f5eedd', calizaD: '#d3c3a0', calizaS: '#b9a886',     // la caliza blanca de la costa, revocada
  granito: '#a9574d', granitoD: '#86443c', granitoL: '#c0716a', gris: '#7f7c7a',       // el granito rojo de Asuán y el gris
  mar: '#3f8bb5', marD: '#2f6f96', marL: '#69a9cc', espuma: '#e9f3f6',
  roca: '#b8ad98', rocaD: '#968a74', rocaL: '#cfc5b0',
  madera: '#8a6038', maderaD: '#6a4628', maderaL: '#b08250', brea: '#3a2c22',
  vela: '#efe7d2', velaD: '#ddd2b8', cuerda: '#c9b38a',
  oro: '#e6bb4c', bronce: '#a2733b', serapis: '#3d4656',
  pintado: '#2f5fa8', rojo: '#a8392b', ocre: '#d9a640', verde: '#4f7f4a',
  rollo: '#efe4c8', rolloD: '#d9c9a2', etiqueta: '#b5533c',
};
export const VARIANTES = { faro: 'sostrato', museo: 'estrabon', serapeo: 'romano', barco: 'libros' };   // elegidas por el usuario el 2026-10-03 («AABB»): el Faro de Sóstrato, el Museo de Estrabón, el Serapeo de los romanos y el mercante que trae libros

/* ---------- texturas propias ---------- */
function matRep(K, clave, w, h, pinta, ru = 1, rv = 1) {
  const t = textura(clave, w, h, pinta, { repetir: true });
  if (ru === 1 && rv === 1) return matTex(K, clave, t);
  const c = t.clone(); c.needsUpdate = true; c.repeat.set(ru, rv);
  return matTex(K, `${clave}_${ru}_${rv}`, c);
}
/* el sillar del Faro: hiladas de caliza con sus juntas y las ventanas angostas que daban luz a la rampa interior */
function sillarFaro(K, { cols = 3, filas = 5, clave = 'sillarFaro' } = {}) {
  return matRep(K, clave + cols + filas, 128, 256, (g, w, h) => {
    g.fillStyle = AL.caliza; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 12) {
      g.fillStyle = 'rgba(150,130,95,.35)'; g.fillRect(0, y, w, 1.5);
      for (let x = ((y / 12) % 2) * 14; x < w; x += 28) g.fillRect(x, y, 1.5, 12);
      g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, y + 2, w, 2);
    }
    for (let j = 0; j < filas; j++) for (let i = 0; i < cols; i++) {
      const x = w * (i + 0.5) / cols, y = h * (j + 0.55) / filas;
      g.fillStyle = '#3b3128'; g.fillRect(x - 4, y - 10, 8, 20);
      g.fillStyle = AL.calizaD; g.fillRect(x - 6, y + 10, 12, 3);
    }
  });
}
/* los nichos de la biblioteca: los armarios de madera con los rollos apilados, cada uno con su etiqueta colgando */
export function nichos(K, cols = 4, filas = 3) {
  return matRep(K, `nichos${cols}${filas}`, 64 * cols, 72 * filas, (g, w, h) => {
    g.fillStyle = AL.maderaD; g.fillRect(0, 0, w, h);
    for (let j = 0; j < filas; j++) for (let i = 0; i < cols; i++) {
      const x0 = i * 64 + 5, y0 = j * 72 + 6, cw = 54, ch = 60;
      g.fillStyle = '#2a1f17'; g.fillRect(x0, y0, cw, ch);
      let k = 0;
      for (let fy = 0; fy < 4; fy++) for (let fx = 0; fx < 4 - (fy % 2); fx++) {
        const cx = x0 + 9 + fx * 12 + (fy % 2) * 6, cy = y0 + ch - 9 - fy * 12;
        g.fillStyle = (i + j + k) % 3 ? AL.rollo : AL.rolloD; g.beginPath(); g.arc(cx, cy, 5.6, 0, 7); g.fill();
        g.fillStyle = '#8a7650'; g.beginPath(); g.arc(cx, cy, 1.6, 0, 7); g.fill();
        if ((i * 7 + j * 3 + k) % 3 === 0) { g.fillStyle = [AL.etiqueta, AL.ocre, AL.pintado][(i + k) % 3]; g.fillRect(cx - 2, cy + 4, 4, 7); }   // el sillybos
        k++;
      }
      g.fillStyle = AL.maderaL; g.fillRect(x0 - 2, y0 + ch, cw + 4, 4);
    }
  });
}
/* el mar: el agua con sus ondas, y el corte de la losa debajo */
function aguaMat(K) {
  return matRep(K, 'olas', 128, 128, (g, w, h) => {
    g.fillStyle = AL.mar; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { const y = (i * 37) % h, x = (i * 53) % w; g.strokeStyle = i % 2 ? 'rgba(255,255,255,.35)' : 'rgba(30,80,120,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 10, y - 4, x + 20, y); g.stroke(); }
  }, 4, 4);
}

/* ---------- las piezas del orden ---------- */
/* La columna corintia, la de Alejandría: basa, fuste estriado y el capitel de hojas de acanto con sus volutas. */
export function columnaCorintia(K, alto, r, { color = AL.calizaL, gr = 0.004 } = {}) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(r * 1.3, r * 1.45, alto * 0.05, 14), color, { grosor: gr }), 0, alto * 0.025, 0);
  pon(g, K.malla(K.cilindro(r * 0.88, r, alto * 0.8, 14), estrias(K, color), { grosor: gr }), 0, alto * 0.05 + alto * 0.4, 0);
  const yc = alto * 0.85;
  pon(g, K.malla(K.cilindro(r * 1.35, r * 0.95, alto * 0.12, 12), color, { grosor: gr }), 0, yc + alto * 0.06, 0);   // la campana
  for (let fila = 0; fila < 2; fila++) for (let i = 0; i < 8; i++) {                    // dos coronas de acanto
    const a = (i + fila * 0.5) / 8 * Math.PI * 2, rr = r * (1.0 + fila * 0.18);
    const h = K.malla(K.capsula(r * 0.2, alto * 0.05, 0.4), color, { grosor: gr * 0.6 });
    h.position.set(Math.cos(a) * rr, yc + alto * (0.035 + fila * 0.04), Math.sin(a) * rr); h.rotation.set(Math.sin(a) * 0.35, 0, -Math.cos(a) * 0.35); g.add(h);
  }
  for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + i * Math.PI / 2; const v = K.malla(K.esfera(r * 0.24, 0.5), color, { grosor: gr * 0.6 }); v.position.set(Math.cos(a) * r * 1.3, yc + alto * 0.11, Math.sin(a) * r * 1.3); g.add(v); }
  pon(g, caja(K, r * 2.9, alto * 0.03, r * 2.9, color, { grosor: gr }), 0, alto * 0.985, 0);
  return g;
}
/* una persona de Alejandría: griego de quitón y manto; el sabio lleva su rollo */
export const alejandrino = (K, { manto = '#3f6b8a', barba = true, rollo = false, piel = 1 } = {}) => {
  const p = crearPersona(K, { piel, pelo: 'rizos', colorPelo: '#3a2a1e', barba, ropa: 'tunica', colorRopa: AT.quiton, orla: AL.ocre, chal: manto });
  if (rollo) p.sostener(rolloSuelto(K), 'D');
  p.anim(0, { pose: 'quieto', instantaneo: true });
  return p;
};
export function rolloSuelto(K, largo = 0.16) {
  const g = new THREE.Group();
  const r = K.malla(K.cilindro(0.022, 0.022, largo, 8), AL.rollo, { grosor: 0.003 }); r.rotation.z = Math.PI / 2; g.add(r);
  [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.008, 0.008, 0.02, 6), AL.maderaD, { sinTinta: true }), l * (largo / 2 + 0.008), 0, 0).rotation.z = Math.PI / 2);
  pon(g, caja(K, 0.02, 0.04, 0.004, AL.etiqueta, { sinTinta: true }), 0.03, -0.03, 0.02);   // el sillybos
  return g;
}
/* la capsa: el cubo de cuero donde se llevaban los rollos parados, con su tapa */
export function capsa(K, s = 1) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.075 * s, 0.07 * s, 0.13 * s, 10), '#8a5a32', { grosor: 0.004 }), 0, 0.065 * s, 0);
  pon(g, K.malla(K.cilindro(0.077 * s, 0.077 * s, 0.015 * s, 10), '#6a4226', { sinTinta: true }), 0, 0.03 * s, 0);
  for (let i = 0; i < 6; i++) { const a = i * 1.05; pon(g, K.malla(K.cilindro(0.017 * s, 0.017 * s, 0.06 * s, 6), i % 2 ? AL.rollo : AL.rolloD, { sinTinta: true }), Math.cos(a) * 0.04 * s, 0.15 * s, Math.sin(a) * 0.04 * s); }
  return g;
}
/* un pórtico que mira hacia adentro de un patio: columnas al frente (+z), muro atrás con los nichos si es biblioteca */
function porticoPatio(K, largo, prof, H, cols, { corintio = false, libros = false, color = AL.caliza } = {}) {
  const g = new THREE.Group(), r = 0.045;
  pon(g, caja(K, largo, 0.08, prof, AL.calizaD, { grosor: 0.005 }), 0, 0.04, 0);
  pon(g, caja(K, largo, H, 0.08, color, { grosor: 0.006 }), 0, 0.08 + H / 2, -prof / 2 + 0.04);
  if (libros) {
    const n = Math.max(1, Math.floor(largo / 0.9));
    for (let i = 0; i < n; i++) { const p = lamina(K, nichos(K, 3, 2), 0.62, 0.48); p.position.set(-largo / 2 + (i + 0.5) * largo / n, 0.08 + H * 0.45, -prof / 2 + 0.082); g.add(p); }
  }
  for (let i = 0; i < cols; i++) {
    const c = (corintio ? columnaCorintia : columnaJonica)(K, H, r, { gr: 0.003 }); c.position.set(-largo / 2 + 0.06 + i * (largo - 0.12) / (cols - 1), 0.08, prof / 2 - 0.06); g.add(c);
  }
  const techo = caja(K, largo + 0.06, 0.04, prof + 0.12, AT.teja, { grosor: 0.005 }); techo.position.set(0, 0.08 + H + 0.09, 0); techo.rotation.x = 0.16; g.add(techo);
  pon(g, caja(K, largo + 0.04, 0.07, 0.07, AL.calizaL, { grosor: 0.004 }), 0, 0.08 + H + 0.035, prof / 2 - 0.06);   // el arquitrabe
  return g;
}
/* el patio con pórticos en los cuatro lados (el peristilo) */
function peristilo(K, W, D, H, { prof = 0.42, corintio = true, libros = [] } = {}) {
  const g = new THREE.Group();
  [[0, -D / 2 + prof / 2, 0, W, 'n'], [0, D / 2 - prof / 2, Math.PI, W, 's'], [-W / 2 + prof / 2, 0, Math.PI / 2, D - prof * 2, 'o'], [W / 2 - prof / 2, 0, -Math.PI / 2, D - prof * 2, 'e']].forEach(([x, z, ry, L, lado]) => {
    const p = porticoPatio(K, L, prof, H, Math.max(3, Math.round(L / 0.34)), { corintio, libros: libros.includes(lado) }); p.position.set(x, 0, z); p.rotation.y = ry; g.add(p);
  });
  return g;
}
/* el templo de frente con columnas (próstilo) sobre su podio: corintio a lo romano o jónico a lo griego */
function temploFrente(K, { W = 1.0, L = 1.5, cols = 4, H = 0.8, orden = 'corintio', podio = 0.25, color = AL.calizaL, tema = 'liso', puerta = true } = {}) {
  const g = new THREE.Group(), r = W / cols * 0.2;
  pon(g, caja(K, W + 0.12, podio, L + 0.1, AL.calizaD, { grosor: 0.006 }), 0, podio / 2, 0);
  const esc = escalera(K, { largo: 0.32, alto: podio, ancho: W * 0.7, n: 5, color: AL.calizaD, baranda: null }); esc.position.set(0, 0, L / 2 + 0.05 + 0.32); g.add(esc);
  const cel = caja(K, W - 0.08, H, L * 0.62, color, { grosor: 0.006 }); cel.position.set(0, podio + H / 2, -L * 0.17); g.add(cel);
  if (puerta) pon(g, caja(K, W * 0.26, H * 0.62, 0.01, '#33281e', { sinTinta: true }), 0, podio + H * 0.31, -L * 0.17 + L * 0.31 + 0.006);
  const fn = orden === 'corintio' ? columnaCorintia : orden === 'dorico' ? columnaDorica : columnaJonica;
  for (let i = 0; i < cols; i++) { const c = fn(K, H, r, { gr: 0.003 }); c.position.set(-W / 2 + 0.07 + i * (W - 0.14) / (cols - 1), podio, L / 2 - 0.07); g.add(c); }
  [-1, 1].forEach(l => { const c = fn(K, H, r, { gr: 0.003 }); c.position.set(l * (W / 2 - 0.07), podio, L / 2 - 0.3); g.add(c); });
  const en = entablamento(K, W, L, H * 0.24, { nx: cols * 2 - 2, nz: 6, jonico: orden !== 'dorico', gr: 0.004 }); en.position.y = podio + H; g.add(en);
  const te = tejado(K, W + 0.02, L + 0.02, W * 0.16, { tipo: 'teja', tema, acrotera: palmeta(K, W * 0.08), gr: 0.004 }); te.position.y = podio + H + H * 0.24; g.add(te);
  g.userData.alto = podio + H * 1.24 + W * 0.16;
  return g;
}

/* ---------- EL FARO ---------- */
/* un tritón de bronce que sopla su caracola: el torso de hombre, la cola de pez enroscada */
function triton(K, s = 1) {
  const g = new THREE.Group();
  const cuerpo = figura(K, 0.3 * s, { color: AL.bronce, gr: 0.003 }); cuerpo.position.y = 0.06 * s; g.add(cuerpo);
  const cola = K.malla(K.toro(0.07 * s, 0.026 * s, Math.PI * 1.3, 0.6), AL.bronce, { grosor: 0.003 }); cola.rotation.set(0, Math.PI / 2, 0); cola.position.set(0, 0.07 * s, -0.03 * s); g.add(cola);
  const aleta = K.malla(K.cono(0.04 * s, 0.07 * s, 4), AL.bronce, { grosor: 0.003 }); aleta.position.set(0, 0.1 * s, -0.1 * s); aleta.rotation.x = -2.2; g.add(aleta);
  const car = K.malla(K.cono(0.03 * s, 0.13 * s, 7), AL.oro, { grosor: 0.003, emissive: AL.oro, emissiveIntensity: 0.15 }); car.position.set(0.02 * s, 0.33 * s, 0.07 * s); car.rotation.x = -0.6; g.add(car);   // la caracola, alzada
  return g;
}
/* el fuego de arriba: llamas que se animan (userData.llama) */
function fuego(K, s = 1) {
  const g = new THREE.Group(); g.userData.vivo = true;
  [[0.11, 0.34, '#f6a23c', 0, 0], [0.08, 0.26, '#ff7a2a', 0.05, 0.03], [0.07, 0.22, '#f8dc8c', -0.04, -0.02]].forEach(([r, h, c, x, z]) => {
    const m = K.malla(K.cono(r * s, h * s, 7), c, { emissive: c, emissiveIntensity: 0.95, sombra: false, grosor: 0.006 }); m.position.set(x * s, h * s / 2, z * s); m.userData.llama = true; g.add(m);
  });
  return g;
}
/* el coloso de granito al pie del Faro: el rey como faraón o la reina como Isis, de pie, el pie izquierdo adelante */
function colosoPtolemaico(K, reina = false, s = 0.95) {
  const p = crearPersona(K, { piel: 0, pelo: reina ? 'peluca' : 'rapado', ropa: reina ? 'tunica' : 'corta', colorRopa: AL.granito, corona: reina ? null : 'doble', torsoDesnudo: !reina });
  p.anim(0, { pose: 'quieto', instantaneo: true });
  const mat = K.mat(AL.granito);
  p.obj.traverse(o => { if (o.isMesh && !o.userData.tinta && o.material && o.material.visible !== false) o.material = mat; });
  p.obj.scale.setScalar(s);
  const g = new THREE.Group(); g.add(p.obj);
  pon(g, caja(K, 0.36 * s, 0.14, 0.36 * s, AL.granitoD, { grosor: 0.005 }), 0, -0.07, 0); p.obj.position.y = 0;
  if (reina) {                                             // la corona de Isis: los cuernos de vaca y el disco del sol
    const cr = new THREE.Group(); cr.position.y = 0.98 * s; g.add(cr);
    pon(cr, K.malla(K.cilindro(0.05 * s, 0.05 * s, 0.015, 12), AL.granitoL, { grosor: 0.003 }), 0, 0.09 * s, 0).rotation.x = Math.PI / 2;
    const cu = K.malla(K.toro(0.06 * s, 0.01 * s, Math.PI, 0.5), AL.granitoD, { grosor: 0.002 }); cu.position.y = 0.06 * s; cr.add(cu);
  }
  g.position.y = 0.14;
  return g;
}
/* El Faro de Sóstrato: devuelve el grupo con el origen al pie, al centro */
function torreFaro(K, { escala = 1, monedas = false } = {}) {
  const g = new THREE.Group(), s = escala;
  // el podio con su patio cercado: muro bajo y torrecillas en las esquinas
  const P = 2.7 * s;
  pon(g, caja(K, P, 0.22 * s, P, AL.calizaD, { grosor: 0.008 }), 0, 0.11 * s, 0);
  const M = 3.3 * s, hm = 0.38 * s;
  [[0, -M / 2, M, 0.1 * s], [0, M / 2, M, 0.1 * s], [-M / 2, 0, 0.1 * s, M], [M / 2, 0, 0.1 * s, M]].forEach(([x, z, w, d], i) => {
    if (i === 1) { [-1, 1].forEach(l => pon(g, caja(K, w * 0.38, hm, d, AL.caliza, { grosor: 0.006 }), l * w * 0.31, hm / 2, z)); return; }   // la puerta del patio, al frente
    pon(g, caja(K, w, hm, d, AL.caliza, { grosor: 0.006 }), x, hm / 2, z);
  });
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { pon(g, K.malla(K.cilindro(0.13 * s, 0.15 * s, 0.4 * s, 10), AL.caliza, { grosor: 0.006 }), a * M / 2, 0.2 * s, b * M / 2); pon(g, K.malla(K.cono(0.16 * s, 0.12 * s, 10), AL.calizaD, { grosor: 0.005 }), a * M / 2, 0.46 * s, b * M / 2); });
  const y0 = 0.22 * s;
  // el primer cuerpo: cuadrado, un poco ahusado, con sus ventanas
  const w0 = (monedas ? 1.75 : 1.45) * s, w1 = (monedas ? 1.55 : 1.28) * s, h1 = (monedas ? 2.3 : 3.3) * s;
  const c1 = K.malla(tronco(w0, w0, w1, w1, h1), sillarFaro(K, { cols: monedas ? 2 : 3, filas: monedas ? 3 : 6 }), { grosor: 0.01 }); c1.geometry.userData.propia = true; c1.position.y = y0; g.add(c1);
  // la puerta, y la rampa sobre arcos que sube hasta ella
  const yp = y0 + (monedas ? 0.02 : 0.55) * s;
  pon(g, caja(K, 0.3 * s, 0.46 * s, 0.02, '#2e251d', { sinTinta: true }), 0, yp + 0.23 * s, (w0 - (w0 - w1) * ((yp - y0 + 0.23 * s) / h1)) / 2 + 0.008);
  pon(g, caja(K, 0.4 * s, 0.06 * s, 0.05 * s, AL.calizaL, { grosor: 0.004 }), 0, yp + 0.49 * s, (w0 - (w0 - w1) * ((yp - y0 + 0.49 * s) / h1)) / 2 + 0.02);
  if (!monedas) {
    const L = 1.0 * s, r = caja(K, 0.3 * s, 0.06 * s, Math.hypot(L, yp - y0), AL.calizaD, { grosor: 0.005 }); r.rotation.x = Math.atan2(yp - y0, L); r.position.set(0, y0 + (yp - y0) / 2, w0 / 2 + L / 2); g.add(r);
    for (let i = 0; i < 3; i++) { const z = w0 / 2 + 0.18 * s + i * 0.3 * s, hh = (yp - y0) * (1 - (z - w0 / 2) / L); if (hh > 0.04) pon(g, caja(K, 0.22 * s, hh, 0.08 * s, AL.caliza, { grosor: 0.004 }), 0, y0 + hh / 2, z); }
  } else {
    const esc = escalera(K, { largo: 0.5 * s, alto: 0.22 * s, ancho: 0.6 * s, n: 5, color: AL.calizaD, baranda: null }); esc.position.set(0, 0, P / 2 + 0.5 * s); g.add(esc);
  }
  // la dedicatoria de Sóstrato, sobre la puerta
  const dedi = lamina(K, grabado(K, 'ΣΩΣΤΡΑΤΟΣ ΔΕΞΙΦΑΝΟΥ ΚΝΙΔΙΟΣ\nΘΕΟΙΣ ΣΩΤΗΡΣΙΝ ΥΠΕΡ ΤΩΝ ΠΛΩΙΖΟΜΕΝΩΝ', { w: 512, h: 72, fondo: AL.calizaD, tinta: '#3e3122', tam: 22 }), w1 * 0.94, 0.16 * s);
  const yd = y0 + h1 * 0.78; dedi.position.set(0, yd, (w0 - (w0 - w1) * ((yd - y0) / h1)) / 2 + 0.012); dedi.rotation.x = -Math.atan((w0 - w1) / 2 / h1); g.add(dedi);
  let y = y0 + h1;
  pon(g, caja(K, w1 + 0.16 * s, 0.1 * s, w1 + 0.16 * s, AL.calizaL, { grosor: 0.006 }), 0, y + 0.05 * s, 0);   // la cornisa
  for (let i = 0; i < 9; i++) [-1, 1].forEach(l => { pon(g, caja(K, 0.08 * s, 0.08 * s, 0.08 * s, AL.caliza, { grosor: 0.003 }), -w1 / 2 + (i + 0.5) * w1 / 9, y + 0.14 * s, l * (w1 / 2 + 0.04 * s)); pon(g, caja(K, 0.08 * s, 0.08 * s, 0.08 * s, AL.caliza, { grosor: 0.003 }), l * (w1 / 2 + 0.04 * s), y + 0.14 * s, -w1 / 2 + (i + 0.5) * w1 / 9); });   // el parapeto almenado
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const tr = triton(K, (monedas ? 2.1 : 1.6) * s); tr.position.set(a * (w1 / 2 + 0.02), y + 0.1 * s, b * (w1 / 2 + 0.02)); tr.rotation.y = Math.atan2(a, b); g.add(tr); });
  y += 0.1 * s;
  if (!monedas) {
    // el segundo cuerpo: octogonal
    const h2 = 1.55 * s, r2 = 0.5 * s;
    const oct = new THREE.Mesh(propia(new THREE.CylinderGeometry(r2 * 0.92, r2, h2, 8, 1, true)), sillarFaro(K, { cols: 1, filas: 3, clave: 'sillarOcto' }));
    oct.material = oct.material.clone(); oct.material.map = oct.material.map.clone(); oct.material.map.repeat.set(8, 1); oct.material.map.needsUpdate = true; oct.material.side = THREE.DoubleSide;
    const octM = K.malla(oct.geometry, oct.material, { grosor: 0.008 }); octM.position.y = y + h2 / 2; octM.rotation.y = Math.PI / 8; g.add(octM);
    y += h2;
    pon(g, K.malla(K.cilindro(r2 * 1.08, r2 * 1.0, 0.08 * s, 8), AL.calizaL, { grosor: 0.005 }), 0, y + 0.04 * s, 0).rotation.y = Math.PI / 8;
    y += 0.08 * s;
  }
  // el tercer cuerpo: la linterna redonda de columnas, con el fuego adentro
  const r3 = (monedas ? 0.55 : 0.36) * s, h3 = (monedas ? 0.55 : 0.6) * s;
  pon(g, K.malla(K.cilindro(r3 * 1.05, r3 * 1.12, 0.12 * s, 14), AL.caliza, { grosor: 0.005 }), 0, y + 0.06 * s, 0);
  y += 0.12 * s;
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, c = columnaCorintia(K, h3, 0.032 * s, { gr: 0.003 }); c.position.set(Math.cos(a) * r3 * 0.88, y, Math.sin(a) * r3 * 0.88); g.add(c); }
  const fu = fuego(K, (monedas ? 1.5 : 1.1) * s); fu.position.y = y + 0.02; g.add(fu);
  pon(g, K.malla(K.esfera(0.1 * s, 0.6), '#fff1c0', { emissive: '#ffd27a', emissiveIntensity: 0.9, sinTinta: true, sombra: false }), 0, y + 0.12 * s, 0);
  y += h3;
  pon(g, K.malla(K.cilindro(r3 * 1.04, r3 * 1.04, 0.06 * s, 14), AL.calizaL, { grosor: 0.004 }), 0, y + 0.03 * s, 0);
  const cup = K.malla(new THREE.SphereGeometry(r3 * 0.98, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), AL.calizaL, { grosor: 0.005 }); cup.geometry.userData.propia = true; cup.position.y = y + 0.06 * s; cup.scale.y = 0.55; g.add(cup);
  y += 0.06 * s + r3 * 0.54;
  // Zeus Salvador en bronce dorado, con su cetro
  const zs = crearPersona(K, { pelo: 'rizos', barba: true, ropa: 'tunica', colorRopa: '#c9973e', colorPelo: '#7f5a24' });
  const cetro = K.malla(K.cilindro(0.012, 0.012, 0.95, 5), '#e6bb4c', { grosor: 0.003 }); cetro.position.y = 0.2; zs.sostener(cetro, 'I');
  zs.anim(0, { pose: 'quieto', instantaneo: true });
  zs.obj.traverse(o => { if (o.isMesh && !o.userData.tinta && o.material?.color && o.material.visible !== false) o.material = o.geometry?.attributes?.color ? K.mat('#f3c766', { vertexColors: true }) : K.mat('#a87a30'); });   // el bronce dorado: los colores de la persona teñidos de oro, para que se lean la cara, el manto y el cetro
  const ze = (monedas ? 1.0 : 0.95) * s; zs.obj.scale.setScalar(ze); zs.obj.position.y = y; g.add(zs.obj);
  pon(g, K.malla(K.cilindro(0.09 * s, 0.11 * s, 0.06 * s, 10), AL.calizaD, { grosor: 0.003 }), 0, y - 0.0, 0);
  g.userData.alto = y + 0.95 * ze;
  return g;
}
/* la isla de Faros: la roca baja, las piedras sueltas y la espuma */
function isla(K, w, d, semilla = 3) {
  const g = new THREE.Group();
  const r = K.malla(K.roca(1, semilla), AL.roca, { grosor: 0.012 }); r.scale.set(w / 2, 0.3, d / 2); r.position.y = -0.06; g.add(r);
  for (let i = 0; i < 9; i++) { const a = i * 0.71 * Math.PI, rr = 0.5 + (i % 3) * 0.06; const p = K.malla(K.roca(0.16 + (i % 3) * 0.06, i + 2), i % 2 ? AL.rocaD : AL.roca, { grosor: 0.006 }); p.position.set(Math.cos(a) * w * rr, -0.02, Math.sin(a) * d * rr); p.scale.y = 0.6; g.add(p); }
  const es = K.malla(K.toro(1, 0.03, Math.PI * 2, 0.6), AL.espuma, { sinTinta: true, sombra: false }); es.rotation.x = Math.PI / 2; es.scale.set(w * 0.53, d * 0.53, 1); es.position.y = 0.005; g.add(es);
  return g;
}
export function faro(K, variante = VARIANTES.faro) {
  const g = new THREE.Group();
  if (variante === 'heptastadio') {
    g.add(isla(K, 5.2, 3.4, 5));
    const f = torreFaro(K, { escala: 0.62 }); f.position.set(-1.0, 0.06, -0.3); g.add(f);
    const isis = temploFrente(K, { W: 0.7, L: 1.0, cols: 4, H: 0.5, orden: 'jonico', podio: 0.16 }); isis.position.set(1.0, 0.06, -0.55); isis.rotation.y = -0.25; g.add(isis);
    [[-0.25, 1, false], [0.25, 1, true]].forEach(([x, , reina]) => { const c = colosoPtolemaico(K, reina, 0.72); c.position.set(-1.0 + x, 0.06, 0.95); g.add(c); });
    // el Heptastadio: el dique de siete estadios a la ciudad, con sus dos puentes
    const dq = new THREE.Group(); dq.position.set(1.7, 0, 0.9); dq.rotation.y = -0.5; g.add(dq);
    for (let i = 0; i < 3; i++) pon(dq, caja(K, 0.5, 0.2, 1.1, AL.calizaD, { grosor: 0.006 }), 0, 0.02, 0.6 + i * 1.45);
    for (let i = 0; i < 2; i++) { const z = 1.32 + i * 1.45; pon(dq, caja(K, 0.52, 0.06, 0.4, AL.madera, { grosor: 0.004 }), 0, 0.13, z); }
    g.userData.ficha = { titulo: 'El Faro y el Heptastadio', texto: 'la torre en su isla, el templo de Isis Faria y el dique de siete estadios hasta la ciudad' };
    return g;
  }
  g.add(isla(K, 4.4, 4.4, 3));
  const f = torreFaro(K, { monedas: variante === 'monedas' }); f.position.y = 0.06; g.add(f);
  if (variante !== 'monedas') [[-0.62, false], [0.62, true]].forEach(([x, reina]) => { const c = colosoPtolemaico(K, reina, 1.45); c.position.set(x, 0.0, 2.05); g.add(c); });
  g.userData.alto = f.userData.alto;
  g.userData.ficha = { titulo: 'El Faro', texto: 'la torre de Sóstrato de Cnido: de noche, un fuego; de día, el humo; la vieron los marinos desde lejos' };
  return g;
}

/* ---------- EL MUSEO CON LA BIBLIOTECA ---------- */
/* la exedra: el banco de piedra en medio círculo, con su respaldo, donde se discutía */
function exedra(K, r = 0.55) {
  const g = new THREE.Group();
  const asiento = new THREE.Mesh(propia(new THREE.CylinderGeometry(r, r, 0.14, 24, 1, false, -Math.PI / 2, Math.PI)), K.mat(AL.calizaL)); asiento.position.y = 0.07;
  const hueco = K.malla(propia(new THREE.CylinderGeometry(r - 0.2, r - 0.2, 0.16, 24, 1, false, -Math.PI / 2, Math.PI)), '#d9cdb0', { sinTinta: true }); hueco.position.y = 0.075;
  g.add(K.malla(asiento.geometry, AL.calizaL, { grosor: 0.004 }), hueco);
  const resp = K.malla(propia(new THREE.CylinderGeometry(r + 0.03, r + 0.03, 0.34, 24, 1, true, -Math.PI / 2, Math.PI)), AL.caliza, { grosor: 0.004, side: THREE.DoubleSide }); resp.position.y = 0.17; g.add(resp);
  return g;
}
/* el jardín del Museo: canteros con plantas de muchas tierras, una fuente y palmeras */
function jardin(K, w, d) {
  const g = new THREE.Group();
  pon(g, caja(K, w, 0.03, d, '#c9b98e', { sinTinta: true, sombra: false }), 0, 0.015, 0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b], i) => {
    pon(g, caja(K, w * 0.36, 0.06, d * 0.34, '#6f8a48', { grosor: 0.004 }), a * w * 0.26, 0.03, b * d * 0.26);
    for (let k = 0; k < 4; k++) pon(g, K.malla(K.esfera(0.06 + (k % 2) * 0.02, 0.6), ['#5f8f45', '#7aa356', '#8a6fa8', '#c7764e'][(i + k) % 4], { grosor: 0.003 }), a * w * 0.26 + (k - 1.5) * 0.12, 0.1, b * d * 0.26 + (k % 2 - 0.5) * 0.1);
  });
  pon(g, K.malla(K.cilindro(0.16, 0.18, 0.08, 14), AL.calizaL, { grosor: 0.004 }), 0, 0.04, 0);
  pon(g, K.malla(K.cilindro(0.13, 0.13, 0.02, 14), AL.marL, { sinTinta: true }), 0, 0.075, 0);
  pon(g, K.malla(K.cilindro(0.02, 0.025, 0.16, 6), AL.calizaL, { grosor: 0.003 }), 0, 0.14, 0);
  return g;
}
/* una sala con muros, techo a dos aguas y una puerta al frente (+z) */
function sala(K, W, D, H, { color = AL.caliza, techo = true, puerta = true, tema = 'liso' } = {}) {
  const g = new THREE.Group();
  pon(g, caja(K, W, H, D, color, { grosor: 0.007 }), 0, H / 2, 0);
  if (puerta) pon(g, caja(K, W * 0.18, H * 0.6, 0.01, '#33281e', { sinTinta: true }), 0, H * 0.3, D / 2 + 0.006);
  [-1, 1].forEach(l => pon(g, caja(K, 0.06, H * 0.95, 0.03, AL.calizaL, { grosor: 0.003 }), l * W * 0.3, H * 0.475, D / 2 + 0.015));   // pilastras
  if (techo) { const te = tejado(K, D + 0.06, W + 0.06, D * 0.16, { tipo: 'teja', tema, gr: 0.005 }); te.rotation.y = Math.PI / 2; te.position.y = H; g.add(te); }
  return g;
}
/* el observatorio del techo: la esfera armilar de bronce */
export function armilar(K, s = 1) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.04 * s, 0.06 * s, 0.1 * s, 8), AL.calizaD, { grosor: 0.003 }), 0, 0.05 * s, 0);
  [[0, 0], [Math.PI / 2, 0], [0.41, 1]].forEach(([ry, inc]) => { const a = K.malla(K.toro(0.12 * s, 0.007 * s, Math.PI * 2, 0.6), AL.bronce, { sinTinta: true }); a.position.y = 0.22 * s; a.rotation.set(inc ? Math.PI / 2 - 0.41 : 0, ry, 0); g.add(a); });
  pon(g, K.malla(K.esfera(0.025 * s, 0.5), AL.oro, { sinTinta: true }), 0, 0.22 * s, 0);
  return g;
}
export function museo(K, variante = VARIANTES.museo, niv = 3) {
  const g = new THREE.Group();
  if (variante === 'pergamo') {
    // la stoa de dos pisos (dórica abajo, jónica arriba) y detrás la gran sala de lectura con los nichos y Homero
    const L = 4.0, H1 = 0.62, H2 = 0.5, P = 0.55;
    const sl = new THREE.Group(); sl.position.set(0, 0, -0.95); g.add(sl);
    pon(sl, caja(K, 2.2, 0.08, 1.7, AL.calizaD, { grosor: 0.006 }), 0, 0.04, 0);
    pon(sl, caja(K, 2.2, 1.5, 0.08, AL.caliza, { grosor: 0.007 }), 0, 0.83, -0.81);
    [-1, 1].forEach(l => pon(sl, caja(K, 0.08, 1.5, 1.7, AL.caliza, { grosor: 0.007 }), l * 1.06, 0.83, 0));
    for (let i = 0; i < 3; i++) { const n = lamina(K, nichos(K, 3, 3), 0.6, 0.7); n.position.set(-0.7 + i * 0.7, 0.62, -0.765); g.add(n); n.position.add(sl.position); }   // los armarios del fondo
    [-1, 1].forEach(l => { const n = lamina(K, nichos(K, 3, 3), 0.6, 0.7); n.position.set(l * 1.015, 0.62, -0.25); n.rotation.y = -l * Math.PI / 2; sl.add(n); });
    const homero = crearPersona(K, { pelo: 'rizos', barba: true, ropa: 'tunica', colorRopa: AT.marmol, colorPelo: AT.marmol, chal: AT.marmol }); homero.anim(0, { pose: 'sentado', instantaneo: true, asiento: 0.3 });
    homero.obj.traverse(o => { if (o.isMesh && !o.userData.tinta && o.material?.color && o.material.visible !== false) o.material = K.mat(AT.marmolL); });
    const tr = new THREE.Group(); tr.position.set(0, 0.08, -0.55); sl.add(tr);
    pon(tr, caja(K, 0.42, 0.3, 0.36, AT.marmolD, { grosor: 0.004 }), 0, 0.15, -0.05); tr.add(homero.obj); homero.obj.scale.setScalar(1.25);
    const techoS = tejado(K, 2.3, 1.85, 0.3, { tipo: 'teja', gr: 0.005 }); techoS.rotation.y = Math.PI / 2; techoS.position.set(0, 1.58, 0); sl.add(techoS);
    for (let i = 0; i < 5; i++) pon(sl, caja(K, 0.16, 0.16, 0.02, '#e9e1c8', { sinTinta: true }), -0.8 + i * 0.4, 1.36, 0.86);   // las ventanas altas
    // la stoa del frente, de dos pisos
    const st = new THREE.Group(); st.position.set(0, 0, 0.55); g.add(st);
    pon(st, caja(K, L, 0.1, P, AL.calizaD, { grosor: 0.006 }), 0, 0.05, 0);
    for (let i = 0; i < 11; i++) { const x = -L / 2 + 0.1 + i * (L - 0.2) / 10; if (Math.abs(x) < 0.3 && i === 5) continue; const c = columnaDorica(K, H1, 0.05, { color: AL.calizaL, gr: 0.003 }); c.position.set(x, 0.1, P / 2 - 0.06); st.add(c); }
    const en = entablamento(K, L, P, 0.14, { nx: 20, nz: 2, gr: 0.004 }); en.position.y = 0.1 + H1; st.add(en);
    pon(st, caja(K, L, 0.04, P, AL.calizaD, { grosor: 0.004 }), 0, 0.1 + H1 + 0.16, 0);
    for (let i = 0; i < 15; i++) { const c = columnaJonica(K, H2, 0.035, { color: AL.calizaL, gr: 0.003 }); c.position.set(-L / 2 + 0.1 + i * (L - 0.2) / 14, 0.1 + H1 + 0.18, P / 2 - 0.06); st.add(c); }
    for (let i = 0; i < 14; i++) pon(st, caja(K, (L - 0.2) / 14 - 0.05, 0.12, 0.02, AL.calizaL, { grosor: 0.002 }), -L / 2 + 0.1 + (i + 0.5) * (L - 0.2) / 14, 0.1 + H1 + 0.24, P / 2 - 0.06);   // el antepecho
    pon(st, caja(K, L, H1 + H2 + 0.2, 0.06, AL.caliza, { grosor: 0.006 }), 0, (H1 + H2 + 0.3) / 2, -P / 2 + 0.03);
    pon(st, caja(K, 0.4, 0.5, 0.01, '#33281e', { sinTinta: true }), 0, 0.35, -P / 2 + 0.065);
    const te = caja(K, L + 0.08, 0.04, P + 0.12, AT.teja, { grosor: 0.005 }); te.position.set(0, 0.1 + H1 + 0.18 + H2 + 0.12, 0); te.rotation.x = 0.18; st.add(te);
    g.userData.ficha = { titulo: 'La Biblioteca', texto: 'la sala de los rollos, con sus armarios en nichos y la estatua de Homero' };
    return g;
  }
  if (variante === 'musas') {
    // el santuario de las Musas: el templo jónico pintado, su altar, las esfinges y las alas con los rollos
    const t = temploFrente(K, { W: 1.25, L: 1.7, cols: 4, H: 0.9, orden: 'jonico', podio: 0.3, tema: 'musas' }); t.position.set(0, 0, -0.45); g.add(t);
    const al = altar(K, 0.8, true); al.position.set(0, 0, 1.15); g.add(al);
    [-1, 1].forEach(l => {
      const ala = porticoPatio(K, 1.25, 0.5, 0.62, 5, { corintio: true, libros: true }); ala.position.set(l * 1.45, 0, -0.35); ala.rotation.y = 0; g.add(ala);
      const sala2 = sala(K, 1.25, 0.6, 0.72, { puerta: false }); sala2.position.set(l * 1.45, 0, -0.95); g.add(sala2);
      const e = esfinge(K, 'piedra'); e.scale.setScalar(0.26); e.position.set(l * 0.55, 0, 1.25); g.add(e);
      const pa = palmera(K, 1.3, 3 + l); pa.position.set(l * 1.95, 0, 0.75); g.add(pa);
    });
    g.userData.ficha = { titulo: 'El Museo', texto: 'el santuario de las Musas, con su sacerdote, y en las alas los rollos' };
    return g;
  }
  // 'estrabon': el paseo con columnas alrededor del jardín, la exedra con asientos y la gran casa de la comida común;
  // en el pórtico del oeste, los armarios de los rollos. En el juego crece por etapas (niv): la obra; la gran casa
  // (0); la mesa larga de la comida común, que se ve por la puerta abierta (1); el paseo con columnas y la exedra
  // (2); el jardín y el observatorio del techo (3).
  const W = 3.6, D = 2.7;
  if (niv === 'obra') {                                  // los cimientos y el andamio
    pon(g, caja(K, W + 0.1, 0.06, D + 0.1, AL.calizaD, { grosor: 0.005 }), 0, 0.03, 0);
    pon(g, caja(K, 2.3, 0.35, 1.1, AL.caliza, { grosor: 0.006 }), -0.2, 0.175, -D / 2 - 0.62);
    for (let i = 0; i < 4; i++) { const p = K.malla(K.cilindro(0.015, 0.015, 1.1, 4), AL.maderaD, { sinTinta: true }); p.position.set(-1.3 + i * 0.75, 0.55, -D / 2 - 0.05); g.add(p); }
    pon(g, caja(K, 2.4, 0.03, 0.08, AL.madera, { grosor: 0.003 }), -0.2, 1.0, -D / 2 - 0.05);
    for (let k = 0; k < 6; k++) pon(g, caja(K, 0.3, 0.12, 0.2, k % 2 ? AL.caliza : AL.calizaD, { grosor: 0.004 }), -1.2 + k * 0.42, 0.06, 0.6 - (k % 3) * 0.25);   // los sillares que esperan
    return g;
  }
  const n = niv ?? 3;
  pon(g, caja(K, W + 0.1, 0.06, D + 0.1, AL.calizaD, { grosor: 0.005 }), 0, 0.03, 0);
  const casa = sala(K, 2.3, 1.1, 1.0, { tema: 'musas' }); casa.position.set(-0.2, 0, -D / 2 - 0.62); g.add(casa);
  if (n >= 1) {                                          // la sala común: la puerta grande abierta y la mesa larga con sus bancos, afuera bajo el toldo
    const sc = new THREE.Group(); sc.position.set(-0.2, 0.06, -D / 2 + 0.1); g.add(sc);
    pon(sc, caja(K, 1.5, 0.04, 0.32, AL.madera, { grosor: 0.004 }), 0, 0.3, 0);
    [-1, 1].forEach(l => [-0.6, 0.6].forEach(x => pon(sc, K.malla(K.cilindro(0.02, 0.02, 0.3, 5), AL.maderaD, { sinTinta: true }), x, 0.15, l * 0.12)));
    [-1, 1].forEach(l => pon(sc, caja(K, 1.5, 0.04, 0.12, AL.maderaL, { grosor: 0.003 }), 0, 0.18, l * 0.3));
    for (let k = 0; k < 5; k++) { const v = K.malla(K.cilindro(0.03, 0.025, 0.06, 7), k % 2 ? '#b9784a' : '#e8dcc0', { grosor: 0.002 }); v.position.set(-0.6 + k * 0.3, 0.35, (k % 2 - 0.5) * 0.12); sc.add(v); }
    const toldo = caja(K, 1.7, 0.02, 0.62, '#d9c08a', { grosor: 0.003 }); toldo.position.set(0, 0.72, 0); toldo.rotation.x = 0.1; sc.add(toldo);
    [-1, 1].forEach(l => pon(sc, K.malla(K.cilindro(0.014, 0.014, 0.72, 5), AL.maderaD, { sinTinta: true }), l * 0.82, 0.36, 0.28));
  }
  if (n >= 2) {
    const pe = peristilo(K, W, D, 0.6, { corintio: true, libros: ['o', 'n'] }); pe.position.y = 0.06; g.add(pe);
    const ex = exedra(K, 0.5); ex.position.set(0.95, 0.06, 0.55); ex.rotation.y = Math.PI; g.add(ex);
  }
  if (n >= 3) {                                          // el jardín de plantas de muchas tierras, con palmeras que asoman sobre los tejados,
    const ja = jardin(K, W - 1.1, D - 1.15); ja.position.set(0, 0.06, 0.1); g.add(ja);   // y el observatorio: la terraza en el techo de la gran casa con su esfera
    [[-0.7, -0.05, 1.5], [0.75, 0.35, 1.35]].forEach(([x, z, h], i) => { const p = palmera(K, h, 7 + i); p.position.set(x, 0.06, z); g.add(p); });
    const obs = new THREE.Group(); obs.position.set(0.55, 1.0 + 0.26, -D / 2 - 0.62); g.add(obs);
    pon(obs, caja(K, 0.62, 0.3, 0.5, AL.caliza, { grosor: 0.005 }), 0, 0.15, 0);
    pon(obs, caja(K, 0.7, 0.04, 0.58, AL.calizaL, { grosor: 0.004 }), 0, 0.32, 0);
    for (let i = 0; i < 4; i++) [-1, 1].forEach(l => pon(obs, caja(K, 0.05, 0.08, 0.05, AL.calizaL, { grosor: 0.002 }), -0.3 + i * 0.2, 0.38, l * 0.26));
    const ar = armilar(K, 2.0); ar.position.set(0, 0.34, 0); obs.add(ar);
  }
  g.userData.ficha = { titulo: 'El Museo', texto: 'el paseo con columnas, la exedra con asientos y la gran casa donde los sabios comían juntos' };
  return g;
}

/* ---------- EL SERAPEO ---------- */
/* Serapis sentado en su trono: oscuro, con el cesto del grano (el kálathos) y Cerbero a los pies */
function serapis(K, s = 1) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.42 * s, 0.32 * s, 0.38 * s, AL.calizaD, { grosor: 0.004 }), 0, 0.16 * s, -0.04 * s);
  const p = crearPersona(K, { pelo: 'rizos', barba: true, ropa: 'tunica', colorRopa: AL.serapis, colorPelo: AL.serapis, chal: AL.serapis }); p.anim(0, { pose: 'sentado', instantaneo: true, asiento: 0.32 });
  p.obj.traverse(o => { if (o.isMesh && !o.userData.tinta && o.material?.color && o.material.visible !== false) o.material = K.mat(AL.serapis); });
  p.obj.scale.setScalar(1.15 * s); g.add(p.obj);
  pon(g, K.malla(K.cilindro(0.075 * s, 0.05 * s, 0.11 * s, 10), AL.oro, { grosor: 0.003, emissive: AL.oro, emissiveIntensity: 0.2 }), 0, 1.13 * s, 0);   // el kálathos
  pon(g, K.malla(K.cilindro(0.008 * s, 0.008 * s, 0.95 * s, 5), AL.oro, { sinTinta: true }), -0.22 * s, 0.5 * s, 0.1 * s);   // el cetro
  const ce = new THREE.Group(); ce.position.set(0.2 * s, 0, 0.26 * s); g.add(ce);   // Cerbero, el perro de tres cabezas
  const cu = K.malla(K.capsula(0.05 * s, 0.12 * s, 0.6), AL.serapis, { grosor: 0.003 }); cu.rotation.x = Math.PI / 2; cu.position.y = 0.07 * s; ce.add(cu);
  [-1, 0, 1].forEach(k => pon(ce, K.malla(K.esfera(0.038 * s, 0.5), AL.serapis, { grosor: 0.003 }), k * 0.045 * s, 0.15 * s, 0.09 * s));
  return g;
}
/* la colina de Racotis: la roca con su cima plana */
function rocaMat(K) {
  return matRep(K, 'estratos', 128, 64, (g, w, h) => {
    g.fillStyle = AL.roca; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 9) { g.fillStyle = (y / 9) % 2 ? AL.rocaD : AL.rocaL; g.fillRect(0, y, w, 3 + (y % 4)); }
    g.strokeStyle = 'rgba(70,60,45,.45)'; g.lineWidth = 1.5;
    for (let i = 0; i < 9; i++) { const x = (i * 29) % w; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 4, h * 0.4); g.lineTo(x - 2, h); g.stroke(); }
  }, 3, 1);
}
function colina(K, w, d, h) {
  const g = new THREE.Group();
  const c = K.malla(tronco(w, d, w - h * 1.25, d - h * 1.25, h), rocaMat(K), { grosor: 0.01 }); c.geometry.userData.propia = true; g.add(c);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + 0.2, rr = 0.42 + (i % 3) * 0.02; const m = K.malla(K.esfera(0.07 + (i % 3) * 0.025, 0.6), i % 2 ? '#6f8a48' : '#87a05a', { grosor: 0.003 }); m.position.set(Math.cos(a) * w * rr, h * 0.45, Math.sin(a) * d * rr); m.scale.y = 0.75; g.add(m); }
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const p = K.malla(K.roca(0.14 + (i % 3) * 0.05, i + 7), i % 2 ? AL.rocaD : AL.rocaL, { grosor: 0.005 }); p.position.set(Math.cos(a) * w * 0.5, 0.05, Math.sin(a) * d * 0.5); p.scale.y = 0.7; g.add(p); }
  return g;
}
/* la columna de Diocleciano (297 d. C.): granito rojo de una pieza, capitel corintio; todavía en pie */
function columnaDiocleciano(K, alto = 2.2) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.36, 0.3, 0.36, AL.granitoD, { grosor: 0.005 }), 0, 0.15, 0);
  const c = columnaCorintia(K, alto, 0.11, { color: AL.granito, gr: 0.004 }); c.position.y = 0.3; g.add(c);
  return g;
}
export function serapeo(K, variante = VARIANTES.serapeo) {
  const g = new THREE.Group();
  if (variante === 'serapis') {
    // de cerca: el templo abierto con Serapis adentro, el altar y las esfinges; girado para que su frente mire al que
    // mira (desde la cámara del juego, el muro de un costado tapa el interior de una cella derecha)
    const fr = new THREE.Group(); fr.rotation.y = Math.PI / 4; g.add(fr);
    const naos = new THREE.Group(); naos.position.set(0, 0.12, -0.45); fr.add(naos);
    pon(naos, caja(K, 1.7, 0.12, 1.5, AL.calizaD, { grosor: 0.005 }), 0, -0.06, 0.05);
    pon(naos, caja(K, 1.5, 1.25, 0.08, '#c98f5a', { grosor: 0.006 }), 0, 0.625, -0.6);   // el fondo pintado de ocre, para que el dios se recorte
    [-1, 1].forEach(l => pon(naos, caja(K, 0.08, 1.25, 1.2, AL.caliza, { grosor: 0.006 }), l * 0.71, 0.625, 0));
    for (let i = 0; i < 4; i++) { const c = columnaCorintia(K, 1.25, 0.055, { gr: 0.003 }); c.position.set(-0.6 + i * 0.4, 0, 0.62); naos.add(c); }
    const te = tejado(K, 1.62, 1.4, 0.26, { tipo: 'teja', tema: 'liso', acrotera: palmeta(K, 0.12), gr: 0.004 }); te.position.set(0, 1.25 + 0.16, 0.02); naos.add(te);
    const en = entablamento(K, 1.6, 1.36, 0.16, { nx: 6, nz: 6, jonico: true, gr: 0.004 }); en.position.set(0, 1.25, 0.02); naos.add(en);
    const sp = serapis(K, 0.9); sp.position.set(0, 0, -0.2); naos.add(sp);
    const luz = new THREE.PointLight('#ffd9a0', 1.6, 2.2, 1.5); luz.position.set(0, 0.9, 0.5); naos.add(luz);   // la lámpara del templo
    const al = altar(K, 0.7, true); al.position.set(0, 0, 0.85); fr.add(al);
    [-1, 1].forEach(l => { const e = esfinge(K, 'piedra'); e.scale.setScalar(0.27); e.position.set(l * 1.0, 0, 0.75); granito(K, e); fr.add(e); });
    g.userData.ficha = { titulo: 'Serapis', texto: 'el dios de Alejandría: oscuro, con el cesto del grano en la cabeza y Cerbero a los pies' };
    return g;
  }
  const romano = variante === 'romano', h = romano ? 0.75 : 0.6, W = romano ? 3.6 : 3.2, D = romano ? 3.0 : 2.6;
  const co = colina(K, W + 0.9, D + 0.9, h); g.add(co);
  const cima = new THREE.Group(); cima.position.y = h; g.add(cima);
  const pe = peristilo(K, W - 0.3, D - 0.3, 0.55, { prof: 0.4, corintio: romano, libros: ['o', 'e', 'n'] }); cima.add(pe);
  const t = temploFrente(K, { W: romano ? 1.15 : 0.95, L: romano ? 1.5 : 1.25, cols: romano ? 6 : 4, H: romano ? 0.82 : 0.7, orden: romano ? 'corintio' : 'jonico', podio: romano ? 0.3 : 0.2 }); t.position.set(0, 0, -0.1); cima.add(t);
  // la subida: la escalinata al frente (los «cien escalones» en la romana)
  const esc = escalera(K, { largo: romano ? 1.2 : 0.85, alto: h, ancho: romano ? 1.0 : 0.6, n: romano ? 16 : 10, color: AL.calizaD, baranda: AL.caliza }); esc.position.set(0, 0, (D + 0.9) / 2 - h * 0.62 + (romano ? 1.2 : 0.85)); g.add(esc);
  if (romano) {
    const col = columnaDiocleciano(K, 1.7); col.position.set(1.05, 0, 0.75); cima.add(col);
    [-1, 1].forEach(l => { const e = esfinge(K, 'piedra'); e.scale.setScalar(0.34); e.position.set(l * 0.9, 0, (D + 0.9) / 2 + 0.8); granito(K, e); g.add(e); });
  } else {
    const al = altar(K, 0.6, true); al.position.set(0, 0, 0.75); cima.add(al);
  }
  g.userData.ficha = { titulo: 'El Serapeo', texto: 'el templo de Serapis en su colina, con la biblioteca hija en los pórticos' };
  return g;
}
function granito(K, obj) { const m = K.mat(AL.granito); obj.traverse(o => { if (o.isMesh && !o.userData.tinta && o.material?.color && o.material.visible !== false && !o.material.map) o.material = m; }); }

/* ---------- LOS BARCOS ---------- */
/* El casco: el perfil de costado (la borda que sube en proa y popa, la quilla curva) extruido a lo ancho y afinado
   hacia las puntas y hacia abajo. Largo L sobre x (la proa en +x), manga B, puntal H. */
function casco(K, L, B, H, { color = AL.madera, proa = 1.25, popa = 1.5, espolon = false } = {}) {
  const s = new THREE.Shape(), l = L / 2;
  s.moveTo(-l, H * popa);
  for (let i = 1; i <= 12; i++) { const u = i / 12, x = -l + L * u, sube = Math.pow(Math.abs(u - 0.5) * 2, 3); s.lineTo(x, H + H * (u < 0.5 ? popa - 1 : proa - 1) * sube); }
  s.lineTo(l * 0.97, H * 0.4);
  if (espolon) { s.lineTo(l * 1.06, H * 0.05); s.lineTo(l * 0.9, -H * 0.02); }
  for (let i = 12; i >= 0; i--) { const u = i / 12, x = -l * 0.92 + L * 0.92 * u; s.lineTo(x, -H * 0.15 * (1 - Math.pow(u * 2 - 1, 2))); }
  s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: B, bevelEnabled: false, curveSegments: 4 }); geo.translate(0, 0, -B / 2);
  const p = geo.getAttribute('position');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), t = Math.min(1, Math.abs(x) / l);
    const f = Math.max(0.06, Math.sqrt(Math.max(0, 1 - Math.pow(t, 3.2)))) * (0.45 + 0.55 * Math.min(1, Math.max(0, (y + H * 0.15) / (H * 1.15))));
    p.setZ(i, z * f);
  }
  geo.computeVertexNormals(); propia(geo);
  return K.malla(geo, color, { grosor: 0.008 });
}
/* la vela cuadrada hinchada por el viento, con sus cuerdas de recoger (los candeletes) */
function vela(K, w, h, { color = AL.vela, franjas = false } = {}) {
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(w, h, 8, 6), p = geo.getAttribute('position');
  for (let i = 0; i < p.count; i++) { const x = p.getX(i) / (w / 2), y = p.getY(i) / (h / 2); p.setZ(i, 0.14 * w * (1 - x * x) * (0.75 + 0.25 * (1 - y * y))); }
  geo.computeVertexNormals(); propia(geo);
  const v = K.malla(geo, color, { grosor: 0.004, side: THREE.DoubleSide }); g.add(v);
  for (let i = 1; i < 6; i++) { const x = -w / 2 + i * w / 6; const c = K.malla(K.caja(0.008, h, 0.008), AL.cuerda, { sinTinta: true }); c.position.set(x, 0, 0.14 * w * (1 - Math.pow(x / (w / 2), 2)) * 0.85 + 0.01); g.add(c); }
  if (franjas) for (let j = 0; j < 2; j++) { const f = K.malla(K.caja(w * 0.98, 0.04, 0.006), AL.rojo, { sinTinta: true }); f.position.set(0, -h * 0.25 + j * h * 0.5, 0.14 * w * 0.8); g.add(f); }
  return g;
}
/* una cuerda tendida entre dos puntos */
function cuerda(K, a, b, r = 0.004) {
  const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A);
  const m = K.malla(K.cilindro(r, r, 1, 4), AL.cuerda, { sinTinta: true }); m.scale.y = d.length();
  m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}
function mastil(K, g, x, alto, { w = 1.0, h = 0.8, franjas = false, borda = 0.3, manga = 0.6 } = {}) {
  [-1, 1].forEach(l => { g.add(cuerda(K, [x, alto * 0.93, 0], [x - 0.12, borda, l * manga * 0.46])); g.add(cuerda(K, [x, alto * 0.93, 0], [x + 0.25, borda, l * manga * 0.4])); });   // los obenques
  pon(g, K.malla(K.cilindro(0.022, 0.03, alto, 6), AL.maderaD, { grosor: 0.004 }), x, alto / 2, 0);
  const verga = K.malla(K.cilindro(0.015, 0.015, w * 1.1, 6), AL.maderaD, { grosor: 0.003 }); verga.rotation.x = Math.PI / 2; verga.position.set(x + 0.02, alto * 0.95, 0); g.add(verga);
  const v = vela(K, w, h, { franjas }); v.rotation.y = Math.PI / 2; v.position.set(x + 0.03, alto * 0.95 - h / 2 - 0.02, 0); g.add(v);
  return v;
}
/* el timón de espadilla: dos remos grandes a los costados de la popa */
function timones(K, g, x, B, H) { [-1, 1].forEach(l => { const t = K.malla(K.caja(0.05, 0.5 * H * 2.2, 0.02), AL.maderaD, { grosor: 0.004 }); t.position.set(x, H * 0.4, l * (B * 0.42)); t.rotation.z = 0.5; g.add(t); }); }
function marinero(K, pose = 'quieto', manto = '#8a6a4a') { const p = crearPersona(K, { piel: 2, pelo: 'corto', colorPelo: '#2a1f18', ropa: 'corta', colorRopa: '#d8cbb0', orla: manto }); p.anim(0, { pose, instantaneo: true }); return p; }
export function barco(K, variante = VARIANTES.barco) {
  const g = new THREE.Group();
  if (variante === 'grano') {
    // el gran navío del grano: casco oscuro con la franja pintada, la popa curva con la cabeza de ganso dorada (el queniscos de Luciano), la vela mayor y el artemón
    const L = 3.8, B = 0.95, H = 0.38;
    const c = casco(K, L, B, H, { color: '#5e4128', proa: 1.3, popa: 1.7 }); g.add(c);
    const banda = casco(K, L * 1.005, B * 1.02, H * 0.25, { color: AL.ocre, proa: 1.3, popa: 1.7 }); banda.position.y = H * 0.72; banda.scale.y = 1; g.add(banda);
    const cis = new THREE.Group(); cis.position.set(-L / 2 + 0.05, H * 1.65, 0); g.add(cis);   // el queniscos: el cuello de ganso de la popa
    const cu = K.malla(K.toro(0.16, 0.035, Math.PI * 1.1, 0.6), AL.oro, { grosor: 0.004, emissive: AL.oro, emissiveIntensity: 0.2 }); cu.rotation.z = Math.PI * 0.35; cu.position.set(0.05, 0.12, 0); cis.add(cu);
    pon(cis, K.malla(K.esfera(0.05, 0.5), AL.oro, { grosor: 0.003 }), -0.12, 0.25, 0).scale.set(1.4, 1, 1);
    pon(g, caja(K, 0.5, 0.22, 0.55, AL.maderaL, { grosor: 0.005 }), -L / 2 + 0.55, H + 0.11, 0);   // la cabina de popa
    pon(g, caja(K, 0.56, 0.03, 0.6, AT.teja, { grosor: 0.004 }), -L / 2 + 0.55, H + 0.235, 0);
    timones(K, g, -L / 2 + 0.25, B, H);
    mastil(K, g, 0.15, 2.2, { w: 1.7, h: 1.25, borda: H, manga: B });
    const art = new THREE.Group(); art.position.set(L / 2 - 0.25, H, 0); art.rotation.z = -0.55; g.add(art);   // el artemón, inclinado sobre la proa
    pon(art, K.malla(K.cilindro(0.015, 0.02, 0.8, 6), AL.maderaD, { grosor: 0.003 }), 0, 0.4, 0);
    const va = vela(K, 0.45, 0.32); va.rotation.y = Math.PI / 2; va.position.set(0.02, 0.6, 0); art.add(va);
    for (let i = 0; i < 6; i++) pon(g, K.malla(K.capsula(0.07, 0.1, 0.5), '#d9c49a', { grosor: 0.003 }), 0.6 + (i % 3) * 0.2, H + 0.06, (i < 3 ? -1 : 1) * 0.16).rotation.z = Math.PI / 2;   // los sacos del grano
    for (let i = 0; i < 3; i++) { const m = marinero(K, i === 1 ? 'pertiga' : 'quieto'); m.obj.position.set(-0.6 + i * 0.5, H, (i - 1) * 0.15); m.obj.rotation.y = 1.4; m.obj.scale.setScalar(0.85); g.add(m.obj); }
    g.userData.ficha = { titulo: 'El navío del grano', texto: 'lleva a Roma el trigo del Nilo; la popa remata en una cabeza de ganso dorada' };
    return g;
  }
  if (variante === 'puerto') {
    // la barca del puerto: cuatro remeros y el hombre del rey con los rollos que se llevan a la Biblioteca
    const L = 2.1, B = 0.66, H = 0.24;
    g.add(casco(K, L, B, H, { color: AL.maderaL, proa: 1.25, popa: 1.35 }));
    for (let i = 0; i < 2; i++) [-1, 1].forEach(l => {
      const r = marinero(K, 'sentado'); r.obj.scale.setScalar(0.72); r.obj.position.set(-0.4 + i * 0.5, H - 0.05, l * 0.15); r.obj.rotation.y = -Math.PI / 2; g.add(r.obj);
      const re = K.malla(K.cilindro(0.008, 0.012, 0.9, 5), AL.maderaD, { sinTinta: true }); re.rotation.x = Math.PI / 2 - l * 0.35; re.rotation.z = 0.2; re.position.set(-0.35 + i * 0.5, H + 0.05, l * 0.45); g.add(re);
    });
    const of = alejandrino(K, { manto: '#7a2f3a', rollo: true }); of.obj.position.set(L / 2 - 0.3, H, 0); of.obj.rotation.y = Math.PI / 2; of.obj.scale.setScalar(0.85); g.add(of.obj);
    for (let i = 0; i < 2; i++) { const cp = capsa(K, 1.1); cp.position.set(-L / 2 + 0.3 + i * 0.16, H, 0.05 - i * 0.1); g.add(cp); }
    g.userData.ficha = { titulo: 'La barca del puerto', texto: 'los hombres del rey revisan los barcos y se llevan los libros para copiarlos' };
    return g;
  }
  // 'libros': el mercante griego que trae libros: el ojo pintado en la proa, una vela, ánforas y cubos de rollos
  const L = 2.7, B = 0.78, H = 0.32;
  g.add(casco(K, L, B, H, { color: '#6e4a2c', proa: 1.15, popa: 1.45, espolon: true }));
  const fr = casco(K, L * 1.004, B * 1.02, H * 0.22, { color: AL.pintado, proa: 1.15, popa: 1.45 }); fr.position.y = H * 0.75; g.add(fr);
  [-1, 1].forEach(l => { const ojo = new THREE.Group(); ojo.position.set(L / 2 - 0.2, H * 0.62, l * B * 0.2); ojo.rotation.y = l > 0 ? 0.3 : Math.PI - 0.3; g.add(ojo);
    pon(ojo, K.malla(K.cilindro(0.06, 0.06, 0.01, 12), '#f4efe2', { sinTinta: true }), 0, 0, 0.005).rotation.x = Math.PI / 2;
    pon(ojo, K.malla(K.cilindro(0.03, 0.03, 0.012, 10), '#1e1a16', { sinTinta: true }), 0.01, 0, 0.007).rotation.x = Math.PI / 2; });
  timones(K, g, -L / 2 + 0.2, B, H);
  mastil(K, g, 0.05, 1.6, { w: 1.2, h: 0.9, franjas: true, borda: H, manga: B });
  for (let i = 0; i < 5; i++) { const a = anfora(K, 0.55, i % 2 ? '#b9784a' : '#a8683e'); a.position.set(-0.45 + (i % 3) * 0.17, H, (i < 3 ? -0.12 : 0.12)); g.add(a); }
  for (let i = 0; i < 3; i++) { const cp = capsa(K); cp.position.set(0.45 + i * 0.13, H, (i - 1) * 0.12); g.add(cp); }
  const sa = alejandrino(K, { manto: '#5a7a4a', rollo: true }); sa.obj.position.set(0.7, H, 0.05); sa.obj.rotation.y = Math.PI / 2 + 0.6; sa.obj.scale.setScalar(0.85); g.add(sa.obj);
  const mar1 = marinero(K, 'quieto'); mar1.obj.position.set(-0.7, H, 0); mar1.obj.rotation.y = 1.2; mar1.obj.scale.setScalar(0.85); g.add(mar1.obj);
  g.userData.ficha = { titulo: 'El mercante', texto: 'trae ánforas y cubos de rollos; el ojo de la proa mira el camino' };
  return g;
}
