// Particle System with Canvas
// Handles floating particles and text morphing animations

export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 600; // More particles for readable text
    this.isAnimatingToText = false;
    this.isBreathing = false;
    this.animationFrame = null;

    this.resize();
    this.init();
    this.animate();

    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  init() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push(this.createParticle());
    }
  }

  createParticle(x, y) {
    return {
      x: x ?? Math.random() * this.width,
      y: y ?? Math.random() * this.height,
      targetX: null,
      targetY: null,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      noiseOffsetX: Math.random() * 1000,
      noiseOffsetY: Math.random() * 1000,
    };
  }

  noise(x) {
    const sin1 = Math.sin(x * 0.01) * 0.5;
    const sin2 = Math.sin(x * 0.02 + 1.3) * 0.3;
    const sin3 = Math.sin(x * 0.05 + 2.1) * 0.2;
    return sin1 + sin2 + sin3;
  }

  updateParticle(p, deltaTime) {
    if (this.isAnimatingToText && p.targetX !== null) {
      return; // GSAP handles this
    }

    p.noiseOffsetX += deltaTime * 0.001;
    p.noiseOffsetY += deltaTime * 0.001;

    p.vx += this.noise(p.noiseOffsetX) * 0.01;
    p.vy += this.noise(p.noiseOffsetY) * 0.01;

    p.vx *= 0.99;
    p.vy *= 0.99;

    const maxVel = 0.5;
    p.vx = Math.max(-maxVel, Math.min(maxVel, p.vx));
    p.vy = Math.max(-maxVel, Math.min(maxVel, p.vy));

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -10) p.x = this.width + 10;
    if (p.x > this.width + 10) p.x = -10;
    if (p.y < -10) p.y = this.height + 10;
    if (p.y > this.height + 10) p.y = -10;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const style = getComputedStyle(document.documentElement);
    const particleColor = style.getPropertyValue('--particle-color').trim() || 'rgba(255, 255, 255, 0.6)';

    for (const p of this.particles) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particleColor.replace(/[\d.]+\)$/, `${p.opacity})`);
      this.ctx.fill();
    }
  }

  lastTime = 0;
  animate(currentTime = 0) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    for (const p of this.particles) {
      this.updateParticle(p, deltaTime);
    }

    this.draw();
    this.animationFrame = requestAnimationFrame((t) => this.animate(t));
  }

  // Get text pixel positions from offscreen canvas
  getTextPositions(text) {
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');

    // Responsive font size
    const fontSize = Math.min(this.width * 0.12, 100);

    offCtx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    const metrics = offCtx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize * 1.2;

    offscreen.width = Math.ceil(textWidth + 40);
    offscreen.height = Math.ceil(textHeight + 40);

    // Redraw with correct canvas size
    offCtx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    offCtx.fillStyle = 'white';
    offCtx.textBaseline = 'middle';
    offCtx.textAlign = 'center';
    offCtx.fillText(text, offscreen.width / 2, offscreen.height / 2);

    // Sample pixels - adjust gap based on particle count
    const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
    const positions = [];

    // First pass: count available positions with gap of 3
    let gap = 3;
    for (let y = 0; y < offscreen.height; y += gap) {
      for (let x = 0; x < offscreen.width; x += gap) {
        const i = (y * offscreen.width + x) * 4;
        if (imageData.data[i + 3] > 128) {
          positions.push({
            x: x - offscreen.width / 2,
            y: y - offscreen.height / 2
          });
        }
      }
    }

    return { positions, canvasWidth: offscreen.width, canvasHeight: offscreen.height };
  }

  // Animate particles to form text at a specific position
  animateToText(text, targetX, targetY) {
    if (!text || this.isAnimatingToText) return Promise.resolve();

    this.isAnimatingToText = true;
    const { positions } = this.getTextPositions(text);

    // Ensure we have enough particles
    while (this.particles.length < positions.length) {
      this.particles.push(this.createParticle(
        Math.random() * this.width,
        Math.random() * this.height
      ));
    }

    // Shuffle positions for more organic look
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    return new Promise((resolve) => {
      const timeline = gsap.timeline({
        onComplete: resolve
      });

      // Animate particles to form text
      for (let i = 0; i < this.particles.length; i++) {
        const p = this.particles[i];

        if (i < positions.length) {
          const target = positions[i];
          p.targetX = targetX + target.x;
          p.targetY = targetY + target.y;

          // Stagger slightly for wave effect
          const delay = Math.random() * 0.2;

          timeline.to(p, {
            x: p.targetX,
            y: p.targetY,
            size: 2,
            opacity: 0.9,
            duration: 1,
            ease: 'power3.out',
          }, delay);
        } else {
          // Extra particles drift to edges and fade
          timeline.to(p, {
            opacity: 0.1,
            duration: 0.8,
            ease: 'power2.out',
          }, 0);
        }
      }
    });
  }

  // Gentle breathing animation while holding text shape
  startBreathing() {
    this.isBreathing = true;

    for (const p of this.particles) {
      if (p.targetX !== null) {
        // Store the target position
        p.breatheBaseX = p.targetX;
        p.breatheBaseY = p.targetY;

        // Animate gentle floating around the target
        this.animateBreathing(p);
      }
    }
  }

  animateBreathing(p) {
    if (!this.isBreathing || p.targetX === null) return;

    const offsetX = (Math.random() - 0.5) * 6;
    const offsetY = (Math.random() - 0.5) * 6;

    gsap.to(p, {
      x: p.breatheBaseX + offsetX,
      y: p.breatheBaseY + offsetY,
      duration: 2 + Math.random() * 2,
      ease: 'sine.inOut',
      onComplete: () => this.animateBreathing(p)
    });
  }

  stopBreathing() {
    this.isBreathing = false;
    // Kill all breathing tweens
    for (const p of this.particles) {
      gsap.killTweensOf(p);
    }
  }

  // Disperse particles back to random floating
  disperseParticles() {
    this.stopBreathing();
    return new Promise((resolve) => {
      const timeline = gsap.timeline({
        onComplete: () => {
          this.isAnimatingToText = false;
          for (const p of this.particles) {
            p.targetX = null;
            p.targetY = null;
            p.vx = (Math.random() - 0.5) * 0.3;
            p.vy = (Math.random() - 0.5) * 0.3;
          }
          resolve();
        }
      });

      for (const p of this.particles) {
        const randomX = Math.random() * this.width;
        const randomY = Math.random() * this.height;

        timeline.to(p, {
          x: randomX,
          y: randomY,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.5 + 0.3,
          duration: 0.8,
          ease: 'power2.inOut',
        }, Math.random() * 0.2);
      }
    });
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    window.removeEventListener('resize', this.resize);
  }
}
