/* HERO 3D AVATAR — THREE.JS + CYBER EFFECTS */
(function(){
  'use strict';
  const container = document.getElementById('hero3D');
  if(!container) return;

  let scene, camera, renderer, model, mixer, particles, clock;
  let mouseX = 0, mouseY = 0;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof gsap !== 'undefined';
  let currentAnimIndex = 0;
  let modelAnimations = [];

  function init(){
    clock = new THREE.Clock();

    scene = new THREE.Scene();

    const aspect = container.clientWidth / container.clientHeight || 1;
    camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.set(0, 0.5, 4);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0x112233, 1.8);
    scene.add(ambient);

    const key = new THREE.DirectionalLight(0x00f5ff, 1.6);
    key.position.set(3, 3, 4);
    scene.add(key);

    const rim = new THREE.DirectionalLight(0xff2fd6, 1.2);
    rim.position.set(-3, 1, -2);
    scene.add(rim);

    const bottom = new THREE.DirectionalLight(0x0080ff, 0.9);
    bottom.position.set(0, -2, 2);
    scene.add(bottom);

    scene.fog = new THREE.FogExp2(0x02060f, 0.08);

    loadModel();
    createParticles();

    window.addEventListener('resize', onResize);
    if(!reduce){
      document.addEventListener('mousemove', onMouseMove);
    }

    animate();
  }

  function loadModel(){
    const loader = new THREE.GLTFLoader();
    loader.load(
      './Models/pose2.glb',
      (gltf) => {
        model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = 1.8 / maxDim;

        model.position.x = -1.8;
        model.position.y = -0.2;
        model.position.z = -1;
        model.rotation.y = 0;
        model.rotation.x = 0;

        scene.add(model);

        // Setup animation mixer if animations exist - play automatically
        if(gltf.animations && gltf.animations.length > 0){
          mixer = new THREE.AnimationMixer(model);
          modelAnimations = gltf.animations;
          currentAnimIndex = -1;
          playNextAnimation();
        }

        // Glitch / portal entrance
        if(!reduce){
          model.scale.setScalar(0.01);
          model.visible = false;

          const targetScale = scale;
          const startTime = performance.now();
          const duration = 1400;

          const glitchSteps = [
            { t: 0.00, opacity: 0, scale: 0.01, x: -0.3 },
            { t: 0.08, opacity: 0.6, scale: targetScale * 1.15, x: 0.15 },
            { t: 0.16, opacity: 0.3, scale: targetScale * 0.6, x: -0.1 },
            { t: 0.28, opacity: 0.9, scale: targetScale * 1.05, x: 0.05 },
            { t: 0.40, opacity: 0.5, scale: targetScale * 0.85, x: -0.05 },
            { t: 0.55, opacity: 1.0, scale: targetScale * 1.02, x: 0 },
            { t: 0.70, opacity: 1.0, scale: targetScale * 0.98, x: -0.02 },
            { t: 0.85, opacity: 1.0, scale: targetScale * 1.01, x: 0.01 },
            { t: 1.00, opacity: 1.0, scale: targetScale, x: 0 }
          ];

          let lastStep = 0;
          function glitchReveal(now){
            const elapsed = now - startTime;
            const progress = Math.min(1, elapsed / duration);

            // Find current step
            let current = glitchSteps[0];
            for(let i = glitchSteps.length - 1; i >= 0; i--){
              if(progress >= glitchSteps[i].t){
                current = glitchSteps[i];
                break;
              }
            }

            // Interpolate
            const nextIdx = Math.min(glitchSteps.length - 1, glitchSteps.indexOf(current) + 1);
            const next = glitchSteps[nextIdx];
            const stepProgress = (progress - current.t) / (next.t - current.t || 1);
            const ease = 1 - Math.pow(1 - stepProgress, 3);

            const s = current.scale + (next.scale - current.scale) * ease;
            const x = current.x + (next.x - current.x) * ease;

            model.scale.setScalar(Math.max(0.01, s));
            model.position.x = -1.8 + x;
            model.visible = true;

            if(progress < 1){
              requestAnimationFrame(glitchReveal);
            } else {
              model.scale.setScalar(targetScale);
              model.position.x = -1.8;
            }
          }

          requestAnimationFrame(glitchReveal);
        } else {
          model.scale.setScalar(scale);
          model.visible = true;
        }
      },
      undefined,
      (err) => {
        console.warn('Gagal memuat model 3D:', err);
      }
    );
  }

  function playNextAnimation(){
    if(!mixer || !model || modelAnimations.length === 0) return;

    // Stop all current animations
    mixer.stopAllAction();

    // Get next animation
    currentAnimIndex = (currentAnimIndex + 1) % modelAnimations.length;
    const clip = modelAnimations[currentAnimIndex];

    // Play the animation
    const action = mixer.clipAction(clip);
    action.reset();
    action.fadeIn(0.3);
    action.play();

    // When animation ends, play next one automatically
    const duration = clip.duration * 1000; // convert to ms
    setTimeout(() => {
      action.fadeOut(0.3);
      setTimeout(() => {
        playNextAnimation();
      }, 300);
    }, Math.max(100, duration - 300));
  }

  function createParticles(){
    const count = 120;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const cyan = new THREE.Color(0x00f5ff);
    const magenta = new THREE.Color(0xff2fd6);
    const blue = new THREE.Color(0x0080ff);

    for(let i = 0; i < count; i++){
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 5;
      positions[i3 + 1] = (Math.random() - 0.5) * 5;
      positions[i3 + 2] = (Math.random() - 0.5) * 4 - 1;

      const color = Math.random() > 0.6 ? magenta : (Math.random() > 0.5 ? cyan : blue);
      colors[i3] = color.r;
      colors[i3 + 1] = color.g;
      colors[i3 + 2] = color.b;

      sizes[i] = Math.random() * 3 + 1;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    particles = new THREE.Points(geo, mat);
    scene.add(particles);
  }

  function onMouseMove(e){
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  function onResize(){
    if(!container || !camera || !renderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h || 1;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function animate(){
    requestAnimationFrame(animate);
    if(!renderer || !scene || !camera) return;

    const dt = clock.getDelta();
    const time = clock.getElapsedTime();

    // Update animation mixer
    if(mixer) mixer.update(dt);

    // TV signal loss / glitch effects
    if(model && !reduce){
      const glitchIntensity = 0.003;
      model.position.x = -1.8 + (Math.random() - 0.5) * glitchIntensity;
      model.position.y = -0.2 + (Math.random() - 0.5) * glitchIntensity;
      if(Math.random() > 0.995){
        model.visible = false;
        setTimeout(() => { if(model) model.visible = true; }, 50);
      }
    }

    // Random TV glitch effects on container
    if(!reduce && Math.random() > 0.992){
      const effects = ['tearing', 'rgb-split', 'signal-loss'];
      const effect = effects[Math.floor(Math.random() * effects.length)];
      container.classList.add(effect);
      setTimeout(() => container.classList.remove(effect), 300);
    }

    // Mouse parallax
    if(!reduce){
      camera.position.x += (mouseX * 0.4 - camera.position.x) * dt * 1.5;
      camera.position.y += (mouseY * 0.3 + 0.5 - camera.position.y) * dt * 1.5;
      camera.lookAt(0, 0.2, 0);
    }

    // Animate particles
    if(particles && !reduce){
      const positions = particles.geometry.attributes.position.array;
      for(let i = 0; i < positions.length; i += 3){
        positions[i + 1] += Math.sin(time + i) * dt * 0.08;
        positions[i] += Math.cos(time + i) * dt * 0.04;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.rotation.y += dt * 0.04;
    }

    renderer.render(scene, camera);
  }

  // Initialize when container is ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
