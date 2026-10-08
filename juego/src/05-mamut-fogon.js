/* ============================================================
   05-mamut-fogon
   El mamut y la cacería, y el fogón del Paleolítico: choza, telar, granero, fogata, tambor, hueso.
   ============================================================ */
const MAMUT_HOME = { x: 13.0, y: 3.9 }, MAMUT_EXIT = { x: 18.6, y: 0.2 };  // su claro (un paso tierra adentro: el anillo de cazadores cabía a medias) y por dónde se pierde en la estepa
const MAMUT_HUIDA = 1.8, MAMUT_VUELTA = 3.2, MAMUT_SACUDE = 1.3, CRIA_SALE = 2.4;
let mamutAng = 0, mamutAngT = null; // el ángulo del paseo se INTEGRA: cambiar de ritmo ya no teletransporta
/* LOS RELOJES VISUALES DE LA CACERÍA (visto jugando, 2026-08-02): mamutHuidaT, cazaCd y criaSaleT
   laten en el tick de la ECONOMÍA (4 Hz), y derivar la posición directo de ellos hacía que la huida
   fueran ~7 brincos de una baldosa: teletransporte puro. La economía sigue mandando CUÁNDO empieza y
   termina cada fase; la posición pintada avanza con el reloj de frames, inicializado ALINEADO al
   estado económico (un save a mitad de huida no reinicia el planeo). Es la regla de los dos relojes
   del CLAUDE.md aplicada al mamut. */
