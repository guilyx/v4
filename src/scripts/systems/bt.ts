/**
 * One behaviour tree, two views and a switch between them (a 31 s loop).
 *
 *   tree  — what runs: live status, port values, each node's risk. All edits
 *           happen here.
 *   graph — what can happen: the tree flattened into actions, guards and
 *           outcomes, plus gaps and the mission score.
 *
 * A pointer drives the story. The tree runs live (GoToZone fails three times,
 * the fallback takes ReturnHome), each action gets its risk, then the pointer
 * flips to the graph: the ReturnHome subtree opens, everything but the
 * actions fades, actions fly to their graph slots and guards land on their
 * arrows. A gap and the mission score show up; picking an arrow names the
 * tree nodes behind it, and flipping back rings them in the tree. FlyHome
 * gets a fallback and GoToZone a port edit, both in the tree, and the graph
 * re-flattens and re-scores. Per-node risk is the same number in both views;
 * only the graph shows the mission score.
 *
 * Node, port and zone names are illustrative, not from any real mission.
 */
import {
  type Palette,
  type Scene,
  arrowHead,
  box,
  clamp,
  easeInOut,
  fontFor,
  lerp,
  mono,
  partialPolyline,
  rgba,
  span,
  text,
} from "./kit";

type Kind = "ctrl" | "cond" | "act" | "deco" | "sub";
type Status = "run" | "ok" | "fail";
interface TNode {
  id: string;
  kids: TNode[];
}
interface Pt {
  x: number;
  y: number;
}
interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

const NODES: Record<string, { label: string; kind: Kind }> = {
  rf: { label: "ReactiveFallback", kind: "ctrl" },
  rs: { label: "ReactiveSequence", kind: "ctrl" },
  emg: { label: "Emergency?", kind: "cond" },
  EL: { label: "EmergencyLand", kind: "act" },
  seq: { label: "Sequence", kind: "ctrl" },
  FD: { label: "FlightDefaults", kind: "act" },
  fb: { label: "Fallback", kind: "ctrl" },
  seq2: { label: "Sequence", kind: "ctrl" },
  bat: { label: "BatteryOK?", kind: "cond" },
  retry: { label: "Retry ×3", kind: "deco" },
  GZ: { label: "GoToZone", kind: "act" },
  sub: { label: "ReturnHome", kind: "sub" },
  rseq: { label: "Sequence", kind: "ctrl" },
  RH: { label: "ResolveHome", kind: "act" },
  FH: { label: "FlyHome", kind: "act" },
  LD: { label: "Land", kind: "act" },
  fb2: { label: "Fallback", kind: "ctrl" },
  FS: { label: "FlySafe", kind: "act" },
};
const IDS = Object.keys(NODES);

const n = (id: string, ...kids: TNode[]): TNode => ({ id, kids });
const mission = (body?: TNode) =>
  n(
    "rf",
    n("rs", n("emg"), n("EL")),
    n("seq", n("FD"), n("fb", n("seq2", n("bat"), n("retry", n("GZ"))), body ? n("sub", body) : n("sub"))),
  );
/** closed: ReturnHome shut · open: its body inlined · edited: FlyHome gets a fallback. */
const VARIANTS = [
  mission(),
  mission(n("rseq", n("RH"), n("FH"), n("LD"))),
  mission(n("rseq", n("RH"), n("fb2", n("FH"), n("FS")), n("LD"))),
];
/** Where a node missing from a variant sits: inside the shut subtree, or on FlyHome. */
const STAND_IN = ["sub", "FH", "FH"];
const ROWS = 7;

const PARENT: Record<string, string>[] = VARIANTS.map((root) => {
  const p: Record<string, string> = { [root.id]: "" };
  const walk = (nd: TNode) =>
    nd.kids.forEach((k) => {
      p[k.id] = nd.id;
      walk(k);
    });
  walk(root);
  return p;
});
const LINKS: [string, string][] = [];
for (const p of PARENT)
  for (const [c, par] of Object.entries(p))
    if (par && !LINKS.some(([a, b]) => a === par && b === c)) LINKS.push([par, c]);

/** Graph positions, normalised to the graph panel (the existing action graph, plus FlySafe). */
const GRAPH: Record<string, Pt> = {
  FD: { x: 0.24, y: 0.08 },
  GZ: { x: 0.24, y: 0.34 },
  RH: { x: 0.74, y: 0.34 },
  FH: { x: 0.74, y: 0.56 },
  LD: { x: 0.74, y: 0.78 },
  EL: { x: 0.5, y: 0.97 },
  FS: { x: 0.48, y: 0.56 },
};
/** Fly order for the morph, left to right as they sit in the tree. */
const ACTIONS = ["EL", "FD", "GZ", "RH", "FH", "FS", "LD"];
const DONE = { x: 0.24, y: 0.56 };
const BOX_BOTTOM = 0.875;

interface Edge {
  from: string;
  to: string;
  label?: string;
  /** Tree node whose name flies onto this arrow as its guard. */
  guard?: string;
  dashed?: boolean;
  /** Exists only once FlyHome has its fallback. */
  edited?: boolean;
  /** The arrow the pointer picks. */
  pick?: boolean;
  /** Route down out of the source, then across into the target's side. */
  downRight?: boolean;
}
const EDGES: Edge[] = [
  { from: "FD", to: "GZ", label: "BatteryOK", guard: "bat" },
  { from: "FD", to: "RH", label: "not BatteryOK", guard: "bat" },
  { from: "GZ", to: "RH", label: "fail ×3", guard: "retry", pick: true },
  { from: "GZ", to: "done", label: "success" },
  { from: "RH", to: "FH" },
  { from: "FH", to: "LD", label: "success" },
  { from: "FH", to: "FS", label: "fail", edited: true },
  { from: "FS", to: "LD", edited: true, downRight: true },
  { from: "box", to: "EL", label: "Emergency", guard: "emg", dashed: true },
];
/** Order of the guarded arrows, which staggers their labels' flights. */
const GUARD_INDEX = new Map(EDGES.filter((e) => e.guard).map((e, i) => [e, i]));
/** Tree nodes behind the picked arrow. */
const PICKED = ["retry", "fb", "seq2"];

/** Per-node risk in %, from history and ports. FlySafe has no history: it's estimated. */
const RISK: Record<string, number> = { FD: 4, GZ: 27, RH: 7, FH: 41, LD: 5, EL: 11, FS: 9 };

