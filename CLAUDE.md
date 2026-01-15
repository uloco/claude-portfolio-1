# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development

Vanilla JS portfolio with no build step. To run locally:

```bash
npx serve .
```

Then open http://localhost:3000 in a browser.

**Deployed at:** https://uloco.github.io/claude-portfolio-1/

## Architecture

Single-page application with hash-based routing. All pages exist in `index.html` as hidden sections shown/hidden via CSS classes.

### File Structure

```
index.html          # All page sections (Home, Thoughts, Projects, About)
css/styles.css      # Theming with CSS variables, responsive layout
js/
  main.js           # Entry point, wires up all modules
  particles.js      # Canvas particle system
  router.js         # Hash-based routing (#/, #/thoughts, etc.)
  transitions.js    # GSAP page transitions
  theme.js          # Dark/light toggle with localStorage
```

### Particle System (`js/particles.js`)

Two types of particles:
1. **Main particles (800)** - Form the page header text when navigating
2. **Background particles (150)** - Light gray, always floating, never form text

**Text formation flow:**
1. `getTextPositions(text)` - Renders text to offscreen canvas, samples pixels at 3px gap
2. `animateToText(text, x, y)` - GSAP animates main particles to sampled positions
3. `startBreathing()` - Particles gently oscillate around their positions
4. `disperseParticles()` - Called when navigating back, particles scatter

**Key properties:**
- `isAnimatingToText` - True while forming/holding text
- `isBreathing` - True while particles oscillate in text formation
- Particles with `targetX/targetY !== null` are controlled by GSAP, others use Brownian motion

### Page Transitions (`js/transitions.js`)

**Navigation to sub-page (Thoughts/Projects/About):**
1. Fade out current page content
2. Show new page (header hidden via CSS `visibility: hidden`)
3. Get header element position with `getBoundingClientRect()`
4. Particles form header text at that position
5. Start breathing animation
6. Fade in page body content
7. Text header stays hidden - particles ARE the header

**Navigation back to Home:**
1. Disperse particles (scatter back to floating)
2. Fade out page content
3. Show home page, fade in

### HTML Structure

Pages with headers have this structure:
```html
<section class="page" data-title="Thoughts">
  <div class="page-content">
    <h1 class="page-header">Thoughts</h1>  <!-- Hidden, particles form this -->
    <div class="page-body">
      <!-- Actual content -->
    </div>
  </div>
</section>
```

The `data-title` attribute is used to get the text for particle formation.

### Theming

CSS variables in `:root` and `[data-theme="light"]`:
- `--bg`, `--text`, `--particle-color`, `--card-bg`, `--card-border`, `--accent`

Background particles use hardcoded light opacity (0.3 dark / 0.25 light) separate from main particle color.

## Potential Improvements

- Add actual content to placeholder pages
- Add more page transition variations
- Mouse interaction with particles
- Performance optimization for mobile (reduce particle count)
- Add loading state for initial particle render
