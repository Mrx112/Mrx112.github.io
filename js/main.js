(function(){
  function init(){
    // initialize modules
    if(window.NetCanvas) NetCanvas.init();
    if(window.SiteCursor) SiteCursor.init();
    if(window.TerminalModule) TerminalModule.init();
    if(window.Effects) Effects.init();
    if(window.GSAPInit) GSAPInit.init();

    // single RAF loop
    let last = performance.now();
    function frame(now){
      const dt = Math.min(0.05, (now - last)/1000); // clamp dt
      last = now;
      if(window.NetCanvas) NetCanvas.update(dt);
      if(window.SiteCursor) SiteCursor.update(dt);
      if(window.Effects) Effects.update(dt);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
