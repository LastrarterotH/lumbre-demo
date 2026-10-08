/* ============================================================
   piezas
   Los saberes de la Época 1 en el mundo, cada uno con sus TRES ETAPAS. `crear(K, n)` devuelve
   { obj, anim(t, dt) } con n = 0 (recién dominado) … 3; todo va en coordenadas relativas a su ANCLA,
   que es su lugar en la grilla del juego 2D. La regla que manda: subir de nivel SIEMPRE se ve, con
   piezas nuevas y no con brillos.
   ============================================================ */
import * as THREE from 'three';
import { PAL, azar, fundir } from './kit.js';
import { crearPersona, lanza, cana, baston, azada, cesto } from './actores.js';
import { crearMamut } from './mamut.js';

export const FOGON = { x: 6.5, y: 9.5 };
export const LAGO = { x: 14.88, y: 14.48, rx: 1.55, ry: 1.25 };
/* El tambor va un paso más afuera que en 2D (7,7; 10,4): el corro 3D es más ancho. */
export const ANCLAS = {
  circulo: FOGON, tambor: { x: 8.2, y: 10.8 }, pinturas: { x: 11.35, y: 7.15 }, hueso: { x: 5.3, y: 8.4 },
  caza: { x: 13.0, y: 3.9 }, pesca: { x: 13.1, y: 15.9 }, siembra: { x: 4.65, y: 11.15 }, corral: { x: 12.5, y: 11.5 },
  ceramica: { x: 9.6, y: 8.5 }, telar: { x: 8.2, y: 7.8 }, curtido: { x: 4.6, y: 7.6 }, chozas: { x: 6.1, y: 6.2 }, granero: { x: 3.3, y: 9.0 },
};
const OCRE = '#a24e30';

/* ---------- utilidades ---------- */
export function pieza(ancla) {
  const obj = new THREE.Group(), vivos = [];
  return { obj, vivos, ancla, toc: [], actores: [], en: (x, y) => new THREE.Vector3(x - ancla.x, 0, y - ancla.y), anim(t, dt) { vivos.forEach(f => f(t, dt)); } };
}
/* Pone una persona en (x, y) de la grilla, mirando a `mira` (otro punto de la grilla). `op.k` es la clave
   de su ficha en el juego 2D (FICHAS_FIJAS): el puente la registra como tocable. `op.oficio`: solo aparece
   con el saber DOMINADO (la regla de la acción del 2D: todo saber en meseta tiene a alguien usándolo). */
let actoresOn = true;
export function conActores(on, f) { const antes = actoresOn; actoresOn = on; try { return f(); } finally { actoresOn = antes; } }
const FANTASMA = { obj: new THREE.Group(), sostener: o => o, fase: 0 };
export function actor(P, K, op, pose, x, y, mira, extra = {}) {
  if (op.oficio && !actoresOn) return FANTASMA;
  const p = crearPersona(K, op);
  (P.actores || (P.actores = [])).push(p);
  if (op.k) (P.toc || (P.toc = [])).push({ x, y, k: op.k, p });
  p.obj.position.copy(P.en(x, y));
  if (mira) p.obj.rotation.y = Math.atan2(mira.x - x, mira.y - y);
  P.obj.add(p.obj);
  const e = { pose, ...extra };
  P.vivos.push((t, dt) => { e.dt = dt; p.anim(t, e); });
  return p;
}
function tronquito(K, largo = 0.46) {
  const t = K.malla(K.cilindro(0.1, 0.1, largo, 8), PAL.troncoL, { grosor: 0.016 }); t.rotation.z = Math.PI / 2; t.position.y = 0.1;
  const g = new THREE.Group(); g.add(t); return g;
}
export function ponerEn(P, obj, x, y, rotY = 0) { obj.position.add(P.en(x, y)); obj.rotation.y = rotY; P.obj.add(obj); return obj; }
export function texturaCanvas(w, h, pintar) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  pintar(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; t.userData.propia = true;
  return t;
}

/* ---------- la fogata (la base del círculo) ---------- */
export function fogata(K, anillo = true) {
  const g = new THREE.Group();
  if (anillo) for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2, p = K.malla(K.roca(0.12, 40 + i), i % 2 ? PAL.piedraL : PAL.piedraD, { grosor: 0.02 });
    p.position.set(Math.cos(a) * 0.5, 0.05, Math.sin(a) * 0.5); p.scale.set(1.1, 0.7, 1); g.add(p);
  }
  const ceniza = K.malla(K.cilindro(0.38, 0.4, 0.04, 14), '#4a3a30', { sinTinta: true, sombra: false }); ceniza.position.y = 0.02; g.add(ceniza);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4, l = K.malla(K.cilindro(0.05, 0.06, 0.58, 7), i ? '#6e4d33' : PAL.troncoD, { grosor: 0.018 });
    l.position.set(Math.cos(a) * 0.13, 0.19, Math.sin(a) * 0.13); l.rotation.set(Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9); g.add(l);
  }
  const llama = new THREE.Group(); llama.position.y = 0.1; llama.userData.vivo = true; g.add(llama);
  const lenguas = [[0.22, 0.66, '#e86a2e', 0, 0], [0.16, 0.58, '#f6a23c', 0.08, 0.05], [0.13, 0.46, '#f6a23c', -0.08, -0.04], [0.09, 0.34, '#f8dc8c', 0, 0.02]].map(([r, h, c, x, z]) => {
    const m = K.malla(K.cono(r, h, 7), c, { emissive: c, emissiveIntensity: 0.9, sombra: false, grosor: 0.014 });
    m.position.set(x, h / 2, z); llama.add(m); return m;
  });
  const chispas = Array.from({ length: 8 }, (_, i) => { const m = new THREE.Mesh(K.esfera(0.022), new THREE.MeshBasicMaterial({ color: '#ffd27a' })); m.userData.vivo = true; g.add(m); return { m, f: i / 8 }; });
  const humo = Array.from({ length: 6 }, (_, i) => {
    const m = new THREE.Mesh(K.esfera(0.2), new THREE.MeshLambertMaterial({ color: '#efe9df', transparent: true, opacity: 0.35, depthWrite: false }));
    m.castShadow = false; g.add(m); return { m, f: i / 6 };
  });
  const yesca = K.malla(K.esfera(0.12), '#c9b98a', { sinTinta: true }); yesca.scale.set(1.3, 0.45, 1); yesca.position.y = 0.06; yesca.visible = false; yesca.userData.vivo = true; g.add(yesca);
  yesca.material = yesca.material.clone(); yesca.material.emissive = new THREE.Color('#ff4a12'); yesca.material.emissiveIntensity = 0;   // la brasa que late antes del fuego (propia: no toca la caché)
  g.userData.ficha = { titulo: 'El fogón', texto: 'donde el clan se junta: aquí empieza todo' };
  const F = {
    obj: g, brasa: 1, frote: 0,
    /* brasa 0: apagado (leños y yesca); 0,14-1: el tamaño de la llama, como el `brasa` del 2D */
    ponerBrasa(b) { F.brasa = b; llama.visible = b > 0; chispas.forEach(c => c.m.visible = b > 0.3); yesca.visible = b <= 0; },
    /* antes del fuego: cuánto se frotó (0-1, el S.fuego del 2D). Desde la mitad sale humo; desde tres cuartos, la
       yesca late roja (lista de cotejo A3: los avisos contaban chispa, humo y brasa, y el fogón no lo mostraba) */
    ponerFrote(k) { F.frote = k; },
    anim(t) {
      const b = Math.max(0.14, F.brasa);
      lenguas.forEach((m, i) => { const k = Math.sin(t * (9 + i * 2.3) + i) * 0.5 + Math.sin(t * 5.7 + i * 3) * 0.5; m.scale.set((1 + 0.1 * k) * (0.5 + 0.5 * b), (1 + 0.22 * k) * b, (1 + 0.1 * k) * (0.5 + 0.5 * b)); m.rotation.y = t * (0.6 + i * 0.2); });
      chispas.forEach(c => { const u = (t * 0.55 + c.f) % 1; c.m.position.set(Math.sin(c.f * 40 + u * 3) * 0.25 * u, 0.3 + u * 1.4 * b, Math.cos(c.f * 31 + u * 2) * 0.25 * u); c.m.scale.setScalar(1 - u); });
      const hilo = F.brasa <= 0 ? Math.max(0, Math.min(1, (F.frote - 0.4) / 0.5)) : 0;   // el hilo de humo del frote
      humo.forEach(h => { const u = (t * 0.12 + h.f) % 1; h.m.visible = F.brasa > 0 || hilo > 0; h.m.position.set(0.3 * u + 0.1 * Math.sin(t + h.f * 9), (F.brasa > 0 ? 0.8 : 0.15) + u * (F.brasa > 0 ? 2.8 : 1.6), -0.25 * u); h.m.scale.setScalar(F.brasa > 0 ? (0.4 + u * 1.8) * (0.5 + 0.5 * b) : (0.25 + u * 0.9) * (0.4 + 0.6 * hilo)); h.m.material.opacity = (F.brasa > 0 ? 0.3 : 0.4 * hilo) * Math.sin(Math.PI * u); });
      if (F.brasa <= 0) yesca.material.emissiveIntensity = F.frote >= 0.75 ? (0.35 + 0.35 * Math.sin(t * 5)) * Math.min(1, (F.frote - 0.7) / 0.25) : 0;
    },
  };
  return F;
}

