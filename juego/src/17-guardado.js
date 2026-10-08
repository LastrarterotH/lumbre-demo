/* ============================================================
   17-guardado
   Guardar y cargar la partida, y el cálculo de lo aprendido mientras no estabas.
   ============================================================ */
/* ---------- MODO LABORATORIO (?lab=1) ----------
   La página corre el juego SIN TOCAR la partida real: no la carga, no guarda, no reclama la pestaña
   (el guardián congelaría la del jugador) y no se congela si el jugador abre la suya. Es el cimiento
   del QA: `qa.html` corre el bot de balance aquí dentro, y cualquier experimento manual también
   (abrir index.html?lab=1 y romper lo que haga falta). Esta semana el save del jugador se ensució TRES
   veces por pruebas sin esta red; con el modo laboratorio, es imposible por construcción. */
const MODO_LAB = new URLSearchParams(location.search).has('lab');

/* ---------- EL GUARDIÁN DE PESTAÑAS ----------
   Dos pestañas del juego comparten el mismo localStorage y gana la última que guarda: eso ya costó una
   partida (QA del 2026-07-28). La regla es simple y cozy: LA PESTAÑA NUEVA MANDA. Cada pestaña anota su
   identidad al abrir; cuando otra escribe la suya, esta se congela (deja de guardar Y de simular) y lo
   dice con un velo. El botón de retomar recarga: al abrir, esta pestaña vuelve a ser "la nueva". */
const TAB_ID = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
let tabCongelada = false;
if (!MODO_LAB) localStorage.setItem(SAVE_KEY + '-tab', TAB_ID); // el laboratorio ni reclama ni compite
window.addEventListener('storage', e => { // solo dispara desde OTRA pestaña: es justo la señal que queremos
  if (MODO_LAB) return;
  if (e.key === SAVE_KEY + '-tab' && e.newValue && e.newValue !== TAB_ID && !tabCongelada) {
    tabCongelada = true;
    cerrarModales(); cerrarSuperficies();
    $('otratab').style.display = 'flex';
  }
});
$('b-retomar').addEventListener('click', () => location.reload()); // recargar retoma: carga el save fresco y reclama la pestaña

function guardar() {
  if (MODO_LAB || tabCongelada) return; // en el laboratorio, o si otra pestaña tomó la partida, aquí no se escribe ni una tecla
  localStorage.setItem(SAVE_KEY, JSON.stringify({ S, ts: Date.now() }));
  // respaldo rodante cada 10 min: un seguro contra pérdidas (recuperable con typ-f3-save-bak)
  const bakTs = +(localStorage.getItem(SAVE_KEY + '-bak-ts') || 0);
  if (Date.now() - bakTs > 600000 && !cargaFallida) { // tras una carga fallida no se rota: el respaldo es la copia buena
    localStorage.setItem(SAVE_KEY + '-bak', localStorage.getItem(SAVE_KEY));
    localStorage.setItem(SAVE_KEY + '-bak-ts', String(Date.now()));
  }
}

/* ---------- LLEVARSE LA PARTIDA / TRAERLA ----------
   El save no viaja con el repo (vive en el localStorage de cada navegador), y con dos máquinas en uso la
   única vía era copiar la clave a mano por la consola. Estos dos botones lo resuelven de raíz: 💾 baja
   un archivo con el progreso, 📥 lo abre en cualquier otra máquina. Al importar, la partida que hubiera
   queda respaldada en '-preimport': traer un archivo equivocado no puede costar nada. */
