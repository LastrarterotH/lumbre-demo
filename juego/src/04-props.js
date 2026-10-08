/* ============================================================
   04-props
   Props del mundo: el aula y su patio, la vegetación (con copaHoy, que la viste del año) y los aparatos de 1920-1955.
   ============================================================ */
function drawEscuela(t) {
  if (S.era === 1) { drawCueva(t); return; }  // antes de la escuela, el abrigo rocoso
  if (S.era === 2) { if (S.tecs[30] && S.tecs[30].fase !== 'sin') drawEdubba(t); return; } // en Sumer la escuela SE FUNDA: comprar la edubba (saber 30) levanta la casa de las tablillas
  if (S.era === 3) { drawCasaVida(t); return; } // y en Egipto, la Casa de la Vida
  if (S.era === 4) { drawStoa(t); return; }     // y en Atenas, la stoa: el pórtico donde se enseña
  const x0 = 8, y0 = 5, w = 3, d = 3, h = 52, ridge = 96, e = 0.22, yM = y0 + d / 2;
  sombra(x0 + w / 2 + 0.4, y0 + d / 2 + 0.55, 105, 46);
  isoBox(x0, y0, w, d, h, PAL.crema, PAL.maderaL, PAL.maderaD);
  for (let z = 12; z < h; z += 13) {
    line(P(x0, y0 + d, z), P(x0 + w, y0 + d, z), PAL.maderaLinea, 1.2 * zoom);
    line(P(x0 + w, y0, z), P(x0 + w, y0 + d, z), PAL.maderaLinea, 1.2 * zoom);
  }
  poly([P(x0, y0 + d, 7), P(x0 + w, y0 + d, 7), P(x0 + w, y0 + d, 0), P(x0, y0 + d, 0)], PAL.piedraL);
  poly([P(x0 + w, y0, 7), P(x0 + w, y0 + d, 7), P(x0 + w, y0 + d, 0), P(x0 + w, y0, 0)], PAL.piedraD);
  poly([P(x0 + w, y0, h), P(x0 + w, y0 + d, h), P(x0 + w, yM, ridge)], PAL.maderaD);
  poly([P(x0 - e, y0 - e, h), P(x0 + w + e, y0 - e, h), P(x0 + w, yM, ridge), P(x0, yM, ridge)], PAL.techoD);
  isoBox(10.35, 5.45, 0.32, 0.32, 40, '#8a5a45', '#8a5a45', '#6e4433', 60);
  poly([P(10.28, 5.38, 100), P(10.74, 5.38, 100), P(10.74, 5.84, 100), P(10.28, 5.84, 100)], '#4a2e22');
  poly([P(x0 - e, y0 + d + e, h), P(x0 + w + e, y0 + d + e, h), P(x0 + w, yM, ridge), P(x0, yM, ridge)], PAL.techoL);
  for (let i = 1; i <= 4; i++) {
    const tt = i / 5;
    line({ x: lerp(P(x0 - e, y0 + d + e, h).x, P(x0, yM, ridge).x, tt), y: lerp(P(x0 - e, y0 + d + e, h).y, P(x0, yM, ridge).y, tt) },
         { x: lerp(P(x0 + w + e, y0 + d + e, h).x, P(x0 + w, yM, ridge).x, tt), y: lerp(P(x0 + w + e, y0 + d + e, h).y, P(x0 + w, yM, ridge).y, tt) },
         PAL.techoLinea, 1.4 * zoom);
    line({ x: lerp(P(x0 - e, y0 - e, h).x, P(x0, yM, ridge).x, tt), y: lerp(P(x0 - e, y0 - e, h).y, P(x0, yM, ridge).y, tt) },
         { x: lerp(P(x0 + w + e, y0 - e, h).x, P(x0 + w, yM, ridge).x, tt), y: lerp(P(x0 + w + e, y0 - e, h).y, P(x0 + w, yM, ridge).y, tt) },
         PAL.techoLinea, 1.4 * zoom);
  }
  line(P(x0 - e, y0 + d + e, h), P(x0 + w + e, y0 + d + e, h), PAL.crema, 2.2 * zoom);
  line(P(x0, yM, ridge), P(x0 + w, yM, ridge), PAL.crema, 2.6 * zoom);
  const bx = x0 + w / 2, bh = ridge + 2;
  isoBox(bx - 0.26, yM - 0.26, 0.52, 0.52, 26, PAL.crema, '#e6d9ba', '#c9b992', ridge);
  poly([P(bx - 0.16, yM + 0.26, bh + 20), P(bx + 0.16, yM + 0.26, bh + 20), P(bx + 0.16, yM + 0.26, bh + 4), P(bx - 0.16, yM + 0.26, bh + 4)], '#3a2c1c');
  const swing = Math.sin(t * 2.1) * 0.16;
  const piv = P(bx, yM + 0.27, bh + 19);
  g.save(); g.translate(piv.x, piv.y); g.rotate(swing);
  g.beginPath(); g.arc(0, 7 * zoom, 4.6 * zoom, 0, 7); g.fillStyle = PAL.campana; g.fill();
  g.beginPath(); g.arc(0, 12 * zoom, 1.6 * zoom, 0, 7); g.fillStyle = PAL.campanaD; g.fill();
  dot({ x: -1.4 * zoom, y: 5.5 * zoom }, 1.1 * zoom, '#f4dfa4');
  g.restore();
  const apex = P(bx, yM, bh + 48);
  poly([P(bx - 0.34, yM - 0.34, bh + 24), P(bx + 0.34, yM - 0.34, bh + 24), apex], PAL.techoD);
  poly([P(bx - 0.34, yM + 0.34, bh + 24), P(bx + 0.34, yM + 0.34, bh + 24), apex], PAL.techoL);
  poly([P(bx + 0.34, yM - 0.34, bh + 24), P(bx + 0.34, yM + 0.34, bh + 24), apex], PAL.techoD);
  if (ordEra(S.era) >= 12) { // la antena de radio de 1935: mástil, travesaño y cable al campanario
    const ax = 10.85, mast0 = P(ax, yM, ridge), mast1 = P(ax, yM, ridge + 52);
    line(mast0, mast1, '#5e4128', 2 * zoom);
    line({ x: mast1.x - 6 * zoom, y: mast1.y + 6 * zoom }, { x: mast1.x + 6 * zoom, y: mast1.y + 6 * zoom }, '#5e4128', 1.6 * zoom);
    g.beginPath();
    g.moveTo(mast1.x, mast1.y + 2 * zoom);
    g.quadraticCurveTo((mast1.x + apex.x) / 2, mast1.y + 14 * zoom, apex.x, apex.y - 2 * zoom);
    g.strokeStyle = 'rgba(58,44,28,.8)'; g.lineWidth = 1 * zoom; g.stroke();
  }
  const dyF = y0 + d, q = (x, z) => P(x, dyF, z);
  poly([q(9.22, 34), q(9.82, 34), q(9.82, 0), q(9.22, 0)], PAL.crema);
  poly([q(9.29, 30.5), q(9.75, 30.5), q(9.75, 0), q(9.29, 0)], PAL.puerta);
  line(q(9.52, 30.5), q(9.52, 0), 'rgba(240,228,200,.25)', 1 * zoom);
  dot(q(9.68, 15), 1.3 * zoom, PAL.campana);
  isoBox(9.28, dyF, 0.5, 0.3, 6, PAL.piedraL, PAL.piedraL, PAL.piedraD);
  isoBox(9.2, dyF + 0.3, 0.66, 0.28, 3, PAL.piedraL, PAL.piedraL, PAL.piedraD);
  windowOnFront(8.35, 8.95, dyF, 20, 38);
  windowOnRight(x0 + w, 5.5, 6.1, 20, 38);
  windowOnRight(x0 + w, 6.9, 7.5, 20, 38);
  poly([q(9.16, 44), q(9.88, 44), q(9.88, 37), q(9.16, 37)], PAL.cremaD);
  const c = q(9.52, 38.6);
  g.fillStyle = '#6b533a'; g.font = `600 ${7.5 * zoom}px Georgia, serif`; g.textAlign = 'center';
  g.fillText('1920', c.x, c.y);
}
function windowOnFront(xa, xb, yf, z0, z1) {
  const q = (x, z) => P(x, yf, z);
  poly([q(xa, z1), q(xb, z1), q(xb, z0), q(xa, z0)], PAL.crema);
  const ix = 0.06;
  poly([q(xa + ix, z1 - 3), q(xb - ix, z1 - 3), q(xb - ix, z0 + 3), q(xa + ix, z0 + 3)], PAL.vidrio);
  line(q((xa + xb) / 2, z1 - 3), q((xa + xb) / 2, z0 + 3), PAL.crema, 1.4 * zoom);
  line(q(xa + ix, (z0 + z1) / 2), q(xb - ix, (z0 + z1) / 2), PAL.crema, 1.4 * zoom);
  line(q(xa + 0.09, z1 - 6), q(xb - 0.2, z0 + 8), PAL.vidrioBrillo, 1.6 * zoom);
}
function windowOnRight(xf, ya, yb, z0, z1) {
  const q = (y, z) => P(xf, y, z);
  poly([q(ya, z1), q(yb, z1), q(yb, z0), q(ya, z0)], PAL.cremaD);
  const iy = 0.06;
  poly([q(ya + iy, z1 - 3), q(yb - iy, z1 - 3), q(yb - iy, z0 + 3), q(ya + iy, z0 + 3)], '#5f7488');
  line(q((ya + yb) / 2, z1 - 3), q((ya + yb) / 2, z0 + 3), PAL.cremaD, 1.4 * zoom);
  line(q(ya + iy, (z0 + z1) / 2), q(yb - iy, (z0 + z1) / 2), PAL.cremaD, 1.4 * zoom);
}
function drawMastil(t) {
  if (ordEra(S.era) < 11) return; // aún no existe en esta época
  const x = 12.7, y = 7.7, hTop = 112;
  sombra(x, y + 0.1, 8, 4);
  line(P(x, y, 0), P(x, y, hTop), '#8a6f4d', 2.4 * zoom);
  dot(P(x, y, hTop), 2.2 * zoom, PAL.campana);
  const a = P(x, y, hTop - 4);
  const wav = Math.sin(t * 3.1) * 6 * zoom, wav2 = Math.sin(t * 3.1 + 1.6) * 5 * zoom;
  g.beginPath();
  g.moveTo(a.x, a.y);
  g.quadraticCurveTo(a.x + 14 * zoom, a.y + 1 * zoom + wav * .5, a.x + 30 * zoom, a.y + 4 * zoom + wav);
  g.quadraticCurveTo(a.x + 15 * zoom, a.y + 7 * zoom + wav2 * .5, a.x, a.y + 12 * zoom);
  g.closePath();
  g.fillStyle = '#6b9cc4'; g.fill();
  g.strokeStyle = PAL.crema; g.lineWidth = 1.4 * zoom; g.stroke();
}
function drawPupitre(x, y, conLibro) {
  if (ordEra(S.era) < 11) return; // aún no existe en esta época
  sombra(x + 0.16, y + 0.22, 8, 3.8);
  isoBox(x, y, 0.28, 0.34, 10, PAL.maderaD, PAL.maderaL, PAL.maderaD);
  poly([P(x - 0.03, y - 0.03, 13.5), P(x + 0.31, y - 0.03, 13.5),
        P(x + 0.31, y + 0.37, 9.5), P(x - 0.03, y + 0.37, 9.5)], '#e0b57e');
  line(P(x - 0.03, y + 0.37, 9.5), P(x + 0.31, y + 0.37, 9.5), '#8a6440', 1.1 * zoom);
  isoBox(x + 0.26, y + 0.4, 0.16, 0.2, 6, '#c79a6b', PAL.maderaL, PAL.maderaD);
  if (conLibro) {
    const c = P(x + 0.14, y + 0.17, 13.2);
    g.save(); g.translate(c.x, c.y); g.rotate(-0.16);
    g.fillStyle = '#f6f1e3';
    g.fillRect(-4.8 * zoom, -2.6 * zoom, 4.8 * zoom, 5.2 * zoom);
    g.fillRect(0, -2.6 * zoom, 4.8 * zoom, 5.2 * zoom);
    g.strokeStyle = 'rgba(90,70,40,.5)'; g.lineWidth = 0.9 * zoom;
    g.beginPath(); g.moveTo(0, -2.6 * zoom); g.lineTo(0, 2.6 * zoom); g.stroke();
    g.restore();
  }
}
function drawCol(x, y) {
  if (ordEra(S.era) < 11) return; // aún no existe en esta época
  sombra(x, y + 0.06, 5.5, 2.6);
  const p = P(x, y);
  dot({ x: p.x, y: p.y - 3 * zoom }, 5 * zoom, PAL.copaM);
  g.strokeStyle = PAL.copaD; g.lineWidth = 1.6 * zoom;
  g.beginPath(); g.arc(p.x - 3 * zoom, p.y - 3.4 * zoom, 4 * zoom, 2.2, 4.4); g.stroke();
  g.beginPath(); g.arc(p.x + 3 * zoom, p.y - 3.4 * zoom, 4 * zoom, 5.2, 7.2); g.stroke();
  dot({ x: p.x - 1.4 * zoom, y: p.y - 4.6 * zoom }, 1.6 * zoom, PAL.copaL);
}
function drawZanahoria(x, y) {
  if (ordEra(S.era) < 11) return; // aún no existe en esta época
  const p = P(x, y);
  g.strokeStyle = '#4e8a37'; g.lineWidth = 1.4 * zoom; g.lineCap = 'round';
  for (let k = -1; k <= 1; k++) {
    g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x + k * 2.6 * zoom, p.y - 5.5 * zoom); g.stroke();
  }
  dot({ x: p.x, y: p.y - 0.6 * zoom }, 1.7 * zoom, '#e07b3c');
}
function drawEspantapajaros(t) {
  if (ordEra(S.era) < 11) return; // aún no existe en esta época
  const x = 14.35, y = 8.75;
  sombra(x, y + 0.05, 8, 3.6);
  line(P(x, y, 0), P(x, y, 40), PAL.troncoD, 2.2 * zoom);
  const arm = P(x, y, 29);
  line({ x: arm.x - 13 * zoom, y: arm.y }, { x: arm.x + 13 * zoom, y: arm.y }, PAL.troncoD, 2.2 * zoom);
  poly([{ x: arm.x - 9 * zoom, y: arm.y - 3 * zoom }, { x: arm.x + 9 * zoom, y: arm.y - 3 * zoom },
        { x: arm.x + 6 * zoom, y: arm.y + 13 * zoom }, { x: arm.x - 6 * zoom, y: arm.y + 13 * zoom }], '#b06a4a');
  g.fillStyle = '#d9a53f'; g.fillRect(arm.x - 1 * zoom, arm.y + 4 * zoom, 4 * zoom, 4 * zoom);
  g.strokeStyle = '#e3c065'; g.lineWidth = 1.2 * zoom;
  for (let k = -2; k <= 2; k++) {
    g.beginPath(); g.moveTo(arm.x + k * 2.4 * zoom, arm.y + 13 * zoom);
    g.lineTo(arm.x + k * 2.9 * zoom, arm.y + 17 * zoom); g.stroke();
  }
  const hd = P(x, y, 40);
  dot(hd, 5 * zoom, '#d9b98a');
  ellipse({ x: hd.x, y: hd.y - 3.4 * zoom }, 8 * zoom, 2.6 * zoom, '#c9a352');
  g.beginPath(); g.arc(hd.x, hd.y - 4.4 * zoom, 4.4 * zoom, Math.PI, 0); g.fillStyle = '#c9a352'; g.fill();
  const b = { x: arm.x + 11 * zoom, y: arm.y - 2 * zoom + Math.sin(t * 3) * 0.8 * zoom };
  dot(b, 2.4 * zoom, '#8a6f5a'); dot({ x: b.x + 1.8 * zoom, y: b.y - 1.6 * zoom }, 1.7 * zoom, '#8a6f5a');
  g.beginPath(); g.moveTo(b.x + 3.3 * zoom, b.y - 1.7 * zoom);
  g.lineTo(b.x + 4.6 * zoom, b.y - 1.2 * zoom); g.lineTo(b.x + 3.2 * zoom, b.y - 0.8 * zoom);
  g.closePath(); g.fillStyle = '#d9a53f'; g.fill();
}
function drawCerquita(x0, y0, x1, y1) {
  if (ordEra(S.era) < 11) return; // aún no existe en esta época
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) * 2.2));
  for (let i = 0; i <= n; i++) {
    const x = lerp(x0, x1, i / n), y = lerp(y0, y1, i / n);
    line(P(x, y, 0), P(x, y, 11), PAL.troncoL, 2 * zoom);
  }
  line(P(x0, y0, 8), P(x1, y1, 8), PAL.troncoD, 1.6 * zoom);
}
function drawPozo(t) {
  if (ordEra(S.era) < 11) return; // aún no existe en esta época
  const x = 11.0, y = 12.2;
  sombra(x, y + 0.12, 18, 8);
  const c = P(x, y);
  ellipse(c, 14 * zoom, 7 * zoom, PAL.piedraD);
  ellipse({ x: c.x, y: c.y - 3 * zoom }, 14 * zoom, 7 * zoom, PAL.piedraL);
  for (let k = 0; k < 7; k++) {
    const a = 0.35 + k * 0.42;
    line({ x: c.x + Math.cos(a) * 13 * zoom, y: c.y - 3 * zoom + Math.sin(a) * 6.4 * zoom },
         { x: c.x + Math.cos(a) * 13 * zoom, y: c.y + Math.sin(a) * 6.4 * zoom }, 'rgba(74,60,44,.4)', 1.2 * zoom);
  }
  ellipse({ x: c.x, y: c.y - 3 * zoom }, 9.5 * zoom, 4.6 * zoom, PAL.aguaPozo);
  line({ x: c.x - 4 * zoom, y: c.y - 4 * zoom }, { x: c.x + 2 * zoom, y: c.y - 3 * zoom }, 'rgba(230,244,255,.5)', 1.3 * zoom);
  line(P(x - 0.42, y, 0), P(x - 0.42, y, 34), PAL.troncoL, 2.6 * zoom);
  line(P(x + 0.42, y, 0), P(x + 0.42, y, 34), PAL.troncoL, 2.6 * zoom);
  poly([P(x - 0.55, y - 0.3, 33), P(x + 0.55, y - 0.3, 33), P(x + 0.55, y, 44), P(x - 0.55, y, 44)], PAL.techoD);
  poly([P(x - 0.55, y + 0.3, 33), P(x + 0.55, y + 0.3, 33), P(x + 0.55, y, 44), P(x - 0.55, y, 44)], PAL.techoL);
  const sw = Math.sin(t * 1.4) * 3 * zoom;
  const top = P(x, y, 33);
  const bk = { x: top.x + sw, y: top.y + 16 * zoom };
  line(top, bk, '#d9c9a4', 1.2 * zoom);
  poly([{ x: bk.x - 4 * zoom, y: bk.y }, { x: bk.x + 4 * zoom, y: bk.y },
        { x: bk.x + 3 * zoom, y: bk.y + 6 * zoom }, { x: bk.x - 3 * zoom, y: bk.y + 6 * zoom }], PAL.maderaD);
  line({ x: bk.x - 4 * zoom, y: bk.y }, { x: bk.x + 4 * zoom, y: bk.y }, '#6b4a2e', 1.4 * zoom);
}
/* La copa que toca hoy: en la Época 1 la decide el año (verde tierno, verde profundo, ámbar, escarcha);
   en el resto de épocas, la paleta de siempre. Así un solo sitio viste toda la vegetación. */
