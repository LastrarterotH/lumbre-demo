/* ============================================================
   agora/monumentos
   Las piezas grandes del ágora (Época 4, Atenas, siglos V y IV a. C.) en 3D, en variantes para la hoja de
   bocetos (juego3d/bocetos/agora.html): la Acrópolis, la stoa, la palestra y la Academia. La elegida por el
   usuario se fija en VARIANTES y es la que usa la época.
   EL CUIDADO (la vara de Egipto: que los atenienses estén orgullosos de nosotros):
   - El Partenón es dórico, de 8 × 17 columnas (Ictino y Calícrates, 447-432 a. C.), con las proporciones
     reales (la columna mide un tercio del ancho del estilóbato) y el techo de tejas de MÁRMOL. Los triglifos,
     las molduras y el fondo de los frontones iban pintados: el azul es azul egipcio, el mismo de la época
     anterior (se encontró en las esculturas del Partenón). El mármol blanco desnudo es obra de los siglos.
   - Los Propileos de Mnesicles (437-432 a. C.) quedaron sin terminar: la guerra paró la obra. El Erecteion
     (421-406 a. C.) es jónico, con el pórtico de las seis cariátides mirando al Partenón y el friso de piedra
     oscura de Eleusis con figuras blancas pegadas. Atenea Prómacos, el bronce de Fidias: la punta de su lanza
     se veía desde el mar, al doblar el cabo Sunión (Pausanias, I 28, 2).
   - Las stoas son las del ágora de Sócrates: la Pecile, con sus cuadros de Maratón y los escudos de Pilos
     (Pausanias, I 15); la de Zeus Eleuterio, donde Jenofonte pone a Sócrates conversando (Económico, 7, 1);
     la Real, donde empieza el Eutifrón (2a), con las leyes en estelas y la piedra del juramento delante.
   - Las palestras de la época eran patios de barrio con nombre de dueño (la de Táureas abre el Cármides, la
     de Micco el Lisis); los gimnasios públicos eran santuarios con pista y árboles (Cimón plantó plátanos y le
     llevó agua a la Academia: Plutarco, Cimón, 13). El patio con peristilo es un siglo posterior.
   - La Academia: el olivar sagrado de Atenea, el mojón que dice ΗΟΡΟΣ ΤΕΣ ΗΕΚΑΔΕΜΕΙΑΣ («límite de la
     Academia», hacia 500 a. C., hallado en su lugar), el altar de Prometeo donde partía la carrera de
     antorchas (Pausanias, I 30, 2) y el santuario de las Musas que fundó Platón.
   Escala: 1 = una baldosa; una persona adulta mide ~0,9. El frente de cada pieza mira a +z.
   ============================================================ */
import * as THREE from 'three';
import { tronco } from '../sumer/monumentos.js';
import { crearPersona } from '../actores.js';

export const AT = {
  marmol: '#f1ece0', marmolL: '#faf7ef', marmolD: '#dcd4c2', marmolS: '#c3baa5',
  poros: '#ddcfae', porosD: '#c4b48e',                     // la caliza porosa de las stoas
  roca: '#bfb39b', rocaL: '#d2c7b0', rocaD: '#9e917a', rocaR: '#b09178', cima: '#d8ccb0',   // la caliza gris de la Acrópolis, con vetas rojizas
  tierra: '#cdb98f', tierraD: '#b39f74',
  teja: '#b5533c', tejaD: '#94402f', tejaL: '#c8664b',
  azul: '#2f5fa8', azulD: '#1f3f78', rojo: '#a8392b', ocre: '#d9a640', verde: '#4f7f4a', negro: '#2b2622',
  eleusis: '#4c4a52',                                      // la piedra oscura de Eleusis del friso del Erecteion
  bronce: '#9a6b35', bronceL: '#c9944c', oro: '#e6bb4c',
  olivo: '#7d8f68', olivoL: '#a9b48f', olivoD: '#5f7150', troncoOl: '#6f5a3c',
  platano: '#6f9448', platanoL: '#8fb05e', platanoD: '#557a38', troncoPl: '#a59c86',
  arena: '#e4d2a3', arenaD: '#cdb682', madera: '#9a7046', maderaD: '#74522f',
  quiton: '#f1ebdc', himation: '#b5533c',
};
export const VARIANTES = { acropolis: 'pericles', stoa: 'zeus', palestra: 'barrio', academia: 'olivar' };   // elegidas por el usuario el 2026-09-30

export const pon = (padre, m, x, y, z, ry = 0) => { m.position.set(x, y, z); if (ry) m.rotation.y = ry; padre.add(m); return m; };
export const caja = (K, w, h, d, color, o) => K.malla(K.caja(w, h, d), color, o);
export const propia = geo => { geo.userData.propia = true; return geo; };

/* ---------- las texturas: pintadas una vez y compartidas ---------- */
const TEX = new Map();
export function textura(clave, w, h, pinta, { repetir = false, nitida = false } = {}) {
  if (TEX.has(clave)) return TEX.get(clave);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); pinta(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repetir) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (nitida) t.magFilter = THREE.NearestFilter;
  TEX.set(clave, t); return t;
}
const MATS = new WeakMap();
export function matTex(K, clave, t) { let m = MATS.get(K); if (!m) MATS.set(K, m = new Map()); if (!m.has(clave)) m.set(clave, K.matMapa(t)); return m.get(clave); }
export function lamina(K, mat, w, h) { return new THREE.Mesh(propia(new THREE.PlaneGeometry(w, h)), mat); }

/* las estrías del fuste: franjas verticales de luz y sombra que dan la vuelta a la columna */
export function estrias(K, color) {
  const t = textura('estrias' + color, 64, 4, (g, w, h) => {
    const c = new THREE.Color(color), osc = c.clone().multiplyScalar(0.86);
    for (let i = 0; i < 20; i++) { g.fillStyle = '#' + (i % 2 ? osc : c).getHexString(); g.fillRect(i * w / 20, 0, w / 20 + 1, h); }
  });
  return matTex(K, 'estrias' + color, t);
}
/* el friso dórico: triglifos azules y metopas; n metopas (y un triglifo más, el de la esquina) */
export function friso(K, n, { metopas = false } = {}) {
  const clave = `friso${n}${metopas}`;
  const t = textura(clave, 64 * n + 26, 64, (g, w, h) => {
    g.fillStyle = AT.marmol; g.fillRect(0, 0, w, h);
    for (let i = 0; i <= n; i++) {
      const x = i * 64;
      g.fillStyle = AT.azulD; g.fillRect(x, 4, 26, h - 4);
      g.fillStyle = '#16305e'; g.fillRect(x + 7, 8, 3, h - 8); g.fillRect(x + 16, 8, 3, h - 8);
      if (i < n && metopas) {                              // la metopa: el relieve de un combate, sobre fondo pintado
        g.fillStyle = 'rgba(168,57,43,.28)'; g.fillRect(x + 29, 6, 32, h - 8);
        g.fillStyle = AT.marmolD; g.beginPath(); g.ellipse(x + 38, 34, 5, 16, -0.3, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + 52, 38, 6, 13, 0.4, 0, 7); g.fill();
        g.beginPath(); g.arc(x + 36, 16, 4.5, 0, 7); g.arc(x + 55, 22, 4.5, 0, 7); g.fill();
      }
    }
    g.fillStyle = AT.rojo; g.fillRect(0, 0, w, 4);       // la tenia pintada encima del arquitrabe
  });
  return matTex(K, clave, t);
}
/* la moldura pintada de la cornisa: el kyma de ovas y dardos, rojo y azul */
export function kyma(K) {
  const t = textura('kyma', 128, 16, (g, w, h) => {
    g.fillStyle = AT.azul; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 16) { g.fillStyle = AT.rojo; g.beginPath(); g.ellipse(x + 8, 9, 5, 6, 0, 0, 7); g.fill(); g.fillStyle = AT.ocre; g.fillRect(x, 3, 2, 11); }
  }, { repetir: true });
  return matTex(K, 'kyma', t);
}
/* el tímpano del frontón: fondo azul y las figuras que caben bajo el triángulo (de pie en el centro,
   arrodilladas y recostadas hacia las esquinas, como en todo frontón griego) */
export function timpano(K, tema = 'atenea') {
  const clave = 'timpano' + tema;
  const t = textura(clave, 512, 96, (g, w, h) => {
    g.fillStyle = AT.azul; g.fillRect(0, 0, w, h);
    if (tema === 'liso') return;
    const ropas = [AT.rojo, AT.ocre, AT.verde, AT.marmol, AT.rojo, AT.ocre];
    const n = 11;
    for (let i = 0; i < n; i++) {
      const u = (i + 0.5) / n, x = u * w, alto = h * (1 - Math.abs(u - 0.5) * 2) * 0.86, k = Math.abs(i - (n - 1) / 2);
      g.fillStyle = AT.marmolL;
      if (k >= 4) { g.beginPath(); g.ellipse(x, h - 8, 20, 7, 0, 0, 7); g.fill(); g.beginPath(); g.arc(x + (i < n / 2 ? -16 : 16), h - 13, 5, 0, 7); g.fill(); continue; }   // recostadas
      const hb = Math.max(18, alto - 10);
      g.beginPath(); g.ellipse(x, h - hb / 2 - 2, 8, hb / 2, 0, 0, 7); g.fill();        // el cuerpo
      g.beginPath(); g.arc(x, h - hb - 6, 5.5, 0, 7); g.fill();                         // la cabeza
      g.fillStyle = ropas[i % ropas.length]; g.beginPath(); g.ellipse(x + 2, h - hb * 0.4, 7, hb * 0.32, 0.15, 0, 7); g.fill();   // el manto pintado
      if (k === 0 && tema === 'atenea') { g.fillStyle = AT.oro; g.fillRect(x + 9, h - hb - 14, 2.5, hb + 10); g.beginPath(); g.arc(x - 9, h - hb * 0.55, 7, 0, 7); g.fill(); }   // la lanza y el escudo de Atenea
    }
  });
  return matTex(K, clave, t);
}
/* las tejas: las cubrejuntas en relieve (rayas que bajan por la pendiente) y las hiladas; de mármol en el
   Partenón, de barro en las stoas. `baja`: 'u' o 'v', el eje de la textura que sigue la pendiente; ru y rv, cuántas
   tejas caben a lo largo de cada eje. */
export function tejas(K, tipo, baja, ru, rv) {
  const [base, raya, hilada] = tipo === 'marmol' ? [AT.marmol, '#d9d1be', '#e7e1d2'] : [AT.teja, AT.tejaD, '#a64a35'];
  const clave = `tejas${tipo}${baja}`;
  const t = textura(clave, 128, 128, (g, w, h) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let k = 0; k < w; k += 16) {
      if (baja === 'v') { g.fillStyle = hilada; g.fillRect(0, k, w, 2); g.fillStyle = raya; g.fillRect(k, 0, 4, h); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(k + 4, 0, 2, h); }
      else { g.fillStyle = hilada; g.fillRect(k, 0, 2, h); g.fillStyle = raya; g.fillRect(0, k, w, 4); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, k + 4, w, 2); }
    }
  }, { repetir: true });
  const ku = Math.max(1, Math.round(ru)), kv = Math.max(1, Math.round(rv)), cm = `${clave}_${ku}_${kv}`;
  let m = MATS.get(K); if (m && m.has(cm)) return m.get(cm);
  const c = t.clone(); c.needsUpdate = true; c.repeat.set(ku, kv);
  return matTex(K, cm, c);
}
/* letras griegas grabadas: el mojón, las leyes, el letrero */
export function grabado(K, texto, { w = 256, h = 128, fondo = AT.marmol, tinta = '#5a5246', lineas = null, tam = 26 } = {}) {
  const clave = `grab${texto}${w}${h}${fondo}${lineas}`;
  const t = textura(clave, w, h, (g) => {
    g.fillStyle = fondo; g.fillRect(0, 0, w, h);
    g.fillStyle = tinta; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `600 ${tam}px Georgia, "Times New Roman", serif`;
    const filas = texto.split('\n');
    filas.forEach((f, i) => g.fillText(f, w / 2, h / 2 + (i - (filas.length - 1) / 2) * tam * 1.15));
    if (lineas) for (let i = 0; i < lineas; i++) { g.fillStyle = 'rgba(70,64,54,.55)'; const y = 10 + i * (h - 20) / lineas; for (let x = 8; x < w - 8; x += 7 + (i * 3 + x) % 5) g.fillRect(x, y, 4, 2.4); }
  });
  return matTex(K, clave, t);
}
/* los cuadros de la Stoa Pecile, sobre tablas de madera: Maratón (los persas huyen a sus naves), la toma de
   Troya, la batalla de Énoe y las amazonas. Figuras de hoplitas con su escudo redondo. */