$('b-exportar').addEventListener('click', () => {
  if (MODO_LAB) { toast('🔬 En el laboratorio no se exporta: lo que ves es un estado de prueba, no tu partida.'); return; } // antes bajaba la partida REAL del navegador (H8)
  guardar(); // que el archivo lleve el estado de AHORA mismo, no el del último autoguardado
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) { toast('🗺️ Aún no hay nada que llevarse: la partida se guarda sola en cuanto empieces.'); return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
  a.download = `lumbre-partida-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('💾 <b>La partida viaja contigo.</b> Guarda el archivo y ábrelo con 📥 en cualquier otra máquina o navegador.', 9000);
});
$('b-importar').addEventListener('click', () => $('importar-archivo').click());
$('importar-archivo').addEventListener('change', e => {
  const file = e.target.files[0];
  e.target.value = ''; // que elegir el mismo archivo dos veces vuelva a disparar el change
  if (MODO_LAB) { toast('🔬 En el laboratorio no se importa: la partida real no se toca ni para escribirla.'); return; }
  if (!file) return;
  file.text().then(txt => {
    const v = JSON.parse(txt);
    // la forma mínima de una partida de verdad; lo demás lo sanea cargar(), que ya migra saves viejos
    if (!v || typeof v !== 'object' || !v.S || !Array.isArray(v.S.tecs) || typeof v.S.apr !== 'number') throw new Error('forma');
    // H8 del QA general: una partida de una época que este juego aún no tiene (o de la versión escolar antigua, que
    // cargar() pasa a las eras 11-13) dejaba el mundo vacío: se rechaza con su porqué
    const eraReal = !v.S.__v2 && v.S.era >= 1 && v.S.era <= 3 ? v.S.era + 10 : v.S.era;
    if (ordEra(eraReal) > ordEra(ULTIMA_EPOCA)) { toast(`📥 Esa partida está en una época que esta versión todavía no tiene (la ${numEpoca(eraReal)}), o viene de una versión antigua de Lumbre. No se importó: tu partida sigue igual.`, 11000); return; }
    const actual = localStorage.getItem(SAVE_KEY);
    if (actual) localStorage.setItem(SAVE_KEY + '-preimport', actual); // la partida que había, a salvo
    localStorage.setItem(SAVE_KEY, JSON.stringify({ S: v.S, ts: v.ts || Date.now() }));
    tabCongelada = true;   // que ni el beforeunload ni el intervalo pisen lo recién importado
    location.reload();
  }).catch(() => toast('📥 Ese archivo no parece una partida de Lumbre. Busca uno guardado con el botón 💾.', 9000));
});
/* UNA PARTIDA DAÑADA NO SE PIERDE (H7 del QA general): si lo guardado no se puede leer, queda aparte en '-danado',
   esta sesión no rota el respaldo (antes, a los 10 min, pisaba la copia buena con la partida vacía) y se intenta el
   respaldo; de todo se avisa. */
let cargaFallida = false;
function cargar() {
  if (MODO_LAB) return false; // el laboratorio siempre arranca de cero: la partida real ni se lee
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  if (cargarDe(raw)) return true;
  cargaFallida = true;
  try { localStorage.setItem(SAVE_KEY + '-danado', raw); } catch {}
  const bak = localStorage.getItem(SAVE_KEY + '-bak');
  if (bak && bak !== raw && cargarDe(bak)) {
    setTimeout(() => toast('🩹 <b>La partida guardada no se pudo leer.</b> Se recuperó el respaldo más reciente (de hasta 10 minutos antes); la dañada quedó guardada aparte.', 14000), 1500);
    return true;
  }
  S = estadoInicial();
  setTimeout(() => toast('🩹 <b>La partida guardada no se pudo leer</b>, y el respaldo tampoco: empiezas de cero. La dañada quedó guardada aparte, por si se puede rescatar.', 14000), 1500);
  return false;
}
function cargarDe(raw) {
  try {
    const { S: s, ts } = JSON.parse(raw);
    S = Object.assign(estadoInicial(), s);
    if (!s.__v2 && s.era >= 1 && s.era <= 3) S.era = s.era + 10; // los saves de antes empezaban en la era escolar (1920)
    S.__v2 = 2;
    while (S.tecs.length < BALANCE.tecnologias.length) S.tecs.push({ fase: 'sin', t: 0, nivel: 0, prof: 0 }); // saves de eras previas
    if (S.mats && S.mats.barro === undefined) S.mats.barro = 0; // Sumer trajo su material (2026-08-01)
    S.tecs.forEach(tt => { if (tt.nivel === undefined) tt.nivel = 0; if (tt.prof === undefined) tt.prof = 0; });
    if (S.cazaOn === undefined) { S.cazaOn = false; S.cazaProg = 0; S.cazaT = 0; S.cazaCd = 0; S.cazasHechas = 0; } // (cazaHitCd era de la caza interactiva retirada: ya no se siembra)
    if (S.esNoche === undefined) { S.esNoche = false; S.vioNoche = false; S.vioDia = false; }
    if (s.fuego === undefined) { S.fuego = 100; S.tecs[14].fase = 'meseta'; } // ya tenían la fogata encendida
    if (S.fuego >= 100 || s.fuegoDescubierto) S.fuegoDescubierto = true;
    if (S.ganadoF && (S.abuelaCap || 0) < 3) S.abuelaCap = 3; // no re-pedir historias a quien ya cerró la era (estado inalcanzable en juego normal; solo saves viejos/corruptos)
    if (S.mats.grano === undefined) S.mats.grano = 0;
    for (const m of MATERIALES) if (S.mats[m.k] === undefined) S.mats[m.k] = 0;   // cada época nueva trae su material (el papel de Bagdad, 2026-10-03)
    if (s.edad === undefined && S.era === 1) { S.edad = 1; S.ganadoF = false; } // reabre el Neolítico a quien cerró el Paleo con reglas viejas
    // ganadoF solo se PONE en true, nunca se baja: un save que "cerró" la época antes de que un saber
    // existiera (p.ej. el telar) lo conserva true y ofrece pasar de época con ese saber sin aprender.
    // Se re-deriva del estado REAL mientras siga en la Época 1: si falta algún saber, la época se reabre.
    if (S.era === 1 && S.ganadoF) {
      const domL = i => S.tecs[i] && S.tecs[i].fase === 'meseta';
      if (!saberesEpoca(1).every(domL)) S.ganadoF = false; // los DIEZ, derivados de la ficha única
    }
    if (!S.mats) S.mats = { lena: 0, fibra: 0, ocre: 0, hueso: 0, silex: 0 };
    const off = Math.min((Date.now() - ts) / 1000, 8 * 3600);
    if (off > 60) recuperarAusencia(off);
    return true;
  } catch { return false; }
}
/* Ponerse al día tras una ausencia, a pasos gruesos, y contarlo. Lo usan DOS caminos: cargar() al abrir
   la página, y el bucle de la economía cuando el equipo despierta de una suspensión SIN recargar (ese
   camino topaba en 600 pasos de 1 s: dormías dos horas y solo se recuperaban diez minutos). */
function recuperarAusencia(seg) {
  const antes = S.apr;
  const paso = Math.max(1, seg / 600);
  for (let t = 0; t < seg; t += paso) tick(paso, true);
  S.apr = Math.min(S.apr, memoriaTope()); // el último paso grueso se pasaba del tope de la Época 1 y el aviso prometía de más (QA general)
  // POR QUÉ SIGUEN APRENDIENDO SIN TI: no es una licencia del género idle, es la tesis del juego.
  // Durante decenas de miles de años se aprendió sin maestro y sin clase, mirando, imitando y jugando
  // a lo que hacían los mayores. El jugador no fabrica el aprendizaje: lo dirige y lo acelera.
  // (Y aquí no se habla de "año escolar": la escuela llega en la Época 11, no en la estepa.)
  const siguio = S.era === 1
    ? 'el clan siguió viviendo, y vivir juntos ya es aprender: los pequeños miraron, imitaron y jugaron a lo que hacen los mayores'
    : ordEra(S.era) < 11
      ? `${LEX().casa} siguió su ritmo sin ti: se copió, se recitó y el oficio pasó de mano en mano`
      : 'el curso siguió su marcha sin ti: nadie deja de aprender porque tú no mires';
  $('offline').style.display = 'block';
  $('offline').innerHTML = `🌙 <b>Mientras no estabas</b> (${Math.floor(seg / 60)} min): ${siguio}. <b>${fmt(S.apr - antes)}</b> 📖. <u>cerrar</u>`;
  $('offline').onclick = () => { $('offline').style.display = 'none'; }; // onclick y no addEventListener: si se muestra dos veces, no apila oyentes
}

/* ============================================================
   FX DE ESCENA
   ============================================================ */
