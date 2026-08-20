// category-cubes.js — Cubos 3D por categoría de SoleStyle.
// Un mini renderer por .category-cube; entrada escalonada + hover en desktop.
// API r128: THREE y gsap son globales (sin imports ESM).

export function initScene(containerEls, options = {}) {
  // Guardas: movimiento reducido, sin contenedores o THREE no cargado.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  if (!containerEls || !containerEls.length || typeof THREE === 'undefined') return null;

  try {
    const isMobile = window.innerWidth < 768;

    // Colores por categoría (tokens de SoleStyle).
    const CATEGORY_COLORS = {
      running: 0xFF6B35, casual: 0x1A1A1A, formal: 0x1E3A8A,
      deportivo: 0xB91C1C, lifestyle: 0x166534, outdoor: 0xD6C7A9
    };

    const cubes = [];
    containerEls.forEach((el) => {
      const category = el.dataset.category || 'casual';
      const baseColor = CATEGORY_COLORS[category] || 0x1A1A1A;

      // Canvas propio dentro del <a> (mismo tamaño que el elemento).
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
      el.appendChild(canvas);

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0, 3);

      // Iluminación base (regla común: AmbientLight + DirectionalLight).
      scene.add(new THREE.AmbientLight(0xffffff, 0.7));
      const dir = new THREE.DirectionalLight(0xffffff, 0.9);
      dir.position.set(2, 3, 4);
      scene.add(dir);

      const material = new THREE.MeshStandardMaterial({ color: baseColor, roughness: 0.5, metalness: 0.15 });
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), material);
      mesh.scale.set(0, 0, 0); // empieza en 0; la entrada lo anima a 1
      scene.add(mesh);

      const rect = el.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      cubes.push({ el, canvas, renderer, scene, camera, mesh, material, baseColor, visible: false, entering: true, handlers: null });
    });

    // Redimensiona todos los renderers desde el rect de cada elemento.
    function resize() {
      cubes.forEach((c) => {
        const rect = c.el.getBoundingClientRect();
        const w = Math.max(1, rect.width);
        const h = Math.max(1, rect.height);
        c.renderer.setSize(w, h, false);
        c.camera.aspect = w / h;
        c.camera.updateProjectionMatrix();
      });
    }
    window.addEventListener('resize', resize);

    // IO por canvas: pausa el render cuando el cubo sale del viewport.
    const observers = [];
    cubes.forEach((c) => {
      const io = new IntersectionObserver((entries) => {
        c.visible = entries[0].isIntersecting;
        if (c.visible) startLoop();
        else c.renderer.render(c.scene, c.camera); // último frame al salir
      }, { threshold: 0.1 });
      io.observe(c.canvas);
      observers.push(io);
    });

    // Entrada escalonada: IO sobre la cuadrícula (threshold 0.3, one-shot).
    const grid = containerEls[0].closest('.categories-grid') || containerEls[0].parentElement;
    let entranceDone = false;
    const gridIO = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || entranceDone) return;
      entranceDone = true;
      gridIO.disconnect();

      // Sin gsap: escala directa a 1 (fallback silencioso).
      if (typeof gsap === 'undefined') {
        cubes.forEach((c) => { c.mesh.scale.set(1, 1, 1); c.entering = false; });
        return;
      }

      // Timeline GSAP: cada cubo escala 0→1 + giro 360° en X, escalonado.
      const tl = gsap.timeline();
      cubes.forEach((c, i) => {
        tl.to(c.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'back.out(1.7)' }, i * 0.2);
        tl.to(c.mesh.rotation, { x: Math.PI * 2, duration: 0.6, ease: 'power1.inOut' }, i * 0.2);
      });
      tl.eventCallback('onComplete', () => {
        cubes.forEach((c) => { c.entering = false; });
      });
    }, { threshold: 0.3 });
    gridIO.observe(grid);

    // Hover en la card padre (solo desktop): escala 1.25 + color accent.
    if (!isMobile && typeof gsap !== 'undefined') {
      cubes.forEach((c) => {
        const card = c.el.closest('.category-card') || c.el;
        const onEnter = () => {
          gsap.to(c.mesh.scale, { x: 1.25, y: 1.25, z: 1.25, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
          gsap.to(c.material.color, { r: 1, g: 0.42, b: 0.21, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
        };
        const onLeave = () => {
          gsap.to(c.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.4, ease: 'power2.out', overwrite: 'auto' });
          gsap.to(c.material.color, {
            r: (c.baseColor >> 16 & 255) / 255,
            g: (c.baseColor >> 8 & 255) / 255,
            b: (c.baseColor & 255) / 255,
            duration: 0.4, ease: 'power2.out', overwrite: 'auto'
          });
        };
        card.addEventListener('mouseenter', onEnter);
        card.addEventListener('mouseleave', onLeave);
        c.handlers = { card, onEnter, onLeave };
      });
    }

    // Loop compartido: rota y renderiza solo los cubos visibles.
    let rafId = 0;
    let running = false;
    function startLoop() {
      if (running) return;
      running = true;
      loop();
    }
    function loop() {
      if (!cubes.some((c) => c.visible)) { running = false; return; }
      rafId = requestAnimationFrame(loop);
      cubes.forEach((c) => {
        if (!c.visible) return;
        if (!c.entering) {
          c.mesh.rotation.y += 0.008;
          if (!isMobile) c.mesh.rotation.x += 0.004; // móvil: rotación simple
        }
        c.renderer.render(c.scene, c.camera);
      });
    }

    // Libera todos los recursos de los cubos.
    function cleanup() {
      cancelAnimationFrame(rafId);
      running = false;
      gridIO.disconnect();
      observers.forEach((io) => io.disconnect());
      window.removeEventListener('resize', resize);
      cubes.forEach((c) => {
        if (c.handlers) {
          c.handlers.card.removeEventListener('mouseenter', c.handlers.onEnter);
          c.handlers.card.removeEventListener('mouseleave', c.handlers.onLeave);
        }
        c.mesh.geometry.dispose();
        c.material.dispose();
        c.renderer.dispose();
        if (c.canvas.parentNode) c.canvas.parentNode.removeChild(c.canvas);
      });
    }

    return cleanup;
  } catch (err) {
    return null; // fallo silencioso, cero console.*
  }
}