/* ============================================================
   secretos
   Los huevos de pascua del 3D (docs/secretos-plan.md): «lo que se enseñaba en secreto». Cada época pone el suyo
   con estas piezas; el motor 2D lleva el registro (SECRETOS), el hallazgo (hallarSecreto), la tarjeta y el
   gabinete del museo. Escondidos pero justos: aparecen de noche o en una estación, con un brillo tenue que
   delata a quien mira con atención.
   ============================================================ */
import * as THREE from 'three';
import { texturaCanvas } from './piezas.js';

/* el brillo que delata un secreto: unas chispas doradas que titilan, sin luz propia sobre el mundo */
export function chispitas(n = 7, radio = 0.25, alto = 0.5) {
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { const a = i * 2.4, r = radio * (0.4 + (i % 3) * 0.3); pos.set([Math.cos(a) * r, alto * (0.3 + (i % 4) * 0.22), Math.sin(a) * r], i * 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.userData.propia = true;
  const mat = new THREE.PointsMaterial({ color: '#ffe08a', size: 5, sizeAttenuation: false, transparent: true, opacity: 0.8, depthWrite: false, blending: THREE.AdditiveBlending });
  const p = new THREE.Points(geo, mat); p.userData.vivo = true;
  p.userData.titilar = t => { mat.opacity = 0.35 + 0.45 * Math.max(0, Math.sin(t * 2.3)) * (0.6 + 0.4 * Math.sin(t * 7.1)); p.rotation.y = t * 0.4; };
  return p;
}

/* EL HECHICERO DE TROIS-FRÈRES, a la luz de la antorcha: cuernos de ciervo, ojos de búho, barba, manos como patas,
   piernas de hombre que bailan y cola de caballo; carbón y ocre sobre la roca (el dibujo de Breuil, 1930) */
export function hechicero(K) {
  const tex = texturaCanvas(512, 640, (g, W, H) => {
    // la roca de la pared, iluminada por la antorcha: un óvalo irregular que se apaga hacia los bordes
    const halo = g.createRadialGradient(W * 0.52, H * 0.5, 20, W * 0.52, H * 0.5, W * 0.62);
    halo.addColorStop(0, 'rgba(236, 190, 128, 1)'); halo.addColorStop(0.45, 'rgba(214, 156, 98, 0.95)'); halo.addColorStop(0.8, 'rgba(150, 96, 58, 0.55)'); halo.addColorStop(1, 'rgba(90, 56, 34, 0)');
    g.fillStyle = halo; g.beginPath();
    for (let k = 0; k <= 24; k++) { const a = k / 24 * Math.PI * 2, r = 1 + 0.08 * Math.sin(a * 5) + 0.05 * Math.cos(a * 9); const x = W * 0.52 + Math.cos(a) * W * 0.47 * r, y = H * 0.5 + Math.sin(a) * H * 0.46 * r; k ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.closePath(); g.fill();
    g.fillStyle = 'rgba(120, 76, 44, 0.18)';                 // las manchas y grietas de la caliza
    for (let k = 0; k < 40; k++) { g.beginPath(); g.ellipse(60 + (k * 97) % 400, 70 + (k * 61) % 500, 6 + (k % 5) * 4, 3 + (k % 3) * 2, k, 0, 7); g.fill(); }
    g.lineCap = 'round'; g.lineJoin = 'round';
    const carbon = '#1e130b', ocre = 'rgba(150, 62, 26, 0.85)';
    // la cola de caballo, barriendo hacia atrás desde la cadera
    g.strokeStyle = carbon; g.lineWidth = 9;
    for (let k = 0; k < 7; k++) { g.beginPath(); g.moveTo(205, 420); g.quadraticCurveTo(150 - k * 5, 430 + k * 4, 128 - k * 6, 500 + k * 10); g.stroke(); }
    // las piernas de hombre, en cuclillas de baile: una adelante y otra atrás
    g.lineWidth = 20;
    g.beginPath(); g.moveTo(250, 440); g.lineTo(300, 492); g.lineTo(282, 566); g.lineTo(318, 572); g.stroke();
    g.beginPath(); g.moveTo(222, 438); g.lineTo(196, 500); g.lineTo(222, 566); g.lineTo(190, 574); g.stroke();
    // el torso, inclinado hacia adelante como quien baila agachado
    g.fillStyle = ocre; g.save(); g.translate(262, 352); g.rotate(-0.45);
    g.beginPath(); g.ellipse(0, 0, 62, 104, 0, 0, 7); g.fill(); g.lineWidth = 7; g.stroke(); g.restore();
    // los brazos cortos, con manos como patas, hacia adelante
    g.lineWidth = 15; g.beginPath(); g.moveTo(300, 300); g.lineTo(352, 336); g.stroke(); g.beginPath(); g.moveTo(292, 330); g.lineTo(346, 372); g.stroke();
    g.fillStyle = carbon; [[358, 338], [352, 376]].forEach(([x, y]) => { g.beginPath(); g.ellipse(x, y, 12, 8, 0.6, 0, 7); g.fill(); });
    // la cabeza de frente, con la barba larga
    g.fillStyle = ocre; g.beginPath(); g.ellipse(318, 214, 44, 46, 0, 0, 7); g.fill(); g.lineWidth = 7; g.stroke();
    g.fillStyle = carbon; g.beginPath(); g.moveTo(298, 246); g.quadraticCurveTo(312, 300, 322, 318); g.quadraticCurveTo(338, 288, 338, 246); g.closePath(); g.fill();
    // los ojos de búho, redondos y grandes
    [[300, 206], [337, 206]].forEach(([x, y]) => { g.fillStyle = '#f4e6c8'; g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill(); g.lineWidth = 5; g.strokeStyle = carbon; g.stroke(); g.fillStyle = carbon; g.beginPath(); g.arc(x, y, 6, 0, 7); g.fill(); });
    // las orejas puntiagudas, de ciervo
    g.fillStyle = carbon; [[282, 182, -1], [354, 182, 1]].forEach(([x, y, l]) => { g.beginPath(); g.moveTo(x, y); g.lineTo(x + l * 26, y - 26); g.lineTo(x + l * 6, y - 4); g.closePath(); g.fill(); });
    // la cornamenta de ciervo, ancha y con sus puntas
    g.strokeStyle = carbon;
    [[-1, 302], [1, 334]].forEach(([l, x]) => {
      g.lineWidth = 15; g.beginPath(); g.moveTo(x, 172); g.quadraticCurveTo(x + l * 30, 110, x + l * 92, 52); g.stroke();
      [[0.3, 46], [0.58, 40], [0.85, 30]].forEach(([u, lar]) => {
        const bx = x + l * (30 * u * 2 * (1 - u) + 92 * u * u), by = 172 - 120 * u; g.lineWidth = 11; g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + l * lar * 0.25, by - lar); g.stroke();
      });
    });
    // las vetas de la roca encima, para que se lea pintado en la pared y no pegado
    g.globalCompositeOperation = 'destination-out'; g.strokeStyle = 'rgba(0,0,0,0.12)'; g.lineWidth = 2.5;
    for (let k = 0; k < 14; k++) { g.beginPath(); g.moveTo(40 + k * 34, 60); g.bezierCurveTo(70 + k * 30, 260, 20 + k * 36, 420, 60 + k * 32, 620); g.stroke(); }
  });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.78), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.geometry.userData.propia = true; m.userData.vivo = true;
  return m;
}

/* EL HÍGADO DE ARCILLA: el modelo de hígado de oveja con sus lóbulos, el «dedo», la vesícula, los agujeros y la
   escritura, sobre su pie de adobe (como los de Mari) */
export function higado(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const arcilla = '#dba878', oscura = '#a8714a';
  const pie = K.malla(K.caja(0.17, 0.15, 0.17), '#8a6446', { grosor: 0.005 }); pie.position.y = 0.075; g.add(pie);   // el pie de adobe, más oscuro que la arcilla cocida
  const tapa = K.malla(K.caja(0.21, 0.025, 0.21), '#9c7452', { grosor: 0.004 }); tapa.position.y = 0.16; g.add(tapa);
  // el hígado, más grande que su pie e inclinado hacia quien mira, para que se lean sus agujeros y su escritura
  const h = new THREE.Group(); h.position.y = 0.21; h.scale.setScalar(1.45); h.rotation.y = 0.5; g.add(h);
  h.rotateOnWorldAxis(new THREE.Vector3(1, 0, -1).normalize(), 0.42);
  const lobulo = (r, x, z, sx, sz) => { const l = K.malla(K.esfera(r, 0.8), arcilla, { grosor: 0.004 }); l.scale.set(sx, 0.32, sz); l.position.set(x, 0, z); h.add(l); };
  lobulo(0.1, -0.03, 0, 1.3, 1.0); lobulo(0.075, 0.08, -0.04, 1.0, 0.9); lobulo(0.06, -0.1, 0.05, 0.9, 0.8);
  const dedo = K.malla(K.cono(0.022, 0.07, 6), oscura, { grosor: 0.003 }); dedo.position.set(0.0, 0.04, -0.03); h.add(dedo);   // el «dedo», el proceso piramidal
  const vesicula = K.malla(K.capsula(0.014, 0.04, 0.6), '#7f8a4a', { grosor: 0.003 }); vesicula.rotation.z = Math.PI / 2; vesicula.position.set(0.07, 0.025, 0.05); h.add(vesicula);
  for (let i = 0; i < 9; i++) {                              // los agujeros de las clavijas y las cuñas de la escritura
    const d = K.malla(K.cilindro(0.008, 0.008, 0.006, 6), '#3a2414', { sinTinta: true }); d.position.set(-0.11 + (i % 5) * 0.045, 0.034, -0.03 + Math.floor(i / 5) * 0.06); h.add(d);
    const c = K.malla(K.caja(0.016, 0.004, 0.006), '#5a3c26', { sinTinta: true }); c.position.set(-0.09 + (i % 3) * 0.05, 0.035, 0.03 + Math.floor(i / 3) * 0.018); c.rotation.y = 0.4 * (i % 2); h.add(c);
  }
  return g;
}

/* LA CAJA DEL LIBRO DE THOT: la de oro, con la serpiente que no muere enroscada; sube del agua y se vuelve a hundir */
export function cajaThot(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const oro = K.mat('#e6bb4c', { emissive: '#c99a2e', emissiveIntensity: 0.35 });
  const c = K.malla(K.caja(0.32, 0.2, 0.22), oro, { grosor: 0.006 }); c.position.y = 0.1; g.add(c);
  const tapa = K.malla(K.caja(0.34, 0.05, 0.24), oro, { grosor: 0.006 }); tapa.position.y = 0.225; g.add(tapa);
  [-1, 1].forEach(l => { const b = K.malla(K.caja(0.01, 0.16, 0.225), '#2a64ad', { sinTinta: true }); b.position.set(l * 0.1, 0.1, 0); g.add(b); });   // las bandas de azul egipcio
  const serp = K.malla(K.toro(0.2, 0.025, Math.PI * 1.7, 0.7), '#2f4a3a', { grosor: 0.004 }); serp.rotation.x = Math.PI / 2; serp.position.y = 0.06; g.add(serp);
  const cab = K.malla(K.esfera(0.035, 0.6), '#2f4a3a', { grosor: 0.003 }); cab.scale.set(1, 0.8, 1.4); cab.position.set(0.2, 0.08, -0.06); g.add(cab);
  return g;
}

/* el resplandor: un disco de luz dorada que se apaga hacia el borde, sin escribir profundidad (bajo el agua se ve a
   través de la lámina; en el suelo, es el charco de luz de una lámpara) */
let texResplandor = null;
function texLuz() {
  texResplandor ||= texturaCanvas(128, 128, (g, W) => {
    const gr = g.createRadialGradient(W / 2, W / 2, 0, W / 2, W / 2, W / 2);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.75)'); gr.addColorStop(0.7, 'rgba(255,255,255,.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, W);
  });
  texResplandor.userData.propia = false;                     // la comparten todos: no se libera con una pieza
  return texResplandor;
}
export function resplandor(r = 0.35, color = '#ffd76a') {
  const geo = new THREE.PlaneGeometry(r * 2, r * 2); geo.userData.propia = true;
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, map: texLuz(), transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending }));
  m.rotation.x = -Math.PI / 2; m.userData.vivo = true;
  return m;
}

