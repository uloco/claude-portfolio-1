// Simple hash-based router

export class Router {
  constructor() {
    this.routes = {
      '/': 'home',
      '/thoughts': 'thoughts',
      '/projects': 'projects',
      '/about': 'about'
    };
    this.listeners = [];
    this.currentRoute = null;

    window.addEventListener('hashchange', () => this.handleRoute());
    window.addEventListener('load', () => this.handleRoute());
  }

  handleRoute() {
    const hash = window.location.hash || '#/';
    const path = hash.slice(1) || '/';
    const routeName = this.routes[path] || 'home';

    const previousRoute = this.currentRoute;
    this.currentRoute = routeName;

    // Notify listeners
    for (const listener of this.listeners) {
      listener({
        from: previousRoute,
        to: routeName,
        path: path
      });
    }
  }

  onRouteChange(callback) {
    this.listeners.push(callback);
  }

  navigate(path) {
    window.location.hash = path;
  }

  getCurrentPage() {
    return this.currentRoute;
  }
}
