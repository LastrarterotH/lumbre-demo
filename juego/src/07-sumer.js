/* ============================================================
   07-sumer
   Época 2, Sumer: la edubba, el zigurat, las tablillas, las fichas de arcilla. El demo no lo usa.
   ============================================================ */
/* EL CANDIL DE ACEITE. La velada es del fogón; la noche de la edubba tiene sus lámparas de barro:
   de día son cuencos, y al caer la tarde la llama se enciende con su halo tibio, temblando con el
   mismo pulso doble del fuego del fogón. El brillo escala con la oscuridad (luzDia), así que el
   amanecer las apaga solo. */
function drawLampara(x, y, z, t, ph) {
  const p = P(x, y, z), s = zoom;
  ellipse({ x: p.x, y: p.y }, 2.2 * s, 1.1 * s, '#8a6a4a');                     // el cuenco de barro
  ellipse({ x: p.x - 0.4 * s, y: p.y - 0.5 * s }, 1.1 * s, 0.5 * s, '#a9825c'); // el borde a la luz
  const oscuro = Math.max(0, (0.5 - luzDia()) / 0.5);
  if (oscuro < 0.05) return;
  const tiembla = 0.26 + Math.sin(t * 9 + ph) * 0.05 + Math.sin(t * 23 + ph * 2) * 0.025;
  g.save(); g.globalAlpha = oscuro;
  pintarBrillo(p.x, p.y - 2 * s, 16 * s, tiembla * 2.2, 'brasa'); // el halo, del sprite cacheado (no más gradiente por frame)
  const lame = 1 + Math.sin(t * 7 + ph) * 0.18;                                 // la llama lame el aire
  ellipse({ x: p.x, y: p.y - 2.4 * s * lame }, 0.9 * s, 1.8 * s * lame, '#ffb347');
  ellipse({ x: p.x, y: p.y - 2 * s * lame }, 0.5 * s, 1 * s * lame, '#ffe0a0');
  g.restore();
}
function drawEdubba(t) { // adobe, dintel de madera y el patio que enseña. Y SE CONSTRUYE, no aparece:
  // comprada = la obra (cimientos, adobes apilados, andamio); formándose = paredes sin corona; meseta = completa.
  const x0 = 8, y0 = 5, w = 3, d = 3, s2 = zoom;
  const fase30 = S.tecs[30] ? S.tecs[30].fase : 'sin';
  if (fase30 === 'novedad' || fase30 === 'valle') { // LA OBRA: la casa apenas asoma del suelo
    sombra(x0 + w / 2 + 0.4, y0 + d / 2 + 0.55, 100, 42);
    isoBox(x0, y0, w, d, 9, '#d9b98a', '#c9a875', '#b08a55');            // los cimientos a la rodilla
    for (const [px2, py2, n2] of [[x0 + 0.5, y0 + d + 0.5, 3], [x0 + 2.4, y0 + d + 0.35, 2]]) {
      for (let k = 0; k < n2; k++) { const q = P(px2 + k * 0.06, py2, k * 5); g.fillStyle = k % 2 ? '#c9a875' : '#b99257'; g.fillRect(q.x - 5 * s2, q.y - 4 * s2, 10 * s2, 4 * s2); } // adobes apilados
    }
    const an = P(x0 + 1.5, y0 + d, 0);                                    // el andamio de varas
    line({ x: an.x - 14 * s2, y: an.y }, { x: an.x - 14 * s2, y: an.y - 26 * s2 }, '#8a6a4a', 1.5 * s2);
    line({ x: an.x + 14 * s2, y: an.y }, { x: an.x + 14 * s2, y: an.y - 26 * s2 }, '#8a6a4a', 1.5 * s2);
    line({ x: an.x - 15 * s2, y: an.y - 15 * s2 }, { x: an.x + 15 * s2, y: an.y - 17 * s2 }, '#7a5636', 1.2 * s2);
    return;
  }
  if (fase30 === 'formando') { // LAS PAREDES SUBEN: la caja sin corona ni alero, con el andamio todavía puesto
    sombra(x0 + w / 2 + 0.4, y0 + d / 2 + 0.55, 105, 46);
    isoBox(x0, y0, w, d, 24, '#d9b98a', '#c9a875', '#b08a55');
    poly([P(x0 + 1.1, y0 + d, 0), P(x0 + 1.9, y0 + d, 0), P(x0 + 1.9, y0 + d, 16), P(x0 + 1.1, y0 + d, 16)], '#4a3a28');
    const an = P(x0 + 2.6, y0 + d, 0);
    line({ x: an.x - 3 * s2, y: an.y }, { x: an.x - 3 * s2, y: an.y - 30 * s2 }, '#8a6a4a', 1.5 * s2);
    line({ x: an.x + 9 * s2, y: an.y - 2 * s2 }, { x: an.x + 9 * s2, y: an.y - 30 * s2 }, '#8a6a4a', 1.5 * s2);
    line({ x: an.x - 4 * s2, y: an.y - 18 * s2 }, { x: an.x + 10 * s2, y: an.y - 20 * s2 }, '#7a5636', 1.2 * s2);
    return;
  }
  sombra(x0 + w / 2 + 0.4, y0 + d / 2 + 0.55, 105, 46);
  isoBox(x0, y0, w, d, 34, '#d9b98a', '#c9a875', '#b08a55');
  isoBox(x0 + 0.55, y0 + 0.55, 1.9, 1.9, 50, '#e0c294', '#d0af7c', '#b6905c'); // el piso alto
  for (let k = 0; k < 5; k++) dot(P(x0 + 0.7 + k * 0.4, y0 + 2.45, 53), 1.6 * zoom, '#b6905c'); // el pretil almenado
  for (let zz = 7; zz < 33; zz += 7) { // el adobe se VE: hiladas en las dos caras (la casa era una caja muda)
    line(P(x0 + 0.05, y0 + d, zz), P(x0 + w - 0.05, y0 + d, zz), 'rgba(120,92,60,.20)', 1 * zoom);
    line(P(x0 + w, y0 + 0.05, zz), P(x0 + w, y0 + d - 0.05, zz), 'rgba(100,76,48,.24)', 1 * zoom);
  }
  for (let k = 1; k < 4; k++) { // y los contrafuertes verticales, el idioma del zigurat
    line(P(x0 + (w * k) / 4, y0 + d, 1), P(x0 + (w * k) / 4, y0 + d, 33), 'rgba(150,113,76,.3)', 1.5 * zoom);
    line(P(x0 + w, y0 + (d * k) / 4, 1), P(x0 + w, y0 + (d * k) / 4, 33), 'rgba(120,92,60,.34)', 1.5 * zoom);
  }
  poly([P(x0 + 1.1, y0 + d, 0), P(x0 + 1.9, y0 + d, 0), P(x0 + 1.9, y0 + d, 16), P(x0 + 1.1, y0 + d, 16)], '#4a3a28'); // la puerta, generosa
  line(P(x0 + 1.08, y0 + d, 0.5), P(x0 + 1.08, y0 + d, 16), 'rgba(230,205,160,.5)', 1 * zoom);  // las jambas con su luz
  line(P(x0 + 1.92, y0 + d, 0.5), P(x0 + 1.92, y0 + d, 16), 'rgba(230,205,160,.5)', 1 * zoom);
  line(P(x0 + 1.0, y0 + d, 17), P(x0 + 2.0, y0 + d, 17), '#8a6a4a', 2.4 * zoom);                // el dintel
  poly([P(x0 + 0.92, y0 + d + 0.3, 18.5), P(x0 + 2.08, y0 + d + 0.3, 18.5), P(x0 + 2.08, y0 + d, 21), P(x0 + 0.92, y0 + d, 21)], '#cdb278'); // el alero de caña sobre la puerta
  for (let k = 0; k < 5; k++) line(P(x0 + 1.0 + k * 0.25, y0 + d + 0.28, 18.8), P(x0 + 1.0 + k * 0.25, y0 + d, 20.7), 'rgba(120,88,36,.4)', 0.9 * zoom);
  poly([P(x0 + 0.45, y0 + d, 22), P(x0 + 0.75, y0 + d, 22), P(x0 + 0.75, y0 + d, 27), P(x0 + 0.45, y0 + d, 27)], '#5a4632'); // ventanitas altas
  poly([P(x0 + 2.25, y0 + d, 22), P(x0 + 2.55, y0 + d, 22), P(x0 + 2.55, y0 + d, 27), P(x0 + 2.25, y0 + d, 27)], '#5a4632');
  ellipse(P(x0 + 1.5, y0 + d + 0.55), 12 * zoom, 5 * zoom, 'rgba(214,190,140,.85)'); // la estera de caña
  const pb = P(x0 + 2.35, y0 + d + 0.4);                                             // tablillas apiladas a la entrada
  g.fillStyle = '#c9a875';
  g.fillRect(pb.x - 4 * zoom, pb.y - 2.6 * zoom, 8 * zoom, 2 * zoom);
  g.fillRect(pb.x - 3.4 * zoom, pb.y - 4.6 * zoom, 7 * zoom, 2 * zoom);
  const n30 = nivelTec(30); // MÁXIMA: la escuela crece por etapas (sala → patio techado → el nicho y el asiento)
  if (n30 >= 1) { // LA SALA: las esteras de clase frente a la casa, con su banquito y su jarra (la etapa 1 no dibujaba nada)
    for (const [ex, ey] of [[8.5, 8.35], [9.15, 8.1]]) {
      const e = P(ex, ey);
      sombra(ex, ey + 0.06, 8, 3.2);
      ellipse({ x: e.x, y: e.y }, 7.5 * s2, 3.3 * s2, '#d6be8c');
      g.strokeStyle = 'rgba(150,113,66,.45)'; g.lineWidth = 0.7 * s2;
      for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(e.x + k * 2.6 * s2 - 2 * s2, e.y + 1.4 * s2); g.lineTo(e.x + k * 2.6 * s2 + 2 * s2, e.y - 1.4 * s2); g.stroke(); }
    }
    const bq = P(8.15, 7.85); // el banquito del que enseña
    g.fillStyle = '#8a6a4a'; g.fillRect(bq.x - 2.4 * s2, bq.y - 3.2 * s2, 4.8 * s2, 1.8 * s2);
    line({ x: bq.x - 2 * s2, y: bq.y - 1.6 * s2 }, { x: bq.x - 2 * s2, y: bq.y }, '#7a5636', 1.1 * s2);
    line({ x: bq.x + 2 * s2, y: bq.y - 1.6 * s2 }, { x: bq.x + 2 * s2, y: bq.y }, '#7a5636', 1.1 * s2);
    const ja = P(9.6, 8.5); // la jarra del agua de la sala
    ellipse({ x: ja.x, y: ja.y - 2.2 * s2 }, 2 * s2, 2.6 * s2, '#b08a55');
    ellipse({ x: ja.x, y: ja.y - 4.6 * s2 }, 1.2 * s2, 0.55 * s2, '#8a6a4a');
  }
  if (n30 >= 2) { // el patio techado: postes y techo de caña al frente, y más esteras
    const pa = P(x0 + 0.35, y0 + d + 0.95), pc = P(x0 + 2.65, y0 + d + 0.95);
    line({ x: pa.x, y: pa.y }, { x: pa.x, y: pa.y - 24 * zoom }, '#8a6a4a', 1.8 * zoom);
    line({ x: pc.x, y: pc.y }, { x: pc.x, y: pc.y - 24 * zoom }, '#8a6a4a', 1.8 * zoom);
    poly([P(x0 + 0.2, y0 + d + 1.05, 22), P(x0 + 2.8, y0 + d + 1.05, 22), P(x0 + 2.8, y0 + d - 0.05, 31), P(x0 + 0.2, y0 + d - 0.05, 31)], 'rgba(205,178,120,.92)');
    for (let k = 0; k < 6; k++) line(P(x0 + 0.3 + k * 0.46, y0 + d + 1.0, 22.5), P(x0 + 0.3 + k * 0.46, y0 + d, 30.5), 'rgba(120,88,36,.35)', 0.9 * zoom);
    ellipse(P(x0 + 0.75, y0 + d + 0.7), 8 * zoom, 3.6 * zoom, 'rgba(214,190,140,.8)');
    ellipse(P(x0 + 2.3, y0 + d + 0.75), 8 * zoom, 3.6 * zoom, 'rgba(214,190,140,.8)');
  }
  if (n30 >= 3) { // el nicho de Nisaba en la fachada (la patrona, dorada) y el asiento propio del ummia
    poly([P(x0 + 1.9, y0 + d, 16), P(x0 + 2.45, y0 + d, 16), P(x0 + 2.45, y0 + d, 27), P(x0 + 1.9, y0 + d, 27)], '#5a4632');
    line(P(x0 + 1.88, y0 + d, 16.5), P(x0 + 1.88, y0 + d, 26.5), '#e4b04a', 1 * zoom); // el marco dorado del nicho
    line(P(x0 + 2.47, y0 + d, 16.5), P(x0 + 2.47, y0 + d, 26.5), '#e4b04a', 1 * zoom);
    dot(P(x0 + 2.17, y0 + d, 21.5), 2.3 * zoom, '#e4b04a');
    dot(P(x0 + 2.17, y0 + d, 23.2), 1.3 * zoom, '#f2cf7e'); // la patrona brilla
    const st = P(9.85, 8.55); // el banquito junto a la mesa de copia
    g.fillStyle = '#8a6a4a'; g.fillRect(st.x - 2.2 * zoom, st.y - 3 * zoom, 4.4 * zoom, 1.6 * zoom);
    line({ x: st.x - 1.8 * zoom, y: st.y - 1.6 * zoom }, { x: st.x - 1.8 * zoom, y: st.y }, '#7a5636', 1.1 * zoom);
    line({ x: st.x + 1.8 * zoom, y: st.y - 1.6 * zoom }, { x: st.x + 1.8 * zoom, y: st.y }, '#7a5636', 1.1 * zoom);
  }
}
function drawMesaCopia(t) { // EL CORAZÓN DE LA EDUBBA: el modelo arriba, el intento abajo, y el error que se ve
  const p = P(10.35, 9.0), s = zoom;
  sombra(10.35, 9.1, 9, 3.6);
  ellipse({ x: p.x, y: p.y - 1 * s }, 7.5 * s, 3.4 * s, '#d6be8c');              // la estera
  g.save(); g.translate(p.x, p.y - 4 * s); g.rotate(-0.08);
  g.fillStyle = '#d9c295'; g.fillRect(-4.2 * s, -5.6 * s, 8.4 * s, 4.6 * s);     // la tablilla del maestro, arriba: renglones rectos
  g.strokeStyle = '#7a5636'; g.lineWidth = 0.5 * s; g.lineCap = 'round';
  for (let r = 0; r < 2; r++) { const y = -4.4 * s + r * 1.7 * s; g.beginPath(); g.moveTo(-3.2 * s, y); g.lineTo(3.2 * s, y); g.stroke(); }
  g.fillStyle = '#c9a875'; g.fillRect(-4.2 * s, 0, 8.4 * s, 4.6 * s);            // la del aprendiz, abajo: renglones que tiemblan
  g.strokeStyle = '#8a6a4a'; g.lineWidth = 0.7 * s;
  for (let r = 0; r < 2; r++) { const y = 1.2 * s + r * 1.7 * s; g.beginPath(); g.moveTo(-3.2 * s, y); g.quadraticCurveTo(0, y + 0.7 * s, 3.2 * s, y); g.stroke(); }
  g.restore();
  if ((S.copiasPend || 0) > 0) { // SEÑAL: la cuña torcida late en ocre, pidiendo su espejo
    const pu = 0.5 + 0.5 * Math.sin(t * 4);
    g.save(); g.globalAlpha = 0.4 + 0.45 * pu;
    g.strokeStyle = '#b4552e'; g.lineWidth = 1.2 * s; g.lineCap = 'round';
    g.beginPath(); g.moveTo(p.x + 0.6 * s, p.y - 2 * s); g.lineTo(p.x + 2.6 * s, p.y - 3.4 * s); g.stroke();
    g.restore();
  }
}
/* LAS ETAPAS DEL DICTADO. La auditoría del 2026-08-04 midió 0·0·0 px: perfeccionar solo abría cupo
   de clic y no dibujaba nada. Ahora cada etapa es una pieza del plan: la estera de espera con
   tablillas listas (1), el corro de los que esperan turno (2) y el dictado coral: tres tablillas
   comparadas lado a lado, que es la primera evaluación (3). */
