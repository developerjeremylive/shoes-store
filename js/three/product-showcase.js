// product-showcase.js — Zapato low-poly interactivo del showcase de SoleStyle.
// Rotación vinculada al scroll + órbita de cámara (OrbitControls) + cambio de color.
// API r128: THREE y gsap son globales (sin imports ESM).

// Estado compartido entre initScene y setShowcaseColor.
let showcaseMaterial = null;
let currentColor = null;
let targetColor = null;

export function initScene(container, options = {}) {
  // Guardas: movimiento reducido, contenedor ausente o THREE no cargado.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  if (!container || typeof THREE === 'undefined') return null;

  try {
    const startHex = options.color || 0x1A1A1A;

    // Si el contenedor no es un <canvas> real, crea uno dentro (patrón de category-cubes).
    let canvas = container;
    if (container.tagName !== 'CANVAS') {
      canvas = document.createElement('canvas');
      container.appendChild(canvas);
    }

    // Renderer usando el <canvas> del showcase (alpha: fondo transparente).
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 1.1, 5);

    // Iluminación base (regla común: AmbientLight + DirectionalLight).
    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    // Material compartido por todo el zapato (el color cambia con el swatch).
    const material = new THREE.MeshStandardMaterial({ color: startHex, roughness: 0.55, metalness: 0.12 });
    showcaseMaterial = material;
    currentColor = new THREE.Color(startHex);
    targetColor = new THREE.Color(startHex);

    // Zapato low-poly detallado: suela multi-caja, empeine, talón, punta y agujetas.
    const shoe = new THREE.Group();

    const soleMain = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.22, 0.9), material);
    shoe.add(soleMain);

    const soleFront = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.18, 0.8), material);
    soleFront.position.set(1.15, 0.05, 0);
    soleFront.rotation.z = -0.15;
    shoe.add(soleFront);

    const soleHeel = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.28, 0.85), material);
    soleHeel.position.set(-1.05, 0.05, 0);
    shoe.add(soleHeel);

    const upper = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 0.8), material);
    upper.position.set(0.05, 0.42, 0);
    shoe.add(upper);

    const heel = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.6, 0.8), material);
    heel.position.set(-0.75, 0.5, 0);
    shoe.add(heel);

    const toe = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.35, 0.7), material);
    toe.position.set(1.05, 0.35, 0);
    toe.rotation.z = -0.3;
    shoe.add(toe);

    // Agujetas: 3 cajas finas cruzadas sobre el empeine.
    for (let i = 0; i < 3; i++) {
      const lace = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.07), material);
      lace.position.set(0.1 + i * 0.35, 0.72, 0);
      lace.rotation.z = 0.15;
      shoe.add(lace);
    }

    shoe.position.y = -0.2;
    scene.add(shoe);

    // OrbitControls: órbita de cámara para inspección (el scroll rota el mesh).
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = true;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.8;
    controls.target.set(0, 0.3, 0);

    // Posición de la sección para calcular el progreso de scroll.
    let sectionTop = 0;
    let sectionHeight = 1;
    function updateSection() {
      const rect = container.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionHeight = Math.max(1, rect.height);
    }
    updateSection();

    // Estado de scroll: solo se guarda; se aplica con lerp en el loop.
    const state = { scrollY: 0, velocity: 0, progress: 0 };

    // Guarda los valores del evento globalScroll (sin animar aquí).
    function onScroll(e) {
      state.scrollY = e.detail.scrollY;
      state.velocity = e.detail.velocity;
    }
    window.addEventListener('globalScroll', onScroll);

    // Ajusta renderer, cámara y posición de sección al tamaño real.
    function resize() {
      const rect = container.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      updateSection();
    }
    resize();
    window.addEventListener('resize', resize);

    // Pausa el rAF cuando el showcase sale del viewport (último frame al salir).
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

    // Loop principal: rotación por scroll + lerp de color + controles.
    function loop() {
      if (!visible) { running = false; return; }
      rafId = requestAnimationFrame(loop);

      // Progreso de scroll (0..1) → rotación objetivo del zapato (2 vueltas).
      state.progress = Math.max(0, Math.min(1, (state.scrollY - sectionTop) / sectionHeight));
      const targetRotY = state.progress * Math.PI * 2;
      shoe.rotation.y += (targetRotY - shoe.rotation.y) * 0.08;

      // Lerp del color del material hacia el objetivo del swatch.
      if (targetColor) {
        currentColor.lerp(targetColor, 0.1);
        material.color.copy(currentColor);
      }

      controls.update();
      renderer.render(scene, camera);
    }

    // Libera todos los recursos de la escena.
    function cleanup() {
      cancelAnimationFrame(rafId);
      running = false;
      io.disconnect();
      window.removeEventListener('globalScroll', onScroll);
      window.removeEventListener('resize', resize);
      controls.dispose();
      shoe.traverse((child) => { if (child.isMesh) child.geometry.dispose(); });
      material.dispose();
      renderer.dispose();
      showcaseMaterial = null;
      currentColor = null;
      targetColor = null;
    }

    return cleanup;
  } catch (err) {
    return null; // fallo silencioso, cero console.*
  }
}

// Cambia el color del zapato (lerp en el loop) y el swatch activo del showcase.
export function setShowcaseColor(hex) {
  if (!showcaseMaterial || !hex) return;
  targetColor = new THREE.Color(hex);
  document.querySelectorAll('.showcase .color-swatch').forEach((s) => {
    const match = (s.dataset.hex || '').toLowerCase() === hex.toLowerCase();
    s.classList.toggle('is-active', match);
  });
}