let huidaVisT0 = null, vueltaVisT0 = null, sacudeVisT0 = null, criaVisT0 = null;
function posMamut(t) { // el mamut pasea su terreno; si lo acosan, apura el tranco; tras la caza huye, y su ausencia ES el cooldown
  const acosado = ordEra(S.era) < 11 && S.tecs[15] && S.tecs[15].fase === 'meseta';
  const cazando = !!S.cazaOn;
  // EL TELETRANSPORTE (visto jugando, 2026-08-02): antes el ángulo era t × ritmo, y al cambiar el
  // ritmo (dominar la cacería, empezar o terminar una caza) el ángulo saltaba a otra punta del claro.
  // Integrado, el ritmo puede cambiar cuanto quiera: el mamut sigue caminando desde donde está.
  const ritmo = cazando ? ((S.cazaProg || 0) < 0.66 ? 0.3 : 0.1) : acosado ? 0.16 : 0.05; // el arreo lo apura; el forcejeo casi lo clava
  if (mamutAngT === null) { mamutAng = t * 0.05; mamutAngT = t; }
  if (t !== mamutAngT) { mamutAng += Math.max(0, t - mamutAngT) * ritmo; mamutAngT = t; }
  const fs = mamutAng;
  const jit = cazando ? Math.sin(t * 11) * 0.12 * Math.min(1, Math.max(0, ((S.cazaProg || 0) - 0.66) * 12)) : 0; // el forcejeo entra en rampa, no de golpe
  const x = MAMUT_HOME.x + Math.cos(fs) * 1.05 + jit, y = MAMUT_HOME.y + Math.sin(fs) * 0.7 + jit * 0.6; // lejos de los pinos que lo tapaban
  const dxy = -Math.sin(fs) * 1.05 - Math.cos(fs) * 0.7; // hacia dónde avanza en pantalla
  const base = { x, y, dir: dxy >= 0 ? 1 : -1, acosado, cazando, fase: 'campo', visible: true, prog: 0 };
  if (cazando) { huidaVisT0 = vueltaVisT0 = sacudeVisT0 = null; return base; }
  if ((S.mamutHuidaT || 0) > 0) { // se manda a cambiar, gane quien gane: el mamut de este clan sigue invicto
    if (huidaVisT0 === null) huidaVisT0 = t - (MAMUT_HUIDA - S.mamutHuidaT); // alineado al estado económico
    const k = smooth(Math.min(1, Math.max(0, (t - huidaVisT0) / MAMUT_HUIDA)));
    const fx0 = S.mamutFugaX || x, fy0 = S.mamutFugaY || y;
    return { ...base, x: fx0 + (MAMUT_EXIT.x - fx0) * k, y: fy0 + (MAMUT_EXIT.y - fy0) * k, dir: 1, fase: 'huye', prog: k };
  }
  huidaVisT0 = null;
  const cd = S.cazaCd || 0;
  if (cd > MAMUT_VUELTA + MAMUT_SACUDE) { vueltaVisT0 = null; return { ...base, x: MAMUT_HOME.x, y: MAMUT_HOME.y, fase: 'fuera', visible: false }; }
  if (cd > MAMUT_SACUDE) { // regresa caminando tranquilo, como si nada
    if (vueltaVisT0 === null) vueltaVisT0 = t - (MAMUT_VUELTA - (cd - MAMUT_SACUDE));
    const k = smooth(Math.min(1, Math.max(0, (t - vueltaVisT0) / MAMUT_VUELTA)));
    return { ...base, x: MAMUT_EXIT.x + (x - MAMUT_EXIT.x) * k, y: MAMUT_EXIT.y + (y - MAMUT_EXIT.y) * k, dir: -1, fase: 'vuelve', prog: k };
  }
  vueltaVisT0 = null;
  if (cd > 0) {
    if (sacudeVisT0 === null) sacudeVisT0 = t - (MAMUT_SACUDE - cd);
    return { ...base, fase: 'sacude', prog: Math.min(1, Math.max(0, (t - sacudeVisT0) / MAMUT_SACUDE)) };
  }
  sacudeVisT0 = null;
  return base;
}
function sustoMamut(t) { // el respingo cuando alguien le salta encima
  if (!(ordEra(S.era) < 11 && S.tecs[15] && S.tecs[15].fase === 'meseta')) return 0;
  let s = 0;
  for (let i = 0; i < 3; i++) {
    const c = ((t * 0.85 + i * 1.9) % 6) / 6;
    if (c > 0.55 && c < 0.8) s = Math.max(s, Math.sin((c - 0.55) / 0.25 * Math.PI));
  }
  return s;
}
function drawMamut(t) {
  const m = posMamut(t), p = P(m.x, m.y), s = zoom;
  if (!m.visible) return;
  const susto = m.fase === 'campo' ? sustoMamut(t) : 0;
  const huye = m.fase === 'huye', vuelve = m.fase === 'vuelve', sacude = m.fase === 'sacude';
  const alerta = Math.max(susto, huye ? 1 : 0, sacude ? 0.75 : 0);             // cabeza en alto, trompa agitada
  const alpha = huye ? Math.min(1, (1 - m.prog) / 0.3)                          // se pierde en la estepa…
              : vuelve ? Math.min(1, Math.max(0, m.prog) / 0.3) : 1;            // …y reaparece caminando
  if (alpha <= 0.01) { drawCriaMamut(t, m); return; }
  g.save(); g.globalAlpha = alpha;
  if (huye) {                                                                   // la polvareda de la retirada indignada
    g.save(); g.globalAlpha = alpha * .45;
    dot({ x: p.x - 30 * s, y: p.y - 3 * s }, 4.5 * s, '#cfc7b0');
    dot({ x: p.x - 39 * s, y: p.y - 8 * s }, 3 * s, '#cfc7b0');
    g.restore();
  }
  sombra(m.x + 0.2 * m.dir, m.y + 0.18, 26, 10);
  if (sacude) {                                                                 // se sacude el polvo de la caza
    const a = Math.sin(m.prog * Math.PI);
    g.save(); g.globalAlpha = a * .5;
    dot({ x: p.x - 26 * s, y: p.y - 5 * s }, 4 * s, '#cfc7b0');
    dot({ x: p.x + 24 * s, y: p.y - 8 * s }, 3 * s, '#cfc7b0');
    dot({ x: p.x - 16 * s, y: p.y - 14 * s }, 2.4 * s, '#cfc7b0');
    g.restore();
  }
  const sway = Math.sin(t * (0.6 + alerta * 4)) * (1.4 + alerta * 3.5) * s;    // la trompa se agita al escapar
  const pasto = Math.max(0, Math.sin(t * 0.35)) * 4 * s * (1 - alerta) - alerta * 5 * s; // pasta… o alza la cabeza
  g.save(); g.translate(p.x, p.y - susto * 2.5 * s);
  if (sacude) g.rotate(Math.sin(t * 24) * 0.045 * Math.sin(m.prog * Math.PI));
  if (m.dir < 0) g.scale(-1, 1);
  const tranco = huye ? 1.5 : vuelve ? 0.6 : m.acosado ? 1 : 0.3;
  const paso = huye ? 7.5 : 5.2;                                                // el tranco se apura al escapar
  g.fillStyle = '#6e5a4a';
  let li = 0;
  for (const lx of [-15, -6, 5, 13]) {                                          // patas en marcha
    const alza = Math.max(0, Math.sin(t * paso + li * 2.1)) * 2.2 * s * tranco;
    g.fillRect(lx * s, -13 * s, 5 * s, 13 * s - alza); li++;
  }
  g.beginPath(); g.ellipse(-1 * s, -23 * s, 22 * s, 14 * s, -0.08, 0, 7);       // cuerpo lanudo
  g.fillStyle = '#8a7462'; g.fill();
  g.strokeStyle = '#75624f'; g.lineWidth = 1.1 * s;
  for (let i = -3; i <= 3; i++) {                                               // flecos de lana
    g.beginPath(); g.moveTo(i * 5.5 * s, -11 * s);
    g.lineTo(i * 5.5 * s - 1 * s, -7 * s); g.stroke();
  }
  dot({ x: 20 * s, y: -26 * s + pasto }, 9 * s, '#8a7462');                     // cabeza
  dot({ x: 21 * s, y: -34 * s + pasto * .7 }, 6 * s, '#8a7462');                // el domo del mamut
  dot({ x: 14.5 * s, y: -30 * s + pasto * .8 }, 3.2 * s, '#75624f');            // oreja pequeña
  ojo(22 * s, -28 * s + pasto, 1.1 * s, apertura(0.4));                          // ojo (y hasta el mamut parpadea)
  g.strokeStyle = '#8a7462'; g.lineWidth = 3.4 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(27 * s, -24 * s + pasto);                             // la trompa
  g.quadraticCurveTo(33 * s + sway, -15 * s + pasto, 29 * s + sway * 1.5, -4 * s + pasto * .5);
  g.stroke();
  g.strokeStyle = '#efe8d4'; g.lineWidth = 1.9 * s;
  g.beginPath(); g.arc(22 * s, -16 * s + pasto, 8 * s, 0.4, 1.75); g.stroke();  // colmillos
  g.beginPath(); g.arc(25 * s, -15 * s + pasto, 6.5 * s, 0.35, 1.7); g.stroke();
  g.restore(); g.restore();
  drawCriaMamut(t, m);
}
function posCria(m, t) { // la cría acompaña el regreso cada tercera caza, y luego se despide trotando
  if ((S.criaSaleT || 0) > 0) { // rumbo a casa: por eso el grandote siempre se escapa, tiene a quién cuidar
    if (criaVisT0 === null) criaVisT0 = t - (CRIA_SALE - S.criaSaleT);
    const k = smooth(Math.min(1, Math.max(0, (t - criaVisT0) / CRIA_SALE)));
    return { x: MAMUT_HOME.x + 0.9 + (MAMUT_EXIT.x - MAMUT_HOME.x - 0.9) * k, y: MAMUT_HOME.y + 0.5 + (MAMUT_EXIT.y - MAMUT_HOME.y - 0.5) * k,
             dir: 1, trote: 1, hop: 0, alpha: k < 0.7 ? 1 : (1 - k) / 0.3 };
  }
  criaVisT0 = null;
  if (!S.criaViene) return null;
  if (m.fase === 'vuelve') { // viene trotando detrás del grandote
    const k = Math.max(0, m.prog - 0.2) / 0.8;
    return { x: MAMUT_EXIT.x + (MAMUT_HOME.x + 0.9 - MAMUT_EXIT.x) * k, y: MAMUT_EXIT.y + (MAMUT_HOME.y + 0.5 - MAMUT_EXIT.y) * k,
             dir: -1, trote: 1, hop: 0, alpha: Math.min(1, Math.max(0, m.prog - 0.1) / 0.3) };
  }
  if (m.fase === 'sacude') return { x: MAMUT_HOME.x + 0.9, y: MAMUT_HOME.y + 0.5, dir: -1, trote: 0, hop: 1, alpha: 1 }; // brinca al lado mientras él se sacude
  return null;
}
function drawCriaMamut(t, m) {
  const c = posCria(m, t); if (!c) return;
  const s = zoom * 0.45, p = P(c.x, c.y);
  const hop = c.hop ? Math.abs(Math.sin(t * 5.5)) * 3.5 * zoom : 0;
  g.save(); g.globalAlpha = Math.max(0, Math.min(1, c.alpha));
  sombra(c.x + 0.1 * c.dir, c.y + 0.1, 13, 5);
  g.translate(p.x, p.y - hop); if (c.dir < 0) g.scale(-1, 1);
  g.fillStyle = '#6e5a4a';
  let li = 0;
  for (const lx of [-15, -6, 5, 13]) {                                          // patitas al trote
    const alza = Math.max(0, Math.sin(t * 7 + li * 2.1)) * 2.6 * s * (c.trote ? 1 : 0.25);
    g.fillRect(lx * s, -13 * s, 5 * s, 13 * s - alza); li++;
  }
  g.beginPath(); g.ellipse(-1 * s, -23 * s, 22 * s, 14 * s, -0.08, 0, 7);       // cuerpito lanudo
  g.fillStyle = '#8a7462'; g.fill();
  g.strokeStyle = '#75624f'; g.lineWidth = 1.1 * s;
  for (let i = -2; i <= 2; i++) {                                               // pelusa de bebé
    g.beginPath(); g.moveTo(i * 5.5 * s, -11 * s);
    g.lineTo(i * 5.5 * s - 1 * s, -7 * s); g.stroke();
  }
  dot({ x: 20 * s, y: -26 * s }, 9 * s, '#8a7462');                             // cabeza
  dot({ x: 21 * s, y: -34 * s }, 6 * s, '#8a7462');                             // el domo, de estreno
  dot({ x: 14.5 * s, y: -30 * s }, 3.4 * s, '#75624f');                         // orejita
  ojo(22 * s, -28 * s, 1.3 * s, apertura(2.6));                                 // ojazo de cría, que también parpadea
  dot({ x: 22.5 * s, y: -28.5 * s }, 0.45 * s, '#efe8d4');                      // con su brillo
  const sway = Math.sin(t * 4.6) * 2.4 * s;                                     // la trompita, tan inquieta como la del grandote
  g.strokeStyle = '#8a7462'; g.lineWidth = 3.4 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(27 * s, -24 * s);
  g.quadraticCurveTo(33 * s + sway, -15 * s, 29 * s + sway * 1.5, -4 * s);
  g.stroke();
  g.strokeStyle = '#efe8d4'; g.lineWidth = 1.6 * s;
  g.beginPath(); g.arc(22 * s, -16 * s, 4.5 * s, 0.45, 1.6); g.stroke();        // colmillitos apenas asomando
  g.restore();
}
function drawSenalConsejo(t) { // SEÑAL 1 de la gramática: anillo dorado que late donde la consejera señala.
  // Sin esto, la voz decía "toca el fuego" y el fuego no se distinguía en nada: el único dorado vivía en el dock.
  if (!consejoG || consejoG.x == null) return;
  if (S.cazaOn || cazaDisponible()) { const m = posMamut(t); if (Math.abs(m.x - consejoG.x) < 1.5 && Math.abs(m.y - consejoG.y) < 1.5) return; } // no doblar el convite del mamut
  const p = P(consejoG.x, consejoG.y), s = zoom;
  // El anillo PROMETE un clic QUE HACE ALGO, así que solo late si en el destino hay una ACCIÓN lista
  // ahora mismo (el censo del cuadro ya está completo: esto se dibuja después de todos los drawables).
  // No basta un tocable cualquiera: el campo es tocable siempre, y el anillo latía sobre la parcela
  // a medio crecer prometiendo una cosecha que no estaba (visto jugando, 2026-08-02). La consejera a
  // veces manda a una ZONA o a una espera: ahí guía el texto de la tarjeta, no el anillo.
  const hayAccion = GENTE_CLIC.some(q => {
    const cerca = q.area
      ? Math.hypot((p.x - q.x) / ((q.area.rx + 6) * s), (p.y - (q.y - (q.area.dy || 0) * s)) / ((q.area.ry + 6) * s)) < 1
      : Math.hypot((p.x - q.x) / (42 * s), (p.y - q.y) / (30 * s)) < 1;
    return cerca && (q.ficha.k === 'colectible' || esAccion(q.ficha));
  });
  if (!hayAccion) return;
  const rp = (20 + Math.sin(t * 3) * 4) * s;
  g.save();
  g.globalAlpha = 0.52 + Math.sin(t * 3) * 0.24;
  g.strokeStyle = '#e4b04a'; g.lineWidth = Math.max(2, 3 * s); // fino y tenue no se veía sobre el fuego
  g.beginPath(); g.ellipse(p.x, p.y - 4 * s, rp, rp * 0.5, 0, 0, 7); g.stroke();
  g.restore();
}
function drawCazaOverlay(t) { // barra / convite de la cacería, SIEMPRE por encima de árboles
  if (S.era !== 1 || !(S.tecs[15] && S.tecs[15].fase !== 'sin')) return;
  const m = posMamut(t), p = P(m.x, m.y), s = zoom;
  if (S.cazaOn) { // barra de progreso de la cacería en curso
    const bw = 46 * s, bx = p.x - bw / 2, by = p.y - 58 * s;
    g.fillStyle = 'rgba(40,30,24,.6)'; g.fillRect(bx - 2 * s, by - 2 * s, bw + 4 * s, 9 * s);
    g.fillStyle = '#3a2c1c'; g.fillRect(bx, by, bw, 5 * s);
    g.fillStyle = '#e4b04a'; g.fillRect(bx, by, bw * S.cazaProg, 5 * s);
    const acto = (S.cazaProg || 0) < 0.33 ? 'el cerco, en silencio' : (S.cazaProg || 0) < 0.66 ? 'el arreo, a gritos' : 'el forcejeo'; // los tres actos de la lección
    textoConvite(acto + ' · ' + Math.ceil(Math.max(0, S.cazaT)) + 's', p.x, by - 6 * s);
  } else if (cazaDisponible()) { // convite: anillo dorado que late sobre el mamut; UN clic envía la partida
    const rp = (17 + Math.sin(t * 3) * 4) * s;
    g.save(); g.globalAlpha = 0.5 + Math.sin(t * 3) * 0.22;
    g.strokeStyle = '#e4b04a'; g.lineWidth = 2.2 * s;
    g.beginPath(); g.ellipse(p.x, p.y - 4 * s, rp, rp * 0.5, 0, 0, 7); g.stroke(); g.restore();
    textoConvite('enviar la partida de caza', p.x, p.y - 46 * s);
  }
}
function drawChoza(x, y, s, t) { // choza neolítica: muro de adobe y techo de paja cónico
  s = s || 1; const z = zoom * s, b = P(x, y);
  sombra(x, y + 0.16, 24 * s, 11 * s);
  const rx = 15 * z, wallH = 15 * z;
  g.fillStyle = '#b98a5c'; g.fillRect(b.x - rx, b.y - wallH, rx * 2, wallH);      // muro de adobe (frente)
  ellipse({ x: b.x, y: b.y }, rx, 6 * z, '#946c47');                              // pie
  g.fillStyle = '#3a2a1c';                                                        // puerta
  g.beginPath(); g.moveTo(b.x - 4.5 * z, b.y); g.lineTo(b.x - 4.5 * z, b.y - 8 * z);
  g.quadraticCurveTo(b.x, b.y - 15 * z, b.x + 4.5 * z, b.y - 8 * z);
  g.lineTo(b.x + 4.5 * z, b.y); g.closePath(); g.fill();
  const rrx = 23 * z, rimY = b.y - wallH + 2 * z, apex = { x: b.x, y: rimY - 30 * z }; // techo de paja
  g.fillStyle = '#cba64f'; g.beginPath(); g.ellipse(b.x, rimY, rrx, 6 * z, 0, 0, Math.PI); g.fill(); // alero
  poly([{ x: b.x - rrx, y: rimY }, apex, { x: b.x + rrx, y: rimY }], '#cba64f');   // cono
  for (let k = -3; k <= 3; k++) line({ x: b.x + k * 5.5 * z, y: rimY }, { x: b.x + k * 1.4 * z, y: apex.y + 6 * z }, 'rgba(120,88,36,.3)', 1 * z); // paja
  line({ x: b.x - rrx, y: rimY }, { x: b.x + rrx, y: rimY }, 'rgba(120,88,36,.45)', 1.3 * z); // línea del alero
  dot({ x: b.x, y: apex.y + 3 * z }, 2.2 * z, '#9c7a34');                          // remate
}
function drawCurtido(x, y, t) {
  /* LA CACERÍA EN LA ALDEA: colgadas las lanzas, el saber se vuelve oficio. La MÁXIMA «cada etapa se
     tiene que ver» quedaba coja tras el asentamiento (la partida ya no sale y el mamut se fue con el
     Paleolítico): perfeccionar la cacería en la edad 2 no cambiaba ni un píxel. Ahora cada etapa deja
     su pieza: 1 el bastidor con la piel a medio raspar, 2 el tendido de pieles ya curtidas, 3 las
     lanzas en descanso y la marca de la manada pintada en la piel (la lección de coordinar, vuelta
     memoria). Nada de cráneos ni trofeos: el mamut de este clan sigue invicto. */
  const n = nivelTec(15); if (n < 1) return;
  const s = zoom, b = P(x, y);
  sombra(x, y + 0.12, 15, 6.5);
  const h = 30 * s;                                                                // el bastidor en A
  line({ x: b.x - 11 * s, y: b.y }, { x: b.x - 4 * s, y: b.y - h }, '#8a6a44', 2.2 * s);
  line({ x: b.x + 11 * s, y: b.y }, { x: b.x + 4 * s, y: b.y - h }, '#8a6a44', 2.2 * s);
  line({ x: b.x - 6 * s, y: b.y - h * 0.82 }, { x: b.x + 6 * s, y: b.y - h * 0.82 }, '#7a5636', 2 * s);
  g.fillStyle = '#c69a66';                                                          // la piel tensada
  g.beginPath();
  g.moveTo(b.x - 6.5 * s, b.y - h * 0.72);
  g.quadraticCurveTo(b.x - 8.5 * s, b.y - h * 0.42, b.x - 5.5 * s, b.y - h * 0.16);
  g.quadraticCurveTo(b.x, b.y - h * 0.06, b.x + 5.5 * s, b.y - h * 0.16);
  g.quadraticCurveTo(b.x + 8.5 * s, b.y - h * 0.42, b.x + 6.5 * s, b.y - h * 0.72);
  g.quadraticCurveTo(b.x, b.y - h * 0.8, b.x - 6.5 * s, b.y - h * 0.72);
  g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,240,210,.3)';                                             // lo ya raspado, más claro
  g.beginPath(); g.ellipse(b.x - 2 * s, b.y - h * 0.46, 3.4 * s, 5 * s, -0.4, 0, 7); g.fill();
  g.strokeStyle = '#7a5636'; g.lineWidth = 0.9 * s;                                 // los tientos que la atan
  for (const [px, py, qx, qy] of [[-6.5, 0.72, -9.4, 0.82], [6.5, 0.72, 9.4, 0.82], [-5.5, 0.16, -8.6, 0.08], [5.5, 0.16, 8.6, 0.08]]) {
    g.beginPath(); g.moveTo(b.x + px * s, b.y - h * py); g.lineTo(b.x + qx * s, b.y - h * qy); g.stroke();
  }
  if (n >= 2) { // el tendido: lo curtido se guarda blando y al aire, como el pescado del secadero
    // (va al FRENTE del bastidor, no a su derecha: allá lo tapaba el techo de la choza vecina)
    const a = P(x + 0.45, y + 0.65), c = P(x + 1.25, y + 1.15), th = 26 * s;
    line({ x: a.x, y: a.y }, { x: a.x, y: a.y - th }, '#8a6a44', 1.8 * s);
    line({ x: c.x, y: c.y }, { x: c.x, y: c.y - th }, '#8a6a44', 1.8 * s);
    line({ x: a.x, y: a.y - th + 2 * s }, { x: c.x, y: c.y - th + 2 * s }, '#7a5636', 1.2 * s);
    for (let i = 0; i < 2; i++) {
      const k = 0.28 + i * 0.42, px = a.x + (c.x - a.x) * k, py = a.y + (c.y - a.y) * k - th + 2 * s;
      const vaiven = Math.sin(t * 1.2 + i * 2.1) * 0.8 * s;
      g.save(); g.translate(px + vaiven, py); g.rotate(0.06 * Math.sin(t * 0.9 + i));
      g.fillStyle = i ? '#b98a5c' : '#a97e52';
      g.beginPath(); g.moveTo(-4.5 * s, 0); g.lineTo(4.5 * s, 0); g.lineTo(3.6 * s, 10 * s); g.quadraticCurveTo(0, 12.5 * s, -3.6 * s, 10 * s); g.closePath(); g.fill();
      g.fillStyle = 'rgba(255,240,210,.22)'; g.fillRect(-4.5 * s, 0, 9 * s, 1.6 * s); // el doblez sobre la cuerda
      g.restore();
    }
  }
  if (n >= 3) { // las lanzas en descanso y la marca de la manada: la caza ya es memoria que enseña
    for (const [dx, ang] of [[-13, -0.22], [-15.5, 0.1], [-11, 0.3]]) {
      const base = { x: b.x + dx * s, y: b.y + 2 * s };
      const punta = { x: base.x + Math.sin(ang) * 30 * s, y: base.y - Math.cos(ang) * 30 * s };
      line(base, punta, '#9a7a52', 1.6 * s);
      poly([{ x: punta.x - 1.6 * s, y: punta.y + 3 * s }, { x: punta.x, y: punta.y - 2.5 * s }, { x: punta.x + 1.6 * s, y: punta.y + 3 * s }], '#8d9aa5'); // sílex
    }
    // la marca ocre en la piel: el PLAN DEL CERCO (la manada al centro, los cazadores alrededor).
    // Nada de rayas cruzando el círculo: se leía como un signo de prohibición, no como un plan.
    g.strokeStyle = '#b4552e'; g.lineWidth = 1.1 * s; g.lineCap = 'round';
    g.beginPath(); g.arc(b.x + 1 * s, b.y - h * 0.44, 2.4 * s, 0, 7); g.stroke();    // el cerco
    dot({ x: b.x + 1 * s, y: b.y - h * 0.44 }, 0.8 * s, '#b4552e');                  // la manada, en el centro
    for (const a of [-1.9, 0.6, 2.9])                                                 // los cazadores, repartidos
      dot({ x: b.x + 1 * s + Math.cos(a) * 4.6 * s, y: b.y - h * 0.44 + Math.sin(a) * 4.6 * s }, 0.55 * s, '#b4552e');
  }
}
function drawTelar(x, y, s, t) { // telar vertical de pesas: urdimbre colgante y contrapesos
  s = s || 1; const z = zoom * s;
  sombra(x, y + 0.1, 15 * s, 6 * s);
  const L = P(x - 0.4 * s, y), R = P(x + 0.4 * s, y), Lt = P(x - 0.4 * s, y, 42 * s), Rt = P(x + 0.4 * s, y, 42 * s);
  line(L, Lt, '#9a7a52', 3 * z); line(R, Rt, '#9a7a52', 3 * z);                    // postes
  line(Lt, Rt, '#7a5c3c', 3 * z);                                                  // travesaño
  /* MÁXIMA «cada etapa se tiene que ver», en serio esta vez: la versión anterior alargaba la tela
     3 px por etapa y el jugador no veía NADA cambiar (dicho jugando, 2026-08-02). Ahora: etapa 1 la
     tela DOBLA su largo, gana cenefa y la canasta de madejas espera al pie; etapa 2 las listas
     teñidas cruzan el paño; etapa 3 la primera PIEZA TERMINADA se tiende en su cuerda al lado. */
  const nX = nivelTec(27);
  const alto = [9, 18, 22, 24][nX];
  poly([Lt, Rt, { x: Rt.x, y: Rt.y + alto * z }, { x: Lt.x, y: Lt.y + alto * z }], 'rgba(200,150,120,.8)'); // tela tejida
  if (nX >= 1) { // la cenefa del borde de avance, y la canasta de madejas al pie del telar
    poly([{ x: Lt.x, y: Lt.y + (alto - 2.2) * z }, { x: Rt.x, y: Rt.y + (alto - 2.2) * z },
          { x: Rt.x, y: Rt.y + alto * z }, { x: Lt.x, y: Lt.y + alto * z }], 'rgba(162,78,48,.85)');
    const cb = P(x - 0.75 * s, y + 0.15 * s);
    ellipse({ x: cb.x, y: cb.y }, 4.4 * z, 2 * z, '#8a6a3e');
    g.fillStyle = '#a8834f'; g.beginPath(); g.ellipse(cb.x, cb.y - 1 * z, 4.4 * z, 2.6 * z, 0, Math.PI, 0); g.fill();
    for (const [dx2, col] of [[-1.6, '#cdb877'], [0.2, '#a24e30'], [1.7, '#e8dec0']]) { // las madejas, con sus tintes
      g.strokeStyle = col; g.lineWidth = 1 * z;
      g.beginPath(); g.ellipse(cb.x + dx2 * z, cb.y - 2.2 * z, 1.8 * z, 1.2 * z, 0.4, 0, 7); g.stroke();
    }
  }
  if (nX >= 2) { // las listas teñidas: el tejido ya no solo abriga, dice de dónde eres
    for (const [off, col] of [[3.2, 'rgba(162,78,48,.85)'], [8.4, 'rgba(120,120,86,.7)'], [13.2, 'rgba(178,140,60,.75)']]) {
      poly([{ x: Lt.x, y: Lt.y + off * z }, { x: Rt.x, y: Rt.y + off * z },
            { x: Rt.x, y: Rt.y + (off + 1.8) * z }, { x: Lt.x, y: Lt.y + (off + 1.8) * z }], col);
    }
  }
  if (nX >= 3) { // la primera pieza terminada, tendida en su cuerda: el oficio ya VISTE al clan
    const a = P(x + 0.65, y + 0.25), b = P(x + 1.5, y + 0.62), th = 30;
    line({ x: a.x, y: a.y }, { x: a.x, y: a.y - th * z }, '#8a6a4a', 1.7 * z);
    line({ x: b.x, y: b.y }, { x: b.x, y: b.y - th * z }, '#8a6a4a', 1.7 * z);
    line({ x: a.x, y: a.y - (th - 2) * z }, { x: b.x, y: b.y - (th - 2) * z }, '#7a5636', 1.1 * z);
    const px2 = (a.x + b.x) / 2 + Math.sin(t * 1.1) * 0.8 * z, py2 = (a.y + b.y) / 2 - (th - 2) * z;
    g.save(); g.translate(px2, py2); g.rotate(0.05 * Math.sin(t * 0.9));
    g.fillStyle = '#cdb083'; g.fillRect(-5.5 * z, 0, 11 * z, 13 * z);
    for (const [oy2, col] of [[2, '#a24e30'], [6, '#787856'], [10, '#b28c3c']]) g.fillRect(-5.5 * z, oy2 * z, 11 * z, 1.8 * z);
    g.restore();
    g.save(); g.globalAlpha = 0.35 + 0.15 * Math.sin(t * 1.7); // y el brillo del hilo fino en el telar
    poly([{ x: Lt.x, y: Lt.y + 1 * z }, { x: Rt.x, y: Rt.y + 1 * z },
          { x: Rt.x, y: Rt.y + 2.4 * z }, { x: Lt.x, y: Lt.y + 2.4 * z }], '#fff2d8');
    g.restore();
  }
  const hilos = 6 + nX * 2;
  for (let k = 0; k <= hilos; k++) {
    const fx = Lt.x + (Rt.x - Lt.x) * (k / hilos), fy = Lt.y + (Rt.y - Lt.y) * (k / hilos) + alto * z;
    const sway = Math.sin(t * 1.6 + k * 0.7) * 1.2 * z, by = Math.min(fy + 22 * z, L.y - 2 * z); // la pesa nunca bajo tierra
    line({ x: fx, y: fy }, { x: fx + sway, y: by }, 'rgba(232,222,192,.85)', 1 * z); // hilo de urdimbre
    dot({ x: fx + sway, y: by }, 1.8 * z, '#9a8258');                                // pesa de telar
  }
}
function drawGranero(x, y, t) { // el granero elevado: el excedente del clan sobre pilotes de piedra
  const b = P(x, y), z = zoom;
  sombra(x, y + 0.14, 18, 8);
  g.fillStyle = '#8f8a7c';                                                          // los pilotes
  for (const k of [-9, -3.2, 3.2, 9]) g.fillRect(b.x + k * z - 1.5 * z, b.y - 8 * z, 3 * z, 8 * z);
  poly([{ x: b.x - 13 * z, y: b.y - 8 * z }, { x: b.x + 13 * z, y: b.y - 8 * z },
        { x: b.x + 11 * z, y: b.y - 11.5 * z }, { x: b.x - 11 * z, y: b.y - 11.5 * z }], '#9a7a52'); // la plataforma
  g.fillStyle = '#c49a68'; g.fillRect(b.x - 10 * z, b.y - 26 * z, 20 * z, 14.5 * z); // el cuerpo de adobe
  ellipse({ x: b.x, y: b.y - 11.5 * z }, 10 * z, 3.6 * z, '#a37e50');                // el pie redondo
  g.strokeStyle = 'rgba(122,92,60,.35)'; g.lineWidth = 0.9 * z;                      // las hiladas del adobe
  for (let k = 1; k < 4; k++) { const hy = b.y - 11.5 * z - k * 3.6 * z; g.beginPath(); g.moveTo(b.x - 10 * z, hy); g.lineTo(b.x + 10 * z, hy); g.stroke(); }
  g.fillStyle = '#3a2a1c'; g.fillRect(b.x - 2.6 * z, b.y - 23 * z, 5.2 * z, 5 * z);  // el ventanuco
  dot({ x: b.x, y: b.y - 19 * z }, 2.1 * z, '#e4c96a');                              // el grano asoma
  const rimY = b.y - 27 * z, rrx = 17 * z, apex = { x: b.x, y: rimY - 18 * z };      // el techo de paja, con buen alero
  g.fillStyle = '#cba64f'; g.beginPath(); g.ellipse(b.x, rimY, rrx, 5 * z, 0, 0, Math.PI); g.fill();
  poly([{ x: b.x - rrx, y: rimY }, apex, { x: b.x + rrx, y: rimY }], '#cba64f');
  for (let k = -2; k <= 2; k++) line({ x: b.x + k * 5.5 * z, y: rimY }, { x: b.x + k * 1.5 * z, y: apex.y + 4 * z }, 'rgba(120,88,36,.3)', 1 * z);
  line({ x: b.x - rrx, y: rimY }, { x: b.x + rrx, y: rimY }, 'rgba(120,88,36,.45)', 1.2 * z);
  dot({ x: b.x, y: apex.y + 2 * z }, 1.8 * z, '#9c7a34');                            // el remate
  line({ x: b.x + 14 * z, y: b.y + 1 * z }, { x: b.x + 8.5 * z, y: b.y - 10.5 * z }, '#7a5c3c', 2.2 * z); // la escalerita de tronco
  for (let k = 1; k <= 3; k++) { const fx2 = b.x + (14 - k * 1.8) * z, fy2 = b.y + (1 - k * 3.8) * z; line({ x: fx2 - 1.8 * z, y: fy2 }, { x: fx2 + 1.8 * z, y: fy2 }, '#7a5c3c', 1.4 * z); }
  drawMaterialForma({ x: b.x - 13 * z, y: b.y + 1 * z }, z, 'grano');                // una gavilla al pie
}
function posAcarreador(t) { // Sena: del campo al granero cargada, y de vuelta con el cesto vacío
  const T = 14, cyc = ((t * 0.9) % T) / T;
  const campo = [4.7, 11.35], gran = [3.75, 9.55];
  let x, y, dir, carga;
  if (cyc < 0.34) { const f = smooth(cyc / 0.34); x = lerp(campo[0], gran[0], f); y = lerp(campo[1], gran[1], f); dir = -1; carga = 1; }
  else if (cyc < 0.48) { x = gran[0]; y = gran[1]; dir = -1; carga = 0; }            // vacía el cesto
  else if (cyc < 0.86) { const f = smooth((cyc - 0.48) / 0.38); x = lerp(gran[0], campo[0], f); y = lerp(gran[1], campo[1], f); dir = 1; carga = 0; }
  else { x = campo[0]; y = campo[1]; dir = 1; carga = 1; }                           // vuelve a cargar
  return { x, y, dir, carga };
}
/* LA POSICIÓN VISTA de cada cazador PERSIGUE a su puesto (visto jugando, 2026-08-02): al cambiar de
   acto (cerco → arreo → forcejeo, y al empezar o terminar la caza) la fórmula del puesto cambia de
   golpe, y los cinco se teletransportaban a la otra punta del anillo A LA VEZ. Ahora cada uno corre:
   rápido si su puesto quedó lejos (el sprint del arreo), pegado si su puesto rota (el anillo). La
   lanza (alza) también se alza en transición, no de golpe. */