function copaHoy() {
  if (!S || (S.era !== 1 && S.era !== 21) || !S.fuegoDescubierto) return { D: PAL.copaD, M: PAL.copaM, L: PAL.copaL, brote: '#a8d17e', nieve: 0 };
  const e = estacion();
  return { D: colorEstacion('copaD'), M: colorEstacion('copaM'), L: colorEstacion('copaL'),
           brote: colorEstacion('brote'), nieve: e.k > 0 ? e.nieve + (e.sig.nieve - e.nieve) * e.k : e.nieve };
}
function drawArbol(x, y, s, phase, t) {
  if (S.era === 3 || S.era === 4) return; // el desierto no tiene robles; solo palmeras junto al Nilo. El Ática tiene olivos y el plátano, dibujados aparte
  sombra(x + 0.08 * s, y + 0.1, 20 * s, 9 * s);
  const sway = Math.sin(t * 0.7 + phase) * 1.6 * zoom * s, C = copaHoy();
  poly([P(x - 0.09 * s, y, 0), P(x + 0.09 * s, y, 0), P(x + 0.05 * s, y, 34 * s), P(x - 0.05 * s, y, 34 * s)], PAL.troncoL);
  line(P(x + 0.06 * s, y, 3), P(x + 0.16 * s, y, 0), PAL.troncoL, 2.4 * zoom * s);
  const c0 = P(x, y, 40 * s), c1 = P(x, y, 58 * s), c2 = P(x, y, 74 * s);
  // en invierno la copa adelgaza: el árbol se queda en ramas con un gorro de nieve encima
  const rr = 1 - C.nieve * 0.42;
  dot({ x: c0.x, y: c0.y }, 20 * s * zoom * rr, C.D);
  dot({ x: c1.x + sway * .5, y: c1.y }, 16 * s * zoom * rr, C.M);
  dot({ x: c2.x + sway, y: c2.y }, 11 * s * zoom * rr, C.L);
  dot({ x: c2.x + sway - 5 * s * zoom, y: c2.y - 3 * s * zoom }, 3.4 * s * zoom, C.brote);
  dot({ x: c1.x + sway * .5 - 9 * s * zoom, y: c1.y - 2 * s * zoom }, 2.6 * s * zoom, C.brote);
  if (C.nieve > 0.02) { // la nieve se posa arriba, donde daría el cielo
    g.save(); g.globalAlpha = C.nieve;
    dot({ x: c2.x + sway, y: c2.y - 4 * s * zoom * rr }, 8 * s * zoom * rr, '#f4f8f7');
    dot({ x: c1.x + sway * .5 - 6 * s * zoom, y: c1.y - 5 * s * zoom * rr }, 5.5 * s * zoom * rr, '#eef4f3');
    g.restore();
  }
}
function drawArbusto(x, y, s, conBayas) {
  if (S.era === 3 || S.era === 4) return; // el desierto no tiene matorral de pradera: Egipto pone palmeras, juncos y su vega
  sombra(x, y + 0.06, 11 * s, 5 * s);
  const p = P(x, y), C = copaHoy();
  dot({ x: p.x, y: p.y - 5 * s * zoom }, 9 * s * zoom, C.M);
  dot({ x: p.x - 4 * s * zoom, y: p.y - 8 * s * zoom }, 5.5 * s * zoom, C.L);
  if (conBayas) for (let k = 0; k < 3; k++)  // las bayas maduran en verano y otoño; en invierno el matorral queda pelado
    dot({ x: p.x + (k - 1) * 4 * s * zoom, y: p.y - (4 + (k % 2) * 4) * s * zoom }, 1.4 * zoom * (1 - C.nieve), '#c94f43');
  if (C.nieve > 0.02) { g.save(); g.globalAlpha = C.nieve * 0.9; dot({ x: p.x - 2 * s * zoom, y: p.y - 8.5 * s * zoom }, 5 * s * zoom, '#f2f7f6'); g.restore(); }
}
function drawPino(x, y, s, phase, t) {
  if (S.era === 3 || S.era === 4) return; // ni pinos en el desierto (ni en el ágora)
  sombra(x + 0.05 * s, y + 0.08, 16 * s, 7.5 * s);
  const sway = Math.sin(t * 0.8 + phase) * 1.3 * zoom * s;
  // El pino es de hoja perenne: NO se dora en otoño ni se pela en invierno, y esa diferencia con el roble
  // se ve. Solo se apaga un poco con el frío y aguanta la nieve en los brazos.
  const inv = copaHoy().nieve;
  const verdeM = inv > 0.02 ? lerpHex(PAL.copaM, '#4a6350', inv) : PAL.copaM;
  const verdeL = inv > 0.02 ? lerpHex(PAL.copaL, '#6d8574', inv) : PAL.copaL;
  poly([P(x - 0.07 * s, y, 0), P(x + 0.07 * s, y, 0), P(x + 0.04 * s, y, 16 * s), P(x - 0.04 * s, y, 16 * s)], PAL.troncoD);
  const pisos = [[14, 26 * s, 0], [38, 20 * s, .4], [58, 14 * s, .8]];
  for (const [z, r, k] of pisos) {
    const c = P(x, y, z * s), dx = sway * k;
    g.beginPath();
    g.moveTo(c.x - r * zoom + dx * .3, c.y);
    g.quadraticCurveTo(c.x + dx, c.y + 4 * s * zoom, c.x + r * zoom + dx * .3, c.y);
    g.lineTo(c.x + dx, c.y - (r * 1.15) * zoom);
    g.closePath();
    g.fillStyle = verdeM; g.fill();
    g.beginPath();
    g.moveTo(c.x - r * .82 * zoom + dx * .3, c.y + 0.5 * zoom);
    g.quadraticCurveTo(c.x + dx, c.y + 4.2 * s * zoom, c.x + r * .82 * zoom + dx * .3, c.y + 0.5 * zoom);
    g.strokeStyle = verdeL; g.lineWidth = 2 * zoom * s; g.stroke();
    if (inv > 0.02) { // el manto que se acumula sobre cada brazo
      g.save(); g.globalAlpha = inv * 0.85;
      g.beginPath();
      g.moveTo(c.x - r * .7 * zoom + dx * .3, c.y - 0.8 * zoom);
      g.quadraticCurveTo(c.x + dx, c.y + 2.4 * s * zoom, c.x + r * .7 * zoom + dx * .3, c.y - 0.8 * zoom);
      g.strokeStyle = '#f1f7f6'; g.lineWidth = 2.6 * zoom * s; g.stroke();
      g.restore();
    }
  }
}
function drawRoca(x, y, s) {
  if (S.era === 3 || S.era === 4) return; // las rocas de la estepa caian en el desierto (y una, encima de la piramide chica)
  sombra(x, y + 0.05, 10 * s, 4.5 * s);
  const p = P(x, y);
  poly([{ x: p.x - 9 * s * zoom, y: p.y - 1 * zoom }, { x: p.x - 3 * s * zoom, y: p.y - 9 * s * zoom },
        { x: p.x + 4 * s * zoom, y: p.y - 8 * s * zoom }, { x: p.x + 9 * s * zoom, y: p.y - 1 * zoom }], PAL.piedraD);
  poly([{ x: p.x - 9 * s * zoom, y: p.y - 1 * zoom }, { x: p.x - 3 * s * zoom, y: p.y - 9 * s * zoom },
        { x: p.x + 0.5 * s * zoom, y: p.y - 8.5 * s * zoom }, { x: p.x - 1 * s * zoom, y: p.y - 1 * zoom }], PAL.piedraL);
  poly([{ x: p.x + 0.5 * s * zoom, y: p.y - 8.5 * s * zoom }, { x: p.x + 4 * s * zoom, y: p.y - 8 * s * zoom },
        { x: p.x + 5.5 * s * zoom, y: p.y - 3.5 * s * zoom }, { x: p.x + 1.8 * s * zoom, y: p.y - 3 * s * zoom }], '#a39d8f'); // la faceta media, entre luz y sombra
  g.strokeStyle = 'rgba(70,66,58,.55)'; g.lineWidth = 1.2 * zoom; g.lineCap = 'round';       // la grieta que la parte
  g.beginPath(); g.moveTo(p.x + 1.5 * s * zoom, p.y - 7.8 * s * zoom);
  g.lineTo(p.x + 3 * s * zoom, p.y - 4.5 * s * zoom); g.lineTo(p.x + 2.2 * s * zoom, p.y - 1.5 * zoom); g.stroke();
  ellipse({ x: p.x + 4 * s * zoom, y: p.y - 0.6 * zoom }, 4 * s * zoom, 1.8 * s * zoom, 'rgba(102,152,74,.55)');
  ellipse({ x: p.x - 8 * s * zoom, y: p.y + 0.2 * zoom }, 2.3 * zoom, 1.4 * zoom, '#9b968a'); // las lascas al pie, como las piedritas de la estepa
  ellipse({ x: p.x + 9.5 * s * zoom, y: p.y + 0.6 * zoom }, 1.9 * zoom, 1.2 * zoom, '#a8a396');
  ellipse({ x: p.x - 5.5 * s * zoom, y: p.y + 1.2 * zoom }, 1.4 * zoom, 0.9 * zoom, '#b3ae9f');
}
function drawTocon(x, y) {
  if (S.era === 3 || S.era === 4) return; // no hay tocones donde no hubo bosque
  sombra(x, y + 0.04, 7, 3.4);
  const p = P(x, y);
  g.fillStyle = PAL.troncoD;
  g.fillRect(p.x - 5.5 * zoom, p.y - 7 * zoom, 11 * zoom, 7 * zoom);
  g.fillStyle = PAL.troncoL;                                                                  // el flanco que da al sol
  g.fillRect(p.x - 5.5 * zoom, p.y - 7 * zoom, 3.6 * zoom, 7 * zoom);
  g.strokeStyle = 'rgba(64,42,24,.45)'; g.lineWidth = 0.8 * zoom; g.lineCap = 'round';        // la corteza, a vetas
  for (const vx of [-2.6, 0.4, 3.2]) {
    g.beginPath(); g.moveTo(p.x + vx * zoom, p.y - 6.4 * zoom); g.lineTo(p.x + vx * zoom, p.y - 0.6 * zoom); g.stroke();
  }
  ellipse({ x: p.x, y: p.y }, 5.5 * zoom, 2.6 * zoom, PAL.troncoD);
  ellipse({ x: p.x, y: p.y - 7 * zoom }, 5.5 * zoom, 2.6 * zoom, '#d9b98a');
  g.strokeStyle = 'rgba(122,86,54,.6)'; g.lineWidth = 1 * zoom;
  g.beginPath(); g.ellipse(p.x, p.y - 7 * zoom, 3.2 * zoom, 1.5 * zoom, 0, 0, 7); g.stroke();
  g.beginPath(); g.moveTo(p.x - 4.5 * zoom, p.y - 7.6 * zoom); g.lineTo(p.x - 1 * zoom, p.y - 6.6 * zoom); g.stroke(); // la grieta del corte
  const C = copaHoy();                                                                        // el retoño: el bosque no se rinde (y se viste del año)
  line({ x: p.x + 4.5 * zoom, y: p.y - 6.2 * zoom }, { x: p.x + 6 * zoom, y: p.y - 10 * zoom }, PAL.florTallo, 0.9 * zoom);
  dot({ x: p.x + 6 * zoom, y: p.y - 10.4 * zoom }, 1.8 * zoom, C.M);
  dot({ x: p.x + 5.2 * zoom, y: p.y - 11.2 * zoom }, 1.1 * zoom, C.L);
}
function drawCerca(x0, y0, x1, y1) {
  if (ordEra(S.era) < 11 && !(S.era === 1 && S.edad >= 2)) return; // el cerco: era moderna o corral neolítico
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) * 1.6));
  for (let i = 0; i <= n; i++) {
    const x = lerp(x0, x1, i / n), y = lerp(y0, y1, i / n);
    sombra(x, y + 0.03, 3.5, 1.8);
    line(P(x, y, 0), P(x, y, 18), PAL.maderaL, 3 * zoom);
    dot(P(x, y, 18), 1.6 * zoom, PAL.maderaD);
  }
  line(P(x0, y0, 13), P(x1, y1, 13), PAL.maderaD, 2 * zoom);
  line(P(x0, y0, 6), P(x1, y1, 6), PAL.maderaD, 2 * zoom);
}
function drawLetrero() {
  if (ordEra(S.era) < 11) return; // aún no existe en esta época
  const x = 5.5, y = 15.3;
  sombra(x, y + 0.05, 8, 3.6);
  line(P(x, y, 0), P(x, y, 40), PAL.troncoL, 2.8 * zoom);
  const arm = P(x, y, 38);
  line(arm, { x: arm.x - 22 * zoom, y: arm.y }, PAL.troncoL, 2.4 * zoom);
  const bx = arm.x - 12 * zoom, by = arm.y + 10 * zoom;
  line({ x: bx - 7 * zoom, y: by - 5 * zoom }, { x: bx - 7 * zoom, y: arm.y }, '#d9c9a4', 1.1 * zoom);
  line({ x: bx + 7 * zoom, y: by - 5 * zoom }, { x: bx + 7 * zoom, y: arm.y }, '#d9c9a4', 1.1 * zoom);
  g.fillStyle = PAL.maderaL;
  g.fillRect(bx - 16 * zoom, by - 5 * zoom, 32 * zoom, 11 * zoom);
  g.strokeStyle = PAL.maderaD; g.lineWidth = 1.4 * zoom;
  g.strokeRect(bx - 16 * zoom, by - 5 * zoom, 32 * zoom, 11 * zoom);
  g.fillStyle = '#4a3a26'; g.font = `700 ${6.5 * zoom}px Georgia, serif`; g.textAlign = 'center';
  g.fillText('AULA', bx, by + 2.6 * zoom);
}

