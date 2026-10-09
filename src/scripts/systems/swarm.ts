/**
 * Swarm navigation, as one mission in four acts:
 *
 *   plan      the direct route crosses a no-fly zone; A* expands over the
 *             costmap and a global plan is routed around it
 *   transit   the flock holds a V formation behind a virtual leader on that
 *             plan; a safety barrier (CBF-style) pushes any vehicle off the
 *             zone's boundary; every comm link is drawn by signal strength
 *   cover     in the task zone the formation breaks into a Voronoi partition
 *             (Lloyd iterations), then each vehicle sweeps its own cell
 *   localize  one vehicle gets a contact and three take bearings on it; the
 *             fix tightens as the bearings agree
 *
 * Physics runs on a fixed 60 Hz step (velocities are px per step) so it
 * behaves the same at any refresh rate.
 */
import { type Palette, type Scene, clamp, fontFor, mono, rgba, text } from "./kit";

type Pt = { x: number; y: number };
type Poly = Pt[];
type N2 = [number, number];

interface Layout {
  S: N2;
  NFZ: [number, number, number, number];
  TASK: N2[];
  WP: N2[];
  target: N2;
}

/** Normalised layouts: one for a wide stage, one for a phone's tall one. */
const LAYOUTS: Record<"wide" | "tall", Layout> = {
  wide: {
    S: [0.06, 0.86],
    NFZ: [0.22, 0.3, 0.48, 0.7],
    TASK: [
      [0.6, 0.1],
      [0.9, 0.05],
      [0.97, 0.48],
      [0.86, 0.9],
      [0.58, 0.72],
    ],
    WP: [
      [0.06, 0.86],
      [0.2, 0.86],
      [0.36, 0.81],
      [0.54, 0.76],
      [0.66, 0.56],
    ],
    target: [0.86, 0.66],
  },
  tall: {
    S: [0.12, 0.94],
    NFZ: [0.08, 0.5, 0.6, 0.68],
    TASK: [
      [0.06, 0.1],
      [0.7, 0.06],
      [0.95, 0.2],
      [0.9, 0.42],
      [0.12, 0.4],
    ],
    WP: [
      [0.12, 0.94],
      [0.45, 0.92],
      [0.8, 0.82],
      [0.83, 0.6],
      [0.62, 0.3],
    ],
    target: [0.22, 0.22],
  },
};

/** V formation, in units of the slot spacing: x forward, y to the side. */
const SLOTS: N2[] = [
  [0, 0],
  [-1, -1],
  [-1, 1],
  [-2, -2],
  [-2, 2],
  [-2.6, 0],
];

const STEP = 1 / 60;
const PHASE = { route: 0, search: 1, plan: 2, transit: 3, spread: 4, sweep: 5, localize: 6, hold: 7 } as const;
const ACT = ["plan", "plan", "plan", "transit", "cover", "cover", "localize", "localize"];

interface Agent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  cbf: number;
  cell: Poly;
  path: Pt[];
  cum: number[];
  done: number;
}

// ---- geometry -------------------------------------------------------------

/** Keep the part of a convex polygon closer to `a` than to `b`. */
function clipCloser(poly: Poly, a: Pt, b: Pt): Poly {
  const nx = b.x - a.x;
  const ny = b.y - a.y;
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const f = (p: Pt) => (p.x - mx) * nx + (p.y - my) * ny;
  const out: Poly = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const fp = f(p);
    const fq = f(q);
    if (fp <= 0) out.push(p);
    if (fp <= 0 !== fq <= 0) {
      const t = fp / (fp - fq);
      out.push({ x: p.x + (q.x - p.x) * t, y: p.y + (q.y - p.y) * t });
    }
  }
  return out;
}

function centroid(poly: Poly): Pt {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const c = p.x * q.y - q.x * p.y;
    a += c;
    cx += (p.x + q.x) * c;
    cy += (p.y + q.y) * c;
  }
  if (Math.abs(a) < 1e-6) return poly[0] ?? { x: 0, y: 0 };
  return { x: cx / (3 * a), y: cy / (3 * a) };
}

