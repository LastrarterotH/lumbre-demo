/* ============================================================
   14-reglas
   Las reglas del mundo: léxico por época, luz del día, LAS CUATRO ESTACIONES, la velada, el fuego y la cosecha.
   ============================================================ */
/* ROMA NO SE ARRASTRA (balance de la Época 14, docs/balance-epoca14.md): Roma va entre Alejandría y Bagdad, y la economía
   es exponencial. Sus seis saberes dominados multiplicaban por 68 todo lo que venía después (Bagdad cerraba en 5 min).
   Las escuelas de Roma rinden EN ROMA: con el imperio se parten, y Bagdad hereda de Alejandría (los griegos que traduce),
   no del ludus latino. Así insertar una época no obliga a reescalar las que siguen.
   CHINA, IGUAL (era15-plan): va entre Bagdad y París, y París se calibró llegando desde Bagdad. Las escuelas y el examen
   de Kaifeng rinden en Kaifeng; París hereda de Bagdad (lo traducido que sube a Toledo), no del examen chino. */
const EPOCAS_QUE_SE_QUEDAN = [14, 15];   // Roma y China: sus saberes multiplican solo en su época
function bonoVive(i) { const e = BALANCE.tecnologias[i].era; return !EPOCAS_QUE_SE_QUEDAN.includes(e) || S.era === e; }
function multTec() {
  let m = 1;
  S.tecs.forEach((t, i) => {
    if (!bonoVive(i)) return;
    const b = BALANCE.tecnologias[i].bono;
    if (t.fase === 'novedad') m *= 1 + b * BALANCE.novedadFactor;
    else if (t.fase === 'valle' || t.fase === 'formando') m *= 1 - b;
    else if (t.fase === 'meseta') m *= 1 + b * (1 + 0.5 * (t.nivel || 0));
  });
  return m;
}
function multTecNormal() {
  let m = 1;
  S.tecs.forEach((t, i) => { if (t.fase === 'meseta' && bonoVive(i)) m *= 1 + BALANCE.tecnologias[i].bono * (1 + 0.5 * (t.nivel || 0)); });
  return m;
}
function multAnimo() { return 0.5 + S.animo / 200; }
/* ---------- LA ORILLA: el sitio que se hace, no la clase que se da ----------
   La cacería enseña lo colectivo: roles, señales, cerco, y los jóvenes MIRANDO. La pesca enseña lo
   contrario, y es lo que la evidencia sostiene (Bird y Bliege Bird, 2002): en la orilla el pequeño no
   es un aprendiz que espera su turno para servir, YA PRODUCE desde el primer día. Su efecto son las tres
   cosas que se siguen de eso, y ninguna es un multiplicador más: cuenta como una unidad de aprendizaje
   (`unidadesExtra`), trae recursos cada 20 s (el goteo del tick) y, si alguien estaba aprendiendo a
   medias, lo atiende. Nadie explica nada: le hacen sitio.
   El goteo no es adorno de balance: medido, el Paleolítico no tenía NINGUNA fuente activa de recursos
   hasta la cacería, y eso dejaba siete minutos de espera pura. La orilla es ahora ese escalón. */
function maxDiadas() { return S.tecs[28] && S.tecs[28].fase === 'meseta' ? 1 + nivelTec(28) : 0; } // dominar abre el primer sitio; cada etapa, uno más
function diadas() { return S.era === 1 ? Math.min(S.diadas || 0, maxDiadas()) : 0; } // la orilla es de la Época 1: en Sumer ni se dibuja, así que ni cubre ni produce (cobertura fantasma que apagaba el chip de guías, visto jugando 2026-08-04)
/* CÓMO ENSEÑA CADA GUÍA (lista de cotejo C5, 2026-09-29; la elección con consecuencia que pedía la auditoría,
   c10). Al contratarla, la guía elige: A MUCHOS (un corro de 9) o DE CERCA (5, que aprenden un 20 % más). Es
   la misma tesis con que cierra la época: se enseña coordinando a muchos o haciéndole sitio a uno. No hay una
   dominante: el corro atiende a más y hace volver la cacería más cargada (+25 % de botín por guía: coordinar a
   muchos es el oficio de la partida); la cercanía hace aprender más a pocos.
   Fuente de la ventaja de la tutoría: Bloom (1984), «The 2 Sigma Problem», Educational Researcher 13(6),
   doi 10.3102/0013189X013006004. La primera guía (la Mayor) enseña como siempre: un corro de 7. */
const GUIA_CORRO = 9, GUIA_CERCA = 5, CERCA_PLUS = 0.2;
function cupoGuia(k) {
  if (S.era !== 1 || k === 0) return BALANCE.ratioDocente + palestraSitio();
  const m = (S.guiasModo || [])[k];
  return m === 'corro' ? GUIA_CORRO : m === 'cerca' ? GUIA_CERCA : BALANCE.ratioDocente;
}
function guiasEn(modo) { let n = 0; for (let k = 1; k < S.docentes; k++) if ((S.guiasModo || [])[k] === modo) n++; return S.era === 1 ? n : 0; }
function botinCorro() { return 1 + 0.25 * guiasEn('corro'); } // quien enseña a coordinar a muchos también caza y siega mejor: la partida y la cosecha vuelven más cargadas
function mediasSinGuia(k) { return Math.max(0, S.alumnos - Math.min(S.alumnos, plazasGuias(k) + (S.abuela === 2 ? 4 : 0) + diadas())); } // cuántos aprenderían a medias sin la guía k (la que elige)
function plazasGuias(n = S.docentes) { let p = 0; for (let k = 0; k < n; k++) p += cupoGuia(k); return p; }
function cercaExtra() { // la cercanía rinde: los que aprenden de cerca cuentan un 20 % más
  if (S.era !== 1) return 0;
  return CERCA_PLUS * Math.min(S.alumnos, GUIA_CERCA * guiasEn('cerca'));
}
function sueltosSinOrilla() { return Math.max(0, S.alumnos - (plazasGuias() + (S.abuela === 2 ? 4 : 0))); } // la Abuela acompaña a 4, como la persona que es (no amplifica a cada guía)
// Basta con que quede sitio. Antes se exigía además que hubiera aprendices desatendidos, y medido resultó
// que casi nunca los hay (cuatro guías sostienen 56 y el aula tope son 18), así que el saber no hacía
// nada en la práctica. Sentarse en la orilla vale por sí mismo: lo que saca el pequeño ya alimenta.
function haySitioEnLaOrilla() { return maxDiadas() > diadas(); }
/* EL TRUEQUE DE HISTORIAS (C2 del QA completo): desde que la memoria del clan se llena (lo que no cabe se olvida), el
   saber sobraba por miles y las esperas por recursos no tenían nada que hacer. Ahora, con la Abuela en el clan y la
   memoria llena, se puede contar a un clan vecino lo que ya no cabe: se sienta junto al fuego, escucha y deja lo que
   trae. La tradición oral como red: las historias viajan de boca en boca y los regalos vuelven. */
const TRUEQUE = { gasto: 0.3, base: 45, porRep: 12, cd: 45 };
function truequeDisponible() { return S.era === 1 && S.abuela === 2 && S.fuegoDescubierto && S.apr >= memoriaTope() * 0.98 && !((S.truequeCd || 0) > 0); }
function truequePaga() { return Math.round(TRUEQUE.base + TRUEQUE.porRep * S.rep); }
function trocarHistorias() {
  if (!truequeDisponible()) return;
  const trae = truequePaga();
  S.apr -= Math.round(memoriaTope() * TRUEQUE.gasto); S.pre += trae; S.truequeCd = TRUEQUE.cd; S.trueques = (S.trueques || 0) + 1;
  fx.pops.push({ x: LUGAR_PENSADOR.abuela[0], y: LUGAR_PENSADOR.abuela[1] - 0.6, txt: `+${fmt(trae)} ${monIco()}`, born: performance.now() });
  sfx.logro();
  if (!S.vioTrueque) { S.vioTrueque = true; toast(`🤝 <b>Historias por regalos.</b> Un clan vecino se sienta junto al fuego, escucha lo que ya no cabía en la memoria y deja lo que trae: <b>${fmt(trae)} ${monIco()}</b>. Lo que se cuenta no se pierde: sigue vivo en otras bocas.`, 12000); }
  renderHUD(); guardar();
}
function hacerSitio() { // el gesto: el mayor se corre un poco y el pequeño se sienta a su lado
  if (!haySitioEnLaOrilla()) return;
  S.diadas = diadas() + 1;
  const d = DIADAS[Math.min(S.diadas - 1, DIADAS.length - 1)];
  sfx.recoger(); jubilo();
  fx.anillos.push({ born: performance.now(), x: d.x, y: d.y });
  fx.pops.push({ x: d.x, y: d.y - 0.3, txt: 'le hacen sitio', born: performance.now() });
  if (!S.vioOrilla) {
    S.vioOrilla = true;
    toast('🎣 <b>Le hicieron sitio.</b> Nadie le explicó nada: el mayor se hizo a un lado y el pequeño se sentó junto a él. Y no está practicando: <b>lo que saca ya alimenta al clan</b>, y de vez en cuando trae de la orilla. Si alguien aprendía a medias, además deja de hacerlo.', 15000);
  } else toast(`🎣 Otro pequeño tiene su sitio en la orilla: ya son <b>${S.diadas}</b> trayendo del agua.`, 8000);
  renderHUD(); guardar();
}
function alumnosBien() { if (escuelaParaTodos()) return S.alumnos; return Math.min(S.alumnos, plazasGuias() + ((S.sofista ? 1 : 0) + discipulos() + museoSabios()) * (BALANCE.ratioDocente + palestraSitio()) + (S.abuela === 2 ? 4 : 0) + diadas() + muidAtiende()); }
function muidAtiende() { return S.era === 6 ? (S.muidin || 0) * MUIDIN_ATIENDE : S.era === 8 ? (S.licenciados || 0) * 5 : S.era === 9 ? aulaAtiende() : S.era === 10 ? aulasSa() : S.era === 15 ? aldeaAtiende() : S.era === 21 ? tutoresFu() : 0; }   // ÁMSTERDAM: el aula de la Didáctica, y con Comenio las cartillas   // PARÍS: cada licenciado abre su escuela y atiende a 5   // BAGDAD: cada repetidor (el muʿid, que recibió su ijaza) atiende a 4 que aprendían a medias // guías por círculo + la Abuela (plana) + cada díada atiende al suyo; en Atenas el sofista y los discípulos cuentan como maestros y la palestra ensancha el círculo
function sofistaPaga() { return S.sofista ? 1.3 : 1; } // EL SOFISTA TRAE A LOS HIJOS DE LOS RICOS (Protágoras cobraba 100 minas): mientras esté, los padres pagan más por la lección dicha y por el repertorio (×1,3). Su bolsa es costo fijo; lo que trae, variable: la apuesta es real cuando el ágora está activa // guías por círculo + la Abuela (plana) + cada díada atiende al suyo
// Cómo se NOMBRA lo que rinden los desatendidos. Nunca un "la mitad" clavado: la cifra se mueve (el telar
// reparte el oficio, Skinner los atiende con máquinas) y el rótulo tiene que moverse con ella.
function rendimientoSueltos() {
  const e = extraEf();
  return Math.abs(e - 0.5) < 0.005 ? 'la mitad' : `el ${Math.round(e * 100)}%`;
}
function ganaAlumnos(docentes) { // unidades de aprendizaje con N guías: los atendidos rinden 1, el resto la mitad
  const n = Math.min(docentes, maxDocentes()), bien = Math.min(S.alumnos, (n <= S.docentes ? plazasGuias(n) : plazasGuias() + (n - S.docentes) * BALANCE.ratioDocente) + (S.abuela === 2 ? 4 : 0) + diadas()); // los de la orilla ya están atendidos, y la Abuela acompaña a 4
  return bien + (S.alumnos - bien) * extraEf();
}
// Los desatendidos NUNCA rinden 1: la atención de un guía no se sustituye. Pero sí sube algo cuando el
// oficio se reparte (el telar) o cuando una máquina los atiende (Skinner). El copy que los describe
// deriva de esta cifra, nunca de un "la mitad" clavado: en la Época 13 con Skinner sería falso.
function extraEf() { return Math.min(0.9, (S.skinner === 2 ? 0.75 : BALANCE.extraEficiencia) + telarReparto() + claseAbierta()); }
function liraAnimo() { return ordEra(S.era) >= 4 && S.tecs[34] && S.tecs[34].fase === 'meseta' ? 5 + 5 * nivelTec(34) : 0; } // ATENAS: la música educa el ánimo: +5 de tope por etapa (y regenera más rápido, ver tick)
function palestraSitio() { return ordEra(S.era) >= 4 && S.tecs[35] && S.tecs[35].fase === 'meseta' ? 1 + nivelTec(35) : 0; } // ATENAS: el paidotribes atiende a muchos: +1 aprendiz por maestro por etapa
function discipulos() { return ordEra(S.era) >= 4 && ordEra(S.era) <= 5 && S.tecs[38] && S.tecs[38].fase === 'meseta' ? Math.min(1 + nivelTec(38), Math.floor((S.respuestas || 0) / 8)) : 0; } // ATENAS: los que más respuestas produjeron enseñan: un maestro más sin contratar, por etapa (son personas: cuatro siglos después, en Bagdad, ya no están)
function animoMax() { return BALANCE.animo.max - (S.skinner === 2 ? 10 : 0) + (S.abuelaCap >= 2 ? 10 : 0) + liraAnimo() + salaComun() + (S.era === 10 && typeof kinderListo === 'function' && kinderListo() ? 10 : 0); }   // SANTIAGO: el kindergarten, el juego // el refuerzo aburre; los ancestros unen. El +10 de Ptahhotep murió el 2026-08-24 (c23: era un buff plano; su regla real es la paleta-diálogo, ver practicarEnPiedra)
function museoSabios() { return S.era === 5 && S.tecs[39] && S.tecs[39].fase === 'meseta' ? 1 + nivelTec(39) : 0; } // ALEJANDRÍA: los sabios residentes del Museo atienden cada uno un círculo, sin contratarlos: uno más por etapa (solo en Alejandría: el Museo no se muda)
function salaComun() { return ordEra(S.era) >= 5 && S.tecs[39] && S.tecs[39].fase === 'meseta' ? 5 : 0; }                    // ALEJANDRÍA: la mesa común del Museo da ánimo
function claseAbierta() { return ordEra(S.era) >= 5 && S.hipatia === 2 ? Math.min(0.25, (S.fondoValor || 0) * 0.01) : 0; }    // HIPATIA: la clase abierta; los que aprenden a medias también aprenden de lo catalogado (hasta +25 puntos)
function manualEuclides() { return ordEra(S.era) >= 5 && S.tecs[42] && S.tecs[42].fase === 'meseta' ? 0.85 - 0.05 * nivelTec(42) : 1; } // LOS ELEMENTOS: con manual se enseña más rápido (la formación de los maestros, −15 % y −5 % por etapa)
function maxDocentes() { return ordEra(S.era) >= 13 ? 6 : 4; }
/* LAS CONCORDANCIAS (G8 del QA general): «otra guía» pero «otro escriba» y «otro maestro»; y las etiquetas de fase
   concuerdan con el saber («El tambor · APRENDIDO», «Las pinturas rupestres · APRENDIDAS»). */
function otroDocente() { return S.era === 1 ? 'otra' : 'otro'; }
function concuerda(txt, genero = 'f') { return /DA$/.test(txt) ? txt.replace(/DA$/, { m: 'DO', mp: 'DOS', fp: 'DAS' }[genero] || 'DA') : txt; }
function LEX() { // el léxico de cada época: las mecánicas son universales, pero hablan el idioma de su tiempo
  if (S.era === 2) return {
    fases: { sin: 'POR CREAR', novedad: 'NOVEDAD', valle: 'JUNTA POLVO', formando: 'DICTANDO', meseta: 'APRENDIDA' },
    comprar: 'Crear', formar: 'Dictar y copiar',
    casa: 'la edubba',
    valleTxt: 'nadie usa aún este saber en la edubba. Dictar y copiar lo arregla.',
    formandoTxt: 'los escribas dictan y los aprendices copian…',
    docente: 'Escriba',
    nombres: ['el padre de la edubba', 'el escriba Dudu', 'la tablillera Nin-kalla', 'el contador Lu-Enlil', 'la cantora Gemé-Tirash', 'el joven Shulgi'],
    te: '🫓 Raciones', teToast: '🫓 Pan y cerveza del templo para los escribas.',
    trimestre: m => `🌾 La cosecha del templo: la edubba recibe <b>${m}</b> ${monIco()}.`,
    hito: n => `⭐ ¡La edubba suena en toda la ciudad! Llegan <b>${n} hijos de escribas</b>.`,
    llega: 'Nace', contratoToast: n => `🏺 <b>${n.charAt(0).toUpperCase() + n.slice(1)}</b> se suma a los escribas de la edubba.`,
    // el dictado y la edubba se nombran a sí mismos: «empieza el dictado del dictado» y «la edubba copia la edubba» no
    formarToast: n => n === 'El dictado' ? '🗣️ Empieza <b>el dictado</b>: una voz dicta y varias manos presionan, de tablilla en tablilla…'
      : n === 'La edubba' ? '🗣️ <b>La edubba</b> abre su sala de esteras: los escribas dictan, los aprendices copian…'
      : `🗣️ Empieza el dictado ${/^El /.test(n) ? 'del <b>' + n.slice(3) : 'de <b>' + n.charAt(0).toLowerCase() + n.slice(1)}</b>, de tablilla en tablilla…`,
    formadoToast: (n, f) => n === 'La edubba' ? `🏺 <b>La edubba</b> ya enseña sin errores: lo aprendido rinde para siempre. <i>${f}</i>`
      : `🏺 La edubba ya copia sin errores ${/^El /.test(n) ? 'el <b>' + n.slice(3) : '<b>' + n.charAt(0).toLowerCase() + n.slice(1)}</b>: lo aprendido rinde para siempre. <i>${f}</i>`
  };
  if (S.era === 3) return {
    fases: { sin: 'POR CREAR', novedad: 'NOVEDAD', valle: 'JUNTA POLVO', formando: 'INSTRUYENDO', meseta: 'APRENDIDA' },
    comprar: 'Crear', formar: 'Instruir maestros',
    casa: 'la Casa de la Vida',
    valleTxt: 'nadie usa aún este saber en la Casa de la Vida. Instruir maestros lo arregla.',
    formandoTxt: 'primero escuchar, después escribir…',
    docente: 'Maestro',
    nombres: ['el maestro Kagemni', 'la escriba Naunajte', 'el archivero Kenherjepeshef', 'la cantora Kawit', 'el agrimensor Penu', 'el joven Djedi'], // Naunajte y Kenherjepeshef son personas REALES de Deir el-Medina (el retrato cultural del plan: ella dejó testamento propio, él una biblioteca famosa)
    te: '🍯 Higos y miel', teToast: '🍯 Higos y miel para los maestros: dulce es la palabra bien dicha.',
    trimestre: m => estacion().i === 0 ? `🌊 La crecida del Nilo cubre la vega y paga doble en limo: <b>${m}</b> ${monIco()}.` : `🏺 El tributo del valle llega a la Casa: <b>${m}</b> ${monIco()}.`,
    hito: n => `⭐ ¡La Casa de la Vida es célebre en el reino! Llegan <b>${n} aprendices</b>.`,
    llega: 'Nace', contratoToast: n => `🪷 <b>${n.charAt(0).toUpperCase() + n.slice(1)}</b> se suma a los maestros de la Casa de la Vida.`,
    formarToast: n => `🗣️ La instrucción ${/^El /.test(n) ? 'del <b>' + n.slice(3) : 'de <b>' + n.charAt(0).toLowerCase() + n.slice(1)}</b> comienza: primero escuchar, después escribir…`,
    formadoToast: (n, f) => `🪷 <b>${n}</b> ya rinde para siempre${n === 'La Casa de la Vida' ? '' : ' en la Casa de la Vida'}. <i>${f}</i>`
  };
  if (S.era === 4) return {
    fases: { sin: 'POR CREAR', novedad: 'NOVEDAD', valle: 'JUNTA POLVO', formando: 'ENSEÑANDO', meseta: 'APRENDIDA' },
    comprar: 'Crear', formar: 'Formar maestros',
    casa: 'el ágora',
    valleTxt: 'nadie usa aún este aparato en el ágora. Formar maestros lo arregla.',
    formandoTxt: 'se enseña preguntando, y se aprende respondiendo…',
    docente: 'Maestro',
    nombres: ['el grammatistes Dionisio', 'la maestra Aspasia', 'el paidotribes Cleón', 'el kitharistes Lampro', 'el sofista Pródico', 'el joven Fedro'], // Dionisio fue el maestro de letras de Platón (Diógenes Laercio III.4); Lampro enseñó música a Sófocles; Pródico de Ceos fue sofista de verdad; Aspasia, ⚖️ (Menexeno 235e)
    te: '🫒 Aceitunas y vino', teToast: '🫒 Aceitunas, pan y vino aguado para los maestros: el simposio de los pobres.',
    trimestre: m => `🏛️ La liturgia: un ciudadano rico paga el aceite del gimnasio y el coro: <b>${m}</b> ${monIco()}.`,
    hito: n => `⭐ ¡El ágora suena en toda la ciudad! Llegan <b>${n} muchachos</b>.`,
    llega: 'Nace', contratoToast: n => `🏛️ <b>${n}</b> se suma a los maestros del ágora.`,
    formarToast: n => `🗣️ <b>${n}</b> empieza a enseñarse en la stoa: preguntas primero…`,
    formadoToast: (n, f) => `🏛️ <b>${n}</b> ya rinde para siempre en el ágora. <i>${f}</i>`
  };
  if (S.era === 14) return {   // ROMA (era14-plan): las tres escuelas
    fases: { sin: 'POR CREAR', novedad: 'NOVEDAD', valle: 'JUNTA POLVO', formando: 'BAJO LOS PÓRTICOS', meseta: 'APRENDIDA' },
    comprar: 'Crear', formar: 'Formar maestros',
    casa: 'las escuelas de Roma',
    valleTxt: 'nadie lo sabe enseñar todavía en las escuelas de Roma. Formar maestros lo arregla.',
    formandoTxt: 'se enseña bajo los pórticos del Foro, del litterator al rétor…',
    docente: 'Maestro',
    nombres: ['el grammaticus Orbilio', 'Remio Palemón', 'Verrio Flaco', 'el rétor Porcio Latrón', 'Quinto Cecilio Epirota', 'el litterator del pórtico'],   // maestros reales de Roma (Suetonio, Sobre los gramáticos y los rétores; Séneca el Viejo)
    te: '🍯 Mulsum', teToast: '🍯 Vino con miel, el mulsum, y un pedazo de pan: el descanso de los maestros a la sombra del pórtico.',
    trimestre: m => `💰 El erario del templo de Saturno y los patronos del Foro pagan las escuelas: <b>${m}</b> ${monIco()}.`,
    hito: n => `⭐ ¡Las escuelas de Roma se nombran de Hispania a Siria! ${n ? `Llegan <b>${n} niños</b>.` : 'Los padres de las provincias escriben preguntando por tus maestros.'}`,
    llega: 'Nace', contratoToast: n => `📜 <b>${n.charAt(0).toUpperCase() + n.slice(1)}</b> abre su escuela bajo un pórtico del Foro.`,
    formarToast: n => n === 'El ludus' ? '🗣️ <b>El ludus</b> abre bajo la pérgola del pórtico: el litterator enciende las lámparas antes del amanecer…'
      : `🗣️ <b>${n}</b> ${/^(Los|Las) /.test(n) ? 'empiezan' : 'empieza'} a enseñarse bajo los pórticos del Foro…`,
    formadoToast: (n, f) => `📜 <b>${n}</b> ya ${/^(Los|Las) /.test(n) ? 'rinden' : 'rinde'} para siempre en Roma. <i>${f}</i>`
  };
  if (S.era === 21) return {   // EL FUTURO (era21-plan): la respuesta o la pregunta, en el valle del principio
    fases: { sin: 'POR CREAR', novedad: 'NOVEDAD', valle: 'JUNTA POLVO', formando: 'EN LA ESCUELA DEL VALLE', meseta: 'APRENDIDA' },
    comprar: 'Crear', formar: 'Formar maestros',
    casa: 'la escuela del valle',
    valleTxt: 'nadie lo sabe enseñar todavía en la escuela del valle. Formar maestros lo arregla.',
    formandoTxt: 'se enseña en las salas del anillo, con el patio a la vista…',
    docente: 'Maestra',
    nombres: ['Rocío, la maestra del patio', 'Joaquín, el de ciencias', 'Ayelén, la de lengua', 'Tomás, el de la biblioteca', 'Inés, la de los proyectos', 'la maestra que vino de lejos'],   // maestros inventados de hoy (ninguno es una persona real)
    te: '🧉 Mate', teToast: '🧉 Una ronda de mate en el patio, junto al fogón: la bombilla pasa de mano en mano y la clase se toma un respiro.',
    trimestre: m => `💰 La comunidad del valle sostiene su escuela: <b>${m}</b> ${monIco()}.`,
    hito: n => `⭐ ¡De todas partes preguntan por la escuela del valle! ${n ? `Llegan <b>${n} estudiantes</b>.` : 'Otras escuelas vienen a ver cómo se enseña aquí.'}`,
    llega: 'Llega', contratoToast: n => `🏡 <b>${n.charAt(0).toUpperCase() + n.slice(1)}</b> abre su sala en el anillo.`,
    formarToast: n => `🗣️ <b>${n}</b> ${/^(Los|Las) /.test(n) ? 'empiezan' : 'empieza'} a enseñarse en la escuela del valle…`,
    formadoToast: (n, f) => `🏡 <b>${n}</b> ya ${/^(Los|Las) /.test(n) ? 'rinden' : 'rinde'} para siempre en el valle. <i>${f}</i>`
  };
  if (S.era === 15) return {   // CHINA SONG (era15-plan): el examen
    fases: { sin: 'POR CREAR', novedad: 'NOVEDAD', valle: 'JUNTA POLVO', formando: 'EN LA SALA DE LOS CLÁSICOS', meseta: 'APRENDIDA' },
    comprar: 'Crear', formar: 'Formar maestros',
    casa: 'las escuelas de Kaifeng',
    valleTxt: 'nadie lo sabe enseñar todavía en las escuelas de Kaifeng. Formar maestros lo arregla.',
    formandoTxt: 'se enseña en la sala de los clásicos, con el pincel y la tinta…',
    docente: 'Maestro',
    nombres: ['Hu Yuan', 'Sun Fu', 'Shi Jie', 'Fan Zhongyan', 'Cheng Yi', 'el maestro de la escuela de aldea'],   // maestros reales de los Song del Norte (de Bary y Chaffee, Neo-Confucian Education); el último, uno de los que reprobaron
    te: '🍵 Té batido', teToast: '🍵 Té en polvo batido con la escobilla de bambú hasta que hace espuma: los maestros compiten a ver quién la deja más blanca.',
    trimestre: m => `💰 La prefectura paga sus escuelas con la renta de sus tierras: <b>${m}</b> ${monIco()}.`,
    hito: n => `⭐ ¡Las escuelas de Kaifeng se nombran de Hangzhou a Chengdu! ${n ? `Llegan <b>${n} estudiantes</b>.` : 'De todas las prefecturas mandan preguntar por tus maestros.'}`,
    llega: 'Nace', contratoToast: n => `🖌️ <b>${n.charAt(0).toUpperCase() + n.slice(1)}</b> abre su sala de los clásicos en Kaifeng.`,
    formarToast: n => `🗣️ <b>${n}</b> ${/^(Los|Las) /.test(n) ? 'empiezan' : 'empieza'} a enseñarse en las escuelas de Kaifeng…`,
    formadoToast: (n, f) => `🖌️ <b>${n}</b> ya ${/^(Los|Las) /.test(n) ? 'rinden' : 'rinde'} para siempre en Kaifeng. <i>${f}</i>`
  };
  if (S.era === 10) return {
    fases: { sin: 'POR CREAR', novedad: 'NOVEDAD', valle: 'JUNTA POLVO', formando: 'EN LAS ESCUELAS', meseta: 'APRENDIDA' },
    comprar: 'Crear', formar: 'Formar preceptores',
    casa: 'las escuelas de Chile',
    valleTxt: 'nadie lo sabe enseñar todavía en las escuelas de Chile. Formar preceptores lo arregla.',
    formandoTxt: 'se enseña en las escuelas, con el silabario y la pizarra…',
    docente: 'Preceptor',
    nombres: ['Andrés Bello', 'Antonia Tarragó', 'Manuel Montt', 'Isabel Le Brun', 'Miguel Luis Amunátegui', 'el preceptor de la escuela lancasteriana'],   // educadores reales del Chile del siglo XIX
    te: '🧉 Mate', teToast: '🧉 Un mate con los preceptores en el patio de la escuela: Sarmiento no daba clases sin el suyo.',
    trimestre: m => `💰 El Estado y los vecinos pagan las escuelas: <b>${m}</b> ${monIco()}.`,
    hito: n => `⭐ ¡Las escuelas de Chile se nombran de Lima a Buenos Aires! Llegan <b>${n} niños</b>.`,
    llega: 'Nace', contratoToast: n => `📜 <b>${n.charAt(0).toUpperCase() + n.slice(1)}</b> se suma a las escuelas de Chile.`,
    formarToast: n => n === 'La Escuela Normal' ? '🗣️ <b>La Escuela Normal</b> abre sus puertas: los primeros normalistas estudian para ir a los pueblos…'
      : `🗣️ <b>${n}</b> ${/^(Los|Las) /.test(n) ? 'empiezan' : 'empieza'} a enseñarse en las escuelas, con el silabario y la pizarra…`,
    formadoToast: (n, f) => `📜 <b>${n}</b> ya ${/^(Los|Las) /.test(n) ? 'rinden' : 'rinde'} para siempre en Chile. <i>${f}</i>`
  };
  if (S.era === 9) return {
    fases: { sin: 'POR CREAR', novedad: 'NOVEDAD', valle: 'JUNTA POLVO', formando: 'EN LAS IMPRENTAS', meseta: 'APRENDIDA' },
    comprar: 'Crear', formar: 'Formar maestros',
    casa: 'las imprentas de Ámsterdam',
    valleTxt: 'nadie lo sabe usar todavía en las imprentas y las escuelas de Ámsterdam. Formar maestros lo arregla.',
    formandoTxt: 'se aprende en los talleres y en las escuelas, con el libro impreso en la mano…',
    docente: 'Maestro',
    nombres: ['Joan Blaeu', 'Menasseh ben Israel', 'Anna Maria van Schurman', 'Lodewijk Elzevir', 'Willem Blaeu', 'el maestro de la escuela del barrio'],   // impresores y sabios reales de la República en el siglo XVII
    te: '🥛 Suero de leche', teToast: '🥛 Suero de leche y pan con queso: lo que se toma en Ámsterdam a media mañana, en el taller y en la escuela.',
    trimestre: m => `💰 Los libreros pagan lo vendido y la ciudad paga sus escuelas: <b>${m}</b> ${monIco()}.`,
    hito: n => `⭐ ¡Los libros de Ámsterdam se leen de Lisboa a Moscú! Llegan <b>${n} estudiantes</b>.`,
    llega: 'Nace', contratoToast: n => `📜 <b>${n.charAt(0).toUpperCase() + n.slice(1)}</b> abre su taller en Ámsterdam.`,
    formarToast: n => n === 'La prensa' ? '🗣️ <b>La prensa</b> empieza a tirar: el cajista compone, y lo compuesto se multiplica…'
      : `🗣️ <b>${n}</b> ${/^(Los|Las) /.test(n) ? 'empiezan' : 'empieza'} a aprenderse en los talleres y en las escuelas…`,
    formadoToast: (n, f) => `📜 <b>${n}</b> ya ${/^(Los|Las) /.test(n) ? 'rinden' : 'rinde'} para siempre en Ámsterdam. <i>${f}</i>`
  };
  if (S.era === 8) return {
    fases: { sin: 'POR CREAR', novedad: 'NOVEDAD', valle: 'JUNTA POLVO', formando: 'EN LAS ESCUELAS', meseta: 'APRENDIDA' },
    comprar: 'Crear', formar: 'Formar maestros',
    casa: 'las escuelas de París',
    valleTxt: 'nadie lo enseña todavía en las escuelas de París. Formar maestros lo arregla.',
    formandoTxt: 'se lee y se comenta en las escuelas, con el libro abierto…',
    docente: 'Maestro',
    nombres: ['Hugo de San Víctor', 'el maestro Guillermo de Champeaux', 'Pedro Lombardo', 'el maestro Juan de Salisbury', 'Ricardo de San Víctor', 'el canciller de Notre-Dame'],   // maestros reales de las escuelas de París en el siglo XII
    te: '🍷 Vino aguado', teToast: '🍷 Vino aguado y pan para los maestros: en el claustro se come callado, mientras alguien lee en voz alta.',
    trimestre: m => `💰 Las rentas de la abadía y el pago de los estudiantes llegan a las escuelas: <b>${m}</b> ${monIco()}.`,
    hito: n => `⭐ ¡Las escuelas de París se nombran de Bolonia a Oxford! Llegan <b>${n} estudiantes</b>.`,
    llega: 'Nace', contratoToast: n => `📜 <b>${n.charAt(0).toUpperCase() + n.slice(1)}</b> abre su escuela en París.`,
    formarToast: n => n === 'La campana y las horas' ? '🗣️ <b>La campana</b> empieza a partir el día: prima, sexta, nona, completas…'
      : `🗣️ <b>${n}</b> ${/^(Los|Las) /.test(n) ? 'empiezan' : 'empieza'} a leerse y comentarse en las escuelas, con el libro abierto…`,
    formadoToast: (n, f) => `📜 <b>${n}</b> ya ${/^(Los|Las) /.test(n) ? 'rinden' : 'rinde'} para siempre en París. <i>${f}</i>`
  };
  if (S.era === 7) return {
    fases: { sin: 'POR CREAR', novedad: 'NOVEDAD', valle: 'JUNTA POLVO', formando: 'EN LA ESCUELA', meseta: 'APRENDIDA' },
    comprar: 'Crear', formar: 'Formar maestros',
    casa: 'el calpulli',
    valleTxt: 'nadie lo enseña todavía en las escuelas del calpulli. Formar maestros lo arregla.',
    formandoTxt: 'se enseña en las escuelas del calpulli, de palabra y con el códice…',
    docente: 'Maestro',
    nombres: ['la partera Tlazohtzin', 'el tlamatini Ocelotzin', 'el tlacuilo Xiuhcóatl', 'la sacerdotisa Cihuacóatl', 'el maestro de canto Cuicani', 'el tonalpouhqui Tonatiuh'],   // oficios reales de Tenochtitlan (los nombres, del calendario y de las crónicas)
    te: '🍫 Chocolate', teToast: '🍫 Chocolate espumoso con vainilla para los maestros: cacao batido en agua, la bebida de los señores.',
    trimestre: m => `🛶 Las canoas del tributo llegan al embarcadero: <b>${m}</b> ${monIco()}.`,
    hito: n => `⭐ ¡Tenochtitlan se nombra de mar a mar! Llegan <b>${n} niños</b> a las escuelas.`,
    llega: 'Nace', contratoToast: n => `🌺 <b>${n.charAt(0).toUpperCase() + n.slice(1)}</b> se suma a los maestros del calpulli.`,
    formarToast: n => /^El (telpochcalli|calmécac)/.test(n) ? `🗣️ <b>${n}</b> abre sus puertas: los maestros reciben a los primeros muchachos…`
      : n === 'La palabra antigua' ? '🗣️ <b>La palabra antigua</b> se aprende de memoria: los viejos la dicen y los jóvenes la repiten, frase por frase…'
      : `🗣️ <b>${n}</b> ${/^(Los|Las) /.test(n) ? 'empiezan' : 'empieza'} a enseñarse en las escuelas del calpulli, de palabra y con el códice…`,
    formadoToast: (n, f) => `🌺 <b>${n}</b> ya ${/^(Los|Las) /.test(n) ? 'rinden' : 'rinde'} para siempre en Tenochtitlan. <i>${f}</i>`
  };
  if (S.era === 6) return {
    fases: { sin: 'POR CREAR', novedad: 'NOVEDAD', valle: 'JUNTA POLVO', formando: 'EN LA HALQA', meseta: 'APRENDIDA' },
    comprar: 'Crear', formar: 'Formar maestros',
    casa: 'la Casa de la Sabiduría',
    valleTxt: 'nadie lo enseña todavía en la halqa. Formar maestros lo arregla.',
    formandoTxt: 'se lee en la halqa, se copia en papel y se discute…',
    docente: 'Maestro',
    nombres: ['el librero al-Jahiz', 'el traductor Thabit ibn Qurra', 'la calígrafa Shuhda', 'el astrónomo al-Farghani', 'el médico al-Razi', 'el filósofo al-Kindi'], // todos de Bagdad o de su órbita: Thabit tradujo a Euclides y a Ptolomeo, al-Razi dirigió el hospital de Bagdad, al-Kindi fue «el filósofo de los árabes»
    te: '🍯 Sorbete', teToast: '🍯 Sorbete de rosas y dátiles para los maestros: de sharab, «bebida», viene «jarabe».',
    trimestre: m => `🌾 El impuesto de la tierra del Sawad llega al tesoro del califa: <b>${m}</b> ${monIco()}.`,
    hito: n => `⭐ ¡Bagdad se nombra de Córdoba a Samarcanda! Llegan <b>${n} estudiantes</b>.`,
    llega: 'Nace', contratoToast: n => `🌙 <b>${n.charAt(0).toUpperCase() + n.slice(1)}</b> se suma a los maestros de la halqa.`,
    // la Casa de la Sabiduría se nombra a sí misma: «empieza a enseñarse en la Casa de la Sabiduría» no
    formarToast: n => n === 'La Casa de la Sabiduría' ? '🗣️ <b>La Casa de la Sabiduría</b> abre sus cofres: se lee en voz alta, se copia en papel…'
      : /^La halqa/.test(n) ? '🗣️ <b>La halqa</b> se forma junto a la columna de la mezquita: el maestro lee, los estudiantes copian y preguntan…'   // la halqa no se enseña «en la halqa»
      : n === 'La madrasa' ? '🗣️ <b>La madrasa</b> abre su patio: maestros con sueldo, estudiantes con techo, y el waqf que lo paga…'
      : `🗣️ <b>${n}</b> ${/^(Los|Las) /.test(n) ? 'empiezan' : 'empieza'} a enseñarse en la halqa: se lee, se copia en papel y se discute…`,
    formadoToast: (n, f) => `🌙 <b>${n}</b> ya ${/^(Los|Las) /.test(n) ? 'rinden' : 'rinde'} para siempre en Bagdad. <i>${f}</i>`
  };
  if (S.era === 5) return {
    fases: { sin: 'POR CREAR', novedad: 'NOVEDAD', valle: 'JUNTA POLVO', formando: 'COPIANDO', meseta: 'APRENDIDA' },
    comprar: 'Crear', formar: 'Formar maestros',
    casa: 'el Museo',
    valleTxt: 'nadie usa aún este saber en el Museo. Formar maestros lo arregla.',
    formandoTxt: 'se lee, se copia y se discute en la sala común…',
    docente: 'Maestro',
    nombres: ['el bibliotecario Eratóstenes', 'el poeta Calímaco', 'el médico Herófilo', 'el gramático Aristófanes', 'el geómetra Apolonio', 'el joven Aristarco'], // todos del Museo de verdad: Calímaco hizo los Pínakes, Herófilo abrió cuerpos para estudiarlos, Aristófanes de Bizancio y Aristarco de Samotracia fueron bibliotecarios
    te: '🍲 Comida común', teToast: '🍲 La comida común del Museo: el rey invita, y los sabios discuten con la boca llena.',
    trimestre: m => `🌾 El tributo del grano del Nilo llega al palacio y el rey paga el Museo: <b>${m}</b> ${monIco()}.`,
    hito: n => `⭐ ¡La Biblioteca se nombra en todos los puertos! Llegan <b>${n} estudiantes</b>.`,
    llega: 'Nace', contratoToast: n => `📜 <b>${n.charAt(0).toUpperCase() + n.slice(1)}</b> se suma a los sabios del Museo.`,
    formarToast: n => n === 'El Museo' ? '🗣️ <b>El Museo</b> abre sus salas: se lee, se copia y se discute…'
      : `🗣️ <b>${n}</b> ${/^(Los|Las) /.test(n) ? 'empiezan' : 'empieza'} a enseñarse en el Museo: se lee, se copia y se discute…`,
    formadoToast: (n, f) => `📜 <b>${n}</b> ya ${/^(Los|Las) /.test(n) ? 'rinden' : 'rinde'} para siempre en Alejandría. <i>${f}</i>`
  };
  if (ordEra(S.era) < 11) return {
    fases: { sin: 'POR CREAR', novedad: 'NOVEDAD', valle: 'JUNTA POLVO', formando: 'ENCENDIENDO', meseta: 'APRENDIDA' },
    comprar: 'Crear', formar: 'Encender el saber',
    casa: 'el clan',   // «el círculo» se confundía con el saber «círculo de historias» (QA completo)
    valleTxt: 'nadie sabe aún usarlo en el círculo. Encender el saber lo arregla.',
    formandoTxt: 'el saber prende de guía en guía…',
    docente: 'Guía',
    nombres: ['la Mayor', 'el rastreador Ur', 'la recolectora Mosa', 'el tallador Bren', 'la ceramista Tera', 'el cazador Tor'], // sin tocayos: Naia alfarera, Kel tejedor e Ila recolectora ya existen como fichas
    te: '🌿 Hierbas', teToast: '🌿 Una pausa de hierbas junto al fuego.',
    // OJO: no decir "cambia la estación" aquí. Este ingreso llega cada 60 s y las estaciones del año
    // duran 150 s: el jugador vería "cambia la estación" a destiempo del otoño que tiene delante.
    // El reparto de lo forrajeado es además lo que de verdad hacía un clan: reciprocidad, no trimestre.
    trimestre: m => `🤝 El reparto: lo que todos juntaron suma <b>${m}</b> ${monIco()}.`,
    hito: n => `⭐ ¡El fuego del clan se ve desde lejos! Se suman <b>${n} pequeños</b>.`,
    llega: 'Nace', contratoToast: n => `🔥 <b>${n.charAt(0).toUpperCase() + n.slice(1)}</b> se une a los guías del clan.`,
    formarToast: n => `🗣️ Los mayores acercan <b>${minusNom(n)}</b> al fuego de cada guía…`,
    formadoToast: (n, f) => { const [de, ...r] = deNom(n).split(' '); return `🔥 El saber ${de} <b>${r.join(' ')}</b> ya arde en cada guía: rinde para siempre. <i>${f}</i>`; }
  };
  return {
    fases: { sin: 'SIN COMPRAR', novedad: 'NOVEDAD', valle: 'JUNTA POLVO', formando: 'FORMANDO', meseta: 'APRENDIDA' },
    comprar: 'Comprar', formar: 'Formar docentes',
    casa: 'el aula',
    valleTxt: 'nadie lo integró a la clase. Formar docentes lo arregla.',
    formandoTxt: 'la formación avanza…',
    docente: 'Docente',
    nombres: BALANCE.docente.nombres,
    te: '☕ Té', teToast: '☕ Pausa de té en la sala de profesores.',
    trimestre: m => `🏛️ Fin de trimestre: subvención de <b>${m}</b> ${monIco()}.`,
    hito: n => `⭐ ¡El aula suena en el pueblo! Llegan <b>${n} alumnos</b> nuevos.`,
    llega: 'Llega', contratoToast: n => `👩‍🏫 Se suma <b>${n}</b> al claustro.`,
    formarToast: n => `📚 Comienza la formación docente en <b>${n}</b>.`,
    formadoToast: (n, f) => `🎓 Docentes formados en <b>${n}</b>: ahora sí rinde, para siempre. <i>${f}</i>`
  };
}                                 // el aula anexa agranda el claustro
function unidadesExtra() {
  let u = S.dewey === 2 ? BALANCE.dewey.unidades : 0;                                 // el patio que enseña
  u += diadas();                                                                      // en la orilla, el pequeño ya produce: cuenta como uno más
  u += cercaExtra();                                                                  // la tutoría de las guías que enseñan de cerca
  if (S.freire === 2 && S.tecs[4] && S.tecs[4].fase === 'meseta') u += 3;             // la radio se vuelve diálogo (Sutatenza)
  return u;
}
function transicion() { return S.deweyT > 0 ? 0.9 : 1; }                              // reorganizar el aula cuesta
function kermesseCosto() { return BALANCE.kermesse.costo * (ordEra(S.era) >= 13 ? 4 : 1); }
function kermesseRinde() { return Math.round(BALANCE.kermesse.rinde * (ordEra(S.era) >= 13 ? 4 : 1) * (S.freire === 2 ? 1.5 : 1)); }
/* EL RELOJ DEL MUNDO PARA EL RENDER.
   S.tiempoJuego es la verdad (economía), pero solo late 4 veces por segundo: vive en el setInterval de
   250 ms para sobrevivir en segundo plano. Usarlo DIRECTO para pintar movía el mundo a 4 fps: la luz
   escalonada y, sobre todo, el clan caminando a su sitio en la velada a tirones. Ese era el movimiento
   "estroboscópico". Aquí el reloj avanza cada frame y se re-engancha con suavidad al de verdad, que
   sigue mandando: si se separan mucho (pestaña dormida, carga de partida) salta y se pone al día. */
