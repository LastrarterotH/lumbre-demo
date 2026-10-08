/* ============================================================
   epocas/epoca3
   La Época 3 (Egipto, la Casa de la Vida) sobre el motor 3D. Como las otras: aquí vive lo de ESTA época (su
   valle, sus monumentos, sus piezas, quién está dónde, su año de tres estaciones, su noche y sus rótulos); el
   cómo lo pone motor3d.js. El valle, los monumentos y los saberes viven en src/egipto/.
   Los monumentos son los que el usuario eligió en la hoja de bocetos (juego3d/bocetos/egipto.html): Guiza como
   la vio el escriba hacia 1500 a. C. (revestida de caliza de Tura), la Esfinge de piedra, el templo del pilono
   y, a la entrada, los colosos y los obeliscos. Las posiciones son las del motor 2D salvo donde el 2D dibujaba
   cosas encimadas sobre la Casa: el templo en 3D ocupa su huella de verdad y lo de delante se corrió al patio.
   ============================================================ */
import * as THREE from 'three';
import { fundir } from '../kit.js';
import * as M from '../mundo.js';
import * as V from '../egipto/valle.js';
import * as MON from '../egipto/monumentos.js';
import * as PZ from '../egipto/piezas.js';
import { tronco } from '../sumer/monumentos.js';
import { vasija, conActores } from '../piezas.js';
import { fase, tiene, niv, llave, Z2D } from '../motor3d.js';
import * as SE from '../secretos.js';

/* ---------- dónde está cada cosa ---------- */
export const TEMPLO = { x: 9.45, y: 5.82, s: 0.72 };                       // la Casa de la Vida: el pilono mira al río
const FRENTE = 6.8, PUERTA_T = { x: 9.45, y: 6.82 };
export const PIRAMIDES = [                                                 // Guiza a la escala del valle, con sus proporciones reales
  { id: 'menkaura', x: 2.8, y: 4.3, lado: 1.22, alto: 0.76, roca: 0 },
  { id: 'jafra', x: 4.85, y: 3.5, lado: 2.52, alto: 1.68, roca: 0.12 },
  { id: 'jufu', x: 7.65, y: 3.42, lado: 2.7, alto: 1.72, roca: 0 },
];
export const ESFINGE = { x: 12.47, y: 4.0, s: 0.9 };
const COLOSOS = [{ x: 8.6, y: 9.6 }, { x: 10.3, y: 9.6 }], OBELISCOS = [{ x: 7.9, y: 10.1 }, { x: 11.0, y: 10.1 }], FARAON = { x: 9.45, y: 10.0 };
const BRASEROS = [{ x: 9.05, y: 7.05 }, { x: 9.85, y: 7.05 }];
/* los que enseñan: Kagemni junto al poblado y las guías en los claros */
const MAESTROS = [{ x: 5.5, y: 8.62 }, { x: 5.95, y: 7.4 }, { x: 14.75, y: 6.3 }, { x: 6.45, y: 10.25 }, { x: 12.2, y: 8.75 }];
const PATIO = PZ.ANCLAS.patio, KEMYT = PZ.ANCLAS.kemyt;
const PUESTOS_PATIO = [[9.45, 8.3], [9.95, 8.4], [10.45, 8.35]], PUESTOS_KEMYT = [[13.35, 7.95], [13.8, 8.2], [14.3, 7.95]];
const VELA = [[13.6, 8.3], [14.0, 8.4], [14.4, 8.3], [14.8, 8.1], [13.9, 7.95], [14.3, 8.0], [14.7, 7.75], [15.1, 7.9]];
const PUERTA = { x: 10.6, y: 9.0 };                                        // donde espera Ptahhotep antes de ser recibido
const RUTA_PADRE = [[17.9, 9.0], [15.4, 9.0], [13.2, 8.95], [11.7, 8.45]];
const GATO = { x: 9.6, y: 8.85, rx: 1.9, ry: 0.4 };
const CABRA = { x0: 3.1, x1: 3.65, y0: 8.5, y1: 8.9 };
const COCODRILO = { x: 15.4, y: 15.55 }, GARZA = { x: 15.9, y: 14.6 };
const LINDES = [[13.77, 8.62], [12.01, 11.07], [10.61, 13.01], [9.21, 14.96]];

/* lo que ocupa cada cosa: ahí no nacen campos, hierba ni ondas de arena, y nadie camina */
function reservar() {
  const R = V.RESERVAS; R.length = 0;
  const w = 3.5 * TEMPLO.s / 2, fz = FRENTE, bz = TEMPLO.y - 1.4 * TEMPLO.s;
  R.push({ x0: TEMPLO.x - w, x1: TEMPLO.x + w, z0: bz, z1: fz + 0.05 });
  PIRAMIDES.forEach(p => { const h = p.lado / 2 + (p.roca ? 0.15 : 0); R.push({ x0: p.x - h, x1: p.x + h, z0: p.y - h, z1: p.y + h + 0.45 }); });
  R.push({ x0: ESFINGE.x - 0.72, x1: ESFINGE.x + 0.72, z0: ESFINGE.y - 1.45, z1: ESFINGE.y + 1.45 });
  V.CASAS.forEach(([x0, z0, w2, d]) => R.push({ x0, x1: x0 + w2, z0, z1: z0 + d }));
  V.MASTABAS.forEach(([x0, z0, w2, d]) => R.push({ x0, x1: x0 + w2, z0, z1: z0 + d }));
  R.push({ x0: PZ.ANEXO.x0 - 0.5, x1: PZ.ANEXO.x1 + 1.3, z0: PZ.ANEXO.z0, z1: PZ.ANEXO.z1 + 1.0 });
  [...COLOSOS, ...OBELISCOS, FARAON, ...BRASEROS].forEach(q => R.push({ x: q.x, z: q.y, r: 0.4 }));
  [PATIO, PZ.ANCLAS.paleta, PZ.ANCLAS.papiro, PZ.ANCLAS.mesa, KEMYT].forEach(q => R.push({ x: q.x, z: q.y, r: 0.75 }));
  R.push({ x: PZ.ANCLAS.cuerda.x, z: PZ.ANCLAS.cuerda.y, r: 1.0 }, { x: V.SHADUF.x, z: V.SHADUF.y, r: 0.5 });
  LINDES.forEach(([x, z]) => R.push({ x, z, r: 0.35 }));
  R.push({ x: 3.4, z: 8.7, r: 0.5 }, { x: V.HORNO.x, z: V.HORNO.y, r: 0.3 });
}

