/* ============================================================
   09i-roma
   Época 14 (Roma, 70-117 d. C., docs/era14-plan.md; en el viaje va entre Alejandría y Bagdad: ORDEN_EPOCAS en
   01-balance): la geometría del mundo que comparten el motor y Lumbre 3D, y los datos de la época (las tres escuelas y
   los nombres de los niños). El 3D la ESPEJA en juego3d/src/roma/lugares.js (epoca14.js avisa si no coinciden).
   LA COMPOSICIÓN es la elegida por el usuario en la hoja juego3d/bocetos/roma.html (AAAA, 2026-10-05; la maqueta A,
   «el Foro al fondo, el Tíber a la izquierda», en juego3d/src/roma/maqueta.js): el héroe es el Foro Romano mirando al
   Capitolio, que llena la esquina del fondo con Júpiter de techo dorado en su cumbre; la basílica Julia a la izquierda
   de la plaza, donde pleitea el rétor; el Tíber corre por el borde izquierdo (x chicas) y se abre en dos brazos
   alrededor de la isla Tiberina, con el puente Fabricio a la orilla; detrás a la derecha, las ínsulas de la Subura; la
   mitad del frente queda libre para las escuelas, en un arco que va del ludus (lejos) al rétor (junto a la basílica).
   Orientación (para la cámara, que mira desde +x +z): el fondo es la esquina de x + y chicas. 1 = una baldosa (20 m).
   ============================================================ */
/* EL TÍBER: los puntos de control de su eje y el ancho en cada uno; el cauce es un Catmull-Rom uniforme por esos puntos
   (8 tramos entre cada par), y el agua es lo que queda a menos de medio ancho del eje */
const TIBER_RO = { pts: [[3.0, 0.5], [3.05, 6.0], [3.3, 10.5], [3.8, 13.6], [3.9, 16.0], [3.6, 19.5]], anchos: [2.2, 2.2, 2.4, 3.8, 4.4, 3.6] };
function suaveRo(pts, anchos, n = 8) {
  const out = [], aw = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t, f = (a, b, c, d) => 0.5 * (2 * b + (c - a) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (3 * b - a - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]); aw.push(anchos[i] + (anchos[i + 1] - anchos[i]) * t);
    }
  }
  out.push(pts[pts.length - 1]); aw.push(anchos[anchos.length - 1]);
  return { pts: out, anchos: aw };
}
const TIBER_SUAVE_RO = suaveRo(TIBER_RO.pts, TIBER_RO.anchos);
/* la distancia a la orilla del Tíber: negativa adentro del cauce (la isla y el puente no cuentan aquí) */
function distTiberRo(x, y) {
  const P = TIBER_SUAVE_RO.pts, A = TIBER_SUAVE_RO.anchos; let d = 1e9;
  for (let i = 0; i < P.length - 1; i++) {
    const ax = P[i][0], ay = P[i][1], vx = P[i + 1][0] - ax, vy = P[i + 1][1] - ay, L = vx * vx + vy * vy;
    const t = L ? Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / L)) : 0;
    d = Math.min(d, Math.hypot(x - ax - vx * t, y - ay - vy * t) - (A[i] + (A[i + 1] - A[i]) * t) / 2);
  }
  return d;
}
const ISLA_RO = { x: 3.6, y: 15.45, rx: 0.86, ry: 2.38 };          // la isla Tiberina: la larga a lo largo del río, la proa río abajo
const PUENTE_RO = { y: 15.7, x0: 3.9, x1: 6.65, ancho: 0.42 };    // el puente Fabricio (62 a. C., sigue en pie): de la isla a la orilla, a lo largo de x
const CAPITOLIO_RO = { x0: 4.4, x1: 13.45, y0: 2.1, y1: 5.75, x: 6.85, y: 4.18 };   // la colina (viene con el héroe) y Júpiter en su cumbre del sur
const HEROE_RO = { x: 9.6, y: 9.7 };                               // el Foro Romano entero (roma/monumentos.foroRomano), sin girar
const FORO_RO = { x: 10.2, y: 10.4, r: 1.3 };                      // la plaza del Foro, entre la basílica, la Curia y las estatuas
const BASILICA_RO = { x: 6.98, y: 10.65, w: 2.81, d: 5.41 };       // la basílica Julia (101 × 49 m), con sus gradas: donde se pleitea
const GRADAS_BASILICA_RO = { x: 7.45, y: 13.68 };                  // su escalinata del sur: por aquí entra el orador a su primer caso
const SATURNO_RO = { x: 7.24, y: 6.85 };                           // el templo de Saturno, con el erario: el dinero del Estado
const CURIA_RO = { x: 11.45, y: 7.35 };                            // la Curia, donde se reúne el Senado
/* las anclas de los seis saberes, en la mitad del frente: el arco de las tres escuelas va del ludus, lejos, al rétor, al
   pie de la basílica; los calculi junto al ludus, la escuela pagada en el camino del este y la Institutio al medio */
