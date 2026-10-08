/* ============================================================
   epocas/epoca10
   La Época 10 (Santiago de Chile, 1821-1880) sobre el motor 3D. Como las otras: aquí vive lo de ESTA época (la cordillera,
   el Mapocho con su puente, el damero con sus casas de patio, el cerro Santa Lucía que se transforma con la época, quién
   está dónde, su año de lluvias y álamos, su noche y sus rótulos); el cómo lo pone motor3d.js. El mundo vive en
   src/santiago/. Las anclas de la lógica (la escuela lancasteriana, la Escuela Normal, la del silabario, la de preceptoras,
   el Congreso, el kindergarten, la estación de la diligencia) son las del motor (09h).
   LOS NORMALISTAS SE VEN: cada uno que se manda a un pueblo sale caminando con su maleta por la Alameda.
   ============================================================ */
import * as THREE from 'three';
import { fundir } from '../kit.js';
import * as M from '../mundo.js';
import * as V from '../santiago/valle.js';
import * as MON from '../santiago/monumentos.js';
import * as PZ from '../santiago/piezas.js';
import * as L from '../santiago/lugares.js';
import { conActores, pieza } from '../piezas.js';
import { fase, tiene, niv, llave, Z2D } from '../motor3d.js';
import * as SE from '../secretos.js';

/* ---------- dónde está cada cosa ---------- */
const CUMBRES = [[2.6, 3.1, 2.4, 0.95], [3.7, 2.45, 2.8, 1.05], [2.35, 4.55, 1.9, 0.8], [4.95, 2.35, 2.1, 0.85], [6.1, 2.4, 1.5, 0.7], [2.35, 5.9, 1.4, 0.62], [7.1, 2.25, 1.1, 0.55]];
const MAESTROS = [{ x: 9.0, y: 10.02 }, { x: 9.6, y: 10.02 }, { x: 6.475, y: 10.4 }, { x: 12.1, y: 10.4 }, { x: 10.975, y: 8.2 }];
const LOGIA = { x: 14.9125, y: 7.3125 };
const POSTA = { x: 3.15, y: 13.55 };                                         // la posta de la diligencia, al poniente de la Alameda
const FAROLES = [{ x: 8.85, y: 9.1 }, { x: 9.75, y: 9.1 }, { x: 5.0, y: 12.6 }, { x: 8.0, y: 12.6 }, { x: 11.0, y: 12.6 }, { x: 14.0, y: 12.6 }, { x: 9.0, y: 6.4 }];
const ARRIEROS = [[12.4, 4.4], [13.2, 4.0], [11.6, 4.8]];                    // los arrieros con sus mulas, bajando de la cordillera por la Chimba

function reservar() {
  const R = V.RESERVAS; R.length = 0;
  const manz = (x, z, m = 0.0, extra = {}) => { const h = (L.DAMERO.paso - L.DAMERO.calle) / 2; R.push({ x0: x - h - m, x1: x + h + m, z0: z - h - m, z1: z + h + m, ...extra }); };
  for (const k of ['lancaster', 'normal', 'silabario', 'preceptoras', 'ley', 'kinder']) manz(PZ.ANCLAS[k].x, PZ.ANCLAS[k].y);
  manz(L.MONEDA.x, L.MONEDA.y); manz(L.CATEDRAL.x, L.CATEDRAL.y); manz(L.PLAZA.x, L.PLAZA.y, 0, { plaza: true }); manz(LOGIA.x, LOGIA.y);
  const sl = L.manzana(L.SANTALUCIA.x, L.SANTALUCIA.y); manz(sl.x, sl.y); manz(sl.x - L.DAMERO.paso, sl.y); manz(sl.x, sl.y - L.DAMERO.paso); manz(sl.x, sl.y + L.DAMERO.paso);
  R.push({ x: L.SANTALUCIA.x, z: L.SANTALUCIA.y, r: L.SANTALUCIA.r + 0.15, cerro: true });
  R.push({ x0: POSTA.x - 0.3, x1: POSTA.x + 0.3, z0: POSTA.y - 0.22, z1: POSTA.y + 0.22 });
  MAESTROS.forEach(m => R.push({ x: m.x, z: m.y, r: 0.28, maestro: true }));
}
const lerpHex = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), k).getHexString();
const smooth = k => k * k * (3 - 2 * k);
/* el cerro Santa Lucía se transforma con la época: la roca con el fuerte (1816) y, al final, el paseo de Vicuña Mackenna (1872-1874) */
const etapaSL = () => { const n = [69, 70, 71, 72, 73, 74].filter(i => fase(i) === 'meseta').length; return n >= 6 ? 3 : n >= 4 ? 2 : n >= 2 ? 1 : 0; };

