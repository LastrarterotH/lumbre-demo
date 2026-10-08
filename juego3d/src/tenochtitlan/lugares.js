/* ============================================================
   tenochtitlan/lugares
   La geometría de Tenochtitlan que el 3D necesita sin depender del motor cargado (el laboratorio de etapas, juego3d/qa.html,
   arma las piezas sin el motor). Es el ESPEJO de juego/src/09e-tenochtitlan.js: si se mueve algo aquí, se mueve allá
   (epoca7.js avisa en la consola si no coinciden).
   LA ISLA ENTERA (la maqueta A de juego3d/bocetos/tenochtitlan.html, elegida el 2026-10-04): la isla llena el tablero y el
   lago es su borde; el recinto al fondo, con las calzadas que salen de sus puertas; un canal cruza la ciudad; las chinampas
   en los dos flancos; el barrio de las escuelas al frente. La brújula es la verdadera: el poniente es +x (el Templo Mayor
   mira al poniente, a la cámara), el norte +z; los volcanes, al sureste, quedan en la esquina del fondo.
   ============================================================ */
export const ISLA = { x0: 4.3, x1: 16.9, y0: 4.3, y1: 16.9, r: 1.35 };   // un rectángulo de esquinas redondeadas
export const POPO = { x: 5.7, y: 2.15, r: 2.45 };                     // el pie del Popocatépetl: la isla le deja su bahía
export const RECINTO = { x0: 4.75, x1: 12.45, y0: 4.75, y1: 11.25 };
export const TEMPLO = { x: 7.6, y: 8.0 };
export const CALMECAC = { x: 12.9, y: 10.4 };      // la clase del calmécac, afuera del muro poniente (la casa está adentro)
export const CUICACALLI = { x: 12.15, y: 14.55 };
export const TELPO = { x: 15.5, y: 10.3 };
export const TELPO2 = { x: 13.15, y: 6.1 };        // el de las chinampas del sur (la etapa 3: uno por barrio)
export const EMBARCADERO = { x: 17.2, y: 9.3 };
export const PALABRA = { x: 13.2, y: 13.0 };
export const PARTERA = { x: 16.1, y: 13.5 };
export const LUGAR_NEZA = { x: 12.65, y: 15.6 };
export const ESPERA_NEZA = { x: 17.1, y: 9.3 };    // en el muelle, recién bajado de su canoa
export const CHINAMPAS = { x0: 4.45, x1: 7.45, y0: 12.35, y1: 16.75 };    // el flanco del norte: franjas a lo largo de x
export const CHINAMPAS2 = { x0: 12.85, x1: 16.75, y0: 4.55, y1: 7.45 };  // el del sur: franjas a lo largo de y
export const CANAL = { y: 12.15, a: 0.16, x1: 16.3 };   // acaba antes del lago: deja el paso de la orilla
export const PUENTES = [{ x: 8.6, y: 12.15, w: 0.6 }, { x: 13.9, y: 12.15, w: 0.7 }];
export const CALZADAS = [{ x0: 8.38, x1: 8.82, y0: 16.5, y1: 18.0 }, { x0: 16.5, x1: 18.0, y0: 7.78, y1: 8.22 }, { x0: 8.38, x1: 8.82, y0: 2.9, y1: 4.7 }];
export const HOGARES = [[15.47, 16.1], [10.2, 15.3], [14.75, 5.75], [13.6, 15.02]];
export const enIsla = (x, y, m = 0) => {
  const r = ISLA.r, cx = Math.max(ISLA.x0 + r, Math.min(ISLA.x1 - r, x)), cy = Math.max(ISLA.y0 + r, Math.min(ISLA.y1 - r, y));
  return Math.hypot(x - cx, y - cy) < r + m && Math.hypot(x - POPO.x, y - POPO.y) > POPO.r + 0.85 - m;
};
export const enCalzada = (x, y, m = 0) => CALZADAS.some(c => x > c.x0 - m && x < c.x1 + m && y > c.y0 - m && y < c.y1 + m);
const franjaCh = (x, y) => x > CHINAMPAS.x0 && x < CHINAMPAS.x1 && y > CHINAMPAS.y0 && y < CHINAMPAS.y1 ? ((y - CHINAMPAS.y0) % 0.8 < 0.56 ? 1 : 2)
  : x > CHINAMPAS2.x0 && x < CHINAMPAS2.x1 && y > CHINAMPAS2.y0 && y < CHINAMPAS2.y1 ? ((x - CHINAMPAS2.x0) % 0.8 < 0.56 ? 1 : 2) : 0;
export const enChinampa = (x, y) => franjaCh(x, y) === 1 && enIsla(x, y);   // las franjas de tierra (entre ellas, sus canales)
export const enCanal = (x, y, m = 0) => (Math.abs(y - CANAL.y) < CANAL.a + m && x < CANAL.x1 + m) || franjaCh(x, y) === 2;
export const enPuente = (x, y) => PUENTES.some(p => Math.abs(x - p.x) < p.w / 2 && Math.abs(y - p.y) < 0.3);
export const enOrilla = (x, y) => x < 3.3 || y < 3.2 || Math.hypot(x - POPO.x, y - POPO.y) < POPO.r + 0.2 || (x < 4.0 && y > 4.4 && y < 14.0);   // la tierra firme del fondo y el pie de la Iztaccíhuatl
export const enLago = (x, y, m = 0) => (!enIsla(x, y, -m) && !enCalzada(x, y, -m) && !enOrilla(x, y)) || (enIsla(x, y) && enCanal(x, y, m));
/* el espejo: ¿coincide con el motor? (solo en el juego, donde el motor existe) */
export function verificarEspejo() {
  if (typeof ISLA_TE === 'undefined') return;
  const pares = [[TEMPLO, TEMPLO_TE], [CALMECAC, CALMECAC_TE], [CUICACALLI, CUICACALLI_TE], [TELPO, TELPO_TE], [TELPO2, TELPO2_TE], [EMBARCADERO, EMBARCADERO_TE], [PALABRA, PALABRA_TE], [PARTERA, PARTERA_TE], [LUGAR_NEZA, LUGAR_NEZA_TE], [ESPERA_NEZA, ESPERA_NEZA_TE]];
  for (const [a, b] of pares) if (Math.abs(a.x - b.x) > 1e-6 || Math.abs(a.y - b.y) > 1e-6) console.warn('tenochtitlan/lugares no coincide con 09e-tenochtitlan', a, b);
  if (ISLA.x0 !== ISLA_TE.x0 || ISLA.x1 !== ISLA_TE.x1 || ISLA.r !== ISLA_TE.r || CHINAMPAS.x0 !== CHINAMPAS_TE.x0 || CHINAMPAS2.y1 !== CHINAMPAS2_TE.y1 || CANAL.y !== CANAL_TE.y) console.warn('la isla, el canal o las chinampas de tenochtitlan/lugares no coinciden con 09e-tenochtitlan');
  for (const [x, y] of [[10, 10], [4.4, 4.4], [16.8, 16.8], [6, 13], [6, 13.2], [14, 5], [9, 12.15], [3.6, 8], [17.5, 8]]) if (enLago(x, y) !== enLagoTe(x, y)) console.warn('el agua de tenochtitlan/lugares no coincide con 09e-tenochtitlan', x, y);
}