let tJuegoVis = 0;
/* LA PORTADA ES UNA PAUSA (A2 del QA completo): mientras se lee (al empezar o con «?»), ni la economía ni el mundo
   avanzan; antes el saber subía y los avisos se apilaban debajo de la portada. */
function enPausa() { return typeof visible === 'function' && (visible(document.getElementById('portada')) || visible(document.getElementById('secreto') || document.body) || visible(document.getElementById('catalogo') || document.body) || visible(document.getElementById('traducir') || document.body) || visible(document.getElementById('promesa') || document.body) || visible(document.getElementById('horario') || document.body) || visible(document.getElementById('componer') || document.body) || visible(document.getElementById('mapa') || document.body) || visible(document.getElementById('escuelas') || document.body) || visible(document.getElementById('examen') || document.body)); }
function avanzarRelojVisual(dtAnim) {
  if (enPausa()) return;
  tJuegoVis += dtAnim * warp;
  const desfase = S.tiempoJuego - tJuegoVis;
  /* El salto de aquí era EL TELETRANSPORTE MASIVO (visto jugando, 2026-08-02): cualquier hipo del
     navegador (otra pestaña un momento, un GC, el audio arrancando) separaba los relojes más de 2 s
     y todo el clan se re-colocaba de golpe, porque cada paseo lee tJuegoVis. Ahora los desfases
     medianos se ALCANZAN caminando: el reloj visual corre hasta 3× un instante y se lee como gente
     apurada, no como magia. El enganche seco queda solo para ausencias de verdad (>60 s), donde la
     puesta al día de recuperarAusencia ya cuenta esa historia. */
  if (Math.abs(desfase) > 60) tJuegoVis = S.tiempoJuego;
  else if (Math.abs(desfase) > 0.5) tJuegoVis += Math.sign(desfase) * Math.min(Math.abs(desfase), dtAnim * warp * 2);
  else tJuegoVis += desfase * 0.06;                                // deriva normal: corregir sin que se note
}
function atardece() { const f = ((tJuegoVis % 150) / 150); return epocaConstruida(S.era) && S.fuegoDescubierto && f > 0.12 && f < 0.25; } // la tarde que cae hacia la noche (luzDia baja)
function luzDia() { // nivel de luz en las épocas construidas: 1 = pleno día, 0 = noche cerrada
  if (!epocaConstruida(S.era)) return 1; // la noche vive en las épocas construidas (2026-08-24, c08: antes era una lista blanca a mano, y Sumer se publicó sin noche por olvidarla; el flag vive en ARCO_EPOCAS)
  if (!S.fuegoDescubierto) return 0.32;                           // antes del fuego: crepúsculo frío, sin ciclo
  const CICLO = 150;                                               // 150 s por vuelta completa día→noche→día
  const f = ((tJuegoVis % CICLO) / CICLO) * Math.PI * 2;
  return 0.5 + 0.5 * Math.cos(f);                                  // arranca de día y desciende a la medianoche
}
/* ---------- LAS CUATRO ESTACIONES ----------
   El año del clan: una estación por cada vuelta día→noche→día (150 s), así que el año dura 10 minutos
   y el corte cae SIEMPRE en la medianoche, con el mundo a oscuras: el clan se duerme en una estación y
   amanece en la siguiente, sin costura visible. Es la Época 1 quien las vive: la estepa tiene año, el
   desierto de la Casa de la Vida tiene crecida, y el aula de 1920 tiene trimestres.
   No tocan la economía: no hay inviernos que castiguen ni cosechas que se pierdan (esto es cozy).
   Lo que hacen es enseñar por presencia: el clan que aprende a leer el año es el que después siembra. */
const DUR_ESTACION = 150;
const ESTACIONES = [
  { n: 'primavera', ico: '🌸', el: 'la', dice: 'la estepa florece',
    pastoA: '#a6c95c', pastoB: '#9bbf54', tierraA: '#c4a878', tierraB: '#bb9f6c', punto: '#a2855c', arena: '#e8d5a4', bordeL: '#79ad4e', bordeR: '#699c42', mata: '#7fa84a',
    silvestre: ['#a6c95c', '#9fc356', '#aecf63', '#a2c558', '#a9cb5f'],
    copaD: '#4a7d33', copaM: '#6aa04a', copaL: '#93c46a', brote: '#f2b8d0', nieve: 0 },
  { n: 'verano', ico: '☀️', el: 'el', dice: 'la hierba se dora al sol',
    pastoA: '#bcbd6d', pastoB: '#b2b465', tierraA: '#c9a36a', tierraB: '#c19a5f', punto: '#a9885c', arena: '#e8d5a4', bordeL: '#6f9c46', bordeR: '#5f8c3e', mata: '#93974e',
    silvestre: ['#bcbd6d', '#b5b665', '#c2c374', '#b9ba6a', '#bfc06f'],
    copaD: '#3f6b2c', copaM: '#5c8c40', copaL: '#7fae59', brote: '#e8d873', nieve: 0 },
  { n: 'otoño', ico: '🍂', el: 'el', dice: 'la hoja cae y se guarda el grano',
    pastoA: '#c2a95c', pastoB: '#b89f53', tierraA: '#bd9459', tierraB: '#b48c52', punto: '#9c7748', arena: '#e0cb98', bordeL: '#a08442', bordeR: '#8f7439', mata: '#a8873f',
    silvestre: ['#c2a95c', '#bba055', '#c9b165', '#b89d52', '#c5ac60'],
    copaD: '#8a5324', copaM: '#c07a2c', copaL: '#dda23f', brote: '#c95f33', nieve: 0 },
  { n: 'invierno', ico: '❄️', el: 'el', dice: 'la noche es larga y el fuego, todo',
    pastoA: '#d6dcd6', pastoB: '#cbd2cd', tierraA: '#c0bcb4', tierraB: '#b6b2ab', punto: '#9a968f', arena: '#e2e7e4', bordeL: '#b9c2bc', bordeR: '#a8b2ac', mata: '#93a08f',
    silvestre: ['#d6dcd6', '#cdd4ce', '#dee4de', '#c8d0ca', '#d9dfd9'],
    copaD: '#5d6b5a', copaM: '#7d8a78', copaL: '#e4eae6', brote: '#ffffff', nieve: 1 }
];
/* EL AÑO DE SUMER (2026-08-04, del ojo del jugador: «las estaciones se fueron de este planeta»).
   Mesopotamia no tiene la estepa: tiene EL RÍO. Su año es la crecida que verdea las riberas y ensancha
   el cauce, el verano que lo reseca todo, la siembra que dora las parcelas, y las lluvias del invierno
   suave (aquí no nieva). Mismo reloj y mismo cruce de medianoche que la Época 1. */
const ESTACIONES_SUMER = [
  { n: 'crecida', ico: '🌊', el: 'la', // n SIN artículo: el toast ya pone `el.n` (el «la la crecida» vivió aquí hasta el 2026-08-24)
    dice: 'el río sube y regala limo',
    bordeL: '#8aa84e', bordeR: '#78963c',
    limo: ['#bcc178', '#b4ba6e', '#c4c982', '#aeb468', '#bfc47c'],
    riberaA: '#c3b980', riberaB: '#b9ae72', campoA: '#a99a5c', campoB: '#9e8f51',
    ribera: '#a9a061', humedo: '#8f9c5e', aguaBaja: '#78a6ae', cauce: '#5d95a6', hondo: '#4d8ba6',
    crecida: 1.22, nieve: 0 },
  { n: 'verano', ico: '☀️', el: 'el', dice: 'el sol aprieta y el barro se agrieta',
    bordeL: '#93a552', bordeR: '#82923f',
    limo: ['#cabf7c', '#c3b872', '#d1c684', '#bdb06a', '#c8bd78'],
    riberaA: '#ccb885', riberaB: '#c2ad77', campoA: '#b49b5f', campoB: '#a98f54',
    ribera: '#b3a065', humedo: '#9c9a66', aguaBaja: '#7aa0a8', cauce: '#5f90a0', hondo: '#4f86a0',
    crecida: 1.0, nieve: 0 },
  { n: 'siembra', ico: '🌾', el: 'la', dice: 'las parcelas se abren y el grano baja a la tierra',
    bordeL: '#9c9a48', bordeR: '#8a8838',
    limo: ['#c9b46a', '#c1ab60', '#d0bc74', '#bba55a', '#c6b168'],
    riberaA: '#c8b07a', riberaB: '#bda56c', campoA: '#a2854a', campoB: '#967a41',
    ribera: '#ae9a5e', humedo: '#98935c', aguaBaja: '#7a9ea4', cauce: '#5f8e9c', hondo: '#4f849c',
    crecida: 0.94, nieve: 0 },
  { n: 'lluvias', ico: '🌧️', el: 'las', dice: 'el cielo riega lo sembrado',
    bordeL: '#84945a', bordeR: '#748448',
    limo: ['#b3b382', '#abab78', '#bbbb8c', '#a5a572', '#b6b686'],
    riberaA: '#b8ab80', riberaB: '#aea173', campoA: '#9c8c58', campoB: '#91814e',
    ribera: '#9f965f', humedo: '#87905c', aguaBaja: '#7099a4', cauce: '#578a9c', hondo: '#48809c',
    crecida: 1.08, nieve: 0 }
];
/* EL AÑO DE EGIPTO SON TRES ESTACIONES, como el año egipcio real: ajet (la crecida que cubre la vega),
   péret (el agua se retira y se siembra el limo) y shemu (el sol dora y se cosecha). Es la primera
   tabla de largo distinto de 4: estacion() y drawClimaEstacion ya toleran cualquier largo. Los campos
   de color (vega, aguas, bordes) los consume la tanda de dibujo de la época; `crecida` ya ensancha.
   Los colores del agua y del limo se separaron el 2026-08-24 (el año «apenas se notaba»): en ajet el
   río baja TURBIO de limo y el barro que cubre es casi negro; al retirarse en péret el agua se aclara
   y deja al descubierto la tierra negra que se siembra; en shemu queda un hilo bajo y transparente
   entre orillas resecas. Antes los tres juegos de aguas se diferenciaban en menos de un 4% de tono. */
const ESTACIONES_EGIPTO = [
  { n: 'crecida (ajet)', ico: '🌊', el: 'la', dice: 'el río cubre la vega y paga en limo',
    bordeL: '#8aa04e', bordeR: '#78903c',
    vega: ['#8fae52', '#86a54a', '#98b75c', '#7f9e45', '#93b256'],
    ribera: '#8f8657', humedo: '#6f7c4a', aguaBaja: '#6f9a9b', cauce: '#537f8d', hondo: '#42707f',
    crecida: 1.35, nieve: 0 },
  { n: 'siembra (péret)', ico: '🌱', el: 'la', dice: 'el agua se retira y el grano baja al limo',
    bordeL: '#98a050', bordeR: '#869040',
    vega: ['#a3ae5e', '#9aa656', '#adb768', '#93a04f', '#a8b263'],
    ribera: '#a89a63', humedo: '#7c7c4e', aguaBaja: '#79a6b4', cauce: '#5b8fa6', hondo: '#487f9c',
    crecida: 0.95, nieve: 0 },
  { n: 'cosecha (shemu)', ico: '🌾', el: 'la', dice: 'el sol aprieta y la vega se dora',
    bordeL: '#a89a4c', bordeR: '#968a3e',
    vega: ['#c2b169', '#b9a860', '#ccba73', '#b09f57', '#c6b56d'],
    ribera: '#c2ae76', humedo: '#a89b62', aguaBaja: '#8bbccb', cauce: '#6aa3b9', hondo: '#528cab',
    crecida: 0.8, nieve: 0 }
];
/* EL AÑO DEL ÁGORA: cuatro estaciones mediterráneas (era4-plan). Primavera de las Dionisias, verano de
   cigarras, otoño de la oliva (el olivar se llena de gente) e invierno de lluvias con la stoa como
   refugio. El campo es el Ática: pasto seco y dorado, no la estepa. `crecida` mueve el Ilisos. */
const ESTACIONES_AGORA = [
  { n: 'primavera', ico: '🌸', el: 'la', dice: 'las Dionisias: el coro canta y el campo florece',
    bordeL: '#8ea45a', bordeR: '#7c9248',
    campo: ['#b9c07a', '#b0b872', '#c2c884', '#a9b16b', '#bcc27e'], ribera: '#a8a870', humedo: '#8f9a60', aguaBaja: '#7aa6b4', cauce: '#5d95aa', hondo: '#4b88a4',
    crecida: 1.1, nieve: 0 },
  { n: 'verano', ico: '☀️', el: 'el', dice: 'las cigarras: el sol seca el Ática y la palestra busca sombra',
    bordeL: '#a89e52', bordeR: '#968c42',
    campo: ['#cfc07a', '#c6b870', '#d6c884', '#bfb16a', '#cbbd78'], ribera: '#b8aa6c', humedo: '#a29c60', aguaBaja: '#86b0bc', cauce: '#679cb0', hondo: '#558eaa',
    crecida: 0.8, nieve: 0 },
  { n: 'otoño', ico: '🫒', el: 'el', dice: 'la oliva: el olivar se llena de gente y de cestas',
    bordeL: '#a19555', bordeR: '#8f8445',
    campo: ['#c5b774', '#bcae6a', '#cdbf7e', '#b5a764', '#c1b370'], ribera: '#b0a468', humedo: '#98955e', aguaBaja: '#7ea8b4', cauce: '#6194a8', hondo: '#4f86a2',
    crecida: 0.95, nieve: 0 },
  { n: 'lluvias', ico: '🌧️', el: 'las', dice: 'el cielo moja el Ática y la stoa se llena de conversaciones',
    bordeL: '#87985a', bordeR: '#758648',
    campo: ['#aeb680', '#a6ae78', '#b6be88', '#9fa772', '#aab282'], ribera: '#9c9c68', humedo: '#849260', aguaBaja: '#7099a6', cauce: '#568a9e', hondo: '#46809c',
    crecida: 1.25, nieve: 0 }
];
/* EL AÑO DE ALEJANDRÍA: el mar abierto y el mar cerrado (era5-plan). Primavera, cuando vuelven los barcos; verano, el
   solsticio de la sombra y los vientos etesios; otoño, la flota del grano que zarpa a Roma; invierno, MAR CERRADO: casi
   nadie navegaba (Vegecio, Epitoma IV 39), y la Biblioteca se llenaba de lectores. `campo` es la arena de la ciudad. */
/* EL AÑO DE BAGDAD (era6-plan): la crecida del Tigris en primavera, con el deshielo de las montañas, cuando llegan las
   caravanas; el CALOR del verano, cuando de día la ciudad se esconde, se duerme en las azoteas y las caravanas esperan
   el fresco (es el tiempo de traducir lo juntado); los dátiles del otoño; las lluvias del invierno. `campo` es la tierra
   de la ciudad y de los palmerales. */
const ESTACIONES_BAGDAD = [
  { n: 'primavera', ico: '🌊', el: 'la', dice: 'la crecida del Tigris, con el deshielo de las montañas, y llegan las caravanas',
    bordeL: '#b9ad74', bordeR: '#a79b62', campo: ['#d6c99a', '#cdc090', '#ddd1a4', '#c7ba8a', '#d2c596'], crecida: 1.2, nieve: 0 },
  { n: 'verano', ico: '☀️', el: 'el', dice: 'el calor (de día la ciudad se esconde, se duerme en las azoteas y las caravanas esperan el fresco)',
    bordeL: '#c8b26c', bordeR: '#b6a05c', campo: ['#e6d3a0', '#dfca95', '#ecdaa9', '#d8c38d', '#e2ce9b'], crecida: 0.85, nieve: 0 },
  { n: 'otoño', ico: '🌴', el: 'el', dice: 'los dátiles (el palmeral se cosecha) y vuelven a salir las caravanas',
    bordeL: '#bea869', bordeR: '#ac9658', campo: ['#dbcb96', '#d3c38d', '#e1d2a0', '#cdbd88', '#d7c793'], crecida: 0.95, nieve: 0 },
  { n: 'invierno', ico: '🌧️', el: 'el', dice: 'las lluvias (la halqa se junta bajo techo) y el Tigris empieza a subir',
    bordeL: '#a6a571', bordeR: '#949460', campo: ['#cdc69c', '#c5be94', '#d4cda6', '#bfb88e', '#c9c298'], crecida: 1.05, nieve: 0 }
];
/* EL AÑO DE PARÍS (era8-plan): la primavera del Sena crecido; el verano de la feria del Lendit, donde se compra el
   pergamino; el otoño, cuando empieza el curso (San Remigio); el invierno de nieve y velas largas. */
const ESTACIONES_PARIS = [
  { n: 'primavera', ico: '🌱', el: 'la', dice: 'el Sena crecido y los árboles en flor en los huertos de las abadías',
    bordeL: '#93a868', bordeR: '#819658', campo: ['#a9b97e', '#a1b176', '#b0c086', '#9bab70', '#a6b67b'], crecida: 1.12, nieve: 0 },
  { n: 'verano', ico: '🐑', el: 'el', dice: 'la feria del Lendit (se compra el pergamino) y las cosechas',
    bordeL: '#b0a65e', bordeR: '#9e9450', campo: ['#c2b97c', '#bab174', '#c9c086', '#b4ab6e', '#beb578'], crecida: 0.9, nieve: 0 },
  { n: 'otoño', ico: '🍂', el: 'el', dice: 'el curso empieza el día de San Remigio y vuelven los estudiantes',
    bordeL: '#b0905a', bordeR: '#9e7e4a', campo: ['#bfa572', '#b79d6a', '#c6ad7c', '#b19764', '#bba16e'], crecida: 1.0, nieve: 0 },
  { n: 'invierno', ico: '❄️', el: 'el', dice: 'la nieve (las velas largas, y se lee hasta tarde)',
    bordeL: '#a4a8aa', bordeR: '#92969a', campo: ['#d8dcd8', '#d0d4d0', '#e0e4e0', '#c8ccc8', '#d4d8d4'], crecida: 1.05, nieve: 1 }
];
/* EL AÑO DE ROMA (era14-plan): las Quinquatrias de marzo, la fiesta de Minerva (vacaciones, y el día en que se le pagaba al
   maestro: el minerval); el verano en que los niños descansan (Marcial X, 62: «si los niños están sanos en verano, ya aprenden
   bastante»; las escuelas avanzan más lento); la vendimia de otoño y la vuelta a clases (el pedagogo trae a los niños el doble
   de seguido); las Saturnales de diciembre, con velas y regalos y la escuela cerrada (el ánimo sube). */
const ESTACIONES_ROMA = [
  { n: 'primavera', ico: '🦉', el: 'la', dice: 'las Quinquatrias de marzo, la fiesta de Minerva: los padres le pagan al maestro el minerval',
    bordeL: '#98a86a', bordeR: '#86965a', campo: ['#b4bf86', '#acb77e', '#bbc68e', '#a6b178', '#b0bb82'], crecida: 1.1, nieve: 0 },
  { n: 'verano', ico: '☀️', el: 'el', dice: 'el calor y las vacaciones: «si los niños están sanos en verano, ya aprenden bastante» (Marcial)',
    bordeL: '#b8a864', bordeR: '#a69656', campo: ['#d2c48c', '#cabc84', '#d8cb96', '#c4b67e', '#cec088'], crecida: 0.85, nieve: 0 },
  { n: 'otoño', ico: '🍇', el: 'el', dice: 'la vendimia en las colinas y la vuelta a clases: el pedagogo trae a los niños nuevos',
    bordeL: '#b0925a', bordeR: '#9e804a', campo: ['#c4aa74', '#bca26c', '#cab27e', '#b69c66', '#c0a670'], crecida: 1.0, nieve: 0 },
  { n: 'invierno', ico: '🕯️', el: 'el', dice: 'las Saturnales de diciembre: velas, regalos y la escuela cerrada',
    bordeL: '#94a07a', bordeR: '#828e6a', campo: ['#a8b28c', '#a0aa84', '#b0ba94', '#9aa47e', '#a4ae88'], crecida: 1.25, nieve: 0 }
];
/* EL AÑO DE KAIFENG (era15-plan): el Qingming de la primavera, cuando toda la ciudad sale a barrer las tumbas y vuelve por
   el puente (el día del rollo de Zhang Zeduan), y el examen de la primavera; las barcas del dragón del quinto mes; la luna
   de otoño, cuando las tabernas cuelgan banderas nuevas y venden el vino nuevo (Meng Yuanlao, Dongjing meng Hua lu, 1147);
   y el invierno de la nieve sobre los tejados grises, que termina con el año nuevo y la fiesta de los Faroles: cinco
   noches de linternas en las calles. `crecida` mueve el Bian (bajo en invierno, crecido con las lluvias del verano). */
const ESTACIONES_KAIFENG = [
  { n: 'primavera', ico: '🌿', el: 'la', dice: 'el Qingming: la ciudad sale a barrer las tumbas y vuelve por el puente con ramas de sauce; y el examen de la primavera',
    bordeL: '#9aae6c', bordeR: '#889c5c', campo: ['#bcc488', '#b4bc80', '#c3cb90', '#adb57a', '#b8c084'], crecida: 1.0, nieve: 0 },
  { n: 'verano', ico: '🐉', el: 'el', dice: 'las barcas del dragón del quinto mes: tambores y remos sobre el río, y el calor húmedo del Bian crecido',
    bordeL: '#a4ac62', bordeR: '#929a54', campo: ['#c4c482', '#bcbc7a', '#cbcb8c', '#b6b674', '#c0c07e'], crecida: 1.2, nieve: 0 },
  { n: 'otoño', ico: '🌕', el: 'el', dice: 'la luna de otoño: las tabernas cuelgan banderas nuevas, venden el vino nuevo y la ciudad sube a mirarla',
    bordeL: '#b29a5e', bordeR: '#a0884e', campo: ['#cdb57e', '#c5ad76', '#d3bc88', '#bfa770', '#c9b17a'], crecida: 1.0, nieve: 0 },
  { n: 'invierno', ico: '🏮', el: 'el', dice: 'la nieve sobre los tejados grises y, con el año nuevo, la fiesta de los Faroles: cinco noches de linternas en la calle',
    bordeL: '#a4a8ac', bordeR: '#92969c', campo: ['#d8dad6', '#d0d2ce', '#e0e2de', '#c8cac6', '#d4d6d2'], crecida: 0.8, nieve: 0.8 }
];
/* EL AÑO DE SANTIAGO (era10-plan): la primavera de los álamos y las Fiestas Patrias de septiembre; el verano del calor y
   el Mapocho bajo; el otoño de la vendimia; el invierno de la lluvia y el río crecido, con la cordillera nevada. */
const ESTACIONES_SANTIAGO = [
  { n: 'primavera', ico: '🇨🇱', el: 'la', dice: 'los álamos de la Alameda y las Fiestas Patrias de septiembre, con sus fondas',
    bordeL: '#94ac68', bordeR: '#829a58', campo: ['#a8be7c', '#a0b674', '#afc584', '#9aaf6e', '#a4ba78'], crecida: 1.0, nieve: 0 },
  { n: 'verano', ico: '☀️', el: 'el', dice: 'el calor de enero y el Mapocho bajo, casi seco',
    bordeL: '#b4aa66', bordeR: '#a29858', campo: ['#c8bc84', '#c0b47c', '#cfc38c', '#bab076', '#c4b880'], crecida: 0.75, nieve: 0 },
  { n: 'otoño', ico: '🍇', el: 'el', dice: 'la vendimia en las chacras de los alrededores',
    bordeL: '#b09258', bordeR: '#9e8048', campo: ['#c0a670', '#b89e68', '#c7ad7a', '#b29862', '#bca26c'], crecida: 0.95, nieve: 0 },
  { n: 'invierno', ico: '🌧️', el: 'el', dice: 'la lluvia, el Mapocho crecido y la cordillera blanca',
    bordeL: '#8a9a7a', bordeR: '#788868', campo: ['#9aaa86', '#92a27e', '#a2b28e', '#8c9c78', '#96a682'], crecida: 1.3, nieve: 0 }
];
/* EL AÑO DE ÁMSTERDAM (era9-plan): los tulipanes y la feria del libro de Fráncfort; los barcos de las Indias en el IJ; el
   arenque y las tormentas; el hielo, cuando los canales se congelan y se patina. `hielo` congela el agua en el 3D. */
const ESTACIONES_AMSTERDAM = [
  { n: 'primavera', ico: '🌷', el: 'la', dice: 'los tulipanes y la feria del libro de Fráncfort, adonde van los impresores',
    bordeL: '#8aa868', bordeR: '#789658', campo: ['#9fbe74', '#97b66c', '#a6c47c', '#91b066', '#9cba70'], crecida: 1.05, nieve: 0 },
  { n: 'verano', ico: '⛵', el: 'el', dice: 'los barcos de las Indias en el IJ, cargados de especias y de noticias',
    bordeL: '#a4ae5e', bordeR: '#929c50', campo: ['#b8c07a', '#b0b872', '#bfc784', '#aab26c', '#b4bc76'], crecida: 0.95, nieve: 0 },
  { n: 'otoño', ico: '🐟', el: 'el', dice: 'el arenque y las tormentas del mar del Norte',
    bordeL: '#a89060', bordeR: '#967e50', campo: ['#b4a272', '#ac9a6a', '#bba97c', '#a69464', '#b09e6e'], crecida: 1.08, nieve: 0 },
  { n: 'invierno', ico: '⛸️', el: 'el', dice: 'los canales helados: se patina, y las prensas siguen',
    bordeL: '#a4a8ac', bordeR: '#92969c', campo: ['#d8dcdc', '#d0d4d4', '#e0e4e4', '#c8cccc', '#d4d8d8'], crecida: 1.0, nieve: 0.7, hielo: 1 }
];
/* EL AÑO DE TENOCHTITLAN (era7-plan): la seca y fresca, con el cielo limpio y los volcanes nevados; la seca y cálida, cuando
   el lago baja; las lluvias, cuando las chinampas verdean y el lago sube; y la cosecha del maíz, con sus fiestas. `campo`
   es la tierra de la isla y de las orillas; `crecida` mueve el nivel del lago. */
const ESTACIONES_TENOCHTITLAN = [
  { n: 'seca fresca', ico: '🌋', el: 'la', dice: 'el cielo limpio y los volcanes nevados, y las canoas cruzan el lago en calma',
    bordeL: '#a8a26c', bordeR: '#96905a', campo: ['#c9c08e', '#c1b885', '#d0c798', '#bbb27f', '#c5bc8a'], crecida: 1.0, nieve: 0 },
  { n: 'seca cálida', ico: '☀️', el: 'la', dice: 'el calor (el lago baja y asoman las orillas)',
    bordeL: '#b9a764', bordeR: '#a79554', campo: ['#d6c58f', '#cebd86', '#ddcd99', '#c8b77f', '#d2c18b'], crecida: 0.88, nieve: 0 },
  { n: 'lluvias', ico: '🌧️', el: 'las', dice: 'las lluvias (las chinampas verdean y el lago sube)',
    bordeL: '#8fa765', bordeR: '#7d9555', campo: ['#a9bd84', '#a1b57c', '#b0c48c', '#9bae76', '#a6ba81'], crecida: 1.12, nieve: 0 },
  { n: 'cosecha', ico: '🌽', el: 'la', dice: 'el maíz (se cosecha la milpa y hay fiesta en los barrios)',
    bordeL: '#b5a467', bordeR: '#a39257', campo: ['#cfc08a', '#c7b882', '#d6c794', '#c1b27c', '#cbbc86'], crecida: 1.05, nieve: 0 }
];
const ESTACIONES_ALEJANDRIA = [
  { n: 'primavera', ico: '⛵', el: 'la', dice: 'se abre el mar y vuelven los barcos con su carga',
    bordeL: '#b8a868', bordeR: '#a69656', campo: ['#d9cc98', '#d1c48f', '#e0d4a2', '#cbbd88', '#d5c894'], crecida: 1, nieve: 0 },
  { n: 'verano', ico: '☀️', el: 'el', dice: 'el solsticio y los vientos etesios; al mediodía, la vara casi no da sombra',
    bordeL: '#c4b06a', bordeR: '#b29e5a', campo: ['#e3d3a0', '#dccb96', '#e9daa9', '#d5c48e', '#dfcf9c'], crecida: 0.9, nieve: 0 },
  { n: 'otoño', ico: '🌾', el: 'el', dice: 'la flota del grano zarpa hacia Roma con el trigo del Nilo',
    bordeL: '#bba766', bordeR: '#a99556', campo: ['#dccd98', '#d4c58f', '#e2d4a2', '#cec08a', '#d8ca95'], crecida: 1, nieve: 0 },
  { n: 'invierno', ico: '⚓', el: 'el', dice: 'el mar se cierra, no navega nadie y la Biblioteca se llena de lectores',
    bordeL: '#a4a46e', bordeR: '#92925e', campo: ['#cfc79a', '#c7bf92', '#d6cea4', '#c1b98c', '#cbc396'], crecida: 1.15, nieve: 0 }
];
function campoHoy() { // los cinco tonos del campo del Ática, vestidos del año (hermano de vegaHoy)
  const e = estacion();
  if (!e.campo) return ['#c5b774', '#bcae6a', '#cdbf7e', '#b5a764', '#c1b370'];
  return e.campo.map((c, i) => e.k > 0 ? lerpHex(c, e.sig.campo[i], e.k) : c);
}
function estacionCruda() { // índice fraccionario continuo: 0 = medianoche que estrena primavera
  // A6 del QA completo: en la Época 1 el año empieza con el fuego. Antes la primavera duraba segundos tras encenderlo
  // (el año corría desde el arranque); S.anoFase lo corre de a años enteros de estación, así el corte sigue cayendo a
  // medianoche, y el tramo entre el fuego y esa medianoche también es primavera (estacion() lo lee como 0)
  const base = S && S.era === 1 ? (S.anoFase || 0) : 0;
  return Math.max(0, (tJuegoVis - base + DUR_ESTACION / 2) / DUR_ESTACION);
}
function estacion() { // la estación de AHORA, con la mezcla hacia la siguiente ya resuelta
  const conAno = S && S.fuegoDescubierto && epocaConstruida(S.era); // el año vive en las épocas construidas (el flag, en ARCO_EPOCAS)
  if (!conAno) return { ...ESTACIONES[1], i: 1, f: 0.5, k: 0 }; // sin ciclo aún: verano quieto (y !S: el timer de nitidez puede disparar en plena recarga)
  const TAB = S.era === 15 ? ESTACIONES_KAIFENG : S.era === 14 ? ESTACIONES_ROMA : S.era === 10 ? ESTACIONES_SANTIAGO : S.era === 9 ? ESTACIONES_AMSTERDAM : S.era === 8 ? ESTACIONES_PARIS : S.era === 7 ? ESTACIONES_TENOCHTITLAN : S.era === 6 ? ESTACIONES_BAGDAD : S.era === 5 ? ESTACIONES_ALEJANDRIA : S.era === 4 ? ESTACIONES_AGORA : S.era === 3 ? ESTACIONES_EGIPTO : S.era === 2 ? ESTACIONES_SUMER : ESTACIONES;
  const N = TAB.length; // el año egipcio tiene TRES estaciones: nada aquí asume cuatro (2026-08-24)
  const u = estacionCruda(), i = ((Math.floor(u) % N) + N) % N, f = u - Math.floor(u);
  const k = f > 0.85 ? (f - 0.85) / 0.15 : 0;                     // el cruce vive en la última noche
  return { ...TAB[i], i, f, k, sig: TAB[(i + 1) % N] };
}
function limoHoy() { // los cinco tonos del limo de Sumer, vestidos del año (hermano de silvestreHoy)
  const e = estacion();
  return e.limo.map((c, i) => e.k > 0 ? lerpHex(c, e.sig.limo[i], e.k) : c);
}
function crecidaHoy() { // cuánto ensancha el año al río (numérico, mezclado en el cruce)
  const e = estacion();
  return e.k > 0 ? e.crecida + (e.sig.crecida - e.crecida) * e.k : (e.crecida || 1);
}
function vegaHoy() { // los cinco tonos de la vega del Nilo, vestidos del año (hermano de limoHoy)
  const e = estacion();
  if (!e.vega) return ['#b7c65f', '#acc53f', '#b7c65f', '#acc53f', '#b0c352']; // sin año aún (pre-fuego): la vega fija de siempre
  return e.vega.map((c, i) => e.k > 0 ? lerpHex(c, e.sig.vega[i], e.k) : c);
}
function colorEstacion(clave) { // el color de esa clave, ya mezclado con el de la estación que entra
  const e = estacion();
  return e.k > 0 ? lerpHex(e[clave], e.sig[clave], e.k) : e[clave];
}
function silvestreHoy() { // los cinco tonos de la estepa, que es como se pinta el suelo de la Época 1
  const e = estacion();
  return e.silvestre.map((c, i) => e.k > 0 ? lerpHex(c, e.sig.silvestre[i], e.k) : c);
}
/* El suelo vive en un canvas pre-renderizado (renderTerrain), así que no basta con cambiar el color:
   hay que volver a pintarlo. Se repinta por PASOS durante el cruce, no de golpe, para que el pasto vaya
   virando en vez de dar un salto; y como el cruce cae en plena noche, casi no se ve trabajar. */
