(function(){
  function init(){
    // simple hero reveal and typewriter
    setTimeout(()=>{
      const el = document.getElementById('termHeader');
      if(el){ el.style.opacity='1'; el.style.transform='none'; }
    },200);
    setTimeout(()=>{
      const n = document.getElementById('heroName'); if(n){ n.style.opacity='1'; n.style.transition='opacity .8s, transform .8s'; n.style.transform='none'; }
    },400);
    setTimeout(()=>{
      const r = document.getElementById('heroRole'); if(r){ r.style.opacity='1'; r.style.transition='opacity .6s'; }
      startType();
    },800);

    populateTerminal();
  }

  const roles = ['Network Engineer','System Architect','Cyber Enthusiast','Linux Administrator'];
  let ri=0, ci=0, del=false;
  const tgt = () => document.getElementById('typedText');
  function startType(){ if(!tgt()) return; typeRole(); }
  function typeRole(){
    const el = tgt();
    const cur = roles[ri];
    if(!del && ci<=cur.length){ el.textContent = cur.slice(0,ci); ci++; setTimeout(typeRole, ci>cur.length?1500:60); }
    else if(del && ci>=0){ el.textContent = cur.slice(0,ci); ci--; setTimeout(typeRole, ci<0?200:35); }
    else if(!del && ci>cur.length){ del=true; setTimeout(typeRole,1500);} 
    else { del=false; ri=(ri+1)%roles.length; setTimeout(typeRole,200); }
  }

  function populateTerminal(){
    const lines=[
      {type:'prompt',text:'whoami'},
      {type:'out',text:'adi_susilo // network_engineer'},
      {type:'prompt',text:'ping -c1 undip.ac.id'},
      {type:'out',text:'PING undip.ac.id: 64 bytes from 10.100.0.1'},
      {type:'ok',text:'time=0.892ms TTL=64 ✓'},
      {type:'prompt',text:'uptime'},
      {type:'out',text:'up 2y 4m  load: 0.12 0.08 0.05'},
      {type:'prompt',text:'cat /etc/skills'},
      {type:'out',text:'Cisco·MikroTik·Linux·Python·FiberOptic'},
      {type:'warn',text:'>>> CCNA certification in progress...'},
      {type:'prompt',text:'status --jobs'},
      {type:'out',text:'[●] IFORTE@UNDIP · 2.04Gbps · ONLINE'},
    ];

    const body = document.getElementById('termBody');
    if(!body) return;
    lines.forEach((l,i)=>{
      const d = document.createElement('div'); d.className='t-line';
      if(l.type==='prompt') d.innerHTML = `<span class="t-prompt">adi@net:~$ </span><span class="t-cmd">${l.text}</span>`;
      else if(l.type==='out') d.innerHTML = `<span class="t-out">${l.text}</span>`;
      else if(l.type==='ok') d.innerHTML = `<span style="color:var(--green);padding-left:1rem">${l.text}</span>`;
      else d.innerHTML = `<span class="t-warn" style="padding-left:1rem">${l.text}</span>`;
      body.appendChild(d);
      setTimeout(()=>d.classList.add('show'),600 + i*160);
    });
  }

  window.TerminalModule = { init };
})();
