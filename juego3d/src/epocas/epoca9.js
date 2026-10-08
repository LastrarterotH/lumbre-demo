/* ============================================================
   epocas/epoca9
   La Época 9 (Ámsterdam, 1450-1658) sobre el motor 3D. Como las otras: aquí vive lo de ESTA época (el IJ, los canales con
   sus puentes, la casa consistorial que crece con la época, quién está dónde, su año con los canales helados, su noche y
   sus rótulos); el cómo lo pone motor3d.js. El mundo vive en src/amsterdam/. Las anclas de la lógica (la imprenta, la
   fundición, la escuela, la casa del atlas, el aula, el taller del Orbis, el molino de papel) son las del motor (09g).
   LO IMPRESO SE VE: cada tirada de cartillas hace lectores, y los lectores aparecen leyendo en los muelles.
   LA COMPOSICIÓN (la hoja juego3d/bocetos/amsterdam.html, AAAB, 2026-10-04; maqueta en src/amsterdam/maqueta.js): la casa
   consistorial de Van Campen en el Dam, al fondo, que CRECE POR ETAPAS con la época (los pilotes junto a la casa gótica
   vieja, la planta baja entre andamios, el cuerpo entero sin la vieja, que ardió, y la cúpula con Atlas); la torre del
   Westerkerk entre el Keizersgracht y el Prinsengracht; una fila de casas de De Keyser por canal; el tablero B, «gradas»:
   el centro del anillo en la esquina del fondo y los canales cruzando frente a la cámara, con el baluarte y su molino
   de papel al frente.
   ============================================================ */
import * as THREE from 'three';
import { fundir } from '../kit.js';
import * as M from '../mundo.js';
import * as V from '../amsterdam/valle.js';
import * as MON from '../amsterdam/monumentos.js';
import * as PZ from '../amsterdam/piezas.js';
import * as L from '../amsterdam/lugares.js';
import { conActores, pieza } from '../piezas.js';
import { fase, tiene, niv, llave, Z2D } from '../motor3d.js';
import * as SE from '../secretos.js';

/* ---------- dónde está cada cosa (el tablero B del replanteo visual: los canales como gradas) ---------- */
const KERK = { x: L.STADHUIS.x + MON.SV.W / 2 + 0.95, y: L.STADHUIS.y - 0.55 };   // la Iglesia Nueva: viene con el héroe, junto a la casa consistorial
const WAAG = { x: L.STADHUIS.x + MON.SV.W / 2 + 0.85, y: L.STADHUIS.y + MON.SV.D / 2 + 0.95 }, VIEJA = { x: L.STADHUIS.x - MON.SV.W / 2 + 0.8, y: L.STADHUIS.y + MON.SV.D / 2 + 0.8 };
const WESTER = { x: 14.9, y: 5.2, rot: -Math.PI / 2 };   // la torre del Westerkerk entre el Keizersgracht y el Prinsengracht, con su tramo de nave hacia el IJ y la puerta hacia la cámara
const PUERTA_WESTER = { x: WESTER.x, y: WESTER.y + 0.95 * 2.9 / 6 / 2 + 0.01 };
const MOLINO2 = L.polar(L.MURALLA, 24);   // un molino más chico sobre la muralla (el de papel está en el baluarte)
const ESC_MOLINO = 1.5;   // el molino de papel del baluarte, grande: que se lea como silueta al frente (el capuchón a ~2,7, las aspas hasta ~3,7)
const MAESTROS = [{ x: 5.3, y: 8.45 }, { x: 8.7, y: 7.4 }, L.polar(10.3, 58), { x: 3.3, y: 9.9 }, L.polar(15.35, 38)];
const quai = (gi, lado, a) => L.polar(L.GRACHTEN[gi] + lado * (L.ANCHO_GRACHT / 2 + 0.18), a);
const LECTORES = [quai(0, 1, 20), quai(0, -1, 26), quai(0, 1, 46.5), quai(1, 1, 28), quai(1, -1, 22), quai(1, 1, 64), quai(2, -1, 33), quai(2, 1, 41)];   // los que leen en los muelles (lejos de las piezas y de las calles de los puentes)
const RUTAS_FLUYT = [{ t: 'fluit', z: 2.92, x0: 2.4, x1: 17.6, v: 0.05, f: 0 }, { t: 'retour', z: 2.36, x0: 2.4, x1: 17.6, v: 0.032, f: 0.55 }];   // navegan hacia +x: la proa del navío es su +x
/* los tramos de cada canal entre sus puentes (en grados): las barcas y los patinadores van y vuelven por ahí, sin pasar bajo
   un puente ni salir del tablero (del IJ, a los 4°, hasta donde el canal toca el borde del frente) */
