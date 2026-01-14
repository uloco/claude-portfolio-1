# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development

This is a vanilla JS portfolio with no build step. To run locally:

```bash
npx serve .
```

Then open http://localhost:3000 in a browser.

## Architecture

Single-page application with hash-based routing. All pages exist in `index.html` as hidden sections that are shown/hidden via CSS classes.

**Key modules in `js/`:**

- `main.js` - Entry point, initializes all modules and wires up routing
- `particles.js` - Canvas-based particle system with Brownian motion and text morphing
- `router.js` - Hash-based router (`#/`, `#/thoughts`, etc.) with route change events
- `transitions.js` - GSAP page transitions coordinated with particle animations
- `theme.js` - Dark/light theme toggle with localStorage persistence

**Particle text morphing:** When navigating to a page, particles animate to form the page header text. Text positions are calculated by rendering to an offscreen canvas and sampling visible pixels.

**Theming:** Uses CSS variables (defined in `css/styles.css`) that switch based on `data-theme` attribute on `<html>`.
