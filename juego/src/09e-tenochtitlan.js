/* ============================================================
   09e-tenochtitlan
   Época 7 (Tenochtitlan, docs/era7-plan.md): la geometría del mundo que comparten el motor y Lumbre 3D (la isla en el
   lago de Texcoco con sus calpullis, el recinto sagrado con el Templo Mayor, el calmécac, la cuicacalli y el telpochcalli
   del barrio; el embarcadero del tributo, las chinampas, las tres calzadas y los volcanes del fondo) y los datos de la
   época: los veinte signos de los días y los nombres de los niños que nacen. La época se juega en 3D: aquí no hay dibujos
   2D, solo los lugares.
   Orientación (para la cámara; la maqueta A de juego3d/bocetos/tenochtitlan.html): la isla llena el tablero y el lago es su
   borde; los volcanes, Popocatépetl e Iztaccíhuatl, quedan en el rincón del fondo (x y z chicas), sobre la tierra firme; el
   recinto, al fondo; un canal cruza la ciudad; las chinampas, en los dos flancos; el barrio de las escuelas, al frente; el
   embarcadero mira al frente a la derecha, por donde llegan las canoas. Tlatelolco ya no es un islote aparte.
   ============================================================ */
const ISLA_TE = { x0: 4.3, x1: 16.9, y0: 4.3, y1: 16.9, r: 1.35 };   // la isla entera: un rectángulo de esquinas redondeadas que llena el tablero
const POPO_TE = { x: 5.7, y: 2.15, r: 2.45 };                     // el pie del Popocatépetl: la isla le deja su bahía
const RECINTO_TE = { x0: 4.75, x1: 12.45, y0: 4.75, y1: 11.25 };  // el recinto sagrado, al fondo, con su muro de serpientes (el coatepantli)
const TEMPLO_TE = { x: 7.6, y: 8.0 };                            // el Templo Mayor: Huitzilopochtli y Tláloc en lo alto, mira al poniente (+x)
const CALMECAC_TE = { x: 12.9, y: 10.4 };                        // la clase del calmécac, afuera del muro poniente del recinto (la casa está adentro)
const CUICACALLI_TE = { x: 12.15, y: 14.55 };                   // la casa del canto, en la plaza del barrio de las escuelas
const TELPO_TE = { x: 15.5, y: 10.3 };                           // el telpochcalli, al pie del teocalli del barrio
const TELPO2_TE = { x: 13.15, y: 6.1 };                          // el del calpulli de las chinampas del sur (la etapa 3: uno por barrio)
const EMBARCADERO_TE = { x: 17.2, y: 9.3 };                      // donde las canoas del tributo dejan el amate
const PALABRA_TE = { x: 13.2, y: 13.0 };                         // donde el anciano dice la palabra antigua a los jóvenes, en la plaza
const PARTERA_TE = { x: 16.1, y: 13.5 };                         // la casa de la partera: aquí se presentan los recién nacidos
const LUGAR_NEZA_TE = { x: 12.65, y: 15.6 };                     // donde enseña Nezahualcóyotl, junto a la casa del canto
const ESPERA_NEZA_TE = { x: 17.1, y: 9.3 };                      // donde espera, en el muelle, recién bajado de su canoa
const CHINAMPAS_TE = { x0: 4.45, x1: 7.45, y0: 12.35, y1: 16.75 };    // las huertas flotantes del flanco norte (franjas a lo largo de x)
const CHINAMPAS2_TE = { x0: 12.85, x1: 16.75, y0: 4.55, y1: 7.45 };  // y las del flanco sur (franjas a lo largo de y)
const CANAL_TE = { y: 12.15, a: 0.16, x1: 16.3 };                // el canal que cruza la ciudad (no se camina: dos puentes; al oriente acaba antes del lago y deja el paso de la orilla)
const PUENTES_TE = [{ x: 8.6, y: 12.15, w: 0.6 }, { x: 13.9, y: 12.15, w: 0.7 }];
const CALZADAS_TE = [                                            // las tres calzadas, por el lago: al frente (Tepeyac), a la derecha (Tlacopan, con el acueducto) y al fondo (Iztapalapa)
  { x0: 8.38, x1: 8.82, y0: 16.5, y1: 18.0 },
  { x0: 16.5, x1: 18.0, y0: 7.78, y1: 8.22 },
  { x0: 8.38, x1: 8.82, y0: 2.9, y1: 4.7 },
];
const HOGARES_TE = [[15.47, 16.1], [10.2, 15.3], [14.75, 5.75], [13.6, 15.02]];   // las casas donde nacen los niños (una por barrio)
function enIslaTe(x, y, m = 0) {
  const r = ISLA_TE.r, cx = Math.max(ISLA_TE.x0 + r, Math.min(ISLA_TE.x1 - r, x)), cy = Math.max(ISLA_TE.y0 + r, Math.min(ISLA_TE.y1 - r, y));
  return Math.hypot(x - cx, y - cy) < r + m && Math.hypot(x - POPO_TE.x, y - POPO_TE.y) > POPO_TE.r + 0.85 - m;
}
function enCalzadaTe(x, y, m = 0) { return CALZADAS_TE.some(c => x > c.x0 - m && x < c.x1 + m && y > c.y0 - m && y < c.y1 + m); }
function franjaTe(x, y) {                                        // 1: tierra de chinampa, 2: su canal, 0: fuera de las chinampas
  const a = CHINAMPAS_TE, b = CHINAMPAS2_TE;
  if (x > a.x0 && x < a.x1 && y > a.y0 && y < a.y1) return (y - a.y0) % 0.8 < 0.56 ? 1 : 2;
  if (x > b.x0 && x < b.x1 && y > b.y0 && y < b.y1) return (x - b.x0) % 0.8 < 0.56 ? 1 : 2;
  return 0;
}
function enChinampaTe(x, y) { return franjaTe(x, y) === 1 && enIslaTe(x, y); }
function enCanalTe(x, y, m = 0) { return (Math.abs(y - CANAL_TE.y) < CANAL_TE.a + m && x < CANAL_TE.x1 + m) || franjaTe(x, y) === 2; }
function enPuenteTe(x, y) { return PUENTES_TE.some(p => Math.abs(x - p.x) < p.w / 2 && Math.abs(y - p.y) < 0.3); }
function enOrillaTe(x, y) { return x < 3.3 || y < 3.2 || Math.hypot(x - POPO_TE.x, y - POPO_TE.y) < POPO_TE.r + 0.2 || (x < 4.0 && y > 4.4 && y < 14.0); }   // la tierra firme del fondo, al pie de los volcanes
function enLagoTe(x, y, m = 0) { return (!enIslaTe(x, y, -m) && !enCalzadaTe(x, y, -m) && !enOrillaTe(x, y)) || (enIslaTe(x, y) && enCanalTe(x, y, m)); }