const cazVis = [];
function posCazador(i, t) { // el ciclo del intento: acecho, salto, y el mamut se los sacude
  const meseta = S.tecs[15] && S.tecs[15].fase === 'meseta';
  const m = posMamut(t), ang = 2.5 + i * 0.75;
  // NADIE SE CAE DEL MUNDO: el claro vive junto a la esquina y el anillo de la caza pisaba el vacío
  // (visto jugando, 2026-08-02). El cinturón acota toda posición de cazador al diamante.
  const dentro = q => ({ ...q, x: Math.max(2.35, Math.min(17.65, q.x)), y: Math.max(2.35, Math.min(17.65, q.y)) });
  let o; // el PUESTO objetivo según el acto; la posición vista lo persigue más abajo
  if (S.cazaOn) { // LA CAZA EN TRES ACTOS (era un único forcejeo de 13 s, idéntico de punta a punta)
    const pg = S.cazaProg || 0;
    if (pg < 0.33) { // ACTO 1 · EL CERCO: acercarse en silencio, agachados, cerrando el anillo
      const a2 = t * 0.5 + i * 2.1, rr = 2.4 - (pg / 0.33) * 1.0;
      o = { x: m.x + Math.cos(a2) * rr, y: m.y + Math.sin(a2) * rr * 0.8, z: 0, giro: 0, alza: 0, polvo: 0 };
    } else if (pg < 0.66) { // ACTO 2 · EL ARREO: todos del mismo lado, lanzas en alto, y el mamut apura el tranco
      const lado = 2.2 + (i - 2.5) * 0.38, rr = 1.5 + Math.sin(t * 2.2 + i) * 0.1;
      o = { x: m.x + Math.cos(lado) * rr, y: m.y + Math.sin(lado) * rr * 0.8, z: Math.max(0, Math.sin(t * 3 + i * 1.3)) * 3, giro: 0, alza: 1, polvo: Math.max(0, Math.sin(t * 2.5 + i)) * 0.5 };
    } else { // ACTO 3 · EL FORCEJEO: el anillo apretado y los saltos sin descanso
      const a2 = t * 1.7 + i * 2.1, rr = 1.2 + Math.sin(t * 3 + i) * 0.14;
      o = { x: m.x + Math.cos(a2) * rr, y: m.y + Math.sin(a2) * rr * 0.8, z: Math.max(0, Math.sin(t * 5 + i * 2)) * 6, giro: 0, alza: 1, polvo: Math.max(0, Math.sin(t * 4 + i)) };
    }
  } else {
    const presente = m.fase === 'campo';                                                         // sin mamut a la vista no se le salta al aire
    const ax = presente ? m.x : MAMUT_HOME.x, ay = presente ? m.y : MAMUT_HOME.y;                // …se vigila el claro, pacientes
    let r = 2.3 + Math.sin(t * 0.5 + i * 2.1) * 0.06, z = 0, giro = 0, alza = 0, polvo = 0;
    if (meseta && presente) {
      const c = ((t * 0.85 + i * 1.9) % 6) / 6;
      if (c < 0.55) { r = 2.3 - (c / 0.55) * 1.15; }                                            // el acecho
      else if (c < 0.7) { r = 1.15; z = Math.sin((c - 0.55) / 0.15 * Math.PI) * 11; alza = 1; } // ¡el salto!
      else {                                                                                     // sale despedido, aterriza y se sacude
        const f = (c - 0.7) / 0.3;
        r = 1.15 + smooth(Math.min(1, f * 1.4)) * 1.35;
        giro = -0.85 * Math.sin(Math.min(1, f * 1.25) * Math.PI);
        z = Math.max(0, Math.sin(Math.min(1, f * 1.6) * Math.PI)) * 8;
        polvo = f > 0.45 && f < 0.9 ? Math.sin((f - 0.45) / 0.45 * Math.PI) : 0;
      }
    }
    o = { x: ax + Math.cos(ang) * r, y: ay + Math.sin(ang) * r * 0.8, z, giro, alza, polvo };
  }
  const v = cazVis[i] || (cazVis[i] = { x: o.x, y: o.y, alza: o.alza, t });
  const dt = Math.max(0, Math.min(0.1, t - v.t)); v.t = t;                     // acotado: un hipo no catapulta
  if (dt > 0) {
    const dx = o.x - v.x, dy = o.y - v.y, d = Math.hypot(dx, dy);
    const paso = Math.min(d, (1.6 + Math.min(d, 1.1) * 4) * dt);               // lejos = sprint (tope ~6 baldosas/s: corre, no vuela); cerca = pegado al puesto
    if (d > 1e-6) { v.x += dx / d * paso; v.y += dy / d * paso; }
    v.alza += (o.alza - v.alza) * (1 - Math.exp(-dt * 6));
  }
  return dentro({ ...o, x: v.x, y: v.y, alza: v.alza });
}
function drawCazador(i, t) {
  const q = posCazador(i, t), p = P(q.x, q.y, q.z), s = zoom;
  sombra(q.x, q.y + 0.04, 8, 3.2);
  if (q.polvo) { // la nubecita del aterrizaje
    g.save(); g.globalAlpha = q.polvo * .55;
    dot({ x: p.x - 9 * s, y: p.y - 2 * s }, 3.2 * s, '#cfc7b0');
    dot({ x: p.x - 14 * s, y: p.y - 5 * s }, 2.2 * s, '#cfc7b0');
    g.restore();
  }
  const acecho = 1 - Math.min(1, q.alza * 3);                                                   // en el aire nada tiembla
  const resp = Math.sin(t * 1.3 + i * 1.9) * 0.5 * s * acecho;                                  // la respiración contenida del acecho
  g.save(); g.translate(p.x, p.y - resp); g.rotate(q.giro);
  g.strokeStyle = PAL.piel; g.lineWidth = 2.2 * s; g.lineCap = 'round';                         // piernas flexionadas
  g.beginPath(); g.moveTo(-2 * s, -4 * s); g.lineTo(-3.5 * s, 0); g.stroke();
  g.beginPath(); g.moveTo(2 * s, -4 * s); g.lineTo(1 * s, 0); g.stroke();
  g.fillStyle = PAL.piel;
  g.beginPath(); g.ellipse(0, -8 * s, 6 * s, 5 * s, -0.35, 0, 7); g.fill();                     // torso agazapado
  g.fillStyle = '#8a6247'; g.fillRect(-4.5 * s, -7 * s, 9 * s, 3 * s);                          // taparrabos
  dot({ x: 4 * s, y: -14 * s }, 4.6 * s, PAL.piel);                                             // la cabeza, adelantada
  g.fillStyle = '#3a2c1c';
  g.beginPath(); g.arc(4 * s, -15.4 * s, 4.6 * s, Math.PI * .95, Math.PI * 2.05); g.fill();     // greñas
  dot({ x: 6.4 * s, y: -14.4 * s }, 0.8 * s, '#3a2c1c');                                        // el ojo fijo en el mamut
  const aL = -0.12 - q.alza * 0.95 + Math.sin(t * 7 + i * 2.3) * 0.025 * acecho;                // la lanza: horizontal al acechar (y temblando de tensión), alzada al saltar
  const lx = 2 * s, ly = -10 * s, tx = lx + Math.cos(aL) * 15 * s, ty = ly + Math.sin(aL) * 15 * s;
  g.strokeStyle = '#7a5636'; g.lineWidth = 1.5 * s;
  g.beginPath(); g.moveTo(lx - Math.cos(aL) * 4 * s, ly - Math.sin(aL) * 4 * s); g.lineTo(tx, ty); g.stroke();
  g.fillStyle = '#9aa4ac';                                                                       // la punta de sílex
  g.beginPath(); g.moveTo(tx + Math.cos(aL) * 3 * s, ty + Math.sin(aL) * 3 * s);
  g.lineTo(tx - Math.sin(aL) * 1.6 * s, ty + Math.cos(aL) * 1.6 * s);
  g.lineTo(tx + Math.sin(aL) * 1.6 * s, ty - Math.cos(aL) * 1.6 * s);
  g.closePath(); g.fill();
  g.restore();
}
function drawTroncoCaido(x, y, giro) {
  sombra(x, y + 0.05, 13, 4.5);
  const p = P(x, y);
  g.save(); g.translate(p.x, p.y); g.rotate(giro);
  g.fillStyle = '#6e4d33';
  g.beginPath(); g.roundRect(-12 * zoom, -6.5 * zoom, 24 * zoom, 6.5 * zoom, 3 * zoom); g.fill();
  g.fillStyle = '#8a6544';                                                                    // el lomo que da al sol
  g.beginPath(); g.roundRect(-12 * zoom, -6.5 * zoom, 24 * zoom, 2.6 * zoom, 3 * zoom); g.fill();
  g.strokeStyle = 'rgba(64,42,24,.4)'; g.lineWidth = 0.8 * zoom; g.lineCap = 'round';         // la corteza, a vetas
  for (const [vx0, vy, vx1] of [[-9, -4.6, 2], [-4, -2.2, 8], [-10, -1.2, -2]]) {
    g.beginPath(); g.moveTo(vx0 * zoom, vy * zoom); g.lineTo(vx1 * zoom, (vy - 0.4) * zoom); g.stroke();
  }
  line({ x: -7 * zoom, y: -6 * zoom }, { x: -9.5 * zoom, y: -11 * zoom }, '#5e4128', 1.8 * zoom); // el muñón de una rama
  dot({ x: -9.5 * zoom, y: -11 * zoom }, 1.1 * zoom, '#8a6544');
  ellipse({ x: 12 * zoom, y: -3.2 * zoom }, 2.6 * zoom, 3.2 * zoom, '#d9b98a');              // el corte con anillos
  g.strokeStyle = 'rgba(122,86,54,.6)'; g.lineWidth = 0.9 * zoom;
  g.beginPath(); g.ellipse(12 * zoom, -3.2 * zoom, 1.4 * zoom, 1.8 * zoom, 0, 0, 7); g.stroke();
  ellipse({ x: -4 * zoom, y: -6 * zoom }, 5 * zoom, 2 * zoom, 'rgba(102,152,74,.6)');        // musgo
  for (const [hx, hs] of [[4.5, 1], [6.3, 0.7]]) {                                            // los honguitos del tronco viejo
    line({ x: hx * zoom, y: -6.2 * zoom }, { x: hx * zoom, y: -7.6 * hs * zoom }, '#e0cc98', 0.9 * zoom);
    ellipse({ x: hx * zoom, y: -7.6 * hs * zoom }, 1.7 * hs * zoom, 1.1 * hs * zoom, '#c98a4a');
    ellipse({ x: (hx - 0.4) * zoom, y: -7.9 * hs * zoom }, 0.7 * hs * zoom, 0.4 * hs * zoom, '#e0b070');
  }
  g.restore();
}
function drawArbolSeco(x, y) {
  sombra(x, y + 0.06, 9, 4);
  const b = P(x, y);
  line({ x: b.x - 3.5 * zoom, y: b.y }, { x: b.x - 6.5 * zoom, y: b.y + 1.2 * zoom }, '#6a5748', 1.6 * zoom); // las raíces que lo anclan
  line({ x: b.x + 3 * zoom, y: b.y }, { x: b.x + 5.5 * zoom, y: b.y + 1 * zoom }, '#6a5748', 1.4 * zoom);
  line(P(x, y, 0), P(x, y, 36), '#6a5748', 3.4 * zoom);
  line({ x: P(x, y, 0).x - 0.9 * zoom, y: P(x, y, 0).y }, { x: P(x, y, 36).x - 0.9 * zoom, y: P(x, y, 36).y }, '#8a7460', 1.4 * zoom); // el flanco que da al sol
  line(P(x, y, 24), { x: P(x, y, 24).x - 11 * zoom, y: P(x, y, 33).y }, '#6a5748', 2 * zoom);
  line(P(x, y, 30), { x: P(x, y, 30).x + 9 * zoom, y: P(x, y, 39).y }, '#6a5748', 2 * zoom);
  line(P(x, y, 17), { x: P(x, y, 17).x + 7 * zoom, y: P(x, y, 22).y }, '#6a5748', 1.6 * zoom);
  line({ x: P(x, y, 24).x - 11 * zoom, y: P(x, y, 33).y }, { x: P(x, y, 24).x - 14 * zoom, y: P(x, y, 33).y + 3.5 * zoom }, '#5a4a3e', 1.1 * zoom); // la rama quebrada, colgando
  for (const [rz, rdx, rdy] of [[33, -4, -4], [35, 5, -3], [39, 2, -4]])                     // las puntas se afinan en ramitas
    line(P(x, y, rz), { x: P(x, y, rz).x + rdx * zoom, y: P(x, y, rz).y + rdy * zoom }, '#5a4a3e', 0.9 * zoom);
  const h = P(x, y, 21);                                                                      // el hueco del nido: alguien vive aquí
  ellipse({ x: h.x + 0.5 * zoom, y: h.y }, 1.5 * zoom, 1.9 * zoom, '#3d3128');
  g.strokeStyle = '#8a7460'; g.lineWidth = 0.7 * zoom;
  g.beginPath(); g.ellipse(h.x + 0.5 * zoom, h.y, 1.5 * zoom, 1.9 * zoom, 0, 0, 7); g.stroke();
}