function cuadro(K, tema) {
  const clave = 'cuadro' + tema;
  const t = textura(clave, 256, 128, (g, w, h) => {
    const fondos = { maraton: '#d9b77a', troya: '#c9a47a', enoe: '#cfb48a', amazonas: '#d6ba86' };
    g.fillStyle = fondos[tema]; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(80,110,60,.35)'; g.fillRect(0, h * 0.78, w, h * 0.22);       // el suelo
    if (tema === 'maraton') {                             // el mar y las naves a la derecha
      g.fillStyle = '#4f7fa8'; g.fillRect(w * 0.68, h * 0.62, w * 0.32, h * 0.38);
      for (const x of [w * 0.74, w * 0.88]) { g.fillStyle = '#4a3020'; g.beginPath(); g.moveTo(x - 18, h * 0.66); g.lineTo(x + 18, h * 0.66); g.lineTo(x + 12, h * 0.76); g.lineTo(x - 14, h * 0.76); g.fill(); g.fillRect(x - 1, h * 0.36, 2.5, h * 0.3); }
    }
    if (tema === 'troya') { g.fillStyle = '#a99a80'; g.fillRect(w * 0.62, h * 0.2, w * 0.38, h * 0.58); g.fillStyle = '#8f8068'; for (let x = w * 0.62; x < w; x += 12) g.fillRect(x, h * 0.14, 7, 8); }
    const n = tema === 'maraton' ? 6 : 7;
    for (let i = 0; i < n; i++) {
      const x = 18 + i * (tema === 'maraton' ? 28 : 33), y = h * 0.78, persa = tema === 'maraton' && i > 3;
      g.fillStyle = '#5a3424'; g.fillRect(x - 3, y - 34, 7, 26);                       // el cuerpo
      g.beginPath(); g.arc(x, y - 40, 5, 0, 7); g.fill();                                // la cabeza
      g.fillRect(x - 3, y - 8, 3, 8); g.fillRect(x + 2, y - 8, 3, 8);                   // las piernas
      g.fillStyle = persa ? '#6a7f9a' : (i % 2 ? AT.rojo : '#b08a3a'); g.fillRect(x - 3, y - 30, 7, 14);   // el quitón (los persas, de pantalón y azul)
      if (!persa) { g.fillStyle = i % 2 ? '#c9944c' : '#9a6b35'; g.beginPath(); g.arc(x + 7, y - 24, 9, 0, 7); g.fill(); g.fillStyle = '#3a2a1c'; g.beginPath(); g.arc(x + 7, y - 24, 3, 0, 7); g.fill(); }   // el escudo redondo
      g.strokeStyle = '#3a2a1c'; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - 10, y - 8); g.lineTo(x + 14, y - 58); g.stroke();   // la lanza
      if (tema === 'amazonas' && i % 2) { g.fillStyle = '#7a5a3a'; g.beginPath(); g.ellipse(x + 2, y - 16, 14, 7, 0, 0, 7); g.fill(); }
    }
    g.strokeStyle = '#6a4a2a'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);     // el marco de la tabla
  });
  return matTex(K, clave, t);
}

/* ---------- LAS PIEZAS DEL ORDEN ---------- */
/* La columna dórica: sin basa, el fuste que se angosta hacia arriba con sus estrías, el equino y el ábaco. */
export function columnaDorica(K, alto, r, { color = AT.marmol, gr = 0.004 } = {}) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(r * 0.78, r, alto * 0.9, 14), estrias(K, color), { grosor: gr }), 0, alto * 0.45, 0);
  pon(g, K.malla(K.cilindro(r * 1.24, r * 0.8, alto * 0.055, 14), color, { grosor: gr }), 0, alto * 0.9275, 0);
  pon(g, caja(K, r * 2.55, alto * 0.045, r * 2.55, color, { grosor: gr }), 0, alto * 0.9775, 0);
  return g;
}
/* La columna jónica: basa de toros, fuste esbelto y el capitel de dos volutas. */
export function columnaJonica(K, alto, r, { color = AT.marmol, gr = 0.004 } = {}) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(r * 1.32, r * 1.42, alto * 0.05, 14), color, { grosor: gr }), 0, alto * 0.025, 0);
  pon(g, K.malla(K.cilindro(r * 0.86, r, alto * 0.85, 14), estrias(K, color), { grosor: gr }), 0, alto * 0.05 + alto * 0.425, 0);
  pon(g, caja(K, r * 2.1, alto * 0.05, r * 1.3, color, { grosor: gr }), 0, alto * 0.925, 0);
  [-1, 1].forEach(l => { const v = K.malla(K.cilindro(r * 0.45, r * 0.45, r * 1.4, 12), color, { grosor: gr }); v.rotation.x = Math.PI / 2; v.position.set(l * r * 1.05, alto * 0.91, 0); g.add(v); });
  pon(g, caja(K, r * 2.2, alto * 0.03, r * 2.2, color, { grosor: gr }), 0, alto * 0.965, 0);
  return g;
}
/* El entablamento dórico: arquitrabe liso, el friso de triglifos y la cornisa con su moldura pintada.
   Ancho w (x), fondo d (z), alto h; nx/nz: metopas por lado. Con `jonico`, el friso es corrido. */
export function entablamento(K, w, d, h, { nx = 8, nz = 4, metopas = false, jonico = false, frisoColor = null, gr = 0.005 } = {}) {
  const g = new THREE.Group();
  pon(g, caja(K, w, h * 0.4, d, AT.marmol, { grosor: gr }), 0, h * 0.2, 0);
  const hf = h * 0.38, yf = h * 0.4 + hf / 2;
  pon(g, caja(K, w - 0.004, hf, d - 0.004, frisoColor || AT.marmol, { grosor: gr }), 0, yf, 0);
  if (!jonico) {
    [1, -1].forEach(s => { const f = lamina(K, friso(K, nx, { metopas }), w, hf); f.position.set(0, yf, s * (d / 2 + 0.0015)); if (s < 0) f.rotation.y = Math.PI; g.add(f); });
    [1, -1].forEach(s => { const f = lamina(K, friso(K, nz, { metopas }), d, hf); f.position.set(s * (w / 2 + 0.0015), yf, 0); f.rotation.y = s * Math.PI / 2; g.add(f); });
  }
  const hc = h * 0.22;
  pon(g, caja(K, w + 0.03, hc, d + 0.03, AT.marmol, { grosor: gr }), 0, h * 0.78 + hc / 2, 0);
  const km = kyma(K);
  [1, -1].forEach(s => { const f = lamina(K, km, w + 0.03, hc * 0.45); f.position.set(0, h * 0.78 + hc * 0.3, s * (d / 2 + 0.0165)); if (s < 0) f.rotation.y = Math.PI; g.add(f); });
  [1, -1].forEach(s => { const f = lamina(K, km, d + 0.03, hc * 0.45); f.position.set(s * (w / 2 + 0.0165), h * 0.78 + hc * 0.3, 0); f.rotation.y = s * Math.PI / 2; g.add(f); });
  return g;
}
/* El tejado a dos aguas con su cumbrera a lo largo de z y un frontón en cada punta (±z): el prisma de
   piedra, el tímpano pintado un pelo hundido, las dos aguas de tejas y, si se piden, las acroteras. */
export function tejado(K, ancho, largo, alto, { tipo = 'teja', tema = 'liso', temaAtras = null, acrotera = null, gr = 0.006 } = {}) {
  const g = new THREE.Group();
  const s = new THREE.Shape(); s.moveTo(-ancho / 2, 0); s.lineTo(ancho / 2, 0); s.lineTo(0, alto); s.closePath();
  const geo = propia(new THREE.ExtrudeGeometry(s, { depth: largo, bevelEnabled: false })); geo.translate(0, 0, -largo / 2);
  g.add(K.malla(geo, AT.marmol, { grosor: gr }));
  [[1, tema], [-1, temaAtras || tema]].forEach(([l, tm]) => {
    const tr = new THREE.Shape(), m = 0.08; tr.moveTo(-ancho / 2 * (1 - m * 1.6), alto * m * 0.6); tr.lineTo(ancho / 2 * (1 - m * 1.6), alto * m * 0.6); tr.lineTo(0, alto * (1 - m * 1.2)); tr.closePath();
    const tg = propia(new THREE.ShapeGeometry(tr)), uv = tg.getAttribute('uv'), p = tg.getAttribute('position');
    for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + ancho / 2) / ancho, p.getY(i) / alto);
    const tm2 = new THREE.Mesh(tg, timpano(K, tm)); tm2.position.z = l * (largo / 2 + 0.002); if (l < 0) tm2.rotation.y = Math.PI; g.add(tm2);
  });
  const v = 0.035, ang = Math.atan2(alto, ancho / 2), lado = Math.hypot(ancho / 2, alto) + v;
  const mat = tejas(K, tipo, 'u', lado * 7, (largo + 2 * v) * 7);
  [-1, 1].forEach(l => {
    const ag = K.malla(K.caja(lado, 0.024, largo + 2 * v), mat, { grosor: gr });
    const cx = l * (ancho / 4 + Math.cos(ang) * v / 2), cy = alto / 2 - Math.sin(ang) * v / 2;
    ag.rotation.z = -l * ang; ag.position.set(cx + l * Math.sin(ang) * 0.012, cy + Math.cos(ang) * 0.012, 0);
    g.add(ag);
  });
  pon(g, caja(K, 0.03, 0.03, largo + 2 * v, tipo === 'marmol' ? AT.marmolD : AT.tejaD, { grosor: gr }), 0, alto + 0.022, 0);   // la cumbrera
  if (acrotera) [1, -1].forEach(l => {
    const a = acrotera('centro'); a.position.set(0, alto + 0.03, l * (largo / 2 + v * 0.6)); g.add(a);
    [-1, 1].forEach(e => { const b = acrotera('esquina'); b.position.set(e * (ancho / 2 + v * 0.4), 0.01, l * (largo / 2 + v * 0.6)); g.add(b); });
  });
  return g;
}
/* la acrotera de palmeta: un abanico de hojas pintadas */
export function palmeta(K, s = 0.12) {
  return (donde) => {
    const g = new THREE.Group(), e = donde === 'centro' ? s : s * 0.65;
    pon(g, caja(K, e * 0.5, e * 0.18, e * 0.3, AT.marmol, { grosor: 0.003 }), 0, e * 0.09, 0);
    for (let k = -3; k <= 3; k++) { const h = K.malla(K.capsula(e * 0.07, e * 0.42, 0.5), k % 2 ? AT.rojo : AT.azul, { grosor: 0.002 }); h.position.set(Math.sin(k * 0.32) * e * 0.3, e * 0.42 + Math.cos(k * 0.32) * e * 0.18, 0); h.rotation.z = -k * 0.32; g.add(h); }
    return g;
  };
}
/* una figura de pie en miniatura (las cariátides, las acroteras de Niké, las estatuas): cuerpo, manto y cabeza */
export function figura(K, alto, { color = AT.marmol, manto = null, cabeza = null, gr = 0.003 } = {}) {
  const g = new THREE.Group(), r = alto * 0.16;
  pon(g, K.malla(K.cilindro(r * 0.8, r * 1.05, alto * 0.72, 10), color, { grosor: gr }), 0, alto * 0.36, 0);
  if (manto) pon(g, K.malla(K.cilindro(r * 0.86, r * 0.95, alto * 0.3, 10), manto, { grosor: gr }), 0, alto * 0.58, 0);
  pon(g, K.malla(K.esfera(r * 0.62, 0.6), cabeza || color, { grosor: gr }), 0, alto * 0.82, 0);
  return g;
}