/** Boustrophedon sweep of a convex cell, starting from the end nearest `from`. */
function lawnmower(poly: Poly, s: number, from: Pt): Pt[] {
  const ys = poly.map((p) => p.y);
  const rows: [number, number, number][] = [];
  for (let y = Math.min(...ys) + s / 2; y < Math.max(...ys) - s / 4; y += s) {
    const xs: number[] = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i];
      const b = poly[(i + 1) % poly.length];
      if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) xs.push(a.x + ((y - a.y) / (b.y - a.y)) * (b.x - a.x));
    }
    if (xs.length < 2) continue;
    const l = Math.min(...xs) + s * 0.4;
    const r = Math.max(...xs) - s * 0.4;
    if (r - l > 2) rows.push([y, l, r]);
  }
  if (!rows.length) return [from, centroid(poly)];
  const down = Math.abs(rows[0][0] - from.y) <= Math.abs(rows[rows.length - 1][0] - from.y);
  const ordered = down ? rows : rows.reverse();
  const pts: Pt[] = [from];
  let leftFirst = Math.abs(ordered[0][1] - from.x) < Math.abs(ordered[0][2] - from.x);
  for (const [y, l, r] of ordered) {
    if (leftFirst) pts.push({ x: l, y }, { x: r, y });
    else pts.push({ x: r, y }, { x: l, y });
    leftFirst = !leftFirst;
  }
  return pts;
}