/* --- Época 1: el abrigo rocoso y el fogón --- */
function drawCueva(t) {
  const b = P(9.5, 6.5), z = zoom;
  const q = (dx, dy) => ({ x: b.x + dx * z, y: b.y + dy * z });
  sombra(9.9, 7.1, 110, 48);
  // el peñón: masas de roca
  dot(q(26, -26), 46 * z, '#8f8a7c');
  dot(q(-34, -20), 38 * z, '#9b968a');
  dot(q(-2, -44), 40 * z, '#a8a396');
  dot(q(-14, -58), 22 * z, '#b3ae9f');
  // facetas angulares: las caras que atrapan la luz
  poly([q(-28, -62), q(-6, -80), q(14, -70), q(-8, -50)], '#bcb7a8');   // la cara alta iluminada
  poly([q(-58, -28), q(-42, -44), q(-26, -34), q(-42, -16)], '#aaa597');// el flanco oeste
  poly([q(38, -52), q(60, -32), q(50, -12), q(32, -30)], '#807b6e');    // el flanco este en sombra
  // estratos de la roca
  g.strokeStyle = 'rgba(70,65,58,.35)'; g.lineWidth = 1.3 * z; g.lineCap = 'round';
  g.beginPath(); g.arc(b.x - 2 * z, b.y - 26 * z, 50 * z, Math.PI * 1.08, Math.PI * 1.5); g.stroke();
  g.beginPath(); g.arc(b.x - 2 * z, b.y - 18 * z, 58 * z, Math.PI * 1.12, Math.PI * 1.42); g.stroke();
  // grietas
  g.strokeStyle = 'rgba(58,54,47,.55)'; g.lineWidth = 1.2 * z;
  g.beginPath(); g.moveTo(q(2, -72).x, q(2, -72).y); g.lineTo(q(8, -54).x, q(8, -54).y); g.lineTo(q(4, -40).x, q(4, -40).y); g.stroke();
  g.beginPath(); g.moveTo(q(38, -42).x, q(38, -42).y); g.lineTo(q(31, -26).x, q(31, -26).y); g.stroke();
  // líquenes y musgo
  ellipse(q(-20, -40), 6 * z, 3.4 * z, 'rgba(140,140,90,.45)');
  ellipse(q(16, -58), 5 * z, 3 * z, 'rgba(165,135,82,.4)');
  ellipse(q(44, -18), 4.4 * z, 2.6 * z, 'rgba(120,140,84,.4)');
  ellipse(q(-20, -64), 10 * z, 5 * z, 'rgba(102,152,74,.7)'); // el musgo alto
  // la boca irregular, con doble profundidad
  poly([q(-26, 3), q(-22, -11), q(-14, -8), q(-9, -16), q(-1, -10), q(6, -14), q(10, 3)], '#332e28');
  poly([q(-19, 3), q(-15, -7), q(-8, -5), q(-4, -11), q(2, -5), q(6, 3)], '#191512');
  ellipse(q(-7, 2), 15 * z, 3 * z, '#141110'); // el piso oscuro de la entrada
  // rocas que enmarcan la entrada
  dot(q(-28, 0), 4.5 * z, PAL.piedraD); dot(q(-30, -3), 3.2 * z, PAL.piedraL);
  dot(q(13, 0), 4 * z, PAL.piedraD); dot(q(15, -3), 2.8 * z, PAL.piedraL);
  // señales de hogar: la piel estirada en su bastidor, junto a la lanza…
  line(q(-52, 5), q(-42, -15), '#7a5636', 1.6 * z);
  line(q(-42, 5), q(-52, -15), '#7a5636', 1.6 * z);
  poly([q(-51, -3), q(-43, -4), q(-44, -11), q(-50, -10)], '#c9a87c');
  g.strokeStyle = '#a3805c'; g.lineWidth = 0.9 * z;
  g.beginPath(); g.moveTo(q(-50, -10).x, q(-50, -10).y); g.lineTo(q(-44, -4).x, q(-44, -4).y); g.stroke(); // costura
  // …la lanza apoyada…
  line(q(-36, 4), q(-29, -25), '#7a5636', 1.7 * z);
  poly([q(-30.5, -28), q(-27.5, -25.5), q(-30, -23)], '#9aa4ac'); // la punta de sílex
  // …y la pila de leña
  line(q(-19, 6), q(-9, 6), '#6e4d33', 3 * z);
  line(q(-18, 3.4), q(-10, 3.4), '#7a5a3d', 3 * z);
  line(q(-15, 0.8), q(-11, 0.8), '#6e4d33', 3 * z);
  const fp = S.tecs[12] ? S.tecs[12].fase : 'sin';
  if (fp !== 'sin') { // las pinturas rupestres, sobre la pared del peñón
    const wall = { x: b.x + 26 * zoom, y: b.y - 30 * zoom };
    g.save(); g.globalAlpha = (fp === 'valle' || fp === 'formando') ? .45 : .95;
    g.fillStyle = '#a24e30';
    const nv = nivelTec(12);                                    // el mural crece con cada etapa perfeccionada
    for (let i = 0; i < 3 + nv * 2; i++) {                      // las manos estampadas se multiplican
      const fila = Math.floor(i / 3), col = i % 3;
      nacerEn('mano' + i, e => dot({ x: wall.x - 9 * zoom + col * 8 * zoom - fila * 3 * zoom,
            y: wall.y - 9 * zoom + (col % 2) * 4 * zoom - fila * 9 * zoom }, 2.6 * zoom * e, '#a24e30'));
    }
    g.beginPath(); g.ellipse(wall.x + 2 * zoom, wall.y + 8 * zoom, 9 * zoom, 5 * zoom, -0.15, 0, 7); g.fill(); // el bisonte
    dot({ x: wall.x + 11 * zoom, y: wall.y + 4 * zoom }, 3.2 * zoom, '#a24e30');
    line({ x: wall.x - 4 * zoom, y: wall.y + 12 * zoom }, { x: wall.x - 4 * zoom, y: wall.y + 16 * zoom }, '#a24e30', 1.4 * zoom);
    line({ x: wall.x + 7 * zoom, y: wall.y + 12 * zoom }, { x: wall.x + 7 * zoom, y: wall.y + 16 * zoom }, '#a24e30', 1.4 * zoom);
    line({ x: wall.x + 12 * zoom, y: wall.y + 1 * zoom }, { x: wall.x + 15 * zoom, y: wall.y - 3 * zoom }, '#a24e30', 1.2 * zoom); // el cuerno
    if (nv >= 1) { // un ciervo pequeño, con su asta
      nacerEn('ciervo', () => {
      g.beginPath(); g.ellipse(wall.x - 14 * zoom, wall.y + 6 * zoom, 6 * zoom, 3.2 * zoom, 0.12, 0, 7); g.fill();
      dot({ x: wall.x - 20 * zoom, y: wall.y + 3.5 * zoom }, 2.2 * zoom, '#a24e30');
      line({ x: wall.x - 21 * zoom, y: wall.y + 1 * zoom }, { x: wall.x - 23 * zoom, y: wall.y - 3 * zoom }, '#a24e30', 1.1 * zoom);
      line({ x: wall.x - 19 * zoom, y: wall.y + 1 * zoom }, { x: wall.x - 18 * zoom, y: wall.y - 3.5 * zoom }, '#a24e30', 1.1 * zoom);
      line({ x: wall.x - 16 * zoom, y: wall.y + 9 * zoom }, { x: wall.x - 16 * zoom, y: wall.y + 13 * zoom }, '#a24e30', 1.2 * zoom);
      line({ x: wall.x - 11 * zoom, y: wall.y + 9 * zoom }, { x: wall.x - 11 * zoom, y: wall.y + 13 * zoom }, '#a24e30', 1.2 * zoom);
    });
    }
    if (nv >= 2) { // los cazadores en fila: la escena aprende a contar una historia
      nacerEn('cazadoresMural', () => {
      for (let i = 0; i < 3; i++) {
        const hx = wall.x - 6 * zoom + i * 7 * zoom, hy = wall.y + 22 * zoom;
        dot({ x: hx, y: hy - 5 * zoom }, 1.5 * zoom, '#a24e30');
        line({ x: hx, y: hy - 3.6 * zoom }, { x: hx, y: hy + 1.5 * zoom }, '#a24e30', 1.1 * zoom);
        line({ x: hx, y: hy + 1.5 * zoom }, { x: hx - 1.8 * zoom, y: hy + 5 * zoom }, '#a24e30', 1 * zoom);
        line({ x: hx, y: hy + 1.5 * zoom }, { x: hx + 1.8 * zoom, y: hy + 5 * zoom }, '#a24e30', 1 * zoom);
        line({ x: hx + 1 * zoom, y: hy - 2.5 * zoom }, { x: hx + 5 * zoom, y: hy - 6 * zoom }, '#a24e30', 1 * zoom); // la lanza
      }
    });
    }
    if (nv >= 3) { // el sol y las cuentas: el mural ya guarda saber, no solo caza
      nacerEn('solYcuentas', () => {
      g.beginPath(); g.arc(wall.x + 20 * zoom, wall.y - 14 * zoom, 3.4 * zoom, 0, 7); g.fill();
      for (let i = 0; i < 6; i++) {
        const aa = i * Math.PI / 3;
        line({ x: wall.x + 20 * zoom + Math.cos(aa) * 5 * zoom, y: wall.y - 14 * zoom + Math.sin(aa) * 5 * zoom },
             { x: wall.x + 20 * zoom + Math.cos(aa) * 7.5 * zoom, y: wall.y - 14 * zoom + Math.sin(aa) * 7.5 * zoom }, '#a24e30', 1 * zoom);
      }
      for (let i = 0; i < 5; i++) line({ x: wall.x - 22 * zoom + i * 3 * zoom, y: wall.y + 17 * zoom },
                                        { x: wall.x - 22 * zoom + i * 3 * zoom, y: wall.y + 23 * zoom }, '#a24e30', 1.1 * zoom); // las muescas contadas
    });
    }
    g.restore();
    estadoTec(12, { x: wall.x, y: wall.y - 22 * zoom }, t);
  }
}
function drawFogata(t) {
  const c = P(6.5, 9.5);
  sombra(6.5, 9.6, 16, 7);
  if (!S.fuegoDescubierto) { // la leña espera su primera chispa
    line({ x: c.x - 7 * zoom, y: c.y - 1 * zoom }, { x: c.x + 7 * zoom, y: c.y + 2 * zoom }, '#6b5a48', 3 * zoom);
    line({ x: c.x - 6 * zoom, y: c.y + 2.5 * zoom }, { x: c.x + 6 * zoom, y: c.y - 2 * zoom }, '#7a6a55', 3 * zoom);
    dot({ x: c.x, y: c.y - 2 * zoom }, 3 * zoom, '#c9b98a'); // la yesca seca
    if (S.fuego > 45) { // hilos de humo
      g.save(); g.globalAlpha = .35 + Math.sin(t * 3) * .1;
      dot({ x: c.x + Math.sin(t * 2) * 2 * zoom, y: c.y - 9 * zoom }, 2.4 * zoom, '#cfc9bd');
      dot({ x: c.x + Math.sin(t * 2 + 1) * 3 * zoom, y: c.y - 15 * zoom }, 3 * zoom, '#cfc9bd');
      g.restore();
    }
    if (S.fuego > 75) { // la brasa late
      g.save(); g.globalAlpha = .5 + Math.sin(t * 6) * .4;
      dot({ x: c.x, y: c.y - 2 * zoom }, 1.8 * zoom, '#e86a2e');
      g.restore();
    }
    return;
  }
  const f10 = S.tecs[10] ? S.tecs[10].fase : 'sin';
  if (f10 !== 'sin') for (let k = 0; k < 8; k++) { // el círculo de piedras (aparato)
    const a = k * Math.PI / 4 + 0.3;
    dot({ x: c.x + Math.cos(a) * 26 * zoom, y: c.y + Math.sin(a) * 12 * zoom }, 3 * zoom, k % 2 ? PAL.piedraL : PAL.piedraD);
  }
  ellipse({ x: c.x, y: c.y }, 10 * zoom, 4.6 * zoom, '#4a3a30');                                    // ceniza
  line({ x: c.x - 7 * zoom, y: c.y - 1 * zoom }, { x: c.x + 7 * zoom, y: c.y + 2 * zoom }, '#5e4128', 3 * zoom); // leños
  line({ x: c.x - 6 * zoom, y: c.y + 2.5 * zoom }, { x: c.x + 6 * zoom, y: c.y - 2 * zoom }, '#6e4d33', 3 * zoom);
  const brasa = S.era === 1 ? Math.max(.14, Math.min(1, (S.fuego - 35) / 65)) : 1;                  // qué tan viva está la brasa
  const parpadeo = (.24 + Math.sin(t * 9) * .05 + Math.sin(t * 23) * .025) * (0.5 + 0.5 * brasa);   // el fuego respira
  const radioHalo = (52 + Math.sin(t * 7) * 5) * zoom * (0.55 + 0.45 * brasa);
  const gl = g.createRadialGradient(c.x, c.y - 6 * zoom, 2, c.x, c.y - 6 * zoom, radioHalo);
  gl.addColorStop(0, `rgba(255,180,90,${parpadeo})`); gl.addColorStop(1, 'rgba(255,180,90,0)');
  g.fillStyle = gl; g.beginPath(); g.arc(c.x, c.y - 6 * zoom, radioHalo, 0, 7); g.fill();
  for (let i = 0; i < 3; i++) { // las llamas
    const w = Math.sin(t * 7 + i * 2.1) * 2.4 * zoom;
    const hF = (12 + i * 4 + Math.sin(t * 9 + i) * 2.5) * zoom * (0.6 + 0.4 * brasa);
    const bx = c.x + (i - 1) * 4 * zoom;
    g.beginPath();
    g.moveTo(bx - 3.4 * zoom, c.y - 1 * zoom);
    g.quadraticCurveTo(bx - 3 * zoom + w, c.y - hF * .6, bx + w, c.y - hF);
    g.quadraticCurveTo(bx + 3 * zoom + w, c.y - hF * .6, bx + 3.4 * zoom, c.y - 1 * zoom);
    g.closePath();
    g.globalAlpha = .92; g.fillStyle = ['#e86a2e', '#f6a23c', '#f4c04c'][i]; g.fill(); g.globalAlpha = 1;
  }
  dot({ x: c.x, y: c.y - 4 * zoom }, 2.6 * zoom, '#f8dc8c'); // el corazón de la brasa
  if (f10 !== 'sin') estadoTec(10, { x: c.x, y: c.y - 36 * zoom }, t);
  if (S.era === 1 && brasa < 0.42) { // la brasa pide leña: anillo cálido que late
    const rp = (18 + Math.sin(t * 3.2) * 4) * zoom;
    g.save(); g.globalAlpha = Math.max(0, 0.55 - brasa) * (0.55 + Math.sin(t * 3.2) * 0.45);
    g.strokeStyle = '#ffb45a'; g.lineWidth = 2 * zoom;
    g.beginPath(); g.ellipse(c.x, c.y - 2 * zoom, rp, rp * 0.5, 0, 0, 7); g.stroke(); g.restore();
  }
}
function drawTambor(t) {
  const p = P(7.7, 10.4), fase = S.tecs[11].fase;
  sombra(7.7, 10.46, 8, 3.6);
  const golpe = fase === 'meseta' ? Math.abs(Math.sin(t * 5)) * 1.2 * zoom : 0;
  g.fillStyle = '#6e4d33';
  g.fillRect(p.x - 6 * zoom, p.y - 9 * zoom, 12 * zoom, 9 * zoom);                                  // el tronco hueco
  ellipse({ x: p.x, y: p.y }, 6 * zoom, 2.8 * zoom, '#5e4128');
  ellipse({ x: p.x, y: p.y - 9 * zoom + golpe }, 6 * zoom, 2.8 * zoom, '#d9b98a');                  // el parche
  const nT = nivelTec(11);                                   // MÁXIMA: cada etapa se tiene que ver
  if (nT >= 1) { // lo decoran con ocre: el aparato deja de ser un tronco y pasa a ser SUYO
    nacerEn('aroOcre', () => {
    g.strokeStyle = '#a24e30'; g.lineWidth = 2.2 * zoom;
    g.beginPath(); g.moveTo(p.x - 6 * zoom, p.y - 7 * zoom); g.lineTo(p.x + 6 * zoom, p.y - 7 * zoom); g.stroke();
    g.beginPath(); g.moveTo(p.x - 6 * zoom, p.y - 2.4 * zoom); g.lineTo(p.x + 6 * zoom, p.y - 2.4 * zoom); g.stroke();
    g.lineWidth = 1.3 * zoom;
    g.beginPath();
    for (let k = 0; k <= 6; k++) g.lineTo(p.x + (-6 + k * 2) * zoom, p.y + (k % 2 ? -4 : -5.6) * zoom);
    g.stroke();
    for (let i = 0; i < 4; i++) dot({ x: p.x - 4.5 * zoom + i * 3 * zoom, y: p.y - 8.6 * zoom }, 1.2 * zoom, '#d9b98a');
  });
  }
  if (nT >= 2) { // el segundo tambor: ya no toca uno solo, se responden
    nacerEn('tambor2', () => {
    const q = { x: p.x + 13 * zoom, y: p.y + 2 * zoom };
    ellipse({ x: q.x, y: q.y + 1.5 * zoom }, 4.4 * zoom, 2 * zoom, 'rgba(40,32,24,.18)');
    g.fillStyle = '#7a5a3d'; g.fillRect(q.x - 4.2 * zoom, q.y - 6.5 * zoom, 8.4 * zoom, 6.5 * zoom);
    const g2 = fase === 'meseta' ? Math.abs(Math.sin(t * 5 + 1.6)) * 1 * zoom : 0;
    ellipse({ x: q.x, y: q.y - 6.5 * zoom + g2 }, 4.2 * zoom, 2 * zoom, '#d9b98a');
  });
  }
  if (nT >= 3) { // el tercer tambor, el agudo: ya es una batería y se tocan tres voces
    nacerEn('tambor3', e => {
      const q = { x: p.x - 11 * zoom, y: p.y + 1 * zoom }, h = 5.4 * zoom * e;
      ellipse({ x: q.x, y: q.y + 1.4 * zoom }, 3.6 * zoom * e, 1.7 * zoom * e, 'rgba(40,32,24,.18)');
      g.fillStyle = '#8a6440'; g.fillRect(q.x - 3.4 * zoom * e, q.y - h, 6.8 * zoom * e, h);
      const g3 = fase === 'meseta' ? Math.abs(Math.sin(t * 5 + 3.1)) * 0.9 * zoom : 0;
      ellipse({ x: q.x, y: q.y - h + g3 }, 3.4 * zoom * e, 1.6 * zoom * e, '#e4c9a0');
      g.strokeStyle = '#a24e30'; g.lineWidth = 0.9 * zoom;                                // también decorado
      g.beginPath(); g.moveTo(q.x - 3.4 * zoom * e, q.y - h * 0.5); g.lineTo(q.x + 3.4 * zoom * e, q.y - h * 0.5); g.stroke();
    });
  }
  line({ x: p.x + 5 * zoom, y: p.y - 15 * zoom + golpe * 2 }, { x: p.x + 1 * zoom, y: p.y - 9.5 * zoom + golpe }, '#8a6f4d', 1.4 * zoom); // baqueta
  if (fase === 'meseta') {
    const a = ((t * 0.8) % 1);
    g.save(); g.globalAlpha = 1 - a;
    g.fillStyle = '#4a3a26'; g.font = `${8 * zoom}px Georgia, serif`; g.textAlign = 'center';
    g.fillText('♪', p.x - 6 * zoom - a * 6 * zoom, p.y - 18 * zoom - a * 16 * zoom);
    g.restore();
  }
  estadoTec(11, { x: p.x, y: p.y - 24 * zoom }, t);
}
function drawHueso(t) {
  const p = P(5.3, 8.4);
  sombra(5.3, 8.45, 7, 3.2);
  poly([{ x: p.x - 7 * zoom, y: p.y }, { x: p.x - 3 * zoom, y: p.y - 5 * zoom }, { x: p.x + 5 * zoom, y: p.y - 4.5 * zoom }, { x: p.x + 7 * zoom, y: p.y }], PAL.piedraL); // la piedra-mesa
  g.save(); g.translate(p.x, p.y - 6 * zoom); g.rotate(-0.25);
  g.fillStyle = '#efe8d4';
  g.beginPath(); g.roundRect(-6.5 * zoom, -1.6 * zoom, 13 * zoom, 3.2 * zoom, 1.6 * zoom); g.fill(); // el hueso
  dot({ x: -6.5 * zoom, y: 0 }, 2 * zoom, '#efe8d4'); dot({ x: 6.5 * zoom, y: 0 }, 2 * zoom, '#efe8d4');
  g.strokeStyle = '#8a6f4d'; g.lineWidth = 0.8 * zoom;
  const nH = nivelTec(13);                                   // se cuenta cada vez más lejos
  // Las muescas del SABER (lo que el clan ya sabía contar) y, a continuación, LAS QUE TALLA EL JUGADOR.
  // Estas últimas solo llegan hasta cerrar el grupo de cinco: al quinto golpe el grupo se salda y pasa a
  // ser una piedra de la hilera de abajo. Eso es el hueso de Ishango y es la lección: agrupar para contar.
  const muescas = 5 + nH * 3 + ((S.muescas || 0) % 5);
  for (let i = 0; i < muescas; i++) { // las muescas de contar, AGRUPADAS DE CINCO desde la primera etapa
    const grupo = Math.floor(i / 5), dentro = i % 5;
    const xx = (-5.6 + grupo * 3.4 + dentro * 0.62) * zoom;
    const propia = i >= 5 + nH * 3;                       // recién tallada: más fresca y más marcada
    g.strokeStyle = propia ? '#6b4a2a' : '#8a6f4d'; g.lineWidth = (propia ? 1 : 0.8) * zoom;
    if (nH >= 1 && dentro === 4) { // la quinta cruza a las otras cuatro: así se cuenta de cinco en cinco
      g.beginPath(); g.moveTo(xx - 2.6 * zoom, 1.3 * zoom); g.lineTo(xx + 0.3 * zoom, -1.3 * zoom); g.stroke();
    } else { g.beginPath(); g.moveTo(xx, -1.2 * zoom); g.lineTo(xx, 1.2 * zoom); g.stroke(); }
  }
  g.strokeStyle = '#8a6f4d'; g.lineWidth = 0.8 * zoom;
  if (nH >= 2) { // un segundo hueso, y una segunda losa donde ponerlo: la cuenta ya no cabe en uno
    nacerEn('losa2', e => {
      g.save(); g.translate(0, 0);
      poly([{ x: 4 * zoom, y: 3.5 * zoom }, { x: 9 * zoom, y: -2.5 * zoom * e },
            { x: 19 * zoom * e, y: -1 * zoom * e }, { x: 17 * zoom * e, y: 5 * zoom }], PAL.piedraD);
      g.restore();
    });
    nacerEn('hueso2', () => {
    g.save(); g.translate(12 * zoom, 0.5 * zoom); g.rotate(0.22); g.scale(1.15, 1.15);
    g.fillStyle = '#e4dcc6';
    g.beginPath(); g.roundRect(-5.5 * zoom, -1.3 * zoom, 11 * zoom, 2.6 * zoom, 1.3 * zoom); g.fill();
    dot({ x: -5.5 * zoom, y: 0 }, 1.7 * zoom, '#e4dcc6'); dot({ x: 5.5 * zoom, y: 0 }, 1.7 * zoom, '#e4dcc6');
    g.strokeStyle = '#8a6f4d'; g.lineWidth = 0.7 * zoom;
    for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo((-4 + i * 1.6) * zoom, -1 * zoom); g.lineTo((-4 + i * 1.6) * zoom, 1 * zoom); g.stroke(); }
    g.restore();
    });
  }
  if (nH >= 1) { // las piedras de contar en dos hileras: lo que no cabe en muescas se cuenta aparte
    nacerEn('piedrasConteo', e => {
      for (let i = 0; i < 7; i++) dot({ x: (-9 + i * 3.1) * zoom, y: 8.8 * zoom }, 2.3 * zoom * e, i % 2 ? '#9b968a' : '#b3ae9f');
      for (let i = 0; i < 5; i++) dot({ x: (-7.4 + i * 3.1) * zoom, y: 12.2 * zoom }, 2.1 * zoom * e, i % 2 ? '#b3ae9f' : '#8f8a7c');
    });
  }
  if (nH >= 3) { // el cordel de nudos: la cuenta se vuelve portátil y se hereda
    nacerEn('cordelNudos', e => {
      g.strokeStyle = '#7a5636'; g.lineWidth = 2 * zoom;        // la vara de la que cuelga el manojo
      g.beginPath(); g.moveTo(-13 * zoom, -3.4 * zoom); g.lineTo(-3 * zoom, -4.2 * zoom); g.stroke();
      g.strokeStyle = '#8a6247'; g.lineWidth = 2.4 * zoom;
      for (let c = 0; c < 3; c++) {                              // tres ramales: el registro ya es un manojo
        const x0 = (-11 + c * 3.2) * zoom;
        g.beginPath(); g.moveTo(x0, -3 * zoom);
        g.quadraticCurveTo(x0 - 2.4 * zoom, 6 * zoom, x0 - 0.8 * zoom, 15 * zoom * e); g.stroke();
        for (let i = 0; i < 4; i++) dot({ x: x0 - 1.4 * zoom - Math.sin(i + c) * 0.7 * zoom, y: (1.5 + i * 3.4) * zoom * e }, 2.2 * zoom * e, '#6e5a4a');
      }
    });
  }
  { // LOS GRUPOS SALDADOS: cada cinco muescas talladas se cierran en una piedra, y la hilera crece sola
    const grupos = Math.min(20, Math.floor((S.muescas || 0) / 5));
    for (let i = 0; i < grupos; i++) { // a la derecha del manojo de cordeles, para no pisarlo en el nivel 3
      const fila = Math.floor(i / 10), col = i % 10;
      dot({ x: (-1 + col * 2.4) * zoom, y: (16.5 + fila * 3.1) * zoom }, 2.2 * zoom, col % 2 ? '#c8a86a' : '#d9bf86'); // ocre: son las del clan, no las de la losa
    }
  }
  if (S.signo) { // LA MARCA QUE DEJÓ DE SER MUESCA: barro presionado, y dentro, un signo que ya no se parece a lo contado
    nacerEn('signoBarro', e => {
      g.save(); g.translate(10.5 * zoom, 9 * zoom); g.rotate(0.1); g.scale(e, e);
      g.fillStyle = '#a3714a';
      g.beginPath(); g.roundRect(-5 * zoom, -3.4 * zoom, 10 * zoom, 6.8 * zoom, 1.8 * zoom); g.fill();   // la pella de barro
      g.fillStyle = '#b98457';
      g.beginPath(); g.roundRect(-4.4 * zoom, -2.9 * zoom, 8.8 * zoom, 5.2 * zoom, 1.4 * zoom); g.fill(); // la cara alisada, aún húmeda
      g.strokeStyle = '#6b4526'; g.lineWidth = 0.9 * zoom; g.lineCap = 'round';
      for (const [x0, y0, x1, y1] of [[-2.6, -1.4, -0.6, 0.2], [-2.6, 1.2, -0.6, 0.2], [0.6, -1.4, 2.6, -1.4], [0.6, 0.4, 2.6, 0.4]]) { // cuñas: la seña, no el dibujo
        g.beginPath(); g.moveTo(x0 * zoom, y0 * zoom); g.lineTo(x1 * zoom, y1 * zoom); g.stroke();
      }
      g.restore();
    });
  }
  g.restore();
  { // LO QUE ESPERA CUENTA: fichas amontonadas junto al hueso. Se ven llegar y se ven irse, una por muesca
    const pend = cuentasPendientes();
    for (let i = 0; i < pend; i++) {
      const col = i % 4, fila = Math.floor(i / 4);
      const bob = Math.sin(t * 2.6 + i * 0.9) * 0.35 * zoom;
      dot({ x: p.x - 13 * zoom + col * 2.6 * zoom, y: p.y - 1.5 * zoom - fila * 2.2 * zoom + bob }, 2 * zoom, i % 2 ? '#8f8a7c' : '#a49d8c');
    }
  }
  if (S.tecs[13].fase === 'meseta' && Math.sin(t * 4.3) > 0.88) dot({ x: p.x + 3 * zoom, y: p.y - 8 * zoom }, 1.3 * zoom, '#fff7b0'); // la chispa del tallador
  tocable(5.3, 8.4, { k: 'conteo' }); // el hueso se toca: con cuentas pendientes se talla, sin ellas cuenta lo suyo
  estadoTec(13, { x: p.x, y: p.y - 18 * zoom }, t);
}

