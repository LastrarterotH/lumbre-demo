/* ============================================================
   frontera
   Hasta dónde llega el 3D. El motor 2D sabe cruzar a todas sus épocas; el 3D, solo a las que ya tienen
   mundo (epocas/index.js). Cuando la partida está lista para cruzar a una época que todavía no existe en
   3D, el cruce se VE (los días pasan a toda velocidad: son los milenios) y llega la tarjeta de la época
   nueva, con lo que la espera, que se está construyendo, y el aviso de que es un demo en desarrollo. No se gasta nada y la
   partida sigue viva en la última época construida. Cuando la siguiente tenga mundo (su línea en
   epocas/index.js), el mismo reloj del dock cruza de verdad, sin tocar este archivo.
   La tarjeta es la del agradecimiento del motor (#gracias, abrirGracias): su botón de comentarios y la
   dirección escrita salen de CONTACTO_COMENTARIOS, como en el 2D.
   ============================================================ */
import { EPOCAS } from './epocas/index.js';

/* por época de partida: a cuál cruza, cuándo está lista (lo mismo que pide investigar() del motor),
   la tarjeta de llegada y lo que dice la consejera mientras la época nueva se construye */
const CRUCES = {
  1: {
    a: 2,
    listo: () => S.ganadoF && S.abuelaCap >= 3 && S.signo && memoriaLlena(),
    titulo: '🏺 Pasan los milenios…',
    desde: 9500, hasta: 3300,              // del primer campo sembrado a las primeras tablillas de Uruk (años a. C.)
    cuerpo: `<p>El clan siembra, la aldea crece junto al río, y un día alguien presiona una caña en barro húmedo.
      La muesca del hueso se vuelve signo, y el signo se vuelve escritura: <b>Sumer</b>. Nace la casa de las tablillas.</p>
      <p><b>Hasta aquí llega Lumbre en 3D, por ahora.</b> Sumer se está construyendo con el mismo cuidado que el fogón.
      Tu partida queda guardada en la aldea, con el fuego encendido, y cuando la ciudad esté lista, este mismo reloj
      del dock te llevará río abajo.</p>
      <p>Es un demo y seguimos trabajando en su desarrollo. Cualquier cosa, puedes comunicarte conmigo.</p>`,
    quedarse: 'Seguir en la aldea',
    consejo: 'Río abajo ya nace Sumer, y su casa de las tablillas se está levantando. Mientras tanto, el fuego sigue encendido: quédate el rato que quieras.',
  },
  2: {
    a: 3,
    listo: () => S.ganadoSum && S.enheduanna === 2 && S.apr >= BALANCE.investigacionSiglos,
    titulo: '🪷 Pasan los siglos…',
    desde: 2000, hasta: 1500,              // de la edubba de Nippur a la Casa de la Vida del Reino Nuevo (años a. C.)
    cuerpo: `<p>Los rollos viajan más lejos que las tablillas, y un río más grande que el Éufrates reparte limo y saber:
      <b>Egipto</b>. Junto al templo abre la Casa de la Vida, con el papiro, la tinta roja de los maestros y la cuerda que mide.</p>
      <p><b>Hasta aquí llega Lumbre en 3D, por ahora.</b> Egipto se está construyendo con el mismo cuidado que Sumer.
      Tu partida queda guardada en la edubba, y cuando la Casa de la Vida esté lista, este mismo reloj del dock te llevará
      río abajo.</p>
      <p>Es un demo y seguimos trabajando en su desarrollo. Cualquier cosa, puedes comunicarte conmigo.</p>`,
    quedarse: 'Seguir en la edubba',
    consejo: 'Río abajo ya se levanta la Casa de la Vida. Mientras tanto, la edubba sigue abierta: quédate el rato que quieras.',
  },
  3: {
    a: 4,
    listo: () => S.ganadoEg && S.ptahhotep === 2 && S.apr >= BALANCE.investigacionAgora,
    titulo: '🏛️ Cruzan el mar…',
    desde: 1500, hasta: 430,               // de la Casa de la Vida del Reino Nuevo al ágora de Sócrates (años a. C.)
    cuerpo: `<p>Los rollos cruzan el mar y llegan a un puerto donde nadie dicta: en <b>Atenas</b> el maestro pregunta y el que
      aprende responde. En el ágora, bajo el pórtico, se conversa.</p>
      <p><b>Hasta aquí llega Lumbre en 3D, por ahora.</b> El ágora se está construyendo con el mismo cuidado que Egipto.
      Tu partida queda guardada en la Casa de la Vida, y cuando Atenas esté lista, este mismo reloj del dock te llevará
      a través del mar.</p>
      <p>Es un demo y seguimos trabajando en su desarrollo. Cualquier cosa, puedes comunicarte conmigo.</p>`,
    quedarse: 'Seguir en la Casa de la Vida',
    consejo: 'Del otro lado del mar ya se levanta el ágora. Mientras tanto, la Casa de la Vida sigue abierta: quédate el rato que quieras.',
  },
  4: {
    a: 5,
    listo: () => S.ganadoAg && S.socrates === 2 && S.apr >= BALANCE.investigacionAlejandria,
    titulo: '⛵ Pasa un siglo y medio…',
    desde: 400, hasta: 250,                // del ágora de Sócrates a la Biblioteca de Calímaco (años a. C.)
    cuerpo: `<p>Alejandro funda una ciudad en la boca del Nilo, y un rey quiere juntar ahí todos los libros del mundo:
      <b>Alejandría</b>. Los barcos traen rollos, el Museo paga a los sabios y un poeta inventa el catálogo.</p>
      <p><b>Hasta aquí llega Lumbre en 3D, por ahora.</b> Alejandría se está construyendo con el mismo cuidado que el ágora.
      Tu partida queda guardada en Atenas, y cuando la Biblioteca esté lista, este mismo reloj del dock te llevará por mar.</p>
      <p>Es un demo y seguimos trabajando en su desarrollo. Cualquier cosa, puedes comunicarte conmigo.</p>`,
    quedarse: 'Seguir en el ágora',
    consejo: 'Del otro lado del mar ya se levanta la Biblioteca. Mientras tanto, el ágora sigue abierta: quédate el rato que quieras.',
  },
  5: {
    a: 14,                                 // Roma va entre Alejandría y Bagdad (ORDEN_EPOCAS, docs/era14-plan.md): su id es 14 porque nació después
    listo: () => S.ganadoAl && S.hipatia === 2 && S.apr >= BALANCE.investigacionRoma,
    titulo: '🏛️ Cruzan el mar…',
    desde: 250, hasta: -95,                // de la Biblioteca de Calímaco a la Roma de Quintiliano y su Institutio (los negativos son años d. C.)
    cuerpo: `<p>Los barcos del grano llevan el trigo del Nilo a Ostia, y con ellos viajan los libros y los maestros griegos:
      <b>Roma</b>. Bajo los pórticos del Foro, la escuela se vuelve un camino de tres escuelas, del ludus al rétor, y un
      maestro de Hispania escribe contra la férula.</p>
      <p><b>Hasta aquí llega Lumbre en 3D, por ahora.</b> Roma se está construyendo con el mismo cuidado que Alejandría.
      Tu partida queda guardada en la Biblioteca, y cuando el Foro esté listo, este mismo reloj del dock te llevará por mar.</p>
      <p>Es un demo y seguimos trabajando en su desarrollo. Cualquier cosa, puedes comunicarte conmigo.</p>`,
    quedarse: 'Seguir en Alejandría',
    consejo: 'Del otro lado del mar ya se levantan los pórticos del Foro. Mientras tanto, la Biblioteca sigue abierta: quédate el rato que quieras.',
  },
  14: {
    a: 6,
    listo: () => S.ganadoRo && S.quintiliano === 2 && S.apr >= BALANCE.investigacionBagdad,
    titulo: '🌙 Pasan siete siglos…',
    desde: -100, hasta: -800,              // de la Roma de Trajano a la Bagdad de Harún y al-Mamún (años d. C.)
    cuerpo: `<p>Cae Roma, y sus escuelas con ella; lo que se salvó de los libros griegos sigue copiándose en Siria y en Persia.
      Un califa traza una ciudad redonda junto al Tigris, llega el papel de China y en la Casa de la Sabiduría se traduce
      todo al árabe: <b>Bagdad</b>.</p>
      <p><b>Hasta aquí llega Lumbre en 3D, por ahora.</b> Bagdad se está construyendo con el mismo cuidado que Roma.
      Tu partida queda guardada en las escuelas de Roma, y cuando la Ciudad Redonda esté lista, este mismo reloj del dock te llevará.</p>
      <p>Es un demo y seguimos trabajando en su desarrollo. Cualquier cosa, puedes comunicarte conmigo.</p>`,
    quedarse: 'Seguir en Roma',
    consejo: 'Junto al Tigris ya se levanta la Ciudad Redonda. Mientras tanto, las escuelas de Roma siguen abiertas: quédate el rato que quieras.',
  },
  6: {
    a: 15,                                 // China va entre Bagdad y París (ORDEN_EPOCAS, docs/era15-plan.md): su id es 15 porque nació después
    listo: () => S.ganadoBa && S.hunayn === 2 && S.apr >= BALANCE.investigacionChina,
    titulo: '🏮 Pasan dos siglos por la Ruta de la Seda…',
    desde: -830, hasta: -1060,             // de la Bagdad de al-Mamún a la Kaifeng del examen de 1057 (años d. C.)
    cuerpo: `<p>El camino por el que el papel llegó a Bagdad se recorre al revés, por tierra y por mar, hasta la capital de los
      Song: <b>Kaifeng</b>, con su Pagoda de Hierro y su Puente Arcoíris. Ahí se llega a gobernar estudiando: hay una escuela en
      cada prefectura, los clásicos se imprimen y el examen se rinde con el nombre tapado.</p>
      <p><b>Hasta aquí llega Lumbre en 3D, por ahora.</b> Kaifeng se está construyendo con el mismo cuidado que Bagdad.
      Tu partida queda guardada en la Casa de la Sabiduría, y cuando la ciudad del examen esté lista, este mismo reloj del dock te llevará.</p>
      <p>Es un demo y seguimos trabajando en su desarrollo. Cualquier cosa, puedes comunicarte conmigo.</p>`,
    quedarse: 'Seguir en Bagdad',
    consejo: 'Al otro lado de la Ruta de la Seda ya se levanta Kaifeng. Mientras tanto, la Casa de la Sabiduría sigue abierta: quédate el rato que quieras.',
  },
  15: {
    a: 8,                                  // París sigue a China: los mismos años, al otro extremo de la Ruta de la Seda (ORDEN_EPOCAS)
    listo: () => S.ganadoCh && S.zhuxi === 2 && S.apr >= BALANCE.investigacionParis,
    titulo: '🔔 Al otro extremo de la Ruta de la Seda…',
    desde: -1100, hasta: -1120,            // de la Kaifeng de Li Qingzhao al París de Abelardo: casi los mismos años (d. C.)
    cuerpo: `<p>En los mismos años, al otro extremo de la Ruta de la Seda, lo que Bagdad tradujo al árabe empieza a pasar al latín
      en Toledo y sube hacia el norte. Junto al Sena, una abadía toca sus campanas a horas fijas, y de la escuela de la catedral
      nace la universidad: <b>París</b>.</p>
      <p><b>Hasta aquí llega Lumbre en 3D, por ahora.</b> París se está construyendo con el mismo cuidado que Kaifeng.
      Tu partida queda guardada en las escuelas de Kaifeng, y cuando las campanas de París estén listas, este mismo reloj del dock te llevará.</p>
      <p>Es un demo y seguimos trabajando en su desarrollo. Cualquier cosa, puedes comunicarte conmigo.</p>`,
    quedarse: 'Seguir en Kaifeng',
    consejo: 'Junto al Sena ya suenan las campanas de París. Mientras tanto, las escuelas de Kaifeng siguen abiertas: quédate el rato que quieras.',
  },
  8: {
    a: 7,
    listo: () => S.ganadoPa && S.abelardo === 2 && S.apr >= BALANCE.investigacionTenochtitlan,
    titulo: '🌋 Tres siglos y un océano…',
    desde: -1257, hasta: -1430,            // del París de la Sorbona a la Tenochtitlan de Itzcóatl y Nezahualcóyotl (años d. C.)
    cuerpo: `<p>Del otro lado del océano, en un mundo que Europa todavía no conoce, los mexicas fundan una ciudad sobre el
      agua, en un lago entre volcanes: <b>Tenochtitlan</b>. En cada barrio hay una escuela, y todos los niños van a ella.</p>
      <p><b>Hasta aquí llega Lumbre en 3D, por ahora.</b> Tenochtitlan se está construyendo con el mismo cuidado que París.
      Tu partida queda guardada en las escuelas de París, y cuando la ciudad del lago esté lista, este mismo reloj del dock te llevará.</p>
      <p>Es un demo y seguimos trabajando en su desarrollo. Cualquier cosa, puedes comunicarte conmigo.</p>`,
    quedarse: 'Seguir en París',
    consejo: 'En un lago entre volcanes ya se levanta Tenochtitlan. Mientras tanto, las escuelas de París siguen abiertas: quédate el rato que quieras.',
  },
  7: {
    a: 9,
    listo: () => S.ganadoTe && S.neza === 2 && S.apr >= BALANCE.investigacionAmsterdam,
    titulo: '🖨️ Dos siglos, y el océano de vuelta…',
    desde: -1430, hasta: -1650,            // de la Tenochtitlan de Nezahualcóyotl a la Ámsterdam de Blaeu y Comenio (años d. C.)
    cuerpo: `<p>Una máquina de Maguncia multiplica los libros (hacia 1600, en México, sale impresa la palabra antigua que
      copiaron los frailes), y en la ciudad de los canales la casa Blaeu tiene nueve prensas: <b>Ámsterdam</b>, donde en cada
      barrio hay una escuela con su cartilla.</p>
      <p><b>Hasta aquí llega Lumbre en 3D, por ahora.</b> Ámsterdam se está construyendo con el mismo cuidado que Tenochtitlan.</p>
      <p>Es un demo y seguimos trabajando en su desarrollo. Cualquier cosa, puedes comunicarte conmigo.</p>`,
    quedarse: 'Seguir en Tenochtitlan',
    consejo: 'En la ciudad de los canales ya giran las prensas. Mientras tanto, las escuelas del calpulli siguen abiertas: quédate el rato que quieras.',
  },
  9: {
    a: 21,                                 // EL FUTURO va después de Ámsterdam (ORDEN_EPOCAS, docs/era21-plan.md): la última del viaje, en el valle del principio
    listo: () => S.ganadoAm && S.comenio === 2 && S.apr >= BALANCE.investigacionFuturo,
    titulo: '🔥 Pasan casi cuatro siglos…',
    desde: -1658, hasta: -2026,            // de la Ámsterdam de Comenio a hoy (años d. C.)
    cuerpo: `<p>Entre las imprentas de Ámsterdam y hoy pasan la Ilustración, la Revolución Industrial, la escuela pública y el
      siglo XX. El viaje vuelve al principio: <b>el valle de la Época 1</b>, con su cueva pintada y el círculo de piedras del fogón,
      donde hay escuela otra vez junto al fuego, y una inteligencia artificial que responde lo que se le pregunte.</p>
      <p><b>Hasta aquí llega Lumbre en 3D, por ahora.</b> El valle de hoy se está construyendo con el mismo cuidado que Ámsterdam.</p>
      <p>Es un demo y seguimos trabajando en su desarrollo. Cualquier cosa, puedes comunicarte conmigo.</p>`,
    quedarse: 'Seguir en Ámsterdam',
    consejo: 'En el valle del principio ya se levanta la escuela, alrededor del fuego. Mientras tanto, las imprentas de Ámsterdam siguen tirando: quédate el rato que quieras.',
  },
};