/* las ondas que se abren desde un punto del agua, como si algo respirara abajo */
export function ondas(n = 3, radio = 0.6, color = '#ffd76a') {
  const g = new THREE.Group(); g.userData.vivo = true;
  const anillos = [];
  for (let i = 0; i < n; i++) {
    const geo = new THREE.RingGeometry(0.955, 1, 48); geo.userData.propia = true;
    const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; g.add(m); anillos.push(m);
  }
  g.userData.latir = t => anillos.forEach((m, i) => {
    const u = ((t * 0.35 + i / n) % 1);                      // cada anillo nace chico y se abre apagándose
    m.scale.setScalar(0.08 + radio * u); m.material.opacity = 0.42 * Math.sin(Math.PI * u) * (1 - u * 0.6);
  });
  return g;
}

/* EL HORNO DEL ALQUIMISTA, en una azotea de Racotis: el atanor de barro con su fuego verde (el cobre en la llama), el
   alambique de vidrio de María la Judía y, pintada en el suelo, la serpiente que se muerde la cola con ΕΝ ΤΟ ΠΑΝ */
export function hornoAlquimista(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  /* el uróboros de la Crisopea de Cleopatra: la serpiente que se muerde la cola, mitad oscura y mitad clara, con ΕΝ ΤΟ ΠΑΝ
     («el uno es el todo») escrito adentro */
  const tx = texturaCanvas(512, 512, (c, W) => {
    c.clearRect(0, 0, W, W);
    const cx = W / 2, cy = W / 2, R = 166, a0 = 0.22, a1 = Math.PI * 2 - 0.14, N = 260;
    const pt = (a, r = R) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
    const ancho = u => 12 + 40 * Math.min(1, u * 2.4);                       // se afina hacia la punta de la cola
    for (const pasada of [0, 1]) for (let i = 0; i <= N; i++) {            // primero la tinta del borde, después el cuerpo
      const u = i / N, [x, y] = pt(a0 + (a1 - a0) * u), w = ancho(u);
      c.fillStyle = pasada ? (u < 0.5 ? '#e7d196' : '#24513a') : '#13261b';
      c.beginPath(); c.arc(x, y, w / 2 + (pasada ? 0 : 3.5), 0, 7); c.fill();
    }
    c.lineWidth = 2.6; c.lineCap = 'round';                                  // las escamas: chevrones a lo largo del cuerpo
    for (let i = 4; i < N - 6; i += 6) {
      const u = i / N, a = a0 + (a1 - a0) * u, w = ancho(u), [x, y] = pt(a);
      c.strokeStyle = u < 0.5 ? '#b38f45' : '#4f9a68';
      c.save(); c.translate(x, y); c.rotate(a + Math.PI / 2);
      c.beginPath(); c.moveTo(-w * 0.28, -w * 0.22); c.lineTo(0, w * 0.12); c.lineTo(w * 0.28, -w * 0.22); c.stroke(); c.restore();
    }
    const ah = a1 + 0.1, [hx, hy] = pt(ah);                                  // la cabeza que muerde la cola
    c.save(); c.translate(hx, hy); c.rotate(ah + Math.PI / 2);
    c.scale(1.2, 1.2);
    c.fillStyle = '#13261b'; c.beginPath(); c.ellipse(4, 0, 36, 27, 0, 0, 7); c.fill();
    c.fillStyle = '#24513a'; c.beginPath(); c.ellipse(4, 0, 32, 23, 0, 0, 7); c.fill();
    c.fillStyle = '#13261b'; c.beginPath(); c.moveTo(36, -3); c.lineTo(12, 2); c.lineTo(36, 9); c.fill();   // la boca abierta sobre la cola
    c.fillStyle = '#f6e7b0'; c.beginPath(); c.arc(8, -12, 6.5, 0, 7); c.fill();                            // el ojo
    c.fillStyle = '#0d1a12'; c.beginPath(); c.ellipse(9, -12, 2.2, 5, 0, 0, 7); c.fill();
    c.restore();
    c.font = '600 44px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.shadowColor = '#7dff9a'; c.shadowBlur = 16; c.fillStyle = '#f3e2ae'; c.fillText('ΕΝ ΤΟ ΠΑΝ', cx, cy + 2); c.shadowBlur = 0;
  });
  /* la azotea, vista desde la cámara del juego: el uróboros adelante, y el horno y el que lo cuida al fondo (lo de atrás no tapa
     nada); el centro del grupo es el centro de la azotea */
  const ou = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false }));
  ou.geometry.userData.propia = true; ou.rotation.x = -Math.PI / 2; ou.position.set(0.08, 0.004, 0.08); g.add(ou);
  const F = { x: -0.26, z: -0.06 };                                                           // el atanor: el horno de fuego lento
  const atanor = K.malla(K.cilindro(0.1, 0.13, 0.22, 12), '#9a6a48', { grosor: 0.004 }); atanor.position.set(F.x, 0.11, F.z); g.add(atanor);
  [0.05, 0.12, 0.19].forEach(y => { const a = K.malla(K.cilindro(0.128 - y * 0.14, 0.128 - y * 0.14, 0.012, 12), '#7a4e32', { sinTinta: true }); a.position.set(F.x, y, F.z); g.add(a); });   // las hiladas
  const cupula = K.malla(new THREE.SphereGeometry(0.1, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), '#8a5a3a', { grosor: 0.004 }); cupula.geometry.userData.propia = true; cupula.position.set(F.x, 0.22, F.z); g.add(cupula);
  const boca = K.malla(K.caja(0.075, 0.07, 0.02), '#1e140e', { sinTinta: true }); boca.rotation.y = Math.PI / 4; boca.position.set(F.x + 0.085, 0.07, F.z + 0.085); g.add(boca);   // la boca, hacia el que mira
  const llama = K.malla(K.cono(0.04, 0.1, 6), '#7dff9a', { sinTinta: true, sombra: false, emissive: '#3dff7a', emissiveIntensity: 1, transparent: true, opacity: 0.9 }); llama.position.set(F.x + 0.095, 0.085, F.z + 0.095); g.add(llama);
  const vidrio = K.mat('#cfeee6', { transparent: true, opacity: 0.55 });
  const alambique = new THREE.Mesh(K.esfera(0.06, 0.7), vidrio); alambique.position.set(F.x, 0.36, F.z); g.add(alambique);
  const cuello = new THREE.Mesh(K.cilindro(0.012, 0.02, 0.06, 6), vidrio); cuello.position.set(F.x, 0.43, F.z); g.add(cuello);
  const V0 = { x: -0.1, z: -0.27 };                                                           // el vaso que recibe lo destilado
  const A = new THREE.Vector3(F.x + 0.02, 0.44, F.z - 0.01), B = new THREE.Vector3(V0.x, 0.08, V0.z), d = B.clone().sub(A);
  const pico = new THREE.Mesh(K.cilindro(0.007, 0.011, 1, 5), vidrio); pico.scale.y = d.length(); pico.position.copy(A).add(B).multiplyScalar(0.5);
  pico.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(pico);
  const vaso = new THREE.Mesh(K.esfera(0.045, 0.7), vidrio); vaso.position.set(V0.x, 0.045, V0.z); g.add(vaso);
  const verde = K.malla(K.esfera(0.03, 0.6), '#5dff8a', { sinTinta: true, emissive: '#3dff7a', emissiveIntensity: 0.6 }); verde.position.set(V0.x, 0.035, V0.z); g.add(verde);   // lo que gotea, que brilla
  g.userData.llama = llama;
  return g;
}

