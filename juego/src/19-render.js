/* ============================================================
   19-render
   El bucle de dibujo: rótulos, PROPS, la cámara (zoom, paneo, encuadre) y los popups de los indicadores.
   ============================================================ */
function textoConvite(txt, px, py) { // GRAMÁTICA: rótulo de acción, siempre legible (mín. 11px, con contorno)
  g.save();
  g.font = '800 ' + Math.max(11, 10.5 * zoom).toFixed(1) + 'px "Avenir Next", "Nunito", sans-serif';
  g.textAlign = 'center'; g.lineJoin = 'round';
  g.strokeStyle = 'rgba(40,30,24,.75)'; g.lineWidth = 3; g.strokeText(txt, px, py);
  g.fillStyle = '#ffd873'; g.fillText(txt, px, py);
  g.restore();
}
function drawConvites(t) { // los rótulos de acción del mundo, en el pase de overlay: nadie los tapa
  if (S.era !== 1) return;
  if (S.fuegoDescubierto && (S.fuego - 35) / 65 < 0.42) { const c = P(6.5, 9.5); textoConvite('echar leña', c.x, c.y - 46 * zoom); }
  if (cultivoActivo() && (S.cultivo || 0) >= 1) { const R = campoRect(), c = P((R.x0 + R.x1) / 2, (R.y0 + R.y1) / 2); textoConvite('cosechar', c.x, c.y - 30 * zoom); }
}
function drawNarrador(t) { // el narrador del círculo: las historias aprendidas se cuentan, no se guardan
  const x = 7.15, y = 10.72, p = P(x, y), s = zoom;                                  // junto al tambor, fuera del sendero
  drawAlumno(p.x, p.y, -1, 0, 2);                                                    // de pie, mirando al fuego
  const swing = Math.sin(t * 1.8);
  const hx = p.x - (8 + swing * 3) * s, hy = p.y - (24 + Math.max(0, swing) * 5) * s;
  line({ x: p.x - 3 * s, y: p.y - 15 * s }, { x: hx, y: hy }, PAL.piel, 2.2 * s);    // el brazo dibuja la historia en el aire
  dot({ x: hx, y: hy }, 1.5 * s, PAL.piel);
  if (Math.sin(t * 0.9) > 0.35) {                                                    // la chispa de la historia sobre su cabeza
    const a = 0.4 + 0.4 * Math.sin(t * 6);
    g.save(); g.globalAlpha = a; dot({ x: p.x + 2 * s, y: p.y - 36 * s }, 1.7 * s, '#ffd873'); g.restore();
  }
}
function drawPintor(t) { // el artista de la cueva (pinturas en meseta)
  const px = P(11.35, 7.15), s = zoom;
  drawAlumno(px.x, px.y, -1, 0, 1);
  const hx = px.x - 8 * s + Math.sin(t * 2.2) * 2.5 * s;
  const hy = px.y - 26 * s - Math.abs(Math.cos(t * 2.2)) * 4 * s;
  line({ x: px.x - 3 * s, y: px.y - 15 * s }, { x: hx, y: hy }, PAL.piel, 2.2 * s); // el brazo que pinta
  dot({ x: hx, y: hy }, 1.6 * s, '#a24e30');                                        // la mano con ocre
}
function drawVignette() {
  const grad = g.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.38, W / 2, H / 2, Math.max(W, H) * 0.72);
  grad.addColorStop(0, 'rgba(25,70,110,0)');
  grad.addColorStop(1, 'rgba(25,70,110,.16)');
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
}

/* ============================================================
   ESCENA
   ============================================================ */
const PROPS = [
  { d: 13.0,        draw: t => drawEscuela(t) },
  { d: 12.7 + 7.7,  draw: t => drawMastil(t) },
  { d: 4.0 + 9.6,   draw: () => drawPupitre(4.0, 9.6, false) },
  { d: 5.1 + 10.2,  draw: () => drawPupitre(5.1, 10.2, true) },
  { d: 6.2 + 10.8,  draw: () => drawPupitre(6.2, 10.8, false) },
  { d: 12.1 + 9.05, draw: () => drawCol(12.1, 9.05) },
  { d: 13.0 + 9.05, draw: () => drawCol(13.0, 9.05) },
  { d: 13.9 + 9.05, draw: () => drawCol(13.9, 9.05) },
  { d: 12.3 + 9.67, draw: () => drawZanahoria(12.3, 9.67) },
  { d: 13.15 + 9.67, draw: () => drawZanahoria(13.15, 9.67) },
  { d: 14.0 + 9.67, draw: () => drawZanahoria(14.0, 9.67) },
  { d: 12.1 + 10.29, draw: () => drawCol(12.1, 10.29) },
  { d: 13.2 + 10.29, draw: () => drawZanahoria(13.2, 10.29) },
  { d: 14.1 + 10.29, draw: () => drawCol(14.1, 10.29) },
  { d: 14.35 + 8.75, draw: t => drawEspantapajaros(t) },
  { d: 11.6 + 10.85, draw: () => drawCerquita(11.65, 10.85, 14.75, 10.85) },
  { d: 14.85 + 9.7,  draw: () => drawCerquita(14.85, 8.65, 14.85, 10.75) },
  { d: 11.0 + 12.2,  draw: t => drawPozo(t) },
  { d: 2.9 + 11.5,  draw: t => drawArbol(2.9, 11.5, 1.25, 0.0, t) },
  { d: 15.7 + 4.9,  draw: t => drawPino(15.7, 4.9, 1.15, 1.7, t) },
  { d: 16.6 + 6.2,  draw: t => drawPino(16.6, 6.2, 0.8, 3.6, t) },
  { d: 16.6 + 11.2, draw: t => drawArbol(16.6, 11.2, 0.9, 3.1, t) },
  { d: 2.6 + 6.5,   draw: t => drawArbol(2.6, 6.5, 0.85, 4.2, t) },
  { d: 16.5 + 3.2,  draw: t => drawArbol(16.5, 3.2, 0.95, 2.3, t) },
  { d: 2.6 + 4.5,   draw: () => drawArbusto(2.6, 4.5, 1, true) },
  { d: 16.4 + 9.2,  draw: () => drawArbusto(16.4, 9.2, 1.1, false) },
  { d: 10.2 + 15.6, draw: () => drawArbusto(10.2, 15.6, 1, false) },
  { d: 9.9 + 15.8,  draw: () => drawArbusto(9.9, 15.8, 0.9, true) },
  { d: 2.6 + 13.6,  draw: () => drawArbusto(2.6, 13.6, 0.8, false) },
  { d: 12.5 + 15.8, draw: () => drawRoca(12.5, 15.8, 1.0) },
  { d: 3.3 + 3.5,   draw: () => drawRoca(3.3, 3.5, 0.9) },
  { d: 7.3 + 14.9,  draw: () => drawRoca(7.3, 14.9, 0.7) },
  { d: 11.1 + 14.9, draw: () => drawTocon(11.1, 14.9) },
  { d: 3.0 + 15.9,  draw: () => drawCerca(2.7, 15.1, 3.5, 16.7) },
  { d: 5.5 + 15.3,  draw: () => drawLetrero() }
];

