---
title: "A homemade Alexa, and the agents that will hack my house"
description: "Four parts, no soldering, about AED 1,200: a Raspberry Pi voice assistant with a screen, and the first step toward agents that reverse-engineer my IoT devices and build the integrations on their own."
date: 2026-10-19
tags: ["raspberry-pi", "voice", "agents", "iot", "clanker-labs"]
---

Every connected thing in my home came with its own app, and each app phones home to a cloud I didn't pick. An Alexa would tie them together, on Amazon's terms. I'd rather build the one place where they all meet myself, on hardware I own, which is the whole idea behind [Clanker Labs](https://clanker-labs.github.io/clanker-labs-public/): self-host your home, and let the agent run it.

So the first thing I'm building is the front door: a voice assistant with a screen, on a Raspberry Pi. The shopping list is written; the parts aren't on my desk yet. This is the plan, and the reason I think it's the start of something bigger than a smart speaker.

## The cart

Four things to buy, no soldering:

| Part | Why this one | AED, est. |
|---|---|---|
| **Raspberry Pi 5 starter kit, 4 GB** | Board, power supply, case with a fan, and a 64 GB card with Pi OS already on it | 450⁠–⁠600 |
| **Touch Display 2, 7″** | The official one: 720×1280, five-finger touch, powered by the Pi, so no extra plug | 300⁠–⁠400 |
| **KKSB stand and case** | Covers the Pi on the back and puts the screen on a ball joint, so it looks like a finished smart display | 150⁠–⁠250 |
| **EMEET M0 Plus speakerphone** | Four mics with 360° pickup and a speaker in one USB-C puck; shows up as a plain sound card | 150⁠–⁠250 |

That's roughly **AED 1,050–1,500** on Amazon.ae, and the stand is optional, which takes the floor to about AED 900. Pi kits on Amazon.ae cost well above list price, so a local reseller is probably cheaper for the first item.

Assembly is about fifteen minutes. Put a heatsink or the kit's fan on the Pi, screw it onto the back of the screen, plug in the ribbon cable and the two-wire power lead, close it in the case, plug in the speakerphone. That's the hardware.

4 GB is enough because only the cheap parts of the pipeline run on the Pi. The 8 GB board is the upgrade path if I ever want speech-to-text on the device too.

## The loop

<img src="/media/blog/pi-voice-loop.svg" alt="The voice loop: wake word and voice on the Pi, speech-to-text and Claude in the cloud, the answer on the screen" />

- **Wake word, on the Pi.** [openWakeWord](https://github.com/dscripka/openWakeWord) listening for "hey Claude". Nothing leaves the box until it fires.
- **Speech to text, in the cloud.** After the wake word, the audio goes out to a speech-to-text API.
- **The brain, in the cloud.** The text goes to Claude through the API, with the home's devices exposed as tools.
- **The voice, on the Pi.** [Piper](https://github.com/rhasspy/piper) speaks the answer locally.
- **The screen, on the Pi.** A Chromium kiosk page shows the answer and everything else.

The assistant stops listening while it talks, so a cheap puck without fancy echo cancellation is fine.

To be straight about the trade: once the wake word fires, my voice leaves the house, and the brain is a cloud model. That's the price of a 4 GB Pi and a working version soon. Everything that's cheap to do locally is local, and once LeHarness, the Clanker Labs piece that serves models on whatever hardware is in the box, runs one here, the dashed boxes can move inside one at a time.

## The real reason: agents that reverse-engineer things

The speaker is the boring part. The interesting part is what it talks to.

Making an IoT device do something its app doesn't allow has always meant a weekend: sniff the traffic, decompile the app, guess the protocol, publish an unofficial integration on a forum, and watch it break with the next firmware update. Most devices never get that weekend, so they stay locked to their app.

That weekend is turning into a task you can queue. Give an agent a device on your own network and a sandbox, and it can watch the traffic, read what the app sends, poke at the local endpoints, and write the protocol down. Call those **reverse-engineering agents**, REAs.

Then they keep going. The same agents can act as **SDEs**, software development engineers: write the integration, test it against the real device, open a pull request, and fix it when a firmware update breaks it. Devices stop being something a person hacks once and become something agents build and maintain on their own. The house turns into a codebase.

<img src="/media/blog/rea-to-sde.svg" alt="Reverse-engineering agents map a device, SDE agents build and maintain its integration, a review gate, and it lands as a tile and a voice tool" />

My job moves up a level: pick the targets, set the rules, review the diffs. I wrote [grip](https://github.com/guilyx/grip) because I don't think anyone should push code they can't explain, and that applies twice to a driver for a device in my home that an agent wrote.

A few rules hold from day one:

- **Only devices I own, on my own network.** This is about my house, not someone else's.
- **The agent proposes, rules actuate.** Anything that can lock a door, open a window or heat something gets a deterministic check and a physical confirmation, not a model's judgement.
- **Every integration is reviewed before it ships.** No exceptions for "it's only the vacuum".

## The first application: one screen

The first thing the Pi will run is a homemade Alexa and an IoT dashboard in one place. The 7″ screen shows a tile per device, and voice and touch drive the same device graph underneath. Saying "hey Claude, movie time" and tapping a movie tile should do the same thing: lights down, AC to 23, TV on.

Every integration the agents produce lands in two places at once: a tile on the dashboard, and a tool the voice loop can call. One set of tools, three ways in: my voice, my finger, and the agents themselves.

## What's next

1. Buy the four parts.
2. Get "hey Claude, what time is it?" working end to end, wake word to screen.
3. Point the first reverse-engineering agent at the first device and write up what happens, failures included.