/* una estatua de tamaño natural: el cuerpo de la gente del juego, de un solo color (mármol o bronce) */
export function estatua(K, { color = AT.marmol, barba = true, pelo = 'rizos', ropa = 'tunica', pose = 'quieto', escala = 0.8 } = {}) {
  const p = crearPersona(K, { pelo, barba, ropa, colorRopa: color, colorPelo: color, chal: color });
  p.anim(0, { pose, instantaneo: true });
  const mat = K.mat(color);
  p.obj.traverse(o => { if (o.isMesh && !o.userData.tinta && o.material && o.material.visible !== false) o.material = mat; });
  p.obj.scale.setScalar(escala);
  return p.obj;
}

/* ---------- EL TEMPLO DÓRICO ---------- */
/* Períptero: cols al frente (±z), lados por costado. W: ancho del estilóbato; la columna mide un tercio de W
   (las proporciones del Partenón). Devuelve el grupo con el frente al este = +z y el alto total en userData. */
export function templo(K, { cols = 8, lados = 17, W = 1.4, techo = 'marmol', tema = 'atenea', temaAtras = 'poseidon', metopas = true, puerta = false, obra = false, gr = 0.005 } = {}) {
  const g = new THREE.Group(), H = W * 0.337, r = W / cols * 0.22, m = r * 1.7;
  const s = (W - 2 * m) / (cols - 1), L = 2 * m + s * (lados - 1);
  const hs = H * 0.06;                                     // las tres gradas del crepidoma
  for (let k = 0; k < 3; k++) { const e = (2 - k) * hs * 1.3; pon(g, caja(K, W + 2 * e, hs, L + 2 * e, AT.marmol, { grosor: gr }), 0, hs * (k + 0.5), 0); }
  const y0 = hs * 3;
  const cel = new THREE.Group(); cel.position.y = y0; g.add(cel);
  const cw = W - 2 * m - s * 1.1, cl = L - 2 * m - s * 2.6;
  pon(cel, caja(K, cw, H * (obra ? 0.55 : 1), cl, AT.marmolD, { grosor: gr }), 0, H * (obra ? 0.275 : 0.5), 0);
  if (!obra) {
    pon(cel, caja(K, cw * 0.28, H * 0.62, 0.01, '#3a2c20', { sinTinta: true }), 0, H * 0.31, cl / 2 + 0.006);   // la gran puerta del este
    if (puerta) {                                            // por la puerta abierta, el oro de la Atenea Pártenos de Fidias
      const at = figura(K, H * 0.5, { color: AT.oro, manto: AT.oro, cabeza: '#e8dcc6' }); at.position.set(0, 0, cl / 2 - 0.03); at.traverse(o => { if (o.isMesh && o.material?.color && !o.userData.tinta) o.material = K.mat(AT.oro, { emissive: AT.oro, emissiveIntensity: 0.35 }); }); cel.add(at);
    }
  }
  for (let j = 0; j < lados; j++) for (let i = 0; i < cols; i++) {
    if (i > 0 && i < cols - 1 && j > 0 && j < lados - 1) continue;
    if (obra && (i + j) % 3 === 1) continue;                 // la obra: faltan columnas
    const c = columnaDorica(K, obra && (i + j) % 2 ? H * 0.55 : H, r, { gr: gr * 0.8 }); c.position.set(-W / 2 + m + i * s, y0, -L / 2 + m + j * s); g.add(c);
  }
  if (obra) { g.userData.alto = y0 + H; return g; }
  const he = H * 0.4;
  const en = entablamento(K, W - 2 * m + r * 2.6, L - 2 * m + r * 2.6, he, { nx: (cols - 1) * 2, nz: (lados - 1) * 2, metopas, gr }); en.position.y = y0 + H; g.add(en);
  const te = tejado(K, W - 2 * m + r * 2.6 + 0.03, L - 2 * m + r * 2.6 + 0.03, (W / 2) * 0.25, { tipo: techo, tema, temaAtras, acrotera: palmeta(K, W * 0.09), gr });
  te.position.y = y0 + H + he; g.add(te);
  g.userData.alto = y0 + H + he + W * 0.125; g.userData.largo = L;
  return g;
}

/* ---------- LA ACRÓPOLIS ---------- */
/* La roca: la ciudadela alargada de este a oeste (x), con el contorno de la planta real (los lados largos casi rectos,
   las esquinas marcadas, el oeste angosto donde están los Propileos), farallones de caliza con grietas VERTICALES
   (no franjas: así se ve la roca desde el ágora), el talud de piedras y matas al pie, la muralla recta y lisa sobre
   el borde (la de Cimón, al sur, baja por la pared como muro de contención) y la ladera de acceso del oeste, la única
   suave, con la rampa. Referencias: la maqueta del siglo V a. C. del Altes Museum y la vista desde el ágora. */
const BORDE = [[-3.0, -0.05], [-2.7, -0.62], [-1.85, -0.98], [-0.55, -1.13], [0.85, -1.2], [2.05, -1.1], [2.8, -0.68], [3.02, 0.05], [2.75, 0.82], [1.3, 1.13], [-0.5, 1.08], [-1.75, 0.9], [-2.62, 0.58]];
function hash3(x, y, z) { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); }
function colorear(geo, fn) {
  const gg = geo.index ? geo.toNonIndexed() : geo, p = gg.getAttribute('position'), col = [], a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), k = new THREE.Color();
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
    n.subVectors(c, b).cross(a.clone().sub(b)).normalize();
    k.set(fn(n, (a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3, i / 3));
    for (let j = 0; j < 3; j++) col.push(k.r, k.g, k.b);
  }
  gg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); gg.computeVertexNormals(); gg.userData.propia = true; return gg;
}
function roca(K, { esc = 1, alto = 1.5, talud = 0.85, bt = 0.72, semilla = 0, acceso = true } = {}) {
  const g = new THREE.Group(), BT = bt;
  const forma = f => { const s = new THREE.Shape(); BORDE.forEach(([x, z], i) => { const p = [x * esc * f, -z * esc * f]; i ? s.lineTo(...p) : s.moveTo(...p); }); s.closePath(); return s; };
  // el talud: el borde ensanchado que sube, recto, hasta el pie de la pared
  const tg = new THREE.ExtrudeGeometry(forma(1), { depth: 0.01, bevelEnabled: true, bevelThickness: BT, bevelSize: talud, bevelSegments: 1 }); tg.rotateX(-Math.PI / 2);
  const tal = colorear(tg, (n, x, y, z) => { if (n.y < -0.5) return AT.tierraD; const h = hash3(Math.round(x * 5), Math.round(z * 5), semilla); return h > 0.62 ? '#6f8752' : h > 0.42 ? '#8a9a62' : h > 0.2 ? '#b8a77c' : '#a89a72'; });   // la ladera con monte bajo: lentisco, tomillo y tierra
  g.add(K.malla(tal, '#ffffff', { vertexColors: true, grosor: 0.012 }));
  // la pared: caliza gris con farallones verticales; el borde de arriba queda limpio, para que la muralla asiente
  const pg = new THREE.ExtrudeGeometry(forma(0.97), { depth: alto, steps: 8, bevelEnabled: false }); pg.rotateX(-Math.PI / 2);
  const pp = pg.getAttribute('position');
  for (let i = 0; i < pp.count; i++) {
    const x = pp.getX(i), y = pp.getY(i), z = pp.getZ(i), d = Math.hypot(x / 2.9, z / 1.15) || 1, ux = x / (2.9 * d), uz = z / (1.15 * d);
    if (y < 0.01 || y > alto - 0.01) continue;
    const veta = Math.round(Math.atan2(z / 1.15, x / 2.9) * 17), fil = Math.round(y / alto * 8), cerca = Math.min(1, (alto - y) / 0.25);
    const sale = ((hash3(veta, 3, semilla) - 0.5) * 0.26 + (hash3(veta, fil, 7) - 0.5) * 0.12 + (hash3(Math.round(x * 40), Math.round(y * 40), Math.round(z * 40)) - 0.5) * 0.05) * cerca + (1 - y / alto) * 0.12;
    pp.setXYZ(i, x + ux * sale, y, z + uz * sale);
  }
  const ROCAS = ['#b9b1a1', '#a1988a', '#c3b9a7', '#8e8577', '#b0a08b', '#a8957f'];   // caliza gris con manchas de óxido
  const par = colorear(pg, (n, x, y, z) => n.y > 0.7 ? (hash3(Math.round(x * 4), Math.round(z * 4), 2) > 0.8 ? '#cfc2a4' : AT.cima)
    : (() => { const c = new THREE.Color(ROCAS[Math.floor(hash3(Math.round(Math.atan2(z / 1.15, x / 2.9) * 17), Math.round(y / alto * 4), semilla) * 6)]); const lado = n.x * 0.7 + n.z * 0.7; if (lado < -0.2) c.multiplyScalar(0.82); return '#' + c.getHexString(); })());
  pon(g, K.malla(par, '#ffffff', { vertexColors: true, grosor: 0.012 }), 0, BT - 0.005, 0);
  const cima = BT + alto - 0.005;
  // la muralla, recta y lisa sobre el borde; al sur, la de Cimón baja por la pared como muro de contención
  BORDE.forEach(([x, z], i) => {
    const [x2, z2] = BORDE[(i + 1) % BORDE.length], f = 0.955 * esc, sur = (z + z2) / 2 > 0.4;
    const ax = x * f, az = z * f, bx = x2 * f, bz = z2 * f, lar = Math.hypot(bx - ax, bz - az), h = sur ? 0.36 : 0.2;
    const mu = caja(K, lar + 0.06, h, 0.09, sur ? '#d9c9a2' : '#d0c19f', { grosor: 0.007 }); mu.position.set((ax + bx) / 2, cima + 0.2 - h / 2, (az + bz) / 2); mu.rotation.y = -Math.atan2(bz - az, bx - ax); g.add(mu);
  });
  // los peñascos caídos al pie de la pared, las matas y algún olivo y ciprés en el talud
  for (let i = 0; i < 70; i++) {
    const [x, z] = BORDE[i % BORDE.length], [x2, z2] = BORDE[(i + 1) % BORDE.length], u = hash3(i, 1, semilla);
    const px = (x + (x2 - x) * u) * esc, pz = (z + (z2 - z) * u) * esc, d = Math.hypot(px / 2.9, pz / 1.15) || 1, ux = px / (2.9 * d), uz = pz / (1.15 * d);
    const sale = 0.1 + hash3(i, 2, 0) * (talud - 0.12), y = BT * (1 - sale / talud);
    const m = i % 3 === 0 ? K.malla(K.roca(0.06 + hash3(i, 4, 0) * 0.08, i % 5), i % 2 ? AT.rocaD : AT.roca, { grosor: 0.004 }) : K.malla(K.esfera(0.05 + hash3(i, 3, 0) * 0.06, 0.6), i % 4 ? AT.olivoD : AT.olivo, { grosor: 0.004 });
    m.position.set(px + ux * sale, y + 0.02, pz + uz * sale); if (i % 3) m.scale.y = 0.75; g.add(m);
  }
  /* el bosque de la ladera: olivos y cipreses repartidos por el talud (desde el ágora, la roca sale de un monte verde) */
  for (let i = 0; i < 22; i++) {
    const [x, z] = BORDE[i % BORDE.length], [x2, z2] = BORDE[(i + 1) % BORDE.length], u = hash3(i, 9, semilla);
    const px = (x + (x2 - x) * u) * esc, pz = (z + (z2 - z) * u) * esc, d = Math.hypot(px / 2.9, pz / 1.15) || 1, ux = px / (2.9 * d), uz = pz / (1.15 * d);
    const sale = 0.3 + hash3(i, 8, 0) * (talud - 0.25), y = BT * (1 - sale / talud);
    let o;
    if (i % 3 === 0) { o = K.malla(K.esfera(0.1, 0.7), '#3f5f3a', { grosor: 0.005 }); o.scale.set(1, 3.0, 1); o.position.set(px + ux * sale, y + 0.27, pz + uz * sale); }
    else { o = olivo(K, 0.62 + hash3(i, 6, 0) * 0.2, 40 + i); o.position.set(px + ux * sale, y - 0.02, pz + uz * sale); }
    g.add(o);
  }
  // la ladera del oeste: la única suave, por donde sube la procesión
  if (acceso) {
    const x0 = -4.5 * esc, x1 = -2.92 * esc, h = cima - 0.1, sh = new THREE.Shape(); sh.moveTo(x0, 0); sh.lineTo(x1, 0); sh.lineTo(x1, h); sh.closePath();
    const wg = new THREE.ExtrudeGeometry(sh, { depth: 1.2 * esc, bevelEnabled: false }); wg.translate(0, 0, -0.6 * esc + 0.05);
    const lad = colorear(wg, (n, x, y) => Math.abs(n.z) > 0.7 ? (y > h * 0.5 ? '#b29e86' : '#c2ad80') : hash3(Math.round(x * 5), Math.round(y * 5), 3) > 0.7 ? AT.olivoD : '#c7b48a');
    g.add(K.malla(lad, '#ffffff', { vertexColors: true, grosor: 0.01 }));
    for (let i = 0; i < 9; i++) {                         // el monte de la ladera, a los dos lados de la rampa
      const u = 0.12 + (i / 9) * 0.8, x = x0 + (x1 - x0) * u, lado = i % 2 ? 0.5 : -0.42, yy = h * u;
      if (i % 3 === 1) { const c = K.malla(K.esfera(0.09, 0.7), '#3f5f3a', { grosor: 0.005 }); c.scale.set(1, 2.8, 1); c.position.set(x, yy + 0.22, lado * esc); g.add(c); }
      else { const m = K.malla(K.esfera(0.08 + hash3(i, 2, 5) * 0.05, 0.6), i % 2 ? AT.olivoD : '#7d8a5c', { grosor: 0.004 }); m.scale.y = 0.7; m.position.set(x, yy + 0.04, (lado + (hash3(i, 3, 5) - 0.5) * 0.1) * esc); g.add(m); }
    }
    g.userData.ladera = { x0, x1, h };
  }
  g.userData.cima = cima;
  return g;
}
/* la rampa del oeste: sube por la ladera hasta los Propileos, con sus pretiles y los listones que traban el paso */
function rampa(K, lad) {
  const g = new THREE.Group(); if (!lad) return g;
  const { x0, x1, h } = lad, lar = Math.hypot(x1 - x0, h), ang = Math.atan2(h, x1 - x0);
  const r = new THREE.Group(); r.rotation.z = ang; r.position.set((x0 + x1) / 2, h / 2 + 0.03, 0.05); g.add(r);
  pon(r, caja(K, lar, 0.06, 0.5, AT.poros, { grosor: 0.008 }), 0, 0, 0);
  [-1, 1].forEach(l => pon(r, caja(K, lar, 0.08, 0.05, '#d3c6a6', { grosor: 0.006 }), 0, 0.06, l * 0.26));
  for (let k = 1; k < 12; k++) pon(r, caja(K, 0.02, 0.012, 0.46, AT.porosD, { sinTinta: true }), -lar / 2 + k * lar / 12, 0.036, 0);
  return g;
}
/* los Propileos de Mnesicles: el pórtico de seis columnas dóricas que mira al oeste (+z de su marco), el ala
   norte de la Pinacoteca y el ala sur. `obra`: como quedaron en 432 a. C., sin terminar, con la grúa. */