/* ---------- bucle principal ---------- */
/* PANTALLAS CHICAS (2026-09-07, responsivo): en un celular el HUD ocupa una franja arriba (barra de
   recursos, título, Ideas) y otra abajo (consejera, dock, rincón), y el mundo se encuadra en la BANDA
   LIBRE entre las dos, medida del DOM, con un zoom mínimo más bajo que en escritorio (0,3) para que
   el diamante entero quepa a lo ancho. En escritorio nada cambia: el encuadre validado se conserva. */
function pantallaChica() { return W <= 640 || H <= 520; }
function reservaHud() { // cuánto HUD hay arriba y abajo, en px de pantalla
  const vis = id => { const el = $(id); return el && getComputedStyle(el).display !== 'none' ? el.getBoundingClientRect().bottom : 0; };
  const tit = document.querySelector('.title');
  const top = Math.max(vis('recursos'), vis('mats'), vis('ideas'), tit ? tit.getBoundingClientRect().bottom : 0);
  const ab = $('abajo').getBoundingClientRect();
  const abajo = Math.max(ab.height ? H - ab.top : 0, W <= 640 ? 150 : 56); // el suelo: aunque el dock aún esté vacío al arrancar, se reserva su sitio
  return { top: Math.min(Math.max(top, W <= 640 ? 150 : 56), H * 0.45), bottom: Math.min(abajo, H * 0.42) };
}
function fitZoom() {
  const span = (S && ordEra(S.era) >= 13) ? 20 : 16; // el mundo expandido necesita más aire
  if (!pantallaChica()) return Math.max(0.5, Math.min((W - 80) / (span * 70), (H - 230) / (span * 45)));
  const r = reservaHud(), libre = H - r.top - r.bottom;
  return Math.max(0.3, Math.min((W - 20) / (span * 66), (libre - 24) / (span * 34 + 90)));
}
function encuadrar() {
  zoom = fitZoom();
  ox = W / 2;
  let centro = H * 0.5;
  if (pantallaChica()) { const r = reservaHud(); centro = r.top + (H - r.top - r.bottom) / 2 + 24 * zoom; } // el centro de la banda libre, algo abajo: las estructuras se alzan
  oy = centro - (GRID * T2Y * zoom);
  renderTerrain();
}
function ajustarHudMovil() { // el alto real del borde inferior, para que la consejera y el panel se apoyen encima (CSS: --hud-abajo)
  const ab = $('abajo'); if (ab) document.documentElement.style.setProperty('--hud-abajo', ab.offsetHeight + 'px');
  const dv = $('dev'); if (dv) document.documentElement.style.setProperty('--dev-ancho', dv.offsetWidth + 'px'); // el rincón ×1 ×5 ⋯ crece al abrirse: la fila de Las Ideas termina antes y se desplaza (CSS: --dev-ancho)
}
if (window.ResizeObserver) { const ro = new ResizeObserver(ajustarHudMovil); ro.observe($('abajo')); if ($('dev')) ro.observe($('dev')); }
function resize() {
  DPR = window.devicePixelRatio || 1;
  W = window.innerWidth; H = window.innerHeight;
  cv.width = W * DPR; cv.height = H * DPR;
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  ajustarHudMovil();
  encuadrar();
}
window.addEventListener('resize', resize);
cv.addEventListener('contextmenu', e => e.preventDefault()); // el dedo largo sobre el mundo no abre el menú del navegador

