// Reveal-on-scroll. Elements start with `.reveal translate-y-8 opacity-0` in the markup;
// optional data-delay (ms) staggers them.
(function(){
  const HIDDEN = ['translate-y-8', 'opacity-0'];
  const VISIBLE = ['translate-y-0', 'opacity-100'];

  function show(el){
    el.classList.remove(...HIDDEN);
    el.classList.add(...VISIBLE);
  }

  function init(){
    const els = document.querySelectorAll('.reveal');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if(reduce || !('IntersectionObserver' in window)){
      els.forEach(show);
      return;
    }

    els.forEach(el=>{
      if(el.dataset.delay) el.style.transitionDelay = el.dataset.delay + 'ms';
    });

    const io = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(!entry.isIntersecting) return;
        show(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    els.forEach(el=>io.observe(el));
  }

  window.Effects = { init };
})();
