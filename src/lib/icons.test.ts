import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PILLARS } from "../data/pillars";
import { materialSymbolsHref, UI_ICONS } from "./icons";

const SRC = path.join(__dirname, "..");

function sourceFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return sourceFiles(full);
      const isSource = /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name);
      return isSource ? [full] : [];
    });
}

/**
 * Icon names written literally: `<Icon name="..." />` (including ternaries) and
 * `icon: "..."` in data such as the pillars and the Manifesto actions.
 */
function literalIconNames(): Map<string, string> {
  const found = new Map<string, string>();
  const component = /<Icon\s+name=(?:"([a-z0-9_]+)"|\{([^}]*)\})/g;
  const data = /\bicon:\s*"([a-z0-9_]+)"/g;
  for (const file of sourceFiles(SRC)) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(component)) {
      const names = match[1]
        ? [match[1]]
        : [...(match[2] ?? "").matchAll(/"([a-z0-9_]+)"/g)].map((m) => m[1]!);
      for (const name of names) found.set(name, path.relative(SRC, file));
    }
    for (const match of text.matchAll(data)) {
      found.set(match[1]!, path.relative(SRC, file));
    }
  }
  return found;
}

describe("icon subset", () => {
  it("covers every icon a component names literally", () => {
    const missing = [...literalIconNames()].filter(
      ([name]) => !(UI_ICONS as readonly string[]).includes(name),
    );

    expect(missing).toEqual([]);
  });

  it("covers the pillar icons from src/data", () => {
    for (const pillar of PILLARS) {
      expect(UI_ICONS as readonly string[]).toContain(pillar.icon);
    }
  });

  it("has no unused entries", () => {
    const used = new Set([
      ...literalIconNames().keys(),
      ...PILLARS.map((pillar) => pillar.icon),
    ]);

    expect(UI_ICONS.filter((name) => !used.has(name))).toEqual([]);
  });
});

describe("materialSymbolsHref", () => {
  const url = new URL(materialSymbolsHref(["sports_esports", "hub"]));
  const names = (url.searchParams.get("icon_names") ?? "").split(",");

  it("adds content icons, de-duplicated and sorted", () => {
    expect(names).toContain("sports_esports");
    expect(names.filter((name) => name === "hub")).toHaveLength(1);
    expect(names).toEqual([...names].sort());
  });

  it("keeps display=block and the fixed weight and fill", () => {
    expect(url.searchParams.get("display")).toBe("block");
    expect(url.searchParams.get("family")).toContain("opsz,wght,FILL,GRAD@20..48,400,0,0");
  });

  it("encodes names so content cannot alter the URL", () => {
    const hostile = new URL(materialSymbolsHref(["a&display=swap"]));

    expect(hostile.searchParams.get("display")).toBe("block");
  });
});
