/* ============================================================
   09-egipto
   Época 3, Egipto, y los monumentos grandes: esfinge, colosos, pirámides, lamassu. El demo no lo usa.
   ============================================================ */
function drawToldo(t) { // la sombra de cañas del patio, donde se dicta
  const s = zoom;
  const e = [P(9.5, 8.1, 0), P(10.95, 8.1, 0), P(10.95, 9.05, 0), P(9.5, 9.05, 0)];
  const a = [P(9.5, 8.1, 15), P(10.95, 8.1, 15), P(10.95, 9.05, 11), P(9.5, 9.05, 11)];
  for (let k = 0; k < 4; k++) line(e[k], a[k], '#8a6a4a', 1.2 * s);                   // los postes
  poly(a, 'rgba(226,208,160,.42)');                                                   // la lona de caña, translúcida: los escribas se VEN debajo (2026-08-05)
  g.strokeStyle = 'rgba(138,106,74,.28)'; g.lineWidth = 0.8 * s;
  for (let k = 1; k < 4; k++) { // las cañas
    const t0 = { x: a[0].x + (a[1].x - a[0].x) * k / 4, y: a[0].y + (a[1].y - a[0].y) * k / 4 };
    const t1 = { x: a[3].x + (a[2].x - a[3].x) * k / 4, y: a[3].y + (a[2].y - a[3].y) * k / 4 };
    g.beginPath(); g.moveTo(t0.x, t0.y); g.lineTo(t1.x, t1.y); g.stroke();
  }
}
function drawLotos(t) { // flores de loto sobre el agua
  for (const [lx, ly, ph] of [[14.2, 14.1, 0], [15.5, 14.9, 2.2], [14.7, 15.35, 4.4]]) {
    const p = P(lx, ly, -8), s = zoom, bob = Math.sin(t * 0.9 + ph) * 0.8 * s;
    ellipse({ x: p.x - 2.2 * s, y: p.y + bob }, 2.7 * s, 1.2 * s, '#5f8c3e');         // la hoja
    const fy = p.y - 1.2 * s + bob, fx = p.x + 1.6 * s;
    poly([{ x: fx - 0.8 * s, y: fy }, { x: fx - 2 * s, y: fy - 2.4 * s }, { x: fx - 0.2 * s, y: fy }], '#e8a8c8'); // los pétalos
    poly([{ x: fx - 0.5 * s, y: fy }, { x: fx, y: fy - 3 * s }, { x: fx + 0.5 * s, y: fy }], '#f2c9d8');
    poly([{ x: fx + 0.2 * s, y: fy }, { x: fx + 2 * s, y: fy - 2.4 * s }, { x: fx + 0.8 * s, y: fy }], '#e8a8c8');
  }
}
function drawPapiros(x, y, ph, t) { // la mata de papiros de la orilla
  sombra(x, y + 0.04, 7, 3);
  const p = P(x, y), s = zoom, v = Math.sin(t * 1.1 + ph) * 1.5 * s;
  const tops = [];
  g.strokeStyle = '#679a43'; g.lineWidth = 1.2 * s; g.lineCap = 'round';
  for (let k = -1; k <= 1; k++) { // los tallos
    const tx = p.x + k * 2.6 * s + v, ty = p.y - (13 - Math.abs(k) * 2.5) * s;
    g.beginPath(); g.moveTo(p.x + k * 1.5 * s, p.y);
    g.quadraticCurveTo(p.x + k * 2 * s, p.y - 7 * s, tx, ty); g.stroke();
    tops.push([tx, ty]);
  }
  g.lineWidth = 0.7 * s;
  for (const [tx, ty] of tops) for (let rr = 0; rr < 5; rr++) { // el copete en abanico
    const a = -Math.PI / 2 + (rr - 2) * 0.5;
    g.beginPath(); g.moveTo(tx, ty);
    g.lineTo(tx + Math.cos(a) * 3.4 * s, ty + Math.sin(a) * 3.4 * s); g.stroke();
  }
}
function drawGarza(t) { // la garza del Nilo, pescando con paciencia de escriba
  const p = P(15.9, 14.6), s = zoom;   // en la orilla mojada: hasta el 2026-08-24 pescaba a 3,2 del eje, en pleno desierto
  ellipse({ x: p.x, y: p.y }, 4 * s, 1.7 * s, sombraHoy);
  const pico = (Math.sin(t * 0.7) > 0.3) ? Math.max(0, Math.sin(t * 5)) * 3 * s : 0;
  line({ x: p.x - 0.8 * s, y: p.y }, { x: p.x - 0.8 * s, y: p.y - 6 * s }, '#e8e4da', 1 * s); // las zancas
  line({ x: p.x + 1 * s, y: p.y }, { x: p.x + 1 * s, y: p.y - 6 * s }, '#e8e4da', 1 * s);
  g.fillStyle = '#f2efe6';
  g.beginPath(); g.ellipse(p.x, p.y - 8 * s, 4.2 * s, 2.6 * s, -0.15, 0, 7); g.fill();        // el cuerpo
  g.strokeStyle = '#f2efe6'; g.lineWidth = 1.4 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(p.x + 3 * s, p.y - 9.5 * s);                                        // el cuello en S
  g.quadraticCurveTo(p.x + 5.5 * s, p.y - 12 * s, p.x + 5 * s, p.y - 14.5 * s + pico); g.stroke();
  dot({ x: p.x + 5 * s, y: p.y - 14.5 * s + pico }, 1.5 * s, '#f2efe6');                      // la cabeza
  g.strokeStyle = '#e8a51e'; g.lineWidth = 0.9 * s;
  g.beginPath(); g.moveTo(p.x + 6.2 * s, p.y - 14.3 * s + pico); g.lineTo(p.x + 9 * s, p.y - 12.8 * s + pico * 1.6); g.stroke(); // el pico
  dot({ x: p.x + 5.6 * s, y: p.y - 15 * s + pico }, 0.4 * s, '#3a2c1c');
}
function posBarcaNilo(t) { // dónde va la barca AHORA, en coordenadas de mundo (para su profundidad y su clic)
  const ciclo = 96, f = ((t % ciclo) + ciclo) % ciclo, baja = f < ciclo / 2;
  const u = baja ? (f / (ciclo / 2)) : (1 - (f - ciclo / 2) / (ciclo / 2));
  const uu = 0.25 + u * 0.52, perp = Math.sin(t * 0.15) * 0.25;   // solo el tramo del río que se ve: el eje nace y muere fuera del mundo
  const dx = NILO.bx - NILO.ax, dy = NILO.by - NILO.ay, L = Math.hypot(dx, dy);
  const m = ejeNilo(uu);
  return { x: m.x + (-dy / L) * perp, y: m.y + (dx / L) * perp, u: uu, baja };
}
function drawFalua(t) {
  /* LA BARCA DEL NILO (rehecha el 2026-08-25: «una barcaza toda picante, y que no hace nada»). La
     anterior era un cucurucho de arena con un triángulo blanco, clavada en un punto y meciéndose.
     Esta es una barca fluvial egipcia: casco de tablones cosidos con la proa y la popa levantadas en
     papiro, vela cuadrada en su verga, timonel a la espadilla y carga de jarras. Y NAVEGA: baja con
     la corriente hasta el fondo del valle y vuelve a la sirga, como la barca viajera de Sumer. */
  const s = zoom, nav = posBarcaNilo(t), baja = nav.baja;   // minuto y medio largo por travesía
  const dir = baja ? 1 : -1;                               // aguas abajo va a favor; de vuelta, contra
  const p = P(nav.x, nav.y, -6);
  const bob = Math.sin(t * 1.1) * 1.0 * s;
  g.save(); g.translate(p.x, p.y + bob);
  // la estela: se abre por detrás, del lado que corresponde a la marcha
  g.save(); g.globalAlpha = 0.30; g.strokeStyle = '#e8f4f8'; g.lineWidth = 1.2 * s; g.lineCap = 'round';
  for (const k of [0, 1, 2]) {
    const off = (18 + k * 9) * s * dir, ab = (2.6 + k * 2.2) * s;
    g.beginPath(); g.moveTo(-off, ab * 0.4); g.quadraticCurveTo(-off * 0.5, ab, 0, 1.4 * s); g.stroke();
    g.beginPath(); g.moveTo(-off, -ab * 0.2); g.quadraticCurveTo(-off * 0.5, -ab * 0.7, 0, 0.6 * s); g.stroke();
  }
  g.restore();
  g.scale(dir, 1);                                          // la barca se da vuelta al remontar
  // CASCO: tablones cosidos, con la proa y la popa alzadas en flor de papiro
  const CASCO = '#b98d55', CASCO_L = '#cfa269', CASCO_D = '#8a6238', LINO = '#f2ede0', LINO_S = '#ddd4c0';
  g.fillStyle = CASCO;
  g.beginPath();
  g.moveTo(-15 * s, -3.4 * s);
  g.quadraticCurveTo(0, 3.2 * s, 15 * s, -3.4 * s);         // la panza
  g.quadraticCurveTo(17.5 * s, -5.6 * s, 17 * s, -9.5 * s); // la roda de proa, curvada hacia dentro
  g.quadraticCurveTo(15.5 * s, -7 * s, 13.5 * s, -5.2 * s);
  g.quadraticCurveTo(0, -1.4 * s, -13.5 * s, -5.2 * s);
  g.quadraticCurveTo(-15.5 * s, -7.6 * s, -16.5 * s, -10.5 * s); // el codaste de popa, más alto
  g.quadraticCurveTo(-16 * s, -6 * s, -15 * s, -3.4 * s);
  g.closePath(); g.fill();
  // la línea de flotación al sol y la sombra bajo la regala
  g.strokeStyle = CASCO_L; g.lineWidth = 1.5 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-13 * s, -4.4 * s); g.quadraticCurveTo(0, -0.8 * s, 13 * s, -4.4 * s); g.stroke();
  g.strokeStyle = CASCO_D; g.lineWidth = 1.1 * s;
  g.beginPath(); g.moveTo(-12 * s, -1.6 * s); g.quadraticCurveTo(0, 1.4 * s, 12 * s, -1.6 * s); g.stroke();
  for (const bx of [-8, -3, 2, 7]) line({ x: bx * s, y: -3.2 * s }, { x: bx * s, y: -0.4 * s }, CASCO_D, 0.7 * s); // las costuras
  // los remates de papiro de proa y popa
  dot({ x: 17 * s, y: -10 * s }, 1.9 * s, '#8fa63a'); dot({ x: -16.6 * s, y: -11 * s }, 2.1 * s, '#8fa63a');
  // CARGA: jarras de vino y grano amarradas al centro (solo cuando baja: sube vacía)
  if (baja) for (const [jx, jz, r] of [[-6, -5, 2.6], [-2.6, -5.6, 2.9], [0.8, -5, 2.5]]) {
    ellipse({ x: jx * s, y: jz * s }, r * s, r * 1.25 * s, '#a8703f');
    ellipse({ x: (jx - 0.5) * s, y: (jz - 0.8) * s }, r * 0.45 * s, r * 0.5 * s, '#c68d55');
    line({ x: jx * s, y: (jz - r * 1.2) * s }, { x: jx * s, y: (jz - r * 1.6) * s }, '#8a5c33', 1.2 * s);
  }
  // MÁSTIL Y VELA CUADRADA en su verga (la vela latina es medieval: en el Nilo faraónico era cuadrada)
  line({ x: 2 * s, y: -5 * s }, { x: 2 * s, y: -30 * s }, '#8a6a4a', 1.6 * s);
  const ond = Math.sin(t * 1.5) * 1.6 * s, izada = baja ? 0 : 1;   // aguas abajo se boga; remontando, la vela empuja
  if (izada) {
    line({ x: -8 * s, y: -28.5 * s }, { x: 13 * s, y: -28.5 * s }, '#8a6a4a', 1.4 * s);   // la verga alta
    line({ x: -8 * s, y: -13 * s }, { x: 13 * s, y: -13 * s }, '#8a6a4a', 1.2 * s);       // la botavara
    g.fillStyle = LINO;
    g.beginPath();
    g.moveTo(-7.6 * s, -28 * s);
    g.quadraticCurveTo(2 * s + ond * 2, -21 * s, -7.2 * s, -13.4 * s);
    g.lineTo(12.6 * s, -13.4 * s);
    g.quadraticCurveTo(3 * s + ond * 2, -21 * s, 12.6 * s, -28 * s);
    g.closePath(); g.fill();
    g.fillStyle = LINO_S;
    g.beginPath(); g.moveTo(2.4 * s, -28 * s); g.quadraticCurveTo(6 * s + ond, -21 * s, 2.4 * s, -13.4 * s);
    g.lineTo(12.6 * s, -13.4 * s); g.quadraticCurveTo(3 * s + ond * 2, -21 * s, 12.6 * s, -28 * s); g.closePath(); g.fill();
    for (const ry of [-25, -21, -17]) line({ x: -6 * s, y: ry * s }, { x: 11 * s, y: ry * s }, 'rgba(180,168,140,.5)', 0.7 * s); // los refuerzos del lino
  } else {
    line({ x: 2 * s, y: -13 * s }, { x: 11 * s, y: -12.4 * s }, '#8a6a4a', 1.2 * s);      // la verga arriada sobre la cubierta
  }
  /* EL TIMONEL a la espadilla de popa. Rehecho el 2026-08-31 (cuarta tanda: «la proporción del que
     está en el bote es totalmente distinta»): el anterior era una figurita realista de un tercio del
     caminante; este es de la misma especie chibi que la gente de la orilla, con su cabezota, su piel
     cobriza, su faldellín y su peluca, a un 80% del porte para leerse un paso atrás. */
  const rem = Math.sin(t * 1.9) * 2.2 * s, PIEL3 = '#cf9668';
  line({ x: -13 * s, y: -6 * s }, { x: -20 * s, y: 1.5 * s + rem }, '#8a6a4a', 1.5 * s);  // la pala del gobernalle
  g.beginPath();                                                                          // el torso desnudo al sol
  g.moveTo(-14.6 * s, -6 * s);
  g.quadraticCurveTo(-15.4 * s, -13.5 * s, -11.4 * s, -14.2 * s);
  g.quadraticCurveTo(-7.4 * s, -13.5 * s, -8.2 * s, -6 * s);
  g.closePath(); g.fillStyle = PIEL3; g.fill();
  g.fillStyle = LINO; g.fillRect(-14.8 * s, -9.8 * s, 7 * s, 3.8 * s);                    // el faldellín
  g.strokeStyle = LINO_S; g.lineWidth = 0.7 * s;
  g.beginPath(); g.moveTo(-14.8 * s, -7.9 * s); g.lineTo(-7.8 * s, -7.9 * s); g.stroke();
  g.strokeStyle = PIEL3; g.lineWidth = 2.0 * s; g.lineCap = 'round';                      // el brazo que gobierna
  g.beginPath(); g.moveTo(-12.6 * s, -11.6 * s); g.lineTo(-18 * s, -3 * s + rem); g.stroke();
  dot({ x: -11.4 * s, y: -18.2 * s }, 4.6 * s, PIEL3);                                    // la cabeza, cabezona como todas
  dot({ x: -10.2 * s, y: -18.4 * s }, 0.65 * s, '#3a2c1c');                               // los ojos, a la proa
  dot({ x: -8.7 * s, y: -18.4 * s }, 0.65 * s, '#3a2c1c');
  g.beginPath(); g.arc(-11.4 * s, -19.4 * s, 4.7 * s, Math.PI * .92, Math.PI * 2.08); g.fillStyle = '#1c1a18'; g.fill();
  g.fillRect(-16.1 * s, -19.4 * s, 9.4 * s, 2.1 * s);                                     // la peluca de corte recto
  g.restore();
}
function drawPiramides(t) {
  // s = factor de zoom para radios/anchos/grosores medidos en ESPACIO DE PANTALLA
  const s = zoom;

  // --- paleta de caliza: dos tonos rotundos para la silueta plana ---
  const LUZ = '#e6dcc0';     // cara frente-izquierda al sol
  const SOM = '#c6b58b';     // cara frente-derecha en sombra (sombra fuerte)
  const CAP_LUZ = '#f2ead2'; // casquete de caliza intacta, lado luz (mas blanco, como Kefren)
  const CAP_SOM = '#d9caa2'; // casquete, lado sombra

  // PASO 1: asiento de arena + sombra de suelo de cada piramide (todo el suelo primero,
  // para que ningun cuerpo quede tapado por la arena del vecino mas cercano).
  // El asiento ES SUELO, asi que se RECORTA al diamante del bloque (2026-08-24): las dunas de las tres
  // se salian por el norte y quedaban colgando sobre el cielo, igual que colgaba el Nilo.
  const base = (cx, cy, h) => {
    g.save();
    g.beginPath();
    const dA = P(2, 2), dB = P(18, 2), dC = P(18, 18), dD = P(2, 18);
    g.moveTo(dA.x, dA.y); g.lineTo(dB.x, dB.y); g.lineTo(dC.x, dC.y); g.lineTo(dD.x, dD.y); g.closePath();
    g.clip();
    // duna palida bajo la base para que no flote sobre el damero
    ellipse(P(cx, cy + h * 0.4), h * 60 * s, h * 22 * s, 'rgba(224,211,171,.5)');
    // sombra proyectada suave, ligeramente hacia el frente (+x+y)
    sombra(cx + h * 0.15, cy + h * 0.5, h * 58, h * 20);
    g.restore();
  };

  // PASO 2: cuerpo de la piramide: dos triangulos lisos que se unen en la arista frontal
  const cuerpo = (cx, cy, h, apexZ, conCasquete) => {
    // vertices del volumen (base cuadrada centrada en cx,cy; apice sobre el centro)
    const FC = P(cx + h, cy + h, 0); // esquina frontal: la mas cercana, punto MAS BAJO
    const LC = P(cx - h, cy + h, 0); // esquina izquierda
    const RC = P(cx + h, cy - h, 0); // esquina derecha
    const AP = P(cx, cy, apexZ);     // APICE, muy alto en z

    const on = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k) });
    // cara iluminada (frente-izquierda): triangulo FC-LC-APICE
    poly([FC, LC, AP], LUZ);
    // cara en sombra (frente-derecha): triangulo FC-RC-APICE
    poly([FC, RC, AP], SOM);
    /* LAS HILADAS (2026-09-06, jugando de cerca: dos triángulos lisos se leían como papel plegado).
       Una pirámide es piedra apilada: cada hilada deja una línea que el sol rasante marca en la
       cara iluminada y la sombra funde en la otra. Tenues, más juntas hacia la cima (perspectiva),
       y el pie se hunde en la arena con una penumbra que lo asienta. */
    const NH = 16;
    for (let k = 1; k < NH; k++) {
      const f = k / NH, fa = on(FC, AP, f);
      line(on(LC, AP, f), fa, 'rgba(120,98,58,.13)', 0.7 * s);
      line(fa, on(RC, AP, f), 'rgba(60,44,22,.14)', 0.7 * s);
    }
    poly([FC, LC, on(LC, AP, 0.09), on(FC, AP, 0.09)], 'rgba(150,120,70,.11)');   // el pie, en la calima de la arena
    poly([FC, RC, on(RC, AP, 0.09), on(FC, AP, 0.09)], 'rgba(60,44,22,.10)');
    // arista frontal apenas insinuada: filo claro que marca el quiebre de las dos caras
    line(AP, FC, 'rgba(255,246,220,.16)', 1.3 * s);

    // --- casquete de caliza intacta cerca de la cima (solo la mayor, como Kefren) ---
    if (conCasquete) {
      const k = 0.30; // baja el 30% desde el apice: el casquete ocupa el tercio superior
      const pFC = on(AP, FC, k); // sobre la arista frontal
      const pLC = on(AP, LC, k); // sobre la arista izquierda
      const pRC = on(AP, RC, k); // sobre la arista derecha
      poly([AP, pFC, pLC], CAP_LUZ); // casquete lado luz
      poly([AP, pFC, pRC], CAP_SOM); // casquete lado sombra
      // borde inferior del casquete: separa la caliza pulida del nucleo escalonado
      line(pLC, pFC, 'rgba(255,250,235,.32)', 1.0 * s);
      line(pFC, pRC, 'rgba(120,104,72,.26)', 1.0 * s);
    }

    // --- destello sutil en el apice: latido suave con t, fase por posicion ---
    const glow = 0.5 + 0.5 * Math.sin(t * 1.5 + cx);
    ellipse(AP, (2.4 + glow * 1.8) * s, (2.4 + glow * 1.8) * s, `rgba(255,240,176,${0.14 + glow * 0.18})`);
    dot(AP, 1.4 * s, '#fff0b0'); // punto de luz nitido justo en la punta
  };

  // suelo de las tres (orden indistinto). La chica se mudo el 2026-08-24 del (2,6 · 3,7) al (3,45 · 4,15):
  // con h = 0,95 su esquina izquierda caia en x = 1,65 y el bloque util de Egipto empieza en 2, asi que
  // media base quedaba fuera del mundo, cortada en diagonal por la arista del terreno (ojo del jugador).
  base(3.45, 4.15, 0.95); base(4.9, 3.9, 1.55); base(7.2, 3.5, 1.20);

  // cuerpos de ATRAS hacia el FRENTE (menor a mayor x+y): chica, grande, mediana
  cuerpo(3.45, 4.15, 0.95, 56, false); // chica: izquierda-fondo, con su base entera dentro del bloque
  cuerpo(4.9, 3.9, 1.55, 100, true); // grande: centro-atras, con casquete
  cuerpo(7.2, 3.5, 1.20, 74, false); // mediana: derecha, en primer plano del grupo

  // --- neblina de calor: banda calida translucida que ondula en la base de la mayor ---
  const haze = 0.5 + 0.5 * Math.sin(t * 0.9 + 1.3);
  ellipse(P(4.9, 5.6), 86 * s, (3.5 + haze * 3) * s, `rgba(245,236,205,${0.045 + haze * 0.05})`);
}

