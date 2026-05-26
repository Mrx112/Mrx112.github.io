(function(){
  if(typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  function init(){
    // Reveal elements
    document.querySelectorAll('.reveal').forEach((el,i)=>{
      gsap.fromTo(el,{y:40,opacity:0},{y:0,opacity:1,duration:1,delay:i%4*.1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}});
    });

    // Skill bars
    document.querySelectorAll('.skill-fill').forEach(el=>{
      const pct = el.dataset.pct+'%';
      gsap.to(el,{width:pct,duration:1.4,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 90%'}});
    });

    // Counter animation
    document.querySelectorAll('[data-count]').forEach(el=>{
      const target = +el.dataset.count;
      ScrollTrigger.create({trigger:el,start:'top 85%',once:true,onEnter:()=>{
        let cur=0; const step=target/60; const t=setInterval(()=>{ cur+=step; if(cur>=target){ cur=target; clearInterval(t); } el.textContent = target>100?Math.floor(cur).toLocaleString():Math.floor(cur); },16);
      }});
    });

    // Timeline items
    document.querySelectorAll('.exp-item').forEach((el,i)=>{
      gsap.fromTo(el,{x:-30,opacity:0},{x:0,opacity:1,duration:.7,delay:i*.08,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 88%'}});
    });

    // Scroll indicators
    const sections=['hero','about','experience','projects','certifications','contact'];
    const dots = document.querySelectorAll('.si-dot');
    sections.forEach((id,i)=>{
      ScrollTrigger.create({ trigger:'#'+id, start:'top 50%', end:'bottom 50%', onEnter:()=>updateDot(i), onEnterBack:()=>updateDot(i) });
    });
    function updateDot(i){ dots.forEach((d,j)=>d.classList.toggle('active', j===i)); }
    dots.forEach((d,i)=>d.addEventListener('click', ()=>document.getElementById(sections[i]).scrollIntoView({behavior:'smooth'})));
  }

  window.GSAPInit = { init };
})();