/** The live run: [time, node, status]. No emergency, so its branch fails at once. */
const EVENTS: [number, string, Status][] = [
  [0.3, "rf", "run"],
  [0.35, "rs", "run"],
  [0.45, "emg", "fail"],
  [0.6, "rs", "fail"],
  [0.7, "seq", "run"],
  [0.8, "FD", "run"],
  [1.35, "FD", "ok"],
  [1.45, "fb", "run"],
  [1.5, "seq2", "run"],
  [1.55, "bat", "ok"],
  [1.7, "retry", "run"],
  [1.75, "GZ", "run"],
  [2.45, "GZ", "fail"],
  [2.65, "GZ", "run"],
  [3.35, "GZ", "fail"],
  [3.55, "GZ", "run"],
  [4.25, "GZ", "fail"],
  [4.4, "retry", "fail"],
  [4.45, "seq2", "fail"],
  [4.6, "sub", "run"],
];
const WORD: Record<Status, string> = { run: "RUNNING", ok: "SUCCESS", fail: "FAILURE" };

const PERIOD = 31;
const MORPH = 1.8;
const T = {
  live: 5.4,
  risk: 5.6,
  open: 7.7,
  morph1: 9.0,
  gap: 11.0,
  pick: 13.25,
  morph2: 15.1,
  edit: 17.8,
  zoneType: 19.3,
  gzCard: 20.75,
  speedType: 22.3,
  riskDrop: 22.9,
  morph3: 24.6,
  rescore: 26.3,
  out: 30.0,
};

const HEADERS: [number, string][] = [
  [0, "what runs · status and port values, live"],
  [T.risk, "what each node risks · from history and ports"],
  [T.open, "flatten · subtree inlined, its port remapped"],
  [T.gap, "a gap, and the score of the whole mission"],
  [T.pick, "each arrow keeps the tree nodes behind it"],
  [T.morph2, "the same nodes, picked out in the tree"],
  [T.edit, "edits go to the tree · FlyHome gets a fallback"],
  [T.riskDrop, "a port edit · the node's risk moves, not the shape"],
  [T.morph3, "re-flattened · the gap is closed"],
  [T.rescore, "re-scored · mission 72 → 91"],
];

/** tree ↔ graph: 0 is the tree, 1 the graph. */
function morphAt(t: number) {
  if (t < T.morph1) return 0;
  if (t < T.morph2) return span(t, T.morph1, T.morph1 + MORPH);
  if (t < T.morph3) return 1 - span(t, T.morph2, T.morph2 + MORPH);
  return span(t, T.morph3, T.morph3 + MORPH);
}

function statusAt(id: string, t: number): Status | null {
  let s: Status | null = null;
  for (const [et, eid, es] of EVENTS) if (eid === id && et <= t) s = es;
  return s;
}

