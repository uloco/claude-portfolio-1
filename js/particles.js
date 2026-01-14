// Particle System with Canvas
// Handles floating particles and text morphing animations

export class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 150;
    this.isAnimatingToText = false;
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
      baseX: 0,
      baseY: 0,
      targetX: null,
      targetY: null,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3,
      // For Brownian motion
      noiseOffsetX: Math.random() * 1000,
      noiseOffsetY: Math.random() * 1000,
    };
  }

  // Simple noise function for organic movement
  noise(x) {
    const sin1 = Math.sin(x * 0.01) * 0.5;
    const sin2 = Math.sin(x * 0.02 + 1.3) * 0.3;
    const sin3 = Math.sin(x * 0.05 + 2.1) * 0.2;
    return sin1 + sin2 + sin3;
  }

  updateParticle(p, deltaTime) {
    if (this.isAnimatingToText && p.targetX !== null) {
      // GSAP handles the animation to target
      return;
    }

    // Brownian motion - gentle random movement
    p.noiseOffsetX += deltaTime * 0.001;
    p.noiseOffsetY += deltaTime * 0.001;

    // Add subtle noise-based acceleration
    p.vx += this.noise(p.noiseOffsetX) * 0.01;
    p.vy += this.noise(p.noiseOffsetY) * 0.01;

    // Damping to keep velocities small
    p.vx *= 0.99;
    p.vy *= 0.99;

    // Clamp velocity
    const maxVel = 0.5;
    p.vx = Math.max(-maxVel, Math.min(maxVel, p.vx));
    p.vy = Math.max(-maxVel, Math.min(maxVel, p.vy));

    // Update position
    p.x += p.vx;
    p.y += p.vy;

    // Wrap around edges
    if (p.x < -10) p.x = this.width + 10;
    if (p.x > this.width + 10) p.x = -10;
    if (p.y < -10) p.y = this.height + 10;
    if (p.y > this.height + 10) p.y = -10;
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Get current theme color
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
  getTextPositions(text, fontSize = 120) {
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');

    // Size the canvas to fit the text
    offCtx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    const metrics = offCtx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;

    offscreen.width = textWidth + 40;
    offscreen.height = textHeight + 40;

    // Draw text
    offCtx.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, sans-serif`;
    offCtx.fillStyle = 'white';
    offCtx.textBaseline = 'top';
    offCtx.fillText(text, 20, 20);

    // Sample pixels
    const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
    const positions = [];
    const gap = 4; // Sample every 4 pixels

    for (let y = 0; y < offscreen.height; y += gap) {
      for (let x = 0; x < offscreen.width; x += gap) {
        const i = (y * offscreen.width + x) * 4;
        if (imageData.data[i + 3] > 128) { // If pixel is visible
          positions.push({
            x: x - offscreen.width / 2,
            y: y - offscreen.height / 2
          });
        }
      }
    }

    return positions;
  }

  // Animate particles to form text
  animateToText(text, onComplete) {
    if (!text || this.isAnimatingToText) return;

    this.isAnimatingToText = true;
    const positions = this.getTextPositions(text);

    // Center position
    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Ensure we have enough particles
    while (this.particles.length < positions.length) {
      this.particles.push(this.createParticle());
    }

    // Assign targets to particles
    const timeline = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    // Animate particles to text positions
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (i < positions.length) {
        const target = positions[i];
        p.targetX = centerX + target.x;
        p.targetY = centerY + target.y;

        timeline.to(p, {
          x: p.targetX,
          y: p.targetY,
          duration: 0.8,
          ease: 'power2.out',
        }, 0);
      } else {
        // Extra particles fade and move to edges
        timeline.to(p, {
          opacity: 0.1,
          x: Math.random() > 0.5 ? -50 : this.width + 50,
          duration: 0.8,
          ease: 'power2.out',
        }, 0);
      }
    }

    return timeline;
  }

  // Disperse particles back to random floating
  disperseParticles(onComplete) {
    const timeline = gsap.timeline({
      onComplete: () => {
        this.isAnimatingToText = false;
        // Reset targets and restore opacity
        for (const p of this.particles) {
          p.targetX = null;
          p.targetY = null;
          p.vx = (Math.random() - 0.5) * 0.3;
          p.vy = (Math.random() - 0.5) * 0.3;
        }
        if (onComplete) onComplete();
      }
    });

    for (const p of this.particles) {
      const randomX = Math.random() * this.width;
      const randomY = Math.random() * this.height;

      timeline.to(p, {
        x: randomX,
        y: randomY,
        opacity: Math.random() * 0.5 + 0.3,
        duration: 0.6,
        ease: 'power2.inOut',
      }, 0);
    }

    return timeline;
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    window.removeEventListener('resize', this.resize);
  }
}
