# EduVerse publish guide

The deployment package is static. **Extract the complete ZIP** and publish `index.html`, the full `assets/2d/` directory, and `.nojekyll` together at the site root. `index.html` embeds the JavaScript, 3D engine, fonts and chapter data, but **the 2D images are separate files**. Publishing the HTML alone loses those images. See `README.md` for GitHub Pages setup, projector controls, commands, local testing, and deployment caveats.

The package also includes optional `review/` materials, Docker/nginx helpers and `_headers` for compatible hosts. GitHub Pages does not apply `_headers` or `nginx.conf`. Public hosting has not been performed by providing this package.

Current build: 266 runtime spreads have unapproved draft mappings, including nine proposed, curriculum-unverified generic-page topics. This is not a 288-concept completion count. Clickable labels exist on 201 of 274 images; the other 73 remain unlabeled. Scientific/teacher review, accessibility, full regression and real-device/cross-browser tests are pending. AI illustrations and schematic diagrams are not validated photographs or experiments. Class IX 8.6–8.8 replacements await user review.
