/* ============================================================
   santiago/monumentos
   Las piezas grandes de Santiago (Época 10, docs/era10-plan.md), en el idioma de bloques del proyecto con el color de la
   época: el adobe blanqueado, la teja colonial de greda, la piedra gris del puente y los tajamares, el verde de los álamos
   y el blanco de la cordillera.
   - El cerro Santa Lucía POR ETAPAS: la roca pelada con el fuerte Hidalgo (1816); los caminos en zigzag; las terrazas con
     sus balaustradas y árboles; el castillo y la fuente de Neptuno (la obra de Vicuña Mackenna, 1872-1874).
   - Las casas de patio de adobe y teja; la catedral de Toesca; La Moneda; el puente de Cal y Canto con sus arcos y
     tajamares; la cordillera de los Andes con sus cumbres nevadas; la diligencia de Valparaíso; la mula del arriero.
   Escala: 1 = una baldosa; una persona adulta mide ~0,9. El frente de cada pieza mira a +z.
   ============================================================ */
import * as THREE from 'three';
import { crearPersona } from '../actores.js';
import { PAL } from '../kit.js';
import { pon, caja, propia, textura, matTex } from '../agora/monumentos.js';

export const SA = {
  adobe: '#efe2c8', adobeD: '#d8c4a0', adobeL: '#f6eedc', teja: '#b85a3a', tejaD: '#94442a', madera: '#7a5232', maderaD: '#4e3220',
  piedra: '#a89a86', piedraD: '#857a68', estuco: '#efe6d4', estucoD: '#d6caae', verde: '#6f8a3a', verdeD: '#4f6a2a', roca: '#8a8478', rocaD: '#6a645a',
  nieve: '#f4f6f8', rojo: '#b8352f', azul: '#2f4f8a', oro: '#d4a93e', negro: '#2a2622', reja: '#3a3632'
};

/* ---------- las texturas ---------- */
const matRep = (K, clave, t, rx, ry) => matTex(K, clave + rx + 'x' + ry, (() => { const c = t.clone(); c.needsUpdate = true; c.repeat.set(rx, ry); c.wrapS = c.wrapT = THREE.RepeatWrapping; return c; })());
/* la teja colonial: canales de greda en hileras */
const texTeja = () => textura('sa-teja', 64, 64, (g, w, h) => {
  g.fillStyle = SA.teja; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 8) { g.fillStyle = SA.tejaD; g.fillRect(x, 0, 2, h); g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(x + 4, 0, 2, h); }
  g.fillStyle = 'rgba(0,0,0,.12)'; for (let y = 0; y < h; y += 12) g.fillRect(0, y, w, 1.5);
}, { repetir: true });
/* el muro de adobe blanqueado, con su zócalo y una ventana con reja */
const texMuro = () => textura('sa-muro', 64, 64, (g, w, h) => {
  g.fillStyle = SA.adobe; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(120,96,60,.10)'; for (let k = 0; k < 30; k++) g.fillRect((k * 23) % w, (k * 37) % h, 3, 2);
  g.fillStyle = '#c8a888'; g.fillRect(0, h - 10, w, 10);   // el zócalo
  g.fillStyle = '#3a3026'; g.fillRect(22, 18, 20, 24); g.fillStyle = SA.reja; for (let x = 24; x < 42; x += 4) g.fillRect(x, 16, 1.4, 28);   // la ventana con reja
}, { repetir: true });
const texEstuco = () => textura('sa-estuco', 64, 64, (g, w, h) => {
  g.fillStyle = SA.estuco; g.fillRect(0, 0, w, h);
  g.fillStyle = SA.estucoD; g.fillRect(0, 0, 4, h); g.fillRect(32, 0, 4, h); g.fillRect(0, h - 6, w, 6);
  for (const x of [12, 44]) { g.fillStyle = '#3a4048'; g.fillRect(x, 14, 10, 26); g.fillStyle = SA.estucoD; g.fillRect(x - 2, 10, 14, 4); }
}, { repetir: true });

/* ---------- el tejado colonial de teja, de cuatro aguas bajo ---------- */
function tejado(K, w, d, alto) {
  const g = new THREE.Group();
  const geo = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1); geo.rotateY(Math.PI / 4); geo.userData.propia = true;
  const t = K.malla(geo, matRep(K, 'sa-teja', texTeja(), 3, 3), { grosor: 0.003 }); t.scale.set(w + 0.06, alto, d + 0.06); t.position.y = alto / 2; g.add(t);
  return g;
}
/* ---------- LA CASA DE PATIO: muros gruesos de adobe, teja, el zaguán y las ventanas con reja; un tramo de la fachada continua ---------- */
export function casa(K, w, d, h = 0.26, { zaguan = true, tono = 0 } = {}) {
  const g = new THREE.Group(), base = tono % 2 ? SA.adobeD : SA.adobe;
  const cuerpo = caja(K, w, h, d, base, { grosor: 0.004 }); cuerpo.position.y = h / 2; g.add(cuerpo);
  const mf = matRep(K, 'sa-muro', texMuro(), Math.max(1, Math.round(w / 0.3)), 1);
  const fr = new THREE.Mesh(propia(new THREE.PlaneGeometry(w, h)), mf); fr.position.set(0, h / 2, d / 2 + 0.002); g.add(fr);
  const t = tejado(K, w, d, 0.12); t.position.y = h; g.add(t);
  if (zaguan) { pon(g, caja(K, 0.1, 0.17, 0.012, SA.maderaD, { sinTinta: true }), -w * 0.3, 0.085, d / 2 + 0.004); pon(g, caja(K, 0.12, 0.02, 0.014, SA.adobeD, { sinTinta: true }), -w * 0.3, 0.18, d / 2 + 0.005); }
  return g;
}

/* ---------- LA CATEDRAL: la fachada de piedra de Toesca, con su frontón, y la torre del campanario ---------- */
export function catedral(K) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.56, 0.42, 1.0, SA.piedra, { grosor: 0.004 }), 0, 0.21, 0);
  const t = tejado(K, 0.56, 1.0, 0.14); t.position.y = 0.42; g.add(t);
  pon(g, caja(K, 0.6, 0.5, 0.08, SA.piedraD, { grosor: 0.004 }), 0, 0.25, 0.52);   // la fachada
  [-0.18, 0, 0.18].forEach(x => pon(g, K.malla(K.cilindro(0.025, 0.028, 0.34, 8), SA.piedra, { grosor: 0.002 }), x, 0.17, 0.58));
  const s = new THREE.Shape(); s.moveTo(-0.3, 0); s.lineTo(0.3, 0); s.lineTo(0, 0.12); s.closePath();
  pon(g, K.malla(propia(new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false })), SA.piedra, { grosor: 0.002 }), 0, 0.5, 0.5);
  pon(g, caja(K, 0.1, 0.16, 0.012, '#3a2e22', { sinTinta: true }), 0, 0.08, 0.565);
  pon(g, caja(K, 0.16, 0.7, 0.16, SA.piedraD, { grosor: 0.003 }), 0.22, 0.35, -0.38);   // la torre del campanario
  pon(g, K.malla(K.cono(0.12, 0.2, 4), SA.tejaD, { grosor: 0.002 }), 0.22, 0.8, -0.38).rotation.y = Math.PI / 4;
  pon(g, caja(K, 0.004, 0.06, 0.03, SA.oro, { sinTinta: true }), 0.22, 0.94, -0.38);
  return g;
}
/* ---------- LA MONEDA: el palacio neoclásico de Toesca, largo y bajo, con el pórtico de columnas y el frontón ---------- */
export function moneda(K) {
  const g = new THREE.Group(), W = 0.95, D = 0.7, H = 0.32;
  pon(g, caja(K, W, H, D, SA.estuco, { grosor: 0.004 }), 0, H / 2, 0);
  const m = matRep(K, 'sa-estuco', texEstuco(), 6, 1);
  const fr = new THREE.Mesh(propia(new THREE.PlaneGeometry(W, H)), m); fr.position.set(0, H / 2, D / 2 + 0.002); g.add(fr);
  [-0.09, -0.03, 0.03, 0.09].forEach(x => pon(g, K.malla(K.cilindro(0.016, 0.018, H, 8), SA.estucoD, { grosor: 0.002 }), x, H / 2, D / 2 + 0.03));
  const s = new THREE.Shape(); s.moveTo(-0.14, 0); s.lineTo(0.14, 0); s.lineTo(0, 0.08); s.closePath();
  pon(g, K.malla(propia(new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false })), SA.estucoD, { grosor: 0.002 }), 0, H, D / 2 - 0.0);
  pon(g, caja(K, W + 0.02, 0.03, D + 0.02, SA.estucoD, { grosor: 0.002 }), 0, H + 0.015, 0);   // la balaustrada (aquí, la cornisa)
  pon(g, caja(K, 0.004, 0.14, 0.004, SA.negro, { sinTinta: true }), 0.0, H + 0.14, 0);
  pon(g, caja(K, 0.08, 0.05, 0.003, SA.azul, { sinTinta: true }), 0.04, H + 0.18, 0);   // la bandera (su cuadro azul)
  pon(g, caja(K, 0.04, 0.025, 0.004, SA.rojo, { sinTinta: true }), 0.06, H + 0.155, 0);
  return g;
}
/* ---------- EL PUENTE DE CAL Y CANTO: once arcos de piedra con sus tajamares en punta (aquí, cinco), a lo largo de z ---------- */
export function puenteCalYCanto(K, largo = 1.0) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.34, 0.06, largo, SA.piedra, { grosor: 0.004 }), 0, 0.06, 0);
  for (let k = 0; k < 5; k++) {
    const z = -largo / 2 + (k + 0.5) * largo / 5;
    pon(g, caja(K, 0.36, 0.2, 0.06, SA.piedraD, { grosor: 0.003 }), 0, -0.06, z + largo / 10);
    const tj = K.malla(K.cono(0.06, 0.2, 4), SA.piedraD, { grosor: 0.002 }); tj.rotation.z = -Math.PI / 2; tj.position.set(-0.24, -0.04, z + largo / 10); g.add(tj);   // el tajamar río arriba
  }
  [-1, 1].forEach(l => pon(g, caja(K, 0.02, 0.06, largo, SA.piedra, { grosor: 0.0015 }), l * 0.16, 0.12, 0));
  return g;
}
/* ---------- LA CORDILLERA DE LOS ANDES: cumbres de roca con su nieve; en invierno, más blancas ---------- */
export function cordillera(K, cumbres) {
  const g = new THREE.Group(), nieves = [];
  cumbres.forEach(([x, z, h, r], i) => {
    const roca = K.malla(K.cono(r, h, 6), i % 2 ? SA.roca : SA.rocaD, { grosor: 0.006 }); roca.position.set(x, h / 2 - 0.05, z); roca.rotation.y = i * 0.7; g.add(roca);
    const nv = K.malla(K.cono(r * 0.42, h * 0.42, 6), SA.nieve, { grosor: 0.004 }); nv.position.set(x, h - h * 0.21 - 0.05 + 0.005, z); nv.rotation.y = i * 0.7; g.add(nv); nieves.push({ nv, h, r });
  });
  g.userData.nevar = k => nieves.forEach(({ nv, h }) => { const s = 1 + k * 0.5; nv.scale.set(s, s, s); nv.position.y = h - h * 0.21 * s - 0.05; });   // en invierno la nieve baja
  return g;
}

/* ---------- EL CERRO SANTA LUCÍA, por etapas (0: la roca con el fuerte · 1: los caminos en zigzag · 2: las terrazas · 3: el castillo y la fuente) ---------- */
export function santaLucia(K, etapa = 3) {
  const g = new THREE.Group();
  const r1 = K.malla(K.roca(0.7, 41), SA.roca, { grosor: 0.006 }); r1.scale.set(1.0, 0.55, 0.85); r1.position.set(-0.1, 0.25, 0); g.add(r1);
  const r2 = K.malla(K.roca(0.45, 42), SA.rocaD, { grosor: 0.005 }); r2.scale.set(1, 0.9, 1); r2.position.set(0.3, 0.42, -0.15); g.add(r2);
  for (let k = 0; k < (etapa >= 2 ? 3 : 7); k++) { const a = k * 0.9; pon(g, K.malla(K.esfera(0.06, 0.4), '#7a7a4a', { sinTinta: true }), Math.cos(a) * 0.55, 0.1 + (k % 3) * 0.08, Math.sin(a) * 0.45); }   // los arbustos de la roca pelada
  const fu = new THREE.Group(); pon(g, fu, 0.3, 0.72, -0.15);   // el fuerte Hidalgo, de 1816, en la cumbre
  fu.add(pon(new THREE.Group(), caja(K, 0.22, 0.1, 0.16, SA.piedraD, { grosor: 0.002 }), 0, 0.05, 0));
  for (let k = 0; k < 4; k++) fu.add(pon(new THREE.Group(), caja(K, 0.035, 0.035, 0.035, SA.piedraD, { sinTinta: true }), -0.08 + k * 0.055, 0.115, 0.08));
  if (etapa >= 1) for (let k = 0; k < 5; k++) { const c = caja(K, 0.4, 0.015, 0.06, '#c8b898', { sinTinta: true }); c.position.set(-0.05 + (k % 2 ? 0.12 : -0.12), 0.08 + k * 0.12, 0.42 - k * 0.07); c.rotation.y = k % 2 ? 0.5 : -0.5; g.add(c); }   // los caminos en zigzag
  if (etapa >= 2) {
    [[-0.35, 0.18, 0.32], [0.1, 0.36, 0.3], [-0.2, 0.5, 0.05]].forEach(([x, y, z]) => {
      pon(g, caja(K, 0.34, 0.03, 0.18, SA.adobeL, { grosor: 0.002 }), x, y, z);
      for (let k = 0; k < 5; k++) pon(g, K.malla(K.cilindro(0.006, 0.006, 0.05, 4), SA.adobeL, { sinTinta: true }), x - 0.14 + k * 0.07, y + 0.04, z + 0.09);   // la balaustrada
      pon(g, K.malla(K.esfera(0.05, 0.5), SA.verde, { grosor: 0.002 }), x + 0.12, y + 0.08, z - 0.04);
    });
  }
  if (etapa >= 3) {
    const ca = new THREE.Group(); pon(g, ca, 0.3, 0.72, -0.15);   // el castillo Hidalgo, sobre el fuerte
    ca.add(pon(new THREE.Group(), caja(K, 0.16, 0.22, 0.14, SA.adobeL, { grosor: 0.003 }), 0, 0.2, 0));
    [-1, 1].forEach(l => ca.add(pon(new THREE.Group(), K.malla(K.cilindro(0.04, 0.04, 0.3, 8), SA.adobeL, { grosor: 0.002 }), l * 0.1, 0.22, 0.07)));
    for (let k = 0; k < 4; k++) ca.add(pon(new THREE.Group(), caja(K, 0.03, 0.03, 0.03, SA.adobeL, { sinTinta: true }), -0.06 + k * 0.04, 0.33, 0.07));
    ca.add(pon(new THREE.Group(), caja(K, 0.004, 0.12, 0.004, SA.negro, { sinTinta: true }), 0, 0.37, 0));
    ca.add(pon(new THREE.Group(), caja(K, 0.06, 0.04, 0.003, SA.rojo, { sinTinta: true }), 0.03, 0.41, 0));
    const fn = new THREE.Group(); pon(g, fn, -0.15, 0.0, 0.62);   // la terraza de Neptuno, con su fuente al pie del cerro
    fn.add(pon(new THREE.Group(), K.malla(K.cilindro(0.18, 0.2, 0.06, 14), SA.adobeL, { grosor: 0.002 }), 0, 0.03, 0));
    fn.add(pon(new THREE.Group(), K.malla(K.cilindro(0.15, 0.15, 0.01, 14), '#7aa8c0', { sinTinta: true }), 0, 0.062, 0));
    fn.add(pon(new THREE.Group(), K.malla(K.cilindro(0.03, 0.04, 0.16, 8), SA.adobeL, { grosor: 0.002 }), 0, 0.12, 0));
  }
  return g;
}

/* ---------- LA DILIGENCIA DE VALPARAÍSO: el coche con sus cuatro caballos y el cochero ---------- */
export function diligencia(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  pon(g, caja(K, 0.3, 0.2, 0.18, '#5a3a2a', { grosor: 0.003 }), 0, 0.2, 0);
  pon(g, caja(K, 0.32, 0.03, 0.2, SA.negro, { grosor: 0.002 }), 0, 0.315, 0);
  for (let k = 0; k < 3; k++) pon(g, caja(K, 0.08, 0.05, 0.08, k % 2 ? '#a8916a' : '#7a6a4a', { grosor: 0.0015 }), -0.09 + k * 0.09, 0.355, 0);   // el equipaje: cajas de pizarras y libros
  [[-0.1, -0.1], [-0.1, 0.1], [0.1, -0.1], [0.1, 0.1]].forEach(([x, z]) => pon(g, K.malla(K.toro(0.055, 0.01, Math.PI * 2, 0.5), SA.maderaD, { sinTinta: true }), x, 0.06, z * 1.0));
  for (let k = 0; k < 2; k++) [-1, 1].forEach(l => {
    const cab = new THREE.Group(); pon(g, cab, 0.32 + k * 0.2, 0, l * 0.06);
    const cu = K.malla(K.capsula(0.035, 0.1, 0.5), '#6a4a30', { grosor: 0.002 }); cu.position.set(0, 0.12, 0); cu.rotation.z = Math.PI / 2; cab.add(cu);
    const cz = K.malla(K.capsula(0.022, 0.05, 0.5), '#6a4a30', { grosor: 0.0015 }); cz.position.set(0.08, 0.17, 0); cz.rotation.z = -0.5; cab.add(cz);
    [-0.04, 0.04].forEach(x => cab.add(pon(new THREE.Group(), K.malla(K.cilindro(0.008, 0.008, 0.1, 4), '#4a3220', { sinTinta: true }), x, 0.05, 0)));
  });
  const co = crearPersona(K, { piel: 1, pelo: 'corto', colorPelo: '#3a2a1e', ropa: 'corta', colorRopa: '#8a3a2a', chal: '#d8c08a' });
  co.obj.scale.setScalar(0.32); co.obj.position.set(0.17, 0.3, 0); co.obj.rotation.y = Math.PI / 2; g.add(co.obj);
  return g;
}
/* ---------- LA MULA DEL ARRIERO, con su carga ---------- */
export function mula(K) {
  const g = new THREE.Group();
  const cu = K.malla(K.capsula(0.04, 0.12, 0.5), '#5a4a3a', { grosor: 0.002 }); cu.rotation.z = Math.PI / 2; cu.position.y = 0.13; g.add(cu);
  const ca = K.malla(K.capsula(0.025, 0.06, 0.5), '#5a4a3a', { grosor: 0.0015 }); ca.position.set(0.1, 0.18, 0); ca.rotation.z = -0.6; g.add(ca);
  [-1, 1].forEach(l => pon(g, K.malla(K.esfera(0.012, 0.3), '#5a4a3a', { sinTinta: true }), 0.12, 0.23, l * 0.015));
  [[-0.06, -0.025], [-0.06, 0.025], [0.06, -0.025], [0.06, 0.025]].forEach(([x, z]) => pon(g, K.malla(K.cilindro(0.008, 0.008, 0.1, 4), '#3a2e22', { sinTinta: true }), x, 0.05, z));
  pon(g, caja(K, 0.12, 0.06, 0.12, '#a8916a', { grosor: 0.0015 }), -0.02, 0.19, 0);   // el baúl de libros
  return g;
}

