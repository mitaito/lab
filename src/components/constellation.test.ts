import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { CONSTELLATION_PATH } from "@/lib/constellation";

/**
 * 3D mode is the full-window /3d page, reached from a switch on the home page.
 * For search engines and Core Web Vitals that only holds while the rest of the
 * site pays nothing for it: no Three.js in any other page's JavaScript, no
 * WebGL in prerendered HTML, the products still present as ordinary markup,
 * and the canvas-only page kept out of the index. Google documents that
 * Googlebot has no WebGL, so nothing may depend on the canvas.
 */
const SRC = path.join(__dirname, "..");

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    const isSource = /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name);
    return isSource ? [full] : [];
  });
}

const read = (file: string) => fs.readFileSync(path.join(SRC, file), "utf8");

describe("3D mode: cost to the rest of the site", () => {
  it("imports three from the scene file only", () => {
    const importers = sourceFiles(SRC)
      .filter((file) => /from\s+["']three["']/.test(fs.readFileSync(file, "utf8")))
      .map((file) => path.relative(SRC, file));

    expect(importers).toEqual(["components/constellation-scene.tsx"]);
  });

  it("reaches the scene only through the /3d screen's client-only dynamic import", () => {
    const screen = read("components/constellation-screen.tsx");

    expect(screen).toMatch(
      /dynamic\(\s*\(\)\s*=>\s*import\(["']\.\/constellation-scene["']\)[\s\S]*?ssr:\s*false/,
    );
    for (const file of sourceFiles(SRC)) {
      expect(fs.readFileSync(file, "utf8")).not.toMatch(
        /^import .* from ["'](\.\/|@\/components\/)constellation-scene["']/m,
      );
    }
  });

  it("keeps the home page free of 3D code: it only links to /3d", () => {
    const home = read("app/(site)/page.tsx") + read("components/hero.tsx");
    const switchFile = read("components/constellation-switch.tsx");

    expect(home).not.toMatch(/constellation-(scene|screen)/);
    expect(home).toContain("constellation-switch");
    expect(switchFile).not.toMatch(/"use client"/);
    expect(switchFile).toContain("prefetch={false}");
  });

  it("limits the switch to desktop windows in both CSS and JavaScript", () => {
    expect(read("components/hero.tsx")).toContain(
      '<ConstellationSwitch className="hidden lg:inline-flex" />',
    );
    expect(read("components/constellation-screen.tsx")).toContain(
      "useMediaQuery(CONSTELLATION_MIN_WIDTH)",
    );
    expect(read("lib/constellation.ts")).toContain('"(min-width: 64rem)"');
  });

  it("keeps the product cards on the home page", () => {
    expect(read("app/(site)/page.tsx")).toContain("<Products />");
  });
});

describe("3D mode: the /3d page", () => {
  it("is the 3D layer alone: outside the (site) group, so no header or footer", () => {
    expect(fs.existsSync(path.join(SRC, "app/(immersive)/3d/page.tsx"))).toBe(true);
    expect(fs.existsSync(path.join(SRC, "app/(immersive)/layout.tsx"))).toBe(false);
    expect(read("app/(site)/layout.tsx")).toContain("<SiteShell>");

    const root = read("app/layout.tsx");
    expect(root).not.toMatch(/components\/(header|footer|site-shell)/);
  });

  it("fills the window and locks scrolling", () => {
    const screen = read("components/constellation-screen.tsx");

    expect(screen).toMatch(/fixed inset-0 overflow-hidden/);
    expect(screen).toMatch(/style\.overflow\s*=\s*"hidden"/);
    expect(screen).toMatch(/style\.overflow\s*=\s*previous/);
  });

  it("is served at /3d and still lists the products as text", () => {
    const page = read("app/(immersive)/3d/page.tsx");

    expect(CONSTELLATION_PATH).toBe("/3d");
    expect(page).toContain('<h1 className="sr-only">');
    expect(page).toContain("products.map");
  });

  it("is kept out of the index but stays crawlable", () => {
    expect(read("app/(immersive)/3d/page.tsx")).toMatch(
      /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/,
    );
    expect(sitemap().map((entry) => entry.url)).not.toContainEqual(
      expect.stringContaining(CONSTELLATION_PATH),
    );

    // A noindex is only seen if crawlers may fetch the page.
    const { rules } = robots();
    const all = Array.isArray(rules) ? rules : [rules];
    expect(all.every((rule) => !("disallow" in rule && rule.disallow))).toBe(true);
  });
});
