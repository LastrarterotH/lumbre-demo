/* ============================================================
   epocas/epoca6
   La Época 6 (Bagdad) sobre el motor 3D. Como las otras: aquí vive lo de ESTA época (su ciudad redonda, sus monumentos,
   sus piezas, quién está dónde, su año de caravanas, su noche y sus rótulos); el cómo lo pone motor3d.js. La ciudad, los
   monumentos y los saberes viven en src/bagdad/. Las anclas de la lógica (la puerta de Kufa donde esperan los manuscritos,
   la mesa de los traductores, la halqa, el banco del cadí, el molino) son las del motor (09d-bagdad).
   El tablero es el que eligió el usuario en la hoja juego3d/bocetos/bagdad.html (replanteo del 2026-10-04, AABA): el héroe
   es la Ciudad Redonda entera, al fondo, con la Cúpula Verde de 4 de alto; la segunda pieza, el molino de papel con su
   noria sobre el canal de los campos; las casas, las de patio, pocas; el Tigris a la derecha, y los saberes en la plaza
   del arrabal, la mitad del frente.
   ============================================================ */
import * as THREE from 'three';
import { fundir } from '../kit.js';
import * as M from '../mundo.js';
import * as V from '../bagdad/valle.js';
import * as MON from '../bagdad/monumentos.js';
import * as PZ from '../bagdad/piezas.js';
import * as L from '../bagdad/lugares.js';
import { conActores } from '../piezas.js';
import { velero } from '../bagdad/maqueta.js';
import { fase, tiene, niv, llave, Z2D } from '../motor3d.js';
import * as SE from '../secretos.js';

/* ---------- dónde está cada cosa ---------- */
const C = L.CIUDAD;
/* los que enseñan: el primero en la halqa (cuando la hay) o junto a la pila de manuscritos; los demás, en la plaza del
   arrabal (delante del foso, entre la halqa y el zoco, junto al camino de Kufa) y, el quinto, a la vera del camino de
   Jorasán, entre la ciudad y el puente de barcas (la plaza ya no da para otro corro de nueve) */
const MAESTROS = [{ x: 7.75, y: 11.65 }, { x: 9.95, y: 11.05 }, { x: 9.95, y: 13.95 }, { x: 7.45, y: 13.3 }, { x: 12.3, y: 7.05 }];
const MAESTRO_HALQA = { x: PZ.HALQA_COLUMNA.x, y: PZ.HALQA_COLUMNA.y + 0.05 };
/* los repetidores (los que recibieron la ijaza), cada uno con los suyos: en la plaza, delante del barrio, al pie del tell
   de la aldea vieja y entre la mesa y la madrasa (ninguno detrás de la Casa, donde la cámara no llega) */
const MUIDIN = [{ x: 8.4, y: 11.2 }, { x: 3.95, y: 10.85 }, { x: 11.6, y: 5.3 }, { x: 12.65, y: 14.2 }];
const PILA = { x: 7.2, y: 11.5 };                                           // los manuscritos que esperan, a un lado del camino, afuera de la puerta
const ALTO_CARAVANA = { x: C.x, y: 12.55 };                                 // donde se detiene la caravana, en el camino de Kufa
const JAHIZ = { x: 7.32, y: 14.6 };                                          // al-Jahiz lee en el zoco (de noche, con la lámpara del librero)
const FAMILIA = [[11.28, 14.25], [11.58, 14.38], [11.45, 14.62]];           // los herederos ante el cadí, a su derecha
const IJAZA = { x: L.HALQA.x + 0.55, y: L.HALQA.y + 0.85 };                 // el estudiante que espera su ijaza
/* de noche: seis siguen la lección en la halqa, a la luz de su lámpara; el resto, a su casa (en verano, a dormir a la azotea) */
const VELA = [0, 1, 2, 3, 4, 5].map(k => { const a = Math.PI * 0.15 + k * Math.PI * 0.7 / 5; return [L.HALQA.x + Math.cos(a) * 0.5, L.HALQA.y + 0.15 + Math.sin(a) * 0.5]; });
const LAMPARAS = [{ x: 11.75, y: 12.3 }, { x: 10.15, y: 13.25 }, { x: 8.1, y: 11.95 }, { x: 7.3, y: 15.1 }];
const HUNAYN_LLEGA = { x: C.x, y: 15.4 };                                   // Hunayn sube por el camino de Kufa, como las caravanas

function reservar() {
  const R = V.RESERVAS; R.length = 0;
  const caja = (x, z, w, d, m = 0.1) => R.push({ x0: x - w / 2 - m, x1: x + w / 2 + m, z0: z - d / 2 - m, z1: z + d / 2 + m });
  V.reservarValle(R);
  R.push({ x: C.x, z: C.y, r: V.CIUDAD_R, ciudad: true });                // la Ciudad Redonda entera (el héroe): se mira, no se camina
  caja(L.CASA.x, L.CASA.y, 2.62, 2.1, 0.06);                                // la Casa de la Sabiduría (el diseño C a 0,6)
  caja(L.CASA.x + 0.87, PZ.FRENTE_CASA + 0.26, 0.7, 0.42, 0.02);            // sus cofres y el lector, a la derecha de la portada
  caja(L.MESA.x + 0.05, L.MESA.y + 0.05, 2.2, 1.2, 0.05);
  R.push({ x: L.HALQA.x, z: L.HALQA.y + 0.1, r: 0.9 }); R.push({ x: L.HALQA.x - 1.0, z: L.HALQA.y + 0.55, r: 0.45 });
  caja(L.HALQA.x, PZ.HALQA_COLUMNA.y - 0.15, 1.5, 0.4, 0.04);              // la galería de la halqa
  caja(L.ZOCO.x, L.ZOCO.y + 0.05, 1.85, 0.62, 0.05); caja(PZ.ANCLAS.libreros.x, PZ.ANCLAS.libreros.y, 1.85, 0.62, 0.05);
  caja(L.CADI.x, L.CADI.y, 1.0, 0.78, 0.05);
  R.push({ x0: L.MOLINO.x - 1.65, x1: L.MOLINO.x + 0.35, z0: L.MOLINO.y - 1.65, z1: L.MOLINO.y - 0.25 });   // la casa del molino y su tendedero
  R.push({ x0: L.MOLINO.x + 0.3, x1: L.MOLINO.x + 1.85, z0: L.MOLINO.y - 2.0, z1: L.MOLINO.y - 0.25 });     // las tinas, el acueducto y la noria
  caja(L.MADRASA.x, L.MADRASA.y, 1.87, 1.65, 0.06);
  R.push({ x: PZ.ANCLAS.papel.x, z: PZ.ANCLAS.papel.y, r: 0.85 });
  R.push({ x: PZ.ANCLAS.algebra.x, z: PZ.ANCLAS.algebra.y + 0.05, r: 0.8 });
  caja(PILA.x, PILA.y, 0.5, 0.45, 0);
}
const lerpHex = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
const smooth = k => k * k * (3 - 2 * k);