/* LOS HERMANOS DE LA PUREZA, en una azotea de Bagdad, de noche: la alfombra donde se sientan en círculo, la lámpara de
   aceite en el medio, el libro de las epístolas abierto en su atrilito y el atado de las cincuenta y dos, y en el suelo la
   tablilla del cuadrado mágico de tres (cada fila, columna y diagonal suma quince: lo enseñan en la epístola de los
   números), en cifras de la India, que brilla. Los hermanos los pone la época (personas). */
export function circuloIkhwan(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const alf = K.malla(K.cilindro(0.36, 0.36, 0.012, 24), '#2a3e5e', { sinTinta: true, sombra: false }); alf.position.y = 0.006; g.add(alf);
  const borde = K.malla(K.toro(0.35, 0.012, Math.PI * 2, 0.6), '#c9a24a', { sinTinta: true, sombra: false }); borde.rotation.x = Math.PI / 2; borde.position.y = 0.013; g.add(borde);
  /* la lámpara de aceite de barro, con su llama */
  const lam = K.malla(K.esfera(0.045, 0.6), '#a8683e', { grosor: 0.003 }); lam.scale.set(1.4, 0.55, 1); lam.position.set(0, 0.035, 0); g.add(lam);
  const pico = K.malla(K.cono(0.02, 0.05, 6), '#a8683e', { sinTinta: true }); pico.rotation.z = -Math.PI / 2; pico.position.set(0.07, 0.04, 0); g.add(pico);
  const llama = K.malla(K.cono(0.016, 0.055, 6), '#ffd27a', { sinTinta: true, sombra: false, emissive: '#ffb13b', emissiveIntensity: 1 }); llama.position.set(0.09, 0.075, 0); g.add(llama);
  /* el cuadrado mágico: ٤٩٢ / ٣٥٧ / ٨١٦ */
  const tx = texturaCanvas(192, 192, (c, W) => {
    c.clearRect(0, 0, W, W); c.fillStyle = '#e9d9a8'; c.fillRect(8, 8, W - 16, W - 16);
    c.strokeStyle = '#6a4a22'; c.lineWidth = 4; c.strokeRect(10, 10, W - 20, W - 20);
    c.lineWidth = 2.5; for (let k = 1; k < 3; k++) { const q = 10 + k * (W - 20) / 3; c.beginPath(); c.moveTo(q, 10); c.lineTo(q, W - 10); c.moveTo(10, q); c.lineTo(W - 10, q); c.stroke(); }
    const D = [['٤', '٩', '٢'], ['٣', '٥', '٧'], ['٨', '١', '٦']];
    c.font = '600 40px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#ffd76a'; c.shadowBlur = 10; c.fillStyle = '#4a2e12';
    D.forEach((f, i) => f.forEach((d, j) => c.fillText(d, 10 + (j + 0.5) * (W - 20) / 3, 12 + (i + 0.5) * (W - 20) / 3)));
  });
  const tab = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthWrite: false }));
  tab.geometry.userData.propia = true; tab.rotation.x = -Math.PI / 2; tab.rotation.z = 0.3; tab.position.set(-0.05, 0.016, 0.16); g.add(tab);
  /* el libro de las epístolas, abierto en su atrilito, y el atado de las cincuenta y dos */
  const at = new THREE.Group(); at.position.set(-0.12, 0, -0.1); at.rotation.y = 0.6; g.add(at);
  [-1, 1].forEach(l => { const t = K.malla(K.caja(0.12, 0.01, 0.1), '#6a4a2e', { grosor: 0.002 }); t.position.set(0, 0.055, l * 0.022); t.rotation.x = l * 0.75; at.add(t); });
  [-1, 1].forEach(l => { const h = K.malla(K.caja(0.055, 0.006, 0.075), '#f4ecd6', { grosor: 0.0015 }); h.position.set(l * 0.028, 0.105, 0.008); h.rotation.set(-0.55, 0, -l * 0.12); at.add(h); });
  for (let k = 0; k < 5; k++) { const b = K.malla(K.caja(0.09, 0.02, 0.07, ), ['#3a2a5a', '#2a3e5e', '#5a2a3a'][k % 3], { grosor: 0.0015 }); b.position.set(0.16, 0.01 + k * 0.021, -0.14); b.rotation.y = k * 0.18; g.add(b); }
  g.userData.llama = llama; g.userData.tablilla = tab;
  return g;
}

