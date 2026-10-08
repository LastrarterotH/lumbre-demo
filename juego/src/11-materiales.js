/* ============================================================
   11-materiales
   Los materiales del forrajeo, las luces que se recogen y el evento de la cacería.
   ============================================================ */
const MATERIALES = [
  { k: 'lena',  emoji: '🪵', n: 'leña',  tec: -1 },   // alimenta el fuego
  { k: 'fibra', emoji: '🪢', n: 'fibra', tec: 11 },   // el tambor
  { k: 'ocre',  emoji: '🟤', n: 'ocre',  tec: 12 },   // las pinturas
  { k: 'hueso', emoji: '🦴', n: 'hueso', tec: 13 },   // el conteo
  { k: 'silex', emoji: '🪨', n: 'sílex', tec: 15 },   // la cacería
  { k: 'grano', emoji: '🌾', n: 'grano', tec: 25 },   // el excedente neolítico
  { k: 'barro', emoji: '🟫', n: 'barro', tec: 16, era: 2 }, // SUMER: el barro del río, la materia de la memoria
  { k: 'papiro', emoji: '🌿', n: 'papiro', tec: 20, era: 3, eras: [3, 5] }, // EGIPTO: los tallos del junco; la hoja cara que el ostracón protege (era3-plan). ALEJANDRÍA: el papiro del lago Mareotis, que se gasta copiando (era5-plan)
  { k: 'cera', emoji: '🍯', n: 'cera', tec: 33, era: 4 },      // ATENAS: la cera de las colmenas del olivar; cada duda resuelta gasta una tablilla (era4-plan)
  { k: 'papel', emoji: '📜', n: 'papel', tec: 47, era: 6 },    // BAGDAD: las hojas del molino del canal; cada traducción se copia en una (era6-plan)
  { k: 'amate', emoji: '🍂', n: 'amate', tec: 51, era: 7 },
  { k: 'pergamino', emoji: '🐑', n: 'pergamino', tec: 57, era: 8 },
  { k: 'pliego', emoji: '📄', n: 'pliego', tec: 63, era: 9 },
  { k: 'calculi', emoji: '⚪', n: 'calculi', tec: 75, era: 14 },
  { k: 'atencion', emoji: '🎯', n: 'atención', tec: 87, era: 21 },   // EL FUTURO: la atención, lo que escasea cuando todo lo demás sobra; se junta en los lugares tranquilos del valle y la pide preguntar como un tutor (era21-plan)
  { k: 'tinta', emoji: '⚫', n: 'tinta', tec: 81, era: 15 },        // CHINA SONG: la barra de hollín de pino, uno de los cuatro tesoros del estudio; la abre la escuela de la prefectura y la pide la imprenta de los clásicos (era15-plan)   // ROMA: las piedrecillas de contar que se juntan en la orilla del Tíber; pasar del ludus gasta una (era14-plan)
  { k: 'pizarra', emoji: '🪨', n: 'pizarra', tec: 69, era: 10 },   // SANTIAGO: las pizarras de piedra que llegan en la diligencia de Valparaíso; cada normalista lleva las suyas (era10-plan)   // ÁMSTERDAM: el papel de imprenta de los molinos de viento; cada tirada gasta uno (era9-plan)   // PARÍS: las pieles raspadas del pergaminero, junto al Sena; cada libro copiado gasta una (era8-plan)    // TENOCHTITLAN: los pliegos de corteza que dejan las canoas del tributo; cada estudiante del calmécac gasta uno (era7-plan)
];
const matDeEra = (m, era) => m.eras ? m.eras.includes(era) : (m.era || 1) === era;   // un material puede servir en más de una época (el papiro: Egipto y Alejandría)
const MAT_DE_TEC = {}; // DERIVADA de la ficha única (T.mat en 01-balance): qué material pide crear cada saber
BALANCE.tecnologias.forEach((T, i) => { if (T.mat) MAT_DE_TEC[i] = T.mat; });
const MAT_COSTO = 2;
// La oferta de materiales era infinita (+1 cada 6 s, para siempre) y la demanda de una sola vez: 2 por
// saber. Se acumulaban cientos que no servían para nada. El clan deja de traer lo que ya está cubierto.
// La moneda acuñada no existe hasta ~600 a. C.: en el fogón el recurso es la cesta de lo reunido, y en
// Sumer y Egipto el tributo se mide en jarras y medidas. La moneda llega con la escuela de 1920.
function monIco() { return S.era === 1 ? '🧺' : ordEra(S.era) < 11 ? '🏺' : '🪙'; }
const LENA_COMODA = 30;                       // la leña sí tiene sumidero continuo: el fuego
function matPendiente(k) {                    // cuánto pide todavía esta época de ese material
  let n = 0;
  for (const i in MAT_DE_TEC) if (MAT_DE_TEC[i] === k && S.tecs[i] && S.tecs[i].fase === 'sin') n += MAT_COSTO;
  return n;
}
const BARRO_COMODO = 24;                      // como la leña: el barro tiene sumidero continuo en Sumer (la copia y el dictado lo gastan)
function matSobra(k) {
  if (k === 'lena') return (S.mats.lena || 0) >= LENA_COMODA;
  if (k === 'barro' && S.era === 2) return (S.mats.barro || 0) >= BARRO_COMODO; // el río no deja de importar: la edubba va a gastarlo
  if (k === 'papiro' && S.era === 5 && typeof rollosAbierto === 'function' && rollosAbierto()) return (S.mats.papiro || 0) >= 6;
  if (k === 'pergamino' && S.era === 8 && typeof scriptoriumAbierto === 'function' && scriptoriumAbierto()) return (S.mats.pergamino || 0) >= 8;
  if (k === 'pliego' && S.era === 9 && typeof prensaAbierta === 'function' && prensaAbierta()) return (S.mats.pliego || 0) >= 10;
  if (k === 'calculi' && S.era === 14 && typeof ludusAbierto === 'function' && ludusAbierto()) return (S.mats.calculi || 0) >= 12;   // ROMA: con el ludus, cada niño que pasa gasta un calculus
  if (k === 'atencion' && S.era === 21 && typeof tutorFu === 'function' && tutorFu()) return (S.mats.atencion || 0) >= 8;   // EL FUTURO: con el tutor, cada pregunta gasta una atención
  if (k === 'pizarra' && S.era === 10 && typeof normalAbierta === 'function' && normalAbierta()) return (S.mats.pizarra || 0) >= 8;   // SANTIAGO: con la Normal, cada normalista lleva pizarras   // ÁMSTERDAM: con la prensa, cada tirada gasta un pliego   // PARÍS: con el scriptorium, cada libro gasta un pergamino
  if (k === 'amate' && S.era === 7 && typeof calmecacAbierto === 'function' && calmecacAbierto()) return (S.mats.amate || 0) >= 6;   // TENOCHTITLAN: con el calmécac, cada estudiante gasta un pliego
  if (k === 'papel' && S.era === 6 && typeof mesaAbierta === 'function' && mesaAbierta()) return (S.mats.papel || 0) >= 6 + 2 * nivelTec(45); // BAGDAD: con la mesa, cada traducción gasta una hoja: se junta un respiro // ALEJANDRÍA: con los barcos, cada copia gasta papiro: se junta un respiro
  return (S.mats[k] || 0) >= matPendiente(k) + 4;   // lo pendiente más un respiro
}
const emojiMat = k => (MATERIALES.find(m => m.k === k) || {}).emoji || '';
/* ---------- LA QUERENCIA: cada material tiene su sitio ----------
   El forrajeo enseñaba el TIPADO (cada saber pide su material) pero no lo otro que el oficio enseña de
   verdad: SABER DÓNDE. El spawn era aleatorio uniforme, así que buscar era mirar la pantalla entera.
   Ahora cada material nace en su región, y son las que ya están dibujadas en el mundo: el ocre al pie del
   peñón (que es de donde sale la tierra de color y donde se pinta), el sílex en la orilla del lago, la
   leña junto a los troncos caídos y el árbol seco, la fibra donde trabajan las recolectoras, el hueso
   donde están los animales (el paso de la manada mientras se caza; el corral cuando ya hay aldea).
   Lo que NO se hace es la mitad estacional (un material que solo sale en cierta ventana del año sería el
   timer punitivo que el GDD prohíbe): aquí nunca se llega tarde, solo se aprende a mirar. */
