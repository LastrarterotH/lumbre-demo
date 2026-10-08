/* ============================================================
   10-recorridos
   Los circuitos por donde pasea el clan, el aprendiz que mira a las recolectoras y el ir y venir de la cueva.
   ============================================================ */
function crearRecorrido(pts) { // un circuito de paseo: devuelve la posición a lo largo del camino cerrado
  const L = [], A = [0];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    L.push(Math.hypot(b[0] - a[0], b[1] - a[1]));
    A.push(A[i] + L[i]);
  }
  const total = A[pts.length];
  // LA MIRADA DE CADA TRAMO, decidida una sola vez. En isométrico el avance horizontal en pantalla es
  // (dx − dy): su signo dice si el caminante mira a izquierda o derecha. Pero hay tramos que suben o bajan
  // casi en vertical de pantalla, y ahí ese valor es casi cero: puro ruido. Decidir la mirada con él dejaba
  // al clan andando de espaldas por tramos enteros (posFogonD tenía uno de −0.2 y otro de 0 exacto).
  // En esos tramos se hereda la mirada del tramo anterior: quien venía mirando a la izquierda, sigue.
  const DIRS = pts.map((_, i) => {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const h = (b[0] - a[0]) - (b[1] - a[1]);
    return Math.abs(h) < 0.45 ? null : (h > 0 ? 1 : -1);
  });
  let ult = DIRS.find(d => d !== null) || 1;
  for (let v = 0; v < 2; v++) DIRS.forEach((d, i) => { if (d === null) DIRS[i] = ult; else ult = d; }); // 2 vueltas: el circuito es cerrado
  const fn = dist => {
    dist = ((dist % total) + total) % total;
    let i = 0;
    while (dist > A[i + 1]) i++;
    const f = (dist - A[i]) / L[i];
    const a = pts[i], b = pts[(i + 1) % pts.length];
    return { x: lerp(a[0], b[0], f), y: lerp(a[1], b[1], f), dx: b[0] - a[0], dy: b[1] - a[1], dir: DIRS[i] };
  };
  fn.total = total;
  fn.arco = i => A[((i % pts.length) + pts.length) % pts.length]; // la distancia de arco del nodo i: para salir del circuito POR un nodo, no cortando por dentro
  /* SALIR POR UN NODO (2026-09-06): quien se va a casa al anochecer no debe cortar en línea recta por
     el interior del circuito (cruzaba el templo y los tronos de los colosos, dibujado encima). Esta
     función lleva al caminante POR el circuito hasta el nodo de salida mientras `k` va de 0 a `kSal`,
     y de ahí en línea recta al destino: continua en el tiempo (a k = 0 es el paseo normal). */
  fn.salida = (u, nodo, destino, k, kSal = 0.55) => {
    const uu = ((u % total) + total) % total, ahead = ((A[nodo] - uu) + total) % total;
    if (k < kSal) return fn(u + ahead * smooth(k / kSal));
    const e = pts[nodo], f2 = smooth((k - kSal) / (1 - kSal));
    return { x: lerp(e[0], destino[0], f2), y: lerp(e[1], destino[1], f2), dir: (destino[0] - e[0] - (destino[1] - e[1])) >= 0 ? 1 : -1 };
  };
  return fn;
}
const posEnLoop = crearRecorrido([
  [4, 16.2], [6, 13], [8, 10.2], [9.45, 8.75],
  [8, 10.2], [6.4, 9.5], [5.4, 10.1],
  [6.2, 11.2], [5.2, 13.6]
]);
const posEnLoopEste = crearRecorrido([ // el paseo del ala nueva (era 3)
  [12.3, 6.2], [15.0, 5.4], [17.6, 5.55], [18.75, 7.6], [17.6, 9.9], [15.2, 8.15], [13.4, 7.35]
]);
// SUMER: la ciudad vive pegada al agua, y su paseo lo dice: la plaza de la edubba, el borde norte del
// canal madre (sin cruzarlo: los circuitos de la Época 1 lo atravesaban a pie) y la subida por la
// ribera de barro pisado (a 1,8-1,9 del eje de RIO_SUMER: sobre el barro, nunca en el agua).
// Validado punto a punto y por tramos muestreados contra el cauce (agua < 1,5), los tres canales
// (< 0,45) y cada edificio y sentadito de la época (< 0,38): cero choques.
const posSumer = crearRecorrido([
  [9.5, 9.0], [8.3, 8.9], [6.4, 9.5], [5.4, 10.1], [6.6, 10.9], [9.2, 10.55], [11.6, 10.3],
  [13.9, 10.0], [14.55, 9.11], [15.55, 7.93], [15.4, 7.0], [13.4, 7.6], [12.6, 9.7], [10.7, 10.35]
]);
/* EGIPTO: la ronda del agua y la escuela (2026-08-24). El paseo bordea la vega por el norte del
   Nilo (siempre a más de ~2,5 del eje: en la crecida el agua llega a ~2,3), rodea el claro de la
   Kemyt y vuelve por el sur de la explanada, esquivando la arena del coloso oeste, las estacas de
   la cuerda, los lindes y la esfinge. Antes la era 3 usaba posEnLoop (¡el circuito del fogón!) y
   la multitud se estacionaba sobre la explanada de la Casa: lo cazó el audit de etapas. */