function drawGranEsfinge(t) {
  /* LA GRAN ESFINGE, SEXTA VERSIÓN: ISOMÉTRICA (2026-09-06, elegida por el usuario sobre la hoja de
     bocetos `juego/bocetos/esfinge.html`: «me gusta la isométrica; me gusta que las estructuras sean
     isométricas»). La esfinge como edificio: cajas con las tres caras del mundo (arriba la más
     clara, +y a la luz, +x en sombra), en la paleta de caliza de las pirámides y de la Casa. Mira
     al frente (+y), que es la cara iluminada. Ni una curva ni una línea: solo facetas. */
  const s = zoom;
  const TOP = '#efe6cd', L = '#e2d5b4', R = '#c6b58b', KOHL = '#4a3b25', DEEP = '#8f7a4e', ROCA = '#b3986a', ROCA_D = '#8f7649';
  const x0 = ESFINGE.x - 0.5, y0 = ESFINGE.y - 1.7;               // el cuerpo corre a lo largo de y; el frente queda en y0 + 3,5
  sombra(x0 + 0.5, y0 + 1.9, 62, 27);
  isoBox(x0 - 0.15, y0 - 0.1, 1.3, 3.55, 4, '#dccda8', ROCA, ROCA_D);           // la losa de roca de la que se excavó
  isoBox(x0, y0, 1.0, 1.6, 22, TOP, L, R, 4);                                     // la grupa y el lomo
  poly([P(x0, y0, 26), P(x0 + 1, y0, 26), P(x0 + 1, y0 + 0.5, 34), P(x0, y0 + 0.5, 34)], '#f3ecd8'); // el lomo sube hacia los hombros
  poly([P(x0 + 1, y0, 26), P(x0 + 1, y0 + 0.5, 34), P(x0 + 1, y0 + 0.5, 4), P(x0 + 1, y0, 4)], R);   // y su flanco
  isoBox(x0, y0 + 0.5, 1.0, 1.1, 30, TOP, L, R, 4);                               // el tronco
  isoBox(x0 + 0.05, y0 + 1.6, 0.9, 0.5, 46, TOP, L, R, 4);                         // el pecho, alto
  isoBox(x0 + 0.08, y0 + 2.1, 0.32, 1.25, 12, TOP, L, R, 4);                       // la pata izquierda
  isoBox(x0 + 0.6, y0 + 2.1, 0.32, 1.25, 12, TOP, L, R, 4);                        // la pata derecha
  isoBox(x0 + 0.44, y0 + 2.7, 0.12, 0.28, 24, '#9a8b80', '#8f7f74', '#6f625a', 4); // la estela del sueño entre las garras
  for (const px of [x0 + 0.08, x0 + 0.6]) for (let k = 1; k < 4; k++) line(P(px + k * 0.08, y0 + 3.35, 16), P(px + k * 0.08, y0 + 3.35, 5), 'rgba(120,98,58,.35)', 0.8 * s); // los dedos
  // la cabeza con el nemes: el tocado es una caja ancha que remata el pecho; la cara, la caja que asoma al frente
  isoBox(x0 + 0.06, y0 + 1.4, 0.88, 0.68, 28, TOP, L, R, 50);                      // el nemes
  poly([P(x0 + 0.06, y0 + 2.08, 76), P(x0 + 0.94, y0 + 2.08, 76), P(x0 + 0.86, y0 + 2.08, 82), P(x0 + 0.14, y0 + 2.08, 82)], R); // la banda frontal, en sombra
  isoBox(x0 + 0.22, y0 + 2.08, 0.56, 0.14, 24, TOP, '#f3ecd8', R, 52);              // la cara, que asoma del tocado
  const F = (u, h) => P(x0 + 0.22 + u * 0.56, y0 + 2.22, h);                        // los rasgos, mapeados en el plano de la cara
  line(F(0.16, 69), F(0.42, 68.6), KOHL, 1.15 * s); line(F(0.58, 68.6), F(0.84, 69), KOHL, 1.15 * s); // los párpados serenos
  poly([F(0.46, 69), F(0.54, 69), F(0.57, 60), F(0.43, 60)], R);                     // la arista de la nariz
  line(F(0.38, 57), F(0.62, 57), DEEP, 1.1 * s);                                    // la boca
  poly([F(0.44, 56.5), F(0.56, 56.5), F(0.56, 52.5), F(0.44, 52.5)], R);              // la barba postiza
  for (let k = 1; k < 5; k++) line(P(x0 + 1, y0, 4 + k * 5), P(x0 + 1, y0 + 1.6, 4 + k * 5), 'rgba(60,44,22,.10)', 0.7 * s); // hiladas sutiles en el flanco, como las pirámides
  // el sol sobre el tocado: un destello lento, nunca fiesta
  const gl = 0.5 + 0.5 * Math.sin(t * 0.8);
  g.save(); g.globalAlpha = 0.06 + 0.08 * gl;
  ellipse(P(x0 + 0.5, y0 + 1.75, 80), 12 * s, 3.5 * s, '#fff0b0'); g.restore();
}
const ESFINGE = { x: 12.3, y: 4.0 }; // la necrópolis del nordeste, con las mastabas (antes en 13,5 · 9,15, sobre la clase de la Kemyt)

