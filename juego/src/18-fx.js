/* ============================================================
   18-fx
   Efectos y ambiente: humo, anillos, nubes, agua, LOS PECES, estrellas, noche, luciérnagas y hierba viva.
   ============================================================ */
const fx = { humo: [], libros: [], chispas: [], pops: [], anillos: [], taps: [], destellos: [] };
/* LA ONDA DEL DEDO. En táctil no hay hover, así que no hay halo que anuncie nada: esta onda breve es el
   acuse de recibo de cada tap (haya acción debajo o no; es del dedo, no del mundo). Va en coordenadas de
   PANTALLA a propósito: dura 0,35 s y pertenece al gesto, no al terreno. Blanca y discreta: el anillo
   DORADO sigue siendo solo de la gramática de acción. */
function drawTaps() {
  if (!fx.taps.length) return;
  const now = performance.now();
  for (const tp of fx.taps) {
    const k = (now - tp.born) / 350; if (k >= 1) continue;
    g.save(); g.globalAlpha = 0.5 * (1 - k);
    g.strokeStyle = '#ffffff'; g.lineWidth = 2;
    g.beginPath(); g.arc(tp.x, tp.y, 7 + 16 * smooth(k), 0, 7); g.stroke();
    g.restore();
  }
  fx.taps = fx.taps.filter(tp => (now - tp.born) / 350 < 1);
}
function drawDestellos() { // EL HALLAZGO DE UN SECRETO: un resplandor dorado y estrellas de cuatro puntas que suben en espiral
  if (!fx.destellos.length) return;
  const now = performance.now();
  for (const d of fx.destellos) {
    const age = (now - d.born) / 1000; if (age > 2.6) continue;
    const p = P(d.x, d.y), k = age / 2.6, s = zoom;
    g.save();
    const r = (30 + 90 * Math.min(1, age / 0.5)) * s, gr = g.createRadialGradient(p.x, p.y - 20 * s, 0, p.x, p.y - 20 * s, r);
    gr.addColorStop(0, `rgba(255, 236, 170, ${0.55 * (1 - k)})`); gr.addColorStop(1, 'rgba(255, 210, 90, 0)');
    g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y - 20 * s, r, 0, 7); g.fill();
    for (let i = 0; i < 18; i++) {
      const a = i * 2.39996 + age * (1.2 + (i % 3) * 0.4), rr = (10 + i * 2.4) * s * (0.6 + age), y = p.y - 20 * s - age * (40 + (i % 5) * 14) * s;
      const x = p.x + Math.cos(a) * rr, yy = y + Math.sin(a) * rr * 0.35, tam = (2.2 + (i % 4)) * s * (1 - k * 0.7), al = (1 - k) * (0.55 + 0.45 * Math.sin(age * 9 + i));
      g.globalAlpha = Math.max(0, al); g.fillStyle = i % 3 ? '#ffe28a' : '#fff6d6';
      g.beginPath(); g.moveTo(x, yy - tam * 2); g.lineTo(x + tam * 0.5, yy - tam * 0.5); g.lineTo(x + tam * 2, yy); g.lineTo(x + tam * 0.5, yy + tam * 0.5);
      g.lineTo(x, yy + tam * 2); g.lineTo(x - tam * 0.5, yy + tam * 0.5); g.lineTo(x - tam * 2, yy); g.lineTo(x - tam * 0.5, yy - tam * 0.5); g.closePath(); g.fill();
    }
    g.restore();
  }
  fx.destellos = fx.destellos.filter(d => (now - d.born) / 1000 <= 2.6);
}
function drawAnillos() { // el anillo de logro: cuando un saber avanza, su escena lo irradia
  drawDestellos();
  if (!fx.anillos.length) return;
  const now = performance.now();
  for (const a of fx.anillos) {
    const age = (now - a.born) / 1000; if (age > 0.9) continue;
    const p = P(a.x, a.y), r = (12 + age * 78) * zoom;
    g.save(); g.globalAlpha = (1 - age / 0.9) * 0.6;
    g.strokeStyle = '#ffd24a'; g.lineWidth = (2.6 - age * 2) * zoom;
    g.beginPath(); g.ellipse(p.x, p.y, r, r * 0.5, 0, 0, 7); g.stroke();
    g.restore();
  }
  fx.anillos = fx.anillos.filter(a => (now - a.born) / 1000 <= 0.9);
}
function anillaEscena(i) { // el logro irradia desde DONDE se aplica el saber
  const e = ESCENAS_SABER.find(e2 => e2.i === i);
  if (S.era === 1 && e) fx.anillos.push({ born: performance.now(), x: e.x, y: e.y });
}
function drawChispasFuego() { // las chispas que saltan al frotar las varas
  if (!fx.chispas.length) return;
  const base = P(6.5, 9.5, 9), s = zoom, G = 96, now = performance.now();
  for (const sp of fx.chispas) {
    const life = (now - sp.born) / 1000; if (life < 0) continue;
    const ox = sp.bx !== undefined ? sp.bx : base.x, oy = sp.by !== undefined ? sp.by : base.y;
    const px = ox + sp.vx * life * s;
    const py = oy - (sp.vz * life - 0.5 * G * life * life) * s;
    const a = Math.max(0, 1 - life / 0.62);
    g.save(); g.globalAlpha = a; dot({ x: px, y: py }, (0.5 + a * 1.7) * s, sp.col); g.restore();
  }
  fx.chispas = fx.chispas.filter(sp => (now - sp.born) / 1000 < 0.62);
}
let nextHumo = 0, nextLibro = 2;
function spawnFx(t, rate) {
  if (t > nextHumo && (ordEra(S.era) >= 11 || S.fuegoDescubierto)) { nextHumo = t + 0.55; fx.humo.push({ born: t, seed: Math.random() * 6.28 }); }
  if (t > nextLibro) {
    nextLibro = t + Math.max(0.5, Math.min(3.5, 8 / Math.max(1, rate)));
    let p;
    // en la época 1 el saber nace DONDE se aplica: cada escena aprendida emite sus +1
    const escenas = S.era === 1 ? ESCENAS_SABER.filter(e =>
      S.tecs[e.i] && S.tecs[e.i].fase === 'meseta' && (S.edad >= (e.edad || 1)) && !(e.i === 15 && S.edad >= 2)) : [];
    if (escenas.length && Math.random() < 0.65) {
      const e = escenas[Math.floor(Math.random() * escenas.length)];
      p = P(e.x, e.y, e.z || 30);
    } else if (S.dewey === 2 && Math.random() < 0.3) { // el patio también enseña
      p = Math.random() < 0.5 ? P(13.0, 9.8, 26) : P(11.2, 12.3, 30);
    } else {
      const kid = KIDS[Math.floor(Math.random() * Math.min(S.alumnos, 16))];
      const pos = (S.era === 1 ? LOOPS_FOGON[0] : S.era === 2 ? posSumer : posEnLoop)(kid.off + t * kid.speed);
      p = P(pos.x, pos.y, 34);
    }
    fx.libros.push({ born: t, x: p.x, y: p.y });
  }
  fx.humo = fx.humo.filter(p => t - p.born < 3.4);
  fx.libros = fx.libros.filter(p => t - p.born < 1.9);
}
function drawHumo(t) {
  const top = S.era === 1 ? P(6.5, 9.4, 26) : S.era === 2 ? P(8.6, 5.3, 62) : S.era === 3 ? P(8.5, 5.3, 56) : S.era === 4 ? P(8.95, 8.95, 14) : P(10.55, 5.6, 104); // del fogón, del horno, de la cocina o de la chimenea
  for (const p of fx.humo) {
    const a = t - p.born, f = a / 3.4;   // el segundo penacho nace 0.25 s en el futuro: 'a' puede ser negativo
    g.beginPath();
    g.arc(top.x + Math.sin(a * 1.3 + p.seed) * 6 * zoom + a * 3 * zoom, top.y - a * 14 * zoom, Math.max(0.1, 3 + f * 7) * zoom, 0, 7);
    g.fillStyle = `rgba(${PAL.humo},${0.34 * (1 - f)})`; g.fill();
  }
}
function drawLibros(t) {
  const fogon = ordEra(S.era) < 11;
  for (const p of fx.libros) {
    const a = (t - p.born) / 1.9;
    const y = p.y - a * 30 * zoom;
    const px = p.x + Math.sin(a * 2.6 + p.born * 7) * 3 * zoom;         // deriva, como llevado por el aire
    const al = a < .15 ? a / .15 : 1 - smooth((a - .5) / .5);
    const u = Math.min(1, a / .22), k = 0.5 + 0.5 * u + 0.32 * Math.sin(u * Math.PI); // pop con rebotito
    g.save(); g.globalAlpha = Math.max(0, al);
    g.translate(px, y); g.scale(k * zoom, k * zoom); g.rotate(Math.sin(a * 5 + p.born) * 0.07);
    if (S.era === 4) { // en Atenas el saber es una tablilla de cera con su marco (en coordenadas del icono: ya está trasladado)
      g.fillStyle = '#8a6a4a'; g.fillRect(-6, -8.2, 12, 8.2);
      g.fillStyle = '#3f3a32'; g.fillRect(-4.9, -7.1, 9.8, 6);
      g.strokeStyle = '#c9b48a'; g.lineWidth = 0.9; g.lineCap = 'round';                      // lo escrito con el estilo
      g.beginPath(); g.moveTo(-3.4, -5.2); g.lineTo(3.2, -5.2); g.stroke();
      g.beginPath(); g.moveTo(-3.4, -3); g.lineTo(1.4, -3); g.stroke();
    } else if (S.era === 3 || S.era === 5) { // en Egipto el saber es un rollo de papiro; en Alejandría, con su etiqueta
      g.fillStyle = '#e8d9a8'; g.fillRect(-5.5, -7, 11, 6);
      g.strokeStyle = '#b09a60'; g.lineWidth = 0.9; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-3.5, -4); g.lineTo(3.5, -4); g.stroke();
      g.fillStyle = '#c9b878'; g.fillRect(-7.2, -7.8, 1.9, 7.6); g.fillRect(5.3, -7.8, 1.9, 7.6); // los rodillos
      if (S.era === 5) { g.fillStyle = '#b5523a'; g.fillRect(5.6, -1.4, 2.6, 3.4); }              // el sillybos, la etiqueta que cuelga
    } else if (S.era === 7) { // en Tenochtitlan el saber es un pliego de códice plegado en biombo, con un glifo negro y uno rojo
      g.fillStyle = '#e9d9b0'; g.fillRect(-7, -9, 4.6, 9); g.fillRect(-2.3, -9, 4.6, 9); g.fillRect(2.4, -9, 4.6, 9);
      g.strokeStyle = '#b89a62'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(-2.4, -9); g.lineTo(-2.4, 0); g.moveTo(2.3, -9); g.lineTo(2.3, 0); g.stroke();   // los pliegues
      g.fillStyle = '#2c2418'; g.beginPath(); g.arc(-4.7, -5.2, 1.5, 0, 7); g.fill();                 // la tinta negra
      g.fillStyle = '#b5323a'; g.fillRect(-1.1, -6.6, 2.2, 2.6);                                      // la tinta roja
      g.strokeStyle = '#2f7a6a'; g.beginPath(); g.moveTo(3.4, -3); g.lineTo(6.0, -6.4); g.stroke();
    } else if (S.era === 14) { // en Roma el saber es un ábaco: la tabla de madera con sus surcos y las piedrecillas blancas
      g.fillStyle = '#8a6040'; g.fillRect(-7, -9, 14, 9);
      g.fillStyle = '#6a4a2e'; for (let k = 0; k < 3; k++) g.fillRect(-5.8, -7.6 + k * 2.6, 11.6, 0.8);   // los surcos
      g.fillStyle = '#f2eee4'; for (const [cx2, cy2] of [[-4, -7.2], [-2.2, -7.2], [1.6, -4.6], [3.4, -4.6], [-0.6, -2.0], [4.4, -2.0]]) { g.beginPath(); g.arc(cx2, cy2, 0.85, 0, 7); g.fill(); }
    } else if (S.era === 15) { // en Kaifeng el saber es un libro impreso cosido con hilo: la tapa azul, la etiqueta blanca del título y las puntadas del lomo
      g.fillStyle = '#2f4f7a'; g.fillRect(-6, -9.5, 12, 9.5);
      g.fillStyle = '#f2ecdc'; g.fillRect(1.6, -8.4, 2.6, 6.4);                                       // la etiqueta del título
      g.fillStyle = '#e8e2d2'; for (let k = 0; k < 4; k++) g.fillRect(-5.4, -8.6 + k * 2.4, 1.6, 0.6);   // las puntadas del lomo
    } else if (S.era === 10) { // en Santiago el saber es una pizarra de piedra con su marco de madera y una sílaba en tiza
      g.fillStyle = '#8a6040'; g.fillRect(-6.5, -9.5, 13, 9.5);
      g.fillStyle = '#3a4048'; g.fillRect(-5.3, -8.3, 10.6, 7.1);
      g.strokeStyle = '#eef0f2'; g.lineWidth = 0.9; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-3.6, -3.4); g.lineTo(-3.6, -6.6); g.lineTo(-2.4, -4.6); g.lineTo(-1.2, -6.6); g.lineTo(-1.2, -3.4); g.stroke();   // la m
      g.beginPath(); g.arc(1.6, -4.6, 1.2, 0, 7); g.moveTo(2.8, -4.6); g.lineTo(2.8, -3.4); g.stroke();   // la a
    } else if (S.era === 9) { // en Ámsterdam el saber es un pliego impreso: renglones parejos de tinta negra y la marca roja del impresor
      g.fillStyle = '#f8f4ea'; g.fillRect(-6, -9.5, 12, 9.5);
      g.fillStyle = '#1e1a16'; g.fillRect(-4.6, -8.2, 9.2, 1.6);   // el título en letra gruesa
      g.fillStyle = '#4a443a'; for (let k = 0; k < 4; k++) g.fillRect(-4.6, -5.6 + k * 1.3, k === 3 ? 6 : 9.2, 0.7);
      g.fillStyle = '#9a2a1e'; g.beginPath(); g.arc(3.4, -1.6, 1.1, 0, 7); g.fill();
    } else if (S.era === 8) { // en París el saber es un cuaderno de pergamino abierto, con su inicial roja y azul y dos renglones
      g.fillStyle = '#f1e6cc'; g.fillRect(-7, -9, 6.8, 9); g.fillRect(0.2, -9, 6.8, 9);
      g.strokeStyle = '#a8916a'; g.lineWidth = 0.7; g.beginPath(); g.moveTo(-0.1, -9.4); g.lineTo(-0.1, 0.4); g.stroke();   // el lomo
      g.fillStyle = '#a8261e'; g.fillRect(-6, -8, 2.4, 2.6); g.fillStyle = '#23407a'; g.fillRect(1.2, -8, 2.4, 2.6);          // las iniciales
      g.strokeStyle = '#3a2e1e'; g.lineWidth = 0.8; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-3, -6.6); g.lineTo(-1.4, -6.6); g.moveTo(-6, -3.6); g.lineTo(-1.4, -3.6); g.moveTo(4.2, -6.6); g.lineTo(6, -6.6); g.moveTo(1.2, -3.6); g.lineTo(5.6, -3.6); g.stroke();
    } else if (S.era === 6) { // en Bagdad el saber es una hoja de papel con su renglón de caligrafía y la tinta roja del título
      g.fillStyle = '#f4ecd6'; g.fillRect(-5.5, -9, 11, 9);
      g.strokeStyle = '#2c2418'; g.lineWidth = 0.9; g.lineCap = 'round';
      g.beginPath(); g.moveTo(3.5, -5.2); g.quadraticCurveTo(0, -6.4, -3.6, -5.2); g.stroke();
      g.beginPath(); g.moveTo(3.5, -2.6); g.quadraticCurveTo(-0.5, -3.4, -2.4, -2.6); g.stroke();
      g.strokeStyle = '#b5523a'; g.beginPath(); g.moveTo(3.5, -7.6); g.lineTo(-1, -7.6); g.stroke();
    } else if (S.era === 2) { // en Sumer el saber es una tablilla recién escrita
      g.fillStyle = '#c9a875'; g.fillRect(-6, -8, 12, 8);
      g.strokeStyle = '#8a6a4a'; g.lineWidth = 0.9; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-4, -5.6); g.lineTo(4, -5.6); g.stroke();
      g.beginPath(); g.moveTo(-4, -2.8); g.lineTo(2, -2.8); g.stroke();
    } else if (fogon) { // en el fogón el saber es una chispa que prende
      const gl = g.createRadialGradient(0, -4, 0, 0, -4, 9);
      gl.addColorStop(0, 'rgba(255,214,110,.5)'); gl.addColorStop(1, 'rgba(255,214,110,0)');
      g.fillStyle = gl; g.beginPath(); g.arc(0, -4, 9, 0, 7); g.fill(); // el halo cálido
      g.fillStyle = '#ffd873';                                          // la chispa de cuatro puntas
      g.beginPath(); g.moveTo(0, -10);
      g.quadraticCurveTo(1.6, -5.6, 6, -4); g.quadraticCurveTo(1.6, -2.4, 0, 2);
      g.quadraticCurveTo(-1.6, -2.4, -6, -4); g.quadraticCurveTo(-1.6, -5.6, 0, -10);
      g.closePath(); g.fill();
      dot({ x: 0, y: -4 }, 1.6, '#fff6d8');                             // el corazón blanco
    } else { // el librito abierto
      g.fillStyle = '#fdf8ea';
      g.beginPath(); g.moveTo(0, 0); g.lineTo(-9, -2.6); g.lineTo(-9, -8.4); g.lineTo(0, -5.4); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(0, 0); g.lineTo(9, -2.6); g.lineTo(9, -8.4); g.lineTo(0, -5.4); g.closePath(); g.fill();
      g.strokeStyle = '#d8cfb4'; g.lineWidth = 0.8; g.lineCap = 'round'; // un renglón por página
      g.beginPath(); g.moveTo(-7, -5.6); g.lineTo(-2.5, -4.2); g.stroke();
      g.beginPath(); g.moveTo(2.5, -4.2); g.lineTo(7, -5.6); g.stroke();
      g.strokeStyle = '#b8a27e'; g.lineWidth = 1;                        // el lomo
      g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -5.4); g.stroke();
    }
    g.font = '800 8px "Avenir Next", "Nunito", -apple-system, sans-serif';
    g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
    g.strokeStyle = 'rgba(58,50,38,.4)'; g.lineWidth = 2.4;
    g.strokeText('+1', 8.5, -4);                                         // contorno: legible sobre cualquier fondo
    g.fillStyle = fogon ? '#ffedbe' : '#ffffff';
    g.fillText('+1', 8.5, -4);
    g.restore();
  }
}
const NUBES = [
  { u: .14, v: .20, s: 1.00, capa: 'lejos' }, { u: .85, v: .14, s: .74, capa: 'lejos' },
  { u: .80, v: .58, s: .60, capa: 'lejos' }, { u: .09, v: .62, s: .68, capa: 'lejos' },
  { u: .30, v: .30, s: 2.1, capa: 'cerca', vel: 26 },  // las nubes que pasan POR ENCIMA del mundo
  { u: .78, v: .48, s: 1.6, capa: 'cerca', vel: 18 }
];
function posNube(n, t) { // paralaje + "pasar bajo las nubes": al acercarte, la capa cercana se desvanece a un velo
  const dx = ox - W / 2, dy = oy - (H * 0.5 - GRID * T2Y * zoom);
  const cerca = n.capa === 'cerca';
  const par = cerca ? 1.35 : 0.15;
  const k = zoom / fitZoom();
  const base = n.s * Math.max(.8, fitZoom());
  const s = Math.min(cerca ? 3.4 : 1.6, base * Math.pow(k, cerca ? .45 : .15));
  const alpha = cerca ? .88 * Math.max(.12, Math.min(1, 1.55 - k * .55)) : .96;
  const vel = n.vel || 7 * n.s;
  const margen = cerca ? 760 : 340;
  const x = ((n.u * W + t * vel) % (W + margen)) - margen / 2 + dx * par;
  const y = n.v * H + Math.sin(t * .3 + n.u * 9) * 4 + dy * par;
  return { x, y, s, alpha };
}
function drawNubes(t, capa) {
  for (const n of NUBES) {
    if (n.capa !== capa) continue;
    const { x, y, s, alpha } = posNube(n, t);
    // LA NUBE VIVE EL DÍA: de noche no es blanca, es un vapor gris azulado que el cielo apenas separa
    // (antes eran bolas blancas a medianoche, más brillantes que la luna, en las tres épocas antiguas)
    const luzN = ordEra(S.era) >= 11 ? 1 : luzDia();
    const blanco = lerpHex('#6d7592', '#ffffff', 0.15 + 0.85 * luzN), panza = lerpHex('#3a4160', '#7fa8c4', luzN);
    g.save(); g.globalAlpha = alpha; g.fillStyle = blanco;
    dot({ x: x, y: y }, 26 * s, blanco);
    dot({ x: x - 30 * s, y: y + 8 * s }, 17 * s, blanco);
    dot({ x: x + 31 * s, y: y + 7 * s }, 19 * s, blanco);
    dot({ x: x + 6 * s, y: y - 15 * s }, 18 * s, blanco);
    g.beginPath(); g.ellipse(x + 2 * s, y + 13 * s, 46 * s, 12 * s, 0, 0, 7); g.fill();
    g.globalAlpha = alpha * .26; g.fillStyle = panza;
    g.beginPath(); g.ellipse(x + 4 * s, y + 17 * s, 37 * s, 7 * s, 0, 0, 7); g.fill();
    g.restore();
  }
}
function drawSombrasNube(t) { // cada nube cercana proyecta SU sombra sobre el pasto, sincronizada
  const lim = (S && ordEra(S.era) >= 13) ? [0, 20] : [2, 18];
  g.save(); g.beginPath();
  const a = P(lim[0], lim[0]), b = P(lim[1], lim[0]), c = P(lim[1], lim[1]), d = P(lim[0], lim[1]);
  g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y);
  g.closePath(); g.clip();
  g.fillStyle = 'rgba(15,30,10,.09)';
  for (const n of NUBES) {
    if (n.capa !== 'cerca') continue;
    const p = posNube(n, t);
    g.beginPath();
    g.ellipse(p.x + 26, p.y + H * 0.34, 58 * p.s, 23 * p.s, 0, 0, 7);
    g.fill();
  }
  g.restore();
}
function drawAguaViva(t) {
  g.save(); g.beginPath();
  const a = P(13.3, 13.3, -8), b = P(16.5, 13.3, -8), c = P(16.5, 15.7, -8), d = P(13.3, 15.7, -8);
  g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y);
  g.closePath(); g.clip();
  const aC = P(14.9, 14.5, -8);
  const banda = ((t * 9) % 160) - 30;
  g.save(); g.translate(aC.x - 80 * zoom + banda * zoom, aC.y); g.rotate(-0.42);
  g.globalAlpha = .09; g.fillStyle = '#ffffff';
  g.fillRect(-7 * zoom, -55 * zoom, 14 * zoom, 110 * zoom);                          // el barrido de luz
  g.restore();
  g.strokeStyle = 'rgba(240,250,255,.4)'; g.lineWidth = 1.4 * zoom; g.lineCap = 'round';
  for (let i = 0; i < 4; i++) {
    const wob = Math.sin(t * 1.6 + i * 2.1) * 3 * zoom;
    const p = P(13.9 + (i % 2) * 1.5, 13.8 + i * 0.5, -8);
    g.beginPath(); g.moveTo(p.x - 8 * zoom + wob, p.y);
    g.quadraticCurveTo(p.x + wob, p.y + 1.6 * zoom, p.x + 8 * zoom + wob, p.y);
    g.stroke();
  }
  g.restore();
}
/* EL RÍO DE SUMER, VIVO. El terreno pinta el cauce quieto; esta capa lo hace correr: destellos que
   la corriente arrastra aguas abajo (cada uno por su carril y titilando a su fase), sombras de peces
   que se dejan llevar o remontan, y de tanto en tanto uno salta. Los periodos del salto son coprimos,
   como los de la laguna: rara vez coinciden dos. La geometría es la compartida de RIO_SUMER con su
   mismo meandro (wob del terreno), así que el brillo cae SIEMPRE sobre el agua. */