/* EL ESPEJO QUE HUMEA (Tezcatlipoca), en lo alto del templo de un calpulli, de noche: el espejo redondo de obsidiana pulida
   sobre su marco de madera, que refleja las estrellas, y el brasero de copal que echa su humo blanco delante. El sacerdote
   que mira lo pone la época (una persona). */
export function espejoHumeante(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const tx = texturaCanvas(128, 128, (c, W) => {
    const gr = c.createRadialGradient(W * 0.38, W * 0.34, 4, W / 2, W / 2, W / 2); gr.addColorStop(0, '#5a5a6e'); gr.addColorStop(0.35, '#1c1c26'); gr.addColorStop(1, '#08080c');
    c.fillStyle = gr; c.beginPath(); c.arc(W / 2, W / 2, W / 2 - 2, 0, 7); c.fill();
    c.fillStyle = '#dcd8ff'; for (let i = 0; i < 9; i++) { c.globalAlpha = 0.4 + (i % 3) * 0.2; c.beginPath(); c.arc(20 + (i * 37) % 90, 24 + (i * 53) % 84, 1.4 + (i % 2), 0, 7); c.fill(); }   // las estrellas que refleja
    c.globalAlpha = 1;
  });
  const disco = new THREE.Mesh(new THREE.CircleGeometry(0.13, 28), new THREE.MeshBasicMaterial({ map: tx })); disco.geometry.userData.propia = true;
  disco.position.set(0, 0.2, 0.012); disco.rotation.x = -0.2; g.add(disco);
  g.add(Object.assign(K.malla(K.toro(0.135, 0.016, Math.PI * 2, 0.6), '#8a5e3a', { grosor: 0.002 }), {}));
  g.children[1].position.set(0, 0.2, 0.01); g.children[1].rotation.x = -0.2;
  const pie = K.malla(K.cilindro(0.012, 0.016, 0.12, 5), '#5e3e24', { grosor: 0.002 }); pie.position.y = 0.06; g.add(pie);
  /* el brasero de copal con su humo */
  const br = K.malla(K.cilindro(0.045, 0.035, 0.07, 8), '#8a4a32', { grosor: 0.002 }); br.position.set(0.02, 0.035, 0.16); g.add(br);
  const brasa = K.malla(K.esfera(0.02, 0.4), '#ff8a3a', { sinTinta: true, emissive: '#ff6a1a', emissiveIntensity: 1 }); brasa.position.set(0.02, 0.07, 0.16); g.add(brasa);
  const humo = [0, 1, 2, 3].map(k => { const b = K.malla(K.esfera(0.03 + k * 0.012, 0.4), '#f2f0ea', { sinTinta: true, transparent: true, opacity: 0.6 }); g.add(b); return b; });
  g.userData.humear = t => humo.forEach((b, k) => { const u = ((t * 0.3 + k / 4) % 1); b.position.set(0.02 + 0.03 * Math.sin(t + k), 0.09 + u * 0.32, 0.16 - u * 0.05); b.material.opacity = 0.55 * (1 - u); b.scale.setScalar(1 + u * 1.4); });
  return g;
}