/* EL POBLADO DE LOS ARTESANOS (2026-09-06, jugando: el oeste de Egipto era medio bloque de arena
   vacía con tres palmeras). Deir el-Medina: las casas de adobe de quienes tallaban las tumbas del
   valle, con su horno del pan, sus tinajas y la escalera al techo donde se dormía en verano. De este
   poblado salieron los miles de ostraca escolares que dan nombre a la época, así que es exactamente
   el lugar que faltaba: donde viven los que aprenden. De noche, los aprendices vuelven aquí. */
const HOGARES = [[3.53, 7.3], [4.35, 7.1], [3.81, 8.3]]; // las puertas de las tres casas: adonde se vuelve al anochecer (la segunda, por delante del horno, no a través de él)
function drawCasaAdobe(x, y, w, d, h, t, i) {
  const s = zoom;
  sombra(x + w / 2 + 0.14, y + d / 2 + 0.18, 17 * (w + d), 7.5 * (w + d));
  isoBox(x, y, w, d, h, '#d8b980', '#c49c64', '#ab8550');
  line(P(x, y + d, h), P(x + w, y + d, h), '#b8905a', 1.3 * s);                       // el pretil del techo
  line(P(x + w, y, h), P(x + w, y + d, h), '#9c7a48', 1.3 * s);
  const px0 = x + w * 0.36, px1 = x + w * 0.6;                                          // la puerta baja, en la cara del sur
  poly([P(px0, y + d, 0), P(px1, y + d, 0), P(px1, y + d, h * 0.6), P(px0, y + d, h * 0.6)], '#4a3a28');
  poly([P(px0 - 0.03, y + d, h * 0.6), P(px1 + 0.03, y + d, h * 0.6), P(px1 + 0.03, y + d, h * 0.66), P(px0 - 0.03, y + d, h * 0.66)], '#8a6a4a'); // el dintel de palmera
  poly([P(x + w * 0.76, y + d, h * 0.66), P(x + w * 0.9, y + d, h * 0.66), P(x + w * 0.9, y + d, h * 0.8), P(x + w * 0.76, y + d, h * 0.8)], '#4a3a28'); // el tragaluz
  if (i === 1) { // la escalera al techo: en verano se dormía arriba
    const e0 = P(x + w + 0.02, y + d * 0.3, 0), e1 = P(x + w + 0.02, y + d * 0.3, h + 2);
    line({ x: e0.x + 2 * s, y: e0.y }, { x: e1.x + 2 * s, y: e1.y }, '#8a6a4a', 1.1 * s);
    line({ x: e0.x + 5.5 * s, y: e0.y - 1.5 * s }, { x: e1.x + 5.5 * s, y: e1.y - 1.5 * s }, '#8a6a4a', 1.1 * s);
    for (let k = 1; k < 6; k++) { const yy = lerp(e0.y, e1.y, k / 6); line({ x: e0.x + 2 * s, y: yy }, { x: e0.x + 5.5 * s, y: yy - 1.5 * s }, '#8a6a4a', 0.9 * s); }
  }
  if (i === 0) { // los panes secándose al sol sobre el techo, y la estera
    const r0 = P(x + w * 0.3, y + d * 0.55, h), r1 = P(x + w * 0.62, y + d * 0.45, h);
    ellipse({ x: r0.x, y: r0.y }, 5.5 * s, 2.4 * s, '#c9a36a');
    for (const [dx, dy] of [[-2.4, -0.6], [0.4, -1.1], [2.6, -0.2], [-0.8, 0.8]]) dot({ x: r1.x + dx * s, y: r1.y + dy * s }, 1.2 * s, '#d9a53f');
  }
}
function drawPoblado(t) {
  const s = zoom;
  // EL HORNO DEL PAN: la cúpula de barro con la boca negra, y su humo cuando hay quien lo atienda
  const h = P(4.85, 7.55);
  sombra(4.85, 7.62, 8, 3.2);
  ellipse({ x: h.x, y: h.y - 3.2 * s }, 6 * s, 5.4 * s, '#b48a56');
  ellipse({ x: h.x - 1.6 * s, y: h.y - 4.6 * s }, 3.2 * s, 2.3 * s, '#c9a36a');   // el lado al sol
  ellipse({ x: h.x + 2.2 * s, y: h.y - 1.6 * s }, 2 * s, 1.7 * s, '#3a2c1c');     // la boca
  const gl = 0.5 + 0.5 * Math.sin(t * 2.3);
  dot({ x: h.x + 2.2 * s, y: h.y - 1.4 * s }, 0.9 * s, `rgba(255,${150 + gl * 60},60,${0.5 + gl * 0.4})`); // la brasa dentro
  // LAS TINAJAS de agua junto a la puerta grande
  for (const [tx, ty, r] of [[4.05, 7.05, 1.0], [4.22, 7.12, 0.85]]) {
    const q = P(tx, ty);
    ellipse({ x: q.x, y: q.y - 2.6 * r * s }, 2.4 * r * s, 3.2 * r * s, '#b08a55');
    ellipse({ x: q.x, y: q.y - 5.6 * r * s }, 1.5 * r * s, 0.7 * r * s, '#8a6a4a');
  }
  // EL MURETE del corral de cabras, con la cabra: la vida doméstica del poblado
  const m0 = P(3.0, 8.4), m1 = P(3.75, 8.4), m2 = P(3.75, 9.0);
  line(m0, m1, '#c49c64', 3 * s); line(m1, m2, '#ab8550', 3 * s);
  const cb = P(3.35, 8.7), mordisco = Math.sin(t * 1.6) > 0.6 ? 1.2 * s : 0;
  ellipse({ x: cb.x, y: cb.y - 3 * s }, 4 * s, 2.2 * s, '#d8d0bc');               // la cabra blanca
  dot({ x: cb.x + 4.2 * s, y: cb.y - 4.6 * s + mordisco }, 1.6 * s, '#d8d0bc');   // la cabeza, que pasta
  line({ x: cb.x + 4.6 * s, y: cb.y - 6 * s + mordisco }, { x: cb.x + 5.6 * s, y: cb.y - 7.6 * s + mordisco }, '#8a7a5a', 0.8 * s); // el cuerno
  g.strokeStyle = '#8a7a5a'; g.lineWidth = 0.9 * s;
  for (const k of [-2.4, -0.8, 1.2, 2.6]) { g.beginPath(); g.moveTo(cb.x + k * s, cb.y - 1.6 * s); g.lineTo(cb.x + k * s, cb.y); g.stroke(); }
}
/* EL SHADUF (2026-09-06): la pértiga con contrapeso que sube el agua del río a la acequia, el gesto
   agrícola más egipcio que existe y el que la vega necesitaba para leerse como campo regado y no
   como césped. Un labrador tira de la cuerda: el cubo baja al agua, sube lleno y vuelca en el canal. */
function drawShaduf(x, y, t) {
  const s = zoom, p = P(x, y);
  const ang = -0.55 + 0.45 * Math.sin(t * 0.55);           // la pértiga bascula despacio: −1 arriba, +1 el cubo en el agua
  sombra(x + 0.15, y + 0.2, 14, 5);
  // la acequia que recibe el agua, hacia la vega
  g.strokeStyle = '#8fb0a8'; g.lineWidth = 2.2 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(p.x + 6 * s, p.y - 1 * s); g.lineTo(p.x + 26 * s, p.y + 8 * s); g.stroke();
  g.strokeStyle = '#6f9a9a'; g.lineWidth = 1 * s;
  g.beginPath(); g.moveTo(p.x + 6 * s, p.y - 1 * s); g.lineTo(p.x + 26 * s, p.y + 8 * s); g.stroke();
  // el poste en horquilla
  line({ x: p.x, y: p.y }, { x: p.x, y: p.y - 22 * s }, '#8a6a4a', 2.2 * s);
  line({ x: p.x - 2.2 * s, y: p.y - 26 * s }, { x: p.x, y: p.y - 22 * s }, '#8a6a4a', 1.6 * s);
  line({ x: p.x + 2.2 * s, y: p.y - 26 * s }, { x: p.x, y: p.y - 22 * s }, '#8a6a4a', 1.6 * s);
  // la pértiga: el contrapeso de barro atrás, el cubo adelante
  const px0 = p.x, py0 = p.y - 23 * s, L1 = 16 * s, L2 = 24 * s;
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const back = { x: px0 - L1 * ca, y: py0 + L1 * sa }, front = { x: px0 + L2 * ca, y: py0 - L2 * sa };
  line(back, front, '#a07a48', 1.8 * s);
  ellipse(back, 3.6 * s, 3 * s, '#b08a55');                  // el contrapeso de barro
  const cuboY = Math.min(p.y - 3 * s, front.y + 12 * s);     // la cuerda cuelga hasta el cubo, que no atraviesa el suelo
  line(front, { x: front.x, y: cuboY }, '#d8cba8', 0.9 * s); // la cuerda
  g.fillStyle = '#8a6a4a'; g.fillRect(front.x - 2.4 * s, cuboY, 4.8 * s, 3.4 * s); // el cubo de cuero
  if (ang > 0.15) { // el cubo abajo: el agua que sube, y la que vuelca al canal cuando la pértiga vuelve
    g.save(); g.globalAlpha = 0.6;
    for (let k = 0; k < 3; k++) dot({ x: front.x - 2 * s + k * 2 * s, y: cuboY + 3.6 * s + k * 1.2 * s }, 0.7 * s, '#bfe0e8');
    g.restore();
  }
  /* EL LABRADOR (quinta tanda, 2026-09-06: «no sé si eso es una persona o no»): era un palito de media
     altura. Ahora es de la familia de los maestros (drawDocenteExtra): faldellín, torso cobrizo,
     cabezota, y el cuerpo se inclina cuando tira de la cuerda. */
  const lx = p.x - 9 * s, ly = p.y + 2.5 * s, tir = Math.max(0, -ang);
  ellipse({ x: lx, y: ly }, 8 * s, 3.6 * s, sombraHoy);
  g.save(); g.translate(lx, ly); g.rotate(-0.12 * tir);                                   // se echa atrás al tirar
  g.beginPath(); g.moveTo(-5.5 * s, 0); g.quadraticCurveTo(-4.6 * s, -13 * s, 0, -14 * s); g.quadraticCurveTo(4.6 * s, -13 * s, 5.5 * s, 0); g.closePath(); g.fillStyle = '#f2ead2'; g.fill(); // el faldellín
  g.strokeStyle = '#d8cba8'; g.lineWidth = 0.8 * s; g.beginPath(); g.moveTo(-4.4 * s, -6 * s); g.lineTo(4.4 * s, -6 * s); g.stroke();
  g.beginPath(); g.moveTo(-3.8 * s, -13 * s); g.quadraticCurveTo(-4.4 * s, -20 * s, 0, -21 * s); g.quadraticCurveTo(4.4 * s, -20 * s, 3.8 * s, -13 * s); g.closePath(); g.fillStyle = '#cf9668'; g.fill(); // el torso al sol
  dot({ x: 0, y: -26 * s }, 5.8 * s, '#cf9668');                                            // la cabezota
  g.fillStyle = '#1c1a18'; g.beginPath(); g.arc(0, -27.2 * s, 5.9 * s, Math.PI * 1.02, Math.PI * 1.98); g.fill(); // rapado, con la sombra del cráneo
  ojo(2.2 * s, -26.4 * s, 0.85 * s, 1); ojo(4.6 * s, -26.4 * s, 0.85 * s, 1);
  g.restore();
  // los dos brazos, del hombro a la cuerda
  const hombro = { x: lx + 3.6 * s, y: ly - 18.5 * s + 2 * s * tir }, mano = { x: front.x - 0.6 * s, y: Math.min(front.y + 6 * s, cuboY) };
  line(hombro, mano, '#cf9668', 2.4 * s);
  line({ x: hombro.x - 1.2 * s, y: hombro.y + 1.5 * s }, { x: mano.x - 0.8 * s, y: mano.y + 1.4 * s }, '#b8865a', 2.2 * s);
}
/* EL COCODRILO (2026-09-06): Sobek toma el sol en la ribera. Los egipcios le rezaban y le temían; en
   este valle solo abre la boca al sol para enfriarse (que es lo que hacen de verdad) y mueve la cola
   cuando pasa la falúa. Fauna como documento, igual que el gato y el hipopótamo: nada muere aquí. */
