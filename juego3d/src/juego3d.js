/* ============================================================
   juego3d
   El puente: el juego 2D sigue siendo el juego (economía, reglas, HUD, dock, consejera, fichas,
   guardado, sonido), y este módulo reemplaza SOLO el dibujo del mundo. La cámara 3D copia la del 2D
   (ox, oy, zoom): con la misma proyección 2:1, cada `P(x, y, z)` del 2D cae en el mismo píxel que el
   punto 3D equivalente, así que el paneo, la pinza, los viajes de la consejera, los toques y todo el
   pase de overlay del 2D (anillos, rótulos, globos, chispas) funcionan sin tocarlos.
   ============================================================ */
import * as THREE from 'three';
import { crearKit } from './kit.js';
import { crearMundo3D } from './mundo3d.js';
import { luzDelDia } from './cielo.js';
import { crearUI3D } from './ui3d.js';
import { crearFrontera } from './frontera.js';
import { cargarJeroglificos } from './egipto/monumentos.js';

// Los scripts del motor (../juego/src) ya corrieron: los módulos se ejecutan después de los scripts clásicos.

/* LIVIANO: en celulares y tabletas (dedo, o pantalla chica) el fuego no proyecta sombras, el mapa de sombras
   del sol es menor, la densidad de píxeles se topa en 1,5 y las curvas llevan un tercio menos de caras (medido
   con ?perf=1: la aldea bajaba de ~530 k triángulos). Se puede forzar con ?liviano=1 o ?pesado=1. */
const qs = new URLSearchParams(location.search);
const LIVIANO = qs.has('liviano') || (!qs.has('pesado') && (matchMedia('(pointer: coarse)').matches || Math.min(innerWidth, innerHeight) < 600));
const K = crearKit('tinta', { detalle: LIVIANO ? 0.65 : 1 });
const lienzo3d = document.getElementById('mundo3d');
const renderer = new THREE.WebGLRenderer({ canvas: lienzo3d, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LIVIANO ? 1.5 : 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.setClearColor(0x000000, 0);

const escena = new THREE.Scene();
const fuenteEgipto = cargarJeroglificos('');          // los jeroglíficos de Egipto se pintan con su fuente (270 KB): se pide al arrancar y
if (S.era === 3 || /momento=(egipto|casa)/.test(location.search)) await fuenteEgipto;   // solo se espera si Egipto se arma ya (al cruzar desde Sumer, hace rato que llegó)
const vivo = crearMundo3D(K, { liviano: LIVIANO }); escena.add(vivo.raiz);   // el motor + la época en curso (epocas/)
/* dónde puede nacer una luz (2026-10-01, con Atenas): el motor sortea su sitio y el 3D le dice si ahí hay suelo libre,
   el mismo mapa por donde camina la gente (sin casas, muros ni monumentos encima) */
LUMBRE.libre = (x, y) => { const m = vivo.motor; return !m || !m.caminos || m.caminos.libre(x, y); };
const hemi = new THREE.HemisphereLight(), sol = new THREE.DirectionalLight(); sol.castShadow = true;
sol.shadow.mapSize.set(LIVIANO ? 1024 : 2048, LIVIANO ? 1024 : 2048); Object.assign(sol.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 80 });
sol.shadow.bias = -0.0006; sol.shadow.normalBias = 0.03; sol.target.position.set(10, 0, 10);
escena.add(hemi, sol, sol.target);

/* ---------- la cámara: la del 2D, traducida ---------- */
const DIR = new THREE.Vector3(Math.cos(Math.PI / 6) * Math.SQRT1_2, 0.5, Math.cos(Math.PI / 6) * Math.SQRT1_2);
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -200, 200);
function sincronizarCamara() {
  const s = 32 * Math.SQRT2 * zoom;                  // px por unidad: 32·zoom en x por cada paso de (x − y), como P()
  const a = (W / 2 - ox) / (32 * zoom), b = (H / 2 - oy) / (16 * zoom);   // el punto del suelo en el centro de la pantalla
  const cx = (a + b) / 2, cz = (b - a) / 2;
  Object.assign(cam, { left: -W / 2 / s, right: W / 2 / s, top: H / 2 / s, bottom: -H / 2 / s });
  cam.position.set(cx, 0, cz).addScaledVector(DIR, 60); cam.lookAt(cx, 0, cz);
  cam.updateProjectionMatrix();
}
function ajustarLienzo() { renderer.setSize(window.innerWidth, window.innerHeight, false); pintarEstrellas(); }
addEventListener('resize', ajustarLienzo);

