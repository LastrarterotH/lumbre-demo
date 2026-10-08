/* ============================================================
   06-gente
   Cómo se dibuja la gente: aprendices, guías, pensadores, bustos y los pájaros del patio.
   ============================================================ */
function drawAlumno(px, py, dir, cycle, variant) {
  const bob = Math.abs(Math.sin(cycle)) * 1.6 * zoom;
  const resp = Math.sin(tFrame * 1.15 + variant * 2.3) * 0.4 * zoom; // la respiración: invisible al andar, vida al estar quieto
  ellipse({ x: px, y: py }, 7 * zoom, 3.2 * zoom, sombraHoy);
  g.save(); g.translate(px, py - bob - resp); if (dir < 0) g.scale(-1, 1);
  const s = zoom;
  // la piel del valle (cuarta tanda de Egipto: «les falta vestimenta como si fueran egipcios»):
  // cobriza, como los egipcios se pintaban a sí mismos; el resto de épocas sigue con PAL.piel
  const piel = S.era === 3 ? '#cf9668' : PAL.piel;
  const sw = Math.sin(cycle) * 3.4 * s;
  g.strokeStyle = '#5e4128'; g.lineCap = 'round'; g.lineWidth = 2.4 * s;
  g.beginPath(); g.moveTo(-1.5 * s, -8 * s); g.lineTo(-1.5 * s + sw, -0.5 * s); g.stroke();
  g.beginPath(); g.moveTo(1.5 * s, -8 * s); g.lineTo(1.5 * s - sw, -0.5 * s); g.stroke();
  g.beginPath();
  g.moveTo(-5 * s, -8 * s);
  g.quadraticCurveTo(-6 * s, -17 * s, 0, -18 * s);
  g.quadraticCurveTo(6 * s, -17 * s, 5 * s, -8 * s);
  g.closePath(); g.fillStyle = S.era === 1 || S.era === 3 ? piel : S.era === 2 ? '#e8dcc8' : S.era === 4 ? '#f4efe2' : PAL.delantal; g.fill(); // torso desnudo, túnica de lana, quitón blanco o guardapolvo
  g.fillStyle = PAL.delantalSombra;
  g.beginPath(); g.moveTo(2 * s, -18 * s); g.quadraticCurveTo(6 * s, -16 * s, 5 * s, -8 * s);
  g.lineTo(2 * s, -8 * s); g.closePath(); g.fill();       // lado en sombra
  if (ordEra(S.era) >= 11) {
    dot({ x: 0, y: -15.5 * s }, 0.9 * s, '#8a6f4d'); dot({ x: 0, y: -12.5 * s }, 0.9 * s, '#8a6f4d'); // botones
  } else if (S.era === 1) { // el taparrabos con flecos
    g.fillStyle = '#8a6247';
    g.fillRect(-5.2 * s, -11.6 * s, 10.4 * s, 3.6 * s);
    for (let f = -2; f <= 2; f++) {
      g.beginPath(); g.moveTo(f * 2.2 * s - 0.8 * s, -8 * s); g.lineTo(f * 2.2 * s, -6 * s);
      g.lineTo(f * 2.2 * s + 0.8 * s, -8 * s); g.closePath(); g.fill();
    }
  } else if (S.era === 3) { // el faldellín blanco
    g.fillStyle = '#f2ead2';
    g.fillRect(-5.2 * s, -11.8 * s, 10.4 * s, 4.2 * s);
    g.strokeStyle = '#d8cba8'; g.lineWidth = 0.8 * s;
    g.beginPath(); g.moveTo(-5.2 * s, -9.6 * s); g.lineTo(5.2 * s, -9.6 * s); g.stroke();
  } else if (S.era === 4) { // el cinto del quitón corto, y la orla de color del borde
    g.strokeStyle = '#b08a55'; g.lineWidth = 1.1 * s; g.beginPath(); g.moveTo(-5 * s, -12.4 * s); g.lineTo(5 * s, -12.4 * s); g.stroke();
    g.strokeStyle = variant % 2 ? '#3f7fb5' : '#a24e30'; g.lineWidth = 1.0 * s; g.beginPath(); g.moveTo(-5 * s, -8.6 * s); g.lineTo(5 * s, -8.6 * s); g.stroke();
  } else { // la faja de la túnica
    g.fillStyle = '#b08a55';
    g.fillRect(-5.2 * s, -11.4 * s, 10.4 * s, 2.2 * s);
  }
  g.strokeStyle = S.era === 1 || S.era === 3 ? piel : S.era === 2 ? '#e8dcc8' : S.era === 4 ? '#f4efe2' : PAL.delantal; g.lineWidth = 2.6 * s;
  g.beginPath(); g.moveTo(-4.4 * s, -15 * s); g.lineTo(-5 * s - sw * .5, -9 * s); g.stroke();
  if (ordEra(S.era) >= 11) { // los libritos llegan con la escuela
    g.fillStyle = '#b06a4a'; g.fillRect(3 * s, -12.5 * s, 5.5 * s, 2.4 * s);
    g.fillStyle = '#5f7488'; g.fillRect(3.4 * s, -14.6 * s, 5.5 * s, 2.1 * s);
  } else if (S.era === 3) { // el rollo de papiro bajo el brazo
    g.fillStyle = '#e8d9a8'; g.fillRect(2.6 * s, -13 * s, 6 * s, 2.6 * s);
    ellipse({ x: 8.6 * s, y: -11.7 * s }, 0.9 * s, 1.3 * s, '#c9b878');
  } else if (S.era === 4) { // la tablilla de cera bajo el brazo, con su estilo
    g.fillStyle = '#8a6a4a'; g.fillRect(2.6 * s, -13.4 * s, 5.6 * s, 3.4 * s); g.fillStyle = '#3f3a32'; g.fillRect(3.2 * s, -12.8 * s, 4.4 * s, 2.2 * s);
    line({ x: 8 * s, y: -14.6 * s }, { x: 9 * s, y: -10.8 * s }, '#d9d2c4', 0.8 * s);
  } else if (S.era === 2) { // la tablilla bajo el brazo
    g.fillStyle = '#c9a875'; g.fillRect(3 * s, -13 * s, 5 * s, 3.4 * s);
    g.strokeStyle = '#8a6a4a'; g.lineWidth = 0.5 * s;
    g.beginPath(); g.moveTo(3.8 * s, -11.8 * s); g.lineTo(7.2 * s, -11.8 * s); g.stroke();
  }
  if (S.era === 3) { // el collar usej sobre el pecho: la prenda que dice Egipto a un vistazo
    g.strokeStyle = '#2f97d8'; g.lineWidth = 1.1 * s;
    g.beginPath(); g.arc(0, -16.6 * s, 4.4 * s, 0.3, Math.PI - 0.3); g.stroke();
    g.strokeStyle = '#e8a51e'; g.lineWidth = 0.9 * s;
    g.beginPath(); g.arc(0, -16.6 * s, 3.1 * s, 0.35, Math.PI - 0.35); g.stroke();
  }
  dot({ x: 0, y: -23 * s }, 6.4 * s, piel);
  const ap = apertura(variant * 2.1 + (dir > 0 ? 0.9 : 0)); // ambos ojos del mismo rostro cierran juntos
  ojo(2.6 * s, -23.5 * s, 0.9 * s, ap); ojo(5.2 * s, -23.5 * s, 0.9 * s, ap);
  dot({ x: 4 * s, y: -21.4 * s }, 1.3 * s, 'rgba(226,123,90,.35)');
  const v = variant % 3;
  if (S.era === 4) { // el pelo corto ateniense, castaño o rubio, con la cinta del atleta en uno de cada tres
    g.fillStyle = v === 1 ? '#8a5a2e' : '#5a4632';
    g.beginPath(); g.arc(0, -24.2 * s, 6.4 * s, Math.PI * .95, Math.PI * 2.05); g.fill();
    if (v === 2) { g.strokeStyle = '#c94f43'; g.lineWidth = 1.1 * s; g.beginPath(); g.moveTo(-6.2 * s, -25 * s); g.lineTo(6.2 * s, -25 * s); g.stroke(); }
  } else if (S.era === 3) { // peinados del Nilo: rapado, peluca o la trenza de la juventud
    g.fillStyle = '#1c1a18';
    if (v === 1) { // la peluca de corte recto (el flequillo de la hoja de bocetos se probó y se retiró: «parece que tuvieran visores en los ojos», 2026-09-06)
      g.beginPath(); g.arc(0, -24 * s, 6.4 * s, Math.PI * .92, Math.PI * 2.08); g.fill();
      g.fillRect(-6.4 * s, -24 * s, 12.8 * s, 2.8 * s);
    } else if (v === 2) { // LA TRENZA DE LA JUVENTUD, hacia ATRÁS (2026-09-06: salía hacia arriba por delante, «como un martillo pegado en la frente»): nace en la coronilla, cae por la nuca y remata en un rizo
      g.beginPath(); g.arc(0, -25.4 * s, 6.3 * s, Math.PI * 1.05, Math.PI * 1.95); g.fill();       // el casquete corto del cráneo rapado
      g.strokeStyle = '#1c1a18'; g.lineWidth = 2.2 * s; g.lineCap = 'round';
      g.beginPath(); g.moveTo(-3.2 * s, -28.6 * s); g.quadraticCurveTo(-7.8 * s, -27 * s, -7.6 * s, -21 * s); g.quadraticCurveTo(-7.5 * s, -17.6 * s, -5.6 * s, -16.4 * s); g.stroke();
      dot({ x: -5.2 * s, y: -16.2 * s }, 1.6 * s, '#1c1a18');
    } // v0: la cabeza rapada, lista para el sol
  } else if (S.era === 2) { // los peinados de la edubba: negro liso, trenza o novicio rapado
    g.fillStyle = '#2e2a26';
    if (v === 0) {
      g.beginPath(); g.arc(0, -24.4 * s, 6.3 * s, Math.PI * .95, Math.PI * 2.05); g.fill();
    } else if (v === 1) {
      g.beginPath(); g.arc(0, -24.4 * s, 6.3 * s, Math.PI * .95, Math.PI * 2.05); g.fill();
      g.fillRect(3.8 * s, -22 * s, 2.4 * s, 8 * s); // la trenza
    } else { // el novicio rapado, con su vincha
      g.strokeStyle = '#b08a55'; g.lineWidth = 1.2 * s;
      g.beginPath(); g.moveTo(-6 * s, -25 * s); g.lineTo(6 * s, -25 * s); g.stroke();
    }
  } else if (ordEra(S.era) < 11) { // los peinados del clan
    g.fillStyle = '#3a2c1c';
    if (v === 0) { // greñas en punta
      g.beginPath(); g.arc(0, -24.6 * s, 6.4 * s, Math.PI * .9, Math.PI * 2.02); g.fill();
      for (let k = -2; k <= 2; k++) {
        g.beginPath(); g.moveTo(k * 2.4 * s - 1 * s, -28.4 * s); g.lineTo(k * 2.4 * s, -32.5 * s);
        g.lineTo(k * 2.4 * s + 1 * s, -28.2 * s); g.closePath(); g.fill();
      }
    } else if (v === 1) { // melena con vincha
      g.beginPath(); g.arc(0, -24 * s, 6.5 * s, Math.PI * .95, Math.PI * 2.05); g.fill();
      g.fillRect(-6.4 * s, -21 * s, 2.6 * s, 7 * s); g.fillRect(3.8 * s, -21 * s, 2.6 * s, 7 * s);
      g.strokeStyle = '#8a6247'; g.lineWidth = 1.1 * s;
      g.beginPath(); g.moveTo(-6 * s, -25.3 * s); g.lineTo(6 * s, -25.3 * s); g.stroke();
    } else { // revuelto con plumita
      g.beginPath(); g.arc(0, -24.6 * s, 6.4 * s, Math.PI * .9, Math.PI * 2.02); g.fill();
      g.strokeStyle = '#e8e4da'; g.lineWidth = 1.2 * s;
      g.beginPath(); g.moveTo(4.5 * s, -28 * s); g.lineTo(7 * s, -33 * s); g.stroke();
    }
  } else if (v === 0) {
    g.beginPath(); g.arc(0, -25.5 * s, 6.2 * s, Math.PI, 0); g.fillStyle = '#8a5a45'; g.fill();
    ellipse({ x: 2.4 * s, y: -25.3 * s }, 5.2 * s, 1.7 * s, '#6e4433');
  } else if (v === 1) {
    g.beginPath(); g.arc(0, -24.4 * s, 6.3 * s, Math.PI * .95, Math.PI * 2.05); g.fillStyle = '#4a3220'; g.fill();
    dot({ x: -6.4 * s, y: -26 * s }, 2.6 * s, '#4a3220'); dot({ x: 6.4 * s, y: -26 * s }, 2.6 * s, '#4a3220');
    dot({ x: -6.4 * s, y: -26 * s }, 1.2 * s, '#c94f43'); dot({ x: 6.4 * s, y: -26 * s }, 1.2 * s, '#c94f43');
  } else {
    g.beginPath(); g.arc(0, -24.6 * s, 6.4 * s, Math.PI * .9, Math.PI * 2.02); g.fillStyle = '#2e2a26'; g.fill();
  }
  g.restore();
}
const PUESTO_DOC0 = () => S.era === 2 ? [7.7, 8.3] : S.era === 4 ? [8.35, 7.35] : [5.5, 8.62]; // en Atenas, el grammatistes al pie de la stoa, junto a su banco // el padre, JUNTO a su casa pero FUERA de la huella (8-11,5-8): en (8.2,7.6) quedaba flotando sobre la obra (visto jugando 2026-08-05)
function drawDocente(t) { // la Sra. Rosa junto a la pizarra; el padre de la edubba, en su sala
  const pos = P(...PUESTO_DOC0());
  ellipse({ x: pos.x, y: pos.y }, 8 * zoom, 3.6 * zoom, sombraHoy);
  const s = zoom, sway = Math.sin(t * 1.1) * 1.1 * s;
  g.save(); g.translate(pos.x + sway, pos.y); g.scale(-1, 1);
  g.beginPath();
  g.moveTo(-6.5 * s, 0); g.quadraticCurveTo(-5 * s, -14 * s, 0, -15 * s);
  g.quadraticCurveTo(5 * s, -14 * s, 6.5 * s, 0); g.closePath();
  g.fillStyle = S.era === 1 ? '#8a6247' : S.era === 2 ? '#e0d4b8' : S.era === 3 ? '#f2ead2' : S.era === 4 ? '#f4efe2' : '#9a6b4f'; g.fill();
  if (S.era === 4) { g.strokeStyle = '#3f7fb5'; g.lineWidth = 1.2 * s; g.beginPath(); g.moveTo(-6.2 * s, -1 * s); g.lineTo(6.2 * s, -1 * s); g.stroke(); } // la orla azul del quitón
  if (ordEra(S.era) < 11) { // los flecos de la falda de piel
    g.fillStyle = '#75533c';
    for (let f = -2; f <= 2; f++) {
      g.beginPath(); g.moveTo(f * 2.4 * s - 1 * s, -0.5 * s); g.lineTo(f * 2.4 * s, 2.2 * s);
      g.lineTo(f * 2.4 * s + 1 * s, -0.5 * s); g.closePath(); g.fill();
    }
  }
  g.beginPath();
  g.moveTo(-4 * s, -14 * s); g.quadraticCurveTo(-4.6 * s, -21 * s, 0, -22 * s);
  g.quadraticCurveTo(4.6 * s, -21 * s, 4 * s, -14 * s); g.closePath();
  g.fillStyle = S.era === 1 ? PAL.piel : S.era === 4 ? '#f4efe2' : PAL.crema; g.fill();
  if (S.era === 4) { g.fillStyle = '#c9b48a'; g.beginPath(); g.moveTo(-4 * s, -21 * s); g.lineTo(2 * s, -19 * s); g.lineTo(4 * s, -14 * s); g.lineTo(-4 * s, -14 * s); g.closePath(); g.fill(); } // el himatión cruzado al hombro
  if (S.era === 1) { // la piel al hombro
    g.fillStyle = '#75624f';
    g.beginPath(); g.moveTo(-4 * s, -21 * s); g.lineTo(1.5 * s, -20 * s);
    g.lineTo(4 * s, -14 * s); g.lineTo(-4 * s, -14 * s); g.closePath(); g.fill();
  }
  if (ordEra(S.era) >= 11) dot({ x: 0, y: -19 * s }, 1.1 * s, '#c94f43');
  else if (S.era === 3) { // el collar usej
    g.strokeStyle = '#2f97d8'; g.lineWidth = 1.1 * s;
    g.beginPath(); g.arc(0, -18.6 * s, 4.2 * s, 0.25, Math.PI - 0.25); g.stroke();
    g.strokeStyle = '#e8a51e'; g.lineWidth = 0.9 * s;
    g.beginPath(); g.arc(0, -18.6 * s, 3 * s, 0.3, Math.PI - 0.3); g.stroke();
  }
  else if (S.era === 1) { // el collar de dientes
    g.fillStyle = '#efe8d4';
    for (let d2 = -1; d2 <= 1; d2++) {
      g.beginPath(); g.moveTo(d2 * 2 * s - 0.8 * s, -13.6 * s); g.lineTo(d2 * 2 * s, -11.8 * s);
      g.lineTo(d2 * 2 * s + 0.8 * s, -13.6 * s); g.closePath(); g.fill();
    }
  }
  const señala = ordEra(S.era) < 11 ? (S.tecs[10] && S.tecs[10].fase !== 'sin') : S.tecs[0].fase !== 'sin'; // la Mayor enseña desde que hay círculo; la Sra. Rosa, desde que hay pizarra
  const cyc = (t % 7) / 7;
  const raise = señala ? smooth((cyc - 0.15) / 0.12) * (1 - smooth((cyc - 0.55) / 0.14)) : 0;
  const ang = -0.35 - raise * 1.0;
  g.strokeStyle = PAL.crema; g.lineWidth = 2.6 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(3.4 * s, -19 * s);
  const hx = 3.4 * s + Math.cos(ang) * 8 * s, hy = -19 * s + Math.sin(ang) * 8 * s;
  g.lineTo(hx, hy); g.stroke();
  g.strokeStyle = '#8a6f4d'; g.lineWidth = 1.3 * s;
  g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + Math.cos(ang) * 9 * s, hy + Math.sin(ang) * 9 * s); g.stroke();
  const nod = Math.max(0, Math.sin(t * 0.7 + 1.5)) * 1.1 * s; // asiente mientras escucha al círculo
  g.save(); g.translate(0, nod);
  dot({ x: 0, y: -27 * s }, 6 * s, S.era === 3 ? '#cf9668' : PAL.piel);
  const cabello = S.era === 1 ? '#9a8d7a' : S.era === 2 ? '#2e2a26' : S.era === 3 ? '#1c1a18' : S.era === 4 ? '#5a4632' : '#6e5138'; // canas, melena, peluca o el castaño corto ateniense, según la época
  g.beginPath(); g.arc(0, -28.6 * s, 5.9 * s, Math.PI * .95, Math.PI * 2.05); g.fillStyle = cabello; g.fill();
  dot({ x: 0, y: -34.4 * s }, 2.8 * s, cabello);
  { const apD = apertura(3.3); ojo(2.4 * s, -27.4 * s, 0.9 * s, apD); ojo(4.9 * s, -27.4 * s, 0.9 * s, apD); } // LOS OJOS (2026-09-06: «el archivero no tiene ni cara»: solo los niños y los pensadores los tenían)
  g.restore(); g.save(); g.translate(0, nod);
  if (ordEra(S.era) >= 11) { // los lentes llegan con la modernidad
    g.strokeStyle = 'rgba(58,44,28,.85)'; g.lineWidth = 0.9 * s;
    g.beginPath(); g.arc(2.2 * s, -27.4 * s, 1.4 * s, 0, 7); g.stroke();
    g.beginPath(); g.arc(5.6 * s, -27.4 * s, 1.4 * s, 0, 7); g.stroke();
    g.beginPath(); g.moveTo(3.6 * s, -27.4 * s); g.lineTo(4.2 * s, -27.4 * s); g.stroke();
  }
  g.restore();
  g.restore();
}
const PUESTOS_DOCENTE = [[7.3, 11.6], [10.7, 10.9], [8.6, 13.2], [18.3, 8.4], [5.4, 17.5]]; // docentes contratados (Época 1 y modernas)
const PUESTOS_DOCENTE_SUMER = [[12.15, 8.35], [7.5, 6.5], [12.9, 5.9], [13.3, 8.9], [6.9, 9.9]]; // los escribas, en seco: los puestos viejos caían sobre los canales
// EGIPTO: los maestros de la Casa, repartidos por el patio y la vega alta. Con los puestos de la escuela
// moderna (los de arriba), uno quedaba DE PIE SOBRE EL NILO (2026-08-25, visto en la partida).
const PUESTOS_DOCENTE_EGIPTO = [[6.1, 7.1], [12.2, 5.9], [6.4, 10.2], [14.6, 6.4], [8.9, 11.4]];
const PUESTOS_DOCENTE_AGORA = [[12.2, 6.6], [13.9, 6.3], [11.3, 6.4], [6.4, 10.3], [12.6, 10.6]]; // Aspasia junto a la plaza, el paidotribes a la puerta de la palestra, el kitharistes al este de la stoa // el primero estaba en (7.0, 7.6): con los colosos a escala de coloso quedaba detrás de la cabeza del oeste (2026-09-06)
function drawDocenteExtra(x, y, variant, t) {
  const pos = P(x, y);
  ellipse({ x: pos.x, y: pos.y }, 8 * zoom, 3.6 * zoom, sombraHoy);
  const s = zoom, sway = Math.sin(t * 0.9 + variant * 2) * 0.7 * s;
  g.save(); g.translate(pos.x + sway, pos.y);
  if (variant % 2) g.scale(-1, 1);
  /* EGIPTO viste de Egipto (cuarta tanda 2026-08-31: los maestros de la Casa salían con las PIELES
     del clan paleolítico, porque el ternario solo distinguía era<11 de moderna): faldellín de lino
     blanco y torso cobrizo al sol, como en sus propias pinturas. */
  const colores = S.era === 3
    ? [['#f2ead2', '#cf9668'], ['#efe6cc', '#cf9668'], ['#f2ead2', '#cf9668']]
    : S.era === 4
    ? [['#f4efe2', '#e9e2d0'], ['#e3d8bf', '#f4efe2'], ['#f4efe2', '#d6c9a8']] // ATENAS: quitón e himatión de lana, blanco y crudo
    : ordEra(S.era) < 11
    ? [['#8a6247', PAL.piel], ['#75624f', PAL.piel], ['#8a7055', PAL.piel]]
    : [['#5f7488', PAL.crema], ['#7a6a50', '#e8dcc0'], ['#6e4433', PAL.crema]];
  const [abajo, arriba] = colores[variant % 3];
  g.beginPath();
  g.moveTo(-5.5 * s, 0); g.quadraticCurveTo(-4.6 * s, -13 * s, 0, -14 * s);
  g.quadraticCurveTo(4.6 * s, -13 * s, 5.5 * s, 0); g.closePath();
  g.fillStyle = abajo; g.fill();
  g.beginPath();
  g.moveTo(-3.8 * s, -13 * s); g.quadraticCurveTo(-4.4 * s, -20 * s, 0, -21 * s);
  g.quadraticCurveTo(4.4 * s, -20 * s, 3.8 * s, -13 * s); g.closePath();
  g.fillStyle = arriba; g.fill();
  if (ordEra(S.era) >= 11) { g.fillStyle = '#b06a4a'; g.fillRect(2.6 * s, -16 * s, 5 * s, 2.2 * s); } // el cuaderno llega con la escuela
  if (S.era === 3) { // el collar del maestro, discreto
    g.strokeStyle = '#2f97d8'; g.lineWidth = 1.0 * s;
    g.beginPath(); g.arc(0, -19.6 * s, 3.8 * s, 0.3, Math.PI - 0.3); g.stroke();
  }
  dot({ x: 0, y: -26 * s }, 5.8 * s, S.era === 3 ? '#cf9668' : PAL.piel);
  { const apD = apertura(variant * 1.9 + 1.1); ojo(2.3 * s, -26.4 * s, 0.85 * s, apD); ojo(4.7 * s, -26.4 * s, 0.85 * s, apD); } // los ojos de los maestros, con su parpadeo
  if (S.era === 4) { g.beginPath(); g.arc(0, -27.4 * s, 5.8 * s, Math.PI * .95, Math.PI * 2.05); g.fillStyle = variant % 3 === 1 ? '#8a5a2e' : '#5a4632'; g.fill(); if (variant % 3 === 0) { g.strokeStyle = '#5a4632'; g.lineWidth = 1.1 * s; g.beginPath(); g.arc(0, -23.6 * s, 4.2 * s, 0.2, Math.PI - 0.2); g.stroke(); } } // el pelo corto ateniense; el primer maestro con barba
  else if (S.era === 3) { // pelucas negras de corte recto, o el cráneo rapado del sacerdote lector
    if (variant % 3 !== 2) {
      g.beginPath(); g.arc(0, -27.2 * s, 5.7 * s, Math.PI * .92, Math.PI * 2.08); g.fillStyle = '#1c1a18'; g.fill();
      g.fillRect(-5.7 * s, -27.2 * s, 11.4 * s, 2.4 * s);
    }
  }
  else if (variant % 3 === 0) { g.beginPath(); g.arc(0, -27.6 * s, 5.7 * s, Math.PI, 0); g.fillStyle = '#2e2a26'; g.fill(); }
  else if (variant % 3 === 1) { g.beginPath(); g.arc(0, -27.4 * s, 5.7 * s, Math.PI * .95, Math.PI * 2.05); g.fillStyle = '#8a5a2e'; g.fill(); dot({ x: 0, y: -33 * s }, 2.4 * s, '#8a5a2e'); }
  else { g.beginPath(); g.arc(0, -27.6 * s, 5.7 * s, Math.PI, 0); g.fillStyle = '#d9d2c4'; g.fill(); }
  g.restore();
}
function drawMariposa(t, cx0, cy0, phase, color) {
  const bx = cx0 + Math.sin(t * 0.5 + phase) * 2.0;
  const by = cy0 + Math.sin(t * 0.37 + phase * 2.1) * 1.4;
  const p = P(bx, by, 26 + Math.sin(t * 1.3 + phase) * 7);
  const flap = 0.35 + Math.abs(Math.sin(t * 9 + phase)) * 0.65;
  g.save(); g.translate(p.x, p.y);
  g.fillStyle = color;
  g.beginPath(); g.ellipse(-3 * zoom * flap, -1 * zoom, 3.2 * zoom * flap, 2.1 * zoom, 0.5, 0, 7); g.fill();
  g.beginPath(); g.ellipse(3 * zoom * flap, -1 * zoom, 3.2 * zoom * flap, 2.1 * zoom, -0.5, 0, 7); g.fill();
  g.strokeStyle = '#4a3a26'; g.lineWidth = 1 * zoom;
  g.beginPath(); g.moveTo(0, -3 * zoom); g.lineTo(0, 2 * zoom); g.stroke();
  g.restore();
}

