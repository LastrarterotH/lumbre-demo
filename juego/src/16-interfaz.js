/* ============================================================
   16-interfaz
   La interfaz: toasts, el dock y sus chips, los paneles, las visitas de pensadores y renderHUD.
   ============================================================ */
const $ = id => document.getElementById(id);
const UNIDADES_NUM = ['', ' K', ' M', ' B', ' T', ' Qa', ' Qi'];
function fmt(n) { // notación idle: 12.345 se lee 12,3 K
  n = Math.floor(n);
  if (n < 10000) return n.toLocaleString('es');
  let u = 0, v = n;
  while (v >= 1000 && u < UNIDADES_NUM.length - 1) { v /= 1000; u++; }
  const dec = v >= 100 ? 0 : v >= 10 ? 1 : 2;
  return v.toLocaleString('es', { minimumFractionDigits: dec, maximumFractionDigits: dec }) + UNIDADES_NUM[u];
}
const fmt1 = n => n >= 10000 ? fmt(n) : (Math.round(n * 10) / 10).toLocaleString('es', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
function angosto() { return innerWidth <= 640 && innerHeight > innerWidth; } // el celular vertical
function toast(html, ms = 6000) {
  const d = document.createElement('div');
  d.className = 'toast'; d.innerHTML = html;
  $('toasts').prepend(d);
  while ($('toasts').children.length > 3) $('toasts').lastChild.remove();
  setTimeout(() => { d.style.opacity = '0'; setTimeout(() => d.remove(), 700); }, ms);
}
/* --- el dock: chips compactos; el detalle vive en un panel único --- */
/* LA FICHA ÚNICA (2026-08-01): todo lo que describe a un saber vive en su entrada de
   BALANCE.tecnologias (icono, corto, género, material, escena, fuente, subhist). Estas tablas son
   DERIVADAS: no se editan; se edita la ficha del saber en 01-balance. */
const ICONOS = BALANCE.tecnologias.map(T => T.icono);
const GENERO_TEC = Object.fromEntries(BALANCE.tecnologias.map(T => [T.id, T.genero]));
const pron = id => ({ m: 'lo', f: 'la', mp: 'los', fp: 'las' })[GENERO_TEC[id] || 'f'];
const CORTOS = BALANCE.tecnologias.map(T => T.corto);
let panelActivo = null; // {tipo:'tec', i} | {tipo:'inv'} | {tipo:'dewey'}

function chipNuevo(id, html) {
  const c = document.createElement('div');
  c.className = 'chip'; c.id = id; c.innerHTML = html;
  return c;
}
function togglePanel(sel) {
  if (hayModal()) return;                    // con un modal arriba, el dock no decide nada
  panelActivo = (JSON.stringify(panelActivo) === JSON.stringify(sel)) ? null : sel;
  if (panelActivo) ocultarFicha();           // la ficha persigue al personaje y aterrizaba sobre el botón de gasto
  renderHUD();
}
let dockLock = 0; // hasta cuándo el dock ignora clics (se arma al recomponerse bajo el cursor)
function construirTienda() {
  const dock = $('dock');
  dock.addEventListener('click', e => { if (performance.now() < dockLock) { e.stopPropagation(); e.preventDefault(); } }, true);
  const cfu = chipNuevo('chip-varas', `🪵 Frotar las varas<span class="mini"><i></i></span>`); // ojo: 'chip-fuego' es del aparato del museo
  cfu.addEventListener('click', frotarVaras);
  dock.appendChild(cfu);
  BALANCE.tecnologias.forEach((T, i) => {
    const c = chipNuevo('chip-' + T.id, `<span class="dot"></span>${ICONOS[i]} <span class="nom">${CORTOS[i]}</span><span class="pips" style="display:none"><i></i><i></i><i></i></span><span class="mini" style="display:none"><i></i></span>`);
    c.title = T.nombre; // el nombre sigue disponible aunque el trofeo esté plegado
    c.addEventListener('click', () => togglePanel({ tipo: 'tec', i }));
    dock.appendChild(c);
  });
  const cpv = chipNuevo('chip-porvenir', `<span id="porvenir-txt"></span>`); // el dock muestra solo el presente: lo no comprado se revela de a uno
  cpv.classList.add('apagado'); cpv.title = 'nuevos saberes se revelarán a su tiempo';
  dock.appendChild(cpv);
  for (const k of ['abuela', 'enheduanna', 'ptahhotep', 'socrates', 'hipatia', 'quintiliano', 'hunayn', 'zhuxi', 'abelardo', 'neza', 'comenio', 'sarmiento', 'bloom', 'dewey', 'skinner', 'freire']) {
    const wrap = document.createElement('div');
    wrap.className = 'medallon-wrap'; wrap.style.display = 'none';
    const m = document.createElement('div');
    m.className = 'medallon'; m.id = 'med-' + k;
    const cv2 = document.createElement('canvas');
    cv2.width = 92; cv2.height = 92;
    m.appendChild(cv2);
    drawBusto(cv2.getContext('2d'), k);
    m.addEventListener('click', () => {
      if (estadoPensador(k) === 1) abrirVisita(k);
      else togglePanel({ tipo: 'pensador', k });
    });
    wrap.appendChild(m);
    const PN = PENSADORES[k];
    const tj = document.createElement('div');
    tj.className = 'tarjeta-pensador';
    tj.innerHTML = `<h4>${PN.nombre.replace('🎩 ', '')} <span class="años">(${PN.años})</span></h4>
      <div class="cita">«${PN.cita}»</div>
      <div class="bio">${PN.bio}</div>
      <div class="bio" style="margin-top:5px">🎯 <b style="color:var(--texto)">En el juego:</b> ${PN.practica}</div>
      <div class="obras">📚 ${PN.obras.length ? PN.obras.map(o => `<b>${o.titulo}</b> (${o.año})`).join(' · ') : '<i>Su obra no se escribió: se contó.</i>'}</div>`;
    wrap.appendChild(tj);
    $('ideas-fila').appendChild(wrap);
  }
  const cin = chipNuevo('chip-inv', `<span class="dot novedad"></span><span id="inv-txt">Era 2</span>`);
  cin.addEventListener('click', () => togglePanel({ tipo: 'inv' }));
  dock.appendChild(cin);
  const cmu = chipNuevo('chip-museo', `🏛️`); cmu.title = 'Museo: la historia de lo que ya dominas';
  cmu.addEventListener('click', () => togglePanel({ tipo: 'museo' }));
  dock.appendChild(cmu);
  const cgen = chipNuevo('chip-gen', `<span class="dot novedad"></span>🧬 Generaciones`);
  cgen.addEventListener('click', () => togglePanel({ tipo: 'gen' }));
  dock.appendChild(cgen);
  const divisor = document.createElement('div'); divisor.className = 'div'; dock.appendChild(divisor);
  const cdoc = chipNuevo('chip-doc', '👩‍🏫 <span id="doc-txt"></span>');
  cdoc.addEventListener('click', () => { // el chip EXPLICA siempre: callar ante un clic se siente roto
    if (S.docentes >= maxDocentes()) { mostrarHudInfo('x-guias', cdoc); return; }
    if (S.pre < costoDocente()) { mostrarHudInfo('x-guia-falta', cdoc); return; }
    // el tercer estado del dock («puedes, pero no hace falta») también FRENA el gasto: con todos
    // atendidos, el clic contrataba igual y el jugador pagaba por nada sin saber por qué (2026-08-02)
    if (S.alumnos - alumnosBien() <= 0) { mostrarHudInfo('x-guia', cdoc); toast(`👩‍🏫 <b>Todos están atendidos</b>: ${otroDocente()} ${LEX().docente.toLowerCase()} no sumaría nada hoy. El chip se enciende solo cuando alguien quede aprendiendo a medias.`, 9000); return; }
    contratar(); renderHUD(); guardar();
  });
  // se explica al pasar por encima, no solo cuando no puedes pagarla: si no, quien tiene recursos
  // la pulsa sin llegar a saber nunca para qué sirve
  cdoc.addEventListener('mouseenter', () => mostrarHudInfo('x-guia', cdoc));
  dock.appendChild(cdoc);
  const cte = chipNuevo('chip-te', '<span id="te-icono">☕</span> <span id="te-txt"></span>');
  cte.addEventListener('click', () => {
    if (S.teCd > 0 || S.apr < BALANCE.te.costo || S.animo >= animoMax()) { mostrarHudInfo('x-te-falta', cte); return; } // nunca callar
    tomarTe(); renderHUD(); guardar();
  });
  cte.addEventListener('mouseenter', () => mostrarHudInfo('x-te', cte));
  dock.appendChild(cte);
  const cke = chipNuevo('chip-kerm', '🎪 <span id="kerm-txt"></span>');
  cke.addEventListener('click', () => { kermesse(); renderHUD(); guardar(); });
  dock.appendChild(cke);
  // el sistema de visitas (el eje de las Ideas)
  $('b-luego').addEventListener('click', () => {
    if (String(visitaAbierta).startsWith('guia:')) { const k = +visitaAbierta.slice(5); cerrarVisita(); elegirModoGuia(k, 'cerca'); return; }
    if (visitaAbierta === 'originales') { cerrarVisita(); elegirOriginales('devolver'); return; }
    cerrarVisita();
  });
  if ($('escuelas')) { $('b-escuelas-cerrar').addEventListener('click', cerrarEscuelas); $('es-salas').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled) return; if (b.dataset.m) elegirMetodoEscuela(+b.dataset.e, b.dataset.m); else if (b.dataset.i !== undefined) elegirAlumno(+b.dataset.i); }); if ($('b-escuelas-listos')) $('b-escuelas-listos').addEventListener('click', () => pasarListos()); $('escuelas').addEventListener('click', e => { if (e.target === $('escuelas')) cerrarEscuelas(); }); }
  if ($('examen')) { $('b-examen-cerrar').addEventListener('click', cerrarExamen); $('ex-lista').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled || !b.dataset.k) return; elegirModoCand(+b.dataset.i, b.dataset.k); }); $('b-examen-preparar').addEventListener('click', () => { prepararCandidatos(); abrirExamen(); }); $('examen').addEventListener('click', e => { if (e.target === $('examen')) cerrarExamen(); }); }
  if ($('pregunta')) { $('b-pregunta-cerrar').addEventListener('click', cerrarPregunta); $('pq-lista').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || b.disabled || !b.dataset.m) return; elegirFuCand(+b.dataset.i, b.dataset.m); }); $('b-pregunta-todos').addEventListener('click', () => { ayudarATodosFu(); abrirPregunta(); }); $('b-pregunta-revisar').addEventListener('click', () => { revisarFu(); abrirPregunta(); }); $('pregunta').addEventListener('click', e => { if (e.target === $('pregunta')) cerrarPregunta(); }); }
  if ($('mapa')) { $('b-mapa-cerrar').addEventListener('click', cerrarMapa); $('ma-pueblos').addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.disabled) elegirPueblo(+b.dataset.p); }); $('mapa').addEventListener('click', e => { if (e.target === $('mapa')) cerrarMapa(); }); }
  if ($('componer')) { $('b-componer-cerrar').addEventListener('click', cerrarComponer); $('co-obras').addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.disabled) elegirObra(b.dataset.o); }); $('componer').addEventListener('click', e => { if (e.target === $('componer')) cerrarComponer(); }); }
  if ($('horario')) { $('b-horario-cerrar').addEventListener('click', cerrarHorario); $('ho-filas').addEventListener('click', e => { const b = e.target.closest('button'); if (b && !b.disabled) elegirTarea(+b.dataset.i, b.dataset.t); }); $('horario').addEventListener('click', e => { if (e.target === $('horario')) cerrarHorario(); }); }
  if ($('promesa')) { $('b-promesa-cerrar').addEventListener('click', cerrarPromesa); $('pr-telpo').addEventListener('click', () => elegirEscuela('telpochcalli')); $('pr-calme').addEventListener('click', () => elegirEscuela('calmecac')); $('promesa').addEventListener('click', e => { if (e.target === $('promesa')) cerrarPromesa(); }); }
  if ($('traducir')) { $('b-traducir-cerrar').addEventListener('click', cerrarTraducir); $('tr-literal').addEventListener('click', () => elegirMetodo('literal')); $('tr-sentido').addEventListener('click', () => elegirMetodo('sentido')); $('traducir').addEventListener('click', e => { if (e.target === $('traducir')) cerrarTraducir(); }); }
  if ($('catalogo')) { $('b-catalogo-cerrar').addEventListener('click', cerrarCatalogo); $('catalogo').addEventListener('click', e => { if (e.target === $('catalogo')) cerrarCatalogo(); }); }
  if ($('b-secreto')) { $('b-secreto').addEventListener('click', cerrarSecreto); $('secreto').addEventListener('click', e => { if (e.target === $('secreto')) cerrarSecreto(); }); }
  $('b-adoptar').addEventListener('click', () => {
    if (String(visitaAbierta).startsWith('guia:')) { const k = +visitaAbierta.slice(5); cerrarVisita(); elegirModoGuia(k, 'corro'); return; }
    if (visitaAbierta === 'originales') { cerrarVisita(); elegirOriginales('quedar'); return; }
    const v = VISITAS[visitaAbierta];
    if (!v || estadoPensador(visitaAbierta) !== 1 || S.apr < v.costo) { cerrarVisita(); return; } // nunca dejar el modal huérfano
    S.apr -= v.costo; setPensador(visitaAbierta, 2); S.deweyT = v.transicion; S.transicionDe = visitaAbierta;   // quién se está adoptando: el aviso del patio es solo de Dewey (QA completo)
    debito('r-apr', `−${fmt(v.costo)} 📖`);
    cerrarVisita();
    sfx.logro();
    toast(v.brindis);
    renderHUD(); guardar();
  });
}
function estadoPensador(k) { return k === 'abuela' ? S.abuela : k === 'enheduanna' ? S.enheduanna : k === 'ptahhotep' ? S.ptahhotep : k === 'socrates' ? S.socrates : k === 'hipatia' ? S.hipatia : k === 'quintiliano' ? S.quintiliano : k === 'hunayn' ? S.hunayn : k === 'zhuxi' ? S.zhuxi : k === 'neza' ? S.neza : k === 'abelardo' ? S.abelardo : k === 'comenio' ? S.comenio : k === 'sarmiento' ? S.sarmiento : k === 'bloom' ? S.bloom : k === 'dewey' ? S.dewey : k === 'skinner' ? S.skinner : S.freire; }
function setPensador(k, v) { if (k === 'abuela') S.abuela = v; else if (k === 'enheduanna') S.enheduanna = v; else if (k === 'ptahhotep') S.ptahhotep = v; else if (k === 'socrates') S.socrates = v; else if (k === 'hipatia') S.hipatia = v; else if (k === 'quintiliano') S.quintiliano = v; else if (k === 'hunayn') S.hunayn = v; else if (k === 'zhuxi') S.zhuxi = v; else if (k === 'neza') S.neza = v; else if (k === 'abelardo') S.abelardo = v; else if (k === 'comenio') S.comenio = v; else if (k === 'sarmiento') S.sarmiento = v; else if (k === 'bloom') S.bloom = v; else if (k === 'dewey') S.dewey = v; else if (k === 'skinner') S.skinner = v; else S.freire = v; }
const PENSADORES = {
  bloom: {   // EL FUTURO (era21-plan): llega COMO RECUERDO (el problema de las dos sigmas es de 1984); la ficha lo dice
    nombre: '🎯 Benjamin Bloom', años: '1913–1999 · las dos sigmas',
    cita: 'Lo que una persona en el mundo puede aprender, casi todas pueden aprenderlo, si se les dan las condiciones adecuadas.',
    resumen: () => `🎯 <b>Las dos sigmas</b>: en el valle, cada uno que entendió rinde el doble en lo que aprende el valle, y preguntar como tutor tarda un cuarto menos${S.entendidosFu ? ` (ya entendieron <b>${Math.round(S.entendidosFu)}</b>)` : ''}.`,
    ficha: 'Benjamin Bloom, psicólogo de la educación de la Universidad de Chicago. Su taxonomía de los objetivos de aprendizaje (1956), de recordar a crear, todavía ordena programas en todo el mundo. En 1984 publicó «El problema de las dos sigmas»: dos de sus estudiantes habían comparado la clase de siempre con la tutoría de uno a uno, y el estudiante promedio con tutor rendía más que el 98 % de los de la clase común. El problema, escribió, era que no había tutores para todos. Aquí llega como recuerdo.',
    bio: '⚖️ Las dos sigmas resultaron menos. Kurt VanLehn revisó en 2011 decenas de estudios: los tutores humanos rinden bastante menos que eso, y los buenos sistemas de tutoría por computadora rinden casi lo mismo que ellos. La promesa del tutor para cada uno es real, y es más chica de lo que Bloom pensaba. La cita del encabezado es de Human Characteristics and School Learning (1976).',
    practica: 'Las dos sigmas: un tutor para cada uno. Con Bloom, cada uno que entendió rinde el doble en lo que aprende el valle, y preguntar como tutor tarda menos.',
    obras: [
      { titulo: 'Bloom, The 2 sigma problem: The search for methods of group instruction as effective as one-to-one tutoring (Educational Researcher 13)', año: '1984' },
      { titulo: 'VanLehn, The relative effectiveness of human tutoring, intelligent tutoring systems, and other tutoring systems (Educational Psychologist 46)', año: '2011' }
    ]
  },
  zhuxi: {   // CHINA SONG (era15-plan): llega COMO RECUERDO, porque es posterior a la caída de Kaifeng (1127); la ficha lo dice
    nombre: '⛰️ Zhu Xi', años: '1130–1200 · leer despacio',
    cita: 'Los sabios de antes no enseñaban para que la gente memorizara y escribiera ensayos, y así pescara fama y un sueldo.',
    resumen: () => `⛰️ <b>Leer despacio</b>: en Kaifeng, estudiar para entender rinde como memorizar, y los que entienden enseñan mejor.`,
    ficha: 'Zhu Xi nació en Fujian en 1130, tres años después de que los yurchen tomaran Kaifeng: la corte de los Song se fue al sur, y él nunca vio la capital del norte. Aquí llega como recuerdo. Aprobó el examen a los dieciocho años y pasó la vida escribiendo contra el estudio para aprobar. En 1179 refundó la academia de la Gruta del Ciervo Blanco y le escribió sus reglas.',
    bio: '⚖️ La ironía de su vida: escribió contra estudiar para el examen, y desde 1313 y hasta 1905 sus comentarios a los Cuatro Libros fueron lo que había que memorizar para aprobarlo. Su método de lectura lo juntaron sus discípulos: leer en orden y de a poco, leer hasta saberlo y pensarlo con cuidado, aplicarlo a uno mismo. La cita del encabezado es de las reglas de la Gruta del Ciervo Blanco (1180).',
    practica: 'Leer despacio: estudiar para entender, y no para aprobar. Con Zhu Xi, estudiar para entender rinde como memorizar, y los que entienden enseñan mejor.',
    obras: [
      { titulo: 'Gardner, Learning to Be a Sage: Selections from the Conversations of Master Chu, Arranged Topically (University of California Press)', año: '1990' },
      { titulo: 'de Bary y Chaffee (eds.), Neo-Confucian Education: The Formative Stage (University of California Press)', año: '1989' }
    ]
  },
  quintiliano: {
    nombre: '📕 Quintiliano', años: '~35–~100 d. C. · la escuela sin férula',
    cita: 'Que se azote a los que aprenden, no lo quisiera de ninguna manera: es cosa fea y de esclavos.',
    resumen: () => `📕 <b>La escuela sin férula</b>: el juego deja de ser lento (avanza ×1,35, antes ×0,65), el que pasa a tiempo arrastra a los de su sala (la emulación: +5 % de avance, si se enseña jugando) y la férula pesa el doble en el ánimo${S.oradores ? ` (ya hay <b>${S.oradores}</b> oradores)` : ''}.`,
    ficha: 'Marco Fabio Quintiliano nació en Calagurris (Calahorra), en Hispania, hacia el año 35. Enseñó retórica en Roma durante veinte años y fue el primer rétor con sueldo del Estado, desde Vespasiano; Domiciano le encargó la educación de sus sobrinos nietos. Retirado, escribió la Institutio Oratoria, doce libros sobre cómo formar a un orador desde la cuna: contra los azotes, a favor del juego, de la emulación y de mirar a cada niño como distinto.',
    bio: 'Fue maestro de Plinio el Joven, que lo recuerda en sus cartas (II, 14; VI, 6). Perdió a su mujer y a sus dos hijos, y lo cuenta en el proemio del libro VI. ⚖️ Su ideal es el orador, «el hombre bueno que sabe hablar», y su escuela era para varones libres y con dinero; aun así, sus páginas contra la férula se leyeron durante siglos, de los humanistas del Renacimiento a la escuela moderna. La cita del encabezado es de la Institutio (I, 3, 14).',
    practica: 'La escuela sin férula: la alabanza y la emulación enseñan más que el miedo. Con Quintiliano, enseñar jugando le gana a la férula, y el que aprende bien arrastra a sus compañeros.',
    obras: [
      { titulo: 'Quintiliano, Institutio oratoria (ed. y trad. Russell, The Orator\'s Education, Loeb, Harvard University Press)', año: '2001' },
      { titulo: 'Bonner, Education in Ancient Rome (University of California Press)', año: '1977' }
    ]
  },
  sarmiento: {
    nombre: '🎒 Domingo F. Sarmiento', años: '1811–1888 · educar al soberano',
    cita: 'Hay que educar al soberano.',
    resumen: () => `🎒 <b>Educar al soberano</b>: cada escuela de pueblo forma a sus propios monitores (atienden a tres que aprendían a medias por escuela) y los normalistas egresan más seguido${escuelasAbiertas() ? ` (hoy hay <b>${escuelasAbiertas()}</b> escuelas en los pueblos)` : ''}.`,
    ficha: 'Domingo Faustino Sarmiento, de San Juan, en Argentina: maestro rural a los quince años, exiliado en Chile, donde fundó la Escuela Normal de Preceptores (1842), escribió el Método de lectura gradual y el Facundo, y viajó por Europa y Estados Unidos para estudiar las escuelas. Volvió a Argentina, fue presidente (1868-1874) y llenó el país de escuelas y de maestras traídas de Estados Unidos.',
    bio: 'Polémico como pocos: discutió con Bello sobre la lengua (quería escribir como se habla en América) y su «civilización o barbarie» despreciaba a los pueblos indígenas y a los gauchos, un juicio que hoy se critica con razón. ⚖️ Lo que nadie le discute es la escuela: «hay que educar al soberano», decía, porque en una república el soberano es el pueblo.',
    practica: 'Educar al soberano: si el pueblo manda, el pueblo tiene que saber leer. Con Sarmiento, cada escuela de pueblo forma a sus monitores, y la Normal egresa más seguido.',
    obras: [
      { titulo: 'Sarmiento, De la educación popular (Imprenta de Julio Belin)', año: '1849' },
      { titulo: 'Sarmiento, Método de lectura gradual', año: '1845' }
    ]
  },
  comenio: {
    nombre: '🏫 Jan Amos Comenio', años: '1592–1670 · enseñar todo a todos',
    cita: 'Nada hay en el entendimiento que antes no haya estado en los sentidos.',
    resumen: () => `🏫 <b>Todo a todos</b>: una cartilla sirve a una clase entera: cada tres lectores atienden a uno que aprendía a medias${S.lectores ? ` (hoy hay <b>${Math.floor(S.lectores)}</b> lectores)` : ''}, y el mercado de cartillas casi no se llena: siempre hay niños nuevos.`,
    ficha: 'Jan Amos Komenský, obispo de los Hermanos Moravos, expulsado de Bohemia por la guerra de los Treinta Años: vivió en el exilio, en Polonia, Suecia, Hungría e Inglaterra, y sus últimos años en Ámsterdam. Escribió la Didáctica Magna, la Puerta abierta de las lenguas y el Orbis Pictus, y soñó con una escuela para todos y un saber universal (la pansofía). En 1656 su casa de Leszno ardió con todos sus manuscritos.',
    bio: 'Nació en Moravia en 1592 y murió en Ámsterdam en 1670; está enterrado en Naarden. Fue amigo de Johann Valentin Andreae. ⚖️ Se lo llama «padre de la didáctica moderna»; él mismo decía que juntaba lo que otros habían intentado. La frase del encabezado, que viene de Aristóteles y de la escolástica, es la base del Orbis Pictus.',
    practica: 'Todo a todos: la escuela no es para algunos. Con Comenio, cada cartilla impresa sirve a una clase entera, también a los que aprendían a medias.',
    obras: [
      { titulo: 'Comenio, Didáctica Magna (trad. Saloña, Akal)', año: '1986' },
      { titulo: 'Comenio, Orbis Sensualium Pictus (Núremberg, Michael Endter)', año: '1658' }
    ]
  },
  abelardo: {
    nombre: '⚖️ Pedro Abelardo', años: '1079–1142 · sic et non',
    cita: 'Dudando llegamos a preguntar; preguntando, alcanzamos la verdad.',
    resumen: () => `⚖️ <b>Sic et non</b>: disputar enseña dos veces: cada cuestión resuelta suma también saber para toda la ciudad, y en el tiempo de disputar se aprende como leyendo${S.resueltas ? ` (ya se resolvieron <b>${S.resueltas}</b> cuestiones)` : ''}.`,
    ficha: 'Pedro Abelardo, bretón, llegó a París a estudiar dialéctica y terminó venciendo a sus maestros en la disputa: abrió su propia escuela en la Montaña de Santa Genoveva, y miles de estudiantes cruzaban el Petit Pont para oírlo. En el Sic et non juntó 158 cuestiones con lo que las autoridades decían a favor y en contra, sin resolverlas, para que el estudiante aprendiera a preguntar. ⚖️ Su amor con Eloísa, la mujer más sabia de París (después abadesa del Paráclito y escritora de las cartas que se leen todavía), terminó en tragedia: él lo cuenta en la Historia de mis desgracias.',
    bio: 'Maestro en la escuela de la catedral de Notre-Dame y en la Montaña de Santa Genoveva; dos concilios condenaron sus libros (Soissons, 1121; Sens, 1141), y Bernardo de Claraval fue su gran adversario. Murió en Cluny, protegido por Pedro el Venerable. La frase del encabezado es del prólogo del Sic et non.',
    practica: 'Sic et non: aprender es preguntar. Con Abelardo, la disputa no es solo para ganar: cada cuestión discutida a favor y en contra enseña a toda la ciudad.',
    obras: [
      { titulo: 'Abelardo, Sic et non (ed. Boyer y McKeon, University of Chicago Press)', año: '1976' },
      { titulo: 'Clanchy, Abelard: A Medieval Life (Blackwell)', año: '1997' }
    ]
  },
  neza: {
    nombre: '🌺 Nezahualcóyotl', años: '1402–1472 · la flor y el canto',
    cita: '¿Acaso de veras se vive con raíz en la tierra? No para siempre en la tierra: solo un poco aquí.',
    resumen: () => `🌺 <b>La flor y el canto</b>: cada canto de la tarde pinta un códice, y un joven del telpochcalli que cantó puede pasar al calmécac${S.egresCalme ? ` (hoy salieron <b>${S.egresCalme}</b> del calmécac)` : ''}.`,
    ficha: 'Nezahualcóyotl, señor de Texcoco, la ciudad aliada al otro lado del lago: poeta, legislador y constructor (mandó hacer el acueducto de Chapultepec y el albarradón que protegía a Tenochtitlan de las inundaciones). En Texcoco reunió a los sabios, a los poetas y a los pintores de códices. Para los nahuas, in xóchitl in cuícatl, «la flor y el canto», era la poesía, y la única verdad que quedaba en la tierra.',
    bio: 'Señor de Texcoco desde 1431, aliado de Tenochtitlan en la Triple Alianza. ⚖️ Los poemas que se le atribuyen vienen de colecciones copiadas después de la conquista (los Romances de los señores de la Nueva España, los Cantares mexicanos); cuáles son suyos de verdad se discute. El verso del encabezado es uno de los que se le atribuyen.',
    practica: 'La flor y el canto: el canto también enseña a leer y a pensar. Con Nezahualcóyotl, la casa del canto pinta códices y abre el calmécac a los jóvenes del barrio que cantaron.',
    obras: [
      { titulo: 'León-Portilla, Trece poetas del mundo azteca (UNAM)', año: '1967' },
      { titulo: 'Lee, The Allure of Nezahualcoyotl: Pre-Hispanic History, Religion, and Nahua Poetics (University of New Mexico Press)', año: '2008' }
    ]
  },
  hunayn: {
    nombre: '🌙 Hunayn ibn Ishaq', años: '809–873 · el taller de los traductores',
    cita: 'Una traducción mal hecha es peor que ninguna.',
    resumen: () => `🌙 <b>El taller</b>: cada traducción por el sentido forma a un aprendiz (hoy la mesa tiene <b>${asientosMesa()} asientos</b>, ${Math.min(2, S.taller || 0)} de ellos del taller), y las revisiones tardan la mitad.`,
    ficha: 'Hunayn ibn Ishaq, médico cristiano de Hira, tradujo al siríaco y al árabe casi toda la obra de Galeno, y la Biblia, y a Platón y a Aristóteles. Traducía por el sentido, cotejaba varios manuscritos de la misma obra para corregir el texto antes de traducirlo, y formó en su taller a su hijo Ishaq y a su sobrino Hubaysh. ⚖️ Que al-Mamún le pagaba el peso de sus libros en oro lo cuenta Ibn Abi Usaybia siglos después: es más leyenda que dato.',
    bio: 'Médico y traductor nestoriano de Bagdad, llamado «el jeque de los traductores». En una carta cuenta cómo buscó un manuscrito griego de Galeno por Mesopotamia, Siria, Palestina y Egipto, y solo encontró la mitad en Damasco. ⚖️ La frase del encabezado resume su método; no es una cita textual.',
    practica: 'El taller: traducir deja de ser un trabajo de uno y pasa a ser una escuela. Con Hunayn, cada traducción por el sentido forma a un aprendiz que se sienta a la mesa.',
    obras: [
      { titulo: 'Bergsträsser, Ḥunain ibn Isḥāq über die syrischen und arabischen Galen-Übersetzungen (la Risala de Hunayn)', año: '1925' },
      { titulo: 'Gutas, Greek Thought, Arabic Culture (Routledge)', año: '1998' }
    ]
  },
  hipatia: {
    nombre: '📜 Hipatia', años: '~355–415 d. C. · la clase abierta',
    cita: 'Defiende tu derecho a pensar: hasta pensar mal es mejor que no pensar.',
    resumen: () => `📜 <b>La clase abierta</b>: los que aprenden a medias también aprenden de lo catalogado (hoy <b>+${Math.round(claseAbierta() * 100)}</b> puntos de rendimiento).`,
    ficha: 'Hipatia enseñó matemática, astronomía y filosofía en Alejandría, en su casa y en la calle, a quien quisiera escucharla. Editó con su padre, Teón, los textos que se estudiaban (los Elementos que todavía leemos vienen de la edición de Teón). En el 415 la mató una turba, en una pelea de poder entre el obispo y el prefecto de la ciudad.',
    bio: 'Matemática y filósofa neoplatónica, hija del matemático Teón. La fuente más cercana, Sócrates Escolástico, cuenta que se ponía el manto de los filósofos y explicaba a Platón y a Aristóteles a quien quisiera oírla. ⚖️ La cita del encabezado es apócrifa: se le atribuye desde el siglo XX.',
    practica: 'La clase abierta: lo catalogado deja de ser solo para quien lee. Con Hipatia, los aprendices que nadie atiende también aprenden del fondo de la Biblioteca.',
    obras: [
      { titulo: 'Sócrates Escolástico, Historia eclesiástica VII 15', año: '~440 d. C.' },
      { titulo: 'Dzielska, Hypatia of Alexandria (Harvard University Press) · ISBN 978-0-674-43776-0', año: '1995' }
    ]
  },
  socrates: {
    nombre: '🏛️ Sócrates', años: '~470–399 a. C. · el maestro que no responde',
    cita: 'No creo saber lo que no sé.',
    resumen: () => `🏛️ <b>La mayéutica</b>: la aporía también forma: cada respuesta que un aprendiz produce adelanta la formación de un maestro.`,
    ficha: 'Sócrates no escribió nada y no cobró nunca. Enseñaba preguntando en la plaza, la palestra y la calle, hasta que el otro descubría que no sabía, y después, a veces, que sabía. Atenas lo condenó a muerte en el 399 a. C. por corromper a los jóvenes con preguntas.',
    bio: 'Filósofo ateniense, hijo de una partera. Lo conocemos por sus alumnos, sobre todo Platón, que lo hizo protagonista de sus diálogos. Su método (la mayéutica, «el arte de la partera») es la primera pedagogía que pone la respuesta en quien aprende y no en quien enseña.',
    practica: 'La mayéutica: preguntar en vez de decir. Con Sócrates en el ágora, cada aporía resuelta adelanta además la formación del maestro que está aprendiendo a preguntar.',
    obras: [
      { titulo: 'No escribió nada: lo escribieron sus alumnos', año: '' },
      { titulo: 'Platón, Menón (ed. Lamb, Loeb) y Teeteto 149a–151d', año: '~385 a. C.' }
    ]
  },
  ptahhotep: {
    nombre: '🪷 Ptahhotep', años: '~2400 a. C. · el primer pedagogo',
    cita: 'No te enorgullezcas de tu saber: consulta tanto al ignorante como al sabio.',
    resumen: () => `🪷 <b>El arte de escuchar</b>: la paleta se vuelve diálogo: cada devolución en rojo además forma al aprendiz que la recibe.`,
    ficha: 'Ptahhotep, visir del faraón Dyedkara-Isesi (~2400 a. C.), escribió las «Instrucciones»: consejos de un maestro viejo a su sucesor. Es el tratado pedagógico más antiguo que conservamos, y empieza por la humildad.',
    bio: 'Visir y sabio del Reino Antiguo egipcio. Sus máximas (escuchar antes de hablar, no humillar al que aprende, consultar a todos) se copiaron en las escuelas del Nilo durante mil años: el primer manual del buen maestro.',
    practica: 'El arte de escuchar: la misma paleta, otra pedagogía: la corrección roja deja de ser marca y se vuelve diálogo que forma a quien la recibe.',
    obras: [
      { titulo: 'Las Instrucciones (sebayt)', año: '~2400 a. C.' },
      { titulo: 'Trad.: Lichtheim, Ancient Egyptian Literature I (California, 1973)', año: 1973 }
    ]
  },
  enheduanna: {
    nombre: '🌙 Enheduanna', años: '~2285 a. C. · la primera autora',
    cita: 'Yo, Enheduanna, compuse este canto: lo que se canta de noche, que el escriba lo copie al mediodía.',
    resumen: () => `🌙 <b>La firma de la autora</b>: lo escrito con nombre propio enseña +20%, para siempre. Y su himno deja eco: hasta la próxima noche, cada copia corregida cuenta doble para la mano.`,
    ficha: 'Enheduanna (~2285 a. C.), suma sacerdotisa de la luna en Ur e hija de Sargón de Acad, es la primera persona de la historia que firmó lo que escribió. Sus himnos se copiaron en las edubbas durante siglos: fue autora, editora y plan de estudios a la vez.',
    bio: 'Poeta y sacerdotisa acadia. Sus 42 himnos a los templos y sus cantos a Inanna se convirtieron en modelos escolares: generaciones de aprendices de escriba aprendieron a escribir copiándola. La primera voz con nombre propio de la literatura universal es la de una maestra.',
    practica: 'La firma de la autora: +20% de aprendizaje permanente; y el eco del himno: cantado de noche, cada copia corregida hasta la noche siguiente cuenta doble para la mano.',
    obras: [
      { titulo: 'La exaltación de Inanna', año: '~2285 a. C.' },
      { titulo: 'Los himnos de los templos', año: '~2285 a. C.' }
    ]
  },
  abuela: {
    nombre: '🔥 La Abuela', años: 'la primera maestra',
    cita: 'Cuando muere un anciano, arde una biblioteca entera.',
    resumen: () => `🔥 <b>La memoria viva</b>: la Abuela acompaña a 4 aprendices, y sus historias de la velada hacen rendir más al clan.`,
    ficha: 'La primera maestra de la humanidad no tuvo nombre ni título: tuvo memoria. Durante decenas de miles de años, todo lo que sabíamos vivió en ancianas y ancianos que lo contaban junto al fuego.',
    bio: 'Arquetipo de la transmisión oral: la educación existió durante milenios sin escritura, sin aula y sin escuela, sostenida por la memoria del clan y el arte de contar. El proverbio de su cita lo popularizó el sabio maliense Amadou Hampâté Bâ.',
    practica: 'La memoria viva: el relato sostiene el círculo, la Abuela acompaña a los que aprendían a medias y cada historia de la velada hace rendir más al clan.',
    obras: []
  },
  dewey: {
    nombre: '🎩 John Dewey', años: '1859–1952',
    cita: 'La educación no es preparación para la vida; la educación es la vida misma.',
    resumen: () => `🌱 <b>Aprender haciendo</b>: el huerto y el pozo enseñan como ${BALANCE.dewey.unidades} alumnos.`,
    ficha: 'John Dewey (1859–1952) puso el hacer en el centro con su escuela-laboratorio de Chicago (1896): se aprende haciendo, y reflexionando sobre lo hecho.',
    bio: 'Filósofo y pedagogo estadounidense, padre de la educación progresista. En su escuela-laboratorio de la Universidad de Chicago (1896) puso la experiencia en el centro: se aprende haciendo, y reflexionando sobre lo hecho.',
    practica: 'Aprender haciendo: el huerto y el pozo enseñan como 4 alumnos más.',
    obras: [
      { titulo: 'Democracia y educación', año: 1916 },
      { titulo: 'Experiencia y educación', año: 1938 }
    ]
  },
  skinner: {
    nombre: '🎩 B. F. Skinner', años: '1904–1990',
    cita: 'La educación es lo que sobrevive cuando lo aprendido se olvida.',
    resumen: () => `📦 <b>Instrucción programada</b>: los alumnos desatendidos rinden al 75%… y el ánimo máximo baja a 90%.`,
    ficha: 'B. F. Skinner (1904–1990), conductismo radical: el refuerzo moldea la conducta. Sus máquinas anticiparon el software educativo, y también su límite: la eficiencia no es sentido.',
    bio: 'Psicólogo estadounidense, máximo exponente del conductismo radical: el refuerzo moldea la conducta. Sus máquinas de enseñanza (1954), de ritmo individual y refuerzo inmediato, son el antepasado directo del software educativo.',
    practica: 'Instrucción programada: los desatendidos rinden al 75%, pero el ánimo máximo baja a 90%.',
    obras: [
      { titulo: 'La conducta de los organismos', año: 1938 },
      { titulo: 'Tecnología de la enseñanza', año: 1968 }
    ]
  },
  freire: {
    nombre: '🎩 Paulo Freire', años: '1921–1997',
    cita: 'Nadie educa a nadie; nadie se educa solo.',
    resumen: () => `🔥 <b>Educación popular</b>: la kermesse rinde +50% y la radio dominada se vuelve diálogo (+3 alumnos equivalentes).`,
    ficha: 'Paulo Freire (1921–1997), Pedagogía del Oprimido (1968): alfabetizar es leer el mundo, no solo la palabra. La educación popular latinoamericana nace aquí.',
    bio: 'Pedagogo brasileño, referente mundial de la educación popular. Alfabetizó enseñando a "leer el mundo": la palabra como herramienta para entender y transformar la propia realidad.',
    practica: 'Educación popular: la kermesse rinde +50% y la radio dominada se vuelve diálogo (+3).',
    obras: [
      { titulo: 'La educación como práctica de la libertad', año: 1967 },
      { titulo: 'Pedagogía del oprimido', año: 1968 }
    ]
  }
};
/* ---------- LOS SECRETOS (docs/secretos-plan.md, «dale» del usuario el 2026-10-02) ----------
   «Lo que se enseñaba en secreto»: un huevo de pascua por época. Cada una abre el saber un poco más, y en cada una
   hubo también un saber que se guardaba para iniciados. Escondidos pero justos (de noche, en una estación, con un
   brillo tenue), reales y con fuente, con asombro y sin afirmar que la magia funcione, y sin tocar el balance.
   Los hallados se guardan en el gabinete del museo. El 3D pone cada uno en su época (src/epocas/). */