function propileos(K, { obra = false } = {}) {
  const g = new THREE.Group(), H = 0.32, r = 0.022;
  pon(g, caja(K, 0.62, 0.04, 0.62, AT.marmol, { grosor: 0.004 }), 0, 0.02, 0);
  pon(g, caja(K, 0.5, H, 0.36, AT.marmolD, { grosor: 0.005 }), 0, 0.04 + H / 2, -0.1);           // el cuerpo con las cinco puertas
  for (let i = 0; i < 6; i++) { const c = columnaDorica(K, H, r, { gr: 0.003 }); c.position.set(-0.24 + i * 0.096, 0.04, 0.22); g.add(c); }
  if (!obra) {
    const en = entablamento(K, 0.56, 0.62, H * 0.38, { nx: 10, nz: 10, gr: 0.004 }); en.position.set(0, 0.04 + H, 0); g.add(en);
    const te = tejado(K, 0.59, 0.65, 0.07, { tipo: 'marmol', tema: 'liso', acrotera: palmeta(K, 0.05), gr: 0.004 }); te.position.set(0, 0.04 + H * 1.38, 0); g.add(te);
  } else { pon(g, caja(K, 0.56, 0.05, 0.08, AT.marmol, { grosor: 0.004 }), 0, 0.04 + H + 0.025, 0.22); }
  [-1, 1].forEach(l => {                                   // las alas: la Pinacoteca al norte (-x) es la grande
    const w = l < 0 ? 0.36 : 0.24, x = l * (0.31 + w / 2);
    pon(g, caja(K, w, H * 0.7, 0.3, AT.marmolD, { grosor: 0.004 }), x, H * 0.35, 0.02);
    for (let i = 0; i < 3; i++) { const c = columnaDorica(K, H * 0.7, r * 0.8, { gr: 0.003 }); c.position.set(x - w / 2 + 0.05 + i * (w - 0.1) / 2, 0, 0.2); g.add(c); }
    if (!obra || l < 0) pon(g, caja(K, w + 0.02, 0.05, 0.36, AT.marmol, { grosor: 0.004 }), x, H * 0.7 + 0.025, 0.05);
  });
  if (obra) {                                              // la grúa de madera con su bloque colgando, y los bloques en el suelo
    const gr = new THREE.Group(); gr.position.set(0.42, 0, 0.42); g.add(gr);
    [-1, 1].forEach(l => { const p = K.malla(K.cilindro(0.008, 0.01, 0.7, 6), AT.madera, { grosor: 0.003 }); p.position.set(l * 0.07, 0.33, 0); p.rotation.z = -l * 0.12; gr.add(p); });
    const b = K.malla(K.cilindro(0.006, 0.006, 0.42, 6), AT.madera, { grosor: 0.002 }); b.rotation.z = 1.2; b.position.set(-0.12, 0.62, 0); gr.add(b);
    pon(gr, K.malla(K.cilindro(0.002, 0.002, 0.25, 4), '#5a4a3a', { sinTinta: true }), -0.3, 0.6, 0);
    pon(gr, caja(K, 0.09, 0.06, 0.06, AT.marmol, { grosor: 0.003 }), -0.3, 0.45, 0);
    for (let i = 0; i < 5; i++) pon(g, caja(K, 0.1, 0.05, 0.06, AT.marmol, { grosor: 0.003 }), -0.35 + i * 0.13, 0.025, 0.42 + (i % 2) * 0.08, i * 0.4);
  }
  return g;
}
/* el Erecteion: el templo jónico de Atenea Polias y Erecteo; el pórtico del este de seis columnas, el del norte
   más alto, y al sur (−x de su marco: mirando al Partenón) el de las seis cariátides. El friso es de piedra
   oscura de Eleusis, con las figuras de mármol blanco pegadas encima. */
function erecteion(K) {
  const g = new THREE.Group(), W = 0.42, L = 0.78, H = 0.26, r = 0.017;
  pon(g, caja(K, W + 0.06, 0.04, L + 0.06, AT.marmol, { grosor: 0.004 }), 0, 0.02, 0);
  pon(g, caja(K, W, H, L, AT.marmolD, { grosor: 0.005 }), 0, 0.04 + H / 2, -0.04);
  for (let i = 0; i < 6; i++) { const c = columnaJonica(K, H, r, { gr: 0.003 }); c.position.set(-W / 2 + 0.03 + i * (W - 0.06) / 5, 0.04, L / 2 + 0.03); g.add(c); }
  const fr = textura('eleusis', 256, 16, (gg, w, h) => { gg.fillStyle = AT.eleusis; gg.fillRect(0, 0, w, h); gg.fillStyle = AT.marmolL; for (let x = 4; x < w; x += 11 + (x % 7)) { gg.fillRect(x, 4, 3, 9); gg.beginPath(); gg.arc(x + 1.5, 3.5, 2, 0, 7); gg.fill(); } }, { repetir: true });
  const en = entablamento(K, W + 0.02, L + 0.1, H * 0.36, { jonico: true, frisoColor: AT.eleusis, gr: 0.004 }); en.position.set(0, 0.04 + H, 0.01); g.add(en);
  [[0, 0.04 + H + H * 0.36 * 0.59, (L + 0.1) / 2 + 0.012, 0, W + 0.02], [W / 2 + 0.013, 0.04 + H + H * 0.36 * 0.59, 0.01, Math.PI / 2, L + 0.1], [-W / 2 - 0.013, 0.04 + H + H * 0.36 * 0.59, 0.01, -Math.PI / 2, L + 0.1]].forEach(([x, y, z, ry, w]) => {
    const f = lamina(K, matTex(K, 'eleusis', fr), w, H * 0.36 * 0.36); f.position.set(x, y, z); f.rotation.y = ry; g.add(f);
  });
  const te = tejado(K, W + 0.05, L + 0.13, 0.06, { tipo: 'marmol', tema: 'liso', gr: 0.004 }); te.position.set(0, 0.04 + H * 1.36, 0.01); g.add(te);
  // el pórtico norte (+x de su marco), más alto: cuatro columnas al frente
  const pn = new THREE.Group(); pn.position.set(W / 2 + 0.13, 0, 0.1); g.add(pn);
  pon(pn, caja(K, 0.26, 0.03, 0.32, AT.marmol, { grosor: 0.004 }), 0, 0.015, 0);
  for (let i = 0; i < 4; i++) { const c = columnaJonica(K, H * 1.15, r * 1.05, { gr: 0.003 }); c.position.set(0.1, 0.03, -0.12 + i * 0.08); pn.add(c); }
  pon(pn, caja(K, 0.28, 0.06, 0.34, AT.marmol, { grosor: 0.004 }), 0, 0.03 + H * 1.15 + 0.03, 0);
  // el pórtico de las cariátides, al sur, sobre su podio
  const pc = new THREE.Group(); pc.position.set(-W / 2 - 0.1, 0, -0.18); g.add(pc);
  pon(pc, caja(K, 0.2, 0.09, 0.24, AT.marmol, { grosor: 0.004 }), 0, 0.045, 0);
  [[-0.06, -0.085], [-0.06, -0.03], [-0.06, 0.03], [-0.06, 0.085], [0.03, -0.085], [0.03, 0.085]].forEach(([x, z]) => {
    const k = figura(K, 0.15, { color: AT.marmolL, manto: AT.marmol }); k.position.set(x, 0.09, z); pc.add(k);
    pon(pc, K.malla(K.cilindro(0.016, 0.01, 0.018, 8), AT.marmol, { grosor: 0.002 }), x, 0.09 + 0.155, z);   // el capitel-cesto sobre la cabeza
  });
  pon(pc, caja(K, 0.22, 0.04, 0.26, AT.marmol, { grosor: 0.004 }), 0, 0.09 + 0.18, 0);
  return g;
}
/* el templo de Atenea Niké (de la Victoria), jónico y chico, sobre el bastión del suroeste */
function nike(K) {
  const g = new THREE.Group(), H = 0.16, r = 0.012;
  pon(g, caja(K, 0.22, 0.025, 0.34, AT.marmol, { grosor: 0.003 }), 0, 0.0125, 0);
  pon(g, caja(K, 0.17, H, 0.17, AT.marmolD, { grosor: 0.003 }), 0, 0.025 + H / 2, 0);
  [-1, 1].forEach(l => { for (let i = 0; i < 4; i++) { const c = columnaJonica(K, H, r, { gr: 0.002 }); c.position.set(-0.08 + i * 0.053, 0.025, l * 0.135); g.add(c); } });
  const en = entablamento(K, 0.2, 0.32, H * 0.36, { jonico: true, gr: 0.003 }); en.position.y = 0.025 + H; g.add(en);
  const te = tejado(K, 0.22, 0.34, 0.035, { tipo: 'marmol', tema: 'liso', gr: 0.003 }); te.position.y = 0.025 + H * 1.36; g.add(te);
  return g;
}
/* Atenea Prómacos: el bronce de Fidias, de pie, con el escudo y la lanza de punta dorada */
function promacos(K, s = 1) {
  const g = new THREE.Group(); g.scale.setScalar(s);
  pon(g, caja(K, 0.13, 0.1, 0.13, AT.marmol, { grosor: 0.004 }), 0, 0.05, 0);
  pon(g, K.malla(K.cilindro(0.035, 0.058, 0.2, 10), AT.bronce, { grosor: 0.003 }), 0, 0.2, 0);          // el peplo
  pon(g, K.malla(K.cilindro(0.03, 0.035, 0.1, 10), AT.bronce, { grosor: 0.003 }), 0, 0.34, 0);          // el torso
  pon(g, K.malla(K.esfera(0.026, 0.6), AT.bronceL, { grosor: 0.003 }), 0, 0.415, 0);                      // la cabeza
  pon(g, caja(K, 0.008, 0.035, 0.06, AT.rojo, { grosor: 0.002 }), 0, 0.452, -0.004);                     // la cimera del casco
  const lz = K.malla(K.cilindro(0.004, 0.004, 0.5, 5), AT.bronce, { grosor: 0.002 }); lz.position.set(0.05, 0.33, 0.01); g.add(lz);
  const pu = K.malla(K.cono(0.009, 0.04, 5), AT.oro, { emissive: AT.oro, emissiveIntensity: 0.5, grosor: 0.002 }); pu.position.set(0.05, 0.6, 0.01); g.add(pu);
  const es = K.malla(K.cilindro(0.06, 0.06, 0.01, 16), AT.bronceL, { grosor: 0.003 }); es.rotation.z = Math.PI / 2; es.rotation.y = 0.3; es.position.set(-0.05, 0.26, 0.01); g.add(es);
  return g;
}
/* el altar grande de Atenea, al este: donde terminaba la procesión de las Panateneas */
export function altar(K, s = 1, llama = true) {
  const g = new THREE.Group(); g.scale.setScalar(s);
  pon(g, caja(K, 0.34, 0.04, 0.2, AT.marmol, { grosor: 0.004 }), 0, 0.02, 0);
  pon(g, caja(K, 0.28, 0.1, 0.14, AT.marmolD, { grosor: 0.004 }), 0, 0.09, 0);
  [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.025, 0.025, 0.14, 8), AT.marmol, { grosor: 0.003 }), l * 0.14, 0.15, 0).rotation.x = Math.PI / 2);   // las volutas de los extremos
  if (llama) { const f = K.malla(K.cono(0.03, 0.08, 6), '#ffb13b', { emissive: '#ff8a2a', emissiveIntensity: 0.9, sinTinta: true }); f.position.y = 0.18; f.userData.llama = true; g.add(f); }
  return g;
}

