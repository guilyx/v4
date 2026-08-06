---
title: "Building v4: leaner, meaner, flockier"
description: "Why I rebuilt my portfolio from scratch with Astro, and why there's a flocking simulation on the homepage."
date: 2026-08-06
tags: ["meta", "astro", "design"]
---

Every few years I look at my portfolio, wince, and rebuild it. This is v4.

## The goals

Three things, in order:

- **Leaner.** The previous site carried more JavaScript than it needed. This one is statically generated with [Astro](https://astro.build) and ships close to zero JS — the only scripts are the flocking simulation, the scroll reveals, and the experience tabs. All vanilla, all tiny.
- **More designer, less template.** One accent color (signal amber), one display face ([Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)), mono labels, numbered sections. Inspiration credit where it's due: Brittany Chiang's [v4](https://v4.brittanychiang.com/) set the bar for this genre of developer portfolio.
- **Personal.** The hero background is a [boids](https://en.wikipedia.org/wiki/Boids) simulation — separation, alignment, cohesion, nothing else. I spend my days building decentralized autonomy for drone swarms, and boids is the eighty-line version of that idea. It felt right that the first thing you see on my site is a flock making decisions with no one in charge.

## The stack

- **Astro 5** — static output, content collections for this blog and the photos page, zero-JS islands by default.
- **Tailwind CSS 4** — design tokens live in one `@theme` block; the whole palette is eight colors.
- **Vanilla TypeScript** — the boids sim is ~150 lines of canvas code with no dependencies. It respects `prefers-reduced-motion` and pauses when the tab is hidden.

## What's next

Photos from Abu Dhabi and elsewhere, and maybe some longer write-ups on swarm autonomy — flocking at IROS was fun to present, and there's more where that came from.

Thanks for reading. The source is on [GitHub](https://github.com/guilyx/v4).
