/* ============================================================
   epocas/epoca4
   La Época 4 (Atenas, el ágora) sobre el motor 3D. Como las otras: aquí vive lo de ESTA época (su valle, sus
   monumentos, sus piezas, quién está dónde, su año de cuatro estaciones, su noche y sus rótulos); el cómo lo
   pone motor3d.js. El valle, los monumentos y los saberes viven en src/agora/.
   Los monumentos son los que el usuario eligió en la hoja de bocetos (juego3d/bocetos/agora.html, 2026-09-30):
   la Acrópolis de Pericles, completa; la stoa de Zeus Eleuterio, cuyas alas abrazan la plaza; la palestra de
   barrio y el olivar sagrado de la Academia. Las anclas de la lógica (el banco donde se dice, el claro donde se
   pregunta, la tarima del sofista) son las del motor 2D (09b-agora); el techo de la stoa tapa su interior desde
   la cámara del juego, así que la clase y las dudas pasan delante, en la plaza.
   ============================================================ */
import * as THREE from 'three';
import { fundir } from '../kit.js';
import * as M from '../mundo.js';
import * as V from '../agora/valle.js';
import * as MON from '../agora/monumentos.js';
import * as PZ from '../agora/piezas.js';
import { conActores } from '../piezas.js';
import { fase, tiene, niv, llave, Z2D } from '../motor3d.js';
import * as SE from '../secretos.js';

/* ---------- dónde está cada cosa ---------- */
export const ACRO = { x: 5.7, y: 3.85, s: 0.78 };                        // la Acrópolis, al fondo: en el lugar de las pirámides
export const STOA = { x: 9.6, y: 5.95, s: 1 };                             // la stoa de Zeus Eleuterio: su frente mira a la plaza
const ZEUS = { x: 9.6, y: 7.2 };
/* los que enseñan: el grammatistes junto a su banco, y los demás maestros en los claros */
const MAESTROS = [{ x: 8.35, y: 7.4 }, { x: 12.45, y: 6.75 }, { x: 13.95, y: 6.4 }, { x: 6.55, y: 10.45 }, { x: 13.75, y: 9.45 }];   // el último, fuera de la sombra del plátano (detrás, la copa lo tapaba)
const BANCO = PZ.ANCLAS.banco, CLARO = PZ.ANCLAS.pregunta, TARIMA = PZ.ANCLAS.sofista;
const ESPERA_SOCRATES = { x: 11.3, y: 9.55 }, LUGAR_SOCRATES = { x: 9.7, y: 8.9 };   // espera en la esquina de la plaza, junto a la Vía: su rótulo no se encima con los del banco y el claro
const DUDAS = [[9.05, 8.15], [9.5, 8.35]];                                 // los que traen una duda esperan en la plaza, delante de los rótulos (no debajo)
/* de noche: seis a la luz de las lámparas de la stoa, mirando al pórtico; el resto a su casa */
const VELA = [[8.9, 7.4], [9.25, 7.55], [9.95, 7.55], [10.3, 7.4], [9.1, 7.85], [10.1, 7.85]];
const LAMPARAS = [{ x: 8.62, y: 7.15 }, { x: 10.6, y: 7.15 }, { x: 3.75, y: 11.6 }];
const RUTA_PEDAGOGO = [[4.75, 11.15], [6.2, 10.2], [7.6, 9.4], [8.7, 8.15]];
const CABRA = { x0: 5.05, x1: 5.45, y0: 8.95, y1: 9.3 };
const COSECHA = [{ x: 3.95, y: 6.95 }, { x: 3.9, y: 8.6 }];              // en otoño, la oliva se varea y se recoge