/* ============================================================
   EL REPLANTEO VISUAL (2026-10-04, docs/replanteo-visual.md: «Santiago te quedó horrible»). Las piezas nuevas, en
   variantes para la hoja juego3d/bocetos/santiago.html; la elegida se fija en VARIANTES y entra al juego sin reescribirla.
   Lo de arriba (casa, catedral, moneda, puenteCalYCanto, cordillera, santaLucia…) queda igual: es lo que hoy usa la época.
   EL CUIDADO (que los santiaguinos estén orgullosos de nosotros), con fuentes:
   - La cordillera es el telón de la ciudad: la precordillera seca y dorada con su matorral, el cordón de roca parda y
     violeta y, atrás, las cumbres nevadas con el cerro El Plomo (5 424 m), al nororiente, como se ve desde Santiago
     (grabado de 1891 del Santa Lucía con la cordillera detrás). La nieve baja en invierno.
   - El cerro Santa Lucía (el Huelén: 68 m sobre la ciudad, 6,5 ha, alargado de norte a sur): hasta 1872 «un montón de
     piedras, árido y rocoso» con las dos baterías de Marcó del Pont (1816: la Santa Lucía, luego castillo Hidalgo, y la
     Marcó, luego castillo González) y el cañonazo del mediodía desde 1825; entre 1872 y 1874 Vicuña Mackenna lo hace
     paseo: caminos de carruajes, escaleras, terrazas con jardines, estanques y fuentes, la Ermita, miradores, el castillo
     Hidalgo almenado y la muralla con su portada (litografía de la expedición naval de EE. UU., 1849-1852; maqueta del
     Museo Nacional Benjamín Vicuña Mackenna; Álbum del Santa Lucía, 1874). OJO: la terraza Neptuno con su escala doble
     es de 1903; aquí no está.
   - La catedral entre 1830 y 1880 NO tiene las dos torres (son de Cremonesi, 1898-1906): la fachada de piedra gris de
     Toesca con sus tres grandes arcos y su ático, y al lado el Sagrario con su campanario chico de cúpula y linterna
     (fotografía de Maunoury, 1860; grabado de 1872 con el palacio arzobispal). La plaza se arboló en 1859 con jardines
     y reja; al centro, el monumento de mármol a la Libertad Americana (1836); el portal de Sierra Bella al sur; el
     palacio de la Real Audiencia (Goycolea, 1804-1808) con su torre del reloj y el Cabildo al norte.
   - San Francisco: la iglesia más antigua de Chile (1586-1618, muros de piedra), la portada de piedra sillar de 1758 y la
     torre de Fermín Vivaceta (1854-1857) con su reloj de cuatro esferas; el convento con claustros de dos pisos: arcos
     de ladrillo sobre columnas toscanas abajo y galería de madera arriba, huertos y jardines. Vivaceta trabajó de niño
     de día y estudió de noche, y en 1858 construyó y enseñó en las escuelas nocturnas para obreros de la Sociedad de
     Instrucción Pública.
   - El puente de Cal y Canto (1780-1888): de ladrillo y piedra, 202 m, «once arcos» según los de la época (nueve, según
     otros), tajamares en punta y, desde los años 1830, garitas semicirculares con tiendas sobre cada pilar del lado
     poniente. «El Calicanto es demasiado puente para el Mapocho»: tres arcos nunca tocaron el agua.
   - La Moneda de Toesca (1784-1805): larga y baja, con su pórtico de columnas, la balaustrada con pináculos y sus patios
     (el de los Cañones y el de los Naranjos); casa de gobierno desde 1845, con Bulnes, el que fundó la Escuela Normal.
   - El Mercado Central (1869-1872): la nave de fierro fundida en Glasgow (Laidlaw & Sons) con su cúpula, dentro del anillo
     de ladrillo de Manuel Aldunate; lo construyó Fermín Vivaceta.
   - Las casas: adobe blanqueado con cal y zócalo pintado, muros gruesos, teja colonial de greda, el zaguán con su portón,
     ventanas con reja de fierro, corredores con pilares de madera alrededor del patio con su naranjo o su parrón; en el
     siglo XIX, casas de dos pisos con balcón corrido de madera (la Casa Colorada, 1769); afuera, quintas con corredor,
     ranchos de quincha y paja, hornos de barro, carretas y álamos.
   ============================================================ */
export const VARIANTES = { heroe: 'santalucia', segunda: 'calycanto', casas: 'patio', maqueta: 'santalucia' };

/* la paleta del replanteo: clara y cálida (la tierra dorada del valle, la cal, la teja, el verde de los álamos, el violeta
   y el blanco de la cordillera) */
export const SC = {
  cal: '#f5f0e3', calD: '#e3dac6', calS: '#cdc2a8',
  ocre: '#e6bd70', ocreD: '#c99c52', amarillo: '#f1d47e', amarilloD: '#d4b45c', celeste: '#b3d0dd', celesteD: '#8eb0c2',
  rosado: '#eab7a2', rosadoD: '#cd9582', colorado: '#b9553f', coloradoD: '#93402e', verdeAgua: '#bcd3b4', verdeAguaD: '#97b28e',
  teja: '#c0653f', tejaL: '#d47d55', tejaD: '#98462b',
  madera: '#80553a', maderaL: '#a07450', maderaD: '#523422', reja: '#2e2a27', vano: '#3a2f27',
  piedra: '#b9b0a0', piedraL: '#d0c8b8', piedraD: '#948a7a',
  andesita: '#968b80', andesitaL: '#ada397', andesitaD: '#766c62',
  ladrillo: '#bd6a45', ladrilloL: '#d0805a', ladrilloD: '#984f32',
  jardin: '#86aa52', jardinD: '#66893e', pasto: '#9cba62',
  tierra: '#e2cb93', tierraD: '#cdb07a', calle: '#ead9ad', ripio: '#d3c6aa',
  nieve: '#f7f9fb', nieveS: '#dde6ef', roca: '#a39282', rocaV: '#8f8598', rocaD: '#77697a', seco: '#dcc082', secoD: '#c6a668', matorral: '#86924f', matorralD: '#66743e',
  agua: '#86bccb', aguaD: '#62a0b4', espuma: '#eaf2f2',
  alamo: '#86a24c', alamoD: '#647f36', naranjo: '#4f7d3c', naranja: '#f2a33a', sauce: '#9cb86a', palma: '#5f8a3e',
  fierro: '#4a5a58', zinc: '#8fa0a8', zincD: '#6f7f88',
};
const ZOCALOS = ['#8c5c3c', '#5f6f7c', '#a65a3e', '#6c7c5c', '#7a5a7a'];

/* ---------- ayudantes locales ---------- */
const h3 = (x, y, z) => { const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453; return s - Math.floor(s); };
const ss01 = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
function ruido2(x, y, s = 0) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, sx = xf * xf * (3 - 2 * xf), sy = yf * yf * (3 - 2 * yf);
  const h = (i, j) => h3(xi + i, yi + j, s);
  return (h(0, 0) * (1 - sx) + h(1, 0) * sx) * (1 - sy) + (h(0, 1) * (1 - sx) + h(1, 1) * sx) * sy;
}
const fbm = (x, y, s = 0, oct = 4) => { let a = 0, f = 1, w = 0.5, t = 0; for (let i = 0; i < oct; i++) { a += w * ruido2(x * f, y * f, s + i * 13); t += w; f *= 2.03; w *= 0.5; } return a / t; };
const crestas = (x, y, s = 0, oct = 4) => { let a = 0, f = 1, w = 0.5, t = 0; for (let i = 0; i < oct; i++) { const n = 1 - Math.abs(ruido2(x * f, y * f, s + i * 7) * 2 - 1); a += w * n * n; t += w; f *= 2.1; w *= 0.5; } return a / t; };
/* pinta por cara una geometría (queda facetada: el idioma de bloques) */
function colorear(geo, fn) {
  const gg = geo.index ? geo.toNonIndexed() : geo, p = gg.getAttribute('position'), col = [], a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), k = new THREE.Color();
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
    n.subVectors(c, b).cross(a.clone().sub(b)).normalize();
    k.set(fn(n, (a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3, (a.z + b.z + c.z) / 3, i / 3));
    for (let j = 0; j < 3; j++) col.push(k.r, k.g, k.b);
  }
  gg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); gg.computeVertexNormals(); gg.userData.propia = true; return gg;
}
const mallaColor = (K, geo, o = {}) => K.malla(geo, '#ffffff', { vertexColors: true, ...o });
/* una geometría de triángulos a mano: tris = [[x,y,z],…] de a tres; uv opcional en coordenadas de mundo */
function geoTris(tris, uvs) {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat(), 3));
  if (uvs) g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs.flat(), 2));
  g.computeVertexNormals(); g.userData.propia = true; return g;
}
const tejaMat = K => matTex(K, 'sc-teja', textura('sc-teja', 64, 64, (g, w, h) => {
  g.fillStyle = SC.teja; g.fillRect(0, 0, w, h);
  for (let x = 0; x < w; x += 8) { g.fillStyle = SC.tejaD; g.fillRect(x, 0, 2.5, h); g.fillStyle = SC.tejaL; g.fillRect(x + 4, 0, 2.5, h); }
  g.fillStyle = 'rgba(80,30,10,.22)'; for (let y = 0; y < h; y += 16) g.fillRect(0, y, w, 2);
  g.fillStyle = 'rgba(255,240,220,.10)'; for (let k = 0; k < 18; k++) g.fillRect((k * 37) % w, (k * 23) % h, 3, 5);
}, { repetir: true }));
/* EL TECHO DE TEJA: 'dos' aguas (el caballete a lo largo de x) o 'cuatro' aguas; las tejas bajan por la pendiente
   (uv en metros de mundo: una canal cada ~0,1) */
function techo(K, w, d, alto, { tipo = 'dos', vuelo = 0.06, mat = null } = {}) {
  const W = w / 2 + vuelo, D = d / 2 + vuelo, tris = [], uvs = [], U = 1.25;
  const quad = (a, b, c, e, ua, ub, uc, ue) => { tris.push(a, b, c, a, c, e); uvs.push(ua, ub, uc, ua, uc, ue); };
  const tri = (a, b, c, ua, ub, uc) => { tris.push(a, b, c); uvs.push(ua, ub, uc); };
  const lad = Math.hypot(D, alto) * U;
  if (tipo === 'dos') {
    quad([-W, 0, D], [W, 0, D], [W, alto, 0], [-W, alto, 0], [-W * U, 0], [W * U, 0], [W * U, lad], [-W * U, lad]);
    quad([W, 0, -D], [-W, 0, -D], [-W, alto, 0], [W, alto, 0], [W * U, 0], [-W * U, 0], [-W * U, lad], [W * U, lad]);
    tri([-W, 0, -D], [-W, 0, D], [-W, alto, 0], [0, 0], [0.01, 0], [0, 0.01]); tri([W, 0, D], [W, 0, -D], [W, alto, 0], [0, 0], [0.01, 0], [0, 0.01]);   // los tímpanos (en el muro)
  } else {
    const r = Math.max(0, W - D), ladx = Math.hypot(W - r, alto) * U;
    quad([-W, 0, D], [W, 0, D], [r, alto, 0], [-r, alto, 0], [-W * U, 0], [W * U, 0], [r * U, lad], [-r * U, lad]);
    quad([W, 0, -D], [-W, 0, -D], [-r, alto, 0], [r, alto, 0], [W * U, 0], [-W * U, 0], [-r * U, lad], [r * U, lad]);
    tri([W, 0, D], [W, 0, -D], [r, alto, 0], [D * U, 0], [-D * U, 0], [0, ladx]); tri([-W, 0, -D], [-W, 0, D], [-r, alto, 0], [D * U, 0], [-D * U, 0], [0, ladx]);
  }
  const geo = geoTris(tris, uvs);
  const m = K.malla(geo, mat || tejaMat(K), { grosor: 0.005 });
  const muro = new THREE.Group(); muro.add(m); return muro;
}
/* el techo de la casa de patio: un anillo de cuatro alas alrededor del patio, una agua a la calle y otra al patio; las
   esquinas quedan en limatesa y limahoya, como se ven desde el Santa Lucía */
function techoAnillo(K, w, d, t, alto, vuelo = 0.05) {
  const o = [w / 2 + vuelo, d / 2 + vuelo], m = [w / 2 - t / 2, d / 2 - t / 2], i = [w / 2 - t - vuelo, d / 2 - t - vuelo];
  const P = (q, sx, sz, y) => [sx * q[0], y, sz * q[1]], tris = [], uvs = [], U = 1.25;
  const esq = [[-1, 1], [1, 1], [1, -1], [-1, -1]];
  for (let k = 0; k < 4; k++) {
    const [ax, az] = esq[k], [bx, bz] = esq[(k + 1) % 4];
    const oa = P(o, ax, az, 0), ob = P(o, bx, bz, 0), ma = P(m, ax, az, alto), mb = P(m, bx, bz, alto), ia = P(i, ax, az, 0), ib = P(i, bx, bz, 0);
    const uvq = (p) => [(p[0] + p[2]) * U, Math.hypot(p[0], p[2]) * U * 0.5 + p[1] * U];
    tris.push(oa, ob, mb, oa, mb, ma); uvs.push(uvq(oa), uvq(ob), uvq(mb), uvq(oa), uvq(mb), uvq(ma));      // el agua a la calle
    tris.push(ma, mb, ib, ma, ib, ia); uvs.push(uvq(ma), uvq(mb), uvq(ib), uvq(ma), uvq(ib), uvq(ia));      // el agua al patio
  }
  // las tejas siguen la pendiente: se rehacen las uv por ala (u a lo largo del alero, v por la pendiente)
  const pos = tris, uv2 = [];
  for (let k = 0; k < pos.length; k += 6) {
    const a = pos[k], b = pos[k + 1], dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L;
    for (let j = 0; j < 6; j++) { const p = pos[k + j]; uv2.push([(p[0] * ux + p[2] * uz) * U, (Math.abs(p[0] * uz - p[2] * ux) * -1 + p[1] * 1.6) * U]); }
  }
  return K.malla(geoTris(tris, uv2), tejaMat(K), { grosor: 0.005 });
}
/* una pared con n arcos (arcada, puente): rectángulo con agujeros de medio punto, extruido `prof` hacia −z; el origen es
   el pie, al centro. vanos: [x0, ancho, altoImposta] */
function paredArcos(K, w, h, prof, vanos, color, o = {}) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(w / 2, h); s.lineTo(-w / 2, h); s.closePath();
  for (const [x, a, y] of vanos) { const p = new THREE.Path(); p.moveTo(x - a / 2, 0.0001); p.lineTo(x - a / 2, y); p.absarc(x, y, a / 2, Math.PI, 0, true); p.lineTo(x + a / 2, 0.0001); p.closePath(); s.holes.push(p); }
  const geo = new THREE.ExtrudeGeometry(s, { depth: prof, bevelEnabled: false, curveSegments: 7 }); geo.translate(0, 0, -prof / 2); geo.userData.propia = true;
  return K.malla(geo, color, { grosor: 0.004, ...o });
}
/* una cinta (camino, rampa, pretil) que sigue una polilínea de puntos [x, y, z], de `ancho` horizontal */
function cinta(K, pts, ancho, color, o = {}) {
  const tris = [];
  const borde = i => { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1; return [-dz / L * ancho / 2, dx / L * ancho / 2]; };
  for (let i = 0; i < pts.length - 1; i++) {
    const [nx0, nz0] = borde(i), [nx1, nz1] = borde(i + 1), p = pts[i], q = pts[i + 1];
    const a = [p[0] + nx0, p[1], p[2] + nz0], b = [p[0] - nx0, p[1], p[2] - nz0], c = [q[0] - nx1, q[1], q[2] - nz1], e = [q[0] + nx1, q[1], q[2] + nz1];
    tris.push(a, b, c, a, c, e);
  }
  const geo = geoTris(tris); const m = K.malla(geo, color, { side: THREE.DoubleSide, grosor: 0.003, ...o }); return m;
}
/* el vano con su reja de fierro saliente (la ventana de Santiago), la puerta y el zaguán */
function ventanaReja(K, g, x, y, z, w = 0.13, h = 0.19, ry = 0) {
  const v = new THREE.Group(); pon(g, v, x, y, z, ry);
  pon(v, caja(K, w, h, 0.012, SC.vano, { sinTinta: true }), 0, 0, 0.003);
  pon(v, caja(K, w + 0.04, 0.022, 0.05, SC.calS, { grosor: 0.0015 }), 0, -h / 2 - 0.011, 0.018);   // el alféizar
  const n = Math.max(3, Math.round(w / 0.03));
  for (let k = 0; k < n; k++) pon(v, caja(K, 0.007, h + 0.01, 0.007, SC.reja, { sinTinta: true }), -w / 2 + 0.012 + k * (w - 0.024) / (n - 1), 0, 0.034);
  [-1, 1].forEach(l => pon(v, caja(K, w + 0.012, 0.008, 0.04, SC.reja, { sinTinta: true }), 0, l * h * 0.38, 0.026));
  return v;
}
function porton(K, g, x, z, { w = 0.24, h = 0.36, marco = SC.piedraL, madera = SC.madera, ry = 0, arco = false } = {}) {
  const p = new THREE.Group(); pon(g, p, x, 0, z, ry);
  pon(p, caja(K, w + 0.07, h + 0.05, 0.03, marco, { grosor: 0.002 }), 0, (h + 0.05) / 2, 0.006);   // el marco de piedra o ladrillo
  [-1, 1].forEach(l => pon(p, caja(K, w / 2 - 0.006, h - 0.01, 0.02, madera, { grosor: 0.0015 }), l * w / 4, h / 2, 0.016));   // las dos hojas
  [-1, 1].forEach(l => { for (let k = 0; k < 3; k++) pon(p, caja(K, w / 2 - 0.04, 0.012, 0.006, SC.maderaD, { sinTinta: true }), l * w / 4, 0.07 + k * (h - 0.1) / 2, 0.028); });   // los peinazos
  if (arco) { const a = K.malla(K.cilindro(w / 2 + 0.035, w / 2 + 0.035, 0.03, 12), marco, { grosor: 0.002 }); a.rotation.x = Math.PI / 2; a.scale.y = 1; a.position.set(0, h + 0.02, 0.006); p.add(a); }
  return p;
}
/* árboles del lugar: el álamo (la Alameda, las acequias), el naranjo del patio, el sauce del Mapocho, la palma chilena,
   el quillay y el espino de los cerros; y el parrón */
