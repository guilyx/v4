---
title: "rostree: exploring a graph instead of drawing a tree"
description: "A ROS 2 dependency graph is a DAG, not a tree. Expanding it path-by-path is exponential — here's the fix, and why it's fast."
date: 2026-08-09
tags: ["rostree", "ros2", "tooling", "graphs"]
---

Ask any ROS 2 workspace for its dependency tree and you'll get a wall of text. Ask a big one and you'll get a wall of text that takes ten seconds to produce and scrolls past your terminal history. The reason is structural, not a bug: a ROS 2 dependency graph is a **DAG, not a tree**. A package like `rcutils` sits under almost every branch, so a naive tool that walks and re-expands each path separately does exponential work — the same subtree gets redrawn every time a new parent reaches it.

[rostree](https://github.com/guilyx/rostree) fixes the actual problem instead of adding a `--depth` flag to hide it. Every package expands **once**, at the point it first appears, and every later reference to it becomes a one-line pointer — `↩ see above` — the way `cargo tree` prints `(*)` for a dependency it's already shown you. Discovery happens once per run instead of once per node; manifests parse once. On a 146-package workspace (122 installed plus a 24-package source overlay), the no-depth-limit case went from 58,002 lines and 10.29 seconds to 251 lines and 0.21 seconds. Nothing is hidden — every edge is still there once — the tree is just no longer redundant with itself.

## Three ways to look at it

- **CLI** — `rostree` for the interactive TUI, `rostree tree <pkg>` for a flat dump.
- **TUI** — browse the workspace, flip between dependencies/dependents/both, search.
- **Browser** — `rostree graph <pkg> -f html --open` renders a self-contained HTML file. No CDN, no fonts, no network call of any kind, so it survives being emailed, committed next to a design doc, or opened on a robot with no route out. It never draws the whole graph at once either — a workspace drawn all at once is a hairball nobody opens twice — so you're always looking at one package's neighbourhood: click to re-centre, hover to light up everything upstream/downstream and dim the rest, shift-click to pin a second package and list the shortest paths between the two.

It's a small tool, but it's the kind of small tool that only exists because the graph-theory framing was right and the tree framing wasn't. [Docs and the live HTML demo are here](https://guilyx.github.io/rostree).
