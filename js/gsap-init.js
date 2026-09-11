(function(){
  if(typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function init(){
    if(reduce){
      document.querySelectorAll('.reveal').forEach(el=>{ el.style.opacity='1'; el.style.transform='none'; });
      document.querySelectorAll('.skill-fill').forEach(el=>{ el.style.width = el.dataset.pct+'%'; });
      document.querySelectorAll('[data-count]').forEach(el=>{ el.textContent = (+el.dataset.count).toLocaleString('id-ID'); });
      const lf = document.querySelector('.exp-line-fill'); if(lf) lf.style.transform='scaleY(1)';
      return;
    }

    // Generic reveal (staggered per row)
    document.querySelectorAll('.reveal').forEach((el,i)=>{
      gsap.fromTo(el,{y:36,opacity:0},{
        y:0,opacity:1,duration:.9,delay:(i%4)*.08,ease:'power3.out',
        scrollTrigger:{trigger:el,start:'top 88%',once:true,
          onEnter:()=>{ el.classList.add('visible'); if(el.classList.contains('sec-head')) el.classList.add('in'); }
        }
      });
    });

    // Skill bars
    document.querySelectorAll('.skill-fill').forEach(el=>{
      gsap.to(el,{width:el.dataset.pct+'%',duration:1.5,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 90%',once:true}});
    });

    // Counters
    document.querySelectorAll('[data-count]').forEach(el=>{
      const target = +el.dataset.count;
      const obj = {v:0};
      ScrollTrigger.create({trigger:el,start:'top 85%',once:true,onEnter:()=>{
        gsap.to(obj,{v:target,duration:1.8,ease:'power2.out',onUpdate:()=>{
          el.textContent = Math.floor(obj.v).toLocaleString('id-ID');
        }});
      }});
    });

    // Timeline items + growing line
    document.querySelectorAll('.exp-item').forEach((el,i)=>{
      gsap.fromTo(el,{x:-40,opacity:0},{x:0,opacity:1,duration:.8,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
    });
    const line = document.querySelector('.exp-line-fill');
    if(line){
      gsap.to(line,{scaleY:1,ease:'none',scrollTrigger:{trigger:'.exp-timeline',start:'top 70%',end:'bottom 70%',scrub:.6}});
    }

    // Hero parallax (orbs + right column drift on scroll)
    gsap.to('.hero-orb-1',{y:-140,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.hero-orb-2',{y:-80,ease:'none',scrollTrigger:{trigger:'#hero',start:'top top',end:'bottom top',scrub:true}});
    gsap.to('.hero-left',{y:-60,opacity:.2,ease:'none',scrollTrigger:{trigger:'#hero',start:'40% top',end:'bottom top',scrub:true}});

    // Scroll indicators
    const sections=['hero','about','experience','projects','labs','certifications','contact'];
    const dots = document.querySelectorAll('.si-dot');
    sections.forEach((id,i)=>{
      const sec = document.getElementById(id); if(!sec) return;
      ScrollTrigger.create({trigger:sec,start:'top 50%',end:'bottom 50%',onEnter:()=>updateDot(i),onEnterBack:()=>updateDot(i)});
    });
    function updateDot(i){ dots.forEach((d,j)=>d.classList.toggle('active', j===i)); }
    dots.forEach((d,i)=>d.addEventListener('click',()=>{ const s=document.getElementById(sections[i]); if(s) s.scrollIntoView({behavior:'smooth'}); }));
  }

  window.GSAPInit = { init };
})();