export function alamo(K, s = 1, color = SC.alamo) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.02 * s, 0.032 * s, 0.34 * s, 6), '#7a6a52', { grosor: 0.003 }), 0, 0.17 * s, 0);
  const c = K.malla(K.esfera(0.13 * s, 0.6), color, { grosor: 0.005 }); c.scale.set(1, 4.2, 1); c.position.y = 0.32 * s + 0.5 * s; g.add(c);
  const c2 = K.malla(K.esfera(0.1 * s, 0.5), SC.alamoD, { grosor: 0.004 }); c2.scale.set(1, 3.0, 1); c2.position.set(0.04 * s, 0.5 * s, 0.05 * s); g.add(c2);
  return g;
}
export function naranjo(K, s = 1, fruta = true) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.02 * s, 0.026 * s, 0.16 * s, 6), '#6a5238', { grosor: 0.003 }), 0, 0.08 * s, 0);
  const c = K.malla(K.esfera(0.15 * s, 0.6), SC.naranjo, { grosor: 0.005 }); c.position.y = 0.25 * s; c.scale.set(1, 0.9, 1); g.add(c);
  if (fruta) for (let k = 0; k < 7; k++) { const a = k * 2.4; pon(g, K.malla(K.esfera(0.018 * s, 0.4), SC.naranja, { sinTinta: true }), Math.cos(a) * 0.12 * s, 0.22 * s + (k % 3) * 0.05 * s, Math.sin(a) * 0.12 * s); }
  return g;
}
export function sauce(K, s = 1) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.025 * s, 0.04 * s, 0.3 * s, 6), '#6f6248', { grosor: 0.003 }), 0, 0.15 * s, 0);
  [[0, 0.42, 0, 0.2], [0.12, 0.34, 0.05, 0.15], [-0.11, 0.35, -0.04, 0.15]].forEach(([x, y, z, r]) => { const c = K.malla(K.esfera(r * s, 0.6), SC.sauce, { grosor: 0.004 }); c.position.set(x * s, y * s, z * s); c.scale.set(1, 1.15, 1); g.add(c); });
  return g;
}
export function palma(K, s = 1) {   // la palma chilena (Jubaea), de tronco grueso: las hay en los patios y en los grabados del siglo XIX
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.045 * s, 0.06 * s, 0.75 * s, 7), '#8a7a62', { grosor: 0.003 }), 0, 0.375 * s, 0);
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2, f = K.malla(K.caja(0.06 * s, 0.012 * s, 0.3 * s), k % 2 ? SC.palma : '#77a04e', { grosor: 0.002 }); f.position.set(Math.sin(a) * 0.12 * s, 0.74 * s, Math.cos(a) * 0.12 * s); f.rotation.order = 'YXZ'; f.rotation.y = a; f.rotation.x = 0.75 + (k % 3) * 0.12; g.add(f); }
  pon(g, K.malla(K.esfera(0.06 * s, 0.5), '#6a7a3a', { grosor: 0.002 }), 0, 0.77 * s, 0);
  return g;
}
export function quillay(K, s = 1, semilla = 1) {   // el árbol del matorral de los cerros (y el espino, más chico)
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.016 * s, 0.022 * s, 0.14 * s, 5), '#6a5a44', { grosor: 0.002 }), 0, 0.07 * s, 0);
  for (let k = 0; k < 3; k++) { const c = K.malla(K.esfera((0.08 + h3(k, semilla, 3) * 0.04) * s, 0.5), k % 2 ? SC.matorral : SC.matorralD, { grosor: 0.003 }); c.position.set((h3(k, semilla, 1) - 0.5) * 0.12 * s, 0.17 * s + k * 0.02 * s, (h3(k, semilla, 2) - 0.5) * 0.12 * s); c.scale.y = 0.75; g.add(c); }
  return g;
}
export function parron(K, w = 0.6, d = 0.5, h = 0.34) {   // el parrón: postes, el emparrillado y la parra
  const g = new THREE.Group();
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => pon(g, caja(K, 0.018, h, 0.018, SC.maderaD, { grosor: 0.0015 }), a * w / 2, h / 2, b * d / 2));
  for (let k = 0; k < 5; k++) pon(g, caja(K, w + 0.04, 0.008, 0.008, SC.madera, { sinTinta: true }), 0, h, -d / 2 + k * d / 4);
  for (let k = 0; k < 6; k++) { const c = K.malla(K.esfera(0.09, 0.5), k % 2 ? '#7f9e48' : '#9ab85a', { grosor: 0.003 }); c.position.set(-w / 2 + 0.08 + (k % 3) * (w - 0.16) / 2, h + 0.03, (k < 3 ? -1 : 1) * d * 0.22); c.scale.set(1.3, 0.45, 1.1); g.add(c); }
  for (let k = 0; k < 4; k++) pon(g, K.malla(K.esfera(0.02, 0.4), '#6a3a5a', { sinTinta: true }), -w / 3 + k * w / 4.5, h - 0.04, (k % 2 ? 0.1 : -0.12));   // los racimos
  return g;
}

/* ============================================================
   LA CORDILLERA DE LOS ANDES, el telón de todas las composiciones. Un relieve a lo largo de x (largo), con el pie al
   frente (z = 0) y la espalda en z = −prof: la precordillera seca y dorada con su matorral y sus quebradas, el cordón
   de roca parda y violeta y, atrás, las cumbres nevadas; El Plomo es el macizo ancho y blanco (`plomo`: dónde, de 0 a 1).
   userData.nevar(k): en invierno (k = 1) la nieve baja por las quebradas hasta la precordillera.
   Los extremos (`cortes`) se cierran como el corte de la losa, con sus estratos.
   ============================================================ */
export function andes(K, { largo = 16, prof = 3.2, alto = 6, plomo = 0.18, semilla = 7, res = 6, cortes = [true, true], seco = false, bajaFin = false } = {}) {
  const g = new THREE.Group(), nx = Math.round(largo * res), nz = Math.round(prof * res);
  const pU = plomo * largo;
  /* la altura: u a lo largo, v de 0 (el pie) a 1 (la espalda) */
  const H = (u, v) => {
    const perfil = v < 0.3 ? 0.05 * ss01(v / 0.12) + 0.17 * ss01(v / 0.3) : 0.22 + 0.78 * Math.pow(ss01((v - 0.3) / 0.62), 1.1);
    const macizo = 0.62 + 0.38 * fbm(u * 0.16 + 2, 1, semilla + 9, 3);                                   // los macizos y los portezuelos
    const cr = 0.6 + 0.4 * crestas(u * 0.26, v * 0.8 + 3, semilla) + 0.08 * (ruido2(u * 1.3, v * 3, semilla + 2) - 0.5);
    const queb = Math.pow(Math.sin(u * 0.9 + fbm(u * 0.3, 2, semilla) * 3.2) ** 2, 0.7);                // las quebradas bajan de atrás al frente
    const pl = Math.exp(-((u - pU) ** 2) / (2 * 1.4 ** 2)) * ss01((v - 0.3) / 0.5) * 0.32;              // el macizo ancho de El Plomo
    let h = alto * perfil * macizo * cr * (0.78 + 0.22 * queb) + alto * pl;
    h += (1 - ss01(v / 0.62)) * ss01(v / 0.2) * (0.85 * fbm(u * 0.5, v * 3, semilla + 5) + 0.25 * queb);  // los cerros de la precordillera
    const fin = Math.min(u, largo - u);
    return h * (bajaFin ? ss01(fin / 1.6) : 0.8 + 0.2 * ss01(fin / 1.4)) * (seco ? 0.55 : 1);
  };
  const V = [];
  for (let i = 0; i <= nx; i++) { V.push([]); for (let j = 0; j <= nz; j++) { const u = i / nx * largo, v = j / nz, z = -v * prof; V[i].push([u - largo / 2, Math.max(0, H(u, v)), z]); } }
  const tris = [];
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    const a = V[i][j], b = V[i + 1][j], c = V[i + 1][j + 1], d = V[i][j + 1];
    if ((i + j) % 2) tris.push(a, b, c, a, c, d); else tris.push(a, b, d, b, c, d);
  }
  const geo = geoTris(tris);
  const pos = geo.getAttribute('position'), col = new THREE.Float32BufferAttribute(new Float32Array(pos.count * 3), 3); geo.setAttribute('color', col);
  const datos = [];   // por cara: altura media, pendiente, u, quebrada
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), N = new THREE.Vector3();
  for (let t = 0; t < pos.count; t += 3) {
    A.fromBufferAttribute(pos, t); B.fromBufferAttribute(pos, t + 1); C.fromBufferAttribute(pos, t + 2);
    N.subVectors(B, A).cross(C.clone().sub(A)).normalize(); if (N.y < 0) N.negate();
    const u = (A.x + B.x + C.x) / 3 + largo / 2, y = (A.y + B.y + C.y) / 3, v = -(A.z + B.z + C.z) / 3 / prof;
    datos.push({ y, n: N.clone(), u, v, q: Math.pow(Math.sin(u * 0.9 + fbm(u * 0.3, 2, semilla) * 3.2) ** 2, 0.7), r: h3(Math.round(u * 1.6), Math.round(v * 5 + y * 0.8), semilla) });
  }
  const c = new THREE.Color(), c2 = new THREE.Color();
  const SECOS = ['#dcc082', '#d6b974', '#e2c98e', '#d0b26e'], ROCAS = ['#a68f7c', '#9c8878', '#8f8494', '#a28c76', '#878094'];
  const pintar = (nieve = 0) => {
    for (let k = 0; k < datos.length; k++) {
      const { y, n, u, v, q, r } = datos[k], pend = 1 - n.y, sombra = n.x * -0.5 + n.z * 0.4 < -0.18;
      const linea = alto * (0.56 - 0.24 * nieve) - (1 - q) * alto * (0.14 + 0.1 * nieve) + (r - 0.5) * 0.3 + (1 - v) * 0.8;   // la nieve baja por las quebradas
      if (!seco && y > linea) c.set(pend > 0.62 ? (sombra ? SC.rocaD : SC.rocaV) : sombra ? SC.nieveS : SC.nieve);                 // la nieve; los farallones muy parados quedan de roca
      else if (y > 1.3 || pend > 0.62) { c.set(ROCAS[Math.floor(r * ROCAS.length)]); c.lerp(c2.set('#8a88a8'), ss01((y - 1.5) / (alto * 0.6)) * 0.35); if (sombra) c.lerp(c2.set('#6e6478'), 0.3); if (y > linea - 0.4 && !seco) c.lerp(c2.set(SC.nieveS), 0.3); }   // el cordón de roca
      else { c.set(SECOS[Math.floor(r * SECOS.length)]); const mat = ruido2(u * 2.2, v * 9, semilla + 3); if (mat > 0.58 && pend < 0.45) c.lerp(c2.set(SC.matorral), 0.55 + 0.3 * (mat - 0.58)); if (y > 0.8) c.lerp(c2.set('#b8a07a'), (y - 0.8) / 0.45 * 0.6); if (nieve > 0.5 && y > 1.0) c.lerp(c2.set(SC.nieve), 0.45 * (nieve - 0.5) / 0.5); }   // la precordillera: pasto seco, espino y quillay
      for (let j = 0; j < 3; j++) col.setXYZ(k * 3 + j, c.r, c.g, c.b);
    }
    col.needsUpdate = true;
  };
  pintar(0);
  const m = mallaColor(K, geo, { grosor: 0.012 }); m.userData.vivo = true; g.add(m);
  /* la espalda y los extremos: el corte de la losa con sus estratos (como las otras épocas) */
  const corte = (pts, fijo) => {
    const t2 = [], cs = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [a, ya] = pts[i], [b, yb] = pts[i + 1], P = (s, y) => fijo(s, y);
      const capas = [[Math.min(ya, yb), 0, null], [0, -0.1, '#c4ae88'], [-0.1, -0.46, PAL.corte1], [-0.46, -1.05, PAL.corte2]];
      t2.push(P(a, ya), P(b, yb), P(b, 0), P(a, ya), P(b, 0), P(a, 0)); const k = h3(Math.round(a * 3), 1, semilla);
      const cr = new THREE.Color(k > 0.5 ? '#9c8a7a' : '#8c7e84'); for (let j = 0; j < 6; j++) cs.push(cr.r, cr.g, cr.b);
      for (const [y0, y1, cc] of capas.slice(1)) { t2.push(P(a, y0), P(b, y0), P(b, y1), P(a, y0), P(b, y1), P(a, y1)); const cr2 = new THREE.Color(cc); for (let j = 0; j < 6; j++) cs.push(cr2.r, cr2.g, cr2.b); }
    }
    const gc = geoTris(t2); gc.setAttribute('color', new THREE.Float32BufferAttribute(cs, 3));
    return K.malla(gc, K.mat('#ffffff', { vertexColors: true, side: THREE.DoubleSide }), { sinTinta: true, sombra: false });
  };
  if (cortes[1]) g.add(corte(V[nx].map(p => [p[2], p[1]]), (s, y) => [largo / 2, y, s]));
  if (cortes[0]) g.add(corte(V[0].map(p => [p[2], p[1]]), (s, y) => [-largo / 2, y, s]));
  g.add(corte(V.map(col => [col[nz][0], col[nz][1]]), (s, y) => [s, y, -prof]));
  g.userData.nevar = k => pintar(Math.max(0, Math.min(1, k)));
  g.userData.alto = H;
  g.userData.ficha = { titulo: 'La cordillera de los Andes', texto: 'el telón de Santiago: la precordillera seca, el cordón de roca y, atrás, El Plomo y sus nieves' };
  return g;
}

/* ---------- detalles que se repiten: la bandera de 1817, el cañón, las almenas ---------- */
export function bandera(K, s = 1) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.006 * s, 0.008 * s, 0.5 * s, 5), SC.reja, { sinTinta: true }), 0, 0.25 * s, 0);
  const t = textura('sc-bandera', 48, 32, (c, w, h) => { c.fillStyle = '#d52b1e'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h / 2); c.fillStyle = '#0039a6'; c.fillRect(0, 0, h / 2, h / 2);
    c.fillStyle = '#ffffff'; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 2.4 : 6, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(h / 4 + Math.cos(a) * r, h / 4 + Math.sin(a) * r); } c.fill(); });
  const f = new THREE.Mesh(propia(new THREE.PlaneGeometry(0.2 * s, 0.13 * s)), K.matMapa(t, { side: THREE.DoubleSide })); f.position.set(0.1 * s, 0.43 * s, 0); f.castShadow = true; g.add(f);
  return g;
}
function canon(K, s = 1) {
  const g = new THREE.Group();
  [-1, 1].forEach(l => pon(g, K.malla(K.cilindro(0.035 * s, 0.035 * s, 0.012 * s, 8), SC.maderaD, { sinTinta: true }), 0, 0.035 * s, l * 0.04 * s).rotation.x = Math.PI / 2);
  const tubo = K.malla(K.cilindro(0.016 * s, 0.022 * s, 0.17 * s, 8), '#3a3a38', { grosor: 0.002 }); tubo.rotation.z = Math.PI / 2 - 0.15; tubo.position.set(0.03 * s, 0.06 * s, 0); g.add(tubo);
  return g;
}
/* las almenas sobre un muro recto de largo L (a lo largo de x) */
function almenas(K, g, L, y, z, color, { paso = 0.09, a = 0.045, h = 0.045, prof = 0.05 } = {}) {
  const n = Math.max(2, Math.floor(L / paso));
  for (let k = 0; k <= n; k++) if (k % 2 === 0) pon(g, caja(K, a, h, prof, color, { grosor: 0.0015 }), -L / 2 + k * L / n, y + h / 2, z);
}

/* ============================================================
   EL HÉROE · A: EL CERRO SANTA LUCÍA, por etapas. El Huelén alargado de norte (−x) a sur (+x); el poniente (+z) mira a
   la ciudad. Se arma en capas de roca (el faldeo de pedreros, dos cuerpos de farallones y las dos cumbres), como curvas
   de nivel: así las terrazas de Vicuña Mackenna salen solas.
   0 · hasta 1872: la roca pelada con espinos, las dos baterías de 1816 (la de Santa Lucía al norte, la de Marcó al sur),
       el polvorín y el cañón del mediodía (desde 1825).
   1 · 1872: los caminos de carruajes que suben dando vueltas, la escalera del poniente y las primeras plantaciones.
   2 · 1873: las terrazas con balaustradas y jardines, los árboles, la Ermita y el estanque al pie.
   3 · 1874: el castillo Hidalgo almenado, el mirador de la cumbre, la muralla con sus torreones y la portada, la fuente
       y el paseo lleno de árboles y de gente.
   Huella 4,9 × 3,7; alto 2,4 la roca y ~2,9 con el castillo.
   ============================================================ */
