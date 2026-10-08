/* ============================================================
   09d-bagdad
   Época 6 (Bagdad, docs/era6-plan.md): la geometría del mundo que comparten el motor y Lumbre 3D (la Ciudad Redonda con
   su muralla y sus cuatro puertas, el Tigris, el canal del molino de papel, la Casa de la Sabiduría y su mesa de
   traductores, la mezquita con la halqa, el zoco de los libreros y el banco del cadí) y las obras que traen las
   caravanas para traducir. La época se juega en 3D: aquí no hay dibujos 2D, solo los lugares.
   Orientación (girada para la cámara, como Alejandría): el norte queda atrás a la derecha (z chica). La composición es la
   maqueta A de la hoja juego3d/bocetos/bagdad.html (replanteo del 2026-10-04): la Ciudad Redonda llena la esquina del
   fondo, con la Cúpula Verde en su centro; el Tigris corre ancho por el borde del este (x grande) de norte a sur, con el
   puente de barcas que sale de la puerta de Jorasán; la mitad del frente es el arrabal (Karkh), con los saberes alrededor
   de su plaza; las caravanas suben por el camino de Kufa y dejan los manuscritos afuera de la puerta; el canal de los
   campos (el que mueve la noria del molino de papel) corre por el frente, de la orilla del río al borde del oeste.
   ============================================================ */
const CIUDAD_BA = { x: 6.6, y: 6.6, r: 3.5 };                   // la muralla redonda de al-Mansur (762): el radio de su eje
const PUERTAS_BA = {                                            // las cuatro puertas, cada una con el nombre del camino que sale de ella
  kufa: { x: 6.6, y: 10.1 },     // al sur: el camino de Kufa y de Siria; por aquí entran las caravanas
  jorasan: { x: 10.1, y: 6.6 },  // al este: hacia el Tigris y el puente de barcas
  sham: { x: 3.1, y: 6.6 },      // al oeste: Siria
  basora: { x: 6.6, y: 3.1 }     // al norte (en la ciudad real, al sureste: aquí manda la cámara)
};
const PALACIO_BA = { x: 6.6, y: 6.6 };                           // la Cúpula Verde (Qubbat al-Khadra), en el centro exacto
const MEZQUITA_BA = { x: 7.93, y: 6.2 };                         // la gran mezquita, pegada al costado del palacio
const HALQA_BA = { x: 9.2, y: 12.6 };                            // la halqa del arrabal: el maestro junto a la columna; aquí se da la ijaza
const CASA_BA = { x: 12.4, y: 11.0 };                            // la Casa de la Sabiduría: la biblioteca del califa
const MESA_BA = { x: 11.4, y: 13.1 };                            // la mesa de los traductores, delante de la Casa
const ESPERA_BA = { x: 6.6, y: 11.3 };                           // donde la caravana deja los manuscritos, afuera de la puerta de Kufa
const MOLINO_BA = { x: 13.1, y: 16.4 };                          // el molino de papel con su noria, sobre el canal
const ZOCO_BA = { x: 8.6, y: 14.8 };                             // el zoco de los libreros, junto al camino de Kufa
const CADI_BA = { x: 10.6, y: 14.6 };                            // el banco del cadí, en el zoco: aquí se reparten las herencias
const MADRASA_BA = { x: 14.1, y: 13.6 };                         // la madrasa, junto al río
const TIGRIS_BA = { x0: 15.2 };                                  // la orilla del Tigris (el río ocupa de aquí al borde)
const CANAL_BA = { z: 16.4, x0: 2.0 };                           // el canal de los campos: sale del Tigris hacia el oeste y mueve la noria
const HOGARES_BA = [[3.3, 12.35], [4.5, 12.25], [3.0, 13.62], [4.6, 13.52]];   // las puertas de las casas de patio del arrabal
const LUGAR_HUNAYN_BA = { x: 12.65, y: 12.4 };                   // donde Hunayn enseña el oficio, entre la Casa y la mesa
const PUERTA_CASA_BA = { x: 10.75, y: 11.85 };                   // donde espera Hunayn antes de que lo reciban
function tigrisBa(x) { return x > TIGRIS_BA.x0; }
function enAguaBa(x, y, m = 0) {                                 // el Tigris y el canal del molino; m ensancha el agua
  if (x > TIGRIS_BA.x0 - m) return true;
  return x > CANAL_BA.x0 - m && Math.abs(y - CANAL_BA.z) < 0.28 + m;
}
function enMuralla(x, y, ancho = 0.35) {                         // ¿cae sobre el anillo de la muralla (y no en una puerta)?
  const d = Math.hypot(x - CIUDAD_BA.x, y - CIUDAD_BA.y);
  if (Math.abs(d - CIUDAD_BA.r) > ancho) return false;
  return !Object.values(PUERTAS_BA).some(p => Math.hypot(x - p.x, y - p.y) < 0.75);
}

