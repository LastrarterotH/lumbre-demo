/* ============================================================
   20-main
   El arranque: velocidad (×1 ×5 ×20), listeners de ratón y teclado, el bucle de la economía y el de render.
   ============================================================ */
let warp = 1;
// F6 del QA general: quien pide menos movimiento en su sistema no recibe giros de cielo ni paseos de cámara
const MOV_REDUCIDO = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
document.querySelectorAll('#dev button[data-warp]').forEach(b => {
  b.addEventListener('click', () => {
    warp = +b.dataset.warp;
    document.querySelectorAll('#dev button[data-warp]').forEach(x => x.classList.toggle('on', x === b));
  });
});
$('b-home').addEventListener('click', encuadrar);
$('b-mute').addEventListener('click', () => { S.mute = !S.mute; renderHUD(); guardar(); });
$('b-seguir').addEventListener('click', () => { $('victoria').style.display = 'none'; victoriaPendiente = false; if (graciasPendiente) { graciasPendiente = false; abrirGracias(); } });
$('b-gracias-cerrar').addEventListener('click', () => { $('gracias').style.display = 'none'; });
$('b-empezar').addEventListener('click', cerrarPortada);
$('b-ayuda').addEventListener('click', () => abrirPortada(false));
const BIENVENIDA_FOGON = '🌒 <b>La penumbra.</b> El clan se aprieta en la oscuridad: no hay fuego, no hay saber, no hay historias todavía. <b>Frota las varas</b> desde el dock: todo empieza con una chispa.';
let resetArmado = 0;
$('b-reset').addEventListener('click', () => {
  if (Date.now() - resetArmado < 3000) {
    resetArmado = 0; // el reset se desarma: un clic de más no reinicia dos veces
    S = estadoInicial();
    cerrarSuperficies();
    $('toasts').innerHTML = '';
    colectibles.length = 0; fx.humo.length = 0; fx.libros.length = 0; fx.chispas.length = 0; fx.pops.length = 0; fx.anillos.length = 0; fx.taps.length = 0;
    guardar();
    cerrarModales();
    $('b-reset').textContent = 'reiniciar';
    resize(); // terreno, cámara y encuadre vuelven a la época 1
    toast(BIENVENIDA_FOGON, 12000);
    renderHUD();
    if (!MODO_LAB) abrirPortada(true); // partida nueva: la portada otra vez (el demo puede pasar de mano en mano)
  } else {
    resetArmado = Date.now();
    $('b-reset').textContent = '¿seguro?';
    setTimeout(() => { $('b-reset').textContent = 'reiniciar'; }, 3000);
  }
});

construirTienda();
/* LA PARTIDA DE VALIDACIÓN DE UNA ÉPOCA (2026-08-24): `?lab=1&egipto=1` arranca el laboratorio en
   la LLEGADA a Egipto, con las Épocas 1 y 2 completas y los siglos recién cruzados: es el paso 4
   del pipeline (la partida del usuario) sin tocar el save real, y a prueba de recargas (el estado
   se reconstruye en cada carga). El molde sirve para las épocas que vengan. */
const ARRANQUE_EGIPTO = MODO_LAB && new URLSearchParams(location.search).has('egipto');
const ARRANQUE_SUMER = MODO_LAB && !ARRANQUE_EGIPTO && new URLSearchParams(location.search).has('sumer'); // el mismo molde, para mirar Sumer sin jugar la Época 1 (2026-09-06)
const ARRANQUE_AGORA = MODO_LAB && new URLSearchParams(location.search).has('agora');
const ARRANQUE_ALEJANDRIA = MODO_LAB && new URLSearchParams(location.search).has('alejandria');
const ARRANQUE_FUTURO = MODO_LAB && new URLSearchParams(location.search).has('futuro');                     // y la llegada al valle de hoy, la última época (era21-plan), con las once anteriores completas (la última, Ámsterdam)
const ARRANQUE_SANTIAGO = MODO_LAB && new URLSearchParams(location.search).has('santiago');                 // y la llegada a Santiago, con las nueve épocas completas
const ARRANQUE_AMSTERDAM = MODO_LAB && new URLSearchParams(location.search).has('amsterdam');               // y la llegada a Ámsterdam, con las nueve épocas anteriores completas
const ARRANQUE_PARIS = MODO_LAB && new URLSearchParams(location.search).has('paris');                       // y la llegada a París, con las siete anteriores completas (la última, Bagdad)
const ARRANQUE_TENOCHTITLAN = MODO_LAB && new URLSearchParams(location.search).has('tenochtitlan');         // y la llegada a Tenochtitlan, con las ocho anteriores completas (la última, París)
const ARRANQUE_ROMA = MODO_LAB && new URLSearchParams(location.search).has('roma');                         // y la llegada a Roma, con las cinco primeras épocas completas (era14-plan)
const ARRANQUE_CHINA = MODO_LAB && new URLSearchParams(location.search).has('china');                       // y la llegada a Kaifeng, con las siete épocas anteriores completas (la última, Bagdad; era15-plan)
const ARRANQUE_BAGDAD = MODO_LAB && new URLSearchParams(location.search).has('bagdad');                     // y la llegada a Bagdad, con las cinco épocas completas                // y la llegada a Alejandría, con las cuatro épocas completas                          // y la llegada a Atenas, con las tres épocas completas
if (!cargar()) {
  S = estadoInicial();
  if (!ARRANQUE_FUTURO && !ARRANQUE_EGIPTO && !ARRANQUE_SUMER && !ARRANQUE_AGORA && !ARRANQUE_ALEJANDRIA && !ARRANQUE_ROMA && !ARRANQUE_BAGDAD && !ARRANQUE_CHINA && !ARRANQUE_TENOCHTITLAN && !ARRANQUE_PARIS && !ARRANQUE_AMSTERDAM && !ARRANQUE_SANTIAGO && !(MODO_LAB && new URLSearchParams(location.search).has('momento'))) toast(BIENVENIDA_FOGON, 14000); // los momentos del laboratorio 3D no empiezan en la penumbra (H4) // la penumbra es de la Época 1, no del cruce
}
// LA PORTADA DEL DEMO: la primera vez que alguien abre Lumbre (o `?lab=1&portada=1` para mirarla en el laboratorio)
const VER_PORTADA = MODO_LAB ? new URLSearchParams(location.search).has('portada') : !S.vioPortada;
/* LAS RECETAS DE LLEGADA, como funciones (2026-09-06): el laboratorio de balance también las usa, para
   medir la partida de validación TAL CUAL la ve el usuario y no solo la del bot que viene jugando
   desde el fogón. Los recursos de llegada son los que el bot trae de verdad al cruce (medidos en
   qa.html): con 950 🏺 la Casa de la Vida arrancaba con dos minutos y medio de espera sin nada que
   comprar, mientras el bot medido llegaba con ~16 800 y compraba cuatro saberes en cascada. */
function arranqueSumer() {
  const S = estadoInicial();
  S.fuegoDescubierto = true; S.fuego = 80; S.edad = 2;
  S.ganadoF = true; S.signo = true; S.granero = true;
  S.abuela = 2; S.abuelaCap = 3;
  for (const i of [10, 11, 12, 13, 15, 28, 24, 25, 26, 27]) { S.tecs[i].fase = 'meseta'; S.tecs[i].nivel = 3; }
  S.alumnos = 14; S.docentes = 2; S.rep = 6; S.animo = 100;
  S.pre = ARRANQUE_PRE.sumer; S.apr = 9000; S.aprTotal = 4e5; S.tiempoJuego = 1380; // los números del bot al cruce de la Época 1 (~22 min)
  S.mats.lena = 4;
  S.diadas = 4; S.muescas = 13; S.cosechas = 4; S.cazasHechas = 4;
  S.vioMats = true; S.vioHierbas = true; S.vioGuia = true; S.vioChispa = true; S.vioConteo = true; S.vioOrilla = true;
  S.vioNoche = true; S.vioDia = true; // la primera noche ya se presentó junto al fogón: aquí no hay clan que reunir al fuego
  return S;
}
function arranqueEgipto() {
  const S = estadoInicial();
  S.fuegoDescubierto = true; S.fuego = 80; S.edad = 2;
  S.ganadoF = true; S.ganadoSum = true; S.signo = true; S.granero = true;
  S.abuela = 2; S.abuelaCap = 3; S.enheduanna = 2; // los pensadores del camino ya son del clan
  for (const i of [10, 11, 12, 13, 15, 28, 24, 25, 26, 27, 16, 17, 18, 19, 29, 30]) { S.tecs[i].fase = 'meseta'; S.tecs[i].nivel = 3; }
  S.alumnos = 18; S.docentes = 3; S.rep = 7; S.animo = 100;
  S.pre = ARRANQUE_PRE.egipto; S.apr = 52000; S.aprTotal = 8e6; S.tiempoJuego = 2382; // los números del bot al cruce (~39,7 min)
  S.mats.barro = 9; S.mats.lena = 4;
  S.manoCopias = 20; S.diadas = 4; S.diadasDict = 2; S.muescas = 13; S.cosechas = 4; S.cazasHechas = 4; S.himnos = 3;
  S.vioMats = true; S.vioHierbas = true; S.vioGuia = true; S.vioChispa = true; S.vioConteo = true; S.vioOrilla = true;
  S.vioSello = true; S.vioCopia = true; S.vioDictado = true; S.vioAzolve = true; // lo ya presentado no se re-presenta
  S.vioNoche = true; S.vioDia = true;
  return S;
}
/* MEDIDO EN qa.html el 2026-09-06 con «jugarEgLab»: el bot cruza a Sumer con ~920 🏺 y a Egipto con
   ~16 800 (la administración de la edubba paga ~1000/min al final y nada lo gasta). Con 950 la Casa
   de la Vida NO cerraba ni en 40 min; con 12 000 cierra en ~20 y con 16 800 en ~15. La receta lleva
   una cifra conservadora dentro de lo real: si el usuario llega más rico, mejor para él. */
function arranqueAgora() {
  const S = arranqueEgipto();
  S.ganadoEg = true; S.ptahhotep = 2;
  for (const i of [20, 21, 22, 23, 31, 32]) { S.tecs[i].fase = 'meseta'; S.tecs[i].nivel = 3; }
  S.alumnos = 28; S.docentes = 4; S.rep = 12; S.animo = 100;
  S.pre = ARRANQUE_PRE.agora; S.apr = 1.69e10; S.aprTotal = 2.09e10; S.tiempoJuego = 3245; // LA LLEGADA REAL del bot al cruce a Atenas (medida 2026-10-01, con la economía del QA completo: 54,1 min, 9426 🏺 que el mar topa en 7800, 1,69e10 📖; balance-epoca4.md)
  S.mats.papiro = 3; S.papiros = 10; S.practicas = 19; S.lascas = 30;
  S.vioOstracon = true; S.vioPapiro = true; S.vioCuerda = true;
  return S;
}
function arranqueAlejandria() {
  const S = arranqueAgora();
  S.ganadoAg = true; S.socrates = 2;
  for (const i of [33, 34, 35, 36, 37, 38]) { S.tecs[i].fase = 'meseta'; S.tecs[i].nivel = 3; }
  S.alumnos = 38; S.docentes = 4; S.rep = 17; S.animo = 130;
  S.pre = ARRANQUE_PRE.alejandria; S.apr = 3.49e11; S.aprTotal = 1.626e12; S.tiempoJuego = 4150; // LA LLEGADA REAL del bot al cruce a Alejandría (medida 2026-10-03: 69,2 min, 7564 🏺, 3,49e11 📖 tras pagar el cruce; balance-epoca5.md)
  S.mats.cera = 4; S.respuestas = 11; S.dichas = 10;
  S.vioDuda = true; S.vioPregunta = true; S.vioSofista = true;
  return S;
}
/* ROMA (era14-plan) va entre Alejandría y Bagdad: su llegada es la que antes era la llegada a Bagdad (el cruce de Alejandría
   cuesta lo mismo, investigacionRoma = 1,2e14). Las recetas que siguen se re-midieron con Roma adentro (2026-10-05,
   docs/balance-epoca14.md): lo que Roma gana se queda en Roma (sus saberes rinden en Roma, `bonoVive`; su renombre vuelve
   al de la llegada, `entrarEpoca`; sus hitos no traen aprendices), así que cada época llega como antes, ~18 min más tarde. */
function arranqueRoma() {
  const S = arranqueAlejandria();
  S.ganadoAl = true; S.hipatia = 2;
  for (const i of [39, 40, 41, 42, 43, 44]) { S.tecs[i].fase = 'meseta'; S.tecs[i].nivel = 3; }
  S.alumnos = 48; S.docentes = 4; S.rep = 23; S.animo = 135;
  S.pre = ARRANQUE_PRE.roma; S.apr = 3.21e10; S.aprTotal = 2.19e14; S.tiempoJuego = 5306; // LA LLEGADA REAL del bot al cruce que sale de Alejandría (re-medida 2026-10-05 con b-roma-full: 88,4 min, 9500 🏺 que el barco topa, 3,2e10 📖 tras pagar el cruce; balance-epoca14.md)
  S.mats.papiro = 6; S.fondo = 18; S.fondoValor = 26; S.sombras = 1; S.originales = 'devolver';
  S.guiasModo = [null, 'corro']; S.diadas = 1; S.muescas = 60;   // lo que la partida real trae de la Época 1 (la guía que enseña a muchos vale para siempre)
  S.vioBarco = true; S.vioCatalogo = true; S.vioPerdido = true; S.vioSombra = true;
  return S;
}
function arranqueBagdad() {
  const S = arranqueRoma();
  S.ganadoRo = true; S.quintiliano = 2;
  for (const i of [75, 76, 77, 78, 79, 80]) { S.tecs[i].fase = 'meseta'; S.tecs[i].nivel = 3; }
  S.alumnos = 48; S.docentes = 4; S.rep = 23; S.animo = 135;
  // LA LLEGADA REAL del bot al cruce a Bagdad (medida 2026-10-05 con b-bagdad-full: 106,6 min, Roma sola 18,1; 9500 🏺 que
  // la caravana topa, 9,6e12 📖 tras pagar el cruce; balance-epoca14.md). Bagdad llega como antes de Roma: el mismo
  // renombre, los mismos aprendices y la misma tasa (4,47e11); Roma deja sus escuelas (sus alumnos se quedan en Roma)
  S.pre = ARRANQUE_PRE.bagdad; S.apr = 9.56e12; S.aprTotal = 7.33e15; S.tiempoJuego = 6394;
  S.alumnosRo = []; S.oradores = 35; S.letrados = 71; S.mats.calculi = 12;
  S.vioLudus = S.vioPasar = S.vioMedias = S.vioAburre = S.vioOrador = S.vioFerula = S.vioNinas = S.vioMinerval = S.vioSaturnales = S.vioVacaciones = true;
  return S;
}
/* EL ORDEN DE LA CRONOLOGÍA (2026-10-05, docs/balance-epoca8.md y balance-epoca7.md): Bagdad → China → París → Tenochtitlan →
   Ámsterdam. París llega con lo que antes traía Tenochtitlan de Bagdad (sus números de saber, 1/79; sus saberes, ×0,85 en
   🏺); Tenochtitlan llega con los saberes de París (sus números de saber, ×77) y con el renombre de Bagdad (la fama de
   París no cruza el océano: se guarda en `famaParis` y vuelve en Ámsterdam), y Ámsterdam llega como antes.
   CHINA (era15-plan) entra entre Bagdad y París: su llegada es la que antes era la llegada a París (el cruce de Bagdad cuesta
   lo mismo, investigacionChina = 5,4e16); y como lo que China gana se queda en China (sus saberes rinden en Kaifeng,
   `bonoVive`; su renombre vuelve al de la llegada, `entrarEpoca`; sus hitos no traen aprendices; sus sueldos y su gobierno
   viven en la Época 15), París llega como antes, ~16 min más tarde. Las recetas que siguen se re-midieron con China adentro
   (2026-10-06, docs/balance-epoca15.md: la partida entera hasta cerrar Ámsterdam pasa de 175,6 a 191,5 min, lo que dura
   China). */
