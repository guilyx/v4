---
title: "BTView: behavior trees you can actually review"
description: "A visual, bidirectionally-synced graph editor for BehaviorTree.CPP XML, built into VS Code and Cursor."
date: 2026-08-10
tags: ["btview", "behavior-trees", "vscode", "tooling"]
---

A behavior tree you can only read as XML is a behavior tree nobody reviews carefully. `<Fallback>` nested three deep inside a `<Sequence>` nested inside another `<Fallback>` is completely unambiguous to a parser and nearly unreadable to a person — which in practice means the review happens by trusting the diff, not by actually understanding what the tree does. For anything that's orchestrating a real mission, that's a trade I don't want to make.

<img src="/media/blog/btview-sketch.png" alt="A mockup showing the shape of BTView's graph editor: an XML panel on the left, a tidy tree layout on the right" />

*(that's a mockup I put together to show the shape of the thing — the repo doesn't ship any real screenshots yet, which is on my list)*

[BTView](https://github.com/guilyx/btview-vscode-plugin) is a visual graph editor for BehaviorTree.CPP v3.8 and v4 trees, and it lives directly inside VS Code and Cursor rather than being yet another app you have to alt-tab into.

## What it actually does

- **Bidirectional XML sync** — edit the graph, the XML updates; edit the XML, the graph updates. Neither view is the "real" one you have to remember to regenerate.
- **Tidy tree layout** — parents centered over their children, so a subtree reads as a unit instead of a pile of crossing lines.
- **A full keyboard workflow** — arrow-key navigation, search with match cycling, rename, copy/paste, undo/redo. There's a cheat sheet if you press `?`.
- **Node glyphs** for the composite types — `→` Sequence, `?` Fallback, `⇉` Parallel, `↻` Retry — so you can read the shape of a tree before you've parsed a single node name.
- **A validation panel** that jumps you straight to the offending node, instead of making you grep the XML for whatever the linter's complaining about.
- **Both formats** — it auto-detects v3.8 vs v4, and can migrate v3 to v4 with a diff preview so you're not just trusting it.

It's on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=rangonomics.btview), and since Cursor uses Open VSX rather than Microsoft's marketplace, it's there too: [Open VSX](https://open-vsx.org/extension/rangonomics/btview).

<img src="/media/blog/btview-icon.png" alt="BTView's extension icon" width="96" />

I built this mostly because I was tired of reviewing behavior trees by squinting at diffs. If the tool for reading a tree back is worse than the tool for writing it, the tree just rots quietly and nobody notices until it's wrong in production.
