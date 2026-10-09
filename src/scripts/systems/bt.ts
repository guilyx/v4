/**
 * Behavior tree densification and scoring, as a loop:
 *
 *   1. a BT.CPP-style tree appears as an outline (16 nodes, 6 of them actions)
 *   2. control nodes dim, every action flies into an action graph, and each
 *      condition lands on an arrow as its guard
 *   3. a gap is flagged (an action with no failure path)
 *   4. run history scores every action and the weakest gets a suggestion
 *
 * Node names are illustrative, not from any real mission.
 */
import {
  type Palette,
  type Scene,
  arrowHead,
  box,
  clamp,
  easeInOut,
  easeOut,
  fontFor,
  lerp,
  mono,
  partialPolyline,
  rgba,
  span,
  text,
} from "./kit";

type Kind = "ctrl" | "cond" | "act" | "deco" | "sub";
interface Row {
  d: number;
  l: string;
  k: Kind;
  id?: string;
}

const ROWS: Row[] = [
  { d: 0, l: "ReactiveFallback", k: "ctrl" },
  { d: 1, l: "ReactiveSequence", k: "ctrl" },
  { d: 2, l: "Emergency?", k: "cond", id: "emg" },
  { d: 2, l: "EmergencyLand", k: "act", id: "EL" },
  { d: 1, l: "Sequence", k: "ctrl" },
  { d: 2, l: "FlightDefaults", k: "act", id: "FD" },
  { d: 2, l: "Fallback", k: "ctrl" },
  { d: 3, l: "Sequence", k: "ctrl" },
  { d: 4, l: "BatteryOK?", k: "cond", id: "bat" },
  { d: 4, l: "Retry ×3", k: "deco", id: "retry" },
  { d: 5, l: "GoToZone", k: "act", id: "GZ" },
  { d: 3, l: "ReturnHome", k: "sub" },
  { d: 4, l: "Sequence", k: "ctrl" },
  { d: 5, l: "ResolveHome", k: "act", id: "RH" },
  { d: 5, l: "FlyHome", k: "act", id: "FH" },
  { d: 5, l: "Land", k: "act", id: "LD" },
];

/** Action-graph positions, normalised to the graph panel. */
const NODES: Record<string, { x: number; y: number; risk: number }> = {
  FD: { x: 0.24, y: 0.08, risk: 0.04 },
  GZ: { x: 0.24, y: 0.34, risk: 0.27 },
  RH: { x: 0.74, y: 0.34, risk: 0.07 },
  FH: { x: 0.74, y: 0.56, risk: 0.41 },
  LD: { x: 0.74, y: 0.78, risk: 0.05 },
  EL: { x: 0.5, y: 0.97, risk: 0.11 },
};
const ACTIONS = ["FD", "GZ", "RH", "FH", "LD", "EL"];
const BOX_BOTTOM = 0.875;
const DONE = { x: 0.24, y: 0.56 };

interface Edge {
  from: string;
  to: string;
  label?: string;
  /** Row id whose chip flies in to become this edge's guard. */
  guard?: string;
  dashed?: boolean;
}
const EDGES: Edge[] = [
  { from: "FD", to: "GZ", label: "BatteryOK", guard: "bat" },
  { from: "FD", to: "RH", label: "not BatteryOK", guard: "bat" },
  { from: "GZ", to: "RH", label: "fail ×3", guard: "retry" },
  { from: "GZ", to: "done", label: "success" },
  { from: "RH", to: "FH" },
  { from: "FH", to: "LD", label: "success" },
  { from: "box", to: "EL", label: "Emergency", guard: "emg", dashed: true },
];

const PERIOD = 11;
const T = {
  rows: 0.2,
  dim: 2.3,
  fly: 2.6,
  box: 3.2,
  edges: 3.5,
  gap: 5.3,
  score: 6.1,
  card: 7.0,
  out: 10.3,
};