const PECES_RIO = [
  { u0: 0.15, vel: 0.010, perp: 0.25, salto: 19, cuando: 5.2, tam: 0.85 },
  { u0: 0.55, vel: -0.006, perp: -0.3, salto: 29, cuando: 13.7, tam: 1.0 },   // este remonta la corriente
  { u0: 0.80, vel: 0.013, perp: 0.05, salto: 23, cuando: 21.3, tam: 0.7 }
];
function puntoRio(u, perp, z) { // u 0-1 a lo largo del eje; perp en unidades de mundo, meandro incluido
  const dx = RIO_SUMER.bx - RIO_SUMER.ax, dy = RIO_SUMER.by - RIO_SUMER.ay;
  const L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  const o = Math.sin(u * 7.3 + 0.6) * 0.3 + perp;
  return P(RIO_SUMER.ax + dx * u + nx * o, RIO_SUMER.ay + dy * u + ny * o, z);
}
/* EL NILO CORRE (2026-08-24). Sumer tenía corriente, peces y saltos desde el 2026-08-02 y el Nilo era
   una mancha quieta: media razón de que se leyera como una alfombra azul puesta sobre el suelo. Aquí
   corre con SU carácter, que no es el del río de Sumer: más ancho, más lento y más callado (una lámina
   grande baja despacio), con las velas de las falúas por encima y sin peces saltarines. */
