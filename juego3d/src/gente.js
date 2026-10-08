/* ============================================================
   gente
   El clan en tres versiones para elegir: PERSONAS (cabezonas, de cuero), BLOBS (gotas con ojos) y
   FICHAS (la ficha de madera de un juego de mesa, con cara). Las tres miran hacia +z local y
   comparten la misma interfaz: { obj, anim(t, estado), alto }.
   ============================================================ */
import * as THREE from 'three';
import { PAL } from './kit.js';

export const TIPOS_GENTE = {
  persona: { nombre: 'Personas' },
  blob:    { nombre: 'Blobs' },
  ficha:   { nombre: 'Fichas' },
};

/* El elenco del boceto: la Abuela junto al fuego, dos guías y cuatro aprendices. */
export const ELENCO = [
  { id: 'abuela', rol: 'abuela',   nombre: 'La Abuela',   oficio: 'guarda las historias del clan', piel: 1, pelo: 0, sienta: 0 },
  { id: 'guia1',  rol: 'guia',     nombre: 'Uru',         oficio: 'guía · talla el sílex',          piel: 2, pelo: 0 },
  { id: 'guia2',  rol: 'guia',     nombre: 'Tala',        oficio: 'guía · lee las huellas',         piel: 0, pelo: 1 },
  { id: 'a1',     rol: 'aprendiz', nombre: 'Ané',         oficio: 'aprendiz · a medias',            piel: 0, pelo: 1, sienta: 1 },
  { id: 'a2',     rol: 'aprendiz', nombre: 'Kio',         oficio: 'aprendiz · recién llegado',      piel: 3, pelo: 2 },
  { id: 'a3',     rol: 'aprendiz', nombre: 'Mía',         oficio: 'aprendiz · a medias',            piel: 1, pelo: 0 },
  { id: 'a4',     rol: 'aprendiz', nombre: 'Tuk',         oficio: 'aprendiz · ya sabe',             piel: 2, pelo: 1 },
];

const escala = rol => 0.88 * (rol === 'aprendiz' ? 0.74 : rol === 'abuela' ? 0.92 : 1);

