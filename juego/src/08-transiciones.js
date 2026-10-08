/* ============================================================
   08-transiciones
   La capa de transición suave()/nace(): lo que cambia de nivel se empuja en vez de saltar. Y el corral.
   ============================================================ */
function nivelTec(i) { return (S.tecs[i] && S.tecs[i].nivel) || 0; }

/* ---------- la capa de transición: los cambios de estado se EMPUJAN, no saltan ----------
   Sin esto, perfeccionar una etapa hacía que el cerco fuera más grande de un frame al siguiente y que
   dos ovejas aparecieran de la nada. Son dos piezas y ninguna necesita librería:
   · suave(clave, objetivo)  interpola cualquier número hacia su objetivo, con memoria entre frames.
   · nace(clave)             devuelve 0..1 desde que algo se ve por primera vez, para que entre creciendo. */
const _suaves = new Map();
function suave(clave, objetivo, vel = 2.6) {
  const ahora = performance.now(), e = _suaves.get(clave);
  if (!e) { _suaves.set(clave, { v: objetivo, t: ahora }); return objetivo; }   // la primera vez no se anima
  const dt = Math.min(0.12, Math.max(0, (ahora - e.t) / 1000));                 // suavizado exponencial:
  e.t = ahora;                                                                  // estable a cualquier fps y
  e.v += (objetivo - e.v) * (1 - Math.exp(-vel * dt));                          // si se llama varias veces
  if (Math.abs(objetivo - e.v) < 0.0008) e.v = objetivo;                        // por frame, dt≈0 y no corre
  return e.v;
}
const _nacidos = new Map();
let nacimientosVivos = false; // durante el primer segundo todo "ya estaba": no queremos un desfile al cargar
function nace(clave, dur = 850) {
  if (!nacimientosVivos) { _nacidos.set(clave, 0); return 1; }
  if (!_nacidos.has(clave)) _nacidos.set(clave, performance.now());
  const n = _nacidos.get(clave);
  return n === 0 ? 1 : Math.min(1, (performance.now() - n) / dur);
}
function nacerEn(k, f) { // envuelve un dibujo: entra creciendo desde su base y aclarándose
  const n = nace(k);
  if (n >= 1) { f(1); return; }
  const e = smooth(n);
  g.save(); g.globalAlpha *= e; // multiplicativo: respeta un desvanecido envolvente (la orilla al caer la velada)
  f(e);
  g.restore();
}
function nivelSuave(i) { return suave('niv' + i, nivelTec(i)); } // el nivel, pero interpolado
function corralRect() { const n = nivelSuave(25); return { x0: 11.5, y0: 10.6, x1: 13.5 + n * 0.15, y1: 12.4 + n * 0.11 }; }
function campoRect()  { const n = nivelSuave(24); return { x0: 3.6, y0: 10.2, x1: 5.7 + n * 0.14, y1: 12.1 + n * 0.11 }; }
function rebano() { // 2 ovejas al aprender, una más por cada etapa perfeccionada
  const r = corralRect(), n = nivelTec(25), out = [];
  for (let i = 0; i < 2 + n; i++) {
    const fx = 0.22 + 0.56 * (((i * 0.41) % 1)), fy = 0.24 + 0.52 * (((i * 0.67) % 1));
    out.push({ x0: r.x0 + (r.x1 - r.x0) * fx, y0: r.y0 + (r.y1 - r.y0) * fy, ph: i * 1.73 });
  }
  return out;
}
function posOveja(x0, y0, ph, t, caja) { // pastan paseando: unos pasos, se paran a comer, y siguen
  const fx1 = Math.sin(t * 0.11 + ph) * 0.62 + Math.sin(t * 0.047 + ph * 2.3) * 0.3;
  const fy1 = Math.cos(t * 0.083 + ph * 1.7) * 0.42 + Math.sin(t * 0.061 + ph) * 0.18;
  const vx = Math.cos(t * 0.11 + ph) * 0.11 * 0.62, vy = -Math.sin(t * 0.083 + ph * 1.7) * 0.083 * 0.42;
  const vel = Math.hypot(vx, vy);
  let x = x0 + fx1, y = y0 + fy1;
  if (caja) { // dentro del cerco: una oveja fuera del corral es una oveja perdida
    const m = 0.42;   // el margen cuenta el ancho del vellón, no solo su centro
    x = Math.max(caja.x0 + m, Math.min(caja.x1 - m, x));
    y = Math.max(caja.y0 + m, Math.min(caja.y1 - m, y));
  }
  return { x, y, anda: Math.min(1, vel / 0.05), dir: vx - vy >= 0 ? 1 : -1 };
}
function drawOveja(x0, y0, ph, t, caja) { // las ovejas del templo (las mismas que cuentan los cálculos)
  const o = posOveja(x0, y0, ph, t, caja), x = o.x, y = o.y;
  sombra(x, y + 0.05, 9, 3.6);
  const p = P(x, y), s = zoom;
  const pasta = Math.max(0, Math.sin(t * 0.5 + ph)) * 3 * s * (1 - o.anda);           // solo pasta cuando se para
  const bote = o.anda * Math.abs(Math.sin(t * 4.2 + ph)) * 1.1 * s;                   // el trotecito
  g.save(); g.translate(0, -bote);
  g.fillStyle = '#6e5a4a';
  let li = 0;
  for (const k of [-3.5, -1, 1.5, 4]) { // las patas, que se alternan al andar
    const alza = o.anda * Math.max(0, Math.sin(t * 4.2 + ph + li * 1.6)) * 1.4 * s;
    g.fillRect(p.x + k * s, p.y - 2.6 * s, 1.3 * s, 2.6 * s - alza); li++;
  }
  g.fillStyle = '#efe8d4';
  g.beginPath(); g.ellipse(p.x, p.y - 5 * s, 5.6 * s, 3.6 * s, 0, 0, 7); g.fill();    // el vellón
  dot({ x: p.x - 2 * s, y: p.y - 7.6 * s }, 1.7 * s, '#efe8d4');                      // los moños del vellón
  dot({ x: p.x + 1.5 * s, y: p.y - 8 * s }, 1.9 * s, '#efe8d4');
  dot({ x: p.x + 5.6 * s, y: p.y - 5.6 * s + pasta }, 2.2 * s, '#8a7a66');            // la cabeza
  ellipse({ x: p.x + 4 * s, y: p.y - 7 * s + pasta * 0.8 }, 1.2 * s, 0.6 * s, '#8a7a66'); // la oreja
  ojo(p.x + 6.4 * s, p.y - 6.2 * s + pasta, 0.5 * s, apertura(ph * 1.9));            // el ojo, que también parpadea
  if (caja && nivelTec(25) >= 3) {  // "cada cabeza tiene su muesca": el rebaño contado lleva su marca
    g.strokeStyle = '#a24e30'; g.lineWidth = 1.1 * s;
    g.beginPath(); g.moveTo(p.x - 3.4 * s, p.y - 6.6 * s); g.lineTo(p.x - 1.4 * s, p.y - 4.4 * s); g.stroke();
    g.beginPath(); g.moveTo(p.x - 1.4 * s, p.y - 6.6 * s); g.lineTo(p.x - 3.4 * s, p.y - 4.4 * s); g.stroke();
  }
  g.restore();
}
