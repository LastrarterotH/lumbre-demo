/* ============================================================
   09j-kaifeng
   Época 15 (China Song: Kaifeng hacia 1050-1120, docs/era15-plan.md; en el viaje va entre Bagdad y París: ORDEN_EPOCAS en
   01-balance): la geometría del mundo que comparten el motor y Lumbre 3D. El 3D la ESPEJARÁ en juego3d/src/kaifeng/lugares.js
   (cuando exista epoca15.js, avisará si no coinciden).
   ANCLAS PROVISIONALES (etapa 1a del motor, 2026-10-06): salen de la maqueta A de la hoja de bocetos
   (juego3d/src/kaifeng/maqueta.js, TABLEROS.muralla: «la pagoda junto a la muralla, el Bian por el medio»), la que
   recomienda Claude mientras el usuario no elige. Si la composición cambia, cambian aquí y en el espejo, nada más.
   La Pagoda de Hierro llena la esquina del fondo con su templo; la muralla corre por el borde de atrás (y ≈ 2,8), con la
   puerta y su torre a la derecha; el Bian cruza en diagonal con sus barcas y el Puente Arcoíris lo salta en el centro; la
   casa de té mira al río desde la orilla de atrás; del puente para adelante, la explanada de las escuelas, con las anclas
   de los seis saberes. Orientación (para la cámara, que mira desde +x +z): el fondo es la esquina de x + y chicas.
   1 = una baldosa.
   ============================================================ */
/* EL BIAN: los puntos de control de su eje y el ancho en cada uno; el cauce es el mismo Catmull-Rom uniforme del Tíber
   (suaveRo, en 09i-roma: 8 tramos entre cada par), y el agua es lo que queda a menos de medio ancho del eje */
const BIAN_CH = { pts: [[19.5, 5.4], [16.5, 6.9], [13.0, 8.8], [10.0, 10.4], [7.0, 11.9], [4.0, 13.4], [0.5, 15.0]], anchos: [2.6, 2.6, 2.5, 2.3, 2.5, 2.7, 2.7] };
const BIAN_SUAVE_CH = suaveRo(BIAN_CH.pts, BIAN_CH.anchos);
/* la distancia a la orilla del Bian: negativa adentro del cauce (el puente no cuenta aquí) */
function distBianCh(x, y) {
  const P = BIAN_SUAVE_CH.pts, A = BIAN_SUAVE_CH.anchos; let d = 1e9;
  for (let i = 0; i < P.length - 1; i++) {
    const ax = P[i][0], ay = P[i][1], vx = P[i + 1][0] - ax, vy = P[i + 1][1] - ay, L = vx * vx + vy * vy;
    const t = L ? Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / L)) : 0;
    d = Math.min(d, Math.hypot(x - ax - vx * t, y - ay - vy * t) - (A[i] + (A[i + 1] - A[i]) * t) / 2);
  }
  return d;
}
const HEROE_CH = { x: 5.7, y: 5.9 };                               // la Pagoda de Hierro (1049) con su templo, sin girar
const PAGODA_CH = { x0: 3.4, x1: 8.0, y0: 4.0, y1: 7.8 };          // la huella del templo de la pagoda: no se pisa
/* el Puente Arcoíris: un arco de madera sin pilares, perpendicular al río (n: su dirección, de la orilla de atrás a la del
   frente); caminable de punta a punta, con sus rampas */
