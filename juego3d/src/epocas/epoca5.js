/* ============================================================
   epocas/epoca5
   La Época 5 (Alejandría) sobre el motor 3D. Como las otras: aquí vive lo de ESTA época (su ciudad, sus monumentos,
   sus piezas, quién está dónde, su año del mar abierto y el mar cerrado, su noche y sus rótulos); el cómo lo pone
   motor3d.js. La ciudad, los monumentos y los saberes viven en src/alejandria/. Las anclas de la lógica (el muelle,
   el amarre, la barca del puerto, la Biblioteca, la vara) son las del motor (09c-alejandria).
   Los monumentos son los que el usuario elija en la hoja de bocetos (juego3d/bocetos/alejandria.html): el Faro al
   fondo, el Museo como saber que crece, el Serapeo en su colina y el barco que trae libros (VARIANTES).
   ============================================================ */
import * as THREE from 'three';
import { fundir } from '../kit.js';
import * as M from '../mundo.js';
import * as V from '../alejandria/valle.js';
import * as MON from '../alejandria/monumentos.js';
import * as PZ from '../alejandria/piezas.js';
import * as L from '../alejandria/lugares.js';
import { obelisco } from '../egipto/monumentos.js';
import { conActores } from '../piezas.js';
import { fase, tiene, niv, llave, Z2D } from '../motor3d.js';
import * as SE from '../secretos.js';

/* ---------- dónde está cada cosa ---------- */
export const FARO = { x: L.FARO.x, y: L.FARO.y, s: 0.5 };
export const SERAPEO = { x: L.SERAPEO.x, y: L.SERAPEO.y, s: 0.62 };
const BIB = PZ.BIBLIOTECA;
/* los que enseñan: Eratóstenes, el bibliotecario, delante de su Biblioteca; los demás, en la plaza y en las calles */
const MAESTROS = [{ x: 9.3, y: 8.95 }, { x: 11.25, y: 8.95 }, { x: 10.75, y: 11.05 }, { x: 8.15, y: 11.75 }, { x: 14.3, y: 11.85 }];
const ESPERA_HIPATIA = { x: 10.3, y: 9.1 }, LUGAR_HIPATIA = { x: 10.15, y: 10.25 };   // la espera es la PUERTA del motor (14-reglas)
const ROLLOS_MUELLE = [[8.42, 4.75], [8.72, 4.6], [8.45, 4.45], [8.75, 4.3]];   // los rollos que esperan su estante, sobre el muelle
/* de noche: seis leen a la luz de las lámparas del pórtico de la Biblioteca; el resto, a su casa */
const VELA = [[6.55, 7.75], [6.9, 7.85], [7.3, 7.85], [7.65, 7.75], [6.75, 8.15], [7.45, 8.15]];
const LAMPARAS = [{ x: BIB.x - 0.85, y: BIB.y + 0.95 }, { x: BIB.x + 0.85, y: BIB.y + 0.95 }, { x: 10.2, y: 9.95 }];

function reservar() {
  const R = V.RESERVAS; R.length = 0;
  R.push({ x: FARO.x, z: FARO.y, r: 1.3 });
  R.push({ x0: SERAPEO.x - 1.6, x1: SERAPEO.x + 1.6, z0: SERAPEO.y - 1.45, z1: SERAPEO.y + 1.5 });
  R.push({ x0: SERAPEO.x - 0.85, x1: SERAPEO.x + 2.3, z0: SERAPEO.y + 1.4, z1: SERAPEO.y + 2.35 });   // la escalinata, las esfinges y la biblioteca hija
  R.push({ x0: BIB.x - BIB.w / 2 - 0.1, x1: BIB.x + BIB.w / 2 + 0.1, z0: BIB.y - BIB.d / 2 - 0.1, z1: BIB.y + BIB.d / 2 + 0.45 });
  R.push({ x0: 8.2, x1: 9.0, z0: 2.6, z1: 5.4 });                                                     // el muelle
  R.push({ x0: L.MUSEO.x - 1.4, x1: L.MUSEO.x + 1.4, z0: L.MUSEO.y - 1.85, z1: L.MUSEO.y + 1.15 }); // el Museo, cuando esté
  V.CASAS.forEach(([x0, z0, w, d]) => R.push({ x0: x0 - 0.12, x1: x0 + w + 0.15, z0: z0 - 0.1, z1: z0 + d + 0.1 }));
  V.PALMERAS.forEach(([x, z]) => R.push({ x, z, r: 0.25 }));
  V.OBELISCOS.forEach(([x, z]) => R.push({ x, z, r: 0.25 }));
  [PZ.ANCLAS.pinakes, PZ.ANCLAS.codice, PZ.ANCLAS.elementos, PZ.ANCLAS.sombra].forEach(q => R.push({ x: q.x, z: q.y, r: 0.55 }));
}

