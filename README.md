# elejeune.me — v4

The fourth iteration of my portfolio. Leaner, more designed, and topped with a
[boids](https://en.wikipedia.org/wiki/Boids) flocking simulation — a nod to the
drone swarms I build for a living.

Colour, mark and voice come from [guilyx/branding](https://github.com/guilyx/branding).
Layout logic owes a debt to Brittany Chiang's [v4](https://v4.brittanychiang.com/) — see
[differentiation.md](https://github.com/guilyx/branding/blob/master/research/differentiation.md).

## Stack

- **[Astro 5](https://astro.build)** — static output, ships ~0 JS by default
- **[Tailwind CSS 4](https://tailwindcss.com)** — design tokens in a single `@theme` block
- **Vanilla TypeScript** — flocking sim, scroll reveals, and the trajectory timeline; no framework, no animation library

## Structure

```
src/
├── data/site.ts          ← ALL content lives here (bio, jobs, projects, socials)
├── styles/global.css     ← design tokens + base styles
├── layouts/Base.astro    ← shell: meta, nav, side rails, footer, reveal script
├── components/           ← Hero (boids), About, Experience, Projects, Contact…
├── content/
│   ├── blog/             ← markdown posts
│   └── photos/           ← photo entries (image + frontmatter markdown)
└── pages/                ← /, /blog, /blog/[slug], /photos, /404, RSS
```

## Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Dev server at `localhost:4321`               |
| `npm run build`   | Production build to `./dist/`                |
| `npm run preview` | Preview the build locally                    |

## Editing content

Everything rendered on the homepage comes from **`src/data/site.ts`** — jobs,
projects, technologies, socials, copy. No component edits needed.

**Blog**: drop a markdown file in `src/content/blog/` with `title`,
`description`, and `date` frontmatter.

**Photos**: put an image plus a small `.md` file in `src/content/photos/`:

```md
---
title: "Dune lines"
location: "Liwa, UAE"
date: 2026-05-01
cover: ./dune-lines.jpg
---
```

## Deploying

Static output — anything works:

- **Vercel** (zero config): import the repo, done. Every push deploys.
- **GitHub Pages / Netlify / Cloudflare**: build command `npm run build`,
  output directory `dist`.

Update `site` in `astro.config.mjs` (and `src/data/site.ts` + `public/robots.txt`)
if the domain changes.
