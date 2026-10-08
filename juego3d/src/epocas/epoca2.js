/* ============================================================
   epocas/epoca2
   La Época 2 (Sumer, la casa de las tablillas) sobre el motor 3D. Como la 1: aquí vive lo de ESTA época
   (su valle, sus piezas, quién está dónde, su año, su noche y sus rótulos); el cómo lo pone motor3d.js.
   El valle, los monumentos y los saberes viven en src/sumer/ (valle.js, monumentos.js, piezas.js).
   Las posiciones son las del motor 2D (la consejera, los anillos y los toques las usan), salvo donde el
   2D encimaba piezas: la estatua del rey, las vasijas y los puestos de las guías se corrieron a lo libre.
   ============================================================ */
import * as THREE from 'three';
import { fundir, PAL } from '../kit.js';
import * as M from '../mundo.js';
import * as V from '../sumer/valle.js';
import * as MON from '../sumer/monumentos.js';
import * as PZ from '../sumer/piezas.js';
import { oveja, vasija, conActores } from '../piezas.js';
import { fase, tiene, niv, llave, Z2D } from '../motor3d.js';
import * as SE from '../secretos.js';

export const ZIGURAT = { x: 6.0, y: 3.4 };
const ALTO_T1 = 0.82, ALTO_CIMA = 0.82 + 0.64 + 0.48;       // las terrazas del zigurat de Ur (monumentos.js)
const PIE_ESCALERA = { x: 6.0, y: 6.6 }, PORTADA = { x: 6.0, y: 4.74 }, CIMA = { x: 6.0, y: 3.55 };
const ESTATUA = { x: 13.35, y: 6.55 }, VASIJAS = { x: 12.95, y: 8.05 };
const LAMPARAS = [{ x: 11.45, y: 8.85, si: () => true }, { x: 9.95, y: 9.35, si: () => fase(19) === 'meseta' }, { x: 9.15, y: 7.25, si: () => tiene(30) }];
const PUERTA = { x: 10.3, y: 9.1 };                       // donde espera Enheduanna antes de ser recibida
/* los que enseñan: el padre de la edubba junto a la clase y las guías en los claros del patio */
const MAESTROS = [{ x: PZ.ASIENTO_UMMIA.x, y: PZ.ASIENTO_UMMIA.y }, { x: 6.95, y: 9.35 }, { x: 13.25, y: 10.05 }, { x: 13.7, y: 7.45 }];
const ASIENTOS_CLASE = [[8.35, 8.5], [8.8, 8.22], [9.2, 8.55], [8.95, 8.8], [9.55, 8.32], [8.12, 8.2]];
const PORTON = { x: 16.9, y: 7.6 };                        // por donde se van a casa al anochecer

