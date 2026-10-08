/* ============================================================
   epocas/epoca7
   La Época 7 (Tenochtitlan) sobre el motor 3D. Como las otras: aquí vive lo de ESTA época (su lago, su isla, el recinto con
   el Templo Mayor, las escuelas, quién está dónde, su año de lluvias y secas, su noche y sus rótulos); el cómo lo pone
   motor3d.js. El mundo vive en src/tenochtitlan/ y sigue la maqueta elegida (BCAA de juego3d/bocetos/tenochtitlan.html):
   la isla llena el tablero y el lago es su borde; el recinto sagrado al fondo, con el Templo Mayor que mira al poniente
   (+x), el templo redondo de Ehécatl, el juego de pelota y la casa del calmécac; el teocalli del barrio con el
   telpochcalli al pie; un canal cruza la ciudad; las chinampas en los dos flancos; la plaza del barrio de las escuelas al
   frente, con la casa del canto, el lugar de la palabra y la casa de la partera; el embarcadero del tributo a la derecha.
   Las anclas de la lógica son las del motor (09e-tenochtitlan, espejadas en tenochtitlan/lugares.js).
   ============================================================ */
import * as THREE from 'three';
import { fundir } from '../kit.js';
import * as M from '../mundo.js';
import * as V from '../tenochtitlan/valle.js';
import * as MON from '../tenochtitlan/monumentos.js';
import * as PZ from '../tenochtitlan/piezas.js';
import * as L from '../tenochtitlan/lugares.js';
import { conActores } from '../piezas.js';
import { huellasDe } from '../caminos.js';
import { fase, tiene, niv, llave, Z2D } from '../motor3d.js';
import * as SE from '../secretos.js';

/* ---------- dónde está cada cosa ---------- */
const R = L.RECINTO, TZ = L.TEMPLO.y;                          // el eje del templo: la puerta del poniente y la calzada de Tlacopan
const RC = { x: (R.x0 + R.x1) / 2, y: (R.y0 + R.y1) / 2, w: R.x1 - R.x0, d: R.y1 - R.y0 };
const TEOCALLI = { x: L.TELPO.x - 1.15, y: L.TELPO.y - 1.0 };   // el templo del barrio, con el telpochcalli al pie (a su derecha, al frente)
const MUELLE = { x0: 16.55, x1: 17.5, y0: 9.12, y1: 9.48 };    // la tabla del embarcadero: se camina sobre el agua
const ACUEDUCTO = { x0: 12.85, x1: 16.85, y: 7.6 };              // el caño de Chapultepec, al lado de la calle de Tlacopan
/* los que enseñan: en el claro del barrio entre el canal y las casas de los principales, junto a la calle del Tepeyac y
   delante del muro del recinto; los alumnos se sientan alrededor, hacia la cámara */
const MAESTROS = [{ x: 9.4, y: 12.75 }, { x: 10.9, y: 12.95 }, { x: 8.1, y: 13.9 }, { x: 8.1, y: 15.4 }, { x: 6.6, y: 11.65 }];
const ESPERAN = [[15.7, 13.85], [16.05, 13.98], [16.42, 13.85]];             // las madres con sus recién nacidos, en la puerta de la partera
const TALLER = [[15.15, 10.98], [15.83, 10.98], [15.45, 11.34], [15.78, 11.38]];   // los del telpochcalli, en su patio, ante su maestro
const SURCOS = [[5.3, 12.63], [6.6, 12.63], [4.9, 13.43], [6.2, 13.43], [5.5, 14.23], [6.9, 14.23], [5.0, 15.03], [6.4, 15.03]];   // los que salieron al tequio, en las franjas de las chinampas
const CALMECATL = [[13.38, 9.95], [13.38, 10.25], [13.38, 10.55], [13.38, 10.85]];   // los del calmécac, sentados frente al pórtico
const DANZA = { x: L.CUICACALLI.x, y: L.CUICACALLI.y + 0.22, r: 0.4 };
const LAMPARAS = [{ x: 8.25, y: 11.5 }, { x: 8.95, y: 11.5 }, { x: 12.62, y: 7.6 }, { x: 12.62, y: 8.4 }, { x: 11.7, y: 12.6 }, { x: 16.72, y: 8.9 }];
const PARTERA_EN = { x: L.PARTERA.x, y: L.PARTERA.y + 0.05 };   // la partera, en su puerta
/* las canoas del lago: van y vuelven por el agua abierta, sin cruzar las calzadas ni pasar bajo los puentes */
const RUTAS_CANOA = [
  { p: [[9.3, 3.75], [15.9, 3.75], [17.35, 4.7], [17.4, 7.3]], v: 0.32, f: 0.1, carga: 'maiz' },              // el lago del fondo, al pie de los volcanes
  { p: [[9.4, 17.45], [16.2, 17.45], [17.35, 16.4], [17.35, 11.2]], v: 0.3, f: 0.55, carga: 'amate' },        // el lago del frente y el de la derecha
  { p: [[9.3, L.CANAL.y], [13.15, L.CANAL.y]], v: 0.22, f: 0.3, carga: 'maiz' },                             // el canal de la ciudad, entre sus dos puentes
  { p: [[4.75, 13.79], [7.15, 13.79]], v: 0.16, f: 0.8, carga: '' },                                          // un canal de las chinampas
];
const RUTA_TRIBUTO = [[17.7, 17.95], [17.75, 10.4], [17.75, 9.7], [17.25, 9.68]];   // llega por el frente y atraca al norte del muelle
const RUTA_NEZA = [[17.85, 13.6], [17.85, 9.95], [17.85, 8.95], [17.3, 8.92]];      // cruza el lago y amarra al sur del muelle
/* y a pie, recibido: baja del muelle, sube por la orilla del oriente (detrás del telpochcalli), rodea el remate del canal,
   bordea el canal hasta la plaza y entra por el corro de la palabra a la casa del canto (sin muros ni agua de por medio) */