/* ---------- la cámara: rueda para acercarse, arrastre para pasear ---------- */
function clampCam() {
  const spanPx = ((S && ordEra(S.era) >= 13) ? 20 : 16) * T2X * zoom;
  ox = Math.max(W / 2 - spanPx * 0.9, Math.min(W / 2 + spanPx * 0.9, ox));
  const cy = 20 * T2Y * zoom;
  oy = Math.max(H / 2 - cy - spanPx * 0.55, Math.min(H / 2 - cy + spanPx * 0.55, oy));
}
let nitidezT = null;
function programarNitidez() { clearTimeout(nitidezT); nitidezT = setTimeout(renderTerrain, 160); }
cv.addEventListener('wheel', e => {
  camTween = null; // el usuario toma el control: la guía suelta la cámara
  e.preventDefault();
  const nz = Math.max(fitZoom() * 0.7, Math.min(2.4, zoom * Math.exp(-e.deltaY * 0.0016)));
  const k = nz / zoom;
  ox = e.clientX - k * (e.clientX - ox); // zoom centrado en el cursor
  oy = e.clientY - k * (e.clientY - oy);
  zoom = nz;
  clampCam();
  programarNitidez();
}, { passive: false });
/* ---------- ENTRADA UNIFICADA (B6): ratón, dedo y lápiz por Pointer Events ----------
   Antes esto eran mouse*: el tap funcionaba por síntesis del navegador, pero no había paneo con el dedo
   ni pellizco para el zoom, así que la tablet solo podía mirar. La lógica del ratón se conserva íntegra
   (mismo umbral movAcum < 5 para distinguir clic de arrastre, mismo despacho de acciones); lo nuevo es
   la captura del puntero (el arrastre sigue vivo aunque salgas del lienzo) y la PINZA de dos dedos, que
   reutiliza la matemática del zoom de la rueda. OJO: nada de listeners mouse* en el lienzo, o el tap
   táctil despacharía dos veces (los navegadores sintetizan mousedown/up después de cada pointerdown/up). */
let arrastrando = false, arX = 0, arY = 0, movAcum = 0;
const punteros = new Map();   // las yemas activas: pointerId → {x, y}
let pinza = null;             // { d0, z0 }: la separación inicial de los dedos y el zoom en ese momento
cv.addEventListener('pointerdown', e => {
  punteros.set(e.pointerId, { x: e.clientX, y: e.clientY });
  try { cv.setPointerCapture(e.pointerId); } catch {} // sintéticos y punteros ya idos no capturan: da igual
  if (punteros.size === 2) { // llegó la segunda yema: empieza la pinza y ya nada de esto es un clic
    const [a, b] = [...punteros.values()];
    pinza = { d0: Math.hypot(a.x - b.x, a.y - b.y) || 1, z0: zoom };
    arrastrando = false; movAcum = 99;
    return;
  }
  if (punteros.size > 2) return; // una tercera yema no significa nada
  camTween = null; arrastrando = true; arX = e.clientX; arY = e.clientY; movAcum = 0;
  cv.style.cursor = 'grabbing'; hoverClave = null; // al arrastrar no hay halo
});
cv.addEventListener('pointermove', e => { // con la captura, sigue llegando aunque la yema salga del lienzo
  const p = punteros.get(e.pointerId);
  if (p) { p.x = e.clientX; p.y = e.clientY; }
  if (pinza && punteros.size >= 2) { // la pinza: zoom centrado entre los dedos, como la rueda en el cursor
    const [a, b] = [...punteros.values()];
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const nz = Math.max(fitZoom() * 0.7, Math.min(2.4, pinza.z0 * Math.hypot(a.x - b.x, a.y - b.y) / pinza.d0));
    const k = nz / zoom;
    ox = mx - k * (mx - ox); oy = my - k * (my - oy);
    zoom = nz; clampCam(); programarNitidez();
    return;
  }
  if (!arrastrando) {
    if (e.pointerType === 'mouse') { // el hover es cosa del cursor: el dedo no flota
      const hp = golpeaPersona(e.clientX, e.clientY);
      cv.style.cursor = hp ? 'pointer' : 'grab';
      hoverClave = hp && esAccion(hp.ficha) ? claveFicha(hp.ficha) : null; // GRAMÁTICA: halo solo sobre lo accionable
    }
    return;
  }
  movAcum += Math.abs(e.clientX - arX) + Math.abs(e.clientY - arY);
  ox += e.clientX - arX; oy += e.clientY - arY;
  arX = e.clientX; arY = e.clientY;
  clampCam();
});
cv.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hoverClave = null; }); // el cursor salió del mundo: apaga el halo
function soltarPuntero(e, esCancel) {
  punteros.delete(e.pointerId);
  if (pinza && punteros.size < 2) { // se abrió la pinza: la yema que quede retoma el paneo, sin salto
    pinza = null;
    const resto = [...punteros.values()][0];
    if (resto) { arrastrando = true; arX = resto.x; arY = resto.y; movAcum = 99; }
  }
  const dedo = e.pointerType !== 'mouse';
  if (!esCancel && arrastrando && movAcum < (dedo ? 12 : 5)) { // fue un clic (o un tap), no un arrastre: la yema tiembla más que el cursor
    if (dedo) fx.taps.push({ x: e.clientX, y: e.clientY, born: performance.now() }); // la onda del dedo
    const p = golpeaPersona(e.clientX, e.clientY, dedo);
    if (p) { if (p.ficha.k === 'colectible') recogerColectible(p.ficha.node); else if (p.ficha.k === 'fogata') { if (!S.fuegoDescubierto) frotarVaras(); else alimentarFuego(); } else if (p.ficha.k === 'campo' && cultivoActivo() && (S.cultivo || 0) >= 1) cosechar(); else if (p.ficha.k === 'conteo' && cuentasPendientes() > 0) tallarGrupo(); else if (p.ficha.k === 'sellar' && (S.fichasPend || 0) > 0) sellarFichas(5); else if (p.ficha.k === 'mesacopia' && (S.copiasPend || 0) > 0) corregirCopia(5); else if ((p.ficha.k === 'dictado' || p.ficha.k === 'dictado2' || /^dictx/.test(p.ficha.k)) && haySitioDictado()) hacerSitioDictado(); else if ((p.ficha.k === 'pescador' || /^diada\d/.test(p.ficha.k)) && haySitioEnLaOrilla()) hacerSitio(); else if (p.ficha.k === 'mamut' || /^caza\d/.test(p.ficha.k)) { if (cazaDisponible()) iniciarCaza(); else { sonidoFicha(p.ficha.k); mostrarFicha(p); } } else if (p.ficha.k === 'pensador' && p.ficha.id === 'abuela' && abuelaCapDisponible()) contarHistoria(); else if (p.ficha.k === 'pensador' && p.ficha.id === 'enheduanna' && himnoDisponible()) cantarHimno(); else if (/^azolve/.test(p.ficha.k)) destaparAzolve(+p.ficha.k.slice(6)); else if (p.ficha.k === 'patiolascas' && (S.ejerPend || 0) > 0) practicarEnPiedra(); else if (p.ficha.k === 'mesapapiro' && puedePasarPapiro()) pasarAlPapiro(); else if (/^linde/.test(p.ficha.k)) tenderCuerda(+p.ficha.k.slice(5)); else if (p.ficha.k === 'secreto') hallarSecreto(p.ficha.id, p.ficha.x, p.ficha.y); else if (p.ficha.k === 'banco' && puedeDecir()) decirRespuesta(); else if (p.ficha.k === 'agora' && puedePreguntar()) preguntarDuda(); else if (p.ficha.k === 'sofista' && puedeContratarSofista()) contratarSofista(); else if (p.ficha.k === 'muelle' && puedeCatalogar()) { if (!abrirCatalogo()) catalogar(AUTORES_AL[S.muelle[0].a].g); } else if (p.ficha.k === 'barca' && S.era === 5 && rollosAbierto()) abrirEleccionOriginales(); else if (p.ficha.k === 'vara' && sombraDisponible()) medirSombra(); else if (p.ficha.k === 'puertakufa' && puedeTraducir()) { if (!abrirTraducir()) traducir('sentido'); } else if (p.ficha.k === 'halqa' && ijazaDisponible()) darIjaza(); else if (p.ficha.k === 'cadi' && herenciaDisponible()) resolverHerencia(); else if (p.ficha.k === 'partera' && telpoAbierto() && nacidosPend()) { if (!abrirPromesa()) presentar('telpochcalli'); } else if (p.ficha.k === 'escuelaFu' && escuelaFu()) { if (!abrirPregunta()) ayudarATodosFu(); } else if (p.ficha.k === 'prefecturaCh' && prefecturaCh()) { if (!abrirExamen()) prepararCandidatos(); } else if (p.ficha.k === 'ludusRo' && ludusAbierto()) { if (!abrirEscuelas()) { const i = (S.alumnosRo || []).findIndex(a => a.p >= PASA_ENTERO && puedePasar(a)); if (i >= 0) pasarAlumno(i); } } else if (p.ficha.k === 'normal' && normalAbierta()) abrirMapa(); else if (p.ficha.k === 'imprenta' && prensaAbierta()) abrirComponer(); else if (p.ficha.k === 'campana' && campanaAbierta()) abrirHorario(); else if (p.ficha.k === 'universidad' && licenciaDisponible()) darLicencia(); else if (p.ficha.k === 'cuicacalli' && cantoDisponible()) cantar(); else if (p.ficha.k === 'anciano' && palabraDisponible()) decirPalabra(); else if (p.ficha.k === 'sofista' && S.sofista) despedirSofista(); else if (p.ficha.k === 'pensador' && estadoPensador(p.ficha.id) === 1 && VISITAS[p.ficha.id]) abrirVisita(p.ficha.id); else { sonidoFicha(p.ficha.k); mostrarFicha(p); } } else ocultarFicha();
  }
  if (punteros.size === 0) { arrastrando = false; cv.style.cursor = 'grab'; }
}
cv.addEventListener('pointerup', e => soltarPuntero(e, false));
cv.addEventListener('pointercancel', e => soltarPuntero(e, true)); // el sistema robó el gesto: nunca despachar el clic
/* El doble clic sobre el mundo NO reencuadra. Echar leña dos veces seguidas, o cosechar con prisa, es
   un gesto normal del juego: contarlo como "doble clic" te movía la cámara de golpe y te perdías justo
   cuando estabas atendiendo algo. Para volver al encuadre está el botón ⌂, que además lo explica. */
