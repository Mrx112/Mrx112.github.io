// Scroll-scrubbed image sequence background.
// Frame source is configured on the canvas: data-path, data-frames, data-digits, data-ext.
(function(){
  const canvas = document.getElementById('bg-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');

  const cfg = {
    path: canvas.dataset.path || './img/BG/',
    count: parseInt(canvas.dataset.frames, 10) || 240,
    digits: parseInt(canvas.dataset.digits, 10) || 5,
    ext: canvas.dataset.ext || 'png',
    concurrency: 8 // parallel downloads; frames load in order so the first ones arrive first
  };

  const frames = new Array(cfg.count);
  const loaded = new Uint8Array(cfg.count);
  let target = 0, smoothed = 0, drawn = -1, dirty = true;
  let settled = 0; // frames finished loading (ok or failed), for the intro progress bar

  // n is 1-based: 1 -> ./img/BG/00001.png
  function frameSrc(n){ return cfg.path + String(n).padStart(cfg.digits, '0') + '.' + cfg.ext; }

  function preload(){
    let next = 0, inFlight = 0;
    function pump(){
      while(inFlight < cfg.concurrency && next < cfg.count){
        const i = next++;
        const img = new Image();
        img.decoding = 'async';
        img.onload = ()=>{ loaded[i] = 1; settled++; inFlight--; pump(); };
        img.onerror = ()=>{ settled++; inFlight--; pump(); };
        img.src = frameSrc(i + 1);
        frames[i] = img;
        inFlight++;
      }
    }
    pump();
  }

  function resize(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    ctx.imageSmoothingQuality = 'high';
    dirty = true;
  }

  function readScroll(){
    const max = document.documentElement.scrollHeight - window.innerHeight;
    target = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  }

  // Until every frame is in, show the closest one that has loaded.
  function nearestLoaded(i){
    if(loaded[i]) return i;
    for(let d = 1; d < cfg.count; d++){
      if(i - d >= 0 && loaded[i - d]) return i - d;
      if(i + d < cfg.count && loaded[i + d]) return i + d;
    }
    return -1;
  }

  // object-cover: scale to fill, centre crop
  function draw(i){
    const img = frames[i];
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const s = Math.max(cw / iw, ch / ih);
    const dw = iw * s, dh = ih * s;
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  function update(){
    readScroll();
    smoothed += (target - smoothed) * 0.12;
    if(Math.abs(target - smoothed) < 1e-4) smoothed = target;

    const frame = Math.floor(smoothed * (cfg.count - 1)) + 1;
    const i = nearestLoaded(frame - 1);
    if(i < 0) return;
    if(i !== drawn || dirty){ draw(i); drawn = i; dirty = false; }
  }

  function init(){
    resize();
    readScroll();
    smoothed = target; // start on the right frame when reloading mid-page
    preload();
    window.addEventListener('resize', resize);
  }

  // Fraction of the first `n` frames that have settled.
  function progress(n){ return Math.min(1, settled / Math.min(n || cfg.count, cfg.count)); }

  window.NetCanvas = { init, update, resize, progress };
})();
