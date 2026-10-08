# Reject the Null
Ishan Sharma's portfolio: a static, no-build site animated with anime.js.

**Live:** https://alfredbateman.github.io/reject-the-null/

- `css/` – design tokens, base, intro, section and no-JS styles
- `js/` – ES modules: content, rendering, motion, intro, diagrams, UI, GitHub widget
- `assets/` – favicon, OG image, vendored `anime.min.js`
- `data/` – `github.json`, generated GitHub contribution data
- `scripts/` – `fetch-github.mjs`, writes `data/github.json`
- `.github/workflows/pages.yml` – deploys to GitHub Pages

**Data refresh:** the workflow runs daily (03:17 UTC), on push to `main`, and manually; it re-fetches GitHub data before each deploy.

**Local preview:** `python3 -m http.server 8000`