export default {
  era: 3,
  nombre: 'La Casa de la Vida',
  piezas: PZ.PIEZAS,
  construir(mo) {
    const { K, raiz, dyn, vivos, ranura, ranuras, persona, ubicar, ver, animar, opacidad, tocP } = mo;
    const oficio = (i, f) => conActores(fase(i) === 'meseta', f);
    reservar();

    /* ---------- el valle: lo quieto se funde; el suelo, el agua y los campos se repintan con el año ---------- */
    const suelo = V.suelo(K), rio = V.rio(K, vivos), campos = V.campos(K), veg = V.vegetacion(K, vivos);
    const quieto = new THREE.Group();
    quieto.add(V.losa(K), V.canales(K), V.pisado(K), V.desierto(K), V.poblado(K), V.mastabas(K, tronco), veg.g, campos.g);
    /* la necrópolis: Guiza como la vio el escriba, al fondo del valle */
    PIRAMIDES.forEach(p => {
      const py = MON.piramide(K, p.lado, p.alto, 'revestida'); py.position.set(p.x, V.ALTO_MESETA + p.roca, p.y); quieto.add(py);
      if (p.roca) { const r = K.malla(K.caja(p.lado + 0.3, p.roca, p.lado + 0.3), MON.EG.calizaD, { grosor: 0.01 }); r.position.set(p.x, V.ALTO_MESETA + p.roca / 2, p.y); quieto.add(r); }
      if (p.id === 'menkaura') { const f = 0.28, gr = K.malla(tronco(p.lado, p.lado, p.lado * (1 - f), p.lado * (1 - f), p.alto * f), MON.EG.granito, { grosor: 0.012 }); gr.geometry.userData.propia = true; gr.position.set(p.x, V.ALTO_MESETA, p.y); gr.scale.setScalar(1.005); quieto.add(gr); }
      if (p.id !== 'jufu') {                                    // el templo del culto al pie de la cara que mira al río
        const t = new THREE.Group(); t.position.set(p.x, V.ALTO_MESETA, p.y + p.lado / 2 + (p.roca ? 0.15 : 0) + 0.22); quieto.add(t);
        const w = p.id === 'jafra' ? 0.8 : 0.5;
        t.add(en(K.malla(K.caja(w, 0.24, 0.36), MON.EG.caliza, { grosor: 0.01 }), 0, 0.12, 0));
        t.add(en(K.malla(K.caja(w * 0.35, 0.18, 0.02), '#3a2a1c', { sinTinta: true }), 0, 0.09, 0.18));
      }
    });
    const esf = MON.esfinge(K, 'piedra'); esf.scale.setScalar(ESFINGE.s); esf.position.set(ESFINGE.x, 0, ESFINGE.y); quieto.add(esf);
    const templo = MON.casaVida(K, 3, 'pilono'); templo.scale.setScalar(TEMPLO.s); templo.position.set(TEMPLO.x, 0, TEMPLO.y); quieto.add(templo);
    const banderas = []; templo.traverse(o => { if (o.userData.banderola) banderas.push(o); });
    COLOSOS.forEach(c => { const k = MON.coloso(K); k.scale.setScalar(0.58); k.position.set(c.x, 0, c.y); quieto.add(k); });
    OBELISCOS.forEach(o => { const k = MON.obelisco(K, 1.55); k.position.set(o.x, 0, o.y); quieto.add(k); });
    const braseros = BRASEROS.map(b => { const q = PZ.brasero(K); q.position.set(b.x, 0, b.y); dyn.add(q); return q; });
    const shaduf = crearShaduf(K); shaduf.obj.position.set(V.SHADUF.x, 0, V.SHADUF.y); dyn.add(shaduf.obj);
    fundir(K, quieto); raiz.add(suelo, rio.g, quieto);
    const nubes = M.nubes(K, vivos); raiz.add(nubes.g);
    const luciernagas = M.luciernagas(vivos); raiz.add(luciernagas);
    const luzPuerta = new THREE.PointLight('#ffb35c', 0, 6.5, 1.5); luzPuerta.position.set(9.6, 1.1, 7.5); raiz.add(luzPuerta);
    const luzVela = new THREE.PointLight('#ffc27a', 0, 5, 1.6); luzVela.position.set(14.1, 0.9, 7.8); raiz.add(luzVela);
    const luzPoblado = new THREE.PointLight('#ffae5a', 0, 5, 1.6); luzPoblado.position.set(4.2, 0.9, 7.6); raiz.add(luzPoblado);
    const boca = K.malla(K.caja(0.09, 0.08, 0.02), '#ff9a3a', { sinTinta: true, emissive: '#ff8a2a', emissiveIntensity: 0 }); boca.position.set(V.HORNO.x, 0.085, V.HORNO.y + 0.2); dyn.add(boca);

    /* ---------- el año de Egipto (ESTACIONES_EGIPTO del motor): tres estaciones, el agua sube y baja ---------- */
    let pasoVestido = -1;
    function vestir() {
      const e = mo.estacionHoy();
      if (e.paso === pasoVestido) return; pasoVestido = e.paso;
      const k = e.k || 0, sig = e.sig || e, mez = (a, b) => k > 0 ? lerpHex(a, b, k) : a;
      const pal = { vega: e.vega.map((c, i) => mez(c, sig.vega[i])) };
      for (const c of ['ribera', 'humedo', 'aguaBaja', 'cauce', 'hondo']) pal[c] = mez(e[c], sig[c]);
      suelo.userData.pintar(pal); rio.pintar(pal);
      rio.crecida = (e.crecida || 1) + ((sig.crecida || 1) - (e.crecida || 1)) * k; rio.nivel = V.nivelNilo(rio.crecida);
      campos.vestir(e.i, k, sig.i ?? ((e.i + 1) % 3));
      veg.pasto.material.color.set(mez(e.vega[1], sig.vega[1])).multiplyScalar(0.85);
    }

    /* ---------- los que siempre están ---------- */
    const guias = [0, 1, 2, 3, 4].map(i => {
      const p = persona(i === 0
        ? { piel: 2, pelo: 'peluca', colorPelo: '#1c1612', ropa: 'corta', colorRopa: MON.EG.lino, torsoDesnudo: true, sinFlecos: true, usej: true }
        : { ...PZ.ESCRIBA, piel: [3, 1, 2, 0][i - 1], pelo: ['rapado', 'peluca', 'corto', 'peluca'][i - 1], ropa: i === 2 ? 'tunica' : 'corta', torsoDesnudo: i !== 2, colorRopa: ['#f2ecdc', '#f4efe2', '#ebe3cf', '#f2ecdc'][i - 1] }, { pose: 'narrar' });
      const r = rollo(K); r.rotation.x = 1.2; r.position.y = -0.04; p.sostener(r, 'I');
      return p;
    });
    const ptah = persona({ piel: 1, pelo: 'rapado', ropa: 'tunica', colorRopa: '#f2ead2', orla: '#c9a24a', usej: ['#3e8f6c', '#e2ac45'] }, { pose: 'baston' });
    { const b = K.malla(K.cilindro(0.012, 0.014, 0.95, 5), '#6a4a2a', { grosor: 0.004 }); b.position.y = -0.1; ptah.sostener(b, 'D'); }
    let ptahAntes = -1, ptahCamino = null;
    const faraon = persona({ piel: 2, corona: 'doble', ropa: 'corta', colorRopa: MON.EG.lino, torsoDesnudo: true, sinFlecos: true, usej: true, barba: '#3a2c1c' }, { pose: 'quieto' });
    { const cay = new THREE.Group(); cay.add(K.malla(K.cilindro(0.012, 0.012, 0.3, 6), MON.EG.azul, { grosor: 0.003 })); const gancho = K.malla(K.toro(0.035, 0.011, Math.PI, 0.4), MON.EG.oro, { sinTinta: true }); gancho.position.y = 0.15; gancho.rotation.z = Math.PI / 2; cay.add(gancho); cay.rotation.x = 0.4; faraon.sostener(cay, 'I');
      const fl = new THREE.Group(); fl.add(K.malla(K.cilindro(0.01, 0.01, 0.2, 5), MON.EG.oro, { sinTinta: true })); for (let k = 0; k < 3; k++) { const c = K.malla(K.cilindro(0.006, 0.006, 0.12, 4), MON.EG.azul, { sinTinta: true }); c.position.set((k - 1) * 0.015, 0.14, 0); c.rotation.z = (k - 1) * 0.3; fl.add(c); } fl.rotation.x = 0.4; faraon.sostener(fl, 'D'); }
    const padre = persona({ piel: 3, pelo: 'corto', colorPelo: '#1c1612', ropa: 'corta', colorRopa: '#e2d6bc', torsoDesnudo: true, sinFlecos: true }, { pose: 'andar' });
    const hijo = persona(PZ.aprendiz(5), { pose: 'andar' });
    const campesino = persona({ piel: 3, pelo: 'corto', colorPelo: '#1c1612', ropa: 'corta', colorRopa: '#d8cbb0', torsoDesnudo: true, sinFlecos: true }, { pose: 'pertiga' });
    const aprendices = mo.paseantes(18, { opciones: i => PZ.aprendiz(i), inicio: i => ({ x: 8.6 + (i % 5) * 0.55, z: 8.6 + Math.floor(i / 5) * 0.45 }), semilla: 33 });
    const falua = crearFalua(K); dyn.add(falua.obj);
    const barquero = persona({ piel: 3, pelo: 'corto', colorPelo: '#1c1612', ropa: 'corta', colorRopa: '#d6c7a4', torsoDesnudo: true, sinFlecos: true }, { pose: 'pertiga' });
    falua.obj.scale.setScalar(1.6);                        // la barca del Nilo es grande: el barquero va de pie en la popa
    const cabra = crearCabra(K); cabra.obj.position.set(3.35, 0, 8.7); dyn.add(cabra.obj); cabra.dx = 3.35; cabra.dy = 8.7; cabra.espera = 1;
    const gato = crearGato(K); dyn.add(gato.obj);
    const coco = crearCocodrilo(K); coco.position.set(COCODRILO.x, 0.0, COCODRILO.y); coco.rotation.y = 2.4; dyn.add(coco);
    const garza = crearGarza(K); garza.obj.position.set(GARZA.x, 0, GARZA.y); garza.obj.rotation.y = -0.8; dyn.add(garza.obj);
    const ibis = bandadaIbis(K); dyn.add(ibis.obj);
    const lindes = LINDES.map(() => { const l = PZ.linde(K); dyn.add(l.obj); return l; });
    const lamparas = [
      { x: 3.62, y: 7.35, si: () => true },                                          // la puerta del poblado
      { x: KEMYT.x + 0.1, y: KEMYT.y + 0.28, si: () => tiene(22) },                  // el candil de la Kemyt
      { x: 7.52, y: 8.02, si: () => tiene(32) },                                     // la casa de los libros
      { x: PATIO.x - 0.62, y: PATIO.y + 0.05, si: () => tiene(31) },                 // el patio de las lascas
      { x: PZ.ANCLAS.mesa.x - 0.42, y: PZ.ANCLAS.mesa.y + 0.1, si: () => tiene(20) },   // la mesa del papiro
    ].map(L => { const l = PZ.lampara(K); l.position.set(L.x, 0, L.y); dyn.add(l); return { ...L, l }; });

    /* ---------- por dónde se camina ---------- */
    const enRect = (x, z, r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
    const RECTS = V.RESERVAS.filter(r => r.x0 !== undefined && !(r.x0 === PZ.ANEXO.x0 - 0.5));
    let claveObst = '', vela = [], corros = [];
    function rehacerPaso() {
      const circulos = [...COLOSOS, ...OBELISCOS, FARAON, ...BRASEROS].map(q => ({ x: q.x, z: q.y, r: 0.38 }))
        .concat(MAESTROS.map(q => ({ x: q.x, z: q.y, r: 0.35 })), [{ x: 13.1, z: 6.2, r: 0.35 }],
          V.PALMERAS.map(([x, z]) => ({ x, z, r: 0.22 })), V.SICOMOROS.map(([x, z]) => ({ x, z, r: 0.3 })), V.PAPIROS.map(([x, z]) => ({ x, z, r: 0.3 })),
          [{ x: V.HORNO.x, z: V.HORNO.y, r: 0.28 }, { x: V.SHADUF.x, z: V.SHADUF.y, r: 0.35 }, { x: 3.4, z: 8.7, r: 0.5 }], LINDES.map(([x, z]) => ({ x, z, r: 0.2 })),
          lamparas.map(L => ({ x: L.x, z: L.y, r: 0.12 })));
      mo.rehacerCaminos({ circulos, bloquea: (x, z) => V.altura(x, z) < -0.05 || V.meseta(x, z) > 0.02 || RECTS.some(r => enRect(x, z, r)) || x < 2.25 || z < 2.25 });
      aprendices.rehacer();
      vela = tiene(22) ? VELA.filter(([x, z]) => mo.caminos.libre(x, z)).map(([x, z]) => ({ x, z, mira: { x: KEMYT.x, y: KEMYT.y } })) : [];   // sin Kemyt aún, todos vuelven al poblado
      const usados = [];
      corros = MAESTROS.map((m, mi) => {
        if (mi === 0) {                                     // la clase de Kagemni: el patio de las lascas y la Kemyt cuentan como su aula
          const extra = [];
          if (tiene(31)) extra.push(...PUESTOS_PATIO.map(([x, z]) => ({ x, z, mira: PATIO, pose: 'raspar' })));
          if (fase(22) === 'meseta') extra.push(...PUESTOS_KEMYT.map(([x, z]) => ({ x, z, mira: KEMYT })));
          extra.forEach(q => usados.push(q));
          return extra.concat(buscarAsientos(m, 8, usados));
        }
        return buscarAsientos(m, 9, usados);
      });
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
        const q = { x: c.x, z: c.z, mira: { x: m.x, y: m.y } }; lista.push(q); usados.push(q);
      }
      return lista;
    }

    /* ---------- cada cuadro ---------- */
    /* EL SECRETO DE LA ÉPOCA: en la crecida, de noche, algo dorado brilla bajo el Nilo; al tocarlo, sube la caja de oro
       del Libro de Thot con su serpiente, y se vuelve a hundir */
    const secretoThot = (() => {
      const x = 13.0, z = 12.7;                               // en agua abierta, lejos de los papiros que lo tapaban
      const res = SE.resplandor(0.42, '#ffb23a'); res.position.set(x, 0, z); dyn.add(res);
      const ond = SE.ondas(3, 0.62, '#ffbf4d'); ond.position.set(x, 0, z); dyn.add(ond);
      const ch = SE.chispitas(6, 0.2, 0.4); ch.position.set(x, 0, z); dyn.add(ch);
      const caja = SE.cajaThot(K); caja.position.set(x, -1, z); caja.visible = false; dyn.add(caja);
      let antes = secretoHallado('thot'), sube = 0;
      return (t, dt, luz, on, nivel) => {
        const hallado = secretoHallado('thot');
        if (hallado && !antes) sube = 0.001; antes = hallado;
        const ve = on && luz < 0.4 && estacion().i === 0;
        res.visible = ond.visible = ch.visible = ve && !hallado; caja.visible = sube > 0;
        if (res.visible) {
          const k = 0.5 + 0.5 * Math.sin(t * 2.2); res.position.y = nivel + 0.006; res.material.opacity = 0.35 + 0.4 * k; res.scale.setScalar(0.85 + 0.25 * k);
          ond.position.y = nivel + 0.008; ond.userData.latir(t); ch.position.y = nivel; ch.userData.titilar(t);
          tocable(x, z, { k: 'secreto', id: 'thot', x, y: z }, { rx: 22, ry: 12, dy: 2 });
        }
        if (sube > 0) {
          const leyendo = document.getElementById('secreto')?.style.display === 'flex';   // con la tarjeta abierta, la caja espera arriba
          sube = leyendo ? Math.min(sube + dt, 1.4) : sube + dt; const u = sube < 1.2 ? sube / 1.2 : sube < 5 ? 1 : Math.max(0, 1 - (sube - 5) / 1.5);
          caja.position.y = nivel - 0.35 + 0.42 * (u * u * (3 - 2 * u)); caja.rotation.y = sube * 0.4; if (sube > 6.5) sube = 0;
        }
      };
    })();
    function sincronizar(t, dt) {
      const e3 = S.era === 3, luz = luzDia(), noche = nocheCasa();
      vestir();
      const lk = Math.max(0, Math.min(1, (0.55 - luz) / 0.25));
      luciernagas.userData.k = lk * lk * (3 - 2 * lk) * 0.6; luciernagas.visible = luciernagas.userData.k > 0.01;

      // --- las ranuras de los saberes ---
      ranura('papiro', tiene(20) ? llave(20) : null, () => oficio(20, () => PZ.papiro(K, niv(20))));
      ranura('paleta', tiene(21) ? llave(21) : null, () => oficio(21, () => PZ.paleta(K, niv(21))));
      ranura('kemyt', tiene(22) ? llave(22) : null, () => oficio(22, () => PZ.kemyt(K, niv(22))));
      ranura('cuerda', tiene(23) ? llave(23) : null, () => oficio(23, () => PZ.cuerda(K, niv(23))));
      const nEj = Math.min(4, S.ejerPend || 0), nLas = Math.min(16, 2 + Math.floor((S.lascas || 0) / 2)), rojo = fase(21) === 'meseta';
      const patio = ranura('lascas', tiene(31) ? `${llave(31)}|${nEj}|${nLas}|${rojo}` : null, () => oficio(31, () => PZ.patioLascas(K, niv(31), { ejer: nEj, lascas: S.lascas || 0, rojo })));
      const mesa = ranura('mesa', tiene(20) ? Math.min(6, S.papiros || 0) : null, () => PZ.mesaPapiro(K, Math.min(6, S.papiros || 0)));
      const f32 = fase(32), etapa32 = f32 === 'sin' ? null : f32 === 'meseta' ? niv(32) : f32 === 'formando' ? 'muros' : 'obra';
      ranura('anexo', etapa32, () => PZ.anexo(K, etapa32));
      const clave = mo.claveRanuras() + '|' + S.docentes;
      if (clave !== claveObst) { claveObst = clave; rehacerPaso(); }
      mo.animarRanuras(t, dt);
      if (patio && patio.aro) patio.aro.userData.latir(t, e3 && (S.ejerPend || 0) > 0);
      if (mesa && mesa.aro) mesa.aro.userData.latir(t, e3 && puedePasarPapiro());

      // --- los tocables: las piezas y el mundo (con las claves del 2D) ---
      for (const r of Object.values(ranuras)) if (r.P && r.P.toc) for (const q of r.P.toc) tocP(q.x, q.y, { k: q.k }, q.p);
      if (tiene(31)) tocable(PATIO.x, PATIO.y, { k: 'patiolascas' }, { rx: 40, ry: 22, dy: 6 });
      if (tiene(20)) tocable(PZ.ANCLAS.mesa.x, PZ.ANCLAS.mesa.y, { k: 'mesapapiro' }, { rx: 28, ry: 16, dy: 12 });
      tocable(ESFINGE.x, ESFINGE.y, { k: 'esfinge' }, { rx: 52, ry: 34, dy: 28 });
      PIRAMIDES.forEach(p => tocable(p.x, p.y, { k: 'piramides' }, { rx: p.lado * 26, ry: p.lado * 14, dy: (V.ALTO_MESETA + p.alto * 0.45) * Z2D }));
      tocable(TEMPLO.x, TEMPLO.y, { k: 'templo' }, { rx: 60, ry: 34, dy: 30 });
      COLOSOS.forEach(c => tocable(c.x, c.y, { k: 'coloso' }, { rx: 16, ry: 12, dy: 40 }));
      OBELISCOS.forEach(o => tocable(o.x, o.y, { k: 'obelisco' }, { rx: 12, ry: 10, dy: 50 }));
      V.CASAS.forEach(([x0, z0, w, d]) => tocable(x0 + w / 2, z0 + d / 2, { k: 'poblado' }, { rx: 26, ry: 16, dy: 12 }));
      tocable(15.0, 4.2, { k: 'mastaba' }, { rx: 30, ry: 16, dy: 8 });

      // --- el templo: las banderolas ondean con el viento del norte ---
      banderas.forEach((b, i) => { b.rotation.y = 0.25 * Math.sin(t * 1.9 + i * 1.3); b.rotation.x = 0.08 * Math.sin(t * 2.7 + i); });

      // --- el faraón, entre los colosos, mirando al río ---
      ubicar(faraon, FARAON.x, FARAON.y, { x: FARAON.x, y: FARAON.y + 1 }); animar(faraon, t, dt); tocP(FARAON.x, FARAON.y, { k: 'faraon' }, faraon);

      // --- el río, el shaduf, la barca, los animales ---
      shaduf.anim(t); ubicar(campesino, V.SHADUF.x - 0.28, V.SHADUF.y + 0.18, { x: V.SHADUF.x + 0.4, y: V.SHADUF.y + 0.2 }); animar(campesino, t, dt);
      tocable(V.SHADUF.x, V.SHADUF.y, { k: 'shaduf' }, { rx: 22, ry: 14, dy: 24 });
      moverFalua(t, dt);
      pastar(t, dt); tocable(cabra.obj.position.x, cabra.obj.position.z, { k: 'cabra' });
      moverGato(t); tocable(gato.obj.position.x, gato.obj.position.z, { k: 'gato' });
      coco.userData.cola.rotation.y = 0.15 * Math.sin(t * 0.6); tocable(COCODRILO.x, COCODRILO.y, { k: 'cocodrilo' });
      garza.anim(t); tocable(GARZA.x, GARZA.y, { k: 'garza' });
      ibis.anim(t, luz);

      // --- los lindes que la crecida borró: laten pidiendo la cuerda ---
      lindes.forEach((l, i) => {
        const hay = e3 && (S.lindes || []).includes(i); l.obj.visible = hay;
        if (!hay) return;
        const [x, y] = LINDES[i]; l.obj.position.set(x, 0, y); l.anim(t);
        tocable(x, y, { k: 'linde' + i });
      });

      // --- los maestros y Ptahhotep ---
      const vis = Math.min(S.alumnos, 18), sueltos = Math.min(vis, Math.max(0, Math.round(S.alumnos - alumnosBien())));
      const cupos = [Math.min(12, BALANCE.ratioDocente + 3), ...[1, 2, 3, 4].map(k => k < S.docentes ? cupoGuia(k) : 0)];
      const plan = [], planM = [];
      for (let m = 0; m < MAESTROS.length && plan.length < vis - sueltos; m++) {
        const sitios = corros[m] || [];
        for (let j = 0; j < Math.min(cupos[m], sitios.length) && plan.length < vis - sueltos; j++) { plan.push(sitios[j]); planM.push(m); }
      }
      guias.forEach((p, i) => {
        if (!ver(p, i === 0 ? S.docentes >= 1 : i < S.docentes)) return;
        const m = MAESTROS[i]; ubicar(p, m.x, m.y, noche > 0.5 ? KEMYT : { x: m.x + 1, y: m.y + 1 });
        p.e.pose = noche > 0.5 && i > 0 ? 'quieto' : 'narrar'; animar(p, t, dt); tocP(m.x, m.y, { k: 'docente', i }, p);
      });
      const estP = e3 ? estadoPensador('ptahhotep') : 0, [lx, ly] = LUGAR_PENSADOR.ptahhotep;
      if (estP === 2 && ptahAntes === 1 && nacimientosVivos) ptahCamino = { cola: mo.caminos.ruta({ x: PUERTA.x, z: PUERTA.y }, { x: lx, z: ly + 0.05 }), pos: { x: PUERTA.x, z: PUERTA.y } };
      ptahAntes = estP;
      if (ver(ptah, estP >= 1)) {
        let px = estP === 1 ? PUERTA.x : lx, py = estP === 1 ? PUERTA.y : ly, anda = false, mira = { x: px + 1, y: py + 1 };
        if (ptahCamino) {
          const c = ptahCamino, d = c.cola[0];
          if (!d) ptahCamino = null;
          else { const dx = d.x - c.pos.x, dz = d.z - c.pos.z, L = Math.hypot(dx, dz); if (L < 0.05) c.cola.shift(); else { const s = Math.min(L, 0.6 * dt); c.pos.x += dx / L * s; c.pos.z += dz / L * s; } px = c.pos.x; py = c.pos.z; anda = true; mira = { x: px + dx, y: py + dz }; }
        }
        ubicar(ptah, px, py, mira); ptah.e.pose = anda ? 'andar' : 'baston'; animar(ptah, t, dt);
        tocP(px, py, { k: 'pensador', id: 'ptahhotep' }, ptah);
      }

      // --- el padre que trae a su hijo a ver el patio (la Sátira de los oficios, vivida) ---
      moverPadre(t, dt, e3 && tiene(31));

      // --- los aprendices: de día, la clase y los corros; de noche, ocho a la luz de la Kemyt y el resto a su casa ---
      const deNoche = noche > 0.5;
      const sentarse = deNoche ? { asiento: i => vela[i] || null, mira: KEMYT } : { asiento: i => plan[i] || null, mira: MAESTROS[0] };
      const maestro = m => LEX().nombres[m % LEX().nombres.length];
      aprendices.paso(t, dt, deNoche ? Math.min(vis, vela.length) : vis, sentarse, a => ({ k: 'alumno', i: a.i, con: deNoche ? undefined : planM[a.i] !== undefined ? maestro(planM[a.i]) : null }));

      // --- la noche: los braseros de la puerta, los candiles, el horno del pan ---
      const oscuro = luz < 0.5;
      braseros.forEach((b, i) => { const ll = b.userData.llama; ll.visible = oscuro; ll.scale.set(1, 1 + 0.25 * Math.sin(t * 11 + i), 1); });
      let enc = 0;
      lamparas.forEach(L => { const on = L.si(); L.l.visible = on; if (!on) return; enc++; const ll = L.l.userData.llama; ll.visible = oscuro; ll.scale.set(1, 1 + 0.25 * Math.sin(t * 12 + L.x), 1); });
      const n1 = 1 - luz;
      luzPuerta.intensity = n1 * 4.2 * (0.92 + 0.08 * Math.sin(t * 9));
      luzVela.intensity = tiene(22) ? n1 * 2.6 * (0.9 + 0.1 * Math.sin(t * 13)) : 0;
      luzPoblado.intensity = n1 * 2.2 * (0.9 + 0.1 * Math.sin(t * 7));
      boca.material.emissiveIntensity = oscuro ? 0.8 + 0.2 * Math.sin(t * 5) : 0.15;

      secretoThot(t, dt, luz, e3, rio.nivel);
      mo.luces(t);
      vivos.forEach(f => f(t, dt));
      return { luz, brasa: 0 };
    }

    /* LA FALÚA (96 s, como el 2D): baja con la corriente con la vela recogida y sube a vela contra ella, porque el
       viento del norte sopla río arriba (la geografía que se les metió en la escritura) */
    function moverFalua(t, dt) {
      const ciclo = 96, f = ((t % ciclo) + ciclo) % ciclo, baja = f < ciclo / 2;
      const u = baja ? f / (ciclo / 2) : 1 - (f - ciclo / 2) / (ciclo / 2), uu = 0.25 + u * 0.52, perp = Math.sin(t * 0.15) * 0.25;
      const p = V.puntoNilo(uu, perp), q = V.puntoNilo(uu + 0.01, perp);
      falua.obj.position.set(p.x, rio.nivel + 0.01 + 0.012 * Math.sin(t * 1.1), p.z);
      falua.obj.rotation.y = Math.atan2(q.x - p.x, q.z - p.z) + (baja ? 0 : Math.PI);
      falua.obj.rotation.z = 0.025 * Math.sin(t * 1.3);
      falua.vela(!baja);
      falua.obj.visible = p.x > V.E0 + 0.4 && p.x < V.E1 - 0.4 && p.z > V.E0 + 0.4 && p.z < V.E1 - 0.4;
      const a = falua.obj.rotation.y; barquero.obj.visible = falua.obj.visible;
      barquero.obj.position.set(p.x - Math.sin(a) * 0.62, falua.obj.position.y + 0.12, p.z - Math.cos(a) * 0.62); barquero.obj.rotation.y = a;
      barquero.e.pose = baja ? 'pertiga' : 'quieto'; barquero.e.dt = dt; barquero.anim(t, barquero.e);
      if (falua.obj.visible) tocable(p.x, p.z, { k: 'falua' }, { rx: 36, ry: 18, dy: 40 });
    }
    function pastar(t, dt) {
      const pos = cabra.obj.position; cabra.espera -= dt;
      if (cabra.espera <= 0) { cabra.dx = CABRA.x0 + Math.random() * (CABRA.x1 - CABRA.x0); cabra.dy = CABRA.y0 + Math.random() * (CABRA.y1 - CABRA.y0); cabra.espera = 3 + Math.random() * 4; }
      const dx = cabra.dx - pos.x, dz = cabra.dy - pos.z, L = Math.hypot(dx, dz);
      if (L > 0.03) { const s = Math.min(L, 0.22 * dt); pos.x += dx / L * s; pos.z += dz / L * s; cabra.obj.rotation.y = Math.atan2(dx, dz); }
      cabra.cab.rotation.x = L > 0.03 ? 0 : 0.5 + 0.2 * Math.sin(t * 2);
    }
    function moverGato(t) {                                // Miu patrulla el patio (posGato del 2D, con su vuelta por delante de la puerta)
      const a = t * 0.12, x = GATO.x + Math.cos(a) * GATO.rx, z = GATO.y + Math.sin(a) * GATO.ry;
      gato.obj.position.set(x, 0, z); gato.obj.rotation.y = Math.atan2(-Math.sin(a) * GATO.rx, Math.cos(a) * GATO.ry);
      gato.anim(t);
    }
    /* el padre trae al hijo de la mano desde el este, se plantan a mirar el patio y vuelven (posPadreHijo del 2D) */
    function moverPadre(t, dt, on) {
      const cyc = ((t / 150) % 1 + 1) % 1;
      const tramo = f => { const n = RUTA_PADRE.length - 1, ft = Math.min(0.999, f) * n, i = Math.floor(ft), k = ft - i, a = RUTA_PADRE[i], b = RUTA_PADRE[i + 1]; return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, dx: b[0] - a[0], dy: b[1] - a[1] }; };
      let p = null, vuelve = false, alfa = 1, mira = false;
      if (cyc < 0.18) { p = tramo(smooth(cyc / 0.18)); alfa = Math.min(1, cyc / 0.03); }
      else if (cyc < 0.34) { p = tramo(1); mira = true; }
      else if (cyc < 0.52) { p = tramo(smooth(1 - (cyc - 0.34) / 0.18)); vuelve = true; alfa = Math.min(1, (0.52 - cyc) / 0.03); }
      const ve = on && p && alfa > 0.02;
      ver(padre, !!ve); ver(hijo, !!ve);
      if (!ve) return;
      const dir = vuelve ? { x: p.dx, y: p.dy } : { x: -p.dx, y: -p.dy }, L = Math.hypot(dir.x, dir.y) || 1, nx = -dir.y / L, nz = dir.x / L;
      const objetivo = mira ? PATIO : { x: p.x + dir.x, y: p.y + dir.y };
      ubicar(padre, p.x, p.y, objetivo); ubicar(hijo, p.x + nx * 0.32, p.y + nz * 0.32, objetivo);
      padre.e.pose = hijo.e.pose = mira ? 'quieto' : 'andar';
      opacidad(padre.obj, alfa); opacidad(hijo.obj, alfa); animar(padre, t, dt); animar(hijo, t, dt);
      if (alfa > 0.6) { tocP(p.x, p.y, { k: 'padre' }, padre); tocP(p.x + nx * 0.32, p.y + nz * 0.32, { k: 'hijoescriba' }, hijo); }
    }

    /* ---------- el estado de cada saber y los globos: el pase 2D ---------- */
    const ALTO = { 20: 30, 21: 26, 22: 40, 23: 24, 31: 26, 32: 46 };
    const DONDE = { 20: PZ.ANCLAS.papiro, 21: PZ.ANCLAS.paleta, 22: KEMYT, 23: PZ.ANCLAS.cuerda, 31: PATIO, 32: PZ.ANCLAS.anexo };
    function superponer(t) {
      for (const i of [20, 21, 22, 23, 31, 32]) { if (!tiene(i)) continue; const a = DONDE[i], p = P(a.x, a.y, ALTO[i]); estadoTec(i, { x: p.x, y: p.y }, t); }
      const estP = S.era === 3 ? estadoPensador('ptahhotep') : 0;
      if (estP === 1 && VISITAS.ptahhotep && !ptahCamino) drawGlobo(PUERTA.x, PUERTA.y, t);
    }

    /* ---------- los rótulos de acción: lo que se toca en Egipto ---------- */
    function rotulos(ancla, t, tocarEn) {
      const e3 = S.era === 3, M2 = PZ.ANCLAS.mesa;
      ancla('practicar', e3 && tiene(31) && (S.ejerPend || 0) > 0 && !(tiene(20) && puedePasarPapiro()), PATIO.x, PATIO.y, 30, `practicar en la piedra · ${S.ejerPend || 0}`, 'accion', () => tocarEn(PATIO.x, PATIO.y));
      ancla('pasar', e3 && tiene(20) && puedePasarPapiro(), M2.x, M2.y, 34, 'pasar al papiro', 'accion', () => tocarEn(M2.x, M2.y));
      for (let i = 0; i < LINDES.length; i++) {
        const [x, y] = LINDES[i];
        ancla('linde' + i, e3 && (S.lindes || []).includes(i), x, y, 22, 'tender la cuerda', 'accion', () => tocarEn(x, y));
      }
      const estP = e3 ? estadoPensador('ptahhotep') : 0;
      ancla('recibir', estP === 1 && S.apr >= (VISITAS.ptahhotep?.costo || 0), PUERTA.x, PUERTA.y, 52, 'recibir a Ptahhotep', 'accion', () => tocarEn(PUERTA.x, PUERTA.y));
    }

    /* las caras de quienes firman la consejera en esta época */
    const caras = {
      'kagemni': { piel: 2, pelo: 'peluca', colorPelo: '#1c1612', ropa: 'corta', colorRopa: MON.EG.lino, torsoDesnudo: true, usej: true },
      'ptahhotep': { piel: 1, pelo: 'rapado', ropa: 'tunica', colorRopa: '#f2ead2', usej: ['#3e8f6c', '#e2ac45'] },
    };
    return { quieto, nubes, sincronizar, superponer, rotulos, caras, aprendices, get corros() { return corros; } };
  },
};