/* EL RÍO DE SUMER: una banda por la esquina sureste (03-terreno la pinta; aquí vive su geometría,
   compartida, porque la querencia del barro y el spawn la necesitan). La ciudad vive pegada al agua. */
const RIO_SUMER = { ax: 19.0, ay: 6.8, bx: 9.0, by: 18.6 };
function distRioSumer(x, y) {
  const dx = RIO_SUMER.bx - RIO_SUMER.ax, dy = RIO_SUMER.by - RIO_SUMER.ay, L2 = dx * dx + dy * dy;
  let tt = ((x - RIO_SUMER.ax) * dx + (y - RIO_SUMER.ay) * dy) / L2; tt = Math.max(0, Math.min(1, tt));
  return Math.hypot(x - (RIO_SUMER.ax + tt * dx), y - (RIO_SUMER.ay + tt * dy));
}
const QUERENCIA = {
  ocre:  [{ x: 9.6, y: 8.2, r: 1.5 }, { x: 16.6, y: 9.0, r: 1.0 }],                              // el pie del peñón y la roca del este
  // el sílex quiere la ORILLA, no el charco: un anillo por fuera del agua (`rMin`), porque un disco
  // centrado en la laguna caía dentro y se pasaba la vida resorteando
  silex: [{ x: 14.9, y: 14.6, r: 2.85, rMin: 2.2 }],
  lena:  [{ x: 14.4, y: 6.5, r: 1.5 }, { x: 12.4, y: 5.9, r: 1.2 }, { x: 3.5, y: 13.2, r: 1.5 }], // el árbol seco y los troncos caídos
  fibra: [{ x: 4.0, y: 12.6, r: 1.6 }, { x: 12.6, y: 9.4, r: 1.6 }, { x: 7.6, y: 14.4, r: 1.6 }], // donde las recolectoras ya están trabajando
  barro: [{ x: 15.9, y: 12.55, r: 0.6 }, { x: 13.2, y: 15.6, r: 0.55 }], // SUMER: las dos orillas del río (pegadas a la banda de 03-terreno, fuera del agua)
  papiro: [{ x: 15.3, y: 9.2, r: 0.7 }, { x: 11.6, y: 14.6, r: 0.7 }],   // EGIPTO: los juncales de las dos orillas del Nilo (fuera del cauce; ver NILO abajo)
  cera:   [{ x: 4.6, y: 10.1, r: 0.9 }]                                    // ATENAS: las colmenas al pie del olivar de Academo
};
// cómo lo dice la voz de la época cuando aún no hay luz encendida (la consejera manda a la zona, no "por ahí")
/* EL JUNCAL SIGUE AL AGUA (2026-09-06, jugando Egipto). Los dos focos fijos del papiro estaban a 1,1 y
   0,95 del eje del Nilo, o sea DENTRO de la franja que puntoDeForrajeo rechaza como agua (< 1,6): casi
   todos los intentos fallaban y el tallo nacía en el «claro junto al fogón», que en Egipto es desierto
   puro al oeste de la vega, mientras la consejera prometía «donde el Nilo moja». Y cuando un intento
   pasaba, caía a 1,6-2,3 del eje: bajo el agua en la crecida (1,94). Ahora el papiro nace a la orilla
   de HOY: sobre el meandro real, a medio tile largo por fuera del agua de la estación, en cualquiera
   de las dos riberas, y en los tramos del río que no pisan la fachada del templo ni la esfinge. */
