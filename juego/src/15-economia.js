/* ============================================================
   15-economia
   La economía viva: tasa de aprendizaje, comprar/formar/perfeccionar, la consejera, el tick y el paso de época.
   ============================================================ */
function tasa() {
  const bien = alumnosBien(), extra = S.alumnos - bien;
  return (bien + extra * extraEf() + unidadesExtra()) * BALANCE.baseProd * multTec() * multAnimo() * transicion() * calorHogar() * multAutora() * multGen() * multAbuela2() * multVelada() * multGranero() * multAgora() * multCuenta();
}
function tasaNormal() {
  const bien = alumnosBien(), extra = S.alumnos - bien;
  return (bien + extra * extraEf() + unidadesExtra()) * BALANCE.baseProd * multTecNormal() * multAnimo() * transicion() * calorHogar() * multAutora() * multGen() * multAbuela2() * multVelada() * multGranero() * multAgora() * multCuenta();
}
/* LA MEMORIA DEL CLAN (lista de cotejo C3, 2026-09-29). En la Época 1 el saber llegaba a millones mientras los
   costos seguían en cientos: al final la moneda no pesaba. Sin escritura, el clan no guarda más de lo que su
   memoria sostiene: unos dos minutos de lo que aprende (y nunca menos de lo que cuesta lo más caro que tiene
   por delante). Lo que pasa de ahí se olvida. Es la razón de ser de lo que viene: el signo y, en Sumer, la
   escritura. Los Milenios piden la memoria LLENA: cuando ya no cabe más, hace falta escribir. */
function memoriaTope() {
  if (S.era !== 1) return Infinity;
  let caro = 0;
  for (const i of saberesEpoca(1)) { const t = S.tecs[i]; if (!t) continue; if (t.fase === 'valle') caro = Math.max(caro, BALANCE.tecnologias[i].formCosto); if (t.fase === 'meseta' && (t.nivel || 0) < 3) caro = Math.max(caro, profCosto(i)); }
  return Math.max(4000, Math.round(caro * 1.25), Math.round(tasaNormal() * 120 / 100) * 100);
}
function costoMilenios() { return S.era === 1 ? Math.max(BALANCE.investigacionMilenios, memoriaTope()) : BALANCE.investigacionMilenios; }
function memoriaLlena() { return S.era === 1 && S.apr >= costoMilenios() * 0.999; }
function multAgora() { return S.era === 4 ? repertorioBono() : S.era === 5 ? fondoBono() : S.era === 6 ? bibliotecaBono() : S.era === 7 ? codiceBono() * cantoBono() : S.era === 8 ? librosBono() * lecturaBono() * licenciaBono() : S.era === 9 ? lectoresBono() : S.era === 10 ? alfabetoBono() : S.era === 14 ? letradosBono() : S.era === 15 ? gobiernoBono() : S.era === 21 ? entendidosBono() * confianzaBono() : 1; }   // TENOCHTITLAN: los códices pintados (tope +30 %) y la noche que sigue al canto // ATENAS: el repertorio (los que respondieron enseñan a los demás; tope +30%). ALEJANDRÍA: el fondo catalogado (tope +30%)
function costoDocente() { return Math.round(BALANCE.docente.costoBase * Math.pow(BALANCE.docente.factorCosto, S.docentes - 1) * (madrasaLista() ? 0.8 : 1)); }   // BAGDAD: con la madrasa y su renta, los maestros cuestan menos
function hayValle() { return S.tecs.some(t => t.fase === 'valle'); }

function debito(sel, txt, gana) { // GRAMÁTICA D: todo gasto se ve SALIR de su indicador (y lo ganado, ENTRAR)
  const el = typeof sel === 'string' ? document.getElementById(sel) : sel;
  if (!el) return;
  const r = el.getBoundingClientRect();
  const d = document.createElement('div');
  d.className = 'debito' + (gana ? ' gana' : ''); d.textContent = txt;
  d.style.left = (r.left + r.width / 2) + 'px'; d.style.top = (r.bottom + 2) + 'px';
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 1500);
}
function debitoMat(k, n) { debito(document.querySelector(`#mats span[data-mat="${k}"]`), `−${n} ${emojiMat(k)}`); }
function ganaMat(k, n) { // lo que ENTRA también se ve salir del sitio donde se cuenta
  const el = document.querySelector(`#mats span[data-mat="${k}"]`);
  if (el) debito(el, `+${n} ${emojiMat(k)}`, true);
}
function comprarTec(i) {
  const T = BALANCE.tecnologias[i], t = S.tecs[i], mat = MAT_DE_TEC[i];
  if (t.fase !== 'sin' || S.pre < T.costo || (mat && (S.mats[mat] || 0) < MAT_COSTO)) return;
  S.pre -= T.costo;
  if (mat) S.mats[mat] -= MAT_COSTO;
  debito('r-pre', `−${fmt(T.costo)} ${monIco()}`); if (mat) debitoMat(mat, MAT_COSTO);
  // C8 del QA completo: el ciclo de la novedad cambia con la época. En Sumer, con la tablilla aprendida, lo escrito
  // tarda en olvidarse: la novedad dura un 50 % más
  const escrita = S.era === 2 && S.tecs[16] && S.tecs[16].fase === 'meseta' && i !== 16;
  t.fase = 'novedad'; t.t = BALANCE.novedadDur * (escrita ? 1.5 : 1);
  if (escrita && !S.vioNovedadEscrita) { S.vioNovedadEscrita = true; setTimeout(() => toast('🧱 <b>Lo escrito tarda en olvidarse.</b> Con la tablilla, la edubba anota cómo se usa cada saber nuevo: su novedad dura la mitad más antes de juntar polvo.', 12000), 2800); }
  sfx.campana();
  toast(`🛠️ ${LEX().llega}${/p$/.test(T.genero || '') ? 'n' : ''} <b>${T.nombre.charAt(0).toLowerCase() + T.nombre.slice(1)}</b> (${T.año}). ¡Todos quieren probar${pron(T.id)}!`);
}
function formarTec(i) {
  const T = BALANCE.tecnologias[i], t = S.tecs[i];
  if (t.fase !== 'valle' || S.apr < T.formCosto) return;
  S.apr -= T.formCosto;
  debito('r-apr', `−${fmt(T.formCosto)} 📖`);
  // lo que se canta se aprende antes: el tambor acorta la espera. La duración REAL se guarda en t.dur para
  // que la barra de progreso siga siendo honesta (empezar en 0 y llenarse, no arrancar ya "adelantada").
  // C8: en Egipto, con Ptahhotep adoptado, quien sabe escuchar enseña antes: instruir a los maestros toma un 25 % menos
  const escucha = S.era === 3 && S.ptahhotep === 2;
  t.fase = 'formando'; t.dur = T.formDur * (1 - tamborRitmo()) * (escucha ? 0.75 : 1) * manualEuclides() * papelAbarata(); t.t = t.dur;   // ALEJANDRÍA: con los Elementos se enseña con manual; BAGDAD: con papel, lo escrito abarata enseñar
  if (escucha && !S.vioInstruyeEscucha) { S.vioInstruyeEscucha = true; setTimeout(() => toast('🪷 <b>Quien sabe escuchar enseña antes.</b> Con el arte de Ptahhotep, instruir a los maestros toma un cuarto menos: la corrección ya es diálogo.', 12000), 2800); }
  toast(LEX().formarToast(T.nombre) + (tamborRitmo() > 0 ? (S.era === 1 ? ' <i>El tambor le lleva el pulso: se aprende más rápido.</i>' : ' <i>El ritmo que se aprendió junto al fuego le lleva el pulso: se aprende más rápido.</i>') : ''));
}
const SUBHIST = {}; // DERIVADA de la ficha única (T.subhist en 01-balance): las tres etapas de perfección
BALANCE.tecnologias.forEach((T, i) => { if (T.subhist) SUBHIST[i] = T.subhist; });
const HITOS_FOGON = [
  'El primer relato compartido: el clan se sienta a escuchar en vez de dispersarse.',
  'La noche dejó de dar miedo: junto al fuego ya nadie huye de la oscuridad.',
  'La primera cuenta: se sabe cuántos son y cuántos faltan al volver.',
  'El excedente: hay comida de sobra, y por fin tiempo para aprender.',
  'La memoria del clan: lo que sabe uno, pronto lo saben todos.',
  'El oficio heredado: los jóvenes aprenden mirando a los mayores trabajar.',
  'El saber que viaja: lo aprendido cruza el valle con quien se marcha.'
];
function profCosto(i) { const t = S.tecs[i], T = BALANCE.tecnologias[i]; return Math.round(T.formCosto * (1.6 + (t.nivel || 0) * 1.4)); }
function profundizarTec(i) {
  const t = S.tecs[i], T = BALANCE.tecnologias[i];
  if (t.fase !== 'meseta' || (t.nivel || 0) >= 3 || (t.prof || 0) > 0 || S.apr < profCosto(i)) return;
  debito('r-apr', `−${fmt(profCosto(i))} 📖`);
  S.apr -= profCosto(i);
  t.profDur = Math.round(T.formDur * 0.7 * (1 - tamborRitmo())); t.prof = t.profDur; // el ritmo también acorta el pulido
  sfx.campana();
  const casa = LEX().casa, quien = T.nombre.toLowerCase() === casa.toLowerCase() ? 'se' : casa;   // «La edubba: la edubba pule» no
  toast(`🔎 <b>${T.nombre}</b>: ${quien} pule la etapa ${(t.nivel || 0) + 1} de 3…`); // cada época pule con su voz (era «el clan» hasta en la Casa de la Vida)
}
function contratar() {
  const c = costoDocente();
  if (S.pre < c || S.docentes >= maxDocentes()) return;
  S.pre -= c; S.docentes++;
  debito('r-pre', `−${fmt(c)} ${monIco()}`);
  sfx.hito();
  toast(LEX().contratoToast(LEX().nombres[S.docentes - 1]));
  if (S.era === 1 && typeof abrirEleccionGuia === 'function') abrirEleccionGuia(S.docentes - 1); // ¿cómo enseñará? (C5)
}
function elegirModoGuia(k, modo) {
  if (S.era !== 1 || k < 1 || k >= S.docentes || !['corro', 'cerca'].includes(modo)) return;
  S.guiasModo = S.guiasModo || []; S.guiasModo[k] = modo;
  const n = LEX().nombres[k % LEX().nombres.length];
  toast(modo === 'corro'
    ? `🔥 <b>${n.charAt(0).toUpperCase() + n.slice(1)}</b> enseñará a muchos: un corro de <b>${GUIA_CORRO}</b> alrededor suyo, y la cacería y la cosecha traen más.`
    : `🎣 <b>${n.charAt(0).toUpperCase() + n.slice(1)}</b> enseñará de cerca: <b>${GUIA_CERCA}</b> pequeños a su lado, que aprenden un <b>${Math.round(CERCA_PLUS * 100)}%</b> más, como en la orilla.`, 9000);
  renderHUD(); guardar();
}
/* lo que rendiría cada manera para la guía k, con los aprendices de ahora (lo usa el bot y el texto de la elección) */
function rindeModoGuia(k, modo) {
  const antes = (S.guiasModo || [])[k]; S.guiasModo = S.guiasModo || [];
  S.guiasModo[k] = modo; const bien = alumnosBien(), u = bien + (S.alumnos - bien) * extraEf() + unidadesExtra();
  S.guiasModo[k] = antes; return u;
}
function tomarTe() {
  if (S.teCd > 0 || S.apr < BALANCE.te.costo || campanaAbierta()) return;   // PARÍS: con la campana, se descansa a su hora
  if (S.animo >= animoMax()) return; // al tope no sube nada: cobrar 50 📖 por cero era un timo
  S.apr -= BALANCE.te.costo;
  debito('r-apr', `−${BALANCE.te.costo} 📖`);
  const animoAntes = S.animo;
  S.animo = Math.min(animoMax(), S.animo + BALANCE.te.bono);
  const sube = Math.round(S.animo - animoAntes); // el delta REAL tras el tope: lo que compras se ve entrar
  if (sube > 0) debito('r-ani', `+${sube} ${LEX().te.split(' ')[0]}`, true);
  S.teCd = S.era === 8 ? DIA_PA / 4 : BALANCE.te.cooldown;   // PARÍS: en el claustro se come a su hora, una vez por tiempo: el vino aguado no reemplaza al descanso del horario
  sfx.sorbo();
  jubilo();
  toast(LEX().teToast);
}
function fundarGeneracion() { // el prestigio: volver al fogón sabiendo lo que ahora saben
  const g2 = S.generacion + 1;
  S = estadoInicial();
  S.generacion = g2;
  guardar();
  cerrarModales();
  sfx.hito();
  toast(`🧬 <b>La ${g2 + 1}ª generación</b> se sienta alrededor de la oscuridad. Alguien recuerda cómo frotar las varas… y esta vez, todos aprenden un <b>+${g2 * 25}%</b> más rápido.`, 14000);
  encuadrar();
  resize();
}
/* EL FINAL DEL JUEGO ES EL FINAL DE LO CONSTRUIDO. Lumbre llega hoy hasta el cierre de la Época 1 y
   hasta ahí está entero: mecánicas, fuentes, balance y arco. No es un modo demo ni un preview: es el
   juego. Las épocas 2-13 siguen en el código como ANDAMIO pre-vara (docs/pendientes.md): al jugador no
   se le ofrecen, y para trabajarlas se fuerza S.era desde el laboratorio (?lab=1). Cuando una época se
   reconstruya a la vara de la Época 1, esta frontera avanza y el viaje sigue. */
/* LAS LLEGADAS QUE SE DICEN IGUAL en el cruce y en el laboratorio (20-main): China entra entre Bagdad y París (era15-plan).
   El camino de verdad es la Ruta de la Seda, por tierra y por mar: el papel la recorrió de China a Samarcanda y a Bagdad, y
   ahora se recorre al revés; y París queda en los mismos años, al otro extremo. */
const TXT_LLEGA_CHINA = '🏮 <b>Pasan dos siglos por la Ruta de la Seda: Kaifeng.</b> El camino por el que el papel llegó a Bagdad se recorre al revés, por tierra y por mar, hasta la capital de los Song: una de las ciudades más grandes del mundo, con su Pagoda de Hierro y su Puente Arcoíris. Ahí se llega a gobernar estudiando: los Song abren <b>el examen</b> como nadie antes.';
const TXT_LLEGA_PARIS = '🔔 <b>En los mismos años, al otro extremo de la Ruta de la Seda: París.</b> Lo que Bagdad tradujo al árabe empieza a pasar al latín en Toledo y sube hacia el norte. Junto al Sena, una abadía toca sus campanas a horas fijas, y de la escuela de la catedral nace la universidad. El día de la escuela tiene horario.';
/* EL FUTURO (era21-plan): entre Ámsterdam y hoy pasan casi cuatro siglos que todavía no están construidos (la Ilustración, la
   Revolución Industrial, la escuela pública, el siglo XX): el cruce lo dice, y se llega al valle del principio */
