/* ============================================================
   epocas/epoca21
   La última época del viaje (el futuro: hoy y lo que viene, en el valle del principio; docs/era21-plan.md) sobre el
   motor 3D. Como las otras: aquí vive lo de ESTA época (quién está dónde, su año, su noche y sus rótulos); el cómo lo pone
   motor3d.js. El mundo es el valle de la Época 1 (mundo.js: el suelo, la losa, la laguna, la cueva y sus árboles) con lo
   de hoy encima (src/futuro/: las piezas grandes y las casas en monumentos.js, los seis saberes por etapas en piezas.js,
   las anclas en lugares.js, espejo de 09k-futuro del motor).
   LA COMPOSICIÓN (la hoja juego3d/bocetos/futuro.html, «BACA», 2026-10-07): la escuela en anillo alrededor del círculo de
   piedras del fogón, abierta hacia el valle (la escuela del valle, 87, crece por etapas: el tramo del fondo, el anillo,
   la biblioteca, la linterna); la cueva pintada con su pasarela; la laguna con su muelle; las casas redondas de tierra con
   techo de pasto; la niebla en los bordes, más espesa en la esquina del fondo, junto al mirador.
   LA RESPUESTA O LA PREGUNTA SE VE: cada estudiante de S.dudasFu es una persona con su chispa azul (la IA). Llegan de las
   casas (o de la parada, los de lejos) y esperan en el patio, junto al fuego. Si la IA responde, la chispa se enciende con
   su «!» y el estudiante se va con la tarea hecha; si pregunta, la chispa lleva su «?» y el estudiante camina pensando
   hasta el claro de las preguntas, se sienta en un tocón y, cuando entiende, salta con su «!». De noche el fuego del
   círculo de piedras se enciende otra vez, la linterna de la biblioteca y el faro del mirador también. Bloom llega en el
   bus, por la parada. Al final (la época ganada), de noche, la Abuela de la Época 1 vuelve al fogón y el valle se sienta
   a escucharla. El secreto: los discos del Ars Magna de Llull, en la boca de la cueva, las noches de invierno.
   ============================================================ */
import * as THREE from 'three';
import { PAL, fundir } from '../kit.js';
import * as M from '../mundo.js';
import * as KM from '../futuro/monumentos.js';
import * as PZ from '../futuro/piezas.js';
import * as L from '../futuro/lugares.js';
import { conActores } from '../piezas.js';
import { fase, tiene, niv, llave } from '../motor3d.js';
import * as SE from '../secretos.js';
import { INVITADOS, fiestaActiva, fiestaRecien, seguirFiesta } from '../fiesta.js';

/* ---------- dónde está cada cosa ---------- */
const PIEZA = id => PZ.PIEZAS.find(p => p.id === id);
const IDS = { 87: 'escuela', 88: 'tutor', 89: 'llegada', 90: 'biblioteca', 91: 'examen', 92: 'mirador' };
const ANCLA = { 87: L.ESCUELA, 88: L.TUTOR, 89: L.LLEGADA, 90: L.BIBLIOTECA, 91: L.EXAMEN, 92: L.MIRADOR };
/* las maestras y los maestros (LEX().nombres del valle), cada uno junto a su saber, del lado de adelante */
const MAESTROS = [{ x: 7.55, y: 10.65 }, { x: L.TUTOR.x + 0.55, y: L.TUTOR.y - 0.45 }, { x: L.LLEGADA.x + 0.55, y: L.LLEGADA.y - 0.55 },
  { x: L.BIBLIOTECA.x - 0.2, y: L.BIBLIOTECA.y + 0.75 }, { x: L.EXAMEN.x - 0.35, y: L.EXAMEN.y + 0.8 }, { x: L.MIRADOR.x + 0.85, y: L.MIRADOR.y + 0.8 }];
const ENTRADA_BUS = { x: 8.4, y: 17.85 };            // el borde del frente, por donde baja el camino (y llega el bus)
const LLEGA_LEJOS = { x: L.LLEGADA.x + 0.2, y: L.LLEGADA.y - 0.5 };
const CASAS_PUERTAS = L.CASAS.map(([x, z]) => ({ x, z: z - 0.9 }));   // de dónde salen y adónde vuelven los del valle
const SECRETO_ARS = { x: 8.75, y: 7.55 };             // en la boca de la cueva, junto al final de la pasarela
const OP_BLOOM = { piel: 0, pelo: 'corto', colorPelo: '#c9c2b6', colorRopa: '#4a5466', sinFlecos: true, pantalon: '#4a5466', zapato: '#2a2422' };
const OP_ABUELA = { edad: 'anciana', piel: 0, pelo: 'moño', ropa: 'traje', colorRopa: '#8a7055', chal: PAL.chal };
const OP_LLULL = { piel: 1, pelo: 'rapado', ropa: 'tunica', colorRopa: '#6a5a48', orla: '#4a3e30', barba: '#d8d2c4', sinFlecos: true };
const EXTRAS_ANO = {
  primavera: { pinoM: '#5c8c40', pinoL: '#7fae59' }, verano: { pinoM: '#5c8c40', pinoL: '#7fae59' },
  'otoño': { pinoM: '#557f3c', pinoL: '#76a052' }, invierno: { pinoM: '#4a6350', pinoL: '#6d8574' },
};
const gente = (i, extra = {}) => ({ ...KM.GENTE_HOY[i % KM.GENTE_HOY.length], ...(i % 7 === 3 ? { colorRopa: '#d9643a' } : i % 7 === 5 ? { colorRopa: '#7a6aa8' } : {}), ...extra });
const deLejos = i => gente(i + 2, { piel: [3, 2, 1, 3][i % 4], colorRopa: ['#c64a30', '#2f8f7a', '#e0b44a', '#3a5a8a'][i % 4] });
/* las casas redondas de cada grupo, en el mundo: [x, z, r] (las del molde de casasRedondas, giradas) */
function circulosCasas() {
  const out = [];
  for (const [cx, cz, ry] of L.CASAS) for (const [x, z, r] of [[-1.25, -0.35, 0.6], [0.25, -0.5, 0.7], [1.55, 0.2, 0.55], [-0.45, 0.55, 0.15], [0.8, 0.75, 0.45]]) {
    const c = Math.cos(ry), s = Math.sin(ry); out.push({ x: cx + x * c + z * s, z: cz - x * s + z * c, r });
  }
  return out;
}