const CAPAS_SL = [
  { rx: 2.05, rz: 1.45, cx: -0.05, cz: -0.05, y0: 0.4, y1: 1.02, s: 11 },
  { rx: 1.55, rz: 1.02, cx: -0.25, cz: -0.15, y0: 1.02, y1: 1.62, s: 12 },
  { rx: 0.64, rz: 0.52, cx: -1.05, cz: -0.12, y0: 1.62, y1: 2.12, s: 13 },   // la cumbre norte: la batería de Santa Lucía, luego el castillo Hidalgo
  { rx: 0.74, rz: 0.58, cx: 0.32, cz: -0.22, y0: 1.62, y1: 2.38, s: 14 },    // la cumbre del sur, la más alta
];
function contorno(rx, rz, cx, cz, s, n = 44, amp = 0.12) {
  const out = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, r = 1 + amp * (fbm(Math.cos(a) * 1.7 + 5, Math.sin(a) * 1.7 + 5, s) * 2 - 1) + 0.04 * (h3(i, s, 1) - 0.5); out.push([cx + Math.cos(a) * rx * r, cz + Math.sin(a) * rz * r]); }
  return out;
}
const formaDe = pts => { const s = new THREE.Shape(); pts.forEach(([x, z], i) => i ? s.lineTo(x, -z) : s.moveTo(x, -z)); s.closePath(); return s; };
const offset = (pts, d) => pts.map(([x, z], i) => { const [ax, az] = pts[(i - 1 + pts.length) % pts.length], [bx, bz] = pts[(i + 1) % pts.length], tx = bx - ax, tz = bz - az, L = Math.hypot(tx, tz) || 1; return [x + tz / L * d, z - tx / L * d]; });
function capaRoca(K, c, etapa, i) {
  const pts = contorno(c.rx, c.rz, c.cx, c.cz, c.s), h = c.y1 - c.y0;
  const geo = new THREE.ExtrudeGeometry(formaDe(pts), { depth: h, steps: 5, bevelEnabled: false }); geo.rotateX(-Math.PI / 2);
  const p = geo.getAttribute('position');
  for (let k = 0; k < p.count; k++) {          // los farallones: vetas verticales que salen y entran; el borde de arriba queda limpio
    const x = p.getX(k), y = p.getY(k), z = p.getZ(k); if (y < 0.005 || y > h - 0.005) continue;
    const ang = Math.atan2((z - c.cz) / c.rz, (x - c.cx) / c.rx), veta = Math.round(ang * 15), fil = Math.round(y / h * 5);
    const sale = (h3(veta, 3, c.s) - 0.5) * 0.16 + (h3(veta, fil, 7) - 0.5) * 0.07 + (1 - y / h) * 0.07;
    p.setXYZ(k, x + Math.cos(ang) * sale, y, z + Math.sin(ang) * sale);
  }
  const ROC = [SC.andesita, SC.andesitaL, '#8a8076', SC.andesitaD, '#a0968a', '#9a8a7c'];
  const verde = etapa >= 2, cima = i >= 2;
  const col = colorear(geo, (n, x, y, z) => {
    if (n.y > 0.7) {
      const hh = h3(Math.round(x * 6), Math.round(z * 6), c.s);
      if (cima) return hh > 0.6 ? SC.andesitaL : '#b5aa98';
      if (verde) return hh > 0.86 ? SC.calle : hh > 0.3 ? SC.jardin : SC.jardinD;      // el jardín de la terraza, con sus senderos
      return hh > 0.7 ? '#a99c84' : hh > 0.25 ? '#bdb093' : '#cbbf9f';                 // el pedrero seco
    }
    const cc = new THREE.Color(ROC[Math.floor(h3(Math.round(Math.atan2(z - c.cz, x - c.cx) * 15), Math.round(y * 6), c.s) * ROC.length)]);
    if (n.x * 0.6 - n.z * 0.4 > 0.35) cc.multiplyScalar(0.84);
    return '#' + cc.getHexString();
  });
  const m = mallaColor(K, col, { grosor: 0.01 }); m.position.y = c.y0 - 0.004;
  return { m, pts };
}
/* el faldeo: el talud de pedreros y monte bajo del pie */
function faldeo(K, etapa) {
  const pts = contorno(2.25, 1.62, 0, 0, 10, 48, 0.1);
  const geo = new THREE.ExtrudeGeometry(formaDe(pts), { depth: 0.01, bevelEnabled: true, bevelThickness: 0.4, bevelSize: 0.22, bevelSegments: 1 }); geo.rotateX(-Math.PI / 2);
  const col = colorear(geo, (n, x, y, z) => {
    if (n.y < -0.5) return SC.tierraD;
    const hh = h3(Math.round(x * 5), Math.round(z * 5), 4);
    if (etapa >= 2) return hh > 0.55 ? SC.jardin : hh > 0.25 ? SC.jardinD : '#a7b46a';
    return hh > 0.7 ? SC.matorral : hh > 0.4 ? '#c8b78e' : '#b8a882';
  });
  return { m: mallaColor(K, col, { grosor: 0.01 }), pts };
}
/* el camino que sube rodeando una capa: de la terraza de abajo (y0) a la de arriba (y1), pegado al farallón */
function subida(K, g, pts, a0, a1, y0, y1, color, conMuro = true) {
  const n = pts.length, i0 = Math.round(a0 * n), i1 = Math.round(a1 * n), out = offset(pts, 0.13), lin = [];
  for (let i = i0; i <= i1; i++) { const [x, z] = out[(i + n) % n], f = (i - i0) / Math.max(1, i1 - i0); lin.push([x, y0 + (y1 - y0) * f + 0.012, z]); }
  g.add(cinta(K, lin, 0.15, color));
  if (conMuro) {   // el muro de contención bajo el camino
    const tris = [], ext = offset(pts, 0.2);
    for (let i = i0; i < i1; i++) { const [xa, za] = ext[(i + n) % n], [xb, zb] = ext[(i + 1 + n) % n], fa = (i - i0) / (i1 - i0), fb = (i + 1 - i0) / (i1 - i0), ya = y0 + (y1 - y0) * fa, yb = y0 + (y1 - y0) * fb; tris.push([xa, ya, za], [xb, y0, zb], [xb, yb, zb], [xa, ya, za], [xa, y0, za], [xb, y0, zb]); }
    if (tris.length) g.add(K.malla(geoTris(tris), SC.piedra, { side: THREE.DoubleSide, grosor: 0.003 }));
  }
}
/* la balaustrada blanca que corre por el borde de una terraza */
function balaustrada(K, g, pts, y, { desde = 0, hasta = 1, color = SC.cal, cada = 3 } = {}) {
  const n = pts.length, i0 = Math.round(desde * n), i1 = Math.round(hasta * n), tris = [], dentro = offset(pts, -0.03);
  for (let i = i0; i < i1; i++) { const [xa, za] = dentro[(i + n) % n], [xb, zb] = dentro[(i + 1 + n) % n]; tris.push([xa, y + 0.07, za], [xb, y + 0.07, zb], [xb, y + 0.055, zb], [xa, y + 0.07, za], [xb, y + 0.055, zb], [xa, y + 0.055, za]); }
  if (tris.length) g.add(K.malla(geoTris(tris), color, { side: THREE.DoubleSide, sinTinta: true }));
  for (let i = i0; i <= i1; i += cada) { const [x, z] = dentro[(i + n) % n]; pon(g, caja(K, 0.018, 0.07, 0.018, color, { grosor: 0.0012 }), x, y + 0.035, z); }
}
function bateria(K, w, d, { color = '#c9b896', almenado = true } = {}) {   // las baterías de 1816: muro bajo de piedra y adobe con troneras
  const g = new THREE.Group();
  [[0, d / 2, w, 0.05], [0, -d / 2, w, 0.05]].forEach(([x, z, L, e]) => { pon(g, caja(K, L, 0.1, e, color, { grosor: 0.002 }), x, 0.05, z); if (almenado) almenas(K, g, L, 0.1, z, color, { paso: 0.07, a: 0.04, h: 0.035, prof: 0.05 }); });
  [-1, 1].forEach(l => { pon(g, caja(K, 0.05, 0.1, d, color, { grosor: 0.002 }), l * w / 2, 0.05, 0); });
  return g;
}
function casita(K, w, d, h, color = SC.cal) {   // una construcción chica de adobe y teja (el polvorín, la casa de la guardia)
  const g = new THREE.Group();
  pon(g, caja(K, w, h, d, color, { grosor: 0.002 }), 0, h / 2, 0);
  const t = techo(K, w, d, Math.min(w, d) * 0.32, { tipo: 'cuatro', vuelo: 0.025 }); t.position.y = h; g.add(t);
  pon(g, caja(K, 0.05, 0.08, 0.008, SC.vano, { sinTinta: true }), 0, 0.04, d / 2 + 0.003);
  return g;
}
/* el castillo Hidalgo de 1874: ladrillo almenado, el torreón redondo y el cuerpo con su puerta en ojiva */
function castilloHidalgo(K) {
  const g = new THREE.Group(), L = SC.ladrillo;
  pon(g, caja(K, 0.42, 0.26, 0.3, L, { grosor: 0.003 }), 0, 0.13, 0);
  almenas(K, g, 0.42, 0.26, 0.15, SC.ladrilloL, { paso: 0.06, a: 0.035, h: 0.04, prof: 0.035 }); almenas(K, g, 0.42, 0.26, -0.15, SC.ladrilloL, { paso: 0.06, a: 0.035, h: 0.04, prof: 0.035 });
  const tr = K.malla(K.cilindro(0.1, 0.11, 0.44, 12), L, { grosor: 0.003 }); tr.position.set(-0.2, 0.22, 0.1); g.add(tr);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; pon(g, caja(K, 0.04, 0.045, 0.03, SC.ladrilloL, { grosor: 0.0012 }), -0.2 + Math.cos(a) * 0.1, 0.465, 0.1 + Math.sin(a) * 0.1).rotation.y = -a; }
  pon(g, K.malla(K.cilindro(0.115, 0.115, 0.03, 12), SC.ladrilloD, { grosor: 0.002 }), -0.2, 0.43, 0.1);   // la cornisa del torreón
  const t2 = K.malla(K.cilindro(0.06, 0.065, 0.36, 10), L, { grosor: 0.003 }); t2.position.set(0.2, 0.18, -0.12); g.add(t2);
  pon(g, caja(K, 0.08, 0.12, 0.01, SC.vano, { sinTinta: true }), 0.05, 0.06, 0.153);   // la puerta
  pon(g, K.malla(K.cono(0.04, 0.05, 8), SC.ladrilloD, { sinTinta: true }), 0.05, 0.13, 0.154).rotation.x = 0;
  for (let k = 0; k < 3; k++) pon(g, caja(K, 0.025, 0.05, 0.01, SC.vano, { sinTinta: true }), -0.1 + k * 0.1, 0.19, 0.153);
  const b = bandera(K, 0.8); b.position.set(-0.2, 0.47, 0.1); g.add(b);
  return g;
}
/* el mirador de la cumbre: la torrecilla con su cúpula (grabado de 1891) */
function mirador(K) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.11, 0.13, 0.06, 10), SC.piedraL, { grosor: 0.002 }), 0, 0.03, 0);
  pon(g, K.malla(K.cilindro(0.075, 0.08, 0.24, 8), SC.cal, { grosor: 0.002 }), 0, 0.18, 0);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2; pon(g, caja(K, 0.03, 0.08, 0.01, SC.vano, { sinTinta: true }), Math.cos(a) * 0.078, 0.2, Math.sin(a) * 0.078).rotation.y = -a + Math.PI / 2; }
  const cu = K.malla(K.esfera(0.085, 0.6), SC.zinc, { grosor: 0.002 }); cu.scale.y = 0.85; cu.position.y = 0.3; g.add(cu);
  pon(g, K.malla(K.cilindro(0.004, 0.004, 0.09, 4), SC.reja, { sinTinta: true }), 0, 0.42, 0);
  return g;
}
/* la Ermita (1874): la capilla gótica blanca con su aguja, donde hoy descansa Vicuña Mackenna */
function ermita(K) {
  const g = new THREE.Group();
  pon(g, caja(K, 0.16, 0.18, 0.26, SC.cal, { grosor: 0.002 }), 0, 0.09, 0);
  const t = techo(K, 0.26, 0.16, 0.1, { tipo: 'dos', vuelo: 0.01, mat: K.mat(SC.zincD) }); t.rotation.y = Math.PI / 2; t.position.y = 0.18; g.add(t);
  pon(g, caja(K, 0.09, 0.12, 0.09, SC.cal, { grosor: 0.002 }), 0, 0.3, 0.1);
  pon(g, K.malla(K.cono(0.07, 0.2, 4), SC.zincD, { grosor: 0.002 }), 0, 0.46, 0.1).rotation.y = Math.PI / 4;
  pon(g, caja(K, 0.04, 0.08, 0.008, SC.vano, { sinTinta: true }), 0, 0.04, 0.132);
  pon(g, K.malla(K.cono(0.025, 0.04, 6), SC.vano, { sinTinta: true }), 0, 0.1, 0.132);
  return g;
}
/* el estanque con su fuente, al pie del cerro */
function estanque(K, r = 0.32) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(r, r + 0.03, 0.06, 18), SC.piedraL, { grosor: 0.002 }), 0, 0.03, 0);
  pon(g, K.malla(K.cilindro(r - 0.03, r - 0.03, 0.012, 18), SC.agua, { sinTinta: true }), 0, 0.056, 0);
  pon(g, K.malla(K.cilindro(0.03, 0.05, 0.12, 8), SC.piedraL, { grosor: 0.0015 }), 0, 0.1, 0);
  pon(g, K.malla(K.cilindro(0.09, 0.05, 0.03, 10), SC.piedraL, { grosor: 0.0015 }), 0, 0.17, 0);
  pon(g, K.malla(K.esfera(0.035, 0.5), SC.espuma, { sinTinta: true }), 0, 0.21, 0);
  return g;
}
function arbolPaseo(K, s, i) {   // los árboles del paseo: acacias, pimientos, cipreses y alguna palma
  if (i % 7 === 3) return palma(K, s * 0.8);
  if (i % 4 === 1) { const g = new THREE.Group(); pon(g, K.malla(K.cilindro(0.015 * s, 0.02 * s, 0.1 * s, 5), '#6a5a44', { sinTinta: true }), 0, 0.05 * s, 0); const c = K.malla(K.esfera(0.07 * s, 0.6), '#4f7040', { grosor: 0.003 }); c.scale.y = 3; c.position.y = 0.27 * s; g.add(c); return g; }
  const g = new THREE.Group(); pon(g, K.malla(K.cilindro(0.016 * s, 0.022 * s, 0.14 * s, 5), '#6a5a44', { sinTinta: true }), 0, 0.07 * s, 0);
  const c = K.malla(K.esfera(0.13 * s, 0.6), i % 3 ? SC.jardinD : '#7a9a48', { grosor: 0.004 }); c.position.y = 0.2 * s; c.scale.y = 0.85; g.add(c); return g;
}
export function cerroSantaLucia(K, etapa = 3) {
  const g = new THREE.Group();
  const fa = faldeo(K, etapa); g.add(fa.m);
  const capas = CAPAS_SL.map((c, i) => { const r = capaRoca(K, c, etapa, i); g.add(r.m); return r; });
  /* los peñascos: en la orilla de cada terraza y en las cumbres (el Santa Lucía sigue siendo roca aunque sea paseo) */
  const penasco = (s, sem, color) => { const geo = new THREE.IcosahedronGeometry(1, 0), p = geo.getAttribute('position');
    for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k), z = p.getZ(k), j = 0.75 + 0.5 * h3(Math.round(x * 9), Math.round(y * 9) + sem, Math.round(z * 9)); p.setXYZ(k, x * j * s, y * j * s * 1.25, z * j * s); }
    const c0 = new THREE.Color(color); return mallaColor(K, colorear(geo, (n) => '#' + c0.clone().multiplyScalar(n.y > 0.5 ? 1.08 : n.x - n.z > 0.3 ? 0.82 : 0.95).getHexString()), { grosor: 0.004 }); };
  CAPAS_SL.forEach((c, i) => {
    const pts = capas[i].pts, n = pts.length, cuantos = i >= 2 ? 9 : 11;
    for (let k = 0; k < cuantos; k++) {
      const [x, z] = pts[Math.floor(h3(k, i, 5) * n)], s = 0.08 + h3(k, i, 6) * (i >= 2 ? 0.14 : 0.1);
      const r = penasco(s * 0.8, 30 + i * 10 + k, h3(k, i, 8) > 0.5 ? SC.andesita : SC.andesitaL); r.scale.y = 0.8 + h3(k, i, 9) * 0.7; r.position.set(x * 0.95 + c.cx * 0.05, c.y1 + s * 0.2, z * 0.95 + c.cz * 0.05); r.rotation.y = k; g.add(r);
    }
  });
  [[-1.25, 2.14, -0.3, 0.14], [0.3, 2.42, -0.35, 0.18], [0.62, 2.36, -0.12, 0.13], [0.05, 2.36, -0.5, 0.12]].forEach(([x, y, z, s], k) => { const r = penasco(s, 60 + k, SC.andesitaL); r.position.set(x, y, z); g.add(r); });
  const T = CAPAS_SL.map(c => c.y1);   // las alturas de las terrazas
  /* 0 · la roca pelada: espinos, la senda de cabras, las dos baterías de 1816, el polvorín y el cañón del mediodía */
  if (etapa < 2) for (let k = 0; k < 22; k++) { const c = CAPAS_SL[k % 2], pts = capas[k % 2].pts, [x, z] = offset(pts, 0.12 + h3(k, 2, 2) * 0.25)[Math.floor(h3(k, 1, 1) * pts.length)]; const q = quillay(K, 0.7 + h3(k, 3, 3) * 0.4, k); q.position.set(x, c.y0 - 0.02, z); g.add(q); }
  const batN = bateria(K, 0.46, 0.34); batN.position.set(-1.05, T[2] + 0.002, -0.1); g.add(batN);
  if (etapa < 3) { const pv = casita(K, 0.2, 0.15, 0.11); pv.position.set(-1.1, T[2], -0.12); g.add(pv); const c1 = canon(K); c1.position.set(-0.92, T[2], 0.08); c1.rotation.y = -1.2; g.add(c1); }
  const batS = bateria(K, 0.4, 0.3); batS.position.set(0.95, T[1] + 0.002, 0.35); batS.rotation.y = 0.4; g.add(batS);   // la batería de Marcó, luego castillo González
  const c2 = canon(K); c2.position.set(1.0, T[1], 0.45); c2.rotation.y = -0.9; g.add(c2);
  if (etapa === 0) g.add(cinta(K, [[1.9, 0.38, 0.55], [1.4, 0.75, 0.9], [0.8, 1.02, 0.95], [0.5, 1.02, 0.7]], 0.05, '#cdbf9c'));   // la senda
  /* 1 · los caminos de carruajes y la escalera del poniente */
  if (etapa >= 1) {
    subida(K, g, capas[0].pts, 0.05, 0.38, 0.4, T[0], SC.calle);
    subida(K, g, capas[1].pts, 0.42, 0.78, T[0], T[1], SC.calle);
    subida(K, g, capas[3].pts, 0.12, 0.42, T[1], T[3] - 0.04, SC.calle);
    const es = new THREE.Group(); es.position.set(-0.5, 0, 1.38); g.add(es);   // la escalera del poniente, de piedra
    for (let k = 0; k < 9; k++) pon(es, caja(K, 0.22, 0.07, 0.06, SC.piedraL, { grosor: 0.0015 }), 0, 0.4 + k * 0.069 - 0.035 + 0.035, -k * 0.045);
    if (etapa === 1) {
      for (let k = 0; k < 14; k++) { const [x, z] = offset(capas[0].pts, -0.2)[(k * 3) % capas[0].pts.length]; const a = arbolPaseo(K, 0.55, k + 1); a.position.set(x, T[0], z); g.add(a); }
      for (let k = 0; k < 10; k++) { const [x, z] = offset(fa.pts, 0.05)[k * 4 + 2]; const a = arbolPaseo(K, 0.5, k + 2); a.position.set(x, 0.18, z); g.add(a); }
      [[1.6, 0.4, 0.9], [-0.6, T[0], 1.15]].forEach(([x, y, z], k) => { const c = carreta(K, false); c.scale.setScalar(0.8); c.position.set(x, y, z); c.rotation.y = k * 2 + 0.4; g.add(c); });   // las carretas de la obra
    }
  }
  /* 2 · las terrazas: balaustradas, jardines, árboles, la Ermita y el estanque */
  if (etapa >= 2) {
    balaustrada(K, g, capas[0].pts, T[0]); balaustrada(K, g, capas[1].pts, T[1], { desde: 0.1, hasta: 0.95 });
    const er = ermita(K); er.position.set(1.35, T[0], 0.55); er.rotation.y = 0.9; g.add(er);
    const es = estanque(K, 0.26); es.position.set(0.9, 0.4, 1.12); g.add(es);
    const lugares = [...offset(capas[0].pts, -0.22).filter((_, k) => k % 4 === 0).map(p => [p[0], T[0], p[1]]), ...offset(capas[1].pts, -0.2).filter((_, k) => k % 5 === 2).map(p => [p[0], T[1], p[1]]), ...offset(fa.pts, 0.02).filter((_, k) => k % 4 === 1).map(p => [p[0], 0.2, p[1]])];
    lugares.slice(0, etapa >= 3 ? 40 : 24).forEach(([x, y, z], k) => { if (Math.hypot(x + 1.05, z + 0.1) < 0.55 || Math.hypot(x - 0.9, z - 1.12) < 0.35) return; const a = arbolPaseo(K, 0.85 + h3(k, 4, 4) * 0.4, k); a.position.set(x, y, z); g.add(a); });
  }
  /* 3 · el castillo Hidalgo, el mirador, la muralla con sus torreones y la portada, la gente del paseo */
  if (etapa >= 3) {
    const ca = castilloHidalgo(K); ca.position.set(-1.08, T[2], -0.12); ca.rotation.y = 0.2; g.add(ca);
    const mi = mirador(K); mi.position.set(0.32, T[3] + 0.02, -0.22); g.add(mi);
    const mu = offset(fa.pts, 0.24), n = mu.length, tris = [];
    for (let i = 0; i < n; i++) { if (i > 9 && i < 15) continue; const [xa, za] = mu[i], [xb, zb] = mu[(i + 1) % n]; tris.push([xa, 0.17, za], [xb, 0.17, zb], [xb, 0, zb], [xa, 0.17, za], [xb, 0, zb], [xa, 0, za]); if (i % 2 === 0) pon(g, caja(K, 0.04, 0.04, 0.04, SC.ladrilloL, { grosor: 0.0012 }), xa, 0.19, za); }
    g.add(K.malla(geoTris(tris), SC.ladrillo, { side: THREE.DoubleSide, grosor: 0.003 }));   // la muralla del paseo, almenada
    [3, 20, 30, 40].forEach(i => { const [x, z] = mu[i]; const t = K.malla(K.cilindro(0.07, 0.075, 0.3, 10), SC.ladrillo, { grosor: 0.002 }); t.position.set(x, 0.15, z); g.add(t); pon(g, K.malla(K.cono(0.085, 0.12, 10), SC.ladrilloD, { grosor: 0.002 }), x, 0.36, z); });
    const [px, pz] = mu[12], po = new THREE.Group(); po.position.set(px, 0, pz); po.rotation.y = -0.15; g.add(po);   // la portada: dos torres almenadas y el arco
    [-1, 1].forEach(l => { pon(po, caja(K, 0.12, 0.36, 0.12, SC.ladrillo, { grosor: 0.002 }), l * 0.17, 0.18, 0); almenas(K, po, 0.12, 0.36, 0.06, SC.ladrilloL, { paso: 0.04, a: 0.025, h: 0.03, prof: 0.025 }); pon(po, caja(K, 0.12, 0.03, 0.12, SC.ladrilloD, { sinTinta: true }), l * 0.17, 0.35, 0); });
    po.add(pon(new THREE.Group(), paredArcos(K, 0.24, 0.26, 0.08, [[0, 0.14, 0.14]], SC.ladrillo), 0, 0, 0));
    for (let k = 0; k < 4; k++) pon(po, caja(K, 0.03, 0.03, 0.06, SC.ladrilloL, { grosor: 0.001 }), -0.09 + k * 0.06, 0.275, 0);
    const fu = estanque(K, 0.22); fu.position.set(-1.6, 0.0, 1.55); g.add(fu);
  }
  g.userData.ficha = { titulo: 'El cerro Santa Lucía', texto: etapa >= 2 ? 'el Huelén hecho paseo por Vicuña Mackenna (1872-1874): terrazas, jardines y el castillo Hidalgo' : 'el Huelén: la roca pelada con las baterías de 1816 y el cañón del mediodía' };
  return g;
}

