/**
 * Shared kit for the "Built for Companies" canvas scenes: the palette (read
 * from the site's CSS tokens so the scenes follow the theme), small drawing
 * helpers, and the Scene contract the runner drives.
 */

export interface Palette {
  bg: string;
  raised: string;
  line: string;
  faint: string;
  muted: string;
  body: string;
  heading: string;
  accent: string;
  /** Status colours — not site tokens, tuned to sit beside the iris accent. */
  ok: string;
  warn: string;
  fail: string;
}

export function readPalette(): Palette {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  return {
    bg: v("--color-bg", "#12141b"),
    raised: v("--color-bg-raised", "#1a1d26"),
    line: v("--color-line", "#2c3040"),
    faint: v("--color-faint", "#616779"),
    muted: v("--color-muted", "#858b9c"),
    body: v("--color-body", "#aeb3c2"),
    heading: v("--color-heading", "#e8eaf0"),
    accent: v("--color-accent", "#8b95f0"),
    ok: "#7ccfa6",
    warn: "#e3c07a",
    fail: "#ef806f",
  };
}

/** A scene draws into a 2D context sized in CSS pixels; the runner owns DPR. */
export interface Scene {
  resize(w: number, h: number): void;
  /** Advance by dt seconds and draw. */
  frame(dt: number): void;
  /** Seconds of simulated time that land on a representative still frame. */
  poster: number;
}

export type SceneFactory = (ctx: CanvasRenderingContext2D, pal: Palette) => Scene;

export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
/** Progress of `t` through the window [a, b], clamped to 0..1. */
export const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

/** `#rrggbb` + alpha → rgba() string. */
export function rgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${clamp(a)})`;
}

export function mono(size: number, weight = 400) {
  return `${weight} ${size}px "JetBrains Mono", ui-monospace, monospace`;
}

/** Font size that scales with the stage but stays legible on a phone. */
export const fontFor = (w: number) => clamp(w / 72, 8, 12);

export function box(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  fill: string,
  stroke: string,
  lw = 1,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 3);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = lw;
  ctx.strokeStyle = stroke;
  ctx.stroke();
}

export function text(
  ctx: CanvasRenderingContext2D,
  s: string,
  x: number,
  y: number,
  color: string,
  align: CanvasTextAlign = "left",
) {
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillText(s, x, y);
}

/** Draw an arrowhead at (x, y) pointing along angle `a`. */
export function arrowHead(ctx: CanvasRenderingContext2D, x: number, y: number, a: number, size: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, size * 0.55);
  ctx.lineTo(-size, -size * 0.55);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
}

/** Stroke a polyline up to fraction `u` of its length; returns the head point. */
export function partialPolyline(
  ctx: CanvasRenderingContext2D,
  pts: [number, number][],
  u: number,
): [number, number, number] {
  const segs: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    segs.push(l);
    total += l;
  }
  let left = total * clamp(u);
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  let head: [number, number, number] = [pts[0][0], pts[0][1], 0];
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    const a = Math.atan2(y1 - y0, x1 - x0);
    if (left >= segs[i - 1]) {
      ctx.lineTo(x1, y1);
      left -= segs[i - 1];
      head = [x1, y1, a];
    } else {
      const f = segs[i - 1] ? left / segs[i - 1] : 0;
      const hx = lerp(x0, x1, f);
      const hy = lerp(y0, y1, f);
      ctx.lineTo(hx, hy);
      head = [hx, hy, a];
      break;
    }
  }
  ctx.stroke();
  return head;
}