const PUENTE_CH = { x: 10.0, y: 10.4, nx: 0.461, ny: 0.887, largo: 3.6, ancho: 0.5 };
const MURALLA_CH = { y: 2.8, x0: 2.0, x1: 18.0, grosor: 0.5 };     // la muralla de la ciudad interior, por el borde de atrás
const PUERTA_CH = { x: 12.5, y: 2.8, x0: 11.3, x1: 13.7 };        // la puerta con su torre: el único paso de la muralla
const CASA_TE_CH = { x: 14.49, y: 6.19 };                          // la casa de té de la orilla de atrás, mirando al río
/* la explanada de las escuelas, del puente para adelante (un polígono: sus vértices en orden) */
const EXPLANADA_CH = [[9.6, 13.2], [14.4, 11.0], [17.6, 9.8], [17.6, 17.6], [8.0, 17.6]];
/* las anclas de los seis saberes, en la explanada: la escuela de la prefectura junto al camino del puente, los clásicos
   impresos al medio, las dos salas de Hu Yuan a la derecha, el examen anónimo y el de palacio al frente, la academia a la
   izquierda, donde la explanada se abre hacia los sauces */
const PREFECTURA_CH = { x: 16.6, y: 11.0 };                        // la escuela de la prefectura, con su templo de Confucio
const IMPRESOS_CH = { x: 13.4, y: 12.6 };                          // el taller de las planchas: los clásicos impresos
const HUYUAN_CH = { x: 16.2, y: 14.3 };                            // las dos salas de Hu Yuan
const ANONIMO_CH = { x: 12.7, y: 15.6 };                           // el recinto del examen, con sus celdas
const ACADEMIA_CH = { x: 9.2, y: 15.4 };                           // la academia (la shuyuan)
const PALACIO_CH = { x: 15.3, y: 17.0 };                           // el examen de palacio: la lista de los aprobados
const HORNO_TINTA_CH = { x: 9.3, y: 4.4 };                         // el horno de hollín, junto a los pinos al pie de la muralla: donde nace la tinta
const ESPERA_ZHUXI_CH = { x: 12.3, y: 4.2 };                       // Zhu Xi llega por la puerta de la ciudad (como recuerdo: es posterior)
const LUGAR_ZHUXI_CH = { x: 10.3, y: 15.9 };                       // donde enseña, recibido: junto a la academia
const TEMPLO_TAO_CH = { x: 2.9, y: 17.1 };                         // el templo taoísta del otro lado del Bian, detrás de los sauces (el secreto)
/* las puertas de las tiendas de la orilla de atrás (la casa de los Liu, la botica del doctor Zhao, la taberna del vino nuevo)
   y de la casa de té: adonde se va de noche (las casas las pone el 3D) */