/* ---------- el oficio de las fachadas: pilastras, cornisas, balaustradas, pináculos, el frontón ---------- */
function pilastras(K, g, xs, y0, h, z, color, { w = 0.05, prof = 0.03, base = true } = {}) {
  xs.forEach(x => { pon(g, caja(K, w, h, prof, color, { grosor: 0.0015 }), x, y0 + h / 2, z + prof / 2); if (base) pon(g, caja(K, w + 0.02, 0.04, prof + 0.015, color, { grosor: 0.0012 }), x, y0 + 0.02, z + prof / 2); });
}
function cornisa(K, g, w, y, z, color, { alto = 0.04, vuelo = 0.04, ry = 0, x = 0 } = {}) {
  const c = new THREE.Group(); pon(g, c, x, y, z, ry);
  pon(c, caja(K, w, alto, vuelo, color, { grosor: 0.0015 }), 0, alto / 2, vuelo / 2);
  pon(c, caja(K, w + 0.02, alto * 0.4, vuelo + 0.02, color, { grosor: 0.0012 }), 0, alto + alto * 0.2, vuelo / 2 + 0.005);
  return c;
}
function balaustre(K, g, L, y, z, color, { alto = 0.08, paso = 0.035, x = 0, ry = 0, pinaculos = 0 } = {}) {
  const b = new THREE.Group(); pon(g, b, x, y, z, ry);
  pon(b, caja(K, L, 0.016, 0.04, color, { grosor: 0.0012 }), 0, alto, 0);
  pon(b, caja(K, L, 0.012, 0.035, color, { sinTinta: true }), 0, 0.006, 0);
  for (let k = 0; k <= Math.floor(L / paso); k++) pon(b, K.malla(K.cilindro(0.007, 0.009, alto - 0.012, 5), color, { sinTinta: true }), -L / 2 + k * paso, alto / 2, 0);
  if (pinaculos) for (let k = 0; k < pinaculos; k++) { const px = pinaculos === 1 ? 0 : -L / 2 + k * L / (pinaculos - 1); pon(b, caja(K, 0.035, 0.05, 0.035, color, { grosor: 0.0012 }), px, alto + 0.03, 0); pon(b, K.malla(K.esfera(0.02, 0.4), color, { grosor: 0.001 }), px, alto + 0.075, 0); pon(b, K.malla(K.cono(0.008, 0.03, 4), color, { sinTinta: true }), px, alto + 0.105, 0); }
  return b;
}
function fronton(K, w, h, prof, color) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: prof, bevelEnabled: false }); geo.userData.propia = true;
  return K.malla(geo, color, { grosor: 0.0018 });
}
function vanoArco(K, g, x, y, z, w, h, color = SC.vano) {   // una ventana o puerta con remate de medio punto, plana sobre el muro
  pon(g, caja(K, w, h - w / 2, 0.01, color, { sinTinta: true }), x, y + (h - w / 2) / 2, z);
  const a = K.malla(K.cilindro(w / 2, w / 2, 0.01, 10, 1), color, { sinTinta: true }); a.rotation.x = Math.PI / 2; a.position.set(x, y + h - w / 2, z); g.add(a);
}
export function farol(K, alto = 0.44) {   // el farol de gas (desde 1857)
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.01, 0.016, alto, 5), SC.reja, { sinTinta: true }), 0, alto / 2, 0);
  pon(g, caja(K, 0.05, 0.065, 0.05, '#f6e3a8', { grosor: 0.0015 }), 0, alto + 0.03, 0);
  pon(g, K.malla(K.cono(0.04, 0.035, 4), SC.reja, { sinTinta: true }), 0, alto + 0.08, 0).rotation.y = Math.PI / 4;
  return g;
}
export function bancoPlaza(K, L = 0.3) {
  const g = new THREE.Group(); pon(g, caja(K, L, 0.02, 0.07, SC.madera, { grosor: 0.0015 }), 0, 0.08, 0); pon(g, caja(K, L, 0.06, 0.012, SC.madera, { grosor: 0.0012 }), 0, 0.12, -0.03);
  [-1, 1].forEach(l => pon(g, caja(K, 0.015, 0.08, 0.06, SC.reja, { sinTinta: true }), l * (L / 2 - 0.03), 0.04, 0)); return g;
}

/* ============================================================
   EL HÉROE · B: LA CATEDRAL Y LA PLAZA DE ARMAS, por etapas. La plaza al centro; al fondo (−z, el poniente) la
   catedral de Toesca con sus tres arcos, el Sagrario con su campanario chico y el palacio arzobispal; a la derecha (+x,
   el norte) el palacio de la Real Audiencia con su torre del reloj y el Cabildo; a la izquierda (el sur) el portal de
   Sierra Bella. Sin las torres de 1906.
   0 · 1821: la catedral sin terminar (los andamios, sin ático ni campanario) y la pila colonial en la plaza pelada.
   1 · 1830: la fachada terminada y el Sagrario con su campanario.
   2 · 1836-1857: el monumento a la Libertad Americana y los faroles de gas.
   3 · 1859-1872: el jardín con su reja, los árboles y los bancos; el palacio arzobispal con su balaustrada.
   Huella 4,6 × 5,2; alto ~2,8 con el campanario.
   ============================================================ */
export function catedralFrente(K, etapa) {   // la fachada de la catedral: tres arcos entre pilastras pareadas, el ático, y la nave detrás
  const g = new THREE.Group(), W = 2.3, H = 1.5, P = SC.piedra, PL = SC.piedraL, PD = SC.piedraD;
  const altoFachada = etapa >= 1 ? H : H * 0.66;
  pon(g, caja(K, W, altoFachada, 0.34, P, { grosor: 0.003 }), 0, altoFachada / 2, -0.17);
  pon(g, caja(K, W + 0.06, 0.06, 0.4, PD, { grosor: 0.002 }), 0, 0.03, -0.15);   // el zócalo de piedra
  const bahias = [-0.74, 0, 0.74];
  bahias.forEach((bx, k) => {
    const big = k === 1 ? 0.5 : 0.44;
    pon(g, caja(K, big + 0.08, 0.98, 0.04, PD, { grosor: 0.0015 }), bx, 0.49, 0.005);        // el nicho del gran arco
    const ar = K.malla(K.cilindro(big / 2 + 0.04, big / 2 + 0.04, 0.04, 14, 1), PD, { grosor: 0.0015 }); ar.rotation.x = Math.PI / 2; ar.position.set(bx, 0.98, 0.005); g.add(ar);
    vanoArco(K, g, bx, 0.06, 0.03, big - 0.06, 1.18, '#5f564a');                                  // el fondo del arco
    pon(g, caja(K, big * 0.55, 0.5, 0.02, SC.maderaD, { grosor: 0.0012 }), bx, 0.31, 0.04);        // la puerta de madera
    pon(g, fronton(K, big * 0.72, 0.09, 0.03, PL), bx, 0.6, 0.035);                              // el frontoncillo sobre la puerta
    pon(g, caja(K, big * 0.7, 0.03, 0.035, PL, { grosor: 0.001 }), bx, 0.585, 0.05);
  });
  pilastras(K, g, [-1.12, -1.04, -0.42, -0.34, 0.34, 0.42, 1.04, 1.12], 0.06, Math.min(1.12, altoFachada - 0.06), 0, PL, { w: 0.05, prof: 0.035 });
  if (etapa >= 1) {
    cornisa(K, g, W + 0.06, 1.18, 0.0, PL, { alto: 0.05, vuelo: 0.06 });
    pon(g, caja(K, W - 0.1, 0.28, 0.26, P, { grosor: 0.002 }), 0, 1.38, -0.15);                  // el ático
    pilastras(K, g, [-1.04, -0.38, 0.38, 1.04], 1.25, 0.24, -0.02, PL, { w: 0.06, prof: 0.03, base: false });
    cornisa(K, g, W - 0.04, 1.52, -0.03, PL, { alto: 0.035, vuelo: 0.04 });
    // la nave: tres naves con la central más alta, techo de teja a dos aguas a lo largo de z
    pon(g, caja(K, 1.9, 1.15, 2.0, PD, { grosor: 0.003 }), 0, 0.575, -1.34);
    const t = techo(K, 2.0, 1.1, 0.38, { tipo: 'dos', vuelo: 0.03 }); t.rotation.y = Math.PI / 2; t.position.set(0, 1.15, -1.4); t.scale.set(1, 1, 1); g.add(t);
    [-1, 1].forEach(l => { for (let k = 0; k < 4; k++) vanoArco(K, g, l * 0.952, 0.62, -0.65 - k * 0.45, 0.12, 0.3); });
  } else {
    // los andamios de la obra (1821): palos y tablones delante de lo que falta
    for (let k = 0; k < 7; k++) pon(g, K.malla(K.cilindro(0.008, 0.008, 1.3, 4), SC.maderaL, { sinTinta: true }), -1.1 + k * 0.37, 0.65, 0.12);
    for (let k = 0; k < 3; k++) pon(g, caja(K, W, 0.015, 0.1, SC.madera, { sinTinta: true }), 0, 0.45 + k * 0.32, 0.12);
    for (let k = 0; k < 5; k++) pon(g, caja(K, 0.12, 0.08, 0.1, PL, { grosor: 0.0012 }), -0.9 + k * 0.42, 0.04, 0.35 + (k % 2) * 0.12, k);   // los sillares en el suelo
    pon(g, caja(K, 1.9, 0.75, 2.0, PD, { grosor: 0.003 }), 0, 0.375, -1.34);
  }
  return g;
}
export function sagrario(K, etapa) {   // el Sagrario con su frontis y su campanario chico de cúpula y linterna (Maunoury, 1860)
  const g = new THREE.Group(), C = SC.cal, CD = SC.calD;
  pon(g, caja(K, 0.8, 1.1, 0.8, C, { grosor: 0.003 }), 0, 0.55, -0.4);
  pilastras(K, g, [-0.36, 0.36], 0.0, 1.0, 0, CD, { w: 0.06, prof: 0.03 });
  cornisa(K, g, 0.84, 1.0, 0.0, CD, { alto: 0.04, vuelo: 0.04 });
  pon(g, fronton(K, 0.84, 0.2, 0.05, CD), 0, 1.08, -0.02);
  vanoArco(K, g, 0, 0.0, 0.006, 0.18, 0.4); vanoArco(K, g, 0, 0.6, 0.006, 0.12, 0.22);
  const t = techo(K, 0.8, 0.8, 0.22, { tipo: 'dos', vuelo: 0.02 }); t.rotation.y = Math.PI / 2; t.position.set(0, 1.1, -0.42); g.add(t);
  if (etapa >= 1) {
    const cb = new THREE.Group(); cb.position.set(0, 1.12, -0.36); g.add(cb);
    pon(cb, caja(K, 0.34, 0.12, 0.34, CD, { grosor: 0.002 }), 0, 0.06, 0);
    pon(cb, caja(K, 0.3, 0.52, 0.3, C, { grosor: 0.002 }), 0, 0.38, 0);
    pon(cb, caja(K, 0.36, 0.06, 0.36, CD, { grosor: 0.0015 }), 0, 0.12, 0);
    [[0, 0.152], [0.152, 0], [0, -0.152], [-0.152, 0]].forEach(([x, z], k) => { const v = new THREE.Group(); pon(cb, v, x, 0, z, k * Math.PI / 2); vanoArco(K, v, 0, 0.3, 0.001, 0.12, 0.24); pon(v, K.malla(K.esfera(0.035, 0.4), '#9a7a3a', { sinTinta: true }), 0, 0.42, -0.02); });
    cornisa(K, cb, 0.34, 0.64, 0.15, CD, { alto: 0.03, vuelo: 0.03 }); cornisa(K, cb, 0.34, 0.64, -0.15, CD, { alto: 0.03, vuelo: 0.03, ry: Math.PI });
    pon(cb, caja(K, 0.34, 0.04, 0.34, CD, { grosor: 0.0015 }), 0, 0.66, 0);
    const cu = K.malla(K.esfera(0.15, 0.6), SC.calD, { grosor: 0.002 }); cu.scale.y = 0.9; cu.position.y = 0.68; g.add(cu); cu.position.add(cb.position);
    pon(cb, K.malla(K.cilindro(0.05, 0.055, 0.14, 8), C, { grosor: 0.0015 }), 0, 0.88, 0);                     // la linterna
    pon(cb, K.malla(K.esfera(0.055, 0.5), CD, { grosor: 0.0015 }), 0, 0.96, 0);
    pon(cb, caja(K, 0.008, 0.12, 0.008, SC.reja, { sinTinta: true }), 0, 1.06, 0); pon(cb, caja(K, 0.05, 0.008, 0.008, SC.reja, { sinTinta: true }), 0, 1.08, 0);   // la cruz
  }
  return g;
}
export function palacioArzobispal(K, etapa) {   // dos pisos de pilastras y, desde los años 1870, la balaustrada (grabado de 1872)
  const g = new THREE.Group(), W = 1.25, H = 1.0, C = etapa >= 3 ? SC.amarillo : SC.cal, CD = etapa >= 3 ? SC.amarilloD : SC.calD;
  pon(g, caja(K, W, H, 0.7, C, { grosor: 0.003 }), 0, H / 2, -0.35);
  pon(g, caja(K, W + 0.02, 0.06, 0.72, CD, { grosor: 0.0015 }), 0, 0.03, -0.35);
  pilastras(K, g, [-0.6, -0.36, -0.12, 0.12, 0.36, 0.6], 0.06, 0.88, 0, CD, { w: 0.04, prof: 0.025 });
  cornisa(K, g, W, 0.47, 0.0, CD, { alto: 0.025, vuelo: 0.03 }); cornisa(K, g, W + 0.04, 0.94, 0.0, CD, { alto: 0.04, vuelo: 0.04 });
  [-0.48, -0.24, 0.24, 0.48].forEach(x => { vanoArco(K, g, x, 0.12, 0.006, 0.11, 0.26); ventanaReja(K, g, x, 0.7, 0.006, 0.1, 0.18); });
  porton(K, g, 0, 0.004, { w: 0.16, h: 0.32, marco: CD });
  if (etapa >= 3) pon(g, balaustre(K, new THREE.Group(), W, 0, 0, CD, { pinaculos: 6 }), 0, 1.0, 0.0);
  else { const t = techo(K, W, 0.7, 0.18, { tipo: 'cuatro', vuelo: 0.03 }); t.position.set(0, H, -0.35); g.add(t); }
  return g;
}
export function portalSierraBella(K, L = 3.0) {   // el portal del sur: la arcada alta con toldos y, arriba, la balaustrada con pináculos (Maunoury, 1860)
  const g = new THREE.Group(), C = SC.cal, CD = SC.calD, n = 11, paso = L / n;
  const vanos = []; for (let k = 0; k < n; k++) vanos.push([-L / 2 + (k + 0.5) * paso, paso * 0.66, 0.42]);
  pon(g, paredArcos(K, L, 0.62, 0.06, vanos, C), 0, 0, 0.0);
  pon(g, caja(K, L, 0.62, 0.5, CD, { grosor: 0.003 }), 0, 0.31, -0.3);
  pon(g, caja(K, L, 0.02, 0.36, '#cfc3a8', { sinTinta: true }), 0, 0.01, -0.15);
  vanos.forEach(([x]) => { const t = K.malla(K.caja(paso * 0.6, 0.012, 0.12), k2(x), { grosor: 0.001 }); t.rotation.x = 0.5; t.position.set(x, 0.36, 0.07); g.add(t); });   // los toldos del comercio
  function k2(x) { return Math.round(x * 7) % 2 ? '#e8e0cc' : '#c9a07a'; }
  cornisa(K, g, L + 0.04, 0.62, 0.0, CD, { alto: 0.035, vuelo: 0.04 });
  pon(g, caja(K, L, 0.36, 0.5, C, { grosor: 0.003 }), 0, 0.84, -0.27);
  for (let k = 0; k < n; k++) ventanaReja(K, g, -L / 2 + (k + 0.5) * paso, 0.85, -0.015, 0.09, 0.16);
  pon(g, balaustre(K, new THREE.Group(), L, 0, 0, C, { pinaculos: 12 }), 0, 1.02, -0.04);
  const t = techo(K, L, 0.5, 0.14, { tipo: 'dos', vuelo: 0.02 }); t.position.set(0, 1.02, -0.29); g.add(t);
  return g;
}
export function realAudiencia(K, etapa, L = 2.3) {   // el palacio de Goycolea (1808), con la torre del reloj, y el Cabildo; fachada a la plaza (+z) y a la calle (−z)
  const g = new THREE.Group(), C = SC.cal, CD = SC.calD, D = 0.6;
  pon(g, caja(K, L, 0.95, D, C, { grosor: 0.003 }), 0, 0.475, -D / 2);
  pon(g, caja(K, L + 0.02, 0.06, D + 0.02, CD, { grosor: 0.0015 }), 0, 0.03, -D / 2);
  [[0, 0], [-D, Math.PI]].forEach(([z, ry]) => {
    const f = new THREE.Group(); pon(g, f, 0, 0, z, ry); if (ry) f.position.x = 0;
    cornisa(K, f, L, 0.46, 0.0, CD, { alto: 0.025, vuelo: 0.03 }); cornisa(K, f, L + 0.04, 0.92, 0.0, CD, { alto: 0.04, vuelo: 0.04 });
    for (let k = 0; k < 8; k++) { const x = -L / 2 + 0.15 + k * (L - 0.3) / 7; if (ry && k === 3) porton(K, f, x, 0.004, { w: 0.16, h: 0.3, marco: CD }); else vanoArco(K, f, x, 0.06, 0.006, 0.13, 0.34); ventanaReja(K, f, x, 0.7, 0.006, 0.1, 0.18); }
    pilastras(K, f, [-L / 2 + 0.02, L / 2 - 0.02], 0.06, 0.86, 0, CD, { w: 0.05, prof: 0.02 });
  });
  const t = techo(K, L, D, 0.18, { tipo: 'dos', vuelo: 0.03 }); t.position.set(0, 0.95, -D / 2); g.add(t);
  pon(g, fronton(K, 0.7, 0.16, 0.04, CD), -0.35, 0.96, -0.01);
  if (etapa >= 1) {   // la torre del reloj (fotografía de 1860), con su esfera a la plaza y a la calle
    const tr = new THREE.Group(); tr.position.set(-0.35, 0.95, -0.28); g.add(tr);
    pon(tr, caja(K, 0.3, 0.6, 0.3, C, { grosor: 0.002 }), 0, 0.3, 0);
    [1, -1].forEach(l => { const r = K.malla(K.cilindro(0.075, 0.075, 0.012, 14), '#fbf7ea', { grosor: 0.0012 }); r.rotation.x = Math.PI / 2; r.position.set(0, 0.42, l * 0.152); tr.add(r);
      pon(tr, caja(K, 0.006, 0.06, 0.004, SC.reja, { sinTinta: true }), 0, 0.44, l * 0.16); pon(tr, caja(K, 0.04, 0.006, 0.004, SC.reja, { sinTinta: true }), 0.015, 0.42, l * 0.16); });
    cornisa(K, tr, 0.32, 0.6, 0.15, CD, { alto: 0.03, vuelo: 0.025 }); cornisa(K, tr, 0.32, 0.6, -0.15, CD, { alto: 0.03, vuelo: 0.025, ry: Math.PI });
    pon(tr, caja(K, 0.2, 0.22, 0.2, C, { grosor: 0.0015 }), 0, 0.74, 0);
    vanoArco(K, tr, 0, 0.66, 0.102, 0.08, 0.15); vanoArco(K, tr, 0, 0.66, -0.102, 0.08, 0.15);
    const cu = K.malla(K.esfera(0.11, 0.5), CD, { grosor: 0.0015 }); cu.scale.y = 0.8; cu.position.y = 0.86; tr.add(cu);
    pon(tr, caja(K, 0.006, 0.1, 0.006, SC.reja, { sinTinta: true }), 0, 1.0, 0);
  }
  return g;
}
export function libertadAmericana(K) {   // el monumento de mármol de 1836: la Libertad sobre su pedestal, en la taza de la pila
  const g = new THREE.Group(), M = '#f4f1ea';
  pon(g, K.malla(K.cilindro(0.34, 0.36, 0.07, 20), SC.piedraL, { grosor: 0.002 }), 0, 0.035, 0);
  pon(g, K.malla(K.cilindro(0.31, 0.31, 0.012, 20), SC.agua, { sinTinta: true }), 0, 0.068, 0);
  pon(g, caja(K, 0.14, 0.24, 0.14, M, { grosor: 0.0015 }), 0, 0.16, 0);
  pon(g, caja(K, 0.17, 0.03, 0.17, M, { grosor: 0.0012 }), 0, 0.29, 0);
  pon(g, K.malla(K.cilindro(0.025, 0.045, 0.16, 8), M, { grosor: 0.0012 }), 0, 0.38, 0);
  pon(g, K.malla(K.esfera(0.024, 0.4), M, { grosor: 0.001 }), 0, 0.48, 0);
  pon(g, caja(K, 0.008, 0.12, 0.008, M, { sinTinta: true }), 0.03, 0.52, 0);
  return g;
}
export function pilaColonial(K) {
  const g = new THREE.Group();
  pon(g, K.malla(K.cilindro(0.24, 0.26, 0.06, 8), SC.piedra, { grosor: 0.002 }), 0, 0.03, 0);
  pon(g, K.malla(K.cilindro(0.21, 0.21, 0.01, 8), SC.agua, { sinTinta: true }), 0, 0.058, 0);
  pon(g, K.malla(K.cilindro(0.025, 0.04, 0.16, 6), SC.piedraD, { grosor: 0.0012 }), 0, 0.12, 0);
  pon(g, K.malla(K.cilindro(0.07, 0.03, 0.03, 8), SC.piedraD, { grosor: 0.0012 }), 0, 0.2, 0);
  return g;
}
export function plazaDeArmas(K, etapa = 3) {
  const g = new THREE.Group();
  /* el suelo de la plaza: tierra apisonada; desde 1859, el jardín */
  pon(g, caja(K, 3.3, 0.02, 3.3, SC.tierra, { sinTinta: true }), 0, 0.01, 0.3);
  const ca = catedralFrente(K, etapa); ca.position.set(0.95, 0, -1.45); g.add(ca);
  const sg = sagrario(K, etapa); sg.position.set(-0.6, 0, -1.45); g.add(sg);
  const pa = palacioArzobispal(K, etapa); pa.position.set(-1.65, 0, -1.45); g.add(pa);
  const rr = realAudiencia(K, etapa); rr.position.set(1.95, 0, -0.05); rr.rotation.y = -Math.PI / 2; g.add(rr);
  const po = portalSierraBella(K); po.position.set(-2.0, 0, 0.35); po.rotation.y = Math.PI / 2; g.add(po);
  if (etapa < 2) { const p = pilaColonial(K); p.position.set(0, 0.02, 0.35); g.add(p); }
  else { const m = libertadAmericana(K); m.position.set(0, 0.02, 0.35); g.add(m); }
  if (etapa >= 2) [[-1.35, -0.95], [1.35, -0.95], [-1.35, 1.75], [1.35, 1.75], [0, 1.85], [-1.4, 0.4], [1.4, 0.4]].forEach(([x, z]) => { const f = farol(K); f.position.set(x, 0.02, z); g.add(f); });
  if (etapa >= 3) {
    /* el jardín de 1859: los prados en cruz con su reja, los árboles y los bancos */
    const R = 1.2, tris = [];
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([sx, sz]) => {
      const cx = sx * 0.66, cz = 0.35 + sz * 0.66;
      pon(g, caja(K, 0.98, 0.03, 0.98, SC.jardin, { sinTinta: true }), cx, 0.035, cz);
      for (let k = 0; k < 5; k++) pon(g, K.malla(K.esfera(0.035, 0.4), ['#e86a6a', '#f2d16b', '#f6f1e3', '#e8a7b4', '#c86ad8'][k], { sinTinta: true }), cx + (h3(k, sx, 1) - 0.5) * 0.7, 0.06, cz + (h3(k, sz, 2) - 0.5) * 0.7);
      const ar = naranjo(K, 1.25, false); ar.children.forEach(c => { if (c.material && c.material.color && c.material.color.getHexString() === SC.naranjo.slice(1)) c.material = K.mat('#6f9a46'); }); ar.position.set(cx + sx * 0.18, 0.04, cz + sz * 0.18); g.add(ar);
      const a2 = naranjo(K, 1.0, false); a2.position.set(cx - sx * 0.22, 0.04, cz + sz * 0.25); g.add(a2);
      const b = bancoPlaza(K); b.position.set(cx - sx * 0.3, 0.02, cz - sz * 0.58); b.rotation.y = sz > 0 ? 0 : Math.PI; g.add(b);
    });
    for (let k = 0; k < 44; k++) { const a = k / 44 * Math.PI * 2; pon(g, caja(K, 0.008, 0.1, 0.008, SC.reja, { sinTinta: true }), Math.cos(a) * R * 1.3, 0.07, 0.35 + Math.sin(a) * R * 1.3); }
    const aro = K.malla(K.toro(R * 1.3, 0.006, Math.PI * 2, 0.6), SC.reja, { sinTinta: true }); aro.rotation.x = Math.PI / 2; aro.position.set(0, 0.12, 0.35); g.add(aro);
  }
  g.userData.ficha = { titulo: 'La Plaza de Armas', texto: 'la catedral de Toesca, el Sagrario, la Real Audiencia y el portal: el centro de Santiago desde 1541' };
  return g;
}