const posEgipto = crearRecorrido([
  [8.05, 9.0], [6.3, 10.3], [5.0, 12.0], [7.35, 12.95], [10.15, 12.25],
  [12.35, 11.15], [11.7, 9.7], [12.6, 8.55], [12.4, 6.4], [10.6, 8.6]
]);
/* ATENAS: la ronda del ágora. Sale de la plaza por el sur, baja a la vega del Ilisos, pasa junto al
   plátano, sube por el este bordeando la palestra y vuelve a la plaza por delante de la stoa. Nunca
   pisa la stoa (8-11,2 · 5,5-6,7), la plaza empedrada (que es donde se para a conversar), la palestra
   ni el olivar. Validado contra el cauce (agua < 1,1). */
const posAgora = crearRecorrido([
  [8.2, 9.6], [7.0, 10.6], [6.6, 12.2], [8.4, 13.4], [10.6, 13.3], [12.6, 12.0],
  [13.4, 10.4], [12.4, 9.4], [12.9, 7.6], [11.9, 7.1], [10.4, 7.2]
]);
/* LA VIÑETA DEL PADRE (era3-plan: la Sátira de los oficios, VIVIDA). Cada ~2,5 min un padre entra
   por el borde este trayendo a su hijo de la mano, lo planta frente al patio de las lascas, ambos
   miran el oficio un rato, y vuelven. El texto existía exactamente para esto: convencer a los
   padres de que no hay oficio como el del escriba (la Enseñanza de Jety, en Lichtheim vol. I). */