/* ---------- los pensadores: retrato y presencia ---------- */
function drawBusto(c2, k) { // retrato chibi para el medallón (canvas 92×92)
  c2.clearRect(0, 0, 92, 92);
  const cx = 46, cy = 42;
  if (k === 'ia') {   // LA IA (el futuro, era21-plan): no es una persona: la chispa azul, fría, con dos ojos amables, junto al fuego viejo
    const gr = c2.createRadialGradient(cx, cy + 8, 4, cx, cy + 8, 40); gr.addColorStop(0, 'rgba(159,220,255,0.55)'); gr.addColorStop(1, 'rgba(159,220,255,0)');
    c2.fillStyle = gr; c2.beginPath(); c2.arc(cx, cy + 8, 40, 0, 7); c2.fill();   // el halo
    c2.fillStyle = '#7cc4f2'; c2.beginPath(); c2.moveTo(cx, cy - 30); c2.bezierCurveTo(cx + 26, cy - 4, cx + 24, cy + 30, cx, cy + 32); c2.bezierCurveTo(cx - 24, cy + 30, cx - 26, cy - 4, cx, cy - 30); c2.fill();   // la llama
    c2.fillStyle = '#d6f1ff'; c2.beginPath(); c2.moveTo(cx, cy - 12); c2.bezierCurveTo(cx + 15, cy + 4, cx + 14, cy + 26, cx, cy + 27); c2.bezierCurveTo(cx - 14, cy + 26, cx - 15, cy + 4, cx, cy - 12); c2.fill();   // el corazón claro
    c2.fillStyle = '#1f4f7a'; c2.beginPath(); c2.arc(cx - 6.5, cy + 12, 2.6, 0, 7); c2.fill(); c2.beginPath(); c2.arc(cx + 6.5, cy + 12, 2.6, 0, 7); c2.fill();   // los ojos
    c2.strokeStyle = '#1f4f7a'; c2.lineWidth = 1.8; c2.lineCap = 'round'; c2.beginPath(); c2.arc(cx, cy + 17, 3.6, .5, Math.PI - .5); c2.stroke();   // la sonrisa
    c2.fillStyle = '#ffffff'; for (const [dx, dy, r] of [[-20, -18, 1.8], [22, -8, 1.4], [-24, 14, 1.2], [19, 26, 1.5]]) { c2.beginPath(); c2.arc(cx + dx, cy + dy, r, 0, 7); c2.fill(); }   // las chispitas
    return;
  }
  c2.fillStyle = { bloom: '#4a5466', abuela: '#8a7055', mayor: '#7a6248', enheduanna: '#e8dcc0', ptahhotep: '#f2ead2', socrates: '#c9b48a', dionisio: '#f4efe2', hipatia: '#3d4a5e', eratostenes: '#efe7d2', hunayn: '#2f4a3e', aljahiz: '#7a5a36', neza: '#2f6f6a', nezahualcoyotl: '#2f6f6a', partera: '#7a4a5e', hugo: '#ece6d6', abelardo: '#2a2a34', blaeu: '#2a2622', comenio: '#2a2a2e', bello: '#2a2a30', sarmiento: '#3a2a22', quintiliano: '#ece4d2', plinio: '#eee6d4', zhuxi: '#3e4a56', liqingzhao: '#b8c9b0', dewey: '#4a4440', skinner: '#5f7488', freire: '#7a5636', edubba: '#cfc0a0', kagemni: '#efe6cc', rosa: '#7a4a56' }[k];
  c2.beginPath(); c2.arc(cx, 96, 36, Math.PI, 0); c2.fill();          // hombros
  c2.fillStyle = '#f2c9a0';
  c2.beginPath(); c2.arc(cx, cy, 23, 0, 7); c2.fill();                // cabeza
  c2.fillStyle = '#3a2c1c';
  c2.beginPath(); c2.arc(cx - 8, cy + 3, 2.5, 0, 7); c2.fill();       // ojos
  c2.beginPath(); c2.arc(cx + 8, cy + 3, 2.5, 0, 7); c2.fill();
  if (k === 'dewey') {                                                // bombín y bigote
    c2.fillStyle = '#2e2a26';
    c2.beginPath(); c2.ellipse(cx, cy - 16, 27, 6, 0, 0, 7); c2.fill();
    c2.beginPath(); c2.arc(cx, cy - 18, 17, Math.PI, 0); c2.fill();
    c2.strokeStyle = '#8a8578'; c2.lineWidth = 4.5; c2.lineCap = 'round';
    c2.beginPath(); c2.arc(cx - 5, cy + 13, 5, Math.PI * 1.1, Math.PI * 1.9); c2.stroke();
    c2.beginPath(); c2.arc(cx + 5, cy + 13, 5, Math.PI * 1.1, Math.PI * 1.9); c2.stroke();
  } else if (k === 'skinner') {                                       // calva, canas y lentes redondos
    c2.fillStyle = '#e8e0d0';
    c2.beginPath(); c2.arc(cx - 20, cy + 5, 5.5, 0, 7); c2.fill();
    c2.beginPath(); c2.arc(cx + 20, cy + 5, 5.5, 0, 7); c2.fill();
    c2.strokeStyle = 'rgba(255,255,255,.55)'; c2.lineWidth = 3.5;
    c2.beginPath(); c2.arc(cx - 5, cy - 13, 9, Math.PI * 1.15, Math.PI * 1.6); c2.stroke();
    c2.strokeStyle = '#3a3226'; c2.lineWidth = 2.6;
    c2.beginPath(); c2.arc(cx - 8, cy + 3, 7, 0, 7); c2.stroke();
    c2.beginPath(); c2.arc(cx + 8, cy + 3, 7, 0, 7); c2.stroke();
    c2.beginPath(); c2.moveTo(cx - 1.5, cy + 3); c2.lineTo(cx + 1.5, cy + 3); c2.stroke();
    c2.fillStyle = '#c94f43'; c2.fillRect(cx - 3.5, 76, 7, 16);       // corbata
  } else if (k === 'freire') {                                        // freire: pelo, barba y lentes cuadrados
    c2.fillStyle = '#5a5048';
    c2.beginPath(); c2.arc(cx, cy - 5, 24, Math.PI * .95, Math.PI * 2.05); c2.fill();
    c2.beginPath(); c2.arc(cx, cy + 13, 18, 0, Math.PI); c2.fill();
    c2.fillStyle = '#f2c9a0';
    c2.beginPath(); c2.ellipse(cx, cy + 12, 7, 4, 0, 0, 7); c2.fill();
    c2.strokeStyle = '#3a3226'; c2.lineWidth = 2.6;
    c2.strokeRect(cx - 15, cy - 2, 12, 10); c2.strokeRect(cx + 3, cy - 2, 12, 10);
    c2.beginPath(); c2.moveTo(cx - 3, cy + 2); c2.lineTo(cx + 3, cy + 2); c2.stroke();
  } else if (k === 'socrates') {                                      // sócrates: calvo, chato, barba blanca ancha, ceja levantada de preguntar
    c2.fillStyle = '#d9d2c4';
    c2.beginPath(); c2.arc(cx, cy + 14, 21, 0.05, Math.PI - 0.05); c2.fill();                       // la barba
    c2.beginPath(); c2.arc(cx - 21, cy + 2, 6, 0, 7); c2.fill(); c2.beginPath(); c2.arc(cx + 21, cy + 2, 6, 0, 7); c2.fill(); // las canas
    c2.fillStyle = '#e8b896'; c2.beginPath(); c2.arc(cx, cy + 7, 5, 0, 7); c2.fill();               // la nariz chata
    c2.strokeStyle = '#3a3226'; c2.lineWidth = 2.6; c2.lineCap = 'round';
    c2.beginPath(); c2.moveTo(cx - 14, cy - 7); c2.lineTo(cx - 4, cy - 5); c2.stroke();
    c2.beginPath(); c2.moveTo(cx + 4, cy - 9); c2.lineTo(cx + 14, cy - 12); c2.stroke();            // la ceja que pregunta
  } else if (k === 'hipatia') {                                       // hipatia: el pelo oscuro recogido, el manto del filósofo sobre los hombros
    c2.fillStyle = '#2e2620';
    c2.beginPath(); c2.arc(cx, cy - 3, 24.5, Math.PI * .92, Math.PI * 2.08); c2.fill();            // el pelo, partido al medio
    c2.beginPath(); c2.arc(cx, cy - 22, 9, 0, 7); c2.fill();                                         // el rodete
    c2.beginPath(); c2.arc(cx - 21, cy + 6, 5.5, 0, 7); c2.fill(); c2.beginPath(); c2.arc(cx + 21, cy + 6, 5.5, 0, 7); c2.fill();
    c2.strokeStyle = '#c9a24a'; c2.lineWidth = 2.4; c2.beginPath(); c2.arc(cx, cy - 3, 22, Math.PI * 1.15, Math.PI * 1.85); c2.stroke(); // la cinta
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2.2; c2.lineCap = 'round';
    c2.beginPath(); c2.arc(cx, cy + 10, 5, .4, Math.PI - .4); c2.stroke();                         // la boca que explica
    c2.fillStyle = '#efe7d2'; c2.beginPath(); c2.arc(cx - 22, 90, 9, 0, 7); c2.fill();               // el rollo bajo el brazo
  } else if (k === 'hunayn') {                                        // hunayn: turbante blanco, barba oscura, la cruz pequeña de los nestorianos y un manuscrito
    c2.fillStyle = '#2a2018';
    c2.beginPath(); c2.arc(cx, cy + 13, 19, 0.1, Math.PI - 0.1); c2.fill();                         // la barba
    c2.fillStyle = '#f4efe2';
    c2.beginPath(); c2.ellipse(cx, cy - 15, 26, 13, 0, 0, 7); c2.fill();                              // el turbante
    c2.strokeStyle = '#d8cfb8'; c2.lineWidth = 2; c2.beginPath(); c2.ellipse(cx, cy - 14, 22, 8, 0, Math.PI * 0.1, Math.PI * 0.9); c2.stroke();
    c2.fillStyle = '#c9a24a'; c2.fillRect(cx - 1.2, 72, 2.4, 9); c2.fillRect(cx - 4, 75, 8, 2.4);    // la cruz
    c2.fillStyle = '#e8dcc0'; c2.fillRect(cx + 14, 76, 18, 13);                                       // el manuscrito
    c2.strokeStyle = '#8a6a3a'; c2.lineWidth = 1.2; for (let i = 0; i < 3; i++) { c2.beginPath(); c2.moveTo(cx + 17, 80 + i * 3); c2.lineTo(cx + 29, 80 + i * 3); c2.stroke(); }
  } else if (k === 'aljahiz') {                                       // al-jahiz: turbante ocre, ojos saltones (de ahí su apodo) y un libro abierto
    c2.fillStyle = '#3a2c1c';
    c2.beginPath(); c2.arc(cx, cy + 13, 16, 0.25, Math.PI - 0.25); c2.fill();                       // la barba corta
    c2.fillStyle = '#c99a4a';
    c2.beginPath(); c2.ellipse(cx, cy - 15, 25, 12, 0, 0, 7); c2.fill();                              // el turbante
    c2.fillStyle = '#fff'; c2.beginPath(); c2.arc(cx - 8, cy + 3, 4.5, 0, 7); c2.fill(); c2.beginPath(); c2.arc(cx + 8, cy + 3, 4.5, 0, 7); c2.fill();
    c2.fillStyle = '#3a2c1c'; c2.beginPath(); c2.arc(cx - 8, cy + 3, 2.4, 0, 7); c2.fill(); c2.beginPath(); c2.arc(cx + 8, cy + 3, 2.4, 0, 7); c2.fill();
    c2.fillStyle = '#efe4c8'; c2.beginPath(); c2.moveTo(cx - 20, 82); c2.lineTo(cx, 86); c2.lineTo(cx + 20, 82); c2.lineTo(cx + 20, 92); c2.lineTo(cx, 96); c2.lineTo(cx - 20, 92); c2.closePath(); c2.fill();   // el libro abierto
  } else if (k === 'neza' || k === 'nezahualcoyotl') {               // nezahualcóyotl: el pelo negro recogido, el penacho de plumas de quetzal, la orejera de jade y la flor del canto
    c2.fillStyle = '#1e1610';
    c2.beginPath(); c2.arc(cx, cy - 4, 24, Math.PI * 0.95, Math.PI * 2.05); c2.fill();                 // el pelo
    ['#2f8a5a', '#3fa06a', '#2f8a5a', '#58b47a', '#2f8a5a'].forEach((col, i) => { c2.fillStyle = col; c2.beginPath(); c2.ellipse(cx - 16 + i * 8, cy - 32, 3.4, 13, (i - 2) * 0.28, 0, 7); c2.fill(); });   // el penacho
    c2.fillStyle = '#c9a24a'; c2.fillRect(cx - 18, cy - 23, 36, 4);                                    // la diadema de oro
    c2.fillStyle = '#3fa08a'; c2.beginPath(); c2.arc(cx - 23, cy + 4, 4, 0, 7); c2.fill(); c2.beginPath(); c2.arc(cx + 23, cy + 4, 4, 0, 7); c2.fill();   // las orejeras de jade
    c2.fillStyle = '#e8803a'; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; c2.beginPath(); c2.arc(cx + 20 + Math.cos(a) * 4, 80 + Math.sin(a) * 4, 3.4, 0, 7); c2.fill(); }   // la flor
    c2.fillStyle = '#f2c43a'; c2.beginPath(); c2.arc(cx + 20, 80, 2.6, 0, 7); c2.fill();
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2.2; c2.lineCap = 'round'; c2.beginPath(); c2.arc(cx, cy + 10, 5, .4, Math.PI - .4); c2.stroke();   // la boca que canta
  } else if (k === 'quintiliano') {                                   // quintiliano: el pelo corto y canoso de los romanos, sin barba, la toga blanca con su pliegue y el rollo de la Institutio
    c2.fillStyle = '#8a8478'; c2.beginPath(); c2.arc(cx, cy - 6, 23.5, Math.PI * 1.02, Math.PI * 1.98); c2.fill();   // el pelo corto, peinado hacia adelante
    for (let k2 = 0; k2 < 6; k2++) { c2.beginPath(); c2.arc(cx - 15 + k2 * 6, cy - 14, 3.2, 0, Math.PI); c2.fill(); }   // el flequillo en mechones
    c2.strokeStyle = '#6e6458'; c2.lineWidth = 2; c2.beginPath(); c2.moveTo(cx - 13, cy - 5); c2.lineTo(cx - 4, cy - 4); c2.moveTo(cx + 4, cy - 4); c2.lineTo(cx + 13, cy - 5); c2.stroke();   // las cejas
    c2.strokeStyle = '#d4c8b0'; c2.lineWidth = 2.4; c2.beginPath(); c2.moveTo(cx - 30, 80); c2.quadraticCurveTo(cx - 2, 68, cx + 20, 92); c2.stroke();   // el pliegue de la toga
    c2.fillStyle = '#e8d9a8'; c2.fillRect(cx + 15, 74, 16, 9); c2.fillStyle = '#b09a60'; c2.fillRect(cx + 12, 73, 3, 11); c2.fillRect(cx + 31, 73, 3, 11);   // el rollo
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2.2; c2.lineCap = 'round'; c2.beginPath(); c2.arc(cx, cy + 10, 5, .4, Math.PI - .4); c2.stroke();   // la sonrisa tranquila de quien no pega
  } else if (k === 'zhuxi') {                                         // zhu xi: el gorro negro de letrado, la barba larga y canosa, el cuello blanco cruzado, un libro cosido y los siete lunares de la mejilla, en forma de la Osa Mayor (así lo pintan sus retratos)
    c2.fillStyle = '#1e1a18'; c2.beginPath(); c2.moveTo(cx - 22, cy - 10); c2.lineTo(cx - 18, cy - 34); c2.lineTo(cx + 18, cy - 34); c2.lineTo(cx + 22, cy - 10); c2.closePath(); c2.fill();   // el gorro
    c2.fillStyle = '#8a8478'; c2.beginPath(); c2.moveTo(cx - 10, cy + 12); c2.quadraticCurveTo(cx, cy + 44, cx + 10, cy + 12); c2.closePath(); c2.fill();   // la barba larga
    c2.strokeStyle = '#6e6458'; c2.lineWidth = 2; c2.beginPath(); c2.moveTo(cx - 7, cy + 9); c2.lineTo(cx - 1, cy + 11); c2.moveTo(cx + 7, cy + 9); c2.lineTo(cx + 1, cy + 11); c2.stroke();   // el bigote
    c2.fillStyle = '#5a4030'; for (const [dx, dy] of [[11, 8], [13.5, 10], [16, 10.5], [18.5, 9], [17, 13.5], [19.5, 14.5], [20.5, 11.5]]) { c2.beginPath(); c2.arc(cx + dx, cy + dy, 0.9, 0, 7); c2.fill(); }   // los siete lunares
    c2.strokeStyle = '#ece6d6'; c2.lineWidth = 3; c2.beginPath(); c2.moveTo(cx - 12, 66); c2.lineTo(cx + 4, 86); c2.moveTo(cx + 12, 66); c2.lineTo(cx - 2, 80); c2.stroke();   // el cuello blanco cruzado
    c2.fillStyle = '#3a5a8a'; c2.fillRect(cx + 13, 74, 17, 13); c2.fillStyle = '#efe6cc'; c2.fillRect(cx + 26, 75, 2.5, 11);   // el libro cosido, con su tapa azul
  } else if (k === 'bloom') {                                         // benjamin bloom (1913-1999): la calva con el pelo canoso a los costados, los anteojos de marco grueso, el saco y la corbata, y la carpeta de gráficos
    c2.fillStyle = '#c9c2b6'; c2.beginPath(); c2.ellipse(cx - 21, cy - 2, 5, 9, 0.2, 0, 7); c2.fill(); c2.beginPath(); c2.ellipse(cx + 21, cy - 2, 5, 9, -0.2, 0, 7); c2.fill();   // el pelo de los costados
    c2.strokeStyle = '#2e2a26'; c2.lineWidth = 2.2; c2.beginPath(); c2.arc(cx - 8, cy + 3, 6.2, 0, 7); c2.stroke(); c2.beginPath(); c2.arc(cx + 8, cy + 3, 6.2, 0, 7); c2.stroke(); c2.beginPath(); c2.moveTo(cx - 2, cy + 3); c2.lineTo(cx + 2, cy + 3); c2.stroke();   // los anteojos
    c2.strokeStyle = '#8a7a6a'; c2.lineWidth = 1.8; c2.beginPath(); c2.moveTo(cx - 13, cy - 7); c2.lineTo(cx - 4, cy - 6); c2.moveTo(cx + 4, cy - 6); c2.lineTo(cx + 13, cy - 7); c2.stroke();   // las cejas
    c2.fillStyle = '#f4f1ea'; c2.beginPath(); c2.moveTo(cx - 9, 64); c2.lineTo(cx, 76); c2.lineTo(cx + 9, 64); c2.closePath(); c2.fill();   // la camisa
    c2.fillStyle = '#8a2f2a'; c2.beginPath(); c2.moveTo(cx - 2.5, 66); c2.lineTo(cx + 2.5, 66); c2.lineTo(cx + 3.5, 86); c2.lineTo(cx - 3.5, 86); c2.closePath(); c2.fill();   // la corbata
    c2.fillStyle = '#e8e2d2'; c2.fillRect(cx + 14, 70, 18, 16); c2.strokeStyle = '#3a6a9a'; c2.lineWidth = 1.6; c2.beginPath(); c2.moveTo(cx + 16, 83); c2.quadraticCurveTo(cx + 23, 70, cx + 30, 83); c2.stroke();   // la carpeta con la campana de Gauss
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2; c2.lineCap = 'round'; c2.beginPath(); c2.arc(cx, cy + 12, 4.2, .4, Math.PI - .4); c2.stroke();
  } else if (k === 'liqingzhao') {                                    // li qingzhao: el pelo negro en un moño alto con su horquilla de jade, la túnica clara de cuello cruzado y un crisantemo amarillo («más delgada que la flor amarilla», escribió)
    c2.fillStyle = '#1e1814'; c2.beginPath(); c2.arc(cx, cy - 5, 24, Math.PI * 0.95, Math.PI * 2.05); c2.fill();   // el pelo
    c2.beginPath(); c2.ellipse(cx, cy - 27, 10, 8, 0, 0, 7); c2.fill();                                // el moño alto
    c2.strokeStyle = '#6aa08a'; c2.lineWidth = 2.6; c2.lineCap = 'round'; c2.beginPath(); c2.moveTo(cx - 14, cy - 31); c2.lineTo(cx + 14, cy - 24); c2.stroke();   // la horquilla de jade
    c2.fillStyle = '#6aa08a'; c2.beginPath(); c2.arc(cx + 15, cy - 24, 2.6, 0, 7); c2.fill();
    c2.strokeStyle = '#eee8da'; c2.lineWidth = 3; c2.beginPath(); c2.moveTo(cx - 12, 66); c2.lineTo(cx + 4, 86); c2.moveTo(cx + 12, 66); c2.lineTo(cx - 2, 80); c2.stroke();   // el cuello cruzado
    c2.fillStyle = '#e8b83a'; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; c2.beginPath(); c2.ellipse(cx + 22 + Math.cos(a) * 4, 80 + Math.sin(a) * 4, 3.2, 1.3, a, 0, 7); c2.fill(); }   // el crisantemo
    c2.fillStyle = '#c9902a'; c2.beginPath(); c2.arc(cx + 22, 80, 2.2, 0, 7); c2.fill();
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2; c2.lineCap = 'round'; c2.beginPath(); c2.arc(cx, cy + 10, 4.5, .4, Math.PI - .4); c2.stroke();
  } else if (k === 'plinio') {                                        // plinio el joven: el pelo oscuro y rizado, la toga con la franja púrpura del senador y la tablilla de sus cartas
    c2.fillStyle = '#3a2a1e'; c2.beginPath(); c2.arc(cx, cy - 5, 24, Math.PI, Math.PI * 2); c2.fill();
    for (let k2 = 0; k2 < 7; k2++) { c2.beginPath(); c2.arc(cx - 18 + k2 * 6, cy - 16 + (k2 % 2) * 2, 3.6, 0, 7); c2.fill(); }   // los rizos
    c2.fillStyle = '#7a2a4a'; c2.fillRect(cx - 4, 68, 8, 24);                                          // la franja púrpura (el latus clavus)
    c2.fillStyle = '#8a6040'; c2.fillRect(cx + 13, 74, 17, 13); c2.fillStyle = '#c9a24a'; c2.fillRect(cx + 15, 76, 13, 9);   // la tablilla de cera
    c2.strokeStyle = '#5a4028'; c2.lineWidth = 1; for (let k2 = 0; k2 < 3; k2++) { c2.beginPath(); c2.moveTo(cx + 16, 78 + k2 * 2.6); c2.lineTo(cx + 27, 78 + k2 * 2.6); c2.stroke(); }
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2.2; c2.lineCap = 'round'; c2.beginPath(); c2.arc(cx, cy + 9, 6, .3, Math.PI - .3); c2.stroke();
  } else if (k === 'bello') {                                         // andrés bello: calvo, con el pelo gris a los lados, la levita negra, la corbata blanca y un libro de gramática
    c2.fillStyle = '#bab4aa'; c2.beginPath(); c2.ellipse(cx - 20, cy + 2, 6, 11, 0.1, 0, 7); c2.fill(); c2.beginPath(); c2.ellipse(cx + 20, cy + 2, 6, 11, -0.1, 0, 7); c2.fill();
    c2.fillStyle = '#f4f0e6'; c2.beginPath(); c2.moveTo(cx - 8, 66); c2.lineTo(cx + 8, 66); c2.lineTo(cx, 78); c2.closePath(); c2.fill();   // la corbata blanca
    c2.fillStyle = '#5a3a24'; c2.fillRect(cx + 12, 76, 18, 13); c2.fillStyle = '#c9a24a'; c2.fillRect(cx + 14, 81, 14, 2);   // la Gramática
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2; c2.lineCap = 'round'; c2.beginPath(); c2.moveTo(cx - 5, cy + 12); c2.lineTo(cx + 5, cy + 12); c2.stroke();
  } else if (k === 'sarmiento') {                                     // sarmiento: frente ancha, patillas oscuras, ceño fruncido, el poncho sobre los hombros y el silabario
    c2.fillStyle = '#3a2a1e'; c2.beginPath(); c2.ellipse(cx - 21, cy + 6, 5, 13, 0.15, 0, 7); c2.fill(); c2.beginPath(); c2.ellipse(cx + 21, cy + 6, 5, 13, -0.15, 0, 7); c2.fill();   // las patillas
    c2.fillStyle = '#3a2a1e'; c2.beginPath(); c2.arc(cx, cy - 10, 20, Math.PI * 1.1, Math.PI * 1.9); c2.fill();   // el pelo alto
    c2.strokeStyle = '#3a2a1e'; c2.lineWidth = 2.4; c2.beginPath(); c2.moveTo(cx - 13, cy - 5); c2.lineTo(cx - 4, cy - 2); c2.moveTo(cx + 4, cy - 2); c2.lineTo(cx + 13, cy - 5); c2.stroke();   // el ceño
    c2.fillStyle = '#8a3a2a'; c2.beginPath(); c2.moveTo(cx - 34, 92); c2.lineTo(cx, 66); c2.lineTo(cx + 34, 92); c2.closePath(); c2.fill();   // el poncho
    c2.fillStyle = '#e8c45a'; for (let k2 = 0; k2 < 4; k2++) c2.fillRect(cx - 22 + k2 * 12, 84, 6, 3);
    c2.fillStyle = '#efe4c8'; c2.fillRect(cx + 14, 72, 16, 12); c2.fillStyle = '#1e2a3a'; c2.font = 'bold 6px Georgia'; c2.textAlign = 'center'; c2.fillText('ma me', cx + 22, 80);
  } else if (k === 'blaeu') {                                         // joan blaeu: el pelo largo castaño de los holandeses, bigote y perilla, la gola blanca y un globo
    c2.fillStyle = '#5a3a24'; c2.beginPath(); c2.arc(cx, cy - 4, 24, Math.PI * 0.95, Math.PI * 2.05); c2.fill();
    c2.beginPath(); c2.ellipse(cx - 20, cy + 8, 7, 14, 0.2, 0, 7); c2.fill(); c2.beginPath(); c2.ellipse(cx + 20, cy + 8, 7, 14, -0.2, 0, 7); c2.fill();   // la melena hasta los hombros
    c2.fillStyle = '#5a3a24'; c2.fillRect(cx - 7, cy + 9, 14, 2.6); c2.beginPath(); c2.ellipse(cx, cy + 17, 3.5, 5, 0, 0, 7); c2.fill();   // el bigote y la perilla
    c2.fillStyle = '#f4f0e6'; c2.beginPath(); c2.ellipse(cx, 70, 24, 7, 0, 0, 7); c2.fill();   // la gola
    c2.fillStyle = '#3f6a9a'; c2.beginPath(); c2.arc(cx + 22, 82, 9, 0, 7); c2.fill(); c2.strokeStyle = '#c9a24a'; c2.lineWidth = 1.5; c2.beginPath(); c2.arc(cx + 22, 82, 9, 0, 7); c2.stroke(); c2.fillStyle = '#7a9a4a'; c2.fillRect(cx + 17, 79, 6, 4);   // el globo
  } else if (k === 'comenio') {                                       // comenio: viejo, barba blanca larga, el gorro negro de los hermanos moravos y un libro con dibujos
    c2.fillStyle = '#e8e4dc'; c2.beginPath(); c2.arc(cx, cy - 2, 24, Math.PI * 0.95, Math.PI * 2.05); c2.fill();
    c2.beginPath(); c2.moveTo(cx - 16, cy + 6); c2.quadraticCurveTo(cx, cy + 46, cx + 16, cy + 6); c2.closePath(); c2.fill();   // la barba larga
    c2.fillStyle = '#1e1c1a'; c2.beginPath(); c2.ellipse(cx, cy - 18, 20, 8, 0, Math.PI, 0); c2.fill(); c2.fillRect(cx - 20, cy - 19, 40, 4);   // el gorro
    c2.fillStyle = '#efe4c8'; c2.fillRect(cx + 10, 74, 22, 15); c2.fillStyle = '#5a4a3a'; c2.beginPath(); c2.arc(cx + 15, 80, 3, 0, 7); c2.fill(); c2.fillRect(cx + 21, 78, 8, 1.5); c2.fillRect(cx + 21, 82, 8, 1.5);   // el Orbis Pictus abierto
  } else if (k === 'hugo') {                                          // hugo de san víctor: canónigo regular, la tonsura con su corona de pelo gris, el roquete blanco y el libro del Didascalicon
    c2.fillStyle = '#9a9286';
    c2.beginPath(); c2.arc(cx, cy - 2, 24, Math.PI * 0.92, Math.PI * 2.08); c2.fill();                 // la corona de pelo
    c2.fillStyle = '#f2c9a0'; c2.beginPath(); c2.ellipse(cx, cy - 14, 15, 9, 0, 0, 7); c2.fill();      // la tonsura
    c2.fillStyle = '#1e1c22'; c2.beginPath(); c2.arc(cx, 96, 36, Math.PI * 1.05, Math.PI * 1.32); c2.lineTo(cx, 96); c2.fill(); c2.beginPath(); c2.arc(cx, 96, 36, Math.PI * 1.68, Math.PI * 1.95); c2.lineTo(cx, 96); c2.fill();   // la capa negra sobre el blanco
    c2.fillStyle = '#7a3a2a'; c2.fillRect(cx + 12, 74, 18, 15); c2.fillStyle = '#c9a24a'; c2.fillRect(cx + 14, 76, 14, 2); c2.fillRect(cx + 14, 85, 14, 2);   // el libro
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2; c2.lineCap = 'round'; c2.beginPath(); c2.arc(cx, cy + 11, 4, .5, Math.PI - .5); c2.stroke();
  } else if (k === 'abelardo') {                                      // abelardo: joven, afeitado, el pelo oscuro con la tonsura chica del clérigo, la capa negra del maestro y el cuaderno del sic et non
    c2.fillStyle = '#3a2a1e';
    c2.beginPath(); c2.arc(cx, cy - 4, 24, Math.PI * 0.95, Math.PI * 2.05); c2.fill();
    c2.fillStyle = '#f2c9a0'; c2.beginPath(); c2.ellipse(cx, cy - 20, 7, 4, 0, 0, 7); c2.fill();       // la tonsura chica
    c2.fillStyle = '#3a2a1e'; c2.beginPath(); c2.moveTo(cx - 14, cy - 4); c2.lineTo(cx - 9, cy - 6); c2.lineTo(cx - 4, cy - 4); c2.lineWidth = 2; c2.strokeStyle = '#3a2a1e'; c2.stroke(); c2.beginPath(); c2.moveTo(cx + 4, cy - 6); c2.lineTo(cx + 9, cy - 4); c2.lineTo(cx + 14, cy - 6); c2.stroke();   // una ceja alzada: la duda
    c2.fillStyle = '#efe4c8'; c2.fillRect(cx - 24, 74, 48, 18); c2.fillStyle = '#7a2a22'; c2.font = 'bold 8px Georgia, serif'; c2.textAlign = 'center'; c2.fillText('SIC', cx - 12, 85); c2.fillText('NON', cx + 12, 85);   // el cuaderno abierto
    c2.strokeStyle = '#8a6a3a'; c2.lineWidth = 1; c2.beginPath(); c2.moveTo(cx, 75); c2.lineTo(cx, 91); c2.stroke();
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2.2; c2.lineCap = 'round'; c2.beginPath(); c2.moveTo(cx - 5, cy + 12); c2.quadraticCurveTo(cx + 1, cy + 15, cx + 7, cy + 10); c2.stroke();   // la media sonrisa
  } else if (k === 'partera') {                                       // la partera: el pelo trenzado con cintas sobre la frente (como las mujeres nahuas), el huipil bordado
    c2.fillStyle = '#2a1f18';
    c2.beginPath(); c2.arc(cx, cy - 4, 24, Math.PI * 0.95, Math.PI * 2.05); c2.fill();
    c2.beginPath(); c2.ellipse(cx - 12, cy - 25, 7, 5, -0.4, 0, 7); c2.fill(); c2.beginPath(); c2.ellipse(cx + 12, cy - 25, 7, 5, 0.4, 0, 7); c2.fill();   // las dos puntas de las trenzas sobre la frente
    c2.strokeStyle = '#b84a3a'; c2.lineWidth = 2.4; c2.beginPath(); c2.arc(cx, cy - 6, 22, Math.PI * 1.15, Math.PI * 1.85); c2.stroke();   // la cinta
    c2.fillStyle = '#e8c45a'; for (let i = 0; i < 5; i++) c2.fillRect(cx - 18 + i * 8, 78, 4, 4);       // el bordado del huipil
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2.2; c2.lineCap = 'round'; c2.beginPath(); c2.arc(cx, cy + 10, 5, .4, Math.PI - .4); c2.stroke();
  } else if (k === 'eratostenes') {                                   // eratóstenes: canoso, barba corta y la letra beta en el manto
    c2.fillStyle = '#d9d2c4';
    c2.beginPath(); c2.arc(cx, cy - 4, 24, Math.PI * .95, Math.PI * 2.05); c2.fill();
    c2.beginPath(); c2.arc(cx, cy + 13, 15, 0.2, Math.PI - 0.2); c2.fill();
    c2.fillStyle = '#3a6a8a'; c2.font = 'bold 20px Georgia, serif'; c2.textAlign = 'center'; c2.fillText('β', cx, 88);
  } else if (k === 'dionisio') {                                      // el grammatistes: pelo corto castaño, barba recortada y el estilo tras la oreja
    c2.fillStyle = '#5a4632';
    c2.beginPath(); c2.arc(cx, cy - 4, 24, Math.PI * .95, Math.PI * 2.05); c2.fill();
    c2.beginPath(); c2.arc(cx, cy + 12, 16, 0.2, Math.PI - 0.2); c2.fill();
    c2.strokeStyle = '#d9d2c4'; c2.lineWidth = 3; c2.beginPath(); c2.moveTo(cx + 20, cy - 14); c2.lineTo(cx + 26, cy + 6); c2.stroke();
  } else if (k === 'ptahhotep') {                                     // ptahhotep: calvo, collar usej y cara de escuchar
    c2.strokeStyle = '#2f97d8'; c2.lineWidth = 6;
    c2.beginPath(); c2.arc(cx, 100, 34, Math.PI * 1.25, Math.PI * 1.75); c2.stroke(); // el collar usej
    c2.strokeStyle = '#e8a51e'; c2.lineWidth = 5;
    c2.beginPath(); c2.arc(cx, 100, 27, Math.PI * 1.25, Math.PI * 1.75); c2.stroke();
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2.2; c2.lineCap = 'round';
    c2.beginPath(); c2.arc(cx, cy + 9, 6, .3, Math.PI - .3); c2.stroke();             // serenidad
    c2.beginPath(); c2.moveTo(cx - 16, cy - 7); c2.lineTo(cx - 8, cy - 9); c2.stroke(); // cejas de escucha
    c2.beginPath(); c2.moveTo(cx + 8, cy - 9); c2.lineTo(cx + 16, cy - 7); c2.stroke();
  } else if (k === 'enheduanna') {                                    // enheduanna: melena negra y diadema de sacerdotisa
    c2.fillStyle = '#2e2a26';
    c2.beginPath(); c2.arc(cx, cy - 4, 24, Math.PI * .95, Math.PI * 2.05); c2.fill();
    c2.fillRect(cx - 24, cy - 6, 8, 28); c2.fillRect(cx + 16, cy - 6, 8, 28); // la melena a los hombros
    c2.strokeStyle = '#e8a51e'; c2.lineWidth = 4;
    c2.beginPath(); c2.moveTo(cx - 21, cy - 13); c2.lineTo(cx + 21, cy - 13); c2.stroke(); // la diadema
    c2.fillStyle = '#e8a51e';
    c2.beginPath(); c2.arc(cx, cy - 13, 4.5, 0, 7); c2.fill();                // el disco de la luna
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2.2; c2.lineCap = 'round';
    c2.beginPath(); c2.arc(cx, cy + 9, 6, .3, Math.PI - .3); c2.stroke();     // serena
  } else if (k === 'edubba') {                                        // el padre de la edubba: rapado, cejas de examen y kaunakes de flecos
    c2.strokeStyle = '#b8ab8c'; c2.lineWidth = 3; c2.lineCap = 'round'; // los flecos de lana sobre los hombros
    for (let i = -3; i <= 3; i++) { const fx = cx + i * 9; c2.beginPath(); c2.moveTo(fx, 80); c2.lineTo(fx, 90); c2.stroke(); }
    c2.strokeStyle = '#3a2c1c'; c2.lineWidth = 3;
    c2.beginPath(); c2.moveTo(cx - 15, cy - 6); c2.lineTo(cx - 3, cy - 8); c2.stroke(); // cejas que revisan la tablilla
    c2.beginPath(); c2.moveTo(cx + 3, cy - 8); c2.lineTo(cx + 15, cy - 6); c2.stroke();
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2.2; c2.lineCap = 'round';
    c2.beginPath(); c2.moveTo(cx - 5, cy + 11); c2.lineTo(cx + 5, cy + 11); c2.stroke(); // gesto de dictado, ni sonrisa ni ceño
  } else if (k === 'kagemni') {                                       // el maestro Kagemni: peluca cuadrada, kohl y collar fino
    c2.fillStyle = '#1c1a18';
    c2.beginPath(); c2.arc(cx, cy - 4, 24, Math.PI * .95, Math.PI * 2.05); c2.fill();
    c2.fillRect(cx - 25, cy - 6, 8, 22); c2.fillRect(cx + 17, cy - 6, 8, 22); // la peluca corta a los hombros
    c2.strokeStyle = '#2a2622'; c2.lineWidth = 2;
    c2.beginPath(); c2.moveTo(cx - 13, cy + 8); c2.lineTo(cx - 3, cy + 8); c2.stroke(); // el kohl bajo los ojos
    c2.beginPath(); c2.moveTo(cx + 3, cy + 8); c2.lineTo(cx + 13, cy + 8); c2.stroke();
    c2.strokeStyle = '#e8a51e'; c2.lineWidth = 3.5;
    c2.beginPath(); c2.arc(cx, 98, 28, Math.PI * 1.3, Math.PI * 1.7); c2.stroke();      // un collar sobrio, no el usej del visir
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2.2; c2.lineCap = 'round';
    c2.beginPath(); c2.arc(cx, cy + 12, 5, .3, Math.PI - .3); c2.stroke();              // paciencia de maestro
  } else if (k === 'rosa') {                                          // la Sra. Rosa: moño castaño, aretes y cuello blanco
    c2.fillStyle = '#6e4a32';
    c2.beginPath(); c2.arc(cx, cy - 4, 24, Math.PI * .95, Math.PI * 2.05); c2.fill();
    c2.beginPath(); c2.arc(cx, cy - 24, 8, 0, 7); c2.fill();           // el moño alto
    c2.fillStyle = '#e8a51e';
    c2.beginPath(); c2.arc(cx - 21, cy + 8, 2.5, 0, 7); c2.fill();     // los aretes
    c2.beginPath(); c2.arc(cx + 21, cy + 8, 2.5, 0, 7); c2.fill();
    c2.fillStyle = '#fbfaf2';
    c2.beginPath(); c2.moveTo(cx - 10, 78); c2.lineTo(cx, 86); c2.lineTo(cx + 10, 78); c2.lineTo(cx + 6, 74); c2.lineTo(cx - 6, 74); c2.closePath(); c2.fill(); // el cuello de la blusa
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2.2; c2.lineCap = 'round';
    c2.beginPath(); c2.arc(cx, cy + 9, 6, .3, Math.PI - .3); c2.stroke(); // la sonrisa que sostiene el aula
  } else if (k === 'mayor') {                                         // la Mayor: canas recogidas y vincha de ocre
    c2.fillStyle = '#c9c2b4';
    c2.beginPath(); c2.arc(cx, cy - 4, 24, Math.PI * .95, Math.PI * 2.05); c2.fill();
    c2.strokeStyle = '#b8642c'; c2.lineWidth = 4;
    c2.beginPath(); c2.arc(cx, cy - 2, 22, Math.PI * 1.15, Math.PI * 1.85); c2.stroke();
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2.2; c2.lineCap = 'round';
    c2.beginPath(); c2.arc(cx, cy + 9, 6, .3, Math.PI - .3); c2.stroke();      // gesto firme
  } else {                                                            // la abuela: pelo blanco, moño y sonrisa
    c2.fillStyle = '#e8e4da';
    c2.beginPath(); c2.arc(cx, cy - 4, 24, Math.PI * .95, Math.PI * 2.05); c2.fill();
    c2.beginPath(); c2.arc(cx, cy - 24, 9, 0, 7); c2.fill();           // moño
    c2.strokeStyle = '#b98a6e'; c2.lineWidth = 2.2; c2.lineCap = 'round';
    c2.beginPath(); c2.arc(cx, cy + 9, 7, .3, Math.PI - .3); c2.stroke(); // la sonrisa
    c2.beginPath(); c2.arc(cx - 13, cy + 7, 2.5, 0, 7); c2.stroke();      // arrugas de reír
    c2.beginPath(); c2.arc(cx + 13, cy + 7, 2.5, 0, 7); c2.stroke();
  }
}
/* En qué épocas se VE cada pensador. Su idea, una vez adoptada, rinde siempre; su figura pertenece a
   su tiempo. Las tres modernas comparten la misma escuela, así que conviven. */
