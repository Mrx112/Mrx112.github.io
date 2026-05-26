(function(){
  const particleContainer = document.createElement('div');
  particleContainer.style.position = 'fixed';
  particleContainer.style.top = '0';
  particleContainer.style.left = '0';
  particleContainer.style.width = '100%';
  particleContainer.style.height = '100%';
  particleContainer.style.pointerEvents = 'none';
  particleContainer.style.zIndex = '9997';
  document.body.appendChild(particleContainer);

  let lastX = 0, lastY = 0, mouse = {x:0,y:0};
  document.addEventListener('mousemove', (e)=>{ mouse.x=e.clientX; mouse.y=e.clientY; });

  // particles: limit create rate to avoid perf issues
  let particleCooldown = 0;
  function updateParticles(dt){
    particleCooldown -= dt;
    const dist = Math.hypot(mouse.x-lastX, mouse.y-lastY);
    if(dist>8 && particleCooldown<=0){
      particleCooldown = 0.02; // throttle
      for(let i=0;i<2;i++){
        const particle = document.createElement('div');
        particle.className = 'cursor-particle';
        const size = Math.random()*4 + 2;
        particle.style.left = mouse.x + (Math.random() - 0.5) * 18 + 'px';
        particle.style.top = mouse.y + (Math.random() - 0.5) * 18 + 'px';
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.background = `radial-gradient(circle, ${Math.random()>.6?'#0ff':'#0fa'}, #0088ff)`;
        particleContainer.appendChild(particle);
        setTimeout(()=>{ particle.style.transition = 'opacity 0.45s, transform 0.6s'; particle.style.opacity='0'; particle.style.transform='translateY(-15px) scale(0.5)'; },20);
        setTimeout(()=>particle.remove(),700);
      }
      lastX = mouse.x; lastY = mouse.y;
    }
  }

  // dynamic lines canvas
  const lineCanvas = document.getElementById('cursorLineCanvas');
  if(!lineCanvas) return;
  const lCtx = lineCanvas.getContext('2d');
  let lW = lineCanvas.width = window.innerWidth, lH = lineCanvas.height = window.innerHeight;
  window.addEventListener('resize', ()=>{ lW = lineCanvas.width = window.innerWidth; lH = lineCanvas.height = window.innerHeight; });

  const fakeNodes = [];
  for(let i=0;i<18;i++){ fakeNodes.push({ x: Math.random()*lW, y: Math.random()*lH, radius: Math.random()*3+2 }); }

  function updateLines(dt){
    if(!lCtx) return;
    lCtx.clearRect(0,0,lW,lH);
    fakeNodes.forEach(node=>{
      const dx = mouse.x - node.x; const dy = mouse.y - node.y; const dist = Math.hypot(dx,dy);
      if(dist<180 && dist>10){
        const opacity = (1 - dist/180) * 0.4;
        lCtx.beginPath(); lCtx.moveTo(mouse.x,mouse.y); lCtx.lineTo(node.x,node.y);
        lCtx.strokeStyle = `rgba(0,245,255,${opacity})`; lCtx.lineWidth = 1.2; lCtx.stroke();
        lCtx.beginPath(); lCtx.arc(node.x,node.y,node.radius+2,0,Math.PI*2); lCtx.fillStyle = `rgba(0,200,255,${0.3*(1-dist/180)})`; lCtx.fill();
        lCtx.beginPath(); lCtx.arc(node.x,node.y,node.radius,0,Math.PI*2); lCtx.fillStyle = `rgba(0,255,255,0.7)`; lCtx.fill();
      } else {
        lCtx.beginPath(); lCtx.arc(node.x,node.y,node.radius,0,Math.PI*2); lCtx.fillStyle = `rgba(0,180,255,0.12)`; lCtx.fill();
      }
    });
  }

  function init(){
    // keep nodes nicely distributed on resize
    window.addEventListener('resize', ()=>{
      for(let i=0;i<fakeNodes.length;i++){ fakeNodes[i].x = Math.random()*lW; fakeNodes[i].y = Math.random()*lH; }
    });
  }

  function update(dt){
    updateParticles(dt);
    updateLines(dt);
  }

  window.Effects = { init, update };
})();