function arranqueChina() {
  const S = arranqueBagdad();
  S.ganadoBa = true; S.hunayn = 2;
  for (const i of [45, 46, 47, 48, 49, 50]) { S.tecs[i].fase = 'meseta'; S.tecs[i].nivel = 3; }
  S.alumnos = 74; S.docentes = 4; S.rep = 39; S.repAntesCh = 39; S.animo = 135;   // repAntesCh: el renombre con que se llega a Kaifeng, y al que se vuelve al salir (entrarEpoca; los momentos del 3D no pasan por ahí)
  S.pre = ARRANQUE_PRE.china; S.apr = 2.21e16; S.aprTotal = 8.8e16; S.tiempoJuego = 7435; // LA LLEGADA REAL del bot al cruce que sale de Bagdad (re-medida 2026-10-06 con b-china-full: 123,9 min, Bagdad sola 17,3; 12 000 🏺 que la Ruta de la Seda topa, 2,2e16 📖 tras pagar el cruce; balance-epoca15.md)
  S.mats.papel = 14; S.bibValor = 68.6; S.traducidas = 30; S.sentidos = 25; S.literales = 1; S.muidin = 4; S.taller = 2; S.halqaAlumnos = 16; S.herencias = 3;
  S.vioCaravana = true; S.vioTraducir = true; S.vioIjaza = true; S.vioHerencia = true; S.vioVienen = true;
  return S;
}
function arranqueParis() {
  const S = arranqueChina();
  S.ganadoCh = true; S.zhuxi = 2;
  for (const i of [81, 82, 83, 84, 85, 86]) { S.tecs[i].fase = 'meseta'; S.tecs[i].nivel = 3; }
  S.alumnos = 74; S.docentes = 4; S.rep = 39; S.repAntesPa = 39; S.animo = 135;   // repAntesPa: lo que la fama de París deja al cruzar el océano (entrarEpoca; los momentos del 3D no pasan por ahí). El renombre es el de Bagdad: los 26 de Kaifeng se quedan en China
  S.pre = ARRANQUE_PRE.paris; S.apr = 5.18e16; S.aprTotal = 7.6e17; S.tiempoJuego = 8384; // LA LLEGADA REAL del bot al cruce que sale de China (medida 2026-10-06 con b-paris-full: 139,7 min, China sola 15,8; 12 000 🏺 que el viaje topa, 5,2e16 📖 tras pagar el cruce; balance-epoca15.md)
  S.candidatosCh = []; S.funcionarios = 35; S.funcCh = { memoria: 18, entender: 17 }; S.maestrosAldea = 4; S.aldeaCh = { memoria: 1, asuntos: 3 }; S.gobiernoCh = 0.5;   // lo que dejó el examen en Kaifeng (no rinde fuera de la Época 15)
  S.mats.tinta = 4; S.vioTinta = true;   // lo que deja Kaifeng
  return S;
}
function arranqueTenochtitlan() {
  const S = arranqueParis();
  S.ganadoPa = true; S.abelardo = 2;
  for (const i of [57, 58, 59, 60, 61, 62]) { S.tecs[i].fase = 'meseta'; S.tecs[i].nivel = 3; }
  S.alumnos = 92; S.docentes = 4; S.rep = 39; S.famaParis = 26; S.animo = 127;   // el renombre de Bagdad: los 26 de la universidad esperan en Europa (entrarEpoca); el ánimo, como lo deja el horario de París
  S.pre = ARRANQUE_PRE.tenochtitlan; S.apr = 6.74e17; S.aprTotal = 8.75e18; S.tiempoJuego = 9398; // LA LLEGADA REAL del bot al cruce que sale de París (re-medida 2026-10-06 con b-tenochtitlan-full, con China adentro: 156,6 min, París sola 16,9; 11 000 🏺 que la canoa topa, 6,7e17 📖 tras pagar el cruce; balance-epoca15.md)
  S.mats.pergamino = 8; S.horario = ['leer', 'leer', 'disputar', 'descansar']; S.libros = 42; S.resueltas = 13; S.licenciados = 6; S.sorbonaAlumnos = 8;
  S.vioCampana = true; S.vioHorario = true; S.vioCopia = true; S.vioCuestion = true; S.vioLicencia = true; S.vioCansancio = true; S.vioSorbona = true;
  return S;
}
function arranqueAmsterdam() {
  const S = arranqueTenochtitlan();
  S.ganadoTe = true; S.neza = 2;
  for (const i of [51, 52, 53, 54, 55, 56]) { S.tecs[i].fase = 'meseta'; S.tecs[i].nivel = 3; }
  S.alumnos = 103; S.docentes = 4; S.rep = 76; S.famaParis = 0; S.animo = 135;   // la fama de París ya volvió
  S.pre = ARRANQUE_PRE.amsterdam; S.apr = 2.27e20; S.aprTotal = 3.45e20; S.tiempoJuego = 10409; // LA LLEGADA REAL del bot al cruce que sale de Tenochtitlan (re-medida 2026-10-06 con b-amsterdam-full, con China adentro: 173,5 min, Tenochtitlan sola 16,9; 13 000 🏺 que el viaje topa, 2,3e20 📖 tras pagar el cruce; balance-epoca15.md)
  S.mats.amate = 6; S.codices = 25; S.egresTelpo = 23; S.egresCalme = 14; S.signoBien = 11; S.palabras = 2; S.promesas = 34;
  S.vioNace = true; S.vioPromesa = true; S.vioCanto = true; S.vioPalabra = true; S.vioTodos = true; S.vioCalme = true; S.vioEgreso = true; S.vioCodice = true; S.vioSigno = true;
  return S;
}
function arranqueSantiago() {
  const S = arranqueAmsterdam();
  S.ganadoAm = true; S.comenio = 2;
  for (const i of [63, 64, 65, 66, 67, 68]) { S.tecs[i].fase = 'meseta'; S.tecs[i].nivel = 3; }
  S.alumnos = 113; S.docentes = 4; S.rep = 83; S.animo = 135;
  S.pre = ARRANQUE_PRE.santiago; S.apr = 2.65e21; S.aprTotal = 1.2e22; S.tiempoJuego = 11491; // LA LLEGADA REAL del bot al cruce a Santiago (re-medida 2026-10-06 con China adentro: 191,5 min, Ámsterdam sola 18,0; 14 000 🏺 que el viaje topa, 2,7e21 📖 tras pagar el cruce; balance-epoca15.md)
  S.mats.pliego = 11; S.forma = null; S.tiradas = 109; S.tiradasDe = { almanaque: 38, cartilla: 60, mapa: 6, orbis: 5 }; S.lectores = 207;   // el reparto por obra no lo mide el bot: el de la medición anterior, escalado a las 110 tiradas S.mapas = 6;
  S.vioForma = true; S.vioTirada = true; S.vioLlena = true; S.vioPapel = true; S.vioLectores = true; S.vioClase = true; S.vioOrbis = true;
  return S;
}
/* EL FUTURO (era21-plan): se llega al mismo punto del viaje al que llegaba Santiago (después de Ámsterdam, por el mismo
   cruce): su receta es la de Santiago, provisional hasta que el bot la mida con la época adentro (balance-epoca21.md) */
function arranqueFuturo() {
  const S = arranqueSantiago();
  S.pre = ARRANQUE_PRE.futuro;
  return S;
}
const ARRANQUE_PRE = { futuro: 14000, sumer: 900, egipto: 12000, agora: 7800, alejandria: 7564, roma: 9500, bagdad: 9500, china: 12000, tenochtitlan: 11000, paris: 12000, amsterdam: 13000, santiago: 14000 };
if (ARRANQUE_SUMER) {
  S = arranqueSumer();
  entrarEpoca(2);
  toast('🏺 <b>Pasan los milenios…</b> el clan sigue el río hasta la ciudad de las tablillas: <b>Sumer</b>. Funda la edubba.', 14000);
  toast('🔬 <i>Partida de validación: el laboratorio no lee ni escribe tu partida real. Si recargas, la época vuelve a empezar.</i>', 9000);
}
if (ARRANQUE_FUTURO) {
  S = arranqueFuturo();
  entrarEpoca(21);
  toast(TXT_LLEGA_FUTURO, 15000);
  toast('🔬 <i>Partida de validación: el laboratorio no lee ni escribe tu partida real. Si recargas, la época vuelve a empezar.</i>', 9000);
} else if (ARRANQUE_SANTIAGO) {
  S = arranqueSantiago();
  entrarEpoca(10);
  toast('🎒 <b>Pasan casi dos siglos y un océano: Santiago de Chile.</b> Al pie de la cordillera, una república nueva quiere una escuela en cada pueblo. Pero no hay maestros: hay que formarlos, y mandarlos lejos.', 14000);
  toast('🔬 <i>Partida de validación: el laboratorio no lee ni escribe tu partida real. Si recargas, la época vuelve a empezar.</i>', 9000);
} else if (ARRANQUE_AMSTERDAM) {
  S = arranqueAmsterdam();
  entrarEpoca(9);
  toast('🖨️ <b>Pasan dos siglos, y el océano de vuelta: Ámsterdam.</b> Una máquina de Maguncia multiplica los libros: lo que se compone una vez se imprime mil veces. En la ciudad de los canales, la casa Blaeu tiene nueve prensas y en cada barrio hay una escuela con su cartilla.', 14000);
  toast('🔬 <i>Partida de validación: el laboratorio no lee ni escribe tu partida real. Si recargas, la época vuelve a empezar.</i>', 9000);
} else if (ARRANQUE_PARIS) {
  S = arranqueParis();
  entrarEpoca(8);
  toast(TXT_LLEGA_PARIS, 14000);
  toast('🔬 <i>Partida de validación: el laboratorio no lee ni escribe tu partida real. Si recargas, la época vuelve a empezar.</i>', 9000);
} else if (ARRANQUE_TENOCHTITLAN) {
  S = arranqueTenochtitlan();
  entrarEpoca(7);
  toast('🌋 <b>Pasan tres siglos y un océano: Tenochtitlan.</b> Del otro lado del mar, en un mundo que Europa todavía no conoce, los mexicas fundan una ciudad sobre el agua, en un lago entre volcanes. Ahí todos los niños van a la escuela.', 14000);
  toast('🔬 <i>Partida de validación: el laboratorio no lee ni escribe tu partida real. Si recargas, la época vuelve a empezar.</i>', 9000);
} else if (ARRANQUE_CHINA) {
  S = arranqueChina();
  entrarEpoca(15);
  toast(TXT_LLEGA_CHINA, 14000);
  toast('🔬 <i>Partida de validación: el laboratorio no lee ni escribe tu partida real. Si recargas, la época vuelve a empezar.</i>', 9000);
} else if (ARRANQUE_BAGDAD) {
  S = arranqueBagdad();
  entrarEpoca(6);
  toast('🌙 <b>Pasan cuatro siglos…</b> el papel llega de China por Samarcanda, y un califa funda junto al Tigris una ciudad redonda: <b>Bagdad</b>. Abre la Casa de la Sabiduría.', 14000);
  toast('🔬 <i>Partida de validación: el laboratorio no lee ni escribe tu partida real. Si recargas, la época vuelve a empezar.</i>', 9000);
} else if (ARRANQUE_ROMA) {
  S = arranqueRoma();
  entrarEpoca(14);
  toast('🏛️ <b>Cruzan el mar…</b> los barcos del grano llevan el trigo del Nilo a Ostia, y con ellos viajan los libros y los maestros griegos: <b>Roma</b>. Bajo los pórticos del Foro, la escuela se vuelve un camino de tres escuelas.', 14000);
  toast('🔬 <i>Partida de validación: el laboratorio no lee ni escribe tu partida real. Si recargas, la época vuelve a empezar.</i>', 9000);
} else if (ARRANQUE_ALEJANDRIA) {
  S = arranqueAlejandria();
  entrarEpoca(5);
  toast('⛵ <b>Pasa un siglo y medio…</b> Alejandro funda una ciudad en la boca del Nilo y un rey quiere juntar ahí todos los libros del mundo: <b>Alejandría</b>. Abre el Museo.', 14000);
  toast('🔬 <i>Partida de validación: el laboratorio no lee ni escribe tu partida real. Si recargas, la época vuelve a empezar.</i>', 9000);
} else if (ARRANQUE_AGORA) {
  S = arranqueAgora();
  entrarEpoca(4);
  toast('🏛️ <b>Cruzan el mar…</b> los rollos llegan a un puerto donde nadie dicta: en <b>Atenas</b> el maestro pregunta y el que aprende responde. Abre el ágora.', 14000);
  toast('🔬 <i>Partida de validación: el laboratorio no lee ni escribe tu partida real. Si recargas, la época vuelve a empezar.</i>', 9000);
} else if (ARRANQUE_EGIPTO) {
  S = arranqueEgipto();
  entrarEpoca(3); // estampa eraAprBase e hitosEra, como el cruce real
  toast('🪷 <b>Pasan los siglos…</b> los rollos viajan más lejos que las tablillas y el río grande reparte limo y saber: <b>Egipto</b>. Abre la Casa de la Vida.', 14000);
  toast('🔬 <i>Partida de validación: el laboratorio no lee ni escribe tu partida real. Si recargas, la época vuelve a empezar.</i>', 9000);
}
resize(); // después de cargar: el tamaño del mundo depende de la era
renderHUD();

const t0 = performance.now();
setTimeout(() => { nacimientosVivos = true; }, 1000); // a partir de aquí, lo que aparezca se ve nacer
/* la economía late en setInterval: sigue viva aunque la pestaña quede en segundo plano
   (Chrome congela requestAnimationFrame en pestañas ocultas; el render sí puede dormir) */