const PENSADOR_ERAS = { abuela: [1], enheduanna: [2], ptahhotep: [3], socrates: [4], hipatia: [5], quintiliano: [14], hunayn: [6], zhuxi: [15], bloom: [21], neza: [7], abelardo: [8], comenio: [9], sarmiento: [10], dewey: [11, 12, 13], skinner: [12, 13], freire: [13] };
const LUGAR_PENSADOR = { bloom: [10.4, 12.4], abuela: [7.35, 8.85], enheduanna: [12.0, 5.6], ptahhotep: [13.1, 6.2], socrates: [9.7, 8.9], hipatia: [10.6, 8.4], quintiliano: [13.2, 11.4], zhuxi: [10.3, 15.9], hunayn: [11.85, 10.75], neza: [8.75, 11.25], abelardo: [6.55, 13.15], comenio: [9.75, 12.55], sarmiento: [7.6, 12.42], dewey: [11.3, 9.5], skinner: [19.4, 7.6], freire: [6.35, 12.65] }; // su rincón adoptado (Sócrates, en medio del ágora, donde molesta)
function drawPensador(k, x, y, t, sentado) {
  const pos = P(x, y), s = zoom, sway = sentado ? 0 : Math.sin(t * 0.8 + x) * 0.6 * s;
  ellipse({ x: pos.x, y: pos.y }, (sentado ? 7 : 8) * zoom, 3.6 * zoom, sombraHoy);
  g.save(); g.translate(pos.x + sway, pos.y);
  const traje = { bloom: '#4a5466', abuela: '#8a7055', enheduanna: '#e8dcc0', ptahhotep: '#f2ead2', socrates: '#c9b48a', hipatia: '#3d4a5e', quintiliano: '#ece4d2', zhuxi: '#3e4a56', hunayn: '#2f4a3e', neza: '#2f6f6a', abelardo: '#2a2a34', comenio: '#2a2a2e', sarmiento: '#3a2a22', dewey: '#4a4440', skinner: '#5f7488', freire: '#7a5636' }[k];
  if (sentado) { // SENTADA: torso recogido de base ancha, en el idioma de drawSentadito. Nada de escalar la
    g.beginPath();                                     // figura entera: eso aplasta también la cabeza.
    g.moveTo(-6.4 * s, 1.5 * s); g.quadraticCurveTo(-5.6 * s, -7.6 * s, 0, -8.8 * s);
    g.quadraticCurveTo(5.6 * s, -7.6 * s, 6.4 * s, 1.5 * s); g.closePath();
    g.fillStyle = traje; g.fill();
    g.fillStyle = '#8a6247';                           // la manta de piel sobre las piernas cruzadas
    g.beginPath(); g.moveTo(-6.2 * s, 1.5 * s);
    g.quadraticCurveTo(0, -3.4 * s, 6.2 * s, 1.5 * s); g.closePath(); g.fill();
    g.strokeStyle = '#75543c'; g.lineWidth = 0.9 * s;  // el pliegue de la manta
    g.beginPath(); g.moveTo(-3.4 * s, -0.4 * s); g.quadraticCurveTo(0, -2.4 * s, 3.4 * s, -0.4 * s); g.stroke();
    // la cabeza baja hasta la altura de quien está sentado, PERO conserva su tamaño; el cabeceo es de contar
    g.translate(0, 6.6 * s + Math.sin(t * 1.25) * 0.55 * s);
  } else {
    g.beginPath();
    g.moveTo(-5.5 * s, 0); g.quadraticCurveTo(-5 * s, -14 * s, 0, -15 * s);
    g.quadraticCurveTo(5 * s, -14 * s, 5.5 * s, 0); g.closePath();
    g.fillStyle = traje; g.fill();
    if (k === 'skinner') { g.fillStyle = '#c94f43'; g.fillRect(-1 * s, -13.5 * s, 2 * s, 7 * s); }   // corbata
    if (k === 'freire') { g.fillStyle = '#e8dcc0'; g.fillRect(-3.5 * s, -14 * s, 7 * s, 3 * s); }    // cuello de camisa
  }
  dot({ x: 0, y: -20.5 * s }, 6 * s, PAL.piel);
  const apP = apertura(x * 2.7);
  ojo(-2.2 * s, -21 * s, 0.9 * s, apP); ojo(2.2 * s, -21 * s, 0.9 * s, apP);
  if (k === 'dewey') {
    ellipse({ x: 0, y: -25.2 * s }, 7.5 * s, 2 * s, '#2e2a26');                                     // bombín
    g.beginPath(); g.arc(0, -25.8 * s, 4.6 * s, Math.PI, 0); g.fillStyle = '#2e2a26'; g.fill();
    g.strokeStyle = '#8a8578'; g.lineWidth = 1.3 * s; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-3 * s, -17.6 * s); g.lineTo(-0.5 * s, -17.2 * s); g.stroke();          // bigote
    g.beginPath(); g.moveTo(3 * s, -17.6 * s); g.lineTo(0.5 * s, -17.2 * s); g.stroke();
    line({ x: 7 * s, y: -9 * s }, { x: 8.2 * s, y: 0 }, '#5e4128', 1.5 * s);                        // bastón
  } else if (k === 'skinner') {
    g.fillStyle = '#e8e0d0';
    dot({ x: -5.6 * s, y: -19.5 * s }, 1.7 * s, '#e8e0d0'); dot({ x: 5.6 * s, y: -19.5 * s }, 1.7 * s, '#e8e0d0'); // canas
    g.strokeStyle = 'rgba(58,44,28,.85)'; g.lineWidth = 0.9 * s;
    g.beginPath(); g.arc(-2.2 * s, -21 * s, 1.7 * s, 0, 7); g.stroke();                             // lentes redondos
    g.beginPath(); g.arc(2.2 * s, -21 * s, 1.7 * s, 0, 7); g.stroke();
  } else if (k === 'freire') {
    g.fillStyle = '#5a5048';
    g.beginPath(); g.arc(0, -22 * s, 6.2 * s, Math.PI * .95, Math.PI * 2.05); g.fill();             // pelo
    g.beginPath(); g.arc(0, -17.5 * s, 4.8 * s, 0, Math.PI); g.fill();                              // barba
    g.strokeStyle = 'rgba(58,44,28,.85)'; g.lineWidth = 0.9 * s;
    g.strokeRect(-4 * s, -22.2 * s, 3.2 * s, 2.6 * s); g.strokeRect(0.8 * s, -22.2 * s, 3.2 * s, 2.6 * s); // lentes cuadrados
  } else if (k === 'abuela') {
    g.fillStyle = '#e8e4da';
    g.beginPath(); g.arc(0, -21.8 * s, 6.2 * s, Math.PI * .92, Math.PI * 2.08); g.fill();           // pelo blanco
    dot({ x: 0, y: -27.5 * s }, 2.6 * s, '#e8e4da');                                                // moño
    g.strokeStyle = '#b98a6e'; g.lineWidth = 0.9 * s;
    g.beginPath(); g.arc(0, -19 * s, 2 * s, .3, Math.PI - .3); g.stroke();                          // sonrisa
  } else if (k === 'socrates') { // Sócrates: calvo, chato, de barba blanca, descalzo, con el himatión de lana cruda
    g.fillStyle = '#d9d2c4';
    dot({ x: -5.4 * s, y: -19.2 * s }, 1.8 * s, '#d9d2c4'); dot({ x: 5.4 * s, y: -19.2 * s }, 1.8 * s, '#d9d2c4'); // las canas de los lados
    g.beginPath(); g.arc(0, -16.2 * s, 5.2 * s, 0.1, Math.PI - 0.1); g.fill();                         // la barba, ancha
    dot({ x: 0.6 * s, y: -19.4 * s }, 1.5 * s, '#e8b896');                                            // la nariz chata
    g.strokeStyle = '#e8dcc0'; g.lineWidth = 1.2 * s; g.beginPath(); g.moveTo(-4.5 * s, -2 * s); g.lineTo(-2 * s, -9 * s); g.stroke(); // el pliegue del manto
  } else if (k === 'ptahhotep') {
    g.strokeStyle = '#2f97d8'; g.lineWidth = 1.2 * s;
    g.beginPath(); g.arc(0, -18.2 * s, 4.4 * s, 0.3, Math.PI - 0.3); g.stroke();                    // el collar usej
    g.strokeStyle = '#e8a51e'; g.lineWidth = 1 * s;
    g.beginPath(); g.arc(0, -18.2 * s, 3.1 * s, 0.35, Math.PI - 0.35); g.stroke();
    line({ x: 7.4 * s, y: -13 * s }, { x: 7.4 * s, y: 0 }, '#8a6a4a', 1.5 * s);                     // el bastón de mando
  } else if (k === 'enheduanna') {
    g.fillStyle = '#2e2a26';
    g.beginPath(); g.arc(0, -22 * s, 6.2 * s, Math.PI * .92, Math.PI * 2.08); g.fill();             // melena
    g.fillRect(-6.6 * s, -21 * s, 2.4 * s, 7.5 * s); g.fillRect(4.2 * s, -21 * s, 2.4 * s, 7.5 * s);
    g.strokeStyle = '#e8a51e'; g.lineWidth = 1.1 * s;
    g.beginPath(); g.moveTo(-5.6 * s, -23.6 * s); g.lineTo(5.6 * s, -23.6 * s); g.stroke();         // la diadema
    dot({ x: 0, y: -23.6 * s }, 1.5 * s, '#e8a51e');                                                // el disco de la luna
  } else if (k === 'zhuxi') { // Zhu Xi: el gorro negro de letrado y la barba larga
    g.fillStyle = '#1e1a18'; g.fillRect(-5.4 * s, -29.5 * s, 10.8 * s, 6.4 * s);                    // el gorro
    g.fillStyle = '#8a8478'; g.beginPath(); g.moveTo(-2.6 * s, -17.6 * s); g.quadraticCurveTo(0, -9.5 * s, 2.6 * s, -17.6 * s); g.closePath(); g.fill();   // la barba
  }
  // cada pensador tiene su gesto propio
  const cyc = (t % 8) / 8, gesto = smooth((cyc - 0.2) / 0.1) * (1 - smooth((cyc - 0.6) / 0.15));
  g.strokeStyle = traje; g.lineWidth = 2.2 * s; g.lineCap = 'round';
  if (k === 'abuela') { // las manos que cuentan la historia
    g.beginPath(); g.moveTo(-4 * s, -12.5 * s);
    g.lineTo(-6.5 * s, -11 * s + Math.sin(t * 1.6) * 2.2 * s); g.stroke();
    g.beginPath(); g.moveTo(4 * s, -12.5 * s);
    g.lineTo(6.5 * s, -11.5 * s - Math.sin(t * 1.6 + .9) * 2.2 * s); g.stroke();
  } else if (k === 'dewey') { // señala el huerto: "aquí está la lección"
    g.beginPath(); g.moveTo(4 * s, -12.5 * s);
    g.lineTo(4 * s + 4.5 * s + gesto * 2.5 * s, -12.5 * s + 3.5 * s - gesto * 7 * s); g.stroke();
  } else if (k === 'skinner') { // la mano apoyada en su máquina
    g.beginPath(); g.moveTo(4 * s, -12.5 * s); g.lineTo(8.5 * s, -8 * s + Math.sin(t * 1.3) * 0.8 * s); g.stroke();
  } else if (k === 'socrates') { // el dedo que pregunta: sube, espera, baja
    g.beginPath(); g.moveTo(4 * s, -12.5 * s); g.lineTo(7 * s + gesto * 1.5 * s, -14 * s - gesto * 5 * s); g.stroke();
  } else if (k === 'ptahhotep') { // la mano en el bastón, la oreja en el mundo
    g.beginPath(); g.moveTo(4 * s, -12.5 * s); g.lineTo(7.4 * s, -10.5 * s + Math.sin(t * 0.9) * 0.6 * s); g.stroke();
  } else if (k === 'enheduanna') { // sostiene la tablilla de sus himnos
    g.beginPath(); g.moveTo(-4 * s, -12.5 * s); g.lineTo(-2.2 * s, -9.6 * s); g.stroke();
    g.beginPath(); g.moveTo(4 * s, -12.5 * s); g.lineTo(2.2 * s, -9.6 * s); g.stroke();
    g.fillStyle = '#c9a875'; g.fillRect(-3.2 * s, -11.2 * s, 6.4 * s, 4 * s);                       // la tablilla
    g.strokeStyle = '#8a6a4a'; g.lineWidth = 0.55 * s;
    g.beginPath(); g.moveTo(-2.2 * s, -10 * s); g.lineTo(2.2 * s, -10 * s); g.stroke();             // las cuñas
    g.beginPath(); g.moveTo(-2.2 * s, -8.6 * s); g.lineTo(1.2 * s, -8.6 * s); g.stroke();
  } else { // freire conversa con las manos
    g.beginPath(); g.moveTo(-4 * s, -12.5 * s);
    g.lineTo(-7 * s, -10 * s + Math.sin(t * 2.4) * 2 * s); g.stroke();
    g.beginPath(); g.moveTo(4 * s, -12.5 * s);
    g.lineTo(7 * s, -10.5 * s - Math.sin(t * 2.4 + 1) * 2 * s); g.stroke();
  }
  g.restore();
}