const TRAMOS = L.GRACHTEN.map(g => {
  const m = 0.6 / g / L.GRADO, hi = Math.min(84, Math.asin(Math.min(1, 13.8 / g)) / L.GRADO - 2);
  const cortes = [4, ...V.PUENTES.filter(b => b.g === g).map(b => b.p / L.GRADO).sort((a, b) => a - b), hi], out = [];
  for (let k = 0; k + 1 < cortes.length; k++) { const a0 = cortes[k] + (k ? m : 0), a1 = cortes[k + 1] - (k + 2 < cortes.length ? m : 0); if (a1 - a0 > 4) out.push([a0, a1]); }
  return out;
});
const RUTAS_BARCA = [{ g: 0, tr: 2, v: 0.12, f: 0, carga: 'libros' }, { g: 1, tr: 0, v: 0.1, f: 0.4, carga: 'queso' }, { g: 2, tr: 1, v: 0.09, f: 0.7, carga: 'libros' }];
const farolPuente = (gi, a) => { const r = L.GRACHTEN[gi] - L.ANCHO_GRACHT / 2 - 0.2; return L.polar(r, a + 0.3 / r / L.GRADO); };
const FAROLES = [farolPuente(0, 9), farolPuente(0, 49), farolPuente(1, 31), farolPuente(2, 49), { x: 4.4, y: 9.45 }, { x: 7.4, y: 9.4 }];
const ARRIBO = { x: L.ESPERA_COMENIO.x, z: 3.33 };   // donde amarra el barco de Comenio
const GRACHT = L.polar(L.GRACHTEN[1], 60);   // un tramo del Keizersgracht a la vista, para tocar el canal

function reservar() {
  const R = V.RESERVAS; R.length = 0;
  const caja = (x, z, w, d, m = 0.08, extra = {}) => R.push({ x0: x - w / 2 - m, x1: x + w / 2 + m, z0: z - d / 2 - m, z1: z + d / 2 + m, ...extra });
  caja(L.STADHUIS.x, L.STADHUIS.y, MON.SV.W + 0.3, MON.SV.D + 0.3);
  caja(KERK.x, KERK.y - 0.28, 1.45, 3.05);
  caja(WAAG.x, WAAG.y, 1.1, 0.82);
  caja(VIEJA.x, VIEJA.y - 0.02, 2.05, 0.9, 0.08, { vieja: true });   // la casa gótica vieja: solo hasta que arde (etapa 2)
  R.push({ ...V.DAM_RECT, dam: true });
  for (const k of ['tipos', 'prensa', 'cartilla', 'atlas', 'didactica', 'orbis']) { const A = PZ.ANCLAS[k]; R.push({ x: A.x, z: A.y, r: 0.92, pieza: true }); }   // giradas hacia afuera del anillo: un círculo (lo que pisan lo marcan sus huellas)
  caja(WESTER.x, WESTER.y - 0.46, 0.7, 1.55);
  R.push({ x: V.BASTION.x, z: V.BASTION.z, r: 1.45, baluarte: true });
  R.push({ x: MOLINO2.x, z: MOLINO2.y, r: 0.45 });
  MAESTROS.forEach(m => R.push({ x: m.x, z: m.y, r: 0.3, maestro: true }));
  LECTORES.forEach(p => R.push({ x: p.x, z: p.y, r: 0.12, sitio: true }));
}
const smooth = k => k * k * (3 - 2 * k);
/* la casa consistorial crece con la época, como Notre-Dame en París (la obra real duró de 1648 a 1665): el héroe A de la hoja */
const etapaSt = () => { const n = [63, 64, 65, 66, 67, 68].filter(i => fase(i) === 'meseta').length; return n >= 6 ? 3 : n >= 4 ? 2 : n >= 2 ? 1 : 0; };
/* ida y vuelta por un tramo de canal: el ángulo (grados) y hacia dónde va; frena en las puntas para dar la vuelta */
const vaiven = (u, [a0, a1]) => { const w = ((u % 2) + 2) % 2, ida = w < 1, k = ida ? w : 2 - w; return { a: a0 + (a1 - a0) * (0.5 - 0.5 * Math.cos(Math.PI * k)), ida }; };

