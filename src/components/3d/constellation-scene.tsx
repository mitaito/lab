"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AmbientLight,
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  Color,
  CylinderGeometry,
  DirectionalLight,
  DodecahedronGeometry,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  Line,
  LinearFilter,
  LineBasicMaterial,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type Object3D,
  OctahedronGeometry,
  PerspectiveCamera,
  PointLight,
  Points,
  PointsMaterial,
  REVISION,
  Scene,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  type Texture,
  Timer,
  TorusGeometry,
  Vector3,
  Vector2,
  WebGLRenderer,
} from "three";
import {
  BASE_PITCH,
  CAMERA_RISE,
  cameraDistance,
  CRAFT_COLORS,
  craftColor,
  dragView,
  FOV,
  type HoverTarget,
  type LabInfo,
  NUCLEUS_RADIUS,
  orbitPosition,
  orbitSpeed,
  pickTarget,
  placeTooltip,
  type Point,
  sameTarget,
  type Satellite,
  SCENE_PALETTES,
  type ScenePalette,
  type View,
} from "@/lib/constellation";
import type { ProductPreview } from "@/lib/content";
import { useMediaQuery } from "@/lib/use-media-query";
import { type Theme, useTheme } from "@/lib/use-theme";
import { ConstellationSwitch } from "./constellation-switch";
import { Icon } from "@/components/ui/icon";
import { HUD_CHIP } from "./switch-chip";
import { ThemeSwitchChip } from "./theme-switch-chip";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** Badge texture size; its 3.2:1 ratio matches the sprite scale below. */
const BADGE = { width: 640, height: 200 } as const;
const BADGE_SCALE = new Vector2(4.4, 1.375);
/** Crafts are modelled about one unit across; scaled up to read from the camera. */
const CRAFT_SCALE = 1.8;
/**
 * How far moving the pointer across the whole window tilts the view, each
 * way, in radians. Deliberately small: it is a hint of depth, and the view is
 * turned by dragging instead.
 */
const PARALLAX_YAW = 0.12;
const PARALLAX_PITCH = 0.06;
/** Per second; lower is slower to follow the pointer. */
const PARALLAX_EASE = 2;
/** Slow turn of the whole system when nobody is dragging, radians per second. */
const AUTO_SPIN = 0.04;

const noopSubscribe = () => () => {};

/** A packed 0xRRGGBB number as a CSS colour. */
const cssColor = (hex: number) => `#${hex.toString(16).padStart(6, "0")}`;

let webgl2: boolean | undefined;

/**
 * Three.js (r163 and later) needs WebGL 2. Some environments have none,
 * including crawlers (Google documents that Googlebot has no WebGL), so the
 * panel degrades to text instead of throwing. Probed once, then cached.
 */
function supportsWebGL2(): boolean {
  webgl2 ??= (() => {
    try {
      const gl = document.createElement("canvas").getContext("webgl2");
      gl?.getExtension("WEBGL_lose_context")?.loseContext();
      return gl !== null;
    } catch {
      return false;
    }
  })();
  return webgl2;
}

/** Small deterministic PRNG: the star field is the same on every mount. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A second shade of an accent, for the secondary parts of a craft: paler on a
 * dark page, deeper on a light one, so it stands out from the page either way.
 */
const toneOf = (accent: number, palette: ScenePalette): number =>
  new Color(accent)
    .lerp(new Color(palette.toneTarget), palette.toneAmount)
    .getHex();

const basic = (color: number | Color, wireframe = false) =>
  new MeshBasicMaterial({ color, wireframe });

/**
 * A small model per product, keyed by its `preview` kind, drawn in its
 * `accent` and a second `tone` of it. The `Record` makes the compiler flag a
 * new kind that has no model.
 */
