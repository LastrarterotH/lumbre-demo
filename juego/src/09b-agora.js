/* ============================================================
   09b-agora
   Época 4: el ágora de Atenas. La Acrópolis al fondo, la stoa donde se conversa, la palestra, el
   olivar de la Academia, las casas de la ciudad, el arroyo del Ilisos con su plátano, y los seis
   saberes en sus etapas. TODO en bloques isométricos (la decisión del usuario, quinta tanda de
   Egipto): cajas con las tres caras del mundo, mármol de tres tonos, roca del Ática y teja.
   Plan: docs/era4-plan.md (FIRME 2026-09-06). Bocetos: juego/bocetos/agora.html.
   ============================================================ */
const MARMOL = { T: '#f4f0e6', L: '#e8e3d6', R: '#cfc9b8', D: '#b6b09f' };
const ROCA_AT = { T: '#d6c79b', L: '#c9b98e', R: '#a8976c', D: '#8f7f56' };
const TEJA = { L: '#c8664b', M: '#b5533c', D: '#94402f' };
/* EL MUNDO DEL ÁGORA: dónde vive cada cosa (todo lo que se mide y se toca cuelga de aquí) */
const STOA = { x: 8.0, y: 5.5, w: 3.2, d: 1.2 };                 // el pórtico: la «escuela» de la época; su frente abierto mira a +y
const PLAZA = { x: 8.4, y: 6.9, w: 3.0, d: 2.6 };                // el ágora: el empedrado donde se conversa
const PALESTRA = { x: 12.6, y: 3.6, w: 2.8, d: 2.2 };            // el patio de arena con su pórtico
const ACROPOLIS = { x: 2.4, y: 2.4, w: 4.4, d: 3.2, h: 54 };     // el cerro, al fondo (el lugar de las pirámides)
const OLIVAR = { x: 3.0, y: 6.4, w: 3.2, d: 3.0 };               // el olivar de Academo, al oeste
const ILISOS = { ax: 19.2, ay: 8.4, bx: 11.0, by: 20.0 };        // el arroyo, por la esquina sureste
const PLATANO = { x: 14.4, y: 12.9 };                            // el plátano del Fedro, a la orilla
const BANCO_DECIR = { x: 8.8, y: 7.0 };                          // el banco del grammatistes, al frente de la stoa: aquí se DICE
const AGORA_PREGUNTAR = { x: 10.3, y: 8.3 };                     // el claro del ágora: aquí se PREGUNTA
const TARIMA_SOFISTA = { x: 12.1, y: 8.7 };                      // la tarima del sofista, al este de la plaza
const HOGARES_AT = [[3.35, 11.6], [4.55, 11.35], [3.6, 12.85]]; // las puertas de las casas de la ciudad
const OLIVOS = [[3.5, 6.9, 1.0], [4.9, 6.7, 0.85], [3.4, 8.3, 0.9], [5.4, 8.1, 1.05], [4.4, 9.0, 0.8], [5.9, 6.0, 0.7]]; // x, y, escala
const COLMENAS = [[4.0, 9.85], [5.2, 9.75]];
function distIlisos(x, y) {
  const dx = ILISOS.bx - ILISOS.ax, dy = ILISOS.by - ILISOS.ay, L2 = dx * dx + dy * dy;
  let tt = ((x - ILISOS.ax) * dx + (y - ILISOS.ay) * dy) / L2; tt = Math.max(0, Math.min(1, tt));
  return Math.hypot(x - (ILISOS.ax + tt * dx), y - (ILISOS.ay + tt * dy));
}
function ejeIlisos(u) { return { x: ILISOS.ax + (ILISOS.bx - ILISOS.ax) * u + Math.sin(u * 7.1) * 0.22, y: ILISOS.ay + (ILISOS.by - ILISOS.ay) * u + Math.cos(u * 5.3) * 0.16 }; }
function ilisosAgua() { return 0.62 * ((typeof crecidaHoy === 'function' ? crecidaHoy() : 1) || 1); } // semiancho del agua de hoy: crece con las lluvias
function puntoIlisos(u, perp, z) {
  const dx = ILISOS.bx - ILISOS.ax, dy = ILISOS.by - ILISOS.ay, L = Math.hypot(dx, dy), m = ejeIlisos(u);
  return P(m.x + (-dy / L) * perp, m.y + (dx / L) * perp, z);
}

