/* ============================================================
   caminos
   Por dónde se puede caminar (2026-09-28, del QA: en un 2 % de las muestras alguien del clan pisaba
   dentro de una choza, una vasija o una mata de la orilla, porque el paseo esquivaba un solo obstáculo
   por tramo). Una grilla de 0,25 baldosas marca lo ocupado con la HUELLA real de cada cosa (medida
   antes de fundir sus mallas) y los círculos fijos del valle; las rutas se buscan con A* y se alisan
   por línea de vista, así el paso sigue viéndose natural.
   ============================================================ */
import * as THREE from 'three';

const PASO = 0.25, X0 = 2.1, N = Math.ceil((17.9 - X0) / PASO);

/* La huella de una pieza: una caja en el suelo por cada cosa con altura (lo plano, como mantas,
   parcelas o charcos, no estorba el paso). Se mide ANTES de fundir: después, sus mallas son una sola. */
const caja = new THREE.Box3();
export function huellasDe(obj, margen = 0.12) {
  const out = [];
  obj.updateMatrixWorld(true);
  const medir = o => {
    caja.setFromObject(o);
    if (caja.isEmpty() || caja.max.y - Math.max(0, caja.min.y) < 0.18 || caja.max.y < 0.15) return;
    out.push({ x0: caja.min.x - margen, x1: caja.max.x + margen, z0: caja.min.z - margen, z1: caja.max.z + margen });
  };
  for (const h of obj.children) {
    if (h.userData.vivo && !h.getObjectByProperty('isSkinnedMesh', true)) continue;   // los animales se mueven: no son huella (la gente sentada sí)
    // un grupo grande (un corral, un campo) se mide por partes para no tapar su interior
    if (h.isGroup && !h.userData.ficha && h.children.length > 1 && !h.children.some(c => c.isSkinnedMesh)) h.children.forEach(medir);
    else medir(h);
  }
  return out;
}

export function crearCaminos() {
  const ocupado = new Uint8Array(N * N);
  const celda = (x, z) => [Math.floor((x - X0) / PASO), Math.floor((z - X0) / PASO)];
  const libreC = (i, j) => i >= 0 && j >= 0 && i < N && j < N && !ocupado[i * N + j];
  const centro = (i, j) => ({ x: X0 + (i + 0.5) * PASO, z: X0 + (j + 0.5) * PASO });
  const api = {
    /* rehacer la grilla: rects (huellas, en coordenadas del mundo) y círculos {x, z, r}; elipses {x, z, rx, rz} */
    /* bloquea(x, z): lo que la época declara intransitable por su forma (el río de Sumer, que no es una huella) */
    rehacer(rects, circulos, elipses = [], bloquea = null) {
      ocupado.fill(0);
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) {
        const { x, z } = centro(i, j);
        if ((bloquea && bloquea(x, z)) || rects.some(r => x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1) || circulos.some(c => Math.hypot(x - c.x, z - c.z) < c.r) ||
            elipses.some(e => ((x - e.x) / e.rx) ** 2 + ((z - e.z) / e.rz) ** 2 < 1)) ocupado[i * N + j] = 1;
      }
    },
    libre(x, z) { const [i, j] = celda(x, z); return libreC(i, j); },
    /* puntos de paseo al azar sobre lo libre */
    puntos(cada = 4) { const l = []; for (let i = 2; i < N - 2; i += cada) for (let j = 2; j < N - 2; j += cada) if (libreC(i, j)) l.push([centro(i, j).x, centro(i, j).z]); return l; },
    /* la ruta de o a d: una lista de puntos {x, z}. Si d está ocupado, termina en lo libre más cercano. */
    ruta(o, d) {
      let [si, sj] = celda(o.x, o.z), [ti, tj] = celda(d.x, d.z);
      si = Math.max(0, Math.min(N - 1, si)); sj = Math.max(0, Math.min(N - 1, sj));
      ti = Math.max(0, Math.min(N - 1, ti)); tj = Math.max(0, Math.min(N - 1, tj));
      if (!libreC(ti, tj)) { const c = cercano(ti, tj); if (!c) return [d]; [ti, tj] = c; d = centro(ti, tj); }
      const inicio = si * N + sj, meta = ti * N + tj;
      const g = new Float32Array(N * N).fill(Infinity), de = new Int32Array(N * N).fill(-1), cerrado = new Uint8Array(N * N);
      const abiertos = [inicio]; g[inicio] = 0;
      const h = k => Math.hypot(Math.floor(k / N) - ti, (k % N) - tj);
      let pasos = 0;
      while (abiertos.length && pasos++ < 6000) {
        let mejor = 0; for (let k = 1; k < abiertos.length; k++) if (g[abiertos[k]] + h(abiertos[k]) < g[abiertos[mejor]] + h(abiertos[mejor])) mejor = k;
        const c = abiertos.splice(mejor, 1)[0];
        if (c === meta) break;
        cerrado[c] = 1;
        const ci = Math.floor(c / N), cj = c % N;
        for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
          if (!di && !dj) continue;
          const ni = ci + di, nj = cj + dj, n = ni * N + nj;
          if (ni < 0 || nj < 0 || ni >= N || nj >= N || cerrado[n]) continue;
          if (ocupado[n] && n !== meta) continue;
          if (di && dj && (ocupado[ci * N + nj] || ocupado[ni * N + cj])) continue;   // sin cortar esquinas
          const ng = g[c] + (di && dj ? 1.414 : 1);
          if (ng < g[n]) { g[n] = ng; de[n] = c; if (!abiertos.includes(n)) abiertos.push(n); }
        }
      }
      if (de[meta] === -1 && meta !== inicio) return [d];              // sin camino: que vaya derecho (no se queda clavado)
      const celdas = []; for (let k = meta; k !== -1 && k !== inicio; k = de[k]) celdas.push(k);
      celdas.reverse();
      // alisar: de cada punto, saltar al más lejano que se vea en línea recta
      const out = []; let desde = { x: o.x, z: o.z }, k = 0;
      while (k < celdas.length) {
        let lejos = k;
        for (let m = celdas.length - 1; m > k; m--) { const p = centro(Math.floor(celdas[m] / N), celdas[m] % N); if (seVe(desde, p)) { lejos = m; break; } }
        const p = lejos === celdas.length - 1 ? d : centro(Math.floor(celdas[lejos] / N), celdas[lejos] % N);
        out.push(p); desde = p; k = lejos + 1;
      }
      return out.length ? out : [d];
    },
  };
  function cercano(ti, tj) {
    for (let r = 1; r < 12; r++) for (let di = -r; di <= r; di++) for (let dj = -r; dj <= r; dj++) if (Math.max(Math.abs(di), Math.abs(dj)) === r && libreC(ti + di, tj + dj)) return [ti + di, tj + dj];
    return null;
  }
  function seVe(a, b) {
    const n = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / (PASO * 0.5));
    for (let k = 1; k < n; k++) { const x = a.x + (b.x - a.x) * k / n, z = a.z + (b.z - a.z) * k / n; if (!api.libre(x, z)) return false; }
    return true;
  }
  return api;
}