/* LOS VEINTE SIGNOS DE LOS DÍAS (el tonalpohualli: 20 signos × 13 números = 260 días). `e` es la escuela a la que el
   signo inclina en el juego (⚖️ simplificado: los libros de los destinos dicen buena o mala fortuna para oficios y
   caminos; aquí se resume en dos inclinaciones): 'c' el calmécac (los signos de la palabra, el agua y el saber), 't' el
   telpochcalli (los del trabajo y la guerra), '' ninguna. */
const SIGNOS_TE = [
  { n: 'Cipactli', es: 'Lagarto', ic: '🐊', e: 'c' }, { n: 'Ehécatl', es: 'Viento', ic: '🌬️', e: 'c' }, { n: 'Calli', es: 'Casa', ic: '🏠', e: 't' },
  { n: 'Cuetzpalin', es: 'Lagartija', ic: '🦎', e: 't' }, { n: 'Cóatl', es: 'Serpiente', ic: '🐍', e: '' }, { n: 'Miquiztli', es: 'Muerte', ic: '💀', e: '' },
  { n: 'Mázatl', es: 'Venado', ic: '🦌', e: 't' }, { n: 'Tochtli', es: 'Conejo', ic: '🐇', e: 't' }, { n: 'Atl', es: 'Agua', ic: '💧', e: 'c' },
  { n: 'Itzcuintli', es: 'Perro', ic: '🐕', e: '' }, { n: 'Ozomatli', es: 'Mono', ic: '🐒', e: 'c' }, { n: 'Malinalli', es: 'Hierba', ic: '🌿', e: 't' },
  { n: 'Ácatl', es: 'Caña', ic: '🎋', e: 'c' }, { n: 'Océlotl', es: 'Jaguar', ic: '🐆', e: 't' }, { n: 'Cuauhtli', es: 'Águila', ic: '🦅', e: 't' },
  { n: 'Cozcacuauhtli', es: 'Zopilote', ic: '🪶', e: 'c' }, { n: 'Ollin', es: 'Movimiento', ic: '🌀', e: '' }, { n: 'Técpatl', es: 'Pedernal', ic: '🔪', e: 't' },
  { n: 'Quiáhuitl', es: 'Lluvia', ic: '🌧️', e: 'c' }, { n: 'Xóchitl', es: 'Flor', ic: '🌺', e: 'c' }
];
/* los nombres de los que nacen: nombres nahuas atestiguados en las crónicas y los códices (de señores, señoras y gente común;
   muchos niños llevaban además el nombre de su día, como «Ce Ácatl», Uno Caña) */
const NINOS_TE = [
  { n: 'Cuauhtli', g: 'o' }, { n: 'Citlalin', g: 'a' }, { n: 'Tochtli', g: 'o' }, { n: 'Xóchitl', g: 'a' }, { n: 'Ocelotl', g: 'o' }, { n: 'Atotoztli', g: 'a' },
  { n: 'Mázatl', g: 'o' }, { n: 'Ayauhcíhuatl', g: 'a' }, { n: 'Coyotl', g: 'o' }, { n: 'Tecuichpo', g: 'a' }, { n: 'Itzcóatl', g: 'o' }, { n: 'Quiauhxóchitl', g: 'a' },
  { n: 'Chimalpopoca', g: 'o' }, { n: 'Miahuaxíhuitl', g: 'a' }, { n: 'Cuitláhuac', g: 'o' }, { n: 'Tlacaélel', g: 'o' }
];