const HOGARES_CH = [[10.4, 4.95], [14.6, 4.85], [16.35, 4.6], [14.68, 6.54]];
function enPuenteCh(x, y) {
  const dx = x - PUENTE_CH.x, dy = y - PUENTE_CH.y, a = dx * PUENTE_CH.nx + dy * PUENTE_CH.ny, b = -dx * PUENTE_CH.ny + dy * PUENTE_CH.nx;
  return Math.abs(a) < PUENTE_CH.largo / 2 && Math.abs(b) < PUENTE_CH.ancho / 2;
}
function enBianCh(x, y) { return distBianCh(x, y) < 0 && !enPuenteCh(x, y); }
function enAguaCh(x, y, m = 0) { return distBianCh(x, y) < m && !enPuenteCh(x, y); }
function enPagodaCh(x, y, m = 0) { return x > PAGODA_CH.x0 - m && x < PAGODA_CH.x1 + m && y > PAGODA_CH.y0 - m && y < PAGODA_CH.y1 + m; }
function enMurallaCh(x, y, m = 0) { return Math.abs(y - MURALLA_CH.y) < MURALLA_CH.grosor / 2 + m && !(x > PUERTA_CH.x0 && x < PUERTA_CH.x1); }
function enExplanadaCh(x, y) {
  let c = false; const P = EXPLANADA_CH;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const [xi, yi] = P[i], [xj, yj] = P[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c; }
  return c;
}
/* EL GESTO (era15-plan, etapa 1b; balance de la etapa 2, docs/balance-epoca15.md): PREPARAR A LOS CANDIDATOS. Las reglas
   viven en 14-reglas (el bloque de China, al final); aquí, sus datos, como SALAS_RO y NINOS_RO en 09i-roma.
   LAS TRES MANERAS DE PREPARARSE. `dur`: segundos de juego para estar listo (el avance p va de 0 a 1); `nota`: con cuánto
   llega al examen (más el talento de cada uno; la prefectura pide 0,5 y la capital 0,7); `tec`: el saber que la abre (las
   dos salas de Hu Yuan abren a la vez la de los asuntos y la de los clásicos, donde se estudia para entender); lo que deja
   el que APRUEBA (funcionario): `sue` (lo que manda a casa, en 🏺 por segundo, mientras gobierna: su sueldo), `rep`
   (renombre, en fracciones que se juntan) y `gob` (cómo gobierna: la ciudad aprende esa fracción más, con tope); lo que
   deja el que REPRUEBA (maestro de aldea): `atiende` (los aprendices a medias que atiende su escuela; uno más si aprobó la
   prefectura) y `sueAldea` (el de los asuntos cobra, además, por medir los campos de la aldea).
   ⚖️ La memoria es el atajo del examen: rápida, y con la nota justa para que hasta el flojo (★) apruebe la capital; pero el
   que aprueba así manda poco a casa y gobierna como recita. El que estudia para entender tarda más y aprueba menos (el flojo
   no llega), pero el que aprueba manda a casa más del triple y gobierna mejor. Por eso conviene a cada uno lo suyo: el
   talentoso a entender, el flojo de memoria, y el que igual va a reprobar, los asuntos (la aldea le paga). Zhu Xi lo
   cambia: leer despacio no tarda más que recitar, y el que entiende aprueba igual. */
const MODOS_CH = {
  memoria: { k: 'memoria', n: 'De memoria', ic: '📜', que: 'los clásicos y sus comentarios, recitados hasta saberlos', dur: 80, nota: 0.7, tec: 81, sue: 3.6, rep: 0.25, gob: 0.01, atiende: 0, sueAldea: 0 },
  asuntos: { k: 'asuntos', n: 'Los asuntos', ic: '🧭', que: 'el agua, la aritmética y la defensa: la sala de Hu Yuan', dur: 100, nota: 0.5, tec: 83, sue: 5, rep: 0.25, gob: 0.01, atiende: 0, sueAldea: 1.5 },
  entender: { k: 'entender', n: 'Para entender', ic: '⛰️', que: 'el sentido de los clásicos, despacio: la otra sala de Hu Yuan (y la academia)', dur: 100, nota: 0.55, tec: 83, sue: 9.8, rep: 1, gob: 0.03, atiende: 0, sueAldea: 0 }
};
const ORDEN_MODOS_CH = ['memoria', 'asuntos', 'entender'];
/* los candidatos que llegan a la escuela de la prefectura (nombres de los Song; ninguno es un personaje real). Las mujeres
   no podían presentarse: ⚖️ Li Qingzhao lo dice la primera vez. El talento y el origen (de la ciudad o de una aldea) los
   pone la regla al llegar, siempre iguales para el mismo número de llegada (el bot y el jugador ven lo mismo). */
const CANDIDATOS_CH = ['Zhang Ji', 'Li Heng', 'Wang Shu', 'Chen Mu', 'Liu Gong', 'Zhao Qian', 'Sun Zhi', 'Zhou Bo', 'Wu Tan', 'Huang Lin',
  'Lin Chu', 'Xu Guang', 'He Shen', 'Gao Ming', 'Lü Ning', 'Fan Yi', 'Cai Ru', 'Song Lian', 'Ma Yuan', 'Tang Jie', 'Han Du', 'Peng Shi'];
const TALENTOS_CH = [0, 0.15, 0.15, 0, 0.3, 0.15, 0, 0.3, 0.15, 0];   // ★, ★★ y ★★★ (cuatro, cuatro y dos de cada diez), por el número de llegada
