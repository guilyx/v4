---
title: "Building v4: leaner, and a little livelier"
description: "Why I rebuilt my portfolio from scratch with Astro, and why there's a boids simulation running behind the homepage."
date: 2026-08-06
tags: ["meta", "astro", "design"]
---

Every couple of years I look at my portfolio, wince, and rebuild it. This is v4.

## Why bother, again

Honestly, the previous one wasn't broken. But it was carrying more JavaScript than it needed to, it didn't feel like *mine* so much as "a portfolio," and I'd learned enough since the last rebuild that I wanted to try something leaner. So: [Astro](https://astro.build), one accent color, one display face, and a rule I tried to actually stick to — if a section doesn't need JS, it doesn't get any.

The one indulgence is the hero background: a [boids](https://en.wikipedia.org/wiki/Boids) simulation, separation/alignment/cohesion, nothing fancier. No leader, no global state, just local rules that end up looking like something with intent. I like that it's honest about what it is if you read the source — it's not doing anything clever, it's just three rules and a few dozen triangles.

## The stack, if you care

- **Astro 5** for static output, with content collections for this blog and the photos page.
- **Tailwind CSS 4** — the whole palette lives in one `@theme` block, eight colors total.
- **Vanilla TypeScript** for the interactive bits (the boids sim, scroll reveals, the trajectory timeline). No framework, no animation library. The boids code is maybe 150 lines and respects `prefers-reduced-motion`.

## What's next

More photos, probably, and some longer posts on multi-agent planning and behavior trees — that's most of what I actually spend my days on, and I keep meaning to write it down.

Source's on [GitHub](https://github.com/guilyx/v4) if you want to poke at it.
