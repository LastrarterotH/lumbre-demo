/* ============================================================
   epocas/epoca1
   La Época 1 (el fogón y el asentamiento) sobre el motor 3D. Aquí vive solo lo de ESTA época: su valle,
   sus piezas, quién está dónde (con las funciones de posición del motor 2D: posMamut, posCazador,
   caveVisitor, aprendizDe, posAcarreador, nocheVelada, diadas…), su año y sus rótulos de acción. El cómo
   (ranuras, liberar, caminos, paseantes, luces, retratos, fundidos) lo pone motor3d.js.
   Una época nueva es un archivo como este registrado en epocas/index.js.
   ============================================================ */
import * as THREE from 'three';
import { PAL, fundir } from '../kit.js';
import * as M from '../mundo.js';
import * as PZ from '../piezas.js';
import { baston, lanza, cana, cesto } from '../actores.js';
import { crearMamut } from '../mamut.js';
import { fase, tiene, niv, llave, Z2D } from '../motor3d.js';
import * as SE from '../secretos.js';

const LA_MAYOR = { x: 4.9, y: 9.6 };
/* DÓNDE ENSEÑA CADA UNO en el 3D (lista de cotejo D2: los corros pegados al fuego se fundían en una masa). Las
   guías enseñan en claros medidos con la grilla de caminos, a 3-5 baldosas del fuego; en la aldea, la Mayor deja
   su sitio junto al granero (ahí no caben más de dos) y enseña al sur del campo. */
const PUESTOS_3D = [[9.5, 10.3], [10.4, 14.1], [6.8, 14.9]];
const mayorEn = e2 => e2 ? { x: 5.7, y: 13.5 } : LA_MAYOR;
const RECOLECTORAS = [[4.0, 12.6, 0], [12.6, 9.4, 2.3], [7.6, 14.4, 4.1]];
/* Lo que el año de la estepa pone en 3D y el 2D no tiene: el verde de los pinos y lo que cae del cielo. */
const EXTRAS_ANO = {
  primavera: { pinoM: '#5c8c40', pinoL: '#7fae59', cae: '#f2b8d0', tipo: 0 }, verano: { pinoM: '#5c8c40', pinoL: '#7fae59', cae: '#fbf6ea', tipo: 1 },
  'otoño': { pinoM: '#557f3c', pinoL: '#76a052', cae: '#d8832c', tipo: 2 }, invierno: { pinoM: '#4a6350', pinoL: '#6d8574', cae: '#ffffff', tipo: 3 },
};