export default {
  era: 2,
  nombre: 'La casa de las tablillas',
  piezas: PZ.PIEZAS,
  construir(mo) {
    const { K, raiz, dyn, vivos, ranura, ranuras, persona, ubicar, ver, animar, opacidad, tocP } = mo;
    const oficio = (i, f) => conActores(fase(i) === 'meseta', f);   // el que usa un saber solo aparece con el saber dominado

    /* ---------- el valle: lo quieto se funde; el suelo, el agua y la mies se repintan con el año ---------- */
    const suelo = V.suelo(K), rio = V.rio(K, vivos), campos = V.campos(K), veg = V.vegetacion(K, vivos);
    const quieto = new THREE.Group();
    quieto.add(V.losa(K), V.canales(K, vivos), V.campoTemplo(K), V.pisado(K), V.barrio(K), veg.g, campos.g);
    const Z = MON.zigurat(K); Z.obj.position.set(ZIGURAT.x, 0, ZIGURAT.y); quieto.add(Z.obj);
    const leones = [-1, 1].map(l => { const gu = MON.guardian(K, 'leones', l); gu.position.set(ZIGURAT.x + l * 0.62, 0, PIE_ESCALERA.y + 0.3); gu.rotation.y = l * 0.25; quieto.add(gu); return gu; });
    const toldo = PZ.toldo(K); quieto.add(toldo);
    const estatua = PZ.estatuaRey(K); estatua.position.set(ESTATUA.x, 0, ESTATUA.y); estatua.rotation.y = -0.6; quieto.add(estatua);
    const amarrada = barcaDeJuncos(K); amarrada.obj.position.set(15.05, V.nivelRio(1), 12.25); amarrada.obj.rotation.y = -0.9; dyn.add(amarrada.obj);
    const poste = K.malla(K.cilindro(0.025, 0.03, 0.5, 6), MON.SU.madera, { grosor: 0.006 }); poste.position.set(15.7, 0.2, 11.85); quieto.add(poste);
    fundir(K, quieto); raiz.add(suelo, rio.g, quieto);
    const nubes = M.nubes(K, vivos); raiz.add(nubes.g);
    const luciernagas = M.luciernagas(vivos); raiz.add(luciernagas);
    const luzTemplo = new THREE.PointLight('#ffb35c', 0, 7, 1.6); luzTemplo.position.set(ZIGURAT.x, ALTO_CIMA + 0.9, ZIGURAT.y - 0.3); raiz.add(luzTemplo);
    const luzPatio = new THREE.PointLight('#ffb866', 0, 6.5, 1.5); luzPatio.position.set(10.1, 1.1, 8.7); raiz.add(luzPatio);

    /* la estrella de Inanna y el banderín en la cima: la estrella arde de noche y tras cada himno */
    const cima = new THREE.Group(); cima.position.set(ZIGURAT.x, ALTO_CIMA, ZIGURAT.y); dyn.add(cima);
    const estrella = new THREE.Group(); estrella.position.set(0.32, 0.72, 0.38); cima.add(estrella);
    for (let i = 0; i < 8; i++) { const p = K.malla(K.cono(0.035, 0.16, 4), MON.SU.oro, { emissive: MON.SU.oro, emissiveIntensity: 0.4, grosor: 0.004 }); p.rotation.z = (i / 8) * Math.PI * 2; p.position.set(Math.sin(-p.rotation.z) * 0.08, Math.cos(p.rotation.z) * 0.08, 0); estrella.add(p); }
    const halo = new THREE.Mesh(new THREE.CircleGeometry(0.32, 24), new THREE.MeshBasicMaterial({ color: '#ffe7a0', transparent: true, opacity: 0, depthWrite: false })); estrella.add(halo);
    const mastil = K.malla(K.cilindro(0.015, 0.018, 0.55, 5), MON.SU.madera, { grosor: 0.004 }); mastil.position.set(-0.55, 0.27, 0.3); cima.add(mastil);
    const bandera = K.malla(K.caja(0.01, 0.12, 0.22), MON.SU.oro, { grosor: 0.004 }); bandera.position.set(-0.55, 0.47, 0.42); cima.add(bandera);

    /* ---------- el año de Sumer, leído del motor (ESTACIONES_SUMER) ---------- */
    let pasoVestido = -1, creHoy = 1;
    function vestir() {
      const e = mo.estacionHoy();
      if (e.paso === pasoVestido) return; pasoVestido = e.paso;
      const k = e.k || 0, sig = e.sig || e, mez = (a, b) => k > 0 ? lerpHex(a, b, k) : a;
      const pal = { limo: e.limo.map((c, i) => mez(c, sig.limo[i])) };
      for (const c of ['riberaA', 'riberaB', 'campoA', 'campoB', 'humedo', 'aguaBaja', 'cauce', 'hondo', 'bordeL']) pal[c] = mez(e[c], sig[c]);
      suelo.userData.pintar(pal); rio.pintar(pal);
      creHoy = (e.crecida || 1) + ((sig.crecida || 1) - (e.crecida || 1)) * k; rio.nivel = V.nivelRio(creHoy);
      campos.vestir(e.n, k, sig.n);
      veg.pasto.material.color.set(mez(e.limo[1], sig.limo[1])).multiplyScalar(0.8);
      K.mat(PAL.labio).color.set(pal.bordeL);
    }

    /* ---------- los que siempre están ---------- */
    const guias = [0, 1, 2, 3].map(i => {
      const p = persona(i === 0
        ? { piel: 2, pelo: 'corto', colorPelo: '#2a2018', barba: true, ropa: 'kaunakes', colorRopa: '#ddd0b3', colorMechon: '#cbbd9d', torsoDesnudo: true }
        : { ...PZ.ESCRIBA, piel: [3, 1, 0][i - 1], pelo: ['rapado', 'corto', 'trenza'][i - 1], colorPelo: '#241c16', barba: i === 2, colorRopa: ['#e6dcc4', '#dccfb2', '#e8dfca'][i - 1] }, { pose: 'narrar' });
      const tab = K.malla(K.caja(0.09, 0.02, 0.12), MON.SU.arcilla, { grosor: 0.004 }); tab.rotation.x = 1.2; tab.position.y = -0.04; p.sostener(tab, 'I');
      return p;
    });
    const enheduanna = persona({ piel: 1, pelo: 'rizos', colorPelo: '#1e1712', ropa: 'kaunakes', colorRopa: '#efe6cf', colorMechon: '#e2d6b8', vincha: MON.SU.oro, disco: MON.SU.oro, collar: true }, { pose: 'quieto' });
    { const t = K.malla(K.caja(0.1, 0.02, 0.13), MON.SU.arcilla, { grosor: 0.004 }); t.rotation.x = 1.2; t.position.y = -0.04; enheduanna.sostener(t, 'I'); }
    let enhAntes = -1, enhCamino = null;
    const oferente = persona({ piel: 3, pelo: 'rapado', ropa: 'kaunakes', colorRopa: '#e9e0cc', colorMechon: '#d9ccb0', torsoDesnudo: true }, { pose: 'andar' });
    const jarraOf = vasija(K, [[0.001, 0], [0.05, 0.01], [0.07, 0.07], [0.05, 0.13], [0.025, 0.16]], MON.SU.terracota, false); jarraOf.position.y = 0.05; oferente.sostener(jarraOf, 'D');
    const sacerdote = persona({ piel: 0, pelo: 'rapado', ropa: 'kaunakes', colorRopa: '#f2ecdc', colorMechon: '#e4dac4', torsoDesnudo: true }, { pose: 'narrarSentada', asiento: 0.15 });
    const segadores = [[4.25, 11.55, 0], [4.75, 10.75, 2.6]].map(([x, y, ph], i) => {
      const p = persona({ piel: i + 1, pelo: i ? 'trenza' : 'corto', colorPelo: '#241c16', ropa: i ? 'tunica' : 'corta', colorRopa: '#d6c7a4', torsoDesnudo: !i, sinFlecos: true }, { pose: 'labrar' });
      const hoz = K.malla(K.toro(0.08, 0.012, Math.PI * 1.2, 0.5), '#9aa4ac', { grosor: 0.004 }); hoz.position.y = -0.08; p.sostener(hoz, 'D');
      p.fase = ph; ubicar(p, x, y, { x: x - 0.4, y: y + 0.3 }); return { p, x, y };
    });
    const ovejas = [{ x: 5.1, y: 12.5, c: { x0: 4.5, y0: 11.9, x1: 5.7, y1: 13.1 } }, { x: 3.9, y: 10.0, c: { x0: 3.3, y0: 9.4, x1: 4.5, y1: 10.6 } }].map((o, i) => {
      const ov = oveja(K, false); ov.obj.position.set(o.x, 0, o.y); dyn.add(ov.obj); return { ...o, ...ov, dx: o.x, dy: o.y, espera: i * 1.7 };
    });
    const viajera = barcaDeJuncos(K, true); dyn.add(viajera.obj);
    const barquero = persona({ piel: 3, pelo: 'corto', colorPelo: '#241c16', ropa: 'corta', colorRopa: '#cdbb94', torsoDesnudo: true, sinFlecos: true }, { pose: 'pertiga' });
    { const pt = K.malla(K.cilindro(0.012, 0.014, 1.5, 5), MON.SU.madera, { grosor: 0.004 }); pt.position.y = -0.2; barquero.sostener(pt, 'D'); }
    viajera.obj.add(barquero.obj); barquero.obj.position.set(0, 0.06, -0.22);
    const aprendices = mo.paseantes(18, { opciones: i => PZ.aprendiz(i), inicio: i => ({ x: 8 + (i % 5) * 0.8, z: 8.6 + Math.floor(i / 5) * 0.6 }) });
    const dictx = [0, 1].map(d => persona(PZ.aprendiz(12 + d), { pose: 'escribir' }));
    const lamparas = LAMPARAS.map(L => { const l = PZ.lampara(K); l.position.set(L.x, 0, L.y); dyn.add(l); return { ...L, l }; });
    const azolves = [0, 1, 2, 3, 4].map(() => { const a = limo(K); dyn.add(a.obj); return a; });
    const garzas = bandada(K); dyn.add(garzas.obj);
    const mariposas = [[4.9, 11.2, 0.7, '#f6f1e3'], [15.6, 12.7, 3.4, '#e8a35c'], [10.6, 5.9, 5.1, '#f6f1e3']].map(([x, y, ph, c]) => {
      const g2 = new THREE.Group(); g2.userData.vivo = true;
      const alas = [-1, 1].map(l => { const a = new THREE.Mesh(new THREE.CircleGeometry(0.07, 8), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); a.position.x = l * 0.05; a.scale.set(1, 0.75, 1); const piv = new THREE.Group(); piv.add(a); g2.add(piv); return piv; });
      dyn.add(g2); return { g2, alas, x, y, ph };
    });
    let vasijasNivel = -1, vasijasObj = null;

    /* ---------- por dónde se camina ---------- */
    let claveObst = '', asientos = [], corros = [];
    function rehacerPaso() {
      const circulos = [{ x: ESTATUA.x, z: ESTATUA.y, r: 0.35 }, { x: VASIJAS.x, z: VASIJAS.y, r: 0.4 }, { x: 15.7, z: 11.85, r: 0.2 },
        ...MAESTROS.map(q => ({ x: q.x, z: q.y, r: 0.35 })), { x: LUGAR_PENSADOR.enheduanna[0], z: LUGAR_PENSADOR.enheduanna[1], r: 0.35 },
        ...V.PALMERAS.map(([x, z]) => ({ x, z, r: 0.25 })), ...V.TAMARISCOS.map(([x, z]) => ({ x, z, r: 0.42 })), ...V.CASAS.map(([x, z, w, d]) => ({ x, z, r: Math.max(w, d) * 0.62 })),
        ...[[9.55, 8.1], [10.95, 8.1], [10.95, 9.05], [9.55, 9.05]].map(([x, z]) => ({ x, z, r: 0.12 })),
        ...leones.map(l => ({ x: l.position.x, z: l.position.z, r: 0.3 }))];
      mo.rehacerCaminos({ circulos, elipses: [{ x: ZIGURAT.x, z: ZIGURAT.y + 0.1, rx: 2.05, rz: 1.95 }, { x: 6.0, z: 5.8, rx: 0.45, rz: 1.0 },
        { x: (V.CAMPO_TEMPLO.x0 + V.CAMPO_TEMPLO.x1) / 2, z: (V.CAMPO_TEMPLO.y0 + V.CAMPO_TEMPLO.y1) / 2, rx: 1.45, rz: 1.3 }],
        bloquea: (x, z) => V.altura(x, z) < -0.06 || V.dCanal(x, z) < 0.16 });   // el río no se camina; los canales, sí se saltan en sus puentes de tierra
      aprendices.rehacer();
      asientos = [];                                        // de noche: bajo el porche, alrededor de la lámpara
      for (const [x, z] of ASIENTOS_CLASE) if (mo.caminos.libre(x, z)) asientos.push({ x, z, mira: { x: 8.9, y: 8.5 } });
      const usados = [];
      corros = MAESTROS.map((m, mi) => {
        if (mi === 0) return ASIENTOS_CLASE.map(([x, z]) => ({ x, z, mira: { x: m.x, y: m.y } })).concat(buscarAsientos(m, 6, usados));
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
        if (!mo.caminos.libre(c.x, c.z) || V.altura(c.x, c.z) < -0.02 || V.dCanal(c.x, c.z) < 0.3) continue;
        if (usados.some(u => Math.hypot(u.x - c.x, u.z - c.z) < 0.36) || MAESTROS.some(o => Math.hypot(o.x - c.x, o.y - c.z) < 0.5)) continue;
        const q = { x: c.x, z: c.z, mira: { x: m.x, y: m.y } }; lista.push(q); usados.push(q);
      }
      return lista;
    }

    /* ---------- cada cuadro ---------- */
    /* EL SECRETO DE LA ÉPOCA: de noche, junto a la lámpara de la edubba, el hígado de arcilla del adivino */
    const secretoHigado = (() => {
      const x = 3.85, z = 5.2;                                // al costado del templo, del lado del poniente (el adivino era gente del templo); al este lo tapaba el rótulo del himno de Enheduanna
      const hg = SE.higado(K); hg.position.set(x, 0, z); hg.scale.setScalar(1.25); dyn.add(hg);
      const lam = PZ.lampara(K); lam.position.set(x + 0.24, 0, z + 0.16); dyn.add(lam);
      const halo = SE.resplandor(0.45); halo.position.set(x + 0.1, 0.012, z + 0.08); dyn.add(halo);
      const luzH = new THREE.PointLight('#ffb35c', 0, 2.4, 1.6); luzH.position.set(x + 0.24, 0.45, z + 0.2); dyn.add(luzH);
      const ch = SE.chispitas(7, 0.22, 0.55); ch.position.set(x, 0.16, z); dyn.add(ch);
      return (t, luz, on) => {
        const ve = on && luz < 0.45, oculto = !secretoHallado('higado');
        hg.visible = lam.visible = halo.visible = ve; ch.visible = ve && oculto;
        luzH.intensity = ve ? 1.1 + 0.25 * Math.sin(t * 9) * Math.sin(t * 3.3) : 0;
        if (!ve) return;
        ch.userData.titilar(t); lam.userData.llama.scale.y = 1 + 0.18 * Math.sin(t * 11);
        halo.material.opacity = 0.28 + 0.06 * Math.sin(t * 2.2);
        tocable(x, z, { k: 'secreto', id: 'higado', x, y: z }, { rx: 16, ry: 12, dy: 12 });
      };
    })();
    function sincronizar(t, dt) {
      const e2 = S.era === 2, luz = luzDia(), noche = nocheCasa();
      vestir();
      const lk = Math.max(0, Math.min(1, (0.55 - luz) / 0.25));
      luciernagas.userData.k = lk * lk * (3 - 2 * lk); luciernagas.visible = luciernagas.userData.k > 0.01;

      // --- las ranuras de los saberes ---
      ranura('tablilla', tiene(16) ? llave(16) : null, () => oficio(16, () => PZ.tablilla(K, niv(16))));
      ranura('calamo', tiene(17) ? llave(17) : null, () => oficio(17, () => PZ.calamo(K, niv(17))));
      ranura('calculos', tiene(18) ? llave(18) : null, () => oficio(18, () => PZ.calculos(K, niv(18))));
      ranura('listas', tiene(19) ? llave(19) : null, () => oficio(19, () => PZ.listas(K, niv(19))));
      const copia = ranura('copia', fase(19) === 'meseta' ? 1 : null, () => PZ.mesaCopia(K));
      ranura('dictado', fase(29) === 'meseta' ? niv(29) : null, () => PZ.dictado(K, niv(29)));
      const f30 = fase(30), etapa30 = f30 === 'sin' ? null : f30 === 'meseta' ? niv(30) : f30 === 'formando' ? 'muros' : 'obra';
      ranura('edubba', etapa30, () => PZ.edubbaCasa(K, etapa30));
      const clave = mo.claveRanuras() + '|' + S.docentes;
      if (clave !== claveObst) { claveObst = clave; rehacerPaso(); }
      mo.animarRanuras(t, dt);
      if (copia && copia.cuna) { const hay = (S.copiasPend || 0) > 0; copia.cuna.visible = hay; copia.cuna.material.emissiveIntensity = 0.4 + 0.5 * Math.abs(Math.sin(t * 3)); }

      // --- los tocables de las piezas y del mundo (con las claves del 2D) ---
      for (const [id, r] of Object.entries(ranuras)) if (r.P && r.P.toc) for (const q of r.P.toc) tocP(q.x, q.y, { k: q.k }, q.p);
      tocable(ZIGURAT.x, ZIGURAT.y, { k: 'santuario' }, { rx: 34, ry: 30, dy: (ALTO_CIMA + 0.3) * Z2D });
      leones.forEach((l, i) => tocable(l.position.x, l.position.z, { k: 'leon' + i }));
      tocable(ESTATUA.x, ESTATUA.y, { k: 'estatuaRey' });
      const R = V.CAMPO_TEMPLO; tocable((R.x0 + R.x1) / 2, (R.y0 + R.y1) / 2, { k: 'cebadatemplo' }, { rx: 40, ry: 22, dy: 0 });

      // --- las vasijas del patio crecen con la cerámica aprendida en la aldea ---
      const n26 = Math.max(0, niv(26));
      if (n26 !== vasijasNivel) { vasijasNivel = n26; if (vasijasObj) { dyn.remove(vasijasObj); mo.liberar(vasijasObj); } vasijasObj = PZ.vasijasPatio(K, n26); vasijasObj.position.set(VASIJAS.x, 0, VASIJAS.y); fundir(K, vasijasObj); dyn.add(vasijasObj); }

      // --- el templo: la llama, la estrella, el oferente y el sacerdote ---
      if (Z.llama) Z.llama.scale.set(1 + 0.12 * Math.sin(t * 9), 1 + 0.22 * Math.sin(t * 11.3), 1);
      const glow = Math.max(0, 1 - (tFrame - himnoGlowT) / 35);
      halo.material.opacity = Math.min(0.85, 0.18 + 0.55 * (1 - luz) + 0.5 * glow) * (0.85 + 0.15 * Math.sin(t * 2.2));
      halo.scale.setScalar(1 + 0.25 * glow + 0.1 * Math.sin(t * 1.7)); estrella.rotation.z = Math.sin(t * 0.4) * 0.08;
      estrella.children.forEach(c => { if (c.material?.emissive) c.material.emissiveIntensity = 0.3 + 0.6 * (1 - luz) + glow; });
      bandera.rotation.y = 0.35 * Math.sin(t * 2.3); bandera.scale.z = 1 + 0.08 * Math.sin(t * 5);
      luzTemplo.intensity = (1 - luz) * 5 * (0.9 + 0.1 * Math.sin(t * 13)) + glow * 3;
      moverOferente(t, dt);
      ubicar(sacerdote, ZIGURAT.x - 0.42, ZIGURAT.y + 0.12, { x: ZIGURAT.x, y: ZIGURAT.y + 2 }, ALTO_CIMA);
      animar(sacerdote, t, dt); tocable(ZIGURAT.x - 0.42, ZIGURAT.y + 0.12, { k: 'sacerdote' }, { rx: 13, ry: 15, dy: ALTO_CIMA * Z2D + 10 });

      // --- la gente del campo, del río y del cerco ---
      segadores.forEach((s, i) => { animar(s.p, t, dt); tocP(s.x, s.y, { k: 'segador' + i }, s.p); });
      ovejas.forEach((o, i) => { pastar(o, t, dt); tocable(o.obj.position.x, o.obj.position.z, { k: 'oveja' + i }); });
      moverBarca(t, dt);
      amarrada.obj.position.y = rio.nivel + 0.01 + 0.012 * Math.sin(t * 1.3); amarrada.obj.rotation.z = 0.03 * Math.sin(t * 1.1);

      // --- los canales tapados: el limo late y espera el brazo ---
      azolves.forEach((a, i) => {
        const hay = e2 && (S.azolves || []).includes(i); a.obj.visible = hay;
        if (!hay) return;
        const [x, y] = AZOLVE_SITIOS[i]; a.obj.position.set(x, 0, y); a.anim(t);
        tocable(x, y, { k: 'azolve' + i });
      });

      // --- los maestros y Enheduanna ---
      const vis = Math.min(S.alumnos, 18), sueltos = Math.min(vis, Math.max(0, Math.round(S.alumnos - alumnosBien())));
      const cupos = [PZ.ASIENTO_UMMIA ? Math.min(12, BALANCE.ratioDocente + (S.abuela === 2 ? 4 : 0)) : 0, ...[1, 2, 3].map(k => k < S.docentes ? cupoGuia(k) : 0)];
      const plan = [], planM = []; const conCorro = [0, 0, 0, 0];
      for (let m = 0; m < MAESTROS.length && plan.length < vis - sueltos; m++) {
        const sitios = corros[m] || [];
        for (let j = 0; j < Math.min(cupos[m], sitios.length) && plan.length < vis - sueltos; j++) { plan.push(sitios[j]); planM.push(m); conCorro[m]++; }
      }
      guias.forEach((p, i) => {
        if (!ver(p, i === 0 ? S.docentes >= 1 : i < S.docentes)) return;
        const m = MAESTROS[i]; ubicar(p, m.x, m.y, noche > 0.5 ? { x: 8.9, y: 8.5 } : { x: m.x + 1, y: m.y + 1 });
        p.e.pose = noche > 0.5 && i > 0 ? 'quieto' : 'narrar'; animar(p, t, dt); tocP(m.x, m.y, { k: 'docente', i }, p);
      });
      const estE = e2 ? estadoPensador('enheduanna') : 0;
      if (estE === 2 && enhAntes === 1 && nacimientosVivos) enhCamino = { t0: performance.now() };
      enhAntes = estE;
      if (ver(enheduanna, estE >= 1)) {
        const [lx, ly] = LUGAR_PENSADOR.enheduanna;
        let px = estE === 1 ? PUERTA.x : lx, py = estE === 1 ? PUERTA.y : ly, anda = false;
        if (enhCamino) { const dur = 5200, k = (performance.now() - enhCamino.t0) / dur; if (k >= 1) enhCamino = null; else { px = PUERTA.x + (lx - PUERTA.x) * k; py = PUERTA.y + (ly - PUERTA.y) * k; anda = true; } }
        const canta = tFrame - himnoGlowT < 12;
        ubicar(enheduanna, px, py, anda ? { x: lx, y: ly } : canta ? { x: ZIGURAT.x, y: ZIGURAT.y } : { x: px + 1, y: py + 1 });
        enheduanna.e.pose = anda ? 'andar' : canta ? 'cantar' : 'quieto'; animar(enheduanna, t, dt);
        tocP(px, py, { k: 'pensador', id: 'enheduanna' }, enheduanna);
      }

      // --- los aprendices: la clase y los corros de día; de noche, seis a la lámpara y el resto a su casa ---
      const deNoche = noche > 0.5 && asientos.length;
      const sentarse = deNoche ? { asiento: i => i < 6 ? asientos[i % asientos.length] : null, mira: { x: 8.9, y: 8.5 } } : { asiento: i => plan[i] || null, mira: MAESTROS[0] };
      const maestro = m => LEX().nombres[m % LEX().nombres.length];
      aprendices.paso(t, dt, deNoche ? Math.min(vis, 6) : vis, sentarse, a => ({ k: 'alumno', i: a.i, con: deNoche ? undefined : planM[a.i] !== undefined ? maestro(planM[a.i]) : null }));
      aprendices.lista.forEach(a => { if (a.sentado && !a.cola.length) a.p.e.pose = 'escribir'; });

      // --- los que se sumaron al dictado (los sitios que abriste) ---
      dictx.forEach((p, d) => {
        const D = DIADAS_DICT[d], on = fase(29) === 'meseta' && (S.diadasDict || 0) > d;
        if (!ver(p, on)) return; ubicar(p, D.x, D.y, PZ.ANCLAS.dictado); animar(p, t, dt); tocP(D.x, D.y, { k: 'dictx' + d }, p);
      });

      // --- la noche: los candiles, el patio encendido, el aire que brilla ---
      let encendidas = 0;
      lamparas.forEach(L => { const on = L.si(); L.l.visible = on; if (!on) return; encendidas++; const ll = L.l.userData.llama; ll.visible = luz < 0.5; ll.scale.set(1, 1 + 0.25 * Math.sin(t * 11 + L.x), 1); });
      luzPatio.intensity = (1 - luz) * (1.5 + 1.2 * encendidas) * (0.92 + 0.08 * Math.sin(t * 9));

      // --- el aire: garzas al alba y al atardecer, mariposas ---
      garzas.anim(t, luz);
      mariposas.forEach(m => {
        const a = t * 0.35 + m.ph; m.g2.position.set(m.x + Math.cos(a) * 0.9, 0.55 + 0.2 * Math.sin(t * 1.3 + m.ph), m.y + Math.sin(a * 1.3) * 0.6);
        m.g2.rotation.y = -a; const b = Math.sin(t * 14 + m.ph) * 0.9; m.alas[0].rotation.y = b; m.alas[1].rotation.y = -b; m.g2.visible = luz > 0.4;
      });

      secretoHigado(t, luz, e2);
      mo.luces(t);
      vivos.forEach(f => f(t, dt));
      return { luz, brasa: 0 };
    }

    /* EL OFERENTE (52 s, como el 2D): cruza el patio, sube la escalinata, entra por la portada, aparece arriba con
       la jarra en alto frente al santuario y vuelve por el mismo camino */
    const TRAMOS = [[9.3, 9.35], [7.6, 7.7], [PIE_ESCALERA.x, PIE_ESCALERA.y + 0.25]];
    function moverOferente(t, dt) {
      const c = (t % 52) / 52, sube = c < 0.5, k = sube ? c / 0.5 : (1 - c) / 0.5;   // k: 0 abajo en el patio → 1 arriba
      let x, y, h = 0, pose = 'andar', mira = null, vis = 1;
      if (k < 0.45) {                                         // por el patio hasta el pie de la escalinata
        const u = k / 0.45 * 2, i = Math.min(1, Math.floor(u)), f = u - i, [a, b] = [TRAMOS[i], TRAMOS[i + 1]];
        x = a[0] + (b[0] - a[0]) * f; y = a[1] + (b[1] - a[1]) * f; mira = sube ? { x: b[0], y: b[1] } : { x: a[0], y: a[1] };
      } else if (k < 0.7) {                                   // la escalinata central
        const f = (k - 0.45) / 0.25; x = PIE_ESCALERA.x; y = PIE_ESCALERA.y + 0.25 - (PIE_ESCALERA.y + 0.25 - PORTADA.y - 0.26) * f; h = ALTO_T1 * Math.min(1, f * 1.08);
        mira = { x, y: sube ? y - 1 : y + 1 };
      } else if (k < 0.8) {                                   // entra en la portada
        const f = (k - 0.7) / 0.1; x = PORTADA.x; y = PORTADA.y + 0.26 - 0.3 * f; h = ALTO_T1; vis = 1 - f; mira = { x, y: y - 1 };
      } else {                                                // arriba, frente al santuario, con la jarra en alto
        x = CIMA.x; y = CIMA.y + 0.35; h = ALTO_CIMA; pose = 'ofrendar'; vis = Math.min(1, (k - 0.8) / 0.05); mira = { x, y: y - 1 };
      }
      ubicar(oferente, x, y, mira, h); oferente.e.pose = pose; opacidad(oferente.obj, Math.max(0, Math.min(1, vis))); oferente.obj.visible = vis > 0.02;
      animar(oferente, t, dt);
      if (vis > 0.6 && h < 0.05) tocP(x, y, { k: 'oferente' }, oferente);
    }
    /* LA BARCA VIAJERA (90 s, como el 2D): baja por el río, amarra, vuelve a la pértiga contra la corriente */
    function moverBarca(t, dt) {
      const c = (t % 90) / 90; let u, vuelta = false, quieta = false;
      if (c < 0.32) u = 0.14 + (0.82 - 0.14) * (c / 0.32);
      else if (c < 0.42) { u = 0.82; quieta = true; }
      else if (c < 0.92) { u = 0.82 - (0.82 - 0.14) * ((c - 0.42) / 0.5); vuelta = true; }
      else { u = 0.14; quieta = true; }
      const p = V.puntoRio(u, 0.18), q = V.puntoRio(Math.min(1, u + 0.01), 0.18);
      viajera.obj.position.set(p.x, rio.nivel + 0.01 + 0.012 * Math.sin(t * 1.6), p.z);
      viajera.obj.rotation.y = Math.atan2(q.x - p.x, q.z - p.z) + (vuelta ? Math.PI : 0);
      viajera.obj.visible = p.x > V.E0 + 0.4 && p.x < V.E1 - 0.4 && p.z > V.E0 + 0.4 && p.z < V.E1 - 0.4;
      barquero.e.pose = quieta ? 'quieto' : 'pertiga'; barquero.e.dt = dt; barquero.anim(t, barquero.e);
      if (viajera.obj.visible) tocable(p.x, p.z, { k: 'barcaviajera' });
    }
    function pastar(o, t, dt) {
      const pos = o.obj.position; o.espera -= dt;
      if (o.espera <= 0) { o.dx = o.c.x0 + 0.2 + Math.random() * (o.c.x1 - o.c.x0 - 0.4); o.dy = o.c.y0 + 0.2 + Math.random() * (o.c.y1 - o.c.y0 - 0.4); o.espera = 3 + Math.random() * 4; }
      const dx = o.dx - pos.x, dz = o.dy - pos.z, L = Math.hypot(dx, dz);
      if (L > 0.03) { const s = Math.min(L, 0.25 * dt); pos.x += dx / L * s; pos.z += dz / L * s; o.obj.rotation.y = Math.atan2(dx, dz); }
      o.cab.rotation.x = L > 0.03 ? 0 : 0.5 + 0.2 * Math.sin(t * 2 + o.x);
    }

    /* ---------- el estado de cada saber (novedad, valle, formando) y los globos: el pase 2D ---------- */
    const ALTO = { 16: 30, 17: 32, 18: 26, 19: 40, 30: 60 };
    function superponer(t) {
      for (const i of [16, 17, 18, 19, 30]) {
        if (!tiene(i)) continue;
        const a = i === 30 ? PZ.CASA : PZ.ANCLAS[{ 16: 'tablilla', 17: 'calamo', 18: 'calculos', 19: 'listas' }[i]], p = P(a.x, a.y, ALTO[i]);
        estadoTec(i, { x: p.x, y: p.y }, t);
      }
      const estE = S.era === 2 ? estadoPensador('enheduanna') : 0;
      if (estE >= 1 && !enhCamino && (himnoDisponible() || (estE === 1 && VISITAS.enheduanna))) {
        const q = estE === 1 ? [PUERTA.x, PUERTA.y] : LUGAR_PENSADOR.enheduanna; drawGlobo(q[0], q[1], t);
      }
    }

    /* ---------- los rótulos de acción: lo que se toca en Sumer ---------- */
    function rotulos(ancla, t, tocarEn) {
      const e2 = S.era === 2, A = PZ.ANCLAS;
      ancla('sellar', e2 && tiene(18) && (S.fichasPend || 0) > 0, A.calculos.x, A.calculos.y, 30, `sellar · ${S.fichasPend || 0}`, 'accion', () => tocarEn(A.calculos.x, A.calculos.y));
      ancla('corregir', e2 && fase(19) === 'meseta' && (S.copiasPend || 0) > 0, A.copia.x, A.copia.y, 34, `corregir la copia · ${S.copiasPend || 0}`, 'accion', () => tocarEn(A.copia.x - 0.3, A.copia.y - 0.2));
      const D = DIADAS_DICT[Math.min(S.diadasDict || 0, DIADAS_DICT.length - 1)];
      ancla('dictar', e2 && haySitioDictado(), D.x, D.y, 30, 'hacer sitio en el dictado', 'accion', () => tocarEn(A.dictado.x, A.dictado.y));
      for (let i = 0; i < AZOLVE_SITIOS.length; i++) {
        const [x, y] = AZOLVE_SITIOS[i];
        ancla('azolve' + i, e2 && (S.azolves || []).includes(i), x, y, 22, 'destapar el canal', 'accion', () => tocarEn(x, y));
      }
      const estE = e2 ? estadoPensador('enheduanna') : 0, [lx, ly] = LUGAR_PENSADOR.enheduanna;
      ancla('himno', estE === 2 && !enhCamino && himnoDisponible(), lx, ly, 52, 'escuchar el himno', 'accion', () => tocarEn(lx, ly));
      ancla('recibir', estE === 1 && S.apr >= (VISITAS.enheduanna?.costo || 0), PUERTA.x, PUERTA.y, 52, 'recibir a Enheduanna', 'accion', () => tocarEn(PUERTA.x, PUERTA.y));
    }

    /* las caras de quienes firman la consejera en esta época */
    const caras = {
      'enheduanna': { piel: 1, pelo: 'rizos', colorPelo: '#1e1712', ropa: 'kaunakes', colorRopa: '#efe6cf', vincha: MON.SU.oro, disco: MON.SU.oro, collar: true },
      'padre': { piel: 2, pelo: 'corto', colorPelo: '#2a2018', barba: true, ropa: 'kaunakes', colorRopa: '#ddd0b3', torsoDesnudo: true },
    };
    return { quieto, nubes, sincronizar, superponer, rotulos, caras, aprendices, get corros() { return corros; } };
  },
};

/* ---------- la barca de juncos: casco de haces atados con proa y popa curvas ---------- */
function barcaDeJuncos(K, viajera = false) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const casco = K.malla(K.capsula(0.13, 0.62, 0.8), MON.SU.cana, { grosor: 0.01 }); casco.rotation.x = Math.PI / 2; casco.scale.set(1, 1, 0.55); casco.position.y = 0.03; g.add(casco);
  [-1, 1].forEach(l => {
    const punta = K.malla(K.toro(0.13, 0.05, Math.PI * 0.7, 0.6), MON.SU.canaD, { grosor: 0.008 }); punta.rotation.set(0, Math.PI / 2, l > 0 ? Math.PI * 0.15 : Math.PI * 0.15); punta.position.set(0, 0.13, l * 0.4); punta.scale.z = l; g.add(punta);
  });
  for (let i = -2; i <= 2; i++) { const a = K.malla(K.toro(0.135, 0.012, Math.PI, 0.4), MON.SU.atadura, { sinTinta: true }); a.rotation.set(Math.PI, Math.PI / 2, 0); a.position.set(0, 0.04, i * 0.12); g.add(a); }
  if (viajera) [0.12, 0.25].forEach((z, i) => { const v = vasija(K, [[0.001, 0], [0.06, 0.01], [0.08, 0.08], [0.06, 0.15], [0.03, 0.18]], i ? MON.SU.terracotaD : MON.SU.terracota, false); v.position.set((i - 0.5) * 0.08, 0.06, z); g.add(v); });
  g.userData.ficha = { titulo: 'La barca de juncos', texto: 'la carretera de Sumer es el río' };
  return { obj: g };
}
/* el limo que tapa el canal: un montón de barro húmedo con su aro dorado que late */
function limo(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  [[0, 0, 0.13], [0.1, 0.04, 0.09], [-0.09, -0.03, 0.08]].forEach(([x, z, r]) => { const m = K.malla(K.esfera(r), '#9c8752', { grosor: 0.008 }); m.scale.y = 0.45; m.position.set(x, 0.02, z); g.add(m); });
  const aro = new THREE.Mesh(new THREE.RingGeometry(0.24, 0.29, 28), new THREE.MeshBasicMaterial({ color: '#ffd24a', transparent: true, opacity: 0.8, depthWrite: false }));
  aro.rotation.x = -Math.PI / 2; aro.position.y = 0.03; g.add(aro);
  return { obj: g, anim(t) { const c = (t * 0.7) % 1; aro.scale.setScalar(0.8 + 0.6 * c); aro.material.opacity = 0.8 * (1 - c); } };
}
/* la V de garzas que cruza el cielo al alba y al atardecer */
function bandada(K) {
  const g = new THREE.Group(), aves = [];
  for (let i = 0; i < 7; i++) {
    const a = new THREE.Group(), c = K.malla(K.esfera(0.06), '#f2f0ea', { grosor: 0.006, sombra: false }); c.scale.set(0.7, 0.6, 1.6); a.add(c);
    const alas = [-1, 1].map(l => { const w = K.malla(K.caja(0.32, 0.01, 0.09), '#f2f0ea', { grosor: 0.004, sombra: false }); w.position.x = l * 0.17; const p = new THREE.Group(); p.add(w); a.add(p); return p; });
    const k = Math.ceil(i / 2) * (i % 2 ? 1 : -1); a.userData = { k, alas }; g.add(a); aves.push(a);
  }
  g.visible = false;
  return { obj: g, anim(t, luz) {
    const crep = luz > 0.25 && luz < 0.7, c = (t % 150) / 150;
    g.visible = crep;
    if (!crep) return;
    const u = ((t * 0.9) % 30) / 30, x0 = 1 + u * 20, z0 = 16 - u * 14;
    aves.forEach((a, i) => { const k = a.userData.k; a.position.set(x0 - Math.abs(k) * 0.45, 4.2 + 0.1 * Math.sin(t * 2 + i), z0 + k * 0.45 - Math.abs(k) * 0.3); a.rotation.y = Math.atan2(20, -14);
      const b = Math.sin(t * 6 + i) * 0.5; a.userData.alas[0].rotation.z = b; a.userData.alas[1].rotation.z = -b; });
  } };
}