const TXT_LLEGA_FUTURO = '🔥 <b>Pasan casi cuatro siglos: hoy.</b> Y el viaje vuelve al principio: el mismo valle de la Época 1, con su cueva pintada, su laguna y el círculo de piedras del fogón. Hay escuela otra vez junto al fuego, y algo que no hubo en ninguna época: una inteligencia artificial que responde lo que se le pregunte. En los bordes del valle hay niebla: lo que todavía no sabemos.';
const ULTIMA_EPOCA = LUMBRE.ultimaEpoca || 3; // EGIPTO PUBLICADO (2026-09-06): tras cinco tandas del ojo del jugador y la hoja de bocetos de la esfinge, el usuario dio el «dale» («si tú ya probaste todo lo demás, estaríamos ok, y dale con la siguiente época»). Sumer lo fue el 2026-08-05. La frontera avanza solo así.
function investigar() {
  const aprAntes = S.apr; // para el débito del gran gasto
  if (S.era === ULTIMA_EPOCA) return;   // en la frontera no hay salto: el juego termina aquí
  if (S.era === 1 && S.ganadoF && S.abuelaCap >= 3 && S.signo && memoriaLlena()) { // los milenios empiezan con el SIGNO (multCuenta, 14) y la memoria llena (C3)
    S.apr -= Math.min(S.apr, costoMilenios());
    entrarEpoca(2);
    sfx.logro();
    toast('🏺 <b>Pasan los milenios…</b> el clan siembra, la aldea crece junto al río, y un día alguien presiona una caña en barro húmedo: <b>Sumer</b>. Nace la casa de las tablillas.', 14000);
    resize(); // amanece otra época
  } else if (S.era === 2 && S.ganadoSum && S.enheduanna === 2 && S.apr >= BALANCE.investigacionSiglos) {
    S.apr -= BALANCE.investigacionSiglos;
    const perdido = entrarEpoca(3);
    sfx.logro();
    toast('🪷 <b>Pasan los siglos…</b> los rollos viajan más lejos que las tablillas y el río grande reparte limo y saber: <b>Egipto</b>. Abre la Casa de la Vida.', 14000);
    if (perdido) toast(`🌾 <b>Los siglos no guardan el grano.</b> La edubba ahorró más de lo que cruza el tiempo: la Casa de la Vida empieza con el tributo de su primer año, ${fmt(S.pre)} ${monIco()}.`, 12000);
    resize();
  } else if (S.era === 3 && S.ganadoEg && S.ptahhotep === 2 && S.apr >= BALANCE.investigacionAgora) {
    S.apr -= BALANCE.investigacionAgora;
    const perdido = entrarEpoca(4);
    sfx.logro();
    toast('🏛️ <b>Cruzan el mar…</b> los rollos llegan a un puerto donde nadie dicta: en <b>Atenas</b> el maestro pregunta y el que aprende responde. Abre el ágora.', 14000);
    if (perdido) toast(`⛵ <b>El mar no carga el granero.</b> La Casa de la Vida ahorró más de lo que cabe en un barco: el ágora empieza con ${fmt(S.pre)} ${monIco()}.`, 12000);
    resize();
  } else if (S.era === 4 && S.ganadoAg && S.socrates === 2 && S.apr >= BALANCE.investigacionAlejandria) {
    S.apr -= BALANCE.investigacionAlejandria;
    const perdido = entrarEpoca(5);
    sfx.logro();
    toast('⛵ <b>Pasa un siglo y medio…</b> Alejandro funda una ciudad en la boca del Nilo y un rey quiere juntar ahí todos los libros del mundo: <b>Alejandría</b>. Abre el Museo.', 14000);
    if (perdido) toast(`⛵ <b>El barco no carga la Academia entera.</b> El ágora ahorró más de lo que cabe en la bodega: Alejandría empieza con ${fmt(S.pre)} ${monIco()}.`, 12000);
    resize();
  } else if (S.era === 5 && S.ganadoAl && S.hipatia === 2 && S.apr >= BALANCE.investigacionRoma) {   // ALEJANDRÍA → ROMA (era14-plan: la lista de orden, ORDEN_EPOCAS)
    S.apr -= BALANCE.investigacionRoma;
    const perdido = entrarEpoca(14);
    sfx.logro();
    toast('🏛️ <b>Cruzan el mar…</b> los barcos del grano llevan el trigo del Nilo a Ostia, y con ellos viajan los libros y los maestros griegos: <b>Roma</b>. Bajo los pórticos del Foro, la escuela se vuelve un camino de tres escuelas.', 14000);
    if (perdido) toast(`⛵ <b>El barco del grano no carga la Biblioteca entera.</b> Alejandría ahorró más de lo que cabe en la bodega: Roma empieza con ${fmt(S.pre)} ${monIco()}.`, 12000);
    resize();
  } else if (S.era === 14 && S.ganadoRo && S.quintiliano === 2 && S.apr >= BALANCE.investigacionBagdad) {   // ROMA → BAGDAD
    S.apr -= BALANCE.investigacionBagdad;
    const perdido = entrarEpoca(6);
    sfx.logro();
    toast('🌙 <b>Pasan siete siglos…</b> el imperio se parte, el papel llega de China por Samarcanda, y un califa funda junto al Tigris una ciudad redonda: <b>Bagdad</b>. Abre la Casa de la Sabiduría.', 14000);
    if (perdido) toast(`🐪 <b>La caravana no carga las escuelas de Roma enteras.</b> Roma ahorró más de lo que cabe en las alforjas: Bagdad empieza con ${fmt(S.pre)} ${monIco()}.`, 12000);
    if (S.famaRoma) toast(`⭐ <b>La fama de los oradores se queda en Roma.</b> Siete siglos después, en Bagdad nadie nombra a los que ganaron sus casos en la basílica Julia: la escuela llega con el renombre que traía de Alejandría (${S.rep}). Lo que Bagdad hereda son los libros griegos.`, 13000);
    resize();
  } else if (S.era === 6 && S.ganadoBa && S.hunayn === 2 && S.apr >= BALANCE.investigacionChina) {   // BAGDAD → CHINA (era15-plan: la Edad Media en tres mundos, ORDEN_EPOCAS)
    S.apr -= BALANCE.investigacionChina;
    const perdido = entrarEpoca(15);
    sfx.logro();
    toast(TXT_LLEGA_CHINA, 15000);
    if (perdido) toast(`🐪 <b>La caravana no carga la Casa de la Sabiduría entera.</b> Bagdad ahorró más de lo que cabe en las alforjas: Kaifeng empieza con ${fmt(S.pre)} ${monIco()}.`, 12000);
    resize();
  } else if (S.era === 15 && S.ganadoCh && S.zhuxi === 2 && S.apr >= BALANCE.investigacionParis) {   // CHINA → PARÍS: los mismos años, al otro extremo de la Ruta de la Seda
    S.apr -= BALANCE.investigacionParis;
    const perdido = entrarEpoca(8);
    sfx.logro();
    toast(TXT_LLEGA_PARIS, 15000);
    if (perdido) toast(`🐪 <b>No todo cabe en el viaje.</b> Kaifeng ahorró más de lo que se puede llevar: París empieza con ${fmt(S.pre)} ${monIco()}.`, 12000);
    if (S.famaChina) toast(`⭐ <b>La fama de Kaifeng se queda en China.</b> En París nadie conoce a los que aprobaron el examen de palacio: la escuela llega con el renombre que traía de Bagdad (${S.rep}). Lo que París hereda es lo que Bagdad tradujo.`, 13000);
    resize();
  } else if (S.era === 8 && S.ganadoPa && S.abelardo === 2 && S.apr >= BALANCE.investigacionTenochtitlan) {   // PARÍS → TENOCHTITLAN
    S.apr -= BALANCE.investigacionTenochtitlan;
    const perdido = entrarEpoca(7);
    sfx.logro();
    toast('🌋 <b>Pasan tres siglos y un océano: Tenochtitlan.</b> Del otro lado del mar, en un mundo que Europa todavía no conoce, los mexicas fundan una ciudad sobre el agua, en un lago entre volcanes. Ahí todos los niños van a la escuela.', 15000);
    if (perdido) toast(`🛶 <b>La canoa no carga la universidad entera.</b> París ahorró más de lo que cabe: Tenochtitlan empieza con ${fmt(S.pre)} ${monIco()}.`, 12000);
    if (S.famaParis) toast(`⭐ <b>La fama de París no cruza el océano.</b> En Tenochtitlan nadie ha oído hablar de los maestros de la Montaña: la escuela llega con el renombre que traía de Bagdad (${S.rep}). El de la universidad te espera en Europa.`, 13000);
    resize();
  } else if (S.era === 7 && S.ganadoTe && S.neza === 2 && S.apr >= BALANCE.investigacionAmsterdam) {   // TENOCHTITLAN → ÁMSTERDAM
    S.apr -= BALANCE.investigacionAmsterdam;
    const perdido = entrarEpoca(9);
    sfx.logro();
    toast('🖨️ <b>Pasan dos siglos, y el océano de vuelta: Ámsterdam.</b> Una máquina de Maguncia multiplica los libros: lo que se compone una vez se imprime mil veces (hacia 1600, en México, sale impresa la palabra antigua que copiaron los frailes). En la ciudad de los canales, la casa Blaeu tiene nueve prensas y en cada barrio hay una escuela con su cartilla.', 15000);
    if (perdido) toast(`🐑 <b>No todo cabe en el viaje.</b> Tenochtitlan ahorró más de lo que se puede llevar: Ámsterdam empieza con ${fmt(S.pre)} ${monIco()}.`, 12000);
    if (S.famaVuelve) toast(`⭐ <b>La fama de París vuelve.</b> En Europa se siguen leyendo los libros de sus maestros: la escuela recupera el renombre que ganó en la universidad (+${S.famaVuelve}).`, 12000);
    resize();
  } else if (S.era === 9 && S.ganadoAm && S.comenio === 2 && S.apr >= BALANCE.investigacionFuturo) {   // ÁMSTERDAM → EL FUTURO (era21-plan): la última del viaje, en el valle del principio
    S.apr -= BALANCE.investigacionFuturo;
    const perdido = entrarEpoca(21);
    sfx.logro();
    toast(TXT_LLEGA_FUTURO, 16000);
    if (perdido) toast(`🎒 <b>No todo cabe en el viaje.</b> Ámsterdam ahorró más de lo que se puede llevar: el valle empieza con ${fmt(S.pre)} ${monIco()}.`, 12000);
    resize();
  } else if (S.era === 9 && S.ganadoAm && S.comenio === 2 && S.apr >= BALANCE.investigacionSantiago && false) {   // ÁMSTERDAM → SANTIAGO: salió del viaje (2026-10-05); queda como base de la escuela pública en la Exposición de 1889
    S.apr -= BALANCE.investigacionSantiago;
    const perdido = entrarEpoca(10);
    sfx.logro();
    toast('🎒 <b>Pasan casi dos siglos y un océano: Santiago de Chile.</b> Al pie de la cordillera, una república nueva quiere una escuela en cada pueblo. Pero no hay maestros: hay que formarlos, y mandarlos lejos.', 15000);
    if (perdido) toast(`🐑 <b>No todo cabe en el viaje.</b> Ámsterdam ahorró más de lo que se puede llevar: Santiago empieza con ${fmt(S.pre)} ${monIco()}.`, 12000);
    resize();
  } else if (S.era === 10 && S.ganadoSa && S.sarmiento === 2 && S.apr >= BALANCE.investigacionImperios) {
    S.apr -= BALANCE.investigacionImperios;
    entrarEpoca(11);
    sfx.logro();
    toast('⏳ <b>Pasan los imperios…</b> la retórica romana, los monasterios, la imprenta (épocas en construcción)… y la historia llega a <b>1920</b>: la era de la tiza.', 14000);
    resize();
  } else if (S.era === 11 && S.ganado && S.dewey === 2 && S.apr >= BALANCE.investigacionEra2) {
    S.apr -= BALANCE.investigacionEra2;
    entrarEpoca(12);
    sfx.logro();
    toast('📻 <b>¡1935!</b> El aula levanta su antena: empieza la época de las ondas y los proyectores. Hay aparatos nuevos en el dock, y la <b>kermesse</b> para financiarlos.', 12000);
  } else if (S.era === 12 && S.ganado2 && S.apr >= BALANCE.investigacionEra3) {
    S.apr -= BALANCE.investigacionEra3;
    entrarEpoca(13);
    sfx.logro();
    toast('📺 <b>¡1955!</b> El aula crece: tierra nueva, un aula anexa de ladrillo, un patio de juegos y la caja mágica de la TV. La época de los aparatos que prometían reemplazarlo todo.', 14000);
    resize(); // el mundo se expande: nuevas parcelas y paleta de época
  }
  if (S.apr < aprAntes) debito('r-apr', `−${fmt(aprAntes - S.apr)} 📖`); // el gran gasto también se ve
}
function kermesse() {
  if (ordEra(S.era) < 12 || S.kermCd > 0 || S.apr < kermesseCosto()) return;
  S.apr -= kermesseCosto();
  debito('r-apr', `−${fmt(kermesseCosto())} 📖`);
  const rinde = kermesseRinde();
  S.pre += rinde; S.kermCd = BALANCE.kermesse.cooldown;
  sfx.moneda();
  toast(`🎪 ¡Kermesse escolar! La comunidad vio lo aprendido y donó <b>${rinde}</b> ${monIco()}.`);
}

/* EL ARCO DE ÉPOCA, DECLARADO. El cierre de cada época eran seis bloques copiados dentro de tick():
   cada uno con su lista de saberes a mano, su pensador que espera, su nudge y su pantalla de victoria.
   Ahora cada época es UNA entrada: los saberes se derivan de la ficha única (saberesEpoca), el pensador
   es un predicado y los textos viven aquí; el bucle al final de tick() hace el resto. Época nueva = una
   entrada aquí, más su rama en investigar(). `desde` cubre a la época que puede cerrarse tarde (la 11
   se domina aunque ya estés en la 12); `edadMin` es solo de la Época 1: exige el asentamiento (rama A).
   Desde la C del motor, cada entrada también le da su VOZ a la consejera (consejoActual en 14-reglas):
   `voz()` dice quién firma y con qué cara, `pensadorTema` es lo que falta cuando los saberes están y el
   pensador no, `inv`/`invLista`/`invFalta` hablan de la investigación que abre la época siguiente, e
   `idle` es el descanso. La Época 1 no lleva voz: su consejera es el ramal propio de consejoActual. */