function drawNiloVivo(t) {
  const w = niloAgua();
  g.save(); g.beginPath();
  for (let i = 0; i <= 26; i++) { const q = puntoNilo(i / 26, w * 0.92, -6); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }
  for (let i = 26; i >= 0; i--) { const q = puntoNilo(i / 26, -w * 0.92, -6); g.lineTo(q.x, q.y); }
  g.closePath(); g.clip();
  g.strokeStyle = 'rgba(240,250,255,.40)'; g.lineCap = 'round';
  for (let i = 0; i < 8; i++) {   // la corriente: cada hebra baja por su carril, mas larga y lenta que en Sumer
    const u = (t * (0.005 + (i % 3) * 0.0018) + i * 0.29) % 1;
    const perp = (-0.62 + (i * 0.17) % 1.24) * w;
    const a2 = puntoNilo(u, perp, -6), b2 = puntoNilo(Math.min(1, u + 0.045), perp, -6);
    g.lineWidth = (1.1 + (i % 2) * 0.6) * zoom;
    g.globalAlpha = 0.22 + 0.22 * Math.sin(t * 0.9 + i * 2.1);
    g.beginPath(); g.moveTo(a2.x, a2.y); g.lineTo(b2.x, b2.y); g.stroke();
  }
  g.globalAlpha = 1;
  // el limo en suspension: manchas palidas que la crecida arrastra, mas visibles cuanto mas alta va
  const turbio = Math.max(0, (crecidaHoy() - 0.95) / 0.4);
  if (turbio > 0.02) {
    g.fillStyle = 'rgba(206,190,142,.30)';
    for (let i = 0; i < 5; i++) {
      const u = (t * 0.004 + i * 0.21) % 1, perp = (-0.5 + (i * 0.27) % 1.0) * w;
      const q = puntoNilo(u, perp, -6);
      g.save(); g.globalAlpha = turbio * (0.35 + 0.25 * Math.sin(t * 0.7 + i));
      g.beginPath(); g.ellipse(q.x, q.y, 9 * zoom, 3 * zoom, 0, 0, 7); g.fill(); g.restore();
    }
  }
  g.restore();   // CIERRA el recorte a la lámina del agua: sin esto, todo lo que se dibuja después
                 // del río (el mundo entero) queda recortado a la banda del Nilo
  /* LA VIDA DEL AGUA (2026-08-25: «el río no tiene vida»). Tres cosas que se mueven a ritmos distintos
     y nunca a la vez: los peces que remontan bajo la lámina, el hipopótamo que asoma y se hunde (el
     animal del Nilo por excelencia, y el que los egipcios modelaron en loza azul mil veces), y los
     anillos que deja al bajar. Todo determinista: mismo t, misma escena. */
  const PECES_NILO = [{ u0: 0.32, vel: 0.0045, perp: 0.35, tam: 1.0 }, { u0: 0.62, vel: -0.0032, perp: -0.42, tam: 0.8 },
                      { u0: 0.47, vel: 0.0060, perp: 0.08, tam: 0.65 }];
  g.save(); g.beginPath();
  for (let i = 0; i <= 26; i++) { const q2 = puntoNilo(i / 26, w * 0.9, -6); i ? g.lineTo(q2.x, q2.y) : g.moveTo(q2.x, q2.y); }
  for (let i = 26; i >= 0; i--) { const q2 = puntoNilo(i / 26, -w * 0.9, -6); g.lineTo(q2.x, q2.y); }
  g.closePath(); g.clip();
  for (const f of PECES_NILO) {
    const u = 0.26 + (((f.u0 + t * f.vel) % 0.5) + 0.5) % 0.5;
    const a2 = puntoNilo(u, f.perp * w, -6), b2 = puntoNilo(u + (f.vel >= 0 ? 0.012 : -0.012), f.perp * w, -6);
    const giro = Math.atan2(b2.y - a2.y, b2.x - a2.x);
    g.save(); g.translate(a2.x, a2.y); g.rotate(giro); g.globalAlpha = 0.22;
    g.beginPath(); g.ellipse(0, 0, 7 * f.tam * zoom, 2.4 * f.tam * zoom, 0, 0, 7); g.fillStyle = '#1d3f4e'; g.fill();
    g.beginPath(); g.moveTo(-6.4 * f.tam * zoom, 0); g.lineTo(-9.8 * f.tam * zoom, -2.2 * f.tam * zoom);
    g.lineTo(-9.8 * f.tam * zoom, 2.2 * f.tam * zoom); g.closePath(); g.fill();
    g.restore();
  }
  g.restore();
  // EL HIPOPÓTAMO: asoma los ojos y el lomo cada ~40 s, resopla y se hunde
  const CIC = 41, fh = ((t % CIC) + CIC) % CIC;
  if (fh < 13) {
    const k = fh / 13, sube = Math.sin(k * Math.PI);                   // emerge y vuelve a hundirse
    const u = 0.40 + Math.sin(t * 0.02) * 0.06;
    const h = puntoNilo(u, -w * 0.30, -6), z = zoom;
    g.save(); g.globalAlpha = Math.min(1, sube * 2.2);
    ellipse({ x: h.x, y: h.y + 1.5 * z }, (13 + sube * 3) * z, 3.6 * z, 'rgba(20,60,80,.22)');   // su bulto bajo el agua
    if (sube > 0.28) {
      /* EL HIPOPÓTAMO, REDIBUJADO (2026-09-06, quinta tanda: «salió en el agua, eran como dos círculos,
         se veía horrible»). Ahora es un hipopótamo de perfil: el lomo largo y oscuro, la cabeza de
         hocico ancho con los OJOS, las OREJAS y los ollares arriba del todo (que es como asoman de
         verdad), y la lámina del agua cubriéndole la panza. */
      const oy = h.y - sube * 3 * z, CUERPO = '#6a5f6b', LOMO = '#857987', CARA = '#78606e', ROSA = '#b98a96', OJO = '#2a2226';
      ellipse({ x: h.x - 4 * z, y: oy - 3 * z }, 12 * z, 4.6 * z, CUERPO);                        // el lomo, una masa larga y baja
      ellipse({ x: h.x - 5 * z, y: oy - 5.6 * z }, 8 * z, 1.9 * z, LOMO);                          // su brillo mojado
      g.fillStyle = CUERPO; g.beginPath();                                                        // la cabeza: del cuello al hocico ancho
      g.moveTo(h.x + 4 * z, oy - 7.2 * z); g.lineTo(h.x + 15 * z, oy - 7.6 * z);
      g.quadraticCurveTo(h.x + 20.5 * z, oy - 7.4 * z, h.x + 20 * z, oy - 3 * z);
      g.quadraticCurveTo(h.x + 19.5 * z, oy + 0.4 * z, h.x + 14 * z, oy + 0.6 * z); g.lineTo(h.x + 4 * z, oy + 0.4 * z); g.closePath(); g.fill();
      ellipse({ x: h.x + 17.5 * z, y: oy - 4.6 * z }, 3.4 * z, 2.6 * z, CARA);                   // el hocico, más claro
      line({ x: h.x + 12 * z, y: oy - 1.2 * z }, { x: h.x + 19.4 * z, y: oy - 1.6 * z }, '#4a3f48', 0.9 * z); // la boca
      dot({ x: h.x + 16.4 * z, y: oy - 6.6 * z }, 0.75 * z, OJO); dot({ x: h.x + 18.6 * z, y: oy - 6.4 * z }, 0.75 * z, OJO); // los ollares, arriba del hocico
      for (const ex of [8.5, 12.5]) { dot({ x: h.x + ex * z, y: oy - 8.2 * z }, 1.7 * z, CUERPO); dot({ x: h.x + ex * z + 0.4 * z, y: oy - 8.4 * z }, 0.8 * z, OJO); } // los ojos, como dos burbujas sobre la cabeza
      for (const ex of [6.2, 10.6]) { ellipse({ x: h.x + ex * z, y: oy - 9.6 * z }, 1.25 * z, 1.6 * z, CUERPO); ellipse({ x: h.x + ex * z, y: oy - 9.5 * z }, 0.6 * z, 0.9 * z, ROSA); } // las orejitas
      g.fillStyle = 'rgba(74,134,168,.55)'; g.fillRect(h.x - 18 * z, oy - 0.6 * z, 40 * z, 4 * z); // la lámina del agua sobre la panza
      if (k > 0.45 && k < 0.62) {                                                                 // el resoplido
        g.save(); g.globalAlpha = (0.6 - Math.abs(k - 0.535) * 6) * 0.8;
        dot({ x: h.x + 15 * z, y: h.y - 7 * z }, 2.6 * z, '#eaf3f6');
        dot({ x: h.x + 18 * z, y: h.y - 10 * z }, 1.8 * z, '#eaf3f6'); g.restore();
      }
    }
    if (k > 0.8) {                                                                                // los anillos al hundirse
      g.globalAlpha = (1 - k) * 3 * 0.5; g.strokeStyle = 'rgba(235,250,255,.9)'; g.lineWidth = 1.1 * z;
      for (const rr of [5, 10]) { g.beginPath(); g.ellipse(h.x, h.y, rr * z, rr * 0.4 * z, 0, 0, 7); g.stroke(); }
    }
    g.restore();
  }
}
function drawRioVivo(t) {
  if (S.era === 3) return drawNiloVivo(t);
  if (S.era === 4) return drawIlisosVivo(t);
  if (S.era !== 2) return;
  g.save(); g.beginPath();
  for (let i = 0; i <= 30; i++) { const q = puntoRio(i / 30, 0.95, -6); i ? g.lineTo(q.x, q.y) : g.moveTo(q.x, q.y); }
  for (let i = 30; i >= 0; i--) { const q = puntoRio(i / 30, -0.95, -6); g.lineTo(q.x, q.y); }
  g.closePath(); g.clip();
  g.strokeStyle = 'rgba(240,250,255,.42)'; g.lineCap = 'round';
  for (let i = 0; i < 6; i++) { // la corriente: cada destello viaja aguas abajo por su carril
    const u = (t * (0.008 + (i % 3) * 0.003) + i * 0.37) % 1;
    const perp = -0.55 + (i * 0.19) % 1.1;
    const a = puntoRio(u, perp, -6), b = puntoRio(Math.min(1, u + 0.025), perp, -6);
    g.lineWidth = (1 + (i % 2) * 0.5) * zoom;
    g.globalAlpha = 0.35 + 0.3 * Math.sin(t * 1.3 + i * 2.4);
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
  }
  g.globalAlpha = 1;
  // LOS CANALES TAMBIÉN CORREN: el agua entra del río al canal madre y baja por el ramal a las parcelas
  g.strokeStyle = 'rgba(240,250,255,.5)'; g.lineWidth = 1 * zoom; g.lineCap = 'round';
  for (const [x0, y0, x1, y1, nG] of [[15.8, 10.6, 5.6, 11.5, 4], [9.0, 11.15, 9.6, 16.4, 3], [12.6, 10.85, 13.1, 13.9, 2]]) {
    for (let i = 0; i < nG; i++) {
      const u = (t * 0.022 + i / nG) % 1;
      const gx = x0 + (x1 - x0) * u, gy = y0 + (y1 - y0) * u;
      const a2 = P(gx, gy, -3), b2 = P(x0 + (x1 - x0) * Math.min(1, u + 0.02), y0 + (y1 - y0) * Math.min(1, u + 0.02), -3);
      g.save(); g.globalAlpha = 0.3 + 0.25 * Math.sin(t * 1.7 + i * 2.4);
      g.beginPath(); g.moveTo(a2.x, a2.y); g.lineTo(b2.x, b2.y); g.stroke(); g.restore();
    }
  }
  for (const f of PECES_RIO) { // las sombras, al hilo del agua
    const u = ((f.u0 + t * f.vel) % 1 + 1) % 1;
    const p = puntoRio(u, f.perp, -6), sig = puntoRio(((u + (f.vel >= 0 ? 0.01 : -0.01)) % 1 + 1) % 1, f.perp, -6);
    const giro = Math.atan2(sig.y - p.y, sig.x - p.x);
    g.save(); g.translate(p.x, p.y); g.rotate(giro); g.globalAlpha = 0.26;
    g.beginPath(); g.ellipse(0, 0, 6 * f.tam * zoom, 2.2 * f.tam * zoom, 0, 0, 7); g.fillStyle = '#1d3f4e'; g.fill();
    g.beginPath(); g.moveTo(-5.6 * f.tam * zoom, 0); g.lineTo(-8.8 * f.tam * zoom, -2 * f.tam * zoom);
    g.lineTo(-8.8 * f.tam * zoom, 2 * f.tam * zoom); g.closePath(); g.fill();
    g.restore();
  }
  g.restore();
  for (const f of PECES_RIO) { // el salto, fuera del recorte: el pez sale del agua
    const ciclo = ((t - f.cuando) % f.salto + f.salto) % f.salto;
    if (ciclo > 1.1) continue;
    const k = ciclo / 1.1, arco = Math.sin(k * Math.PI);
    const u = ((f.u0 + t * f.vel) % 1 + 1) % 1;
    const p = puntoRio(u, f.perp, -6 + arco * 24);
    const lado = f.vel >= 0 ? 1 : -1;
    g.save(); g.translate(p.x + (k - 0.5) * 11 * lado * zoom, p.y); g.scale(lado, 1); g.rotate((k - 0.5) * 2.0);
    g.fillStyle = '#7fa3b3';
    g.beginPath(); g.ellipse(0, 0, 5.5 * f.tam * zoom, 2 * f.tam * zoom, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,.5)';
    g.beginPath(); g.ellipse(-1 * zoom, -0.8 * zoom, 2 * f.tam * zoom, 0.8 * f.tam * zoom, 0, 0, 7); g.fill();
    g.restore();
    if (k > 0.75) { // las ondas al caer
      g.save(); g.globalAlpha = (1 - k) * 0.9; g.strokeStyle = 'rgba(235,250,255,.9)'; g.lineWidth = 1.1 * zoom;
      const q = puntoRio(u, f.perp, -6);
      for (const rr of [3.5, 7]) { g.beginPath(); g.ellipse(q.x, q.y + 1.5 * zoom, rr * zoom, rr * 0.4 * zoom, 0, 0, 7); g.stroke(); }
      g.restore();
    }
  }
}
/* LA BANDADA. Al amanecer y al atardecer, una V de garzas cruza alto sobre el valle: el cielo también
   vive. Va en coordenadas de PANTALLA (como las nubes: es cielo, no diorama), determinista, y solo en
   la franja del sol bajo: de día pleno y de noche el cielo descansa. */