/* ---------- utilería de la época ---------- */
const en = (m, x, y, z) => { m.position.set(x, y, z); return m; };
function rollo(K) {
  const g = new THREE.Group();
  const c = K.malla(K.cilindro(0.022, 0.022, 0.16, 8), '#e8dcb4', { grosor: 0.003 }); c.rotation.z = Math.PI / 2; g.add(c);
  const a = K.malla(K.cilindro(0.025, 0.025, 0.014, 8), '#b5463a', { sinTinta: true }); a.rotation.z = Math.PI / 2; g.add(a);
  return g;
}
/* EL SHADUF: la pértiga que sube el agua del canal a la acequia; el contrapeso de barro hace casi todo el trabajo */
function crearShaduf(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const ang = Math.atan2(V.CANAL[1].z - V.SHADUF.y, V.CANAL[1].x - V.SHADUF.x);
  const base = new THREE.Group(); base.rotation.y = -ang; g.add(base);
  [-1, 1].forEach(l => { const p = K.malla(K.caja(0.1, 0.6, 0.1), '#b88a58', { grosor: 0.008 }); p.position.set(0, 0.3, l * 0.16); base.add(p); });
  const trav = K.malla(K.cilindro(0.02, 0.02, 0.4, 6), '#8a6a4a', { grosor: 0.004 }); trav.rotation.x = Math.PI / 2; trav.position.y = 0.6; base.add(trav);
  const brazo = new THREE.Group(); brazo.position.y = 0.6; base.add(brazo);
  const palo = K.malla(K.cilindro(0.018, 0.024, 1.05, 6), '#8a6a4a', { grosor: 0.005 }); palo.rotation.z = Math.PI / 2; palo.position.x = 0.2; brazo.add(palo);
  const peso = K.malla(K.esfera(0.1), '#8d7446', { grosor: 0.008 }); peso.position.x = -0.3; brazo.add(peso);
  const soga = new THREE.Group(); soga.position.x = 0.68; brazo.add(soga);
  soga.add(en(K.malla(K.cilindro(0.004, 0.004, 0.42, 4), '#b89a6a', { sinTinta: true }), 0, -0.21, 0));
  const balde = vasija(K, [[0.001, 0], [0.05, 0.01], [0.065, 0.07], [0.06, 0.09]], '#b5643a', false); balde.position.y = -0.5; soga.add(balde);
  g.userData.ficha = { titulo: 'El shaduf', texto: 'la pértiga con contrapeso que sube el agua del río a la acequia' };
  return { obj: g, anim(t) { const c = Math.sin(t * 0.9); brazo.rotation.z = 0.32 * c; soga.rotation.z = -brazo.rotation.z; } };
}
/* LA FALÚA: casco de tablones con la proa y la popa alzadas en papiro, mástil y vela cuadrada entre sus vergas,
   la espadilla del timonel, la cabina de esteras y la carga de jarras */
