/* ============================================================
   epocas/epoca8
   La Época 8 (París, 1120-1257) sobre el motor 3D. Como las otras: aquí vive lo de ESTA época (el Sena con la Cité,
   Notre-Dame que crece con la época, la orilla de las escuelas, la muralla, quién está dónde, su año con nieve, su noche y
   sus rótulos); el cómo lo pone motor3d.js. El mundo vive en src/paris/ y es la maqueta A de la hoja
   (juego3d/bocetos/paris.html, «la orilla de las escuelas», elegida por el usuario el 2026-10-04: catedral completa que
   crece por etapas, San Víctor, casas de entramado). Las anclas de la lógica (el campanario, la calle de la paja, la
   Montaña, la sala de los maestros, el colegio, el pergaminero) son las del motor (09f-paris).
   EL HORARIO SE VE: cuando la campana cambia de tiempo, todos caminan a su tarea. Leer: a los corros de los maestros (de
   noche, a la luz de las velas); copiar: al scriptorium de San Víctor, afuera de la puerta de Santiago; disputar: al pie de
   la Montaña; descansar: de día pasean y juegan a la soule en el prado de los clérigos, de noche se van a su casa.
   ============================================================ */
import * as THREE from 'three';
import { fundir } from '../kit.js';
import * as M from '../mundo.js';
import * as V from '../paris/valle.js';
import * as MON from '../paris/monumentos.js';
import * as PZ from '../paris/piezas.js';
import * as L from '../paris/lugares.js';
import { muralla as murallaFA, puenteCasas, chatelet as chateletPuente, espejar } from '../paris/maqueta.js';
import { conActores, pieza } from '../piezas.js';
import { fase, tiene, niv, llave, Z2D } from '../motor3d.js';
import * as SE from '../secretos.js';

/* ---------- dónde está cada cosa ---------- */
const CHATELET = { x: 7.1, y: 10.05 }, BUHARDILLA = { x: 7.4, y: 11.55 };
const TORRES = [[6.65, 16.1], [6.65, 4.95]];                                  // la torre de Nesle y la Tournelle, sobre el río
const FOUARRE_ESC = { x: 9.92, y: 11.45 };                                    // la cátedra bajo el alero de la escuela de la calle de la paja
const MAESTROS = [{ x: 12.6, y: 11.3 }, FOUARRE_ESC, { x: 7.75, y: 6.3 }, { x: 8.9, y: 14.5 }, { x: 12.65, y: 14.85 }];
const LICS = [[7.3, 12.7], [13.3, 13.3], [10.55, 12.3], [8.6, 8.55], [11.7, 15.5], [13.4, 9.6]];   // donde abre su escuela cada licenciado
const PRADO = { x: 9.7, y: 17.15, r: 0.55 };                                  // el prado de los clérigos: la soule de los estudiantes
/* las barcas bajan con la corriente (hacia +z): por el brazo chico, por el grande detrás de la catedral y, pasada la punta de la isla, por el río entero */
const RUTAS_BARCA = [{ x: 6.12, z0: 2.2, z1: 10.0, v: 0.16, f: 0, carga: 'toneles' }, { x: 2.45, z0: 2.2, z1: 11.0, v: 0.12, f: 0.5, carga: 'piedra' },
  { x: 3.4, z0: 14.0, z1: 17.8, v: 0.14, f: 0.25, carga: 'heno' }, { x: 5.4, z0: 14.1, z1: 17.8, v: 0.11, f: 0.75, carga: 'pieles' }];
const MOLINOS = [[6.1, 11.15], [2.42, 12.15]];                                 // los molinos de barca, aguas abajo de los puentes
const FAROLES = [{ x: 7.75, y: 11.0 }, { x: 10.45, y: 11.05 }, { x: 12.3, y: 14.35 }, { x: 9.8, y: 12.65 }, { x: 13.55, y: 10.95 }];
/* donde se sienta cada tarea (las de leer son los corros de los maestros) */
const SC = PZ.ANCLAS.scriptorium;
const SITIOS = {
  copiar: [[-0.55, 0.65], [-0.25, 0.65], [0.05, 0.65], [0.35, 0.65], [-0.4, 0.95], [-0.1, 0.95], [0.2, 0.95], [-0.55, 1.25], [-0.25, 1.25], [0.05, 1.25]].map(([dx, dz]) => [SC.x + dx, SC.y + dz]),
  disputar: [[9.5, 9.45], [9.8, 9.45], [9.5, 9.75], [9.8, 9.75], [9.5, 10.05], [9.8, 10.05], [9.5, 10.35], [9.8, 10.35], [11.75, 9.6], [12.05, 9.6], [11.75, 9.9], [12.05, 9.9]],
};

