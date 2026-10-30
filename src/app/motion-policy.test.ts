import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The site's animation rules (see "Motion policy" in globals.css). Crawlers and
 * Core Web Vitals reward content that is visible and stable from the first
 * paint, so entrance motion must never hide anything or move layout.
 */
const css = fs.readFileSync(path.join(__dirname, "globals.css"), "utf8");

/** The text between the braces that follow `start`, balanced. */
function block(start: string): string {
  const from = css.indexOf(start);
  expect(from, `"${start}" not found in globals.css`).toBeGreaterThanOrEqual(0);
  const open = css.indexOf("{", from);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  throw new Error(`unbalanced braces after "${start}"`);
}

describe("motion policy", () => {
  it("entrance keyframes only move things: no opacity, visibility or display", () => {
    const rise = block("@keyframes rise");

    expect(rise).toContain("transform");
    expect(rise).not.toMatch(/opacity|visibility|display|clip|height|width|margin|top|left/);
  });

  it("applies the starting pose with `backwards` fill so nothing stays displaced", () => {
    expect(block(".enter")).toMatch(/backwards/);
    expect(block("@supports (animation-timeline: view())")).toMatch(/backwards/);
    expect(css).not.toMatch(/animation[^;]*\b(forwards|both)\b/);
  });

  it("only uses scroll-driven reveals where the browser supports them", () => {
    const rule = "@supports (animation-timeline: view())";
    const outside = css.replace(`${rule} {${block(rule)}}`, "");

    expect(outside).not.toMatch(/animation-timeline/);
  });

  it("switches entrance and reveal motion off for reduced-motion users", () => {
    const reduced = block("@media (prefers-reduced-motion: reduce)");

    expect(reduced).toMatch(/\.enter[\s\S]*\.reveal[\s\S]*animation:\s*none/);
  });
});