/* ============================================================
   ESTADOS VISUALES DE LOS APARATOS
   ============================================================ */
function drawTelarana(p, s = 1) { // telaraña de esquina: el aparato junta polvo
  g.strokeStyle = 'rgba(225,225,215,.6)'; g.lineWidth = 0.9 * zoom;
  for (let k = 0; k < 3; k++) {
    g.beginPath();
    g.arc(p.x, p.y, (4 + k * 4) * s * zoom, -0.1, Math.PI * 0.6);
    g.stroke();
  }
  for (const a of [0.05, 0.45, 0.85, 1.25, 1.65]) {
    g.beginPath(); g.moveTo(p.x, p.y);
    g.lineTo(p.x + Math.cos(a) * 12.5 * s * zoom, p.y + Math.sin(a) * 12.5 * s * zoom);
    g.stroke();
  }
}
function drawChispas(p, t) { // estrellitas doradas de la novedad
  for (let k = 0; k < 3; k++) {
    const a = t * 1.6 + k * 2.1;
    const cx = p.x + Math.cos(a) * 15 * zoom, cy = p.y + Math.sin(a * 1.3) * 9 * zoom - 6 * zoom;
    const s = (0.7 + Math.abs(Math.sin(t * 3 + k * 1.7)) * 0.9) * zoom;
    g.strokeStyle = 'rgba(240,200,90,.9)'; g.lineWidth = 1.3 * zoom;
    line({ x: cx - 3.4 * s, y: cy }, { x: cx + 3.4 * s, y: cy }, 'rgba(240,200,90,.9)', 1.3 * zoom);
    line({ x: cx, y: cy - 3.4 * s }, { x: cx, y: cy + 3.4 * s }, 'rgba(240,200,90,.9)', 1.3 * zoom);
    dot({ x: cx, y: cy }, 1.2 * s, '#f6e2a4');
  }
}
function drawBarraFormacion(p, prog) { // barra sobre el aparato mientras se forma al claustro
  const w = 46 * zoom, h = 7 * zoom, x = p.x - w / 2, y = p.y;
  g.fillStyle = 'rgba(40,30,18,.75)';
  g.beginPath(); g.roundRect(x - 1.5 * zoom, y - 1.5 * zoom, w + 3 * zoom, h + 3 * zoom, 4 * zoom); g.fill();
  g.fillStyle = '#e2a73c';                          // dorado: algo avanza (el rojo se leía como peligro; lista de cotejo D4)
  g.beginPath(); g.roundRect(x, y, w * Math.max(0.03, prog), h, 3 * zoom); g.fill();
  g.fillStyle = '#f6eed8'; g.font = `700 ${8 * zoom}px -apple-system, sans-serif`; g.textAlign = 'center';
  g.fillText(S.era === 1 ? '🔥' : S.era === 2 ? '🏺' : S.era === 3 ? '🪷' : S.era === 4 ? '🏛️' : '📚', x - 8 * zoom, y + h - 0.5 * zoom);
}
function estadoTec(i, anchorTop, t) { // overlay común según la fase del aparato i
  const f = S.tecs[i];
  if (f.fase === 'novedad') drawChispas(anchorTop, t);
  else if (f.fase === 'valle') drawTelarana({ x: anchorTop.x + 10 * zoom, y: anchorTop.y - 2 * zoom });
  else if (f.fase === 'formando') drawBarraFormacion({ x: anchorTop.x, y: anchorTop.y - 14 * zoom }, 1 - f.t / BALANCE.tecnologias[i].formDur);
  if (f.prof > 0) drawBarraFormacion({ x: anchorTop.x, y: anchorTop.y - 14 * zoom }, 1 - f.prof / Math.round(BALANCE.tecnologias[i].formDur * 0.7));
}