let lastTick = performance.now();
setInterval(() => {
  if (tabCongelada) return; // otra pestaña tomó la partida: aquí ni se simula ni se guarda
  if (enPausa()) { lastTick = performance.now(); return; } // con la portada abierta el juego espera (A2)
  const now = performance.now();
  let dt = ((now - lastTick) / 1000) * warp;
  lastTick = now;
  if (dt > 600) { // el equipo durmió (suspensión, tapa cerrada): ponerse al día como cargar(), hasta 8 h
    recuperarAusencia(Math.min(dt, 8 * 3600)); // antes esto topaba en 600 pasos y el resto se PERDÍA hasta recargar
    guardar(); renderHUD();
    return;
  }
  const alDia = dt < 12; // si venimos de un letargo corto (más que un warp), ponerse al día sin spamear avisos
  let pasos = 0;
  while (dt > 0 && pasos < 600) {
    const paso = Math.min(1, dt);
    tick(paso, !alDia);
    dt -= paso; pasos++;
  }
  renderHUD();
}, 250);
function frame(now) {
  try { (LUMBRE.dibujar || frameInner)(now); } catch (e) { window.__err = e.message + ' | ' + (e.stack || '').split('\n')[1]; } // otro renderizador (Lumbre 3D) dibuja el cuadro con LUMBRE.dibujar
  requestAnimationFrame(frame); // el bucle sobrevive a cualquier frame malo
}
/* EL PASO DEL CUADRO, SIN DIBUJAR NADA (2026-09-28): los relojes, el viaje de la cámara y las luces que
   nacen en cada época. Lo comparten el dibujo 2D (frameInner) y cualquier otro renderizador (Lumbre 3D),
   así la lógica de una época se escribe una sola vez. Devuelve el reloj de animación y su delta. */