export default {
  era: 1,
  nombre: 'El fogón',
  piezas: PZ.PIEZAS,                                 // el catálogo de piezas con etapas (lo audita qa.html)
  construir(mo) {
    const { K, raiz, dyn, vivos, ranura, ranuras, persona, ubicar, ver, animar, opacidad, tocP } = mo;
    const oficio = (i, f) => PZ.conActores(fase(i) === 'meseta', f);

    /* ---------- el valle: lo quieto se funde; el suelo se repinta con el año ---------- */
    const zonaEdad2 = (x, z) => (x > 3.4 && x < 6.3 && z > 10 && z < 12.6) || (x > 11.3 && x < 14.2 && z > 10.4 && z < 12.9);
    const suelo = M.suelo(K), menudo = M.menudo(K, zonaEdad2);
    const quieto = new THREE.Group();
    quieto.add(M.losa(K), M.sendero(K), menudo);
    quieto.add(M.laguna(K, vivos));
    quieto.add(M.cueva(K));
    const arboles = M.ARBOLES.map(a => { const t = M.arbol(K, a); quieto.add(t); return t; });
    fundir(K, quieto); raiz.add(suelo, quieto);
    const nubes = M.nubes(K, vivos); raiz.add(nubes.g);
    const luciernagas = M.luciernagas(vivos); raiz.add(luciernagas);
    const cae = M.cayendo(K, vivos); raiz.add(cae.obj);
    const luzFuego = new THREE.PointLight('#ffa552', 0, 11, 1.6); luzFuego.position.set(PZ.FOGON.x, 0.8, PZ.FOGON.y);
    luzFuego.shadow.mapSize.set(512, 512); luzFuego.shadow.bias = -0.004; luzFuego.shadow.camera.near = 0.2;
    raiz.add(luzFuego);

    /* ---------- el año de la estepa, leído del motor ---------- */
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
      const cayendo = k >= 0.5 ? Xs : X; cae.tipo = cayendo.tipo; cae.obj.material.color.set(cayendo.cae);
    }

    /* ---------- los que siempre están ---------- */
    const mamut = crearMamut(K); mamut.obj.scale.setScalar(0.6); dyn.add(mamut.obj);
    const cria = crearMamut(K); cria.obj.scale.setScalar(0.27); dyn.add(cria.obj);
    let mamutPrev = null, criaPrev = null;
    const mariposas = [[13.6, 11.8, 0.7, '#f6f1e3'], [4.0, 12.9, 3.4, '#e8a35c'], [16.0, 7.4, 5.1, '#f6f1e3']].map(([x, y, ph, c]) => {
      const g2 = new THREE.Group(); g2.userData.vivo = true;
      const alas = [-1, 1].map(l => { const a = new THREE.Mesh(new THREE.CircleGeometry(0.07, 8), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); a.position.x = l * 0.05; a.scale.set(1, 0.75, 1); const piv = new THREE.Group(); piv.add(a); g2.add(piv); return { piv, l }; });
      dyn.add(g2); return { g2, alas, x, y, ph };
    });
    const pajaritos = [[16.0, 10.4, 0], [12.55, 6.7, 2.7]].map(([x, y, ph]) => {
      const g2 = new THREE.Group(); g2.userData.vivo = true;
      const c = K.malla(K.esfera(0.07, 0.6), '#8a6f5a', { grosor: 0.008 }); c.scale.set(0.9, 0.8, 1.25); c.position.y = 0.07; g2.add(c);
      const cab = new THREE.Group(); cab.position.set(0, 0.12, 0.07); g2.add(cab);
      cab.add(K.malla(K.esfera(0.045, 0.5), '#8a6f5a', { grosor: 0.008 }));
      const pico = K.malla(K.cono(0.015, 0.05, 4), '#e8a35c', { sinTinta: true }); pico.rotation.x = Math.PI / 2; pico.position.z = 0.05; cab.add(pico);
      const cola = K.malla(K.cono(0.03, 0.08, 4), '#6e5646', { sinTinta: true }); cola.rotation.x = -Math.PI / 2 - 0.4; cola.position.set(0, 0.09, -0.1); g2.add(cola);
      g2.position.set(x, 0, y); dyn.add(g2); return { g2, cab, x, y, ph };
    });
    const cazadores = Array.from({ length: 6 }, (_, i) => {
      const p = persona({ piel: i % 4, pelo: ['greñas', 'corto', 'melena'][i % 3], colorRopa: '#8a6247', vincha: i % 2 ? '#8a6247' : false });
      const l = lanza(K, 1.1); l.rotation.x = Math.PI; l.position.y = -0.2; p.sostener(l); p.fase = i * 1.3; p.e.pose = 'acechar'; return p;
    });
    const diadasPool = Array.from({ length: 4 }, (_, d) => {
      const m = persona({ piel: (d + 2) % 4, pelo: ['corto', 'melena', 'moño', 'greñas'][d], colorRopa: ['#8a6247', '#9a7a52', '#8a7055', '#75624f'][d] }, { pose: 'pescar' });
      const c = cana(K); c.rotation.x = Math.PI - 0.9; c.position.y = -0.02; m.sostener(c);
      const pq = persona(PZ.pequeno(d + 4), { pose: 'pescarSentado' });
      const c2 = cana(K); c2.scale.setScalar(0.72); c2.rotation.x = Math.PI - 0.9; c2.position.y = -0.02; pq.sostener(c2);
      return { m, pq };
    });
    const recolectoras = RECOLECTORAS.map(([x, y, ph], i) => {
      const mata = new THREE.Group(); [[0.3, 0, 0.22, 0], [0.22, 0.2, 0.16, 0.08]].forEach(([r, dx, yy, dz]) => { const m = K.malla(K.esfera(r), PAL.copaM); m.position.set(dx, yy, dz); mata.add(m); });
      for (let k = 0; k < 5; k++) { const b = K.malla(K.esfera(0.04), '#c94f43', { sinTinta: true }); b.position.set(Math.cos(k * 1.3) * 0.24, 0.22 + (k % 3) * 0.07, Math.sin(k * 1.3) * 0.24); mata.add(b); }
      fundir(K, mata); mata.position.set(x - 0.45, 0, y - 0.3); dyn.add(mata);
      const p = persona({ piel: i + 1, pelo: 'melena', colorRopa: '#9a7a52' }, { pose: 'agachado' });
      p.obj.position.set(x, 0, y); p.obj.rotation.y = Math.atan2(-0.45, -0.3);
      return { x, y, ph, mata, p, ap: persona(PZ.pequeno(i + 7)) };
    });
    const visitantes = [0, 1].map(v => persona(PZ.pequeno(v + 10), { pose: 'andar' }));
    const acarreadora = persona({ piel: 2, pelo: 'melena', colorRopa: '#9a7a52' }, { pose: 'andar' });
    const cestoA = cesto(K, '#c9a84a'); cestoA.position.y = -0.08; acarreadora.sostener(cestoA, 'I');
    const ninos = [0, 1].map(i => { const p = persona(PZ.pequeno(i + 12), { pose: 'andar' }); p.obj.scale.setScalar(0.85); return p; });
    const laMayor = persona({ edad: 'anciana', piel: 1, pelo: 'moño', colorPelo: '#9a8d7a', ropa: 'falda', colorRopa: '#8a6247', collar: true, pielHombro: true }, { pose: 'baston' });
    const bastonMayor = baston(K); bastonMayor.rotation.x = Math.PI; laMayor.sostener(bastonMayor); ubicar(laMayor, LA_MAYOR.x, LA_MAYOR.y, PZ.FOGON);
    /* ANTES DEL FUEGO, LA MAYOR FROTA (lista de cotejo A3): en cuclillas junto al fogón, la vara parada en la yesca,
       que gira cuando tocas «frotar». Al prender, suelta la vara, retoma el bastón y vuelve a su lugar. */
    const vara = K.malla(K.cilindro(0.016, 0.02, 0.62, 6), PAL.troncoL, { grosor: 0.01 }); vara.userData.vivo = true;
    vara.position.set(PZ.FOGON.x - 0.05, 0.3, PZ.FOGON.y + 0.02); vara.rotation.z = 0.12; dyn.add(vara);
    let fuegoAntes = 0, frotaHasta = 0;
    /* LAS GUÍAS SE DISTINGUEN (lista de cotejo D3): quien enseña lleva el chal ocre (el de la Abuela) y un bastón */
    const guias = [0, 1, 2].map(i => persona({ piel: [2, 3, 0][i], pelo: ['melena', 'corto', 'moño'][i], vincha: i === 0, colorPelo: ['#2e2a26', '#8a5a2e', '#4a3222'][i], colorRopa: ['#8a6247', '#75624f', '#8a7055'][i], chal: PAL.chal }, { pose: i === 1 ? 'narrar' : 'quieto' }));
    guias.forEach(p => { const b = baston(K); b.rotation.x = Math.PI; p.sostener(b, 'I'); });
    const abuela = persona({ edad: 'anciana', piel: 0, pelo: 'moño', ropa: 'traje', colorRopa: '#8a7055', chal: PAL.chal }, { pose: 'narrarSentada', asiento: 0.2 });
    const tronAbuela = K.malla(K.cilindro(0.1, 0.1, 0.46, 8), PAL.troncoL, { grosor: 0.016 }); dyn.add(tronAbuela);
    let abuelaAntes = -1, abuelaCamino = null;
    /* LA RAZÓN GUÍA/APRENDICES, A LA VISTA (2026-09-28). Cada guía sostiene un círculo de BALANCE.ratioDocente
       aprendices y la Abuela acompaña a 4 (alumnosBien del motor): los atendidos se sientan con su maestro, de frente
       a él, y los que aprenden a medias (alumnos − alumnosBien) pasean solos. Contratar una guía se VE: su corro se
       llena. Los maestros: La Mayor (docente 0), las guías contratadas (PUESTOS_DOCENTE) y la Abuela. */
    const MAESTROS = [{ x: 4.9, y: 9.6, cupo: 7 }, ...[0, 1, 2].map(i => ({ x: PUESTOS_3D[i][0], y: PUESTOS_3D[i][1], cupo: 7 })), { x: LUGAR_PENSADOR.abuela[0], y: LUGAR_PENSADOR.abuela[1], cupo: 4 }];
    const aprendices = mo.paseantes(18, { opciones: i => PZ.pequeno(i + 3), inicio: i => ({ x: 6 + (i % 5), z: 11 + Math.floor(i / 5) * 0.8 }) });
    /* cuántos se sientan con cada maestro y cómo: la Mayor 7, cada guía según cómo enseña (9 a muchos, 5 de cerca:
       cupoGuia del motor, lista de cotejo C5), la Abuela 4. La cercanía se ve: su corro es chico y pegado a ella. */
    const cupoDe = m => m === 0 ? 7 : m === 4 ? 4 : m < S.docentes ? cupoGuia(m) : 7;
    const deCerca = m => m >= 1 && m <= 3 && (S.guiasModo || [])[m] === 'cerca';
    /* LAS ESTERAS (lista de cotejo D2): cada corro se sienta sobre su estera de fibra tejida, que lo lee como grupo
       aunque la aldea esté llena; de noche, cuando todos van al fuego, se ven vacías. */
    const esteras = MAESTROS.map(() => {
      const e = new THREE.Group(); e.userData.vivo = true;
      const base = K.malla(K.cilindro(1, 1, 0.02, 28), '#c9a86a', { sinTinta: true, sombra: false }); base.receiveShadow = true; e.add(base);
      const borde = K.malla(K.toro(0.97, 0.03, Math.PI * 2, 0.8), '#8f6d3e', { sinTinta: true, sombra: false }); borde.rotation.x = Math.PI / 2; borde.position.y = 0.012; e.add(borde);
      e.visible = false; dyn.add(e); return e;
    });

    /* ---------- el hueso: lo que espera cuenta, los grupos saldados y el signo ---------- */
    const cuentas = new THREE.Group(); raiz.add(cuentas); let claveCuentas = '';
    function vestirCuentas() {
      const pend = Math.min(12, cuentasPendientes()), grupos = Math.min(20, Math.floor((S.muescas || 0) / 5)), c = pend + '|' + grupos + '|' + !!S.signo + '|' + tiene(13);
      if (c === claveCuentas) return; claveCuentas = c; cuentas.clear();
      if (!tiene(13)) return;
      const H = PZ.ANCLAS.hueso;
      for (let i = 0; i < pend; i++) { const p = K.malla(K.roca(0.05, 140 + i), i % 2 ? '#8f8a7c' : '#a49d8c', { sinTinta: true }); p.position.set(H.x - 0.62 + (i % 4) * 0.1, 0.035 + Math.floor(i / 4) * 0.07, H.y - 0.1); p.userData.flota = i; cuentas.add(p); }
      for (let i = 0; i < grupos; i++) { const p = K.malla(K.roca(0.04, 170 + i), i % 2 ? '#c8a86a' : '#d9bf86', { sinTinta: true }); p.position.set(H.x + 0.3 + (i % 10) * 0.085, 0.03, H.y + 0.45 + Math.floor(i / 10) * 0.09); cuentas.add(p); }
      if (S.signo) {
        const b = K.malla(K.cilindro(0.13, 0.14, 0.05, 12), '#b98457', { grosor: 0.012 }); b.position.set(H.x + 0.5, 0.03, H.y - 0.35); b.scale.z = 0.75; cuentas.add(b);
        [[-0.04, 0.3], [0.03, -0.4], [0.06, 0.6]].forEach(([dx, r]) => { const w = new THREE.Mesh(K.cono(0.018, 0.08, 3), K.mat('#6b4526')); w.position.set(H.x + 0.5 + dx, 0.06, H.y - 0.35); w.rotation.set(Math.PI / 2, 0, r); cuentas.add(w); });
      }
    }

    /* ---------- por dónde se camina: las huellas de las piezas (solas) y lo fijo del valle ---------- */
    let claveObst = '', claroNinos = null, asientos = [], corros = [];
    function rehacerPaso() {
      Object.assign(MAESTROS[0], mayorEn(S.edad >= 2));
      const circulos = [{ x: M.CUEVA.x, z: M.CUEVA.y, r: 2.0 }, { x: PZ.FOGON.x, z: PZ.FOGON.y, r: 0.75 },
        { x: MAESTROS[0].x, z: MAESTROS[0].y, r: 0.4 }, { x: LUGAR_PENSADOR.abuela[0], z: LUGAR_PENSADOR.abuela[1], r: 0.4 }, ...PUESTOS_3D.map(q => ({ x: q[0], z: q[1], r: 0.4 })),
        ...RECOLECTORAS.map(([x, y]) => ({ x: x - 0.25, z: y - 0.18, r: 0.55 })), ...M.ARBOLES.map(([, x, y, s2]) => ({ x, z: y, r: 0.42 * s2 })),
        ...M.ROCAS.map(([x, y, r2]) => ({ x, z: y, r: r2 + 0.15 }))];
      if (S.edad < 2) circulos.push({ x: MAMUT_HOME.x, z: MAMUT_HOME.y, r: 2.0 });
      mo.rehacerCaminos({ circulos, elipses: [{ x: M.LAGUNA.x, z: M.LAGUNA.y, rx: M.LAGUNA.rx * 1.3, rz: M.LAGUNA.ry * 1.3 }] });
      aprendices.rehacer();
      claroNinos = null;                               // los dos niños se persiguen en un claro libre que se vea
      for (const [cx, cz] of [[7.6, 6.45], [9.9, 13.6], [10.6, 14.3], [8.4, 12.4], [9.3, 11.9], [11.2, 9.6], [6.9, 4.4]]) {
        let ok = true; for (let a = 0; a < 6.3 && ok; a += 0.4) ok = mo.caminos.libre(cx + Math.cos(a) * 1.05, cz + Math.sin(a) * 0.7);
        if (ok) { claroNinos = { x: cx, z: cz }; break; }
      }
      asientos = [];                                   // la velada: dos anillos alrededor del fogón, sin pisar nada
      for (const radio of [2.25, 2.95]) for (let a = 0; a < Math.PI * 2; a += 0.55 / radio) {
        const x = PZ.FOGON.x + Math.cos(a) * radio, z = PZ.FOGON.y + Math.sin(a) * radio * 0.9;
        if (mo.caminos.libre(x, z)) asientos.push({ x, z });
      }
      /* LOS CORROS: cada maestro (La Mayor, las tres guías, la Abuela) tiene sus asientos libres, en dos anillos y
         del lado opuesto al fogón primero (junto al fuego ya se sienta el corro del saber de la palabra), sin pisar
         el corro vecino. */
      const usados = [], campoR = S.edad >= 2 && tiene(24) ? campoRect() : null;
      corros = MAESTROS.map(m => {
        const cand = [], base = Math.atan2(m.y - PZ.FOGON.y, m.x - PZ.FOGON.x), mi = MAESTROS.indexOf(m);
        for (const r of deCerca(mi) ? [0.55] : [0.78, 1.12]) for (let k = 0; k < 18; k++) {
          const a = base + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * (0.42 / r);   // desde el frente hacia los lados
          cand.push({ x: m.x + Math.cos(a) * r, z: m.y + Math.sin(a) * r, d: Math.abs(Math.ceil(k / 2) * 0.42 / r) + r * 0.6 });
        }
        cand.sort((u, v) => u.d - v.d);
        const lista = [];
        for (const c of cand) {
          if (lista.length >= cupoDe(mi) + 1) break;
          if (!mo.caminos.libre(c.x, c.z)) continue;
          if (campoR && c.x > campoR.x0 - 0.25 && c.x < campoR.x1 + 0.25 && c.z > campoR.y0 - 0.25 && c.z < campoR.y1 + 0.25) continue;   // nadie se sienta en lo sembrado
          if (usados.some(u => Math.hypot(u.x - c.x, u.z - c.z) < (deCerca(mi) ? 0.3 : 0.36))) continue;
          if (MAESTROS.some(o => Math.hypot(o.x - c.x, o.y - c.z) < 0.5)) continue;
          const q = { x: c.x, z: c.z, mira: { x: m.x, y: m.y } }; lista.push(q); usados.push(q);
        }
        return lista;
      });
    }

    /* ---------- cada cuadro ---------- */
    /* EL SECRETO DE LA ÉPOCA (docs/secretos-plan.md): de noche, en lo hondo de la cueva, el hechicero a la luz de la antorcha */
    const secretoCueva = (() => {
      const g = new THREE.Group(); g.position.set(M.CUEVA.x, 0, M.CUEVA.y); g.rotation.y = M.CUEVA.mira; dyn.add(g);
      // la laja de roca junto a la entrada, de cara a quien mira, con la figura pintada y la antorcha clavada al lado
      const L0 = { x: 0.7, z: 1.75 }, cara = Math.PI / 4 - M.CUEVA.mira;   // fuera de las rocas de la cueva, sobre el umbral
      const laja = K.malla(K.roca(0.4, 11), PAL.rocaD, { grosor: 0.02 }); laja.scale.set(1.1, 1.35, 0.35); laja.position.set(L0.x, 0.5, L0.z - 0.1); laja.rotation.y = cara; g.add(laja);
      const h = SE.hechicero(K); h.scale.setScalar(0.85); h.position.set(L0.x + Math.sin(cara) * 0.17, 0.55, L0.z - 0.1 + Math.cos(cara) * 0.17); h.rotation.y = cara; g.add(h);
      const an = SE.antorcha(K); an.position.set(L0.x - Math.cos(cara) * 0.5, 0, L0.z + Math.sin(cara) * 0.5 + 0.1); an.scale.setScalar(1.6); an.rotation.z = 0.12; g.add(an);
      const ch = SE.chispitas(6, 0.25, 0.7); ch.position.set(L0.x, 0.2, L0.z); g.add(ch);
      const luzT = new THREE.PointLight('#ffb35c', 0, 2.6, 1.6); luzT.position.set(L0.x - 0.2, 0.7, L0.z + 0.4); g.add(luzT);
      const w = new THREE.Vector3(L0.x, 0, L0.z).applyAxisAngle(new THREE.Vector3(0, 1, 0), M.CUEVA.mira).add(new THREE.Vector3(M.CUEVA.x, 0, M.CUEVA.y));
      return (t, luz, on) => {
        const ve = on && luz < 0.4; g.visible = ve; luzT.intensity = ve ? 1.5 * (0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3)) : 0;
        if (!ve) return;
        h.material.opacity = 0.8 + 0.12 * Math.sin(t * 7.3) * Math.sin(t * 3.1); an.userData.llama.scale.set(1, 1 + 0.25 * Math.sin(t * 12), 1);
        ch.visible = !secretoHallado('hechicero'); ch.userData.titilar(t);
        tocable(w.x, w.z, { k: 'secreto', id: 'hechicero', x: w.x, y: w.z }, { rx: 22, ry: 16, dy: 18 });
      };
    })();
    function sincronizar(t, dt) {
      const e1 = S.era === 1, fuego = S.fuegoDescubierto, e2 = S.edad >= 2;
      const luz = fuego ? luzDia() : 0.32;
      vestir(); cae.ver = fuego ? 1 : 0;
      const lk = fuego ? Math.max(0, Math.min(1, (0.55 - luz) / 0.25)) : 0;
      luciernagas.userData.k = lk * lk * (3 - 2 * lk); luciernagas.visible = luciernagas.userData.k > 0.01;

      // --- las ranuras ---
      const fog = ranura('fogon', fuego ? 'c' + llave(10) : 'apagado', () => {
        if (fuego) return oficio(10, () => PZ.circulo(K, niv(10)));
        const F = PZ.fogata(K, false); F.ponerBrasa(0);
        return { obj: F.obj, anim: F.anim, fuego: F, ancla: PZ.FOGON, toc: [] };
      });
      const brasa = fuego ? Math.max(0.14, Math.min(1, ((fuegoVis >= 0 ? fuegoVis : S.fuego) - 35) / 65)) : 0;
      fog.fuego.ponerBrasa(brasa);
      if (!fuego) { fog.fuego.ponerFrote(S.fuego / 100); if (S.fuego > fuegoAntes + 0.01) frotaHasta = performance.now() + 650; }
      fuegoAntes = S.fuego;
      vara.visible = !fuego; if (!fuego && performance.now() < frotaHasta) vara.rotation.y += dt * 40;
      ranura('tambor', tiene(11) ? llave(11) : null, () => oficio(11, () => PZ.tambor(K, niv(11))));
      ranura('pinturas', tiene(12) ? llave(12) : null, () => oficio(12, () => PZ.pinturas(K, niv(12))));
      const extra = (S.muescas || 0) % 5;
      ranura('hueso', tiene(13) ? llave(13) + '|' + extra : null, () => oficio(13, () => PZ.hueso(K, niv(13), { muescas: extra })));
      ranura('pesca', fuego ? (fase(28) === 'meseta' ? niv(28) : -1) : null, () => PZ.pesca(K, fase(28) === 'meseta' ? niv(28) : -1));
      ranura('caza', !e2 && tiene(15) ? niv(15) : null, () => PZ.caceria(K, niv(15), { soloEscenas: true, practicaEn: { x: 9.4, y: 12.9 } }));
      ranura('curtido', e2 && fase(15) === 'meseta' && niv(15) >= 1 ? niv(15) : null, () => PZ.conActores(true, () => PZ.curtido(K, niv(15))));
      ranura('chozas', e2 ? 1 : null, () => PZ.chozas(K));
      const campo = ranura('siembra', e2 && tiene(24) ? llave(24) : null, () => oficio(24, () => PZ.siembra(K, niv(24))));
      const corral = ranura('corral', e2 && tiene(25) ? llave(25) : null, () => oficio(25, () => PZ.corral(K, niv(25))));
      ranura('ceramica', e2 && tiene(26) ? llave(26) : null, () => oficio(26, () => PZ.ceramica(K, niv(26))));
      ranura('telar', e2 && tiene(27) ? llave(27) : null, () => oficio(27, () => PZ.telar(K, niv(27))));
      ranura('granero', e2 && S.granero ? 1 : null, () => PZ.granero(K));
      const clave = mo.claveRanuras() + '|' + (e2 ? 2 : 1) + '|' + S.docentes + (S.guiasModo || []).join(',');   // la manera de enseñar cambia los asientos
      if (clave !== claveObst) { claveObst = clave; rehacerPaso(); }
      mo.animarRanuras(t, dt);
      if (campo && campo.madurar) { const c = Math.round((S.cultivo || 0) * 20) / 20; if (campo.maduro !== c) { campo.maduro = c; campo.madurar(c); } }
      vestirCuentas();
      cuentas.children.forEach(p => { if (p.userData.flota !== undefined) p.position.y = 0.035 + Math.floor(p.userData.flota / 4) * 0.07 + 0.01 * Math.sin(t * 2.6 + p.userData.flota * 0.9); });

      // --- los tocables de las piezas (con la misma clave que el 2D) ---
      const velada = fuego ? nocheVelada() : 0;
      const desv = e1 && fuego ? Math.max(0, Math.min(1, (0.35 - velada) / 0.15)) : 0;   // la orilla se recoge al fuego de noche
      if (e1) tocable(PZ.FOGON.x, PZ.FOGON.y, { k: 'fogata' });
      for (const [id, r] of Object.entries(ranuras)) if (r.P && r.P.toc) {
        const deNoche = id === 'pesca';
        if (deNoche) { r.P.actores.forEach(a => opacidad(a.obj, desv)); (r.P.extrasOrilla || []).forEach(o => { o.visible = desv > 0.05; if (o.material && o.isLine) o.material.opacity = 0.8 * desv; else if (o.isMesh) opacidad(o, desv); }); }
        for (const q of r.P.toc) if (!deNoche || desv > 0.6) tocP(q.x, q.y, { k: q.k }, q.p);
      }
      if (tiene(13)) tocable(PZ.ANCLAS.hueso.x, PZ.ANCLAS.hueso.y, { k: 'conteo' });
      if (campo) { const R = campoRect(), cx = (R.x0 + R.x1) / 2, cy = (R.y0 + R.y1) / 2; tocable(cx, cy, { k: 'campo' }, { rx: (R.x1 - R.x0) * 32 * 0.94, ry: (R.y1 - R.y0) * 16 * 0.94, dy: 0, gana: (S.cultivo || 0) >= 1 }); }
      if (corral && corral.ovejas) { const n = rebano().length; corral.ovejas.forEach((o, i) => { o.obj.visible = i < n; if (i < n) tocable(o.x, o.y, { k: 'coveja' + Math.min(i, 4) }); }); }

      // --- el mamut, la cría y la partida de caza (la coreografía del 2D) ---
      const pm = e1 && !e2 ? posMamut(t) : null;
      const borde = pm ? Math.min(1, Math.max(0, (17.9 - pm.x) / 0.7), Math.max(0, (pm.y - 2.1) / 0.7)) : 0;
      const fase3d = !pm || !pm.visible ? 0 : pm.fase === 'huye' ? 1 - pm.prog : pm.fase === 'vuelve' ? Math.min(1, pm.prog / 0.3) : 1;
      const aM = borde * fase3d;
      opacidad(mamut.obj, aM);
      if (aM > 0.02) {
        mamut.obj.position.set(pm.x, sustoMamut(t) * 0.12, pm.y);
        if (mamutPrev) { const dx = pm.x - mamutPrev.x, dy = pm.y - mamutPrev.y; if (Math.hypot(dx, dy) > 0.0005) { let da = Math.atan2(dx, dy) - mamut.obj.rotation.y; da = Math.atan2(Math.sin(da), Math.cos(da)); mamut.obj.rotation.y += da * Math.min(1, dt * 4); } }
        mamut.obj.rotation.z = pm.fase === 'sacude' ? 0.08 * Math.sin(t * 30) * (1 - pm.prog) : 0;
        mamut.anim(t * (pm.fase === 'huye' ? 2.2 : 1), mamutPrev && Math.hypot(pm.x - mamutPrev.x, pm.y - mamutPrev.y) > dt * 0.02);
        tocable(pm.x, pm.y, { k: 'mamut' });
      }
      mamutPrev = pm ? { x: pm.x, y: pm.y } : null;
      const cr = pm ? posCria(pm, t) : null;
      const aC = cr ? Math.max(0, Math.min(1, cr.alpha)) * Math.min(1, Math.max(0, (17.9 - cr.x) / 0.7), Math.max(0, (cr.y - 2.1) / 0.7)) : 0;
      opacidad(cria.obj, aC);
      if (aC > 0.02) {
        cria.obj.position.set(cr.x, cr.hop ? Math.abs(Math.sin(t * 5.5)) * 0.09 : 0, cr.y);
        if (criaPrev) { const dx = cr.x - criaPrev.x, dy = cr.y - criaPrev.y; if (Math.hypot(dx, dy) > 0.0005) cria.obj.rotation.y = Math.atan2(dx, dy); }
        cria.anim(t * 1.6, !!cr.trote);
      }
      criaPrev = cr ? { x: cr.x, y: cr.y } : null;
      mariposas.forEach(m => {
        m.g2.visible = e1 && fuego && luz > 0.3;
        m.g2.position.set(m.x + Math.sin(t * 0.7 + m.ph) * 0.6, 0.66 + 0.18 * Math.sin(t * 1.3 + m.ph), m.y + Math.cos(t * 0.5 + m.ph) * 0.4);
        m.g2.rotation.y = t * 0.6 + m.ph;
        m.alas.forEach(a => a.piv.rotation.z = a.l * (0.3 + 0.9 * Math.abs(Math.sin(t * 14 + m.ph))));
      });
      pajaritos.forEach(b2 => {
        b2.g2.visible = e1 && luz > 0.25;
        const c = (t * 0.6 + b2.ph) % 4, salta = c > 3.4 ? Math.sin((c - 3.4) / 0.6 * Math.PI) : 0;
        b2.g2.position.set(b2.x + Math.floor((t * 0.6 + b2.ph) / 4) % 3 * 0.12, salta * 0.1, b2.y);
        b2.cab.rotation.x = c < 3 ? Math.max(0, Math.sin(t * 9 + b2.ph)) * 0.9 : 0;
      });
      const nCaz = e1 && !e2 && tiene(15) ? Math.min(6, ((fase(15) === 'meseta' || S.cazaOn) ? 3 : 2) + niv(15)) : 0;
      cazadores.forEach((c, i) => {
        if (!ver(c, i < nCaz)) return;
        const q = posCazador(i, t);
        ubicar(c, q.x, q.y, pm ? { x: pm.x, y: pm.y } : MAMUT_HOME, (q.z || 0) / Z2D);
        c.obj.rotation.z = q.giro || 0;
        c.e.pose = q.alza > 0.5 ? 'senal' : 'acechar'; animar(c, t, dt);
        tocP(q.x, q.y, { k: 'caza' + i }, c);
      });

      // --- la orilla: las díadas que abriste ---
      const nD = e1 ? diadas() : 0;
      diadasPool.forEach(({ m, pq }, d) => {
        const v = d < nD && desv > 0.02; opacidad(m.obj, v ? desv : 0); opacidad(pq.obj, v ? desv : 0); if (!v) return;
        const D = DIADAS[d], lago = { x: PZ.LAGO.x, y: PZ.LAGO.y };
        ubicar(m, D.x, D.y, lago); ubicar(pq, D.x - 0.45, D.y + 0.3, lago);
        animar(m, t, dt); animar(pq, t, dt);
        if (desv > 0.6) { tocP(D.x, D.y, { k: 'diada' + Math.min(d, 3) }, m); tocP(D.x - 0.45, D.y + 0.3, { k: 'pescapeq' + Math.min(d, 3) }, pq); }
      });

      // --- recolectoras y quien aprende mirándolas ---
      recolectoras.forEach((r, ri) => {
        const v = e1 && fuego; ver(r.p, v); r.mata.visible = v; if (!v) { ver(r.ap, false); return; }
        animar(r.p, t, dt); tocP(r.x, r.y, { k: 'recole' + ri }, r.p);
        const ap = desv > 0.02 ? aprendizDe(r.x, r.y, r.ph, t) : null;
        const aa = ap ? ap.alpha * desv : 0; opacidad(r.ap.obj, aa); if (aa <= 0.02) return;
        ubicar(r.ap, ap.x, ap.y, { x: r.x, y: r.y });
        r.ap.e.pose = ap.imita ? 'agachado' : ap.mira ? 'quieto' : 'andar'; animar(r.ap, t, dt);
        if (ap.alpha > 0.6) tocP(ap.x, ap.y, { k: 'aprendiz' + ri }, r.ap);
      });

      // --- el ir y venir de la caverna ---
      visitantes.forEach((p, v) => {
        const cv2 = e1 && fuego ? caveVisitor(t, v * 7.5) : null;
        opacidad(p.obj, cv2 ? cv2.alpha : 0); if (!cv2 || cv2.alpha <= 0.02) return;
        const prev = p.obj.position.clone(); ubicar(p, cv2.x, cv2.y);
        const dx = cv2.x - prev.x, dz = cv2.y - prev.z; if (Math.hypot(dx, dz) > 0.0005) p.obj.rotation.y = Math.atan2(dx, dz);
        animar(p, t, dt); if (cv2.alpha > 0.6) tocP(cv2.x, cv2.y, { k: 'cueva' + v }, p);
      });

      // --- el asentamiento: la acarreadora y los dos que se persiguen ---
      if (ver(acarreadora, e1 && e2 && !!S.granero)) {
        const ac = posAcarreador(t), prev = acarreadora.obj.position.clone(); ubicar(acarreadora, ac.x, ac.y);
        const dx = ac.x - prev.x, dz = ac.y - prev.z; if (Math.hypot(dx, dz) > 0.0005) acarreadora.obj.rotation.y = Math.atan2(dx, dz);
        cestoA.visible = !!ac.carga; acarreadora.e.pose = ac.carga ? 'cargar' : 'andar'; animar(acarreadora, t, dt);
        tocP(ac.x, ac.y, { k: 'acarreadora' }, acarreadora);
      }
      ninos.forEach((p, i) => {
        if (!ver(p, e1 && e2)) return;
        const c0 = claroNinos || { x: 7.6, z: 6.45 }, a = t * 1.15 + i * Math.PI, nx = c0.x + Math.cos(a) * 1.05, ny = c0.z + Math.sin(a) * 0.7;
        ubicar(p, nx, ny); p.obj.rotation.y = Math.atan2(-Math.sin(a) * 1.05, Math.cos(a) * 0.7);
        p.e.dt = dt; p.anim(t * 1.3, p.e); tocP(nx, ny, { k: 'nino' + i }, p);
      });

      // --- las guías, La Mayor y la Abuela ---
      // quién se sienta con quién: los atendidos llenan los corros en orden; los que sobran aprenden a medias
      const vis = Math.min(S.alumnos, 18), sueltos = Math.min(vis, Math.max(0, Math.round(S.alumnos - alumnosBien())));
      const cupos = [S.docentes >= 1 ? cupoDe(0) : 0, ...[0, 1, 2].map(k => k + 1 < S.docentes ? cupoDe(k + 1) : 0), S.abuela === 2 ? 4 : 0];
      const plan = [], planM = []; let conCorro = [0, 0, 0, 0, 0];
      for (let m = 0; m < MAESTROS.length && plan.length < vis - sueltos; m++) {
        const sitios = corros[m] || [];
        for (let j = 0; j < Math.min(cupos[m], sitios.length) && plan.length < vis - sueltos; j++) { plan.push(sitios[j]); planM.push(m); conCorro[m]++; }
      }
      esteras.forEach((e, m) => {                         // cada corro, sobre su estera
        const l = (corros[m] || []).slice(0, conCorro[m]);
        if (!(e.visible = fuego && l.length > 0)) return;
        const cx = (l.reduce((a, q) => a + q.x, 0) + MAESTROS[m].x) / (l.length + 1), cz = (l.reduce((a, q) => a + q.z, 0) + MAESTROS[m].y) / (l.length + 1);
        const r = Math.max(...l.map(q => Math.hypot(q.x - cx, q.z - cz)), Math.hypot(MAESTROS[m].x - cx, MAESTROS[m].y - cz)) + 0.2;
        e.position.set(cx, 0.005, cz); e.scale.set(r, 1, r * 0.92);
      });
      const miraCorro = m => { const l = (corros[m] || []).slice(0, conCorro[m]); return l.length ? { x: l.reduce((a, q) => a + q.x, 0) / l.length, y: l.reduce((a, q) => a + q.z, 0) / l.length } : PZ.FOGON; };
      const mx = fuego ? MAESTROS[0].x : PZ.FOGON.x - 0.5, my = fuego ? MAESTROS[0].y : PZ.FOGON.y + 0.12;   // antes del fuego, frotando
      ubicar(laMayor, mx, my, !fuego || velada > 0.5 ? PZ.FOGON : miraCorro(0));
      laMayor.e.pose = fuego ? 'baston' : 'frotar'; laMayor.e.frota = performance.now() < frotaHasta; bastonMayor.visible = fuego;
      guias.forEach((p, i) => {
        if (!ver(p, i + 1 < S.docentes)) return;
        const [x, y] = PUESTOS_3D[i]; ubicar(p, x, y, velada > 0.5 ? PZ.FOGON : miraCorro(i + 1));
        p.e.pose = conCorro[i + 1] && velada <= 0.5 ? 'narrar' : (i === 1 ? 'narrar' : 'quieto');
        animar(p, t, dt); tocP(x, y, { k: 'docente', i: i + 1 }, p);
      });
      const estA = e1 && fuego ? estadoPensador('abuela') : 0;
      if (estA >= 1 && abuelaAntes === 0 && nacimientosVivos) abuelaCamino = { t0: performance.now() };   // recién llegada: entra caminando desde el este
      abuelaAntes = estA;
      tronAbuela.visible = ver(abuela, estA >= 1);
      const miraA = conCorro[4] && velada <= 0.5 ? miraCorro(4) : PZ.FOGON;   // de día, hacia los suyos; en la velada, al fuego
      if (estA >= 1) {
        const [x, y] = LUGAR_PENSADOR.abuela;
        tronAbuela.position.set(x, 0.1, y);
        let px = x, py = y, anda = false;
        if (abuelaCamino) {
          const x0 = Math.min(17.4, x + 6.2), y0 = y + 1.4, dur = Math.hypot(x0 - x, y0 - y) / 0.9 * 1000, k = (performance.now() - abuelaCamino.t0) / dur;
          if (k >= 1) abuelaCamino = null; else { px = x0 + (x - x0) * k; py = y0 + (y - y0) * k; anda = true; }
        }
        ubicar(abuela, px, py, anda ? { x, y } : miraA);
        opacidad(abuela.obj, abuelaCamino ? Math.min(1, (performance.now() - abuelaCamino.t0) / 900) : 1);
        tronAbuela.rotation.set(0, Math.atan2(miraA.x - x, miraA.y - y) + Math.PI / 2, Math.PI / 2);
        abuela.e.pose = anda ? 'andar' : 'narrarSentada'; animar(abuela, t, dt); tocP(px, py, { k: 'pensador', id: 'abuela' }, abuela);
      }

      // --- los aprendices: pasean esquivando lo construido y, de noche, van a la velada ---
      animar(laMayor, t, dt); tocP(mx, my, { k: 'docente', i: 0 }, laMayor);
      const sentarse = velada > 0.5 && asientos.length ? { asiento: i => asientos[i % asientos.length], mira: PZ.FOGON }
        : { asiento: i => plan[i] || null, mira: PZ.FOGON };      // de día, cada atendido en su corro
      const maestro = m => m === 4 ? 'la Abuela' : LEX().nombres[m % LEX().nombres.length];   // como sus fichas (0: la Mayor)
      aprendices.paso(t, dt, Math.min(S.alumnos, 18), sentarse, a => velada > 0.5 ? { k: 'alumno', i: a.i } : { k: 'alumno', i: a.i, con: planM[a.i] !== undefined ? maestro(planM[a.i]) : null });

      secretoCueva(t, luz, e1 && fuego);
      mo.luces(t);

      // --- la luz del fuego ---
      luzFuego.intensity = brasa * (2 + 24 * (1 - luz)) * (0.88 + 0.12 * Math.sin(t * 13) * Math.sin(t * 7.3));
      luzFuego.castShadow = !mo.op.liviano && brasa > 0.05;   // de día sus sombras casi no se ven; al caer la noche aparecen solas
      vivos.forEach(f => f(t, dt));
      return { luz, brasa };
    }

    /* ---------- el estado de cada saber (novedad, valle, formando) y el globo de la Abuela: el pase 2D ---------- */
    const ALTO = { 10: 75, 11: 45, 12: 80, 13: 30, 15: 70, 28: 50, 24: 30, 25: 30, 26: 40, 27: 60 };
    const ANCLA_SABER = { 10: PZ.FOGON, 11: PZ.ANCLAS.tambor, 12: PZ.ANCLAS.pinturas, 13: PZ.ANCLAS.hueso, 15: MAMUT_HOME, 28: PZ.ANCLAS.pesca, 24: PZ.ANCLAS.siembra, 25: PZ.ANCLAS.corral, 26: PZ.ANCLAS.ceramica, 27: PZ.ANCLAS.telar };
    function superponer(t) {
      for (const i of [10, 11, 12, 13, 15, 28, 24, 25, 26, 27]) {
        if (!tiene(i) || (S.edad < 2 && i >= 24 && i <= 27) || (i === 15 && S.edad >= 2)) continue;
        const a = ANCLA_SABER[i], p = P(a.x, a.y, ALTO[i]);
        estadoTec(i, { x: p.x, y: p.y }, t);
      }
      const estA = S.era === 1 && S.fuegoDescubierto ? estadoPensador('abuela') : 0;
      if (estA >= 1 && !abuelaCamino && (abuelaCapDisponible() || (estA === 1 && VISITAS.abuela))) drawGlobo(LUGAR_PENSADOR.abuela[0], LUGAR_PENSADOR.abuela[1], t);
    }

    /* ---------- los rótulos de acción de la época (los chips que se tocan, ui3d.js) ---------- */
    function rotulos(ancla, t, tocarEn) {
      const e1 = S.era === 1;
      // «echar leña», SOBRE la llama y un poco más abajo que ella (lista de cotejo B7 y F6): en pantalla el hueso
      // queda justo detrás del fuego, y el rótulo alto lo tapaba (tocar el hueso echaba leña). Tocarlo es tocar el fuego.
      ancla('lena', e1 && S.fuegoDescubierto && (S.fuego - 35) / 65 < 0.42, PZ.FOGON.x, PZ.FOGON.y, -16 / zoom, 'echar leña', 'accion', () => tocarEn(PZ.FOGON.x, PZ.FOGON.y));
      // el hueso se ofrece cuando hay una piedra entera por contar, o cuando la marca que espera es el signo
      const cuentas = e1 && tiene(13) ? cuentasPendientes() : 0, signo = cuentas > 0 && !S.signo && (S.abuelaCap || 0) >= 3;
      ancla('contar', signo || cuentas >= 5, PZ.ANCLAS.hueso.x, PZ.ANCLAS.hueso.y, 34, signo ? 'el signo, en el barro' : `contar · ${cuentas}`, 'accion', () => tocarEn(PZ.ANCLAS.hueso.x, PZ.ANCLAS.hueso.y));
      ancla('trueque', e1 && truequeDisponible(), LUGAR_PENSADOR.abuela[0], LUGAR_PENSADOR.abuela[1], 46, 'contar a los vecinos', 'accion', () => trocarHistorias());   // C2: la memoria llena se cuenta a otros
      const campo = e1 && cultivoActivo() && (S.cultivo || 0) >= 1, R = campo ? campoRect() : null;
      ancla('cosechar', campo, R ? (R.x0 + R.x1) / 2 : 0, R ? (R.y0 + R.y1) / 2 : 0, 36, 'cosechar', 'accion', () => tocarEn((R.x0 + R.x1) / 2, (R.y0 + R.y1) / 2));
      const caza = e1 && S.tecs[15] && S.tecs[15].fase !== 'sin' && S.edad < 2, m = caza ? posMamut(t) : null;
      ancla('cazar', caza && !S.cazaOn && cazaDisponible() && m.visible, m?.x, m?.y, 64, 'enviar la partida de caza', 'accion', () => tocarEn(m.x, m.y));
      const acto = (S.cazaProg || 0) < 0.33 ? 'el cerco, en silencio' : (S.cazaProg || 0) < 0.66 ? 'el arreo, a gritos' : 'el forcejeo';
      ancla('cazando', caza && !!S.cazaOn, m?.x, m?.y, 66, `<span>${acto} · ${Math.ceil(Math.max(0, S.cazaT || 0))} s</span><i style="--p:${((S.cazaProg || 0) * 100).toFixed(0)}%"></i>`, 'progreso');
    }

    /* las caras de quienes firman la consejera en esta época (las mismas opciones con que están en el mundo) */
    const caras = {
      'abuela': { edad: 'anciana', piel: 0, pelo: 'moño', ropa: 'traje', colorRopa: '#8a7055', chal: PAL.chal },
      'mayor': { edad: 'anciana', piel: 1, pelo: 'moño', colorPelo: '#9a8d7a', ropa: 'falda', colorRopa: '#8a6247', collar: true, pielHombro: true },
    };
    return { quieto, nubes, sincronizar, superponer, rotulos, caras, aprendices, get corros() { return corros; } };
  },
};
