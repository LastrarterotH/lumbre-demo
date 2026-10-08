/* ============================================================
   09g-amsterdam
   Época 9 (Ámsterdam, 1450-1658, docs/era9-plan.md): la geometría del mundo que comparten el motor y Lumbre 3D (el IJ, el
   puerto, al fondo; el Dam con la casa consistorial nueva; los tres canales del anillo, en cuarto de círculo alrededor
   del centro viejo, con sus puentes; la muralla con su baluarte y su molino; la imprenta de los
   Blaeu, la fundición de tipos, la escuela del barrio, la casa del atlas, el aula de Comenio y el taller del Orbis Pictus)
   y los datos de la época: lo que se puede imprimir. La época se juega en 3D.
   Orientación (para la cámara): el IJ es la franja del fondo (z baja); el centro del anillo está en la esquina del fondo
   (x y z chicas) y los tres canales cruzan el tablero como gradas frente a la cámara (el replanteo visual, 2026-10-04).
   ============================================================ */
const IJ_AM = { z1: 3.6 };                                          // el puerto: agua para z < 3.6
const CENTRO_AM = { x: 2.0, y: 3.6 };                               // el centro del anillo de canales: la esquina del fondo, en la orilla del IJ
const GRACHTEN_AM = [9.3, 11.8, 14.3];                              // los radios del Herengracht, el Keizersgracht y el Prinsengracht
const ANCHO_GRACHT = 0.7;
const GRADO_AM = Math.PI / 180;
const PUENTES_AM = [9, 31, 49, 69].map(g => g * GRADO_AM);         // los ángulos (desde +x hacia +z) de las calles que cruzan los canales
const MURALLA_AM = 16.5, FOSO_AM = [16.85, 17.45];                  // la muralla (radio; el terraplén va de 16,2 a 16,8) y el foso del Singelgracht
const PUENTE_FOSO_AM = 30 * GRADO_AM;                               // el puente del foso, hacia los pólderes
const DAM_AM = { x: 6.0, y: 8.6 };                                  // la plaza
const STADHUIS_AM = { x: 4.8, y: 5.95 };                            // la casa consistorial nueva (1648-1665), al fondo de la plaza
const polarAm = (r, g) => ({ x: CENTRO_AM.x + r * Math.cos(g * GRADO_AM), y: CENTRO_AM.y + r * Math.sin(g * GRADO_AM) });   // g: grados
const PRENSA_AM = polarAm(10.55, 40);                               // la imprenta de los Blaeu, entre el Herengracht y el Keizersgracht
const TIPOS_AM = polarAm(13.05, 40);                                // la fundición de tipos
const ESCUELA_AM = polarAm(13.05, 58);                              // la escuela del barrio (la cartilla)
const ORBIS_AM = polarAm(13.05, 21);                                // el taller del Orbis Pictus, con los grabadores
const ATLAS_AM = polarAm(15.25, 27);                                // la casa del atlas, con el grabador
const AULA_AM = polarAm(15.25, 57);                                 // el aula de Comenio (la Didáctica)
const MOLINO_AM = polarAm(MURALLA_AM, 45);                          // el molino de papel de viento, sobre el baluarte que apunta a la cámara (las luces del pliego)
const ESPERA_COMENIO_AM = { x: 12.5, y: 3.9 };                      // Comenio llega en barco: espera en el muelle del IJ
const LUGAR_COMENIO_AM = { x: 11.27, y: 16.08 };                    // donde enseña, delante del aula
const HOGARES_AM = [[5.4, 9.2], [8.7, 7.4], [7.4, 12.4], [12.4, 4.4]];
function radioAm(x, y) { return Math.hypot(x - CENTRO_AM.x, y - CENTRO_AM.y); }
function anguloAm(x, y) { return Math.atan2(y - CENTRO_AM.y, x - CENTRO_AM.x); }
function enPuenteAm(x, y) { const a = anguloAm(x, y), r = radioAm(x, y); return PUENTES_AM.some(p => Math.abs(a - p) * r < 0.2); }
function enGrachtAm(x, y) { if (y < IJ_AM.z1) return false; const r = radioAm(x, y); return GRACHTEN_AM.some(g => Math.abs(r - g) < ANCHO_GRACHT / 2) && !enPuenteAm(x, y); }
function enFosoAm(x, y) { const r = radioAm(x, y); return y > IJ_AM.z1 && r > FOSO_AM[0] && r < FOSO_AM[1] && Math.abs(anguloAm(x, y) - PUENTE_FOSO_AM) * r > 0.25; }
function enAguaAm(x, y) { return y < IJ_AM.z1 || enGrachtAm(x, y) || enFosoAm(x, y); }

/* LO QUE SE PUEDE IMPRIMIR: cuánto tarda en componerse, cada cuánto sale una tirada, lo que deja y cuánto se llena su mercado
   con cada tirada (la demanda vuelve sola, despacio). `pide`: el saber que la abre. */
const OBRAS_AM = {
  almanaque: { n: 'un almanaque', ic: '📅', comp: 15, pago: [110, 14], lectores: 0, saber: 3, rep: 0, cae: 0.12, pide: 64,
    dice: 'las lunas, las ferias y las mareas del año, con un refrán: se compone rápido y se vende en todas partes' },
  cartilla: { n: 'una cartilla', ic: '🔤', comp: 25, pago: [60, 8], lectores: 2, saber: 6, rep: 0, cae: 0.08, pide: 65,
    dice: 'el abecedario y las primeras lecturas de la escuela del barrio: hace lectores' },
  mapa: { n: 'un mapa', ic: '🗺️', comp: 45, pago: [70, 9], lectores: 0, saber: 30, rep: 0.5, cae: 0.15, pide: 66,
    dice: 'el mundo grabado en cobre e iluminado a mano: pocos lo compran, pero da renombre y saber' },
  orbis: { n: 'el Orbis Pictus', ic: '🖼️', comp: 35, pago: [90, 11], lectores: 4, saber: 20, rep: 0.25, cae: 0.06, pide: 68,
    dice: 'el mundo en imágenes para los niños: cada cosa con su dibujo y su nombre' }
};
