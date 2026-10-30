import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/content";
import { PRODUCT_PREVIEWS } from "./content/schema";
import {
  BASE_PITCH,
  cameraDistance,
  craftColor,
  CRAFT_COLORS,
  DRAG_SPEED,
  dragView,
  MAX_PITCH,
  MIN_PITCH,
  orbitPosition,
  orbitSpeed,
  pickTarget,
  placeTooltip,
  sameTarget,
  SCENE_PALETTES,
  toSatellites,
} from "./constellation";

function product(overrides: Partial<Product> & { slug: string }): Product {
  return {
    name: overrides.slug,
    shortName: overrides.slug,
    order: 1,
    status: "prod",
    summary: "summary",
    tags: ["Game Theory"],
    preview: "gomoku",
    icon: "hub",
    metric: "1ms",
    version: null,
    ...overrides,
  };
}

describe("toSatellites", () => {
  const products = [
    product({ slug: "c", order: 3, shortName: "Third", preview: "agents" }),
    product({
      slug: "a",
      order: 1,
      shortName: "First",
      tags: ["Game Theory", "Rust"],
      experiment: {
        id: "EXP-014",
        title: "t",
        domain: "d",
        summary: "s",
        metric: "m",
      },
    }),
    product({ slug: "b", order: 2, shortName: "Second", preview: "waveform" }),
  ];
  const satellites = toSatellites(products);

  it("follows the directory order, not the input order", () => {
    expect(satellites.map((s) => s.slug)).toEqual(["a", "b", "c"]);
  });

  it("labels with the short name, the experiment id and the first tag", () => {
    expect(satellites[0]).toMatchObject({
      name: "First",
      tag: "EXP-014",
      topic: "GAME THEORY",
    });
  });

  it("numbers the satellites that have no experiment", () => {
    expect(satellites[1]?.tag).toBe("SAT-02");
    expect(satellites[2]?.tag).toBe("SAT-03");
  });

  it("puts each satellite on a wider orbit than the one before", () => {
    const radii = satellites.map((s) => s.orbitRadius);

    expect(radii).toEqual([...radii].sort((a, b) => a - b));
    expect(new Set(radii).size).toBe(radii.length);
  });

  it("does not change the products it is given", () => {
    expect(products.map((p) => p.slug)).toEqual(["c", "a", "b"]);
  });

  it("carries what the hover card shows: full name, summary, status, version, metric", () => {
    const [first] = toSatellites([
      product({
        slug: "x",
        name: "Mi caro (Gomoku)",
        shortName: "Mi caro",
        summary: "A fast engine.",
        status: "beta",
        version: "v2.4.0",
        metric: "<16ms/ply",
      }),
    ]);

    expect(first).toMatchObject({
      name: "Mi caro",
      title: "Mi caro (Gomoku)",
      summary: "A fast engine.",
      status: "beta",
      version: "v2.4.0",
      metric: "<16ms/ply",
    });
  });
});

describe("pickTarget", () => {
  const satellites = [
    { x: 200, y: 200 },
    { x: 400, y: 300 },
  ];
  const nucleus = { x: 400, y: 300, radius: 80 };

  it("finds the satellite under the pointer", () => {
    expect(pickTarget({ x: 210, y: 205 }, satellites, nucleus)).toEqual({
      kind: "satellite",
      index: 0,
    });
  });

  it("finds the nucleus when no satellite is near", () => {
    expect(pickTarget({ x: 450, y: 330 }, [satellites[0]!], nucleus)).toEqual({
      kind: "lab",
    });
  });

  it("prefers a satellite that overlaps the nucleus", () => {
    // Satellite 1 sits exactly on the nucleus's centre.
    expect(pickTarget({ x: 410, y: 300 }, satellites, nucleus)).toEqual({
      kind: "satellite",
      index: 1,
    });
  });

  it("picks the nearest satellite when two are in range", () => {
    const close = [
      { x: 100, y: 100 },
      { x: 130, y: 100 },
    ];

    expect(pickTarget({ x: 125, y: 100 }, close, nucleus)).toEqual({
      kind: "satellite",
      index: 1,
    });
  });

  it("is null over empty space, and when the pointer is off the view", () => {
    expect(pickTarget({ x: 700, y: 600 }, satellites, nucleus)).toBeNull();
    expect(pickTarget({ x: -1e4, y: -1e4 }, satellites, nucleus)).toBeNull();
  });

  it("uses the nucleus's own radius, so it shrinks as the camera backs off", () => {
    const pointer = { x: 460, y: 300 }; // 60px from the centre

    expect(pickTarget(pointer, [], { ...nucleus, radius: 80 })).toEqual({ kind: "lab" });
    expect(pickTarget(pointer, [], { ...nucleus, radius: 50 })).toBeNull();
  });
});

