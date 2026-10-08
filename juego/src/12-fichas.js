/* ============================================================
   12-fichas
   Quién es quién: nombres, rasgos y fichas de cada personaje, más las FUENTES académicas de cada saber.
   ============================================================ */
const FUENTES = {}; // DERIVADA de la ficha única (T.fuente en 01-balance): el paper con DOI de cada saber
BALANCE.tecnologias.forEach((T, i) => { if (T.fuente) FUENTES[i] = T.fuente; });
const FUENTE_FUEGO = { cita: 'Wrangham et al., 1999', rev: 'Current Anthropology', doi: '10.1086/300083',
  debate: 'que la cocción moldeara la evolución humana está bien apoyado; la fecha tan temprana del fuego habitual, no.' };
const FUENTE_ABUELA = { cita: 'Hawkes et al., 1998', rev: 'PNAS', doi: '10.1073/pnas.95.3.1336',
  debate: 'el apoyo de las abuelas está documentado; que por sí solo explique la menopausia se discute.' };
const FUENTE_GRANERO = { cita: 'Englund, 2011', rev: 'Oxford Handbook of Cuneiform Culture', doi: '10.1093/oxfordhb/9780199557301.013.0002',
  txt: 'la contabilidad de los almacenes dio origen a la escritura' };
function fuenteHtml(f) {
  if (!f) return '';
  // el DOI manda; los LIBROS no lo tienen y traen `url` (editorial o repositorio institucional);
  // sin ninguno de los dos, la cita va en seco (ISBN en el `rev`), que es mejor que un enlace roto
  const link = o => o.doi ? `<a href="https://doi.org/${o.doi}" target="_blank" rel="noopener">${o.cita}</a>`
    : o.url ? `<a href="${o.url}" target="_blank" rel="noopener">${o.cita}</a>` : o.cita;
  let h = `<div class="fuente">📚 ${link(f)} · <span class="rev">${f.rev || ''}</span>`;
  if (f.extra) h += `<br><span class="rev">${f.extra.txt}:</span> ${link(f.extra)}`;
  if (f.debate) h += `<div class="debate">⚖️ <b>Tesis discutida:</b> ${f.debate}` +
    (f.contra ? ` <span class="rev">Contrapunto:</span> ${link(f.contra)}.` : '') + `</div>`;
  return h + `</div>`;
}
// plantilla de 20 caminantes; se dibujan los primeros min(alumnos,18)
const KIDS = Array.from({ length: 20 }, (_, i) => ({
  off: i * 1.7 + (i % 4) * 0.9, speed: 0.66 + (i % 5) * 0.085, variant: i % 3
}));

