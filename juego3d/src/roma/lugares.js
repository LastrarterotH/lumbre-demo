/* ============================================================
   roma/lugares
   La geometría de Roma que el 3D necesita sin depender del motor cargado (el laboratorio de etapas, juego3d/qa.html,
   arma las piezas sin el motor). Es el ESPEJO de juego/src/09i-roma.js: si se mueve algo aquí, se mueve allá
   (epoca14.js avisa en la consola si no coinciden).
   La composición es la maqueta A de la hoja (juego3d/bocetos/roma.html, «el Foro al fondo, el Tíber a la izquierda»,
   AAAA, 2026-10-05): el Foro Romano mirando al Capitolio, que llena la esquina del fondo; el Tíber por el borde izquierdo
   con la isla Tiberina y el puente Fabricio; las ínsulas de la Subura detrás a la derecha; la mitad del frente, para las
   escuelas. 1 = una baldosa (20 m); x, y del motor = x, z del mundo.
   ============================================================ */
/* el Tíber: los puntos de control del eje y el ancho en cada uno; el cauce, un Catmull-Rom uniforme (8 tramos por par) */
export const TIBER = { pts: [[3.0, 0.5], [3.05, 6.0], [3.3, 10.5], [3.8, 13.6], [3.9, 16.0], [3.6, 19.5]], anchos: [2.2, 2.2, 2.4, 3.8, 4.4, 3.6] };
export function suave(pts, anchos, n = 8) {
  const out = [], aw = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t, f = (a, b, c, d) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]); aw.push(anchos[i] + (anchos[i + 1] - anchos[i]) * t);
    }
  }
  out.push(pts[pts.length - 1]); aw.push(anchos[anchos.length - 1]);
  return { pts: out, anchos: aw };
}
export const CAUCE = suave(TIBER.pts, TIBER.anchos);
/* la distancia a la orilla: negativa adentro del cauce; `eje` devuelve además el punto del eje más cercano y su rumbo */
export function distTiber(x, y) {
  const P = CAUCE.pts, A = CAUCE.anchos; let d = 1e9;
  for (let i = 0; i < P.length - 1; i++) {
    const ax = P[i][0], ay = P[i][1], vx = P[i + 1][0] - ax, vy = P[i + 1][1] - ay, L = vx * vx + vy * vy;
    const t = L ? Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / L)) : 0;
    d = Math.min(d, Math.hypot(x - ax - vx * t, y - ay - vy * t) - (A[i] + (A[i + 1] - A[i]) * t) / 2);
  }
  return d;
}
/* el eje a la altura y (el río corre a lo largo de +y): su x, su ancho y su rumbo */
export function ejeEn(y) {
  const P = CAUCE.pts, A = CAUCE.anchos;
  for (let i = 0; i < P.length - 1; i++) if (y >= P[i][1] && y <= P[i + 1][1]) {
    const k = (y - P[i][1]) / ((P[i + 1][1] - P[i][1]) || 1);
    return { x: P[i][0] + (P[i + 1][0] - P[i][0]) * k, ancho: A[i] + (A[i + 1] - A[i]) * k, dx: P[i + 1][0] - P[i][0], dy: P[i + 1][1] - P[i][1] };
  }
  return { x: P[P.length - 1][0], ancho: A[A.length - 1], dx: 0, dy: 1 };
}
export const ISLA = { x: 3.6, y: 15.45, rx: 0.86, ry: 2.38 };
export const PUENTE = { y: 15.7, x0: 3.9, x1: 6.65, ancho: 0.42 };
export const CAPITOLIO = { x0: 4.4, x1: 13.45, y0: 2.1, y1: 5.75, x: 6.85, y: 4.18 };
export const HEROE = { x: 9.6, y: 9.7 };
export const FORO = { x: 10.2, y: 10.4, r: 1.3 };
export const BASILICA = { x: 6.98, y: 10.65, w: 2.81, d: 5.41 };
export const GRADAS_BASILICA = { x: 7.45, y: 13.68 };
export const SATURNO = { x: 7.24, y: 6.85 };
export const CURIA = { x: 11.45, y: 7.35 };
export const LUDUS = { x: 15.3, y: 15.8 };
export const CALCULI = { x: 16.5, y: 13.2 };
export const GRAMMATICUS = { x: 12.6, y: 15.9 };
export const RHETOR = { x: 9.0, y: 16.6 };
export const PAGADA = { x: 16.0, y: 10.6 };
export const INSTITUTIO = { x: 13.4, y: 12.4 };
export const ORILLA = { x: 6.55, y: 16.7 };
export const ESPERA_QUINTILIANO = { x: 17.0, y: 8.8 };
export const LUGAR_QUINTILIANO = { x: 11.0, y: 14.6 };
export const MITREO = { x: 14.95, y: 6.4 };
export const HOGARES = [[15.0, 4.3], [16.5, 4.6], [14.4, 6.2], [16.4, 7.05], [7.6, 16.15]];
export const enIsla = (x, y, m = 0) => ((x - ISLA.x) / (ISLA.rx + m)) ** 2 + ((y - ISLA.y) / (ISLA.ry + m)) ** 2 < 1;
export const enPuente = (x, y) => Math.abs(y - PUENTE.y) < PUENTE.ancho / 2 && x > PUENTE.x0 && x < PUENTE.x1;
export const enTiber = (x, y) => distTiber(x, y) < 0 && !enIsla(x, y) && !enPuente(x, y);
export const enColina = (x, y, m = 0) => x > CAPITOLIO.x0 - m && x < CAPITOLIO.x1 + m && y > CAPITOLIO.y0 - m && y < CAPITOLIO.y1 + m;
export const enAgua = (x, y, m = 0) => distTiber(x, y) < m && !enIsla(x, y, -m) && !enPuente(x, y);

/* el espejo: ¿coincide con el motor? (solo en el juego, donde el motor existe) */
export function verificarEspejo() {
  if (typeof TIBER_RO === 'undefined') return;
  const pares = [[ISLA, ISLA_RO], [CAPITOLIO, CAPITOLIO_RO], [HEROE, HEROE_RO], [FORO, FORO_RO], [BASILICA, BASILICA_RO], [GRADAS_BASILICA, GRADAS_BASILICA_RO], [SATURNO, SATURNO_RO], [CURIA, CURIA_RO],
    [LUDUS, LUDUS_RO], [CALCULI, CALCULI_RO], [GRAMMATICUS, GRAMMATICUS_RO], [RHETOR, RHETOR_RO], [PAGADA, PAGADA_RO], [INSTITUTIO, INSTITUTIO_RO], [ORILLA, ORILLA_RO],
    [ESPERA_QUINTILIANO, ESPERA_QUINTILIANO_RO], [LUGAR_QUINTILIANO, LUGAR_QUINTILIANO_RO], [MITREO, MITREO_RO]];
  for (const [a, b] of pares) if (Math.abs(a.x - b.x) > 1e-6 || Math.abs(a.y - b.y) > 1e-6) console.warn('roma/lugares no coincide con 09i-roma', a, b);
  const igual = (u, v) => JSON.stringify(u) === JSON.stringify(v);
  if (!igual(TIBER, TIBER_RO) || !igual(PUENTE, PUENTE_RO) || !igual(HOGARES, HOGARES_RO) || ISLA.rx !== ISLA_RO.rx || ISLA.ry !== ISLA_RO.ry || CAPITOLIO.x1 !== CAPITOLIO_RO.x1 || CAPITOLIO.y1 !== CAPITOLIO_RO.y1)
    console.warn('el Tíber, la isla, el puente, el Capitolio o las casas de roma/lugares no coinciden con 09i-roma');
}