function avanzarCuadro(now) {
  // El TIEMPO DE ANIMACIÓN se acumula con el delta ACOTADO a 50 ms. Antes era reloj de pared puro
  // (`(now - t0)/1000`): si un frame se retrasaba (GC, el compositor, el audio arrancando…), `t` saltaba
  // y TODOS los personajes se teletransportaban de golpe. Ahora un frame perdido pausa un instante y sigue
  // suave, en vez de dar el brinco. El reloj de la economía sigue siendo real (setInterval), aparte.
  if (__animPrev === null || now < __animPrev) __animPrev = now;
  const dtAnim = Math.min((now - __animPrev) / 1000, 0.05);
  /* La ANIMACIÓN se acelera con el warp, pero con tope. A ×20 un paso de zancada avanzaría más de una
     vuelta entera por frame y el clan volvería a verse estroboscópico, que es justo lo que arreglamos.
     Así que los ciclos del cuerpo (andar, humo, agua) corren hasta ×6 y de ahí no pasan, mientras el
     MUNDO (día y noche, el año, la economía) sí va a la velocidad que pediste: es lo que quieres ver
     cuando aceleras. */
  tFrame += dtAnim * Math.min(warp, 6);
  avanzarRelojVisual(dtAnim);
  avanzarFuegoVisual(dtAnim); // el leño sube la brasa de golpe: que la gente se ACERQUE, no que salte
  vestirSombra();             // la sombra del día: nítida al sol, disuelta de noche (una vez por frame)
  __animPrev = now;
  const t = tFrame;
  vigilarEstacion(dtAnim);   // el suelo está pre-renderizado: hay que repintarlo cuando gira el año
  if (camTween) { // el paseo suave de la cámara hacia la guía; al llegar, un anillo señala el lugar
    const k = MOV_REDUCIDO ? 1 : smooth((now - camTween.t0) / 700);   // con movimiento reducido, la cámara salta
    ox = camTween.x0 + (camTween.x1 - camTween.x0) * k;
    oy = camTween.y0 + (camTween.y1 - camTween.y0) * k;
    if (k >= 1) { fx.anillos.push({ born: performance.now(), x: camTween.gx, y: camTween.gy }); clampCam(); camTween = null; }
  }
  colectibles = colectibles.filter(n => t - n.born < (n.mat ? 30 : 13)); // materiales pacientes, chispa fugaz
  const preFuego = ordEra(S.era) < 11 && !S.fuegoDescubierto;
  if (!preFuego && t > nextColect) {
    if (S.era === 1) {
      // las luces solo ofrecen lo que aún sirve; si ya está todo cubierto, brilla la chispa de curiosidad
      if (colectibles.length < 3) {
        const pool = MATERIALES.filter(m => (m.era || 1) === 1 && m.k !== 'grano' && !matSobra(m.k)); // el grano se cosecha, no se forrajea; el barro es de Sumer
        // primero QUÉ y después DÓNDE: cada material nace en su querencia (ver QUERENCIA en 11-materiales)
        const mat = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
        const donde = { ...puntoDeForrajeo(mat), born: t };
        const esChispa = !mat; // cuando ya no falta ningún material, la luz que nace es la chispa de curiosidad
        colectibles.push(esChispa ? donde : { ...donde, mat });
        if (esChispa && !S.vioChispa) { S.vioChispa = true; toast('✨ <b>La chispa de curiosidad.</b> Aparece sola de vez en cuando: tócala antes de que se apague y suma saber extra.', 11000); } // se estrena en su época de debut
      }
      nextColect = t + 5 + Math.random() * 5;
    } else if (S.era === 2 && colectibles.length < 2) {
      // SUMER: el río deja barro en la ribera (la querencia del material de la época); si ya sobra, la chispa
      const mBarro = MATERIALES.find(m => m.k === 'barro');
      const conBarro = !matSobra('barro');
      const donde = conBarro ? { ...puntoDeForrajeo(mBarro), born: t } : { ...puntoDeChispa(), born: t, mat: null };
      colectibles.push(conBarro ? { ...donde, mat: mBarro } : donde);
      nextColect = t + 7 + Math.random() * 6;
      if (!conBarro && !S.vioChispa) { S.vioChispa = true; toast('✨ <b>La chispa de curiosidad.</b> Aparece sola por el mundo de vez en cuando: tócala antes de que se apague y suma saber extra.', 11000); }
    } else if (S.era === 3 && colectibles.length < 2) {
      // EGIPTO: los juncales dejan tallos de papiro (la querencia del material de la época, y es ESCASO a propósito: la hoja cara); si ya sobra, la chispa
      const mPap = MATERIALES.find(m => m.k === 'papiro');
      const conPap = !matSobra('papiro');
      const donde = conPap ? { ...puntoDeForrajeo(mPap), born: t } : { ...puntoDeChispa(), born: t, mat: null };
      colectibles.push(conPap ? { ...donde, mat: mPap } : donde);
      nextColect = t + 8 + Math.random() * 7;
      if (!conPap && !S.vioChispa) { S.vioChispa = true; toast('✨ <b>La chispa de curiosidad.</b> Aparece sola por el mundo de vez en cuando: tócala antes de que se apague y suma saber extra.', 11000); }
    } else if (S.era === 4 && colectibles.length < 2) {
      // ATENAS: las colmenas del olivar dejan cera (el material de la época; cada duda gasta una tablilla); si ya sobra, la chispa
      const mCera = MATERIALES.find(m => m.k === 'cera');
      const conCera = !matSobra('cera');
      const donde = conCera ? { ...puntoDeForrajeo(mCera), born: t } : { ...puntoDeChispa(), born: t, mat: null };
      colectibles.push(conCera ? { ...donde, mat: mCera } : donde);
      nextColect = t + 8 + Math.random() * 7;
      if (!conCera && !S.vioChispa) { S.vioChispa = true; toast('✨ <b>La chispa de curiosidad.</b> Aparece sola por el mundo de vez en cuando: tócala antes de que se apague y suma saber extra.', 11000); }
    } else if (S.era === 5 && colectibles.length < 2) {
      // ALEJANDRÍA: el juncal del Mareotis deja papiro (el material de la época: cada copia de un rollo lo gasta); si ya sobra, la chispa
      const mPap = MATERIALES.find(m => m.k === 'papiro');
      const conPap = (S.mats.papiro || 0) < (rollosAbierto() ? 6 : matPendiente('papiro') + 4);   // con los barcos, el papiro tiene sumidero continuo: se junta un respiro
      const donde = conPap ? { ...puntoDeForrajeo(mPap), born: t } : { ...puntoDeChispa(), born: t, mat: null };
      colectibles.push(conPap ? { ...donde, mat: mPap } : donde);
      nextColect = t + 8 + Math.random() * 7;
      if (!conPap && !S.vioChispa) { S.vioChispa = true; toast('✨ <b>La chispa de curiosidad.</b> Aparece sola por el mundo de vez en cuando: tócala antes de que se apague y suma saber extra.', 11000); }
    } else if (S.era === 14 && colectibles.length < 2) {
      // ROMA: la orilla del Tíber deja calculi (cada niño que pasa del ludus gasta uno); si ya sobra, la chispa
      const mCa = MATERIALES.find(m => m.k === 'calculi');
      const conCa = (S.mats.calculi || 0) < (ludusAbierto() ? 12 : matPendiente('calculi') + 4);
      const donde = conCa ? { ...puntoDeForrajeo(mCa), born: t } : { ...puntoDeChispa(), born: t, mat: null };
      colectibles.push(conCa ? { ...donde, mat: mCa } : donde);
      nextColect = t + 7 + Math.random() * 6;
      if (!conCa && !S.vioChispa) { S.vioChispa = true; toast('✨ <b>La chispa de curiosidad.</b> Aparece sola por el mundo de vez en cuando: tócala antes de que se apague y suma saber extra.', 11000); }
    } else if (S.era === 15 && colectibles.length < 2) {
      // KAIFENG: el horno de hollín, junto a los pinos al pie de la muralla, deja tinta desde que abre la escuela de la prefectura (la pide la
      // imprenta de los clásicos); antes, o si ya sobra, la chispa
      const mTi = MATERIALES.find(m => m.k === 'tinta');
      const conTi = S.tecs[81] && S.tecs[81].fase !== 'sin' && (S.mats.tinta || 0) < matPendiente('tinta') + 4;
      const donde = conTi ? { ...puntoDeForrajeo(mTi), born: t } : { ...puntoDeChispa(), born: t, mat: null };
      colectibles.push(conTi ? { ...donde, mat: mTi } : donde);
      nextColect = t + 8 + Math.random() * 7;
      if (!conTi && !S.vioChispa) { S.vioChispa = true; toast('✨ <b>La chispa de curiosidad.</b> Aparece sola por el mundo de vez en cuando: tócala antes de que se apague y suma saber extra.', 11000); }
    } else if (S.era === 21 && colectibles.length < (tutorFu() ? 3 : 2)) {   // con el tutor, hasta tres luces a la vez: la atención es lo escaso
      // EL VALLE: la atención se junta en los lugares tranquilos (la orilla de la laguna, la sombra de los árboles grandes, la
      // entrada de la cueva) desde que hay tutor que pregunta; antes, o si ya sobra, la chispa
      const mAt = MATERIALES.find(m => m.k === 'atencion');
      const conAt = S.tecs[87] && S.tecs[87].fase !== 'sin' && (S.mats.atencion || 0) < (tutorFu() ? 8 : matPendiente('atencion') + 4);   // desde la escuela del valle: el tutor la pide para crearse
      const donde = conAt ? { ...puntoDeForrajeo(mAt), born: t } : { ...puntoDeChispa(), born: t, mat: null };
      colectibles.push(conAt ? { ...donde, mat: mAt } : donde);
      nextColect = t + (conAt ? 5 + Math.random() * 4 : 7 + Math.random() * 6);
      if (!conAt && !S.vioChispa) { S.vioChispa = true; toast('✨ <b>La chispa de curiosidad.</b> Aparece sola por el mundo de vez en cuando: tócala antes de que se apague y suma saber extra.', 11000); }
    } else if (S.era === 10 && colectibles.length < 2) {
      // SANTIAGO: la diligencia de Valparaíso deja pizarras (cada normalista lleva las suyas); si ya sobra, la chispa
      const mPz = MATERIALES.find(m => m.k === 'pizarra');
      const conPz = (S.mats.pizarra || 0) < (normalAbierta() ? 8 : matPendiente('pizarra') + 4);
      const donde = conPz ? { ...puntoDeForrajeo(mPz), born: t } : { ...puntoDeChispa(), born: t, mat: null };
      colectibles.push(conPz ? { ...donde, mat: mPz } : donde);
      nextColect = t + 8 + Math.random() * 7;
      if (!conPz && !S.vioChispa) { S.vioChispa = true; toast('✨ <b>La chispa de curiosidad.</b> Aparece sola por el mundo de vez en cuando: tócala antes de que se apague y suma saber extra.', 11000); }
    } else if (S.era === 9 && colectibles.length < 2) {
      // ÁMSTERDAM: el molino de papel, sobre el bastión, deja pliegos (cada tirada gasta uno); si ya sobra, la chispa
      const mPl = MATERIALES.find(m => m.k === 'pliego');
      const conPl = (S.mats.pliego || 0) < (prensaAbierta() ? 10 : matPendiente('pliego') + 4);
      const donde = conPl ? { ...puntoDeForrajeo(mPl), born: t } : { ...puntoDeChispa(), born: t, mat: null };
      colectibles.push(conPl ? { ...donde, mat: mPl } : donde);
      nextColect = t + 6 + Math.random() * 6;
      if (!conPl && !S.vioChispa) { S.vioChispa = true; toast('✨ <b>La chispa de curiosidad.</b> Aparece sola por el mundo de vez en cuando: tócala antes de que se apague y suma saber extra.', 11000); }
    } else if (S.era === 8 && colectibles.length < 2) {
      // PARÍS: el taller del pergaminero, junto al Sena, deja pergamino (el scriptorium gasta uno por libro); en el verano, la feria del Lendit trae el doble
      const mPg = MATERIALES.find(m => m.k === 'pergamino'), lendit = estacion().i === 1;
      const conPg = (S.mats.pergamino || 0) < (scriptoriumAbierto() ? 8 : matPendiente('pergamino') + 4);
      const donde = conPg ? { ...puntoDeForrajeo(mPg), born: t } : { ...puntoDeChispa(), born: t, mat: null };
      colectibles.push(conPg ? { ...donde, mat: mPg } : donde);
      nextColect = t + (lendit ? 4 : 8) + Math.random() * (lendit ? 4 : 7);
      if (!conPg && !S.vioChispa) { S.vioChispa = true; toast('✨ <b>La chispa de curiosidad.</b> Aparece sola por el mundo de vez en cuando: tócala antes de que se apague y suma saber extra.', 11000); }
    } else if (S.era === 7 && colectibles.length < 2) {
      // TENOCHTITLAN: las canoas del tributo dejan amate en el embarcadero (cada estudiante del calmécac gasta un pliego); si ya sobra, la chispa
      const mAm = MATERIALES.find(m => m.k === 'amate');
      const conAm = (S.mats.amate || 0) < (calmecacAbierto() ? 6 : matPendiente('amate') + 4);
      const donde = conAm ? { ...puntoDeForrajeo(mAm), born: t } : { ...puntoDeChispa(), born: t, mat: null };
      colectibles.push(conAm ? { ...donde, mat: mAm } : donde);
      nextColect = t + 8 + Math.random() * 7;
      if (!conAm && !S.vioChispa) { S.vioChispa = true; toast('✨ <b>La chispa de curiosidad.</b> Aparece sola por el mundo de vez en cuando: tócala antes de que se apague y suma saber extra.', 11000); }
    } else if (S.era === 6 && colectibles.length < 2) {
      // BAGDAD: el molino del canal deja papel (el material de la época: cada traducción se copia en una hoja); si ya sobra, la chispa
      const mPap = MATERIALES.find(m => m.k === 'papel');
      const conPap = (S.mats.papel || 0) < (mesaAbierta() ? 6 : matPendiente('papel') + 4);
      const donde = conPap ? { ...puntoDeForrajeo(mPap), born: t } : { ...puntoDeChispa(), born: t, mat: null };
      colectibles.push(conPap ? { ...donde, mat: mPap } : donde);
      nextColect = t + 8 + Math.random() * 7;
      if (!conPap && !S.vioChispa) { S.vioChispa = true; toast('✨ <b>La chispa de curiosidad.</b> Aparece sola por el mundo de vez en cuando: tócala antes de que se apague y suma saber extra.', 11000); }
    } else if (colectibles.length < 1) {
      colectibles.push({ x: 4.5 + Math.random() * 8.5, y: 9 + Math.random() * 5, born: t, mat: null });
      nextColect = t + 14 + Math.random() * 11;
      if (!S.vioChispa) { S.vioChispa = true; toast('✨ <b>La chispa de curiosidad.</b> Aparece sola por el mundo de vez en cuando: tócala antes de que se apague y suma saber extra.', 11000); }
    }
  }
  return { t, dtAnim };
}
function frameInner(now) {
  const { t } = avanzarCuadro(now);

  // cielo y nubes
  const sky = g.createLinearGradient(0, 0, 0, H);
  let cieloA, cieloB;
  if (ordEra(S.era) >= 11) { cieloA = PAL.cieloAlto; cieloB = PAL.cieloBajo; }
  else if (!S.fuegoDescubierto) { cieloA = '#5f6382'; cieloB = '#b3a0a8'; }          // crepúsculo frío antes del fuego
  else { const L = luzDia(); cieloA = lerpHex('#161d3a', '#de8a52', L); cieloB = lerpHex('#2c3a5c', '#f6d9a0', L); } // día cálido ↔ noche profunda
  sky.addColorStop(0, cieloA); sky.addColorStop(1, cieloB);
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  drawEstrellas(t);
  drawNubes(t, 'lejos');
  const kCam = zoom / zoom0;
  g.drawImage(terrain, kCam * (terrX - ox0) + ox, kCam * (terrY - oy0) + oy, terrW * kCam, terrH * kCam);
  drawSombrasNube(t);
  if (S.era === 1) drawAguaViva(t); // los destellos de la laguna: su rectángulo es del fogón, no de otras aguas
  drawPeces(t);      // el banco de la laguna: nadan bajo el agua y de tanto en tanto uno salta
  drawRioVivo(t);    // y el río de Sumer corre: la corriente, sus peces y el salto
  drawJuncosVivos(t); // las matas de la orilla se mecen con la brisa (las del terreno están clavadas)
  drawBandada(t);     // la V de garzas del amanecer y el atardecer
  spawnFx(t, tasa());
  ambientes(t);

  // props + aparatos comprados + personajes, por profundidad
  GENTE_CLIC.length = 0;
  const drawables = PROPS.map(p => ({ d: p.d, fn: () => p.draw(t) }));
  if (ordEra(S.era) >= 11 && S.tecs[0].fase !== 'sin') drawables.push({ d: 4.4 + 7.8, fn: () => drawPizarraTec(t) });
  if (ordEra(S.era) >= 11 && (S.tecs[1].fase !== 'sin' || S.tecs[5].fase !== 'sin')) drawables.push({ d: 8.5, fn: () => drawPantalla(t) });
  if (ordEra(S.era) >= 11 && S.tecs[1].fase !== 'sin') drawables.push({ d: 10.0, fn: () => drawLinterna(t) });
  if (ordEra(S.era) >= 12 && S.tecs[5].fase !== 'sin') drawables.push({ d: 11.2, fn: () => drawFilminas(t) });
  if (ordEra(S.era) >= 11 && S.tecs[2].fase !== 'sin') drawables.push({ d: 13.4 + 6.4, fn: () => drawGramofono(t) });
  if (ordEra(S.era) >= 11 && S.tecs[3].fase !== 'sin') drawables.push({ d: 2.8 + 10.3 + 0.9, fn: () => drawBiblioteca(t) });
  if (ordEra(S.era) >= 12 && S.tecs[4].fase !== 'sin') drawables.push({ d: 6.9 + 12.1, fn: () => drawRadio(t) });
  if (ordEra(S.era) >= 12 && S.tecs[6].fase !== 'sin') {
    drawables.push({ d: 23.0, fn: () => drawCine(t) });
    if (S.tecs[6].fase === 'meseta') { tocable(15.1, 8.75, { k: 'cine0' }); tocable(15.65, 9.0, { k: 'cine1' }); } // el público de la función
  }
  if (S.era === 1) { // época 1: el fogón y su círculo
    if (S.edad < 2) { // el mamut y la caza pertenecen al Paleolítico
      const pmam = posMamut(t);
      if (pmam.visible) {
        drawables.push({ d: pmam.x + pmam.y, fn: () => drawMamut(t) });
        tocable(pmam.x, pmam.y, { k: 'mamut' });
      } else if ((S.criaSaleT || 0) > 0) drawables.push({ d: pmam.x + pmam.y, fn: () => drawCriaMamut(t, pmam) }); // por si la cría aún trota sola
      if (S.tecs[15] && S.tecs[15].fase !== 'sin') { // la lección de caza: en equipo, con plan… y el mamut gana igual
        const nCaz = Math.min(6, ((S.tecs[15].fase === 'meseta' || S.cazaOn) ? 3 : 2) + nivelTec(15)); // la partida suma manos con cada etapa
        for (let i = 0; i < nCaz; i++) {
          const q = posCazador(i, t);
          drawables.push({ d: q.x + q.y + .01, fn: () => nacerEn('cazador' + i, () => drawCazador(i, t)) });
          tocable(q.x, q.y, { k: 'caza' + i });
        }
        const pm = P(pmam.x, pmam.y);
        drawables.push({ d: pmam.x + pmam.y + .03, fn: () => estadoTec(15, { x: pm.x, y: pm.y - 52 * zoom }, t) });
      }
    }
    const [tcx, tcy] = S.edad >= 2 ? [2.5, 13.1] : [4.0, 12.9]; // el tronco caído deja lugar a la tierra arada
    drawables.push({ d: tcx + tcy, fn: () => drawTroncoCaido(tcx, tcy, 0.18) });
    drawables.push({ d: 12.4 + 5.6, fn: () => drawTroncoCaido(12.4, 5.6, -0.12) });
    drawables.push({ d: 14.6 + 6.6, fn: () => drawArbolSeco(14.6, 6.6) });
    drawables.push({ d: 3.3 + 13.9, fn: () => drawRoca(3.3, 13.9, 1.6) });
    drawables.push({ d: 16.8 + 8.7, fn: () => drawRoca(16.8, 8.7, 1.4) });
    drawables.push({ d: 6.5 + 9.5, fn: () => drawFogata(t) }); if (S.era === 1) tocable(6.5, 9.5, { k: 'fogata' }); // tocable también APAGADO: frotar las varas es el primer gesto, y vive en el mundo
    if (S.fuegoDescubierto) {
      drawables.push({ d: 5.85 + 9.15 + .01, fn: () => drawSentadito(5.85, 9.15, 0, t) }); tocable(5.85, 9.15, { k: 'circulo0' });
      drawables.push({ d: 6.35 + 10.2 + .01, fn: () => drawSentadito(6.35, 10.2, 1, t) }); tocable(6.35, 10.2, { k: 'circulo1' });
      drawables.push({ d: 7.4 + 9.85 + .01, fn: () => drawSentadito(7.4, 9.85, 2, t) }); tocable(7.4, 9.85, { k: 'circulo2' });
    }
    if (S.tecs[11] && S.tecs[11].fase !== 'sin') drawables.push({ d: 7.7 + 10.4, fn: () => drawTambor(t) });
    if (S.tecs[13] && S.tecs[13].fase !== 'sin') drawables.push({ d: 5.3 + 8.4, fn: () => drawHueso(t) });
    // la regla de la acción: todo aparato dominado tiene a alguien usándolo
    if (S.tecs[10] && S.tecs[10].fase === 'meseta') { drawables.push({ d: 7.15 + 10.72 + .03, fn: () => drawNarrador(t) }); tocable(7.15, 10.72, { k: 'narrador' }); } // el círculo aprendido se usa: alguien narra
    { const nC = nivelTec(10); // MÁXIMA: el corro se agranda con cada etapa, que para eso se perfecciona
      [[5.55, 10.15, 1], [7.05, 9.05, 0], [7.75, 10.05, 2]].slice(0, nC).forEach(([cx, cy, v], k) => {
        drawables.push({ d: cx + cy + .01, fn: () => nacerEn('corro' + k, () => drawSentadito(cx, cy, v, t)) }); tocable(cx, cy, { k: 'circulo' + (3 + k) });
      }); }
    if (S.tecs[12] && S.tecs[12].fase === 'meseta') { drawables.push({ d: 11.35 + 7.15 + .05, fn: () => drawPintor(t) }); tocable(11.35, 7.15, { k: 'pintor' }); }
    if (S.tecs[11] && S.tecs[11].fase === 'meseta') { drawables.push({ d: 8.25 + 10.7 + .01, fn: () => drawSentadito(8.25, 10.7, 2, t, { lado: -1, ritmo: 5.2 }) }); tocable(8.25, 10.7, { k: 'percu' }); }      // percusionista
    if (S.tecs[13] && S.tecs[13].fase === 'meseta') { drawables.push({ d: 4.75 + 8.95 + .01, fn: () => drawSentadito(4.75, 8.95, 0, t, { lado: 1, ritmo: 2.1, ph: 0.5 }) }); tocable(4.75, 8.95, { k: 'cuentero' }); }    // el que cuenta
    if (S.edad >= 2) { // el asentamiento neolítico: la aldea alrededor del fuego
      // el arco de chozas crece hacia el OESTE: la tercera vivía incrustada en el peñón, tapando la
      // boca de la caverna y rozando el mural (visto jugando, 2026-08-02)
      [[4.7, 5.8], [5.8, 6.6], [7.6, 6.15]].forEach(([cx, cy], ci) => { drawables.push({ d: cx + cy, fn: () => drawChoza(cx, cy, 1, t) }); tocable(cx, cy, { k: 'choza' + ci }); });
      // la parcela va de (3.6,10.2) a (5.7,12.1): 128×64 px en pantalla. Se toca ENTERA, no en su centro
      if (S.tecs[24].fase !== 'sin') { drawables.push({ d: 4.6 + 11.1, fn: () => drawCampoCebada(t) }); (() => { const R = campoRect(), cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2;
          tocable(cx, cy, { k: 'campo' }, { rx: (R.x1 - R.x0) * 32 * 0.94, ry: (R.y1 - R.y0) * 16 * 0.94, dy: 0, gana: (S.cultivo || 0) >= 1 }); })(); }
      if (S.tecs[24].fase === 'meseta') { drawables.push({ d: 5.4 + 11.9 + .02, fn: () => drawSentadito(5.4, 11.9, 0, t, { lado: 1, ritmo: 1.2, ph: 3 }) }); tocable(5.4, 11.9, { k: 'labrador' }); }
      if (S.tecs[25].fase !== 'sin') { // el corral: cerco + rebaño
        const cr = corralRect();
        drawables.push({ d: (cr.x0 + cr.x1) / 2 + (cr.y0 + cr.y1) / 2 - .12, fn: () => {
          drawCerca(cr.x0, cr.y0, cr.x1, cr.y0); drawCerca(cr.x0, cr.y1, cr.x1, cr.y1);
          drawCerca(cr.x0, cr.y0, cr.x0, cr.y1); drawCerca(cr.x1, cr.y0, cr.x1, cr.y1); } });
        rebano().forEach((ov, i) => {
          const o = posOveja(ov.x0, ov.y0, ov.ph, t, cr);
          drawables.push({ d: o.x + o.y + .02, fn: () => nacerEn('oveja' + i, () => drawOveja(ov.x0, ov.y0, ov.ph, t, cr)) });
          tocable(o.x, o.y, { k: 'coveja' + Math.min(i, 4) }); // cada oveja del rebaño tiene su nombre
        });
        if (S.tecs[25].fase === 'meseta') { drawables.push({ d: 11.1 + 11.9 + .02, fn: () => drawSentadito(11.1, 11.9, 1, t) }); tocable(11.1, 11.9, { k: 'pastor' }); }
      }
      if (S.tecs[26].fase !== 'sin') { drawables.push({ d: 9.6 + 8.5, fn: () => drawVasijas(9.6, 8.5) }); if (S.tecs[26].fase === 'meseta') { drawables.push({ d: 10.2 + 8.75 + .02, fn: () => drawSentadito(10.2, 8.75, 2, t, { lado: -1, ritmo: 1.6 }) }); tocable(10.2, 8.75, { k: 'alfarero' }); } }
      if (S.tecs[27].fase !== 'sin') { drawables.push({ d: 8.2 + 7.8, fn: () => drawTelar(8.2, 7.8, 1, t) }); if (S.tecs[27].fase === 'meseta') { drawables.push({ d: 8.9 + 8.05 + .02, fn: () => drawSentadito(8.9, 8.05, 0, t, { lado: -1, ritmo: 2.6, ph: 1 }) }); tocable(8.9, 8.05, { k: 'tejedor' }); } }
      // el rincón del curtido: la cacería perfeccionada tras colgar las lanzas (cada etapa deja su pieza)
      if (S.tecs[15] && S.tecs[15].fase === 'meseta' && nivelTec(15) >= 1) {
        drawables.push({ d: 4.6 + 7.6, fn: () => nacerEn('curtido', () => drawCurtido(4.6, 7.6, t)) });
        drawables.push({ d: 5.15 + 7.85 + .02, fn: () => drawSentadito(5.15, 7.85, 1, t, { lado: -1, ritmo: 1.9, ph: 2 }) }); tocable(5.15, 7.85, { k: 'curtidora' });
      }
      if (S.granero) { // el almacén del excedente, y Sena que va y viene
        drawables.push({ d: 3.3 + 9.0, fn: () => drawGranero(3.3, 9.0, t) }); tocable(3.3, 9.0, { k: 'granero' });
        const ac = posAcarreador(t), scrA = P(ac.x, ac.y);
        drawables.push({ d: ac.x + ac.y + 0.05, fn: () => {
          drawAlumno(scrA.x, scrA.y, ac.dir, t * 5, 2);
          if (ac.carga) { drawMaterialForma({ x: scrA.x + ac.dir * 6 * zoom, y: scrA.y - 20 * zoom }, zoom * 0.8, 'grano'); } // el cesto de espigas al hombro
        } });
        tocable(ac.x, ac.y, { k: 'acarreadora' });
      }
      for (let i = 0; i < 2; i++) { // el corro: dos niños se persiguen alrededor de la choza del medio
        const a = t * 1.15 + i * Math.PI, nx = 7.6 + Math.cos(a) * 1.05, ny = 6.45 + Math.sin(a) * 0.7;
        const scrN = P(nx, ny), dirN = (-Math.sin(a) * 1.05 - Math.cos(a) * 0.7) >= 0 ? 1 : -1;
        drawables.push({ d: nx + ny + 0.05, fn: () => { g.save(); g.translate(scrN.x, scrN.y); g.scale(0.8, 0.8); g.translate(-scrN.x, -scrN.y); drawAlumno(scrN.x, scrN.y, dirN, t * 8 + i * 3, i + 1); g.restore(); } });
        tocable(nx, ny, { k: 'nino' + i });
      }
    }
  }
  if (S.era === 2) { // época 2: el patio de la edubba
    drawables.push({ d: 4.4 + 1.8, fn: () => drawGranZigurat(t) });
    drawables.push({ d: 4.4 + 1.8 + .01, fn: () => drawVidaTemplo(t) });   // el sacerdote y el humo de la corona
    { const of = posOferente(t);
      drawables.push({ d: of.x + of.y + (of.z > 1 ? 2 : 0) + .02, fn: () => drawOferente(t) });
      if ((of.alpha || 0) > 0.6 && of.z < 1) tocable(of.x, of.y, { k: 'oferente' }); } // clickeable cuando anda por tierra
    tocable(6.0, 3.4, { k: 'santuario' }, { rx: 34, ry: 30, dy: 86 });  // el Eanna, en su corona (dy POSITIVO = la zona sube; el negativo la hundía en la panza del templo, visto jugando 2026-08-05)
    tocable(6.0, 4.15, { k: 'sacerdote' }, { rx: 13, ry: 15, dy: 74 });
    if (S.tecs[30] && S.tecs[30].fase !== 'sin') tocable(9.5, 6.6, { k: 'edubbaCasa' }, { rx: 50, ry: 30, dy: 16 }); // la casa se explica
    tocable(4.6, 11.1, { k: 'cebadatemplo' }, { rx: 40 * zoom, ry: 22 * zoom, dy: 0 });        // el campo del templo también
    { const bv = posBarca(t); const RA = { x: 19.0 + (9.0 - 19.0) * bv.u, y: 6.8 + (18.6 - 6.8) * bv.u }; // anclada a su punto del río
      drawables.push({ d: RA.x + RA.y + .02, fn: () => drawBarcaViajera(t) });
      tocable(RA.x, RA.y, { k: 'barcaviajera' }); }
    for (const iz of (S.azolves || [])) { const [ax, ay] = AZOLVE_SITIOS[iz]; drawables.push({ d: ax + ay + .01, fn: () => drawAzolve(iz, t) }); tocable(ax, ay, { k: 'azolve' + iz }); } // la corvea late en los canales
    drawables.push({ d: 4.25 + 11.55 + .03, fn: () => drawSegador(4.25, 11.55, 0, t) }); tocable(4.25, 11.55, { k: 'segador0' });
    drawables.push({ d: 4.75 + 10.75 + .03, fn: () => drawSegador(4.75, 10.75, 2.6, t) }); tocable(4.75, 10.75, { k: 'segador1' });
    drawables.push({ d: 6.0 + 8.0 + .01, fn: () => drawLamassu(6.0, 8.0, 1, t) }); tocable(6.0, 8.0, { k: 'lamassu0' });
    drawables.push({ d: 11.0 + 3.0 + .01, fn: () => drawLamassu(11.0, 3.0, -1, t) }); tocable(11.0, 3.0, { k: 'lamassu1' });
    drawables.push({ d: 12.0 + 9.0 + .01, fn: () => drawEstatuaRey(12.0, 9.0) }); tocable(12.0, 9.0, { k: 'estatuaRey' });
    drawables.push({ d: 2.8 + 4.7, fn: () => drawPalmera(2.8, 4.7, 0, t) });
    drawables.push({ d: 16.0 + 5.7, fn: () => drawPalmera(16.0, 5.7, 2.4, t) });
    drawables.push({ d: 4.0 + 13.0, fn: () => drawPalmera(4.0, 13.0, 4.1, t) });
    drawables.push({ d: 15.9 + 13.0, fn: () => drawPalmera(15.9, 13.0, 1.7, t) }); // las datileras de la ribera
    drawables.push({ d: 10.3 + 14.3, fn: () => drawPalmera(10.3, 14.3, 5.6, t) });
    drawables.push({ d: 11.9 + 7.1, fn: () => drawVasijas(11.9, 7.1) });
    drawables.push({ d: 15.0 + 12.35, fn: () => drawBarcaJuncos(t) });
    drawables.push({ d: 4.6 + 11.1 - .05, fn: () => drawCampoCebada(t) });
    { const c0 = { x0: 4.5, y0: 11.9, x1: 5.7, y1: 13.1 }; const o = posOveja(5.1, 12.5, 0, t, c0); drawables.push({ d: o.x + o.y, fn: () => drawOveja(5.1, 12.5, 0, t, c0) }); tocable(o.x, o.y, { k: 'oveja0' }); }
    { const c1 = { x0: 3.3, y0: 9.4, x1: 4.5, y1: 10.6 }; const o = posOveja(3.9, 10.0, 2.6, t, c1); drawables.push({ d: o.x + o.y, fn: () => drawOveja(3.9, 10.0, 2.6, t, c1) }); tocable(o.x, o.y, { k: 'oveja1' }); }
    drawables.push({ d: 10.95 + 9.05 + .1, fn: () => drawToldo(t) });
    // LA NOCHE DE LA EDUBBA: los candiles se encienden al caer la tarde (de día son cuencos de barro)
    drawables.push({ d: 11.45 + 8.85 + .02, fn: () => drawLampara(11.45, 8.85, 2, t, 0) });        // al borde del toldo
    if (S.tecs[19] && S.tecs[19].fase === 'meseta') drawables.push({ d: 9.95 + 9.35 + .02, fn: () => drawLampara(9.95, 9.35, 1, t, 2.4) });  // junto a la mesa de copia
    if (S.tecs[30] && S.tecs[30].fase !== 'sin') drawables.push({ d: 9.5 + 8.15 + .02, fn: () => drawLampara(9.5, 8.15, 3, t, 4.1) });       // la puerta de la edubba
    if (S.tecs[16] && S.tecs[16].fase !== 'sin') { // la regla de la acción, versión edubba
      drawables.push({ d: 11.3 + 6.3, fn: () => drawMesaTablillas(t) });
      if (nivelTec(16) >= 3) { const acT = posAcarreoT(t); drawables.push({ d: acT.x + acT.y + .03, fn: () => drawAcarreoT(t) }); } // la tablilla viaja al horno
      if (S.tecs[16].fase === 'meseta') { drawables.push({ d: 11.15 + 6.9 + .01, fn: () => drawSentadito(11.15, 6.9, 0, t, { lado: 1, ritmo: 2.3 }) }); tocable(11.15, 6.9, { k: 'copista' }); }
    }
    if (S.tecs[17] && S.tecs[17].fase !== 'sin') {
      drawables.push({ d: 10.2 + 7.9, fn: () => drawCanas(t) });
      // la práctica de la cuña junto a las cañas: la mano se educa a fuerza de barro (regla de la acción)
      if (S.tecs[17].fase === 'meseta') { drawables.push({ d: 10.45 + 7.55 + .01, fn: () => drawSentadito(10.45, 7.55, 1, t, { lado: -1, ritmo: 2.7, ph: 1.4 }) }); tocable(10.45, 7.55, { k: 'practicante' }); }
    }
    if (S.tecs[29] && S.tecs[29].fase === 'meseta') { // EL DICTADO (saber 29): la que dicta, y las tablillas que corren
      const n29e = nivelTec(29); // LAS ETAPAS SE VEN: la estera de espera (1), el corro del turno (2), el coral (3)
      if (n29e >= 1) drawables.push({ d: 9.35 + 9.55 + .005, fn: () => nacerEn('dict-est', () => drawEtapasDictado(t, 'estera')) });
      if (n29e >= 2) {
        drawables.push({ d: 9.3 + 9.15 + .01, fn: () => nacerEn('dict-c0', () => drawSentadito(9.3, 9.15, 1, t)) });
        drawables.push({ d: 9.65 + 9.75 + .01, fn: () => nacerEn('dict-c1', () => drawSentadito(9.65, 9.75, 2, t)) });
      }
      if (n29e >= 3) drawables.push({ d: 11.85 + 9.85 + .01, fn: () => nacerEn('dict-coral', () => drawEtapasDictado(t, 'coral')) });
      drawables.push({ d: 9.9 + 8.4 + .01, fn: () => drawSentadito(9.9, 8.4, 1, t, { lado: 1, ritmo: 1.1 }) }); tocable(9.9, 8.4, { k: 'dictado' });
      drawables.push({ d: 10.6 + 8.55 + .01, fn: () => drawSentadito(10.6, 8.55, 2, t, { lado: -1, ritmo: 3.1 }) }); tocable(10.6, 8.55, { k: 'dictado2' });
      for (let dd = 0; dd < (S.diadasDict || 0); dd++) { // los sitios que TÚ abriste, uno por etapa
        const D = DIADAS_DICT[Math.min(dd, DIADAS_DICT.length - 1)];
        drawables.push({ d: D.x + D.y + .01, fn: () => nacerEn('dictx' + dd, () => drawSentadito(D.x, D.y, dd % 3, t, { lado: -1, ritmo: 3.1, ph: dd })) }); tocable(D.x, D.y, { k: 'dictx' + dd });
      }
    }
    if (S.tecs[18] && S.tecs[18].fase !== 'sin') {
      drawables.push({ d: 12.4 + 8.8, fn: () => drawFichasArcilla(t) });
      tocable(12.4, 8.8, { k: 'sellar' }); // las fichas se tocan: con cuentas pendientes se sellan, sin ellas cuentan lo suyo
      if (S.tecs[18].fase === 'meseta') { drawables.push({ d: 12.15 + 9.3 + .01, fn: () => drawSentadito(12.15, 9.3, 0, t, { lado: 1, ritmo: 1.7, ph: 2.2 }) }); tocable(12.15, 9.3, { k: 'cuentafichas' }); }
    }
    if (S.tecs[19] && S.tecs[19].fase === 'meseta') { // LA MESA DE COPIA: llega con el currículo (las listas traen los ejercicios); la edubba después la techa
      drawables.push({ d: 10.35 + 9.0, fn: () => drawMesaCopia(t) });
      drawables.push({ d: 10.1 + 8.75 + .01, fn: () => drawSentadito(10.1, 8.75, 0, t, { lado: 1, ritmo: 2.0, ph: 0.8 }) }); tocable(10.1, 8.75, { k: 'mesacopia' });
    }
    if (S.tecs[19] && S.tecs[19].fase !== 'sin') {
      drawables.push({ d: 8.6 + 9.4, fn: () => drawEstela(t) });
      if (S.tecs[19].fase === 'meseta') {
        const pr = P(9.0, 9.9);
        drawables.push({ d: 9.0 + 9.9 + .01, fn: () => drawAlumno(pr.x, pr.y, -1, 0, 1) }); tocable(9.0, 9.9, { k: 'recitador' });
      }
    }
  }
  if (S.era === 3) { // época 3: el patio de la Casa de la Vida
    drawables.push({ d: 4.4, fn: () => drawPiramides(t) });
    drawables.push({ d: ESFINGE.x + ESFINGE.y, fn: () => drawGranEsfinge(t) }); tocable(ESFINGE.x, ESFINGE.y, { k: 'esfinge' }, { rx: 52, ry: 34, dy: 28 }); // la necrópolis del nordeste (quinta tanda): antes vivía sobre la clase de la Kemyt
    /* LA FACHADA DEL TEMPLO (2026-08-25, del ojo del jugador: los colosos y los obeliscos estaban
       desperdigados por el desierto, cada uno por su lado, y el faraón «en una esquina»). Un templo
       egipcio se entra por un eje: obelisco · coloso · PUERTA · coloso · obelisco (los mástiles de
       banderolas se quitaron en la tercera tanda). Los obeliscos van donde su COLUMNA DE PANTALLA (x - y) no cae sobre
       ninguna pieza que se mida: son altos, y en isométrico una aguja de 88 px tapa lo que tenga detrás
       aunque esté a tres baldosas. Todo lo suelto se alinea ahora en la fachada de la Casa (su puerta
       cae en x = 9,5) y el faraón recibe en la explanada, que es donde un rey tiene algo que hacer. */
    /* LA FACHADA, RECOMPUESTA (2026-09-06, quinta tanda): con los colosos rehechos a su altura, el del
       oeste en (8,7 · 9,9) tapaba entero el anexo de la Casa de la Vida (el patio de copistas de la
       etapa 1 quedaba detrás de su cabeza: lo cazó el audit, 7%). La fachada es estrecha: entre el
       anexo con su patio (x de pantalla −40…14), la puerta (41…55) y el patio de las lascas (58…93)
       no cabe un coloso de 93 px de alto. Medido en pantalla: con K = 1,2 (77 px, 2,5 caminantes) y
       estas dos posiciones ninguno tapa una pieza que se mida ni la puerta. */
    drawables.push({ d: 8.6 + 9.9, fn: () => drawColosoFaraon(8.6, 9.9, 1) }); tocable(8.6, 9.9, { k: 'coloso' });
    drawables.push({ d: 11.05 + 10.0, fn: () => drawColosoFaraon(11.05, 10.0, -1) }); tocable(11.05, 10.0, { k: 'coloso' });
    drawables.push({ d: 7.6 + 10.4, fn: () => drawObelisco(7.6, 10.4) }); tocable(7.6, 10.4, { k: 'obelisco' });
    drawables.push({ d: 11.8 + 8.2, fn: () => drawObelisco(11.8, 8.2) }); tocable(11.8, 8.2, { k: 'obelisco' });
    drawables.push({ d: 9.7 + 10.75 + .02, fn: () => drawFaraonVivo(t) }); tocable(9.7, 10.75, { k: 'faraon' });
    // EL POBLADO DE LOS ARTESANOS, en el desierto del oeste (cada casa se ordena por su centro)
    drawables.push({ d: 3.15 + 0.42 + 6.25 + 0.45, fn: () => drawCasaAdobe(3.15, 6.25, 0.85, 0.9, 15, t, 0) }); tocable(3.55, 6.7, { k: 'poblado' }, { rx: 26, ry: 16, dy: 10 });
    drawables.push({ d: 4.2 + 0.47 + 6.0 + 0.4, fn: () => drawCasaAdobe(4.2, 6.0, 0.95, 0.8, 18, t, 1) }); tocable(4.65, 6.4, { k: 'poblado' }, { rx: 26, ry: 16, dy: 12 });
    drawables.push({ d: 3.45 + 0.4 + 7.4 + 0.37, fn: () => drawCasaAdobe(3.45, 7.4, 0.8, 0.75, 13, t, 2) }); tocable(3.85, 7.8, { k: 'poblado' }, { rx: 24, ry: 14, dy: 8 });
    drawables.push({ d: 4.85 + 7.55 + .01, fn: () => drawPoblado(t) }); tocable(3.35, 8.7, { k: 'cabra' });
    drawables.push({ d: 14.3 + 0.7 + 3.7 + 0.45, fn: () => drawMastaba(14.3, 3.7, 1.4, 0.9, 14) }); tocable(15.0, 4.2, { k: 'mastaba' }, { rx: 34, ry: 16, dy: 8 });
    drawables.push({ d: 15.9 + 0.45 + 4.6 + 0.3, fn: () => drawMastaba(15.9, 4.6, 0.9, 0.6, 10) });
    drawables.push({ d: 9.15 + 13.5 + .02, fn: () => drawShaduf(9.15, 13.5, t) }); tocable(9.0, 13.55, { k: 'shaduf' });
    drawables.push({ d: 15.4 + 15.55 + .01, fn: () => drawCocodrilo(15.4, 15.55, t) }); tocable(15.4, 15.55, { k: 'cocodrilo' });
    drawables.push({ d: 2.9 + 8.2, fn: () => drawPalmera(2.9, 8.2, 1.1, t) }); // lejos de la falda de la pirámide chica
    drawables.push({ d: 16.0 + 5.5, fn: () => drawPalmera(16.0, 5.5, 3.2, t) });
    drawables.push({ d: 3.5 + 13.0, fn: () => drawPalmera(3.5, 13.0, 5.0, t) });
    const qg = posGato(t);
    drawables.push({ d: qg.x + qg.y + .02, fn: () => drawGato(t) });
    tocable(qg.x, qg.y, { k: 'gato' });
    drawables.push({ d: 14.7 + 15.0, fn: () => drawLotos(t) });
    drawables.push({ d: 16.6 + 12.7, fn: () => drawPapiros(16.6, 12.7, 0, t) }); // en la orilla: crecía en mitad del cauce
    drawables.push({ d: 16.35 + 13.9, fn: () => drawPapiros(16.35, 13.9, 2.1, t) });
    drawables.push({ d: 14.2 + 16.05, fn: () => drawPapiros(14.2, 16.05, 4.2, t) });
    drawables.push({ d: 11.4 + 13.2, fn: () => drawPapiros(11.4, 13.2, 1.3, t) }); // y la orilla OESTE también tiene juncal (2026-09-06: el papiro nacía «en los juncales» de una ribera sin juncos)
    drawables.push({ d: 9.6 + 15.1, fn: () => drawPapiros(9.6, 15.1, 3.3, t) });
    drawables.push({ d: 15.9 + 14.6, fn: () => drawGarza(t) }); tocable(15.9, 14.6, { k: 'garza' }); // a la orilla mojada (2,5 del eje): pescaba a 3,2, o sea en el desierto
    const qbn = posBarcaNilo(t); // la barca NAVEGA: su profundidad y su clic van donde ella está
    drawables.push({ d: qbn.x + qbn.y, fn: () => drawFalua(t) }); tocable(qbn.x, qbn.y, { k: 'falua' });
    if (S.tecs[20] && S.tecs[20].fase !== 'sin') { // la regla de la acción, versión Casa de la Vida
      drawables.push({ d: 11.4 + 6.4, fn: () => drawRolloPapiro(t) });
      if (S.tecs[20].fase === 'meseta') { drawables.push({ d: 11.25 + 6.95 + .01, fn: () => drawSentadito(11.25, 6.95, 0, t) }); tocable(11.25, 6.95, { k: 'lector' }); }
    }
    if (S.tecs[21] && S.tecs[21].fase !== 'sin') {
      drawables.push({ d: 10.3 + 7.9, fn: () => drawPaletaEscriba(t) });
      if (S.tecs[21].fase === 'meseta') { drawables.push({ d: 10.05 + 8.4 + .01, fn: () => drawSentadito(10.05, 8.4, 1, t) }); tocable(10.05, 8.4, { k: 'pintora' }); }
    }
    if (S.tecs[22] && S.tecs[22].fase !== 'sin') { // la Kemyt vive en el claro del noreste (mudada: la esfinge la ocluía)
      drawables.push({ d: 13.9 + 7.3, fn: () => drawKemyt(t) });
      if (S.tecs[22].fase === 'meseta') { drawables.push({ d: 13.6 + 7.85 + .01, fn: () => drawSentadito(13.6, 7.85, 2, t) }); tocable(13.6, 7.85, { k: 'oyente2' }); }
    }
    if (S.tecs[23] && S.tecs[23].fase !== 'sin') { // la cuerda vive EN LA VEGA, junto a los lindes que mide (2026-08-25: medía el valle desde el patio del templo)
      drawables.push({ d: 11.2 + 12.0, fn: () => drawCuerdaAgrimensor(t) });
      if (S.tecs[23].fase === 'meseta') {
        const t1 = P(CUERDA_A.x, CUERDA_A.y), t2 = P(CUERDA_B.x, CUERDA_B.y);   // uno en cada estaca, los dos en la vega
        drawables.push({ d: CUERDA_A.x + CUERDA_A.y + .01, fn: () => drawAlumno(t1.x, t1.y, -1, 0, 0) }); tocable(CUERDA_A.x, CUERDA_A.y, { k: 'tensador0' });
        drawables.push({ d: CUERDA_B.x + CUERDA_B.y + .01, fn: () => drawAlumno(t2.x, t2.y, 1, 0, 2) }); tocable(CUERDA_B.x, CUERDA_B.y, { k: 'tensador1' });
      }
    }
    // EL LOOP DEL OSTRACÓN (era3-plan, tanda visual): la elección espacial vive en el mundo
    if (S.tecs[31] && S.tecs[31].fase !== 'sin') {
      drawables.push({ d: PATIO_LASCAS.x + PATIO_LASCAS.y, fn: () => drawPatioLascas(t) });
      tocable(PATIO_LASCAS.x, PATIO_LASCAS.y, { k: 'patiolascas' });
      if (S.tecs[31].fase === 'meseta') { // la regla de la acción: el practicante raspa su lasca junto al montón
        drawables.push({ d: 10.5 + 7.75 + .01, fn: () => drawSentadito(10.5, 7.75, 3, t, { lado: 1, ritmo: 2.4, ph: 0.4 }) });
        tocable(10.5, 7.75, { k: 'practicante' });
      }
    }
    if (S.tecs[20] && S.tecs[20].fase !== 'sin') {
      drawables.push({ d: MESA_PAPIRO.x + MESA_PAPIRO.y, fn: () => drawMesaPapiro(t) });
      tocable(MESA_PAPIRO.x, MESA_PAPIRO.y, { k: 'mesapapiro' });
    }
    for (const iz of (S.lindes || [])) { const [lx2, ly2] = LINDE_SITIOS[iz]; drawables.push({ d: lx2 + ly2 + .01, fn: () => drawLinde(iz, t) }); tocable(lx2, ly2, { k: 'linde' + iz }); } // la vega re-mide su año
    if (S.tecs[31] && S.tecs[31].fase !== 'sin') { // LA VIÑETA DEL PADRE: la Sátira de los oficios, vivida
      const qpv = posPadreHijo(t);
      if (qpv && qpv.alpha > 0.05) {
        drawables.push({ d: qpv.x + qpv.y + .015, fn: () => drawPadreHijo(t) });
        if (qpv.alpha > 0.6) { tocable(qpv.x, qpv.y, { k: 'padre' }); tocable(qpv.x + 0.35, qpv.y + 0.12, { k: 'hijoescriba' }); }
      }
    }
  }
  if (ordEra(S.era) >= 11) { // la regla de la acción también en la era escolar (1920+)
    if (S.tecs[4] && S.tecs[4].fase === 'meseta') { drawables.push({ d: 6.0 + 12.85 + .01, fn: () => drawSentadito(6.0, 12.85, 2, t) }); tocable(6.0, 12.85, { k: 'radio' }); }    // oyente de la radio
    if (S.tecs[1] && S.tecs[1].fase === 'meseta') { drawables.push({ d: 4.9 + 6.5 + .01, fn: () => drawSentadito(4.9, 6.5, 1, t) }); tocable(4.9, 6.5, { k: 'linterna' }); }        // espectador de la linterna
  }
  for (let i = 0; i < HIERBAS_VIVAS.length; i++) { // la hierba que respira
    const [hx, hy] = HIERBAS_VIVAS[i];
    drawables.push({ d: hx + hy - .02, fn: () => drawHierbaViva(hx, hy, i, t) });
  }
  if (S.dewey === 2) { // aprender haciendo: alumnos trabajando el huerto y observando el pozo
    drawables.push({ d: 12.0 + 10.2, fn: () => drawSentadito(12.0, 10.2, 0, t) }); tocable(12.0, 10.2, { k: 'huerto0' });
    drawables.push({ d: 11.55 + 12.55, fn: () => drawSentadito(11.55, 12.55, 1, t) }); tocable(11.55, 12.55, { k: 'huerto1' });
  }
  let colaPuerta = 0; // los pensadores: esperando en la puerta (o junto al fuego) o habitando su rincón
  for (const k of ['abuela', 'enheduanna', 'ptahhotep', 'socrates', 'dewey', 'skinner', 'freire']) {
    // CADA PENSADOR VIVE EN SU EPOCA (2026-08-25, del ojo del jugador: «no sé por qué está la vieja de
    // la primera era, no sé por qué está esta persona de la segunda era ahí»). Su idea sigue rindiendo
    // para siempre (el bono no se toca), pero su CUERPO no cruza los milenios: la Abuela no se sienta
    // en el desierto egipcio. Las tres modernas sí conviven, porque comparten escuela y siglo.
    if (!(PENSADOR_ERAS[k] || []).includes(S.era)) continue;
    const est = estadoPensador(k);
    const ant = pensadorEstAnt[k];
    if (ant === undefined) pensadorEstAnt[k] = est;         // primera vista tras cargar: sin caminata
    else if (ant !== est) {                                  // cambió el estado: la mudanza se CAMINA
      pensadorEstAnt[k] = est;
      if (est) {
        const dest = est === 1 ? [10.3 + colaPuerta * 0.55, 9.1 + colaPuerta * 0.35] : LUGAR_PENSADOR[k];
        const org = ant && pensadorPosAnt[k] ? pensadorPosAnt[k] : [dest[0] + 6.2, dest[1] + 1.4]; // recién llegado: entra desde el este
        const dist = Math.hypot(dest[0] - org[0], dest[1] - org[1]);
        pensadorWalk[k] = { x0: org[0], y0: org[1], t0: performance.now(), dur: Math.min(6500, Math.max(1200, dist / 1.1 * 1000)) };
      }
    }
    if (!est) continue;
    // La Abuela no hace cola en la puerta: "se sienta junto a nuestro fuego sin pedir permiso", así que
    // espera YA en su rincón del fogón. Los demás pensadores sí aguardan a ser recibidos.
    const enPuerta = est === 1 && k !== 'abuela';
    let [px, py] = enPuerta ? [10.3 + colaPuerta * 0.55, 9.1 + colaPuerta * 0.35] : LUGAR_PENSADOR[k];
    if (enPuerta) colaPuerta++;
    const w = pensadorWalk[k];
    let caminando = false;
    if (w) {
      const kk = (performance.now() - w.t0) / w.dur;        // paso parejo: quien camina no acelera ni frena
      if (kk >= 1) delete pensadorWalk[k];
      else { px = w.x0 + (px - w.x0) * kk; py = w.y0 + (py - w.y0) * kk; caminando = true; }
    }
    pensadorPosAnt[k] = [px, py];
    const bob = caminando ? Math.abs(Math.sin(performance.now() / 90)) * 0.045 : 0;
    const pxD = px, pyD = py - bob;
    const sentada = k === 'abuela' && !caminando; // junto al fuego se está sentada, no de pie
    drawables.push({ d: px + py + 0.1, fn: () => drawPensador(k, pxD, pyD, t, sentada) });
    tocable(px, py, { k: 'pensador', id: k });
    if (!caminando && ((k === 'abuela' && abuelaCapDisponible()) || (est === 1 && VISITAS[k]))) // el globo espera a que llegue
      drawables.push({ d: px + py + 0.2, fn: () => drawGlobo(px, py, t) });
  }
  if (S.era === 4) { // época 4: el ágora de Atenas (09b-agora.js)
    drawables.push({ d: 4.4, fn: () => drawAcropolis(t) }); tocable(ACROPOLIS.x + 2.2, ACROPOLIS.y + 1.8, { k: 'acropolis' }, { rx: 90, ry: 40, dy: 70 });
    drawables.push({ d: PLAZA.x + PLAZA.w / 2 + PLAZA.y + PLAZA.d / 2 - 0.5, fn: () => drawPlaza() }); tocable(PLAZA.x + PLAZA.w / 2, PLAZA.y + PLAZA.d / 2, { k: 'altar' }, { rx: 10, ry: 8, dy: 6 });
    tocable(STOA.x + STOA.w / 2, STOA.y + STOA.d / 2, { k: 'stoa' }, { rx: 60, ry: 26, dy: 20 });
    tocable(BANCO_DECIR.x, BANCO_DECIR.y, { k: 'banco' }, { rx: 18, ry: 9, dy: 4 });
    tocable(AGORA_PREGUNTAR.x, AGORA_PREGUNTAR.y, { k: 'agora' }, { rx: 24, ry: 12, dy: 2 });
    drawables.push({ d: PALESTRA.x + PALESTRA.w / 2 + PALESTRA.y + PALESTRA.d / 2 - 0.4, fn: () => drawPalestra(t) }); tocable(PALESTRA.x + PALESTRA.w / 2, PALESTRA.y + PALESTRA.d / 2, { k: 'palestra' }, { rx: 60, ry: 30, dy: 10 });
    for (const [ox2, oy2, sc] of OLIVOS) drawables.push({ d: ox2 + oy2, fn: () => drawOlivo(ox2, oy2, sc, t) });
    tocable(OLIVAR.x + OLIVAR.w / 2, OLIVAR.y + OLIVAR.d / 2, { k: 'olivar' }, { rx: 70, ry: 36, dy: 14 });
    for (const [cx2, cy2] of COLMENAS) { drawables.push({ d: cx2 + cy2, fn: () => drawColmena(cx2, cy2, t) }); tocable(cx2, cy2, { k: 'colmena' }); }
    drawables.push({ d: 3.15 + 0.42 + 10.6 + 0.45, fn: () => drawCasaAtica(3.15, 10.6, 0.85, 0.9, 15, 0) }); tocable(3.55, 11.05, { k: 'casaAtica' }, { rx: 26, ry: 16, dy: 10 });
    drawables.push({ d: 4.2 + 0.47 + 10.35 + 0.4, fn: () => drawCasaAtica(4.2, 10.35, 0.95, 0.8, 18, 1) }); tocable(4.65, 10.75, { k: 'casaAtica' }, { rx: 26, ry: 16, dy: 12 });
    drawables.push({ d: 3.45 + 0.4 + 11.85 + 0.37, fn: () => drawCasaAtica(3.45, 11.85, 0.8, 0.75, 13, 2) }); tocable(3.85, 12.25, { k: 'casaAtica' }, { rx: 24, ry: 14, dy: 8 });
    drawables.push({ d: PLATANO.x + PLATANO.y, fn: () => drawPlatano(t) }); tocable(PLATANO.x, PLATANO.y, { k: 'platano' }, { rx: 24, ry: 14, dy: 40 });
    tocable(15.6, 13.6, { k: 'ilisos' }, { rx: 40, ry: 16, dy: 0 });
    { const cbq = { x: 5.9, y: 9.2 }; drawables.push({ d: cbq.x + cbq.y, fn: () => drawCabraAt(cbq.x, cbq.y, t) }); tocable(cbq.x, cbq.y, { k: 'cabraAt' }); }
    if (S.tecs[33] && S.tecs[33].fase !== 'sin') { drawables.push({ d: 11.05 + 7.15, fn: () => drawTablillaCera(t) }); if (S.tecs[33].fase === 'meseta') { drawables.push({ d: 11.3 + 7.5 + .01, fn: () => drawSentadito(11.3, 7.5, 0, t, { lado: -1, ritmo: 2.2 }) }); tocable(11.3, 7.5, { k: 'escribiente' }); } }
    if (S.tecs[34] && S.tecs[34].fase !== 'sin') { drawables.push({ d: 8.35 + 6.55 + 0.05, fn: () => drawLira(t) }); if (S.tecs[34].fase === 'meseta') { drawables.push({ d: 8.9 + 7.1 + .01, fn: () => drawSentadito(8.9, 7.1, 1, t, { lado: 1, ritmo: 3.0, ph: 0.6 }) }); tocable(8.9, 7.1, { k: 'liricista' }); } }
    if (S.tecs[36] && S.tecs[36].fase !== 'sin') { drawables.push({ d: TARIMA_SOFISTA.x + TARIMA_SOFISTA.y, fn: () => drawSofista(t) }); tocable(TARIMA_SOFISTA.x, TARIMA_SOFISTA.y, { k: 'sofista' }, { rx: 16, ry: 10, dy: 14 }); }
    if (S.tecs[37] && S.tecs[37].fase !== 'sin') drawables.push({ d: AGORA_PREGUNTAR.x + AGORA_PREGUNTAR.y - 0.2, fn: () => drawPregunta(t) });
    if (S.tecs[38] && S.tecs[38].fase !== 'sin') drawables.push({ d: OLIVAR.x + OLIVAR.w / 2 + OLIVAR.y + OLIVAR.d + 0.1, fn: () => drawAcademia(t) });
    // LAS DUDAS QUE ESPERAN: uno o dos muchachos de pie en la plaza con su «?», mirando al banco
    for (let k = 0; k < Math.min(2, S.dudaPend || 0); k++) { const dx2 = 9.25 + k * 0.45, dy2 = 7.55 + k * 0.15, pq = P(dx2, dy2); drawables.push({ d: dx2 + dy2 + .02, fn: () => { drawAlumno(pq.x, pq.y, -1, 0, (k + 2) % 3); drawGloboDuda(pq.x, pq.y, '?', t); } }); }
  }
  if (ordEra(S.era) >= 13) { // el ala nueva de 1955 y su patio de juegos
    drawables.push({ d: 17.9 + 3.3 + 1.2, fn: () => drawAulaAnexa(t) });
    drawables.push({ d: 8.2 + 18.5, fn: () => drawPelota(t) });
    const j1 = P(6.9, 18.75), j2 = P(7.75, 19.0);
    drawables.push({ d: 6.9 + 18.75 + 0.05, fn: () => drawAlumno(j1.x, j1.y - saltoJubilo(t, 21), 1, t * 9, 1) }); tocable(6.9, 18.75, { k: 'pelota0' });
    drawables.push({ d: 7.75 + 19.0 + 0.05, fn: () => drawAlumno(j2.x, j2.y - saltoJubilo(t, 22), -1, t * 9 + 2, 2) }); tocable(7.75, 19.0, { k: 'pelota1' });
    drawables.push({ d: 0.9 + 8.5, fn: () => drawPino(0.9, 8.5, 1.0, 0.8, t) });
    drawables.push({ d: 1.3 + 12.5, fn: () => drawArbol(1.3, 12.5, 0.9, 2.6, t) });
    drawables.push({ d: 1.0 + 16.5, fn: () => drawRoca(1.0, 16.5, 0.8) });
    drawables.push({ d: 18.9 + 12.8, fn: () => drawArbusto(18.9, 12.8, 1.0, true) });
  }
  if (ordEra(S.era) >= 13 && S.tecs[7] && S.tecs[7].fase !== 'sin') {
    drawables.push({ d: 17.3 + 6.1, fn: () => drawTV(t) });
    if (S.tecs[7].fase === 'meseta') { tocable(17.15, 6.95, { k: 'tv0' }); tocable(17.72, 7.12, { k: 'tv1' }); } // la tele-clase
  }
  if (ordEra(S.era) >= 13 && S.tecs[8] && S.tecs[8].fase !== 'sin') {
    drawables.push({ d: 19.0 + 6.9, fn: () => drawMaquina(t) });
    if (S.tecs[8].fase === 'meseta') tocable(19.15, 7.6, { k: 'maq0' }); // la alumna de la palanca
  }
  if (ordEra(S.era) >= 13 && S.tecs[9] && S.tecs[9].fase !== 'sin') drawables.push({ d: 18.45 + 6.15, fn: () => drawRetro(t) });
  { const [d0x, d0y] = PUESTO_DOC0();
    drawables.push({ d: d0x + d0y + 0.2, fn: () => drawDocente(t) }); tocable(d0x, d0y, { k: 'docente', i: 0 }); }
  for (let i = 1; i < S.docentes; i++) {
    const [dx, dy] = (S.era === 2 ? PUESTOS_DOCENTE_SUMER : S.era === 3 ? PUESTOS_DOCENTE_EGIPTO : S.era === 4 ? PUESTOS_DOCENTE_AGORA : PUESTOS_DOCENTE)[i - 1];
    drawables.push({ d: dx + dy, fn: () => drawDocenteExtra(dx, dy, i, t) });
    tocable(dx, dy, { k: 'docente', i });
  }
  const nKids = Math.min(S.alumnos, 18);
  const ASIENTOS_CLASE = [[8.35, 8.5], [8.8, 8.22], [9.2, 8.55], [8.95, 8.8], [9.55, 8.32], [8.12, 8.2]]; // las esteras de la sala, frente al banquito
  const velada = nocheVelada();                                    // 0 de día → 1 con todos al fuego de noche
  /* LA NOCHE DE LA CASA DE LA VIDA (2026-09-06, jugando de noche: la ronda seguía dando vueltas a
     oscuras como si nada). Al caer el sol, unos pocos se quedan a la lectura de la tarde, sentados
     ante la Kemyt a la luz del candil (la sala que vela), y el resto vuelve caminando al poblado de
     los artesanos y se pierde entre sus casas. Al amanecer, salen de nuevo. */
  const nocheC = nocheCasa(), noche3 = S.era === 3 ? nocheC : 0, noche2 = S.era === 2 ? nocheC : 0, noche4 = S.era === 4 ? nocheC : 0;
  /* LA NOCHE DEL ÁGORA (mismo molde): unos pocos se quedan bajo el pórtico de la stoa con las lámparas
     (la conversación que sigue de noche) y el resto vuelve a las casas de la ciudad por el oeste. */
  const ASIENTOS_STOA = [[8.6, 6.85], [9.1, 6.95], [9.6, 6.9], [10.1, 6.95], [10.6, 6.85], [9.35, 7.3], [9.85, 7.3]];
  /* Y LA NOCHE DE LA EDUBBA (mismo molde): los hijos de escribas no son internos: al caer el sol
     unos pocos se quedan en las esteras de la sala, bajo el candil del toldo, y el resto vuelve a
     la ciudad por el camino del este y se pierde tras el borde del mundo. */
  const PORTON_SUMER = [[16.7, 7.3], [16.9, 8.1], [16.5, 6.6]];
  /* La lectura se sienta ante la Kemyt, en el claro del noreste, a la luz de su candil: frente a la
     puerta del pilono los colosos (que se dibujan después) tapaban a quien se sentara detrás de sus
     tronos. Todos los asientos cumplen x − y ≥ 5,2: a la derecha de la cabeza de la Esfinge en
     pantalla, que es la otra pieza que se dibuja encima. Sin Kemyt aún, todos vuelven al poblado. */
  const ASIENTOS_VELA = S.tecs[22] && S.tecs[22].fase !== 'sin'
    ? [[13.6, 8.3], [14.0, 8.4], [14.4, 8.3], [14.8, 8.1], [13.9, 7.95], [14.3, 8.0], [14.7, 7.75], [15.1, 7.9]] : [];
  for (let i = 0; i < nKids; i++) {
    const kid = KIDS[i];
    const loop = S.era === 1 ? LOOPS_FOGON[i % LOOPS_FOGON.length] : S.era === 2 ? posSumer : S.era === 3 ? posEgipto : S.era === 4 ? posAgora : posEnLoop; // en la prehistoria se reparten por zonas; en Sumer el paseo conoce el río; en Egipto ronda el agua y la escuela; en Atenas da la vuelta al ágora
    const paseo = loop(kid.off + t * kid.speed);
    let px = paseo.x, py = paseo.y, dir = paseo.dir;   // la mirada la decide el recorrido, con su histéresis
    let sentado = false;
    /* LA CLASE DEL PATIO (2026-08-04, del ojo del jugador: los personajes no tenían propósito legible).
       Con la edubba fundada, cada niño se desvía de su paseo por turnos, se sienta a clase en las
       esteras de la sala mirando al banquito del maestro, y vuelve a su ronda. Misma matemática de la
       velada, pero por niño y de día: en todo momento hay 2-3 sentados aprendiendo. */
    let alfa = 1; // quien se va a casa se desvanece al llegar; medio desvanecido no roba clics
    if (S.era === 2 && noche2 > 0.01) {
      const u = kid.off + t * kid.speed, conSala = S.tecs[30] && S.tecs[30].fase !== 'sin';
      if (conSala && i < ASIENTOS_CLASE.length) { // la lectura de la tarde en la sala: se entra por la plaza (nodo 1)
        const a = ASIENTOS_CLASE[i], q = posSumer.salida(u, 1, a, noche2, 0.6);
        px = q.x; py = q.y; dir = noche2 < 0.6 ? q.dir : ((8.15 - a[0] - (7.85 - a[1])) >= 0 ? 1 : -1);
        sentado = noche2 > 0.97;
      } else { // a la ciudad, por la ribera del este (nodo 9) y el camino
        const hg = PORTON_SUMER[i % PORTON_SUMER.length], q = posSumer.salida(u, 9, hg, noche2, 0.62);
        px = q.x; py = q.y; dir = q.dir;
        alfa = 1 - smooth((noche2 - 0.8) / 0.16);
      }
    }
    if (S.era === 2 && S.tecs[30] && S.tecs[30].fase !== 'sin' && velada < 0.01 && noche2 < 0.01) {
      const cc = ((t + i * 37) / 90) % 1;
      const clase = cc < 0.26 ? Math.min(1, Math.min(cc, 0.26 - cc) / 0.045) : 0;
      if (clase > 0.01) {
        const a = ASIENTOS_CLASE[i % ASIENTOS_CLASE.length], k = smooth(clase);
        px = paseo.x + (a[0] - paseo.x) * k; py = paseo.y + (a[1] - paseo.y) * k;
        dir = (8.15 - a[0] - (7.85 - a[1])) >= 0 ? 1 : -1;   // mirando al banquito del maestro
        sentado = clase > 0.9;
      }
    }
    /* LA CLASE DE LA CASA DE LA VIDA (2026-08-25, del ojo del jugador: «los monos andan dando vueltas
       todo el rato»). El mismo remedio que Sumer, con las estaciones de ESTA época: unos se sientan
       ante la Kemyt a recitar el modelo, otros se acuclillan en el patio de las lascas a practicar
       barato. Cada niño se desvía por turnos y vuelve a su ronda: en todo momento hay tres o cuatro
       haciendo algo, y el paseo deja de ser un carrusel. */
    if (S.era === 3 && noche3 > 0.01) {
      const u = kid.off + t * kid.speed;
      if (i < ASIENTOS_VELA.length) { // la lectura de la tarde ante la Kemyt: se llega por el claro del sur de la esfinge (nodo 7)
        const a = ASIENTOS_VELA[i], q = posEgipto.salida(u, 7, a, noche3, 0.6);
        px = q.x; py = q.y; dir = noche3 < 0.6 ? q.dir : ((13.9 - a[0] - (7.3 - a[1])) >= 0 ? 1 : -1);   // mirando a la Kemyt
        sentado = noche3 > 0.97;
      } else { // a casa, al poblado: por el nodo del oeste (2), lejos del templo y de los tronos
        const hg = HOGARES[i % HOGARES.length], q = posEgipto.salida(u, 2, hg, noche3, 0.62);
        px = q.x; py = q.y; dir = q.dir;
        alfa = 1 - smooth((noche3 - 0.8) / 0.16);
      }
    }
    let aporia = null; // ATENAS: ¿este aprendiz se llevó una duda a caminar?
    if (S.era === 4) {
      aporia = (S.aporias || []).find(a => a.i === i) || null;
      if (aporia) { // LA APORÍA EN EL MUNDO: se separa de la ronda y da vueltas por el claro con su «?», y vuelve con «!»
        const k = Math.min(1, (S.tiempoJuego - aporia.t0) / APORIA_DUR), ang = k * Math.PI * 2.2 + i;
        const cx2 = AGORA_PREGUNTAR.x + 0.2 + Math.cos(ang) * 0.9, cy2 = AGORA_PREGUNTAR.y + 0.3 + Math.sin(ang) * 0.55;
        const kk = smooth(Math.min(1, k * 4));
        px = paseo.x + (cx2 - paseo.x) * kk; py = paseo.y + (cy2 - paseo.y) * kk;
        dir = Math.cos(ang + 1.57) >= 0 ? 1 : -1;
      } else if (noche4 > 0.01) {
        const u = kid.off + t * kid.speed;
        if (i < ASIENTOS_STOA.length) { const a = ASIENTOS_STOA[i], q = posAgora.salida(u, 10, a, noche4, 0.6); px = q.x; py = q.y; dir = noche4 < 0.6 ? q.dir : ((9.6 - a[0] - (5.5 - a[1])) >= 0 ? 1 : -1); sentado = noche4 > 0.97; }
        else { const hg = HOGARES_AT[i % HOGARES_AT.length], q = posAgora.salida(u, 2, hg, noche4, 0.62); px = q.x; py = q.y; dir = q.dir; alfa = 1 - smooth((noche4 - 0.8) / 0.16); }
      } else if (velada < 0.01) { // LA CLASE DE LA STOA de día: unos se sientan ante el grammatistes, otros corren la pista de la palestra
        const puestos = [[8.7, 7.15, 8.35, 7.35], [9.15, 7.25, 8.35, 7.35], [9.6, 7.15, 8.35, 7.35]];
        if (S.tecs[35] && S.tecs[35].fase === 'meseta') puestos.push([13.0, 5.3, 14.6, 5.3], [13.5, 5.35, 14.6, 5.3], [14.0, 5.3, 14.6, 5.3]);
        const cc = ((t + i * 31) / 84) % 1, clase = cc < 0.3 ? Math.min(1, Math.min(cc, 0.3 - cc) / 0.05) : 0;
        if (clase > 0.01) { const a = puestos[i % puestos.length], k = smooth(clase); px = paseo.x + (a[0] - paseo.x) * k; py = paseo.y + (a[1] - paseo.y) * k; dir = (a[2] - a[0] - (a[3] - a[1])) >= 0 ? 1 : -1; sentado = clase > 0.9 && a[1] > 7; }
      }
    }
    if (S.era === 3 && velada < 0.01 && noche3 < 0.01) {
      const kemytLista = S.tecs[22] && S.tecs[22].fase === 'meseta';
      const patioListo = S.tecs[31] && S.tecs[31].fase !== 'sin';
      const puestos = [];
      if (kemytLista) puestos.push([13.35, 7.95, 13.9, 7.3], [13.8, 8.2, 13.9, 7.3], [14.3, 7.95, 13.9, 7.3]);
      if (patioListo) puestos.push([9.4, 7.95, 9.8, 7.4], [9.95, 8.1, 9.8, 7.4], [10.4, 7.9, 9.8, 7.4]);
      if (puestos.length) {
        const cc = ((t + i * 31) / 84) % 1;
        const clase = cc < 0.3 ? Math.min(1, Math.min(cc, 0.3 - cc) / 0.05) : 0;
        if (clase > 0.01) {
          const a = puestos[i % puestos.length], k = smooth(clase);
          px = paseo.x + (a[0] - paseo.x) * k; py = paseo.y + (a[1] - paseo.y) * k;
          dir = (a[2] - a[0] - (a[3] - a[1])) >= 0 ? 1 : -1;   // mirando a lo que aprende
          sentado = clase > 0.9;
        }
      }
    }
    if (velada > 0.01) { // de noche caminan hacia su sitio en el círculo y se sientan
      const s = asientoVelada(i, nKids), k = smooth(velada);
      px = paseo.x + (s.x - paseo.x) * k; py = paseo.y + (s.y - paseo.y) * k;
      // Mirando al fuego, pero decidido desde el ASIENTO (fijo), no desde la posición de camino: quien
      // cruzaba la diagonal del fogón mientras se acercaba se espejaba a mitad de trayecto.
      dir = (FOGON.x - s.x - (FOGON.y - s.y)) >= 0 ? 1 : -1;
      sentado = velada > 0.9;
    }
    const scr = P(px, py);
    if (alfa <= 0.02) continue; // ya entró a su casa
    const conAlfa = fn => alfa >= 0.98 ? fn : () => { g.save(); g.globalAlpha *= alfa; fn(); g.restore(); };
    if (sentado) drawables.push({ d: px + py + 0.05, fn: conAlfa(() => drawSentadito(px, py, kid.variant, t)) });
    else drawables.push({ d: px + py + 0.05, fn: conAlfa(() => { drawAlumno(scr.x, scr.y - saltoJubilo(t, i), dir, t * 7 * kid.speed + kid.off, kid.variant); if (aporia) drawGloboDuda(scr.x, scr.y, (S.tiempoJuego - aporia.t0) / APORIA_DUR > 0.85 ? '!' : '?', t); }) });
    if (alfa > 0.6) tocable(px, py, { k: 'alumno', i });
  }
  if (S.era === 1 && S.fuegoDescubierto) for (let v = 0; v < 2; v++) { // el ir y venir de la caverna
    const cvv = caveVisitor(t, v * 7.5); if (cvv.alpha < 0.05) continue;
    const scr = P(cvv.x, cvv.y);
    drawables.push({ d: cvv.x + cvv.y + 0.04, fn: () => { g.save(); g.globalAlpha = cvv.alpha; drawAlumno(scr.x, scr.y, cvv.dir, t * 4.5 + v * 2, (v + 1) % 3); g.restore(); } });
    if (cvv.alpha > 0.6) tocable(cvv.x, cvv.y, { k: 'cueva' + v }); // visible = clickeable; medio adentro no roba clics
  }
  if (S.era === 1 && S.tecs[28] && S.tecs[28].fase === 'meseta') { // lo que la orilla gana con cada etapa: se queda de noche también
    drawables.push({ d: 12.35 + 15.55, fn: () => drawOrillaNivel(t) });
  }
  // Quienes se recogen a la velada se DESVANECEN camino al fuego (antes hacían "pop": aparecían y
  // desaparecían de golpe al cruzar el umbral 0.35, cada anochecer). 1 = pleno día, 0 = todos al fuego.
  const desvVelada = S.era === 1 && S.fuegoDescubierto ? Math.max(0, Math.min(1, (0.35 - nocheVelada()) / 0.15)) : 0;
  { // la orilla: uno que sabe y uno que mira
    const aOrilla = desvVelada;
    if (aOrilla > 0.02) {
      const conAlpha = fn => () => { g.save(); g.globalAlpha *= aOrilla; fn(); g.restore(); };
      drawables.push({ d: PESCA.x + PESCA.y + 0.03, fn: conAlpha(() => drawPescador(t)) });
      drawables.push({ d: PESCA.ax + PESCA.ay + 0.02, fn: conAlpha(() => drawPescadorcitoEn(PESCA.ax, PESCA.ay, 0, t)) });
      if (aOrilla > 0.6) { tocable(PESCA.x, PESCA.y, { k: 'pescador' }); tocable(PESCA.ax, PESCA.ay, { k: 'pescaprendiz' }); } // medio desvanecido no roba clics
      // y los sitios que TÚ has hecho: cada pareja nace (no aparece) y se queda pescando
      for (let d = 0; d < diadas(); d++) {
        const D = DIADAS[d], px2 = D.x - 0.45, py2 = D.y + 0.3;
        drawables.push({ d: D.x + D.y + 0.02, fn: conAlpha(() => nacerEn('diadaM' + d, () => drawPescadorEn(D.x, D.y, d, t))) });
        drawables.push({ d: px2 + py2 + 0.02, fn: conAlpha(() => nacerEn('diadaP' + d, () => drawPescadorcitoEn(px2, py2, d + 1, t))) });
        if (aOrilla > 0.6) { tocable(D.x, D.y, { k: 'diada' + Math.min(d, 3) }); tocable(px2, py2, { k: 'pescapeq' + Math.min(d, 3) }); }
      }
    }
  }
  if (S.era === 1 && S.fuegoDescubierto) [[4.0, 12.6, 0], [12.6, 9.4, 2.3], [7.6, 14.4, 4.1]].forEach(([gx, gy, ph], ri) => { // recolectoras, cada una con su nombre
    drawables.push({ d: gx + gy + 0.03, fn: () => drawRecolectora(gx, gy, ph, t) }); tocable(gx, gy, { k: 'recole' + ri });
    const ap = desvVelada > 0.02 ? aprendizDe(gx, gy, ph, t) : null;   // de noche, todos al fuego (y se van desvaneciendo, no de golpe)
    if (ap) {
      ap.alpha *= desvVelada;
      const sa = P(ap.x, ap.y);
      // el gesto va MEDIO SEGUNDO por detrás del de ella y con menos recorrido: aún le sale torpe
      const dipA = ap.imita ? Math.max(0, Math.sin((t - 0.55) * 1.2 + ph)) * 3.4 * zoom : 0;
      drawables.push({ d: ap.x + ap.y + 0.035, fn: () => {
        g.save(); g.globalAlpha = ap.alpha;
        drawAlumno(sa.x, sa.y + dipA, 1, ap.mira ? ph : t * 0.3 + ph, (ph + 1) | 0);
        g.restore();
      } });
      if (ap.alpha > 0.6) tocable(ap.x, ap.y, { k: 'aprendiz' + ri });    // medio desvanecido no roba clics
    }
  });
  // la fauna de ambiente tiene percha POR ÉPOCA: en Sumer el mapa cambió y el pajarito de (16, 10.4)
  // quedaba picoteando sobre el eje del río (medido: distancia 0,04 al cauce). En Sumer picotea la
  // ribera de barro y la plaza; las mariposas rondan la cebada, la ribera alta y el patio.
  const FAUNA = S.era === 2
    ? { mariposas: [[4.9, 11.2, 0.7, '#f6f1e3'], [15.6, 12.7, 3.4, '#e8a35c'], [10.6, 5.9, 5.1, '#f6f1e3']],
        pajaros: [[13.9, 9.9, 0], [8.4, 10.3, 2.7]] }
    : { mariposas: [[13.6, 11.8, 0.7, '#f6f1e3'], [4.0, 12.9, 3.4, '#e8a35c'], [16.0, 7.4, 5.1, '#f6f1e3']],
        pajaros: [[16.0, 10.4, 0], [12.55, 6.7, 2.7]] };
  for (const [mx, my, mph, mc] of FAUNA.mariposas) drawables.push({ d: mx + 0.3 + my + 0.3, fn: () => drawMariposa(t, mx, my, mph, mc) });
  for (const [bx, by, bph] of FAUNA.pajaros) drawables.push({ d: bx + by, fn: () => drawPajarito(bx, by, bph, t) });
  for (const n of colectibles) { drawables.push({ d: n.x + n.y + 0.3, fn: () => drawNodo(n, t) }); tocable(n.x, n.y, { k: 'colectible', node: n }); }
  if (ordEra(S.era) >= 13) for (let i = 0; i < 3; i++) { // el paseo del ala nueva
    const offE = i * 5.1, spE = 0.5 + i * 0.06;
    const posE = posEnLoopEste(offE + t * spE);
    const scrE = P(posE.x, posE.y);
    const dirE = posE.dir;
    drawables.push({ d: posE.x + posE.y + 0.05, fn: () => drawAlumno(scrE.x, scrE.y - saltoJubilo(t, 18 + i), dirE, t * 7 * spE + offE, (i + 1) % 3) });
    tocable(posE.x, posE.y, { k: 'alumno', i: 18 + i });
  }
  drawables.sort((a, b) => a.d - b.d);
  for (const d of drawables) d.fn();
  if (fichaActiva) { // la tarjeta sigue a su personaje
    const pf = GENTE_CLIC.find(q => claveFicha(q.ficha) === fichaActiva);
    if (pf) posicionarFicha(pf.x, pf.y); else ocultarFicha();
  }

  drawHumo(t);
  drawLibros(t);
  drawMotas(t);
  drawNubes(t, 'cerca'); // pasan por encima del mundo
  drawClimaEstacion(t);  // pétalos, vilanos, hojas o nieve, según el mes del año
  if (ordEra(S.era) < 11 && !S.fuegoDescubierto) { // la penumbra antes de la primera chispa
    g.fillStyle = 'rgba(38,46,82,.26)'; g.fillRect(0, 0, W, H);
  }
  drawNoche(t); // el manto de la noche + el resplandor del fuego (Época 1)
  drawSenalNodos(t); // la luz de los materiales recogibles, visible aun de noche
  drawLuciernagas(t); // brillan sobre la oscuridad
  drawChispasFuego(); // por encima de la penumbra, para que brillen en la oscuridad
  drawAnillos();      // los anillos de logro, irradiando desde su escena
  drawSenalConsejo(t); // el anillo donde señala la consejera: el foco del mundo, hermano del foco del dock
  drawCazaOverlay(t); // la barra/convite de la cacería, encima de árboles y todo
  drawConvites(t);    // GRAMÁTICA: los rótulos de acción del mundo, siempre legibles
  drawTaps();         // el acuse de recibo del dedo: el táctil no tiene hover-halo
  drawHoverHalo(t);   // GRAMÁTICA: halo dorado sobre lo accionable bajo el cursor
  drawPops(); // los +N al recoger la chispa de curiosidad
  drawVignette();
}
requestAnimationFrame(frame);
setInterval(guardar, 5000);
window.addEventListener('beforeunload', guardar);
// H9 del QA general: Safari en el iPhone casi nunca avisa al cerrar (no dispara beforeunload); se guarda también al
// ocultar la pestaña o salir de la página, que sí avisa. guardar() ya respeta el laboratorio y la pestaña congelada.
window.addEventListener('pagehide', guardar);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') guardar(); });