export default {
  era: 6,
  nombre: 'Bagdad',
  piezas: PZ.PIEZAS,
  construir(mo) {
    const { K, raiz, dyn, vivos, ranura, ranuras, persona, ubicar, ver, animar, opacidad, tocP } = mo;
    const oficio = (i, f) => conActores(fase(i) === 'meseta', f);
    reservar(); L.verificarEspejo();

    /* ---------- el tablero: lo quieto se funde; el suelo, el agua y los campos se repintan con el año ---------- */
    const suelo = V.suelo(K), agua = V.agua(K, vivos), casas = V.casas(K), campos = V.campos(K);
    const veg = V.vegetacion(K, vivos);
    const quieto = new THREE.Group();
    quieto.add(V.losa(K), casas, veg.g, V.ruinas(K));
    const zo = MON.zoco(K, 2); zo.scale.setScalar(PZ.ESC_ZOCO); zo.position.set(L.ZOCO.x, 0, L.ZOCO.y + 0.05); quieto.add(zo);
    const ca = MON.bancoCadi(K); ca.scale.setScalar(1.2); ca.position.set(L.CADI.x, 0, L.CADI.y); quieto.add(ca);
    const puente = MON.puenteBarcas(K, V.E1 - L.TIGRIS_X0 + 0.1); puente.position.set((L.TIGRIS_X0 + V.E1) / 2, V.NIVEL_RIO + 0.02, C.y); quieto.add(puente);
    const amarrada = velero(K); amarrada.scale.setScalar(1.1); amarrada.position.set(V.MUELLE.x + 0.25, V.NIVEL_RIO - 0.01, V.MUELLE.z + 0.36); amarrada.rotation.y = 0.08; quieto.add(amarrada);   // la barca de vela amarrada al muelle
    fundir(K, quieto);
    /* el héroe: la Ciudad Redonda entera, con la Cúpula Verde del palacio en el centro (lo más alto de Bagdad) */
    const ciudad = MON.heroe(K, MON.VARIANTES.heroe); fundir(K, ciudad, 0.012); ciudad.position.set(C.x, 0, C.y); quieto.add(ciudad);
    /* la segunda pieza: el molino de papel con su noria sobre el canal de los campos; la rueda se anima */
    const mol = MON.molinoNoria(K, { canal: false }), rueda = mol.userData.rueda;   // sin su agua: el canal lo pone el valle
    mol.remove(rueda); fundir(K, mol, 0.01); mol.position.set(L.MOLINO.x, 0, L.MOLINO.y - 0.62); raiz.add(mol);
    rueda.userData.vivo = true; mol.add(rueda);
    raiz.add(suelo, agua.g, campos.g, quieto);
    const nubes = M.nubes(K, vivos); raiz.add(nubes.g);
    const luciernagas = M.luciernagas(vivos); raiz.add(luciernagas);
    const luzCasa = new THREE.PointLight('#ffc27a', 0, 5, 1.5); luzCasa.position.set(L.CASA.x, 0.9, PZ.FRENTE_CASA + 0.35); raiz.add(luzCasa);
    const luzHalqa = new THREE.PointLight('#ffb35c', 0, 4, 1.6); luzHalqa.position.set(L.HALQA.x, 0.9, L.HALQA.y + 0.2); raiz.add(luzHalqa);
    const luzZoco = new THREE.PointLight('#ffae5a', 0, 3.5, 1.6); luzZoco.position.set(JAHIZ.x + 0.3, 0.8, JAHIZ.y); raiz.add(luzZoco);
    const luzCasas = new THREE.PointLight('#ffae5a', 0, 6, 1.6); luzCasas.position.set(4.3, 1.0, 12.8); raiz.add(luzCasas);
    const luzPalacio = new THREE.PointLight('#ffd08a', 0, 5, 1.6); luzPalacio.position.set(L.PALACIO.x, 1.8, L.PALACIO.y + 1.7); raiz.add(luzPalacio);
    const lamparas = LAMPARAS.map(Q => { const l = PZ.lampara(K); l.position.set(Q.x, 0, Q.y); dyn.add(l); return { ...Q, l }; });

    /* ---------- el Tigris: las quffas que bajan con la corriente ---------- */
    const quffas = [{ x: 17.15, f: 0 }, { x: 17.6, f: 0.5 }].map(q => { const b = MON.quffa(K); b.scale.setScalar(0.8); b.userData.vivo = true; dyn.add(b); return { ...q, b }; });
    /* y una barca de vela que sube contra la corriente, despacio, por el medio del río */
    const barcaVela = velero(K); barcaVela.scale.setScalar(1.1); barcaVela.rotation.y = Math.PI / 2; barcaVela.userData.vivo = true; dyn.add(barcaVela);

    /* ---------- la caravana: tres camellos y el camellero, que entran por el camino de Kufa ---------- */
    const camellos = [0, 1, 2].map(i => { const c = MON.camello(K, { color: ['#c99d66', '#b98d58', '#d2a872'][i] }); c.scale.setScalar(1.08); c.userData.vivo = true; dyn.add(c); return c; });
    const camellero = persona({ piel: 2, pelo: 'corto', colorPelo: '#1e1610', barba: true, ropa: 'tunica', colorRopa: '#b9a27a', orla: '#6a4a2a', turbante: '#d8cdb2' }, { pose: 'andar' });
    const fardoMano = K.malla(K.caja(0.14, 0.1, 0.06), MON.BA.fardo, { grosor: 0.002 });   // la caja que lleva a la pila
    camellero.sostener?.(fardoMano, 'D');
    /* los manuscritos que esperan: cajas de cuero apiladas; los que vuelven para revisarse llevan la cinta roja */
    const PILA_POS = [[0, 0], [0.17, 0.02], [-0.02, 0.17], [0.16, 0.18], [0.07, 0.09], [0.08, -0.15], [-0.12, 0.05], [0.26, 0.1], [-0.1, -0.12], [0.24, -0.08]];
    const pila = PILA_POS.map(([dx, dz], i) => {
      const g = new THREE.Group(); g.position.set(PILA.x + dx - 0.07, i === 4 ? 0.1 : 0, PILA.y + dz - 0.05); g.rotation.y = 0.3 * Math.sin(i * 2.1);
      const cj = K.malla(K.caja(0.15, 0.1, 0.11), [MON.BA.fardo, MON.BA.fardoB, '#8a5a3a'][i % 3], { grosor: 0.002 }); cj.position.y = 0.05; g.add(cj);
      const cinta = K.malla(K.caja(0.155, 0.104, 0.02), '#c8302a', { sinTinta: true }); cinta.position.y = 0.05; g.add(cinta); g.userData.cinta = cinta;
      g.userData.vivo = true; dyn.add(g); return g;
    });
    const brilloPila = new THREE.Mesh(new THREE.CircleGeometry(0.36, 24), new THREE.MeshBasicMaterial({ color: '#ffd76a', transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending }));
    brilloPila.geometry.userData.propia = true; brilloPila.rotation.x = -Math.PI / 2; brilloPila.position.set(PILA.x + 0.05, 0.02, PILA.y + 0.03); dyn.add(brilloPila);

    /* ---------- el año de Bagdad (ESTACIONES_BAGDAD del motor): la crecida de primavera sube el Tigris ---------- */
    let pasoVestido = -1;
    function vestir() {
      const e = mo.estacionHoy();
      if (e.paso === pasoVestido) return; pasoVestido = e.paso;
      const k = e.k || 0, sig = e.sig || e, mez = (a, b) => k > 0 ? lerpHex(a, b, k) : a;
      const j = sig.i ?? ((e.i + 1) % 4);
      suelo.userData.pintar({ campo: e.campo.map((c, i) => mez(c, sig.campo[i])), verde: lerpHex(V.VERDE[e.i], V.VERDE[j], k) });
      veg.vestir(e.i, k, j); campos.vestir(e.i, k, j);
      const cr = (e.crecida || 1) + ((sig.crecida || 1) - (e.crecida || 1)) * k;
      agua.rio.position.y = V.NIVEL_RIO + (cr - 1) * 0.06;
    }

    /* ---------- los que siempre están ---------- */
    const guias = [0, 1, 2, 3, 4].map(i => persona(i === 0 ? { ...PZ.MAESTRO } : { ...PZ.MAESTRO, piel: [2, 1, 3, 1][i - 1], colorPelo: ['#2a1f18', '#3a2a1e', '#1e1610', '#5a4632'][i - 1], chal: ['#8a5a2a', '#5f7a4a', '#7a3a3a', '#2f6f8a'][i - 1], turbante: ['#efe8d8', '#e6dcc4', '#f6f0e2', '#d8cdb2'][i - 1] }, { pose: 'narrar' }));
    const muidin = [0, 1, 2, 3].map(i => persona({ ...PZ.aprendiz(i + 10), edad: undefined, turbante: '#f6f0e2', chal: '#c9a24a' }, { pose: 'narrarSentada' }));
    const traductores = PZ.TRADUCTORES.map(o => persona({ ...o }, { pose: 'escribir' }));
    const deskTaller = [3, 4].map(k => { const g = new THREE.Group(), s = PZ.ASIENTOS_MESA[k];
      const c = K.malla(K.esfera(0.09, 0.5), ['#c9a24a', '#7a3a3a'][k - 3], { grosor: 0.002 }); c.scale.set(1.1, 0.32, 1); c.position.set(s.x, 0.03, s.y); g.add(c);
      const ku = PZ.kursi(K); ku.position.set(s.x + 0.05, 0, s.y + 0.18); g.add(ku); g.userData.vivo = true; dyn.add(g); return g; });
    const hunayn = persona({ ...PZ.HUNAYN }, { pose: 'quieto' });
    const libroH = K.malla(K.caja(0.1, 0.03, 0.13), '#6a2a1e', { grosor: 0.002 }); hunayn.sostener?.(libroH, 'I');
    let hunAntes = -1, hunCamino = null;
    const jahiz = persona({ ...PZ.ALJAHIZ }, { pose: 'leer' });
    const cadi = persona({ ...PZ.CADI }, { pose: 'sentado' });
    const familia = [
      persona({ piel: 1, pelo: 'moño', colorPelo: '#2a1f18', ropa: 'tunica', colorRopa: '#4a3a5a', velo: '#2a2438' }, { pose: 'quieto' }),
      persona({ piel: 1, pelo: 'corto', colorPelo: '#2a1f18', barba: true, ropa: 'tunica', colorRopa: '#8a6a4a', turbante: '#e6dcc4' }, { pose: 'quieto' }),
      persona({ piel: 1, edad: 'nino', pelo: 'corto', colorPelo: '#2a1f18', ropa: 'tunica', colorRopa: '#d9cfb5' }, { pose: 'quieto' }),
    ];
    const alumnoIjaza = persona({ ...PZ.aprendiz(11), edad: undefined }, { pose: 'quieto' });
    const libroI = K.malla(K.caja(0.1, 0.03, 0.13), '#2f5f7a', { grosor: 0.002 }); alumnoIjaza.sostener?.(libroI, 'D');
    const anilloIjaza = SE.ondas(2, 0.5, '#ffd76a'); anilloIjaza.position.set(IJAZA.x, 0.02, IJAZA.y); dyn.add(anilloIjaza);
    const aprendices = mo.paseantes(18, { opciones: i => PZ.aprendiz(i), inicio: i => ({ x: 7.6 + (i % 6) * 0.38, z: 11.3 + Math.floor(i / 6) * 0.25 }), semilla: 66 });   // delante del foso, sin pisar la galería de la halqa
    /* las azoteas de verano: los que duermen arriba, con el fresco (en las camas de las azoteas y en las alas del frente) */
    const techos = casas.userData.techos;
    const durmientes = [0, 1, 2, 3, 4].map(k => { const p = persona({ ...PZ.aprendiz(k + 3), edad: k % 2 ? 'nino' : undefined }, { pose: 'quieto' }); p.techo = techos[k % techos.length]; return p; });

    /* ---------- por dónde se camina: la muralla solo se cruza por sus puertas; el agua, por el puente ---------- */
    const enRect = (x, z, r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
    let claveObst = '', vela = [], corros = [];
    function rehacerPaso() {
      const RECTS = V.RESERVAS.filter(r => r.x0 !== undefined);
      const circulos = [...V.RESERVAS.filter(r => r.r && (r.r < 0.8 || r.palmar) && !r.ciudad).map(r => ({ x: r.x, z: r.z, r: r.r * 0.8 })), ...lamparas.map(Q => ({ x: Q.x, z: Q.y, r: 0.12 }))];
      const hondo = (x, z) => { const h = V.altura(x, z); return (h < -0.02 && !V.enPuenteCanal(x, z)) || h > 0.05; };   // el agua (salvo el puente del canal), el dique y el tell
      const bloquea = (x, z) => hondo(x, z) || V.enCiudad(x, z) || V.enCampo(x, z, 0.04) || RECTS.some(r => enRect(x, z, r)) || x < 2.25 || z < 2.25 || x > 17.8 || z > 17.8;
      mo.rehacerCaminos({ circulos, bloquea });
      const islas = sueltos();                                                 // lo libre que no se alcanza desde el camino de Kufa, se cierra
      if (islas && islas.size) mo.rehacerCaminos({ circulos, bloquea: (x, z) => bloquea(x, z) || islas.has(celdaDe(x, z)) });
      aprendices.rehacer();
      vela = VELA.map(([x, z]) => ({ x, z, mira: MAESTRO_HALQA }));
      const usados = [];
      corros = [...MAESTROS.map((m, i) => buscarAsientos(i === 0 && halqaAbierta() ? MAESTRO_HALQA : m, 9, usados, i === 0 && halqaAbierta())), ...MUIDIN.map(m => buscarAsientos(m, 4, usados))];
    }
    /* LAS ISLAS: los pedazos de suelo libre que no se alcanzan caminando (la orilla del canal entre dos acequias, un rincón
       entre casas y campos). Si un paseante elige ir a uno, el A* no halla camino y lo manda derecho, a través del agua o
       de un muro; por eso se cierran. La grilla es la de src/caminos.js (paso 0,25 desde 2,1); se recorre desde el camino
       de Kufa, que siempre está libre. */
    const PASO_G = 0.25, X0_G = 2.1, N_G = Math.ceil((17.9 - X0_G) / PASO_G);
    const celdaDe = (x, z) => Math.floor((x - X0_G) / PASO_G) * N_G + Math.floor((z - X0_G) / PASO_G);
    function sueltos() {
      const libre = (i, j) => i >= 0 && j >= 0 && i < N_G && j < N_G && mo.caminos.libre(X0_G + (i + 0.5) * PASO_G, X0_G + (j + 0.5) * PASO_G);
      const semilla = [[C.x, 12.5], [C.x, 14.0], [C.x, 15.4]].map(([x, z]) => [Math.floor((x - X0_G) / PASO_G), Math.floor((z - X0_G) / PASO_G)]).find(([i, j]) => libre(i, j));
      if (!semilla) return null;
      const visto = new Uint8Array(N_G * N_G), pila = [semilla[0] * N_G + semilla[1]]; visto[pila[0]] = 1;
      while (pila.length) {
        const c = pila.pop(), i = Math.floor(c / N_G), j = c % N_G;
        for (const [a, b] of [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]]) if (libre(a, b) && !visto[a * N_G + b]) { visto[a * N_G + b] = 1; pila.push(a * N_G + b); }
      }
      const s = new Set(); for (let i = 0; i < N_G; i++) for (let j = 0; j < N_G; j++) if (!visto[i * N_G + j] && libre(i, j)) s.add(i * N_G + j);
      return s;
    }
    function buscarAsientos(m, cupo, usados, enHalqa = false) {
      const cand = [];
      if (enHalqa) for (let k = 0; k < 11; k++) { const a = Math.PI * 0.08 + k * Math.PI * 0.84 / 10; cand.push({ x: L.HALQA.x + Math.cos(a) * 0.5, z: L.HALQA.y + 0.15 + Math.sin(a) * 0.5, d: k * 0.01, libre: true }); }
      for (const r of [0.7, 1.05]) for (let k = 0; k < 18; k++) { const a = Math.PI / 4 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (0.42 / r); cand.push({ x: m.x + Math.cos(a) * r, z: m.y + Math.sin(a) * r, d: 1 + Math.ceil(k / 2) * 0.42 / r + r * 0.6 }); }
      cand.sort((u, v) => u.d - v.d);
      const lista = [];
      for (const c of cand) {
        if (lista.length >= cupo) break;
        if (!c.libre && (!mo.caminos.libre(c.x, c.z) || V.altura(c.x, c.z) < -0.02 || V.reservado(c.x, c.z, 0.05) || V.enCiudad(c.x, c.z, 0.1) || V.enCamino(c.x, c.z, 0.04))) continue;   // nadie se sienta en el camino: por ahí pasan la caravana y Hunayn
        if (usados.some(u => Math.hypot(u.x - c.x, u.z - c.z) < 0.3) || Math.hypot(c.x - m.x, c.z - m.y) < 0.35) continue;
        const q = { x: c.x, z: c.z, mira: { x: m.x, y: m.y } }; lista.push(q); usados.push(q);
      }
      return lista;
    }

    /* ---------- EL SECRETO DE LA ÉPOCA: en primavera, de noche, en la azotea de una casa del arrabal, los Hermanos de la
       Pureza se sientan en círculo a leer sus epístolas a la luz de una lámpara ---------- */
    const secretoIkhwan = (() => {
      const { x, z } = V.IKHWAN, h = V.IKHWAN.o.h + 0.05;                     // la azotea de barro (su pretil redondeado es macizo)
      const ci = SE.circuloIkhwan(K); ci.scale.setScalar(0.85); ci.position.set(x, h, z); dyn.add(ci);
      const ch = SE.chispitas(6, 0.25, 0.45); ch.position.set(x, h + 0.06, z); dyn.add(ch);
      const luzL = new THREE.PointLight('#ffc070', 0, 2.4, 1.6); luzL.position.set(x + 0.05, h + 0.25, z + 0.05); raiz.add(luzL);
      const hermanos = [0, 1, 2, 3].map(k => {
        const p = persona({ piel: [1, 2, 1, 3][k], pelo: 'corto', colorPelo: '#2a1f18', barba: k % 2 === 0, ropa: 'tunica', colorRopa: ['#2e3448', '#3a2e3e', '#2a3a3a', '#3e3428'][k], chal: '#1e2230', turbante: ['#3a3e52', '#4a3a48', '#2e4040', '#4a4032'][k], cola: false }, { pose: k === 0 ? 'leer' : 'suelo' });
        const a = -Math.PI * 0.75 + (k - 1.5) * 0.62; ubicar(p, x + Math.cos(a) * 0.36, z + Math.sin(a) * 0.3, { x, y: z }, h); p.obj.scale.setScalar(0.72);   // atrás y a los lados: la lámpara, el libro y la tablilla quedan a la vista
        return p;
      });
      return (t, dt, luz, on) => {
        const ve = on && luz < 0.4 && estacion().i === 0;
        ci.visible = ve; ch.visible = ve && !secretoHallado('ikhwan');
        hermanos.forEach(p => { if (ver(p, ve)) animar(p, t, dt); });
        luzL.intensity = ve ? 1.2 + 0.25 * Math.sin(t * 9) * Math.sin(t * 2.7) : 0;
        if (!ve) return;
        ch.userData.titilar(t); ci.userData.llama.scale.set(1, 1 + 0.3 * Math.sin(t * 13), 1);
        ci.userData.tablilla.material.opacity = 0.75 + 0.25 * Math.sin(t * 1.7);
        tocable(x, z, { k: 'secreto', id: 'ikhwan', x, y: z }, { rx: 24, ry: 15, dy: (h + 0.1) * Z2D });
      };
    })();

    /* ---------- cada cuadro ---------- */
    function sincronizar(t, dt) {
      const e6 = S.era === 6, luz = luzDia(), noche = nocheCasa(), est = estacion().i;
      vestir();
      const lk = Math.max(0, Math.min(1, (0.55 - luz) / 0.25));
      luciernagas.userData.k = lk * lk * (3 - 2 * lk) * 0.3; luciernagas.visible = luciernagas.userData.k > 0.01;

      // --- las ranuras de los saberes ---
      const f46 = fase(46), etapa46 = f46 === 'sin' ? null : f46 === 'meseta' ? niv(46) : 'obra';
      const f50 = fase(50), etapa50 = f50 === 'sin' ? null : f50 === 'meseta' ? niv(50) : 'obra';
      ranura('papel', tiene(45) ? llave(45) : null, () => oficio(45, () => PZ.papel(K, niv(45))));
      ranura('libreros', fase(45) === 'meseta' && niv(45) >= 3 ? 1 : null, () => oficio(45, () => PZ.libreros(K)));
      ranura('casa', etapa46, () => oficio(46, () => PZ.casa(K, etapa46)));
      ranura('mesa', tiene(47) ? llave(47) : null, () => oficio(47, () => PZ.mesa(K, niv(47))));
      ranura('halqa', tiene(48) ? llave(48) : null, () => oficio(48, () => PZ.halqa(K, niv(48))));
      ranura('algebra', tiene(49) ? llave(49) : null, () => oficio(49, () => PZ.algebra(K, niv(49))));
      ranura('madrasa', etapa50, () => oficio(50, () => PZ.madrasa(K, etapa50)));
      const clave = mo.claveRanuras() + '|' + S.docentes + '|' + (halqaAbierta() ? 1 : 0);
      if (clave !== claveObst) { claveObst = clave; rehacerPaso(); }
      mo.animarRanuras(t, dt);

      // --- los tocables: las piezas y el mundo ---
      for (const r of Object.values(ranuras)) if (r.P && r.P.toc) for (const q of r.P.toc) tocP(q.x, q.y, { k: q.k }, q.p);
      tocable(L.PALACIO.x, L.PALACIO.y, { k: 'palacio' }, { rx: 46, ry: 80, dy: 88 });
      tocable(L.MEZQUITA.x, L.MEZQUITA.y, { k: 'mezquita' }, { rx: 26, ry: 16, dy: 10 });
      if (!tiene(46)) tocable(L.CASA.x, L.CASA.y, { k: 'casasab' }, { rx: 70, ry: 34, dy: 18 });
      if (!tiene(47)) tocable(L.MESA.x, L.MESA.y, { k: 'mesatrad' }, { rx: 40, ry: 18, dy: 0 });
      tocable(PILA.x + 0.1, PILA.y, { k: 'puertakufa' }, { rx: 24, ry: 14, dy: 8 });
      tocable(L.PUERTAS.kufa.x, L.PUERTAS.kufa.y, { k: 'muralla' }, { rx: 32, ry: 30, dy: 44 });
      tocable(L.CADI.x, L.CADI.y, { k: 'cadi' }, { rx: 26, ry: 16, dy: 14 });
      tocable(L.ZOCO.x, L.ZOCO.y, { k: 'zoco' }, { rx: 40, ry: 16, dy: 12 });
      tocable(L.MOLINO.x + 0.75, L.MOLINO.y, { k: 'molino' }, { rx: 40, ry: 34, dy: 38 });
      tocable(17.3, 12.8, { k: 'tigris' }, { rx: 30, ry: 40, dy: 0 });
      tocable(17.3, C.y, { k: 'puente' }, { rx: 26, ry: 10, dy: 2 });

      // --- el molino: la noria gira con el agua del canal ---
      rueda.rotation.z -= dt * 0.9;
      // --- las quffas: bajan por el Tigris, despacio ---
      quffas.forEach(q => {
        const u = (t * 0.012 + q.f) % 1, alfa = Math.min(1, u / 0.06, (1 - u) / 0.06);
        q.b.position.set(q.x + 0.06 * Math.sin(t * 0.5 + q.f * 7), agua.rio.position.y + 0.005, C.y + 0.75 + u * (V.E1 - 0.4 - C.y - 0.75));   // se sueltan aguas abajo del puente de barcas (no lo atraviesan)
        q.b.rotation.y = t * 0.15 + q.f * 3; q.b.visible = alfa > 0.02; opacidad(q.b, alfa);
        if (q.b.visible) tocable(q.b.position.x, q.b.position.z, { k: 'quffa' }, { rx: 18, ry: 12, dy: 8 });
      });
      { const u = (t * 0.008 + 0.3) % 1, alfa = Math.min(1, u / 0.05, (1 - u) / 0.05);
        barcaVela.position.set(16.62 + 0.04 * Math.sin(t * 0.4), agua.rio.position.y - 0.005, V.E1 - 0.6 - u * (V.LADO - 1.2)); barcaVela.rotation.z = 0.03 * Math.sin(t * 0.9);
        barcaVela.visible = alfa > 0.02 && Math.abs(barcaVela.position.z - C.y) > 0.7; opacidad(barcaVela, alfa); }   // pasa bajo el puente de barcas: ahí no se dibuja

      // --- la caravana (el motor manda: S.caravana) ---
      moverCaravana(t, dt);
      // --- los manuscritos que esperan, y su brillo cuando se pueden traducir ---
      const man = e6 ? (S.manuscritos || []) : [];
      pila.forEach((g, i) => { const m = man[i]; g.visible = !!m; if (m) g.userData.cinta.visible = !!m.rev; });
      brilloPila.visible = e6 && puedeTraducir(); brilloPila.material.opacity = 0.18 + 0.12 * Math.sin(t * 2.5);

      // --- los maestros y los repetidores ---
      const vis = Math.min(S.alumnos, 18), sueltos = Math.min(vis, Math.max(0, Math.round((S.alumnos - alumnosBien()) * vis / Math.max(1, S.alumnos))));
      const cupos = [Math.min(9, BALANCE.ratioDocente + palestraSitio()), ...[1, 2, 3, 4].map(k => k < S.docentes ? Math.min(9, cupoGuia(k) + palestraSitio()) : 0), ...[0, 1, 2, 3].map(k => k < (S.muidin || 0) ? 3 : 0)];
      const plan = [], planM = [];
      corros.forEach((sitios, m) => { for (let j = 0; j < Math.min(cupos[m] || 0, sitios.length) && plan.length < vis - sueltos; j++) { plan.push(sitios[j]); planM.push(m); } });
      const deNoche = noche > 0.5;
      guias.forEach((p, i) => {
        if (!ver(p, i === 0 ? S.docentes >= 1 : i < S.docentes)) return;
        const enH = i === 0 && halqaAbierta(), m = enH ? MAESTRO_HALQA : MAESTROS[i];
        ubicar(p, m.x, m.y, enH ? { x: L.HALQA.x, y: L.HALQA.y + 1 } : { x: m.x + 1, y: m.y + 1 });
        p.e.pose = enH ? 'narrarSentada' : deNoche && i > 0 ? 'quieto' : 'narrar'; animar(p, t, dt); tocP(m.x, m.y, { k: 'docente', i }, p);
      });
      muidin.forEach((p, i) => {
        if (!ver(p, e6 && i < (S.muidin || 0) && !deNoche)) return;
        const m = MUIDIN[i]; ubicar(p, m.x, m.y, { x: m.x + 0.8, y: m.y + 0.8 }); animar(p, t, dt);
      });

      // --- los traductores: uno por obra en la mesa, en su asiento ---
      const asientos = [0, 1, ...(fase(47) === 'meseta' && niv(47) >= 3 ? [2] : []), ...[3, 4].slice(0, Math.min(2, S.taller || 0))];
      const mesa = e6 ? (S.mesa || []) : [];
      deskTaller.forEach((g, k) => { g.visible = e6 && (S.taller || 0) > k; });
      traductores.forEach((p, i) => {
        const a = mesa[i], s = a && PZ.ASIENTOS_MESA[asientos[i] ?? i];
        if (!ver(p, !!s)) return;
        ubicar(p, s.x, s.y, { x: s.x + 0.25, y: s.y + 1 });
        p.e.pose = a.t > 0 ? 'escribir' : 'leer'; animar(p, t, dt); tocP(s.x, s.y, { k: 'mesatrad' }, p);
      });

      // --- Hunayn: llega por la puerta de Kufa, espera ante la Casa y, recibido, enseña el oficio junto a la mesa ---
      const estH = e6 ? estadoPensador('hunayn') : 0;
      if (estH !== hunAntes && hunAntes !== -1 && estH > 0 && nacimientosVivos) {
        const desde = hunAntes === 1 ? L.PUERTA_CASA : HUNAYN_LLEGA, hasta = estH === 1 ? L.PUERTA_CASA : L.LUGAR_HUNAYN;
        hunCamino = { cola: mo.caminos.ruta({ x: desde.x, z: desde.y }, { x: hasta.x, z: hasta.y }), pos: { x: desde.x, z: desde.y } };
      }
      hunAntes = estH;
      if (ver(hunayn, estH >= 1)) {
        const L0 = estH === 1 ? L.PUERTA_CASA : L.LUGAR_HUNAYN;
        let px = L0.x, py = L0.y, anda = false, mira = { x: L.MESA.x, y: L.MESA.y + 0.3 };
        if (hunCamino) {
          const c = hunCamino, dd = c.cola[0];
          if (!dd) hunCamino = null;
          else { const dx = dd.x - c.pos.x, dz = dd.z - c.pos.z, D = Math.hypot(dx, dz); if (D < 0.05) c.cola.shift(); else { const s = Math.min(D, 0.6 * dt); c.pos.x += dx / D * s; c.pos.z += dz / D * s; } px = c.pos.x; py = c.pos.z; anda = true; mira = { x: px + dx, y: py + dz }; }
        }
        ubicar(hunayn, px, py, mira); hunayn.e.pose = anda ? 'andar' : estH === 2 && !deNoche ? 'narrar' : 'quieto'; animar(hunayn, t, dt);
        tocP(px, py, { k: 'pensador', id: 'hunayn' }, hunayn);
      }

      // --- al-Jahiz lee en el zoco; el cadí en su banco, y los herederos cuando hay un reparto ---
      if (ver(jahiz, e6)) { ubicar(jahiz, JAHIZ.x, JAHIZ.y, { x: JAHIZ.x + 0.6, y: JAHIZ.y + 1 }); jahiz.e.pose = 'leer'; animar(jahiz, t, dt); tocP(JAHIZ.x, JAHIZ.y, { k: 'jahiz' }, jahiz); }
      if (ver(cadi, e6 && !deNoche)) { ubicar(cadi, L.CADI.x - 0.05, L.CADI.y - 0.05, { x: L.CADI.x + 0.3, y: L.CADI.y + 1 }, 0.15); animar(cadi, t, dt); }
      const her = e6 && herenciaDisponible() && !deNoche;
      familia.forEach((p, k) => { if (ver(p, her)) { ubicar(p, FAMILIA[k][0], FAMILIA[k][1], { x: L.CADI.x, y: L.CADI.y }); animar(p, t, dt); } });
      // --- el estudiante que terminó su libro y espera la ijaza ---
      const ij = e6 && ijazaDisponible();
      anilloIjaza.visible = ij; if (ij) anilloIjaza.userData.latir(t);
      if (ver(alumnoIjaza, ij)) { ubicar(alumnoIjaza, IJAZA.x, IJAZA.y, MAESTRO_HALQA); animar(alumnoIjaza, t, dt); }

      // --- los estudiantes: de día, los corros; de noche, seis en la halqa y el resto a su casa (en verano, a la azotea) ---
      const asiento = deNoche ? i => vela[i] || null : i => plan[i] || null;
      const maestro = m => m >= 5 ? 'un repetidor' : LEX().nombres[m % LEX().nombres.length];
      aprendices.paso(t, dt, deNoche ? Math.min(vis, vela.length) : vis, { asiento, mira: MAESTROS[1] }, a => ({ k: 'alumno', i: a.i, con: deNoche ? undefined : planM[a.i] !== undefined ? maestro(planM[a.i]) : null }));
      const verano = est === 1 && luz < 0.35 && e6;
      durmientes.forEach(p => { if (!ver(p, verano && !!p.techo)) return; const [cx, cz, h, ry] = p.techo; ubicar(p, cx, cz, { x: cx + Math.cos(ry), y: cz - Math.sin(ry) }, h); p.obj.rotation.x = -Math.PI / 2; animar(p, t, dt); });

      // --- la noche: las lámparas, el palacio, las casas ---
      const oscuro = luz < 0.5, n1 = 1 - luz;
      lamparas.forEach(Q => { const ll = Q.l.userData.llama; ll.visible = oscuro; ll.scale.set(1, 1 + 0.25 * Math.sin(t * 12 + Q.x), 1); });
      luzCasa.intensity = n1 * 3.0 * (0.92 + 0.08 * Math.sin(t * 9));
      luzHalqa.intensity = n1 * 1.8 * (0.9 + 0.1 * Math.sin(t * 11));
      luzZoco.intensity = n1 * 1.4 * (0.9 + 0.1 * Math.sin(t * 13));
      luzCasas.intensity = n1 * 2.4 * (0.9 + 0.1 * Math.sin(t * 7));
      luzPalacio.intensity = n1 * 2.0;

      secretoIkhwan(t, dt, luz, e6);
      mo.luces(t);
      vivos.forEach(f => f(t, dt));
      return { luz, brasa: 0 };
    }

    /* la caravana: sube por el camino de Kufa desde el borde del frente, se detiene afuera de la puerta (el camellero entra
       con una caja hasta la pila) y vuelve por donde vino */
    const ENTRA = 4.5, SALE = 4;
    function moverCaravana(t, dt) {
      const cv = S.era === 6 && S.caravana;
      if (!cv) { camellos.forEach(c => { c.visible = false; }); ver(camellero, false); return; }
      const u = S.tiempoJuego - cv.t0, lejos = V.E1 + 0.4, alto = ALTO_CARAVANA.y, PAR = CARAVANA_PARADA;
      let z0, alfa = 1, anda = true, vuelve = false;
      if (u < ENTRA) { z0 = lejos + (alto - lejos) * smooth(Math.min(1, u / ENTRA)); alfa = Math.min(1, u / 1.0); }
      else if (u < PAR - SALE) { z0 = alto; anda = false; }
      else { const k = smooth(Math.min(1, (u - (PAR - SALE)) / SALE)); z0 = alto + (lejos - alto) * k; alfa = Math.min(1, (PAR - u) / 1.0); vuelve = true; }
      camellos.forEach((c, i) => {
        const z = z0 + i * 0.72 * (vuelve ? -1 : 1) + (vuelve ? 1.44 : 0);
        c.visible = alfa > 0.02; c.position.set(C.x + 0.05 * Math.sin(i * 2), 0, z); c.rotation.y = vuelve ? -Math.PI / 2 : Math.PI / 2;
        for (let k = 0; k < 4; k++) { const pa = c.userData['pata' + k]; if (pa) pa.rotation.z = anda ? 0.35 * Math.sin(t * 7 + k * Math.PI / 2 + i) : 0; }
        c.position.y = anda ? 0.008 * Math.abs(Math.sin(t * 7 + i)) : 0;
        opacidad(c, alfa);
      });
      /* el camellero: al lado del primero; en la parada, lleva la caja a la pila y vuelve */
      let cx = C.x + 0.38, cz = z0, cm = { x: cx, y: cz - 1 }, ca = anda;
      if (!anda) {
        const w = (u - ENTRA) / (PAR - SALE - ENTRA), ida = w < 0.5, k = smooth(ida ? w * 2 : (1 - w) * 2);
        const A0 = { x: C.x + 0.38, y: alto }, B0 = { x: PILA.x + 0.05, y: PILA.y + 0.4 };
        cx = A0.x + (B0.x - A0.x) * k; cz = A0.y + (B0.y - A0.y) * k; cm = ida ? B0 : A0; ca = k > 0.02 && k < 0.98;
        if (fardoMano) fardoMano.visible = ida;
      } else if (fardoMano) fardoMano.visible = !vuelve;
      if (ver(camellero, alfa > 0.02)) { ubicar(camellero, cx, cz, vuelve && anda ? { x: cx, y: cz + 1 } : cm); camellero.e.pose = ca ? 'andar' : 'quieto'; animar(camellero, t, dt); opacidad(camellero.obj, alfa); }
      if (alfa > 0.3) tocable(C.x, z0 + 0.5, { k: 'caravana' }, { rx: 30, ry: 26, dy: 20 });
    }

    /* ---------- el estado de cada saber y los globos: el pase 2D ---------- */
    const ALTO = { 45: 36, 46: 86, 47: 30, 48: 56, 49: 36, 50: 72 };
    const DONDE = { 45: PZ.ANCLAS.papel, 46: PZ.ANCLAS.casa, 47: PZ.ANCLAS.mesa, 48: PZ.ANCLAS.halqa, 49: PZ.ANCLAS.algebra, 50: PZ.ANCLAS.madrasa };
    function superponer(t) {
      for (const i of [45, 46, 47, 48, 49, 50]) { if (!tiene(i)) continue; const a = DONDE[i], p = P(a.x, a.y, ALTO[i]); estadoTec(i, { x: p.x, y: p.y }, t); }
      if (S.era !== 6) return;
      if (estadoPensador('hunayn') === 1 && VISITAS.hunayn && !hunCamino) drawGlobo(L.PUERTA_CASA.x, L.PUERTA_CASA.y, t);
    }

    /* ---------- los rótulos de acción: lo que se toca en Bagdad ---------- */
    function rotulos(ancla, t, tocarEn) {
      const e6 = S.era === 6;
      ancla('traducir', e6 && puedeTraducir(), PILA.x + 0.1, PILA.y, 30, `traducir · ${manuscritosPend()}`, 'accion', () => { if (!abrirTraducir()) traducir('sentido'); });
      ancla('ijaza', e6 && ijazaDisponible(), IJAZA.x, IJAZA.y, 52, 'dar la ijaza', 'accion', () => darIjaza());
      ancla('herencia', e6 && herenciaDisponible(), L.CADI.x, L.CADI.y, 44, 'repartir la herencia', 'accion', () => resolverHerencia());
      const estH = e6 ? estadoPensador('hunayn') : 0;
      ancla('recibir', estH === 1 && S.apr >= (VISITAS.hunayn?.costo || 0), L.PUERTA_CASA.x, L.PUERTA_CASA.y, 52, 'recibir a Hunayn', 'accion', () => tocarEn(L.PUERTA_CASA.x, L.PUERTA_CASA.y));
    }

    /* las caras de quienes firman la consejera en esta época */
    const caras = {
      'jahiz': { ...PZ.ALJAHIZ },
      'hunayn': { ...PZ.HUNAYN },
    };
    return { quieto, nubes, sincronizar, superponer, rotulos, caras, aprendices, get corros() { return corros; } };
  },
};