/* --- Aparato 2: gramófono con bocina de latón --- */
function drawGramofono(t) {
  const x = 13.4, y = 6.4, fase = S.tecs[2].fase;
  sombra(x + 0.2, y + 0.25, 10, 4.5);
  isoBox(x, y, 0.5, 0.42, 13, PAL.maderaL, PAL.maderaL, PAL.maderaD);
  isoBox(x + 0.12, y + 0.09, 0.28, 0.24, 8, '#8a5a45', '#a06a4a', '#6e4433', 13);
  const cr = P(x + 0.42, y + 0.2, 17);
  line(cr, { x: cr.x + 4.5 * zoom, y: cr.y + 1.5 * zoom }, '#4a3a26', 1.6 * zoom); // manivela
  dot({ x: cr.x + 4.5 * zoom, y: cr.y + 1.5 * zoom }, 1.3 * zoom, '#4a3a26');
  // bocina: cuello curvo + campana abierta hacia arriba-izquierda
  const nb = P(x + 0.2, y + 0.18, 21);
  g.strokeStyle = PAL.campanaD; g.lineWidth = 2.6 * zoom;
  g.beginPath(); g.moveTo(nb.x, nb.y);
  g.quadraticCurveTo(nb.x - 2 * zoom, nb.y - 8 * zoom, nb.x - 8 * zoom, nb.y - 12 * zoom);
  g.stroke();
  g.save(); g.translate(nb.x - 12 * zoom, nb.y - 15 * zoom); g.rotate(-0.5);
  g.beginPath(); g.ellipse(0, 0, 9.5 * zoom, 7 * zoom, 0, 0, 7); g.fillStyle = PAL.campana; g.fill();
  g.beginPath(); g.ellipse(0.8 * zoom, 0.6 * zoom, 6 * zoom, 4.4 * zoom, 0, 0, 7); g.fillStyle = PAL.campanaD; g.fill();
  g.restore();
  if (fase === 'meseta' || fase === 'novedad') { // notas musicales flotando
    for (let k = 0; k < 2; k++) {
      const a = ((t * 0.5 + k * 0.5) % 1);
      const np = { x: nb.x - 14 * zoom - a * 10 * zoom + Math.sin(a * 9 + k) * 3 * zoom, y: nb.y - 18 * zoom - a * 26 * zoom };
      g.save(); g.globalAlpha = 1 - a;
      g.fillStyle = '#4a3a26'; g.font = `${9 * zoom}px Georgia, serif`; g.textAlign = 'center';
      g.fillText(k % 2 ? '♪' : '♫', np.x, np.y);
      g.restore();
    }
  }
  estadoTec(2, P(x + 0.25, y + 0.2, 38), t);
}

