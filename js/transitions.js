// Page transitions with GSAP and particle morphing

export class PageTransitions {
  constructor(particleSystem) {
    this.particles = particleSystem;
    this.isTransitioning = false;
  }

  async transition(fromPage, toPage) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const fromEl = document.getElementById(`page-${fromPage}`);
    const toEl = document.getElementById(`page-${toPage}`);
    const pageTitle = toEl?.dataset.title || '';

    const fromContent = fromEl?.querySelector('.page-content');
    const toContent = toEl?.querySelector('.page-content');
    const toHeader = toEl?.querySelector('.page-header');
    const toBody = toEl?.querySelector('.page-body');

    // Phase 1: Fade out current page
    if (fromContent) {
      await gsap.to(fromContent, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in',
      });
    }

    // Hide current page, show new page (but content hidden)
    if (fromEl) fromEl.classList.remove('active');
    if (toEl) toEl.classList.add('active');

    // Hide the text header initially - particles will be the header
    if (toHeader) {
      gsap.set(toHeader, { opacity: 0 });
    }
    if (toBody) {
      gsap.set(toBody, { opacity: 0, y: 20 });
    }
    if (toContent) {
      gsap.set(toContent, { opacity: 1 }); // Container visible
    }

    // Phase 2: Form text with particles at header position
    if (pageTitle && toHeader) {
      // Wait a frame for layout to settle
      await new Promise(resolve => requestAnimationFrame(resolve));

      // Get actual header position
      const headerRect = toHeader.getBoundingClientRect();
      const targetX = headerRect.left + headerRect.width / 2;
      const targetY = headerRect.top + headerRect.height / 2;

      await this.particles.animateToText(pageTitle, targetX, targetY);

      // Particles stay as header - start gentle breathing animation
      this.particles.startBreathing();

      // Fade in the body content
      if (toBody) {
        await gsap.to(toBody, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
        });
      }

      // Keep text header hidden - particles ARE the header now
    } else {
      // No title - just fade in content
      if (toContent) {
        gsap.set(toContent, { opacity: 0, y: 20 });
        await gsap.to(toContent, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power2.out',
        });
      }
    }

    this.isTransitioning = false;
  }

  // Quick transition for going back home
  async quickTransition(fromPage, toPage) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const fromEl = document.getElementById(`page-${fromPage}`);
    const toEl = document.getElementById(`page-${toPage}`);

    const fromContent = fromEl?.querySelector('.page-content');
    const toContent = toEl?.querySelector('.page-content');

    // Disperse particles back to floating
    this.particles.disperseParticles();

    if (fromContent) {
      await gsap.to(fromContent, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in',
      });
    }

    if (fromEl) fromEl.classList.remove('active');
    if (toEl) toEl.classList.add('active');

    if (toContent) {
      gsap.set(toContent, { opacity: 0, y: 20 });
      await gsap.to(toContent, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    }

    this.isTransitioning = false;
  }
}