const CICLO_PADRE = 150;
const RUTA_PADRE = [[17.9, 6.5], [15.2, 6.3], [12.6, 6.55], [11.05, 7.05]];
function posPadreHijo(t) {
  const cyc = ((t / CICLO_PADRE) % 1 + 1) % 1;
  const tramo = f => { // posición a lo largo de la ruta (0..1), con la mirada del tramo
    const n = RUTA_PADRE.length - 1, ft = Math.min(0.999, f) * n, i = Math.floor(ft), k = ft - i;
    const a = RUTA_PADRE[i], b = RUTA_PADRE[i + 1];
    return { x: lerp(a[0], b[0], k), y: lerp(a[1], b[1], k) };
  };
  let p, dir, mira = 0, alpha = 1;
  if (cyc < 0.18) { p = tramo(smooth(cyc / 0.18)); dir = -1; alpha = Math.min(1, cyc / 0.03); }        // llegan de la mano
  else if (cyc < 0.34) { p = tramo(1); dir = -1; mira = 1; }                                            // miran el patio: la lección del padre es mostrar
  else if (cyc < 0.52) { p = tramo(smooth(1 - (cyc - 0.34) / 0.18)); dir = 1; alpha = Math.min(1, (0.52 - cyc) / 0.03); } // vuelven a casa
  else return null;                                                                                     // el resto del ciclo, no están
  return { ...p, dir, mira, alpha };
}
function drawPadreHijo(t) {
  const q = posPadreHijo(t);
  if (!q || q.alpha <= 0.02) return;
  const s = zoom, p = P(q.x, q.y), paso = q.mira ? 0 : Math.sin(t * 7) * 1.1 * s;
  g.save(); g.globalAlpha = q.alpha;
  ellipse({ x: p.x, y: p.y }, 7 * s, 2.6 * s, sombraHoy);
  g.save(); g.translate(p.x, p.y); if (q.dir < 0) g.scale(-1, 1);
  // EL PADRE: túnica larga de artesano, la mano tendida hacia atrás
  poly([{ x: -2.6 * s, y: 0 }, { x: -1.6 * s, y: -8.5 * s }, { x: 1.8 * s, y: -8.3 * s }, { x: 2.6 * s, y: 0 }], '#d9c8a4');
  dot({ x: 0.2 * s, y: -10.4 * s }, 2 * s, '#3a2e20');
  g.strokeStyle = '#3a2e20'; g.lineWidth = 1 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-1.2 * s, -1.6 * s); g.lineTo(-1.2 * s + paso, 0); g.stroke();               // las piernas
  g.beginPath(); g.moveTo(1.2 * s, -1.6 * s); g.lineTo(1.2 * s - paso, 0); g.stroke();
  g.strokeStyle = '#b09068'; g.lineWidth = 0.9 * s;
  g.beginPath(); g.moveTo(2 * s, -6 * s); g.lineTo(4.6 * s, -4.2 * s); g.stroke();                     // el brazo hacia el hijo
  // EL HIJO: chico, medio paso atrás, de la mano
  g.translate(6.2 * s, 0);
  poly([{ x: -1.6 * s, y: 0 }, { x: -1 * s, y: -5 * s }, { x: 1.2 * s, y: -4.9 * s }, { x: 1.6 * s, y: 0 }], '#e8dcc4');
  dot({ x: 0.1 * s, y: -6.3 * s }, 1.5 * s, '#2e241a');
  g.strokeStyle = '#2e241a'; g.lineWidth = 0.85 * s;
  g.beginPath(); g.moveTo(-0.8 * s, -1.2 * s); g.lineTo(-0.8 * s - paso, 0); g.stroke();
  g.beginPath(); g.moveTo(0.8 * s, -1.2 * s); g.lineTo(0.8 * s + paso, 0); g.stroke();
  g.beginPath(); g.moveTo(-1.4 * s, -4 * s); g.lineTo(-2 * s, -4.6 * s); g.stroke();                   // su bracito, tomado
  if (q.mira) { g.strokeStyle = '#8a6a4a'; g.lineWidth = 0.9 * s; g.beginPath(); g.moveTo(-4.6 * s, -10.2 * s); g.lineTo(-7.2 * s, -8.8 * s); g.stroke(); } // el padre SEÑALA el patio (volviendo al marco del padre: aproximado en el del hijo espejado)
  g.restore(); g.restore();
}
// la prehistoria: tres circuitos por distintas zonas para que el clan no ande todo en fila
// OJO: este circuito pasaba POR DENTRO del corral y el clan atravesaba la reja. Va por fuera: el cerco
// máximo es (11.5,10.6)-(13.65,12.51), así que el paseo lo rodea por el norte, el este y el sur.
// OJO: el vértice de vuelta estaba en (14.4, 14.0), que cae DENTRO de la laguna: el 12% de este
// circuito transcurría sobre el agua y el clan cruzaba caminando por encima. Ahora vuelve por el
// norte de la orilla (13.6, 12.5), medido a 0% de agua contra la forma real del lago.
const posFogonB = crearRecorrido([[11.0, 8.6], [14.3, 9.6], [15.5, 12.0], [13.6, 12.5], [10.9, 13.4], [10.2, 10.4]]);
const posFogonC = crearRecorrido([[6, 15], [9, 15.6], [12, 15], [13.4, 13.2], [10, 13.6], [7, 13.2]]);
const posFogonD = crearRecorrido([[3.6, 7], [5.2, 5.6], [6.6, 7.2], [5.2, 8.6]]);        // vueltita chica al noroeste
const posFogonE = crearRecorrido([[12, 7.4], [13.6, 8.4], [12.6, 9.8], [11, 8.8]]);        // vueltita chica al este, por encima del corral
const LOOPS_FOGON = [posEnLoop, posFogonB, posFogonC, posFogonD, posFogonE];
/* EL APRENDIZ QUE MIRA. Es la razón, hecha escena, de que el saber suba aunque no hagas nada: nadie le
   da una lección, se arrima a quien sabe, la mira un rato y repite el gesto medio paso por detrás y peor.
   Es lo que documenta Lew-Levy et al. 2017 (la cuadrilla multiedad que aprende por juego, observación y
   participación), y por eso el retraso del gesto NO se corrige: ese retraso es la lección.
   De noche no ocurre: en la velada el clan está sentado al fuego, aprendiendo de otra manera. */