describe("sameTarget", () => {
  it("compares kind and index", () => {
    expect(sameTarget(null, null)).toBe(true);
    expect(sameTarget({ kind: "lab" }, { kind: "lab" })).toBe(true);
    expect(sameTarget({ kind: "satellite", index: 2 }, { kind: "satellite", index: 2 })).toBe(true);
    expect(sameTarget({ kind: "satellite", index: 2 }, { kind: "satellite", index: 3 })).toBe(false);
    expect(sameTarget({ kind: "satellite", index: 0 }, { kind: "lab" })).toBe(false);
    expect(sameTarget(null, { kind: "lab" })).toBe(false);
  });
});

describe("placeTooltip", () => {
  const card = { width: 288, height: 140 };
  const bounds = { width: 1440, height: 900 };

  it("sits to the lower right of the pointer", () => {
    expect(placeTooltip({ x: 300, y: 200 }, card, bounds)).toEqual({ x: 316, y: 216 });
  });

  it("flips to the left of the pointer at the right edge", () => {
    const { x } = placeTooltip({ x: 1400, y: 200 }, card, bounds);

    expect(x).toBe(1400 - 16 - 288);
    expect(x + card.width).toBeLessThanOrEqual(bounds.width);
  });

  it("flips above the pointer at the bottom edge", () => {
    const { y } = placeTooltip({ x: 300, y: 880 }, card, bounds);

    expect(y).toBe(880 - 16 - 140);
    expect(y + card.height).toBeLessThanOrEqual(bounds.height);
  });

  it("never goes past the top-left corner, even in a tiny window", () => {
    const place = placeTooltip({ x: 20, y: 20 }, card, { width: 200, height: 100 });

    expect(place.x).toBeGreaterThanOrEqual(0);
    expect(place.y).toBeGreaterThanOrEqual(0);
  });
});

describe("orbitPosition", () => {
  it("starts on the x axis, level with the nucleus", () => {
    expect(orbitPosition(6, 0.3, 0)).toEqual([6, 0, 0]);
  });

  it("stays at its radius in the horizontal plane at every angle", () => {
    for (let angle = 0; angle < Math.PI * 2; angle += 0.4) {
      const [x, , z] = orbitPosition(7.6, -0.25, angle);

      expect(Math.hypot(x, z)).toBeCloseTo(7.6, 10);
    }
  });

  it("tilts by at most radius * tilt", () => {
    const heights = Array.from({ length: 64 }, (_, i) =>
      orbitPosition(10, 0.3, (i / 64) * Math.PI * 2)[1],
    );

    expect(Math.max(...heights)).toBeLessThanOrEqual(3 + 1e-9);
    expect(Math.min(...heights)).toBeGreaterThanOrEqual(-3 - 1e-9);
  });
});

describe("orbitSpeed", () => {
  it("is slower on outer orbits (Kepler's third law)", () => {
    expect(orbitSpeed(5.6)).toBeGreaterThan(orbitSpeed(7.6));
    expect(orbitSpeed(7.6)).toBeGreaterThan(orbitSpeed(15.6));
    // T^2 is proportional to r^3.
    const period = (r: number) => (2 * Math.PI) / orbitSpeed(r);
    expect(period(8) ** 2 / 8 ** 3).toBeCloseTo(period(16) ** 2 / 16 ** 3, 10);
  });
});