const LUDUS_RO = { x: 15.3, y: 15.8 };                             // el ludus del litterator, bajo la pérgola
const CALCULI_RO = { x: 16.5, y: 13.2 };                           // la mesa del ábaco
const GRAMMATICUS_RO = { x: 12.6, y: 15.9 };                       // la escuela del grammaticus, bajo el pórtico
const RHETOR_RO = { x: 9.0, y: 16.6 };                             // la escuela del rétor, camino de la basílica
const PAGADA_RO = { x: 16.0, y: 10.6 };                            // la escuela pagada (Vespasiano a los rétores; Plinio en Como)
const INSTITUTIO_RO = { x: 13.4, y: 12.4 };                        // los doce libros de la Institutio Oratoria
const ORILLA_RO = { x: 6.55, y: 16.7 };                            // la playa de guijarros, río abajo del puente: donde nacen los calculi
const ESPERA_QUINTILIANO_RO = { x: 17.0, y: 8.8 };                 // Quintiliano llega de Hispania por el camino del este
const LUGAR_QUINTILIANO_RO = { x: 11.0, y: 14.6 };                 // donde enseña, recibido: entre la Institutio y la escuela del rétor
const MITREO_RO = { x: 14.95, y: 6.4 };                            // la bajada al mitreo, junto a una ínsula de la Subura (el secreto)
/* las puertas de las ínsulas de la Subura y de la domus junto al río: adonde se va de noche (las casas las pone el 3D) */
const HOGARES_RO = [[15.0, 4.3], [16.5, 4.6], [14.4, 6.2], [16.4, 7.05], [7.6, 16.15]];   // las puertas
function enIslaRo(x, y, m = 0) { return ((x - ISLA_RO.x) / (ISLA_RO.rx + m)) ** 2 + ((y - ISLA_RO.y) / (ISLA_RO.ry + m)) ** 2 < 1; }
function enPuenteRo(x, y) { return Math.abs(y - PUENTE_RO.y) < PUENTE_RO.ancho / 2 && x > PUENTE_RO.x0 && x < PUENTE_RO.x1; }
function enTiberRo(x, y) { return distTiberRo(x, y) < 0 && !enIslaRo(x, y) && !enPuenteRo(x, y); }
function enColinaRo(x, y, m = 0) { return x > CAPITOLIO_RO.x0 - m && x < CAPITOLIO_RO.x1 + m && y > CAPITOLIO_RO.y0 - m && y < CAPITOLIO_RO.y1 + m; }
function enAguaRo(x, y, m = 0) { return distTiberRo(x, y) < m && !enIslaRo(x, y, -m) && !enPuenteRo(x, y); }
/* LAS TRES ESCUELAS (el gesto, era14-plan): una detrás de otra, el origen de la primaria, la secundaria y la superior.
   `dur`: segundos de juego para aprender lo de esa escuela (el avance p va de 0 a 1); `cupo`: cuántos caben (más con
   las etapas de su saber y con la escuela pagada); `tec`: el saber que la abre; `fee`: lo que pagan los padres por
   cada alumno en los idus, en la proporción del Edicto de Precios de Diocleciano (301 d. C.: 50, 200 y 250 denarios al
   mes). El ludus es el más largo (aprender a leer, escribir y contar tomaba años) y es el cuello de la fila: con el juego,
   antes de Quintiliano, no alcanza a llenar las escuelas de arriba (docs/balance-epoca14.md). */
const SALAS_RO = [
  { k: 'ludus', n: 'El ludus', quien: 'el litterator', edad: 'de 7 a 11 años', que: 'leer, escribir y contar', ic: '🪔', dur: 240, cupo: 6, tec: 75, fee: 1, lugar: LUDUS_RO },
  { k: 'grammaticus', n: 'El grammaticus', quien: 'el grammaticus', edad: 'de 11 a 15', que: 'Homero y Virgilio', ic: '📜', dur: 60, cupo: 5, tec: 77, fee: 4, lugar: GRAMMATICUS_RO },
  { k: 'rhetor', n: 'El rétor', quien: 'el rhetor', edad: 'desde los 15', que: 'hablar en público', ic: '🗣️', dur: 60, cupo: 3, tec: 78, fee: 5, lugar: RHETOR_RO }
];
/* los niños que trae el pedagogo (nombres latinos de verdad: el praenomen de los varones y el nombre de familia de las
   niñas, que es como se llamaban). Las niñas iban al ludus y a veces al grammaticus; a la escuela del rétor, no. */
const NINOS_RO = [
  { n: 'Marco', g: 'o' }, { n: 'Julia', g: 'a' }, { n: 'Lucio', g: 'o' }, { n: 'Cayo', g: 'o' }, { n: 'Cornelia', g: 'a' }, { n: 'Publio', g: 'o' },
  { n: 'Quinto', g: 'o' }, { n: 'Tulia', g: 'a' }, { n: 'Tito', g: 'o' }, { n: 'Sexto', g: 'o' }, { n: 'Claudia', g: 'a' }, { n: 'Aulo', g: 'o' },
  { n: 'Décimo', g: 'o' }, { n: 'Livia', g: 'a' }, { n: 'Gneo', g: 'o' }, { n: 'Servio', g: 'o' }, { n: 'Valeria', g: 'a' }, { n: 'Espurio', g: 'o' }
];
