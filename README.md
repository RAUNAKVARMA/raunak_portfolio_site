# Raunak Varma — Portfolio

Single-page **React 18 + Vite + Tailwind CSS** portfolio with **Framer Motion** animations — *Neural Noir* aesthetic (dark editorial, cyan/teal accents).

Repository: [github.com/RAUNAKVARMA/raunak_portfolio_site](https://github.com/RAUNAKVARMA/raunak_portfolio_site)

## Stack

- React 18, Vite 8
- Tailwind CSS 3
- Framer Motion
- Three.js + React Three Fiber (optional WebGL nebula / starfield on desktop)
- react-icons, react-intersection-observer

## Scripts

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview production build
```

## Deploy on Vercel

Build output is `dist/` (`npm run build`).

### Option A — Vercel + Git (simplest)

1. [Vercel Dashboard](https://vercel.com) → **Add New** → **Project** → import [RAUNAKVARMA/raunak_portfolio_site](https://github.com/RAUNAKVARMA/raunak_portfolio_site).
2. Framework: **Vite** (auto-detected). Build: `npm run build`, output: `dist`.
3. Deploy. Every push to `main` builds automatically.

**If you use Option A only**, you do **not** need GitHub Actions — you can remove `.github/workflows/deploy-vercel.yml` to avoid **two** production deploys per push.

### Option B — GitHub Actions → Vercel (this repo’s workflow)

Use this if you want deploys driven from GitHub Actions.

1. Create a Vercel project (same import as above, or `npx vercel link` locally once).
2. **Token:** Vercel → [Account Settings → Tokens](https://vercel.com/account/tokens) → create token.
3. **Org & Project IDs:** Project → **Settings** → **General** → copy **Project ID** and **Team / Org ID** (under *Vercel Toolbar* or team settings).

Add these **GitHub repository secrets** (Repo → **Settings** → **Secrets and variables** → **Actions**):

| Secret              | Value                    |
|---------------------|--------------------------|
| `VERCEL_TOKEN`      | Personal token from Vercel |
| `VERCEL_ORG_ID`     | Team / Organization ID   |
| `VERCEL_PROJECT_ID` | Project ID               |

Workflow: `.github/workflows/deploy-vercel.yml` runs on push to `main` and on **workflow_dispatch** (manual run).

**Troubleshooting CI:** If the workflow fails with `No existing credentials` or `Error: No existing credentials found` / `--token=` empty, the GitHub secret **`VERCEL_TOKEN`** is missing or not saved. Add all three secrets and re-run the workflow. Do **not** paste the token in code—only in **GitHub → Settings → Secrets and variables → Actions**.

### Local CLI deploy

```bash
npm install
npx vercel login
npx vercel link          # once, links to your Vercel project
npm run deploy           # production
npm run deploy:preview   # preview deployment
```

`vercel.json` configures the Vite build and SPA fallback routing.

## License

© Raunak Varma