/* --- Aparato 0: pizarra de caballete (patio de clases) --- */
function drawPizarraTec(t) {
  const p = P(4.4, 7.8);
  sombra(4.4, 7.95, 16, 6);
  const bw = 30 * zoom, bh = 22 * zoom, top = -46 * zoom;
  line({ x: p.x - bw * .55, y: p.y }, { x: p.x - bw * .2, y: p.y + top + 4 * zoom }, PAL.troncoL, 2.6 * zoom);
  line({ x: p.x + bw * .55, y: p.y }, { x: p.x + bw * .2, y: p.y + top + 4 * zoom }, PAL.troncoL, 2.6 * zoom);
  line({ x: p.x - bw * .1, y: p.y + 2 * zoom }, { x: p.x + bw * .05, y: p.y + top + 6 * zoom }, PAL.troncoD, 2.2 * zoom);
  g.fillStyle = PAL.maderaL;
  g.fillRect(p.x - bw - 3 * zoom, p.y + top - 3 * zoom, bw * 2 + 6 * zoom, bh * 2 + 6 * zoom);
  g.fillStyle = PAL.pizarra;
  g.fillRect(p.x - bw, p.y + top, bw * 2, bh * 2);
  if (S.tecs[0].fase === 'meseta' || S.tecs[0].fase === 'novedad') {
    g.fillStyle = PAL.tiza; g.textAlign = 'center';
    g.font = `${10 * zoom}px "Comic Sans MS", Georgia, serif`;
    g.fillText('a  b  c', p.x, p.y + top + 15 * zoom);
    g.fillText('2 + 2 = 4', p.x, p.y + top + 32 * zoom);
  }
  g.fillStyle = PAL.maderaD;
  g.fillRect(p.x - bw - 3 * zoom, p.y + top + bh * 2 + 3 * zoom, bw * 2 + 6 * zoom, 3.4 * zoom);
  g.fillStyle = '#f5f0e0'; g.fillRect(p.x - 12 * zoom, p.y + top + bh * 2 + 0.6 * zoom, 6 * zoom, 2.2 * zoom);
  g.fillStyle = '#8a5a45'; g.fillRect(p.x + 6 * zoom, p.y + top + bh * 2 - 0.4 * zoom, 9 * zoom, 3.4 * zoom);
  estadoTec(0, { x: p.x, y: p.y + top - 6 * zoom }, t);
}

