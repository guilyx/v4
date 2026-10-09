/**
 * Swarm navigation — sense, plan, track:
 *
 *   1. the direct route crosses a no-fly zone
 *   2. A* expands over the costmap (zones as layers, inflated by a margin)
 *   3. a global plan is drawn around the zone
 *   4. the flock tracks a carrot a fixed distance ahead on that plan, while a
 *      safety barrier (CBF-style) pushes any vehicle off the zone boundary
 *
 * Physics runs on a fixed 60 Hz step so it behaves the same at any refresh
 * rate.
 */
import { type Palette, type Scene, clamp, fontFor, mono, rgba, text } from "./kit";

type Pt = { x: number; y: number };
interface Agent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  cbf: number;
}

const STEP = 1 / 60;

export default function swarm(ctx: CanvasRenderingContext2D, pal: Palette): Scene {
  let w = 0;
  let h = 0;
  let fs = 10;
  let narrow = false;
  let S: Pt = { x: 0, y: 0 };
  let G: Pt = { x: 0, y: 0 };
  let NFZ = { x0: 0, y0: 0, x1: 0, y1: 0 };
  let TASK = { x0: 0, y0: 0, x1: 0, y1: 0 };
  let MARGIN = 14;
  let pts: Pt[] = [];
  let cum: number[] = [];
  let LOOK = 100;
  let costmap: HTMLCanvasElement | null = null;
  let agents: Agent[] = [];

  let phase = 0;
  let pt = 0; // seconds in phase
  let drawn = 0;
  let proj = 0;
  let acc = 0;

  function resetAgents() {
    agents = [];
    for (let i = 0; i < 6; i++)
      agents.push({ x: S.x + (Math.random() - 0.5) * 22, y: S.y + (Math.random() - 0.5) * 22, vx: 0, vy: 0, cbf: 0 });
  }

  function resize(W: number, H: number) {
    w = W;
    h = H;
    fs = fontFor(w);
    narrow = w < 600;
    S = { x: 0.07 * w, y: 0.88 * h };
    G = { x: 0.93 * w, y: 0.13 * h };
    NFZ = { x0: 0.34 * w, y0: 0.28 * h, x1: 0.66 * w, y1: 0.7 * h };
    TASK = { x0: 0.74 * w, y0: 0.05 * h, x1: 0.98 * w, y1: 0.28 * h };
    MARGIN = Math.max(14, Math.min(w, h) * 0.055);

    const wp: Pt[] = [
      S,
      { x: 0.24 * w, y: 0.9 * h },
      { x: 0.46 * w, y: 0.85 * h },
      { x: 0.66 * w, y: 0.8 * h },
      { x: 0.76 * w, y: 0.62 * h },
      { x: 0.79 * w, y: 0.4 * h },
      { x: 0.86 * w, y: 0.24 * h },
      G,
    ];
    const cr = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, u: number): Pt => {
      const u2 = u * u;
      const u3 = u2 * u;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) };
    };
    pts = [];
    for (let i = 0; i < wp.length - 1; i++) {
      const p0 = wp[Math.max(0, i - 1)];
      const p3 = wp[Math.min(wp.length - 1, i + 2)];
      for (let u = 0; u < 1; u += 0.045) pts.push(cr(p0, wp[i], wp[i + 1], p3, u));
    }
    pts.push(G);
    cum = [0];
    for (let i = 1; i < pts.length; i++) cum[i] = cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    LOOK = Math.min(w, h) * 0.24;

    bake();
    phase = 0;
    pt = 0;
    drawn = 0;
    resetAgents();
  }

  /** The costmap never changes, so it's painted once per size. */
  function bake() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    costmap = document.createElement("canvas");
    costmap.width = Math.max(1, Math.round(w * dpr));
    costmap.height = Math.max(1, Math.round(h * dpr));
    const c = costmap.getContext("2d")!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cs = narrow ? 10 : 12;
    for (let x = 0; x < w; x += cs) {
      for (let y = 0; y < h; y += cs) {
        const px = x + cs / 2;
        const py = y + cs / 2;
        let v = 0.04;
        if (px > TASK.x0 && px < TASK.x1 && py > TASK.y0 && py < TASK.y1) v = 0.16;
        const inN = px > NFZ.x0 && px < NFZ.x1 && py > NFZ.y0 && py < NFZ.y1;
        if (inN) v = 1;
        else {
          const d = Math.hypot(Math.max(NFZ.x0 - px, 0, px - NFZ.x1), Math.max(NFZ.y0 - py, 0, py - NFZ.y1));
          if (d < MARGIN * 1.7) v = Math.max(v, 0.78 * (1 - d / (MARGIN * 1.7)));
        }
        if (v <= 0.045) continue;
        c.fillStyle = v < 0.5 ? rgba(pal.accent, 0.03 + v * 0.3) : rgba(pal.fail, 0.06 + ((v - 0.5) / 0.5) * 0.24);
        c.fillRect(x + 0.5, y + 0.5, cs - 1, cs - 1);
      }
    }
    c.strokeStyle = rgba(pal.faint, 0.12);
    c.lineWidth = 1;
    for (let gx = 0; gx < w; gx += cs) {
      c.beginPath();
      c.moveTo(gx, 0);
      c.lineTo(gx, h);
      c.stroke();
    }
    for (let gy = 0; gy < h; gy += cs) {
      c.beginPath();
      c.moveTo(0, gy);
      c.lineTo(w, gy);
      c.stroke();
    }
  }

  const idxAtArc = (a: number) => {
    let hi = pts.length - 1;
    if (a <= 0) return 0;
    if (a >= cum[hi]) return hi;
    let lo = 0;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < a) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };

  function nfzPush(p: Pt) {
    const nx = clamp(p.x, NFZ.x0, NFZ.x1);
    const ny = clamp(p.y, NFZ.y0, NFZ.y1);
    const dx = p.x - nx;
    const dy = p.y - ny;
    const d = Math.hypot(dx, dy);
    if (p.x > NFZ.x0 && p.x < NFZ.x1 && p.y > NFZ.y0 && p.y < NFZ.y1) {
      const l = [p.x - NFZ.x0, NFZ.x1 - p.x, p.y - NFZ.y0, NFZ.y1 - p.y];
      const v = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ][l.indexOf(Math.min(...l))];
      return { d: 0, nx, ny, ux: v[0], uy: v[1], act: true };
    }
    if (d < 0.001) return { d: 0, nx, ny, ux: 0, uy: -1, act: true };
    return { d, nx, ny, ux: dx / d, uy: dy / d, act: d < MARGIN };
  }

  /** Advance the flock's projection onto the plan: nearest point to its
   *  centroid, searched a little behind and ahead so it never jumps back. */
  function project() {
    let cx = 0;
    let cy = 0;
    for (const a of agents) {
      cx += a.x;
      cy += a.y;
    }
    cx /= agents.length;
    cy /= agents.length;
    let best = proj;
    let bestD = Infinity;
    for (let o = -4; o <= 30; o++) {
      const i = Math.min(pts.length - 1, Math.max(0, proj + o));
      const d = (pts[i].x - cx) ** 2 + (pts[i].y - cy) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    proj = Math.max(proj, best);
  }

  /** One fixed physics step for the tracking phase. */
  function stepAgents(carrot: Pt) {
    for (let k = 0; k < agents.length; k++) {
      const a = agents[k];
      a.vx += (carrot.x - a.x) * 0.0055;
      a.vy += (carrot.y - a.y) * 0.0055;
      for (let m = 0; m < agents.length; m++) {
        if (m === k) continue;
        const sx = a.x - agents[m].x;
        const sy = a.y - agents[m].y;
        const sd = sx * sx + sy * sy;
        if (sd < 1100 && sd > 0.01) {
          a.vx += (sx / sd) * 4.2;
          a.vy += (sy / sd) * 4.2;
        }
      }
      const pu = nfzPush(a);
      a.cbf *= 0.88;
      if (pu.act) {
        const s = (MARGIN - pu.d) / MARGIN;
        a.vx += pu.ux * s * 2.4;
        a.vy += pu.uy * s * 2.4;
        a.cbf = Math.max(a.cbf, s);
      }
      const sp = Math.hypot(a.vx, a.vy);
      if (sp > 2.8) {
        a.vx = (a.vx / sp) * 2.8;
        a.vy = (a.vy / sp) * 2.8;
      }
      a.vx *= 0.965;
      a.vy *= 0.965;
      a.x += a.vx;
      a.y += a.vy;
    }
  }

  function update(dt: number) {
    pt += dt;
    if (phase === 0 && pt > 1.5) {
      phase = 1;
      pt = 0;
    } else if (phase === 1 && pt * Math.max(w, h) * 0.66 > Math.hypot(G.x - S.x, G.y - S.y) * 1.12) {
      phase = 2;
      pt = 0;
      drawn = 0;
    } else if (phase === 2) {
      drawn = Math.min(pts.length, (pt / 0.9) * pts.length);
      if (drawn >= pts.length) {
        phase = 3;
        pt = 0;
        proj = 0;
        resetAgents();
      }
    }
    if (phase === 3) {
      acc += dt;
      while (acc >= STEP) {
        acc -= STEP;
        project();
        stepAgents(pts[idxAtArc(cum[proj] + LOOK)]);
      }
      if (proj >= pts.length - 6 || pt > 14) {
        phase = 0;
        pt = 0;
        drawn = 0;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    if (costmap) ctx.drawImage(costmap, 0, 0, w, h);
    ctx.font = mono(fs * 0.9);

    ctx.strokeStyle = rgba(pal.fail, 0.95);
    ctx.lineWidth = 1.3;
    ctx.strokeRect(NFZ.x0, NFZ.y0, NFZ.x1 - NFZ.x0, NFZ.y1 - NFZ.y0);
    text(ctx, "NO-FLY ZONE", NFZ.x0 + 5, NFZ.y0 + fs, pal.fail);
    ctx.strokeStyle = rgba(pal.accent, 0.75);
    ctx.lineWidth = 1;
    ctx.strokeRect(TASK.x0, TASK.y0, TASK.x1 - TASK.x0, TASK.y1 - TASK.y0);
    text(ctx, "TASK ZONE", TASK.x0 + 5, TASK.y0 + fs, pal.accent);

    ctx.strokeStyle = pal.faint;
    ctx.beginPath();
    ctx.arc(S.x, S.y, 5, 0, Math.PI * 2);
    ctx.stroke();
    text(ctx, "start", S.x, S.y + fs * 1.3, pal.faint, "center");
    ctx.strokeStyle = pal.heading;
    ctx.beginPath();
    ctx.moveTo(G.x - 5, G.y);
    ctx.lineTo(G.x + 5, G.y);
    ctx.moveTo(G.x, G.y - 5);
    ctx.lineTo(G.x, G.y + 5);
    ctx.stroke();
    text(ctx, "goal", G.x - 9, G.y, pal.heading, "right");

    let caption = "";
    if (phase === 0) {
      ctx.save();
      ctx.strokeStyle = rgba(pal.fail, 0.6);
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(S.x, S.y);
      ctx.lineTo(G.x, G.y);
      ctx.stroke();
      ctx.restore();
      if (pt > 0.45) {
        const mx = (S.x + G.x) / 2;
        const my = (S.y + G.y) / 2;
        ctx.strokeStyle = pal.fail;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(mx - 6, my - 6);
        ctx.lineTo(mx + 6, my + 6);
        ctx.moveTo(mx + 6, my - 6);
        ctx.lineTo(mx - 6, my + 6);
        ctx.stroke();
        ctx.lineWidth = 1;
      }
      caption = "the direct route crosses the zone";
    }

    if (phase === 1) {
      const r = pt * Math.max(w, h) * 0.66;
      const cell = narrow ? 11 : 13;
      for (let gx = cell / 2; gx < w; gx += cell) {
        for (let gy = cell / 2; gy < h; gy += cell) {
          const dd = Math.hypot(gx - S.x, gy - S.y);
          if (dd > r) continue;
          if (gx > NFZ.x0 - MARGIN * 0.4 && gx < NFZ.x1 + MARGIN * 0.4 && gy > NFZ.y0 - MARGIN * 0.4 && gy < NFZ.y1 + MARGIN * 0.4)
            continue;
          const edge = 1 - Math.min(1, (r - dd) / (Math.max(w, h) * 0.22));
          ctx.fillStyle = rgba(pal.accent, 0.03 + edge * 0.22);
          ctx.fillRect(gx - cell / 2 + 1, gy - cell / 2 + 1, cell - 2, cell - 2);
        }
      }
      caption = "A* expanding over the costmap";
    }

    if (phase >= 2) {
      const n = phase === 2 ? Math.floor(drawn) : pts.length;
      ctx.save();
      ctx.strokeStyle = phase === 2 ? pal.accent : rgba(pal.accent, 0.55);
      ctx.lineWidth = phase === 2 ? 1.8 : 1.3;
      if (phase === 3) ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < n; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
      ctx.restore();
      if (phase === 2) caption = "global plan, routed around the zone";
    }

    if (phase === 3) {
      const li = proj;
      const lead = pts[li];
      const carrot = pts[idxAtArc(cum[li] + LOOK)];
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let j = 1; j <= li; j++) ctx.lineTo(pts[j].x, pts[j].y);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.save();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = rgba(pal.heading, 0.4);
      ctx.beginPath();
      ctx.moveTo(lead.x, lead.y);
      ctx.lineTo(carrot.x, carrot.y);
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = pal.heading;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(carrot.x, carrot.y, 5.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1;
      text(ctx, "carrot", carrot.x + 9, carrot.y, pal.heading);

      let barrier = false;
      agents.forEach((a, k) => {
        const pu = nfzPush(a);
        if (pu.act) {
          barrier = true;
          const s = (MARGIN - pu.d) / MARGIN;
          ctx.strokeStyle = rgba(pal.warn, 0.3 + s * 0.6);
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pu.nx, pu.ny, 9 + s * 7, 0, Math.PI * 2);
          ctx.stroke();
          ctx.lineWidth = 1;
          ctx.strokeStyle = rgba(pal.warn, 0.6);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(a.x + pu.ux * 14, a.y + pu.uy * 14);
          ctx.stroke();
        }
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(Math.atan2(a.vy, a.vx));
        ctx.fillStyle = a.cbf > 0.05 ? pal.warn : k === 0 ? pal.heading : pal.body;
        ctx.globalAlpha = k === 0 ? 1 : 0.85;
        ctx.beginPath();
        ctx.moveTo(7, 0);
        ctx.lineTo(-4.6, 3.5);
        ctx.lineTo(-2.4, 0);
        ctx.lineTo(-4.6, -3.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });
      caption = barrier ? "safety barrier holding the flock off the boundary" : "flock tracking the plan at a fixed horizon";
    }

    ctx.font = mono(fs);
    text(ctx, caption, fs, h - fs * 1.2, pal.body);
  }

  function frame(dt: number) {
    update(Math.min(dt, 0.1));
    draw();
  }

  return { resize, frame, poster: 7 };
}