/* lo que ocupa cada cosa: ahí no nacen matas y nadie camina */
function reservar() {
  const R = V.RESERVAS; R.length = 0;
  R.push({ x0: ACRO.x - 3.7 * ACRO.s, x1: ACRO.x + 3.7 * ACRO.s, z0: ACRO.y - 1.9 * ACRO.s, z1: ACRO.y + 1.85 * ACRO.s });   // la roca y su talud
  R.push({ x0: ACRO.x - 4.6 * ACRO.s, x1: ACRO.x - 2.8 * ACRO.s, z0: ACRO.y - 0.6 * ACRO.s, z1: ACRO.y + 0.7 * ACRO.s });     // la ladera del oeste con su rampa
  R.push({ x0: STOA.x - 1.82, x1: STOA.x + 1.82, z0: STOA.y - 0.62, z1: STOA.y + 1.12 });
  R.push({ x0: 12.55, x1: 15.45, z0: 3.55, z1: 5.85 });                                                                         // la palestra
  V.CASAS.forEach(([x0, z0, w, d]) => R.push({ x0: x0 - 0.15, x1: x0 + w + 0.2, z0: z0 - 0.1, z1: z0 + d + 0.1 }));
  [...V.OLIVOS, ...V.OLIVOS_CAMPO].forEach(([x, z]) => R.push({ x, z, r: 0.3 }));
  R.push({ x0: V.VINA.x0, x1: V.VINA.x1, z0: V.VINA.z0, z1: V.VINA.z1 }, { x: V.ERA.x, z: V.ERA.y, r: 0.9 }, { x: V.POZO.x, z: V.POZO.y, r: 0.25 }, { x: V.BOREAS.x, z: V.BOREAS.y, r: 0.3 });
  V.COLMENAS.forEach(([x, z]) => R.push({ x, z, r: 0.3 }));
  V.CIPRESES.forEach(([x, z]) => R.push({ x, z, r: 0.25 }));
  R.push({ x: V.PLATANO.x, z: V.PLATANO.y, r: 0.5 }, { x: ZEUS.x, z: ZEUS.y, r: 0.25 }, { x: V.ALTAR12.x, z: V.ALTAR12.y, r: 0.6 });
  [PZ.ANCLAS.cera, PZ.ANCLAS.lira, TARIMA].forEach(q => R.push({ x: q.x, z: q.y, r: 0.6 }));
  R.push({ x: CLARO.x, z: CLARO.y, r: 0.8 });
}

