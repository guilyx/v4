---
title: "A homemade Alexa, and the agents that will hack my house"
description: "A Raspberry Pi 4, a 10.1-inch touchscreen and a speakerphone, all here by 28 October: a homemade voice assistant with a screen, and the first step toward agents that reverse-engineer my IoT devices and build the integrations on their own."
date: 2026-10-19
tags: ["raspberry-pi", "voice", "agents", "iot", "clanker-labs"]
---

Every connected thing in my home came with its own app, and each app phones home to a cloud I didn't pick. An Alexa would tie them together, on Amazon's terms. I'd rather build the one place where they all meet myself, on hardware I own, which is the whole idea behind [Clanker Labs](https://clanker-labs.github.io/clanker-labs-public/): self-host your home, and let the agent run it.

So the first thing I'm building is the front door: a voice assistant with a screen, on a Raspberry Pi. The parts are ordered, and the last of them lands on 28 October. This is the plan, and the reason I think it's the start of something bigger than a smart speaker.

## The cart, arriving 28 October

Ordered on 19 October. Everything but the Pi lands on the 20th; the Pi itself arrives on the 28th. Still no soldering:

| Part | What it's for | Arrives |
|---|---|---|
| **[Raspberry Pi 4 starter kit, 4 GB](https://www.amazon.ae/dp/B0D1N3V2FF)** | The computer: board, 64 GB card, housing, heatsinks and a 15 W supply, from db-tronic | 28 Oct |
| **[GeeekPi 10.1″ touchscreen](https://www.amazon.ae/dp/B0DHVCT5DP)** | The face: 1280×800 IPS, capacitive touch, two speakers, and mount holes to carry the Pi on its back | 20 Oct |
| **[EMEET M1A speakerphone](https://www.amazon.ae/dp/B09WWYKP42)** | Ears and voice: 360° mics with noise reduction and echo cancellation, on one USB plug | 20 Oct |
| **[UGREEN micro-HDMI to HDMI cable](https://www.amazon.ae/dp/B0BXGJGQMB)** | The Pi 4 only has micro-HDMI out | 20 Oct |
| **[GeeekPi 27 W USB-C supply](https://www.amazon.ae/dp/B0CQ2DL2RW)** | Power with headroom; it's a Pi 5-grade supply | 20 Oct |
| **[GeeekPi copper heatsinks](https://www.amazon.ae/dp/B0CJDSGBL8)** | The Pi lives on the back of a screen, where there isn't much air | 20 Oct |

Assembly is a screwdriver job: heatsinks on the Pi, the Pi onto the screen's mount holes, micro-HDMI for the picture, a USB cable for touch, the speakerphone into another USB port, power in. That's the hardware.

4 GB is enough because only the cheap parts of the pipeline run on the Pi. And since the supply is already Pi 5-grade, if I ever want speech-to-text on the device too, the upgrade is just the board.

## The loop

<img src="/media/blog/pi-voice-loop.svg" alt="The voice loop: wake word and voice on the Pi, speech-to-text and Claude in the cloud, the answer on the screen" />

- **Wake word, on the Pi.** [openWakeWord](https://github.com/dscripka/openWakeWord) listening for "hey Claude". Nothing leaves the box until it fires.
- **Speech to text, in the cloud.** After the wake word, the audio goes out to a speech-to-text API.
- **The brain, in the cloud.** The text goes to Claude through the API, with the home's devices exposed as tools.
- **The voice, on the Pi.** [Piper](https://github.com/rhasspy/piper) speaks the answer locally.
- **The screen, on the Pi.** A Chromium kiosk page shows the answer and everything else.

The M1A does echo cancellation, and the assistant stops listening while it talks anyway, so it never hears itself.

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

The first thing the Pi will run is a homemade Alexa and an IoT dashboard in one place. The 10.1″ screen shows a tile per device, and voice and touch drive the same device graph underneath. Saying "hey Claude, movie time" and tapping a movie tile should do the same thing: lights down, AC to 23, TV on.

Every integration the agents produce lands in two places at once: a tile on the dashboard, and a tool the voice loop can call. One set of tools, three ways in: my voice, my finger, and the agents themselves.

## What's next

1. Put it together when the Pi lands on 28 October.
2. Get "hey Claude, what time is it?" working end to end, wake word to screen.
3. Point the first reverse-engineering agent at the first device and write up what happens, failures included.
