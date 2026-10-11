// Project category filter. Cards carry data-cat="web network ..."; chips carry data-filter.
(function(){
  function init(){
    const chips = document.querySelectorAll('.filter-chip');
    const cards = document.querySelectorAll('#project-grid .project-card');
    const count = document.getElementById('project-count');
    if(!chips.length || !cards.length) return;

    function apply(filter){
      let shown = 0;
      cards.forEach(card=>{
        const match = filter === 'all' || card.dataset.cat.split(' ').includes(filter);
        card.classList.toggle('hidden', !match);
        if(match) shown++;
      });
      chips.forEach(chip=>chip.setAttribute('aria-pressed', String(chip.dataset.filter === filter)));
      if(count) count.textContent = shown;
    }

    chips.forEach(chip=>chip.addEventListener('click', ()=>apply(chip.dataset.filter)));
    apply('all');
  }

  window.Portfolio = { init };
})();