/* lo que llenaba la cumbre (la maqueta del Altes Museum): la Calcoteca, el almacén de los bronces de Atenea, con su
   pórtico; el santuario de Artemisa Braurónica, un pórtico con dos alas; la casa de las Arréforas, las niñas que
   tejían el peplo de la diosa; y el Pandroseion, con el olivo que Atenea le regaló a la ciudad */
function salaConPortico(K, w, d, h, cols, alas = false) {
  const g = new THREE.Group();
  pon(g, caja(K, w, h, d, AT.poros, { grosor: 0.005 }), 0, h / 2, -0.04);
  for (let i = 0; i < cols; i++) { const c = columnaDorica(K, h * 0.85, 0.016, { gr: 0.003 }); c.position.set(-w / 2 + 0.05 + i * (w - 0.1) / (cols - 1), 0, d / 2 + 0.03); g.add(c); }
  pon(g, caja(K, w + 0.04, 0.04, d + 0.1, AT.marmol, { grosor: 0.004 }), 0, h * 0.85 + 0.02, 0.01);
  [-1, 1].forEach(l => { const t = K.malla(K.caja(w + 0.08, 0.02, (d + 0.12) / 2 / Math.cos(0.4)), l < 0 ? AT.tejaD : AT.tejaL, { grosor: 0.004 }); t.rotation.x = l * 0.4; t.position.set(0, h * 0.85 + 0.06, l * (d + 0.12) / 4); g.add(t); });
  if (alas) [-1, 1].forEach(l => pon(g, caja(K, 0.12, h * 0.9, d * 0.7, AT.poros, { grosor: 0.004 }), l * (w / 2 - 0.06), h * 0.45, d * 0.55));
  return g;
}
function pandroseion(K) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.42, 0.06, 0.04, AT.marmolD, { grosor: 0.003 }), 0, 0.03, -0.18); pon(g, caja(K, 0.42, 0.06, 0.04, AT.marmolD, { grosor: 0.003 }), 0, 0.03, 0.18);
  pon(g, caja(K, 0.04, 0.06, 0.36, AT.marmolD, { grosor: 0.003 }), -0.19, 0.03, 0); pon(g, caja(K, 0.04, 0.06, 0.36, AT.marmolD, { grosor: 0.003 }), 0.19, 0.03, 0);
  const o = olivo(K, 0.5, 31); g.add(o);
  return g;
}

/* LA ACRÓPOLIS. 'partenon' (hacia 432 a. C.: el Partenón recién terminado y los Propileos en obra), 'pericles'
   (hacia 400 a. C.: completa, con el Erecteion, Niké, la Prómacos y lo que llenaba la cumbre) o 'cerca' (el Partenón
   solo, grande, sobre una roca baja). El este es +x; el sur, el lado que mira al ágora del juego, +z. */
export function acropolis(K, variante = VARIANTES.acropolis) {
  const g = new THREE.Group();
  if (variante === 'cerca') {
    const ro = roca(K, { esc: 0.86, alto: 0.32, talud: 0.3, bt: 0.12, semilla: 3 }); g.add(ro);
    const y = ro.userData.cima;
    const pa = templo(K, { W: 1.32, puerta: true, gr: 0.006 }); pa.rotation.y = Math.PI / 2; pa.position.set(0.35, y, 0.12); g.add(pa);
    const al = altar(K, 1.3); al.position.set(2.05, y, 0.05); al.rotation.y = Math.PI / 2; g.add(al);
    const pr = promacos(K, 1.2); pr.position.set(-1.55, y, -0.2); g.add(pr);
    g.add(rampa(K, ro.userData.ladera));
    g.userData.ficha = { titulo: 'El Partenón', texto: 'la casa de Atenea Pártenos, la virgen: mármol del Pentélico, pintado' };
    return g;
  }
  const ro = roca(K, { semilla: variante === 'partenon' ? 1 : 2 }); g.add(ro);
  const y = ro.userData.cima, en = (o, x, z, ry = 0, s = 1) => { o.position.set(x, y, z); o.rotation.y = ry; o.scale.setScalar(s); g.add(o); return o; };
  en(templo(K, { W: 1.05, gr: 0.004 }), 0.8, 0.4, Math.PI / 2);                                   // el Partenón, al sur de la cumbre
  en(promacos(K, 1.8), -1.4, -0.2);
  en(propileos(K, { obra: variante === 'partenon' }), -2.32, -0.05, -Math.PI / 2, 1.05);
  g.add(rampa(K, ro.userData.ladera));
  if (variante === 'pericles') {
    en(erecteion(K), -0.35, -0.6, Math.PI / 2, 1.15);
    const bas = caja(K, 0.55, y - 0.45, 0.5, AT.poros, { grosor: 0.008 }); bas.position.set(-2.55, 0.5 + (y - 0.45) / 2 - 0.02, 0.82); g.add(bas);   // el bastión, pegado a la roca
    en(nike(K), -2.57, 0.82, -Math.PI / 2, 1.25).position.y = y - 0.02;
    en(altar(K, 1.0), 1.0, -0.62, Math.PI / 2);                                                       // el gran altar de Atenea
    en(salaConPortico(K, 0.95, 0.32, 0.26, 7), -0.9, 0.74, Math.PI);                                 // la Calcoteca
    en(salaConPortico(K, 0.62, 0.34, 0.24, 5, true), -1.68, 0.58, Math.PI);                            // el santuario de Artemisa Braurónica
    en(salaConPortico(K, 0.3, 0.24, 0.22, 3), -1.15, -0.85, 0);                                       // la casa de las Arréforas
    en(pandroseion(K), -1.0, -0.42);                                                                   // el olivo de Atenea
    [0.25, 0.55, 1.4, 1.7].forEach((x, i) => en(figura(K, 0.12 + (i % 2) * 0.03, { color: i % 3 ? AT.marmol : AT.bronce }), x, -0.3 - (i % 2) * 0.08));   // las estatuas votivas
  } else {
    // en 432 a. C. todavía están los cimientos del templo viejo, el que quemaron los persas
    pon(g, caja(K, 0.38, 0.05, 0.72, AT.rocaL, { grosor: 0.004 }), 0.05, y + 0.025, -0.55, Math.PI / 2);
    for (let i = 0; i < 4; i++) pon(g, K.malla(K.cilindro(0.02, 0.022, 0.06 + (i % 2) * 0.05, 8), AT.poros, { grosor: 0.003 }), -0.25 + i * 0.18, y + 0.05 + (i % 2) * 0.025, -0.43);
  }
  g.userData.ficha = { titulo: 'La Acrópolis', texto: 'la roca de Atenea: el Partenón arriba, y toda Atenas a sus pies' };
  return g;
}

/* ---------- LA STOA: la «escuela» del ágora ---------- */
/* Columnata dórica al frente (+z), una fila jónica por dentro, el muro de atrás y el tejado a dos aguas con
   un frontón en cada punta. L: largo, D: fondo, H: alto de la columna. */
