/* ============================================================
   cielo
   El ciclo del día, continuo (2026-09-28: «del día a la tarde y de la tarde a la noche, muy abrupto»).
   Antes había tres estados mezclados de a pares y el sol saltaba de lugar; ahora hay OCHO momentos
   repartidos en la vuelta del sol, y la mezcla entre vecinos es suave. La fase sale del reloj del
   mundo del 2D (tJuegoVis, vuelta de 150 s: 0 = mediodía, 0,5 = medianoche), así que la luz y la
   economía (luzDia, la velada) nunca se desfasan.
   El sol recorre un arco: sale por un lado, cruza alto al mediodía, se pone por el otro y se apaga al
   tocar el horizonte; la luna (sin sombras) entra despacio a medida que cae la noche.
   ============================================================ */
import * as THREE from 'three';

/* fase: dónde cae cada momento en la vuelta (0 mediodía → 0,25 atardecer → 0,5 medianoche → 0,75 amanecer) */
const MOMENTOS = [
  { f: 0.00, cielo: ['#86bfe0', '#f3dfb4'], hemi: ['#eaf4ff', '#9a9460', 1.45], sol: '#fff3dc', nube: '#f7f3ec' },   // mediodía
  { f: 0.14, cielo: ['#8cb8dc', '#f6dca8'], hemi: ['#f6f0e4', '#948a5c', 1.4],  sol: '#ffe6b8', nube: '#fbeedc' },   // tarde
  { f: 0.20, cielo: ['#8e9cc8', '#f7c894'], hemi: ['#ffe2c4', '#7f7260', 1.25], sol: '#ffc07a', nube: '#fcdcbc' },   // tarde dorada
  { f: 0.25, cielo: ['#6f6aa4', '#f1a877'], hemi: ['#ffd2b8', '#5f5470', 1.05], sol: '#ff9258', nube: '#f5b89a' },   // atardecer
  { f: 0.30, cielo: ['#3b3d7c', '#c48a92'], hemi: ['#b4a4d4', '#3a3452', 0.8],  sol: '#ff8a64', nube: '#9c8db4' },   // crepúsculo
  { f: 0.37, cielo: ['#161c3e', '#34366a'], hemi: ['#6a7cc4', '#1a1c30', 0.55], sol: '#ffffff', nube: '#646a90' },   // anochecer
  { f: 0.43, cielo: ['#0f1530', '#2b2e5a'], hemi: ['#6076c0', '#161828', 0.5],  sol: '#ffffff', nube: '#5d6388' },   // noche
  { f: 0.57, cielo: ['#0f1530', '#2b2e5a'], hemi: ['#6076c0', '#161828', 0.5],  sol: '#ffffff', nube: '#5d6388' },   // noche
  { f: 0.64, cielo: ['#1c2250', '#4a4270'], hemi: ['#7a82c4', '#1e1e34', 0.58], sol: '#ffffff', nube: '#6e6c96' },   // antes del alba
  { f: 0.70, cielo: ['#43457e', '#d0969a'], hemi: ['#b8a8d4', '#3c3654', 0.82], sol: '#ff9a74', nube: '#a894b6' },   // alba
  { f: 0.75, cielo: ['#7f80b4', '#f5b88c'], hemi: ['#ffd8c4', '#655a6c', 1.08], sol: '#ffa46a', nube: '#f7c4a6' },   // amanecer
  { f: 0.82, cielo: ['#8ab4da', '#f7d8ac'], hemi: ['#fff0dc', '#8a805c', 1.3],  sol: '#ffdca8', nube: '#fbead6' },   // mañana
  { f: 1.00, cielo: ['#86bfe0', '#f3dfb4'], hemi: ['#eaf4ff', '#9a9460', 1.45], sol: '#fff3dc', nube: '#f7f3ec' },   // mediodía
];
const PENUMBRA = { cielo: ['#5f6382', '#b3a0a8'], hemi: ['#c9c0da', '#5d5866', 1.1], sol: '#d9d0ea', nube: '#8a8aa6' };

const cA = new THREE.Color(), cB = new THREE.Color();
const mezcla = (a, b, k) => '#' + cA.set(a).lerp(cB.set(b), k).getHexString();
const suave = k => k * k * (3 - 2 * k);

/* El estado de la luz en la fase f (0-1). penumbra: antes del fuego, la luz lila y quieta del 2D. */
export function luzDelDia(f, penumbra) {
  if (penumbra) return { ...PENUMBRA, sol: { color: PENUMBRA.sol, int: 1.3, dir: new THREE.Vector3(-6, 13, 9).normalize() }, luna: 0, estrellas: 0.12, luz: 0.32 };
  f = ((f % 1) + 1) % 1;
  let i = 0; while (i < MOMENTOS.length - 2 && MOMENTOS[i + 1].f <= f) i++;
  const a = MOMENTOS[i], b = MOMENTOS[i + 1], k = suave((f - a.f) / (b.f - a.f));
  // el arco del sol: p va de −0,25 (sale) a +0,25 (se pone); la altura es 0 en el horizonte
  const p = f < 0.5 ? f : f - 1;
  const alto = Math.max(-0.2, 1 - Math.abs(p) / 0.25);                       // 1 al mediodía, 0 en el horizonte
  const elev = Math.max(0.04, alto) * 62 * Math.PI / 180, az = (123.7 + (p / 0.25) * 70) * Math.PI / 180;
  const dir = new THREE.Vector3(Math.cos(elev) * Math.cos(az), Math.sin(elev), Math.cos(elev) * Math.sin(az));
  const encendido = suave(Math.max(0, Math.min(1, (alto + 0.02) / 0.22)));     // se apaga al tocar el horizonte
  const luz = 0.5 + 0.5 * Math.cos(2 * Math.PI * f);
  return {
    cielo: [mezcla(a.cielo[0], b.cielo[0], k), mezcla(a.cielo[1], b.cielo[1], k)],
    hemi: [mezcla(a.hemi[0], b.hemi[0], k), mezcla(a.hemi[1], b.hemi[1], k), a.hemi[2] + (b.hemi[2] - a.hemi[2]) * k],
    sol: { color: mezcla(a.sol, b.sol, k), int: 2.7 * encendido * (0.55 + 0.45 * Math.min(1, alto * 1.6)), dir },
    luna: suave(Math.max(0, Math.min(1, (0.42 - luz) / 0.3))),                // la luna entra despacio
    nube: mezcla(a.nube, b.nube, k),
    estrellas: suave(Math.max(0, Math.min(1, (0.38 - luz) / 0.3))),
    luz,
  };
}
