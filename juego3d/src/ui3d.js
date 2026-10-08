/* ============================================================
   ui3d
   La interfaz de Lumbre 3D: la del 2D (el vidrio de hoy), con cuatro cambios sutiles que eligió el
   usuario el 2026-09-28 tras comparar tres pieles («las otras saturan; me quedo con la de hoy»):
   1. CARAS 3D: la consejera y las fichas de las personas muestran su retrato, hecho con sus modelos.
   2. RÓTULOS QUE SE TOCAN: los que declara cada época (en la 1: «échale leña», «cosechar», «enviar la
      partida de caza» y la barra de la caza) son chips de vidrio anclados al mundo (en el celular, tocar un botón es más fácil que atinarle
      a un leño). Tocarlos toca por ti lo que señalan: el 2D decide qué pasa.
   3. AVISOS A UN LADO: en escritorio, en la columna izquierda; en el celular, uno a la vez. Se cierran
      tocándolos. (Esto vive en el CSS de jugar.html.)
   4. LO RECOGIDO VUELA a su contador, que salta al recibirlo.
   Todo lo demás (emojis, «+N», libritos, anillos, señales) queda como en el 2D.
   ============================================================ */
import * as THREE from 'three';
import { crearPersona } from './actores.js';
import { crearMamut } from './mamut.js';
import * as MO from './modelos.js';

/* ---------- el estudio de retratos: un renderer chico que hornea caras a imagen ---------- */
function crearEstudio(K) {
  const R = 128, lienzo = document.createElement('canvas'); lienzo.width = lienzo.height = R;
  const rr = new THREE.WebGLRenderer({ canvas: lienzo, alpha: true, antialias: true, preserveDrawingBuffer: true });
  rr.setPixelRatio(1); rr.setSize(R, R, false); rr.setClearColor(0x000000, 0);
  const esc = new THREE.Scene();
  esc.add(new THREE.HemisphereLight('#fff6e8', '#8a7a60', 1.3));
  const sol = new THREE.DirectionalLight('#fff3dc', 3.0); sol.position.set(-2, 5, 4); esc.add(sol);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -50, 50);
  cam.position.set(1, 0.55, 1.6).normalize().multiplyScalar(10); cam.lookAt(0, 0, 0); cam.updateMatrixWorld();
  const v = new THREE.Vector3(), caja = new THREE.Box3(), t3 = new THREE.Box3(), cache = new Map();
  const hornear = (obj, recorte) => {
    esc.add(obj); obj.updateMatrixWorld(true);
    caja.makeEmpty();
    obj.traverse(o => { if (!o.isMesh || o.userData.tinta || o.material?.visible === false) return; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); caja.union(t3.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld)); });
    if (recorte) caja.min.y += (caja.max.y - caja.min.y) * recorte;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (let i = 0; i < 8; i++) { v.set(i & 1 ? caja.max.x : caja.min.x, i & 2 ? caja.max.y : caja.min.y, i & 4 ? caja.max.z : caja.min.z).applyMatrix4(cam.matrixWorldInverse); x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
    const lado = Math.max(x1 - x0, y1 - y0) * 1.12, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
    Object.assign(cam, { left: cx - lado / 2, right: cx + lado / 2, top: cy + lado / 2, bottom: cy - lado / 2 }); cam.updateProjectionMatrix();
    rr.render(esc, cam);
    esc.remove(obj);
    return lienzo.toDataURL('image/png');
  };
  return {
    /* el busto de una persona (sus mismas opciones de crearPersona): la cara, de cerca */
    retrato(op) {
      const clave = JSON.stringify(op);
      if (!cache.has(clave)) { const p = crearPersona(K, op); p.anim(0, { pose: 'quieto', instantaneo: true }); cache.set(clave, hornear(p.obj, 0.6)); }
      return cache.get(clave);
    },
    mamut() {
      if (!cache.has('mamut')) { const m = crearMamut(K); m.anim(0, false); cache.set('mamut', hornear(m.obj, 0.35)); }
      return cache.get('mamut');
    },
  };
}

