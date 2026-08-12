---
title: "Four portfolios"
description: "From a forked Bootstrap template to zero-dependency vanilla JS to React to Astro — what changed at each step, and why."
date: 2026-08-12
tags: ["meta", "portfolio", "history"]
---

This site is v4. Here's what came before it, and what each rebuild was actually solving.

## v1 (2020) — a forked template

[v1](https://github.com/guilyx/v1) was built on top of a Bootstrap + jQuery portfolio template ([vinaysomawat/vinaysomawat.github.io](https://github.com/vinaysomawat/vinaysomawat.github.io)), not written from scratch. Nine pages, six vendored libraries, 46 MB of GIFs. It did the job a first portfolio needs to do — get something real in front of people — but it wasn't mine in any deep sense, and it carried the weight of a template built for a different person's content.

## v2 — one page, zero dependencies

[v2](https://github.com/guilyx/v2) went the other direction as far as it could go: one `index.html`, one hand-written `css/style.css`, about 100 lines of vanilla `js/main.js` for nav, scrollspy, project filters, and a theme toggle. No build step, no framework, no npm install — open the HTML file in a browser and it works, deploy by pushing. ~40 KB total, down from 46 MB. It shipped the "swarm mark" logo (three agents in formation) inlined directly in the HTML, because `currentColor` doesn't cross an `<img>` boundary and the mark needs to inherit the page's accent color. Dark by default, respects `prefers-color-scheme`, remembers the choice in `localStorage`, works with JavaScript disabled beyond the interactive extras. v2's own README describes itself as sitting deliberately between v1 and v3 — the minimal midpoint of the whole lineage.

## v3 (2025) — the maximalist swing

v3 went the other way again: React + Vite + Tailwind + framer-motion + d3, 30+ npm packages, 15 routes, a real build pipeline (`tsc && vite build`). It's the version with the most surface area — animation, routing, data visualization — and it was the right choice for what it needed to demonstrate at the time.

## v4 (this site) — designed, not templated

v4 is Astro: static output, close to zero shipped JS (the only scripts are the hero's flocking simulation, scroll reveals, and the trajectory timeline — all vanilla, no framework), one `@theme` token block for the whole palette. The content lineage is v2's philosophy — minimal dependencies, everything legible — applied with v3's level of visual intent.

| | v1 (2020) | v2 | v3 (2025) | v4 (this site) |
|---|---|---|---|---|
| Stack | Bootstrap + jQuery template | Plain HTML/CSS/JS | React + Vite + Tailwind + framer-motion + d3 | Astro + Tailwind |
| Build | none | none | `tsc && vite build` | `astro build` |
| Dependencies | 6 vendored libraries | 0 | 30+ npm packages | a handful |
| Assets | 46 MB of GIFs | ~40 KB total | optimised images | optimised images + a couple of real promo clips |

Four rebuilds, four different answers to "how much machinery does a portfolio actually need." The honest answer has moved around a lot; right now it's "not much, but make what's there count."
