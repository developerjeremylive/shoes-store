// page-animations.js — Background animations for About & Contact pages
// Inspired by vgpu.sh and crafter.run examples

class PageAnimations {
  constructor() {
    this.canvas = document.getElementById('pageBgCanvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.width = 0;
    this.height = 0;
    this.animationId = null;
    this.currentAnimation = null;
    this.pageId = this.getPageId();
    
    // Load animation from CMS or use default
    this.animationType = this.loadAnimationType();
    
    this.init();
  }
  
  getPageId() {
    const path = window.location.pathname;
    if (path.includes('sobre-nosotros')) return 'about';
    if (path.includes('contacto')) return 'contact';
    return 'about';
  }
  
  loadAnimationType() {
    try {
      const pages = JSON.parse(localStorage.getItem('solestyle_cms_pages') || '[]');
      const page = pages.find(p => p.id === this.pageId);
      if (page && page.backgroundAnimation) {
        return page.backgroundAnimation;
      }
    } catch (e) {}
    
    // Default animations per page
    return this.pageId === 'about' ? 'particles' : 'waves';
  }
  
  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    
    // Start animation based on type
    this.setAnimation(this.animationType);
  }
  
  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }
  
  setAnimation(type) {
    // Cleanup previous
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.currentAnimation && this.currentAnimation.destroy) {
      this.currentAnimation.destroy();
    }
    
    this.currentAnimation = null;
    
    switch (type) {
      case 'particles':
        this.currentAnimation = new ParticlesAnimation(this);
        break;
      case 'waves':
        this.currentAnimation = new WavesAnimation(this);
        break;
      case 'geometric':
        this.currentAnimation = new GeometricAnimation(this);
        break;
      case 'fluid':
        this.currentAnimation = new FluidAnimation(this);
        break;
      case 'neural':
        this.currentAnimation = new NeuralAnimation(this);
        break;
      default:
        this.currentAnimation = new ParticlesAnimation(this);
    }
    
    this.animate();
  }
  
  animate() {
    if (!this.currentAnimation) return;
    
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.currentAnimation.update();
    this.currentAnimation.draw();
    
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.currentAnimation && this.currentAnimation.destroy) {
      this.currentAnimation.destroy();
    }
  }
}

// ── Particles Animation ───────────────────────────────────────
class ParticlesAnimation {
  constructor(app) {
    this.app = app;
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
    this.init();
  }
  
  init() {
    // Create particles
    const count = Math.min(100, Math.floor((this.app.width * this.app.height) / 15000));
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.app.width,
        y: Math.random() * this.app.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
    
    // Mouse interaction
    this.handleMouseMove = (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', this.handleMouseMove);
  }
  
  update() {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      // Bounce off edges
      if (p.x < 0 || p.x > this.app.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.app.height) p.vy *= -1;
      
      // Mouse repulsion
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const force = (150 - dist) / 150;
        p.vx += (dx / dist) * force * 0.5;
        p.vy += (dy / dist) * force * 0.5;
      }
      
      // Damping
      p.vx *= 0.99;
      p.vy *= 0.99;
    });
  }
  
  draw() {
    const ctx = this.app.ctx;
    
    // Draw connections
    ctx.strokeStyle = 'rgba(255, 107, 53, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 120) {
          const opacity = (1 - dist / 120) * 0.3;
          ctx.strokeStyle = `rgba(255, 107, 53, ${opacity})`;
          ctx.beginPath();
          ctx.moveTo(this.particles[i].x, this.particles[i].y);
          ctx.lineTo(this.particles[j].x, this.particles[j].y);
          ctx.stroke();
        }
      }
    }
    
    // Draw particles
    this.particles.forEach(p => {
      ctx.fillStyle = `rgba(255, 107, 53, ${p.opacity})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  destroy() {
    window.removeEventListener('mousemove', this.handleMouseMove);
  }
}

// ── Waves Animation ───────────────────────────────────────────
class WavesAnimation {
  constructor(app) {
    this.app = app;
    this.waves = [];
    this.time = 0;
    this.init();
  }
  
  init() {
    // Create multiple wave layers
    const colors = [
      { r: 255, g: 107, b: 53 },  // Accent
      { r: 255, g: 130, b: 80 },  // Lighter accent
      { r: 255, g: 80, b: 30 }    // Darker accent
    ];
    
    for (let i = 0; i < 3; i++) {
      this.waves.push({
        amplitude: 50 + i * 20,
        frequency: 0.003 - i * 0.0005,
        speed: 0.02 + i * 0.005,
        offset: i * 0.5,
        color: colors[i],
        opacity: 0.15 - i * 0.03
      });
    }
  }
  
  update() {
    this.time += 0.016;
  }
  
  draw() {
    const ctx = this.app.ctx;
    const width = this.app.width;
    const height = this.app.height;
    
    this.waves.forEach(wave => {
      ctx.beginPath();
      ctx.moveTo(0, height);
      
      for (let x = 0; x <= width; x += 5) {
        const y = height / 2 + 
                  Math.sin(x * wave.frequency + this.time * wave.speed + wave.offset) * wave.amplitude +
                  Math.sin(x * wave.frequency * 0.5 + this.time * wave.speed * 0.7) * wave.amplitude * 0.5;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      
      const gradient = ctx.createLinearGradient(0, height / 2, 0, height);
      gradient.addColorStop(0, `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, ${wave.opacity})`);
      gradient.addColorStop(1, `rgba(${wave.color.r}, ${wave.color.g}, ${wave.color.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
    });
  }
  
  destroy() {}
}