const CICLO_APRENDIZ = 27;
function aprendizDe(gx, gy, ph, t) {
  const cyc = ((t / CICLO_APRENDIZ + ph * 0.37) % 1);
  if (cyc > 0.86) return null;                                    // el resto del rato anda en su cuadrilla
  const desde = [gx - 1.5, gy + 1.1];                             // llega desde el lado del fuego
  const junto = [gx - 0.62, gy + 0.28];
  let x, y, mira = 0, imita = 0;
  if (cyc < 0.14) { const f = smooth(cyc / 0.14); x = lerp(desde[0], junto[0], f); y = lerp(desde[1], junto[1], f); }
  else if (cyc < 0.46) { x = junto[0]; y = junto[1]; mira = 1; }  // el rato de mirar, quieto: la observación
  else if (cyc < 0.78) { x = junto[0]; y = junto[1]; imita = 1; } // y ahora prueba a hacerlo él
  else { const f = smooth((cyc - 0.78) / 0.08); x = lerp(junto[0], desde[0], f); y = lerp(junto[1], desde[1], f); }
  const borde = cyc < 0.06 ? cyc / 0.06 : cyc > 0.80 ? Math.max(0, (0.86 - cyc) / 0.06) : 1;
  return { x, y, mira, imita, alpha: borde };
}
function drawRecolectora(x, y, ph, t) { // un miembro del clan que se agacha a juntar bayas
  const s = zoom, dip = Math.max(0, Math.sin(t * 1.2 + ph)) * 5 * s, scr = P(x, y);
  const bx = scr.x + 7.5 * s;
  g.strokeStyle = '#7d8b4a'; g.lineWidth = 1.2 * s; g.lineCap = 'round';
  for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(bx + k * 2 * s, scr.y); g.lineTo(bx + k * 2.6 * s, scr.y - 5 * s); g.stroke(); }
  dot({ x: bx, y: scr.y - 4 * s }, 1.1 * s, '#c94f43'); dot({ x: bx + 1.6 * s, y: scr.y - 3 * s }, 1 * s, '#c94f43');
  drawAlumno(scr.x, scr.y + dip, 1, t * 0.3 + ph, ph | 0);
}
/* LA ORILLA. Dos del clan sentados frente al agua: uno que sabe y uno que mira. No hay mecánica ni
   recompensa detrás, y es a propósito: la pesca todavía no es un saber del juego (está anotada en
   docs/pendientes.md). Lo que sí hace esta escena es enseñar lo contrario que la cacería. Allí el
   aprendizaje es coreografía: roles, señales, cerco. Aquí es quietud, uno al lado del otro, y una
   técnica que vive en un objeto en vez de en un grupo. El pequeño no pesca: aprende a esperar.
   Van en la orilla SUROESTE, comprobado fuera del agua con sobreElLago(). */
// El que pesca y la que mira. Separados en (x−y), que es lo que aleja en horizontal en isométrico,
// y a la misma profundidad (x+y): así se leen como dos personas sentadas juntas y no como una sola.
const PESCA = { x: 13.1, y: 15.9, ax: 12.6, ay: 16.2 };
/* LOS SITIOS QUE SE HACEN. Kelo y Ami siguen ahí pase lo que pase (esa escena no es mecánica, es la
   tesis dibujada). Estas cuatro parejas son las que abre el saber: un mayor y, medio paso al lado, el
   pequeño que ya pesca. Repartidas por la orilla oeste, norte y sur, todas comprobadas fuera del agua
   con sobreElLago(); el pequeño va a (−0,45, +0,3) del mayor, la misma separación que Ami de Kelo. */
