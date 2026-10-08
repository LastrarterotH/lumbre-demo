/* ============================================================
   09k-futuro
   La última época del viaje (id 21, docs/era21-plan.md: hoy y lo que viene, en EL VALLE DEL PRINCIPIO, el mismo de la
   Época 1; en el viaje va después de Ámsterdam: ORDEN_EPOCAS en 01-balance). La geometría del mundo que comparten el
   motor y Lumbre 3D: el 3D la espeja en juego3d/src/futuro/lugares.js (el tablero elegido, «BACA»: la escuela en anillo
   alrededor del círculo de piedras del fogón, la chispa azul, las casas redondas de tierra y el valle de siempre).
   El fogón, la cueva y la laguna están donde estaban en la Época 1 (FOGON, CUEVA, LAGUNA en 10-recorridos y 18-fx).
   Orientación (para la cámara, que mira desde +x +z): el fondo es la esquina de x + y chicas. 1 = una baldosa.
   ============================================================ */
/* LAS ANCLAS DE LOS SEIS SABERES (87-92). Cada pieza deja libre el arco de adelante (+x +y): ahí está su gente */
const ESCUELA_FU = { x: 6.5, y: 9.5 };          // 87 · la escuela del valle: el anillo alrededor del círculo de piedras del fogón
const TUTOR_FU = { x: 11.3, y: 13.0 };          // 88 · el tutor que pregunta: el claro de las preguntas
const LLEGADA_FU = { x: 8.4, y: 15.9 };         // 89 · la traducción al instante: la parada donde llegan los de lejos
const BIBLIOTECA_FU = { x: 12.6, y: 8.0 };      // 90 · la biblioteca que responde: el pabellón de la cueva
const EXAMEN_FU = { x: 15.2, y: 5.6 };          // 91 · el examen que cambia: las gradas de la defensa
const MIRADOR_FU = { x: 3.6, y: 3.6 };          // 92 · la pregunta abierta: el mirador, mirando la niebla
const ESCUELA_R_FU = 2.3, ESCUELA_RI_FU = 1.45; // los radios del anillo (afuera y el patio)
const PATIO_FU = { x: 6.5, y: 9.5, r: 1.3 };    // el patio de la escuela, donde se juntan los que preguntan
const ESPERA_BLOOM_FU = { x: 8.4, y: 15.3 };    // Benjamin Bloom llega por la parada, como llegan los de lejos (como recuerdo: es de 1984)
const LUGAR_BLOOM_FU = { x: 10.4, y: 12.4 };    // donde se queda, recibido: junto al claro de las preguntas
const ABUELA_FU = { x: 6.0, y: 9.1 };           // la Abuela, que vuelve al fogón al final
const CUEVA_FU = { x: 9.9, y: 5.4 };            // la cueva pintada (la misma de la Época 1): el secreto, de noche
/* la niebla de los bordes: lo que todavía no sabemos. No se camina (el 3D la dibuja; el motor solo sabe que ahí no hay nada) */
function enNieblaFu(x, y) { return x < 2.6 || y < 2.6 || (x < 4.2 && y < 4.2 && Math.hypot(x - 2, y - 2) < 2.0); }
/* la atención (el material de la época) se junta en los lugares tranquilos: la orilla de la laguna, bajo los árboles grandes,
   a la entrada de la cueva. Lejos de las pantallas */
const QUIETOS_FU = [[13.6, 13.3, 0.35], [12.9, 15.6, 0.3], [3.4, 11.8, 0.32], [16.4, 11.8, 0.3], [8.9, 7.4, 0.28], [15.2, 3.6, 0.3]];

/* EL GESTO (era21-plan): LA RESPUESTA O LA PREGUNTA. Las reglas viven en 14-reglas (el bloque del futuro, al final); aquí,
   sus datos. Cada estudiante llega a la escuela con su problema. Hay dos clases de problema:
   - `dato`: cuánto mide, cuándo fue, cómo se escribe. Que la IA responda está bien: es buscar.
   - `porque`: por qué pasa, cómo se hace, qué pasaría si. Responderlo no enseña: el que pregunta tiene que pensarlo.
   La elección (el modal táctil #pregunta de jugar.html): QUE RESPONDA (al instante; el estudiante entrega la tarea y queda
   a medias; un porqué respondido, a veces, viene con una respuesta inventada) o QUE PREGUNTE, como un tutor (cuesta un poco
   de atención y tarda: el estudiante camina pensando y vuelve con su «!»: entendió, y después enseña). */
const DUDAS_FU = [
  { t: 'dato', q: '¿Cuánto mide la Luna?' }, { t: 'porque', q: '¿Por qué el cielo es azul?' },
  { t: 'dato', q: '¿Cuándo pintaron la cueva?' }, { t: 'porque', q: '¿Por qué flota un barco de hierro?' },
  { t: 'dato', q: '¿Cómo se dice «agua» en náhuatl?' }, { t: 'porque', q: '¿Por qué hay estaciones?' },
  { t: 'dato', q: '¿Cuántos huesos tiene la mano?' }, { t: 'porque', q: '¿Por qué la laguna se congela por arriba y no por abajo?' },
  { t: 'dato', q: '¿Qué altura tiene la pagoda de Kaifeng?' }, { t: 'porque', q: '¿Por qué una fracción más chica tiene el número más grande abajo?' },
  { t: 'dato', q: '¿En qué año se imprimió el Orbis Pictus?' }, { t: 'porque', q: '¿Cómo se mide la Tierra con la sombra de un palo?' },
  { t: 'dato', q: '¿Cuál es la capital de Mongolia?' }, { t: 'porque', q: '¿Por qué la sal se disuelve en el agua y el aceite no?' },
  { t: 'dato', q: '¿Cuántas patas tiene una araña?' }, { t: 'porque', q: '¿Por qué los mamuts se extinguieron?' },
];
/* los estudiantes del valle y los que llegan de lejos (nombres de hoy, de muchas partes; ninguno es una persona real) */
const ESTUDIANTES_FU = ['Ana', 'Tomás', 'Aiyana', 'Mateo', 'Lucía', 'Kenji', 'Valentina', 'Amaru', 'Sofía', 'Diego', 'Nia', 'Ignacio',
  'Mei', 'Joaquín', 'Inti', 'Camila', 'Yusuf', 'Martina', 'Ayelén', 'Bruno', 'Fátima', 'Lautaro', 'Saanvi', 'Emilia'];
const LEJOS_FU = ['Amadou', 'Oksana', 'Rahim', 'Thi Lan', 'Kwame', 'Aisha', 'Mehmet', 'Ngozi'];   // los que llegan de lejos, con su lengua (la traducción al instante)