export default {
  era: 10,
  nombre: 'Santiago',
  piezas: PZ.PIEZAS,
  construir(mo) {
    const { K, raiz, dyn, vivos, ranura, ranuras, persona, ubicar, ver, animar, opacidad, tocP } = mo;
    const oficio = (i, f) => conActores(fase(i) === 'meseta', f);
    reservar(); L.verificarEspejo();

    /* ---------- la ciudad: lo quieto se funde; el suelo se repinta con el año ---------- */
    const suelo = V.suelo(K), agua = V.agua(K, vivos), casas = V.casas(K);
    for (const [cx, cz, w, d, rot] of casas.userData.puestas) { const hor = Math.abs(Math.sin(rot)) < 0.5, ww = hor ? w : d, dd = hor ? d : w; V.RESERVAS.push({ x0: cx - ww / 2 - 0.03, x1: cx + ww / 2 + 0.03, z0: cz - dd / 2 - 0.03, z1: cz + dd / 2 + 0.03, casa: true }); }
    const veg = V.vegetacion(K, vivos);
    const quieto = new THREE.Group();
    quieto.add(V.losa(K), casas, veg.g);
    const ca = MON.catedral(K); ca.rotation.y = Math.PI / 2; ca.position.set(L.CATEDRAL.x, 0, L.CATEDRAL.y); quieto.add(ca);   // la fachada mira a la plaza (al oriente)
    const mn = MON.moneda(K); mn.position.set(L.MONEDA.x, 0, L.MONEDA.y); quieto.add(mn);
    const pu = MON.puenteCalYCanto(K, 1.0); pu.position.set(L.PUENTE.x, 0, (L.PUENTE.z0 + L.PUENTE.z1) / 2); quieto.add(pu);
    /* la Plaza de Armas: los árboles, la pila y los bancos */
    const pl = new THREE.Group(); pl.position.set(L.PLAZA.x, 0, L.PLAZA.y); quieto.add(pl);
    const pila = K.malla(K.cilindro(0.12, 0.14, 0.06, 12), MON.SA.piedra, { grosor: 0.002 }); pila.position.y = 0.03; pl.add(pila);
    const agp = K.malla(K.cilindro(0.1, 0.1, 0.01, 12), '#7aa8c0', { sinTinta: true }); agp.position.y = 0.065; pl.add(agp);
    [[-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]].forEach(([x, z]) => { const t = K.malla(K.cilindro(0.015, 0.02, 0.22, 5), '#6a5a42', { grosor: 0.002 }); t.position.set(x, 0.11, z); pl.add(t); const c = K.malla(K.esfera(0.11, 0.5), '#5f7a3a', { grosor: 0.003 }); c.position.set(x, 0.3, z); pl.add(c); });
    const po = MON.casa(K, 0.5, 0.3, 0.26, { zaguan: true }); po.position.set(POSTA.x, 0, POSTA.y); quieto.add(po);   // la posta de la diligencia
    fundir(K, quieto);
    raiz.add(suelo, agua.g, quieto);
    const cord = MON.cordillera(K, CUMBRES); fundir(K, cord, 0.012); raiz.add(cord);
    const nubes = M.nubes(K, vivos); raiz.add(nubes.g);
    const luciernagas = M.luciernagas(vivos); raiz.add(luciernagas);
    const luzPlaza = new THREE.PointLight('#ffb35c', 0, 5, 1.5); luzPlaza.position.set(L.PLAZA.x, 1.0, L.PLAZA.y); raiz.add(luzPlaza);
    const luzAlameda = new THREE.PointLight('#ffae5a', 0, 7, 1.6); luzAlameda.position.set(9.5, 1.0, 12.9); raiz.add(luzAlameda);
    const luzNormal = new THREE.PointLight('#ffb35c', 0, 3.5, 1.6); luzNormal.position.set(L.NORMAL.x, 0.8, L.NORMAL.y + 0.3); raiz.add(luzNormal);
    const luzBarrios = new THREE.PointLight('#ffae5a', 0, 7, 1.6); luzBarrios.position.set(6.0, 1.0, 8.6); raiz.add(luzBarrios);
    const faroles = FAROLES.map(Q => { const l = PZ.farol(K); l.position.set(Q.x, 0, Q.y); dyn.add(l); return { ...Q, l }; });

    /* ---------- los caminos: la diligencia de Valparaíso, los arrieros de la cordillera ---------- */
    const dil = MON.diligencia(K); dyn.add(dil);
    const arrieros = ARRIEROS.map((_, i) => persona({ ...PZ.ARRIERO, chal: ['#a8352f', '#3f5a7a', '#8a6a3a'][i] }, { pose: 'andar' }));
    const mulas = ARRIEROS.map(() => { const m = MON.mula(K); dyn.add(m); return m; });

    /* ---------- el año de Santiago (ESTACIONES_SANTIAGO del motor): los álamos, el Mapocho que sube y baja, la nieve de la cordillera ---------- */
    let pasoVestido = -1;
    function vestir() {
      const e = mo.estacionHoy();
      if (e.paso === pasoVestido) return; pasoVestido = e.paso;
      const k = e.k || 0, sig = e.sig || e, mez = (a, b) => k > 0 ? lerpHex(a, b, k) : a;
      suelo.userData.pintar({ campo: e.campo.map((c, i) => mez(c, sig.campo[i])) });
      veg.vestir(e.i, k, sig.i ?? ((e.i + 1) % 4));
      const cr = (e.crecida || 1) + ((sig.crecida || 1) - (e.crecida || 1)) * k;
      agua.rio.position.y = V.NIVEL + (cr - 1) * 0.12;
      const nieve = e.i === 3 ? 1 - k : sig.i === 3 ? k : 0; cord.userData.nevar?.(nieve);
    }

    /* ---------- los que siempre están ---------- */
    const guias = [0, 1, 2, 3, 4].map(i => persona(i === 0 ? { ...PZ.BELLO } : i === 1 ? { ...PZ.PRECEPTORA } : { ...PZ.PRECEPTOR, piel: [1, 2, 0][i - 2], colorPelo: ['#2a1f18', '#4a3424', '#6a5a4a'][i - 2] }, { pose: 'narrar' }));
    const viajeros = [0, 1, 2].map(i => persona({ ...PZ.PRECEPTOR, colorPelo: ['#2a1f18', '#3a2a1e', '#4a3424'][i] }, { pose: 'andar' }));
    const maletas = viajeros.map(() => K.malla(K.caja(0.07, 0.05, 0.03), '#5a3a24', { grosor: 0.0015 }));
    viajeros.forEach((p, i) => p.sostener?.(maletas[i], 'D'));
    const sarmiento = persona({ ...PZ.SARMIENTO }, { pose: 'quieto' });
    const mulaS = MON.mula(K); dyn.add(mulaS);
    let sarAntes = -1, sarCamino = null;
    const anilloNormal = SE.ondas(2, 0.6, '#ffd76a'); anilloNormal.position.set(L.NORMAL.x, 0.02, L.NORMAL.y); dyn.add(anilloNormal);
    const aprendices = mo.paseantes(18, { opciones: i => PZ.nino(i), inicio: i => ({ x: 8.8 + (i % 5) * 0.25, z: 8.9 + Math.floor(i / 5) * 0.2 }), semilla: 1842 });

    /* ---------- por dónde se camina: las calles del damero, la plaza, la Alameda; el río (salvo el puente), el cerro y la cordillera no ---------- */
    const enRect = (x, z, r) => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1;
    let claveObst = '', corros = [];
    function rehacerPaso() {
      const RECTS = V.RESERVAS.filter(r => r.x0 !== undefined && !r.plaza);
      const circulos = [{ x: L.SANTALUCIA.x, z: L.SANTALUCIA.y, r: L.SANTALUCIA.r + 0.1 }, { x: L.PLAZA.x, z: L.PLAZA.y, r: 0.16 }, ...faroles.map(Q => ({ x: Q.x, z: Q.y, r: 0.08 }))];
      mo.rehacerCaminos({ circulos, bloquea: (x, z) => V.altura(x, z) < -0.03 || V.altura(x, z) > 0.04 || RECTS.some(r => enRect(x, z, r)) || x < 2.25 || z < 2.25 || x > 17.75 || z > 17.75 });
      aprendices.rehacer();
      const usados = [];
      corros = MAESTROS.map(m => buscarAsientos(m, 9, usados));
    }
    function buscarAsientos(m, cupo, usados) {
      const cand = [];
      for (const r of [0.45, 0.75]) for (let k = 0; k < 18; k++) { const a = Math.PI / 4 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (0.38 / r); cand.push({ x: m.x + Math.cos(a) * r, z: m.y + Math.sin(a) * r, d: Math.ceil(k / 2) * 0.38 / r + r * 0.6 }); }
      cand.sort((u, v) => u.d - v.d);
      const lista = [];
      for (const c of cand) {
        if (lista.length >= cupo) break;
        if (!mo.caminos.libre(c.x, c.z) || V.altura(c.x, c.z) < -0.02 || V.reservado(c.x, c.z, 0.03)) continue;
        if (usados.some(u => Math.hypot(u.x - c.x, u.z - c.z) < 0.26)) continue;
        const q = { x: c.x, z: c.z, mira: { x: m.x, y: m.y } }; lista.push(q); usados.push(q);
      }
      return lista;
    }

    /* ---------- EL SECRETO DE LA ÉPOCA: en invierno, de noche, la sala de la logia con su damero, abierta a la calle por la ventana ---------- */
    const secretoLogia = (() => {
      const x = LOGIA.x, z = LOGIA.y + 0.2;
      const lo = SE.logiaMasonica(K); lo.position.set(x, 0, z); dyn.add(lo);
      const ch = SE.chispitas(6, 0.2, 0.4); ch.position.set(x, 0.05, z); dyn.add(ch);
      const luzL = new THREE.PointLight('#ffcf7a', 0, 1.8, 1.6); luzL.position.set(x + 0.05, 0.4, z - 0.05); raiz.add(luzL);
      const mu = MON.casa(K, 0.6, 0.2, 0.28, { zaguan: false }); mu.position.set(x, 0, z - 0.28); fundir(K, mu, 0.01); raiz.add(mu);   // la casa de la logia, de día una casa más
      return (t, dt, luz, on) => {
        const ve = on && luz < 0.4 && estacion().i === 3;
        lo.visible = ve; ch.visible = ve && !secretoHallado('logia');
        luzL.intensity = ve ? 0.9 + 0.2 * Math.sin(t * 9) : 0;
        if (!ve) return;
        ch.userData.titilar(t); lo.userData.temblar(t);
        tocable(x, z, { k: 'secreto', id: 'logia', x, y: z }, { rx: 22, ry: 14, dy: 8 });
      };
    })();

    /* ---------- cada cuadro ---------- */
    function sincronizar(t, dt) {
      const e10 = S.era === 10, luz = luzDia(), noche = nocheCasa(), deNoche = noche > 0.5;
      vestir();
      const lk = Math.max(0, Math.min(1, (0.55 - luz) / 0.25));
      luciernagas.userData.k = estacion().i === 1 ? lk * lk * (3 - 2 * lk) * 0.3 : 0; luciernagas.visible = luciernagas.userData.k > 0.01;

      // --- las ranuras de los saberes, y el cerro que se transforma con la época ---
      ranura('lancaster', tiene(69) ? llave(69) : null, () => oficio(69, () => PZ.lancaster(K, niv(69))));
      ranura('normal', tiene(70) ? llave(70) : null, () => oficio(70, () => PZ.normal(K, niv(70))));
      ranura('silabario', tiene(71) ? llave(71) : null, () => oficio(71, () => PZ.silabario(K, niv(71))));
      ranura('preceptoras', tiene(72) ? llave(72) : null, () => oficio(72, () => PZ.preceptoras(K, niv(72))));
      ranura('ley', tiene(73) ? llave(73) : null, () => oficio(73, () => PZ.ley(K, niv(73))));
      ranura('kinder', tiene(74) ? llave(74) : null, () => oficio(74, () => PZ.kinder(K, niv(74))));
      const eSL = etapaSL();
      ranura('santalucia', eSL, () => { const P = pieza(L.SANTALUCIA), sl = MON.santaLucia(K, eSL); P.obj.add(sl); fundir(K, sl, 0.012); return P; });
      const clave = mo.claveRanuras() + '|' + S.docentes;
      if (clave !== claveObst) { claveObst = clave; rehacerPaso(); }
      mo.animarRanuras(t, dt);

      // --- los tocables: las piezas y el mundo ---
      for (const r of Object.values(ranuras)) if (r.P && r.P.toc) for (const q of r.P.toc) tocP(q.x, q.y, { k: q.k }, q.p);
      tocable(L.CATEDRAL.x, L.CATEDRAL.y, { k: 'catedral' }, { rx: 30, ry: 18, dy: 22 });
      tocable(L.MONEDA.x, L.MONEDA.y, { k: 'moneda' }, { rx: 34, ry: 18, dy: 12 });
      tocable(L.PLAZA.x, L.PLAZA.y, { k: 'plazaSa' }, { rx: 22, ry: 12, dy: 4 });
      tocable(L.SANTALUCIA.x, L.SANTALUCIA.y, { k: 'santalucia' }, { rx: 40, ry: 26, dy: 24 });
      tocable(13.5, 5.85, { k: 'mapocho' }, { rx: 40, ry: 8, dy: 0 });
      tocable(L.PUENTE.x, 5.85, { k: 'calycanto' }, { rx: 14, ry: 14, dy: 4 });
      tocable(3.4, 3.2, { k: 'andes' }, { rx: 50, ry: 40, dy: 60 });
      tocable(11.0, 12.85, { k: 'alameda' }, { rx: 50, ry: 10, dy: 10 });

      // --- la diligencia, que va y viene por el camino de Valparaíso; los arrieros que bajan de la cordillera ---
      const ud = ((t * 0.02) % 2), ida = ud < 1, u = smooth(ida ? ud : 2 - ud), xd = 2.4 + u * 3.2;
      dil.position.set(xd, 0, 13.42); dil.rotation.y = ida ? 0 : Math.PI; dil.visible = e10;
      if (e10) tocable(xd, 13.42, { k: 'diligencia' }, { rx: 22, ry: 12, dy: 12 });
      arrieros.forEach((p, i) => {
        if (!ver(p, e10 && !deNoche)) { mulas[i].visible = false; return; }
        const f = ((t * 0.012 + i * 0.33) % 1), x = ARRIEROS[i][0] - f * 3.0, z = ARRIEROS[i][1] + f * 1.0;
        ubicar(p, x, z, { x: x - 1, y: z + 0.33 }); p.e.pose = 'andar'; animar(p, t, dt);
        mulas[i].visible = true; mulas[i].position.set(x + 0.22, 0, z - 0.06); mulas[i].rotation.y = Math.atan2(-1, 0.33);
      });

      // --- la Escuela Normal: si hay normalistas esperando su pueblo, pide atención ---
      anilloNormal.visible = e10 && normalAbierta() && (S.normalistas || 0) > 0; if (anilloNormal.visible) anilloNormal.userData.latir(t);

      // --- los normalistas en camino: salen por la Alameda con su maleta ---
      const nv = e10 ? Math.min(viajeros.length, (S.viajes || []).length) : 0;
      viajeros.forEach((p, i) => {
        if (!ver(p, i < nv)) return;
        const v = S.viajes[i], P = PUEBLOS_SA[v.p], f = Math.min(1, v.t / Math.max(8, v.dur * 0.35));
        const alNorte = P.x < 0.4, x = alNorte ? L.NORMAL.x - f * (L.NORMAL.x - 2.4) : L.NORMAL.x + f * (17.6 - L.NORMAL.x), z = 12.85 + i * 0.12;
        ubicar(p, x, z, { x: alNorte ? x - 1 : x + 1, y: z }); p.e.pose = f < 1 ? 'andar' : 'quieto'; animar(p, t, dt); opacidad(p.obj, f > 0.9 ? Math.max(0, (1 - f) / 0.1) : Math.min(1, f / 0.05 + 0.2));
      });

      // --- los preceptores en sus esquinas ---
      const vis = Math.min(S.alumnos, 18);
      const cupos = [Math.min(9, BALANCE.ratioDocente + palestraSitio()), ...[1, 2, 3, 4].map(k => k < S.docentes ? Math.min(9, cupoGuia(k) + palestraSitio()) : 0)];
      const plan = [], planM = [];
      corros.forEach((sitios, m) => { for (let j = 0; j < Math.min(cupos[m] || 0, sitios.length) && plan.length < vis; j++) { plan.push(sitios[j]); planM.push(m); } });
      guias.forEach((p, i) => {
        if (!ver(p, i === 0 ? S.docentes >= 1 : i < S.docentes)) return;
        const m = MAESTROS[i]; ubicar(p, m.x, m.y, { x: m.x + 1, y: m.y + 1 });
        p.e.pose = deNoche ? 'quieto' : 'narrar'; animar(p, t, dt); tocP(m.x, m.y, { k: 'docente', i }, p);
      });
      const maestro = m => LEX().nombres[m % LEX().nombres.length];
      aprendices.paso(t, dt, deNoche ? 0 : vis, { asiento: deNoche ? () => null : i => plan[i] || null, mira: MAESTROS[0] }, a => ({ k: 'alumno', i: a.i, con: deNoche ? undefined : planM[a.i] !== undefined ? maestro(planM[a.i]) : null }));

      // --- Sarmiento: baja de la cordillera en mula, espera al pie del camino y, recibido, camina hasta la Escuela Normal ---
      const estS = e10 ? estadoPensador('sarmiento') : 0;
      if (estS !== sarAntes && sarAntes !== -1 && estS === 2 && nacimientosVivos) sarCamino = { cola: mo.caminos.ruta({ x: L.ESPERA_SARMIENTO.x, z: L.ESPERA_SARMIENTO.y }, { x: L.LUGAR_SARMIENTO.x, z: L.LUGAR_SARMIENTO.y }), pos: { x: L.ESPERA_SARMIENTO.x, z: L.ESPERA_SARMIENTO.y } };
      sarAntes = estS;
      mulaS.visible = e10 && estS === 1; if (mulaS.visible) { mulaS.position.set(L.ESPERA_SARMIENTO.x + 0.28, 0, L.ESPERA_SARMIENTO.y - 0.1); mulaS.rotation.y = -0.6; }
      if (ver(sarmiento, estS >= 1)) {
        const L0 = estS === 1 ? L.ESPERA_SARMIENTO : L.LUGAR_SARMIENTO;
        let px = L0.x, pz = L0.y, anda = false, mira = estS === 1 ? { x: L0.x - 0.5, y: L0.y + 1 } : { x: L.NORMAL.x, y: L.NORMAL.y };
        if (sarCamino) {
          const c = sarCamino, d = c.cola[0];
          if (!d) sarCamino = null;
          else { const dx = d.x - c.pos.x, dz = d.z - c.pos.z, D = Math.hypot(dx, dz); if (D < 0.05) c.cola.shift(); else { const s = Math.min(D, 0.6 * dt); c.pos.x += dx / D * s; c.pos.z += dz / D * s; } px = c.pos.x; pz = c.pos.z; anda = true; mira = { x: px + dx, y: pz + dz }; }
        }
        ubicar(sarmiento, px, pz, mira); sarmiento.e.pose = anda ? 'andar' : estS === 2 && !deNoche ? 'narrar' : 'quieto'; animar(sarmiento, t, dt);
        tocP(px, pz, { k: 'pensador', id: 'sarmiento' }, sarmiento);
      }

      // --- la noche: los faroles de gas (desde 1857), las ventanas de la plaza, la Alameda y los barrios ---
      const oscuro = luz < 0.5, n1 = 1 - luz;
      faroles.forEach(Q => { const ll = Q.l.userData.llama; ll.visible = oscuro; ll.scale.setScalar(1 + 0.12 * Math.sin(t * 11 + Q.x)); });
      luzPlaza.intensity = n1 * 2.4 * (0.9 + 0.1 * Math.sin(t * 7));
      luzAlameda.intensity = n1 * 2.4 * (0.9 + 0.1 * Math.sin(t * 6));
      luzNormal.intensity = n1 * 1.6 * (0.9 + 0.1 * Math.sin(t * 9));
      luzBarrios.intensity = n1 * 1.8 * (0.9 + 0.1 * Math.sin(t * 8));

      secretoLogia(t, dt, luz, e10);
      mo.luces(t);
      vivos.forEach(f => f(t, dt));
      return { luz, brasa: 0 };
    }

    /* ---------- el estado de cada saber y los globos: el pase 2D ---------- */
    const ALTO = { 69: 34, 70: 44, 71: 32, 72: 34, 73: 36, 74: 32 };
    const DONDE = { 69: PZ.ANCLAS.lancaster, 70: PZ.ANCLAS.normal, 71: PZ.ANCLAS.silabario, 72: PZ.ANCLAS.preceptoras, 73: PZ.ANCLAS.ley, 74: PZ.ANCLAS.kinder };
    function superponer(t) {
      for (const i of [69, 70, 71, 72, 73, 74]) { if (!tiene(i)) continue; const a = DONDE[i], p = P(a.x, a.y, ALTO[i]); estadoTec(i, { x: p.x, y: p.y }, t); }
      if (S.era !== 10) return;
      if (estadoPensador('sarmiento') === 1 && VISITAS.sarmiento && !sarCamino) drawGlobo(L.ESPERA_SARMIENTO.x, L.ESPERA_SARMIENTO.y, t);
    }

    /* ---------- los rótulos de acción: lo que se toca en Santiago ---------- */
    function rotulos(ancla, t, tocarEn) {
      const e10 = S.era === 10;
      ancla('mandar', e10 && normalAbierta() && (S.normalistas || 0) > 0, L.NORMAL.x, L.NORMAL.y, 58, `mandar a un pueblo · ${S.normalistas || 0}`, 'accion', () => { if (!abrirMapa()) { const i = PUEBLOS_SA.findIndex((_, k) => puedeMandar(k)); if (i >= 0) mandar(i); } });
      const estS = e10 ? estadoPensador('sarmiento') : 0;
      ancla('recibir', estS === 1 && S.apr >= (VISITAS.sarmiento?.costo || 0), L.ESPERA_SARMIENTO.x, L.ESPERA_SARMIENTO.y, 52, 'recibir a Sarmiento', 'accion', () => tocarEn(L.ESPERA_SARMIENTO.x, L.ESPERA_SARMIENTO.y));
    }

    /* las caras de quienes firman la consejera en esta época */
    const caras = {
      'Bello': { ...PZ.BELLO },
      'Sarmiento': { ...PZ.SARMIENTO },
    };
    return { quieto, nubes, sincronizar, superponer, rotulos, caras, aprendices, get corros() { return corros; } };
  },
};
