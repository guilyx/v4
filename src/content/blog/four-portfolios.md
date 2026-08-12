---
title: "Four portfolios"
description: "From a forked Bootstrap template to zero-dependency vanilla JS to React to Astro — what changed at each step, and why."
date: 2026-08-12
tags: ["meta", "portfolio", "history"]
---

This site is v4. Here's what came before it, because I think the history is more interesting than any single version on its own.

## v1 (2020) — not really mine, and that's fine

<img src="/media/blog/v1-screenshot.png" alt="Screenshot of the v1 portfolio: a Bootstrap sidebar template with a stock-photo avatar and an About section" />

I'll be upfront: [v1](https://github.com/guilyx/v1) is a fork of someone else's Bootstrap + jQuery template ([vinaysomawat/vinaysomawat.github.io](https://github.com/vinaysomawat/vinaysomawat.github.io)), not something I wrote from scratch. That's even a stock avatar up there, not me. Nine pages, six vendored libraries, 46 MB of GIFs. It did the one job a first portfolio actually needs to do — get something real in front of people — but it never felt like mine, and it was carrying the weight of a template built for somebody else's content.

## v2 — as small as I could make it

<img src="/media/blog/v2-screenshot.png" alt="Screenshot of the v2 portfolio: a minimal single-page site with a sidebar nav and a light theme" />

[v2](https://github.com/guilyx/v2) was the overcorrection. One `index.html`, one hand-written stylesheet, about 100 lines of vanilla JS for nav, scrollspy, project filters, and a theme toggle. No build step. No npm install. Open the HTML file in a browser and it just works; deploy by pushing. Total size dropped from 46 MB to about 40 KB. Its own README describes it as sitting deliberately between v1 and v3 — the minimal midpoint of the whole lineage — and I think that's fair. It's the version I'm proudest of in a "does exactly what it needs to and nothing else" sense, even if it's the least visually ambitious.

## v3 (2025) — the maximalist swing

<img src="/media/blog/v3-screenshot.png" alt="Screenshot of the v3 portfolio: a dark neon-pink theme with an illustrated avatar and animated hero" />

Then I went the other way entirely: React, Vite, Tailwind, framer-motion, d3, 30+ npm packages, a real build pipeline, 15 routes. It's got the most surface area of any version — animation, client-side routing, actual data visualization — and honestly it was fun to build, and it was the right call for what I wanted to show off at the time. But it's also the version with the most stuff that can quietly break.

## v4 (this site) — designed, not templated

Which brings me here. Astro, static output, close to zero shipped JS — the only scripts are the hero's flocking sim, the scroll reveals, and the trajectory timeline, all vanilla. One `@theme` block for the whole palette. If I had to describe the philosophy, it's v2's restraint applied with v3's level of visual intent — minimal dependencies, but I actually tried to make it look like something instead of just being small for its own sake.

| | v1 (2020) | v2 | v3 (2025) | v4 (this site) |
|---|---|---|---|---|
| Stack | Bootstrap + jQuery template | Plain HTML/CSS/JS | React + Vite + Tailwind + framer-motion + d3 | Astro + Tailwind |
| Build | none | none | `tsc && vite build` | `astro build` |
| Dependencies | 6 vendored libraries | 0 | 30+ npm packages | a handful |
| Assets | 46 MB of GIFs | ~40 KB total | optimised images | optimised images + a couple of real promo clips |

Four rebuilds, four different answers to "how much machinery does a portfolio actually need." I don't think there's a right answer — just whatever felt true at the time. Right now it's "not much, but make what's there count."
