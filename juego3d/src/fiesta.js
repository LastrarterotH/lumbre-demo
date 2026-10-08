/* ============================================================
   fiesta
   LA FIESTA DEL FINAL (2026-10-08, pedida por el usuario para la charla: «el agradecimiento… con chaya, serpentina,
   sonidos, todos los monitos bailando de todas las épocas»). Cuando el viaje termina (la pregunta abierta del valle de
   hoy), al cerrar la última tarjeta empieza la fiesta: cae chaya, vuelan serpentinas, suena la bulla (palmas, tambor,
   campanas y el griterío: efectos, no música) y llegan caminando los de todas las épocas a bailar alrededor del fuego,
   junto a la gente del valle, Bloom y la Abuela, que da palmas. Unos segundos después, el agradecimiento, abajo, para
   que la fiesta se vea. La fiesta queda (S.fiesta): el valle sigue bailando, y cada tanto vuelve a caer chaya.
   Lo de la época (dónde bailan, quién llega) lo pone epocas/epoca21.js con crearInvitados(); aquí, lo de la pantalla.
   ============================================================ */

/* dos de cada época, con los trajes de sus mundos (los de cada epocas/epocaN.js y sus piezas) */
export const INVITADOS = [
  { piel: 2, pelo: 'greñas', colorRopa: '#8a6247', vincha: '#8a6247' },                                              // el fogón
  { piel: 0, pelo: 'melena', colorRopa: '#9a7a52' },
  { piel: 1, pelo: 'rizos', colorPelo: '#1e1712', barba: '#1e1712', ropa: 'kaunakes', colorRopa: '#efe6cf', colorMechon: '#e2d6b8', collar: true },   // Sumer
  { piel: 3, pelo: 'rapado', ropa: 'kaunakes', colorRopa: '#e9e0cc', colorMechon: '#d9ccb0', torsoDesnudo: true },
  { piel: 2, corona: 'doble', ropa: 'corta', colorRopa: '#efe6d2', torsoDesnudo: true, sinFlecos: true, usej: true, barba: '#3a2c1c' },   // Egipto
  { piel: 1, pelo: 'rapado', ropa: 'tunica', colorRopa: '#f2ead2', orla: '#c9a24a', usej: ['#3e8f6c', '#e2ac45'] },
  { piel: 1, pelo: 'rizos', colorPelo: '#3a2a1e', barba: true, ropa: 'tunica', colorRopa: '#f4efe2', orla: '#c9b48a', vincha: '#3f6b3a', chal: '#ece4d0' },   // Atenas
  { piel: 0, pelo: 'moño', colorPelo: '#3a2a1e', ropa: 'tunica', colorRopa: '#e8d6c0', orla: '#b8574a', chal: '#b8574a', sinFlecos: true },
  { piel: 1, pelo: 'moño', colorPelo: '#2e2620', ropa: 'tunica', colorRopa: '#e9e2d2', orla: '#c9a24a', chal: '#3d4a5e' },   // Alejandría (Hipatia)
  { piel: 1, pelo: 'rizos', colorPelo: '#4a3a2c', barba: true, ropa: 'tunica', colorRopa: '#f1ebdc', orla: '#3f6b8a', chal: '#3f6b8a' },
  { piel: 0, pelo: 'corto', colorPelo: '#4a3424', ropa: 'tunica', colorRopa: '#f4efe2', orla: '#6a2a4a', chal: '#f8f4ea', sinFlecos: true },   // Roma
  { edad: 'nino', piel: 2, pelo: 'corto', colorPelo: '#2a1f18', ropa: 'tunica', colorRopa: '#b9583e', orla: '#7a3424', sinFlecos: true },
  { piel: 1, pelo: 'corto', colorPelo: '#4a4038', barba: '#7a7068', ropa: 'tunica', colorRopa: '#3e4660', orla: '#c9a24a', chal: '#2a2f44', turbante: '#5a4e44' },   // Bagdad
  { piel: 2, pelo: 'melena', colorPelo: '#1e1610', ropa: 'tunica', colorRopa: '#2f6f6a', orla: '#c9a24a', velo: '#e8dcc4', sinFlecos: true },
  { piel: 0, pelo: 'moño', colorPelo: '#1a1716', ropa: 'tunica', colorRopa: '#e9dcc8', orla: '#7fa996', chal: '#8fbcaa', sinFlecos: true },   // Kaifeng (Li Qingzhao)
  { piel: 0, pelo: 'corto', colorPelo: '#1a1716', ropa: 'tunica', colorRopa: '#3e5a8a', orla: '#2a3a5a', futou: true, alas: true, sinFlecos: true },
  { piel: 1, pelo: 'corto', colorPelo: '#3a2a1e', tonsura: true, ropa: 'tunica', colorRopa: '#2a2622', orla: '#1e1c1a', capucha: '#6a2a2a', sinFlecos: true },   // París
  { piel: 0, pelo: 'revuelto', colorPelo: '#8a5a2e', ropa: 'tunica', colorRopa: '#5a6a3a', orla: '#3e4a28', capucha: '#5a6a3a', sinFlecos: true },
  { piel: 2, pelo: 'corto', colorPelo: '#1e1610', ropa: 'tunica', colorRopa: '#efe6d2', orla: '#b8352f', chal: '#3f7fb8', penacho: true },   // Tenochtitlan
  { piel: 3, pelo: 'trenza', colorPelo: '#1e1610', ropa: 'tunica', colorRopa: '#efe0c8', orla: '#b8352f', chal: '#2f9a8a' },
  { piel: 0, pelo: 'corto', colorPelo: '#e8e4dc', barba: '#e8e4dc', ropa: 'tunica', colorRopa: '#2a2a2e', orla: '#1a1a1e', chal: '#e8e4dc', bonete: '#1e1c1a', sinFlecos: true },   // Ámsterdam (Comenio)
  { piel: 0, pelo: 'moño', colorPelo: '#6a4a2a', ropa: 'tunica', colorRopa: '#1e1c22', orla: '#14121a', chal: '#f4f0e6', sinFlecos: true },
];