const CRAFTS: Record<ProductPreview, (accent: number, tone: number) => Group> = {
  gomoku(accent) {
    const craft = new Group();
    const board = new Mesh(
      new BoxGeometry(1.2, 0.2, 1.2),
      new MeshStandardMaterial({ color: 0x18181b, roughness: 0.4 }),
    );
    const stone = new CylinderGeometry(0.18, 0.18, 0.1, 16);
    const black = new Mesh(stone, basic(accent));
    black.position.set(0.3, 0.15, 0.3);
    const white = new Mesh(stone, basic(0xffffff));
    white.position.set(-0.25, 0.15, -0.2);
    craft.add(board, black, white);
    return craft;
  },
  waveform(accent) {
    const craft = new Group();
    const rod = new CylinderGeometry(0.06, 0.06, 1.1, 8);
    for (let i = -3; i <= 3; i++) {
      const bar = new Mesh(
        rod,
        new MeshStandardMaterial({ color: accent, emissive: 0x065f46 }),
      );
      bar.scale.y = Math.cos(i * 0.4) * 0.9 + 0.3;
      bar.position.x = i * 0.22;
      craft.add(bar);
    }
    return craft;
  },
  agents(accent) {
    const craft = new Group();
    const body = new OctahedronGeometry(0.38, 0);
    for (let i = 0; i < 3; i++) {
      const agent = new Mesh(
        body,
        new MeshStandardMaterial({
          color: accent,
          emissive: 0x312e81,
          metalness: 0.6,
        }),
      );
      const angle = (i / 3) * Math.PI * 2;
      agent.position.set(
        Math.cos(angle) * 0.6,
        Math.sin(angle) * 0.3,
        Math.sin(angle) * 0.6,
      );
      craft.add(agent);
    }
    return craft;
  },
  force(accent, tone) {
    const craft = new Group();
    craft.add(
      new Mesh(new DodecahedronGeometry(0.7, 0), basic(accent, true)),
      new Mesh(new SphereGeometry(0.3, 8, 8), basic(tone)),
    );
    return craft;
  },
  lenia(accent, tone) {
    const craft = new Group();
    craft.add(
      new Mesh(new TorusGeometry(0.7, 0.05, 8, 32), basic(accent)),
      new Mesh(new TorusGeometry(0.45, 0.05, 8, 24), basic(tone)),
    );
    return craft;
  },
  crdt(accent) {
    const craft = new Group();
    const peer = new BoxGeometry(0.5, 0.5, 0.5);
    const left = new Mesh(peer, basic(accent, true));
    left.position.x = -0.55;
    const right = new Mesh(peer, basic(accent, true));
    right.position.x = 0.55;
    const link = new Mesh(new CylinderGeometry(0.04, 0.04, 1.1), basic(accent));
    link.rotation.z = Math.PI / 2;
    craft.add(left, right, link);
    return craft;
  },
};

/** HUD-style name plate drawn on a canvas and shown as a camera-facing sprite. */
function createBadge(
  satellite: Satellite,
  fonts: { sans: string; mono: string },
  palette: ScenePalette,
): Sprite {
  const canvas = document.createElement("canvas");
  canvas.width = BADGE.width;
  canvas.height = BADGE.height;
  const ctx = canvas.getContext("2d");
  const accent = cssColor(CRAFT_COLORS[satellite.preview]);

  if (ctx) {
    const maxText = BADGE.width - 80;
    /** Largest font size, down from `size`, at which `text` still fits. */
    const fit = (text: string, weight: string, size: number, family: string) => {
      for (let px = size; px > 12; px -= 2) {
        ctx.font = `${weight} ${px}px ${family}`;
        if (ctx.measureText(text).width <= maxText) break;
      }
    };

    ctx.fillStyle = "rgba(10, 11, 16, 0.88)";
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(5, 5, BADGE.width - 10, BADGE.height - 10, 30);
    } else {
      ctx.rect(5, 5, BADGE.width - 10, BADGE.height - 10);
    }
    ctx.fill();
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(46, 58, 11, 0, Math.PI * 2);
    ctx.fill();

    // Sized for the badge's small on-screen footprint: big, short strings.
    ctx.textBaseline = "alphabetic";
    fit(`${satellite.tag} // ${satellite.topic}`, "bold", 36, fonts.mono);
    ctx.fillStyle = accent;
    ctx.fillText(`${satellite.tag} // ${satellite.topic}`, 72, 70);

    fit(satellite.name, "600", 76, fonts.sans);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(satellite.name, 40, 150);
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearFilter;
  texture.generateMipmaps = false;

  const sprite = new Sprite(
    new SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: palette.badgeOpacity,
    }),
  );
  sprite.scale.set(BADGE_SCALE.x, BADGE_SCALE.y, 1);
  sprite.position.y = 3;
  return sprite;
}

