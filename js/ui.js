/* UI module: preloader, hero intro, nav, mobile menu, music, tilt, magnetic, filters, back-to-top */
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = typeof gsap !== 'undefined';

  /* ---------- PRELOADER ---------- */
  function preloader(done){
    const pl = document.getElementById('preloader');
    if(!pl){ done(); return; }
    const box = pl.querySelector('.pl-lines');
    const bar = pl.querySelector('.pl-bar i');
    const pct = pl.querySelector('.pl-pct');
    let finished = false;
    const finish = () => {
      if(finished) return; finished = true;
      pl.classList.add('done');
      document.body.classList.remove('loading');
      done();
    };
    if(reduce){ finish(); return; }

    const lines = [
      '> init portfolio_kernel v3.0',
      '> mounting /dev/network .......... OK',
      '> loading modules: cisco mikrotik linux python',
      '> establishing uplink 2.04 Gbps ... OK',
      '> auth adi_susilo ................ GRANTED',
      '> launching interface_'
    ];
    let i = 0;
    const step = () => {
      if(i < lines.length){
        const d = document.createElement('div');
        d.textContent = lines[i];
        box.appendChild(d);
        i++;
        const p = Math.round(i / lines.length * 100);
        bar.style.width = p + '%';
        pct.textContent = p + '%';
        setTimeout(step, 160 + Math.random() * 160);
      } else {
        setTimeout(finish, 380);
      }
    };
    setTimeout(step, 250);
    setTimeout(finish, 4500); // safety net
  }

  /* ---------- HERO INTRO ---------- */
  function splitName(){
    document.querySelectorAll('.hero-name .word').forEach(word => {
      const text = word.textContent.trim();
      word.textContent = '';
      [...text].forEach(ch => {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = ch;
        word.appendChild(s);
      });
    });
  }

  function heroIntro(){
    const glitch = document.querySelector('.hero-name .glitch');
    const startTerminal = () => { if(window.TerminalModule) TerminalModule.start(); };

    if(!hasGsap || reduce){
      ['termHeader','heroRole','heroDesc','heroCta','heroMeta'].forEach(id => {
        const el = document.getElementById(id); if(el) el.style.opacity = '1';
      });
      document.querySelectorAll('.hero-name .ch').forEach(c => { c.style.opacity = '1'; c.style.transform = 'none'; });
      const r = document.querySelector('.hero-right'); if(r) r.style.opacity = '1';
      const sh = document.querySelector('.scroll-hint'); if(sh) sh.style.opacity = '1';
      if(glitch) glitch.classList.add('on');
      startTerminal();
      return;
    }

    const tl = gsap.timeline({ defaults:{ ease:'power3.out' } });
    tl.to('#termHeader', { opacity:1, duration:.5 })
      .to('.hero-name .ch', { opacity:1, y:0, rotateX:0, duration:.9, stagger:.045, ease:'back.out(1.4)' }, '-=.2')
      .to('#heroRole', { opacity:1, duration:.5, onStart:startTerminal }, '-=.4')
      .fromTo('#heroDesc', { y:20 }, { opacity:1, y:0, duration:.7 }, '-=.3')
      .fromTo('#heroCta', { y:20 }, { opacity:1, y:0, duration:.7 }, '-=.5')
      .fromTo('#heroMeta', { y:20 }, { opacity:1, y:0, duration:.7 }, '-=.5')
      .fromTo('.hero-right', { x:50 }, { opacity:1, x:0, duration:1, ease:'power3.out' }, '-=1.1')
      .to('.scroll-hint', { opacity:1, duration:.8 }, '-=.3')
      .add(() => { if(glitch) glitch.classList.add('on'); });
  }

  /* ---------- NAV / SCROLL STATE ---------- */
  function scrollState(){
    const nav = document.getElementById('navbar');
    const prog = document.getElementById('scrollProgress');
    const toTop = document.getElementById('toTop');
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if(prog) prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
      if(nav) nav.classList.toggle('scrolled', y > 40);
      if(toTop) toTop.classList.toggle('show', y > 600);
      ticking = false;
    };
    window.addEventListener('scroll', () => { if(!ticking){ requestAnimationFrame(update); ticking = true; } }, { passive:true });
    update();
    if(toTop) toTop.addEventListener('click', () => window.scrollTo({ top:0, behavior: reduce ? 'auto' : 'smooth' }));
  }

  function activeNav(){
    const links = document.querySelectorAll('.nav-links a[data-nav]');
    if(!links.length || !('IntersectionObserver' in window)) return;
    const map = {};
    links.forEach(a => { map[a.dataset.nav] = a; });
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if(e.isIntersecting){
          links.forEach(a => a.classList.remove('active'));
          const a = map[e.target.id]; if(a) a.classList.add('active');
        }
      });
    }, { rootMargin:'-40% 0px -55% 0px' });
    Object.keys(map).forEach(id => { const s = document.getElementById(id); if(s) io.observe(s); });
  }

  function mobileMenu(){
    const burger = document.getElementById('navBurger');
    const menu = document.getElementById('mobileMenu');
    if(!burger || !menu) return;
    const toggle = (open) => {
      const isOpen = open ?? !menu.classList.contains('open');
      menu.classList.toggle('open', isOpen);
      burger.classList.toggle('open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    };
    burger.addEventListener('click', () => toggle());
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
    window.addEventListener('keydown', e => { if(e.key === 'Escape') toggle(false); });
  }

  /* ---------- MUSIC ---------- */
  function music(){
    const audio = document.getElementById('bgMusic');
    const btn = document.getElementById('musicBtn');
    if(!audio) return;
    audio.volume = 0.35;
    const sync = () => { if(btn) btn.classList.toggle('playing', !audio.paused); };
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);

    const tryPlay = () => audio.play().catch(() => {
      const onInteract = () => { audio.play().catch(() => {}); };
      window.addEventListener('pointerdown', onInteract, { once:true });
      window.addEventListener('keydown', onInteract, { once:true });
    });
    tryPlay();

    if(btn) btn.addEventListener('click', e => {
      e.stopPropagation();
      if(audio.paused) audio.play().catch(() => {}); else audio.pause();
    });
  }

  /* ---------- 3D TILT ---------- */
  function tilt(){
    if(!canHover || reduce) return;
    document.querySelectorAll('[data-tilt]').forEach(el => {
      const max = el.classList.contains('pcard') ? 7 : 5;
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.classList.remove('leaving');
        el.style.setProperty('--ry', ((px - .5) * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--rx', ((.5 - py) * max * 2).toFixed(2) + 'deg');
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
      });
      el.addEventListener('pointerleave', () => {
        el.classList.add('leaving');
        el.style.setProperty('--rx', '0deg');
        el.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ---------- MAGNETIC BUTTONS ---------- */
  function magnetic(){
    if(!canHover || reduce || !hasGsap) return;
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        gsap.to(el, { x: dx * .28, y: dy * .28, duration:.4, ease:'power2.out' });
      });
      el.addEventListener('pointerleave', () => {
        gsap.to(el, { x:0, y:0, duration:.7, ease:'elastic.out(1,.4)' });
      });
    });
  }

  /* ---------- PROJECT FILTER ---------- */
  function projectFilter(){
    const wrap = document.getElementById('projFilters');
    const cards = [...document.querySelectorAll('#projGrid .proj-card')];
    const empty = document.getElementById('projEmpty');
    if(!wrap || !cards.length) return;
    wrap.addEventListener('click', e => {
      const btn = e.target.closest('.pf-btn'); if(!btn) return;
      wrap.querySelectorAll('.pf-btn').forEach(b => b.classList.toggle('active', b === btn));
      const f = btn.dataset.filter;
      const shown = [];
      cards.forEach(c => {
        const match = f === 'all' || (c.dataset.cat || '').split(' ').includes(f);
        c.hidden = !match;
        if(match) shown.push(c);
      });
      if(empty) empty.hidden = shown.length > 0;
      if(hasGsap && !reduce){
        gsap.fromTo(shown, { opacity:0, y:24, scale:.97 }, { opacity:1, y:0, scale:1, duration:.55, stagger:.05, ease:'power3.out', overwrite:true, clearProps:'scale' });
        if(typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      } else {
        shown.forEach(c => { c.style.opacity = '1'; c.style.transform = 'none'; });
      }
    });
  }

  /* ---------- UPTIME COUNTER (footer) ---------- */
  function uptime(){
    const el = document.getElementById('uptime'); if(!el) return;
    setInterval(() => { el.textContent = (99.9 + Math.random() * .09).toFixed(2) + '%'; }, 4000);
  }

  function init(){
    splitName();
    scrollState();
    activeNav();
    mobileMenu();
    music();
    tilt();
    magnetic();
    projectFilter();
    uptime();
    preloader(heroIntro);
  }

  window.UI = { init };
})();