function drawEtapasDictado(t, pieza) {
  const s = zoom;
  if (pieza === 'estera') { // la estera de espera: tablillas frescas listas para la voz
    const e = P(9.45, 9.65);
    sombra(9.45, 9.78, 13, 4.6);
    ellipse({ x: e.x, y: e.y }, 14 * s, 6 * s, '#d6be8c');
    g.strokeStyle = 'rgba(150,113,66,.4)'; g.lineWidth = 0.8 * s;
    for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(e.x + k * 4.6 * s - 3.2 * s, e.y + 2.6 * s); g.lineTo(e.x + k * 4.6 * s + 3.2 * s, e.y - 2.6 * s); g.stroke(); }
    for (let k = 0; k < 4; k++) { g.fillStyle = k % 2 ? '#cdb083' : '#c2a06b'; g.fillRect(e.x - 9 * s + k * 4.8 * s, e.y - 4.4 * s - (k % 2) * 1.4 * s, 4 * s, 6 * s); }
  }
  if (pieza === 'coral') { // el dictado coral: el atril con las TRES tablillas lado a lado (comparar es evaluar)
    const q = P(11.85, 9.85);
    sombra(11.85, 9.95, 9, 3.4);
    line({ x: q.x - 4.6 * s, y: q.y }, { x: q.x - 2 * s, y: q.y - 9 * s }, '#8a6a4a', 1.5 * s);
    line({ x: q.x + 4.6 * s, y: q.y }, { x: q.x + 2 * s, y: q.y - 9 * s }, '#8a6a4a', 1.5 * s);
    line({ x: q.x - 5 * s, y: q.y - 7.6 * s }, { x: q.x + 5 * s, y: q.y - 7.6 * s }, '#7a5636', 1.6 * s);
    for (let k = -1; k <= 1; k++) {
      g.save(); g.translate(q.x + k * 3.6 * s, q.y - 4.4 * s); g.rotate(k * 0.06);
      g.fillStyle = k === 0 ? '#d9c295' : '#c9a875'; g.fillRect(-1.7 * s, -3 * s, 3.4 * s, 6 * s);
      g.strokeStyle = '#7a5636'; g.lineWidth = 0.5 * s;
      for (let r = 0; r < 3; r++) { const y = -1.8 * s + r * 1.7 * s; g.beginPath(); g.moveTo(-1.1 * s, y); g.lineTo(1.1 * s, y); g.stroke(); }
      g.restore();
    }
    dot({ x: q.x, y: q.y - 10.4 * s }, 1.3 * s, '#e4b04a'); // la marca de la casa: se comparó y se aprendió
  }
}
let himnoGlowT = -999; // el último canto de Enheduanna: la estrella del Eanna lo recuerda un rato
function drawAzolve(idx, t) { // el limo que tapa el canal: late pidiendo el brazo
  const [ax, ay] = AZOLVE_SITIOS[idx], p = P(ax, ay, -3), s = zoom;
  ellipse({ x: p.x, y: p.y }, 5.5 * s, 2.6 * s, '#9c8752');                       // la mancha de limo
  ellipse({ x: p.x - 1.5 * s, y: p.y - 0.8 * s }, 2.6 * s, 1.3 * s, '#ab9660');   // su lomo al sol
  for (const [dx, dy2] of [[-3, 0.6], [1.5, 1], [3.4, -0.2]]) dot({ x: p.x + dx * s, y: p.y + dy2 * s }, 1 * s, '#8a7346'); // terrones
  const pu = 0.5 + 0.5 * Math.sin(t * 4 + idx);                                   // el anillo que pide la mano
  g.save(); g.globalAlpha = 0.35 + 0.4 * pu;
  g.strokeStyle = '#ffd24a'; g.lineWidth = 1.3 * s;
  g.beginPath(); g.ellipse(p.x, p.y, (7 + pu * 2.5) * s, (3.2 + pu * 1.1) * s, 0, 0, 7); g.stroke();
  g.restore();
}
/* LA BARCA VIAJERA. El río es la carretera de Sumer: una barca baja con la corriente cargada de
   jarras y vuelve a la pértiga, con su barquero. La amarrada del muelle se queda: esta es su hermana
   trabajadora. Navega sobre la geometría real del río (puntoRio, con su meandro). */
function posBarca(t) {
  const PER = 90, c = ((t / PER) % 1 + 1) % 1;
  if (c < 0.32) { const k = smooth(c / 0.32); return { u: 0.14 + k * 0.68, dir: 1, anda: 1 }; }        // río abajo, con la corriente
  if (c < 0.42) return { u: 0.82, dir: -1, anda: 0 };                                                   // amarra en el sur
  if (c < 0.92) { const k = smooth((c - 0.42) / 0.5); return { u: 0.82 - k * 0.68, dir: -1, anda: 1 }; } // a la pértiga, río arriba
  return { u: 0.14, dir: 1, anda: 0 };                                                                  // el amarre del norte
}
function drawBarcaViajera(t) { // rehecha con la vara de props (2026-08-05: «da pena»): tonos, ataduras, estela, y un barquero de verdad
  const b = posBarca(t), s = zoom;
  const p = puntoRio(b.u, 0.18, -6), bob = Math.sin(t * 1.4) * 1 * s, cabeceo = Math.sin(t * 1.1 + 1) * 0.03;
  if (b.anda) { // LA ESTELA: el agua recuerda por dónde pasó
    g.save(); g.strokeStyle = 'rgba(240,250,255,.4)'; g.lineCap = 'round';
    for (let k = 1; k <= 3; k++) {
      const uAtras = b.u - b.dir * 0.012 * k, q = puntoRio(uAtras, 0.18, -6);
      g.globalAlpha = 0.4 - k * 0.11; g.lineWidth = (1.6 - k * 0.35) * s;
      g.beginPath(); g.ellipse(q.x, q.y + 1 * s, (5 + k * 3.5) * s, (1.6 + k * 1.1) * s, 0, 0, 7); g.stroke();
    }
    g.restore();
  }
  g.save(); g.translate(p.x, p.y + bob); g.rotate(cabeceo); if (b.dir < 0) g.scale(-1, 1);
  ellipse({ x: 0, y: 1.6 * s }, 12 * s, 2.6 * s, 'rgba(30,60,80,.25)');          // su sombra en el agua
  g.fillStyle = '#b5a468';                                                        // el interior del casco
  g.beginPath(); g.moveTo(-9 * s, -2.6 * s); g.quadraticCurveTo(0, -0.4 * s, 9 * s, -2.6 * s);
  g.quadraticCurveTo(0, -4.4 * s, -9 * s, -2.6 * s); g.closePath(); g.fill();
  g.fillStyle = '#c9b878';                                                        // el casco de junco
  g.beginPath(); g.moveTo(-9 * s, -1.5 * s);
  g.quadraticCurveTo(0, 1.8 * s, 9 * s, -1.5 * s);
  g.quadraticCurveTo(11 * s, -3.4 * s, 11.6 * s, -6.5 * s);
  g.lineTo(9.2 * s, -2.8 * s);
  g.quadraticCurveTo(0, -0.5 * s, -9.2 * s, -2.8 * s);
  g.lineTo(-11.6 * s, -6.5 * s);
  g.quadraticCurveTo(-11 * s, -3.4 * s, -9 * s, -1.5 * s);
  g.closePath(); g.fill();
  g.fillStyle = 'rgba(255,244,214,.28)';                                          // la luz del sol sobre el junco
  g.beginPath(); g.moveTo(-9 * s, -1.8 * s); g.quadraticCurveTo(0, 0.9 * s, 9 * s, -1.8 * s);
  g.quadraticCurveTo(0, -0.2 * s, -9 * s, -1.8 * s); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(122,86,54,.55)'; g.lineWidth = 0.6 * s;                   // las hebras del junco, a lo largo
  for (const hy of [-1.1, -2.1]) { g.beginPath(); g.moveTo(-8.5 * s, hy * s); g.quadraticCurveTo(0, (hy + 2.6) * s, 8.5 * s, hy * s); g.stroke(); }
  g.strokeStyle = '#8a7346'; g.lineWidth = 0.9 * s;
  for (const ax of [-6, -2, 2, 6]) { g.beginPath(); g.moveTo(ax * s, -2.8 * s); g.lineTo(ax * s, 0.8 * s); g.stroke(); } // las ataduras
  dot({ x: -11.6 * s, y: -6.5 * s }, 1 * s, '#a8935a'); dot({ x: 11.6 * s, y: -6.5 * s }, 1 * s, '#a8935a'); // los nudos de proa y popa
  for (const [jx, jr] of [[-5, 2.1], [-1.2, 1.7]]) {                              // la carga: jarras del templo
    ellipse({ x: jx * s, y: -4.2 * s }, jr * s, jr * 1.3 * s, '#b08a55');
    ellipse({ x: (jx - jr * 0.35) * s, y: (-4.2 - jr * 0.4) * s }, jr * 0.4 * s, jr * 0.7 * s, '#c9a875'); // su luz
    ellipse({ x: jx * s, y: (-4.2 - jr * 1.3) * s }, jr * 0.55 * s, 0.5 * s, '#8a6a4a');
  }
  const lean = b.anda ? (b.dir < 0 ? Math.sin(t * 2.2) * 0.16 : Math.sin(t * 1.3) * 0.05) : 0; // empuja a la pértiga; a favor, apenas corrige
  g.save(); g.translate(5.2 * s, -2.6 * s); g.rotate(lean); g.scale(0.72, 0.72);  // EL BARQUERO, de cuerpo entero
  drawAlumno(0, 0, 1, 0, 2);
  g.restore();
  g.strokeStyle = '#7a5636'; g.lineWidth = 1.2 * s; g.lineCap = 'round';          // la pértiga, de la mano al agua
  g.beginPath(); g.moveTo(7.6 * s + lean * 8 * s, -9 * s); g.lineTo(10.5 * s + lean * 26 * s, 4 * s); g.stroke();
  if (b.anda && b.dir < 0) { // el remolino del empujón
    const rem = Math.max(0, Math.sin(t * 2.2));
    g.save(); g.globalAlpha = rem * 0.5; g.strokeStyle = 'rgba(235,250,255,.9)'; g.lineWidth = 0.9 * s;
    g.beginPath(); g.ellipse(10.5 * s + lean * 26 * s, 4.5 * s, 3 * s, 1.2 * s, 0, 0, 7); g.stroke();
    g.restore();
  }
  g.restore();
}
/* LOS SEGADORES DEL TEMPLO. El campo que paga la escuela no trabaja solo: dos segadores se inclinan
   y juntan la cebada, con el mismo gesto de la recolectora del clan (la continuidad es la gracia). */
function drawSegador(x, y, ph, t) {
  const s = zoom, dip = Math.max(0, Math.sin(t * 1.1 + ph)) * 5 * s, scr = P(x, y);
  const ex = scr.x + 7.5 * s;
  g.strokeStyle = '#c9a94a'; g.lineWidth = 1.1 * s; g.lineCap = 'round';         // las espigas por segar
  for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(ex + k * 2.2 * s, scr.y); g.lineTo(ex + k * 2.8 * s, scr.y - 6 * s); g.stroke(); }
  dot({ x: ex, y: scr.y - 6 * s }, 1 * s, '#e5cb74'); dot({ x: ex + 2.6 * s, y: scr.y - 5.4 * s }, 0.9 * s, '#e5cb74');
  drawAlumno(scr.x, scr.y + dip, 1, t * 0.3 + ph, (ph | 0) + 1);
}
/* EL ACARREO CON SENTIDO: del taller al horno. La tablilla escrita se lleva a cocer, y el ciclo del
   barro se CUENTA caminando (2026-08-04, del ojo del jugador: el paseo con la tablilla no contaba
   nada). Con el horno encendido (etapa 3 de la tablilla), la acarreadora hace su circuito: recoge en
   la mesa, la deja en el horno, y vuelve por más. */
function posAcarreoT(t) {
  const PER = 26, c = ((t / PER) % 1 + 1) % 1;
  const A = { x: 11.65, y: 6.35 }, B = { x: 12.5, y: 7.05 };  // la mesa del taller y la boca del horno
  if (c < 0.12) return { ...A, dir: 1, anda: 0, carga: 1 };                        // recoge la tablilla
  if (c < 0.36) { const k = smooth((c - 0.12) / 0.24); return { x: A.x + (B.x - A.x) * k, y: A.y + (B.y - A.y) * k, dir: 1, anda: 1, carga: 1 }; }
  if (c < 0.52) return { ...B, dir: 1, anda: 0, carga: 0 };                        // la deja cociendo
  if (c < 0.76) { const k = smooth((c - 0.52) / 0.24); return { x: B.x + (A.x - B.x) * k, y: B.y + (A.y - B.y) * k, dir: -1, anda: 1, carga: 0 }; }
  return { ...A, dir: -1, anda: 0, carga: 0 };                                     // respira junto a la mesa
}
function drawAcarreoT(t) {
  const o = posAcarreoT(t), p = P(o.x, o.y), s = zoom;
  drawAlumno(p.x, p.y, o.dir, o.anda ? t * 5.6 : 0, 1);
  if (o.carga) { // la tablilla fresca, en las manos
    g.save(); g.translate(p.x + o.dir * 5 * s, p.y - 12 * s); g.rotate(o.dir * 0.15);
    g.fillStyle = '#cdb083'; g.fillRect(-2.6 * s, -1.8 * s, 5.2 * s, 3.6 * s);
    g.strokeStyle = '#8a6a4a'; g.lineWidth = 0.5 * s;
    g.beginPath(); g.moveTo(-1.6 * s, 0); g.lineTo(1.6 * s, 0); g.stroke();
    g.restore();
  }
}
/* LA VIDA DEL TEMPLO (2026-08-04, del ojo del jugador: «hay un gran templo y nadie va»). Un oferente
   sube la escalinata con su jarra cada ~46 s, deja la ofrenda en la cima, y baja; arriba, el
   sacerdote atiende el brasero cuyo humo sube en hebras. La ciudad por fin le reza a su montaña. */