function puntoDeJuncal() {
  const dx = NILO.bx - NILO.ax, dy = NILO.by - NILO.ay, L = Math.hypot(dx, dy);
  const nx = dy / L, ny = -dx / L; // la normal al eje: +1 va a la ribera este (x, y crecen), -1 a la oeste
  for (let i = 0; i < 24; i++) {
    const lado = Math.random() < 0.5 ? 1 : -1;
    const u = lado > 0 ? 0.46 + Math.random() * 0.22 : 0.50 + Math.random() * 0.30; // la ribera este es angosta: su tramo útil es más corto
    const e = ejeNilo(u), off = niloAgua() + 0.45 + Math.random() * 0.45;
    const x = e.x + nx * off * lado, y = e.y + ny * off * lado;
    if (x > 2.3 && x < 17.0 && y > 3.8 && y < 17.2) return { x, y };
  }
  return { x: 9.6, y: 15.2 }; // la vega del suroeste, siempre seca y siempre dentro
}
/* LA CHISPA NO NACE EN EL AGUA (2026-09-06): su región (x 4,5-13 · y 9-14) cruza el río en Sumer y en
   Egipto (el punto (13, 14) cae EN el cauce de los dos), y una chispa de curiosidad flotando en mitad
   del Nilo se lee como un error. Se sortea en la misma región, rechazando el agua de cada época. */
function puntoDeChispa() {
  for (let i = 0; i < 16; i++) {
    const x = 4.5 + Math.random() * 8.5, y = 9 + Math.random() * 5;
    const enAgua = S.era === 2 ? distRioSumer(x, y) < 1.4 : S.era === 3 ? distNiloVega(x, y) < niloAgua() + 0.4 : S.era === 4 ? distIlisos(x, y) < 1.1 : S.era === 5 ? enAguaAl(x, y, 0.4) : S.era === 6 ? enAguaBa(x, y, 0.4) : S.era === 7 ? enLagoTe(x, y, 0.3) : S.era === 8 ? enAguaPa(x, y, 0.3) : S.era === 9 ? enAguaAm(x, y) || enAguaAm(x + 0.3, y) || enAguaAm(x - 0.3, y) || enAguaAm(x, y + 0.3) || enAguaAm(x, y - 0.3) : S.era === 10 ? enAguaSa(x, y) || enAguaSa(x, y + 0.3) || enAguaSa(x, y - 0.3) || enAndesSa(x - 0.3, y - 0.3) || enCerroSa(x, y, 0.2) : S.era === 14 ? enAguaRo(x, y, 0.3) || enColinaRo(x, y, 0.2) : S.era === 15 ? enAguaCh(x, y, 0.3) || enMurallaCh(x, y, 0.3) || enPagodaCh(x, y, 0.1) : S.era === 21 ? sobreElLago(x, y) || enNieblaFu(x, y) : false;
    if (!enAgua && (!LUMBRE.libre || LUMBRE.libre(x, y))) return { x, y };   // el 3D descarta lo que cae dentro de algo
  }
  return { x: 7.0, y: 10.5 };
}
const QUERENCIA_DICE = {
  lena:  'Búscala donde hay madera muerta: los troncos caídos y el árbol seco.',
  fibra: 'Sale donde trabajan las recolectoras: arrímate a ellas y mira lo que juntan.',
  ocre:  'Se saca al pie del peñón, donde la roca tiñe la tierra.',
  hueso: 'Se recoge donde están los animales.',
  silex: 'Se busca en la orilla del agua: el cauce lo deja limpio.',
  barro: 'Se saca de la ribera, donde amarra la barca: el río lo deja limpio y amasable.',
  get papiro() { return S && S.era === 5 ? 'Crece en el juncal del lago Mareotis, al sur de la ciudad: de ahí sale el papiro de Alejandría.' : 'Crece en los juncales de la ribera: donde el Nilo moja, el tallo espera.'; },
  cera:   'La dan las colmenas al pie del olivar: donde zumban las abejas, la cera espera.',
  papel:  'Sale del molino del canal, al sur de la ciudad, donde la noria mueve los mazos que baten los trapos.',
  amate:  'Lo dejan en el embarcadero de la isla las canoas del tributo, que llegan de las tierras calientes con los pliegos de corteza.',
  pergamino: 'Sale del taller del pergaminero, junto al Sena, donde las pieles se remojan, se raspan y se estiran en sus bastidores.',
  pliego: 'Sale del molino de papel de viento, sobre el bastión de la muralla: los trapos molidos se vuelven pliegos.',
  calculi: 'Las piedrecillas lisas se juntan en la orilla del Tíber, frente a la isla: el río las deja redondas, buenas para contar.',
  atencion: 'Se junta en los lugares tranquilos del valle: la orilla de la laguna, la sombra de los árboles grandes, la entrada de la cueva. Lejos de las pantallas.',
  tinta: 'Sale del horno de hollín, junto a los pinos al pie de la muralla: se quema leña de pino, se raspa el hollín de las paredes y se amasa con cola en barras.',
  pizarra: 'Llega en la diligencia de Valparaíso, adonde la traen los barcos: búscala en el patio de la estación, al poniente de la ciudad.'
};
/* EL NILO DE EGIPTO: la geometría vive AQUÍ y la usan todos (el terreno que lo pinta, la corriente
   que lo mueve, la querencia del papiro y el spawn). Antes el eje estaba copiado en 03-terreno y el
   ancho del agua se calculaba dentro de renderTerrain, así que nadie más podía saber dónde moja. */
/* El eje se estiró el 2026-08-25 por las dos puntas (antes iba de 17,4·8,2 a 10,2·18,2, y la de arriba
   moría DENTRO del bloque: el agua terminaba en un tope redondo en mitad del desierto, «el río cortado
   a la mala»). Ahora nace y muere fuera del mundo, y el recorte al diamante lo corta en la arista, que
   es donde el ojo acepta que el río siga. */
