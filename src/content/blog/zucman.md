---
title: "zucman: a data-viz kit for a tax policy argument"
description: "A sourced campaign kit — research, decks, social assets, and an interactive static site — built to make one statistic legible."
date: 2026-08-11
tags: ["dataviz", "side-project", "policy"]
---

Not everything I build is robotics. [zucman](https://github.com/guilyx/zucman) is a campaign kit built to explain a single number: France's 500 largest fortunes grew from **6% to 42% of GDP** between 1996 and 2024, while paying proportionally *less* tax than the median citizen — about 27% versus roughly 50%, per IPP's 2023 study. The kit exists to make that statistic — and the "2% floor" wealth-tax proposal associated with economist Gabriel Zucman that responds to it — legible to people who aren't going to read the underlying paper.

## What's in it

- **A sourced research dossier** — the numbers, cited, so every claim in every other asset traces back to something.
- **Slide decks**, in French and English.
- **Infographics**, including a static and animated version of the Saez–Zucman chart of effective tax rates by wealth bracket from 1950 to 2018 — the chart that made the argument go viral in the first place, rebuilt from source data rather than screenshotted.
- **A social kit** — a Twitter/X thread, an Instagram carousel, a Twitch stream overlay, and 30-second promo videos.
- **A static site** — [guilyx.github.io/zucman](https://guilyx.github.io/zucman/), one file, zero dependencies, GitHub Pages-hosted — with interactive year-by-year visualizations of the decline in top-end taxation across the West since 1980, a country-by-country comparison, and France's own trajectory.

Everything is mirrored in English (`-en` variants and `marketing/assets/en/`), since the source data and the argument aren't France-specific even though the immediate policy debate is.

## Why it's built the way it is

The visuals are **regenerable, not hand-drawn** — `tools/make_assets.py`, `tools/make_deck.js`, and `tools/make_promo_bracket_video.py` rebuild every chart, deck, and clip from the underlying data files. CI checks that the expected outputs actually exist after a regenerate, and the GitHub Pages site redeploys automatically on every push to `site/`. It's the same instinct as everything else here: don't hand-maintain an artifact that a script can derive correctly from a source of truth every time.