/* ============================================================
   EL HÉROE · C: SAN FRANCISCO Y SU CONVENTO, sobre la Alameda, por etapas. La iglesia a lo largo de x con su costado
   norte (+z) a la Alameda y la portada de piedra al poniente (+x); la torre en la esquina; al sur (−z) el claustro
   principal de dos pisos y el huerto con su tapia; delante, la Alameda con su acequia, sus álamos y un asiento.
   0 · 1821: la iglesia de piedra (1618) con la portada de 1758 y su torre colonial de techo de teja, y el convento.
   1 · el claustro con sus arcos y su galería de madera, el jardín con palmas, naranjos y la pila, el huerto.
   2 · 1854: la torre vieja demolida; la nueva sube en andamios.
   3 · 1857: la torre de Vivaceta con su reloj de cuatro esferas; la Alameda con sus álamos y los asientos.
   Huella 4,4 × 4,4; alto ~3,1 con la cruz.
   ============================================================ */
function torreVivaceta(K) {
  const g = new THREE.Group(), A = '#a8503c', C = '#efe4c8', CD = '#d9c9a2', V = '#5f7a6e';
  pon(g, caja(K, 0.46, 1.32, 0.46, A, { grosor: 0.003 }), 0, 0.66, 0);                                         // la base, de piedra y ladrillo pintada de almagre
  pon(g, caja(K, 0.5, 0.06, 0.5, CD, { grosor: 0.0015 }), 0, 1.33, 0);                                         // la cornisa con su dentellón
  for (let k = 0; k < 12; k++) [[1, 0], [0, 1], [-1, 0], [0, -1]].forEach(([a, b]) => pon(g, caja(K, 0.02, 0.025, 0.02, CD, { sinTinta: true }), a ? a * 0.255 : -0.22 + k * 0.04, 1.29, b ? b * 0.255 : -0.22 + k * 0.04));
  pon(g, caja(K, 0.4, 0.58, 0.4, C, { grosor: 0.002 }), 0, 1.65, 0);                                            // el cuerpo de las campanas
  for (let k = 0; k < 4; k++) {
    const f = new THREE.Group(); pon(g, f, 0, 0, 0, k * Math.PI / 2);
    vanoArco(K, f, 0, 1.44, 0.201, 0.15, 0.38, '#4a3a30');
    pilastras(K, f, [-0.17, 0.17], 1.38, 0.54, 0.2, CD, { w: 0.045, prof: 0.02, base: false });
    pon(f, caja(K, 0.12, 0.012, 0.03, CD, { sinTinta: true }), 0, 1.46, 0.215);                                  // el antepecho
  }
  pon(g, caja(K, 0.46, 0.05, 0.46, CD, { grosor: 0.0015 }), 0, 1.965, 0);
  pon(g, caja(K, 0.34, 0.36, 0.34, C, { grosor: 0.002 }), 0, 2.17, 0);                                         // el cuerpo del reloj
  for (let k = 0; k < 4; k++) {
    const f = new THREE.Group(); pon(g, f, 0, 0, 0, k * Math.PI / 2);
    const rel = K.malla(K.cilindro(0.1, 0.1, 0.015, 18), '#fbf8ee', { grosor: 0.0015 }); rel.rotation.x = Math.PI / 2; rel.position.set(0, 2.17, 0.172); f.add(rel);
    pon(f, K.malla(K.toro(0.1, 0.008, Math.PI * 2, 0.6), SC.reja, { sinTinta: true }), 0, 2.17, 0.18);
    pon(f, caja(K, 0.008, 0.075, 0.005, SC.reja, { sinTinta: true }), 0, 2.2, 0.183); pon(f, caja(K, 0.055, 0.008, 0.005, SC.reja, { sinTinta: true }), 0.022, 2.17, 0.183);
  }
  pon(g, caja(K, 0.38, 0.04, 0.38, CD, { grosor: 0.0015 }), 0, 2.37, 0);
  pon(g, K.malla(K.cilindro(0.12, 0.13, 0.04, 12), CD, { grosor: 0.0012 }), 0, 2.41, 0);
  for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; pon(g, K.malla(K.cilindro(0.008, 0.008, 0.12, 4), C, { sinTinta: true }), Math.cos(a) * 0.105, 2.49, Math.sin(a) * 0.105); }   // la linterna balaustrada
  pon(g, K.malla(K.cilindro(0.08, 0.09, 0.14, 10), C, { grosor: 0.0012 }), 0, 2.5, 0);
  pon(g, K.malla(K.toro(0.125, 0.008, Math.PI * 2, 0.6), CD, { sinTinta: true }), 0, 2.555, 0).rotation.x = Math.PI / 2;
  const bu = K.malla(K.esfera(0.09, 0.5), V, { grosor: 0.0015 }); bu.scale.y = 0.75; bu.position.y = 2.6; g.add(bu);
  pon(g, K.malla(K.cono(0.05, 0.32, 8), V, { grosor: 0.0015 }), 0, 2.81, 0);                                   // la aguja
  pon(g, caja(K, 0.008, 0.12, 0.008, SC.reja, { sinTinta: true }), 0, 3.02, 0); pon(g, caja(K, 0.055, 0.008, 0.008, SC.reja, { sinTinta: true }), 0, 3.04, 0);
  return g;
}
function torreColonial(K) {   // la tercera torre (1751-1854): maciza, de dos cuerpos, con su techo de teja
  const g = new THREE.Group();
  pon(g, caja(K, 0.46, 1.25, 0.46, SC.calD, { grosor: 0.003 }), 0, 0.625, 0);
  pon(g, caja(K, 0.38, 0.36, 0.38, SC.cal, { grosor: 0.002 }), 0, 1.43, 0);
  for (let k = 0; k < 4; k++) { const f = new THREE.Group(); pon(g, f, 0, 0, 0, k * Math.PI / 2); vanoArco(K, f, 0, 1.32, 0.191, 0.13, 0.26); }
  const t = techo(K, 0.42, 0.42, 0.26, { tipo: 'cuatro', vuelo: 0.03 }); t.position.y = 1.61; g.add(t);
  pon(g, caja(K, 0.008, 0.1, 0.008, SC.reja, { sinTinta: true }), 0, 1.92, 0);
  return g;
}
function claustro(K, etapa, W = 2.3, t = 0.42) {   // el claustro de dos pisos: arcos de ladrillo sobre columnas toscanas abajo, galería de madera arriba
  const g = new THREE.Group(), H = 0.82, C = SC.cal;
  const alas = [[0, W / 2 - t / 2, W, t, 0], [0, -W / 2 + t / 2, W, t, Math.PI], [W / 2 - t / 2, 0, W - 2 * t, t, Math.PI / 2], [-W / 2 + t / 2, 0, W - 2 * t, t, -Math.PI / 2]];
  alas.forEach(([x, z, L, d, ry]) => { const a = new THREE.Group(); pon(g, a, x, 0, z, ry); pon(a, caja(K, L, H, d * 0.5, C, { grosor: 0.003 }), 0, H / 2, d * 0.25); });
  const tr = techoAnillo(K, W, W, t, 0.2); tr.position.y = H; g.add(tr);
  if (etapa >= 1) {
    const I = W - 2 * t;   // el patio
    [0, 1, 2, 3].forEach(k => {
      const f = new THREE.Group(); pon(g, f, 0, 0, 0, k * Math.PI / 2);
      const n = 5, paso = I / n, vanos = []; for (let i = 0; i < n; i++) vanos.push([-I / 2 + (i + 0.5) * paso, paso * 0.62, 0.22]);
      pon(f, paredArcos(K, I, 0.4, 0.05, vanos, SC.ladrilloL), 0, 0, -I / 2 + 0.03);                          // la arquería de ladrillo
      for (let i = 0; i <= n; i++) pon(f, K.malla(K.cilindro(0.022, 0.026, 0.04, 8), SC.calD, { sinTinta: true }), -I / 2 + i * paso, 0.02, -I / 2 + 0.03);
      pon(f, caja(K, I, 0.025, 0.12, SC.madera, { grosor: 0.0012 }), 0, 0.41, -I / 2 + 0.06);                  // el piso de la galería
      for (let i = 0; i <= n; i++) pon(f, caja(K, 0.018, 0.34, 0.018, SC.maderaD, { sinTinta: true }), -I / 2 + i * paso, 0.59, -I / 2 + 0.04);   // los pies derechos
      pon(f, caja(K, I, 0.012, 0.012, SC.maderaD, { sinTinta: true }), 0, 0.53, -I / 2 + 0.035);               // la baranda
      for (let i = 0; i < n * 3; i++) pon(f, caja(K, 0.006, 0.09, 0.006, SC.madera, { sinTinta: true }), -I / 2 + (i + 0.5) * paso / 3, 0.48, -I / 2 + 0.035);
    });
    /* el jardín del claustro: los senderos en cruz, la pila al centro, dos palmas y los naranjos */
    pon(g, caja(K, I - 0.06, 0.015, I - 0.06, SC.jardin, { sinTinta: true }), 0, 0.008, 0);
    pon(g, caja(K, I - 0.06, 0.02, 0.1, SC.calle, { sinTinta: true }), 0, 0.012, 0); pon(g, caja(K, 0.1, 0.02, I - 0.06, SC.calle, { sinTinta: true }), 0, 0.012, 0);
    const pi = pilaColonial(K); pi.scale.setScalar(0.6); g.add(pi);
    [[-0.3, -0.3], [0.3, 0.3]].forEach(([x, z]) => { const p = palma(K, 0.9); p.position.set(x, 0, z); g.add(p); });
    [[0.3, -0.3], [-0.3, 0.3]].forEach(([x, z]) => { const n2 = naranjo(K, 0.9); n2.position.set(x, 0, z); g.add(n2); });
  }
  return g;
}
export function sanFrancisco(K, etapa = 3) {
  const g = new THREE.Group(), A = '#b45a42', P = SC.piedra;
  /* la iglesia: la nave de piedra con su techo de teja; la nave lateral del norte, más baja */
  pon(g, caja(K, 2.9, 0.95, 1.0, A, { grosor: 0.003 }), -0.05, 0.475, 0.95);
  pon(g, caja(K, 2.94, 0.06, 1.04, '#8a7a68', { grosor: 0.0015 }), -0.05, 0.03, 0.95);
  const t = techo(K, 2.9, 1.0, 0.36, { tipo: 'dos', vuelo: 0.04 }); t.position.set(-0.05, 0.95, 0.95); g.add(t);
  if (etapa >= 2) { pon(g, caja(K, 2.3, 0.62, 0.32, A, { grosor: 0.003 }), -0.35, 0.31, 1.61); const t2 = techo(K, 2.3, 0.32, 0.08, { tipo: 'dos', vuelo: 0.03 }); t2.position.set(-0.35, 0.62, 1.61); g.add(t2); vanoArco(K, g, -1.3, 0.04, 1.775, 0.16, 0.36, SC.maderaD); }
  for (let k = 0; k < 4; k++) { const v = new THREE.Group(); pon(g, v, -1.1 + k * 0.6, 0, etapa >= 2 ? 1.455 : 1.452); vanoArco(K, v, 0, 0.62, 0, 0.12, 0.2); }
  /* la portada de piedra sillar de 1758, al poniente: el arco, las pilastras, la hornacina con su santo y el remate */
  const po = new THREE.Group(); po.position.set(1.4, 0, 0.95); po.rotation.y = Math.PI / 2; g.add(po);
  pon(po, caja(K, 0.62, 0.86, 0.06, P, { grosor: 0.002 }), 0, 0.43, 0.02);
  vanoArco(K, po, 0, 0.0, 0.055, 0.2, 0.44, SC.maderaD);
  pilastras(K, po, [-0.24, -0.16, 0.16, 0.24], 0.0, 0.62, 0.05, SC.piedraL, { w: 0.04, prof: 0.02 });
  cornisa(K, po, 0.66, 0.62, 0.05, SC.piedraL, { alto: 0.03, vuelo: 0.03 });
  pon(po, caja(K, 0.11, 0.17, 0.02, '#6a6052', { sinTinta: true }), 0, 0.75, 0.055);
  pon(po, K.malla(K.capsula(0.025, 0.06, 0.5), '#e8e0cc', { grosor: 0.001 }), 0, 0.75, 0.06);   // san Francisco en su hornacina
  pon(po, fronton(K, 0.34, 0.1, 0.03, SC.piedraL), 0, 0.86, 0.04);
  if (etapa >= 3) { pon(po, caja(K, 0.7, 0.04, 0.08, SC.piedraL, { grosor: 0.0012 }), 0, 0.02, 0.06); }
  /* la torre de la esquina noroeste */
  if (etapa <= 1) { const tc = torreColonial(K); tc.position.set(1.18, 0, 1.5); g.add(tc); }
  else if (etapa === 2) {
    pon(g, caja(K, 0.46, 0.95, 0.46, A, { grosor: 0.003 }), 1.18, 0.475, 1.5);
    for (let k = 0; k < 4; k++) pon(g, K.malla(K.cilindro(0.008, 0.008, 1.6, 4), SC.maderaL, { sinTinta: true }), 1.18 + (k % 2 ? 0.28 : -0.28), 0.8, 1.5 + (k < 2 ? 0.28 : -0.28));
    for (let k = 0; k < 4; k++) pon(g, caja(K, 0.6, 0.015, 0.6, SC.madera, { sinTinta: true }), 1.18, 0.5 + k * 0.32, 1.5);
    const gr = K.malla(K.cilindro(0.006, 0.006, 0.6, 4), SC.maderaD, { sinTinta: true }); gr.rotation.z = 1.2; gr.position.set(1.0, 1.65, 1.5); g.add(gr);
  } else { const tv = torreVivaceta(K); tv.position.set(1.18, 0, 1.5); g.add(tv); }
  /* el convento: el claustro principal y la sacristía; el huerto con su tapia */
  const cl = claustro(K, etapa); cl.position.set(-0.3, 0, -0.85); g.add(cl);
  pon(g, caja(K, 0.55, 0.7, 0.9, SC.cal, { grosor: 0.003 }), -1.9, 0.35, 0.75); const ts = techo(K, 0.9, 0.55, 0.18, { tipo: 'dos', vuelo: 0.03 }); ts.rotation.y = Math.PI / 2; ts.position.set(-1.9, 0.7, 0.75); g.add(ts);
  const tapia = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0), m = caja(K, L, 0.28, 0.06, SC.calD, { grosor: 0.002 }); m.position.set((x0 + x1) / 2, 0.14, (z0 + z1) / 2); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0); g.add(m); const c = caja(K, L + 0.04, 0.035, 0.1, SC.teja, { grosor: 0.0012 }); c.position.set((x0 + x1) / 2, 0.295, (z0 + z1) / 2); c.rotation.y = m.rotation.y; g.add(c); };
  tapia(0.9, -2.0, 2.3, -2.0); tapia(2.3, -2.0, 2.3, 0.3); tapia(0.9, 0.3, 2.3, 0.3);
  pon(g, caja(K, 1.35, 0.012, 2.25, '#a9b56a', { sinTinta: true }), 1.6, 0.006, -0.85);
  if (etapa >= 1) for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { const a = (i + j) % 3 === 0 ? naranjo(K, 0.85) : quillay(K, 1.0, i * 4 + j); if ((i + j) % 3 !== 0) a.children.forEach(c => { if (c.material?.color && !c.material.vertexColors) c.material = K.mat(j % 2 ? '#7f9e4a' : '#6f8e40'); }); a.position.set(1.15 + i * 0.4, 0, -1.7 + j * 0.52); g.add(a); }
  /* la Alameda delante: la acequia, los álamos y los asientos de Vivaceta */
  pon(g, caja(K, 4.6, 0.012, 0.55, SC.calle, { sinTinta: true }), 0.15, 0.006, 2.15);
  pon(g, caja(K, 4.6, 0.02, 0.07, SC.aguaD, { sinTinta: true }), 0.15, 0.004, 2.42);
  if (etapa >= 3) {
    for (let k = 0; k < 7; k++) { const a = alamo(K, 0.9 + h3(k, 3, 3) * 0.2); a.position.set(-2.0 + k * 0.68, 0, 2.52); g.add(a); }
    [-1.0, 0.6].forEach(x => { const b = new THREE.Group(); pon(b, caja(K, 0.34, 0.035, 0.09, SC.piedraL, { grosor: 0.0012 }), 0, 0.09, 0); [-1, 1].forEach(l => pon(b, caja(K, 0.04, 0.09, 0.08, SC.piedra, { grosor: 0.001 }), l * 0.13, 0.045, 0)); pon(b, caja(K, 0.34, 0.08, 0.025, SC.piedraL, { grosor: 0.001 }), 0, 0.14, -0.035); b.position.set(x, 0, 2.2); b.rotation.y = Math.PI; g.add(b); });
  }
  g.userData.ficha = { titulo: 'San Francisco', texto: 'la iglesia más antigua de Chile (1618), su convento y la torre de Fermín Vivaceta (1857)' };
  return g;
}