/* ---------- la chaya y las serpentinas: una capa de papel sobre el mundo y bajo el agradecimiento (que se lea), que no se come los toques ---------- */
const COLORES = ['#e8484f', '#f4ac1d', '#3fa06a', '#3f7fb8', '#9a5ab8', '#f28ab2', '#ffd84a', '#4fc3c9', '#ff7a3d'];
let capa = null, ctx = null, papeles = [], cintas = [], corriendo = false, tAntes = 0;
const azar = (a, b) => a + Math.random() * (b - a);
function lienzo() {
  if (capa) return;
  capa = document.createElement('canvas'); capa.id = 'chaya';
  capa.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:104';
  const g = document.getElementById('gracias');   // en el mismo contenedor que el agradecimiento (105), justo debajo: el texto se lee
  if (g && g.parentNode) g.parentNode.insertBefore(capa, g); else document.body.appendChild(capa);
  ctx = capa.getContext('2d');
}
function medir() {
  const dpr = Math.min(2, window.devicePixelRatio || 1), W = capa.clientWidth || innerWidth, H = capa.clientHeight || innerHeight;
  if (capa.width !== Math.round(W * dpr) || capa.height !== Math.round(H * dpr)) { capa.width = Math.round(W * dpr); capa.height = Math.round(H * dpr); }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { W, H, s: Math.max(0.6, Math.min(1.3, H / 800)) };
}
/* la chaya: n papelitos; desde: 'arriba' (llueve) o 'lados' (los puñados que se tiran desde las esquinas de abajo) */
export function chaya(n = 160, desde = 'arriba') {
  lienzo(); const { W, H, s } = medir();
  for (let i = 0; i < n; i++) {
    const lado = i % 2 ? 1 : -1, tira = desde === 'lados';
    papeles.push({
      x: tira ? (lado < 0 ? azar(-10, W * 0.08) : azar(W * 0.92, W + 10)) : azar(0, W), y: tira ? H + azar(0, 20) : azar(-H * 0.5, -10),
      vx: tira ? -lado * azar(120, 520) * s : azar(-30, 30), vy: tira ? -azar(650, 1150) * s : azar(40, 160),
      r: azar(0, 6.3), vr: azar(-9, 9), w: azar(5, 9) * s, h: azar(3, 6) * s, redondo: Math.random() < 0.35,
      c: COLORES[i % COLORES.length], fase: azar(0, 6.3), retraso: tira ? azar(0, 0.35) : azar(0, 1.2),
    });
  }
  arrancar();
}
/* las serpentinas: cintas que se lanzan desde abajo y se desenrollan en el aire, ondulando, hasta caer */
export function serpentinas(n = 10) {
  lienzo(); const { W, H, s } = medir();
  for (let i = 0; i < n; i++) {
    const lado = i % 2 ? 1 : -1;
    cintas.push({
      x: lado < 0 ? azar(W * 0.02, W * 0.3) : azar(W * 0.7, W * 0.98), y: H + 10,
      vx: -lado * azar(60, 260) * s, vy: -azar(700, 1000) * s, c: COLORES[(i * 4) % COLORES.length],
      cola: [], fase: azar(0, 6.3), ancho: azar(3, 4.5) * s, retraso: azar(0, 0.8),
    });
  }
  arrancar();
}
function arrancar() { if (corriendo) return; corriendo = true; tAntes = performance.now(); requestAnimationFrame(cuadro); }
function cuadro(now) {
  const dt = Math.min(0.05, (now - tAntes) / 1000); tAntes = now;
  const { W, H, s } = medir();
  ctx.clearRect(0, 0, W, H);
  papeles = papeles.filter(p => {
    if (p.retraso > 0) { p.retraso -= dt; return true; }
    p.vy += 900 * s * dt; p.vx *= Math.pow(0.35, dt); p.vy = Math.min(p.vy, (110 + 40 * Math.sin(p.fase)) * s);   // el papel frena en el aire y baja aleteando
    p.fase += dt * 5; p.x += (p.vx + Math.sin(p.fase) * 40 * s) * dt; p.y += p.vy * dt; p.r += p.vr * dt;
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, 0.35 + 0.65 * Math.abs(Math.cos(p.fase))); ctx.fillStyle = p.c;
    if (p.redondo) { ctx.beginPath(); ctx.arc(0, 0, p.w * 0.45, 0, 6.3); ctx.fill(); } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
    return p.y < H + 30 && p.x > -60 && p.x < W + 60;
  });
  cintas = cintas.filter(c => {
    if (c.retraso > 0) { c.retraso -= dt; return true; }
    c.vy += 700 * s * dt; c.vx *= Math.pow(0.5, dt); c.vy = Math.min(c.vy, 140 * s); c.fase += dt * 7;
    c.x += (c.vx + Math.sin(c.fase) * 70 * s) * dt; c.y += c.vy * dt;
    c.cola.push([c.x, c.y]); if (c.cola.length > 46) c.cola.shift();
    ctx.strokeStyle = c.c; ctx.lineWidth = c.ancho; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); c.cola.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    return c.cola.some(([, y]) => y < H + 20);
  });
  if (papeles.length || cintas.length) requestAnimationFrame(cuadro);
  else { corriendo = false; ctx.clearRect(0, 0, W, H); }
}