function drawBandada(t) {
  if (!epocaConstruida(S.era) || !S.fuegoDescubierto) return;
  const dia = luzDia();
  const franja = Math.min(1, Math.max(0, (0.24 - Math.abs(dia - 0.5)) / 0.14)); // solo con el sol bajo
  if (franja <= 0.02) return;
  const c = (t / 55) % 1; if (c > 0.4) return;
  const k = c / 0.4, xw = -120 + k * (W + 240), yw = H * 0.16 - Math.sin(k * Math.PI) * 24;
  g.save(); g.globalAlpha = 0.7 * franja;
  g.strokeStyle = '#3a4a56'; g.lineWidth = 1.6; g.lineCap = 'round';
  for (let i = 0; i < 7; i++) {
    const fila = Math.ceil(i / 2), lado = i % 2 ? 1 : -1;
    const bx = xw - fila * 15, by = yw + (i === 0 ? 0 : lado * fila * 8);
    const fl = Math.sin(t * 7 + i * 1.3) * 3.2;
    g.beginPath(); g.moveTo(bx - 5, by + fl); g.quadraticCurveTo(bx - 1, by - 2, bx, by);
    g.quadraticCurveTo(bx + 1, by - 2, bx + 5, by + fl); g.stroke();
  }
  g.restore();
}
/* LOS JUNCOS VIVOS. Los del terreno son pre-renderizados y están clavados; estas matas, en perchas
   propias (medidas en seco: fuera del agua, de los canales y del paseo), se mecen con la brisa.
   La brisa es UNA para todas las matas (esa es la armonía) y cada tallo la siente con su retraso;
   las espigas cabecean montadas en la punta de su tallo. Mismo idioma que los juncos del terreno:
   cinco tallos en abanico #7d8b4a y dos espigas #8a6f4d. */