/* ---------- 10 · el círculo de historias ---------- */
const CABELLOS = ['greñas', 'melena', 'revuelto'];
function pequeno(i, extra = {}) {
  return { edad: 'nino', piel: i % 4, pelo: CABELLOS[i % 3], vincha: i % 3 === 1, pluma: i % 3 === 2, colorRopa: ['#c49a68', '#b98a5c', '#d1a877'][i % 3], ...extra };
}
function circulo(K, n) {
  /* n = −1: hay fuego pero el círculo aún no se aprende (sin anillo ni narrador) */
  const P = pieza(FOGON), F = fogata(K, n >= 0); P.obj.add(F.obj); P.vivos.push(F.anim); P.fuego = F;
  const pos = (ang, r) => ({ x: FOGON.x + Math.cos(ang * Math.PI / 180) * r, y: FOGON.y + Math.sin(ang * Math.PI / 180) * r });
  const o = pos(62, 1.45);
  if (n >= 0) actor(P, K, { piel: 2, pelo: 'revuelto', pluma: true, titulo: 'Okim', texto: 'el narrador del círculo', k: 'narrador', oficio: true }, 'narrar', o.x, o.y, FOGON);
  /* los asientos del corro esquivan lo que rodea al fuego: La Mayor (176°), el hueso (223°), la Abuela (323°),
     el narrador (62°) y Dun, que tapaba al de 21° (QA 2026-09-28) */
  const oyentes = [135, 100, 5, 280, 160, 250].slice(0, 3 + Math.max(0, n));
  oyentes.forEach((ang, i) => {
    const q = pos(ang, 1.1), narra = n >= 3 && i === 1;     // etapa 3: un aprendiz ya cuenta, de pie
    const manta = K.malla(K.cilindro(0.2, 0.2, 0.025, 10), '#8a6247', { sinTinta: true, sombra: false });
    manta.scale.z = 0.8; manta.position.copy(P.en(q.x, q.y)); manta.position.y = 0.012; P.obj.add(manta);
    actor(P, K, pequeno(i, { titulo: 'Aprendiz', texto: narra ? 'ya no solo escucha: cuenta' : 'escucha la historia', k: 'circulo' + i }), narra ? 'narrar' : 'suelo', q.x, q.y, FOGON);
  });
  if (n >= 2) {                                    // la genealogía: las piedras de los ancestros
    const g = new THREE.Group();
    [[0, 0.5], [0.34, 0.4], [-0.34, 0.38], [0.62, 0.26], [-0.6, 0.24]].forEach(([x, h], i) => {
      const p = K.malla(K.capsula(0.09, h * 0.7), i % 2 ? PAL.piedraL : '#aaa597', { grosor: 0.016 }); p.position.set(x, h / 2 + 0.05, -Math.abs(x) * 0.35); g.add(p);
      const m = K.malla(K.caja(0.1, 0.018, 0.01), OCRE, { sinTinta: true }); m.position.set(x, h * 0.62 + 0.05, -Math.abs(x) * 0.35 + 0.09); g.add(m);
      const o = K.malla(K.esfera(0.018), OCRE, { sinTinta: true }); o.position.set(x, h * 0.75 + 0.05, -Math.abs(x) * 0.35 + 0.09); g.add(o);
    });
    g.userData.ficha = { titulo: 'Las piedras de los ancestros', texto: 'el clan sabe de dónde viene' };
    const q = pos(-100, 2.0); ponerEn(P, g, q.x, q.y, Math.PI / 4 + 0.35);
  }
  return P;
}

/* ---------- 11 · el tambor ---------- */
function tambor(K, n) {
  const A = ANCLAS.tambor, P = pieza(A);
  const hacer = (r, h, cuerpo, parche) => {
    const g = new THREE.Group();
    const c = K.malla(K.cilindro(r, r * 1.06, h, 12), cuerpo); c.position.y = h / 2; g.add(c);
    const b = K.malla(K.cilindro(r * 1.1, r * 1.12, 0.04, 12), '#5e4128', { sinTinta: true }); b.position.y = 0.02; g.add(b);
    const p = K.malla(K.cilindro(r * 0.97, r * 0.97, 0.02, 12), parche, { grosor: 0.01 }); p.position.y = h + 0.01; g.add(p);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, s = K.malla(K.cilindro(0.006, 0.006, h * 0.8, 3), '#d9b98a', { sinTinta: true }); s.position.set(Math.cos(a) * r * 1.03, h * 0.55, Math.sin(a) * r * 1.03); g.add(s); }
    return g;
  };
  const principal = hacer(0.16, 0.3, '#6e4d33', '#d9b98a'); P.obj.add(principal);
  if (n >= 1) {                                    // bandas y zigzag ocre, con puntos claros
    const banda = K.malla(K.toro(0.168, 0.016), OCRE, { sinTinta: true }); banda.rotation.x = Math.PI / 2; banda.position.y = 0.2; principal.add(banda);
    for (let i = 0; i < 10; i++) {
      const a = i / 10 * Math.PI * 2, z = K.malla(K.cono(0.03, 0.06, 3), OCRE, { sinTinta: true, sombra: false });
      z.position.set(Math.cos(a) * 0.168, 0.1, Math.sin(a) * 0.168); z.scale.set(1, 1, 0.35); z.rotation.y = -a; if (i % 2) z.rotation.x = Math.PI; principal.add(z);
      const d = K.malla(K.esfera(0.012), '#e9d6b0', { sinTinta: true, sombra: false }); d.position.set(Math.cos(a + 0.3) * 0.172, 0.25, Math.sin(a + 0.3) * 0.172); principal.add(d);
    }
  }
  if (n >= 2) ponerEn(P, hacer(0.19, 0.24, '#7a5a3d', '#d9b98a'), A.x + 0.28, A.y - 0.2);
  if (n >= 3) ponerEn(P, hacer(0.1, 0.42, '#8a6440', '#e4c9a0'), A.x - 0.2, A.y + 0.3);
  ponerEn(P, tronquito(K, 0.4), A.x - 0.3, A.y - 0.3, Math.PI / 4);        // Dun, detrás de sus tambores y de cara a la cámara
  actor(P, K, { piel: 3, pelo: 'greñas', colorRopa: '#8a6247', titulo: 'Dun', texto: 'el percusionista', k: 'percu', oficio: true }, 'tocar', A.x - 0.3, A.y - 0.3, A);
  // las notas que suben
  const notas = [0, 1].map(i => {
    const g = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color: '#4a3a26', transparent: true });
    const c = new THREE.Mesh(K.esfera(0.045), mat); c.scale.set(1.25, 0.9, 0.6); g.add(c);
    const s = new THREE.Mesh(K.caja(0.012, 0.16, 0.012), mat); s.position.set(0.045, 0.08, 0); g.add(s);
    const b = new THREE.Mesh(K.caja(0.05, 0.012, 0.012), mat); b.position.set(0.07, 0.155, 0); b.rotation.z = -0.5; g.add(b);
    P.obj.add(g); return { g, mat, f: i * 0.5 };
  });
  P.vivos.push(t => notas.forEach(q => { const u = (t * 0.35 + q.f) % 1; q.g.position.set(0.1 * Math.sin(u * 6 + q.f * 9), 0.45 + u * 0.9, 0); q.mat.opacity = Math.sin(Math.PI * u); }));
  principal.userData.ficha = { titulo: 'El tambor', texto: 'lo que se canta no se olvida' };
  return P;
}