/* --- La sábana de proyección (la comparten linterna y filminas) --- */
const PANT = { x: 3.5, y: 5.0 };
function pantallaActiva(i) { const f = S.tecs[i].fase; return f === 'meseta' || f === 'novedad'; }
function drawPantalla(t) {
  const { x: sx, y: sy } = PANT;
  sombra(sx, sy + 0.05, 14, 4);
  line(P(sx - 0.45, sy, 0), P(sx - 0.45, sy, 42), PAL.troncoL, 2.2 * zoom);
  line(P(sx + 0.45, sy, 0), P(sx + 0.45, sy, 42), PAL.troncoL, 2.2 * zoom);
  const s0 = P(sx - 0.45, sy, 38), s1 = P(sx + 0.45, sy, 38);
  const activa = pantallaActiva(1) || (S.tecs[5] && pantallaActiva(5));
  const ondaS = activa ? Math.sin(t * 1.8) * 1.5 * zoom : 0;
  g.beginPath();
  g.moveTo(s0.x, s0.y); g.lineTo(s1.x, s1.y);
  g.lineTo(s1.x, s1.y + 26 * zoom + ondaS);
  g.quadraticCurveTo((s0.x + s1.x) / 2, s1.y + 32 * zoom - ondaS, s0.x, s0.y + 26 * zoom + ondaS);
  g.closePath(); g.fillStyle = '#f4efe0'; g.fill();
  g.strokeStyle = '#d8c9a4'; g.lineWidth = 1 * zoom; g.stroke();
}
function esquinasPantalla() {
  const s0 = P(PANT.x - 0.45, PANT.y, 38), s1 = P(PANT.x + 0.45, PANT.y, 38);
  return { s0, s1, mx: (s0.x + s1.x) / 2 };
}

/* --- Aparato 1: linterna mágica (proyecta montañas en la mitad izquierda) --- */
function drawLinterna(t) {
  const x = 4.4, y = 5.6;
  const { s0, mx } = esquinasPantalla();
  const activa = pantallaActiva(1);
  sombra(x + 0.2, y + 0.25, 10, 4.5);
  isoBox(x, y, 0.5, 0.42, 14, PAL.maderaL, PAL.maderaL, PAL.maderaD);
  isoBox(x + 0.13, y + 0.1, 0.26, 0.22, 11, PAL.campana, PAL.campana, PAL.campanaD, 14);
  const lente = P(x + 0.1, y + 0.21, 19.5);
  dot(lente, 2.6 * zoom, '#3a2c1c'); dot(lente, 1.5 * zoom, '#7c93a8');
  line(P(x + 0.26, y + 0.21, 25), P(x + 0.26, y + 0.21, 29), '#6e5138', 2.2 * zoom); // chimenea de la lámpara
  if (activa) {
    g.save(); g.globalAlpha = .13 + Math.sin(t * 7) * .02;
    poly([lente, { x: s0.x, y: s0.y + 2 * zoom }, { x: s0.x, y: s0.y + 26 * zoom }], '#f6e2a4');
    g.restore();
    const my = s0.y + 14 * zoom, cx = mx - 8 * zoom; // montañas y luna, mitad izquierda
    g.save(); g.globalAlpha = .55; g.fillStyle = '#5f7488';
    g.beginPath();
    g.moveTo(cx - 10 * zoom, my + 8 * zoom); g.lineTo(cx - 3 * zoom, my - 4 * zoom);
    g.lineTo(cx + 3 * zoom, my + 8 * zoom); g.closePath(); g.fill();
    g.beginPath();
    g.moveTo(cx + 1 * zoom, my + 8 * zoom); g.lineTo(cx + 8 * zoom, my - 1 * zoom);
    g.lineTo(cx + 14 * zoom, my + 8 * zoom); g.closePath(); g.fill();
    dot({ x: cx + 9 * zoom, y: my - 7 * zoom }, 2.6 * zoom, '#c98f2e');
    g.restore();
  }
  estadoTec(1, P(x + 0.25, y + 0.2, 40), t);
}

