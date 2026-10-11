(function(){
  function init(){
    if(window.lucide) lucide.createIcons();
    if(window.NetCanvas) NetCanvas.init(); // starts preloading the frame sequence
    if(window.Portfolio) Portfolio.init();

    // Reveal animations wait until the visitor logs in, so they play on screen
    const reveal = ()=>{ if(window.Effects) Effects.init(); };
    if(window.Intro) Intro.init({ onEnter: reveal });
    else{
      document.documentElement.classList.remove('overflow-hidden');
      reveal();
    }

    // single RAF loop
    function frame(){
      if(window.NetCanvas) NetCanvas.update();
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