/* ---------- las piezas de piedra: templo, stoa, cerro, palestra ---------- */
function drawTemploDorico(x, y, w, d, z0, cols, esc = 1) { // estilóbato, cella, columnas, entablamento, tejado a dos aguas con frontones
  const s = zoom, H = 26 * esc, ENT = 6 * esc, TECHO = 12 * esc;
  isoBox(x - 0.1, y - 0.1, w + 0.2, d + 0.2, 3, MARMOL.T, MARMOL.L, MARMOL.R, z0);
  isoBox(x - 0.05, y - 0.05, w + 0.1, d + 0.1, 2, MARMOL.T, MARMOL.L, MARMOL.R, z0 + 3);
  const nx = cols, ny = Math.max(3, Math.round(cols * d / w)), colw = 0.07 * esc;
  isoBox(x + 0.3, y + 0.3, w - 0.6, d - 0.6, H, MARMOL.L, MARMOL.R, MARMOL.D, z0 + 5);   // la cella, atrás
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {                            // las columnas del anillo, de atrás hacia adelante
    if (i > 0 && i < nx - 1 && j > 0 && j < ny - 1) continue;
    isoBox(x + (i + 0.5) * w / nx - colw / 2, y + (j + 0.5) * d / ny - colw / 2, colw, colw, H, MARMOL.T, MARMOL.L, MARMOL.R, z0 + 5);
  }
  isoBox(x - 0.06, y - 0.06, w + 0.12, d + 0.12, ENT, MARMOL.T, MARMOL.L, MARMOL.R, z0 + 5 + H);
  const zt = z0 + 5 + H + ENT, cumb = zt + TECHO;
  poly([P(x - 0.1, y - 0.1, zt), P(x + w + 0.1, y - 0.1, zt), P(x + w + 0.1, y + d / 2, cumb), P(x - 0.1, y + d / 2, cumb)], TEJA.D);
  poly([P(x - 0.1, y + d + 0.1, zt), P(x + w + 0.1, y + d + 0.1, zt), P(x + w + 0.1, y + d / 2, cumb), P(x - 0.1, y + d / 2, cumb)], TEJA.L);
  poly([P(x + w + 0.1, y - 0.1, zt), P(x + w + 0.1, y + d + 0.1, zt), P(x + w + 0.1, y + d / 2, cumb)], MARMOL.T);
  poly([P(x - 0.1, y - 0.1, zt), P(x - 0.1, y + d + 0.1, zt), P(x - 0.1, y + d / 2, cumb)], MARMOL.L);
  for (let k = 1; k < 6; k++) line(P(x - 0.1 + (w + 0.2) * k / 6, y + d + 0.1, zt), P(x - 0.1 + (w + 0.2) * k / 6, y + d / 2, cumb), 'rgba(90,32,20,.25)', 0.8 * s);
}
function drawAcropolis(t) { // el cerro escalonado de roca ática y, arriba, el Partenón (boceto A; el usuario elige la versión final)
  const A = ACROPOLIS, s = zoom;
  g.save(); g.beginPath();                                                   // el cerro ES suelo: se recorta al diamante como las dunas de Egipto
  const dA = P(2, 2), dB = P(18, 2), dC = P(18, 18), dD = P(2, 18);
  g.moveTo(dA.x, dA.y); g.lineTo(dB.x, dB.y); g.lineTo(dC.x, dC.y); g.lineTo(dD.x, dD.y); g.closePath(); g.clip();
  for (let k = 0; k < 3; k++) { const m = k * 0.22; isoBox(A.x + m, A.y + m, A.w - 2 * m, A.d - 2 * m, A.h / 3, ROCA_AT.T, ROCA_AT.L, ROCA_AT.R, k * A.h / 3); }
  for (let k = 1; k < 5; k++) line(P(A.x + A.w, A.y, k * A.h / 5 + 2), P(A.x + A.w, A.y + A.d, k * A.h / 5 + 2), 'rgba(60,44,22,.12)', 0.7 * s); // los estratos
  g.restore();
  drawTemploDorico(A.x + 1.0, A.y + 0.9, 2.6, 1.3, A.h, 8);
  const gl = 0.5 + 0.5 * Math.sin(t * 0.9);                                  // el mármol al sol: un destello lento en el frontón del este
  g.save(); g.globalAlpha = 0.06 + 0.08 * gl; ellipse(P(A.x + 3.7, A.y + 1.55, A.h + 40), 10 * s, 4 * s, '#fff8e6'); g.restore();
}
function drawStoa(t) { // el pórtico largo: columnas al frente (+y), muro atrás, tejado a un agua. La «escuela» del ágora.
  const { x, y, w, d } = STOA, s = zoom, cols = 9;
  sombra(x + w / 2 + 0.3, y + d / 2 + 0.5, 96, 40);
  isoBox(x - 0.1, y - 0.1, w + 0.2, d + 0.2, 3, MARMOL.T, MARMOL.L, MARMOL.R, 0);         // el estilóbato
  isoBox(x, y, w, 0.22, 30, MARMOL.L, MARMOL.R, MARMOL.D, 3);                             // el muro de atrás
  // LOS CUADROS DE LA STOA PECILE: el pórtico pintado (por eso «pecile»): franjas de color en el muro
  const cf = ['#a24e30', '#3f7fb5', '#c9a24a', '#5f8c3e'];
  for (let k = 0; k < 4; k++) poly([P(x + 0.35 + k * 0.7, y + 0.22, 12), P(x + 0.85 + k * 0.7, y + 0.22, 12), P(x + 0.85 + k * 0.7, y + 0.22, 24), P(x + 0.35 + k * 0.7, y + 0.22, 24)], cf[k]);
  for (let i = 0; i < cols; i++) isoBox(x + (i + 0.5) * w / cols - 0.04, y + d - 0.12, 0.08, 0.08, 28, MARMOL.T, MARMOL.L, MARMOL.R, 3);
  isoBox(x - 0.06, y - 0.06, w + 0.12, d + 0.12, 5, MARMOL.T, MARMOL.L, MARMOL.R, 31);   // el entablamento
  poly([P(x - 0.1, y + d + 0.1, 36), P(x + w + 0.1, y + d + 0.1, 36), P(x + w + 0.1, y - 0.1, 44), P(x - 0.1, y - 0.1, 44)], TEJA.L);
  poly([P(x + w + 0.1, y - 0.1, 44), P(x + w + 0.1, y + d + 0.1, 36), P(x + w + 0.1, y + d + 0.1, 31), P(x + w + 0.1, y - 0.1, 31)], TEJA.D);
  for (let k = 1; k < 8; k++) line(P(x - 0.1 + (w + 0.2) * k / 8, y + d + 0.1, 36), P(x - 0.1 + (w + 0.2) * k / 8, y - 0.1, 44), 'rgba(90,32,20,.22)', 0.8 * s);
  // el banco del grammatistes al frente: donde se DICE la respuesta
  const b = BANCO_DECIR;
  isoBox(b.x - 0.3, b.y - 0.1, 0.6, 0.2, 5, MARMOL.T, MARMOL.L, MARMOL.R, 0);
  if ((S.dudaPend || 0) > 0) { // el anillo que pide la mano, como el patio de Egipto: hay dudas esperando
    const pu = 0.5 + 0.5 * Math.sin(t * 4 + 1.3), p = P(b.x, b.y);
    g.save(); g.globalAlpha = 0.3 + 0.4 * pu; g.strokeStyle = '#ffd24a'; g.lineWidth = 1.4 * s;
    g.beginPath(); g.ellipse(p.x, p.y - 2 * s, (16 + pu * 3) * s, (7 + pu * 1.3) * s, 0, 0, 7); g.stroke(); g.restore();
  }
}
function drawPlaza() { // el empedrado del ágora, pintado en el terreno (03-terreno) — aquí solo su brocal: el altar chico del centro
  const c = P(PLAZA.x + PLAZA.w / 2, PLAZA.y + PLAZA.d / 2), s = zoom;
  isoBox(PLAZA.x + PLAZA.w / 2 - 0.12, PLAZA.y + PLAZA.d / 2 - 0.12, 0.24, 0.24, 8, MARMOL.T, MARMOL.L, MARMOL.R, 0); // el altar de los Doce Dioses: el kilómetro cero de Atenas
  dot({ x: c.x, y: c.y - 9 * zoom }, 1.2 * s, '#c9a24a');
}
function drawPalestra(t) { // el patio de arena con su pórtico en dos lados; las etapas del saber 35 le suman piezas
  const { x, y, w, d } = PALESTRA, s = zoom, niv = S.tecs[35] && S.tecs[35].fase === 'meseta' ? nivelTec(35) : -1;
  sombra(x + w / 2 + 0.2, y + d / 2 + 0.3, 70, 30);
  isoBox(x, y, w, d, 2, '#d9c69a', ROCA_AT.L, ROCA_AT.R, 0);                             // la arena rastrillada
  g.strokeStyle = 'rgba(160,128,72,.25)'; g.lineWidth = 0.8 * s;
  for (let k = 1; k < 6; k++) { const a = P(x + 0.2, y + d * k / 6, 2), b = P(x + w - 0.2, y + d * k / 6, 2); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
  // el brocal de piedra que cierra el patio por el sur y el este (los lados que el pórtico no cubre), con su portón de madera
  isoBox(x - 0.06, y + d - 0.06, w + 0.12, 0.12, 5, ROCA_AT.T, ROCA_AT.L, ROCA_AT.R, 2);
  isoBox(x + w - 0.06, y - 0.06, 0.12, d, 5, ROCA_AT.T, ROCA_AT.L, ROCA_AT.R, 2);
  if (niv < 1) { isoBox(x - 0.06, y - 0.06, w + 0.12, 0.12, 5, ROCA_AT.T, ROCA_AT.L, ROCA_AT.R, 2); isoBox(x - 0.06, y - 0.06, 0.12, d, 5, ROCA_AT.T, ROCA_AT.L, ROCA_AT.R, 2); } // sin pórtico aún, el brocal da la vuelta entera
  isoBox(x + w / 2 - 0.22, y + d - 0.07, 0.44, 0.14, 12, '#a0783f', '#8a6534', '#6f4f28', 2);   // el portón bajo de la palestra, al sur
  { const q = P(x + w / 2, y + d + 0.05, 14); dot({ x: q.x, y: q.y }, 1 * s, '#3a2c1c'); }
  for (const [px2, py2] of [[x + 0.5, y + 0.7], [x + 1.1, y + 1.5], [x + 1.9, y + 0.9], [x + 2.3, y + 1.7]]) { const q = P(px2, py2, 2); ellipse({ x: q.x, y: q.y }, 2.2 * s, 1 * s, 'rgba(150,120,70,.22)'); ellipse({ x: q.x + 3 * s, y: q.y + 1.5 * s }, 2.2 * s, 1 * s, 'rgba(150,120,70,.22)'); } // huellas en la arena
  if (niv >= 1) { // etapa 1: el pórtico de columnas en el lado norte y el oeste
    for (let i = 0; i < 6; i++) isoBox(x + 0.15 + i * (w - 0.3) / 5 - 0.04, y + 0.02, 0.08, 0.08, 22, MARMOL.T, MARMOL.L, MARMOL.R, 2);
    for (let j = 1; j < 5; j++) isoBox(x + 0.02, y + 0.15 + j * (d - 0.3) / 4 - 0.04, 0.08, 0.08, 22, MARMOL.T, MARMOL.L, MARMOL.R, 2);
    poly([P(x - 0.1, y - 0.1, 24), P(x + w + 0.1, y - 0.1, 24), P(x + w + 0.1, y + 0.4, 30), P(x - 0.1, y + 0.4, 30)], TEJA.L);
    poly([P(x - 0.1, y - 0.1, 24), P(x - 0.1, y + d + 0.1, 24), P(x + 0.4, y + d + 0.1, 30), P(x + 0.4, y - 0.1, 30)], TEJA.D);
  }
  if (niv >= 2) { // etapa 2: la pista con su línea de salida (balbis) y las ánforas de aceite
    const a = P(x + 0.3, y + d - 0.35, 2), b = P(x + w - 0.3, y + d - 0.35, 2);
    line(a, b, MARMOL.T, 2.2 * s);
    for (let k = 0; k < 4; k++) { const q = P(x + 0.5 + k * 0.6, y + d - 0.35, 2); line({ x: q.x, y: q.y - 1.5 * s }, { x: q.x, y: q.y + 1.5 * s }, MARMOL.D, 1.2 * s); }
    for (const [ax, ay] of [[x + w - 0.25, y + 0.35], [x + w - 0.25, y + 0.6]]) { const q = P(ax, ay, 2); ellipse({ x: q.x, y: q.y - 3 * s }, 2.4 * s, 3.4 * s, '#b08a55'); ellipse({ x: q.x, y: q.y - 6.6 * s }, 1.4 * s, 0.7 * s, '#8a6a4a'); }
  }
  if (niv >= 3) { // etapa 3: la estatua de Hermes (el patrón de las palestras) en su pilar, y los discos
    isoBox(x + w - 0.42, y + d - 0.42, 0.2, 0.2, 18, MARMOL.T, MARMOL.L, MARMOL.R, 2);
    isoBox(x + w - 0.4, y + d - 0.4, 0.16, 0.16, 6, MARMOL.T, MARMOL.L, MARMOL.R, 20);   // la cabeza del herma
    const q = P(x + 0.6, y + 0.5, 2); for (let k = 0; k < 3; k++) ellipse({ x: q.x + k * 3.2 * s, y: q.y - 1 * s }, 2.6 * s, 1.1 * s, '#8f8a7c'); // los discos
  }
  estadoTec(35, P(x + w / 2, y + d / 2, 40), t);
}
function drawOlivo(x, y, sc, t) { // el olivo: tronco retorcido y copa gris verdosa que se mece
  const q = P(x, y), s = zoom * sc, sw = Math.sin(t * 0.6 + x * 2) * 1.2 * s;
  sombra(x + 0.1, y + 0.1, 14 * sc, 5 * sc);
  g.strokeStyle = '#6f5a3c'; g.lineWidth = 3.2 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(q.x, q.y); g.quadraticCurveTo(q.x - 5 * s, q.y - 12 * s, q.x + 2 * s + sw * 0.3, q.y - 22 * s); g.stroke();
  g.beginPath(); g.moveTo(q.x - 1 * s, q.y - 12 * s); g.lineTo(q.x - 9 * s, q.y - 20 * s); g.stroke();
  for (const [dx, dy, r] of [[2, -30, 12], [-8, -24, 9], [10, -24, 9], [0, -22, 8], [-4, -32, 7], [8, -33, 7]]) ellipse({ x: q.x + dx * s + sw, y: q.y + dy * s }, r * s, r * 0.8 * s, dy < -28 ? '#a9b48f' : '#7d8f68');
  for (const [dx, dy, r] of [[-1, -34, 5], [6, -32, 4], [-7, -28, 3.5]]) ellipse({ x: q.x + dx * s + sw, y: q.y + dy * s }, r * s, r * 0.6 * s, '#c6cdb0'); // el envés plateado de la hoja, donde da el sol
  for (const [dx, dy] of [[-3, -27], [5, -25], [1, -33], [-9, -22], [9, -29]]) ellipse({ x: q.x + dx * s + sw, y: q.y + dy * s }, 1.0 * s, 1.4 * s, '#2f3a2c'); // las aceitunas, negras
}
function drawColmena(x, y, t) { // la colmena de cerámica, con sus abejas: la querencia de la cera
  const s = zoom;
  isoBox(x - 0.11, y - 0.11, 0.22, 0.22, 9, '#d6b78a', '#c19a68', '#a37e4c', 0);
  const c = P(x, y); dot({ x: c.x + 3 * s, y: c.y - 5 * s }, 1.4 * s, '#3a2c1c');
  for (let k = 0; k < 3; k++) { const a = t * 3 + k * 2.1, p = { x: c.x + Math.cos(a) * (5 + k) * s, y: c.y - 10 * s + Math.sin(a * 1.3) * 3 * s }; dot(p, 0.7 * s, '#3a2c1c'); dot({ x: p.x + 0.6 * s, y: p.y }, 0.5 * s, '#e8c96a'); }
}
function drawCasaAtica(x, y, w, d, h, i) { // la casa de la ciudad: muro encalado, tejado a dos aguas de teja, puerta baja
  const s = zoom;
  sombra(x + w / 2 + 0.14, y + d / 2 + 0.18, 17 * (w + d), 7.5 * (w + d));
  isoBox(x, y, w, d, h, '#f0e9d8', '#e3dccb', '#c6bfad');
  poly([P(x - 0.05, y - 0.05, h), P(x + w + 0.05, y - 0.05, h), P(x + w + 0.05, y + d / 2, h + 9), P(x - 0.05, y + d / 2, h + 9)], TEJA.D);
  poly([P(x - 0.05, y + d + 0.05, h), P(x + w + 0.05, y + d + 0.05, h), P(x + w + 0.05, y + d / 2, h + 9), P(x - 0.05, y + d / 2, h + 9)], TEJA.L);
  poly([P(x + w + 0.05, y - 0.05, h), P(x + w + 0.05, y + d + 0.05, h), P(x + w + 0.05, y + d / 2, h + 9)], '#e3dccb');
  poly([P(x + w * 0.36, y + d, 0), P(x + w * 0.6, y + d, 0), P(x + w * 0.6, y + d, h * 0.62), P(x + w * 0.36, y + d, h * 0.62)], '#4a3a28');
  if (i === 1) { const a = P(x + w + 0.02, y + d * 0.3, 0); g.fillStyle = '#b08a55'; g.fillRect(a.x + 2 * s, a.y - 8 * s, 4 * s, 8 * s); } // la tinaja junto a la puerta
}
function drawPlatano(t) { // el plátano del Ilisos: el árbol del Fedro, grande y de hoja ancha
  const { x, y } = PLATANO, q = P(x, y), s = zoom, sw = Math.sin(t * 0.5) * 1.6 * s;
  sombra(x + 0.15, y + 0.15, 22, 8);
  g.strokeStyle = '#9a8f78'; g.lineWidth = 4.2 * s; g.lineCap = 'round';                // el tronco moteado del plátano
  g.beginPath(); g.moveTo(q.x, q.y); g.quadraticCurveTo(q.x + 1 * s, q.y - 16 * s, q.x + 2 * s + sw * 0.2, q.y - 34 * s); g.stroke();
  g.strokeStyle = '#b8ad95'; g.lineWidth = 1.4 * s;
  for (const [dx, dy] of [[-1, -10], [1.5, -18], [-0.5, -26]]) { g.beginPath(); g.moveTo(q.x + dx * s, q.y + dy * s); g.lineTo(q.x + dx * s + 1.4 * s, q.y + dy * s - 2 * s); g.stroke(); }
  for (const [dx, dy, r] of [[2, -44, 18], [-14, -36, 13], [18, -36, 13], [0, -30, 11], [-8, -48, 10], [12, -49, 10]]) ellipse({ x: q.x + dx * s + sw, y: q.y + dy * s }, r * s, r * 0.78 * s, dy < -42 ? '#8fb05e' : '#6f9448');
}
function drawIlisosVivo(t) { // la corriente del arroyo: hebras y algún pez, recortado a la lámina
  const w = ilisosAgua();
  g.save(); g.beginPath();
  for (let i = 0; i <= 22; i++) { const q = puntoIlisos(i / 22, w * 0.92, -5); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }
  for (let i = 22; i >= 0; i--) { const q = puntoIlisos(i / 22, -w * 0.92, -5); g.lineTo(q.x, q.y); }
  g.closePath(); g.clip();
  g.strokeStyle = 'rgba(240,250,255,.42)'; g.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const u = (t * (0.009 + (i % 3) * 0.003) + i * 0.31) % 1, perp = (-0.6 + (i * 0.23) % 1.2) * w;
    const a2 = puntoIlisos(u, perp, -5), b2 = puntoIlisos(Math.min(1, u + 0.04), perp, -5);
    g.lineWidth = (1 + (i % 2) * 0.5) * zoom; g.globalAlpha = 0.22 + 0.2 * Math.sin(t * 1.1 + i * 2.1);
    g.beginPath(); g.moveTo(a2.x, a2.y); g.lineTo(b2.x, b2.y); g.stroke();
  }
  g.globalAlpha = 0.22;
  for (const f of [{ u0: 0.3, vel: 0.006, perp: 0.3 }, { u0: 0.7, vel: -0.005, perp: -0.3 }]) {
    const u = 0.15 + (((f.u0 + t * f.vel) % 0.7) + 0.7) % 0.7, a2 = puntoIlisos(u, f.perp * w, -5), b2 = puntoIlisos(u + (f.vel >= 0 ? 0.015 : -0.015), f.perp * w, -5);
    g.save(); g.translate(a2.x, a2.y); g.rotate(Math.atan2(b2.y - a2.y, b2.x - a2.x));
    g.beginPath(); g.ellipse(0, 0, 5 * zoom, 1.8 * zoom, 0, 0, 7); g.fillStyle = '#1d3f4e'; g.fill(); g.restore();
  }
  g.restore();
}

