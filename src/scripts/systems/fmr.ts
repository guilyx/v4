/**
 * Agentic fault management and recovery, as a pipeline:
 *
 *   components report → one ordered event table → a local agent reads a
 *   window of it → a verdict (pattern, verdict, action) → actuators
 *
 * The agent proposes; the policy layer actuates, and the deterministic rules
 * stay underneath. Cycles through four cases, from noise to suppress to a
 * branch switch.
 */
import { type Palette, type Scene, box, clamp, easeOut, fontFor, lerp, mono, rgba, span, text } from "./kit";

type KindName =
  | "lifecycle.error"
  | "track.unsettled"
  | "bt.node_failed"
  | "proc.heartbeat"
  | "comms.lost"
  | "sensor.degraded";

const PRODUCERS = ["lifecycle nodes", "behavior tree", "supervisor", "sensors"];
const ACTUATORS = ["restart in dep. order", "switch BT branch", "degrade mode", "escalate"];

const KINDS: Record<KindName, { code: string; src: number; tone: "fail" | "warn" | "accent" }> = {
  "lifecycle.error": { code: "0x21", src: 0, tone: "fail" },
  "track.unsettled": { code: "0x42", src: 0, tone: "accent" },
  "bt.node_failed": { code: "0x14", src: 1, tone: "warn" },
  "proc.heartbeat": { code: "0x07", src: 2, tone: "fail" },
  "comms.lost": { code: "0x51", src: 2, tone: "warn" },
  "sensor.degraded": { code: "0x33", src: 3, tone: "warn" },
};
const BACKGROUND: KindName[] = ["bt.node_failed", "sensor.degraded", "comms.lost", "lifecycle.error"];

interface Case {
  inject: KindName[];
  pattern: string;
  verdict: string;
  tone: "ok" | "warn" | "fail";
  action: string;
  act: number[];
}
const CASES: Case[] = [
  {
    inject: ["comms.lost", "lifecycle.error", "lifecycle.error", "lifecycle.error"],
    pattern: "comms.lost → lifecycle.error ×3",
    verdict: "link flap, not a node fault",
    tone: "ok",
    action: "suppress 3 duplicates · keep watching",
    act: [],
  },
  {
    inject: ["track.unsettled", "lifecycle.error", "track.unsettled"],
    pattern: "tracker unsettled after a restart",
    verdict: "recurring, not transient",
    tone: "fail",
    action: "restart in dependency order · escalate",
    act: [0, 3],
  },
  {
    inject: ["proc.heartbeat"],
    pattern: "heartbeat gap 1.4 s, no error code",
    verdict: "died before it could report",
    tone: "fail",
    action: "supervisor restart · flag the recording",
    act: [0],
  },
  {
    inject: ["bt.node_failed", "sensor.degraded", "bt.node_failed", "bt.node_failed"],
    pattern: "GoToZone failed ×3 · gusting wind",
    verdict: "environmental, not a bug",
    tone: "warn",
    action: "switch to the degraded branch",
    act: [1, 2],
  },
];

const CYCLE = 7.6;
const P = { inject: 2.0, read: 3.3, verdict: 4.2, actuate: 5.7, clear: 7.0 };

interface Row {
  kind: KindName;
  slot: number;
  age: number;
}
interface Flight {
  kind: KindName;
  u: number;
}
interface Spark {
  to: number;
  u: number;
}

