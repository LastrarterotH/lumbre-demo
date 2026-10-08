/* ============================================================
   epocas/epoca15
   La Época 15 (China Song: Kaifeng hacia 1050-1120; en el viaje va entre Bagdad y París) sobre el motor 3D. Como las
   otras: aquí vive lo de ESTA época (quién está dónde, su año, su noche y sus rótulos); el cómo lo pone motor3d.js. El
   mundo vive en src/kaifeng/. Las anclas de la lógica (los seis saberes, el horno de hollín, la espera y el lugar de Zhu
   Xi, el templo taoísta) son las del motor (09j-kaifeng), espejadas en kaifeng/lugares.js.
   LA COMPOSICIÓN (la hoja juego3d/bocetos/kaifeng.html, ACAA, 2026-10-06): la Pagoda de Hierro en su templo llena la
   esquina del fondo; la muralla de tierra apisonada con su puerta corre por el borde de atrás; el Bian cruza en diagonal
   con sus barcas y el Puente Arcoíris lo salta en el centro; en la orilla de atrás, las tiendas del rollo y la casa de té;
   del puente para adelante, la explanada de las escuelas.
   EL EXAMEN SE VE: cada candidato de S.candidatosCh es una persona. Los de la ciudad llegan por el puente y los de aldea
   por el borde del frente; esperan en la fila de la prefectura hasta que eliges cómo se preparan; los de memoria recitan
   en la prefectura, los de los asuntos y los que estudian para entender se sientan en las dos salas de Hu Yuan (con la
   academia, los que entienden van allá); los listos esperan ante el recinto del examen. El día del examen se sientan en
   las celdas a escribir; después, el que aprueba va a leer su nombre en la lista y cruza el puente hacia la puerta, a
   gobernar, y el que reprueba vuelve a su aldea por el borde del frente, a enseñar. De noche unos pocos siguen leyendo a
   la luz de la prefectura y la ciudad enciende sus faroles (en Kaifeng ya no había toque de queda: el mercado de la
   noche). Zhu Xi entra por la puerta de la ciudad y, recibido, cruza el puente y enseña junto a la academia. Li Qingzhao
   mira a los candidatos (no puede presentarse) y, con el examen de palacio, lee la lista. El secreto: el elixir interior,
   en el templo taoísta, las noches de otoño.
   ============================================================ */
import * as THREE from 'three';
import { fundir } from '../kit.js';
import * as M from '../mundo.js';
import * as V from '../kaifeng/valle.js';
import * as KM from '../kaifeng/monumentos.js';
import * as PZ from '../kaifeng/piezas.js';
import * as L from '../kaifeng/lugares.js';
import { conActores } from '../piezas.js';
import { fase, tiene, niv, llave } from '../motor3d.js';
import { huellasDe } from '../caminos.js';
import * as SE from '../secretos.js';
import { textura, matTex, lamina } from '../agora/monumentos.js';

/* ---------- dónde está cada cosa ---------- */
const SI = PZ.SITIOS;
/* los maestros, en el orden de sus nombres (LEX().nombres de China: Hu Yuan, Sun Fu, Shi Jie, Fan Zhongyan, Cheng Yi, el
   maestro de la escuela de aldea): Hu Yuan en la sala de los clásicos, Sun Fu en la prefectura, Shi Jie en la de los
   asuntos, Fan Zhongyan (el de las escuelas de 1044, ya funcionario) junto a la prefectura, Cheng Yi en la academia y el
   maestro de aldea al borde del frente, por donde se vuelve a las aldeas */
const MAESTROS = [SI.clasicos, SI.prefectura, SI.asuntos, { x: L.PREFECTURA.x + 0.62, y: L.PREFECTURA.y - 0.55 }, SI.academia, { x: 8.9, y: 17.25 }];
const SALA_DE = [83, 81, 83, -1, 85, -1];                          // el saber que abre la sala de cada maestro (−1: ninguno)
const LI_EN = [{ x: 14.25, y: 10.05 }, { x: SI.lista.x + 0.4, y: SI.lista.y + 0.12 }];   // Li Qingzhao: mira a los candidatos; con la lista, la lee
const ENTRADA_ZHUXI = { x: 12.5, y: 1.7 };                          // del otro lado de la puerta de la ciudad
const PUERTA_ADENTRO = { x: 12.45, y: 3.75 };                        // el que aprueba sale por la puerta, a gobernar
const LLEGA_CIUDAD = { x: 11.6, y: 5.6 };                            // los candidatos de la ciudad bajan del camino de la puerta y cruzan el puente
const ALDEAS = [[9.6, 17.75], [11.4, 17.75], [13.2, 17.75], [8.4, 17.75]];   // por el borde del frente se va (y se viene) de las aldeas
const FAROLES = [[10.95, 5.25], [15.15, 5.15], [16.2, 5.45], [9.05, 8.55], [11.45, 11.95], [15.35, 7.05], [12.95, 3.75]];
const NVIS = { memoria: 10, asuntos: 7, entender: 9, fila: 10, listos: 10, noche: 6 };