function cuerpoStoa(K, L, D, H, { cols = 13, interior = 6, color = AT.poros, tejaTipo = 'teja', tema = 'liso', acrotera = null, gr = 0.006, sinColumnas = [] } = {}) {
  const g = new THREE.Group(), r = 0.055;
  pon(g, caja(K, L + 0.12, 0.05, D + 0.12, AT.marmol, { grosor: gr }), 0, 0.025, 0);                   // el estilóbato
  pon(g, caja(K, L + 0.24, 0.05, D + 0.24, AT.marmolD, { grosor: gr }), 0, -0.02, 0.0);
  pon(g, caja(K, L, H + 0.02, 0.1, color, { grosor: gr }), 0, 0.05 + H / 2, -D / 2 + 0.05);           // el muro de atrás
  [-1, 1].forEach(l => pon(g, caja(K, 0.1, H + 0.02, D, color, { grosor: gr }), l * (L / 2 - 0.05), 0.05 + H / 2, 0));   // los muros de las puntas
  pon(g, caja(K, L - 0.2, 0.012, D - 0.15, '#e8dcc0', { sinTinta: true, sombra: false }), 0, 0.056, 0.02);   // el enlosado
  for (let i = 0; i < cols; i++) {
    if (sinColumnas.includes(i)) continue;
    const c = columnaDorica(K, H, r, { color: AT.marmol, gr: gr * 0.7 }); c.position.set(-L / 2 + 0.1 + i * (L - 0.2) / (cols - 1), 0.05, D / 2 - 0.08); g.add(c);
  }
  for (let i = 0; i < interior; i++) { const c = columnaJonica(K, H * 1.08, r * 0.8, { gr: gr * 0.7 }); c.position.set(-L / 2 + L * (i + 0.5) / interior, 0.05, 0.0); g.add(c); }
  const he = H * 0.3;
  const en = entablamento(K, L, D, he, { nx: (cols - 1) * 2, nz: 6, gr }); en.position.y = 0.05 + H; g.add(en);
  const te = tejado(K, D + 0.04, L + 0.04, D * 0.24, { tipo: tejaTipo, tema, acrotera, gr }); te.rotation.y = Math.PI / 2; te.position.y = 0.05 + H + he; g.add(te);
  g.userData.alto = 0.05 + H + he + D * 0.24;
  return g;
}
/* el banco corrido de piedra, donde se sentaba a conversar quien pasaba */
export function banco(K, largo) { const g = new THREE.Group(); pon(g, caja(K, largo, 0.04, 0.16, AT.marmol, { grosor: 0.004 }), 0, 0.14, 0); [-1, 0, 1].forEach(k => pon(g, caja(K, 0.06, 0.12, 0.12, AT.marmolD, { grosor: 0.003 }), k * (largo / 2 - 0.08), 0.06, 0)); return g; }
/* el herma: el pilar con la cabeza barbada de Hermes, en las esquinas y las puertas */
export function herma(K, alto = 0.5) {
  const g = new THREE.Group(), w = alto * 0.16;
  pon(g, caja(K, w * 1.3, alto * 0.06, w * 1.3, AT.marmolD, { grosor: 0.003 }), 0, alto * 0.03, 0);
  pon(g, K.malla(tronco(w, w, w * 0.88, w * 0.88, alto * 0.7), AT.marmol, { grosor: 0.004 }), 0, alto * 0.06, 0).geometry.userData.propia = true;
  [-1, 1].forEach(l => pon(g, caja(K, w * 0.35, w * 0.3, w * 0.6, AT.marmol, { grosor: 0.003 }), l * w * 0.6, alto * 0.7, 0));   // los muñones de los brazos
  pon(g, K.malla(K.esfera(w * 0.62, 0.6), AT.marmol, { grosor: 0.003 }), 0, alto * 0.84, 0);
  pon(g, K.malla(K.capsula(w * 0.3, w * 0.4, 0.5), '#4a3a2c', { grosor: 0.002 }), 0, alto * 0.75, w * 0.36);   // la barba pintada
  pon(g, K.malla(K.esfera(w * 0.6, 0.6), '#4a3a2c', { grosor: 0.002 }), 0, alto * 0.9, -w * 0.08).scale.set(1, 0.6, 1);   // el pelo
  return g;
}
/* una estela de piedra con las leyes grabadas */
export function estela(K, alto = 0.55, texto = 'ΝΟΜΟΙ') {
  const g = new THREE.Group();
  pon(g, caja(K, 0.22, 0.05, 0.12, AT.marmolD, { grosor: 0.003 }), 0, 0.025, 0);
  pon(g, caja(K, 0.17, alto, 0.05, AT.marmol, { grosor: 0.004 }), 0, 0.05 + alto / 2, 0);
  const t = lamina(K, grabado(K, texto, { w: 64, h: 192, lineas: 14, tam: 14 }), 0.15, alto * 0.94); t.position.set(0, 0.05 + alto / 2, 0.026); g.add(t);
  return g;
}

/* LA STOA. 'pecile' (la Stoa Pintada, ~460 a. C.: los cuadros de Polignoto y Micón y los escudos de bronce
   ganados en Pilos), 'zeus' (la de Zeus Eleuterio, ~425 a. C.: dos alas que salen al frente, cada una con su
   frontón y sus Nikés de acrotera, y la estatua de Zeus delante) o 'real' (la Stoa del Rey, chica y antigua:
   las leyes en estelas, la piedra del juramento, las acroteras de terracota de Teseo y de Hémera). */
export function stoa(K, variante = VARIANTES.stoa, niv = 3) {
  const g = new THREE.Group(), n = typeof niv === 'number' ? niv : 0;
  if (variante === 'pecile') {
    const L = 3.4, D = 1.25, H = 0.8;
    const c = cuerpoStoa(K, L, D, H, { cols: 13, interior: 6 }); g.add(c);
    ['maraton', 'troya', 'enoe', 'amazonas'].forEach((tm, i) => {        // los cuadros, en tablas colgadas del muro de atrás
      const q = lamina(K, cuadro(K, tm), 0.66, 0.33); q.position.set(-1.2 + i * 0.8, 0.05 + H * 0.52, -D / 2 + 0.102); g.add(q);
    });
    for (let i = 0; i < 12; i++) {                         // los escudos de bronce de los espartanos rendidos en Pilos (425 a. C.), colgados en el pórtico
      const e = K.malla(K.cilindro(0.042, 0.042, 0.012, 16), i % 2 ? AT.bronce : AT.bronceL, { grosor: 0.003 }); e.rotation.x = Math.PI / 2; e.position.set(-L / 2 + 0.1 + (i + 0.5) * (L - 0.2) / 12, 0.05 + H + H * 0.3 * 0.2, D / 2 + 0.008); g.add(e);
    }
    const b = banco(K, 2.6); b.position.set(0, 0.05, -D / 2 + 0.24); g.add(b);
    g.userData.ficha = { titulo: 'La Stoa Pecile', texto: 'el pórtico pintado: bajo sus cuadros se conversa, y un siglo después Zenón enseña aquí (por eso, «estoicos»)' };
  } else if (variante === 'zeus') {
    const L = 2.4, D = 1.0, H = 0.78, AL = 0.62, SALE = 0.55;
    const c = cuerpoStoa(K, L, D, H, { cols: 10, interior: 4 }); g.add(c);
    [-1, 1].forEach(l => {                                 // las dos alas, que salen al frente con su frontón
      const a = new THREE.Group(); a.position.set(l * (L / 2 + AL / 2 - 0.08), 0, SALE / 2); g.add(a);
      pon(a, caja(K, AL + 0.12, 0.05, D + SALE + 0.12, AT.marmol, { grosor: 0.006 }), 0, 0.025, 0);
      pon(a, caja(K, 0.1, H + 0.02, D + SALE, AT.poros, { grosor: 0.006 }), l * (AL / 2 - 0.05), 0.05 + H / 2, 0);
      pon(a, caja(K, AL, H + 0.02, 0.1, AT.poros, { grosor: 0.006 }), 0, 0.05 + H / 2, -(D + SALE) / 2 + 0.05);
      for (let i = 0; i < 4; i++) { const cc = columnaDorica(K, H, 0.055, { gr: 0.004 }); cc.position.set(-AL / 2 + 0.08 + i * (AL - 0.16) / 3, 0.05, (D + SALE) / 2 - 0.08); a.add(cc); }
      { const cc = columnaDorica(K, H, 0.055, { gr: 0.004 }); cc.position.set(-l * (AL / 2 - 0.08), 0.05, (D + SALE) / 2 - 0.36); a.add(cc); }   // la del costado que da al patio
      const en = entablamento(K, AL, D + SALE, H * 0.3, { nx: 6, nz: 10, gr: 0.006 }); en.position.y = 0.05 + H; a.add(en);
      const nikeAcr = d => { const f = figura(K, d === 'centro' ? 0.2 : 0.14, { color: AT.marmolL, manto: AT.ocre }); [-1, 1].forEach(e => { const ala = caja(K, 0.012, 0.08, 0.05, AT.marmol, { grosor: 0.002 }); ala.position.set(e * 0.03, 0.13, -0.02); ala.rotation.z = e * 0.5; f.add(ala); }); return f; };
      const te = tejado(K, AL + 0.04, D + SALE + 0.04, AL * 0.24, { tipo: 'teja', tema: 'liso', acrotera: nikeAcr, gr: 0.006 }); te.position.y = 0.05 + H + H * 0.3; a.add(te);
    });
    const z = new THREE.Group(); z.position.set(0, 0, D / 2 + 0.75); g.add(z);   // Zeus Eleuterio, el Liberador, delante del pórtico
    pon(z, caja(K, 0.26, 0.2, 0.26, AT.marmolD, { grosor: 0.005 }), 0, 0.1, 0);
    const zf = estatua(K, { color: AT.marmolL, escala: 0.82 }); zf.position.y = 0.2; z.add(zf);
    pon(z, K.malla(K.cilindro(0.008, 0.008, 0.9, 5), AT.oro, { grosor: 0.002 }), 0.2, 0.62, 0.04);   // el cetro
    const b = banco(K, 1.8); b.position.set(0, 0.05, -D / 2 + 0.24); g.add(b);
    g.userData.ficha = { titulo: 'La stoa de Zeus Eleuterio', texto: 'el pórtico del Liberador: aquí Jenofonte encuentra a Sócrates sentado, conversando' };
  } else {
    const L = 2.1, D = 0.95, H = 0.7;
    const acr = d => {                                     // las acroteras de terracota: dos figuras que luchan, sobre el vértice
      const f = new THREE.Group(), e = d === 'centro' ? 1 : 0.7;
      const a = figura(K, 0.17 * e, { color: AT.tejaL, manto: AT.teja }); a.rotation.z = -0.3; a.position.x = -0.03 * e; f.add(a);
      const b = figura(K, 0.13 * e, { color: AT.tejaL, manto: AT.tejaD }); b.rotation.z = 0.9; b.position.set(0.05 * e, 0.03, 0); f.add(b);
      return f;
    };
    const c = cuerpoStoa(K, L, D, H, { cols: 8, interior: 2, tema: 'liso', acrotera: acr }); g.add(c);
    [-0.98, -0.74, 0.74, 0.98].forEach((x, i) => { const e = estela(K, 0.34 + (i % 2) * 0.05, 'ΝΟΜΟΙ'); e.position.set(x, 0.05, D / 2 + 0.34); g.add(e); });   // las leyes de Solón y Dracón, reinscritas
    const li = caja(K, 0.44, 0.13, 0.28, '#aaa18b', { grosor: 0.006 }); li.position.set(0, 0.065, D / 2 + 0.36); li.rotation.y = 0.08; g.add(li);   // el lithos: la piedra sin labrar donde se juraba
    [-1, 1].forEach(l => { const h = herma(K, 0.5); h.position.set(l * (L / 2 + 0.2), 0, D / 2 + 0.1); g.add(h); });
    g.userData.ficha = { titulo: 'La Stoa Real', texto: 'donde el arconte rey recibe las causas: aquí empieza el Eutifrón, con Sócrates esperando su juicio' };
  }
  void n;
  return g;
}