const SECRETOS = [
  { id: 'hechicero', era: 1, emoji: '🦌', titulo: 'El hechicero de la cueva',
    texto: 'En lo más hondo de la cueva de Trois-Frères, en los Pirineos, hace unos 15 000 años, alguien grabó y pintó una figura con cuernos de ciervo, ojos redondos de búho, barba, cola de caballo y piernas de hombre, que parece bailar. Henri Breuil la llamó «el hechicero». ¿Un chamán disfrazado, un espíritu, un cazador? ⚖️ Nadie lo sabe. Está donde casi no se llega, lejos de las pinturas que todos veían: lo que se aprendía allá abajo no se le mostraba a cualquiera, y no quedó escrito.',
    fuente: 'Bégouën y Breuil, Les cavernes du Volp: Trois-Frères, Tuc d\'Audoubert (Arts et Métiers Graphiques, 1958).' },
  { id: 'higado', era: 2, emoji: '🐑', titulo: 'El hígado de arcilla',
    texto: 'Para leer la voluntad de los dioses, el adivino abría una oveja sacrificada y miraba su hígado. Se aprendía como se aprendía a escribir: con maestro y con modelos de arcilla que marcaban cada parte y lo que anunciaba; en Mari, hacia el 1800 a. C., se guardaban decenas. Era un saber que pasaba de maestro a discípulo dentro de las familias de escribas, y siglos después sus tablillas cerraban con una advertencia: «Secreto de los grandes dioses: que el que sabe se lo muestre al que sabe; el que no sabe, que no lo vea». ⚖️ Lo que anunciaba el hígado era creencia; el cuidado con que se enseñaba, no.',
    fuente: 'Meyer, Untersuchungen zu den Tonlebermodellen aus dem Alten Orient (AOAT 39, 1987); Lenzi, Secrecy and the Gods (State Archives of Assyria Studies 19, 2008).' },
  { id: 'thot', era: 3, emoji: '📜', titulo: 'El Libro de Thot',
    texto: 'Un cuento egipcio de la época de los Ptolomeos habla del libro que Thot, el dios de la escritura, escribió con su propia mano: quien leyera sus dos conjuros entendería a los pájaros y a las fieras, y vería al sol subir al cielo con los dioses. Estaba en el fondo del río, en una caja de hierro, y dentro otra de bronce, y otra, y otra, hasta la de oro, rodeada de serpientes. El príncipe Setne Jamuas lo robó, lo pagó caro y tuvo que devolverlo. ⚖️ Es un cuento, pero dice algo cierto: en la Casa de la Vida había libros que no se le mostraban a nadie.',
    fuente: 'El relato de Setne Jamuas y Naneferkaptah (papiro demótico de El Cairo 30646), en Lichtheim, Ancient Egyptian Literature, vol. III (Univ. of California Press, 1980).' },
  { id: 'eleusis', era: 4, emoji: '🔥', titulo: 'Los Misterios de Eleusis',
    texto: 'Cada otoño, los iniciados salían de Atenas por el Camino Sagrado y llegaban de noche a Eleusis, con antorchas, a los Misterios de Deméter y Perséfone. Se entraba por grados: primero se era mysta y, un año después, si se volvía, epopta, «el que ha visto». Contar lo visto era un crimen que se podía pagar con la vida. Aristóteles dijo que los iniciados no iban a aprender algo, sino a vivirlo. ⚖️ Durante mil años lo guardaron tan bien que hoy nadie sabe qué se mostraba.',
    fuente: 'Aristóteles, fragmento 15 Rose (en Sinesio, Dión 8); Burkert, Ancient Mystery Cults (Harvard UP, 1987); Mylonas, Eleusis and the Eleusinian Mysteries (Princeton UP, 1961).' },
  { id: 'hermes', era: 5, emoji: '🐍', titulo: 'El uno es el todo',
    texto: 'En Alejandría se escribieron los libros de Hermes Trismegisto, «el tres veces grande»: el mismo Thot del libro escondido en el Nilo, vuelto sabio griego, que enseñaba de maestro a discípulo cómo está hecho el mundo. Ahí trabajaron también los primeros alquimistas: María la Judía inventó aparatos para destilar y calentar despacio (la tradición le atribuye el baño María), y la Crisopea de Cleopatra, una alquimista y no la reina, dibuja una serpiente que se muerde la cola con tres palabras adentro: ΕΝ ΤΟ ΠΑΝ, «el uno es el todo». Escribían en clave, para iniciados. ⚖️ Oro no fabricaron, pero sus hornos y alambiques pasaron a la química.',
    fuente: 'Zósimo de Panópolis, Sobre los aparatos y los hornos (~300 d. C.); Fowden, The Egyptian Hermes (Cambridge UP, 1986); Patai, The Jewish Alchemists (Princeton UP, 1994).' },
  { id: 'mitreo', era: 14, emoji: '🐂', titulo: 'Las siete gradas del mitreo',
    texto: 'Bajo una casa de Roma, por una escalera que baja a oscuras, estaba la cueva de Mitra: un salón largo y abovedado, con dos bancos a los lados para el banquete y, al fondo, la escena del dios que mata al toro, iluminada con lámparas. Solo entraban hombres, y se entraba por grados: siete, cada uno con su planeta y su prueba (el cuervo, el novio, el soldado, el león, el persa, el corredor del sol y el padre). Un currículo secreto, escalón por escalón, que nunca se escribió: lo conocemos por los mitreos que quedan, como el de Felicísimo en Ostia, con las siete gradas y sus símbolos en el mosaico del piso. ⚖️ Qué se enseñaba en cada grado, nadie lo sabe: lo que se juraba callar, se calló.',
    fuente: 'Beck, The Religion of the Mithras Cult in the Roman Empire: Mysteries of the Unconquered Sun (Oxford University Press, 2006); Clauss, The Roman Cult of Mithras: The God and His Mysteries (Edinburgh University Press, 2000).' },
  { id: 'ikhwan', era: 6, emoji: '🪔', titulo: 'Los Hermanos de la Pureza',
    texto: 'En Basora, en el siglo X, una hermandad sin nombres se reunía de noche, cada doce días, en la casa de uno de ellos. Escribieron cincuenta y dos epístolas, una enciclopedia de todo (los números, la música, los astros, el alma), y las firmaron solo como «los Hermanos de la Pureza y los Amigos de la Lealtad». Se leían en voz baja y se pasaban de mano en mano. ⚖️ Quiénes eran, nadie lo sabe con certeza: un viajero del siglo X dio unos nombres, y desde entonces se discute.',
    fuente: 'de Callataÿ, Ikhwan al-Safa\': A Brotherhood of Idealists on the Fringe of Orthodox Islam (Oneworld, 2005); Netton, Muslim Neoplatonists (Allen & Unwin, 1982).' },
  { id: 'ars', era: 21, emoji: '🌀', titulo: 'El Ars Magna de Llull',
    texto: 'De noche, en la cueva pintada, giran unos discos de papel, uno dentro de otro, con letras en los bordes. Es el arte de Ramon Llull, un mallorquín que hacia 1305 quiso una máquina para encontrar todas las verdades: cada letra es una idea (la bondad, la grandeza, la eternidad, el poder…) y, al girar los discos, salen todas sus combinaciones, una por una. Durante siglos se enseñó en círculos de lulistas como un arte oculto, y Giordano Bruno lo enseñó mezclado con el arte de la memoria. En 1666, un Leibniz de veinte años escribió su Disertación sobre el arte combinatorio pensando en esos discos, y soñó con un idioma en que discutir fuera calcular: por eso se cuenta a Llull entre los abuelos de la computación. ⚖️ Llull quería convertir a musulmanes y judíos con su máquina, y su arte no encontró ninguna verdad nueva: ordenaba las que ya creía tener.',
    fuente: 'Bonner, The Art and Logic of Ramon Llull: A User\'s Guide (Brill, 2007); Yates, The Art of Memory (Routledge, 1966); Leibniz, Dissertatio de arte combinatoria (1666).' },
  { id: 'elixir', era: 15, emoji: '☯️', titulo: 'El elixir interior',
    texto: 'De noche, en un templo taoísta, un maestro enseña a un solo discípulo a cocer el elixir, pero no en un horno: dentro del cuerpo. Durante siglos los alquimistas habían buscado la píldora de la inmortalidad, y más de un emperador murió envenenado con su mercurio; los maestros del neidan, la alquimia interior, dicen que el horno es el vientre, que los ingredientes son el aliento y la mente, y que el fuego se regula respirando. Zhang Boduan lo escribió en verso hacia 1075, en el Wuzhen pian, el «Despertar a la verdad», con un lenguaje cifrado que solo se entendía con un maestro al lado: se transmitía de boca a oreja. ⚖️ La inmortalidad no la encontró nadie; la respiración y la quietud se siguen enseñando.',
    fuente: 'Zhang Boduan, Wuzhen pian (~1075), en Pregadio (trad.), Awakening to Reality: The «Regulated Verses» of the Wuzhen pian (Golden Elixir Press, 2009); Robinet, Taoism: Growth of a Religion (Stanford University Press, 1997).' },
  { id: 'notoria', era: 8, emoji: '🕯️', titulo: 'El arte notoria',
    texto: 'En la época en que la campana inventó el horario, circulaba un libro que prometía saltárselo: el Ars notoria, «el arte de Salomón». Con oraciones en lenguas inventadas y unas figuras (las notae) que había que mirar en días señalados, en ayunas y a la luz de una vela, prometía aprender de golpe la gramática, la lógica, la retórica y todas las artes, sin maestro y sin estudiar. Los estudiantes pobres lo copiaban a escondidas. ⚖️ Tomás de Aquino lo condenó como superstición, y el arte siguió copiándose por tres siglos. Lo que se enseñaba en secreto, en París: el atajo.',
    fuente: 'Véronèse, L\'Ars notoria au Moyen Âge: introduction et édition critique (SISMEL, 2007); Fanger (ed.), Conjuring Spirits: Texts and Traditions of Medieval Ritual Magic (Penn State, 1998); Tomás de Aquino, Summa theologiae II-II, q. 96, a. 1.' },
  { id: 'espejo', era: 7, emoji: '🪞', titulo: 'El espejo que humea',
    texto: 'Tezcatlipoca, «el espejo que humea», tenía un espejo de obsidiana: en su negro se veía lo escondido, lo que fue y lo que vendría, y los sacerdotes del calmécac aprendían a mirar en él. Los espejos de obsidiana pulida se hacían en el valle de México. ⚖️ Tres siglos después, uno de ellos llegó a Inglaterra y John Dee, el mago de la reina Isabel, lo usó para hablar con los ángeles; hoy está en el Museo Británico, y los análisis dicen que su obsidiana es mexicana. El hilo de los secretos: de Thot a Hermes, de Hermes a Ficino y a Dee.',
    fuente: 'Olivier, Mockeries and Metamorphoses of an Aztec God: Tezcatlipoca, «Lord of the Smoking Mirror» (University Press of Colorado, 2003); Campbell et al., «The mirror, the magus and more: reflections on John Dee\'s obsidian mirror», Antiquity 95 (2021).' },
  { id: 'rosacruz', era: 9, emoji: '🌹', titulo: 'La rosa y la cruz',
    texto: 'En 1614 se imprimió en Kassel la Fama Fraternitatis: el anuncio de una hermandad secreta, la de la Rosa Cruz, fundada por un tal Christian Rosenkreutz, que guardaba un saber universal y que invitaba a los sabios de Europa a buscarla. Cientos respondieron con cartas impresas; nadie la encontró nunca. En 1623 aparecieron carteles en los muros de París anunciando que los rosacruces estaban en la ciudad, «visibles e invisibles». ⚖️ Johann Valentin Andreae, el autor que todos señalan, fue amigo y maestro de Comenio. Lo que se enseñaba en secreto, en la época de la imprenta: un secreto que se anunciaba con la máquina de hacer públicas las cosas.',
    fuente: 'Yates, The Rosicrucian Enlightenment (Routledge, 1972); Dickson, The Tessera of Antilia: Utopian Brotherhoods and Secret Societies in the Early Seventeenth Century (Brill, 1998).' },
  { id: 'logia', era: 10, emoji: '📐', titulo: 'La logia',
    texto: 'En la Santiago del siglo XIX, muchos de los que empujaban la escuela pública y laica se reunían en secreto, en las logias masónicas: una sala con el piso de damero, dos columnas a la entrada, la escuadra y el compás sobre un libro abierto y una vela. Ahí se juraba guardar silencio, y se discutía de todo: de la república, de la ciencia, de la escuela para todos. ⚖️ Su peso en la educación se discute: fue real en algunos, y exagerado por sus enemigos, que veían una logia detrás de cada escuela. Lo que se enseñaba en secreto, en la época de la escuela para todos: una sociedad discreta que quería que todo el mundo aprendiera.',
    fuente: 'Gazmuri, El «48» chileno: igualitarios, reformistas radicales, masones y bomberos (Editorial Universitaria, 1992).' },
];
function secretoHallado(id) { return (S.secretos || []).includes(id); }
function hallarSecreto(id, x, y) { // el toque sobre un secreto: la primera vez se guarda (destello, campanas); después se relee
  const s = SECRETOS.find(z => z.id === id); if (!s) return;
  const nuevo = !secretoHallado(id);
  if (nuevo) {
    S.secretos = (S.secretos || []).concat([id]);
    sfx.secreto();
    if (x != null) { fx.destellos.push({ born: performance.now(), x, y }); fx.anillos.push({ born: performance.now(), x, y }); }
    guardar();
  } else sfx.tap();
  setTimeout(() => abrirSecreto(s, nuevo), nuevo ? 900 : 0);   // primero el destello en el mundo; después, la tarjeta
}
function abrirSecreto(s, nuevo) {
  const el = $('secreto'); if (!el) return;                     // el 2D no tiene la tarjeta
  cerrarSuperficies();
  $('se-sello').textContent = s.emoji; $('se-titulo').textContent = s.titulo;
  $('se-texto').innerHTML = s.texto; $('se-fuente').textContent = s.fuente;
  const n = (S.secretos || []).length;
  $('se-cuenta').innerHTML = `<span class="puntos">${SECRETOS.map(z => secretoHallado(z.id) ? '●' : '○').join(' ')}</span>${n === 1 ? 'El primer secreto' : `${n} secretos`} de ${SECRETOS.length}, guardados en el gabinete del museo`;
  $('b-secreto').textContent = nuevo ? 'Guardarlo en el gabinete' : 'Cerrar';
  el.style.display = 'flex'; el.classList.remove('abre'); void el.offsetWidth; el.classList.add('abre');
}
function cerrarSecreto() {
  const el = $('secreto'); if (!el || el.style.display !== 'flex') return;
  el.style.display = 'none';
  if ((S.secretos || []).length === 1 && !S.vioSecreto) { S.vioSecreto = true; toast('🔮 <b>Lo que se enseñaba en secreto.</b> En cada época hay uno: de noche, en una estación, en un rincón que brilla. Los hallados esperan en el gabinete del museo (🏛️).', 11000); guardar(); }
}
const VISITAS = {
  bloom: {
    costo: 2.5e22, transicion: 20,   // llega con el tutor dominado y se recibe cuando alcanza (a medir con el bot: balance-epoca21.md)
    brindis: '🎯 El valle adopta <b>las dos sigmas</b>: un tutor para cada uno…',
    texto: `<i>«Lo que una persona en el mundo puede aprender, casi todas pueden aprenderlo, si se les dan las condiciones adecuadas.»</i> <small>(Human Characteristics and School Learning, 1976)</small><br><br>Un señor de anteojos se baja en la parada con una carpeta llena de gráficos. En el patio abre uno: dos campanas, una corrida bien a la derecha de la otra. «Esta es la clase de siempre, y esta, los que tuvieron un tutor para ellos solos. El problema nunca fue el tutor: es que no alcanzaban para todos.» Mira la chispa azul que acompaña a una estudiante, y se queda callado un rato.`
  },
  zhuxi: {
    costo: 2e16, transicion: 20,   // llega con los impresos (hacia el minuto 9) y se recibe enseguida (bot 2026-10-06; balance-epoca15.md, «Zhu Xi»): su regla vale para los que empiezan a leer con él
    brindis: '⛰️ Kaifeng adopta <b>el leer despacio</b>: estudiar para entender…',
    texto: `<i>«Los sabios de antes no enseñaban para que la gente memorizara y escribiera ensayos, y así pescara fama y un sueldo.»</i> <small>(Las reglas de la Gruta del Ciervo Blanco, 1180)</small><br><br>Un letrado de túnica sencilla entra a la sala de los clásicos. Viene de un siglo que todavía no llega: nació cuando Kaifeng ya había caído, y la conoce por los libros. Mira a los candidatos que recitan de memoria los ensayos impresos de Jianyang y dice: «Lean en orden, y de a poco. Lean hasta saberlo, y piénsenlo. Y después pregúntense qué tiene que ver con ustedes. El que entiende aprueba igual, y además sabe enseñar».<br><br><b>Adoptar el leer despacio</b>: la misma escuela, otra pedagogía: <b>estudiar para entender rinde como memorizar</b>, y <b>los que entienden enseñan mejor</b>. Estudiar deja de ser prepararse para la prueba, para siempre.`
  },
  quintiliano: {
    costo: 5e14, transicion: 20,   // llega con el rétor dominado (hacia el minuto 9) y se puede recibir hacia el 13 (bot 2026-10-05; balance-epoca14.md)
    brindis: '📕 Roma adopta <b>la escuela sin férula</b>: la alabanza y la emulación…',
    texto: `<i>«Que se azote a los que aprenden, no lo quisiera de ninguna manera: es cosa fea y de esclavos.»</i> <small>(Institutio I, 3, 14)</small><br><br>Un rétor de toga gastada entra al pórtico del ludus a la hora de la lección. Mira la férula colgada en la pared, mira a un niño que tiembla, y dice: «Si un niño no aprende con la alabanza, menos va a aprender con los golpes. Denles letras de marfil para jugar; háganlos competir, que el que gana se alegre y el que pierde quiera ganar. Y miren a cada uno: no hay dos iguales».<br><br><b>Adoptar la escuela sin férula</b>: la misma escuela, otra pedagogía: <b>el juego deja de ser lento</b> (avanza ×1,35, más del doble que antes), <b>el que pasa a tiempo arrastra a sus compañeros</b> (la emulación: +5 % de avance a los de su sala, si se enseña jugando) y <b>la férula pesa el doble en el ánimo</b>: ya todos saben que humilla. Con Quintiliano, enseñar jugando le gana a la férula.`
  },
  sarmiento: {
    costo: 5e21, transicion: 20,
    brindis: '🎒 Chile adopta <b>el educar al soberano</b>: cada escuela forma a sus monitores…',
    texto: `<i>«Hay que educar al soberano.»</i><br><br>Un hombre de patillas baja de la mula con un baúl de libros y entra a la Escuela Normal sin sacarse el poncho. Mira el mapa con las escuelas de los pueblos y dice: «No alcanza con mandar maestros. Cada escuela tiene que formar a los suyos: el niño que aprendió a leer enseña al que no. Y si el pueblo es el soberano, el soberano tiene que leer».<br><br><b>Adoptar el educar al soberano</b>: la misma escuela, otra pedagogía: <b>cada escuela de pueblo forma a sus monitores</b> (atienden a tres que aprendían a medias por escuela) y <b>los normalistas egresan más seguido</b>, para siempre.`
  },
  comenio: {
    costo: 6e19, transicion: 20,
    brindis: '🏫 Ámsterdam adopta <b>el todo a todos</b>: un libro, una clase, todos a la vez…',
    texto: `<i>«Nada hay en el entendimiento que antes no haya estado en los sentidos.»</i><br><br>Un viejo de barba blanca baja del barco con un baúl de manuscritos y entra a la escuela del barrio. Mira a los niños con sus cartillas, a las niñas sentadas a un lado, y dice: «Todos ellos pueden aprender, y todos juntos. No hace falta un maestro para cada uno: hace falta un libro igual para todos, con dibujos, y una clase».<br><br><b>Adoptar el todo a todos</b>: el mismo libro, otra pedagogía: <b>una cartilla sirve a una clase entera</b> (cada tres lectores atienden a uno que aprendía a medias) y el mercado de cartillas casi no se llena, para siempre.`
  },
  abelardo: {
    costo: 5.1e15, transicion: 20,   // 1/79 de cuando París iba después de Tenochtitlan (el orden de la cronología, balance-epoca8.md)
    brindis: '⚖️ París adopta <b>el sic et non</b>: dudando se llega a preguntar…',
    texto: `<i>«Dudando llegamos a preguntar; preguntando, alcanzamos la verdad.»</i><br><br>Un maestro joven cruza el Petit Pont con una nube de estudiantes detrás. Se para en la calle de la paja y abre un cuaderno: de un lado, lo que dicen las autoridades a favor; del otro, lo que dicen en contra. «No les voy a decir quién tiene razón. Para eso están ustedes: discutan, y lo que salga, enséñenlo.»<br><br><b>Adoptar el sic et non</b>: la misma disputa, otra pedagogía: <b>cada cuestión resuelta suma saber para toda la ciudad</b>, y en el tiempo de disputar se aprende como en el de leer. Disputar deja de ser un torneo y pasa a ser una manera de enseñar, para siempre.`
  },
  neza: {
    costo: 4.6e18, transicion: 20,   // ×77 de cuando Tenochtitlan iba después de Bagdad: lo que le dan los saberes de París (balance-epoca7.md)
    brindis: '🌺 Tenochtitlan adopta <b>la flor y el canto</b>: el canto también pinta…',
    texto: `<i>«¿Acaso de veras se vive con raíz en la tierra? No para siempre en la tierra: solo un poco aquí.»</i><br><br>Un señor con su manto de flores baja de la canoa y camina hasta la casa del canto. Escucha a los muchachos del barrio y dice: «Ese canto lo aprendieron en el telpochcalli, y lo cantan mejor que muchos del calmécac. Lo que se canta bien también se pinta. Que pinten.»<br><br><b>Adoptar la flor y el canto</b>: <b>cada canto de la tarde pinta un códice</b>, y un joven que salió del telpochcalli y cantó puede <b>pasar al calmécac</b> (la excepción que cuentan las fuentes), para siempre.`
  },
  hunayn: {
    costo: 1.5e14, transicion: 20,
    brindis: '🌙 Bagdad adopta <b>el taller de Hunayn</b>: traducir se aprende traduciendo…',
    texto: `<i>«Una traducción mal hecha es peor que ninguna.»</i><br><br>Un médico con un fajo de manuscritos de Galeno se sienta junto a la mesa de los traductores y lee por encima del hombro una frase traducida palabra por palabra. «En griego dice otra cosa. Busqué este libro por media Siria y solo encontré la mitad en Damasco. Dénme a un muchacho y le enseño: el oficio no se aprende solo.»<br><br><b>Adoptar el taller</b>: la misma mesa, otra pedagogía: <b>cada traducción por el sentido forma a un aprendiz</b>, que se sienta a traducir (hasta dos asientos más), y las revisiones tardan la mitad. Traducir deja de ser un trabajo y pasa a ser una escuela, para siempre.`
  },
  hipatia: {
    costo: 5e12, transicion: 20,
    brindis: '📜 Alejandría adopta <b>la clase abierta</b>: lo catalogado sale a la calle…',
    texto: `<i>«Hasta pensar mal es mejor que no pensar.»</i> <small>(⚖️ atribuida)</small><br><br>Una mujer con el manto de los filósofos se detiene en la puerta del Museo, con un rollo de Euclides bajo el brazo. «Tienen la mitad del mundo ordenada en estantes, y la otra mitad, afuera, sin saber que existe. Déjenme leerlo en voz alta en la calle: los libros no se gastan por usarlos.»<br><br><b>Adoptar la clase abierta</b>: el mismo fondo, otra pedagogía: <b>los que aprenden a medias también aprenden de lo catalogado</b>. La Biblioteca deja de ser solo para quien lee, para siempre.`
  },
  socrates: {
    costo: 3000000000, transicion: 20,
    brindis: '🏛️ El ágora adopta <b>la mayéutica</b>: el maestro pregunta, el que aprende responde…',
    texto: `<i>«No creo saber lo que no sé.»</i><br><br>Un hombre descalzo, chato y de barba, se sienta en el escalón de la stoa y le pregunta al grammatistes qué es enseñar. El grammatistes contesta. Él vuelve a preguntar. Al rato el grammatistes ya no sabe, y el hombre sonríe: «Ahora sí podemos empezar.»<br><br><b>Adoptar la mayéutica</b>: la aporía también forma: <b>cada respuesta que un aprendiz produce adelanta la formación de un maestro</b>. Preguntar enseña a los dos lados de la pregunta, para siempre.`
  },
  ptahhotep: {
    costo: 400000, transicion: 20,
    brindis: '🪷 La Casa de la Vida adopta <b>el arte de escuchar</b>: primero el oído, después la voz…',
    texto: `<i>«No te enorgullezcas de tu saber: consulta tanto al ignorante como al sabio.»</i><br><br>Un visir anciano cruza el patio apoyado en su bastón, levanta una lasca marcada en rojo y la mira largo rato. «Este rojo puede ser un golpe o puede ser una conversación. He visto a muchos maestros marcar. Los buenos, en cambio, escuchan lo que el error dice.»<br><br><b>Adoptar el arte de escuchar</b>: la misma paleta, otra pedagogía: <b>cada devolución en rojo además forma al aprendiz que la recibe</b>. La corrección se vuelve diálogo, para siempre.`
  },
  enheduanna: {
    costo: 30000, transicion: 20,
    brindis: '🌙 La edubba adopta <b>la firma de la autora</b>: lo aprendido se escribe y se canta…',
    texto: `<i>«Yo, Enheduanna, compuse este canto: lo que se canta de noche, que el escriba lo copie al mediodía.»</i><br><br>Una sacerdotisa llega desde el templo de la luna, con una tablilla propia bajo el brazo. «Sus alumnos copian listas de pájaros. Déjeme darles algo que quieran copiar: un canto con nombre y apellido.»<br><br><b>Adoptar la firma de la autora</b>: los textos con voz propia enseñan mejor. <b>+20% de aprendizaje</b>, para siempre. Y de noche cantará a Inanna: mientras el canto quede en el aire, <b>cada copia corregida cuenta doble para la mano</b>.`
  },
  abuela: {
    costo: 100, transicion: 20,
    brindis: '🔥 El clan adopta <b>la memoria viva</b>: la historia sostiene el círculo…',
    texto: `<i>«Cuando muere un anciano, arde una biblioteca entera.»</i> <small>(Amadou Hampâté Bâ, 1960)</small><br><br>Una anciana se sienta junto al fuego sin pedir permiso: el fuego siempre fue suyo. «Los pequeños no escuchan órdenes, pero nadie se levanta a mitad de una historia. Déjame contarla.»<br><br><b>Adoptar la memoria viva</b>: la Abuela acompañará a <b>4 aprendices</b> que hoy aprenden a medias, y cada historia nueva que cuente en la velada hará que el clan entero aprenda más. Para siempre.`
  },
  dewey: {
    costo: 2000, transicion: 30,
    brindis: '🎩→🌱 El aula adopta <b>aprender haciendo</b>. Se reorganiza el aula…',
    texto: `<i>«El aprendizaje no se recibe: se hace.»</i><br><br>El profesor <b>John Dewey</b> recorre el patio y se detiene frente al huerto: «Aquí hay más lecciones que en cualquier lámina, señora Rosa. Déjeme mostrarle lo que su aula puede enseñar cuando el hacer está en el centro.»<br><br><b>Adoptar «aprender haciendo»</b>: el huerto y el pozo enseñarán como <b>4 alumnos más</b>, para siempre. Reorganizar el aula tomará 30 s.`
  },
  skinner: {
    costo: 25000, transicion: 30,
    brindis: '🎩→📦 El aula adopta la <b>instrucción programada</b>. Se reorganiza el aula…',
    texto: `<i>«La educación es lo que sobrevive cuando lo aprendido se olvida.»</i><br><br>El profesor <b>B. F. Skinner</b> observa su máquina con orgullo: «Cada alumno a su ritmo, con refuerzo inmediato, sin esperar a nadie. Deme el aula y le devuelvo eficiencia.»<br><br><b>Adoptar la instrucción programada</b>: los alumnos que hoy aprenden a medias rendirán al <b>75%</b> (las máquinas los atienden)… pero el <b>ánimo máximo baja a 90%</b>: el refuerzo en dosis altas, aburre.`
  },
  freire: {
    costo: 25000, transicion: 30,
    brindis: '🎩→🔥 El aula adopta la <b>educación popular</b>. Se abre de noche…',
    texto: `<i>«Nadie educa a nadie; nadie se educa solo. Las personas se educan entre sí, mediatizadas por el mundo.»</i><br><br><b>Paulo Freire</b> llega conversando con los vecinos: "Su radio ya no debe hablarle al pueblo, señora Rosa: debe hablar <b>con</b> el pueblo. Abra el aula de noche."<br><br><b>Adoptar la educación popular</b>: la <b>kermesse rinde +50%</b> (la comunidad es parte de la educación) y, con la radio a pleno, la señal se vuelve diálogo: <b>+3 alumnos equivalentes</b>. Sutatenza, literal.`
  }
};
let visitaAbierta = null;
const nudgesDados = new Set(); // recordatorios del pensador que espera, por clave: cada uno UNA vez por sesión
function nudgeUnaVez(clave, texto) { if (!nudgesDados.has(clave)) { nudgesDados.add(clave); toast(texto, 14000); } }
let hudinfoTimer = null; // declarado aquí (y no junto a mostrarHudInfo) porque cerrarSuperficies lo limpia y vive antes
// OJO: comparar con 'flex', no con !== 'none'. Al arrancar, el display inline está VACÍO (el none viene
// del CSS) y un !== 'none' daba "hay modal" desde el primer frame, matando todos los clics del dock.
const visible = el => el.style.display === 'flex';
const hayModal = () => visible($('visita')) || visible($('victoria'));
function cerrarSuperficies() { // baja todo lo secundario: panel, ficha y glosario. Una sola superficie de decisión a la vez
  panelActivo = null;
  ocultarFicha();
  clearTimeout(hudinfoTimer); hudinfoTimer = null;
  const hi = $('hudinfo'); hi.style.display = 'none'; hi.style.opacity = '1';
}
let victoriaPendiente = false; // la victoria se abre SOLA desde tick: si hay visita, espera su turno en vez de apilarse
/* LA PORTADA Y EL AGRADECIMIENTO DEL DEMO (2026-09-07). La portada se abre sola en la primera partida
   (y en cada partida nueva) y desde el botón «?»; el agradecimiento, al cerrar la tarjeta de la última
   época publicada (ULTIMA_EPOCA), una sola vez. `CONTACTO_COMENTARIOS` es el enlace del botón «Dejar un
   comentario»: un mailto: o la URL de un formulario; vacío, el botón no se muestra y queda el texto. */
