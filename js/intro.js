// Intro overlay: system boot loader (background frames + 3D model) -> "Online" + system-entry effect
// -> login with 3D avatar -> Login click: "Login", electric crackle, portal, "Welcome..." -> site + music.
(function(){
  const root = document.getElementById('intro');
  if(!root) return;

  const $ = id => document.getElementById(id);
  const loading = $('intro-loading'), login = $('intro-login'), stage3d = $('login3D');
  const lines = $('intro-lines'), bar = $('intro-bar'), pct = $('intro-pct'), btn = $('intro-login-btn');

  const FRAME_GOAL = 40;   // first frames the background needs before the site feels ready
  const MIN_MS = 1800;     // long enough for the boot log to read
  const MAX_WAIT = 20000;  // slow connection: continue anyway; the model pops in when it lands
  const BOOT = [
    [0.00, '> init portfolio_kernel v4.0'],
    [0.15, '> mounting /dev/network .......... OK'],
    [0.30, '> loading modules: cisco mikrotik linux python'],
    [0.50, '> establishing uplink 2.04 Gbps ... OK'],
    [0.70, '> rendering avatar pose2.glb ..... OK'],
    [0.88, '> auth adi_susilo ................ GRANTED'],
    [1.00, '> system online_']
  ];

  let modelProgress = 0, modelDone = false, shown = 0, start = 0, printed = 0;
  let ready = false, entered = false, onEnter = null;
  const sound = window.Sound;

  function target(){
    const frames = window.NetCanvas ? NetCanvas.progress(FRAME_GOAL) : 1;
    return 0.35 * frames + 0.65 * (modelDone ? 1 : modelProgress);
  }

  function render(v){
    bar.style.width = (v * 100).toFixed(1) + '%';
    pct.textContent = Math.round(v * 100) + '%';
    while(printed < BOOT.length && v >= BOOT[printed][0]){
      const d = document.createElement('div');
      d.className = 'boot-line';
      d.textContent = BOOT[printed][1];
      lines.appendChild(d);
      printed++;
    }
  }

  function tick(now){
    if(ready) return;
    const t = target();
    shown += (t - shown) * 0.08;
    if(t - shown < 0.002) shown = t;
    render(shown);

    const elapsed = now - start;
    if((shown >= 0.999 && elapsed > MIN_MS) || elapsed > MAX_WAIT) enterSystem();
    else requestAnimationFrame(tick);
  }

  // Boot finished: "Online", loader collapses like a CRT, login opens out of the line.
  function enterSystem(){
    ready = true;
    render(1);
    if(sound) sound.play('online');
    setTimeout(()=>{
      loading.classList.add('sys-exit');
      setTimeout(()=>{
        loading.classList.add('hidden');
        login.classList.remove('opacity-0', 'pointer-events-none');
        login.classList.add('sys-enter');
        stage3d.classList.remove('opacity-0');
        btn.focus({ preventScroll: true });
      }, 650);
    }, 450);
  }

  function reveal(){
    root.remove();
    if(window.Hero3D) Hero3D.destroy(); // free the GPU once the avatar is gone
    document.documentElement.classList.remove('overflow-hidden');
    if(onEnter) onEnter();
    if(sound) sound.startBgm();
  }

  function enter(){
    if(entered) return;
    entered = true;
    if(sound){
      sound.startScrollFx(); // AudioContext is created inside the Login click
      sound.stopAll();
      sound.play('electric');
      sound.play('login').then(()=>sound.play('welcome'));
    }
    login.classList.add('opacity-0', 'pointer-events-none');
    if(window.Portal) Portal.play({ onPeak: reveal });
    else{
      root.classList.add('opacity-0');
      setTimeout(reveal, 700);
    }
  }

  function init(opts){
    onEnter = opts && opts.onEnter;
    if(window.Hero3D){
      Hero3D.init(stage3d, {
        onProgress: p => { modelProgress = p; },
        onLoad: () => { modelDone = true; },
        onError: () => { modelDone = true; }
      });
    } else {
      modelDone = true; // Three.js failed to load: skip the avatar, keep the flow
    }
    btn.addEventListener('click', enter);
    start = performance.now();
    requestAnimationFrame(tick);
  }

  window.Intro = { init };
})();