function crearFalua(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const casco = K.malla(K.capsula(0.16, 0.8, 0.8), '#9a6a3e', { grosor: 0.01 }); casco.rotation.x = Math.PI / 2; casco.scale.set(1.15, 1, 0.5); casco.position.y = 0.04; g.add(casco);
  const borda = K.malla(K.caja(0.3, 0.02, 0.9), '#b88a58', { grosor: 0.005 }); borda.position.y = 0.105; g.add(borda);
  [-1, 1].forEach(l => { const p = K.malla(K.cono(0.05, 0.3, 6), '#8f9a4e', { grosor: 0.005 }); p.position.set(0, 0.2, l * 0.58); p.rotation.x = l * 0.7; g.add(p); const um = K.malla(K.cono(0.07, 0.06, 7), '#a9b85a', { sinTinta: true }); um.rotation.x = Math.PI + l * 0.7; um.position.set(0, 0.33, l * 0.68); g.add(um); });   // proa y popa en papiro
  const mastil = K.malla(K.cilindro(0.014, 0.018, 1.0, 5), '#7a5636', { grosor: 0.004 }); mastil.position.set(0, 0.6, 0.12); g.add(mastil);
  const verga = K.malla(K.cilindro(0.01, 0.01, 0.62, 5), '#7a5636', { grosor: 0.003 }); verga.rotation.z = Math.PI / 2; g.add(verga);
  const botavara = K.malla(K.cilindro(0.01, 0.01, 0.62, 5), '#7a5636', { grosor: 0.003 }); botavara.rotation.z = Math.PI / 2; botavara.position.set(0, 0.26, 0.14); g.add(botavara);
  const vela = K.malla(K.caja(0.58, 0.7, 0.01), '#f2ecdc', { grosor: 0.004, side: THREE.DoubleSide }); vela.position.set(0, 0.62, 0.14); g.add(vela);
  const recogida = K.malla(K.cilindro(0.03, 0.03, 0.56, 6), '#e8e0cc', { grosor: 0.004 }); recogida.rotation.z = Math.PI / 2; recogida.position.set(0, 0.3, 0.14); g.add(recogida);
  const cabina = K.malla(K.caja(0.2, 0.14, 0.2), '#c9ad78', { grosor: 0.006 }); cabina.position.set(0, 0.17, -0.18); g.add(cabina);
  const esp = K.malla(K.cilindro(0.01, 0.01, 0.55, 4), '#7a5636', { grosor: 0.003 }); esp.position.set(0.1, 0.18, -0.6); esp.rotation.x = 0.9; g.add(esp);
  [0.35, 0.44].forEach((z, i) => { const v = vasija(K, [[0.001, 0], [0.05, 0.01], [0.065, 0.07], [0.045, 0.13], [0.025, 0.15]], i ? '#a8583a' : '#b5643a', false); v.position.set((i - 0.5) * 0.09, 0.1, z); g.add(v); });
  g.userData.ficha = { titulo: 'La barca del Nilo', texto: 'baja a remo y sube a vela' };
  return { obj: g, vela(on) { vela.visible = on; verga.position.set(0, on ? 0.98 : 0.3, 0.14); recogida.visible = !on; } };
}
function crearCabra(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const cu = K.malla(K.capsula(0.08, 0.16, 0.6), '#8a6a4a', { grosor: 0.008 }); cu.rotation.x = Math.PI / 2; cu.position.y = 0.2; g.add(cu);
  [[-0.05, -0.1], [0.05, -0.1], [-0.05, 0.1], [0.05, 0.1]].forEach(([x, z]) => { const p = K.malla(K.cilindro(0.015, 0.012, 0.16, 5), '#6e5238', { sinTinta: true }); p.position.set(x, 0.08, z); g.add(p); });
  const cab = new THREE.Group(); cab.position.set(0, 0.28, 0.16); g.add(cab);
  const c = K.malla(K.capsula(0.045, 0.06, 0.5), '#8a6a4a', { grosor: 0.005 }); c.rotation.x = 1.1; cab.add(c);
  [-1, 1].forEach(l => { const cu2 = K.malla(K.cono(0.012, 0.11, 4), '#3a2e24', { sinTinta: true }); cu2.position.set(l * 0.025, 0.07, -0.03); cu2.rotation.x = -0.7; cab.add(cu2); });
  const barba = K.malla(K.cono(0.015, 0.05, 4), '#4a3a2a', { sinTinta: true }); barba.rotation.x = Math.PI; barba.position.set(0, -0.06, 0.05); cab.add(barba);
  const cola = K.malla(K.cono(0.015, 0.06, 4), '#6e5238', { sinTinta: true }); cola.position.set(0, 0.28, -0.17); cola.rotation.x = -0.6; g.add(cola);
  return { obj: g, cab };
}
function crearGato(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const cu = K.malla(K.capsula(0.045, 0.1, 0.5), '#b58a55', { grosor: 0.005 }); cu.rotation.x = Math.PI / 2; cu.position.y = 0.08; g.add(cu);
  const cab = K.malla(K.esfera(0.045), '#b58a55', { grosor: 0.005 }); cab.position.set(0, 0.13, 0.1); g.add(cab);
  [-1, 1].forEach(l => { const o = K.malla(K.cono(0.015, 0.04, 3), '#9a7040', { sinTinta: true }); o.position.set(l * 0.022, 0.17, 0.1); g.add(o); });
  const cola = K.malla(K.cilindro(0.008, 0.01, 0.14, 4), '#9a7040', { sinTinta: true }); cola.position.set(0, 0.13, -0.12); cola.rotation.x = -0.6; g.add(cola);
  const patas = [[-0.025, -0.05], [0.025, -0.05], [-0.025, 0.05], [0.025, 0.05]].map(([x, z]) => { const p = K.malla(K.cilindro(0.009, 0.008, 0.06, 4), '#9a7040', { sinTinta: true }); p.position.set(x, 0.03, z); g.add(p); return p; });
  g.userData.ficha = { titulo: 'Miu', texto: 'la gata de la Casa: guarda los papiros de los ratones' };
  return { obj: g, anim(t) { patas.forEach((p, i) => { p.rotation.x = 0.5 * Math.sin(t * 9 + (i % 2 ? Math.PI : 0) + (i > 1 ? Math.PI : 0)); }); cola.rotation.z = 0.3 * Math.sin(t * 2); } };
}
function crearCocodrilo(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const cu = K.malla(K.capsula(0.08, 0.5, 0.6), '#5b6b3e', { grosor: 0.008 }); cu.rotation.x = Math.PI / 2; cu.scale.set(1.2, 1, 0.55); cu.position.y = 0.05; g.add(cu);
  const hoc = K.malla(K.caja(0.1, 0.05, 0.26), '#56643a', { grosor: 0.006 }); hoc.position.set(0, 0.05, 0.42); g.add(hoc);
  [-1, 1].forEach(l => { const o = K.malla(K.esfera(0.018), '#c9b24a', { sinTinta: true }); o.position.set(l * 0.04, 0.09, 0.3); g.add(o); [0.18, -0.18].forEach(z => { const p = K.malla(K.caja(0.05, 0.03, 0.08), '#4b5a32', { sinTinta: true }); p.position.set(l * 0.11, 0.02, z); g.add(p); }); });
  for (let k = 0; k < 6; k++) { const e = K.malla(K.cono(0.018, 0.035, 4), '#4b5a32', { sinTinta: true }); e.position.set(0, 0.1, 0.2 - k * 0.08); g.add(e); }   // las escamas del lomo
  const cola = new THREE.Group(); cola.position.set(0, 0.04, -0.32); g.add(cola);
  const c = K.malla(K.cono(0.07, 0.5, 5), '#5b6b3e', { grosor: 0.006 }); c.rotation.x = -Math.PI / 2; c.scale.set(1, 1, 0.5); c.position.z = -0.22; cola.add(c);
  g.userData.cola = cola;
  return g;
}
function crearGarza(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const cu = K.malla(K.esfera(0.07), '#e8e6e0', { grosor: 0.005 }); cu.scale.set(0.8, 0.9, 1.4); cu.position.y = 0.34; g.add(cu);
  const cuello = new THREE.Group(); cuello.position.set(0, 0.38, 0.07); g.add(cuello);
  const cl = K.malla(K.cilindro(0.015, 0.018, 0.2, 5), '#e8e6e0', { sinTinta: true }); cl.position.y = 0.09; cl.rotation.x = 0.4; cuello.add(cl);
  const cab = K.malla(K.esfera(0.03), '#e8e6e0', { sinTinta: true }); cab.position.set(0, 0.19, 0.05); cuello.add(cab);
  const pico = K.malla(K.cono(0.012, 0.11, 4), '#d9a53a', { sinTinta: true }); pico.rotation.x = Math.PI / 2; pico.position.set(0, 0.19, 0.12); cuello.add(pico);
  [-1, 1].forEach(l => { const p = K.malla(K.cilindro(0.006, 0.006, 0.3, 4), '#3a3228', { sinTinta: true }); p.position.set(l * 0.025, 0.15, 0); g.add(p); });
  return { obj: g, anim(t) { const c = (t % 11) / 11; cuello.rotation.x = c > 0.8 ? 0.9 * Math.sin((c - 0.8) / 0.2 * Math.PI) : 0.05 * Math.sin(t); } };
}
/* la bandada de ibis: blancos con la cabeza y la cola negras, cruzan el cielo al alba y al atardecer */
function bandadaIbis(K) {
  const g = new THREE.Group(), aves = [];
  for (let i = 0; i < 7; i++) {
    const a = new THREE.Group(), c = K.malla(K.esfera(0.06), '#f2f0ea', { grosor: 0.006, sombra: false }); c.scale.set(0.7, 0.6, 1.6); a.add(c);
    const cab = K.malla(K.esfera(0.03), '#2a2420', { sinTinta: true, sombra: false }); cab.position.z = 0.13; a.add(cab);
    const pico = K.malla(K.cono(0.008, 0.1, 4), '#2a2420', { sinTinta: true, sombra: false }); pico.rotation.x = Math.PI / 2 + 0.5; pico.position.set(0, -0.02, 0.19); a.add(pico);
    const alas = [-1, 1].map(l => { const w = K.malla(K.caja(0.32, 0.01, 0.09), '#f2f0ea', { grosor: 0.004, sombra: false }); w.position.x = l * 0.17; const punta = K.malla(K.caja(0.08, 0.012, 0.09), '#2a2420', { sinTinta: true, sombra: false }); punta.position.x = l * 0.3; const p = new THREE.Group(); p.add(w, punta); a.add(p); return p; });
    const k = Math.ceil(i / 2) * (i % 2 ? 1 : -1); a.userData = { k, alas }; g.add(a); aves.push(a);
  }
  g.visible = false;
  return { obj: g, anim(t, luz) {
    const crep = luz > 0.25 && luz < 0.7; g.visible = crep; if (!crep) return;
    const u = ((t * 0.9) % 30) / 30, x0 = 17 - u * 16, z0 = 4 + u * 13;
    aves.forEach((a, i) => { const k = a.userData.k; a.position.set(x0 + Math.abs(k) * 0.45, 4.2 + 0.1 * Math.sin(t * 2 + i), z0 + k * 0.45 - Math.abs(k) * 0.3); a.rotation.y = Math.atan2(-16, 13);
      const b = Math.sin(t * 6 + i) * 0.5; a.userData.alas[0].rotation.z = b; a.userData.alas[1].rotation.z = -b; });
  } };
}