function drawCocodrilo(x, y, t) {
  const s = zoom, p = P(x, y);
  const cola = Math.sin(t * 0.9) * 2.2 * s, boca = Math.max(0, Math.sin(t * 0.23)) > 0.85 ? 1 : 0;
  ellipse({ x: p.x, y: p.y + 1 * s }, 16 * s, 3.8 * s, sombraHoy);
  g.save(); g.translate(p.x, p.y);
  const V = '#6f7f46', VC = '#8a9a58', VO = '#4f5c32';
  // la cola, en S, que barre despacio
  g.strokeStyle = V; g.lineWidth = 3.2 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-8 * s, -1.5 * s); g.quadraticCurveTo(-14 * s, -2.5 * s + cola, -19 * s, 0.5 * s + cola * 1.4); g.stroke();
  g.lineWidth = 1.6 * s; g.beginPath(); g.moveTo(-14 * s, -2.5 * s + cola); g.lineTo(-19 * s, 0.5 * s + cola * 1.4); g.stroke();
  // el cuerpo, bajo y ancho, con el lomo de escamas
  ellipse({ x: -1 * s, y: -2.4 * s }, 9.5 * s, 3.6 * s, V);
  ellipse({ x: -1.5 * s, y: -4 * s }, 7.5 * s, 1.8 * s, VC);
  for (let k = -3; k <= 3; k++) dot({ x: -1 * s + k * 2.3 * s, y: -5.2 * s + Math.abs(k) * 0.35 * s }, 0.75 * s, VO); // las crestas del lomo
  // las patas, abiertas al sol
  for (const [px, py] of [[-6, 0.8], [3, 1.2]]) { g.strokeStyle = VO; g.lineWidth = 1.5 * s; g.beginPath(); g.moveTo(px * s, -1.5 * s); g.lineTo((px - 1.5) * s, py * s); g.stroke(); g.beginPath(); g.moveTo((px + 1) * s, -1.5 * s); g.lineTo((px + 2.5) * s, py * s); g.stroke(); }
  // la cabeza larga, con el ojo arriba y la boca que se abre al sol
  poly([{ x: 7 * s, y: -4.2 * s }, { x: 16.5 * s, y: -3.2 * s - boca * 2.6 * s }, { x: 17 * s, y: -1.6 * s }, { x: 7.5 * s, y: -0.6 * s }], V);
  if (boca) poly([{ x: 9 * s, y: -2.2 * s }, { x: 16.5 * s, y: -3.2 * s - 2.6 * s }, { x: 17 * s, y: -1.6 * s }], '#e9c9b0'); // el interior claro de la boca
  for (let k = 0; k < 4; k++) dot({ x: (10 + k * 1.8) * s, y: -1.4 * s - boca * (k * 0.5) * s }, 0.45 * s, '#f2ead2'); // los dientes
  dot({ x: 9 * s, y: -4.4 * s }, 1.1 * s, VC); dot({ x: 9.2 * s, y: -4.4 * s }, 0.5 * s, '#2a2a20'); // el ojo, vigilante
  g.restore();
}
/* LAS MASTABAS (2026-09-06): las tumbas de banco de los notables, en la meseta del nordeste, que
   estaba vacía. Son las tumbas que los artesanos del poblado tallan: el otro extremo de su oficio. */
function drawMastaba(x, y, w, d, h) {
  sombra(x + w / 2 + 0.16, y + d / 2 + 0.2, 16 * (w + d), 6.5 * (w + d));
  // los muros en talud: la planta de arriba es más chica que la base
  const k = 0.12, LUZ = '#e2d2a8', SOM = '#c4ad7c', TOP = '#eadcb6';
  poly([P(x + w, y, 0), P(x + w, y + d, 0), P(x + w - k, y + d - k, h), P(x + w - k, y + k, h)], SOM);
  poly([P(x, y + d, 0), P(x + w, y + d, 0), P(x + w - k, y + d - k, h), P(x + k, y + d - k, h)], LUZ);
  poly([P(x + k, y + k, h), P(x + w - k, y + k, h), P(x + w - k, y + d - k, h), P(x + k, y + d - k, h)], TOP);
  // la falsa puerta, tallada en la cara del sur
  poly([P(x + w * 0.42, y + d, 0), P(x + w * 0.58, y + d, 0), P(x + w * 0.575, y + d - 0.04, h * 0.55), P(x + w * 0.425, y + d - 0.04, h * 0.55)], '#a48a58');
  poly([P(x + w * 0.46, y + d, 0), P(x + w * 0.54, y + d, 0), P(x + w * 0.54, y + d - 0.03, h * 0.42), P(x + w * 0.46, y + d - 0.03, h * 0.42)], '#5a4630');
}
function drawColosoFaraon(x, y, dir) {
  /* EL COLOSO SEDENTE, ISOMÉTRICO (2026-09-06, quinta tanda, segunda vuelta: «los colosos debieran
     tener el mismo sentido que la Gran Esfinge, y también ser isométricos»). Cajas con las tres
     caras del mundo en la paleta de las pirámides, mirando a +y (el frente iluminado), como la
     esfinge y la Casa. La planta es COMPACTA a propósito (pedestal de 0,56 tiles): un coloso de
     bloques abre en diagonal en pantalla, y en la fachada estrecha del templo, entre el toldo del
     anexo y el patio de las lascas, solo caben ~45 px de ancho. Medido: con esta planta ninguno
     tapa el anexo, la puerta ni una pieza que se mida. `dir` ya no hace falta: la estatua es simétrica. */
  const s = zoom;
  const TOP = '#efe6cd', L = '#e2d5b4', R = '#c6b58b', LUZ2 = '#f3ecd8', KOHL = '#4a3b25', DEEP = '#8f7a4e';
  const B = (dx, dy, w, d, h, z0, t = TOP, l = L, r = R) => isoBox(x + dx, y + dy, w, d, h, t, l, r, z0);
  sombra(x, y + 0.32, 25, 11);
  B(-0.28, -0.28, 0.56, 0.56, 6, 0);                                  // el pedestal
  poly([P(x - 0.28, y + 0.28, 6), P(x + 0.28, y + 0.28, 6), P(x + 0.28, y + 0.28, 5.2), P(x - 0.28, y + 0.28, 5.2)], DEEP); // su canto
  B(-0.22, -0.22, 0.44, 0.44, 12, 6);                                 // el asiento del trono
  B(-0.22, -0.22, 0.44, 0.10, 26, 18, L, L, R);                        // el respaldo, una estela alta
  B(-0.17, -0.16, 0.34, 0.26, 22, 25);                                 // el torso
  B(-0.25, -0.12, 0.08, 0.22, 17, 28); B(0.17, -0.12, 0.08, 0.22, 17, 28); // los brazos pegados al cuerpo
  B(-0.20, 0.26, 0.16, 0.14, 12, 6); B(0.04, 0.26, 0.16, 0.14, 12, 6);   // las canillas, bajo las rodillas
  B(-0.20, 0.40, 0.16, 0.13, 3.5, 6); B(0.04, 0.40, 0.16, 0.13, 3.5, 6); // los pies, sobre el pedestal
  B(-0.20, 0.06, 0.16, 0.34, 7, 18); B(0.04, 0.06, 0.16, 0.34, 7, 18);   // los muslos, sobre el frente del asiento
  B(-0.19, 0.10, 0.14, 0.18, 3, 25, LUZ2, L, R); B(0.05, 0.10, 0.14, 0.18, 3, 25, LUZ2, L, R); // las manos planas sobre las rodillas
  for (const px of [-0.19, 0.05]) for (let k = 1; k < 4; k++) line(P(x + px + k * 0.035, y + 0.28, 27.5), P(x + px + k * 0.035, y + 0.28, 25.5), 'rgba(120,98,58,.4)', 0.7 * s); // los dedos
  B(-0.07, -0.07, 0.14, 0.14, 3, 47);                                  // el cuello
  B(-0.18, -0.18, 0.36, 0.30, 24, 50);                                 // el nemes
  poly([P(x - 0.18, y + 0.12, 71), P(x + 0.18, y + 0.12, 71), P(x + 0.18, y + 0.12, 74.5), P(x - 0.18, y + 0.12, 74.5)], R); // la banda frontal, en sombra
  B(-0.10, 0.12, 0.20, 0.07, 20, 52, TOP, LUZ2, R);                     // la cara, que asoma del tocado
  const F = (u, h) => P(x - 0.10 + u * 0.20, y + 0.19, h);              // los rasgos, mapeados en el plano de la cara
  line(F(0.14, 67), F(0.42, 66.7), KOHL, 1.0 * s); line(F(0.58, 66.7), F(0.86, 67), KOHL, 1.0 * s); // los párpados serenos
  poly([F(0.45, 67), F(0.55, 67), F(0.58, 60), F(0.42, 60)], R);        // la arista de la nariz
  line(F(0.36, 57.5), F(0.64, 57.5), DEEP, 1.0 * s);                    // la boca
  B(-0.03, 0.19, 0.06, 0.04, 6, 46, R, R, R);                          // la barba postiza
  // el calor que respira tras la cabeza: un halo lento, nunca fiesta
  const tt = (typeof t !== 'undefined') ? t : 0, glow = 0.05 + 0.04 * Math.sin(tt * 0.7 + x);
  ellipse(P(x, y, 62), 16 * s, 18 * s, 'rgba(255,224,150,' + glow.toFixed(3) + ')');
}

