// hero-scene.js — Escena Three.js del hero de SoleStyle.
// Zapatos low-poly flotantes + partículas doradas que reaccionan al scroll.
// API r128: THREE y gsap son globales (sin imports ESM).

export function initScene(container, options = {}) {
  // Guardas: movimiento reducido, contenedor ausente o THREE no cargado.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  if (!container || typeof THREE === 'undefined') return null;

  try {
    const isMobile = window.innerWidth < 768;
    const shoeCount = isMobile ? 3 : 4;
    const particleCount = isMobile ? 60 : 120;

    // Renderer reutilizando el <canvas> del hero (alpha: fondo transparente).
    const renderer = new THREE.WebGLRenderer({ canvas: container, alpha: true, antialias: true });
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0.6, 8);

    // Iluminación base (regla común: AmbientLight + DirectionalLight).
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(4, 6, 5);
    scene.add(dirLight);

    // Paleta de zapatos (tokens de SoleStyle).
    const shoeColors = [0xFF6B35, 0xFFFFFF, 0x1A1A1A, 0x1E3A8A];

    // Construye un zapato low-poly: suela, empeine, talón y punta inclinada.
    function createShoe(color) {
      const group = new THREE.Group();
      const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1 });

      const sole = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.22, 0.75), mat);
      group.add(sole);

      const upper = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.45, 0.65), mat);
      upper.position.set(0.05, 0.32, 0);
      group.add(upper);

      const heel = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.5, 0.65), mat);
      heel.position.set(-0.6, 0.34, 0);
      group.add(heel);

      const toe = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.3, 0.6), mat);
      toe.position.set(0.8, 0.24, 0);
      toe.rotation.z = -0.35; // punta inclinada hacia arriba
      group.add(toe);

      return group;
    }

    // Posiciones base: x -3.5..3.5, y -0.5..1.2, z -2..-6.
    const basePositions = [
      { x: -3.2, y: -0.4, z: -2.5 },
      { x: -1.0, y: 0.9, z: -4.0 },
      { x: 1.2, y: -0.2, z: -3.0 },
      { x: 3.3, y: 0.6, z: -5.5 }
    ];
    const shoes = [];
    for (let i = 0; i < shoeCount; i++) {
      const mesh = createShoe(shoeColors[i]);
      mesh.position.set(basePositions[i].x, basePositions[i].y, basePositions[i].z);
      mesh.rotation.set(0, i * 0.6, 0.08);
      scene.add(mesh);
      shoes.push({ mesh, baseX: basePositions[i].x, baseY: basePositions[i].y, index: i });
    }

    // Partículas doradas flotantes (THREE.Points + BufferGeometry).
    const positions = new Float32Array(particleCount * 3);
    const baseParticles = [];
    for (let i = 0; i < particleCount; i++) {
      const px = (Math.random() - 0.5) * 14;
      const py = (Math.random() - 0.5) * 8;
      const pz = (Math.random() - 0.5) * 10 - 2;
      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;
      baseParticles.push({ x: px, y: py, z: pz, speed: 0.4 + Math.random() * 0.8, phase: Math.random() * Math.PI * 2 });
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xD4AF37, size: 0.07, transparent: true, opacity: 0.85, sizeAttenuation: true });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Estado de scroll: solo se guarda; se aplica con lerp en el loop.
    const state = { scrollY: 0, velocity: 0, vel: 0, progress: 0 };

    // Guarda los valores del evento globalScroll (sin animar aquí).
    function onScroll(e) {
      state.scrollY = e.detail.scrollY;
      state.velocity = e.detail.velocity;
    }
    window.addEventListener('globalScroll', onScroll);

    // Ajusta renderer y cámara al tamaño real del contenedor.
    function resize() {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    // Pausa el rAF cuando el hero sale del viewport (último frame al salir).
    let visible = true;
    let rafId = 0;
    let running = false;
    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !running) {
        running = true;
        loop();
      } else if (!visible && running) {
        renderer.render(scene, camera);
        running = false;
        cancelAnimationFrame(rafId);
      }
    }, { threshold: 0.05 });
    io.observe(container);

    // Loop principal: idle + scroll con lerp (nunca animar en el listener).
    const clock = new THREE.Clock();
    let elapsed = 0;
    function loop() {
      if (!visible) { running = false; return; }
      rafId = requestAnimationFrame(loop);
      const dt = Math.min(clock.getDelta(), 0.05);
      elapsed += dt;

      // Progreso de scroll (0..1) y velocidad con decaimiento (momentum).
      state.progress = Math.max(0, Math.min(1, state.scrollY / window.innerHeight));
      state.vel += (state.velocity - state.vel) * 0.08;
      state.velocity *= 0.9;

      // Zapatos: flotación idle, dispersión por scroll y rotación suave.
      for (let i = 0; i < shoes.length; i++) {
        const s = shoes[i];
        s.mesh.position.y = s.baseY + Math.sin(elapsed * 0.8 + i * 1.7) * 0.3;
        const targetX = s.baseX * (1 + state.progress * 1.5);
        s.mesh.position.x += (targetX - s.mesh.position.x) * 0.08;
        s.mesh.rotation.y += 0.002 + 0.0015 * state.vel;
      }

      // Cámara: zoom out 8 → 11 con lerp.
      const targetZ = 8 + state.progress * 3;
      camera.position.z += (targetZ - camera.position.z) * 0.08;

      // Partículas: flotación senoidal por índice.
      const pos = pGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const b = baseParticles[i];
        pos[i * 3] = b.x + Math.cos(elapsed * b.speed * 0.5 + b.phase) * 0.2;
        pos[i * 3 + 1] = b.y + Math.sin(elapsed * b.speed + b.phase) * 0.35;
      }
      pGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    }

    // Libera todos los recursos de la escena.
    function cleanup() {
      cancelAnimationFrame(rafId);
      running = false;
      io.disconnect();
      window.removeEventListener('globalScroll', onScroll);
      window.removeEventListener('resize', resize);
      shoes.forEach((s) => scene.remove(s.mesh));
      scene.remove(particles);
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
    }

    return cleanup;
  } catch (err) {
    return null; // fallo silencioso, cero console.*
  }
}