/* --- Aparato 5: proyector de filminas (proyecta cuadros en la mitad derecha) --- */
function drawFilminas(t) {
  const x = 5.2, y = 6.0;
  const { s1, mx } = esquinasPantalla();
  const activa = pantallaActiva(5);
  sombra(x, y + 0.12, 8, 3.6);
  // trípode
  const base = P(x, y);
  line(base, P(x - 0.14, y + 0.12, 0), '#4a3a26', 1.8 * zoom);
  line(P(x, y, 16), { x: base.x - 5 * zoom, y: base.y + 1 * zoom }, '#4a3a26', 1.8 * zoom);
  line(P(x, y, 16), { x: base.x + 5 * zoom, y: base.y + 1.5 * zoom }, '#4a3a26', 1.8 * zoom);
  line(P(x, y, 16), { x: base.x, y: base.y + 2 * zoom }, '#4a3a26', 1.8 * zoom);
  // cuerpo del proyector con su carrete de filmina encima
  isoBox(x - 0.13, y - 0.11, 0.26, 0.22, 9, '#5f7488', '#6e8296', '#4f6377', 16);
  dot(P(x, y - 0.06, 28), 3 * zoom, '#3a2c1c'); dot(P(x, y - 0.06, 28), 1.8 * zoom, '#8fa3b5'); // carrete
  const lente = P(x - 0.12, y + 0.05, 20);
  dot(lente, 2.2 * zoom, '#3a2c1c'); dot(lente, 1.2 * zoom, '#9db4c6');
  if (activa) {
    g.save(); g.globalAlpha = .12 + Math.sin(t * 9) * .02;
    poly([lente, { x: mx + 2 * zoom, y: s1.y + 2 * zoom }, { x: mx + 2 * zoom, y: s1.y + 26 * zoom }], '#dce8f2');
    g.restore();
    const fx0 = mx + 6 * zoom, fy = s1.y + 5 * zoom; // tira de cuadros, mitad derecha
    g.save(); g.globalAlpha = .6;
    for (let k = 0; k < 3; k++) {
      g.fillStyle = '#dce8f2';
      g.fillRect(fx0, fy + k * 8 * zoom, 9 * zoom, 6 * zoom);
      g.fillStyle = '#5f7488';
      g.fillRect(fx0 + 2 * zoom, fy + k * 8 * zoom + 1.5 * zoom, 5 * zoom, 3 * zoom);
    }
    g.restore();
  }
  estadoTec(5, P(x, y, 34), t);
}

/* --- Aparato 4: radio educativa junto al patio de clases --- */
function drawRadio(t) {
  const x = 6.9, y = 12.1, fase = S.tecs[4].fase;
  sombra(x + 0.2, y + 0.25, 10, 4.5);
  isoBox(x, y, 0.5, 0.42, 13, PAL.maderaL, PAL.maderaL, PAL.maderaD);
  // radio capilla: caja de madera con tope redondeado, dial y rejilla
  const c = P(x + 0.25, y + 0.35, 13);
  const w = 11 * zoom, h = 14 * zoom;
  g.fillStyle = '#8a5a45';
  g.beginPath();
  g.moveTo(c.x - w, c.y);
  g.lineTo(c.x - w, c.y - h * .55);
  g.quadraticCurveTo(c.x, c.y - h * 1.45, c.x + w, c.y - h * .55);
  g.lineTo(c.x + w, c.y); g.closePath(); g.fill();
  g.strokeStyle = '#6e4433'; g.lineWidth = 1.2 * zoom; g.stroke();
  g.strokeStyle = '#d9b98a';
  for (let k = -1; k <= 1; k++) { // rejilla de tela
    g.beginPath(); g.moveTo(c.x + k * 3 * zoom, c.y - 3 * zoom);
    g.lineTo(c.x + k * 4 * zoom, c.y - h * .85); g.stroke();
  }
  dot({ x: c.x - w * .55, y: c.y - 4 * zoom }, 1.7 * zoom, '#d9a53f'); // dial
  dot({ x: c.x + w * .55, y: c.y - 4 * zoom }, 1.3 * zoom, '#4a3a26'); // perilla
  if (fase === 'meseta' || fase === 'novedad') { // ondas al aire
    g.strokeStyle = 'rgba(240,226,164,.7)'; g.lineWidth = 1.3 * zoom;
    for (let k = 0; k < 2; k++) {
      const a = ((t * 0.7 + k * 0.5) % 1);
      g.save(); g.globalAlpha = (1 - a) * .7;
      g.beginPath();
      g.arc(c.x, c.y - h, (5 + a * 14) * zoom, -Math.PI * .85, -Math.PI * .15);
      g.stroke(); g.restore();
    }
  }
  estadoTec(4, P(x + 0.25, y + 0.2, 34), t);
}