export function crearUI3D({ K, escena, cam, vivo, activa = true }) {
  if (!activa) return null;
  document.body.classList.add('ui-3d');
  const estudio = crearEstudio(K);
  const capa = new THREE.Group(); capa.userData.vivo = true; escena.add(capa);
  const ahora = () => performance.now();

  /* ---- 1. las caras: la consejera habla con la cara de quien firma (la época declara sus caras; sin ella,
     queda el busto 2D del motor) ---- */
  const cara = document.createElement('img'); cara.className = 'cara3d'; cara.alt = '';
  const lienzoCara = document.getElementById('consejo-cara'); lienzoCara?.parentNode.insertBefore(cara, lienzoCara);
  let firma = null;
  function consejera() {
    const f = (document.getElementById('consejo-firma')?.textContent || '').toLowerCase();
    if (f === firma) return; firma = f;
    const op = vivo.caraDe(f);
    document.getElementById('consejo')?.classList.toggle('con-cara3d', !!op);
    if (op) cara.src = estudio.retrato(op);
  }
  /* ---- …y las fichas: si lo tocado es una persona (o el mamut), su retrato en lugar del emoji ---- */
  const ficha = document.getElementById('ficha');
  function vestirFicha() {
    const hueco = ficha.querySelector('.cab .emoji');
    if (!hueco || hueco.dataset.cara === fichaActiva) return;
    const op = vivo.retratos.get(fichaActiva);
    const src = op ? estudio.retrato(op) : fichaActiva === 'mamut' ? estudio.mamut() : null;
    if (!src) return;
    hueco.dataset.cara = fichaActiva; hueco.classList.add('con-cara');
    hueco.innerHTML = `<img class="cara3d-ficha" alt="" src="${src}">`;
  }
  new MutationObserver(vestirFicha).observe(ficha, { childList: true });

  /* ---- 2. los rótulos: chips de vidrio anclados al mundo, que se tocan ---- */
  const anclas = document.createElement('div'); anclas.id = 'anclas'; document.body.appendChild(anclas);
  const botones = {};
  /* El botón toca por ti lo que señala, en el MISMO punto al que apunta golpeaPersona del 2D: a 15·zoom sobre
     el pie de una cosa, o en el centro de una superficie. (QA: con 12 px fijos, en el celular, con su zoom
     chico, «cosechar» caía fuera de la parcela y no cosechaba.) */
  const tocarEn = (x, y) => {
    const q = P(x, y), c = document.getElementById('scene');
    const t = GENTE_CLIC.filter(g => esAccion(g.ficha) || g.ficha.k === 'mamut').sort((a, b) => Math.hypot(a.x - q.x, a.y - q.y) - Math.hypot(b.x - q.x, b.y - q.y))[0];
    const bx = t ? t.x : q.x, by = t ? (t.area ? t.y - (t.area.dy || 0) * zoom : t.y - 15 * zoom) : q.y - 15 * zoom;
    const r = c.getBoundingClientRect();
    const ev = tipo => c.dispatchEvent(new PointerEvent(tipo, { pointerId: 91, pointerType: 'mouse', clientX: bx + r.left, clientY: by + r.top, bubbles: true, isPrimary: true }));
    ev('pointerdown'); ev('pointerup');
  };
  function ancla(id, visible, x, y, z, html, clase, alTocar) {
    let b = botones[id];
    if (!visible) { if (b) b.el.style.display = 'none'; return; }
    if (!b) {
      const el = document.createElement(alTocar ? 'button' : 'div'); el.className = 'ancla ' + clase;
      if (alTocar) el.addEventListener('click', e => { e.stopPropagation(); if (b.alTocar) b.alTocar(); });
      anclas.appendChild(el); b = botones[id] = { el, html: '' };
    }
    b.alTocar = alTocar;
    if (b.html !== html) { b.el.innerHTML = html; b.html = html; }
    const p = P(x, y, z);
    b.el.style.display = ''; b.x = p.x; b.y = p.y; b.wx = x; b.wy = y; b.visto = true; b.prio = alTocar ? 0 : 1;
  }
  function acomodar() {                               // los rótulos no se pisan: lo que choca, sube
    const puestos = [];
    const g = consejoG && consejoG.x != null ? consejoG : null, cerca = b => g ? Math.hypot(b.wx - g.x, b.wy - g.y) < 1.2 ? 0 : 1 : 0;   // lo que señala la consejera, primero
    // lo que nadie declaró en este cuadro es de una época que ya se fue (un rótulo de Alejandría quedaba colgado en la
    // siguiente época, en su último lugar): se esconde
    // y suelta su acción: la función nace dentro de la época que la declaró y, guardada aquí, retenía su motor y su mundo
    // entero después del cruce (~25 MB por época; QA entero, 2026-10-03). Si vuelve a declararse, ancla() la repone.
    for (const b of Object.values(botones)) if (!b.visto) { b.el.style.display = 'none'; b.alTocar = null; }
    const lista = Object.values(botones).filter(b => b.visto).sort((a, b) => a.prio - b.prio || cerca(a) - cerca(b) || b.y - a.y);
    // F5 del QA general: en Sumer llegaban a apilarse cuatro en el celular y uno quedó sin poder tocarse. Ahora, en el
    // celular, dos a la vez (los de más al frente); y en toda pantalla se retira el que el apilado aleja de lo suyo o sube
    // sobre la barra de arriba. Lo retirado sigue a mano: tocar la cosa en el mundo hace lo mismo que su rótulo.
    const chico = W < 700, tope = chico ? 2 : 4, techo = chico ? 175 : 70;
    let mostrados = 0;
    for (const b of lista) {
      const w = b.el.offsetWidth || 80, h = b.el.offsetHeight || 26;
      let x0 = Math.max(6, Math.min(W - w - 6, b.x - w / 2)), y1 = b.y, y0 = y1 - h;   // nunca cortado por el borde
      for (let n = 0; n < 8; n++) {
        const choca = puestos.find(q => x0 < q.x1 + 4 && x0 + w > q.x0 - 4 && y0 < q.y1 + 3 && y1 > q.y0 - 3);
        if (!choca) break;
        y1 = choca.y0 - 4; y0 = y1 - h;
      }
      if (mostrados >= tope || b.y - y1 > h * 2.5 || y0 < techo) { b.el.style.display = 'none'; continue; }
      mostrados++;
      puestos.push({ x0, x1: x0 + w, y0, y1 });
      b.el.style.transform = `translate(${x0.toFixed(1)}px, ${y0.toFixed(1)}px)`;
    }
    for (const b of Object.values(botones)) b.visto = false;
  }
  function rotulos(t) {                               // los de la época en curso (su módulo en epocas/ los declara)
    vivo.rotulos(ancla, t, tocarEn);
    acomodar();
  }

  /* ---- 4. lo recogido vuela a su contador ---- */
  /* El destino es un punto del RAYO de la cámara que pasa por el contador (a 2,5 de altura): cualquier punto
     de ese rayo cae en pantalla justo sobre el contador. */
  const vuelos = [], rc = new THREE.Raycaster(), plano = new THREE.Plane(new THREE.Vector3(0, 1, 0), -2.5), ndc = new THREE.Vector2(), punto = new THREE.Vector3();
  const aMundo = (sx, sy) => { ndc.set(sx / window.innerWidth * 2 - 1, -(sy / window.innerHeight) * 2 + 1); rc.setFromCamera(ndc, cam); return rc.ray.intersectPlane(plano, punto) ? punto.clone() : null; };
  const recoger0 = window.recogerColectible;
  window.recogerColectible = function (node) {
    const destino = node.mat ? document.querySelector(`#mats [data-mat="${node.mat.k}"]`) : document.getElementById('r-apr');
    const o = node.mat ? MO.modeloMaterial(K, node.mat.k) : MO.chispa(K);
    o.position.set(node.x, 0.2, node.y); capa.add(o);
    vuelos.push({ o, t0: ahora(), x0: node.x, z0: node.y, destino });
    return recoger0(node);
  };
  function volar() {
    const n = ahora();
    for (let i = vuelos.length - 1; i >= 0; i--) {
      const V = vuelos[i], k = Math.min(1, (n - V.t0) / 650), e = k * k * (3 - 2 * k);
      let tx = V.x0, ty = 3, tz = V.z0;
      if (V.destino && V.destino.offsetParent) { const r = V.destino.getBoundingClientRect(); const w = aMundo(r.left + r.width / 2, r.top + r.height / 2); if (w) { tx = w.x; ty = w.y; tz = w.z; } }
      V.o.position.set(V.x0 + (tx - V.x0) * e, 0.2 + (ty - 0.2) * e + Math.sin(e * Math.PI) * 0.8, V.z0 + (tz - V.z0) * e);
      V.o.scale.setScalar(1.5 - e * 0.9); V.o.rotation.y = e * 6;
      if (k >= 1) { capa.remove(V.o); vuelos.splice(i, 1); if (V.destino) { V.destino.classList.remove('golpe'); void V.destino.offsetWidth; V.destino.classList.add('golpe'); } }
    }
  }

  /* ---- 3. los avisos: se cierran tocándolos. En el celular vertical caben en UNA línea: el primer toque los
     abre enteros (y les da tiempo de lectura), el segundo los cierra. El toast() del motor se reemplaza por uno
     igual que además sabe alargar su vida. ---- */
  const telefono = () => W <= 640 && H > W;
  /* LOS AVISOS LLEGAN DE A UNO (lista de cotejo A5: al encender el fuego llegaban tres juntos): si otro acaba de
     aparecer, este espera su turno, 2,6 s después del anterior, en el mismo orden. */
  let ultimoAviso = 0;
  window.toast = function (html, ms = 6000) {
    const ahora = performance.now(), espera = Math.max(0, ultimoAviso + 2600 - ahora), era = S.era;
    ultimoAviso = ahora + espera;
    if (espera < 30) mostrarAviso(html, ms);
    else setTimeout(() => { if (S.era === era && !(/^(🪵|🌒)/.test(html) && S.fuegoDescubierto)) mostrarAviso(html, ms); }, espera);   // lo del frote no llega con el fuego ya encendido   // lo que esperaba turno en otra época ya no se dice
  };
  function mostrarAviso(html, ms) {
    const cont = document.getElementById('toasts'), d = document.createElement('div');
    d.className = 'toast'; d.innerHTML = html; cont.prepend(d);
    while (cont.children.length > 3) cont.lastChild.remove();
    let fin = performance.now() + ms;
    d.alargar = extra => { fin = Math.max(fin, performance.now() + extra); };
    const vigilar = () => {
      if (!d.isConnected) return;
      const falta = fin - performance.now();
      if (falta > 0) { setTimeout(vigilar, falta + 20); return; }
      d.style.opacity = '0'; setTimeout(() => d.remove(), 700);
    };
    setTimeout(vigilar, ms);
  };
  document.getElementById('toasts')?.addEventListener('click', e => {
    const d = e.target.closest('.toast'); if (!d) return;
    if (telefono() && !d.classList.contains('abierta') && d.scrollWidth > d.clientWidth + 2) { d.classList.add('abierta'); d.alargar?.(Math.max(8000, d.textContent.length * 55)); return; }
    d.style.opacity = '0'; setTimeout(() => d.remove(), 300);
  });

  /* ---- 5. el celular vertical: la cámara abre CERCA de lo que pasa (el valle entero cabe, pero a 0,35 la gente es
     de hormiga) y, si nadie la está moviendo, sigue a la consejera cuando señala algo fuera de la vista. ⌂ alterna
     entre el valle entero y de cerca. Los controles del rincón se recogen arriba a la derecha (×1 ×5 ⋯). ---- */
  const encuadrar0 = window.encuadrar;
  let vista = 'cerca', ultimo = { W: 0, H: 0 };
  const focoEra = () => S.era === 1 ? { x: 6.9, y: 10.2 } : S.era === 2 ? { x: 9.4, y: 8.2 } : S.era === 3 ? { x: 9.6, y: 8.2 } : { x: 10, y: 10 };   // el fogón; en Sumer, el patio de la edubba; en Egipto, la puerta de la Casa de la Vida
  let eraRecien = false;                               // recién cruzada: la consejera aún habla de la época vieja
  const foco = () => !eraRecien && consejoG && consejoG.x != null ? consejoG : focoEra();
  function encuadrarCerca() {
    encuadrar0();                                  // el completo del motor: zoom, centro y la banda libre
    if (!telefono()) return;
    const r = reservaHud(), f = foco(), cons = document.getElementById('consejo');
    const piso = cons && cons.offsetParent && cons.offsetHeight ? cons.getBoundingClientRect().top : H - r.bottom - 84;   // la consejera también tapa
    const cy = (r.top + piso) / 2;
    zoom = Math.min(0.78, fitZoom() * 1.75);
    ox = W / 2 - (f.x - f.y) * T2X * zoom; oy = cy - (f.x + f.y) * T2Y * zoom + 14 * zoom;
    clampCam();
  }
  window.encuadrar = function () {
    // en el celular, la barra del navegador que aparece y se esconde cambia el alto: eso no es un encuadre nuevo
    // (salvo que haya cambiado la época: el mundo es otro y se encuadra de nuevo)
    if (telefono() && ultimo.W === W && Math.abs(ultimo.H - H) < 160 && ultimo.era === S.era) { oy += (H - ultimo.H) / 2; ultimo.H = H; return; }
    eraRecien = ultimo.era !== undefined && ultimo.era !== S.era;
    ultimo = { W, H, era: S.era };
    if (vista === 'cerca') encuadrarCerca(); else encuadrar0();
  };
  document.getElementById('b-home')?.addEventListener('click', () => {   // el motor ya encuadró el valle entero
    if (!telefono()) return;
    if (vista === 'cerca') vista = 'todo'; else { vista = 'cerca'; encuadrarCerca(); }
  });
  let tocoCamara = 0, gVisto = '';
  const lienzo = document.getElementById('scene');
  for (const ev of ['pointerdown', 'wheel']) lienzo.addEventListener(ev, () => { tocoCamara = performance.now(); }, { passive: true });
  function seguirConsejera() {
    if (!telefono() || vista !== 'cerca' || camTween || arrastrando) return;
    const gg = consejoG; if (!gg || gg.x == null) return;
    const clave = gg.x.toFixed(1) + ',' + gg.y.toFixed(1);
    if (clave === gVisto || performance.now() - tocoCamara < 10000) return;
    gVisto = clave;
    const q = P(gg.x, gg.y), r = reservaHud();
    if (q.x < 36 || q.x > W - 36 || q.y < r.top + 30 || q.y > H - r.bottom - 40) viajarA({ x: gg.x, y: gg.y });
  }
  { // el rincón recogido: ×1 ×5 a la vista, el resto tras ⋯
    const dev = document.getElementById('dev'), mas = document.createElement('button');
    mas.id = 'b-mas'; mas.textContent = '⋯'; mas.title = 'Más controles: la portada, el encuadre, el sonido y la partida.';
    mas.addEventListener('click', () => dev.classList.toggle('abierto'));
    dev.addEventListener('click', e => { const bt = e.target.closest('button'); if (bt && bt !== mas && !bt.dataset.warp && bt.id !== 'b-reset') dev.classList.remove('abierto'); });   // elegido, se recoge (reiniciar pide el segundo toque ahí mismo)
    dev.appendChild(mas);
    document.addEventListener('pointerdown', e => { if (!dev.contains(e.target)) dev.classList.remove('abierto'); });
  }
  /* ---- 6. LOS MOMENTOS CLAVE SE MIRAN DE CERCA (D5 del QA completo): en el escritorio la cámara abre el valle entero y
     el fuego, la caza, las historias de la Abuela, la aldea que nace y la llegada a otra época se veían chicos. Cuando
     pasa uno, si nadie movió la cámara hace poco, se acerca unos segundos y vuelve sola. Con movimiento reducido, quieta;
     en el celular ya está cerca y la consejera la guía. ---- */
  let previo = null, momento = null;
  const marcas = () => ({ fuego: !!S.fuegoDescubierto, caza: !!S.cazaOn, historia: S.abuelaCap || 0, edad: S.edad, era: S.era });
  const suave = k => k * k * (3 - 2 * k);
  function vigilarMomentos() {
    const m = marcas();
    if (!previo) { previo = m; return; }
    let donde = null;
    if (m.era !== previo.era) donde = focoEra();
    else if (m.fuego && !previo.fuego) donde = focoEra();
    else if (m.edad > previo.edad) donde = focoEra();
    else if (m.historia > previo.historia) donde = { x: LUGAR_PENSADOR.abuela[0], y: LUGAR_PENSADOR.abuela[1] };
    else if (m.caza && !previo.caza) donde = { x: MAMUT_HOME.x, y: MAMUT_HOME.y };
    previo = m;
    if (!donde || telefono() || (typeof MOV_REDUCIDO !== 'undefined' && MOV_REDUCIDO) || momento || camTween || arrastrando || performance.now() - tocoCamara < 4000) return;
    const z1 = Math.min(zoom * 1.9, 2.2);
    momento = { t0: performance.now(), desde: { ox, oy, zoom }, hacia: { zoom: z1, ox: W / 2 - (donde.x - donde.y) * T2X * z1, oy: H * 0.5 - (donde.x + donde.y) * T2Y * z1 + 14 * z1 }, toque0: tocoCamara };
  }
  function pasoMomento() {
    if (!momento) return;
    if (tocoCamara !== momento.toque0) { momento = null; return; }   // la persona tomó la cámara: se queda donde la deja
    const s = (performance.now() - momento.t0) / 1000, ida = 1.1, quieto = 3.6, vuelta = 1.1;
    const e = s < ida ? suave(s / ida) : s < ida + quieto ? 1 : s < ida + quieto + vuelta ? 1 - suave((s - ida - quieto) / vuelta) : 0;
    const a = momento.desde, b = momento.hacia;
    zoom = a.zoom + (b.zoom - a.zoom) * e; ox = a.ox + (b.ox - a.ox) * e; oy = a.oy + (b.oy - a.oy) * e;
    if (s >= ida + quieto + vuelta) { zoom = a.zoom; ox = a.ox; oy = a.oy; momento = null; }
  }

  encuadrar(); renderHUD();

  return { cuadro(t) { rotulos(t); volar(); consejera(); seguirConsejera(); vigilarMomentos(); pasoMomento(); } };
}
