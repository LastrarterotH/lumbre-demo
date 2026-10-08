/* ============================================================
   02-dibujo
   El lienzo y las primitivas: la proyección isométrica P(), polígonos, líneas, sombras, y el sendero.
   ============================================================ */
const cv = document.getElementById('scene');
const g  = cv.getContext('2d');

const PAL = {
  cieloAlto: '#5fb2e0', cieloBajo: '#b8e2f4',   // día celeste: el diorama revienta de contraste
  pastoA: '#97c95f', pastoB: '#8dc056',
  arenaA: '#e8d5a4', arenaB: '#e0cc98',
  agua: '#6fb8d4', aguaOrilla: '#5fa8c4', bordeLaguna: '#c9a976',
  tierra: '#c9a36a', tierraB: '#c19a5f', tierraPunto: '#a9885c',
  surco: '#8a6842', huerto: '#a07a4e',
  corteL1: '#d9b98a', corteL2: '#c4a172', corteD1: '#a9825c', corteD2: '#96714c',
  tufo: '#6f9c46', florTallo: '#5d8a3c',
  maderaL: '#b98a5e', maderaD: '#96703f', maderaLinea: 'rgba(74,52,26,.22)',
  techoL: '#b5533c', techoD: '#94402f', techoLinea: 'rgba(90,32,20,.30)',
  crema: '#f0e4c8', cremaD: '#d8c9a4',
  pizarra: '#2f4a3c', tiza: 'rgba(245,240,224,.88)',
  vidrio: '#7c93a8', vidrioBrillo: 'rgba(240,248,255,.55)',
  puerta: '#5e4128', campana: '#d9a53f', campanaD: '#a97c26',
  troncoL: '#7a5636', troncoD: '#5e4128',
  copaD: '#4c7a34', copaM: '#66984a', copaL: '#86b761',
  piedraL: '#b9b3a4', piedraD: '#8f8a7c',
  piel: '#f2c9a0', delantal: '#f7f2e4', delantalSombra: 'rgba(90,70,40,.10)',
  sombra: 'rgba(20,32,14,.30)', humo: '240,235,225', aguaPozo: '#3d5a70'
};

const GRID = 20, IN0 = 2, IN1 = 17, T2X = 32, T2Y = 16;
let W, H, DPR, zoom, ox, oy;
function P(x, y, z = 0) { return { x: ox + (x - y) * T2X * zoom, y: oy + (x + y) * T2Y * zoom - z * zoom }; }
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function poly(pts, fill, stroke, lw) {
  g.beginPath(); g.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) g.lineTo(pts[i].x, pts[i].y);
  g.closePath();
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw || 1; g.stroke(); }
}
function line(a, b, color, lw) {
  g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y);
  g.strokeStyle = color; g.lineWidth = lw; g.lineCap = 'round'; g.stroke();
}
function dot(p, r, fill) { g.beginPath(); g.arc(p.x, p.y, r, 0, 7); g.fillStyle = fill; g.fill(); }
function ellipse(p, rx, ry, fill) { g.beginPath(); g.ellipse(p.x, p.y, rx, ry, 0, 0, 7); g.fillStyle = fill; g.fill(); }
/* EL PARPADEO. Los ojos eran puntos fijos y nadie vivía del todo. Cada quien cierra los párpados
   ~150 ms cada ~4,3 s con su propia fase (`ph` desincroniza), leyendo el reloj de animación
   (tFrame multiplica el warp: a ×5 también se parpadea a ×5). Devuelve la apertura 0.12-1. */
function apertura(ph) {
  const c = (tFrame + ph * 1.37) % 4.3;
  return c < 0.28 ? 1 - 0.88 * Math.sin(Math.PI * c / 0.28) : 1;
}
function ojo(x, y, r, ap, color) { ellipse({ x, y }, r, Math.max(r * ap, r * 0.12), color || '#3a2c1c'); }
/* LA SOMBRA VIVE CON LA LUZ: nítida a pleno sol (alfa 0,30, la de siempre), disuelta de noche (0,10,
   apenas un apoyo bajo la luna) y suave en la penumbra de antes del fuego. Se viste UNA vez por frame
   (vestirSombra, llamada desde el bucle), no en cada prop; fuera de la Época 1 la luz es 1 y no cambia
   nada. Todo lo que proyecta sombra usa `sombraHoy`, nunca PAL.sombra directo. */
let sombraHoy = PAL.sombra;
function vestirSombra() {
  const luz = (typeof luzDia === 'function' && S) ? luzDia() : 1;
  sombraHoy = `rgba(20,32,14,${(0.10 + 0.20 * luz).toFixed(3)})`;
}
function sombra(x, y, rx, ry) { ellipse(P(x, y), rx * zoom, ry * zoom, sombraHoy); }
function isoBox(x, y, w, d, h, cTop, cL, cR, z0 = 0) {
  const z1 = z0 + h;
  poly([P(x + w, y, z1), P(x + w, y + d, z1), P(x + w, y + d, z0), P(x + w, y, z0)], cR);
  poly([P(x, y + d, z1), P(x + w, y + d, z1), P(x + w, y + d, z0), P(x, y + d, z0)], cL);
  poly([P(x, y, z1), P(x + w, y, z1), P(x + w, y + d, z1), P(x, y + d, z1)], cTop);
}
function lerp(a, b, t) { return a + (b - a) * t; }
function smooth(t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); }

/* ---------- sendero ---------- */
const PATH_MAIN = [[4, 16.5], [6, 13], [8, 10.2], [9.5, 8.7]];
const PATH_BRANCH = [[8, 10.2], [6.4, 9.4], [5.3, 9.9]];
const pathTiles = new Set();
function markPath(pl) {
  for (let i = 0; i < pl.length - 1; i++) {
    const [x0, y0] = pl[i], [x1, y1] = pl[i + 1];
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 6);
    for (let k = 0; k <= n; k++)
      pathTiles.add(Math.floor(lerp(x0, x1, k / n)) + ',' + Math.floor(lerp(y0, y1, k / n)));
  }
}
markPath(PATH_MAIN); markPath(PATH_BRANCH);
const isPath = (x, y) => pathTiles.has(x + ',' + y);
const CLEAR = [
  [7.4, 3.6, 12.2, 9.0], [11.4, 8.4, 15.0, 11.0], [11.5, 11.5, 17.3, 16.6],
  [10.3, 11.5, 11.8, 13.0], [2.6, 7.0, 7.4, 11.6], [2.2, 14.4, 6.4, 17.2],
  [3.0, 4.4, 5.8, 6.8],   // rincón de proyección: sábana, linterna y filminas
  [12.6, 5.6, 14.6, 7.4], // gramófono
  [2.0, 9.6, 4.2, 11.2],  // rincón de lectura
  [6.2, 11.4, 7.8, 13.0], // radio educativa
  [14.6, 6.8, 17.0, 9.4], // cine: pantalla, proyector y público
  [17.2, 2.9, 19.9, 8.6], // era 3: aula anexa, TV, máquina y retroproyector
  [5.4, 17.6, 9.2, 19.6]  // era 3: patio de juegos
];
const isClear = (x, y) => CLEAR.some(r => x > r[0] && y > r[1] && x < r[2] && y < r[3]);

/* ---------- terreno pre-renderizado (flat, damero, diorama con grosor) ---------- */