const JUNCOS_VIVOS = { 1: [[17.1, 13.9, 0], [13.0, 16.1, 2.1], [15.4, 16.5, 4.4]],
                       2: [[16.2, 7.8, 0], [15.6, 14.0, 2.1], [12.6, 17.6, 4.4]],
                       4: [[16.6, 11.0, 0], [13.6, 15.5, 2.1], [11.9, 17.2, 4.4], [15.2, 12.6, 1.1]] }; // las cañas del Ilisos
function drawJuncosVivos(t) {
  const matas = JUNCOS_VIVOS[S.era];
  if (!matas) return;
  const brisa = Math.sin(t * 0.5) + 0.4 * Math.sin(t * 1.7);    // el viento, uno solo para todo el mundo
  g.strokeStyle = '#7d8b4a'; g.lineCap = 'round'; g.lineWidth = 1.3 * zoom;
  for (const [jx, jy, ph] of matas) {
    const q = P(jx, jy);
    for (let k = -2; k <= 2; k++) {
      const alto = (11 - Math.abs(k) * 2.2) * zoom;
      const sw = (brisa * 0.7 + Math.sin(t * 0.9 + ph + k * 0.6) * 0.5) * 2.2 * zoom * (alto / (11 * zoom));
      g.beginPath(); g.moveTo(q.x + k * 2.2 * zoom, q.y);
      g.quadraticCurveTo(q.x + k * 2.55 * zoom + sw * 0.4, q.y - alto * 0.6, q.x + k * 2.9 * zoom + sw, q.y - alto);
      g.stroke();
    }
    for (const [ex, ey, eh] of [[-3.4, -10.5, 0.9], [1.6, -9.5, 0.75]]) {
      const sw = (brisa * 0.7 + Math.sin(t * 0.9 + ph + ex * 0.3) * 0.5) * 2.0 * zoom * eh;
      g.save(); g.translate(q.x + ex * zoom + sw, q.y + ey * zoom); g.rotate(sw * 0.028 / zoom);
      g.fillStyle = '#8a6f4d'; g.fillRect(0, 0, 1.9 * zoom, 4.2 * zoom);
      g.restore();
    }
  }
}
/* LOS PECES DE LA LAGUNA. Fauna de ambiente, como las mariposas y los pájaros: no se tocan, no dan nada,
   están porque una laguna sin nada dentro es un charco. Nadan en óvalos bajo el agua (sombras que cruzan)
   y de vez en cuando uno salta: sale del agua en arco, brilla al voltear y deja ondas al caer.
   El salto de cada uno tiene su propio periodo (17, 21, 26 y 31 s) y su propio desfase, así que rara vez
   coinciden: medido, dos peces saltan a la vez alrededor del 2% del tiempo, que es justo lo que hace un
   estanque. No es un patrón que se repita: los cuatro periodos son coprimos. */