function createOrbit(
  satellite: Satellite,
  theme: Theme,
  palette: ScenePalette,
): Line {
  const segments = 120;
  const points: Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const [x, y, z] = orbitPosition(
      satellite.orbitRadius,
      satellite.tilt,
      (i / segments) * Math.PI * 2,
    );
    points.push(new Vector3(x, y, z));
  }
  const line = new Line(
    new BufferGeometry().setFromPoints(points),
    new LineBasicMaterial({
      color: craftColor(satellite.preview, theme),
      transparent: true,
      opacity: palette.orbitOpacity,
      // A guide line must never hide what it passes behind (a badge's text):
      // it writes no depth, and is drawn before the badges.
      depthWrite: false,
    }),
  );
  line.renderOrder = -1;
  return line;
}

function createStars(palette: ScenePalette): Points {
  const count = 600;
  const random = mulberry32(186);
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const green = new Color(palette.starGreen);
  const indigo = new Color(palette.starIndigo);

  for (let i = 0; i < count; i++) {
    const r = 8 + random() * 22;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    positions[i * 3 + 2] = r * Math.cos(phi);
    (random() > 0.45 ? green : indigo).toArray(colors, i * 3);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  return new Points(
    geometry,
    new PointsMaterial({
      size: palette.starSize,
      vertexColors: true,
      transparent: true,
      opacity: palette.starOpacity,
    }),
  );
}

/** Frees the GPU buffers and textures behind every object under `root`. */
function disposeTree(root: Object3D) {
  root.traverse((object) => {
    if (
      object instanceof Mesh ||
      object instanceof Line ||
      object instanceof Points
    ) {
      object.geometry.dispose();
    }
    if (
      object instanceof Mesh ||
      object instanceof Line ||
      object instanceof Points ||
      object instanceof Sprite
    ) {
      const materials: Material[] = Array.isArray(object.material)
        ? object.material
        : [object.material];
      for (const material of materials) {
        (material as Material & { map?: Texture | null }).map?.dispose();
        material.dispose();
      }
    }
  });
}

interface Body {
  group: Group;
  craft: Group;
  beacon: Mesh<SphereGeometry, MeshBasicMaterial>;
  badge: Sprite;
  orbit: Line;
  kind: ProductPreview;
  radius: number;
  tilt: number;
  speed: number;
  angle: number;
  /** 0 to 1, eased toward 1 while the pointer is near. */
  hover: number;
}

interface SceneOptions {
  /** False for reduced motion: one still frame, redrawn on resize and drag. */
  animated: boolean;
  /** Picks the palette: the canvas is transparent, drawn over the page. */
  theme: Theme;
  onFps: (fps: number) => void;
  onHover: (target: HoverTarget | null) => void;
}

interface SceneHandle {
  /**
   * Recolours the scene for another theme in place, so the view you dragged
   * to and where each satellite is on its orbit are kept.
   */
  setTheme: (theme: Theme) => void;
  dispose: () => void;
}

/**
 * Builds the scene into `mount` and returns a handle to change its theme and
 * to tear it all down. Animated, it runs only while on screen; otherwise
 * (reduced motion) it draws a single still frame, and again on resize.
 */
function createConstellation(
  mount: HTMLElement,
  satellites: readonly Satellite[],
  { animated, theme: initialTheme, onFps, onHover }: SceneOptions,
): SceneHandle {
  let theme = initialTheme;
  let palette = SCENE_PALETTES[theme];
  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.className = "block size-full";
  mount.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 1000);

  const outerRadius = Math.max(...satellites.map((s) => s.orbitRadius));

  /**
   * Backs the camera off in narrower windows, and as the view tilts toward
   * top-down, so the outer orbit stays in view either way.
   */
  function frameCamera() {
    const distance = cameraDistance(camera.aspect, view.pitch, outerRadius);
    camera.position.set(0, distance * CAMERA_RISE, distance);
    // Without lookAt the camera stares straight down -z and the nucleus sinks
    // toward the bottom edge of the window.
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }

  scene.add(new AmbientLight(0xffffff, 1.4));
  const emerald = new DirectionalLight(0x10b981, 3);
  emerald.position.set(15, 20, 12);
  const indigo = new DirectionalLight(0x6366f1, 2.5);
  indigo.position.set(-15, -10, -10);
  const glow = new PointLight(0x34d399, 160, 0, 2);
  scene.add(emerald, indigo, glow);

  const system = new Group();
  scene.add(system);

  // Central nucleus: wireframe geodesic shell around a luminous crystal.
  const shellMaterial = new MeshBasicMaterial({
    color: palette.shell,
    wireframe: true,
    transparent: true,
    opacity: palette.shellOpacity,
  });
  const shell = new Mesh(
    new IcosahedronGeometry(NUCLEUS_RADIUS, 2),
    shellMaterial,
  );
  const crystalMaterial = new MeshStandardMaterial({
    color: palette.crystal,
    emissive: palette.crystalEmissive,
    emissiveIntensity: palette.crystalEmissiveIntensity,
    roughness: 0.2,
    metalness: 0.8,
  });
  const crystal = new Mesh(new OctahedronGeometry(1.4, 0), crystalMaterial);
  let stars = createStars(palette);
  system.add(shell, crystal, stars);

  const style = getComputedStyle(mount);
  const fonts = {
    sans:
      style.getPropertyValue("--font-geist-sans").trim() ||
      "system-ui, sans-serif",
    mono:
      style.getPropertyValue("--font-jetbrains-mono").trim() || "monospace",
  };

  /** A craft model in the current theme's accent and its second tone. */
  function makeCraft(kind: ProductPreview): Group {
    const accent = craftColor(kind, theme);
    const craft = CRAFTS[kind](accent, toneOf(accent, palette));
    craft.scale.setScalar(CRAFT_SCALE);
    return craft;
  }

  const bodies: Body[] = satellites.map((satellite, index) => {
    const group = new Group();
    const craft = makeCraft(satellite.preview);
    const beacon = new Mesh(
      new SphereGeometry(0.16, 12, 12),
      basic(palette.beacon),
    );
    beacon.position.y = 1.5;
    // The badge is a dark plate in both themes, so it keeps the bright accents.
    const badge = createBadge(satellite, fonts, palette);
    group.add(craft, beacon, badge);

    const orbit = createOrbit(satellite, theme, palette);
    system.add(orbit, group);

    return {
      group,
      craft,
      beacon,
      badge,
      orbit,
      kind: satellite.preview,
      radius: satellite.orbitRadius,
      tilt: satellite.tilt,
      speed: orbitSpeed(satellite.orbitRadius),
      angle: (index / satellites.length) * Math.PI * 2,
      hover: 0,
    };
  });

  const size = { width: 1, height: 1 };
  // `target*` is where the pointer is (-1..1); the others ease toward it.
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, px: -1e4, py: -1e4 };
  const projected = new Vector3();
  // The viewing angle, turned by dragging. `drag` is set while a button is held.
  let view: View = { yaw: 0, pitch: BASE_PITCH };
  let drag: { id: number; x: number; y: number } | undefined;

  // What the pointer is over. Reported to the hover card only when it changes,
  // so the page does not re-render every frame.
  let reported: HoverTarget | null = null;
  /** 0 to 1, eased toward 1 while the nucleus is hovered. */
  let labHover = 0;
  const onScreen: Point[] = bodies.map(() => ({ x: 0, y: 0 }));
  const nucleus = { x: 0, y: 0, radius: 0 };
  onHover(null); // clears a stale card if the scene is rebuilt under the pointer

  function report(target: HoverTarget | null) {
    if (sameTarget(reported, target)) return;
    reported = target;
    onHover(target);
  }

  /** Writes where a projected (normalized device) point lands in the window, in CSS px. */
  function toScreen(out: Point, ndc: Vector3) {
    out.x = (ndc.x * 0.5 + 0.5) * size.width;
    out.y = (-ndc.y * 0.5 + 0.5) * size.height;
  }

  function pick(): HoverTarget | null {
    bodies.forEach((body, i) => {
      projected.setFromMatrixPosition(body.group.matrixWorld).project(camera);
      toScreen(onScreen[i]!, projected);
    });
    toScreen(nucleus, projected.set(0, 0, 0).project(camera));
    // The shell's size on screen follows the camera, which backs off as the
    // view tips toward top-down.
    const pxPerUnit =
      size.height /
      (2 * Math.tan((FOV * Math.PI) / 360) * camera.position.length());
    nucleus.radius = NUCLEUS_RADIUS * pxPerUnit;
    return pickTarget({ x: pointer.px, y: pointer.py }, onScreen, nucleus);
  }

  function update(delta: number, elapsed: number) {
    const ease = Math.min(1, delta * PARALLAX_EASE);
    pointer.x += (pointer.targetX - pointer.x) * ease;
    pointer.y += (pointer.targetY - pointer.y) * ease;

    // The slow spin pauses while the view is held, so it does not drift
    // under the pointer.
    if (!drag) view.yaw += AUTO_SPIN * delta;
    system.rotation.y = view.yaw + pointer.x * PARALLAX_YAW;
    system.rotation.x = view.pitch + pointer.y * PARALLAX_PITCH;
    frameCamera();
    shell.rotation.y = -elapsed * 0.25;
    shell.rotation.x = elapsed * 0.15;
    crystal.rotation.y = elapsed * 0.4;
    crystal.rotation.z = -elapsed * 0.3;

    const target = pick();
    report(target);
    const hovered =
      target?.kind === "satellite" ? bodies[target.index] : undefined;
    const step = Math.min(1, delta * 8);

    // The nucleus brightens and swells a little under the pointer.
    labHover += ((target?.kind === "lab" ? 1 : 0) - labHover) * step;
    shellMaterial.opacity = Math.min(
      1,
      palette.shellOpacity + 0.35 * labHover,
    );
    shell.scale.setScalar(1 + 0.06 * labHover);

    for (const body of bodies) {
      body.hover += ((body === hovered ? 1 : 0) - body.hover) * step;
      // Slow down under the pointer so a satellite is easy to read.
      body.angle += body.speed * (1 - 0.85 * body.hover) * delta;
      const [x, y, z] = orbitPosition(body.radius, body.tilt, body.angle);
      body.group.position.set(x, y, z);
      body.craft.rotation.y += (0.9 + 1.5 * body.hover) * delta;
      body.craft.rotation.x += 0.6 * delta;
      const scale = 1 + 0.18 * body.hover;
      body.badge.scale.set(BADGE_SCALE.x * scale, BADGE_SCALE.y * scale, 1);
      // Badges can overlap as satellites pass each other; the hovered one is
      // drawn on top so it can always be read.
      const front = body.hover > 0.5;
      body.badge.material.depthTest = !front;
      body.badge.renderOrder = front ? 10 : 0;
      (body.orbit.material as LineBasicMaterial).opacity = Math.min(
        1,
        palette.orbitOpacity + 0.45 * body.hover,
      );
    }
  }

  const draw = () => renderer.render(scene, camera);
  /** A still frame at the current view: for the static (reduced motion) mode. */
  const redraw = () => {
    update(0, 0);
    draw();
  };

  function setTheme(next: Theme) {
    if (next === theme) return;
    theme = next;
    palette = SCENE_PALETTES[theme];

    // Materials that only change colour. The per-frame opacities (orbits,
    // shell) read `palette` in update(), so they follow on their own.
    shellMaterial.color.set(palette.shell);
    crystalMaterial.color.set(palette.crystal);
    crystalMaterial.emissive.set(palette.crystalEmissive);
    crystalMaterial.emissiveIntensity = palette.crystalEmissiveIntensity;

    // The star field bakes its colours into a buffer, so it is rebuilt (it is
    // seeded, so the stars stay where they were).
    system.remove(stars);
    disposeTree(stars);
    stars = createStars(palette);
    system.add(stars);

    for (const body of bodies) {
      (body.orbit.material as LineBasicMaterial).color.set(
        craftColor(body.kind, theme),
      );
      body.beacon.material.color.set(palette.beacon);
      body.badge.material.opacity = palette.badgeOpacity;

      // A craft's colours are spread over several materials, so swap the model
      // and carry over its spin.
      const next = makeCraft(body.kind);
      next.rotation.copy(body.craft.rotation);
      body.group.remove(body.craft);
      disposeTree(body.craft);
      body.group.add(next);
      body.craft = next;
    }

    // Reduced motion has no render loop to show the change, or to apply the
    // opacities update() sets, so do both.
    if (!animated) redraw();
  }

  function resize() {
    const { clientWidth: width, clientHeight: height } = mount;
    if (!width || !height) return;
    size.width = width;
    size.height = height;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    frameCamera();
    if (!animated) draw();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(mount);
  resize();

  function dispose() {
    disposeTree(scene);
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  }

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0 || !event.isPrimary) return;
    mount.setPointerCapture(event.pointerId);
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY };
    // Hover and parallax step aside while the view is being dragged.
    pointer.targetX = pointer.targetY = 0;
    pointer.px = pointer.py = -1e4;
    report(null);
  }

  function onPointerMove(event: PointerEvent) {
    if (drag) {
      if (event.pointerId !== drag.id) return;
      view = dragView(view, event.clientX - drag.x, event.clientY - drag.y);
      drag.x = event.clientX;
      drag.y = event.clientY;
      // Reduced motion has no render loop, so draw the new angle here.
      if (!animated) redraw();
      return;
    }
    const rect = mount.getBoundingClientRect();
    pointer.px = event.clientX - rect.left;
    pointer.py = event.clientY - rect.top;
    // Reduced motion has no render loop to notice the pointer, so look for
    // what is under it here. The hover card is information, not motion; the
    // parallax below is motion, so it is skipped.
    if (!animated) {
      report(pick());
      return;
    }
    pointer.targetX = (pointer.px / rect.width - 0.5) * 2;
    pointer.targetY = (pointer.py / rect.height - 0.5) * 2;
  }

  // Capture ends on pointerup and pointercancel, but also when the window
  // loses focus mid-drag; `lostpointercapture` covers every way it can end.
  function onPointerEnd(event: PointerEvent) {
    if (drag?.id === event.pointerId) drag = undefined;
  }

  function onPointerLeave() {
    pointer.targetX = pointer.targetY = 0;
    pointer.px = pointer.py = -1e4;
    report(null);
  }

  mount.addEventListener("pointerdown", onPointerDown);
  mount.addEventListener("pointermove", onPointerMove);
  mount.addEventListener("pointerup", onPointerEnd);
  mount.addEventListener("pointercancel", onPointerEnd);
  mount.addEventListener("lostpointercapture", onPointerEnd);
  mount.addEventListener("pointerleave", onPointerLeave);
  function removePointerListeners() {
    mount.removeEventListener("pointerdown", onPointerDown);
    mount.removeEventListener("pointermove", onPointerMove);
    mount.removeEventListener("pointerup", onPointerEnd);
    mount.removeEventListener("pointercancel", onPointerEnd);
    mount.removeEventListener("lostpointercapture", onPointerEnd);
    mount.removeEventListener("pointerleave", onPointerLeave);
  }

  if (!animated) {
    redraw();
    return {
      setTheme,
      dispose: () => {
        removePointerListeners();
        resizeObserver.disconnect();
        dispose();
      },
    };
  }

  const timer = new Timer();
  timer.connect(document);
  let frames = 0;
  let windowStart = 0;

  function frame(time: number) {
    timer.update(time);
    // Clamp so a long pause (tab hidden, off screen) does not make a jump.
    update(Math.min(timer.getDelta(), 0.1), timer.getElapsed());
    draw();

    frames++;
    if (time - windowStart >= 1000) {
      onFps((frames * 1000) / (time - windowStart));
      frames = 0;
      windowStart = time;
    }
  }

  const visibility = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) {
      frames = 0;
      windowStart = performance.now();
      renderer.setAnimationLoop(frame);
    } else {
      renderer.setAnimationLoop(null);
    }
  });
  visibility.observe(mount);

  return {
    setTheme,
    dispose: () => {
      renderer.setAnimationLoop(null);
      visibility.disconnect();
      removePointerListeners();
      resizeObserver.disconnect();
      timer.dispose();
      dispose();
    },
  };
}

