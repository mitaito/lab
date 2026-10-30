import type { Product, ProductPreview, ProductStatus } from "@/lib/content";
import type { Theme } from "./use-theme";

/** The full-window 3D view. Turning on 3D mode navigates here. */
export const CONSTELLATION_PATH = "/3d";

/**
 * The 3D constellation needs a desktop-sized window. This is Tailwind's `lg`
 * (64rem), so the switch (`lg:` classes) and the JavaScript gate agree.
 */
export const CONSTELLATION_MIN_WIDTH = "(min-width: 64rem)";

/** What the 3D scene needs from a product: a serializable subset. */
export interface Satellite {
  slug: string;
  /** Short label drawn on the satellite's badge. */
  name: string;
  /** The product's full name, for its hover card. */
  title: string;
  /** The experiment id, or `SAT-03` when the product has none. */
  tag: string;
  /** Topic line under the tag, e.g. `GAME THEORY`. */
  topic: string;
  /** What the hover card says about it. */
  summary: string;
  status: ProductStatus;
  /** Newest release, or null before the first one. */
  version: string | null;
  metric: string;
  preview: ProductPreview;
  orbitRadius: number;
  /** Inclination of the orbit plane, as a fraction of its radius. */
  tilt: number;
}

const FIRST_ORBIT = 5.6;
const ORBIT_STEP = 2;
/** Alternates above and below the equator so orbits do not overlap. */
const TILTS = [0.18, -0.25, 0.35, -0.15, 0.28, -0.32] as const;
/** Angular speed constant, see `orbitSpeed`. */
const KEPLER = 7;

/**
 * One accent per craft model. A `Record` over every preview kind, so adding a
 * kind in the content schema fails the type-check until it has a colour here.
 */
export const CRAFT_COLORS: Record<ProductPreview, number> = {
  gomoku: 0x10b981,
  waveform: 0x34d399,
  agents: 0x818cf8,
  force: 0x60a5fa,
  lenia: 0xa78bfa,
  crdt: 0x38bdf8,
};

/** What the central nucleus stands for: the lab itself. */
export interface LabInfo {
  name: string;
  summary: string;
  products: number;
  releases: number;
}

/** Radius of the nucleus's wireframe shell, in scene units. */
export const NUCLEUS_RADIUS = 2.4;
/** A satellite counts as hovered within this many CSS px of the pointer. */
export const SATELLITE_HIT_RADIUS = 56;

export interface Point {
  x: number;
  y: number;
}

/** What the pointer is over: a satellite (by its index) or the nucleus. */
export type HoverTarget = { kind: "satellite"; index: number } | { kind: "lab" };

export function sameTarget(
  a: HoverTarget | null,
  b: HoverTarget | null,
): boolean {
  if (a === null || b === null) return a === b;
  if (a.kind === "lab" || b.kind === "lab") return a.kind === b.kind;
  return a.index === b.index;
}

/**
 * What the pointer is over, given where everything is on screen (CSS px).
 * The nearest satellite within SATELLITE_HIT_RADIUS wins, even where it
 * overlaps the nucleus; otherwise the nucleus, within its own on-screen radius.
 */
export function pickTarget(
  pointer: Point,
  satellites: readonly Point[],
  nucleus: Point & { radius: number },
): HoverTarget | null {
  let nearest = SATELLITE_HIT_RADIUS;
  let index = -1;
  for (let i = 0; i < satellites.length; i++) {
    const distance = Math.hypot(satellites[i].x - pointer.x, satellites[i].y - pointer.y);
    if (distance < nearest) {
      nearest = distance;
      index = i;
    }
  }
  if (index >= 0) return { kind: "satellite", index };

  const fromNucleus = Math.hypot(nucleus.x - pointer.x, nucleus.y - pointer.y);
  return fromNucleus < nucleus.radius ? { kind: "lab" } : null;
}

/**
 * Where to put a hover card (its top-left corner) so it sits beside the
 * pointer but never leaves the window: it flips to the other side of the
 * pointer when it would overflow, and is clamped at the top-left.
 */
export function placeTooltip(
  pointer: Point,
  card: { width: number; height: number },
  bounds: { width: number; height: number },
  gap = 16,
): Point {
  let x = pointer.x + gap;
  let y = pointer.y + gap;
  if (x + card.width > bounds.width) x = pointer.x - gap - card.width;
  if (y + card.height > bounds.height) y = pointer.y - gap - card.height;
  return { x: Math.max(0, x), y: Math.max(0, y) };
}

/**
 * The same accents for a light page. The dark-theme ones are pale and glow on
 * a dark ground but all but vanish on a light one, so these are the deeper
 * (Tailwind 600-ish) shades. Also a `Record` over every preview kind.
 */
export const CRAFT_COLORS_LIGHT: Record<ProductPreview, number> = {
  gomoku: 0x059669,
  waveform: 0x0d9488,
  agents: 0x4f46e5,
  force: 0x2563eb,
  lenia: 0x7c3aed,
  crdt: 0x0284c7,
};

/** The accent of a craft kind for the given theme. */
export function craftColor(preview: ProductPreview, theme: Theme): number {
  return (theme === "light" ? CRAFT_COLORS_LIGHT : CRAFT_COLORS)[preview];
}

/**
 * Everything in the scene that is not a craft accent, per theme. The scene is
 * drawn on a transparent canvas over the page, so what reads well on the dark
 * page (pale, thin, translucent) nearly disappears on the light one; the light
 * set is deeper and more opaque. src/lib/constellation.test.ts checks both
 * against the real page background.
 */