function drawFaraonVivo(t) {
  // ---- utilidades locales (no redefinen helpers globales) ----
  const s = zoom;                       // multiplicador de escala en espacio pantalla
  const p0 = P(9.7, 10.75);   // en la explanada, entre los dos colosos y de cara al río               // en la explanada, en el eje de la puerta: antes estaba EN la huella de la Casa, arrinconado contra su pared (2026-08-25)
  const pt  = (dx, dy) => ({ x: p0.x + dx * s, y: p0.y + dy * s });          // punto fijo (piernas/faldellin)
  const bob = Math.sin(t * 1.7) * 0.35 * s;                                  // respiracion: el torso sube al inhalar
  const ptU = (dx, dy) => ({ x: p0.x + dx * s, y: p0.y + dy * s - bob });    // punto del cuerpo alto (respira)

  // ---- paleta (2-3 pasos por material) ----
  const skinL = '#f2c9a0', skinM = '#d9a877', skinD = '#c2915f';            // piel
  const linL  = '#f2ead2', linM  = '#ddd0ad', linD  = '#cbbc93';            // lino (shendyt + mitra hedjet)
  const redL  = '#d85c50', redM  = '#c94f43', redD  = '#a83c34';            // corona roja deshret
  const gold  = '#e8a51e', goldH = '#fff0b0', goldD = '#b07d14';            // oro (collar, cayado, flagelo)
  const blue  = '#2f97d8';                                                  // azul del usej
  const beard = '#3a2c1c', beardH = '#5a4a32';                             // barba postiza

  // ============ SOMBRA DE SUELO (ancla) ============
  sombra(10, 7.06, 4.6, 2.0);

  // ============ PIERNAS (piel) ============
  // pierna izquierda
  poly([pt(-3.3,-13), pt(-0.6,-13), pt(-0.9,-0.4), pt(-3.4,-0.4)], skinL);
  poly([pt(-1.5,-13), pt(-0.6,-13), pt(-0.9,-0.4), pt(-1.7,-0.4)], skinM);   // borde interno en sombra
  // pierna derecha
  poly([pt(0.6,-13), pt(3.3,-13), pt(3.4,-0.4), pt(0.9,-0.4)], skinL);
  poly([pt(2.3,-13), pt(3.3,-13), pt(3.4,-0.4), pt(2.5,-0.4)], skinM);       // flanco derecho en sombra
  // pies apuntando al espectador
  ellipse(pt(-2.0,-0.2), 2.2 * s, 1.0 * s, skinM);
  ellipse(pt( 2.0,-0.2), 2.2 * s, 1.0 * s, skinM);

  // ============ FALDELLIN (shendyt) — lino ============
  poly([pt(-5,-13), pt(5,-13), pt(3.6,-22), pt(-3.6,-22)], linL);            // masa del kilt
  poly([pt(0,-13),  pt(5,-13), pt(3.6,-22), pt(0,-22)], linM);              // mitad derecha en sombra
  // panel/apron triangular central
  poly([pt(-2.4,-12.4), pt(2.4,-12.4), pt(1.3,-22), pt(-1.3,-22)], linL);
  line(pt(0,-22),    pt(0,-12.4),   linD, 0.5 * s);                          // pliegues verticales
  line(pt(-1.3,-21), pt(-1.9,-12.6), linD, 0.4 * s);
  line(pt( 1.3,-21), pt( 1.9,-12.6), linD, 0.4 * s);
  // cinturon dorado (cubre la costura torso/kilt)
  poly([pt(-4,-22), pt(4,-22), pt(3.7,-23.6), pt(-3.7,-23.6)], gold);
  line(pt(-3.7,-22.7), pt(3.7,-22.7), redM,  0.6 * s);                       // franja roja del cinto
  line(pt(-3.9,-23.5), pt(3.9,-23.5), goldD, 0.5 * s);                       // filo inferior en sombra

  // ============ TORSO (piel) — hombros anchos y regios ============
  poly([ptU(-3.6,-23), ptU(3.6,-23), ptU(5.6,-30), ptU(-5.6,-30)], skinL);  // trapecio invertido
  poly([ptU(0,-23),    ptU(3.6,-23), ptU(5.6,-30), ptU(0,-30)], skinM);     // costado derecho en sombra
  line(ptU(0,-30), ptU(0,-24), skinM, 0.5 * s);                             // linea esternal
  ellipse(ptU(-5.4,-30), 1.6 * s, 1.4 * s, skinL);                          // hombro luz
  ellipse(ptU( 5.4,-30), 1.6 * s, 1.4 * s, skinM);                          // hombro sombra

  // ============ COLLAR USEJ (disco ancho de bandas concentricas) ============
  ellipse(ptU(0,-27.8), 6.2 * s, 3.7 * s, gold);
  ellipse(ptU(0,-27.8), 5.0 * s, 2.9 * s, blue);
  ellipse(ptU(0,-27.8), 3.8 * s, 2.1 * s, gold);
  ellipse(ptU(0,-27.8), 2.4 * s, 1.3 * s, redM);
  // glint calido que late sobre el collar (micro-animacion)
  g.save();
  g.globalAlpha = 0.30 + 0.25 * Math.sin(t * 2.2);
  dot(ptU(-1.9,-27.9), 1.0 * s, goldH);
  g.restore();

  // ============ CUELLO ============
  poly([ptU(-1.6,-30), ptU(1.6,-30), ptU(1.4,-33.5), ptU(-1.4,-33.5)], skinL);
  poly([ptU(0,-30),    ptU(1.6,-30), ptU(1.4,-33.5), ptU(0,-33.5)], skinM);

  // ============ OREJAS ============
  dot(ptU(-3.0,-36.3), 0.9 * s, skinM);
  dot(ptU( 3.0,-36.3), 0.9 * s, skinM);

  // ============ ROSTRO ============
  ellipse(ptU(0,-36.5), 3.0 * s, 3.8 * s, skinL);                           // cara
  ellipse(ptU(0.9,-36.5), 2.1 * s, 3.6 * s, skinM);                         // media cara en sombra
  // ojos delineados estilo egipcio
  line(ptU(-1.7,-37.2), ptU(-0.6,-37.4), beard, 0.7 * s);
  line(ptU(-1.7,-37.2), ptU(-2.5,-36.9), beard, 0.5 * s);                   // rabillo izq
  line(ptU( 0.6,-37.4), ptU( 1.7,-37.2), beard, 0.7 * s);
  line(ptU( 1.7,-37.2), ptU( 2.5,-36.9), beard, 0.5 * s);                   // rabillo der
  line(ptU(-1.9,-38.2), ptU(-0.5,-38.3), beard, 0.5 * s);                   // cejas
  line(ptU( 0.5,-38.3), ptU( 1.9,-38.2), beard, 0.5 * s);
  line(ptU(0,-37), ptU(0.2,-35.2), skinM, 0.6 * s);                         // sombra de nariz
  line(ptU(-0.9,-34.4), ptU(0.9,-34.4), skinD, 0.6 * s);                    // boca

  // ============ BARBA POSTIZA (recta, cae sobre el pecho) ============
  poly([ptU(-1.0,-33.4), ptU(1.0,-33.4), ptU(0.95,-29.8), ptU(-0.95,-29.8)], beard);
  line(ptU(-0.5,-33.2), ptU(-0.5,-30.1), beardH, 0.5 * s);                  // brillo lateral
  line(ptU(-0.9,-32.4), ptU(0.9,-32.4), beardH, 0.4 * s);                   // bandas tejidas
  line(ptU(-0.9,-31.2), ptU(0.9,-31.2), beardH, 0.4 * s);
  line(ptU(-0.9,-30.4), ptU(0.9,-30.4), beardH, 0.4 * s);

  // ============ DOBLE CORONA PSCHENT ============
  // -- Deshret (roja): base ancha que envuelve la cabeza --
  poly([ptU(-4.4,-38), ptU(4.4,-38), ptU(3.4,-45.5), ptU(-3.4,-45.5)], redM);
  poly([ptU(0,-38),    ptU(4.4,-38), ptU(3.4,-45.5), ptU(0,-45.5)], redD);  // lado derecho en sombra
  line(ptU(-4.2,-38.5), ptU(-3.3,-45.2), redL, 0.9 * s);                    // arista de luz
  line(ptU(-4.3,-38.2), ptU(4.3,-38.2), gold, 0.8 * s);                     // diadema/aro dorado
  // -- alzado trasero rojo (asoma detras/alrededor de la mitra) --
  poly([ptU(-2.8,-45.5), ptU(2.8,-45.5), ptU(1.9,-51.5), ptU(-1.9,-51.5)], redM);
  ellipse(ptU(0,-51.3), 2.0 * s, 1.1 * s, redM);
  poly([ptU(0,-45.5), ptU(2.8,-45.5), ptU(1.9,-51.5), ptU(0,-51.5)], redD);
  // -- Hedjet (mitra blanca alta y bulbosa: el punto mas alto) --
  poly([ptU(-2.6,-43), ptU(2.6,-43), ptU(1.7,-52), ptU(-1.7,-52)], linL);   // cono
  poly([ptU(0,-43),    ptU(2.6,-43), ptU(1.7,-52), ptU(0,-52)], linM);      // sombra del cono
  ellipse(ptU(0,-53), 2.0 * s, 2.4 * s, linL);                             // bulbo superior
  ellipse(ptU(0.7,-53), 1.3 * s, 2.2 * s, linM);                           // sombra del bulbo
  dot(ptU(-0.7,-54.2), 0.7 * s, goldH);                                    // brillo tenue del bulbo
  // -- espiral frontal de la Deshret (rulo caracteristico sobre la frente) --
  g.save();
  g.strokeStyle = gold; g.lineWidth = 0.9 * s; g.lineCap = 'round';
  g.beginPath();
  g.moveTo(ptU(0,-44).x, ptU(0,-44).y);
  g.quadraticCurveTo(ptU(1.2,-41.5).x, ptU(1.2,-41.5).y, ptU(0.3,-39.7).x, ptU(0.3,-39.7).y);
  g.stroke();
  g.beginPath();
  g.arc(ptU(0.2,-39.9).x, ptU(0.2,-39.9).y, 0.9 * s, -0.6, Math.PI * 1.5);  // ricito
  g.stroke();
  g.restore();

  // ============ BRAZOS CRUZADOS + REGALIA ============
  // antebrazos cruzados sobre el pecho (detras de los cetros)
  line(ptU(-3.6,-23), ptU(1.6,-25),  skinM, 2.6 * s);                       // antebrazo trasero
  line(ptU( 3.6,-23), ptU(-1.6,-25), skinL, 2.6 * s);                       // antebrazo delantero
  // cayado (heka) y flagelo (nejej) cruzados en X: nucleo oscuro + brillo dorado
  line(ptU(1.6,-25), ptU(-4.2,-31.5), goldD, 1.8 * s);                      // vara del cayado
  line(ptU(1.6,-25), ptU(-4.2,-31.5), gold,  1.0 * s);
  line(ptU(-1.6,-25), ptU(4.0,-31.5), goldD, 1.8 * s);                      // vara del flagelo
  line(ptU(-1.6,-25), ptU(4.0,-31.5), gold,  1.0 * s);
  // manos que empunan (nudos de piel sobre las varas)
  dot(ptU(1.6,-25),  1.6 * s, skinM);
  dot(ptU(-1.6,-25), 1.6 * s, skinL);
  // gancho del cayado (heka) sobre el hombro izquierdo
  g.save();
  g.strokeStyle = gold; g.lineWidth = 1.3 * s; g.lineCap = 'round';
  g.beginPath();
  g.moveTo(ptU(-4.2,-31.5).x, ptU(-4.2,-31.5).y);
  g.quadraticCurveTo(ptU(-4.9,-33.9).x, ptU(-4.9,-33.9).y, ptU(-3.6,-33.9).x, ptU(-3.6,-33.9).y);
  g.quadraticCurveTo(ptU(-2.8,-33.9).x, ptU(-2.8,-33.9).y, ptU(-3.0,-32.7).x, ptU(-3.0,-32.7).y);
  g.stroke();
  g.restore();
  // cabeza del flagelo (nejej): mango + tres tiras colgantes con perlas que oscilan
  dot(ptU(4.0,-32), 1.1 * s, goldD);                                        // remate del mango
  for (let k = 0; k < 3; k++) {
    const off  = (k - 1) * 0.55;                                            // separacion de las tiras
    const sway = Math.sin(t * 3.2 + k * 2.1) * 0.7 * s;                     // oscilacion sutil
    const top  = ptU(3.8 + off, -32.2);
    const base = ptU(3.6 + off, -28.6);
    const end  = { x: base.x + sway, y: base.y };
    line(top, end, gold, 0.9 * s);
    dot(end, 0.8 * s, goldH);                                               // perla del extremo
  }
}

function drawGranZigurat(t) {
  const s = zoom;

  // ====== Geometria maestra (las tres terrazas comparten el centro) ======
  const bx = 4.4, by = 1.8;                  // esquina origen (min x, min y) de la base
  const W1 = 3.2, D1 = 3.2;                  // huella de la terraza inferior (~3.2 tiles)
  const cx = bx + W1 / 2, cy = by + D1 / 2;  // centro comun = (16.4, 2.9)
  const H1 = 32, H2 = 26, H3 = 20;           // altura de cada terraza (total 78 en z)
  const zB2 = H1, zB3 = H1 + H2;             // cotas de arranque de terraza 2 y 3
  const zCorona = H1 + H2 + H3;              // 78: plataforma de la cima
  const yF = by + D1, xF = bx + W1;          // planos de las caras frontales (+y=4.5, +x=18.0)

  // ====== Sombra de suelo: ancha y pesada + sombra propia del pie de la escalinata ======
  sombra(cx + 0.2, cy + 0.9, 80, 36);        // el peso de toda la mole, bien anclado
  sombra(cx, yF + 1.0, 30, 13);              // ancla el arranque de la escalinata central

  // ====== Paletas de adobe (top=luz / cara +y=media / cara +x=sombra) ======
  const T1t = '#dcbd8f', T1l = '#cdaa77', T1r = '#a8935a';
  const T2t = '#e0c294', T2l = '#d3b17e', T2r = '#b08a55';
  const T3t = '#e6caa0', T3l = '#d9b98a', T3r = '#bd9a63';

  // ====== helpers locales: grooves de los contrafuertes verticales ======
  function butY(x0, w, yPlane, z0, h, n, col, lw) {   // sobre la cara +y (frente)
    g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round';
    for (let k = 1; k < n; k++) {
      const xi = x0 + (w * k) / n, a = P(xi, yPlane, z0 + 1), b = P(xi, yPlane, z0 + h - 1);
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    }
  }
  function butX(y0, d, xPlane, z0, h, n, col, lw) {   // sobre la cara +x (costado)
    g.strokeStyle = col; g.lineWidth = lw; g.lineCap = 'round';
    for (let k = 1; k < n; k++) {
      const yi = y0 + (d * k) / n, a = P(xPlane, yi, z0 + 1), b = P(xPlane, yi, z0 + h - 1);
      g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    }
  }

  // ====== TERRAZA 1 (la mas ancha, el basamento) ======
  isoBox(bx, by, W1, D1, H1, T1t, T1l, T1r, 0);
  butX(by, D1, xF, 0, H1, 7, 'rgba(120,92,60,.42)', 1.5 * s);
  butY(bx, W1, yF, 0, H1, 7, 'rgba(150,113,76,.32)', 1.5 * s);

  // ====== TERRAZA 2 (recogida y centrada, deja anden visible arriba) ======
  const bx2 = bx + 0.55, by2 = by + 0.55, W2 = 2.1, D2 = 2.1, yF2 = by2 + D2, xF2 = bx2 + W2;
  isoBox(bx2, by2, W2, D2, H2, T2t, T2l, T2r, zB2);
  butX(by2, D2, xF2, zB2, H2, 6, 'rgba(120,92,60,.42)', 1.35 * s);
  butY(bx2, W2, yF2, zB2, H2, 6, 'rgba(150,113,76,.32)', 1.35 * s);

  // ====== TERRAZA 3 (la mas alta y estrecha) ======
  const bx3 = bx + 1.0, by3 = by + 1.0, W3 = 1.2, D3 = 1.2, yF3 = by3 + D3, xF3 = bx3 + W3;
  isoBox(bx3, by3, W3, D3, H3, T3t, T3l, T3r, zB3);
  butX(by3, D3, xF3, zB3, H3, 5, 'rgba(120,92,60,.42)', 1.2 * s);
  butY(bx3, W3, yF3, zB3, H3, 5, 'rgba(150,113,76,.32)', 1.2 * s);

  // ====== Cornisas: labios oscuros en los cantos superiores de cada frente ======
  const corn = 'rgba(118,90,58,.55)';
  line(P(bx, yF, H1), P(xF, yF, H1), corn, 1.6 * s);
  line(P(xF, by, H1), P(xF, yF, H1), corn, 1.6 * s);
  line(P(bx2, yF2, zB3), P(xF2, yF2, zB3), corn, 1.4 * s);
  line(P(xF2, by2, zB3), P(xF2, yF2, zB3), corn, 1.4 * s);
  line(P(bx3, yF3, zCorona), P(xF3, yF3, zCorona), corn, 1.3 * s);
  line(P(xF3, by3, zCorona), P(xF3, yF3, zCorona), corn, 1.3 * s);

  // ====== LA GRAN ESCALINATA TRIPLE (sobre la cara +y de la terraza 1) ======
  const stairFace = '#dcbf94';                 // piedra de la escalera, algo mas clara que el muro
  const stepDk = 'rgba(88,64,40,.85)';

  // --- rampa lateral izquierda: del canto inferior izq hacia el centro-alto ---
  const L_b1 = P(bx + 0.15, yF, 0), L_b2 = P(bx + 1.15, yF, 0);
  const L_t1 = P(cx - 0.55, yF, H1), L_t2 = P(cx - 0.05, yF, H1);
  poly([L_b1, L_b2, L_t2, L_t1], stairFace);
  // --- rampa lateral derecha (espejo), convergiendo al mismo vertice central ---
  const R_b1 = P(xF - 1.15, yF, 0), R_b2 = P(xF - 0.15, yF, 0);
  const R_t1 = P(cx + 0.05, yF, H1), R_t2 = P(cx + 0.55, yF, H1);
  poly([R_b1, R_b2, R_t2, R_t1], stairFace);
  // --- peldanos de las dos laterales (interpolacion afin en pantalla) ---
  g.strokeStyle = stepDk; g.lineWidth = 1.1 * s; g.lineCap = 'round';
  const NL = 9;
  for (let k = 1; k < NL; k++) {
    const u = k / NL;
    let a = { x: lerp(L_b1.x, L_t1.x, u), y: lerp(L_b1.y, L_t1.y, u) };
    let b = { x: lerp(L_b2.x, L_t2.x, u), y: lerp(L_b2.y, L_t2.y, u) };
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
    a = { x: lerp(R_b1.x, R_t1.x, u), y: lerp(R_b1.y, R_t1.y, u) };
    b = { x: lerp(R_b2.x, R_t2.x, u), y: lerp(R_b2.y, R_t2.y, u) };
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
  }

  // --- escalinata central perpendicular: sobresale hacia el frente y sube al centro ---
  const PROJ = 1.8, wC = 0.5;                  // cuanto sobresale y semiancho de la rampa
  const footL = P(cx - wC, yF + PROJ, 0), footR = P(cx + wC, yF + PROJ, 0);
  const headL = P(cx - wC, yF, H1), headR = P(cx + wC, yF, H1);
  poly([footR, headR, P(cx + wC, yF, 0)], '#9c8352'); // costado +x de la rampa, en sombra
  poly([footL, footR, headR, headL], '#e4c898');      // superficie superior de la rampa, a la luz
  g.strokeStyle = stepDk; g.lineWidth = 1.2 * s;
  const NC = 13;
  for (let k = 1; k < NC; k++) {               // peldanos de la rampa central
    const u = k / NC, yy = lerp(yF + PROJ, yF, u), zz = lerp(0, H1, u);
    const a = P(cx - wC, yy, zz), b = P(cx + wC, yy, zz);
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke();
  }

  // --- portal en la base de la terraza 2, donde converge la escalinata ---
  poly([P(cx - 0.3, yF2, zB2), P(cx + 0.3, yF2, zB2), P(cx + 0.24, yF2, zB2 + 8), P(cx - 0.24, yF2, zB2 + 8)], '#33261a');

  // ====== SANTUARIO en la cima (ladrillo vidriado azul, cornisa dorada) ======
  const sx = cx - 0.45, sy = cy - 0.45, sw = 0.9, sd = 0.9, sh = 11;
  isoBox(sx, sy, sw, sd, sh, '#4fb0e8', '#2f97d8', '#2377ab', zCorona);
  poly([P(cx - 0.16, sy + sd, zCorona), P(cx + 0.16, sy + sd, zCorona), P(cx + 0.16, sy + sd, zCorona + 6.5), P(cx - 0.16, sy + sd, zCorona + 6.5)], '#173a52'); // la puerta
  line(P(sx, sy + sd, zCorona + sh), P(sx + sw, sy + sd, zCorona + sh), '#e8a51e', 1.4 * s);  // cornisa dorada
  line(P(sx + sw, sy, zCorona + sh), P(sx + sw, sy + sd, zCorona + sh), '#c9861a', 1.4 * s);
  { // EL ESTANDARTE de la señora: un gallardete dorado que el viento de la cima no suelta
    const base2 = P(cx - 0.62, sy + sd, zCorona), bp2 = P(cx - 0.62, sy + sd, zCorona + 16);
    line(base2, bp2, '#8a6a4a', 1.3 * s);
    const w1 = Math.sin(t * 3.1) * 2.2 * s, w2 = Math.sin(t * 3.1 + 1.2) * 3 * s;
    g.fillStyle = '#e8b83a';
    g.beginPath(); g.moveTo(bp2.x, bp2.y);
    g.quadraticCurveTo(bp2.x + 6 * s, bp2.y + 1 * s + w1, bp2.x + 12 * s, bp2.y + 1.5 * s + w2);
    g.lineTo(bp2.x + 11 * s, bp2.y + 4.2 * s + w2);
    g.quadraticCurveTo(bp2.x + 5 * s, bp2.y + 3.8 * s + w1, bp2.x, bp2.y + 3.2 * s);
    g.closePath(); g.fill();
  }
  { // LA ESTRELLA DE OCHO PUNTAS sobre la puerta: el signo de Inanna. De noche ARDE (es el lucero),
    // y cuando Enheduanna le canta, arde más un buen rato: la diosa escuchó.
    const st = P(cx + 0.28, sy + sd, zCorona + 7.6);
    const noche = 1 - luzDia();
    const canto = Math.max(0, 1 - (tFrame - himnoGlowT) / 35);
    const brillo = 0.35 + noche * 0.65 + canto * 0.8;
    if (noche > 0.1 || canto > 0.05) { // el halo del lucero
      const R = (7 + noche * 5 + canto * 6) * s * (1 + Math.sin(t * 2.6) * 0.08);
      const gl = g.createRadialGradient(st.x, st.y, 0, st.x, st.y, R);
      gl.addColorStop(0, `rgba(255,233,176,${0.35 * brillo})`); gl.addColorStop(1, 'rgba(255,233,176,0)');
      g.fillStyle = gl; g.fillRect(st.x - R, st.y - R, R * 2, R * 2);
    }
    g.save(); g.globalAlpha = Math.min(1, 0.55 + brillo * 0.45 + Math.sin(t * 6) * 0.08 * noche); // titila de noche
    g.strokeStyle = '#f2cf7e'; g.lineWidth = 1.1 * s; g.lineCap = 'round';
    for (let k = 0; k < 8; k++) {
      const a = k * Math.PI / 4, r = (k % 2 ? 2.1 : 3.4) * (1 + canto * 0.25) * s;
      g.beginPath(); g.moveTo(st.x, st.y); g.lineTo(st.x + Math.cos(a) * r, st.y + Math.sin(a) * r); g.stroke();
    }
    dot(st, (1.1 + canto * 0.4) * s, '#ffe9b0');
    g.restore();
  }

  // ====== LA LLAMA SAGRADA sobre el santuario (parpadeo y halo con t) ======
  const zShr = zCorona + sh;
  const bp = P(cx, cy - 0.05, zShr), sz = zoom;
  g.fillStyle = '#5a3b24';                      // el brasero
  g.fillRect(bp.x - 1.9 * sz, bp.y - 1.4 * sz, 3.8 * sz, 2.2 * sz);
  const fl = 1 + Math.sin(t * 7) * 0.22 + Math.sin(t * 13) * 0.08;   // parpadeo de la altura
  const R = 16 * sz * (0.9 + 0.12 * Math.sin(t * 5));                // halo pulsante
  const halo = g.createRadialGradient(bp.x, bp.y - 4 * sz, 0, bp.x, bp.y - 4 * sz, R);
  halo.addColorStop(0, 'rgba(255,206,110,0.55)');
  halo.addColorStop(0.5, 'rgba(240,150,40,0.22)');
  halo.addColorStop(1, 'rgba(240,150,40,0)');
  g.fillStyle = halo; g.beginPath(); g.arc(bp.x, bp.y - 4 * sz, R, 0, 7); g.fill();
  poly([{ x: bp.x - 1.7 * sz, y: bp.y - 1 * sz }, { x: bp.x + Math.sin(t * 5) * 0.7 * sz, y: bp.y - 9 * fl * sz }, { x: bp.x + 1.7 * sz, y: bp.y - 1 * sz }], '#e8791e'); // llama externa
  poly([{ x: bp.x - 1.0 * sz, y: bp.y - 1 * sz }, { x: bp.x + Math.sin(t * 7 + 1) * 0.5 * sz, y: bp.y - 6.2 * fl * sz }, { x: bp.x + 1.0 * sz, y: bp.y - 1 * sz }], '#f6c33a'); // llama interna
  dot({ x: bp.x + Math.sin(t * 6) * 0.3 * sz, y: bp.y - 3 * sz }, 1.1 * sz, '#fff0b0'); // corazon brillante
}

