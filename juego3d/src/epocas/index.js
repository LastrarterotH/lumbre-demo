/* ============================================================
   epocas
   El registro de las épocas del mundo 3D. Una época nueva = un archivo en esta carpeta (con el molde de
   epoca1.js: construir(motor) → { quieto, nubes, sincronizar, superponer, rotulos }) y su línea aquí.
   Lo que la época no tenga en 3D todavía, simplemente no se registra: el motor lo avisa en vez de romperse.
   ============================================================ */
import epoca1 from './epoca1.js';
import epoca2 from './epoca2.js';
import epoca3 from './epoca3.js';
import epoca4 from './epoca4.js';
import epoca5 from './epoca5.js';
import epoca6 from './epoca6.js';
import epoca7 from './epoca7.js';
import epoca8 from './epoca8.js';
import epoca9 from './epoca9.js';
import epoca14 from './epoca14.js';
import epoca15 from './epoca15.js';
import epoca21 from './epoca21.js';

export const EPOCAS = { 1: epoca1, 2: epoca2, 3: epoca3, 4: epoca4, 5: epoca5, 14: epoca14, 6: epoca6, 15: epoca15, 7: epoca7, 8: epoca8, 9: epoca9, 21: epoca21 };   // Roma (id 14) va entre Alejandría y Bagdad, China (id 15) entre Bagdad y París, y el futuro (id 21) al final, después de Ámsterdam (ORDEN_EPOCAS)
/* Santiago (epoca10.js, src/santiago/) salió del juego el 2026-10-05, a pedido del usuario: la escuela pública (id 10) se
   rehace en la Exposición Universal de París 1889 (GDD §6). Sus archivos quedan como base (el mapa del normalista). */