/* la antorcha de un iniciado: el palo y la llama, para sostener en la mano */
export function antorcha(K) {
  const g = new THREE.Group();
  const palo = K.malla(K.cilindro(0.01, 0.012, 0.32, 5), '#6a4a2a', { sinTinta: true }); palo.position.y = 0.12; g.add(palo);
  const ll = K.malla(K.cono(0.038, 0.12, 6), '#ffb13b', { sinTinta: true, sombra: false, emissive: '#ff8a2a', emissiveIntensity: 1 }); ll.position.y = 0.33; g.add(ll);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: texLuz(), color: '#ffa840', transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.setScalar(0.34); halo.position.y = 0.34; g.add(halo);   // el halo de la llama: de lejos, una fila de fuegos
  g.userData.llama = ll; g.userData.vivo = true;
  return g;
}

/* PARÍS: el arte notoria. En la buhardilla de un estudiante pobre, la hoja con las figuras (las notae: círculos, rombos y
   letras de una lengua inventada) que había que mirar en días señalados, a la luz de una vela, para aprender las artes de
   golpe, sin estudiar. La vela tiembla y la hoja brilla apenas. */
export function arsNotoria(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const tx = texturaCanvas(128, 160, (c, W, H) => {
    c.fillStyle = '#efe2c2'; c.fillRect(0, 0, W, H);
    c.strokeStyle = '#7a2a1e'; c.lineWidth = 2; c.strokeRect(5, 5, W - 10, H - 10);
    const cx = W / 2, cy = 66;
    [44, 34, 22].forEach((r, i) => { c.strokeStyle = i === 1 ? '#2f4f9a' : '#7a2a1e'; c.lineWidth = 1.6; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke(); });
    c.strokeStyle = '#3a2e1e'; c.lineWidth = 1.2;
    for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; c.beginPath(); c.moveTo(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22); c.lineTo(cx + Math.cos(a) * 44, cy + Math.sin(a) * 44); c.stroke(); }
    c.fillStyle = '#d4a93e'; c.beginPath(); c.moveTo(cx, cy - 12); c.lineTo(cx + 10, cy); c.lineTo(cx, cy + 12); c.lineTo(cx - 10, cy); c.closePath(); c.fill();   // el rombo del centro
    c.fillStyle = '#3a2e1e'; for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; c.fillRect(cx + Math.cos(a) * 39 - 1.5, cy + Math.sin(a) * 39 - 1.5, 3, 3); }   // las letras del anillo
    for (let y = 122; y < H - 12; y += 7) { c.fillRect(14, y, W - 28, 1.4); }   // las oraciones en la lengua inventada
    c.fillStyle = '#7a2a1e'; c.fillRect(14, 116, 10, 10);
  });
  const hoja = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.2), new THREE.MeshBasicMaterial({ map: tx })); hoja.geometry.userData.propia = true;
  hoja.rotation.x = -Math.PI / 2 + 0.35; hoja.position.set(0, 0.2, 0); g.add(hoja);
  const me = K.malla(K.caja(0.24, 0.02, 0.2), '#6e4a2e', { grosor: 0.002 }); me.position.y = 0.17; g.add(me);
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const p = K.malla(K.caja(0.016, 0.17, 0.016), '#4e3220', { sinTinta: true }); p.position.set(a * 0.1, 0.085, b * 0.08); g.add(p); });
  const ve = K.malla(K.cilindro(0.01, 0.011, 0.06, 6), '#f2ead6', { sinTinta: true }); ve.position.set(0.08, 0.21, -0.06); g.add(ve);
  const llama = K.malla(K.esfera(0.013, 0.4), '#ffd27a', { sinTinta: true, emissive: '#ffb04a', emissiveIntensity: 1.4 }); llama.position.set(0.08, 0.25, -0.06); llama.scale.set(1, 1.7, 1); g.add(llama);
  g.userData.temblar = t => { llama.scale.set(1, 1.6 + 0.3 * Math.sin(t * 13) + 0.15 * Math.sin(t * 29), 1); llama.position.x = 0.08 + 0.003 * Math.sin(t * 17); };
  return g;
}