export default function bt(ctx: CanvasRenderingContext2D, pal: Palette): Scene {
  let w = 0;
  let h = 0;
  let fs = 10;
  let tf = 8;
  let t = 0;
  let narrow = false;

  // per-frame state
  let m = 0;
  let flat = 0;
  let edit = 0;
  let wts = [1, 0, 0];

  const pills = { tree: { x: 0, y: 0, w: 0, h: 0 }, graph: { x: 0, y: 0, w: 0, h: 0 } };
  const head = { x: 0, y: 0 };
  const area = { x: 0, y: 0, w: 0, h: 0 };
  const card = { x: 0, y: 0, w: 0, h: 0 };
  let cf = 9;
  const graph = { x: 0, y: 0, w: 0, h: 0 };
  let rowH = 20;
  let tbh = 16;
  const tbw: Record<string, number> = {};
  const gb: Record<string, Rect> = {};
  let layouts: Record<string, Pt>[] = [];

  const measure = (s: string, f: number) => {
    ctx.font = mono(f);
    return ctx.measureText(s).width;
  };
  const gp = (nx: number, ny: number): [number, number] => [graph.x + nx * graph.w, graph.y + ny * graph.h];
  const riskCol = (r: number) => (r > 35 ? pal.fail : r > 18 ? pal.warn : pal.ok);
  const statusCol = (s: Status) => (s === "run" ? pal.warn : s === "ok" ? pal.ok : pal.fail);

  // ---------------------------------------------------------------- layout

  /** Box width of a tree node at font `f`: glyph, name, and (actions, desktop) a slot for the risk. */
  function nodeWidth(id: string, f: number) {
    const label = id === "retry" ? "Retry 3/3" : NODES[id].label;
    const slot = NODES[id].kind === "act" && !narrow ? measure("41%", f * 0.8) + f * 0.6 : 0;
    return f * 1.55 + measure(label, f) + f * 0.75 + slot;
  }

  /**
   * Tidy layout: subtrees placed left to right, each packed as tight as the
   * per-depth left/right outlines of what's already placed allow, and every
   * parent centred over its first and last child. Returns x relative to the
   * root and the variant's total width.
   */
  function tidy(root: TNode, gap: number) {
    const depth: Record<string, number> = {};
    const rec = (nd: TNode, d: number): { left: number[]; right: number[]; rel: Record<string, number> } => {
      depth[nd.id] = d;
      const half = tbw[nd.id] / 2;
      if (!nd.kids.length) return { left: [-half], right: [half], rel: { [nd.id]: 0 } };
      const subs = nd.kids.map((k) => rec(k, d + 1));
      const accL: number[] = [];
      const accR: number[] = [];
      const offs: number[] = [];
      subs.forEach((s, i) => {
        let off = 0;
        if (i > 0) {
          off = -Infinity;
          for (let k = 0; k < Math.min(accR.length, s.left.length); k++) off = Math.max(off, accR[k] + gap - s.left[k]);
        }
        offs.push(off);
        s.left.forEach((v, k) => {
          if (accL[k] === undefined) accL[k] = v + off;
        });
        s.right.forEach((v, k) => {
          accR[k] = v + off;
        });
      });
      const mid = (offs[0] + offs[offs.length - 1]) / 2;
      const rel: Record<string, number> = { [nd.id]: 0 };
      subs.forEach((s, i) => {
        for (const id in s.rel) rel[id] = s.rel[id] + offs[i] - mid;
      });
      return { left: [-half, ...accL.map((v) => v - mid)], right: [half, ...accR.map((v) => v - mid)], rel };
    };
    const r = rec(root, 0);
    const minL = Math.min(...r.left);
    const width = Math.max(...r.right) - minL;
    return { rel: r.rel, depth, minL, width };
  }

  function layoutTree() {
    // Shrink the tree's font until the widest variant fits the area.
    const byHeight = area.h / ROWS / 2.9;
    let best: ReturnType<typeof tidy>[] = [];
    for (tf = Math.min(fs, byHeight); ; tf -= 0.25) {
      tf = Math.max(tf, 5.5);
      for (const id of IDS) tbw[id] = nodeWidth(id, tf);
      best = VARIANTS.map((v) => tidy(v, tf * 0.9));
      if (tf <= 5.5 || best.every((b) => b.width <= area.w)) break;
    }
    tbh = tf * 2;
    rowH = Math.min(tf * 4.4, area.h / ROWS);
    const y0 = area.y + (area.h - rowH * ROWS) / 2;
    layouts = best.map((b) => {
      const pos: Record<string, Pt> = {};
      const x0 = area.x + (area.w - b.width) / 2 - b.minL;
      for (const id in b.rel) pos[id] = { x: x0 + b.rel[id], y: y0 + rowH * (b.depth[id] + 0.5) };
      return pos;
    });
  }

  function resize(W: number, H: number) {
    w = W;
    h = H;
    fs = fontFor(w);
    narrow = w < 600;

    // the switch
    const pf = fs * 0.85;
    const ph = fs * 1.8;
    const py = fs * 0.8;
    const tw = measure("tree", pf) + fs * 1.6;
    const gw = measure("graph", pf) + fs * 1.6;
    Object.assign(pills.tree, { x: fs * 1.1, y: py, w: tw, h: ph });
    Object.assign(pills.graph, { x: fs * 1.1 + tw, y: py, w: gw, h: ph });
    if (narrow) Object.assign(head, { x: pills.tree.x, y: py + ph + fs * 1.05 });
    else Object.assign(head, { x: pills.graph.x + gw + fs * 1.1, y: py + ph / 2 });
    const top = narrow ? head.y + fs * 1.6 : py + ph + fs * 1.4;

    if (narrow) {
      const treeH = (h - top) * 0.56;
      Object.assign(area, { x: fs * 0.7, y: top, w: w - fs * 1.4, h: treeH });
      cf = fs * 0.92;
      Object.assign(card, { x: fs * 0.7, y: top + treeH + fs * 0.5, w: w - fs * 1.4, h: 0 });
    } else {
      const cw = clamp(w * 0.3, 180, 340);
      Object.assign(area, { x: fs * 1.1, y: top, w: w - cw - fs * 3.4, h: h - top - fs * 1.1 });
      cf = clamp(cw / 27, 7.5, 11);
      Object.assign(card, { x: w - cw - fs * 1.1, y: top + fs * 0.6, w: cw, h: 0 });
    }
    card.h = cardRows().bottom - card.y;
    if (narrow) card.h = Math.min(card.h, h - card.y - fs * 0.4);

    // the graph, centred
    const gW = narrow ? w * 0.9 : Math.min(w * 0.62, h * 1.25);
    graph.x = (w - gW) / 2;
    graph.w = gW;
    graph.h = (h - top - fs * 2.3) / 1.03;
    graph.y = top + fs * 0.3 + graph.h * 0.06;
    const slot = narrow ? 0 : measure("41%", fs * 0.8) + fs * 0.6;
    const bh = fs * 2.2;
    for (const id of ACTIONS) {
      const bw = measure(NODES[id].label, fs) + fs * 1.4 + slot;
      const [cx, cy] = gp(GRAPH[id].x, GRAPH[id].y);
      gb[id] = { x: cx - bw / 2, y: cy - bh / 2, w: bw, h: bh };
    }

    layoutTree();
    if (!narrow) card.y = layouts[0].rf.y - tbh / 2;
  }

  // ------------------------------------------------------------ tree state

  function treePos(id: string): Pt {
    let x = 0;
    let y = 0;
    layouts.forEach((pos, v) => {
      const p = pos[id] ?? pos[STAND_IN[v]];
      x += wts[v] * p.x;
      y += wts[v] * p.y;
    });
    return { x, y };
  }
  const presence = (id: string) => layouts.reduce((s, pos, v) => s + (pos[id] ? wts[v] : 0), 0);
  const linkWeight = (p: string, c: string) => PARENT.reduce((s, par, v) => s + (par[c] === p ? wts[v] : 0), 0);
  const treeRect = (id: string): Rect => {
    const c = treePos(id);
    return { x: c.x - tbw[id] / 2, y: c.y - tbh / 2, w: tbw[id], h: tbh };
  };

  /** How strongly live status still shows (it gives way to risk). */
  const liveA = () => 1 - span(t, T.live, T.live + 0.5);

  function retryLabel() {
    if (t < 1.7 || t > T.live + 0.3) return NODES.retry.label;
    const tries = EVENTS.filter(([et, id, s]) => id === "GZ" && s === "run" && et <= t).length;
    return `Retry ${Math.max(1, tries)}/3`;
  }

  function riskOf(id: string) {
    if (id === "GZ") return lerp(27, 18, easeInOut(span(t, T.riskDrop, T.riskDrop + 0.6)));
    return RISK[id];
  }
  function riskVis(id: string) {
    if (id === "FS") return span(t, T.zoneType + 0.75, T.zoneType + 1.05);
    const j = ACTIONS.indexOf(id);
    return span(t, T.risk + j * 0.07, T.risk + j * 0.07 + 0.35);
  }

  /** Rings: the node the card follows, and the nodes behind the picked arrow. */
  function ringOf(id: string) {
    let a = 0;
    if (id === "FD") a = span(t, 0.8, 0.95) * (1 - span(t, 1.35, 1.5));
    if (id === "GZ") a = span(t, 1.75, 1.9) * (1 - span(t, 4.45, 4.6));
    if (id === "sub") a = span(t, 4.6, 4.75) * (1 - span(t, 7.5, 7.8));
    if (id === "FS") a = span(t, T.edit + 0.1, T.edit + 0.4) * (1 - span(t, T.gzCard - 0.1, T.gzCard + 0.1));
    if (id === "GZ" && t > T.gzCard - 0.2) a = span(t, T.gzCard, T.gzCard + 0.25);
    if (PICKED.includes(id)) a = span(t, T.morph2 + 0.2, T.morph2 + 0.5) * (1 - span(t, 17.6, 17.85));
    return a;
  }

  // ---------------------------------------------------------------- glyphs

  function glyph(k: Kind, x: number, y: number, s: number, a: number) {
    if (a <= 0) return;
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
      ctx.fillRect(x - s * 0.8, y - s * 0.8, s * 1.6, s * 1.6);
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

  function ring(r: Rect, a: number, pad: number) {
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha *= a;
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(r.x - pad, r.y - pad, r.w + pad * 2, r.h + pad * 2, 4);
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------- the switch

  function drawSwitch() {
    const u = easeInOut(m);
    const pf = fs * 0.85;
    const { tree: a, graph: b } = pills;
    ctx.beginPath();
    ctx.roundRect(a.x, a.y, a.w + b.w, a.h, a.h / 2);
    ctx.strokeStyle = pal.line;
    ctx.lineWidth = 1;
    ctx.stroke();
    // the fill follows the morph
    ctx.beginPath();
    ctx.roundRect(lerp(a.x, b.x, u), a.y, lerp(a.w, b.w, u), a.h, a.h / 2);
    ctx.fillStyle = pal.accent;
    ctx.fill();
    ctx.font = mono(pf);
    text(ctx, "tree", a.x + a.w / 2, a.y + a.h / 2, u < 0.5 ? pal.bg : pal.muted, "center");
    text(ctx, "graph", b.x + b.w / 2, b.y + b.h / 2, u >= 0.5 ? pal.bg : pal.muted, "center");

    // one muted line on what the current step shows
    let i = 0;
    while (i + 1 < HEADERS.length && HEADERS[i + 1][0] <= t) i++;
    const fade = span(t, HEADERS[i][0], HEADERS[i][0] + 0.3);
    ctx.font = mono(fs * 0.82);
    if (fade < 1 && i > 0) {
      ctx.globalAlpha = 1 - fade;
      text(ctx, HEADERS[i - 1][1], head.x, head.y, pal.muted);
    }
    ctx.globalAlpha = fade;
    text(ctx, HEADERS[i][1], head.x, head.y, pal.muted);
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------- tree view

  function drawLinks() {
    const fade = 1 - span(m, 0, 0.35);
    if (fade <= 0) return;
    const live = liveA();
    ctx.lineWidth = 1;
    for (const [p, c] of LINKS) {
      const a = linkWeight(p, c) * fade;
      if (a <= 0.01) continue;
      const pp = treePos(p);
      const cp = treePos(c);
      const y0 = pp.y + tbh / 2;
      const y1 = cp.y - tbh / 2;
      const ym = (y0 + y1) / 2;
      const s = statusAt(c, t);
      const path = () => {
        ctx.beginPath();
        ctx.moveTo(pp.x, y0);
        ctx.lineTo(pp.x, ym);
        ctx.lineTo(cp.x, ym);
        ctx.lineTo(cp.x, y1);
        ctx.stroke();
      };
      ctx.globalAlpha = a;
      ctx.strokeStyle = rgba(pal.faint, 0.75);
      path();
      // a link into a lit node takes the node's colour
      if (s && live > 0) {
        ctx.globalAlpha = a * live;
        ctx.strokeStyle = statusCol(s);
        path();
      }
    }
    ctx.globalAlpha = 1;
  }

  function drawTreeNodes() {
    const live = liveA();
    for (const id of IDS) {
      const k = NODES[id].kind;
      if (k === "act") continue;
      const fade = k === "ctrl" || k === "sub" ? 1 - span(m, 0, 0.35) : 1 - span(m, 0.2, 0.55);
      const a = presence(id) * fade;
      if (a <= 0.01) continue;
      const r = treeRect(id);
      const s = statusAt(id, t);
      ctx.globalAlpha = a;
      if (s === "run" && live > 0) {
        const g = (0.12 + 0.12 * Math.sin(t * 6)) * live;
        box(ctx, r.x - 3, r.y - 3, r.w + 6, r.h + 6, rgba(pal.warn, g), "transparent", 0);
      }
      box(ctx, r.x, r.y, r.w, r.h, pal.raised, pal.line);
      if (s && live > 0) box(ctx, r.x, r.y, r.w, r.h, rgba(statusCol(s), 0.14 * live), rgba(statusCol(s), live));
      if (k === "sub") {
        // a shut subtree shows a dashed inner border
        const shut = 1 - flat;
        if (shut > 0) {
          ctx.save();
          ctx.globalAlpha *= shut;
          ctx.setLineDash([2, 2]);
          ctx.strokeStyle = pal.muted;
          ctx.beginPath();
          ctx.roundRect(r.x + 2.5, r.y + 2.5, r.w - 5, r.h - 5, 2);
          ctx.stroke();
          ctx.restore();
        }
      }
      glyph(k, r.x + tf * 0.85, r.y + r.h / 2, tf * 0.34, 1);
      ctx.font = mono(tf);
      text(ctx, id === "retry" ? retryLabel() : NODES[id].label, r.x + tf * 1.55, r.y + r.h / 2, k === "cond" ? pal.warn : pal.body);
      ctx.globalAlpha = a;
      ring(r, ringOf(id), 3);
      ctx.globalAlpha = 1;
    }
  }

  /** "home ← {home_zone}": appears under ReturnHome, then moves under ResolveHome. */
  function drawRemap() {
    const a = span(t, T.open + 0.15, T.open + 0.45) * (1 - span(m, 0, 0.3)) * (1 - edit);
    if (a <= 0) return;
    const sub = treeRect("sub");
    const rh = treeRect("RH");
    const mv = easeInOut(span(t, T.open + 0.45, T.open + 1.15));
    const x = lerp(sub.x + sub.w / 2, rh.x + rh.w / 2, mv);
    const y = lerp(sub.y + sub.h, rh.y + rh.h, mv) + tf * 0.95;
    const f = tf * 0.85;
    const left = "home ← ";
    const key = "{home_zone}";
    const lw = measure(left, f);
    const total = lw + measure(key, f);
    ctx.globalAlpha = a;
    box(ctx, x - total / 2 - f * 0.4, y - f * 0.8, total + f * 0.8, f * 1.6, pal.raised, rgba(pal.accent, 0.35));
    ctx.font = mono(f);
    text(ctx, left, x - total / 2, y, pal.muted);
    text(ctx, key, x - total / 2 + lw, y, pal.accent);
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------ graph view

  const centerOf = (r: Rect): Pt => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

  function edgePoints(e: Edge): [number, number][] {
    if (e.from === "box") {
      const [x, y] = gp(0.5, BOX_BOTTOM);
      return [
        [x, y],
        [x, gb.EL.y],
      ];
    }
    const a = gb[e.from];
    if (e.to === "done") {
      const [dx, dy] = gp(DONE.x, DONE.y);
      return [
        [a.x + a.w / 2, a.y + a.h],
        [dx, dy - fs * 0.6],
      ];
    }
    const b = gb[e.to];
    const ac = centerOf(a);
    const bc = centerOf(b);
    if (e.downRight)
      return [
        [ac.x, a.y + a.h],
        [ac.x, bc.y],
        [b.x, bc.y],
      ];
    if (Math.abs(ac.y - bc.y) < 1)
      return bc.x > ac.x
        ? [
            [a.x + a.w, ac.y],
            [b.x, bc.y],
          ]
        : [
            [a.x, ac.y],
            [b.x + b.w, bc.y],
          ];
    if (Math.abs(ac.x - bc.x) < 1)
      return [
        [ac.x, a.y + a.h],
        [bc.x, b.y],
      ];
    // elbow: out of the source's side, then down into the target's top
    return [
      [a.x + a.w, ac.y],
      [bc.x, ac.y],
      [bc.x, b.y],
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

  /** How far each guard label has flown from its tree node onto its arrow. */
  function guardFlight(k: number) {
    return easeInOut(span(m, 0.45 + 0.05 * k, 0.8 + 0.05 * k));
  }

  const gapA = () => span(m, 0.8, 1) * (1 - edit) * span(t, T.gap, T.gap + 0.4);
  const pickA = () => span(t, T.pick, T.pick + 0.25) * (1 - span(t, 17.6, 17.85));

  function drawGraph() {
    if (m <= 0) return;
    // the preemption scope
    const ba = span(m, 0.6, 0.9);
    if (ba > 0) {
      const [x0, y0] = gp(-0.01, -0.06);
      const [x1, y1] = gp(1.01, BOX_BOTTOM);
      ctx.save();
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = rgba(pal.faint, 0.8 * ba);
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      ctx.restore();
      ctx.font = mono(fs * 0.82);
      ctx.globalAlpha = ba;
      text(ctx, "Emergency · preempts any action", x0 + fs * 0.6, y1 - fs * 0.9, pal.faint);
      ctx.globalAlpha = 1;
    }

    // edges and their labels
    EDGES.forEach((e, k) => {
      const exist = e.edited ? edit : 1;
      if (exist <= 0.01) return;
      const u = easeInOut(span(m, 0.5 + 0.025 * k, 0.78 + 0.025 * k));
      const gk = GUARD_INDEX.get(e) ?? -1;
      if (u <= 0) return;
      const picked = e.pick ? pickA() : 0;
      const weak = e.from === "RH" && e.to === "FH" ? gapA() : 0;
      const col = picked > 0.5 ? pal.accent : weak > 0.5 ? pal.fail : e.dashed ? pal.faint : pal.muted;
      ctx.save();
      ctx.globalAlpha = exist;
      ctx.strokeStyle = col;
      ctx.lineWidth = picked > 0.5 ? 2.2 : weak > 0.5 ? 1.6 : 1.1;
      if (e.dashed) ctx.setLineDash([3, 3]);
      const [hx, hy, ha] = partialPolyline(ctx, edgePoints(e), u);
      ctx.restore();
      ctx.globalAlpha = exist;
      if (u >= 0.98) arrowHead(ctx, hx, hy, ha, fs * 0.55, col);
      if (e.label) {
        const la = e.guard ? (guardFlight(gk) >= 1 ? 1 : 0) : span(m, 0.88, 1);
        if (la > 0) {
          const [lx, ly, al] = labelPos(e);
          ctx.globalAlpha = la * exist;
          ctx.font = mono(fs * 0.88);
          text(ctx, e.label, lx, ly, picked > 0.5 ? pal.accent : e.guard ? pal.warn : pal.faint, al);
          if (picked > 0) {
            ctx.globalAlpha = picked * la;
            ctx.font = mono(fs * 0.78);
            if (narrow) {
              text(ctx, "made from", lx, ly - fs * 2.25, pal.accent, "center");
              text(ctx, "Retry ×3 · Fallback · Sequence", lx, ly - fs * 1.2, pal.accent, "center");
            } else {
              text(ctx, "made from Retry ×3 · Fallback · Sequence", lx, ly - fs * 1.25, pal.accent, "center");
            }
          }
        }
      }
      ctx.globalAlpha = 1;
    });

    // terminal
    const da = span(m, 0.75, 0.95);
    if (da > 0) {
      const [dx, dy] = gp(DONE.x, DONE.y);
      ctx.globalAlpha = da;
      ctx.beginPath();
      ctx.arc(dx, dy, fs * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = pal.ok;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.font = mono(fs * 0.9);
      text(ctx, "done", dx + fs * 0.9, dy, pal.ok);
      ctx.globalAlpha = 1;
    }

    // the gap: FlyHome has no failure path
    const ga = gapA();
    if (ga > 0) {
      const b = gb.FH;
      const y = b.y + b.h / 2;
      const len = Math.min(graph.w * 0.16, fs * 6);
      const gu = easeInOut(span(t, T.gap, T.gap + 0.5));
      ctx.save();
      ctx.globalAlpha = ga;
      ctx.setLineDash([2, 3]);
      ctx.strokeStyle = pal.fail;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(b.x, y);
      ctx.lineTo(b.x - len * gu, y);
      ctx.stroke();
      ctx.restore();
      ctx.globalAlpha = ga * span(t, T.gap + 0.3, T.gap + 0.7);
      ctx.font = mono(fs);
      text(ctx, "?", b.x - len - fs * 0.6, y, pal.fail, "center");
      ctx.font = mono(fs * 0.8);
      text(ctx, "no failure path", b.x - fs * 0.4, y - fs * 1.1, pal.fail, "right");
      ctx.globalAlpha = 1;
    }

    // the score of the whole mission (graph only)
    const ma = span(m, 0.9, 1) * span(t, T.gap, T.gap + 0.4);
    if (ma > 0) {
      const v = Math.round(lerp(72, 91, easeInOut(span(t, T.rescore, T.rescore + 1.1))));
      const col = v >= 85 ? pal.ok : pal.warn;
      ctx.globalAlpha = ma;
      ctx.font = mono(fs * 1.0, 600);
      text(ctx, `mission ${v} / 100`, w - fs * 1.1, h - fs * 1.1, col, "right");
      ctx.globalAlpha = 1;
    }
  }

  // --------------------------------------------------------------- actions

  /** Action boxes: tree nodes at m = 0, graph nodes at m = 1, flying between. */
  function drawActions() {
    const live = liveA();
    ACTIONS.forEach((id, j) => {
      const u = easeInOut(span(m, 0.1 + 0.05 * j, 0.7 + 0.05 * j));
      const inTree = presence(id);
      const inGraph = id === "FS" ? edit : 1;
      const a = lerp(inTree, inGraph, u);
      if (a <= 0.01) return;
      const tr = treeRect(id);
      const g = gb[id];
      const cx = lerp(tr.x + tr.w / 2, g.x + g.w / 2, u);
      const cy = lerp(tr.y + tr.h / 2, g.y + g.h / 2, u) - Math.sin(Math.PI * u) * fs * 1.4;
      const bw = lerp(tr.w, g.w, u);
      const bh = lerp(tr.h, g.h, u);
      const f = lerp(tf, fs, u);
      const x = cx - bw / 2;
      const y = cy - bh / 2;
      const s = statusAt(id, t);
      const sa = s ? live * (1 - u) : 0;

      ctx.globalAlpha = a;
      if (id === "FH") {
        const ga = gapA() * u;
        if (ga > 0) {
          const pulse = 0.16 + 0.14 * Math.sin((t - T.gap) * 4);
          box(ctx, x - 4, y - 4, bw + 8, bh + 8, rgba(pal.fail, pulse * ga), "transparent", 0);
        }
      }
      if (s === "run" && sa > 0) {
        box(ctx, x - 3, y - 3, bw + 6, bh + 6, rgba(pal.warn, (0.12 + 0.12 * Math.sin(t * 6)) * sa), "transparent", 0);
      }
      box(ctx, x, y, bw, bh, pal.raised, "transparent", 0);
      const base = rgba(pal.accent, lerp(0.55, 1, u));
      box(ctx, x, y, bw, bh, rgba(pal.accent, 0.1), base, 1.1);
      if (s && sa > 0) box(ctx, x, y, bw, bh, rgba(statusCol(s), 0.14 * sa), rgba(statusCol(s), sa), 1.1);
      glyph("act", x + f * 0.85, cy, f * 0.34, 1 - u);
      ctx.font = mono(f);
      text(ctx, NODES[id].label, x + lerp(f * 1.55, f * 0.7, u), cy, pal.heading);

      // risk, inside the box: a bar along the bottom edge, the % on the right
      const rv = riskVis(id);
      if (rv > 0) {
        const r = riskOf(id);
        const rc = riskCol(r);
        const bx0 = x + 2;
        const bx1 = x + bw - 2;
        const by = y + bh - 1.4;
        ctx.globalAlpha = a * rv;
        ctx.strokeStyle = rgba(pal.faint, 0.35);
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(bx0, by);
        ctx.lineTo(bx1, by);
        ctx.stroke();
        ctx.save();
        if (id === "FS") ctx.setLineDash([2, 2]);
        ctx.strokeStyle = rc;
        ctx.beginPath();
        ctx.moveTo(bx0, by);
        ctx.lineTo(bx0 + (bx1 - bx0) * Math.min(1, r / 50) * rv, by);
        ctx.stroke();
        ctx.restore();
        if (!narrow) {
          ctx.font = mono(f * 0.8);
          text(ctx, `${id === "FS" ? "~" : ""}${Math.round(r)}%`, x + bw - f * 0.4, cy - bh * 0.06, rc, "right");
        }
      }
      ctx.globalAlpha = a * (1 - u);
      ring({ x, y, w: bw, h: bh }, ringOf(id), 3);
      ctx.globalAlpha = 1;
    });
  }

  /** Guard labels fly from their condition or decorator node onto their arrow. */
  function drawGuardFlights() {
    for (const e of EDGES) {
      if (!e.guard || !e.label) continue;
      const g = guardFlight(GUARD_INDEX.get(e)!);
      if (g <= 0 || g >= 1) continue;
      const src = treePos(e.guard);
      const [lx, ly] = labelPos(e);
      ctx.globalAlpha = span(g, 0, 0.15);
      ctx.font = mono(lerp(tf * 0.9, fs * 0.88, g));
      text(ctx, e.label, lerp(src.x, lx, g), lerp(src.y, ly, g) - Math.sin(Math.PI * g) * fs, pal.warn, "center");
    }
    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------- port card

  type Cell = { s: string; key?: boolean };
  interface Port {
    dir: "in" | "out";
    name: string;
    bound: Cell;
    now: string;
  }
  interface CardState {
    node: string;
    tag: string;
    tagCol: string;
    since: number;
    ports: Port[];
    /** Editable row and what's being typed into it. */
    field?: { row: number; click: number; type: number; old: string; typed: string };
    live: boolean;
    /** When this run of cards began: the frame fades in once, the content on each switch. */
    frameSince: number;
    note?: [string, string];
  }

  function cardState(): CardState | null {
    if (t >= 1.75 && t < 4.6) {
      const eta = Math.max(0, 46 - Math.floor(t - 1.75));
      return {
        node: "GZ",
        tag: WORD[statusAt("GZ", t) ?? "run"],
        tagCol: statusCol(statusAt("GZ", t) ?? "run"),
        since: 1.75,
        frameSince: 1.75,
        live: true,
        ports: [
          { dir: "in", name: "zone", bound: { s: "{target}", key: true }, now: "zone_3" },
          { dir: "in", name: "speed", bound: { s: "6.5" }, now: "6.5" },
          { dir: "out", name: "eta_s", bound: { s: "{eta}", key: true }, now: String(eta) },
        ],
      };
    }
    if (t >= 4.6 && t < T.gap) {
      return {
        node: "sub",
        tag: "RUNNING",
        tagCol: pal.warn,
        since: 4.6,
        frameSince: 1.75,
        live: true,
        ports: [
          { dir: "in", name: "home", bound: { s: "{home_zone}", key: true }, now: "zone_1" },
          { dir: "out", name: "landed", bound: { s: "{landed}", key: true }, now: "false" },
        ],
      };
    }
    if (t >= T.edit && t < T.gzCard) {
      return {
        node: "FS",
        tag: "NEW",
        tagCol: pal.accent,
        since: T.edit,
        frameSince: T.edit,
        live: false,
        ports: [
          { dir: "in", name: "zone", bound: { s: "" }, now: "—" },
          { dir: "in", name: "speed", bound: { s: "4.0" }, now: "—" },
        ],
        field: { row: 0, click: 19.1, type: T.zoneType, old: "", typed: "{safe_zone}" },
        note: t > T.zoneType + 0.75 ? ["risk ~9% · estimated, no history yet", "from similar nodes and their ports"] : undefined,
      };
    }
    if (t >= T.gzCard && t < T.morph3 + MORPH) {
      return {
        node: "GZ",
        tag: "EDITING",
        tagCol: pal.accent,
        since: T.gzCard,
        frameSince: T.edit,
        live: false,
        ports: [
          { dir: "in", name: "zone", bound: { s: "{target}", key: true }, now: "—" },
          { dir: "in", name: "speed", bound: { s: "6.5" }, now: "—" },
          { dir: "out", name: "eta_s", bound: { s: "{eta}", key: true }, now: "—" },
        ],
        field: { row: 1, click: 22.1, type: T.speedType, old: "6.5", typed: "5.0" },
        note: t > T.riskDrop ? ["risk 27% → 18%", "the graph keeps its shape"] : undefined,
      };
    }
    return null;
  }

  /** Card geometry: row and column positions, from the card's top-left. */
  function cardRows() {
    const x = card.x;
    const pad = cf * 0.9;
    const title = card.y + cf * 1.5;
    const header = title + cf * 1.85;
    const row0 = header + cf * 1.6;
    const step = cf * 1.75;
    const rule = row0 + step * 2 + cf * 1.15;
    const foot1 = rule + cf * 1.3;
    const foot2 = foot1 + cf * 1.5;
    return {
      pad,
      title,
      header,
      row: (i: number) => row0 + step * i,
      rule,
      foot1,
      foot2,
      bottom: foot2 + cf * 1.0,
      arrowX: x + pad,
      portX: x + pad + cf * 1.4,
      boundX: x + card.w * 0.4,
      nowX: x + card.w * 0.77,
    };
  }

  function fieldRect(row: number): Rect {
    const g = cardRows();
    return { x: g.boundX - cf * 0.4, y: g.row(row) - cf * 0.82, w: card.w * 0.34, h: cf * 1.64 };
  }

  function drawCard() {
    const st = cardState();
    if (!st) return;
    const mf = 1 - span(m, 0, 0.3);
    const frameA = span(t, st.frameSince, st.frameSince + 0.3) * mf;
    const ca = span(t, st.since, st.since + 0.3) * mf;
    if (frameA <= 0) return;
    const g = cardRows();
    ctx.globalAlpha = frameA;
    box(ctx, card.x, card.y, card.w, card.h, rgba(pal.bg, 0.55), pal.line);
    ctx.globalAlpha = ca;

    // title: node · tag
    ctx.font = mono(cf, 600);
    const name = NODES[st.node].label;
    text(ctx, name, g.arrowX, g.title, pal.heading);
    const nw = measure(name, cf) + cf * 0.1;
    ctx.font = mono(cf * 0.85);
    text(ctx, `· ${st.tag}`, g.arrowX + nw + cf * 0.5, g.title, st.tagCol);

    // columns
    ctx.font = mono(cf * 0.78);
    text(ctx, "port", g.portX, g.header, pal.faint);
    text(ctx, "bound to", g.boundX, g.header, pal.faint);
    text(ctx, "now", g.nowX, g.header, pal.faint);

    st.ports.forEach((p, i) => {
      const y = g.row(i);
      ctx.font = mono(cf * 0.9);
      text(ctx, p.dir === "in" ? "→" : "←", g.arrowX, y, pal.faint);
      text(ctx, p.name, g.portX, y, pal.body);
      let bound = p.bound;
      const f = st.field && st.field.row === i ? st.field : null;
      if (f) {
        const clicked = span(t, f.click + 0.15, f.click + 0.3);
        if (clicked > 0) {
          const r = fieldRect(i);
          ctx.globalAlpha = ca * clicked;
          ctx.beginPath();
          ctx.roundRect(r.x, r.y, r.w, r.h, 3);
          ctx.strokeStyle = pal.accent;
          ctx.lineWidth = 1.2;
          ctx.stroke();
          ctx.globalAlpha = ca;
        }
        const chars = Math.max(0, Math.min(f.typed.length, Math.floor((t - f.type) / 0.07) + 1));
        const typed = t >= f.type ? f.typed.slice(0, chars) : f.old;
        bound = { s: typed, key: typed.startsWith("{") };
        // a blinking caret while typing, and a moment after
        const caretOn = t >= f.click + 0.2 && t < f.type + f.typed.length * 0.07 + 0.8 && Math.floor(t * 2.6) % 2 === 0;
        if (caretOn) {
          ctx.font = mono(cf * 0.9);
          const cx = g.boundX + measure(typed, cf * 0.9) + 1;
          ctx.fillStyle = pal.accent;
          ctx.fillRect(cx, y - cf * 0.55, 1.2, cf * 1.1);
        }
      }
      ctx.font = mono(cf * 0.9);
      if (bound.s) text(ctx, bound.s, g.boundX, y, bound.key ? pal.accent : pal.muted);
      text(ctx, p.now, g.nowX, y, p.now === "—" ? pal.faint : pal.body);
    });

    // the rule, then the footer
    ctx.globalAlpha = ca;
    ctx.strokeStyle = rgba(pal.line, 1);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(card.x + g.pad * 0.6, g.rule);
    ctx.lineTo(card.x + card.w - g.pad * 0.6, g.rule);
    ctx.stroke();

    ctx.font = mono(cf * 0.8);
    if (st.live) {
      const beat = 1 - (t % 1);
      ctx.beginPath();
      ctx.arc(g.arrowX + cf * 0.3, g.foot1, cf * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = rgba(pal.accent, 0.3 + 0.7 * beat * beat);
      ctx.fill();
      text(ctx, "snapshot · 1 Hz", g.arrowX + cf * 1.0, g.foot1, pal.faint);
      // the last status change
      let last: [number, string, Status] | null = null;
      let prev: Status | null = null;
      for (const ev of EVENTS) if (ev[0] <= t && NODES[ev[1]].kind !== "cond") last = ev;
      if (last) {
        for (const ev of EVENTS) if (ev[1] === last[1] && ev[0] < last[0]) prev = ev[2];
        const lbl = NODES[last[1]].label;
        let x = g.arrowX;
        text(ctx, lbl, x, g.foot2, pal.body);
        x += measure(lbl, cf * 0.8) + cf * 0.9;
        const from = prev ? WORD[prev] : "IDLE";
        text(ctx, from, x, g.foot2, prev ? statusCol(prev) : pal.faint);
        x += measure(from, cf * 0.8);
        text(ctx, " → ", x, g.foot2, pal.faint);
        x += measure(" → ", cf * 0.8);
        text(ctx, WORD[last[2]], x, g.foot2, statusCol(last[2]));
      }
    } else if (st.note) {
      const na = span(t, st.node === "FS" ? T.zoneType + 0.75 : T.riskDrop, (st.node === "FS" ? T.zoneType + 0.75 : T.riskDrop) + 0.3);
      ctx.globalAlpha = ca * na;
      if (st.node === "GZ") {
        let x = g.arrowX;
        text(ctx, "risk ", x, g.foot1, pal.muted);
        x += measure("risk ", cf * 0.8);
        text(ctx, "27%", x, g.foot1, pal.warn);
        x += measure("27%", cf * 0.8);
        text(ctx, " → ", x, g.foot1, pal.faint);
        x += measure(" → ", cf * 0.8);
        text(ctx, "18%", x, g.foot1, pal.ok);
      } else {
        let x = g.arrowX;
        text(ctx, "risk ", x, g.foot1, pal.muted);
        x += measure("risk ", cf * 0.8);
        text(ctx, "~9%", x, g.foot1, pal.ok);
        x += measure("~9%", cf * 0.8);
        text(ctx, " · estimated, no history yet", x, g.foot1, pal.muted);
      }
      text(ctx, st.note[1], g.arrowX, g.foot2, pal.faint);
    }
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------- pointer

  interface Stop {
    at: () => Pt;
    click: number;
  }
  const pillCenter = (k: "tree" | "graph") => (): Pt => ({
    x: pills[k].x + pills[k].w / 2,
    y: pills[k].y + pills[k].h / 2,
  });
  const STOPS: Stop[] = [
    { at: pillCenter("graph"), click: 7.5 },
    {
      at: () => {
        const [x, y] = labelPos(EDGES.find((e) => e.pick)!);
        return { x: x + fs * 1.2, y: y + fs * 0.45 };
      },
      click: 13.1,
    },
    { at: pillCenter("tree"), click: 14.9 },
    { at: () => treePos("FH"), click: 17.6 },
    { at: () => centerOf(fieldRect(0)), click: 19.1 },
    { at: () => treePos("GZ"), click: 20.6 },
    { at: () => centerOf(fieldRect(1)), click: 22.1 },
    { at: pillCenter("graph"), click: 24.4 },
  ];

  /** Visible around the first switch, then from the arrow pick through the second switch. */
  const pointerVis = () =>
    span(t, 6.75, 7.0) * (1 - span(t, 7.95, 8.25)) + span(t, 12.2, 12.45) * (1 - span(t, 24.85, 25.15));

  function pointerAt(): { p: Pt; press: number } {
    const first = STOPS[0].at();
    let prev: Pt = { x: Math.min(w - fs * 2, first.x + w * 0.12), y: Math.min(h - fs * 2, first.y + h * 0.3) };
    let depart = -Infinity;
    let press = 1;
    for (let i = 0; i < STOPS.length; i++) {
      const s = STOPS[i];
      const tgt = s.at();
      const dur = clamp(Math.hypot(tgt.x - prev.x, tgt.y - prev.y) / (0.9 * w), 0.45, 1.0);
      const start = Math.max(depart, s.click - 0.35 - dur);
      if (t < start) return { p: prev, press };
      if (t < start + dur) {
        const e = easeInOut((t - start) / dur);
        return { p: { x: lerp(prev.x, tgt.x, e), y: lerp(prev.y, tgt.y, e) }, press };
      }
      if (t >= s.click && t < s.click + 0.2) press = t < s.click + 0.12 ? 0.85 : lerp(0.85, 1, span(t, s.click + 0.12, s.click + 0.2));
      if (t < s.click + 0.45 || i === STOPS.length - 1) return { p: tgt, press };
      prev = tgt;
      depart = s.click + 0.45;
      press = 1;
    }
    return { p: prev, press };
  }

  function drawPointer() {
    const vis = pointerVis();
    if (vis <= 0) return;
    const { p, press } = pointerAt();
    // ripples where clicks land
    for (const s of STOPS) {
      const u = span(t, s.click, s.click + 0.55);
      if (u <= 0 || u >= 1) continue;
      const c = s.at();
      ctx.beginPath();
      ctx.arc(c.x, c.y, fs * (0.4 + 2.0 * u), 0, Math.PI * 2);
      ctx.strokeStyle = rgba(pal.accent, 0.7 * (1 - u) * vis);
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    const k = (fs / 11) * press;
    ctx.save();
    ctx.globalAlpha = vis;
    ctx.translate(p.x, p.y);
    ctx.scale(k, k);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 16);
    ctx.lineTo(4.2, 12.4);
    ctx.lineTo(7, 18.6);
    ctx.lineTo(9.6, 17.4);
    ctx.lineTo(6.8, 11.4);
    ctx.lineTo(11.8, 11.4);
    ctx.closePath();
    ctx.fillStyle = pal.heading;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = pal.bg;
    ctx.stroke();
    ctx.restore();
  }

  // ------------------------------------------------------------------ frame

  function frame(dt: number) {
    t += dt;
    if (t >= PERIOD) t -= PERIOD;
    m = morphAt(t);
    flat = easeInOut(span(t, T.open, T.open + 0.9));
    edit = easeInOut(span(t, T.edit, T.edit + 0.8));
    wts = [1 - flat, flat * (1 - edit), flat * edit];

    ctx.clearRect(0, 0, w, h);
    drawSwitch();
    drawGraph();
    drawLinks();
    drawTreeNodes();
    drawRemap();
    drawActions();
    drawGuardFlights();
    drawCard();
    drawPointer();

    const fade = span(t, 0, 0.35) * (1 - span(t, T.out, T.out + 0.6));
    if (fade < 1) {
      ctx.fillStyle = rgba(pal.raised, clamp(1 - fade));
      ctx.fillRect(0, 0, w, h);
    }
  }

  return { resize, frame, poster: 28 };
}