export function crearGente(K, tipo, d, i) {
  const f = tipo === 'blob' ? blob : tipo === 'ficha' ? ficha : persona;
  const p = f(K, d, i);
  p.obj.userData.ficha = { titulo: d.nombre, texto: d.oficio };
  // blanco generoso para el dedo: una cápsula invisible del doble de ancho que el cuerpo
  const hit = new THREE.Mesh(new THREE.CapsuleGeometry(0.34, 0.5, 2, 6), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.y = 0.55 * escala(d.rol); hit.scale.setScalar(escala(d.rol));
  hit.userData.golpe = true;
  p.obj.add(hit);
  p.fase = i * 1.37;
  return p;
}

/* El parpadeo del juego 2D: ~150 ms cada ~4,3 s, con fase propia. */
function apertura(t, fase) {
  const c = (t + fase * 1.37) % 4.3;
  return c < 0.28 ? Math.max(0.12, 1 - 0.88 * Math.sin(Math.PI * c / 0.28)) : 1;
}

/* ---------- PERSONAS ---------- */
function persona(K, d, i) {
  const sc = escala(d.rol), g = new THREE.Group(), cuerpo = new THREE.Group();
  g.add(cuerpo); cuerpo.scale.setScalar(sc);
  const piel = PAL.piel[d.piel], pelo = d.rol === 'abuela' ? PAL.canas : PAL.pelo[d.pelo];
  const ropa = d.rol === 'aprendiz' ? PAL.cueroC : d.rol === 'abuela' ? PAL.cueroD : PAL.cuero;

  const pierna = lado => {
    const piv = new THREE.Group(); piv.position.set(lado * 0.075, 0.25, 0);
    const m = K.malla(K.capsula(0.06, 0.12), piel, { grosor: 0.018 }); m.position.y = -0.13;
    piv.add(m); cuerpo.add(piv); return piv;
  };
  const brazo = lado => {
    const piv = new THREE.Group(); piv.position.set(lado * 0.2, 0.53, 0);
    const m = K.malla(K.capsula(0.05, 0.15), piel, { grosor: 0.018 }); m.position.y = -0.12;
    piv.rotation.z = lado * 0.12;
    piv.add(m); cuerpo.add(piv); return piv;
  };
  const pi = pierna(-1), pd = pierna(1), bi = brazo(-1), bd = brazo(1);
  const torso = K.malla(K.cilindro(0.14, 0.19, 0.36, 10), ropa); torso.position.y = 0.41; cuerpo.add(torso);
  const hombros = K.malla(K.esfera(0.15), ropa); hombros.scale.set(1.18, 0.5, 0.95); hombros.position.y = 0.57; cuerpo.add(hombros);
  const cabeza = new THREE.Group(); cabeza.position.y = 0.8; cuerpo.add(cabeza);
  cabeza.add(K.malla(K.esfera(0.2), piel));
  const cab = K.malla(K.esfera(0.212), pelo); cab.scale.set(1.02, 0.78, 1.02); cab.position.set(0, 0.06, -0.035); cabeza.add(cab);
  if (d.rol === 'abuela') {
    const mono = K.malla(K.esfera(0.09), pelo); mono.position.set(0, 0.13, -0.17); cabeza.add(mono);
    const chal = K.malla(K.toro(0.17, 0.055), PAL.chal); chal.rotation.x = Math.PI / 2; chal.position.y = 0.58; cuerpo.add(chal);
  } else if (d.rol === 'guia') {
    const cinta = K.malla(K.toro(0.2, 0.025), PAL.chal, { grosor: 0.012 }); cinta.rotation.x = Math.PI / 2; cinta.position.y = 0.07; cabeza.add(cinta);
  } else {
    const mecha = K.malla(K.esfera(0.07), pelo); mecha.position.set(0.06, 0.2, 0.05); cabeza.add(mecha);
  }
  const ojos = [-1, 1].map(l => { const o = K.malla(K.esfera(0.03), '#241a14', { sinTinta: true, sombra: false }); o.position.set(l * 0.075, 0.0, 0.185); cabeza.add(o); return o; });
  if (K.E.suave) [-1, 1].forEach(l => { const m = K.malla(K.esfera(0.035), '#f0a08a', { sombra: false }); m.scale.set(1, 0.6, 0.4); m.position.set(l * 0.12, -0.06, 0.17); cabeza.add(m); });

  return {
    obj: g, alto: 1.05 * sc,
    anim(t, e) {
      const a = apertura(t, this.fase); ojos.forEach(o => o.scale.y = a);
      if (e.sentado) {
        cuerpo.position.y = 0.2 - 0.25 * sc;             // la cadera sobre el tronco del asiento
        pi.rotation.x = pd.rotation.x = -1.4; bi.rotation.x = bd.rotation.x = -0.55;
        cabeza.rotation.x = 0.06 * Math.sin(t * 0.8 + this.fase);
        return;
      }
      const w = e.andando ? Math.sin(t * 9 + this.fase) : 0;
      pi.rotation.x = 0.55 * w; pd.rotation.x = -0.55 * w;
      bi.rotation.x = -0.45 * w; bd.rotation.x = 0.45 * w;
      cuerpo.position.y = e.andando ? 0.025 * sc * Math.abs(Math.cos(t * 9 + this.fase)) : 0;
      cabeza.rotation.x = 0; cabeza.rotation.y = e.andando ? 0 : 0.25 * Math.sin(t * 0.5 + this.fase);
    },
  };
}

/* ---------- BLOBS ---------- */
function blob(K, d, i) {
  const sc = escala(d.rol) * 1.05, g = new THREE.Group(), cuerpo = new THREE.Group();
  g.add(cuerpo); cuerpo.scale.setScalar(sc);
  const color = d.rol === 'guia' ? PAL.blob.guia : d.rol === 'abuela' ? PAL.blob.abuela : PAL.blob.aprendiz[i % PAL.blob.aprendiz.length];
  const masa = new THREE.Group(); cuerpo.add(masa);
  const b = K.malla(K.esfera(0.34), color, { grosor: 0.022 }); b.scale.set(1, 0.95, 1); b.position.y = 0.33; masa.add(b);
  const ojos = [], pupilas = [];
  [-1, 1].forEach(l => {
    const o = K.malla(K.esfera(0.085), '#fbf8f0', { sombra: false, grosor: 0.012 }); o.position.set(l * 0.115, 0.43, 0.27); masa.add(o); ojos.push(o);
    const p = K.malla(K.esfera(0.045), '#241a14', { sinTinta: true, sombra: false }); p.position.set(0, 0, 0.055); o.add(p); pupilas.push(p);
  });
  if (d.rol === 'abuela') {
    const chal = K.malla(K.toro(0.29, 0.06), PAL.chal); chal.rotation.x = Math.PI / 2; chal.position.y = 0.2; masa.add(chal);
    const mono = K.malla(K.esfera(0.09), PAL.canas); mono.position.set(0, 0.66, -0.08); masa.add(mono);
  } else if (d.rol === 'guia') {
    const pluma = K.malla(K.esfera(0.07), PAL.chal, { grosor: 0.012 }); pluma.scale.set(0.55, 1.9, 0.55); pluma.position.set(-0.06, 0.72, -0.04); pluma.rotation.z = 0.35; masa.add(pluma);
  } else {
    const brote = K.malla(K.esfera(0.06), color); brote.scale.set(0.7, 1.4, 0.7); brote.position.set(0.04, 0.68, 0); brote.rotation.z = -0.3; masa.add(brote);
  }
  return {
    obj: g, alto: 0.72 * sc,
    anim(t, e) {
      const a = apertura(t, this.fase); ojos.forEach(o => o.scale.y = a);
      if (e.sentado) { masa.scale.set(1.08, 0.88, 1.08); masa.position.y = 0; pupilas.forEach(p => p.position.x = 0); return; }
      const s = e.andando ? Math.abs(Math.sin(t * 7 + this.fase)) : 0.5 + 0.5 * Math.sin(t * 2 + this.fase);
      masa.position.y = e.andando ? 0.12 * s : 0;
      const k = e.andando ? 0.1 * (s - 0.5) : 0.025 * (s - 0.5);
      masa.scale.set(1 - k, 1 + k * 1.6, 1 - k);
      pupilas.forEach(p => { p.position.x = e.andando ? 0 : 0.02 * Math.sin(t * 0.7 + this.fase); p.position.y = e.andando ? 0.01 : 0; });
    },
  };
}

/* ---------- FICHAS ---------- */
const siluetas = new Map();
function siluetaFicha(K) {
  const clave = K.clave;
  if (siluetas.has(clave)) return siluetas.get(clave);
  const s = new THREE.Shape();
  s.moveTo(-0.28, 0); s.lineTo(-0.07, 0); s.lineTo(0, 0.12); s.lineTo(0.07, 0); s.lineTo(0.28, 0);
  s.quadraticCurveTo(0.2, 0.18, 0.15, 0.28);
  s.quadraticCurveTo(0.34, 0.3, 0.35, 0.37);
  s.quadraticCurveTo(0.34, 0.44, 0.2, 0.43);
  s.lineTo(0.07, 0.45);
  s.absarc(0, 0.54, 0.114, -0.91, 4.05, false);
  s.lineTo(-0.2, 0.43);
  s.quadraticCurveTo(-0.34, 0.44, -0.35, 0.37);
  s.quadraticCurveTo(-0.34, 0.3, -0.15, 0.28);
  s.quadraticCurveTo(-0.2, 0.18, -0.28, 0);
  const lisa = K.E.flat ? 2 : K.E.suave ? 10 : 6;
  const geo = new THREE.ExtrudeGeometry(s, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: K.E.flat ? 1 : K.E.suave ? 5 : 3, curveSegments: lisa });
  geo.translate(0, 0, -0.08);
  geo.computeVertexNormals();
  siluetas.set(clave, geo);
  return geo;
}
function ficha(K, d, i) {
  const sc = escala(d.rol) * 1.45, g = new THREE.Group(), cuerpo = new THREE.Group();
  g.add(cuerpo); cuerpo.scale.setScalar(sc);
  const color = d.rol === 'guia' ? '#c0653a' : d.rol === 'abuela' ? '#e6dccb' : PAL.blob.aprendiz[i % PAL.blob.aprendiz.length];
  const m = K.malla(siluetaFicha(K), color, { grosor: 0.016 }); cuerpo.add(m);
  const ojos = [-1, 1].map(l => { const o = K.malla(K.esfera(0.02), '#241a14', { sinTinta: true, sombra: false }); o.position.set(l * 0.042, 0.55, 0.118); cuerpo.add(o); return o; });
  return {
    obj: g, alto: 0.68 * sc,
    anim(t, e) {
      const a = apertura(t, this.fase); ojos.forEach(o => o.scale.y = a);
      if (e.sentado) { cuerpo.position.y = 0; cuerpo.rotation.set(-0.12, 0, 0); return; }
      const s = Math.sin(t * 8 + this.fase);
      cuerpo.position.y = e.andando ? 0.06 * Math.abs(s) : 0;
      cuerpo.rotation.z = e.andando ? 0.12 * s : 0; cuerpo.rotation.x = 0;
    },
  };
}