let estacionPintada = -99, avisoEstacion = -1;
function vigilarEstacion(dtAnim) {
  if (!S || !S.fuegoDescubierto || !epocaConstruida(S.era)) return;
  const e = estacion(), paso = e.i + Math.round(e.k * 6) / 6;      // 6 escalones de mezcla por cruce
  if (Math.abs(paso - estacionPintada) > 0.001) { estacionPintada = paso; renderTerrain(); }
  if (e.i !== avisoEstacion) {                                     // el año gira: se dice una vez, sin interrumpir
    const primera = avisoEstacion === -1;
    avisoEstacion = e.i;
    if (!primera) toast(`${e.ico} <b>${/s$/.test(e.el) ? "Llegan" : "Llega"} ${e.el} ${e.n}:</b> ${e.dice}.`, 7000);
  }
}
/* Lo que trae el aire en cada estación. Va en coordenadas de PANTALLA, como las nubes y las motas: es
   clima, no un objeto del diorama. Determinista a partir del índice, sin arrays que mantener. */
const CLIMA = [
  { n: 24, vel: 22, der: 20, r: 2.7, giro: 2.4, forma: 'petalo', cols: ['#f7c6da', '#f2b0c8', '#ffe1ec'] }, // pétalos que arrastra el viento
  { n: 12, vel: 10, der: 30, r: 1.6, giro: 1.0, forma: 'petalo', cols: ['#f4e9a8', '#efe08c', '#fff6c9'] }, // vilanos y polen del calor
  { n: 28, vel: 32, der: 24, r: 3.1, giro: 3.4, forma: 'petalo', cols: ['#d08a34', '#c2662c', '#e0a94a'] }, // la hoja que cae
  { n: 52, vel: 26, der: 11, r: 2.2, giro: 0.5, forma: 'dot',    cols: ['#ffffff', '#eef6f8', '#dceaf0'] }  // nieve
];
const CLIMA_SUMER = [
  { n: 14, vel: 14, der: 16, r: 2.0, giro: 0.8, forma: 'dot',    cols: ['#bcd8de', '#a9cdd6', '#d6ebee'] }, // la espuma que arrastra la crecida
  { n: 10, vel: 9,  der: 34, r: 1.5, giro: 1.0, forma: 'petalo', cols: ['#e8d59a', '#dfc987', '#f2e4b0'] }, // el polvo caliente
  { n: 20, vel: 26, der: 22, r: 2.6, giro: 2.8, forma: 'petalo', cols: ['#d8b95c', '#c9a94a', '#e5cb74'] }, // la paja de la siembra al viento
  { n: 60, vel: 130, der: 6, r: 1.0, giro: 0,   forma: 'lluvia', cols: ['#c2d6e0', '#b0c8d6'] }             // la llovizna del invierno suave
];
const CLIMA_EGIPTO = [ // tres, como su año
  { n: 12, vel: 13, der: 14, r: 1.9, giro: 0.7, forma: 'dot',    cols: ['#bcd8de', '#a9cdd6', '#d6ebee'] }, // la espuma de la crecida
  { n: 14, vel: 18, der: 24, r: 2.2, giro: 2.2, forma: 'petalo', cols: ['#d8c25c', '#c9b34a', '#e5d274'] }, // la paja de la siembra
  { n: 10, vel: 9,  der: 40, r: 1.5, giro: 1.0, forma: 'petalo', cols: ['#e8d59a', '#dfc987', '#f2e4b0'] }  // el polvo caliente de shemu
];
const CLIMA_AGORA = [ // cuatro, como su año
  { n: 14, vel: 15, der: 26, r: 2.2, giro: 2.4, forma: 'petalo', cols: ['#f2d3e0', '#e9c0d2', '#f7e0ea'] }, // los pétalos de las Dionisias
  { n: 8,  vel: 8,  der: 40, r: 1.4, giro: 1.0, forma: 'petalo', cols: ['#e8d59a', '#dfc987', '#f2e4b0'] }, // el polvo seco del verano
  { n: 12, vel: 16, der: 30, r: 2.0, giro: 2.0, forma: 'petalo', cols: ['#9fae86', '#8a9a70', '#b3c09a'] }, // las hojas del olivo, plateadas
  { n: 40, vel: 60, der: 6,  r: 1.2, giro: 0,   forma: 'lluvia', cols: ['#9fb8c8', '#8aa8bc'] }             // la lluvia del invierno ático
];
const CLIMA_BAGDAD = [ // cuatro, como su año
  { n: 10, vel: 12, der: 30, r: 1.8, giro: 0.8, forma: 'dot',    cols: ['#fbf3e4', '#f4e8d2', '#fffaf0'] }, // el azahar de los huertos junto al Tigris
  { n: 9,  vel: 8,  der: 46, r: 1.4, giro: 1.0, forma: 'petalo', cols: ['#e6d098', '#dcc486', '#f0deae'] }, // el polvo del verano, que levanta el viento del desierto
  { n: 11, vel: 16, der: 32, r: 2.0, giro: 2.0, forma: 'petalo', cols: ['#b98a4a', '#a8783c', '#c99c5c'] }, // las fibras de las palmeras que se cosechan
  { n: 42, vel: 62, der: 8,  r: 1.2, giro: 0,   forma: 'lluvia', cols: ['#a9bccb', '#93adbf'] }             // la lluvia del invierno
];
const CLIMA_PARIS = [ // cuatro, como su año
  { n: 10, vel: 12, der: 30, r: 1.8, giro: 0.8, forma: 'petalo', cols: ['#f6e8ee', '#f0dce6', '#fff4f8'] }, // los pétalos de los frutales de las abadías
  { n: 8,  vel: 8,  der: 40, r: 1.4, giro: 1.0, forma: 'dot',    cols: ['#e8dcb0', '#dcd0a0', '#f0e6c0'] }, // el polvo de la feria
  { n: 12, vel: 14, der: 34, r: 2.0, giro: 2.0, forma: 'petalo', cols: ['#c8803a', '#b06a2a', '#d89a4a'] }, // las hojas de los tilos
  { n: 40, vel: 18, der: 22, r: 2.2, giro: 0.4, forma: 'dot',    cols: ['#ffffff', '#f2f6f8'] }            // la nieve (cae redonda)
];
const CLIMA_ROMA = [ // cuatro, como su año
  { n: 10, vel: 12, der: 30, r: 1.8, giro: 0.8, forma: 'petalo', cols: ['#f6e6ec', '#f0d8e2', '#fff4f6'] }, // los pétalos de los almendros del Palatino
  { n: 8,  vel: 8,  der: 42, r: 1.4, giro: 1.0, forma: 'dot',    cols: ['#e8dcb4', '#dccfa2', '#f0e6c4'] }, // el polvo del verano en el Foro
  { n: 12, vel: 14, der: 32, r: 2.0, giro: 2.0, forma: 'petalo', cols: ['#a8642a', '#b8782e', '#8e5a2a'] }, // las hojas de la vid de la vendimia
  { n: 38, vel: 60, der: 8,  r: 1.2, giro: 0,   forma: 'lluvia', cols: ['#a9bccb', '#93adbf'] }             // la lluvia del invierno, que sube el Tíber
];
const CLIMA_KAIFENG = [ // cuatro, como su año
  { n: 12, vel: 12, der: 30, r: 1.8, giro: 1.2, forma: 'petalo', cols: ['#e6eecf', '#d8e4b8', '#f2f6e2'] }, // la pelusa de los sauces del Qingming
  { n: 40, vel: 62, der: 8,  r: 1.2, giro: 0,   forma: 'lluvia', cols: ['#a9bccb', '#93adbf'] },            // las lluvias del verano, que suben el Bian
  { n: 12, vel: 14, der: 32, r: 2.0, giro: 2.0, forma: 'petalo', cols: ['#d8a83a', '#c88e2a', '#e8c25a'] }, // las hojas amarillas de los ginkgos y las moreras
  { n: 46, vel: 18, der: 22, r: 2.2, giro: 0.4, forma: 'dot',    cols: ['#ffffff', '#f2f6f8'] }            // la nieve sobre los tejados
];
const CLIMA_SANTIAGO = [ // cuatro, como su año
  { n: 10, vel: 12, der: 30, r: 1.8, giro: 0.8, forma: 'petalo', cols: ['#f2d23a', '#e8c42a', '#fff0a0'] }, // las flores del aromo
  { n: 8,  vel: 8,  der: 40, r: 1.4, giro: 1.0, forma: 'dot',    cols: ['#e8dcb0', '#dcd0a0', '#f0e6c0'] }, // el polvo de enero
  { n: 12, vel: 14, der: 34, r: 2.0, giro: 2.0, forma: 'petalo', cols: ['#e8c03a', '#d8a82a', '#f2d45a'] }, // las hojas amarillas de los álamos
  { n: 28, vel: 26, der: 14, r: 1.2, giro: 0.2, forma: 'lluvia', cols: ['#b8c8d4', '#a8bcc8'] }            // la lluvia del invierno
];
const CLIMA_AMSTERDAM = [ // cuatro, como su año
  { n: 10, vel: 12, der: 30, r: 1.8, giro: 0.8, forma: 'petalo', cols: ['#e8506a', '#f2c84a', '#f6f0f2'] }, // los pétalos de los tulipanes
  { n: 6,  vel: 8,  der: 40, r: 1.4, giro: 1.0, forma: 'dot',    cols: ['#e8e4d8', '#dcd8cc', '#f0ece0'] }, // la sal del mar
  { n: 26, vel: 26, der: 14, r: 1.2, giro: 0.2, forma: 'lluvia', cols: ['#b8c8d4', '#a8bcc8'] },            // la lluvia del otoño
  { n: 34, vel: 16, der: 24, r: 2.0, giro: 0.4, forma: 'dot',    cols: ['#ffffff', '#f2f6f8'] }            // la nieve sobre el hielo
];
const CLIMA_TENOCHTITLAN = [ // cuatro, como su año
  { n: 8,  vel: 10, der: 26, r: 1.6, giro: 0.8, forma: 'dot',    cols: ['#f6f0e4', '#ece4d4', '#fffaf0'] }, // la ceniza fina que a veces sopla de los volcanes
  { n: 9,  vel: 8,  der: 40, r: 1.4, giro: 1.0, forma: 'petalo', cols: ['#e0c890', '#d6bc80', '#ead6a4'] }, // el polvo de la seca
  { n: 46, vel: 64, der: 8,  r: 1.2, giro: 0,   forma: 'lluvia', cols: ['#a9bccb', '#93adbf'] },            // las lluvias de la tarde
  { n: 11, vel: 14, der: 30, r: 1.9, giro: 1.6, forma: 'petalo', cols: ['#f2a83a', '#e88a2a', '#f6c25a'] }  // los pétalos de cempasúchil de las fiestas
];
const CLIMA_ALEJANDRIA = [ // cuatro, como su año
  { n: 10, vel: 14, der: 30, r: 1.8, giro: 0.8, forma: 'dot',    cols: ['#e9f3f6', '#d7e9ef', '#f4fafb'] }, // la espuma que trae el viento del mar
  { n: 8,  vel: 9,  der: 44, r: 1.4, giro: 1.0, forma: 'petalo', cols: ['#e8d59a', '#dfc987', '#f2e4b0'] }, // la arena que levantan los etesios
  { n: 12, vel: 18, der: 30, r: 2.0, giro: 2.2, forma: 'petalo', cols: ['#d8c25c', '#c9b34a', '#e5d274'] }, // la paja del grano que embarcan
  { n: 44, vel: 64, der: 8,  r: 1.2, giro: 0,   forma: 'lluvia', cols: ['#a9bfcc', '#94b0c0'] }             // la lluvia del invierno, que en Alejandría sí cae
];
function drawClimaEstacion(t) {
  if (!S || !S.fuegoDescubierto || !epocaConstruida(S.era)) return;
  const TAB = S.era === 15 ? CLIMA_KAIFENG : S.era === 14 ? CLIMA_ROMA : S.era === 10 ? CLIMA_SANTIAGO : S.era === 9 ? CLIMA_AMSTERDAM : S.era === 8 ? CLIMA_PARIS : S.era === 7 ? CLIMA_TENOCHTITLAN : S.era === 6 ? CLIMA_BAGDAD : S.era === 5 ? CLIMA_ALEJANDRIA : S.era === 4 ? CLIMA_AGORA : S.era === 3 ? CLIMA_EGIPTO : S.era === 2 ? CLIMA_SUMER : CLIMA;
  const N = TAB.length, e = estacion(), w = new Array(N).fill(0);
  w[e.i] = 1 - e.k;
  if (e.k > 0) w[(e.i + 1) % N] = e.k;
  for (let ti = 0; ti < N; ti++) {
    if (w[ti] < 0.02) continue;
    const c = TAB[ti], n = Math.round(c.n * w[ti]);
    g.save(); g.globalAlpha = Math.min(1, w[ti] * 0.92);
    for (let i = 0; i < n; i++) {
      // dos semillas estables por partícula, MEZCLADAS de verdad (2026-09-06: la fórmula lineal de antes
      // daba s1 ≈ i·0,04, así que las partículas caían formando una diagonal perfecta por el cielo)
      const s1 = (Math.sin(i * 12.9898 + ti * 78.233) * 43758.5453) % 1 * 0.5 + 0.5;
      const s2 = (Math.sin(i * 39.3467 + ti * 11.135) * 24634.6345) % 1 * 0.5 + 0.5;
      const alto = H + 140;
      const y = ((t * c.vel * (0.7 + s2 * 0.6) + s1 * alto) % alto) - 70;
      const x = s1 * (W + 220) - 110 + Math.sin(t * 0.6 + s2 * 6.28) * c.der;
      const col = c.cols[i % c.cols.length], r = c.r * (0.75 + s2 * 0.5) * zoom;
      if (c.forma === 'dot') dot({ x, y }, r, col);                 // la nieve y la espuma caen redondas
      else if (c.forma === 'lluvia') {                               // la gota es un trazo que cae en diagonal
        g.strokeStyle = col; g.lineWidth = Math.max(1, r * 0.8); g.lineCap = 'round';
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - 3 * zoom, y + 11 * zoom); g.stroke();
      } else {                                                       // pétalo y hoja voltean al caer
        g.save(); g.translate(x, y); g.rotate(Math.sin(t * c.giro + s1 * 6.28) * 1.4);
        g.beginPath(); g.ellipse(0, 0, r * 1.5, r * 0.6, 0, 0, 7); g.fillStyle = col; g.fill();
        g.restore();
      }
    }
    g.restore();
  }
}
function multVelada() { // de noche, junto al fuego, las HISTORIAS de la velada enseñan más
  if (S.era !== 1 || !S.fuegoDescubierto) return 1;
  // el bono es de las historias, no solo del fuego: escala con la maestría del CÍRCULO (que le da nombre y cuyo
  // corro crece al perfeccionarlo). Sin círculo dominado, la brasa da apenas una chispa por su propia ficha.
  const cir = S.tecs[10] && S.tecs[10].fase === 'meseta' ? 0.4 + 0.2 * nivelTec(10) : 0.15;
  return 1 + (1 - luzDia()) * 0.25 * cir * ((S.fuego - 35) / 65);  // hasta +25% con círculo en nivel 3, noche cerrada y brasa viva
}
// LA VELADA: de noche el clan converge al fuego y se sienta en círculo; de día se dispersa a la estepa.
// El mundo cambia de conducta con la hora (era el hueco del punto 12 de la sección E), y encarna la tesis
// de la ficha del fuego: la noche fue la primera aula. El bono ya lo da multVelada; esto lo hace VISIBLE.
const FOGON = { x: 6.5, y: 9.5 };
/* LA BRASA TIENE SU PROPIO RELOJ, igual que el tiempo (ver `tJuegoVis`). `S.fuego` es la verdad de la
   economía y salta +24 de golpe con cada leño; si la POSICIÓN de la gente lee ese salto, el clan entero
   se teletransporta hacia el fuego en un frame. `fuegoVis` persigue al valor real en un par de segundos,
   así que echar leña ACERCA a la gente caminando en vez de reubicarla. Solo manda en lo que se ve moverse:
   el bono de la velada y el calor del hogar siguen leyendo `S.fuego` exacto, que para eso es la verdad. */
let fuegoVis = -1;
function avanzarFuegoVisual(dtAnim) {
  if (fuegoVis < 0 || Math.abs(S.fuego - fuegoVis) > 40) { fuegoVis = S.fuego; return; } // primera carga o generación nueva: engancha de golpe
  // ~4,5 s en asentarse (y el ×5/×20 lo acelera igual que todo). La constante está calibrada MIDIENDO:
  // con ella el mayor desplazamiento por frame queda al nivel del paseo normal del clan, así que echar
  // leña se lee como "se arriman al fuego", no como "corren". Con la brasa cruda eran 268 px de un tirón.
  // El warp va TOPADO a ×6, igual que los ciclos del cuerpo en `tFrame`: acercarse al fuego es andar, y
  // a ×20 sin tope volvían los tirones de 24 px por frame que se querían evitar.
  fuegoVis += (S.fuego - fuegoVis) * Math.min(1, dtAnim * Math.min(warp, 6) * 0.22);
}
function nocheVelada() { // 0 = disperso de día · 1 = todos sentados al fuego, solo con la brasa viva
  if (S.era !== 1 || !S.fuegoDescubierto) return 0;
  const oscuro = Math.max(0, (0.5 - luzDia()) / 0.5);              // empieza a juntarse al caer la tarde
  const brasa = fuegoVis < 0 ? S.fuego : fuegoVis;                 // la brasa que se VE, no la que salta
  return smooth(oscuro) * Math.max(0, Math.min(1, (brasa - 35) / 25)); // sin fuego no hay velada
}
function nocheCasa() { // 0 de día → 1 con la noche cerrada sobre la edubba, la Casa de la Vida, el ágora o la Biblioteca (sin fuego que la condicione: el río no se apaga)
  if (ordEra(S.era) < 2 || ordEra(S.era) > 10 || !epocaConstruida(S.era)) return 0;   // de Sumer a Santiago
  return smooth(Math.max(0, (0.5 - luzDia()) / 0.5));
}
function asientoVelada(i, total) { // un anillo alrededor del fogón, lejos de los sentaditos del círculo fijo
  const aro = i % 2, paso = Math.ceil(total / 2);
  const idxEnAro = aro === 0 ? i / 2 : (i - 1) / 2;
  const r = 1.95 + aro * 0.7, ang = -2.4 + (idxEnAro / Math.max(1, paso)) * Math.PI * 1.9;
  return { x: FOGON.x + Math.cos(ang) * r, y: FOGON.y + Math.sin(ang) * r * 0.7 };
}
function lerpHex(a, b, tt) { // interpola dos colores #rrggbb
  tt = Math.max(0, Math.min(1, tt));
  const pa = [parseInt(a.slice(1, 3), 16), parseInt(a.slice(3, 5), 16), parseInt(a.slice(5, 7), 16)];
  const pb = [parseInt(b.slice(1, 3), 16), parseInt(b.slice(3, 5), 16), parseInt(b.slice(5, 7), 16)];
  return 'rgb(' + pa.map((v, i) => Math.round(v + (pb[i] - v) * tt)).join(',') + ')';
}
function calorHogar() { // el calor del hogar modula la producción
  if (ordEra(S.era) >= 11) return 1;
  if (!S.fuegoDescubierto) return 0.3;                 // antes del fuego, el clan disperso aprende poco
  if (S.era !== 1) return 1;                           // en Sumer/Egipto el fuego ya no es la mecánica
  return 0.65 + 0.35 * ((S.fuego - 35) / 65);          // brasa viva = más producción; brasa baja = piso 0.65
}
let lenaEnCola = false; // un segundo toque mientras el leño anterior prende no se pierde: espera su turno (lista de cotejo B2)
function alimentarFuego() { // echar un leño a la fogata (clic sobre ella)
  if (S.era !== 1 || !S.fuegoDescubierto) return;
  if (S.fuegoCd > 0) { if (S.fuego <= 76 && (S.mats.lena || 0) >= 1) lenaEnCola = true; return; }
  if (S.fuego > 76) { S.fuegoCd = 0.4; return; } // ya está bien viva: no cobrar un leño por +0 (el mismo "timo" del té)
  if ((S.mats.lena || 0) < 1) { S.fuegoCd = 0.7; toast('🪵 El fuego pide <b>leña seca</b>. ' + QUERENCIA_DICE.lena); return; }
  S.mats.lena -= 1;
  debitoMat('lena', 1);
  S.fuego = Math.min(100, S.fuego + 24);
  S.fuegoCd = 1.1;
  const a = performance.now();
  for (let i = 0; i < 9; i++) fx.chispas.push({ born: a, vx: (Math.random() * 2 - 1) * 42, vz: 50 + Math.random() * 40, col: ['#ffd873', '#ff9d3a', '#fff0b0'][i % 3] });
  fx.humo.push({ born: tFrame, seed: Math.random() * 6.28 }, { born: tFrame + 0.25, seed: Math.random() * 6.28 }); // el leño nuevo respira
  sfx.lena();
  renderHUD();
}
function cultivoActivo() { return S.era === 1 && S.edad >= 2 && S.tecs[24] && S.tecs[24].fase !== 'sin'; }
function cosechar() { // el clic sobre el campo dorado: lo sembrado vuelve multiplicado
  if (!cultivoActivo() || (S.cultivo || 0) < 1) return;
  const gr = 2 + (S.tecs[24].nivel || 0);
  S.mats.grano += gr;
  S.pre += Math.round((24 + S.rep * 10) * (1 + 0.5 * (S.tecs[24].nivel || 0)) * botinCorro()); // perfeccionar la siembra = más excedente (el campo crece Y rinde más); la siega en corro, también (C5)
  S.cultivo = 0; S.cosechas = (S.cosechas || 0) + 1;
  // La recompensa se VE: anillo sobre la parcela, una lluvia de espigas por todo su ancho, y el número
  // subiendo tanto en el campo como en el contador de grano (antes era un +3 diminuto que se perdía).
  const R = campoRect(), cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2;
  fx.anillos.push({ born: performance.now(), x: cx, y: cy });
  fx.pops.push({ x: cx, y: cy, txt: `+${gr} 🌾`, born: performance.now() });
  fx.pops.push({ x: cx, y: cy + 0.45, txt: `+${fmt(24 + S.rep * 10)} ${monIco()}`, born: performance.now() + 260 });
  { const c = P(cx, cy), a = performance.now(), anchoPx = (R.x1 - R.x0) * 32 * zoom; // espigas por toda la parcela
    for (let i = 0; i < 26; i++) fx.chispas.push({ born: a + i * 12, bx: c.x + (Math.random() * 2 - 1) * anchoPx, by: c.y - 4 * zoom + (Math.random() * 2 - 1) * 14 * zoom, vx: (Math.random() * 2 - 1) * 44, vz: 42 + Math.random() * 46, col: ['#e4c96a', '#c9a84a', '#f0e0a0', '#fff0b0'][i % 4] }); }
  ganaMat('grano', gr);
  pedirCuenta(1); // el grano guardado hay que contarlo: de ahí sale la cuenta, y de la cuenta, el signo
  sfx.cosecha(); jubilo();
  if (S.cosechas === 1) toast('🌾 <b>La primera cosecha.</b> El clan ya no busca el alimento: lo produce. Y la espiga más llena no se come; se guarda para sembrarla.', 13000);
  renderHUD(); guardar();
}
/* ---------- EL CONTEO, HECHO GESTO (la semilla de Sumer se juega, no se lee) ----------
   La tesis del puente a Sumer es "excedente → contar → signo". Estaba narrada y dibujada, pero nadie
   contaba nada. Ahora el mundo DEJA CUENTAS PENDIENTES (el botín que vuelve, la cosecha, el rebaño que
   entra al cerco al anochecer) y el jugador las talla en el hueso, una a una. Sin fallo posible, sin
   caducidad, sin cuota obligatoria: contar nunca bloquea nada, solo empuja. Cada cinco muescas se cierra
   un grupo y esas cinco pasan a ser UNA piedra, que es exactamente lo que enseña el hueso de Ishango. */
const CUENTA_MAX = 12;                        // lo que cabe esperando: pasado eso, el clan cuenta de memoria
function conteoActivo() { return S.era === 1 && S.tecs[13] && S.tecs[13].fase !== 'sin'; }
function cuentasPendientes() { return conteoActivo() ? (S.porContar || 0) : 0; }
function pedirCuenta(n) { // el mundo deja algo por contar (solo si ya hay hueso donde tallarlo)
  if (!conteoActivo()) return;
  const antes = S.porContar || 0;
  S.porContar = Math.min(CUENTA_MAX, antes + n);
  if (antes === 0 && S.porContar > 0 && !S.vioConteo) {
    S.vioConteo = true;
    toast('🦴 <b>Algo quedó por contar.</b> Junto al fogón está el hueso: tócalo y talla una muesca por cada cosa. Contar no es un trámite, es la primera vez que el clan guarda fuera de su cabeza lo que sabe.', 13000);
  }
}
function muescaBono() { return Math.round(tasa() * (6 + 3 * nivelTec(13))); } // afinar el conteo hace valer más cada muesca
/* LA CUENTA QUE QUEDA (2026-09-28, «darle peso al conteo»: en la ablación del bot, tallar pesaba +0,1 min).
   Lo tallado ya no vive solo en la cabeza de nadie, y el clan deja de re-aprender lo que olvidaba: cada
   muesca suma un 2% al saber del clan PARA SIEMPRE (tope +30%, tres piedras). Es el gesto protagonista por
   la vía del bono estructural, como la mano de la edubba. Y es también la llave de Sumer: los Milenios
   esperan al SIGNO, la marca que nace en el barro al tallar después de «Ahora cuenta tú» (investigar()).
   Solo en la Época 1: las épocas siguientes se midieron sin él. */
const CUENTA_PASO = 0.02, CUENTA_TOPE = 0.3;
function multCuenta() { return S.era === 1 ? 1 + Math.min(CUENTA_TOPE, (S.muescas || 0) * CUENTA_PASO) : 1; }
/* ---------- LOS VERBOS DE SUMER (docs/era2-plan.md) ----------
   Calcados de los moldes de la Época 1: sellar fichas ES tallar muescas (lo pendiente que paga al
   tocarse), corregir la copia ES el gesto protagonista (el error visible contra el modelo), y hacer
   sitio en el dictado ES la orilla (un lugar que se abre, no una clase que se da). */
function manoBono() { return 1 + Math.min(0.4, (S.manoCopias || 0) * (0.02 + calamoPulso())); } // LA MANO DE LA EDUBBA: cada copia corregida mejora a los copistas para siempre (tope +40%); la corrección es espejo, y el espejo PAGA. El cálamo dominado afina el paso (2026-08-23, c23).
function selloBono() { return Math.round((30 + 16 * S.rep) * (1 + 0.5 * nivelTec(18)) * manoBono()); } // la administración paga recursos (la economía DE la época, no una propina)
function sellarFichas(n = 1) { // el clic sobre los cálculos: la cuenta pendiente se vuelve contrato sellado
  if (S.era !== 2 || (S.fichasPend || 0) < 1) return;
  // QA completo: un toque sella hasta 5, como el hueso talla de a cinco (con 8 pendientes eran 8 toques). El bot sella de a
  // una por latido, así que el balance no cambia: solo los clics.
  const k = Math.min(n, S.fichasPend); S.fichasPend -= k;
  let b = 0; for (let i = 0; i < k; i++) b += selloBono(); S.pre += b;
  fx.pops.push({ x: 12.4, y: 8.5, txt: '+' + fmt(b) + ' ' + monIco() + (k > 1 ? ` · ${k} sellos` : ''), born: performance.now() });
  fx.anillos.push({ born: performance.now(), x: 12.4, y: 8.8 });
  sfx.sello(); // el sello en el barro: voz propia (antes, «recoger»)
  if (!S.vioSello) { S.vioSello = true; toast('🧮 <b>La cuenta que obliga.</b> Las fichas selladas en barro son la primera promesa que nadie puede negar. El templo paga su administración: sella lo pendiente cuando se junte.', 12000); }
  renderHUD(); guardar();
}
function copiaBono() { return Math.round(tasa() * (8 + 4 * nivelTec(30))); } // corregir paga saber: la lección es el espejo
function corregirCopia(n = 1) { // el clic sobre la mesa: el error SE VE contra el modelo, se amasa y se rehace
  if (S.era !== 2 || (S.copiasPend || 0) < 1) return;
  const k = Math.min(n, S.copiasPend); S.copiasPend -= k;   // hasta 5 por toque, como el sello (QA completo)
  const eco = (S.himnoEco || 0) > 0; // el eco del himno: lo cantado anoche guía la mano de hoy (2026-08-23, la regla de Enheduanna)
  let b = 0;
  for (let i = 0; i < k; i++) {
    S.manoCopias = (S.manoCopias || 0) + (eco ? 2 : 1);
    if ((S.mats.barro || 0) > 0) S.mats.barro--; // la copia rehecha gasta una tablilla fresca (el plan: el barro es consumible); así el río sigue importando
    b += copiaBono();
  }
  S.apr += b; S.aprTotal += b;
  const mb = Math.round((manoBono() - 1) * 100);
  fx.pops.push({ x: 10.1, y: 8.75, txt: (eco && mb < 40 ? '🌙×2 · ' : '') + (mb < 40 ? `la mano mejora · +${mb}%` : `mano maestra · +40%`), born: performance.now() });
  fx.anillos.push({ born: performance.now(), x: 10.1, y: 8.75 });
  sfx.corregir(); jubilo(); // el cálamo sobre la tablilla: voz propia (antes, la campana de las compras)
  if (!S.vioCopia) { S.vioCopia = true; toast('🏛️ <b>El error que se ve.</b> Con el modelo arriba y el intento abajo, la cuña torcida salta a la vista. Se amasa y se rehace: el barro perdona. Y cada corrección <b>mejora la mano de la casa</b>: tus sellos y tu dictado rinden más, para siempre.', 12000); }
  renderHUD(); guardar();
}
// EL DICTADO: la díada base llega con la meseta; cada etapa de perfección abre sitio para otra tablilla
const DIADAS_DICT = [{ x: 10.75, y: 9.25 }, { x: 11.35, y: 9.5 }]; // bajo el toldo, junto a la pareja base
function dictTotal() { return 1 + (S.diadasDict || 0); }
function haySitioDictado() { return S.era === 2 && S.tecs[29] && S.tecs[29].fase === 'meseta' && dictTotal() < 1 + Math.min(2, nivelTec(29)); }
function hacerSitioDictado() { // el gesto: otra tablilla se suma a la misma voz
  if (!haySitioDictado()) return;
  S.diadasDict = (S.diadasDict || 0) + 1;
  const d = DIADAS_DICT[Math.min(S.diadasDict - 1, DIADAS_DICT.length - 1)];
  sfx.recoger(); jubilo();
  fx.anillos.push({ born: performance.now(), x: d.x, y: d.y });
  fx.pops.push({ x: d.x, y: d.y - 0.3, txt: 'otra tablilla corre', born: performance.now() });
  if (!S.vioDictado) { S.vioDictado = true; toast('🗣️ <b>El dictado suma manos.</b> Una voz, más tablillas; los que esperan turno escuchan, y también así se aprende. La ciudad paga por cada escriba que sale.', 12000); }
  renderHUD(); guardar();
}
function tallarMuesca(enGrupo) { // el clic sobre el hueso: lo que pasó deja marca, y la marca se puede volver a leer
  if (cuentasPendientes() < 1) return 0;
  const nace = !S.signo && (S.abuelaCap || 0) >= 3;   // «Ahora cuenta tú»: esta marca ya no cabe en el hueso
  S.porContar--; S.muescas = (S.muescas || 0) + 1;
  const bono = muescaBono() * (nace ? 3 : 1);
  S.apr += bono; S.aprTotal += bono;
  if (!enGrupo) {
    fx.pops.push({ x: 5.3, y: 8.2, txt: `+${fmt(bono)} 📖`, born: performance.now() });
    debito('r-apr', `+${fmt(bono)} 📖`, true);
    if (S.muescas * CUENTA_PASO <= CUENTA_TOPE + 1e-9) fx.pops.push({ x: 5.3, y: 8.45, txt: `📖/s +${Math.round(CUENTA_PASO * 100)}%`, born: performance.now() + 140 }); // lo que queda para siempre
  }
  if (!S.vioCuenta) { S.vioCuenta = true; toast(`🦴 <b>Lo contado ya no se olvida.</b> Cada muesca que tallas deja al clan aprendiendo un poco más rápido, para siempre: <b>+${Math.round(CUENTA_PASO * 100)}% al saber</b> por muesca, hasta +${Math.round(CUENTA_TOPE * 100)}%. Es la primera memoria que vive fuera de la cabeza.`, 12000); }
  if (nace) {
    S.signo = true;
    sfx.signo(); jubilo();
    fx.anillos.push({ born: performance.now(), x: 5.3, y: 8.4 });
    toast('🏺 <b>La marca deja de ser muesca.</b> Ya no cabe una raya más, y esta cuenta no es de ovejas: es de todo lo que el clan sabe. Tomas un puñado de barro húmedo, lo aplastas junto al hueso y presionas dentro la marca. Deja de parecerse a lo contado y empieza a <b>significarlo</b>: acaba de nacer el signo, y con él, milenios después, la escritura.', 17000);
  } else if (!enGrupo) {
    sfx.muesca();
    if (S.muescas % 5 === 0) { sfx.hito(); fx.pops.push({ x: 5.3, y: 8.6, txt: '🪨 ×5', born: performance.now() + 240 }); } // cinco muescas cerradas = una piedra: contar se vuelve veloz
  }
  if (!enGrupo) { renderHUD(); guardar(); }
  return bono;
}
/* UN TOQUE, UN GRUPO (lista de cotejo B8, 2026-09-29): tallar doce cuentas eran doce toques en el mismo punto.
   Ahora un toque talla hasta cerrar la piedra que está abierta (de cinco en cinco, como el propio hueso de
   Ishango). El signo sigue siendo una marca sola: es un momento, no un trámite. */