const NILO = { ax: 19.6, ay: 5.1, bx: 8.6, by: 20.4 };
const NILO_HUELLA = 2.35;   // hasta donde llega el agua en ajet: el limo que la retirada deja al descubierto
const NILO_VEGA = 3.15;     // la cinta fértil que ese limo alimenta, entre el agua y el desierto
function niloAgua() {       // semiancho del AGUA de hoy: 1,94 en la crecida · 1,32 en la siembra · 1,09 en la cosecha
  const cre = (typeof crecidaHoy === 'function' ? crecidaHoy() : 1) || 1;
  return 1.55 * cre - 0.15;
}
function ejeNilo(u) {       // el meandro, el mismo que dibuja el terreno
  return { x: NILO.ax + (NILO.bx - NILO.ax) * u + Math.sin(u * 6.5) * 0.3,
           y: NILO.ay + (NILO.by - NILO.ay) * u + Math.cos(u * 5) * 0.22 };
}
function puntoNilo(u, perp, z) { // u 0-1 aguas abajo; perp en unidades de mundo desde el eje
  const dx = NILO.bx - NILO.ax, dy = NILO.by - NILO.ay, L = Math.hypot(dx, dy);
  const m = ejeNilo(u);
  return P(m.x + (-dy / L) * perp, m.y + (dx / L) * perp, z);
}
function distNiloVega(x, y) {
  const dx = NILO.bx - NILO.ax, dy = NILO.by - NILO.ay, L2 = dx * dx + dy * dy;
  let tt = ((x - NILO.ax) * dx + (y - NILO.ay) * dy) / L2; tt = Math.max(0, Math.min(1, tt));
  return Math.hypot(x - (NILO.ax + tt * dx), y - (NILO.ay + tt * dy));
}
function querenciaDe(k) {
  // los animales cambian de sitio con la época. El foco neolítico va PEGADO al corral pero fuera del
  // cerco (que crece hasta 13.95 × 12.73 con las etapas): un hueso brillando entre las ovejas se lee mal
  if (k === 'hueso') return S.edad >= 2 ? [{ x: 14.6, y: 9.6, r: 1.0 }] : [{ x: 13.3, y: 5.6, r: 1.6 }];
  if (k === 'papiro' && S.era === 5) return [6.5, 9.2, 12.0, 14.8].map(x => ({ x, y: lagoAl(x) - 0.7, r: 0.6 }));
  if (k === 'pergamino' && S.era === 8) return [{ x: 14.6, y: 10.95, r: 0.4 }, { x: 15.5, y: 11.1, r: 0.35 }, { x: 14.2, y: 10.35, r: 0.3 }];
  if (k === 'calculi' && S.era === 14) return [{ x: ORILLA_RO.x, y: ORILLA_RO.y, r: 0.3 }, { x: ORILLA_RO.x - 0.05, y: ORILLA_RO.y + 0.75, r: 0.25 }, { x: 6.4, y: 14.05, r: 0.25 }];   // ROMA: la playa de guijarros del Tíber, río abajo del puente Fabricio, y la orilla junto a su cabeza
  if (k === 'atencion' && S.era === 21) return QUIETOS_FU.map(([x, y, r]) => ({ x, y, r }));   // EL FUTURO: los lugares tranquilos del valle (la orilla de la laguna, bajo los árboles grandes, la entrada de la cueva), lejos de las pantallas
  if (k === 'tinta' && S.era === 15) return [{ x: HORNO_TINTA_CH.x, y: HORNO_TINTA_CH.y, r: 0.3 }, { x: HORNO_TINTA_CH.x - 0.55, y: HORNO_TINTA_CH.y - 0.25, r: 0.22 }, { x: HORNO_TINTA_CH.x + 0.25, y: HORNO_TINTA_CH.y + 0.45, r: 0.22 }];   // CHINA SONG: el patio del horno de hollín, junto a los pinos (anclas provisionales, 09j-kaifeng)
  if (k === 'pizarra' && S.era === 10) return [{ x: DILIGENCIA_SA.x + 0.2, y: DILIGENCIA_SA.y - 0.5, r: 0.3 }, { x: DILIGENCIA_SA.x + 0.6, y: DILIGENCIA_SA.y + 0.2, r: 0.3 }, { x: DILIGENCIA_SA.x + 0.1, y: DILIGENCIA_SA.y + 0.3, r: 0.25 }];   // SANTIAGO: el patio de la estación de la diligencia
  if (k === 'pliego' && S.era === 9) return [{ x: MOLINO_AM.x - 0.9, y: MOLINO_AM.y - 0.7, r: 0.35 }, { x: MOLINO_AM.x - 1.3, y: MOLINO_AM.y - 0.2, r: 0.3 }, { x: MOLINO_AM.x - 0.5, y: MOLINO_AM.y - 1.2, r: 0.3 }];   // ÁMSTERDAM: al pie del molino de papel, adentro de la muralla   // PARÍS: el patio del pergaminero, junto al río
  if (k === 'amate' && S.era === 7) return [{ x: 16.5, y: 9.85, r: 0.22 }, { x: 16.6, y: 10.4, r: 0.2 }, { x: 15.9, y: 8.0, r: 0.2 }];   // TENOCHTITLAN: junto al taller del amate y el embarcadero del tributo
  if (k === 'papel' && S.era === 6) return [{ x: MOLINO_BA.x - 0.9, y: MOLINO_BA.y - 2.2, r: 0.55 }, { x: MOLINO_BA.x - 1.8, y: MOLINO_BA.y - 2.45, r: 0.3 }, { x: MOLINO_BA.x - 0.4, y: MOLINO_BA.y - 1.9, r: 0.3 }];   // BAGDAD: el patio del molino de papel, detrás de su casa   // ALEJANDRÍA: el juncal de la orilla del lago Mareotis
  return QUERENCIA[k] || [];
}
// Nada nace sobre la parcela sembrada ni dentro del cerco: además de leerse mal (una madeja encima de la
// cebada, un hueso entre las ovejas), el clic del campo GANA al de la luz y la vuelve casi irrecogible.
function sobreLoTrabajado(x, y) {
  if (S.era !== 1 || S.edad < 2) return false;
  if (S.tecs[24] && S.tecs[24].fase !== 'sin') { const c = campoRect(); if (x > c.x0 - 0.2 && x < c.x1 + 0.2 && y > c.y0 - 0.2 && y < c.y1 + 0.2) return true; }
  if (S.tecs[25] && S.tecs[25].fase !== 'sin') { const r = corralRect(); if (x > r.x0 - 0.2 && x < r.x1 + 0.2 && y > r.y0 - 0.2 && y < r.y1 + 0.2) return true; }
  return false;
}
function puntoDeForrajeo(mat) { // dónde nace esta luz: en la querencia de su material, con margen para no repetirse
  if (mat && mat.k === 'papiro' && S.era === 3) return puntoDeJuncal();
  const focos = querenciaDe(mat && mat.k);
  for (let i = 0; i < 16; i++) {
    let x, y;
    if (focos.length) {
      const f = focos[Math.floor(Math.random() * focos.length)], r0 = f.rMin || 0;
      const a = Math.random() * Math.PI * 2;
      const r = Math.sqrt(r0 * r0 + Math.random() * (f.r * f.r - r0 * r0));       // uniforme en el disco (o en el anillo, si trae rMin)
      x = f.x + Math.cos(a) * r; y = f.y + Math.sin(a) * r * 0.79;                // achatado igual que la laguna y que toda la proyección
    } else { x = 3.5 + Math.random() * 11; y = 8.5 + Math.random() * 6.5; }       // la chispa de curiosidad no tiene querencia: es curiosidad
    const enAgua = S.era === 2 ? distRioSumer(x, y) < 1.3 : S.era === 3 ? distNiloVega(x, y) < 1.6 : S.era === 4 ? distIlisos(x, y) < 1.1 : S.era === 5 ? enAguaAl(x, y, 0.3) : S.era === 6 ? (enAguaBa(x, y, 0.3) || enMuralla(x, y, 0.5)) : S.era === 7 ? enLagoTe(x, y, 0.25) : S.era === 8 ? enAguaPa(x, y, 0.25) : S.era === 9 ? enAguaAm(x, y) || enAguaAm(x + 0.25, y) || enAguaAm(x, y + 0.25) : S.era === 10 ? enAguaSa(x, y) || enAndesSa(x - 0.25, y - 0.25) || enCerroSa(x, y, 0.15) : S.era === 14 ? enAguaRo(x, y, 0.25) || enColinaRo(x, y, 0.15) : S.era === 15 ? enAguaCh(x, y, 0.25) || enMurallaCh(x, y, 0.25) || enPagodaCh(x, y, 0.1) : S.era === 21 ? sobreElLago(x, y) || enNieblaFu(x, y) : sobreElLago(x, y); // cada época rechaza SU agua
    if (!enAgua && x > 1.8 && x < 17.2 && y > 3.8 && y < 17.4 && !sobreLoTrabajado(x, y) && (!LUMBRE.libre || LUMBRE.libre(x, y))) return { x, y };
  }
  return { x: 6.2 + Math.random() * 4, y: 11.4 + Math.random() * 2.6 };           // último recurso: el claro junto al fogón
}
const MAT_COL = { lena: ['#8a6a4a', '#a3805c'], fibra: ['#a8904e', '#cdb877'], ocre: ['#b8642c', '#d98a4a'], hueso: ['#e6ddc6', '#f4eeda'], silex: ['#8f99a2', '#b3bcc4'], grano: ['#c9a84a', '#e4c96a'], barro: ['#8d5f3e', '#aa7a52'], papiro: ['#6f9a44', '#9cc468'], cera: ['#c9a24a', '#e8c96a'] , papel: ['#e9dfc4', '#fbf5e3'], amate: ['#a9824e', '#cfae7c'], pergamino: ['#e8dcc0', '#f6eedc'], pliego: ['#f2ecdc', '#fffaf0'], pizarra: ['#4a5058', '#6a7078'], calculi: ['#d8d2c4', '#f2eee4'], tinta: ['#24211e', '#4a4540'], atencion: ['#e3a23c', '#f6d27e'] };
function drawMaterialForma(b, s, k) { // el montoncito según el material
  const [c, cl] = MAT_COL[k];
  if (k === 'lena') {
    g.strokeStyle = c; g.lineWidth = 2.6 * s; g.lineCap = 'round';
    g.beginPath(); g.moveTo(b.x - 5 * s, b.y - 1 * s); g.lineTo(b.x + 5 * s, b.y - 3 * s); g.stroke();
    g.beginPath(); g.moveTo(b.x - 4 * s, b.y - 4 * s); g.lineTo(b.x + 5 * s, b.y - 0.5 * s); g.stroke();
    dot({ x: b.x + 5 * s, y: b.y - 2.5 * s }, 1.2 * s, cl);
  } else if (k === 'grano') {
    g.strokeStyle = c; g.lineWidth = 1.8 * s; g.lineCap = 'round';
    g.beginPath(); g.moveTo(b.x, b.y + 2 * s); g.lineTo(b.x, b.y - 6 * s); g.stroke();
    for (let q = 0; q < 3; q++) { const yy = b.y - 5 * s + q * 3 * s; line({ x: b.x, y: yy }, { x: b.x - 3 * s, y: yy + 1.6 * s }, cl, 1.6 * s); line({ x: b.x, y: yy }, { x: b.x + 3 * s, y: yy + 1.6 * s }, cl, 1.6 * s); }
    dot({ x: b.x, y: b.y - 6.5 * s }, 1.4 * s, cl);
  } else if (k === 'silex') {
    poly([{ x: b.x - 5 * s, y: b.y }, { x: b.x - 2 * s, y: b.y - 6 * s }, { x: b.x + 3 * s, y: b.y - 6.5 * s }, { x: b.x + 6 * s, y: b.y - 2 * s }, { x: b.x + 2 * s, y: b.y + 1 * s }], c);
    poly([{ x: b.x - 2 * s, y: b.y - 6 * s }, { x: b.x + 3 * s, y: b.y - 6.5 * s }, { x: b.x + 1 * s, y: b.y - 3 * s }, { x: b.x - 2.5 * s, y: b.y - 2.5 * s }], cl);
  } else if (k === 'hueso') {
    g.strokeStyle = c; g.lineWidth = 3 * s; g.lineCap = 'round';
    g.beginPath(); g.moveTo(b.x - 4 * s, b.y - 4.5 * s); g.lineTo(b.x + 4 * s, b.y - 1 * s); g.stroke();
    dot({ x: b.x - 4 * s, y: b.y - 4.5 * s }, 1.7 * s, cl); dot({ x: b.x + 4 * s, y: b.y - 1 * s }, 1.7 * s, cl);
  } else if (k === 'ocre') {
    dot({ x: b.x + 0.5 * s, y: b.y - 3 * s }, 4 * s, c); dot({ x: b.x - 1.5 * s, y: b.y - 4.2 * s }, 1.9 * s, cl);
  } else if (k === 'barro') { // el pan de barro húmedo, con su brillo de recién sacado
    ellipse({ x: b.x, y: b.y - 2 * s }, 4.6 * s, 3 * s, c);
    ellipse({ x: b.x - 0.6 * s, y: b.y - 3.4 * s }, 3 * s, 2 * s, cl);
    dot({ x: b.x - 1.6 * s, y: b.y - 4 * s }, 0.9 * s, '#e8d8c4');
  } else if (k === 'calculi') { // un puñado de piedrecillas lisas del río, para contar
    for (const [dx, dy, r] of [[-3, -1.6, 1.8], [0.4, -2.6, 2.0], [3.2, -1.2, 1.7], [-1.2, -4.4, 1.6], [2.0, -4.6, 1.5]]) { dot({ x: b.x + dx * s, y: b.y + dy * s }, r * s, c); dot({ x: b.x + (dx - 0.4) * s, y: b.y + (dy - 0.5) * s }, r * 0.45 * s, cl); }
  } else if (k === 'atencion') { // la atención: un círculo cálido con su centro, como una diana (el 3D dibuja su luz)
    for (const [r, c2] of [[4.6, c], [3.2, cl], [1.8, c], [0.7, '#fff6dc']]) ellipse({ x: b.x, y: b.y - 3 * s }, r * s, r * 0.8 * s, c2);
  } else if (k === 'tinta') { // dos barras de tinta de hollín de pino, negras, con sus caracteres dorados
    for (const [dx, a] of [[-2.2, -0.35], [2.0, 0.25]]) {
      g.save(); g.translate(b.x + dx * s, b.y - 2.6 * s); g.rotate(a);
      g.fillStyle = c; g.fillRect(-1.6 * s, -4.6 * s, 3.2 * s, 9.2 * s);
      g.fillStyle = cl; g.fillRect(-1.6 * s, -4.6 * s, 1.0 * s, 9.2 * s);                       // el canto con luz
      g.fillStyle = '#c9a24a'; g.fillRect(-0.4 * s, -3.2 * s, 1.0 * s, 1.0 * s); g.fillRect(-0.4 * s, -1.4 * s, 1.0 * s, 1.0 * s);   // los caracteres dorados
      g.restore();
    }
  } else if (k === 'cera') { // el panal: un pan de cera con sus celdas, y una abeja que lo ronda
    ellipse({ x: b.x, y: b.y - 3 * s }, 5.5 * s, 4 * s, c); ellipse({ x: b.x - 0.6 * s, y: b.y - 3.6 * s }, 3.6 * s, 2.4 * s, cl);
    g.strokeStyle = c; g.lineWidth = 0.5 * s; for (let q = -1; q <= 1; q++) for (let r = -1; r <= 1; r++) { g.beginPath(); g.arc(b.x + q * 1.8 * s, b.y - 3.6 * s + r * 1.5 * s, 0.7 * s, 0, 7); g.stroke(); }
    dot({ x: b.x + 6 * s, y: b.y - 7 * s }, 0.8 * s, '#3a2c1c'); dot({ x: b.x + 6.7 * s, y: b.y - 7 * s }, 0.6 * s, cl);
  } else if (k === 'papiro') { // el haz de tallos de junco, con sus umbelas
    g.strokeStyle = c; g.lineWidth = 1.7 * s; g.lineCap = 'round';
    for (let q = -1; q <= 1; q++) { g.beginPath(); g.moveTo(b.x + q * 2 * s, b.y + 1 * s); g.lineTo(b.x + q * 3 * s, b.y - 6 * s); g.stroke(); }
    for (let q = -1; q <= 1; q++) for (let w = 0; w < 3; w++) {
      const tx = b.x + q * 3 * s, ty = b.y - 6 * s, a2 = -Math.PI / 2 + (w - 1) * 0.7 + q * 0.15;
      line({ x: tx, y: ty }, { x: tx + Math.cos(a2) * 3 * s, y: ty + Math.sin(a2) * 3 * s }, cl, 1.2 * s);
    }
  } else { // fibra: madeja
    g.strokeStyle = c; g.lineWidth = 1.4 * s; g.lineCap = 'round';
    for (let k2 = 0; k2 < 3; k2++) { g.beginPath(); g.ellipse(b.x, b.y - 3 * s, (4 - k2) * s, (2.6 - k2 * 0.5) * s, k2 * 0.6, 0, 7); g.stroke(); }
  }
}
function drawNodo(node, t) {
  const s = zoom, age = t - node.born;
  const vida = node.mat ? 30 : 13; // los materiales esperan mucho más: eran casi invisibles Y fugaces
  const fade = age < 0.3 ? age / 0.3 : (age > vida - 2 ? Math.max(0, (vida - age) / 2) : 1);
  const pulso = 0.6 + 0.4 * Math.sin(t * 4.5 + node.x);
  ellipse(P(node.x, node.y), 4.2 * s, 1.9 * s, 'rgba(20,32,14,.18)');
  g.save(); g.globalAlpha = fade;
  if (node.mat) {                                          // un montoncito de material en el suelo
    const b = P(node.x, node.y, 0);
    const gl = g.createRadialGradient(b.x, b.y - 3 * s, 0, b.x, b.y - 3 * s, 15 * s);
    gl.addColorStop(0, `rgba(255,240,190,${0.55 * pulso})`); gl.addColorStop(1, 'rgba(255,240,190,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(b.x, b.y - 3 * s, 15 * s, 0, 7); g.fill();
    drawMaterialForma(b, s, node.mat.k);                   // su columna de luz + cruz van en drawSenalNodos (overlay: sobre la noche)
  } else {                                                 // la chispa dorada flotante (otras épocas)
    const bob = Math.sin(t * 2.3) * 3, p = P(node.x, node.y, 15 + bob);
    const gl = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, 15 * s);
    gl.addColorStop(0, `rgba(255,222,120,${0.5 * pulso})`); gl.addColorStop(1, 'rgba(255,222,120,0)');
    g.fillStyle = gl; g.beginPath(); g.arc(p.x, p.y, 15 * s, 0, 7); g.fill();
    g.fillStyle = '#ffd24a';
    g.beginPath(); g.moveTo(p.x, p.y - 7 * s);
    g.quadraticCurveTo(p.x + 1.7 * s, p.y - 1.7 * s, p.x + 7 * s, p.y);
    g.quadraticCurveTo(p.x + 1.7 * s, p.y + 1.7 * s, p.x, p.y + 7 * s);
    g.quadraticCurveTo(p.x - 1.7 * s, p.y + 1.7 * s, p.x - 7 * s, p.y);
    g.quadraticCurveTo(p.x - 1.7 * s, p.y - 1.7 * s, p.x, p.y - 7 * s);
    g.closePath(); g.fill(); dot(p, 1.9 * s, '#fff6d8');
  }
  g.restore();
}
function drawSenalNodos(t) { // la señal de los materiales vive en el OVERLAY: brilla sobre la noche y sobre los árboles
  for (const node of colectibles) {
    if (!node.mat) continue;
    const s = zoom, age = t - node.born, vida = 30;
    const fade = age < 0.3 ? age / 0.3 : (age > vida - 2 ? Math.max(0, (vida - age) / 2) : 1);
    if (fade <= 0) continue;
    const pulso = 0.6 + 0.4 * Math.sin(t * 4.5 + node.x);
    const b = P(node.x, node.y, 0);
    g.save(); g.globalAlpha = fade;
    const bh = 40 * s;                                     // la columna de luz que se ve desde lejos
    const col = g.createLinearGradient(b.x, b.y - 2 * s, b.x, b.y - bh);
    col.addColorStop(0, `rgba(255,208,92,${0.52 * pulso})`); col.addColorStop(1, 'rgba(255,208,92,0)');
    g.fillStyle = col;
    g.beginPath(); g.moveTo(b.x - 5 * s, b.y - 2 * s); g.lineTo(b.x - 2.4 * s, b.y - bh);
    g.lineTo(b.x + 2.4 * s, b.y - bh); g.lineTo(b.x + 5 * s, b.y - 2 * s); g.closePath(); g.fill();
    const core = g.createLinearGradient(b.x, b.y - 3 * s, b.x, b.y - bh * 0.82); // el filamento que la hace inconfundible
    core.addColorStop(0, `rgba(255,252,230,${0.6 * pulso})`); core.addColorStop(1, 'rgba(255,252,230,0)');
    g.strokeStyle = core; g.lineWidth = 1.8 * s; g.lineCap = 'round';
    g.beginPath(); g.moveTo(b.x, b.y - 3 * s); g.lineTo(b.x, b.y - bh * 0.82); g.stroke();
    const gx = b.x + 1 * s, gy = b.y - 11 * s - Math.sin(t * 3) * 1.6 * s;
    g.strokeStyle = `rgba(255,255,255,${0.85 * pulso})`; g.lineWidth = 1.6 * s; g.lineCap = 'round';
    g.beginPath(); g.moveTo(gx - 3 * s, gy); g.lineTo(gx + 3 * s, gy); g.moveTo(gx, gy - 3 * s); g.lineTo(gx, gy + 3 * s); g.stroke();
    dot({ x: gx, y: gy }, 1.2 * s, '#fff');
    g.restore();
  }
}
function drawPops() {
  if (!fx.pops.length) return;
  const now = performance.now();
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.font = `800 ${13 * zoom}px "Avenir Next", "Nunito", sans-serif`;
  for (const p of fx.pops) {
    const life = (now - p.born) / 1000; if (life > 1.5) continue;
    const b = P(p.x, p.y, 14 + life * 26);
    g.save(); g.globalAlpha = Math.max(0, 1 - life / 1.5);
    g.strokeStyle = 'rgba(58,50,38,.5)'; g.lineWidth = 3.2; g.strokeText(p.txt, b.x, b.y);
    g.fillStyle = '#ffe08a'; g.fillText(p.txt, b.x, b.y);
    g.restore();
  }
  fx.pops = fx.pops.filter(p => (now - p.born) / 1000 < 1.5);
}
/* BAGDAD: el papel abarata el libro. Perfeccionado el saber del papel, cada luz del molino trae más hojas (2 en la etapa 2,
   3 en la etapa 3): con trapos y agua, la hoja deja de ser un lujo. */