function reservar() {
  const R = V.RESERVAS; R.length = 0;
  const caja = (x, z, w, d, m = 0.08, extra = {}) => R.push({ x0: x - w / 2 - m, x1: x + w / 2 + m, z0: z - d / 2 - m, z1: z + d / 2 + m, ...extra });
  caja(L.NOTREDAME.x, L.NOTREDAME.y, 2.4, 5.7, 0.05);
  R.push({ x0: 14.45, x1: 17.4, z0: 2.15, z1: 5.3 });                           // el recinto de San Víctor
  caja(PZ.ANCLAS.pergamino.x - 0.1, PZ.ANCLAS.pergamino.y - 0.05, 1.6, 1.3);
  caja(PZ.ANCLAS.campana.x - 0.1, PZ.ANCLAS.campana.y + 0.05, 1.0, 0.9);
  caja(SC.x, SC.y - 0.1, 1.5, 1.1);
  caja(PZ.ANCLAS.disputatio.x, PZ.ANCLAS.disputatio.y + 0.1, 1.3, 1.2, 0.05);
  caja(PZ.ANCLAS.universidad.x, PZ.ANCLAS.universidad.y - 0.15, 1.6, 1.6);
  caja(PZ.ANCLAS.sorbona.x - 0.05, PZ.ANCLAS.sorbona.y - 0.2, 1.7, 1.8);
  caja(CHATELET.x, CHATELET.y + 0.05, 0.75, 0.55);
  R.push({ x: BUHARDILLA.x + 0.65, z: BUHARDILLA.y + 0.05, r: 0.3 });           // el rincón del secreto, delante de la casa del estudiante pobre
  caja(PRADO.x, PRADO.y, 1.4, 1.0);
  SITIOS.copiar.concat(SITIOS.disputar).forEach(([x, z]) => R.push({ x, z, r: 0.12, sitio: true }));
  MAESTROS.forEach(m => R.push({ x: m.x, z: m.y, r: 0.32, maestro: true }));
  LICS.forEach(([x, z]) => R.push({ x, z, r: 0.28, maestro: true }));
  FAROLES.forEach(f => R.push({ x: f.x, z: f.y, r: 0.1 }));
}
const lerpHex = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
/* Notre-Dame crece con la época: los saberes aprendidos levantan la obra (0-1 → la vieja San Esteban y los cimientos del coro; 2-3 → el coro; 4-5 → la nave y la fachada hasta la rosa; 6 → las torres, la aguja y las capillas) */
const etapaND = () => { const n = [57, 58, 59, 60, 61, 62].filter(i => fase(i) === 'meseta').length; return n >= 6 ? 3 : n >= 4 ? 2 : n >= 2 ? 1 : 0; };