/* ---------- 12 · las pinturas rupestres ---------- */
function pintarMural(g, W, H, n) {
  g.fillStyle = OCRE; g.shadowColor = 'rgba(90,30,15,.35)'; g.shadowBlur = 3; g.strokeStyle = OCRE; g.lineCap = 'round'; g.lineJoin = 'round';
  const mano = (x, y, s, r) => {
    g.save(); g.translate(x, y); g.rotate(r); g.scale(s, s); g.globalAlpha = 0.9;
    g.beginPath(); g.ellipse(0, 10, 13, 15, 0, 0, 7); g.fill();
    [[-12, -6, -0.5, 13], [-5, -14, -0.15, 18], [2, -16, 0, 20], [9, -14, 0.15, 18], [15, -2, 0.7, 12]].forEach(([dx, dy, a, l]) => { g.save(); g.translate(dx, dy + 8); g.rotate(a); g.beginPath(); g.roundRect(-3.2, -l, 6.4, l + 4, 3.2); g.fill(); g.restore(); });
    g.restore(); g.globalAlpha = 1;
  };
  const bisonte = (x, y, s) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.beginPath(); g.ellipse(0, 0, 34, 17, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(-22, -9, 18, 16, -0.3, 0, 7); g.fill();          // la giba
    g.beginPath(); g.ellipse(-40, 2, 10, 9, 0, 0, 7); g.fill();               // la cabeza
    g.lineWidth = 3.5; g.beginPath(); g.moveTo(-44, -4); g.quadraticCurveTo(-50, -16, -40, -18); g.stroke(); // el cuerno
    g.lineWidth = 5; [[-18, 12], [-8, 13], [16, 12], [26, 11]].forEach(([dx, dy], i) => { g.beginPath(); g.moveTo(dx, dy); g.lineTo(dx + (i % 2 ? 4 : -3), dy + 16); g.stroke(); });
    g.lineWidth = 2.5; g.beginPath(); g.moveTo(33, -3); g.quadraticCurveTo(42, 4, 38, 14); g.stroke();
    g.restore();
  };
  const ciervo = (x, y, s) => {
    g.save(); g.translate(x, y); g.scale(s, s); g.lineWidth = 3;
    g.beginPath(); g.ellipse(0, 0, 22, 9, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(-16, -4); g.lineTo(-26, -20); g.lineWidth = 6; g.stroke();
    g.beginPath(); g.ellipse(-29, -22, 7, 5, -0.4, 0, 7); g.fill();
    g.lineWidth = 2.5; [[-28, -26, -22, -44], [-24, -36, -14, -40], [-30, -27, -38, -44], [-34, -36, -44, -38]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); });
    g.lineWidth = 3.5; [[-14, 7], [-7, 8], [11, 7], [17, 6]].forEach(([dx, dy]) => { g.beginPath(); g.moveTo(dx, dy); g.lineTo(dx, dy + 17); g.stroke(); });
    g.restore();
  };
  const cazador = (x, y, s) => {
    g.save(); g.translate(x, y); g.scale(s, s); g.lineWidth = 3.5;
    g.beginPath(); g.arc(0, -22, 4.5, 0, 7); g.fill();
    g.beginPath(); g.moveTo(0, -17); g.lineTo(2, 0); g.moveTo(2, 0); g.lineTo(-5, 14); g.moveTo(2, 0); g.lineTo(8, 14);
    g.moveTo(0, -12); g.lineTo(10, -8); g.moveTo(0, -12); g.lineTo(-7, -4); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(-8, 2); g.lineTo(22, -22); g.stroke();
    g.restore();
  };
  mano(70, 90, 1.2, -0.2); mano(118, 70, 1.0, 0.15); mano(95, 250, 1.1, -0.4);
  bisonte(290, 150, 1.6);
  if (n >= 1) { mano(450, 70, 1.0, 0.3); mano(40, 190, 0.9, -0.1); ciervo(210, 260, 1.4); }
  if (n >= 2) { mano(480, 250, 1.0, 0.1); mano(165, 40, 0.8, 0.5); [0, 1, 2].forEach(i => cazador(360 + i * 34, 275, 1.25)); }
  if (n >= 3) {
    mano(20, 300, 0.9, 0.2); mano(250, 40, 0.9, -0.3);
    g.lineWidth = 5; g.beginPath(); g.arc(440, 170, 22, 0, 7); g.stroke();
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; g.beginPath(); g.moveTo(440 + Math.cos(a) * 30, 170 + Math.sin(a) * 30); g.lineTo(440 + Math.cos(a) * 42, 170 + Math.sin(a) * 42); g.stroke(); }
    g.lineWidth = 6; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(40 + i * 14, 340); g.lineTo(40 + i * 14, 372); g.stroke(); }
  }
}
function pinturas(K, n) {
  const A = ANCLAS.pinturas, P = pieza(A);
  /* la pared pintada es el flanco este de la cueva, de cara al valle: así no tapa al mamut que pasta detrás */
  const pared = new THREE.Group(); pared.position.copy(P.en(A.x - 0.05, A.y - 1.2)); pared.rotation.y = 1.19; pared.scale.setScalar(0.85); P.obj.add(pared);
  const muro = K.malla(K.caja(2.3, 1.6, 0.5), '#cfc6b2', { grosor: 0.035 }); muro.position.y = 0.8; pared.add(muro);
  [[-1.3, 0.5, -0.15, 0.6, 1], [1.3, 0.42, -0.1, 0.55, 2], [0.2, 1.62, -0.35, 0.6, 3], [-0.9, 1.5, -0.35, 0.45, 4], [1.0, 1.45, -0.35, 0.5, 5]].forEach(([x, y, z, r, s]) => {
    const b = K.malla(K.roca(r, 70 + s), s % 2 ? PAL.rocaD : PAL.roca, { grosor: 0.035 }); b.position.set(x, y, z); pared.add(b);
  });
  const tex = texturaCanvas(512, 384, (g, w, h) => pintarMural(g, w, h, n));
  const lienzo = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.5), K.matMapa(tex, { transparent: true, depthWrite: false }));
  lienzo.position.set(0, 0.82, 0.255); lienzo.receiveShadow = true; pared.add(lienzo);
  pared.userData.ficha = { titulo: 'Las pinturas rupestres', texto: 'la primera pizarra de la humanidad' };
  /* CADA ETAPA, UNA PIEZA NUEVA (QA 2026-09-28: el mural solo cambiaba 2% de la silueta por etapa, bajo la vara del 8%) */
  if (n >= 1) {                                    // de las manos a los animales: una segunda roca con el gran animal de la manada
    const losa = new THREE.Group(); losa.position.set(1.62, 0, 0.35); losa.rotation.y = -0.35; pared.add(losa);
    const r2 = K.malla(K.caja(1.1, 1.05, 0.4), '#c9bfa8', { grosor: 0.03 }); r2.position.y = 0.52; losa.add(r2);
    const tex2 = texturaCanvas(256, 240, g => { g.fillStyle = OCRE; g.strokeStyle = OCRE; g.lineCap = 'round';
      g.beginPath(); g.ellipse(128, 118, 78, 50, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(70, 88, 40, 36, 0, 0, 7); g.fill();     // el mamut pintado
      g.lineWidth = 12; [[90, 160], [115, 165], [150, 165], [175, 160]].forEach(([x, y]) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 44); g.stroke(); });
      g.lineWidth = 9; g.beginPath(); g.moveTo(40, 96); g.quadraticCurveTo(18, 140, 36, 176); g.stroke();
      g.strokeStyle = '#efe8d4'; g.lineWidth = 6; g.beginPath(); g.moveTo(48, 112); g.quadraticCurveTo(22, 128, 30, 150); g.stroke(); });
    const l2 = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 0.9), K.matMapa(tex2, { transparent: true, depthWrite: false })); l2.position.set(0, 0.54, 0.205); losa.add(l2);
  }
  if (n >= 2) {                                    // escenas completas: el andamio para pintar alto, y la antorcha
    const and = new THREE.Group(); and.position.set(-0.55, 0, 0.62); pared.add(and);
    [-0.36, 0.36].forEach(x => { const p = K.malla(K.cilindro(0.03, 0.034, 1.7, 5), '#8a6a44', { grosor: 0.01 }); p.position.set(x, 0.85, 0); and.add(p); });
    [0.45, 0.95, 1.45].forEach(y => { const t = K.malla(K.cilindro(0.022, 0.022, 0.8, 5), '#8a6a44', { grosor: 0.01 }); t.rotation.z = Math.PI / 2; t.position.y = y; and.add(t); });
    const tabla = K.malla(K.caja(0.9, 0.05, 0.32), '#b98a5e', { grosor: 0.01 }); tabla.position.y = 0.97; and.add(tabla);
    const odre = K.malla(K.esfera(0.1), '#9a6a45', { grosor: 0.01 }); odre.scale.set(0.8, 1.1, 0.7); odre.position.set(0.25, 1.1, 0.05); and.add(odre);   // el odre del pigmento, en la tabla
    const ant = new THREE.Group(); ant.position.set(0.85, 0, 0.55); pared.add(ant);
    const asta = K.malla(K.cilindro(0.025, 0.03, 1.1, 5), '#6e4d33', { grosor: 0.01 }); asta.position.y = 0.55; ant.add(asta);
    const llama = K.malla(K.cono(0.07, 0.2, 6), '#f6a23c', { emissive: '#f6a23c', emissiveIntensity: 0.9, grosor: 0.01 }); llama.position.y = 1.2; llama.userData.vivo = true; ant.add(llama);
    const ant2 = new THREE.Group(); ant2.position.set(-1.35, 0, 0.5); pared.add(ant2);   // y otra antorcha, del otro lado
    const asta2 = K.malla(K.cilindro(0.025, 0.03, 1.1, 5), '#6e4d33', { grosor: 0.01 }); asta2.position.y = 0.55; ant2.add(asta2);
    const llama2 = K.malla(K.cono(0.07, 0.2, 6), '#f6a23c', { emissive: '#f6a23c', emissiveIntensity: 0.9, grosor: 0.01 }); llama2.position.y = 1.2; llama2.userData.vivo = true; ant2.add(llama2);
    P.vivos.push(t => { llama.scale.set(1, 1 + 0.2 * Math.sin(t * 11), 1); llama2.scale.set(1, 1 + 0.2 * Math.sin(t * 10 + 1), 1); });
  }
  if (n >= 3) {                                    // el signo que vuelve: tres piedras paradas con el mismo signo
    const signo = texturaCanvas(96, 128, g => { g.fillStyle = '#b9b3a4'; g.fillRect(0, 0, 96, 128); g.strokeStyle = OCRE; g.lineWidth = 9; g.lineCap = 'round';
      g.beginPath(); g.arc(48, 48, 20, 0, 7); g.stroke(); g.beginPath(); g.moveTo(48, 72); g.lineTo(48, 110); g.moveTo(30, 92); g.lineTo(66, 92); g.stroke(); });
    [[0.95, 0.75, 0.62], [1.35, 0.35, 0.5], [0.55, 1.1, 0.55]].forEach(([dx, dy, h], i) => {
      const e = new THREE.Group(); ponerEn(P, e, A.x + dx, A.y + dy, Math.PI / 4 + (i - 1) * 0.25);
      const piedra = K.malla(K.caja(0.3, h, 0.14), '#b9b3a4', { grosor: 0.014 }); piedra.position.y = h / 2; e.add(piedra);
      const cara = new THREE.Mesh(new THREE.PlaneGeometry(0.24, h * 0.8), K.matMapa(signo)); cara.position.set(0, h / 2, 0.075); e.add(cara);
    });
  }
  const cuenco = new THREE.Group();
  const c = K.malla(K.cilindro(0.09, 0.06, 0.06, 10), '#7a5a3d', { grosor: 0.01 }); c.position.y = 0.03; cuenco.add(c);
  const o = K.malla(K.cilindro(0.08, 0.08, 0.01, 10), OCRE, { sinTinta: true }); o.position.y = 0.06; cuenco.add(o);
  ponerEn(P, cuenco, A.x + 0.55, A.y - 0.55);
  actor(P, K, { piel: 1, pelo: 'melena', vincha: OCRE, titulo: 'Okar', texto: 'el pintor de la pared', k: 'pintor', oficio: true }, 'pintar', A.x + 0.42, A.y - 1.0, { x: A.x - 0.05, y: A.y - 1.2 });
  return P;
}