/* ============================================================
   LA SEGUNDA PIEZA. A: el puente de Cal y Canto · B: La Moneda de Toesca · C: el Mercado Central.
   ============================================================ */
const ladrilloMat = K => matTex(K, 'sc-ladrillo', textura('sc-ladrillo', 64, 64, (g, w, h) => {
  g.fillStyle = SC.ladrillo; g.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y += 8) { g.fillStyle = 'rgba(90,40,20,.35)'; g.fillRect(0, y, w, 1.5); for (let x = (y / 8) % 2 ? 0 : 8; x < w; x += 16) g.fillRect(x, y, 1.5, 8); }
  g.fillStyle = 'rgba(255,220,190,.12)'; for (let k = 0; k < 20; k++) g.fillRect((k * 29) % w, (k * 13) % h, 6, 3);
}, { repetir: true }));
/* A · EL PUENTE DE CAL Y CANTO, a lo largo de x, sobre el lecho del Mapocho: los arcos de ladrillo, los pilares con sus
   tajamares de piedra en punta, el pretil y, sobre cada pilar del lado poniente (−z), la garita semicircular con su
   tienda (desde los años 1830); las rampas de cada estribo bajan a la orilla. El origen es el lecho, al centro. */
export function calYCanto(K, { arcos = 9, orilla = 0.3 } = {}) {
  const g = new THREE.Group(), span = 0.32, pil = 0.12, Hd = 0.62, Wd = 0.46, LR = arcos * span + (arcos - 1) * pil, RAMPA = 1.0;
  const vanos = []; for (let k = 0; k < arcos; k++) vanos.push([-LR / 2 + k * (span + pil) + span / 2, span, 0.3]);
  const cuerpo = paredArcos(K, LR + pil * 2, Hd, Wd, vanos, ladrilloMat(K), { grosor: 0.004 }); g.add(cuerpo);
  // las rampas de los estribos: el terraplén de ladrillo que baja a la orilla, con su ojo ciego
  [-1, 1].forEach(l => {
    const s = new THREE.Shape(); s.moveTo(0, 0); s.lineTo(RAMPA, 0); s.lineTo(RAMPA, orilla); s.lineTo(0, Hd); s.closePath();
    const ge = new THREE.ExtrudeGeometry(s, { depth: Wd, bevelEnabled: false }); ge.translate(0, 0, -Wd / 2); ge.userData.propia = true;
    const r = K.malla(ge, ladrilloMat(K), { grosor: 0.004 }); r.position.x = l * (LR / 2 + pil); r.scale.x = l; g.add(r);
    vanoArco(K, g, l * (LR / 2 + pil + 0.3), 0.0, Wd / 2 + 0.003, 0.2, 0.36, '#5a3e2e');
    vanoArco(K, g, l * (LR / 2 + pil + 0.3), 0.0, -Wd / 2 - 0.003, 0.2, 0.36, '#5a3e2e');
  });
  // los pilares con sus tajamares en punta, de piedra, a los dos lados (río arriba y río abajo)
  for (let k = 0; k <= arcos; k++) {
    const x = -LR / 2 - pil / 2 + k * (span + pil);
    [-1, 1].forEach(l => {
      const t = K.malla(K.cilindro(pil * 0.72, pil * 0.72, 0.36, 3), SC.piedra, { grosor: 0.002 }); t.position.set(x, 0.18, l * (Wd / 2 + 0.02)); t.rotation.y = l > 0 ? Math.PI / 2 : -Math.PI / 2; t.scale.set(1, 1, 1.3); g.add(t);
      const tp = K.malla(K.cono(pil * 0.72, 0.1, 3), SC.piedraL, { grosor: 0.0015 }); tp.position.set(x, 0.41, l * (Wd / 2 + 0.02)); tp.rotation.y = t.rotation.y; tp.scale.set(1, 1, 1.3); g.add(tp);
    });
    if (k > 0 && k < arcos) {   // la garita semicircular del poniente, con su tienda y su toldo
      const ga = K.malla(K.cilindro(0.075, 0.075, 0.24, 10, 1), SC.cal, { grosor: 0.002 }); ga.position.set(x, Hd + 0.06, -Wd / 2 - 0.04); g.add(ga);
      const cu = K.malla(K.esfera(0.078, 0.5), SC.tejaD, { grosor: 0.0015 }); cu.scale.y = 0.6; cu.position.set(x, Hd + 0.19, -Wd / 2 - 0.04); g.add(cu);
      pon(g, caja(K, 0.06, 0.1, 0.012, SC.vano, { sinTinta: true }), x, Hd + 0.03, -Wd / 2 + 0.03);
      const to = K.malla(K.caja(0.1, 0.008, 0.07), k % 2 ? '#e8dcc0' : '#c8925a', { grosor: 0.001 }); to.position.set(x, Hd + 0.11, -Wd / 2 + 0.06); to.rotation.x = -0.5; g.add(to);
    }
  }
  // el pretil con su albardilla, a los dos lados de la calzada; y los descansos con su frontoncillo río arriba
  [-1, 1].forEach(l => { pon(g, caja(K, LR + pil * 2, 0.09, 0.05, ladrilloMat(K), { grosor: 0.002 }), 0, Hd + 0.045, l * (Wd / 2 - 0.025)); pon(g, caja(K, LR + pil * 2 + 0.02, 0.02, 0.07, SC.piedraL, { grosor: 0.0012 }), 0, Hd + 0.1, l * (Wd / 2 - 0.025)); });
  for (let k = 1; k < arcos; k += 2) { const x = -LR / 2 - pil / 2 + k * (span + pil); pon(g, caja(K, 0.13, 0.13, 0.05, SC.cal, { grosor: 0.0015 }), x, Hd + 0.15, Wd / 2 - 0.025); pon(g, fronton(K, 0.15, 0.05, 0.05, SC.calD), x, Hd + 0.215, Wd / 2 - 0.05); }
  pon(g, caja(K, LR + pil * 2, 0.01, Wd - 0.1, '#c9b48e', { sinTinta: true }), 0, Hd + 0.005, 0);
  g.userData.ficha = { titulo: 'El puente de Cal y Canto', texto: '1780-1888: «demasiado puente para el Mapocho»; sobre sus pilares, las garitas con tiendas' };
  g.userData.largo = LR + pil * 2 + RAMPA * 2;
  return g;
}
/* B · LA MONEDA (Toesca, 1784-1805): larga y baja, con el pórtico de columnas pareadas y el frontón, las pilastras, las
   ventanas con reja, la balaustrada con pináculos y, dentro, el patio de los Cañones y el de los Naranjos */
export function laMoneda(K) {
  const g = new THREE.Group(), W = 3.5, D = 2.5, H = 0.9, C = '#efe6cf', CD = '#d8caa6', t = 0.42;
  const alas = [[0, D / 2 - t / 2, W, t, 0], [0, -D / 2 + t / 2, W, t, 0], [W / 2 - t / 2, 0, t, D - 2 * t, 1], [-W / 2 + t / 2, 0, t, D - 2 * t, 1], [0, 0, t * 0.8, D - 2 * t, 1]];
  alas.forEach(([x, z, w, d, rot]) => { pon(g, caja(K, w, H, d, C, { grosor: 0.003 }), x, H / 2, z); const te = techo(K, rot ? d : w, rot ? w : d, 0.14, { tipo: 'dos', vuelo: 0.01 }); te.position.set(x, H, z); if (rot) te.rotation.y = Math.PI / 2; g.add(te); });
  pon(g, caja(K, W + 0.03, 0.07, D + 0.03, CD, { grosor: 0.0015 }), 0, 0.035, 0);
  // la fachada principal (+z): pilastras, dos órdenes de ventanas con reja, el pórtico al centro
  const xs = []; for (let k = 0; k <= 14; k++) xs.push(-W / 2 + 0.05 + k * (W - 0.1) / 14);
  pilastras(K, g, xs, 0.07, H - 0.12, D / 2, CD, { w: 0.045, prof: 0.025 });
  cornisa(K, g, W + 0.04, H - 0.06, D / 2, CD, { alto: 0.05, vuelo: 0.05 });
  for (let k = 0; k < 14; k++) { const x = (xs[k] + xs[k + 1]) / 2; if (Math.abs(x) < 0.3) continue; ventanaReja(K, g, x, 0.27, D / 2 + 0.004, 0.1, 0.22); ventanaReja(K, g, x, 0.66, D / 2 + 0.004, 0.09, 0.16); }
  const po = new THREE.Group(); po.position.set(0, 0, D / 2); g.add(po);
  pon(po, caja(K, 0.62, H + 0.1, 0.1, C, { grosor: 0.002 }), 0, (H + 0.1) / 2, 0.05);
  [-0.26, -0.18, 0.18, 0.26].forEach(x => pon(po, K.malla(K.cilindro(0.028, 0.032, H - 0.05, 10), CD, { grosor: 0.0015 }), x, (H - 0.05) / 2 + 0.07, 0.13));
  pon(po, caja(K, 0.66, 0.06, 0.18, CD, { grosor: 0.0015 }), 0, H + 0.02, 0.1);
  pon(po, fronton(K, 0.66, 0.16, 0.06, CD), 0, H + 0.05, 0.07);
  porton(K, po, 0, 0.1, { w: 0.18, h: 0.34, marco: CD, arco: true });
  pon(po, caja(K, 0.2, 0.025, 0.08, SC.reja, { sinTinta: true }), 0, 0.55, 0.15);   // el balcón de fierro
  const b = bandera(K, 1.4); b.position.set(0, H + 0.2, 0.05); g.add(b);
  // la balaustrada con pináculos, en todo el borde
  pon(g, balaustre(K, new THREE.Group(), W, 0, 0, CD, { pinaculos: 9 }), 0, H, D / 2 - 0.02);
  [[W / 2 - 0.02, Math.PI / 2], [-W / 2 + 0.02, -Math.PI / 2]].forEach(([x, ry]) => pon(g, balaustre(K, new THREE.Group(), D, 0, 0, CD, { pinaculos: 6, ry: 0 }), x, H, 0, ry));
  // los costados (+x) también con sus ventanas
  for (let k = 0; k < 7; k++) { const z = -D / 2 + 0.2 + k * (D - 0.4) / 6; ventanaReja(K, g, W / 2 + 0.004, 0.27, z, 0.1, 0.22, Math.PI / 2); ventanaReja(K, g, W / 2 + 0.004, 0.66, z, 0.09, 0.16, Math.PI / 2); }
  // los patios: el de los Cañones (adelante) y el de los Naranjos (atrás)
  const pw = (W - 2 * t - t * 0.8) / 2, pd = D - 2 * t;
  [-1, 1].forEach(l => pon(g, caja(K, pw, 0.015, pd, l < 0 ? '#ddd0b2' : SC.jardin, { sinTinta: true }), l * (t * 0.4 + pw / 2), 0.008, 0));
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const n2 = naranjo(K, 0.9); n2.position.set(t * 0.4 + pw * (0.3 + i * 0.4), 0, -pd * 0.25 + j * pd * 0.5); g.add(n2); }
  [-0.25, 0.25].forEach(z => { const c = canon(K, 1.2); c.position.set(-(t * 0.4 + pw / 2), 0.01, z); c.rotation.y = Math.PI / 2; g.add(c); });
  g.userData.ficha = { titulo: 'La Moneda', texto: 'el palacio de Toesca (1805): casa de la moneda y, desde 1845, del gobierno' };
  return g;
}
/* C · EL MERCADO CENTRAL (1869-1872): el anillo de ladrillo con sus arcos y el pórtico con su frontón; dentro, la nave
   de fierro de Glasgow con sus cuatro pabellones de techo en punta y la cúpula del centro */
export function mercadoCentral(K) {
  const g = new THREE.Group(), W = 3.0, C = '#ecd08e', CD = '#d2b06a', Z = SC.zinc, ZD = SC.zincD, F = SC.fierro;
  [[0, W / 2 - 0.2, 0], [0, -W / 2 + 0.2, Math.PI], [W / 2 - 0.2, 0, Math.PI / 2], [-W / 2 + 0.2, 0, -Math.PI / 2]].forEach(([x, z, ry]) => {
    const a = new THREE.Group(); pon(g, a, x, 0, z, ry);
    const n = 9, vanos = []; for (let k = 0; k < n; k++) vanos.push([-W / 2 + 0.2 + (k + 0.5) * (W - 0.4) / n, 0.18, 0.2]);
    pon(a, paredArcos(K, W, 0.45, 0.4, vanos, C), 0, 0, 0);
    vanos.forEach(([vx], k) => { const to = K.malla(K.caja(0.2, 0.01, 0.12), k % 2 ? '#e05a3a' : '#f2e6c8', { grosor: 0.001 }); to.position.set(vx, 0.33, 0.24); to.rotation.x = 0.45; a.add(to); });
    cornisa(K, a, W, 0.45, 0.2, CD, { alto: 0.035, vuelo: 0.03 });
    pon(a, caja(K, W, 0.02, 0.4, '#c9b48a', { sinTinta: true }), 0, 0.47, 0);
  });
  // la nave de fierro: las columnas, el techo bajo de zinc y los cuatro pabellones de techo en punta
  for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) if (Math.abs(i) === 2 || Math.abs(j) === 2) pon(g, K.malla(K.cilindro(0.014, 0.018, 0.75, 6), F, { sinTinta: true }), i * 0.52, 0.375, j * 0.52);
  pon(g, caja(K, 2.2, 0.05, 2.2, ZD, { grosor: 0.002 }), 0, 0.75, 0);
  const t0 = techo(K, 2.2, 2.2, 0.22, { tipo: 'cuatro', vuelo: 0.02, mat: K.mat(Z) }); t0.position.y = 0.77; g.add(t0);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => {
    const p = new THREE.Group(); p.position.set(a * 0.72, 0.77, b * 0.72); g.add(p);
    pon(p, caja(K, 0.56, 0.22, 0.56, F, { grosor: 0.002 }), 0, 0.11, 0);
    for (let k = 0; k < 4; k++) { const f = new THREE.Group(); pon(p, f, 0, 0, 0, k * Math.PI / 2); for (let m = 0; m < 4; m++) pon(f, caja(K, 0.08, 0.14, 0.01, '#cfe0e0', { sinTinta: true }), -0.2 + m * 0.133, 0.11, 0.282); }   // las vidrieras
    const tp = techo(K, 0.6, 0.6, 0.3, { tipo: 'cuatro', vuelo: 0.03, mat: K.mat(Z) }); tp.position.y = 0.22; p.add(tp);
    pon(p, K.malla(K.cono(0.02, 0.14, 6), F, { sinTinta: true }), 0, 0.59, 0);
  });
  // la torre del centro con su linterna de persianas y la cúpula de zinc
  pon(g, caja(K, 0.6, 0.5, 0.6, F, { grosor: 0.002 }), 0, 1.1, 0);
  for (let k = 0; k < 4; k++) { const f = new THREE.Group(); pon(g, f, 0, 0, 0, k * Math.PI / 2); for (let m = 0; m < 5; m++) pon(f, caja(K, 0.07, 0.36, 0.01, '#d8e2de', { sinTinta: true }), -0.22 + m * 0.11, 1.1, 0.302); }
  cornisa(K, g, 0.64, 1.35, 0.3, '#3a4846', { alto: 0.03, vuelo: 0.03 });
  const cu = K.malla(K.esfera(0.34, 0.7), Z, { grosor: 0.002 }); cu.scale.y = 0.85; cu.position.y = 1.38; g.add(cu);
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, n = K.malla(K.toro(0.34, 0.006, Math.PI, 0.5), ZD, { sinTinta: true }); n.rotation.set(0, a, Math.PI / 2); n.scale.set(0.85, 1, 1); n.position.y = 1.38; g.add(n); }   // los nervios
  pon(g, K.malla(K.cilindro(0.04, 0.05, 0.1, 8), F, { grosor: 0.001 }), 0, 1.72, 0); pon(g, K.malla(K.cono(0.025, 0.18, 6), F, { sinTinta: true }), 0, 1.86, 0);
  // el pórtico de entrada, con el frontón y su letrero
  const po = new THREE.Group(); po.position.set(0, 0, W / 2); g.add(po);
  pon(po, caja(K, 0.56, 0.62, 0.1, C, { grosor: 0.002 }), 0, 0.31, 0.03);
  vanoArco(K, po, 0, 0.0, 0.082, 0.28, 0.48, '#3c4a46');
  pilastras(K, po, [-0.25, 0.25], 0.0, 0.62, 0.08, CD, { w: 0.05, prof: 0.02 });
  pon(po, fronton(K, 0.62, 0.16, 0.06, CD), 0, 0.62, 0.02);
  const lt = textura('sc-mercado', 160, 24, (c, w, h) => { c.fillStyle = '#f4e4b4'; c.fillRect(0, 0, w, h); c.fillStyle = '#4a3a2a'; c.font = 'bold 13px Georgia'; c.textAlign = 'center'; c.fillText('MERCADO CENTRAL', w / 2, 17); });
  const le = new THREE.Mesh(propia(new THREE.PlaneGeometry(0.54, 0.08)), K.matMapa(lt)); le.position.set(0, 0.665, 0.085); po.add(le);
  g.userData.ficha = { titulo: 'El Mercado Central', texto: 'la nave de fierro fundida en Glasgow, inaugurada en 1872; la construyó Fermín Vivaceta' };
  return g;
}
export function segunda(K, variante = VARIANTES.segunda) {
  return variante === 'moneda' ? laMoneda(K) : variante === 'mercado' ? mercadoCentral(K) : calYCanto(K);
}
export function heroe(K, variante = VARIANTES.heroe, etapa = 3) {
  return variante === 'plaza' ? plazaDeArmas(K, etapa) : variante === 'sanfrancisco' ? sanFrancisco(K, etapa) : cerroSantaLucia(K, etapa);
}