// ── Geometric Animation ───────────────────────────────────────
class GeometricAnimation {
  constructor(app) {
    this.app = app;
    this.shapes = [];
    this.time = 0;
    this.init();
  }
  
  init() {
    const count = Math.min(20, Math.floor((this.app.width * this.app.height) / 50000));
    
    for (let i = 0; i < count; i++) {
      this.shapes.push({
        x: Math.random() * this.app.width,
        y: Math.random() * this.app.height,
        size: Math.random() * 60 + 20,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        type: Math.floor(Math.random() * 3), // 0: square, 1: triangle, 2: hexagon
        opacity: Math.random() * 0.2 + 0.05
      });
    }
  }
  
  update() {
    this.time += 0.016;
    
    this.shapes.forEach(shape => {
      shape.rotation += shape.rotationSpeed;
      shape.y -= 0.2;
      
      if (shape.y < -shape.size) {
        shape.y = this.app.height + shape.size;
        shape.x = Math.random() * this.app.width;
      }
    });
  }
  
  draw() {
    const ctx = this.app.ctx;
    
    this.shapes.forEach(shape => {
      ctx.save();
      ctx.translate(shape.x, shape.y);
      ctx.rotate(shape.rotation);
      
      ctx.strokeStyle = `rgba(255, 107, 53, ${shape.opacity})`;
      ctx.lineWidth = 2;
      
      ctx.beginPath();
      
      switch (shape.type) {
        case 0: // Square
          ctx.rect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
          break;
        case 1: // Triangle
          for (let i = 0; i < 3; i++) {
            const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2;
            const x = Math.cos(angle) * shape.size / 2;
            const y = Math.sin(angle) * shape.size / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          break;
        case 2: // Hexagon
          for (let i = 0; i < 6; i++) {
            const angle = (i * 2 * Math.PI) / 6;
            const x = Math.cos(angle) * shape.size / 2;
            const y = Math.sin(angle) * shape.size / 2;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          break;
      }
      
      ctx.stroke();
      ctx.restore();
    });
  }
  
  destroy() {}
}

// ── Fluid Animation ───────────────────────────────────────────
class FluidAnimation {
  constructor(app) {
    this.app = app;
    this.blobs = [];
    this.time = 0;
    this.init();
  }
  
  init() {
    const colors = [
      { r: 255, g: 107, b: 53 },
      { r: 255, g: 130, b: 80 },
      { r: 255, g: 80, b: 30 },
      { r: 200, g: 80, b: 40 }
    ];
    
    for (let i = 0; i < 4; i++) {
      this.blobs.push({
        x: this.app.width * (0.2 + Math.random() * 0.6),
        y: this.app.height * (0.2 + Math.random() * 0.6),
        radius: Math.random() * 150 + 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        color: colors[i],
        opacity: 0.1
      });
    }
  }
  
  update() {
    this.time += 0.016;
    
    this.blobs.forEach(blob => {
      // Organic movement
      blob.x += Math.sin(this.time * 0.5 + blob.vx * 10) * 0.5;
      blob.y += Math.cos(this.time * 0.3 + blob.vy * 10) * 0.5;
      
      // Bounce off edges with padding
      const padding = blob.radius;
      if (blob.x < padding || blob.x > this.app.width - padding) blob.vx *= -1;
      if (blob.y < padding || blob.y > this.app.height - padding) blob.vy *= -1;
      
      // Keep in bounds
      blob.x = Math.max(padding, Math.min(this.app.width - padding, blob.x));
      blob.y = Math.max(padding, Math.min(this.app.height - padding, blob.y));
    });
  }
  
  draw() {
    const ctx = this.app.ctx;
    
    this.blobs.forEach(blob => {
      const gradient = ctx.createRadialGradient(
        blob.x, blob.y, 0,
        blob.x, blob.y, blob.radius
      );
      
      gradient.addColorStop(0, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, ${blob.opacity})`);
      gradient.addColorStop(1, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  destroy() {}
}

// ── Neural Animation ──────────────────────────────────────────
class NeuralAnimation {
  constructor(app) {
    this.app = app;
    this.nodes = [];
    this.connections = [];
    this.time = 0;
    this.init();
  }
  
  init() {
    const count = Math.min(30, Math.floor((this.app.width * this.app.height) / 40000));
    
    // Create nodes
    for (let i = 0; i < count; i++) {
      this.nodes.push({
        x: Math.random() * this.app.width,
        y: Math.random() * this.app.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 4 + 2,
        pulse: Math.random() * Math.PI * 2
      });
    }
    
    // Create connections between nearby nodes
    this.updateConnections();
  }
  
  updateConnections() {
    this.connections = [];
    const maxDist = 200;
    
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const dx = this.nodes[i].x - this.nodes[j].x;
        const dy = this.nodes[i].y - this.nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < maxDist) {
          this.connections.push({
            from: this.nodes[i],
            to: this.nodes[j],
            dist: dist,
            maxDist: maxDist
          });
        }
      }
    }
  }
  
  update() {
    this.time += 0.016;
    
    this.nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;
      node.pulse += 0.02;
      
      // Bounce off edges
      if (node.x < 0 || node.x > this.app.width) node.vx *= -1;
      if (node.y < 0 || node.y > this.app.height) node.vy *= -1;
      
      // Keep in bounds
      node.x = Math.max(0, Math.min(this.app.width, node.x));
      node.y = Math.max(0, Math.min(this.app.height, node.y));
    });
    
    // Update connections periodically
    if (Math.floor(this.time * 2) % 2 === 0) {
      this.updateConnections();
    }
  }
  
  draw() {
    const ctx = this.app.ctx;
    
    // Draw connections
    this.connections.forEach(conn => {
      const opacity = (1 - conn.dist / conn.maxDist) * 0.2;
      ctx.strokeStyle = `rgba(255, 107, 53, ${opacity})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(conn.from.x, conn.from.y);
      ctx.lineTo(conn.to.x, conn.to.y);
      ctx.stroke();
    });
    
    // Draw nodes
    this.nodes.forEach(node => {
      const pulseSize = Math.sin(node.pulse) * 2;
      const size = node.radius + pulseSize;
      
      // Glow effect
      const gradient = ctx.createRadialGradient(
        node.x, node.y, 0,
        node.x, node.y, size * 3
      );
      gradient.addColorStop(0, 'rgba(255, 107, 53, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 107, 53, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, size * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Node core
      ctx.fillStyle = 'rgba(255, 107, 53, 0.8)';
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  
  destroy() {}
}

// ── Initialize on page load ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const page = document.querySelector('script[data-page]')?.dataset.page;
  if (page === 'about' || page === 'contact') {
    window.pageAnimations = new PageAnimations();
    
    // Listen for animation changes from CMS
    window.addEventListener('animationChanged', (e) => {
      if (window.pageAnimations) {
        window.pageAnimations.setAnimation(e.detail.type);
      }
    });
  }
});

// ── FAQ Toggle ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-item__question');
    if (question) {
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');
        
        // Close all other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('is-open');
          }
        });
        
        // Toggle current item
        item.classList.toggle('is-open', !isOpen);
      });
    }
  });
});

// ── Contact Form ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contactForm');
  if (!form) return;
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simple validation
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const subject = document.getElementById('contactSubject').value.trim();
    const message = document.getElementById('contactMessage').value.trim();
    
    if (!name || !email || !subject || !message) {
      alert('Por favor, completa todos los campos.');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Por favor, ingresa un email válido.');
      return;
    }
    
    // Simulate form submission
    form.classList.add('is-hidden');
    document.getElementById('contactSuccess').classList.remove('is-hidden');
    
    // Reset form after delay
    setTimeout(() => {
      form.reset();
      form.classList.remove('is-hidden');
      document.getElementById('contactSuccess').classList.add('is-hidden');
    }, 5000);
  });
});

// ── Stats Counter Animation ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const stats = document.querySelectorAll('.page-stat__number[data-count]');
  if (!stats.length) return;
  
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count);
    const duration = 2000;
    const start = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(target * easeOutQuart);
      
      el.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    };
    
    requestAnimationFrame(update);
  };
  
  // Intersection Observer for stats
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  stats.forEach(stat => observer.observe(stat));
});

export { PageAnimations };