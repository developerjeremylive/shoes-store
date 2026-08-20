// ============================================================
// SoleStyle — Línea de tiempo 3D (contrato §8 · timeline-line)
// Tubo vertical con curva CatmullRom que se dibuja con el scroll
// y crea los hitos .timeline-milestone dentro de #timeline.
// ============================================================

// Datos de los 6 hitos: año, título y texto corto del popup.
const MILESTONES = [
  { year: '2016', title: 'Nace SoleStyle', text: 'Fundamos SoleStyle con una idea clara: calzado premium accesible para todos.' },
  { year: '2018', title: 'Primera tienda física', text: 'Abrimos nuestra primera tienda en el corazón de la ciudad.' },
  { year: '2020', title: 'Colección Running Pro', text: 'Lanzamos la colección Running Pro con amortiguación de diseño propio.' },
  { year: '2022', title: '100,000 clientes', text: 'Superamos los 100,000 clientes en toda la región.' },
  { year: '2024', title: 'Expansión internacional', text: 'Llevamos SoleStyle a nuevos mercados internacionales.' },
  { year: '2026', title: 'SoleStyle 3D', text: 'Presentamos SoleStyle 3D: diseño y prueba de calzado en tres dimensiones.' }
];

// Crea un elemento DOM con clase y contenido HTML opcional.
function createEl(tag, className, html) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (html) el.innerHTML = html;
  return el;
}

// Si el contenedor no es un <canvas> real, lo reemplaza por uno (defensa ante markup distinto).
function ensureCanvas(container) {
  if (container && container.tagName === 'CANVAS') return container;
  const canvas = document.createElement('canvas');
  canvas.id = container.id;
  canvas.className = container.className;
  canvas.setAttribute('aria-hidden', 'true');
  if (container.parentNode) container.parentNode.replaceChild(canvas, container);
  return canvas;
}

// Crea los 6 hitos dentro de #timeline, alternando izquierda/derecha.
function createMilestones(section) {
  const n = MILESTONES.length;
  MILESTONES.forEach((m, i) => {
    const el = createEl('div', 'timeline-milestone');
    el.style.position = 'absolute';
    el.style.top = (i / (n - 1) * 100) + '%';
    if (i % 2 === 0) el.style.left = '0';
    else el.style.right = '0';
    el.appendChild(createEl('span', 'timeline-milestone__dot'));
    el.appendChild(createEl('span', 'timeline-milestone__year', m.year));
    el.appendChild(createEl('h3', 'timeline-milestone__title', m.title));
    const popup = createEl('div', 'timeline-milestone__popup');
    popup.appendChild(createEl('span', 'timeline-milestone__year', m.year));
    popup.appendChild(createEl('p', '', m.text));
    el.appendChild(popup);
    section.appendChild(el);
  });
}