export default {
  era: 5,
  nombre: 'Alejandría',
  piezas: PZ.PIEZAS,
  construir(mo) {
    const { K, raiz, dyn, vivos, ranura, ranuras, persona, ubicar, ver, animar, opacidad, tocP } = mo;
    const oficio = (i, f) => conActores(fase(i) === 'meseta', f);
    reservar(); L.verificarEspejo();

    /* ---------- la ciudad: lo quieto se funde; el suelo y el agua se repintan con el año ---------- */
    const suelo = V.suelo(K), agua = V.agua(K, vivos), veg = V.vegetacion(K, vivos);
    const quieto = new THREE.Group();
    quieto.add(V.losa(K), V.calles(K), V.casas(K), veg.g);
    const bib = PZ.biblioteca(K); bib.position.set(BIB.x, 0, BIB.y); quieto.add(bib);
    const mu = PZ.muelle(K); mu.position.set(L.MUELLE.x, 0, L.costa(L.MUELLE.x) + 0.45); quieto.add(mu);
    V.OBELISCOS.forEach(([x, z]) => { const o = obelisco(K, 1.5); o.position.set(x, 0, z); quieto.add(o); });
    fundir(K, quieto);
    const ser = MON.serapeo(K, MON.VARIANTES.serapeo); fundir(K, ser, 0.014); ser.scale.setScalar(SERAPEO.s); ser.position.set(SERAPEO.x, 0, SERAPEO.y); quieto.add(ser);
    /* el Faro: sin su isla de boceto (la ciudad tiene la suya); su fuego se anima y de noche alumbra el puerto */
    const faro = MON.faro(K, MON.VARIANTES.faro); faro.remove(faro.children[0]); fundir(K, faro, 0.012); faro.scale.setScalar(FARO.s); faro.position.set(FARO.x, 0.02, FARO.y); raiz.add(faro);
    const llamasFaro = []; faro.traverse(o => { if (o.userData.llama) llamasFaro.push(o); });
    const luzFaro = new THREE.PointLight('#ffb35c', 0, 7, 1.4); luzFaro.position.set(FARO.x, (faro.userData.alto || 7) * FARO.s - 0.6, FARO.y); raiz.add(luzFaro);
    /* el dique del Heptastadio, de la isla a la ciudad, con su puente */
    const hep = new THREE.Group(); quieto.add(hep);
    const z0 = V.HEPTASTADIO.z0, z1 = L.costa(V.HEPTASTADIO.x) + 0.2;
    const dique = K.malla(K.caja(V.HEPTASTADIO.ancho, 0.14, z1 - z0), MON.AL.calizaD, { grosor: 0.006 }); dique.position.set(V.HEPTASTADIO.x, -0.03, (z0 + z1) / 2); hep.add(dique);
    const puente = K.malla(K.caja(V.HEPTASTADIO.ancho + 0.04, 0.05, 0.3), MON.AL.madera, { grosor: 0.004 }); puente.position.set(V.HEPTASTADIO.x, 0.06, (z0 + z1) / 2); hep.add(puente);   // el puente para pasar las barcas
    raiz.add(suelo, agua.g, quieto);
    const nubes = M.nubes(K, vivos); raiz.add(nubes.g);
    const luciernagas = M.luciernagas(vivos); raiz.add(luciernagas);
    const luzBib = new THREE.PointLight('#ffc27a', 0, 5, 1.5); luzBib.position.set(BIB.x, 0.9, BIB.y + 1.1); raiz.add(luzBib);
    const luzPlaza = new THREE.PointLight('#ffb35c', 0, 4, 1.6); luzPlaza.position.set(10.2, 0.8, 9.95); raiz.add(luzPlaza);
    const luzCasas = new THREE.PointLight('#ffae5a', 0, 5, 1.6); luzCasas.position.set(14.2, 0.9, 11.6); raiz.add(luzCasas);
    const lamparas = LAMPARAS.map(L => { const l = PZ.lampara(K); l.position.set(L.x, 0, L.y); dyn.add(l); return { ...L, l }; });

    /* ---------- el barco que trae libros, la barca del puerto y los rollos del muelle ---------- */
    const barco = MON.barco(K, MON.VARIANTES.barco); fundir(K, barco, 0.012); barco.scale.setScalar(0.55); barco.userData.vivo = true; dyn.add(barco);   // fundido: cientos de piezas en pocas llamadas
    const barca = MON.barco(K, 'puerto'); fundir(K, barca, 0.012); barca.scale.setScalar(0.45); barca.position.set(L.BARCA.x, V.NIVEL_MAR - 0.01, L.BARCA.y); barca.rotation.y = 0.4; barca.userData.vivo = true; dyn.add(barca);
    /* la flota del grano: en otoño, de día, cruza el fondo del mar rumbo a Roma (el otoño del motor: «la flota del grano zarpa») */
    const flota = [{ s: 0.56, du: 0 }, { s: 0.46, du: 0.17 }].map(f => {   // el gran navío y otro detrás: la flota
      const n = MON.barco(K, 'grano'); fundir(K, n, 0.012); n.scale.setScalar(f.s); n.rotation.y = Math.PI; n.visible = false; n.userData.vivo = true; dyn.add(n);
      return { n, ...f };
    });
    const rollosMuelle = ROLLOS_MUELLE.map(([x, z], i) => { const g = new THREE.Group(); g.position.set(x, 0.06, z); for (let k = 0; k < 3; k++) { const r = MON.rolloSuelto(K, 0.15); r.position.set(0, 0.02 + k * 0.035, (k - 1) * 0.02); r.rotation.y = 0.4 + i; g.add(r); } fundir(K, g, 0.01); g.userData.vivo = true; dyn.add(g); return g; });
    const brilloMuelle = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), new THREE.MeshBasicMaterial({ color: '#ffd76a', transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending }));
    brilloMuelle.geometry.userData.propia = true; brilloMuelle.rotation.x = -Math.PI / 2; brilloMuelle.position.set(8.6, 0.075, 4.55); dyn.add(brilloMuelle);

    /* ---------- el año del mar (ESTACIONES_ALEJANDRIA del motor): cuatro estaciones; en invierno, el puerto quieto ---------- */
    let pasoVestido = -1;
    function vestir() {
      const e = mo.estacionHoy();
      if (e.paso === pasoVestido) return; pasoVestido = e.paso;
      const k = e.k || 0, sig = e.sig || e, mez = (a, b) => k > 0 ? lerpHex(a, b, k) : a;
      suelo.userData.pintar({ campo: e.campo.map((c, i) => mez(c, sig.campo[i])) });
      veg.vestir(e.i, k, sig.i ?? ((e.i + 1) % 4));
    }

    /* ---------- los que siempre están ---------- */
    const guias = [0, 1, 2, 3, 4].map(i => {
      const o = i === 0 ? { ...PZ.ERATOSTENES } : { ...PZ.MAESTRO, piel: [1, 2, 0, 3][i - 1], colorPelo: ['#3a2a1e', '#2a1f18', '#6a4a2a', '#2a1f18'][i - 1], chal: ['#7a4a6e', '#5f7a4a', '#7a4a3a', '#3f6b8a'][i - 1], pelo: i === 3 ? 'corto' : 'rizos' };
      const p = persona(o, { pose: 'narrar' });
      if (i === 0) p.sostener(MON.rolloSuelto(K, 0.16), 'I');
      return p;
    });
    const hipatia = persona({ ...PZ.HIPATIA }, { pose: 'quieto' });
    hipatia.sostener(MON.rolloSuelto(K, 0.16), 'I');
    let hipAntes = -1, hipCamino = null;
    const aprendices = mo.paseantes(18, { opciones: i => PZ.aprendiz(i), inicio: i => ({ x: 9.4 + (i % 5) * 0.45, z: 9.2 + Math.floor(i / 5) * 0.4 }), semilla: 55 });

    /* ---------- por dónde se camina ---------- */
    const enRect = (x, z, r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
    let claveObst = '', vela = [], corros = [];
    function rehacerPaso() {
      const RECTS = V.RESERVAS.filter(r => r.x0 !== undefined && !(r.x0 === L.MUSEO.x - 1.4 && !tiene(39)));
      const circulos = [...MAESTROS.map(q => ({ x: q.x, z: q.y, r: 0.35 })), ...V.RESERVAS.filter(r => r.r).map(r => ({ x: r.x, z: r.z, r: r.r * 0.8 })), ...lamparas.map(L => ({ x: L.x, z: L.y, r: 0.12 }))];
      mo.rehacerCaminos({ circulos, bloquea: (x, z) => V.altura(x, z) < -0.02 || RECTS.some(r => enRect(x, z, r)) || x < 2.25 || z < 2.25 });
      aprendices.rehacer();
      vela = VELA.filter(([x, z]) => mo.caminos.libre(x, z)).map(([x, z]) => ({ x, z, mira: { x: BIB.x, y: BIB.y } }));
      const usados = [];
      corros = MAESTROS.map(m => buscarAsientos(m, 9, usados));
    }
    function buscarAsientos(m, cupo, usados) {
      const cand = [];
      for (const r of [0.75, 1.1]) for (let k = 0; k < 18; k++) { const a = Math.PI / 4 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (0.42 / r); cand.push({ x: m.x + Math.cos(a) * r, z: m.y + Math.sin(a) * r, d: Math.ceil(k / 2) * 0.42 / r + r * 0.6 }); }
      cand.sort((u, v) => u.d - v.d);
      const lista = [];
      for (const c of cand) {
        if (lista.length >= cupo) break;
        if (!mo.caminos.libre(c.x, c.z) || V.altura(c.x, c.z) < -0.02 || V.reservado(c.x, c.z, 0.05)) continue;
        if (usados.some(u => Math.hypot(u.x - c.x, u.z - c.z) < 0.36) || MAESTROS.some(o => Math.hypot(o.x - c.x, o.y - c.z) < 0.5)) continue;
        if (Math.hypot(c.x - LUGAR_HIPATIA.x, c.z - LUGAR_HIPATIA.y) < 0.5) continue;
        const q = { x: c.x, z: c.z, mira: { x: m.x, y: m.y } }; lista.push(q); usados.push(q);
      }
      return lista;
    }

    /* ---------- cada cuadro ---------- */
    /* EL SECRETO DE LA ÉPOCA: en invierno, con el mar cerrado, de noche, un fuego verde en una azotea de Racotis: el horno
       del alquimista y la serpiente que se muerde la cola (ΕΝ ΤΟ ΠΑΝ) */
    const secretoHermes = (() => {
      const [x0, z0, w, d, h] = V.CASAS[V.AZOTEA_ALQUIMISTA], x = x0 + w / 2, z = z0 + d / 2;
      const horno = SE.hornoAlquimista(K); horno.position.set(x, h + 0.04, z); dyn.add(horno);
      const ch = SE.chispitas(6, 0.25, 0.5); ch.position.set(x + 0.08, h + 0.08, z + 0.08); dyn.add(ch);
      const luzV = new THREE.PointLight('#5dff8a', 0, 2.6, 1.6); luzV.position.set(x - 0.05, h + 0.22, z + 0.12); raiz.add(luzV);   // desde la boca del horno, a ras de la azotea
      /* la alquimista agachada junto al horno, cuidando el fuego (María la Judía, la del baño de María) */
      const maria = persona({ piel: 1, pelo: 'moño', colorPelo: '#2a1f18', ropa: 'tunica', colorRopa: '#34405e', chal: '#2f6b3a' }, { pose: 'agachado' });
      ubicar(maria, x + 0.08, z - 0.24, { x: x - 0.26, y: z - 0.06 }, h + 0.03); maria.obj.scale.setScalar(0.85);
      return (t, dt, luz, on) => {
        const ve = on && luz < 0.4 && estacion().i === 3;
        horno.visible = ve; ch.visible = ve && !secretoHallado('hermes');
        if (ver(maria, ve)) animar(maria, t, dt);
        luzV.intensity = ve ? 1.3 + 0.35 * Math.sin(t * 7) * Math.sin(t * 2.3) : 0;
        if (!ve) return;
        ch.userData.titilar(t); horno.userData.llama.scale.set(1, 1 + 0.3 * Math.sin(t * 13), 1);
        tocable(x + 0.08, z + 0.08, { k: 'secreto', id: 'hermes', x, y: z }, { rx: 20, ry: 13, dy: (h + 0.1) * Z2D });
      };
    })();
    function sincronizar(t, dt) {
      const e5 = S.era === 5, luz = luzDia(), noche = nocheCasa();
      vestir();
      const lk = Math.max(0, Math.min(1, (0.55 - luz) / 0.25));
      luciernagas.userData.k = lk * lk * (3 - 2 * lk) * 0.4; luciernagas.visible = luciernagas.userData.k > 0.01;

      // --- las ranuras de los saberes ---
      const f39 = fase(39), etapa39 = f39 === 'sin' ? null : f39 === 'meseta' ? niv(39) : 'obra';
      ranura('museo', etapa39, () => oficio(39, () => PZ.museo(K, etapa39)));
      ranura('rollos', tiene(40) ? llave(40) : null, () => oficio(40, () => PZ.rollos(K, niv(40))));
      ranura('hija', fase(40) === 'meseta' && niv(40) >= 3 ? 1 : null, () => oficio(40, () => PZ.hija(K)));
      ranura('pinakes', tiene(41) ? llave(41) : null, () => oficio(41, () => PZ.pinakes(K, niv(41))));
      ranura('elementos', tiene(42) ? llave(42) : null, () => oficio(42, () => PZ.elementos(K, niv(42))));
      ranura('sombra', tiene(43) ? llave(43) : null, () => oficio(43, () => PZ.sombra(K, niv(43))));
      ranura('codice', tiene(44) ? llave(44) : null, () => oficio(44, () => PZ.codice(K, niv(44))));
      const clave = mo.claveRanuras() + '|' + S.docentes;
      if (clave !== claveObst) { claveObst = clave; rehacerPaso(); }
      mo.animarRanuras(t, dt);

      // --- los tocables: las piezas y el mundo ---
      for (const r of Object.values(ranuras)) if (r.P && r.P.toc) for (const q of r.P.toc) tocP(q.x, q.y, { k: q.k }, q.p);
      tocable(FARO.x, FARO.y, { k: 'faro' }, { rx: 40, ry: 30, dy: 90 });
      tocable(SERAPEO.x, SERAPEO.y, { k: 'serapeo' }, { rx: 70, ry: 40, dy: 30 });
      tocable(BIB.x, BIB.y, { k: 'biblioteca' }, { rx: 50, ry: 26, dy: 26 });
      if (!tiene(39)) tocable(L.MUSEO.x, L.MUSEO.y, { k: 'museo' }, { rx: 60, ry: 30, dy: 6 });
      tocable(L.MUELLE.x, L.MUELLE.y - 0.15, { k: 'muelle' }, { rx: 22, ry: 12, dy: 6 });
      tocable(L.BARCA.x, L.BARCA.y, { k: 'barca' }, { rx: 20, ry: 12, dy: 10 });
      tocable(12.0, L.lago(12) + 0.6, { k: 'mareotis' }, { rx: 60, ry: 20, dy: 0 });
      if (S.barco) tocable(barco.position.x, barco.position.z, { k: 'barco' }, { rx: 34, ry: 18, dy: 20 });
      flota.forEach(f => { if (moverNavio(f, t)) tocable(f.n.position.x, f.n.position.z, { k: 'navio' }, { rx: 40 * f.s / 0.56, ry: 20, dy: 26 * f.s / 0.56 }); });

      // --- el barco: entra al puerto, amarra junto al espigón y zarpa (el motor manda: S.barco) ---
      moverBarco(t, dt);
      barca.position.y = V.NIVEL_MAR - 0.01 + 0.008 * Math.sin(t * 1.4); barca.rotation.z = 0.02 * Math.sin(t * 1.1);
      // --- los rollos que esperan en el muelle, y su brillo cuando se pueden catalogar ---
      const pend = e5 ? rollosPend() : 0;
      rollosMuelle.forEach((g, i) => { g.visible = i < pend; });
      brilloMuelle.visible = e5 && puedeCatalogar(); brilloMuelle.material.opacity = 0.18 + 0.12 * Math.sin(t * 2.5);

      // --- los maestros y Eratóstenes ---
      const vis = Math.min(S.alumnos, 18), sueltos = Math.min(vis, Math.max(0, Math.round(S.alumnos - alumnosBien())));
      const cupos = [Math.min(12, BALANCE.ratioDocente + 3 + palestraSitio()), ...[1, 2, 3, 4].map(k => k < S.docentes ? cupoGuia(k) + palestraSitio() : 0)];
      const plan = [], planM = [];
      corros.forEach((sitios, m) => { for (let j = 0; j < Math.min(cupos[m], sitios.length) && plan.length < vis - sueltos; j++) { plan.push(sitios[j]); planM.push(m); } });
      guias.forEach((p, i) => {
        if (!ver(p, i === 0 ? S.docentes >= 1 : i < S.docentes)) return;
        const m = MAESTROS[i]; ubicar(p, m.x, m.y, noche > 0.5 ? { x: BIB.x, y: BIB.y } : { x: m.x + 1, y: m.y + 1 });
        p.e.pose = noche > 0.5 && i > 0 ? 'quieto' : 'narrar'; animar(p, t, dt); tocP(m.x, m.y, { k: 'docente', i }, p);
      });

      // --- Hipatia: llega por la vía Canópica desde el oeste, espera en la plaza y, recibida, enseña en la calle ---
      const estH = e5 ? estadoPensador('hipatia') : 0;
      if (estH !== hipAntes && hipAntes !== -1 && estH > 0 && nacimientosVivos) {
        const desde = hipAntes === 1 ? ESPERA_HIPATIA : { x: 2.4, y: 9.6 }, hasta = estH === 1 ? ESPERA_HIPATIA : LUGAR_HIPATIA;
        hipCamino = { cola: mo.caminos.ruta({ x: desde.x, z: desde.y }, { x: hasta.x, z: hasta.y }), pos: { x: desde.x, z: desde.y } };
      }
      hipAntes = estH;
      if (ver(hipatia, estH >= 1)) {
        const L0 = estH === 1 ? ESPERA_HIPATIA : LUGAR_HIPATIA;
        let px = L0.x, py = L0.y, anda = false, mira = { x: 10.2, y: 11.0 };
        if (hipCamino) {
          const c = hipCamino, d = c.cola[0];
          if (!d) hipCamino = null;
          else { const dx = d.x - c.pos.x, dz = d.z - c.pos.z, L = Math.hypot(dx, dz); if (L < 0.05) c.cola.shift(); else { const s = Math.min(L, 0.6 * dt); c.pos.x += dx / L * s; c.pos.z += dz / L * s; } px = c.pos.x; py = c.pos.z; anda = true; mira = { x: px + dx, y: py + dz }; }
        }
        ubicar(hipatia, px, py, mira); hipatia.e.pose = anda ? 'andar' : estH === 2 && noche < 0.5 ? 'narrar' : 'quieto'; animar(hipatia, t, dt);
        tocP(px, py, { k: 'pensador', id: 'hipatia' }, hipatia);
      }

      // --- los estudiantes: de día, los corros; de noche, seis leen en el pórtico de la Biblioteca ---
      const deNoche = noche > 0.5;
      const asiento = deNoche ? i => vela[i] || null : i => plan[i] || null;
      const maestro = m => LEX().nombres[m % LEX().nombres.length];
      aprendices.paso(t, dt, deNoche ? Math.min(vis, vela.length) : vis, { asiento, mira: MAESTROS[0] }, a => ({ k: 'alumno', i: a.i, con: deNoche ? undefined : planM[a.i] !== undefined ? maestro(planM[a.i]) : null }));

      // --- la noche: el fuego del Faro, las lámparas de la Biblioteca y de la plaza, el hogar de las casas ---
      const oscuro = luz < 0.5, n1 = 1 - luz;
      lamparas.forEach(L => { const ll = L.l.userData.llama; ll.visible = oscuro; ll.scale.set(1, 1 + 0.25 * Math.sin(t * 12 + L.x), 1); });
      llamasFaro.forEach((f, i) => { const k = 1 + 0.12 * Math.sin(t * 9 + i) + 0.06 * Math.sin(t * 23 + i * 2); f.scale.set(1 / k, k, 1 / k); });
      luzFaro.intensity = n1 * 6 * (0.9 + 0.1 * Math.sin(t * 7));
      luzBib.intensity = n1 * 3.2 * (0.92 + 0.08 * Math.sin(t * 9));
      luzPlaza.intensity = n1 * 1.6 * (0.9 + 0.1 * Math.sin(t * 11));
      luzCasas.intensity = n1 * 2.2 * (0.9 + 0.1 * Math.sin(t * 7));

      secretoHermes(t, dt, luz, e5);
      mo.luces(t);
      vivos.forEach(f => f(t, dt));
      return { luz, brasa: 0 };
    }

    /* el barco que trae libros: entra desde el este por el puerto, amarra junto al espigón y vuelve a salir */
    const ENTRA = 4.5, SALE = 5;
    function moverBarco(t, dt) {
      const b = S.era === 5 && S.barco;
      if (!b) { barco.visible = false; return; }
      const u = S.tiempoJuego - b.t0, amarre = { x: L.AMARRE.x, z: L.AMARRE.y }, lejos = { x: 17.6, z: 2.7 };
      let x, z, alfa = 1;
      if (u < ENTRA) { const k = smooth(Math.min(1, u / ENTRA)); x = lejos.x + (amarre.x - lejos.x) * k; z = lejos.z + (amarre.z - lejos.z) * k; alfa = Math.min(1, u / 1.2); }
      else if (u < BARCO_AMARRA - SALE) { x = amarre.x; z = amarre.z; }
      else { const k = smooth(Math.min(1, (u - (BARCO_AMARRA - SALE)) / SALE)); x = amarre.x + (lejos.x - amarre.x) * k; z = amarre.z + (lejos.z - amarre.z) * k; alfa = Math.min(1, (BARCO_AMARRA - u) / 1.2); }
      barco.visible = alfa > 0.02; barco.position.set(x, V.NIVEL_MAR - 0.02 + 0.01 * Math.sin(t * 1.2), z);
      barco.rotation.y = Math.PI; barco.rotation.z = 0.02 * Math.sin(t * 0.9);   // la proa al oeste: entra desde el este por el puerto
      opacidad(barco, alfa);
    }

    /* el navío del grano: de la mañana a la tarde del otoño, del borde del este hasta el Faro, despacio, con la proa al oeste
       (Roma queda al noroeste); se pierde antes de la isla */
    function moverNavio(f, t) {
      const e = estacion(), u = e.i === 2 ? (e.f - 0.22 - f.du * 0.5) / 0.5 : -1, n = f.n;
      if (!(u > 0 && u < 1)) { n.visible = false; return false; }
      const alfa = Math.min(1, u / 0.06, (1 - u) / 0.08);
      n.position.set(18.4 - (18.4 - 5.9) * u, V.NIVEL_MAR - 0.02 + 0.012 * Math.sin(t * 1.0 + f.du * 9), 2.32);
      n.rotation.z = 0.025 * Math.sin(t * 0.8 + f.du * 7); n.visible = alfa > 0.02; opacidad(n, alfa);
      return n.visible;
    }

    /* ---------- el estado de cada saber y los globos: el pase 2D ---------- */
    const ALTO = { 39: 60, 40: 40, 41: 40, 42: 34, 43: 40, 44: 36 };
    const DONDE = { 39: PZ.ANCLAS.museo, 40: PZ.ANCLAS.rollos, 41: PZ.ANCLAS.pinakes, 42: PZ.ANCLAS.elementos, 43: PZ.ANCLAS.sombra, 44: PZ.ANCLAS.codice };
    function superponer(t) {
      for (const i of [39, 40, 41, 42, 43, 44]) { if (!tiene(i)) continue; const a = DONDE[i], p = P(a.x, a.y, ALTO[i]); estadoTec(i, { x: p.x, y: p.y }, t); }
      if (S.era !== 5) return;
      if (estadoPensador('hipatia') === 1 && VISITAS.hipatia && !hipCamino) drawGlobo(ESPERA_HIPATIA.x, ESPERA_HIPATIA.y, t);
    }

    /* ---------- los rótulos de acción: lo que se toca en Alejandría ---------- */
    function rotulos(ancla, t, tocarEn) {
      const e5 = S.era === 5;
      ancla('catalogar', e5 && puedeCatalogar(), L.MUELLE.x, L.MUELLE.y - 0.15, 30, `catalogar · ${rollosPend()}`, 'accion', () => { if (!abrirCatalogo()) catalogar(AUTORES_AL[S.muelle[0].a].g); });
      ancla('originales', e5 && rollosAbierto() && !S.originales && S.vioBarco, L.BARCA.x, L.BARCA.y, 34, '¿y los originales?', 'accion', () => abrirEleccionOriginales());
      ancla('sombra', e5 && sombraDisponible(), L.VARA.x, L.VARA.y, 60, 'medir la sombra', 'accion', () => medirSombra());
      const estH = e5 ? estadoPensador('hipatia') : 0;
      ancla('recibir', estH === 1 && S.apr >= (VISITAS.hipatia?.costo || 0), ESPERA_HIPATIA.x, ESPERA_HIPATIA.y, 52, 'recibir a Hipatia', 'accion', () => tocarEn(ESPERA_HIPATIA.x, ESPERA_HIPATIA.y));
    }

    /* las caras de quienes firman la consejera en esta época */
    const caras = {
      'eratóstenes': { ...PZ.ERATOSTENES },
      'hipatia': { ...PZ.HIPATIA },
    };
    return { quieto, nubes, sincronizar, superponer, rotulos, caras, aprendices, get corros() { return corros; } };
  },
};
