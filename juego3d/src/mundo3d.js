/* ============================================================
   mundo3d
   El mundo 3D de la época en curso: arma el motor y la época que dice S.era (epocas/index.js) y, si la
   partida cruza a otra época, desarma la vieja (liberando todo en la GPU) y arma la nueva. Expone lo que
   usan el cuadro (juego3d.js), la interfaz (ui3d.js) y el laboratorio visual (qa.html).
   ============================================================ */
import * as THREE from 'three';
import { crearMotor3D } from './motor3d.js';
import { EPOCAS } from './epocas/index.js';

export function crearMundo3D(K, op = {}) {
  const raiz = new THREE.Group();
  let era = null, mo = null, ep = null, avisada = null;
  function armar(e) {
    const viejo = !!mo;
    if (mo) { raiz.remove(mo.raiz); mo.desarmar(); }
    mo = ep = null; era = e;
    const def = EPOCAS[e];
    if (!def) { if (avisada !== e) { avisada = e; console.warn(`Lumbre 3D: la Época ${typeof numEpoca === 'function' ? numEpoca(e) : e} (id ${e}) aún no tiene mundo 3D`); } return; }
    mo = crearMotor3D(K, op); ep = def.construir(mo); raiz.add(mo.raiz);
    if (viejo && K.podar) { let top = raiz; while (top.parent) top = top.parent; K.podar(top); }   // tras un cruce, las formas de la época vieja se sueltan (I4)
  }
  return {
    raiz,
    sincronizar(t, dt) {
      if (S.era !== era) armar(S.era);
      return ep ? ep.sincronizar(t, dt) : { luz: typeof luzDia === 'function' ? luzDia() : 1, brasa: 0 };
    },
    superponer(t) { if (ep) ep.superponer(t); },
    rotulos(ancla, t, tocarEn) { if (ep && ep.rotulos) ep.rotulos(ancla, t, tocarEn); },
    get nubes() { return ep ? ep.nubes : null; },
    get quieto() { return ep ? ep.quieto : null; },
    get retratos() { return mo ? mo.retratos : new Map(); },
    get ranuras() { return mo ? mo.ranuras : {}; },
    get motor() { return mo; },
    get epoca() { return ep; },                        // lo que la época expone (para el QA)
    /* la persona que firma la consejera (su nombre en minúsculas) → sus opciones, si la época la declara */
    caraDe(firma) { if (!ep || !ep.caras) return null; for (const [k, o] of Object.entries(ep.caras)) if (firma.includes(k)) return o; return null; },
  };
}
