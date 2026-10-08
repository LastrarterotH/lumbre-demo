/* ============================================================
   futuro/maqueta
   El tablero entero de la última época para la fila 4 de la hoja (juego3d/bocetos/futuro.html): EL VALLE DEL PRINCIPIO,
   con el suelo, la laguna, la cueva y los árboles de la Época 1 (mundo.js, los mismos), y lo de hoy encima: la escuela
   (la recomendada, en anillo alrededor del círculo de piedras del fogón), las casas, la pasarela de la cueva y su
   pabellón, el muelle, los caminos y la niebla de los bordes (lo que todavía no sabemos).
   No entra al juego: dice dónde va cada cosa. TABLEROS[v].motor dice qué declararía el motor de la época.
   ============================================================ */
import * as THREE from 'three';
import { fundir } from '../kit.js';
import { suelo, losa, laguna, cueva, arbol, menudo, ARBOLES, FOGON, CUEVA, LAGUNA, E0, E1 } from '../mundo.js';
import * as KM from './monumentos.js';

const MOTOR = 'El futuro reusa la geometría del valle de la Época 1 (FOGON, CUEVA, LAGUNA, PLAYA, la altura del suelo): su 09x declararía ESCUELA (la huella del anillo alrededor del fogón, con su abertura y sus dos pasos), PASARELA (caminable), las CASAS, el MUELLE, la NIEBLA (los bordes donde no se camina) y las ANCLAS de los seis saberes.';
/* la niebla de un borde: puffs a lo largo de una recta, del tamaño dado */
const borde = (x0, z0, x1, z1, n, s) => Array.from({ length: n }, (_, i) => { const u = (i + 0.5) / n; return [x0 + (x1 - x0) * u, z0 + (z1 - z0) * u, s * (0.85 + 0.3 * ((i * 7) % 5) / 4)]; });
const RODEA_CUEVA = [[9.25, 9.35], [9.45, 8.4], [9.6, 7.55]];

