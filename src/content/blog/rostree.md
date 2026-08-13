---
title: "rostree: exploring a graph instead of drawing a tree"
description: "A ROS 2 dependency graph is a DAG, not a tree. Expanding it path-by-path is exponential — here's the fix, and why it's fast."
date: 2026-08-09
tags: ["rostree", "ros2", "tooling", "graphs"]
---

Ask a ROS 2 workspace to print its dependency tree and, if it's any size at all, you get a wall of text that scrolls past your terminal history before you've read a line of it. I hit this enough times that I finally sat down and figured out why it was so slow, and it turns out the reason is structural, not just "big workspace, big output."

A ROS 2 dependency graph is a **DAG, not a tree**. Something like `rcutils` sits under almost every branch. If your tool walks and re-expands each path separately, that shared dependency gets redrawn every single time a new parent reaches it — which is exponential, not linear, and it gets ugly fast.

[rostree](https://github.com/guilyx/rostree) fixes the actual problem instead of hiding it behind a `--depth` flag. Every package expands **once**, at the point it's first seen, and every later reference to it collapses to a one-line pointer — `↩ see above` — the same way `cargo tree` prints `(*)` for something it's already shown you. On a 146-package workspace I tested against (122 installed, plus a 24-package source overlay), the no-depth-limit case went from 58,002 lines and just over 10 seconds, to 251 lines and about 0.2 seconds. Nothing's hidden — every edge is still there once — the output is just no longer redundant with itself.

## Three ways to look at it

The CLI (`rostree tree <pkg>`) is the quick one, but the TUI is what I actually use day to day:

<img src="/media/blog/rostree-tui.png" alt="rostree's terminal UI showing an expanded dependency tree with a detail panel on the right" />

And if I need to actually *show* someone a graph rather than read it, there's an HTML export that's fully self-contained — no CDN, no fonts, no network call of any kind:

```bash
rostree graph my_robot_bringup -f html --open
```

<video controls preload="none" poster="/media/rostree-poster.png">
  <source src="/media/rostree-promo.mp4" type="video/mp4" />
</video>

It never draws the whole graph at once, on purpose — a workspace drawn all at once is a hairball nobody opens twice. You're always looking at one package's neighbourhood: click to re-centre on it, hover to light up everything upstream and downstream and dim the rest, shift-click a second package to see the shortest paths between the two.

It's a small tool. But it's the kind of small tool that only works because I got the graph-theory framing right, not because I tried harder at the tree framing. [Docs and the live demo are here](https://guilyx.github.io/rostree) if you want to try it on your own workspace.
