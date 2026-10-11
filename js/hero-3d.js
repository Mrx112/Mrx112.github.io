/* 3D AVATAR for the login screen — Three.js r128 + GLTFLoader.
   Hero3D.init(container, { onProgress(p), onLoad(), onError(err) }) / Hero3D.destroy() */
(function(){
  'use strict';
  if(typeof THREE === 'undefined' || !THREE.GLTFLoader) return;

  const MODEL_URL = './Models/pose2.glb';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let container, scene, camera, renderer, clock, raf = 0;
  let pivot, model, mixer, particles, clips = [], clipIndex = -1;
  let mouseX = 0, mouseY = 0, revealStart = 0, unitScale = 1;
  const base = { x: 0, y: 0, size: 2.4 };

  // Glitch entrance: scale multiplier and x jitter over time (from the original hero intro)
  const GLITCH = [
    { t: 0.00, s: 0.01, x: -0.3 }, { t: 0.08, s: 1.15, x: 0.15 }, { t: 0.16, s: 0.60, x: -0.1 },
    { t: 0.28, s: 1.05, x: 0.05 }, { t: 0.40, s: 0.85, x: -0.05 }, { t: 0.55, s: 1.02, x: 0 },
    { t: 0.70, s: 0.98, x: -0.02 }, { t: 0.85, s: 1.01, x: 0.01 }, { t: 1.00, s: 1.00, x: 0 }
  ];
  const GLITCH_MS = 1400;

  function init(el, cb){
    cb = cb || {};
    container = el;
    clock = new THREE.Clock();
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a0a, 0.08);

    camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // Monochrome lighting to match the site: white key, cool-grey rim
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 3, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xa9bccf, 1.3);
    rim.position.set(-3, 1, -2);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 0.35);
    fill.position.set(0, -2, 2);
    scene.add(fill);

    createParticles();
    layout();
    window.addEventListener('resize', layout);
    if(!reduce) document.addEventListener('mousemove', onMouseMove);

    new THREE.GLTFLoader().load(
      MODEL_URL,
      gltf => { addModel(gltf); if(cb.onLoad) cb.onLoad(); },
      xhr => { if(cb.onProgress && xhr.total) cb.onProgress(xhr.loaded / xhr.total); },
      err => { console.warn('Failed to load 3D model:', err); if(cb.onError) cb.onError(err); }
    );

    raf = requestAnimationFrame(animate);
  }

  function addModel(gltf){
    model = gltf.scene;
    // Centre the model inside a pivot so layout can place it freely
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.position.sub(box.getCenter(new THREE.Vector3()));
    unitScale = 1 / Math.max(size.x, size.y, size.z);

    pivot = new THREE.Group();
    pivot.add(model);
    pivot.visible = false;
    scene.add(pivot);

    clips = gltf.animations || [];
    if(clips.length){
      mixer = new THREE.AnimationMixer(model);
      mixer.addEventListener('finished', playNext);
      playNext();
    }
    revealStart = performance.now();
  }

  // Cycle through every clip in the model; a single clip just loops.
  function playNext(){
    if(!mixer) return;
    const prev = clipIndex >= 0 ? mixer.clipAction(clips[clipIndex]) : null;
    clipIndex = (clipIndex + 1) % clips.length;
    const action = mixer.clipAction(clips[clipIndex]);
    action.reset();
    if(clips.length > 1){
      action.setLoop(THREE.LoopOnce);
      action.clampWhenFinished = true;
    }
    action.fadeIn(0.3).play();
    if(prev && prev !== action) prev.fadeOut(0.3);
  }

  function createParticles(){
    const count = 140;
    const positions = new Float32Array(count * 3);
    for(let i = 0; i < count; i++){
      positions[i * 3] = (Math.random() - 0.5) * 7;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4 - 1;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0xffffff, size: 0.02, transparent: true, opacity: 0.5,
      blending: THREE.AdditiveBlending, depthWrite: false
    }));
    scene.add(particles);
  }

  // Wide screens: avatar on the left, login card on the right. Narrow: avatar above the card.
  function layout(){
    if(!container || !renderer) return;
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    const wide = w >= 1024;
    base.x = wide ? -1.2 * Math.min(camera.aspect / 1.8, 1.2) : 0;
    base.y = wide ? -0.05 : 0.55;
    base.size = wide ? 2.6 : 1.9;
  }

  function onMouseMove(e){
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function glitchAt(p){
    let i = 0;
    while(i < GLITCH.length - 2 && p >= GLITCH[i + 1].t) i++;
    const a = GLITCH[i], b = GLITCH[i + 1];
    const k = 1 - Math.pow(1 - Math.min(1, (p - a.t) / (b.t - a.t)), 3);
    return { s: a.s + (b.s - a.s) * k, x: a.x + (b.x - a.x) * k };
  }

  function animate(){
    raf = requestAnimationFrame(animate);
    const dt = clock.getDelta();
    const time = clock.elapsedTime;
    if(mixer) mixer.update(dt);

    if(pivot){
      let s = 1, jx = 0, jy = 0;
      const p = reduce ? 1 : Math.min(1, (performance.now() - revealStart) / GLITCH_MS);
      if(p < 1){
        const g = glitchAt(p);
        s = g.s; jx = g.x;
      } else if(!reduce){
        jx = (Math.random() - 0.5) * 0.003; // faint signal jitter
        jy = (Math.random() - 0.5) * 0.003;
      }
      pivot.scale.setScalar(Math.max(0.01, unitScale * base.size * s));
      pivot.position.set(base.x + jx, base.y + jy, 0);
      pivot.visible = (!reduce && p >= 1) ? Math.random() > 0.004 : true; // rare one-frame dropout
      if(!clips.length && !reduce) pivot.rotation.y = Math.sin(time * 0.5) * 0.2;
    }

    if(!reduce){
      camera.position.x += (mouseX * 0.35 - camera.position.x) * dt * 1.5;
      camera.position.y += (mouseY * 0.25 - camera.position.y) * dt * 1.5;
      if(particles) particles.rotation.y += dt * 0.04;
    }
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }

  function destroy(){
    cancelAnimationFrame(raf);
    window.removeEventListener('resize', layout);
    document.removeEventListener('mousemove', onMouseMove);
    if(mixer) mixer.stopAllAction();
    if(scene){
      scene.traverse(obj=>{
        if(obj.geometry) obj.geometry.dispose();
        if(obj.material) [].concat(obj.material).forEach(m=>m.dispose());
      });
    }
    if(renderer){
      renderer.dispose();
      renderer.domElement.remove();
    }
    scene = camera = renderer = pivot = model = mixer = particles = null;
  }

  window.Hero3D = { init, destroy };
})();