/* ÁMSTERDAM: la rosa y la cruz. Un cartel impreso clavado en la puerta de la iglesia: la rosa roja sobre la cruz, el
   anuncio de una hermandad invisible que guardaba el saber universal. Brilla apenas a la luz de un farol. */
export function cartelRosacruz(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const tx = texturaCanvas(96, 128, (c, W, H) => {
    c.fillStyle = '#efe6cc'; c.fillRect(0, 0, W, H);
    c.fillStyle = '#1e1a16'; c.font = 'bold 11px Georgia'; c.textAlign = 'center'; c.fillText('FAMA', W / 2, 18); c.font = '8px Georgia'; c.fillText('FRATERNITATIS', W / 2, 29);
    c.fillStyle = '#d4a93e'; c.fillRect(W / 2 - 3, 38, 6, 52); c.fillRect(W / 2 - 22, 52, 44, 6);   // la cruz
    c.fillStyle = '#a8261e'; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; c.beginPath(); c.arc(W / 2 + Math.cos(a) * 6, 55 + Math.sin(a) * 6, 5, 0, 7); c.fill(); }   // la rosa
    c.fillStyle = '#d4485a'; c.beginPath(); c.arc(W / 2, 55, 4, 0, 7); c.fill();
    c.fillStyle = '#3a342a'; for (let y = 98; y < H - 8; y += 5) c.fillRect(12, y, W - 24, 1.3);
  });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.21), new THREE.MeshBasicMaterial({ map: tx })); p.geometry.userData.propia = true; p.position.y = 0.3; g.add(p);
  const cl = K.malla(K.esfera(0.008, 0.3), '#5a5a5a', { sinTinta: true }); cl.position.set(0, 0.4, 0.004); g.add(cl);   // el clavo
  return g;
}

