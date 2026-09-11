(function(){
  const roles = ['Network Engineer','Full Stack Developer','Cyber Security Enthusiast','Linux Administrator','Network Automation'];
  let ri=0, ci=0, del=false, started=false;
  const tgt = () => document.getElementById('typedText');

  function typeRole(){
    const el = tgt(); if(!el) return;
    const cur = roles[ri];
    if(!del && ci<=cur.length){ el.textContent = cur.slice(0,ci); ci++; setTimeout(typeRole, ci>cur.length?1600:55); }
    else if(del && ci>=0){ el.textContent = cur.slice(0,ci); ci--; setTimeout(typeRole, ci<0?250:30); }
    else if(!del && ci>cur.length){ del=true; setTimeout(typeRole,1600); }
    else { del=false; ri=(ri+1)%roles.length; setTimeout(typeRole,250); }
  }

  function populateTerminal(){
    const lines=[
      {type:'prompt',text:'whoami'},
      {type:'out',text:'adi_susilo // network_engineer & fullstack_dev'},
      {type:'prompt',text:'ping -c1 undip.ac.id'},
      {type:'out',text:'64 bytes from 10.100.0.1: icmp_seq=1 ttl=64'},
      {type:'ok',text:'time=0.892 ms ✓'},
      {type:'prompt',text:'cat /etc/skills'},
      {type:'out',text:'Cisco · MikroTik · Linux · Python · FiberOptic · React'},
      {type:'prompt',text:'status --jobs'},
      {type:'out',text:'[●] IFORTE@UNDIP · 2.04 Gbps · 35K users · ONLINE'},
      {type:'warn',text:'>>> open to new opportunities_'},
    ];
    const body = document.getElementById('termBody');
    if(!body) return;
    body.innerHTML = '';
    lines.forEach((l,i)=>{
      const d = document.createElement('div'); d.className='t-line';
      if(l.type==='prompt') d.innerHTML = `<span class="t-prompt">adi@net:~$ </span><span class="t-cmd">${l.text}</span>`;
      else if(l.type==='out') d.innerHTML = `<span class="t-out">${l.text}</span>`;
      else if(l.type==='ok') d.innerHTML = `<span class="t-ok" style="padding-left:1rem">${l.text}</span>`;
      else d.innerHTML = `<span class="t-warn" style="padding-left:1rem">${l.text}</span>`;
      body.appendChild(d);
      setTimeout(()=>d.classList.add('show'), 500 + i*170);
    });
  }

  // called by UI once the hero intro reaches the role line
  function start(){
    if(started) return; started = true;
    typeRole();
    populateTerminal();
  }

  window.TerminalModule = { start };
})();