export function initScene(container, options = {}) {
  // Guardas: sin THREE, movimiento reducido o contenedor ausente → null.
  if (typeof THREE === 'undefined') return null;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  if (!container) return null;

  try {
    container = ensureCanvas(container);
    const section = container.parentElement; // #timeline
    if (!section) return null;
    // Evita duplicar hitos si initScene se llama dos veces.
    if (section.querySelector('.timeline-milestone')) return null;

    const isMobile = window.innerWidth < 768;

    // Renderer reutilizando el <canvas> real del HTML.
    const renderer = new THREE.WebGLRenderer({ canvas: container, alpha: true, antialias: true });
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 8);
    camera.lookAt(0, 0, 0);

    // Curva CatmullRom vertical con leve sinuosa en X (de arriba a abajo).
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.0, 3.0, 0),
      new THREE.Vector3(1.0, 2.0, 0),
      new THREE.Vector3(0.6, 1.0, 0),
      new THREE.Vector3(-0.6, 0.0, 0),
      new THREE.Vector3(-1.0, -1.0, 0),
      new THREE.Vector3(-0.6, -2.0, 0),
      new THREE.Vector3(0.0, -3.0, 0)
    ]);

    // Tubo que se dibuja progresivamente con setDrawRange.
    const geometry = new THREE.TubeGeometry(curve, isMobile ? 100 : 200, 0.06, isMobile ? 6 : 8, false);
    const material = new THREE.MeshStandardMaterial({ color: 0xFF6B35, roughness: 0.4, metalness: 0.1 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Luces: ambiente + direccional (regla común del contrato).
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(3, 5, 5);
    scene.add(dirLight);

    // Hitos DOM dentro de #timeline (hermanos del canvas).
    createMilestones(section);
    const milestoneEls = section.querySelectorAll('.timeline-milestone');

    // Estado de scroll: solo se guarda; se aplica con lerp en el loop.
    let scrollState = { scrollY: window.scrollY, velocity: 0 };
    const onScroll = (e) => { scrollState = { scrollY: e.detail.scrollY, velocity: e.detail.velocity }; };
    window.addEventListener('globalScroll', onScroll);

    // Posición de la sección en el documento (se recalcula en resize).
    let sectionTop = 0;
    let sectionHeight = 1;
    const measureSection = () => {
      const rect = section.getBoundingClientRect();
      sectionTop = rect.top + window.scrollY;
      sectionHeight = Math.max(rect.height, 1);
    };
    measureSection();

    // Estado del dibujo: drawRangeCount lerpea hacia el objetivo.
    const indexCount = geometry.index ? geometry.index.count : geometry.attributes.position.count;
    let drawRangeCount = 0;
    let targetDrawRange = 0;

    // Punto final de la curva (para que la cámara lo siga suavemente).
    const curveEnd = new THREE.Vector3();

    // Activa los hitos cuando la línea llega a su posición (±0.02).
    const activateMilestones = (progress) => {
      const n = MILESTONES.length;
      for (let i = 0; i < n; i++) {
        const active = progress >= (i / (n - 1)) - 0.02;
        milestoneEls[i].classList.toggle('is-active', active);
        milestoneEls[i].querySelector('.timeline-milestone__popup').classList.toggle('is-active', active);
      }
    };

    // Resize: actualiza cámara, renderer y medidas de la sección.
    const onResize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height, false);
      measureSection();
    };
    window.addEventListener('resize', onResize);
    onResize();

    // Loop rAF: solo corre cuando la sección es visible.
    let rafId = null;
    let running = false;
    let lastTime = performance.now();

    const loop = (now) => {
      rafId = null;
      if (!running) return;
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Progreso de la sección (clamp 0..1) desde el scroll guardado.
      const progress = Math.max(0, Math.min(1, (scrollState.scrollY - sectionTop) / sectionHeight));

      // Lerp del drawRange hacia el objetivo.
      targetDrawRange = Math.floor(progress * indexCount);
      drawRangeCount += (targetDrawRange - drawRangeCount) * Math.min(1, delta * 6);
      geometry.setDrawRange(0, Math.floor(drawRangeCount));

      // Cámara sigue el extremo dibujado de la curva (sutil, en Y).
      curve.getPointAt(progress, curveEnd);
      const camY = Math.max(-1.2, Math.min(1.2, curveEnd.y * 0.4));
      camera.position.y += (camY - camera.position.y) * Math.min(1, delta * 3);
      camera.lookAt(0, camera.position.y * 0.5, 0);

      activateMilestones(progress);
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (!running) { running = true; lastTime = performance.now(); rafId = requestAnimationFrame(loop); }
    };
    const stop = () => {
      running = false;
      if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
    };

    // IntersectionObserver pausa el loop cuando la sección sale de pantalla.
    let observer = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) start(); else stop(); });
      }, { threshold: 0.05 });
      observer.observe(section);
    } else {
      start();
    }

    // Cleanup: libera GL, geometry, material y listeners (los hitos quedan en el DOM).
    return function cleanup() {
      stop();
      if (observer) observer.disconnect();
      window.removeEventListener('globalScroll', onScroll);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  } catch (err) {
    return null;
  }
}