function drawLamassu(x, y, dir, t) {  // dir 1 o -1 espeja la pareja
  // ---- ancla y sistema de coordenadas en ESPACIO DE PANTALLA ----
  const s = zoom;
  const p0 = P(x, y);
  // pt(dx,dz): dx = avance horizontal (dir lo espeja), dz = altura sobre el suelo
  const pt = (dx, dz) => ({ x: p0.x + dir * dx * s, y: p0.y - dz * s });

  // ---- paleta alabastro (piedra clara del lamassu) ----
  const LUZ = '#efe6cd', CLARA = '#e2d5b4', MED = '#cdbc94', SOM = '#c6b58b',
        DEEP = '#b8a57e', OSC = '#a8935a', RANURA = '#8a7551', TINTA = '#3a2c1c';
  // adobe/piedra oscura para el plinto y matices
  const ADOBE_T = '#d0af7c', ADOBE_F = '#b08a55', ADOBE_S = '#96714c', ADOBE_B = '#6b5334';
  const ORO = '#e8a51e', BRILLO = '#fff0b0';

  // pulsos lentos y deterministas para micro-brillos (solo con t)
  const gl = 0.5 + 0.5 * Math.sin(t * 1.7);
  const gl2 = 0.5 + 0.5 * Math.sin(t * 1.7 + 2.1);

  // ---- helpers locales (curva y cuerno con quadraticCurveTo) ----
  function curve(a, b, c, col, w) {              // ranura curva a->c con control b
    g.beginPath(); g.moveTo(a.x, a.y);
    g.quadraticCurveTo(b.x, b.y, c.x, c.y);
    g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.stroke();
  }
  function horn(bx, bz, l, col) {                // cuerno-creciente de la tiara, proyecta al frente
    const a = pt(bx, bz), tip = pt(bx + l, bz - l * 0.35), c = pt(bx + l * 0.5, bz + l * 0.28);
    g.beginPath(); g.moveTo(a.x, a.y);
    g.quadraticCurveTo(pt(bx + l * 1.05, bz + l * 0.28).x, pt(bx + l * 1.05, bz + l * 0.28).y, tip.x, tip.y);
    g.quadraticCurveTo(pt(bx + l * 0.55, bz + l * 0.02).x, pt(bx + l * 0.55, bz + l * 0.02).y, c.x, c.y);
    g.closePath(); g.fillStyle = col; g.fill();
  }
  function leg(cx, foot, top, w, cf, cs, ch) {   // pata: cara luz + franja sombra + pezuña
    const x0 = cx - w / 2, x1 = cx + w / 2;
    poly([pt(x0, foot), pt(x1, foot), pt(x1, top), pt(x0, top)], cf);                    // cara frontal iluminada
    poly([pt(x0, foot), pt(x0 + w * 0.34, foot), pt(x0 + w * 0.34, top), pt(x0, top)], cs); // franja de sombra trasera
    poly([pt(x0 - 0.15, foot), pt(x1 + 0.15, foot), pt(x1 + 0.15, foot + 1.1), pt(x0 - 0.15, foot + 1.1)], ch); // pezuña
    line(pt(cx, foot), pt(cx, foot + 1.0), '#5a4227', 0.7 * s);                          // hendidura de la pezuña
    line(pt(x0 + 0.15, foot + 1.7), pt(x1 - 0.15, foot + 1.7), cs, 0.6 * s);             // menudillo
  }
  function pluma(bx, bz, len, wid, lean, col) {  // pluma apuntando abajo-adelante
    const top = pt(bx, bz), l = pt(bx - wid, bz - len * 0.3), r = pt(bx + wid * 0.8, bz - len * 0.3), tip = pt(bx + lean, bz - len);
    poly([top, l, tip, r], col);
    line(pt(bx, bz - len * 0.2), tip, RANURA, 0.5 * s);  // raquis (nervadura central)
  }

  // ========================= SOMBRA DE SUELO =========================
  sombra(x, y + 0.05, 11, 4.2);

  // ========================= PLINTO DE PIEDRA =========================
  // cara frontal del pedestal
  poly([pt(-17, 0), pt(13, 0), pt(13, 3), pt(-17, 3)], ADOBE_F);
  // cara superior recede hacia atras (arriba) para dar volumen iso
  poly([pt(-17, 3), pt(13, 3), pt(11, 4.7), pt(-19, 4.7)], ADOBE_T);
  // moldura clara del canto superior
  poly([pt(-17, 2.6), pt(13, 2.6), pt(13, 3), pt(-17, 3)], '#c9a875');
  // penumbra al pie del plinto
  poly([pt(-17, 0), pt(13, 0), pt(13, 0.6), pt(-17, 0.6)], ADOBE_B);
  // sillares del plinto (cursos + juntas alternadas)
  line(pt(-17, 1), pt(13, 1), ADOBE_B, 0.5 * s);
  line(pt(-17, 2), pt(13, 2), ADOBE_B, 0.5 * s);
  for (let i = 0; i < 6; i++) { line(pt(-15 + i * 5, 0), pt(-15 + i * 5, 1), ADOBE_B, 0.4 * s); }       // curso bajo
  for (let i = 0; i < 6; i++) { line(pt(-12.5 + i * 5, 1), pt(-12.5 + i * 5, 2), ADOBE_B, 0.4 * s); }   // curso medio (desfasado)
  for (let i = 0; i < 6; i++) { line(pt(-15 + i * 5, 2), pt(-15 + i * 5, 3), ADOBE_B, 0.4 * s); }       // curso alto
  // juntas del canto superior
  for (let i = 0; i < 5; i++) { line(pt(-13 + i * 5, 3), pt(-14 + i * 5, 4.7), ADOBE_B, 0.35 * s); }

  // ========================= PATAS TRASERAS/DELANTERAS LEJANAS =========================
  // (piedra mas oscura y elevadas por el retranqueo: leen como el lado del fondo)
  leg(-10, 4.4, 12, 2.6, OSC, RANURA, ADOBE_B);   // trasera lejana
  leg(8, 4.4, 12.5, 2.5, OSC, RANURA, ADOBE_B);   // delantera lejana (aporta el guiño de la 5a pata)

  // ========================= COLA =========================
  // cuelga tras el anca; se dibuja antes del cuerpo para quedar detras
  curve(pt(-14.5, 18), pt(-16.8, 12), pt(-15.6, 7.6), SOM, 1.5 * s);
  dot(pt(-15.6, 7.2), 1.3 * s, MED);                       // borla de la cola
  line(pt(-16.1, 7.4), pt(-15.1, 6.4), RANURA, 0.5 * s);   // mechon de la borla

  // ========================= CUERPO DEL TORO =========================
  // masa principal (flanco cercano iluminado)
  const cuerpo = [
    pt(8.5, 11), pt(9, 15.5), pt(7.8, 18.8), pt(5.5, 20.6),
    pt(-3, 20.9), pt(-11, 20.2), pt(-15, 18.5), pt(-15.5, 13),
    pt(-13, 11.2), pt(-2, 11)
  ];
  poly(cuerpo, CLARA);
  // brillo del lomo (banda superior)
  poly([pt(5.5, 20.6), pt(-3, 20.9), pt(-11, 20.2), pt(-15, 18.5),
        pt(-15, 17.6), pt(-11, 19.3), pt(-3, 20), pt(5.2, 19.7)], LUZ);
  // sombra del vientre (banda inferior) + penumbra fuerte bajo la panza
  poly([pt(-13, 11.2), pt(-2, 11), pt(8.5, 11), pt(8.5, 12.4), pt(-2, 12.4), pt(-13, 12.7)], SOM);
  poly([pt(-11, 11.1), pt(3, 11), pt(3, 11.7), pt(-11, 11.8)], OSC);
  // anca musculosa (elipse con luz) + surco que la separa del lomo
  ellipse(pt(-12.3, 15.6), 3.9 * s, 4.7 * s, MED);
  ellipse(pt(-13.1, 16.5), 2.3 * s, 2.9 * s, CLARA);
  curve(pt(-9, 19.6), pt(-11.6, 16), pt(-10.6, 12), RANURA, 0.9 * s);
  // musculo del hombro y costillas del flanco delantero
  curve(pt(6.6, 19.5), pt(5, 15), pt(6.2, 11.6), MED, 0.8 * s);
  line(pt(4.6, 17.2), pt(3.1, 13.6), MED, 0.6 * s);
  line(pt(6.1, 16.6), pt(4.8, 13.1), MED, 0.6 * s);
  // sillares/veta de la caliza en el flanco (textura fina)
  line(pt(-2, 20.4), pt(-2, 12), RANURA, 0.35 * s);
  line(pt(-7, 20.2), pt(-7, 12.2), RANURA, 0.35 * s);
  line(pt(-14, 17), pt(2, 15.6), RANURA, 0.35 * s);

  // ========================= PATAS CERCANAS (con la 5a pata) =========================
  leg(-13, 3, 11.6, 2.9, CLARA, SOM, ADOBE_S);    // trasera cercana
  leg(5, 3, 12, 2.6, CLARA, SOM, ADOBE_S);        // delantera media (la "5a" del truco)
  leg(10.8, 3, 12.2, 2.7, CLARA, SOM, ADOBE_S);   // delantera cercana, en zancada

  // ========================= ALA PLEGADA =========================
  // plancha del ala (sube tras el lomo y drapea sobre el flanco cercano)
  const ala = [
    pt(2, 15), pt(4, 19.5), pt(2.5, 25), pt(0, 29), pt(-4.5, 30.5),
    pt(-10, 28.5), pt(-13, 24), pt(-13.5, 19),
    pt(-11, 15.5), pt(-7.5, 14.5), pt(-3.5, 14), pt(0, 14.3)
  ];
  poly(ala, CLARA);
  // sombra propia del ala contra el cuerpo (borde inferior-frontal)
  poly([pt(2, 15), pt(0, 14.3), pt(-3.5, 14), pt(-3.5, 14.9), pt(0, 15.1), pt(2, 15.8)], SOM);
  // filas de plumas (de abajo hacia arriba, como tejas): primarias -> secundarias -> coberteras
  for (let i = 0; i < 8; i++) { const f = i / 7; pluma(lerp(0.5, -11.5, f), lerp(17.2, 18.6, f), 4.6, 1.35, 1.1, i % 2 ? MED : CLARA); }   // primarias largas
  for (let i = 0; i < 8; i++) { const f = i / 7; pluma(lerp(0.8, -11, f), lerp(20, 22.6, f), 3.3, 1.25, 0.5, i % 2 ? CLARA : LUZ); }        // secundarias
  for (let i = 0; i < 7; i++) { const f = i / 6; pluma(lerp(1.8, -8.8, f), lerp(23.6, 26.3, f), 2.2, 1.0, 0.2, i % 2 ? MED : LUZ); }        // coberteras (pequeñas)
  // hueso/borde de ataque del ala, iluminado
  curve(pt(4, 19.5), pt(2, 26), pt(-4.5, 30.5), LUZ, 1.3 * s);
  curve(pt(-4.5, 30.5), pt(-8, 30), pt(-13, 24), MED, 1.0 * s);

  // ========================= CABEZA HUMANA =========================
  // cuello (queda tras la barba)
  poly([pt(4.5, 19.5), pt(6.8, 19), pt(9.2, 24.8), pt(7, 25.2)], MED);
  // melena rizada tras la oreja (masa)
  poly([pt(6.8, 30.6), pt(8.4, 31.2), pt(8, 28), pt(7.5, 25.4), pt(6.2, 25.6), pt(6, 28.5)], MED);
  for (let i = 0; i < 3; i++) { dot(pt(6.9, 26 + i * 1.5), 0.8 * s, i % 2 ? SOM : MED); }  // rizos de la nuca
  // masa de la cara (perfil con frente, nariz y menton proyectados)
  const cara = [
    pt(8.5, 31.4), pt(10.6, 31), pt(11.2, 30), pt(11.5, 29), pt(12.2, 28),
    pt(11.2, 27.6), pt(11.5, 27.2), pt(11.2, 26.9), pt(11.3, 26.2),
    pt(9.5, 25.4), pt(7.2, 25), pt(6.6, 27.5), pt(6.8, 30.5)
  ];
  poly(cara, LUZ);
  // penumbra de mejilla/mandibula
  poly([pt(6.6, 27.5), pt(7.2, 25), pt(8.6, 25.3), pt(8.3, 27.8), pt(7, 30.2)], MED);
  // sombra bajo la nariz y el arco superciliar
  poly([pt(11.2, 27.6), pt(12.2, 28), pt(11, 27.4)], MED);
  // oreja + arete de oro
  ellipse(pt(7.7, 28.5), 1.1 * s, 1.6 * s, CLARA);
  ellipse(pt(7.8, 28.5), 0.55 * s, 0.9 * s, MED);
  dot(pt(7.7, 26.9), 1.0 * s, ORO);
  dot(pt(7.7, 26.9), 0.45 * s, MED);
  dot(pt(7.4, 27.1), (0.25 + 0.35 * gl2) * s, BRILLO);   // destello del arete
  // ceja gruesa asiria + ojo almendrado enorme
  poly([pt(8.7, 30.1), pt(11.2, 30.3), pt(11.1, 29.7), pt(8.8, 29.5)], MED);
  poly([pt(8.9, 29.3), pt(10, 29.9), pt(11.1, 29.3), pt(10, 28.8)], LUZ, TINTA, 0.7 * s);
  dot(pt(10.1, 29.3), 0.55 * s, TINTA);                  // iris
  dot(pt(9.9 + 0.12 * Math.sin(t * 0.9), 29.45), (0.14 + 0.16 * gl) * s, BRILLO); // brillo vivo del ojo
  line(pt(11.5, 29), pt(11.2, 27.2), RANURA, 0.5 * s);   // perfil de la nariz

  // ========================= BARBA RIZADA (bucles) =========================
  const barba = [
    pt(11.3, 26.2), pt(11.7, 23.5), pt(11.2, 20.8), pt(10.2, 18.9),
    pt(8.4, 18.7), pt(7.1, 20), pt(6.9, 23), pt(7.6, 25.2), pt(9.6, 25.5), pt(11, 26)
  ];
  poly(barba, MED);
  // borde frontal iluminado de la barba
  poly([pt(11.3, 26.2), pt(11.7, 23.5), pt(11.2, 20.8), pt(10.5, 20.9), pt(11, 23.4), pt(10.7, 25.9)], SOM);
  // filas de rizos (ringlets) en retícula, alternando tono
  for (let r = 0; r < 4; r++) {
    const bz = 24.2 - r * 1.7, xa = 10.9 - r * 0.25, xb = 7.5 + r * 0.15, n = 4;
    for (let i = 0; i < n; i++) {
      const cx = lerp(xa, xb, i / (n - 1));
      dot(pt(cx, bz), 0.85 * s, (i + r) % 2 ? CLARA : SOM);           // bucle
      line(pt(cx - 0.7, bz - 0.25), pt(cx + 0.7, bz - 0.25), RANURA, 0.45 * s); // hendidura del bucle
    }
  }

  // ========================= TIARA DE CUERNOS =========================
  // cuerpo de la corona (polos) iluminado + franja de sombra trasera
  poly([pt(6.8, 31), pt(9.5, 31.2), pt(11, 31.4), pt(10.6, 35.3), pt(8.8, 36), pt(7, 35.6), pt(6.4, 32.8)], LUZ);
  poly([pt(6.4, 32.8), pt(7, 35.6), pt(8, 35.9), pt(7.7, 32.4), pt(6.9, 31)], MED);
  // bandas horizontales y aro de oro central
  line(pt(6.6, 32.2), pt(10.9, 32.4), RANURA, 0.6 * s);
  poly([pt(6.7, 33.2), pt(10.9, 33.4), pt(10.8, 33.9), pt(6.7, 33.7)], ORO);
  line(pt(6.7, 34.6), pt(10.7, 34.8), RANURA, 0.6 * s);
  dot(pt(9.4, 32.8), 0.4 * s, ORO);                      // rosetas-mosaico
  dot(pt(9.2, 34.2), 0.4 * s, ORO);
  // pares de cuernos de toro (la tiara divina), en tres pisos al frente
  horn(10.4, 31.9, 2.0, CLARA); horn(10.5, 31.9, 2.0, MED);   // piso bajo (luz+sombra)
  horn(10.5, 33.2, 1.9, CLARA);
  horn(10.4, 34.4, 1.7, CLARA);
  // remate redondeado y finial de oro con destello
  ellipse(pt(8.8, 35.9), 2.1 * s, 0.9 * s, LUZ);
  dot(pt(8.8, 36.4), 0.9 * s, ORO);
  dot(pt(8.6, 36.6), (0.4 + 0.6 * gl) * s, BRILLO);      // glint animado del finial (antorcha del portal)
  // banda de oro sobre la frente
  line(pt(8.6, 30.9), pt(10.9, 30.9), ORO, 0.7 * s);
}

