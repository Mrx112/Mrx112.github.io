(function(){
  const cur = document.getElementById('cur');
  const dot = document.getElementById('cur-dot');
  if(!cur || !dot) return;
  let mx=0,my=0,cx=0,cy=0;
  let hoverScale = 1;

  function onMove(e){ mx=e.clientX; my=e.clientY; dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; }
  document.addEventListener('mousemove', onMove);

  function init(){
    // interactive hover changes
    document.querySelectorAll('a,button,.proj-card,.cert-card,.stat-card').forEach(el=>{
      el.addEventListener('mouseenter',()=>{ cur.style.width='40px'; cur.style.height='40px'; cur.style.borderColor='var(--green)'; hoverScale=1.1; });
      el.addEventListener('mouseleave',()=>{ cur.style.width='20px'; cur.style.height='20px'; cur.style.borderColor='var(--cyan)'; hoverScale=1; });
    });
  }

  function update(dt){
    // simple lerp smoothing
    cx += (mx - cx) * Math.min(0.25, 0.15 + dt*0.02);
    cy += (my - cy) * Math.min(0.25, 0.15 + dt*0.02);
    cur.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%) scale(${hoverScale})`;
  }

  window.SiteCursor = { init, update };
})();