const A_PIE_NEZA = [[16.72, 9.3], [16.6, 9.85], [16.55, 11.95], [16.55, 12.44], [13.05, 12.44], [12.88, 13.3], [12.9, 13.62], [12.98, 15.15], [L.LUGAR_NEZA.x, L.LUGAR_NEZA.y]].map(([x, z]) => ({ x, z }));

/* a lo largo de una polilínea: el punto a la distancia s y la dirección del tramo */
function largo(p) { let l = 0; for (let k = 1; k < p.length; k++) l += Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]); return l; }
function sobre(p, s) {
  for (let k = 1; k < p.length; k++) {
    const dx = p[k][0] - p[k - 1][0], dz = p[k][1] - p[k - 1][1], l = Math.hypot(dx, dz);
    if (s <= l || k === p.length - 1) { const u = Math.max(0, Math.min(1, s / l)); return { x: p[k - 1][0] + dx * u, z: p[k - 1][1] + dz * u, dx: dx / l, dz: dz / l }; }
    s -= l;
  }
}
/* el giro de la canoa: la proa es su -x local (el remero va atrás, mirando adelante) */
const giro = (dx, dz) => Math.atan2(dz, -dx);

function reservar() {
  const RS = V.RESERVAS; RS.length = 0;
  const caja = (x, z, w, d, m = 0.08) => RS.push({ x0: x - w / 2 - m, x1: x + w / 2 + m, z0: z - d / 2 - m, z1: z + d / 2 + m });
  caja(14.8, 5.75, 2.2, 2.6, 0.04);                                  // los jacales, el granero y el temazcal del barrio de la chinampa
  caja(L.TELPO2.x, L.TELPO2.y, 0.6, 1.9, 0.06);                      // el telpochcalli de la chinampa (la etapa 3)
  SURCOS.forEach(([x, z]) => RS.push({ x, z, r: 0.14 }));             // donde trabajan los del tequio: sin maíz encima
}
const lerpHex = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
const smooth = k => k * k * (3 - 2 * k);