function tallarGrupo() {
  if (cuentasPendientes() < 1) return;
  if (!S.signo && (S.abuelaCap || 0) >= 3) { tallarMuesca(); return; }
  const antes = S.muescas || 0, n = Math.min(cuentasPendientes(), 5 - (antes % 5));
  let bono = 0;
  for (let k = 0; k < n; k++) bono += tallarMuesca(true);
  const suma = Math.min(S.muescas, CUENTA_TOPE / CUENTA_PASO) - Math.min(antes, CUENTA_TOPE / CUENTA_PASO);
  fx.pops.push({ x: 5.3, y: 8.2, txt: `+${fmt(bono)} 📖`, born: performance.now() });
  debito('r-apr', `+${fmt(bono)} 📖`, true);
  if (suma > 0) fx.pops.push({ x: 5.3, y: 8.45, txt: `📖/s +${Math.round(suma * CUENTA_PASO * 100)}%`, born: performance.now() + 140 });
  sfx.muesca();
  if (S.muescas % 5 === 0) { setTimeout(() => sfx.hito(), 180); fx.pops.push({ x: 5.3, y: 8.6, txt: '🪨 ×5', born: performance.now() + 240 }); }
  renderHUD(); guardar();
}
/* ---------- LOS SABERES QUE NO SE QUEDAN EN SU FICHA (acoplamientos pasivos) ---------- */
function tamborRitmo() { // "lo que se canta no se olvida": la mnemotecnia acorta lo que cuesta aprender
  return S.tecs[11] && S.tecs[11].fase === 'meseta' ? 0.06 * (1 + nivelTec(11)) : 0;
}
function rastroPinturas() { // la pared guarda la manada: lo retratado se reconoce en el rastro
  return S.tecs[12] && S.tecs[12].fase === 'meseta' ? 0.006 * (1 + nivelTec(12)) : 0;
}
function telarReparto() { // "mientras uno siembra, otro teje": la división del trabajo alcanza a los desatendidos
  return S.tecs[27] && S.tecs[27].fase === 'meseta' ? 0.05 * (1 + nivelTec(27)) : 0;
}
function tablillaCanasto() { // "el canasto del taller": barro amasado cada mañana, la mesa de copia junta ejercicios más rápido (2026-08-23, c23: la tablilla era solo multTec)
  return S.tecs[16] && S.tecs[16].fase === 'meseta' ? 0.10 * (1 + nivelTec(16)) : 0;
}
function calamoPulso() { // "la mano se entrena": con la buena herramienta, cada copia corregida afina más la mano de la casa (2026-08-23, c23: el cálamo era solo multTec)
  return S.tecs[17] && S.tecs[17].fase === 'meseta' ? 0.005 * (1 + nivelTec(17)) : 0;
}
function multGranero() { return S.granero ? 1.15 : 1; }               // el excedente compra tiempo, y el tiempo, aprendizaje
function multAutora() { return S.enheduanna === 2 ? 1.2 : 1; }        // la firma de Enheduanna
function multGen() { return 1 + 0.25 * (S.generacion || 0); }          // cada generación aprende más rápido
function multAbuela2() { return 1 + (S.abuelaCap >= 1 ? 0.12 : 0) + (S.abuelaCap >= 3 ? 0.10 : 0); } // los capítulos de la Abuela
function abuelaCapPend() { // ¿hay historia nueva GANADA por progreso? (el momento de contarla es otra cosa)
  if (S.era !== 1 || S.abuela !== 2) return 0;
  const dom = i => S.tecs[i] && S.tecs[i].fase === 'meseta';
  if (S.abuelaCap === 0 && dom(11)) return 1;                          // tras dominar el tambor
  if (S.abuelaCap === 1 && dom(13)) return 2;                          // tras dominar el conteo
  if (S.abuelaCap === 2 && saberesEpoca(1, 1).every(dom)) return 3;  // con los seis saberes del Paleolítico
  return 0;
}
function abuelaCapDisponible() { // contable AHORA: de noche, junto al fuego vivo, una por noche (el ritmo ES la lección)
  const cap = abuelaCapPend();
  if (!cap || (S.abuelaCd || 0) > 0 || luzDia() >= 0.45 || S.fuego < 42) return 0;
  return cap;
}
/* EL ORDEN DE LA ÉPOCA, EN UN SOLO SITIO. Antes vivía en dos: la consejera tenía su lista y el dock
   revelaba el siguiente saber por ÍNDICE del array. Mientras el índice coincidió con el orden no se notó;
   con la pesca (índice 28, pero se ofrece antes que la cacería) las dos voces se habrían contradicho.
   La PESCA VA ANTES QUE LA CACERÍA a propósito, y es lo que arregló el cuello de botella del Paleolítico:
   la caza es la gran fuente de recursos y costaba 320 justo cuando la única entrada era el goteo pasivo,
   lo que dejaba 7 minutos de espera pura (medido). La orilla es ahora el escalón intermedio: barata, y
   sus díadas traen pescado. */
const ORDEN_PALEO = [10, 11, 12, 13, 28, 15], ORDEN_NEO = [24, 25, 26, 27];
/* EL ORDEN DE SUMER: los cálculos van SEGUNDOS, antes que el cálamo, por historia y por balance a la
   vez: las fichas de contar (~3300 a. C.) preceden a la escritura (~3200), y sellarlas es la economía
   temprana de la época (medido: con los cálculos terceros, el tramo medio eran 18 min de goteo puro). */
const ORDEN_SUMER = [16, 18, 17, 19, 29, 30];
/* EL ORDEN DE EGIPTO (plan firme, era3-plan.md): primero el problema (el papiro caro), después el rojo
   del maestro (la paleta habilita la devolución), y recién entonces la solución (el ostracón abre el
   loop protagonista). La Kemyt lo alimenta, la cuerda trae el año, la Casa de la Vida cierra. */
const ORDEN_EGIPTO = [20, 21, 31, 22, 23, 32];
/* EL ORDEN DEL ÁGORA (era4-plan): la tablilla (el material y el soporte), la lira (el ánimo), LA
   PREGUNTA (el gesto, tercero como el ostracón en Egipto: para que el loop llegue temprano), la palestra,
   el sofista (la segunda elección, cuando ya hay maestros propios con quién compararlo), la Academia. */
const ORDEN_AGORA = [33, 34, 37, 35, 36, 38]; // (2026-09-06: se probó la cuerda antes que la Kemyt para partir el muro de la Kemyt; con la llegada realista de 12 000 🏺 salía peor: la cuerda se comía la reserva y la Kemyt se pagaba desde cero. Se queda el orden del plan)
/* EL ORDEN DE ALEJANDRÍA (era5-plan): primero los barcos (el material y la llegada de los rollos), después LOS PÍNAKES (el
   gesto, segundo para que el loop llegue temprano), el Museo (los sabios), los Elementos (el manual, que trae a Hipatia),
   la sombra de Eratóstenes y el códice, que cierra. */
const ORDEN_ALEJANDRIA = [40, 41, 39, 42, 43, 44];
const ORDEN_ROMA = [75, 76, 77, 78, 79, 80];   // el ludus (las escuelas y los calculi), el ábaco, el grammaticus (los letrados), el rétor (la basílica y Quintiliano), la escuela pagada y la Institutio
const ORDEN_KAIFENG = [81, 83, 82, 84, 85, 86];   // la escuela de la prefectura (la tinta), las dos salas de Hu Yuan (abren los asuntos y el estudio para entender: la elección empieza pronto), los clásicos impresos (la memoria, más rápida), el examen anónimo, la academia (Zhu Xi) y el examen de palacio (balance-epoca15.md)
const ORDEN_FUTURO = [87, 88, 89, 90, 91, 92];   // la escuela del valle (las dudas), el tutor (preguntar y la atención), la traducción (los de lejos), la biblioteca (menos inventadas, la mesa de revisión), la defensa (Bloom ya llegó) y la pregunta abierta
const ORDEN_SANTIAGO = [69, 70, 71, 72, 73, 74];   // los monitores, la Normal (el mapa), el silabario, las preceptoras, la ley (Sarmiento) y el kindergarten
const ORDEN_AMSTERDAM = [63, 64, 65, 66, 67, 68];   // el tipo móvil, la prensa (componer), la cartilla (los lectores), el atlas (el mapa), la Didáctica (Comenio) y el Orbis Pictus
const ORDEN_PARIS = [57, 58, 59, 60, 61, 62];   // el pergamino, la campana (el horario), el scriptorium (copiar), la disputatio (las cuestiones), la universidad (la licencia) y la Sorbona
const ORDEN_TENOCHTITLAN = [51, 52, 53, 54, 55, 56];   // el amate, el telpochcalli (la promesa), el calmécac, la cuicacalli (el canto), la cuenta de los días y la palabra antigua
const ORDEN_BAGDAD = [45, 46, 47, 48, 49, 50];   // el papel, la Casa (las caravanas), la traducción (la mesa), la halqa, el álgebra y la madrasa
function ordenSaberes() { // qué se ofrece ahora, y en qué orden; lo del fogón que quedara a medias se arrastra al final
  if (S.era === 21) return ORDEN_FUTURO;
  if (S.era === 15) return ORDEN_KAIFENG;
  if (S.era === 14) return ORDEN_ROMA;
  if (S.era === 10) return ORDEN_SANTIAGO;
  if (S.era === 9) return ORDEN_AMSTERDAM;
  if (S.era === 8) return ORDEN_PARIS;
  if (S.era === 7) return ORDEN_TENOCHTITLAN;
  if (S.era === 6) return ORDEN_BAGDAD;
  if (S.era === 5) return ORDEN_ALEJANDRIA;
  if (S.era === 4) return ORDEN_AGORA;
  if (S.era === 3) return ORDEN_EGIPTO;
  if (S.era === 2) return ORDEN_SUMER;
  if (S.era !== 1) return saberesEpoca(S.era);
  return S.edad >= 2 ? ORDEN_NEO.concat(ORDEN_PALEO.filter(i => S.tecs[i] && S.tecs[i].fase !== 'meseta')) : ORDEN_PALEO;
}
const minusNom = n => n.replace(/^(El|La|Los|Las) /, m => m.toLowerCase());
const aNom = n => { const m = minusNom(n); return m.startsWith('el ') ? 'Al ' + m.slice(3) : 'A ' + m; }; // «Al círculo», no «A el círculo»
const deNom = n => { const m = minusNom(n); return m.startsWith('el ') ? 'del ' + m.slice(3) : 'de ' + m; }; // «del telar», no «de el telar»
function faltanRecursos(T) { // De dónde salen los 🪙 DE VERDAD, según lo que la aldea sepa hacer hoy.
  // (Antes decía siempre «las historias junto al fuego las irán juntando», y contar historias no da ni una piedra.)
  // 🪙 no son piedras: es la cesta de trueque del clan (piedras, pieles y ofrendas). Nombrarla evita
  // que el emoji se lea literal y que un telar parezca costar cantos rodados.
  const falta = Math.max(0, T.costo - S.pre), cesta = ordEra(S.era) < 11 ? 'recursos' : 'presupuesto';
  const pide = `Para ${minusNom(T.nombre)} faltan ${fmt(falta)} ${monIco()} de ${cesta}`;
  if (cultivoActivo() && (S.cultivo || 0) >= 1) return { t: `${pide}. El campo está dorado: cosecharlo es lo que más rinde.`, g: { x: 4.65, y: 11.15 } };
  if (cultivoActivo()) return { t: `${pide}. Cada cosecha de cebada rinde de sobra; la de ahora va por el ${Math.round((S.cultivo || 0) * 100)}%.`, g: { x: 4.65, y: 11.15 } };
  if (cazaDisponible()) return { t: `${pide}. Una cacería en equipo vuelve cargada: envía la partida.`, g: { x: MAMUT_HOME.x, y: MAMUT_HOME.y } };
  if (truequeDisponible()) return { t: `${pide}. La memoria del clan está llena: lo que ya no cabe, cuéntaselo a un clan vecino y dejará lo que trae.`, g: { x: LUGAR_PENSADOR.abuela[0], y: LUGAR_PENSADOR.abuela[1] } };   // C2
  const luz = colectibles.find(n => n.mat);
  const donde = S.era === 21 ? 'del valle' : S.era === 15 ? 'de Kaifeng' : S.era === 14 ? 'de la orilla del Tíber' : S.era === 10 ? 'de Santiago' : S.era === 9 ? 'de Ámsterdam' : S.era === 8 ? 'de París' : S.era === 7 ? 'de Tenochtitlan' : S.era === 6 ? 'de Bagdad' : S.era === 5 ? 'de la ciudad' : S.era === 4 ? 'del ágora' : S.era === 3 ? 'del valle' : S.era === 2 ? 'de la ribera' : 'de la estepa'; // cada época nombra su suelo (Egipto decía «estepa»; Atenas también, 2026-10-01)
  if (luz) return { t: `${pide}. Recoge las luces doradas ${donde}: cada una deja algo.`, g: { x: luz.x, y: luz.y } };
  // cada época dice qué es lo que más paga (QA completo: en Egipto decía «van entrando solos» y lo que paga es el papiro)
  if (S.era === 3) return { t: `${pide}. Lo que más paga es pasar al papiro lo ya ensayado en la piedra; el tributo del valle suma el resto.`, g: null };
  if (S.era === 4) {                                    // en el ágora casi nada entra solo: paga la lección (el misthós) y la liturgia de cada estación
    if (puedeDecir()) return { t: `${pide}. Lo que más paga es la lección: cada duda que se dice en el banco la paga el padre del muchacho.`, g: { x: BANCO_DECIR.x, y: BANCO_DECIR.y } };
    if (S.tecs[37] && S.tecs[37].fase === 'meseta') return { t: `${pide}. Los pagan los padres: por cada duda dicha y, con el tiempo, por las respuestas que los muchachos producen. La liturgia suma cada estación.`, g: null };
    return { t: `${pide}. Por ahora los trae la liturgia de cada estación; cuando la pregunta se aprenda, los padres pagarán cada lección.`, g: null };
  }
  if (S.era === 14) {                                   // en Roma pagan los padres (en los idus, por cada alumno), los clientes de los oradores y el minerval de la primavera
    const orador = (S.alumnosRo || []).find(a => a.e === 2 && a.p >= PASA_ENTERO && puedePasar(a));
    if (orador) return { t: `${pide}. ${orador.n} está listo para defender su primer caso en la basílica Julia: pásalo (toca las escuelas) y sus clientes pagan.`, g: { x: RHETOR_RO.x, y: RHETOR_RO.y } };
    if (enSalas() > 0) return { t: `${pide}. Los traen los padres, que le pagan al maestro en los idus por cada alumno (más en las escuelas de arriba), ${rhetorAbierto() ? 'los oradores que defienden su primer caso' : 'y, cuando haya rétor, los oradores'} y el minerval de la primavera.`, g: null };
    return { t: `${pide}. Por ahora los trae lo que paga la ciudad, cada estación; cuando abra el ludus, los padres pagarán por cada alumno.`, g: null };
  }
  if (S.era === 21) {                                   // en el valle pagan las familias, por lo que aprenden sus hijos (más por el que entendió), y la comunidad cada estación
    if (dudasEsperan() > 0) return { t: `${pide}. Los traen las familias, por lo que aprenden sus hijos: ${dudasEsperan() === 1 ? `${dudasFu()[0].n} espera` : dudasEsperan() + ' esperan'} con su pregunta (toca la escuela).`, g: { x: ESCUELA_FU.x, y: ESCUELA_FU.y, abre: () => abrirPregunta() } };
    if (escuelaFu()) return { t: `${pide}. Los traen las familias del valle: más por el que entendió que por el que solo entregó la tarea (${fmt(Math.round(sueldoFu() * 60))} ${monIco()} por minuto, ahora). Y la comunidad, cada estación.`, g: null };
    return { t: `${pide}. Por ahora los trae la comunidad del valle, cada estación. Con la escuela llegan los estudiantes con sus preguntas.`, g: null };
  }
  if (S.era === 15) {                                   // en Kaifeng paga la prefectura (la renta de las tierras de la escuela) y mandan a casa los que aprueban el examen
    if (candidatosEsperan() > 0) return { t: `${pide}. Los mandan a casa los que aprueban el examen (en ${relojCh(examenEn())}): elige cómo se prepara cada candidato que espera (toca la escuela de la prefectura).`, g: { x: PREFECTURA_CH.x, y: PREFECTURA_CH.y, abre: () => abrirExamen() } };
    if (prefecturaCh()) return { t: `${pide}. Los traen, sobre todo, los que aprobaron el examen: mientras gobiernan mandan a casa ${fmt(Math.round(sueldoCh() * EXAMEN_CADA))} ${monIco()} por estación (el que estudió para entender, más del triple que el que memorizó). Y la renta de las tierras de la escuela. El próximo examen, en ${relojCh(examenEn())}.`, g: null };
    return { t: `${pide}. Por ahora los trae la renta de las tierras de la escuela, cada estación, y crece con el renombre de tus maestros. Con la escuela de la prefectura llegan los candidatos al examen.`, g: null };
  }
  if (S.era === 10) {                                   // en Chile pagan las escuelas de los pueblos (el pueblo y el Estado) y la ciudad
    if (normalAbierta() && (S.normalistas || 0) > 0) return { t: `${pide}. Hay ${S.normalistas === 1 ? 'un normalista esperando' : S.normalistas + ' normalistas esperando'} su pueblo: mándalos (toca la Escuela Normal). Cada escuela que abre paga, cada tanto, lo que ponen el pueblo y el Estado.`, g: { x: NORMAL_SA.x, y: NORMAL_SA.y } };
    if (escuelasAbiertas() > 0) return { t: `${pide}. Los traen las escuelas de los pueblos (lo que pagan el pueblo y el Estado) y la ciudad. ${normalAbierta() ? 'Más escuelas, más recursos: el próximo normalista ya estudia.' : ''}`, g: null };
    return { t: `${pide}. Por ahora los traen el Estado y los vecinos, cada estación; cuando haya Escuela Normal, cada escuela que se abra en un pueblo va a pagar.`, g: null };
  }
  if (S.era === 9) {                                    // en Ámsterdam pagan las tiradas de la prensa (lo que se vende), los libreros y la ciudad
    if (prensaAbierta() && !S.forma) return { t: `${pide}. La prensa está quieta: compón algo (toca la imprenta). Una vez armada la forma, cada tirada se vende sola.`, g: { x: PRENSA_AM.x, y: PRENSA_AM.y } };
    if (S.forma && S.forma.fase === 'tirar' && (S.mats.pliego || 0) < 1) return { t: `${pide}. La prensa se quedó sin papel: el molino de papel, sobre el bastión de la muralla, lo da. Recoge sus luces.`, g: { x: MOLINO_AM.x - 0.9, y: MOLINO_AM.y - 0.7 } };
    if (S.forma && S.forma.fase === 'tirar' && (S.demanda[S.forma.o] ?? 1) < 0.3) return { t: `${pide}. Ya casi nadie compra ${OBRAS_AM[S.forma.o].n}: el mercado está lleno. Compón otra cosa (toca la imprenta) y deja que la demanda vuelva sola.`, g: { x: PRENSA_AM.x, y: PRENSA_AM.y } };
    if (prensaAbierta()) return { t: `${pide}. Los traen las tiradas de la prensa (lo que se vende), los libreros y la ciudad, que paga sus escuelas.`, g: null };
    return { t: `${pide}. Por ahora los traen los libreros y la ciudad, cada estación; cuando haya prensa, cada tirada se venderá.`, g: null };
  }
  if (S.era === 8) {                                    // en París pagan los estacionarios (alquilan y venden las copias), las cuestiones disputadas y las rentas de cada estación
    if (licenciaDisponible()) return { t: `${pide}. Un bachiller espera su licencia en la sala de los maestros: dásela, y abrirá su escuela.`, g: { x: UNIVERSIDAD_PA.x, y: UNIVERSIDAD_PA.y } };
    if (campanaAbierta() && !(S.horario || []).includes('copiar') && scriptoriumAbierto()) return { t: `${pide}. Los libros copiados los alquilan y los venden los estacionarios: pon un tiempo de copiar en el horario (toca la campana).`, g: { x: CAMPANA_PA.x, y: CAMPANA_PA.y } };
    if (campanaAbierta() && disputaAbierta() && cuestionesPend() >= 2 && !(S.horario || []).includes('disputar')) return { t: `${pide}. Esperan ${cuestionesPend()} cuestiones en la Montaña, y los estudiantes pagan por oír una buena disputa: pon un tiempo de disputar en el horario (toca la campana).`, g: { x: CAMPANA_PA.x, y: CAMPANA_PA.y } };
    if ((S.libros || 0) > 0) return { t: `${pide}. Los traen la lección (los estudiantes pagan cada una en el tiempo de leer), los estacionarios que alquilan las copias${disputaAbierta() ? ', las cuestiones disputadas' : ''} y las rentas de cada estación.`, g: null };
    if (campanaAbierta()) return { t: `${pide}. Los traen la lección (en el tiempo de leer, los estudiantes pagan al maestro: la collecta) y las rentas de la abadía; cuando se copien libros, los estacionarios pagarán.`, g: null };
    return { t: `${pide}. Por ahora los traen las rentas de la abadía y el pago de los estudiantes, cada estación; cuando la campana parta el día, cada lección pagará, y cuando se copien libros, los estacionarios.`, g: null };
  }
  if (S.era === 7) {                                    // en Tenochtitlan pagan el tequio (el trabajo común de los que salieron del telpochcalli) y el tributo de las canoas
    if (palabraDisponible()) return { t: `${pide}. El anciano tiene la palabra lista para los jóvenes: escúchala, y el barrio gana renombre.`, g: { x: PALABRA_TE.x, y: PALABRA_TE.y } };
    if (nacidosPend() > 0 && telpoAbierto()) return { t: `${pide}. Hay un recién nacido esperando su escuela: preséntalo. Cada joven que sale del telpochcalli trabaja para el barrio, y eso paga.`, g: { x: PARTERA_TE.x, y: PARTERA_TE.y } };
    if ((S.egresTelpo || 0) > 0) return { t: `${pide}. Los traen el tequio, el trabajo común de los que salieron del telpochcalli, y el tributo de las canoas, cada estación.`, g: null };
    return { t: `${pide}. Por ahora los trae el tributo que llega en canoas, cada estación; cuando el telpochcalli forme a sus jóvenes, su trabajo pagará.`, g: null };
  }
  if (S.era === 6) {                                    // en Bagdad pagan los libreros (lo traducido se copia y se vende), las herencias del cadí y el Sawad
    if (herenciaDisponible()) return { t: `${pide}. El cadí tiene un reparto de herencia esperando: resuélvelo con el álgebra y el zoco paga.`, g: { x: CADI_BA.x, y: CADI_BA.y } };
    if (puedeTraducir()) return { t: `${pide}. Lo que más paga es traducir: cada obra que entra a la biblioteca la copian y la venden los libreros.`, g: { x: ESPERA_BA.x, y: ESPERA_BA.y } };
    if ((S.traducidas || 0) > 0) return { t: `${pide}. Los traen los libreros, que copian lo traducido, y el impuesto del Sawad, cada estación.`, g: null };
    return { t: `${pide}. Por ahora los trae el impuesto del Sawad, cada estación; cuando se traduzca, los libreros pagarán.`, g: null };
  }
  if (S.era === 5) {                                    // en Alejandría paga el fondo: lo catalogado se copia y se vende, y el rey paga el grano
    if (puedeCatalogar()) return { t: `${pide}. Lo que más paga es catalogar: cada rollo bien puesto entra al fondo, y los libreros pagan por copiar lo que se encuentra.`, g: { x: MUELLE_AL.x, y: MUELLE_AL.y } };
    if ((S.fondo || 0) > 0) return { t: `${pide}. Los trae el fondo de la Biblioteca (los libreros copian lo catalogado) y el tributo del grano, cada estación.`, g: null };
    return { t: `${pide}. Por ahora los trae el tributo del grano, cada estación; cuando lleguen los rollos y se cataloguen, el fondo pagará.`, g: null };
  }
  if (S.era === 2) return { t: `${pide}. Sellar las cuentas del templo y destapar los canales es lo que más paga; el resto entra solo con el tiempo.`, g: null };
  return { t: `${pide}. Van entrando solos con el tiempo, y más rápido cuanto mayor es nuestro renombre.`, g: null };
}
let consejoG = null, hayConsejo = false; // la guía del consejo vigente (clic en la tarjeta = viajar)
function pedirTallar(firma) {
  const n = cuentasPendientes();
  return { f: firma, t: n === 1 ? 'Quedó una cosa sin contar. Talla su muesca en el hueso: lo que se cuenta ya no se olvida, y el clan aprende más rápido.' : `Quedaron ${n} cosas sin contar. Tócalas en el hueso: cada toque talla hasta cinco, y lo contado ya no se olvida.`, g: { x: 5.3, y: 8.4 } };
}
const nPl = (T, plural, singular) => /p$/.test(T.genero || '') ? plural : singular; // «las pinturas juntan polvo», no «junta»
/* los demás saberes que ya se pueden pulir: el motor los pule en paralelo, y si la consejera nombra uno solo, quien la sigue
   al pie de la letra pule de a uno y la época se alarga (QA completo, 2026-10-03) */
function yOtrosAfinar(lista, i) {
  const n = lista.filter(k => k !== i && S.tecs[k] && S.tecs[k].fase === 'meseta' && (S.tecs[k].nivel || 0) < 3 && !(S.tecs[k].prof > 0) && S.apr >= profCosto(k)).length;
  return n === 0 ? '' : n === 1 ? ' Otro saber también puede pulirse a la vez: no hace falta esperar.' : ` Otros ${n} saberes también pueden pulirse a la vez: no hace falta esperar.`;
}
function consejoActual() { // la LÍNEA DE TRABAJO: siempre hay un siguiente paso, dicho con la voz de la época
  if (S.era !== 1) return consejoEpoca(); // las Épocas 2+ comparten una espina; la 1 tiene su ramal (fuego, orilla, cuentas…)
  const dom = i => S.tecs[i] && S.tecs[i].fase === 'meseta';
  const firma = S.abuela === 2 ? 'La Abuela' : 'La Mayor';
  if (!S.fuegoDescubierto) return { f: 'La Mayor', t: 'Frota las varas junto al fogón apagado. La primera chispa cuesta: insiste.', g: { x: 6.5, y: 9.5, chip: 'chip-varas' } };
  if (S.fuego < 42) {
    if ((S.mats.lena || 0) >= 1) return { f: firma, t: 'El fuego tiene hambre. Tócalo y échale un tronco.', g: { x: 6.5, y: 9.5 } };
    const nl = colectibles.find(n => n.mat && n.mat.k === 'lena'), zl = querenciaDe('lena')[0];
    return { f: firma, t: nl ? 'El fuego pide leña y no tenemos. Su luz dorada ya está encendida: recógela.' : 'El fuego pide leña y no tenemos. ' + QUERENCIA_DICE.lena, g: nl ? { x: nl.x, y: nl.y } : { x: zl.x, y: zl.y } };
  }
  const orden = ordenSaberes();
  const vi = orden.find(i => S.tecs[i] && S.tecs[i].fase === 'valle');
  if (vi !== undefined) {
    const T = BALANCE.tecnologias[vi];
    return { f: firma, t: S.apr >= T.formCosto ? `${T.nombre} ${nPl(T, 'juntan', 'junta')} polvo. Enciende su saber desde su ficha del dock.` : `${T.nombre} ${nPl(T, 'juntan', 'junta')} polvo y el ánimo decae. Reunimos saber para encenderlo otra vez.`, g: { chip: 'chip-' + T.id } };
  }
  // AL ATARDECER, LA ABUELA AVISA (lista de cotejo B4): a ×5 la noche dura unos 12 s y la historia se escapaba
  if (abuelaCapPend() && !abuelaCapDisponible() && !((S.abuelaCd || 0) > 0) && atardece()) return { f: 'La Abuela', t: 'Esta noche tengo una historia para el clan. Cuando caiga el sol, ven a sentarte junto al fuego.', g: { x: LUGAR_PENSADOR.abuela[0], y: LUGAR_PENSADOR.abuela[1] } };
  if (abuelaCapDisponible()) return { f: 'La Abuela', t: 'Ven, siéntate conmigo junto al fuego. Tengo una historia para el clan.', g: { x: LUGAR_PENSADOR.abuela[0], y: LUGAR_PENSADOR.abuela[1] } };
  if (S.abuela === 1 && S.apr >= VISITAS.abuela.costo) return { f: 'La Mayor', t: 'Una anciana se sentó junto a nuestro fuego. Escucha lo que trae: los viejos guardan caminos.', g: { x: LUGAR_PENSADOR.abuela[0], y: LUGAR_PENSADOR.abuela[1] } }; // solo si alcanza para acogerla: si no, la voz baja al siguiente saber
  if (S.animo < animoMax() * 0.5 && !(S.teCd > 0) && S.apr >= BALANCE.te.costo) return { f: firma, ...{ t: `El ánimo está bajo (${Math.round(S.animo)} de ${animoMax()}) y así se aprende más lento. Una pausa de ${LEX().te.replace(/^[^\p{L}]+/u, '').toLowerCase()} lo levanta: está en el dock.`, g: { chip: 'chip-te' } } };   // el ánimo bajo no pasaba inadvertido (QA completo: cayó a 40/110 sin un consejo)
  if (cultivoActivo() && (S.cultivo || 0) >= 1) return { f: firma, t: 'El campo está dorado. Cosecha el grano antes de que se duerma la tarde.', g: { x: 5.4, y: 11.9 } };
  if (haySitioEnLaOrilla()) return { f: firma, t: S.alumnos - alumnosBien() > 0 ? `Hay pequeños aprendiendo a medias y en la orilla queda sitio. Sienta a uno junto a quien ya sabe: no hay que explicarle nada, basta hacerle un lugar.` : `En la orilla queda sitio. Sienta a otro pequeño junto a quien ya sabe: lo que saque del agua también alimenta al clan.`, g: { x: PESCA.x, y: PESCA.y } };
  if (cuentasPendientes() > 0) {
    // LA CUENTA NO TAPA EL CAMINO (lista de cotejo C1, 2026-09-29): desde que la pesca deja cuentas cada 20 s,
    // pedir tallar por UNA cuenta ocupaba a la consejera casi todo el tiempo. Aquí solo el signo y la piedra
    // entera (cinco esperando); con menos, lo pide más abajo, cuando no haya un saber que crear o encender.
    if (!S.signo && (S.abuelaCap || 0) >= 3) return { f: 'La Abuela', t: 'Esa marca ya no cabe en el hueso. Toma barro húmedo y presiónala ahí: que diga lo contado sin ser lo contado.', g: { x: 5.3, y: 8.4 } };
    if (cuentasPendientes() >= 5) return pedirTallar(firma);
  }
  // LA PRIMERA CACERÍA NO SE PIERDE POR SILENCIO. Sin esto, la consejera solo sugería cazar cuando
  // faltaban recursos: con la cesta llena podías dominar la cacería sin ver nunca su espectáculo (los
  // roles, las señales, el mamut invicto), que es donde vive su lección. Medido con el bot: el jugador
  // óptimo la lanzaba UNA vez o ninguna. Es una señal, no una cuota: la época cierra igual sin cazar.
  if (!(S.cazasHechas || 0) && cazaDisponible()) return { f: firma, t: 'Los jóvenes ya saben las señales y piden su primera cacería. Envía la partida: mirar el plan también es la lección.', g: { x: MAMUT_HOME.x, y: MAMUT_HOME.y } };
  const si = orden.find(i => S.tecs[i] && S.tecs[i].fase === 'sin');
  if (si !== undefined) {
    const T = BALANCE.tecnologias[si], mat = MAT_DE_TEC[si];
    if (mat && (S.mats[mat] || 0) < MAT_COSTO) {
      const M = MATERIALES.find(m => m.k === mat);
      if (mat === 'grano') return { f: firma, t: `Para ${minusNom(T.nombre)} falta 🌾 grano (${S.mats.grano || 0}/${MAT_COSTO}). El campo lo da: siembra y cosecha.`, g: { x: 5.4, y: 11.9 } };
      const nn = colectibles.find(n => n.mat && n.mat.k === mat);
      // si hay luz encendida te llevo a ELLA; si no, al sitio donde ese material se da, que es lo que
      // un mayor enseñaría de verdad: no "búscalo por ahí", sino "eso sale aquí"
      const zona = querenciaDe(mat)[0];
      return { f: firma, t: `Para ${minusNom(T.nombre)} falta ${M.emoji} ${M.n} (${S.mats[mat] || 0}/${MAT_COSTO}). ${nn ? 'Su luz dorada ya está encendida.' : QUERENCIA_DICE[mat] || `Las luces doradas ${S.era === 5 ? 'de la ciudad' : S.era === 4 ? 'del ágora' : S.era === 3 ? 'del valle' : S.era === 2 ? 'de la ribera' : 'de la estepa'} lo regalan.`}`, g: nn ? { x: nn.x, y: nn.y } : zona ? { x: zona.x, y: zona.y } : null };
    }
    if (S.pre < T.costo) return { ...faltanRecursos(T), f: firma };
    return { f: firma, t: `Ya podemos crear ${minusNom(T.nombre)}. Su ficha espera en el dock.`, g: { chip: 'chip-' + T.id } };
  }
  const fo = orden.find(i => S.tecs[i] && S.tecs[i].fase !== 'meseta');
  if (fo !== undefined) {
    const T = BALANCE.tecnologias[fo], e = ESCENAS_SABER.find(e2 => e2.i === fo);
    return { f: firma, t: S.tecs[fo].fase === 'novedad' ? `${T.nombre} ${nPl(T, 'son', 'es')} la novedad y ${nPl(T, 'rinden', 'rinde')} con todo. Aprovecha su impulso.` : `El saber ${deNom(T.nombre)} prende de guía en guía. Dale su tiempo.`, g: e ? { x: e.x, y: e.y } : null };
  }
  const milenios = S.ganadoF && S.signo && S.era !== ULTIMA_EPOCA && memoriaLlena();   // con los Milenios listos, primero ellos
  if (!milenios && cuentasPendientes() > 0 && multCuenta() < 1 + CUENTA_TOPE - 1e-9) return pedirTallar(firma); // lo contado aún suma al saber
  if (abuelaCapPend()) { // historia ganada, pero el momento es la velada: el ritmo también enseña
    return { f: 'La Abuela', t: (S.abuelaCd || 0) > 0 ? 'Una historia por noche, no más: lo contado debe asentarse. Mañana sigo.' : 'Las historias se cuentan de noche, junto al fuego vivo. Cuando caiga el sol, ven a sentarte.', g: { x: LUGAR_PENSADOR.abuela[0], y: LUGAR_PENSADOR.abuela[1] } };
  }
  if (S.ganadoF) {
    // En la frontera no hay milenios que cruzar: la Abuela despide, y el valle queda para quedarse en él.
    // (Las líneas de los Milenios, abajo, son andamio: despiertan cuando ULTIMA_EPOCA avance más allá del 1.)
    if (S.era === ULTIMA_EPOCA) return { f: 'La Abuela', t: 'Ya está todo aprendido, y el fuego sigue encendido. Quédate el rato que quieras: mira crecer el campo, escucha el río, deja pasar las estaciones.', g: null };
    if (!S.signo) return { f: 'La Abuela', t: 'Ahora cuenta tú. Cuando el rebaño vuelva al cerco al anochecer, talla esa cuenta en el hueso: sin esa marca, los milenios no tienen por dónde empezar.', g: { x: 5.3, y: 8.4 } };
    const ok = memoriaLlena();
    return ok ? { f: 'La Abuela', t: 'Ya no nos cabe más en la memoria: lo que aprendemos se nos empieza a olvidar. Hace falta escribirlo. Deja pasar los milenios: el reloj espera en el dock.', g: { chip: 'chip-inv' } }
              : { f: 'La Abuela', t: 'Todo lo aprendido madura solo. Cuando la memoria del clan esté llena, cruzaremos los milenios.', g: null };
  }
  // LA PERFECCIÓN CIERRA LA ÉPOCA (terminados en 15-economia): la voz recorre los DIEZ saberes, no el
  // orden del momento (que en la edad 2 pliega los del fogón ya aprendidos), y no se calla cuando no
  // alcanza el saber: si el cierre espera el pulido, la consejera lo dice.
  const pulir = S.edad >= 2 ? ORDEN_PALEO.concat(ORDEN_NEO) : orden;
  const pi = pulir.find(i => dom(i) && (S.tecs[i].nivel || 0) < 3 && !(S.tecs[i].prof > 0));
  if (pi !== undefined) {
    const T = BALANCE.tecnologias[pi], et = (S.tecs[pi].nivel || 0) + 1;
    return S.apr >= profCosto(pi)
      ? { f: firma, t: `${T.nombre} ${nPl(T, 'pueden', 'puede')} afinarse. Perfecciona su etapa ${et}/3 desde su ficha.${yOtrosAfinar(pulir, pi)}`, g: { chip: 'chip-' + T.id } }
      : { f: firma, t: `${aNom(T.nombre)} le falta pulir la etapa ${et}/3. Reunimos saber 📖 para afinar${pron(T.id)}.`, g: { chip: 'chip-' + T.id } };
  }
  const pu = pulir.find(i => S.tecs[i] && S.tecs[i].prof > 0);
  if (pu !== undefined) {
    const T = BALANCE.tecnologias[pu];
    return { f: firma, t: `El clan pule ${minusNom(T.nombre)}: cada etapa asienta lo aprendido. Dale su tiempo.`, g: { chip: 'chip-' + T.id } };
  }
  return { f: firma, t: 'El fuego está vivo y el clan aprende solo. Vuelve cuando la brasa pida leña.', g: null };
}
/* LA CONSEJERA DE LAS ÉPOCAS 2+ (la C del motor). La misma espina para todas: lo que decae, el
   pensador que espera, el siguiente saber, quien enseña, lo que se forma, la compuerta del cierre, la
   investigación y el descanso. La VOZ y los textos de época viven en su entrada de ARCO_EPOCAS (15):
   época nueva = una entrada. La puerta donde esperan los pensadores es la misma para todos (20-main). */