/* ---------- 13 · el hueso de conteo ---------- */
function huesoTallado(K, color, muescas, cruzada) {
  const hg = new THREE.Group();
  const h = K.malla(K.capsula(0.045, 0.34), color, { grosor: 0.014 }); h.rotation.z = Math.PI / 2; hg.add(h);
  for (let i = 0; i < muescas; i++) { const m = new THREE.Mesh(K.caja(0.012, 0.02, 0.095), K.mat('#6b4a2a')); m.position.set(-0.17 + i * (0.34 / Math.max(1, muescas - 1)), 0.04, 0); hg.add(m); }
  if (cruzada) { const c = new THREE.Mesh(K.caja(0.13, 0.02, 0.014), K.mat('#6b4a2a')); c.position.set(-0.17 + 2 * 0.34 / (muescas - 1), 0.05, 0); c.rotation.y = 0.6; hg.add(c); }
  return hg;
}
function hueso(K, n, op = {}) {
  const A = ANCLAS.hueso, P = pieza(A);
  const mesa = (color, x, y, huesoColor, muescas, cruzada) => {
    const g = new THREE.Group();
    const losa = K.malla(K.roca(0.3, 90), color, { grosor: 0.02 }); losa.scale.set(1.3, 0.42, 1); losa.position.y = 0.1; g.add(losa);
    const hg = huesoTallado(K, huesoColor, muescas, cruzada); hg.position.y = 0.25; hg.rotation.y = Math.PI / 4 - 0.25; g.add(hg);
    return ponerEn(P, g, x, y);
  };
  const m = mesa(PAL.piedraL, A.x, A.y, '#efe8d4', 5 + 3 * n + (op.muescas || 0), n >= 1);
  m.userData.ficha = { titulo: 'El hueso de conteo', texto: 'cada cuenta pendiente se talla como una muesca' };
  if (n >= 1) {                                    // piedras de contar en dos hileras: 7 y 5
    const r = azar(3);
    [[7, 0], [5, 1]].forEach(([k, fila]) => { for (let i = 0; i < k; i++) { const p = K.malla(K.roca(0.045, 100 + i + fila * 9), fila ? '#a49d8c' : '#8f8a7c', { sinTinta: true }); p.position.copy(P.en(A.x + 0.1 + i * 0.1 + (r() - 0.5) * 0.02, A.y + 0.42 + fila * 0.12)); p.position.y = 0.03; P.obj.add(p); } });
  }
  if (n >= 2) mesa(PAL.piedraD, A.x + 0.55, A.y - 0.4, '#e4dcc6', 9, false);
  if (n >= 3) {                                    // el cordel de nudos
    const c = new THREE.Group();
    const e = K.malla(K.cilindro(0.025, 0.03, 0.62, 6), '#7a5636', { grosor: 0.012 }); e.position.y = 0.31; c.add(e);
    const v = K.malla(K.cilindro(0.015, 0.015, 0.4, 5), '#7a5636', { grosor: 0.01 }); v.rotation.z = Math.PI / 2; v.position.set(0.16, 0.58, 0); c.add(v);
    [0.06, 0.18, 0.3].forEach((x, i) => {
      const hilo = K.malla(K.cilindro(0.008, 0.008, 0.36, 4), '#8a6247', { sinTinta: true }); hilo.position.set(x, 0.4, 0); c.add(hilo);
      for (let k = 0; k <= i + 1; k++) { const nudo = K.malla(K.esfera(0.022), '#6e4d33', { grosor: 0.008 }); nudo.position.set(x, 0.52 - k * 0.1, 0); c.add(nudo); }
    });
    ponerEn(P, c, A.x - 0.35, A.y - 0.5, Math.PI / 4);
  }
  const asiento = K.malla(K.roca(0.13, 111), PAL.piedraD, { grosor: 0.014 }); asiento.scale.set(1.2, 0.8, 1.2); asiento.position.copy(P.en(A.x - 0.52, A.y + 0.52)); asiento.position.y = 0.08; P.obj.add(asiento);
  actor(P, K, { piel: 0, pelo: 'moño', colorPelo: '#5a3d25', collar: true, titulo: 'Vesa', texto: 'la guardiana de las muescas', k: 'cuentero', oficio: true }, 'tallar', A.x - 0.52, A.y + 0.52, A, { asiento: 0.17 });
  return P;
}

/* ---------- 15 · la cacería ---------- */
/* op.practicaEn: dónde juegan los pequeños a cazar (grilla). En el mundo va junto al campamento, lejos
   del mamut de verdad: «primero el juego; después, la presa». */
function caceria(K, n, op = {}) {
  const A = ANCLAS.caza, P = pieza(A);
  const m = op.soloEscenas ? null : crearMamut(K);
  if (m) { m.obj.scale.setScalar(0.6); m.obj.rotation.y = 2.3; P.obj.add(m.obj); }
  if (!m) { /* el mamut vive fuera de la pieza */ }
  else if (n >= 0) P.vivos.push(t => m.anim(t, false));   // acosado: se queda donde está
  else {                                             // libre: pasta alrededor de su casa, como el MAMUT_HOME del 2D
    let ang = 0, reloj = 0;
    P.vivos.push((t, dt) => {
      reloj += dt; const andando = reloj % 11 < 6; if (andando) ang += dt * 0.16;
      m.obj.position.set(Math.cos(ang) * 1.05, 0, Math.sin(ang) * 0.7);
      m.obj.rotation.y = Math.atan2(-Math.sin(ang) * 1.05, Math.cos(ang) * 0.7);
      m.anim(t, andando);
    });
  }
  const cazador = (i, pose, x, y, texto, conLanza = true) => {
    const p = actor(P, K, { piel: i % 4, pelo: ['greñas', 'corto', 'melena'][i % 3], colorRopa: '#8a6247', vincha: i % 2 ? '#8a6247' : false, titulo: 'Cazador', texto }, pose, x, y, A);
    if (conLanza) { const l = lanza(K, 1.1); l.rotation.x = Math.PI; l.position.y = -0.2; p.sostener(l); }
    p.fase = i * 1.3; return p;
  };
  if (n >= 0 && !op.soloEscenas) for (let i = 0; i < 2; i++) { const a = 2.5 + 0.75 * i; cazador(i, 'acechar', A.x + Math.cos(a) * 1.9, A.y + Math.sin(a) * 1.5, 'acecha sin espantar a la presa'); }
  if (n >= 1 && !op.soloEscenas) cazador(2, 'senal', A.x - 0.35, A.y + 1.55, 'la seña: el cerco se coordina en silencio');
  if (n >= 2) {                                    // leer el rastro: las huellas del mamut y quien las lee
    for (let k = 0; k < 6; k++) {
      const h = K.malla(K.cilindro(0.11, 0.11, 0.012, 10), '#7e6a45', { sinTinta: true, sombra: false, transparent: true, opacity: 0.55 });
      h.position.copy(P.en(A.x + 0.45 + k * 0.17 + (k % 2 ? 0.09 : -0.09), A.y + 0.95 + k * 0.26)); h.position.y = 0.006; P.obj.add(h);
    }
    cazador(3, 'rastrear', A.x + 1.35, A.y + 2.55, 'leer el rastro: qué pasó y cuándo', false).obj.rotation.y = Math.PI * 0.85;
  }
  if (n >= 3) {                                    // enseñar sin peligro: el mamut de práctica
    const f = new THREE.Group();
    [[-0.28, -0.2], [0.28, -0.2], [-0.28, 0.2], [0.28, 0.2]].forEach(([x, z]) => { const p = K.malla(K.cilindro(0.025, 0.03, 0.5, 5), '#8a6a44', { grosor: 0.01 }); p.position.set(x, 0.25, z); f.add(p); });
    const lomo = K.malla(K.esfera(0.42), '#a8845a', { grosor: 0.016 }); lomo.scale.set(0.9, 0.55, 0.62); lomo.position.y = 0.6; f.add(lomo);
    const cab = K.malla(K.esfera(0.2), '#a8845a', { grosor: 0.014 }); cab.position.set(0.45, 0.62, 0); f.add(cab);
    const trompa = K.malla(K.cilindro(0.03, 0.05, 0.35, 5), '#8a6a44', { grosor: 0.01 }); trompa.position.set(0.58, 0.45, 0); trompa.rotation.z = 0.3; f.add(trompa);
    f.userData.ficha = { titulo: 'El mamut de práctica', texto: 'primero el juego; después, la presa' };
    const pr = op.practicaEn || { x: A.x - 2.3, y: A.y + 1.0 };
    ponerEn(P, f, pr.x, pr.y, 0.3);
    [[-0.65, 0.55], [0.55, 0.7]].forEach(([dx, dy], i) => {
      const p = actor(P, K, pequeno(i + 1, { titulo: 'Aprendiz', texto: 'practica la cacería sin peligro' }), 'acechar', pr.x + dx, pr.y + dy, pr);
      const l = lanza(K, 0.7); l.rotation.x = Math.PI; l.position.y = -0.1; p.sostener(l); p.fase = i * 2.1;
    });
  }
  return P;
}