export default function ConstellationScene({
  satellites,
  lab,
}: {
  satellites: Satellite[];
  lab: LabInfo;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<Point>({ x: 0, y: 0 });
  const supported = useSyncExternalStore(
    noopSubscribe,
    supportsWebGL2,
    () => true,
  );
  const reducedMotion = useMediaQuery(REDUCED_MOTION);
  const theme = useTheme();
  const [fps, setFps] = useState<number | null>(null);
  /** What the pointer is over, which decides what the hover card says. */
  const [hover, setHover] = useState<HoverTarget | null>(null);

  const sceneRef = useRef<SceneHandle | null>(null);
  /** The theme now, for the effect below to read without re-running on it. */
  const currentTheme = useEffectEvent(() => theme);

  // The scene is built once, not per theme: a rebuild would throw away the
  // angle you dragged to and where every satellite is on its orbit.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || !supported) return;
    try {
      const scene = createConstellation(mount, satellites, {
        animated: !reducedMotion,
        theme: currentTheme(),
        onFps: setFps,
        onHover: setHover,
      });
      sceneRef.current = scene;
      return () => {
        sceneRef.current = null;
        scene.dispose();
      };
    } catch {
      // The context could not be created after all: leave the panel empty
      // rather than take the page down. The products are listed below it.
    }
  }, [satellites, supported, reducedMotion]);

  // A theme change recolours the live scene in place.
  useEffect(() => {
    sceneRef.current?.setTheme(theme);
  }, [theme]);

  /** Puts the hover card beside the pointer, inside the window. */
  const placeCard = useCallback(() => {
    const card = cardRef.current;
    const root = rootRef.current;
    if (!card || !root) return;
    const { x, y } = placeTooltip(
      pointerRef.current,
      { width: card.offsetWidth, height: card.offsetHeight },
      { width: root.clientWidth, height: root.clientHeight },
    );
    card.style.transform = `translate(${x}px, ${y}px)`;
  }, []);

  // The card follows the pointer without a React render per mouse move.
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const onMove = (event: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointerRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
      placeCard();
    };
    mount.addEventListener("pointermove", onMove);
    return () => mount.removeEventListener("pointermove", onMove);
  }, [placeCard]);

  // And is placed before it first paints when it appears.
  useLayoutEffect(() => {
    placeCard();
  }, [hover, placeCard]);

  const hoveredSatellite =
    hover?.kind === "satellite" ? satellites[hover.index] : undefined;

  return (
    <div ref={rootRef} className="relative size-full overflow-hidden">
      <div
        ref={mountRef}
        role="img"
        aria-label={`Interactive 3D view of ${satellites.length} lab products orbiting a central research nucleus. Drag to rotate the view. The products are also listed as text on this page.`}
        className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
      />

      {/* Visual only: the same facts are text on the page (see /3d), and the
          pointer passes through it so it never blocks hover or drag. */}
      <div
        ref={cardRef}
        aria-hidden="true"
        hidden={hover === null}
        className="pointer-events-none absolute left-0 top-0 z-40 w-72 rounded-lg border border-surface-container-highest/70 bg-surface-container-high/95 p-space-sm shadow-panel backdrop-blur"
      >
        {hoveredSatellite && (
          <SatelliteCard satellite={hoveredSatellite} theme={theme} />
        )}
        {hover?.kind === "lab" && <LabCard lab={lab} />}
      </div>

      {!supported && (
        <div className="absolute inset-0 grid place-items-center p-space-lg text-center">
          <div className="pointer-events-auto flex max-w-sm flex-col items-center gap-space-md font-mono text-label-sm text-outline light:text-on-surface-variant">
            <Icon name="deployed_code" className="text-2xl" />
            <p>
              WebGL 2 isn&apos;t available in this browser, so the 3D view
              can&apos;t run here.
            </p>
            <Link
              href="/#products-directory"
              prefetch={false}
              className="inline-flex h-10 items-center rounded-xs bg-primary px-4 text-body-sm font-medium text-on-primary shadow-button"
            >
              See the {satellites.length} products
            </Link>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-4 top-4 z-30 flex items-center justify-between gap-2 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <Chip className="text-primary">
            <span className="size-2 animate-pulse rounded-full bg-secondary shadow-[0_0_8px_var(--secondary)]" />
            <span className="font-medium tracking-wide">
              ORBITAL CONSTELLATION: {satellites.length} ACTIVE SATELLITES
            </span>
          </Chip>
          <Chip className="text-secondary">
            <Icon name="filter_vintage" className="text-[12px]" />
            CENTRAL NUCLEUS: STABLE
          </Chip>
        </div>
        <div className="flex items-center gap-2">
          <Chip className="text-on-surface-variant">
            <Icon name="timeline" className="text-[12px] text-tertiary" />
            ELLIPTICAL TRAJECTORY: COMPUTED
          </Chip>
          <Chip className="text-outline light:text-on-surface-variant">
            <Icon name="speed" className="text-[12px] text-secondary" />
            <span className="font-medium text-primary">
              {fps === null ? "--" : fps.toFixed(1)} FPS
            </span>
          </Chip>
          {/* This page has no header, so the theme switch lives here, drawn
              like the 3D MODE switch below. */}
          <ThemeSwitchChip />
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-30 flex items-center justify-between gap-2 font-mono text-[10px]">
        <div className="flex items-center gap-2">
          <Chip className="text-on-surface-variant">
            <Icon name="satellite_alt" className="text-[13px] text-secondary" />
            <span className="font-medium text-primary">
              {reducedMotion
                ? "REDUCED MOTION • DRAG TO ROTATE"
                : "DRAG TO ROTATE • HOVER TO INSPECT"}
            </span>
          </Chip>
          <Chip className="text-outline light:text-on-surface-variant">
            SOLAR NUCLEUS KEPLER-SIM V2.4
          </Chip>
        </div>
        <div className="flex items-center gap-2">
          <Chip className="text-outline light:text-on-surface-variant">
            <span className="font-medium text-secondary">WEBGL2</span>
            <span>• THREE.JS R{REVISION}</span>
          </Chip>
          <ConstellationSwitch on variant="hud" />
          <Link
            href="/#products-directory"
            prefetch={false}
            className="pointer-events-auto inline-flex items-center gap-1 rounded-xs border border-transparent bg-primary px-2.5 py-1 text-[11px] font-medium text-on-primary shadow-chip transition-colors hover:bg-secondary hover:text-surface"
          >
            Inspect Satellites
            <Icon name="expand_more" className="text-[12px]" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/** The hover card for a satellite: a short summary of the project. */
function SatelliteCard({
  satellite,
  theme,
}: {
  satellite: Satellite;
  theme: Theme;
}) {
  const release = [satellite.version, satellite.status.toUpperCase()]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="border-l-2 pl-space-sm"
      style={{ borderColor: cssColor(craftColor(satellite.preview, theme)) }}
    >
      <p className="font-mono text-label-sm text-on-surface-variant">
        {`${satellite.tag} // ${satellite.topic}`}
      </p>
      <p className="mt-1 text-headline-sm text-primary">{satellite.title}</p>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        {satellite.summary}
      </p>
      <p className="mt-2 flex items-center justify-between gap-2 font-mono text-label-sm text-outline light:text-on-surface-variant">
        <span>{release}</span>
        <span>{satellite.metric}</span>
      </p>
    </div>
  );
}

/** The hover card for the nucleus: a short summary of the lab. */
function LabCard({ lab }: { lab: LabInfo }) {
  const pad = (count: number) => String(count).padStart(2, "0");

  return (
    <div
      className="border-l-2 pl-space-sm"
      style={{ borderColor: "var(--secondary)" }}
    >
      <p className="font-mono text-label-sm text-secondary">
        {"// CENTRAL NUCLEUS"}
      </p>
      <p className="mt-1 text-headline-sm text-primary">{lab.name}</p>
      <p className="mt-1 text-body-sm text-on-surface-variant">{lab.summary}</p>
      <p className="mt-2 font-mono text-label-sm text-outline light:text-on-surface-variant">
        {pad(lab.products)} PRODUCTS · {pad(lab.releases)} RELEASES
      </p>
    </div>
  );
}

function Chip({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`${HUD_CHIP} ${className}`}>{children}</div>;
}
