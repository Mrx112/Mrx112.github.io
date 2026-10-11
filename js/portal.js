// "Link Start" portal: rainbow light streaks and rings rush toward the viewer, then a white flash.
// Portal.play({ onPeak }) — onPeak fires at full white, so the page underneath can be swapped unseen.
(function(){
  const DURATION = 2600;  // tunnel, ms
  const FLASH_IN = 0.78;  // fraction of DURATION where the white flash starts
  const FADE_OUT = 700;   // flash fade after the peak, ms
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function play(opts){
    opts = opts || {};
    const el = document.createElement('div');
    el.className = 'fixed inset-0 z-[120] pointer-events-none opacity-0 transition-opacity duration-200';
    el.setAttribute('aria-hidden', 'true');
    const canvas = document.createElement('canvas');
    canvas.className = 'absolute inset-0 h-full w-full';
    const flash = document.createElement('div');
    flash.className = 'absolute inset-0 bg-white';
    flash.style.opacity = '0';
    el.append(canvas, flash);
    document.body.appendChild(el);
    requestAnimationFrame(()=>el.classList.remove('opacity-0'));

    const finish = ()=>{
      if(opts.onPeak) opts.onPeak();
      flash.style.transition = `opacity ${FADE_OUT}ms ease-out`;
      el.style.background = 'transparent';
      canvas.remove();
      requestAnimationFrame(()=>{ flash.style.opacity = '0'; });
      setTimeout(()=>el.remove(), FADE_OUT + 50);
    };

    if(reduce){
      flash.style.transition = 'opacity 300ms ease-in';
      requestAnimationFrame(()=>{ flash.style.opacity = '1'; });
      setTimeout(finish, 320);
      return;
    }

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w, h, cx, cy, R;
    function resize(){
      w = canvas.width = Math.round(innerWidth * dpr);
      h = canvas.height = Math.round(innerHeight * dpr);
      cx = w / 2; cy = h / 2;
      R = Math.max(w, h) * 0.35;
    }
    resize();

    // Streaks travel along z toward the camera (z -> 0); screen radius = R / z
    const streaks = Array.from({ length: 420 }, ()=>({
      a: Math.random() * Math.PI * 2,
      z: 0.2 + Math.random() * 3,
      hue: Math.random() * 360,
      wgt: 0.6 + Math.random() * 1.6
    }));
    const rings = [];
    let lastRing = 0;
    const t0 = performance.now();
    let prev = t0;

    ctx.fillStyle = '#05050a';
    ctx.fillRect(0, 0, w, h);

    (function frame(now){
      const k = Math.min(1, (now - t0) / DURATION);
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      const speed = 0.6 + 9 * k * k;  // accelerate into the tunnel

      // Motion trails: darken the previous frame instead of clearing it
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(5,5,10,0.28)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';

      // Centre glow grows as we approach
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * (0.4 + 1.6 * k));
      g.addColorStop(0, `rgba(255,255,255,${0.25 + 0.5 * k})`);
      g.addColorStop(0.3, `rgba(140,200,255,${0.12 + 0.2 * k})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      // Streaks
      streaks.forEach(s=>{
        const zPrev = s.z;
        s.z -= speed * dt;
        if(s.z <= 0.05){
          s.z = 2 + Math.random() * 1.5;
          s.a = Math.random() * Math.PI * 2;
          return;
        }
        const r1 = R / zPrev, r2 = R / s.z;
        const cos = Math.cos(s.a), sin = Math.sin(s.a);
        ctx.strokeStyle = `hsla(${(s.hue + k * 120) % 360},100%,${60 + 25 * k}%,${Math.min(1, 0.3 + 1 / s.z * 0.25)})`;
        ctx.lineWidth = s.wgt * dpr * (1 + 2 / s.z);
        ctx.beginPath();
        ctx.moveTo(cx + cos * r1, cy + sin * r1);
        ctx.lineTo(cx + cos * r2, cy + sin * r2);
        ctx.stroke();
      });

      // Rainbow rings spawned at the far end
      if(now - lastRing > 110 - 70 * k){
        rings.push({ z: 3, hue: (now / 4) % 360 });
        lastRing = now;
      }
      for(let i = rings.length - 1; i >= 0; i--){
        const ring = rings[i];
        ring.z -= speed * dt * 0.9;
        if(ring.z <= 0.08){ rings.splice(i, 1); continue; }
        const r = R * 0.55 / ring.z;
        ctx.strokeStyle = `hsla(${ring.hue},100%,65%,${Math.min(0.85, 0.15 + 0.35 / ring.z)})`;
        ctx.lineWidth = dpr * (1 + 3 / ring.z);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // White flash ramps in for the last part of the tunnel
      flash.style.opacity = String(Math.max(0, (k - FLASH_IN) / (1 - FLASH_IN)));

      if(k < 1) requestAnimationFrame(frame);
      else finish();
    })(t0);

    window.addEventListener('resize', resize, { once: true });
  }

  window.Portal = { play };
})();