/* EL PUENTE DEL LABORATORIO. Los let/const de nivel superior de un script clásico NO son propiedades
   de window, así que qa.html no puede alcanzar S, BALANCE ni los relojes por contentWindow (las
   funciones sí: las declaraciones function sí viven en window). Este objeto se los presta, SOLO en
   modo laboratorio: en el juego real no existe. */
if (MODO_LAB) window.__lab = {
  esLab: true,
  get S() { return S; }, set S(v) { S = v; },
  get tJuegoVis() { return tJuegoVis; }, set tJuegoVis(v) { tJuegoVis = v; },
  set fuegoVis(v) { fuegoVis = v; },
  get colectibles() { return colectibles; }, // las luces del mundo, para que el lab pueda tocarlas con coordenadas reales
  BALANCE, MATERIALES, MAT_DE_TEC, MAT_COSTO, VISITAS, sfx, fx, ARCO_EPOCAS, AUTORES_AL, OBRAS_BA, SIGNOS_TE, NINOS_TE, TIEMPOS_PA, TAREAS_PA, CUESTIONES_PA, OBRAS_AM, PUEBLOS_SA, SALAS_RO, NINOS_RO // el arco entra al puente el 2026-08-24: el bot de las épocas con hitos propios lo necesita
};
if (VER_PORTADA) abrirPortada(true);
