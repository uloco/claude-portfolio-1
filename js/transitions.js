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

    // Get content elements
    const fromContent = fromEl?.querySelector('.page-content');
    const toContent = toEl?.querySelector('.page-content');

    // Create master timeline
    const tl = gsap.timeline({
      onComplete: () => {
        this.isTransitioning = false;
      }
    });

    // Phase 1: Fade out current page content
    if (fromContent) {
      tl.to(fromContent, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in',
      });
    }

    // Phase 2: If there's a page title, morph particles to form it
    if (pageTitle) {
      tl.add(() => {
        return this.particles.animateToText(pageTitle);
      });

      // Hold the text formation briefly
      tl.add(() => {}, '+=0.5');

      // Phase 3: Disperse particles
      tl.add(() => {
        return this.particles.disperseParticles();
      });
    }

    // Phase 4: Switch pages and fade in new content
    tl.add(() => {
      if (fromEl) {
        fromEl.classList.remove('active');
      }
      if (toEl) {
        toEl.classList.add('active');
      }
    });

    if (toContent) {
      // Reset position for animation
      gsap.set(toContent, { opacity: 0, y: 20 });

      tl.to(toContent, {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      });
    }

    return tl;
  }

  // Quick transition without particle text (for going back home)
  async quickTransition(fromPage, toPage) {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const fromEl = document.getElementById(`page-${fromPage}`);
    const toEl = document.getElementById(`page-${toPage}`);

    const fromContent = fromEl?.querySelector('.page-content');
    const toContent = toEl?.querySelector('.page-content');

    const tl = gsap.timeline({
      onComplete: () => {
        this.isTransitioning = false;
      }
    });

    if (fromContent) {
      tl.to(fromContent, {
        opacity: 0,
        y: -20,
        duration: 0.25,
        ease: 'power2.in',
      });
    }

    tl.add(() => {
      if (fromEl) fromEl.classList.remove('active');
      if (toEl) toEl.classList.add('active');
    });

    if (toContent) {
      gsap.set(toContent, { opacity: 0, y: 20 });
      tl.to(toContent, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    return tl;
  }
}