/* --- Aparato 6: cine de 16 mm con pantalla grande y público --- */
function drawSentadito(x, y, variant, t, oficio) {
  const k = P(x, y), s = zoom, nod = Math.sin(t * 1.4 + variant * 1.7) * 1.8 * s;
  const risa = Math.max(0, Math.sin(t * 0.9 + variant * 2.6) - 0.94) * 34 * s; // saltito de risa ocasional
  ellipse({ x: k.x, y: k.y + 2 * s }, 6.5 * s, 2.8 * s, sombraHoy);
  g.save(); g.translate(k.x, k.y - risa);
  const piel = S.era === 3 ? '#cf9668' : PAL.piel; // la piel cobriza del valle (cuarta tanda)
  g.fillStyle = S.era === 1 || S.era === 3 ? piel : S.era === 2 ? '#e8dcc8' : PAL.delantal;
  g.beginPath(); g.moveTo(-5 * s, 2 * s);
  g.quadraticCurveTo(-4.6 * s, -8.5 * s, 0, -9.5 * s);
  g.quadraticCurveTo(4.6 * s, -8.5 * s, 5 * s, 2 * s); g.closePath(); g.fill();
  if (ordEra(S.era) < 11) { // sobre las piernas: manta de piel en el clan, faldellín de lino en el Nilo
    g.fillStyle = S.era === 3 ? '#f2ead2' : '#8a6247';
    g.beginPath(); g.moveTo(-4.8 * s, 2 * s);
    g.quadraticCurveTo(0, -4.5 * s, 4.8 * s, 2 * s); g.closePath(); g.fill();
  }
  if (oficio) { // EL BRAZO QUE TRABAJA: el artesano actúa su oficio, cada cual con su ritmo, hacia su taller (lado ±1)
    const lado = oficio.lado || 1, swing = Math.sin(t * (oficio.ritmo || 2) + (oficio.ph || 0));
    const ax = lado * (4.6 + swing * 2.0) * s, ay = -5.2 * s + Math.abs(swing) * 2.6 * s;
    g.strokeStyle = S.era === 2 ? '#e8dcc8' : piel; g.lineCap = 'round'; g.lineWidth = 2.2 * s; // manga o brazo
    g.beginPath(); g.moveTo(lado * 3.4 * s, -7 * s); g.lineTo(ax, ay); g.stroke();
    dot({ x: ax, y: ay }, 1.3 * s, piel);                                        // la mano, siempre de piel
  }
  dot({ x: 0, y: -13.5 * s + nod }, 5.2 * s, piel);
  { const ladoO = oficio && oficio.lado ? oficio.lado : 1, apS = apertura(variant * 2.7 + 0.4); // los ojos, hacia donde trabaja (2026-09-06: los sentaditos no tenían cara)
    ojo(ladoO * 2.0 * s, -13.9 * s + nod, 0.8 * s, apS); ojo(ladoO * 4.1 * s, -13.9 * s + nod, 0.8 * s, apS); }
  if (S.era === 3) { // en el Nilo: peluca negra de corte recto, o rapado contra el sol
    if (variant % 2) {
      g.beginPath(); g.arc(0, -14.8 * s + nod, 5.1 * s, Math.PI * .92, Math.PI * 2.08); g.fillStyle = '#1c1a18'; g.fill();
      g.fillRect(-5.1 * s, -14.8 * s + nod, 10.2 * s, 2 * s);
    }
  } else if (variant % 2) {
    g.beginPath(); g.arc(0, -14.8 * s + nod, 5.1 * s, Math.PI * .95, Math.PI * 2.05); g.fillStyle = '#4a3220'; g.fill();
    dot({ x: -5 * s, y: -16 * s + nod }, 2 * s, '#4a3220'); dot({ x: 5 * s, y: -16 * s + nod }, 2 * s, '#4a3220');
  } else {
    g.beginPath(); g.arc(0, -15 * s + nod, 5.2 * s, Math.PI, 0); g.fillStyle = '#8a5a45'; g.fill();
  }
  g.restore();
}
function drawCine(t) {
  const fase = S.tecs[6].fase, activa = fase === 'meseta' || fase === 'novedad';
  const sx = 15.3, sy = 7.5; // pantalla grande del cine
  sombra(sx, sy + 0.06, 18, 5);
  line(P(sx - 0.55, sy, 0), P(sx - 0.55, sy, 52), PAL.troncoL, 2.4 * zoom);
  line(P(sx + 0.55, sy, 0), P(sx + 0.55, sy, 52), PAL.troncoL, 2.4 * zoom);
  const s0 = P(sx - 0.55, sy, 48), s1 = P(sx + 0.55, sy, 48);
  g.fillStyle = '#f4efe0';
  g.fillRect(s0.x, s0.y, s1.x - s0.x, 32 * zoom);
  g.strokeStyle = '#d8c9a4'; g.lineWidth = 1.2 * zoom;
  g.strokeRect(s0.x, s0.y, s1.x - s0.x, 32 * zoom);
  if (activa) { // la película: el vagabundo, los intertítulos y la bobina
    const fase01 = (t * 0.22) % 1;
    g.save();
    g.globalAlpha = .5 + Math.sin(t * 13) * .08;
    g.fillStyle = '#c9d4dc';
    g.fillRect(s0.x + 2 * zoom, s0.y + 2 * zoom, s1.x - s0.x - 4 * zoom, 28 * zoom);
    g.globalAlpha = .7; g.fillStyle = '#3a4a56';
    const mx = (s0.x + s1.x) / 2;
    if (fase01 < 0.55) { // el vagabundo camina, bastón en mano
      const px = s0.x + 8 * zoom + (fase01 / 0.55) * (s1.x - s0.x - 18 * zoom);
      const paso = Math.sin(t * 11);
      g.fillRect(px - 2.6 * zoom, s0.y + 5.2 * zoom, 5.2 * zoom, 1.1 * zoom);   // ala del sombrero
      g.fillRect(px - 1.6 * zoom, s0.y + 3.2 * zoom, 3.2 * zoom, 2.2 * zoom);   // copa
      dot({ x: px, y: s0.y + 8.4 * zoom }, 2.4 * zoom, '#3a4a56');              // cabeza
      g.fillRect(px - 1.9 * zoom, s0.y + 10 * zoom, 3.8 * zoom, 8.6 * zoom);    // cuerpo
      line({ x: px - 0.6 * zoom, y: s0.y + 18.4 * zoom }, { x: px - 0.6 * zoom + paso * 3.4 * zoom, y: s0.y + 25.5 * zoom }, '#3a4a56', 1.5 * zoom);
      line({ x: px + 0.6 * zoom, y: s0.y + 18.4 * zoom }, { x: px + 0.6 * zoom - paso * 3.4 * zoom, y: s0.y + 25.5 * zoom }, '#3a4a56', 1.5 * zoom);
      line({ x: px + 2.2 * zoom, y: s0.y + 13 * zoom }, { x: px + 4.6 * zoom + paso * 1.2 * zoom, y: s0.y + 19.5 * zoom }, '#3a4a56', 1.3 * zoom); // bastón
    } else if (fase01 < 0.82) { // intertítulo
      g.fillRect(mx - 14 * zoom, s0.y + 9 * zoom, 28 * zoom, 2.2 * zoom);
      g.fillRect(mx - 10 * zoom, s0.y + 14 * zoom, 20 * zoom, 2.2 * zoom);
      g.fillRect(mx - 12 * zoom, s0.y + 19 * zoom, 24 * zoom, 2.2 * zoom);
    } else { // la bobina: cuenta regresiva girando
      const cyc = { x: mx, y: s0.y + 15 * zoom };
      g.strokeStyle = '#3a4a56'; g.lineWidth = 1.6 * zoom; g.lineCap = 'round';
      g.beginPath(); g.arc(cyc.x, cyc.y, 9 * zoom, 0, 7); g.stroke();
      g.beginPath(); g.moveTo(cyc.x, cyc.y);
      g.lineTo(cyc.x + Math.cos(t * 5) * 9 * zoom, cyc.y + Math.sin(t * 5) * 9 * zoom); g.stroke();
      g.beginPath(); g.moveTo(cyc.x, cyc.y); g.lineTo(cyc.x, cyc.y - 9 * zoom); g.stroke();
    }
    g.restore();
  }
  // el proyector: trípode alto con dos carretes
  const x = 16.2, y = 8.5;
  sombra(x, y + 0.1, 8, 3.6);
  const base = P(x, y);
  line(P(x, y, 20), { x: base.x - 6 * zoom, y: base.y + 1 * zoom }, '#4a3a26', 1.9 * zoom);
  line(P(x, y, 20), { x: base.x + 6 * zoom, y: base.y + 1.5 * zoom }, '#4a3a26', 1.9 * zoom);
  line(P(x, y, 20), { x: base.x, y: base.y + 2.4 * zoom }, '#4a3a26', 1.9 * zoom);
  isoBox(x - 0.15, y - 0.13, 0.3, 0.26, 10, '#4f6377', '#5f7488', '#3f5060', 20);
  const r1 = P(x - 0.05, y - 0.1, 36), r2 = P(x + 0.13, y - 0.02, 33);
  for (const [rp, rr] of [[r1, 4.6], [r2, 3.8]]) { // carretes girando
    dot(rp, rr * zoom, '#3a2c1c');
    dot(rp, rr * .45 * zoom, '#8fa3b5');
    if (activa) {
      const a = t * 3;
      line(rp, { x: rp.x + Math.cos(a) * rr * .8 * zoom, y: rp.y + Math.sin(a) * rr * .8 * zoom }, '#8fa3b5', 1 * zoom);
    }
  }
  const lente = P(x - 0.16, y + 0.02, 24);
  dot(lente, 2.4 * zoom, '#3a2c1c'); dot(lente, 1.4 * zoom, '#9db4c6');
  if (activa) {
    g.save(); g.globalAlpha = .11 + Math.sin(t * 11) * .025;
    poly([lente, { x: s1.x, y: s0.y + 2 * zoom }, { x: s0.x, y: s0.y + 2 * zoom },
          { x: s0.x, y: s0.y + 30 * zoom }], '#e8f0f6');
    g.restore();
  }
  if (fase === 'meseta') { // el público de la función
    drawSentadito(15.1, 8.75, 0, t);
    drawSentadito(15.65, 9.0, 1, t);
  }
  estadoTec(6, P(x, y, 42), t);
}