const CONTACTO_COMENTARIOS = 'mailto:invoco@luislastra.cl?subject=Lumbre'; // sin backend: abre el correo del visitante con el asunto puesto; la dirección se muestra también en texto
let graciasPendiente = false;
function abrirPortada(primera) {
  $('b-empezar').textContent = primera ? 'Empezar' : 'Volver al juego';
  $('portada').style.display = 'flex';
}
function cerrarPortada() {
  $('portada').style.display = 'none';
  if (S && !S.vioPortada) { S.vioPortada = true; guardar(); }
}
function abrirGracias() {
  const a = $('b-comentar'), d = $('gracias-direccion');
  if (CONTACTO_COMENTARIOS) { a.href = CONTACTO_COMENTARIOS; a.style.display = 'inline-block'; } else a.style.display = 'none';
  const correo = /^mailto:([^?]+)/.exec(CONTACTO_COMENTARIOS); // si el contacto es un correo, se lee también en texto (por si el navegador no abre el correo)
  d.innerHTML = correo ? `o escríbeme a <b>${correo[1]}</b>` : ''; d.style.display = correo ? 'block' : 'none';
  cerrarSuperficies(); renderHUD();
  $('gracias').style.display = 'flex';
  if (S && !S.vioGracias) { S.vioGracias = true; guardar(); }
}
function abrirVictoria() {
  if (visible($('visita'))) { victoriaPendiente = true; return; } // misma trampa del display inline vacío
  victoriaPendiente = false;
  cerrarSuperficies(); renderHUD();
  $('victoria').style.display = 'flex';
}
function pantallaVictoria(titulo, html) { // la pantalla con la que un arco de época se cierra (ARCO_EPOCAS en 15)
  document.querySelector('#victoria h2').textContent = titulo;
  $('v-texto').innerHTML = html;
  abrirVictoria();
}
function cerrarModales() { // baja TODO modal y su estado (reset, fundar generación, cambio de época)
  $('visita').style.display = 'none'; $('victoria').style.display = 'none'; $('gracias').style.display = 'none';
  visitaAbierta = null; victoriaPendiente = false; graciasPendiente = false;
}
function cerrarVisita() { // salida única del modal de visita: limpia el estado y suelta la victoria que esperaba
  $('visita').style.display = 'none';
  visitaAbierta = null;
  if (victoriaPendiente) abrirVictoria();
}
/* LA ELECCIÓN DE LA GUÍA (C5): el mismo modal que las visitas, con las dos maneras de enseñar */
function abrirEleccionGuia(k) {
  visitaAbierta = 'guia:' + k;
  cerrarSuperficies(); renderHUD();
  const n = LEX().nombres[k % LEX().nombres.length], medias = mediasSinGuia(k);
  $('vi-titulo').textContent = '🔥 ¿Cómo enseñará ' + n + '?';
  $('vi-texto').innerHTML = `Hay dos maneras de enseñar, y el clan ya conoce las dos: la cacería, que coordina a muchos, y la orilla, que le hace sitio a uno.<br><br>`
    + `<b>A muchos</b>: un corro de <b>${GUIA_CORRO}</b> aprendices, y la cacería y la cosecha traen un <b>25%</b> más de recursos: coordinar a muchos es el oficio de la partida y de la siega. Conviene cuando muchos aprenden a medias o faltan recursos.<br>`
    + `<b>De cerca</b>: <b>${GUIA_CERCA}</b> pequeños a su lado, que aprenden un <b>${Math.round(CERCA_PLUS * 100)}%</b> más. Conviene cuando casi todos ya tienen quien los atienda.<br><br>`
    + `Sin ${n}, ${medias === 0 ? 'nadie aprende' : medias === 1 ? '<b>1</b> aprendiz aprende' : `<b>${medias}</b> aprendices aprenden`} a medias. La elección es para siempre.`
    + fuenteHtml({ cita: 'Bloom, 1984', rev: 'Educational Researcher 13(6)', doi: '10.3102/0013189X013006004' });
  $('b-adoptar').textContent = `A muchos · ${GUIA_CORRO}`; $('b-adoptar').disabled = false;
  $('b-luego').textContent = `De cerca · ${GUIA_CERCA}`;
  $('visita').style.display = 'flex';
}
/* LA SEGUNDA ELECCIÓN DE ALEJANDRÍA ⚖️, en el mismo modal de las visitas: ¿qué se hace con los originales de los barcos? */
function abrirEleccionOriginales() {
  if (S.era !== 5) return;
  visitaAbierta = 'originales';
  cerrarSuperficies(); renderHUD();
  $('vi-titulo').textContent = '⚖️ ¿Qué hacemos con los originales?';
  $('vi-texto').innerHTML = `Los hombres del rey revisan cada barco que entra al Gran Puerto y se llevan sus libros a la Biblioteca. Allí se copian, y al dueño se le devuelve uno de los dos.<br><br>`
    + `<b>Quedarnos el original</b>: es el texto sin errores de copista y vale más para el fondo. Así lo hacía Ptolomeo, según Galeno; y a Atenas le pidió prestados los originales de Esquilo, Sófocles y Eurípides, dejó quince talentos en prenda y prefirió perderlos. Unos pocos no se notan; muchos, sí: la noticia corre por los puertos y <b>los barcos vienen menos</b>.<br>`
    + `<b>Devolver el original y guardar la copia</b>: vale menos, pero <b>los barcos siguen viniendo confiados</b>.<br><br>`
    + `Las dos cosas pasaron. La elección se puede cambiar cuando quieras, tocando la barca del puerto.`
    + fuenteHtml({ cita: 'Bagnall, 2002', rev: 'Alexandria: Library of Dreams, Proceedings of the American Philosophical Society 146(4)' });
  $('b-adoptar').textContent = 'Quedarnos el original'; $('b-adoptar').disabled = false;
  $('b-luego').textContent = 'Devolverlo y guardar la copia';
  $('visita').style.display = 'flex';
}
/* EL CATÁLOGO (el gesto de Alejandría): el rollo del muelle con su autor y su pista, y los cuatro estantes de los
   Pínakes. Táctil primero: cuatro botones grandes. Vive en Lumbre 3D (#catalogo en jugar.html); el 2D no lo tiene. */
