/* ============================================================
   09h-santiago
   Época 10 (Santiago de Chile, 1821-1880, docs/era10-plan.md): la geometría del mundo que comparten el motor y Lumbre 3D
   (la cordillera de los Andes al fondo; el Mapocho que cruza con sus tajamares y el puente de Cal y Canto; al otro lado, la
   Chimba; la ciudad en damero, con la Plaza de Armas, la catedral, La Moneda y el cerro Santa Lucía; la Alameda con sus
   álamos; las anclas de la escuela lancasteriana, la Escuela Normal, la escuela del silabario, la de preceptoras, el
   Congreso de la ley y el kindergarten) y los datos de la época: los pueblos adonde se mandan los normalistas.
   Orientación (para la cámara): la cordillera es la franja del fondo; el río cruza de izquierda a derecha; la ciudad queda
   al frente y la Alameda, más al frente.
   ============================================================ */
const ANDES_SA = 7.4;                                               // la cordillera: el pie del cerro donde x + y < 7,4
const MAPOCHO_SA = { z0: 5.55, z1: 6.15 };                          // el río, de tajamar a tajamar
const PUENTE_SA = { x: 9.3, z0: 5.4, z1: 6.3 };                     // el puente de Cal y Canto (1782-1888)
const DAMERO_SA = { x0: 3.1, x1: 16.6, y0: 6.75, y1: 12.35, paso: 1.125, calle: 0.22 };   // las manzanas y sus calles
const PLAZA_SA = { x: 9.2875, y: 9.5625, r: 0.45 };                       // la Plaza de Armas (una manzana vacía)
const SANTALUCIA_SA = { x: 13.7875, y: 9.5625, r: 0.9 };                  // el cerro Santa Lucía
const ALAMEDA_SA = { z0: 12.55, z1: 13.15 };                        // la Alameda de las Delicias, con sus álamos
const LANCASTER_SA = { x: 4.7875, y: 10.6875 };                          // la escuela lancasteriana (1821)
const NORMAL_SA = { x: 7.0375, y: 11.8125 };                            // la Escuela Normal de Preceptores (1842)
const SILABARIO_SA = { x: 11.5375, y: 7.3125 };                          // la escuela del barrio, con el silabario
const PRECEPTORAS_SA = { x: 11.5375, y: 11.8125 };                       // la Escuela de Preceptoras (1854)
const CONGRESO_SA = { x: 7.0375, y: 7.3125 };                            // el Congreso, donde se vota la ley (1860)
const KINDER_SA = { x: 14.9125, y: 11.8125 };
const MONEDA_SA = { x: 9.2875, y: 11.8125 };                      // el palacio de La Moneda (Toesca, 1805)
const CATEDRAL_SA = { x: 8.1625, y: 9.5625 };                     // la catedral, en el lado poniente de la plaza                            // el kindergarten
const DILIGENCIA_SA = { x: 3.4, y: 12.0 };                          // la estación de la diligencia de Valparaíso (las luces de la pizarra)
const ESPERA_SARMIENTO_SA = { x: 15.6, y: 6.9 };                    // Sarmiento baja de la cordillera, por el camino de Mendoza
const LUGAR_SARMIENTO_SA = { x: 7.6, y: 12.42 };                     // donde enseña, junto a la Escuela Normal
const HOGARES_SA = [[4.4, 8.0], [10.8, 11.6], [14.6, 8.0], [6.6, 12.0]];
function enAndesSa(x, y) { return x + y < ANDES_SA; }
function enMapochoSa(x, y) { return y > MAPOCHO_SA.z0 && y < MAPOCHO_SA.z1 && !(Math.abs(x - PUENTE_SA.x) < 0.2); }
function enCerroSa(x, y, m = 0) { return Math.hypot(x - SANTALUCIA_SA.x, y - SANTALUCIA_SA.y) < SANTALUCIA_SA.r + m; }
function enAguaSa(x, y) { return enMapochoSa(x, y); }

/* LOS PUEBLOS: adonde se manda cada normalista a fundar su escuela. `viaje`: segundos del juego (los días a caballo, en
   carreta o en barco); `gente`: cuántos niños tiene (cuántos lectores hace su escuela); `paga`: lo que el pueblo y el
   Estado ponen cada tanto; `x`: dónde va en el mapa (de norte a sur, 0 → 1). */
const PUEBLOS_SA = [
  { n: 'Copiapó', ic: '⛏️', viaje: 100, gente: 2, paga: 3.4, x: 0.05, dice: 'el pueblo de la plata de Chañarcillo: rico, lejos, en el desierto' },
  { n: 'La Serena', ic: '⛪', viaje: 68, gente: 2, paga: 2, x: 0.16, dice: 'la ciudad de los campanarios, en el valle del Elqui' },
  { n: 'Valparaíso', ic: '⚓', viaje: 36, gente: 3.4, paga: 3, x: 0.33, dice: 'el puerto, la ciudad más grande después de Santiago' },
  { n: 'Quillota', ic: '🍑', viaje: 30, gente: 1.4, paga: 1.2, x: 0.37, dice: 'el valle de las chirimoyas, a un día de la capital' },
  { n: 'Rancagua', ic: '🌾', viaje: 24, gente: 1.2, paga: 1, x: 0.45, dice: 'el pueblo de la batalla, a medio día de camino' },
  { n: 'Talca', ic: '🍷', viaje: 56, gente: 2.2, paga: 1.8, x: 0.55, dice: 'la ciudad del centro, entre viñas y trigales' },
  { n: 'Chillán', ic: '🐎', viaje: 72, gente: 1.8, paga: 1.4, x: 0.63, dice: 'el pueblo de las ferias, al pie de los volcanes' },
  { n: 'Concepción', ic: '🏛️', viaje: 90, gente: 3.2, paga: 2.6, x: 0.7, dice: 'la ciudad del sur, junto al Biobío' },
  { n: 'Valdivia', ic: '🌲', viaje: 120, gente: 1.6, paga: 1.6, x: 0.86, dice: 'entre bosques y ríos, con los colonos alemanes que llegan en 1850' },
  { n: 'Ancud', ic: '⛵', viaje: 140, gente: 1, paga: 0.8, x: 0.95, dice: 'en Chiloé, el más lejos de todos: se llega en barco' }
];