/* SANTIAGO: la logia. Una sala abierta al frente: el piso de damero, las dos columnas de la entrada, el altar con el libro
   abierto, la escuadra y el compás, y la vela. Solo se ve de noche, en invierno. */
export function logiaMasonica(K) {
  const g = new THREE.Group(); g.userData.vivo = true;
  const tx = texturaCanvas(64, 64, (c, W) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { c.fillStyle = (i + j) % 2 ? '#1e1c1a' : '#f2eee4'; c.fillRect(i * 8, j * 8, 8, 8); } });
  const piso = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.32), new THREE.MeshBasicMaterial({ map: tx })); piso.geometry.userData.propia = true; piso.rotation.x = -Math.PI / 2; piso.position.y = 0.012; g.add(piso);
  [-1, 1].forEach(l => { const c = K.malla(K.cilindro(0.02, 0.022, 0.26, 8), l < 0 ? '#2a2622' : '#e8e0cc', { grosor: 0.002 }); c.position.set(l * 0.15, 0.13, 0.13); g.add(c);
    const b = K.malla(K.esfera(0.026, 0.4), '#c9a24a', { sinTinta: true }); b.position.set(l * 0.15, 0.275, 0.13); g.add(b); });
  const al = K.malla(K.caja(0.12, 0.08, 0.08), '#5a3a24', { grosor: 0.002 }); al.position.set(0, 0.04, -0.08); g.add(al);
  const li = K.malla(K.caja(0.08, 0.008, 0.06), '#efe4c8', { sinTinta: true }); li.position.set(0, 0.085, -0.08); g.add(li);
  const es = K.malla(K.caja(0.05, 0.004, 0.008), '#c9a24a', { sinTinta: true }); es.position.set(-0.01, 0.092, -0.07); es.rotation.y = 0.78; g.add(es);   // la escuadra
  const co = K.malla(K.caja(0.05, 0.004, 0.006), '#c9a24a', { sinTinta: true }); co.position.set(0.01, 0.094, -0.07); co.rotation.y = -0.78; g.add(co);   // el compás
  const ve = K.malla(K.cilindro(0.008, 0.009, 0.05, 6), '#f2ead6', { sinTinta: true }); ve.position.set(0.05, 0.11, -0.1); g.add(ve);
  const llama = K.malla(K.esfera(0.011, 0.4), '#ffd27a', { sinTinta: true, emissive: '#ffb04a', emissiveIntensity: 1.4 }); llama.position.set(0.05, 0.145, -0.1); llama.scale.set(1, 1.7, 1); g.add(llama);
  g.userData.temblar = t => { llama.scale.set(1, 1.6 + 0.3 * Math.sin(t * 13), 1); };
  return g;
}