const LAGO = { cx: 14.9, cy: 14.5, rx: 1.15, ry: 0.72, z: -8 };
/* ¿Este punto cae en la laguna? Elipse algo generosa que envuelve la forma real del lago (los radios
   del terreno llegan a 1.9·1.18·0.9 = 2.02 en x y 1.59 en y). Sirve para que nadie camine sobre el agua
   ni aparezca una luz de material flotando en mitad del charco. */
function sobreElLago(x, y) {
  const dx = (x - 14.9) / 2.05, dy = (y - 14.6) / 1.62;
  return dx * dx + dy * dy <= 1;
}
const PECES = [
  { r: 0.62, vel: 0.30, fase: 0.0, salto: 17.0, cuando: 3.1, tam: 1.00 },
  { r: 0.80, vel: -0.23, fase: 2.1, salto: 21.0, cuando: 11.4, tam: 0.82 },
  { r: 0.44, vel: 0.41, fase: 4.0, salto: 26.0, cuando: 19.2, tam: 0.70 },
  { r: 0.72, vel: -0.34, fase: 5.4, salto: 31.0, cuando: 6.7, tam: 0.90 }
];
function drawPeces(t) {
  if (S.era !== 1) return;                       // la laguna del fogón; otras épocas tienen su propia agua
  const inv = (typeof copaHoy === 'function' ? copaHoy().nieve : 0);
  if (inv > 0.75) return;                        // en lo hondo del invierno el agua se aquieta
  // 1) NADANDO: sombras bajo la superficie, recortadas al agua
  g.save();
  const a = P(13.3, 13.3, LAGO.z), b = P(16.5, 13.3, LAGO.z), c = P(16.5, 15.7, LAGO.z), d = P(13.3, 15.7, LAGO.z);
  g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.clip();
  for (const f of PECES) {
    const ang = t * f.vel + f.fase;
    const wx = LAGO.cx + Math.cos(ang) * LAGO.rx * f.r, wy = LAGO.cy + Math.sin(ang) * LAGO.ry * f.r;
    const p = P(wx, wy, LAGO.z), sig = P(LAGO.cx + Math.cos(ang + 0.12) * LAGO.rx * f.r, LAGO.cy + Math.sin(ang + 0.12) * LAGO.ry * f.r, LAGO.z);
    const giro = Math.atan2(sig.y - p.y, sig.x - p.x);
    g.save(); g.translate(p.x, p.y); g.rotate(giro);
    g.globalAlpha = 0.30 * (1 - inv);
    g.beginPath(); g.ellipse(0, 0, 6.5 * f.tam * zoom, 2.4 * f.tam * zoom, 0, 0, 7); g.fillStyle = '#1d3f4e'; g.fill();
    g.beginPath(); g.moveTo(-6 * f.tam * zoom, 0); g.lineTo(-9.5 * f.tam * zoom, -2.2 * f.tam * zoom); g.lineTo(-9.5 * f.tam * zoom, 2.2 * f.tam * zoom);
    g.closePath(); g.fill();                                                   // la cola
    g.restore();
  }
  g.restore();
  // 2) SALTANDO: fuera del recorte, porque el pez sale del agua
  for (const f of PECES) {
    const ciclo = ((t - f.cuando) % f.salto + f.salto) % f.salto;
    if (ciclo > 1.15) continue;                                                // el salto dura poco más de un segundo
    const k = ciclo / 1.15, arco = Math.sin(k * Math.PI);
    const ang = t * f.vel + f.fase;
    const wx = LAGO.cx + Math.cos(ang) * LAGO.rx * f.r * 0.8, wy = LAGO.cy + Math.sin(ang) * LAGO.ry * f.r * 0.8;
    const p = P(wx, wy, LAGO.z + arco * 27);   // altura del salto: por debajo de esto no se despega del agua
    // El pez está dibujado mirando a la DERECHA (la cola en −x). Si salta hacia la izquierda hay que
    // espejarlo, no solo rotarlo: sin el espejo salía de espaldas, con la nariz apuntando al lado
    // contrario del que avanzaba. Con scale(lado,1) el marco ya va en su sentido, y entonces una sola
    // rotación sirve para los dos lados: nariz arriba mientras sube, nariz abajo mientras cae.
    const lado = Math.cos(ang) >= 0 ? 1 : -1;
    g.save(); g.translate(p.x + (k - 0.5) * 13 * lado * zoom, p.y);
    g.scale(lado, 1);
    g.rotate((k - 0.5) * 2.0);
    g.globalAlpha = Math.min(1, arco * 2.6);
    g.beginPath(); g.ellipse(0, 0, 6.2 * f.tam * zoom, 2.5 * f.tam * zoom, 0, 0, 7); g.fillStyle = '#5e93a6'; g.fill();
    g.beginPath(); g.ellipse(-1 * zoom, -0.9 * f.tam * zoom, 3.6 * f.tam * zoom, 1.1 * f.tam * zoom, 0, 0, 7);
    g.fillStyle = 'rgba(226,244,250,.85)'; g.fill();                           // el lomo que brilla al voltear
    g.beginPath(); g.moveTo(-5.6 * f.tam * zoom, 0); g.lineTo(-9.6 * f.tam * zoom, -3 * f.tam * zoom); g.lineTo(-9.6 * f.tam * zoom, 3 * f.tam * zoom);
    g.closePath(); g.fillStyle = '#4d7f92'; g.fill();
    g.restore();
    // la salpicadura: al despegar y al caer
    if (k < 0.22 || k > 0.78) {
      const s0 = P(wx, wy, LAGO.z), fuerza = k < 0.22 ? 1 - k / 0.22 : (k - 0.78) / 0.22;
      g.save(); g.globalAlpha = 0.5 * fuerza;
      g.strokeStyle = 'rgba(235,250,255,.9)'; g.lineWidth = 1.3 * zoom;
      for (const rr of [5, 9, 13]) { g.beginPath(); g.ellipse(s0.x, s0.y, rr * (1.6 - fuerza) * zoom, rr * 0.42 * (1.6 - fuerza) * zoom, 0, 0, 7); g.stroke(); }
      g.restore();
    }
  }
}
let fugaz = null; // la estrella fugaz de la noche
function drawEstrellas(t) { // estrellas y luna en la noche de las épocas construidas (media astronomía nació mirando este cielo desde Sumer)
  if (!epocaConstruida(S.era) || !S.fuegoDescubierto) return;
  const noche = 1 - luzDia();
  if (noche < 0.15) return;
  const base = Math.min(1, (noche - 0.15) * 1.7);
  g.save();
  for (let i = 0; i < 46; i++) {
    const sx = ((i * 137.5) % 100) / 100 * W, sy = ((i * 71.3) % 100) / 100 * (H * 0.4);
    const tw = 0.5 + 0.5 * Math.sin(t * 1.4 + i * 1.7);
    g.globalAlpha = base * (0.3 + tw * 0.7);
    dot({ x: sx, y: sy }, 0.6 + tw * 0.9, '#fff7e0');
  }
  // una estrella fugaz, muy de vez en cuando: la noche también cuenta historias
  if (!fugaz && Math.random() < 0.0007) fugaz = { born: t, x: W * (0.15 + Math.random() * 0.6), y: H * (0.06 + Math.random() * 0.12), dx: Math.random() < 0.5 ? 1 : -1 };
  if (fugaz) {
    const age = t - fugaz.born;
    if (age > 0.8) fugaz = null;
    else {
      const fxp = fugaz.x + fugaz.dx * age * 260, fyp = fugaz.y + age * 90;
      g.save(); g.globalAlpha = base * (1 - age / 0.8) * 0.9;
      const grd = g.createLinearGradient(fxp - fugaz.dx * 40, fyp - 14, fxp, fyp);
      grd.addColorStop(0, 'rgba(255,247,224,0)'); grd.addColorStop(1, 'rgba(255,247,224,.9)');
      g.strokeStyle = grd; g.lineWidth = 1.6; g.lineCap = 'round';
      g.beginPath(); g.moveTo(fxp - fugaz.dx * 40, fyp - 14); g.lineTo(fxp, fyp); g.stroke();
      dot({ x: fxp, y: fyp }, 1.4, '#fff7e0');
      g.restore();
    }
  }
  g.globalAlpha = base;                                            // la luna
  const mx = W * 0.82, my = H * 0.15, mr = 15;
  const gl = g.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 2.6);
  gl.addColorStop(0, 'rgba(245,240,214,0.5)'); gl.addColorStop(1, 'rgba(245,240,214,0)');
  g.fillStyle = gl; g.beginPath(); g.arc(mx, my, mr * 2.6, 0, 7); g.fill();
  dot({ x: mx, y: my }, mr, '#f2ecd0');
  g.restore();
}
/* EL SPRITE DEL BRILLO CÁLIDO. Los resplandores nocturnos (fogón, candiles, horno, luciérnagas)
   creaban ~15 createRadialGradient POR FRAME y el p95 tocó 14 ms (medido 2026-08-05). El gradiente
   se pinta UNA vez en un canvas chico y de ahí en más es un drawImage escalado: de milisegundos a
   centésimas. Dos tintes: brasa (naranja) y luciérnaga (amarillo). */