/* ---------- pajaritos de patio: picotean y saltan de lugar ---------- */
function drawPajarito(bx, by, ph, t) {
  const reloj = t * 0.5 + ph;
  const ciclo = reloj % 6, spot = ((Math.floor(reloj / 6) % 3) + 3) % 3; // módulo positivo: el 1er frame puede traer t levemente negativo
  const off = [[0, 0], [0.4, 0.18], [0.14, -0.28]][spot];
  const hop = ciclo < 0.5 ? Math.sin(ciclo / 0.5 * Math.PI) * 3.5 : 0;
  const pico = (ciclo > 2.2 && ciclo < 4.6) ? Math.max(0, Math.sin(ciclo * 6.5)) * 2.4 : 0;
  const p = P(bx + off[0], by + off[1]);
  ellipse({ x: p.x, y: p.y }, 3.2 * zoom, 1.4 * zoom, sombraHoy);
  const cy = p.y - 3 * zoom - hop * zoom;
  dot({ x: p.x, y: cy }, 2.5 * zoom, '#8a6f5a');                                                  // cuerpo
  line({ x: p.x - 2.4 * zoom, y: cy - 1 * zoom }, { x: p.x - 4 * zoom, y: cy - 2.2 * zoom }, '#6e5847', 1.2 * zoom); // cola
  dot({ x: p.x + 1.9 * zoom, y: cy - 1.6 * zoom + pico * zoom }, 1.7 * zoom, '#8a6f5a');          // cabeza
  g.beginPath();
  g.moveTo(p.x + 3.4 * zoom, cy - 1.7 * zoom + pico * zoom);
  g.lineTo(p.x + 4.7 * zoom, cy - 1.1 * zoom + pico * zoom);
  g.lineTo(p.x + 3.3 * zoom, cy - 0.9 * zoom + pico * zoom);
  g.closePath(); g.fillStyle = '#d9a53f'; g.fill();                                               // pico
  line({ x: p.x - 0.8 * zoom, y: cy + 2.2 * zoom }, { x: p.x - 0.8 * zoom, y: p.y }, '#4a3a26', 0.9 * zoom);
  line({ x: p.x + 0.8 * zoom, y: cy + 2.2 * zoom }, { x: p.x + 0.8 * zoom, y: p.y }, '#4a3a26', 0.9 * zoom); // patitas
}

/* --- Época 2: la casa de las tablillas --- */