/* EL ARS MAGNA DE RAMON LLULL (el futuro, era21-plan): tres discos de papel, uno dentro de otro, con las letras de las
   ideas en el borde (la B de la bondad, la C de la grandeza, la D de la eternidad…), clavados por el centro en una tabla
   y girando cada uno a su ritmo, como en las figuras del Ars generalis ultima (hacia 1305). Una lámpara al lado.
   userData.girar(t) los hace girar */
export function arsMagna(K) {
  const g = new THREE.Group();
  const tabla = K.malla(K.caja(0.5, 0.03, 0.5), '#7a5a3c', { grosor: 0.002 }); tabla.position.y = 0.2; g.add(tabla);
  [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].forEach(([x, z]) => { const p = K.malla(K.caja(0.03, 0.2, 0.03), '#5f4632', { sinTinta: true }); p.position.set(x, 0.1, z); g.add(p); });
  const LETRAS = 'BCDEFGHIK';
  const disco = (r, fondo, tinta, sem) => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    x.fillStyle = fondo; x.beginPath(); x.arc(128, 128, 126, 0, Math.PI * 2); x.fill();
    x.strokeStyle = tinta; x.lineWidth = 3; x.beginPath(); x.arc(128, 128, 120, 0, Math.PI * 2); x.stroke();
    x.fillStyle = tinta; x.font = '700 26px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2 + sem; x.fillText(LETRAS[i], 128 + Math.cos(a) * 100, 128 + Math.sin(a) * 100); x.beginPath(); x.moveTo(128 + Math.cos(a + 0.35) * 82, 128 + Math.sin(a + 0.35) * 82); x.lineTo(128 + Math.cos(a + 0.35) * 118, 128 + Math.sin(a + 0.35) * 118); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.userData.propia = true;
    const m = new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshBasicMaterial({ map: t, transparent: true }));
    m.geometry.userData.propia = true; m.rotation.x = -Math.PI / 2; return m;
  };
  const discos = [disco(0.22, '#efe2c2', '#7a2a1c', 0), disco(0.155, '#e3cf9c', '#2a3a6a', 0.3), disco(0.095, '#f4ead2', '#2a5a3a', 0.6)];
  discos.forEach((d, i) => { d.position.y = 0.217 + i * 0.004; g.add(d); });
  const clavo = K.malla(K.cilindro(0.012, 0.012, 0.03, 6), '#c9a24a', { sinTinta: true }); clavo.position.y = 0.23; g.add(clavo);
  const lamp = K.malla(K.esfera(0.035, 0.5), '#ffd27a', { sinTinta: true, emissive: '#ffb84a', emissiveIntensity: 1.1 }); lamp.position.set(0.3, 0.26, -0.05); g.add(lamp);
  g.userData.vivo = true;
  g.userData.girar = t => { discos[0].rotation.z = t * 0.12; discos[1].rotation.z = -t * 0.2; discos[2].rotation.z = t * 0.33; lamp.scale.setScalar(1 + 0.12 * Math.sin(t * 6)); };
  return g;
}