describe("dragView", () => {
  const start = { yaw: 0.4, pitch: BASE_PITCH };

  it("turns right when dragged right, and down when dragged down", () => {
    const right = dragView(start, 100, 0);
    const down = dragView(start, 0, 100);

    expect(right.yaw).toBeCloseTo(start.yaw + 100 * DRAG_SPEED, 10);
    expect(right.pitch).toBe(start.pitch);
    expect(down.pitch).toBeCloseTo(start.pitch + 100 * DRAG_SPEED, 10);
    expect(down.yaw).toBe(start.yaw);
  });

  it("adds up: two drags equal one drag of the same total", () => {
    const twice = dragView(dragView(start, 30, 20), 70, 40);
    const once = dragView(start, 100, 60);

    expect(twice.yaw).toBeCloseTo(once.yaw, 10);
    expect(twice.pitch).toBeCloseTo(once.pitch, 10);
  });

  it("keeps the pitch in range however far it is dragged, so the view never flips", () => {
    expect(dragView(start, 0, 1e6).pitch).toBe(MAX_PITCH);
    expect(dragView(start, 0, -1e6).pitch).toBe(MIN_PITCH);
  });

  it("lets the yaw spin freely past a full turn", () => {
    expect(dragView(start, 1e4, 0).yaw).toBeGreaterThan(Math.PI * 2);
    expect(dragView(start, -1e4, 0).yaw).toBeLessThan(-Math.PI * 2);
  });

  it("does not change the view it is given", () => {
    dragView(start, 500, 500);

    expect(start).toEqual({ yaw: 0.4, pitch: BASE_PITCH });
  });
});

describe("cameraDistance", () => {
  const outer = 15.6;
  const startPitch = BASE_PITCH;

  it("keeps the default view's distance at a common desktop window", () => {
    expect(cameraDistance(1.6, startPitch, outer)).toBeCloseTo(46, 5);
    expect(cameraDistance(16 / 9, startPitch, outer)).toBeCloseTo(46, 5);
  });

  it("backs off as the view tips toward top-down", () => {
    const levels = [BASE_PITCH, 0.6, 0.9, MAX_PITCH].map((pitch) =>
      cameraDistance(1.6, pitch, outer),
    );

    expect(levels).toEqual([...levels].sort((a, b) => a - b));
    expect(levels[3]).toBeGreaterThan(levels[0]! * 1.3);
  });

  it("backs off in a narrower window, so the outer orbit still fits across it", () => {
    expect(cameraDistance(1.0, startPitch, outer)).toBeGreaterThan(
      cameraDistance(1.6, startPitch, outer),
    );
  });

  it("never gets closer than the default, from above or below", () => {
    expect(cameraDistance(3, MIN_PITCH, outer)).toBeGreaterThanOrEqual(46);
    expect(cameraDistance(3, startPitch, outer)).toBeGreaterThanOrEqual(46);
  });

  it("scales with the size of the system", () => {
    expect(cameraDistance(1.6, MAX_PITCH, 25)).toBeGreaterThan(
      cameraDistance(1.6, MAX_PITCH, outer),
    );
  });
});

/**
 * The scene is drawn over the page, so how well it reads is a property of its
 * colours against the page's. The backgrounds are read from globals.css, so
 * they cannot drift from what the page really uses.
 */
