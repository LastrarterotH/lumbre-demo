/* ============================================================
   alejandria/lugares
   La geometría de Alejandría que el 3D necesita sin depender del motor cargado (el laboratorio de etapas,
   juego3d/qa.html, arma las piezas sin el motor). Es el ESPEJO de juego/src/09c-alejandria.js: si se mueve algo
   aquí, se mueve allá (epoca5.js avisa en la consola si no coinciden).
   ============================================================ */
export const costa = x => 4.45 + 0.3 * Math.sin(x * 0.6) + 0.55 * Math.exp(-(((x - 9.2) / 2.4) ** 2));
export const lago = x => 15.9 + 0.3 * Math.sin(x * 0.7 + 1);
export const FARO = { x: 3.3, y: 2.7, r: 1.25 };
export const MUELLE = { x: 8.6, y: 5.0 };
export const AMARRE = { x: 8.75, y: 2.75 };
export const BARCA = { x: 6.9, y: 4.0 };
export const BIBLIOTECA = { x: 7.1, y: 6.75 };
export const MUSEO = { x: 13.3, y: 7.1 };
export const VARA = { x: 9.05, y: 10.85 };
export const SERAPEO = { x: 4.6, y: 13.0 };
export const LAGO = { x: 11.5, y: 15.4, r: 1.0 };
export const GENEROS = [{ n: 'Poesía', ico: '🎭' }, { n: 'Historia', ico: '📜' }, { n: 'Medicina', ico: '⚕️' }, { n: 'Matemática', ico: '📐' }];
/* el espejo: ¿coincide con el motor? (solo en el juego, donde el motor existe) */
export function verificarEspejo() {
  if (typeof MUELLE_AL === 'undefined') return;
  const pares = [[FARO, FARO_AL], [MUELLE, MUELLE_AL], [AMARRE, AMARRE_AL], [BARCA, BARCA_AL], [BIBLIOTECA, BIBLIOTECA_AL], [MUSEO, MUSEO_AL], [VARA, VARA_AL], [SERAPEO, SERAPEO_AL]];
  for (const [a, b] of pares) if (Math.abs(a.x - b.x) > 1e-6 || Math.abs(a.y - b.y) > 1e-6) console.warn('alejandria/lugares no coincide con 09c-alejandria', a, b);
  if (Math.abs(costa(7.3) - costaAl(7.3)) > 1e-6 || Math.abs(lago(7.3) - lagoAl(7.3)) > 1e-6) console.warn('la costa o el lago de alejandria/lugares no coinciden con 09c-alejandria');
}