function reservar() {
  const R = V.RESERVAS; R.length = 0;
  for (const [k, A] of Object.entries(PZ.ANCLAS)) R.push({ x: A.x, z: A.y, r: 0.85, pieza: k });   // lo que pisen lo marcan sus huellas
  MAESTROS.forEach(m => R.push({ x: m.x, z: m.y, r: 0.3, maestro: true }));
  [...LI_EN, L.LUGAR_ZHUXI, L.ESPERA_ZHUXI, SI.fila, SI.examen, SI.lista].forEach(m => R.push({ x: m.x, z: m.y, r: 0.28, sitio: true }));
  FAROLES.forEach(([x, z]) => R.push({ x, z, r: 0.12, bloquea: true }));
  R.push({ x: 8.17, z: 9.12, r: 0.45, bloquea: true });   // la sombrilla del puesto del camino
}
const smooth = k => k * k * (3 - 2 * k);
const fasesDia = () => ((tJuegoVis % 150) + 150) % 150 / 150;   // 0 el mediodía, 0,5 la medianoche (luzDia)
/* el punto del eje del Bian más cercano y la normal hacia (x, z) */
function orillaDe(x, z) {
  const u = L.uDe(x, z), q = L.enEje(u); let nx = -q.tz, nz = q.tx;
  if ((x - q.x) * nx + (z - q.z) * nz < 0) { nx = -nx; nz = -nz; }
  return { q, nx, nz, u };
}
/* el taiji pintado del secreto: el yin y el yang, con sus dos puntos */
const pTaiji = (g, w, h) => {
  const r = w / 2 - 6, c = w / 2;
  g.fillStyle = '#f4efe2'; g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1f1d22'; g.beginPath(); g.arc(c, c, r, -Math.PI / 2, Math.PI / 2); g.fill();
  g.beginPath(); g.arc(c, c - r / 2, r / 2, 0, Math.PI * 2); g.fillStyle = '#1f1d22'; g.fill();
  g.beginPath(); g.arc(c, c + r / 2, r / 2, 0, Math.PI * 2); g.fillStyle = '#f4efe2'; g.fill();
  g.fillStyle = '#f4efe2'; g.beginPath(); g.arc(c, c - r / 2, r / 7, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#1f1d22'; g.beginPath(); g.arc(c, c + r / 2, r / 7, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#8a6a3a'; g.lineWidth = 5; g.beginPath(); g.arc(c, c, r, 0, Math.PI * 2); g.stroke();
};

export default {
  era: 15,
  nombre: 'Kaifeng',
  piezas: PZ.PIEZAS,
  construir(mo) {
    const { K, raiz, dyn, vivos, ranura, ranuras, persona, ubicar, ver, animar, opacidad, tocP } = mo;
    const oficio = (i, f) => conActores(fase(i) === 'meseta', f);
    reservar(); L.verificarEspejo();
    /* lo que cada saber va a ocupar cuando crezca (su última etapa): el valle no pone árboles ahí */
    for (const d of PZ.PIEZAS) { const P = d.crear(K, 3); P.obj.position.set(P.ancla.x, 0, P.ancla.y); for (const h of huellasDe(P.obj, 0.05)) V.RESERVAS.push({ ...h, futuro: true }); mo.liberar(P.obj); }

    /* ---------- el héroe: la Pagoda de Hierro en su templo (el Kaibao). Su huella (la pagoda, las salas, los muros, los
       pinos) se mide antes de fundirlo: por ahí no se camina ---------- */
    const pagoda = KM.heroe(K, KM.VARIANTES.heroe); pagoda.position.set(L.HEROE.x, 0, L.HEROE.y);
    for (const h of huellasDe(pagoda, 0.06)) V.RESERVAS.push({ ...h, heroe: true });
    fundir(K, pagoda, 0.01); raiz.add(pagoda);
    /* el Puente Arcoíris, perpendicular al río: se camina sobre su tablero (V.alturaPaso) */
    const puente = KM.puenteArcoiris(K, { gente: false }); V.alPuente(puente.userData.yDe);
    puente.position.set(L.PUENTE.x, 0, L.PUENTE.y); puente.rotation.y = Math.atan2(L.PUENTE.nx, L.PUENTE.ny);
    fundir(K, puente, 0.01); raiz.add(puente);
    /* la segunda pieza: la casa de té de dos pisos en la orilla de atrás, con la terraza sobre el agua y mirando al río */
    const te = KM.segunda(K, KM.VARIANTES.segunda);
    te.traverse(o => { if (o.userData.gente) o.visible = false; }); [...te.children].forEach(c => { if (c.userData.gente) te.remove(c); });
    { const o = orillaDe(L.CASA_TE.x, L.CASA_TE.y); te.position.set(L.CASA_TE.x, 0, L.CASA_TE.y); te.rotation.y = Math.atan2(-o.nx, -o.nz); }
    for (const h of huellasDe(te, 0.04)) if (h.z0 < 5.6 || L.distBian((h.x0 + h.x1) / 2, (h.z0 + h.z1) / 2) > 0) V.RESERVAS.push({ ...h, heroe: true });
    fundir(K, te, 0.01); raiz.add(te);

    /* ---------- la muralla y la puerta, las tiendas, el valle: lo quieto se funde; el suelo y el agua se repintan con el año ---------- */
    const quieto = new THREE.Group();
    [[2, 11.3], [13.7, 18]].forEach(([x0, x1]) => { const m = KM.muralla(K, x1 - x0, { esc: 12 }); m.position.set((x0 + x1) / 2, 0, L.MURALLA.y); m.rotation.y = Math.PI; quieto.add(m); });
    const pc = KM.puertaCiudad(K, { esc: 12 }); pc.position.set(L.PUERTA.x, 0, L.PUERTA.y); quieto.add(pc);
    const casas = V.casas(K);
    for (const c of casas.userData.puestas) V.RESERVAS.push({ x0: c.x - c.w / 2 - 0.06, x1: c.x + c.w / 2 + 0.06, z0: c.z - c.d / 2 - 0.06, z1: c.z + c.d / 2 + 0.06, casa: true });
    /* la barca amarrada en la orilla del frente, con el mástil abatido */
    { const o = orillaDe(6.4, 12.9), b = KM.barca(K, { L: 1.15, mastil: 'abatido', remeros: 0, cabina: true });
      b.position.set(o.q.x + o.nx * (o.q.ancho / 2 - 0.32), V.NIVEL - 0.02, o.q.z + o.nz * (o.q.ancho / 2 - 0.32)); b.rotation.y = Math.atan2(o.q.tz, -o.q.tx); quieto.add(b); }
    const suelo = V.suelo(K), agua = V.agua(K, vivos);
    const veg = V.vegetacion(K, vivos, (x, z, r) => !V.reservado(x, z, r));
    const ARB = veg.puestos;
    quieto.add(V.losa(K), casas, veg.g);
    fundir(K, quieto);
    raiz.add(suelo, agua.g, quieto);
    const nubes = M.nubes(K, vivos); raiz.add(nubes.g);
    const luciernagas = M.luciernagas(vivos); raiz.add(luciernagas);
    /* las luces de la noche: la prefectura (los que siguen leyendo), la casa de té, la calle de las tiendas, la puerta */
    const luzPref = new THREE.PointLight('#ffb35c', 0, 4.0, 1.6); luzPref.position.set(L.PREFECTURA.x - 0.2, 0.8, L.PREFECTURA.y - 0.1); raiz.add(luzPref);
    const luzTe = new THREE.PointLight('#ffae5a', 0, 5, 1.6); luzTe.position.set(L.CASA_TE.x, 1.0, L.CASA_TE.y + 0.4); raiz.add(luzTe);
    const luzCalle = new THREE.PointLight('#ffb35c', 0, 6, 1.6); luzCalle.position.set(12.6, 1.0, 5.4); raiz.add(luzCalle);
    const luzPuente = new THREE.PointLight('#ffae5a', 0, 4.5, 1.6); luzPuente.position.set(L.PUENTE.x, 1.0, L.PUENTE.y); raiz.add(luzPuente);
    const luzExamen = new THREE.PointLight('#ffb35c', 0, 4.0, 1.6); luzExamen.position.set(L.ANONIMO.x, 0.45, L.ANONIMO.y - 0.6); raiz.add(luzExamen);   // las velas de las celdas, de noche
    const faroles = FAROLES.map(([x, z], i) => { const f = PZ.farol(K, 0.55, i % 3 === 2 ? '#e8c45a' : '#d4553a'); f.position.set(x, 0, z); f.rotation.y = i * 1.3; dyn.add(f); return f; });

    /* ---------- la barca que baja por el Bian: abate el mástil para pasar bajo el Puente Arcoíris (la escena del rollo) ---------- */
    const LB = 1.3, hB = LB * 0.075, cub = hB * 0.62, BB = LB * 0.21;
    const barca = KM.barca(K, { L: LB, mastil: null, remeros: 0, carga: 'grano' }); barca.userData.vivo = true; dyn.add(barca);
    const mastil = new THREE.Group(); mastil.position.set(-LB * 0.12, cub, 0); barca.add(mastil);
    [-1, 1].forEach(l => mastil.add(KM.rollizo(K, [0, 0, l * BB * 0.32], [0, LB * 0.62, 0], LB * 0.008, KM.KF.maderaD, 0.0015)));
    mastil.add(KM.viga(K, [0, LB * 0.62, 0], [LB * 0.35, -cub + hB * 0.6, 0], 0.003, 0.003, '#5a4636', 0));
    const barquero = persona(PZ.vecino(2, { colorRopa: '#6b7a8a' }), { pose: 'pertiga' }); barquero.obj.scale.setScalar(0.7);
    { const pt = K.malla(K.cilindro(0.012, 0.014, 1.2, 5), KM.KF.maderaD, { grosor: 0.003 }); pt.position.y = -0.2; barquero.sostener?.(pt, 'D'); }
    barca.add(barquero.obj); barquero.obj.position.set(LB * 0.3, cub, 0); barquero.obj.rotation.y = -Math.PI / 2;
    const uPuente = L.uDe(L.PUENTE.x, L.PUENTE.y);
    let uBarca = 0.4, angMastil = 0.05;

    /* ---------- el año de Kaifeng (ESTACIONES_KAIFENG del motor): el Qingming, el verano del Bian crecido, la luna de
       otoño, la nieve y los faroles del año nuevo ---------- */
    let pasoVestido = -1;
    function vestir() {
      const e = mo.estacionHoy();
      if (e.paso === pasoVestido) return; pasoVestido = e.paso;
      const k = e.k || 0, sig = e.sig || e, j = sig.i ?? ((e.i + 1) % 4);
      suelo.userData.pintar({ i: e.i, j, k });
      veg.vestir(e.i, k, j);
      const cr = (e.crecida || 1) + ((sig.crecida || 1) - (e.crecida || 1)) * k;
      agua.rio.position.y = V.NIVEL + (cr - 1) * 0.1;
    }

    /* ---------- los que siempre están ---------- */
    const guias = MAESTROS.map((_, i) => persona({ ...PZ.MAESTROS[i] }, { pose: 'narrar' }));
    const li = persona({ ...PZ.LIQINGZHAO }, { pose: 'quieto' });
    { const pi = K.malla(K.cilindro(0.004, 0.004, 0.09, 4), '#5a4636', { sinTinta: true }); pi.position.y = -0.03; li.sostener?.(pi, 'D'); }   // el pincel
    const zhu = persona({ ...PZ.ZHUXI }, { pose: 'quieto' });
    { const lb = K.malla(K.caja(0.08, 0.015, 0.11), '#3f5a7a', { grosor: 0.0015 }); zhu.sostener?.(lb, 'I'); }   // el libro cosido bajo el brazo
    let zAntes = -1, zCamino = null, zT0 = -99;
    const aprendices = mo.paseantes(12, { opciones: i => PZ.vecino(i + 3), inicio: i => ({ x: 12.0 + (i % 4) * 0.4, z: 14.0 + Math.floor(i / 4) * 0.35 }), semilla: 1515 });
    const anilloPref = SE.ondas(2, 0.6, '#ffd76a'); anilloPref.position.set(SI.fila.x, 0.02, SI.fila.y); dyn.add(anilloPref);

    /* ---------- por dónde se camina: la orilla de atrás (de la puerta al puente), el puente y la explanada; el agua, la
       muralla, el templo de la pagoda, las casas y las piezas no ---------- */
    const enRect = (x, z, r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
    let claveObst = '', asientos = { memoria: [], asuntos: [], entender: [] }, corros = [], fila = [], listos = [], noche = [];
    function rehacerPaso() {
      const RECTS = V.RESERVAS.filter(r => r.x0 !== undefined && !r.futuro);
      const circulos = [...V.RESERVAS.filter(r => r.r && r.bloquea).map(r => ({ x: r.x, z: r.z, r: r.r })), ...ARB.map(a => ({ x: a.x, z: a.z, r: a.r }))];
      const base = (x, z) => (V.altura(x, z) < -0.03 && !L.enPuente(x, z)) || z < 3.4 || RECTS.some(r => enRect(x, z, r)) || x < 2.25 || z < 2.25 || x > 17.75 || z > 17.75;
      mo.rehacerCaminos({ circulos, bloquea: base });
      /* lo libre que no se alcanza desde la explanada (el patio del templo de la pagoda, rincones entre muros) se cierra, para
         que nadie quiera ir y cruce un muro (como en Roma) */
      const PASO = 0.25, X0 = 2.1, NC = Math.ceil((17.9 - X0) / PASO), C = mo.caminos, celda = (i, j) => C.libre(X0 + (i + 0.5) * PASO, X0 + (j + 0.5) * PASO), visto = new Uint8Array(NC * NC);
      let i0 = Math.floor((13.4 - X0) / PASO), j0 = Math.floor((14.4 - X0) / PASO);
      for (let r = 0; r < 8 && !celda(i0, j0); r++) j0++;
      const cola = [[i0, j0]]; visto[i0 * NC + j0] = 1;
      while (cola.length) { const [i, j] = cola.pop(); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= NC || b >= NC || visto[a * NC + b] || !celda(a, b)) continue; visto[a * NC + b] = 1; cola.push([a, b]); } }
      const islas = new Set(); for (let i = 0; i < NC; i++) for (let j = 0; j < NC; j++) if (!visto[i * NC + j] && celda(i, j)) islas.add(i * NC + j);
      if (islas.size) mo.rehacerCaminos({ circulos, bloquea: (x, z) => base(x, z) || islas.has(Math.floor((x - X0) / PASO) * NC + Math.floor((z - X0) / PASO)) });
      aprendices.rehacer();
      const usados = [];
      const entenderEn = S.era === 15 && estadoPensador('zhuxi') === 2 ? L.LUGAR_ZHUXI : tiene(85) && fase(85) === 'meseta' ? SI.academia : SI.clasicos;   // con Zhu Xi, los que estudian para entender se sientan con él
      asientos = { memoria: buscarAsientos(SI.prefectura, 12, usados), asuntos: buscarAsientos(SI.asuntos, 8, usados), entender: buscarAsientos(entenderEn, 10, usados) };
      noche = asientos.memoria.slice(0, NVIS.noche);
      fila = Array.from({ length: NVIS.fila }, (_, j) => ({ x: SI.fila.x + 0.3 - (j % 2) * 0.32, z: SI.fila.y + Math.floor(j / 2) * 0.3, mira: { x: L.PREFECTURA.x - 0.3, y: L.PREFECTURA.y - 0.5 } }));
      /* los listos esperan el examen en hileras cruzadas a la vista (a lo largo de x − z), la de atrás corrida medio puesto */
      listos = [];
      for (let j = 0; listos.length < NVIS.listos && j < 30; j++) {
        const fil = Math.floor(j / 5), col = (j % 5) - 2 + (fil % 2) * 0.5, x = SI.examen.x + col * 0.3 * 0.707 - fil * 0.34 * 0.707, z = SI.examen.y - col * 0.3 * 0.707 - fil * 0.34 * 0.707;
        if (!mo.caminos.libre(x, z) || usados.some(u => Math.hypot(u.x - x, u.z - z) < 0.25)) continue;
        const q = { x, z, mira: { x: L.ANONIMO.x, y: L.ANONIMO.y - 0.6 } }; listos.push(q); usados.push(q);
      }
      corros = [3, 4].map(i => buscarAsientos(MAESTROS[i], 5, usados));
      for (const f of FIG.values()) f.clave = null;                // que cada uno busque su sitio de nuevo
    }
    const ocupadoSitio = (x, z) => V.RESERVAS.some(r => !r.maestro && !r.sitio && !r.pieza && !r.futuro && (r.r ? Math.hypot(x - r.x, z - r.z) < r.r + 0.03 : x > r.x0 - 0.03 && x < r.x1 + 0.03 && z > r.z0 - 0.03 && z < r.z1 + 0.03));
    function buscarAsientos(m, cupo, usados, r0 = 0.5) {
      const cand = [];
      for (const r of [r0, r0 + 0.3, r0 + 0.6, r0 + 0.9]) for (let k = 0; k < 20; k++) { const a = Math.PI / 4 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (0.38 / r); cand.push({ x: m.x + Math.sin(a) * r, z: m.y + Math.cos(a) * r, d: Math.ceil(k / 2) * 0.38 + r * 2.2 }); }   // por arcos: una fila entera antes de la siguiente (en el rayo de la cámara, uno tapa al otro)
      cand.sort((u, v) => u.d - v.d);
      const lista = [];
      for (const c of cand) {
        if (lista.length >= cupo) break;
        if (![[0, 0], [0.15, 0], [-0.15, 0], [0, 0.15], [0, -0.15]].every(([a, b]) => mo.caminos.libre(c.x + a, c.z + b)) || V.altura(c.x, c.z) < -0.02 || ocupadoSitio(c.x, c.z)) continue;   // con holgura: nadie se sienta bajo un alero
        if (usados.some(u => Math.hypot(u.x - c.x, u.z - c.z) < 0.27)) continue;
        const q = { x: c.x, z: c.z, mira: { x: m.x, y: m.y } }; lista.push(q); usados.push(q);
      }
      return lista;
    }

    /* ---------- LOS CANDIDATOS: una persona por cada uno de S.candidatosCh ---------- */
    const FIG = new Map(), POSE = { memoria: 'leer', asuntos: 'escribir', entender: 'suelo' };
    let celdasUsadas = 0;
    const figura = (c, x, z, alfa) => {
      const p = persona(PZ.candidato(c.k), { pose: 'quieto' });
      p.obj.position.set(x, V.alturaPaso(x, z), z); opacidad(p.obj, alfa);
      const f = { k: c.k, c, p, x, z, cola: [], alfa, clave: null, llega: false, t0: 0, vel: 0.66 + (c.k % 5) * 0.04, sale: null };
      FIG.set(c.k, f); return f;
    };
    const quitar = f => { dyn.remove(f.p.obj); mo.liberar(f.p.obj); FIG.delete(f.k); };
    function vestirFuncionario(f) { const pos = f.p.obj.position.clone(), rot = f.p.obj.rotation.y; dyn.remove(f.p.obj); mo.liberar(f.p.obj); f.p = persona(PZ.funcionario(f.k), { pose: 'andar' }); f.p.obj.position.copy(pos); f.p.obj.rotation.y = rot; opacidad(f.p.obj, f.alfa); }
    function caminar(f, dt) {   // un paso por su cola; true si sigue andando (sobre el puente, a la altura del tablero)
      if (!f.cola.length) return false;
      const d = f.cola[0], dx = d.x - f.x, dz = d.z - f.z, D = Math.hypot(dx, dz);
      if (D < 0.04) { f.cola.shift(); return f.cola.length > 0; }
      const s = Math.min(D, f.vel * dt); f.x += dx / D * s; f.z += dz / D * s;
      let da = Math.atan2(dx, dz) - f.p.obj.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); f.p.obj.rotation.y += da * Math.min(1, dt * 8);
      f.p.obj.position.set(f.x, V.alturaPaso(f.x, f.z), f.z);
      return true;
    }
    const nombreDe = n => { const i = typeof CANDIDATOS_CH !== 'undefined' ? CANDIDATOS_CH.indexOf(n) : -1; return i >= 0 ? i : 0; };
    function candidatos(t, dt, e15, deNoche) {
      const lista = e15 ? (S.candidatosCh || []) : [], vivosK = new Set();
      const grupos = { fila: [], memoria: [], asuntos: [], entender: [], listos: [] };
      for (const c of lista) { vivosK.add(c.k); grupos[!c.m ? 'fila' : c.p >= 1 ? 'listos' : c.m].push(c); }
      Object.values(grupos).forEach(g => g.sort((u, v) => u.k - v.k));
      const lugar = new Map(), lugares = { fila, listos, ...asientos };
      for (const [g, l] of Object.entries(grupos)) l.forEach((c, j) => {
        let s = lugares[g][j] || null;
        if (s && !s.pose) s = { ...s, pose: g === 'fila' || g === 'listos' ? 'quieto' : POSE[g] };
        if (deNoche) s = null;                                       // de noche, a casa (unos pocos se quedan a leer: abajo)
        lugar.set(c.k, s);
      });
      if (deNoche) {   // de noche se quedan a leer en la prefectura, a la luz de la lámpara, los primeros que se preparan
        const leen = [...grupos.memoria, ...grupos.entender, ...grupos.asuntos].sort((u, v) => u.k - v.k).slice(0, NVIS.noche);
        leen.forEach((c, j) => lugar.set(c.k, noche[j] ? { ...noche[j], pose: 'leer' } : null));
      }
      for (const c of lista) {
        let f = FIG.get(c.k);
        const s = lugar.get(c.k);
        if (!f) {
          if (nacimientosVivos && !c.m && s) {   // llega: los de la ciudad por el puente; los de aldea por el borde del frente
            const o = c.o === 'a' ? { x: ALDEAS[c.k % ALDEAS.length][0], z: ALDEAS[c.k % ALDEAS.length][1] } : { x: LLEGA_CIUDAD.x, z: LLEGA_CIUDAD.y };
            f = figura(c, o.x, o.z, 0); f.llega = true; f.cola = mo.caminos.ruta(o, s); f.clave = s.x.toFixed(2) + ',' + s.z.toFixed(2);
          } else f = figura(c, s ? s.x : SI.fila.x, s ? s.z : SI.fila.y, nacimientosVivos ? 0 : 1);
        }
        f.c = c;
        const visible = !!s;
        if (!visible) {                                              // a su casa (o sin lugar a la vista): se desvanece y queda en su sitio
          f.alfa = Math.max(0, f.alfa - dt * 1.4);
          if (f.alfa <= 0) { ver(f.p, false); f.cola = []; f.clave = null; continue; }
        } else { ver(f.p, true); f.alfa = Math.min(1, f.alfa + dt * 1.2); }
        opacidad(f.p.obj, f.alfa);
        const clave = s ? s.x.toFixed(2) + ',' + s.z.toFixed(2) : null;
        if (visible && clave !== f.clave) { f.clave = clave; f.cola = f.alfa > 0.3 ? mo.caminos.ruta({ x: f.x, z: f.z }, s) : [{ x: s.x, z: s.z }]; if (f.alfa <= 0.3) { f.x = s.x; f.z = s.z; } }
        if (caminar(f, dt)) f.p.e.pose = 'andar';
        else if (s) {
          if (f.llega) f.llega = false;
          f.p.obj.position.set(f.x, V.alturaPaso(f.x, f.z), f.z);
          const m = s.mira; f.p.obj.rotation.y = Math.atan2(m.x - f.x, m.y - f.z);
          f.p.e.pose = s.pose;
        }
        animar(f.p, t, dt);
        if (f.alfa > 0.5) tocP(f.x, f.z, { k: 'alumno', i: nombreDe(c.n) }, f.p);
      }
      /* los que ya no están: se presentaron al examen. Se sientan en su celda a escribir; después, el que aprobó va a leer
         la lista y sale por la puerta, a gobernar, y el que reprobó vuelve a su aldea, a enseñar */
      const celdas = ranuras.anonimo && ranuras.anonimo.P && ranuras.anonimo.P.celdas || [];
      for (const f of [...FIG.values()]) {
        if (vivosK.has(f.k)) continue;
        if (!f.sale) {
          if (!e15 || !nacimientosVivos) { quitar(f); continue; }
          const enCasa = f.alfa < 0.3 || !f.p.obj.visible;   // de noche estaba en su casa: aparece en su celda (el examen duraba días y noches)
          const pasa = typeof nivelCh === 'function' && f.c.m ? nivelCh(f.c, f.c.m) === 2 : false;
          const cel = celdas.length ? celdas[celdasUsadas++ % celdas.length] : null;
          const sitio = cel ? { x: cel.x, z: cel.y } : { x: SI.examen.x + ((celdasUsadas++ % 4) - 1.5) * 0.3, z: SI.examen.y - 0.3 };
          f.sale = { paso: 'celda', pasa, sitio, t: 0 };
          if (enCasa) { f.x = sitio.x; f.z = sitio.z; f.cola = []; f.p.obj.position.set(f.x, 0, f.z); ver(f.p, true); }
          else f.cola = mo.caminos.ruta({ x: f.x, z: f.z }, sitio);
        }
        const q = f.sale;
        if (q.paso === 'celda' || q.paso === 'lista' || f.cola.length) { f.alfa = Math.min(1, f.alfa + dt * 1.5); ver(f.p, true); opacidad(f.p.obj, f.alfa); }
        if (caminar(f, dt)) { f.p.e.pose = 'andar'; animar(f.p, t, dt); continue; }
        q.t += dt;
        if (q.paso === 'celda') {                                    // escribe en su celda mientras dura el examen
          f.p.obj.rotation.y = Math.atan2(0, -1); f.p.e.pose = 'escribir';
          if (q.t > 3.2 && !examenEnCurso()) {
            q.t = 0;
            if (q.pasa) { vestirFuncionario(f); const ver2 = tiene(86) && fase(86) === 'meseta'; q.paso = ver2 ? 'lista' : 'puerta'; f.cola = mo.caminos.ruta({ x: f.x, z: f.z }, ver2 ? { x: SI.lista.x, z: SI.lista.y } : PUERTA_ADENTRO); }
            else { q.paso = 'aldea'; const a = ALDEAS[f.k % ALDEAS.length]; f.cola = mo.caminos.ruta({ x: f.x, z: f.z }, { x: a[0], z: a[1] }); }
          }
        } else if (q.paso === 'lista') {                             // lee su nombre en la lista del emperador
          f.p.e.pose = 'quieto'; f.p.obj.rotation.y = Math.atan2(L.PALACIO.x + 0.65 - f.x, L.PALACIO.y - 0.55 - f.z);
          if (q.t > 2.2) { q.paso = 'puerta'; q.t = 0; f.cola = mo.caminos.ruta({ x: f.x, z: f.z }, PUERTA_ADENTRO); }
        } else {                                                     // llegó a la puerta (o al borde de las aldeas): se va
          f.alfa -= dt * 1.2; if (f.alfa <= 0) { quitar(f); continue; } opacidad(f.p.obj, f.alfa); f.p.e.pose = 'quieto';
        }
        animar(f.p, t, dt);
      }
    }

    /* ---------- EL SECRETO DE LA ÉPOCA: el elixir interior. Las noches de otoño, en el templo taoísta del otro lado de la
       explanada, un maestro le enseña a un solo discípulo a cocer el elixir dentro del cuerpo: los dos sentados frente a
       frente, el incensario encendido, el taiji pintado y el libro de Zhang Boduan ---------- */
    const secretoElixir = (() => {
      const x = L.TEMPLO_TAO.x, z = L.TEMPLO_TAO.y, g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = 0.5; dyn.add(g);
      const est = new THREE.Group(); est.position.set(0, 0, 0.38); g.add(est);
      [-1, 1].forEach(l => { const pa = K.malla(K.cilindro(0.01, 0.01, 0.34, 5), KM.KF.maderaD, { grosor: 0.0015 }); pa.position.set(l * 0.1, 0.17, 0); est.add(pa); });
      const tj = lamina(K, matTex(K, 'kf-taiji', textura('kf-taiji', 128, 128, pTaiji)), 0.18, 0.18); tj.position.set(0, 0.32, 0.006); est.add(tj);
      const ince = K.malla(K.cilindro(0.04, 0.03, 0.05, 8), KM.KF.bronce, { grosor: 0.0015 }); ince.position.set(0, 0.025, 0.7); g.add(ince);
      const brasa = K.malla(K.esfera(0.025, 0.4), '#ff9a4a', { sinTinta: true, sombra: false, emissive: '#ff7a2a', emissiveIntensity: 1.2 }); brasa.position.set(0, 0.06, 0.7); g.add(brasa);
      const libro = K.malla(K.caja(0.09, 0.012, 0.12), '#3f5a7a', { grosor: 0.001 }); libro.position.set(0.12, 0.01, 0.72); libro.rotation.y = 0.4; g.add(libro);
      const ch = SE.chispitas(6, 0.22, 0.5); ch.position.set(x, 0.05, z); dyn.add(ch);
      const luzS = new THREE.PointLight('#ffb35c', 0, 2.2, 1.6); luzS.position.set(x + 0.2, 0.4, z + 0.5); raiz.add(luzS);
      const maestro = persona({ ...PZ.TAOISTA }, { pose: 'suelo' }), disc = persona({ ...PZ.TAOISTA, colorPelo: '#1e1a18', barba: undefined, colorRopa: '#3a4a6a', orla: '#2a3450', chal: '#2a3450' }, { pose: 'suelo' });
      const p0 = new THREE.Vector3(-0.22, 0, 0.72).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.5), p1 = new THREE.Vector3(0.24, 0, 0.72).applyAxisAngle(new THREE.Vector3(0, 1, 0), 0.5);
      return (t, dt, luz, on) => {
        const ve = on && luz < 0.4 && estacion().i === 2;
        g.visible = ve; ch.visible = ve && !secretoHallado('elixir');
        if (ver(maestro, ve)) { ubicar(maestro, x + p0.x, z + p0.z, { x: x + p1.x, y: z + p1.z }); animar(maestro, t, dt); }
        if (ver(disc, ve)) { ubicar(disc, x + p1.x, z + p1.z, { x: x + p0.x, y: z + p0.z }); animar(disc, t, dt); }
        luzS.intensity = ve ? 1.0 + 0.2 * Math.sin(t * 5) : 0; brasa.scale.setScalar(1 + 0.15 * Math.sin(t * 7));
        if (!ve) return;
        ch.userData.titilar(t);
        tocable(x, z + 0.4, { k: 'secreto', id: 'elixir', x, y: z }, { rx: 26, ry: 18, dy: 12 });
      };
    })();

    /* ---------- cada cuadro ---------- */
    function sincronizar(t, dt) {
      const e15 = S.era === 15, luz = luzDia(), noche = nocheCasa(), deNoche = noche > 0.5, oscuro = luz < 0.5;
      vestir();
      const lk = Math.max(0, Math.min(1, (0.55 - luz) / 0.25));
      luciernagas.userData.k = estacion().i === 1 ? lk * lk * (3 - 2 * lk) * 0.3 : 0; luciernagas.visible = luciernagas.userData.k > 0.01;

      // --- las ranuras de los saberes: cada una con sus etapas (kaifeng/piezas.js) ---
      ranura('prefectura', tiene(81) ? llave(81) : null, () => oficio(81, () => PZ.prefectura(K, niv(81))));
      ranura('impresos', tiene(82) ? llave(82) : null, () => oficio(82, () => PZ.impresos(K, niv(82))));
      ranura('huyuan', tiene(83) ? llave(83) : null, () => oficio(83, () => PZ.huyuan(K, niv(83))));
      ranura('anonimo', tiene(84) ? llave(84) : null, () => oficio(84, () => PZ.anonimo(K, niv(84))));
      ranura('academia', tiene(85) ? llave(85) : null, () => oficio(85, () => PZ.academia(K, niv(85))));
      ranura('palacio', tiene(86) ? llave(86) : null, () => oficio(86, () => PZ.palacio(K, niv(86))));
      const clave = mo.claveRanuras() + '|' + S.docentes + '|' + (tiene(85) ? fase(85) : '') + '|' + (e15 ? estadoPensador('zhuxi') : 0) + '|' + !!zCamino;
      if (clave !== claveObst) { claveObst = clave; rehacerPaso(); }
      mo.animarRanuras(t, dt);

      // --- los tocables: las piezas y el mundo ---
      for (const r of Object.values(ranuras)) if (r.P && r.P.toc) for (const q of r.P.toc) tocP(q.x, q.y, { k: q.k }, q.p);
      tocable(L.HEROE.x, L.HEROE.y, { k: 'pagodaCh' }, { rx: 60, ry: 34, dy: 110 });
      tocable(L.PUENTE.x, L.PUENTE.y, { k: 'puenteCh' }, { rx: 44, ry: 20, dy: 14 });
      tocable(L.PUERTA.x, L.PUERTA.y, { k: 'puertaCh' }, { rx: 46, ry: 24, dy: 50 });
      tocable(L.CASA_TE.x, L.CASA_TE.y, { k: 'casaTeCh' }, { rx: 40, ry: 26, dy: 34 });
      tocable(6.2, 12.0, { k: 'bianCh' }, { rx: 30, ry: 12, dy: 0 });
      tocable(L.HORNO_TINTA.x, L.HORNO_TINTA.y, { k: 'hornoCh' }, { rx: 26, ry: 14, dy: 10 });
      tocable(L.TEMPLO_TAO.x, L.TEMPLO_TAO.y, { k: 'temploCh' }, { rx: 26, ry: 18, dy: 20 });
      tocable(13.4, 14.4, { k: 'explanadaCh' }, { rx: 30, ry: 14, dy: 0 });
      for (const c of casas.userData.puestas) if (c.ficha && c.i < 90) tocable(c.x, c.z, { k: c.ficha }, { rx: 26, ry: 18, dy: 22 });

      // --- el Bian: la barca baja con la corriente, abate el mástil para pasar bajo el puente y vuelve a entrar arriba ---
      uBarca = (uBarca + dt * 0.12) % L.LARGO_BIAN;
      const qb = L.enEje(uBarca), yAgua = agua.rio.position.y, lado = -0.22 * qb.ancho;
      barca.position.set(qb.x - qb.tz * lado, yAgua + 0.02 + 0.006 * Math.sin(t * 1.2), qb.z + qb.tx * lado); barca.rotation.y = Math.atan2(qb.tz, -qb.tx);
      const cerca = Math.abs(uBarca - uPuente) < 1.7, meta = cerca ? 1.4 : 0.05;
      angMastil += (meta - angMastil) * Math.min(1, dt * 1.6); mastil.rotation.z = -angMastil;
      const bordes = Math.min(1, uBarca / 0.6, (L.LARGO_BIAN - uBarca) / 0.6);
      if (e15) { barca.visible = true; opacidad(barca, Math.max(0, bordes)); animar(barquero, t, dt); tocP(barca.position.x, barca.position.z, { k: 'barcaCh' }); } else barca.visible = false;

      // --- los maestros (de noche quietos; el de la prefectura sigue con los que leen) ---
      const leen = e15 && deNoche && prefecturaCh();
      guias.forEach((p, i) => {
        /* cada maestro aparece con su sala (Fan Zhongyan con la prefectura; el de aldea, cuando hay escuelas de aldea): nadie
           espera de pie en la explanada vacía. De noche, solo Sun Fu, con los que siguen leyendo */
        const tec = SALA_DE[i], abierta = e15 && (tec > 0 ? tiene(tec) && fase(tec) === 'meseta' : i === 3 ? prefecturaCh() && i < S.docentes : (S.maestrosAldea || 0) > 0);
        if (!ver(p, abierta && (!deNoche || (i === 1 && leen)))) return;
        const m = MAESTROS[i]; ubicar(p, m.x, m.y, { x: m.x + 1, y: m.y + 1 });
        p.e.pose = deNoche ? 'leer' : 'narrar'; animar(p, t, dt); tocP(m.x, m.y, { k: 'docente', i }, p);
      });
      // --- los candidatos: la fila, las tres maneras de prepararse, los listos, el examen y lo que viene después ---
      candidatos(t, dt, e15, deNoche);
      const esperan = e15 && prefecturaCh() ? candidatosEsperan() : 0;
      anilloPref.visible = esperan > 0 && !deNoche; if (anilloPref.visible) anilloPref.userData.latir(t);
      // --- la gente de la ciudad: pasea de día; algunos se sientan con Fan Zhongyan, con Cheng Yi y, recibido, con Zhu Xi ---
      const vis = deNoche ? 0 : Math.min(S.alumnos, 12), plan = [], planM = [];
      corros.forEach((sitios, c) => { if ([3, 4][c] >= S.docentes) return; for (const s of sitios.slice(0, 4)) { if (plan.length >= vis) break; plan.push(s); planM.push(c); } });
      const quien = c => LEX().nombres[[3, 4][c]];
      aprendices.paso(t, dt, vis, { asiento: deNoche ? () => null : i => plan[i] || null, mira: { x: L.LUGAR_ZHUXI.x, y: L.LUGAR_ZHUXI.y } }, a => ({ k: 'alumno', i: a.i + 3, con: planM[a.i] !== undefined ? quien(planM[a.i]) : undefined }));
      for (const a of aprendices.lista) if (a.p.obj.visible) a.p.obj.position.y += V.alturaPaso(a.p.obj.position.x, a.p.obj.position.z);   // sobre el puente, en el tablero

      // --- Li Qingzhao: mira a los candidatos (no puede presentarse); con el examen de palacio, lee la lista ---
      if (ver(li, e15 && !deNoche)) {
        const conLista = tiene(86) && fase(86) === 'meseta', q = LI_EN[conLista ? 1 : 0];
        ubicar(li, q.x, q.y, conLista ? { x: L.PALACIO.x + 0.65, y: L.PALACIO.y - 0.55 } : { x: SI.fila.x, y: SI.fila.y }); li.e.pose = conLista ? 'leer' : 'quieto'; animar(li, t, dt);
        tocP(q.x, q.y, { k: 'prefecturaCh' }, li);
      }

      // --- Zhu Xi: entra por la puerta de la ciudad, espera y, recibido, cruza el puente y enseña junto a la academia ---
      const estZ = e15 ? estadoPensador('zhuxi') : 0;
      if (estZ === 1 && zAntes !== 1) zT0 = zAntes === -1 || !nacimientosVivos ? t - 99 : t;
      if (estZ === 2 && zAntes === 1 && nacimientosVivos) zCamino = { cola: mo.caminos.ruta({ x: L.ESPERA_ZHUXI.x, z: L.ESPERA_ZHUXI.y }, { x: L.LUGAR_ZHUXI.x, z: L.LUGAR_ZHUXI.y }), x: L.ESPERA_ZHUXI.x, z: L.ESPERA_ZHUXI.y };
      zAntes = estZ;
      const uZ = Math.min(1, (t - zT0) / 6), kZ = smooth(uZ);
      if (ver(zhu, e15 && estZ >= 1)) {
        let px, pz, anda = false, mira, h = 0;
        if (estZ === 1) { px = ENTRADA_ZHUXI.x + (L.ESPERA_ZHUXI.x - ENTRADA_ZHUXI.x) * kZ; pz = ENTRADA_ZHUXI.y + (L.ESPERA_ZHUXI.y - ENTRADA_ZHUXI.y) * kZ; anda = uZ < 1; mira = anda ? { x: px, y: pz + 1 } : { x: px + 0.5, y: pz + 1 }; opacidad(zhu.obj, Math.min(1, uZ * 3)); }
        else {
          px = L.LUGAR_ZHUXI.x; pz = L.LUGAR_ZHUXI.y; mira = { x: px + 0.8, y: pz + 1 };
          if (zCamino) {
            const c = zCamino, d = c.cola[0];
            if (!d) zCamino = null;
            else { const dx = d.x - c.x, dz = d.z - c.z, D = Math.hypot(dx, dz); if (D < 0.05) c.cola.shift(); else { const s = Math.min(D, 0.55 * dt); c.x += dx / D * s; c.z += dz / D * s; } px = c.x; pz = c.z; anda = true; mira = { x: px + dx, y: pz + dz }; h = V.alturaPaso(px, pz); }
          }
        }
        ubicar(zhu, px, pz, mira, h); zhu.e.pose = anda ? 'andar' : estZ === 2 && !deNoche ? 'narrar' : 'quieto'; animar(zhu, t, dt);
        tocP(px, pz, { k: 'pensador', id: 'zhuxi' }, zhu);
      }

      // --- la noche: los faroles de la calle y del puente (en el año nuevo, la fiesta de los Faroles), la casa de té, la prefectura ---
      const n1 = 1 - luz, faroles_ = estacion().i === 3;
      faroles.forEach((f, i) => { const ll = f.userData.llama, on = oscuro; ll.visible = on; if (on) ll.scale.setScalar((faroles_ ? 1.25 : 1) + 0.1 * Math.sin(t * 9 + i * 1.7)); });
      const pf = ranuras.palacio && ranuras.palacio.P && ranuras.palacio.P.faroles; if (pf) pf.forEach((ll, i) => { ll.visible = oscuro; ll.scale.setScalar(1 + 0.1 * Math.sin(t * 8 + i)); });
      luzPref.intensity = leen ? n1 * 2.6 * (0.9 + 0.1 * Math.sin(t * 7)) : 0;
      luzTe.intensity = n1 * 2.0 * (0.9 + 0.1 * Math.sin(t * 6));
      luzCalle.intensity = n1 * (faroles_ ? 3.0 : 2.0) * (0.9 + 0.1 * Math.sin(t * 8));
      luzPuente.intensity = n1 * (faroles_ ? 2.0 : 1.2) * (0.9 + 0.1 * Math.sin(t * 5));
      const escriben = [...FIG.values()].some(f => f.sale && f.sale.paso === 'celda');
      luzExamen.intensity = escriben ? n1 * 2.6 * (0.9 + 0.1 * Math.sin(t * 9)) : 0;

      secretoElixir(t, dt, luz, e15);
      mo.luces(t);
      vivos.forEach(f => f(t, dt));
      return { luz, brasa: 0 };
    }

    /* ---------- el estado de cada saber y los globos: el pase 2D ---------- */
    const ALTO = { 81: 40, 82: 36, 83: 36, 84: 40, 85: 40, 86: 38 };
    const DONDE = { 81: PZ.ANCLAS.prefectura, 82: PZ.ANCLAS.impresos, 83: PZ.ANCLAS.huyuan, 84: PZ.ANCLAS.anonimo, 85: PZ.ANCLAS.academia, 86: PZ.ANCLAS.palacio };
    function superponer(t) {
      for (const i of [81, 82, 83, 84, 85, 86]) { if (!tiene(i)) continue; const a = DONDE[i], p = P(a.x, a.y, ALTO[i]); estadoTec(i, { x: p.x, y: p.y }, t); }
      if (S.era !== 15) return;
      if (estadoPensador('zhuxi') === 1 && VISITAS.zhuxi && !zCamino) drawGlobo(L.ESPERA_ZHUXI.x, L.ESPERA_ZHUXI.y, t);
    }

    /* ---------- los rótulos de acción: lo que se toca en Kaifeng ---------- */
    function rotulos(ancla, t, tocarEn) {
      const e15 = S.era === 15, n = e15 && prefecturaCh() ? candidatosEsperan() : 0;
      ancla('candidatos', n > 0, SI.fila.x + 0.25, SI.fila.y + 0.75, 26, `los candidatos · ${n} ${n === 1 ? 'espera' : 'esperan'}`, 'accion', () => abrirExamen());
      const estZ = e15 ? estadoPensador('zhuxi') : 0;
      ancla('recibir', estZ === 1 && S.apr >= (VISITAS.zhuxi?.costo || 0), L.ESPERA_ZHUXI.x, L.ESPERA_ZHUXI.y, 52, 'recibir a Zhu Xi', 'accion', () => tocarEn(L.ESPERA_ZHUXI.x, L.ESPERA_ZHUXI.y));
    }

    /* las caras de quienes firman la consejera en esta época */
    const caras = {
      'Li Qingzhao': { ...PZ.LIQINGZHAO },
      'Zhu Xi': { ...PZ.ZHUXI },
    };
    return { quieto, nubes, sincronizar, superponer, rotulos, caras, aprendices, get corros() { return corros; }, get candidatosVisibles() { return [...FIG.values()].filter(f => f.p.obj.visible).length; } };
  },
};