describe("scene colours against the page", () => {
  const css = fs.readFileSync(path.join(__dirname, "../app/globals.css"), "utf8");

  /** `--surface-container-lowest`, which the /3d screen is painted with. */
  function pageBackground(block: ":root" | ".light"): number {
    const start = css.indexOf(`${block} {`);
    const body = css.slice(start, css.indexOf("}", start));
    const match = body.match(/--surface-container-lowest:\s*#([0-9a-f]{6})/i);
    expect(match, `no --surface-container-lowest in ${block}`).not.toBeNull();
    return parseInt(match![1]!, 16);
  }

  const channels = (hex: number) => [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
  const luminance = (rgb: number[]) => {
    const [r, g, b] = rgb.map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
  };
  /** WCAG contrast ratio between two colours. */
  const contrast = (a: number[], b: number[]) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
    return (hi! + 0.05) / (lo! + 0.05);
  };
  /** `fg` drawn at `alpha` over `bg`, as the canvas composites it. */
  const over = (fg: number, alpha: number, bg: number) =>
    channels(fg).map((c, i) => c * alpha + channels(bg)[i]! * (1 - alpha));
  const mix = (from: number, to: number, amount: number) =>
    channels(from).map((c, i) => c + (channels(to)[i]! - c) * amount);

  const themes = [
    { theme: "dark", background: pageBackground(":root") },
    { theme: "light", background: pageBackground(".light") },
  ] as const;

  const pageBackgrounds = { dark: themes[0].background, light: themes[1].background };
  /** How well an orbit line (translucent, in its craft's accent) reads on the page. */
  const lineContrast = (theme: "dark" | "light", kind: (typeof PRODUCT_PREVIEWS)[number]) =>
    contrast(
      over(craftColor(kind, theme), SCENE_PALETTES[theme].orbitOpacity, pageBackgrounds[theme]),
      channels(pageBackgrounds[theme]),
    );
  /** How well the nucleus's wireframe shell reads on the page. */
  const shellContrast = (theme: "dark" | "light") =>
    contrast(
      over(SCENE_PALETTES[theme].shell, SCENE_PALETTES[theme].shellOpacity, pageBackgrounds[theme]),
      channels(pageBackgrounds[theme]),
    );

  for (const { theme, background } of themes) {
    const bg = channels(background);
    const palette = SCENE_PALETTES[theme];
    const kinds = PRODUCT_PREVIEWS;

    describe(`${theme} theme`, () => {
      it("draws every craft in an accent that stands out from the page (3:1)", () => {
        for (const kind of kinds) {
          expect(contrast(channels(craftColor(kind, theme)), bg), kind).toBeGreaterThanOrEqual(3);
        }
      });

      // The dark palette is the accepted look; light must be no harder to see.
      it("keeps orbit lines at least as visible as in the dark theme", () => {
        for (const kind of kinds) {
          expect(lineContrast(theme, kind), kind).toBeGreaterThanOrEqual(lineContrast("dark", kind));
        }
      });

      it("keeps the nucleus shell at least as visible as in the dark theme", () => {
        expect(shellContrast(theme)).toBeGreaterThanOrEqual(shellContrast("dark"));
      });

      it("draws the markers and stars so they can be seen", () => {
        expect(contrast(channels(palette.beacon), bg)).toBeGreaterThanOrEqual(7);
        for (const star of [palette.starGreen, palette.starIndigo]) {
          expect(contrast(over(star, palette.starOpacity, background), bg)).toBeGreaterThanOrEqual(3);
        }
      });

      it("keeps the secondary parts of a craft visible too (3:1)", () => {
        for (const kind of kinds) {
          const tone = mix(craftColor(kind, theme), palette.toneTarget, palette.toneAmount);
          expect(contrast(tone, bg), kind).toBeGreaterThanOrEqual(3);
        }
      });
    });
  }

  it("needs its own light accents: the dark ones fade into the light page", () => {
    const light = channels(pageBackground(".light"));
    const faded = PRODUCT_PREVIEWS.filter(
      (kind) => contrast(channels(CRAFT_COLORS[kind]), light) < 3,
    );

    expect(faded.length).toBeGreaterThan(0);
  });
});

describe("CRAFT_COLORS", () => {
  it("has an accent for every product preview kind", () => {
    for (const kind of PRODUCT_PREVIEWS) {
      expect(CRAFT_COLORS[kind]).toBeTypeOf("number");
    }
  });
});