/* op.pasarDias(vueltas, ms, alTerminar, alAvanzar): el cielo da esas vueltas de día completas (juego3d.js) */
export function crearFrontera(op = {}) {
  let cruzando = false;
  if (S.frontera3d && EPOCAS[S.frontera3d]) { delete S.frontera3d; guardar(); }   // la frontera avanzó: esa época ya tiene mundo 3D
  const frente = () => { const x = CRUCES[S.era]; return x && !EPOCAS[x.a] ? x : null; };

  function llegar(x) {
    const h = document.querySelector('#gracias h2'), c = document.getElementById('gracias-cuerpo');
    h.textContent = x.titulo; c.innerHTML = x.cuerpo;
    document.getElementById('b-gracias-cerrar').textContent = x.quedarse;
    abrirGracias();
    S.frontera3d = x.a; guardar(); renderHUD();
  }

  /* EL CRUCE SE VE PASAR, siempre (2026-09-29, con Sumer en 3D): siete segundos, el cielo da seis vueltas y
     los años corren. Si la época siguiente TIENE mundo 3D, a mitad del viaje el valle se oscurece, el motor
     cruza de verdad (investigar() del 2D) y el mundo nuevo se arma bajo el velo; si no lo tiene, al final
     llega su tarjeta, no se gasta nada y la partida sigue donde estaba (la primera vez con el viaje; las
     siguientes, directo a la tarjeta). */
  const investigar0 = window.investigar;
  window.investigar = function () {
    const x = CRUCES[S.era];
    if (!x) return investigar0();
    if (!x.listo() || cruzando) return;
    const conMundo = !!EPOCAS[x.a];
    if (!conMundo && S.frontera3d === x.a) { llegar(x); return; }
    cruzando = true;
    if (typeof cerrarSuperficies === 'function') cerrarSuperficies();
    sfx.logro();
    const velo = document.createElement('div'); velo.id = 'milenios';
    velo.innerHTML = `<div class="m-titulo">${x.titulo}</div><div class="m-anio"></div>`;
    document.body.appendChild(velo);
    const anio = velo.querySelector('.m-anio');
    let cruzo = false;
    const avanzar = k => {
      const e = k * k * (3 - 2 * k), a = Math.round((x.desde + (x.hasta - x.desde) * e) / 50) * 50;
      anio.textContent = a > 0 ? `${a.toLocaleString('es')} a. C.` : `${(-a || 1).toLocaleString('es')} d. C.`;
      velo.style.opacity = String(Math.min(1, k * 6, (1 - k) * 5));
      if (conMundo) {                                   // el valle se apaga a mitad del viaje y renace el otro
        const oscuro = Math.max(0, 1 - Math.abs(k - 0.5) / 0.22);
        velo.style.background = `rgba(12, 14, 22, ${(0.94 * oscuro).toFixed(3)})`;
        if (!cruzo && k >= 0.5) { cruzo = true; investigar0(); }
      }
    };
    const fin = () => { cruzando = false; velo.remove(); if (!cruzo && conMundo) investigar0(); if (!conMundo) llegar(x); };
    if (op.pasarDias) { avanzar(0); op.pasarDias(6, 7000, fin, avanzar); } else fin();
  };

  /* la consejera ya no manda al reloj una vez vista la llegada: la época nueva todavía no está */
  const consejo0 = window.consejoActual;
  window.consejoActual = function () {
    const c = consejo0(), x = frente();
    if (c && x && S.frontera3d === x.a && c.g && c.g.chip === 'chip-inv') return { f: c.f, t: x.consejo, g: null };
    return c;
  };

  return { frente, get cruzando() { return cruzando; } };
}