function flashChip(id) { // el chip del dock saluda: "la decisión está aquí"
  const c = $(id); if (!c || c.style.display === 'none') return;
  c.classList.remove('guia-flash'); void c.offsetWidth; c.classList.add('guia-flash');
  setTimeout(() => c.classList.remove('guia-flash'), 2700);
}
function viajarA(gg) { // la cámara viaja hasta una guía {x,y,chip}
  if (!gg) return;
  if (gg.chip) flashChip(gg.chip);
  if (typeof gg.abre === 'function' && gg.abre()) return;   // la consejera que señala un gesto con su modal (los candidatos de Kaifeng) lo abre
  if (gg.x != null) {
    const x1 = W / 2 - (gg.x - gg.y) * T2X * zoom;
    const y1 = H * 0.44 - (gg.x + gg.y) * T2Y * zoom;
    camTween = { t0: performance.now(), x0: ox, y0: oy, x1, y1, gx: gg.x, gy: gg.y };
  }
}
function irAGuia() { viajarA(guiaProg); } // clic en la línea de progreso
$('progreso').addEventListener('click', irAGuia);
$('progreso').title = 'clic: te llevo a donde está la acción';
$('consejo').addEventListener('click', () => viajarA(consejoG));

/* ---------- info de los indicadores de arriba (clic para saber qué son) ---------- */
/* Cada material dice DÓNDE sale, porque saber dónde buscar es la mitad del oficio: el clan no recorre la
   estepa entera, va al sitio donde eso se da. Si estos textos cambian, que sigan a `QUERENCIA`. */