export default {
  era: 9,
  nombre: 'Ámsterdam',
  piezas: PZ.PIEZAS,
  construir(mo) {
    const { K, raiz, dyn, vivos, ranura, ranuras, persona, ubicar, ver, animar, opacidad, tocP } = mo;
    const oficio = (i, f) => conActores(fase(i) === 'meseta', f);
    reservar(); L.verificarEspejo();

    /* ---------- la ciudad: lo quieto se funde; el suelo y el agua se repintan con el año ---------- */
    const suelo = V.suelo(K), agua = V.agua(K, vivos), casas = V.casas(K);
    for (const [cx, cz] of casas.userData.puestas) V.RESERVAS.push({ x: cx, z: cz, r: 0.42, casa: true });
    const veg = V.vegetacion(K, vivos);
    const quieto = new THREE.Group();
    quieto.add(V.losa(K), casas, veg.g, V.puentes(K));
    const wt = MON.segunda(K, MON.VARIANTES.segunda); wt.position.set(WESTER.x, 0, WESTER.y); wt.rotation.y = WESTER.rot; quieto.add(wt);
    /* el baluarte que apunta a la cámara, con sus árboles; el molino va aparte porque gira */
    const bal = MON.baluarte(K, { esc: V.BASTION.esc, foso: false }); bal.position.set(V.BASTION.x, 0, V.BASTION.z); bal.rotation.y = V.BASTION.rot; quieto.add(bal);
    const cima = bal.userData.cima;
    [[-0.92, -0.62, 0.62], [0.92, -0.6, 0.7], [0.05, 1.08, 0.55]].forEach(([lx, lz, h], k) => { const q = V.enBastion(lx, lz), t = MON.iep(K, h, 40 + k); t.position.set(q.x, cima, q.z); quieto.add(t); });
    fundir(K, quieto);
    raiz.add(suelo, agua.g, quieto);
    const mPapel = MON.molinoGrande(K); mPapel.scale.setScalar(ESC_MOLINO); { const q = V.enBastion(0, -0.1); mPapel.position.set(q.x, cima, q.z); } mPapel.rotation.y = V.BASTION.rot + 0.35; dyn.add(mPapel);
    const resmas = new THREE.Group(); { const q = V.enBastion(0.45, -1.15); resmas.position.set(q.x, 0, q.z); resmas.rotation.y = V.BASTION.rot; } dyn.add(resmas);   // las resmas al pie, adentro de la muralla
    for (let k = 0; k < 3; k++) { const r = K.malla(K.caja(0.18, 0.014, 0.13), '#fffaf0', { grosor: 0.0012 }); r.position.set(0, 0.008 + k * 0.015, 0); r.rotation.y = k * 0.25; resmas.add(r); }
    const m2 = MON.molinoGrande(K); m2.scale.setScalar(0.62); m2.position.set(MOLINO2.x, V.altura(MOLINO2.x, MOLINO2.y), MOLINO2.y); m2.rotation.y = Math.PI / 4 + 0.5; dyn.add(m2);
    const molinos = [mPapel, m2], MOLINOS = [{ x: mPapel.position.x, y: mPapel.position.z, papel: true }, { x: MOLINO2.x, y: MOLINO2.y }];
    const nubes = M.nubes(K, vivos); raiz.add(nubes.g);
    const luciernagas = M.luciernagas(vivos); raiz.add(luciernagas);
    const luzDam = new THREE.PointLight('#ffb35c', 0, 6, 1.5); luzDam.position.set(L.DAM.x, 1.1, 8.9); raiz.add(luzDam);
    const qC = L.polar(11.8, 40), luzCanales = new THREE.PointLight('#ffae5a', 0, 7, 1.6); luzCanales.position.set(qC.x, 1.1, qC.y); raiz.add(luzCanales);
    const luzPrensa = new THREE.PointLight('#ffb35c', 0, 3.5, 1.6); luzPrensa.position.set(L.PRENSA.x, 0.8, L.PRENSA.y + 0.3); raiz.add(luzPrensa);
    const qO = L.polar(11.2, 70), luzOeste = new THREE.PointLight('#ffae5a', 0, 6, 1.6); luzOeste.position.set(qO.x, 1.0, qO.y); raiz.add(luzOeste);
    const faroles = FAROLES.map(Q => { const l = PZ.farol(K); l.position.set(Q.x, 0, Q.y); dyn.add(l); return { ...Q, l }; });

    /* ---------- el agua: los barcos del IJ, las barcas de los canales; en invierno, los patinadores ---------- */
    const fluyts = RUTAS_FLUYT.map(r => { const b = MON.navio(K, r.t); b.userData.vivo = true; dyn.add(b); return { ...r, b }; });
    const boeier = MON.navio(K, 'boeier'); boeier.position.set(9.0, V.NIVEL + 0.02, 3.3); boeier.rotation.y = 0.25; boeier.userData.vivo = true; dyn.add(boeier);   // un yate amarrado detrás de la Iglesia Nueva
    const barcas = RUTAS_BARCA.map(r => { const b = MON.barca(K, { carga: r.carga }), tr = TRAMOS[r.g][Math.min(r.tr, TRAMOS[r.g].length - 1)]; b.userData.vivo = true; dyn.add(b); return { ...r, b, tr, u: r.f, largo: (tr[1] - tr[0]) * L.GRADO * L.GRACHTEN[r.g] }; });
    const barcoComenio = MON.navio(K, 'fluit'); barcoComenio.userData.vivo = true; barcoComenio.scale.setScalar(0.7); dyn.add(barcoComenio);
    const patinadores = [0, 1, 2, 3, 4, 5].map(i => persona({ ...PZ.nino(i + 3), edad: i % 3 === 0 ? undefined : 'nino' }, { pose: 'andar' }));

    /* ---------- el año de Ámsterdam (ESTACIONES_AMSTERDAM del motor): los tulipanes, los barcos, el arenque, el hielo ---------- */
    let pasoVestido = -1, hielo = 0;
    function vestir() {
      const e = mo.estacionHoy();
      if (e.paso === pasoVestido) return; pasoVestido = e.paso;
      const k = e.k || 0, sig = e.sig || e, j = sig.i ?? ((e.i + 1) % 4);
      const nieve = (e.nieve || 0) * (1 - k) + (sig.nieve || 0) * k;
      hielo = (e.hielo || 0) * (1 - k) + (sig.hielo || 0) * k;
      suelo.userData.pintar({ i: e.i, j, k, nieve });
      veg.vestir(e.i, k, j);
      agua.helar(hielo);
      const cr = (e.crecida || 1) + ((sig.crecida || 1) - (e.crecida || 1)) * k;
      agua.rio.position.y = V.NIVEL + (cr - 1) * 0.08;
    }

    /* ---------- los que siempre están ---------- */
    const guias = [0, 1, 2, 3, 4].map(i => persona(i === 0 ? { ...PZ.BLAEU } : i === 2 ? { ...PZ.MAESTRA } : { ...PZ.IMPRESOR, piel: [0, 1, 0, 2][i - 1], colorPelo: ['#5a3a24', '#2a1f18', '#7a5a34', '#3a2a1e'][i - 1] }, { pose: 'narrar' }));
    const lectores = LECTORES.map((_, i) => persona({ ...PZ.nino(i + 6) }, { pose: 'leer' }));
    const libros = LECTORES.map(() => { const b = K.malla(K.caja(0.07, 0.012, 0.05), '#f8f4ea', { grosor: 0.001 }); return b; });
    lectores.forEach((p, i) => p.sostener?.(libros[i], 'D'));
    const comenio = persona({ ...PZ.COMENIO }, { pose: 'quieto' });
    const baul = K.malla(K.caja(0.16, 0.1, 0.1), '#5a3a24', { grosor: 0.002 }); dyn.add(baul);
    let comAntes = -1, comCamino = null;
    const anilloPrensa = SE.ondas(2, 0.6, '#ffd76a'); anilloPrensa.position.set(L.PRENSA.x, 0.02, L.PRENSA.y); dyn.add(anilloPrensa);
    const aprendices = mo.paseantes(18, { opciones: i => PZ.nino(i), inicio: i => ({ x: 5.0 + (i % 5) * 0.3, z: 8.75 + Math.floor(i / 5) * 0.15 }), semilla: 1658 });

    /* ---------- por dónde se camina: la ciudad adentro de la muralla, cruzando los canales por sus puentes; el agua no ---------- */
    const enRect = (x, z, r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
    const PASO = 0.25, X0 = 2.1, NC = Math.ceil((17.9 - X0) / PASO);   // la grilla de caminos.js
    let claveObst = '', corros = [];
    function rehacerPaso() {
      const conVieja = etapaSt() < 2;
      const RECTS = V.RESERVAS.filter(r => r.x0 !== undefined && !r.dam && !r.pieza && (conVieja || !r.vieja));
      const circulos = [...V.RESERVAS.filter(r => r.r && !r.maestro && !r.sitio && !r.casa && !r.baluarte && !r.pieza).map(r => ({ x: r.x, z: r.z, r: r.r * 0.85 })), ...faroles.map(Q => ({ x: Q.x, z: Q.y, r: 0.08 }))];
      const base = (x, z) => (V.altura(x, z) < -0.03 && !V.hayPuente(x, z)) || RECTS.some(r => enRect(x, z, r)) || V.enMuro(x, z) || V.enBaluarte(x, z, 1.05) || V.fuera(x, z) || V.enCasa(x, z, 0.1) || x < 2.25 || z < 2.25 || x > 17.75 || z > 17.75;
      mo.rehacerCaminos({ circulos, bloquea: base });
      /* las islas: lo libre que no se alcanza desde el Dam (un patio entre piezas sin puente) se cierra, para que nadie quiera ir y cruce el agua */
      const C = mo.caminos, celda = (i, j) => C.libre(X0 + (i + 0.5) * PASO, X0 + (j + 0.5) * PASO), visto = new Uint8Array(NC * NC);
      const i0 = Math.floor((L.DAM.x - X0) / PASO), j0 = Math.floor((L.DAM.y + 0.3 - X0) / PASO), cola = [[i0, j0]]; visto[i0 * NC + j0] = 1;
      while (cola.length) { const [i, j] = cola.pop(); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= NC || b >= NC || visto[a * NC + b] || !celda(a, b)) continue; visto[a * NC + b] = 1; cola.push([a, b]); } }
      const islas = new Set(); for (let i = 0; i < NC; i++) for (let j = 0; j < NC; j++) if (!visto[i * NC + j] && celda(i, j)) islas.add(i * NC + j);
      if (islas.size) mo.rehacerCaminos({ circulos, bloquea: (x, z) => base(x, z) || islas.has(Math.floor((x - X0) / PASO) * NC + Math.floor((z - X0) / PASO)) });
      aprendices.rehacer();
      const usados = [];
      corros = MAESTROS.map(m => buscarAsientos(m, 9, usados));
    }
    const ocupadoSitio = (x, z) => V.RESERVAS.some(r => !r.dam && !r.maestro && !r.sitio && (r.r ? Math.hypot(x - r.x, z - r.z) < r.r + 0.03 : x > r.x0 - 0.03 && x < r.x1 + 0.03 && z > r.z0 - 0.03 && z < r.z1 + 0.03));
    function buscarAsientos(m, cupo, usados) {
      const cand = [];
      for (const r of [0.5, 0.8]) for (let k = 0; k < 18; k++) { const a = Math.PI / 4 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (0.4 / r); cand.push({ x: m.x + Math.cos(a) * r, z: m.y + Math.sin(a) * r, d: Math.ceil(k / 2) * 0.4 / r + r * 0.6 }); }
      cand.sort((u, v) => u.d - v.d);
      const lista = [];
      for (const c of cand) {
        if (lista.length >= cupo) break;
        if (!mo.caminos.libre(c.x, c.z) || V.altura(c.x, c.z) < -0.02 || ocupadoSitio(c.x, c.z)) continue;
        if (usados.some(u => Math.hypot(u.x - c.x, u.z - c.z) < 0.28)) continue;
        const q = { x: c.x, z: c.z, mira: { x: m.x, y: m.y } }; lista.push(q); usados.push(q);
      }
      return lista;
    }

    /* ---------- EL SECRETO DE LA ÉPOCA: en invierno, de noche, el cartel de la rosa y la cruz clavado en la puerta de la iglesia del oeste ---------- */
    const secretoRosacruz = (() => {
      const x = PUERTA_WESTER.x, z = PUERTA_WESTER.y;   // la puerta de la torre que mira a la cámara: el cartel, clavado al lado
      const ca = SE.cartelRosacruz(K); ca.position.set(x + 0.135, -0.04, z + 0.003); dyn.add(ca);
      const ch = SE.chispitas(6, 0.18, 0.45); ch.position.set(x, 0.05, z + 0.05); dyn.add(ch);
      const luzR = new THREE.PointLight('#ffcf7a', 0, 1.8, 1.6); luzR.position.set(x + 0.2, 0.5, z + 0.25); raiz.add(luzR);
      const hombre = persona({ ...PZ.IMPRESOR, colorRopa: '#1e1c22', chal: '#1e1c22', bonete: '#1a1814' }, { pose: 'quieto' });
      ubicar(hombre, x + 0.22, z + 0.2, { x, y: z });
      return (t, dt, luz, on) => {
        const ve = on && luz < 0.4 && estacion().i === 3;
        ca.visible = ve; ch.visible = ve && !secretoHallado('rosacruz');
        if (ver(hombre, ve)) animar(hombre, t, dt);
        luzR.intensity = ve ? 0.9 + 0.2 * Math.sin(t * 7) : 0;
        if (!ve) return;
        ch.userData.titilar(t);
        tocable(x, z, { k: 'secreto', id: 'rosacruz', x, y: z }, { rx: 20, ry: 16, dy: 12 });
      };
    })();

    /* ---------- cada cuadro ---------- */
    function sincronizar(t, dt) {
      const e9 = S.era === 9, luz = luzDia(), noche = nocheCasa(), deNoche = noche > 0.5;
      vestir();
      const lk = Math.max(0, Math.min(1, (0.55 - luz) / 0.25));
      luciernagas.userData.k = estacion().i === 1 ? lk * lk * (3 - 2 * lk) * 0.3 : 0; luciernagas.visible = luciernagas.userData.k > 0.01;

      // --- las ranuras de los saberes, y la casa consistorial que crece con la época ---
      ranura('tipos', tiene(63) ? llave(63) : null, () => oficio(63, () => PZ.tipos(K, niv(63))));
      ranura('prensa', tiene(64) ? llave(64) : null, () => oficio(64, () => PZ.prensa(K, niv(64))));
      ranura('cartilla', tiene(65) ? llave(65) : null, () => oficio(65, () => PZ.cartilla(K, niv(65))));
      ranura('atlas', tiene(66) ? llave(66) : null, () => oficio(66, () => PZ.atlas(K, niv(66))));
      ranura('didactica', tiene(67) ? llave(67) : null, () => oficio(67, () => PZ.didactica(K, niv(67))));
      ranura('orbis', tiene(68) ? llave(68) : null, () => oficio(68, () => PZ.orbis(K, niv(68))));
      const eSt = etapaSt();
      ranura('stadhuis', eSt, () => {   // el héroe por etapas, con la Iglesia Nueva, el Peso y (hasta que arde) la casa vieja: cada edificio se funde aparte, para que su huella sea la suya y no tape el Dam
        const P = pieza(L.STADHUIS), st = MON.heroe(K, MON.VARIANTES.heroe, eSt, { plaza: false });
        P.obj.add(st); st.children.forEach(c => fundir(K, c, 0.012)); return P;
      });
      const clave = mo.claveRanuras() + '|' + S.docentes;
      if (clave !== claveObst) { claveObst = clave; rehacerPaso(); }
      mo.animarRanuras(t, dt);

      // --- los tocables: las piezas y el mundo ---
      for (const r of Object.values(ranuras)) if (r.P && r.P.toc) for (const q of r.P.toc) tocP(q.x, q.y, { k: q.k }, q.p);
      tocable(L.STADHUIS.x, L.STADHUIS.y, { k: 'stadhuis' }, { rx: 90, ry: 48, dy: 52 });
      tocable(L.DAM.x, L.DAM.y + 0.3, { k: 'dam' }, { rx: 46, ry: 14, dy: 0 });
      tocable(KERK.x, KERK.y, { k: 'kerk' }, { rx: 30, ry: 18, dy: 26 });
      tocable(WESTER.x, WESTER.y - 0.3, { k: 'wester' }, { rx: 22, ry: 18, dy: 48 });
      tocable(14.5, 3.0, { k: 'ij' }, { rx: 50, ry: 20, dy: 0 });
      tocable(GRACHT.x, GRACHT.y, { k: 'gracht' }, { rx: 18, ry: 10, dy: 0 });
      MOLINOS.forEach(m => tocable(m.x, m.y, { k: m.papel ? 'molinoAm' : 'murallaAm' }, m.papel ? { rx: 30, ry: 22, dy: 56 } : { rx: 18, ry: 16, dy: 26 }));

      // --- el agua: los fluyts del IJ, las barcas de los canales (en invierno, quietas) y los patinadores sobre el hielo ---
      const yAgua = agua.rio.position.y;
      fluyts.forEach(q => {
        const u = ((t * q.v / (q.x1 - q.x0) * 10) + q.f) % 1, x = q.x0 + (q.x1 - q.x0) * u;
        q.b.position.set(x, yAgua + 0.02 + 0.006 * Math.sin(t * 1.1 + q.f * 9), q.z); q.b.rotation.y = 0; q.b.rotation.x = 0.02 * Math.sin(t * 0.9 + q.f);   // van hacia +x, con la proa adelante
        q.b.visible = e9 && hielo < 0.5; if (q.b.visible) { opacidad(q.b, Math.min(1, u / 0.05, (1 - u) / 0.05)); tocable(x, q.z, { k: 'barcoAm' }, { rx: 30, ry: 16, dy: 20 }); }
      });
      barcas.forEach(q => {   // de punta a punta de su tramo, con el botero atrás; en invierno quedan quietas en el hielo
        if (hielo < 0.5) q.u += dt * q.v / q.largo;
        const { a, ida } = vaiven(q.u, q.tr), A = a * L.GRADO, p = L.polar(L.GRACHTEN[q.g], a);
        q.b.position.set(p.x, yAgua + 0.01, p.y); q.b.rotation.y = ida ? Math.atan2(Math.cos(A), Math.sin(A)) : Math.atan2(-Math.cos(A), -Math.sin(A));   // la proa es su -x
        q.b.visible = e9;
      });
      patinadores.forEach((p, i) => {   // en invierno, de día: van y vuelven por los tramos de los canales helados
        if (!ver(p, e9 && hielo > 0.5 && luz > 0.3)) return;
        const gi = i % 3, tr = TRAMOS[gi][Math.floor(i / 3) % TRAMOS[gi].length], g = L.GRACHTEN[gi] + (i % 2 ? 0.12 : -0.12);
        const { a, ida } = vaiven(t * 0.25 / ((tr[1] - tr[0]) * L.GRADO * g) + i * 0.37, tr), A = a * L.GRADO, q = L.polar(g, a), s = ida ? 1 : -1;
        ubicar(p, q.x, q.y, { x: q.x - Math.sin(A) * s, y: q.y + Math.cos(A) * s }, yAgua + 0.02); p.e.pose = 'andar'; animar(p, t, dt);
      });
      molinos.forEach((m, i) => { if (m.userData.aspas) m.userData.aspas.rotation.z = -t * (0.6 + i * 0.1); });

      // --- la prensa: si está quieta o su mercado se llenó, la imprenta pide atención ---
      const F = e9 ? S.forma : null;
      anilloPrensa.visible = e9 && prensaAbierta() && (!F || (F.fase === 'tirar' && (S.demanda[F.o] ?? 1) < 0.3)); if (anilloPrensa.visible) anilloPrensa.userData.latir(t);

      // --- los maestros; los lectores que hacen las cartillas, leyendo en los muelles ---
      const vis = Math.min(S.alumnos, 18);
      const cupos = [Math.min(9, BALANCE.ratioDocente + palestraSitio()), ...[1, 2, 3, 4].map(k => k < S.docentes ? Math.min(9, cupoGuia(k) + palestraSitio()) : 0)];
      const plan = [], planM = [];
      corros.forEach((sitios, m) => { for (let j = 0; j < Math.min(cupos[m] || 0, sitios.length) && plan.length < vis; j++) { plan.push(sitios[j]); planM.push(m); } });
      guias.forEach((p, i) => {
        if (!ver(p, i === 0 ? S.docentes >= 1 : i < S.docentes)) return;
        const m = MAESTROS[i]; ubicar(p, m.x, m.y, { x: m.x + 1, y: m.y + 1 });
        p.e.pose = deNoche ? 'quieto' : 'narrar'; animar(p, t, dt); tocP(m.x, m.y, { k: 'docente', i }, p);
      });
      const nLec = e9 ? Math.min(LECTORES.length, Math.floor((S.lectores || 0) / 15)) : 0;
      lectores.forEach((p, i) => { const q = LECTORES[i]; if (ver(p, i < nLec && !deNoche)) { ubicar(p, q.x, q.y, { x: q.x + 0.5, y: q.y + 1 }); p.e.pose = 'leer'; animar(p, t, dt); tocP(q.x, q.y, { k: 'alumno', i: 40 + i }, p); } });
      const maestro = m => LEX().nombres[m % LEX().nombres.length];
      aprendices.paso(t, dt, deNoche ? 0 : vis, { asiento: deNoche ? () => null : i => plan[i] || null, mira: MAESTROS[1] }, a => ({ k: 'alumno', i: a.i, con: deNoche ? undefined : planM[a.i] !== undefined ? maestro(planM[a.i]) : null }));

      // --- Comenio: llega en barco al muelle del IJ con su baúl, espera y, recibido, cruza los canales hasta el aula ---
      const estC = e9 ? estadoPensador('comenio') : 0;
      if (estC !== comAntes && comAntes !== -1 && estC === 2 && nacimientosVivos) comCamino = { cola: mo.caminos.ruta({ x: L.ESPERA_COMENIO.x, z: L.ESPERA_COMENIO.y }, { x: L.LUGAR_COMENIO.x, z: L.LUGAR_COMENIO.y }), pos: { x: L.ESPERA_COMENIO.x, z: L.ESPERA_COMENIO.y } };
      if (estC === 1 && comAntes !== 1) barcoComenio.userData.t0 = t;
      comAntes = estC;
      const u = Math.min(1, (t - (barcoComenio.userData.t0 || 0)) / 7), kB = estC === 2 ? 1 : smooth(u);
      barcoComenio.visible = e9 && estC >= 1 && hielo < 0.5;
      if (barcoComenio.visible) { barcoComenio.position.set(17.6 + (ARRIBO.x - 17.6) * kB, yAgua + 0.02, ARRIBO.z); barcoComenio.rotation.y = Math.PI; opacidad(barcoComenio, Math.min(1, u / 0.15 + (estC === 2 ? 1 : 0))); }
      baul.visible = e9 && estC === 1 && u >= 1; if (baul.visible) baul.position.set(L.ESPERA_COMENIO.x + 0.18, 0.05, L.ESPERA_COMENIO.y + 0.05);
      if (ver(comenio, estC >= 1 && (estC === 2 || u >= 1))) {
        const L0 = estC === 1 ? L.ESPERA_COMENIO : L.LUGAR_COMENIO;
        let px = L0.x, pz = L0.y, anda = false, mira = estC === 1 ? { x: L0.x + 0.4, y: L0.y + 1 } : { x: PZ.ANCLAS.didactica.x, y: PZ.ANCLAS.didactica.y + 0.3 };
        if (comCamino) {
          const c = comCamino, d = c.cola[0];
          if (!d) comCamino = null;
          else { const dx = d.x - c.pos.x, dz = d.z - c.pos.z, D = Math.hypot(dx, dz); if (D < 0.05) c.cola.shift(); else { const s = Math.min(D, 0.55 * dt); c.pos.x += dx / D * s; c.pos.z += dz / D * s; } px = c.pos.x; pz = c.pos.z; anda = true; mira = { x: px + dx, y: pz + dz }; }
        }
        ubicar(comenio, px, pz, mira); comenio.e.pose = anda ? 'andar' : estC === 2 && !deNoche ? 'narrar' : 'quieto'; animar(comenio, t, dt);
        tocP(px, pz, { k: 'pensador', id: 'comenio' }, comenio);
      }

      // --- la noche: los faroles de los puentes, las ventanas del Dam y de los canales, la prensa que sigue tirando ---
      const oscuro = luz < 0.5, n1 = 1 - luz;
      faroles.forEach(Q => { const ll = Q.l.userData.llama; ll.visible = oscuro; ll.scale.setScalar(1 + 0.15 * Math.sin(t * 11 + Q.x)); });
      luzDam.intensity = n1 * 2.4 * (0.9 + 0.1 * Math.sin(t * 7));
      luzCanales.intensity = n1 * 2.6 * (0.9 + 0.1 * Math.sin(t * 6));
      luzPrensa.intensity = n1 * (F && F.fase === 'tirar' ? 2.6 : 1.0) * (0.9 + 0.1 * Math.sin(t * 9));
      luzOeste.intensity = n1 * 1.8 * (0.9 + 0.1 * Math.sin(t * 8));

      secretoRosacruz(t, dt, luz, e9);
      mo.luces(t);
      vivos.forEach(f => f(t, dt));
      return { luz, brasa: 0 };
    }

    /* ---------- el estado de cada saber y los globos: el pase 2D ---------- */
    const ALTO = { 63: 42, 64: 50, 65: 40, 66: 40, 67: 44, 68: 40 };   // sobre las piezas, que crecieron (PZ.ESCALAS)
    const DONDE = { 63: PZ.ANCLAS.tipos, 64: PZ.ANCLAS.prensa, 65: PZ.ANCLAS.cartilla, 66: PZ.ANCLAS.atlas, 67: PZ.ANCLAS.didactica, 68: PZ.ANCLAS.orbis };
    function superponer(t) {
      for (const i of [63, 64, 65, 66, 67, 68]) { if (!tiene(i)) continue; const a = DONDE[i], p = P(a.x, a.y, ALTO[i]); estadoTec(i, { x: p.x, y: p.y }, t); }
      if (S.era !== 9) return;
      if (estadoPensador('comenio') === 1 && VISITAS.comenio && !comCamino) drawGlobo(L.ESPERA_COMENIO.x, L.ESPERA_COMENIO.y, t);
    }

    /* ---------- los rótulos de acción: lo que se toca en Ámsterdam ---------- */
    function rotulos(ancla, t, tocarEn) {
      const e9 = S.era === 9, F = S.forma;
      const pide = e9 && prensaAbierta() && (!F || (F.fase === 'tirar' && (S.demanda[F.o] ?? 1) < 0.3) ||   // sin papel no se pide componer: falta recoger pliegos (lo dice la consejera)
         Object.keys(OBRAS_AM).some(k => obraAbierta(k) && !(S.obrasVistas || []).includes(k)));   // una obra recién abierta llama hasta que se mira la imprenta
      ancla('componer', pide, L.PRENSA.x, L.PRENSA.y, 58, F ? 'componer otra cosa' : 'componer', 'accion', () => { if (!abrirComponer()) componer('almanaque'); });
      const estC = e9 ? estadoPensador('comenio') : 0;
      ancla('recibir', estC === 1 && S.apr >= (VISITAS.comenio?.costo || 0), L.ESPERA_COMENIO.x, L.ESPERA_COMENIO.y, 52, 'recibir a Comenio', 'accion', () => tocarEn(L.ESPERA_COMENIO.x, L.ESPERA_COMENIO.y));
    }

    /* las caras de quienes firman la consejera en esta época */
    const caras = {
      'Blaeu': { ...PZ.BLAEU },
      'Comenio': { ...PZ.COMENIO },
    };
    return { quieto, nubes, sincronizar, superponer, rotulos, caras, aprendices, get corros() { return corros; } };
  },
};
