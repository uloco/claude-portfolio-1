// Main entry point - initializes all modules

import { ParticleSystem } from './particles.js';
import { Router } from './router.js';
import { PageTransitions } from './transitions.js';
import { ThemeManager } from './theme.js';

class App {
  constructor() {
    // Initialize canvas particle system
    const canvas = document.getElementById('particles');
    this.particles = new ParticleSystem(canvas);

    // Initialize theme manager
    this.theme = new ThemeManager();

    // Initialize page transitions
    this.transitions = new PageTransitions(this.particles);

    // Initialize router
    this.router = new Router();

    // Handle route changes
    this.router.onRouteChange(({ from, to }) => {
      if (from === null) {
        // Initial load - just show the page
        const page = document.getElementById(`page-${to}`);
        if (page) page.classList.add('active');
        return;
      }

      if (from === to) return;

      // Determine transition type
      if (to === 'home') {
        // Going back to home - quick transition
        this.transitions.quickTransition(from, to);
      } else {
        // Going to a sub-page - full transition with particle text
        this.transitions.transition(from, to);
      }
    });
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