const PUERTA = { x: 10.3, y: 9.1 };
const ESPERA_PENSADOR = { // el convite de cada visita, dicho por la voz de la época
  enheduanna: 'Una sacerdotisa espera con una tablilla propia bajo el brazo. Recíbela: un canto con nombre y apellido es algo que los escribas querrán copiar.',
  ptahhotep: 'El viejo visir espera sin apuro en la puerta. Recíbelo: quien enseña a escuchar, enseña dos veces.',
  zhuxi: 'Por la puerta de la ciudad entra un letrado de túnica sencilla con un libro bajo el brazo: Zhu Xi. Nació tres años después de que cayera Kaifeng y nunca la vio; viene como recuerdo, de un siglo que todavía no llega. Recíbelo: dice que leer para aprobar no es leer, y que hay que leer despacio, pensar y aplicarlo a uno mismo.',
  quintiliano: 'Un rétor de Calagurris, en Hispania, espera en la Vía Sacra con un rollo bajo el brazo: Quintiliano, el primero al que el Estado le paga por enseñar. Recíbelo: dice que los azotes no enseñan nada, y que a cada niño hay que mirarlo como distinto.',
  bloom: 'En la parada se baja un señor de anteojos con una carpeta llena de gráficos: Benjamin Bloom, que en 1984 midió cuánto más aprende el que tiene un tutor. Viene como recuerdo, de cuarenta años atrás. Recíbelo: dice que el problema nunca fue el tutor, sino que no alcanzaban para todos.',
  sarmiento: 'Un hombre de patillas y frente ancha baja de la cordillera en mula, por el camino de Mendoza: Sarmiento, exiliado otra vez. Recíbelo: dice que hay que educar al soberano, y que el soberano es el pueblo.',
  comenio: 'Un viejo de barba blanca acaba de bajar de un barco en el muelle del IJ, con un baúl de manuscritos: su casa de Leszno ardió con todos sus papeles. Es Comenio. Recíbelo: dice que hay que enseñar todo a todos.',
  abelardo: 'Un maestro joven y famoso espera al pie del Petit Pont, rodeado de estudiantes que lo siguieron desde la Montaña. Recíbelo: dice que dudando llegamos a preguntar, y preguntando, a la verdad.',
  neza: 'Una canoa de Texcoco acaba de llegar al embarcadero: el señor poeta, Nezahualcóyotl, espera con sus flores y sus cantos. Recíbelo: dice que solo la flor y el canto quedan en la tierra.',
  hunayn: 'Un médico con un fajo de manuscritos bajo el brazo espera en la puerta de la Casa de la Sabiduría. Recíbelo: dice que una traducción mal hecha es peor que ninguna, y que traducir se enseña.',
  hipatia: 'Una mujer con el manto de los filósofos espera en la puerta del Museo, con los Elementos bajo el brazo. Recíbela: explica a Euclides y a Platón en la calle, a quien quiera escucharla.',
  socrates: 'Un hombre descalzo espera en la plaza y ya le hizo tres preguntas a un muchacho. Recíbelo: dice que no sabe nada, y es lo más peligroso que ha entrado al ágora.',
  dewey: 'El profesor Dewey espera en la puerta, mirando el huerto. Recíbelo: dice que ahí hay más lecciones que en cualquier lámina.',
  skinner: 'El profesor Skinner espera junto a la puerta con su máquina. Recíbelo y decide con calma: la eficiencia también cobra.',
  freire: 'Paulo Freire llegó conversando con los vecinos y espera en la puerta. Recíbelo: quiere que el aula hable con el pueblo, y de noche.'
};
function consejoEpoca() {
  const A = ARCO_EPOCAS.find(a => a.era === S.era) || ARCO_EPOCAS.find(a => a.desde && ordEra(S.era) > ordEra(a.era));
  if (!A || !A.voz) return null; // época sin voz declarada: mejor callar que inventar
  const { f, cara } = A.voz(), L = LEX(), orden = ordenSaberes();
  const vi = orden.find(i => S.tecs[i] && S.tecs[i].fase === 'valle');
  if (vi !== undefined) {
    const T = BALANCE.tecnologias[vi];
    return { f, cara, t: S.apr >= T.formCosto ? `${T.nombre} ${nPl(T, 'juntan', 'junta')} polvo. ${L.formar} desde su ficha del dock.` : `${T.nombre} ${nPl(T, 'juntan', 'junta')} polvo y el ánimo decae. Reunimos saber para ${L.formar.toLowerCase()} otra vez.`, g: { chip: 'chip-' + T.id } };
  }
  for (const k of ['enheduanna', 'ptahhotep', 'socrates', 'hipatia', 'quintiliano', 'hunayn', 'zhuxi', 'abelardo', 'neza', 'comenio', 'sarmiento', 'bloom', 'dewey', 'skinner', 'freire']) // la visita que ya podemos recibir
    if (estadoPensador(k) === 1 && S.apr >= VISITAS[k].costo) return { f, cara, t: ESPERA_PENSADOR[k], g: k === 'hunayn' ? { x: PUERTA_CASA_BA.x, y: PUERTA_CASA_BA.y } : k === 'neza' ? { x: ESPERA_NEZA_TE.x, y: ESPERA_NEZA_TE.y } : k === 'abelardo' ? { x: ESPERA_ABELARDO_PA.x, y: ESPERA_ABELARDO_PA.y } : k === 'comenio' ? { x: ESPERA_COMENIO_AM.x, y: ESPERA_COMENIO_AM.y } : k === 'sarmiento' ? { x: ESPERA_SARMIENTO_SA.x, y: ESPERA_SARMIENTO_SA.y } : k === 'quintiliano' ? { x: ESPERA_QUINTILIANO_RO.x, y: ESPERA_QUINTILIANO_RO.y } : k === 'zhuxi' ? { x: ESPERA_ZHUXI_CH.x, y: ESPERA_ZHUXI_CH.y } : k === 'bloom' ? { x: ESPERA_BLOOM_FU.x, y: ESPERA_BLOOM_FU.y } : { ...PUERTA } };
  if (himnoDisponible()) // la noche de la sacerdotisa manda sobre todo lo demás: es una vez por noche
    return { f, cara, t: 'La sacerdotisa mira la estrella del Eanna. Tócala y escucha el himno: la casa entera se serena.', g: { x: LUGAR_PENSADOR.enheduanna[0], y: LUGAR_PENSADOR.enheduanna[1] } };
  if (S.animo < animoMax() * 0.5 && !(S.teCd > 0) && S.apr >= BALANCE.te.costo && !campanaAbierta()) return { f, cara, ...{ t: `El ánimo está bajo (${Math.round(S.animo)} de ${animoMax()}) y así se aprende más lento. Una pausa de ${LEX().te.replace(/^[^\p{L}]+/u, '').toLowerCase()} lo levanta: está en el dock.`, g: { chip: 'chip-te' } } };   // el ánimo bajo (QA completo)
  if (herenciaDisponible() && (S.manuscritos || []).length < 3) // el cadí espera, pero no tanto como para dejar la mesa vacía
    return { f, cara, t: 'En el zoco, el cadí tiene un reparto de herencia: un padre, tres hijos y una deuda. Tócalo y resuélvelo con el método de al-Juarismi.', g: { x: CADI_BA.x, y: CADI_BA.y } };
  if (sombraDisponible()) // el mediodía del verano no espera: la sombra se mide una vez por año
    return { f, cara, t: 'Es mediodía en el solsticio: en Siene el sol cae a pique en el pozo. Toca la vara y mide su sombra: con ella se mide la Tierra.', g: { x: VARA_AL.x, y: VARA_AL.y } };
  if (S.era === 2 && (S.azolves || []).length >= 2) { const [ax, ay] = AZOLVE_SITIOS[S.azolves[0]];
    return { f, cara, t: 'El limo va tapando los canales: la corvea espera tu brazo. Toca las manchas que laten y la ciudad paga.', g: { x: ax, y: ay } }; }
  if (S[A.flag]) { // la época ya cerró: el paso de época habla ANTES que los verbos (que siguen pagando, pero ya no son el camino)
    if (S.era === ULTIMA_EPOCA && A.frontera) return { f, cara, t: A.frontera, g: null }; // en la frontera se despide, no se promete
    if (!A.inv) return { f, cara, t: A.invLista, g: { chip: 'chip-gen' } }; // la última época: la generación
    return S.apr >= A.inv ? { f, cara, t: A.invLista, g: { chip: 'chip-inv' } } : { f, cara, t: A.invFalta, g: null };
  }
  if (A.manos) { const m = A.manos(); if (m) return { f, cara, ...m }; } // los verbos propios de la época piden mano
  const si = orden.find(i => S.tecs[i] && S.tecs[i].fase === 'sin');
  if (si !== undefined) {
    const T = BALANCE.tecnologias[si];
    const mat = MAT_DE_TEC[si]; // el material de la época también se dice (la 1 lo hace en su ramal)
    if (mat && (S.mats[mat] || 0) < MAT_COSTO) {
      const M = MATERIALES.find(m2 => m2.k === mat), nn = colectibles.find(n => n.mat && n.mat.k === mat);
      const zona = querenciaDe(mat)[0];
      return { f, cara, t: `Para ${minusNom(T.nombre)} falta ${M.emoji} ${M.n} (${S.mats[mat] || 0}/${MAT_COSTO}). ${nn ? 'Su luz ya brilla: recógela.' : QUERENCIA_DICE[mat] || ''}`, g: nn ? { x: nn.x, y: nn.y } : zona ? { x: zona.x, y: zona.y } : null };
    }
    if (S.pre < T.costo) {
      if (ordEra(S.era) >= 12 && (S.kermCd || 0) <= 0 && S.apr >= kermesseCosto())
        return { f, cara, t: `Para ${minusNom(T.nombre)} faltan ${fmt(T.costo - S.pre)} ${monIco()}. Una kermesse los junta de una: la comunidad dona al ver lo aprendido.`, g: { chip: 'chip-kerm' } };
      return { ...faltanRecursos(T), f, cara };
    }
    return { f, cara, t: `Ya podemos ${L.comprar.toLowerCase()} ${minusNom(T.nombre)}. Su ficha espera en el dock.`, g: { chip: 'chip-' + T.id } };
  }
  if (S.alumnos > alumnosBien() && S.docentes < maxDocentes() && S.pre >= costoDocente() * 2)
    return { f, cara, t: `En ${L.casa} hay más aprendices que atención. Suma ${L.docente === 'Escriba' ? 'otro escriba' : L.docente === 'Maestro' ? 'otro maestro' : 'otro docente'}: el chip 👩‍🏫 espera.`, g: { chip: 'chip-doc' } };
  const fo = orden.find(i => S.tecs[i] && S.tecs[i].fase !== 'meseta');
  if (fo !== undefined) {
    const T = BALANCE.tecnologias[fo];
    return { f, cara, t: S.tecs[fo].fase === 'novedad' ? `${T.nombre} ${nPl(T, 'son', 'es')} la novedad y ${nPl(T, 'rinden', 'rinde')} con todo. Aprovecha su impulso.` : `${T.nombre}: ${L.formandoTxt} Dale su tiempo.`, g: { chip: 'chip-' + T.id } };
  }
  // la perfección habla ANTES que la compuerta del pensador: el cierre (terminados) también la espera,
  // y sin esta voz la tarjeta cantaría «los saberes están completos» con etapas a medio pulir
  const pi = orden.find(i => S.tecs[i] && S.tecs[i].fase === 'meseta' && (S.tecs[i].nivel || 0) < 3 && !(S.tecs[i].prof > 0));
  if (pi !== undefined) {
    const T = BALANCE.tecnologias[pi], et = (S.tecs[pi].nivel || 0) + 1;
    return S.apr >= profCosto(pi)
      ? { f, cara, t: `${T.nombre} ${nPl(T, 'pueden', 'puede')} afinarse. Perfecciona su etapa ${et}/3 desde su ficha.${yOtrosAfinar(orden, pi)}`, g: { chip: 'chip-' + T.id } }
      : { f, cara, t: `${aNom(T.nombre)} le falta pulir la etapa ${et}/3. Reunimos saber 📖 para afinar${pron(T.id)}.`, g: { chip: 'chip-' + T.id } };
  }
  if (A.pensador && !A.pensador() && !S[A.flag]) // todo aprendido, pero la época no cierra sin su pensador
    return { f, cara, t: `Los saberes están completos, pero falta ${A.pensadorTema}. Reunimos saber 📖 para recibir la visita.`, g: { ...PUERTA } };
  return { f, cara, t: A.idle, g: null };
}
/* EL HIMNO DE ENHEDUANNA. Adoptada, la sacerdotisa no se queda muda: de noche canta a Inanna desde
   su rincón, y escucharla serena a la casa (una vez por noche, como las historias de la Abuela: el
   ritmo es la lección). Su Nin-me-šara es el primer poema FIRMADO de la historia. */
function himnoDisponible() {
  return S.era === 2 && S.enheduanna === 2 && luzDia() < 0.45 && (S.himnoCd || 0) <= 0;
}
function cantarHimno() {
  if (!himnoDisponible()) return;
  S.himnoCd = 90; S.himnos = (S.himnos || 0) + 1;
  S.himnoEco = 150; // EL ECO DEL CANTO (2026-08-23, la regla de Enheduanna, de su propia cita: «lo que se canta de noche, que el escriba lo copie al mediodía»): una vuelta entera del sol en que cada copia corregida cuenta doble para la mano
  const antes = S.animo;
  S.animo = Math.min(animoMax(), S.animo + 12);
  const sube = Math.round(S.animo - antes);
  himnoGlowT = tFrame; // la estrella del Eanna arde con el canto
  sfx.canto(); jubilo();
  toast(`🌙 <b>El himno a Inanna.</b> «Señora de todos los poderes, luz radiante que baja del cielo»: Enheduanna canta hacia la estrella y la casa entera se serena${sube > 0 ? ` (<b>+${sube} de ánimo</b>)` : ''}. Y el canto queda en el aire: hasta la próxima noche, <b>cada copia corregida cuenta doble para la mano</b>. Lo que se canta de noche, el escriba lo copia al mediodía.`, 14000);
  fx.anillos.push({ born: performance.now(), x: LUGAR_PENSADOR.enheduanna[0], y: LUGAR_PENSADOR.enheduanna[1] });
  renderHUD(); guardar();
}
/* LA CORVEA DEL CANAL. El limo que regala la crecida también TAPA los canales, y destaparlos era el
   trabajo comunitario por excelencia de Sumer: la corvea. Aquí es el verbo que reparte el juego
   activo por el sur del mapa: el azolve aparece, late, y tu brazo lo destapa. Sin castigo (cozy):
   el canal tapado solo espera; destaparlo paga. */
const AZOLVE_SITIOS = [[7.2, 11.33], [12.0, 10.93], [9.35, 13.6], [13.0, 12.6], [10.45, 11.02]];
function destaparAzolve(idx) {
  if (!(S.azolves || []).includes(idx)) return;
  S.azolves = S.azolves.filter(i => i !== idx);
  const b = Math.round((16 + 6 * S.rep) * manoBono());
  S.pre += b;
  const [ax, ay] = AZOLVE_SITIOS[idx];
  fx.pops.push({ x: ax, y: ay - 0.4, txt: '+' + fmt(b) + ' ' + monIco(), born: performance.now() });
  fx.anillos.push({ born: performance.now(), x: ax, y: ay });
  sfx.azolve(); // el agua que vuelve a correr: voz propia (antes, «recoger»)
  if (!S.vioAzolve) { S.vioAzolve = true; toast('⛏️ <b>La corvea del canal.</b> El mismo limo que regala la crecida va tapando los canales, y destaparlos era el trabajo de todos, cada año. La ciudad paga el brazo: toca el limo cuando lo veas latir.', 12000); }
  renderHUD(); guardar();
}
/* ---------- LOS VERBOS DE EGIPTO (docs/era3-plan.md, plan firme 2026-08-24) ----------
   UN solo loop protagonista de dos toques y una ELECCIÓN espacial: el patio de las lascas (practicar,
   gratis) y la mesa del papiro (pasar, caro). Ambos consumen del mismo pool de ejercicios: elegir
   dónde errar ES el gesto. La corrección roja NO es verbo: es la devolución del maestro dentro del
   loop (la regla 5 del plan: clonar el espejo de Sumer era el riesgo c22). */
function oficioBono() { return 1 + Math.min(0.35, (S.practicas || 0) * 0.02); } // EL OFICIO DE LA PIEDRA: cada práctica devuelta mejora los papiros para siempre (paso 2%: el tope cae a ~22 prácticas, ~2/3 de la partida medida)
function practicasPorPapiro() { // LA COMPUERTA QUE SE RELAJA: 3 al inicio, 2 con el oficio a medias, 1 de maestro. Nunca 0: hasta el experto borronea (era3-plan)
  const b = oficioBono() - 1;
  return b >= 0.32 ? 1 : b >= 0.16 ? 2 : 3;
}
function kemytApuro() { // la Kemyt dominada apura los ejercicios del patio: el currículo alimenta la mesa (acople, hermano de tablillaCanasto)
  return S.tecs[22] && S.tecs[22].fase === 'meseta' ? 0.12 * (1 + nivelTec(22)) : 0;
}
const PATIO_LASCAS = { x: 9.8, y: 7.4 }, MESA_PAPIRO = { x: 11.0, y: 5.6 }; // la mesa en arena despejada, no contra la pared de la Casa
function puedePasarPapiro() { // ¿la mesa del papiro está lista para el evento? (ejercicio + compuerta cumplida + hoja)
  return S.era === 3 && (S.ejerPend || 0) > 0 && (S.practCred || 0) >= practicasPorPapiro() && (S.mats.papiro || 0) > 0;
}
function practicarEnPiedra() { // el toque barato: la lasca no cobra los errores
  if (S.era !== 3 || (S.ejerPend || 0) < 1) return;
  S.ejerPend--;
  S.lascas = (S.lascas || 0) + 1; // el montón del patio crece (la arqueología literal; su dibujo llega con la tanda visual)
  const marca = S.tecs[21] && S.tecs[21].fase === 'meseta'; // sin la paleta dominada no hay rojo del maestro: el intento no acredita (el ORDEN la ofrece antes, así que casi no pasa)
  if (marca) {
    S.practicas = (S.practicas || 0) + 1;
    S.practCred = (S.practCred || 0) + 1;
    if (S.ptahhotep === 2) { // LA PALETA-DIÁLOGO (la regla transformada, c23): con el arte de escuchar, la devolución además FORMA al aprendiz que la recibe
      const fi = S.tecs.findIndex(t2 => t2 && t2.fase === 'formando');
      if (fi >= 0) {
        S.tecs[fi].t = Math.max(0, S.tecs[fi].t - (S.tecs[fi].dur || BALANCE.tecnologias[fi].formDur) * 0.10); // el paso exacto lo afina el bot
        fx.pops.push({ x: MESA_PAPIRO.x, y: MESA_PAPIRO.y - 0.5, txt: '🪷 la escucha enseña', born: performance.now() });
      }
    }
  }
  const b = Math.round(tasa() * (2 + nivelTec(31))); S.apr += b; S.aprTotal += b; // practicar paga saber CHICO: el gesto entrena la mano, pero el que enseña de verdad es el texto terminado (ver pasarAlPapiro)
  fx.pops.push({ x: PATIO_LASCAS.x, y: PATIO_LASCAS.y - 0.3, txt: marca ? `práctica ${S.practCred}/${practicasPorPapiro()} · +${fmt(b)} 📖` : 'sin el rojo aún', born: performance.now() });
  fx.anillos.push({ born: performance.now(), x: PATIO_LASCAS.x, y: PATIO_LASCAS.y });
  sfx.raspa(); // el cálamo raspa la caliza: la voz propia del gesto
  if (!S.vioOstracon) { S.vioOstracon = true; toast('🪨 <b>La piedra no cobra los errores.</b> Cada ejercicio se puede ensayar en una lasca gratis: el maestro la devuelve marcada en rojo, y ese rojo cuenta. Cuando el maestro vea prácticas suficientes, lo ensayado puede pasar al papiro, que sí paga.', 13000); }
  renderHUD(); guardar();
}
function pasarAlPapiro() { // el toque caro: lo ensayado se vuelve permanente, y se siente EVENTO (meta: ~10-14 por partida)
  if (S.era !== 3 || (S.ejerPend || 0) < 1) return;
  if ((S.practCred || 0) < practicasPorPapiro() || (S.mats.papiro || 0) < 1) return;
  S.ejerPend--;
  S.practCred -= practicasPorPapiro();
  S.mats.papiro--;
  S.papiros = (S.papiros || 0) + 1;
  const b = Math.round((280 + 60 * S.rep) * oficioBono()); S.pre += b; // EL EVENTO paga como evento: pocos papiros, caros (la marea del plan)
  const ba = Math.round(tasa() * 18); S.apr += ba; S.aprTotal += ba; // y el texto que entra al archivo ENSEÑA: la página terminada vale más saber que veinte ensayos (con esto, pasar temprano alimenta la escalera de la época: la elección no tiene dueño)
  fx.pops.push({ x: MESA_PAPIRO.x + 0.7, y: MESA_PAPIRO.y - 0.75, txt: `+${fmt(ba)} 📖`, born: performance.now() + 300 });
  fx.pops.push({ x: MESA_PAPIRO.x, y: MESA_PAPIRO.y - 0.35, txt: `+${fmt(b)} ${monIco()} · 📃 al archivo`, born: performance.now() });
  fx.anillos.push({ born: performance.now(), x: MESA_PAPIRO.x, y: MESA_PAPIRO.y });
  sfx.papiro(); jubilo(); // el frote de la hoja y su acorde: el EVENTO suena a evento
  if (!S.vioPapiro) { S.vioPapiro = true; toast('📃 <b>Del ensayo al papiro.</b> Lo practicado en la piedra se escribe limpio en la hoja cara: paga fuerte y entra al archivo de la Casa. Cada papiro que ves aquí se pagó con lascas llenas de intentos.', 12000); }
  renderHUD(); guardar();
}
/* LOS LINDES DE LA VEGA: la crecida los borra; cuando el agua se retira (el cruce de ajet a péret),
   laten pidiendo la cuerda. El pulso del año hecho verbo, como manda el invariante c29. */
/* Los cuatro mojones viven en LA VEGA, a 2,7 del eje del Nilo: hasta el 2026-08-24 estaban a 0,4-1,5,
   o sea DENTRO del cauce (el agua llega a 1,94 en la crecida), y la cuerda se tendía sobre el agua. */
const LINDE_SITIOS = [[13.77, 8.62], [12.01, 11.07], [10.61, 13.01], [9.21, 14.96]];
function tenderCuerda(idx) {
  if (S.era !== 3 || !(S.lindes || []).includes(idx)) return;
  S.lindes = S.lindes.filter(i => i !== idx);
  const b = Math.round((60 + 20 * S.rep) * oficioBono()); // el ritual del año paga como ritual (2026-09-06: a 30+10·rep era ±0,1 min en la ablación; ahora los cuatro lindes valen como un pase largo)
  S.pre += b;
  const [lx, ly] = LINDE_SITIOS[idx];
  fx.pops.push({ x: lx, y: ly - 0.4, txt: '+' + fmt(b) + ' ' + monIco(), born: performance.now() });
  fx.anillos.push({ born: performance.now(), x: lx, y: ly });
  sfx.cuerdaTensa(); // la cuerda da su nota grave al tensarse
  if (!S.vioCuerda) { S.vioCuerda = true; toast('📐 <b>La cuerda vuelve a medir.</b> La crecida borró los lindes y el valle entero se re-mide, cada año, desde hace milenios: la geometría nació aquí, de agacharse con una cuerda anudada. La ciudad paga la medida.', 12000); }
  renderHUD(); guardar();
}
/* ---------- LOS VERBOS DEL ÁGORA (docs/era4-plan.md, plan firme 2026-09-06) ----------
   El ágora deja DUDAS pendientes (como los ejercicios de Egipto: ralas). Al tocar el banco del
   grammatistes se DICE la respuesta (rápido, paga poco, no forma); al tocar el claro del ágora se
   PREGUNTA: el aprendiz entra en aporía, camina pensando ~12 s con su «?» y vuelve con «!»: paga más
   en saber y suma al REPERTORIO (el bono estructural: los que produjeron respuestas enseñan un poco
   a los demás, con tope). Ambos gastan una tablilla de cera. Con Sócrates adoptado, la aporía además
   FORMA (adelanta la instrucción de un maestro en formación): la regla transformada del pensador. */
const APORIA_DUR = 12;
function repertorioBono() { return 1 + Math.min(0.30, (S.respuestas || 0) * 0.015); } // el repertorio: cada respuesta producida mejora lo que TODO el ágora aprende, tope +30% (~20 respuestas, ~2/3 de la partida)
function puedeDecir() { return S.era === 4 && (S.dudaPend || 0) > 0 && (S.mats.cera || 0) > 0 && S.tecs[37] && S.tecs[37].fase === 'meseta'; }
function puedePreguntar() { return puedeDecir() && (S.aporias || []).length < 3; }
function misthos() { return Math.round((45 + 15 * S.rep) * oficioBono() * sofistaPaga()); } // lo que paga el padre por la lección dicha: el misthós del grammatistes (Aristófanes, Nubes 1146: se cobraba por mes)
function decirRespuesta() { // el toque rápido: el maestro dicta, el padre paga, la duda se cierra ahora mismo (y no deja nada)
  if (!puedeDecir()) return;
  S.dudaPend--; S.mats.cera--; S.dichas = (S.dichas || 0) + 1;
  const m = misthos(); S.pre += m;
  const b = Math.round(tasa() * 3); S.apr += b; S.aprTotal += b;
  fx.pops.push({ x: BANCO_DECIR.x, y: BANCO_DECIR.y - 0.3, txt: `dicho · +${fmt(m)} ${monIco()}`, born: performance.now() });
  fx.pops.push({ x: BANCO_DECIR.x + 0.5, y: BANCO_DECIR.y - 0.7, txt: `+${fmt(b)} 📖`, born: performance.now() + 250 });
  fx.anillos.push({ born: performance.now(), x: BANCO_DECIR.x, y: BANCO_DECIR.y });
  sfx.alisar();
  if (!S.vioDuda) { S.vioDuda = true; toast(`🪑 <b>Decir la respuesta.</b> El grammatistes dicta, la duda se cierra al instante y el padre paga la lección: <b>+${fmt(m)} ${monIco()}</b>. Rápido, seguro y olvidable. La otra salida es el claro del ágora: preguntar, y que la respuesta la produzca quien la trajo.`, 12000); }
  renderHUD(); guardar();
}
function preguntarDuda() { // el toque lento: la duda se va a caminar con quien la trajo
  if (!puedePreguntar()) return;
  S.dudaPend--; S.mats.cera--;
  const i = ((S.respuestas || 0) + (S.aporias || []).length * 5 + Math.floor(S.tiempoJuego)) % Math.min(S.alumnos, 18); // qué aprendiz se la lleva: uno distinto cada vez
  S.aporias = (S.aporias || []).concat([{ i, t0: S.tiempoJuego }]);
  fx.pops.push({ x: AGORA_PREGUNTAR.x, y: AGORA_PREGUNTAR.y - 0.3, txt: '¿…? no sé', born: performance.now() });
  sfx.tap();
  if (!S.vioPregunta) { S.vioPregunta = true; toast('❓ <b>Preguntar en vez de decir.</b> Nadie le da la respuesta: se la lleva a caminar. Doce segundos de aporía («no sé») y vuelve con ella, que ya es suya: paga saber grande y suma al <b>repertorio</b> del ágora, que enseña a todos y con el tiempo trae padres que pagan por un maestro que hace pensar.', 13000); }
  renderHUD(); guardar();
}
function resolverAporia(a, silencioso) { // el «!»: la respuesta producida
  const b = Math.round(tasa() * 22 * repertorioBono()); S.apr += b; S.aprTotal += b;
  S.respuestas = (S.respuestas || 0) + 1;
  if (S.socrates === 2) { // LA REGLA DE SÓCRATES: la aporía también forma al maestro que está aprendiendo a preguntar
    const fi = S.tecs.findIndex(t2 => t2 && t2.fase === 'formando');
    if (fi >= 0) { S.tecs[fi].t = Math.max(0, S.tecs[fi].t - (S.tecs[fi].dur || BALANCE.tecnologias[fi].formDur) * 0.10); if (!silencioso) fx.pops.push({ x: AGORA_PREGUNTAR.x + 0.6, y: AGORA_PREGUNTAR.y - 0.6, txt: '🏛️ la aporía enseña', born: performance.now() + 300 }); }
  }
  if (!silencioso) { fx.pops.push({ x: AGORA_PREGUNTAR.x, y: AGORA_PREGUNTAR.y - 0.4, txt: `¡…! +${fmt(b)} 📖 · repertorio ${S.respuestas}`, born: performance.now() }); fx.anillos.push({ born: performance.now(), x: AGORA_PREGUNTAR.x, y: AGORA_PREGUNTAR.y }); sfx.eureka(); }
}
function sofistaCobro() { return Math.round(40 + 12 * S.rep); } // lo que cobra cada estación (150 s): un costo fijo que la actividad del ágora tiene que cubrir (medido 2026-09-07: con 90+30·rep era trampa)
function puedeContratarSofista() { return S.era === 4 && S.tecs[36] && S.tecs[36].fase === 'meseta' && !S.sofista && S.pre >= sofistaCobro(); }
function despedirSofista() { // el toque sobre el sofista ya contratado: se va sin rencor (y sin devolver nada)
  if (!S.sofista) return;
  S.sofista = 0; sfx.tap();
  fx.pops.push({ x: TARIMA_SOFISTA.x, y: TARIMA_SOFISTA.y - 0.5, txt: 'el sofista se va a Corinto', born: performance.now() });
  renderHUD(); guardar();
}
function contratarSofista() { // LA SEGUNDA ELECCIÓN: un maestro que llega formado al instante, pero cobra cada estación
  if (!puedeContratarSofista()) return;
  S.sofista = 1; S.sofistaEst = estacion().i;
  S.pre -= sofistaCobro(); debito('r-pre', `−${fmt(sofistaCobro())} ${monIco()}`);
  sfx.bolsa();
  fx.pops.push({ x: TARIMA_SOFISTA.x, y: TARIMA_SOFISTA.y - 0.5, txt: 'el sofista enseña… y cobra', born: performance.now() });
  if (!S.vioSofista) { S.vioSofista = true; toast(`💰 <b>El sofista cobra.</b> Enseña desde hoy, sin formación, atiende un círculo entero y trae a los hijos de los ricos: mientras esté, <b>los padres pagan un 30% más</b> por cada lección dicha y por el repertorio. Pero cada estación pasa la bolsa: <b>${fmt(sofistaCobro())} ${monIco()}</b>. Si no alcanza, se va a otra ciudad, sin rencor (y tocándolo de nuevo, lo despides). Sócrates diría que el saber no se vende; Protágoras, que el zapatero también cobra.`, 14000); }
  renderHUD(); guardar();
}
/* ---------- LOS VERBOS DE ALEJANDRÍA (docs/era5-plan.md, plan firme 2026-10-02) ----------
   LOS BARCOS traen libros: con los rollos de los barcos aprendidos y el mar abierto (en invierno no navega nadie), un
   barco amarra cada tanto y los hombres del rey se llevan sus rollos para copiarlos; cada copia gasta un papiro del
   Mareotis. LA SEGUNDA ELECCIÓN ⚖️: quedarse el original (vale más para el fondo, pero los barcos desconfían y vienen
   menos) o devolverlo y guardar la copia (los barcos siguen viniendo confiados). Los rollos esperan en el muelle
   (hasta 4). CATALOGAR, el gesto (con los Pínakes): se toca el muelle, se lee el autor con su pista y se elige su
   estante. Bien puesto, entra al FONDO: paga saber, suma al bono que mejora lo que aprende toda la ciudad (con tope)
   y, con el tiempo, renta (los libreros copian lo que se encuentra). Mal puesto, se pierde en los estantes y vuelve
   al muelle más tarde: sin castigo, solo tiempo. LA SOMBRA (con la de Eratóstenes): una vez por año, al mediodía del
   verano, la vara del patio pide que se mida su sombra. */
const ROLLOS_TOPE = 4, BARCO_CADA = 40, BARCO_AMARRA = 22;
function fondoBono() { return 1 + Math.min(0.30, (S.fondoValor || 0) * 0.012); }        // el fondo: lo catalogado mejora lo que aprende la ciudad entera, tope +30 % (~25 de valor)
function rollosAbierto() { return S.era === 5 && S.tecs[40] && S.tecs[40].fase === 'meseta'; }
function marCerrado() { return S.era === 5 && estacion().i === 3; }
function rollosPend() { return (S.muelle || []).length; }
function puedeCatalogar() { return S.era === 5 && rollosPend() > 0 && S.tecs[41] && S.tecs[41].fase === 'meseta'; }
function codiceListo() { return ordEra(S.era) >= 5 && S.tecs[44] && S.tecs[44].fase === 'meseta'; }
function perdidoDur() { return codiceListo() ? 10 : 45; }                                  // con el códice, lo perdido se encuentra (se hojea en vez de desenrollar)
function valorRollo(r) { return (r.o ? 1.8 : 1) * (AUTORES_AL[r.a].g === 3 && S.tecs[42] && S.tecs[42].fase === 'meseta' ? 2 : 1); } // el original vale más; con los Elementos, la Matemática rinde el doble
function autorQueLlega() { // los barcos no traen siempre al mismo: el que menos se ha visto en el muelle
  const n = (S.fondo || 0) + (S.perdidos || []).length + rollosPend() + Math.floor(S.tiempoJuego / 7);
  return (n * 7 + (S.muelle || []).length * 3) % AUTORES_AL.length;
}
function amarrarBarco(silencioso) { // un barco entra al Gran Puerto: los hombres del rey revisan su carga y se llevan los libros a copiar
  const n = 1 + (Math.floor(S.tiempoJuego / 13) % 3 === 0 ? 1 : 0), quedar = S.originales === 'quedar';
  S.barco = { t0: S.tiempoJuego, n }; S.muelle = S.muelle || [];
  let copiados = 0, sinPapiro = 0;
  for (let k = 0; k < n; k++) {
    if (rollosPend() >= ROLLOS_TOPE) break;
    if ((S.mats.papiro || 0) < 1) { sinPapiro++; continue; }
    S.mats.papiro--; S.muelle.push({ a: autorQueLlega(), o: quedar }); copiados++;
    if (quedar) S.desconfianza = Math.min(10, (S.desconfianza || 0) + 2);   // la noticia corre rápido por los puertos
  }
  if (!silencioso) {
    sfx.campanaBarco();
    if (copiados) fx.pops.push({ x: MUELLE_AL.x, y: MUELLE_AL.y - 0.4, txt: `⛵ ${copiados === 1 ? 'un rollo' : copiados + ' rollos'} al muelle${quedar ? ' (el original)' : ''}`, born: performance.now() });
    if (sinPapiro) fx.pops.push({ x: AMARRE_AL.x, y: AMARRE_AL.y - 0.5, txt: '🌿 sin papiro para la copia', born: performance.now() + 300 });
    if (!S.vioBarco) { S.vioBarco = true; toast('⛵ <b>Un barco en el Gran Puerto.</b> Por orden del rey, los libros que traen los barcos se llevan a la Biblioteca para copiarlos: cada copia gasta un 🌿 papiro del Mareotis. Los rollos esperan en el muelle.', 12000); }
  }
}
function catalogar(g) { // EL GESTO: el rollo del muelle va al estante que se eligió
  if (!puedeCatalogar() || g < 0 || g >= GENEROS_AL.length) return null;
  const r = S.muelle.shift(), A = AUTORES_AL[r.a], ok = A.g === g;
  if (ok) {
    const v = valorRollo(r);
    S.fondo = (S.fondo || 0) + 1; S.fondoValor = (S.fondoValor || 0) + v;
    const b = Math.round(tasa() * 12 * v); S.apr += b; S.aprTotal += b;
    fx.pops.push({ x: BIBLIOTECA_AL.x, y: BIBLIOTECA_AL.y - 0.6, txt: `${GENEROS_AL[g].ico} ${A.n} · +${fmt(b)} 📖`, born: performance.now() });
    fx.anillos.push({ born: performance.now(), x: BIBLIOTECA_AL.x, y: BIBLIOTECA_AL.y });
    sfx.desenrollar();
    if (!S.vioCatalogo) { S.vioCatalogo = true; toast(`🏷️ <b>Catalogado.</b> ${A.n} entra al fondo, en ${GENEROS_AL[g].n}, con su etiqueta colgando. Ahora cualquiera lo encuentra: lo catalogado mejora lo que aprende toda la ciudad y, con el tiempo, los libreros pagan por copiarlo.`, 13000); }
  } else {
    S.perdidos = (S.perdidos || []).concat([{ a: r.a, o: r.o, t0: S.tiempoJuego }]);
    fx.pops.push({ x: BIBLIOTECA_AL.x, y: BIBLIOTECA_AL.y - 0.6, txt: `${A.n} se pierde entre los rollos de ${GENEROS_AL[g].n}`, born: performance.now() });
    sfx.tap();
    if (!S.vioPerdido) { S.vioPerdido = true; toast(`📚 <b>Perdido en los estantes.</b> ${A.n} no es de ${GENEROS_AL[g].n}, y un rollo mal puesto es un rollo que nadie encuentra. Alguien lo va a hallar y lo devolverá al muelle: no se pierde nada más que el tiempo.`, 12000); }
  }
  renderHUD(); guardar();
  return ok;
}
function elegirOriginales(modo) { // LA SEGUNDA ELECCIÓN ⚖️ (se puede cambiar tocando la barca del puerto)
  if (S.era !== 5 || !['quedar', 'devolver'].includes(modo)) return;
  const antes = S.originales; S.originales = modo;
  if (antes !== modo) toast(modo === 'quedar'
    ? '⚖️ <b>Nos quedamos los originales.</b> Al dueño se le devuelve la copia, como cuenta Galeno: el original es el texto sin errores de copista y vale más para el fondo. Unos pocos no se notan; si son muchos, la noticia corre por los puertos y los barcos empiezan a venir menos.'
    : '⚖️ <b>Devolvemos los originales.</b> La Biblioteca guarda la copia y el dueño se lleva lo suyo: los barcos siguen viniendo confiados, aunque una copia vale menos que el original.', 13000);
  renderHUD(); guardar();
}
function anoAl() { return Math.floor(estacionCruda() / 4); }
function sombraDisponible() { return S.era === 5 && S.tecs[43] && S.tecs[43].fase === 'meseta' && estacion().i === 1 && luzDia() >= 0.85 && S.sombraAno !== anoAl(); }
function medirSombra() { // una vez por año, al mediodía del solsticio: el método de Eratóstenes
  if (!sombraDisponible()) return;
  S.sombraAno = anoAl(); S.sombras = (S.sombras || 0) + 1; S.rep++;   // paga saber grande y renombre
  const b = Math.round(tasa() * (120 + 30 * nivelTec(43))); S.apr += b; S.aprTotal += b;
  fx.pops.push({ x: VARA_AL.x, y: VARA_AL.y - 0.7, txt: `🌞 un cincuentavo del círculo · +${fmt(b)} 📖 · ⭐ +1`, born: performance.now() });
  fx.anillos.push({ born: performance.now(), x: VARA_AL.x, y: VARA_AL.y }); fx.destellos.push({ born: performance.now(), x: VARA_AL.x, y: VARA_AL.y });
  sfx.sombra();
  if (!S.vioSombra) { S.vioSombra = true; toast('🌞 <b>La sombra de la vara.</b> En Siene, hoy al mediodía, el sol no hace sombra en el fondo de un pozo; aquí la vara marca un cincuentavo del círculo. Si de Siene a Alejandría hay 5000 estadios, la Tierra entera mide cincuenta veces eso: <b>250 000 estadios</b>. Con una sombra, una distancia y un poco de geometría.', 15000); }
  renderHUD(); guardar();
}
/* ---------- BAGDAD (era6-plan): las caravanas, la mesa de los traductores, la ijaza y las herencias ----------
   LAS CARAVANAS (con la Casa de la Sabiduría) dejan uno o dos manuscritos adentro de la puerta de Kufa (caben 6; si está
   llena, la caravana sigue de largo con lo suyo). La primavera es su temporada (una cada 30 s); en otoño y en invierno
   vienen menos, y en verano, con el calor, no viaja nadie: es el tiempo de traducir y revisar lo juntado. Pocas obras y
   largas (~25 por época): cada una se mira y se elige.
   LLEGAN MÁS DE LO QUE DOS TRADUCTORES DESPACHAN POR EL SENTIDO: antes del taller de Hunayn, la elección pesa (palabra por
   palabra despeja la puerta; por el sentido rinde más por obra); con el taller, la mesa crece y las revisiones salen a la
   mitad. Es lo que pasó: primero las traducciones literales de la primera generación, después la escuela de Hunayn que
   las rehízo. TRADUCIR, el gesto (con la traducción): se toca la puerta, se lee
   la obra con su lengua y se elige CÓMO. Palabra por palabra: rápido, vale 1, y una de cada dos vuelve a la puerta para
   revisarse (lo que de verdad pasó: la escuela de Hunayn rehízo muchas traducciones literales). Por el sentido: lento, vale
   2,4 y entra al canon. La obra ocupa un asiento de la mesa; terminada, se copia en PAPEL (si no hay, espera en la mesa) y
   entra a la BIBLIOTECA: paga saber, sube lo que aprende toda la ciudad (tope +30 %) y los libreros la venden (renta, en
   15-economia). LA IJAZA (con la halqa): de vez en cuando un estudiante termina su libro y espera el permiso; dárselo lo
   vuelve repetidor (el muʿid), que atiende a 4 que aprendían a medias: con la halqa llegan estudiantes de todo el califato
   (10, y 2 más por etapa), más de los que los maestros alcanzan. LAS HERENCIAS (con el álgebra): una vez por
   estación, el cadí del zoco tiene un reparto que resolver. HUNAYN, el taller: cada traducción por el sentido forma a un
   aprendiz (un asiento más en la mesa, hasta dos), y las revisiones tardan la mitad. */