function cumulative(pts: Pt[]) {
  const c = [0];
  for (let i = 1; i < pts.length; i++) c[i] = c[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  return c;
}

function along(pts: Pt[], cum: number[], d: number): { p: Pt; i: number; a: number } {
  if (d <= 0) return { p: pts[0], i: 0, a: 0 };
  const total = cum[cum.length - 1];
  if (d >= total) {
    const n = pts.length - 1;
    return { p: pts[n], i: n, a: Math.atan2(pts[n].y - pts[n - 1].y, pts[n].x - pts[n - 1].x) };
  }
  let i = 1;
  while (cum[i] < d) i++;
  const f = (d - cum[i - 1]) / (cum[i] - cum[i - 1] || 1);
  const a = pts[i - 1];
  const b = pts[i];
  return { p: { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }, i, a: Math.atan2(b.y - a.y, b.x - a.x) };
}

// ---- scene ----------------------------------------------------------------

export default function swarm(ctx: CanvasRenderingContext2D, pal: Palette): Scene {
  const CELL_COLS = [pal.accent, pal.ok, "#7cc4e8", "#c39bef", pal.warn, "#6fcfcf"];

  let w = 0;
  let h = 0;
  let fs = 10;
  let tall = false;
  let S: Pt = { x: 0, y: 0 };
  let NFZ = { x0: 0, y0: 0, x1: 0, y1: 0 };
  let TASK: Poly = [];
  let target: Pt = { x: 0, y: 0 };
  let MARGIN = 14;
  let plan: Pt[] = [];
  let planCum: number[] = [];
  let costmap: HTMLCanvasElement | null = null;
  let agents: Agent[] = [];
  // tuning that scales with the stage
  let spacing = 20;
  let leadSpeed = 2;
  let commR = 200;
  let sweepS = 20;
  let sweepSpeed = 3;
  let sensorR = 30;

  let phase: number = PHASE.route;
  let pt = 0; // seconds in phase
  let acc = 0;
  let leadS = 0;
  let leadA = 0;
  let fade = 0;
  let contact: { by: number[]; err: number[] } | null = null;

  const P = (n: N2): Pt => ({ x: n[0] * w, y: n[1] * h });

  function resize(W: number, H: number) {
    w = W;
    h = H;
    fs = fontFor(w);
    tall = h > w;
    const L = LAYOUTS[tall ? "tall" : "wide"];
    const m = Math.min(w, h);
    S = P(L.S);
    NFZ = { x0: L.NFZ[0] * w, y0: L.NFZ[1] * h, x1: L.NFZ[2] * w, y1: L.NFZ[3] * h };
    TASK = L.TASK.map(P);
    target = P(L.target);
    MARGIN = Math.max(12, m * 0.05);
    spacing = clamp(m * 0.045, 13, 26);
    leadSpeed = m * 0.0032;
    commR = m * 0.46;
    sweepS = clamp(m * 0.05, 12, 26);
    sweepSpeed = m * 0.0055;
    sensorR = Math.max(sweepS * 0.9, m * 0.05);
    buildPlan(L.WP.map(P));
    bake();
    restart();
  }

  function nfzNearest(p: Pt) {
    const nx = clamp(p.x, NFZ.x0, NFZ.x1);
    const ny = clamp(p.y, NFZ.y0, NFZ.y1);
    const inZone = p.x > NFZ.x0 && p.x < NFZ.x1 && p.y > NFZ.y0 && p.y < NFZ.y1;
    return { nx, ny, inZone, d: inZone ? 0 : Math.hypot(p.x - nx, p.y - ny) };
  }

  /** Catmull-Rom through the waypoints, then shoved clear of the zone and smoothed. */
  function buildPlan(wp: Pt[]) {
    const cr = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, u: number): Pt => {
      const u2 = u * u;
      const u3 = u2 * u;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
      return { x: f(p0.x, p1.x, p2.x, p3.x), y: f(p0.y, p1.y, p2.y, p3.y) };
    };
    let pts: Pt[] = [];
    for (let i = 0; i < wp.length - 1; i++) {
      const p0 = wp[Math.max(0, i - 1)];
      const p3 = wp[Math.min(wp.length - 1, i + 2)];
      for (let u = 0; u < 1; u += 0.05) pts.push(cr(p0, wp[i], wp[i + 1], p3, u));
    }
    pts.push(wp[wp.length - 1]);
    const clr = MARGIN * 1.6;
    const shove = (p: Pt) => {
      const n = nfzNearest(p);
      if (n.inZone || n.d < clr) {
        const dx = p.x - n.nx || 0.001;
        const dy = p.y - n.ny || 0.001;
        const d = Math.hypot(dx, dy);
        p.x = n.nx + (dx / d) * clr;
        p.y = n.ny + (dy / d) * clr;
      }
    };
    pts.forEach(shove);
    for (let pass = 0; pass < 6; pass++) {
      pts = pts.map((p, k) =>
        k === 0 || k === pts.length - 1
          ? p
          : { x: (pts[k - 1].x + p.x * 2 + pts[k + 1].x) / 4, y: (pts[k - 1].y + p.y * 2 + pts[k + 1].y) / 4 },
      );
      pts.forEach(shove);
    }
    plan = pts;
    planCum = cumulative(plan);
  }

  /** The costmap never changes, so it's painted once per size. */
  function bake() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    costmap = document.createElement("canvas");
    costmap.width = Math.max(1, Math.round(w * dpr));
    costmap.height = Math.max(1, Math.round(h * dpr));
    const c = costmap.getContext("2d")!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cs = tall ? 10 : 12;
    for (let x = 0; x < w; x += cs) {
      for (let y = 0; y < h; y += cs) {
        const n = nfzNearest({ x: x + cs / 2, y: y + cs / 2 });
        const v = n.inZone ? 1 : n.d < MARGIN * 1.7 ? 0.78 * (1 - n.d / (MARGIN * 1.7)) : 0;
        if (v <= 0.05) continue;
        c.fillStyle = v < 0.5 ? rgba(pal.accent, 0.03 + v * 0.28) : rgba(pal.fail, 0.06 + ((v - 0.5) / 0.5) * 0.22);
        c.fillRect(x + 0.5, y + 0.5, cs - 1, cs - 1);
      }
    }
    c.strokeStyle = rgba(pal.faint, 0.1);
    c.lineWidth = 1;
    c.beginPath();
    for (let gx = 0; gx < w; gx += cs) {
      c.moveTo(gx, 0);
      c.lineTo(gx, h);
    }
    for (let gy = 0; gy < h; gy += cs) {
      c.moveTo(0, gy);
      c.lineTo(w, gy);
    }
    c.stroke();
  }

  function restart() {
    phase = PHASE.route;
    pt = 0;
    acc = 0;
    leadS = 0;
    fade = 0;
    contact = null;
    leadA = Math.atan2(plan[1].y - plan[0].y, plan[1].x - plan[0].x);
    agents = SLOTS.map(() => ({
      x: S.x + (Math.random() - 0.5) * spacing * 2,
      y: S.y + (Math.random() - 0.5) * spacing * 2,
      vx: 0,
      vy: 0,
      cbf: 0,
      cell: [],
      path: [],
      cum: [0],
      done: 0,
    }));
  }

  const go = (p: number) => {
    phase = p;
    pt = 0;
  };

  function slotOf(k: number, lead: Pt): Pt {
    const [fx, fy] = SLOTS[k];
    const c = Math.cos(leadA);
    const s = Math.sin(leadA);
    return { x: lead.x + (fx * c - fy * s) * spacing, y: lead.y + (fx * s + fy * c) * spacing };
  }

  function voronoi(): Poly[] {
    return agents.map((a, i) => {
      let cell = TASK;
      agents.forEach((b, j) => {
        if (i !== j) cell = clipCloser(cell, a, b);
      });
      return cell;
    });
  }

  /** One fixed physics step. */
  function physics() {
    if (phase === PHASE.transit) {
      const lead = along(plan, planCum, leadS);
      leadA += Math.atan2(Math.sin(lead.a - leadA), Math.cos(lead.a - leadA)) * 0.08;
      let worst = 0;
      agents.forEach((a, k) => {
        const s = slotOf(k, lead.p);
        const ex = s.x - a.x;
        const ey = s.y - a.y;
        worst = Math.max(worst, Math.hypot(ex, ey));
        const vdx = Math.cos(leadA) * leadSpeed + ex * 0.05;
        const vdy = Math.sin(leadA) * leadSpeed + ey * 0.05;
        a.vx += (vdx - a.vx) * 0.14;
        a.vy += (vdy - a.vy) * 0.14;
        // the barrier: push off the zone when inside the margin
        const n = nfzNearest(a);
        a.cbf *= 0.9;
        if (n.inZone || n.d < MARGIN) {
          const str = n.inZone ? 1 : (MARGIN - n.d) / MARGIN;
          const dx = a.x - n.nx || 0.001;
          const dy = a.y - n.ny || 0.001;
          const d = Math.hypot(dx, dy);
          a.vx += (dx / d) * str * 1.3;
          a.vy += (dy / d) * str * 1.3;
          a.cbf = Math.max(a.cbf, str);
        }
      });
      separate(spacing * 0.75);
      move(leadSpeed * 1.9);
      // the leader waits for a formation that has fallen behind
      leadS += leadSpeed * clamp(1.25 - worst / (spacing * 2), 0.25, 1);
      if (leadS >= planCum[planCum.length - 1]) go(PHASE.spread);
    } else if (phase === PHASE.spread) {
      const cells = voronoi();
      agents.forEach((a, i) => {
        a.cell = cells[i];
        const c = centroid(cells[i]);
        a.vx += ((c.x - a.x) * 0.045 - a.vx) * 0.18;
        a.vy += ((c.y - a.y) * 0.045 - a.vy) * 0.18;
      });
      move(leadSpeed * 1.6);
    } else if (phase === PHASE.sweep) {
      agents.forEach((a) => {
        const total = a.cum[a.cum.length - 1];
        a.done = Math.min(total, a.done + sweepSpeed);
        const at = along(a.path, a.cum, a.done);
        a.vx = at.p.x - a.x;
        a.vy = at.p.y - a.y;
        a.x = at.p.x;
        a.y = at.p.y;
      });
      // let some of the sweep play before anything is found
      if (!contact && pt > 1.8) {
        const k = agents.findIndex((a) => Math.hypot(a.x - target.x, a.y - target.y) < sensorR);
        if (k >= 0) {
          const near = agents
            .map((a, i) => ({ i, d: i === k ? -1 : Math.hypot(a.x - target.x, a.y - target.y) }))
            .sort((p, q) => p.d - q.d)
            .slice(0, 3)
            .map((o) => o.i);
          contact = { by: near, err: near.map((_, j) => (j % 2 ? 1 : -1) * (0.09 + Math.random() * 0.06)) };
          go(PHASE.localize);
        }
      }
    } else if (phase === PHASE.localize || phase === PHASE.hold) {
      agents.forEach((a) => {
        a.vx *= 0.8;
        a.vy *= 0.8;
      });
    }
  }

  function separate(min: number) {
    for (let i = 0; i < agents.length; i++)
      for (let j = i + 1; j < agents.length; j++) {
        const a = agents[i];
        const b = agents[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < min * min && d2 > 0.01) {
          const f = 0.6 / Math.sqrt(d2);
          a.vx += dx * f * 0.1;
          a.vy += dy * f * 0.1;
          b.vx -= dx * f * 0.1;
          b.vy -= dy * f * 0.1;
        }
      }
  }

  function move(vmax: number) {
    for (const a of agents) {
      const sp = Math.hypot(a.vx, a.vy);
      if (sp > vmax) {
        a.vx = (a.vx / sp) * vmax;
        a.vy = (a.vy / sp) * vmax;
      }
      a.x += a.vx;
      a.y += a.vy;
    }
  }

  function update(dt: number) {
    pt += dt;
    if (phase === PHASE.route && pt > 1.3) go(PHASE.search);
    else if (phase === PHASE.search && pt * Math.max(w, h) * 0.7 > Math.hypot(plan.at(-1)!.x - S.x, plan.at(-1)!.y - S.y) * 1.15)
      go(PHASE.plan);
    else if (phase === PHASE.plan && pt > 0.8) go(PHASE.transit);
    else if (phase === PHASE.spread && pt > 2.4) {
      // freeze the partition and hand each vehicle a sweep of its own cell
      const cells = voronoi();
      agents.forEach((a, i) => {
        a.cell = cells[i];
        a.path = lawnmower(cells[i], sweepS, a);
        a.cum = cumulative(a.path);
        a.done = 0;
      });
      go(PHASE.sweep);
    } else if (phase === PHASE.sweep && pt > 8) go(PHASE.localize);
    else if (phase === PHASE.localize && pt > 3.4) go(PHASE.hold);
    else if (phase === PHASE.hold && pt > 1.1) {
      fade = clamp((pt - 1.1) / 0.5);
      if (fade >= 1) restart();
    }
    if (phase >= PHASE.transit) {
      acc += dt;
      while (acc >= STEP) {
        acc -= STEP;
        physics();
      }
    }
  }

  // ---- drawing --------------------------------------------------------------

  function draw() {
    ctx.clearRect(0, 0, w, h);
    if (costmap) ctx.drawImage(costmap, 0, 0, w, h);
    ctx.font = mono(fs * 0.85);
    ctx.lineWidth = 1;

    // zones
    ctx.strokeStyle = rgba(pal.fail, 0.9);
    ctx.strokeRect(NFZ.x0, NFZ.y0, NFZ.x1 - NFZ.x0, NFZ.y1 - NFZ.y0);
    text(ctx, "NO-FLY ZONE", NFZ.x0 + 5, NFZ.y0 + fs * 0.95, pal.fail);
    ctx.beginPath();
    TASK.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
    ctx.closePath();
    ctx.fillStyle = rgba(pal.accent, 0.05);
    ctx.fill();
    ctx.strokeStyle = rgba(pal.accent, 0.7);
    ctx.stroke();
    text(ctx, "TASK ZONE", TASK[0].x + 6, TASK[0].y + fs * 1.1, pal.accent);

    ctx.strokeStyle = pal.faint;
    ctx.beginPath();
    ctx.arc(S.x, S.y, 5, 0, Math.PI * 2);
    ctx.stroke();
    text(ctx, "start", S.x, S.y + fs * 1.3, pal.faint, "center");

    if (phase === PHASE.route) drawDirect();
    if (phase === PHASE.search) drawWavefront();
    if (phase >= PHASE.plan && phase <= PHASE.transit) drawPlan();
    if (phase >= PHASE.spread) drawCells();
    if (phase >= PHASE.transit) {
      drawLinks();
      if (phase === PHASE.transit) drawFormation();
      drawAgents();
    }
    if (contact) drawFix();

    drawChrome();
    if (fade > 0) {
      ctx.fillStyle = rgba(pal.raised, fade);
      ctx.fillRect(0, 0, w, h);
    }
  }

  function drawDirect() {
    const g = plan[plan.length - 1];
    ctx.save();
    ctx.strokeStyle = rgba(pal.fail, 0.6);
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(S.x, S.y);
    ctx.lineTo(g.x, g.y);
    ctx.stroke();
    ctx.restore();
    if (pt > 0.45) {
      // mark where it enters the zone
      let mx = (S.x + g.x) / 2;
      let my = (S.y + g.y) / 2;
      for (let u = 0; u <= 1; u += 0.01) {
        const x = S.x + (g.x - S.x) * u;
        const y = S.y + (g.y - S.y) * u;
        if (nfzNearest({ x, y }).inZone) {
          mx = x;
          my = y;
          break;
        }
      }
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
  }

  function drawWavefront() {
    const r = pt * Math.max(w, h) * 0.7;
    const cell = tall ? 11 : 13;
    for (let gx = cell / 2; gx < w; gx += cell) {
      for (let gy = cell / 2; gy < h; gy += cell) {
        const dd = Math.hypot(gx - S.x, gy - S.y);
        if (dd > r) continue;
        const n = nfzNearest({ x: gx, y: gy });
        if (n.inZone || n.d < MARGIN * 0.4) continue;
        const edge = 1 - Math.min(1, (r - dd) / (Math.max(w, h) * 0.22));
        ctx.fillStyle = rgba(pal.accent, 0.03 + edge * 0.2);
        ctx.fillRect(gx - cell / 2 + 1, gy - cell / 2 + 1, cell - 2, cell - 2);
      }
    }
  }

  function drawPlan() {
    const n = phase === PHASE.plan ? Math.floor(clamp(pt / 0.7) * plan.length) : plan.length;
    ctx.save();
    ctx.strokeStyle = phase === PHASE.plan ? pal.accent : rgba(pal.accent, 0.5);
    ctx.lineWidth = phase === PHASE.plan ? 1.8 : 1.2;
    if (phase === PHASE.transit) ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(plan[0].x, plan[0].y);
    for (let i = 1; i < n; i++) ctx.lineTo(plan[i].x, plan[i].y);
    ctx.stroke();
    ctx.restore();
    if (phase === PHASE.transit) {
      const lead = along(plan, planCum, leadS);
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(plan[0].x, plan[0].y);
      for (let i = 1; i < lead.i; i++) ctx.lineTo(plan[i].x, plan[i].y);
      ctx.lineTo(lead.p.x, lead.p.y);
      ctx.stroke();
      ctx.lineWidth = 1;
    }
  }

  function drawFormation() {
    const lead = along(plan, planCum, leadS).p;
    ctx.strokeStyle = rgba(pal.heading, 0.55);
    ctx.beginPath();
    ctx.arc(lead.x, lead.y, spacing * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    SLOTS.forEach((_, k) => {
      const s = slotOf(k, lead);
      ctx.fillStyle = rgba(pal.heading, 0.25);
      ctx.beginPath();
      ctx.arc(s.x, s.y, 1.6, 0, Math.PI * 2);
      ctx.fill();
    });
    // barrier activity
    agents.forEach((a) => {
      const n = nfzNearest(a);
      if (!(n.inZone || n.d < MARGIN)) return;
      const str = n.inZone ? 1 : (MARGIN - n.d) / MARGIN;
      ctx.strokeStyle = rgba(pal.warn, 0.3 + str * 0.6);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(n.nx, n.ny, 8 + str * 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.lineWidth = 1;
    });
  }

  function drawCells() {
    agents.forEach((a, i) => {
      if (a.cell.length < 3) return;
      const col = CELL_COLS[i % CELL_COLS.length];
      ctx.beginPath();
      a.cell.forEach((p, j) => (j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.closePath();
      ctx.fillStyle = rgba(col, 0.07);
      ctx.fill();
      ctx.strokeStyle = rgba(col, 0.45);
      ctx.stroke();
      if (phase === PHASE.spread) {
        const c = centroid(a.cell);
        ctx.strokeStyle = rgba(col, 0.8);
        ctx.beginPath();
        ctx.moveTo(c.x - 3, c.y - 3);
        ctx.lineTo(c.x + 3, c.y + 3);
        ctx.moveTo(c.x + 3, c.y - 3);
        ctx.lineTo(c.x - 3, c.y + 3);
        ctx.stroke();
      }
      // swept area only — not the leg flown to reach the first row
      if (a.path.length > 2 && a.done > a.cum[1]) {
        ctx.save();
        ctx.beginPath();
        a.cell.forEach((p, j) => (j ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
        ctx.closePath();
        ctx.clip();
        const at = along(a.path, a.cum, a.done);
        ctx.beginPath();
        ctx.moveTo(a.path[1].x, a.path[1].y);
        for (let k = 2; k < at.i; k++) ctx.lineTo(a.path[k].x, a.path[k].y);
        ctx.lineTo(at.p.x, at.p.y);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = rgba(col, 0.16);
        ctx.lineWidth = sweepS;
        ctx.stroke();
        ctx.strokeStyle = rgba(col, 0.45);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      }
      if (phase === PHASE.sweep) {
        ctx.strokeStyle = rgba(col, 0.25);
        ctx.beginPath();
        ctx.arc(a.x, a.y, sensorR, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }

  /** Every pair in range is a link, drawn by signal strength. */
  function links() {
    const out: { i: number; j: number; q: number }[] = [];
    for (let i = 0; i < agents.length; i++)
      for (let j = i + 1; j < agents.length; j++) {
        const d = Math.hypot(agents[i].x - agents[j].x, agents[i].y - agents[j].y);
        if (d < commR) out.push({ i, j, q: 1 - d / commR });
      }
    return out;
  }

  function drawLinks() {
    for (const l of links()) {
      const a = agents[l.i];
      const b = agents[l.j];
      const col = l.q > 0.5 ? pal.accent : l.q > 0.25 ? pal.warn : pal.fail;
      ctx.save();
      ctx.strokeStyle = rgba(col, 0.12 + l.q * 0.45);
      ctx.lineWidth = 0.6 + l.q * 1.2;
      if (l.q <= 0.25) ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawAgents() {
    agents.forEach((a, k) => {
      const heading = Math.hypot(a.vx, a.vy) > 0.05 ? Math.atan2(a.vy, a.vx) : leadA;
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(heading);
      ctx.fillStyle =
        a.cbf > 0.05 && phase === PHASE.transit
          ? pal.warn
          : phase >= PHASE.spread
            ? CELL_COLS[k % CELL_COLS.length]
            : k === 0
              ? pal.heading
              : pal.body;
      ctx.beginPath();
      ctx.moveTo(7, 0);
      ctx.lineTo(-4.6, 3.5);
      ctx.lineTo(-2.4, 0);
      ctx.lineTo(-4.6, -3.5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });
  }

  function drawFix() {
    if (!contact) return;
    const t = phase === PHASE.localize ? pt : 3.4 + pt;
    const lines: { p: Pt; d: Pt }[] = [];
    contact.by.forEach((k, j) => {
      const a = agents[k];
      const appear = clamp((t - j * 0.35) / 0.3);
      if (appear <= 0) return;
      const base = Math.atan2(target.y - a.y, target.x - a.x);
      const ang = base + contact!.err[j] * Math.exp(-Math.max(0, t - j * 0.35) / 0.9);
      const d = { x: Math.cos(ang), y: Math.sin(ang) };
      lines.push({ p: a, d });
      const len = Math.hypot(target.x - a.x, target.y - a.y) + Math.min(w, h) * 0.12;
      ctx.strokeStyle = rgba(pal.warn, 0.75 * appear);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(a.x + d.x * len * appear, a.y + d.y * len * appear);
      ctx.stroke();
    });

    // the contact itself
    const pulse = 0.5 + 0.5 * Math.sin(t * 6);
    ctx.save();
    ctx.translate(target.x, target.y);
    ctx.rotate(Math.PI / 4);
    ctx.strokeStyle = rgba(pal.fail, 0.6 + 0.4 * pulse);
    ctx.lineWidth = 1.4;
    ctx.strokeRect(-4, -4, 8, 8);
    ctx.restore();
    ctx.lineWidth = 1;

    if (lines.length >= 2) {
      // least-squares intersection of the bearing lines
      let a11 = 0;
      let a12 = 0;
      let a22 = 0;
      let b1 = 0;
      let b2 = 0;
      for (const l of lines) {
        const nx = -l.d.y;
        const ny = l.d.x;
        const c = nx * l.p.x + ny * l.p.y;
        a11 += nx * nx;
        a12 += nx * ny;
        a22 += ny * ny;
        b1 += nx * c;
        b2 += ny * c;
      }
      const det = a11 * a22 - a12 * a12;
      if (Math.abs(det) > 1e-6) {
        const fx = (a22 * b1 - a12 * b2) / det;
        const fy = (a11 * b2 - a12 * b1) / det;
        const r = 4 + Math.min(w, h) * 0.09 * Math.exp(-t / 0.9) * (lines.length === 2 ? 1.6 : 1);
        ctx.strokeStyle = rgba(pal.heading, 0.85);
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.ellipse(fx, fy, r * 1.35, r, 0.4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = mono(fs * 0.85);
        const right = fx < w * 0.75;
        text(ctx, `fix ±${Math.max(2, Math.round(r * 0.9))} m`, fx + (right ? 1 : -1) * (r * 1.35 + 6), fy, pal.heading, right ? "left" : "right");
      }
    }
  }

  function drawChrome() {
    // which act we're in
    ctx.font = mono(fs * 0.85);
    let x = fs;
    const y = fs * 1.4;
    const acts = ["plan", "transit", "cover", "localize"];
    acts.forEach((name, i) => {
      const on = ACT[phase] === name;
      text(ctx, name, x, y, on ? pal.heading : pal.faint);
      const wd = ctx.measureText(name).width;
      if (on) {
        ctx.fillStyle = pal.accent;
        ctx.fillRect(x, y + fs * 0.7, wd, 1.5);
      }
      x += wd + fs * 0.7;
      if (i < acts.length - 1) {
        text(ctx, "›", x, y, pal.faint);
        x += fs * 1.2;
      }
    });

    // the mesh, once there is one
    if (phase >= PHASE.transit) {
      const ls = links();
      const seen = new Set([0]);
      const queue = [0];
      while (queue.length) {
        const i = queue.shift()!;
        for (const l of ls) {
          const j = l.i === i ? l.j : l.j === i ? l.i : -1;
          if (j >= 0 && !seen.has(j)) {
            seen.add(j);
            queue.push(j);
          }
        }
      }
      const weakest = ls.length ? Math.min(...ls.map((l) => l.q)) : 0;
      const ok = seen.size === agents.length;
      const col = !ok ? pal.fail : weakest > 0.5 ? pal.accent : weakest > 0.25 ? pal.warn : pal.fail;
      text(
        ctx,
        `mesh · ${ls.length} links · weakest ${Math.round(weakest * 100)}% · ${ok ? "connected" : "split"}`,
        fs,
        y + fs * 1.7,
        col,
      );
    }

    let caption = "";
    if (phase === PHASE.route) caption = "the direct route crosses the zone";
    else if (phase === PHASE.search) caption = "A* expanding over the costmap";
    else if (phase === PHASE.plan) caption = "global plan, routed around the zone";
    else if (phase === PHASE.transit)
      caption = agents.some((a) => a.cbf > 0.05)
        ? "safety barrier holding the formation off the boundary"
        : "V formation tracking the plan behind a virtual leader";
    else if (phase === PHASE.spread) caption = "formation breaks · Voronoi partition of the task zone";
    else if (phase === PHASE.sweep) {
      const total = agents.reduce((s, a) => s + a.cum[a.cum.length - 1], 0);
      const done = agents.reduce((s, a) => s + a.done, 0);
      caption = `each vehicle sweeps its own cell · coverage ${Math.round((100 * done) / (total || 1))}%`;
    } else caption = "contact · three bearings triangulate it";
    ctx.font = mono(fs);
    text(ctx, caption, fs, h - fs * 1.2, pal.body);
  }

  function frame(dt: number) {
    update(Math.min(dt, 0.1));
    draw();
  }

  return { resize, frame, poster: 15.5 };
}
