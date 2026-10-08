/* ============================================================
   motor3d
   El motor del mundo 3D, igual para todas las épocas. Una época (src/epocas/) declara QUÉ hay en su
   mundo; el motor pone el cómo, que se aprendió en la Época 1 y su QA (2026-09-28):
   - RANURAS: cada pieza (un saber, una construcción) vive en una ranura con su clave; solo se rehace la
     que cambió, nace creciendo, se mide su HUELLA antes de fundirla y, al reemplazarse, LIBERA lo suyo en la
     GPU (mallas fundidas, texturas propias, esqueletos): la fuga de la Época 1 no puede volver.
   - GENTE: personas reusables que llegan o se van desvaneciéndose, y un paseo con A* sobre la huella real de
     lo construido (caminos.js): nadie atraviesa nada.
   - TOQUES: cada cosa tocable se registra con la clave del 2D (`tocable`), y las personas guardan con qué
     opciones se hicieron, para que su ficha muestre su cara.
   - LUCES recogibles de cualquier época (las que el motor 2D hace nacer), con su montoncito y su halo.
   - EL AÑO: se lee del motor 2D (estacion(), silvestreHoy(), copaHoy()), que sabe el año de cada época.
   Las globales del juego (S, tocable, colectibles, estacion…) se leen por su nombre: los módulos corren
   después de los scripts clásicos del motor, en el mismo ámbito global.
   ============================================================ */
import * as THREE from 'three';
import { azar, fundir, opacidad, esDelKit } from './kit.js';
import { crearPersona } from './actores.js';
import { modeloMaterial, chispa } from './modelos.js';
import { crearCaminos, huellasDe } from './caminos.js';

export const Z2D = 39.19;                            // unidades z del 2D por unidad de altura 3D
export { opacidad };

/* El saber i del motor: su fase, si ya existe y su etapa (−1 = no aprendido). */
export const fase = i => (S.tecs[i] && S.tecs[i].fase) || 'sin';
export const tiene = i => fase(i) !== 'sin';
export const niv = i => tiene(i) ? (S.tecs[i].nivel || 0) : -1;
export const llave = i => niv(i) + (fase(i) === 'meseta' ? 'm' : '');