/* ============================================================
   LAS CASAS: tres idiomas, cada uno un grupito de casas distintas entre sí.
   A · la casa de patio colonial: adobe con cal y zócalo pintado, teja de greda en anillo alrededor del patio, el
       zaguán con su portón, ventanas con reja, el corredor de pilares de madera y el patio con naranjo, parrón o pozo.
   B · la casa de dos pisos del siglo XIX con su balcón corrido de madera, el alero sobre canes, las puertas de tienda
       abajo (la Casa Colorada, 1769, y las de la calle del Rey).
   C · las afueras: la quinta con su corredor a lo largo, el parrón, el horno de barro, el pozo y la carreta; y los ranchos
       de quincha y paja con su ramada.
   ============================================================ */
const zocalo = (K, g, w, d, color, h = 0.08) => pon(g, caja(K, w + 0.012, h, d + 0.012, color, { grosor: 0.0015 }), 0, h / 2, 0);
export function casaPatio(K, { w = 1.4, d = 1.3, t = 0.42, h = 0.6, color = SC.cal, zoc = ZOCALOS[0], patio = 'naranjo', puerta = 0, ventanas = 2, semilla = 1 } = {}) {
  const g = new THREE.Group();
  const alas = [[0, d / 2 - t / 2, w, t], [0, -d / 2 + t / 2, w, t], [w / 2 - t / 2, 0, t, d - 2 * t], [-w / 2 + t / 2, 0, t, d - 2 * t]];
  alas.forEach(([x, z, aw, ad]) => { const a = new THREE.Group(); pon(g, a, x, 0, z); pon(a, caja(K, aw, h, ad, color, { grosor: 0.003 }), 0, h / 2, 0); zocalo(K, a, aw, ad, zoc); });
  const tr = techoAnillo(K, w, d, t, 0.22, 0.06); tr.position.y = h; g.add(tr);
  // la fachada a la calle (+z): el zaguán, las ventanas con reja, la cornisa de cal
  const xz = puerta * (w / 2 - 0.25);
  porton(K, g, xz, d / 2 + 0.002, { w: 0.22, h: 0.36, marco: SC.calD });
  for (let k = 0; k < ventanas; k++) { const x = -w / 2 + (k + 0.5) * w / ventanas; if (Math.abs(x - xz) < 0.24) continue; ventanaReja(K, g, x, 0.33, d / 2 + 0.004, 0.13, 0.2); }
  pon(g, caja(K, w + 0.02, 0.03, 0.03, SC.calD, { grosor: 0.001 }), 0, h - 0.03, d / 2 + 0.01);
  // el costado (+x) también tiene su ventana
  ventanaReja(K, g, w / 2 + 0.004, 0.33, 0, 0.12, 0.19, Math.PI / 2);
  // el patio: el suelo de tierra, el corredor de pilares bajo el alero y lo que tiene
  const pw = w - 2 * t, pd = d - 2 * t;
  pon(g, caja(K, pw, 0.012, pd, '#d9c69a', { sinTinta: true }), 0, 0.006, 0);
  [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, b]) => { const L = a ? pd : pw, n = Math.max(2, Math.round(L / 0.22)); for (let k = 0; k <= n; k++) { const u = -L / 2 + k * L / n; pon(g, caja(K, 0.025, h - 0.02, 0.025, SC.madera, { grosor: 0.001 }), a ? a * (pw / 2 - 0.02) : u, (h - 0.02) / 2, b ? b * (pd / 2 - 0.02) : u); } });
  if (patio === 'naranjo') { const n = naranjo(K, 1.05); g.add(n); }
  else if (patio === 'parron') { const pa = parron(K, pw * 0.8, pd * 0.7, h * 0.62); g.add(pa); }
  else { pon(g, K.malla(K.cilindro(0.08, 0.09, 0.1, 10), SC.piedra, { grosor: 0.0015 }), 0, 0.05, 0); [-1, 1].forEach(l => pon(g, caja(K, 0.015, 0.26, 0.015, SC.maderaD, { sinTinta: true }), l * 0.08, 0.13, 0)); pon(g, caja(K, 0.18, 0.015, 0.015, SC.maderaD, { sinTinta: true }), 0, 0.26, 0); const m = palma(K, 0.6); m.position.set(pw * 0.25, 0, -pd * 0.25); g.add(m); }
  for (let k = 0; k < 3; k++) pon(g, K.malla(K.cilindro(0.025, 0.02, 0.04, 6), SC.teja, { sinTinta: true }), -pw / 2 + 0.08 + k * 0.06, 0.02, pd / 2 - 0.06);   // los maceteros del corredor
  return g;
}
export function casaBalcon(K, { w = 1.1, d = 0.6, h = 1.15, color = SC.colorado, zoc = ZOCALOS[1], tiendas = 2, semilla = 1, fondo = true } = {}) {
  const g = new THREE.Group(), H1 = h * 0.5;
  pon(g, caja(K, w, h, d, color, { grosor: 0.003 }), 0, h / 2, 0); zocalo(K, g, w, d, zoc);
  pon(g, caja(K, w + 0.02, 0.035, d + 0.02, SC.calD, { grosor: 0.0012 }), 0, H1, 0);   // la línea de piso
  const t = techo(K, w, d + 0.22, 0.24, { tipo: 'dos', vuelo: 0.05 }); t.position.set(0, h, 0.04); g.add(t);   // el alero largo sobre el balcón
  for (let k = 0; k <= Math.round(w / 0.1); k++) pon(g, caja(K, 0.02, 0.025, 0.12, SC.maderaD, { sinTinta: true }), -w / 2 + k * w / Math.round(w / 0.1), h - 0.02, d / 2 + 0.06);   // los canes
  // abajo: el zaguán y las puertas de tienda; arriba: las puertas al balcón
  const n = tiendas + 1;
  for (let k = 0; k < n; k++) { const x = -w / 2 + (k + 0.5) * w / n; if (k === 0) porton(K, g, x, d / 2 + 0.002, { w: 0.2, h: 0.36, marco: SC.calD }); else { pon(g, caja(K, 0.15, 0.32, 0.012, SC.madera, { grosor: 0.001 }), x, 0.17, d / 2 + 0.006); pon(g, caja(K, 0.15, 0.008, 0.014, SC.maderaD, { sinTinta: true }), x, 0.23, d / 2 + 0.012); } }
  for (let k = 0; k < n; k++) { const x = -w / 2 + (k + 0.5) * w / n; pon(g, caja(K, 0.13, 0.3, 0.012, SC.vano, { sinTinta: true }), x, H1 + 0.2, d / 2 + 0.005); pon(g, caja(K, 0.15, 0.02, 0.02, SC.calD, { sinTinta: true }), x, H1 + 0.36, d / 2 + 0.01); }
  // el balcón corrido: el piso, los pies derechos, la baranda de balaustres de madera
  const B = new THREE.Group(); B.position.set(0, H1, d / 2); g.add(B);
  pon(B, caja(K, w - 0.04, 0.025, 0.15, SC.maderaL, { grosor: 0.0015 }), 0, 0.03, 0.075);
  for (let k = 0; k <= n; k++) pon(B, caja(K, 0.022, h - H1 - 0.04, 0.022, SC.maderaD, { grosor: 0.001 }), -w / 2 + 0.03 + k * (w - 0.06) / n, (h - H1) / 2, 0.14);
  pon(B, caja(K, w - 0.04, 0.018, 0.02, SC.maderaD, { grosor: 0.001 }), 0, 0.17, 0.145);
  for (let k = 0; k < Math.round(w / 0.035); k++) pon(B, caja(K, 0.007, 0.12, 0.007, SC.madera, { sinTinta: true }), -w / 2 + 0.04 + k * 0.035, 0.1, 0.145);
  if (fondo) { const p = casaPatio(K, { w: w * 0.9, d: 0.8, t: 0.3, h: 0.5, color, zoc, patio: semilla % 2 ? 'naranjo' : 'parron', ventanas: 0 }); p.position.set(0, 0, -d / 2 - 0.4); g.add(p); }
  return g;
}
export function hornoBarro(K) { const g = new THREE.Group(); const c = K.malla(K.esfera(0.13, 0.6), '#c98a5a', { grosor: 0.002 }); c.scale.y = 0.8; c.position.y = 0.06; g.add(c); pon(g, caja(K, 0.06, 0.05, 0.02, '#3a2a20', { sinTinta: true }), 0, 0.05, 0.125); pon(g, K.malla(K.cilindro(0.15, 0.16, 0.06, 10), SC.calD, { grosor: 0.0015 }), 0, 0.03, 0); return g; }
export function carreta(K, bueyes = true) {   // la carreta de bueyes, de ruedas macizas
  const g = new THREE.Group();
  pon(g, caja(K, 0.34, 0.03, 0.2, SC.madera, { grosor: 0.0015 }), 0, 0.15, 0);
  [-1, 1].forEach(l => { pon(g, caja(K, 0.34, 0.08, 0.012, SC.maderaD, { sinTinta: true }), 0, 0.2, l * 0.1); const r = K.malla(K.cilindro(0.1, 0.1, 0.03, 12), SC.maderaD, { grosor: 0.0015 }); r.rotation.x = Math.PI / 2; r.position.set(-0.02, 0.1, l * 0.125); g.add(r); });
  pon(g, caja(K, 0.4, 0.02, 0.02, SC.madera, { sinTinta: true }), 0.34, 0.14, 0);   // la pértiga
  pon(g, caja(K, 0.16, 0.06, 0.14, '#d6b56a', { grosor: 0.001 }), -0.04, 0.2, 0);    // la paja de la carga
  if (bueyes) [-1, 1].forEach(l => { const b = new THREE.Group(); b.position.set(0.48, 0, l * 0.07); g.add(b); const cu = K.malla(K.capsula(0.045, 0.1, 0.5), l > 0 ? '#8a6a4a' : '#b89a72', { grosor: 0.0015 }); cu.rotation.z = Math.PI / 2; cu.position.y = 0.12; b.add(cu); pon(b, K.malla(K.esfera(0.035, 0.4), cu.material, { grosor: 0.001 }), 0.11, 0.13, 0); [[-0.05, -0.025], [-0.05, 0.025], [0.05, -0.025], [0.05, 0.025]].forEach(([x, z]) => pon(b, K.malla(K.cilindro(0.01, 0.01, 0.08, 4), '#4a3a2a', { sinTinta: true }), x, 0.04, z)); });
  return g;
}
export function quintaCasa(K, { w = 1.7, d = 0.55, h = 0.55, color = SC.cal, zoc = ZOCALOS[2], semilla = 1 } = {}) {   // la casa de la quinta, con su corredor a lo largo
  const g = new THREE.Group(), cor = 0.3;
  pon(g, caja(K, w, h, d, color, { grosor: 0.003 }), 0, h / 2, -cor / 2); zocalo(K, g, w, d, zoc); g.children[g.children.length - 1].position.z = -cor / 2;
  const t = techo(K, w, d + cor, 0.26, { tipo: 'dos', vuelo: 0.05 }); t.position.set(0, h, 0); g.add(t);
  const n = Math.round(w / 0.28); for (let k = 0; k <= n; k++) pon(g, caja(K, 0.03, h - 0.02, 0.03, SC.madera, { grosor: 0.001 }), -w / 2 + 0.03 + k * (w - 0.06) / n, (h - 0.02) / 2, d / 2 + cor / 2 - 0.03);
  pon(g, caja(K, w, 0.02, cor, '#c9a87a', { sinTinta: true }), 0, 0.01, d / 2);   // el piso de ladrillo del corredor
  for (let k = 0; k < 3; k++) { const x = -w / 2 + (k + 0.5) * w / 3; if (k === 1) porton(K, g, x, d / 2 - cor / 2 + 0.002, { w: 0.2, h: 0.34, marco: SC.calD }); else ventanaReja(K, g, x, 0.3, d / 2 - cor / 2 + 0.004, 0.12, 0.18); }
  const b = bancoPlaza(K, 0.28); b.position.set(-w * 0.32, 0, d / 2 - 0.05); g.add(b);
  return g;
}
export function rancho(K, { w = 0.62, d = 0.46, semilla = 1 } = {}) {   // el rancho de quincha embarrada y techo de paja, con su ramada
  const g = new THREE.Group(), h = 0.4;
  pon(g, caja(K, w, h, d, '#d8bf94', { grosor: 0.002 }), 0, h / 2, 0);
  const paja = K.mat('#d6b56a');
  const t = techo(K, w, d, 0.3, { tipo: 'cuatro', vuelo: 0.07, mat: paja }); t.position.y = h; g.add(t);
  pon(g, caja(K, 0.12, 0.27, 0.01, '#4a3a2a', { sinTinta: true }), w * 0.15, 0.135, d / 2 + 0.003);
  const ra = new THREE.Group(); ra.position.set(-w / 2 - 0.3, 0, 0.08); g.add(ra);   // la ramada
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => pon(ra, K.malla(K.cilindro(0.012, 0.014, 0.34, 4), SC.maderaD, { sinTinta: true }), a * 0.2, 0.17, b * 0.16));
  for (let k = 0; k < 4; k++) { const r = K.malla(K.esfera(0.12, 0.4), k % 2 ? '#a8a060' : '#8a9a50', { sinTinta: true }); r.scale.set(1.4, 0.3, 1); r.position.set(-0.12 + k * 0.08, 0.36, (k % 2 - 0.5) * 0.12); ra.add(r); }
  pon(ra, K.malla(K.cilindro(0.04, 0.03, 0.05, 8), '#3a3a38', { sinTinta: true }), 0, 0.04, 0);   // la olla en el fogón
  return g;
}
/* los barrios de la hoja: cada uno un grupito de 4-6 casas distintas, a escala con una persona (su suelo, la calle) */
export function barrio(K, variante = VARIANTES.casas) {
  const g = new THREE.Group();
  if (variante === 'balcon') {
    const fila = [[-1.7, 1.15, SC.colorado, 2], [-0.48, 1.0, SC.ocre, 1], [0.66, 1.05, SC.celeste, 2], [1.8, 1.05, SC.cal, 1]];
    fila.forEach(([x, w, c, ti], i) => { const ca = casaBalcon(K, { w, color: c, zoc: ZOCALOS[(i + 1) % 5], tiendas: ti, h: 1.1 + (i % 2) * 0.12, semilla: i }); ca.position.set(x, 0, 0.0); g.add(ca); });
    const es = casaBalcon(K, { w: 0.95, color: SC.verdeAgua, zoc: ZOCALOS[3], tiendas: 1, h: 1.05, fondo: false }); es.position.set(-2.0, 0, 1.7); es.rotation.y = Math.PI / 2; g.add(es);   // la de enfrente
    const pu = casaPatio(K, { w: 1.2, d: 1.0, t: 0.34, color: SC.amarillo, zoc: ZOCALOS[4], patio: 'pozo', ventanas: 1, puerta: 1 }); pu.position.set(-0.6, 0, 1.95); pu.rotation.y = Math.PI / 2; g.add(pu);
    const f = farol(K); f.position.set(0.1, 0, 0.62); g.add(f);
    const c = carreta(K, false); c.position.set(-0.4, 0, 0.95); c.rotation.y = 0.3; g.add(c);
  } else if (variante === 'quinta') {
    const q1 = quintaCasa(K, { w: 1.8, color: SC.cal, zoc: ZOCALOS[2] }); q1.position.set(-0.9, 0, -0.6); g.add(q1);
    const q2 = quintaCasa(K, { w: 1.3, d: 0.5, color: SC.rosado, zoc: ZOCALOS[0] }); q2.position.set(1.3, 0, -0.15); q2.rotation.y = -0.5; g.add(q2);
    const r1 = rancho(K); r1.position.set(-1.6, 0, 1.15); r1.rotation.y = 0.4; g.add(r1);
    const r2 = rancho(K, { w: 0.5, d: 0.4 }); r2.position.set(0.3, 0, 1.45); r2.rotation.y = -0.2; g.add(r2);
    const pa = parron(K, 0.7, 0.55, 0.36); pa.position.set(0.25, 0, 0.35); g.add(pa);
    const ho = hornoBarro(K); ho.position.set(-0.3, 0, 0.55); g.add(ho);
    const ca = carreta(K); ca.position.set(1.4, 0, 0.9); ca.rotation.y = -0.6; g.add(ca);
    pon(g, K.malla(K.cilindro(0.07, 0.08, 0.09, 10), SC.piedra, { grosor: 0.0015 }), -1.85, 0.045, 0.25);   // el pozo
    [[-2.2, -0.9], [-2.25, -0.2], [2.2, -1.0], [2.25, -0.3], [2.3, 0.4]].forEach(([x, z], i) => { const a = alamo(K, 0.95 + (i % 2) * 0.2); a.position.set(x, 0, z); g.add(a); });
    [[0.1, -1.5], [0.6, -1.4], [1.1, -1.5], [-0.4, -1.45]].forEach(([x, z], i) => { const n = naranjo(K, 0.9, i % 2 === 0); n.position.set(x, 0, z); g.add(n); });
    for (let k = 0; k < 5; k++) pon(g, K.malla(K.esfera(0.02, 0.4), '#f4f0e6', { sinTinta: true }), -0.6 + k * 0.08, 0.02, 1.0 + (k % 2) * 0.05);   // las gallinas
  } else {
    const casas = [[-1.55, -0.55, 1.5, 1.3, SC.cal, 'naranjo', -1, 0.6], [0.05, -0.65, 1.15, 1.1, SC.ocre, 'parron', 0, 0.56], [1.6, -0.5, 1.45, 1.4, SC.celeste, 'pozo', 1, 0.62]];
    casas.forEach(([x, z, w, d, c, pa, pu, h], i) => { const ca = casaPatio(K, { w, d, h, color: c, zoc: ZOCALOS[i], patio: pa, puerta: pu, ventanas: 2 + (i % 2), semilla: i }); ca.position.set(x, 0, z); g.add(ca); });
    const e1 = casaPatio(K, { w: 1.25, d: 1.1, t: 0.36, h: 0.58, color: SC.rosado, zoc: ZOCALOS[3], patio: 'naranjo', puerta: 1, ventanas: 2 }); e1.position.set(-1.75, 0, 1.6); e1.rotation.y = Math.PI / 2; g.add(e1);
    const e2 = casaPatio(K, { w: 1.05, d: 1.0, t: 0.34, h: 0.55, color: SC.amarillo, zoc: ZOCALOS[4], patio: 'parron', puerta: -1, ventanas: 1 }); e2.position.set(-0.35, 0, 1.75); e2.rotation.y = Math.PI / 2; g.add(e2);
    const c = carreta(K); c.position.set(1.4, 0, 0.6); c.rotation.y = Math.PI; g.add(c);
    const a = alamo(K, 1.0); a.position.set(-2.45, 0, 0.6); g.add(a);
  }
  return g;
}