/* ---------- LOS SEIS SABERES, en sus etapas (la vara: ≥8% de silueta por etapa) ---------- */
function drawTablillaCera(t) { // 33: la tablilla de cera y el estilo, sobre su atril en la stoa
  const x = 11.05, y = 7.15, p = P(x, y), s = zoom, niv = nivelTec(33);
  sombra(x, y + 0.1, 10, 4);
  line({ x: p.x - 3 * s, y: p.y }, { x: p.x, y: p.y - 8 * s }, '#8a6a4a', 1.3 * s); line({ x: p.x + 3 * s, y: p.y }, { x: p.x, y: p.y - 8 * s }, '#8a6a4a', 1.3 * s); // el atril
  const tab = (dx, dy, rot, escrita) => { g.save(); g.translate(p.x + dx * s, p.y + dy * s); g.rotate(rot);
    g.fillStyle = '#8a6a4a'; g.fillRect(-5 * s, -3.6 * s, 10 * s, 7.2 * s);                      // el marco de madera
    g.fillStyle = '#3f3a32'; g.fillRect(-4.2 * s, -2.8 * s, 8.4 * s, 5.6 * s);                    // la cera negra
    if (escrita) { g.strokeStyle = '#c9bd96'; g.lineWidth = 0.55 * s; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-3.2 * s, -1.6 * s + k * 1.6 * s); g.lineTo((1.5 + (k % 2)) * s, -1.6 * s + k * 1.6 * s); g.stroke(); } }
    g.restore(); };
  tab(0, -10, -0.12, true);
  line({ x: p.x + 5 * s, y: p.y - 13 * s }, { x: p.x + 7.5 * s, y: p.y - 5 * s }, '#d9d2c4', 1.1 * s); // el estilo de hueso
  dot({ x: p.x + 7.6 * s, y: p.y - 4.6 * s }, 0.9 * s, '#e9e2d0');                                   // su extremo plano, el que borra
  if (niv >= 1) tab(-9, -3, 0.35, false);                                                            // etapa 1: el díptico, la segunda hoja atada
  if (niv >= 1) line({ x: p.x - 5 * s, y: p.y - 6.5 * s }, { x: p.x - 9 * s, y: p.y - 1 * s }, '#b09a60', 0.8 * s);
  if (niv >= 2) { for (let k = 0; k < 3; k++) tab(10 + k * 1.5, 1 - k * 2.4, 0.1, k === 1); }         // etapa 2: el políptico apilado
  if (niv >= 3) { // etapa 3: la tablilla colgada del muro de la stoa, con el abecedario: la letra que se aprende de todos
    g.save(); g.translate(p.x - 2 * s, p.y - 26 * s); g.fillStyle = '#8a6a4a'; g.fillRect(-9 * s, -5 * s, 18 * s, 10 * s); g.fillStyle = '#3f3a32'; g.fillRect(-8 * s, -4 * s, 16 * s, 8 * s);
    g.strokeStyle = '#e9e2d0'; g.lineWidth = 0.7 * s; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(-6.5 * s + k * 2.4 * s, -1.5 * s); g.lineTo(-5.5 * s + k * 2.4 * s, 1.5 * s); g.lineTo(-4.5 * s + k * 2.4 * s, -1.5 * s); g.stroke(); }
    g.restore(); }
  estadoTec(33, { x: p.x, y: p.y - 30 * s }, t);
}
function drawLira(t) { // 34: la lira colgada del pórtico; el coro de la tarde; el aulós
  const x = 8.35, y = 6.55, p = P(x, y, 22), s = zoom, niv = nivelTec(34);
  g.save(); g.translate(p.x, p.y);
  g.strokeStyle = '#c9a24a'; g.lineWidth = 1.6 * s; g.lineCap = 'round';                             // los brazos de cuerno de la lira
  g.beginPath(); g.moveTo(-4 * s, 0); g.quadraticCurveTo(-6 * s, -9 * s, -2 * s, -12 * s); g.stroke();
  g.beginPath(); g.moveTo(4 * s, 0); g.quadraticCurveTo(6 * s, -9 * s, 2 * s, -12 * s); g.stroke();
  g.beginPath(); g.moveTo(-2 * s, -12 * s); g.lineTo(2 * s, -12 * s); g.stroke();                    // el travesaño
  ellipse({ x: 0, y: 0 }, 5 * s, 3.6 * s, '#8a6a4a'); ellipse({ x: 0, y: -0.4 * s }, 3.6 * s, 2.4 * s, '#b08a55'); // la caja: el caparazón de tortuga
  g.strokeStyle = '#efe6cc'; g.lineWidth = 0.5 * s; for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(k * 0.9 * s, -11.8 * s); g.lineTo(k * 0.6 * s, -1 * s); g.stroke(); } // las siete cuerdas
  g.restore();
  if (niv >= 1) { const q = P(x + 0.5, y + 0.05, 22); for (let k = 0; k < 2; k++) { g.save(); g.translate(q.x + k * 6 * s, q.y - 3 * s); g.strokeStyle = '#c9a24a'; g.lineWidth = 1.3 * s; g.beginPath(); g.moveTo(-3 * s, 0); g.quadraticCurveTo(-4 * s, -7 * s, -1.5 * s, -9 * s); g.moveTo(3 * s, 0); g.quadraticCurveTo(4 * s, -7 * s, 1.5 * s, -9 * s); g.stroke(); ellipse({ x: 0, y: 0 }, 3.6 * s, 2.6 * s, '#8a6a4a'); g.restore(); } } // etapa 1: más liras colgadas: el coro tiene con qué
  if (niv >= 2) { const q = P(x + 1.0, y + 0.1, 22); g.strokeStyle = '#8a6a4a'; g.lineWidth = 1.6 * s; g.beginPath(); g.moveTo(q.x - 1 * s, q.y - 10 * s); g.lineTo(q.x + 6 * s, q.y - 4 * s); g.moveTo(q.x - 1 * s, q.y - 8 * s); g.lineTo(q.x + 6 * s, q.y - 2 * s); g.stroke(); dot({ x: q.x - 1 * s, y: q.y - 9 * s }, 1.6 * s, '#c9a24a'); } // etapa 2: el aulós, la flauta doble
  if (niv >= 3) { const q = P(x + 1.5, y + 0.1, 22); g.fillStyle = '#efe6cc'; g.fillRect(q.x - 5 * s, q.y - 12 * s, 10 * s, 7 * s); g.strokeStyle = '#8a7a4a'; g.lineWidth = 0.5 * s; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(q.x - 4 * s, q.y - 10.8 * s + k * 1.5 * s); g.lineTo(q.x + 4 * s, q.y - 10.8 * s + k * 1.5 * s); g.stroke(); } for (let k = 0; k < 5; k++) dot({ x: q.x - 3.4 * s + k * 1.7 * s, y: q.y - 10.4 * s + (k % 3) * 1.5 * s }, 0.55 * s, '#3a2c1c'); } // etapa 3: la partitura colgada: la música que ya se escribe
  estadoTec(34, { x: P(x, y).x, y: P(x, y).y - 40 * s }, t);
}
function drawSofista(t) { // 36: el sofista con su bolsa; su tarima; la puerta de la escuela de Isócrates con su precio
  const c = TARIMA_SOFISTA, p = P(c.x, c.y), s = zoom, niv = nivelTec(36), activo = S.tecs[36] && S.tecs[36].fase === 'meseta';
  sombra(c.x, c.y + 0.12, 12, 5);
  if (niv >= 1) isoBox(c.x - 0.35, c.y - 0.25, 0.7, 0.5, 6, '#c9a875', '#b08a55', '#96714c', 0); // etapa 1: la tarima de madera
  const z0 = niv >= 1 ? 6 : 0, q = P(c.x, c.y, z0), gesto = Math.sin(t * 1.4) * 1.4 * s;
  g.save(); g.translate(q.x, q.y);
  g.beginPath(); g.moveTo(-6 * s, 0); g.quadraticCurveTo(-5 * s, -15 * s, 0, -16 * s); g.quadraticCurveTo(5 * s, -15 * s, 6 * s, 0); g.closePath(); g.fillStyle = '#7a4a6e'; g.fill(); // el manto de púrpura: se nota que cobra
  g.fillStyle = '#e8dcc0'; g.beginPath(); g.moveTo(-4 * s, -15 * s); g.quadraticCurveTo(-4.4 * s, -21 * s, 0, -22 * s); g.quadraticCurveTo(4.4 * s, -21 * s, 4 * s, -15 * s); g.closePath(); g.fill();
  dot({ x: 0, y: -27 * s }, 6 * s, PAL.piel); ojo(2.4 * s, -27.4 * s, 0.9 * s, apertura(1.7)); ojo(4.9 * s, -27.4 * s, 0.9 * s, apertura(1.7));
  g.beginPath(); g.arc(0, -28.6 * s, 5.9 * s, Math.PI * .95, Math.PI * 2.05); g.fillStyle = '#4a3a2c'; g.fill();
  g.strokeStyle = '#4a3a2c'; g.lineWidth = 1.2 * s; g.beginPath(); g.arc(0, -25 * s, 4.2 * s, 0.2, Math.PI - 0.2); g.stroke(); // la barba recortada
  g.strokeStyle = PAL.piel; g.lineWidth = 2.4 * s; g.lineCap = 'round'; g.beginPath(); g.moveTo(4 * s, -18 * s); g.lineTo(9 * s, -14 * s + gesto); g.stroke(); // la mano que argumenta
  g.fillStyle = '#c9a24a'; g.beginPath(); g.ellipse(-7 * s, -8 * s, 2.6 * s, 3.2 * s, 0, 0, 7); g.fill(); line({ x: -7 * s, y: -11 * s }, { x: -5.5 * s, y: -14 * s }, '#8a6a4a', 0.9 * s); // la bolsa del pago
  g.restore();
  if (niv >= 2) { for (let k = 0; k < 3; k++) { const a = P(c.x - 0.5 + k * 0.5, c.y + 0.7); drawSentadito(c.x - 0.5 + k * 0.5, c.y + 0.7, k, t); } } // etapa 2: el público que paga por oír
  if (niv >= 3) { // etapa 3: la puerta de la escuela de Isócrates, con el letrero del precio
    isoBox(c.x + 0.7, c.y - 0.5, 0.9, 0.16, 26, MARMOL.T, MARMOL.L, MARMOL.R, 0);
    poly([P(c.x + 0.95, c.y - 0.34, 0), P(c.x + 1.35, c.y - 0.34, 0), P(c.x + 1.35, c.y - 0.34, 18), P(c.x + 0.95, c.y - 0.34, 18)], '#4a3a28');
    const l = P(c.x + 1.15, c.y - 0.34, 22); g.fillStyle = '#efe6cc'; g.fillRect(l.x - 5 * s, l.y - 3 * s, 10 * s, 5 * s); g.fillStyle = '#c94f43'; g.font = `${4 * s}px Georgia, serif`; g.textAlign = 'center'; g.fillText('Χ', l.x, l.y + 1 * s);
  }
  estadoTec(36, { x: p.x, y: p.y - 36 * s }, t);
  if (activo && !S.sofista) { const pu = 0.5 + 0.5 * Math.sin(t * 3); g.save(); g.globalAlpha = 0.25 + 0.3 * pu; g.strokeStyle = '#ffd24a'; g.lineWidth = 1.2 * s; g.beginPath(); g.ellipse(p.x, p.y - 2 * s, 13 * s, 6 * s, 0, 0, 7); g.stroke(); g.restore(); }
}
function drawPregunta(t) { // 37: el cuadrado del Menón en la arena; el banco de la stoa; el plátano del Ilisos (que ya está: gana su banco)
  const c = AGORA_PREGUNTAR, p = P(c.x, c.y), s = zoom, niv = nivelTec(37);
  // el cuadrado dibujado en la arena con el dedo: dos lados y la diagonal que lo duplica
  g.strokeStyle = 'rgba(120,98,58,.55)'; g.lineWidth = 1.2 * s; g.lineCap = 'round';
  const a = P(c.x - 0.3, c.y - 0.3), b = P(c.x + 0.3, c.y - 0.3), cc = P(c.x + 0.3, c.y + 0.3), d = P(c.x - 0.3, c.y + 0.3);
  g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(cc.x, cc.y); g.lineTo(d.x, d.y); g.closePath(); g.stroke();
  if (niv >= 1) { g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(cc.x, cc.y); g.stroke();                       // etapa 1: la diagonal, y el cuadrado doble que nace de ella
    const e = P(c.x + 0.9, c.y - 0.3), f = P(c.x + 0.9, c.y + 0.3); g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(e.x, e.y); g.lineTo(f.x, f.y); g.lineTo(cc.x, cc.y); g.stroke(); }
  if (niv >= 2) { const q = P(c.x + 0.6, c.y + 0.75); isoBox(c.x + 0.25, c.y + 0.6, 0.7, 0.2, 5, MARMOL.T, MARMOL.L, MARMOL.R, 0); drawSentadito(c.x + 0.45, c.y + 0.95, 1, t, { lado: -1, ritmo: 1.2 }); } // etapa 2: el banco de mármol donde se sientan a conversar
  if (niv >= 3) { const q = P(PLATANO.x - 0.5, PLATANO.y + 0.35); isoBox(PLATANO.x - 0.85, PLATANO.y + 0.25, 0.7, 0.2, 5, MARMOL.T, MARMOL.L, MARMOL.R, 0); drawSentadito(PLATANO.x - 0.65, PLATANO.y + 0.6, 2, t, { lado: 1, ritmo: 1.0 }); } // etapa 3: el banco bajo el plátano del Fedro
  if ((S.dudaPend || 0) > 0) { const pu = 0.5 + 0.5 * Math.sin(t * 4 + 2.2); g.save(); g.globalAlpha = 0.3 + 0.4 * pu; g.strokeStyle = '#ffd24a'; g.lineWidth = 1.4 * s; g.beginPath(); g.ellipse(p.x, p.y - 1 * s, (20 + pu * 3) * s, (9 + pu * 1.3) * s, 0, 0, 7); g.stroke(); g.restore(); }
  estadoTec(37, { x: p.x, y: p.y - 22 * s }, t);
}
function drawAcademia(t) { // 38: el olivar cercado; el pórtico con el letrero; el peripatos del Liceo
  const o = OLIVAR, s = zoom, tc = S.tecs[38], fase = tc ? tc.fase : 'sin', niv = nivelTec(38);
  if (fase === 'sin') return;
  const alto = fase === 'meseta' ? 7 : 4;
  isoBox(o.x - 0.1, o.y - 0.1, o.w + 0.2, 0.12, alto, ROCA_AT.T, ROCA_AT.L, ROCA_AT.R, 0);            // el muro bajo: norte
  isoBox(o.x - 0.1, o.y - 0.1, 0.12, o.d + 0.2, alto, ROCA_AT.T, ROCA_AT.L, ROCA_AT.R, 0);            // oeste
  isoBox(o.x - 0.1, o.y + o.d, o.w + 0.2, 0.12, alto, ROCA_AT.T, ROCA_AT.L, ROCA_AT.R, 0);            // sur, con su hueco de entrada
  isoBox(o.x + o.w, o.y - 0.1, 0.12, o.d + 0.2, alto, ROCA_AT.T, ROCA_AT.L, ROCA_AT.R, 0);            // este
  if (niv >= 1 && fase === 'meseta') { // etapa 1: el pórtico de entrada, dos columnas y su dintel
    isoBox(o.x + o.w / 2 - 0.4, o.y + o.d - 0.05, 0.1, 0.1, 20, MARMOL.T, MARMOL.L, MARMOL.R, 0);
    isoBox(o.x + o.w / 2 + 0.3, o.y + o.d - 0.05, 0.1, 0.1, 20, MARMOL.T, MARMOL.L, MARMOL.R, 0);
    isoBox(o.x + o.w / 2 - 0.5, o.y + o.d - 0.1, 1.0, 0.2, 4, MARMOL.T, MARMOL.L, MARMOL.R, 20);
  }
  if (niv >= 2 && fase === 'meseta') { // etapa 2: el letrero (⚖️ el «no entre quien no sepa geometría» es tradición tardía, y la ficha lo dice)
    const l = P(o.x + o.w / 2, o.y + o.d, 26); g.fillStyle = '#efe6cc'; g.fillRect(l.x - 12 * s, l.y - 4 * s, 24 * s, 6 * s);
    g.fillStyle = '#3a2c1c'; g.font = `${3.6 * s}px Georgia, serif`; g.textAlign = 'center'; g.fillText('ΑΚΑΔΗΜΙΑ', l.x, l.y + 0.6 * s);
  }
  if (niv >= 3 && fase === 'meseta') { // etapa 3: el peripatos: el paseo cubierto por donde se enseña andando (el Liceo)
    for (let i = 0; i < 5; i++) isoBox(o.x + 0.3 + i * (o.w - 0.6) / 4 - 0.04, o.y + 0.25, 0.08, 0.08, 18, MARMOL.T, MARMOL.L, MARMOL.R, 0);
    poly([P(o.x + 0.1, o.y + 0.1, 20), P(o.x + o.w - 0.1, o.y + 0.1, 20), P(o.x + o.w - 0.1, o.y + 0.55, 25), P(o.x + 0.1, o.y + 0.55, 25)], TEJA.L);
  }
  if (fase !== 'meseta') { for (const [px2, py2] of [[o.x + 0.3, o.y + o.d + 0.2], [o.x + o.w - 0.3, o.y + o.d + 0.2]]) line(P(px2, py2, 0), P(px2, py2, 14), '#8a6a4a', 1.2 * s); } // la obra: los postes de la cerca a medio hacer
  estadoTec(38, P(o.x + o.w / 2, o.y + o.d, 34), t);
}
/* LA APORÍA EN EL MUNDO: el aprendiz que piensa camina con su «?» y vuelve con «!» */
function drawGloboDuda(px, py, txt, t) {
  const s = zoom, pp = { x: px, y: py - 34 * s + Math.sin(t * 2.6) * 2 * s };
  g.save(); g.globalAlpha = 0.9; g.fillStyle = '#fff8e6'; g.strokeStyle = '#c99a3f'; g.lineWidth = 1.2 * s;
  g.beginPath(); g.ellipse(pp.x, pp.y, 8 * s, 6.5 * s, 0, 0, 7); g.fill(); g.stroke();
  g.fillStyle = txt === '?' ? '#3f7fb5' : '#c94f43'; g.font = `bold ${8 * s}px Georgia, serif`; g.textAlign = 'center'; g.fillText(txt, pp.x, pp.y + 3 * s); g.restore();
}

function drawCabraAt(x, y, t) { // Amaltea, la cabra del olivar: pasta aceitunas caídas
  const cb = P(x, y), s = zoom, mordisco = Math.sin(t * 1.6) > 0.6 ? 1.2 * s : 0;
  ellipse({ x: cb.x, y: cb.y }, 5 * s, 2.2 * s, sombraHoy);
  ellipse({ x: cb.x, y: cb.y - 3 * s }, 4 * s, 2.2 * s, '#d8d0bc');
  dot({ x: cb.x + 4.2 * s, y: cb.y - 4.6 * s + mordisco }, 1.6 * s, '#d8d0bc');
  line({ x: cb.x + 4.6 * s, y: cb.y - 6 * s + mordisco }, { x: cb.x + 5.6 * s, y: cb.y - 7.6 * s + mordisco }, '#8a7a5a', 0.8 * s);
  g.strokeStyle = '#8a7a5a'; g.lineWidth = 0.9 * s;
  for (const k of [-2.4, -0.8, 1.2, 2.6]) { g.beginPath(); g.moveTo(cb.x + k * s, cb.y - 1.6 * s); g.lineTo(cb.x + k * s, cb.y); g.stroke(); }
}