function abrirCatalogo() {
  const el = $('catalogo'); if (!el || !puedeCatalogar()) return false;
  cerrarSuperficies();
  const r = S.muelle[0], A = AUTORES_AL[r.a];
  $('ca-autor').textContent = A.n; $('ca-pista').textContent = A.e;
  $('ca-original').textContent = r.o ? 'el original' : 'la copia';
  $('ca-cuenta').textContent = rollosPend() > 1 ? `${rollosPend()} rollos esperan en el muelle` : 'el último rollo del muelle';
  const est = $('ca-estantes');
  if (!est.childElementCount) GENEROS_AL.forEach((G, g) => { const b = document.createElement('button'); b.className = 'estante'; b.dataset.g = g; b.innerHTML = `<span class="ico">${G.ico}</span><span>${G.n}</span>`; b.addEventListener('click', () => elegirEstante(g)); est.appendChild(b); });
  est.querySelectorAll('button').forEach(b => { b.disabled = false; b.classList.remove('bien', 'mal'); });
  el.style.display = 'flex'; el.classList.remove('abre'); void el.offsetWidth; el.classList.add('abre');
  return true;
}
function elegirEstante(g) {
  const est = $('ca-estantes'), r = S.muelle[0], A = r && AUTORES_AL[r.a];
  const ok = catalogar(g); if (ok === null) { cerrarCatalogo(); return; }
  est.querySelectorAll('button').forEach(b => { b.disabled = true; if (+b.dataset.g === g) b.classList.add(ok ? 'bien' : 'mal'); if (!ok && A && +b.dataset.g === A.g) b.classList.add('bien'); });
  setTimeout(() => { if (puedeCatalogar() && $('catalogo').style.display === 'flex') abrirCatalogo(); else cerrarCatalogo(); }, ok ? 650 : 1300);
}
function cerrarCatalogo() { const el = $('catalogo'); if (el) el.style.display = 'none'; }
/* TRADUCIR (Bagdad, el gesto): el manuscrito de la puerta de Kufa, con su obra, su autor y su lengua, y las dos maneras.
   Táctil primero: dos botones grandes. Vive en Lumbre 3D (#traducir en jugar.html); el 2D no lo tiene. */
function abrirTraducir() {
  const el = $('traducir'); if (!el || !mesaAbierta() || !manuscritosPend()) return false;
  const m = S.manuscritos[0], O = OBRAS_BA[m.o], libres = asientosLibres();
  $('tr-lengua').textContent = `${LENGUAS_BA[O.l]} en ${NOMBRE_LENGUA_BA[O.l]}${m.rev ? ' · vuelve para revisarse' : ''}`;
  $('tr-original').textContent = O.t;
  $('tr-obra').textContent = `${O.a}, ${O.o}`;
  $('tr-arabe').textContent = O.ar;
  $('tr-mesa').textContent = libres ? `${manuscritosPend()} manuscrito${manuscritosPend() === 1 ? '' : 's'} en la puerta · ${libres} asiento${libres === 1 ? '' : 's'} libre${libres === 1 ? '' : 's'} en la mesa` : 'La mesa está llena: espera a que un traductor termine.';
  const vl = valorObra(m, 'literal'), vs = valorObra(m, 'sentido');
  $('tr-literal').innerHTML = `<b>Palabra por palabra</b><small>${Math.round(duracionMetodo(m, 'literal'))} s · vale ${vl.toLocaleString('es')}${m.rev ? '' : ' · a veces vuelve'}</small>`;
  $('tr-sentido').innerHTML = `<b>Por el sentido</b><small>${Math.round(duracionMetodo(m, 'sentido'))} s · vale ${vs.toLocaleString('es')}</small>`;
  $('tr-literal').disabled = $('tr-sentido').disabled = !libres;
  el.style.display = 'flex';
  return true;
}
function elegirMetodo(metodo) {
  const ok = traducir(metodo); if (!ok) { cerrarTraducir(); return; }
  setTimeout(() => { if (puedeTraducir() && $('traducir').style.display === 'flex') abrirTraducir(); else cerrarTraducir(); }, 450);
}
function cerrarTraducir() { const el = $('traducir'); if (el) el.style.display = 'none'; }
/* LA PROMESA (Tenochtitlan, el gesto): el recién nacido con su nombre (y su signo, con la cuenta de los días), y las dos
   escuelas. Táctil primero: dos botones grandes. Vive en Lumbre 3D (#promesa en jugar.html); el 2D no lo tiene. */
function abrirPromesa() {
  const el = $('promesa'); if (!el || !telpoAbierto() || !nacidosPend()) return false;
  const c = S.nacidos[0], sig = SIGNOS_TE[c.s], dias = cuentaDias();
  $('pr-nombre').textContent = c.n;
  $('pr-quien').textContent = c.g === 'a' ? 'nació una niña en el barrio' : 'nació un niño en el barrio';
  $('pr-signo').innerHTML = dias ? `${sig.ic} día <b>${sig.n}</b> (${sig.es})${sig.e ? ` · su camino: <b>${sig.e === 'c' ? 'el calmécac' : 'el telpochcalli'}</b>` : ''}` : '<i>sin la cuenta de los días, nadie sabe leer su signo</i>';
  $('pr-palabra').textContent = `«Has venido a la tierra, ${c.g === 'a' ? 'hija mía, collar mío' : 'hijo mío, pluma preciosa'}…»`;
  const okC = puedePresentar('calmecac');
  $('pr-telpo').innerHTML = `<b>Al telpochcalli</b><small>la casa de los jóvenes · sin cupo · sale a trabajar (tequio)${dias && sig.e === 't' ? ' · ×2' : ''}</small>`;
  $('pr-calme').innerHTML = `<b>Al calmécac</b><small>${!calmecacAbierto() ? 'todavía no hay calmécac' : !calmecacLibre() ? `lleno (${plazasCalmecac()} lugares)` : (S.mats.amate || 0) < 1 ? 'falta un pliego de amate 🍂' : `${plazasCalmecac() - S.calme.length} lugar${plazasCalmecac() - S.calme.length === 1 ? '' : 'es'} · 1 🍂 · pintará códices${dias && sig.e === 'c' ? ' · ×2' : ''}`}</small>`;
  $('pr-calme').disabled = !okC;
  $('pr-cola').textContent = nacidosPend() > 1 ? `esperan ${nacidosPend()} en la casa de la partera` : '';
  el.style.display = 'flex';
  return true;
}
function elegirEscuela(esc) {
  const ok = presentar(esc); if (!ok) { cerrarPromesa(); return; }
  setTimeout(() => { if (nacidosPend() && telpoAbierto() && $('promesa').style.display === 'flex') abrirPromesa(); else cerrarPromesa(); }, 450);
}
function cerrarPromesa() { const el = $('promesa'); if (el) el.style.display = 'none'; }
/* EL HORARIO (París, el gesto): la campana parte el día en cuatro tiempos y en cada uno se elige la tarea. Táctil
   primero: una fila por tiempo con sus cuatro botones grandes; cada toque fija el horario al momento (la campana suena).
   Vive en Lumbre 3D (#horario en jugar.html); el 2D no lo tiene. */
function abrirHorario() {
  const el = $('horario'); if (!el || !campanaAbierta() || visitaAbierta) return false;
  if (!S.horario) fijarHorario(['leer', 'leer', 'leer', 'descansar']);
  const ahora = tiempoPa();
  $('ho-filas').innerHTML = TIEMPOS_PA.map((T, i) => `<div class="ho-fila${i === ahora ? ' ahora' : ''}"><div class="ho-t">${T.ic} <b>${T.n}</b><small>${T.hora}${i === ahora ? ' · ahora' : ''}</small></div><div class="ho-b">` +
    Object.keys(TAREAS_PA).map(k => `<button data-i="${i}" data-t="${k}" class="${S.horario[i] === k ? 'si' : ''}"${tareaPosible(k) ? '' : ' disabled'}>${TAREAS_PA[k].ic}<span>${TAREAS_PA[k].n}</span></button>`).join('') + '</div></div>').join('');
  const n = k => S.horario.filter(t => t === k).length;
  const ideas = [];
  ideas.push(`📖 leer: los estudiantes pagan la lección (la collecta, ~${fmt(Math.round(S.alumnos * (0.055 + 0.0055 * S.rep) * multAnimo() * DIA_PA / 4))} ${monIco()} por tiempo) y la ciudad aprende un <b>${Math.round((1.3 + 0.1 * nivelTec(58) - 1) * 100)}% más</b>`);
  ideas.push(scriptoriumAbierto() ? `✒️ copiar: un libro cada ${Math.round(COPIA_CADA / (1 + 0.15 * nivelTec(59)))} s, un pergamino cada uno (hay <b>${S.mats.pergamino || 0} 🐑</b>; <b>${S.libros || 0}</b> libros)` : '✒️ copiar: falta el scriptorium');
  ideas.push(disputaAbierta() ? `⚖️ disputar: una cuestión cada ${DISPUTA_CADA} s (esperan <b>${cuestionesPend()}</b>)${S.abelardo === 2 ? ', y se aprende como leyendo' : ''}` : '⚖️ disputar: falta la disputatio');
  ideas.push(`🍷 descansar: el ánimo vuelve (hoy <b>${Math.round(S.animo)} de ${animoMax()}</b>; cansados, todo rinde menos)${!n('descansar') ? ' · <b>nadie descansa</b>' : ''}`);
  $('ho-ideas').innerHTML = ideas.join('<br>');
  el.style.display = 'flex';
  return true;
}
function elegirTarea(i, t) {
  if (!S.horario) return;
  const h = S.horario.slice(); h[i] = t;
  if (fijarHorario(h)) { abrirHorario(); renderHUD(); guardar(); }
}
function cerrarHorario() { const el = $('horario'); if (el) el.style.display = 'none'; }
/* COMPONER (Ámsterdam, el gesto): las obras que se pueden imprimir, con lo que tarda cada una en componerse, lo que deja y
   cómo está su mercado. Táctil primero: una tarjeta grande por obra. Vive en Lumbre 3D (#componer en jugar.html). */
function abrirComponer() {
  const el = $('componer'); if (!el || !prensaAbierta() || visitaAbierta) return false;   // una decisión a la vez: con una visita abierta, la imprenta espera
  S.obrasVistas = Object.keys(OBRAS_AM).filter(k => obraAbierta(k));   // lo nuevo de la prensa ya se vio: el rótulo deja de insistir
  const F = S.forma;
  $('co-estado').innerHTML = !F ? 'La prensa está quieta.' : F.fase === 'componer' ? `En la prensa se compone ${OBRAS_AM[F.o].ic} <b>${OBRAS_AM[F.o].n}</b> (${Math.max(0, Math.round(compTiempo(F.o) - F.t))} s).` : `En la prensa: ${OBRAS_AM[F.o].ic} <b>${OBRAS_AM[F.o].n}</b>, ${F.tiradas} tirada${F.tiradas === 1 ? '' : 's'} · hay <b>${S.mats.pliego || 0} 📄</b>.`;
  $('co-obras').innerHTML = Object.entries(OBRAS_AM).map(([k, O]) => {
    const ok = obraAbierta(k), d = S.demanda[k] ?? 1, esta = F && F.o === k, pago = Math.round((O.pago[0] + O.pago[1] * S.rep) * d);
    const da = [`${fmt(pago)} ${monIco()} por tirada`]; if (O.lectores) da.push(`👓 +${O.lectores * (k === 'cartilla' && didacticaLista() ? 1.5 : 1)} lectores`); if (O.rep) da.push('⭐ renombre'); if (O.saber >= 20) da.push('📖 saber');
    return `<button data-o="${k}" class="${esta ? 'si' : ''}"${ok && !esta ? '' : ' disabled'}><span class="ic">${O.ic}</span><b>${O.n.replace(/^(un|una|el) /, '')}</b>` +
      `<small>${!ok ? `falta ${BALANCE.tecnologias[O.pide].nombre.toLowerCase()}` : esta ? 'en la prensa' : `se compone en ${Math.round(compTiempo(k))} s`}</small>` +
      `<small>${ok ? da.join(' · ') : O.dice}</small><span class="dem"><i style="width:${Math.round(d * 100)}%"></i></span><small class="dt">quién lo compra: ${d > 0.7 ? 'muchos' : d > 0.35 ? 'algunos' : 'casi nadie'}</small></button>`;
  }).join('');
  el.style.display = 'flex';
  return true;
}
function elegirObra(o) { if (componer(o)) abrirComponer(); }
function cerrarComponer() { const el = $('componer'); if (el) el.style.display = 'none'; }
/* EL MAPA (Santiago, el gesto): los pueblos del país, de norte a sur, con lo que tarda el viaje, cuántos niños tienen y qué
   paga su escuela; los que ya tienen escuela, y los que están en camino. Táctil primero: una tarjeta por pueblo, con la
   franja del país a un lado. Vive en Lumbre 3D (#mapa en jugar.html). */
function abrirMapa() {
  const el = $('mapa'); if (!el || !normalAbierta() || visitaAbierta) return false;
  $('ma-estado').innerHTML = `${S.normalistas ? `Esperan <b>${S.normalistas}</b> ${S.normalistas === 1 ? 'normalista' : 'normalistas'}` : 'No hay normalistas esperando: el próximo ya estudia'} · hay <b>${S.mats.pizarra || 0} 🪨</b> pizarras${S.viajes && S.viajes.length ? ` · en camino: <b>${S.viajes.length}</b>` : ''}.`;
  $('ma-franja').innerHTML = PUEBLOS_SA.map((P, i) => { const e = (S.escuelasSa || {})[i], v = (S.viajes || []).some(q => q.p === i); return `<i style="top:${(P.x * 100).toFixed(1)}%" class="${e ? 'si' : v ? 'va' : ''}" title="${P.n}"></i>`; }).join('');
  $('ma-pueblos').innerHTML = PUEBLOS_SA.map((P, i) => {
    const e = (S.escuelasSa || {})[i], n = e ? e.n : 0, va = (S.viajes || []).filter(q => q.p === i).length, ok = puedeMandar(i);
    const estado = n >= cuposPueblo() ? (n > 1 ? 'tiene sus dos escuelas' : 'ya tiene escuela') : va ? 'va un normalista en camino' : n ? 'falta la escuela de niñas' : '';
    return `<button data-p="${i}"${ok ? '' : ' disabled'} class="${n ? 'abierta' : ''}"><span class="ic">${P.ic}</span><b>${P.n}</b><small>${Math.round(viajeDur(i))} s de viaje · ${'👧'.repeat(Math.round(P.gente))} · paga ${'🏺'.repeat(Math.max(1, Math.round(P.paga)))}</small><small class="es">${estado || P.dice}</small></button>`;
  }).join('');
  el.style.display = 'flex';
  return true;
}
function elegirPueblo(i) { if (mandar(i) && S.normalistas > 0) abrirMapa(); else cerrarMapa(); }
function cerrarMapa() { const el = $('mapa'); if (el) el.style.display = 'none'; }
/* LAS TRES ESCUELAS (Roma, el gesto): las tres salas con sus alumnos, cada uno con su avance (la franja verde de la barra es
   «a tiempo»: de 0,9 a 1,2), su calidad (★) y adónde iría; y la férula o el juego por escuela. Tocar a un alumno lo pasa.
   Táctil primero: cada alumno es un botón grande. Vive en Lumbre 3D (#escuelas en jugar.html); el 2D no lo tiene. */
function abrirEscuelas() {
  const el = $('escuelas'); if (!el || !ludusAbierto() || visitaAbierta) return false;
  const quint = S.quintiliano === 2;
  $('es-estado').innerHTML = `Hay <b>${S.mats.calculi || 0} ⚪</b> calculi (pasar del ludus gasta uno) · <b>${S.letrados || 0}</b> letrados · <b>${S.oradores || 0}</b> oradores${vacacionesRo() ? ' · ☀️ vacaciones: se avanza más lento' : ''}.`;
  $('es-salas').innerHTML = SALAS_RO.map((Z, e) => {
    const abierta = salaAbierta(e), lista = (S.alumnosRo || []).map((a, i) => ({ a, i })).filter(x => x.a.e === e).sort((x, y) => y.a.p - x.a.p), M = metodoSala(e);   // los más adelantados primero
    const cab = `<header><span class="ic">${Z.ic}</span><span class="tit"><b>${Z.n}</b><small>${Z.quien} · ${Z.edad} · ${Z.que}</small></span><span class="cupo">${abierta ? `${lista.length}/${cupoSala(e)}` : 'cerrada'}</span></header>`;
    if (!abierta) return `<section class="sala cerrada">${cab}<div class="alumnos"><div class="vacio">Abre con ${minusNom(BALANCE.tecnologias[Z.tec].nombre)}.</div></div></section>`;
    const met = `<div class="metodo"><button data-e="${e}" data-m="juego" class="${M === 'juego' ? 'si' : ''}">🎲 El juego<small>${quint ? '×1,35' : '×0,65'} · sube el ánimo</small></button><button data-e="${e}" data-m="ferula" class="${M === 'ferula' ? 'si' : ''}">🪵 La férula<small>×1,5 · ${quint ? 'baja el ánimo ×2' : e > 0 ? 'baja ánimo y calidad' : 'baja el ánimo'}</small></button></div>`;   // arriba del ludus, la férula también cuesta calidad (los casos)
    const al = lista.length ? lista.map(({ a, i }) => {
      const no = porQueNoPasa(a), dest = destinoRo(a);
      const estado = a.p > aburreDesde() ? 'aburre' : a.p >= PASA_ENTERO ? 'listo' : a.p >= PASA_DESDE ? 'medias' : '';
      const adonde = dest === 'orador' ? 'a la basílica' : dest === 'egresa' ? 'termina' : e === 0 ? 'al grammaticus' : 'al rétor';
      const txt = no && no !== 'todavía no' ? no : a.p < 0 ? 'empezó atrasado' : a.p < PASA_DESDE ? `aprende · ${Math.round(a.p * 100)}%` : estado === 'aburre' ? `se aburre · ${adonde}` : estado === 'listo' ? `listo · ${adonde}` : `a medias · ${adonde}`;
      const w = Math.max(0, Math.min(1, a.p / 1.2)) * 100;
      return `<button class="alumno ${estado}" data-i="${i}"${no ? ' disabled' : ''}><span class="nom">${a.n}<i title="calidad">${'★'.repeat(a.q >= 0.95 ? 3 : a.q >= 0.8 ? 2 : 1)}</i></span><span class="barra"><em></em><i style="width:${w.toFixed(0)}%"></i></span><small>${txt}</small></button>`;
    }).join('') : `<div class="vacio">${e === 0 ? 'El pedagogo trae a los niños cuando hay lugar.' : 'Nadie todavía: llegan desde la escuela de abajo.'}</div>`;
    return `<section class="sala">${cab}${met}<div class="alumnos">${al}</div></section>`;
  }).join('');
  const nL = listosRo(), bl = $('b-escuelas-listos');   // el atajo: pasar de una vez a todos los que ya están listos (lo mismo que tocarlos uno por uno, de arriba hacia abajo)
  if (bl) { bl.disabled = nL === 0; bl.innerHTML = nL ? `⏩ Pasar a los listos · <b>${nL}</b>` : 'Nadie está listo todavía'; }
  el.style.display = 'flex';
  return true;
}
function elegirAlumno(i) { if (pasarAlumno(i)) abrirEscuelas(); }
/* PASAR A LOS LISTOS: pasa a todos los que están en la ventana (p ≥ PASA_ENTERO y con lugar), de la escuela de arriba
   hacia la de abajo y del más adelantado al menos (el rétor deja lugar al grammaticus y este al ludus), como el bot. No
   apura a nadie: los que van a medias se quedan. */