function porLuz(k) { return k === 'calculi' && S.era === 14 ? 3 + (nivelTec(76) >= 2 ? 1 : 0) : k === 'papel' && S.era === 6 ? 1 + (nivelTec(45) >= 2 ? 1 : 0) + (nivelTec(45) >= 3 ? 1 : 0) : k === 'pliego' && S.era === 9 ? 2 + (nivelTec(63) >= 3 ? 1 : 0) : 1; }   // ÁMSTERDAM: cada luz del molino es una resma (y con el tipo móvil perfeccionado, una más)
function recogerColectible(node) {
  if (!node || !colectibles.includes(node)) return;
  if (node.mat) {
    const n = porLuz(node.mat.k);
    S.mats[node.mat.k] = (S.mats[node.mat.k] || 0) + n;
    S.pre += 9 + S.rep * 5;                                // juntar también rinde recursos, y bastante: medido, es lo que hace que jugar acelere de verdad
    fx.pops.push({ x: node.x, y: node.y, txt: '+' + n + ' ' + node.mat.emoji, born: performance.now() });
    sfx.recoger();                                        // juntar del suelo suena a suelo, no a moneda
  } else {
    const bono = Math.max(30, Math.round(tasa() * 20)); S.apr += bono; S.aprTotal += bono;
    fx.pops.push({ x: node.x, y: node.y, txt: '+' + fmt(bono) + ' 📖', born: performance.now() });
    sfx.chispita();                                       // la chispa de curiosidad: su destello
  }
  colectibles = colectibles.filter(n => n !== node);
  renderHUD(); guardar();
}