/* ---------- la bulla: el puñado de chaya que revienta, las campanas, el griterío, las palmas y el tambor ---------- */
export function bulla(dur = 9) {
  if (typeof tono !== 'function' || typeof ruido !== 'function') return;
  [0, 0.16].forEach(c => { ruido(0.09, 0.09, c, 2600); tono(170, 0.16, 'sine', 0.11, c); });
  [[784, 0.1], [988, 0.28], [1175, 0.46], [1568, 0.64]].forEach(([f, c]) => { tono(f, 1.4, 'triangle', 0.06, c); tono(f * 2, 0.6, 'sine', 0.015, c); });
  ruido(2.4, 0.05, 0.25, 1700, 0.35); ruido(2.0, 0.035, 0.6, 2600, 0.3); ruido(1.6, 0.03, 2.6, 2000, 0.4);   // el griterío que sube y se va
  for (let i = 0; i < 14; i++) ruido(0.02, 0.025, azar(0.1, 1.6), 4200);                                       // los papelitos
  for (let c = 0.7, k = 0; c < dur; c += 0.46, k++) {                                                         // las palmas y el tambor, parejos
    ruido(0.03, 0.05, c + azar(-0.015, 0.015), 2900); ruido(0.025, 0.03, c + 0.02, 1900);
    if (k % 2 === 0) { tono(120, 0.18, 'sine', 0.11, c); tono(78, 0.3, 'sine', 0.08, c + 0.01); }
  }
}