export default {
  era: 7,
  nombre: 'Tenochtitlan',
  piezas: PZ.PIEZAS,
  construir(mo) {
    const { K, raiz, dyn, vivos, ranura, ranuras, persona, ubicar, ver, animar, opacidad, tocP } = mo;
    const oficio = (i, f) => conActores(fase(i) === 'meseta', f);
    reservar(); L.verificarEspejo();

    /* ---------- la ciudad: lo quieto se funde; el suelo y el agua se repintan con el año ---------- */
    const suelo = V.suelo(K), agua = V.agua(K, vivos), barrios = V.barrios(K), veg = V.vegetacion(K, vivos);
    const quieto = new THREE.Group(), fijos = [...barrios.userData.huellas];
    const pon = (o, x, z, ry = 0, s = 1, y = 0) => { o.position.set(x, y, z); o.rotation.y = ry; if (s !== 1) o.scale.multiplyScalar(s); quieto.add(o); return o; };
    quieto.add(V.losa(K), barrios, veg.g, V.puentes(K));
    /* EL RECINTO SAGRADO: el muro de serpientes con sus tres puertas (a las tres calzadas), el Templo Mayor que mira al
       poniente, el templo redondo de Ehécatl que lo mira de frente, el juego de pelota y la casa del calmécac */
    const yR = 0.02;
    pon(MON.coatepantli(K, RC.w, RC.d, { puertas: [0, 1, 2] }), RC.x, RC.y, 0, 1, yR);
    const templo = pon(MON.templo7(K, 3), L.TEMPLO.x - 0.1, TZ, Math.PI / 2, 1, yR);
    pon(MON.temploRedondo(K), R.x1 - 0.95, TZ, -Math.PI / 2, 0.8, yR);
    pon(MON.tlachtli(K), R.x1 - 0.95, R.y0 + 0.95, Math.PI / 2, 0.72, yR);
    pon(MON.calmecacGrande(K, { templo: false }), R.x1 - 0.85, R.y1 - 0.95, Math.PI / 2, 0.52, yR);
    /* los braseros grandes delante del templo: la brasa va aparte, viva, y se enciende de noche */
    const fuegos = [];
    [-1, 1].forEach(l => {
      const x = R.x1 - 2.0, z = TZ + l * 1.05;
      pon(MON.braseroGrande(K, 1.1, false), x, z, 0, 1, yR);
      const f = K.malla(K.cono(0.055, 0.14, 6), '#ffb13b', { emissive: '#ff8a2a', emissiveIntensity: 0.9, sinTinta: true, sombra: false }); f.position.set(x, yR + 0.26, z); f.userData.vivo = true; dyn.add(f); fuegos.push(f);
    });
    /* el teocalli del barrio (el telpochcalli lo pone su saber, al pie) */
    const teo = pon(MON.teocalliCalpulli(K), TEOCALLI.x, TEOCALLI.y);
    fijos.push(...huellasDe(teo, 0.06));
    /* el acueducto de Chapultepec, el embarcadero del tributo y los puentes de madera de las calzadas */
    pon(MON.acueducto(K, ACUEDUCTO.x1 - ACUEDUCTO.x0), (ACUEDUCTO.x0 + ACUEDUCTO.x1) / 2, ACUEDUCTO.y, 0, 1, 0.01);
    fijos.push({ x0: ACUEDUCTO.x0 - 0.06, x1: ACUEDUCTO.x1 + 0.06, z0: ACUEDUCTO.y - 0.12, z1: ACUEDUCTO.y + 0.12 });
    pon(MON.embarcadero(K, MUELLE.x1 - MUELLE.x0), MUELLE.x0 + 0.05, L.EMBARCADERO.y, 0, 1, 0.02);
    const puente = (x, z, w, d) => {                       // se quitaban, y el agua seguía pasando
      const b = new THREE.Group(), n = Math.floor(Math.max(w, d) / 0.12);
      b.add(K.malla(K.caja(w, 0.05, d), MON.TE.madera, { grosor: 0.004 }));
      for (let k = 0; k < n; k++) { const l = K.malla(K.caja(w > d ? 0.012 : w + 0.004, 0.054, w > d ? d + 0.004 : 0.012), MON.TE.maderaD, { sinTinta: true }); if (w > d) l.position.x = -w / 2 + 0.06 + k * 0.12; else l.position.z = -d / 2 + 0.06 + k * 0.12; b.add(l); }
      return pon(b, x, z, 0, 1, 0.045);
    };
    puente(17.3, 8.0, 0.5, 0.6); puente(8.6, 17.35, 0.6, 0.5); puente(8.6, 3.75, 0.6, 0.5);
    /* las canoas amarradas: una en el canal de la ciudad, otra en un canal de las chinampas */
    [[15.3, L.CANAL.y, 0, 'maiz'], [6.6, 15.43, Math.PI, 'maiz']].forEach(([x, z, ry, carga]) => { const c = MON.canoa(K, { carga, remero: false }); pon(c, x, z, ry, 1, V.NIVEL_LAGO + 0.01); });
    fundir(K, quieto);
    const vol = V.volcanes(K), humo = vol.humo; raiz.add(vol.g);   // el humo va vivo: no se funde
    raiz.add(suelo, agua.g, quieto);
    const nubes = M.nubes(K, vivos); raiz.add(nubes.g);
    const luciernagas = M.luciernagas(vivos); raiz.add(luciernagas);
    const luzTemplo = new THREE.PointLight('#ffb35c', 0, 6, 1.5); luzTemplo.position.set(L.TEMPLO.x + 2.6, 1.6, TZ); raiz.add(luzTemplo);
    const luzCalme = new THREE.PointLight('#ffa848', 0, 3.5, 1.6); luzCalme.position.set(L.CALMECAC.x + 0.3, 0.7, L.CALMECAC.y + 0.5); raiz.add(luzCalme);
    const luzCanto = new THREE.PointLight('#ffb35c', 0, 3.5, 1.6); luzCanto.position.set(L.CUICACALLI.x, 0.8, L.CUICACALLI.y + 0.4); raiz.add(luzCanto);
    const luzBarrio = new THREE.PointLight('#ffae5a', 0, 6, 1.6); luzBarrio.position.set(12.4, 0.9, 12.9); raiz.add(luzBarrio);
    const lamparas = LAMPARAS.map(Q => { const l = PZ.brasero(K); l.position.set(Q.x, 0.01, Q.y); dyn.add(l); return { ...Q, l }; });

    /* ---------- el lago: las canoas que van y vienen, y la del tributo que atraca en el embarcadero ---------- */
    const canoas = RUTAS_CANOA.map((r, i) => { const c = MON.canoa(K, { carga: r.carga, color: ['#8a5e3a', '#7a5232', '#94683e', '#82583a'][i] }); c.userData.vivo = true; dyn.add(c); return { ...r, c, L: largo(r.p) }; });
    const tributo = MON.canoa(K, { carga: 'amate' }); tributo.userData.vivo = true; dyn.add(tributo);
    const canoaNeza = MON.canoa(K, { remero: true, carga: '' }); canoaNeza.userData.vivo = true; dyn.add(canoaNeza);
    const flor = K.malla(K.esfera(0.05, 0.5), '#f2a83a', { sinTinta: true }); flor.position.set(-0.1, 0.12, 0); canoaNeza.add(flor);
    const LT = largo(RUTA_TRIBUTO), LN = largo(RUTA_NEZA);

    /* ---------- el año del lago (ESTACIONES_TENOCHTITLAN del motor): las lluvias suben el agua y verdean las chinampas ---------- */
    let pasoVestido = -1;
    function vestir() {
      const e = mo.estacionHoy();
      if (e.paso === pasoVestido) return; pasoVestido = e.paso;
      const k = e.k || 0, sig = e.sig || e, mez = (a, b) => k > 0 ? lerpHex(a, b, k) : a;
      suelo.userData.pintar({ campo: e.campo.map((c, i) => mez(c, sig.campo[i])), i: e.i, k, j: sig.i ?? ((e.i + 1) % 4) });
      veg.vestir(e.i, k, sig.i ?? ((e.i + 1) % 4));
      const cr = (e.crecida || 1) + ((sig.crecida || 1) - (e.crecida || 1)) * k;
      agua.lago.position.y = V.NIVEL_LAGO + (cr - 1) * 0.08;
    }

    /* ---------- los que siempre están ---------- */
    const guias = [0, 1, 2, 3, 4].map(i => persona(i === 0 ? { ...PZ.PARTERA } : i === 3 ? { ...PZ.SACERDOTE, colorRopa: '#efe0c8', chal: '#7a4a5e', pelo: 'trenza' } : { ...PZ.MAESTRO, piel: [2, 3, 2, 1][i - 1], chal: ['#b8352f', '#2a221c', '#7a4a5e', '#d09a3a'][i - 1] }, { pose: 'narrar' }));
    const madres = ESPERAN.map((_, i) => { const p = persona({ ...PZ.PARTERA, colorRopa: ['#efe6d2', '#e8d8b8', '#f2ead8'][i], chal: ['#3f7fb8', '#b8352f', '#2f9a8a'][i], pelo: i % 2 ? 'melena' : 'trenza' }, { pose: 'quieto' });
      const bebe = K.malla(K.capsula(0.05, 0.08, 0.5), '#f2ead8', { grosor: 0.002 }); bebe.rotation.z = Math.PI / 2; p.sostener?.(bebe, 'I'); return p; });
    const partera = persona({ ...PZ.PARTERA, chal: '#b8352f' }, { pose: 'quieto' });
    const brilloPartera = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), new THREE.MeshBasicMaterial({ color: '#ffd76a', transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending }));
    brilloPartera.geometry.userData.propia = true; brilloPartera.rotation.x = -Math.PI / 2; brilloPartera.position.set(ESPERAN[1][0], 0.02, ESPERAN[1][1] - 0.05); dyn.add(brilloPartera);
    const talleres = TALLER.map((_, i) => persona({ ...PZ.joven(i + 2), edad: 'nino' }, { pose: i % 2 ? 'quieto' : 'narrar' }));
    const labriegos = SURCOS.map((_, i) => persona({ ...PZ.joven(i + 4), edad: undefined, chal: undefined }, { pose: 'labrar' }));
    const calmecatl = CALMECATL.map((_, i) => persona({ ...PZ.joven(i + 9), edad: 'nino', colorRopa: '#efe6d2' }, { pose: 'leer' }));
    const danzantes = [0, 1, 2, 3, 4, 5].map(i => persona({ ...PZ.joven(i + 12), edad: undefined }, { pose: 'cantar' }));
    const neza = persona({ ...PZ.NEZA, pluma: undefined, penacho: true }, { pose: 'quieto' });
    const florN = K.malla(K.esfera(0.05, 0.5), '#e8803a', { sinTinta: true }); neza.sostener?.(florN, 'D');
    let nezaAntes = -1, nezaCamino = null;
    const anilloPalabra = SE.ondas(2, 0.5, '#ffd76a'); anilloPalabra.position.set(L.PALABRA.x, 0.02, L.PALABRA.y); dyn.add(anilloPalabra);
    const anilloCanto = SE.ondas(2, 0.6, '#ffd76a'); anilloCanto.position.set(DANZA.x, 0.02, DANZA.y); dyn.add(anilloCanto);
    const aprendices = mo.paseantes(18, { opciones: i => PZ.joven(i), inicio: i => ({ x: 9.2 + (i % 5) * 0.4, z: 12.5 + Math.floor(i / 5) * 0.28 }), semilla: 77 });

    /* ---------- por dónde se camina: la isla, sus calles, sus puentes, las calzadas y el muelle; el agua, la tierra
       firme del fondo, el recinto (con su muro) y las chinampas, no ---------- */
    const enR = (x, z, r, m = 0) => x > r.x0 - m && x < r.x1 + m && z > r.y0 - m && z < r.y1 + m;
    const enRect = (x, z, r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
    /* el agua con su orilla: la celda y sus cuatro vecinas a 0,12 (así nadie camina con los pies en el agua); el muelle y
       los puentes se caminan, pero solo por su medio (sin asomarse al borde) */
    const mojado = (x, z, m = 0) => !V.seCamina(x, z) && !enR(x, z, MUELLE, m);
    const puenteOK = (x, z) => L.PUENTES.some(p => Math.abs(x - p.x) < p.w / 2 - 0.1 && Math.abs(z - p.y) < 0.3);
    const enCanal = (x, z) => Math.abs(z - L.CANAL.y) < L.CANAL.a + 0.14 && x < L.CANAL.x1 + 0.12 && !puenteOK(x, z);
    const bloquea = (x, z) => mojado(x, z) || mojado(x + 0.12, z, 0.13) || mojado(x - 0.12, z, 0.13) || mojado(x, z + 0.12, 0.13) || mojado(x, z - 0.12, 0.13) || enCanal(x, z)
      || V.enRecinto(x, z, 0.14) || enR(x, z, L.CHINAMPAS, 0.06) || enR(x, z, L.CHINAMPAS2, 0.06)
      || x < 2.25 || z < 2.25 || x > 17.8 || z > 17.8 || fijos.some(r => enRect(x, z, r));
    let claveObst = '', corros = [];
    /* lo que se alcanza caminando desde el claro del barrio, por la grilla de caminos.js (celdas de 0,25 desde 2,1) */
    const CEL = 0.25, C0 = 2.1, NC = 64, celda = (x, z) => [Math.floor((x - C0) / CEL), Math.floor((z - C0) / CEL)];
    function alcanzable() {
      const ok = new Uint8Array(NC * NC), pila = [];
      for (const [x, z] of [[9.6, 12.9], [10.4, 12.6], [12.8, 13.3]]) { const [i, j] = celda(x, z); if (mo.caminos.libre(x, z) && !ok[i * NC + j]) { ok[i * NC + j] = 1; pila.push(i * NC + j); } }
      while (pila.length) {
        const c = pila.pop(), i = Math.floor(c / NC), j = c % NC;
        for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const ni = i + a, nj = j + b, k = ni * NC + nj;
          if (ni < 0 || nj < 0 || ni >= NC || nj >= NC || ok[k] || !mo.caminos.libre(C0 + (ni + 0.5) * CEL, C0 + (nj + 0.5) * CEL)) continue;
          ok[k] = 1; pila.push(k);
        }
      }
      return (x, z) => { const [i, j] = celda(x, z); return i >= 0 && j >= 0 && i < NC && j < NC && ok[i * NC + j] === 1; };
    }
    function rehacerPaso() {
      const circulos = [...V.AHUEHUETES.map(([x, z, s]) => ({ x, z, r: 0.28 * s + 0.08 })), ...lamparas.map(Q => ({ x: Q.x, z: Q.y, r: 0.13 })),
        ...TALLER.map(([x, z]) => ({ x, z, r: 0.12 })), ...CALMECATL.map(([x, z]) => ({ x, z, r: 0.12 })), ...ESPERAN.map(([x, z]) => ({ x, z, r: 0.14 })), { x: PARTERA_EN.x, z: PARTERA_EN.y, r: 0.14 }];
      mo.rehacerCaminos({ circulos, bloquea });
      const alcanza = alcanzable();                    // un bolsillo suelto (detrás del recinto, una orilla) no se camina: solo lo que se alcanza desde la plaza
      mo.rehacerCaminos({ circulos, bloquea: (x, z) => bloquea(x, z) || !alcanza(x, z) });
      aprendices.rehacer();
      const usados = [];
      corros = MAESTROS.map(m => buscarAsientos(m, 9, usados));
    }
    function buscarAsientos(m, cupo, usados) {
      const cand = [];
      for (const r of [0.62, 0.95]) for (let k = 0; k < 18; k++) { const a = Math.PI / 4 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (0.42 / r); cand.push({ x: m.x + Math.cos(a) * r, z: m.y + Math.sin(a) * r, d: Math.ceil(k / 2) * 0.42 / r + r * 0.6 }); }
      cand.sort((u, v) => u.d - v.d);
      const lista = [];
      for (const c of cand) {
        if (lista.length >= cupo) break;
        if (!mo.caminos.libre(c.x, c.z) || bloquea(c.x, c.z)) continue;
        if (usados.some(u => Math.hypot(u.x - c.x, u.z - c.z) < 0.3)) continue;
        const q = { x: c.x, z: c.z, mira: { x: m.x, y: m.y } }; lista.push(q); usados.push(q);
      }
      return lista;
    }

    /* ---------- EL SECRETO DE LA ÉPOCA: en la temporada seca y fresca, de noche, en lo alto del teocalli del barrio, un
       sacerdote mira en el espejo de obsidiana: el espejo que humea ---------- */
    const secretoEspejo = (() => {
      const h = (teo.userData.cima || 1.14) + 0.01, x = TEOCALLI.x, z = TEOCALLI.y + 0.27;   // la plataforma de arriba, delante del santuario
      const es = SE.espejoHumeante(K); es.position.set(x + 0.08, h, z + 0.02); es.scale.setScalar(0.8); dyn.add(es);
      const ch = SE.chispitas(6, 0.22, 0.4); ch.position.set(x + 0.08, h + 0.04, z); dyn.add(ch);
      const luzE = new THREE.PointLight('#c8b8ff', 0, 2.2, 1.6); luzE.position.set(x, h + 0.3, z + 0.15); raiz.add(luzE);
      const sac = persona({ ...PZ.SACERDOTE }, { pose: 'suelo' }); sac.obj.scale.setScalar(0.62);
      ubicar(sac, x - 0.2, z - 0.04, { x: x + 0.08, y: z + 0.02 }, h);
      return (t, dt, luz, on) => {
        const ve = on && luz < 0.4 && estacion().i === 0;
        es.visible = ve; ch.visible = ve && !secretoHallado('espejo');
        if (ver(sac, ve)) animar(sac, t, dt);
        luzE.intensity = ve ? 0.9 + 0.2 * Math.sin(t * 3) : 0;
        if (!ve) return;
        ch.userData.titilar(t); es.userData.humear(t);
        tocable(x, z, { k: 'secreto', id: 'espejo', x, y: z }, { rx: 20, ry: 14, dy: (h + 0.1) * Z2D });
      };
    })();

    /* ---------- cada cuadro ---------- */
    function sincronizar(t, dt) {
      const e7 = S.era === 7, luz = luzDia(), noche = nocheCasa(), deNoche = noche > 0.5;
      vestir();
      const lk = Math.max(0, Math.min(1, (0.55 - luz) / 0.25));
      luciernagas.userData.k = lk * lk * (3 - 2 * lk) * 0.35; luciernagas.visible = luciernagas.userData.k > 0.01;

      // --- las ranuras de los saberes ---
      ranura('amate', tiene(51) ? llave(51) : null, () => oficio(51, () => PZ.amate(K, niv(51))));
      ranura('telpo', tiene(52) ? llave(52) : null, () => oficio(52, () => PZ.telpochcalli(K, niv(52))));
      ranura('telpo2', fase(52) === 'meseta' && niv(52) >= 3 ? 1 : null, () => oficio(52, () => PZ.telpochcalli2(K)));
      ranura('calmecac', tiene(53) ? llave(53) : null, () => oficio(53, () => PZ.calmecac(K, niv(53))));
      ranura('cuicacalli', tiene(54) ? llave(54) : null, () => oficio(54, () => PZ.cuicacalli(K, niv(54))));
      ranura('tonal', tiene(55) ? llave(55) : null, () => oficio(55, () => PZ.tonalpohualli(K, niv(55))));
      ranura('palabra', tiene(56) ? llave(56) : null, () => oficio(56, () => PZ.palabra(K, niv(56))));
      const clave = mo.claveRanuras() + '|' + S.docentes;
      if (clave !== claveObst) { claveObst = clave; rehacerPaso(); }
      mo.animarRanuras(t, dt);

      // --- los tocables: las piezas y el mundo ---
      for (const r of Object.values(ranuras)) if (r.P && r.P.toc) for (const q of r.P.toc) tocP(q.x, q.y, { k: q.k }, q.p);
      tocable(L.TEMPLO.x, L.TEMPLO.y, { k: 'templo' }, { rx: 115, ry: 80, dy: 55 });
      tocable(L.EMBARCADERO.x - 0.1, L.EMBARCADERO.y, { k: 'embarcadero' }, { rx: 26, ry: 14, dy: 4 });
      tocable(8.6, 17.35, { k: 'calzada' }, { rx: 14, ry: 22, dy: 2 });
      tocable(6.0, 14.5, { k: 'chinampa' }, { rx: 60, ry: 34, dy: 4 });
      tocable(17.45, 14.5, { k: 'lago' }, { rx: 30, ry: 30, dy: 0 });
      tocable(4.6, 3.0, { k: 'volcanes' }, { rx: 60, ry: 60, dy: 80 });
      tocable(L.PARTERA.x, L.PARTERA.y - 0.35, { k: 'partera' }, { rx: 26, ry: 16, dy: 14 });

      // --- el humo del Popocatépetl, las canoas del lago ---
      if (humo) { humo.position.y = (humo.userData.y0 || 4.65) + 0.05 * Math.sin(t * 0.4); humo.rotation.y = t * 0.05; }
      const yLago = agua.lago.position.y + 0.01;
      canoas.forEach(q => {
        const s0 = ((t * q.v / q.L + q.f) % 2 + 2) % 2, ida = s0 < 1, k = smooth(ida ? s0 : 2 - s0), d = sobre(q.p, k * q.L);   // va y vuelve, despacio en las puntas
        q.c.position.set(d.x, yLago + 0.006 * Math.sin(t * 1.3 + q.f * 9), d.z); q.c.rotation.y = ida ? giro(d.dx, d.dz) : giro(-d.dx, -d.dz); q.c.rotation.z = 0.02 * Math.sin(t * 1.1 + q.f);
        q.c.visible = e7;
        if (e7) tocable(d.x, d.z, { k: 'canoa' }, { rx: 18, ry: 10, dy: 6 });
      });
      moverTributo(t, yLago);

      // --- los recién nacidos que esperan su escuela, en la puerta de la partera ---
      const pend = e7 ? nacidosPend() : 0;
      madres.forEach((p, i) => { if (ver(p, i < pend)) { ubicar(p, ESPERAN[i][0], ESPERAN[i][1], { x: PARTERA_EN.x, y: PARTERA_EN.y }); animar(p, t, dt); } });
      if (ver(partera, e7 && telpoAbierto())) { ubicar(partera, PARTERA_EN.x, PARTERA_EN.y, { x: ESPERAN[1][0], y: ESPERAN[1][1] }); partera.e.pose = pend ? 'narrar' : 'quieto'; animar(partera, t, dt); }
      brilloPartera.visible = e7 && pend > 0 && telpoAbierto(); brilloPartera.material.opacity = 0.18 + 0.12 * Math.sin(t * 2.5);

      // --- los maestros de los barrios ---
      const vis = Math.min(S.alumnos, 18), sueltos = Math.min(vis, Math.max(0, Math.round((S.alumnos - alumnosBien()) * vis / Math.max(1, S.alumnos))));
      const cupos = [Math.min(9, BALANCE.ratioDocente + palestraSitio()), ...[1, 2, 3, 4].map(k => k < S.docentes ? Math.min(9, cupoGuia(k) + palestraSitio()) : 0)];
      const plan = [], planM = [];
      corros.forEach((sitios, m) => { for (let j = 0; j < Math.min(cupos[m] || 0, sitios.length) && plan.length < vis - sueltos; j++) { plan.push(sitios[j]); planM.push(m); } });
      guias.forEach((p, i) => {
        if (!ver(p, i === 0 ? S.docentes >= 1 : i < S.docentes)) return;
        const m = MAESTROS[i]; ubicar(p, m.x, m.y, { x: m.x + 1, y: m.y + 1 });
        p.e.pose = deNoche ? 'quieto' : 'narrar'; animar(p, t, dt); tocP(m.x, m.y, { k: 'docente', i }, p);
      });

      // --- los que estudian en las escuelas, y los que salieron a trabajar las chinampas (el tequio) ---
      const telpo = e7 ? (S.telpo || []).length : 0, calme = e7 ? (S.calme || []).length : 0, egres = e7 ? Math.min(SURCOS.length, S.egresTelpo || 0) : 0;
      talleres.forEach((p, i) => { if (ver(p, !deNoche && i < Math.min(TALLER.length, telpo))) { ubicar(p, TALLER[i][0], TALLER[i][1], { x: L.TELPO.x + 0.58, y: L.TELPO.y + 0.92 }); animar(p, t, dt); } });
      labriegos.forEach((p, i) => { if (ver(p, !deNoche && i < egres)) { ubicar(p, SURCOS[i][0], SURCOS[i][1], { x: SURCOS[i][0] + 0.6, y: SURCOS[i][1] + 0.8 }, V.altura(SURCOS[i][0], SURCOS[i][1])); animar(p, t, dt); tocP(SURCOS[i][0], SURCOS[i][1], { k: 'chinampa' }, p); } });
      calmecatl.forEach((p, i) => { if (ver(p, i < calme)) { ubicar(p, CALMECATL[i][0], CALMECATL[i][1], { x: L.CALMECAC.x - 0.1, y: L.CALMECAC.y - 0.15 }); animar(p, t, dt); } });   // sentados frente al sacerdote

      // --- el canto de la tarde: si ya se cantó hoy y cae la noche, los jóvenes danzan en el patio de la cuicacalli ---
      const canta = e7 && cuicacalliAbierta() && S.cantoNoche === diaCanto() && luz < 0.5 && luz > 0.08;
      danzantes.forEach((p, i) => { if (!ver(p, canta)) return; const a = t * 0.5 + i * Math.PI / 3; const x = DANZA.x + Math.cos(a) * DANZA.r, z = DANZA.y + Math.sin(a) * DANZA.r * 0.8; ubicar(p, x, z, { x: x - Math.sin(a), y: z + Math.cos(a) }); animar(p, t, dt); });
      anilloCanto.visible = e7 && cantoDisponible(); if (anilloCanto.visible) anilloCanto.userData.latir(t);
      anilloPalabra.visible = e7 && palabraDisponible(); if (anilloPalabra.visible) anilloPalabra.userData.latir(t);

      // --- Nezahualcóyotl: llega en canoa desde Texcoco, espera en el embarcadero y, recibido, camina a la casa del canto ---
      const estN = e7 ? estadoPensador('neza') : 0;
      if (estN !== nezaAntes && nezaAntes !== -1 && estN === 2 && nacimientosVivos) {
        nezaCamino = { cola: A_PIE_NEZA.map(q => ({ ...q })), pos: { x: L.ESPERA_NEZA.x, z: L.ESPERA_NEZA.y } };
      }
      if (estN === 1 && nezaAntes !== 1) canoaNeza.userData.t0 = t;
      nezaAntes = estN;
      moverCanoaNeza(t, estN, yLago);
      if (ver(neza, estN >= 1 && (estN === 2 || t - (canoaNeza.userData.t0 || 0) > 8))) {
        const L0 = estN === 1 ? L.ESPERA_NEZA : L.LUGAR_NEZA;
        let px = L0.x, py = L0.y, anda = false, mira = estN === 1 ? { x: L.ESPERA_NEZA.x - 1, y: L.ESPERA_NEZA.y + 0.6 } : { x: L.CUICACALLI.x, y: L.CUICACALLI.y + 0.3 };
        if (nezaCamino) {
          const c = nezaCamino, dd = c.cola[0];
          if (!dd) nezaCamino = null;
          else { const dx = dd.x - c.pos.x, dz = dd.z - c.pos.z, D = Math.hypot(dx, dz); if (D < 0.05) c.cola.shift(); else { const s = Math.min(D, 0.6 * dt); c.pos.x += dx / D * s; c.pos.z += dz / D * s; } px = c.pos.x; py = c.pos.z; anda = true; mira = { x: px + dx, y: py + dz }; }
        }
        ubicar(neza, px, py, mira, enR(px, py, MUELLE) ? 0.07 : 0); neza.e.pose = anda ? 'andar' : estN === 2 && !deNoche ? 'narrar' : 'quieto'; animar(neza, t, dt);
        tocP(px, py, { k: 'pensador', id: 'neza' }, neza);
      }

      // --- los jóvenes: de día, los corros de los barrios; de noche, a su casa ---
      const asiento = deNoche ? () => null : i => plan[i] || null;
      const maestro = m => LEX().nombres[m % LEX().nombres.length];
      aprendices.paso(t, dt, deNoche ? 0 : vis, { asiento, mira: MAESTROS[0] }, a => ({ k: 'alumno', i: a.i, con: deNoche ? undefined : planM[a.i] !== undefined ? maestro(planM[a.i]) : null }));

      // --- la noche: los braseros del recinto y de las calles, el fuego del calmécac, la casa del canto ---
      const oscuro = luz < 0.5, n1 = 1 - luz;
      lamparas.forEach(Q => { const ll = Q.l.userData.llama; ll.visible = oscuro; ll.scale.set(1, 1 + 0.25 * Math.sin(t * 12 + Q.x), 1); });
      fuegos.forEach((f, i) => { f.visible = oscuro; f.scale.set(1, 1 + 0.22 * Math.sin(t * 10 + i * 2), 1); });
      luzTemplo.intensity = n1 * 3.2 * (0.9 + 0.1 * Math.sin(t * 8));
      luzCalme.intensity = (tiene(53) ? n1 * 2.4 : 0) * (0.9 + 0.1 * Math.sin(t * 10));
      luzCanto.intensity = (canta ? 2.2 : n1 * 0.8) * (0.9 + 0.1 * Math.sin(t * 11));
      luzBarrio.intensity = n1 * 2.2 * (0.9 + 0.1 * Math.sin(t * 7));

      secretoEspejo(t, dt, luz, e7);
      mo.luces(t);
      vivos.forEach(f => f(t, dt));
      return { luz, brasa: 0 };
    }

    /* la canoa del tributo: una vez por estación cruza el lago desde el borde del frente y atraca al norte del muelle */
    function moverTributo(t, yLago) {
      const e = estacion(), u = e.f;                     // la fracción de la estación (0 → 1)
      let s, alfa = 1, vuelve = false;
      if (u < 0.3) { s = smooth(u / 0.3) * LT; alfa = Math.min(1, u / 0.04); }
      else if (u < 0.6) s = LT;
      else { s = (1 - smooth((u - 0.6) / 0.35)) * LT; alfa = Math.min(1, (0.95 - u) / 0.05); vuelve = true; }
      tributo.visible = alfa > 0.02 && S.era === 7; if (!tributo.visible) return;
      const d = sobre(RUTA_TRIBUTO, s);
      tributo.position.set(d.x, yLago + 0.004 * Math.sin(t * 1.2), d.z); tributo.rotation.y = vuelve ? giro(-d.dx, -d.dz) : giro(d.dx, d.dz); opacidad(tributo, Math.max(0, alfa));
    }
    /* la canoa de Nezahualcóyotl: cruza el lago por la derecha y amarra al sur del muelle; después se queda amarrada */
    function moverCanoaNeza(t, estN, yLago) {
      if (estN < 1) { canoaNeza.visible = false; return; }
      const u = Math.min(1, (t - (canoaNeza.userData.t0 || 0)) / 8), k = estN === 2 ? 1 : smooth(u), d = sobre(RUTA_NEZA, k * LN);
      canoaNeza.visible = true; canoaNeza.position.set(d.x, yLago + 0.005 * Math.sin(t), d.z);
      canoaNeza.rotation.y = giro(d.dx, d.dz); opacidad(canoaNeza, Math.min(1, u / 0.15 + (estN === 2 ? 1 : 0)));
    }

    /* ---------- el estado de cada saber y los globos: el pase 2D ---------- */
    const ALTO = { 51: 30, 52: 36, 53: 40, 54: 36, 55: 40, 56: 36 };
    const DONDE = { 51: PZ.ANCLAS.amate, 52: PZ.ANCLAS.telpo, 53: PZ.ANCLAS.calmecac, 54: PZ.ANCLAS.cuicacalli, 55: PZ.ANCLAS.tonal, 56: PZ.ANCLAS.palabra };
    function superponer(t) {
      for (const i of [51, 52, 53, 54, 55, 56]) { if (!tiene(i)) continue; const a = DONDE[i], p = P(a.x, a.y, ALTO[i]); estadoTec(i, { x: p.x, y: p.y }, t); }
      if (S.era !== 7) return;
      if (estadoPensador('neza') === 1 && VISITAS.neza && !nezaCamino) drawGlobo(L.ESPERA_NEZA.x, L.ESPERA_NEZA.y, t);
    }

    /* ---------- los rótulos de acción: lo que se toca en Tenochtitlan ---------- */
    function rotulos(ancla, t, tocarEn) {
      const e7 = S.era === 7;
      ancla('promesa', e7 && telpoAbierto() && nacidosPend() > 0, ESPERAN[1][0], ESPERAN[1][1], 40, `presentar · ${nacidosPend()}`, 'accion', () => { if (!abrirPromesa()) presentar('telpochcalli'); });
      ancla('canto', e7 && cantoDisponible(), L.CUICACALLI.x, L.CUICACALLI.y, 50, 'el canto de la tarde', 'accion', () => cantar());
      ancla('palabra', e7 && palabraDisponible(), L.PALABRA.x, L.PALABRA.y, 50, 'escuchar la palabra', 'accion', () => decirPalabra());
      const estN = e7 ? estadoPensador('neza') : 0;
      ancla('recibir', estN === 1 && S.apr >= (VISITAS.neza?.costo || 0), L.ESPERA_NEZA.x, L.ESPERA_NEZA.y, 52, 'recibir a Nezahualcóyotl', 'accion', () => tocarEn(L.ESPERA_NEZA.x, L.ESPERA_NEZA.y));
    }

    /* las caras de quienes firman la consejera en esta época */
    const caras = {
      'partera': { ...PZ.PARTERA },
      'nezahualc': { ...PZ.NEZA, pluma: undefined, penacho: true },
    };
    return { quieto, nubes, sincronizar, superponer, rotulos, caras, aprendices, get corros() { return corros; } };
  },
};
