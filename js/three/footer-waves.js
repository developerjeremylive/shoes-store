// ============================================================
// SoleStyle — Ondas del footer 3D (contrato §8 · footer-waves)
// Plano con ShaderMaterial: ondas que reaccionan a la velocidad
// de scroll y vuelven a la calma. Fondo transparente.
// ============================================================

// Shader de vértices: desplaza a lo largo de la normal con una onda senoidal.
const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    float wave = sin(uTime * 1.2 + position.x * 2.0 + position.z * 1.5) * (0.05 + uIntensity * 0.15);
    vec3 displaced = position + normal * wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

// Shader de fragmentos: degradado vertical naranja suave → gris oscuro.
const FRAGMENT_SHADER = `
  varying vec2 vUv;
  void main() {
    vec3 orange = vec3(1.0, 0.42, 0.21);   // #FF6B35
    vec3 dark = vec3(0.102, 0.102, 0.102); // #1A1A1A
    vec3 color = mix(orange, dark, vUv.y);
    float alpha = mix(0.35, 0.55, vUv.y);
    gl_FragColor = vec4(color, alpha);
  }
`;

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

export function initScene(container, options = {}) {
  // Guardas: sin THREE, movimiento reducido o contenedor ausente → null.
  if (typeof THREE === 'undefined') return null;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  if (!container) return null;

  try {
    container = ensureCanvas(container);
    const isMobile = window.innerWidth < 768;

    // Renderer reutilizando el <canvas> real del footer.
    const renderer = new THREE.WebGLRenderer({ canvas: container, alpha: true, antialias: true });
    renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 4.2);
    camera.lookAt(0, 0, 0);

    // Plano ancho que llena el canvas; las ondas desplazan en Z (normal).
    const geometry = new THREE.PlaneGeometry(20, 3, isMobile ? 32 : 64, isMobile ? 16 : 32);
    const material = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uIntensity: { value: 0 } },
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    scene.add(new THREE.Mesh(geometry, material));

    // Estado de scroll: solo se guarda; se aplica con lerp en el loop.
    let velocity = 0;
    const onScroll = (e) => { velocity = e.detail.velocity || 0; };
    window.addEventListener('globalScroll', onScroll);

    // Resize: actualiza cámara y renderer desde el rect del contenedor.
    const onResize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height, false);
    };
    window.addEventListener('resize', onResize);
    onResize();

    // Loop rAF: solo corre cuando el footer es visible.
    let rafId = null;
    let running = false;
    let lastTime = performance.now();

    const loop = (now) => {
      rafId = null;
      if (!running) return;
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Tiempo avanza; intensidad lerpea hacia la velocidad de scroll.
      material.uniforms.uTime.value += delta;
      const target = Math.min(1, Math.abs(velocity) / 400);
      material.uniforms.uIntensity.value += (target - material.uniforms.uIntensity.value) * Math.min(1, delta * 4);

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

    // IntersectionObserver pausa el loop cuando el footer sale de pantalla.
    let observer = null;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => { if (entry.isIntersecting) start(); else stop(); });
      }, { threshold: 0.05 });
      observer.observe(container);
    } else {
      start();
    }

    // Cleanup: libera GL, geometry, material y listeners.
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