/* ---------- la luz: el ciclo continuo de cielo.js (ocho momentos, el sol en su arco, la luna que entra) ---------- */
const luna = new THREE.DirectionalLight('#a8bbff', 0); luna.position.set(10 - 10, 24, 10 + 20); luna.target.position.set(10, 0, 10);
escena.add(luna, luna.target);
let cieloPuesto = '';
function iluminar(fase, penumbra) {
  const L = luzDelDia(fase, penumbra);
  hemi.color.set(L.hemi[0]); hemi.groundColor.set(L.hemi[1]); hemi.intensity = L.hemi[2] * 0.75;
  sol.color.set(L.sol.color); sol.intensity = L.sol.int * 1.2; sol.visible = sol.intensity > 0.01;
  sol.position.set(10, 0, 10).addScaledVector(L.sol.dir, 30);
  luna.intensity = 0.55 * 1.2 * L.luna;
  if (vivo.nubes) vivo.nubes.mat.color.set(L.nube);
  const cielo = L.cielo.join();
  if (cielo !== cieloPuesto) {                       // el cielo es CSS: solo se toca cuando cambia
    cieloPuesto = cielo;
    document.documentElement.style.setProperty('--cielo-a', L.cielo[0]);
    document.documentElement.style.setProperty('--cielo-b', L.cielo[1]);
  }
  document.getElementById('estrellas').style.opacity = L.estrellas.toFixed(3);
  return L;
}
/* LOS MILENIOS QUE PASAN (frontera.js): el cielo da n vueltas de día completas en ms y vuelve a la hora de la
   partida, sin salto (las vueltas son enteras y la curva arranca y frena suave). Solo se ve: el reloj no se toca. */
