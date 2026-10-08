/* ============================================================
   escena
   La luz de cada hora, la escena de un estilo y la cámara isométrica. La cámara es ortográfica y
   mira desde 30° de alto y 45° de lado: la misma proyección 2:1 del juego 2D, así que una celda se
   ve como el rombo de siempre.
   ============================================================ */
import * as THREE from 'three';
import { crearKit } from './kit.js';
import { construirMundo, CENTRO, E0, E1 } from './mundo.js';

export const HORAS = {
  dia:   { nombre: 'Día',   cielo: ['#86bfe0', '#f3dfb4'], hemi: ['#eaf4ff', '#9a9460', 1.45], sol: ['#fff3dc', 2.7, [-6, 13, 9]],  fuego: 2,  nube: '#f7f3ec', luci: false },
  tarde: { nombre: 'Tarde', cielo: ['#6b67a0', '#f1b389'], hemi: ['#ffd9bd', '#5c5270', 1.05], sol: ['#ffae6a', 2.3, [-13, 5.5, 4]], fuego: 7,  nube: '#f5cfb8', luci: true },
  noche: { nombre: 'Noche', cielo: ['#0f1530', '#2b2e5a'], hemi: ['#6076c0', '#161828', 0.5],  sol: ['#a8bbff', 0.55, [-5, 12, 10]], fuego: 22, nube: '#5d6388', luci: true },
};

export function crearEscena(clave, tipoGente) {
  const K = crearKit(clave), scene = new THREE.Scene();
  const mundo = construirMundo(K, tipoGente);
  scene.add(mundo.raiz);
  const hemi = new THREE.HemisphereLight();
  const sol = new THREE.DirectionalLight(); sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 80 });
  sol.shadow.bias = -0.0006; sol.shadow.normalBias = 0.03; sol.shadow.radius = K.E.suave ? 4 : 2;
  sol.target.position.set(CENTRO, 0, CENTRO);
  scene.add(hemi, sol, sol.target);
  const aj = K.E.toon ? { hemi: 0.75, sol: 1.2 } : K.E.suave ? { hemi: 1.15, sol: 0.95 } : { hemi: 1, sol: 1 };
  let hora = 'dia';
  return {
    K, scene, mundo,
    get hora() { return hora; },
    ponerHora(h) {
      hora = h; const H = HORAS[h];
      hemi.color.set(H.hemi[0]); hemi.groundColor.set(H.hemi[1]); hemi.intensity = H.hemi[2] * aj.hemi;
      sol.color.set(H.sol[0]); sol.intensity = H.sol[1] * aj.sol;
      sol.position.set(CENTRO + H.sol[2][0] * 2, H.sol[2][1] * 2, CENTRO + H.sol[2][2] * 2);
      mundo.luces.fuegoBase = H.fuego;
      mundo.nubes.mat.color.set(H.nube);
      mundo.luciernagas.visible = H.luci;
    },
    sombrasDelFuego(si) { mundo.luces.fuego.castShadow = si; },
    actualizar(t, dt) { mundo.actualizar(t, dt, hora); },
  };
}

/* La cámara isométrica. `vista` es compartida: al comparar, las tres escenas se mueven juntas. */
const DIR = new THREE.Vector3(Math.cos(Math.PI / 6) * Math.SQRT1_2, Math.sin(Math.PI / 6), Math.cos(Math.PI / 6) * Math.SQRT1_2);
const DER = new THREE.Vector3(1, 0, -1).normalize(), LEJOS = new THREE.Vector3(-1, 0, -1).normalize();
const PLANO = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), rc = new THREE.Raycaster();

export function crearVista() { return { centro: new THREE.Vector3(CENTRO, 0.5, CENTRO), zoom: 1 }; }

export class Camara {
  constructor(vista) { this.vista = vista; this.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -200, 200); this.w = this.h = 1; this.s = 1; }
  /* w, h: el tamaño del panel; banda: {arriba, abajo} en px que el HUD le quita al encuadre. */
  aplicar(w, h, banda = { arriba: 0, abajo: 0 }) {
    this.w = w; this.h = h; this.banda = banda;
    const hb = Math.max(80, h - banda.arriba - banda.abajo);
    const s = Math.min(w / 25, hb / 16.5) * this.vista.zoom, yc = banda.arriba + hb / 2;
    Object.assign(this.cam, { left: -w / 2 / s, right: w / 2 / s, top: yc / s, bottom: -(h - yc) / s });
    this.s = s;
    this.cam.position.copy(this.vista.centro).addScaledVector(DIR, 60);
    this.cam.lookAt(this.vista.centro);
    this.cam.updateProjectionMatrix(); this.cam.updateMatrixWorld();
  }
  ndc(px, py) { return new THREE.Vector2((px / this.w) * 2 - 1, -(py / this.h) * 2 + 1); }
  sueloEn(px, py) { rc.setFromCamera(this.ndc(px, py), this.cam); return rc.ray.intersectPlane(PLANO, new THREE.Vector3()); }
  pan(dx, dy) {
    const c = this.vista.centro;
    c.addScaledVector(DER, -dx / this.s).addScaledVector(LEJOS, (dy / this.s) / 0.5);
    c.x = Math.max(E0 + 1, Math.min(E1 - 1, c.x)); c.z = Math.max(E0 + 1, Math.min(E1 - 1, c.z));
  }
  zoomEn(f, px, py) {
    const antes = this.sueloEn(px, py);
    this.vista.zoom = Math.max(0.55, Math.min(5, this.vista.zoom * f));
    this.aplicar(this.w, this.h, this.banda);
    const despues = this.sueloEn(px, py);
    if (antes && despues) { this.vista.centro.add(antes.sub(despues)); this.pan(0, 0); }
  }
  tocar(px, py, objetos) {
    rc.setFromCamera(this.ndc(px, py), this.cam);
    for (const hit of rc.intersectObjects(objetos, true)) {
      let o = hit.object;
      while (o && !o.userData.ficha) o = o.parent;
      if (o) return o;
    }
    return null;
  }
  aPantalla(v) { const p = v.clone().project(this.cam); return { x: (p.x + 1) / 2 * this.w, y: (1 - p.y) / 2 * this.h }; }
}