function posOferente(t) { // POR LA ESCALINATA DE VERDAD: la rampa del frente sube a la terraza 1; de ahí,
  // el portal interior (desaparece dentro del templo) y reaparece en la corona ante el santuario.
  const PER = 52, c = ((t / PER) % 1 + 1) % 1;
  const IDA = [[9.3, 9.35], [7.6, 7.7], [6.0, 6.85]];   // de la plaza al pie de la rampa (cx=6, yF+1.8)
  const seg = (pts, f) => { const n = pts.length - 1, u = Math.min(n - 1e-6, f * n), i = Math.floor(u), k = u - i;
    return { x: pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, y: pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k }; };
  if (c < 0.18) { const q = seg(IDA, c / 0.18); return { ...q, z: 0, dir: -1, anda: 1, ofrenda: 0, alpha: 1 }; }
  if (c < 0.32) { const k = (c - 0.18) / 0.14; return { x: 6.0, y: 6.85 - k * 1.85, z: k * 32, dir: -1, anda: 1, ofrenda: 0, alpha: 1 }; } // los peldaños de la rampa
  if (c < 0.38) { const k = (c - 0.32) / 0.06; return { x: 6.0, y: 5.0 - k * 0.42, z: 32, dir: -1, anda: 1, ofrenda: 0, alpha: 1 - Math.max(0, k - 0.6) / 0.4 }; } // entra al portal
  if (c < 0.46) return { x: 6.0, y: 4.2, z: 55, dir: -1, anda: 0, ofrenda: 0, alpha: 0 };  // la escalera interior
  if (c < 0.62) { const k = (c - 0.46) / 0.16; return { x: 6.0, y: 4.15, z: 78, dir: -1, anda: 0, ofrenda: Math.min(1, k * 1.6), alpha: Math.min(1, k * 5) }; } // ante el santuario: la ofrenda
  if (c < 0.70) return { x: 6.0, y: 4.2, z: 55, dir: 1, anda: 0, ofrenda: 0, alpha: 0 };   // baja por dentro
  if (c < 0.78) { const k = (c - 0.70) / 0.08; return { x: 6.0, y: 4.58 + k * 0.42, z: 32, dir: 1, anda: 1, ofrenda: 0, alpha: Math.min(1, k * 4) }; } // sale del portal
  if (c < 0.90) { const k = (c - 0.78) / 0.12; return { x: 6.0, y: 5.0 + k * 1.85, z: (1 - k) * 32, dir: 1, anda: 1, ofrenda: 0, alpha: 1 }; } // baja la rampa
  const q = seg([...IDA].reverse(), (c - 0.90) / 0.10); return { ...q, z: 0, dir: 1, anda: 1, ofrenda: 0, alpha: 1 }; // a casa, con las manos vacías
}
function drawOferente(t) {
  const o = posOferente(t), p = P(o.x, o.y, o.z), s = zoom;
  if ((o.alpha || 0) < 0.02) return;                               // dentro del templo no se le ve
  const esc = 1 - (o.z / 78) * 0.15; // arriba se ve un pelín menor: la montaña es grande
  g.save(); g.globalAlpha *= o.alpha;
  g.translate(p.x, p.y); g.scale(esc, esc); g.translate(-p.x, -p.y);
  drawAlumno(p.x, p.y, o.dir, o.anda ? t * 5.2 : 0, 2);
  const alza = o.ofrenda ? Math.sin(Math.min(1, o.ofrenda * 2) * Math.PI) : 0; // la jarra se alza al ofrendar
  const jx = p.x + o.dir * 4 * s, jy = p.y - (22 + alza * 6) * s;
  ellipse({ x: jx, y: jy }, 2.2 * s, 2.8 * s, '#b08a55');
  ellipse({ x: jx, y: jy - 2.6 * s }, 1.3 * s, 0.6 * s, '#8a6a4a');
  g.restore();
}
function drawVidaTemplo(t) { // la corona ya tiene su santuario y su llama sagrada (drawGranZigurat): aquí vive la GENTE
  const s = zoom, llama = P(6.0, 3.35, 89);
  for (let k = 0; k < 3; k++) { // el humo de la ofrenda sube DESDE la llama sagrada, en hebras que el viento se lleva
    const f = (t * 0.14 + k * 0.33) % 1;
    g.save(); g.globalAlpha = 0.28 * (1 - f);
    dot({ x: llama.x + Math.sin(t * 0.9 + k * 2.1) * 3 * s + f * 7 * s, y: llama.y - 4 * s - f * 30 * s }, (2 + f * 6) * s, '#e8e2d4');
    g.restore();
  }
  g.save(); g.translate(0, -78 * zoom); // el sacerdote vive en la corona, ante la puerta del Eanna
  drawSentadito(5.62, 4.02, 0, t, { lado: 1, ritmo: 0.8, ph: 1 });
  g.restore();
}
function drawZigurat(t) { // el zigurat al fondo: la ciudad reza y cuenta
  sombra(17.9, 3.0, 62, 24);
  isoBox(17.0, 1.8, 1.9, 1.9, 20, '#d9b98a', '#c9a875', '#b08a55');
  isoBox(17.3, 2.1, 1.3, 1.3, 34, '#e0c294', '#d0af7c', '#b6905c');
  isoBox(17.55, 2.35, 0.8, 0.8, 46, '#e8cea2', '#d9b98a', '#c09565');
  line(P(18.35, 3.7, 0), P(18.2, 3.2, 20), '#b08a55', 2.2 * zoom); // la escalinata
  line(P(18.2, 3.2, 20), P(18.1, 2.9, 34), '#b08a55', 1.8 * zoom);
  const bp = P(17.95, 2.75, 48), sz = zoom;                        // el fuego del templo, siempre encendido
  g.fillStyle = '#8a6a4a'; g.fillRect(bp.x - 1.7 * sz, bp.y - 1 * sz, 3.4 * sz, 2 * sz);
  const fl = 1 + Math.sin(t * 7) * 0.3;
  poly([{ x: bp.x - 1.3 * sz, y: bp.y - 1 * sz }, { x: bp.x + Math.sin(t * 5) * 0.5 * sz, y: bp.y - 5 * fl * sz }, { x: bp.x + 1.3 * sz, y: bp.y - 1 * sz }], '#e8a51e');
  dot({ x: bp.x, y: bp.y - 2 * sz }, 0.9 * sz, '#fff0b0');
}
function drawPalmera(x, y, ph, t) { // la datilera de la ribera
  sombra(x + 0.1, y + 0.12, 14, 5);
  const p = P(x, y), s = zoom, sway = Math.sin(t * 0.7 + ph) * 1.5 * s;
  g.strokeStyle = '#8a6a4a'; g.lineWidth = 2.6 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(p.x, p.y);
  g.quadraticCurveTo(p.x + 2 * s, p.y - 18 * s, p.x + 4 * s + sway, p.y - 34 * s); g.stroke();
  g.strokeStyle = 'rgba(90,70,50,.5)'; g.lineWidth = 0.8 * s;
  for (let k = 1; k <= 4; k++) { // los anillos del tronco
    const ty = p.y - k * 6.5 * s, tx = p.x + (k * k * 0.16 + 0.5) * s;
    g.beginPath(); g.moveTo(tx - 1.2 * s, ty); g.lineTo(tx + 1.6 * s, ty); g.stroke();
  }
  const cx = p.x + 4 * s + sway, cy = p.y - 34 * s;
  g.strokeStyle = '#5f8c3e'; g.lineWidth = 1.8 * s;
  for (let k = 0; k < 6; k++) { // la corona de palmas
    const a = -Math.PI * (0.1 + k * 0.16), lx = Math.cos(a) * 12 * s, ly = Math.sin(a) * 9 * s;
    g.beginPath(); g.moveTo(cx, cy);
    g.quadraticCurveTo(cx + lx * 0.6, cy + ly - 3 * s, cx + lx, cy + ly + 4 * s); g.stroke();
  }
  dot({ x: cx - 1.5 * s, y: cy + 2.5 * s }, 1.9 * s, '#d9a53f'); // el racimo de dátiles
  dot({ x: cx + 0.5 * s, y: cy + 3 * s }, 1.6 * s, '#c98a2e');
}
function drawVasijas(x, y) { // las ánforas del patio
  const p = P(x, y), s = zoom;
  sombra(x, y + 0.08, 9, 3.6);
  g.fillStyle = '#b08a55';
  g.beginPath(); g.ellipse(p.x - 2.2 * s, p.y - 3 * s, 2.6 * s, 3.6 * s, 0, 0, 7); g.fill();
  g.fillStyle = '#c9a875';
  g.beginPath(); g.ellipse(p.x + 2.4 * s, p.y - 2.4 * s, 2.1 * s, 3 * s, 0, 0, 7); g.fill();
  ellipse({ x: p.x - 2.2 * s, y: p.y - 6.6 * s }, 1.5 * s, 0.7 * s, '#8a6a4a');
  ellipse({ x: p.x + 2.4 * s, y: p.y - 5.4 * s }, 1.3 * s, 0.6 * s, '#8a6a4a');
  const nV = nivelTec(26);                                   // el alfar produce más y mejor
  if (nV >= 1) { // una tercera pieza, la más alta
    nacerEn('vasija3', e => {
    g.fillStyle = '#bb9560';
    g.beginPath(); g.ellipse(p.x + 6.6 * s, p.y - 5 * s * e, 3.4 * s * e, 6 * s * e, 0, 0, 7); g.fill();
    g.fillRect(p.x + 5.4 * s, p.y - 12.4 * s * e, 2.4 * s * e, 3.4 * s * e);            // el cuello alto
    ellipse({ x: p.x + 6.6 * s, y: p.y - 12.6 * s * e }, 2.1 * s * e, 1 * s * e, '#8a6a4a');
    g.strokeStyle = '#9a7a52'; g.lineWidth = 1.1 * s;                                    // el asa
    g.beginPath(); g.arc(p.x + 9.6 * s, p.y - 8 * s * e, 2.2 * s * e, -1.2, 1.2); g.stroke();
  });
  }
  if (nV >= 2) { // la decoración pintada: cada vasija lleva la marca de quien la hizo
    nacerEn('bandaVasija', e => {
      g.strokeStyle = '#a24e30'; g.lineWidth = 1.6 * s * e;
      for (const [cx, cy, an] of [[-2.2, -4.2, 2.4], [2.4, -3.4, 1.9], [6, -4.6, 2.1]]) {
        g.beginPath(); g.moveTo(p.x + (cx - an) * s, p.y + cy * s); g.lineTo(p.x + (cx + an) * s, p.y + cy * s); g.stroke();
        g.beginPath(); g.moveTo(p.x + (cx - an * 0.85) * s, p.y + (cy + 2.4) * s); g.lineTo(p.x + (cx + an * 0.85) * s, p.y + (cy + 2.4) * s); g.stroke();
      }
      g.lineWidth = 0.9 * s * e;                                     // el zigzag entre bandas: el motivo del alfar
      for (const [cx, cy, an] of [[-2.2, -3, 2.2], [2.4, -2.2, 1.7]]) {
        g.beginPath();
        for (let k = 0; k <= 4; k++) g.lineTo(p.x + (cx - an + an * k / 2) * s, p.y + (cy + (k % 2 ? 0.9 : 0)) * s);
        g.stroke();
      }
    });
  }
  if (nV >= 3) { // LA TINAJA: el excedente ya no cabe en cuencos, hay que guardarlo en grande
    nacerEn('tinaja', e => {
      const th = 9 * s * e;
      g.fillStyle = '#a87f4e';
      g.beginPath(); g.ellipse(p.x - 8 * s, p.y - th * 0.55, 4.4 * s, th * 0.72, 0, 0, 7); g.fill();
      ellipse({ x: p.x - 8 * s, y: p.y - th * 1.24 }, 2.6 * s, 1.2 * s, '#7d5c37');   // la boca ancha
      g.strokeStyle = '#a24e30'; g.lineWidth = 1.1 * s;                                // su banda pintada
      g.beginPath(); g.moveTo(p.x - 11.6 * s, p.y - th * 0.72); g.lineTo(p.x - 4.4 * s, p.y - th * 0.72); g.stroke();
      g.save(); g.globalAlpha = 0.5 * e;                                                // y el vidriado del fuego
      ellipse({ x: p.x - 9.6 * s, y: p.y - th * 0.7 }, 0.9 * s, 2.2 * s, '#fff2d8');
      g.restore();
    });
  }
}
function drawMesaTablillas(t) { // el aparato: la tablilla de arcilla
  const p = P(11.3, 6.3), s = zoom;
  sombra(11.3, 6.42, 12, 4.5);
  ellipse({ x: p.x, y: p.y - 1 * s }, 9 * s, 4 * s, '#d6be8c');        // la estera
  g.fillStyle = '#c9a875';
  g.fillRect(p.x - 5.5 * s, p.y - 5.5 * s, 7 * s, 4 * s);              // la tablilla grande
  g.fillRect(p.x + 0.5 * s, p.y - 4 * s, 5 * s, 3 * s);                // la chica
  g.strokeStyle = '#8a6a4a'; g.lineWidth = 0.6 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(p.x - 4.5 * s, p.y - 4.4 * s); g.lineTo(p.x - 0.5 * s, p.y - 4.4 * s); g.stroke();
  g.beginPath(); g.moveTo(p.x - 4.5 * s, p.y - 3 * s); g.lineTo(p.x - 1.5 * s, p.y - 3 * s); g.stroke();
  const n16 = nivelTec(16); // MÁXIMA: cada etapa se ve: el tendal, el canasto, el horno
  if (n16 >= 1) { // el tendal: tablillas frescas secándose al sol, apoyadas de canto
    const a = P(11.95, 5.85);
    line({ x: a.x - 8 * s, y: a.y }, { x: a.x - 8 * s, y: a.y - 7 * s }, '#8a6a4a', 1.6 * s);
    line({ x: a.x + 8 * s, y: a.y }, { x: a.x + 8 * s, y: a.y - 7 * s }, '#8a6a4a', 1.6 * s);
    line({ x: a.x - 8 * s, y: a.y - 6 * s }, { x: a.x + 8 * s, y: a.y - 6 * s }, '#7a5636', 1.2 * s);
    for (let k = 0; k < 3; k++) {
      g.save(); g.translate(a.x + (k - 1) * 5 * s, a.y - 2.4 * s); g.rotate(-0.18);
      g.fillStyle = k % 2 ? '#cdb083' : '#c2a06b'; g.fillRect(-2.6 * s, -3.4 * s, 5.2 * s, 6.8 * s);
      g.fillStyle = 'rgba(255,240,210,.25)'; g.fillRect(-2.6 * s, -3.4 * s, 5.2 * s, 1.2 * s);
      g.restore();
    }
  }
  if (n16 >= 2) { // el canasto: la provisión del taller, con cuerpo (la etapa se ve de lejos)
    const c = P(10.65, 5.95);
    sombra(10.65, 6.05, 9, 3.4);
    ellipse({ x: c.x, y: c.y }, 6.2 * s, 2.6 * s, '#a8834f');
    g.fillStyle = '#b99257'; g.fillRect(c.x - 6.2 * s, c.y - 6 * s, 12.4 * s, 6 * s);
    ellipse({ x: c.x, y: c.y - 6 * s }, 6.2 * s, 2.6 * s, '#8a6a3e');
    g.strokeStyle = 'rgba(90,66,40,.5)'; g.lineWidth = 0.9 * s;
    for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(c.x - 6.2 * s, c.y - 1.2 * s - k * 1.4 * s); g.lineTo(c.x + 6.2 * s, c.y - 1.2 * s - k * 1.4 * s); g.stroke(); }
    for (let k = 0; k < 3; k++) { g.fillStyle = k % 2 ? '#cdb083' : '#c2a06b'; g.fillRect(c.x - 3.6 * s + k * 1.2 * s, c.y - (8.6 + k * 0.9) * s, 6 * s, 2.6 * s); } // la pila asomando
    const pl = P(11.55, 6.35); // y la pila del suelo, junto al canasto
    for (let k = 0; k < 3; k++) { g.fillStyle = k % 2 ? '#c2a06b' : '#cdb083'; g.fillRect(pl.x - 3.2 * s, pl.y - 2 * s - k * 2 * s, 6.4 * s, 2 * s); }
  }
  if (n16 >= 3) { // el horno de cocción: lo escrito ya no teme la lluvia
    const h = P(12.2, 6.9);
    sombra(12.2, 7.02, 8, 3.2);
    dot({ x: h.x, y: h.y - 4 * s }, 6.2 * s, '#b98a5c');                 // el domo
    dot({ x: h.x - 1.6 * s, y: h.y - 5.6 * s }, 3 * s, '#cba26e');       // su luz
    g.fillStyle = '#3a2a1c';                                              // la boca
    g.beginPath(); g.moveTo(h.x - 2.2 * s, h.y); g.quadraticCurveTo(h.x, h.y - 5 * s, h.x + 2.2 * s, h.y); g.closePath(); g.fill();
    const brilla = 0.35 + 0.25 * Math.sin(t * 5);                         // la brasa de adentro respira
    g.save(); g.globalAlpha = brilla; dot({ x: h.x, y: h.y - 1.4 * s }, 1.6 * s, '#ff9d3a'); g.restore();
  }
  estadoTec(16, { x: p.x, y: p.y - 16 * s }, t);
}
function drawCanas(t) { // el cálamo: la vasija con cañas cortadas
  const p = P(10.2, 7.9), s = zoom;
  sombra(10.2, 8.0, 8, 3.4);
  g.fillStyle = '#b08a55';
  g.beginPath(); g.ellipse(p.x, p.y - 3 * s, 4 * s, 4.6 * s, 0, 0, 7); g.fill();
  ellipse({ x: p.x, y: p.y - 7.2 * s }, 3 * s, 1.2 * s, '#8a6a4a');
  g.strokeStyle = '#bcbd6d'; g.lineWidth = 1 * s; g.lineCap = 'round';
  for (let k = -2; k <= 2; k++) {
    g.beginPath(); g.moveTo(p.x + k * 1.2 * s, p.y - 7 * s);
    g.lineTo(p.x + k * 2 * s, p.y - (13 + Math.abs(k)) * s); g.stroke();
  }
  const n17 = nivelTec(17); // MÁXIMA: la mano que mejora SE VE en los renglones de práctica
  const renglones = (cx, cy, tiemblo, grosor, esc) => { // una tablilla DE CANTO en su apoyo, con su letra de ese nivel
    const e = esc || 1;
    line({ x: cx - 4.5 * s * e, y: cy + 1.5 * s }, { x: cx, y: cy - 8 * s * e }, '#8a6a4a', 1.2 * s); // el apoyo
    g.save(); g.translate(cx, cy - 4.5 * s * e); g.rotate(-0.1);
    g.fillStyle = '#cdb083'; g.fillRect(-5.5 * s * e, -4.5 * s * e, 11 * s * e, 9 * s * e);
    g.fillStyle = 'rgba(255,240,210,.22)'; g.fillRect(-5.5 * s * e, -4.5 * s * e, 11 * s * e, 1.6 * s * e);
    g.strokeStyle = '#8a6a4a'; g.lineWidth = grosor * s * 1.2; g.lineCap = 'round';
    for (let r = 0; r < 3; r++) {
      const y = -2.4 * s * e + r * 2.5 * s * e;
      g.beginPath(); g.moveTo(-4 * s * e, y);
      g.quadraticCurveTo(0, y + tiemblo * 1.5 * s * (r % 2 ? 1 : -1), 4 * s * e, y);
      g.stroke();
    }
    g.restore();
  };
  if (n17 >= 1) { const a = P(11.35, 8.05); renglones(a.x, a.y, 1.1, 1.1, 1.7); }  // cuñas torcidas y gordas, bien visibles
  if (n17 >= 2) { const b = P(9.3, 8.85); renglones(b.x, b.y, 0.25, 0.8, 1.8); // renglones casi rectos…
    const f = P(9.75, 7.35); // …y la fila de tablillas terminadas, secándose de canto contra la vasija
    for (let k = 0; k < 3; k++) {
      g.save(); g.translate(f.x + k * 4.6 * s, f.y - k * 0.8 * s); g.rotate(-0.32);
      g.fillStyle = k % 2 ? '#c2a06b' : '#cdb083'; g.fillRect(-3.1 * s, -5 * s, 6.2 * s, 10 * s);
      g.fillStyle = 'rgba(255,240,210,.22)'; g.fillRect(-3.1 * s, -5 * s, 6.2 * s, 1.4 * s);
      g.restore();
    }
  }
  if (n17 >= 3) { // la mano fina: la mejor tablilla se EXPONE en su atril de varas, en grande
    const e = P(10.8, 7.25);
    line({ x: e.x - 3.6 * s, y: e.y }, { x: e.x, y: e.y - 11 * s }, '#8a6a4a', 1.6 * s);
    line({ x: e.x + 3.6 * s, y: e.y }, { x: e.x, y: e.y - 11 * s }, '#8a6a4a', 1.6 * s);
    g.save(); g.translate(e.x, e.y - 7.4 * s); g.rotate(-0.06);
    g.fillStyle = '#d9c295'; g.fillRect(-4.8 * s, -6 * s, 9.6 * s, 11 * s);
    g.fillStyle = 'rgba(255,244,214,.3)'; g.fillRect(-4.8 * s, -6 * s, 9.6 * s, 1.8 * s);
    g.strokeStyle = '#7a5636'; g.lineWidth = 0.55 * s;
    for (let r = 0; r < 5; r++) { const y = -4.2 * s + r * 2.2 * s; g.beginPath(); g.moveTo(-3.4 * s, y); g.lineTo(3.4 * s, y); g.stroke(); }
    g.restore();
    dot({ x: e.x + 5.5 * s, y: e.y - 1 * s }, 1.4 * s, '#e4b04a'); // la marquita de orgullo del taller
  }
  estadoTec(17, { x: p.x, y: p.y - 20 * s }, t);
}
function drawFichasArcilla(t) { // los cálculos: fichas y la esfera sellada
  const p = P(12.4, 8.8), s = zoom;
  sombra(12.4, 8.9, 10, 4);
  ellipse({ x: p.x, y: p.y - 1 * s }, 8 * s, 3.6 * s, '#d6be8c');
  dot({ x: p.x - 3 * s, y: p.y - 2.4 * s }, 1.2 * s, '#b08a55');
  dot({ x: p.x - 0.8 * s, y: p.y - 3 * s }, 1.2 * s, '#c9a875');
  dot({ x: p.x + 1.4 * s, y: p.y - 2.2 * s }, 1.2 * s, '#b08a55');
  dot({ x: p.x + 4 * s, y: p.y - 3.6 * s }, 2.6 * s, '#c9a875');       // la bulla
  g.strokeStyle = '#8a6a4a'; g.lineWidth = 0.6 * s;
  g.beginPath(); g.arc(p.x + 4 * s, p.y - 3.6 * s, 2.6 * s, 0, 7); g.stroke();
  const n18 = nivelTec(18); // MÁXIMA: cuenco → bullae selladas → la tablilla numérica (la abstracción, dibujada)
  if (n18 >= 1) { // el cuenco propio, colmado de fichas, con su montoncito al lado
    const c = { x: p.x - 10 * s, y: p.y - 5.4 * s };
    sombra(12.4 - 0.34, 8.8 + 0.06, 10, 3.6);
    ellipse({ x: c.x, y: c.y + 4 * s }, 9 * s, 4 * s, '#8a6a3e');
    g.fillStyle = '#a8834f'; g.beginPath(); g.ellipse(c.x, c.y + 1.6 * s, 9 * s, 5.6 * s, 0, 0, Math.PI); g.fill();
    ellipse({ x: c.x - 3 * s, y: c.y + 2.2 * s }, 3 * s, 1.8 * s, '#b8945c'); // la luz del cuenco
    for (const [dx, dy] of [[-4.6, -0.9], [-1.6, -2.4], [1.6, -1.7], [4.2, -0.8], [0, -0.3], [-3, 0.4], [3, 0.5], [1.2, 1.2]]) dot({ x: c.x + dx * s, y: c.y + dy * s }, 2.2 * s, '#c9a875');
    for (const [dx, dy] of [[-14, 5.6], [-11.6, 7.0], [-15.4, 7.4], [-12.6, 8.4], [-16.6, 6.2]]) dot({ x: p.x + dx * s, y: p.y + dy * s }, 1.9 * s, '#b08a55'); // las que esperan cuenta
  }
  if (n18 >= 2) { // las bullae selladas, con presencia: la cuenta que obliga
    for (const [dx, dy, r] of [[10.0, -1.8, 5.6], [7.6, -8.6, 4.6], [13.2, -6.4, 4.0]]) {
      const b = { x: p.x + dx * s, y: p.y + dy * s };
      dot(b, r * s, '#bfa06a');
      dot({ x: b.x - r * 0.3 * s, y: b.y - r * 0.35 * s }, r * 0.4 * s, '#d0b47c'); // la luz del barro
      g.strokeStyle = '#7a5636'; g.lineWidth = 0.7 * s;
      g.beginPath(); g.moveTo(b.x - r * 0.6 * s, b.y - r * 0.4 * s); g.lineTo(b.x + r * 0.6 * s, b.y + r * 0.4 * s); g.stroke();
      g.beginPath(); g.moveTo(b.x - r * 0.6 * s, b.y + r * 0.4 * s); g.lineTo(b.x + r * 0.6 * s, b.y - r * 0.4 * s); g.stroke();
    }
  }
  if (n18 >= 3) { // la tablilla numérica en su atril: el signo reemplazó a la ficha (la abstracción, en grande)
    const q = { x: p.x - 1.5 * s, y: p.y - 12 * s };
    line({ x: q.x - 5 * s, y: q.y + 6.5 * s }, { x: q.x - 1.4 * s, y: q.y - 4.5 * s }, '#8a6a4a', 1.6 * s);
    line({ x: q.x + 5 * s, y: q.y + 6.5 * s }, { x: q.x + 1.4 * s, y: q.y - 4.5 * s }, '#8a6a4a', 1.6 * s);
    g.save(); g.translate(q.x, q.y); g.rotate(-0.1);
    g.fillStyle = '#d9c295'; g.fillRect(-8.5 * s, -6 * s, 17 * s, 12 * s);
    g.fillStyle = 'rgba(255,244,214,.3)'; g.fillRect(-8.5 * s, -6 * s, 17 * s, 2.2 * s);
    g.fillStyle = '#8a6a4a';
    for (let f = 0; f < 2; f++) for (let cch = 0; cch < 6; cch++) g.fillRect(-6.8 * s + cch * 2.4 * s, -3.6 * s + f * 4.2 * s, 1.4 * s, 2.4 * s);
    g.restore();
  }
  estadoTec(18, { x: p.x, y: p.y - 14 * s }, t);
}
function drawEstela(t) { // las listas: el plan de estudios en piedra
  const p = P(8.6, 9.4), s = zoom;
  sombra(8.6, 9.52, 10, 4);
  poly([{ x: p.x - 5 * s, y: p.y }, { x: p.x + 5 * s, y: p.y }, { x: p.x + 4.4 * s, y: p.y - 14 * s }, { x: p.x - 4.4 * s, y: p.y - 14 * s }], '#c9a875');
  g.strokeStyle = '#8a6a4a'; g.lineWidth = 0.7 * s; g.lineCap = 'round';
  const n19 = nivelTec(19); // MÁXIMA: la columna se llena, llega la segunda, y al final el nicho de los modelos
  for (let k = 0; k < 4; k++) { // la primera columna (media estela): la lista de los pájaros
    g.beginPath(); g.moveTo(p.x - 3.4 * s, p.y - (11.5 - k * 2.6) * s);
    g.lineTo(p.x - (0.6 + (k % 2) * 0.5) * s, p.y - (11.5 - k * 2.6) * s); g.stroke();
  }
  if (n19 >= 1) { for (let k = 0; k < 3; k++) { // se llena el hueco: renglones intercalados
      g.beginPath(); g.moveTo(p.x - 3.4 * s, p.y - (10.2 - k * 2.6) * s);
      g.lineTo(p.x - 1.2 * s, p.y - (10.2 - k * 2.6) * s); g.stroke();
    }
    const e2 = P(7.9, 8.7); // y la estela chica del patio: la lista de los oficios, recién empezada
    sombra(7.9, 8.8, 7, 3);
    poly([{ x: e2.x - 3.6 * s, y: e2.y }, { x: e2.x + 3.6 * s, y: e2.y }, { x: e2.x + 3 * s, y: e2.y - 10 * s }, { x: e2.x - 3 * s, y: e2.y - 10 * s }], '#bfa06a');
    poly([{ x: e2.x - 3.6 * s, y: e2.y }, { x: e2.x - 3 * s, y: e2.y - 10 * s }, { x: e2.x - 1.6 * s, y: e2.y - 10 * s }, { x: e2.x - 2 * s, y: e2.y }], '#d0b47c');
    g.strokeStyle = '#7a5636'; g.lineWidth = 0.7 * s; g.lineCap = 'round';
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(e2.x - 2 * s, e2.y - (8 - k * 2.4) * s); g.lineTo(e2.x + (1.4 - (k % 2)) * s, e2.y - (8 - k * 2.4) * s); g.stroke(); }
  }
  if (n19 >= 2) { // la segunda columna en su LOSA GEMELA: el currículo crece en piedra
    g.beginPath(); g.moveTo(p.x + 0.2 * s, p.y - 12.6 * s); g.lineTo(p.x + 0.2 * s, p.y - 1.6 * s); g.stroke();
    for (let k = 0; k < 6; k++) {
      g.beginPath(); g.moveTo(p.x + 1.2 * s, p.y - (11.5 - k * 1.8) * s);
      g.lineTo(p.x + (3.4 - (k % 2) * 0.6) * s, p.y - (11.5 - k * 1.8) * s); g.stroke();
    }
    const g2 = P(7.35, 9.6); // al costado libre: donde el recitador no la tape
    sombra(7.35, 9.72, 8, 3.2);
    poly([{ x: g2.x - 4.4 * s, y: g2.y }, { x: g2.x + 4.4 * s, y: g2.y }, { x: g2.x + 3.8 * s, y: g2.y - 12.5 * s }, { x: g2.x - 3.8 * s, y: g2.y - 12.5 * s }], '#c9a875');
    poly([{ x: g2.x - 4.4 * s, y: g2.y }, { x: g2.x - 3.8 * s, y: g2.y - 12.5 * s }, { x: g2.x - 2.2 * s, y: g2.y - 12.5 * s }, { x: g2.x - 2.6 * s, y: g2.y }], '#d6b988');
    g.strokeStyle = '#8a6a4a'; g.lineWidth = 0.75 * s; g.lineCap = 'round';
    for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(g2.x - 2.4 * s, g2.y - (10.4 - k * 2.2) * s); g.lineTo(g2.x + (2.6 - (k % 2) * 0.8) * s, g2.y - (10.4 - k * 2.2) * s); g.stroke(); }
  }
  if (n19 >= 3) { // el nicho de los modelos: la primera biblioteca escolar, con cuerpo de mueble
    const q = P(8.05, 9.95);
    sombra(8.05, 10.05, 9, 3.4);
    g.fillStyle = '#9c7a4e'; g.fillRect(q.x - 5.2 * s, q.y - 12 * s, 10.4 * s, 12 * s); // el fondo del mueble
    line({ x: q.x - 5.2 * s, y: q.y }, { x: q.x - 5.2 * s, y: q.y - 12 * s }, '#8a6a4a', 1.7 * s);
    line({ x: q.x + 5.2 * s, y: q.y }, { x: q.x + 5.2 * s, y: q.y - 12 * s }, '#8a6a4a', 1.7 * s);
    line({ x: q.x - 5.6 * s, y: q.y - 12 * s }, { x: q.x + 5.6 * s, y: q.y - 12 * s }, '#7a5636', 1.9 * s); // la cornisa
    for (let sh = 0; sh < 3; sh++) {
      const y = q.y - 2.6 * s - sh * 3.8 * s;
      line({ x: q.x - 5.2 * s, y }, { x: q.x + 5.2 * s, y }, '#7a5636', 1.2 * s);
      for (let k2 = 0; k2 < 4; k2++) { g.fillStyle = k2 % 2 ? '#cdb083' : '#c2a06b'; g.fillRect(q.x - 4.5 * s + k2 * 2.4 * s, y - 3 * s, 1.9 * s, 3 * s); }
    }
  }
  estadoTec(19, { x: p.x, y: p.y - 20 * s }, t);
}

