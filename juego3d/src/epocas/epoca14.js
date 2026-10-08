/* ============================================================
   epocas/epoca14
   La Época 14 (Roma, 70-117 d. C.; en el viaje va entre Alejandría y Bagdad) sobre el motor 3D. Como las otras: aquí vive
   lo de ESTA época (quién está dónde, su año, su noche y sus rótulos); el cómo lo pone motor3d.js. El mundo vive en
   src/roma/. Las anclas de la lógica (las tres escuelas, los calculi, la escuela pagada, la Institutio, la orilla del
   Tíber, la espera y el lugar de Quintiliano) son las del motor (09i-roma), espejadas en roma/lugares.js.
   LA COMPOSICIÓN (la hoja juego3d/bocetos/roma.html, AAAA, 2026-10-05; maqueta en src/roma/maqueta.js): el Foro Romano
   con el Capitolio al fondo (Júpiter de techo dorado en su cumbre, la basílica Julia donde se pleitea), la isla Tiberina
   con el puente Fabricio, las ínsulas de la Subura y, en la mitad del frente, el arco de las tres escuelas.
   LAS TRES ESCUELAS SE VEN: cada alumno de S.alumnosRo es una persona sentada en el corro de su escuela, ante su maestro;
   el pedagogo trae a los niños nuevos desde las ínsulas hasta el ludus; el que pasa camina a la escuela siguiente (y al
   llegar al rétor ya lleva la toga viril); el orador que termina baja a la basílica Julia a defender su primer caso, y el
   letrado vuelve a su casa. De noche las escuelas cierran, salvo el ludus, que empieza antes del amanecer, con lámparas
   (Marcial, Epigramas IX, 68). Plinio el Joven pleitea en la basílica; Quintiliano llega de Hispania por el camino del
   este y, recibido, enseña entre las escuelas. El secreto: el mitreo, bajo una ínsula, las noches de invierno.
   ============================================================ */
import * as THREE from 'three';
import { fundir } from '../kit.js';
import * as M from '../mundo.js';
import * as V from '../roma/valle.js';
import * as MON from '../roma/monumentos.js';
import * as PZ from '../roma/piezas.js';
import * as L from '../roma/lugares.js';
import { conActores, pieza } from '../piezas.js';
import { fase, tiene, niv, llave } from '../motor3d.js';
import { huellasDe } from '../caminos.js';
import { burro } from '../bagdad/monumentos.js';
import * as SE from '../secretos.js';

/* ---------- dónde está cada cosa ---------- */
const MS = PZ.MAESTRO_SALA;                                   // el maestro de cada escuela: 0 el ludus, 1 el grammaticus, 2 el rétor
/* los maestros, en el orden de sus nombres (LEX().nombres de Roma: Orbilio, Remio Palemón, Verrio Flaco, Porcio Latrón,
   Cecilio Epirota, el litterator del pórtico): cada uno donde enseñó de verdad */
const MAESTROS = [MS[1], MS[0], { x: L.INSTITUTIO.x - 0.5, y: L.INSTITUTIO.y - 0.42 }, MS[2], { x: L.CALCULI.x - 0.55, y: L.CALCULI.y - 0.4 }, { x: L.LUDUS.x + 0.62, y: L.LUDUS.y - 0.62 }];
const DE_SALA = [1, 0, 3];                                     // qué maestro enseña en cada escuela
const POSE_SALA = ['escribir', 'suelo', 'suelo'];              // el ludus escribe en la tablilla; arriba se escucha (y uno declama)
const NVIS = 12;                                               // cuántos de cada escuela se sientan a la vista
const PLINIO_EN = [{ x: L.GRADAS_BASILICA.x + 0.42, y: L.GRADAS_BASILICA.y + 0.28 }, { x: L.PAGADA.x - 0.5, y: L.PAGADA.y + 0.3 }];   // pleitea en la basílica; con la escuela pagada, junto a su arca
const ENTRADA_QUINTILIANO = { x: 18.3, y: 8.7 };               // el camino del este, por donde llega de Hispania
const ESPERA_PED = { x: L.LUDUS.x + 0.78, y: L.LUDUS.y - 0.05 };   // donde el pedagogo deja al niño
const PUERTAS = L.HOGARES.slice(0, 4).map(([x, y]) => ({ x, z: y + 0.18 }));   // las puertas de las ínsulas, un paso afuera
const LAMPARAS_LUDUS = [[L.LUDUS.x + 0.55, L.LUDUS.y + 0.55], [L.LUDUS.x - 0.62, L.LUDUS.y + 0.32]];
const LAMPARAS_CALLE = [[15.55, 4.45], [16.05, 7.25], [7.95, 16.3]];
const BARCA = [[3.15, 5.5], [3.3, 10.5], [3.05, 12.4], [2.4, 13.6], [2.3, 15.4], [2.4, 17.95]];   // la barca baja por el brazo de la izquierda

