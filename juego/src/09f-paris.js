/* ============================================================
   09f-paris
   Época 8 (París, 1120-1257, docs/era8-plan.md): la geometría del mundo que comparten el motor y Lumbre 3D (el Sena por
   el fondo del diorama con la isla de la Cité y Notre-Dame; la orilla izquierda, la de las escuelas, con la abadía de San Víctor y su claustro, la calle de la paja donde los estudiantes oyen la lección sentados en
   el suelo, la Montaña de Santa Genoveva donde Abelardo disputa y el colegio de la Sorbona; el taller del pergaminero junto
   al río) y los datos de la época: las horas de la campana y las cuestiones que se disputan. La época se juega en 3D.
   Orientación (la maqueta A de juego3d/bocetos/paris.html, «la orilla de las escuelas»): el Sena corre a lo largo de z por
   el borde del fondo izquierdo (x < 6,6) con la Cité larga al medio; la orilla de los mercaderes queda fuera del tablero y
   toda la orilla de enfrente es de las escuelas, con la Montaña al medio a la derecha y San Víctor en la esquina.
   ============================================================ */
const SENA_PA = { x0: 1.4, x1: 6.6 };                             // el río: una franja en x (corre a lo largo de z, río abajo hacia +z)
const CITE_PA = { x: 4.2, y: 8.1, rx: 1.4, ry: 5.6 };              // la isla de la Cité, larga en z (un rectángulo de esquinas redondas)
const NOTREDAME_PA = { x: 4.2, y: 6.05 };                          // la catedral (y su escuela): la fachada a +z, el flanco sur a +x
const ABADIA_PA = { x: 15.75, y: 3.6 };                            // San Víctor: la iglesia, el claustro y el canal, afuera de la muralla
const CAMPANA_PA = { x: 15.1, y: 6.75 };                           // el campanario de la abadía: se toca para cambiar el horario
const FOUARRE_PA = { x: 9.7, y: 11.6 };                            // la calle de la paja (rue du Fouarre): la lectio, sentados en el suelo
const MONTANA_PA = { x: 10.8, y: 9.7 };                            // al pie de la Montaña de Santa Genoveva: la disputa de Abelardo
const SORBONA_PA = { x: 11.75, y: 13.75 };                         // el colegio de Roberto de Sorbon (1257)
const UNIVERSIDAD_PA = { x: 9.05, y: 12.75 };                      // la sala de los maestros: donde se da la licencia
const PERGAMINERO_PA = { x: 7.6, y: 14.1 };                        // el taller del pergaminero, junto al río (el agua para remojar las pieles)
const PUENTES_PA = [{ z: 10.6, x0: 5.43, x1: 6.68 }, { z: 11.6, x0: 2.0, x1: 2.95 }];   // el Petit-Pont (a la orilla de las escuelas) y el Grand-Pont (a la de los mercaderes, fuera del tablero)
const LUGAR_ABELARDO_PA = { x: 12.75, y: 9.95 };                    // donde enseña Abelardo, en la Montaña
const ESPERA_ABELARDO_PA = { x: 7.75, y: 10.6 };                   // donde espera, al pie del Petit-Pont (pasado el Petit-Châtelet)
const HOGARES_PA = [[7.95, 9.9], [8.5, 9.95], [7.4, 11.55], [12.95, 12.35]];
function enSenaPa(x) { return x > SENA_PA.x0 && x < SENA_PA.x1; }
function enCitePa(x, y, m = 0) { const dx = (x - CITE_PA.x) / (CITE_PA.rx + m), dy = (y - CITE_PA.y) / (CITE_PA.ry + m); return dx * dx * dx * dx + dy * dy * dy * dy < 1; }
function enPuentePa(x, y) { return PUENTES_PA.some(p => Math.abs(y - p.z) < 0.22 && x > p.x0 - 0.05 && x < p.x1 + 0.05); }
function enAguaPa(x, y, m = 0) { return x > SENA_PA.x0 - m && x < SENA_PA.x1 + m && !enCitePa(x, y, -m) && !enPuentePa(x, y); }

/* LAS HORAS: el día del juego (150 s) se parte en cuatro tiempos, cada uno con su campana. `f0` es la fracción del ciclo
   donde empieza (el ciclo arranca al mediodía: la luz sube con la mañana y baja con la tarde). Los nombres, de las horas
   del oficio que se tocaban en cada tiempo. */
const TIEMPOS_PA = [
  { k: 'manana', n: 'la mañana', hora: 'prima', f0: 0.75, ic: '🌅' },
  { k: 'mediodia', n: 'el mediodía', hora: 'sexta', f0: 0.0, ic: '☀️' },
  { k: 'tarde', n: 'la tarde', hora: 'nona', f0: 0.25, ic: '🌇' },
  { k: 'noche', n: 'la noche', hora: 'completas', f0: 0.5, ic: '🌙' }
];
const TAREAS_PA = {
  leer: { n: 'leer', ic: '📖', dice: 'la lectio: el maestro lee y comenta, los estudiantes escuchan' },
  copiar: { n: 'copiar', ic: '✒️', dice: 'el scriptorium: se copian libros en pergamino' },
  disputar: { n: 'disputar', ic: '⚖️', dice: 'la disputatio: se discute una cuestión, a favor y en contra' },
  descansar: { n: 'descansar', ic: '🍷', dice: 'el descanso: la comida, el paseo, el sueño' }
};
/* las cuestiones que se disputan (de las que discutían de verdad las escuelas de París; la última, la de Abelardo) */
const CUESTIONES_PA = [
  '¿Se puede saber algo sin haberlo aprendido?', '¿Es mejor enseñar o aprender?', '¿Puede el maestro equivocarse?',
  '¿Hay que creer para entender, o entender para creer?', '¿Existen los universales, o solo las palabras?',
  '¿Aprende más el que lee o el que pregunta?', '¿Debe el estudiante pagar a su maestro?', '¿Es lícito dudar de las autoridades?',
  '¿Se aprende mejor de día o de noche?', '¿Tiene alma el lenguaje?', '«Dudando llegamos a preguntar; preguntando, a la verdad»: ¿tiene razón Abelardo?'
];