/* ---------- la cacería en el asentamiento: el curtido (etapas 1-3) ---------- */
function curtido(K, n) {
  const A = ANCLAS.curtido, P = pieza(A);
  const madera = '#8a6a44';
  const bastidor = new THREE.Group();
  [-0.35, 0.35].forEach(x => { const p = K.malla(K.cilindro(0.025, 0.03, 0.95, 5), madera, { grosor: 0.01 }); p.position.set(x, 0.47, 0); bastidor.add(p); });
  [0.18, 0.84].forEach(y => { const p = K.malla(K.cilindro(0.02, 0.02, 0.78, 5), madera, { grosor: 0.01 }); p.rotation.z = Math.PI / 2; p.position.set(0, y, 0); bastidor.add(p); });
  const cuero = K.malla(K.esfera(0.3), '#c69a66', { grosor: 0.014 }); cuero.scale.set(1.05, 1.0, 0.08); cuero.position.set(0, 0.51, 0); bastidor.add(cuero);
  bastidor.userData.ficha = { titulo: 'El bastidor', texto: 'la piel se estira y se raspa' };
  ponerEn(P, bastidor, A.x, A.y, Math.PI / 4);
  actor(P, K, { piel: 2, pelo: 'melena', colorRopa: '#9a7050', titulo: 'Orsa', texto: 'la curtidora', k: 'curtidora', oficio: true }, 'raspar', A.x + 0.5, A.y - 0.12, { x: A.x + 0.1, y: A.y + 0.1 });
  if (n >= 2) {                                    // el tendido de pieles
    const t = new THREE.Group();
    [-0.55, 0.55].forEach(x => { const p = K.malla(K.cilindro(0.025, 0.03, 0.9, 5), madera, { grosor: 0.01 }); p.position.set(x, 0.45, 0); t.add(p); });
    const soga = K.malla(K.cilindro(0.008, 0.008, 1.1, 4), '#cdb083', { sinTinta: true }); soga.rotation.z = Math.PI / 2; soga.position.y = 0.86; t.add(soga);
    ['#b98a5c', '#c69a66', '#a87a50'].forEach((c, i) => { const p = K.malla(K.caja(0.26, 0.34, 0.02), c, { grosor: 0.01 }); p.position.set(-0.32 + i * 0.32, 0.68, 0); p.rotation.z = (i - 1) * 0.08; t.add(p); });
    ponerEn(P, t, A.x - 0.4, A.y - 0.75, Math.PI / 4);
  }
  if (n >= 3) {
    const tri = new THREE.Group();                  // las lanzas en descanso
    for (let i = 0; i < 3; i++) { const l = lanza(K, 1.15); const a = i / 3 * Math.PI * 2; l.position.set(Math.cos(a) * 0.14, 0.55, Math.sin(a) * 0.14); l.rotation.set(Math.sin(a) * 0.25, 0, -Math.cos(a) * 0.25); tri.add(l); }
    ponerEn(P, tri, A.x - 0.75, A.y + 0.35);
    const tex = texturaCanvas(256, 200, (g) => {        // el plan del cerco, pintado en una piel
      g.fillStyle = '#d9b98a'; g.beginPath(); g.ellipse(128, 100, 120, 92, 0, 0, 7); g.fill();
      g.fillStyle = g.strokeStyle = '#b4552e'; g.lineWidth = 5;
      g.beginPath(); g.ellipse(128, 100, 70, 48, 0, 0, 7); g.setLineDash([4, 12]); g.stroke(); g.setLineDash([]);
      for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.beginPath(); g.arc(128 + Math.cos(a) * 70, 100 + Math.sin(a) * 48, 7, 0, 7); g.fill(); }
      g.beginPath(); g.ellipse(128, 100, 22, 13, 0, 0, 7); g.fill(); g.beginPath(); g.ellipse(106, 94, 9, 8, 0, 0, 7); g.fill();
    });
    const plan = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.48), K.matMapa(tex, { transparent: true }));
    plan.rotation.x = -Math.PI / 2; plan.position.copy(P.en(A.x + 0.1, A.y + 0.9)); plan.position.y = 0.012; plan.rotation.z = -Math.PI / 4; plan.receiveShadow = true; P.obj.add(plan);
  }
  return P;
}

/* ---------- 28 · la pesca en la orilla ---------- */
function charca(K, P) {
  const f = new THREE.Shape(), c = P.en(LAGO.x, LAGO.y);
  const RADS = [1.0, 1.14, 0.92, 1.08, 0.86, 1.12, 0.95, 1.18, 0.9, 1.05];
  for (let i = 0; i <= 50; i++) {
    const a = i / 50 * Math.PI * 2, u = (a / (Math.PI * 2)) * 10, k = Math.floor(u), fr = (1 - Math.cos(Math.PI * (u - k))) / 2;
    const r = RADS[k % 10] * (1 - fr) + RADS[(k + 1) % 10] * fr;
    const x = Math.cos(a) * LAGO.rx * r, z = Math.sin(a) * LAGO.ry * r;
    i ? f.lineTo(x, -z) : f.moveTo(x, -z);
  }
  const geo = new THREE.ShapeGeometry(f, 3); geo.rotateX(-Math.PI / 2);
  const agua = new THREE.Mesh(geo, K.mat(PAL.agua, { transparent: true, opacity: 0.88 })); agua.position.set(c.x, 0.012, c.z); agua.receiveShadow = true;
  agua.userData.ficha = { titulo: 'La laguna', texto: 'un pequeño se sienta junto a quien ya sabe' };
  P.obj.add(agua);
  return agua;
}
function pesca(K, n) {
  const A = ANCLAS.pesca, P = pieza(A);
  P.arena = true; charca(K, P);
  const lineas = [];
  const pescador = (op, pose, x, y, boya, escala = 1) => {
    const p = actor(P, K, op, pose, x, y, { x: LAGO.x, y: LAGO.y });
    const c = cana(K); c.scale.setScalar(escala); c.rotation.x = Math.PI - 0.9; c.position.y = -0.02; p.sostener(c);
    const punta = new THREE.Object3D(); punta.position.y = 0.85; c.add(punta);
    const flot = K.malla(K.esfera(0.035), '#c94f43', { grosor: 0.01 }); flot.userData.vivo = true; flot.position.copy(P.en(boya.x, boya.y)); flot.position.y = 0.03; P.obj.add(flot);
    const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);
    const linea = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: '#f4f8fb', transparent: true, opacity: 0.8 })); P.obj.add(linea);
    lineas.push({ punta, flot, geo, y0: 0.03, f: x }); P.extrasOrilla = (P.extrasOrilla || []).concat([flot, linea]);
  };
  pescador({ piel: 2, pelo: 'corto', titulo: 'Kelo', texto: 'sabe dónde pican', k: 'pescador' }, 'pescar', A.x, A.y, { x: A.x + 0.75, y: A.y - 0.65 });
  pescador(pequeno(1, { titulo: 'Ami', texto: 'mira dónde se sienta Kelo', k: 'pescaprendiz' }), 'pescarSentado', A.x - 0.5, A.y + 0.3, { x: A.x + 0.55, y: A.y - 0.95 }, 0.72);
  const v = new THREE.Vector3();
  P.vivos.push(t => lineas.forEach(l => {
    l.flot.position.y = l.y0 + 0.012 * Math.sin(t * 2.2 + l.f);
    l.punta.getWorldPosition(v); P.obj.worldToLocal(v);
    const pos = l.geo.getAttribute('position'); pos.setXYZ(0, v.x, v.y, v.z); pos.setXYZ(1, l.flot.position.x, l.flot.position.y, l.flot.position.z); pos.needsUpdate = true;
  }));
  if (n >= 1) {                                    // el secadero con sus peces
    const s = new THREE.Group();
    [-0.5, 0.5].forEach(x => {
      const p = K.malla(K.cilindro(0.025, 0.03, 0.72, 5), '#8a6a44', { grosor: 0.01 }); p.position.set(x, 0.36, 0); s.add(p);
      [-1, 1].forEach(l => { const h = K.malla(K.cilindro(0.012, 0.015, 0.12, 4), '#8a6a44', { sinTinta: true }); h.position.set(x + l * 0.03, 0.76, 0); h.rotation.z = -l * 0.5; s.add(h); });
    });
    const trav = K.malla(K.cilindro(0.018, 0.018, 1.12, 5), '#8a6a44', { grosor: 0.01 }); trav.rotation.z = Math.PI / 2; trav.position.y = 0.72; s.add(trav);
    const trav2 = K.malla(K.cilindro(0.016, 0.016, 1.12, 5), '#8a6a44', { grosor: 0.01 }); trav2.rotation.z = Math.PI / 2; trav2.position.y = 0.46; s.add(trav2);
    for (let f = 0; f < 2; f++) for (let i = 0; i < 8; i++) {                                // dos hileras de peces
      const y0 = f ? 0.32 : 0.58, pez = K.malla(K.esfera(0.075), (i + f) % 2 ? '#9fb3bd' : '#8ea6b2', { grosor: 0.01 }); pez.scale.set(0.38, 1, 0.26); pez.position.set(-0.42 + i * 0.12, y0, 0); s.add(pez);
      const cola = K.malla(K.cono(0.035, 0.06, 3), '#8ea6b2', { sinTinta: true }); cola.position.set(-0.42 + i * 0.12, y0 - 0.09, 0); cola.rotation.x = Math.PI; s.add(cola);
    }
    // el anzuelo de hueso: la técnica vive en un objeto que se presta y se hereda (colgados de un palo aparte)
    const palo = K.malla(K.cilindro(0.02, 0.025, 0.62, 5), '#8a6a44', { grosor: 0.01 }); palo.position.set(0.72, 0.31, 0.12); s.add(palo);
    for (let i = 0; i < 3; i++) { const an = K.malla(K.toro(0.045, 0.012, Math.PI * 1.3), '#efe8d4', { grosor: 0.006 }); an.position.set(0.72, 0.5 - i * 0.12, 0.17); an.rotation.set(0, 0.4, 2.2); s.add(an); }
    s.scale.setScalar(1.15);
    s.userData.ficha = { titulo: 'El secadero', texto: 'el anzuelo de hueso ya se presta y se hereda' };
    ponerEn(P, s, A.x - 1.1, A.y + 0.9, Math.PI / 4);                                         // al sur de Ami: antes tapaba a la primera díada (QA)
  }
  if (n >= 2) {                                    // la nasa en el agua y dos cestos con pescado
    const nasa = new THREE.Group();
    const cuerpo = K.malla(K.cono(0.2, 0.62, 10), '#a8844f', { grosor: 0.012 }); cuerpo.rotation.z = Math.PI / 2; nasa.add(cuerpo);
    const boca = K.malla(K.toro(0.19, 0.025), '#8a6a3c', { grosor: 0.01 }); boca.rotation.y = Math.PI / 2; boca.position.x = -0.31; nasa.add(boca);
    [-0.1, 0.1].forEach(x => { const r = K.malla(K.toro(0.2 - (x + 0.31) * 0.3, 0.012), '#8a6a3c', { sinTinta: true }); r.rotation.y = Math.PI / 2; r.position.x = x; nasa.add(r); });
    nasa.position.y = 0.08; nasa.userData.ficha = { titulo: 'La nasa', texto: 'cada sitio de la orilla tiene su corriente' };
    nasa.scale.setScalar(1.3); ponerEn(P, nasa, A.x + 1.2, A.y - 0.3, -0.7);
    const nasa2 = nasa.clone(); ponerEn(P, nasa2, A.x + 0.7, A.y + 0.45, 0.4); nasa2.position.y = 0.1;   // la otra corriente, la otra nasa
    [[-0.35, -0.25], [0.35, 0.3], [0.05, 0.6]].forEach(([dx, dy]) => ponerEn(P, cesto(K, '#9fb3bd'), A.x + dx, A.y + dy).position.y = 0.07);
  }
  if (n >= 3) {                                    // la canoa varada
    const c = new THREE.Group();
    const casco = K.malla(K.capsula(0.2, 0.95), '#7a5636', { grosor: 0.018 }); casco.rotation.z = Math.PI / 2; casco.scale.set(0.5, 1, 1); casco.position.y = 0.1; c.add(casco);
    const hueco = K.malla(K.capsula(0.15, 0.85), '#4a3322', { sinTinta: true }); hueco.rotation.z = Math.PI / 2; hueco.scale.set(0.12, 1, 0.9); hueco.position.y = 0.19; c.add(hueco);
    const remo = new THREE.Group(); remo.position.set(0.1, 0.25, 0.28); remo.rotation.set(0.2, 0.3, 1.2); c.add(remo);
    const asta = K.malla(K.cilindro(0.015, 0.015, 0.8, 5), '#8a6a44', { grosor: 0.01 }); remo.add(asta);
    const pala = K.malla(K.caja(0.12, 0.26, 0.02), '#8a6a44', { grosor: 0.01 }); pala.position.y = -0.45; remo.add(pala);
    c.userData.ficha = { titulo: 'La canoa', texto: 'el que aprendió, hace sitio' };
    // y el muelle: tablones sobre estacas, un sitio más en el agua para quien viene detrás
    const mu = new THREE.Group(); mu.userData.ficha = { titulo: 'El muelle', texto: 'un sitio más en el agua' };
    for (let k = 0; k < 4; k++) { const t = K.malla(K.caja(0.2, 0.04, 0.62), '#a07a4e', { grosor: 0.01 }); t.position.set(k * 0.22, 0.12, 0); mu.add(t); }
    [[-0.05, -0.28], [-0.05, 0.28], [0.7, -0.28], [0.7, 0.28]].forEach(([x, z]) => { const e = K.malla(K.cilindro(0.03, 0.035, 0.34, 5), '#7a5636', { grosor: 0.01 }); e.position.set(x, 0.05, z); mu.add(e); });
    ponerEn(P, mu, A.x + 0.95, A.y - 1.05, -0.9);
    ponerEn(P, c, A.x + 2.5, A.y + 0.1, -0.35);
  }
  return P;
}