function pasarListos() {
  let n = 0;
  for (let vuelta = 0; vuelta < 60; vuelta++) {
    let elegido = -1;
    for (const e of [2, 1, 0]) {
      const x = (S.alumnosRo || []).map((a, i) => ({ a, i })).filter(x => x.a.e === e && x.a.p >= PASA_ENTERO && puedePasar(x.a)).sort((u, v) => v.a.p - u.a.p)[0];
      if (x) { elegido = x.i; break; }
    }
    if (elegido < 0 || !pasarAlumno(elegido)) break;
    n++;
  }
  abrirEscuelas();
  return n;
}
function elegirMetodoEscuela(e, m) { if (elegirMetodoRo(e, m)) abrirEscuelas(); }
function cerrarEscuelas() { const el = $('escuelas'); if (el) el.style.display = 'none'; }
/* LOS CANDIDATOS (Kaifeng, el gesto): el reloj del examen y los candidatos; los que esperan, con las tres maneras de
   prepararse (cada botón dice cómo le iría: aprueba, solo la prefectura o reprueba, y si llega al próximo examen); los que
   ya se preparan, con su avance. Tocar una manera la elige. El atajo «preparar a los que esperan» hace lo razonable
   (mejorModo). Táctil primero: cabe en 390 px y nada baja de 36 px. Vive en Lumbre 3D (#examen en jugar.html); el 2D no
   lo tiene (el toque en la escuela de la prefectura prepara a todos con lo razonable). */
function abrirExamen() {
  const el = $('examen'); if (!el || !prefecturaCh() || visitaAbierta) return false;
  const falta = examenEn(), L = listosCh(), C = candidatosCh(), E = candidatosEsperan();
  $('ex-reloj').innerHTML = `<span>📜 El examen${palacioCh() ? ' y el de palacio' : ''} en <b>${relojCh(falta)}</b></span><span class="barra"><i style="width:${(100 * (1 - falta / EXAMEN_CADA)).toFixed(0)}%"></i></span><small>se presentan los listos: <b>${L}</b></small>`;
  $('ex-estado').innerHTML = `🏛️ <b>${S.funcionarios || 0}</b> funcionarios${gobiernoBono() > 1.005 ? ` (la ciudad aprende un <b>${Math.round((gobiernoBono() - 1) * 100)}%</b> más)` : ''} · 🏫 <b>${S.maestrosAldea || 0}</b> maestros de aldea (atienden a ${S.aldeaAtiende || 0}) · ${C.length}/${cupoCandidatos()} candidatos${anonimoCh() ? '' : ' · 🌾 los de aldea, sin padrinos, rinden menos'}`;
  const est = c => '★'.repeat(c.t >= 0.3 ? 3 : c.t >= 0.15 ? 2 : 1);
  const que = (c, k) => { const n = nivelCh(c, k); return (n === 2 ? 'aprueba' : n === 1 ? 'solo prefectura' : 'reprueba') + (llegaCh(c, k) ? '' : ' · al otro'); };
  const esperan = C.map((c, i) => ({ c, i })).filter(x => !x.c.m), preparan = C.map((c, i) => ({ c, i })).filter(x => x.c.m).sort((u, v) => v.c.p - u.c.p);
  let h = '';
  if (esperan.length) h += `<h5>Esperan que elijas · ${esperan.length}</h5>` + esperan.map(({ c, i }) => `<section class="cand"><header><b>${c.n}</b><i title="talento">${est(c)}</i>${c.o === 'a' ? '<em>🌾 de aldea</em>' : ''}</header><div class="modos">${ORDEN_MODOS_CH.map(k => { const M = MODOS_CH[k], ab = modoAbierto(k), n = ab ? nivelCh(c, k) : -1; return `<button data-i="${i}" data-k="${k}" class="modo ${n === 2 ? 'ok' : n === 0 ? 'no' : ''}"${ab ? '' : ' disabled'} title="${M.que}">${M.ic} ${M.n}<small>${ab ? que(c, k) : 'abre con Hu Yuan'}</small></button>`; }).join('')}</div></section>`).join('');
  h += `<h5>Se preparan · ${preparan.length}</h5><div class="prep">` + (preparan.length ? preparan.map(({ c }) => {
    const M = MODOS_CH[c.m], listo = c.p >= 1, n = nivelCh(c, c.m);
    const txt = listo ? 'listo para el examen' : llegaCh(c, c.m) ? `${Math.round(c.p * 100)}% · llega` : `${Math.round(c.p * 100)}% · al otro examen`;
    return `<div class="cand-p ${listo ? 'listo' : ''}"><span class="nom">${M.ic} ${c.n}<i>${est(c)}</i></span><span class="barra"><i style="width:${(c.p * 100).toFixed(0)}%"></i></span><small>${txt} · ${n === 2 ? 'aprobaría' : n === 1 ? 'solo la prefectura' : 'reprobaría'}</small></div>`;
  }).join('') : '<div class="vacio">Nadie todavía: elige cómo se prepara cada uno.</div>') + '</div>';
  if (!C.length) h = '<div class="vacio">La escuela de la prefectura espera a sus candidatos: llegan cuando hay lugar.</div>';
  $('ex-lista').innerHTML = h;
  const bp = $('b-examen-preparar');
  if (bp) { bp.disabled = E === 0; bp.innerHTML = E ? `✍️ Preparar a los que esperan · <b>${E}</b> <small>a cada uno lo suyo</small>` : 'Nadie espera: todos se preparan'; }
  el.style.display = 'flex';
  return true;
}
function elegirModoCand(i, k) { if (elegirModo(i, k)) abrirExamen(); }
/* LOS QUE PREGUNTAN (el valle, el gesto, era21-plan): los que esperan con su pregunta (un dato o un porqué), con los dos
   botones (que responda / que pregunte, como un tutor: cada uno dice qué pasa), los que caminan pensando con su avance, y
   la revisión de las respuestas inventadas. El atajo «a cada uno lo suyo» hace lo razonable (mejorFu: el dato, respondido;
   el porqué, preguntado si hay atención). Táctil primero: cabe en 390 px y nada baja de 36 px. Vive en Lumbre 3D
   (#pregunta en jugar.html); el 2D no lo tiene (el toque en la escuela ayuda a todos con lo razonable). */
function abrirPregunta() {
  const el = $('pregunta'); if (!el || !escuelaFu() || visitaAbierta) return false;
  const D = dudasFu(), P = pensandoFu(), aten = S.mats.atencion || 0, err = S.erroresFu || 0, pOk = puedePreguntarFu();
  $('pq-estado').innerHTML = `❗ <b>${Math.round(S.entendidosFu || 0)}</b> entendieron${entendidosBono() > 1.005 ? ` (el valle aprende un <b>${Math.round((entendidosBono() - 1) * 100)}%</b> más)` : ''} · 💬 <b>${S.respondidosFu || 0}</b> entregaron · 🎯 atención: <b>${aten}</b>` +
    (err ? `<br>⚠️ <b>${err}</b> ${err === 1 ? 'respuesta inventada' : 'respuestas inventadas'} sin revisar: el valle aprende un <b>${Math.round((1 - confianzaBono()) * 100)}%</b> menos` : '');
  const rv = $('b-pregunta-revisar');
  rv.style.display = err ? 'block' : 'none'; rv.disabled = !revisarDisponibleFu();
  rv.innerHTML = `🔎 Revisar una respuesta inventada <small>${mesaRevisionFu() ? 'con la mesa de revisión' : (S.mats.atencion || 0) >= 1 ? 'cuesta 1 🎯' : 'falta atención 🎯'}</small>`;
  let h = '';
  if (D.length) h += `<h5>Esperan con su pregunta · ${D.length}</h5>` + D.map((d, i) => {
    const t = tipoDuda(d);
    return `<section class="duda"><header><b>${d.n}</b><em>${t === 'porque' ? '❔ un porqué' : '🔢 un dato'}</em>${d.l ? '<i>🌐 de lejos</i>' : ''}</header><q>${DUDAS_FU[d.q].q}</q>` +
      `<div class="modos"><button class="modo ${t === 'dato' ? 'ok' : ''}" data-i="${i}" data-m="responder">💬 Que responda<small>${t === 'dato' ? 'al instante: es buscar' : 'al instante · queda a medias'}</small></button>` +
      `<button class="modo ${t === 'porque' && pOk ? 'ok' : ''}" data-i="${i}" data-m="preguntar" ${pOk ? '' : 'disabled'}>❓ Que pregunte<small>${!tutorFu() ? 'todavía no hay tutor' : claroLlenoFu() ? 'el claro está lleno' : !pOk ? 'falta atención (2 🎯)' : t === 'porque' ? 'tarda · 2 🎯 · lo entiende' : 'tarda · 2 🎯 · entiende poco'}</small></button></div></section>`;
  }).join('');
  h += `<h5>Caminan pensando · ${P.length}${tutorFu() ? ` de ${claroFu()}` : ''}</h5><div class="prep">` + (P.length ? P.map(p => `<div class="cand-p"><span class="nom">❓ ${p.n}</span><span class="barra"><i style="width:${(p.p * 100).toFixed(0)}%"></i></span><small>${DUDAS_FU[p.q].q}</small></div>`).join('')
    : `<div class="vacio">${tutorFu() ? 'Nadie todavía: cuando la IA pregunta, el estudiante camina pensando hasta el claro.' : 'Con el tutor que pregunta, la IA podrá no dar la respuesta: preguntar, dar una pista y esperar.'}</div>`) + '</div>';
  if (!D.length && !P.length) h = '<div class="vacio">La escuela del valle espera a sus estudiantes: llegan con su pregunta cuando hay lugar.</div>';
  $('pq-lista').innerHTML = h;
  const ba = $('b-pregunta-todos');
  ba.disabled = !D.length;
  const loSuyo = !tutorFu() ? 'todos, respondidos: todavía no hay tutor' : puedePreguntarFu() ? 'el dato, respondido; el porqué, preguntado' : 'todos, respondidos: falta atención o lugar en el claro';   // lo que de verdad hará (mejorFu)
  ba.innerHTML = D.length ? `✨ A cada uno lo suyo · <b>${D.length}</b> <small>${loSuyo}</small>` : 'Nadie espera con su pregunta';
  el.style.display = 'flex'; pqFirma = firmaPregunta();
  return true;
}
function elegirFuCand(i, m) { if (elegirFu(i, m)) abrirPregunta(); }
function cerrarPregunta() { const el = $('pregunta'); if (el) el.style.display = 'none'; }
/* con el panel abierto, los que piensan avanzan a la vista. Solo se redibuja entero cuando cambia QUIÉN está (llega uno, se
   elige, alguien entiende, cambia la atención o las inventadas); si no, se mueven las barras en su lugar. Redibujarlo todo
   cada segundo de juego (cinco veces por segundo a ×5) cambiaba los botones bajo el dedo y se perdían los toques (QA) */
let pqFirma = '';
function firmaPregunta() { return [dudasFu().map(d => d.k).join(','), pensandoFu().map(p => p.k).join(','), S.mats.atencion || 0, S.erroresFu || 0, Math.round(S.entendidosFu || 0), S.respondidosFu || 0, claroLlenoFu()].join('|'); }
function refrescarPregunta(dt) {
  const el = $('pregunta'); if (!el || el.style.display !== 'flex') return;
  const f = firmaPregunta();
  if (f !== pqFirma) { pqFirma = f; abrirPregunta(); return; }
  const barras = el.querySelectorAll('.prep .cand-p .barra i'), P = pensandoFu();
  barras.forEach((b, i) => { if (P[i]) b.style.width = (P[i].p * 100).toFixed(0) + '%'; });
}
function cerrarExamen() { const el = $('examen'); if (el) el.style.display = 'none'; }
function abrirVisita(k) {
  cerrarComponer(); cerrarHorario(); cerrarPromesa(); cerrarMapa(); cerrarEscuelas(); cerrarExamen(); cerrarPregunta(); if (typeof cerrarTraducir === 'function') cerrarTraducir();   // los modales de los gestos no quedan debajo de la visita
  visitaAbierta = k;
  $('b-luego').textContent = 'Ahora no';
  cerrarSuperficies(); // una decisión a la vez: la visita no se apila sobre un panel abierto
  renderHUD();
  $('vi-titulo').textContent = S.era === 21 ? '🔥 Una visita al valle' : S.era === 1 ? '🔥 Una visita junto al fuego' : S.era === 2 ? '🏺 Una visita a la edubba' : S.era === 3 ? '🪷 Una visita a la Casa de la Vida' : S.era === 6 ? '🌙 Una visita a la Casa de la Sabiduría' : S.era === 7 ? '🌺 Una visita a Tenochtitlan' : S.era === 8 ? '🔔 Una visita a las escuelas de París' : S.era === 9 ? '🖨️ Una visita a Ámsterdam' : S.era === 10 ? '🎒 Una visita a la Escuela Normal' : S.era === 14 ? '🏛️ Una visita a las escuelas de Roma' : S.era === 15 ? '🏮 Una visita a las escuelas de Kaifeng' : S.era === 4 ? '🏛️ Una visita al ágora' : S.era === 5 ? '📜 Una visita al Museo' : '🎩 Una visita al aula';
  $('vi-texto').innerHTML = VISITAS[k].texto;
  $('b-adoptar').textContent = `Adoptar · ${fmt(VISITAS[k].costo)} 📖`;
  $('b-adoptar').disabled = S.apr < VISITAS[k].costo;
  $('visita').style.display = 'flex';
}

/* LO QUE CADA SABER HACE FUERA DE SU PORCENTAJE. El pilar del proyecto es "la mecánica es la lección":
   un saber cuyo único efecto es multTec tiene su lección encerrada en la ficha. Estos acoplamientos son
   pasivos (ningún verbo nuevo, ningún chip nuevo) pero tienen que poder LEERSE, o serían magia invisible.
   Solo se muestran en meseta: hasta que el clan no lo domina, el saber no reparte nada. */