/* ---------- las fichas del clan: cada personaje tiene nombre e historia ---------- */
const NOMBRES_CLAN = ['Lan', 'Kuno', 'Sefa', 'Ordo', 'Ivo', 'Tal', 'Enna', 'Dano', 'Sami', 'Oda', 'Rilo', 'Uma', 'Kesa', 'Timo', 'Aila', 'Doru', 'Neka', 'Puyo', 'Oki', 'Moko', 'Ashi', 'Rena', 'Golu'];
const NOMBRES_SUMER = ['Ludingira', 'Ku-Aya', 'Ninshubur', 'Shatilu', 'Ur-Nisaba', 'Gemé-Suen', 'Ilum-palil', 'Nin-melam', 'Ahushunu', 'Ea-bani', 'Nidaba-kam', 'Lu-Inanna', 'Amar-Suena', 'Ninlil-la', 'Ur-Bau', 'Halihalum', 'Kuli', 'Zuzu', 'Ibbi-Adad', 'Sin-nada', 'Ur-gula', 'Nammu', 'Ashgi'];
const RASGOS_SUMER = [
  'Ya escribe su nombre sin mirar la lista.',
  'Confunde el signo de pez con el de casa, y le da risa.',
  'Sueña con ser contador del granero del templo.',
  'Su tablilla favorita tiene un error que nadie ha encontrado.',
  'Recita la lista de pájaros de memoria, con silbidos incluidos.',
  'Amasa la arcilla más lisa de toda la edubba.',
  'Le pusieron una copia de castigo… y la terminó cantando.',
  'Cuenta hasta sesenta, como los mayores.',
  'Guarda su cálamo detrás de la oreja, como los escribas viejos.',
  'Dice que de grande escribirá un himno más largo que el río.'
];
const RASGOS_ESCRIBA = [ // alineados con LEX().nombres de Sumer
  'Dirige la casa de las tablillas con voz de trueno y paciencia de barro.',
  'Corrige las cuñas torcidas sin borrar el ánimo de nadie.',
  'Amasa y recorta las tablillas nuevas cada amanecer.',
  'Lleva las cuentas del grano sin fallar una sola ficha.',
  'Canta las listas para que se peguen a la memoria.',
  'El más joven del oficio: aún guarda su primera tablilla de práctica.'
];
const NOMBRES_EGIPTO = ['Renenutet', 'Bak', 'Mutnofret', 'Userhat', 'Tem', 'Nakht', 'Hapu', 'Paneb', 'Isetnofret', 'Kha', 'Merit', 'Nebamun', 'Webensenu', 'Tia', 'Maya', 'Neferura', 'Siamun', 'Baki', 'Dedu', 'Weni', 'Sennefer', 'Iset', 'Peshet'];
const NOMBRES_ATENAS = ['Fedro', 'Lisis', 'Cármides', 'Menéxeno', 'Teeteto', 'Hipotales', 'Ctesipo', 'Alcibíades', 'Critobulo', 'Apolodoro', 'Aristodemo', 'Simias', 'Cebes', 'Nicérato', 'Glaucón', 'Adimanto', 'Polemarco', 'Clinias', 'Eutidemo', 'Fenarete', 'Diotima', 'Lastenia', 'Axiotea']; // los muchachos de los diálogos; Lastenia y Axiotea, las dos alumnas de la Academia que Diógenes Laercio nombra
const RASGOS_ATENAS = [
  'Sabe que no sabe, y eso lo tiene contento.',
  'Borra la tablilla tres veces antes de dar por buena una letra.',
  'Corre la pista de la palestra al amanecer, antes que el maestro.',
  'Responde a cada pregunta con otra pregunta. Se lo pegó alguien.',
  'Aprendió la lira antes que el alfabeto, y se le nota.',
  'Duplicó el cuadrado en la arena sin que nadie le dijera cómo.',
  'Vino desde el Pireo caminando, con su pedagogo detrás.',
  'Discute con el sofista hasta que el sofista se cansa.',
  'Prefiere la sombra del plátano a la stoa: dice que ahí se piensa mejor.',
  'Colecciona aporías como otros coleccionan tabas.'
];
const NOMBRES_ALEJANDRIA = ['Teón', 'Isidora', 'Filón', 'Tais', 'Demetrio', 'Berenice', 'Sarapión', 'Ptolemaida', 'Herón', 'Arsínoe', 'Aristóbulo', 'Filina', 'Zenódoto', 'Petosiris', 'Heráclides', 'Tasis', 'Apión', 'Dionisia', 'Hor', 'Cleopatra'];
const RASGOS_ALEJANDRIA = [
  'Llegó en el último barco antes del invierno, con un solo rollo y muchas ganas.',
  'Busca a Homero en el estante de Historia, por las dudas.',
  'Copia de noche, con lámpara, para pagarse el pan.',
  'Habla griego en el Museo y egipcio en su casa.',
  'Midió la sombra de su propia vara y no le dio lo mismo que a Eratóstenes.',
  'Lee en voz alta, como se leía entonces, y los demás le piden silencio.',
  'Se sabe de memoria el primer postulado y discute el quinto.',
  'Viene del barrio judío a leer la Biblia en griego, que se tradujo aquí.',
  'Le pone etiqueta a todo: hasta a la canasta del pan.',
  'Quiere ser médico y pasa las tardes donde Herófilo estudia los cuerpos.'
];
const NOMBRES_BAGDAD = ['Yusuf', 'Fátima', 'Ahmad', 'Zaynab', 'Ishaq', 'Maryam', 'Hasan', 'Rabia', 'Yahya', 'Sukayna', 'Ibrahim', 'Jadiya', 'Musa', 'Aisha', 'Thabit', 'Ruqayya', 'Daud', 'Umm Kulthum', 'Bakhtishu', 'Layla'];
const RASGOS_BAGDAD = [
  'Llegó de Jorasán con la caravana y un solo cuaderno de papel.',
  'Escribe las cifras de la India en la tabla de polvo y se las borra el viento.',
  'Copia en el zoco de los libreros para pagarse la halqa.',
  'Habla persa en su casa, árabe en la mezquita y un poco de griego con los traductores.',
  'Quiere su ijaza antes que nadie y lee de noche, en la azotea.',
  'Pregunta en la halqa lo que el maestro no preguntó.',
  'Se aprendió de memoria una fábula de Kalila y Dimna y la cuenta a todos.',
  'Viene del barrio cristiano a ver cómo traduce Hunayn.',
  'Hace cuentas de herencias para los vecinos y les cobra en dátiles.',
  'Sueña con ver el molino de papel por dentro, y un día lo logra.'
];
const NOMBRES_TENOCHTITLAN = ['Cuauhtli', 'Citlalin', 'Tochtli', 'Xóchitl', 'Ocelotl', 'Atotoztli', 'Mázatl', 'Ayauhcíhuatl', 'Coyotl', 'Tecuichpo', 'Itzcóatl', 'Quiauhxóchitl', 'Cuitláhuac', 'Miahuaxíhuitl', 'Chimalpopoca', 'Papalotl', 'Tlacaélel', 'Malinalli', 'Acamapichtli', 'Tlalli'];
const RASGOS_TENOCHTITLAN = [
  'Va al telpochcalli de su barrio desde los quince y ya sabe levantar una chinampa.',
  'Su madre le enseñó a hilar a los cuatro años, como pinta el Códice Mendoza, y ahora enseña a su hermana.',
  'Le tocó un buen signo y lo dice a quien quiera oírlo.',
  'Se sabe de memoria tres cantos de la cuicacalli y los canta remando.',
  'Quiere entrar al calmécac aunque su familia es de la gente común: dicen que algunos lo logran.',
  'Lleva el tributo en canoa con su padre y cuenta los pliegos de amate antes de entregarlos.',
  'Aprendió los veinte signos de los días antes que nadie.',
  'Le cuesta despertar para el canto de la tarde, pero nunca falta.'
];
const RASGOS_MAESTRO_TE = [ // alineados con LEX().nombres de Tenochtitlan
  'Recibe a los recién nacidos y les dice la palabra: «has venido a la tierra…». Ningún niño nace en su barrio sin escucharla.',
  'Tlamatini, «el que sabe algo»: lee los códices en voz alta y dice que el saber es una tea que no ahúma.',
  'Pinta los códices en negro y rojo, con los colores que prepara él mismo.',
  'Enseña a las muchachas en el calmécac de las sacerdotisas: los cantos, el tejido fino y la cuenta de los días.',
  'Lleva el compás del huéhuetl en la casa del canto: si un muchacho se equivoca, vuelve a empezar todo el canto.',
  'Cuenta los días en el libro de los destinos y sabe el signo de cada niño del barrio.'
];
const NOMBRES_PARIS = ['Guillermo', 'Juan', 'Roberto', 'Gualterio', 'Tomás', 'Esteban', 'Gerardo', 'Raúl', 'Simón', 'Nicolás', 'Enrique', 'Bernardo', 'Alberto', 'Godofredo', 'Mateo', 'Felipe', 'Odón', 'Lamberto', 'Rogerio', 'Jacobo'];
const RASGOS_PARIS = [
  'Llegó de Inglaterra a los catorce con una carta para un maestro que ya se había mudado de calle.',
  'Es de la nación de Picardía y discute con los normandos por el mejor lugar en la calle de la paja.',
  'Copia de noche los cuadernos que alquila al estacionario, a la luz de un cabo de vela, para no pagar el libro entero.',
  'Le escribe a su padre pidiendo dinero para libros y una capa, como todos los estudiantes de París: esas cartas se conservan.',
  'Oye la lección sentado en la paja de la rue du Fouarre: los estudiantes de artes no tienen bancos.',
  'Lleva la tonsura del clérigo: si se mete en líos, lo juzga el obispo y no el preboste del rey.',
  'Se sabe de memoria las siete artes: la gramática, la retórica y la dialéctica; la aritmética, la geometría, la música y la astronomía.',
  'Sueña con disputar en la Montaña, y ensaya los argumentos en voz alta cruzando el Petit Pont.'
];
const RASGOS_MAESTRO_PA = [ // alineados con LEX().nombres de París
  'Escribió el Didascalicon: qué leer, en qué orden y cómo. «Aprende todo: después verás que nada es superfluo.»',
  'Enseñaba en Notre-Dame hasta que su alumno Abelardo lo venció en la disputa; entonces se retiró a San Víctor y fundó allí la escuela.',
  'Escribió las Sentencias: cada cuestión con lo que dicen las autoridades. Fue el libro de texto de teología durante cuatro siglos.',
  'Inglés, estudió doce años en París y escribió el Metalogicon: «somos enanos a hombros de gigantes», como enseñaba Bernardo de Chartres.',
  'Escocés, prior de San Víctor: enseña a contemplar, que para él es la otra mitad del estudio.',
  'Da la licencia para enseñar en nombre del obispo, y cobraba por ella hasta que el papa le ordenó darla gratis.'
];
const NOMBRES_AMSTERDAM = ['Pieter', 'Grietje', 'Jan', 'Neeltje', 'Willem', 'Aaltje', 'Hendrick', 'Trijntje', 'Claes', 'Geertruy', 'Joost', 'Marritje', 'Cornelis', 'Lysbeth', 'Abraham', 'Saartje', 'Dirck', 'Annetje', 'Jacob', 'Weyntje'];
const RASGOS_AMSTERDAM = [
  'Va a la escuela del barrio con su cartilla y ya lee los carteles de la Kalverstraat en voz alta.',
  'Su madre vende libros en la plaza del Dam y le trae los pliegos que sobran.',
  'Es hija de un cajista y sabe dónde va cada letra en la caja, aunque todavía lee despacio.',
  'Se escapa al IJ a mirar los barcos de las Indias y vuelve con palabras nuevas.',
  'Patina en el canal helado camino a la escuela, con la cartilla bajo el brazo.',
  'Su abuelo llegó de Lisboa y reza en hebreo; él lee en tres lenguas.',
  'Copia los mapas de la casa Blaeu con carbón, y les inventa islas.',
  'Le tiene miedo a la palmeta del maestro, pero no falta nunca.'
];
const RASGOS_MAESTRO_AM = [ // alineados con LEX().nombres de Ámsterdam
  'Imprime el mundo: atlas de once tomos, globos y cartas de navegación para la Compañía de las Indias.',
  'Rabino e impresor: fundó la primera imprenta hebrea de Ámsterdam y escribía a los sabios de toda Europa.',
  'La primera mujer que estudió en una universidad de la República (detrás de una cortina, en Utrecht, 1636): escribió que las mujeres podían y debían estudiar.',
  'Imprime libros chicos, baratos y bien hechos, en formato de bolsillo: los elzevires se leen en toda Europa.',
  'Fundó la imprenta del Bloemgracht; era astrónomo, alumno de Tycho Brahe.',
  'Enseña a leer a treinta niños y niñas en una sola sala, con la cartilla, la tabla del abecedario y la palmeta.'
];
const NOMBRES_ROMA = ['Marco', 'Julia', 'Lucio', 'Cayo', 'Cornelia', 'Publio', 'Quinto', 'Tulia', 'Tito', 'Sexto', 'Claudia', 'Aulo', 'Décimo', 'Livia', 'Gneo', 'Servio', 'Valeria', 'Espurio'];
const RASGOS_ROMA = [
  'Su pedagogo, un esclavo griego, le lleva la tablilla y le enseña palabras en griego por el camino.',
  'Escribe con el estilo en la cera y borra con la paleta del otro extremo, sin que el maestro lo vea.',
  'Trae los ases de los idus atados en un pañuelo, para pagarle al maestro.',
  'Se sabe de memoria el comienzo del libro II de la Eneida y lo raya en las paredes.',
  'Le tiene miedo a la férula, pero aprendió a contar con los calculi más rápido que nadie.',
  'Juega a las nueces en el Foro y llega tarde a la escuela, con las rodillas sucias.',
  'Quiere defender un caso en la basílica Julia, como su tío.',
  'Su familia es de Como: dicen que allá van a tener escuela propia, porque Plinio puso el dinero.'
];
const RASGOS_MAESTRO_RO = [ // alineados con LEX().nombres de Roma (Suetonio, Sobre los gramáticos y los rétores; Plinio el Viejo)
  'Grammaticus de Benevento y viejo soldado: le enseñó a Horacio, que lo recuerda como «Orbilio, el que pega». Murió pobre, cerca de los cien años.',
  'Nació esclavo y aprendió las letras acompañando a la escuela al hijo de su ama; llegó a ser el grammaticus más famoso y más caro de Roma.',
  'Liberto, maestro de los nietos de Augusto en el Palatino: ponía a competir a sus alumnos y al ganador le regalaba un libro hermoso. La emulación, antes de Quintiliano.',
  'Rétor de Hispania, amigo de Séneca el Viejo: estudiaba tanto que se veía pálido, y sus alumnos tomaban comino para parecerse a él.',
  'Liberto: fue el primero en leer en clase a Virgilio y a los poetas nuevos, cuando todavía estaban vivos o recién muertos.',
  'Enseña a una docena de niños detrás de una cortina, antes del amanecer, por unos pocos ases que los padres le pagan en los idus.'
];
const NOMBRES_CHINA = ['Zhang Wen', 'Li Shou', 'Wang Yu', 'Chen Heng', 'Liu Zheng', 'Zhao Ming', 'Sun Jie', 'Zhou Li', 'Wu Yan', 'Huang Ting', 'Lin Fu', 'Xu Ao', 'He Qing', 'Gao Shen', 'Lü Fang', 'Fan Chun', 'Su Mo', 'Cai Xun'];
const RASGOS_CHINA = [
  'Muele la tinta antes del amanecer y copia los clásicos a la luz de una lámpara de aceite.',
  'Se sabe de memoria las Analectas y el Mencio, y todavía le faltan los comentarios.',
  'Su familia vendió un campo para pagarle los años de estudio: si aprueba, la aldea entera sube con él.',
  'Compró en el mercado del templo de Xiangguo un libro de ensayos modelo, y lo esconde bajo la almohada.',
  'Reprobó una vez; su padre reprobó tres, y ahora enseña en la escuela de la aldea.',
  'Prefiere la sala de los asuntos: quiere aprender a calcular cuánta agua cabe en un canal.',
  'Practica la caligrafía copiando a Yan Zhenqing, trazo por trazo, hasta que le duele la muñeca.',
  'En la fiesta de los Faroles se escapa a ver las linternas de la calle, con el libro bajo el brazo.'
];
const RASGOS_FUTURO = [   // los estudiantes del valle de hoy (era21-plan): ninguno es una persona real
  'Le pregunta todo a la IA, y después le pregunta a la maestra si la IA tenía razón.',
  'Llegó de lejos el año pasado: entiende la clase gracias a la traducción, y ya está aprendiendo la lengua.',
  'Junta atención como quien junta piedras lisas: se sienta a la orilla de la laguna sin el teléfono.',
  'Entregó la tarea en un minuto y no sabría explicarla. Esta vez va a pedir que la IA le pregunte.',
  'Quiere saber por qué los mamuts se extinguieron, y no le alcanza con la respuesta corta.',
  'Defendió su volcán de bicarbonato en las gradas: le preguntaron por qué hacía espuma, y lo supo explicar.',
  'Encontró una respuesta inventada en su tarea y se la llevó a la mesa de revisión, con la fuente.',
  'Sube al mirador de noche a mirar la niebla: dice que ahí está lo que todavía nadie sabe.'
];
const RASGOS_MAESTRO_FU = [ // alineados con LEX().nombres del valle: maestras y maestros inventados de hoy
  'Enseña en el patio, junto al fogón: dice que la mejor pregunta es la que el estudiante no sabía que tenía.',
  'Les pide a sus estudiantes que le expliquen a la IA lo que aprendieron, y que la corrijan cuando se equivoca.',
  'Enseña lengua a los que llegan de lejos: la traducción los trae a la clase, y ella los ayuda a no necesitarla.',
  'Cuida la biblioteca de dos pisos, y la mesa de revisión: «la respuesta vale lo que vale su fuente».',
  'Prepara las defensas: cada uno muestra lo que hizo y cuenta cómo lo hizo, en voz alta, frente al valle.',
  'Llegó de lejos ella también, hace años; hoy enseña en la misma escuela donde aprendió la lengua.'
];
const RASGOS_MAESTRO_CH = [ // alineados con LEX().nombres de Kaifeng (de Bary y Chaffee, Neo-Confucian Education; Chaffee, The Thorny Gates of Learning)
  'Enseñó en las escuelas de Suzhou y de Huzhou con dos salas, la de los clásicos y la de los asuntos. En 1044 la Universidad Imperial copió su método, y después lo llamaron a enseñar en ella.',
  'Reprobó el examen cuatro veces y se fue a enseñar al monte Tai: sus alumnos lo llamaban el maestro del monte Tai. Terminó enseñando en la Academia Imperial.',
  'Alumno de Sun Fu, enseñó en la Universidad Imperial y escribió contra la prosa adornada que premiaba el examen.',
  'Huérfano y pobre, estudiaba comiendo gachas frías: cocía una olla, la dejaba cuajar y la cortaba en cuatro para que le durara el día. Ya ministro, pidió una escuela en cada prefectura.',
  'Dos alumnos llegaron a su casa y lo encontraron dormitando; esperaron de pie en la puerta, sin despertarlo, y cuando abrió los ojos la nieve tenía un pie de alto.',
  'Reprobó el examen tres veces y ahora enseña en una aldea: los niños aprenden a leer con el Texto de los mil caracteres y los Cien apellidos, y él prepara para el examen al hijo del terrateniente.'
];
const NOMBRES_SANTIAGO = ['Juan', 'Rosa', 'José', 'Carmen', 'Manuel', 'Mercedes', 'Pedro', 'Tránsito', 'Francisco', 'Rosario', 'Luis', 'Dolores', 'Antonio', 'Javiera', 'Ramón', 'Isidora', 'Diego', 'Ignacia', 'Tomás', 'Amelia'];
const RASGOS_SANTIAGO = [
  'Es monitor de su grupo a los diez años: se sabe el cartel de memoria y lo canta antes que nadie.',
  'Escribe con el dedo en la caja de arena y borra con la mano, como manda el maestro.',
  'Su papá vende leña en la Chimba y la manda a la escuela aunque la necesita en el carretón.',
  'Va a la escuela de niñas de la parroquia y quiere ser preceptora, como su tía.',
  'Se escapa a mirar a los arrieros que bajan de la cordillera con sus mulas.',
  'Aprendió a leer con el silabario y le lee el diario a su abuela, que no sabe.',
  'Juega a la chueca en la Alameda los domingos, y a la escuela llega con barro.',
  'Su hermano mayor egresó de la Escuela Normal y se fue a Copiapó: le escribe cartas.'
];
const RASGOS_MAESTRO_SA = [ // alineados con LEX().nombres de Santiago
  'Rector de la Universidad de Chile, autor de la Gramática de la lengua castellana destinada al uso de los americanos y del Código Civil. Discutió con Sarmiento sobre cómo se debe escribir.',
  'Fundó un colegio de niñas en 1864 y pidió que las mujeres pudieran dar exámenes para la universidad: lo consiguió en 1877.',
  'Ministro de Instrucción de joven, presidente después: le dio a Sarmiento la Escuela Normal y firmó la ley de 1860.',
  'Dirigió un colegio de niñas y, con Tarragó, logró que las mujeres entraran a la universidad (el decreto Amunátegui, 1877).',
  'Escribió, con su hermano, el informe que pidió más escuelas para el pueblo (De la instrucción primaria en Chile, 1856).',
  'Enseña a doscientos niños en un solo salón, con sus monitores y sus semicírculos: el método de Lancaster.'
];
const RASGOS_MAESTRO_BA = [ // alineados con LEX().nombres de Bagdad
  'Se cuenta que alquilaba de noche las tiendas de los libreros para leer todo lo que había. Escribió un libro de los animales y otro en defensa de los maestros.',
  'Sabeo de Harrán: tradujo a Euclides y a Ptolomeo, y corrigió lo que otros habían traducido mal.',
  'Escribe tan bien que le dicen «la escritora»; da ijazas a hombres y a mujeres.',
  'Calculó el tamaño de la Tierra con los astrónomos de al-Mamún: su libro de astronomía se leyó en Europa durante siglos.',
  'Dirige el hospital y enseña a los médicos junto a la cama del enfermo.',
  'Dice que la verdad hay que aceptarla venga de donde venga, aunque sea de pueblos lejanos.'
];
const RASGOS_MAESTRO_AL = [ // alineados con LEX().nombres de Alejandría
  'Le dicen Beta: segundo en todo, y el primero en medir la Tierra.',
  'Escribió ciento veinte libros para decir dónde está cada libro. Y dijo que «un libro grande es un gran mal».',
  'Estudia cómo es el cuerpo por dentro: el primero que lo hizo a la vista de todos, y el que mejor lo enseñó.',
  'Inventó los acentos del griego para que los extranjeros lo leyeran bien.',
  'Sabe cortar un cono de cuatro maneras, y de cada corte saca una curva.',
  'Lee a Homero verso por verso y marca con una raya cada uno que le parece agregado.'
];
const RASGOS_MAESTRO_AT = [ // alineados con LEX().nombres de Atenas
  'Enseña las letras con la tablilla y el estilo: escribir y borrar, escribir y borrar.',
  'Enseñó retórica a Pericles, dice el Menexeno; que sea cierto se discute, que enseñaba no.',
  'Cuida el cuerpo como quien cuida el saber: con arena, aceite y paciencia.',
  'Afina la lira antes que el ánimo del que la toca.',
  'Cobra por enseñar y no le da vergüenza: dice que el zapatero también cobra.',
  'Fue aprendiz aquí y ahora enseña: la escuela se enseña a sí misma.'
];
const RASGOS_EGIPTO = [
  'Escribe su nombre en jeroglífico y en hierático. Presume solo un poco.',
  'Cree que el gato de la Casa entiende cuando le leen.',
  'Sueña con medir campos junto al río grande.',
  'Su rollo de práctica tiene más remiendos que papiro.',
  'Recita las Instrucciones de memoria, con voz de sabio.',
  'Mezcla la tinta negra más pareja de todo el patio.',
  'Dibuja pájaros en los márgenes cuando nadie mira.',
  'Cuenta en fracciones: medio pan, un tercio de higo.',
  'Guarda su pincel detrás de la oreja, como los maestros.',
  'Dice que de grande escribirá en las paredes de un templo.'
];
const RASGOS_MAESTRO_EG = [ // alineados con LEX().nombres de Egipto
  'Enseña como manda el sebayt: primero escuchar, después hablar.',
  'Corrige en tinta roja, pero elogia en voz alta.',
  'Sabe qué estrella anuncia la crecida.',
  'Canta las fracciones para que no duelan.',
  'Mide un campo con tres nudos y una mirada.',
  'El más joven del oficio: aún guarda su primera paleta.'
];
const NOMBRES_ESCUELA = ['Tomasito', 'Lupita', 'Ernestina', 'Facundo', 'Chela', 'Ramoncito', 'Delfina', 'Justino', 'Nicanora', 'Herminio', 'Panchita', 'Eulogio', 'Margarita', 'Teodoro', 'Azucena', 'Casimiro', 'Refugio', 'Leocadia', 'Filomena', 'Anselmito', 'Perpetua', 'Baldomero', 'Cándida'];
const RASGOS_CLAN = [
  'Sabe imitar el canto de siete pájaros distintos.',
  'Colecciona piedritas que brillan al sol.',
  'Ya distingue la huella del bisonte de la del ciervo.',
  'Le tiene más miedo a la oscuridad que al mamut.',
  'Pregunta «¿y por qué?» hasta agotar a los mayores.',
  'Guarda una pluma blanca para la buena suerte.',
  'Aprendió a encontrar agua siguiendo a las abejas.',
  'Cuenta con los dedos… y sigue con los del vecino.',
  'Nadie junta bayas dulces más rápido.',
  'Dice que las estrellas son fogatas de otros clanes.'
];
const RASGOS_ESCUELA = [
  'Tiene la letra más redonda de toda la fila.',
  'Esconde una rana en el bolsillo del guardapolvo.',
  'Ya se sabe las tablas del 2 y del 3 sin mirar.',
  'Sueña con manejar la locomotora del pueblo.',
  'Siempre levanta la mano, sepa o no sepa.',
  'Trae flores para la maestra los lunes.',
  'Lee de corrido desde los cinco años.',
  'Es imbatible a las canicas en el recreo.',
  'Cuida que nadie borre la pizarra antes de tiempo.',
  'Comparte su pan con quien no trajo.'
];
const RASGOS_GUIA = [ // alineados con LEX().nombres del fogón
  'Lee en el cielo cuándo vuelven las lluvias y las manadas.',
  'Sigue un rastro de tres días como si fuera de esta mañana.',
  'Conoce cada hierba: cuál cura, cuál alimenta, cuál no se toca.',
  'Talla las puntas más finas del clan… y enseña el truco.',
  'Modela el barro y la paciencia por partes iguales.',
  'Sabe dónde beben los ciervos cuando el río baja.'
];
const RASGOS_MAESTRO = [ // alineados con BALANCE.docente.nombres
  'Escribe en la pizarra con letra de imprenta.',
  'Toca la campana con puntualidad de relojero.',
  'Se sabe el nombre de cada alumno… y el de sus mascotas.',
  'Corrige cuadernos hasta que se pone el sol.',
  'Sus clases de geografía son viajes sin salir del aula.',
  'Cita a los clásicos hasta en el recreo.'
];
const FICHAS_FIJAS = {
  narrador: { emoji: '🔥', titulo: 'Okim', rol: 'narrador del círculo', linea: 'Aprendió las historias escuchando y ahora las hace viajar. Cuando cae la noche, su voz es la maestra del clan.' },
  circulo0: { emoji: '🔥', titulo: 'Ipa', rol: 'aprendiz del clan', linea: 'Escucha las historias con los ojos como platos.' },
  circulo1: { emoji: '🔥', titulo: 'Ruk', rol: 'aprendiz del clan', linea: 'Junto al fuego se le olvida hasta el hambre.' },
  circulo2: { emoji: '🔥', titulo: 'Yara', rol: 'aprendiz del clan', linea: 'Mañana repetirá el cuento palabra por palabra.' },
  percu: { emoji: '🥁', titulo: 'Dun', rol: 'percusionista del clan', linea: 'Marca en el tambor el ritmo que convoca al círculo.' },
  cuentero: { emoji: '🦴', titulo: 'Vesa', rol: 'guardiana de las muescas', linea: 'Repasa el hueso tallado: una muesca por cada luna.' },
  pintor: { emoji: '🖐️', titulo: 'Okar', rol: 'artista de la caverna', linea: 'Pinta el bisonte con la mano llena de ocre: que el clan recuerde.' },
  radio: { emoji: '📻', titulo: 'doña Genoveva', rol: 'oyente fiel', linea: 'No se pierde ni una lección por el aire.' },
  linterna: { emoji: '🎞️', titulo: 'don Práxedes', rol: 'espectador', linea: 'Espera a oscuras la próxima imagen de la linterna mágica.' },
  huerto0: { emoji: '🌱', titulo: 'Cipriano', rol: 'estudiante', linea: 'Aprende haciendo: hoy le toca regar el huerto.' },
  huerto1: { emoji: '💧', titulo: 'Rosalía', rol: 'estudiante', linea: 'Observa el pozo y anota lo que descubre.' },
  pelota0: { emoji: '⚽', titulo: 'el Ñato', rol: 'estudiante', linea: 'El recreo también enseña: nadie ataja como él.' },
  pelota1: { emoji: '⚽', titulo: 'Quique', rol: 'estudiante', linea: 'Jura que ese gol lo vio todo el pueblo.' },
  caza0: { emoji: '🦣', titulo: 'Tarok', rol: 'aprendiz de cazador', linea: 'Lleva tres lunas practicando el silencio. Aun así, el mamut lo escucha.' },
  caza1: { emoji: '🦣', titulo: 'Ussa', rol: 'la que planea', linea: 'Dibuja el plan en la tierra: tú por aquí, yo por allá. El mamut no lee planos y aun así gana.' },
  caza2: { emoji: '🦣', titulo: 'Kimo', rol: 'aprendiz de cazador', linea: 'Su récord: tocarle la lana y salir rodando. El clan entero aplaudió.' },
  caza3: { emoji: '🦣', titulo: 'Wen', rol: 'la que espera', linea: 'Se sumó cuando la partida aprendió que hacen falta más manos. Su oficio es no moverse hasta que toque.' },
  caza5: { emoji: '🦣', titulo: 'Nera', rol: 'la que cuenta la caza', linea: 'No persigue: mira y recuerda. Esa noche es ella quien cuenta lo que pasó, y así la cacería se aprende dos veces.' },
  caza4: { emoji: '🦣', titulo: 'Doro', rol: 'el que avisa', linea: 'No lanza: silba. Descubrió que avisar a tiempo vale tanto como correr, y nadie se lo discute.' },
  mamut: { emoji: '🦣', titulo: 'el Mamut', rol: 'el invicto de la estepa', linea: 'Ninguna partida lo alcanzó jamás: ni un mechón de lana perdido. Huye a tiempo, vuelve con la estación, y en cada intento el clan sale sabiendo algo más.' },
  choza0: { emoji: '🛖', titulo: 'la choza de Iri', rol: 'el primer hogar', linea: 'Adobe y paja junto al campo. Iri cuelga espigas de la primera cosecha sobre la puerta, para que el año nuevo aprenda el camino.' },
  choza1: { emoji: '🛖', titulo: 'la choza de Bruk', rol: 'hogar del pastor', linea: 'Huele a lana y a leche. Bruk duerme con la puerta abierta: dice que el rebaño avisa mejor que cualquier perro.' },
  choza2: { emoji: '🛖', titulo: 'la choza de Naia y Kel', rol: 'hogar de oficios', linea: 'Vasijas en la entrada y un telar adentro: la primera casa donde se vive del oficio, no de la suerte.' },
  recole0: { emoji: '🫐', titulo: 'Maru', rol: 'recolectora', linea: 'Conoce cada mata de bayas de la estepa. Enseña cuáles pintan bien y cuáles doblan la panza.' },
  recole1: { emoji: '🫐', titulo: 'Ila', rol: 'recolectora', linea: 'Vuelve siempre con el cesto lleno y una piedra rara de regalo. Dice que el suelo habla, si lo miras.' },
  recole2: { emoji: '🫐', titulo: 'Ossa', rol: 'recolector', linea: 'Silba mientras junta leña. Su montón junto al fuego nunca se acaba, y nadie lo ve trabajar.' },
  pescador: { emoji: '🎣', titulo: 'Kelo', rol: 'el de la orilla', linea: 'Puede pasar la mañana entera sin decir una palabra. A su lado siempre hay alguien pequeño, quieto, mirando el agua con él: hay oficios que no se explican, se acompañan. Cazar se aprende en grupo, con señales y roles; esto se aprende de uno en uno, callados.' },
  pescaprendiz: { emoji: '🎣', titulo: 'Ami', rol: 'aprende a esperar', linea: 'No ha sacado nada todavía, y lleva media mañana sentada. Kelo tampoco le ha dicho cómo: solo le hizo sitio. Aprender a esperar es la primera parte del oficio, y la única que no se puede enseñar hablando.' },
  aprendiz0: { emoji: '🫐', titulo: 'Tulu', rol: 'aprende mirando a Maru', linea: 'Nadie le ha dado una lección. Se arrima, mira un rato largo y después prueba: se agacha medio paso tarde y se le caen la mitad de las bayas. Así aprendió a recolectar casi todo el mundo durante casi toda la historia.' },
  aprendiz1: { emoji: '🫐', titulo: 'Luma', rol: 'aprende mirando a Ila', linea: 'Copia hasta el modo de sujetar el cesto, aunque el suyo va vacío. Imitar entero antes de entender es como se empieza, no un error.' },
  aprendiz2: { emoji: '🪵', titulo: 'Bibo', rol: 'aprende mirando a Ossa', linea: 'Junta ramitas del tamaño de su brazo y las apila torcidas junto al montón bueno. Nadie se las endereza: ya aprenderá mirando cuál arde mejor.' },
  coveja0: { emoji: '🐑', titulo: 'Nube', rol: 'oveja del corral', linea: 'La primera en entrar al corral y la primera en salir. Bruk jura que ya reconoce su nombre.' },
  coveja1: { emoji: '🐑', titulo: 'Copo', rol: 'oveja del corral', linea: 'Bala cuando el conteo se equivoca. Los aprendices dicen que sabe contar hasta dos.' },
  circulo3: { emoji: '🧒', titulo: 'Ludo', rol: 'del círculo', linea: 'Se sumó al corro cuando ya no cabía nadie más, y le hicieron sitio. Repite las historias en voz baja para no olvidarlas.' },
  circulo4: { emoji: '🧒', titulo: 'Ama', rol: 'del círculo', linea: 'Pregunta el final antes de que llegue. La Abuela dice que preguntar así también es contar.' },
  circulo5: { emoji: '🧒', titulo: 'Bru', rol: 'del círculo', linea: 'El último en llegar y el último en irse. Aprendió que la historia buena se queda a la brasa.' },
  coveja2: { emoji: '🐑', titulo: 'Brisa', rol: 'oveja del corral', linea: 'Nació el año que el cerco creció. Duerme siempre en el rincón nuevo, como si lo hubiera pedido.' },
  coveja3: { emoji: '🐑', titulo: 'Tizne', rol: 'oveja del corral', linea: 'La única con el vellón manchado de ceniza: se acercó demasiado al fogón y no aprendió la lección.' },
  coveja4: { emoji: '🐑', titulo: 'Séptima', rol: 'oveja del corral', linea: 'La contaron al final y por eso se llama así. Nima insiste en que el número también es un nombre.' },
  conteo: { emoji: '🦴', titulo: 'el hueso de conteo', rol: 'la memoria de lo que hay', linea: '' },
  // la fogata NO tenía ficha: con la brasa alta o en cooldown el clic no ejecuta nada, y sin ficha se
  // quedaba mudo. Es el elemento más tocado del juego; callar ahí es justo lo que el dock ya rechazó
  fogata: { emoji: '🔥', titulo: 'la fogata', rol: 'el corazón del clan', linea: '' },
  diada0: { emoji: '🎣', titulo: 'Suri', rol: 'de la orilla oeste', linea: 'Aprendió con Kelo y ahora tiene su propio sitio. No da lecciones: se hace a un lado cuando llega alguien más pequeño.' },
  diada1: { emoji: '🎣', titulo: 'Tono', rol: 'del recodo del norte', linea: 'Dice que el mejor sitio es donde el agua se queda quieta. Nunca ha explicado por qué; hay que sentarse al lado para verlo.' },
  diada2: { emoji: '🎣', titulo: 'Mira', rol: 'de la orilla sur', linea: 'Pesca poco y despacio, y aun así vuelve con algo cada tarde. Los pequeños se pelean por su sitio.' },
  diada3: { emoji: '🎣', titulo: 'Beku', rol: 'del extremo lejano', linea: 'Se fue al final de la orilla porque allí no habla nadie. Al mes ya tenía a alguien pequeño al lado, callado también.' },
  pescapeq0: { emoji: '🐟', titulo: 'Nael', rol: 'ya no mira: pesca', linea: 'Su primer pez fue tan pequeño que lo devolvió. Nadie se rio, y eso también se aprende en la orilla.' },
  pescapeq1: { emoji: '🐟', titulo: 'Iru', rol: 'ya no mira: pesca', linea: 'Trae menos que un adulto porque camina más lento y carga menos, no porque sepa menos. Lo que saca ya cuenta en el reparto.' },
  pescapeq2: { emoji: '🐟', titulo: 'Sela', rol: 'ya no mira: pesca', linea: 'Se sentó una tarde a mirar y a la siguiente ya tenía sedal. Nadie le dijo cuándo estaba lista.' },
  pescapeq3: { emoji: '🐟', titulo: 'Ubo', rol: 'ya no mira: pesca', linea: 'Habla poco y pregunta menos. Cuando algo no le sale, mira de reojo las manos del de al lado y lo vuelve a intentar.' }, // la línea se arma viva en fichaDe: dice qué espera cuenta y qué se lleva contado
  cueva0: { emoji: '🪨', titulo: 'Duna', rol: 'del abrigo rocoso', linea: 'Entra y sale del abrigo cuidando las pieles y las brasas de reserva. La casa de piedra nunca queda sola.' },
  cueva1: { emoji: '🪨', titulo: 'Kur', rol: 'del abrigo rocoso', linea: 'Guarda adentro lo que el clan más quiere: las pinturas, el hueso contado y el fresco del verano.' },
  dictado2: { emoji: '🏺', titulo: 'Nisaba', rol: 'escriba al dictado', linea: 'Copia sin levantar la vista. Su tablilla tiene menos errores que la del vecino, y el vecino lo sabe.' },
  dictx0: { emoji: '🗣️', titulo: 'Ku-Aya', rol: 'escribe al dictado', linea: 'Le hicieron sitio ayer y hoy ya no mira de reojo: la misma voz alcanza para todas las tablillas.' },
  dictx1: { emoji: '🗣️', titulo: 'Ur-Bau', rol: 'escribe al dictado', linea: 'El más nuevo del corro. Espera su turno escuchando, que es la mitad del oficio.' },
  practicanteSu: { emoji: '✒️', titulo: 'Enlil-ti', rol: 'practica la cuña', linea: 'Llena tablillas de renglones que nadie leerá: la mano aprende sola, a fuerza de barro.' },
  sellar: { emoji: '🧮', titulo: 'las cuentas del templo', rol: 'fichas por sellar', linea: 'Grano que entró, rebaño que salió: cada ficha espera su sello dentro del barro. Cuando haya cuentas pendientes, <b>tócalas</b>: el templo paga su administración.' },
  segador0: { emoji: '🌾', titulo: 'la segadora del templo', rol: 'la cosecha que paga la escuela', linea: 'Siega la cebada del templo espiga a espiga: de su trabajo sale el trimestre que sostiene la edubba.' },
  segador1: { emoji: '🌾', titulo: 'el segador del templo', rol: 'el grano que se vuelve saber', linea: 'Junta lo segado antes de la lluvia. Dice que cada gavilla suya termina siendo una tablilla de alguien.' },
  barcaviajera: { emoji: '🛶', titulo: 'la barca del río', rol: 'la carretera de Sumer', linea: 'Baja con la corriente cargada de jarras y vuelve a pura pértiga. El río reparte lo que la ciudad produce: por eso la ciudad vive pegada al agua.' },
  oferente: { emoji: '🏺', titulo: 'el oferente', rol: 'la ciudad que sube a dar gracias', linea: 'De vez en cuando alguien cruza la plaza con su jarra y sube al Eanna: el grano y el aceite también rezan. Lleva la ofrenda de todos.' },
  sacerdote: { emoji: '✨', titulo: 'el sacerdote del Eanna', rol: 'guardián de la llama de Inanna', linea: 'Atiende el fuego del santuario para que nunca se apague: la diosa del lucero mira la ciudad desde lo alto.' },
  santuario: { emoji: '⭐', titulo: 'el Eanna, santuario de Inanna', rol: 'la casa de la diosa del lucero', linea: 'Inanna, señora del amanecer y del atardecer, reina desde la cima: la estrella de ocho puntas es su signo. Los acadios la llamarán <b>Ishtar</b>; el Levante, <b>Astarté</b>. <b>Enheduanna</b>, suma sacerdotisa de la luna en Ur, le escribió los primeros himnos firmados de la historia.' },
  edubbaCasa: { emoji: '🏛️', titulo: 'la casa de las tablillas', rol: 'la primera escuela', linea: 'Adobe, esteras y un patio: la edubba. Aquí enseñar se volvió oficio y aprender se volvió lugar. Y crece contigo: primero la obra, después las paredes, y al final el nicho de Nisaba.' },
  cebadatemplo: { emoji: '🌾', titulo: 'el campo del templo', rol: 'la cebada que paga la escuela', linea: 'La ciudad siembra y el templo recoge: cada trimestre su cosecha paga a la edubba, y de este grano salen las cuentas que sellas.' },
  mesacopia: { emoji: '🏛️', titulo: 'la mesa de copia', rol: 'el modelo y el intento', linea: 'La tablilla del maestro arriba, la del aprendiz abajo. Cuando haya copias esperando, <b>tócala</b>: la cuña torcida se ve, se amasa y se rehace. Y cada error corregido <b>mejora la mano de la casa para siempre</b>: los sellos y el dictado rinden más (hasta +40%).' },
  patiolascas: { emoji: '🪨', titulo: 'el patio de las lascas', rol: 'donde errar no cuesta', linea: 'Cada ejercicio se puede ensayar aquí, en una lasca gratis: el maestro la devuelve <b>marcada en rojo</b> y ese rojo acredita. El montón de lascas usadas es la huella de todos los errores baratos: Deir el-Medina entero es un patio como este.' },
  mesapapiro: { emoji: '📃', titulo: 'la mesa del papiro', rol: 'donde lo ensayado se vuelve permanente', linea: 'La hoja cara espera bajo las piedras de prensa. Cuando el maestro haya visto <b>prácticas suficientes</b> y quede papiro en el canasto, <b>tócala</b>: lo ensayado se escribe limpio, paga fuerte y entra al archivo.' },
  practicante: { emoji: '🪨', titulo: 'Ipi, el practicante', rol: 'el que borronea sin miedo', linea: 'Raspa su lasca, la borra con el pulgar y vuelve a empezar. Nadie lo apura: la piedra no cobra, y su mano mejora con cada intento devuelto en rojo.' },
  padre: { emoji: '🪷', titulo: 'Ramose, el alfarero', rol: 'un padre con un plan', linea: 'Trae a su hijo de la mano a mirar el patio. «He visto al herrero ante su horno y al albañil bajo el sol», le dice, «pero el escriba no tiene jefe». Es la <b>Sátira de los oficios</b>: el texto que durante siglos convenció a los padres de Egipto de mandar a sus hijos a la escuela.' },
  hijoescriba: { emoji: '👦', titulo: 'Ipu, el hijo del alfarero', rol: 'quizá el próximo escriba', linea: 'Mira el patio de las lascas medio escondido tras su padre. Todavía no sabe que la piedra no cobra los errores. Si se queda, lo sabrá.' },
  cine0: { emoji: '🎞️', titulo: 'doña Clarisa', rol: 'público del cine', linea: 'No se pierde función. Dice que el traqueteo del proyector la ayuda a pensar.' },
  cine1: { emoji: '🎞️', titulo: 'Ramoncito', rol: 'público del cine', linea: 'Se sienta adelante aunque le digan que no. Quiere ver de qué está hecha la luz.' },
  tv0: { emoji: '📺', titulo: 'Selma', rol: 'alumna de la tele-clase', linea: 'Le escribe cartas al teleprofesor. Todavía no le contesta, pero ella no pierde la fe.' },
  tv1: { emoji: '📺', titulo: 'Aurelio', rol: 'alumno de la tele-clase', linea: 'Endereza la antena cuando nieva la pantalla. El aula entera lo aplaude.' },
  maq0: { emoji: '⚙️', titulo: 'Tinita', rol: 'alumna de la máquina', linea: 'Tira la palanca y espera la estrellita. Dice que la máquina nunca se enoja, pero tampoco se ríe.' },
  campo: { emoji: '🌾', titulo: 'el campo de cebada', rol: 'la primera parcela', linea: 'Lo sembrado vuelve multiplicado si se espera al sol. Cuando dore, tócalo: la cosecha es de quien la cuida.' },
  granero: { emoji: '🧺', titulo: 'el granero', rol: 'el excedente del clan', linea: 'Grano de sobra sobre pilotes de piedra. Con la panza segura, por fin queda tiempo para aprender.' },
  nino0: { emoji: '🧒', titulo: 'Tuki', rol: 'niño de la aldea', linea: 'Persigue a Nima alrededor de la choza. Corre como los cazadores que ya no salen: jugar también es aprender.' },
  nino1: { emoji: '🧒', titulo: 'Nima', rol: 'niña de la aldea', linea: 'Nadie la alcanza. Aprendió a contar mirando el rebaño: jura que las ovejas también juegan.' },
  acarreadora: { emoji: '🧺', titulo: 'Sena', rol: 'acarreadora', linea: 'Del campo al granero con el cesto al hombro. Sabe cuánto entra en cada vasija sin contarlo: lo aprendió cargando.' },
  labrador: { emoji: '🌾', titulo: 'Iri', rol: 'labradora', linea: 'Guardó las mejores semillas en vez de comérselas. Aprender a esperar la cosecha fue su verdadera lección.' },
  curtidora: { emoji: '🦣', titulo: 'Orsa', rol: 'curtidora', linea: 'Raspa la piel con el mismo sílex que la partida ya no lleva. La cacería colgó las lanzas, pero sus manos siguen enseñando lo que aprendieron allá afuera.' },
  pastor: { emoji: '🐑', titulo: 'Bruk', rol: 'pastor', linea: 'Conoce a cada oveja por su balido. Dice que criar enseña más paciencia que cazar.' },
  alfarero: { emoji: '🏺', titulo: 'Naia', rol: 'alfarera', linea: 'Metió barro al fuego y salió piedra hueca. La primera en guardar el grano para el invierno.' },
  tejedor: { emoji: '🧶', titulo: 'Kel', rol: 'tejedor', linea: 'Sigue el patrón hilo por hilo, como quien recita pasos en orden. Teje mientras otros siembran.' },
  copista: { emoji: '🧱', titulo: 'Igmil', rol: 'copista de la edubba', linea: 'Copia la misma línea por décima vez: ya casi no le tiembla la cuña.' },
  dictado: { emoji: '✒️', titulo: 'Belessunu', rol: 'la que dicta', linea: 'Lee en voz alta y espera: el barro no perdona las prisas.' },
  cuentafichas: { emoji: '🧮', titulo: 'Ur-Nammu', rol: 'contador aprendiz', linea: 'Cuenta ovejas de barro: llega a sesenta y vuelve a empezar.' },
  recitador: { emoji: '📜', titulo: 'Enlil-bani', rol: 'recitador', linea: 'Se sabe la lista de estrellas… casi toda.' },
  lector: { emoji: '📃', titulo: 'Ahmose', rol: 'lector de papiros', linea: 'Desenrolla despacio: los rollos viejos crujen como el pan.' },
  pintora: { emoji: '🎨', titulo: 'Nefert', rol: 'la de las dos tintas', linea: 'Negro para el texto, rojo para lo importante. Igual que hoy.' },
  oyente2: { emoji: '⚖️', titulo: 'Huy', rol: 'el que escucha', linea: 'Ptahhotep dijo que escuchar es lo primero. Huy practica desde entonces.' },
  tensador0: { emoji: '📐', titulo: 'Ipuy', rol: 'tensador de cuerda', linea: 'Sostiene su punta como si el campo entero dependiera de eso. Depende.' },
  tensador1: { emoji: '📐', titulo: 'Tui', rol: 'tensadora de cuerda', linea: 'Cuenta los nudos dos veces. El ángulo recto no perdona.' },
  gato: { emoji: '🐈', titulo: 'Miu', rol: 'guardián de la Casa de la Vida', linea: 'Camina entre los rollos como si los hubiera escrito. Nadie lo desmiente.' },
  oveja0: { emoji: '🐑', titulo: 'Lahar', rol: 'oveja del templo', linea: 'Figura en los cálculos de arcilla: es, literalmente, parte del plan de estudios.' },
  oveja1: { emoji: '🐑', titulo: 'Sila', rol: 'oveja del templo', linea: 'Se come la cebada de la parcela didáctica. Nadie la denuncia.' },
  garza: { emoji: '🪶', titulo: 'Bennu', rol: 'garza del Nilo', linea: 'Pesca en la orilla con paciencia de escriba.' },
  esfinge: { emoji: '🦁', titulo: 'La Gran Esfinge', rol: 'guardiana de Guiza', linea: 'Lleva mirando el amanecer más de 4500 años. Todavía no parpadea.' },
  piramides: { emoji: '🔺', titulo: 'Las pirámides de Guiza', rol: 'Keops, Kefrén y Micerino', linea: 'Cuando se abrió esta Casa de la Vida ya llevaban mil años en pie, revestidas de caliza blanca que devolvía el sol. Kefrén parece la más alta porque se alza sobre una roca más elevada; la de Keops lo es.' },
  templo: { emoji: '🏛️', titulo: 'La Casa de la Vida', rol: 'Per Ankh, junto al templo', linea: 'Aquí se copian, se guardan y se enseñan los libros. En cada torre del pilono, el rey le ofrece a Thot, señor de los jeroglíficos, la paleta del escriba.' },
  poblado: { emoji: '🏘️', titulo: 'El poblado de los artesanos', rol: 'Deir el-Medina', linea: 'Aquí viven los que tallan las tumbas del valle, y aquí aprenden sus hijos: de este barrio salieron miles de lascas escolares, la montaña de errores baratos sobre la que se escribió cada papiro caro.' },
  cabra: { emoji: '🐐', titulo: 'Henut', rol: 'cabra del poblado', linea: 'Come lo que encuentra, que en el desierto es poco. Sabe dónde vive cada aprendiz.' },
  mastaba: { emoji: '⚱️', titulo: 'Las mastabas', rol: 'tumbas de los notables', linea: 'Bancos de piedra con una puerta falsa por donde el difunto sale a recibir sus ofrendas. Las tallan los artesanos del poblado: en sus ratos libres, sus hijos aprenden a escribir sobre las lascas que sobran.' },
  cocodrilo: { emoji: '🐊', titulo: 'Sobek', rol: 'cocodrilo del Nilo', linea: 'Toma el sol en la ribera con la boca abierta, que es como se enfría. Los egipcios le rezaban y le temían a la vez; en este valle solo mira pasar la falúa.' },
  acropolis: { emoji: '🏛️', titulo: 'La Acrópolis', rol: 'la roca de la ciudad', linea: 'Arriba, el Partenón: mármol del Pentélico y una diosa de oro y marfil adentro. Se ve desde toda Atenas, y Atenas se ve entera desde ahí.' },
  stoa: { emoji: '🏛️', titulo: 'La stoa de Zeus Eleuterio', rol: 'el pórtico del ágora', linea: 'Columnas al frente, dos alas que abrazan la plaza y Zeus el Liberador delante. A la sombra se conversa, se compra, se enseña y se juzga: la escuela de Atenas antes de que hubiera escuela. Aquí encuentra Jenofonte a Sócrates, sentado, conversando.' },
  altar: { emoji: '🏛️', titulo: 'El altar de los Doce Dioses', rol: 'el kilómetro cero', linea: 'Desde este altar se medían las distancias del Ática. El centro del mundo, para quien vivía aquí.' },
  banco: { emoji: '🪑', titulo: 'El banco del grammatistes', rol: 'donde se DICE la respuesta', linea: 'El maestro de letras se sienta aquí y dicta lo que hay que saber. Rápido, seguro y olvidable: toca una duda y decídela aquí, o llévala al ágora.' },
  agora: { emoji: '❓', titulo: 'El claro del ágora', rol: 'donde se PREGUNTA', linea: 'Aquí nadie responde: se pregunta. El que trae la duda se va a caminar con ella, no sabe, y vuelve sabiendo. Más lento, y suyo para siempre.' },
  palestra: { emoji: '🏃', titulo: 'La palestra', rol: 'el patio de arena', linea: 'Aquí se entrena el cuerpo y, entre carrera y carrera, se conversa: Sócrates entraba a las palestras a hacer preguntas.' },
  olivar: { emoji: '🫒', titulo: 'El olivar de Academo', rol: 'el terreno de la Academia', linea: 'Un bosque sagrado con olivos viejos a las afueras. Platón compró un pedazo y puso ahí su escuela: novecientos años duró.' },
  colmena: { emoji: '🍯', titulo: 'Las colmenas', rol: 'la cera del Himeto', linea: 'La miel del monte Himeto era famosa en toda Grecia; la cera de estas colmenas cubre las tablillas donde se aprende a escribir y a borrar.' },
  platano: { emoji: '🌳', titulo: 'El plátano del Ilisos', rol: 'el árbol del Fedro', linea: 'Bajo este árbol, a la orilla del arroyo, Sócrates y Fedro se sentaron a conversar sobre el amor y la escritura. Aprender también es salir de la ciudad.' },
  ilisos: { emoji: '💧', titulo: 'El Ilisos', rol: 'el arroyo de Atenas', linea: 'Chico y frío, corre por fuera de la muralla. Sócrates mojó los pies aquí antes de la conversación más famosa sobre enseñar.' },
  casaAtica: { emoji: '🏠', titulo: 'Las casas de la ciudad', rol: 'de aquí salen cada mañana', linea: 'Cada muchacho sale de su casa con un pedagogo detrás: un esclavo de la familia que lo lleva a la escuela y lo vigila. ⚖️ La escuela de Atenas era para hijos libres, y solo varones; la ficha lo dice porque cozy no es amnesia.' },
  cabraAt: { emoji: '🐐', titulo: 'Amaltea', rol: 'cabra del olivar', linea: 'Come las aceitunas caídas y mira pasar a los filósofos con la misma cara.' },
  escribiente: { emoji: '✍️', titulo: 'El que escribe en la cera', rol: 'aprendiz de letras', linea: 'Escribe con la punta del estilo y, cuando se equivoca, lo gira y alisa la cera con el extremo plano. El error ya no deja huella: se borra y se vuelve a escribir.' },
  liricista: { emoji: '🎵', titulo: 'El kitharistes', rol: 'el maestro de música', linea: 'Enseña la lira de siete cuerdas y los cantos de los poetas. Para los atenienses la música no era adorno: educaba el ánimo (Platón lo discute en la República).' },
  sofista: { emoji: '💰', titulo: 'El sofista', rol: 'el maestro que cobra', linea: 'Protágoras, Gorgias, Hipias: los primeros que hicieron de enseñar un oficio pagado. Sócrates no cobraba, y se lo echaba en cara. ⚖️ El debate sobre si enseñar se cobra empezó aquí, y no se ha cerrado.' },
  muelle: { emoji: '⚓', titulo: 'El muelle del Gran Puerto', rol: 'donde esperan los rollos', linea: 'Aquí dejan los hombres del rey los libros que sacan de los barcos. Un rollo en el muelle todavía no es de nadie: tócalo y ponlo en su estante, que lo que no se cataloga no lo encuentra nadie.' },
  barca: { emoji: '🚣', titulo: 'La barca del puerto', rol: 'los hombres del rey', linea: 'Revisan cada barco que entra y se llevan los libros a copiar (Galeno lo cuenta). ⚖️ Qué se devuelve al dueño, el original o la copia, se decide aquí.' },
  vara: { emoji: '🌞', titulo: 'La vara de Eratóstenes', rol: 'un gnomon en el patio', linea: 'Al mediodía del solsticio, su sombra marca un cincuentavo del círculo. Con eso y la distancia hasta Siene, Eratóstenes midió la Tierra.' },
  barco: { emoji: '⛵', titulo: 'El mercante', rol: 'trae libros de todo el mar', linea: 'Ánforas, cubos de cuero con rollos parados y, en la proa, el ojo pintado que mira el camino. En invierno no navega: el mar está cerrado.' },
  biblioteca: { emoji: '📚', titulo: 'La Biblioteca', rol: 'todos los libros del mundo', linea: 'Quiso tenerlos todos y los ordenó por género y por autor. ⚖️ Cuántos rollos tuvo nadie lo sabe; tampoco ardió en una noche: se fue apagando durante siglos.' },
  museo: { emoji: '🏛️', titulo: 'El Museo', rol: 'la casa de las Musas', linea: 'Sabios pagados por el rey, que viven, comen y discuten juntos (Estrabón, XVII 1, 8). La primera casa de investigadores de la historia.' },
  faro: { emoji: '🗼', titulo: 'El Faro', rol: 'una de las siete maravillas', linea: 'La torre de Sóstrato de Cnido, «a los dioses salvadores, por los navegantes». De noche, un fuego; de día, el humo. Lo derribaron los terremotos de la Edad Media.' },
  serapeo: { emoji: '⛩️', titulo: 'El Serapeo', rol: 'la biblioteca hija', linea: 'El templo de Serapis en la colina de Racotis, con una segunda biblioteca en sus pórticos, abierta a todos. Así lo vio Rufino: más de cien escalones, y en el patio la columna roja de Diocleciano, que sigue en pie. Lo destruyeron en el 391.' },
  navio: { emoji: '🌾', titulo: 'El navío del grano', rol: 'rumbo a Roma', linea: 'En otoño zarpa la flota del grano: Roma come el trigo del Nilo. Luciano vio uno en el Pireo, el Isis, con la popa curva rematada en una cabeza de ganso dorada (El navío, 5).' },
  puertakufa: { emoji: '🐪', titulo: 'La puerta de Kufa', rol: 'donde esperan los manuscritos', linea: 'Por aquí entran las caravanas de Siria y de Bizancio. Los manuscritos que traen esperan a un traductor: tócalos y elige cómo traducirlos, palabra por palabra o por el sentido.' },
  mesatrad: { emoji: '✒️', titulo: 'La mesa de los traductores', rol: 'del griego al árabe', linea: 'Cada asiento, un traductor con su manuscrito y su hoja de papel. Traducían cristianos, sabeos, persas, judíos y musulmanes, y muchas obras pasaban primero por el siríaco.' },
  casasab: { emoji: '📚', titulo: 'La Casa de la Sabiduría', rol: 'la biblioteca del califa', linea: 'Aquí se guarda lo traducido. ⚖️ No fue una universidad: fue la biblioteca y el archivo del palacio (Gutas), y la traducción la pagaron muchos.' },
  halqa: { emoji: '🕌', titulo: 'La halqa', rol: 'el círculo del maestro', linea: 'El maestro junto a su columna y los estudiantes alrededor. Quien termina un libro con él recibe la ijaza, el permiso de enseñarlo.' },
  cadi: { emoji: '⚖️', titulo: 'El banco del cadí', rol: 'donde se reparten las herencias', linea: 'El juez del zoco reparte lo que dejan los muertos entre sus herederos: es el problema con que al-Juarismi enseñaba el álgebra.' },
  molino: { emoji: '💧', titulo: 'El molino de papel', rol: 'la noria del canal', linea: 'La noria mueve los mazos que baten los trapos; la pasta se toma con un molde de cañas. De aquí sale el papel de Bagdad, y sus luces dejan hojas para copiar.' },
  zoco: { emoji: '🏪', titulo: 'El zoco de los libreros', rol: 'el suq al-warraqin', linea: 'Más de cien tiendas de libros y copistas. Aquí se copia y se vende lo traducido, y se cuenta que al-Jahiz alquilaba los puestos de noche para leer.' },
  palacio: { emoji: '🟢', titulo: 'La Cúpula Verde', rol: 'el palacio del califa', linea: 'En el centro exacto de la ciudad redonda, el palacio de al-Mansur con su cúpula verde y, en la punta, un jinete con su lanza. Se derrumbó en una tormenta en el 941.' },
  mezquita: { emoji: '🕌', titulo: 'La gran mezquita', rol: 'junto al palacio', linea: 'De adobe y ladrillo, con columnas de madera. Además de rezar, aquí se enseñaba: cada maestro tenía su columna.' },
  tigris: { emoji: '🌊', titulo: 'El Tigris', rol: 'el río de Bagdad', linea: 'Baja de las montañas de Anatolia y crece en primavera con el deshielo. Por él llegan las barcas redondas, las quffa, y lo cruza un puente de barcas.' },
  quffa: { emoji: '🛶', titulo: 'La quffa', rol: 'la barca redonda', linea: 'Un cesto de mimbre calafateado con brea, redondo como un plato: se usó en el Tigris desde los asirios hasta el siglo XX.' },
  muralla: { emoji: '⭕', titulo: 'La Ciudad Redonda', rol: 'Madinat al-Salam, la ciudad de la paz', linea: 'Al-Mansur la mandó trazar en 762: una muralla circular con cuatro puertas, cada una con el nombre del camino que salía de ella. No quedó nada en pie: la conocemos por las crónicas.' },
  telpochcalli: { emoji: '🛖', titulo: 'El telpochcalli', rol: 'la casa de los jóvenes', linea: 'La escuela del barrio: aquí duermen y aprenden los muchachos a trabajar, a servir a la ciudad y a pelear. Es de todos: no tiene cupo.' },
  calmecac: { emoji: '🔥', titulo: 'El calmécac', rol: 'la casa del linaje', linea: 'Junto al templo, con los sacerdotes: los cantos, la cuenta de los días, los códices y el buen hablar. El fuego de su patio no se apaga nunca.' },
  partera: { emoji: '👶', titulo: 'La casa de la partera', rol: 'donde se presentan los recién nacidos', linea: 'La partera, la tícitl, recibía al niño y le hablaba: «has venido a la tierra, hijo mío…». Después los padres lo prometían a una escuela. Toca a los que esperan y elige: el telpochcalli del barrio o el calmécac del templo.' },
  cuicacalli: { emoji: '🥁', titulo: 'La cuicacalli', rol: 'la casa del canto', linea: 'Cada tarde, los muchachos y las muchachas de doce a quince años venían a aprender cantos y danzas, hasta entrada la noche. Al caer la tarde, tócala: el canto empieza con el huéhuetl.' },
  anciano: { emoji: '🗣️', titulo: 'El anciano', rol: 'el que dice la palabra antigua', linea: 'Los huehuetlatolli, la palabra de los viejos: cómo se vive bien en la tierra, dicho de memoria ante los jóvenes. Una vez por estación, tócalo y escucha.' },
  templo: { emoji: '🛕', titulo: 'El Templo Mayor', rol: 'el centro del mundo mexica', linea: 'Una pirámide con dos templos en lo alto: Huitzilopochtli, el sol y la guerra, y Tláloc, la lluvia. Se amplió siete veces, cada una cubriendo la anterior; sus restos se excavan hoy en el centro de la Ciudad de México. ⚖️ En sus fiestas había sacrificios: lo cuentan las fuentes y la arqueología.' },
  calzada: { emoji: '🛤️', titulo: 'Las calzadas', rol: 'los caminos sobre el lago', linea: 'Tres calzadas de tierra y piedra unían la isla con la orilla: Tepeyac, Tlacopan e Iztapalapa. Tenían puentes de madera que se quitaban: el agua seguía pasando, y la ciudad se cerraba.' },
  chinampa: { emoji: '🌽', titulo: 'Las chinampas', rol: 'las huertas sobre el agua', linea: 'Franjas de lodo y plantas tejidas sobre el lago, sujetas con sauces: daban hasta siete cosechas al año. Aquí trabajan los jóvenes del telpochcalli: el tequio, el trabajo común del barrio.' },
  canoa: { emoji: '🛶', titulo: 'Las canoas', rol: 'las calles de agua', linea: 'Por los canales y el lago iba todo en canoa: el maíz, el tributo, las piedras, la gente. Se dice que había decenas de miles.' },
  embarcadero: { emoji: '🛶', titulo: 'El embarcadero', rol: 'donde llega el tributo', linea: 'Aquí atracan las canoas que traen el tributo de las provincias: mantas, cacao, plumas y pliegos de amate para los códices. Sus luces dan el amate.' },
  tianguis: { emoji: '🌽', titulo: 'El tianguis de Tlatelolco', rol: 'el gran mercado', linea: 'En la ciudad gemela del norte, el mercado más grande que vieron los españoles: cada mercancía en su calle (maíz, chile, cacao, mantas, barro, plumas) y jueces que vigilaban las medidas. Bernal Díaz dice que nunca había visto una plaza tan grande ni tan ordenada.' },
  lago: { emoji: '💧', titulo: 'El lago de Texcoco', rol: 'la ciudad sobre el agua', linea: 'Tenochtitlan se fundó en un islote del lago, hacia 1325, donde un águila se posó sobre un nopal. Para 1500 era una de las ciudades más grandes del mundo, con calzadas, acueducto y un dique contra las inundaciones.' },
  volcanes: { emoji: '🌋', titulo: 'Los volcanes', rol: 'Popocatépetl e Iztaccíhuatl', linea: 'El que humea y la mujer dormida: los dos volcanes nevados que cierran el valle. En la temporada seca se ven limpios desde la ciudad.' },
  campana: { emoji: '🔔', titulo: 'El campanario de San Víctor', rol: 'la campana que parte el día', linea: 'En el claustro, la campana toca las horas del oficio: maitines, laudes, prima, tercia, sexta, nona, vísperas y completas, y cada hora tiene su tarea. Así nació el horario de la escuela. Tócala para armar el horario del día.' },
  abadia: { emoji: '⛪', titulo: 'La abadía de San Víctor', rol: 'la escuela del claustro', linea: 'Fundada en 1108 por Guillermo de Champeaux en la orilla izquierda, fuera de las murallas: canónigos que estudian, una biblioteca famosa y una escuela abierta a los de afuera. Aquí enseñó Hugo, el que te aconseja.' },
  notredame: { emoji: '⛪', titulo: 'Notre-Dame', rol: 'la catedral y su escuela', linea: 'La catedral nueva se empezó en 1163 sobre la isla de la Cité; su escuela, la del obispo, ya era la más famosa de París. Del gremio de sus maestros nació la universidad.' },
  sena: { emoji: '🌊', titulo: 'El Sena', rol: 'el río de París', linea: 'Parte la ciudad en tres: la orilla derecha de los mercaderes, la isla de la Cité con el obispo y el rey, y la orilla izquierda de las escuelas. Por él llegan el vino, la madera y las pieles.' },
  montana: { emoji: '⛰️', titulo: 'La Montaña de Santa Genoveva', rol: 'donde disputaba Abelardo', linea: 'Una colina de la orilla izquierda, con su abadía. Abelardo enseñó aquí cuando no lo dejaban en la Cité, y los estudiantes cruzaron el río detrás de él: así el Barrio Latino quedó de este lado.' },
  fouarre: { emoji: '🌾', titulo: 'La calle de la paja', rol: 'la rue du Fouarre', linea: 'Aquí estaban las escuelas de la Facultad de Artes: los estudiantes oían la lectio sentados en el suelo cubierto de paja. Dante la nombra en la Divina Comedia: «el vico de li strami».' },
  sorbona: { emoji: '🏛️', titulo: 'El colegio de la Sorbona', rol: 'para estudiantes pobres (1257)', linea: 'Roberto de Sorbon, capellán del rey, fundó una casa para que estudiantes pobres de teología tuvieran techo, comida y libros. Su biblioteca tenía los libros encadenados a los atriles para leerlos ahí. El nombre quedó para toda la universidad.' },
  universidad: { emoji: '🎓', titulo: 'La universidad', rol: 'el gremio de maestros y estudiantes', linea: 'Universitas quería decir «el conjunto»: los maestros y estudiantes de París se juntaron como un gremio, con sus estatutos (1215) y su sello. Daban los grados y la licencia para enseñar. Cuando un bachiller espera la licencia, tócala.' },
  pergaminero: { emoji: '🐑', titulo: 'El pergaminero', rol: 'el taller junto al río', linea: 'Las pieles de oveja y de ternera se remojan en cal, se raspan y se estiran en un bastidor hasta quedar finas y blancas. Un libro grande podía gastar las pieles de un rebaño entero. Sus luces dan el pergamino.' },
  petitpont: { emoji: '🌉', titulo: 'El Petit Pont', rol: 'el puente de las escuelas', linea: 'Une la Cité con la orilla de las escuelas, con casas encima. Adam du Petit-Pont tenía su escuela sobre el puente, y los estudiantes cruzaban por aquí hacia la Montaña.' },
  grandpont: { emoji: '🌉', titulo: 'El Grand Pont', rol: 'el puente de los cambistas', linea: 'Une la Cité con la orilla de los mercaderes: encima, las tiendas de los cambistas y los orfebres. Del otro lado, la ciudad del comercio.' },
  louvre: { emoji: '🏰', titulo: 'El Louvre', rol: 'la fortaleza de Felipe Augusto', linea: 'Hacia 1200, el rey Felipe Augusto levantó junto al río, en el poniente, un castillo con una gran torre redonda para guardar la ciudad y su tesoro. Siglos después se volvió palacio y, más tarde, museo.' },
  chatelet: { emoji: '🏰', titulo: 'El Châtelet', rol: 'la fortaleza del Grand Pont', linea: 'Un castillete con dos torres que guardaba la entrada del puente de los mercaderes. Ahí juzgaba el preboste del rey, y los estudiantes le tenían miedo: por eso querían que los juzgara el obispo.' },
  genoveva: { emoji: '⛪', titulo: 'Santa Genoveva', rol: 'la abadía de la Montaña', linea: 'En lo alto de la Montaña, la abadía de la santa patrona de París. Su escuela fue de las primeras de la orilla izquierda, y su torre sigue en pie. Las viñas de la loma eran suyas.' },
  preclercs: { emoji: '🌳', titulo: 'El prado de los clérigos', rol: 'el Pré-aux-Clercs', linea: 'El prado junto al río donde los estudiantes iban a jugar (a la soule, la pelota que se disputaban dos bandos), a pasear y a pelearse con los monjes de Saint-Germain, que decían que era suyo.' },
  muralla: { emoji: '🧱', titulo: 'La muralla de Felipe Augusto', rol: '1190-1215', linea: 'Antes de irse a la cruzada, el rey mandó cerrar la ciudad con una muralla de torres redondas, en las dos orillas. Las escuelas de la Montaña quedaron adentro; la abadía de San Víctor, afuera, con su puerta.' },
  molino: { emoji: '⚙️', titulo: 'El molino de barca', rol: 'bajo los puentes', linea: 'Barcas amarradas a los pilares de los puentes, con una rueda que la corriente del Sena hace girar: molían el grano de la ciudad.' },
  barcaPa: { emoji: '⛵', titulo: 'Las barcas del Sena', rol: 'el río que trae todo', linea: 'Por el Sena llegaban a París el vino de Borgoña, el heno, la piedra de las canteras y las pieles para el pergamino. Los mercaderes del agua eran tan poderosos que su barca está en el escudo de la ciudad.' },
  scriptorium: { emoji: '✒️', titulo: 'El scriptorium', rol: 'donde se copian los libros', linea: 'Cada copista en su atril, en silencio, con la pluma y el cortaplumas: una página al día, a veces menos. En los márgenes dejaban quejas: «qué frío hace», «ya se acaba la luz».' },
  imprenta: { emoji: '🖨️', titulo: 'La imprenta del Bloemgracht', rol: 'la casa Blaeu', linea: 'Nueve prensas de madera, cajistas, entintadores y correctores: la imprenta más grande de Europa. Toca aquí para elegir qué se compone; una vez armada la forma, cada tirada sale sola.' },
  fundicion: { emoji: '🔠', titulo: 'La fundición de tipos', rol: 'donde nacen las letras', linea: 'El fundidor vierte la aleación de plomo, estaño y antimonio en el molde de mano y sale una letra, igual a todas las de su clase. Una imprenta grande tenía cientos de miles.' },
  escuelaAm: { emoji: '🔤', titulo: 'La escuela del barrio', rol: 'niños y niñas con su cartilla', linea: 'Una sola sala, un maestro, treinta niños y niñas: el abecedario en la pared, la cartilla en la mano. Las escuelas de barrio de la República enseñaban a leer, a escribir y a contar, y cobraban poco.' },
  atlasAm: { emoji: '🗺️', titulo: 'La casa del atlas', rol: 'el grabador y la iluminadora', linea: 'Aquí se graban los mapas en planchas de cobre y se pintan a mano, uno por uno. Los atlas de los Blaeu fueron los libros más caros de su siglo.' },
  aulaAm: { emoji: '🏫', titulo: 'El aula de Comenio', rol: 'enseñar todo a todos', linea: 'Bancos en filas, un maestro, un libro igual para todos: la clase como la conocemos. Comenio la pidió para todos los niños y las niñas, ricos y pobres.' },
  orbisAm: { emoji: '🖼️', titulo: 'El taller del Orbis Pictus', rol: 'los grabadores', linea: 'Los grabados del primer libro ilustrado para niños: cada cosa del mundo con su dibujo, su número y su nombre en dos lenguas.' },
  stadhuis: { emoji: '🏛️', titulo: 'La casa consistorial', rol: 'en el Dam (1648-1665)', linea: 'Jacob van Campen la levantó sobre 13 659 pilotes de madera, para la ciudad más rica del mundo. En lo alto, Atlas carga el globo del cielo. Hoy es el Palacio Real.' },
  dam: { emoji: '🧺', titulo: 'El Dam', rol: 'la plaza', linea: 'La plaza del dique sobre el Amstel, que le dio nombre a la ciudad: mercado, pesa pública y, en un costado, la Iglesia Nueva.' },
  ij: { emoji: '⛵', titulo: 'El IJ', rol: 'el puerto', linea: 'El brazo de mar del puerto: aquí fondeaban los barcos de la Compañía de las Indias Orientales, cargados de especias, porcelana y noticias del mundo.' },
  gracht: { emoji: '🌉', titulo: 'Los canales', rol: 'el anillo de los grachten', linea: 'El Herengracht, el Keizersgracht y el Prinsengracht: tres canales en medio círculo, cavados desde 1613, con sus casas altas y angostas de frontón escalonado. En invierno se hielan y se patina.' },
  ludusRo: { emoji: '🪔', titulo: 'Las tres escuelas', rol: 'el ludus, el grammaticus y el rétor', linea: 'Bajo los pórticos del Foro, una escuela detrás de otra: leer y contar, los poetas, hablar en público. Toca aquí para pasar a los alumnos que estén listos.' },
  grammaticusRo: { emoji: '📜', titulo: 'La escuela del grammaticus', rol: 'de los 11 a los 15', linea: 'Bajo el pórtico, el maestro lee a Virgilio verso por verso y los muchachos repiten con la entonación justa.' },
  rhetorRo: { emoji: '🗣️', titulo: 'La escuela del rétor', rol: 'desde los 15', linea: '«¿Debe Alejandro cruzar el océano?»: los muchachos declaman, y el que termina ya es orador.' },
  basilicaRo: { emoji: '⚖️', titulo: 'La basílica Julia', rol: 'el tribunal de los centunviros', linea: 'Cuatro tribunales a la vez, separados por cortinas, y el público en las galerías: aquí defiende su primer caso el orador.' },
  foroRo: { emoji: '🏛️', titulo: 'El Foro Romano', rol: 'la plaza de la ciudad', linea: 'Templos, basílicas, la tribuna de los oradores y, bajo los pórticos, las escuelas: el centro de Roma.' },
  saturnoRo: { emoji: '🪙', titulo: 'El templo de Saturno', rol: 'el erario', linea: 'Bajo el templo se guardaba el tesoro de la ciudad. Desde Vespasiano, el Estado paga con su dinero a los rétores.' },
  trajanoRo: { emoji: '📚', titulo: 'El Foro de Trajano', rol: '112-113 d. C.', linea: 'La columna con la guerra de Dacia contada en espiral, entre dos bibliotecas: la griega y la latina.' },
  tiber: { emoji: '🌊', titulo: 'El Tíber', rol: 'el río de Roma', linea: 'Baja turbio y crece en invierno. En su orilla se juntan las piedrecillas lisas que los niños usan para contar: los calculi.' },
  isla: { emoji: '🏝️', titulo: 'La isla Tiberina', rol: 'el templo de Esculapio', linea: 'Una isla con forma de barco en medio del río, con el templo del dios de la medicina: allá llevaban a los enfermos.' },
  capitolio: { emoji: '⛰️', titulo: 'El Capitolio', rol: 'el templo de Júpiter', linea: 'La colina más sagrada de Roma, sobre el Foro: ahí subían los generales en su triunfo.' },
  pagodaCh: { emoji: '🛕', titulo: 'La Pagoda de Hierro', rol: '1049', linea: 'No es de hierro: es de ladrillo vidriado del color del hierro, con trece pisos y 57 metros de alto. Se levantó en 1049 en la esquina de la ciudad, y sigue en pie.' },
  puenteCh: { emoji: '🌉', titulo: 'El Puente Arcoíris', rol: 'sobre el río Bian', linea: 'Un arco de madera sin pilares, hecho de vigas que se traban unas con otras: así las barcas grandes pasan por debajo. Es el centro del rollo de Zhang Zeduan.' },
  bianCh: { emoji: '🌊', titulo: 'El río Bian', rol: 'el canal del grano', linea: 'Por él llega a la capital el grano del sur, por el Gran Canal: miles de barcas al año, que en los tramos difíciles se tiran con cuerdas desde la orilla.' },
  barcaCh: { emoji: '⛵', titulo: 'Las barcas del Bian', rol: 'el grano del sur', linea: 'Barcas de carga con un mástil que se abate para pasar bajo el Puente Arcoíris: en el rollo, los marineros gritan y la gente del puente les tira cuerdas.' },
  puertaCh: { emoji: '🏯', titulo: 'La puerta de la ciudad', rol: 'con su torre', linea: 'Kaifeng tenía tres murallas, una dentro de otra. Por esta puerta entran los camellos de las caravanas, los carros de bueyes y los candidatos que vienen a rendir el examen.' },
  casaTeCh: { emoji: '🍵', titulo: 'La casa de té', rol: 'a la orilla del Bian', linea: 'Se pide té batido y se mira pasar las barcas. Meng Yuanlao cuenta que en Kaifeng los mercados de la noche cerraban pasada la medianoche y volvían a abrir antes del amanecer.' },
  tiendaLiuCh: { emoji: '🪔', titulo: 'La tienda de los Liu', rol: 'áloe y sándalo', linea: 'Así dice su letrero, igual que en el rollo de Zhang Zeduan: «Casa Liu, áloe y sándalo de primera, incienso escogido».' },
  boticaCh: { emoji: '🌿', titulo: 'La casa del doctor Zhao', rol: 'la botica', linea: 'Un médico que sirvió en la corte vende sus remedios: en el rollo, una mujer con un niño en brazos espera junto al mostrador.' },
  tabernaCh: { emoji: '🏮', titulo: 'La taberna del vino nuevo', rol: 'con su bandera', linea: 'Antes de la luna de otoño, las tabernas venden el vino nuevo y cuelgan una bandera para anunciarlo.' },
  hornoCh: { emoji: '⚫', titulo: 'El horno de hollín', rol: 'donde nace la tinta', linea: 'Se quema leña de pino en un horno largo y bajo; el hollín que queda pegado en las paredes se raspa, se amasa con cola y se prensa en moldes: la barra de tinta.' },
  explanadaCh: { emoji: '🖌️', titulo: 'La explanada de las escuelas', rol: 'del puente para adelante', linea: 'Aquí se levantan las escuelas de la época: la de la prefectura, el taller de las planchas, las dos salas de Hu Yuan, el recinto del examen y la academia.' },
  escuelaFu: { emoji: '🏡', titulo: 'Los que preguntan', rol: 'la escuela del valle', linea: 'Aquí llegan los estudiantes con su problema. Toca aquí para elegir cómo los ayuda la IA: que responda, o que pregunte como un tutor. Y para revisar las respuestas inventadas.' },
  tutorFu: { emoji: '❓', titulo: 'El claro de las preguntas', rol: 'el tutor que pregunta', linea: 'Los que preguntan caminan hasta aquí, pensando, y se sientan en los tocones. Vuelven con su «!».' },
  llegadaFu: { emoji: '🌐', titulo: 'La parada', rol: 'donde llegan los de lejos', linea: 'El cartel dice bienvenidos en seis lenguas. Por aquí llegan los estudiantes que no hablan la lengua de la escuela, y la IA les traduce la clase.' },
  bibliotecaFu: { emoji: '🔎', titulo: 'La biblioteca que responde', rol: 'junto a la cueva', linea: 'Todo lo que se sabe, de la pintura de la cueva al último artículo. Y la mesa de revisión, donde se mira la fuente de cada respuesta.' },
  examenFu: { emoji: '🎙️', titulo: 'Las gradas de la defensa', rol: 'el examen que cambia', linea: 'Aquí se defiende el trabajo en voz alta, frente al valle: lo que se hizo, cómo se hizo y por qué. Ahí se nota quién entendió.' },
  miradorFu: { emoji: '🔭', titulo: 'El mirador', rol: 'la pregunta abierta', linea: 'Mira hacia la niebla del borde del valle, donde todavía no se ve nada: lo que no sabemos.' },
  fogonFu: { emoji: '🔥', titulo: 'El círculo de piedras', rol: 'el fogón de la Época 1', linea: 'Aquí se contaron las primeras historias, hace decenas de miles de años. Las piedras siguen donde estaban, y el fuego se enciende otra vez de noche.' },
  cuevaFu: { emoji: '🦬', titulo: 'La cueva pintada', rol: 'un sitio protegido', linea: 'Las mismas pinturas de la Época 1, ahora detrás de una pasarela: se miran sin tocar. Son la escuela más vieja del valle.' },
  nieblaFu: { emoji: '🌫️', titulo: 'La niebla', rol: 'el borde del valle', linea: 'Lo que todavía no sabemos. Cada época corrió un poco el borde; esta no sabe cuánto.' },
  chispaFu: { emoji: '🔹', titulo: 'La chispa azul', rol: 'la IA', linea: 'Acompaña a cada estudiante. Cuando responde, lleva su «!»; cuando pregunta, como un tutor, su «?». La chispa fría, junto al fuego viejo.' },
  prefecturaCh: { emoji: '🖌️', titulo: 'Los candidatos', rol: 'la escuela de la prefectura', linea: 'Aquí se preparan los que van a rendir el examen: de memoria, en la sala de los asuntos o, en la de los clásicos, para entender. Toca aquí para elegir cómo se prepara cada uno.' },
  temploCh: { emoji: '☯️', titulo: 'El templo taoísta', rol: 'del otro lado del río', linea: 'Un templo chico entre los sauces, con su incienso y su patio. De día no pasa nada; de noche, dicen, se enseña algo que no se escribe.' },
  palatino: { emoji: '⛰️', titulo: 'El Palatino', rol: 'la colina de los emperadores', linea: 'Donde, según la leyenda, Rómulo fundó la ciudad; ahí vivían los emperadores, y de su nombre viene la palabra «palacio».' },
  coliseo: { emoji: '🏟️', titulo: 'El anfiteatro Flavio', rol: 'el Coliseo, 80 d. C.', linea: 'Lo inauguró Tito, el hijo de Vespasiano. Desde el Foro se ve su silueta, al final de la Vía Sacra.' },
  lancasteriana: { emoji: '🧑‍🏫', titulo: 'La escuela lancasteriana', rol: 'un maestro, cien niños', linea: 'El salón largo con los semicírculos pintados en el piso, los monitores con su vara y las cajas de arena. Barato y masivo; y se aprendía de memoria.' },
  normal: { emoji: '🎒', titulo: 'La Escuela Normal de Preceptores', rol: 'la primera de América Latina (1842)', linea: 'Aquí se forman los maestros que van a fundar las escuelas de los pueblos. Toca aquí para mandar a cada normalista a su pueblo, en el mapa.' },
  silabarioSa: { emoji: '📖', titulo: 'La escuela del barrio', rol: 'con el silabario', linea: 'Los niños aprenden a leer por sílabas, con la pizarra de piedra y el pizarrín. ma, me, mi, mo, mu.' },
  preceptorasSa: { emoji: '👩‍🏫', titulo: 'La Escuela de Preceptoras', rol: '1854', linea: 'Aquí se forman las maestras de las escuelas de niñas de los pueblos. La enseñanza fue de las primeras profesiones abiertas a las mujeres.' },
  congreso: { emoji: '🏛️', titulo: 'El Congreso', rol: 'donde se vota la ley de 1860', linea: 'Aquí se votó la ley de instrucción primaria: la escuela gratuita, pagada por el Estado, una de niños y una de niñas cada dos mil habitantes.' },
  kinder: { emoji: '🧸', titulo: 'El kindergarten', rol: 'el jardín de infantes', linea: 'La escuela de los más chicos: los dones de Froebel, la ronda, el canto y un jardín que cada niño cuida.' },
  moneda: { emoji: '🏛️', titulo: 'La Moneda', rol: 'el palacio de Toesca', linea: 'Joaquín Toesca la construyó para acuñar monedas (1805); desde 1846 es la casa de los presidentes. Neoclásica, de ladrillo estucado, con su patio de los naranjos.' },
  catedral: { emoji: '⛪', titulo: 'La catedral', rol: 'en la Plaza de Armas', linea: 'La quinta catedral en el mismo lugar: los terremotos tiraron las anteriores. Toesca le dio su fachada.' },
  plazaSa: { emoji: '🌳', titulo: 'La Plaza de Armas', rol: 'el centro del damero', linea: 'Pedro de Valdivia trazó aquí la ciudad en 1541, en manzanas cuadradas como un tablero. Alrededor, la catedral, el cabildo y los portales.' },
  santalucia: { emoji: '⛰️', titulo: 'El cerro Santa Lucía', rol: 'el Huelén', linea: 'El cerro donde Valdivia fundó la ciudad. En 1872 el intendente Vicuña Mackenna lo convirtió en paseo, con terrazas, fuentes y un castillo.' },
  mapocho: { emoji: '🌊', titulo: 'El Mapocho', rol: 'el río de Santiago', linea: 'Baja de la cordillera: casi seco en verano, crecido en invierno. Los tajamares de piedra lo contienen.' },
  calycanto: { emoji: '🌉', titulo: 'El puente de Cal y Canto', rol: '1782-1888', linea: 'De piedra y cal (dicen que con clara de huevo en la mezcla), con once arcos: unía la ciudad con la Chimba.' },
  andes: { emoji: '🏔️', titulo: 'La cordillera de los Andes', rol: 'el muro del oriente', linea: 'Siempre a la vista, blanca en invierno. Por sus pasos llegaban los arrieros de Mendoza, y por ahí llegó Sarmiento, exiliado.' },
  alameda: { emoji: '🌳', titulo: 'La Alameda de las Delicias', rol: 'el paseo de los álamos', linea: 'O\'Higgins la hizo plantar sobre el antiguo brazo seco del río: el paseo de Santiago, con sus álamos, sus acequias y sus bancos.' },
  diligencia: { emoji: '🐴', titulo: 'La diligencia de Valparaíso', rol: 'dos días de camino', linea: 'Trae del puerto lo que llega en barco: libros, cartas y las pizarras de piedra para las escuelas. Sus luces dan la pizarra.' },
  kerk: { emoji: '⛪', titulo: 'La Iglesia Nueva', rol: 'junto al Dam', linea: 'Gótica, de ladrillo, «nueva» desde 1408. Su torre nunca se terminó: el dinero se fue en la casa consistorial de al lado.' },
  wester: { emoji: '👑', titulo: 'La torre del Westerkerk', rol: '1638', linea: 'La torre más alta de la ciudad, con la corona imperial en la punta y su carillón, que toca a cada cuarto de hora. Rembrandt está enterrado en esa iglesia.' },
  molinoAm: { emoji: '🌬️', titulo: 'El molino de papel', rol: 'sobre el bastión', linea: 'Los molinos de viento movían los mazos que deshacían los trapos en pasta: de ahí salía el papel de las imprentas. Sus luces dan los pliegos.' },
  murallaAm: { emoji: '🧱', titulo: 'La muralla y los bastiones', rol: 'con sus molinos', linea: 'Una muralla de tierra con bastiones en punta, rodeada por el foso del Singelgracht. Sobre los bastiones, molinos de viento.' },
  barcoAm: { emoji: '⛵', titulo: 'El barco de las Indias', rol: 'un fluyt holandés', linea: 'Barcos de casco redondo y vela cuadrada, baratos de hacer y fáciles de manejar con poca gente: con ellos la República llegó a todos los mares.' },
  caravana: { emoji: '🐪', titulo: 'La caravana', rol: 'de Siria, de Bizancio, de Persia', linea: 'Camellos cargados con cajas de cuero: adentro, manuscritos en griego, en siríaco, en persa y en sánscrito. Al-Mamún mandaba embajadas a Bizancio a pedir libros (lo cuenta el Fihrist). En primavera llegan más; en verano, con el calor, no viaja nadie.' },
  puente: { emoji: '🌉', titulo: 'El puente de barcas', rol: 'para cruzar el Tigris', linea: 'Barcas atadas en fila con un tablado encima: así se cruzaba el Tigris en Bagdad. Con la crecida se soltaba una parte para que pasara el agua.' },
  jahiz: { emoji: '📖', titulo: 'Al-Jahiz', rol: 'el librero de Basora', linea: 'Escritor de Basora que amaba los libros más que a nada: se cuenta que alquilaba de noche las tiendas de los libreros para leer todo lo que había. Escribió el Libro de los animales. Es quien te aconseja en Bagdad.' },
  mareotis: { emoji: '🌿', titulo: 'El lago Mareotis', rol: 'el juncal del papiro', linea: 'Al sur de la ciudad, el lago y su juncal: de aquí sale el papiro de Alejandría, el material de todos los libros de la época.' },
  horoAgora: { emoji: '🪨', titulo: 'El mojón del ágora', rol: '«soy el límite del ágora»', linea: 'Dice ΗΟΡΟΣ ΕΙΜΙ ΤΕΣ ΑΓΟΡΑΣ y sigue en su lugar desde hacia el 500 a. C.: marcaba hasta dónde llegaba la plaza de todos.' },
  zeusEl: { emoji: '🗿', titulo: 'Zeus Eleuterio', rol: 'Zeus el Liberador', linea: 'Su pórtico es la stoa del ágora. Jenofonte cuenta que ahí encontró a Sócrates sentado, conversando (Económico, 7, 1).' },
  pedagogo: { emoji: '🧔', titulo: 'El pedagogo', rol: 'el que conduce al niño', linea: 'Paidagogos: «el que conduce al niño». Era un esclavo de la casa que lo acompañaba a la escuela, le cargaba la lira y las tablillas y lo vigilaba. ⚖️ De su nombre viene la palabra pedagogía.' },
  muchacho: { emoji: '🧒', titulo: 'Un muchacho', rol: 'camino del maestro', linea: 'Sale de su casa al amanecer con su pedagogo detrás. Hijo de una familia libre: la escuela de Atenas era para ellos, y solo para los varones.' },
  luchador: { emoji: '🤼', titulo: 'Los luchadores', rol: 'en la arena de la palestra', linea: 'Se untan de aceite, se espolvorean de arena y luchan bajo la vara del paidotriba. La lucha se aprendía como la letra: con un maestro.' },
  atleta: { emoji: '🏃', titulo: 'Un atleta', rol: 'en la arena de la palestra', linea: 'Corre la vuelta del patio o ensaya el salto con las halteras en la mano: dos pesas de piedra que se balancean para llegar más lejos.' },
  paidotriba: { emoji: '🏃', titulo: 'El paidotriba', rol: 'el maestro de gimnasia', linea: 'El tercer maestro del niño ateniense, junto al de letras y al de música. Lleva una vara ahorquillada para corregir (y a veces para pegar).' },
  oyente: { emoji: '👂', titulo: 'El público del sofista', rol: 'pagan por oír', linea: 'Hijos de familias ricas que pagan por aprender a hablar en la Asamblea y en los tribunales: el arte de convencer.' },
  esclavoMenon: { emoji: '📐', titulo: 'El muchacho del Menón', rol: 'el que descubre la diagonal', linea: 'En el Menón, Sócrates no le enseña nada a un muchacho esclavo: solo le pregunta. El muchacho se equivoca, no sabe y, al final, dibuja él mismo el cuadrado del doble sobre la diagonal.' },
  conversan: { emoji: '🌳', titulo: 'Bajo el plátano', rol: 'el Fedro', linea: 'Sócrates y Fedro se sientan a la orilla del Ilisos, a la sombra del plátano, y conversan sobre el amor y sobre la escritura: ¿enseña un texto, si no puede responder preguntas?' },
  platon: { emoji: '🫒', titulo: 'Platón', rol: 'el fundador de la Academia', linea: 'Hacia 387 a. C. compra un jardín junto al olivar de Academo y enseña ahí, preguntando, durante cuarenta años. De su nombre vienen todas las academias.' },
  discipulo: { emoji: '📜', titulo: 'Un discípulo', rol: 'de la Academia', linea: 'Entre los que se sentaron aquí estuvo Aristóteles, veinte años. Después fundó su propia escuela, el Liceo, y enseñó caminando.' },
  cosecha: { emoji: '🫒', titulo: 'La cosecha de la oliva', rol: 'en otoño', linea: 'Se varean las ramas y se recogen las aceitunas en cestas. El aceite de los olivos sagrados de Atenea era el premio de las Panateneas.' },
  vina: { emoji: '🍇', titulo: 'La viña', rol: 'el campo del Ática', linea: 'Cepas bajas en hileras, cada una atada a su estaca. El vino aguado se tomaba en todas las comidas, también en las de los maestros.' },
  era: { emoji: '🌾', titulo: 'La era', rol: 'donde se trilla', linea: 'Un círculo empedrado donde los bueyes pisan las gavillas para soltar el grano, y el viento se lleva la paja. Las eras de piedra siguen en los campos de Grecia.' },
  pozo: { emoji: '🪣', titulo: 'El pozo', rol: 'el agua de las casas', linea: 'Atenas bebía de pozos y de fuentes. Ir por agua era trabajo de las mujeres y de los esclavos: la fuente era, también, el lugar donde se conversaba.' },
  boreas: { emoji: '🌬️', titulo: 'El altar de Bóreas', rol: 'el viento del norte', linea: 'Aquí, cuenta el mito, Bóreas raptó a Oritía. En el Fedro, Sócrates pasa por este altar camino del plátano y prefiere conversar a descifrar mitos.' },
  shaduf: { emoji: '💧', titulo: 'Sennedyem', rol: 'labrador del shaduf', linea: 'Sube el agua del Nilo a la acequia con la pértiga y el contrapeso, cubo a cubo. Cada crecida le borra los lindes; cada año la cuerda se los devuelve.' },
  falua: { emoji: '⛵', titulo: 'la barca del Nilo', rol: 'el camino del país', linea: 'El río corre al norte y el viento sopla al sur, así que se baja a remo y se sube a vela. Por eso el signo de «viajar al sur» es una barca con la vela izada, y el de «viajar al norte», una barca con la vela recogida: la geografía se les metió en la escritura.' },
  obelisco: { emoji: '🗿', titulo: 'el obelisco', rol: 'aguja de una sola piedra', linea: 'Se talla entero de un bloque y se corona de electro, para que el primer rayo del día lo encienda antes que a nada. Un rayo de sol petrificado, plantado a la puerta.' },
  coloso: { emoji: '🗿', titulo: 'el coloso sentado', rol: 'el rey a la puerta', linea: 'Se sienta con las manos planas sobre las rodillas, mirando al frente, sin prisa. No representa al rey: lo sustituye cuando el rey no está.' },
  faraon: { emoji: '👑', titulo: 'el Faraón', rol: 'Señor de las Dos Tierras', linea: 'Su nombre se escribe dentro de un cartucho para que dure lo que la piedra.' },
  lamassu0: { emoji: '🐂', titulo: 'Lamassu', rol: 'genio guardián de la puerta', linea: 'Toro, águila y sabio en una sola piedra. Tiene cinco patas: cuéntalas.' },
  lamassu1: { emoji: '🐂', titulo: 'Lamassu', rol: 'genio guardián de la puerta', linea: 'De frente está quieto; de lado, camina. El escultor hizo trampa con una pata de más.' },
  // Lumbre 3D (2026-09-29): en la subida al Eanna, los leones de terracota de Tell Harmal (~1800 a. C., de la época de la
  // edubba) reemplazan a los lamassu, que son asirios y mil años posteriores. Elegidos por el usuario sobre bocetos.
  leon0: { emoji: '🦁', titulo: 'León de terracota', rol: 'guardián de la escalinata', linea: 'Barro cocido y pintado, con las fauces abiertas: nadie sube al templo sin pasar frente a él.' },
  leon1: { emoji: '🦁', titulo: 'León de terracota', rol: 'guardián de la escalinata', linea: 'Su pareja mira hacia el otro lado del camino. Los alfareros de la ciudad los hicieron del tamaño de un niño.' },
  estatuaRey: { emoji: '🗿', titulo: 'el rey Gudea', rol: 'estatua votiva', linea: 'Se hizo esculpir orando, con las manos juntas, y la dejó en el templo PARA QUE REZARA POR ÉL mientras él gobernaba: una oración de piedra que no se cansa. Más de cuatro mil años después, sigue rezando.' }
};
let jubiloHasta = 0; // la celebración: un par de segundos de brincos
function jubilo() { jubiloHasta = tFrame + 2.4; } // mismo reloj (acotado) que saltoJubilo, no el de pared
function saltoJubilo(t, i) {
  const resta = jubiloHasta - t;
  if (resta <= 0 || resta > 3) return 0;
  return Math.abs(Math.sin(t * 7 + i * 1.3)) * 5 * zoom * Math.min(1, resta / 0.6);
}
const GENTE_CLIC = []; // el censo del cuadro: se rellena en cada frame
// Un tocable normal es una PERSONA: círculo pequeño, centrado en el torso (15 px sobre sus pies).
// `area` ({rx, ry, dy}) es para lo que se pisa, no se mira: superficies planas y anchas como el campo,
// donde el clic tiene que valer en toda su extensión y no solo en un punto flotando sobre el centro.
function tocable(wx, wy, ficha, area) { const p = P(wx, wy); GENTE_CLIC.push({ x: p.x, y: p.y, ficha, area }); }
let hoverClave = null; // GRAMÁTICA de señales: bajo el cursor hay una ACCIÓN (halo), no solo información
function esAccion(f) { // ¿este clic ejecuta algo, o solo abre la ficha?
  if (f.k === 'conteo') return cuentasPendientes() > 0;   // hay algo esperando su muesca
  if (f.k === 'pescador' || /^diada\d/.test(f.k)) return haySitioEnLaOrilla(); // queda sitio y hay a quién ofrecérselo
  if (f.k === 'sellar') return (S.fichasPend || 0) > 0;   // SUMER: cuentas del templo esperando su sello
  if (f.k === 'mesacopia') return (S.copiasPend || 0) > 0; // SUMER: copias esperando su corrección
  if (f.k === 'secreto') return true;                       // LOS SECRETOS: algo brilla y pide la mano
  if (f.k === 'banco') return puedeDecir();                 // ATENAS: dudas esperando en el banco
  if (f.k === 'agora') return puedePreguntar();             // ATENAS: dudas esperando en el claro
  if (f.k === 'sofista') return puedeContratarSofista() || !!S.sofista;
  if (f.k === 'muelle') return puedeCatalogar();           // ALEJANDRÍA: rollos esperando su estante
  if (f.k === 'barca') return S.era === 5 && rollosAbierto(); // ALEJANDRÍA: la barca del puerto pregunta por los originales
  if (f.k === 'vara') return sombraDisponible();            // ALEJANDRÍA: el mediodía del solsticio
  if (f.k === 'puertakufa') return puedeTraducir();         // BAGDAD: manuscritos esperando traductor
  if (f.k === 'halqa') return ijazaDisponible();            // BAGDAD: un estudiante espera su ijaza
  if (f.k === 'cadi') return herenciaDisponible();          // BAGDAD: una herencia por repartir
  if (f.k === 'ludusRo') return ludusAbierto() && listosRo() > 0;   // ROMA: un alumno está listo para pasar
  if (f.k === 'escuelaFu') return escuelaFu() && (dudasEsperan() > 0 || (S.erroresFu || 0) > 0);   // EL FUTURO: alguien espera con su pregunta, o hay una respuesta inventada por revisar
  if (f.k === 'prefecturaCh') return prefecturaCh() && candidatosEsperan() > 0;   // CHINA: un candidato espera que elijas cómo se prepara
  if (f.k === 'normal') return normalAbierta() && (S.normalistas || 0) > 0;   // SANTIAGO: un normalista espera su pueblo
  if (f.k === 'imprenta') return prensaAbierta();             // ÁMSTERDAM: la imprenta abre el componer
  if (f.k === 'campana') return campanaAbierta();            // PARÍS: la campana arma el horario
  if (f.k === 'universidad') return licenciaDisponible();     // PARÍS: un bachiller espera su licencia
  if (f.k === 'partera') return telpoAbierto() && nacidosPend() > 0;   // TENOCHTITLAN: un recién nacido espera su escuela
  if (f.k === 'cuicacalli') return cantoDisponible();       // TENOCHTITLAN: el canto de la tarde
  if (f.k === 'anciano') return palabraDisponible();        // TENOCHTITLAN: la palabra antigua de la estación
  if (f.k === 'dictado' || f.k === 'dictado2' || /^dictx/.test(f.k)) return haySitioDictado(); // SUMER: sitio en el dictado
  if (f.k === 'fogata') {
    if (S.era !== 1) return false;
    if (!S.fuegoDescubierto) return true;          // frotar las varas: el primer gesto del juego, en el mundo
    // CON leña: sin ella la «acción» solo podía regañar con un toast, y encima le ganaba el clic a
    // quien estuviera al lado (la Abuela recibía sermones de leña ajenos, visto jugando 2026-08-02)
    return S.fuegoCd <= 0 && S.fuego <= 76 && (S.mats.lena || 0) >= 1;
  }
  if (f.k === 'campo') return cultivoActivo() && (S.cultivo || 0) >= 1;
  if (f.k === 'mamut' || /^caza\d/.test(f.k)) return cazaDisponible();
  if (f.k === 'pensador') return (f.id === 'abuela' && abuelaCapDisponible()) || (f.id === 'enheduanna' && himnoDisponible()) || (estadoPensador(f.id) === 1 && !!VISITAS[f.id]);
  if (/^azolve/.test(f.k)) return true;                    // SUMER: el limo que espera el brazo
  if (f.k === 'patiolascas') return (S.ejerPend || 0) > 0; // EGIPTO: ejercicios esperando su lasca
  if (f.k === 'mesapapiro') return puedePasarPapiro();     // EGIPTO: lo ensayado puede pasar a la hoja
  if (/^linde/.test(f.k)) return true;                     // EGIPTO: el linde borrado espera la cuerda
  return false; // los colectibles ya tienen su propio brillo: esa ES su señal
}
function drawHoverHalo(t) { // el halo dorado a los pies de lo accionable bajo el cursor
  if (!hoverClave) return;
  const p = GENTE_CLIC.find(q => claveFicha(q.ficha) === hoverClave);
  if (!p || !esAccion(p.ficha)) return;
  const s = zoom, pu = 0.5 + 0.5 * Math.sin(t * 5);
  g.save(); g.globalAlpha = 0.4 + 0.25 * pu;
  const gl = g.createRadialGradient(p.x, p.y - 8 * s, 2 * s, p.x, p.y - 8 * s, 20 * s);
  gl.addColorStop(0, 'rgba(255,216,115,.6)'); gl.addColorStop(1, 'rgba(255,216,115,0)');
  g.fillStyle = gl; g.beginPath(); g.ellipse(p.x, p.y - 8 * s, 20 * s, 14 * s, 0, 0, 7); g.fill();
  g.restore();
}
function golpeaPersona(cx, cy, dedo) { // `dedo`: un tap táctil, que necesita un blanco más ancho que el cursor (la yema tapa lo que toca)
  const r = cv.getBoundingClientRect(), mx = cx - r.left, my = cy - r.top;
  const radio = Math.max(19 * zoom, dedo ? 26 : 12), fino = Math.max(9 * zoom, dedo ? 14 : 7);
  let mejor = null, mejorD = 1e9, mejorFino = null, mejorFinoD = 1e9, mejorAcc = null, mejorAccD = 1e9;
  for (const p of GENTE_CLIC) {
    if (p.area) { // superficie: elipse propia, sin alzar al torso. Normalmente NO compite en la pasada fina,
      const a = p.area, dy = (a.dy || 0) * zoom;   // así quien esté de pie encima gana el clic…
      const dn = Math.hypot((mx - p.x) / (a.rx * zoom), (my - (p.y - dy)) / (a.ry * zoom));
      if (dn < 1) {
        const d = dn * radio;
        // …salvo cuando la superficie TIENE UNA ACCIÓN LISTA (el campo dorado): entonces manda la acción,
        // que si no la labradora que trabaja encima te devuelve su ficha en vez de la cosecha.
        if (a.gana && d < mejorAccD) { mejorAccD = d; mejorAcc = p; }
        if (d < mejorD) { mejorD = d; mejor = p; }
      }
      continue;
    }
    // una luz recogible se toca en su chispa O en su halo del suelo (lista de cotejo B3: tocar el halo fallaba)
    const d = p.ficha.k === 'colectible' ? Math.min(Math.hypot(mx - p.x, (my - (p.y - 15 * zoom)) * 0.9), Math.hypot(mx - p.x, (my - p.y) * 1.3))
      : Math.hypot(mx - p.x, (my - (p.y - 15 * zoom)) * 0.9);
    // LA ACCIÓN GANA A LA MULTITUD (el principio de `a.gana`, generalizado a todo lo accionable): el
    // fogón con hambre, el hueso con cuentas, la Abuela con historia o una luz de material no pueden
    // perder el clic contra el tooltip de quien pasea por delante, porque el clan vive justo alrededor
    // de esas cosas (medido: echar el primer tronco costaba ~15 intentos entre la gente).
    if (d < radio && (p.ficha.k === 'colectible' || esAccion(p.ficha)) && d < mejorAccD) { mejorAccD = d; mejorAcc = p; }
    if (d < fino && d < mejorFinoD) { mejorFinoD = d; mejorFino = p; }
    if (d < radio && d < mejorD) { mejorD = d; mejor = p; }
  }
  return mejorAcc || mejorFino || mejor; // la acción lista manda; después, quien está justo bajo el cursor; la tolerancia solo aplica en vacío
}
function fichaDe(f) {
  const fog = ordEra(S.era) < 11;
  if (f.k === 'alumno') {
    const p = S.era === 1 ? [NOMBRES_CLAN, RASGOS_CLAN, 'aprendiz del clan', '🌙'] :
      S.era === 2 ? [NOMBRES_SUMER, RASGOS_SUMER, 'aprendiz de la edubba', '🏺'] :
        S.era === 3 ? [NOMBRES_EGIPTO, RASGOS_EGIPTO, 'aprendiz de la Casa de la Vida', '🪷'] :
        S.era === 4 ? [NOMBRES_ATENAS, RASGOS_ATENAS, 'aprendiz del ágora', '🏛️'] :
        S.era === 14 ? [NOMBRES_ROMA, RASGOS_ROMA, 'alumno de las escuelas', '🏛️'] :
        S.era === 15 ? [NOMBRES_CHINA, RASGOS_CHINA, 'estudiante de la prefectura', '🏮'] :
        S.era === 21 ? [ESTUDIANTES_FU, RASGOS_FUTURO, 'estudiante del valle', '🏡'] :
        S.era === 10 ? [NOMBRES_SANTIAGO, RASGOS_SANTIAGO, 'niño de la escuela', '🎒'] :
        S.era === 9 ? [NOMBRES_AMSTERDAM, RASGOS_AMSTERDAM, 'niño de la escuela del barrio', '🖨️'] :
        S.era === 8 ? [NOMBRES_PARIS, RASGOS_PARIS, 'estudiante de París', '🔔'] :
        S.era === 7 ? [NOMBRES_TENOCHTITLAN, RASGOS_TENOCHTITLAN, 'joven del calpulli', '🌺'] :
        S.era === 6 ? [NOMBRES_BAGDAD, RASGOS_BAGDAD, 'estudiante de la halqa', '🌙'] :
        S.era === 5 ? [NOMBRES_ALEJANDRIA, RASGOS_ALEJANDRIA, 'estudiante del Museo', '📜'] :
          [NOMBRES_ESCUELA, RASGOS_ESCUELA, 'estudiante', '🎒'];
    // dónde aprende (lo dice quien lo dibuja: Lumbre 3D sienta a los atendidos en el corro de su guía)
    const donde = f.con === undefined ? '' : f.con ? ` Aprende en el corro ${/^el /.test(f.con) ? 'del <b>' + f.con.slice(3) : 'de <b>' + f.con}</b>.` : ' Aprende <b>a medias</b>: nadie llega a su lado.';
    return { tipo: 'f-alumno', emoji: p[3], titulo: p[0][f.i % p[0].length], rol: p[2], linea: p[1][(f.i * 7 + 3) % p[1].length] + donde };
  }
  if (f.k === 'docente') {
    const L = LEX(), rasgos = S.era === 1 ? RASGOS_GUIA : S.era === 2 ? RASGOS_ESCRIBA : S.era === 3 ? RASGOS_MAESTRO_EG : S.era === 4 ? RASGOS_MAESTRO_AT : S.era === 5 ? RASGOS_MAESTRO_AL : S.era === 6 ? RASGOS_MAESTRO_BA : S.era === 7 ? RASGOS_MAESTRO_TE : S.era === 8 ? RASGOS_MAESTRO_PA : S.era === 9 ? RASGOS_MAESTRO_AM : S.era === 10 ? RASGOS_MAESTRO_SA : S.era === 14 ? RASGOS_MAESTRO_RO : S.era === 15 ? RASGOS_MAESTRO_CH : S.era === 21 ? RASGOS_MAESTRO_FU : RASGOS_MAESTRO;
    const modo = S.era === 1 && f.i > 0 ? (S.guiasModo || [])[f.i] : null;
    return { tipo: 'f-docente', emoji: S.era === 1 ? '🔥' : S.era === 2 ? '🏺' : S.era === 3 ? '🪷' : S.era === 4 ? '🏛️' : S.era === 5 ? '📜' : S.era === 6 ? '🌙' : S.era === 7 ? '🌺' : S.era === 8 ? '🔔' : S.era === 9 ? '🖨️' : S.era === 10 ? '🎒' : S.era === 14 ? '🏛️' : S.era === 15 ? '🏮' : S.era === 21 ? '🏡' : '🍎', titulo: L.nombres[f.i % L.nombres.length], rol: L.docente.toLowerCase() + (modo === 'corro' ? ' · enseña a muchos' : modo === 'cerca' ? ' · enseña de cerca' : ''), linea: rasgos[f.i % rasgos.length] };
  }
  if (f.k === 'pensador') {
    const p = PENSADORES[f.id];
    const [emo, ...resto] = p.nombre.split(' '); // el emoji del pensador vive en su nombre
    // La Abuela con historia pendiente pero no contable AHORA dice el PORQUÉ (es de día, la brasa está
    // baja, o toca esperar la noche siguiente): sin esto, el clic devolvía la ficha genérica y se
    // sentía roto, con el jugador sin saber qué condición faltaba.
    const porQueNo = f.id === 'abuela' && estadoPensador('abuela') === 2 && abuelaCapPend() && !abuelaCapDisponible()
      ? ((S.abuelaCd || 0) > 0 ? 'Guarda una historia nueva para el clan, pero una por noche: lo contado debe asentarse. Mañana sigue.'
        : luzDia() >= 0.45 ? 'Guarda una historia nueva para el clan, y las historias se cuentan de noche, junto al fuego vivo. Cuando caiga el sol, vuelve a tocarla.'
        : 'Guarda una historia nueva para el clan, pero con la brasa tan baja no hay velada: aviva el fuego y vuelve a tocarla.')
      : null;
    return {
      tipo: 'f-pensador', emoji: emo, titulo: resto.join(' '), rol: p.años, cita: p.cita,
      linea: estadoPensador(f.id) === 1 ? 'Llega con una propuesta bajo el brazo: su visita espera respuesta.'
        : porQueNo || 'Su historia completa vive en su medallón de Las Ideas.'
    };
  }
  if (f.k === 'conteo') { // el hueso dice si hay cuentas esperando, y qué pasó con lo ya contado
    const pend = cuentasPendientes(), m = S.muescas || 0, gr = Math.floor(m / 5);
    const hecho = m === 0 ? 'Todavía no lleva ninguna cuenta del clan.'
      : `Lleva <b>${m}</b> ${m === 1 ? 'muesca tallada' : 'muescas talladas'}${gr > 0 ? `, y ${gr === 1 ? 'un grupo cerrado en su piedra' : `${gr} grupos cerrados en sus piedras`}` : ''}: el clan ya aprende un <b>${Math.round((multCuenta() - 1) * 100)}% más rápido</b>.`;
    const linea = !S.signo && S.abuelaCap >= 3 && pend > 0
      ? `${hecho} <b>Ya no cabe otra raya</b>: hay barro húmedo al lado. Tócalo y presiona ahí la marca.`
      : pend >= CUENTA_MAX ? `Hay <b>${pend}</b> cosas esperando, y ya no caben más sin tallar: lo que llegue ahora se cuenta de memoria y se olvida. <b>Tócalo para tallar</b>. ${hecho}`
        : pend > 0 ? `Hay <b>${pend}</b> ${pend === 1 ? 'cosa esperando su cuenta' : 'cosas esperando su cuenta'}: <b>tócalo para tallar</b> una muesca por cada una. ${hecho}`
        : `${hecho} Cuando vuelva la partida, se coseche o el rebaño entre al cerco, habrá algo que contar.`;
    return { ...FICHAS_FIJAS.conteo, linea };
  }
  if (f.k === 'fogata') { // el fuego dice EN QUÉ VA: viva, comida o pidiendo leña (y por qué importa)
    // OJO con el signo: `calorHogar()` va de 0,65 con la brasa en las últimas a 1 con la brasa llena. Es
    // una PENALIZACIÓN que se levanta, no un premio que se suma: decir "+0%" con el fuego alto era falso.
    const b = Math.round(((S.fuego - 35) / 65) * 100), pierde = Math.round((1 - calorHogar()) * 100);
    const base = FICHAS_FIJAS.fogata;
    if (!S.fuegoDescubierto) return { ...base, titulo: 'el fogón apagado', linea: 'Leña seca, dos varas y nadie que sepa aún cómo. <b>Frótalas</b>: la primera chispa cuesta, pero cuando prenda, el clan tendrá noche.' };
    const cuanto = b >= 85 ? 'está viva y alta' : b >= 45 ? 'arde tranquila' : b >= 15 ? 'va bajando' : 'está en las últimas';
    const efecto = pierde < 1
      ? `Así el clan <b>rinde al completo</b>, y de noche la velada se sostiene sola.`
      : `Con la brasa así el clan aprende un <b class="delta-mal">${pierde}% menos</b> de lo que podría, y de noche la velada se apaga con ella.`;
    if (S.fuego > 76) return { ...base, linea: `La brasa ${cuanto} (<b>${b}%</b>). ${efecto} <b>No le hace falta leña</b>: echarla ahora sería gastarla por nada.` };
    if ((S.mats.lena || 0) < 1) return { ...base, linea: `La brasa ${cuanto} (<b>${b}%</b>). ${efecto} Pide leña y no tenemos: ${QUERENCIA_DICE.lena.toLowerCase()}` };
    return { ...base, linea: `La brasa ${cuanto} (<b>${b}%</b>). ${efecto} <b>Tócala para echarle un leño.</b>` };
  }
  if (f.k === 'pescador' || /^diada\d/.test(f.k)) { // el de la orilla ofrece el gesto cuando queda sitio
    const base = f.k === 'pescador' ? FICHAS_FIJAS.pescador : FICHAS_FIJAS['diada' + f.k.slice(-1)] || FICHAS_FIJAS.pescador;
    if (haySitioEnLaOrilla()) return { ...base, linea: base.linea + ` <b>Queda sitio a su lado.</b> Tócalo y que se siente uno de los pequeños: ahí no hará falta explicarle nada, y lo que saque ya alimenta al clan.` };
    if (maxDiadas() > 0 && diadas() >= maxDiadas()) return { ...base, linea: base.linea + ` La orilla está llena: <b>${diadas()} ${diadas() === 1 ? 'pequeño ya tiene' : 'pequeños ya tienen'} su sitio</b>. Perfeccionar la pesca abre uno más.` };
    return base;
  }
  if (f.k === 'campo' && cultivoActivo()) { // el campo dice EN QUÉ VA: verde y esperando, o dorado y listo
    const pct = Math.round(Math.min(1, S.cultivo || 0) * 100);
    return { ...FICHAS_FIJAS.campo, linea: pct >= 100
      ? `Está dorado: <b>tócalo para cosechar</b> y llévate el grano.`
      : `La cebada va por el <b>${pct}%</b>. Aún no da grano: madura sola con el sol (de noche apenas avanza). Cuando dore, tócala.` };
  }
  if (/^coveja\d/.test(f.k) && nivelTec(25) >= 3) { // la marca de ocre TIENE un porqué: contar el rebaño
    const base = FICHAS_FIJAS[f.k];
    return { ...base, linea: base.linea + ' <b>La marca de ocre</b> en su lana no es adorno: cada oveja lleva la suya para contar el rebaño y saber cuál falta al anochecer. Así nació llevar la cuenta de lo que es tuyo, mucho antes que la escritura.' };
  }
  if (f.k === 'pastor' && nivelTec(25) >= 3) {
    return { ...FICHAS_FIJAS.pastor, linea: FICHAS_FIJAS.pastor.linea + ' Ahora marca a cada oveja con ocre y las cuenta al volver: <b>cuidar y contar se volvieron el mismo oficio</b>. De esa cuenta del rebaño saldrían, milenios después, las fichas de barro de Sumer.' };
  }
  if (f.k === 'secreto') { const s2 = SECRETOS.find(z => z.id === f.id); return s2 && secretoHallado(s2.id) ? { emoji: s2.emoji, titulo: s2.titulo, rol: 'en el gabinete del museo', linea: 'Tócalo para volver a leerlo.' } : { emoji: '✨', titulo: 'Algo brilla…', rol: 'un secreto', linea: 'Tócalo.' }; }
  return FICHAS_FIJAS[f.k];
}
let fichaActiva = null; // la clave del personaje al que la tarjeta sigue
let fichaDesde = 0, fichaAdios = null; // la ficha se despide sola (como el glosario del HUD): reloj y fundido
const claveFicha = f => `${f.k}|${f.i ?? ''}|${f.id ?? ''}`;
function posicionarFicha(px, py) {
  // LA FICHA SE DESPIDE SOLA a los 12 s (el QA la tuvo minutos tapando el centro-sur del mundo). No
  // hay «salvo que el cursor esté encima»: la tarjeta es pointer-events:none a propósito (no debe
  // robar clics del mundo), así que la lectura se renueva con otro clic al personaje, que es el gesto
  // que ya existe. El fundido es el mismo del glosario del HUD.
  const el = $('ficha');
  if (fichaDesde && performance.now() - fichaDesde > 12000) {
    if (!fichaAdios) {
      el.style.transition = 'opacity .6s'; el.style.opacity = '0';
      fichaAdios = setTimeout(ocultarFicha, 620);
    }
    return;
  }
  const w = el.offsetWidth, h = el.offsetHeight;
  const gap = 24 * zoom; // la tarjeta va AL COSTADO: nunca tapa al personaje ni la escena sobre él
  el.classList.remove('volteada', 'lado-der', 'lado-izq');
  if (px + gap + w <= W - 8 || px - gap - w >= 8) {
    const top = Math.max(8, Math.min(py - 26 * zoom - h / 2, H - h - 8)); // centrada a la altura del torso
    // E3 del QA completo: a la derecha tapaba a la consejera (la columna derecha del escritorio): si chocaría y a la
    // izquierda cabe, va a la izquierda
    const con = $('consejo'), rc = con && visible(con) ? con.getBoundingClientRect() : null;
    const choca = l => rc && l < rc.right && l + w > rc.left && top < rc.bottom && top + h > rc.top;
    const cabeDer = px + gap + w <= W - 8, cabeIzq = px - gap - w >= 8;
    const der = cabeDer && !(choca(px + gap) && cabeIzq && !choca(px - gap - w));
    el.classList.add(der ? 'lado-der' : 'lado-izq');
    const left = der ? px + gap : px - gap - w;
    el.style.left = left + 'px'; el.style.top = top + 'px';
    el.style.setProperty('--fy', Math.max(14, Math.min(py - 20 * zoom - top, h - 14)) + 'px'); // la flechita apunta al personaje
  } else { // pantalla angosta sin costados: sobre la cabeza, como antes
    const left = Math.max(8, Math.min(px - w / 2, W - w - 8));
    let top = py - 40 * zoom - h;
    const volteada = top < 8;
    el.classList.toggle('volteada', volteada);
    if (volteada) top = py + 12;
    el.style.left = left + 'px'; el.style.top = top + 'px';
    el.style.setProperty('--fx', Math.max(14, Math.min(px - left, w - 14)) + 'px');
  }
}
function mostrarFicha(p) {
  const d = fichaDe(p.ficha);
  if (!d) return;
  const el = $('ficha'), clave = claveFicha(p.ficha), nueva = clave !== fichaActiva;
  fichaActiva = clave;
  fichaDesde = performance.now(); // cada clic renueva la lectura
  clearTimeout(fichaAdios); fichaAdios = null; el.style.opacity = ''; el.style.transition = '';
  el.className = d.tipo || 'f-oficio';
  el.innerHTML = `<div class="cab"><span class="emoji">${d.emoji || '✨'}</span><div><div class="nom">${d.titulo}</div><div class="rol">${d.rol}</div></div></div>` +
    (d.cita ? `<div class="cita">«${d.cita}»</div>` : '') +
    `<div class="linea">${d.linea}</div>`;
  el.style.display = 'block';
  posicionarFicha(p.x, p.y);
  if (nueva) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
}
function ocultarFicha() {
  fichaActiva = null; fichaDesde = 0;
  clearTimeout(fichaAdios); fichaAdios = null;
  const el = $('ficha');
  el.style.display = 'none'; el.style.opacity = ''; el.style.transition = '';
}

/* ============================================================
   SONIDO (sintetizado, diegético y humilde)
   ============================================================ */
