/* ============================================================
   13-audio
   El sonido: bus de efectos, tonos, ruidos, ambientes y el frotar de las varas.
   ============================================================ */
let AC = null, sfxBus = null;
function audio() {
  if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
  if (!sfxBus) {
    // BUS MAESTRO de efectos: compresor suave (pega las capas y evita que sature al apilarse) + un lowpass
    // cálido (quita la aspereza aguda) + una reverb corta de sala que UBICA los sonidos en el diorama.
    const comp = AC.createDynamicsCompressor();
    comp.threshold.value = -16; comp.knee.value = 22; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.16;
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 7200; lp.Q.value = 0.5;
    const out = AC.createGain(); out.gain.value = 0.82;
    comp.connect(lp); lp.connect(out); out.connect(AC.destination);
    const rev = AC.createConvolver();               // impulso de sala pequeña, generado en runtime (sin archivos)
    const len = Math.floor(AC.sampleRate * 0.55), buf = AC.createBuffer(2, len, AC.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.8); }
    rev.buffer = buf;
    const wet = AC.createGain(); wet.gain.value = 0.11; rev.connect(wet); wet.connect(comp);
    sfxBus = AC.createGain(); sfxBus.gain.value = 1;
    sfxBus.connect(comp); sfxBus.connect(rev);      // seco + húmedo
  }
  if (AC.state === 'suspended') AC.resume();
  return AC;
}
/* EL DESBLOQUEO DEL SONIDO (2026-08-25, del ojo del jugador: «los sonidos que me dijiste que iban a
   haber, no hay nada»). Chrome crea todo AudioContext SUSPENDIDO y solo lo deja sonar si alguien lo
   reanuda desde un gesto real. El motor solo llamaba a resume() dentro de cada efecto, así que bastaba
   con que los primeros gestos no produjeran sonido (panear, hacer zoom, abrir una ficha) para que el
   contexto siguiera dormido y el juego entero fuera mudo: medido en la partida de Egipto, el contexto
   seguía 'suspended' después de varios clics. Ahora el primer gesto lo despierta, pase lo que pase. */