/* --- Aparato 3: biblioteca de aula, rincón de lectura bajo el árbol --- */
function drawBiblioteca(t) {
  const x = 2.8, y = 10.3, fase = S.tecs[3].fase;
  sombra(x + 0.3, y + 0.2, 13, 5);
  isoBox(x, y, 0.7, 0.3, 30, PAL.maderaL, PAL.maderaL, PAL.maderaD);
  // repisas con lomos de libros en la cara frontal
  const q = (xx, z) => P(xx, y + 0.3, z);
  for (const zi of [10, 20]) line(q(x, zi), q(x + 0.7, zi), PAL.maderaD, 1.6 * zoom);
  const lomos = ['#b06a4a', '#5f7488', '#4e7a34', '#c98f2e', '#8a5a45', '#a3405f'];
  const rngL = mulberry32(7);
  for (const base of [1.5, 11.5, 21.5]) {
    let lx = x + 0.05;
    while (lx < x + 0.62) {
      const wl = 0.06 + rngL() * 0.05;
      poly([q(lx, base + 7.2), q(lx + wl, base + 7.2), q(lx + wl, base), q(lx, base)], lomos[Math.floor(rngL() * lomos.length)]);
      lx += wl + 0.015;
    }
  }
  // alfombrita de lectura
  ellipse(P(x + 0.9, y + 0.75), 12 * zoom, 5.5 * zoom, '#b5533c');
  ellipse(P(x + 0.9, y + 0.75), 8.5 * zoom, 3.8 * zoom, '#c96a50');
  if (fase === 'meseta') { // un alumno sentado leyendo
    const k = P(x + 0.92, y + 0.72);
    const s = zoom, nod = Math.sin(t * 1.2) * 0.8 * s;
    ellipse({ x: k.x, y: k.y + 2 * s }, 7 * s, 3 * s, sombraHoy);
    g.save(); g.translate(k.x, k.y);
    g.fillStyle = PAL.delantal;
    g.beginPath(); g.moveTo(-5.5 * s, 2 * s);
    g.quadraticCurveTo(-5 * s, -9 * s, 0, -10 * s);
    g.quadraticCurveTo(5 * s, -9 * s, 5.5 * s, 2 * s); g.closePath(); g.fill();
    g.fillStyle = '#f6f1e3';
    g.fillRect(-5 * s, -6 * s, 4.6 * s, 5 * s); g.fillRect(0.4 * s, -6 * s, 4.6 * s, 5 * s); // libro abierto
    g.strokeStyle = 'rgba(90,70,40,.5)'; g.lineWidth = 0.9 * s;
    g.beginPath(); g.moveTo(0, -6 * s); g.lineTo(0, -1 * s); g.stroke();
    dot({ x: 0, y: -14 * s + nod }, 5.6 * s, PAL.piel);
    g.beginPath(); g.arc(0, -15.4 * s + nod, 5.5 * s, Math.PI * .95, Math.PI * 2.05); g.fillStyle = '#4a3220'; g.fill();
    g.restore();
  }
  estadoTec(3, P(x + 0.35, y + 0.15, 38), t);
}

/* ============================================================
   PERSONAJES
   ============================================================ */