const MANUSCRITOS_TOPE = 6, CARAVANA_CADA = [30, 0, 45, 55], CARAVANA_PARADA = 14, REVISION_VUELVE = 60, IJAZA_CADA = 42, MUIDIN_TOPE = 4, MUIDIN_ATIENDE = 4;
const HALQA_VIENEN = 10, HALQA_VIENEN_ETAPA = 2;   // los que la halqa atrae de todo el califato
const METODOS_BA = { literal: { dur: 20, valor: 1 }, sentido: { dur: 54, valor: 2.4 } };   // pocas obras y largas: cada una se elige (~25 por época)
function bibliotecaBono() { return 1 + Math.min(0.30, (S.bibValor || 0) * 0.026); }       // lo traducido mejora lo que aprende la ciudad entera, tope +30 % (~12 de valor: unas cinco obras por el sentido)
function halqaVienen() { return halqaAbierta() ? HALQA_VIENEN + HALQA_VIENEN_ETAPA * nivelTec(48) : 0; }
function caravanasAbierto() { return S.era === 6 && S.tecs[46] && S.tecs[46].fase === 'meseta'; }
function caravanasParadas() { return S.era === 6 && estacion().i === 1; }                   // el calor del verano: no viaja nadie
function caravanaCada() { return CARAVANA_CADA[estacion().i] / (1 + 0.12 * nivelTec(46)); }   // la primavera es la temporada de las caravanas; la Casa perfeccionada atrae más
function mesaAbierta() { return S.era === 6 && S.tecs[47] && S.tecs[47].fase === 'meseta'; }
function asientosMesa() { return mesaAbierta() ? 2 + (nivelTec(47) >= 3 ? 1 : 0) + Math.min(2, S.taller || 0) : 0; }
function asientosLibres() { return Math.max(0, asientosMesa() - (S.mesa || []).length); }
function manuscritosPend() { return (S.manuscritos || []).length; }
function nuevosPend() { return (S.manuscritos || []).filter(m => !m.rev).length; }   // lo que trajeron las caravanas: lo que llena la puerta (las revisiones las trae la Casa)
function puedeTraducir() { return mesaAbierta() && manuscritosPend() > 0 && asientosLibres() > 0; }
function papelAbarata() { return ordEra(S.era) >= 6 && S.tecs[45] && S.tecs[45].fase === 'meseta' ? 0.85 : 1; }   // EL PAPEL: lo escrito abarata enseñar (formar maestros, −15 %)
function madrasaLista() { return ordEra(S.era) >= 6 && S.tecs[50] && S.tecs[50].fase === 'meseta'; }
function halqaAbierta() { return S.era === 6 && S.tecs[48] && S.tecs[48].fase === 'meseta'; }
function algebraLista() { return ordEra(S.era) >= 6 && S.tecs[49] && S.tecs[49].fase === 'meseta'; }
function valorObra(m, metodo) { // con el álgebra, la matemática y la astronomía valen la mitad más
  // REVISAR COTEJA (el método de Hunayn: juntar versiones para fijar el texto): la revisión por el sentido de una literal
  // vale casi una traducción entera (la literal más su revisión suman 3,2), así que lo literal rinde más por hora de mesa
  // y lo hecho por el sentido rinde más por manuscrito. Revisar palabra por palabra apenas suma.
  const base = METODOS_BA[metodo].valor * (OBRAS_BA[m.o].g === 'mat' && algebraLista() ? 1.5 : 1);
  return m.rev ? (metodo === 'sentido' ? base - 0.2 : 0.3) : base;
}
function duracionMetodo(m, metodo) { const d = METODOS_BA[metodo].dur * (1 - 0.1 * nivelTec(47)); return m.rev && S.hunayn === 2 ? d * 0.5 : d; }
function obraQueLlega() { // las caravanas no repiten: recorren las 16 obras en un orden salteado (7 y 16 no tienen divisor común)
  S.obraSig = (S.obraSig || 0) + 1;
  return (S.obraSig * 7 + 3) % OBRAS_BA.length;
}
function llegaCaravana(silencioso) { // una caravana entra por la puerta de Kufa y deja sus manuscritos
  const n = 1 + (Math.floor(S.tiempoJuego / 17) % 3 === 0 ? 1 : 0); let traidos = 0;
  S.caravana = { t0: S.tiempoJuego }; S.manuscritos = S.manuscritos || [];
  for (let k = 0; k < n && nuevosPend() < MANUSCRITOS_TOPE; k++) { S.manuscritos.push({ o: obraQueLlega() }); traidos++; }
  const siguen = mesaAbierta() ? n - traidos : 0;                   // la puerta llena: lo que no cabe sigue de largo (antes de la mesa, ni se cuenta)
  if (siguen) S.perdidosBa = (S.perdidosBa || 0) + siguen;
  if (silencioso || (!traidos && !siguen)) return;
  sfx.caravana();
  fx.pops.push({ x: ESPERA_BA.x, y: ESPERA_BA.y - 0.5, txt: siguen ? `🐪 la puerta está llena: ${siguen === 1 ? 'un manuscrito sigue' : siguen + ' manuscritos siguen'} de largo` : `🐪 ${traidos === 1 ? 'un manuscrito' : traidos + ' manuscritos'} en la puerta`, born: performance.now() });
  if (siguen && !S.vioPerdido) { S.vioPerdido = true; toast('🐪 <b>La puerta está llena.</b> La caravana no tiene dónde dejar lo que trae y sigue de largo, a otra ciudad. Dos traductores por el sentido no alcanzan a despachar todo lo que llega: <b>palabra por palabra</b> despeja la puerta (y lo que salga mal se revisa después), o se agranda la mesa.', 14000); }
  if (!S.vioCaravana) { S.vioCaravana = true; toast('🐪 <b>Una caravana en la puerta de Kufa.</b> Trae manuscritos de Bizancio, de Persia y de la India: en griego, en siríaco, en persa, en sánscrito. Esperan en la puerta a que alguien los traduzca.', 12000); }
}
function traducir(metodo) { // EL GESTO: el manuscrito de la puerta va a la mesa, palabra por palabra o por el sentido
  if (!puedeTraducir() || !METODOS_BA[metodo]) return null;
  const m = S.manuscritos.shift(), dur = duracionMetodo(m, metodo), O = OBRAS_BA[m.o];
  S.mesa = S.mesa || []; S.mesa.push({ o: m.o, rev: !!m.rev, metodo, t: dur, dur });
  sfx.calamo();
  fx.pops.push({ x: MESA_BA.x, y: MESA_BA.y - 0.6, txt: `✒️ ${O.a} · ${metodo === 'sentido' ? 'por el sentido' : 'palabra por palabra'}`, born: performance.now() });
  if (!S.vioTraducir) { S.vioTraducir = true; toast(metodo === 'sentido'
    ? `✒️ <b>Por el sentido.</b> El traductor lee la frase entera, la entiende y la vuelve a decir en árabe. Tarda, pero lo que sale entra al canon: vale más del doble. Terminada, se copia en 📜 papel y entra a la biblioteca.`
    : `✒️ <b>Palabra por palabra.</b> El traductor va término a término: rápido, y a veces sale un árabe que nadie entiende. Muchas traducciones así hubo que rehacerlas. Terminada, se copia en 📜 papel y entra a la biblioteca.`, 13000); }
  renderHUD(); guardar();
  return true;
}
function avanzarMesa(dt, silencioso) { // los traductores trabajan; lo terminado se copia en papel y entra a la biblioteca
  const mesa = S.mesa || [];
  for (const a of mesa) a.t = Math.max(0, a.t - dt);
  for (const a of mesa.filter(q => q.t <= 0)) {
    if ((S.mats.papel || 0) < 1) {                                 // sin papel no hay copia: espera en la mesa y ocupa su asiento
      if (!a.sinPapel && !silencioso) { a.sinPapel = true; fx.pops.push({ x: MESA_BA.x, y: MESA_BA.y - 0.5, txt: '📜 falta papel para la copia', born: performance.now() });
        if (!S.vioSinPapel) { S.vioSinPapel = true; toast('📜 <b>Falta papel.</b> La traducción está lista, pero sin papel no se copia, y sin copia no entra a la biblioteca: el traductor espera con su asiento ocupado. El molino del canal lo da: recoge sus luces.', 11000); } }
      continue;
    }
    S.mats.papel--; S.mesa = S.mesa.filter(q => q !== a);
    const v = valorObra(a, a.metodo), O = OBRAS_BA[a.o];
    S.bibValor = (S.bibValor || 0) + v; S.traducidas = (S.traducidas || 0) + 1;
    const b = Math.round(tasa() * 35 * v); S.apr += b; S.aprTotal += b;
    if (a.metodo === 'sentido') {
      S.sentidos = (S.sentidos || 0) + 1;
      if (S.hunayn === 2 && (S.taller || 0) < 2) { S.taller = (S.taller || 0) + 1; if (!silencioso) toast(`✒️ <b>El taller de Hunayn.</b> Un aprendiz tradujo a su lado y ya sabe: la mesa tiene <b>${asientosMesa()} asientos</b>. Traducir se aprende traduciendo.`, 10000); }
    } else if (!a.rev) {
      S.literales = (S.literales || 0) + 1;
      if (S.literales % 2 === 1) (S.revisiones = S.revisiones || []).push({ o: a.o, t0: S.tiempoJuego });   // una de cada dos vuelve
    }
    if (!silencioso) {
      fx.pops.push({ x: CASA_BA.x, y: CASA_BA.y - 0.7, txt: `📚 ${O.ar} · +${fmt(b)} 📖`, born: performance.now() });
      fx.anillos.push({ born: performance.now(), x: CASA_BA.x, y: CASA_BA.y });
      sfx.desenrollar();
    }
  }
  for (const r of [...(S.revisiones || [])]) {                     // lo literal vuelve a la puerta: hay que revisarlo
    if (S.tiempoJuego - r.t0 < REVISION_VUELVE) continue;
    S.revisiones = S.revisiones.filter(q => q !== r); S.manuscritos.push({ o: r.o, rev: true });
    if (!silencioso && !S.vioRevision) { S.vioRevision = true; toast(`🔁 <b>Hay que revisarla.</b> ${OBRAS_BA[r.o].a}, traducido palabra por palabra, no se entiende en árabe: vuelve a la puerta. Revisarlo por el sentido le da lo que le faltaba.`, 12000); }
  }
}
function ijazaDisponible() { return halqaAbierta() && !!S.ijazaPend; }
function darIjaza() { // un estudiante leyó el libro entero con su maestro: el permiso escrito de enseñarlo
  if (!ijazaDisponible()) return;
  S.ijazaPend = false; S.ijazaT = 0;
  const nuevo = (S.muidin || 0) < MUIDIN_TOPE; if (nuevo) S.muidin = (S.muidin || 0) + 1;
  S.rep++; const b = Math.round(tasa() * (25 + 10 * nivelTec(48))); S.apr += b; S.aprTotal += b;
  fx.pops.push({ x: HALQA_BA.x, y: HALQA_BA.y - 0.6, txt: nuevo ? `🕌 la ijaza · un repetidor más · ⭐ +1` : `🕌 la ijaza · +${fmt(b)} 📖 · ⭐ +1`, born: performance.now() });
  fx.anillos.push({ born: performance.now(), x: HALQA_BA.x, y: HALQA_BA.y });
  sfx.ijaza();
  if (!S.vioIjaza) { S.vioIjaza = true; toast('🕌 <b>La ijaza.</b> El maestro escribe en el libro: «lo leyó conmigo de principio a fin, y puede enseñarlo». Con su permiso, el estudiante se vuelve <b>repetidor</b>: repasa la lección con 4 que aprendían a medias. El saber pasa de persona a persona, y la cadena queda escrita.', 14000); }
  renderHUD(); guardar();
}
function herenciaDisponible() { return algebraLista() && S.era === 6 && !!S.herenciaPend; }
function resolverHerencia() { // una vez por estación: el reparto del cadí, con el método de al-Juarismi
  if (!herenciaDisponible()) return;
  S.herenciaPend = false; S.herencias = (S.herencias || 0) + 1;
  const pago = Math.round((1100 + 350 * nivelTec(49)) * (1 + 0.04 * S.rep)); S.pre += pago;
  const b = Math.round(tasa() * (60 + 20 * nivelTec(49))); S.apr += b; S.aprTotal += b;
  if (S.herencias % 2 === 0) S.rep++;
  fx.pops.push({ x: CADI_BA.x, y: CADI_BA.y - 0.6, txt: `⚖️ el reparto cuadra · +${fmt(pago)} ${monIco()}`, born: performance.now() });
  fx.anillos.push({ born: performance.now(), x: CADI_BA.x, y: CADI_BA.y });
  sfx.herencia();
  if (!S.vioHerencia) { S.vioHerencia = true; toast('⚖️ <b>Un reparto de herencia.</b> «Un hombre muere y deja a su madre, a su mujer y a dos hijos, y una deuda…»: al-Juarismi dedica más de la mitad de su libro a problemas así. Se llama «cosa» a lo que no se sabe, se plantea, se <b>restaura</b> (al-jabr) y se <b>equilibra</b> (al-muqabala). El reparto cuadra y el zoco paga.', 15000); }
  renderHUD(); guardar();
}
/* ---------- TENOCHTITLAN (era7-plan): la promesa, las escuelas, el tequio, los códices, el canto y la palabra ----------
   LA PROMESA (con el telpochcalli): nace un niño en un barrio y sus padres, con la partera, lo presentan a una escuela (en la
   puerta de la partera esperan hasta 3; con 3 esperando no nace otro hasta que se presente). AL TELPOCHCALLI: sin cupo;
   sale en 70 s y trabaja para el barrio (el TEQUIO: renta de 🏺, como los libreros de Bagdad). AL CALMÉCAC (con el
   calmécac): 3 lugares (4 con la etapa 3) y un pliego de amate cada uno; sale en 90 s y pinta códices (cada CÓDICE sube lo
   que aprende la ciudad, tope +30 %). NADIE SE QUEDA SIN ESCUELA: con el telpochcalli, todos los que aprenden están
   atendidos (la escuela obligatoria, la lección de la época). LA CUENTA DE LOS DÍAS: cada recién nacido trae su signo, que
   inclina a una escuela; si se le hace caso, aprende más rápido y rinde el doble. EL CANTO (con la cuicacalli): una vez por día,
   de la tarde a la noche, los jóvenes cantan; paga saber, los que estudian avanzan 10 s en su escuela y la noche que sigue se
   aprende más. LA PALABRA (con los huehuetlatolli): una vez
   por estación, el anciano habla a los jóvenes. NEZAHUALCÓYOTL, la flor y el canto: cada canto pinta un códice, y un
   egresado del telpochcalli que cantó puede pasar al calmécac (la excepción que cuentan las fuentes). */
const NACE_CADA = 34, NACIDOS_TOPE = 3, CICLO_TELPO = 70, CICLO_CALME = 90, CANTO_DIA = 150;
function telpoAbierto() { return S.era === 7 && S.tecs[52] && S.tecs[52].fase === 'meseta'; }
function calmecacAbierto() { return S.era === 7 && S.tecs[53] && S.tecs[53].fase === 'meseta'; }
function cuicacalliAbierta() { return S.era === 7 && S.tecs[54] && S.tecs[54].fase === 'meseta'; }
function cuentaDias() { return S.era === 7 && S.tecs[55] && S.tecs[55].fase === 'meseta'; }
function palabraAbierta() { return S.era === 7 && S.tecs[56] && S.tecs[56].fase === 'meseta'; }
function nacidosPend() { return (S.nacidos || []).length; }
function plazasCalmecac() { return calmecacAbierto() ? 3 + (nivelTec(53) >= 3 ? 1 : 0) : 0; }
function calmecacLibre() { return calmecacAbierto() && (S.calme || []).length < plazasCalmecac(); }
function puedePresentar(esc) { return nacidosPend() > 0 && (esc === 'telpochcalli' ? telpoAbierto() : calmecacLibre() && (S.mats.amate || 0) >= 1); }
function tequioTope() { return 8 + 3 * nivelTec(52); }                                // el barrio tiene las chinampas que tiene: 8 trabajadores, 3 más por etapa (17 perfeccionado)
function codiceBono() { return 1 + Math.min(0.30, (S.codices || 0) * 0.03); }       // los códices pintados: lo que aprende la ciudad (tope +30 %, diez códices)
function escuelaParaTodos() { return S.era === 7 && telpoAbierto(); }                 // nadie se queda sin escuela
function signoDe(k) { return SIGNOS_TE[(k * 7 + 4) % SIGNOS_TE.length]; }            // los días no se repiten seguidos: 7 y 20 no tienen divisor común
function nace(silencioso) { // nace un niño en uno de los barrios: espera en la puerta de la partera a que lo presenten
  S.ninoSig = (S.ninoSig || 0) + 1;
  const k = S.ninoSig, nino = NINOS_TE[(k * 5) % NINOS_TE.length];
  (S.nacidos = S.nacidos || []).push({ n: nino.n, g: nino.g, k, s: (k * 7 + 4) % SIGNOS_TE.length, h: k % HOGARES_TE.length, t0: S.tiempoJuego });
  if (silencioso) return;
  sfx.nace();
  fx.pops.push({ x: PARTERA_TE.x, y: PARTERA_TE.y - 0.6, txt: `👶 nació ${nino.n}`, born: performance.now() });
  if (!S.vioNace) { S.vioNace = true; toast(`👶 <b>Nació ${nino.n}.</b> En Tenochtitlan, al nacer un niño la partera le habla («has venido a la tierra, ${nino.g === 'a' ? 'hija mía' : 'hijo mío'}…») y sus padres lo prometen a una escuela. Todos iban a la escuela. Tócalo en la casa de la partera y elige a cuál.`, 14000); }
}
function presentar(esc) { // EL GESTO: el recién nacido es prometido al telpochcalli o al calmécac
  if (!puedePresentar(esc)) return null;
  const c = S.nacidos.shift(), sig = SIGNOS_TE[c.s], bien = cuentaDias() && sig.e === (esc === 'calmecac' ? 'c' : 't');
  const rapido = bien ? 0.7 : 1;                                   // su camino era ese: aprende más rápido
  if (esc === 'calmecac') { S.mats.amate--; (S.calme = S.calme || []).push({ n: c.n, t: CICLO_CALME * (1 - 0.08 * nivelTec(53)) * rapido, dur: CICLO_CALME, bien }); }
  else (S.telpo = S.telpo || []).push({ n: c.n, t: CICLO_TELPO * (1 - 0.08 * nivelTec(52)) * rapido, dur: CICLO_TELPO, bien });
  S.alumnos++; S.promesas = (S.promesas || 0) + 1; if (bien) S.signoBien = (S.signoBien || 0) + 1;
  sfx.promesa();
  const L = esc === 'calmecac' ? CALMECAC_TE : TELPO_TE;
  fx.pops.push({ x: L.x, y: L.y - 0.7, txt: `${esc === 'calmecac' ? '🔥' : '🛖'} ${c.n}${bien ? ' · ' + sig.ic + ' buen signo' : ''}`, born: performance.now() });
  if (!S.vioPromesa) { S.vioPromesa = true; toast(esc === 'calmecac'
    ? `🔥 <b>Al calmécac.</b> ${c.n} irá a la casa del linaje, junto al templo: aprenderá los cantos, la cuenta de los días y a leer los códices. Pocos lugares, y cada uno pide un pliego de amate. Cuando salga, pintará códices.`
    : `🛖 <b>Al telpochcalli.</b> ${c.n} irá a la casa de los jóvenes de su barrio: aprenderá a trabajar y a servir a la ciudad. Es de todos: no tiene cupo. Cuando salga, trabajará para el barrio (el tequio).`, 13000); }
  if (bien && !S.vioSigno) { S.vioSigno = true; toast(`${sig.ic} <b>Buen signo.</b> ${c.n} nació en un día ${sig.n} (${sig.es}), y el libro de los días dice que su camino es ${esc === 'calmecac' ? 'el de la palabra y los libros' : 'el del trabajo y la guerra'}: rendirá el doble.`, 12000); }
  renderHUD(); guardar();
  return true;
}
function avanzarEscuelas(dt, silencioso) { // los que estudian crecen; los que terminan, salen a servir al barrio o a pintar códices
  for (const [lista, esc] of [[S.telpo || [], 'telpochcalli'], [S.calme || [], 'calmecac']]) {
    for (const a of lista) a.t -= dt;
    for (const a of lista.filter(q => q.t <= 0)) {
      if (esc === 'telpochcalli') { S.telpo = S.telpo.filter(q => q !== a); S.egresTelpo = (S.egresTelpo || 0) + (a.bien ? 2 : 1); }
      else { S.calme = S.calme.filter(q => q !== a); S.egresCalme = (S.egresCalme || 0) + 1; S.codices = (S.codices || 0) + (a.bien ? 2 : 1);
        const b = Math.round(tasa() * 40 * (a.bien ? 2 : 1)); S.apr += b; S.aprTotal += b; }
      S.alumnos = Math.max(0, S.alumnos - 1);
      if (palabraAbierta()) S.rep++;                                // se despiden con la palabra de los viejos
      if (silencioso) continue;
      const L = esc === 'calmecac' ? CALMECAC_TE : TELPO_TE;
      fx.pops.push({ x: L.x, y: L.y - 0.8, txt: esc === 'calmecac' ? `📜 ${a.n} pinta su primer códice` : `🌽 ${a.n} sale a trabajar para el barrio`, born: performance.now() });
      if (!S.vioEgreso && esc === 'telpochcalli') { S.vioEgreso = true; toast(`🌽 <b>${a.n} sale del telpochcalli.</b> Ya sabe trabajar la chinampa, limpiar los canales y servir a la ciudad: desde hoy hace su parte del tequio, el trabajo común del barrio, y eso trae recursos.`, 12000); }
      if (!S.vioCodice && esc === 'calmecac') { S.vioCodice = true; toast(`📜 <b>${a.n} sale del calmécac y pinta su primer códice.</b> In tlilli in tlapalli, «la tinta negra, la tinta roja»: así decían los nahuas para decir sabiduría. Cada códice sube lo que aprende toda la ciudad, y los registros pintados llevan la cuenta del tributo: llega más en cada estación.`, 13000); }
    }
  }
}
function diaCanto() { return Math.floor(S.tiempoJuego / CANTO_DIA); }
function cantoDisponible() { return cuicacalliAbierta() && luzDia() < 0.55 && S.cantoDia !== diaCanto(); }
function cantoBono() { return S.era === 7 && S.cantoNoche === diaCanto() && luzDia() < 0.5 ? 1.12 : 1; }   // la noche que sigue al canto se aprende más
function cantar() { // el canto de la tarde en la cuicacalli
  if (!cantoDisponible()) return;
  S.cantoDia = diaCanto(); S.cantoNoche = diaCanto(); S.cantos = (S.cantos || 0) + 1;
  const n = (S.telpo || []).length + (S.calme || []).length;
  const b = Math.round(tasa() * (25 + 3 * n) * (1 + 0.25 * nivelTec(54))); S.apr += b; S.aprTotal += b;
  const avance = 10 * (1 + 0.25 * nivelTec(54));                 // lo que se canta no se olvida: los que estudian avanzan
  for (const a of [...(S.telpo || []), ...(S.calme || [])]) a.t -= avance;
  let pasa = '';
  if (S.neza === 2) {                                             // la flor y el canto: el canto también pinta
    S.codices = (S.codices || 0) + 1;
    if ((S.egresTelpo || 0) > 0 && calmecacLibre()) { S.egresTelpo--; S.egresCalme = (S.egresCalme || 0) + 1; S.codices += 1; pasa = ' · un joven del telpochcalli pasa al calmécac'; }
  }
  fx.pops.push({ x: CUICACALLI_TE.x, y: CUICACALLI_TE.y - 0.7, txt: `🥁 el canto de la tarde · +${fmt(b)} 📖${pasa}`, born: performance.now() });
  fx.anillos.push({ born: performance.now(), x: CUICACALLI_TE.x, y: CUICACALLI_TE.y });
  sfx.canto();
  if (!S.vioCanto) { S.vioCanto = true; toast('🥁 <b>El canto de la tarde.</b> Los muchachos y las muchachas de la ciudad van a la casa del canto: el huéhuetl marca el paso y aprenden los cantos de memoria. Lo que se canta no se olvida: los que estudian avanzan en su escuela, y esta noche se aprende más.', 13000); }
  renderHUD(); guardar();
}
function palabraDisponible() { return palabraAbierta() && !!S.palabraPend; }
function decirPalabra() { // una vez por estación, el anciano dice la palabra antigua a los jóvenes
  if (!palabraDisponible()) return;
  S.palabraPend = false; S.palabras = (S.palabras || 0) + 1; S.rep += 2;
  S.animo = Math.min(animoMax(), S.animo + 12);
  const b = Math.round(tasa() * (60 + 20 * nivelTec(56))); S.apr += b; S.aprTotal += b;
  fx.pops.push({ x: PALABRA_TE.x, y: PALABRA_TE.y - 0.7, txt: `🗣️ la palabra antigua · ⭐ +2`, born: performance.now() });
  fx.anillos.push({ born: performance.now(), x: PALABRA_TE.x, y: PALABRA_TE.y });
  sfx.historia();
  if (!S.vioPalabra) { S.vioPalabra = true; toast('🗣️ <b>La palabra antigua.</b> «Aquí estás, hijo mío, collar mío, pluma preciosa: escucha…». El anciano habla a los jóvenes de cómo se vive bien en la tierra. Se enseñaba hablando, y la palabra se aprendía de memoria.', 14000); }
  renderHUD(); guardar();
}
/* ---------- PARÍS (era8-plan): la campana y el horario, la copia, las cuestiones, la licencia ----------
   LA CAMPANA (con las horas): el día del juego se parte en cuatro tiempos (la mañana, el mediodía, la tarde, la noche) y
   EL HORARIO (el gesto) dice qué se hace en cada uno: LEER (lo que aprende la ciudad sube mientras dura), COPIAR (con el
   scriptorium: cada tanto un libro, que gasta un pergamino; los libros suben lo que aprende la ciudad y los estacionarios
   pagan por alquilarlos), DISPUTAR (con la disputatio: se resuelven las cuestiones que llegan, renombre y el pago de los
   estudiantes) o DESCANSAR (el ánimo). Cada tiempo de trabajo cansa (de noche, más) y el descanso repone: un horario de
   una sola cosa rinde menos. LA LICENCIA (con la universidad): cada tanto un bachiller espera su licencia; dársela lo
   vuelve maestro (atiende a 5 que aprendían a medias). LA SORBONA: techo para estudiantes pobres y la biblioteca
   encadenada. ABELARDO, sic et non: disputar enseña dos veces (cuenta como leer, y cada cuestión paga el doble de saber). */
const DIA_PA = 150, COPIA_CADA = 9, CUESTION_CADA = 40, CUESTIONES_TOPE = 3, DISPUTA_CADA = 7, LICENCIA_CADA = 40, LICENCIADOS_TOPE = 6;
function campanaAbierta() { return S.era === 8 && S.tecs[58] && S.tecs[58].fase === 'meseta'; }
function scriptoriumAbierto() { return S.era === 8 && S.tecs[59] && S.tecs[59].fase === 'meseta'; }
function disputaAbierta() { return S.era === 8 && S.tecs[60] && S.tecs[60].fase === 'meseta'; }
function universidadAbierta() { return S.era === 8 && S.tecs[61] && S.tecs[61].fase === 'meseta'; }
function sorbonaLista() { return ordEra(S.era) >= ordEra(8) && S.tecs[62] && S.tecs[62].fase === 'meseta'; }
function tiempoPa() { const f = (S.tiempoJuego % DIA_PA) / DIA_PA; return f >= 0.75 ? 0 : f >= 0.5 ? 3 : f >= 0.25 ? 2 : 1; }   // 0 la mañana · 1 el mediodía · 2 la tarde · 3 la noche
function tareaAhora() { return campanaAbierta() && S.horario ? S.horario[tiempoPa()] : null; }
function tareaPosible(t) { return t === 'leer' || t === 'descansar' || (t === 'copiar' && scriptoriumAbierto()) || (t === 'disputar' && disputaAbierta()); }
function lecturaBono() { const t = tareaAhora(); return t === 'leer' || (t === 'disputar' && S.abelardo === 2) ? 1.3 + 0.1 * nivelTec(58) : 1; }   // mientras se lee, la ciudad aprende más
function licenciaBono() { return S.era === 8 ? 1 + 0.04 * Math.min(LICENCIADOS_TOPE, S.licenciados || 0) : 1; }   // cada licenciado abre su escuela: la ciudad aprende más
function librosBono() { return 1 + Math.min(sorbonaLista() ? 0.45 : 0.30, (S.libros || 0) * 0.02); }                   // los libros copiados (tope +30 %; +45 % con la biblioteca de la Sorbona)
function cuestionesPend() { return (S.cuestiones || []).length; }
function fijarHorario(h) { // EL GESTO: lo que se hace en cada tiempo del día
  if (!campanaAbierta() || !Array.isArray(h) || h.length !== 4 || !h.every(tareaPosible)) return false;
  const antes = (S.horario || []).join(',');
  S.horario = h.slice();
  if (antes !== S.horario.join(',')) {
    sfx.campanaPa();
    if (!S.vioHorario) { S.vioHorario = true; toast('🔔 <b>El horario.</b> La campana va a tocar al empezar cada tiempo, y todos irán a su tarea. Un horario de una sola cosa cansa (o no avanza): leer, copiar, disputar y descansar se reparten el día. Lo puedes cambiar cuando quieras tocando la campana.', 14000); }
  }
  renderHUD(); guardar();
  return true;
}
function tocarCampana(silencioso) { // al empezar cada tiempo, la campana llama a su tarea
  const t = tareaAhora(); if (!t || silencioso) return;
  sfx.campanaPa();
  const T = TIEMPOS_PA[tiempoPa()], A = TAREAS_PA[t];
  fx.pops.push({ x: CAMPANA_PA.x, y: CAMPANA_PA.y - 0.9, txt: `🔔 ${T.hora} · ${A.ic} ${A.n}`, born: performance.now() });
  if (!S.vioCampana) { S.vioCampana = true; toast(`🔔 <b>Toca ${T.hora}.</b> La campana de la abadía parte el día en horas fijas, y cada hora tiene su tarea: ahora, ${A.dice}. Así nace el horario de la escuela.`, 13000); }
}
function avanzarHorario(dt, silencioso) {
  const k = tiempoPa();
  if (S.tiempoPa !== k) {
    if ((S.collectaAcum || 0) >= 1 && !silencioso) fx.pops.push({ x: FOUARRE_PA.x, y: FOUARRE_PA.y - 0.6, txt: `📖 la collecta de la lección · +${fmt(Math.round(S.collectaAcum))} ${monIco()}`, born: performance.now() });
    S.collectaAcum = 0; S.tiempoPa = k; tocarCampana(silencioso);
  }
  const t = tareaAhora(); if (!t) return;
  /* EL CANSANCIO: cada tiempo de trabajo cansa (de noche, el doble); descansar repone */
  const noche = k === 3, max = animoMax();
  if (t === 'descansar') S.animo = Math.min(max, S.animo + 3.0 * dt);
  else { S.animo = Math.max(BALANCE.animo.min || 30, S.animo - (noche ? 2.0 : 1.0) * (estacion().i === 3 && noche ? 1.25 : 1) * dt);   // un tiempo de descanso por día repone lo de tres de trabajo; sin descanso, se cae en menos de un día   // de noche cansa el doble (y en invierno, con las velas largas, más)
    if (S.animo < max * 0.6 && !S.vioCansancio && !silencioso) { S.vioCansancio = true; toast('🥱 <b>Cansancio.</b> Las escuelas trabajan sin descanso y el ánimo baja: se aprende peor. Pon un tiempo de descansar en el horario (la noche es el mejor): toca la campana.', 12000); } }
  /* LEER: los estudiantes pagan al maestro cada lección (la collecta); cansados, todo rinde menos */
  const rinde = multAnimo();
  if (t === 'leer') { const c = S.alumnos * (0.055 + 0.0055 * S.rep) * rinde * dt; S.pre += c; S.collectaAcum = (S.collectaAcum || 0) + c; }
  /* COPIAR: cada tanto un libro, si hay pergamino */
  if (t === 'copiar' && scriptoriumAbierto()) {
    S.copiaT = (S.copiaT || 0) + dt * rinde;
    const cada = COPIA_CADA / (1 + 0.15 * nivelTec(59));
    while (S.copiaT >= cada) {
      S.copiaT -= cada;
      if ((S.mats.pergamino || 0) < 1) { if (!silencioso) fx.pops.push({ x: ABADIA_PA.x, y: ABADIA_PA.y - 0.8, txt: '🐑 falta pergamino', born: performance.now() }); break; }
      S.mats.pergamino--; S.libros = (S.libros || 0) + 1;
      const b = Math.round(tasa() * 20); S.apr += b; S.aprTotal += b;
      if (!silencioso) { fx.pops.push({ x: ABADIA_PA.x, y: ABADIA_PA.y - 0.8, txt: `✒️ un libro copiado · +${fmt(b)} 📖`, born: performance.now() }); sfx.calamo(); }
      if (!S.vioCopia && !silencioso) { S.vioCopia = true; toast('✒️ <b>Un libro copiado.</b> En el scriptorium de San Víctor se copia en silencio, cada uno en su atril. Cada libro sube lo que aprende la ciudad, y los estacionarios lo alquilan por cuadernos (la pecia) a los estudiantes: eso paga.', 13000); }
    }
  }
  /* DISPUTAR: se resuelven las cuestiones que esperan */
  if (t === 'disputar' && disputaAbierta() && cuestionesPend()) {
    S.disputaT = (S.disputaT || 0) + dt;
    while (S.disputaT >= DISPUTA_CADA && cuestionesPend()) {
      S.disputaT -= DISPUTA_CADA;
      const q = S.cuestiones.shift(); S.resueltas = (S.resueltas || 0) + 1; S.rep++;
      const b = Math.round(tasa() * 40 * (S.abelardo === 2 ? 2 : 1)); S.apr += b; S.aprTotal += b;
      const pago = Math.round((100 + 12 * S.rep) * (1 + 0.1 * nivelTec(60)) * rinde); S.pre += pago;
      if (!silencioso) { fx.pops.push({ x: MONTANA_PA.x, y: MONTANA_PA.y - 0.8, txt: `⚖️ cuestión resuelta · ⭐ +1 · +${fmt(pago)} ${monIco()}`, born: performance.now() }); sfx.disputa(); }
      if (!S.vioCuestion && !silencioso) { S.vioCuestion = true; toast(`⚖️ <b>Se disputó: «${CUESTIONES_PA[q % CUESTIONES_PA.length]}»</b> Los argumentos a favor, los en contra, y el maestro determina. Los estudiantes pagan por oír una buena disputa: renombre y recursos.`, 14000); }
    }
  }
}
function llegaCuestion(silencioso) { // de vez en cuando, una cuestión discutida espera su disputa
  if (!disputaAbierta() || cuestionesPend() >= CUESTIONES_TOPE) return;
  S.cuestionSig = (S.cuestionSig || 0) + 1; (S.cuestiones = S.cuestiones || []).push(S.cuestionSig);
  if (!silencioso) fx.pops.push({ x: MONTANA_PA.x, y: MONTANA_PA.y - 0.6, txt: `❓ ${CUESTIONES_PA[S.cuestionSig % CUESTIONES_PA.length]}`, born: performance.now() });
}
function licenciaDisponible() { return universidadAbierta() && !!S.licenciaPend; }
function darLicencia() { // el bachiller que aprobó recibe la licencia para enseñar: abre su escuela
  if (!licenciaDisponible()) return;
  S.licenciaPend = false; S.licenciaT = 0;
  const nuevo = (S.licenciados || 0) < LICENCIADOS_TOPE; if (nuevo) S.licenciados = (S.licenciados || 0) + 1;
  S.rep++; const b = Math.round(tasa() * (30 + 10 * nivelTec(61))); S.apr += b; S.aprTotal += b;
  const tasaLic = Math.round(200 + 30 * S.rep); S.pre += tasaLic;   // los derechos de la licencia: el nuevo maestro paga a la universidad (y el banquete a sus colegas)
  fx.pops.push({ x: UNIVERSIDAD_PA.x, y: UNIVERSIDAD_PA.y - 0.7, txt: nuevo ? `🎓 la licencia · un maestro más · +${fmt(tasaLic)} ${monIco()}` : `🎓 la licencia · +${fmt(tasaLic)} ${monIco()} · ⭐ +1`, born: performance.now() });
  fx.anillos.push({ born: performance.now(), x: UNIVERSIDAD_PA.x, y: UNIVERSIDAD_PA.y });
  sfx.sello();
  if (!S.vioLicencia) { S.vioLicencia = true; toast('🎓 <b>La licencia para enseñar.</b> El bachiller que aprobó su examen recibe la licentia docendi y se vuelve maestro: puede abrir su propia escuela en París y atiende a 5 que aprendían a medias. La universidad da la licencia ella misma, con su sello.', 14000); }
  renderHUD(); guardar();
}
/* ============================================================
   ÁMSTERDAM (era9-plan): LA PRENSA. Se compone una forma (tarda, con la prensa quieta) y, una vez armada, cada tirada sale
   sola mientras siga en la prensa: gasta un pliego, se vende según la demanda (cae con cada tirada de lo mismo y vuelve
   sola, despacio), hace lectores (las cartillas) y deja saber y renombre. Lo contrario del scriptorium: se compone una
   vez y se multiplica.
   ============================================================ */