/* --- Época 3: la Casa de la Vida --- */
function drawCasaVida(t) { // per-ankh: caliza clara, pilono en talud y una puerta que mira al río
  /* LA FACHADA, REHECHA (2026-08-25). Era un cubo blanco con dos tacos encima y una ranura oscura:
     el edificio principal de la época se leía como una caja. Un templo egipcio se reconoce por tres
     cosas, y ahora las tiene: los muros en TALUD (las torres del pilono se estrechan hacia arriba),
     la CORNISA de gola egipcia que remata el muro, y la PUERTA alta y estrecha en el centro, más baja
     que las torres, con su dintel y el disco solar alado encima. */
  const x0 = 8, y0 = 5, w = 3, d = 3, zc = zoom;
  sombra(x0 + w / 2 + 0.4, y0 + d / 2 + 0.55, 105, 46);
  isoBox(x0, y0, w, d, 40, '#efe6cd', '#e2d5b4', '#cdbc94');
  // LAS DOS TORRES DEL PILONO, en talud: la cara frontal se estrecha hacia la cornisa
  const yF = y0 + d;
  /* EL PILONO CON CONTRASTE (2026-09-06, jugando de cerca): las torres tenían el mismo tono que
     el muro de atrás y el talud no se leía; la fachada era un bloque beige con una ranura. Ahora
     las torres se despegan del cuerpo (más claras, con su arista en sombra franca y el torus
     redondeado de la esquina), llevan el friso pintado bajo la gola (los templos iban pintados:
     azul, rojo, oro) y dos registros de figuras en hueco que se adivinan sin leerse. */
  for (const [xa, xb] of [[0.05, 1.28], [1.72, 2.95]]) {
    poly([P(x0 + xa, yF, 0), P(x0 + xb, yF, 0), P(x0 + xb - 0.16, yF, 48), P(x0 + xa + 0.16, yF, 48)], '#eee4c6');
    poly([P(x0 + xa, yF, 0), P(x0 + xa + 0.16, yF, 48), P(x0 + xa + 0.16, yF, 44), P(x0 + xa, yF, 40)], '#c6b48c'); // su arista en sombra
    poly([P(x0 + xb, yF, 0), P(x0 + xb - 0.16, yF, 48), P(x0 + xb - 0.11, yF, 48), P(x0 + xb + 0.05, yF, 0)], '#dccda8'); // el torus de la esquina, al sol
    // el zócalo de piedra oscura donde el muro toca la arena
    poly([P(x0 + xa, yF, 0), P(x0 + xb, yF, 0), P(x0 + xb - 0.01, yF, 3.5), P(x0 + xa + 0.01, yF, 3.5)], '#c9b78f');
    // la cornisa de gola: el remate que vuela sobre el muro
    poly([P(x0 + xa - 0.06, yF, 48), P(x0 + xb + 0.06, yF, 48), P(x0 + xb + 0.06, yF, 54), P(x0 + xa - 0.06, yF, 54)], '#dbcda9');
    line(P(x0 + xa - 0.06, yF, 49.5), P(x0 + xb + 0.06, yF, 49.5), '#b8a57e', 1.4 * zc);
    line(P(x0 + xa - 0.06, yF, 54), P(x0 + xb + 0.06, yF, 54), '#c9b98f', 2 * zc);
    // EL FRISO PINTADO bajo la gola: la banda de color que decía «templo» desde el río
    const PINT = ['#2f97d8', '#c94f43', '#e8a51e', '#3f8a5a'];
    const fx0 = x0 + xa + 0.17, fx1 = x0 + xb - 0.17, nb = 8;
    for (let k = 0; k < nb; k++) {
      const a0 = fx0 + (fx1 - fx0) * k / nb, a1 = fx0 + (fx1 - fx0) * (k + 1) / nb;
      poly([P(a0, yF, 42), P(a1, yF, 42), P(a1, yF, 46.2), P(a0, yF, 46.2)], PINT[k % 4]);
    }
    line(P(fx0, yF, 42), P(fx1, yF, 42), '#8a6a4a', 0.7 * zc);
    line(P(fx0, yF, 46.2), P(fx1, yF, 46.2), '#8a6a4a', 0.7 * zc);
    // los relieves hundidos de la torre: dos registros de figuras, sugeridos (cuerpo y cabeza en hueco)
    g.strokeStyle = '#cfbf99'; g.lineWidth = 1 * zc;
    for (const zz of [12, 25, 38]) { const r0 = P(x0 + xa + 0.16, yF, zz), r1 = P(x0 + xb - 0.16, yF, zz);
      g.beginPath(); g.moveTo(r0.x, r0.y); g.lineTo(r1.x, r1.y); g.stroke(); }
    for (let k = 0; k < 5; k++) {
      const gx = x0 + xa + 0.24 + k * 0.2;
      for (const zz of [14.5, 27.5]) {
        line(P(gx, yF, zz), P(gx, yF, zz + 6.5), 'rgba(160,122,70,.40)', 1.3 * zc);   // el cuerpo, de perfil
        dot(P(gx, yF, zz + 8.2), 1.05 * zc, 'rgba(160,122,70,.48)');                  // la cabeza
        line(P(gx, yF, zz + 4), P(gx + (k % 2 ? 0.05 : -0.05), yF, zz + 1.5), 'rgba(160,122,70,.34)', 0.8 * zc); // el brazo que ofrece
      }
    }
  }
  // LA PUERTA: alta, estrecha y más baja que las torres, con su dintel
  poly([P(x0 + 1.28, yF, 0), P(x0 + 1.72, yF, 0), P(x0 + 1.72, yF, 40), P(x0 + 1.28, yF, 40)], '#3f3225');
  poly([P(x0 + 1.24, yF, 40), P(x0 + 1.76, yF, 40), P(x0 + 1.76, yF, 46), P(x0 + 1.24, yF, 46)], '#e2d5b4'); // el dintel
  // el disco solar alado sobre el dintel: el signo que dice «aquí se entra a lo sagrado»
  const ds = P(x0 + 1.5, yF, 43);
  dot({ x: ds.x, y: ds.y }, 2.6 * zc, '#e8a51e');
  for (const lado of [-1, 1]) {
    poly([{ x: ds.x + lado * 2.4 * zc, y: ds.y - 1.4 * zc }, { x: ds.x + lado * 9 * zc, y: ds.y - 2.6 * zc },
          { x: ds.x + lado * 9 * zc, y: ds.y - 0.4 * zc }, { x: ds.x + lado * 2.4 * zc, y: ds.y + 1 * zc }], '#c9a63f');
    line({ x: ds.x + lado * 3 * zc, y: ds.y - 0.2 * zc }, { x: ds.x + lado * 8.6 * zc, y: ds.y - 1.2 * zc }, '#8a6a2a', 0.7 * zc);
  }
  line(P(x0, yF, 40), P(x0 + w, yF, 40), '#b8a57e', 2.4 * zc);                        // la cornisa del cuerpo
  line(P(x0 + w, y0, 40), P(x0 + w, yF, 40), '#a89468', 2.4 * zc);
  ellipse(P(x0 + 1.5, y0 + d + 0.55), 12 * zoom, 5 * zoom, 'rgba(226,213,180,.85)'); // la explanada
  /* SIN MÁSTILES NI BANDERAS (2026-08-31, tercera tanda). Dos versiones intentaron los mástiles del
     pilono (los palos de un píxel, luego las vigas de cedro con banderolas) y el ojo del jugador
     rechazó las dos: «saca las banderas». Los templos reales los tenían, pero en este diorama se leen
     como algo pegado a la fachada. La Casa se anuncia con el talud, la gola y el disco solar: basta. */
  /* EL ANEXO DEL PER ANKH (el saber 32, era3-plan): se CONSTRUYE como la edubba (obra con andamio →
     paredes → completo) y sus etapas de perfección son piezas: la sala de copistas, el archivo de
     nichos y la fachada de Seshat. La casa grande es del templo; esta ala es de la escuela. */
  const tc = S.tecs[32], fase = tc ? tc.fase : 'sin', niv = nivelTec(32), s = zoom;
  if (fase !== 'sin') {
    const ax = x0 - 1.35, ay = y0 + 0.9, aw = 1.25, ad = 2.0;
    sombra(ax + aw / 2 + 0.2, ay + ad / 2 + 0.4, 52, 26);
    const alto = fase === 'meseta' ? (niv >= 2 ? 48 : 34) : fase === 'formando' ? 26 : 16; // etapa 2: EL SEGUNDO PISO: el archivo crece y la casa crece con él (el precedente de la edubba: subir de nivel es CONSTRUCCIÓN)
    isoBox(ax, ay, aw, ad, alto, '#ece2c6', '#dfd2ae', '#cab890');
    if (niv >= 2 && fase === 'meseta') { // la cornisa del primer piso y las ventanas altas del archivo
      line(P(ax, ay + ad, 34), P(ax + aw, ay + ad, 34), '#b8a57e', 1.6 * s);
      line(P(ax + aw, ay, 34), P(ax + aw, ay + ad, 34), '#a89468', 1.6 * s);
      for (const vx of [0.28, 0.62, 0.96]) { const q = P(ax + vx, ay + ad, 44); g.fillStyle = '#4a3a28'; g.fillRect(q.x - 1 * s, q.y - 3.6 * s, 2 * s, 3.6 * s); }
    }
    if (niv >= 3 && fase === 'meseta') { // etapa 3: LA FACHADA ENCALADA: el frente pintado de claro, listo para sus patronos
      const f0 = P(ax, ay + ad, 0), f1 = P(ax + aw, ay + ad, 0), f2 = P(ax + aw, ay + ad, alto), f3 = P(ax, ay + ad, alto);
      poly([f0, f1, f2, f3], '#f4ecd6');
    }
    if (fase !== 'meseta') { // la obra: el andamio de palos y la rampa de cuerdas
      for (const [px2, py2] of [[ax - 0.08, ay + 0.3], [ax - 0.08, ay + ad - 0.3]]) {
        line(P(px2, py2, 0), P(px2, py2, alto + 16), '#8a6a4a', 1.2 * s);
        line(P(px2, py2, alto + 10), P(px2 + 0.5, py2, alto + 10), '#8a6a4a', 0.9 * s);
      }
      line(P(ax - 0.08, ay + 0.3, alto + 4), P(ax - 0.08, ay + ad - 0.3, alto + 4), '#b09a60', 0.8 * s); // la cuerda del andamio
    } else {
      line(P(ax, ay + ad, alto), P(ax + aw, ay + ad, alto), '#b8a57e', 1.8 * s);      // la cornisa del ala
      poly([P(ax + 0.42, ay + ad, 0), P(ax + 0.82, ay + ad, 0), P(ax + 0.82, ay + ad, 18), P(ax + 0.42, ay + ad, 18)], '#4a3a28'); // su puerta
    }
    if (niv >= 1 && fase === 'meseta') { // etapa 1: EL PATIO DE COPISTAS, en el claro entre el coloso y la puerta (el coloso oeste vive en 6.75,8.25 y su arena tapaba el sitio original: lo cazó el audit)
      ellipse(P(ax + 1.7, ay + ad + 0.55), 14 * s, 5.6 * s, 'rgba(214,190,140,.85)');
      for (const ex of [1.25, 1.7, 2.15]) ellipse(P(ax + ex, ay + ad + 0.45), 4.4 * s, 1.9 * s, '#c9ab6e'); // las esteras
      const qb = P(ax + 1.7, ay + ad + 0.85); // el banco bajo del maestro
      g.fillStyle = '#8a6a4a'; g.fillRect(qb.x - 5 * s, qb.y - 2.6 * s, 10 * s, 1.6 * s);
      g.fillRect(qb.x - 4.2 * s, qb.y - 1.2 * s, 1.2 * s, 1.4 * s); g.fillRect(qb.x + 3 * s, qb.y - 1.2 * s, 1.2 * s, 1.4 * s);
      for (const [ex, tono2] of [[1.3, '#3a2e20'], [2.1, '#2e241a']]) { // los copistas sentados en sus esteras
        const q = P(ax + ex, ay + ad + 0.4);
        poly([{ x: q.x - 2.4 * s, y: q.y }, { x: q.x - 1 * s, y: q.y - 4.6 * s }, { x: q.x + 1.4 * s, y: q.y - 4.4 * s }, { x: q.x + 2.4 * s, y: q.y }], '#e8dcc4'); // la túnica
        dot({ x: q.x + 0.2 * s, y: q.y - 6 * s }, 1.8 * s, tono2); // la cabeza
        g.fillStyle = '#efe6cc'; g.fillRect(q.x - 1.6 * s, q.y - 3.4 * s, 3 * s, 2 * s); // su tablilla
      }
      const tA = P(ax + 1.05, ay + ad + 0.15), tB = P(ax + 2.4, ay + ad + 0.25), tC = P(ax + 1.15, ay + ad + 0.85), tD = P(ax + 2.5, ay + ad + 0.95); // EL TOLDO del patio: la sombra que hace escuela
      for (const q of [tA, tB, tC, tD]) line({ x: q.x, y: q.y }, { x: q.x, y: q.y - 13 * s }, '#8a6a4a', 1.1 * s);
      g.save(); g.globalAlpha = 0.9; g.fillStyle = '#dcc9a0';
      g.beginPath(); g.moveTo(tA.x, tA.y - 13 * s); g.lineTo(tB.x, tB.y - 13.6 * s); g.lineTo(tD.x, tD.y - 12.4 * s); g.lineTo(tC.x, tC.y - 11.8 * s); g.closePath(); g.fill();
      g.strokeStyle = '#c9ab6e'; g.lineWidth = 0.7 * s;
      g.beginPath(); g.moveTo(tA.x, tA.y - 13 * s); g.lineTo(tD.x, tD.y - 12.4 * s); g.stroke(); // la costura de la lona
      g.restore();
    }
    if (niv >= 2) { // etapa 2: EL ARCHIVO DE NICHOS: el muro del frente enrejado de memoria, y la estantería exenta
      for (let fy = 0; fy < 2; fy++) for (let fxk = 0; fxk < 3; fxk++) {
        const q = P(ax + 0.16 + fxk * 0.38, ay + ad, (fase === 'meseta' ? 25 : 9) + fy * 11);
        g.fillStyle = '#5a4832'; g.fillRect(q.x - 3.2 * s, q.y - 5.6 * s, 6.4 * s, 5.6 * s);
        dot({ x: q.x - 1.2 * s, y: q.y - 2.6 * s }, 1.5 * s, '#e0d09a'); dot({ x: q.x + 1.2 * s, y: q.y - 2.6 * s }, 1.5 * s, '#d8c488'); // los rollos asomando
      }
      const qe = P(ax - 0.5, ay + 0.9); // la estantería exenta, arrimada al muro oeste del ala (lejos de la arena del coloso)
      g.fillStyle = '#8a6a4a'; g.fillRect(qe.x - 8.5 * s, qe.y - 18 * s, 17 * s, 18 * s);
      g.fillStyle = '#7a5a3c'; g.fillRect(qe.x - 8.5 * s, qe.y - 18 * s, 17 * s, 1.6 * s);
      g.fillStyle = '#9a7852'; g.fillRect(qe.x - 8.5 * s, qe.y - 1.6 * s, 17 * s, 1.6 * s); // el zócalo
      for (let fy = 0; fy < 3; fy++) for (let fxk = 0; fxk < 2; fxk++) {
        g.fillStyle = '#5a4832'; g.fillRect(qe.x - 7 * s + fxk * 7.4 * s, qe.y - 15.8 * s + fy * 5 * s, 6.2 * s, 4.2 * s);
        dot({ x: qe.x - 5 * s + fxk * 7.4 * s, y: qe.y - 13.6 * s + fy * 5 * s }, 1.5 * s, '#e0d09a');
        dot({ x: qe.x - 2.9 * s + fxk * 7.4 * s, y: qe.y - 13.6 * s + fy * 5 * s }, 1.5 * s, '#d8c488');
      }
    }
    if (niv >= 3) { // etapa 3: LA FACHADA DE SESHAT, a lo grande: la diosa que escribe, su estrella y la columna de señales
      const f = P(ax + 1.02, ay + ad, 0), alto2 = fase === 'meseta' ? 1 : 0.5;
      g.save(); g.translate(f.x, f.y - 9 * s * alto2);
      g.strokeStyle = '#8a5a3a'; g.lineWidth = 1.1 * s; g.lineCap = 'round';
      g.fillStyle = '#c98a4a';
      g.beginPath(); g.moveTo(0, -3.4 * s); g.lineTo(-3.8 * s, 10 * s); g.lineTo(3.8 * s, 10 * s); g.closePath(); g.fill(); // el vestido
      g.fillStyle = '#e8c46a'; // la piel de leopardo de Seshat, punteada
      g.beginPath(); g.moveTo(0, -2.4 * s); g.lineTo(-2.4 * s, 5.5 * s); g.lineTo(2.4 * s, 5.5 * s); g.closePath(); g.fill();
      for (const [px3, py3] of [[-1, 0.5], [0.8, 2], [-0.6, 3.6], [1.2, 4.6], [0, -0.8]]) dot({ x: px3 * s, y: py3 * s }, 0.42 * s, '#8a5a3a');
      dot({ x: 0, y: -5.6 * s }, 2.2 * s, '#8a5a3a');                                                                   // la cabeza
      g.beginPath(); g.moveTo(-0.5 * s, -7.6 * s); g.lineTo(-0.5 * s, -11 * s); g.stroke();                             // la vara del emblema
      g.strokeStyle = '#e8a51e'; g.lineWidth = 1.1 * s;
      for (let r2 = 0; r2 < 7; r2++) { const a2 = r2 / 7 * Math.PI * 2 - Math.PI / 2;                                    // la estrella de siete puntas de Seshat
        g.beginPath(); g.moveTo(-0.5 * s, -12.6 * s); g.lineTo(-0.5 * s + Math.cos(a2) * 3.6 * s, -12.6 * s + Math.sin(a2) * 3.6 * s); g.stroke(); }
      g.strokeStyle = '#8a5a3a'; g.lineWidth = 1 * s;
      g.beginPath(); g.moveTo(3 * s, 1 * s); g.lineTo(5.4 * s, -1.2 * s); g.stroke();                                   // el brazo con el cálamo
      g.strokeStyle = '#a5764a'; g.lineWidth = 0.7 * s;                                                                  // la columna de señales junto a ella
      for (let k2 = 0; k2 < 4; k2++) { g.beginPath(); g.moveTo(6.6 * s, -6 * s + k2 * 3.4 * s); g.lineTo(6.6 * s, -4 * s + k2 * 3.4 * s); g.stroke(); dot({ x: 6.6 * s, y: -7 * s + k2 * 3.4 * s }, 0.5 * s, '#a5764a'); }
      g.restore();
      if (fase === 'meseta') { // la estrella dorada sobre la puerta del ala, y EL DINTEL PINTADO (la franja de señales de la escuela)
        const qd = P(ax + 0.62, ay + ad, 26);
        g.strokeStyle = '#e8a51e'; g.lineWidth = 0.9 * s;
        for (let r2 = 0; r2 < 7; r2++) { const a2 = r2 / 7 * Math.PI * 2 - Math.PI / 2;
          g.beginPath(); g.moveTo(qd.x, qd.y); g.lineTo(qd.x + Math.cos(a2) * 2.6 * s, qd.y + Math.sin(a2) * 2.6 * s); g.stroke(); }
        const d0 = P(ax + 0.08, ay + ad, 20), d1 = P(ax + aw - 0.08, ay + ad, 20);
        g.fillStyle = '#c94f43'; g.fillRect(d0.x, d0.y - 2.2 * s, d1.x - d0.x, 2.2 * s); // el dintel rojo
        g.fillStyle = '#2f97d8';
        for (let k2 = 1; k2 < 7; k2++) { const qx = d0.x + (d1.x - d0.x) * k2 / 7; g.fillRect(qx - 0.5 * s, d0.y - 1.8 * s, 1 * s, 1.4 * s); } // sus señales azules
        const ft = P(ax + 0.22, ay + ad, 0); // Y THOT, el ibis escriba, flanqueando la puerta frente a Seshat (los dos patronos de la escritura, como en las Casas de la Vida reales)
        g.save(); g.translate(ft.x, ft.y - 9 * s);
        g.fillStyle = '#5a8a52';
        g.beginPath(); g.moveTo(0, -3 * s); g.lineTo(-3.4 * s, 9.5 * s); g.lineTo(3.4 * s, 9.5 * s); g.closePath(); g.fill(); // el faldellín verde
        g.fillStyle = '#e8dcc4'; g.fillRect(-2.2 * s, -3.2 * s, 4.4 * s, 3.6 * s); // el torso
        dot({ x: 0, y: -5.4 * s }, 2 * s, '#3a4a3a'); // la cabeza de ibis
        g.strokeStyle = '#3a4a3a'; g.lineWidth = 1 * s; g.lineCap = 'round';
        g.beginPath(); g.moveTo(1.4 * s, -5.8 * s); g.quadraticCurveTo(4 * s, -5.2 * s, 4.2 * s, -2.6 * s); g.stroke(); // el pico curvo
        g.beginPath(); g.moveTo(-2.6 * s, -1.4 * s); g.lineTo(-4.6 * s, 1.4 * s); g.stroke(); // el brazo con la paleta
        g.fillStyle = '#c9a875'; g.fillRect(-5.6 * s, 1 * s, 2.2 * s, 3.4 * s); // su paleta de escriba
        g.restore();
      }
    }
  }
  estadoTec(32, P(x0 - 0.75, y0 + 1.9, 46), t);
}
function drawObelisco(x, y) {
  /* EL OBELISCO (rehecho el 2026-08-25: «dos columnas sumamente pequeñas»). Los de verdad median
     veinte y treinta metros, tallados de una pieza y coronados de electro para que el primer sol los
     encendiera: el anterior media 30 px y se leia como un palito. Este mide 78, con su pedestal, sus
     dos caras, la columna de jeroglificos y el piramidion que ARDE al sol. */
  const s = zoom, H = 78, W0 = 4.6, W1 = 2.5;   // alto, medio-ancho al pie y en la punta
  sombra(x + 0.1, y + 0.1, 11, 4.2);
  const p0 = P(x, y);
  const q = (dx, dy) => ({ x: p0.x + dx * s, y: p0.y + dy * s });
  // pedestal de granito, en dos escalones
  poly([q(-8, 0), q(8, 0), q(8, -4), q(-8, -4)], '#9a8e78');
  poly([q(-8, -4), q(8, -4), q(6.6, -6.6), q(-6.6, -6.6)], '#b3a68c');
  poly([q(-6.6, -6.6), q(6.6, -6.6), q(6.6, -8.6), q(-6.6, -8.6)], '#a4977d');
  const y0 = -8.6;
  // fuste: cara al sol y flanco en sombra, con la ligera entasis de la piedra
  poly([q(-W0, y0), q(1.2, y0), q(W1 * 0.5, y0 - H), q(-W1, y0 - H)], '#e8dcbc');
  poly([q(1.2, y0), q(W0, y0 - 1.2), q(W1 * 1.5, y0 - H - 0.6), q(W1 * 0.5, y0 - H)], '#c6b58b');
  // la columna de jeroglificos, tallada en hueco por la cara iluminada
  g.strokeStyle = '#a89468'; g.lineWidth = 0.9 * s; g.lineCap = 'round';
  for (let k = 0; k < 7; k++) {
    const yy = y0 - 9 - k * 9.4, an = 1.5 - k * 0.06;
    g.beginPath(); g.moveTo(q(-an - 0.4, yy).x, q(-an - 0.4, yy).y); g.lineTo(q(an - 0.4, yy).x, q(an - 0.4, yy).y); g.stroke();
    g.beginPath(); g.moveTo(q(-0.4, yy - 1.6).x, q(-0.4, yy - 1.6).y); g.lineTo(q(-0.4, yy - 4.4).x, q(-0.4, yy - 4.4).y); g.stroke();
  }
  // el piramidion, chapado en electro: dos caras y un destello que respira
  const pt = q(-0.3, y0 - H - 11);
  poly([q(-W1, y0 - H), q(0.4, y0 - H), pt], '#f2c94c');
  poly([q(0.4, y0 - H), q(W1 * 1.5, y0 - H - 0.6), pt], '#d99a1c');
  const gl = 0.5 + 0.5 * Math.sin((typeof tFrame === 'number' ? tFrame : 0) * 1.1 + x);
  g.save(); g.globalAlpha = 0.12 + 0.18 * gl;
  ellipse(pt, 9 * s, 6 * s, '#fff0b0'); g.restore();
  dot(pt, 1.5 * s, '#fff6d8');
}
function posGato(t) { // Miu patrulla la Casa de la Vida
  const a = t * 0.12;
  return { x: 10.0 + Math.cos(a) * 2.4, y: 9.2 + Math.sin(a) * 1.4, dir: (-Math.sin(a) * 2.4 - Math.cos(a) * 1.4) >= 0 ? 1 : -1 };
}
function drawGato(t) {
  const q = posGato(t), p = P(q.x, q.y), s = zoom;
  ellipse({ x: p.x, y: p.y }, 5 * s, 2 * s, sombraHoy);
  g.save(); g.translate(p.x, p.y); if (q.dir < 0) g.scale(-1, 1);
  const paso = Math.sin(t * 6) * 0.6 * s;
  g.fillStyle = '#2e2a26';
  g.beginPath(); g.ellipse(0, -3.5 * s, 4.2 * s, 2.4 * s, 0, 0, 7); g.fill();       // el cuerpo
  dot({ x: 3.8 * s, y: -6 * s }, 2 * s, '#2e2a26');                                  // la cabeza
  poly([{ x: 2.4 * s, y: -7.2 * s }, { x: 3.2 * s, y: -9.4 * s }, { x: 4 * s, y: -7.4 * s }], '#2e2a26'); // las orejas
  poly([{ x: 4.2 * s, y: -7.4 * s }, { x: 5 * s, y: -9.2 * s }, { x: 5.6 * s, y: -7 * s }], '#2e2a26');
  g.strokeStyle = '#2e2a26'; g.lineWidth = 1.1 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-3.8 * s, -4.5 * s);                                       // la cola, siempre en alto
  g.quadraticCurveTo(-6 * s, -8 * s + Math.sin(t * 2.1) * 1.5 * s, -4.6 * s, -10.5 * s + Math.sin(t * 2.1) * 2 * s);
  g.stroke();
  g.beginPath(); g.moveTo(-2 * s, -1.6 * s); g.lineTo(-2 * s + paso, 0); g.stroke(); // las patas
  g.beginPath(); g.moveTo(2 * s, -1.6 * s); g.lineTo(2 * s - paso, 0); g.stroke();
  g.strokeStyle = '#e8a51e'; g.lineWidth = 0.7 * s;
  g.beginPath(); g.arc(3.4 * s, -4.6 * s, 1.7 * s, -0.6, 1.2); g.stroke();           // el collarcito dorado
  dot({ x: 4.5 * s, y: -6.3 * s }, 0.45 * s, '#e8a51e');                             // el ojo dorado
  g.restore();
}
function drawRolloPapiro(t) { // el saber 20: del tallo al archivo, en etapas
  const p = P(11.4, 6.4), s = zoom, niv = nivelTec(20);
  sombra(11.4, 6.52, 13, 4.6);
  ellipse({ x: p.x, y: p.y - 1 * s }, 10 * s, 4.2 * s, '#d6be8c');            // la estera del taller
  g.strokeStyle = '#7da24e'; g.lineWidth = 1.1 * s; g.lineCap = 'round';      // los tallos cortados, esperando
  for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(p.x - 8.5 * s + k * 1.1 * s, p.y - 0.5 * s); g.lineTo(p.x - 5.5 * s + k * 1.1 * s, p.y - 4.2 * s); g.stroke(); }
  if (niv >= 1) { // etapa 1: LAS TIRAS PRENSADAS EN CRUZ, grandes y con sus dos piedras
    g.save(); g.translate(p.x - 2 * s, p.y - 4 * s); g.rotate(-0.05);
    g.fillStyle = '#e4d5a0'; g.fillRect(-6.5 * s, -5 * s, 13 * s, 10 * s);
    g.strokeStyle = '#c9b878'; g.lineWidth = 0.6 * s;
    for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(k * 2.5 * s, -5 * s); g.lineTo(k * 2.5 * s, 5 * s); g.stroke(); }
    for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(-6.5 * s, k * 2.9 * s); g.lineTo(6.5 * s, k * 2.9 * s); g.stroke(); }
    dot({ x: 3.6 * s, y: -2.8 * s }, 2.2 * s, '#9a9188'); dot({ x: -3.8 * s, y: 2.6 * s }, 1.9 * s, '#a8a09a'); dot({ x: 0.4 * s, y: 4 * s }, 1.5 * s, '#8f8880'); // las piedras que prensan
    g.restore();
  }
  if (niv >= 2) { // etapa 2: EL ROLLO extendido entre sus rodillos, a lo ancho
    g.fillStyle = '#e8d9a8'; g.fillRect(p.x - 1.5 * s, p.y - 9.4 * s, 15 * s, 5.4 * s);
    g.fillStyle = '#c9b878';
    g.fillRect(p.x - 3.6 * s, p.y - 10.4 * s, 2.3 * s, 7.4 * s);
    g.fillRect(p.x + 12.8 * s, p.y - 10.4 * s, 2.3 * s, 7.4 * s);
    g.strokeStyle = '#8a7a4a'; g.lineWidth = 0.6 * s; g.lineCap = 'round';
    g.beginPath(); g.moveTo(p.x, p.y - 7.4 * s); g.lineTo(p.x + 8.6 * s, p.y - 7.4 * s); g.stroke();
    g.beginPath(); g.moveTo(p.x, p.y - 6 * s); g.lineTo(p.x + 7 * s, p.y - 6 * s); g.stroke();
    g.beginPath(); g.moveTo(p.x, p.y - 4.9 * s); g.lineTo(p.x + 5.6 * s, p.y - 4.9 * s); g.stroke();
  }
  if (niv >= 3) { // etapa 3: EL ESTANTE DE NICHOS: lo escrito ya se vuelve a encontrar
    const ex = p.x + 7 * s, ey = p.y + 1 * s;
    g.fillStyle = '#8a6a4a'; g.fillRect(ex - 0.8 * s, ey - 11 * s, 10.6 * s, 11 * s);
    g.fillStyle = '#7a5a3c'; g.fillRect(ex - 0.8 * s, ey - 11 * s, 10.6 * s, 1.1 * s);
    for (let fy = 0; fy < 2; fy++) for (let fxk = 0; fxk < 2; fxk++) {
      g.fillStyle = '#5a4832'; g.fillRect(ex + 0.4 * s + fxk * 4.8 * s, ey - 9.6 * s + fy * 5 * s, 4 * s, 4.2 * s);
      dot({ x: ex + 2.4 * s + fxk * 4.8 * s, y: ey - 7.4 * s + fy * 5 * s }, 1.4 * s, '#e0d09a');
    }
  }
  estadoTec(20, { x: p.x, y: p.y - 15 * s }, t);
}
function drawPaletaEscriba(t) { // el saber 21: la paleta de dos tintas, en etapas
  const p = P(10.3, 7.9), s = zoom, niv = nivelTec(21);
  sombra(10.3, 8.0, 9, 3.4);
  g.fillStyle = '#c9a875';
  g.fillRect(p.x - 2 * s, p.y - 9 * s, 4 * s, 8 * s);                  // la paleta
  dot({ x: p.x, y: p.y - 7.2 * s }, 1.1 * s, '#2e2a26');               // la tinta negra
  dot({ x: p.x, y: p.y - 4.4 * s }, 1.1 * s, '#c94f43');               // la tinta roja
  g.strokeStyle = '#8a6a4a'; g.lineWidth = 0.8 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(p.x + 2.6 * s, p.y - 8.6 * s); g.lineTo(p.x + 4 * s, p.y - 1.5 * s); g.stroke(); // el cálamo
  if (niv >= 1) { // etapa 1: el rincón de moler tinta: la piedra, el pocillo y el segundo cálamo
    ellipse({ x: p.x - 5.6 * s, y: p.y - 0.6 * s }, 3.4 * s, 1.9 * s, '#b0a894'); // la piedra de moler
    ellipse({ x: p.x - 6 * s, y: p.y - 1.2 * s }, 1.7 * s, 0.9 * s, '#2e2a26');   // la mancha de tinta molida
    dot({ x: p.x - 4.2 * s, y: p.y - 3.4 * s }, 1.7 * s, '#7ba2ac');              // el pocillo de agua
    dot({ x: p.x - 4.2 * s, y: p.y - 3.8 * s }, 1.05 * s, '#a8ccd4');
    dot({ x: p.x - 7.8 * s, y: p.y - 3 * s }, 1.2 * s, '#c94f43');                // el pan de ocre rojo
    g.beginPath(); g.moveTo(p.x + 3.8 * s, p.y - 8.2 * s); g.lineTo(p.x + 5.6 * s, p.y - 2.2 * s); g.stroke(); // el segundo cálamo
  }
  if (niv >= 2) { // etapa 2: EL ESTUCHE con su correa: el aula entera se carga al hombro
    g.save(); g.translate(p.x + 7.6 * s, p.y - 2.6 * s); g.rotate(0.12);
    g.fillStyle = '#a87848'; g.fillRect(-5 * s, -2.8 * s, 10 * s, 5.6 * s);
    g.fillStyle = '#8a5f38'; g.fillRect(-5 * s, -2.8 * s, 10 * s, 1.6 * s);
    g.strokeStyle = '#6a4828'; g.lineWidth = 0.8 * s;
    g.beginPath(); g.moveTo(-5 * s, 0); g.quadraticCurveTo(0, -7 * s, 5 * s, 0); g.stroke(); // la correa
    g.beginPath(); g.moveTo(-3.4 * s, -0.6 * s); g.lineTo(3.4 * s, -0.6 * s); g.stroke();    // la costura
    g.restore();
  }
  if (niv >= 3) { // etapa 3: EL NOMBRE INSCRITO: la paleta expuesta en su soporte, con su dueño
    const ex = p.x - 8.2 * s, ey = p.y - 1 * s;
    line({ x: ex - 1.8 * s, y: ey }, { x: ex, y: ey - 6.5 * s }, '#8a6a4a', 1 * s);   // el soporte
    line({ x: ex + 1.8 * s, y: ey }, { x: ex, y: ey - 6.5 * s }, '#8a6a4a', 1 * s);
    g.save(); g.translate(ex, ey - 7.6 * s); g.rotate(-0.18);
    g.fillStyle = '#d9b884'; g.fillRect(-1.6 * s, -3.6 * s, 3.2 * s, 7 * s);
    g.strokeStyle = '#6a4828'; g.lineWidth = 0.5 * s;                                  // las marcas del nombre
    g.beginPath(); g.moveTo(-0.7 * s, -2.4 * s); g.lineTo(0.7 * s, -2.4 * s); g.moveTo(0, -2.4 * s); g.lineTo(0, -0.6 * s); g.moveTo(-0.7 * s, 0.4 * s); g.lineTo(0.7 * s, 0.4 * s); g.moveTo(-0.5 * s, 1.6 * s); g.lineTo(0.5 * s, 2.4 * s); g.stroke();
    g.restore();
  }
  estadoTec(21, { x: p.x, y: p.y - 16 * s }, t);
}
function drawKemyt(t) { // el saber 22: la Kemyt, el texto de arranque, en etapas. MUDADA al claro del noreste el 2026-08-24: en (12.5, 8.9) la Gran Esfinge la ocluía (lo cazó el audit de etapas: silueta de 50 px)
  const p = P(13.9, 7.3), s = zoom, niv = nivelTec(22);
  sombra(13.9, 7.4, 10, 3.8);
  line({ x: p.x - 2.5 * s, y: p.y }, { x: p.x, y: p.y - 7 * s }, '#8a6a4a', 1.3 * s); // el atril del maestro
  line({ x: p.x + 2.5 * s, y: p.y }, { x: p.x, y: p.y - 7 * s }, '#8a6a4a', 1.3 * s);
  g.save(); g.translate(p.x, p.y - 8 * s); g.rotate(-0.22);
  g.fillStyle = '#efe6cc'; g.fillRect(-5 * s, -2.5 * s, 10 * s, 5 * s);               // la tabla del arranque
  g.strokeStyle = '#8a7a4a'; g.lineWidth = 0.55 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-3.4 * s, 0.2 * s); g.lineTo(3.4 * s, 0.2 * s); g.stroke();
  g.beginPath(); g.moveTo(-3.4 * s, 1.4 * s); g.lineTo(2 * s, 1.4 * s); g.stroke();
  if (niv >= 1) { g.strokeStyle = '#c94f43'; g.lineWidth = 0.8 * s; g.beginPath(); g.moveTo(-3.4 * s, -1.2 * s); g.lineTo(2.8 * s, -1.2 * s); g.stroke(); } // etapa 1: el título EN ROJO (la rúbrica)
  g.restore();
  if (niv >= 1) { // y la vara del maestro apoyada, con el ostracón del alumno al pie
    line({ x: p.x + 3.2 * s, y: p.y - 0.4 * s }, { x: p.x + 5 * s, y: p.y - 8.6 * s }, '#8a6038', 1 * s);
    poly([{ x: p.x - 5.8 * s, y: p.y + 1.6 * s }, { x: p.x - 4.6 * s, y: p.y - 1 * s }, { x: p.x - 1.8 * s, y: p.y - 0.6 * s }, { x: p.x - 2.4 * s, y: p.y + 2 * s }], '#efe6cc');
    g.strokeStyle = '#c94f43'; g.lineWidth = 0.6 * s; g.beginPath(); g.moveTo(p.x - 4.8 * s, p.y + 0.4 * s); g.lineTo(p.x - 2.8 * s, p.y + 0.6 * s); g.stroke();
  }
  if (niv >= 2) { // etapa 2: LOS TRAMOS COLGADOS: cada tramo copiado sube al muro de cuerda
    const ax = p.x + 4.5 * s, bx = p.x + 13 * s, ay = p.y - 9.5 * s;
    line({ x: ax, y: p.y }, { x: ax, y: ay }, '#8a6a4a', 1.1 * s);
    line({ x: bx, y: p.y - 0.8 * s }, { x: bx, y: ay - 0.8 * s }, '#8a6a4a', 1.1 * s);
    g.strokeStyle = '#b09a60'; g.lineWidth = 0.6 * s;
    g.beginPath(); g.moveTo(ax, ay); g.quadraticCurveTo((ax + bx) / 2, ay + 1.6 * s, bx, ay - 0.8 * s); g.stroke();
    for (let k = 0; k < 3; k++) {
      const tx = ax + (bx - ax) * (k + 1) / 4, ty = ay + 1 * s - k * 0.3 * s;
      g.fillStyle = '#efe6cc'; g.fillRect(tx - 1.7 * s, ty, 3.4 * s, 4.4 * s);
      line({ x: tx - 1 * s, y: ty + 1.6 * s }, { x: tx + 1 * s, y: ty + 1.6 * s }, '#8a7a4a', 0.45 * s);
      line({ x: tx - 1 * s, y: ty + 2.8 * s }, { x: tx + 0.4 * s, y: ty + 2.8 * s }, '#8a7a4a', 0.45 * s);
    }
  }
  if (niv >= 3) { // etapa 3: LAS COLUMNAS ARCAICAS: la Kemyt completa, escrita a la manera vieja
    g.save(); g.translate(p.x - 7.5 * s, p.y - 4.5 * s); g.rotate(0.1);
    g.fillStyle = '#e9e0c6'; g.fillRect(-3.2 * s, -5 * s, 6.4 * s, 10 * s);
    g.strokeStyle = '#8a7a4a'; g.lineWidth = 0.5 * s;
    for (let k = -1; k <= 1; k++) { g.beginPath(); g.moveTo(k * 1.8 * s, -3.8 * s); g.lineTo(k * 1.8 * s, 3.8 * s); g.stroke(); } // las COLUMNAS verticales
    g.restore();
  }
  estadoTec(22, { x: p.x, y: p.y - 17 * s }, t);
}
const drawSebayt = drawKemyt; // el nombre viejo del andamio, por si algún llamado quedó vivo
/* La cuerda se MUDÓ A LA VEGA el 2026-08-25 (medía los lindes del valle desde el patio del templo, a
   dos tiles de la puerta): CUERDA_SITIO manda, y todo lo suyo cuelga de ahí. */