let audioDespierto = false;
function despertarAudio() {
  if (audioDespierto) return;
  const ac = audio();
  if (ac.state === 'suspended') ac.resume().then(() => { audioDespierto = ac.state === 'running'; }).catch(() => {});
  else audioDespierto = true;
}
for (const ev of ['pointerdown', 'touchstart', 'keydown', 'click']) {
  window.addEventListener(ev, despertarAudio, { capture: true, passive: true });
}
function tono(freq, dur, tipo, vol, cuando = 0) {
  if (S.mute) return;
  const ac = audio(), o = ac.createOscillator(), ga = ac.createGain();
  o.type = tipo; o.frequency.value = freq;
  ga.gain.setValueAtTime(0.0001, ac.currentTime + cuando);
  ga.gain.exponentialRampToValueAtTime(vol, ac.currentTime + cuando + 0.006);   // ATAQUE suave: sin el clic del arranque brusco
  ga.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + cuando + dur);
  o.connect(ga); ga.connect(sfxBus);
  o.start(ac.currentTime + cuando); o.stop(ac.currentTime + cuando + dur + 0.05);
}
const sfx = {
  campana() { tono(880, 1.2, 'triangle', .18); tono(1760, 0.7, 'sine', .06); },
  logro()   { tono(523, .18, 'triangle', .14); tono(659, .18, 'triangle', .14, .13); tono(784, .4, 'triangle', .16, .26); },
  polvo()   { tono(220, .3, 'sawtooth', .07); tono(174, .5, 'sawtooth', .07, .18); },
  hito()    { tono(659, .15, 'sine', .12); tono(988, .3, 'sine', .1, .1); },
  moneda()  { tono(1318, .12, 'square', .05); tono(1568, .18, 'square', .04, .08); },
  visita()  { tono(330, .12, 'sine', .14); tono(330, .12, 'sine', .14, .2); }, // toc, toc
  chispa()  { ruido(.05, .05, 0, 2600); tono(2300 + Math.random() * 700, .045, 'square', .02); },     // el roce de las varas
  fuego()   { // LA IGNICIÓN: un soplo que sube, el ¡whoosh! y la brasa que respira grave
    ruido(.35, .06, 0, 900); ruido(.6, .1, .12, 1600); tono(70, 1.0, 'sine', .17); tono(105, .6, 'sine', .1, .16);
    for (let i = 0; i < 5; i++) ruido(.05, .04, .25 + i * .09, 3000); },                               // el crepitar naciente
  lena()    { tono(150, .1, 'sine', .13); tono(95, .16, 'sine', .1, .02); ruido(.28, .05, .04, 2200); }, // el leño cae y el fuego crepita
  recoger() { tono(340, .06, 'sine', .1); tono(500, .09, 'triangle', .055, .02); ruido(.04, .03, 0, 800); }, // juntar del suelo: un "tup" orgánico, NO una moneda
  chispita() { tono(1500, .08, 'sine', .05); tono(2100, .1, 'sine', .045, .05); tono(2700, .12, 'sine', .04, .1); }, // la chispa de curiosidad: destello ascendente
  sorbo()   { tono(520, .12, 'sine', .06); tono(380, .2, 'sine', .05, .09); ruido(.16, .025, 0, 700); }, // servir y sorber las hierbas
  oveja()   { tono(440, .09, 'sawtooth', .05); tono(400, .12, 'sawtooth', .055, .09); tono(455, .1, 'sawtooth', .045, .22); }, // el balido
  tambor()  { tono(120, .18, 'sine', .16); tono(78, .32, 'sine', .12, .01); ruido(.07, .06, 0, 1400); },  // el parche del tambor
  tap()     { tono(660, .04, 'triangle', .035); tono(880, .05, 'sine', .025, .02); },                    // abrir una ficha: toque suave de UI
  noche()   { tono(294, .5, 'sine', .05); tono(196, .85, 'sine', .05, .28); },                           // cae la noche
  amanecer() { tono(392, .4, 'sine', .045); tono(587, .6, 'sine', .045, .24); },                         // amanece
  cosecha() { ruido(.16, .05); tono(659, .1, 'triangle', .06, .08); tono(880, .16, 'triangle', .05, .18); }, // el swish de la espiga y el grano que cae
  redoble() { [0, .13, .25, .35, .43, .5].forEach((d, i) => tono(104 + i * 6, .08, 'sine', .09, d)); },      // la partida sale: pasos y tambor que aceleran
  barrito() { tono(233, .1, 'sawtooth', .06); tono(311, .12, 'sawtooth', .08, .09); tono(415, .3, 'sawtooth', .1, .19); tono(392, .16, 'sawtooth', .05, .44); }, // la trompeta indignada del mamut
  historia() { tono(392, .3, 'sine', .09); tono(330, .3, 'sine', .085, .26); tono(262, .55, 'sine', .1, .52); }, // "érase una vez": tres tonos que bajan al fuego
  muesca()  { ruido(.05, .05, 0, 5200); tono(1180, .05, 'triangle', .045); tono(820, .07, 'sine', .03, .03); }, // el sílex raspa el hueso: seco, corto, satisfactorio
  signo()   { ruido(.1, .04, 0, 1200); tono(196, .3, 'sine', .1, .04); tono(294, .45, 'triangle', .07, .12); tono(392, .7, 'sine', .08, .3); }, // el barro cede bajo el pulgar y la marca se queda
  canto()   { [[392, .5, 0], [523, .5, .38], [587, .65, .76], [523, .55, 1.22], [392, 1.0, 1.68]].forEach(([f, d, c]) => { tono(f, d, 'sine', .075, c); tono(f / 2, d, 'sine', .026, c); }) }, // el himno a Inanna: una voz que sube hacia la estrella y vuelve, con su sombra grave una octava abajo
  /* SUMER TIENE SUS PROPIOS EFECTOS (2026-09-06: sellar, corregir y destapar sonaban con «recoger» y con la
     campana del fogón; la Época 1 tiene ocho voces propias y Egipto tres, Sumer solo tenía el canto). */
  sello()   { ruido(.06, .045, 0, 700); tono(160, .12, 'sine', .11); tono(240, .08, 'triangle', .04, .05); },      // el sello se hunde en el barro: un golpe sordo y corto
  corregir() { tono(1250, .035, 'triangle', .045); tono(1450, .035, 'triangle', .04, .07); ruido(.05, .025, .07, 2600); tono(330, .22, 'sine', .05, .14); }, // dos toques del cálamo sobre la tablilla y el barro que se alisa
  azolve()  { ruido(.32, .045, 0, 1100, .3); ruido(.5, .035, .12, 1900, .3); tono(210, .35, 'sine', .05, .05); },   // el canal se destapa: el agua vuelve a correr
  raspa()   { ruido(.09, .05, 0, 3800); ruido(.06, .032, .07, 4600); tono(880, .04, 'triangle', .02, .02); }, // EGIPTO: el cálamo raspa la caliza: seco, granulado, distinto del hueso y del barro
  /* ATENAS (era4-plan): un efecto por verbo, al nivel de las otras épocas */
  alisar()  { ruido(.14, .04, 0, 1400, .25); tono(520, .1, 'triangle', .045, .05); },                          // el estilo alisa la cera: la respuesta dicha, y la tablilla lista otra vez
  secreto() { tono(220, 1.8, 'triangle', .025); tono(440, .7, 'sine', .045); tono(659, .8, 'sine', .045, .2); tono(880, 1.0, 'sine', .04, .42); tono(1319, 1.6, 'sine', .03, .66); tono(1760, 1.2, 'sine', .015, .9); }, // el hallazgo de un secreto: campanas de cristal que suben sobre un bordón grave
  eureka()  { tono(659, .14, 'triangle', .07); tono(880, .16, 'triangle', .07, .11); tono(1319, .38, 'sine', .08, .22); tono(660, .5, 'sine', .03, .22); }, // la aporía se resuelve: el «!» que sube
  bolsa()   { for (let i = 0; i < 4; i++) tono(2400 + i * 320, .05, 'square', .028, i * .06); ruido(.08, .03, .1, 2200); }, // la bolsa del sofista: monedas que suenan al cobrar
  papiro()  { ruido(.25, .04, 0, 1600); tono(392, .3, 'triangle', .07, .08); tono(523, .45, 'triangle', .06, .2); }, // el frote de la hoja al desenrollarse y el acorde del evento: algo quedó escrito para siempre
  /* ALEJANDRÍA (era5-plan): el rollo que se desenrolla al catalogar, la campana del barco que amarra y el «¡ah!» de la sombra */
  desenrollar() { ruido(.3, .04, 0, 1500, .15); ruido(.16, .028, .22, 2600); tono(587, .16, 'triangle', .05, .32); tono(784, .34, 'sine', .045, .44); }, // el papiro que se abre, y la nota de lo que ya se encuentra
  campanaBarco() { tono(880, .9, 'sine', .045); tono(1320, .5, 'sine', .02, .02); tono(880, .7, 'sine', .032, .55); tono(1320, .4, 'sine', .014, .57); }, // la campana de a bordo, dos veces, al entrar al puerto
  sombra()  { tono(262, .9, 'sine', .04); tono(523, .2, 'triangle', .06, .05); tono(659, .2, 'triangle', .06, .17); tono(1047, .7, 'sine', .07, .3); }, // el «¡ah!» de la sombra medida: sube, y queda
  cuerdaTensa() { ruido(.05, .03, 0, 900); tono(196, .16, 'triangle', .09); tono(147, .3, 'sine', .07, .1); }, // la cuerda del agrimensor se tensa y da su nota grave
  caravana() { [0, .18, .36, .62, .8].forEach((d, i) => { tono(1180 + (i % 2) * 140, .22, 'triangle', .026, d); tono(2360 + (i % 2) * 280, .1, 'sine', .008, d + .01); }); ruido(.5, .018, .1, 500, .3); }, // los cencerros de los camellos al llegar, y el polvo
  calamo()  { for (let i = 0; i < 4; i++) ruido(.05, .022, i * .09, 3200 + i * 200); tono(440, .14, 'triangle', .035, .42); }, // el cálamo sobre el papel: cuatro trazos y la nota de lo empezado
  ijaza()   { tono(392, .35, 'sine', .05); tono(494, .35, 'sine', .05, .12); tono(587, .6, 'triangle', .05, .26); tono(784, .8, 'sine', .04, .42); }, // el permiso escrito: tres notas que suben y una que queda
  herencia() { tono(659, .12, 'triangle', .05); tono(659, .12, 'triangle', .05, .14); ruido(.06, .03, .3, 2200); tono(523, .18, 'triangle', .05, .34); tono(784, .5, 'sine', .045, .5); }, // los dos platos de la balanza, la moneda y el reparto que cuadra
  nace()     { tono(880, .18, 'sine', .03); tono(1047, .25, 'sine', .028, .16); ruido(.08, .01, .02, 3000); },   // un llanto chiquito y la casa que se alegra
  promesa()  { tono(220, .2, 'triangle', .05); tono(330, .2, 'triangle', .045, .16); tono(440, .45, 'sine', .04, .32); ruido(.12, .02, .32, 900, .2); },   // la promesa: tres pasos del tambor y la palabra dada
  diligencia() { [0, .2, .4, .6].forEach(d => { ruido(.06, .02, d, 700); tono(160, .06, 'sine', .03, d); }); tono(880, .12, 'triangle', .02, .1); tono(988, .12, 'triangle', .02, .5); },   // los cascos de los caballos y la campanilla de la diligencia que sale
  componer() { for (let i = 0; i < 6; i++) tono(2400 + (i % 3) * 300, .025, 'square', .012, i * .09); ruido(.05, .02, .58, 2600); },   // las letras de metal que caen una a una en el componedor
  prensa()   { ruido(.18, .05, 0, 500, .05); tono(98, .22, 'sine', .05, .02); ruido(.12, .03, .26, 1800); },   // el tornillo de la prensa que baja, el golpe y el pliego que se despega
  campanaPa() { [[1, .9, .05], [2, .7, .04], [2.4, .9, .03], [3, .6, .02], [4, .5, .014]].forEach(([m, d, v]) => tono(196 * m, d * 2.4, 'sine', v)); tono(98, 2.8, 'sine', .03); },   // la campana de la abadía: la nota, su octava, la tercera menor que tienen las campanas y el zumbido grave que queda
  disputa()  { tono(330, .18, 'triangle', .04); tono(311, .18, 'triangle', .04, .22); tono(330, .18, 'triangle', .04, .44); tono(294, .18, 'triangle', .04, .66); [262, 330, 392].forEach(f => tono(f, .8, 'sine', .03, .92)); },   // sic, non, sic, non… y el maestro determina: el acorde que cierra
  sello()    { ruido(.08, .05, 0, 300); tono(110, .25, 'sine', .07); tono(523, .5, 'sine', .035, .2); tono(784, .9, 'sine', .03, .34); },   // el sello de cera de la universidad, golpe grave y la licencia que suena
  canto()    { [0, .32, .64, .96, 1.2].forEach((d, i) => { tono(i % 2 ? 98 : 82, .28, 'sine', .07, d); ruido(.06, .03, d, 180); }); [0, .64].forEach(d => { tono(392, .16, 'triangle', .03, d + .16); tono(330, .16, 'triangle', .03, d + .4); }); },   // el huéhuetl (grave) y el teponaztli (las dos lengüetas de madera)
  examen()   { [0, .5, 1].forEach((d, i) => { tono(73, .4, 'sine', .07 - i * .015, d); ruido(.07, .03, d, 160); }); tono(147, 2.2, 'sine', .045, 1.4); tono(220, 1.6, 'sine', .022, 1.42); tono(311, 1.1, 'sine', .01, 1.44); }   // KAIFENG: los tres golpes del tambor que abren el recinto del examen, y el gong de bronce
};
function sonidoFicha(k) { // tocar un elemento del mundo da voz al elemento: la oveja bala, el tambor suena, lo demás un toque suave
  if (/^(coveja|oveja)\d/.test(k)) sfx.oveja();
  else if (k === 'percu') sfx.tambor();
  else sfx.tap();
}
function frotarVaras() { // el primer acto de la humanidad, clic a clic
  if (ordEra(S.era) >= 11 || S.fuegoDescubierto) return;
  const antes = S.fuego;
  S.fuego = Math.min(100, S.fuego + 6 + Math.random() * 9);
  sfx.chispa();
  { const ahora = performance.now(); for (let i = 0; i < 10; i++) fx.chispas.push({ born: ahora, vx: (Math.random() * 2 - 1) * 46, vz: 52 + Math.random() * 46, col: ['#ffd873', '#ff9d3a', '#fff0b0', '#ffbe4a'][i % 4] }); }
  for (const [umbral, msj] of [[25, '🪵 Frotas las varas… una chispa salta y muere.'], [50, '🪵 Humo. ¡Hay humo!'], [75, '🪵 Una brasa roja late en la yesca…']])
    if (antes < umbral && S.fuego >= umbral) toast(msj);
  if (S.fuego >= 100) {
    S.fuegoDescubierto = true;
    S.anoFase = DUR_ESTACION * (Math.floor((tJuegoVis + DUR_ESTACION / 2) / DUR_ESTACION) + 1); // el año empieza con el fuego (A6): primavera hasta la segunda medianoche
    document.querySelectorAll('#toasts .toast').forEach(t => { if (/^(🪵|🌒)/.test(t.textContent.trim())) t.remove(); });   // los avisos del frote ya no llegan tarde (QA completo)
    S.tecs[14].fase = 'meseta'; // el fuego entra al museo
    sfx.fuego();
    toast('🔥 <b>¡EL FUEGO!</b> La noche retrocede, el clan se acerca, las historias despiertan. La primera aula de la humanidad está encendida.', 16000);
  }
  renderHUD(); guardar();
}
function ruido(dur, vol, cuando = 0, corte = 1200, ataque = 0) { // soplo filtrado (crepitar, viento, roce). `corte` mueve el color
  /* `ataque`: fracción de la duración que tarda en ENTRAR. Con 0 (el default, todos los efectos
     percusivos) arranca a plena amplitud y decae, que es la envolvente de un golpe: para un roce o
     una chispa está bien, pero un ambiente largo así es una ola rompiendo (tercera tanda de Egipto:
     «golpes muy fuertes, uno, dos, tres»). Con ataque > 0 el soplo crece y se va: respira. */
  if (S.mute) return;
  const ac = audio(), n = Math.floor(ac.sampleRate * dur);
  const buf = ac.createBuffer(1, n, ac.sampleRate);
  const d = buf.getChannelData(0);
  const na = Math.floor(n * ataque);
  for (let i = 0; i < n; i++) {
    const env = i < na ? Math.sin((i / na) * Math.PI / 2) : 1 - (i - na) / (n - na);
    d[i] = (Math.random() * 2 - 1) * env;
  }
  const src = ac.createBufferSource(); src.buffer = buf;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = corte;
  const ga = ac.createGain(); ga.gain.value = vol;
  src.connect(f); f.connect(ga); ga.connect(sfxBus);
  src.start(ac.currentTime + cuando);
}
// sonido diegético: cada aparato dominado se deja oír de vez en cuando
const amb = { gramofono: 20, radio: 30, cine: 40 };
/* SIN MÚSICA HASTA TERMINAR (decisión del usuario, 2026-09-06): «la música aparece de repente, no sé
   cómo está funcionando; yo la sacaría por mientras y dejaría solo los efectos». El arpista de Egipto
   queda escrito pero apagado; el paisaje sonoro de cada época son sus efectos y sus ambientes
   diegéticos (agua, fuego, bichos, voces), nunca una pista. Cuando el juego esté terminado, se
   decide si vuelve y cómo. */