/* ---------- 24 · la siembra ---------- */
function siembra(K, n) {
  const A = ANCLAS.siembra, P = pieza(A);
  const x0 = 3.6, y0 = 10.2, x1 = 5.7 + 0.14 * n, y1 = 12.1 + 0.11 * n, w = x1 - x0, d = y1 - y0;
  const c = P.en((x0 + x1) / 2, (y0 + y1) / 2);
  const tierra = K.malla(K.caja(w, 0.04, d), '#a58350', { grosor: 0.02, sombra: false }); tierra.position.set(c.x, 0.02, c.z); P.obj.add(tierra);
  tierra.userData.ficha = { titulo: 'La siembra', texto: 'la primera recompensa diferida' };
  const surcos = 4 + n;
  for (let i = 0; i < surcos; i++) {
    const s = K.malla(K.caja(w * 0.94, 0.05, 0.06), '#8a6842', { sinTinta: true }); s.position.set(c.x, 0.05, c.z - d / 2 + (i + 0.5) * d / surcos); P.obj.add(s);
  }
  const lado = 4 + n, tot = lado * lado, r = azar(24);
  const tallos = K.instancias(K.cilindro(0.012, 0.016, 0.32, 4), '#ffffff', tot, { sinTinta: true });
  const espigas = K.instancias(K.esfera(0.035), '#ffffff', tot, { sinTinta: true });
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3(), col = new THREE.Color(), verde = new THREE.Color('#7da24e'), oro = new THREE.Color('#c9a84a');
  const grano = n >= 2 ? 1.35 : 1;
  for (let i = 0; i < lado; i++) for (let j = 0; j < lado; j++) {
    const k = i * lado + j, px = c.x - w / 2 + (i + 0.5) * w / lado + (r() - 0.5) * 0.05, pz = c.z - d / 2 + (j + 0.5) * d / lado + (r() - 0.5) * 0.05;
    e.set((r() - 0.5) * 0.25, 0, (r() - 0.5) * 0.25); q.setFromEuler(e);
    m4.compose(v.set(px, 0.2, pz), q, s.set(1, 1, 1)); tallos.setMatrixAt(k, m4); tallos.setColorAt(k, col.copy(verde));
    m4.compose(v.set(px + e.z * -0.2, 0.39, pz + e.x * 0.2), q, s.set(grano, 2.2 * grano, grano)); espigas.setMatrixAt(k, m4);
    espigas.setColorAt(k, col.copy(verde).lerp(oro, 0.55 + r() * 0.45));
  }
  P.obj.add(tallos, espigas);
  /* el campo madura con S.cultivo: de verde a oro, cada espiga a su ritmo */
  const tono = Array.from({ length: tot }, () => r());
  P.madurar = c => {
    for (let k = 0; k < tot; k++) espigas.setColorAt(k, col.copy(verde).lerp(oro, Math.max(0, Math.min(1, c * 1.15 - 0.15 + tono[k] * 0.2))));
    espigas.instanceColor.needsUpdate = true;
  };
  if (n >= 3) [[0.25, 0.25], [0.55, 0.1], [0.4, 0.5]].forEach(([dx, dy]) => {   // las gavillas: la tierra ya dio
    const gv = new THREE.Group();
    const haz = K.malla(K.cilindro(0.07, 0.09, 0.36, 8), '#c9a84a', { grosor: 0.012 }); haz.position.y = 0.18; gv.add(haz);
    const cima = K.malla(K.cono(0.12, 0.16, 8), '#d8b85a', { grosor: 0.012 }); cima.position.y = 0.42; gv.add(cima);
    const atado = K.malla(K.toro(0.08, 0.015), '#8a6842', { sinTinta: true }); atado.rotation.x = Math.PI / 2; atado.position.y = 0.22; gv.add(atado);
    ponerEn(P, gv, x1 + dx, y0 + dy);
  });
  const lab = actor(P, K, { piel: 1, pelo: 'melena', vincha: '#c9a84a', colorRopa: '#9a7a52', titulo: 'Iri', texto: 'la labradora', k: 'labrador', oficio: true }, 'labrar', x1 + 0.3, y1 - 0.4, { x: x0, y: (y0 + y1) / 2 });
  const az = azada(K); az.rotation.x = Math.PI; az.position.y = -0.05; lab.sostener(az);
  return P;
}