export function crearMotor3D(K, op = {}) {
  const raiz = new THREE.Group(), vivos = [];
  const dyn = new THREE.Group(); raiz.add(dyn);

  /* ---------- las ranuras ---------- */
  const ranuras = {};
  function ranura(id, clave, crear) {
    const r = ranuras[id];
    if (r && r.clave === clave) return r.P;
    if (r && r.P) { raiz.remove(r.P.obj); liberar(r.P.obj); }
    let P = null;
    if (clave !== null) {
      P = crear(); P.obj.position.set(P.ancla.x, 0, P.ancla.y);
      P.huellas = huellasDe(P.obj);                                      // se mide antes de fundir: después es una sola malla
      fundir(K, P.obj); raiz.add(P.obj);
      if (nacimientosVivos && r !== undefined) P.nace = performance.now();   // lo nuevo entra creciendo (nacerEn del 2D)
    }
    ranuras[id] = { clave, P };
    return P;
  }
  /* lo que una pieza reemplazada deja en la GPU: sus mallas fundidas, sus texturas propias y el esqueleto de
     cada persona. Lo compartido (la caché del kit) no se toca. */
  function liberar(obj) {
    obj.traverse(o => {
      if (o.isSkinnedMesh && !o.userData.tinta) o.skeleton.dispose();
      if (o.geometry?.userData.propia) o.geometry.dispose();
      const m = o.material; if (m && m.map?.userData.propia) { m.map.dispose(); m.dispose(); }
    });
  }
  function animarRanuras(t, dt) {
    for (const r of Object.values(ranuras)) if (r.P) {
      r.P.anim(t, dt);
      if (r.P.nace) {
        const k = Math.min(1, (performance.now() - r.P.nace) / 850), s = 1 + 1.7 * Math.pow(k - 1, 3) + 0.7 * Math.pow(k - 1, 2);
        r.P.obj.scale.setScalar(Math.max(0.01, s)); if (k >= 1) { r.P.obj.scale.setScalar(1); r.P.nace = 0; }
      }
    }
  }
  const claveRanuras = () => Object.entries(ranuras).map(([k, r]) => k + ':' + r.clave).join(',');

  /* ---------- la gente ---------- */
  const persona = (o, extra) => { const p = crearPersona(K, o); p.e = { pose: 'quieto', ...extra }; dyn.add(p.obj); return p; };
  const ubicar = (p, x, y, mira, h = 0) => { p.obj.position.set(x, h, y); if (mira) p.obj.rotation.y = Math.atan2(mira.x - x, mira.y - y); };
  const ver = (p, v) => { p.obj.visible = v; return v; };
  const animar = (p, t, dt) => { p.e.dt = dt; p.anim(t, p.e); };

  /* ---------- los toques y los retratos ---------- */
  const retratos = new Map();
  const tocP = (x, y, ficha, p) => { tocable(x, y, ficha); if (p && p.op) retratos.set(claveFicha(ficha), p.op); };

  /* ---------- por dónde se camina ---------- */
  const caminos = crearCaminos();
  /* extra: { circulos, elipses, bloquea(x, z) } fijos de la época. Las huellas de las ranuras entran solas. */
  function rehacerCaminos(extra = {}) {
    const rects = [];
    for (const r of Object.values(ranuras)) if (r.P && r.P.huellas) rects.push(...r.P.huellas);
    caminos.rehacer(rects, extra.circulos || [], extra.elipses || [], extra.bloquea || null);
  }

  /* LOS PASEANTES: n personas que pasean por lo libre y, cuando la época lo pide (una velada, una clase), van a
     un asiento y se sientan mirando algo. `op.opciones(i)`: cómo es cada uno. Cada asiento puede traer su propia
     mirada y su pose ({x, z, mira, pose}); si el asiento de alguien cambia (llegó otra guía, se hizo de noche),
     camina al nuevo, y si se queda sin asiento, se levanta y vuelve a pasear. */
  function paseantes(n, o = {}) {
    const rnd = azar(o.semilla || 99);
    const lista = Array.from({ length: n }, (_, i) => { const p = persona(o.opciones(i)); p.fase = i * 1.7; return { p, cola: [], espera: (i % 5) * 0.7, vel: 0.8 + (i % 5) * 0.07, i }; });
    lista.forEach((k, i) => k.p.obj.position.set(o.inicio ? o.inicio(i).x : 10, 0, o.inicio ? o.inicio(i).z : 10));
    let puntos = [];
    return {
      lista,
      rehacer() { puntos = caminos.puntos(4); },
      /* cuantos: los que se ven; sentarse: null o { asiento(i) → {x, z, mira?, pose?} o null, mira {x, y} };
         tocar(k): la ficha de cada uno */
      paso(t, dt, cuantos, sentarse, tocar) {
        lista.forEach((a, i) => {
          if (i >= cuantos) {                            // el que ya no está se va desvaneciendo (se fue a su casa), no desaparece de golpe
            if (a.p.obj.visible && a.llego && nacimientosVivos) {
              a.sale = a.sale || performance.now(); const k = 1 - (performance.now() - a.sale) / 800;
              if (k > 0) { opacidad(a.p.obj, k); animar(a.p, t, dt); return; }
            }
            ver(a.p, false); a.llego = 0; a.sale = 0; a.asiento = null; a.sentado = false; a.cola = []; return;
          }
          ver(a.p, true); a.sale = 0;
          if (!a.llego) a.llego = nacimientosVivos ? performance.now() : 1;   // el nuevo entra apareciendo
          opacidad(a.p.obj, a.llego === 1 ? 1 : Math.min(1, (performance.now() - a.llego) / 900));
          const pos = a.p.obj.position;
          const s = sentarse ? sentarse.asiento(i) : null, clave = s ? s.x.toFixed(2) + ',' + s.z.toFixed(2) : null;
          if (clave !== (a.asiento || null)) {            // cambió su sitio: va al nuevo, o se levanta a pasear
            a.asiento = clave;
            if (s) { a.sentado = true; a.cola = caminos.ruta(pos, s); }
            else if (a.sentado) { a.sentado = false; a.cola = []; a.espera = rnd() * 2; }
          }
          if (s && !a.cola.length) { const m = s.mira || sentarse.mira; a.p.e.pose = s.pose || 'suelo'; a.p.obj.rotation.y = Math.atan2(m.x - pos.x, m.y - pos.z); }
          if (a.cola.length) {
            const d = a.cola[0], dx = d.x - pos.x, dz = d.z - pos.z, L = Math.hypot(dx, dz);
            if (L < 0.05) a.cola.shift();
            else { const paso = Math.min(L, a.vel * dt); pos.x += dx / L * paso; pos.z += dz / L * paso; let da = Math.atan2(dx, dz) - a.p.obj.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); a.p.obj.rotation.y += da * Math.min(1, dt * 8); }
            a.p.e.pose = 'andar';
            if (!a.cola.length && !a.sentado) a.espera = 1.5 + rnd() * 4;
          } else if (!a.sentado) {
            a.p.e.pose = 'quieto'; a.espera -= dt;
            if (a.espera <= 0 && puntos.length) { const q = puntos[Math.floor(rnd() * puntos.length)]; a.cola = caminos.ruta(pos, { x: q[0] + (rnd() - 0.5) * 0.5, z: q[1] + (rnd() - 0.5) * 0.5 }); }
          }
          pos.y = saltoJubilo(t, i) / Z2D;
          animar(a.p, t, dt);
          if (tocar) tocP(pos.x, pos.z, tocar(a), a.p);
        });
      },
    };
  }

  /* ---------- las luces recogibles (las que el motor hace nacer en cualquier época) ---------- */
  const nodos = new Map(), GEO_HALO = new THREE.CircleGeometry(0.34, 20);
  /* el aro oscuro bajo el halo (lista de cotejo B3): en otoño y en verano el halo claro se perdía en el pasto dorado */
  const GEO_ARO = new THREE.RingGeometry(0.33, 0.39, 28), MAT_ARO = new THREE.MeshBasicMaterial({ color: '#4a3014', transparent: true, opacity: 0.4, depthWrite: false });
  function modeloLuz(n) {
    const g = new THREE.Group(); g.position.set(n.x, 0, n.y);
    if (n.mat) {
      const m = modeloMaterial(K, n.mat.k);
      if (m.children.length) g.add(m);
      else {                                           // un material sin modelo propio: su montoncito con los colores del motor
        const [c1, c2] = (typeof MAT_COL !== 'undefined' && MAT_COL[n.mat.k]) || ['#b09070', '#cdb08c'];
        [[0, 0.06, 0, 0.1, c1], [0.09, 0.05, 0.05, 0.07, c2], [-0.08, 0.05, 0.05, 0.065, c1]].forEach(([x, y, z, r, c], i) => { const o = K.malla(K.roca(r, 200 + i), c, { grosor: 0.01 }); o.position.set(x, y, z); g.add(o); });
      }
    } else { const c = chispa(K); c.position.y = 0.45; g.add(c); g.userData.chispa = c; }
    const halo = new THREE.Mesh(GEO_HALO, new THREE.MeshBasicMaterial({ color: '#fff0be', transparent: true, opacity: 0.35, depthWrite: false }));
    halo.rotation.x = -Math.PI / 2; halo.position.y = 0.012; g.add(halo); g.userData.halo = halo;
    const aro = new THREE.Mesh(GEO_ARO, MAT_ARO); aro.rotation.x = -Math.PI / 2; aro.position.y = 0.011; g.add(aro);
    dyn.add(g); return g;
  }
  function luces(t) {
    const vistos = new Set();
    for (const n of colectibles) {
      vistos.add(n);
      let g = nodos.get(n); if (!g) { g = modeloLuz(n); nodos.set(n, g); }
      const age = t - n.born, vida = n.mat ? 30 : 13, fade = age < 0.3 ? age / 0.3 : (age > vida - 2 ? Math.max(0, (vida - age) / 2) : 1);
      g.scale.setScalar(Math.max(0.01, fade));
      if (g.userData.chispa) { g.userData.chispa.position.y = 0.45 + 0.08 * Math.sin(t * 2.3); g.userData.chispa.rotation.y = t * 1.5; }
      g.userData.halo.material.opacity = 0.25 + 0.15 * Math.sin(t * 4.5 + n.x);
      tocable(n.x, n.y, { k: 'colectible', node: n });
    }
    for (const [n, g] of nodos) if (!vistos.has(n)) { dyn.remove(g); g.userData.halo.material.dispose(); nodos.delete(n); }
  }

  /* ---------- el año: la estación del motor 2D, con escalones finos para repintar solo cuando cambia ---------- */
  function estacionHoy() {
    const e = estacion();
    return { ...e, paso: e.i + Math.round((e.k || 0) * 40) / 40 };
  }

  /* ---------- deshacerse de todo (al cambiar de época) ---------- */
  function desarmar() {
    for (const r of Object.values(ranuras)) if (r.P) { raiz.remove(r.P.obj); liberar(r.P.obj); }
    // lo de la época vieja se suelta de la GPU: todo lo que no sea de la caché compartida del kit (las formas del kit que la
    // época nueva no use las suelta K.podar al armarla). Si algo suelto vuelve a usarse, three.js lo sube de nuevo.
    const tex = m => [m.map, m.alphaMap, m.emissiveMap, m.normalMap].filter(t => t && !esDelKit(t));
    raiz.traverse(o => {
      if (o.isSkinnedMesh && !o.userData.tinta) o.skeleton.dispose();
      if (o.geometry && !esDelKit(o.geometry)) o.geometry.dispose();
      for (const m of [].concat(o.material || [])) if (!esDelKit(m)) { tex(m).forEach(t => t.dispose()); m.dispose(); }
      if (o.isLight && o.shadow) o.shadow.dispose();
    });
    // ROMPER EL ÁRBOL (QA entero, 2026-10-03): el renderizador recuerda cosas sueltas de la época vieja (el material de
    // distancia de las sombras guarda la última luz puntual que dibujó, y esa luz apuntaba a su padre); con el árbol
    // entero colgando de ella, cada cruce dejaba viva la época anterior (~40-60 MB por época). Sin padres ni hijos, lo
    // que quede recordado retiene un nodo, no el mundo.
    const todos = []; raiz.traverse(o => todos.push(o));
    for (const o of todos) { o.parent = null; o.children.length = 0; }
  }

  return {
    K, op, raiz, dyn, vivos,
    ranura, ranuras, liberar, animarRanuras, claveRanuras,
    persona, ubicar, ver, animar, opacidad,
    retratos, tocP,
    caminos, rehacerCaminos, paseantes,
    luces, estacionHoy, desarmar,
  };
}
