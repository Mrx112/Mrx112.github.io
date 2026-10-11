// Voice cues, sound effects and background music.
// Playback is attempted straight away; browsers that block audio before the first interaction
// simply stay silent until the visitor clicks or presses a key (the Login click always counts).
(function(){
  const CLIPS = {
    online: './audio/voice-online.mp3',
    welcome: './audio/voice-welcome.mp3',
    login: './audio/voice-login.mp3',
    electric: './audio/sfx-electric.mp3'
  };
  const BGM_SRC = './audio/Bgm_bg.mp3';
  const BGM_VOLUME = 0.35;

  const clips = {};
  Object.keys(CLIPS).forEach(name=>{
    const a = new Audio(CLIPS[name]);
    a.preload = 'auto';
    clips[name] = a;
  });
  const bgm = new Audio(BGM_SRC);
  bgm.loop = true;
  bgm.preload = 'auto';

  let muted = false, fadeRaf = 0;
  const toggle = document.getElementById('sound-toggle');

  // First interaction: prime every element so iOS/Safari lets them play later.
  function prime(){
    ['pointerdown', 'keydown', 'touchend'].forEach(e=>document.removeEventListener(e, prime, true));
    [bgm, ...Object.values(clips)].forEach(a=>{
      if(!a.paused) return;
      a.muted = true;
      const p = a.play();
      // Skip the reset if a real play() was requested before priming finished
      if(p) p.then(()=>{ if(!a._wanted){ a.pause(); a.currentTime = 0; } a.muted = false; }).catch(()=>{ a.muted = false; });
    });
  }
  ['pointerdown', 'keydown', 'touchend'].forEach(e=>document.addEventListener(e, prime, true));

  // Resolves when the clip ends, or right away if muted/blocked, so cues can be chained.
  function play(name){
    const a = clips[name];
    if(muted || !a) return Promise.resolve();
    a._wanted = true;
    a.muted = false;
    a.currentTime = 0;
    return new Promise(resolve=>{
      a.onended = resolve;
      a.play().catch(resolve);
    });
  }

  function stopAll(){
    Object.values(clips).forEach(a=>{ a.pause(); a.onended = null; });
  }

  function fadeBgm(to, ms, done){
    cancelAnimationFrame(fadeRaf);
    const from = bgm.volume, t0 = performance.now();
    (function step(now){
      const k = Math.min(1, Math.max(0, (now - t0) / ms)); // rAF time can precede t0
      bgm.volume = from + (to - from) * k;
      if(k < 1) fadeRaf = requestAnimationFrame(step);
      else if(done) done();
    })(t0);
  }

  function startBgm(){
    if(toggle){ toggle.classList.remove('hidden'); toggle.classList.add('flex'); }
    if(muted) return;
    bgm._wanted = true;
    bgm.muted = false;
    bgm.volume = 0;
    bgm.play().then(()=>fadeBgm(BGM_VOLUME, 2500)).catch(()=>{});
  }

  // Scroll whoosh: looping noise through a band-pass filter. Loudness and pitch follow
  // scroll speed, so fast flicks go "siuut" and the sound dies away when scrolling stops.
  const WHOOSH = { maxSpeed: 3500, volume: 0.22, attack: 0.04, release: 0.18 };
  let audioCtx = null, whooshGain = null, whooshFilter = null, scrollRaf = 0;

  // Tech layer: short digital blips while scrolling and a rising chirp on each new section.
  const BLIP = { every: 140, minGap: 0.05, volume: 0.04, notes: [1320, 1760, 1980, 2640, 2960] };
  let blipFilter = null, lastBlip = 0;

  function tone(freq, start, dur, vol, type, toFreq){
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if(toFreq) osc.frequency.exponentialRampToValueAtTime(toFreq, start + dur);
    g.gain.setValueAtTime(0, start);
    g.gain.linearRampToValueAtTime(vol, start + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(g).connect(blipFilter);
    osc.start(start);
    osc.stop(start + dur + 0.02);
  }

  function blip(){
    const t = audioCtx.currentTime;
    if(muted || t - lastBlip < BLIP.minGap) return;
    lastBlip = t;
    const f = BLIP.notes[Math.floor(Math.random() * BLIP.notes.length)];
    tone(f, t, 0.05, BLIP.volume, 'square');
  }

  function chirp(){
    if(muted) return;
    const t = audioCtx.currentTime;
    tone(600, t, 0.14, 0.05, 'sine', 1800);
    tone(2640, t + 0.12, 0.06, 0.035, 'square');
    tone(3520, t + 0.19, 0.08, 0.03, 'square');
  }

  function watchSections(){
    let first = true;
    const io = new IntersectionObserver(entries=>{
      if(first){ first = false; return; } // the section on screen at login doesn't count
      if(entries.some(e=>e.isIntersecting)) chirp();
    }, { threshold: 0.35 });
    document.querySelectorAll('main > section').forEach(sec=>io.observe(sec));
  }

  function startScrollFx(){
    if(audioCtx || !(window.AudioContext || window.webkitAudioContext)) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const len = audioCtx.sampleRate * 2;
    const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for(let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;

    whooshFilter = audioCtx.createBiquadFilter();
    whooshFilter.type = 'bandpass';
    whooshFilter.Q.value = 1.4;
    whooshFilter.frequency.value = 400;
    whooshGain = audioCtx.createGain();
    whooshGain.gain.value = 0;

    noise.connect(whooshFilter).connect(whooshGain).connect(audioCtx.destination);
    noise.start();

    blipFilter = audioCtx.createBiquadFilter();
    blipFilter.type = 'lowpass';
    blipFilter.frequency.value = 5000; // rounds off the square-wave edges
    blipFilter.connect(audioCtx.destination);
    watchSections();

    let lastY = window.scrollY, lastT = performance.now(), speed = 0, dir = 1;
    let travelled = 0;
    (function frame(now){
      scrollRaf = requestAnimationFrame(frame);
      const dt = Math.max(0.001, (now - lastT) / 1000);
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      lastT = now;
      if(dy) dir = dy > 0 ? 1 : -1;
      travelled += Math.abs(dy);
      if(travelled >= BLIP.every){ travelled %= BLIP.every; blip(); }
      speed += (Math.abs(dy) / dt - speed) * 0.25;   // smooth the raw velocity

      const k = Math.min(1, speed / WHOOSH.maxSpeed);
      const on = !muted && k > 0.02;
      const t = audioCtx.currentTime;
      whooshGain.gain.setTargetAtTime(on ? Math.pow(k, 1.3) * WHOOSH.volume : 0, t, on ? WHOOSH.attack : WHOOSH.release);
      whooshFilter.frequency.setTargetAtTime(300 + k * 2400 + (dir > 0 ? 250 : 0), t, 0.06);
    })(lastT);

    if(audioCtx.state === 'suspended') audioCtx.resume();
  }

  function setMuted(value){
    muted = value;
    if(audioCtx && !muted && audioCtx.state === 'suspended') audioCtx.resume();
    if(muted){
      stopAll();
      fadeBgm(0, 400, ()=>bgm.pause());
    } else {
      bgm._wanted = true;
      bgm.muted = false;
      bgm.volume = 0;
      bgm.play().then(()=>fadeBgm(BGM_VOLUME, 1200)).catch(()=>{});
    }
    syncToggle();
  }

  function syncToggle(){
    if(!toggle) return;
    toggle.setAttribute('aria-pressed', String(!muted));
    toggle.setAttribute('aria-label', muted ? 'Turn sound on' : 'Turn sound off');
    toggle.dataset.state = muted ? 'off' : 'on';
  }

  if(toggle) toggle.addEventListener('click', ()=>setMuted(!muted));

  window.Sound = { play, stopAll, startBgm, startScrollFx, setMuted };
})();
