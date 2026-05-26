(function(){
  const c = document.getElementById('netCanvas');
  if(!c) return;
  const ctx = c.getContext('2d');
  let W = innerWidth, H = innerHeight;
  let nodes = [], packets = [];
  let spawnAccumulator = 0;

  function resize(){ W = c.width = window.innerWidth; H = c.height = window.innerHeight; }

  function init(opts){
    resize();
    nodes = [];
    for(let i=0;i<60;i++){
      nodes.push({
        x:Math.random()*W,y:Math.random()*H,
        vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,
        r:Math.random()*2+1,
        pulse:Math.random()*Math.PI*2
      });
    }
    window.addEventListener('resize',resize);
  }

  function spawnPacket(){
    if(nodes.length<2) return;
    const a = Math.floor(Math.random()*nodes.length);
    let b,dist;
    for(let tries=0;tries<12;tries++){
      b = Math.floor(Math.random()*nodes.length);
      if(b===a) continue;
      const dx = nodes[a].x-nodes[b].x, dy = nodes[a].y-nodes[b].y;
      dist = Math.hypot(dx,dy);
      if(dist<=200) break;
    }
    if(b===a) return;
    packets.push({a,b,t:0,speed:0.008+Math.random()*0.012,color:Math.random()>.5?'#00f5ff':'#00ff88'});
    // Limit packet count to avoid overload
    if(packets.length>180) packets.splice(0,packets.length-180);
  }

  function update(dt){
    // dt in seconds
    // spawn packets every ~0.18s
    spawnAccumulator += dt;
    while(spawnAccumulator > 0.18){ spawnAccumulator -= 0.18; spawnPacket(); }

    // move nodes
    nodes.forEach(n=>{
      n.x += n.vx * (dt*60);
      n.y += n.vy * (dt*60);
      if(n.x<0||n.x>W) n.vx *= -1;
      if(n.y<0||n.y>H) n.vy *= -1;
      n.pulse += .02 * (dt*60);
    });

    // draw
    ctx.clearRect(0,0,W,H);

    // edges (optimized: only draw if close)
    for(let i=0;i<nodes.length;i++){
      const ni = nodes[i];
      for(let j=i+1;j<nodes.length;j++){
        const nj = nodes[j];
        const dx = ni.x-nj.x, dy = ni.y-nj.y;
        const d = Math.hypot(dx,dy);
        if(d<160){
          const alpha = (1-d/160)*.25;
          ctx.beginPath(); ctx.moveTo(ni.x,ni.y); ctx.lineTo(nj.x,nj.y);
          ctx.strokeStyle = `rgba(0,180,255,${alpha})`;
          ctx.lineWidth = .5; ctx.stroke();
        }
      }
    }

    // nodes
    nodes.forEach(n=>{
      const glow = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,n.r*3);
      const pulse = .5 + .5*Math.sin(n.pulse);
      glow.addColorStop(0,`rgba(0,245,255,${.8*pulse})`);
      glow.addColorStop(1,'transparent');
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r*3,0,Math.PI*2);
      ctx.fillStyle = glow; ctx.fill();
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2); ctx.fillStyle='#00f5ff'; ctx.fill();
    });

    // packets
    packets = packets.filter(p=>{
      p.t += p.speed * (dt*60);
      if(p.t>1) return false;
      const na = nodes[p.a], nb = nodes[p.b];
      const px = na.x + (nb.x-na.x)*p.t;
      const py = na.y + (nb.y-na.y)*p.t;
      ctx.beginPath(); ctx.arc(px,py,3,0,Math.PI*2);
      ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 8; ctx.fill(); ctx.shadowBlur = 0;
      return true;
    });
  }

  window.NetCanvas = { init, update, resize };
})();