export const TABLEROS = {
  /* A · todo donde estaba: la escuela alrededor del fogón, las casas donde estuvo la aldea, la niebla en los cuatro bordes */
  siempre: {
    nombre: 'El valle de siempre',
    texto: 'Todo donde estaba en la Época 1: la cueva al fondo, la laguna con su playa al frente y el círculo de piedras del fogón, ahora en el patio de la escuela en anillo, que se abre hacia el valle. Las casas redondas están donde estuvo la aldea neolítica y junto a la laguna, que tiene su muelle. A la cueva se llega por la pasarela, con su pabellón al lado. La niebla rodea los cuatro bordes, más espesa en la esquina del fondo.',
    motor: MOTOR,
    casas: [[4.5, 4.7, 0.65], [14.7, 9.5, -0.85]],
    pabellon: [12.4, 7.9, -0.75],
    muelle: [12.85, 14.35],
    caminos: [[[4.2, 17.4], [6.3, 14.6], [7.6, 11.7]], [[8.7, 10.6], [9.25, 9.35]], [[8.9, 11.3], [11.3, 12.7], [12.85, 14.35]], [[9.3, 10.4], [12.2, 10.0], [13.7, 9.7]], [[7.7, 7.1], [6.2, 5.8], [5.3, 5.2]], [[3.8, 11.0], [2.4, 11.8]], [[9.9, 8.6], [11.6, 8.3]]],
    pasarela: RODEA_CUEVA,
    arboles: { quitar: ['seco'], mas: [['redondo', 11.8, 16.6, 0.8], ['pino', 17.0, 13.9, 0.85], ['redondo', 3.4, 15.8, 0.9]] },
    niebla: [...borde(2.2, 2.6, 2.2, 17.4, 9, 1.05), ...borde(2.6, 2.2, 17.4, 2.2, 9, 1.05), [2.6, 2.6, 1.9], [3.4, 2.4, 1.4], [2.4, 3.6, 1.4], ...borde(17.8, 4, 17.8, 17.6, 7, 0.55), ...borde(4, 17.8, 17.6, 17.8, 7, 0.55)],
    persona: [8.7, 12.1],
  },
  /* B · el pueblo crecido junto al agua: las casas del lado del este, la calle que entra desde el frente, la niebla solo atrás */
  pueblo: {
    nombre: 'El pueblo junto a la laguna',
    texto: 'El valle creció hacia el este: el pueblo se arrima a la laguna y al bosque de pinos, y la calle entra desde el frente hasta la escuela. La cueva queda entre la escuela y el pueblo, con su pasarela. La niebla solo cierra el fondo: el valle conocido es más grande y lo que no sabemos está más lejos.',
    motor: MOTOR,
    casas: [[14.6, 5.9, -1.15], [15.2, 10.2, -1.35], [12.3, 12.0, -0.6]],
    pabellon: [12.2, 7.8, -0.7],
    muelle: [12.85, 14.35],
    caminos: [[[2.6, 17.4], [5.0, 15.0], [7.6, 11.7]], [[8.7, 10.6], [9.25, 9.35]], [[9.2, 10.8], [12.0, 10.6], [14.2, 10.3]], [[9.9, 8.6], [12.0, 8.4], [13.8, 7.2], [14.4, 6.6]], [[12.0, 12.4], [12.85, 14.35]], [[7.7, 7.1], [6.2, 5.0], [5.2, 4.0]]],
    pasarela: RODEA_CUEVA,
    arboles: { quitar: ['seco', 'pino'], mas: [['redondo', 4.6, 5.2, 0.95], ['redondo', 3.6, 15.4, 0.9], ['pino', 17.0, 3.0, 0.9], ['pino', 16.9, 13.6, 0.8]] },
    niebla: [...borde(2.2, 2.6, 2.2, 10, 6, 1.15), ...borde(2.6, 2.2, 12, 2.2, 7, 1.15), [2.6, 2.6, 2.0], [3.6, 2.4, 1.5], [2.4, 3.8, 1.5]],
    persona: [8.7, 12.1],
  },
  /* C · el bosque que volvió: atrás, un bosque espeso; adelante, pocas casas; la niebla se mete entre los árboles del fondo */
  bosque: {
    nombre: 'El bosque que volvió',
    texto: 'Diez mil años después, el bosque volvió a cubrir el fondo del valle y la cueva asoma entre los árboles. Adelante quedan pocas casas, la escuela en anillo y la laguna con su muelle. La niebla se mete entre los árboles del fondo: lo que no sabemos está detrás del bosque.',
    motor: MOTOR,
    casas: [[3.9, 14.9, 0.9]],
    pabellon: [12.5, 8.2, -0.75],
    muelle: [12.85, 14.35],
    caminos: [[[4.2, 17.4], [6.3, 14.6], [7.6, 11.7]], [[8.7, 10.6], [9.25, 9.35]], [[8.9, 11.3], [11.3, 12.7], [12.85, 14.35]], [[5.0, 13.2], [4.6, 14.2]], [[9.9, 8.6], [11.9, 8.6]]],
    pasarela: RODEA_CUEVA,
    arboles: { quitar: ['seco', 'arbusto'], bosque: true, mas: [['redondo', 16.6, 15.6, 0.8], ['redondo', 11.4, 16.8, 0.75]] },
    niebla: [...borde(2.3, 2.6, 2.3, 9.5, 6, 1.4), ...borde(2.6, 2.3, 15, 2.3, 9, 1.4), [3.4, 3.4, 2.0], [5.4, 3.0, 1.6], [3.0, 5.4, 1.6], [7.6, 3.0, 1.5]],
    persona: [8.7, 12.1],
  },
};