function acopleHtml(i) {
  const pct = f => Math.round(f * 100);
  const txt = {
    10: () => `🌙 <b>Además:</b> el corro nocturno crece con su maestría, y con él el bono de la <b>velada</b>. La noche enseña más cuanto mejor se cuenten las historias.`,
    11: () => tamborRitmo() > 0 ? `🥁 <b>Además:</b> el ritmo sostiene la memoria de todos: aprender cualquier otro saber tarda un <b>${pct(tamborRitmo())}% menos</b>.` : null,
    12: () => rastroPinturas() > 0 ? `🖐️ <b>Además:</b> la pared guarda la manada, y lo retratado se reconoce en el rastro: la <b>cacería</b> avanza un <b>${pct(rastroPinturas() / CAZA_PASIVA)}% más rápido</b>.` : null,
    13: () => `🦴 <b>Además:</b> lo que el mundo deja sin contar se talla aquí, muesca a muesca. Cada una rinde <b>${fmt(muescaBono())} 📖</b> y deja al clan aprendiendo un <b>${pct(CUENTA_PASO)}% más rápido para siempre</b> (hoy <b>+${pct(multCuenta() - 1)}%</b>, tope +${pct(CUENTA_TOPE)}%). Cada cinco se cierran en una piedra.`,
    24: () => `🌾 <b>Además:</b> perfeccionarla engorda la <b>cosecha</b>: cada etapa suma un <b>50%</b> más de excedente al recogerla.`,
    25: () => `🐑 <b>Además:</b> cada anochecer el rebaño entra al cerco y hay que contarlo: deja <b>una cuenta</b> que tallar en el hueso.`,
    26: () => `🏺 <b>Además:</b> sin vasijas donde guardar no habría <b>granero</b>: es la cerámica la que hace posible el almacén y su <b>+15%</b> permanente.`,
    28: () => `🎣 <b>Además:</b> lo que saca el pequeño de la orilla <b>ya alimenta al clan</b>: cada sitio produce como un aprendiz más, trae <b>${fmt((4 + S.rep) * Math.max(1, diadas()))} ${monIco()}</b> cada 20 s (y lo pescado deja <b>una cuenta</b> para el hueso) y, si alguien estaba aprendiendo a medias, lo atiende. Hoy hay <b>${diadas()} de ${maxDiadas()}</b> sitios ocupados, y cada etapa abre uno más.`,
    27: () => telarReparto() > 0 ? `🧶 <b>Además:</b> «mientras uno siembra, otro teje»: el oficio repartido alcanza a quien no tiene guía, y los <b>desatendidos rinden el ${pct(extraEf())}%</b> en vez del ${pct(BALANCE.extraEficiencia)}%.` : null,
    16: () => tablillaCanasto() > 0 ? `🧱 <b>Además:</b> el canasto del taller amasa barro cada mañana: la <b>mesa de copia</b> junta ejercicios un <b>${pct(tablillaCanasto())}% más rápido</b>.` : null,
    17: () => calamoPulso() > 0 ? `✒️ <b>Además:</b> la mano se entrena con la buena herramienta: cada copia corregida mejora la <b>mano de la casa</b> un <b>${String(Math.round((0.02 + calamoPulso()) * 1000) / 10).replace('.', ',')}%</b> (la base es un 2%).` : null,
    22: () => kemytApuro() > 0 ? `✍️ <b>Además:</b> con el texto de arranque en la sala, los <b>ejercicios del patio</b> llegan un <b>${pct(kemytApuro())}% más seguido</b>: el currículo alimenta la piedra.` : null,
    31: () => `🪨 <b>Además:</b> el oficio de la piedra: cada práctica devuelta en rojo mejora los <b>papiros</b> un 2% para siempre (hoy <b>+${Math.round((oficioBono() - 1) * 100)}%</b>, tope +35%), y el maestro pide <b>${practicasPorPapiro()} práctica${practicasPorPapiro() > 1 ? 's' : ''} por papiro</b>: cuanto mejor la mano, menos borrador.`,
    33: () => nivelTec(33) > 0 ? `🕯️ <b>Además:</b> con más hojas de cera a mano, las <b>dudas del ágora</b> llegan un <b>${Math.round(10 * nivelTec(33))}% más seguido</b>.` : null,
    34: () => `🎼 <b>Además:</b> la música educa el ánimo: el tope sube <b>+${liraAnimo()}</b> y se recupera más rápido.`,
    35: () => `🏃 <b>Además:</b> el paidotribes atiende a muchos a la vez: cada maestro sostiene <b>${palestraSitio()} aprendiz${palestraSitio() > 1 ? 'es' : ''} más</b>.`,
    36: () => S.sofista ? `💰 <b>Además:</b> el sofista contratado atiende un círculo entero y trae a los hijos de los ricos: <b>los padres pagan un 30% más</b> por cada lección dicha y por el repertorio. Cobra <b>${fmt(sofistaCobro())} ${monIco()}</b> cada estación; si no alcanza, se va sin rencor; tocándolo, lo despides.` : `💰 <b>Además:</b> tócalo en su tarima para contratarlo: un maestro desde hoy, sin formación, que trae a los hijos de los ricos (<b>+30%</b> en lo que pagan los padres), por <b>${fmt(sofistaCobro())} ${monIco()}</b> cada estación. ⚖️ ¿Se puede vender el saber?`,
    37: () => `❓ <b>Además:</b> el repertorio: cada respuesta producida mejora lo que todo el ágora aprende un 1,5% para siempre (hoy <b>+${Math.round((repertorioBono() - 1) * 100)}%</b>, tope +30%) y trae padres que pagan por un maestro que hace pensar (renta cada 12 s; la Academia la duplica). Llevas <b>${S.respuestas || 0}</b> preguntadas y <b>${S.dichas || 0}</b> dichas: decir paga el misthós ahora, <b>${fmt(misthos())} ${monIco()}</b>.`,
    39: () => `🏛️ <b>Además:</b> los sabios residentes atienden sin que nadie los contrate: hoy <b>${museoSabios()} sabio${museoSabios() === 1 ? '' : 's'}</b> con su círculo (uno más por etapa), y la mesa común da <b>+${salaComun()} de ánimo</b> máximo. Con el Museo, el fondo renta entero.`,
    40: () => `⛵ <b>Además:</b> los barcos amarran ${marCerrado() ? '(ahora no: mar cerrado)' : 'cada tanto'} y los hombres del rey se llevan sus libros a copiar: cada copia gasta un 🌿 papiro. ${S.originales === 'quedar' ? 'Nos quedamos los originales (valen más, pero los barcos desconfían).' : S.originales === 'devolver' ? 'Devolvemos los originales y guardamos la copia (los barcos vienen confiados).' : 'Falta decidir qué hacemos con los originales: la barca del puerto pregunta.'}`,
    41: () => `🏷️ <b>Además:</b> el fondo: <b>${S.fondo || 0} rollo${(S.fondo || 0) === 1 ? '' : 's'}</b> catalogado${(S.fondo || 0) === 1 ? '' : 's'}, que mejoran lo que aprende toda la ciudad (hoy <b>+${Math.round((fondoBono() - 1) * 100)}%</b>, tope +30%) y rentan cada 12 s, porque los libreros copian lo que se encuentra.`,
    42: () => `📐 <b>Además:</b> con manual se enseña más rápido: formar maestros tarda un <b>${Math.round((1 - manualEuclides()) * 100)}% menos</b>, y los rollos de Matemática catalogados valen el doble.`,
    43: () => `🌞 <b>Además:</b> una vez por año, al mediodía del verano, la vara del patio pide que se mida su sombra: paga saber grande y renombre. ${S.sombras ? `Ya se midió ${S.sombras === 1 ? 'una vez' : S.sombras + ' veces'}.` : ''}`,
    45: () => `📜 <b>Además:</b> el papel es el material de la época (las luces del molino del canal): cada traducción se copia en una hoja para entrar a la biblioteca. Y lo escrito abarata enseñar: formar maestros tarda un <b>15% menos</b>. Perfeccionado, cada luz del molino trae más hojas: hoy, <b>${porLuz('papel')}</b>. Hay <b>${S.mats.papel || 0} 📜</b>.`,
    46: () => `📚 <b>Además:</b> las caravanas dejan manuscritos en la puerta de Kufa ${caravanasParadas() ? '(ahora no: con el calor del verano no viaja nadie)' : 'cada tanto (en primavera, más)'}: caben 6 en la puerta; si está llena, la caravana sigue de largo. ${manuscritosPend() ? `Hoy esperan <b>${manuscritosPend()}</b>.` : ''}`,
    47: () => `✒️ <b>Además:</b> la mesa de los traductores tiene <b>${asientosMesa()} asientos</b>. Palabra por palabra: rápido, vale 1, y una de cada dos vuelve para revisarse. Por el sentido: lento, vale 2,4. La biblioteca (<b>${S.traducidas || 0}</b> traducidas) mejora lo que aprende toda la ciudad (hoy <b>+${Math.round((bibliotecaBono() - 1) * 100)}%</b>, tope +30%) y los libreros la venden.`,
    48: () => `🕌 <b>Además:</b> de vez en cuando un estudiante termina su libro en la halqa y espera su ijaza: dársela lo vuelve repetidor, que atiende a 4 que aprendían a medias. La halqa atrae estudiantes: hoy vinieron <b>${halqaVienen()}</b> de lejos. Hoy hay <b>${S.muidin || 0} repetidor${(S.muidin || 0) === 1 ? '' : 'es'}</b> (tope ${MUIDIN_TOPE}).`,
    49: () => `⚖️ <b>Además:</b> una vez por estación, el cadí del zoco tiene un reparto de herencia que se resuelve con el álgebra: paga recursos y renombre${S.herencias ? ` (ya se resolvieron ${S.herencias})` : ''}. Y las traducciones de matemática y astronomía valen la mitad más.`,
    50: () => `🏫 <b>Además:</b> el waqf de la madrasa: los libreros rinden un <b>30% más</b> y los maestros cuestan un <b>20% menos</b>.`,
    51: () => `🍂 <b>Además:</b> el amate es el material de la época (las luces del embarcadero, donde las canoas del tributo dejan los pliegos): cada estudiante del calmécac gasta uno al entrar. Hay <b>${S.mats.amate || 0} 🍂</b>.`,
    52: () => `🛖 <b>Además:</b> nadie se queda sin escuela: con el telpochcalli, <b>todos los que aprenden están atendidos</b>. Y nacen niños en los barrios, que se prometen a una escuela: los del telpochcalli salen a trabajar para el barrio (el tequio, hasta <b>${tequioTope()}</b> trabajadores). Hoy estudian <b>${(S.telpo || []).length}</b> y trabajan <b>${Math.min(tequioTope(), S.egresTelpo || 0)}</b>${(S.egresTelpo || 0) > tequioTope() ? ' (las chinampas ya no dan para más: los que siguen, mejor al calmécac)' : ''}.`,
    53: () => `🔥 <b>Además:</b> el calmécac tiene <b>${plazasCalmecac()} lugares</b> (hoy ${(S.calme || []).length} ocupados) y cada estudiante gasta un pliego de amate. Los que salen pintan códices: hay <b>${Math.floor(S.codices || 0)}</b>; la ciudad aprende un <b>${Math.round((codiceBono() - 1) * 100)}% más</b> (tope 30%) y, como llevan la cuenta del tributo, las canoas traen un <b>${Math.round(Math.min(0.8, 0.03 * (S.codices || 0)) * 100)}% más</b> (tope 80%).`,
    54: () => `🥁 <b>Además:</b> una vez por día, de la tarde a la noche, la casa del canto espera a los jóvenes: el canto paga saber, los que estudian avanzan en su escuela y la noche que sigue se aprende un 12% más.${cantoDisponible() ? ' <b>Hoy todavía no se cantó.</b>' : ''}`,
    55: () => `📅 <b>Además:</b> cada recién nacido trae el signo de su día, que inclina a una escuela: si se le hace caso, aprende más rápido y rinde el doble.${S.signoBien ? ` Ya se siguió el signo <b>${S.signoBien}</b> ${S.signoBien === 1 ? 'vez' : 'veces'}.` : ''}`,
    56: () => `🗣️ <b>Además:</b> una vez por estación, el anciano dice la palabra antigua a los jóvenes (renombre y ánimo), y cada joven que sale de una escuela se despide con ella (renombre).`,
    87: () => `🏡 <b>Además:</b> llegan estudiantes con su pregunta (caben <b>${cupoDudas()}</b>, uno más por etapa): <b>toca la escuela y elige cómo los ayuda la IA</b>. Si nadie elige, la IA responde sola. Las familias pagan por lo que aprenden sus hijos: más por el que entendió que por el que solo entregó.`,
    88: () => `❓ <b>Además:</b> la IA puede no dar la respuesta: preguntar, dar una pista y esperar. Preguntar gasta dos de atención 🎯 y tarda${nivelTec(88) ? ' (un poco menos con cada etapa)' : ''}; el que vuelve con su «!» entendió: el valle aprende más por cada uno, y los que entendieron enseñan a los que estaban a medias.`,
    89: () => `🌐 <b>Además:</b> llegan estudiantes de lejos (uno de cada tres), más seguido, y caben <b>${2 + nivelTec(89)}</b> más: la IA les traduce la clase.${S.lejosFu ? ` Ya llegaron <b>${S.lejosFu}</b>.` : ''}`,
    90: () => `🔎 <b>Además:</b> la biblioteca inventa menos: un porqué respondido viene inventado el <b>${Math.round(pInventa() * 100)}%</b> de las veces${nivelTec(90) >= 3 ? ', y con la mesa de revisión revisar no gasta atención' : '; con la mesa de revisión (la última etapa), revisar no gastará atención'}.`,
    91: () => `🎙️ <b>Además:</b> cada dos minutos, la defensa: cada uno que entendió desde la anterior deja renombre, y la defensa descubre una respuesta inventada y la corrige.${S.defensasFu ? ` Van <b>${S.defensasFu}</b>.` : ''}`,
    92: () => `🔭 <b>Además:</b> el mirador mira la niebla: lo que todavía no sabemos. Es el último saber del viaje.`,
    81: () => `🖌️ <b>Además:</b> llegan los candidatos al examen (caben <b>${cupoCandidatos()}</b>, uno más por etapa): <b>toca la escuela de la prefectura y elige cómo se prepara cada uno</b>. Si nadie elige en un rato, la escuela lo prepara como siempre, de memoria. El examen llega cada estación; el que aprueba se vuelve funcionario (renombre, gobierna: la ciudad aprende más, hoy un <b>${Math.round((gobiernoBono() - 1) * 100)}%</b>, y manda a casa su sueldo mientras gobierna: hoy, entre todos, <b>${fmt(Math.round(sueldoCh() * EXAMEN_CADA))} ${monIco()}</b> por estación) y el que reprueba enseña en una escuela de aldea. Y la tinta es el material de la época (las luces del horno de hollín, junto a los pinos al pie de la muralla): la imprenta de los clásicos pide dos barras para crearse. Hay <b>${S.mats.tinta || 0} ⚫</b>.`,
    82: () => `📘 <b>Además:</b> con los clásicos impresos, estudiar de memoria toma un 30% menos${nivelTec(82) >= 3 ? '; y con los modelos de Jianyang (⚖️), un 15% menos todavía, y aprueba más: hasta el flojo pasa la capital' : '; en la tercera etapa llegan los modelos de ensayo de Jianyang (⚖️)'}.`,
    83: () => `🧭 <b>Además:</b> abre las dos salas: la de los asuntos (el agua, la aritmética y la defensa: aprueba menos, pero si aprueba manda a casa más que el que memorizó, y si reprueba la aldea le paga por medir sus campos) y la de los clásicos, donde se estudia <b>para entender</b> (más lento, y el flojo no aprueba; pero el que aprueba manda a casa casi el triple, deja más renombre y la ciudad aprende más con él). ⚖️ A cada uno lo suyo: el talentoso a entender, el flojo de memoria.`,
    84: () => `🔏 <b>Además:</b> con el nombre tapado y la letra copiada, los de aldea ya no rinden un nivel menos, y vienen más (caben dos candidatos más; dos de cada tres, de aldea).`,
    85: () => `⛰️ <b>Además:</b> la academia: leer despacio con el maestro. Cada etapa sube un poco la nota del que estudia para entender${S.zhuxi === 2 ? ', y con Zhu Xi el que empieza a leer así tarda lo mismo que el que memoriza y aprueba igual' : ', y con ella llega un letrado de un siglo después, Zhu Xi'}.`,
    86: () => `🐉 <b>Además:</b> el examen de palacio: los que aprueban la capital escriben ante el emperador, que no reprueba a nadie y ordena la lista. Figurar en ella da más renombre. Funcionarios: <b>${S.funcionarios || 0}</b>.`,
    75: () => `🪔 <b>Además:</b> el ludus abre las escuelas: el pedagogo trae a los niños cuando hay lugar (caben <b>${cupoSala(0)}</b>) y cada uno avanza hasta estar listo para pasar. <b>Toca las escuelas y pásalos</b>: a tiempo rinde; apurado llega a medias; retenido, se aburre. Pasar del ludus gasta un calculus (hay <b>${S.mats.calculi || 0} ⚪</b>: las luces de la orilla del Tíber), y los padres pagan en los idus por cada alumno.`,
    76: () => `🧮 <b>Además:</b> con el ábaco, el ludus avanza un <b>30% más rápido</b>${nivelTec(76) >= 2 ? ', y cada luz de la orilla trae un calculus más' : ''}.`,
    77: () => `📜 <b>Además:</b> abre la segunda escuela (caben <b>${cupoSala(1)}</b>). Los que pasan por ella son letrados: hay <b>${S.letrados || 0}</b>, y la ciudad aprende un <b>${Math.round((letradosBono() - 1) * 100)}% más</b> (tope +25%).`,
    78: () => `🗣️ <b>Además:</b> abre la tercera escuela (caben <b>${cupoSala(2)}</b>). El que la termina es orador: defiende su primer caso en la basílica Julia, gana renombre y sus clientes pagan según lo bien que aprendió. Ya hay <b>${S.oradores || 0}</b> oradores.`,
    79: () => `🪙 <b>Además:</b> las tres escuelas tienen la mitad más de lugares, y los padres y los clientes de los oradores pagan un 30% más.`,
    80: () => `📕 <b>Además:</b> el maestro mira a cada uno: los alumnos tardan más en aburrirse.`,
    69: () => `🧑‍🏫 <b>Además:</b> los monitores: cada uno atiende a diez que aprendían a medias (hoy <b>${monitoresSa()}</b>; uno más por etapa). La pizarra es el material de la época (las luces de la estación de la diligencia): cada normalista lleva las suyas. Hay <b>${S.mats.pizarra || 0} 🪨</b>.`,
    70: () => `🎒 <b>Además:</b> la Escuela Normal egresa un normalista cada tanto: <b>toca la Escuela Normal y elige su pueblo en el mapa</b>. El viaje tarda; cuando llega, su escuela hace lectores y paga cada tanto. ${S.normalistas ? `Esperan <b>${S.normalistas}</b>.` : ''} ${S.viajes && S.viajes.length ? `En camino: <b>${S.viajes.length}</b>.` : ''} Escuelas abiertas: <b>${escuelasAbiertas()}</b>.`,
    71: () => `📖 <b>Además:</b> con el silabario, las escuelas de los pueblos hacen la mitad más de lectores. Hay <b>${Math.floor(S.lectoresSa || 0)} lectores</b>: la ciudad aprende un <b>${Math.round((alfabetoBono() - 1) * 100)}% más</b> (tope ${kinderListo() ? 45 : 30}%).`,
    72: () => `👩‍🏫 <b>Además:</b> egresan más seguido (también las preceptoras), y cada pueblo puede tener su escuela de niños y su escuela de niñas.`,
    73: () => `📜 <b>Además:</b> la escuela gratuita, pagada por el Estado: las escuelas de los pueblos pagan la mitad más y sus niños aprenden más rápido.`,
    74: () => `🧸 <b>Además:</b> el juego: el ánimo máximo sube diez, y los lectores rinden más (tope +45%).`,
    63: () => `📄 <b>Además:</b> el pliego es el material de la época (las luces del molino de papel, sobre el bastión): cada tirada de la prensa gasta uno. Hay <b>${S.mats.pliego || 0} 📄</b>.`,
    64: () => `🖨️ <b>Además:</b> <b>toca la imprenta y elige qué componer</b>. Componer tarda (la prensa espera); una vez armada la forma, cada tirada sale sola cada ${Math.round(tiradaCada())} s y se vende según la demanda, que cae con cada tirada de lo mismo y vuelve sola. ${S.forma ? `En la prensa: ${OBRAS_AM[S.forma.o].ic} ${OBRAS_AM[S.forma.o].n}${S.forma.fase === 'componer' ? ' (se compone)' : ` (demanda ${Math.round((S.demanda[S.forma.o] ?? 1) * 100)}%)`}.` : 'La prensa está quieta.'}`,
    65: () => `🔤 <b>Además:</b> se pueden imprimir cartillas: cada tirada hace lectores (${didacticaLista() ? '3, en clase' : '2'}), y los lectores suben lo que aprende la ciudad (hoy <b>+${Math.round((lectoresBono() - 1) * 100)}%</b>, tope ${orbisListo() ? 45 : 30}%). Hay <b>${Math.floor(S.lectores || 0)} lectores</b>.`,
    66: () => `🗺️ <b>Además:</b> se pueden imprimir mapas: tardan en componerse y pocos los compran, pero cada tirada da saber y, cada dos, renombre.${S.mapas ? ` Ya se tiraron <b>${S.mapas}</b>.` : ''}`,
    67: () => `🏫 <b>Además:</b> la clase: el aula atiende a 8 que aprendían a medias, y las cartillas, en clase, hacen la mitad más de lectores.${S.comenio === 2 ? ` Con Comenio, los lectores atienden además a <b>${Math.min(40, Math.floor((S.lectores || 0) / 3))}</b>.` : ''}`,
    68: () => `🖼️ <b>Además:</b> se puede imprimir el Orbis Pictus: hace el doble de lectores que una cartilla y los lectores rinden más (tope +45%).`,
    57: () => `🐑 <b>Además:</b> el pergamino es el material de la época (las luces del taller del pergaminero, junto al Sena; en el verano, la feria del Lendit trae más): el scriptorium gasta uno por libro copiado. Hay <b>${S.mats.pergamino || 0} 🐑</b>.`,
    58: () => `🔔 <b>Además:</b> la campana parte el día en cuatro tiempos (la mañana, el mediodía, la tarde y la noche): <b>toca el campanario y arma el horario</b>. Leer: los estudiantes pagan la lección (la collecta) y la ciudad aprende un <b>${Math.round((1.3 + 0.1 * nivelTec(58) - 1) * 100)}% más</b> mientras dura. Descansar: el ánimo vuelve (cansados, todo rinde menos). ${S.horario ? `Hoy: ${S.horario.map((t, i) => TIEMPOS_PA[i].ic + ' ' + TAREAS_PA[t].n).join(' · ')}.` : ''}`,
    59: () => `✒️ <b>Además:</b> en el tiempo de copiar, el scriptorium copia un libro cada ${COPIA_CADA} s (un pergamino cada uno). La biblioteca tiene <b>${S.libros || 0} libros</b>: la ciudad aprende un <b>${Math.round((librosBono() - 1) * 100)}% más</b> (tope ${sorbonaLista() ? 45 : 30}%) y los estacionarios los alquilan por cuadernos (renta de ${monIco()}).`,
    60: () => `⚖️ <b>Además:</b> de vez en cuando llega una cuestión discutida (caben ${CUESTIONES_TOPE}); en el tiempo de disputar se resuelve una cada ${DISPUTA_CADA} s: paga ${monIco()}, saber y renombre. ${cuestionesPend() ? `Hoy esperan <b>${cuestionesPend()}</b>.` : ''}${S.resueltas ? ` Ya se resolvieron ${S.resueltas}.` : ''}`,
    61: () => `🎓 <b>Además:</b> de vez en cuando un bachiller aprueba su examen y espera la licencia en la sala de los maestros: dársela lo vuelve maestro, que abre su escuela (la ciudad aprende un 4% más por cada uno, tope ${LICENCIADOS_TOPE}) y atiende a 5 que aprendían a medias. Hoy hay <b>${S.licenciados || 0} licenciado${(S.licenciados || 0) === 1 ? '' : 's'}</b>.`,
    62: () => `🏛️ <b>Además:</b> el colegio de la Sorbona trae ocho estudiantes pobres con techo y biblioteca: los libros rinden más (tope +45%) y los estacionarios, un 30% más.`,
    44: () => `📖 <b>Además:</b> lo que se busca se encuentra: los rollos perdidos vuelven al muelle en ${perdidoDur()} s y el fondo renta un <b>30% más</b>.`,
    38: () => `🫒 <b>Además:</b> los que más respuestas produjeron enseñan: hoy <b>${discipulos()} discípulo${discipulos() === 1 ? '' : 's'}</b> como maestro${discipulos() === 1 ? '' : 's'} sin contratar (uno por cada 8 respuestas, tope ${1 + nivelTec(38)}).`,
    20: () => (S.papiros || 0) > 0 ? `📃 <b>Además:</b> el archivo guarda <b>${S.papiros} papiro${S.papiros > 1 ? 's' : ''}</b> y la ciudad los CONSULTA: rinden <b>${fmt(Math.round(Math.min(16, S.papiros) * (3 + 0.6 * S.rep) * (S.tecs[32] && S.tecs[32].fase === 'meseta' ? 1 : 0.5)))} ${monIco()}</b> cada 12 s${S.tecs[32] && S.tecs[32].fase === 'meseta' ? '' : ' (el doble con la Casa de la Vida)'}. Lo escrito trabaja.` : null
  }[i];
  const s = txt && txt();
  return s ? `<div class="acople">${s}</div>` : '';
}
function renderPanel() {
  const p = $('panel');
  if (!panelActivo) { p.style.display = 'none'; p.__html = ''; return; }
  p.style.display = 'block';
  p.style.bottom = (Math.max($('dock').offsetHeight + 26, $('abajo').offsetHeight + 14)) + 'px'; // siempre sobre el dock, mida lo que mida (y en el celular vertical, sobre la fila de controles que va encima del dock: tapaba el botón del panel, QA 2026-09-28)
  const nombres = LEX().fases;
  let html = '', accion = null;
  if (panelActivo.tipo === 'tec') {
    const i = panelActivo.i, T = BALANCE.tecnologias[i], t = S.tecs[i], b = T.bono, perm = T.era === 14 ? 'mientras dure Roma' : T.era === 15 ? 'mientras dure Kaifeng' : 'permanente';   // las escuelas de Roma rinden en Roma, y las de Kaifeng en Kaifeng (bonoVive)
    const cuerpo = {
      sin: `Al aprender${pron(T.id)}: <b>+${Math.round(b * 100)}%</b> de aprendizaje.`,
      novedad: `¡Pico de curiosidad! <b>+${Math.round(b * BALANCE.novedadFactor * 100)}%</b>… por ${Math.ceil(t.t)} s más.`,
      valle: `Rinde <b class="delta-mal">−${Math.round(b * 100)}%</b>: ${LEX().valleTxt}`,
      formando: `Aún <b class="delta-mal">−${Math.round(b * 100)}%</b>, ${LEX().formandoTxt} <b>${Math.round(100 * (1 - t.t / (t.dur || T.formDur)))}%</b>`,
      meseta: (t.prof > 0) ? `<b class="delta-bien">+${Math.round(b * (1 + 0.5 * (t.nivel || 0)) * 100)}%</b> ${perm}. <i>Perfeccionando la etapa ${(t.nivel || 0) + 1}/3… ${Math.round(100 * (1 - t.prof / (t.profDur || Math.round(T.formDur * 0.7))))}%</i>` : (t.nivel || 0) >= 3 ? `<b class="delta-bien">+${Math.round(b * (1 + 0.5 * t.nivel) * 100)}%</b> ${perm}. Se domina por completo: las tres etapas están cerradas.` : `<b class="delta-bien">+${Math.round(b * (1 + 0.5 * (t.nivel || 0)) * 100)}%</b> ${perm} · perfección ${t.nivel || 0}/3.`
    }[t.fase];
    const badge = t.fase !== 'meseta' ? [t.fase, nombres[t.fase]] : (t.nivel || 0) >= 3 ? ['dominada', '🏅 ' + concuerda('DOMINADA', T.genero)] : (t.prof > 0) ? ['perfec', 'PERFECCIONANDO'] : ['meseta', concuerda(nombres.meseta, T.genero)];
    html = `<h3>${ICONOS[i]} ${T.nombre} <span class="año">${T.año}</span> <span class="fase ${badge[0]}">${badge[1]}</span></h3>
      <div class="cuerpo">${cuerpo}</div>
      ${t.fase === 'meseta' ? acopleHtml(i) : ''}
      ${t.fase === 'meseta' ? `<div class="ficha">📜 ${T.ficha}</div>` : ''}
      ${t.fase === 'meseta' ? fuenteHtml(FUENTES[i]) : ''}
      ${t.fase === 'sin' || t.fase === 'valle' || (t.fase === 'meseta' && (t.nivel || 0) < 3) ? '<button id="p-accion"></button>' : ''}`;
    if (t.fase === 'sin') { const mat = MAT_DE_TEC[i]; accion = { texto: `${LEX().comprar} · ${fmt(T.costo)} ${monIco()}` + (mat ? ` · ${MAT_COSTO}${emojiMat(mat)}` : ''), apagado: S.pre < T.costo || (mat && (S.mats[mat] || 0) < MAT_COSTO), fn: () => comprarTec(i) }; }
    if (t.fase === 'valle') accion = { texto: `${LEX().formar} · ${fmt(T.formCosto)} 📖`, apagado: S.apr < T.formCosto, fn: () => formarTec(i) };
    if (t.fase === 'meseta' && (t.nivel || 0) < 3 && !(t.prof > 0)) accion = { texto: `🔎 Perfeccionar (etapa ${(t.nivel || 0) + 1}/3) · ${fmt(profCosto(i))} 📖`, apagado: S.apr < profCosto(i), fn: () => profundizarTec(i) };
    // el pulido EN CURSO también es un botón (apagado, con su cuenta): antes desaparecía al pagarlo y
    // el clic se sentía perdido; tocarlo mientras tanto explica la espera en vez de callar
    if (t.fase === 'meseta' && t.prof > 0) accion = { texto: `🔎 Puliendo la etapa ${(t.nivel || 0) + 1}/3 · ${Math.ceil(t.prof)} s…`, apagado: true, espera: () => toast(`🔎 <b>${T.nombre}</b>: ${LEX().casa} ya pule esta etapa. En ${Math.ceil(t.prof)} s queda lista.`) };
  } else if (panelActivo.tipo === 'inv') {
    let costoInv, cab;
    if (S.era === 1) {
      costoInv = costoMilenios();
      cab = `<h3>⏳ Dejar pasar los milenios <span class="fase novedad">NUEVA ÉPOCA</span></h3>
      <div class="cuerpo">La memoria del clan ya no alcanza para todo lo que aprende: lo que no se usa se olvida. El tiempo hará el resto: la aldea se volverá ciudad… y en <b>Sumer</b>, la primera escritura, que guarda lo que ninguna memoria sostiene. La casa de las tablillas espera.${S.signo ? '' : ' Pero los milenios empiezan con una marca: <b>el signo</b>, que nace en el barro cuando tallas tú la próxima cuenta del hueso.'}</div>
      <button id="p-accion"></button>`;
    } else if (S.era === 2) {
      costoInv = BALANCE.investigacionSiglos;
      cab = `<h3>⏳ Dejar pasar los siglos <span class="fase novedad">NUEVA ÉPOCA</span></h3>
      <div class="cuerpo">Los siglos llevan a <b>Egipto</b>: la Casa de la Vida, el papiro, la tinta roja de los maestros y los tensadores de cuerda esperan junto al Nilo.</div>
      <button id="p-accion"></button>`;
    } else if (S.era === 3) {
      costoInv = BALANCE.investigacionAgora;
      cab = `<h3>⛵ Seguir el mar hacia Atenas <span class="fase novedad">NUEVA ÉPOCA</span></h3>
      <div class="cuerpo">Los rollos cruzan el mar hasta un puerto donde nadie dicta: en <b>Atenas</b> el maestro pregunta y el que aprende responde. El ágora espera, con su tablilla de cera, su lira, su palestra y un hombre descalzo que hace preguntas.</div>
      <button id="p-accion"></button>`;
    } else if (S.era === 4) {
      costoInv = BALANCE.investigacionAlejandria;
      cab = `<h3>⛵ Embarcar los rollos hacia Alejandría <span class="fase novedad">NUEVA ÉPOCA</span></h3>
      <div class="cuerpo">Pasa un siglo y medio. En la boca del Nilo, un rey quiere juntar todos los libros del mundo: <b>Alejandría</b>, con su Museo, su Biblioteca y los barcos que traen rollos de todo el mar.</div>
      <button id="p-accion"></button>`;
    } else if (S.era === 5) {
      costoInv = BALANCE.investigacionRoma;
      cab = `<h3>🏛️ Cruzar el mar hasta Roma <span class="fase novedad">NUEVA ÉPOCA</span></h3>
      <div class="cuerpo">Los barcos del grano llevan el trigo del Nilo a Ostia, y con ellos viajan los libros y los maestros griegos. En <b>Roma</b>, bajo los pórticos del Foro, la escuela se vuelve un camino: el ludus, el grammaticus y el rétor, una detrás de otra, y un maestro de Hispania que escribe contra la férula.</div>
      <button id="p-accion"></button>`;
    } else if (S.era === 14) {
      costoInv = BALANCE.investigacionBagdad;
      cab = `<h3>🌙 Dejar pasar siete siglos hasta Bagdad <span class="fase novedad">NUEVA ÉPOCA</span></h3>
      <div class="cuerpo">El papel llega de China por Samarcanda, y un califa funda junto al Tigris una ciudad redonda: <b>Bagdad</b>, con su Casa de la Sabiduría, sus caravanas de manuscritos y una mesa donde lo escrito en griego, en persa y en sánscrito se vuelve árabe.</div>
      <button id="p-accion"></button>`;
    } else if (S.era === 6) {
      costoInv = BALANCE.investigacionChina;
      cab = `<h3>🏮 Recorrer la Ruta de la Seda hasta Kaifeng <span class="fase novedad">NUEVA ÉPOCA</span></h3>
      <div class="cuerpo">Pasan dos siglos. El camino por el que el papel llegó a Bagdad se recorre al revés, por tierra y por mar, hasta la capital de los Song: <b>Kaifeng</b>, con su Pagoda de Hierro, una escuela en cada prefectura, los clásicos impresos y un examen con el nombre tapado, por el que se llega a gobernar estudiando.</div>
      <button id="p-accion"></button>`;
    } else if (S.era === 15) {
      costoInv = BALANCE.investigacionParis;
      cab = `<h3>🔔 Cruzar al otro extremo de la Ruta de la Seda: París <span class="fase novedad">NUEVA ÉPOCA</span></h3>
      <div class="cuerpo">En esos mismos años, al otro extremo de la Ruta de la Seda, lo que Bagdad tradujo al árabe empieza a pasar al latín en Toledo y sube hacia el norte. Junto al Sena, una abadía toca sus campanas a horas fijas y de la escuela de la catedral nace la universidad: <b>París</b>, con sus copistas, sus disputas y su colegio para estudiantes pobres.</div>
      <button id="p-accion"></button>`;
    } else if (S.era === 8) {
      costoInv = BALANCE.investigacionTenochtitlan;
      cab = `<h3>🌋 Cruzar el océano hasta Tenochtitlan <span class="fase novedad">NUEVA ÉPOCA</span></h3>
      <div class="cuerpo">Pasan tres siglos. Del otro lado del océano, en un mundo que Europa todavía no conoce, los mexicas fundan una ciudad sobre el agua en un lago entre volcanes: <b>Tenochtitlan</b>, con su Templo Mayor, sus canoas y una escuela en cada barrio, a la que van todos los niños.</div>
      <button id="p-accion"></button>`;
    } else if (S.era === 7) {
      costoInv = BALANCE.investigacionAmsterdam;
      cab = `<h3>🖨️ Dejar pasar dos siglos hasta la imprenta <span class="fase novedad">NUEVA ÉPOCA</span></h3>
      <div class="cuerpo">Una máquina de Maguncia multiplica los libros: lo que se compone una vez se imprime mil veces. En <b>Ámsterdam</b>, la ciudad de los canales, la casa Blaeu tiene nueve prensas, en cada barrio hay una escuela con su cartilla y llega un viejo que quiere enseñar todo a todos.</div>
      <button id="p-accion"></button>`;
    } else if (S.era === 9) {
      costoInv = BALANCE.investigacionFuturo;
      cab = `<h3>🔥 Dejar pasar casi cuatro siglos, hasta hoy <span class="fase novedad">LA ÚLTIMA ÉPOCA</span></h3>
      <div class="cuerpo">Entre las imprentas de Ámsterdam y hoy pasan la Ilustración, la Revolución Industrial, la escuela pública y el siglo XX: esas épocas todavía se están construyendo. El viaje salta hasta hoy y vuelve al principio: <b>el valle de la Época 1</b>, con su cueva pintada, su laguna y el círculo de piedras del fogón. Hay escuela otra vez junto al fuego, y una inteligencia artificial que responde lo que se le pregunte.</div>
      <button id="p-accion"></button>`;
    } else if (S.era === 9 && false) {   // Santiago salió del viaje (2026-10-05)
      costoInv = BALANCE.investigacionSantiago;
      cab = `<h3>🎒 Cruzar el océano hasta la escuela para todos <span class="fase novedad">NUEVA ÉPOCA</span></h3>
      <div class="cuerpo">Casi dos siglos después, al pie de la cordillera de los Andes, una república nueva quiere una escuela en cada pueblo: <b>Santiago de Chile</b>, con su escuela de monitores, la primera Escuela Normal de América Latina y un país largo adonde mandar a los maestros.</div>
      <button id="p-accion"></button>`;
    } else if (S.era === 10) {
      costoInv = BALANCE.investigacionImperios;
      cab = `<h3>⏳ Dejar pasar el siglo <span class="fase novedad">NUEVA ÉPOCA</span></h3>
      <div class="cuerpo">El tiempo salta hasta <b>1920: la era de la tiza</b>.</div>
      <button id="p-accion"></button>`;
    } else if (S.era === 11) {
      costoInv = BALANCE.investigacionEra2;
      cab = `<h3>📡 Investigar la Época ${numEpoca(12)} <span class="año">1935</span> <span class="fase novedad">NUEVA ÉPOCA</span></h3>
      <div class="cuerpo">Ondas y proyectores: la radio educativa, las filminas y el cine de 16 mm. El aula levantará su antena, y la <b>kermesse</b> ayudará a financiarla.</div>
      <button id="p-accion"></button>`;
    } else {
      costoInv = BALANCE.investigacionEra3;
      cab = `<h3>📺 Investigar la Época ${numEpoca(13)} <span class="año">1955</span> <span class="fase novedad">NUEVA ÉPOCA</span></h3>
      <div class="cuerpo">La caja mágica: el televisor educativo, la máquina de enseñanza y el retroproyector. <b>El aula crece</b>: tierra nueva, un salón anexo de ladrillo y un patio de juegos.</div>
      <button id="p-accion"></button>`;
    }
    html = cab;
    accion = { texto: S.era === 1 ? `Dejar pasar los milenios · la memoria llena (${fmt(costoInv)} 📖)` : S.era === 2 ? `Dejar pasar los siglos · ${fmt(costoInv)} 📖` : S.era === 3 ? `Seguir el mar · ${fmt(costoInv)} 📖` : S.era === 4 ? `Embarcar los rollos · ${fmt(costoInv)} 📖` : S.era === 5 ? `Cruzar el mar · ${fmt(costoInv)} 📖` : S.era === 14 ? `Dejar pasar los siglos · ${fmt(costoInv)} 📖` : S.era === 6 ? `Recorrer la Ruta de la Seda · ${fmt(costoInv)} 📖` : S.era === 15 ? `Cruzar al otro extremo · ${fmt(costoInv)} 📖` : S.era === 7 ? `Cruzar el océano de vuelta · ${fmt(costoInv)} 📖` : S.era === 8 ? `Cruzar el océano · ${fmt(costoInv)} 📖` : S.era === 9 ? `Dejar pasar los siglos, hasta hoy · ${fmt(costoInv)} 📖` : S.era === 10 ? `Dejar pasar el siglo · ${fmt(costoInv)} 📖` : `Investigar · ${fmt(costoInv)} 📖`, apagado: S.era === 1 ? !memoriaLlena() : S.apr < costoInv, fn: () => { investigar(); panelActivo = null; } };
    if (S.era === 1 && !S.signo) accion = { texto: '🦴 Falta el signo: talla la próxima cuenta', apagado: true, espera: () => toast('🦴 <b>Primero, el signo.</b> Cuando el mundo deje algo por contar (el rebaño entra al cerco al anochecer), toca el hueso: esa marca ya no cabe en él y nace en el barro.', 8000) };
  } else if (panelActivo.tipo === 'gen') {
    const g2 = S.generacion + 1;
    html = `<h3>🧬 Fundar la ${g2 + 1}ª generación <span class="fase novedad">PRESTIGIO</span></h3>
      <div class="cuerpo">La historia vuelve a empezar: el mundo regresa al fogón y hasta el fuego habrá que redescubrirlo. Pero lo vivido no se pierde: <b>cada generación aprende un 25% más rápido, para siempre</b>.<br><br>Bono actual: <b>+${S.generacion * 25}%</b> · al fundar: <b>+${g2 * 25}%</b></div>
      <button id="p-accion"></button>`;
    accion = { texto: 'Fundar la siguiente generación', apagado: false, fn: () => { fundarGeneracion(); panelActivo = null; } };
  } else if (panelActivo.tipo === 'pensador') {
    const k = panelActivo.k, PN = PENSADORES[k];
    html = `<h3>${PN.nombre} <span class="fase ${S.deweyT > 0 ? 'formando' : 'meseta'}">${S.deweyT > 0 ? 'REORGANIZANDO' : 'ADOPTADA'}</span></h3>
      <div class="cita">«${PN.cita}»</div>
      <div class="cuerpo">${S.deweyT > 0 ? `${(c => c.charAt(0).toUpperCase() + c.slice(1))(ordEra(S.era) >= 11 ? 'el aula' : LEX().casa)} se reorganiza… ${Math.ceil(S.deweyT)} s` : PN.resumen()}</div>
      <div class="ficha">📜 ${PN.ficha}</div>`;
  } else if (panelActivo.tipo === 'museo') {
    const EPOCAS_MUSEO = [[1, 'El fogón · la prehistoria'], [2, 'La casa de las tablillas · Sumer'], [3, 'La Casa de la Vida · Egipto'], [4, 'El ágora · Atenas'], [5, 'La Biblioteca · Alejandría'], [14, 'Las tres escuelas · Roma'], [6, 'La Casa de la Sabiduría · Bagdad'], [15, 'El examen · Kaifeng'], [8, 'El claustro y la universidad · París'], [7, 'Las escuelas del calpulli · Tenochtitlan'], [9, 'La imprenta · Ámsterdam'], [21, 'La pregunta abierta · hoy'], [10, 'La escuela para todos · Santiago'], [11, 'La era de la tiza · 1920'], [12, 'Ondas y proyectores · 1935'], [13, 'La caja mágica · 1955']];
    let cuerpo = '', piezas = 0;
    for (const [e, nomE] of EPOCAS_MUSEO) {
      const items = BALANCE.tecnologias.map((T, i) => ({ T, i })).filter(x => (x.T.era || 11) === e && S.tecs[x.i].fase === 'meseta');
      if (!items.length) continue;
      piezas += items.length;
      cuerpo += `<div class="sala">Época ${numEpoca(e)} · ${nomE}</div>` + items.map(x =>
        `<div class="pieza">${ICONOS[x.i]} <b>${x.T.nombre}</b> · ${x.T.año} · +${Math.round(x.T.bono * 100)}%<br><span>${x.T.ficha}</span>${FUENTES[x.i] ? fuenteHtml(FUENTES[x.i]) : ''}</div>`).join(''); // con su fuente, como el panel (E4 del QA completo; c20 de la auditoría)
    }
    const ideas = ['abuela', 'enheduanna', 'ptahhotep', 'socrates', 'hipatia', 'quintiliano', 'hunayn', 'zhuxi', 'abelardo', 'neza', 'comenio', 'sarmiento', 'bloom', 'dewey', 'skinner', 'freire'].filter(k => estadoPensador(k) === 2);
    if (ideas.length) {
      piezas += ideas.length;
      cuerpo += `<div class="sala">El ala de las Ideas</div>` + ideas.map(k =>
        `<div class="pieza">${PENSADORES[k].nombre.replace('🎩 ', '💡 ')}<br><span>${PENSADORES[k].ficha}</span></div>`).join('');
    }
    const hallados = SECRETOS.filter(z => secretoHallado(z.id));
    if (hallados.length) {                                     // EL GABINETE: aparece con el primer secreto hallado
      const pend = SECRETOS.filter(z => !secretoHallado(z.id) && ordEra(z.era) <= Math.max(ordEra(S.era), ...hallados.map(h => ordEra(h.era))));
      cuerpo += `<div class="sala gabinete">🔮 Lo que se enseñaba en secreto</div>` + hallados.map(z =>
        `<div class="pieza secreto">${z.emoji} <b>${z.titulo}</b> · Época ${numEpoca(z.era)}<br><span>${z.texto}</span><div class="fuente">📚 ${z.fuente}</div></div>`).join('') +
        pend.map(z => `<div class="pieza secreto falta">❔ <b>Un secreto de la Época ${numEpoca(z.era)}</b><br><span>Todavía no lo hallaste.</span></div>`).join('');
    }
    html = `<h3>🏛️ El museo escolar <span class="fase meseta">${piezas} PIEZAS</span></h3>
      <div class="cuerpo galeria">${cuerpo || 'Aún no hay piezas: domina saberes y adopta ideas; la historia se colecciona sola.'}</div>`;
  }
  if (p.__html !== html) { p.innerHTML = html; p.__html = html; } // no redibujar bajo el cursor sin necesidad
  const btn = $('p-accion');
  if (btn && accion) {
    // apagado NO es disabled nativo (callar ante un clic se siente roto): se ve apagado pero responde,
    // y al tocarlo delega en la consejera, que dice de dónde sacar lo que falta.
    btn.textContent = accion.texto; btn.disabled = false;
    btn.classList.toggle('apagado', !!accion.apagado);
    btn.onclick = accion.apagado
      ? () => { if (accion.espera) { accion.espera(); return; } if (consejoG) viajarA(consejoG); else flashChip('chip-doc'); }
      : () => { accion.fn(); if (panelActivo && panelActivo.tipo === 'tec') panelActivo = null; renderHUD(); guardar(); }; // hecho, se cierra (lista de cotejo E2)
  }
}