/* ---------- 25 · el corral ---------- */
function oveja(K, marca) {
  const g = new THREE.Group(), cuerpo = new THREE.Group(); g.add(cuerpo);
  [[0, 0.24, 0, 0.15], [0.09, 0.26, 0.1, 0.12], [-0.09, 0.26, 0.1, 0.12], [0.08, 0.26, -0.12, 0.12], [-0.08, 0.26, -0.12, 0.12], [0, 0.33, 0, 0.12]].forEach(([x, y, z, r]) => {
    const b = K.malla(K.esfera(r), '#efe8d4', { grosor: 0.012 }); b.position.set(x, y, z); cuerpo.add(b);
  });
  const cab = new THREE.Group(); cab.position.set(0, 0.27, 0.22); cuerpo.add(cab);
  const c = K.malla(K.esfera(0.075), '#8a7a66', { grosor: 0.01 }); c.scale.set(0.85, 0.9, 1.25); cab.add(c);
  [-1, 1].forEach(l => { const o = K.malla(K.esfera(0.035), '#8a7a66', { sinTinta: true }); o.scale.set(1.5, 0.5, 0.8); o.position.set(l * 0.08, 0.03, -0.02); cab.add(o);
    const ojo = K.malla(K.esfera(0.013), '#1e1612', { sinTinta: true, sombra: false }); ojo.position.set(l * 0.045, 0.02, 0.07); cab.add(ojo); });
  [[0.07, 0.1], [-0.07, 0.1], [0.07, -0.12], [-0.07, -0.12]].forEach(([x, z]) => { const p = K.malla(K.cilindro(0.018, 0.018, 0.16, 4), '#6e5a4a', { sinTinta: true }); p.position.set(x, 0.08, z); cuerpo.add(p); });
  if (marca) [0.6, -0.6].forEach(a => { const x = new THREE.Mesh(K.caja(0.16, 0.012, 0.03), K.mat(OCRE)); x.position.set(0, 0.45, -0.02); x.rotation.y = a; cuerpo.add(x); });
  g.userData.vivo = true; cab.userData.vivo = true; fundir(K, cuerpo);
  g.userData.ficha = { titulo: 'Oveja', texto: marca ? 'cada cabeza tiene su muesca' : 'del azar de la caza al rendimiento del cuidado' };
  return { obj: g, cab, cuerpo };
}
function corral(K, n) {
  const A = ANCLAS.corral, P = pieza(A);
  const x0 = 11.5, y0 = 10.6, x1 = 13.5 + 0.15 * n, y1 = 12.4 + 0.11 * n;
  const esq = [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  for (let s = 0; s < 4; s++) {
    const [ax, ay] = esq[s], [bx, by] = esq[(s + 1) % 4], L = Math.hypot(bx - ax, by - ay), k = Math.max(2, Math.round(L / 0.45));
    const puerta = s === 2;                          // la puerta, hacia el campamento
    for (let i = 0; i <= k; i++) {
      const u = i / k; if (puerta && u > 0.35 && u < 0.65) continue;
      const p = K.malla(K.cilindro(0.035, 0.04, 0.45, 6), PAL.maderaL, { grosor: 0.01 }); p.position.copy(P.en(ax + (bx - ax) * u, ay + (by - ay) * u)); p.position.y = 0.225; P.obj.add(p);
    }
    const tramos = puerta ? [[0, 0.35], [0.65, 1]] : [[0, 1]];
    tramos.forEach(([u0, u1]) => [0.16, 0.34].forEach(h => {
      const lx = ax + (bx - ax) * (u0 + u1) / 2, ly = ay + (by - ay) * (u0 + u1) / 2, len = L * (u1 - u0);
      const r = K.malla(K.caja(len, 0.035, 0.03), PAL.maderaD, { grosor: 0.008 }); r.position.copy(P.en(lx, ly)); r.position.y = h; r.rotation.y = -Math.atan2(by - ay, bx - ax); P.obj.add(r);
    }));
  }
  const rr = azar(25), ovejas = [];
  for (let i = 0; i < 2 + n; i++) {
    const o = oveja(K, n >= 3); const x = x0 + 0.4 + rr() * (x1 - x0 - 0.8), y = y0 + 0.4 + rr() * (y1 - y0 - 0.8);
    o.obj.position.copy(P.en(x, y)); o.obj.rotation.y = rr() * 6; P.obj.add(o.obj);
    ovejas.push({ ...o, x, y, dx: x, dy: y, espera: rr() * 3, f: i });
  }
  P.ovejas = ovejas;
  P.vivos.push((t, dt) => ovejas.forEach(o => {
    const dx = o.dx - o.x, dy = o.dy - o.y, d = Math.hypot(dx, dy);
    if (d < 0.03) { o.espera -= dt; o.cab.rotation.x = 0.5 + 0.1 * Math.sin(t * 3 + o.f); if (o.espera < 0) { o.dx = x0 + 0.4 + rr() * (x1 - x0 - 0.8); o.dy = y0 + 0.4 + rr() * (y1 - y0 - 0.8); o.espera = 2 + rr() * 4; } }
    else { const p = Math.min(d, 0.25 * dt); o.x += dx / d * p; o.y += dy / d * p; o.cab.rotation.x = 0; o.obj.rotation.y = Math.atan2(dx, dy); o.cuerpo.position.y = 0.01 * Math.abs(Math.sin(t * 8)); }
    o.obj.position.copy(P.en(o.x, o.y));
  }));
  const b = actor(P, K, { piel: 3, pelo: 'corto', colorPelo: '#2e2a26', colorRopa: '#8a7055', pielHombro: true, titulo: 'Bruk', texto: 'el pastor', k: 'pastor', oficio: true }, 'baston', 11.05, (y0 + y1) / 2 + 0.2, { x: x1, y: (y0 + y1) / 2 });
  const bs = baston(K); bs.rotation.x = Math.PI; b.sostener(bs);
  return P;
}

/* ---------- 26 · la cerámica ---------- */
function vasija(K, perfil, color, pintada) {
  const g = new THREE.Group(), seg = K.E.flat ? 10 : K.E.suave ? 28 : 18;
  const geo = new THREE.LatheGeometry(perfil.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  g.add(K.malla(geo, color, { grosor: 0.012 }));
  const top = perfil[perfil.length - 1], boca = K.malla(K.cilindro(top[0] * 0.9, top[0] * 0.9, 0.01, seg), '#5a4230', { sinTinta: true }); boca.position.y = top[1] - 0.02; g.add(boca);
  if (pintada) {
    const alto = top[1], rMed = Math.max(...perfil.map(p => p[0]));
    [0.45, 0.62].forEach(f => { const b = K.malla(K.toro(rMed * 0.98, 0.012), OCRE, { sinTinta: true }); b.rotation.x = Math.PI / 2; b.position.y = alto * f; g.add(b); });
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, z = K.malla(K.esfera(0.014), OCRE, { sinTinta: true, sombra: false }); z.position.set(Math.cos(a) * rMed, alto * (0.53 + (i % 2 ? 0.035 : -0.035)), Math.sin(a) * rMed); g.add(z); }
  }
  return g;
}
function ceramica(K, n) {
  const A = ANCLAS.ceramica, P = pieza(A), pint = n >= 2;
  const olla = [[0.001, 0], [0.1, 0.01], [0.15, 0.08], [0.16, 0.16], [0.12, 0.25], [0.09, 0.28], [0.1, 0.3]];
  const cuenco = [[0.001, 0], [0.08, 0.01], [0.13, 0.07], [0.14, 0.14], [0.13, 0.16]];
  ponerEn(P, vasija(K, olla, '#b08a55', pint), A.x + 0.25, A.y + 0.25).userData.ficha = { titulo: 'La cerámica', texto: 'el barro que sale piedra del fuego' };
  ponerEn(P, vasija(K, cuenco, '#c9a875', pint), A.x + 0.58, A.y + 0.02);
  if (n >= 1) {
    const alta = vasija(K, [[0.001, 0], [0.08, 0.01], [0.12, 0.1], [0.13, 0.22], [0.09, 0.36], [0.06, 0.42], [0.075, 0.46]], '#bb9560', pint);
    const asa = K.malla(K.toro(0.07, 0.016, Math.PI), '#a8814f', { grosor: 0.008 }); asa.position.set(0.12, 0.3, 0); asa.rotation.z = -Math.PI / 2; alta.add(asa);
    ponerEn(P, alta, A.x - 0.12, A.y + 0.48);
  }
  if (n >= 3) ponerEn(P, vasija(K, [[0.001, 0], [0.14, 0.01], [0.26, 0.15], [0.3, 0.35], [0.26, 0.55], [0.17, 0.66], [0.19, 0.7]], '#a87f4e', true), A.x - 0.62, A.y + 0.05);
  // la alfarera y la vasija que gira entre sus manos
  const nx = A.x + 0.12, ny = A.y - 0.5, fx = A.x + 0.35, fy = A.y - 0.05;   // Naia detrás, de cara a la cámara
  const fresca = vasija(K, [[0.001, 0], [0.07, 0.01], [0.1, 0.07], [0.09, 0.15], [0.07, 0.18]], '#b98457', false);
  const pie = ponerEn(P, new THREE.Group(), nx + (fx - nx) * 0.45, ny + (fy - ny) * 0.45); pie.add(fresca); pie.userData.vivo = true;
  P.vivos.push(t => { fresca.rotation.y = t * 1.2; });
  actor(P, K, { piel: 1, pelo: 'moño', colorPelo: '#3a2a1e', colorRopa: '#a07a52', titulo: 'Naia', texto: 'la alfarera', k: 'alfarero', oficio: true }, 'moldear', nx, ny, { x: fx, y: fy });
  return P;
}

/* ---------- 27 · el telar ---------- */
function tela(n, w, h) {
  return texturaCanvas(256, Math.round(256 * h / w), (g, W, H) => {
    g.fillStyle = '#d8b48f'; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(120,80,50,.18)'; g.lineWidth = 2; for (let x = 4; x < W; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    if (n >= 2) [['#b8642c', 0.3], ['#a3453a', 0.5], ['#3f5a8a', 0.7]].forEach(([c, f]) => { g.fillStyle = c; g.fillRect(0, H * f - 7, W, 14); });
    if (n >= 1) { g.fillStyle = '#7a4a2e'; g.beginPath(); for (let x = 0; x <= W; x += 24) { g.moveTo(x, H); g.lineTo(x + 12, H - 22); g.lineTo(x + 24, H); } g.fill(); }
  });
}
function telar(K, n) {
  const A = ANCLAS.telar, P = pieza(A);
  const t = new THREE.Group(); t.position.copy(P.en(A.x, A.y)); t.rotation.y = Math.PI / 4; P.obj.add(t);
  [-0.42, 0.42].forEach(x => { const p = K.malla(K.cilindro(0.04, 0.05, 1.12, 6), '#9a7a52'); p.position.set(x, 0.56, 0); t.add(p); });
  const viga = K.malla(K.cilindro(0.035, 0.035, 1.02, 6), '#9a7a52'); viga.rotation.z = Math.PI / 2; viga.position.y = 1.06; t.add(viga);
  const altos = [0.25, 0.45, 0.55, 0.62], h = altos[n], w = 0.68;
  for (let i = 0; i < 6; i++) {
    const x = -0.3 + i * 0.12, hilo = K.malla(K.cilindro(0.004, 0.004, 0.8, 3), '#efe3c8', { sinTinta: true, sombra: false }); hilo.position.set(x, 0.64, -0.005); t.add(hilo);
    const pesa = K.malla(K.cilindro(0.045, 0.045, 0.03, 10), '#9a8258', { grosor: 0.008 }); pesa.rotation.x = Math.PI / 2; pesa.position.set(x, 0.22, 0); t.add(pesa);
  }
  const paño = new THREE.Mesh(new THREE.PlaneGeometry(w, h), K.matMapa(tela(n, w, h), { side: THREE.DoubleSide }));
  paño.position.set(0, 1.04 - h / 2, 0.01); paño.castShadow = true; t.add(paño);
  t.userData.ficha = { titulo: 'El telar', texto: 'el patrón es una instrucción que se transmite' };
  if (n >= 1) {                                    // la canasta de madejas
    const c = cesto(K, '#b98a5c'); c.position.set(-0.65, 0.07, 0.25); t.add(c);
    ['#b8642c', '#3f5a8a', '#e8dcc0'].forEach((col, i) => { const m = K.malla(K.esfera(0.05), col, { grosor: 0.01 }); m.position.set(-0.69 + i * 0.05, 0.16, 0.23 + (i % 2) * 0.05); t.add(m); });
  }
  if (n >= 3) {                                    // la pieza terminada, colgada de su cuerda
    const cuerda = K.malla(K.cilindro(0.006, 0.006, 0.7, 3), '#cdb083', { sinTinta: true }); cuerda.rotation.z = Math.PI / 2; cuerda.position.set(0.8, 0.9, 0.05); t.add(cuerda);
    const vara = K.malla(K.cilindro(0.02, 0.025, 0.95, 5), '#9a7a52', { grosor: 0.01 }); vara.position.set(1.15, 0.47, 0.05); t.add(vara);
    const pieza3 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.55), K.matMapa(tela(3, 0.5, 0.55), { side: THREE.DoubleSide }));
    pieza3.position.set(0.8, 0.62, 0.06); pieza3.castShadow = true; t.add(pieza3);
  }
  ponerEn(P, tronquito(K, 0.4), A.x + 0.62, A.y - 0.12, 0.5);               // Kel al costado, sin tapar la tela
  actor(P, K, { piel: 2, pelo: 'corto', colorPelo: '#8a5a2e', colorRopa: '#b08a5c', titulo: 'Kel', texto: 'el tejedor', k: 'tejedor', oficio: true }, 'tejer', A.x + 0.62, A.y - 0.12, { x: A.x + 0.1, y: A.y + 0.15 });
  return P;
}