export interface ScenePalette {
  /** Orbit lines are drawn at this opacity in their craft's accent. */
  orbitOpacity: number;
  /** The nucleus's wireframe shell and the crystal inside it. */
  shell: number;
  shellOpacity: number;
  crystal: number;
  crystalEmissive: number;
  crystalEmissiveIntensity: number;
  /** The background star field: two colours, drawn at one opacity and size. */
  starGreen: number;
  starIndigo: number;
  starOpacity: number;
  starSize: number;
  /** The marker above each satellite. */
  beacon: number;
  /** How opaque the dark name plate above each satellite is drawn. */
  badgeOpacity: number;
  /** Secondary parts of a craft mix their accent toward this colour. */
  toneTarget: number;
  toneAmount: number;
}

export const SCENE_PALETTES: Record<Theme, ScenePalette> = {
  dark: {
    orbitOpacity: 0.25,
    shell: 0x059669,
    shellOpacity: 0.6,
    crystal: 0x10b981,
    crystalEmissive: 0x065f46,
    crystalEmissiveIntensity: 0.8,
    starGreen: 0x10b981,
    starIndigo: 0x818cf8,
    starOpacity: 0.75,
    starSize: 0.09,
    beacon: 0xffffff,
    badgeOpacity: 0.92,
    toneTarget: 0xffffff,
    toneAmount: 0.5,
  },
  light: {
    orbitOpacity: 0.55,
    shell: 0x047857,
    shellOpacity: 0.85,
    crystal: 0x059669,
    crystalEmissive: 0x064e3b,
    crystalEmissiveIntensity: 0.5,
    starGreen: 0x047857,
    starIndigo: 0x4f46e5,
    starOpacity: 0.8,
    starSize: 0.12,
    beacon: 0x0f172a,
    // Fully opaque: a translucent dark plate over a light page turns grey.
    badgeOpacity: 1,
    toneTarget: 0x0f172a,
    toneAmount: 0.4,
  },
};

/** Products in directory order, each on its own orbit around the nucleus. */
export function toSatellites(products: readonly Product[]): Satellite[] {
  return [...products]
    .sort((a, b) => a.order - b.order)
    .map((product, index) => ({
      slug: product.slug,
      name: product.shortName,
      title: product.name,
      tag:
        product.experiment?.id ?? `SAT-${String(index + 1).padStart(2, "0")}`,
      topic: product.tags[0].toUpperCase(),
      summary: product.summary,
      status: product.status,
      version: product.version,
      metric: product.metric,
      preview: product.preview,
      orbitRadius: FIRST_ORBIT + index * ORBIT_STEP,
      tilt: TILTS[index % TILTS.length],
    }));
}

/** Point on a tilted circular orbit; `angle` is in radians. */
export function orbitPosition(
  radius: number,
  tilt: number,
  angle: number,
): [x: number, y: number, z: number] {
  return [
    Math.cos(angle) * radius,
    Math.sin(angle) * radius * tilt,
    Math.sin(angle) * radius,
  ];
}

/** Narrow on purpose: a wide lens makes satellites near the camera balloon. */
export const FOV = 30;
/** The camera sits this much higher than it is far from the nucleus. */
export const CAMERA_RISE = 1 / 3;
const MIN_DISTANCE = 46;
/** Room beyond the outer orbit, in scene units, for a satellite and its badge. */
const MARGIN = 3.4;

/**
 * How far the camera must be from the nucleus to keep the whole system in
 * view. Never closer than MIN_DISTANCE, and further back when the window is
 * narrow (the outer orbit must fit across it) or when `pitch` tips the view
 * toward top-down (the orbit's depth then fills the height).
 */
export function cameraDistance(
  aspect: number,
  pitch: number,
  outerRadius: number,
): number {
  const reach = Math.tan((FOV * Math.PI) / 360);
  const widthFit = (outerRadius + MARGIN) / (reach * aspect);
  const lookingDown = Math.min(
    Math.PI / 2,
    Math.abs(pitch + Math.atan(CAMERA_RISE)),
  );
  // 0.85: leave a little of the height free for the HUD.
  const heightFit = (outerRadius * Math.sin(lookingDown)) / (0.85 * reach);
  return Math.max(MIN_DISTANCE, widthFit, heightFit);
}

/** The viewing angle of the whole system, in radians. */
export interface View {
  /** Turn about the vertical axis. Unbounded: the view can spin all the way round. */
  yaw: number;
  /** Tilt toward the camera. Kept within MIN_PITCH..MAX_PITCH so it never flips. */
  pitch: number;
}

/** The pitch the view starts at (and the old fixed one). */
export const BASE_PITCH = 0.28;
export const MIN_PITCH = -0.5;
export const MAX_PITCH = 1.25;
/** Radians turned per pixel dragged: a full window width is about a turn and a bit. */
export const DRAG_SPEED = 0.005;

/**
 * The view after the pointer moved by (`dx`, `dy`) pixels while dragging.
 * Dragging right brings the near side of the system to the right, and
 * dragging down brings it down, as if the system were held by its front.
 */
export function dragView(view: View, dx: number, dy: number): View {
  return {
    yaw: view.yaw + dx * DRAG_SPEED,
    pitch: Math.min(MAX_PITCH, Math.max(MIN_PITCH, view.pitch + dy * DRAG_SPEED)),
  };
}

/** Radians per second. Kepler's third law: outer orbits are slower. */
export function orbitSpeed(radius: number): number {
  return KEPLER / radius ** 1.5;
}
