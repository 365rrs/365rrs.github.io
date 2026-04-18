# Tech Stack

## Overview
Pure static HTML/CSS/JS — no build system, no package manager, no compilation step.

## Frameworks & Libraries
- **Bootstrap 3** (`assets/css/bootstrap.css`, `assets/js/bootstrap.min.js`) — grid, components
- **jQuery 1.11.1** (`assets/js/jquery-1.11.1.min.js`) — DOM manipulation, event handling
- **TweenMax / TweenLite** (`assets/js/TweenMax.min.js`) — animations (sidebar expand/collapse, scroll)
- **lozad.js** (`assets/js/lozad.js`) — lazy loading images via `data-src` + `class="lozad"`
- **Xenon theme** (`xenon-core.css`, `xenon-components.css`, `xenon-skins.css`, `xenon-api.js`, `xenon-toggles.js`, `xenon-custom.js`) — admin/dashboard UI theme providing sidebar, navbar, and widget components

## Icon Fonts
- Font Awesome (`assets/css/fonts/fontawesome/`)
- Linecons (`assets/css/fonts/linecons/`)
- Elusive Icons, Meteocons (also in `assets/css/fonts/`)

## Custom CSS
- `assets/css/nav.css` — project-specific overrides for the `.box2` card widget, hover lift effect, and text overflow utilities

## Deployment
- Static file hosting (GitHub Pages or equivalent)
- No build commands — edit HTML files directly and push

## Analytics / Ads
- Baidu Analytics and Google Analytics scripts are inline in the HTML pages
- Google AdSense is included via inline script