function renderHUD() {
  $('r-apr').textContent = fmt(S.apr);
  { const l = $('l-apr'), llena = S.era === 1 && S.fuegoDescubierto && S.apr >= memoriaTope() * 0.999; // la memoria del clan (C3)
    if (l) { if (!l.dataset.base) l.dataset.base = l.textContent; l.textContent = llena ? 'memoria llena' : l.dataset.base; l.classList.toggle('llena', llena); } }
  $('r-tasa').textContent = fmt1(tasa());
  const tn = tasaNormal(), tr = tasa(), comp = $('r-comp');
  if (tr < tn - 0.05) { comp.className = 'delta-mal'; comp.textContent = `▼ ${fmt1(tn)}`; }
  else if (tr > tn + 0.05) { comp.className = 'delta-bien'; comp.textContent = `▲`; }
  else comp.textContent = '';
  $('r-pre').textContent = fmt(S.pre);
  $('r-rep').textContent = S.rep;
  $('r-ani').textContent = Math.round(S.animo) + ' / ' + animoMax(); // el techo del ánimo es visible: nunca "más de 100%"
  const fog = ordEra(S.era) < 11;
  $('l-pre').textContent = fog ? 'Recursos' : 'Presupuesto';
  $('ico-pre').textContent = monIco(); // sin moneda acuñada antes de la escuela
  $('l-alu').textContent = fog ? 'Aprendices' : 'Alumnos';
  const mm = $('mats');
  if ((S.era === 1 && S.fuegoDescubierto) || S.era === 2) { // cada época muestra SUS materiales (Sumer: el barro del río)
    mm.style.display = 'flex';
    const mhtml = MATERIALES.filter(m => matDeEra(m, S.era) && (m.k !== 'grano' || S.edad >= 2)).map(m => `<span data-mat="${m.k}"><span class="num">${m.emoji} <b>${S.mats[m.k] || 0}</b></span><label>${m.n}</label></span>`).join('');
    if (mm.__html !== mhtml) { mm.innerHTML = mhtml; mm.__html = mhtml; } // no redibujar bajo el cursor sin necesidad
    if (!S.vioMats) { S.vioMats = true; toast('🧺 <b>Los materiales del clan.</b> Lo que el forrajeo junta se ve arriba a la derecha; toca cada uno para saber de dónde sale y para qué sirve.', 12000); }
  } else mm.style.display = 'none';
  const bien = alumnosBien(), extra = S.alumnos - bien;
  $('r-alu').innerHTML = S.alumnos + (extra > 0 ? ` <span class="delta-mal">(${extra} a medias)</span>` : '');
  const sinFuegoAun = ordEra(S.era) < 11 && !S.fuegoDescubierto; // las presentaciones esperan al fuego
  if (!sinFuegoAun && !S.vioHierbas && S.animo < animoMax() - 15 && S.apr >= BALANCE.te.costo) {
    S.vioHierbas = true;
    toast(`${LEX().te.split(' ')[0]} <b>El ánimo bajó</b> (míralo arriba a la derecha). Lo levantas con <b>${LEX().te}</b> del dock por ${BALANCE.te.costo} 📖: el bienestar también se cultiva.`, 11000);
  }
  if (!sinFuegoAun && !S.vioGuia && extra > 0 && S.pre >= costoDocente() && S.docentes < maxDocentes()) {
    S.vioGuia = true;
    toast(`👥 <b>${extra} aprenden a medias</b>: hay más pequeños que guías. Contrata en el dock (${fmt(costoDocente())} ${monIco()}) y cada ${LEX().docente.toLowerCase()} sostendrá su propio círculo.`, 12000);
  }
  const enValle = BALANCE.tecnologias.filter((T, i) => S.tecs[i].fase === 'valle');
  const av = $('alerta-valle');
  if (enValle.length) {
    av.style.display = 'block';
    const cierre = enValle.length > 1 ? (ordEra(S.era) >= 11 ? 'más lento con tanto aparato guardado' : 'más lento con tanto saber sin encender') : `más lento que antes de ${LEX().comprar.toLowerCase()}${pron(enValle[0].id)}`;
    av.innerHTML = `🕸️ <b>${enValle.map((T, k) => k ? T.nombre.charAt(0).toLowerCase() + T.nombre.slice(1) : T.nombre).join(' y ')}</b> ${enValle.length > 1 || /p$/.test(enValle[0].genero || '') ? 'juntan' : 'junta'} polvo: ${LEX().casa} aprende <b class="delta-aviso">${cierre}</b>. Usa «${LEX().formar}» desde el dock.`;
  } else av.style.display = 'none';
  const estAhora = (S.era === 1 && S.fuegoDescubierto) ? estacion() : null; // el año, dicho donde siempre se puede mirar
  $('era-chip').textContent = (S.generacion ? (S.generacion + 1) + 'ª generación · ' : '') + ({ 1: `Época ${numEpoca(1)} · El fogón · la prehistoria`, 2: `Época ${numEpoca(2)} · La casa de las tablillas · Sumer`, 3: `Época ${numEpoca(3)} · La Casa de la Vida · Egipto`, 4: `Época ${numEpoca(4)} · El ágora · Atenas`, 5: `Época ${numEpoca(5)} · La Biblioteca · Alejandría`, 14: `Época ${numEpoca(14)} · Las tres escuelas · Roma`, 6: `Época ${numEpoca(6)} · La Casa de la Sabiduría · Bagdad`, 15: `Época ${numEpoca(15)} · El examen · Kaifeng`, 7: `Época ${numEpoca(7)} · Las escuelas del calpulli · Tenochtitlan`, 8: `Época ${numEpoca(8)} · El claustro y la universidad · París`, 9: `Época ${numEpoca(9)} · La imprenta · Ámsterdam`, 21: `Época ${numEpoca(21)} · La pregunta abierta · hoy`, 10: `Época ${numEpoca(10)} · La escuela para todos · Santiago`, 11: `Época ${numEpoca(11)} · La era de la tiza · 1920`, 12: `Época ${numEpoca(12)} · Ondas y proyectores · 1935`, 13: `Época ${numEpoca(13)} · La caja mágica · 1955` })[S.era] || 'Época ' + numEpoca(S.era);
  if (estAhora) $('era-chip').textContent += ` · ${estAhora.ico} ${estAhora.n}`;
  { // la línea de progreso de época: qué falta, siempre a la vista
    const pe = $('progreso'), domP = i => S.tecs[i] && S.tecs[i].fase === 'meseta';
    const guiaSaber = lista => { // la guía apunta al primer saber pendiente: su escena en el mundo + su chip
      const i = lista.find(i2 => !domP(i2)); if (i === undefined) return null;
      const e = ESCENAS_SABER.find(e2 => e2.i === i);
      return { x: e && e.x, y: e && e.y, chip: 'chip-' + BALANCE.tecnologias[i].id };
    };
    let segs = null;
    guiaProg = null;
    if (S.era === 1 && !S.fuegoDescubierto) { segs = [['foco', '🪵 frota las varas: descubre el fuego']]; guiaProg = { x: 6.5, y: 9.5, chip: 'chip-varas' }; }
    else if (S.era === 1 && !S.ganadoF && S.edad < 2) {
      const n = saberesEpoca(1, 1).filter(domP).length;
      segs = [[n >= 6 ? 'ok' : 'foco', `🔥 saberes ${n}/6${n >= 6 ? ' ✓' : ''}`],
              [S.abuelaCap >= 3 ? 'ok' : n >= 6 || S.abuela === 2 ? 'foco' : '', `🌙 historias de la Abuela ${S.abuelaCap}/3${S.abuelaCap >= 3 ? ' ✓' : ''}`],
              ['meta', 'el asentamiento']];
      guiaProg = n < 6 ? guiaSaber(saberesEpoca(1, 1)) : { x: LUGAR_PENSADOR.abuela[0], y: LUGAR_PENSADOR.abuela[1] };
    } else if (S.era === 1 && !S.ganadoF) {
      const n = saberesEpoca(1, 2).filter(domP).length;
      const atras = saberesEpoca(1, 1).filter(i => !domP(i));   // lo que quedó a medias antes del asentamiento
      segs = [[n >= 4 ? 'ok' : 'foco', `🌾 saberes de la aldea ${n}/4${n >= 4 ? ' ✓' : ''}`]];
      // si algo del fogón sigue sin terminar, la línea lo dice con su nombre: si no, cantaría 4/4 ✓ y no cerraría
      if (atras.length) segs.push(['foco', `🔥 falta ${atras.map(i => minusNom(BALANCE.tecnologias[i].nombre)).join(' y ')}`]);
      // el cierre también exige la perfección 3/3 de los diez (terminados en 15-economia): la línea la
      // cuenta cuando todo está aprendido, o cantaría todo ✓ sin cerrar nunca
      const todos = saberesEpoca(1), p = todos.reduce((a, i2) => a + Math.min(3, S.tecs[i2].nivel || 0), 0), pMax = todos.length * 3;
      if (!atras.length && n >= 4) segs.push([p >= pMax ? 'ok' : 'foco', `🔎 perfección ${p}/${pMax}${p >= pMax ? ' ✓' : ''}`]);
      segs.push(['meta', 'cerrar la Época 1']);
      const pulir = todos.find(i2 => domP(i2) && (S.tecs[i2].nivel || 0) < 3);
      guiaProg = atras.length ? guiaSaber(atras) : guiaSaber(saberesEpoca(1, 2)) ||
        (pulir !== undefined ? { chip: 'chip-' + BALANCE.tecnologias[pulir].id } : null);
    } else if (S.era === 1 && ULTIMA_EPOCA === 1) {
      segs = [['ok', '🏆 Época 1 dominada ✓'], ['meta', 'el valle es tuyo']];
    } else if (S.era === 1) {
      const okM = memoriaLlena() && S.signo;
      segs = S.frontera3d === 2 ? [['ok', '🏺 Sumer se está construyendo'], ['meta', 'la aldea sigue viva']]   // el 3D ya mostró la llegada (frontera.js; la borra si la época siguiente ya tiene mundo)
        : S.signo ? [[okM ? 'ok' : 'foco', `⏳ la memoria del clan: ${fmt(Math.min(S.apr, costoMilenios()))} / ${fmt(costoMilenios())} 📖${okM ? ' ✓ los Milenios esperan en el dock' : ''}`]]
        : [['foco', '🦴 el signo: talla tú la próxima cuenta'], ['meta', '⏳ después, los Milenios']];
      if (okM && S.frontera3d !== 2) guiaProg = { chip: 'chip-inv' };
    } else if (ordEra(S.era) >= 2 && ordEra(S.era) <= 10) {
      const cfg = S.era === 2
        ? { t: saberesEpoca(2), ic: '🏺', pens: S.enheduanna, pn: 'el canto de Enheduanna', g: S.ganadoSum, inv: BALANCE.investigacionSiglos, meta: 'Egipto' }
        : S.era === 3
          ? { t: saberesEpoca(3), ic: '🪷', pens: S.ptahhotep, pn: 'el arte de escuchar de Ptahhotep', g: S.ganadoEg, inv: BALANCE.investigacionAgora, meta: 'Atenas' }
          : S.era === 4
            ? { t: saberesEpoca(4), ic: '🏛️', pens: S.socrates, pn: 'la mayéutica de Sócrates', g: S.ganadoAg, inv: BALANCE.investigacionAlejandria, meta: 'Alejandría' }
            : S.era === 5
              ? { t: saberesEpoca(5), ic: '📜', pens: S.hipatia, pn: 'la clase abierta de Hipatia', g: S.ganadoAl, inv: BALANCE.investigacionRoma, meta: 'Roma' }
              : S.era === 14
              ? { t: saberesEpoca(14), ic: '🏛️', pens: S.quintiliano, pn: 'la escuela sin férula de Quintiliano', g: S.ganadoRo, inv: BALANCE.investigacionBagdad, meta: 'Bagdad' }
              : S.era === 6
                ? { t: saberesEpoca(6), ic: '🌙', pens: S.hunayn, pn: 'el taller de Hunayn', g: S.ganadoBa, inv: BALANCE.investigacionChina, meta: 'Kaifeng' }
                : S.era === 15
                ? { t: saberesEpoca(15), ic: '🏮', pens: S.zhuxi, pn: 'el leer despacio de Zhu Xi', g: S.ganadoCh, inv: BALANCE.investigacionParis, meta: 'París' }
                : S.era === 7
                  ? { t: saberesEpoca(7), ic: '🌺', pens: S.neza, pn: 'la flor y el canto', g: S.ganadoTe, inv: BALANCE.investigacionAmsterdam, meta: 'la imprenta' }
                  : S.era === 8
                    ? { t: saberesEpoca(8), ic: '🔔', pens: S.abelardo, pn: 'el sic et non de Abelardo', g: S.ganadoPa, inv: BALANCE.investigacionTenochtitlan, meta: 'Tenochtitlan' }
                    : S.era === 21
                      ? { t: saberesEpoca(21), ic: '🏡', pens: S.bloom, pn: 'las dos sigmas de Bloom', g: S.ganadoFu, inv: 0, meta: 'la pregunta abierta' }
                    : S.era === 9
                      ? { t: saberesEpoca(9), ic: '🖨️', pens: S.comenio, pn: 'el todo a todos de Comenio', g: S.ganadoAm, inv: BALANCE.investigacionSantiago, meta: 'la escuela para todos' }
                      : { t: saberesEpoca(10), ic: '🎒', pens: S.sarmiento, pn: 'el educar al soberano de Sarmiento', g: S.ganadoSa, inv: BALANCE.investigacionImperios, meta: 'la era de la tiza' };
      if (!cfg.g) {
        // el total sale de la época (Sumer creció a 6), y el cierre exige perfección 3/3 (terminados):
        // la línea la cuenta cuando todo está aprendido, o cantaría todo ✓ sin cerrar nunca
        const tot = cfg.t.length, n = cfg.t.filter(domP).length;
        const pv = cfg.t.reduce((a, i2) => a + Math.min(3, S.tecs[i2].nivel || 0), 0), pMax = tot * 3;
        segs = [[n >= tot ? 'ok' : 'foco', `${cfg.ic} saberes ${n}/${tot}${n >= tot ? ' ✓' : ''}`]];
        if (n >= tot) segs.push([pv >= pMax ? 'ok' : 'foco', `🔎 perfección ${pv}/${pMax}${pv >= pMax ? ' ✓' : ''}`]);
        segs.push([cfg.pens === 2 ? 'ok' : n >= tot || cfg.pens === 1 ? 'foco' : '', `🗣️ ${cfg.pn}${cfg.pens === 2 ? ' ✓' : ''}`]);
        segs.push(['meta', S.era === ULTIMA_EPOCA ? `cerrar la Época ${numEpoca(S.era)}` : cfg.meta]); // en la frontera la meta es cerrar, no la época que aún no existe (2026-09-06: Sumer prometía «→ Egipto» con ULTIMA_EPOCA = 2)
        const pulir = cfg.t.find(i2 => domP(i2) && (S.tecs[i2].nivel || 0) < 3);
        guiaProg = n < tot ? guiaSaber(cfg.t)
          : pv < pMax ? (pulir !== undefined ? { chip: 'chip-' + BALANCE.tecnologias[pulir].id } : null)
          : cfg.pens === 1 ? (S.era === 21 ? { x: ESPERA_BLOOM_FU.x, y: ESPERA_BLOOM_FU.y } : S.era === 15 ? { x: ESPERA_ZHUXI_CH.x, y: ESPERA_ZHUXI_CH.y } : S.era === 14 ? { x: ESPERA_QUINTILIANO_RO.x, y: ESPERA_QUINTILIANO_RO.y } : S.era === 10 ? { x: ESPERA_SARMIENTO_SA.x, y: ESPERA_SARMIENTO_SA.y } : S.era === 9 ? { x: ESPERA_COMENIO_AM.x, y: ESPERA_COMENIO_AM.y } : S.era === 8 ? { x: ESPERA_ABELARDO_PA.x, y: ESPERA_ABELARDO_PA.y } : S.era === 7 ? { x: ESPERA_NEZA_TE.x, y: ESPERA_NEZA_TE.y } : S.era === 6 ? { x: PUERTA_CASA_BA.x, y: PUERTA_CASA_BA.y } : { x: 10.3, y: 9.1 }) : null; // pendiente = espera en la puerta
      } else if (S.era === ULTIMA_EPOCA) {
        segs = [['ok', S.era === 21 ? '🔥 La pregunta abierta ✓' : `🏆 Época ${numEpoca(S.era)} dominada ✓`], ['meta', S.era === 21 ? 'el valle es tuyo' : S.era === 2 ? 'la edubba es tuya' : S.era === 3 ? 'tuya para quedarte' : S.era === 4 ? 'el olivar es tuyo' : S.era === 6 ? 'la Casa de la Sabiduría es tuya' : S.era === 7 ? 'las escuelas del calpulli son tuyas' : S.era === 8 ? 'las escuelas de París son tuyas' : S.era === 9 ? 'las imprentas de Ámsterdam son tuyas' : S.era === 10 ? 'las escuelas de Chile son tuyas' : S.era === 14 ? 'las escuelas de Roma son tuyas' : S.era === 15 ? 'las escuelas de Kaifeng son tuyas' : 'la Biblioteca es tuya']];
      } else {
        const okI = S.apr >= cfg.inv;
        segs = S.frontera3d === sigEpoca(S.era) ? [['ok', `${cfg.ic} ${cfg.meta} se está construyendo`], ['meta', 'la época sigue viva']]   // el 3D ya mostró la llegada (frontera.js)
          : [[okI ? 'ok' : 'foco', `⏳ ${fmt(Math.min(S.apr, cfg.inv))} / ${fmt(cfg.inv)} 📖${okI ? ' ✓ el dock espera' : ''}`]];
        if (okI && S.frontera3d !== sigEpoca(S.era)) guiaProg = { chip: 'chip-inv' };
      }
    } else if (ordEra(S.era) >= 11) { // las Épocas 11-13 también dicen qué falta, no solo toasts que se van
      const cfg = S.era === 11
        ? { t: saberesEpoca(11), ic: '🏫', pens: S.dewey, pn: 'la idea de Dewey', g: S.ganado, inv: BALANCE.investigacionEra2, meta: 'la época de las ondas' }
        : S.era === 12
          ? { t: saberesEpoca(12), ic: '📻', g: S.ganado2, inv: BALANCE.investigacionEra3, meta: 'la caja mágica' }
          : { t: saberesEpoca(13), ic: '📺', g: S.ganado3, meta: 'la siguiente generación' };
      if (!cfg.g) {
        const n = cfg.t.filter(domP).length, tot = cfg.t.length;
        segs = [[n >= tot ? 'ok' : 'foco', `${cfg.ic} aparatos ${n}/${tot}${n >= tot ? ' ✓' : ''}`]];
        if (cfg.pn) segs.push([cfg.pens === 2 ? 'ok' : n >= tot || cfg.pens === 1 ? 'foco' : '', `🗣️ ${cfg.pn}${cfg.pens === 2 ? ' ✓' : ''}`]);
        segs.push(['meta', cfg.meta]);
        guiaProg = n < tot ? guiaSaber(cfg.t) : cfg.pens === 1 ? { x: 10.3, y: 9.1 } : null; // pendiente = espera en la puerta
      } else if (cfg.inv) {
        const okI = S.apr >= cfg.inv;
        segs = [[okI ? 'ok' : 'foco', `⏳ ${fmt(Math.min(S.apr, cfg.inv))} / ${fmt(cfg.inv)} 📖${okI ? ' ✓ el dock espera' : ''}`]];
        if (okI) guiaProg = { chip: 'chip-inv' };
      } else {
        segs = [['ok', `🏆 Época ${numEpoca(13)} dominada ✓`], ['meta', 'funda la siguiente generación 🧬']];
        guiaProg = { chip: 'chip-gen' };
      }
    }
    if (segs) {
      pe.style.display = 'block';
      const cuerpo = segs.filter(s => s[0] !== 'meta').map(([c, tx]) => `<span class="${c}">${tx}</span>`).join('<span class="sepp">·</span>');
      const metaSeg = segs.find(s => s[0] === 'meta');
      const htmlPE = cuerpo + (metaSeg ? ` <span class="meta">→ ${metaSeg[1]}</span>` : '');
      if (pe.__html !== htmlPE) { pe.innerHTML = htmlPE; pe.__html = htmlPE; }
    } else pe.style.display = 'none';
  }

  { // la consejera: la voz de la época dice el siguiente paso (clic = te llevo)
    const c = consejoActual(), el = $('consejo');
    consejoG = c ? c.g : null;
    hayConsejo = !!c;
    if (!c) { el.style.display = 'none'; el.__html = ''; }
    else {
      el.style.display = 'flex';
      // El TEXTO se refresca siempre (las cifras están vivas: lo que falta, el % del cultivo…), pero la
      // tarjeta solo vuelve a ENTRAR cuando cambia el consejo de verdad. Comparar el texto entero hacía
      // que se reanimara cada segundo, porque el número que lleva dentro cambia cada segundo.
      const clave = c.f + '|' + c.t.replace(/[\d.,]+/g, '#');
      if ($('consejo-txt').textContent !== c.t) $('consejo-txt').textContent = c.t;
      if (el.__clave !== clave) {
        $('consejo-firma').textContent = c.f;
        const cara = c.cara || (c.f === 'La Abuela' ? 'abuela' : 'mayor'); // la Época 1 no declara cara; las demás sí
        if (el.__cara !== cara) { drawBusto($('consejo-cara').getContext('2d'), cara); el.__cara = cara; }
        el.__clave = clave;
        el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
      }
      el.style.cursor = consejoG ? 'pointer' : 'default';
      el.title = consejoG ? 'clic: te llevo a donde está la acción' : ''; // no prometer un viaje sin destino
    }
  }

  const candidatos = []; // todo lo accionable ahora; al final SOLO uno se queda el anillo y la flechita
  const saberes = [];    // {id, vivo}: los que no están vivos se pliegan a icono al final
  const sinFuego = ordEra(S.era) < 11 && !S.fuegoDescubierto;
  const cfu = $('chip-varas');
  // Al prender el fuego, el chip de las varas desaparece y el dock se RECOMPONE bajo el dedo del
  // jugador (que venía cliqueando ahí mismo): el clic heredado caía en el botón que ocupara el hueco
  // (el museo, en el segundo 30 de partida). Medio segundo de sordera tras la recomposición lo evita.
  if (cfu.style.display !== 'none' && !sinFuego) dockLock = performance.now() + 500;
  cfu.style.display = sinFuego ? '' : 'none';
  if (sinFuego) {
    candidatos.push('chip-varas');
    cfu.querySelector('.mini').style.display = '';
    cfu.querySelector('.mini').firstElementChild.style.width = S.fuego + '%';
  }
  // el dock muestra solo el presente: de los saberes NO comprados solo se ofrece el siguiente; el resto queda "por venir"
  const edadHud = S.era === 1 ? S.edad : 1;
  // el SIGUIENTE se decide por el orden de la época (ordenSaberes), no por el índice del array: son cosas
  // distintas desde que la pesca vive al final del array pero se ofrece antes que la cacería
  const proxSin = ordenSaberes().find(i2 => { const T2 = BALANCE.tecnologias[i2];
    return T2 && !T2.manual && (T2.era || 11) === S.era && (T2.edad || 1) === edadHud && S.tecs[i2] && S.tecs[i2].fase === 'sin'; });
  let saberesPorVenir = 0;
  BALANCE.tecnologias.forEach((T, i) => {
    const t = S.tecs[i], c = $('chip-' + T.id);
    const eraT = T.era || 11, edadT = T.edad || 1, edadAct = S.era === 1 ? S.edad : 1;
    const pendiente = t.fase === 'novedad' || t.fase === 'valle' || t.fase === 'formando'; // lo comprado a medias siempre se atiende
    const futuroOculto = !sinFuego && !T.manual && t.fase === 'sin' && eraT === S.era && edadT === edadAct && i !== proxSin;
    if (futuroOculto) saberesPorVenir++;
    // Un saber de una edad/era pasada solo se pliega al museo cuando está TERMINADO (perfección 3/3):
    // mientras le queden etapas, sigue siendo presente y su chip se queda (si no, el asentamiento
    // dejaba la cacería en 1/3 sin ningún sitio desde donde perfeccionarla: la ficha ofrecía la etapa 2
    // y el dock la había escondido).
    const terminado = t.fase === 'meseta' && (t.nivel || 0) >= 3;
    c.style.display = (T.manual || futuroOculto || (!pendiente && eraT > S.era) || (!pendiente && eraT !== S.era && t.fase === 'sin') || (eraT < S.era && terminado) || (sinFuego && eraT === 1) || (!pendiente && eraT === S.era && edadT > edadAct) || (eraT === S.era && edadT <= edadAct && terminado)) ? 'none' : ''; // terminado (3/3) = al Museo, también el de la edad en curso (lista de cotejo F4)
    c.querySelector('.dot').className = 'dot' + (t.fase === 'sin' ? '' : t.fase === 'meseta' && (t.nivel || 0) >= 3 ? ' dominada' : ' ' + t.fase);
    c.classList.toggle('abierto', !!(panelActivo && panelActivo.tipo === 'tec' && panelActivo.i === i));
    // Acción pendiente = crear lo que ya puedes pagar, reencender lo que decae, O PERFECCIONAR una etapa
    // (esto último faltaba: los chips verdes tenían su etapa lista y nada lo recordaba).
    const puedePerf = t.fase === 'meseta' && (t.nivel || 0) < 3 && !(t.prof > 0) && S.apr >= profCosto(i);
    if ((t.fase === 'sin' && S.pre >= T.costo && (!MAT_DE_TEC[i] || (S.mats[MAT_DE_TEC[i]] || 0) >= MAT_COSTO)) || (t.fase === 'valle' && S.apr >= T.formCosto) || puedePerf) candidatos.push(c.id);
    c.classList.remove('atencion', 'disponible');
    // proceso vivo = te está pidiendo algo ahora; el foco y el panel abierto se suman en el bloque final
    saberes.push({ id: c.id, vivo: ['novedad', 'valle', 'formando'].includes(t.fase) || !!(panelActivo && panelActivo.tipo === 'tec' && panelActivo.i === i) });
    const pips = c.querySelector('.pips'); // las etapas de perfección, visibles sin abrir el panel
    if (t.fase === 'meseta') {
      pips.style.display = '';
      const niv = t.nivel || 0, puede = puedePerf;
      [...pips.children].forEach((el2, k) => { el2.className = k < niv ? 'on' : (k === niv && puede) ? 'lista' : ''; });
    } else pips.style.display = 'none';
    const mini = c.querySelector('.mini');
    if (t.fase === 'formando') { mini.style.display = ''; mini.firstElementChild.style.width = (100 * (1 - t.t / (t.dur || T.formDur))) + '%'; }
    else if (t.fase === 'novedad') { mini.style.display = ''; mini.firstElementChild.style.width = (100 * t.t / BALANCE.novedadDur) + '%'; }
    else if (t.fase === 'meseta' && t.prof > 0) { mini.style.display = ''; mini.firstElementChild.style.width = (100 * (1 - t.prof / (t.profDur || 1))) + '%'; } // el pulido también se ve avanzar desde el dock
    else mini.style.display = 'none';
  });
  const cpv = $('chip-porvenir');
  cpv.style.display = saberesPorVenir > 0 ? '' : 'none';
  if (saberesPorVenir > 0) $('porvenir-txt').textContent = `… +${saberesPorVenir} por venir`;
  let hayIdeas = false;
  for (const k of ['abuela', 'enheduanna', 'ptahhotep', 'socrates', 'hipatia', 'quintiliano', 'hunayn', 'zhuxi', 'abelardo', 'neza', 'comenio', 'sarmiento', 'bloom', 'dewey', 'skinner', 'freire']) {
    const m = $('med-' + k), est = estadoPensador(k);
    m.parentElement.style.display = est ? '' : 'none';
    if (est) hayIdeas = true;
    m.classList.toggle('pendiente', est === 1);
    m.classList.toggle('adoptado', est === 2);
    m.classList.toggle('abierto', !!(panelActivo && panelActivo.tipo === 'pensador' && panelActivo.k === k));
  }
  $('ideas').style.display = hayIdeas ? '' : 'none';
  const cin = $('chip-inv');
  const puedeInvestigar = S.era !== ULTIMA_EPOCA && ((S.era === 1 && S.ganadoF && S.abuelaCap >= 3) || (S.era === 2 && S.ganadoSum && S.enheduanna === 2) || (S.era === 3 && S.ganadoEg && S.ptahhotep === 2) || (S.era === 4 && S.ganadoAg && S.socrates === 2) || (S.era === 5 && S.ganadoAl && S.hipatia === 2) || (S.era === 14 && S.ganadoRo && S.quintiliano === 2) || (S.era === 6 && S.ganadoBa && S.hunayn === 2) || (S.era === 15 && S.ganadoCh && S.zhuxi === 2) || (S.era === 7 && S.ganadoTe && S.neza === 2) || (S.era === 8 && S.ganadoPa && S.abelardo === 2) || (S.era === 9 && S.ganadoAm && S.comenio === 2) || (S.era === 10 && S.ganadoSa && S.sarmiento === 2) || (S.era === 11 && S.ganado && S.dewey === 2) || (S.era === 12 && S.ganado2));
  const costoInv = S.era === 1 ? costoMilenios() : S.era === 2 ? BALANCE.investigacionSiglos : S.era === 3 ? BALANCE.investigacionAgora : S.era === 4 ? BALANCE.investigacionAlejandria : S.era === 5 ? BALANCE.investigacionRoma : S.era === 14 ? BALANCE.investigacionBagdad : S.era === 6 ? BALANCE.investigacionChina : S.era === 15 ? BALANCE.investigacionParis : S.era === 8 ? BALANCE.investigacionTenochtitlan : S.era === 7 ? BALANCE.investigacionAmsterdam : S.era === 9 ? BALANCE.investigacionFuturo : S.era === 10 ? BALANCE.investigacionImperios : (S.era === 11 ? BALANCE.investigacionEra2 : BALANCE.investigacionEra3);
  cin.style.display = puedeInvestigar ? '' : 'none';
  $('inv-txt').textContent = S.era === 1 ? '⏳ Milenios' : S.era === 2 ? '⏳ Siglos' : S.era === 3 ? '⛵ Atenas' : S.era === 4 ? '⛵ Alejandría' : S.era === 5 ? '🏛️ Roma' : S.era === 14 ? '🌙 Bagdad' : S.era === 6 ? '🏮 Kaifeng' : S.era === 15 ? '🔔 París' : S.era === 8 ? '🌋 Tenochtitlan' : S.era === 7 ? '🖨️ Imprenta' : S.era === 9 ? '🔥 Hoy' : S.era === 10 ? '⏳ 1920' : (S.era === 11 ? `📻 Época ${numEpoca(12)}` : `📺 Época ${numEpoca(13)}`);
  cin.classList.remove('atencion', 'disponible');
  if (puedeInvestigar && S.apr >= costoInv * 0.999 && (S.era !== 1 || S.signo) && S.frontera3d !== sigEpoca(S.era)) candidatos.push('chip-inv');
  cin.classList.toggle('abierto', !!(panelActivo && panelActivo.tipo === 'inv'));
  $('chip-museo').classList.toggle('abierto', !!(panelActivo && panelActivo.tipo === 'museo'));
  const cgen = $('chip-gen');
  cgen.style.display = S.ganado3 ? '' : 'none';
  cgen.classList.toggle('abierto', !!(panelActivo && panelActivo.tipo === 'gen'));
  /* EL DOCK DISTINGUE TRES COSAS, NO DOS. Antes solo separaba "puedo pagarlo" de "no me alcanza", así
     que un gasto que no cambiaba nada (otra guía sin nadie desatendido, hierbas con el ánimo casi lleno)
     invitaba igual que uno que sí hacía falta. Ahora hay un tercer estado: PUEDES, PERO NO HACE FALTA,
     que se marca con ✓ y se atenúa. El porqué exacto sigue viviendo en el popup de cada chip. */
  const cd = costoDocente(), cdoc = $('chip-doc');
  cdoc.style.display = sinFuego ? 'none' : '';
  const sueltos = S.alumnos - alumnosBien();          // los que aprenden a medias: la única razón real de sumar una guía
  if (S.docentes >= maxDocentes()) { cdoc.classList.add('apagado'); $('doc-txt').textContent = `${S.docentes} ✓`; }
  // G4 del QA completo: en el celular vertical, el dock cabe en dos filas con estos dos chips en corto (el detalle sigue a un toque)
  else if (sueltos <= 0) { cdoc.classList.add('apagado'); $('doc-txt').textContent = angosto() ? `${S.docentes} ✓` : `${S.docentes} ✓ alcanzan`; }
  else { cdoc.classList.toggle('apagado', S.pre < cd); $('doc-txt').textContent = angosto() ? `${fmt(cd)}${monIco()}` : `${LEX().docente} · ${fmt(cd)}${monIco()}`; }
  const cte = $('chip-te');
  cte.style.display = sinFuego || campanaAbierta() ? 'none' : '';   // (en Ámsterdam vuelve: el suero de leche de media mañana)   // PARÍS: con la campana, el descanso tiene su hora en el horario (el vino aguado se retira del dock)
  $('te-icono').textContent = LEX().te.split(' ')[0];
  const margenAnimo = animoMax() - S.animo;          // lo que de verdad subiría: pagar 50 📖 por 3 de ánimo no es un trato
  const noRinde = margenAnimo < BALANCE.te.bono * 0.5;
  cte.classList.toggle('apagado', S.teCd > 0 || S.apr < BALANCE.te.costo || noRinde);
  $('te-txt').textContent = S.teCd > 0 ? `${Math.ceil(S.teCd)}s`
    : noRinde ? (angosto() ? '✓' : `${LEX().te.split(' ')[1]} ✓`) : (angosto() ? `${BALANCE.te.costo}📖` : `${LEX().te.split(' ')[1]} · ${BALANCE.te.costo}📖`);
  const cke = $('chip-kerm');
  cke.style.display = ordEra(S.era) >= 12 ? '' : 'none';
  cke.classList.toggle('apagado', S.kermCd > 0 || S.apr < kermesseCosto());
  $('kerm-txt').textContent = S.kermCd > 0 ? `${Math.ceil(S.kermCd)}s` : `Kermesse · ${fmt(kermesseCosto())}📖`;
  $('b-mute').textContent = S.mute ? '🔇' : '🔊';
  { // UN SOLO FOCO en todo el dock: el anillo + la flechita van al chip del que HABLA la consejera.
    // El resto de lo accionable queda en voz baja (.disponible): sigue a un clic, pero no compite por el ojo.
    // Si la consejera señala el MUNDO (el fuego, una luz de material, el campo), el dock NO la contradice:
    // nadie se queda el anillo aquí abajo, porque el foco está allá y lo marca su propio anillo en el suelo.
    const dicho = consejoG && consejoG.chip;
    const foco = candidatos.includes(dicho) ? dicho : hayConsejo ? null : candidatos[0];
    for (const id of candidatos) {
      const el = $(id); if (!el) continue;
      el.classList.toggle('atencion', id === foco);
      el.classList.toggle('disponible', id !== foco);
    }
    for (const s of saberes) { // lo aprendido y en calma se pliega a icono: el dock deja de ser una pared de palabras
      const el = $(s.id); if (!el) continue;
      el.classList.toggle('quieto', !s.vivo && s.id !== foco && !candidatos.includes(s.id));
    }
  }
  renderPanel();
}

/* ============================================================
   GUARDADO Y PROGRESO OFFLINE
   ============================================================ */
