---
title: "Building v4: leaner, and searching in the open"
description: "Why I rebuilt my portfolio from scratch with Astro, and why there's a live A* search running behind the homepage."
date: 2026-08-06
tags: ["meta", "astro", "design"]
---

Every few years I look at my portfolio, wince, and rebuild it. This is v4.

## The goals

Three things, in order:

- **Leaner.** The previous site carried more JavaScript than it needed. This one is statically generated with [Astro](https://astro.build) and ships close to zero JS — the only scripts are the hero's search visualization, the scroll reveals, and the trajectory timeline. All vanilla, all tiny.
- **More designer, less template.** One accent color (a periwinkle called Ink & Iris), one display face ([Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk)), mono labels, a timeline instead of a tab list.
- **Personal.** The hero background is a live [A* search](https://en.wikipedia.org/wiki/A*_search_algorithm) over a random grid — walls, a frontier that expands node by node, and a route once one's found. It's the eighty-line version of the actual job: given a goal and a field of constraints, decide what happens next. It felt right that the first thing you see on my site is a planner thinking out loud.

## The stack

- **Astro 5** — static output, content collections for this blog and the photos page, zero-JS islands by default.
- **Tailwind CSS 4** — design tokens live in one `@theme` block; the whole palette is eight colors.
- **Vanilla TypeScript** — the search visualization is a plain A* implementation over a canvas grid, no dependencies. It respects `prefers-reduced-motion` and pauses when the tab is hidden.

## What's next

Photos from Abu Dhabi and elsewhere, and probably some longer write-ups on multi-agent planning and behavior trees — that's most of what I actually spend my time on.

Thanks for reading. The source is on [GitHub](https://github.com/guilyx/v4).