let vueltas = null;
function pasarDias(n, ms, alTerminar, alAvanzar) { vueltas = { n, ms, t0: performance.now(), alTerminar, alAvanzar }; }
function faseExtra() {
  if (!vueltas) return 0;
  const k = (performance.now() - vueltas.t0) / vueltas.ms;
  if (vueltas.alAvanzar) vueltas.alAvanzar(Math.min(1, k));
  if (k >= 1) { const f = vueltas.alTerminar; vueltas = null; if (f) f(); return 0; }
  return MOV_REDUCIDO ? 0 : vueltas.n * k * k * (3 - 2 * k);   // con movimiento reducido el cielo no gira: pasan los años, no las vueltas
}
function pintarEstrellas() {
  const c = document.getElementById('estrellas'), d = Math.min(window.devicePixelRatio || 1, 2);
  c.width = innerWidth * d; c.height = innerHeight * d;
  const gg = c.getContext('2d'); let sem = 7; const r = () => (sem = (sem * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 160; i++) { gg.fillStyle = `rgba(255,250,235,${0.3 + r() * 0.6})`; gg.beginPath(); gg.arc(r() * c.width, r() * c.height * 0.75, (0.5 + r() * 1.2) * d, 0, 7); gg.fill(); }
  gg.fillStyle = '#f2ecd0'; gg.beginPath(); gg.arc(c.width * 0.2, c.height * 0.22, 15 * d, 0, 7); gg.fill();   // la luna, lejos del HUD
}
ajustarLienzo();

/* LA INTERFAZ: la del motor con cuatro cambios (ui3d.js). ?ui=2d la deja idéntica a la del 2D, para comparar. */
const ui = crearUI3D({ K, escena, cam, vivo, activa: qs.get('ui') !== '2d' });
/* LA FRONTERA: hasta dónde llega el 3D (el cruce a una época sin mundo 3D se ve pasar y llega su tarjeta) */
const frontera = crearFrontera({ pasarDias });

/* ---------- el cuadro: el paso del motor (avanzarCuadro, igual que el 2D) y el mundo 3D ---------- */
LUMBRE.dibujar = function (now) {
  const { t, dtAnim } = avanzarCuadro(now);   // relojes, cámara y las luces que nacen, para cualquier época
  spawnFx(t, tasa());
  ambientes(t);

  GENTE_CLIC.length = 0;
  g.clearRect(0, 0, W, H);
  const { luz } = vivo.sincronizar(t, dtAnim * Math.min(warp, 6));
  const extra = faseExtra();   // siempre: es lo que termina el viaje de un cruce (reiniciar a mitad de uno dejaba el velo pegado)
  iluminar(S.fuegoDescubierto ? tJuegoVis / 150 + extra : 0, !S.fuegoDescubierto);   // la misma vuelta de 150 s que luzDia() del 2D
  sincronizarCamara();
  if (ui) ui.cuadro(t);
  renderer.render(escena, cam);
  if (fichaActiva) { // la tarjeta sigue a su personaje
    const pf = GENTE_CLIC.find(q => claveFicha(q.ficha) === fichaActiva);
    if (pf) posicionarFicha(pf.x, pf.y); else ocultarFicha();
  }
  // el pase de overlay del 2D, tal cual: brilla sobre el mundo 3D (los rótulos de acción y la barra de la
  // caza, si la interfaz 3D está activa, son chips de vidrio que se tocan: ui3d.js)
  drawLibros(t);
  vivo.superponer(t);
  drawSenalNodos(t);
  drawChispasFuego();
  drawAnillos();
  drawSenalConsejo(t);
  if (!ui) { drawCazaOverlay(t); drawConvites(t); }
  drawTaps();
  drawHoverHalo(t);
  drawPops();
};
/* LOS MOMENTOS DEL LABORATORIO (?lab=1&momento=…&hora=…): mirar un estado de la época sin jugarla entera.
   Como todo el modo laboratorio, jamás tocan la partida real. */
if (MODO_LAB && qs.get('momento')) {
  const paleo = () => { const S2 = estadoInicial(); S2.fuegoDescubierto = true; S2.fuego = 90; S2.alumnos = 10; S2.docentes = 2; S2.abuela = 1;
    for (const i of [10, 11, 12, 13, 15, 28]) { S2.tecs[i].fase = 'meseta'; S2.tecs[i].nivel = 3; }
    S2.vioMats = S2.vioConteo = S2.vioOrilla = S2.vioChispa = true; return S2; };
  const MOMENTOS = {
    fuego: () => { const S2 = estadoInicial(); S2.fuegoDescubierto = true; S2.fuego = 80; return S2; },
    paleo,
    aldea: () => { const S2 = arranqueSumer(); S2.era = 1; return S2; },
    sumer: () => { const S2 = arranqueSumer(); S2.era = 2; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 0; return S2; },   // la llegada a Sumer
    edubba: () => { const S2 = arranqueEgipto(); S2.era = 2; return S2; },                                                // Sumer completa
    egipto: () => { const S2 = arranqueEgipto(); S2.era = 3; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 0; return S2; },   // la llegada a Egipto
    casa: () => { const S2 = arranqueAgora(); S2.era = 3; S2.hitosEra = 5; S2.lindes = [0, 2]; S2.ejerPend = 3; S2.ptahhotep = 2; S2.vioGracias = true; return S2; },   // el final ya se vio: si no, sale solo (E5)   // Egipto completa
    agora: () => { const S2 = arranqueAgora(); S2.era = 4; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 0; return S2; },     // la llegada a Atenas
    academia: () => { const S2 = arranqueAgora(); S2.era = 4; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 5;           // Atenas completa: los seis saberes, Sócrates, el sofista contratado, dos dudas y una aporía en camino
      for (const i of [33, 34, 35, 36, 37, 38]) { S2.tecs[i].fase = 'meseta'; S2.tecs[i].nivel = 3; }
      S2.socrates = 2; S2.sofista = 1; S2.sofistaEst = 0; S2.dudaPend = 2; S2.mats.cera = 6; S2.respuestas = 14; S2.dichas = 9; S2.docentes = 5; S2.alumnos = 34;
      S2.aporias = [{ i: 3, t0: S2.tiempoJuego - 4 }]; S2.ganadoAg = true; S2.vioGracias = true; S2.vioDuda = S2.vioPregunta = S2.vioSofista = true; return S2; },
    alejandria: () => { const S2 = arranqueAlejandria(); S2.era = 5; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 0; return S2; },   // la llegada a Alejandría
    biblioteca: () => { const S2 = arranqueAlejandria(); S2.era = 5; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 5;           // Alejandría completa: los seis saberes, Hipatia, rollos en el muelle, un barco amarrado y uno perdido
      for (const i of [39, 40, 41, 42, 43, 44]) { S2.tecs[i].fase = 'meseta'; S2.tecs[i].nivel = 3; }
      S2.hipatia = 2; S2.originales = 'devolver'; S2.muelle = [{ a: 0, o: false }, { a: 8, o: true }]; S2.perdidos = [{ a: 12, o: false, t0: S2.tiempoJuego }]; S2.barco = { t0: S2.tiempoJuego, n: 1 };
      S2.fondo = 18; S2.fondoValor = 24; S2.sombras = 1; S2.mats.papiro = 6; S2.docentes = 4; S2.alumnos = 46; S2.ganadoAl = true; S2.vioGracias = true;
      S2.vioBarco = S2.vioCatalogo = S2.vioPerdido = S2.vioOriginales = S2.vioSombra = true; return S2; },
    roma: () => { const S2 = arranqueRoma(); S2.era = 14; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 0; return S2; },   // la llegada a Roma (era14-plan; el mundo 3D todavía no existe: solo el estado)
    foro: () => { const S2 = arranqueRoma(); S2.era = 14; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 5;               // Roma completa: los seis saberes, Quintiliano, las tres escuelas con alumnos (listos, a medias, atrasados y uno que se aburre) y la férula en el ludus
      for (const i of [75, 76, 77, 78, 79, 80]) { S2.tecs[i].fase = 'meseta'; S2.tecs[i].nivel = 3; }
      S2.quintiliano = 2; S2.metodoRo = ['ferula', 'juego', 'juego'];
      S2.alumnosRo = [
        { n: 'Marco', g: 'o', k: 1, e: 0, p: 0.96, q: 1 }, { n: 'Julia', g: 'a', k: 2, e: 0, p: 0.74, q: 1 }, { n: 'Lucio', g: 'o', k: 3, e: 0, p: 0.41, q: 1 },
        { n: 'Cayo', g: 'o', k: 4, e: 0, p: 0.18, q: 1 }, { n: 'Tulia', g: 'a', k: 5, e: 0, p: 1.05, q: 0.95 }, { n: 'Tito', g: 'o', k: 6, e: 0, p: 0.05, q: 1 },
        { n: 'Cornelia', g: 'a', k: 7, e: 1, p: 0.92, q: 0.9 }, { n: 'Publio', g: 'o', k: 8, e: 1, p: 0.5, q: 1 }, { n: 'Quinto', g: 'o', k: 9, e: 1, p: -0.12, q: 0.84 },
        { n: 'Sexto', g: 'o', k: 10, e: 1, p: 0.66, q: 0.9 }, { n: 'Aulo', g: 'o', k: 11, e: 2, p: 1.0, q: 0.9 }, { n: 'Décimo', g: 'o', k: 12, e: 2, p: 1.3, q: 0.7 },
        { n: 'Gneo', g: 'o', k: 13, e: 2, p: 0.35, q: 1 }
      ];
      S2.ninoSigRo = 13; S2.oradores = 12; S2.letrados = 30; S2.mats.calculi = 8; S2.alumnos = 58; S2.docentes = 4; S2.ganadoRo = true; S2.vioGracias = true;
      S2.vioLudus = S2.vioPasar = S2.vioMedias = S2.vioAburre = S2.vioOrador = S2.vioFerula = S2.vioNinas = S2.vioMinerval = S2.vioSaturnales = S2.vioVacaciones = S2.vioListoRo = S2.vioRhetor = true; return S2; },
    tenochtitlan: () => { const S2 = arranqueTenochtitlan(); S2.era = 7; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 0; return S2; },   // la llegada a Tenochtitlan (desde París: el orden de la cronología, ORDEN_EPOCAS; la fama de París espera en `famaParis`)
    escuelas: () => { const S2 = arranqueTenochtitlan(); S2.era = 7; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 5;               // Tenochtitlan completa: los seis saberes, Nezahualcóyotl, dos recién nacidos, las escuelas con estudiantes, un canto y la palabra pendientes
      for (const i of [51, 52, 53, 54, 55, 56]) { S2.tecs[i].fase = 'meseta'; S2.tecs[i].nivel = 3; }
      S2.neza = 2; S2.nacidos = [{ n: 'Citlalin', g: 'a', k: 3, s: 12, h: 0, t0: S2.tiempoJuego }, { n: 'Cuauhtli', g: 'o', k: 4, s: 14, h: 1, t0: S2.tiempoJuego }];
      S2.telpo = [{ n: 'Tochtli', t: 40, dur: 70 }, { n: 'Mázatl', t: 20, dur: 70 }, { n: 'Coyotl', t: 60, dur: 70 }]; S2.calme = [{ n: 'Xóchitl', t: 50, dur: 90 }, { n: 'Itzcóatl', t: 30, dur: 90 }, { n: 'Atotoztli', t: 70, dur: 90 }];
      S2.egresTelpo = 8; S2.egresCalme = 6; S2.codices = 8; S2.promesas = 20; S2.palabraPend = true; S2.palabraEst = 99; S2.cantoDia = -1; S2.mats.amate = 5; S2.alumnos = 100; S2.ganadoTe = true; S2.vioGracias = true;
      S2.vioNace = S2.vioPromesa = S2.vioCalme = S2.vioEgreso = S2.vioCanto = S2.vioPalabra = S2.vioCodice = S2.vioSigno = true; return S2; },
    santiago: () => { const S2 = arranqueSantiago(); S2.era = 10; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 0; return S2; },   // la llegada a Santiago
    chile: () => { const S2 = arranqueSantiago(); S2.era = 10; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 5;               // Santiago completa: los seis saberes, Sarmiento, dos normalistas esperando, uno en camino, seis escuelas en los pueblos
      for (const i of [69, 70, 71, 72, 73, 74]) { S2.tecs[i].fase = 'meseta'; S2.tecs[i].nivel = 3; }
      S2.sarmiento = 2; S2.normalistas = 2; S2.viajes = [{ p: 7, t: 10, dur: 90 }]; S2.escuelasSa = { 0: { n: 1, t0: 0 }, 2: { n: 2, t0: 0 }, 4: { n: 1, t0: 0 }, 5: { n: 1, t0: 0 }, 1: { n: 1, t0: 0 } };
      S2.lectoresSa = 180; S2.enviados = 7; S2.mats.pizarra = 6; S2.alumnos = 120; S2.docentes = 4; S2.ganadoSa = true; S2.vioGracias = true;
      S2.vioNormalista = S2.vioViaje = S2.vioEscuela = S2.vioMonitor = S2.vioLey = S2.vioKinder = true; return S2; },
    amsterdam: () => { const S2 = arranqueAmsterdam(); S2.era = 9; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 0; return S2; },   // la llegada a Ámsterdam
    imprenta: () => { const S2 = arranqueAmsterdam(); S2.era = 9; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 5;               // Ámsterdam completa: los seis saberes, Comenio, una cartilla en la prensa, lectores, mapas
      for (const i of [63, 64, 65, 66, 67, 68]) { S2.tecs[i].fase = 'meseta'; S2.tecs[i].nivel = 3; }
      S2.comenio = 2; S2.forma = { o: 'cartilla', fase: 'tirar', t: 2, tiradas: 6 }; S2.demanda = { almanaque: 0.4, cartilla: 0.8, mapa: 0.6, orbis: 1 }; S2.tiradas = 60; S2.tiradasDe = { almanaque: 20, cartilla: 30, mapa: 10 };
      S2.lectores = 130; S2.mapas = 10; S2.mats.pliego = 8; S2.alumnos = 110; S2.docentes = 4; S2.ganadoAm = true; S2.vioGracias = true;
      S2.vioForma = S2.vioTirada = S2.vioLlena = S2.vioPapel = S2.vioLectores = S2.vioClase = S2.vioOrbis = true; return S2; },
    paris: () => { const S2 = arranqueParis(); S2.era = 8; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 0; return S2; },   // la llegada a París (desde Bagdad: el orden de la cronología, ORDEN_EPOCAS)
    sorbona: () => { const S2 = arranqueParis(); S2.era = 8; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 5;               // París completa: los seis saberes, Abelardo, el horario, libros, dos cuestiones, una licencia pendiente y cuatro licenciados
      for (const i of [57, 58, 59, 60, 61, 62]) { S2.tecs[i].fase = 'meseta'; S2.tecs[i].nivel = 3; }
      S2.abelardo = 2; S2.horario = ['leer', 'copiar', 'disputar', 'descansar']; S2.libros = 24; S2.cuestiones = [3, 4]; S2.cuestionSig = 4; S2.resueltas = 9; S2.licenciaPend = true; S2.licenciados = 4;
      S2.sorbonaAlumnos = 8; S2.alumnos = 92; S2.mats.pergamino = 5; S2.docentes = 4; S2.ganadoPa = true; S2.vioGracias = true;
      S2.vioCampana = S2.vioHorario = S2.vioCopia = S2.vioCuestion = S2.vioLicencia = S2.vioCansancio = S2.vioSorbona = true; return S2; },
    bagdad: () => { const S2 = arranqueBagdad(); S2.era = 6; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 0; return S2; },   // la llegada a Bagdad
    casasab: () => { const S2 = arranqueBagdad(); S2.era = 6; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 5;               // Bagdad completa: los seis saberes, Hunayn con su taller, la caravana en la puerta, manuscritos (uno para revisar), la mesa llena, una ijaza y una herencia
      for (const i of [45, 46, 47, 48, 49, 50]) { S2.tecs[i].fase = 'meseta'; S2.tecs[i].nivel = 3; }
      S2.hunayn = 2; S2.taller = 2; S2.caravana = { t0: S2.tiempoJuego + 1.5 };   // la caravana llega mientras carga la página: detenida en las fotos (8 s después)
      S2.manuscritos = [{ o: 1 }, { o: 6, rev: true }, { o: 3 }];
      S2.mesa = [{ o: 0, metodo: 'sentido', t: 30, dur: 54 }, { o: 4, metodo: 'literal', t: 8, dur: 20 }, { o: 9, metodo: 'sentido', t: 12, dur: 54 }, { o: 11, metodo: 'sentido', t: 40, dur: 54 }];
      S2.bibValor = 40; S2.traducidas = 18; S2.sentidos = 14; S2.literales = 4; S2.muidin = 4; S2.halqaAlumnos = 16; S2.alumnos = 66; S2.ijazaPend = true; S2.herenciaPend = true; S2.herenciaEst = 99;
      S2.mats.papel = 6; S2.docentes = 4; S2.ganadoBa = true; S2.vioGracias = true;
      S2.vioCaravana = S2.vioTraducir = S2.vioRevision = S2.vioIjaza = S2.vioHerencia = S2.vioVienen = true; return S2; },
    futuro: () => { const S2 = arranqueFuturo(); S2.era = 21; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 0; return S2; },   // la llegada al valle de hoy, la última época (era21-plan)
    valle: () => { const S2 = arranqueFuturo(); S2.era = 21; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 5;               // el valle completo: los seis saberes, Bloom recibido, atención juntada, dos que esperan con su pregunta, dos que caminan pensando y una respuesta inventada por revisar
      for (const i of [87, 88, 89, 90, 91, 92]) { S2.tecs[i].fase = 'meseta'; S2.tecs[i].nivel = 3; }
      S2.bloom = 2; S2.mats.atencion = 5; S2.alumnos = 80; S2.docentes = 4; S2.ganadoFu = true; S2.vioGracias = true;
      S2.entendidosFu = 28; S2.entDefendidosFu = 26; S2.respondidosFu = 41; S2.erroresFu = 1; S2.inventadasFu = 7; S2.revisadosFu = 6; S2.lejosFu = 9; S2.defensasFu = 5; S2.dudaSigFu = 70;
      S2.dudasFu = [{ n: 'Lucía', k: 66, q: 1, l: 0, w: 4 }, { n: 'Amadou', k: 69, q: 4, l: 1, w: 1 }];
      S2.pensandoFu = [{ n: 'Kenji', k: 64, q: 3, l: 0, p: 0.35 }, { n: 'Martina', k: 67, q: 7, l: 0, p: 0.7 }];
      S2.vioDuda = S2.vioResponde = S2.vioPregunta = S2.vioEntiende = S2.vioInventa = S2.vioRevisa = S2.vioDefensa = S2.vioLejos = S2.vioDefectoFu = S2.vioAtencion = true; return S2; },
    kaifeng: () => { const S2 = arranqueChina(); S2.era = 15; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 0; return S2; },   // la llegada a Kaifeng (era15-plan; el mundo 3D todavía no existe: solo el estado)
    examen: () => { const S2 = arranqueChina(); S2.era = 15; S2.eraAprBase = S2.aprTotal; S2.hitosEra = 5;               // China completa: los seis saberes, Zhu Xi recibido, tinta en el horno y la escuela de la prefectura llena: dos candidatos que esperan (uno de aldea), tres que se preparan (de memoria, los asuntos y para entender) y dos listos; el examen, en 40 s
      for (const i of [81, 82, 83, 84, 85, 86]) { S2.tecs[i].fase = 'meseta'; S2.tecs[i].nivel = 3; }
      S2.zhuxi = 2; S2.mats.tinta = 6; S2.alumnos = 74; S2.docentes = 4; S2.ganadoCh = true; S2.vioGracias = true; S2.vioTinta = true;
      S2.candidatosCh = [
        { n: 'Lin Chu', k: 31, o: 'c', t: 0.3, m: null, p: 0 }, { n: 'Gao Ming', k: 32, o: 'a', t: 0.15, m: null, p: 0 },
        { n: 'Wang Shu', k: 28, o: 'c', t: 0.15, m: 'memoria', p: 0.62 }, { n: 'Xu Guang', k: 29, o: 'a', t: 0, m: 'asuntos', p: 0.35 },
        { n: 'Liu Gong', k: 30, o: 'c', t: 0.15, m: 'entender', p: 0.18 }, { n: 'Zhou Bo', k: 26, o: 'c', t: 0.3, m: 'entender', p: 1 },
        { n: 'Chen Mu', k: 27, o: 'a', t: 0, m: 'memoria', p: 1 }
      ];
      S2.candSigCh = 32; S2.examenT = EXAMEN_CADA - 40; S2.examenesCh = 6; S2.preparadosCh = 40; S2.funcionarios = 26; S2.funcCh = { memoria: 10, asuntos: 1, entender: 15 };   // las cifras de una partida al cerrar (balance-epoca15.md)
      S2.maestrosAldea = 5; S2.aldeaCh = { memoria: 2, asuntos: 2, entender: 1 }; S2.aldeaAtiende = 4; S2.gobiernoCh = 0.5;
      S2.vioCandidato = S2.vioMemoria = S2.vioAsuntos = S2.vioEntender = S2.vioExamenCh = S2.vioAldea = S2.vioPalacioCh = S2.vioModelos = true; return S2; },
    /* para juzgar la interfaz: leña baja, un saber formándose, otro juntando polvo, otro nuevo, la Abuela esperando */
    demoui: () => { const S2 = paleo(); S2.fuego = 52; S2.abuela = 1; S2.pre = 180;
      S2.tecs[11].fase = 'formando'; S2.tecs[11].t = BALANCE.tecnologias[11].formDur * 0.45; S2.tecs[12].fase = 'valle'; S2.tecs[13].fase = 'novedad'; S2.tecs[13].nivel = 0; return S2; },
  };
  if (MOMENTOS[qs.get('momento')]) { S = MOMENTOS[qs.get('momento')](); resize(); renderHUD(); }
}
if (MODO_LAB && qs.has('hora')) {
  const dt = +qs.get('hora') - S.tiempoJuego; S.tiempoJuego = +qs.get('hora'); tJuegoVis = +qs.get('hora');
  for (const k of ['caravana', 'barco']) if (S[k] && S[k].t0 != null) S[k].t0 += dt;   // lo que tiene reloj propio se corre con la hora (la caravana sigue detenida, el barco amarrado)
  for (const r of S.revisiones || []) r.t0 += dt;
}
if (MODO_LAB && qs.get('momento') === 'demoui') {       // cada tanto nace una luz, alguien la recoge y sube un «+N»
  const mats = MATERIALES.filter(m => (m.era || 1) === 1 && m.k !== 'grano');
  let i = 0;
  setInterval(() => {
    const m = mats[i++ % mats.length], n = { x: 9 + Math.random() * 3, y: 11 + Math.random() * 2, born: tFrame, mat: m };
    colectibles.push(n);
    setTimeout(() => { if (colectibles.includes(n)) window.recogerColectible(n); }, 2600);
  }, 3200);
}
/* EL MEDIDOR (?perf=1): para probar en un celular o una tableta de verdad (servir.py). Cuadros por segundo del
   último segundo y el peor desde que se abrió (sin los primeros 5 s, que son de carga), el tiempo del cuadro, las
   llamadas de dibujo, los triángulos y lo vivo en la GPU. Se toca para reiniciar el peor. */
if (qs.has('perf')) {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;left:6px;top:42%;z-index:200;font:600 10.5px/1.35 ui-monospace,Menlo,monospace;color:#fff;background:rgba(20,30,40,.72);padding:5px 8px;border-radius:8px;white-space:pre;pointer-events:auto';
  document.body.appendChild(el);
  let n = 0, t0 = performance.now(), peor = Infinity, ms = 0, ult = performance.now();
  const abierto = performance.now();
  el.addEventListener('click', () => { peor = Infinity; });
  const medir = () => {
    const ahora = performance.now(); ms = ms * 0.9 + (ahora - ult) * 0.1; ult = ahora; n++;
    if (ahora - t0 >= 1000) {
      const fps = n * 1000 / (ahora - t0); n = 0; t0 = ahora;
      if (ahora - abierto > 5000) peor = Math.min(peor, fps);
      const i = renderer.info;
      el.textContent = `${fps.toFixed(0)} fps · peor ${peor === Infinity ? '…' : peor.toFixed(0)} · ${ms.toFixed(1)} ms\n` +
        `${i.render.calls} dibujos · ${(i.render.triangles / 1000).toFixed(0)} k triáng.\n` +
        `${i.memory.geometries} geom · ${i.memory.textures} text · ${LIVIANO ? 'liviano' : 'pesado'} · dpr ${renderer.getPixelRatio()}`;
    }
    requestAnimationFrame(medir);
  };
  requestAnimationFrame(medir);
}
window.__juego3d = { renderer, escena, cam, vivo, frontera };
window.__err = null;
const cargando = document.getElementById('cargando'); if (cargando) { cargando.style.opacity = 0; setTimeout(() => cargando.remove(), 500); }