/* el bosque del fondo (variante C): pinos y árboles redondos en la franja de atrás, sin tapar la cueva ni la escuela */
function bosqueFondo() {
  const lista = [];
  for (let i = 0; i < 70; i++) {
    const h = s => { const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return v - Math.floor(v); };
    const enX = h(1) < 0.55, x = enX ? E0 + 0.4 + h(2) * 13 : E0 + 0.4 + h(3) * 3.2, z = enX ? E0 + 0.4 + h(4) * 2.4 : E0 + 2.4 + h(5) * 7;
    if (Math.hypot(x - CUEVA.x, z - CUEVA.y) < 2.3 || Math.hypot(x - FOGON.x, z - FOGON.y) < 2.8) continue;
    lista.push([h(6) < 0.55 ? 'pino' : 'redondo', x, z, 0.65 + h(7) * 0.4]);
  }
  return lista;
}

export function maqueta(K, variante = KM.VARIANTES.tablero, { persona = null } = {}) {
  const T = TABLEROS[variante] || TABLEROS.siempre, raiz = new THREE.Group(), g = new THREE.Group(); raiz.add(g); g.position.set(-10, 0, -10);
  const ocupado = [];   // círculos [x, z, r] donde no crece el pasto menudo
  const su = suelo(K); su.userData.pintar(['#a6c95c', '#9fc356', '#aecf63', '#a2c558', '#a9cb5f'], ['#ecdcae', '#e6d4a2', '#efe2b6', '#e2d09c', '#e9d9a8']);   // la primavera de la Época 1
  g.add(su, losa(K), laguna(K, []));
  const quieto = new THREE.Group(); g.add(quieto);
  quieto.add(cueva(K));
  /* la escuela en anillo alrededor del círculo de piedras del fogón (el héroe recomendado) */
  const he = KM.heroe(K, 'anillo'); fundir(K, he, 0.01); he.position.set(FOGON.x, 0, FOGON.y); g.add(he); ocupado.push([FOGON.x, FOGON.y, 2.6]);
  /* la pasarela de la cueva y su pabellón */
  const pa = KM.pasarela(K, T.pasarela); g.add(pa);
  { const [x, z, ry] = T.pabellon, p = KM.pabellon(K); fundir(K, p, 0.008); p.position.set(x, 0, z); p.rotation.y = ry; g.add(p); ocupado.push([x, z, 1.0]); }
  /* las casas (las redondas recomendadas), el muelle, los caminos */
  T.casas.forEach(([x, z, ry]) => { const c = KM.barrio(K, 'redondas'); fundir(K, c, 0.008); c.position.set(x, 0, z); c.rotation.y = ry; g.add(c); ocupado.push([x, z, 2.0]); });
  { const [x, z] = T.muelle, m = KM.muelle(K, 1.3); fundir(K, m, 0.006); m.position.set(x, 0, z); m.rotation.y = Math.atan2(LAGUNA.x - x, LAGUNA.y - z); g.add(m); }
  g.add(KM.caminos(K, T.caminos));
  /* los árboles de la Época 1 (menos los que la variante saca) y los nuevos */
  const arboles = [...ARBOLES.filter(a => !T.arboles.quitar.includes(a[0])), ...T.arboles.mas, ...(T.arboles.bosque ? bosqueFondo() : [])]
    .filter(([, x, z]) => !ocupado.some(([ox, oz, r]) => Math.hypot(x - ox, z - oz) < r * 0.8));
  arboles.forEach(a => quieto.add(arbol(K, a)));
  g.add(menudo(K, (x, z) => ocupado.some(([ox, oz, r]) => Math.hypot(x - ox, z - oz) < r) || T.caminos.some(tr => tr.some(([px, pz]) => Math.hypot(x - px, z - pz) < 0.5))));
  fundir(K, quieto);
  /* la niebla de los bordes */
  g.add(KM.niebla(K, T.niebla));
  if (persona) { persona.position.set(T.persona[0], 0, T.persona[1]); g.add(persona); }
  raiz.userData.tablero = T;
  return raiz;
}