const ARCO_EPOCAS = [
  // La Época 1 pide los DIEZ saberes, no solo los cuatro de la aldea: comprobar solo el Neolítico daba
  // por hecho que llegar al asentamiento garantizaba el Paleolítico, y no siempre (basta un save viejo
  // con algo a medias para cerrar la época con el tambor juntando polvo). Su pensadora, la Abuela, no
  // se pide aquí: es la compuerta del asentamiento, la rama A dentro de tick().
  { era: 1, construida: true, flag: 'ganadoF', saberes: saberesEpoca(1), edadMin: 2,
    titulo: `🏆 Época ${numEpoca(1)} dominada`,
    texto: () =>
      `Del fuego a la aldea: el círculo, el tambor, las pinturas, el conteo, la cacería y la orilla… y luego la siembra, el corral, la cerámica y el telar. <b>La educación ya estaba completa antes de la primera escuela.</b><br><br>` +
      `Aprendiste a enseñar de las dos maneras que existen: la cacería, que es coordinar a muchos, y la orilla, que es hacerle sitio a uno.<br><br>` +
      `El clan que aprendió a sobrevivir aprendió a quedarse: excedente, memoria y oficios.<br><br>` +
      (ULTIMA_EPOCA === 1
        ? `<b>Y hasta aquí llega Lumbre, por hoy.</b> Gracias por jugarlo entero: acabas de recorrer la primera de sus épocas, un viaje por los grandes hitos de cómo la humanidad aprendió a enseñar. Las que siguen se están construyendo con este mismo cuidado.<br><br>` +
          `Lumbre no será solo un juego para jugar. Será también un <b>taller</b>: un motor con el que, conversando con Claude Code en lenguaje natural y sin escribir una línea de código, podrás construir <b>tu propia época y tu propio escenario</b>, el de tu asignatura, tu obra o tu aula.<br><br>` +
          `<i>Porque la mejor manera de aprender algo es tener que enseñárselo a alguien. Aunque ese alguien sea un mundo que construyes tú.</i>`
        : `⏳ <i>Y al fondo del valle, un día, alguien presiona una caña en barro húmedo. ${S.signo ? 'Cuando' : 'Talla tú la próxima cuenta del hueso para que nazca el signo; cuando'} la memoria del clan esté llena (ya no cabe más sin escribirla), deja pasar los <b>Milenios</b> desde el dock.</i>`) },
  { era: 2, construida: true, flag: 'ganadoSum', saberes: saberesEpoca(2),
    // `manos()`: lo que la época pide tocar AHORA (la consejera lo dice antes del siguiente saber,
    // como la 1 dice la cosecha o la orilla). Época nueva = declarar aquí sus verbos, si los tiene.
    manos: () => {
      if ((S.fichasPend || 0) >= 3) return { t: 'Las cuentas del templo esperan su sello: grano que entró, rebaño que salió. Sella las fichas: la administración paga.', g: { x: 12.4, y: 8.8 } };
      if ((S.copiasPend || 0) >= 2) return { t: 'Hay copias esperando en la mesa: el modelo arriba, el intento abajo. Corrige las cuñas torcidas: el barro perdona.', g: { x: 10.1, y: 8.75 } };
      if (haySitioDictado()) return { t: 'La que dicta tiene voz para más tablillas. Haz sitio a otro escriba en el dictado.', g: { x: 9.9, y: 8.4 } };
      return null;
    },
    pensador: () => S.enheduanna === 2,
    nudge: '🌙 Las tablillas están escritas… pero la sacerdotisa de Ur espera en el patio. La ciudad no cierra esta época sin escuchar su canto.',
    voz: () => S.enheduanna === 2 ? { f: 'Enheduanna', cara: 'enheduanna' } : { f: 'El padre de la edubba', cara: 'edubba' },
    pensadorTema: 'el canto de Enheduanna',
    inv: BALANCE.investigacionSiglos,
    invLista: 'La edubba ya dio todo su saber. Deja pasar los siglos hacia el Nilo: el reloj espera en el dock.',
    invFalta: 'Todo lo aprendido madura solo. Acumulamos saber para que los siglos nos lleven al Nilo.',
    idle: 'La edubba dicta sola: tablilla va, tablilla viene. Vuelve cuando algo junte polvo.',
    titulo: `🏆 Época ${numEpoca(2)} dominada`,
    frontera: 'La casa está entera y el río sigue pasando. Quédate el rato que quieras: mira la crecida, escucha el dictado, deja arder los candiles.',
    texto: () =>
      `Tablilla, cálamo, cálculos, listas, dictado y la edubba entera: <b>la memoria ya no muere con nadie, y aprender ya tiene casa</b>.<br><br>` +
      `Lo que la edubba inventó (copiar, dictar, corregir, evaluar) seguirá en cada aula cuatro mil años después.<br><br>` +
      (ULTIMA_EPOCA === 2
        ? `<b>Y hasta aquí llega Lumbre, por hoy.</b> Gracias por jugarlo entero: del fogón del clan a la casa de las tablillas, acabas de recorrer los ${NUM_PALABRA[numEpoca(2)]} primeros hitos de cómo la humanidad aprendió a enseñar. Las épocas que siguen se están construyendo con este mismo cuidado.<br><br>` +
          `Lumbre no será solo un juego para jugar. Será también un <b>taller</b>: un motor con el que, conversando con Claude Code en lenguaje natural y sin escribir una línea de código, podrás construir <b>tu propia época y tu propio escenario</b>, el de tu asignatura, tu obra o tu aula.<br><br>` +
          `<i>Porque la mejor manera de aprender algo es tener que enseñárselo a alguien. Aunque ese alguien sea un mundo que construyes tú.</i>`
        : `⏳ <i>Junta ${fmt(BALANCE.investigacionSiglos)} 📖 y deja que los siglos te lleven al Nilo, a <b>Egipto</b>.</i>`) },
  { era: 3, construida: true, flag: 'ganadoEg', saberes: saberesEpoca(3),
    // LA ESCALERA DE LA ÉPOCA (c07, medida el 2026-08-24): umbrales de saber RELATIVOS a la llegada
    // (entrarEpoca estampa eraAprBase), repartidos sobre la curva real del bot (~15 G en ~17 min):
    // caen hacia los minutos 3, 6, 9, 12 y 15. Rep 7→12 y aprendices 18→28 durante la época.
    hitos: [400e6, 1.8e9, 3.5e9, 6.5e9, 10.5e9],
    manos: () => {
      if ((S.ejerPend || 0) >= 2) return { t: 'Hay ejercicios esperando en el patio. Practica en la piedra, que no cobra los errores; lo ya ensayado puede pasar al papiro, y la hoja cara paga.', g: { x: 9.8, y: 7.4 } };
      if ((S.lindes || []).length) return { t: 'La crecida borró los lindes de la vega. Tiende la cuerda: volver a medir es el oficio del año.', g: { x: 11.4, y: 11.9 } };
      return null;
    },
    pensador: () => S.ptahhotep === 2,
    nudge: '🪷 Los seis saberes están aprendidos… pero el viejo visir sigue esperando en la puerta. La Casa de la Vida no cierra esta época sin aprender a escuchar.',
    voz: () => S.ptahhotep === 2 ? { f: 'Ptahhotep', cara: 'ptahhotep' } : { f: 'El maestro Kagemni', cara: 'kagemni' },
    pensadorTema: 'el arte de escuchar de Ptahhotep',
    inv: BALANCE.investigacionAgora,
    invLista: 'La Casa de la Vida ya dio todo su saber. Sigue el mar hacia Atenas: el reloj espera en el dock.',
    invFalta: 'Todo lo aprendido madura solo. Acumulamos saber para seguir el mar hacia Atenas.',
    idle: 'La Casa de la Vida instruye sola, al ritmo del río. Vuelve cuando algo junte polvo.',
    frontera: 'El archivo está lleno y el río sigue midiendo el año. Quédate el rato que quieras: mira la crecida, escucha la sala de copias, deja que el gato ronde los rollos.',
    titulo: `🏆 Época ${numEpoca(3)} dominada`,
    texto: () =>
      `Papiro, paleta, ostracón, la Kemyt, la cuerda y la Casa de la Vida: <b>la educación ya tiene libro, borrador, corrección y matemática aplicada</b>.<br><br>` +
      `El error se volvió barato, y por eso se volvió maestro: cada papiro limpio se pagó con lascas llenas de intentos.<br><br>` +
      (ULTIMA_EPOCA === 3
        ? `<b>Y hasta aquí llega Lumbre, por hoy.</b> Del fogón del clan a la Casa de la Vida, acabas de recorrer los ${NUM_PALABRA[numEpoca(3)]} primeros hitos de cómo la humanidad aprendió a enseñar. Las épocas que siguen se construyen con este mismo cuidado.`
        : `⏳ <i>Junta ${fmt(BALANCE.investigacionAgora)} 📖 y sigue el mar hacia <b>Atenas</b>.</i>`) },
  { era: 4, construida: true, flag: 'ganadoAg', saberes: saberesEpoca(4),
    // LA ESCALERA DEL ÁGORA: umbrales RELATIVOS a la llegada; se afinan con la curva del bot (balance-epoca4.md)
    hitos: [1e10, 2.5e10, 4e10, 5.5e10, 7e10], // la producción real de la época ronda 6e10 (bot 2026-09-06)
    manos: () => {
      if ((S.dudaPend || 0) >= 2 && (S.mats.cera || 0) > 0) return { t: 'Hay dudas esperando en el ágora. Dilas en el banco, que es rápido; o llévalas al claro y pregunta, que es lento y se queda.', g: { x: AGORA_PREGUNTAR.x, y: AGORA_PREGUNTAR.y } };
      if (puedeContratarSofista() && S.alumnos > alumnosBien()) return { t: 'Hay más muchachos que maestros y un sofista ofrece enseñar desde hoy… cobrando cada estación. Tócalo en su tarima si te conviene; o forma un maestro propio, lento y gratis.', g: { x: TARIMA_SOFISTA.x, y: TARIMA_SOFISTA.y } };
      return null;
    },
    pensador: () => S.socrates === 2,
    nudge: '🏛️ Los seis saberes están aprendidos… pero el hombre descalzo sigue en la plaza haciendo preguntas. El ágora no cierra esta época sin recibir a Sócrates.',
    voz: () => S.socrates === 2 ? { f: 'Sócrates', cara: 'socrates' } : { f: 'El grammatistes Dionisio', cara: 'dionisio' },
    pensadorTema: 'la mayéutica de Sócrates',
    inv: BALANCE.investigacionAlejandria,
    invLista: 'El ágora ya dio todo su saber. Embarca los rollos hacia Alejandría: el barco espera en el dock.',
    invFalta: 'Todo lo aprendido madura solo. Acumulamos saber para embarcar los rollos hacia Alejandría.',
    idle: 'El ágora enseña sola, pregunta a pregunta. Vuelve cuando algo junte polvo.',
    frontera: 'La Academia tiene puerta y nombre, y el arroyo sigue corriendo. Quédate el rato que quieras: siéntate bajo el plátano, escucha el coro de la tarde, mira a alguien no saber y después saber.',
    titulo: `🏆 Época ${numEpoca(4)} dominada`,
    texto: () =>
      `Tablilla, lira, palestra, sofista, la pregunta y la Academia: <b>la educación ya tiene borrador infinito, cuerpo, música, precio, método y escuela con nombre</b>.<br><br>` +
      `El maestro dejó de dar la respuesta, y por eso el que aprende empezó a producirla: cada «!» de esta plaza pasó antes por un «no sé».<br><br>` +
      (ULTIMA_EPOCA === 4
        ? `<b>Y hasta aquí llega Lumbre, por hoy.</b> Gracias por jugarlo entero: del fogón del clan al olivar de Academo, acabas de recorrer los ${NUM_PALABRA[numEpoca(4)]} primeros hitos de cómo la humanidad aprendió a enseñar. Las épocas que siguen se construyen con este mismo cuidado.`
        : `⏳ <i>Junta ${fmt(BALANCE.investigacionAlejandria)} 📖 y embarca los rollos hacia <b>Alejandría</b>.</i>`) },
  { era: 5, construida: true, flag: 'ganadoAl', saberes: saberesEpoca(5),
    // LA ESCALERA DE ALEJANDRÍA: umbrales RELATIVOS a la llegada, sobre la curva real del bot (~1,4e14 en ~15,6 min):
    // caen hacia los minutos 3, 6, 9, 12 y 14 (balance-epoca5.md)
    hitos: [1.7e12, 8e12, 1.5e13, 3.6e13, 8.5e13],
    manos: () => {
      if (rollosAbierto() && !S.originales && S.vioBarco) return { t: 'Los barcos traen libros y hay que decidir qué hacemos con los originales. Toca la barca del puerto: ¿nos los quedamos, o los devolvemos y guardamos la copia?', g: { x: BARCA_AL.x, y: BARCA_AL.y } };
      if (puedeCatalogar() && rollosPend() >= 2) return { t: 'Hay rollos esperando en el muelle. Tócalos y ponlos en su estante: cada autor trae su pista. Lo que no se cataloga no lo encuentra nadie.', g: { x: MUELLE_AL.x, y: MUELLE_AL.y } };
      if (rollosAbierto() && (S.mats.papiro || 0) < 1 && !marCerrado()) return { t: 'Sin papiro no hay copia, y sin copia los barcos se van con sus libros. El juncal del Mareotis lo da: recoge sus luces.', g: { x: LAGO_AL.x, y: LAGO_AL.y } };
      return null;
    },
    pensador: () => S.hipatia === 2,
    nudge: '📜 Los seis saberes están aprendidos… pero la mujer del manto de filósofo sigue esperando en la puerta del Museo. Alejandría no cierra esta época sin abrir su clase a todos.',
    voz: () => S.hipatia === 2 ? { f: 'Hipatia', cara: 'hipatia' } : { f: 'El bibliotecario Eratóstenes', cara: 'eratostenes' },
    pensadorTema: 'la clase abierta de Hipatia',
    inv: BALANCE.investigacionRoma,
    invLista: 'La Biblioteca ya dio todo su saber. Cruza el mar hasta Roma, donde la escuela se vuelve un camino de tres escuelas: el reloj espera en el dock.',
    invFalta: 'Todo lo aprendido madura solo. Acumulamos saber para cruzar el mar hasta Roma.',
    idle: 'La Biblioteca se ordena sola, rollo a rollo. Vuelve cuando llegue un barco o algo junte polvo.',
    frontera: 'Los estantes tienen nombre y el Faro sigue encendido. Quédate el rato que quieras: mira entrar los barcos, escucha las gaviotas, deja que alguien encuentre el libro que buscaba.',
    titulo: `🏆 Época ${numEpoca(5)} dominada`,
    texto: () =>
      `El Museo, los rollos de los barcos, los Pínakes, los Elementos, la sombra de Eratóstenes y el códice: <b>la educación ya tiene biblioteca, catálogo, manual, ciencia y libro que se hojea</b>.<br><br>` +
      `El saber dejó de ser lo que uno recuerda y pasó a ser lo que cualquiera puede encontrar: cada rollo bien puesto es una respuesta que espera a quien la busque.<br><br>` +
      (ULTIMA_EPOCA === 5
        ? `<b>Y hasta aquí llega Lumbre, por hoy.</b> Gracias por jugarlo entero: del fogón del clan a la Biblioteca de Alejandría, acabas de recorrer los ${NUM_PALABRA[numEpoca(5)]} primeros hitos de cómo la humanidad aprendió a enseñar. Las épocas que siguen se construyen con este mismo cuidado.`
        : `⏳ <i>Junta ${fmt(BALANCE.investigacionRoma)} 📖 y cruza el mar, hasta Roma.</i>`) },
  /* ROMA (era14-plan): en el viaje va entre Alejandría y Bagdad (ORDEN_EPOCAS); su id es 14 porque nació después */
  { era: 14, construida: true, flag: 'ganadoRo', saberes: saberesEpoca(14), alumnosPorHito: 0,   // en Roma los niños los trae el pedagogo a las escuelas: los hitos dan renombre (que se queda en Roma) y no aprendices que cruzarían a Bagdad (balance-epoca14.md)
    // LA ESCALERA DE ROMA: umbrales RELATIVOS a la llegada, sobre la curva medida del bot (docs/balance-epoca14.md):
    // caen hacia los minutos 3, 6, 9, 12 y 14
    hitos: [1.4e14, 3.4e14, 6.5e14, 1.3e15, 2.1e15],
    manos: () => {
      const listos = (S.alumnosRo || []).filter(a => a.p >= PASA_ENTERO);
      if (listos.some(a => a.e === 0) && (S.mats.calculi || 0) < 1) return { t: 'Hay niños listos para pasar del ludus, pero cada uno gasta un calculus y no queda ninguno. La orilla del Tíber los deja: recoge sus luces.', g: { x: ORILLA_RO.x, y: ORILLA_RO.y } };
      if (listosRo() > 0) return { t: `${listosRo() === 1 ? 'Un alumno está listo' : listosRo() + ' alumnos están listos'} para pasar a la escuela siguiente. Toca las escuelas y pásalos: a tiempo rinde; apurado llega a medias; retenido, se aburre.`, g: { x: LUDUS_RO.x, y: LUDUS_RO.y } };
      if (aburridosRo() > 0) return { t: 'Hay alumnos que ya aprendieron todo lo de su escuela y se aburren, porque la siguiente está llena. Pasa primero a los de arriba: el rétor deja lugar al grammaticus, y el grammaticus al ludus.', g: { x: RHETOR_RO.x, y: RHETOR_RO.y } };
      return null;
    },
    pensador: () => S.quintiliano === 2,
    nudge: '📕 Los seis saberes están aprendidos… pero el rétor de Calagurris sigue esperando en la Vía Sacra. Roma no cierra esta época sin descolgar la férula.',
    voz: () => S.quintiliano === 2 ? { f: 'Quintiliano', cara: 'quintiliano' } : { f: 'Plinio el Joven', cara: 'plinio' },
    pensadorTema: 'la escuela sin férula de Quintiliano',
    inv: BALANCE.investigacionBagdad,
    invLista: 'Las escuelas de Roma ya dieron todo su saber. Deja pasar siete siglos hasta Bagdad: el reloj espera en el dock.',
    invFalta: 'Todo lo aprendido madura solo. Acumulamos saber para dejar pasar los siglos hasta Bagdad.',
    idle: 'Roma enseña sola: el litterator con sus calculi, el grammaticus con Virgilio, el rétor con sus declamaciones. Vuelve cuando un alumno esté listo para pasar o algo junte polvo.',
    frontera: 'El Foro sigue lleno y el Tíber sigue bajando. Quédate el rato que quieras: mira a los niños con sus tablillas antes del amanecer, a los muchachos que declaman bajo el pórtico, a los oradores que entran a la basílica Julia.',
    titulo: `🏆 Época ${numEpoca(14)} dominada`,
    texto: () =>
      `El ludus, los calculi, el grammaticus, el rétor, la escuela pagada y la Institutio Oratoria: <b>la enseñanza ya es un sistema: tres escuelas una detrás de otra, maestros con sueldo y el primer tratado completo de cómo enseñar</b>.<br><br>` +
      `En Roma nacieron la primaria, la secundaria y la superior, y también una pregunta que todavía nos hacemos: si se aprende con la férula o jugando. Quintiliano escribió que pegar es cosa de esclavos, y que a cada niño hay que mirarlo como distinto.<br><br>` +
      (ULTIMA_EPOCA === 14
        ? `<b>Y hasta aquí llega Lumbre, por hoy.</b> Gracias por jugarlo entero: del fogón del clan a las escuelas de Roma, acabas de recorrer los ${NUM_PALABRA[numEpoca(14)]} primeros hitos de cómo la humanidad aprendió a enseñar. Las épocas que siguen se construyen con este mismo cuidado.`
        : `⏳ <i>Junta ${fmt(BALANCE.investigacionBagdad)} 📖 y deja pasar siete siglos, hasta Bagdad.</i>`) },
  { era: 6, construida: true, flag: 'ganadoBa', saberes: saberesEpoca(6),
    // LA ESCALERA DE BAGDAD: umbrales RELATIVOS a la llegada, sobre la curva real del bot (balance-epoca6.md)
    hitos: [1.4e14, 3.4e14, 2.3e15, 1.1e16, 2.6e16],   // caen hacia los minutos 3, 6, 9, 12 y 14 de la curva medida (~6e16 en ~18 min)
    manos: () => {
      if (S.mesa && S.mesa.some(a => a.t <= 0) && (S.mats.papel || 0) < 1) return { t: 'Hay una traducción terminada que no se puede copiar: falta papel. El molino del canal lo da: recoge sus luces.', g: { x: MOLINO_BA.x, y: MOLINO_BA.y } };
      if (puedeTraducir() && manuscritosPend() >= 2) return { t: 'Hay manuscritos esperando en la puerta de Kufa. Tócalos y elige cómo traducirlos: palabra por palabra, rápido, o por el sentido, lento y para siempre.', g: { x: ESPERA_BA.x, y: ESPERA_BA.y } };
      if (ijazaDisponible()) return { t: 'Un estudiante leyó el libro entero con su maestro y espera su ijaza. Tócalo en la halqa: con el permiso escrito, enseñará a otros.', g: { x: HALQA_BA.x, y: HALQA_BA.y } };
      if (puedeTraducir()) return { t: 'Hay un manuscrito en la puerta y un asiento libre en la mesa. Tócalo y elige cómo traducirlo.', g: { x: ESPERA_BA.x, y: ESPERA_BA.y } };
      if (mesaAbierta() && (S.mats.papel || 0) < 1 && (S.mesa || []).length) return { t: 'El papel se acaba, y cada traducción se copia en una hoja. Recoge las luces del molino del canal.', g: { x: MOLINO_BA.x, y: MOLINO_BA.y } };
      return null;
    },
    pensador: () => S.hunayn === 2,
    nudge: '🌙 Los seis saberes están aprendidos… pero el médico de los manuscritos sigue esperando en la puerta de la Casa de la Sabiduría. Bagdad no cierra esta época sin aprender que traducir se enseña.',
    voz: () => S.hunayn === 2 ? { f: 'Hunayn ibn Ishaq', cara: 'hunayn' } : { f: 'El librero al-Jahiz', cara: 'aljahiz' },
    pensadorTema: 'el taller de Hunayn',
    inv: BALANCE.investigacionChina,
    invLista: 'La Casa de la Sabiduría ya dio todo su saber. Deja pasar dos siglos y recorre la Ruta de la Seda al revés, hasta la capital de los Song, donde se gobierna estudiando: el reloj espera en el dock.',
    invFalta: 'Todo lo aprendido madura solo. Acumulamos saber para recorrer la Ruta de la Seda hasta Kaifeng.',
    idle: 'Bagdad traduce sola, hoja a hoja. Vuelve cuando llegue una caravana o algo junte polvo.',
    frontera: 'Las caravanas siguen llegando y el Tigris sigue corriendo. Quédate el rato que quieras: mira girar la noria del molino, escucha el cálamo en la mesa, deja que alguien encuentre en árabe un libro que se escribió en griego.',
    titulo: `🏆 Época ${numEpoca(6)} dominada`,
    texto: () =>
      `El papel, la Casa de la Sabiduría, la traducción, la halqa y la ijaza, el álgebra y la madrasa: <b>la educación ya tiene libro barato, saber que cruza las lenguas, permiso para enseñar, método y escuela con renta propia</b>.<br><br>` +
      `Lo que se escribió en griego, en persa y en sánscrito se leyó en árabe, y siglos después, desde el árabe, en Europa: cada traducción decidió entre la letra y el sentido, y así viajó el saber.<br><br>` +
      (ULTIMA_EPOCA === 6
        ? `<b>Y hasta aquí llega Lumbre, por hoy.</b> Gracias por jugarlo entero: del fogón del clan a la Casa de la Sabiduría de Bagdad, acabas de recorrer los ${NUM_PALABRA[numEpoca(6)]} primeros hitos de cómo la humanidad aprendió a enseñar. Las épocas que siguen se construyen con este mismo cuidado.`
        : `⏳ <i>Junta ${fmt(BALANCE.investigacionChina)} 📖 y recorre la Ruta de la Seda, hasta <b>Kaifeng</b>.</i>`) },
  /* CHINA SONG (era15-plan): en el viaje va entre Bagdad y París (ORDEN_EPOCAS); su id es 15 porque nació después. Lo que
     China gana se queda en China (`bonoVive`, el renombre en entrarEpoca, sin aprendices en sus hitos), como en Roma */
  { era: 15, construida: true, flag: 'ganadoCh', saberes: saberesEpoca(15), alumnosPorHito: 0,
    // LA ESCALERA DE KAIFENG: umbrales RELATIVOS a la llegada, sobre la curva medida del bot (docs/balance-epoca15.md): caen
    // hacia los minutos 3, 6, 9, 12 y 14 (la época produce ~6,7e17 en ~16 min)
    hitos: [1.5e16, 3.5e16, 7e16, 1.6e17, 3e17],
    manos: () => {
      const E = candidatosEsperan();   // EL GESTO: los candidatos que esperan que elijas cómo se preparan (el modal #examen)
      if (E > 0) return { t: `${E === 1 ? 'Un candidato espera' : E + ' candidatos esperan'} que elijas cómo se prepara${E === 1 ? '' : 'n'} para el examen (en ${relojCh(examenEn())}). Toca la escuela de la prefectura: de memoria se prepara rápido y aprueba más${modoAbierto('asuntos') ? '; los asuntos traen recursos' : ''}${modoAbierto('entender') ? '; el que estudia para entender gobierna mejor' : ''}.`, g: { x: PREFECTURA_CH.x, y: PREFECTURA_CH.y, abre: () => abrirExamen() } };
      if (S.tecs[82] && S.tecs[82].fase === 'sin' && (S.mats.tinta || 0) < MAT_COSTO && S.tecs[81] && S.tecs[81].fase !== 'sin') return { t: 'La imprenta de los clásicos pide tinta, y no queda. El horno de hollín, junto a los pinos al pie de la muralla, la da: recoge sus luces.', g: { x: HORNO_TINTA_CH.x, y: HORNO_TINTA_CH.y } };
      return null;
    },
    pensador: () => S.zhuxi === 2,
    nudge: '⛰️ Los seis saberes están aprendidos… pero el letrado que viene de un siglo después sigue esperando en la puerta de la ciudad. Kaifeng no cierra esta época sin aprender a leer despacio.',
    voz: () => S.zhuxi === 2 ? { f: 'Zhu Xi', cara: 'zhuxi' } : { f: 'Li Qingzhao', cara: 'liqingzhao' },
    pensadorTema: 'el leer despacio de Zhu Xi',
    inv: BALANCE.investigacionParis,
    invLista: 'Las escuelas de Kaifeng ya dieron todo su saber. En esos mismos años, al otro extremo de la Ruta de la Seda, una abadía toca sus campanas junto al Sena: el reloj espera en el dock.',
    invFalta: 'Todo lo aprendido madura solo. Acumulamos saber para cruzar al otro extremo de la Ruta de la Seda, hasta el París de las escuelas.',
    idle: 'Kaifeng estudia sola: la sala de los clásicos, las planchas de la imprenta, los candidatos con su pincel. Vuelve cuando algo junte polvo.',
    frontera: 'El Bian sigue bajando con sus barcas y el Puente Arcoíris sigue lleno. Quédate el rato que quieras: mira a los estudiantes moler la tinta, escucha la recitación de los clásicos, sube a la pagoda a ver la lista de los aprobados.',
    titulo: `🏆 Época ${numEpoca(15)} dominada`,
    texto: () =>
      `La escuela de la prefectura, los clásicos impresos, las dos salas de Hu Yuan, el examen anónimo, la academia y el examen de palacio: <b>se llega a gobernar estudiando: escuelas del Estado, libros impresos y un examen con el nombre tapado</b>.<br><br>` +
      `Confucio lo había dicho mil quinientos años antes: «en la enseñanza no hay clases» (Analectas XV, 39). En Kaifeng se intentó con un examen, y el examen trajo también su precio: memorizar por años, la ansiedad, una escuela que se vuelve preparación para la prueba. ⚖️ Y las mujeres no podían rendirlo. Pero muchos de los que reprobaban se volvieron maestros de aldea, y prepararon a la generación siguiente.<br><br>` +
      (ULTIMA_EPOCA === 15
        ? `<b>Y hasta aquí llega Lumbre, por hoy.</b> Gracias por jugarlo entero: del fogón del clan al examen de Kaifeng, acabas de recorrer los ${NUM_PALABRA[numEpoca(15)]} primeros hitos de cómo la humanidad aprendió a enseñar. Las épocas que siguen se construyen con este mismo cuidado.`
        : `⏳ <i>Junta ${fmt(BALANCE.investigacionParis)} 📖 y cruza al otro extremo de la Ruta de la Seda, hasta el París de las escuelas.</i>`) },
  { era: 7, construida: true, flag: 'ganadoTe', saberes: saberesEpoca(7),
    // LA ESCALERA DE TENOCHTITLAN: umbrales RELATIVOS a la llegada, sobre la curva real del bot (balance-epoca7.md). Con
    // Tenochtitlan después de París, ×77 los de cuando venía de Bagdad (lo que le dan los saberes de París; el orden, 2026-10-05)
    hitos: [1.5e18, 4.9e18, 3.4e19, 1e20, 1.6e20],   // caen hacia los minutos 3, 6, 9, 12 y 14 de la curva medida
    manos: () => {
      if (nacidosPend() >= 2 && telpoAbierto()) return { t: 'Hay recién nacidos esperando en la casa de la partera. Tócalos y promételos a una escuela: al telpochcalli del barrio, que es de todos, o al calmécac del templo, que tiene pocos lugares.', g: { x: PARTERA_TE.x, y: PARTERA_TE.y } };
      if (cantoDisponible()) return { t: 'Cae la tarde y la casa del canto espera a los jóvenes. Tócala: lo que se canta no se olvida, y esta noche se aprende más.', g: { x: CUICACALLI_TE.x, y: CUICACALLI_TE.y } };
      if (palabraDisponible()) return { t: 'El anciano tiene la palabra lista para los jóvenes, ante el recinto. Tócalo y escucha.', g: { x: PALABRA_TE.x, y: PALABRA_TE.y } };
      if (nacidosPend() && telpoAbierto()) return { t: 'Nació un niño en un barrio. Tócalo en la casa de la partera y elige su escuela.', g: { x: PARTERA_TE.x, y: PARTERA_TE.y } };
      if (calmecacAbierto() && calmecacLibre() && (S.mats.amate || 0) < 1 && nacidosPend()) return { t: 'El calmécac tiene lugar, pero cada estudiante pide un pliego de amate. Lo traen las canoas del tributo al embarcadero: recoge sus luces.', g: { x: EMBARCADERO_TE.x, y: EMBARCADERO_TE.y } };
      return null;
    },
    pensador: () => S.neza === 2,
    nudge: '🌺 Los seis saberes están aprendidos… pero el señor poeta de Texcoco sigue esperando en el embarcadero. Tenochtitlan no cierra esta época sin la flor y el canto.',
    voz: () => S.neza === 2 ? { f: 'Nezahualcóyotl', cara: 'nezahualcoyotl' } : { f: 'La partera Tlazohtzin', cara: 'partera' },
    pensadorTema: 'la flor y el canto',
    inv: BALANCE.investigacionAmsterdam,
    invLista: 'Las escuelas del calpulli ya dieron todo su saber. Pasan dos siglos, y del otro lado del océano una máquina multiplica los libros: el reloj espera en el dock.',
    invFalta: 'Todo lo aprendido madura solo. Acumulamos saber para dejar pasar los siglos hasta la imprenta.',
    idle: 'Tenochtitlan enseña sola: los jóvenes en sus escuelas, las canoas en el lago. Vuelve cuando nazca un niño o algo junte polvo.',
    frontera: 'Las canoas siguen cruzando el lago y en cada barrio hay una escuela. Quédate el rato que quieras: escucha el huéhuetl al atardecer, mira a los jóvenes en las chinampas, deja que un niño encuentre su camino.',
    titulo: `🏆 Época ${numEpoca(7)} dominada`,
    texto: () =>
      `El amate, el telpochcalli, el calmécac, la cuicacalli, la cuenta de los días y la palabra antigua: <b>la educación ya es de todos: una escuela en cada barrio, el libro pintado, el canto que no se olvida y la palabra de los viejos</b>.<br><br>` +
      `En Tenochtitlan ningún niño se quedaba sin escuela, siglos antes de que Europa lo intentara. No era la misma escuela para todos ⚖️, pero todos iban: y lo que sabemos de ella lo copiaron, de boca de los ancianos, unos frailes que llegaron después.<br><br>` +
      (ULTIMA_EPOCA === 7
        ? `<b>Y hasta aquí llega Lumbre, por hoy.</b> Gracias por jugarlo entero: del fogón del clan a las escuelas de Tenochtitlan, acabas de recorrer los ${NUM_PALABRA[numEpoca(7)]} primeros hitos de cómo la humanidad aprendió a enseñar. Las épocas que siguen se construyen con este mismo cuidado.`
        : `⏳ <i>Junta ${fmt(BALANCE.investigacionAmsterdam)} 📖 y deja pasar dos siglos, hasta la imprenta.</i>`) },
  { era: 8, construida: true, flag: 'ganadoPa', saberes: saberesEpoca(8),
    // LA ESCALERA DE PARÍS: umbrales RELATIVOS a la llegada, sobre la curva real del bot (balance-epoca8.md). Con París antes
    // de Tenochtitlan, 1/79 de los de cuando venía de ella (lo que le daban sus saberes; el orden, 2026-10-05)
    hitos: [1.6e16, 4.3e16, 1.8e17, 1.1e18, 1.9e18],   // sobre la curva medida (curvaprod8): minutos 3, 6, 9, 12 y 14
    manos: () => {
      if (licenciaDisponible()) return { t: 'Un bachiller aprobó su examen y espera la licencia en la sala de los maestros. Tócalo: con la licencia, abre su escuela.', g: { x: UNIVERSIDAD_PA.x, y: UNIVERSIDAD_PA.y } };
      if (campanaAbierta() && !S.horario) return { t: 'La campana ya puede partir el día. Tócala y arma el horario: qué se hace en la mañana, al mediodía, en la tarde y en la noche.', g: { x: CAMPANA_PA.x, y: CAMPANA_PA.y } };
      if (campanaAbierta() && S.animo < animoMax() * 0.6 && !(S.horario || []).includes('descansar')) return { t: 'Las escuelas están cansadas: nadie descansa. Toca la campana y pon un tiempo de descansar en el horario.', g: { x: CAMPANA_PA.x, y: CAMPANA_PA.y } };
      if (scriptoriumAbierto() && campanaAbierta() && !(S.horario || []).includes('copiar')) return { t: 'El scriptorium espera copistas: pon un tiempo de copiar en el horario (toca la campana). Cada libro sube lo que aprende la ciudad.', g: { x: CAMPANA_PA.x, y: CAMPANA_PA.y } };
      if (disputaAbierta() && cuestionesPend() >= 2 && !(S.horario || []).includes('disputar')) return { t: 'Hay cuestiones esperando su disputa en la Montaña. Pon un tiempo de disputar en el horario: toca la campana.', g: { x: CAMPANA_PA.x, y: CAMPANA_PA.y } };
      if ((S.horario || []).includes('copiar') && scriptoriumAbierto() && (S.mats.pergamino || 0) < 1) return { t: 'El scriptorium no tiene pergamino. El pergaminero, junto al Sena, lo da: recoge sus luces.', g: { x: PERGAMINERO_PA.x, y: PERGAMINERO_PA.y } };
      return null;
    },
    pensador: () => S.abelardo === 2,
    nudge: '⚖️ Los seis saberes están aprendidos… pero el maestro de la Montaña sigue esperando al pie del Petit Pont. París no cierra esta época sin aprender a dudar.',
    voz: () => S.abelardo === 2 ? { f: 'Pedro Abelardo', cara: 'abelardo' } : { f: 'Hugo de San Víctor', cara: 'hugo' },
    pensadorTema: 'el sic et non de Abelardo',
    inv: BALANCE.investigacionTenochtitlan,
    invLista: 'Las escuelas de París ya dieron todo su saber. Pasan tres siglos, y del otro lado del océano, en un lago entre volcanes, se funda una ciudad sobre el agua: el reloj espera en el dock.',
    invFalta: 'Todo lo aprendido madura solo. Acumulamos saber para cruzar el océano hasta Tenochtitlan.',
    idle: 'París sigue su horario solo: la campana toca y cada uno va a su tarea. Vuelve cuando un bachiller espere su licencia o algo junte polvo.',
    frontera: 'La campana sigue tocando las horas y el Sena sigue corriendo. Quédate el rato que quieras: escucha prima y completas, mira a los copistas en sus atriles, deja que alguien dispute una cuestión en la Montaña.',
    titulo: `🏆 Época ${numEpoca(8)} dominada`,
    texto: () =>
      `El pergamino, la campana, el scriptorium, la disputatio, la universidad y la Sorbona: <b>la educación ya tiene horario, libros copiados, método para dudar, licencia para enseñar y colegio con biblioteca</b>.<br><br>` +
      `En París el día de la escuela empezó a tener horas, y de la escuela de la catedral salió la universidad: un gremio de maestros y estudiantes que todavía existe.<br><br>` +
      (ULTIMA_EPOCA === 8
        ? `<b>Y hasta aquí llega Lumbre, por hoy.</b> Gracias por jugarlo entero: del fogón del clan a las escuelas de París, acabas de recorrer los ${NUM_PALABRA[numEpoca(8)]} primeros hitos de cómo la humanidad aprendió a enseñar. Las épocas que siguen se construyen con este mismo cuidado.`
        : `⏳ <i>Junta ${fmt(BALANCE.investigacionTenochtitlan)} 📖 y cruza el océano, hasta Tenochtitlan.</i>`) },
  { era: 9, construida: true, flag: 'ganadoAm', saberes: saberesEpoca(9),
    // LA ESCALERA DE ÁMSTERDAM: umbrales RELATIVOS a la llegada, sobre la curva real del bot (balance-epoca9.md)
    hitos: [9e19, 2.9e20, 8e20, 1.65e21, 2.7e21],   // sobre la curva medida (curvaprod9): minutos 3, 6, 9, 12 y 14
    manos: () => {
      if (prensaAbierta() && !S.forma) return { t: 'La prensa está quieta. Toca la imprenta y elige qué componer: una vez armada la forma, cada tirada sale sola.', g: { x: PRENSA_AM.x, y: PRENSA_AM.y } };
      if (S.forma && S.forma.fase === 'tirar' && (S.mats.pliego || 0) < 1) return { t: 'La prensa no tiene papel. El molino de papel, sobre el bastión, deja pliegos: recoge sus luces.', g: { x: MOLINO_AM.x - 0.9, y: MOLINO_AM.y - 0.7 } };
      if (S.forma && S.forma.fase === 'tirar' && (S.demanda[S.forma.o] ?? 1) < 0.25) return { t: `Ya casi nadie compra ${OBRAS_AM[S.forma.o].n}: el mercado está lleno. Toca la imprenta y compón otra cosa; la demanda vuelve sola.`, g: { x: PRENSA_AM.x, y: PRENSA_AM.y } };
      if (obraAbierta('cartilla') && !(S.obrasVistas || []).includes('cartilla')) return { t: 'Ya se puede imprimir la cartilla de las escuelas de barrio. Toca la imprenta: cada tirada de cartillas hace lectores, y los lectores suben lo que aprende la ciudad.', g: { x: PRENSA_AM.x, y: PRENSA_AM.y } };
      if (obraAbierta('mapa') && !(S.obrasVistas || []).includes('mapa')) return { t: 'Con el atlas se pueden imprimir mapas: pocos los compran, pero dan renombre y saber. Toca la imprenta.', g: { x: PRENSA_AM.x, y: PRENSA_AM.y } };
      if (obraAbierta('orbis') && !(S.obrasVistas || []).includes('orbis')) return { t: 'El Orbis Pictus está listo para la prensa: el mundo en imágenes para los niños. Toca la imprenta.', g: { x: PRENSA_AM.x, y: PRENSA_AM.y } };
      return null;
    },
    pensador: () => S.comenio === 2,
    nudge: '🏫 Los seis saberes están aprendidos… pero el viejo del muelle sigue esperando junto a su baúl. Ámsterdam no cierra esta época sin enseñar todo a todos.',
    voz: () => S.comenio === 2 ? { f: 'Jan Amos Comenio', cara: 'comenio' } : { f: 'Joan Blaeu', cara: 'blaeu' },
    pensadorTema: 'el «todo a todos» de Comenio',
    inv: BALANCE.investigacionFuturo,
    invLista: 'Las imprentas de Ámsterdam ya dieron todo su saber. Deja pasar casi cuatro siglos, hasta hoy: el viaje vuelve al valle donde empezó. El reloj espera en el dock.',
    invFalta: 'Todo lo aprendido madura solo. Acumulamos saber para dejar pasar los siglos, hasta hoy.',
    idle: 'Ámsterdam imprime sola: la forma en la prensa, los pliegos colgados, los niños con su cartilla. Vuelve cuando el mercado se llene o algo junte polvo.',
    frontera: 'Las prensas siguen tirando y los barcos siguen entrando al IJ. Quédate el rato que quieras: mira al cajista con su componedor, a los niños con su cartilla, a los patinadores en los canales helados.',
    titulo: `🏆 Época ${numEpoca(9)} dominada`,
    texto: () =>
      `El tipo móvil, la prensa, la cartilla, el atlas, la Didáctica Magna y el Orbis Pictus: <b>el saber ya no depende del copista: se compone una vez y llega a todos, en un libro igual para cada uno, con dibujos para los niños</b>.<br><br>` +
      `En Ámsterdam la imprenta puso un libro barato en cada mano, y Comenio pidió lo que todavía pedimos: enseñar todo a todos, niños y niñas, ricos y pobres, en la misma escuela.<br><br>` +
      (ULTIMA_EPOCA === 9
        ? `<b>Y hasta aquí llega Lumbre, por hoy.</b> Gracias por jugarlo entero: del fogón del clan a las imprentas de Ámsterdam, acabas de recorrer los ${NUM_PALABRA[numEpoca(9)]} primeros hitos de cómo la humanidad aprendió a enseñar. Las épocas que siguen se construyen con este mismo cuidado.`
        : `⏳ <i>Junta ${fmt(BALANCE.investigacionFuturo)} 📖 y deja pasar casi cuatro siglos, hasta hoy: el viaje vuelve al valle donde empezó.</i>`) },
  /* EL FUTURO (era21-plan): la última del viaje (id 21), en el valle del principio. Su cierre no es «Época dominada»: es la
     pregunta abierta, y la Abuela vuelve al fogón. Lo que gana se queda en ella: es la última */
  { era: 21, construida: true, flag: 'ganadoFu', saberes: saberesEpoca(21), alumnosPorHito: 0,
    // LA ESCALERA DEL VALLE: umbrales RELATIVOS a la llegada. PROVISIONALES: los de Santiago, que llegaba en el mismo punto; se miden con la curva del bot (balance-epoca21.md)
    hitos: [5.8e21, 1.8e22, 4.4e22, 1e23, 1.7e23],
    manos: () => {
      /* la consejera habla del gesto cuando hace falta (se juntan tres o más, el tutor no puede crearse, hay inventadas que pesan),
         no por cada uno que llega: si no, nunca llega a decir qué saber sigue (QA: la partida con clics se quedaba girando en el patio) */
      if (dudasEsperan() >= 3) return { t: `${dudasEsperan()} esperan con su pregunta. Toca la escuela y elige cómo los ayuda la IA: que responda o que pregunte, como un tutor.`, g: { x: ESCUELA_FU.x, y: ESCUELA_FU.y, abre: () => abrirPregunta() } };
      if (S.tecs[87].fase !== 'sin' && S.tecs[88].fase === 'sin' && (S.mats.atencion || 0) < MAT_COSTO) return { t: 'El tutor que pregunta pide atención para empezar, y todavía no hay. Se junta en los lugares tranquilos del valle: la orilla de la laguna, la sombra de los árboles grandes, la entrada de la cueva. Recoge sus luces.', g: { x: QUIETOS_FU[0][0], y: QUIETOS_FU[0][1] } };
      if ((S.erroresFu || 0) >= 2 && revisarDisponibleFu()) return { t: `Hay ${S.erroresFu} respuestas inventadas sin revisar, y el valle aprende menos mientras sigan ahí. Toca la escuela y revisa una: mirar la fuente.`, g: { x: ESCUELA_FU.x, y: ESCUELA_FU.y, abre: () => abrirPregunta() } };
      return null;
    },
    pensador: () => S.bloom === 2,
    nudge: '🎯 Los seis saberes están aprendidos… pero el señor de los gráficos sigue esperando en la parada. El valle no cierra esta época sin las dos sigmas de Bloom.',
    voz: () => S.bloom === 2 ? { f: 'Benjamin Bloom', cara: 'bloom' } : { f: 'La IA', cara: 'ia' },
    pensadorTema: 'las dos sigmas de Bloom',
    inv: 0,
    invLista: 'La escuela del valle ya dio todo su saber.',
    invFalta: 'Todo lo aprendido madura solo.',
    idle: 'El valle aprende solo: los que preguntan, los que caminan pensando, la linterna de la biblioteca. Vuelve cuando alguien espere con su pregunta o algo junte polvo.',
    frontera: 'El fuego sigue encendido en el patio y la niebla sigue en los bordes. Quédate el rato que quieras: mira a los que caminan pensando, escucha el patio, sube al mirador a mirar lo que todavía no se ve.',
    titulo: '🔥 La pregunta abierta',
    texto: () =>
      `La escuela del valle, el tutor que pregunta, la traducción al instante, la biblioteca que responde, el examen que cambia y la pregunta abierta: <b>una máquina que responde casi todo, y una escuela que tiene que decidir cuándo dejarla responder y cuándo hacer la pregunta</b>.<br><br>` +
      `${Math.round(S.entendidosFu || 0)} ${Math.round(S.entendidosFu || 0) === 1 ? 'estudiante entendió' : 'estudiantes entendieron'} y ${S.respondidosFu || 0} ${(S.respondidosFu || 0) === 1 ? 'entregó' : 'entregaron'} la tarea; ${!S.inventadasFu ? 'ninguna respuesta vino inventada' : S.inventadasFu === 1 ? 'una respuesta vino inventada' : S.inventadasFu + ' respuestas vinieron inventadas'}. Del fogón hasta aquí, cada época enseñó con lo que tenía. Esta es la primera en que la respuesta no cuesta nada, y no sabemos todavía qué vamos a enseñar ahora.<br><br>` +
      (ULTIMA_EPOCA === 21
        ? `<b>Y hasta aquí llega Lumbre, por hoy.</b> Gracias por jugarlo entero: del fogón del clan a una era de aprendizaje que todavía no conocemos, acabas de recorrer ${NUM_PALABRA[numEpoca(21)]} hitos de cómo la humanidad aprendió a enseñar. Las épocas que faltan en el medio se construyen con este mismo cuidado.`
        : '') },
  { era: 10, construida: true, flag: 'ganadoSa', saberes: saberesEpoca(10),
    // LA ESCALERA DE SANTIAGO: umbrales RELATIVOS a la llegada, sobre la curva real del bot (balance-epoca10.md)
    hitos: [5.8e21, 1.8e22, 4.4e22, 1e23, 1.7e23],   // sobre la curva medida (curvaprod10): minutos 3, 6, 9, 12 y 14
    manos: () => {
      if (normalAbierta() && (S.normalistas || 0) > 0 && (S.mats.pizarra || 0) < 1) return { t: 'Hay un normalista listo, pero no tiene pizarras para llevar. La diligencia de Valparaíso las trae: recoge sus luces en el patio de la estación.', g: { x: DILIGENCIA_SA.x + 0.2, y: DILIGENCIA_SA.y - 0.5 } };
      if (normalAbierta() && (S.normalistas || 0) > 0) return { t: `${S.normalistas === 1 ? 'Un normalista espera' : S.normalistas + ' normalistas esperan'} su pueblo. Toca la Escuela Normal y elige en el mapa adónde va: cerca abre rápido; grande y lejos rinde más.`, g: { x: NORMAL_SA.x, y: NORMAL_SA.y } };
      return null;
    },
    pensador: () => S.sarmiento === 2,
    nudge: '🎒 Los seis saberes están aprendidos… pero el hombre que bajó de la cordillera sigue esperando en el camino de Mendoza. Chile no cierra esta época sin educar al soberano.',
    voz: () => S.sarmiento === 2 ? { f: 'Domingo F. Sarmiento', cara: 'sarmiento' } : { f: 'Andrés Bello', cara: 'bello' },
    pensadorTema: 'el «educar al soberano» de Sarmiento',
    inv: BALANCE.investigacionImperios,
    invLista: 'Las escuelas de Chile ya dieron todo su saber. Deja pasar el siglo hasta 1920: el reloj espera en el dock.',
    invFalta: 'Todo lo aprendido madura solo. Acumulamos saber para dejar pasar el siglo.',
    idle: 'Chile enseña solo: los monitores con sus grupos, los normalistas en los caminos, las escuelas de los pueblos. Vuelve cuando egrese un normalista o algo junte polvo.',
    frontera: 'La cordillera sigue blanca y el Mapocho sigue bajando. Quédate el rato que quieras: mira a los monitores con su vara, a los normalistas que salen con su maleta, a los niños del kindergarten en su ronda.',
    titulo: `🏆 Época ${numEpoca(10)} dominada`,
    texto: () =>
      `Los monitores, la Escuela Normal, el silabario, las preceptoras, la ley de instrucción primaria y el kindergarten: <b>la escuela ya es de todos y está en todas partes: maestros formados para enseñar, una escuela de niños y una de niñas en cada pueblo, gratuita, y un jardín para los más chicos</b>.<br><br>` +
      `En Chile la escuela salió de la capital y llegó a los pueblos, de Copiapó a Chiloé, de la mano de los normalistas. Sarmiento la llamó educar al soberano: si el pueblo manda, el pueblo tiene que saber leer.<br><br>` +
      (ULTIMA_EPOCA === 10
        ? `<b>Y hasta aquí llega Lumbre, por hoy.</b> Gracias por jugarlo entero: del fogón del clan a las escuelas de Chile, acabas de recorrer los ${NUM_PALABRA[numEpoca(10)]} primeros hitos de cómo la humanidad aprendió a enseñar. Las épocas que siguen se construyen con este mismo cuidado.`
        : `⏳ <i>Junta ${fmt(BALANCE.investigacionImperios)} 📖 y deja pasar el siglo hasta 1920.</i>`) },
  { era: 11, desde: true, flag: 'ganado', saberes: saberesEpoca(11),
    pensador: () => S.dewey === 2,
    nudge: '🎩 Los aparatos rinden… pero el profesor <b>Dewey</b> sigue esperando en la puerta. La educación no cierra esta época sin escuchar su idea.',
    voz: () => ({ f: 'La Sra. Rosa', cara: 'rosa' }), // los pensadores visitan; el aula es de ella
    pensadorTema: 'la idea de Dewey',
    inv: BALANCE.investigacionEra2,
    invLista: 'Los aparatos ya dieron todo su saber. La radio chisporrotea a lo lejos: el reloj espera en el dock.',
    invFalta: 'Todo lo aprendido madura solo. Acumulamos saber para alcanzar las ondas de 1935.',
    idle: 'El aula marcha sola y el patio suena. Vuelve cuando algo pida atención.',
    titulo: `🏆 Época ${numEpoca(11)} dominada`,
    texto: () =>
      `Los cuatro aparatos rinden en meseta, con <b>${S.alumnos} alumnos</b> y <b>${S.docentes} docentes</b>, en ${Math.floor(S.tiempoJuego / 60)} minutos de clases.<br><br>` +
      `Ningún aparato reemplazó a la Sra. Rosa: <b>la amplificaron, una formación a la vez</b>.<br><br>` +
      `📻 <i>Se escucha estática a lo lejos… Cuando juntes ${fmt(BALANCE.investigacionEra2)} 📖, investiga la <b>Época ${numEpoca(12)}</b>.</i>` },
  { era: 12, flag: 'ganado2', saberes: saberesEpoca(12),
    voz: () => ({ f: 'La Sra. Rosa', cara: 'rosa' }),
    inv: BALANCE.investigacionEra3,
    invLista: 'Las ondas ya dieron todo su saber. Algo se enciende a lo lejos: el reloj espera en el dock.',
    invFalta: 'Todo lo aprendido madura solo. Acumulamos saber para encender la caja mágica.',
    idle: 'El aula marcha sola entre ondas y proyectores. Vuelve cuando algo pida atención.',
    titulo: `🏆 Época ${numEpoca(12)} dominada`,
    texto: () =>
      `Radio, filminas y cine rinden en meseta, con <b>${S.alumnos} alumnos</b> y <b>${S.docentes} docentes</b>, en ${Math.floor(S.tiempoJuego / 60)} minutos de clases.<br><br>` +
      `Edison prometió en 1913 que el cine volvería obsoletos los libros. Enseñó muchísimo. Y los libros siguen aquí: ` +
      `<b>cada aparato amplificó a la educación que ya sabía enseñar</b>.<br><br>` +
      `📺 <i>Se enciende algo a lo lejos… Cuando juntes ${fmt(BALANCE.investigacionEra3)} 📖, investiga la <b>Época ${numEpoca(13)}</b>: la caja mágica.</i>` },
  { era: 13, flag: 'ganado3', saberes: saberesEpoca(13),
    voz: () => ({ f: 'La Sra. Rosa', cara: 'rosa' }),
    invLista: 'No hay época más allá de la caja mágica, todavía. Pero sí una siguiente generación: volver al fogón sabiendo lo que ahora saben. El chip 🧬 espera.',
    idle: 'El aula marcha sola, la tele encendida y el patio en recreo. Vuelve cuando algo pida atención.',
    titulo: `🏆 Época ${numEpoca(13)} dominada`,
    texto: () =>
      `La caja mágica rinde en meseta, con <b>${S.alumnos} alumnos</b> y <b>${S.docentes} docentes</b>, en ${Math.floor(S.tiempoJuego / 60)} minutos de clases.<br><br>` +
      `La TV prometía profesores infinitos; la máquina de Skinner, un tutor por niño. Y enseñaron, <b>donde había un aula formada esperándolos</b>.<br><br>` +
      `💾 <i>Fin del contenido de esta versión. La Era 4 (la tortuga de Logo) viene en camino.</i><br><br>` +
      `🧬 <i>O funda la <b>siguiente generación</b> desde el dock: volver al fogón, sabiendo lo que ahora saben.</i>` }
];
const arcoDe = era => ARCO_EPOCAS.find(a => a.era === era);
const EPOCAS_CONSTRUIDAS = new Set(ARCO_EPOCAS.filter(a => a.construida).map(a => a.era));
let warpAntesHistoria = 0; // el ritmo que había antes de la noche de historia: se devuelve al terminarla
function volverAlRitmo() {
  const w0 = warpAntesHistoria; warpAntesHistoria = 0;
  const b = w0 > 1 && document.querySelector(`#dev button[data-warp="${w0}"]`); if (b && warp === 1) b.click();
}
function epocaConstruida(era) { return EPOCAS_CONSTRUIDAS.has(era); } // la luz, el año, el clima y la noche preguntan AQUÍ (2026-08-24, c08: Sumer se publicó sin noche porque cada uno tenía su lista blanca a mano). Época nueva = `construida: true` en su entrada del arco, y TODO el ambiente despierta junto.
function entrarEpoca(n) { // TODO cruce de época pasa por aquí: estampa la base de la escalera por época (c07). OJO: el bot del laboratorio cruza asignando S.era a mano; si una época con `hitos` propios se mide así, el arnés debe estampar eraAprBase igual que esto.
  // ROMA NO SE ARRASTRA (docs/balance-epoca14.md): el renombre que ganan sus oradores y sus hitos se queda en Roma. Bagdad
  // es tan sensible al renombre (sus rentas lo multiplican: +3 ⭐ le quitaban 1,2 min) que cada estrella de Roma aceleraba
  // las cuatro épocas que siguen; se vuelve al renombre con que se llegó a Roma. Sus saberes, igual: `bonoVive`.
  if (n === 14 && S.era !== 14) S.repAntesRo = S.rep;
  S.famaRoma = 0;
  if (S.era === 14 && n !== 14 && S.repAntesRo != null && S.rep > S.repAntesRo) { S.famaRoma = S.rep - S.repAntesRo; S.rep = S.repAntesRo; }
  // LA FAMA DE PARÍS NO CRUZA EL OCÉANO (el orden de la cronología, docs/balance-epoca7.md): Tenochtitlan va después de París y
  // sus rentas multiplican el renombre (el tequio, el tributo); el que gana la universidad se guarda mientras dure Tenochtitlan
  // y vuelve en Ámsterdam, que se calibró con él. Así Tenochtitlan llega con el renombre de Bagdad, como cuando la seguía.
  // CHINA, IGUAL (era15-plan): París se calibró llegando desde Bagdad; el renombre que ganan las escuelas de Kaifeng se queda
  // en Kaifeng, y París llega con el de Bagdad
  if (n === 15 && S.era !== 15) S.repAntesCh = S.rep;
  S.famaChina = 0;
  if (S.era === 15 && n !== 15 && S.repAntesCh != null && S.rep > S.repAntesCh) { S.famaChina = S.rep - S.repAntesCh; S.rep = S.repAntesCh; }
  if (n === 8 && S.era !== 8) S.repAntesPa = S.rep;
  if (S.era === 8 && n === 7 && S.repAntesPa != null && S.rep > S.repAntesPa) { S.famaParis = S.rep - S.repAntesPa; S.rep = S.repAntesPa; }
  S.famaVuelve = 0;
  if (S.era === 7 && n !== 7 && S.famaParis) { S.famaVuelve = S.famaParis; S.rep += S.famaParis; S.famaParis = 0; }
  S.era = n; S.eraAprBase = S.aprTotal; S.hitosEra = 0;
  if (n !== 4 && S.sofista) S.sofista = 0;   // el sofista se queda en Atenas: contratado allí, seguía como maestro gratis y padres que pagan más en las épocas siguientes, sin cobrar ni verse (QA entero, 2026-10-03)
  const tope = BALANCE.topeLlegada && BALANCE.topeLlegada[n];   // lo que cruza de una época a otra (D2)
  if (tope && S.pre > tope) { const perdido = S.pre - tope; S.pre = tope; return perdido; }
  return 0;
}