/* LAS OBRAS QUE TRAEN LAS CARAVANAS (y las embajadas a Bizancio que cuenta el Fihrist de Ibn al-Nadim): griego, siríaco,
   persa y sánscrito. `t` es el título en su escritura (el siríaco y el persa medio, transliterados: sus alfabetos no
   están en las fuentes de casi ningún aparato), `ar` el título árabe con que se conoció, `g` el género (para el álgebra:
   'mat' son matemática y astronomía). */
const LENGUAS_BA = { griego: '🏛️', siriaco: '✝️', persa: '🦁', sanscrito: '🪷' };
const OBRAS_BA = [
  { a: 'Galeno', o: 'Sobre las facultades naturales', l: 'griego', t: 'ΠΕΡΙ ΦΥΣΙΚΩΝ ΔΥΝΑΜΕΩΝ', ar: 'كتاب القوى الطبيعية', g: 'med' },
  { a: 'Euclides', o: 'los Elementos', l: 'griego', t: 'ΣΤΟΙΧΕΙΑ', ar: 'كتاب الأصول', g: 'mat' },
  { a: 'Aristóteles', o: 'las Categorías', l: 'griego', t: 'ΚΑΤΗΓΟΡΙΑΙ', ar: 'كتاب المقولات', g: 'filo' },
  { a: 'Brahmagupta', o: 'el Sindhind', l: 'sanscrito', t: 'ब्राह्मस्फुटसिद्धान्त', ar: 'السند هند', g: 'mat' },
  { a: 'Hipócrates', o: 'los Aforismos', l: 'griego', t: 'ΑΦΟΡΙΣΜΟΙ', ar: 'كتاب الفصول', g: 'med' },
  { a: 'Ibn al-Muqaffa', o: 'Kalila y Dimna', l: 'persa', t: 'Kalīlag ud Dimnag', ar: 'كليلة ودمنة', g: 'letras' },
  { a: 'Ptolomeo', o: 'el Almagesto', l: 'griego', t: 'ΜΑΘΗΜΑΤΙΚΗ ΣΥΝΤΑΞΙΣ', ar: 'المجسطي', g: 'mat' },
  { a: 'Porfirio', o: 'la Isagoge, en siríaco', l: 'siriaco', t: 'Eisagōgē (siríaco)', ar: 'إيساغوجي', g: 'filo' },
  { a: 'Charaka', o: 'el libro de Charaka', l: 'sanscrito', t: 'चरकसंहिता', ar: 'كتاب جرك', g: 'med' },
  { a: 'Dioscórides', o: 'De materia medica', l: 'griego', t: 'ΠΕΡΙ ΥΛΗΣ ΙΑΤΡΙΚΗΣ', ar: 'كتاب الحشائش', g: 'med' },
  { a: 'los astrónomos de Persia', o: 'las tablas del rey', l: 'persa', t: 'Zīg ī Šahryārān', ar: 'زيج الشاه', g: 'mat' },
  { a: 'Platón', o: 'el Timeo', l: 'griego', t: 'ΤΙΜΑΙΟΣ', ar: 'طيماوس', g: 'filo' },
  { a: 'Galeno', o: 'Sobre los temperamentos, en siríaco', l: 'siriaco', t: 'Peri kraseōn (siríaco)', ar: 'كتاب المزاج', g: 'med' },
  { a: 'Sushruta', o: 'el libro de Sushruta', l: 'sanscrito', t: 'सुश्रुतसंहिता', ar: 'كتاب سسرد', g: 'med' },
  { a: 'Aristóteles', o: 'la Física', l: 'griego', t: 'ΦΥΣΙΚΗ ΑΚΡΟΑΣΙΣ', ar: 'كتاب السماع الطبيعي', g: 'filo' },
  { a: 'los narradores de Persia', o: 'Los mil cuentos', l: 'persa', t: 'Hazār Afsān', ar: 'هزار أفسان', g: 'letras' }
];
const NOMBRE_LENGUA_BA = { griego: 'griego', siriaco: 'siríaco', persa: 'persa medio', sanscrito: 'sánscrito' };