/* --- Era 3: el ala nueva --- */
function drawAulaAnexa(t) {
  const x0 = 17.9, y0 = 3.3, w = 1.7, d = 1.7, h = 46;
  sombra(x0 + w / 2 + 0.3, y0 + d / 2 + 0.4, 62, 28);
  isoBox(x0, y0, w, d, h, '#d8cfc0', '#b7736a', '#96564e');            // muros de ladrillo
  for (let z = 8; z < h; z += 9) {                                     // hiladas
    line(P(x0, y0 + d, z), P(x0 + w, y0 + d, z), 'rgba(240,230,220,.25)', 1 * zoom);
    line(P(x0 + w, y0, z), P(x0 + w, y0 + d, z), 'rgba(240,230,220,.2)', 1 * zoom);
  }
  isoBox(x0 - 0.08, y0 - 0.08, w + 0.16, d + 0.16, 6, '#e8e2d4', '#d8d2c4', '#c2bcae', h); // losa moderna
  const q = (x, z) => P(x, y0 + d, z);
  poly([q(x0 + 0.15, 36), q(x0 + 0.85, 36), q(x0 + 0.85, 14), q(x0 + 0.15, 14)], '#e8e2d4'); // ventanal
  poly([q(x0 + 0.19, 33), q(x0 + 0.81, 33), q(x0 + 0.81, 17), q(x0 + 0.19, 17)], '#7c93a8');
  line(q(x0 + 0.5, 33), q(x0 + 0.5, 17), '#e8e2d4', 1.2 * zoom);
  poly([q(x0 + 1.15, 30), q(x0 + 1.5, 30), q(x0 + 1.5, 0), q(x0 + 1.15, 0)], '#5e4128');    // puerta
  const am = P(x0 + 0.4, y0 + 0.4, h + 24);                            // antena de TV en la losa
  line(P(x0 + 0.4, y0 + 0.4, h + 6), am, '#4a3a26', 1.6 * zoom);
  line({ x: am.x - 8 * zoom, y: am.y + 2 * zoom }, { x: am.x + 8 * zoom, y: am.y - 2 * zoom }, '#4a3a26', 1.3 * zoom);
  line({ x: am.x - 6 * zoom, y: am.y + 6 * zoom }, { x: am.x + 6 * zoom, y: am.y + 3 * zoom }, '#4a3a26', 1.3 * zoom);
}
function drawTV(t) {
  const x = 17.3, y = 6.1, fase = S.tecs[7].fase, activa = fase === 'meseta' || fase === 'novedad';
  sombra(x + 0.2, y + 0.22, 10, 4.5);
  isoBox(x, y, 0.5, 0.4, 12, PAL.maderaL, PAL.maderaL, PAL.maderaD);                        // mueble
  isoBox(x + 0.05, y + 0.05, 0.4, 0.3, 15, '#8a6f5a', '#9c8270', '#75604e', 12);            // caja
  const sc = P(x + 0.25, y + 0.37, 19.5);
  g.save(); g.translate(sc.x, sc.y);
  g.fillStyle = activa ? '#cfe0e8' : '#26333a';
  g.beginPath(); g.ellipse(0, 0, 6.5 * zoom, 5 * zoom, 0, 0, 7); g.fill();                  // pantalla curva
  g.clip();
  if (activa) { // el teleprofesor habla; a veces la señal parpadea
    g.globalAlpha = .9; g.fillStyle = '#5f7488';
    dot({ x: 0, y: -1.4 * zoom }, 2.1 * zoom, '#5f7488');                                   // cabeza
    g.fillRect(-2.8 * zoom, 0.6 * zoom, 5.6 * zoom, 2.8 * zoom);                            // hombros
    g.fillStyle = '#cfe0e8';
    g.fillRect(-0.7 * zoom, -0.9 * zoom, 1.4 * zoom, 0.5 * zoom + Math.abs(Math.sin(t * 6.5)) * 1.1 * zoom); // la boca, hablando
    g.globalAlpha = .35 + Math.sin(t * 17) * .1;
    g.fillStyle = '#8fb4cc';
    g.fillRect(-5.2 * zoom, -1 * zoom + Math.sin(t * 2.3) * 2.6 * zoom, 10.4 * zoom, 1.1 * zoom); // barrido
    if (Math.sin(t * 0.47) > 0.965) {                                                       // ráfaga de estática
      g.globalAlpha = .55;
      for (let i = 0; i < 4; i++) {
        g.fillStyle = i % 2 ? '#e8eef2' : '#7c93a8';
        g.fillRect(-5.2 * zoom, (-4 + i * 2.2 + Math.random()) * zoom, 10.4 * zoom, 1 * zoom);
      }
    }
  }
  g.restore();
  const tp = P(x + 0.25, y + 0.2, 27);                                                      // orejas de conejo
  line(tp, { x: tp.x - 6 * zoom, y: tp.y - 9 * zoom }, '#4a3a26', 1.2 * zoom);
  line(tp, { x: tp.x + 6 * zoom, y: tp.y - 9 * zoom }, '#4a3a26', 1.2 * zoom);
  if (fase === 'meseta') { drawSentadito(17.15, 6.95, 0, t); drawSentadito(17.72, 7.12, 1, t); }
  estadoTec(7, P(x + 0.25, y + 0.2, 36), t);
}
function drawMaquina(t) {
  const x = 19.0, y = 6.9, fase = S.tecs[8].fase;
  sombra(x + 0.15, y + 0.2, 8, 4);
  isoBox(x, y, 0.42, 0.36, 11, PAL.maderaD, PAL.maderaL, PAL.maderaD);                      // pupitre
  isoBox(x + 0.06, y + 0.05, 0.3, 0.24, 9, '#9aa4ac', '#aab4bc', '#7e888f', 11);            // caja metálica
  const vent = P(x + 0.21, y + 0.32, 16.5);
  g.fillStyle = '#f4efe0'; g.fillRect(vent.x - 4 * zoom, vent.y - 3 * zoom, 8 * zoom, 4.5 * zoom); // ventanita
  const rollo = fase === 'meseta' ? ((t * 2.2) % 3) : 0.4; // el papel avanza pregunta a pregunta
  g.fillStyle = '#4a3a26';
  g.fillRect(vent.x - 3 * zoom, vent.y - 2.6 * zoom + rollo * zoom, (2.6 + (rollo > 1.5 ? 1.6 : 0)) * zoom, 0.9 * zoom);
  const pal = P(x + 0.42, y + 0.15, 15);
  line(pal, { x: pal.x + 4 * zoom, y: pal.y - (3 + (fase === 'meseta' ? Math.sin(t * 4) * 1.5 : 0)) * zoom }, '#4a3a26', 1.6 * zoom); // palanca
  dot({ x: pal.x + 4 * zoom, y: pal.y - 3 * zoom }, 1.4 * zoom, '#c94f43');
  if (fase === 'meseta') {
    drawSentadito(19.15, 7.6, 0, t);
    const hombro = P(19.12, 7.52), tirar = Math.sin(t * 4) * 1.5 * zoom;
    line({ x: hombro.x + 2 * zoom, y: hombro.y - 9 * zoom }, { x: pal.x + 4 * zoom, y: pal.y - 3 * zoom - tirar }, PAL.delantal, 2 * zoom); // el brazo en la palanca
  }
  estadoTec(8, P(x + 0.2, y + 0.15, 30), t);
}
function drawRetro(t) {
  const x = 18.45, y = 6.15, fase = S.tecs[9].fase, activa = fase === 'meseta' || fase === 'novedad';
  sombra(x + 0.15, y + 0.2, 9, 4);
  isoBox(x, y, 0.44, 0.38, 12, PAL.maderaL, PAL.maderaL, PAL.maderaD);                      // mesa
  isoBox(x + 0.08, y + 0.07, 0.28, 0.24, 7, '#b9b3a4', '#c5bfb0', '#9b9586', 12);           // cuerpo
  const cab = P(x + 0.22, y + 0.19, 31);
  line(P(x + 0.22, y + 0.19, 19), cab, '#5a564c', 1.8 * zoom);                              // brazo
  poly([{ x: cab.x - 3.5 * zoom, y: cab.y - 2 * zoom }, { x: cab.x + 3.5 * zoom, y: cab.y - 3.5 * zoom },
        { x: cab.x + 3.5 * zoom, y: cab.y + 0.5 * zoom }, { x: cab.x - 3.5 * zoom, y: cab.y + 1 * zoom }], '#7e888f'); // cabezal
  if (activa) { // proyecta sobre el muro del aula anexa
    const w0 = P(18.05, 5.02, 34), w1 = P(18.9, 5.02, 34), w2 = P(18.9, 5.02, 16), w3 = P(18.05, 5.02, 16);
    g.save(); g.globalAlpha = .8;
    poly([w0, w1, w2, w3], '#f6f2e2');
    g.globalAlpha = .6;
    line(P(18.15, 5.02, 30), P(18.75, 5.02, 28), '#5f7488', 1.4 * zoom);                    // renglones de la transparencia
    line(P(18.15, 5.02, 25), P(18.8, 5.02, 23), '#5f7488', 1.4 * zoom);
    g.restore();
    g.save(); g.globalAlpha = .1 + Math.sin(t * 9) * .02;
    poly([cab, { x: w0.x, y: w0.y }, { x: w3.x, y: w3.y }], '#f6e2a4');                     // haz de luz
    g.restore();
  }
  estadoTec(9, P(x + 0.2, y + 0.15, 34), t);
}
function drawPelota(t) {
  const p = P(8.2, 18.5);
  sombra(8.2, 18.56, 5, 2.4);
  dot({ x: p.x, y: p.y - 3.5 * zoom }, 4 * zoom, '#e8e2d4');
  g.strokeStyle = '#c94f43'; g.lineWidth = 1.2 * zoom;
  g.beginPath(); g.arc(p.x, p.y - 3.5 * zoom, 4 * zoom, .6, 2.4); g.stroke();
  g.beginPath(); g.arc(p.x, p.y - 3.5 * zoom, 4 * zoom, 3.7, 5.6); g.stroke();
}

/* --- Época 1: el mundo salvaje --- */
