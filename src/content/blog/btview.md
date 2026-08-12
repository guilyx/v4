---
title: "BTView: behavior trees you can actually review"
description: "A visual, bidirectionally-synced graph editor for BehaviorTree.CPP XML, built into VS Code and Cursor."
date: 2026-08-10
tags: ["btview", "behavior-trees", "vscode", "tooling"]
---

A behavior tree you can only read as XML is a behavior tree nobody reviews carefully. `<Fallback>` nested three deep inside `<Sequence>` nested inside `<Fallback>` is unambiguous to a parser and nearly unreadable to a human — which means the review either doesn't happen or happens by trusting the diff, not by understanding the tree. For mission-critical orchestration logic, that's the wrong trade.

[BTView](https://github.com/guilyx/btview-vscode-plugin) is a visual graph editor for BehaviorTree.CPP v3.8 and v4 trees, built directly into VS Code and Cursor rather than as a standalone app you have to context-switch into.

## What it actually does

- **Bidirectional XML sync** — edit the graph, the XML updates; edit the XML, the graph updates. Neither view is the "real" one you have to remember to regenerate from.
- **Tidy tree layout** — parents centered over children, subtrees read as units instead of a tangle of crossing edges.
- **A full keyboard workflow** — arrow-key tree navigation, search with match cycling, rename, copy/paste, undo/redo. `?` in the graph brings up the cheat sheet.
- **Node glyphs** for the composite types at a glance — `→` Sequence, `?` Fallback, `⇉` Parallel, `↻` Retry — so the shape of the tree is legible before you've read a single node name.
- **A validation panel** that jumps straight to the offending node instead of making you grep the XML for what the linter is complaining about.
- **Dual format support** — auto-detects BehaviorTree.CPP v3.8 vs v4, with an optional v3→v4 migration and a diff preview before it touches anything.

It's on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=rangonomics.btview) and, since Cursor uses Open VSX rather than Microsoft's marketplace, on [Open VSX](https://open-vsx.org/extension/rangonomics/btview) too — same extension, both places you'd actually be working.

Behavior trees are how a lot of planning logic ends up expressed once it leaves the whiteboard. If the tool for reading them back is worse than the tool for writing them, the tree rots quietly. BTView is the fix for that half of the loop.
