/* ============================================================
   03-terreno
   renderTerrain: el suelo pre-renderizado en su propio canvas (damero, lago, sendero, playa).
   ============================================================ */
let terrain = null, zoom0 = 1, ox0 = 0, oy0 = 0, terrX = 0, terrY = 0, terrW = 0, terrH = 0;
function renderTerrain() {
  if (LUMBRE.sinTerreno) return; // otro renderizador pinta el suelo (Lumbre 3D)
  // lienzo anclado al MUNDO (no a la pantalla): panear nunca re-renderiza; el zoom se re-dibuja nítido
  const expandido0 = S && ordEra(S.era) >= 13;
  const B0 = expandido0 ? 0 : IN0, B1 = (expandido0 ? 19 : IN1) + 1;
  const pW = (x, y) => ({ x: ox + (x - y) * T2X * zoom, y: oy + (x + y) * T2Y * zoom });
  const oeste = pW(B0, B1), este = pW(B1, B0), norte = pW(B0, B0), sur = pW(B1, B1);
  const rS = (B1 - B0) * 0.94 * T2X * zoom;
  const fondoSombra = oy + 19 * T2Y * zoom + 76 * zoom + rS * 0.3 + 24;
  terrX = oeste.x - 90; terrY = norte.y - 140;
  terrW = (este.x + 90) - terrX;
  terrH = Math.max(sur.y + 56 * zoom + 30, fondoSombra) - terrY;
  zoom0 = zoom; ox0 = ox; oy0 = oy;
  const dprT = Math.min(DPR, 2);
  terrain = document.createElement('canvas');
  terrain.width = Math.ceil(terrW * dprT); terrain.height = Math.ceil(terrH * dprT);
  const tg = terrain.getContext('2d');
  tg.setTransform(dprT, 0, 0, dprT, -terrX * dprT, -terrY * dprT);
  const p2 = (x, y, z = 0) => ({ x: ox + (x - y) * T2X * zoom, y: oy + (x + y) * T2Y * zoom - z * zoom });
  const tpoly = (pts, fill) => {
    tg.beginPath(); tg.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) tg.lineTo(pts[i].x, pts[i].y);
    tg.closePath(); tg.fillStyle = fill; tg.fill(); tg.strokeStyle = fill; tg.lineWidth = 1; tg.stroke();
  };
  // el bloque crece por eras: 16×16 → 20×20 en 1955
  const expandido = S && ordEra(S.era) >= 13;
  const A0 = expandido ? 0 : IN0, A1 = expandido ? 19 : IN1; // tiles útiles
  const E0 = A0, E1 = A1 + 1;                                 // aristas del bloque
  // paleta de época: los años 50 traen pasto pastel y sendero adoquinado
  const era = S ? S.era : 1;
  const esFogon = era === 1, esSumer = era === 2, esEgipto = era === 3, esAgora = era === 4, esModerno = ordEra(era) >= 11, antiguo = ordEra(era) < 11;
  const fogon = esFogon; // compat
  // en la estepa manda el año: el pasto y la tierra son los de la estación (ver ESTACIONES)
  const cPastoA = esModerno ? (expandido ? '#a2cd6f' : PAL.pastoA) : esFogon ? colorEstacion('pastoA') : esSumer ? '#c9be79' : '#e7d3a0';
  const cPastoB = esModerno ? (expandido ? '#98c466' : PAL.pastoB) : esFogon ? colorEstacion('pastoB') : esSumer ? '#c0b36c' : '#ddc88d';
  const cTierraA = expandido ? '#b9b1a2' : esFogon ? colorEstacion('tierraA') : PAL.tierra;
  const cTierraB = expandido ? '#aea698' : esFogon ? colorEstacion('tierraB') : PAL.tierraB;
  const cPunto = expandido ? '#8f887c' : esFogon ? colorEstacion('punto') : PAL.tierraPunto;

  // sombra de flotación
  const rSombra = (E1 - E0) * 0.94 * T2X * zoom;
  const cxS = ox, cyS = oy + 19 * T2Y * zoom + 76 * zoom;
  tg.save(); tg.translate(cxS, cyS); tg.scale(1, 0.3);
  const gsh = tg.createRadialGradient(0, 0, 10, 0, 0, rSombra);
  gsh.addColorStop(0, 'rgba(20,45,70,.3)'); gsh.addColorStop(1, 'rgba(20,45,70,0)');
  tg.fillStyle = gsh; tg.beginPath(); tg.arc(0, 0, rSombra, 0, 7); tg.fill();
  tg.restore();

  // caras del bloque
  const bTopL = esEgipto ? '#cbb06a' : (esSumer || esFogon || esAgora) ? colorEstacion('bordeL') : '#6f9c46'; // Sumer y Atenas también viven el año
  const bTopR = esEgipto ? '#b89a54' : (esSumer || esFogon || esAgora) ? colorEstacion('bordeR') : '#5f8c3e';
  tpoly([p2(E0, E1, 0), p2(E1, E1, 0), p2(E1, E1, -7), p2(E0, E1, -7)], bTopL);
  tpoly([p2(E1, E0, 0), p2(E1, E1, 0), p2(E1, E1, -7), p2(E1, E0, -7)], bTopR);
  tpoly([p2(E0, E1, -7), p2(E1, E1, -7), p2(E1, E1, -34), p2(E0, E1, -34)], PAL.corteL1);
  tpoly([p2(E1, E0, -7), p2(E1, E1, -7), p2(E1, E1, -34), p2(E1, E0, -34)], PAL.corteL2);
  tpoly([p2(E0, E1, -34), p2(E1, E1, -34), p2(E1, E1, -54), p2(E0, E1, -54)], PAL.corteD1);
  tpoly([p2(E1, E0, -34), p2(E1, E1, -34), p2(E1, E1, -54), p2(E1, E0, -54)], PAL.corteD2);

  const rng = mulberry32(20260712);
  for (let i = 0; i < 16; i++) { // piedritas del corte
    const s = rng(), izq = rng() < 0.5, z = -(12 + rng() * 36);
    const p = izq ? p2(lerp(E0 + 0.4, E1 - 0.3, s), E1, z) : p2(E1, lerp(E0 + 0.4, E1 - 0.3, s), z);
    tg.beginPath(); tg.ellipse(p.x, p.y, (2 + rng() * 2.6) * zoom, (1.4 + rng() * 1.7) * zoom, 0, 0, 7);
    tg.fillStyle = z > -34 ? '#bfa176' : '#8a6a4a'; tg.fill();
  }

  // tiles
  const enPlaya = (x, y) => {
    const dx = (x + 0.5 - 15.0) / 2.9, dy = (y + 0.5 - 14.5) / 2.4;
    return dx * dx + dy * dy <= 1 + ((x * 7 + y * 13) % 3 - 1) * 0.12;
  };
  const SILVESTRE = esFogon ? silvestreHoy() : ['#bcbd6d', '#b5b665', '#c2c374', '#b9ba6a', '#bfc06f']; // la estepa, vestida del año
  const ARENA = ['#e8d4a2', '#e2cd98', '#ecdbaa', '#ddc790', '#e5d29c'];      // dunas de Egipto
  const LIMO  = esSumer ? limoHoy() : ['#cabf7c', '#c3b872', '#d1c684', '#bdb06a', '#c8bd78']; // limo de Sumer, vestido del año
  const VEGA  = esEgipto ? vegaHoy() : null; // la vega del Nilo, vestida de SU año de tres (2026-08-24)
  const CAMPO = esAgora ? campoHoy() : null; // el campo del Ática, vestido del año
  const enPlaza = (x, y) => esAgora && x + 0.5 >= PLAZA.x && x + 0.5 <= PLAZA.x + PLAZA.w && y + 0.5 >= PLAZA.y && y + 0.5 <= PLAZA.y + PLAZA.d;
  const enOlivar = (x, y) => esAgora && x + 0.5 >= OLIVAR.x && x + 0.5 <= OLIVAR.x + OLIVAR.w && y + 0.5 >= OLIVAR.y && y + 0.5 <= OLIVAR.y + OLIVAR.d;
  // eje del Nilo (Egipto): banda diagonal por el frente-derecha
  const NIA = { x: NILO.ax, y: NILO.ay }, NIB = { x: NILO.bx, y: NILO.by }; // el eje vive en 11-materiales: aquí ya no se copia
  /* EL AÑO DEL NILO (2026-08-24). Antes el damero decidía la vega con un umbral fijo (d < 2.0)
     mientras las bandas del agua se ensanchaban por su cuenta: el año movía el agua medio tile y la
     cinta verde no se enteraba, así que la crecida «apenas se notaba». Las cifras viven ahora en
     11-materiales (NILO_HUELLA, NILO_VEGA, niloAgua) y de ahí beben el suelo, el agua y la corriente. */
  const NILO_AGUA = esEgipto ? niloAgua() : 1;
  const distNilo = (x, y) => {
    const dx = NIB.x - NIA.x, dy = NIB.y - NIA.y, L2 = dx * dx + dy * dy;
    let tt = ((x - NIA.x) * dx + (y - NIA.y) * dy) / L2; tt = Math.max(0, Math.min(1, tt));
    return Math.hypot(x - (NIA.x + tt * dx), y - (NIA.y + tt * dy));
  };
  for (let x = A0; x <= A1; x++) for (let y = A0; y <= A1; y++) {
    let c;
    if (esFogon) {
      const arado = S && S.edad >= 2 && x >= 3 && x <= 5 && y >= 10 && y <= 11; // la tierra removida del asentamiento
      if (arado) c = ((x + y) & 1) ? '#ab8a54' : '#a58350';
      else c = enPlaya(x, y) ? colorEstacion('arena') : SILVESTRE[(x * 7 + y * 13) % 5];
    } else if (esEgipto) {
      const d = distNilo(x + 0.5, y + 0.5);
      if (d < NILO_VEGA) c = VEGA[(x * 7 + y * 13) % 5];                      // la vega fértil, vestida del año (ajet la verdea, shemu la dora)
      else { const dn = Math.sin(x * 0.9 + y * 0.5) + Math.sin(x * 0.4 - y * 0.8);
             c = dn > 0.8 ? '#efe0b4' : dn < -0.8 ? '#d8c288' : ARENA[(x * 7 + y * 13) % 5]; } // dunas: el desierto no tiene estaciones
    } else if (esAgora) {
      const dI = distIlisos(x + 0.5, y + 0.5);
      if (enPlaza(x, y)) c = ((x + y) & 1) ? '#d9d2bf' : '#d1cab6';                                       // el empedrado del ágora
      else if (enOlivar(x, y)) c = ((x + y) & 1) ? '#b7b47c' : '#aeab74';                                 // la hierba del olivar, más verde
      else if (dI < 1.9) c = ((x + y) & 1) ? colorEstacion('ribera') : colorEstacion('humedo');            // la vega del arroyo
      else { const dn = Math.sin(x * 0.7 + y * 0.6) + Math.sin(x * 0.5 - y * 0.9);
             c = dn > 1.1 ? '#d9cf9c' : dn < -1.1 ? '#b3a86a' : CAMPO[(x * 7 + y * 13) % 5]; }           // el campo del Ática: pasto seco con calvas de roca
    } else if (esSumer) {
      const dR = distRioSumer(x + 0.5, y + 0.5); // la ribera la manda el RÍO, no la laguna del fogón
      const campo = (y >= 9 && y <= 16 && dR > 2.4 && ((x + (y & 1)) % 3 !== 0));
      if (dR < 2.2) c = ((x + y) & 1) ? colorEstacion('riberaA') : colorEstacion('riberaB'); // ribera de barro, del año
      else if (campo) c = ((x + y) & 1) ? colorEstacion('campoA') : colorEstacion('campoB'); // parcelas: verdes de crecida, doradas de siembra
      else c = LIMO[(x * 7 + y * 13) % 5];
    } else if (isPath(x, y)) c = ((x + y) & 1) ? cTierraA : cTierraB;
    else if (enPlaya(x, y)) c = ((x + y) & 1) ? PAL.arenaA : PAL.arenaB;
    else c = ((x + y) & 1) ? cPastoA : cPastoB;
    tpoly([p2(x, y), p2(x + 1, y), p2(x + 1, y + 1), p2(x, y + 1)], c);
  }
  if (esAgora) { // LA CALZADA del ágora: losas grandes marcadas, y la Vía Panatenaica que baja de la Acrópolis
    tg.strokeStyle = 'rgba(120,110,90,.22)'; tg.lineWidth = 1 * zoom;
    for (let x = Math.floor(PLAZA.x); x <= PLAZA.x + PLAZA.w; x++) for (let y = Math.floor(PLAZA.y); y <= PLAZA.y + PLAZA.d; y++) {
      const a = p2(x, y + 0.5), b = p2(x + 1, y + 0.5); tg.beginPath(); tg.moveTo(a.x, a.y); tg.lineTo(b.x, b.y); tg.stroke();
    }
    tg.fillStyle = 'rgba(150,130,90,.22)';
    const rngS = mulberry32(4470), pl = [[6.6, 5.4], [7.6, 6.9], [8.3, 8.4]]; // del pie de la Acrópolis a la plaza
    for (let i = 0; i < pl.length - 1; i++) { const pasos = Math.ceil(Math.hypot(pl[i + 1][0] - pl[i][0], pl[i + 1][1] - pl[i][1]) * 3.4);
      for (let k = 0; k <= pasos; k++) { const fx = pl[i][0] + (pl[i + 1][0] - pl[i][0]) * k / pasos + (rngS() - 0.5) * 0.3, fy = pl[i][1] + (pl[i + 1][1] - pl[i][1]) * k / pasos + (rngS() - 0.5) * 0.3;
        const q = p2(fx, fy); tg.beginPath(); tg.ellipse(q.x, q.y, (5 + rngS() * 4) * zoom, (2.5 + rngS() * 2) * zoom, 0, 0, 7); tg.fill(); } }
  }
  if (esEgipto) { // LA SENDA PISADA del poblado a la puerta del templo: por aquí van los hijos a la escuela cada mañana
    tg.fillStyle = 'rgba(150,120,70,.20)';
    const rngS = mulberry32(4416);
    const pl = [[4.5, 7.75], [6.4, 8.15], [8.3, 8.45]];
    for (let i = 0; i < pl.length - 1; i++) {
      const pasos = Math.ceil(Math.hypot(pl[i + 1][0] - pl[i][0], pl[i + 1][1] - pl[i][1]) * 3.4);
      for (let k = 0; k <= pasos; k++) {
        const fx = pl[i][0] + (pl[i + 1][0] - pl[i][0]) * k / pasos + (rngS() - 0.5) * 0.3;
        const fy = pl[i][1] + (pl[i + 1][1] - pl[i][1]) * k / pasos + (rngS() - 0.5) * 0.3;
        const q = p2(fx, fy);
        tg.beginPath(); tg.ellipse(q.x, q.y, (5 + rngS() * 4) * zoom, (2.5 + rngS() * 2) * zoom, 0, 0, 7); tg.fill();
      }
    }
  }
  if (esEgipto) { // LAS ONDAS DEL VIENTO en la arena (2026-09-06): el desierto no es un damero liso, es piel rizada por el viento del norte
    const rngW = mulberry32(1550);
    tg.strokeStyle = 'rgba(160,128,72,.17)'; tg.lineWidth = 1 * zoom; tg.lineCap = 'round';
    for (let k = 0; k < 110; k++) {
      const wx = A0 + 0.2 + rngW() * (A1 - A0 + 0.6), wy = A0 + 0.2 + rngW() * (A1 - A0 + 0.6);
      if (distNilo(wx + 0.5, wy + 0.5) < NILO_VEGA + 0.2) continue;               // la vega no tiene dunas
      const q = p2(wx, wy), len = (8 + rngW() * 12) * zoom;
      tg.beginPath(); tg.moveTo(q.x - len, q.y);
      tg.quadraticCurveTo(q.x - len * 0.5, q.y - 2 * zoom, q.x, q.y);
      tg.quadraticCurveTo(q.x + len * 0.5, q.y + 2 * zoom, q.x + len, q.y); tg.stroke();
    }
  }
  if (esFogon && S && S.edad >= 2) { // la tierra arada: terrones sueltos, no tablones
    tg.fillStyle = 'rgba(120,92,54,.30)';
    const rngA = mulberry32(777);
    for (let k = 0; k < 6; k++) {
      const sy = 10.25 + k * 0.31;
      for (let m = 0; m < 14; m++) {
        const fx2 = 3.15 + m * 0.2 + (rngA() - 0.5) * 0.09, fy2 = sy + (rngA() - 0.5) * 0.07;
        const q = p2(fx2, fy2);
        tg.beginPath(); tg.ellipse(q.x, q.y, (2.2 + rngA() * 1.6) * zoom, (1.1 + rngA() * 0.8) * zoom, 0, 0, 7); tg.fill();
      }
    }
  }
  if (esFogon) { // la senda es apenas una huella pisada
    tg.fillStyle = 'rgba(146,116,74,.38)';
    for (const pl of [[[4, 16.5], [6, 13], [8, 10.2], [9.5, 8.7]], [[8, 10.2], [6.4, 9.4], [5.3, 9.9]]]) {
      for (let i = 0; i < pl.length - 1; i++) {
        const pasos = Math.ceil(Math.hypot(pl[i + 1][0] - pl[i][0], pl[i + 1][1] - pl[i][1]) * 3.2);
        for (let k = 0; k <= pasos; k++) {
          const fx = pl[i][0] + (pl[i + 1][0] - pl[i][0]) * k / pasos + (rng() - 0.5) * 0.4;
          const fy = pl[i][1] + (pl[i + 1][1] - pl[i][1]) * k / pasos + (rng() - 0.5) * 0.4;
          const q = p2(fx, fy);
          tg.beginPath(); tg.ellipse(q.x, q.y, (6 + rng() * 5) * zoom, (3 + rng() * 2.5) * zoom, 0, 0, 7); tg.fill();
        }
      }
    }
  }
  // era 3: el patio de juegos de la banda sur: la rayuela de tiza
  if (expandido) {
    tg.strokeStyle = 'rgba(250,246,232,.8)'; tg.lineWidth = 1.5 * zoom; tg.lineJoin = 'round';
    tg.fillStyle = 'rgba(250,246,232,.85)';
    for (let k = 0; k < 5; k++) {
      const cx = 6.0 + k * 0.52, cy = 18.5 - k * 0.06;
      const c0 = p2(cx, cy), c1 = p2(cx + 0.44, cy), c2 = p2(cx + 0.44, cy + 0.44), c3 = p2(cx, cy + 0.44);
      tg.beginPath(); tg.moveTo(c0.x, c0.y); tg.lineTo(c1.x, c1.y); tg.lineTo(c2.x, c2.y); tg.lineTo(c3.x, c3.y);
      tg.closePath(); tg.stroke();
      const cc = p2(cx + 0.22, cy + 0.22);
      tg.font = `${7 * zoom}px Georgia, serif`; tg.textAlign = 'center';
      tg.fillText(String(k + 1), cc.x, cc.y + 2 * zoom);
    }
  }
  tg.beginPath();
  const e0 = p2(E0, E0), e1 = p2(E1, E0), e2 = p2(E1, E1), e3 = p2(E0, E1);
  tg.moveTo(e0.x, e0.y); tg.lineTo(e1.x, e1.y); tg.lineTo(e2.x, e2.y); tg.lineTo(e3.x, e3.y);
  tg.closePath(); tg.strokeStyle = 'rgba(255,255,240,.16)'; tg.lineWidth = 1.6 * zoom; tg.stroke();

  // AGUA por época
  const RADS_LAGO = [1.0, 1.14, 0.92, 1.08, 0.86, 1.12, 0.95, 1.18, 0.9, 1.05];
  const pathLago = (cx, cy, k, dx, dy, z) => {
    const pts = RADS_LAGO.map((rr, i) => {
      const a = (i / RADS_LAGO.length) * Math.PI * 2;
      return p2(cx + dx + Math.cos(a) * 1.9 * rr * k, cy + dy + Math.sin(a) * 1.5 * rr * k, z);
    });
    tg.beginPath();
    tg.moveTo((pts[pts.length - 1].x + pts[0].x) / 2, (pts[pts.length - 1].y + pts[0].y) / 2);
    for (let i = 0; i < pts.length; i++) {
      const n = pts[(i + 1) % pts.length];
      tg.quadraticCurveTo(pts[i].x, pts[i].y, (pts[i].x + n.x) / 2, (pts[i].y + n.y) / 2);
    }
    tg.closePath();
  };
  const juncos = (lista) => {
    for (const [jx, jy] of lista) {
      const q = p2(jx, jy);
      tg.strokeStyle = '#7d8b4a'; tg.lineWidth = 1.3 * zoom; tg.lineCap = 'round';
      for (let k = -2; k <= 2; k++) {
        tg.beginPath(); tg.moveTo(q.x + k * 2.2 * zoom, q.y);
        tg.lineTo(q.x + k * 2.9 * zoom, q.y - (11 - Math.abs(k) * 2.2) * zoom); tg.stroke();
      }
      tg.fillStyle = '#8a6f4d';
      tg.fillRect(q.x - 3.4 * zoom, q.y - 10.5 * zoom, 1.9 * zoom, 4.2 * zoom);
      tg.fillRect(q.x + 1.6 * zoom, q.y - 9.5 * zoom, 1.9 * zoom, 4.2 * zoom);
    }
  };
  if (esEgipto) {
    /* EL NILO, REHECHO (2026-08-24, primera pasada del ojo del jugador sobre Egipto: «tenemos un río
       que vuela y que cuando crece o se achica apenas se nota»). Tres arreglos en el mismo sitio:
       · RECORTE AL DIAMANTE: las bandas se pintaban sin clip y el agua colgaba fuera del bloque por
         las dos puntas, flotando sobre el cielo. El río de Sumer tuvo el mismo defecto en su primera
         pasada y se cura igual (save → clip al diamante → restore).
       · EL CAUCE SE HUNDE: las cinco bandas iban TODAS a z = -8, o sea la misma lámina plana bajada en
         bloque, que es exactamente como se lee una alfombra puesta encima del suelo. Ahora bajan por
         pasos (-1 la huella, -3 el barro, -6 el agua, -7 lo hondo): el agua queda DENTRO de su cauce.
       · EL AÑO SE VE: la huella de la crecida queda marcada en el limo (fija: es hasta donde llegó el
         agua de ajet), y al retirarse el río la va dejando al descubierto. Cambian a la vez el ancho
         del agua, la franja de barro que aparece y el color de las tres: no solo medio tile de banda. */
    const dx = NIB.x - NIA.x, dy = NIB.y - NIA.y, len = Math.hypot(dx, dy);
    const nx = -dy / len, ny = dx / len, N = 26;
    const eje = tt => ({ x: NIA.x + dx * tt + Math.sin(tt * 6.5) * 0.3, y: NIA.y + dy * tt + Math.cos(tt * 5) * 0.22 });
    const banda = (w, z) => {
      const L = [], R = [];
      for (let i = 0; i <= N; i++) { const m = eje(i / N);
        L.push(p2(m.x + nx * w, m.y + ny * w, z)); R.push(p2(m.x - nx * w, m.y - ny * w, z)); }
      tg.beginPath(); tg.moveTo(L[0].x, L[0].y);
      for (const p of L) tg.lineTo(p.x, p.y);
      for (let i = R.length - 1; i >= 0; i--) tg.lineTo(R[i].x, R[i].y);
      tg.closePath();
    };
    tg.save();
    tg.beginPath();
    const nA = p2(A0, A0), nB = p2(A1 + 1, A0), nC = p2(A1 + 1, A1 + 1), nD = p2(A0, A1 + 1);
    tg.moveTo(nA.x, nA.y); tg.lineTo(nB.x, nB.y); tg.lineTo(nC.x, nC.y); tg.lineTo(nD.x, nD.y); tg.closePath();
    tg.clip();
    const colE = (k2, fb) => colorEstacion(k2) || fb;
    banda(NILO_HUELLA, -1); tg.fillStyle = colE('ribera', '#c9b483'); tg.fill();          // la huella de la crecida: hasta aquí llegó el agua de ajet
    banda(NILO_AGUA + 0.45, -3); tg.fillStyle = colE('humedo', '#9c9260'); tg.fill();     // el barro que el río acaba de destapar (kemet, la tierra negra)
    banda(NILO_AGUA, -6); tg.fillStyle = colE('aguaBaja', '#5f9ab4'); tg.fill();          // el agua baja de la orilla
    banda(NILO_AGUA * 0.74, -6); tg.fillStyle = colE('cauce', '#4a86a8'); tg.fill();      // el cauce
    banda(NILO_AGUA * 0.42, -7); tg.fillStyle = colE('hondo', '#3d7796'); tg.fill();      // lo hondo, por donde va la falúa
    /* LOS REFLEJOS VAN CON LA CORRIENTE (2026-09-06, jugando de cerca): eran rayas de orilla a
       orilla cada tres tramos, y con la cámara encima se leían como las juntas de una alfombra de
       vidrio. El sol sobre un río se ve en hebras A LO LARGO del agua: cortas, desiguales, más
       claras hacia el centro del cauce. Deterministas: mismo río en cada repintado. */
    const rngN = mulberry32(3150);
    tg.lineCap = 'round';
    for (let i = 0; i < 24; i++) {
      const u0 = 0.04 + rngN() * 0.9, du = 0.012 + rngN() * 0.03, perp = (rngN() - 0.5) * NILO_AGUA * 1.2;
      const m0 = eje(u0), m1 = eje(Math.min(1, u0 + du));
      const a = p2(m0.x + nx * perp, m0.y + ny * perp, -6), b = p2(m1.x + nx * perp, m1.y + ny * perp, -6);
      tg.strokeStyle = `rgba(240,250,255,${(0.14 + 0.22 * (1 - Math.abs(perp) / NILO_AGUA)).toFixed(2)})`;
      tg.lineWidth = (0.8 + rngN() * 0.8) * zoom;
      tg.beginPath(); tg.moveTo(a.x, a.y); tg.lineTo(b.x, b.y); tg.stroke();
    }
    tg.restore();
    juncos([[16.9, 10.0], [15.6, 12.2], [11.1, 13.9], [9.8, 15.3]]); // dos por orilla: los del oeste estaban a 0,6 del eje, o sea en mitad del cauce
  } else if (esAgora) {
    /* EL ILISOS: el arroyo de Atenas, chico y frío, por la esquina sureste. Misma maquinaria del Nilo (bandas
       escalonadas, recorte al diamante, meandro, reflejos con la corriente), a la escala de un arroyo. */
    const dx = ILISOS.bx - ILISOS.ax, dy = ILISOS.by - ILISOS.ay, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len, N = 22;
    const eje = tt => ejeIlisos(tt);
    const banda = (w, z) => { const L = [], R = [];
      for (let i = 0; i <= N; i++) { const m = eje(i / N); L.push(p2(m.x + nx * w, m.y + ny * w, z)); R.push(p2(m.x - nx * w, m.y - ny * w, z)); }
      tg.beginPath(); tg.moveTo(L[0].x, L[0].y); for (const p of L) tg.lineTo(p.x, p.y); for (let i = R.length - 1; i >= 0; i--) tg.lineTo(R[i].x, R[i].y); tg.closePath(); };
    tg.save(); tg.beginPath();
    const nA = p2(A0, A0), nB = p2(A1 + 1, A0), nC = p2(A1 + 1, A1 + 1), nD = p2(A0, A1 + 1);
    tg.moveTo(nA.x, nA.y); tg.lineTo(nB.x, nB.y); tg.lineTo(nC.x, nC.y); tg.lineTo(nD.x, nD.y); tg.closePath(); tg.clip();
    const AG = ilisosAgua();
    banda(AG + 0.5, -2); tg.fillStyle = colorEstacion('humedo'); tg.fill();       // la orilla de cantos y barro
    banda(AG, -5); tg.fillStyle = colorEstacion('aguaBaja'); tg.fill();
    banda(AG * 0.7, -5); tg.fillStyle = colorEstacion('cauce'); tg.fill();
    banda(AG * 0.38, -6); tg.fillStyle = colorEstacion('hondo'); tg.fill();
    const rngI = mulberry32(2470); tg.lineCap = 'round';
    for (let i = 0; i < 16; i++) { const u0 = 0.04 + rngI() * 0.9, du = 0.015 + rngI() * 0.03, perp = (rngI() - 0.5) * AG * 1.2;
      const m0 = eje(u0), m1 = eje(Math.min(1, u0 + du)), a = p2(m0.x + nx * perp, m0.y + ny * perp, -5), b = p2(m1.x + nx * perp, m1.y + ny * perp, -5);
      tg.strokeStyle = `rgba(240,250,255,${(0.14 + 0.22 * (1 - Math.abs(perp) / AG)).toFixed(2)})`; tg.lineWidth = (0.7 + rngI() * 0.7) * zoom;
      tg.beginPath(); tg.moveTo(a.x, a.y); tg.lineTo(b.x, b.y); tg.stroke(); }
    for (let i = 0; i < 14; i++) { const u = 0.05 + rngI() * 0.9, lado = rngI() < 0.5 ? 1 : -1, m = eje(u), q = p2(m.x + nx * (AG + 0.15 + rngI() * 0.25) * lado, m.y + ny * (AG + 0.15 + rngI() * 0.25) * lado, -2);
      tg.beginPath(); tg.ellipse(q.x, q.y, (2 + rngI() * 2) * zoom, (1.2 + rngI() * 1.2) * zoom, 0, 0, 7); tg.fillStyle = rngI() < 0.5 ? '#a9a496' : '#8f8a7c'; tg.fill(); } // los cantos rodados de la orilla
    tg.restore();
    juncos([[16.6, 11.0], [13.6, 15.5], [11.9, 17.2], [15.2, 12.6]]);
  } else if (esSumer) {
    /* EL RÍO (2026-08-01): antes había un estanque y tres trazos de canal tan finos que se leían como
       lápiz. Ahora el agua es la protagonista que la ciudad merece: una banda ancha por la esquina
       sureste (geometría compartida en RIO_SUMER, 11-materiales: la querencia del barro y el spawn la
       usan), con su ribera de barro húmedo, sus reflejos y los canales saliendo DEL río a las parcelas,
       que es la razón de que Sumer exista. */
    const dxR = RIO_SUMER.bx - RIO_SUMER.ax, dyR = RIO_SUMER.by - RIO_SUMER.ay;
    const LR = Math.hypot(dxR, dyR), nxR = -dyR / LR, nyR = dxR / LR, NR = 30;
    const wob = tt => Math.sin(tt * 7.3 + 0.6) * 0.3; // el MEANDRO: un río, no una zanja
    const bandaR = (w, z) => {
      tg.beginPath();
      for (let i = 0; i <= NR; i++) { const tt = i / NR, o = wob(tt) + w * 0.5, q = p2(RIO_SUMER.ax + dxR * tt + nxR * o, RIO_SUMER.ay + dyR * tt + nyR * o, z); i ? tg.lineTo(q.x, q.y) : tg.moveTo(q.x, q.y); }
      for (let i = NR; i >= 0; i--) { const tt = i / NR, o = wob(tt) - w * 0.5, q = p2(RIO_SUMER.ax + dxR * tt + nxR * o, RIO_SUMER.ay + dyR * tt + nyR * o, z); tg.lineTo(q.x, q.y); }
      tg.closePath();
    };
    // el agua se RECORTA al diamante del suelo: sin esto, la banda pintaba encima de las caras del
    // bloque y el río parecía colgar del acantilado (visto en la primera pasada)
    tg.save();
    tg.beginPath();
    const dA = p2(A0, A0), dB = p2(A1 + 1, A0), dC = p2(A1 + 1, A1 + 1), dD = p2(A0, A1 + 1);
    tg.moveTo(dA.x, dA.y); tg.lineTo(dB.x, dB.y); tg.lineTo(dC.x, dC.y); tg.lineTo(dD.x, dD.y); tg.closePath();
    tg.clip();
    const canal = (x0, y0, x1, y1) => { // los canales con cuerpo: cauce de barro, agua y su brillo
      const a = p2(x0, y0, -3), b = p2(x1, y1, -3); tg.lineCap = 'round';
      tg.strokeStyle = '#ad9c60'; tg.lineWidth = 8.4 * zoom; tg.beginPath(); tg.moveTo(a.x, a.y); tg.lineTo(b.x, b.y); tg.stroke();
      tg.strokeStyle = '#6f9fb0'; tg.lineWidth = 4.8 * zoom; tg.beginPath(); tg.moveTo(a.x, a.y); tg.lineTo(b.x, b.y); tg.stroke();
      tg.strokeStyle = '#558aa2'; tg.lineWidth = 2.4 * zoom; tg.beginPath(); tg.moveTo(a.x, a.y); tg.lineTo(b.x, b.y); tg.stroke();
      tg.strokeStyle = 'rgba(240,250,255,.3)'; tg.lineWidth = 0.9 * zoom; tg.beginPath(); tg.moveTo(a.x, a.y); tg.lineTo(b.x, b.y); tg.stroke();
    };
    canal(5.6, 11.5, 15.8, 10.6);   // el canal madre, que BEBE del río
    canal(9.0, 11.15, 9.6, 16.4);   // ramal a las parcelas del sur, que vuelve al río
    canal(12.6, 10.85, 13.1, 13.9); // ramal corto, hasta la orilla
    const cre = crecidaHoy(); // el año del río: la crecida lo ensancha, la siembra lo baja
    bandaR(2.6, -2); tg.fillStyle = colorEstacion('ribera'); tg.fill();        // la ribera de barro pisado
    bandaR(2.2, -4); tg.fillStyle = colorEstacion('humedo'); tg.fill();        // el barro húmedo, verdoso de limo
    bandaR(1.85 * cre, -6); tg.fillStyle = colorEstacion('aguaBaja'); tg.fill(); // agua baja
    bandaR(1.45 * cre, -6); tg.fillStyle = colorEstacion('cauce'); tg.fill();  // el cauce
    bandaR(1.0 * cre, -6); tg.fillStyle = colorEstacion('hondo'); tg.fill();   // lo hondo
    // los reflejos del sol van CON la corriente (2026-09-06; eran rayas de orilla a orilla, como juntas de vidrio)
    const rngR = mulberry32(2026);
    tg.lineCap = 'round';
    for (let i = 0; i < 22; i++) {
      const t0 = 0.04 + rngR() * 0.9, dt0 = 0.012 + rngR() * 0.03, perp = (rngR() - 0.5) * 1.6 * cre;
      const q0 = p2(RIO_SUMER.ax + dxR * t0 + nxR * (wob(t0) + perp), RIO_SUMER.ay + dyR * t0 + nyR * (wob(t0) + perp), -6);
      const t1 = Math.min(1, t0 + dt0);
      const q1 = p2(RIO_SUMER.ax + dxR * t1 + nxR * (wob(t1) + perp), RIO_SUMER.ay + dyR * t1 + nyR * (wob(t1) + perp), -6);
      tg.strokeStyle = `rgba(240,250,255,${(0.14 + 0.22 * (1 - Math.abs(perp) / (0.9 * cre))).toFixed(2)})`;
      tg.lineWidth = (0.8 + rngR() * 0.8) * zoom;
      tg.beginPath(); tg.moveTo(q0.x, q0.y); tg.lineTo(q1.x, q1.y); tg.stroke();
    }
    tg.restore(); // fin del recorte al diamante
    juncos([[16.6, 10.9], [15.2, 12.9], [13.4, 13.5], [11.4, 16.2], [14.5, 10.7], [10.7, 14.9]]);
  } else if (esFogon) {
    pathLago(14.9, 14.5, 0.8, -0.02, -0.02, -8); tg.fillStyle = PAL.aguaOrilla; tg.fill();
    pathLago(14.9, 14.5, 0.76, 0.07, 0.07, -8); tg.fillStyle = '#87b0bc'; tg.fill();
    // la laguna VIVA: reflejos de sol, piedras en la orilla y más juncos (era una mancha muda)
    tg.strokeStyle = 'rgba(240,250,255,.4)'; tg.lineWidth = 1.1 * zoom; tg.lineCap = 'round';
    for (const [gx, gy, gl] of [[14.2, 14.3, 0.5], [15.4, 14.9, 0.7], [14.8, 15.3, 0.4], [15.8, 14.1, 0.45]]) {
      const ga = p2(gx, gy, -8), gb = p2(gx + gl, gy - gl * 0.4, -8);
      tg.beginPath(); tg.moveTo(ga.x, ga.y); tg.lineTo(gb.x, gb.y); tg.stroke();
    }
    for (const [rx2, ry2, rs] of [[12.95, 13.25, 1], [16.9, 15.9, 0.85], [16.7, 12.9, 0.7]]) {
      const q = p2(rx2, ry2);
      tg.beginPath(); tg.ellipse(q.x, q.y, 3.2 * rs * zoom, 2.1 * rs * zoom, 0, 0, 7); tg.fillStyle = '#9b968a'; tg.fill();
      tg.beginPath(); tg.ellipse(q.x - 0.8 * rs * zoom, q.y - 0.8 * rs * zoom, 1.7 * rs * zoom, 1.1 * rs * zoom, 0, 0, 7); tg.fillStyle = '#b3ae9f'; tg.fill();
    }
    juncos([[13.3, 15.5], [16.5, 14.0], [13.45, 13.25], [15.7, 16.1], [16.75, 15.35], [12.95, 14.7]]);
  } else {
    pathLago(14.9, 14.5, 1.0, 0, 0, 0); tg.fillStyle = PAL.bordeLaguna; tg.fill();
    pathLago(14.9, 14.5, 0.8, -0.02, -0.02, -8); tg.fillStyle = PAL.aguaOrilla; tg.fill();
    pathLago(14.9, 14.5, 0.76, 0.07, 0.07, -8); tg.fillStyle = PAL.agua; tg.fill();
    pathLago(14.9, 14.5, 1.0, 0, 0, 0); tg.strokeStyle = 'rgba(246,238,216,.45)'; tg.lineWidth = 1.4 * zoom; tg.stroke();
  }

  // piedritas del sendero
  for (const key of pathTiles) {
    const [tx, ty] = key.split(',').map(Number);
    if (tx < A0 || tx > A1 || ty < A0 || ty > A1) continue;
    for (let i = 0; i < 3; i++) {
      const p = p2(tx + rng(), ty + rng());
      tg.beginPath(); tg.ellipse(p.x, p.y, 1.6 * zoom, 1.0 * zoom, 0, 0, 7);
      tg.fillStyle = cPunto; tg.fill();
    }
  }

  // huerto (la agricultura llega con la escuela moderna del juego)
  if (!S || ordEra(S.era) >= 11) {
    tpoly([p2(11.6, 8.6), p2(14.8, 8.6), p2(14.8, 10.8), p2(11.6, 10.8)], PAL.huerto);
    tg.strokeStyle = PAL.surco; tg.lineWidth = 2.2 * zoom; tg.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const yy = 9.05 + i * 0.62;
      const a = p2(11.85, yy), b = p2(14.55, yy);
      tg.beginPath(); tg.moveTo(a.x, a.y); tg.lineTo(b.x, b.y); tg.stroke();
    }
  }

  if (esFogon) { // MANCHAS DE PRADERA: rompen el damero (la estepa se leía de tablero, no de pasto vivo)
    for (let i = 0; i < 14; i++) {
      const x = A0 + 1 + rng() * (A1 - A0 - 1), y = A0 + 1 + rng() * (A1 - A0 - 1);
      if (isClear(x, y) || sobreElLago(x, y)) continue;
      const p = p2(x, y);
      tg.save(); tg.globalAlpha = 0.08 + rng() * 0.08; tg.fillStyle = '#55772f';
      tg.beginPath(); tg.ellipse(p.x, p.y, (26 + rng() * 30) * zoom, (12 + rng() * 14) * zoom, 0, 0, 7); tg.fill();
      tg.restore();
    }
  }
  // matas y flores (y en la estepa, también piedritas)
  for (let i = 0; i < (expandido ? 210 : esFogon ? 260 : 150); i++) {
    const x = A0 + rng() * (A1 - A0 + 1), y = A0 + rng() * (A1 - A0 + 1);
    if (isPath(Math.floor(x), Math.floor(y)) || isClear(x, y)) continue;
    if (esEgipto && distNilo(x, y) > 2.1) continue; // el desierto no tiene matas
    const p = p2(x, y);
    const dado = rng();
    if (esFogon && dado > 0.82) { // las piedritas de la estepa: la textura que le faltaba al suelo
      for (let k = 0; k < 2 + Math.floor(rng() * 2); k++) {
        const px3 = p.x + (rng() - 0.5) * 8 * zoom, py3 = p.y + (rng() - 0.5) * 4.5 * zoom;
        tg.beginPath(); tg.ellipse(px3, py3, (1.5 + rng() * 1.4) * zoom, (1 + rng()) * zoom, 0, 0, 7);
        tg.fillStyle = ['#a8a396', '#9b968a', '#b3ae9f'][Math.floor(rng() * 3)]; tg.fill();
      }
      continue;
    }
    if (dado < (antiguo ? (esFogon ? 0.62 : 0.85) : 0.68)) {
      tg.strokeStyle = esFogon ? colorEstacion('mata') : esSumer ? '#8f9a4e' : esEgipto ? '#8fa63a' : PAL.tufo; tg.lineWidth = 1.3 * zoom; tg.lineCap = 'round';
      for (let b = -1; b <= 1; b++) {
        tg.beginPath(); tg.moveTo(p.x + b * 2 * zoom, p.y);
        tg.lineTo(p.x + b * 3.4 * zoom, p.y - (4.5 - Math.abs(b)) * zoom); tg.stroke();
      }
    } else {
      tg.strokeStyle = PAL.florTallo; tg.lineWidth = 1.1 * zoom;
      tg.beginPath(); tg.moveTo(p.x, p.y); tg.lineTo(p.x, p.y - 4 * zoom); tg.stroke();
      const col = ['#f6f1e3', '#f2d16b', '#e8a7b4'][Math.floor(rng() * 3)];
      for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 2 + 0.4;
        tg.beginPath();
        tg.arc(p.x + Math.cos(a) * 2.2 * zoom, p.y - 4 * zoom + Math.sin(a) * 2.2 * zoom, 1.5 * zoom, 0, 7);
        tg.fillStyle = col; tg.fill();
      }
      tg.beginPath(); tg.arc(p.x, p.y - 4 * zoom, 1.2 * zoom, 0, 7); tg.fillStyle = '#c98a2e'; tg.fill();
    }
  }
}

/* ============================================================
   PROPS FIJOS (paisaje), de F1
   ============================================================ */