const INFO_MAT = {
  lena:  { t: '🪵 Leña seca', d: 'Alimenta la fogata: cuando la brasa baje, toca el fuego para echarle un leño. Se junta <b>donde hay madera muerta</b>: los troncos caídos y el árbol seco. El clan también trae la suya.' },
  fibra: { t: '🪢 Fibra trenzada', d: 'Se necesita para <b>crear el tambor</b> (y en la aldea, la siembra y el telar). Sale <b>donde trabajan las recolectoras</b>: ellas ya saben qué tallo sirve.' },
  ocre:  { t: '🟤 Ocre', d: 'Tierra de color: se necesita para <b>crear las pinturas rupestres</b> (y la cerámica de la aldea). Se saca <b>al pie del peñón</b>, donde la roca tiñe.' },
  hueso: { t: '🦴 Hueso', d: 'Se talla con muescas para <b>crear el conteo</b>, y en anzuelo para <b>la pesca</b>. Se recoge <b>donde están los animales</b>: el paso de la manada, y el corral cuando llega la aldea. La caza del mamut trae de sobra.' },
  silex: { t: '🪨 Sílex', d: 'La piedra que corta: se necesita para <b>crear la cacería</b>. Se busca <b>en la orilla del agua</b>, que es donde el cauce la deja limpia.' },
  grano: { t: '🌾 Grano', d: 'Se cosecha tocando el <b>campo dorado</b>. Con él se crea el corral, y el granero lo guarda de sobra.' },
  barro: { t: '🟫 Barro del río', d: 'La materia de la memoria: se necesita para <b>crear la tablilla</b>, y de él se amasa todo lo que la edubba escribe. Se saca <b>de la ribera, donde amarra la barca</b>: el río lo deja limpio.' }
};
function infoRec(k) {
  const L = LEX(), fog = ordEra(S.era) < 11;
  // lo que cada época reúne y quién aprende (G7 del QA general: en Sumer y Egipto los popups seguían hablando del clan)
  const DE = { 2: { pre: [`${monIco()} Recursos de la edubba`, 'Grano, barro y ofrendas: lo que el templo y la ciudad le dan a la edubba con el tiempo. Sirven para <b>crear</b> cada saber nuevo del dock.'], rep: '(las ofrendas del templo y las cuentas selladas)' },
               3: { pre: [`${monIco()} Recursos de la Casa de la Vida`, 'El tributo del valle, que la crecida del Nilo paga doble. Sirven para <b>crear</b> cada saber nuevo del dock.'], rep: '(el tributo del valle y lo que paga la crecida)' },
               4: { pre: [`${monIco()} Recursos del ágora`, 'Lo que pagan las familias por la enseñanza de sus hijos y lo que deja la cosecha de la oliva. Sirven para <b>crear</b> cada saber nuevo del dock.'], rep: '(las familias, la oliva y el renombre de los maestros)' },
               5: { pre: [`${monIco()} Recursos de la Biblioteca`, 'Lo que paga el rey y lo que dejan los barcos y el fondo catalogado. Sirven para <b>crear</b> cada saber nuevo del dock.'], rep: '(el rey, los barcos y el fondo)' },
               6: { pre: [`${monIco()} Recursos de la Casa de la Sabiduría`, 'El impuesto de la tierra del Sawad, la renta de los libreros que copian lo traducido y las herencias del cadí. Sirven para <b>crear</b> cada saber nuevo del dock.'], rep: '(el Sawad, los libreros y el cadí)' },
               7: { pre: [`${monIco()} Recursos del calpulli`, 'El tributo que llega en canoas y el trabajo común de los jóvenes del telpochcalli, el tequio. Sirven para <b>crear</b> cada saber nuevo del dock.'], rep: '(el tributo de las canoas y el tequio)' },
               8: { pre: [`${monIco()} Recursos de las escuelas`, 'Las rentas de la abadía, lo que pagan los estudiantes por oír las disputas y lo que alquilan los estacionarios de los libros copiados. Sirven para <b>crear</b> cada saber nuevo del dock.'], rep: '(la abadía, las disputas y los estacionarios)' },
               9: { pre: [`${monIco()} Recursos de las imprentas`, 'Lo que se vende de cada tirada de la prensa, lo que pagan los libreros y lo que la ciudad pone para sus escuelas. Sirven para <b>crear</b> cada saber nuevo del dock.'], rep: '(las tiradas, los libreros y la ciudad)' },
               14: { pre: [`${monIco()} Recursos de las escuelas`, 'Lo que los padres le pagan al maestro en los idus, por cada alumno; lo que pagan los clientes de los oradores; el minerval de la primavera y el erario de la ciudad. Sirven para <b>crear</b> cada saber nuevo del dock.'], rep: '(los padres, los oradores y el erario)' },
               15: { pre: [`${monIco()} Recursos de las escuelas`, 'La renta de las tierras de la escuela, que la prefectura cobra cada estación, y lo que dejan los mercados de la ciudad. Sirven para <b>crear</b> cada saber nuevo del dock.'], rep: '(las tierras de la escuela y los mercados)' },
               10: { pre: [`${monIco()} Recursos de las escuelas`, 'Lo que pagan el Estado y los vecinos, y lo que pone cada pueblo por su escuela. Sirven para <b>crear</b> cada saber nuevo del dock.'], rep: '(el Estado, los vecinos y los pueblos)' } }[S.era];
  const quien = DE ? L.casa : 'el clan';
  if (INFO_BOTONES[k]) return INFO_BOTONES[k];
  if (k.startsWith('m-')) return INFO_MAT[k.slice(2)] || null;
  // El popup del Saber decía TODO (la pedagogía completa, los gastos, las flechas): un ensayo en 270 px.
  // Un popup responde una pregunta; la historia completa vive en las fichas de la escena del aprendiz.
  if (k === 'r-apr' && fog && S.era > 1) return { t: '📖 Saber', d: `Lo que ${L.casa} aprende: sube solo (<b>/s</b> es la velocidad). Se gasta en <b>crear</b> saberes, en <b>${L.formar.toLowerCase()}</b>, en perfeccionar, en ${L.te.replace(/^[^\p{L}]+/u, '').toLowerCase()} y en dejar pasar la época. Ya no tiene tope: <b>la escritura guarda lo que la memoria olvidaba</b>.` };
  if (k === 'r-apr') return fog
    ? { t: '📖 Saber del clan', d: 'Sube solo: <b>nadie necesita dar clase para que el clan aprenda</b>. Los pequeños miran, juegan y arriman el hombro; tu trabajo no es fabricar el aprendizaje, es <b>darle forma</b>.'
        + fuenteHtml({ cita: 'Lew-Levy et al., 2017', rev: 'Human Nature 28(4)', doi: '10.1007/s12110-017-9302-2' })
        + `Se gasta en <b>encender</b> y <b>profundizar</b> saberes, y en las <b>Hierbas</b>. Pero la memoria del clan tiene un tope: guarda hasta <b>${fmt(memoriaTope())} 📖</b> (unos dos minutos de lo que aprende), y sin escritura <b>lo que no se usa se olvida</b>. Cuando esté llena y nazca el signo, los Milenios esperan. La flecha compara con el ritmo estable: <b class="delta-bien">▲</b> impulso pasajero de novedad · <b class="delta-mal">▼</b> algo junta polvo.` }
    : { t: '📖 Aprendizaje', d: 'Lo que el aula acumula: sube solo (<b>/s</b> es la velocidad) y se gasta en <b>formación docente</b>, el <b>té</b> e <b>investigar</b> la época siguiente. La flecha compara con el ritmo estable: <b class="delta-bien">▲</b> impulso pasajero de novedad · <b class="delta-mal">▼</b> algo junta polvo.' };
  if (k === 'r-pre' && DE) return { t: DE.pre[0], d: DE.pre[1] };
  if (k === 'r-pre') return fog
    ? { t: `${monIco()} Recursos del clan`, d: 'Piedras, pieles y ofrendas que el clan reúne con el tiempo. Sirven para <b>crear</b> cada saber nuevo del dock.' }
    : { t: `${monIco()} Presupuesto`, d: 'El presupuesto del aula (subvenciones de fin de trimestre y kermés). Sirve para <b>comprar</b> cada aparato del dock.' };
  if (k === 'r-rep') return { t: '⭐ Renombre', d: `El prestigio de tu labor: <b>${S.rep}</b> ${fog ? '⭐' : 'estrellas'}. Cuanto más alto, más <b>${fog ? 'recursos' : 'presupuesto'}</b> reúne ${quien} con el tiempo ${DE ? DE.rep : '(la cosecha, la caza, las ofrendas)'}. Los aprendices, en cambio, llegan de golpe: <b>+2 con cada hito</b> de saber que alcanzas.` };
  if (k === 'x-guias') return { t: `👥 ${L.docente}s al completo`, d: `Tus ${L.docente.toLowerCase()}s sostienen <b>${plazasGuias()} plazas</b>${S.era === 1 ? ' (la Mayor, 7; cada guía, según cómo enseña: 9 a muchos, 5 de cerca)' : ''}${S.abuela === 2 ? ', y la Abuela acompaña a 4 más' : ''}. Ya tienes el máximo de esta época (<b>${maxDocentes()}</b>); podrás sumar más cuando el mundo crezca.` };
  if (k === 'x-guia-falta' || k === 'x-guia') { // QUÉ hace, CUÁNTO cuesta y CUÁNTO te está costando no tenerla
    const cap = BALANCE.ratioDocente, c = costoDocente(), plazas = plazasGuias() + (S.abuela === 2 ? 4 : 0);
    const sueltos = Math.max(0, S.alumnos - alumnosBien()), orilla = S.era === 1 && typeof diadas === 'function' ? diadas() : 0;   // como el HUD: las díadas de la orilla también atienden
    const ahora = ganaAlumnos(S.docentes), conUnaMas = ganaAlumnos(S.docentes + 1);
    const sube = ahora > 0 ? Math.round(100 * (conUnaMas / ahora - 1)) : 0;
    return { t: `👩‍🏫 ¿Para qué más ${L.docente.toLowerCase()}s?`, d:
      `Cada ${L.docente.toLowerCase()} <b>sostiene un círculo de ${cap} aprendices</b>${S.era === 1 ? ' (y al contratarla eliges: 9 a muchos o 5 de cerca)' : ''}${S.abuela === 2 ? ' y la Abuela acompaña a 4 más' : ''}. Tienes <b>${S.docentes}</b> ` +
      `(${plazas} plazas${orilla ? ` y ${orilla} en la orilla` : ''}) para <b>${S.alumnos} aprendices</b>` +
      (sueltos
        ? `: <b>${sueltos} aprenden a medias</b> y rinden ${rendimientoSueltos()}. Sumar ${otroDocente()} ${L.docente.toLowerCase()} subiría el aprendizaje un <b class="delta-bien">+${sube}%</b>.`
        : `, y por ahora alcanzan: ${otroDocente()} más no aceleraría nada hasta que lleguen nuevos aprendices.`) +
      (S.pre < c
        ? `<br><br>Cuesta <b>${fmt(c)} ${monIco()}</b> y te faltan <b>${fmt(c - S.pre)} ${monIco()}</b>.`
        : `<br><br>Cuesta <b>${fmt(c)} ${monIco()}</b>, y ya los tienes.`) };
  }
  if (k === 'x-te-falta' || k === 'x-te') { // el ánimo multiplica: se dice con el número, no con adjetivos
    const m0 = multAnimo(), m1 = 0.5 + Math.min(animoMax(), S.animo + BALANCE.te.bono) / 200;
    const sube = Math.round(100 * (m1 / m0 - 1));
    const base = `El ánimo <b>multiplica</b> todo lo que se aprende: ahora va <b>×${m0.toFixed(2)}</b> ` +
      `(<b>${Math.round(S.animo)}</b> de un techo de <b>${animoMax()}</b>).`;
    if (S.animo >= animoMax()) return { t: `${L.te}`, d:
      `${base}<br><br>Está <b>al tope</b>: tomar ${L.te.toLowerCase()} no subiría nada, así que no te cobro los ${BALANCE.te.costo} 📖. ` +
      `Sirve cuando el ánimo cae, y cae cuando un saber <b>junta polvo</b>.` };
    if (animoMax() - S.animo < BALANCE.te.bono * 0.5) return { t: `${L.te}`, d:
      `${base}<br><br>Queda <b>casi lleno</b>: cabrían apenas <b>${Math.round(animoMax() - S.animo)}</b> de ánimo, así que los ` +
      `${BALANCE.te.costo} 📖 rendirían poco. Por eso el chip está en voz baja; se enciende solo cuando el ánimo cae de verdad.` };
    if (S.teCd > 0) return { t: `${L.te}`, d:
      `${base}<br><br>Subiría <b class="delta-bien">+${sube}%</b> el aprendizaje, pero hay que dejar reposar: vuelve en <b>${Math.ceil(S.teCd)} s</b>.` };
    return { t: `${L.te}`, d:
      `${base}<br><br>Tomar ${L.te.toLowerCase()} sube <b>+${BALANCE.te.bono}</b> de ánimo, o sea <b class="delta-bien">+${sube}%</b> de aprendizaje. ` +
      (S.apr < BALANCE.te.costo
        ? `Cuesta <b>${BALANCE.te.costo} 📖</b> y te faltan <b>${fmt(BALANCE.te.costo - S.apr)} 📖</b>.`
        : `Cuesta <b>${BALANCE.te.costo} 📖</b>.`) };
  }
  if (k === 'r-alu') { // no basta con decir "a medias": hay que decir cuánto cuesta
    const cap = BALANCE.ratioDocente, sueltos = Math.max(0, S.alumnos - (plazasGuias() + (S.abuela === 2 ? 4 : 0)));
    const pierde = sueltos ? Math.round(100 * (1 - ganaAlumnos(S.docentes) / S.alumnos)) : 0;
    return { t: fog ? (DE ? `🧒 Aprendices de ${L.casa}` : '🧒 Aprendices del clan') : '🧒 Estudiantes', d:
      `Los que aprenden. Cuantos más, más rápido crece el saber… siempre que haya <b>${L.docente.toLowerCase()}s</b> para atenderlos: cada ${L.docente.toLowerCase()} sostiene <b>${cap}</b>${S.abuela === 2 ? (S.era === 1 ? ' (y la Abuela acompaña a 4 más)' : ' (y la memoria de la Abuela acompaña a 4 más)') : ''}.` +
      (sueltos
        ? `<br><br>Ahora <b>${sueltos} aprenden a medias</b> (rinden ${rendimientoSueltos()}): ${quien} avanza un <b class="delta-mal">${pierde}% más lento</b> de lo que podría.`
        : `<br><br>Ahora mismo <b>todos están atendidos</b>: rinden al completo.`) };
  }
  if (k === 'r-ani') return { t: (fog ? '🌿' : '☕') + ' Ánimo', d:
    `El humor del grupo: <b>${Math.round(S.animo)}</b> de un techo de <b>${animoMax()}</b>, y eso <b>multiplica</b> lo que se aprende: ahora <b>×${multAnimo().toFixed(2).replace('.', ',')}</b> (de ×0,70 en el suelo a ×${(0.5 + animoMax() / 200).toFixed(2).replace('.', ',')} en el tope de hoy).` +
    ` Baja cuando un saber <b>junta polvo</b> y sube sola con el tiempo; tomar <b>${L.te.toLowerCase()}</b> la empuja de golpe.` +
    ` El techo crece con quienes cuidan al grupo (los ancestros de la Abuela, la escucha de Ptahhotep).` };
  return null;
}
/* Los botones del rincón se explican con el MISMO glosario del juego, no con el title del navegador:
   el title tarda en salir, en táctil no existe, y nadie lo descubría. En escritorio, pasar el cursor
   muestra el popup de vidrio; en táctil, el primer tap ejecuta Y explica (el navegador sintetiza el
   mouseenter), así que el botón se entiende justo al usarlo. */