const TIRADA_CADA = 8, DEMANDA_VUELVE = 0.005;
function prensaAbierta() { return S.era === 9 && S.tecs[64] && S.tecs[64].fase === 'meseta'; }
function obraAbierta(o) { const O = OBRAS_AM[o]; return !!O && S.era === 9 && S.tecs[O.pide] && S.tecs[O.pide].fase === 'meseta'; }
function didacticaLista() { return S.era === 9 && S.tecs[67] && S.tecs[67].fase === 'meseta'; }
function orbisListo() { return S.era === 9 && S.tecs[68] && S.tecs[68].fase === 'meseta'; }
function compTiempo(o) { return OBRAS_AM[o].comp * (1 - 0.12 * nivelTec(64)); }
function tiradaCada() { return TIRADA_CADA * (1 - 0.08 * nivelTec(64)); }
function lectoresBono() { return S.era === 9 ? 1 + Math.min(orbisListo() ? 0.45 : 0.30, (S.lectores || 0) * 0.005) : 1; }   // los lectores: la ciudad aprende más (tope +30 %; +45 % con el Orbis Pictus)
function aulaAtiende() { return (didacticaLista() ? 8 : 0) + (S.comenio === 2 ? Math.min(40, Math.floor((S.lectores || 0) / 3)) : 0); }   // la clase simultánea; con Comenio, cada tres lectores atienden a uno que aprendía a medias
function caeDemanda(o) { return OBRAS_AM[o].cae * (o === 'cartilla' && S.comenio === 2 ? 0.4 : 1); }   // con Comenio, siempre hay niños nuevos: el mercado de cartillas casi no se llena
function componer(o) { // EL GESTO: se arma una forma nueva (la vieja se desarma: sus letras vuelven a la caja)
  if (!prensaAbierta() || !obraAbierta(o) || (S.forma && S.forma.o === o)) return false;
  S.forma = { o, fase: 'componer', t: 0, tiradas: 0 };
  sfx.componer();
  fx.pops.push({ x: PRENSA_AM.x, y: PRENSA_AM.y - 0.7, txt: `🔠 se compone ${OBRAS_AM[o].n}`, born: performance.now() });
  if (!S.vioForma) { S.vioForma = true; toast(`🔠 <b>Se compone ${OBRAS_AM[o].n}.</b> El cajista arma la forma letra por letra (la prensa espera ${Math.round(compTiempo(o))} s). Una vez armada, cada tirada sale sola, mientras la forma siga en la prensa: gasta un pliego y se vende. Puedes componer otra cosa cuando quieras, tocando la imprenta.`, 15000); }
  renderHUD(); guardar(); return true;
}
function avanzarPrensa(dt, silencioso) {
  for (const k of Object.keys(OBRAS_AM)) S.demanda[k] = Math.min(1, (S.demanda[k] ?? 1) + DEMANDA_VUELVE * dt);   // la demanda vuelve sola
  const F = S.forma; if (!F || !prensaAbierta()) return;
  const O = OBRAS_AM[F.o];
  if (F.fase === 'componer') {
    F.t += dt;
    if (F.t >= compTiempo(F.o)) { F.fase = 'tirar'; F.t = 0; if (!silencioso) { sfx.prensa(); fx.pops.push({ x: PRENSA_AM.x, y: PRENSA_AM.y - 0.7, txt: `🖨️ la forma está lista: ${O.ic} empieza la tirada`, born: performance.now() }); } }
    return;
  }
  F.t += dt;
  while (F.t >= tiradaCada()) {
    F.t -= tiradaCada();
    if ((S.mats.pliego || 0) < 1) {
      F.t = 0;
      if (!F.sinPapel && !silencioso) { F.sinPapel = true; fx.pops.push({ x: PRENSA_AM.x, y: PRENSA_AM.y - 0.7, txt: '📄 falta papel', born: performance.now() }); }
      if (!S.vioPapel && !silencioso) { S.vioPapel = true; toast('📄 <b>La prensa se quedó sin papel.</b> Cada tirada gasta un pliego. El molino de papel, sobre el bastión de la muralla, muele los trapos y deja pliegos: recoge sus luces.', 12000); }
      break;
    }
    F.sinPapel = false; S.mats.pliego--;
    const d = S.demanda[F.o] ?? 1, pago = Math.round((O.pago[0] + O.pago[1] * S.rep) * d);
    S.pre += pago; S.demanda[F.o] = Math.max(0, d - caeDemanda(F.o));
    const lec = O.lectores * (F.o === 'cartilla' && didacticaLista() ? 1.5 : 1); S.lectores = (S.lectores || 0) + lec;
    const b = Math.round(tasa() * O.saber); S.apr += b; S.aprTotal += b;
    if (O.rep) { S.repFrac = (S.repFrac || 0) + O.rep; while (S.repFrac >= 1) { S.repFrac -= 1; S.rep++; } }
    if (F.o === 'mapa') S.mapas = (S.mapas || 0) + 1;
    S.tiradas = (S.tiradas || 0) + 1; S.tiradasDe[F.o] = (S.tiradasDe[F.o] || 0) + 1; F.tiradas++;
    if (!silencioso) {
      fx.pops.push({ x: PRENSA_AM.x, y: PRENSA_AM.y - 0.6, txt: `${O.ic} una tirada · +${fmt(pago)} ${monIco()}${lec ? ` · 👓 +${lec}` : ''}`, born: performance.now() }); sfx.prensa();
      if (!S.vioTirada) { S.vioTirada = true; toast(`🖨️ <b>La primera tirada.</b> Cientos de pliegos iguales, en una tarde: lo que en París tomaba meses a un copista. Se venden en las librerías de la Kalverstraat${O.lectores ? ' y hacen lectores' : ''}. Cada tirada de lo mismo se vende un poco peor: el mercado se llena.`, 14000); }
      if (d < 0.3 && !S.vioLlena) { S.vioLlena = true; toast(`📉 <b>El mercado se llena.</b> Ya casi nadie compra ${O.n}: todos los que lo querían ya lo tienen. La demanda vuelve sola, despacio. Compón otra cosa (toca la imprenta) y vuelve a esto más tarde. Plantin casi quiebra con su Biblia políglota: imprimir era un negocio.`, 15000); }
      if (S.lectores >= 20 && !S.vioLectores) { S.vioLectores = true; toast('👓 <b>Lectores.</b> Cada tirada de cartillas hace lectores en las escuelas de barrio, niños y niñas, y los lectores suben lo que aprende la ciudad. La República tenía la alfabetización más alta de su tiempo.', 14000); }
    }
  }
}
/* ============================================================
   SANTIAGO (era10-plan): LOS NORMALISTAS Y EL MAPA. La Escuela Normal forma preceptores que egresan cada tanto; cada uno
   se manda a un pueblo (el gesto, en el modal #mapa), viaja lo que tarda el camino y funda su escuela, que desde entonces
   hace lectores (la ciudad aprende más) y paga cada tanto lo que ponen el pueblo y el Estado. Una escuela abierta temprano
   rinde más tiempo.
   ============================================================ */
const NORMAL_CADA = 70, NORMALISTAS_TOPE = 3, RENTA_ESC_CADA = 12;
function lancasterAbierta() { return S.era === 10 && S.tecs[69] && S.tecs[69].fase === 'meseta'; }
function normalAbierta() { return S.era === 10 && S.tecs[70] && S.tecs[70].fase === 'meseta'; }
function silabarioListo() { return S.era === 10 && S.tecs[71] && S.tecs[71].fase === 'meseta'; }
function preceptorasListas() { return S.era === 10 && S.tecs[72] && S.tecs[72].fase === 'meseta'; }
function leyLista() { return S.era === 10 && S.tecs[73] && S.tecs[73].fase === 'meseta'; }
function kinderListo() { return S.era === 10 && S.tecs[74] && S.tecs[74].fase === 'meseta'; }
function monitoresSa() { return lancasterAbierta() ? 1 + nivelTec(69) : 0; }
function escuelasAbiertas() { return Object.values(S.escuelasSa || {}).reduce((a, e) => a + (e.n || 0), 0); }
function cuposPueblo() { return preceptorasListas() ? 2 : 1; }
function ocupadosPueblo(i) { return ((S.escuelasSa || {})[i] ? S.escuelasSa[i].n : 0) + (S.viajes || []).filter(v => v.p === i).length; }
function puedeMandar(i) { return normalAbierta() && (S.normalistas || 0) > 0 && (S.mats.pizarra || 0) >= 1 && ocupadosPueblo(i) < cuposPueblo(); }
function viajeDur(i) { return PUEBLOS_SA[i].viaje * (1 - 0.1 * nivelTec(70)); }
function alfabetoBono() { return S.era === 10 ? 1 + Math.min(kinderListo() ? 0.45 : 0.30, (S.lectoresSa || 0) * 0.004) : 1; }   // los niños que aprenden a leer en los pueblos: la ciudad aprende más
function aulasSa() { return monitoresSa() * 10 + (S.sarmiento === 2 ? Math.min(40, escuelasAbiertas() * 3) : 0); }   // los monitores atienden a diez cada uno; con Sarmiento, cada escuela de pueblo forma a sus monitores
function mandar(i) { // EL GESTO: el normalista sale con su maleta y sus pizarras rumbo a su pueblo
  if (!puedeMandar(i)) return false;
  const P = PUEBLOS_SA[i], ninas = ocupadosPueblo(i) >= 1;
  S.normalistas--; S.mats.pizarra--; S.enviados = (S.enviados || 0) + 1;
  S.viajes.push({ p: i, t: 0, dur: viajeDur(i), ninas });
  sfx.diligencia();
  fx.pops.push({ x: NORMAL_SA.x, y: NORMAL_SA.y - 0.7, txt: `🎒 ${ninas ? 'una preceptora' : 'un normalista'} sale para ${P.n} · ${Math.round(viajeDur(i))} s de viaje`, born: performance.now() });
  if (!S.vioViaje) { S.vioViaje = true; toast(`🎒 <b>Sale para ${P.n}.</b> El normalista lleva su título, su silabario y sus pizarras; el viaje tarda (${Math.round(viajeDur(i))} s: días a caballo, en carreta o en barco). Cuando llegue, funda su escuela, y desde entonces sus niños aprenden a leer y el pueblo paga. Cuanto antes abre una escuela, más rinde.`, 15000); }
  renderHUD(); guardar(); return true;
}
function avanzarNormal(dt, silencioso) {
  if (normalAbierta() && (S.normalistas || 0) < NORMALISTAS_TOPE) {
    S.normalT = (S.normalT || 0) + dt;
    const cada = NORMAL_CADA * (1 - 0.05 * nivelTec(70)) * (S.sarmiento === 2 ? 0.85 : 1) * (preceptorasListas() ? 0.9 : 1);   // con las preceptoras egresan más seguido
    if (S.normalT >= cada) {
      S.normalT = 0; const n = 1; S.normalistas = Math.min(NORMALISTAS_TOPE, (S.normalistas || 0) + n);
      if (!silencioso) { fx.pops.push({ x: NORMAL_SA.x, y: NORMAL_SA.y - 0.6, txt: preceptorasListas() && (S.enviados || 0) % 2 ? '🎓 egresa una preceptora' : '🎓 egresa un normalista', born: performance.now() }); sfx.ijaza(); }
      if (!S.vioNormalista && !silencioso) { S.vioNormalista = true; toast('🎓 <b>Egresa un normalista.</b> Estudió en la Escuela Normal y ya puede fundar una escuela. Toca la Escuela Normal y elige su pueblo en el mapa: cerca abre rápido; grande y lejos rinde más, pero tarda.', 14000); }
    }
  }
  if ((S.viajes || []).length) {
    for (const v of S.viajes) v.t += dt;
    const llegan = S.viajes.filter(v => v.t >= v.dur); S.viajes = S.viajes.filter(v => v.t < v.dur);
    for (const v of llegan) {
      const e = S.escuelasSa[v.p] || (S.escuelasSa[v.p] = { n: 0, t0: S.tiempoJuego }); e.n++; S.rep++;
      const P = PUEBLOS_SA[v.p];
      if (!silencioso) { fx.pops.push({ x: NORMAL_SA.x, y: NORMAL_SA.y - 0.8, txt: `🏫 abre la escuela ${v.ninas ? 'de niñas ' : ''}de ${P.n} · ⭐ +1`, born: performance.now() }); sfx.logro(); }
      if (!S.vioEscuela && !silencioso) { S.vioEscuela = true; toast(`🏫 <b>Abre la escuela de ${P.n}.</b> ${P.dice[0].toUpperCase() + P.dice.slice(1)}. Desde hoy sus niños aprenden a leer (y los lectores suben lo que aprende la ciudad) y el pueblo paga su escuela, cada tanto.`, 14000); }
    }
  }
  for (const [i, e] of Object.entries(S.escuelasSa || {})) S.lectoresSa = (S.lectoresSa || 0) + PUEBLOS_SA[i].gente * e.n * 0.03 * (silabarioListo() ? 1.5 : 1) * (leyLista() ? 1.3 : 1) * dt;
  S.escRentaT = (S.escRentaT || 0) + dt;
  while (S.escRentaT >= RENTA_ESC_CADA) {
    S.escRentaT -= RENTA_ESC_CADA;
    let r = 0; for (const [i, e] of Object.entries(S.escuelasSa || {})) r += PUEBLOS_SA[i].paga * e.n * (10 + 1.2 * S.rep);
    r = Math.round(r * (leyLista() ? 1.5 : 1) * (S.ganadoSa ? 0.3 : 1));
    if (r > 0) { S.pre += r; if (!silencioso) fx.pops.push({ x: NORMAL_SA.x + 0.4, y: NORMAL_SA.y - 0.4, txt: `+${fmt(r)} ${monIco()} de las escuelas`, born: performance.now() }); }
  }
}
/* ============================================================
   ROMA (era14-plan): LAS TRES ESCUELAS. El pedagogo trae a los niños al ludus apenas hay lugar; cada uno avanza en su
   escuela (p de 0 a 1 en `dur` segundos, por el método de esa escuela) y se lo PASA a la siguiente (el gesto, en el modal
   táctil #escuelas de jugar.html): desde p 0,6 se puede; entre 0,9 y 1,2 pasa entero; antes, pasa a medias (empieza la
   siguiente atrasado y aprende un poco peor); retenido sobre 1,2 se aburre (baja el ánimo y su calidad). Pasar del ludus
   gasta un calculus. Los que pasan por el grammaticus son LETRADOS (la ciudad aprende más: +0,5 % cada uno, tope 40 %);
   el que termina el rétor es ORADOR y defiende su primer caso en la basílica Julia: lo gana si aprendió el sentido y no
   solo la letra (calidad ≥ 0,8; cada dos casos ganados, +1 renombre) y sus clientes pagan según su calidad (la mitad si
   lo pierde). ⚖️ LA FÉRULA O EL JUEGO, por escuela: la férula avanza ×1,5 pero cada alumno en ella baja el ánimo y, arriba
   del ludus, aprende la letra (la calidad baja: en el ludus se recita a coro igual); el juego avanza ×0,65 (es lento al
   principio) y sube el ánimo. El ludus es el cuello de la fila (el más largo): la férula ahí rinde, y arriba cuesta los
   casos. QUINTILIANO, sin férula: el juego avanza ×1,35, el que pasa a tiempo arrastra a los de su sala (la emulación:
   +5 % de avance, hasta +45 % por alumno, solo con el juego) y la férula pesa el doble en el ánimo. Los padres le pagan al
   maestro en los idus por cada alumno, en la proporción del Edicto de Precios de Diocleciano (301: 50 denarios al mes el
   litterator, 200 el grammaticus, 250 el rétor). Las niñas van al ludus y al grammaticus; a la escuela del rétor, no (el
   Foro era de los hombres): terminan como letradas. Cifras medidas con el bot (docs/balance-epoca14.md).
   ============================================================ */
const PEDAGOGO_CADA = 2, RENTA_RO_CADA = 12, PASA_DESDE = 0.6, PASA_ENTERO = 0.9, ABURRE_RO = 1.2, P_TOPE_RO = 1.6;
const FERULA_VEL = 1.5, JUEGO_VEL = 0.65, JUEGO_VEL_QUINT = 1.35, FERULA_ANIMO = 0.065, JUEGO_ANIMO = 0.012, EMULACION_RO = 0.05, FERULA_Q = 0.85, GANA_CASO_RO = 0.8, EMULACION_TOPE_RO = 0.45, CASOS_POR_FAMA_RO = 2;
function tecRo(i) { return S.era === 14 && S.tecs[i] && S.tecs[i].fase === 'meseta'; }
function ludusAbierto() { return tecRo(75); }
function calculiListos() { return tecRo(76); }
function grammaticusAbierto() { return tecRo(77); }
function rhetorAbierto() { return tecRo(78); }
function escuelaPagada() { return tecRo(79); }
function institutioLista() { return tecRo(80); }
function salaAbierta(e) { return e === 0 ? ludusAbierto() : e === 1 ? grammaticusAbierto() : e === 2 ? rhetorAbierto() : false; }
function cupoSala(e) { if (!salaAbierta(e)) return 0; return Math.round((SALAS_RO[e].cupo + nivelTec(SALAS_RO[e].tec)) * (escuelaPagada() ? 1.5 : 1)); }   // uno más por etapa; la escuela pagada, la mitad más
function alumnosSala(e) { return (S.alumnosRo || []).filter(a => a.e === e); }
function enSalas() { return (S.alumnosRo || []).length; }
function metodoSala(e) { return (S.metodoRo || [])[e] === 'ferula' ? 'ferula' : 'juego'; }
function vacacionesRo() { return S.era === 14 && epocaConstruida(14) && S.fuegoDescubierto && estacion().i === 1; }   // el verano: Marcial X, 62
function velSala(e) { return (metodoSala(e) === 'ferula' ? FERULA_VEL : S.quintiliano === 2 ? JUEGO_VEL_QUINT : JUEGO_VEL) * (e === 0 && calculiListos() ? 1.3 : 1) * (vacacionesRo() ? 0.6 : 1); }
function aburreDesde() { return ABURRE_RO + (institutioLista() ? 0.15 : 0); }   // con la Institutio, el maestro mira a cada uno: tarda más en aburrirse
function letradosBono() { return S.era === 14 ? 1 + Math.min(0.4, (S.letrados || 0) * 0.005) : 1; }   // los que leen a los poetas: la ciudad aprende más
function destinoRo(a) { return a.e === 2 ? 'orador' : a.e === 1 && a.g === 'a' ? 'egresa' : salaAbierta(a.e + 1) ? 'pasa' : 'egresa'; }
function porQueNoPasa(a) {
  if (!a) return 'no está';
  if (a.p < PASA_DESDE) return 'todavía no';
  if (a.e === 0 && (S.mats.calculi || 0) < 1) return 'falta un calculus';
  if (destinoRo(a) === 'pasa' && alumnosSala(a.e + 1).length >= cupoSala(a.e + 1)) return 'la escuela siguiente está llena';
  return '';
}
function puedePasar(a) { return S.era === 14 && !!a && porQueNoPasa(a) === ''; }
function listosRo() { return (S.alumnosRo || []).filter(a => a.p >= PASA_ENTERO && puedePasar(a)).length; }
function aburridosRo() { return (S.alumnosRo || []).filter(a => a.p > aburreDesde()).length; }
function pagoOrador(q) { return Math.round((120 + 8 * S.rep) * q * (escuelaPagada() ? 1.3 : 1) * (S.ganadoRo ? 0.3 : 1)); }   // con la escuela pagada, cada orador paga además el minerval
function entraNino(silencioso) { // el pedagogo (un esclavo griego, casi siempre) trae a un niño al ludus
  S.ninoSigRo = (S.ninoSigRo || 0) + 1;
  const k = S.ninoSigRo, c = NINOS_RO[(k * 7) % NINOS_RO.length];
  (S.alumnosRo = S.alumnosRo || []).push({ n: c.n, g: c.g, k, e: 0, p: 0, q: 1, t0: S.tiempoJuego });
  if (silencioso) return;
  fx.pops.push({ x: LUDUS_RO.x, y: LUDUS_RO.y - 0.6, txt: `🎒 el pedagogo trae a ${c.n}`, born: performance.now() });
  if (!S.vioLudus) { S.vioLudus = true; toast(`🎒 <b>Llega ${c.n}.</b> El pedagogo, un esclavo griego que lo acompaña a todas partes, lo trae al ludus antes del amanecer. Va a aprender a leer, a escribir y a contar. Cuando sepa lo de esta escuela, <b>pásalo a la siguiente</b>: toca las escuelas.`, 14000); }
}
function pasarAlumno(i) { // EL GESTO: pasar a la escuela siguiente (o terminar: el letrado sale a la vida; el orador, a la basílica)
  const a = (S.alumnosRo || [])[i]; if (!puedePasar(a)) return false;
  const sala = a.e, entero = a.p >= PASA_ENTERO, dest = destinoRo(a), ferula = metodoSala(sala) === 'ferula';
  if (sala === 0) S.mats.calculi--;
  a.q = Math.max(0.3, a.q * (ferula && sala > 0 ? FERULA_Q : 1) * (entero ? 1 : 0.92));   // arriba, la férula deja la letra y no el sentido (en el ludus se aprende la letra igual: leer, escribir y contar a coro); a medias, un poco menos
  if (sala === 1) S.letrados = (S.letrados || 0) + 1;                   // pasó por el grammaticus: lee a los poetas
  if (entero && S.quintiliano === 2 && !ferula) for (const b of alumnosSala(sala)) if (b !== a && (b.emu || 0) < EMULACION_TOPE_RO) { b.p = Math.min(P_TOPE_RO, b.p + EMULACION_RO); b.emu = (b.emu || 0) + EMULACION_RO; }   // la emulación: el que pasa bien arrastra a los suyos (con la alabanza: bajo la férula nadie quiere ser el primero)
  S.pasadosRo = (S.pasadosRo || 0) + 1; if (!entero) S.mediasRo = (S.mediasRo || 0) + 1;
  let txt, L = SALAS_RO[sala].lugar;
  if (dest === 'pasa') {
    a.e++; a.p = entero ? 0 : -(PASA_ENTERO - a.p) * 1.2; a.t0 = S.tiempoJuego; a.emu = 0;   // a medias: empieza la siguiente atrasado
    txt = `${SALAS_RO[a.e].ic} ${a.n} pasa ${a.e === 1 ? 'al grammaticus' : 'al rétor'}${entero ? '' : ' · a medias'}`;
  } else {
    S.alumnosRo.splice(i, 1);
    if (dest === 'orador') {
      const gana = a.q >= GANA_CASO_RO;                                   // el que aprendió la letra y no el sentido pierde su primer caso: sin renombre, y sus clientes pagan la mitad
      S.oradores = (S.oradores || 0) + 1; if (!gana) S.casosPerdidos = (S.casosPerdidos || 0) + 1;
      const fama = gana && (S.oradores - (S.casosPerdidos || 0)) % CASOS_POR_FAMA_RO === 0; if (fama) S.rep++;   // cada dos casos ganados, el Foro habla de la escuela: +1 renombre
      const pago = Math.round(pagoOrador(a.q) * (gana ? 1 : 0.5)); S.pre += pago; L = BASILICA_RO;
      txt = `⚖️ ${a.n} ${gana ? 'gana' : 'pierde'} su primer caso · +${fmt(pago)} ${monIco()}${fama ? ' · ⭐ +1' : ''}`;
      if (!gana && !S.vioPierde) { S.vioPierde = true; toast(`⚖️ <b>${a.n} pierde su primer caso.</b> Aprendió los discursos de memoria, por miedo a la férula, y ante los centunviros no supo qué decir cuando el otro abogado le cambió el argumento: la letra sin el sentido. Sus clientes pagan la mitad, y no gana renombre.`, 14000); }
      if (!S.vioOrador) { S.vioOrador = true; toast(`⚖️ <b>${a.n} defiende su primer caso en la basílica Julia.</b> Terminó la escuela del rétor y ya es orador: ante los centunviros, con el público en las galerías. Gana renombre, y sus clientes pagan según lo bien que aprendió: <b>+${fmt(pago)} ${monIco()}</b>.`, 14000); }
    } else {
      txt = `📜 ${a.n} termina la escuela${sala === 1 ? ` · ${a.g === 'a' ? 'letrada' : 'letrado'}` : ''}`;
      if (sala === 1 && a.g === 'a' && rhetorAbierto() && !S.vioNinas) { S.vioNinas = true; toast(`📜 <b>${a.n} termina el grammaticus.</b> A la escuela del rétor no iban las niñas: el Foro y la basílica eran de los hombres. Muchas siguieron leyendo en casa: Quintiliano cuenta que la elocuencia de los Gracos le debía mucho a su madre, Cornelia (I, 1, 6).`, 15000); }
    }
  }
  if (!S.vioPasar) { S.vioPasar = true; if (dest === 'pasa') toast(`${SALAS_RO[a.e].ic} <b>${a.n} pasa ${a.e === 1 ? 'al grammaticus' : 'al rétor'}.</b> Una escuela detrás de otra: el ludus, el grammaticus y el rétor, el origen de la primaria, la secundaria y la superior. Pasarlo a tiempo rinde; apurado, llega a medias; retenido, se aburre.`, 13000); }
  if (!entero && !S.vioMedias) { S.vioMedias = true; toast(`⏩ <b>Pasó a medias.</b> ${a.n} no terminó lo de su escuela: empieza la siguiente atrasado y aprende un poco peor. A veces conviene, si la escuela de abajo está llena; casi siempre, esperar un poco rinde más.`, 12000); }
  sfx.promesa(); jubilo();
  fx.pops.push({ x: L.x, y: L.y - 0.7, txt, born: performance.now() });
  renderHUD(); guardar();
  return true;
}
function elegirMetodoRo(e, m) { // ⚖️ la férula o el juego, por escuela
  if (S.era !== 14 || !salaAbierta(e) || !['ferula', 'juego'].includes(m) || metodoSala(e) === m) return false;
  S.metodoRo = (S.metodoRo || ['juego', 'juego', 'juego']).slice(); S.metodoRo[e] = m;
  sfx.tap();
  if (m === 'ferula' && !S.vioFerula) { S.vioFerula = true; toast(`🪵 <b>La férula.</b> La vara de palmeta con que el maestro pegaba en la mano: Horacio se acuerda de «Orbilio, el que pega» (Epístolas II, 1, 70). Con ella se avanza más rápido, pero el miedo baja el ánimo de toda la escuela; y en el grammaticus y con el rétor se aprende la letra y no el sentido: el orador que aprendió así pierde su primer caso. En el ludus, donde se recita a coro, no se nota tanto. ${S.quintiliano === 2 ? 'Quintiliano ya dijo lo suyo.' : 'Hay quien dice que no hace falta.'}`, 14000); }
  renderHUD(); guardar();
  return true;
}
function avanzarEscuelasRo(dt, silencioso) {
  if (!ludusAbierto()) return;
  const est = estacion().i;
  // el pedagogo trae a los niños cuando hay lugar (en otoño, la vuelta a clases, el doble de seguido)
  if (alumnosSala(0).length < cupoSala(0)) { S.pedagogoT = (S.pedagogoT || 0) + dt * (est === 2 ? 2 : 1); if (S.pedagogoT >= PEDAGOGO_CADA) { S.pedagogoT = 0; entraNino(silencioso); } }
  let dAnimo = 0, nuevosListos = 0, nuevosAburridos = 0;
  for (const a of S.alumnosRo) {
    const antes = a.p;
    a.p = Math.min(P_TOPE_RO, a.p + dt / SALAS_RO[a.e].dur * velSala(a.e));
    if (antes < PASA_ENTERO && a.p >= PASA_ENTERO) nuevosListos++;
    dAnimo += metodoSala(a.e) === 'ferula' ? -FERULA_ANIMO * (S.quintiliano === 2 ? 2 : 1) : JUEGO_ANIMO;   // con Quintiliano, la férula pesa el doble: ya todos saben que humilla y que no hace falta
    if (a.p > aburreDesde() && !silencioso) { if (antes <= aburreDesde()) nuevosAburridos++; a.q = Math.max(0.4, a.q - 0.01 * dt); dAnimo -= 0.05; }   // retenido: se aburre (no mientras no estabas: la ausencia no castiga, cozy)
  }
  S.animo = Math.max(BALANCE.animo.min, Math.min(animoMax(), S.animo + dAnimo * dt));
  if (!silencioso && nuevosListos && !S.vioListoRo) { S.vioListoRo = true; toast('🎓 <b>Un alumno está listo para pasar.</b> Ya sabe lo de su escuela: toca las escuelas y pásalo a la siguiente. A tiempo rinde; si esperas mucho, se aburre.', 12000); }
  if (!silencioso && nuevosAburridos && !S.vioAburre) { S.vioAburre = true; toast('🥱 <b>Se aburre.</b> Ya aprendió todo lo de su escuela y nadie lo pasa: el ánimo baja y lo que sabe se le empieza a olvidar. Pásalo (si la escuela siguiente está llena, primero pasa a los de arriba).', 13000); }
  // LOS IDUS: los padres le pagan al maestro por cada alumno (la escuela del rétor, la más cara)
  S.rentaRoT = (S.rentaRoT || 0) + dt;
  while (S.rentaRoT >= RENTA_RO_CADA) {
    S.rentaRoT -= RENTA_RO_CADA;
    let u = 0; for (const a of S.alumnosRo) u += SALAS_RO[a.e].fee;
    const r = Math.round(u * (4 + 0.2 * S.rep) * (S.ganadoRo ? 0.3 : 1));
    if (r > 0) { S.pre += r; if (!silencioso) fx.pops.push({ x: LUDUS_RO.x + 0.4, y: LUDUS_RO.y - 0.4, txt: `+${fmt(r)} ${monIco()} · los idus`, born: performance.now() }); }
  }
  // EL AÑO: las Quinquatrias (el minerval, en primavera) y las Saturnales (en invierno)
  const ano = Math.floor(estacionCruda() / 4);
  if (est === 0 && S.minervalAno !== ano && enSalas() > 0) {
    S.minervalAno = ano;
    const m = Math.round(enSalas() * (25 + 5 * S.rep) * (S.ganadoRo ? 0.3 : 1)); S.pre += m;
    if (!silencioso) { fx.pops.push({ x: LUDUS_RO.x, y: LUDUS_RO.y - 0.9, txt: `🦉 el minerval · +${fmt(m)} ${monIco()}`, born: performance.now() }); sfx.moneda();
      if (!S.vioMinerval) { S.vioMinerval = true; toast(`🦉 <b>Las Quinquatrias.</b> En marzo, la fiesta de Minerva, la diosa de los oficios y del saber: la escuela descansa y los padres le pagan al maestro el minerval, <b>+${fmt(m)} ${monIco()}</b>.`, 13000); } }
  }
  if (est === 3 && S.saturnalAno !== ano) {
    S.saturnalAno = ano; S.animo = Math.min(animoMax(), S.animo + 15);
    if (!silencioso) { fx.pops.push({ x: FORO_RO.x, y: FORO_RO.y - 0.6, txt: '🕯️ las Saturnales · ánimo +15', born: performance.now() });
      if (!S.vioSaturnales) { S.vioSaturnales = true; toast('🕯️ <b>Las Saturnales.</b> En diciembre se regalan velas y figuritas de barro, los esclavos se sientan a la mesa de sus amos y la escuela cierra: el ánimo sube.', 12000); } }
  }
  if (!silencioso && est === 1 && !S.vioVacaciones) { S.vioVacaciones = true; toast('☀️ <b>Las vacaciones.</b> En el verano las escuelas avanzan más lento: Marcial le pide al maestro que deje descansar a los niños, porque «si están sanos en verano, ya aprenden bastante» (Epigramas X, 62).', 13000); }
}
function contarHistoria() {
  const cap = abuelaCapDisponible(); if (!cap) return;
  S.abuelaCap = cap;
  const H = {
    1: '🌙 <b>La mnemotecnia.</b> «Lo que se canta no se olvida», dice la Abuela, y el tambor le lleva el pulso. El relato y el ritmo se enlazan: el saber del clan rinde <b>+12%</b>, para siempre.',
    2: '🌙 <b>Los ancestros.</b> La Abuela recita la genealogía del clan hasta nombres que ya nadie vio. Saberse parte de algo más grande serena al grupo: <b>+10% de ánimo máximo</b>.',
    3: '🌙 <b>«Ahora cuenta tú.»</b> La Abuela calla y te mira. El saber ya no vive solo en ella: vive en todo el clan. La memoria está lista para cruzar los milenios (<b>+10% de aprendizaje</b>).'
  }[cap];
  S.abuelaCd = 90; // una historia por noche: lo contado tiene que asentarse antes de la siguiente
  sfx.historia(); toast(H, 15000); jubilo();
  fx.anillos.push({ born: performance.now(), x: LUGAR_PENSADOR.abuela[0], y: LUGAR_PENSADOR.abuela[1] }); // la historia irradia desde la Abuela
  if (warpAntesHistoria) setTimeout(volverAlRitmo, 6000); // contada la historia, el tiempo vuelve a correr como lo tenías
  renderHUD(); guardar();
}

/* ============================================================
   CHINA SONG (era15-plan): EL GESTO, PREPARAR A LOS CANDIDATOS (etapa 1b).
   Con la escuela de la prefectura llegan candidatos cuando hay lugar (sus datos, en 09j-kaifeng: MODOS_CH, CANDIDATOS_CH).
   Cada uno ESPERA a que elijas cómo se prepara (el modal táctil #examen de jugar.html; su atajo, «preparar a los que
   esperan», hace lo razonable de una vez): ⚖️ DE MEMORIA (rápido, y con los clásicos impresos más; aprueba más: hasta el
   flojo pasa la capital), LOS ASUNTOS de Hu Yuan (el agua, la aritmética: aprueba menos, pero trae recursos siempre: si
   reprueba, la aldea le paga por medir sus campos) o PARA ENTENDER en la otra sala de Hu Yuan y, después, en la academia
   (más lento: el flojo no aprueba, pero el que aprueba manda a casa más del triple, deja más renombre y gobierna mejor).
   Una vez elegido, estudia así hasta el examen.
   EL EXAMEN llega cada EXAMEN_CADA segundos (en la historia, cada tres años), con un aviso medio minuto antes y la sala
   llena: se presentan los que están listos; los demás siguen estudiando para el próximo. Tres niveles: la prefectura
   (nota ≥ 0,5), la capital (≥ 0,7) y, con el saber 86, el de palacio (desde 1057 el emperador no reprueba a nadie: ordena
   la lista, y figurar en ella da más renombre). La nota es la de la manera de estudiar, más el talento de cada uno (★ a
   ★★★), menos la desventaja de los de aldea mientras el examen no sea anónimo (sin padrinos, y el examinador reconocía el
   nombre o la letra). El que aprueba la capital se vuelve FUNCIONARIO: renombre, cómo gobierna (la ciudad aprende más:
   `gobiernoBono`) y lo que manda a casa mientras gobierna (su sueldo, `sueldoCh`: los 🏺 de Kaifeng salen sobre todo de
   ahí, y por eso la elección pesa), según cómo estudió.
   EL QUE REPRUEBA ENSEÑA EN UNA ESCUELA DE ALDEA: atiende a aprendices que estaban a medias (uno más si aprobó al menos la
   prefectura), y las aldeas mandan más candidatos la próxima vez. Nadie pierde. ZHU XI: estudiar para entender se prepara
   tan rápido como memorizar y aprueba igual, y los maestros de aldea que estudiaron así enseñan más.
   ⚖️ Las mujeres no podían presentarse (Li Qingzhao lo dice en el primer examen). El balance (etapa 2) y por qué cada
   cifra: docs/balance-epoca15.md.
   ============================================================ */