function drawEstatuaRey(x, y) { // estatua votiva del rey estilo Gudea de Lagash: diorita pulida, manos juntas en oracion
  const s = zoom;
  const p0 = P(x, y);
  const pt = (dx, dz) => ({ x: p0.x + dx * s, y: p0.y - dz * s });
  const PIED = '#5c6258', PIED_L = '#727a6b', PIED_D = '#454b42', PIED_LL = '#8a9280'; // diorita verde-oscura
  const OJO = '#efe8d6', OJO_D = '#332f28';
  sombra(x, y + 0.08, 8.5, 3.6);
  isoBox(x - 0.42, y - 0.42, 0.84, 0.84, 6, '#c9a875', '#b08a55', '#96714c', 0); // pedestal claro
  for (let k = 0; k < 4; k++) line(pt(-4, 1.6 + k * 0.5), pt(4, 1.6 + k * 0.5), 'rgba(90,68,42,.45)', 0.5 * s); // renglones
  poly([pt(-6, 6), pt(6, 6), pt(5.4, 20), pt(4, 24.5), pt(-4, 24.5), pt(-5.4, 20)], PIED); // tunica troncoconica
  poly([pt(-6, 6), pt(-1, 6), pt(-0.7, 24.5), pt(-4, 24.5), pt(-5.4, 20)], PIED_L); // cara al sol
  line(pt(-4.6, 20.5), pt(3.6, 14.5), PIED_D, 1.2 * s); // borde del manto sobre el pecho
  ellipse(pt(-2.3, 6.2), 2 * s, 1.1 * s, PIED_D); ellipse(pt(2.3, 6.2), 2 * s, 1.1 * s, PIED_D); // pies
  poly([pt(-4.4, 19.6), pt(4.4, 19.6), pt(3.5, 15.4), pt(-3.5, 15.4)], PIED_L); // antebrazos
  ellipse(pt(0, 17.4), 2.5 * s, 1.9 * s, PIED_LL); line(pt(0, 18.6), pt(0, 16.2), PIED_D, 0.6 * s); // manos juntas
  poly([pt(-1.7, 24.5), pt(1.7, 24.5), pt(1.5, 26.4), pt(-1.5, 26.4)], PIED); // cuello
  ellipse(pt(0, 28.8), 4 * s, 4.5 * s, PIED_L); ellipse(pt(1.3, 28.6), 2.5 * s, 4 * s, PIED); // cabeza + media sombra
  for (const ex of [-1.5, 1.5]) { // ojos grandes serenos (rasgo Gudea)
    ellipse(pt(ex, 29.2), 1.35 * s, 0.9 * s, OJO); dot(pt(ex, 29.2), 0.5 * s, OJO_D);
    line(pt(ex - 1.4, 30.2), pt(ex + 1.3, 30.3), OJO_D, 0.6 * s);
  }
  line(pt(0, 28.9), pt(0, 27.6), PIED_D, 0.5 * s); line(pt(-1.1, 27), pt(1.1, 27), PIED_D, 0.7 * s); // nariz + boca
  ellipse(pt(0, 32), 4.8 * s, 3.2 * s, PIED); ellipse(pt(-0.8, 32.6), 3.2 * s, 2.2 * s, PIED_L); // gorro redondo
  for (let k = 0; k < 10; k++) { const a = Math.PI * (0.06 + k * 0.098); dot(pt(Math.cos(a) * 4.5, 31 + Math.sin(a) * 1.7), 0.6 * s, k % 2 ? PIED_D : PIED_LL); } // astracan
  dot(pt(-1.1, 30.6), 0.8 * s, PIED_LL); // brillo de la frente
}

/* ---------- recorrido de los alumnos ---------- */

/* ---------- EL LOOP DEL OSTRACÓN, en el mundo (la tanda visual del plan firme, 2026-08-24) ----------
   La elección es ESPACIAL: el patio de las lascas (practicar, gratis) y la mesa del papiro (pasar,
   caro). El montón de lascas crece con S.lascas: la arqueología literal de Deir el-Medina. */