function reservar() {
  const R = V.RESERVAS; R.length = 0;
  for (const [k, A] of Object.entries(PZ.ANCLAS)) R.push({ x: A.x, z: A.y, r: 0.85, pieza: k });   // lo que pisen lo marcan sus huellas
  MAESTROS.forEach(m => R.push({ x: m.x, z: m.y, r: 0.3, maestro: true }));
  [...PLINIO_EN, L.LUGAR_QUINTILIANO, L.ESPERA_QUINTILIANO, ESPERA_PED].forEach(m => R.push({ x: m.x, z: m.y, r: 0.28, sitio: true }));
  R.push({ x: L.MITREO.x, z: L.MITREO.y, r: 0.32, bloquea: true });
  [...LAMPARAS_LUDUS, ...LAMPARAS_CALLE].forEach(([x, z]) => R.push({ x, z, r: 0.1, bloquea: true }));
  R.push({ x: 9.95, z: 11.3, r: 0.28, bloquea: true }, { x: 9.15, z: 10.25, r: 0.2, bloquea: true });   // los tres árboles del Foro y el lago Curcio
}
const smooth = k => k * k * (3 - 2 * k);
const fasesDia = () => ((tJuegoVis % 150) + 150) % 150 / 150;   // 0 el mediodía, 0,5 la medianoche (luzDia)
/* la polilínea de la barca, con su largo */
const largosBarca = BARCA.reduce((a, p, i) => { a.push(i ? a[i - 1] + Math.hypot(p[0] - BARCA[i - 1][0], p[1] - BARCA[i - 1][1]) : 0); return a; }, []);
function enBarca(u) {
  let i = 1; while (i < BARCA.length - 1 && largosBarca[i] < u) i++;
  const k = (u - largosBarca[i - 1]) / (largosBarca[i] - largosBarca[i - 1]), dx = BARCA[i][0] - BARCA[i - 1][0], dz = BARCA[i][1] - BARCA[i - 1][1];
  return { x: BARCA[i - 1][0] + dx * k, z: BARCA[i - 1][1] + dz * k, rot: Math.atan2(dx, dz) };
}