const BRILLO = {};
function brilloSprite(tinte) {
  if (BRILLO[tinte]) return BRILLO[tinte];
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const cg = c.getContext('2d');
  const gl = cg.createRadialGradient(64, 64, 0, 64, 64, 64);
  if (tinte === 'brasa') { gl.addColorStop(0, 'rgba(255,186,96,0.9)'); gl.addColorStop(0.5, 'rgba(232,124,52,0.32)'); gl.addColorStop(1, 'rgba(232,124,52,0)'); }
  else { gl.addColorStop(0, 'rgba(255,247,176,1)'); gl.addColorStop(0.4, 'rgba(244,220,110,.55)'); gl.addColorStop(1, 'rgba(244,220,110,0)'); }
  cg.fillStyle = gl; cg.fillRect(0, 0, 128, 128);
  return BRILLO[tinte] = c;
}
function pintarBrillo(x, y, R, alpha, tinte) { // el resplandor barato: un sprite escalado
  g.save(); g.globalAlpha = alpha;
  g.drawImage(brilloSprite(tinte || 'brasa'), x - R, y - R, R * 2, R * 2);
  g.restore();
}
function drawNoche(t) { // el manto de la noche, y los fuegos que la habitan (2026-08-05: era solo del fogón, y en Sumer «no había ciclo»)
  if (!epocaConstruida(S.era) || !S.fuegoDescubierto) return;
  const noche = 1 - luzDia();
  if (noche < 0.02) return;
  g.fillStyle = 'rgba(20,26,54,' + (noche * 0.5).toFixed(3) + ')';
  g.fillRect(0, 0, W, H);
  g.save(); g.globalCompositeOperation = 'lighter';
  const resplandor = (wx, wy, wz, R, fuerza) => {
    const f = P(wx, wy, wz);
    pintarBrillo(f.x, f.y, R * zoom, noche * fuerza, 'brasa');
  };
  if (S.era === 1) { // el fogón: un solo corazón de brasa
    const brasa = Math.max(0.15, Math.min(1, (S.fuego - 35) / 65));
    resplandor(6.5, 9.5, 6, 150 + brasa * 70, 0.4 + brasa * 0.4);
  } else if (S.era === 2) { // SUMER: la noche la habitan los candiles, el horno y la llama del Eanna
    resplandor(11.45, 8.85, 2, 60, 0.5);                                        // el candil del toldo
    if (S.tecs[19] && S.tecs[19].fase === 'meseta') resplandor(9.95, 9.35, 1, 55, 0.45); // el de la mesa de copia
    if (S.tecs[30] && S.tecs[30].fase !== 'sin') resplandor(9.5, 8.15, 3, 55, 0.45);     // el de la puerta
    if (nivelTec(16) >= 3) resplandor(12.2, 6.9, 2, 65, 0.5);                   // la boca del horno
    resplandor(6.0, 3.35, 89, 85, 0.55);                                        // la llama sagrada del Eanna
  } else if (S.era === 3) { // EGIPTO: los braseros de los pilonos, la sala que vela y los candiles del oficio (2026-08-24: el else genérico pintaba los candiles de Sumer flotando en el desierto)
    resplandor(9.15, 8.05, 4, 65, 0.5);                                         // el brasero del pilono
    resplandor(9.85, 8.05, 4, 60, 0.45);                                        // su gemelo, al otro lado de la puerta
    resplandor(3.53, 7.2, 6, 42, 0.32);                                         // la puerta encendida del poblado: alguien cena
    if (S.tecs[22] && S.tecs[22].fase !== 'sin') resplandor(14.0, 7.55, 5, 52, 0.42); // el candil de la lectura ante la Kemyt
  } else if (S.era === 4) { // ATENAS: las lámparas de aceite de la stoa, el hogar de las casas, y el altar del ágora
    resplandor(8.6, 6.55, 20, 55, 0.42); resplandor(10.6, 6.55, 20, 55, 0.42);       // dos lámparas colgadas del pórtico
    resplandor(8.95, 8.95, 10, 40, 0.3);                                           // el altar de los Doce Dioses, con su brasa
    resplandor(3.53, 11.5, 6, 40, 0.3);                                            // una casa de la ciudad con la puerta encendida
    if (S.tecs[38] && S.tecs[38].fase === 'meseta') resplandor(4.6, 9.3, 8, 46, 0.36); // la lámpara de la Academia, que estudia de noche
    resplandor(4.85, 7.5, 3, 30, 0.28);                                         // y la brasa del horno del pan
    if (S.tecs[32] && S.tecs[32].fase === 'meseta') resplandor(7.27, 7.92, 10, 60, 0.5); // la sala de copistas vela: su puerta alumbra
    if (S.tecs[31] && S.tecs[31].fase === 'meseta') resplandor(9.8, 7.5, 3, 50, 0.4);    // el fueguito del patio de las lascas
    if (S.tecs[20] && S.tecs[20].fase === 'meseta') resplandor(11.0, 5.75, 3, 45, 0.35); // el candil de la mesa del papiro
  }
  g.restore();
}
function drawLuciernagas(t) { // las luciérnagas de la noche del clan
  if (ordEra(S.era) >= 11 || !S.fuegoDescubierto || luzDia() > 0.55) return;
  for (let i = 0; i < 7; i++) {
    const bx = 4.5 + ((i * 3.7) % 12) + Math.sin(t * 0.23 + i * 2.1) * 1.6;
    const by = 5 + ((i * 5.3) % 11) + Math.sin(t * 0.31 + i * 1.3) * 1.4;
    const p = P(bx, by, 14 + Math.sin(t * 0.8 + i) * 6);
    const pulso = Math.max(0, Math.sin(t * 1.7 + i * 2.4));
    if (pulso < 0.25) continue;
    pintarBrillo(p.x, p.y, 5 * zoom, pulso * .85, 'luciernaga');
    dot(p, 1.1 * zoom, '#fff9c8');
  }
}
function drawMotas(t) { // polen y polvo a la deriva, en toda época
  for (let i = 0; i < 6; i++) {
    const wx = ((t * (0.10 + i * 0.013) + i * 3.4) % 16) + 2;
    const wy = 3 + ((i * 4.1) % 13) + Math.sin(t * 0.5 + i * 2) * 0.7;
    const p = P(wx, wy, 24 + Math.sin(t * 0.7 + i) * 8);
    g.save(); g.globalAlpha = .32 + Math.sin(t * 1.1 + i) * .14;
    dot(p, 1 * zoom, '#fdf8e6');
    g.restore();
  }
}
const HIERBAS_VIVAS = [[3.6, 6.2], [5.8, 4.4], [7.9, 12.6], [10.4, 11.3], [12.9, 7.8], [14.4, 10.9], [15.8, 13.2], [4.6, 14.7], [9.1, 14.2], [16.4, 6.9], [2.9, 9.8], [11.8, 15.3]];
function drawHierbaViva(x, y, i, t) { // matas que se mecen con el viento
  const p = P(x, y), s = zoom, v = Math.sin(t * 1.3 + i * 1.7) * 2.2 * s;
  g.strokeStyle = ordEra(S.era) < 11 ? '#8f934c' : '#679a43'; g.lineWidth = 1.4 * s; g.lineCap = 'round';
  for (let k = -1; k <= 1; k++) {
    g.beginPath(); g.moveTo(p.x + k * 2.2 * s, p.y);
    g.quadraticCurveTo(p.x + k * 2.6 * s + v * .4, p.y - 4 * s, p.x + k * 3 * s + v, p.y - (7 - Math.abs(k) * 1.6) * s);
    g.stroke();
  }
}
function drawGlobo(x, y, t) { // GRAMÁTICA de señales: globo de diálogo = alguien tiene algo que decirte
  const s = zoom, pp = P(x, y, 50 + Math.sin(t * 2.6) * 2.5);
  g.save(); g.globalAlpha = 0.86 + Math.sin(t * 2.6) * 0.14;
  g.fillStyle = '#fff8e6'; g.strokeStyle = '#c99a3f'; g.lineWidth = 1.4 * s;
  g.beginPath(); g.moveTo(pp.x - 3 * s, pp.y + 6 * s); g.lineTo(pp.x - 0.5 * s, pp.y + 12 * s); g.lineTo(pp.x + 3.5 * s, pp.y + 5.5 * s); g.closePath(); g.fill(); g.stroke(); // el rabito
  g.beginPath(); g.ellipse(pp.x, pp.y, 11 * s, 8 * s, 0, 0, 7); g.fill(); g.stroke();
  for (const k2 of [-4, 0, 4]) dot({ x: pp.x + k2 * s, y: pp.y }, 1.5 * s, '#c99a3f'); // "… tengo algo que contarte"
  g.restore();
}