function drawPatioLascas(t) {
  const c = PATIO_LASCAS, p = P(c.x, c.y), s = zoom, niv = nivelTec(31);
  sombra(c.x, c.y + 0.16, 24, 9);
  ellipse({ x: p.x, y: p.y - 1 * s }, 20 * s, 8.6 * s, '#dcc99a');           // la tierra pisada del patio
  // el muro bajo de adobe donde se apoyan los ejercicios
  g.fillStyle = '#c2a06c'; g.fillRect(p.x - 18 * s, p.y - 13.5 * s, 14 * s, 10 * s);
  g.fillStyle = '#b08c58'; g.fillRect(p.x - 18 * s, p.y - 4.8 * s, 14 * s, 2.2 * s);
  g.fillStyle = '#d0b078'; g.fillRect(p.x - 18 * s, p.y - 13.5 * s, 14 * s, 1.3 * s); // la corona del muro al sol
  // los ejercicios pendientes ESPERAN a la vista, apoyados en el muro (afordancia: se cuentan)
  for (let k = 0; k < Math.min(4, S.ejerPend || 0); k++) {
    const ex = p.x - 15.6 * s + k * 3.6 * s;
    g.save(); g.translate(ex, p.y - 6.6 * s); g.rotate(-0.12 + k * 0.06);
    g.fillStyle = '#efe6cc'; g.fillRect(-1.6 * s, -4.6 * s, 3.2 * s, 4.6 * s);
    g.strokeStyle = '#8a7a4a'; g.lineWidth = 0.55 * s;
    g.beginPath(); g.moveTo(-0.9 * s, -3.4 * s); g.lineTo(0.9 * s, -3.4 * s); g.stroke();
    g.beginPath(); g.moveTo(-0.9 * s, -2.2 * s); g.lineTo(0.4 * s, -2.2 * s); g.stroke();
    g.restore();
  }
  if (niv >= 1) { // etapa 1: EL CANASTO DE LASCAS FRESCAS: la piedra lista para errar sin miedo
    const cx2 = p.x - 15 * s, cy2 = p.y + 2.5 * s;
    sombra(c.x - 0.32, c.y + 0.2, 8, 3);
    poly([{ x: cx2 - 6 * s, y: cy2 }, { x: cx2 - 4.4 * s, y: cy2 + 5.6 * s }, { x: cx2 + 4.4 * s, y: cy2 + 5.6 * s }, { x: cx2 + 6 * s, y: cy2 }], '#b98a54');
    ellipse({ x: cx2, y: cy2 }, 6.2 * s, 2.7 * s, '#a87848');
    ellipse({ x: cx2, y: cy2 }, 4.9 * s, 2 * s, '#8a6038');
    g.strokeStyle = '#8a6038'; g.lineWidth = 0.7 * s; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx2 - 5.3 * s, cy2 + 2.2 * s); g.lineTo(cx2 + 5.3 * s, cy2 + 2.2 * s); g.stroke();
    g.beginPath(); g.moveTo(cx2 - 4.7 * s, cy2 + 4.2 * s); g.lineTo(cx2 + 4.7 * s, cy2 + 4.2 * s); g.stroke();
    for (const [dx2, dy2] of [[-2.6, -1.2], [0.2, -1.9], [2.6, -0.9], [-0.9, -0.4], [1.4, -2.6]])
      poly([{ x: cx2 + (dx2 - 1.7) * s, y: cy2 + dy2 * s }, { x: cx2 + dx2 * s, y: cy2 + (dy2 - 1.6) * s }, { x: cx2 + (dx2 + 1.8) * s, y: cy2 + (dy2 - 0.2) * s }, { x: cx2 + (dx2 + 0.5) * s, y: cy2 + (dy2 + 1) * s }], '#efe6cc'); // las lascas frescas asomando
    for (let k2 = 0; k2 < 3; k2++) // y la pila de lascas vírgenes esperando junto al canasto
      poly([{ x: cx2 + 7.5 * s - 2 * s, y: cy2 + (3.4 - k2 * 1.5) * s }, { x: cx2 + 7.5 * s, y: cy2 + (2.4 - k2 * 1.5) * s }, { x: cx2 + 7.5 * s + 2.1 * s, y: cy2 + (3.1 - k2 * 1.5) * s }, { x: cx2 + 7.5 * s + 0.3 * s, y: cy2 + (4.2 - k2 * 1.5) * s }], k2 % 2 ? '#e9e2cc' : '#ddd4ba');
  }
  // el MONTÓN que crece: cada práctica deja su lasca (tope visual 16; el contador real es S.lascas)
  const n = Math.min(16, 2 + Math.floor((S.lascas || 0) / 2)), conRojo = S.tecs[21] && S.tecs[21].fase === 'meseta';
  for (let k = 0; k < n; k++) {
    const a = (k * 137.5) % 360 * Math.PI / 180, r = (2.4 + (k % 5) * 1.5) * s;
    const lx = p.x + 6 * s + Math.cos(a) * r * 1.5, ly = p.y - 2 * s + Math.sin(a) * r * 0.6 - Math.floor(k / 8) * 2.4 * s;
    poly([{ x: lx - 2.7 * s, y: ly }, { x: lx, y: ly - 2.2 * s }, { x: lx + 2.8 * s, y: ly - 0.5 * s }, { x: lx + 1 * s, y: ly + 1.5 * s }], k % 3 ? '#e3dbc4' : '#d6ccb0');
    if (conRojo && k % 4 === 1) line({ x: lx - 1.2 * s, y: ly - 0.7 * s }, { x: lx + 1.2 * s, y: ly - 0.3 * s }, '#c94f43', 0.7 * s); // la marca roja del maestro
  }
  if (niv >= 2) { // etapa 2: el montón ya es LOMA con estratos: años de errores baratos, uno sobre otro
    ellipse({ x: p.x + 7 * s, y: p.y - 4.5 * s }, 14 * s, 6 * s, '#cfc5a8');
    ellipse({ x: p.x + 6 * s, y: p.y - 7 * s }, 10 * s, 4.2 * s, '#d9d0b4');
    ellipse({ x: p.x + 5.5 * s, y: p.y - 9.2 * s }, 6 * s, 2.6 * s, '#e3dbc4');
    g.strokeStyle = '#b8ae90'; g.lineWidth = 0.7 * s; g.lineCap = 'round';
    g.beginPath(); g.moveTo(p.x - 4 * s, p.y - 5.2 * s); g.quadraticCurveTo(p.x + 6 * s, p.y - 8 * s, p.x + 17 * s, p.y - 4.6 * s); g.stroke(); // el estrato: la loma tiene años
    g.beginPath(); g.moveTo(p.x - 1 * s, p.y - 7.6 * s); g.quadraticCurveTo(p.x + 6 * s, p.y - 10 * s, p.x + 13.5 * s, p.y - 6.6 * s); g.stroke();
  }
  if (niv >= 3) { // etapa 3: los ostraca figurados, EXPUESTOS (en el descarte nació el arte libre)
    g.save(); g.translate(p.x - 11 * s, p.y - 17.6 * s); g.rotate(-0.06); // el del gato, sobre el muro
    poly([{ x: -5.5 * s, y: 3 * s }, { x: -3.8 * s, y: -4.6 * s }, { x: 5 * s, y: -4 * s }, { x: 6 * s, y: 3.4 * s }], '#efe6cc');
    g.strokeStyle = '#c94f43'; g.lineWidth = 1 * s; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-3 * s, 1 * s); g.quadraticCurveTo(0, -3.4 * s, 3.4 * s, 0.3 * s); g.stroke();     // el lomo del gato garabateado
    g.beginPath(); g.moveTo(3.4 * s, 0.3 * s); g.lineTo(4.4 * s, -1.9 * s); g.stroke();                        // su cola parada
    dot({ x: -3.2 * s, y: -1 * s }, 0.7 * s, '#c94f43');                                                       // la oreja
    g.restore();
    g.save(); g.translate(p.x + 14 * s, p.y - 9.5 * s); g.rotate(0.1); // y el del pato, apoyado en la loma
    poly([{ x: -4 * s, y: 2.4 * s }, { x: -3 * s, y: -3.4 * s }, { x: 3.6 * s, y: -3 * s }, { x: 4.4 * s, y: 2.6 * s }], '#e9e0c6');
    g.strokeStyle = '#8a6a4a'; g.lineWidth = 0.9 * s; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-2.2 * s, 0.8 * s); g.quadraticCurveTo(-0.5 * s, -1.8 * s, 1.8 * s, -0.4 * s); g.stroke(); // el pato de trazos
    g.beginPath(); g.moveTo(1.8 * s, -0.4 * s); g.quadraticCurveTo(2.8 * s, -1.6 * s, 2.2 * s, -2.2 * s); g.stroke(); // su cuello
    g.restore();
  }
  if ((S.ejerPend || 0) > 0) { // el anillo que pide la mano (gramática: acción aquí), como el limo de Sumer
    const pu = 0.5 + 0.5 * Math.sin(t * 4 + 1.3);
    g.save(); g.globalAlpha = 0.3 + 0.4 * pu;
    g.strokeStyle = '#ffd24a'; g.lineWidth = 1.4 * s;
    g.beginPath(); g.ellipse(p.x, p.y - 1 * s, (21 + pu * 3) * s, (8.6 + pu * 1.3) * s, 0, 0, 7); g.stroke();
    g.restore();
  }
  estadoTec(31, { x: p.x, y: p.y - 24 * s }, t);
}
function drawMesaPapiro(t) {
  const c = MESA_PAPIRO, p = P(c.x, c.y), s = zoom;
  sombra(c.x, c.y + 0.14, 18, 7);
  g.fillStyle = '#8a6a4a'; g.fillRect(p.x - 9 * s, p.y - 6 * s, 2 * s, 6 * s); g.fillRect(p.x + 7 * s, p.y - 6 * s, 2 * s, 6 * s); // las patas
  g.fillStyle = '#b08c58'; g.fillRect(p.x - 10.5 * s, p.y - 8.6 * s, 21 * s, 3 * s);   // el tablero
  g.fillStyle = '#c9a06a'; g.fillRect(p.x - 10.5 * s, p.y - 8.6 * s, 21 * s, 0.9 * s); // su canto al sol
  g.fillStyle = '#efe6c4'; g.fillRect(p.x - 7.5 * s, p.y - 10 * s, 13 * s, 2.2 * s);   // LA HOJA cara, esperando
  g.strokeStyle = '#c9bd96'; g.lineWidth = 0.5 * s;
  g.beginPath(); g.moveTo(p.x - 5.5 * s, p.y - 9 * s); g.lineTo(p.x + 3.5 * s, p.y - 9 * s); g.stroke(); // el renglón tenue
  dot({ x: p.x - 8.4 * s, y: p.y - 9.4 * s }, 1.3 * s, '#9a9188'); dot({ x: p.x + 6.2 * s, y: p.y - 9.4 * s }, 1.3 * s, '#9a9188'); // las piedras de prensa
  const rollos = Math.min(6, S.papiros || 0); // el archivo crece al costado: cada pase, un rollo
  for (let k = 0; k < rollos; k++) {
    const rx = p.x + 12.5 * s + (k % 2) * 3.2 * s, ry = p.y - 1.6 * s - Math.floor(k / 2) * 2.9 * s;
    g.fillStyle = k % 2 ? '#e8d9a8' : '#e0d09a'; g.fillRect(rx - 1.5 * s, ry - 4.8 * s, 3 * s, 5 * s);
    line({ x: rx - 1.5 * s, y: ry - 2.4 * s }, { x: rx + 1.5 * s, y: ry - 2.4 * s }, '#b09a60', 0.6 * s); // la atadura
  }
  if (typeof puedePasarPapiro === 'function' && puedePasarPapiro()) { // el brillo del evento: se puede pasar
    const pu = 0.5 + 0.5 * Math.sin(t * 4 + 2.6);
    g.save(); g.globalAlpha = 0.35 + 0.4 * pu;
    g.strokeStyle = '#ffd24a'; g.lineWidth = 1.4 * s;
    g.beginPath(); g.ellipse(p.x, p.y - 3 * s, (15 + pu * 2.6) * s, (6.4 + pu * 1.2) * s, 0, 0, 7); g.stroke();
    g.restore();
  }
}
function drawLinde(idx, t) { // el linde borrado por la crecida: el mojón caído espera la cuerda
  const [lx, ly] = LINDE_SITIOS[idx], p = P(lx, ly, -2), s = zoom;
  ellipse({ x: p.x, y: p.y }, 7 * s, 3.2 * s, '#a8a06a');                          // la mancha de limo fresco sobre la vega
  g.save(); g.translate(p.x - 1 * s, p.y - 0.6 * s); g.rotate(0.9);                // la estaca VOLTEADA por el agua
  g.fillStyle = '#8a6a4a'; g.fillRect(-0.9 * s, -6.2 * s, 1.8 * s, 6.2 * s);
  g.restore();
  dot({ x: p.x + 2.6 * s, y: p.y + 0.4 * s }, 1.1 * s, '#8f8656');                 // el nudo de cuerda vieja, enterrado
  const pu = 0.5 + 0.5 * Math.sin(t * 4 + idx * 1.7);
  g.save(); g.globalAlpha = 0.3 + 0.4 * pu;
  g.strokeStyle = '#ffd24a'; g.lineWidth = 1.3 * s;
  g.beginPath(); g.ellipse(p.x, p.y, (6.5 + pu * 2.2) * s, (3 + pu * 1) * s, 0, 0, 7); g.stroke();
  g.restore();
}