/* ---------- el asentamiento: las chozas y el granero ---------- */
export function choza(K) {
  const g = new THREE.Group();
  const muro = K.malla(K.cilindro(0.4, 0.43, 0.42, 14), '#b98a5c'); muro.position.y = 0.21; g.add(muro);
  const pie = K.malla(K.cilindro(0.45, 0.46, 0.06, 14), '#946c47', { sinTinta: true }); pie.position.y = 0.03; g.add(pie);
  const techo = K.malla(K.cono(0.64, 0.72, 14), '#cba64f'); techo.position.y = 0.78; g.add(techo);
  const alero = K.malla(K.toro(0.56, 0.035), '#b38d3b', { sinTinta: true }); alero.rotation.x = Math.PI / 2; alero.position.y = 0.5; g.add(alero);
  const remate = K.malla(K.cono(0.11, 0.2, 8), '#9c7a34', { grosor: 0.012 }); remate.position.y = 1.18; g.add(remate);
  const puerta = new THREE.Mesh(K.esfera(0.16), new THREE.MeshBasicMaterial({ color: '#3a2a1c' }));
  puerta.scale.set(0.9, 1.35, 0.35); puerta.position.set(0.29, 0.16, 0.29); puerta.rotation.y = Math.PI / 4; g.add(puerta);
  g.userData.ficha = { titulo: 'La choza', texto: 'el primer techo propio, fuera de la cueva' };
  return g;
}
function chozas(K) {
  const P = pieza(ANCLAS.chozas);
  [[4.7, 5.8], [5.8, 6.6], [7.6, 6.15]].forEach(([x, y], i) => { const c = choza(K); c.scale.setScalar([1, 0.9, 1.05][i]); ponerEn(P, c, x, y); P.toc.push({ x, y, k: 'choza' + i }); });
  return P;
}
export function granero(K) {
  const P = pieza(ANCLAS.granero), g = new THREE.Group();
  [[-0.3, -0.25], [0.3, -0.25], [-0.3, 0.25], [0.3, 0.25]].forEach(([x, z]) => { const p = K.malla(K.cilindro(0.06, 0.08, 0.3, 7), '#8f8a7c', { grosor: 0.01 }); p.position.set(x, 0.15, z); g.add(p); });
  const piso = K.malla(K.caja(0.82, 0.06, 0.72), '#9a7a52'); piso.position.y = 0.33; g.add(piso);
  const cuerpo = K.malla(K.caja(0.62, 0.42, 0.52), '#c49a68'); cuerpo.position.y = 0.57; g.add(cuerpo);
  const ventana = new THREE.Mesh(K.caja(0.16, 0.12, 0.02), new THREE.MeshBasicMaterial({ color: '#3a2a1c' })); ventana.position.set(0, 0.62, 0.265); g.add(ventana);
  const grano = K.malla(K.esfera(0.06), '#e4c96a', { sinTinta: true }); grano.scale.set(1.1, 0.6, 0.4); grano.position.set(0, 0.585, 0.27); g.add(grano);
  const techo = K.malla(K.cono(0.6, 0.5, 4), '#cba64f', { grosor: 0.02 }); techo.rotation.y = Math.PI / 4; techo.scale.set(1, 1, 0.85); techo.position.y = 1.03; g.add(techo);
  const remate = K.malla(K.cono(0.08, 0.14, 6), '#9c7a34', { grosor: 0.01 }); remate.position.y = 1.33; g.add(remate);
  const esc = new THREE.Group(); esc.position.set(0.22, 0, 0.5); esc.rotation.x = -0.35; g.add(esc);
  [-0.09, 0.09].forEach(x => { const r = K.malla(K.cilindro(0.015, 0.015, 0.62, 4), '#7a5c3c', { grosor: 0.008 }); r.position.set(x, 0.3, 0); esc.add(r); });
  [0.12, 0.28, 0.44].forEach(y => { const r = K.malla(K.cilindro(0.012, 0.012, 0.2, 4), '#7a5c3c', { sinTinta: true }); r.rotation.z = Math.PI / 2; r.position.set(0, y, 0); esc.add(r); });
  const gav = K.malla(K.cilindro(0.06, 0.08, 0.3, 7), '#c9a84a', { grosor: 0.01 }); gav.position.set(-0.4, 0.15, 0.45); g.add(gav);
  g.userData.ficha = { titulo: 'El granero', texto: 'el excedente, guardado del agua y los ratones' };
  ponerEn(P, g, ANCLAS.granero.x, ANCLAS.granero.y); P.toc.push({ x: ANCLAS.granero.x, y: ANCLAS.granero.y, k: 'granero' });
  return P;
}

/* ---------- el catálogo ---------- */
export { circulo, tambor, pinturas, hueso, caceria, curtido, pesca, siembra, corral, ceramica, telar, chozas, pequeno, oveja, vasija };
export const PIEZAS = [
  { id: 'circulo',  i: 10, crear: circulo },
  { id: 'tambor',   i: 11, crear: tambor },
  { id: 'pinturas', i: 12, crear: pinturas },
  { id: 'hueso',    i: 13, crear: hueso },
  { id: 'pesca',    i: 28, crear: pesca },
  { id: 'caza',     i: 15, crear: caceria },
  { id: 'siembra',  i: 24, crear: siembra },
  { id: 'corral',   i: 25, crear: corral },
  { id: 'ceramica', i: 26, crear: ceramica },
  { id: 'telar',    i: 27, crear: telar },
  { id: 'curtido',  i: 15, crear: curtido, desde: 1 },
  { id: 'chozas',   crear: chozas, unica: true },
  { id: 'granero',  crear: granero, unica: true },
];