export default {
  era: 21,
  nombre: 'El valle de hoy',
  piezas: PZ.PIEZAS,
  construir(mo) {
    const { K, raiz, dyn, vivos, ranura, ranuras, persona, ubicar, ver, animar, opacidad, tocP } = mo;
    const oficio = (i, f) => conActores(fase(i) === 'meseta', f);

    /* ---------- el valle de la Época 1, con lo de hoy encima: lo quieto se funde; el suelo se repinta con el año ---------- */
    const CASAS_C = circulosCasas();
    const libreDeHoy = (x, z, m = 0) => Math.hypot(x - L.FOGON.x, z - L.FOGON.y) > L.ESCUELA_R + 0.35 + m && !CASAS_C.some(c => Math.hypot(x - c.x, z - c.z) < c.r + 0.25 + m)
      && !Object.values(ANCLA).some(a => Math.hypot(x - a.x, z - a.y) < 1.05 + m) && !L.CAMINOS.some(tr => tr.some(([px, pz]) => Math.hypot(x - px, z - pz) < 0.4 + m));
    const suelo = M.suelo(K), menudo = M.menudo(K, (x, z) => !libreDeHoy(x, z));
    const quieto = new THREE.Group();
    quieto.add(M.losa(K), menudo, M.laguna(K, vivos), M.cueva(K));
    const ARB = [...M.ARBOLES.filter(a => a[0] !== 'seco'), ['redondo', 11.8, 16.6, 0.8], ['pino', 17.0, 13.9, 0.85], ['redondo', 16.8, 15.9, 0.75]].filter(([, x, z]) => libreDeHoy(x, z, -0.2) && !Object.values(ANCLA).some(a => Math.hypot(x - a.x, z - a.y) < 1.2));   // la copa no se encima con la pieza (el pino de (15,7; 4,9) rozaba las gradas)
    const arboles = ARB.map(a => { const t = M.arbol(K, a); quieto.add(t); return t; });
    L.CASAS.forEach(([x, z, ry]) => { const c = KM.barrio(K, 'redondas'); c.position.set(x, 0, z); c.rotation.y = ry; quieto.add(c); });
    quieto.add(KM.pasarela(K, L.PASARELA), KM.caminos(K, L.CAMINOS));
    { const m = KM.muelle(K, 1.3); m.position.set(L.MUELLE.x, 0, L.MUELLE.y); m.rotation.y = Math.atan2(L.LAGUNA.x - L.MUELLE.x, L.LAGUNA.y - L.MUELLE.y); quieto.add(m); }
    fundir(K, quieto); raiz.add(suelo, quieto);
    const fogon = KM.fogonViejo(K); fogon.position.set(L.FOGON.x, 0, L.FOGON.y); fundir(K, fogon, 0.01); raiz.add(fogon);
    const llama = fogon.userData.llama;
    const niebla = KM.niebla(K, L.NIEBLA); dyn.add(niebla);
    const matNiebla = niebla.children[0] && niebla.children[0].material;
    const nubes = M.nubes(K, vivos); raiz.add(nubes.g);
    const luciernagas = M.luciernagas(vivos); raiz.add(luciernagas);
    const luzFuego = new THREE.PointLight('#ffa552', 0, 7, 1.6); luzFuego.position.set(L.FOGON.x, 0.7, L.FOGON.y); raiz.add(luzFuego);
    const luzBiblio = new THREE.PointLight('#ffd08a', 0, 4.5, 1.6); luzBiblio.position.set(L.BIBLIOTECA.x, 0.8, L.BIBLIOTECA.y + 0.3); raiz.add(luzBiblio);
    const luzFaro = new THREE.PointLight('#ffd9a0', 0, 5, 1.6); luzFaro.position.set(L.MIRADOR.x, 2.0, L.MIRADOR.y); raiz.add(luzFaro);

    /* ---------- el año del valle: el de la Época 1 (ESTACIONES del motor), con sus copas y su nieve ---------- */
    const cA = new THREE.Color(), cB = new THREE.Color();
    const mezcla = (a, b, k) => '#' + cA.set(a).lerp(cB.set(b), k).getHexString();
    let pasoVestido = -1;
    function vestir() {
      const e = mo.estacionHoy();
      if (e.paso === pasoVestido) return; pasoVestido = e.paso;
      const k = e.k || 0, X = EXTRAS_ANO[e.n] || EXTRAS_ANO.verano, Xs = (e.sig && EXTRAS_ANO[e.sig.n]) || X, copa = copaHoy();
      suelo.userData.pintar(silvestreHoy(), PAL.arena.map(c => mezcla(c, colorEstacion('arena'), 0.6)));
      K.mat(PAL.labio).color.set(colorEstacion('bordeL')); menudo.userData.pasto.material.color.set(colorEstacion('mata'));
      K.mat(PAL.copaD).color.set(copa.D); K.mat(PAL.copaM).color.set(copa.M); K.mat(PAL.copaL).color.set(copa.L); K.mat('#f2b8d0').color.set(copa.brote);
      K.mat('#5c8c41').color.set(mezcla(X.pinoM, Xs.pinoM, k)); K.mat('#7fae5a').color.set(mezcla(X.pinoL, Xs.pinoL, k));
      arboles.forEach(a => { a.userData.capas.forEach(c => { c.visible = copa.nieve > 0.05; c.scale.x = c.scale.z = 0.4 + 0.6 * copa.nieve; }); a.userData.copas.forEach(c => c.scale.setScalar(1 - 0.42 * copa.nieve)); });
    }

    /* ---------- los que siempre están ---------- */
    const guias = MAESTROS.map((_, i) => persona(gente(i + 1, { colorRopa: ['#3a5a7a', '#5f9a6a', '#a8572e', '#6a5a8a', '#2f6f6a', '#8a6a3a'][i], pantalon: '#3a3a40' }), { pose: 'narrar' }));
    const bloom = persona({ ...OP_BLOOM }, { pose: 'quieto' });
    { const cp = K.malla(K.caja(0.1, 0.13, 0.015), '#e8e2d2', { grosor: 0.0015 }); bloom.sostener?.(cp, 'I'); }   // la carpeta de los gráficos
    const abuela = persona({ ...OP_ABUELA }, { pose: 'narrarSentada', asiento: 0.2 });
    const aldeanos = mo.paseantes(10, { opciones: i => gente(i + 5), inicio: i => ({ x: 10.5 + (i % 4) * 0.5, z: 11.0 + Math.floor(i / 4) * 0.5 }), semilla: 2121 });
    aldeanos.lista.forEach((a, i) => { a.p.e.estilo = i % 3; });   // cómo bailan en la fiesta del final
    const anilloPatio = SE.ondas(2, 0.6, '#9fdcff'); anilloPatio.position.set(L.FOGON.x + 1.0, 0.02, L.FOGON.y + 1.0); dyn.add(anilloPatio);
    let bAntes = -1, bCamino = null, bT0 = -99;

    /* ---------- por dónde se camina: lo libre del valle; la laguna, la cueva, las casas, el fogón, la niebla y las piezas no ---------- */
    let claveObst = '', patio = [], claro = [], fuegoRonda = [];
    /* LAS HUELLAS DEL ANILLO: medido por cajas, cada tramo curvo tapaba también el patio (y nadie llegaba al fuego); aquí,
       rectángulos chicos a lo largo de la curva, solo en los tramos que ya están (la etapa 0 es el tramo del fondo) */
    function huellasAnillo(n) {
      const tramos = n >= 1 ? [[90, 142], [158, 292], [308, 360]] : [[158, 292]], out = [], R0 = L.ESCUELA_r - 0.05, R1 = L.ESCUELA_R + 0.12;
      for (const [a0, a1] of tramos) for (let a = a0; a <= a1 + 0.1; a += 6) for (const r of [R0 + 0.22, (R0 + R1) / 2, R1 - 0.22]) {
        const t = a * Math.PI / 180, x = L.FOGON.x + Math.cos(t) * r, z = L.FOGON.y + Math.sin(t) * r;
        out.push({ x0: x - 0.2, x1: x + 0.2, z0: z - 0.2, z1: z + 0.2 });
      }
      return out;
    }
    function rehacerPaso() {
      const rE = ranuras.escuela && ranuras.escuela.P;
      if (rE && !rE.huellasAnillo) { rE.huellas = huellasAnillo(niv(87)); rE.huellasAnillo = true; }
      const circulos = [{ x: M.CUEVA.x, z: M.CUEVA.y, r: 2.0 }, { x: L.FOGON.x, z: L.FOGON.y, r: 0.72 }, ...CASAS_C,
        ...ARB.map(([, x, z, s2]) => ({ x, z, r: 0.42 * s2 })), ...M.ROCAS.map(([x, z, r2]) => ({ x, z, r: r2 + 0.15 })),
        ...MAESTROS.map(m => ({ x: m.x, z: m.y, r: 0.25 }))];
      mo.rehacerCaminos({ circulos, elipses: [{ x: M.LAGUNA.x, z: M.LAGUNA.y, rx: M.LAGUNA.rx * 1.3, rz: M.LAGUNA.ry * 1.3 }], bloquea: (x, z) => enNieblaFu(x, z) || x > 17.7 || z > 17.7 });
      aldeanos.rehacer();
      const usados = [];
      /* los asientos que deja cada pieza (futuro/piezas.js: { x, y, mira, alto }): las gradas del patio y los tocones del claro */
      const deP = id => ((ranuras[id] && ranuras[id].P && ranuras[id].P.asientos) || []).map(a => ({ x: a.x, z: a.y, mira: a.mira, pose: 'sentado', asiento: a.alto }));
      const gradas = deP('escuela'), tocones = deP('tutor');
      gradas.forEach(q => usados.push(q)); tocones.forEach(q => usados.push(q));
      patio = [...gradas, ...arco(L.FOGON, 1.05, 12, usados, 0.25, { x: L.FOGON.x, y: L.FOGON.y }, Math.PI / 4, 3.0)];     // los que esperan: sentados en las gradas del patio y, si no caben, de pie junto al fuego
      claro = [...tocones, ...arco(L.TUTOR, 0.95, 6, usados, 0.27, { x: L.TUTOR.x, y: L.TUTOR.y }, Math.PI / 4, 3.4)];      // los que piensan: en los tocones del claro
      fuegoRonda = arco(L.FOGON, 1.0, 14, [], 0.26, { x: L.FOGON.x, y: L.FOGON.y }, Math.PI / 4, 6.0);      // la noche del final: todos alrededor del fuego
      for (const f of FIG.values()) f.clave = null;
      if (invitados) pistas = pistaBaile();
    }
    /* asientos en arco alrededor de un centro, del lado de la cámara primero (a0) y abriéndose hacia los costados */
    function arco(c, r, cupo, usados, sep, mira, a0 = Math.PI / 4, ancho = 3.6) {
      const out = [];
      for (const rr of [r, r + 0.3, r + 0.6]) for (let k = 0; k < 24 && out.length < cupo; k++) {
        const a = a0 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (sep / rr); if (Math.abs(a - a0) > ancho / 2) continue;
        const x = c.x + Math.cos(a) * rr, z = c.y + Math.sin(a) * rr;
        if (!mo.caminos.libre(x, z) || usados.some(u => Math.hypot(u.x - x, u.z - z) < sep * 0.95)) continue;
        const q = { x, z, mira }; out.push(q); usados.push(q);
      }
      return out;
    }

    /* ---------- LOS QUE PREGUNTAN: una persona (con su chispa azul) por cada uno de S.dudasFu y S.pensandoFu ---------- */
    const FIG = new Map();
    const figura = (d, x, z, alfa) => {
      const p = persona(d.l ? deLejos(d.k) : gente(d.k), { pose: 'quieto' });
      p.obj.position.set(x, 0, z); opacidad(p.obj, alfa);
      const ch = { nada: KM.chispa(K), '?': KM.chispa(K, '?'), '!': KM.chispa(K, '!') };
      Object.values(ch).forEach(c => { c.visible = false; dyn.add(c); });
      const f = { k: d.k, d, p, ch, x, z, cola: [], alfa, clave: null, vel: 0.62 + (d.k % 5) * 0.04, sale: null, signo: 'nada' };
      FIG.set(d.k, f); return f;
    };
    const quitar = f => { dyn.remove(f.p.obj); mo.liberar(f.p.obj); Object.values(f.ch).forEach(c => { dyn.remove(c); mo.liberar(c); }); FIG.delete(f.k); };
    function caminar(f, dt) {
      if (!f.cola.length) return false;
      const d = f.cola[0], dx = d.x - f.x, dz = d.z - f.z, D = Math.hypot(dx, dz);
      if (D < 0.04) { f.cola.shift(); return f.cola.length > 0; }
      const s = Math.min(D, f.vel * dt); f.x += dx / D * s; f.z += dz / D * s;
      let da = Math.atan2(dx, dz) - f.p.obj.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); f.p.obj.rotation.y += da * Math.min(1, dt * 8);
      f.p.obj.position.set(f.x, 0, f.z);
      return true;
    }
    function chispaDe(f, t, sentado) {   // la chispa flota junto a la cabeza, del lado de la cámara
      for (const [s, c] of Object.entries(f.ch)) {
        const on = s === f.signo && f.alfa > 0.2 && f.p.obj.visible;
        c.visible = on; if (!on) continue;
        c.position.set(f.x + 0.22, (sentado ? 0.62 : 0.98) + f.p.obj.position.y, f.z + 0.12); c.userData.anim(t);
      }
    }
    const nombreDe = n => { const i = typeof ESTUDIANTES_FU !== 'undefined' ? ESTUDIANTES_FU.indexOf(n) : -1; return i >= 0 ? i : 0; };
    function preguntan(t, dt, e21, deNoche) {
      const esperan = e21 ? dudasFu() : [], piensan = e21 ? pensandoFu() : [], vivosK = new Set();
      [...esperan, ...piensan].forEach(d => vivosK.add(d.k));
      const lugar = new Map();
      esperan.slice().sort((u, v) => u.k - v.k).forEach((d, j) => lugar.set(d.k, deNoche ? null : patio[j] ? { pose: 'quieto', ...patio[j], signo: 'nada' } : null));
      piensan.slice().sort((u, v) => u.k - v.k).forEach((d, j) => lugar.set(d.k, claro[j] ? { pose: 'suelo', ...claro[j], signo: '?' } : null));
      for (const d of [...esperan, ...piensan]) {
        let f = FIG.get(d.k);
        const s = lugar.get(d.k);
        if (!f) {
          const o = d.l ? { x: LLEGA_LEJOS.x, z: LLEGA_LEJOS.y } : CASAS_PUERTAS[d.k % CASAS_PUERTAS.length];
          if (nacimientosVivos && s) { f = figura(d, o.x, o.z, 0); f.cola = mo.caminos.ruta(o, s); f.clave = s.x.toFixed(2) + ',' + s.z.toFixed(2); }
          else f = figura(d, s ? s.x : L.FOGON.x + 1, s ? s.z : L.FOGON.y + 1, nacimientosVivos ? 0 : 1);
        }
        f.d = d;
        if (!s) { f.alfa = Math.max(0, f.alfa - dt * 1.4); if (f.alfa <= 0) { ver(f.p, false); f.cola = []; f.clave = null; chispaDe(f, t, false); continue; } }
        else { ver(f.p, true); f.alfa = Math.min(1, f.alfa + dt * 1.2); }
        opacidad(f.p.obj, f.alfa);
        const clave = s ? s.x.toFixed(2) + ',' + s.z.toFixed(2) : null;
        if (s && clave !== f.clave) { f.clave = clave; f.cola = f.alfa > 0.3 ? mo.caminos.ruta({ x: f.x, z: f.z }, s) : [{ x: s.x, z: s.z }]; if (f.alfa <= 0.3) { f.x = s.x; f.z = s.z; } }
        if (s) f.signo = s.signo;
        let sentado = false;
        if (caminar(f, dt)) f.p.e.pose = 'andar';
        else if (s) { f.p.obj.position.set(f.x, 0, f.z); f.p.obj.rotation.y = Math.atan2(s.mira.x - f.x, s.mira.y - f.z); f.p.e.pose = s.pose; if (s.asiento !== undefined) f.p.e.asiento = s.asiento; sentado = s.pose === 'suelo' || s.pose === 'sentado'; }
        animar(f.p, t, dt); chispaDe(f, t, sentado);
        if (f.alfa > 0.5) tocP(f.x, f.z, { k: 'alumno', i: nombreDe(d.n) }, f.p);
      }
      /* los que ya no están: si estaban pensando, entendieron (saltan con su «!» y vuelven); si esperaban, la IA les respondió
         (la chispa con su «!» y se van con la tarea hecha) o se fueron a preguntar (entonces siguen en S.pensandoFu) */
      for (const f of [...FIG.values()]) {
        if (vivosK.has(f.k)) continue;
        if (!e21 || !nacimientosVivos) { quitar(f); continue; }
        if (!f.sale) {
          const entendio = f.signo === '?';
          const a = f.d.l ? { x: ENTRADA_BUS.x, z: ENTRADA_BUS.y } : CASAS_PUERTAS[f.k % CASAS_PUERTAS.length];
          f.sale = { t: 0, entendio }; f.signo = '!';
          f.cola = mo.caminos.ruta({ x: f.x, z: f.z }, a);
          if (entendio) f.sale.salto = 1.2;
          if (f.alfa < 0.3) { quitar(f); continue; }
        }
        const q = f.sale; q.t += dt;
        if (q.salto > 0) { q.salto -= dt; f.p.e.pose = 'quieto'; f.p.obj.position.y = Math.max(0, Math.sin((1.2 - q.salto) * 8)) * 0.12; animar(f.p, t, dt); chispaDe(f, t, false); continue; }
        f.p.obj.position.y = 0;
        if (caminar(f, dt) && q.t < 14) { f.p.e.pose = 'andar'; }
        else { f.alfa -= dt * 1.2; if (f.alfa <= 0) { quitar(f); continue; } opacidad(f.p.obj, f.alfa); f.p.e.pose = 'quieto'; }
        animar(f.p, t, dt); chispaDe(f, t, false);
      }
    }

    /* ---------- LA FIESTA DEL FINAL (fiesta.js): los de todas las épocas llegan caminando y bailan alrededor de la escuela,
       del lado de la cámara, por fuera del anillo; la gente del valle baila en el patio, junto al fuego y la Abuela ---------- */
    let invitados = null, pistas = [];
    function pistaBaile() {   // el prado del lado de la cámara, por fuera del anillo, repartidos (no un racimo en la entrada)
      const usados = [...patio, ...claro, { x: LUGAR_BLOOM_FU.x, z: LUGAR_BLOOM_FU.y }], cand = [], c = L.FOGON, a0 = Math.PI / 4;
      for (let x = 3.2; x < 17.3; x += 0.25) for (let z = 3.2; z < 17.3; z += 0.25) {
        const r = Math.hypot(x - c.x, z - c.y), a = Math.atan2(z - c.y, x - c.x);
        if (r < 2.75 || r > 6.2 || enNieblaFu(x, z) || !mo.caminos.libre(x, z) || usados.some(u => Math.hypot(u.x - x, u.z - z) < 0.4)) continue;
        if (!mo.caminos.libre(x + 0.18, z) || !mo.caminos.libre(x - 0.18, z) || !mo.caminos.libre(x, z + 0.18) || !mo.caminos.libre(x, z - 0.18)) continue;   // con espacio para mover los brazos
        let da = Math.abs(a - a0); if (da > Math.PI) da = 2 * Math.PI - da;
        cand.push({ x, z, d: da * 1.1 + (r - 2.75) * 0.32 + ((x * 7.3 + z * 3.1) % 1) * 0.05 });
      }
      cand.sort((u, v) => u.d - v.d);
      const elegidos = [];
      for (const q of cand) { if (elegidos.length >= INVITADOS.length) break; if (elegidos.some(u => Math.hypot(u.x - q.x, u.z - q.z) < 0.6)) continue; elegidos.push(q); }
      return elegidos.map(q => ({ ...q, clave: q.x.toFixed(2) + ',' + q.z.toFixed(2) }));
    }
    function armarInvitados() {
      pistas = pistaBaile();
      const entran = nacimientosVivos && fiestaRecien();
      invitados = INVITADOS.map((op, i) => {
        const p = persona(op, { pose: 'quieto', estilo: (i + 1) % 3 }), s = pistas[i];
        const v = { p, x: s ? s.x : L.FOGON.x, z: s ? s.z : L.FOGON.y, cola: [], clave: null, alfa: entran ? 0 : 1, espera: entran ? 0.15 * i : 0, vel: 0.85 + (i % 4) * 0.06 };
        if (s && entran) {   // llegan desde más allá, por el mismo rumbo, y entran apareciendo
          const ax = s.x - L.FOGON.x, az = s.z - L.FOGON.y, D = Math.hypot(ax, az) || 1;
          for (const k of [2.4, 1.8, 1.2]) { const x = s.x + ax / D * k, z = s.z + az / D * k; if (x < 17.4 && z < 17.4 && !enNieblaFu(x, z) && mo.caminos.libre(x, z)) { v.x = x; v.z = z; break; } }
        }
        p.obj.position.set(v.x, 0, v.z); opacidad(p.obj, v.alfa);
        return v;
      });
    }
    function bailan(t, dt, fiesta) {
      if (!fiesta) { if (invitados) invitados.forEach(v => ver(v.p, false)); return; }
      if (!invitados) armarInvitados();
      invitados.forEach((v, i) => {
        const s = pistas[i];
        if (!ver(v.p, !!s)) return;
        if (v.espera > 0) { v.espera -= dt; v.p.obj.visible = false; return; }
        if (v.clave !== s.clave) { v.clave = s.clave; v.cola = v.alfa > 0.05 || Math.hypot(v.x - s.x, v.z - s.z) > 0.05 ? mo.caminos.ruta({ x: v.x, z: v.z }, s) : []; if (!v.cola.length) { v.x = s.x; v.z = s.z; } }
        v.alfa = Math.min(1, v.alfa + dt * 1.1); opacidad(v.p.obj, v.alfa);
        if (v.cola.length) {
          const d = v.cola[0], dx = d.x - v.x, dz = d.z - v.z, D = Math.hypot(dx, dz);
          if (D < 0.05) v.cola.shift(); else { const k = Math.min(D, v.vel * dt); v.x += dx / D * k; v.z += dz / D * k; }
          ubicar(v.p, v.x, v.z, { x: v.x + dx, y: v.z + dz }); v.p.e.pose = 'andar';
        } else {
          ubicar(v.p, s.x, s.z, { x: s.x + 1, y: s.z + 1 }); v.p.obj.rotation.y += 0.45 * Math.sin(t * 1.1 + i);   // de frente a quien mira la fiesta, girando un poco
          v.p.e.pose = 'bailar';
        }
        animar(v.p, t, dt);
      });
    }

    /* ---------- EL SECRETO DE LA ÉPOCA: el Ars Magna de Ramon Llull. Las noches de invierno, en la boca de la cueva pintada,
       un viejo de túnica gira tres discos de papel con las letras de las ideas: la máquina de encontrar todas las verdades ---------- */
    const secretoArs = (() => {
      const { x, y: z } = SECRETO_ARS, g = SE.arsMagna(K); g.position.set(x, 0, z); g.rotation.y = 0.6; dyn.add(g);
      const ch = SE.chispitas(6, 0.22, 0.5); ch.position.set(x, 0.05, z); dyn.add(ch);
      const luzS = new THREE.PointLight('#ffcf7a', 0, 2.2, 1.6); luzS.position.set(x + 0.2, 0.5, z + 0.3); raiz.add(luzS);
      const llull = persona({ ...OP_LLULL }, { pose: 'sentado', asiento: 0.18 });
      return (t, dt, luz, on) => {
        const ve = on && luz < 0.4 && estacion().i === 3;
        g.visible = ve; ch.visible = ve && !secretoHallado('ars');
        if (ver(llull, ve)) { ubicar(llull, x - 0.32, z + 0.18, { x, y: z }); animar(llull, t, dt); }
        luzS.intensity = ve ? 1.1 + 0.2 * Math.sin(t * 5) : 0;
        if (!ve) return;
        g.userData.girar(t); ch.userData.titilar(t);
        tocable(x, z + 0.2, { k: 'secreto', id: 'ars', x, y: z }, { rx: 26, ry: 18, dy: 14 });
      };
    })();

    /* ---------- cada cuadro ---------- */
    function sincronizar(t, dt) {
      const e21 = S.era === 21, luz = luzDia(), noche = nocheCasa(), deNoche = noche > 0.5, oscuro = luz < 0.5;
      const fiesta = e21 && fiestaActiva();   // el viaje terminó: todos bailan (fiesta.js)
      vestir();
      const lk = Math.max(0, Math.min(1, (0.55 - luz) / 0.25));
      luciernagas.userData.k = estacion().i === 1 ? lk * lk * (3 - 2 * lk) * 0.3 : 0; luciernagas.visible = luciernagas.userData.k > 0.01;

      // --- las ranuras de los seis saberes (futuro/piezas.js), cada una con sus etapas ---
      for (const [i, id] of Object.entries(IDS)) ranura(id, tiene(+i) ? llave(+i) : null, () => oficio(+i, () => PIEZA(id).crear(K, niv(+i))));
      const clave = mo.claveRanuras() + '|' + S.docentes;
      if (clave !== claveObst) { claveObst = clave; rehacerPaso(); }
      mo.animarRanuras(t, dt);

      // --- los tocables: las piezas y el valle ---
      for (const r of Object.values(ranuras)) if (r.P && r.P.toc) for (const q of r.P.toc) tocP(q.x, q.y, { k: q.k }, q.p);
      if (e21 && escuelaFu()) tocable(L.FOGON.x + 0.9, L.FOGON.y + 0.9, { k: 'escuelaFu' }, { rx: 36, ry: 20, dy: 10 });
      tocable(L.FOGON.x, L.FOGON.y, { k: 'fogonFu' }, { rx: 22, ry: 12, dy: 6 });
      tocable(M.CUEVA.x, M.CUEVA.y, { k: 'cuevaFu' }, { rx: 46, ry: 30, dy: 30 });
      tocable(2.9, 7.5, { k: 'nieblaFu' }, { rx: 24, ry: 14, dy: 10 });

      // --- la niebla: lo que no sabemos se aclara un poco con cada hito de la época, y respira ---
      if (matNiebla) matNiebla.opacity = (0.52 - 0.04 * Math.min(5, S.hitosEra || 0)) * (0.92 + 0.08 * Math.sin(t * 0.4));
      niebla.position.x = 0.06 * Math.sin(t * 0.07); niebla.position.z = 0.05 * Math.cos(t * 0.05);

      // --- las maestras y los maestros: cada uno con su saber; de noche, a casa (salvo la del patio, con el fuego) ---
      guias.forEach((p, i) => {
        const tec = 87 + i, abierta = e21 && tiene(tec) && fase(tec) === 'meseta' && (i === 0 || i < S.docentes + 2);
        if (!ver(p, abierta && (fiesta || !deNoche || (i === 0 && !(S.ganadoFu && deNoche))))) return;   // en la noche del final, la maestra del patio deja el fuego a la Abuela; en la fiesta, todos
        const m = MAESTROS[i], c = ANCLA[tec]; ubicar(p, m.x, m.y, i === 0 ? { x: L.FOGON.x, y: L.FOGON.y } : { x: c.x + 0.6, y: c.y + 0.6 });
        p.e.pose = fiesta ? 'bailar' : deNoche ? 'quieto' : 'narrar'; p.e.estilo = i % 3; animar(p, t, dt); tocP(m.x, m.y, { k: 'docente', i }, p);
      });
      // --- los que preguntan, los que piensan y los que se van con su «!» ---
      preguntan(t, dt, e21, deNoche);
      const esperan = e21 && escuelaFu() ? dudasEsperan() : 0;
      anilloPatio.visible = esperan > 0 && !deNoche; if (anilloPatio.visible) anilloPatio.userData.latir(t);

      // --- la gente del valle: pasea de día; en la noche del final, todos se sientan alrededor del fuego con la Abuela ---
      const final = e21 && S.ganadoFu && (deNoche || fiesta);   // en la fiesta, de día también
      const vis = final ? Math.min(10, fuegoRonda.length) : deNoche ? 0 : Math.min(10, Math.max(4, Math.round((S.alumnos || 0) / 10)));
      aldeanos.paso(t, dt, vis, { asiento: final ? i => fuegoRonda[i] ? fiesta ? { ...fuegoRonda[i], pose: 'bailar', mira: { x: fuegoRonda[i].x + 1, y: fuegoRonda[i].z + 1 } } : { ...fuegoRonda[i], pose: 'suelo' } : null : () => null, mira: { x: L.FOGON.x, y: L.FOGON.y } }, a => ({ k: 'alumno', i: a.i + 4 }));
      if (ver(abuela, final)) { ubicar(abuela, L.FOGON.x - 0.55, L.FOGON.y - 0.55, { x: L.FOGON.x, y: L.FOGON.y }); abuela.e.pose = fiesta ? 'palmasSentada' : 'narrarSentada'; animar(abuela, t, dt); tocP(L.FOGON.x - 0.55, L.FOGON.y - 0.55, { k: 'pensador', id: 'abuela' }, abuela); }

      // --- Bloom: baja del bus en la parada, espera y, recibido, se queda junto al claro de las preguntas ---
      const estB = e21 ? estadoPensador('bloom') : 0;
      if (estB === 1 && bAntes !== 1) bT0 = bAntes === -1 || !nacimientosVivos ? t - 99 : t;
      if (estB === 2 && bAntes === 1 && nacimientosVivos) bCamino = { cola: mo.caminos.ruta({ x: ESPERA_BLOOM_FU.x, z: ESPERA_BLOOM_FU.y }, { x: LUGAR_BLOOM_FU.x, z: LUGAR_BLOOM_FU.y }), x: ESPERA_BLOOM_FU.x, z: ESPERA_BLOOM_FU.y };
      bAntes = estB;
      const uB = Math.min(1, (t - bT0) / 6), kB = uB * uB * (3 - 2 * uB);
      if (ver(bloom, e21 && estB >= 1 && (fiesta || !(deNoche && estB === 2)))) {
        let px, pz, anda = false, mira;
        if (estB === 1) { px = ENTRADA_BUS.x + (ESPERA_BLOOM_FU.x - ENTRADA_BUS.x) * kB; pz = ENTRADA_BUS.y + (ESPERA_BLOOM_FU.y - ENTRADA_BUS.y) * kB; anda = uB < 1; mira = anda ? { x: px, y: pz - 1 } : { x: px - 0.5, y: pz - 1 }; opacidad(bloom.obj, Math.min(1, uB * 3)); }
        else {
          px = LUGAR_BLOOM_FU.x; pz = LUGAR_BLOOM_FU.y; mira = { x: L.TUTOR.x, y: L.TUTOR.y };
          if (bCamino) { const c = bCamino, d = c.cola[0]; if (!d) bCamino = null; else { const dx = d.x - c.x, dz = d.z - c.z, D = Math.hypot(dx, dz); if (D < 0.05) c.cola.shift(); else { const s = Math.min(D, 0.55 * dt); c.x += dx / D * s; c.z += dz / D * s; } px = c.x; pz = c.z; anda = true; mira = { x: px + dx, y: pz + dz }; } }
        }
        ubicar(bloom, px, pz, mira); bloom.e.pose = anda ? 'andar' : fiesta && estB === 2 ? 'bailar' : estB === 2 ? 'narrar' : 'quieto'; animar(bloom, t, dt);
        tocP(px, pz, { k: 'pensador', id: 'bloom' }, bloom);
      }

      // --- la noche: el fuego del círculo de piedras (como en la Época 1), la linterna de la biblioteca, el faro del mirador ---
      const n1 = 1 - luz, fuegoOn = oscuro || final;
      if (llama) { llama.visible = fuegoOn; if (fuegoOn) { llama.scale.set(1 + 0.12 * Math.sin(t * 11), 1 + 0.2 * Math.sin(t * 9 + 1), 1 + 0.12 * Math.sin(t * 13)); } }
      luzFuego.intensity = fuegoOn ? n1 * (final ? 4.2 : 3.0) * (0.85 + 0.15 * Math.sin(t * 12)) : 0;
      const rE = ranuras.escuela && ranuras.escuela.P, rM = ranuras.mirador && ranuras.mirador.P;
      if (rE && rE.lampara) rE.lampara.material.emissiveIntensity = oscuro ? 1.6 : 0.4;
      if (rM && rM.faro) { const f = rM.faro; if (f.material) f.material.emissiveIntensity = oscuro ? 1.8 : 0.3; }
      luzBiblio.intensity = tiene(90) ? n1 * 1.8 * (0.92 + 0.08 * Math.sin(t * 5)) : 0;
      luzFaro.intensity = tiene(92) && niv(92) >= 3 ? n1 * 2.4 : 0;

      bailan(t, dt, fiesta); if (fiesta) seguirFiesta();
      secretoArs(t, dt, luz, e21);
      mo.luces(t);
      vivos.forEach(f => f(t, dt));
      return { luz, brasa: fuegoOn ? 1 : 0 };
    }

    /* ---------- el estado de cada saber y los globos: el pase 2D ---------- */
    const ALTO = { 87: 44, 88: 34, 89: 36, 90: 36, 91: 34, 92: 60 };
    function superponer(t) {
      for (const i of [87, 88, 89, 90, 91, 92]) { if (!tiene(i)) continue; const a = ANCLA[i], p = P(a.x, a.y, ALTO[i]); estadoTec(i, { x: p.x, y: p.y }, t); }
      if (S.era !== 21) return;
      if (estadoPensador('bloom') === 1 && VISITAS.bloom && !bCamino) drawGlobo(ESPERA_BLOOM_FU.x, ESPERA_BLOOM_FU.y, t);
    }

    /* ---------- los rótulos de acción: lo que se toca en el valle ---------- */
    function rotulos(ancla, t, tocarEn) {
      const e21 = S.era === 21, n = e21 && escuelaFu() ? dudasEsperan() : 0, err = e21 ? (S.erroresFu || 0) : 0;
      ancla('preguntan', n > 0, L.FOGON.x + 1.15, L.FOGON.y + 1.3, 22, `los que preguntan · ${n} ${n === 1 ? 'espera' : 'esperan'}`, 'accion', () => abrirPregunta());
      ancla('revisar', err >= 3 && n === 0 && revisarDisponibleFu(), L.BIBLIOTECA.x, L.BIBLIOTECA.y + 0.6, 30, `revisar · ${err} ${err === 1 ? 'inventada' : 'inventadas'}`, 'accion', () => abrirPregunta());
      const estB = e21 ? estadoPensador('bloom') : 0;
      ancla('recibir', estB === 1 && S.apr >= (VISITAS.bloom?.costo || 0), ESPERA_BLOOM_FU.x, ESPERA_BLOOM_FU.y, 52, 'recibir a Bloom', 'accion', () => tocarEn(ESPERA_BLOOM_FU.x, ESPERA_BLOOM_FU.y));
    }

    /* las caras de quienes firman la consejera en esta época (la IA no tiene cara de persona: queda su busto, la chispa) */
    const caras = { 'Benjamin Bloom': { ...OP_BLOOM } };
    return { quieto, nubes, sincronizar, superponer, rotulos, caras, aprendices: aldeanos, get corros() { return []; }, get preguntanVisibles() { return [...FIG.values()].filter(f => f.p.obj.visible).length; } };
  },
};
