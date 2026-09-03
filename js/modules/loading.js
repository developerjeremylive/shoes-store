// loading.js — Loading overlay con animación Three.js espectacular.

(function () {
  'use strict';

  const overlay = document.getElementById('loadingOverlay');
  if (!overlay) return;

  const canvas = document.getElementById('loadingCanvas');
  const barFill = overlay.querySelector('.loading-bar-fill');
  let progress = 0;
  let dismissed = false;

  // ---- Progress simulation ----
  function tick() {
    if (dismissed) return;
    const remaining = 100 - progress;
    progress += Math.max(0.5, remaining * 0.08);
    if (progress > 95) progress = 95;
    if (barFill) barFill.style.width = progress + '%';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ---- Three.js scene ----
  let renderer, scene, camera, wireframe, particles, clock, velocities;
  let raf;

  function init() {
    if (typeof THREE === 'undefined') return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0A0A0F, 1);

    clock = new THREE.Clock();

    // Central wireframe icosahedron
    const icoGeo = new THREE.IcosahedronGeometry(1.2, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: 0xFF6B35,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    wireframe = new THREE.Mesh(icoGeo, icoMat);
    scene.add(wireframe);

    // Outer wireframe ring
    const ringGeo = new THREE.IcosahedronGeometry(1.8, 0);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      wireframe: true,
      transparent: true,
      opacity: 0.08
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ring);
    wireframe.userData.ring = ring;

    // Particles
    const count = 200;
    const positions = new Float32Array(count * 3);
    velocities = [];
    for (let i = 0; i < count; i++) {
      const r = 2 + Math.random() * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      velocities.push({
        speed: 0.002 + Math.random() * 0.006,
        offset: Math.random() * Math.PI * 2
      });
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xFF6B35,
      size: 0.02,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true
    });
    particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Orange point light
    const light = new THREE.PointLight(0xFF6B35, 2, 10);
    light.position.set(0, 0, 3);
    scene.add(light);

    animate();
  }

  function animate() {
    raf = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Rotate icosahedron
    wireframe.rotation.x = t * 0.3;
    wireframe.rotation.y = t * 0.5;

    // Counter-rotate outer ring
    const ring = wireframe.userData.ring;
    if (ring) {
      ring.rotation.x = -t * 0.15;
      ring.rotation.z = t * 0.2;
    }

    // Pulse scale
    const s = 1 + Math.sin(t * 1.5) * 0.05;
    wireframe.scale.set(s, s, s);

    // Rotate particles
    particles.rotation.y = t * 0.1;
    particles.rotation.x = t * 0.05;

    // Animate individual particle positions
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < pos.length / 3; i++) {
      const v = velocities[i];
      const idx = i * 3;
      const r = Math.sqrt(pos[idx] ** 2 + pos[idx + 1] ** 2 + pos[idx + 2] ** 2);
      const angle = t * v.speed + v.offset;
      pos[idx] += Math.cos(angle) * 0.003;
      pos[idx + 1] += Math.sin(angle * 0.7) * 0.003;
      pos[idx + 2] += Math.sin(angle) * 0.002;
      // Keep particles within bounds
      const newR = Math.sqrt(pos[idx] ** 2 + pos[idx + 1] ** 2 + pos[idx + 2] ** 2);
      if (newR > 5) {
        pos[idx] *= 0.95;
        pos[idx + 1] *= 0.95;
        pos[idx + 2] *= 0.95;
      }
    }
    particles.geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  function dispose() {
    if (raf) cancelAnimationFrame(raf);
    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
    }
    scene = null;
    camera = null;
    wireframe = null;
    particles = null;
    velocities = null;
  }

  // ---- Dismiss loading ----
  function dismiss() {
    if (dismissed) return;
    dismissed = true;

    // Complete progress bar
    if (barFill) barFill.style.width = '100%';

    setTimeout(() => {
      overlay.classList.add('is-hidden');
      dispose();
      // Remove from DOM after transition
      setTimeout(() => overlay.remove(), 700);
    }, 400);
  }

  // Dismiss when page fully loaded
  if (document.readyState === 'complete') {
    dismiss();
  } else {
    window.addEventListener('load', dismiss);
  }

  // Safety: dismiss after 4s max
  setTimeout(dismiss, 4000);

  // Init Three.js
  init();

  // Handle resize
  window.addEventListener('resize', () => {
    if (!renderer || !camera) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