/* ---------- LOS ÁRBOLES ---------- */
/* el olivo: tronco retorcido y hueco, copa gris verdosa y el envés plateado de la hoja */
export function olivo(K, s = 1, semilla = 1) {
  const g = new THREE.Group(), r = n => hash3(semilla, n, 7);
  const t1 = K.malla(K.cilindro(0.05 * s, 0.08 * s, 0.32 * s, 7), AT.troncoOl, { grosor: 0.005 }); t1.position.set(0, 0.16 * s, 0); t1.rotation.z = 0.25 * (r(1) - 0.5) * 2; g.add(t1);
  const t2 = K.malla(K.cilindro(0.03 * s, 0.045 * s, 0.26 * s, 6), AT.troncoOl, { grosor: 0.004 }); t2.position.set(0.06 * s, 0.36 * s, 0.02 * s); t2.rotation.z = -0.55; g.add(t2);
  const t3 = K.malla(K.cilindro(0.03 * s, 0.04 * s, 0.24 * s, 6), AT.troncoOl, { grosor: 0.004 }); t3.position.set(-0.06 * s, 0.35 * s, -0.02 * s); t3.rotation.z = 0.6; g.add(t3);
  [[0, 0.56, 0, 0.22, AT.olivo], [0.17, 0.5, 0.05, 0.16, AT.olivoD], [-0.17, 0.49, -0.04, 0.17, AT.olivo], [0.05, 0.5, -0.15, 0.15, AT.olivoD], [-0.04, 0.5, 0.15, 0.15, AT.olivo], [0.04, 0.66, 0.03, 0.13, AT.olivoL]].forEach(([x, y, z, rr, c], i) => {
    const m = K.malla(K.esfera(rr * s * (0.9 + r(i + 3) * 0.2), 0.7), c, { grosor: 0.005 }); m.position.set(x * s, y * s, z * s); m.scale.y = 0.72; g.add(m);
  });
  return g;
}
/* el plátano oriental: tronco moteado, copa ancha y verde; el árbol del Fedro y el de Cimón */
export function platano(K, s = 1, semilla = 1) {
  const g = new THREE.Group(), r = n => hash3(semilla, n, 9);
  pon(g, K.malla(K.cilindro(0.06 * s, 0.1 * s, 0.7 * s, 8), AT.troncoPl, { grosor: 0.005 }), 0, 0.35 * s, 0);
  for (let i = 0; i < 4; i++) pon(g, K.malla(K.esfera(0.035 * s, 0.5), '#cfc6ae', { sinTinta: true }), Math.cos(i * 2.1) * 0.075 * s, (0.15 + i * 0.13) * s, Math.sin(i * 2.1) * 0.075 * s).scale.set(1, 1.4, 0.5);   // las placas claras de la corteza
  [[0, 0.95, 0, 0.36, AT.platano], [0.28, 0.82, 0.08, 0.26, AT.platanoD], [-0.27, 0.84, -0.06, 0.27, AT.platano], [0.06, 0.82, -0.27, 0.25, AT.platanoD], [-0.05, 0.8, 0.27, 0.25, AT.platano], [0.1, 1.12, 0.05, 0.22, AT.platanoL]].forEach(([x, y, z, rr, c], i) => {
    const m = K.malla(K.esfera(rr * s * (0.9 + r(i) * 0.2), 0.8), c, { grosor: 0.006 }); m.position.set(x * s, y * s, z * s); m.scale.y = 0.78; g.add(m);
  });
  return g;
}

/* ---------- LA PALESTRA (saber 35) ---------- */
export function anfora(K, s = 1, color = '#b9784a') {
  const g = new THREE.Group(); g.scale.setScalar(s);
  pon(g, K.malla(K.esfera(0.06, 0.7), color, { grosor: 0.003 }), 0, 0.09, 0).scale.set(1, 1.35, 1);
  pon(g, K.malla(K.cono(0.03, 0.06, 8), color, { grosor: 0.003 }), 0, 0.02, 0).rotation.x = Math.PI;
  pon(g, K.malla(K.cilindro(0.018, 0.022, 0.06, 8), color, { grosor: 0.003 }), 0, 0.19, 0);
  [-1, 1].forEach(l => pon(g, K.malla(K.toro(0.025, 0.006, Math.PI, 0.5), color, { grosor: 0.002 }), l * 0.03, 0.18, 0).rotation.z = l * Math.PI / 2);
  return g;
}
export function pisoArena(K, w, d, color = AT.arena) {
  const g = new THREE.Group();
  pon(g, caja(K, w, 0.03, d, color, { grosor: 0.006, sombra: false }), 0, 0.015, 0);
  for (let i = 0; i < 6; i++) pon(g, caja(K, w * 0.86, 0.004, 0.012, AT.arenaD, { sinTinta: true, sombra: false }), 0, 0.032, -d / 2 + d * (i + 1) / 7);   // el rastrillado
  return g;
}
export function portico(K, largo, prof, H, cols, { gr = 0.005 } = {}) {   // un pórtico de un agua: columnas al frente (+z), muro atrás
  const g = new THREE.Group();
  pon(g, caja(K, largo, H, 0.08, AT.poros, { grosor: gr }), 0, H / 2, -prof / 2 + 0.04);
  for (let i = 0; i < cols; i++) { const c = columnaDorica(K, H, 0.045, { gr: gr * 0.7 }); c.position.set(-largo / 2 + 0.08 + i * (largo - 0.16) / (cols - 1), 0, prof / 2 - 0.06); g.add(c); }
  pon(g, caja(K, largo, 0.07, prof, AT.marmol, { grosor: gr }), 0, H + 0.035, 0);
  const ang = 0.32, lar = prof / Math.cos(ang) + 0.06;
  const te = K.malla(K.caja(largo + 0.06, 0.025, lar), tejas(K, 'teja', 'v', largo * 7, lar * 7), { grosor: gr }); te.rotation.x = ang; te.position.set(0, H + 0.07 + Math.tan(ang) * prof / 2, 0); g.add(te);
  return g;
}
/* LA PALESTRA. 'barrio' (la escuela del paidotriba, como la de Táureas: patio de arena cercado, pórtico al
   norte con los cuartos de desvestirse, del aceite y del polvo, y otro al oeste), 'gimnasio' (el gimnasio
   público: la pista entre plátanos, la línea de salida de piedra, el poste de la vuelta, el lebrillo y el
   herma) o 'peristilo' (el patio cuadrado con columnas en los cuatro lados: la forma que conocemos, un siglo
   posterior). Etapas del saber: 1 el pórtico, 2 la pista y el aceite, 3 Hermes y los discos. */
export function palestra(K, variante = VARIANTES.palestra, niv = 3) {
  const g = new THREE.Group(), n = typeof niv === 'number' ? niv : 0;
  if (variante === 'gimnasio') {
    const W = 3.3, D = 1.9;
    g.add(pisoArena(K, W, D, '#dccb98'));
    pon(g, caja(K, W - 0.5, 0.012, 0.56, '#f0e2b8', { sinTinta: true, sombra: false }), 0, 0.036, 0.05);   // la pista
    [-1, 1].forEach(l => pon(g, caja(K, W - 0.5, 0.03, 0.04, AT.marmolD, { grosor: 0.003 }), 0, 0.045, 0.05 + l * 0.3));   // los bordillos de piedra
    if (n >= 2) {
      const ba = caja(K, 0.12, 0.05, 0.56, AT.marmol, { grosor: 0.004 }); ba.position.set(-W / 2 + 0.33, 0.05, 0.05); g.add(ba);   // la balbís: la línea de salida, con sus ranuras
      for (let i = 0; i < 4; i++) pon(g, caja(K, 0.125, 0.006, 0.014, AT.marmolS, { sinTinta: true }), -W / 2 + 0.33, 0.077, -0.17 + i * 0.12);
      pon(g, K.malla(K.cilindro(0.035, 0.04, 0.5, 8), AT.marmol, { grosor: 0.004 }), W / 2 - 0.33, 0.28, 0.05);   // el kampter: el poste de la vuelta
      pon(g, K.malla(K.esfera(0.045, 0.6), AT.marmol, { grosor: 0.003 }), W / 2 - 0.33, 0.55, 0.05);
    }
    [[-1.2, -0.6], [-0.4, -0.62], [0.4, -0.6], [1.2, -0.62], [-0.6, 0.72], [1.25, 0.7]].forEach(([x, z], i) => { const p = platano(K, 0.6 + (i % 2) * 0.08, i + 1); p.position.set(x, 0.03, z); g.add(p); });
    if (n >= 1) {                                          // el lebrillo: el agua que Cimón trajo, para lavarse
      const lb = new THREE.Group(); lb.position.set(-W / 2 + 0.35, 0.03, 0.72); g.add(lb);
      pon(lb, K.malla(K.cilindro(0.03, 0.05, 0.22, 8), AT.marmol, { grosor: 0.003 }), 0, 0.11, 0);
      pon(lb, K.malla(K.cilindro(0.15, 0.09, 0.05, 16), AT.marmol, { grosor: 0.004 }), 0, 0.245, 0);
      pon(lb, K.malla(K.cilindro(0.13, 0.13, 0.01, 16), '#6fb8d4', { sinTinta: true }), 0, 0.265, 0);
    }
    if (n >= 3) { const h = herma(K, 0.52); h.position.set(-W / 2 + 0.25, 0.03, -0.25); g.add(h); }
    g.userData.ficha = { titulo: 'El gimnasio', texto: 'la pista entre plátanos: el cuerpo también aprende, al aire libre' };
  } else if (variante === 'peristilo') {
    const W = 2.6, D = 2.2, H = 0.6;
    g.add(pisoArena(K, W, D));
    const ex = W / 2 - 0.42, ez = D / 2 - 0.42, xs = [0, 1, 2, 3, 4, 5].map(i => -ex + i * 2 * ex / 5), zs = [1, 2, 3].map(i => -ez + i * 2 * ez / 4);
    xs.forEach(x => [-1, 1].forEach(l => { const c = columnaDorica(K, H, 0.04, { gr: 0.003 }); c.position.set(x, 0.03, l * ez); g.add(c); }));
    zs.forEach(z => [-1, 1].forEach(l => { const c = columnaDorica(K, H, 0.04, { gr: 0.003 }); c.position.set(l * ex, 0.03, z); g.add(c); }));
    [-1, 1].forEach(l => { pon(g, caja(K, 2 * ex + 0.1, 0.06, 0.1, AT.marmol, { grosor: 0.004 }), 0, 0.03 + H + 0.03, l * ez); pon(g, caja(K, 0.1, 0.06, 2 * ez + 0.1, AT.marmol, { grosor: 0.004 }), l * ex, 0.03 + H + 0.03, 0); });   // el arquitrabe
    // el muro exterior y los tejados que bajan hacia el patio
    [[0, -D / 2 + 0.04, W, 0.08], [0, D / 2 - 0.04, W, 0.08], [-W / 2 + 0.04, 0, 0.08, D], [W / 2 - 0.04, 0, 0.08, D]].forEach(([x, z, w, d]) => pon(g, caja(K, w, H + 0.16, d, AT.poros, { grosor: 0.005 }), x, (H + 0.16) / 2, z));
    /* el tejado: un marco a cuatro aguas que baja hacia el patio, con las limas en diagonal en las esquinas */
    const ox = W / 2 + 0.04, oz = D / 2 + 0.04, ix = ex - 0.06, iz = ez - 0.06, sh = new THREE.Shape();
    sh.moveTo(-ox, -oz); sh.lineTo(ox, -oz); sh.lineTo(ox, oz); sh.lineTo(-ox, oz); sh.closePath();
    const hu = new THREE.Path(); hu.moveTo(-ix, -iz); hu.lineTo(-ix, iz); hu.lineTo(ix, iz); hu.lineTo(ix, -iz); hu.closePath(); sh.holes.push(hu);
    const mg = propia(new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false })); mg.rotateX(-Math.PI / 2);
    const mp = mg.getAttribute('position');
    for (let i = 0; i < mp.count; i++) { const x = mp.getX(i), z = mp.getZ(i), t = Math.max(0, Math.min(1, Math.max((Math.abs(x) - ix) / (ox - ix), (Math.abs(z) - iz) / (oz - iz)))); mp.setY(i, mp.getY(i) + t * 0.16); }
    mg.computeVertexNormals();
    pon(g, K.malla(mg, AT.teja, { grosor: 0.006 }), 0, H + 0.08, 0);
    if (n >= 2) [0.25, 0.45].forEach((x, i) => { const a = anfora(K, 1); a.position.set(x, 0.03, -0.3 + i * 0.12); g.add(a); });
    if (n >= 3) { const h = herma(K, 0.5); h.position.set(0, 0.03, 0.2); g.add(h); }
    g.userData.ficha = { titulo: 'La palestra de peristilo', texto: 'el patio rodeado de columnas: la forma que conocemos, un siglo después de Sócrates' };
  } else {
    const W = 2.8, D = 2.2;
    g.add(pisoArena(K, W, D));
    // el muro de piedra que cierra el patio al sur y al este, con el portón de madera al sur
    pon(g, caja(K, W, 0.32, 0.08, AT.poros, { grosor: 0.005 }), 0, 0.16, D / 2 - 0.04);
    pon(g, caja(K, 0.08, 0.32, D, AT.poros, { grosor: 0.005 }), W / 2 - 0.04, 0.16, 0);
    pon(g, caja(K, 0.36, 0.42, 0.1, AT.maderaD, { grosor: 0.005 }), 0.2, 0.21, D / 2 - 0.04);
    if (n >= 1) {                                          // el pórtico del norte, con sus tres cuartos (el de desvestirse, el del aceite y el del polvo)
      const pn = portico(K, W, 0.55, 0.62, 6); pn.position.set(0, 0.03, -D / 2 + 0.28); g.add(pn);
      [-0.8, 0, 0.8].forEach(x => pon(g, caja(K, 0.18, 0.36, 0.01, '#3a2c20', { sinTinta: true }), x, 0.21, -D / 2 + 0.087));
    } else pon(g, caja(K, W, 0.32, 0.08, AT.poros, { grosor: 0.005 }), 0, 0.16, -D / 2 + 0.04);
    if (n >= 2) { const po = portico(K, D - 0.75, 0.45, 0.62, 4); po.rotation.y = Math.PI / 2; po.position.set(-W / 2 + 0.23, 0.03, 0.25); g.add(po); }   // el del oeste, a la sombra de la tarde
    else pon(g, caja(K, 0.08, 0.32, D, AT.poros, { grosor: 0.005 }), -W / 2 + 0.04, 0.16, 0);
    if (n >= 2) {                                          // las ánforas del aceite, el pico para soltar la arena del salto y las pesas
      [[0.95, -0.35], [1.1, -0.25]].forEach(([x, z]) => { const a = anfora(K, 1.1); a.position.set(x, 0.03, z); g.add(a); });
      const pico = K.malla(K.cilindro(0.008, 0.008, 0.3, 5), AT.madera, { grosor: 0.002 }); pico.rotation.z = 1.2; pico.position.set(0.4, 0.06, 0.5); g.add(pico);
      [0, 1].forEach(k => pon(g, caja(K, 0.07, 0.03, 0.04, '#7a7468', { grosor: 0.002 }), 0.75 + k * 0.1, 0.05, 0.62));   // las halteras de piedra del salto
    }
    if (n >= 3) {
      const h = herma(K, 0.52); h.position.set(W / 2 - 0.3, 0.03, D / 2 - 0.3); g.add(h);
      [0, 1, 2].forEach(k => pon(g, K.malla(K.cilindro(0.05, 0.05, 0.012, 14), '#8f8a7c', { grosor: 0.002 }), -0.4 + k * 0.13, 0.04, 0.55));   // los discos de bronce
    }
    g.userData.ficha = { titulo: 'La palestra', texto: 'el patio del paidotriba: el cuerpo también aprende' };
  }
  return g;
}

