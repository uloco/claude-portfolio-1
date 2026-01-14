// Theme toggle with localStorage persistence

export class ThemeManager {
  constructor() {
    this.storageKey = 'portfolio-theme';
    this.button = document.getElementById('theme-toggle');

    // Initialize theme from storage or system preference
    this.initTheme();

    // Bind click handler
    this.button?.addEventListener('click', () => this.toggle());
  }

  initTheme() {
    const stored = localStorage.getItem(this.storageKey);

    if (stored) {
      this.setTheme(stored);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.storageKey, theme);
  }

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
  }

  getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }
}