export default function bt(ctx: CanvasRenderingContext2D, pal: Palette): Scene {
  let w = 0;
  let h = 0;
  let fs = 10;
  let t = 0;
  let narrow = false;
  const tree = { x: 0, y: 0, w: 0, h: 0, rowH: 14, indent: 14 };
  const graph = { x: 0, y: 0, w: 0, h: 0 };
  const nodeBox: Record<string, { x: number; y: number; w: number; h: number }> = {};

  const rowPos = (i: number) => {
    const r = ROWS[i];
    const gx = tree.x + r.d * tree.indent;
    const y = tree.y + i * tree.rowH + tree.rowH / 2;
    return { gx, lx: gx + fs * 1.25, y };
  };
  const rowIndex = (id: string) => ROWS.findIndex((r) => r.id === id);
  const gp = (nx: number, ny: number): [number, number] => [graph.x + nx * graph.w, graph.y + ny * graph.h];

  function resize(W: number, H: number) {
    w = W;
    h = H;
    fs = fontFor(w);
    narrow = w < 600;
    if (narrow) {
      Object.assign(tree, { x: w * 0.05, y: h * 0.08, w: w * 0.9, h: h * 0.4 });
      Object.assign(graph, { x: w * 0.05, y: h * 0.55, w: w * 0.9, h: h * 0.4 });
    } else {
      Object.assign(tree, { x: w * 0.04, y: h * 0.13, w: w * 0.36, h: h * 0.8 });
      Object.assign(graph, { x: w * 0.47, y: h * 0.13, w: w * 0.5, h: h * 0.75 });
    }
    tree.rowH = Math.min(fs * 2.1, tree.h / (ROWS.length + 1));
    tree.indent = fs * 1.35;

    ctx.font = mono(fs);
    const bh = fs * 2.2;
    for (const id of ACTIONS) {
      const label = ROWS[rowIndex(id)].l;
      const bw = ctx.measureText(label).width + fs * 1.8;
      const [cx, cy] = gp(NODES[id].x, NODES[id].y);
      nodeBox[id] = { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh };
    }
  }

  const center = (id: string): [number, number] => {
    const b = nodeBox[id];
    return [b.x + b.w / 2, b.y + b.h / 2];
  };

  function edgePoints(e: Edge): [number, number][] {
    if (e.from === "box") {
      const [x, y] = gp(0.5, BOX_BOTTOM);
      const b = nodeBox[e.to];
      return [
        [x, y],
        [x, b.y],
      ];
    }
    const a = nodeBox[e.from];
    if (e.to === "done") {
      const [dx, dy] = gp(DONE.x, DONE.y);
      return [
        [a.x + a.w / 2, a.y + a.h],
        [dx, dy - fs * 0.6],
      ];
    }
    const b = nodeBox[e.to];
    const [ax, ay] = center(e.from);
    const [bx, by] = center(e.to);
    if (Math.abs(ay - by) < 1) {
      return [
        [a.x + a.w, ay],
        [b.x, by],
      ];
    }
    if (Math.abs(ax - bx) < 1) {
      return [
        [ax, a.y + a.h],
        [bx, b.y],
      ];
    }
    // elbow: out of the source's side, then down into the target's top
    return [
      [a.x + a.w, ay],
      [bx, ay],
      [bx, b.y],
    ];
  }

  function labelPos(e: Edge): [number, number, CanvasTextAlign] {
    const p = edgePoints(e);
    if (p.length === 3) return [(p[0][0] + p[1][0]) / 2, p[0][1] - fs * 0.85, "center"];
    const [x0, y0] = p[0];
    const [x1, y1] = p[1];
    if (Math.abs(y0 - y1) < 1) return [(x0 + x1) / 2, y0 - fs * 0.85, "center"];
    return [x0 + fs * 0.6, (y0 + y1) / 2, "left"];
  }

  const riskCol = (r: number) => (r > 0.35 ? pal.fail : r > 0.18 ? pal.warn : pal.ok);

  function glyph(k: Kind, x: number, y: number, a: number) {
    const s = fs * 0.36;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.lineWidth = 1;
    if (k === "ctrl") {
      ctx.beginPath();
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s, y);
      ctx.lineTo(x, y + s);
      ctx.lineTo(x - s, y);
      ctx.closePath();
      ctx.fillStyle = pal.muted;
      ctx.fill();
    } else if (k === "cond") {
      ctx.beginPath();
      ctx.arc(x, y, s * 0.9, 0, Math.PI * 2);
      ctx.strokeStyle = pal.warn;
      ctx.stroke();
    } else if (k === "act") {
      ctx.fillStyle = pal.accent;
      ctx.fillRect(x - s * 0.85, y - s * 0.85, s * 1.7, s * 1.7);
    } else if (k === "deco") {
      ctx.beginPath();
      ctx.moveTo(x, y - s);
      ctx.lineTo(x + s, y + s * 0.8);
      ctx.lineTo(x - s, y + s * 0.8);
      ctx.closePath();
      ctx.strokeStyle = pal.muted;
      ctx.stroke();
    } else {
      ctx.strokeStyle = pal.muted;
      ctx.strokeRect(x - s, y - s, s * 2, s * 2);
      ctx.strokeRect(x - s * 0.45, y - s * 0.45, s * 0.9, s * 0.9);
    }
    ctx.restore();
  }

  function drawTree() {
    const dimU = easeInOut(span(t, T.dim, T.dim + 0.6));
    ctx.font = mono(fs);
    // guides: from each row's parent down to it, then across
    ctx.lineWidth = 1;
    for (let i = 1; i < ROWS.length; i++) {
      const a = span(t, T.rows + i * 0.06, T.rows + i * 0.06 + 0.3);
      if (a <= 0) continue;
      let p = i - 1;
      while (p >= 0 && ROWS[p].d !== ROWS[i].d - 1) p--;
      const pp = rowPos(p);
      const rp = rowPos(i);
      ctx.strokeStyle = rgba(pal.faint, 0.55 * a * (1 - 0.5 * dimU));
      ctx.beginPath();
      ctx.moveTo(pp.gx, pp.y + fs * 0.45);
      ctx.lineTo(pp.gx, rp.y);
      ctx.lineTo(rp.gx - fs * 0.5, rp.y);
      ctx.stroke();
    }
    for (let i = 0; i < ROWS.length; i++) {
      const r = ROWS[i];
      const a = span(t, T.rows + i * 0.06, T.rows + i * 0.06 + 0.3);
      if (a <= 0) continue;
      const { gx, lx, y } = rowPos(i);
      const dimmed = r.k === "act" ? 1 : r.k === "cond" || r.k === "deco" ? 1 - 0.45 * dimU : 1 - 0.7 * dimU;
      glyph(r.k, gx, y, a * dimmed);
      const col = r.k === "act" ? pal.heading : r.k === "cond" ? pal.warn : pal.muted;
      ctx.globalAlpha = a * dimmed;
      text(ctx, r.l, lx, y, col);
      ctx.globalAlpha = 1;
    }
  }

  function drawHeaders() {
    ctx.font = mono(fs);
    const a = span(t, 0, 0.4);
    const before = narrow ? [tree.x, h * 0.035] : [tree.x, h * 0.06];
    ctx.globalAlpha = a;
    text(ctx, "before", before[0], before[1], pal.faint);
    text(ctx, `${ROWS.length} nodes · ${ACTIONS.length} actions`, before[0] + fs * 5, before[1], pal.muted);

    const ga = span(t, T.fly, T.fly + 0.5);
    const after = narrow ? [graph.x, graph.y - fs * 1.9] : [graph.x, h * 0.06];
    ctx.globalAlpha = ga;
    const scored = t >= T.score;
    text(ctx, scored ? "scored" : "after", after[0], after[1], pal.faint);
    text(
      ctx,
      scored ? "72 / 100 · weakest: FlyHome" : `${ACTIONS.length} actions · a guard on every arrow`,
      after[0] + fs * 5,
      after[1],
      scored ? pal.warn : pal.muted,
    );
    ctx.globalAlpha = 1;
  }

  function drawGraph() {
    ctx.font = mono(fs);
    // the preemption scope
    const ba = easeOut(span(t, T.box, T.box + 0.6));
    if (ba > 0) {
      const [x0, y0] = gp(-0.01, -0.06);
      const [x1, y1] = gp(1.01, BOX_BOTTOM);
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = rgba(pal.faint, 0.8 * ba);
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      ctx.restore();
      ctx.font = mono(fs * 0.85);
      ctx.globalAlpha = ba;
      text(ctx, narrow ? "Emergency preempts all" : "any action here is preempted on Emergency", x0 + fs * 0.6, y1 - fs * 0.9, pal.faint);
      ctx.globalAlpha = 1;
      ctx.font = mono(fs);
    }

    // edges + guard labels
    EDGES.forEach((e, k) => {
      const start = T.edges + k * 0.18;
      const u = easeInOut(span(t, start, start + 0.4));
      if (u <= 0) return;
      const weak = t > T.score + 0.7 && e.from === "RH" && e.to === "FH";
      const col = weak ? pal.fail : e.dashed ? pal.faint : pal.muted;
      ctx.save();
      ctx.strokeStyle = col;
      ctx.lineWidth = weak ? 1.6 : 1.1;
      if (e.dashed) ctx.setLineDash([3, 3]);
      const [hx, hy, ha] = partialPolyline(ctx, edgePoints(e), u);
      ctx.restore();
      if (u >= 1) arrowHead(ctx, hx, hy, ha, fs * 0.55, col);
      if (e.label) {
        const la = span(t, start + 0.25, start + 0.5);
        const [lx, ly, al] = labelPos(e);
        ctx.globalAlpha = la;
        ctx.font = mono(fs * 0.9);
        text(ctx, e.label, lx, ly, e.guard ? pal.warn : pal.faint, al);
        ctx.font = mono(fs);
        ctx.globalAlpha = 1;
      }
    });

    // terminal
    const da = span(t, T.edges + 3 * 0.18 + 0.3, T.edges + 3 * 0.18 + 0.6);
    if (da > 0) {
      const [dx, dy] = gp(DONE.x, DONE.y);
      ctx.globalAlpha = da;
      ctx.beginPath();
      ctx.arc(dx, dy, fs * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = pal.ok;
      ctx.stroke();
      text(ctx, "done", dx + fs * 0.9, dy, pal.ok);
      ctx.globalAlpha = 1;
    }

    // gap: an action with no failure path
    const gu = easeOut(span(t, T.gap, T.gap + 0.5));
    if (gu > 0) {
      const b = nodeBox.FH;
      const y = b.y + b.h / 2;
      const len = Math.min(graph.w * 0.16, fs * 6);
      ctx.save();
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = pal.fail;
      ctx.beginPath();
      ctx.moveTo(b.x, y);
      ctx.lineTo(b.x - len * gu, y);
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = span(t, T.gap + 0.3, T.gap + 0.7);
      text(ctx, "?", b.x - len - fs * 0.6, y, pal.fail, "center");
      ctx.font = mono(fs * 0.85);
      text(ctx, "no failure path", b.x - fs * 0.4, y - fs * 1.1, pal.fail, "right");
      ctx.font = mono(fs);
      ctx.globalAlpha = 1;
    }

    // nodes that have landed
    ACTIONS.forEach((id, j) => {
      if (t < T.fly + j * 0.12 + 0.8) return;
      drawNode(id, 1);
    });
  }

  function drawNode(id: string, a: number, at?: { x: number; y: number; s: number }) {
    const b = nodeBox[id];
    const scoreU = easeOut(span(t, T.score + ACTIONS.indexOf(id) * 0.1, T.score + ACTIONS.indexOf(id) * 0.1 + 0.6));
    const risk = NODES[id].risk;
    const rc = riskCol(risk);
    const x = at ? at.x - (b.w * at.s) / 2 : b.x;
    const y = at ? at.y - (b.h * at.s) / 2 : b.y;
    const bw = b.w * (at?.s ?? 1);
    const bh = b.h * (at?.s ?? 1);
    ctx.globalAlpha = a;
    if (!at && id === "FH" && t > T.score + 0.7) {
      const pulse = 0.18 + 0.14 * Math.sin((t - T.score) * 4);
      box(ctx, x - 4, y - 4, bw + 8, bh + 8, rgba(pal.fail, pulse), "transparent", 0);
    }
    const stroke = scoreU > 0 ? rgba(rc, 0.4 + 0.6 * scoreU) : pal.accent;
    box(ctx, x, y, bw, bh, rgba(scoreU > 0 ? rc : pal.accent, 0.1), stroke, 1.1);
    ctx.font = mono(fs * (at?.s ?? 1));
    text(ctx, ROWS[rowIndex(id)].l, x + bw / 2, y + bh / 2, pal.heading, "center");
    ctx.font = mono(fs);
    if (!at && scoreU > 0) {
      const by = y + bh + fs * 0.45;
      ctx.fillStyle = rgba(pal.faint, 0.35);
      ctx.fillRect(x, by, bw, 2.5);
      ctx.fillStyle = rc;
      ctx.fillRect(x, by, bw * risk * scoreU * 1.6, 2.5);
      ctx.font = mono(fs * 0.8);
      text(ctx, `${Math.round(risk * 100 * scoreU)}%`, x + bw + fs * 0.4, by + 1, rc);
      ctx.font = mono(fs);
    }
    ctx.globalAlpha = 1;
  }

  function drawFlights() {
    // actions fly out of the outline into the graph
    ACTIONS.forEach((id, j) => {
      const s = T.fly + j * 0.12;
      const u = span(t, s, s + 0.8);
      if (u <= 0 || u >= 1) return;
      const e = easeInOut(u);
      const r = rowPos(rowIndex(id));
      ctx.font = mono(fs);
      const fromX = r.lx + ctx.measureText(ROWS[rowIndex(id)].l).width / 2;
      const [tx, ty] = center(id);
      const arc = Math.sin(e * Math.PI) * (narrow ? 0 : -fs * 3);
      drawNode(id, 0.35 + 0.65 * e, { x: lerp(fromX, tx, e), y: lerp(r.y, ty, e) + arc, s: lerp(0.85, 1, e) });
    });
    // conditions fly onto the arrows they guard
    EDGES.forEach((e, k) => {
      if (!e.guard || !e.label) return;
      const s = T.edges + k * 0.18 - 0.35;
      const u = span(t, s, s + 0.6);
      if (u <= 0 || u >= 1) return;
      const r = rowPos(rowIndex(e.guard));
      const [lx, ly] = labelPos(e);
      const p = easeInOut(u);
      ctx.globalAlpha = Math.sin(p * Math.PI) * 0.9;
      ctx.font = mono(fs * 0.9);
      text(ctx, e.label, lerp(r.lx, lx, p), lerp(r.y, ly, p), pal.warn, "center");
      ctx.font = mono(fs);
      ctx.globalAlpha = 1;
    });
  }

  function drawCard() {
    const a = easeOut(span(t, T.card, T.card + 0.5));
    if (a <= 0) return;
    // On a phone the graph has no room left, but the outline has served its
    // purpose by now and leaves its right half empty.
    const [x0, y0] = narrow ? [tree.x + tree.w * 0.52, tree.y + tree.h * 0.5] : gp(0, 0.6);
    const cw = narrow ? tree.w * 0.48 : graph.w * 0.5;
    const lines = ["FlyHome · 41% of runs fail", "fails on long legs:", "add a replan retry", "and a failure path"];
    const lh = fs * 1.35;
    const ch = lh * (lines.length + 0.9);
    ctx.globalAlpha = a;
    box(ctx, x0 - fs * 0.3, y0, cw, ch, rgba(pal.raised, 0.95), rgba(pal.fail, 0.55));
    ctx.font = mono(fs * 0.85);
    lines.forEach((l, i) => {
      const la = span(t, T.card + 0.3 + i * 0.25, T.card + 0.6 + i * 0.25);
      ctx.globalAlpha = a * la;
      text(ctx, l, x0 + fs * 0.5, y0 + lh * (i + 0.95), i === 0 ? pal.fail : i === 1 ? pal.muted : pal.heading);
    });
    ctx.font = mono(fs);
    ctx.globalAlpha = 1;
  }

  function frame(dt: number) {
    t += dt;
    if (t > PERIOD) t -= PERIOD;
    ctx.clearRect(0, 0, w, h);
    const fade = 1 - easeInOut(span(t, T.out, T.out + 0.6));
    ctx.save();
    ctx.globalAlpha = 1;
    // fade the whole frame by painting over it at the end of the loop
    drawHeaders();
    drawTree();
    drawGraph();
    drawCard();
    drawFlights();
    ctx.restore();
    if (fade < 1) {
      ctx.fillStyle = rgba(pal.raised, clamp(1 - fade));
      ctx.fillRect(0, 0, w, h);
    }
  }

  return { resize, frame, poster: 9.2 };
}