const INFO_BOTONES = {
  'b-home': { t: '⌂ Volver al encuadre', d: 'Centra el mundo entero en la pantalla. Úsalo si te perdiste paneando o con el zoom.' },
  'b-mute': { t: '🔊 Sonido', d: 'Silencia o devuelve los sonidos del mundo: el crepitar del fuego, la cacería, las historias de la Abuela.' },
  'warp-1': { t: '×1 · Ritmo normal', d: 'El tiempo del clan corre como el tuyo.' },
  'warp-5': { t: '×5 · Cinco veces más rápido', d: 'Todo se acelera: la economía, el día y la noche, el año y la gente. Para ver crecer lo que tarda.' },
  'b-exportar': { t: '💾 Llevarte la partida', d: 'Descarga un archivo con todo tu progreso: sirve de respaldo, o para seguir jugando en otra máquina u otro navegador.' },
  'b-importar': { t: '📥 Traer una partida', d: 'Abre un archivo guardado con 💾 y continúa donde ibas. La partida que hubiera aquí queda respaldada, por si acaso.' },
  'b-reset': { t: '↺ Empezar de cero', d: 'Borra la partida y vuelve a la penumbra del primer día. Pide confirmación: hay que pulsarlo dos veces seguidas.' }
};
function programarDespedidaHudinfo(ms) {
  const el = $('hudinfo');
  clearTimeout(hudinfoTimer);
  hudinfoTimer = setTimeout(() => {
    el.style.opacity = '0';
    hudinfoTimer = setTimeout(() => { el.style.display = 'none'; el.style.opacity = '1'; }, 600);
  }, ms);
}
function mostrarHudInfo(k, recEl) {
  if (hayModal()) return; // con un modal arriba, el glosario no resucita por hover
  const info = infoRec(k); const el = $('hudinfo');
  if (!info) { el.style.display = 'none'; return; }
  el.__html = `<h4>${info.t}</h4><div>${info.d}</div>`;
  el.innerHTML = el.__html;
  el.style.display = 'block'; el.style.opacity = '1'; el.dataset.k = k;
  programarDespedidaHudinfo(7000); // a los 7 s sin nueva interacción, se despide con suavidad
  const r = recEl.getBoundingClientRect(), w = el.offsetWidth;
  el.style.left = Math.max(8, Math.min(r.left + r.width / 2 - w / 2, window.innerWidth - w - 8)) + 'px';
  let topP = r.bottom + 10;
  // desde el dock o los controles, hacia arriba de TODO el bloque de abajo: en el celular se abre al tocar (a propósito)
  // y, debajo del botón, tapaba los chips del dock varios segundos (QA 2026-09-28)
  if (topP + el.offsetHeight > window.innerHeight - 8 || recEl.closest('#abajo')) topP = Math.min(r.top, $('abajo').getBoundingClientRect().top) - el.offsetHeight - 10;
  el.style.top = topP + 'px';
}
$('recursos').addEventListener('click', e => {
  const rec = e.target.closest('.rec'); if (!rec) return;
  const b = rec.querySelector('b'); if (!b) return;
  const el = $('hudinfo');
  if (el.style.display === 'block' && el.dataset.k === b.id) { el.style.display = 'none'; return; }
  mostrarHudInfo(b.id, rec);
});
$('mats').addEventListener('click', e => {
  const sp = e.target.closest('span[data-mat]'); if (!sp) return;
  const el = $('hudinfo'), key = 'm-' + sp.dataset.mat;
  if (el.style.display === 'block' && el.dataset.k === key) { el.style.display = 'none'; return; }
  mostrarHudInfo(key, sp);
});
// el hover también explica: descubrir no debería exigir un clic
$('mats').addEventListener('mouseover', e => {
  const sp = e.target.closest('span[data-mat]');
  if (sp) mostrarHudInfo('m-' + sp.dataset.mat, sp);
});
$('recursos').addEventListener('mouseover', e => {
  const rec = e.target.closest('.rec'), b = rec && rec.querySelector('b');
  if (b) mostrarHudInfo(b.id, rec);
});