export default {
  era: 4,
  nombre: 'El ágora',
  piezas: PZ.PIEZAS,
  construir(mo) {
    const { K, raiz, dyn, vivos, ranura, ranuras, persona, ubicar, ver, animar, opacidad, tocP } = mo;
    const oficio = (i, f) => conActores(fase(i) === 'meseta', f);
    reservar();

    /* ---------- el valle: lo quieto se funde; el suelo, el agua y la hierba se repintan con el año ---------- */
    const suelo = V.suelo(K), rio = V.rio(K, vivos), veg = V.vegetacion(K, vivos);
    const quieto = new THREE.Group();
    quieto.add(V.losa(K), V.plaza(K), V.casas(K), V.campo(K), V.colmenas(K, vivos), veg.g);
    fundir(K, quieto);
    /* la Acrópolis y la stoa se funden aparte, con la tinta fina de las miniaturas, y después se suman a lo quieto */
    const acro = MON.acropolis(K, 'pericles'); fundir(K, acro, 0.014); acro.scale.setScalar(ACRO.s); acro.position.set(ACRO.x, 0, ACRO.y); quieto.add(acro);
    const stoa = MON.stoa(K, 'zeus'); fundir(K, stoa, 0.014); stoa.scale.setScalar(STOA.s); stoa.position.set(STOA.x, 0, STOA.y); quieto.add(stoa);
    raiz.add(suelo, rio.g, quieto);
    const nubes = M.nubes(K, vivos); raiz.add(nubes.g);
    const luciernagas = M.luciernagas(vivos); raiz.add(luciernagas);
    const luzStoa = new THREE.PointLight('#ffc27a', 0, 6, 1.5); luzStoa.position.set(9.6, 1.0, 7.6); raiz.add(luzStoa);
    const luzCasas = new THREE.PointLight('#ffae5a', 0, 5, 1.6); luzCasas.position.set(4.0, 0.9, 11.6); raiz.add(luzCasas);
    const luzAltar = new THREE.PointLight('#ffb35c', 0, 3.5, 1.6); luzAltar.position.set(V.ALTAR12.x, 0.6, V.ALTAR12.y); raiz.add(luzAltar);
    const lamparas = LAMPARAS.map(L => { const l = PZ.lampara(K); l.position.set(L.x, 0, L.y); dyn.add(l); return { ...L, l }; });

    /* ---------- el año del Ática (ESTACIONES_AGORA del motor): cuatro estaciones; el Ilisos crece con las lluvias ---------- */
    let pasoVestido = -1;
    function vestir() {
      const e = mo.estacionHoy();
      if (e.paso === pasoVestido) return; pasoVestido = e.paso;
      const k = e.k || 0, sig = e.sig || e, mez = (a, b) => k > 0 ? lerpHex(a, b, k) : a;
      const pal = { campo: e.campo.map((c, i) => mez(c, sig.campo[i])) };
      for (const c of ['ribera', 'humedo', 'aguaBaja', 'cauce', 'hondo']) pal[c] = mez(e[c], sig[c]);
      suelo.userData.pintar(pal); rio.pintar(pal);
      rio.crecida = (e.crecida || 1) + ((sig.crecida || 1) - (e.crecida || 1)) * k; rio.nivel = V.nivelIlisos(rio.crecida);
      veg.vestir(e.i, k, sig.i ?? ((e.i + 1) % 4));
    }

    /* ---------- los que siempre están ---------- */
    const guias = [0, 1, 2, 3, 4].map(i => {
      const o = i === 0 ? { ...PZ.MAESTRO, colorRopa: '#f4efe2', chal: '#c9b48a' }                                      // el grammatistes Dionisio
        : i === 1 ? { piel: 0, pelo: 'moño', colorPelo: '#3a2a1e', ropa: 'tunica', colorRopa: '#e9dcc0', orla: '#7a4a6e', chal: '#7a4a6e' }   // ⚖️ Aspasia
        : { ...PZ.MAESTRO, piel: [2, 0, 1][i - 2], colorPelo: ['#2a1f18', '#6a4a2a', '#3a2a1e'][i - 2], chal: ['#7a4a3a', '#3f7fb5', '#5f7a4a'][i - 2] };
      const p = persona(o, { pose: 'narrar' });
      if (i === 0) { const t = new THREE.Group(); const c = K.malla(K.caja(0.16, 0.012, 0.12), '#8a6a4a', { grosor: 0.003 }); t.add(c); t.rotation.x = 1.0; p.sostener(t, 'I'); }   // su tablilla
      return p;
    });
    const socrates = persona({ piel: 1, pelo: 'rapado', colorPelo: '#e8e4d8', barba: '#e8e4d8', ropa: 'tunica', colorRopa: '#c9b48a', orla: '#a8946a' }, { pose: 'quieto' });
    let socAntes = -1, socCamino = null;
    const pedagogo = persona({ piel: 3, pelo: 'corto', colorPelo: '#2a1f18', barba: '#2a1f18', ropa: 'corta', colorRopa: '#b9a07a', sinFlecos: true }, { pose: 'andar' });
    { const l = new THREE.Group(); const c = K.malla(K.esfera(0.045, 0.5), '#8a6a4a', { grosor: 0.002 }); c.scale.set(1, 0.4, 0.8); l.add(c); pedagogo.sostener(l, 'I'); }   // le carga la lira al muchacho
    const muchacho = persona(PZ.aprendiz(9), { pose: 'andar' });
    const dudosos = DUDAS.map((d, i) => persona(PZ.aprendiz(10 + i), { pose: 'quieto' }));
    const cosecheros = COSECHA.map((c, i) => persona({ piel: 2 + (i % 2), pelo: 'corto', colorPelo: '#2a1f18', ropa: 'corta', colorRopa: '#c9b48a', sinFlecos: true }, { pose: i ? 'agachado' : 'cargar' }));
    cosecheros.forEach((p, i) => { const c = K.malla(K.cilindro(0.09, 0.07, 0.12, 8), '#b9945a', { grosor: 0.004 }); const g = new THREE.Group(); g.add(c); c.position.y = 0.06; g.position.set(COSECHA[i].x - 0.22, 0, COSECHA[i].y + 0.12); dyn.add(g); p.cesto = g; });
    const aprendices = mo.paseantes(18, { opciones: i => PZ.aprendiz(i), inicio: i => ({ x: 8.9 + (i % 5) * 0.5, z: 8.0 + Math.floor(i / 5) * 0.4 }), semilla: 44 });
    const cabra = crearCabra(K); cabra.obj.position.set(5.25, 0, 9.1); dyn.add(cabra.obj); cabra.dx = 5.25; cabra.dy = 9.1; cabra.espera = 1;

    /* ---------- por dónde se camina ---------- */
    const enRect = (x, z, r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
    const RECTS = V.RESERVAS.filter(r => r.x0 !== undefined);
    let claveObst = '', vela = [], corros = [];
    function rehacerPaso() {
      const circulos = [...MAESTROS.map(q => ({ x: q.x, z: q.y, r: 0.35 })), { x: ZEUS.x, z: ZEUS.y, r: 0.22 }, { x: V.ALTAR12.x, z: V.ALTAR12.y, r: 0.56 }]
        .concat([...V.OLIVOS, ...V.OLIVOS_CAMPO].map(([x, z]) => ({ x, z, r: 0.2 })), V.COLMENAS.map(([x, z]) => ({ x, z, r: 0.28 })), V.CIPRESES.map(([x, z]) => ({ x, z, r: 0.18 })),
          [{ x: V.PLATANO.x, z: V.PLATANO.y, r: 0.25 }, { x: V.HORO.x, z: V.HORO.y, r: 0.12 }], lamparas.map(L => ({ x: L.x, z: L.y, r: 0.12 })));
      mo.rehacerCaminos({ circulos, bloquea: (x, z) => V.altura(x, z) < -0.05 || RECTS.some(r => enRect(x, z, r)) || x < 2.25 || z < 2.25 });
      aprendices.rehacer();
      vela = VELA.filter(([x, z]) => mo.caminos.libre(x, z)).map(([x, z]) => ({ x, z, mira: { x: STOA.x, y: STOA.y } }));
      const usados = [];
      corros = MAESTROS.map(m => buscarAsientos(m, 9, usados));
      corroSofista = S.sofista ? buscarAsientos({ x: TARIMA.x, y: TARIMA.y + 0.15 }, 9, usados) : [];
    }
    let corroSofista = [];
    function buscarAsientos(m, cupo, usados) {
      const cand = [];
      for (const r of [0.75, 1.1]) for (let k = 0; k < 18; k++) { const a = Math.PI / 4 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (0.42 / r); cand.push({ x: m.x + Math.cos(a) * r, z: m.y + Math.sin(a) * r, d: Math.ceil(k / 2) * 0.42 / r + r * 0.6 }); }
      cand.sort((u, v) => u.d - v.d);
      const lista = [];
      for (const c of cand) {
        if (lista.length >= cupo) break;
        if (!mo.caminos.libre(c.x, c.z) || V.altura(c.x, c.z) < -0.02 || V.reservado(c.x, c.z, 0.05)) continue;
        if (usados.some(u => Math.hypot(u.x - c.x, u.z - c.z) < 0.36) || MAESTROS.some(o => Math.hypot(o.x - c.x, o.y - c.z) < 0.5)) continue;
        if (Math.hypot(c.x - CLARO.x, c.z - CLARO.y) < 0.85 || Math.hypot(c.x - BANCO.x, c.z - BANCO.y) < 0.45) continue;   // el claro y el banco quedan libres para su gesto
        const q = { x: c.x, z: c.z, mira: { x: m.x, y: m.y } }; lista.push(q); usados.push(q);
      }
      return lista;
    }

    /* ---------- cada cuadro ---------- */
    /* EL SECRETO DE LA ÉPOCA: una noche de otoño, los iniciados salen de la ciudad con antorchas, camino de Eleusis */
    const secretoEleusis = (() => {
      const RUTA = [[9.0, 10.0], [7.4, 10.6], [6.7, 11.5], [6.0, 12.9], [4.4, 13.8], [2.3, 14.1]];
      const tramos = []; let L = 0;
      for (let i = 0; i < RUTA.length - 1; i++) { const [ax, ay] = RUTA[i], [bx, by] = RUTA[i + 1], l = Math.hypot(bx - ax, by - ay); tramos.push({ ax, ay, bx, by, l, d0: L }); L += l; }
      const punto = d => { const tr = tramos.find(q => d <= q.d0 + q.l) || tramos.at(-1), k = Math.min(1, Math.max(0, (d - tr.d0) / tr.l)); return { x: tr.ax + (tr.bx - tr.ax) * k, y: tr.ay + (tr.by - tr.ay) * k }; };
      const inic = [0, 1, 2, 3, 4, 5, 6].map(i => {
        const p = persona({ piel: [0, 1, 2, 1, 0, 2, 1][i], pelo: i % 2 ? 'rizos' : 'corto', colorPelo: i % 3 ? '#3a2a1e' : '#6a4a2a', barba: i % 3 === 0, ropa: 'tunica', colorRopa: '#f4efe2', orla: '#c9b48a', vincha: '#3f6b3a', chal: '#ece4d0' }, { pose: 'antorcha' });
        const a = SE.antorcha(K); a.rotation.x = Math.PI; a.position.y = 0.05; a.scale.setScalar(1.35); p.sostener(a, 'D'); p.antorcha = a; ver(p, false); return p;   // la llama sigue al brazo, por encima de la cabeza
      });
      const luzP = new THREE.PointLight('#ffb35c', 0, 4.5, 1.5); raiz.add(luzP);
      let t0 = null;
      return (t, dt, luz, on) => {
        const ve = on && luz < 0.38 && estacion().i === 2;
        if (!ve) { if (t0 !== null) inic.forEach(p => ver(p, false)); luzP.intensity = 0; t0 = null; return; }
        if (t0 === null) t0 = t;
        const s = ((t - t0) * 0.32) % (L + 3.5 + 6 * 0.78);
        inic.forEach((p, i) => {
          const d = s - i * 0.78; if (d < 0 || d > L) { ver(p, false); return; }
          ver(p, true); const q = punto(d), q2 = punto(Math.min(L, d + 0.15)); ubicar(p, q.x, q.y, q2);
          opacidad(p.obj, Math.min(1, d / 0.4, (L - d) / 0.4)); animar(p, t, dt);
          p.antorcha.userData.llama.scale.set(1, 1 + 0.25 * Math.sin(t * 12 + i), 1);
          tocP(q.x, q.y, { k: 'secreto', id: 'eleusis', x: q.x, y: q.y }, p);
        });
        const mid = punto(Math.max(0, Math.min(L, s - 2.3))); luzP.position.set(mid.x, 0.8, mid.y); luzP.intensity = 2.4 * (0.9 + 0.1 * Math.sin(t * 9));
      };
    })();
    function sincronizar(t, dt) {
      const e4 = S.era === 4, luz = luzDia(), noche = nocheCasa();
      vestir();
      const lk = Math.max(0, Math.min(1, (0.55 - luz) / 0.25));
      luciernagas.userData.k = lk * lk * (3 - 2 * lk) * 0.6; luciernagas.visible = luciernagas.userData.k > 0.01;

      // --- las ranuras de los saberes (la palestra está desde el principio: el patio de arena, todavía sin pórtico) ---
      ranura('cera', tiene(33) ? llave(33) : null, () => oficio(33, () => PZ.cera(K, niv(33))));
      ranura('lira', tiene(34) ? llave(34) : null, () => oficio(34, () => PZ.liraPieza(K, niv(34))));
      ranura('palestra', tiene(35) ? llave(35) : 'patio', () => oficio(35, () => PZ.palestra(K, niv(35))));
      ranura('sofista', tiene(36) ? llave(36) : null, () => oficio(36, () => PZ.sofista(K, niv(36))));
      ranura('pregunta', tiene(37) ? llave(37) : null, () => oficio(37, () => PZ.pregunta(K, niv(37))));
      const f38 = fase(38), etapa38 = f38 === 'sin' ? null : f38 === 'meseta' ? niv(38) : 'obra';
      ranura('academia', etapa38, () => oficio(38, () => PZ.academia(K, etapa38)));
      const clave = mo.claveRanuras() + '|' + S.docentes + '|' + (S.sofista ? 1 : 0);
      if (clave !== claveObst) { claveObst = clave; rehacerPaso(); }
      mo.animarRanuras(t, dt);

      // --- los tocables: las piezas y el mundo (con las claves del 2D) ---
      for (const r of Object.values(ranuras)) if (r.P && r.P.toc) for (const q of r.P.toc) tocP(q.x, q.y, { k: q.k }, q.p);
      tocable(ACRO.x + 0.3, ACRO.y, { k: 'acropolis' }, { rx: 90, ry: 40, dy: 50 });
      tocable(STOA.x, STOA.y, { k: 'stoa' }, { rx: 70, ry: 28, dy: 30 });
      tocable(ZEUS.x, ZEUS.y, { k: 'zeusEl' }, { rx: 12, ry: 10, dy: 30 });
      tocable(BANCO.x, BANCO.y, { k: 'banco' }, { rx: 18, ry: 10, dy: 4 });
      if (tiene(37)) tocable(CLARO.x, CLARO.y, { k: 'agora' }, { rx: 26, ry: 13, dy: 2 });
      tocable(V.ALTAR12.x, V.ALTAR12.y, { k: 'altar' }, { rx: 16, ry: 10, dy: 8 });
      tocable(V.HORO.x, V.HORO.y, { k: 'horoAgora' }, { rx: 9, ry: 8, dy: 12 });
      tocable(14.0, 4.7, { k: 'palestra' }, { rx: 60, ry: 30, dy: 10 });
      if (!tiene(38)) tocable(4.6, 7.95, { k: 'olivar' }, { rx: 70, ry: 36, dy: 14 });
      V.COLMENAS.forEach(([x, z]) => tocable(x, z, { k: 'colmena' }));
      V.CASAS.forEach(([x0, z0, w, d]) => tocable(x0 + w / 2, z0 + d / 2, { k: 'casaAtica' }, { rx: 26, ry: 16, dy: 12 }));
      tocable(V.PLATANO.x, V.PLATANO.y, { k: 'platano' }, { rx: 24, ry: 14, dy: 40 });
      tocable(15.6, 13.6, { k: 'ilisos' }, { rx: 40, ry: 16, dy: 0 });
      tocable((V.VINA.x0 + V.VINA.x1) / 2, (V.VINA.z0 + V.VINA.z1) / 2, { k: 'vina' }, { rx: 60, ry: 30, dy: 6 });
      tocable(V.ERA.x, V.ERA.y, { k: 'era' }, { rx: 34, ry: 18, dy: 4 });
      tocable(V.POZO.x, V.POZO.y, { k: 'pozo' }, { rx: 12, ry: 8, dy: 10 });
      tocable(V.BOREAS.x, V.BOREAS.y, { k: 'boreas' }, { rx: 12, ry: 8, dy: 8 });

      // --- la cabra del olivar ---
      pastar(t, dt); tocable(cabra.obj.position.x, cabra.obj.position.z, { k: 'cabraAt' });

      // --- los maestros (Aspasia entre ellos) y Sócrates ---
      const vis = Math.min(S.alumnos, 18), sueltos = Math.min(vis, Math.max(0, Math.round(S.alumnos - alumnosBien())));
      const cupos = [Math.min(12, BALANCE.ratioDocente + 3 + palestraSitio()), ...[1, 2, 3, 4].map(k => k < S.docentes ? cupoGuia(k) + palestraSitio() : 0)];
      const aporiaDe = new Map((S.aporias || []).map(a => [a.i % 18, a]));
      const plan = [], planM = [];
      const conCorro = [...corros.map((c, m) => ({ sitios: c, cupo: cupos[m], m })), ...(S.sofista ? [{ sitios: corroSofista, cupo: BALANCE.ratioDocente + palestraSitio(), m: 'sofista' }] : [])];
      for (const { sitios, cupo, m } of conCorro) {
        for (let j = 0; j < Math.min(cupo, sitios.length) && plan.length < vis - sueltos; j++) { plan.push(sitios[j]); planM.push(m); }
      }
      guias.forEach((p, i) => {
        if (!ver(p, i === 0 ? S.docentes >= 1 : i < S.docentes)) return;
        const m = MAESTROS[i]; ubicar(p, m.x, m.y, noche > 0.5 ? { x: STOA.x, y: STOA.y } : { x: m.x + 1, y: m.y + 1 });
        p.e.pose = noche > 0.5 && i > 0 ? 'quieto' : 'narrar'; animar(p, t, dt); tocP(m.x, m.y, { k: 'docente', i }, p);
      });
      const estS = e4 ? estadoPensador('socrates') : 0;
      if (estS !== socAntes && socAntes !== -1 && estS > 0 && nacimientosVivos) {      // llega desde el este, o pasa de la espera a su rincón: caminando
        const desde = socAntes === 1 ? ESPERA_SOCRATES : { x: 16.8, y: 10.2 }, hasta = estS === 1 ? ESPERA_SOCRATES : LUGAR_SOCRATES;
        socCamino = { cola: mo.caminos.ruta({ x: desde.x, z: desde.y }, { x: hasta.x, z: hasta.y }), pos: { x: desde.x, z: desde.y } };
      }
      socAntes = estS;
      if (ver(socrates, estS >= 1)) {
        const L0 = estS === 1 ? ESPERA_SOCRATES : LUGAR_SOCRATES;
        let px = L0.x, py = L0.y, anda = false, mira = { x: CLARO.x, y: CLARO.y };
        if (socCamino) {
          const c = socCamino, d = c.cola[0];
          if (!d) socCamino = null;
          else { const dx = d.x - c.pos.x, dz = d.z - c.pos.z, L = Math.hypot(dx, dz); if (L < 0.05) c.cola.shift(); else { const s = Math.min(L, 0.6 * dt); c.pos.x += dx / L * s; c.pos.z += dz / L * s; } px = c.pos.x; py = c.pos.z; anda = true; mira = { x: px + dx, y: py + dz }; }
        }
        ubicar(socrates, px, py, mira); socrates.e.pose = anda ? 'andar' : estS === 2 ? 'narrar' : 'quieto'; animar(socrates, t, dt);
        tocP(px, py, { k: 'pensador', id: 'socrates' }, socrates);
      }

      // --- las dudas que esperan en la plaza: uno o dos muchachos de pie, mirando el banco ---
      dudosos.forEach((p, i) => {
        const on = e4 && tiene(37) && (S.dudaPend || 0) > i && noche < 0.5;
        if (!ver(p, on)) return;
        ubicar(p, DUDAS[i][0], DUDAS[i][1], BANCO); animar(p, t, dt);
      });

      // --- el pedagogo que trae al muchacho desde su casa, y vuelve ---
      moverPedagogo(t, dt, e4 && noche < 0.5);

      // --- la cosecha de la oliva, en otoño ---
      const otono = e4 && estacion().i === 2 && noche < 0.5;
      cosecheros.forEach((p, i) => { p.cesto.visible = otono; if (!ver(p, otono)) return; const c = COSECHA[i]; ubicar(p, c.x, c.y, { x: c.x - 0.3, y: c.y - 0.3 }); animar(p, t, dt); tocP(c.x, c.y, { k: 'cosecha' }, p); });

      // --- los aprendices: de día, los corros; el que se llevó una duda camina pensando; de noche, seis a la luz de la stoa ---
      const deNoche = noche > 0.5;
      const asiento = deNoche ? i => vela[i] || null : i => aporiaDe.has(i) ? null : plan[i] || null;
      const maestro = m => m === 'sofista' ? 'el sofista de la tarima' : LEX().nombres[m % LEX().nombres.length];
      aprendices.paso(t, dt, deNoche ? Math.min(vis, vela.length) : vis, { asiento, mira: MAESTROS[0] }, a => ({ k: 'alumno', i: a.i, con: deNoche ? undefined : planM[a.i] !== undefined ? maestro(planM[a.i]) : null }));

      // --- la noche: las lámparas de la stoa, el hogar de las casas, el fuego del altar ---
      const oscuro = luz < 0.5, n1 = 1 - luz;
      lamparas.forEach(L => { const ll = L.l.userData.llama; ll.visible = oscuro; ll.scale.set(1, 1 + 0.25 * Math.sin(t * 12 + L.x), 1); });
      luzStoa.intensity = n1 * 3.4 * (0.92 + 0.08 * Math.sin(t * 9));
      luzCasas.intensity = n1 * 2.2 * (0.9 + 0.1 * Math.sin(t * 7));
      luzAltar.intensity = n1 * 1.8 * (0.9 + 0.1 * Math.sin(t * 11));

      secretoEleusis(t, dt, luz, e4);
      mo.luces(t);
      vivos.forEach(f => f(t, dt));
      return { luz, brasa: 0 };
    }

    function pastar(t, dt) {
      const pos = cabra.obj.position; cabra.espera -= dt;
      if (cabra.espera <= 0) { cabra.dx = CABRA.x0 + Math.random() * (CABRA.x1 - CABRA.x0); cabra.dy = CABRA.y0 + Math.random() * (CABRA.y1 - CABRA.y0); cabra.espera = 3 + Math.random() * 4; }
      const dx = cabra.dx - pos.x, dz = cabra.dy - pos.z, L = Math.hypot(dx, dz);
      if (L > 0.03) { const s = Math.min(L, 0.22 * dt); pos.x += dx / L * s; pos.z += dz / L * s; cabra.obj.rotation.y = Math.atan2(dx, dz); }
      cabra.cab.rotation.x = L > 0.03 ? 0 : 0.5 + 0.2 * Math.sin(t * 2);
    }
    /* el pedagogo trae al muchacho de su casa a la plaza, lo deja frente al banco y vuelve (150 s, como el padre de Egipto) */
    function moverPedagogo(t, dt, on) {
      const cyc = ((t / 150) % 1 + 1) % 1;
      const tramo = f => { const n = RUTA_PEDAGOGO.length - 1, ft = Math.min(0.999, f) * n, i = Math.floor(ft), k = ft - i, a = RUTA_PEDAGOGO[i], b = RUTA_PEDAGOGO[i + 1]; return { x: a[0] + (b[0] - a[0]) * k, y: a[1] + (b[1] - a[1]) * k, dx: b[0] - a[0], dy: b[1] - a[1] }; };
      let p = null, vuelve = false, alfa = 1, quieto = false;
      if (cyc < 0.2) { p = tramo(smooth(cyc / 0.2)); alfa = Math.min(1, cyc / 0.03); }
      else if (cyc < 0.34) { p = tramo(1); quieto = true; }
      else if (cyc < 0.54) { p = tramo(smooth(1 - (cyc - 0.34) / 0.2)); vuelve = true; alfa = Math.min(1, (0.54 - cyc) / 0.03); }
      const ve = on && p && alfa > 0.02;
      ver(pedagogo, !!ve); ver(muchacho, !!ve);
      if (!ve) return;
      const dir = vuelve ? { x: -p.dx, y: -p.dy } : { x: p.dx, y: p.dy }, L = Math.hypot(dir.x, dir.y) || 1, nx = -dir.y / L, nz = dir.x / L;
      const objetivo = quieto ? BANCO : { x: p.x + dir.x, y: p.y + dir.y };
      // el muchacho va adelante y el pedagogo un paso detrás, vigilándolo (así los pintan los vasos)
      const mx = p.x + (dir.x / L) * 0.3, my = p.y + (dir.y / L) * 0.3;
      ubicar(muchacho, mx, my, objetivo); ubicar(pedagogo, p.x + nx * 0.12, p.y + nz * 0.12, quieto ? { x: mx, y: my } : objetivo);
      pedagogo.e.pose = muchacho.e.pose = quieto ? 'quieto' : 'andar';
      opacidad(pedagogo.obj, alfa); opacidad(muchacho.obj, alfa); animar(pedagogo, t, dt); animar(muchacho, t, dt);
      if (alfa > 0.6) { tocP(p.x + nx * 0.12, p.y + nz * 0.12, { k: 'pedagogo' }, pedagogo); tocP(mx, my, { k: 'muchacho' }, muchacho); }
    }

    /* ---------- el estado de cada saber y los globos: el pase 2D ---------- */
    const ALTO = { 33: 34, 34: 40, 35: 30, 36: 40, 37: 22, 38: 34 };
    const DONDE = { 33: PZ.ANCLAS.cera, 34: PZ.ANCLAS.lira, 35: PZ.ANCLAS.palestra, 36: TARIMA, 37: CLARO, 38: { x: PZ.ANCLAS.academia.x, y: PZ.ANCLAS.academia.y + 1.5 } };
    function superponer(t) {
      for (const i of [33, 34, 35, 36, 37, 38]) { if (!tiene(i)) continue; const a = DONDE[i], p = P(a.x, a.y, ALTO[i]); estadoTec(i, { x: p.x, y: p.y }, t); }
      if (S.era !== 4) return;
      // las dudas: «?» sobre los que esperan; y sobre el que camina con su aporía, «?» que se vuelve «!» al final
      dudosos.forEach((p, i) => { if (!p.obj.visible) return; const q = P(p.obj.position.x, p.obj.position.z); drawGloboDuda(q.x, q.y, '?', t); });
      for (const a of S.aporias || []) {
        const k = aprendices.lista[a.i % 18]; if (!k || !k.p.obj.visible) continue;
        const q = P(k.p.obj.position.x, k.p.obj.position.z), f = (S.tiempoJuego - a.t0) / APORIA_DUR;
        drawGloboDuda(q.x, q.y, f > 0.85 ? '!' : '?', t);
      }
      if (estadoPensador('socrates') === 1 && VISITAS.socrates && !socCamino) drawGlobo(ESPERA_SOCRATES.x, ESPERA_SOCRATES.y, t);
    }

    /* ---------- los rótulos de acción: lo que se toca en el ágora ---------- */
    function rotulos(ancla, t, tocarEn) {
      const e4 = S.era === 4;
      /* los tres verbos se llaman directo: junto al banco se sientan los que escuchan y está el maestro, y un toque simulado
         en el mundo podía caer en ellos y abrir su ficha (6 de 17 en el jugador del QA) */
      ancla('decir', e4 && puedeDecir(), BANCO.x, BANCO.y, 26, `decir la respuesta · ${S.dudaPend || 0}`, 'accion', () => decirRespuesta());
      ancla('preguntar', e4 && puedePreguntar(), CLARO.x, CLARO.y, 20, 'preguntar', 'accion', () => preguntarDuda());
      ancla('sofista', e4 && puedeContratarSofista(), TARIMA.x, TARIMA.y, 46, `contratar al sofista · ${fmt(sofistaCobro())} ${monIco()}`, 'accion', () => contratarSofista());
      const estS = e4 ? estadoPensador('socrates') : 0;
      ancla('recibir', estS === 1 && S.apr >= (VISITAS.socrates?.costo || 0), ESPERA_SOCRATES.x, ESPERA_SOCRATES.y, 52, 'recibir a Sócrates', 'accion', () => tocarEn(ESPERA_SOCRATES.x, ESPERA_SOCRATES.y));
    }

    /* las caras de quienes firman la consejera en esta época */
    const caras = {
      'grammatistes': { ...PZ.MAESTRO },
      'sócrates': { piel: 1, pelo: 'rapado', colorPelo: '#e8e4d8', barba: '#e8e4d8', ropa: 'tunica', colorRopa: '#c9b48a' },
    };
    return { quieto, nubes, sincronizar, superponer, rotulos, caras, aprendices, get corros() { return corros; } };
  },
};

/* ---------- utilería de la época ---------- */
/* Amaltea, la cabra del olivar: blanca y gris, come las aceitunas caídas */
function crearCabra(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const cu = K.malla(K.capsula(0.08, 0.16, 0.6), '#d8d0bc', { grosor: 0.008 }); cu.rotation.x = Math.PI / 2; cu.position.y = 0.2; g.add(cu);
  [[-0.05, -0.1], [0.05, -0.1], [-0.05, 0.1], [0.05, 0.1]].forEach(([x, z]) => { const p = K.malla(K.cilindro(0.015, 0.012, 0.16, 5), '#8a7a5a', { sinTinta: true }); p.position.set(x, 0.08, z); g.add(p); });
  const cab = new THREE.Group(); cab.position.set(0, 0.28, 0.16); g.add(cab);
  const c = K.malla(K.capsula(0.045, 0.06, 0.5), '#d8d0bc', { grosor: 0.005 }); c.rotation.x = 1.1; cab.add(c);
  [-1, 1].forEach(l => { const cu2 = K.malla(K.cono(0.012, 0.11, 4), '#5a4a3a', { sinTinta: true }); cu2.position.set(l * 0.025, 0.07, -0.03); cu2.rotation.x = -0.7; cab.add(cu2); });
  const barba = K.malla(K.cono(0.015, 0.05, 4), '#8a7a5a', { sinTinta: true }); barba.rotation.x = Math.PI; barba.position.set(0, -0.06, 0.05); cab.add(barba);
  return { obj: g, cab };
}