const DIADAS = [
  { x: 12.4, y: 14.6 },   // la orilla oeste
  { x: 13.1, y: 13.3 },   // el recodo del norte
  { x: 14.2, y: 16.2 },   // al sur, cerca de Kelo
  { x: 16.2, y: 16.1 }    // el extremo sureste
];
function drawPescador(t) { drawPescadorEn(PESCA.x, PESCA.y, 0, t); }
// La caña apunta AL AGUA desde donde esté sentado cada uno: se interpola hacia el centro de la laguna en
// coordenadas del MUNDO, no con desplazamientos de pantalla (en isométrico el agua no está "a la derecha",
// está donde diga P()). Con los factores 0,32 y 0,62 la caña de Kelo queda donde estaba antes al píxel.
const haciaElAgua = (x, y, f, z) => P(x + (LAGO.cx - x) * f, y + (LAGO.cy - y) * f, z);
function drawPescadorEn(x, y, seed, t) {
  const s = zoom, p = P(x, y);
  drawSentadito(x, y, seed % 3 === 0 ? 1 : seed % 3, t);
  const mano = { x: p.x + 3 * s, y: p.y - 6 * s };
  const punta = haciaElAgua(x, y, 0.32, 26);    // la caña se alza sobre el agua
  const flota = haciaElAgua(x, y, 0.62, -8);    // el flotador, en la superficie
  line(mano, punta, '#8a6a44', 1.5 * s);
  const pico = Math.max(0, Math.sin(t * 0.31 + seed * 1.7) - 0.93) * 14;  // raro y breve: casi nunca pica
  const flotX = flota.x, flotY = flota.y + Math.sin(t * 1.6) * 1.2 * s + pico * s;
  line(punta, { x: flotX, y: flotY }, 'rgba(240,248,255,.55)', 0.9 * s);
  dot({ x: flotX, y: flotY }, 1.9 * s, '#c94f43');
  if (pico > 0.4) { // las ondas del tirón
    g.save(); g.globalAlpha *= Math.min(0.5, pico * 0.5); g.strokeStyle = 'rgba(235,250,255,.9)'; g.lineWidth = 1.1 * s;
    for (const rr of [4, 8]) { g.beginPath(); g.ellipse(flotX, flotY + 2 * s, rr * s, rr * 0.4 * s, 0, 0, 7); g.stroke(); }
    g.restore();
  }
}
/* El pequeño de la díada no solo mira: sostiene su propia caña, más corta, y su gesto va MEDIO
   SEGUNDO por detrás del mayor y con el pulso que aún tiembla: el retraso es la lección, el mismo
   principio del aprendiz de las recolectoras. Sin pico: sacar el pez es asunto de quien enseña. */
function drawPescadorcitoEn(x, y, seed, t) {
  const s = zoom, p = P(x, y);
  drawSentadito(x, y, (seed + 1) % 3, t);
  const tt = t - 0.5;
  const tiembla = Math.sin(tt * 3.1 + seed * 2.2) * 0.8 * s;
  const mano = { x: p.x + 2.4 * s, y: p.y - 5 * s };
  const punta = haciaElAgua(x, y, 0.2, 18);
  const flota = haciaElAgua(x, y, 0.4, -8);
  line(mano, { x: punta.x + tiembla, y: punta.y }, '#8a6a44', 1.2 * s);
  const fx2 = flota.x + tiembla, fy2 = flota.y + Math.sin(tt * 1.6 + seed) * 1.6 * s;
  line({ x: punta.x + tiembla, y: punta.y }, { x: fx2, y: fy2 }, 'rgba(240,248,255,.5)', 0.8 * s);
  dot({ x: fx2, y: fy2 }, 1.5 * s, '#c94f43');
}
/* LA ORILLA SUBE DE NIVEL Y SE VE (máxima del proyecto, validada por diff de píxeles). Sin esto,
   perfeccionar la pesca solo abría un sitio: el mundo no cambiaba y el saber se sentía decorativo.
   Cada etapa trae una pieza, y las tres cuentan la misma historia que sus SUBHIST: primero la técnica se
   vuelve provisión (el secadero), después vive en objetos que se prestan (la nasa y los cestos) y al
   final sale a mar abierto, que es literalmente lo que dice el paper de Jerimalai: peces pelágicos. */
