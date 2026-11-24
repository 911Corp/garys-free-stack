# Deployment

Nothing deploys automatically. Deploys are manual, on purpose: a stable version is prepared, reviewed, then launched.

## Local
```bash
npm install
npm run dev          # http://localhost:5173
npm test             # unit tests (engines, data, importer)
npm run build        # validate catalog + typecheck + build to dist/
npm run preview      # serve dist/
```

## GitHub Pages (recommended, $0)
1. Create the public repo `911Corp/garys-free-stack` and push.
2. Settings → Pages → Source: **GitHub Actions**.
3. Actions → **Deploy to GitHub Pages** → *Run workflow* (manual `workflow_dispatch` only).
4. Site: `https://911corp.github.io/garys-free-stack/`. Routing is hash based (`#/explore`), so no 404 tricks are needed, and `base: './'` keeps assets relative.

GitHub Pages terms forbid using it to run an online business. Free Stack is free and non-commercial; if paid features ever appear, move hosting first (Cloudflare Pages is the planned fallback).

## Single-file build
`npm run build:single` produces `dist-single/index.html` with everything inlined (handy for previews and offline review).