/* ---------- el comienzo: al cerrar la tarjeta del final, antes del agradecimiento ---------- */
let empezada = false;
export const fiestaActiva = () => S.era === 21 && !!S.ganadoFu && !!S.fiesta;
export function empezarFiesta() {
  S.fiesta = true; empezada = performance.now(); if (typeof guardar === 'function') guardar();
  const quieto = typeof MOV_REDUCIDO !== 'undefined' && MOV_REDUCIDO;
  chaya(quieto ? 60 : 220, 'lados'); setTimeout(() => chaya(quieto ? 40 : 140, 'arriba'), 900);
  if (!quieto) { serpentinas(12); setTimeout(() => serpentinas(8), 2200); }
  bulla(9);
  acercar();
}
/* la cámara se acerca a la fiesta (y ahí se queda: es el final); quien la mueva, la toma */
const RONDA = { x: 7.9, y: 10.9 };
function acercar() {
  if (typeof zoom === 'undefined' || typeof T2X === 'undefined') return;
  const z0 = zoom, x0 = ox, y0 = oy, z1 = Math.max(z0, Math.min(z0 * 1.9, innerWidth <= 640 ? 1.6 : 2.3));
  const x1 = W / 2 - (RONDA.x - RONDA.y) * T2X * z1, y1 = H * 0.42 - (RONDA.x + RONDA.y) * T2Y * z1, t0 = performance.now();
  let tomo = false; const soltar = () => { tomo = true; };
  document.getElementById('scene')?.addEventListener('pointerdown', soltar, { once: true });
  const paso = now => {
    if (tomo) return;
    const k = Math.min(1, (now - t0) / 1800), e = k * k * (3 - 2 * k);
    zoom = z0 + (z1 - z0) * e; ox = x0 + (x1 - x0) * e; oy = y0 + (y1 - y0) * e;
    if (k < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}
export const fiestaRecien = () => empezada && performance.now() - empezada < 20000;   // los invitados entran caminando solo si la fiesta empezó ahora

if (typeof window.abrirGracias === 'function') {
  const abrir0 = window.abrirGracias;
  window.abrirGracias = function () {
    const final = S.era === 21 && S.ganadoFu;
    document.getElementById('gracias')?.classList.toggle('fiesta', final);
    const boton = document.getElementById('b-gracias-cerrar'); if (final && boton) boton.textContent = 'Seguir en la fiesta';   // las llegadas de frontera.js ponen el suyo
    if (final && !S.fiesta) { empezarFiesta(); setTimeout(() => { abrir0(); setTimeout(() => chaya(90, 'arriba'), 500); }, 6500); return; }
    abrir0();
    if (final) chaya(120, 'arriba');
  };
}
/* cada tanto, mientras dura la fiesta y se mira, vuelve a caer un puñado (epoca21 lo llama cada cuadro) */
let proxima = 0;
export function seguirFiesta(now = performance.now()) {
  if (!fiestaActiva() || document.hidden) return;
  if (!proxima) proxima = now + 30000;
  if (now >= proxima) { proxima = now + 35000 + Math.random() * 15000; chaya(70, 'arriba'); if (Math.random() < 0.5) serpentinas(4); }
}