// el popup se queda mientras lo lees: con el cursor encima no se despide (para poder tocar el enlace
// de la fuente); al salir, se despide más pronto de lo normal
$('hudinfo').addEventListener('mouseenter', () => { clearTimeout(hudinfoTimer); $('hudinfo').style.opacity = '1'; });
$('hudinfo').addEventListener('mouseleave', () => programarDespedidaHudinfo(1500));

// Los números del glosario están VIVOS (el ánimo sube mientras lees, los costos cambian): el popup
// abierto se refresca cada medio segundo, o miente a los segundos de abrirse (se vio «40 de un techo
// de 110» con el HUD ya en 88). Solo se reescribe si el texto de verdad cambió, para no sacudir un
// enlace bajo el cursor.
setInterval(() => {
  const el = $('hudinfo');
  if (el.style.display !== 'block' || !el.dataset.k) return;
  const info = infoRec(el.dataset.k); if (!info) return;
  const html = `<h4>${info.t}</h4><div>${info.d}</div>`;
  if (el.__html !== html) { el.innerHTML = html; el.__html = html; }
}, 500);

// Escape cierra lo que flota: la ficha del mundo, el panel del dock y el glosario. Los modales de
// verdad (victoria, visitas) no: esos tienen su propio botón y cerrarlos sin leer sería perderlos.
window.addEventListener('keydown', e => {
  if (e.key !== 'Escape' || hayModal()) return;
  ocultarFicha();
  $('hudinfo').style.display = 'none';
  if (panelActivo) togglePanel(panelActivo); // el mismo sel = cerrar
});

// cada botón del rincón se presenta al pasar por encima (y al tocarlo, en táctil)
document.querySelectorAll('#dev button').forEach(b => {
  const k = b.dataset.warp ? 'warp-' + b.dataset.warp : b.id;
  if (!INFO_BOTONES[k]) return;
  b.removeAttribute('title'); // el tooltip nativo doblaría al glosario
  b.addEventListener('mouseenter', () => mostrarHudInfo(k, b));
  b.addEventListener('mouseleave', () => programarDespedidaHudinfo(900));
});

document.addEventListener('click', e => {
  if (!e.target || !e.target.closest) return; // un clic sintético puede traer target sin closest: no es motivo de error
  if (!e.target.closest('#recursos') && !e.target.closest('#mats') && !e.target.closest('#hudinfo') && !e.target.closest('#dev') && !e.target.closest('#chip-doc') && !e.target.closest('#chip-te')) $('hudinfo').style.display = 'none';
});