export default {
  era: 14,
  nombre: 'Roma',
  piezas: PZ.PIEZAS,
  construir(mo) {
    const { K, raiz, dyn, vivos, ranura, ranuras, persona, ubicar, ver, animar, opacidad, tocP } = mo;
    const oficio = (i, f) => conActores(fase(i) === 'meseta', f);
    reservar(); L.verificarEspejo();

    /* ---------- el héroe: el Foro Romano con el Capitolio. Su huella (la basílica, los templos, la Curia, la colina) se mide
       antes de fundirlo: por ahí no se camina ---------- */
    const foro = MON.heroe(K, MON.VARIANTES.heroe); foro.position.set(L.HEROE.x, 0, L.HEROE.y);
    for (const h of huellasDe(foro, 0.06)) V.RESERVAS.push({ ...h, heroe: true });
    fundir(K, foro, 0.01); raiz.add(foro);
    /* la segunda pieza: la isla Tiberina con su templo de Esculapio, la proa de travertino y el puente Fabricio */
    const isla = MON.segunda(K, MON.VARIANTES.segunda); fundir(K, isla, 0.01);
    isla.position.set(L.ISLA.x, V.NIVEL + 0.02, L.ISLA.y); isla.rotation.y = -Math.PI / 2; raiz.add(isla);

    /* ---------- el barrio y el valle: lo quieto se funde; el suelo y el agua se repintan con el año ---------- */
    const casas = V.casas(K);
    for (const c of casas.userData.puestas) V.RESERVAS.push({ x0: c.x - c.w / 2 - 0.06, x1: c.x + c.w / 2 + 0.06, z0: c.z - c.d / 2 - 0.06, z1: c.z + c.d / 2 + 0.06, casa: true });
    V.FUENTES.forEach(([x, z]) => V.RESERVAS.push({ x, z, r: 0.2, bloquea: true }));
    const suelo = V.suelo(K), agua = V.agua(K, vivos);
    const veg = V.vegetacion(K, vivos, (x, z, r) => !V.reservado(x, z, r) && !L.enColina(x, z, 0.15));
    const ARB = veg.puestos;
    const quieto = new THREE.Group();
    quieto.add(V.losa(K), casas, veg.g);
    fundir(K, quieto);
    raiz.add(suelo, agua.g, quieto);
    const nubes = M.nubes(K, vivos); raiz.add(nubes.g);
    const luciernagas = M.luciernagas(vivos); raiz.add(luciernagas);
    /* las luces de la noche: el ludus antes del amanecer, el Foro, las ínsulas (en las Saturnales, con velas) */
    const luzLudus = new THREE.PointLight('#ffb35c', 0, 4.5, 1.6); luzLudus.position.set(L.LUDUS.x, 0.8, L.LUDUS.y + 0.2); raiz.add(luzLudus);
    const luzForo = new THREE.PointLight('#ffae5a', 0, 6, 1.6); luzForo.position.set(L.FORO.x, 1.1, L.FORO.y + 0.4); raiz.add(luzForo);
    const luzSubura = new THREE.PointLight('#ffb35c', 0, 6, 1.6); luzSubura.position.set(15.6, 1.0, 6.4); raiz.add(luzSubura);
    const luzRio = new THREE.PointLight('#ffae5a', 0, 4.5, 1.6); luzRio.position.set(7.4, 0.9, 14.6); raiz.add(luzRio);
    const lamparas = [...LAMPARAS_LUDUS, ...LAMPARAS_CALLE].map(([x, z], i) => { const l = PZ.lampara(K, i < 2 ? 0.5 : 0.42); l.position.set(x, 0, z); dyn.add(l); return { l, ludus: i < 2 }; });
    const barca = V.barca(K); dyn.add(barca);
    const remero = persona(PZ.romano(2, { colorRopa: '#8a7452' }), { pose: 'pertiga' }); remero.obj.scale.setScalar(0.8);   // el barquero empuja con la pértiga, de pie en la popa
    { const pt = K.malla(K.cilindro(0.012, 0.014, 1.3, 5), MON.RO.madera, { grosor: 0.003 }); pt.position.y = -0.2; remero.sostener?.(pt, 'D'); }
    barca.add(remero.obj); remero.obj.position.set(0, 0.04, -0.26);

    /* ---------- el año de Roma (ESTACIONES_ROMA del motor): el verde de marzo, el pasto dorado, la vendimia, el invierno lluvioso ---------- */
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
    const plinio = persona({ ...PZ.PLINIO }, { pose: 'narrar' });
    const quint = persona({ ...PZ.QUINTILIANO }, { pose: 'quieto' });
    const mula = burro(K, '#8a7a6a'); mula.userData.vivo = true; mula.scale.setScalar(0.9); dyn.add(mula);
    const fardos = new THREE.Group(); mula.add(fardos);
    [[-0.09, '#c9b48a'], [0.09, '#a8875a']].forEach(([x, c]) => { const f = K.malla(K.cilindro(0.05, 0.05, 0.16, 8), c, { grosor: 0.002 }); f.rotation.x = Math.PI / 2; f.position.set(x, 0.3, 0); fardos.add(f); });
    let qAntes = -1, qCamino = null, qT0 = -99;
    const pedagogos = [0, 1, 2].map(i => { const p = persona({ ...PZ.PEDAGOGO, colorRopa: ['#9a8462', '#8a7a62', '#a8916a'][i] }, { pose: 'andar' }); const cj = PZ.capsa(K, 3); cj.scale.setScalar(0.55); p.sostener?.(cj, 'I'); ver(p, false); return { p, libre: true, cola: [], x: 0, z: 0, alfa: 0, espera: 0 }; });
    const aprendices = mo.paseantes(12, { opciones: i => PZ.romano(i + 3), inicio: i => ({ x: 11.0 + (i % 4) * 0.4, z: 13.6 + Math.floor(i / 4) * 0.35 }), semilla: 1414 });
    const anilloLudus = SE.ondas(2, 0.6, '#ffd76a'); anilloLudus.position.set(L.LUDUS.x, 0.02, L.LUDUS.y); dyn.add(anilloLudus);

    /* ---------- por dónde se camina: el Foro y la explanada de las escuelas; el agua, la isla, la colina, los templos y las casas no ---------- */
    const enRect = (x, z, r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
    const PASO = 0.25, X0 = 2.1, NC = Math.ceil((17.9 - X0) / PASO);   // la grilla de caminos.js
    let claveObst = '', asientos = [[], [], []], corros = [];
    function rehacerPaso() {
      const RECTS = V.RESERVAS.filter(r => r.x0 !== undefined);
      const circulos = [...V.RESERVAS.filter(r => r.r && r.bloquea).map(r => ({ x: r.x, z: r.z, r: r.r })), ...ARB.map(a => ({ x: a.x, z: a.z, r: a.r }))];
      const base = (x, z) => V.altura(x, z) < -0.03 || L.enIsla(x, z, 0.1) || L.enColina(x, z) || RECTS.some(r => enRect(x, z, r)) || x < 2.25 || z < 2.25 || x > 17.75 || z > 17.75;
      mo.rehacerCaminos({ circulos, bloquea: base });
      /* lo libre que no se alcanza desde la explanada (el borde del río detrás de la basílica) se cierra, para que nadie quiera ir y cruce algo */
      const C = mo.caminos, celda = (i, j) => C.libre(X0 + (i + 0.5) * PASO, X0 + (j + 0.5) * PASO), visto = new Uint8Array(NC * NC);
      let i0 = Math.floor((L.LUGAR_QUINTILIANO.x - X0) / PASO), j0 = Math.floor((L.LUGAR_QUINTILIANO.y - X0) / PASO);
      for (let r = 0; r < 6 && !celda(i0, j0); r++) i0++;
      const cola = [[i0, j0]]; visto[i0 * NC + j0] = 1;
      while (cola.length) { const [i, j] = cola.pop(); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= NC || b >= NC || visto[a * NC + b] || !celda(a, b)) continue; visto[a * NC + b] = 1; cola.push([a, b]); } }
      const islas = new Set(); for (let i = 0; i < NC; i++) for (let j = 0; j < NC; j++) if (!visto[i * NC + j] && celda(i, j)) islas.add(i * NC + j);
      if (islas.size) mo.rehacerCaminos({ circulos, bloquea: (x, z) => base(x, z) || islas.has(Math.floor((x - X0) / PASO) * NC + Math.floor((z - X0) / PASO)) });
      aprendices.rehacer();
      const usados = [];
      asientos = MS.map(m => buscarAsientos(m, 16, usados));
      corros = [2, 4].map(i => buscarAsientos(MAESTROS[i], 6, usados)).concat([buscarAsientos(L.LUGAR_QUINTILIANO, 7, usados)]);
      for (const f of FIG.values()) f.clave = null;                // que cada uno busque su asiento de nuevo
    }
    const ocupadoSitio = (x, z) => V.RESERVAS.some(r => !r.maestro && !r.sitio && !r.pieza && (r.r ? Math.hypot(x - r.x, z - r.z) < r.r + 0.03 : x > r.x0 - 0.03 && x < r.x1 + 0.03 && z > r.z0 - 0.03 && z < r.z1 + 0.03));
    function buscarAsientos(m, cupo, usados) {
      const cand = [];
      for (const r of [0.5, 0.8, 1.1]) for (let k = 0; k < 20; k++) { const a = Math.PI / 4 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (0.38 / r); cand.push({ x: m.x + Math.sin(a) * r, z: m.y + Math.cos(a) * r, d: Math.ceil(k / 2) * 0.38 / r + r * 0.7 }); }
      cand.sort((u, v) => u.d - v.d);
      const lista = [];
      for (const c of cand) {
        if (lista.length >= cupo) break;
        if (!mo.caminos.libre(c.x, c.z) || V.altura(c.x, c.z) < -0.02 || ocupadoSitio(c.x, c.z)) continue;
        if (usados.some(u => Math.hypot(u.x - c.x, u.z - c.z) < 0.27)) continue;
        const q = { x: c.x, z: c.z, mira: { x: m.x, y: m.y } }; lista.push(q); usados.push(q);
      }
      return lista;
    }

    /* ---------- LOS ALUMNOS DE LAS TRES ESCUELAS: una persona por cada uno de S.alumnosRo ---------- */
    const FIG = new Map();
    const figura = (a, x, z, alfa) => {
      const p = persona(a.e >= 2 ? PZ.muchacho(a.k) : PZ.nino(a.k, a.g), { pose: 'quieto' });
      p.obj.position.set(x, 0, z); opacidad(p.obj, alfa);
      const f = { k: a.k, p, x, z, cola: [], sala: a.e, adulto: a.e >= 2, sale: false, alfa, clave: null, llega: false, t0: 0, n: a.n, vel: 0.68 + (a.k % 5) * 0.04 };
      FIG.set(a.k, f); return f;
    };
    const quitar = f => { dyn.remove(f.p.obj); mo.liberar(f.p.obj); FIG.delete(f.k); };
    function crecer(f, a) { const pos = f.p.obj.position.clone(), rot = f.p.obj.rotation.y; dyn.remove(f.p.obj); mo.liberar(f.p.obj); f.p = persona(PZ.muchacho(a.k), { pose: 'andar' }); f.p.obj.position.copy(pos); f.p.obj.rotation.y = rot; f.adulto = true; }
    const pedagogoLibre = () => pedagogos.find(q => q.libre);
    function caminar(f, dt) {   // un paso por su cola; true si sigue andando
      if (!f.cola.length) return false;
      const d = f.cola[0], dx = d.x - f.x, dz = d.z - f.z, D = Math.hypot(dx, dz);
      if (D < 0.04) { f.cola.shift(); return f.cola.length > 0; }
      const s = Math.min(D, f.vel * dt); f.x += dx / D * s; f.z += dz / D * s;
      let da = Math.atan2(dx, dz) - f.p.obj.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); f.p.obj.rotation.y += da * Math.min(1, dt * 8);
      f.p.obj.position.set(f.x, 0, f.z);
      return true;
    }
    const nombreDe = n => { const i = typeof NOMBRES_ROMA !== 'undefined' ? NOMBRES_ROMA.indexOf(n) : -1; return i >= 0 ? i : 0; };
    function alumnos(t, dt, e14, deNoche, madrugada) {
      const lista = e14 ? (S.alumnosRo || []) : [], vivosK = new Set();
      const porSala = [[], [], []];
      for (const a of lista) { if (a.e >= 0 && a.e < 3) porSala[a.e].push(a); vivosK.add(a.k); }
      porSala.forEach(l => l.sort((u, v) => u.k - v.k));
      const lugar = new Map();
      porSala.forEach((l, e) => l.forEach((a, j) => lugar.set(a.k, j < NVIS ? asientos[e][j] || null : null)));
      for (const a of lista) {
        let f = FIG.get(a.k);
        const s = lugar.get(a.k), enClase = !deNoche || (madrugada && a.e === 0);
        if (!f) {
          if (nacimientosVivos && a.e === 0 && enClase && s) {   // el pedagogo lo trae desde su ínsula
            const pu = PUERTAS[a.k % PUERTAS.length]; f = figura(a, pu.x, pu.z, 0); f.llega = true;
            f.cola = mo.caminos.ruta({ x: pu.x, z: pu.z }, s); f.clave = s.x.toFixed(2) + ',' + s.z.toFixed(2);
            const q = pedagogoLibre();
            if (q) { q.libre = false; q.x = pu.x - 0.15; q.z = pu.z - 0.1; q.cola = mo.caminos.ruta({ x: q.x, z: q.z }, { x: ESPERA_PED.x, z: ESPERA_PED.y }); q.espera = 0; q.alfa = 0; q.puerta = pu; ver(q.p, true); }
          } else f = figura(a, s ? s.x : L.LUDUS.x, s ? s.z : L.LUDUS.y, nacimientosVivos ? 0 : 1);
        }
        if (f.sala !== a.e) { f.sala = a.e; f.clave = null; if (a.e >= 2 && !f.adulto) crecer(f, a); }   // pasó de escuela: camina a la siguiente
        f.n = a.n;
        const visible = enClase && !!s;
        if (!visible) {                                              // a su casa (o sin lugar a la vista): se desvanece y queda en su asiento
          f.alfa = Math.max(0, f.alfa - dt * 1.4);
          if (f.alfa <= 0) { ver(f.p, false); if (s) { f.x = s.x; f.z = s.z; f.p.obj.position.set(f.x, 0, f.z); } f.cola = []; f.clave = s ? s.x.toFixed(2) + ',' + s.z.toFixed(2) : null; continue; }
        } else { ver(f.p, true); f.alfa = Math.min(1, f.alfa + dt * 1.2); }
        opacidad(f.p.obj, f.alfa);
        const clave = s ? s.x.toFixed(2) + ',' + s.z.toFixed(2) : null;
        if (visible && clave !== f.clave) { f.clave = clave; f.cola = f.alfa > 0.3 ? mo.caminos.ruta({ x: f.x, z: f.z }, s) : [{ x: s.x, z: s.z }]; if (f.alfa <= 0.3) { f.x = s.x; f.z = s.z; } }
        if (caminar(f, dt)) f.p.e.pose = 'andar';
        else if (s) {
          if (f.llega) f.llega = false;
          const m = s.mira, j = porSala[a.e].indexOf(a);
          f.p.obj.rotation.y = Math.atan2(m.x - f.x, m.y - f.z);
          f.p.e.pose = a.e === 2 && j === 0 && !deNoche ? 'narrar' : POSE_SALA[a.e];   // en el rétor, uno declama
        }
        animar(f.p, t, dt);
        if (f.alfa > 0.5) tocP(f.x, f.z, { k: 'alumno', i: nombreDe(a.n), con: LEX().nombres[DE_SALA[a.e]] }, f.p);
      }
      /* los que ya no están: el orador baja a la basílica Julia; el letrado vuelve a su casa */
      for (const f of [...FIG.values()]) {
        if (vivosK.has(f.k)) continue;
        if (!f.sale) {
          if (!e14 || f.alfa < 0.3 || !nacimientosVivos) { quitar(f); continue; }
          f.sale = true; f.orador = f.sala === 2;
          const d = f.orador ? { x: L.GRADAS_BASILICA.x, z: L.GRADAS_BASILICA.y } : PUERTAS.reduce((b, p) => Math.hypot(p.x - f.x, p.z - f.z) < Math.hypot(b.x - f.x, b.z - f.z) ? p : b, PUERTAS[0]);
          f.cola = mo.caminos.ruta({ x: f.x, z: f.z }, d); f.t0 = 0;
        }
        if (caminar(f, dt)) f.p.e.pose = 'andar';
        else {
          if (!f.t0) f.t0 = t;
          if (f.orador && t - f.t0 < 3) { f.p.e.pose = 'narrar'; f.p.obj.rotation.y = Math.atan2(L.BASILICA.x - f.x, L.BASILICA.y - f.z); }   // su primer caso, en la escalinata
          else { f.alfa -= dt * 1.2; if (f.alfa <= 0) { quitar(f); continue; } opacidad(f.p.obj, f.alfa); f.p.e.pose = 'quieto'; }
        }
        animar(f.p, t, dt);
      }
      /* los pedagogos: van con el niño, lo dejan en el ludus, esperan un poco y vuelven a la ínsula */
      pedagogos.forEach(q => {
        if (q.libre) { ver(q.p, false); return; }
        q.alfa = Math.min(1, q.alfa + dt * 1.5);
        if (q.cola.length) { const anda = caminar(Object.assign(q, { p: q.p, vel: 0.7 }), dt); q.p.e.pose = anda ? 'andar' : 'quieto'; }
        else if (!q.vuelve) { q.espera += dt; q.p.e.pose = 'quieto'; q.p.obj.rotation.y = Math.atan2(L.LUDUS.x - q.x, L.LUDUS.y - q.z); if (q.espera > 3) { q.vuelve = true; q.cola = mo.caminos.ruta({ x: q.x, z: q.z }, q.puerta); } }
        else { q.alfa -= dt * 2; if (q.alfa <= 0) { q.libre = true; q.vuelve = false; ver(q.p, false); return; } }
        q.p.obj.position.set(q.x, 0, q.z); opacidad(q.p.obj, Math.min(q.alfa, 1)); animar(q.p, t, dt);
      });
    }

    /* ---------- EL SECRETO DE LA ÉPOCA: el mitreo. Las noches de invierno (el nacimiento del Sol Invicto), junto a una ínsula
       de la Subura se abre la bajada a la cueva de Mitra: la escalera con su luz, el iniciado del primer grado (el cuervo)
       con su lámpara y la estela del sol ---------- */
    const secretoMitreo = (() => {
      const x = L.MITREO.x, z = L.MITREO.y, g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = Math.PI / 4; dyn.add(g);
      const hueco = K.malla(K.caja(0.3, 0.012, 0.4), '#1c1612', { sinTinta: true }); hueco.position.set(0, 0.004, 0); g.add(hueco);
      for (let i = 0; i < 4; i++) { const p = K.malla(K.caja(0.26, 0.014, 0.07), i % 2 ? '#8a5a2a' : '#6e4a26', { sinTinta: true }); p.position.set(0, 0.011, -0.15 + i * 0.08); g.add(p); }
      [-1, 1].forEach(l => { const b = K.malla(K.caja(0.04, 0.06, 0.44), MON.RO.travD, { grosor: 0.002 }); b.position.set(l * 0.17, 0.03, 0); g.add(b); });
      const est = new THREE.Group(); est.position.set(0.0, 0, -0.26); g.add(est);
      const estela = K.malla(K.caja(0.16, 0.24, 0.04), MON.RO.rojoD, { grosor: 0.002 }); estela.position.set(0, 0.12, 0); est.add(estela);
      const sol = K.malla(K.cilindro(0.045, 0.045, 0.012, 14), MON.RO.oro, { sinTinta: true, emissive: '#ffb04a', emissiveIntensity: 0.6 }); sol.rotation.x = Math.PI / 2; sol.position.set(0, 0.16, 0.024); est.add(sol);
      const brillo = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.36), new THREE.MeshBasicMaterial({ color: '#ffb35c', transparent: true, opacity: 0.5, depthWrite: false })); brillo.geometry.userData.propia = true; brillo.rotation.x = -Math.PI / 2; brillo.position.y = 0.013; g.add(brillo);
      const ch = SE.chispitas(6, 0.2, 0.45); ch.position.set(x, 0.05, z); dyn.add(ch);
      const luzM = new THREE.PointLight('#ffb35c', 0, 2.0, 1.6); luzM.position.set(x, 0.35, z + 0.1); raiz.add(luzM);
      const cuervo = persona({ piel: 1, pelo: 'corto', colorPelo: '#2a1f18', ropa: 'tunica', colorRopa: '#26222a', orla: '#1a181e', chal: '#1a181e', capucha: '#141216', sinFlecos: true }, { pose: 'quieto' });
      const lu = new THREE.Group(), cuerpo = K.malla(K.esfera(0.03, 0.5), MON.RO.lad, { grosor: 0.002 }); cuerpo.scale.set(1.3, 0.55, 0.9); lu.add(cuerpo);
      const llamaC = K.malla(K.esfera(0.02, 0.4), '#ffd27a', { sinTinta: true, sombra: false, emissive: '#ffb04a', emissiveIntensity: 1.3 }); llamaC.position.set(0.04, 0.015, 0); lu.add(llamaC); cuervo.sostener?.(lu, 'D');   // la lucerna de barro
      ubicar(cuervo, x + 0.28, z + 0.22, { x: x + 1, y: z + 1 });
      return (t, dt, luz, on) => {
        const ve = on && luz < 0.4 && estacion().i === 3;
        g.visible = ve; ch.visible = ve && !secretoHallado('mitreo');
        if (ver(cuervo, ve)) animar(cuervo, t, dt);
        luzM.intensity = ve ? 1.0 + 0.25 * Math.sin(t * 8) : 0; brillo.material.opacity = 0.35 + 0.15 * Math.sin(t * 6);
        if (!ve) return;
        ch.userData.titilar(t);
        tocable(x, z, { k: 'secreto', id: 'mitreo', x, y: z }, { rx: 22, ry: 16, dy: 12 });
      };
    })();

    /* ---------- cada cuadro ---------- */
    let uBarca = 0;
    function sincronizar(t, dt) {
      const e14 = S.era === 14, luz = luzDia(), noche = nocheCasa(), deNoche = noche > 0.5;
      const fd = fasesDia(), madrugada = fd > 0.57 && fd < 0.74, oscuro = luz < 0.5;   // antes del amanecer: el ludus ya está abierto
      vestir();
      const lk = Math.max(0, Math.min(1, (0.55 - luz) / 0.25));
      luciernagas.userData.k = estacion().i === 1 ? lk * lk * (3 - 2 * lk) * 0.3 : 0; luciernagas.visible = luciernagas.userData.k > 0.01;

      // --- las ranuras de los saberes: cada una con sus etapas (roma/piezas.js) ---
      ranura('ludus', tiene(75) ? llave(75) : null, () => oficio(75, () => PZ.ludus(K, niv(75))));
      ranura('calculi', tiene(76) ? llave(76) : null, () => oficio(76, () => PZ.calculi(K, niv(76))));
      ranura('grammaticus', tiene(77) ? llave(77) : null, () => oficio(77, () => PZ.grammaticus(K, niv(77))));
      ranura('rhetor', tiene(78) ? llave(78) : null, () => oficio(78, () => PZ.rhetor(K, niv(78))));
      ranura('pagada', tiene(79) ? llave(79) : null, () => oficio(79, () => PZ.pagada(K, niv(79))));
      ranura('institutio', tiene(80) ? llave(80) : null, () => oficio(80, () => PZ.institutio(K, niv(80))));
      const clave = mo.claveRanuras() + '|' + S.docentes;
      if (clave !== claveObst) { claveObst = clave; rehacerPaso(); }
      mo.animarRanuras(t, dt);

      // --- los tocables: las piezas y el mundo ---
      for (const r of Object.values(ranuras)) if (r.P && r.P.toc) for (const q of r.P.toc) tocP(q.x, q.y, { k: q.k }, q.p);
      tocable(L.FORO.x, L.FORO.y, { k: 'foroRo' }, { rx: 46, ry: 18, dy: 0 });
      tocable(L.BASILICA.x, L.BASILICA.y, { k: 'basilicaRo' }, { rx: 56, ry: 30, dy: 44 });
      tocable(L.CAPITOLIO.x, L.CAPITOLIO.y, { k: 'capitolio' }, { rx: 70, ry: 30, dy: 96 });
      tocable(L.SATURNO.x, L.SATURNO.y, { k: 'saturnoRo' }, { rx: 24, ry: 14, dy: 34 });
      tocable(5.15, 13.35, { k: 'tiber' }, { rx: 26, ry: 12, dy: 0 });
      tocable(L.ISLA.x, L.ISLA.y, { k: 'isla' }, { rx: 34, ry: 22, dy: 26 });

      // --- el Tíber: la barca baja con la corriente, y vuelve a entrar arriba ---
      uBarca = (uBarca + dt * 0.11) % largosBarca[largosBarca.length - 1];
      const qb = enBarca(uBarca), yAgua = agua.rio.position.y, fin = largosBarca[largosBarca.length - 1];
      barca.position.set(qb.x, yAgua + 0.015 + 0.006 * Math.sin(t * 1.2), qb.z); barca.rotation.y = qb.rot;
      if (e14) opacidad(barca, Math.min(1, uBarca / 0.6, (fin - uBarca) / 0.6)); else barca.visible = false;
      if (e14) animar(remero, t, dt);

      // --- los maestros (de noche quietos; el del ludus enseña antes del amanecer) ---
      guias.forEach((p, i) => {
        const sala = DE_SALA.indexOf(i), abierta = sala >= 0 && e14 && salaAbierta(sala);
        if (!ver(p, i < S.docentes || abierta)) return;
        const m = MAESTROS[i]; ubicar(p, m.x, m.y, { x: m.x + 1, y: m.y + 1 });
        p.e.pose = (deNoche && !(madrugada && sala === 0)) ? 'quieto' : 'narrar'; animar(p, t, dt); tocP(m.x, m.y, { k: 'docente', i }, p);
      });
      // --- las tres escuelas: los alumnos, los que pasan, los que terminan, el pedagogo ---
      alumnos(t, dt, e14, deNoche, madrugada);
      anilloLudus.visible = e14 && ludusAbierto() && listosRo() > 0; if (anilloLudus.visible) anilloLudus.userData.latir(t);
      // --- los romanos del Foro: pasean de día; algunos se sientan con Verrio Flaco, con el maestro de los calculi y, recibido, con Quintiliano ---
      const vis = deNoche ? 0 : Math.min(S.alumnos, 12), plan = [], planM = [];
      corros.forEach((sitios, c) => { const ok = c === 2 ? e14 && estadoPensador('quintiliano') === 2 && !qCamino : [2, 4][c] < S.docentes; if (!ok) return; for (const s of sitios.slice(0, c === 2 ? 7 : 4)) { if (plan.length >= vis) break; plan.push(s); planM.push(c); } });
      const quien = c => c === 2 ? 'Quintiliano' : LEX().nombres[[2, 4][c]];
      aprendices.paso(t, dt, vis, { asiento: deNoche ? () => null : i => plan[i] || null, mira: L.FORO }, a => ({ k: 'alumno', i: a.i + 3, con: planM[a.i] !== undefined ? quien(planM[a.i]) : undefined }));

      // --- Plinio el Joven: pleitea en la basílica Julia; con la escuela pagada, junto a su arca (pagó un tercio de la escuela de Como) ---
      if (ver(plinio, e14 && !deNoche)) {
        const conArca = escuelaPagada(), q = PLINIO_EN[conArca ? 1 : 0];
        ubicar(plinio, q.x, q.y, conArca ? { x: L.PAGADA.x, y: L.PAGADA.y } : { x: q.x + 1, y: q.y + 0.6 }); plinio.e.pose = 'narrar'; animar(plinio, t, dt);
        tocP(q.x, q.y, { k: conArca ? 'saturnoRo' : 'basilicaRo' }, plinio);
      }

      // --- Quintiliano: llega de Hispania por el camino del este con su mula, espera y, recibido, va a enseñar entre las escuelas ---
      const estQ = e14 ? estadoPensador('quintiliano') : 0;
      if (estQ === 1 && qAntes !== 1) qT0 = qAntes === -1 || !nacimientosVivos ? t - 99 : t;
      if (estQ === 2 && qAntes === 1 && nacimientosVivos) qCamino = { cola: mo.caminos.ruta({ x: L.ESPERA_QUINTILIANO.x, z: L.ESPERA_QUINTILIANO.y }, { x: L.LUGAR_QUINTILIANO.x, z: L.LUGAR_QUINTILIANO.y }), x: L.ESPERA_QUINTILIANO.x, z: L.ESPERA_QUINTILIANO.y };
      qAntes = estQ;
      const uQ = Math.min(1, (t - qT0) / 6), kQ = smooth(uQ);
      mula.visible = e14 && estQ === 1;
      if (mula.visible) { const mx = ENTRADA_QUINTILIANO.x + 0.3 + (L.ESPERA_QUINTILIANO.x + 0.42 - ENTRADA_QUINTILIANO.x - 0.3) * kQ, mz = ENTRADA_QUINTILIANO.y - 0.12 + (L.ESPERA_QUINTILIANO.y - 0.1 - ENTRADA_QUINTILIANO.y + 0.12) * kQ; mula.position.set(mx, 0, mz); mula.rotation.y = -Math.PI / 2; opacidad(mula, Math.min(1, uQ * 4)); }
      if (ver(quint, e14 && estQ >= 1)) {
        let px, pz, anda = false, mira;
        if (estQ === 1) { px = ENTRADA_QUINTILIANO.x + (L.ESPERA_QUINTILIANO.x - ENTRADA_QUINTILIANO.x) * kQ; pz = ENTRADA_QUINTILIANO.y + (L.ESPERA_QUINTILIANO.y - ENTRADA_QUINTILIANO.y) * kQ; anda = uQ < 1; mira = anda ? { x: px - 1, y: pz } : { x: px - 0.6, y: pz + 1 }; opacidad(quint.obj, Math.min(1, uQ * 4)); }
        else {
          px = L.LUGAR_QUINTILIANO.x; pz = L.LUGAR_QUINTILIANO.y; mira = { x: px + 0.8, y: pz + 1 };
          if (qCamino) {
            const c = qCamino, d = c.cola[0];
            if (!d) qCamino = null;
            else { const dx = d.x - c.x, dz = d.z - c.z, D = Math.hypot(dx, dz); if (D < 0.05) c.cola.shift(); else { const s = Math.min(D, 0.55 * dt); c.x += dx / D * s; c.z += dz / D * s; } px = c.x; pz = c.z; anda = true; mira = { x: px + dx, y: pz + dz }; }
          }
        }
        ubicar(quint, px, pz, mira); quint.e.pose = anda ? 'andar' : estQ === 2 && !deNoche ? 'narrar' : 'quieto'; animar(quint, t, dt);
        tocP(px, pz, { k: 'pensador', id: 'quintiliano' }, quint);
      }

      // --- la noche: las lámparas del ludus antes del amanecer (y al caer la tarde), las de las ínsulas; en las Saturnales, velas ---
      const n1 = 1 - luz, saturnales = estacion().i === 3, ludusLuz = e14 && oscuro && ludusAbierto() && (madrugada || !deNoche);
      lamparas.forEach((q, i) => { const ll = q.l.userData.llama, on = q.ludus ? ludusLuz : oscuro; ll.visible = on; if (on) ll.scale.setScalar(1 + 0.15 * Math.sin(t * 11 + i * 1.7)); });
      const pl = ranuras.ludus && ranuras.ludus.P && ranuras.ludus.P.lamparas; if (pl) pl.forEach(ll => { ll.visible = ludusLuz; ll.scale.setScalar(1 + 0.12 * Math.sin(t * 9)); });
      luzLudus.intensity = ludusLuz ? n1 * 2.8 * (0.9 + 0.1 * Math.sin(t * 7)) : 0;
      luzForo.intensity = n1 * 1.6 * (0.9 + 0.1 * Math.sin(t * 6));
      luzSubura.intensity = n1 * (saturnales ? 3.0 : 2.0) * (0.9 + 0.1 * Math.sin(t * 8));
      luzRio.intensity = n1 * 1.3 * (0.9 + 0.1 * Math.sin(t * 5));

      secretoMitreo(t, dt, luz, e14);
      mo.luces(t);
      vivos.forEach(f => f(t, dt));
      return { luz, brasa: 0 };
    }

    /* ---------- el estado de cada saber y los globos: el pase 2D ---------- */
    const ALTO = { 75: 40, 76: 34, 77: 40, 78: 36, 79: 30, 80: 34 };
    const DONDE = { 75: PZ.ANCLAS.ludus, 76: PZ.ANCLAS.calculi, 77: PZ.ANCLAS.grammaticus, 78: PZ.ANCLAS.rhetor, 79: PZ.ANCLAS.pagada, 80: PZ.ANCLAS.institutio };
    function superponer(t) {
      for (const i of [75, 76, 77, 78, 79, 80]) { if (!tiene(i)) continue; const a = DONDE[i], p = P(a.x, a.y, ALTO[i]); estadoTec(i, { x: p.x, y: p.y }, t); }
      if (S.era !== 14) return;
      if (estadoPensador('quintiliano') === 1 && VISITAS.quintiliano && !qCamino) drawGlobo(L.ESPERA_QUINTILIANO.x, L.ESPERA_QUINTILIANO.y, t);
    }

    /* ---------- los rótulos de acción: lo que se toca en Roma ---------- */
    function rotulos(ancla, t, tocarEn) {
      const e14 = S.era === 14, n = e14 && ludusAbierto() ? listosRo() : 0;
      ancla('escuelas', n > 0, L.LUDUS.x, L.LUDUS.y, 56, `las escuelas · ${n} ${n === 1 ? 'listo' : 'listos'}`, 'accion', () => {
        if (!abrirEscuelas()) { const i = (S.alumnosRo || []).findIndex(a => a.p >= PASA_ENTERO && puedePasar(a)); if (i >= 0) pasarAlumno(i); }
      });
      const estQ = e14 ? estadoPensador('quintiliano') : 0;
      ancla('recibir', estQ === 1 && S.apr >= (VISITAS.quintiliano?.costo || 0), L.ESPERA_QUINTILIANO.x, L.ESPERA_QUINTILIANO.y, 52, 'recibir a Quintiliano', 'accion', () => tocarEn(L.ESPERA_QUINTILIANO.x, L.ESPERA_QUINTILIANO.y));
    }

    /* las caras de quienes firman la consejera en esta época */
    const caras = {
      'Plinio': { ...PZ.PLINIO },
      'Quintiliano': { ...PZ.QUINTILIANO },
    };
    return { quieto, nubes, sincronizar, superponer, rotulos, caras, aprendices, get corros() { return corros; }, get alumnosVisibles() { return [...FIG.values()].filter(f => f.p.obj.visible).length; } };
  },
};