export default function fmr(ctx: CanvasRenderingContext2D, pal: Palette): Scene {
  let w = 0;
  let h = 0;
  let fs = 10;
  let narrow = false;
  let ct = 0; // time within the current case
  let ci = 0;
  let nextBg = 0.4;
  let injected = 0;
  let rows: Row[] = [];
  let flights: Flight[] = [];
  let sparks: Spark[] = [];
  const glowP = [0, 0, 0, 0];
  const glowA = [0, 0, 0, 0];
  const L = {
    prod: { x: 0, w: 0, ys: [] as number[] },
    table: { x: 0, y: 0, w: 0, h: 0, rowH: 20 },
    agent: { x: 0, y: 0, w: 0, h: 0 },
    card: { x: 0, y: 0, w: 0, h: 0 },
    act: { x: 0, w: 0, ys: [] as number[] },
    heads: 0,
    floor: 0,
  };
  const WINDOW = 4;
  const toneCol = (t: string) => (t === "fail" ? pal.fail : t === "warn" ? pal.warn : t === "ok" ? pal.ok : pal.accent);

  function resize(W: number, H: number) {
    w = W;
    h = H;
    fs = fontFor(w) * (W < 600 ? 0.92 : 1);
    narrow = w < 600;
    const bh = fs * 2.3;
    if (!narrow) {
      const ys = [0.22, 0.36, 0.5, 0.64].map((f) => f * h);
      L.prod = { x: w * 0.03, w: w * 0.16, ys };
      L.table = { x: w * 0.24, y: h * 0.15, w: w * 0.21, h: h * 0.62, rowH: fs * 2.7 };
      const rowH = fs * 2.7;
      const winMid = h * 0.15 + 2 + (WINDOW * rowH) / 2;
      L.agent = { x: w * 0.51, y: winMid - (bh * 1.15) / 2, w: w * 0.24, h: bh * 1.15 };
      L.card = { x: w * 0.51, y: L.agent.y + L.agent.h + fs * 3, w: w * 0.24, h: fs * 14 };
      L.act = { x: w * 0.8, w: w * 0.17, ys };
      L.heads = h * 0.07;
      L.floor = h * 0.88;
    } else {
      const ys = [0.15, 0.25, 0.35, 0.45].map((f) => f * h);
      L.prod = { x: w * 0.03, w: w * 0.27, ys };
      L.table = { x: w * 0.35, y: h * 0.1, w: w * 0.3, h: h * 0.42, rowH: fs * 2.6 };
      L.act = { x: w * 0.7, w: w * 0.27, ys };
      L.agent = { x: w * 0.35, y: h * 0.56, w: w * 0.3, h: bh * 1.1 };
      L.card = { x: w * 0.04, y: h * 0.67, w: w * 0.92, h: h * 0.25 };
      L.heads = h * 0.045;
      L.floor = h * 0.965;
    }
  }

  function emit(kind: KindName) {
    flights.push({ kind, u: 0 });
  }

  function update(dt: number) {
    ct += dt;
    if (ct >= CYCLE) {
      ct -= CYCLE;
      ci = (ci + 1) % CASES.length;
      injected = 0;
      nextBg = 0.3;
    }
    const c = CASES[ci];

    // background noise while the agent is only watching
    if (ct < P.inject || ct > P.clear) {
      nextBg -= dt;
      if (nextBg <= 0) {
        emit(BACKGROUND[Math.floor(Math.random() * BACKGROUND.length)]);
        nextBg = 0.55 + Math.random() * 0.7;
      }
    }
    // then the pattern this case is about
    while (injected < c.inject.length && ct >= P.inject + injected * 0.26) {
      emit(c.inject[injected]);
      injected++;
    }

    for (const f of flights) f.u += dt / 0.45;
    for (const f of flights.filter((f) => f.u >= 1)) {
      rows.unshift({ kind: f.kind, slot: -1, age: 0 });
      glowP[KINDS[f.kind].src] = 1;
    }
    flights = flights.filter((f) => f.u < 1);

    const maxRows = Math.floor(L.table.h / L.table.rowH) - 1;
    rows = rows.slice(0, maxRows + 1);
    rows.forEach((r, i) => {
      r.slot = lerp(r.slot, i, clamp(dt * 12));
      r.age += dt;
    });

    if (ct >= P.actuate && ct - dt < P.actuate) for (const a of c.act) sparks.push({ to: a, u: 0 });
    for (const s of sparks) s.u += dt / 0.5;
    for (const s of sparks.filter((s) => s.u >= 1)) glowA[s.to] = 1;
    sparks = sparks.filter((s) => s.u < 1);
    for (let i = 0; i < 4; i++) {
      glowP[i] = Math.max(0, glowP[i] - dt * 2.5);
      glowA[i] = Math.max(0, glowA[i] - dt * (ct > P.clear ? 3 : 0.35));
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    ctx.font = mono(fs);
    const c = CASES[ci];
    const bh = fs * 2.3;

    // column heads
    const head = (s: string, x: number) => text(ctx, s, x, L.heads, pal.faint);
    head("report", L.prod.x);
    head("one timeline", L.table.x);
    head("actuate", L.act.x);
    if (!narrow) head("read · decide", L.agent.x);

    // producers → table wires
    ctx.lineWidth = 1;
    L.prod.ys.forEach((y) => {
      ctx.strokeStyle = rgba(pal.faint, 0.35);
      ctx.beginPath();
      ctx.moveTo(L.prod.x + L.prod.w, y);
      ctx.lineTo(L.table.x, y);
      ctx.stroke();
    });
    PRODUCERS.forEach((p, i) => {
      const g = glowP[i];
      box(ctx, L.prod.x, L.prod.ys[i] - bh / 2, L.prod.w, bh, rgba(pal.accent, 0.06 + g * 0.2), rgba(pal.accent, 0.35 + g * 0.5));
      ctx.font = mono(fs * 0.9);
      text(ctx, p, L.prod.x + L.prod.w / 2, L.prod.ys[i], pal.body, "center");
      ctx.font = mono(fs);
    });

    // events in flight
    for (const f of flights) {
      const k = KINDS[f.kind];
      const y0 = L.prod.ys[k.src];
      const y1 = L.table.y + L.table.rowH * 0.5;
      const u = easeOut(f.u);
      ctx.fillStyle = toneCol(k.tone);
      ctx.beginPath();
      ctx.arc(lerp(L.prod.x + L.prod.w, L.table.x + fs, u), lerp(y0, y1, u), fs * 0.3, 0, Math.PI * 2);
      ctx.fill();
    }

    // the table
    const T = L.table;
    ctx.strokeStyle = rgba(pal.body, 0.4);
    ctx.lineWidth = 1;
    ctx.strokeRect(T.x, T.y, T.w, T.h);
    ctx.save();
    ctx.beginPath();
    ctx.rect(T.x, T.y, T.w, T.h);
    ctx.clip();
    rows.forEach((r) => {
      const k = KINDS[r.kind];
      const y = T.y + (r.slot + 0.5) * T.rowH;
      const a = clamp(r.age / 0.25);
      ctx.globalAlpha = a;
      ctx.fillStyle = toneCol(k.tone);
      ctx.beginPath();
      ctx.arc(T.x + fs * 0.9, y, fs * 0.28, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = mono(fs * 0.85);
      text(ctx, k.code, T.x + fs * 1.6, y, pal.faint);
      text(ctx, r.kind, T.x + fs * 4.6, y, pal.body);
      ctx.font = mono(fs);
      ctx.globalAlpha = 1;
    });
    ctx.restore();
    ctx.font = mono(fs * 0.8);
    text(ctx, "append-only", T.x + T.w / 2, T.y + T.h + fs * 1.1, pal.faint, "center");
    ctx.font = mono(fs);

    // the window the agent reads
    const reading = ct >= P.read && ct < P.clear;
    const wa = reading ? 0.9 : 0.4;
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = rgba(pal.accent, wa);
    ctx.fillStyle = rgba(pal.accent, reading ? 0.08 : 0.03);
    ctx.beginPath();
    ctx.rect(T.x - 3, T.y + 2, T.w + 6, WINDOW * T.rowH);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    ctx.font = mono(fs * 0.8);
    text(ctx, "window", T.x + T.w - fs * 0.4, T.y + WINDOW * T.rowH + fs * 0.9, rgba(pal.accent, wa), "right");
    ctx.font = mono(fs);
    if (ct >= P.read && ct < P.verdict) {
      const sy = T.y + 2 + ((ct - P.read) / (P.verdict - P.read)) * WINDOW * T.rowH;
      ctx.strokeStyle = rgba(pal.accent, 0.8);
      ctx.beginPath();
      ctx.moveTo(T.x, sy);
      ctx.lineTo(T.x + T.w, sy);
      ctx.stroke();
    }

    // window → agent
    const A = L.agent;
    ctx.strokeStyle = rgba(pal.accent, reading ? 0.6 : 0.25);
    ctx.beginPath();
    if (!narrow) {
      ctx.moveTo(T.x + T.w + 3, T.y + (WINDOW * T.rowH) / 2);
      ctx.lineTo(A.x - 2, T.y + (WINDOW * T.rowH) / 2);
    } else {
      ctx.moveTo(T.x + T.w / 2, T.y + T.h + fs * 1.8);
      ctx.lineTo(T.x + T.w / 2, A.y);
    }
    ctx.stroke();

    const busy = ct >= P.read && ct < P.verdict;
    const pulse = busy ? 0.25 + 0.2 * Math.abs(Math.sin(ct * 9)) : 0.08;
    box(ctx, A.x, A.y, A.w, A.h, rgba(pal.accent, pulse), rgba(pal.accent, busy ? 1 : 0.6), busy ? 1.5 : 1);
    text(ctx, busy ? "local agent · reading" : "local agent", A.x + A.w / 2, A.y + A.h / 2, pal.heading, "center");

    // the verdict
    const C = L.card;
    const show = ct >= P.verdict ? 1 - span(ct, P.clear, P.clear + 0.4) : 0;
    if (!narrow) {
      ctx.strokeStyle = rgba(pal.faint, 0.4);
      ctx.beginPath();
      ctx.moveTo(A.x + A.w / 2, A.y + A.h);
      ctx.lineTo(A.x + A.w / 2, C.y);
      ctx.stroke();
    }
    box(ctx, C.x, C.y, C.w, C.h, rgba(toneCol(c.tone), 0.05 * show), rgba(show > 0 ? toneCol(c.tone) : pal.faint, 0.25 + 0.45 * show));
    if (show === 0) {
      ctx.font = mono(fs * 0.85);
      text(ctx, "watching…", C.x + C.w / 2, C.y + C.h / 2, pal.faint, "center");
      ctx.font = mono(fs);
    }
    const fields: [string, string, string][] = [
      ["pattern", c.pattern, pal.body],
      ["verdict", c.verdict, toneCol(c.tone)],
      ["action", c.action, pal.warn],
    ];
    fields.forEach(([k, v, col], i) => {
      const a = show * span(ct, P.verdict + 0.15 + i * 0.45, P.verdict + 0.45 + i * 0.45);
      if (a <= 0) return;
      ctx.globalAlpha = a;
      ctx.font = mono(fs * 0.85);
      if (narrow) {
        const y = C.y + (C.h / 3.4) * (i + 0.75);
        text(ctx, k, C.x + fs * 0.8, y, pal.faint);
        text(ctx, v, C.x + fs * 6.2, y, col);
      } else {
        const y = C.y + fs * 1.6 + i * fs * 4;
        text(ctx, k, C.x + fs * 0.8, y, pal.faint);
        wrap(v, C.x + fs * 0.8, y + fs * 1.35, C.w - fs * 1.6, col);
      }
      ctx.font = mono(fs);
      ctx.globalAlpha = 1;
    });

    // verdict → actuators
    ACTUATORS.forEach((_, i) => {
      ctx.strokeStyle = rgba(pal.faint, 0.3);
      ctx.beginPath();
      const [sx, sy] = narrow ? [C.x + C.w * 0.8, C.y] : [C.x + C.w, C.y + C.h / 2];
      ctx.moveTo(sx, sy);
      ctx.lineTo(L.act.x, L.act.ys[i]);
      ctx.stroke();
    });
    for (const s of sparks) {
      const [sx, sy] = narrow ? [C.x + C.w * 0.8, C.y] : [C.x + C.w, C.y + C.h / 2];
      const u = easeOut(s.u);
      ctx.fillStyle = pal.warn;
      ctx.beginPath();
      ctx.arc(lerp(sx, L.act.x, u), lerp(sy, L.act.ys[s.to], u), fs * 0.32, 0, Math.PI * 2);
      ctx.fill();
    }
    ACTUATORS.forEach((a, i) => {
      const g = glowA[i];
      box(
        ctx,
        L.act.x,
        L.act.ys[i] - bh / 2,
        L.act.w,
        bh,
        rgba(pal.warn, 0.04 + g * 0.2),
        rgba(g > 0 ? pal.warn : pal.faint, 0.45 + g * 0.55),
        g > 0 ? 1.4 : 1,
      );
      ctx.font = mono(fs * 0.85);
      text(ctx, a, L.act.x + L.act.w / 2, L.act.ys[i], g > 0 ? pal.heading : pal.muted, "center");
      ctx.font = mono(fs);
    });

    // the deterministic floor
    const fx0 = narrow ? w * 0.04 : L.agent.x;
    ctx.strokeStyle = rgba(pal.warn, 0.35);
    ctx.beginPath();
    ctx.moveTo(fx0, L.floor - fs * 1.1);
    ctx.lineTo(w * 0.97, L.floor - fs * 1.1);
    ctx.stroke();
    ctx.font = mono(fs * 0.85);
    text(ctx, "rules engine · always underneath", fx0, L.floor, rgba(pal.warn, 0.8));
    ctx.font = mono(fs);
  }

  function wrap(s: string, x: number, y: number, maxW: number, col: string) {
    const words = s.split(" ");
    let line = "";
    let ly = y;
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxW && line) {
        text(ctx, line, x, ly, col);
        line = word;
        ly += fs * 1.25;
      } else line = next;
    }
    if (line) text(ctx, line, x, ly, col);
  }

  function frame(dt: number) {
    update(dt);
    draw();
  }

  // Seed the table so it never starts empty.
  for (let i = 0; i < 6; i++) rows.push({ kind: BACKGROUND[i % BACKGROUND.length], slot: i, age: 1 });

  return { resize, frame, poster: CYCLE + P.actuate + 0.7 };
}