const EXAMEN_CADA = 150, EXAMEN_AVISO = 30, EXAMEN_SALA = 8, CAND_CADA = 10;   // el examen, una vez por estación (150 s: seis a ocho por época)
const U_PREFECTURA_CH = 0.5, U_CAPITAL_CH = 0.7, PENA_ALDEA_CH = 0.15, REP_PALACIO_CH = 0.25, ZHUXI_ATIENDE_CH = 2, GOB_TOPE_CH = 0.5;
const ACADEMIA_NOTA_CH = 0.03, SUELDO_REP_CH = 0.01, CUPO_BASE_CH = 7, ESPERA_CH = 45;   // ESPERA_CH: si nadie elige en ese rato, la escuela lo prepara como siempre, de memoria (el juego idle no se traba)   // cada etapa de la academia sube la nota del que entiende; el renombre sube los sueldos (+1 % por estrella); los que caben de entrada
function tecCh(i) { return S.era === 15 && S.tecs[i] && S.tecs[i].fase === 'meseta'; }
function prefecturaCh() { return tecCh(81); }                        // abre los candidatos (y la tinta, en 11-materiales)
function impresosCh() { return tecCh(82); }                          // los clásicos impresos: la memoria, más rápida
function modelosCh() { return impresosCh() && nivelTec(82) >= 3; }   // ⚖️ los modelos de Jianyang: la memoria aprueba más
function anonimoCh() { return tecCh(84); }                           // los de aldea, sin desventaja (y vienen más)
function palacioCh() { return tecCh(86); }                           // el tercer nivel
function modoAbierto(k) { const M = MODOS_CH[k]; return !!M && tecCh(M.tec); }
/* ZHU XI vale para los que EMPIEZAN a leer con él: el candidato que ya estudiaba para entender cuando llegó sigue con lo de
   antes (c.zx se anota al elegir; el que todavía espera, se mide con lo de hoy) */
function conZhu(c) { return c && c.m ? !!c.zx : S.zhuxi === 2; }
function durModo(k, zx = S.zhuxi === 2) {
  if (k === 'entender' && zx) return durModo('memoria', false);   // ZHU XI: leer despacio no tarda más que recitar
  return MODOS_CH[k].dur * (k === 'memoria' ? (impresosCh() ? 0.7 : 1) * (modelosCh() ? 0.85 : 1) : 1);
}
function notaCh(c, k) {   // con cuánto llega al examen el candidato c si se prepara de la manera k
  if (k === 'entender' && conZhu(c)) return Math.max(notaSinZhu(c, 'entender'), notaSinZhu(c, 'memoria'));   // ZHU XI: «el que entiende aprueba igual»
  return notaSinZhu(c, k);
}
function notaSinZhu(c, k) { return MODOS_CH[k].nota + (k === 'memoria' && modelosCh() ? 0.1 : 0) + (k === 'entender' ? ACADEMIA_NOTA_CH * nivelTec(85) : 0) + c.t - (c.o === 'a' && !anonimoCh() ? PENA_ALDEA_CH : 0); }
function nivelCh(c, k) { const n = notaCh(c, k) + 1e-9; return n >= U_CAPITAL_CH ? 2 : n >= U_PREFECTURA_CH ? 1 : 0; }   // 2: aprueba la capital · 1: solo la prefectura · 0: reprueba
function examenEn() { return Math.max(0, EXAMEN_CADA - (S.examenT || 0)); }   // segundos que faltan para el próximo examen
function llegaCh(c, k) { return (1 - Math.max(0, c.p || 0)) * durModo(k, conZhu(c)) <= examenEn() + 0.01; }   // ¿estaría listo para el próximo?
function candidatosCh() { return S.candidatosCh || []; }
function candidatosEsperan() { return candidatosCh().filter(c => !c.m).length; }
function listosCh() { return candidatosCh().filter(c => c.m && c.p >= 1).length; }
function cupoCandidatos() { if (!prefecturaCh()) return 0; return CUPO_BASE_CH + nivelTec(81) + (anonimoCh() ? 2 : 0) + Math.min(3, Math.floor((S.maestrosAldea || 0) / 4)); }   // uno más por etapa; el examen anónimo y las escuelas de aldea traen más
function aldeaAtiende() { return S.era === 15 ? (S.aldeaAtiende || 0) : 0; }   // los aprendices a medias que atienden las escuelas de aldea (muidAtiende)
function examenEnCurso() { return S.era === 15 && (S.salaT || 0) > 0; }       // la sala llena (para el 3D: los candidatos en sus celdas)
function gobiernoBono() { return S.era === 15 ? 1 + Math.min(GOB_TOPE_CH, S.gobiernoCh || 0) : 1; }   // los funcionarios gobiernan: sostienen escuelas y la ciudad aprende más (el que entendió, el triple que el que memorizó; tope +50 %)
/* LO QUE MANDAN A CASA (🏺 por segundo): el sueldo de cada funcionario según cómo estudió, y lo que la aldea le paga al de
   los asuntos que reprobó; el renombre lo sube un poco (SUELDO_REP_CH por estrella) y, con la época ganada, descansa */
function sueldoCh() {
  if (S.era !== 15) return 0;
  const f = S.funcCh || {}, a = S.aldeaCh || {};
  let s = 0; for (const k in MODOS_CH) s += (f[k] || 0) * MODOS_CH[k].sue + (a[k] || 0) * (MODOS_CH[k].sueAldea || 0);
  return s * (1 + SUELDO_REP_CH * S.rep) * (S.ganadoCh ? 0.3 : 1);
}
function porEstacionCh(sue) { return Math.round(sue * (1 + SUELDO_REP_CH * S.rep) * EXAMEN_CADA); }   // un sueldo, contado por estación (lo que ve el jugador)
function relojCh(s) { s = Math.ceil(s); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }
/* LO RAZONABLE para cada uno (el atajo del modal, el bot y la ausencia), según su talento: para entender si así aprueba la
   capital (aunque tenga que esperar al examen siguiente: lo que manda a casa lo vale); si no, de memoria si así la aprueba;
   y si igual va a reprobar, los asuntos si hay sala de Hu Yuan (la aldea le paga) o de memoria. Con Zhu Xi, para entender
   a todos: tarda lo mismo y aprueba igual (balance-epoca15.md) */
function mejorModo(c) {
  if (S.zhuxi === 2 && modoAbierto('entender')) return 'entender';   // ZHU XI: estudiar para entender rinde como memorizar (tarda lo mismo y aprueba igual): a todos, para entender
  if (modoAbierto('entender') && nivelCh(c, 'entender') === 2) return 'entender';
  if (nivelCh(c, 'memoria') === 2) return 'memoria';
  if (modoAbierto('asuntos')) return 'asuntos';
  return 'memoria';
}
function entraCandidato(silencioso) { // un candidato llega a la escuela de la prefectura: espera que elijas cómo se prepara
  const k = S.candSigCh = (S.candSigCh || 0) + 1;
  const aldea = anonimoCh() ? k % 3 !== 1 : k % 3 === 0;   // con el examen anónimo, dos de cada tres vienen de una aldea
  S.candidatosCh = S.candidatosCh || [];
  let i = (k * 5) % CANDIDATOS_CH.length;                  // el nombre de su número de llegada; si ya hay uno con ese nombre (el que reprobó y se
  for (let r = 0; r < CANDIDATOS_CH.length && S.candidatosCh.some(o => o.n === CANDIDATOS_CH[i]); r++) i = (i + 1) % CANDIDATOS_CH.length;   // vuelve a presentar), el siguiente libre
  const c = { n: CANDIDATOS_CH[i], k, o: aldea ? 'a' : 'c', t: TALENTOS_CH[k % TALENTOS_CH.length], m: null, p: 0 };
  S.candidatosCh.push(c);
  if (silencioso) { c.m = mejorModo(c); c.zx = S.zhuxi === 2; return; }   // mientras no estabas, el maestro de la prefectura lo prepara como lo harías tú (la ausencia no castiga)
  fx.pops.push({ x: PREFECTURA_CH.x, y: PREFECTURA_CH.y - 0.6, txt: `🖌️ llega ${c.n}${aldea ? ' · de una aldea' : ''}`, born: performance.now() });
  if (!S.vioCandidato) { S.vioCandidato = true; toast(`🖌️ <b>Llega ${c.n}, un candidato.</b> Viene a la escuela de la prefectura a prepararse para el examen, que llega cada tanto: el que lo aprueba gobierna. <b>Elige cómo se prepara</b> (toca la escuela de la prefectura). Mientras no lo elijas, espera.`, 14000); }
}
function elegirModo(i, k) { // EL GESTO: cómo se prepara este candidato (una vez elegido, estudia así hasta el examen)
  const c = candidatosCh()[i];
  if (S.era !== 15 || !c || c.m || !modoAbierto(k)) return false;
  c.m = k; c.p = 0; c.zx = S.zhuxi === 2; S.preparadosCh = (S.preparadosCh || 0) + 1;
  sfx.tap();
  if (k === 'memoria' && !S.vioMemoria) { S.vioMemoria = true; toast(`📜 <b>De memoria.</b> ${c.n} recita los clásicos y sus comentarios hasta saberlos de corrido: se prepara rápido y el examen premia eso. Lo que no aprende es a gobernar: el que aprueba así manda poco a casa, deja poco renombre y gobierna como recita. Al flojo, esto: así al menos aprueba.`, 12000); }
  if (k === 'asuntos' && !S.vioAsuntos) { S.vioAsuntos = true; toast(`🧭 <b>La sala de los asuntos.</b> ${c.n} estudia con Hu Yuan el agua de los canales, la aritmética y la defensa. El examen pide los clásicos, así que aprueba menos; pero lo que sabe sirve siempre: si aprueba, sus obras mandan mucho a casa, y si reprueba, la aldea le paga por medir sus campos.`, 14000); }
  if (k === 'entender' && !S.vioEntender) { S.vioEntender = true; toast(`⛰️ <b>Para entender.</b> ${c.n} va a la otra sala de Hu Yuan, la de los clásicos, a preguntar qué quieren decir y a conversar con el maestro. ${S.zhuxi === 2 ? 'Con Zhu Xi, no tarda más que memorizar y aprueba igual.' : 'Tarda más que memorizar, y aprueba menos: el flojo no llega a la capital.'} Pero el que aprueba así gobierna mejor: manda a casa más del triple, deja más renombre y la ciudad aprende más con él. Al talentoso, esto.`, 14000); }
  renderHUD(); guardar();
  return true;
}
function prepararCandidatos() { // el atajo: a cada uno lo suyo (lo razonable de mejorModo), de una vez
  let n = 0;
  candidatosCh().forEach((c, i) => { if (!c.m && elegirModo(i, mejorModo(c))) n++; });
  return n;
}
function avisoExamen() { // medio minuto antes: el aviso (en la historia se pegaba en la puerta de la prefectura)
  const L = listosCh(), E = candidatosEsperan(), N = candidatosCh().length - L - E;
  sfx.campana();
  fx.pops.push({ x: ANONIMO_CH.x, y: ANONIMO_CH.y - 0.8, txt: `📜 el examen en ${EXAMEN_AVISO} s`, born: performance.now() });
  toast(`📜 <b>En medio minuto, el examen${palacioCh() ? ', con el de palacio' : ''}.</b> Se presentan los que están listos: <b>${L}</b>.${N ? ` Todavía estudian ${N}: irán al próximo.` : ''}${E ? ` <b>${E === 1 ? 'Uno espera' : E + ' esperan'}</b> que elijas cómo se prepara${E === 1 ? '' : 'n'}.` : ''}`, 9000);
}
function examenCh(silencioso) { // EL EXAMEN: la sala llena; se presentan los listos y salen funcionarios o maestros de aldea
  const sientan = candidatosCh().filter(c => c.m && c.p >= 1);
  S.examenesCh = (S.examenesCh || 0) + 1; S.salaT = EXAMEN_SALA;
  if (!sientan.length) { if (!silencioso && candidatosCh().length) toast('📜 <b>El examen.</b> Nadie de tu escuela estaba listo: la sala se llena con los de otras prefecturas. Los tuyos siguen estudiando para el próximo.', 9000); return; }
  S.candidatosCh = candidatosCh().filter(c => !sientan.includes(c));
  const fun = [], mae = []; let fama = 0, at = 0;
  S.funcCh = S.funcCh || {}; S.aldeaCh = S.aldeaCh || {};
  const sue0 = sueldoCh();
  for (const c of sientan) {
    const M = MODOS_CH[c.m], niv = nivelCh(c, c.m);
    if (niv === 2) {                                                           // aprueba la capital: funcionario
      fun.push(c); S.funcionarios = (S.funcionarios || 0) + 1; S.funcCh[c.m] = (S.funcCh[c.m] || 0) + 1;
      fama += M.rep + (palacioCh() ? REP_PALACIO_CH : 0); S.gobiernoCh = (S.gobiernoCh || 0) + M.gob;
    } else {                                                                   // reprueba: enseña en una escuela de aldea
      const a = M.atiende + (niv === 1 ? 1 : 0) + (c.m === 'entender' && S.zhuxi === 2 ? ZHUXI_ATIENDE_CH : 0);
      mae.push(c); at += a; S.maestrosAldea = (S.maestrosAldea || 0) + 1; S.aldeaAtiende = (S.aldeaAtiende || 0) + a; S.aldeaCh[c.m] = (S.aldeaCh[c.m] || 0) + 1;   // el de los asuntos, además, mide los campos de la aldea (sueAldea, en sueldoCh)
    }
  }
  const rep0 = S.rep;
  S.famaExCh = (S.famaExCh || 0) + fama;
  while (S.famaExCh >= 1 - 1e-9) { S.famaExCh -= 1; S.rep++; }                // el renombre se junta de a fracciones
  const pre = Math.round((sueldoCh() - sue0) * EXAMEN_CADA);                   // lo que suben los envíos a casa, por estación (el sueldo corre en avanzarCandidatosCh)
  if (silencioso) return;
  sfx.examen(); jubilo();
  fx.anillos.push({ born: performance.now(), x: ANONIMO_CH.x, y: ANONIMO_CH.y });
  fx.pops.push({ x: ANONIMO_CH.x, y: ANONIMO_CH.y - 0.9, txt: `📜 ${fun.length} ${fun.length === 1 ? 'aprueba' : 'aprueban'} · ${mae.length} a enseñar`, born: performance.now() });
  if (pre > 0) fx.pops.push({ x: PALACIO_CH.x, y: PALACIO_CH.y - 0.6, txt: `+${fmt(pre)} ${monIco()} por estación${S.rep > rep0 ? ` · ⭐ +${S.rep - rep0}` : ''}`, born: performance.now() + 400 });
  const nombres = L => L.slice(0, 3).map(c => `${c.n} (${MODOS_CH[c.m].n.toLowerCase()})`).join(', ') + (L.length > 3 ? ` y ${L.length - 3} más` : '');
  if (!S.vioExamenCh) {
    S.vioExamenCh = true;
    toast(`📜 <b>El examen.</b> La sala se llena: cada candidato en su celda, con su pincel, su tinta y la comida para los días que dura. En la historia se rendía cada tres años: primero el de la prefectura y, el que lo aprobaba, el de la capital. ${fun.length ? `Aprueba${fun.length === 1 ? '' : 'n'} la capital: <b>${nombres(fun)}</b>. Ya ${fun.length === 1 ? 'es funcionario' : 'son funcionarios'}: renombre, y desde hoy mandan a casa +${fmt(pre)} ${monIco()} por estación.` : 'Esta vez nadie aprueba la capital.'}`, 16000);
    setTimeout(() => toast('⚖️ <b>Li Qingzhao mira la lista desde la puerta.</b> Lee los clásicos mejor que muchos candidatos, y escribe los mejores poemas de Kaifeng, pero no puede presentarse: el examen es solo para hombres. Aprendió en casa, con los libros de su padre.', 14000), 9000);
  } else toast(`📜 <b>El examen${palacioCh() ? ' y el de palacio' : ''}.</b> ${fun.length ? `${fun.length === 1 ? 'Aprueba' : 'Aprueban'} <b>${nombres(fun)}</b>: mandan a casa +${fmt(pre)} ${monIco()} por estación${S.rep > rep0 ? `, ⭐ +${S.rep - rep0}` : ''}.` : 'Nadie aprueba la capital.'}${mae.length ? ` ${mae.length === 1 ? 'Reprueba uno, que va' : `Reprueban ${mae.length}, que van`} a enseñar a ${mae.length === 1 ? 'su aldea' : 'sus aldeas'}.` : ''}`, 10000);
  if (mae.length && !S.vioAldea) { S.vioAldea = true; setTimeout(() => toast(`🏫 <b>Los que reprueban enseñan.</b> ${mae[0].n} vuelve a su aldea y abre una escuela: atiende a los aprendices que estaban a medias, y la aldea manda más candidatos la próxima vez. Miles hicieron eso: los que no aprobaban prepararon a la generación siguiente. Nadie pierde.`, 14000), 4000); }
  if (fun.length && palacioCh() && !S.vioPalacioCh) { S.vioPalacioCh = true; setTimeout(() => toast(`🐉 <b>El examen de palacio.</b> Los que aprobaron la capital escriben ante el emperador un ensayo sobre cómo gobernar. Desde 1057 no se reprueba a nadie: el emperador ordena la lista, se cuelga en la puerta y la ciudad sale a leerla. Figurar en ella da más renombre.`, 14000), 6000); }
  if (fun.some(c => c.m === 'memoria') && modelosCh() && !S.vioModelos) { S.vioModelos = true; toast('⚖️ <b>Los modelos de Jianyang.</b> Algunos aprobaron recitando ensayos de otros, comprados en el mercado del templo: el examen no distingue al que entiende del que se lo sabe de memoria. La corte prohibió esos libros una y otra vez.', 13000); }
  renderHUD(); guardar();
}
function avanzarCandidatosCh(dt, silencioso) { // los relojes del gesto: llegan candidatos, estudian, y el examen llega cada tanto
  if (!prefecturaCh()) return;
  S.pre += dt * sueldoCh();                                                     // lo que mandan a casa los funcionarios (y la aldea al agrimensor), cada segundo
  if (candidatosCh().length < cupoCandidatos()) { S.candT = (S.candT || 0) + dt; if (S.candT >= CAND_CADA) { S.candT = 0; entraCandidato(silencioso); } }
  for (const c of candidatosCh()) {
    if (c.m && c.p < 1) c.p = Math.min(1, c.p + dt / durModo(c.m, !!c.zx));
    else if (!c.m && (c.w = (c.w || 0) + dt) >= ESPERA_CH) {   // LA ESCUELA POR DEFECTO: nadie eligió, y el maestro de la prefectura lo prepara como se hacía, de memoria
      c.m = 'memoria'; c.p = 0; c.zx = S.zhuxi === 2; S.porDefectoCh = (S.porDefectoCh || 0) + 1;
      if (!silencioso && !S.vioDefectoCh) { S.vioDefectoCh = true; toast(`📜 <b>Nadie eligió por ${c.n}</b>, y el maestro de la prefectura lo prepara como siempre: de memoria. Es lo que hacían casi todas las escuelas: preparar para el examen. Para que estudie de otra manera, elige tú (toca la escuela de la prefectura).`, 13000); }
    }
  }
  if (S.salaT > 0) S.salaT = Math.max(0, S.salaT - dt);
  const antes = examenEn();
  S.examenT = (S.examenT || 0) + dt;
  if (!silencioso && antes > EXAMEN_AVISO && examenEn() <= EXAMEN_AVISO) avisoExamen();
  if (S.examenT >= EXAMEN_CADA) { S.examenT -= EXAMEN_CADA; examenCh(silencioso); }
}

/* ============================================================
   EL FUTURO (era21-plan): EL GESTO, LA RESPUESTA O LA PREGUNTA.
   Con la escuela del valle (87) llegan estudiantes con su problema cuando hay lugar (sus datos, en 09k-futuro: DUDAS_FU,
   ESTUDIANTES_FU). Cada uno ESPERA a que elijas cómo lo ayuda la IA (el modal táctil #pregunta de jugar.html; su atajo,
   «a cada uno lo suyo», hace lo razonable de una vez):
   - QUE RESPONDA: al instante. El estudiante entrega la tarea (saber al momento, que rinde si el problema era un dato y casi
     nada si era un porqué) y queda a medias; las familias pagan un poco por la tarea entregada. ⚖️ Un porqué respondido, a
     veces, viene con una RESPUESTA INVENTADA: suena cierta y no lo es; mientras nadie la revise, el valle aprende menos (la
     confianza). La biblioteca que responde (90) inventa menos, y en su última etapa (la mesa de revisión) revisar no gasta
     atención.
   - QUE PREGUNTE, como un tutor (lo abre 88): gasta una ATENCIÓN (el material de la época, que se junta en los lugares
     tranquilos; dos por pregunta) y tarda: el estudiante camina pensando y vuelve con su «!». ENTENDIÓ: el valle aprende más por cada uno que
     entendió (`entendidosBono`, con tope), las familias pagan más por él, y los que entendieron enseñan (atienden a los que
     estaban a medias: `tutoresFu`). Un dato preguntado se entiende menos que un porqué: para un dato, basta buscarlo.
   Si nadie elige en ESPERA_FU segundos, la IA responde sola (es lo que hace si nadie le pide otra cosa). La traducción al
   instante (89) trae estudiantes de lejos (uno de cada tres, más seguido, más cupo). La defensa (91), cada tanto: cada
   uno que entendió desde la anterior deja renombre, y la defensa descubre una respuesta inventada. BLOOM (las dos sigmas):
   el que entiende rinde el doble en lo que aprende el valle, y preguntar tarda menos.
   El balance y por qué cada cifra: docs/balance-epoca21.md.
   ============================================================ */
const DUDA_CADA_FU = 16, CUPO_BASE_FU = 5, ESPERA_FU = 40, PIENSA_FU = 28;   // llega uno cada 16 s si hay lugar (con 9 eran siete u ocho decisiones por minuto: demasiado para un juego tranquilo, QA); el que espera 40 s sin que elijas, la IA le responde sola; preguntar como tutor tarda 28 s
const RESP_S_FU = { dato: 7, porque: 2 }, PREG_S_FU = { dato: 2, porque: 9 };   // el saber al momento, en segundos de la tasa: la respuesta a un dato rinde; la de un porqué, casi nada
const ABURRE_DATO_FU = 4;   // el ánimo que cuesta preguntarle al tutor por un dato
const ENT_FU = { dato: 0.1, porque: 1 };                                    // cuánto entiende el que preguntó: el porqué pensado vale entero; un dato preguntado casi no deja nada (para un dato, basta buscarlo)
const ENT_PASO_FU = 0.012, ENT_TOPE_FU = 0.5;                               // cada uno que entendió, +1,2 % a lo que aprende el valle (con Bloom, el doble); tope +50 %
const P_INVENTA_FU = 0.25, ERR_PASO_FU = 0.03, ERR_TOPE_FU = 0.2;           // un porqué respondido viene inventado el 25 % de las veces; cada inventada sin revisar, −3 % (tope −20 %). Con 45 % y −30 %, en la partida con clics se juntaban 74 inventadas y el valle se trababa (QA)
const SUE_ENT_FU = 3, SUE_RESP_FU = 0.6, DEFENSA_CADA_FU = 120, REP_DEF_FU = 0.25;   // 🏺 por segundo por cada uno que entendió y por cada tarea entregada; la defensa, cada 120 s, y su renombre por cada uno que entendió
function tecFu(i) { return S.era === 21 && S.tecs[i] && S.tecs[i].fase === 'meseta'; }
function escuelaFu() { return tecFu(87); }        // abre las dudas
function tutorFu() { return tecFu(88); }          // abre preguntar (y la atención)
function traduccionFu() { return tecFu(89); }     // los de lejos
function bibliotecaFu() { return tecFu(90); }     // menos inventadas; con la mesa de revisión, revisar no gasta atención
function defensaFu() { return tecFu(91); }        // la defensa
function dudasFu() { return S.dudasFu || []; }
function pensandoFu() { return S.pensandoFu || []; }
function dudasEsperan() { return S.era === 21 ? dudasFu().length : 0; }
function cupoDudas() { return escuelaFu() ? CUPO_BASE_FU + nivelTec(87) + (traduccionFu() ? 2 + nivelTec(89) : 0) : 0; }
function tipoDuda(d) { return DUDAS_FU[d.q].t; }
function pInventa() { return P_INVENTA_FU * (bibliotecaFu() ? 1 - 0.15 * (1 + nivelTec(90)) : 1); }
function mesaRevisionFu() { return bibliotecaFu() && nivelTec(90) >= 3; }
function piensaDur() { return PIENSA_FU * (S.bloom === 2 ? 0.75 : 1) * (1 - 0.06 * nivelTec(88)); }
function entendidosBono() { return S.era === 21 ? 1 + Math.min(ENT_TOPE_FU, ENT_PASO_FU * (S.entendidosFu || 0) * (S.bloom === 2 ? 2 : 1)) : 1; }
function confianzaBono() { return S.era === 21 ? 1 - Math.min(ERR_TOPE_FU, ERR_PASO_FU * (S.erroresFu || 0)) : 1; }
function tutoresFu() { return S.era === 21 ? Math.floor((S.entendidosFu || 0) * 0.5) : 0; }   // los que entendieron enseñan: atienden a los que estaban a medias (muidAtiende)
function sueldoFu() { return S.era === 21 ? ((S.entendidosFu || 0) * SUE_ENT_FU + (S.respondidosFu || 0) * SUE_RESP_FU) * (1 + 0.01 * S.rep) * (S.ganadoFu ? 0.3 : 1) : 0; }
function claroFu() { return 3 + nivelTec(88); }   // los que caben pensando a la vez en el claro de las preguntas (uno más por etapa del tutor)
function claroLlenoFu() { return pensandoFu().length >= claroFu(); }
const PREG_ATEN_FU = 2;   // lo que gasta preguntar como un tutor: pensar de verdad pide atención (la escasa de la época)
function puedePreguntarFu() { return tutorFu() && (S.mats.atencion || 0) >= PREG_ATEN_FU && !claroLlenoFu(); }
function revisarDisponibleFu() { return S.era === 21 && (S.erroresFu || 0) > 0 && (mesaRevisionFu() || (S.mats.atencion || 0) >= 1); }
/* LO RAZONABLE para cada uno (el atajo del modal, el bot y la ausencia): el porqué, preguntado si hay tutor y atención; el
   dato, respondido */
function mejorFu(d) { return tipoDuda(d) === 'porque' && puedePreguntarFu() ? 'preguntar' : 'responder'; }
function entraDuda(silencioso) { // llega una estudiante con su problema: espera que elijas cómo la ayuda la IA
  const k = S.dudaSigFu = (S.dudaSigFu || 0) + 1;
  const lejos = traduccionFu() && k % 3 === 0, nombres = lejos ? LEJOS_FU : ESTUDIANTES_FU, usados = [...dudasFu(), ...pensandoFu()];
  let i = (k * 7) % nombres.length;
  for (let r = 0; r < nombres.length && usados.some(o => o.n === nombres[i]); r++) i = (i + 1) % nombres.length;
  let q = (k * 5) % DUDAS_FU.length;
  for (let r = 0; r < DUDAS_FU.length && usados.some(o => o.q === q); r++) q = (q + 1) % DUDAS_FU.length;   // dos a la vez no traen la misma pregunta
  const d = { n: nombres[i], k, q, l: lejos ? 1 : 0, w: 0 };
  if (lejos) S.lejosFu = (S.lejosFu || 0) + 1;
  if (silencioso) { resolverDuda(d, mejorFu(d), true); return; }   // mientras no estabas, la escuela hizo lo razonable (la ausencia no castiga)
  S.dudasFu = [...dudasFu(), d];
  fx.pops.push({ x: ESCUELA_FU.x + 0.6, y: ESCUELA_FU.y + 0.9, txt: `${tipoDuda(d) === 'porque' ? '❔' : '🔢'} ${d.n}${lejos ? ' · de lejos' : ''}`, born: performance.now() });
  if (!S.vioDuda) { S.vioDuda = true; toast(`🏡 <b>Llega ${d.n} con una pregunta:</b> «${DUDAS_FU[d.q].q}». En la escuela del valle cada estudiante le puede preguntar a la IA, y la IA responde al instante. <b>Toca la escuela</b> para ver quién espera.`, 14000); }
  if (lejos && !S.vioLejos) { S.vioLejos = true; toast(`🌐 <b>${d.n} llegó de lejos</b> y no habla la lengua de la escuela. La IA le traduce todo, en las dos direcciones: puede seguir la clase desde el primer día.`, 12000); }
}
function resolverDuda(d, modo, silencioso) {
  const t = tipoDuda(d);
  if (modo === 'preguntar') {
    S.mats.atencion = Math.max(0, (S.mats.atencion || 0) - PREG_ATEN_FU);
    S.pensandoFu = [...pensandoFu(), { n: d.n, q: d.q, l: d.l, k: d.k, p: 0 }];
    if (t === 'dato') {   // preguntarle a un tutor por un dato aburre: para un dato, basta buscarlo (el ánimo baja un poco)
      S.animo = Math.max(0, S.animo - ABURRE_DATO_FU);
      if (!silencioso && !S.vioAburreFu) { S.vioAburreFu = true; toast(`🥱 <b>${d.n} solo quería un dato</b>, y la IA le respondió con otra pregunta. Para un dato, basta buscarlo: preguntarle al tutor por lo que se busca en un segundo aburre, y el ánimo baja un poco.`, 12000); }
    }
    if (!silencioso && !S.vioPregunta) { S.vioPregunta = true; toast(`❓ <b>Que pregunte.</b> La IA no le da la respuesta a ${d.n}: le pregunta qué sabe, le da una pista y espera. ${d.n} se va caminando, pensando. Tarda, y cuesta atención (dos 🎯); cuando vuelva con su «!», lo habrá entendido, y lo va a poder explicar.`, 13000); }
    return;
  }
  S.respondidosFu = (S.respondidosFu || 0) + 1;
  const b = Math.round(tasa() * RESP_S_FU[t]); S.apr += b; S.aprTotal += b;
  const inventada = t === 'porque' && ((d.k * 37) % 100) / 100 < pInventa();   // la misma estudiante, la misma suerte (el bot y el jugador ven lo mismo)
  if (inventada) { S.erroresFu = (S.erroresFu || 0) + 1; S.inventadasFu = (S.inventadasFu || 0) + 1; }
  if (silencioso) return;
  fx.pops.push({ x: ESCUELA_FU.x, y: ESCUELA_FU.y - 0.7, txt: `💬 ${d.n} entrega${inventada ? ' · ⚠️ inventada' : ''} · +${fmt(b)} 📖`, born: performance.now() });
  if (!S.vioResponde) { S.vioResponde = true; toast(`💬 <b>Que responda.</b> La IA le da la respuesta a ${d.n}, que entrega la tarea al instante: saber de inmediato y la tarea hecha. Para un dato está bien: es buscar. Para un porqué, ${d.n} queda a medias: tiene la respuesta, no el camino.`, 13000); }
  if (inventada && !S.vioInventa) { S.vioInventa = true; setTimeout(() => toast(`⚠️ <b>Una respuesta inventada.</b> La IA le explicó a ${d.n} algo que suena cierto y no lo es, con la misma seguridad con que acierta. Mientras nadie la revise, el valle aprende un poco menos. Revísala desde la escuela (cuesta una atención).`, 13000), 3500); }
}
function elegirFu(i, modo) { // EL GESTO: cómo ayuda la IA a esta estudiante
  const d = dudasFu()[i];
  if (S.era !== 21 || !d || (modo === 'preguntar' && !puedePreguntarFu())) return false;
  S.dudasFu = dudasFu().filter(o => o !== d);
  sfx.tap();
  resolverDuda(d, modo, false);
  renderHUD(); guardar();
  return true;
}
function ayudarATodosFu() { // el atajo: a cada uno lo suyo (lo razonable de mejorFu), de una vez
  let n = 0;
  for (const d of [...dudasFu()]) if (elegirFu(dudasFu().indexOf(d), mejorFu(d))) n++;
  return n;
}
function revisarFu() { // revisar una respuesta inventada: mirar la fuente (cuesta una atención, salvo con la mesa de revisión)
  if (!revisarDisponibleFu()) return false;
  if (!mesaRevisionFu()) S.mats.atencion = Math.max(0, (S.mats.atencion || 0) - 1);
  S.erroresFu--; S.revisadosFu = (S.revisadosFu || 0) + 1;
  const b = Math.round(tasa() * 3); S.apr += b; S.aprTotal += b;
  sfx.tap();
  fx.pops.push({ x: BIBLIOTECA_FU.x, y: BIBLIOTECA_FU.y - 0.6, txt: `🔎 revisada · +${fmt(b)} 📖`, born: performance.now() });
  if (!S.vioRevisa) { S.vioRevisa = true; toast('🔎 <b>Revisada.</b> Alguien miró la fuente, encontró el error y se lo explicó a quien lo tenía. Es la regla de siempre, de Alejandría para acá: la respuesta vale lo que vale su fuente.', 12000); }
  renderHUD(); guardar();
  return true;
}
function defensaFuEvento(silencioso) { // LA DEFENSA: cada uno que entendió desde la última cuenta su trabajo en voz alta
  const nuevos = Math.max(0, (S.entendidosFu || 0) - (S.entDefendidosFu || 0));
  S.entDefendidosFu = S.entendidosFu || 0; S.defensasFu = (S.defensasFu || 0) + 1;
  S.famaFu = (S.famaFu || 0) + nuevos * REP_DEF_FU; const rep0 = S.rep;
  while (S.famaFu >= 1 - 1e-9) { S.famaFu -= 1; S.rep++; }
  const descubre = Math.min(3, S.erroresFu || 0);   // en la defensa se nota quién entendió y quién solo entregó: hasta tres inventadas salen a la luz y se corrigen
  if (descubre) { S.erroresFu -= descubre; S.revisadosFu = (S.revisadosFu || 0) + descubre; }
  if (silencioso || (!nuevos && !descubre)) return;
  sfx.logro();
  fx.anillos.push({ born: performance.now(), x: EXAMEN_FU.x, y: EXAMEN_FU.y });
  fx.pops.push({ x: EXAMEN_FU.x, y: EXAMEN_FU.y - 0.8, txt: `🎙️ la defensa${S.rep > rep0 ? ` · ⭐ +${S.rep - rep0}` : ''}${descubre ? ` · ⚠️ ${descubre === 1 ? 'una inventada, corregida' : descubre + ' inventadas, corregidas'}` : ''}`, born: performance.now() });
  if (!S.vioDefensa) { S.vioDefensa = true; toast(`🎙️ <b>La defensa.</b> Los que entendieron muestran su trabajo en las gradas y responden preguntas que no se pueden copiar: el valle entero viene a escuchar, y la escuela gana renombre. ${descubre ? 'Y en la defensa salió a la luz una respuesta inventada: se notó quién solo había entregado.' : ''}`, 13000); }
}
function avanzarDudasFu(dt, silencioso) { // los relojes del gesto: llegan con su problema, esperan, piensan; y la defensa, cada tanto
  if (!escuelaFu()) return;
  S.pre += dt * sueldoFu();                                                    // lo que pagan las familias, cada segundo
  if (dudasFu().length < cupoDudas()) { S.dudaT = (S.dudaT || 0) + dt; if (S.dudaT >= DUDA_CADA_FU * (traduccionFu() ? 0.75 : 1)) { S.dudaT = 0; entraDuda(silencioso); } }
  for (const d of [...dudasFu()]) if ((d.w = (d.w || 0) + dt) >= ESPERA_FU) {    // LA IA POR DEFECTO: nadie eligió, y la IA respondió sola
    S.dudasFu = dudasFu().filter(o => o !== d); S.porDefectoFu = (S.porDefectoFu || 0) + 1;
    resolverDuda(d, 'responder', silencioso);
    if (!silencioso && !S.vioDefectoFu) { S.vioDefectoFu = true; toast(`💬 <b>Nadie eligió por ${d.n}</b>, y la IA le respondió sola: es lo que hace si nadie le pide otra cosa. Para que pregunte como un tutor, elige tú (toca la escuela).`, 12000); }
  }
  for (const p of [...pensandoFu()]) {
    p.p = Math.min(1, (p.p || 0) + dt / piensaDur());
    if (p.p < 1) continue;
    S.pensandoFu = pensandoFu().filter(o => o !== p);
    const t = DUDAS_FU[p.q].t; S.entendidosFu = (S.entendidosFu || 0) + ENT_FU[t];
    const b = Math.round(tasa() * PREG_S_FU[t]); S.apr += b; S.aprTotal += b;
    if (silencioso) continue;
    fx.pops.push({ x: TUTOR_FU.x, y: TUTOR_FU.y - 0.7, txt: `❗ ${p.n} entendió · +${fmt(b)} 📖`, born: performance.now() });
    if (!S.vioEntiende) { S.vioEntiende = true; toast(`❗ <b>${p.n} entendió.</b> Volvió con su respuesta, y con el camino para llegar a ella: ahora la puede explicar. Cada uno que entiende hace que el valle aprenda más, las familias pagan más por él, y los que entendieron enseñan a los que estaban a medias.`, 13000); }
  }
  if (defensaFu()) { S.defensaT = (S.defensaT || 0) + dt; if (S.defensaT >= DEFENSA_CADA_FU) { S.defensaT = 0; defensaFuEvento(silencioso); } }
  if (bibliotecaFu() && (S.erroresFu || 0) > 0) { S.cotejoT = (S.cotejoT || 0) + dt; if (S.cotejoT >= 30) { S.cotejoT = 0; S.erroresFu--; S.revisadosFu = (S.revisadosFu || 0) + 1; } }   // la biblioteca coteja sola, de a una cada medio minuto
  if (!silencioso && typeof refrescarPregunta === 'function') refrescarPregunta(dt);
}