function drawOrillaNivel(t) {
  const n = nivelTec(28), s = zoom;
  if (n >= 1) nacerEn('secadero', e => {           // varas cruzadas y pescados puestos a secar
    for (const [ax, ay, bx, by, nPez, alto] of [[11.75, 15.2, 12.85, 15.75, 5, 38], [12.0, 14.75, 12.9, 15.15, 3, 30]]) {
      const a = P(ax, ay), b = P(bx, by);
      line({ x: a.x, y: a.y }, { x: a.x, y: a.y - alto * s * e }, '#8a6a44', 2 * s);
      line({ x: b.x, y: b.y }, { x: b.x, y: b.y - alto * s * e }, '#8a6a44', 2 * s);
      line({ x: a.x, y: a.y - (alto - 2) * s * e }, { x: b.x, y: b.y - (alto - 2) * s * e }, '#7a5636', 1.6 * s);
      for (let i = 0; i < nPez; i++) {             // la pesca de ayer, colgada
        const k = i / (nPez - 1), px = a.x + (b.x - a.x) * k, py = a.y + (b.y - a.y) * k - (alto - 2) * s * e;
        const balanceo = Math.sin(t * 1.1 + i) * 0.9 * s;
        g.save(); g.translate(px + balanceo, py + 10 * s * e); g.rotate(0.12 * Math.sin(t * 0.9 + i));
        g.fillStyle = i % 2 ? '#9fb3bd' : '#8ea6b2';
        g.beginPath(); g.ellipse(0, 0, 3.4 * s * e, 7.4 * s * e, 0, 0, 7); g.fill();
        g.fillStyle = 'rgba(255,255,255,.35)';
        g.beginPath(); g.ellipse(-1 * s * e, -1.5 * s * e, 1.2 * s * e, 3 * s * e, 0, 0, 7); g.fill();  // el brillo del lomo
        poly([{ x: -3.1 * s * e, y: 7 * s * e }, { x: 0, y: 11.5 * s * e }, { x: 3.1 * s * e, y: 7 * s * e }], '#7d95a1'); // la cola
        g.restore();
      }
    }
  });
  if (n >= 2) {
    nacerEn('nasa', e => {                          // la trampa calada en el agua: la técnica ya vive en un objeto
      const q = P(13.9, 15.2, -6);
      g.save(); g.translate(q.x, q.y); g.scale(e, e);
      g.fillStyle = 'rgba(168,144,78,.35)';
      g.beginPath(); g.ellipse(0, -3 * s, 11 * s, 7 * s, 0, 0, 7); g.fill();   // el cuerpo de la nasa, tejido y traslúcido
      g.strokeStyle = '#a8904e'; g.lineWidth = 1.3 * s;
      g.beginPath(); g.ellipse(0, 0, 11 * s, 5 * s, 0, 0, 7); g.stroke();
      g.beginPath(); g.ellipse(0, -6 * s, 8 * s, 3.6 * s, 0, 0, 7); g.stroke();
      g.beginPath(); g.ellipse(0, -11 * s, 4 * s, 2 * s, 0, 0, 7); g.stroke();  // la boca, estrecha: entran y no salen
      for (let i = 0; i < 8; i++) { const ax = -10 * s + i * 2.9 * s; line({ x: ax, y: 2 * s }, { x: ax * 0.35, y: -11 * s }, '#cdb877', 1 * s); }
      g.strokeStyle = '#8a6a44'; g.lineWidth = 1 * s;
      g.beginPath(); g.moveTo(9 * s, -8 * s); g.lineTo(20 * s, -20 * s); g.stroke();  // el cabo que la amarra a la orilla
      g.restore();
    });
    nacerEn('cestos', e => {                        // los cestos del día, junto a quien pesca
      for (const [cx, cy, r] of [[12.65, 16.25, 1], [12.25, 15.95, 0.78]]) {
        const q = P(cx, cy);
        ellipse({ x: q.x, y: q.y }, 8.5 * r * s * e, 3.8 * r * s * e, '#7a5636');
        ellipse({ x: q.x, y: q.y - 3.4 * r * s * e }, 8 * r * s * e, 3.5 * r * s * e, '#a8904e');
        ellipse({ x: q.x, y: q.y - 4.6 * r * s * e }, 6.6 * r * s * e, 2.8 * r * s * e, '#8f7a3f');
        dot({ x: q.x - 2.2 * r * s, y: q.y - 6 * r * s * e }, 2.4 * r * s * e, '#9fb3bd');
        dot({ x: q.x + 2.4 * r * s, y: q.y - 5.4 * r * s * e }, 2.1 * r * s * e, '#8ea6b2');
        dot({ x: q.x + 0.2 * r * s, y: q.y - 7 * r * s * e }, 1.9 * r * s * e, '#aebfc8');
      }
    });
  }
  if (n >= 3) nacerEn('canoa', e => {               // varada en la orilla: la pesca sale a mar abierto
    const q = P(15.6, 16.0, -2);
    g.save(); g.translate(q.x, q.y); g.rotate(-0.2); g.scale(e, e);
    ellipse({ x: 0, y: 5 * s }, 26 * s, 5 * s, 'rgba(20,32,14,.2)');                 // su sombra en la arena
    poly([{ x: -25 * s, y: -1 * s }, { x: -18 * s, y: -8 * s }, { x: 18 * s, y: -8 * s }, { x: 25 * s, y: -1 * s }, { x: 18 * s, y: 4.5 * s }, { x: -18 * s, y: 4.5 * s }], '#7a5636');
    poly([{ x: -19 * s, y: -6 * s }, { x: 19 * s, y: -6 * s }, { x: 15 * s, y: 0.5 * s }, { x: -15 * s, y: 0.5 * s }], '#4f3a26'); // el hueco
    poly([{ x: -25 * s, y: -1 * s }, { x: -18 * s, y: -8 * s }, { x: -16 * s, y: -6 * s }, { x: -22 * s, y: -0.5 * s }], '#8a6a44'); // la proa iluminada
    for (let i = 0; i < 3; i++) line({ x: (-12 + i * 12) * s, y: -6 * s }, { x: (-12 + i * 12) * s, y: 0.5 * s }, '#5f4630', 1.4 * s); // las cuadernas
    line({ x: -10 * s, y: -7 * s }, { x: 16 * s, y: -22 * s }, '#8a6a44', 2 * s);    // el remo apoyado
    poly([{ x: 15 * s, y: -21 * s }, { x: 20 * s, y: -25 * s }, { x: 21 * s, y: -22 * s }, { x: 16 * s, y: -19 * s }], '#a3805c'); // su pala
    g.restore();
  });
}
function caveVisitor(t, ph) { // un miembro del clan entra y sale del abrigo rocoso
  const T = 15, cyc = ((t * 0.5 + ph) % T) / T;
  const boca = [9.7, 7.5], casa = [12.8, 11.2];
  let x, y, dir;
  if (cyc < 0.30) { const f = smooth(cyc / 0.30); x = lerp(casa[0], boca[0], f); y = lerp(casa[1], boca[1], f); dir = -1; }
  else if (cyc < 0.50) { x = boca[0]; y = boca[1]; dir = -1; }              // adentro
  else if (cyc < 0.82) { const f = smooth((cyc - 0.50) / 0.32); x = lerp(boca[0], casa[0], f); y = lerp(boca[1], casa[1], f); dir = 1; }
  else { x = casa[0]; y = casa[1]; dir = 1; }                               // pausa afuera
  const alpha = Math.min(1, Math.hypot(x - boca[0], y - boca[1]) * 2.2);    // se desvanece al entrar/salir
  return { x, y, dir, alpha };
}
// dónde se APLICA cada saber de la época 1: los +1 de aprendizaje nacen de estas escenas
const ESCENAS_SABER = []; // DERIVADA de la ficha única (T.escena en 01-balance)
BALANCE.tecnologias.forEach((T, i) => { if (T.escena) ESCENAS_SABER.push({ i, ...T.escena }); });
// la chispa de curiosidad: aparece sola y al tocarla suma aprendizaje
let colectibles = [], nextColect = 10, tFrame = 0, __animPrev = null;
let guiaProg = null, camTween = null; // la guía de "qué sigue": clic en la línea de progreso y la cámara te lleva
const pensadorWalk = {}, pensadorEstAnt = {}, pensadorPosAnt = {}; // los pensadores llegan y se mudan CAMINANDO, nunca de golpe