/* ---------- LA ACADEMIA (saber 38, el cierre de la época) ---------- */
export function muroBajo(K, W, D, { hueco = 0.5, alto = 0.2, color = AT.rocaL } = {}) {
  const g = new THREE.Group();
  pon(g, caja(K, W, alto, 0.08, color, { grosor: 0.005 }), 0, alto / 2, -D / 2);
  [-1, 1].forEach(l => pon(g, caja(K, 0.08, alto, D, color, { grosor: 0.005 }), l * W / 2, alto / 2, 0));
  const tramo = (W - hueco) / 2;
  [-1, 1].forEach(l => pon(g, caja(K, tramo, alto, 0.08, color, { grosor: 0.005 }), l * (hueco / 2 + tramo / 2), alto / 2, D / 2));
  return g;
}
/* la colmena griega: un cilindro de barro acostado, con la boca al frente (como las de la casa de Vari, en el Ática) */
export function colmena(K) {
  const g = new THREE.Group();
  const c = K.malla(K.cilindro(0.06, 0.07, 0.26, 10), '#c98e5c', { grosor: 0.003 }); c.rotation.x = Math.PI / 2; c.position.y = 0.07; g.add(c);
  pon(g, K.malla(K.cilindro(0.045, 0.045, 0.01, 10), '#3a2c20', { sinTinta: true }), 0, 0.07, 0.131).rotation.x = Math.PI / 2;
  return g;
}
/* el santuario de las Musas que fundó Platón: un templete de dos columnas jónicas */
export function museion(K) {
  const g = new THREE.Group(), H = 0.38;
  pon(g, caja(K, 0.42, 0.05, 0.46, AT.marmol, { grosor: 0.004 }), 0, 0.025, 0);
  pon(g, caja(K, 0.36, H, 0.3, AT.marmolD, { grosor: 0.005 }), 0, 0.05 + H / 2, -0.06);
  [-1, 1].forEach(l => { const c = columnaJonica(K, H, 0.02, { gr: 0.003 }); c.position.set(l * 0.1, 0.05, 0.16); g.add(c); });
  const en = entablamento(K, 0.38, 0.44, 0.08, { jonico: true, gr: 0.004 }); en.position.y = 0.05 + H; g.add(en);
  const te = tejado(K, 0.4, 0.46, 0.06, { tipo: 'teja', tema: 'liso', acrotera: palmeta(K, 0.06), gr: 0.004 }); te.position.y = 0.05 + H + 0.08; g.add(te);
  return g;
}
/* LA ACADEMIA. 'olivar' (el olivar sagrado de Atenea con su muro, el mojón de la Academia, el altar de Prometeo,
   las colmenas y el santuario de las Musas de Platón), 'puerta' (la puerta con el letrero de la geometría: ⚖️ la
   frase es una tradición tardía, y la ficha lo dirá) o 'mosaico' (la escena del mosaico de Pompeya: el banco
   en hemiciclo bajo el árbol, el reloj de sol sobre su columna y la esfera celeste en su caja). */
export function academia(K, variante = VARIANTES.academia, niv = 3) {
  const g = new THREE.Group(), n = typeof niv === 'number' ? niv : 0, W = 3.2, D = 3.0;
  pon(g, caja(K, W, 0.02, D, '#c9c08f', { sinTinta: true, sombra: false }), 0, 0.01, 0);   // la hierba seca del olivar
  g.add(muroBajo(K, W, D, { hueco: 0.6 }));
  const olivos = variante === 'mosaico' ? [[-1.1, -0.9], [1.1, -0.95], [-1.15, 0.85], [1.15, 0.9]] : [[-1.0, -0.95], [0.1, -1.05], [1.1, -0.9], [-1.15, 0.05], [1.15, 0.1], [-0.95, 0.95], [1.0, 0.95]];
  olivos.forEach(([x, z], i) => { const o = olivo(K, 1.0 + (i % 3) * 0.12, i + 3); o.position.set(x, 0.02, z); g.add(o); });
  if (variante === 'olivar') {
    const ho = new THREE.Group(); ho.position.set(-0.55, 0.02, D / 2 + 0.2); g.add(ho);   // el mojón, junto a la entrada
    pon(ho, caja(K, 0.16, 0.42, 0.1, AT.marmol, { grosor: 0.004 }), 0, 0.21, 0);
    const t = lamina(K, grabado(K, 'ΗΟΡΟΣ\nΤΕΣ\nΗΕΚΑΔΕ\nΜΕΙΑΣ', { w: 96, h: 192, tam: 22 }), 0.14, 0.38); t.position.set(0, 0.21, 0.051); ho.add(t);
    const al = altar(K, 1.1); al.position.set(-0.3, 0.02, 0.8); g.add(al);              // el altar de Prometeo: de aquí parte la carrera de antorchas
    if (n >= 2) { const mu = museion(K); mu.position.set(0.15, 0.02, -0.35); g.add(mu); }
    if (n >= 1) [[-0.35, 0.35], [-0.12, 0.38], [0.11, 0.35]].forEach(([x, z]) => { const c = colmena(K); c.position.set(x - 0.5, 0.02, z); c.rotation.y = 0.15; g.add(c); });
    if (n >= 3) { const b = banco(K, 0.9); b.position.set(0.15, 0.02, 0.12); g.add(b); }
    g.userData.ficha = { titulo: 'La Academia', texto: 'el olivar de Academo: Platón compra un jardín al lado y funda aquí la escuela' };
  } else if (variante === 'puerta') {
    const pu = new THREE.Group(); pu.position.set(0, 0.02, D / 2); g.add(pu);
    [-1, 1].forEach(l => { const c = columnaDorica(K, 0.7, 0.05, { gr: 0.004 }); c.position.set(l * 0.3, 0, 0); pu.add(c); });
    pon(pu, caja(K, 0.8, 0.14, 0.14, AT.marmol, { grosor: 0.005 }), 0, 0.77, 0);
    const le = lamina(K, grabado(K, 'ΑΓΕΩΜΕΤΡΗΤΟΣ ΜΗΔΕΙΣ ΕΙΣΙΤΩ', { w: 512, h: 48, tam: 26 }), 0.76, 0.07); le.position.set(0, 0.77, 0.072); pu.add(le);
    if (n >= 3) { const pe = portico(K, 2.4, 0.5, 0.6, 7); pe.position.set(0, 0.02, -D / 2 + 0.32); g.add(pe); }   // el paseo cubierto (el perípatos)
    if (n >= 2) { const b = banco(K, 1.0); b.position.set(0, 0.02, 0.2); g.add(b); }
    g.userData.ficha = { titulo: 'La puerta de la Academia', texto: '«que no entre quien no sepa geometría»: así la cuenta una tradición de siglos después' };
  } else {
    const sector = (r0, r1, a0, a1) => { const sh = new THREE.Shape(); sh.absarc(0, 0, r1, a0, a1, false); sh.absarc(0, 0, r0, a1, a0, true); sh.closePath(); return sh; };
    const losa = (sh, h, color, y) => { const geo = propia(new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 24 })); geo.rotateX(-Math.PI / 2); const m = K.malla(geo, color, { grosor: 0.004 }); m.position.y = y; return m; };
    const ex = new THREE.Group(); ex.position.set(0, 0.02, -0.2); g.add(ex);          // el hemiciclo: el banco curvo de mármol, abierto hacia el frente
    ex.add(losa(sector(0.62, 0.8, 0.12, Math.PI - 0.12), 0.12, AT.marmol, 0));
    ex.add(losa(sector(0.8, 0.86, 0.12, Math.PI - 0.12), 0.28, AT.marmolD, 0));
    [-1, 1].forEach(l => { const a = l > 0 ? 0.12 : Math.PI - 0.12; pon(ex, caja(K, 0.06, 0.2, 0.22, AT.marmolD, { grosor: 0.003 }), Math.cos(a) * 0.73, 0.1, -Math.sin(a) * 0.73, l > 0 ? -0.12 : 0.12); });   // los brazos con patas de león
    const ar = platano(K, 1.15, 4); ar.position.set(0, 0.02, -1.05); g.add(ar);
    const rs = new THREE.Group(); rs.position.set(0.55, 0.02, 0.35); g.add(rs);         // el reloj de sol sobre su columna
    pon(rs, K.malla(K.cilindro(0.035, 0.04, 0.5, 10), AT.marmol, { grosor: 0.004 }), 0, 0.25, 0);
    pon(rs, caja(K, 0.12, 0.05, 0.12, AT.marmolD, { grosor: 0.003 }), 0, 0.525, 0);
    pon(rs, K.malla(K.cono(0.012, 0.06, 4), AT.bronce, { grosor: 0.002 }), 0, 0.58, 0);
    const es = new THREE.Group(); es.position.set(-0.5, 0.02, 0.4); g.add(es);           // la esfera celeste en su caja
    pon(es, caja(K, 0.18, 0.1, 0.18, AT.madera, { grosor: 0.003 }), 0, 0.05, 0);
    pon(es, K.malla(K.esfera(0.075, 0.8), '#c9b48a', { grosor: 0.003 }), 0, 0.17, 0);
    pon(es, K.malla(K.toro(0.08, 0.004, Math.PI * 2, 0.6), AT.bronce, { sinTinta: true }), 0, 0.17, 0).rotation.x = 1.1;
    g.userData.ficha = { titulo: 'La Academia', texto: 'como la recordaba un mosaico de Pompeya: el banco en hemiciclo, el árbol, el reloj de sol y la esfera del cielo' };
  }
  return g;
}
