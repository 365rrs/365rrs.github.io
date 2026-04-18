# Project Structure

```
/
├── index.html              # Root entry point — auto-redirects to cn/ or en/ based on browser language
├── 404.html                # Custom 404 page
├── CNAME                   # GitHub Pages custom domain config
│
├── index.html              # Main navigation page (Chinese)
├── about.html              # About page (Chinese)
│
└── assets/
    ├── css/
    │   ├── bootstrap.css
    │   ├── nav.css                  # Custom project styles (card widgets, hover effects)
    │   ├── xenon-core.css           # Xenon theme base
    │   ├── xenon-components.css
    │   ├── xenon-skins.css
    │   ├── xenon-forms.css
    │   ├── xenon.css
    │   └── fonts/                   # Icon font families (fontawesome, linecons, elusive, meteocons, glyphicons)
    ├── js/
    │   ├── jquery-1.11.1.min.js
    │   ├── bootstrap.min.js
    │   ├── TweenMax.min.js
    │   ├── lozad.js                 # Lazy image loader
    │   ├── xenon-api.js
    │   ├── xenon-custom.js          # Xenon theme JS (sidebar, menus, widgets)
    │   ├── xenon-toggles.js
    │   ├── resizeable.js
    │   └── joinable.js
    └── images/
        ├── logos/                   # Site logo icons (120×120px PNG, ~239 files)
        ├── flags/                   # Language flag icons (flag-cn.png, flag-us.png)
        └── *.png / *.gif            # Branding, preview, QQ group images
```

## Conventions

- **Adding a new link card**: Copy an existing `.xe-widget.xe-conversations.box2` block in both `cn/index.html` and `en/index.html`. Update the `onclick` URL, `data-original-title`, logo `data-src`, name `<strong>`, and description `<p>`.
- **Logo images**: Place new site logos in `assets/images/logos/` at 120×120px PNG. Reference them with a relative path `../assets/images/logos/<name>.png` using `data-src` (not `src`) so lozad lazy-loads them.
- **Navigation categories**: Defined as `<li>` entries in `#main-menu` sidebar. Section anchors use `id` attributes on `<h4>` headings in the main content area, linked via `href="#SectionName"` with `class="smooth"`.
- **Bilingual parity**: Changes to `cn/index.html` should be mirrored in `en/index.html` and vice versa.
- **Asset paths**: Pages reference assets with `./assets/` relative paths.
- **Scripts load order**: jQuery first (in `<head>`), then Bootstrap, TweenMax, and Xenon scripts at the bottom of `<body>`, with `lozad.js` last.