const MUSICA_AMBIENTE = false;
/* EL LECHO DEL RÍO (2026-08-25, del ojo del jugador: «los sonidos que me dijiste que iban a haber, no
   hay nada»). Los ambientes de agua eran ráfagas cada 6-11 s a volumen .045: en un parlante de laptop
   eso es silencio con pausas. Un río no hace ráfagas, suena SIEMPRE. Este es un lecho continuo de
   ruido rosado filtrado, con la respiración lenta del agua encima, que vive mientras la época tenga
   río y calla en las que no. El Nilo va más grave y más ancho que el río de Sumer. */
let lecho = null;
function lechoRio(nivel) {
  if (!nivel && !lecho) return;                       // sin río y sin lecho creado: nada que hacer
  const ac = audio();
  if (!lecho) {
    const len = Math.floor(ac.sampleRate * 3), buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0); let last = 0;
    for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.4; }
    const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
    const bp = ac.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 760; bp.Q.value = 0.5;
    const gg = ac.createGain(); gg.gain.value = 0;
    const lfo = ac.createOscillator(); lfo.frequency.value = 0.07;   // la respiración del agua, lentísima
    const lg = ac.createGain(); lg.gain.value = 0.018; lfo.connect(lg); lg.connect(gg.gain);
    src.connect(bp); bp.connect(gg); gg.connect(sfxBus);
    src.start(); lfo.start();
    lecho = { g: gg, f: bp };
  }
  /* v3 del Nilo (2026-08-31, cuarta tanda): iba a 620 Hz y gain .075 y el usuario seguía oyendo
     «el mismo ruido de olas»: un lecho grave y fuerte ES oleaje, lo respire como lo respire. El del
     Nilo queda alto y quedo, agua lejana de verdad; el de Sumer no se toca (pasó su A/B). */
  lecho.f.frequency.setTargetAtTime(S.era === 3 ? 980 : S.era === 4 ? 1150 : S.era === 5 ? 520 : S.era === 6 ? 760 : S.era === 7 ? 600 : S.era === 8 ? 680 : S.era === 9 ? 620 : S.era === 10 ? 820 : S.era === 14 ? 700 : S.era === 15 ? 740 : S.era === 21 ? 1050 : 900, ac.currentTime, 1.5); // Bagdad: el Tigris, ancho y lento // Alejandría: el mar del puerto, que sí es oleaje // el Ilisos, chico y agudo
  lecho.g.gain.setTargetAtTime(nivel, ac.currentTime, 1.4);
}
function ambientes(t) {
  // el lecho manda antes que nada: es el único sonido que no espera turno
  lechoRio(S.mute ? 0 : (S.era === 3 ? 0.028 : S.era === 2 ? 0.05 : S.era === 4 ? 0.03 : S.era === 5 ? 0.045 : S.era === 6 ? 0.034 : S.era === 7 ? 0.04 : S.era === 8 ? 0.032 : S.era === 9 ? (estacion().i === 3 ? 0.008 : 0.028) : S.era === 10 ? (estacion().i === 1 ? 0.012 : estacion().i === 3 ? 0.04 : 0.024) : S.era === 14 ? (estacion().i === 3 ? 0.036 : 0.022) : S.era === 15 ? (estacion().i === 1 ? 0.034 : estacion().i === 3 ? 0.014 : 0.024) : S.era === 21 ? 0.01 : 0));   // EL FUTURO: la laguna de la Época 1, quieta   // KAIFENG: el Bian, crecido con las lluvias del verano y bajo en el invierno
  if (S.mute) return;
  if (S.tecs[2].fase === 'meseta' && t > amb.gramofono) {
    amb.gramofono = t + 22 + Math.random() * 10;
    [523, 659, 784, 659].forEach((f, i) => tono(f, .25, 'triangle', .04, i * .22)); // cajita musical
  }
  if (S.tecs[4] && S.tecs[4].fase === 'meseta' && t > amb.radio) {
    amb.radio = t + 26 + Math.random() * 10;
    ruido(.5, .02);
    [392, 494, 587].forEach((f, i) => tono(f, .3, 'sine', .045, .15 + i * .28)); // jingle radial
  }
  if (S.tecs[6] && S.tecs[6].fase === 'meseta' && t > amb.cine) {
    amb.cine = t + 24 + Math.random() * 8;
    for (let i = 0; i < 6; i++) tono(2200, .02, 'square', .012, i * .09); // traqueteo del proyector
  }
  if (S.tecs[7] && S.tecs[7].fase === 'meseta' && t > (amb.tv || 45)) {
    amb.tv = t + 28 + Math.random() * 10;
    [659, 659, 494, 587].forEach((f, i) => tono(f, .16, 'square', .022, i * .18)); // sintonía de la TV
  }
  if (S.era === 1 && S.tecs[11] && S.tecs[11].fase === 'meseta' && t > (amb.tambor || 15)) {
    amb.tambor = t + 18 + Math.random() * 8;
    [0, .22, .44, .78].forEach(d => tono(96, .12, 'sine', .12, d)); // el pulso del tambor (SOLO el fogón: con era<11 sonaba en Sumer sin tambor a la vista; lo cazó el oído del usuario, 2026-08-23)
  }
  if (S.era === 1 && S.fuegoDescubierto && S.fuego > 40 && t > (amb.fuego || 12)) {
    amb.fuego = t + 9 + Math.random() * 7; // el crepitar de la fogata viva
    ruido(.04, .028); ruido(.03, .022, .1 + Math.random() * .15); tono(88, .07, 'sine', .028, .05);
  }
  if (S.era === 1 && S.fuegoDescubierto && luzDia() < 0.4 && t > (amb.grillo || 20)) {
    amb.grillo = t + 6 + Math.random() * 6; // los grillos de la velada
    for (let i = 0; i < 3; i++) tono(4300 + Math.random() * 300, .03, 'square', .011, i * .07);
  }
  if (S.era === 1 && S.edad >= 2 && S.tecs[27] && S.tecs[27].fase === 'meseta' && t > (amb.telar || 25)) {
    amb.telar = t + 19 + Math.random() * 9; // el telar teclea su patrón: uno arriba, dos abajo
    [0, .16, .26, .5, .66, .76].forEach(d => tono(1350 + Math.random() * 120, .028, 'square', .016, d));
  }
  // EL PAISAJE SONORO DE SUMER (2026-08-23, del retoque acotado de la auditoría MDA: la época tenía
  // sfx en sus verbos pero ningún ambiente propio; el crepitar y los grillos eran del fogón).
  if (S.era === 2 && t > (amb.rio || 4)) {
    amb.rio = t + 5 + Math.random() * 4; // el río entre los juncos, casi continuo. v2 (2026-08-23): la v1 (520 Hz, vol .016, cada ~15 s) era inaudible en parlantes de laptop, lo dijo el A/B del usuario; el agua vive en 950-2400 Hz
    ruido(.9, .05, 0, 950); ruido(.7, .04, .4, 1500); ruido(.6, .022, .9, 2400);
  }
  if (S.era === 2 && S.tecs[19] && S.tecs[19].fase === 'meseta' && luzDia() >= 0.45 && t > (amb.edubba || 18)) {
    amb.edubba = t + 21 + Math.random() * 9; // la edubba recita su lista de día: una voz llama, el corro responde
    [330, 330, 392, 330].forEach((f, i) => tono(f + Math.random() * 12, .16, 'triangle', .05, i * .3));
  }
  if (S.era === 2 && luzDia() < 0.4 && t > (amb.limo || 16)) {
    amb.limo = t + 8 + Math.random() * 7; // la noche del limo: chicharras graves entre los canales
    for (let i = 0; i < 2; i++) tono(3100 + Math.random() * 240, .07, 'square', .02, i * .16);
  }
  /* EL PAISAJE SONORO DE EGIPTO (era3-plan: desde el plan, no de parche: la lección de Sumer).
     v3 del agua (2026-08-31, cuarta tanda): el usuario siguió oyendo «el mismo ruido de olas», así
     que los soplos del Nilo se van DEL TODO: el agua es solo el lecho continuo de lechoRio(), bajo
     y agudo. Si algún día vuelve una capa encima, que no sea ruido ancho: oleaje es oleaje. */
  if (MUSICA_AMBIENTE && S.era === 3 && t > (amb.arpa || 10)) {
    /* el arpista del patio (cuarta tanda: la música duró «cinco, seis segundos» y desapareció:
       una frase cada 26-44 s y solo de día no es música, es un fantasma). Ahora es una PRESENCIA:
       tres frases pentatónicas que se turnan cada 8-14 s, de día y de noche (de noche más queda),
       cada una con su octava grave de caja. La Canción del arpista es un género egipcio real. */
    amb.arpa = t + 8 + Math.random() * 6;
    amb.arpaN = ((amb.arpaN || 0) + 1) % 3;
    const FRASES = [
      [[587, 0], [523, .55], [440, 1.05], [392, 1.65], [294, 2.35], [349, 3.2], [294, 3.7]],
      [[392, 0], [440, .5], [523, 1.0], [587, 1.7], [523, 2.25], [440, 2.8], [392, 3.5]],
      [[294, 0], [349, .6], [392, 1.15], [440, 1.9], [392, 2.5], [294, 3.3], [220, 4.0]]
    ];
    const v = luzDia() >= 0.4 ? .046 : .03;
    for (const [f, c] of FRASES[amb.arpaN]) { tono(f, .85, 'triangle', v, c); tono(f / 2, 1.05, 'sine', v * .38, c); }
  }
  if (S.era === 3 && S.tecs[22] && S.tecs[22].fase === 'meseta' && luzDia() >= 0.45 && t > (amb.sala || 16)) {
    amb.sala = t + 20 + Math.random() * 9; // la sala recita la Kemyt de día: más grave que la edubba, casi un murmullo
    [294, 294, 349, 294].forEach((f, i) => tono(f + Math.random() * 10, .19, 'triangle', .05, i * .32)); // la sala se oye desde el patio, al mismo nivel que la edubba recitando (.05)
  }
  if (S.era === 3 && luzDia() < 0.4 && t > (amb.valle || 14)) {
    amb.valle = t + 9 + Math.random() * 8; // la noche del valle: chicharras más lentas y graves que las del limo
    for (let i = 0; i < 2; i++) tono(2500 + Math.random() * 200, .07, 'square', .02, i * .22); // al nivel de las chicharras del limo (.02)
  }
  if (S.era === 3 && luzDia() >= 0.45 && t > (amb.abubilla || 9)) {
    amb.abubilla = t + 11 + Math.random() * 9; // LA ABUBILLA DE DÍA (del plan): «hup-hup-hup», tres notas sordas y suaves; el día de Egipto tiene su bicho como el fogón tiene su crepitar y Sumer su río
    for (let i = 0; i < 3; i++) tono(690 + Math.random() * 20, .09, 'sine', .04, i * .19);
  }
  /* EL PAISAJE SONORO DEL ÁGORA (era4-plan, desde el plan): el arroyo como lecho (en lechoRio), las
     cigarras del verano ático de día, los grillos de noche, el coro de la tarde cuando hay lira, los pies
     en la arena de la palestra, y el murmullo de la plaza. Sin música: el coro son voces cortas. */
  if (S.era === 4 && luzDia() >= 0.45 && estacion().i === 1 && t > (amb.cigarra || 9)) {
    amb.cigarra = t + 7 + Math.random() * 6; // las cigarras: solo en verano, solo de día, un tremolo seco
    for (let i = 0; i < 6; i++) tono(3800 + Math.random() * 300, .035, 'square', .016, i * .055);
  }
  if (S.era === 4 && luzDia() < 0.4 && t > (amb.grilloAt || 16)) {
    amb.grilloAt = t + 8 + Math.random() * 7; // los grillos de la noche ática
    for (let i = 0; i < 3; i++) tono(4100 + Math.random() * 300, .03, 'square', .014, i * .07);
  }
  if (S.era === 4 && S.tecs[34] && S.tecs[34].fase === 'meseta' && luzDia() >= 0.3 && luzDia() < 0.75 && t > (amb.coro || 20)) {
    amb.coro = t + 24 + Math.random() * 10; // el coro de la tarde: cuatro voces que suben y bajan con la lira (no es pista: es la clase de música)
    [392, 440, 494, 440, 392].forEach((f, i) => { tono(f + Math.random() * 6, .22, 'triangle', .045, i * .26); tono(f / 2, .22, 'sine', .018, i * .26); });
  }
  if (S.era === 4 && S.tecs[35] && S.tecs[35].fase === 'meseta' && luzDia() >= 0.45 && t > (amb.palestra || 14)) {
    amb.palestra = t + 12 + Math.random() * 8; // los pies en la arena y el golpe del disco
    for (let i = 0; i < 4; i++) ruido(.05, .03, i * .16, 900);
    tono(160, .08, 'sine', .05, .7);
  }
  /* EL PAISAJE SONORO DE ALEJANDRÍA (era5-plan, desde el plan): el mar del puerto como lecho (en lechoRio), las
     gaviotas de día, el viento que sube del mar, y en invierno, con el mar cerrado, el murmullo de los que leen. */
  if (S.era === 5 && luzDia() >= 0.4 && t > (amb.gaviota || 7)) {
    amb.gaviota = t + 9 + Math.random() * 9; // la gaviota: un grito que cae, dos o tres veces
    const n = 2 + (Math.random() < 0.5 ? 1 : 0);
    for (let k = 0; k < n; k++) [1520, 1380, 1210].forEach((f, i) => tono(f + Math.random() * 40, .07, 'triangle', .018, k * .32 + i * .06));
  }
  if (S.era === 5 && t > (amb.viento || 12)) {
    amb.viento = t + 16 + Math.random() * 12; // el etesio: un soplo largo que entra desde el mar
    ruido(2.2, .016, 0, 700, 1.1);
  }
  if (S.era === 5 && marCerrado() && luzDia() >= 0.3 && t > (amb.lectores || 18)) {
    amb.lectores = t + 14 + Math.random() * 10; // el invierno de los lectores: se lee en voz alta, como se leía
    [196, 220, 208].forEach((f, i) => tono(f + Math.random() * 8, .14, 'triangle', .02, i * .2));
  }
  /* EL PAISAJE SONORO DE BAGDAD (era6-plan): el Tigris como lecho (en lechoRio), el agua de la noria del molino, el
     llamado del día al alba y al atardecer (un tono largo, sin voz), las tórtolas de los palmerales y, en las noches
     del verano, los grillos sobre las azoteas. */
  if (S.era === 6 && t > (amb.noria || 9)) {
    amb.noria = t + 11 + Math.random() * 8; // la noria: el agua que cae de los cangilones y el crujido de la madera
    for (let i = 0; i < 3; i++) ruido(.18, .012, i * .5, 1300, .1);
    tono(98, .35, 'sine', .022, .2);
  }
  if (S.era === 6) {
    const l = luzDia(), alba = l > 0.3 && l < 0.55;
    if (alba && t > (amb.llamado || 20)) { amb.llamado = t + 70; [294, 330, 294, 262].forEach((f, i) => tono(f, .9, 'sine', .012, i * .7)); }   // el llamado del día, lejano
    if (l >= 0.5 && t > (amb.tortola || 14)) { amb.tortola = t + 13 + Math.random() * 10; [523, 494, 523].forEach((f, i) => tono(f, .22, 'sine', .016, i * .3)); }   // la tórtola de las palmeras
    if (l < 0.35 && estacion().i === 1 && t > (amb.grillo || 10)) { amb.grillo = t + 4 + Math.random() * 4; for (let i = 0; i < 3; i++) tono(4200, .03, 'square', .004, i * .07); }   // los grillos de las noches de verano
  }
  /* EL PAISAJE SONORO DE TENOCHTITLAN (era7-plan): el lago contra las canoas como lecho (en lechoRio), el caracol del templo
     al alba y al anochecer, el huéhuetl lejano al atardecer, los patos del lago de día y las ranas de noche. */
  if (S.era === 7) {
    const l = luzDia(), alba = l > 0.3 && l < 0.55;
    if (alba && t > (amb.caracol || 20)) { amb.caracol = t + 70; tono(147, 1.6, 'sawtooth', .01, 0); tono(147, 1.6, 'sine', .02, 0); tono(220, .9, 'sine', .01, 1.0); }   // el caracol del templo, lejano
    if (l >= 0.5 && t > (amb.pato || 12)) { amb.pato = t + 12 + Math.random() * 10; [700, 640].forEach((f, i) => tono(f, .07, 'square', .006, i * .12)); }   // los patos del lago
    if (l < 0.35 && t > (amb.rana || 6)) { amb.rana = t + 3 + Math.random() * 4; for (let i = 0; i < 2; i++) tono(260 + Math.random() * 40, .06, 'square', .006, i * .14); }   // las ranas de la noche
    if (l > 0.25 && l < 0.5 && cuicacalliAbierta() && t > (amb.huehuetl || 30)) { amb.huehuetl = t + 18 + Math.random() * 8; [0, .5, 1.0].forEach(d => tono(82, .3, 'sine', .02, d)); }   // el huéhuetl de la casa del canto, lejos
  }
  /* EL PAISAJE SONORO DE PARÍS (era8-plan): el Sena como lecho (en lechoRio), la campana de la abadía en cada tiempo (en
     tocarCampana), las campanas de las otras iglesias que contestan lejos, el canto llano del claustro al alba y al
     anochecer, las cornejas de Notre-Dame de día, el viento del invierno y, de noche, el sereno que pasa con su llamado. */
  if (S.era === 8) {
    const l = luzDia(), alba = l > 0.3 && l < 0.55, inv = estacion().i === 3;
    if (alba && t > (amb.llano || 24)) { amb.llano = t + 75; [196, 220, 247, 220, 196, 175, 196].forEach((f, i) => { tono(f, .55, 'sine', .014, i * .5); tono(f / 2, .55, 'sine', .006, i * .5); }); }   // el canto llano del claustro, a una voz
    if (t > (amb.otraCampana || 40)) { amb.otraCampana = t + 38 + Math.random() * 30; tono(262 + Math.random() * 40, 2.2, 'sine', .008); tono(131, 2.6, 'sine', .006); }   // las campanas de las otras iglesias, lejos
    if (l >= 0.5 && t > (amb.corneja || 10)) { amb.corneja = t + 10 + Math.random() * 12; for (let i = 0; i < 2; i++) { ruido(.12, .012, i * .28, 900, .08); tono(520, .1, 'sawtooth', .004, i * .28); } }   // las cornejas de las torres
    if (inv && t > (amb.viento || 8)) { amb.viento = t + 9 + Math.random() * 6; ruido(2.2, .01, 0, 400, 1.2); }   // el viento del invierno
    if (l < 0.3 && t > (amb.sereno || 50)) { amb.sereno = t + 60 + Math.random() * 30; [330, 294, 262].forEach((f, i) => tono(f, .5, 'triangle', .008, i * .45)); }   // el sereno que pasa con su llamado
  }
  /* EL PAISAJE SONORO DE ROMA (era14-plan): el Tíber como lecho (en lechoRio; crecido en invierno), las fuentes del Foro que
     gotean, el ludus que recita a coro antes del amanecer (Marcial se quejaba), el murmullo del Foro de día, las golondrinas
     del verano y, de noche, los carros que entran a la ciudad (de día no podían). */
  if (S.era === 14) {
    const l = luzDia(), est = estacion().i;
    if (t > (amb.fuente || 6)) { amb.fuente = t + 7 + Math.random() * 6; for (let i = 0; i < 3; i++) tono(1800 + Math.random() * 600, .05, 'sine', .006, i * .22); ruido(.4, .006, 0, 2600, .2); }   // el agua de las fuentes
    if (l > 0.3 && l < 0.6 && ludusAbierto() && t > (amb.ludus || 14)) { amb.ludus = t + 18 + Math.random() * 8; [294, 294, 330, 294, 262].forEach((f, i) => tono(f + Math.random() * 8, .18, 'triangle', .02, i * .26)); }   // el ludus que recita a coro, al alba
    if (l >= 0.5 && t > (amb.foro || 10)) { amb.foro = t + 12 + Math.random() * 8; ruido(1.4, .008, 0, 700, .6); }   // el murmullo del Foro
    if (l >= 0.5 && est === 1 && t > (amb.golondrina || 9)) { amb.golondrina = t + 9 + Math.random() * 8; [2600, 2900, 2700].forEach((f, i) => tono(f, .05, 'sine', .006, i * .09)); }   // las golondrinas del verano
    if (l < 0.3 && t > (amb.carro || 30)) { amb.carro = t + 30 + Math.random() * 20; for (let i = 0; i < 6; i++) ruido(.08, .01, i * .18, 400, .05); }   // los carros de la noche
  }
  /* EL PAISAJE SONORO DE KAIFENG (era15-plan): el Bian como lecho (en lechoRio), las campanillas de los aleros de la Pagoda de
     Hierro con el viento, la recitación de los clásicos al alba en la escuela de la prefectura, el murmullo de los mercados de
     día, los tambores de las barcas del dragón en verano y, antes del amanecer, la tablilla de hierro con que los monjes
     recorrían las calles anunciando la quinta vigilia (Meng Yuanlao, Dongjing meng Hua lu, 1147). Sin música: solo el mundo. */
  /* EL PAISAJE SONORO DEL VALLE (era21-plan): la laguna como lecho (en lechoRio), los pájaros de la Época 1 de día, el patio
     de la escuela en los recreos, la campanilla de una bici que llega, el viento en la niebla de los bordes y, de noche, el
     fuego del círculo de piedras que vuelve a crepitar. Sin música: solo el mundo. */
  if (S.era === 21) {
    const l = luzDia(), est = estacion().i;
    if (l >= 0.5 && t > (amb.pajaro || 8)) { amb.pajaro = t + 8 + Math.random() * 9; [1760, 1980, 1760].forEach((f, i) => tono(f + Math.random() * 60, .08, 'sine', .007, i * .11)); }   // los pájaros del valle
    if (l >= 0.5 && escuelaFu() && t > (amb.patio || 12)) { amb.patio = t + 16 + Math.random() * 10; ruido(1.2, .007, 0, 900, .5); for (let i = 0; i < 3; i++) tono(440 + Math.random() * 220, .12, 'triangle', .004, .2 + i * .3); }   // el patio en el recreo
    if (l >= 0.5 && t > (amb.bici || 30)) { amb.bici = t + 35 + Math.random() * 25; tono(2637, .25, 'sine', .006); tono(2637, .25, 'sine', .005, .18); }   // la campanilla de una bici
    if (t > (amb.niebla || 15)) { amb.niebla = t + 14 + Math.random() * 10; ruido(2.6, est === 3 ? .009 : .006, 0, 320, 1.4); }   // el viento en la niebla del borde
    if (l < 0.35 && t > (amb.brasa || 3)) { amb.brasa = t + 2 + Math.random() * 3; ruido(.06, .012, 0, 2200, .02); }   // el fuego del círculo de piedras
  }
  if (S.era === 15) {
    const l = luzDia(), est = estacion().i;
    if (t > (amb.campanilla || 8)) { amb.campanilla = t + 9 + Math.random() * 9; [2093, 2349].forEach((f, i) => tono(f + Math.random() * 30, .9, 'sine', .005, i * .35)); }   // las campanillas de los aleros de la pagoda
    if (l > 0.3 && l < 0.6 && S.tecs[81] && S.tecs[81].fase === 'meseta' && t > (amb.recita || 14)) { amb.recita = t + 18 + Math.random() * 8; [262, 294, 262, 330, 294].forEach((f, i) => tono(f + Math.random() * 6, .2, 'triangle', .016, i * .3)); }   // la recitación de los clásicos, al alba
    if (l >= 0.5 && t > (amb.mercado || 10)) { amb.mercado = t + 12 + Math.random() * 8; ruido(1.5, .008, 0, 650, .6); }   // el murmullo de los mercados
    if (l >= 0.5 && est === 1 && t > (amb.tambor || 16)) { amb.tambor = t + 20 + Math.random() * 12; for (let i = 0; i < 6; i++) tono(78, .16, 'sine', .02, i * .32); }   // los tambores de las barcas del dragón, lejos
    if (l < 0.3 && t > (amb.vigilia || 40)) { amb.vigilia = t + 50 + Math.random() * 30; for (let i = 0; i < 3; i++) { tono(1250, .12, 'square', .004, i * .5); ruido(.05, .008, i * .5, 2400, .03); } }   // la tablilla de hierro de la quinta vigilia
  }
  /* EL PAISAJE SONORO DE SANTIAGO (era10-plan): el Mapocho como lecho (bajo en verano, crecido en invierno), las campanas de
     la catedral, los zorzales de día, el coro de los niños que recitan en la escuela de monitores y, en primavera, la
     guitarra lejana de las fondas. */
  if (S.era === 10) {
    const l = luzDia(), est = estacion().i;
    if (t > (amb.catedral || 30)) { amb.catedral = t + 45 + Math.random() * 15; [392, 330, 392, 330].forEach((f, i) => tono(f, 1.2, 'sine', .012, i * .6)); }   // las campanas de la catedral
    if (l >= 0.5 && t > (amb.zorzal || 10)) { amb.zorzal = t + 10 + Math.random() * 10; [1320, 1480, 1320, 1180].forEach((f, i) => tono(f, .09, 'sine', .008, i * .12)); }   // el zorzal
    if (l >= 0.5 && lancasterAbierta() && t > (amb.coro || 14)) { amb.coro = t + 16 + Math.random() * 8; [262, 294, 330, 294].forEach((f, i) => tono(f, .22, 'triangle', .008, i * .25)); }   // los niños que recitan a coro
    if (est === 0 && t > (amb.guitarra || 20)) { amb.guitarra = t + 22 + Math.random() * 10; [196, 247, 294, 247, 196].forEach((f, i) => tono(f, .3, 'triangle', .008, i * .18)); }   // la guitarra de las fondas
  }
  /* EL PAISAJE SONORO DE ÁMSTERDAM (era9-plan): el agua de los canales como lecho (en lechoRio; en invierno, helada, casi
     calla), el carillón de la torre que toca a cada cuarto, las gaviotas del IJ de día, el golpe de las prensas en el taller
     y, en invierno, los patines sobre el hielo. */
  if (S.era === 9) {
    const l = luzDia(), inv = estacion().i === 3;
    if (t > (amb.carillon || 30)) { amb.carillon = t + 40 + Math.random() * 10; [659, 587, 523, 587, 659, 659, 659].forEach((f, i) => tono(f, .35, 'sine', .012, i * .28)); }   // el carillón de la torre
    if (l >= 0.5 && t > (amb.gaviota || 10)) { amb.gaviota = t + 9 + Math.random() * 10; [1100, 950, 1180].forEach((f, i) => tono(f, .12, 'triangle', .008, i * .16)); }   // las gaviotas del IJ
    if (prensaAbierta() && S.forma && S.forma.fase === 'tirar' && t > (amb.taller || 6)) { amb.taller = t + 5 + Math.random() * 4; ruido(.1, .012, 0, 600, .03); }   // el golpe lejano de las otras prensas
    if (inv && l >= 0.4 && t > (amb.patin || 8)) { amb.patin = t + 6 + Math.random() * 6; for (let i = 0; i < 3; i++) ruido(.25, .008, i * .3, 3200, .1); }   // los patines sobre el hielo
  }
  if (S.era === 3 && luzDia() < 0.35 && t > (amb.lechuza || 40)) {
    amb.lechuza = t + 34 + Math.random() * 26; // la lechuza del desierto, muy de vez en cuando: dos notas suaves
    tono(330, .28, 'sine', .075); tono(262, .42, 'sine', .07, .3);
  }
}

/* ============================================================
   ECONOMÍA (F2 v2)
   ============================================================ */
