/* ============================================================
   mamut
   El mamut, que «sigue invicto»: lanudo, con fleco, trompa que se mece y colmillos curvos.
   Mira hacia +z local. anim(t, andando) mueve patas, trompa y orejas.
   ============================================================ */
import * as THREE from 'three';
import { PAL, fundir } from './kit.js';

/* Un tubo que se afina: TubeGeometry con cada anillo encogido hacia su centro. */
function tuboAfinado(K, puntos, r0, r1, radial = 8) {
  const curva = new THREE.CatmullRomCurve3(puntos.map(p => new THREE.Vector3(...p)));
  const tramos = K.E.flat ? 6 : K.E.suave ? 20 : 12, rad = K.E.flat ? 5 : K.E.suave ? 14 : radial;
  const geo = new THREE.TubeGeometry(curva, tramos, 1, rad, false);
  const pos = geo.getAttribute('position'), v = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i <= tramos; i++) {
    const u = i / tramos, r = r0 + (r1 - r0) * u;
    curva.getPointAt(u, c);
    for (let j = 0; j <= rad; j++) {
      const k = i * (rad + 1) + j;
      v.fromBufferAttribute(pos, k).sub(c).multiplyScalar(r).add(c);
      pos.setXYZ(k, v.x, v.y, v.z);
    }
  }
  geo.computeVertexNormals();
  return geo;
}

export function crearMamut(K) {
  const g = new THREE.Group(), cuerpo = new THREE.Group();
  g.add(cuerpo);
  const lana = PAL.mamut, lanaD = PAL.mamutD, lanaC = PAL.mamutC;

  const tronco = K.malla(K.esfera(1), lana); tronco.scale.set(0.78, 0.72, 1.05); tronco.position.y = 1.3; cuerpo.add(tronco);
  const giba = K.malla(K.esfera(0.62), lanaD); giba.scale.set(1, 0.9, 1.1); giba.position.set(0, 1.85, 0.35); cuerpo.add(giba);
  const grupa = K.malla(K.esfera(0.6), lana); grupa.position.set(0, 1.35, -0.75); cuerpo.add(grupa);

  // el fleco de lana que cuelga de la panza
  const nFleco = K.E.flat ? 12 : 16;
  for (let i = 0; i < nFleco; i++) {
    const a = (i / nFleco) * Math.PI * 2;
    const c = K.malla(K.cono(0.17, 0.55, 6), i % 2 ? lanaD : lana, { grosor: 0.018 });
    c.rotation.x = Math.PI; c.position.set(Math.sin(a) * 0.68, 0.82, Math.cos(a) * 0.9);
    c.rotation.z = Math.sin(a) * 0.15;
    cuerpo.add(c);
  }

  const cabeza = new THREE.Group(); cabeza.position.set(0, 1.62, 1.05); cuerpo.add(cabeza);
  const cr = K.malla(K.esfera(0.52), lana); cr.scale.set(0.92, 1, 0.95); cabeza.add(cr);
  const domo = K.malla(K.esfera(0.34), lanaD); domo.position.set(0, 0.4, -0.08); cabeza.add(domo);
  const orejas = [-1, 1].map(l => { const o = K.malla(K.esfera(0.22), lanaD); o.scale.set(0.35, 1, 0.85); o.position.set(l * 0.47, 0.08, -0.12); o.userData.vivo = true; cabeza.add(o); return o; });
  const ojos = [-1, 1].map(l => { const o = K.malla(K.esfera(0.055), '#1e1612', { sinTinta: true, sombra: false }); o.position.set(l * 0.3, 0.12, 0.36); o.userData.vivo = true; cabeza.add(o); return o; });

  const trompa = new THREE.Group(); trompa.position.set(0, -0.1, 0.38); trompa.userData.vivo = true; cabeza.add(trompa);
  trompa.add(K.malla(tuboAfinado(K, [[0, 0, 0], [0, -0.35, 0.18], [0, -0.8, 0.22], [0, -1.12, 0.36], [0, -1.15, 0.55]], 0.17, 0.07), lana, { grosor: 0.02 }));
  [-1, 1].forEach(l => cabeza.add(K.malla(tuboAfinado(K, [[l * 0.22, -0.22, 0.3], [l * 0.34, -0.62, 0.55], [l * 0.3, -0.72, 0.95], [l * 0.12, -0.45, 1.2]], 0.075, 0.03), PAL.marfil, { grosor: 0.016 })));

  const patas = [[-1, 0.62], [1, 0.62], [-1, -0.62], [1, -0.62]].map(([l, z]) => {
    const piv = new THREE.Group(); piv.position.set(l * 0.45, 1.0, z); piv.userData.vivo = true; cuerpo.add(piv);
    const p = K.malla(K.cilindro(0.21, 0.19, 1.0, 10), lanaD); p.position.y = -0.5; piv.add(p);
    const pie = K.malla(K.cilindro(0.22, 0.23, 0.1, 10), lanaC); pie.position.y = -0.98; piv.add(pie);
    return piv;
  });
  const cola = K.malla(K.cilindro(0.04, 0.06, 0.5, 6), lanaD); cola.position.set(0, 1.25, -1.28); cola.rotation.x = -0.5; cola.userData.vivo = true; cuerpo.add(cola);
  fundir(K, cuerpo);                                 // el lomo, la giba, el fleco y la cabeza se funden: lo que se mueve queda aparte

  g.userData.vivo = true;
  g.userData.ficha = { titulo: 'El mamut', texto: 'sigue invicto: se caza, huye y regresa' };
  const hit = new THREE.Mesh(new THREE.BoxGeometry(2, 2.6, 3.4), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = 1.3; hit.userData.golpe = true; g.add(hit);

  return {
    obj: g,
    anim(t, andando) {
      const w = andando ? Math.sin(t * 3.2) : 0;
      patas[0].rotation.x = patas[3].rotation.x = 0.32 * w;
      patas[1].rotation.x = patas[2].rotation.x = -0.32 * w;
      cuerpo.position.y = andando ? 0.04 * Math.abs(Math.cos(t * 3.2)) : 0;
      trompa.rotation.x = 0.1 * Math.sin(t * 1.3) + (andando ? 0.05 * w : 0);
      trompa.rotation.z = 0.08 * Math.sin(t * 0.9);
      orejas.forEach((o, i) => o.rotation.y = 0.18 * Math.sin(t * 2.1 + i * 1.7));
      const c = t % 5.1, a = c < 0.3 ? Math.max(0.1, 1 - Math.sin(Math.PI * c / 0.3)) : 1;
      ojos.forEach(o => o.scale.y = a);
      cola.rotation.z = 0.25 * Math.sin(t * 2.4);
    },
  };
}