/* ---------- el evento de cacería: rastrear, acorralar al mamut y traer el botín ---------- */
// La caza es PASIVA por diseño ("ganó el plan, no la fuerza; verla trabajar ES la escena"): el jugador
// la envía y la mira; no se golpea. La antigua caza interactiva (golpearCaza, CAZA_HIT/HITCD) se retiró.
const CAZA_DUR = 13, CAZA_PASIVA = 0.082;
function cazaNivel() { return (S.tecs[15] && S.tecs[15].nivel) || 0; }
function cazaDisponible() { return S.era === 1 && S.edad < 2 && S.tecs[15] && S.tecs[15].fase !== 'sin' && !S.cazaOn && (S.cazaCd || 0) <= 0; }
function iniciarCaza() {
  if (!cazaDisponible()) return;
  S.cazaOn = true; S.cazaProg = 0; S.cazaT = CAZA_DUR;
  sfx.redoble();
  toast('🦣 <b>La partida sale de cacería.</b> Señales de mano, roles y paciencia: mira cómo el clan rodea al mamut.', 6000);
  ocultarFicha();
}
function cerrarCaza(exito) {
  const m = posMamut(tFrame); // su posición aún en pleno forcejeo: de ahí arranca la huida, sin salto
  S.cazaOn = false; S.cazaProg = 0; S.cazaT = 0;
  S.mamutHuidaT = MAMUT_HUIDA; S.mamutFugaX = m.x; S.mamutFugaY = m.y; // gane quien gane, se manda a cambiar
  sfx.barrito();
  if (exito) {
    S.cazaCd = 24;
    const niv = cazaNivel(), bc = botinCorro(), hueso = Math.round((5 + niv * 2) * bc), fibra = Math.round((3 + niv) * bc);
    const piedras = Math.round((40 + S.rep * 22 + niv * 20) * bc), apr = Math.max(40, Math.round(tasa() * 30));
    S.mats.hueso += hueso; S.mats.fibra += fibra; S.pre += piedras; S.apr += apr; S.aprTotal += apr;
    S.animo = Math.min(animoMax(), S.animo + 14);
    S.cazasHechas = (S.cazasHechas || 0) + 1;
    S.criaViene = S.cazasHechas % 3 === 0; // cada tercera caza, el regreso trae compañía
    fx.pops.push({ x: m.x, y: m.y - 1, txt: '+' + hueso + ' 🦴  +' + fmt(piedras) + ' ' + monIco(), born: performance.now() });
    sfx.logro(); sfx.hito(); jubilo();
    pedirCuenta(1); // el botín se reparte, y para repartir hay que contar
    if (S.cazasHechas === 1) toast('🦣 <b>¡Primera caza en equipo!</b> No ganó la fuerza: ganó el plan, los roles y las señales. Así aprendió a colaborar el clan. Vuelven con carne, hueso y tendones.', 12000);
    else toast(`🦣 <b>¡Buena cacería!</b> El clan trae <b>${hueso} 🦴</b>, <b>${fibra} 🪢</b> y <b>${fmt(piedras)} ${monIco()}</b>. Los jóvenes ya piden el próximo rastreo.`, 8000);
  } else {
    S.cazaCd = 16;
    const piedras = Math.round(12 + S.rep * 6);
    S.pre += piedras; S.mats.hueso += 1;
    fx.pops.push({ x: m.x, y: m.y - 1, txt: 'escapó', born: performance.now() });
    toast('🦣 El mamut se perdió entre la maleza… pero el clan leyó su rastro y trajo algo. La próxima será.', 7000);
  }
  renderHUD(); guardar();
}
/* ---------- FUENTES: cada saber dominado enlaza un paper formal (revisado por pares, con DOI) que
   respalda su lección. Las tesis en debate se marcan como tales, con su contrapunto. Verificado por
   búsqueda documental (2026-07-24). Que un juego que enseña muestre de dónde saca lo que afirma, y que
   diga cuándo el pasado se discute, es en sí una lección. ---------- */