const CUERDA_SITIO = { x: 11.2, y: 12.0 };
/* La cuerda se tiende PARALELA a la orilla (dirección del Nilo), que es como se re-mide una vega: a lo
   largo del río, no cruzándolo. Sus dos tensadores son estos mismos extremos (ver 20-main). */
const CUERDA_A = { x: 11.64, y: 11.39 }, CUERDA_B = { x: 10.76, y: 12.61 };
function drawCuerdaAgrimensor(t) { // el saber 23: estacas, cuerda y nudos, en etapas
  const pa = P(CUERDA_A.x, CUERDA_A.y), pb = P(CUERDA_B.x, CUERDA_B.y), s = zoom, niv = nivelTec(23);
  const DX = CUERDA_SITIO.x - 9.3, DY = CUERDA_SITIO.y - 9.8;   // para lo que aún cuelga del sitio viejo
  sombra(CUERDA_SITIO.x, CUERDA_SITIO.y + 0.1, 14, 5);
  line({ x: pa.x, y: pa.y - 6 * s }, { x: pa.x, y: pa.y }, '#8a6a4a', 1.4 * s);      // las estacas
  line({ x: pb.x, y: pb.y - 6 * s }, { x: pb.x, y: pb.y }, '#8a6a4a', 1.4 * s);
  g.strokeStyle = '#d8cba8'; g.lineWidth = 1 * s; g.lineCap = 'round';
  g.beginPath(); g.moveTo(pa.x, pa.y - 5 * s);
  g.quadraticCurveTo((pa.x + pb.x) / 2, pa.y - 1 * s, pb.x, pb.y - 5 * s); g.stroke(); // la cuerda
  const nudos = niv >= 1 ? 12 : 3;                                                     // etapa 1: LOS DOCE NUDOS a distancias fijas
  for (let k = 1; k <= nudos; k++) {
    const tt = k / (nudos + 1), fx2 = pa.x + (pb.x - pa.x) * tt;
    const fy = pa.y - 5 * s + Math.sin(Math.PI * tt) * 3.4 * s + (pb.y - pa.y) * tt * 0.55;
    dot({ x: fx2, y: fy }, niv >= 1 ? 1.35 * s : 0.8 * s, niv >= 1 ? '#8f7442' : '#a8905a'); // los nudos de la etapa 1, gordos y oscuros: se cuentan de un vistazo (2026-09-06: la etapa medía 7-8%, al filo de la vara)
  }
  if (niv >= 1) { // y el rollo de cuerda de repuesto colgado de la estaca, con el mazo de clavar al pie
    for (let k2 = 0; k2 < 3; k2++) { g.strokeStyle = '#d8cba8'; g.lineWidth = 1.2 * s; g.beginPath(); g.ellipse(pa.x - 2.8 * s, pa.y - (3.6 - k2 * 1.0) * s, 3.0 * s, 1.5 * s, 0, 0, 7); g.stroke(); }
    line({ x: pb.x + 2.2 * s, y: pb.y + 0.6 * s }, { x: pb.x + 8.4 * s, y: pb.y - 2.6 * s }, '#8a6a4a', 1.3 * s); // el mango del mazo
    g.save(); g.translate(pb.x + 8.6 * s, pb.y - 2.8 * s); g.rotate(-0.5); g.fillStyle = '#6f5535'; g.fillRect(-2.6 * s, -1.6 * s, 5.2 * s, 3.2 * s); g.restore(); // la cabeza
  }
  if (niv >= 2) { // etapa 2: EL TRIÁNGULO TENDIDO: la tercera estaca y el ángulo recto en el suelo
    const pc = P(CUERDA_SITIO.x - 0.7, CUERDA_SITIO.y + 0.1);
    line({ x: pc.x, y: pc.y - 5 * s }, { x: pc.x, y: pc.y }, '#8a6a4a', 1.3 * s);
    g.strokeStyle = '#c9bd96'; g.lineWidth = 0.8 * s;
    g.beginPath(); g.moveTo(pa.x, pa.y - 0.5 * s); g.lineTo(pc.x, pc.y - 0.5 * s); g.lineTo(pb.x, pb.y - 0.5 * s); g.stroke();
    poly([{ x: pc.x, y: pc.y - 2.6 * s }, { x: pc.x + 2 * s, y: pc.y - 2.2 * s }, { x: pc.x + 1.8 * s, y: pc.y - 0.6 * s }, { x: pc.x - 0.2 * s, y: pc.y - 1 * s }], 'rgba(233,224,198,.5)'); // la escuadra del ángulo
  }
  if (niv >= 3) { // etapa 3: LOS MOJONES: las esquinas que la crecida ya no borra
    for (const [mx0, my0] of [[8.3, 9.95], [10.3, 9.65], [9.5, 10.75], [8.85, 10.5]]) {
      const mx = mx0 + DX, my = my0 + DY;
      const q = P(mx, my);
      sombra(mx, my + 0.06, 6, 2.4);
      poly([{ x: q.x - 2.5 * s, y: q.y }, { x: q.x, y: q.y - 5 * s }, { x: q.x + 2.5 * s, y: q.y }, { x: q.x, y: q.y + 1.4 * s }], '#e9e2d0');
      poly([{ x: q.x, y: q.y - 5 * s }, { x: q.x + 2.5 * s, y: q.y }, { x: q.x + 1.4 * s, y: q.y + 0.8 * s }, { x: q.x - 0.1 * s, y: q.y - 3.7 * s }], '#cfc6b0');
      line({ x: q.x - 0.7 * s, y: q.y - 2.2 * s }, { x: q.x + 0.7 * s, y: q.y - 2.2 * s }, '#a89a78', 0.5 * s); // la marca del linde
    }
  }
  estadoTec(23, { x: (pa.x + pb.x) / 2, y: pa.y - 16 * s }, t);
}
/* --- la vida de las riberas: Sumer y Egipto --- */
function drawBarcaJuncos(t) { // la barca de juncos, amarrada en la orilla
  const s = zoom, bob = Math.sin(t * 1.1) * 1.2 * s;
  const p = P(15.0, 12.35, -8);
  const q = P(15.75, 12.0);
  line({ x: q.x, y: q.y - 7 * s }, { x: q.x, y: q.y }, '#8a6a4a', 1.6 * s);         // el poste de amarre
  g.strokeStyle = 'rgba(138,106,74,.75)'; g.lineWidth = 0.8 * s;                     // la soga
  g.beginPath(); g.moveTo(p.x + 12 * s, p.y + bob - 8 * s);
  g.quadraticCurveTo((p.x + q.x) / 2 + 4 * s, p.y - 1 * s, q.x, q.y - 5 * s); g.stroke();
  g.save(); g.translate(p.x, p.y + bob - 3 * s); g.rotate(-0.22);
  g.fillStyle = '#c9b878';
  g.beginPath(); g.moveTo(-12 * s, -2 * s);
  g.quadraticCurveTo(0, 2.6 * s, 12 * s, -2 * s);                                    // el casco de junco
  g.quadraticCurveTo(14.5 * s, -4.6 * s, 15.5 * s, -8 * s);                          // la proa alzada
  g.lineTo(12.5 * s, -3.8 * s);
  g.quadraticCurveTo(0, -0.6 * s, -12.5 * s, -3.8 * s);
  g.lineTo(-15.5 * s, -8 * s);                                                       // la popa alzada
  g.quadraticCurveTo(-14.5 * s, -4.6 * s, -12 * s, -2 * s);
  g.closePath(); g.fill();
  g.strokeStyle = '#a8935a'; g.lineWidth = 0.9 * s;                                  // las ataduras
  for (const k of [-7, -2.5, 2, 6.5]) {
    g.beginPath(); g.moveTo(k * s, -3.4 * s); g.lineTo(k * s, 0.6 * s); g.stroke();
  }
  g.restore();
}
function drawCampoCebada(t) { // la parcela: surcos y cebada; en la aldea neolítica crece hasta dorarse
  const s = zoom;
  const gr = S.era === 1 ? Math.min(1, S.cultivo || 0) : 1;   // en Sumer el templo la mantiene siempre alta
  const maduro = S.era === 1 && (S.cultivo || 0) >= 1;
  const R = campoRect(), an = R.x1 - R.x0, al = R.y1 - R.y0;   // la parcela se agranda al perfeccionar
  poly([P(R.x0, R.y0), P(R.x1, R.y0), P(R.x1, R.y1), P(R.x0, R.y1)], 'rgba(180,150,88,.5)');
  g.strokeStyle = 'rgba(146,116,74,.45)'; g.lineWidth = 1.2 * s; g.lineCap = 'round';
  const surcos = 4 + nivelTec(24);
  for (let k = 0; k < surcos; k++) { // los surcos, uno más por cada etapa
    const yy = R.y0 + al * (k + 0.6) / (surcos + 0.4);
    const a0 = P(R.x0 + 0.15, yy), a1 = P(R.x1 - 0.15, yy);
    g.beginPath(); g.moveTo(a0.x, a0.y); g.lineTo(a1.x, a1.y); g.stroke();
  }
  const cTallo = lerpHex('#7da24e', '#c9a84a', gr), cEspiga = lerpHex('#8fae56', '#d9a53f', gr);
  const cols = 4 + nivelTec(24), filas = 4 + nivelTec(24);   // más mata sembrada por cada etapa
  const nS = nivelTec(24), gord = 1 + nS * 0.16;
  const cAwn = lerpHex('#a9c06a', '#e6cf82', gr);        // las aristas, un tono más claro que la espiga
  g.lineCap = 'round';
  for (let i = 0; i < cols; i++) for (let j = 0; j < filas; j++) { // la cebada: caña, hoja, espiga y aristas
    const b = P(R.x0 + 0.35 + an * i / (cols + 0.6), R.y0 + 0.22 + al * j / (filas + 0.5));
    const sway = Math.sin(t * 1.3 + i * 1.7 + j) * 1.6 * s * (0.4 + 0.6 * gr);
    if (gr < 0.1) { // el brote recién sembrado: dos hojitas que asoman
      g.strokeStyle = '#6f9a45'; g.lineWidth = 1 * s;
      g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x - 1.4 * s + sway, b.y - 3 * s); g.stroke();
      g.beginPath(); g.moveTo(b.x, b.y); g.lineTo(b.x + 1.4 * s + sway, b.y - 2.6 * s); g.stroke();
      continue;
    }
    const alto = (5 + 7 * gr) * s * (1 + nS * 0.05), tx = b.x + sway, ty = b.y - alto;
    g.strokeStyle = cTallo; g.lineWidth = 1.1 * s;                                 // la caña
    g.beginPath(); g.moveTo(b.x, b.y); g.quadraticCurveTo(b.x + sway * 0.4, b.y - alto * 0.5, tx, ty); g.stroke();
    const lado = (i % 2) ? 1 : -1, lx = b.x + sway * 0.35, ly = b.y - alto * 0.42; // una hoja larga
    g.beginPath(); g.moveTo(lx, ly); g.quadraticCurveTo(lx + lado * 4 * s, ly - 1.2 * s, lx + lado * 2.6 * s, ly - 5 * s); g.stroke();
    const earLen = (3.5 + 3.5 * gr) * s * gord, grains = 3 + Math.round(gr * 3) + (nS >= 2 ? 1 : 0);
    for (let k = 0; k < grains; k++) { // la espiga: dos hileras de grano, más gordo abajo
      const f = grains > 1 ? k / (grains - 1) : 0, ey = ty + earLen - f * earLen, ex = tx + Math.sin(f * 3 + sway) * 0.3 * s;
      const gw = (1.15 - f * 0.4) * s * gord;
      dot({ x: ex - 0.7 * s * gord, y: ey }, gw, cEspiga);
      dot({ x: ex + 0.7 * s * gord, y: ey }, gw, cEspiga);
    }
    if (gr > 0.28) { // LAS ARISTAS: el abanico de barbas hacia arriba que hace inconfundible a la cebada
      g.strokeStyle = cAwn; g.lineWidth = 0.7 * s;
      const awnLen = (4 + 7 * gr) * s * gord, nAwn = 3 + (nS >= 1 ? 1 : 0);
      for (let a = 0; a < nAwn; a++) {
        const ang = -Math.PI / 2 + (a - (nAwn - 1) / 2) * 0.3;
        g.beginPath(); g.moveTo(tx, ty + 0.5 * s);
        g.lineTo(tx + Math.cos(ang) * awnLen + sway * 0.3, ty + 0.5 * s + Math.sin(ang) * awnLen); g.stroke();
      }
    }
    if (nS >= 3 && ((i + j) % 3 === 0)) { // el brillo de la espiga bien granada
      g.save(); g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 2.4 + i + j);
      dot({ x: tx + 0.8 * s, y: ty + 1.5 * s }, 0.6 * s, '#fff6d8'); g.restore();
    }
  }
  if (maduro) { // el convite de la cosecha: un anillo dorado que respira
    const pu = 0.5 + 0.5 * Math.sin(t * 3.2), c = P(4.65, 11.15);
    g.save(); g.globalAlpha = 0.35 + 0.4 * pu;
    g.strokeStyle = '#ffd24a'; g.lineWidth = 2 * s;
    g.beginPath(); g.ellipse(c.x, c.y, (40 + pu * 4) * s, (19 + pu * 2) * s, 0, 0, 7); g.stroke();
    g.restore();
  }
}
// LA ALDEA CRECE CON LA PERFECCIÓN: cada etapa de un saber se VE en el mundo, no solo en los pips.
// El espacio crece POCO (un tercio de lo que probamos: el mundo es estrecho y la cosecha y el corral
// se comían a sus vecinos). Lo que de verdad marca el nivel es el DETALLE, no el tamaño.
// El cerco y la parcela se extienden hacia el este y el sur (como se amplía una finca de verdad),
// y el rebaño y las pinturas se multiplican. nivel 0..3 → nivel(i).