function tick(dt, silencioso = false) {
  if (S.era === 1 && S.apr > memoriaTope()) S.apr = memoriaTope(); // lo que no cabe en la memoria se olvida (C3)
  S.tiempoJuego += dt;
  if (S.fuegoCd > 0) {
    S.fuegoCd = Math.max(0, S.fuegoCd - dt);
    if (S.fuegoCd <= 0 && lenaEnCola) { lenaEnCola = false; if (!silencioso) alimentarFuego(); } // el toque que esperaba
  }
  const cdAntes = S.cazaCd || 0;
  if (S.cazaCd > 0) S.cazaCd = Math.max(0, S.cazaCd - dt);
  if (S.mamutHuidaT > 0) S.mamutHuidaT = Math.max(0, S.mamutHuidaT - dt);
  if (S.criaSaleT > 0) S.criaSaleT = Math.max(0, S.criaSaleT - dt);
  if (!silencioso && cdAntes > MAMUT_SACUDE && S.cazaCd <= MAMUT_SACUDE && S.cazaCd > 0) sfx.barrito(); // llegó de vuelta: se sacude, desafiante
  if (S.criaViene && cdAntes > 0 && S.cazaCd <= 0) { S.criaViene = false; S.criaSaleT = CRIA_SALE; }    // la cría se despide rumbo a casa
  if (!silencioso && S.cazaOn) { // la cacería corre en tiempo real; la pared pintada ayuda a leer el rastro
    S.cazaProg = Math.min(1, S.cazaProg + (CAZA_PASIVA + cazaNivel() * 0.005 + rastroPinturas()) * dt);
    S.cazaT -= dt;
    if (S.cazaProg >= 1) cerrarCaza(true);
    else if (S.cazaT <= 0) cerrarCaza(false);
  }
  if (S.era === 1 && S.fuegoDescubierto) { // el pulso del día y la noche
    const esNoche = luzDia() < 0.5;
    if (esNoche !== S.esNoche) {
      S.esNoche = esNoche;
      // el rebaño entra al cerco y se cuenta cabeza por cabeza: "cuidar y contar se vuelven el mismo oficio"
      if (esNoche && S.tecs[25] && S.tecs[25].fase === 'meseta') pedirCuenta(1);
      if (!silencioso) {
        (esNoche ? sfx.noche : sfx.amanecer)(); // el paso del día suena, cada ciclo, suave
        // la noche de una historia se vive a su paso (C2): si corres a ×5, el tiempo vuelve a ×1 para escucharla
        if (esNoche && warp > 1 && abuelaCapPend() && !((S.abuelaCd || 0) > 0)) {
          warpAntesHistoria = warp;
          const b1 = document.querySelector('#dev button[data-warp="1"]'); if (b1) b1.click();
          toast('🌙 <b>Esta noche hay historia.</b> La Abuela espera junto al fuego: el tiempo vuelve a su paso para escucharla.', 9000);
        }
        if (!esNoche && warpAntesHistoria) volverAlRitmo(); // amaneció: si no se escuchó, el tiempo vuelve a correr igual
        if (esNoche && !S.vioNoche) { S.vioNoche = true; toast('🌙 <b>Cae la noche.</b> El clan se reúne junto al fuego: en la velada, las historias enseñan más… mientras la fogata siga viva. Mantenla encendida.', 11000); }
        else if (!esNoche && !S.vioDia && S.vioNoche) { S.vioDia = true; toast('🌅 <b>Amanece.</b> El clan se despereza y vuelve a forrajear por la estepa.', 8000); }
      }
    }
  }
  if (S.era === 1 && S.fuegoDescubierto) {
    // LA BRASA VIVE EN TIEMPO DE PARED, con el warp topado a ×2 (el mismo principio del tope ×6 de
    // fuegoVis): a ×20 sin tope se comía un leño cada ~3 s reales y alimentar el fuego era un trabajo
    // de tiempo completo, con la consejera clavada en «tiene hambre» (medido en el QA del 2026-08-01).
    // El warp es una lupa para cruzar esperas, no un castigo. A ×1 y en la puesta al día (warp 1)
    // nada cambia, así que el balance medido del lab sigue valiendo.
    S.fuego = Math.max(35, S.fuego - dt * 0.45 * Math.min(1, 2 / Math.max(1, warp)) * (S.edad >= 2 ? 0.5 : 1)); // la brasa baja: hay que alimentarla. En la aldea, a la mitad: el clan se quedó y siempre hay quien la cuide (B2 del QA completo)
    S.forrajeoT += dt;
    if (S.forrajeoT >= 6) { // el clan trae materiales de fondo, pero solo de lo que hace falta (el grano se cosecha)
      S.forrajeoT -= 6;
      const ks = MATERIALES.filter(m => matDeEra(m, S.era)).map(m => m.k).filter(k => k !== 'grano' && !matSobra(k)); // solo lo de esta época (lista de cotejo C4: un tercio se iba a barro, papiro y cera, que aquí ni se ven)
      if (ks.length) S.mats[ks[Math.floor(Math.random() * ks.length)]] += 1;
    }
  }
  if (S.era === 2) { // LOS RELOJES DE LA EDUBBA: las copias se juntan en la mesa, el dictado produce escribas
    if (S.tecs[19] && S.tecs[19].fase === 'meseta') { // la mesa de copia llega con el currículo: los ejercicios de Nippur SON copias de listas (la edubba después la techa)
      S.copiaT = (S.copiaT || 0) + dt;
      const perCopia = 26 / (1 + tablillaCanasto()); // el canasto del taller (tablilla dominada) amasa barro cada mañana: los ejercicios llegan más seguido (2026-08-23, c23)
      while (S.copiaT >= perCopia) { S.copiaT -= perCopia; if ((S.copiasPend || 0) < 4) S.copiasPend = (S.copiasPend || 0) + 1; }
    }
    S.azolveT = (S.azolveT || 0) + dt; // LA CORVEA: el limo va tapando los canales, sin prisa y sin castigo
    if (S.azolveT >= 40) {
      S.azolveT -= 40;
      const A2 = S.azolves = S.azolves || [];
      if (A2.length < 3) { const libres = [0, 1, 2, 3, 4].filter(i => !A2.includes(i)); if (libres.length) A2.push(libres[(Math.random() * libres.length) | 0]); }
    }
    if (S.tecs[18] && S.tecs[18].fase === 'meseta' && !S.ganadoSum) { // la administración no espera al trimestre: la ciudad deja cuentas cada día (grano que entra, rebaño que sale). CON LA ÉPOCA GANADA, DESCANSA: la ciudad está servida y los recursos dejan de crecer sin sentido (2026-08-04, del ojo del jugador)
      S.fichaT = (S.fichaT || 0) + dt;
      while (S.fichaT >= 13) { S.fichaT -= 13; if ((S.fichasPend || 0) < 8) S.fichasPend = (S.fichasPend || 0) + 1; }
    }
    if (S.tecs[29] && S.tecs[29].fase === 'meseta') { // cada tablilla del dictado rinde: la ciudad paga escribas
      S.dictT = (S.dictT || 0) + dt;
      while (S.dictT >= 10) {
        S.dictT -= 10;
        if ((S.mats.barro || 0) > 0) S.mats.barro--; // cada tanda de tablillas dictadas gasta barro fresco (consumible, como manda el plan); sin barro se raspa y se reusa: no bloquea
        const trae = Math.round((15 + 6 * S.rep) * dictTotal() * manoBono() * (S.ganadoSum ? 0.3 : 1)); // la mano de la casa rinde aquí también; ganada la época, mantenimiento
        S.pre += trae;
        if (!silencioso) fx.pops.push({ x: 9.9, y: 8.0, txt: `+${fmt(trae)} ${monIco()}`, born: performance.now() });
      }
    }
  }
  if (S.era === 3) { // LOS RELOJES DE LA CASA DE LA VIDA (era3-plan): el patio deja ejercicios; la crecida, lindes
    if (S.tecs[31] && S.tecs[31].fase === 'meseta') {
      S.ejerT = (S.ejerT || 0) + dt;
      const perEjer = 40 / (1 + kemytApuro()); // ejercicios RALOS a propósito (Egipto es marea, no flujo); la Kemyt dominada los apura
      while (S.ejerT >= perEjer) { S.ejerT -= perEjer; if ((S.ejerPend || 0) < 4) S.ejerPend = (S.ejerPend || 0) + 1; }
    }
    /* EL ARCHIVO RINDE desde el primer papiro (2026-09-06). Antes rentaba solo con la Casa de la Vida
       dominada, que es el ÚLTIMO saber de la época: o sea, «lo escrito trabaja» solo trabajaba en el
       postjuego, y a mitad de época el jugador atravesaba muros de 6-8 min esperando la Kemyt y la
       Casa con la única paga de cada pase. Ahora cada rollo del archivo deja renta desde que existe
       el archivo (el papiro dominado), a la mitad; la Casa de la Vida, cuando llega, la duplica:
       el gesto protagonista paga dos veces (el evento del pase y la renta de lo escrito). */
    const casaLista = S.tecs[32] && S.tecs[32].fase === 'meseta';
    if ((S.papiros || 0) > 0 && S.tecs[20] && S.tecs[20].fase === 'meseta') {
      S.archivoT = (S.archivoT || 0) + dt;
      while (S.archivoT >= 12) {
        S.archivoT -= 12;
        const renta = Math.round(Math.min(16, S.papiros) * (3 + 0.6 * S.rep) * (casaLista ? 1 : 0.5) * (S.ganadoEg ? 0.3 : 1)); // ganada la época, mantenimiento (el patrón del postjuego)
        S.pre += renta;
        if (!silencioso) fx.pops.push(casaLista ? { x: 7.3, y: 7.6, txt: `+${fmt(renta)} ${monIco()}`, born: performance.now() } : { x: MESA_PAPIRO.x + 0.9, y: MESA_PAPIRO.y - 0.2, txt: `+${fmt(renta)} ${monIco()}`, born: performance.now() }); // la renta sale de donde están los rollos: la mesa, y luego la Casa
      }
    }
    const ei = estacion().i; // el cruce de ajet a péret: el agua se retira y los lindes borrados laten
    if (S.lindeEst !== ei) {
      if (S.lindeEst === 0 && ei === 1 && S.tecs[23] && S.tecs[23].fase === 'meseta' && !S.ganadoEg)
        S.lindes = [0, 1, 2, 3]; // los cuatro lindes de la vega piden la cuerda (sin castigo: solo esperan)
      S.lindeEst = ei;
    }
  }
  if (S.era === 4) { // LOS RELOJES DEL ÁGORA (era4-plan): la plaza deja dudas; las aporías se resuelven; el sofista pasa la bolsa
    if (S.tecs[37] && S.tecs[37].fase === 'meseta') {
      S.dudaT = (S.dudaT || 0) + dt;
      const perDuda = 40 / (1 + 0.1 * nivelTec(33));                                              // ralas a propósito, como los ejercicios de Egipto; la tablilla perfeccionada las apura
      while (S.dudaT >= perDuda) { S.dudaT -= perDuda; if ((S.dudaPend || 0) < 4) S.dudaPend = (S.dudaPend || 0) + 1; }
    }
    if ((S.aporias || []).length) {
      const listas = S.aporias.filter(a => S.tiempoJuego - a.t0 >= APORIA_DUR);
      if (listas.length) { S.aporias = S.aporias.filter(a => S.tiempoJuego - a.t0 < APORIA_DUR); for (const a of listas) resolverAporia(a, silencioso); }
    }
    /* EL REPERTORIO RENTA (el molde del archivo egipcio): cada respuesta producida trae, con el tiempo, padres
       que pagan por un maestro que hace pensar (Isócrates cobraba 1000 dracmas por curso completo). A la
       mitad hasta que la Academia le pone nombre y puerta; ganada la época, mantenimiento. */
    if ((S.respuestas || 0) > 0 && S.tecs[37] && S.tecs[37].fase === 'meseta') {
      S.repertT = (S.repertT || 0) + dt;
      while (S.repertT >= 12) {
        S.repertT -= 12;
        const academiaLista = S.tecs[38] && S.tecs[38].fase === 'meseta';
        const renta = Math.round(Math.min(16, S.respuestas) * (3 + 0.6 * S.rep) * (academiaLista ? 1 : 0.5) * sofistaPaga() * (S.ganadoAg ? 0.3 : 1));
        S.pre += renta;
        if (!silencioso) fx.pops.push(academiaLista ? { x: OLIVAR.x + OLIVAR.w / 2, y: OLIVAR.y + OLIVAR.d + 0.2, txt: `+${fmt(renta)} ${monIco()}`, born: performance.now() } : { x: STOA.x + STOA.w * 0.5, y: STOA.y + STOA.d + 0.35, txt: `+${fmt(renta)} ${monIco()}`, born: performance.now() });
      }
    }
    if (S.sofista) { // cada estación, la bolsa: si no alcanza, el sofista se va a otra ciudad (sin deuda: cozy)
      const ei = estacion().i;
      if (S.sofistaEst !== ei) {
        S.sofistaEst = ei;
        const c = sofistaCobro();
        if (S.pre >= c) { S.pre -= c; if (!silencioso) { debito('r-pre', `−${fmt(c)} ${monIco()}`); sfx.bolsa(); fx.pops.push({ x: TARIMA_SOFISTA.x, y: TARIMA_SOFISTA.y - 0.5, txt: `el sofista cobra −${fmt(c)} ${monIco()}`, born: performance.now() }); } }
        else { S.sofista = 0; if (!silencioso) toast('💰 <b>El sofista se fue a Corinto.</b> No alcanzó para su bolsa esta estación y no enseña fiado. Cuando quieras, vuelve a su tarima: siempre hay otro.', 11000); }
      }
    }
    if (liraAnimo() > 0 && !hayValle()) S.animo = Math.min(animoMax(), S.animo + BALANCE.animo.regen * 0.5 * dt); // la lira regenera el ánimo más rápido
  }
  if (S.era === 5) { // LOS RELOJES DE ALEJANDRÍA (era5-plan): los barcos amarran con libros; lo perdido vuelve; el fondo renta
    if (rollosAbierto()) {
      if (S.barco) { if (S.tiempoJuego - S.barco.t0 >= BARCO_AMARRA) S.barco = null; }        // zarpa
      else if (!marCerrado()) {                                                                     // en invierno no navega nadie
        S.barcoT = (S.barcoT || 0) + dt;
        const cada = BARCO_CADA * (1 + 0.25 * Math.max(0, Math.min(10, S.desconfianza || 0) - 3)) / (1 + 0.12 * nivelTec(40)); // unos pocos originales guardados no se notan; muchos, sí: la desconfianza espacia los barcos; el muelle perfeccionado los atrae
        if (S.barcoT >= cada) { S.barcoT = 0; amarrarBarco(silencioso); }
      }
      if (S.originales === 'devolver' && (S.desconfianza || 0) > 0) S.desconfianza = Math.max(0, S.desconfianza - dt / 60); // devolviendo, la confianza vuelve (un punto por minuto)
    }
    if ((S.perdidos || []).length) { // lo perdido aparece: alguien lo encuentra y lo devuelve al muelle
      const listos = S.perdidos.filter(p2 => S.tiempoJuego - p2.t0 >= perdidoDur());
      for (const p2 of listos) if (rollosPend() < ROLLOS_TOPE) { S.perdidos = S.perdidos.filter(q => q !== p2); S.muelle.push({ a: p2.a, o: p2.o }); }
    }
    /* EL FONDO RENTA (el molde del archivo egipcio y del repertorio de Atenas): los libreros copian lo que se
       encuentra en el catálogo y lo venden. A la mitad hasta que el Museo tiene a sus sabios; en invierno, con el
       mar cerrado, la Biblioteca se llena de lectores y rinde la mitad más; con el códice, lo que se busca se
       encuentra; ganada la época, mantenimiento. */
    if ((S.fondo || 0) > 0) {
      S.fondoT = (S.fondoT || 0) + dt;
      while (S.fondoT >= 12) {
        S.fondoT -= 12;
        const museoListo = S.tecs[39] && S.tecs[39].fase === 'meseta';
        const renta = Math.round(Math.min(24, S.fondoValor || 0) * (3 + 0.6 * S.rep) * (museoListo ? 1 : 0.5) * (marCerrado() ? 1.5 : 1) * (codiceListo() ? 1.3 : 1) * (S.ganadoAl ? 0.3 : 1));
        S.pre += renta;
        if (!silencioso) fx.pops.push({ x: BIBLIOTECA_AL.x + 0.4, y: BIBLIOTECA_AL.y - 0.3, txt: `+${fmt(renta)} ${monIco()}`, born: performance.now() });
      }
    }
  }
  if (S.era === 21) { // LOS RELOJES DEL VALLE (era21-plan): llegan con su problema, esperan, piensan; la defensa cada tanto
    avanzarDudasFu(dt, silencioso);
    if (tutorFu() && !S.vioAtencion && !silencioso) { S.vioAtencion = true; toast('🎯 <b>La atención.</b> Lo que escasea cuando todo lo demás sobra. Preguntar como un tutor la pide: el que piensa tiene que estar ahí. Se junta en los lugares tranquilos del valle, lejos de las pantallas: la orilla de la laguna, la sombra de los árboles grandes, la entrada de la cueva.', 14000); }
  }
  if (S.era === 15) { // LOS RELOJES DE KAIFENG (era15-plan): el gesto (preparar a los candidatos, el examen cada tanto, los que reprueban enseñan)
    avanzarCandidatosCh(dt, silencioso);
    if (S.tecs[81] && S.tecs[81].fase !== 'sin' && !S.vioTinta && !silencioso) { S.vioTinta = true; toast('🖌️ <b>La tinta.</b> Con la escuela de la prefectura, cada estudiante muele su barra de tinta en la piedra: hollín de pino amasado con cola. Sale del horno, junto a los pinos al pie de la muralla. La imprenta de los clásicos va a pedirla.', 12000); }
  }
  if (S.era === 14) { // LOS RELOJES DE ROMA (era14-plan): el pedagogo que trae niños, el avance en las tres escuelas, los idus y el año
    avanzarEscuelasRo(dt, silencioso);
    if (rhetorAbierto() && !S.vioRhetor && !silencioso) { S.vioRhetor = true; toast('🗣️ <b>La escuela del rétor.</b> La tercera escuela: los muchachos declaman suasorias y controversias, y el que termina ya es orador. Pásalo a tiempo y defenderá su primer caso en la basílica Julia: renombre, y lo que pagan sus clientes.', 14000); }
  }
  if (S.era === 10) { // LOS RELOJES DE SANTIAGO (era10-plan): los normalistas que egresan, los viajes, las escuelas de los pueblos
    avanzarNormal(dt, silencioso);
    if (lancasterAbierta() && !S.vioMonitor && !silencioso) { S.vioMonitor = true; toast('🧑‍🏫 <b>Los monitores.</b> Un solo maestro para cien niños: el maestro enseña temprano a los más adelantados, y cada uno de ellos enseña a su grupo de diez, de pie frente a su semicírculo. Cada monitor atiende a diez que aprendían a medias. Barato y masivo; y se aprende de memoria, sin entender mucho.', 15000); }
    if (leyLista() && !S.vioLey && !silencioso) { S.vioLey = true; toast('📜 <b>La ley de 1860.</b> La escuela primaria es gratuita y la paga el Estado: las escuelas de los pueblos pagan la mitad más y sus niños aprenden más rápido. Todavía no es obligatoria: eso llega en 1920.', 14000); }
    if (kinderListo() && !S.vioKinder && !silencioso) { S.vioKinder = true; toast('🧸 <b>El kindergarten.</b> La escuela de los más chicos, donde se aprende jugando: con los dones, la ronda y el jardín. La infancia como una edad propia. Se aprende con más ánimo, y los lectores rinden más.', 14000); }
  }
  if (S.era === 9) { // LOS RELOJES DE ÁMSTERDAM (era9-plan): la prensa (componer, tirar, la demanda que vuelve) y los avisos del aula
    avanzarPrensa(dt, silencioso);
    if (didacticaLista() && !S.vioClase && !silencioso) { S.vioClase = true; toast('🏫 <b>La clase.</b> Todos los niños en bancos, mirando al mismo maestro y leyendo el mismo libro, a la misma hora: el aula de Comenio atiende a ocho que aprendían a medias. Las cartillas, en clase, hacen la mitad más de lectores.', 14000); }
    if (orbisListo() && !S.vioOrbis && !silencioso) { S.vioOrbis = true; toast('🖼️ <b>El Orbis Pictus.</b> El mundo en imágenes: ahora se puede imprimir el primer libro ilustrado para niños. Hace el doble de lectores que una cartilla, y los lectores rinden más.', 14000); }
  }
  if (S.era === 8) { // LOS RELOJES DE PARÍS (era8-plan): el horario, las cuestiones, la licencia y lo que pagan los estacionarios
    avanzarHorario(dt, silencioso);
    if (disputaAbierta()) { S.cuestionT = (S.cuestionT || 0) + dt * (estacion().i === 2 ? 2 : 1); if (S.cuestionT >= CUESTION_CADA) {   // en otoño empieza el curso (San Remigio): llegan el doble de cuestiones
 S.cuestionT = 0; llegaCuestion(silencioso); } }
    if (universidadAbierta() && !S.licenciaPend) {
      S.licenciaT = (S.licenciaT || 0) + dt;
      if (S.licenciaT >= LICENCIA_CADA * ((S.licenciados || 0) >= LICENCIADOS_TOPE ? 1.6 : 1) * (1 - 0.1 * nivelTec(61))) { S.licenciaPend = true; if (!silencioso) fx.pops.push({ x: UNIVERSIDAD_PA.x, y: UNIVERSIDAD_PA.y - 0.6, txt: '🎓 un bachiller espera su licencia', born: performance.now() }); }
    }
    if (sorbonaLista() && !S.sorbonaAlumnos) { S.sorbonaAlumnos = 8; S.alumnos += 8; if (!silencioso && !S.vioSorbona) { S.vioSorbona = true; toast('🏛️ <b>El colegio de la Sorbona.</b> Llegan ocho estudiantes pobres que ahora tienen techo, comida y una biblioteca: los libros encadenados a los atriles se leen ahí, y se quedan. Los libros copiados rinden más.', 14000); } }
    /* LOS ESTACIONARIOS: alquilan los libros copiados por cuadernos (la pecia) a los estudiantes que los copian para sí, y
       venden lo que sobra: renta de 🏺, como los libreros de Bagdad. Con la Sorbona, un 30 % más. */
    if ((S.libros || 0) > 0) {
      S.bibT = (S.bibT || 0) + dt;
      while (S.bibT >= 12) {
        S.bibT -= 12;
        const renta = Math.round(Math.min(30, S.libros) * (2 + 0.3 * S.rep) * (sorbonaLista() ? 1.3 : 1) * (S.ganadoPa ? 0.3 : 1));
        S.pre += renta;
        if (!silencioso) fx.pops.push({ x: FOUARRE_PA.x, y: FOUARRE_PA.y - 0.4, txt: `+${fmt(renta)} ${monIco()}`, born: performance.now() });
      }
    }
  }
  if (S.era === 7) { // LOS RELOJES DE TENOCHTITLAN (era7-plan): los que nacen, las escuelas, el tequio y la palabra de cada estación
    if (telpoAbierto() && !S.vioTodos) { S.vioTodos = true; if (!silencioso) toast('🛖 <b>Nadie se queda sin escuela.</b> Con el telpochcalli, cada barrio tiene su casa de los jóvenes, y la escuela es obligatoria: los que aprendían a medias ya tienen su lugar. En Europa, una escuela para todos los niños se intentaría recién siglos después.', 15000); }
    if (telpoAbierto() && nacidosPend() < NACIDOS_TOPE) {
      S.nacT = (S.nacT || 0) + dt;
      if (S.nacT >= NACE_CADA / (1 + 0.1 * nivelTec(52))) { S.nacT = 0; nace(silencioso); }   // con el telpochcalli perfeccionado, los barrios crecen
    }
    if ((S.telpo || []).length || (S.calme || []).length) avanzarEscuelas(dt, silencioso);
    if (palabraAbierta()) { const est = Math.floor(estacionCruda()); if (S.palabraEst !== est) { S.palabraEst = est; S.palabraPend = true; } }   // una palabra por estación
    /* EL TEQUIO: los que salieron del telpochcalli trabajan para el barrio (limpian los canales, levantan chinampas): renta
       de 🏺, como los libreros de Bagdad. 8 trabajadores, y 3 más por cada etapa del telpochcalli: el barrio tiene las chinampas
       que tiene, y el resto de los niños rinde más en el calmécac. */
    if ((S.egresTelpo || 0) > 0) {
      S.tequioT = (S.tequioT || 0) + dt;
      while (S.tequioT >= 12) {
        S.tequioT -= 12;
        const renta = Math.round(Math.min(tequioTope(), S.egresTelpo) * (5 + 1.0 * S.rep) * (S.ganadoTe ? 0.3 : 1));
        S.pre += renta;
        if (!silencioso) fx.pops.push({ x: CHINAMPAS_TE.x1 - 0.8, y: CHINAMPAS_TE.y0 + 0.4, txt: `🌽 tequio · +${fmt(renta)} ${monIco()}`, born: performance.now() });
      }
    }
  }
  if (S.era === 6) { // LOS RELOJES DE BAGDAD (era6-plan): las caravanas, la mesa, la ijaza, las herencias y la renta de los libreros
    if (caravanasAbierto()) {
      if (S.caravana && S.tiempoJuego - S.caravana.t0 >= CARAVANA_PARADA) S.caravana = null;        // la caravana se va
      if (!caravanasParadas()) {                                                                  // en verano no viaja nadie
        S.caravanaT = (S.caravanaT || 0) + dt;
        if (S.caravanaT >= caravanaCada()) { S.caravanaT = 0; llegaCaravana(silencioso); }
      }
    }
    if ((S.mesa || []).length || (S.revisiones || []).length) avanzarMesa(dt, silencioso);
    if (halqaAbierta() && !S.ijazaPend) {                                                          // un estudiante termina su libro
      S.ijazaT = (S.ijazaT || 0) + dt;
      if (S.ijazaT >= IJAZA_CADA * ((S.muidin || 0) >= MUIDIN_TOPE ? 1.6 : 1) * (1 - 0.1 * nivelTec(48))) { S.ijazaPend = true; if (!silencioso) fx.pops.push({ x: HALQA_BA.x, y: HALQA_BA.y - 0.6, txt: '🕌 un estudiante terminó su libro', born: performance.now() }); }
    }
    if (algebraLista()) { const est = Math.floor(estacionCruda()); if (S.herenciaEst !== est) { S.herenciaEst = est; S.herenciaPend = true; } }   // una herencia por estación
    if ((S.halqaAlumnos || 0) < halqaVienen()) {                                                   // LA HALQA ATRAE: llegan estudiantes de todo el califato
      const n = halqaVienen() - (S.halqaAlumnos || 0); S.halqaAlumnos = halqaVienen(); S.alumnos += n;
      if (!silencioso) { fx.pops.push({ x: HALQA_BA.x, y: HALQA_BA.y - 0.7, txt: `🕌 ${n} estudiantes llegan a la halqa`, born: performance.now() });
        if (!S.vioVienen) { S.vioVienen = true; toast(`🕌 <b>La halqa se llena.</b> Corre la voz de que en la mezquita de Bagdad se enseña, y llegan estudiantes de Jorasán, de Kufa, de Egipto: <b>${n} más</b>, más de los que tus maestros alcanzan. Los que no caben aprenden a medias, hasta que haya quien les repase la lección.`, 14000); } }
    }
    /* LA BIBLIOTECA RENTA (el molde del fondo de Alejandría): los libreros del zoco copian lo traducido y lo venden. A la
       mitad hasta que la Casa de la Sabiduría tiene sus cofres; con la madrasa y su waqf, un 30 % más; ganada la época,
       mantenimiento. */
    if ((S.traducidas || 0) > 0) {
      S.bibT = (S.bibT || 0) + dt;
      while (S.bibT >= 12) {
        S.bibT -= 12;
        const casaLista = S.tecs[46] && S.tecs[46].fase === 'meseta';
        const renta = Math.round(Math.min(45, S.bibValor || 0) * (3.2 + 0.63 * S.rep) * (casaLista ? 1 : 0.5) * (madrasaLista() ? 1.3 : 1) * (S.ganadoBa ? 0.3 : 1));   // hasta 45 de valor (unas veinte obras por el sentido): lo que se traduce bien se vende toda la época
        S.pre += renta;
        if (!silencioso) fx.pops.push({ x: ZOCO_BA.x, y: ZOCO_BA.y - 0.4, txt: `+${fmt(renta)} ${monIco()}`, born: performance.now() });
      }
    }
  }
  if (diadas() > 0) { // LO QUE TRAEN DE LA ORILLA: el pequeño que pesca no está practicando, está produciendo
    S.pescaT = (S.pescaT || 0) + dt;
    while (S.pescaT >= 20) {
      S.pescaT -= 20;
      const trae = (4 + S.rep) * diadas();
      S.pre += trae;
      pedirCuenta(1); // y lo pescado se cuenta: el hueso de Ishango apareció entre pescadores, a orillas del lago Eduardo
      if (!silencioso) { const d = DIADAS[Math.min(diadas() - 1, DIADAS.length - 1)]; fx.pops.push({ x: d.x, y: d.y - 0.4, txt: `+${fmt(trae)} ${monIco()}`, born: performance.now() }); }
    }
  }
  if (cultivoActivo() && S.cultivo < 1) { // la cebada crece con el sol; de noche apenas espera
    // B6 del QA completo: la mies sigue al año. En el Creciente Fértil la cebada es de invierno: se siembra en otoño y se
    // cosecha a fines de la primavera; crece más en primavera y menos en verano e invierno (el promedio del año es 1, el balance no cambia)
    const mies = S.era === 1 && S.fuegoDescubierto ? [1.4, 0.8, 1.0, 0.8][estacion().i] || 1 : 1;
    S.cultivo = Math.min(1, S.cultivo + dt / 70 * (0.3 + 0.7 * luzDia()) * mies);
    if (S.cultivo >= 1 && !silencioso && !S.cosechas) toast('🌾 <b>El campo está dorado.</b> Toca la parcela para cosechar: el grano es de quien lo espera.', 11000);
  }
  if (!S.granero && S.era === 1 && S.edad >= 2 && (S.cosechas || 0) >= 3 && S.tecs[26] && S.tecs[26].fase === 'meseta') {
    S.granero = true; // con vasijas donde guardar y cosechas de sobra, el clan levanta su almacén
    if (!silencioso) { sfx.hito(); jubilo(); fx.anillos.push({ born: performance.now(), x: 3.3, y: 9.0 }); toast('🧺 <b>El granero.</b> Cosecha tras cosecha, el grano sobra; sobre pilotes de piedra el clan levanta su primer almacén. La panza segura deja tiempo para aprender: <b>+15%</b>, para siempre.', 15000); }
  }
  const r = tasa();
  S.apr += r * dt; S.aprTotal += r * dt;
  S.tecs.forEach((t, i) => {
    const T = BALANCE.tecnologias[i];
    if (t.fase === 'novedad') {
      t.t -= dt;
      if (t.t <= 0) {
        t.fase = 'valle';
        S.animo = Math.max(BALANCE.animo.min, S.animo - BALANCE.animo.golpeValle);
        // el polvo se explica UNA vez (lista de cotejo A5): después lo dicen el aviso ámbar fijo y la consejera
        if (!silencioso) { sfx.polvo(); if (!S.vioPolvo) { S.vioPolvo = true; toast(`🕸️ <b>${T.nombre}</b> ${/p$/.test(T.genero || '') ? 'juntan' : 'junta'} polvo: la novedad pasó y nadie sabe usar${pron(T.id)} bien. Le pasa a todo saber nuevo: enciende su saber en ${S.era === 1 ? 'las guías' : 'los maestros'} y rinde para siempre.`, 11000); } }
      }
    } else if (t.fase === 'formando') {
      t.t -= dt;
      if (t.t <= 0) {
        t.fase = 'meseta';
        if (i === 31 && S.era === 3) S.ejerPend = Math.max(S.ejerPend || 0, 2); // el patio ESTRENA con dos ejercicios esperando (2026-09-06): el gesto protagonista se presenta al instante, no 40 s después de aprenderlo
        S.animo = Math.min(animoMax(), S.animo + BALANCE.animo.porFormacion);
        if (!silencioso) { sfx.logro(); jubilo(); anillaEscena(i); toast(LEX().formadoToast(T.nombre, T.ficha), 12000); }
      }
    }
  });
  S.tecs.forEach((t, i) => { if (t.prof > 0) { t.prof -= dt; if (t.prof <= 0) { t.nivel = (t.nivel || 0) + 1; if (!silencioso) { sfx.logro(); jubilo(); anillaEscena(i); const h = SUBHIST[i] && SUBHIST[i][t.nivel]; if (h) toast(h, 13000); } } } });
  if (hayValle()) S.animo = Math.max(BALANCE.animo.min, S.animo - BALANCE.animo.drenaValle * dt);
  else S.animo = Math.min(animoMax(), S.animo + BALANCE.animo.regen * dt);
  if (S.teCd > 0) S.teCd = Math.max(0, S.teCd - dt);
  if (S.truequeCd > 0) S.truequeCd = Math.max(0, S.truequeCd - dt); // el clan vecino vuelve cada tanto (C2)
  if ((S.abuelaCd || 0) > 0) S.abuelaCd = Math.max(0, S.abuelaCd - dt);
  if ((S.himnoCd || 0) > 0) S.himnoCd = Math.max(0, S.himnoCd - dt);
  if ((S.himnoEco || 0) > 0) S.himnoEco = Math.max(0, S.himnoEco - dt); // el eco del canto se apaga con la vuelta del sol
  if (S.kermCd > 0) S.kermCd = Math.max(0, S.kermCd - dt);
  // la primera visita de la historia: la Abuela, cuando el círculo ya funciona
  if (!S.abuela && S.era === 1 && S.tecs[10] && S.tecs[10].fase === 'meseta') {
    S.abuela = 1;
    if (!silencioso) { sfx.visita(); toast('🔥 Una anciana se sienta junto al fuego sin pedir permiso: <b>la Abuela</b> quiere contar una historia.', 14000); }
  }
  // Enheduanna llega cuando la tablilla se domina
  if (!S.enheduanna && S.era === 2 && S.tecs[16] && S.tecs[16].fase === 'meseta') {
    S.enheduanna = 1;
    if (!silencioso) { sfx.visita(); toast('🌙 Una sacerdotisa llega desde el templo de Ur: <b>Enheduanna</b>, la primera autora de la historia, espera en el patio de la edubba.', 14000); }
  }
  // Quintiliano llega cuando el rétor se domina: el rétor de Calagurris, el primero que paga el Estado, por la Vía Sacra
  if (!S.quintiliano && S.era === 14 && S.tecs[78] && S.tecs[78].fase === 'meseta') {
    S.quintiliano = 1;
    if (!silencioso) { sfx.visita(); toast('📕 Por la Vía Sacra llega un hombre de toga gastada con un rollo bajo el brazo: <b>Marco Fabio Quintiliano</b>, el rétor de Calagurris, en Hispania, al que el Estado le paga por enseñar. Dice que los azotes no enseñan nada. Recíbelo en la Vía Sacra.', 14000); }
  }
  // Zhu Xi llega cuando los clásicos impresos se dominan (sus comentarios a los Cuatro Libros se imprimieron en Jianyang, junto a su casa): COMO RECUERDO (nació en 1130, tres años después de que cayera Kaifeng; la tarjeta lo dice). Hacia el minuto 9: antes, con la academia, llegaba en el 13 y su regla no alcanzaba a pesar
  if (!S.zhuxi && S.era === 15 && S.tecs[82] && S.tecs[82].fase === 'meseta') {
    S.zhuxi = 1;
    if (!silencioso) { sfx.visita(); toast('⛰️ Por la puerta de la ciudad entra un letrado de túnica sencilla, como entra un recuerdo: <b>Zhu Xi</b>, el que refundará la academia de la Gruta del Ciervo Blanco. Viene de un siglo después: Kaifeng ya habrá caído cuando él nazca. Recíbelo en la puerta.', 14000); }
  }
  // Bloom llega cuando el tutor se domina: COMO RECUERDO (el problema de las dos sigmas es de 1984; la tarjeta lo dice)
  if (!S.bloom && S.era === 21 && S.tecs[88] && S.tecs[88].fase === 'meseta') {
    S.bloom = 1;
    if (!silencioso) { sfx.visita(); toast('🎯 En la parada se baja un señor de anteojos con una carpeta llena de gráficos: <b>Benjamin Bloom</b>. Viene como recuerdo, de 1984, cuando midió cuánto más aprende el que tiene un tutor. Recíbelo en la parada.', 14000); }
  }
  // Sarmiento llega cuando la ley se domina: baja de la cordillera en mula, por el camino de Mendoza
  if (!S.sarmiento && S.era === 10 && S.tecs[73] && S.tecs[73].fase === 'meseta') {
    S.sarmiento = 1;
    if (!silencioso) { sfx.visita(); toast('🎒 Por el camino de la cordillera baja un hombre en mula, con un baúl de libros: <b>Domingo Faustino Sarmiento</b>. Recíbelo al pie del camino de Mendoza.', 14000); }
  }
  // Comenio llega cuando la Didáctica se domina: desembarca en el muelle del IJ, con su baúl de manuscritos
  if (!S.comenio && S.era === 9 && S.tecs[67] && S.tecs[67].fase === 'meseta') {
    S.comenio = 1;
    if (!silencioso) { sfx.visita(); toast('🏫 Un barco de Hamburgo amarra en el IJ y baja un viejo de barba blanca con un baúl de manuscritos: <b>Jan Amos Comenio</b>. Su casa de Leszno ardió con todos sus papeles. Recíbelo en el muelle.', 14000); }
  }
  // Abelardo llega cuando la disputatio se domina: el maestro que llenaba la Montaña de estudiantes
  if (!S.abelardo && S.era === 8 && S.tecs[60] && S.tecs[60].fase === 'meseta') {
    S.abelardo = 1;
    if (!silencioso) { sfx.visita(); toast('⚖️ Un maestro joven cruza el Petit Pont rodeado de estudiantes: <b>Pedro Abelardo</b>, el que vence a todos en la disputa. Recíbelo al pie del puente.', 14000); }
  }
  // Nezahualcóyotl llega cuando el calmécac se domina: el señor poeta de Texcoco viene en canoa a ver las escuelas de Tenochtitlan
  if (!S.neza && S.era === 7 && S.tecs[53] && S.tecs[53].fase === 'meseta') {
    S.neza = 1;
    if (!silencioso) { sfx.visita(); toast('🌺 Una canoa de Texcoco cruza el lago y amarra en el embarcadero: <b>Nezahualcóyotl</b>, el señor poeta, el que reunió a los sabios en su ciudad. Recíbelo en el embarcadero.', 14000); }
  }
  // Hunayn llega cuando la traducción se domina: el oficio ya existe en la mesa, y él viene a hacerlo escuela
  if (!S.hunayn && S.era === 6 && S.tecs[47] && S.tecs[47].fase === 'meseta') {
    S.hunayn = 1;
    if (!silencioso) { sfx.visita(); toast('🌙 Un médico cristiano llega con un fajo de manuscritos de Galeno bajo el brazo: <b>Hunayn ibn Ishaq</b>, el jeque de los traductores. Dice que una traducción mal hecha es peor que ninguna. Recíbelo en la puerta de la Casa de la Sabiduría.', 14000); }
  }
  // Hipatia llega cuando los Elementos se dominan: editó con su padre, Teón, el texto de Euclides que se enseñaba
  if (!S.hipatia && S.era === 5 && S.tecs[42] && S.tecs[42].fase === 'meseta') {
    S.hipatia = 1;
    if (!silencioso) { sfx.visita(); toast('📜 Una mujer con el manto de los filósofos cruza la ciudad con los Elementos bajo el brazo: <b>Hipatia</b>. Explica a Euclides en la calle, a quien quiera escucharla. Recíbela en la puerta del Museo.', 14000); }
  }
  // Ptahhotep llega cuando el papiro se domina
  if (!S.socrates && S.era === 4 && S.tecs[37] && S.tecs[37].fase === 'meseta') { // Sócrates llega cuando la pregunta ya existe en el ágora
    S.socrates = 1;
    if (!silencioso) { sfx.visita(); toast('🏛️ Un hombre descalzo entra a la plaza y le hace una pregunta al primero que pasa: <b>Sócrates</b>. Dice que no sabe nada. Recíbelo desde la puerta.', 14000); }
  }
  if (!S.ptahhotep && S.era === 3 && S.tecs[20] && S.tecs[20].fase === 'meseta') {
    S.ptahhotep = 1;
    if (!silencioso) { sfx.visita(); toast('🪷 Un visir anciano llega apoyado en su bastón: <b>Ptahhotep</b>, autor de las Instrucciones, espera en la puerta de la Casa de la Vida.', 14000); }
  }
  // Dewey llega cuando la escuela ya domina su primer aparato
  if (!S.dewey && S.tecs[0].fase === 'meseta') {
    S.dewey = 1;
    if (!silencioso) { sfx.visita(); toast('🎩 Un visitante espera en la puerta: el profesor <b>John Dewey</b>. Recíbelo desde el dock.', 14000); }
  }
  if (!S.skinner && S.tecs[8] && S.tecs[8].fase !== 'sin') {
    S.skinner = 1;
    if (!silencioso) { sfx.visita(); toast('🎩 La máquina trajo a su inventor: el profesor <b>B. F. Skinner</b> espera en la puerta.', 14000); }
  }
  if (!S.freire && ordEra(S.era) >= 13 && S.tecs[4] && S.tecs[4].fase === 'meseta') {
    S.freire = 1;
    if (!silencioso) { sfx.visita(); toast('🎩 Un educador viene caminando desde el pueblo: <b>Paulo Freire</b> quiere hablar de la radio.', 14000); }
  }
  if (S.deweyT > 0) {
    S.deweyT = Math.max(0, S.deweyT - dt);
    if (S.deweyT === 0 && !silencioso && (S.transicionDe || 'dewey') === 'dewey')
      toast('🌱 <b>El patio es el aula.</b> El huerto y el pozo ahora enseñan. <i>«La educación no es preparación para la vida; la educación es la vida misma.»</i>', 14000);
  }
  S.trimestreT += dt;
  const TR = BALANCE.trimestre;
  while (S.trimestreT >= TR.dur) {
    S.trimestreT -= TR.dur;
    const crecida = S.era === 3 && estacion().i === 0 ? 2 : 1; // EGIPTO: en ajet el río cubre la vega y PAGA en limo: el tributo se dobla (2026-09-06: el año de la época hecho economía, y el goteo de media época deja de ser tan fino)
    const matricula = S.era === 7 ? 1 + Math.min(0.8, 0.03 * (S.codices || 0)) : 1; // TENOCHTITLAN: los tlacuilos del calmécac pintan los registros del tributo (la Matrícula de Tributos): cada códice sube un 3 % lo que llega en canoas, hasta +80 %
    const monto = Math.round((TR.base + TR.porRep * S.rep) * (ordEra(S.era) >= 11 ? S.era - 10 : S.era === 14 ? 5.5 : S.era === 15 ? 2 : S.era === 21 ? 10 : S.era) * crecida * matricula); // el templo y el ministerio creen más en la escuela que crece (la escala de cada época es la de su calibración: Roma 5,5; China 2: en Kaifeng los 🏺 los mandan a casa los funcionarios, balance-epoca15.md; París sigue en 8 y Tenochtitlan en 7 aunque el viaje los invierta, balance-epoca8.md)
    S.pre += monto;
    // SUMER: cada cosecha del templo deja cuentas por sellar (el verbo de los cálculos, como la caza deja muescas)
    if (S.era === 2 && S.tecs[18] && S.tecs[18].fase === 'meseta' && !S.ganadoSum) S.fichasPend = Math.min(8, (S.fichasPend || 0) + 2); // ganada la época, también el trimestre deja descansar a la administración
    if (!silencioso) { sfx.moneda(); toast(LEX().trimestre(monto)); }
  }
  while (S.rep < BALANCE.hitos.length && S.aprTotal >= BALANCE.hitos[S.rep]) {
    S.rep++;
    S.alumnos += BALANCE.alumnosPorHito;
    if (!silencioso) { sfx.hito(); jubilo();
      const nom = S.era === 1 ? HITOS_FOGON[S.rep - 1] : null;
      toast(nom ? `⭐ <b>${nom}</b> Se suman <b>${BALANCE.alumnosPorHito} pequeños</b>.` : LEX().hito(BALANCE.alumnosPorHito));
    }
  }
  // LA ESCALERA POR ÉPOCA (2026-08-24, c07): la global de arriba se agota al inicio de Sumer, decisión
  // validada a escala de las épocas 1-2, que quedan TAL CUAL. Desde Egipto, cada época declara sus
  // `hitos` en su entrada del arco (umbrales de saber RELATIVOS a su llegada: entrarEpoca estampa
  // S.eraAprBase) y la reputación y los aprendices vuelven a crecer época a época. Sin `hitos` en la
  // entrada, este bucle no existe: cero cambio para lo publicado.
  const AH = arcoDe(S.era);
  if (AH && AH.hitos) {
    while ((S.hitosEra || 0) < AH.hitos.length && S.aprTotal - (S.eraAprBase || 0) >= AH.hitos[S.hitosEra || 0]) {
      S.hitosEra = (S.hitosEra || 0) + 1;
      S.rep++;
      S.alumnos += AH.alumnosPorHito ?? BALANCE.alumnosPorHito;
      if (!silencioso) { sfx.hito(); jubilo(); toast(LEX().hito(AH.alumnosPorHito ?? BALANCE.alumnosPorHito)); }
    }
  }
  // RAMA A: el asentamiento, el paso propio de la Época 1 (por eso no es una entrada del arco). Con
  // los seis saberes del fogón y la memoria de la Abuela contada entera, el clan se queda: edad 2, y
  // el Neolítico abre. Es una transición dentro de la época, no una victoria.
  const fogonListo = S.era === 1 && dominados(saberesEpoca(1, 1));
  if (!S.ganadoF && fogonListo && S.abuelaCap < 3 && !silencioso) {
    nudgeUnaVez('abuela', S.abuela === 2 // la época no se domina sin su pensadora
      ? '🔥 El círculo está completo… pero la anciana junto al fuego aún espera contar su historia. <b>Escúchala</b>: el clan no se quedará a vivir aquí sin su memoria.'
      : '🔥 El círculo está completo… pero una anciana espera junto al fuego. <b>Acógela en el clan</b>: su memoria es lo que falta para que el clan se quede.');
  }
  if (!S.ganadoF && fogonListo && S.abuelaCap >= 3 && S.era === 1 && S.edad < 2) {
    if (S.cazaOn) cerrarCaza(true); // la última cacería se cierra con botín antes de colgar las lanzas
    S.edad = 2;
    if (!silencioso) {
      sfx.logro(); renderTerrain();
      toast('🌾 <b>La Revolución Neolítica.</b> El clan deja de seguir a la manada: se queda, siembra y guarda el grano. Alrededor del fuego se levantan las primeras chozas. Ahora hay que aprender a <b>producir</b> el alimento, no solo a buscarlo.', 15000);
    }
  }
  // EL FINAL NO SE PIERDE (QA general, 2026-09-30): si la última época se cerró sin que nadie mirara (en una ausencia,
  // con la pestaña oculta o recargando con la tarjeta abierta), su victoria y el agradecimiento salen en el primer latido en vivo
  if (!silencioso && !S.vioGracias && !graciasPendiente && !victoriaPendiente && !visible($('victoria')) && !visible($('gracias'))) {
    const F = ARCO_EPOCAS.find(a => a.era === ULTIMA_EPOCA);
    if (F && S[F.flag] && S.era === ULTIMA_EPOCA) { pantallaVictoria(F.titulo, F.texto()); graciasPendiente = true; }
  }
  // EL ARCO DE ÉPOCA: cada cierre es una entrada de ARCO_EPOCAS (arriba de tick), no un bloque a mano.
  for (const A of ARCO_EPOCAS) {
    if (S[A.flag] || (S.era !== A.era && !(A.desde && ordEra(S.era) > ordEra(A.era)))) continue;
    if (A.edadMin && S.edad < A.edadMin) continue;
    if (!terminados(A.saberes)) continue; // la época no se declara dominada con saberes a medio pulir
    if (A.pensador && !A.pensador()) {
      if (!silencioso) nudgeUnaVez(A.flag, A.nudge);
      continue;
    }
    S[A.flag] = true; // la victoria se anota aunque el tick sea silencioso; la pantalla, solo en vivo
    if (!silencioso) { sfx.logro(); pantallaVictoria(A.titulo, A.texto()); if (A.era === ULTIMA_EPOCA && !S.vioGracias) graciasPendiente = true; } // la última época publicada: al cerrar su tarjeta, el agradecimiento del demo
  }
}
function dominados(idx) { return idx.every(i => S.tecs[i] && S.tecs[i].fase === 'meseta'); }
/* La tesis del juego es avanzar en TODO el conocimiento: APRENDIDA (meseta) basta para las transiciones
   del medio (el asentamiento, el ritmo), pero la ÉPOCA solo se declara dominada con la perfección 3/3
   de cada saber. Así el trofeo y la despedida de la pensadora no mienten, y la perfección es el
   contenido natural del final de época, no un apéndice olvidable. */
function terminados(idx) { return idx.every(i => S.tecs[i] && S.tecs[i].fase === 'meseta' && (S.tecs[i].nivel || 0) >= 3); }

/* ============================================================
   HUD
   ============================================================ */