export default {
  era: 8,
  nombre: 'París',
  piezas: PZ.PIEZAS,
  construir(mo) {
    const { K, raiz, dyn, vivos, ranura, ranuras, persona, ubicar, ver, animar, opacidad, tocP } = mo;
    const oficio = (i, f) => conActores(fase(i) === 'meseta', f);
    reservar(); L.verificarEspejo();

    /* ---------- la ciudad: lo quieto se funde; el suelo y el agua se repintan con el año ---------- */
    const casas = V.casas(K);
    for (const c of casas.userData.puestas) V.RESERVAS.push({ x0: c.x - c.w / 2 - 0.06, x1: c.x + c.w / 2 + 0.06, z0: c.z - c.d / 2 - 0.06, z1: c.z + c.d / 2 + 0.06, casa: true });
    const suelo = V.suelo(K), agua = V.agua(K, vivos);
    const veg = V.vegetacion(K, vivos, (x, z, r) => !V.reservado(x, z, r));
    const ARB = veg.g.userData.puestos;
    const quieto = new THREE.Group();
    quieto.add(V.losa(K), casas, veg.g);
    /* San Víctor: la abadía en la esquina, afuera de la muralla, en espejo como en la maqueta (la fachada al frente). Se funde
       aparte, dentro de su espejo, para que las caras no se den vuelta */
    const sv = espejar(MON.segunda(K, MON.VARIANTES.segunda)); sv.position.set(L.ABADIA.x, 0, L.ABADIA.y); veg.adoptar(sv);
    sv.updateMatrixWorld(true); fundir(K, sv); sv.userData.vivo = true; quieto.add(sv);
    /* lo alto de la Montaña: Santa Genoveva con su torre y su claustro */
    const sg = MON.genovevaCima(K); sg.position.set(V.CIMA.x, V.altura(V.CIMA.x, V.CIMA.y) - 0.03, V.CIMA.y); sg.rotation.y = -Math.PI / 2; quieto.add(sg);
    /* la muralla de Felipe Augusto con sus torres, sus puertas y las dos torres grandes sobre el río */
    quieto.add(murallaFA(K, { muralla: L.MURALLA, puertas: L.PUERTAS, torresGrandes: TORRES }, V.altura));
    /* los puentes con sus casas (a lo largo de x) y el Petit-Châtelet que guarda la cabeza del de las escuelas */
    L.PUENTES.forEach((p, i) => { const b = puenteCasas(K, p.x1 - p.x0, i ? 1 : 2); b.position.set((p.x0 + p.x1) / 2, 0, p.z); quieto.add(b); });
    const ch = chateletPuente(K); ch.position.set(CHATELET.x, 0, CHATELET.y); quieto.add(ch);
    /* la escuela de la calle de la paja: la cátedra bajo el alero y la paja en la calle, donde se sientan los estudiantes */
    const fo = new THREE.Group(); fo.position.set(FOUARRE_ESC.x, 0, FOUARRE_ESC.y); quieto.add(fo);
    const tarima = K.malla(K.caja(0.16, 0.06, 0.22), MON.PA.maderaD, { grosor: 0.002 }); tarima.position.set(-0.05, 0.03, 0); fo.add(tarima);
    const pj = PZ.paja(K, 0.75, 0.62); pj.position.set(0.48, 0, 0.3); fo.add(pj);
    fundir(K, quieto);
    raiz.add(suelo, agua.g, quieto);
    const nubes = M.nubes(K, vivos); raiz.add(nubes.g);
    const luciernagas = M.luciernagas(vivos); raiz.add(luciernagas);
    const luzCite = new THREE.PointLight('#ffb35c', 0, 5, 1.5); luzCite.position.set(4.6, 1.2, 10.6); raiz.add(luzCite);
    const luzEscuelas = new THREE.PointLight('#ffae5a', 0, 6, 1.6); luzEscuelas.position.set(10.2, 1.0, 11.9); raiz.add(luzEscuelas);
    const luzAbadia = new THREE.PointLight('#ffb35c', 0, 4.5, 1.6); luzAbadia.position.set(15.8, 0.9, 5.6); raiz.add(luzAbadia);
    const luzColegios = new THREE.PointLight('#ffae5a', 0, 5, 1.6); luzColegios.position.set(11.2, 1.0, 14.1); raiz.add(luzColegios);
    const faroles = FAROLES.map(Q => { const l = PZ.farol(K); l.position.set(Q.x, 0, Q.y); dyn.add(l); return { ...Q, l }; });

    /* ---------- el Sena: las barcas que bajan con la corriente y los molinos de barca aguas abajo de los puentes ---------- */
    const barcas = RUTAS_BARCA.map(r => { const b = MON.barca(K, { carga: r.carga }); b.userData.vivo = true; dyn.add(b); return { ...r, b }; });
    const molinos = MOLINOS.map(([x, z]) => { const m = MON.molinoBarca(K); m.position.set(x, V.NIVEL, z); m.rotation.y = Math.PI / 2; dyn.add(m); return m; });

    /* ---------- el año de París (ESTACIONES_PARIS del motor): el verde nuevo, el oro de las mieses, el ocre del otoño, la nieve ---------- */
    let pasoVestido = -1;
    function vestir() {
      const e = mo.estacionHoy();
      if (e.paso === pasoVestido) return; pasoVestido = e.paso;
      const k = e.k || 0, sig = e.sig || e, j = sig.i ?? ((e.i + 1) % 4);
      const nieve = (e.nieve || 0) * (1 - k) + (sig.nieve || 0) * k;
      suelo.userData.pintar({ i: e.i, j, k, nieve });
      veg.vestir(e.i, k, j, nieve);
      const cr = (e.crecida || 1) + ((sig.crecida || 1) - (e.crecida || 1)) * k;
      agua.rio.position.y = V.NIVEL + (cr - 1) * 0.1;
    }

    /* ---------- los que siempre están ---------- */
    const guias = [0, 1, 2, 3, 4].map(i => persona(i === 0 ? { ...PZ.HUGO } : { ...PZ.MAESTRO, piel: [1, 0, 2, 1][i - 1], colorPelo: ['#5a4a3a', '#2a1f18', '#7a6a52', '#3a2a1e'][i - 1] }, { pose: 'narrar' }));
    const licenciados = LICS.map((_, i) => persona({ ...PZ.MAESTRO, piel: i % 3, colorPelo: ['#5a3a24', '#2a1f18', '#8a6a42'][i % 3], bonete: '#1e1c1a' }, { pose: 'narrar' }));
    const jugadores = [0, 1, 2, 3, 4].map(i => persona({ ...PZ.estudiante(i + 20) }, { pose: 'andar' }));
    const pelota = K.malla(K.esfera(0.035, 0.5), '#8a6a42', { grosor: 0.002 }); dyn.add(pelota);
    const abelardo = persona({ ...PZ.ABELARDO }, { pose: 'quieto' });
    const seguidores = [0, 1, 2].map(i => persona({ ...PZ.estudiante(i + 30) }, { pose: 'quieto' }));
    let abeAntes = -1, abeCamino = null;
    const anilloCampana = SE.ondas(3, 0.9, '#ffd76a'); anilloCampana.position.set(L.CAMPANA.x, 0.03, L.CAMPANA.y); dyn.add(anilloCampana);
    const anilloLicencia = SE.ondas(2, 0.5, '#ffd76a'); anilloLicencia.position.set(L.UNIVERSIDAD.x, 0.02, L.UNIVERSIDAD.y); dyn.add(anilloLicencia);
    const anilloCuestion = SE.ondas(2, 0.5, '#d8c8ff'); anilloCuestion.position.set(L.MONTANA.x, 0.02, L.MONTANA.y + 0.2); dyn.add(anilloCuestion);
    let tiempoVisto = -1, tCampana = -99;
    const aprendices = mo.paseantes(18, { opciones: i => PZ.estudiante(i), inicio: i => ({ x: 10.6 + (i % 5) * 0.3, z: 11.0 + Math.floor(i / 5) * 0.3 }), semilla: 1215 });

    /* ---------- por dónde se camina: la orilla de las escuelas y las puertas de la muralla; el agua, la Cité (la catedral en obra) y la Montaña no ---------- */
    const enRect = (x, z, r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
    const muroDel = (x, z) => { for (let i = 0; i < L.MURALLA.length - 1; i++) if (V.distSeg(x, z, L.MURALLA[i], L.MURALLA[i + 1]) < 0.2) return !L.PUERTAS.some(([px, pz]) => Math.hypot(px - x, pz - z) < 0.16); return false; };   // se pasa por el medio de las puertas, entre sus torres
    let claveObst = '', corros = [];
    function rehacerPaso() {
      const RECTS = V.RESERVAS.filter(r => r.x0 !== undefined);
      const circulos = [...TORRES.map(([x, z]) => ({ x, z, r: 0.26 })), ...faroles.map(Q => ({ x: Q.x, z: Q.y, r: 0.08 })), ...ARB.map(a => ({ x: a.x, z: a.z, r: a.r }))];
      mo.rehacerCaminos({ circulos, bloquea: (x, z) => V.altura(x, z) < -0.03 || L.enCite(x, z, 0.1) || RECTS.some(r => enRect(x, z, r)) || V.enLoma(x, z) || muroDel(x, z) || x < 2.25 || z < 2.25 || x > 17.75 || z > 17.75 });
      aprendices.rehacer();
      const usados = [];
      corros = MAESTROS.map(m => buscarAsientos(m, 9, usados));
    }
    function buscarAsientos(m, cupo, usados) {
      const cand = [];
      for (const r of [0.55, 0.88]) for (let k = 0; k < 18; k++) { const a = Math.PI / 4 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (0.42 / r); cand.push({ x: m.x + Math.cos(a) * r, z: m.y + Math.sin(a) * r, d: Math.ceil(k / 2) * 0.42 / r + r * 0.6 }); }
      cand.sort((u, v) => u.d - v.d);
      const lista = [];
      for (const c of cand) {
        if (lista.length >= cupo) break;
        if (!mo.caminos.libre(c.x, c.z) || V.altura(c.x, c.z) < -0.02 || V.altura(c.x, c.z) > 0.02 || V.reservado(c.x, c.z, 0.04)) continue;
        if (usados.some(u => Math.hypot(u.x - c.x, u.z - c.z) < 0.3)) continue;
        const q = { x: c.x, z: c.z, mira: { x: m.x, y: m.y } }; lista.push(q); usados.push(q);
      }
      return lista;
    }

    /* ---------- EL SECRETO DE LA ÉPOCA: en invierno, de noche, en la casa del estudiante pobre junto al río (la de la buhardilla),
       la vela y la hoja del arte notoria ---------- */
    const secretoNotoria = (() => {
      const x = BUHARDILLA.x + 0.55, z = BUHARDILLA.y + 0.02;
      const ar = SE.arsNotoria(K); ar.position.set(x, 0, z); ar.rotation.y = Math.PI / 2; dyn.add(ar);
      const chs = SE.chispitas(6, 0.2, 0.4); chs.position.set(x, 0.05, z); dyn.add(chs);
      const luzN = new THREE.PointLight('#ffcf7a', 0, 1.8, 1.6); luzN.position.set(x + 0.05, 0.4, z + 0.08); raiz.add(luzN);
      const est = persona({ ...PZ.estudiante(7), capucha: '#3f4f7a' }, { pose: 'leer' });
      ubicar(est, x + 0.22, z + 0.04, { x, y: z });
      return (t, dt, luz, on) => {
        const ve = on && luz < 0.4 && estacion().i === 3;
        ar.visible = ve; chs.visible = ve && !secretoHallado('notoria');
        if (ver(est, ve)) animar(est, t, dt);
        luzN.intensity = ve ? 0.9 + 0.25 * Math.sin(t * 9) : 0;
        if (!ve) return;
        chs.userData.titilar(t); ar.userData.temblar(t);
        tocable(x, z, { k: 'secreto', id: 'notoria', x, y: z }, { rx: 20, ry: 14, dy: 10 });
      };
    })();

    /* ---------- cada cuadro ---------- */
    function sincronizar(t, dt) {
      const e8 = S.era === 8, luz = luzDia(), noche = nocheCasa(), deNoche = noche > 0.5;
      vestir();
      const lk = Math.max(0, Math.min(1, (0.55 - luz) / 0.25));
      luciernagas.userData.k = estacion().i === 1 ? lk * lk * (3 - 2 * lk) * 0.3 : 0; luciernagas.visible = luciernagas.userData.k > 0.01;

      // --- las ranuras de los saberes, y Notre-Dame que crece con la época ---
      ranura('pergamino', tiene(57) ? llave(57) : null, () => oficio(57, () => PZ.pergamino(K, niv(57))));
      ranura('campana', tiene(58) ? llave(58) : null, () => oficio(58, () => PZ.campana(K, niv(58))));
      ranura('scriptorium', tiene(59) ? llave(59) : null, () => oficio(59, () => PZ.scriptorium(K, niv(59))));
      ranura('disputatio', tiene(60) ? llave(60) : null, () => oficio(60, () => PZ.disputatio(K, niv(60))));
      ranura('universidad', tiene(61) ? llave(61) : null, () => oficio(61, () => PZ.universidad(K, niv(61))));
      ranura('sorbona', tiene(62) ? llave(62) : null, () => oficio(62, () => PZ.sorbona(K, niv(62))));
      const eND = etapaND();
      ranura('notredame', eND, () => {
        const P = pieza(L.NOTREDAME), nd = MON.catedral(K, MON.VARIANTES.catedral, eND), gruas = nd.userData.gruas || [];
        P.obj.add(nd); fundir(K, nd, 0.012);                                                       // el monumento de la época, a la escala de la catedral de verdad
        if (gruas.length) P.vivos.push(tt => gruas.forEach((gr, i) => { if (gr.userData.rueda) gr.userData.rueda.rotation.z = tt * 0.8 + i; }));
        return P;
      });
      const clave = mo.claveRanuras() + '|' + S.docentes;
      if (clave !== claveObst) { claveObst = clave; rehacerPaso(); }
      mo.animarRanuras(t, dt);

      // --- los tocables: las piezas y el mundo ---
      for (const r of Object.values(ranuras)) if (r.P && r.P.toc) for (const q of r.P.toc) tocP(q.x, q.y, { k: q.k }, q.p);
      tocable(L.NOTREDAME.x, L.NOTREDAME.y, { k: 'notredame' }, { rx: 90, ry: 50, dy: 62 });
      tocable(15.1, 3.65, { k: 'abadia' }, { rx: 44, ry: 24, dy: 26 });
      tocable(4.4, 15.7, { k: 'sena' }, { rx: 50, ry: 26, dy: 0 });
      tocable((L.PUENTES[0].x0 + L.PUENTES[0].x1) / 2, L.PUENTES[0].z, { k: 'petitpont' }, { rx: 18, ry: 14, dy: 8 });
      tocable((L.PUENTES[1].x0 + L.PUENTES[1].x1) / 2 + 0.1, L.PUENTES[1].z, { k: 'grandpont' }, { rx: 16, ry: 12, dy: 8 });
      tocable(FOUARRE_ESC.x + 0.5, FOUARRE_ESC.y + 0.3, { k: 'fouarre' }, { rx: 26, ry: 14, dy: 2 });
      tocable(V.CIMA.x, V.CIMA.y, { k: 'genoveva' }, { rx: 32, ry: 22, dy: 52 });
      tocable(PRADO.x, PRADO.y, { k: 'preclercs' }, { rx: 34, ry: 18, dy: 2 });
      tocable(L.MURALLA_SUR, 14.0, { k: 'muralla' }, { rx: 26, ry: 12, dy: 10 });

      // --- el Sena: las barcas y las ruedas de los molinos ---
      barcas.forEach(q => {
        const u = ((t * q.v / (q.z1 - q.z0)) + q.f) % 1, z = q.z0 + (q.z1 - q.z0) * u;
        q.b.position.set(q.x, agua.rio.position.y + 0.012 + 0.005 * Math.sin(t * 1.3 + q.f * 9), z); q.b.rotation.y = Math.PI / 2; q.b.rotation.z = 0.015 * Math.sin(t * 1.1 + q.f);
        q.b.visible = e8 && V.altura(q.x, z) < -0.12; if (q.b.visible) opacidad(q.b, Math.min(1, u / 0.06, (1 - u) / 0.06));
        if (q.b.visible) tocable(q.x, z, { k: 'barcaPa' }, { rx: 14, ry: 12, dy: 6 });
      });
      molinos.forEach((m, i) => { m.position.y = agua.rio.position.y; if (m.userData.rueda) m.userData.rueda.rotation.z = -t * 0.9 - i; tocable(m.position.x, m.position.z, { k: 'molino' }, { rx: 14, ry: 10, dy: 6 }); });

      // --- la campana: cuando cambia el tiempo, las ondas en el campanario (y la gente camina a su tarea) ---
      const tp = e8 && campanaAbierta() ? tiempoPa() : -1;
      if (tp !== tiempoVisto) { if (tiempoVisto !== -1 && tp !== -1) tCampana = t; tiempoVisto = tp; }
      anilloCampana.visible = t - tCampana < 5; if (anilloCampana.visible) anilloCampana.userData.latir(t);
      anilloLicencia.visible = e8 && licenciaDisponible(); if (anilloLicencia.visible) anilloLicencia.userData.latir(t);
      anilloCuestion.visible = e8 && disputaAbierta() && cuestionesPend() > 0; if (anilloCuestion.visible) anilloCuestion.userData.latir(t * 0.8);
      const tarea = e8 ? tareaAhora() : null;

      // --- los maestros de las escuelas; los licenciados que abrieron la suya ---
      const vis = Math.min(S.alumnos, 18);
      const cupos = [Math.min(9, BALANCE.ratioDocente + palestraSitio()), ...[1, 2, 3, 4].map(k => k < S.docentes ? Math.min(9, cupoGuia(k) + palestraSitio()) : 0)];
      guias.forEach((p, i) => {
        if (!ver(p, i === 0 ? S.docentes >= 1 : i < S.docentes)) return;
        const m = MAESTROS[i]; ubicar(p, m.x, m.y, { x: m.x + 1, y: m.y + 1 });
        p.e.pose = (tarea === 'leer' || !tarea) && !(deNoche && tarea !== 'leer') ? 'narrar' : 'quieto'; animar(p, t, dt); tocP(m.x, m.y, { k: 'docente', i }, p);
      });
      const nLic = e8 ? Math.min(LICS.length, S.licenciados || 0) : 0;
      licenciados.forEach((p, i) => { if (ver(p, i < nLic && !(deNoche && tarea === 'descansar'))) { ubicar(p, LICS[i][0], LICS[i][1], { x: LICS[i][0] + 1, y: LICS[i][1] + 1 }); p.e.pose = 'narrar'; animar(p, t, dt); tocP(LICS[i][0], LICS[i][1], { k: 'universidad' }, p); } });

      // --- los estudiantes: van adonde manda la campana ---
      let plan = [], planM = [], vivosVis = vis;
      if (tarea === 'copiar' && scriptoriumAbierto()) plan = SITIOS.copiar.map(([x, z]) => ({ x, z, mira: { x: SC.x, y: SC.y }, pose: 'leer' }));
      else if (tarea === 'disputar' && disputaAbierta()) plan = SITIOS.disputar.map(([x, z]) => ({ x, z, mira: { x: L.MONTANA.x, y: L.MONTANA.y - 0.2 }, pose: 'suelo' }));
      else if (tarea === 'descansar') { plan = []; if (deNoche) vivosVis = 0; }
      else if (deNoche && !tarea) vivosVis = 0;
      else corros.forEach((sitios, m) => { for (let j = 0; j < Math.min(cupos[m] || 0, sitios.length) && plan.length < vis; j++) { plan.push(sitios[j]); planM.push(m); } });
      const maestro = m => LEX().nombres[m % LEX().nombres.length];
      aprendices.paso(t, dt, vivosVis, { asiento: i => plan[i] || null, mira: MAESTROS[1] }, a => ({ k: 'alumno', i: a.i, con: planM[a.i] !== undefined ? maestro(planM[a.i]) : null }));

      // --- la soule en el prado de los clérigos, en el tiempo de descansar (o siempre, antes de la campana) ---
      const juegan = e8 && !deNoche && (tarea === 'descansar' || !campanaAbierta());
      jugadores.forEach((p, i) => { if (!ver(p, juegan)) return; const a = t * 0.7 + i * Math.PI * 0.4; const x = PRADO.x + Math.cos(a) * PRADO.r * (0.6 + 0.4 * Math.sin(i * 1.7)), z = PRADO.y + Math.sin(a * 1.2) * PRADO.r * 0.7; ubicar(p, x, z, { x: x - Math.sin(a), y: z + Math.cos(a) }); p.e.pose = 'andar'; animar(p, t, dt); });
      pelota.visible = juegan; if (juegan) pelota.position.set(PRADO.x + Math.cos(t * 1.3) * 0.3, 0.04 + Math.abs(Math.sin(t * 3)) * 0.12, PRADO.y + Math.sin(t * 0.9) * 0.25);

      // --- Abelardo: llega cruzando el Petit-Pont desde la Cité con sus estudiantes, espera pasado el Petit-Châtelet y, recibido, sube a enseñar al pie de la Montaña ---
      const estA = e8 ? estadoPensador('abelardo') : 0;
      if (estA !== abeAntes && abeAntes !== -1 && nacimientosVivos) {
        if (estA === 1) abeCamino = { cola: [{ x: L.ESPERA_ABELARDO.x, z: L.ESPERA_ABELARDO.y }], pos: { x: L.PUENTES[0].x0 + 0.05, z: L.PUENTES[0].z } };
        else if (estA === 2) abeCamino = { cola: mo.caminos.ruta({ x: L.ESPERA_ABELARDO.x, z: L.ESPERA_ABELARDO.y }, { x: L.LUGAR_ABELARDO.x, z: L.LUGAR_ABELARDO.y }), pos: { x: L.ESPERA_ABELARDO.x, z: L.ESPERA_ABELARDO.y } };
      }
      abeAntes = estA;
      let ax = 0, az = 0, hx = 1, hz = 0, anda = false;
      const sobrePuente = (x, z) => L.enPuente(x, z) ? 0.035 : 0;
      if (ver(abelardo, estA >= 1)) {
        const L0 = estA === 1 ? L.ESPERA_ABELARDO : L.LUGAR_ABELARDO;
        let px = L0.x, pz = L0.y, mira = estA === 1 ? { x: L0.x + 0.5, y: L0.y + 0.8 } : { x: L.MONTANA.x, y: L.MONTANA.y + 0.8 };
        if (abeCamino) {
          const c = abeCamino, d = c.cola[0];
          if (!d) abeCamino = null;
          else { const dx = d.x - c.pos.x, dz = d.z - c.pos.z, D = Math.hypot(dx, dz); if (D < 0.05) c.cola.shift(); else { const s = Math.min(D, 0.6 * dt); c.pos.x += dx / D * s; c.pos.z += dz / D * s; hx = dx / D; hz = dz / D; } px = c.pos.x; pz = c.pos.z; anda = true; mira = { x: px + hx, y: pz + hz }; }
        }
        ubicar(abelardo, px, pz, mira, sobrePuente(px, pz)); abelardo.e.pose = anda ? 'andar' : estA === 2 && !deNoche ? 'narrar' : 'quieto'; animar(abelardo, t, dt);
        tocP(px, pz, { k: 'pensador', id: 'abelardo' }, abelardo); ax = px; az = pz;
      }
      seguidores.forEach((p, i) => {
        if (!ver(p, estA >= 1 && !(deNoche && estA === 2))) return;
        let sx, sz;
        if (anda) { sx = ax - hx * 0.34 * (i + 1); sz = az - hz * 0.34 * (i + 1); }       // caminando, en fila detrás de él (el puente es angosto)
        else { const a = Math.PI * (0.15 + i * 0.35); sx = ax + Math.cos(a) * 0.38; sz = az + Math.sin(a) * 0.38; }
        ubicar(p, sx, sz, anda ? { x: sx + hx, y: sz + hz } : { x: ax, y: az }, sobrePuente(sx, sz)); p.e.pose = anda ? 'andar' : 'quieto'; animar(p, t, dt);
      });

      // --- la noche: los faroles, las ventanas de la Cité, de las escuelas y de los colegios (más si el horario dice leer) ---
      const oscuro = luz < 0.5, n1 = 1 - luz;
      faroles.forEach(Q => { const ll = Q.l.userData.llama; ll.visible = oscuro; ll.scale.setScalar(1 + 0.15 * Math.sin(t * 11 + Q.x)); });
      luzCite.intensity = n1 * 2.4 * (0.9 + 0.1 * Math.sin(t * 7));
      luzEscuelas.intensity = n1 * (tarea === 'leer' ? 3.2 : 1.4) * (0.9 + 0.1 * Math.sin(t * 9));
      luzAbadia.intensity = n1 * (tarea === 'copiar' ? 2.8 : 1.4) * (0.9 + 0.1 * Math.sin(t * 8));
      luzColegios.intensity = n1 * 1.8 * (0.9 + 0.1 * Math.sin(t * 6));

      secretoNotoria(t, dt, luz, e8);
      mo.luces(t);
      vivos.forEach(f => f(t, dt));
      return { luz, brasa: 0 };
    }

    /* ---------- el estado de cada saber y los globos: el pase 2D ---------- */
    const ALTO = { 57: 30, 58: 44, 59: 34, 60: 34, 61: 34, 62: 36 };
    const DONDE = { 57: PZ.ANCLAS.pergamino, 58: PZ.ANCLAS.campana, 59: PZ.ANCLAS.scriptorium, 60: PZ.ANCLAS.disputatio, 61: PZ.ANCLAS.universidad, 62: PZ.ANCLAS.sorbona };
    function superponer(t) {
      for (const i of [57, 58, 59, 60, 61, 62]) { if (!tiene(i)) continue; const a = DONDE[i], p = P(a.x, a.y, ALTO[i]); estadoTec(i, { x: p.x, y: p.y }, t); }
      if (S.era !== 8) return;
      if (estadoPensador('abelardo') === 1 && VISITAS.abelardo && !abeCamino) drawGlobo(L.ESPERA_ABELARDO.x, L.ESPERA_ABELARDO.y, t);
    }

    /* ---------- los rótulos de acción: lo que se toca en París ---------- */
    function rotulos(ancla, t, tocarEn) {
      const e8 = S.era === 8, h = S.horario || [];
      const pideHorario = e8 && campanaAbierta() && (!S.horario || (S.animo < animoMax() * 0.6 && !h.includes('descansar')) || (scriptoriumAbierto() && !h.includes('copiar')) || (disputaAbierta() && cuestionesPend() >= 2 && !h.includes('disputar')));
      ancla('horario', pideHorario, L.CAMPANA.x, L.CAMPANA.y, 70, 'armar el horario', 'accion', () => { if (!abrirHorario()) fijarHorario(['leer', 'leer', 'leer', 'descansar']); });
      ancla('licencia', e8 && licenciaDisponible(), L.UNIVERSIDAD.x, L.UNIVERSIDAD.y, 50, 'dar la licencia', 'accion', () => darLicencia());
      const estA = e8 ? estadoPensador('abelardo') : 0;
      ancla('recibir', estA === 1 && !abeCamino && S.apr >= (VISITAS.abelardo?.costo || 0), L.ESPERA_ABELARDO.x, L.ESPERA_ABELARDO.y, 52, 'recibir a Abelardo', 'accion', () => tocarEn(L.ESPERA_ABELARDO.x, L.ESPERA_ABELARDO.y));
    }

    /* las caras de quienes firman la consejera en esta época */
    const caras = {
      'Hugo': { ...PZ.HUGO },
      'Abelardo': { ...PZ.ABELARDO },
    };
    return { quieto, nubes, sincronizar, superponer, rotulos, caras, aprendices, get corros() { return corros; } };
  },
};
