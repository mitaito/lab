import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ContentError, loadContent } from "./load";

const PRODUCT = `---
name: Alpha Engine
shortName: Alpha
order: 1
status: prod
summary: An engine.
tags: [Rust]
preview: gomoku
icon: bolt
metric: 1ms
---
`;

const release = (date: string, extra = "") => `---
date: ${date}
status: live
summary: Did a thing.
${extra}---
`;

let root: string;

function write(file: string, content: string) {
  const target = path.join(root, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function problemsOf(action: () => unknown): string[] {
  try {
    action();
  } catch (error) {
    if (error instanceof ContentError) return error.problems;
    throw error;
  }
  throw new Error("expected loadContent to throw a ContentError");
}

beforeEach(() => {
  root = fs.mkdtempSync(path.join(os.tmpdir(), "lab-content-"));
});

afterEach(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

describe("loadContent", () => {
  it("loads products and releases, newest release first", () => {
    write("products/alpha.md", PRODUCT);
    write("changelog/alpha/v1.0.0.md", release("2025-01-01"));
    write("changelog/alpha/v1.1.0.md", release("2025-02-01"));

    const content = loadContent(root);

    expect(content.products.map((p) => p.slug)).toEqual(["alpha"]);
    expect(content.releases.map((r) => r.version)).toEqual(["v1.1.0", "v1.0.0"]);
    expect(content.releaseIndex.get("alpha/v1.0.0")?.date).toBe("2025-01-01");
  });

  it("derives the product version from its newest release", () => {
    write("products/alpha.md", PRODUCT);
    write("changelog/alpha/v1.0.0.md", release("2025-01-01"));
    write("changelog/alpha/v1.1.0.md", release("2025-02-01"));

    expect(loadContent(root).products[0]?.version).toBe("v1.1.0");
  });

  it("keeps a scope that looks like a number", () => {
    write("products/alpha.md", PRODUCT);
    write("changelog/alpha/v1.0.0.md", release("2025-01-01", "scope: 2048\n"));
    write("changelog/alpha/v1.1.0.md", release("2025-01-02", "scope: 1e5\n"));

    expect(loadContent(root).releases.map((r) => r.scope).toSorted()).toEqual([
      "1e5",
      "2048",
    ]);
  });

  it("rejects the removed `ref` field", () => {
    write("products/alpha.md", PRODUCT);
    write("changelog/alpha/v1.0.0.md", release("2025-01-01", "ref: c2810a9\n"));

    expect(problemsOf(() => loadContent(root))[0]).toContain("ref");
  });

  it("converts `order` to a number and rejects a non-number", () => {
    write("products/alpha.md", PRODUCT.replace("order: 1", "order: 10"));
    expect(loadContent(root).products[0]?.order).toBe(10);

    write("products/alpha.md", PRODUCT.replace("order: 1", "order: first"));
    expect(problemsOf(() => loadContent(root))[0]).toContain("order");
  });

  it("gives a product without releases a null version", () => {
    write("products/alpha.md", PRODUCT);

    expect(loadContent(root).products[0]?.version).toBeNull();
  });

  it("defaults a release scope to the product name and keeps the body", () => {
    write("products/alpha.md", PRODUCT);
    write("changelog/alpha/v1.0.0.md", `${release("2025-01-01")}\n## Notes\n\nHi.\n`);

    const [first] = loadContent(root).releases;

    expect(first?.scope).toBe("Alpha Engine");
    expect(first?.body).toBe("## Notes\n\nHi.");
  });

  it("breaks date ties by version, numerically", () => {
    write("products/alpha.md", PRODUCT);
    write("changelog/alpha/v1.9.0.md", release("2025-01-01"));
    write("changelog/alpha/v1.10.0.md", release("2025-01-01"));

    expect(loadContent(root).releases.map((r) => r.version)).toEqual([
      "v1.10.0",
      "v1.9.0",
    ]);
  });

  it("orders products by `order`", () => {
    write("products/alpha.md", PRODUCT.replace("order: 1", "order: 2"));
    write("products/beta.md", PRODUCT.replace("order: 1", "order: 1"));

    expect(loadContent(root).products.map((p) => p.slug)).toEqual([
      "beta",
      "alpha",
    ]);
  });

  it("does not require a changelog directory", () => {
    write("products/alpha.md", PRODUCT);

    expect(loadContent(root).releases).toEqual([]);
  });
});

describe("loadContent validation", () => {
  it("fails when the products directory is missing", () => {
    expect(problemsOf(() => loadContent(root))).toEqual([
      "missing directory: products",
    ]);
  });

  it("names the file and field of an invalid product", () => {
    write("products/alpha.md", PRODUCT.replace("status: prod", "status: live"));

    const [problem] = problemsOf(() => loadContent(root));

    expect(problem).toContain("products/alpha.md");
    expect(problem).toContain("status");
  });

  it("rejects unknown front-matter keys, which are usually typos", () => {
    write("products/alpha.md", PRODUCT.replace("summary:", "sumary:"));

    expect(problemsOf(() => loadContent(root)).join("\n")).toContain("sumary");
  });

  it("rejects the reserved slug `page`", () => {
    write("products/page.md", PRODUCT);

    expect(problemsOf(() => loadContent(root))[0]).toContain("page");
  });

  it("rejects a changelog folder without a product", () => {
    write("products/alpha.md", PRODUCT);
    write("changelog/ghost/v1.0.0.md", release("2025-01-01"));

    expect(problemsOf(() => loadContent(root))).toEqual([
      "changelog/ghost: no matching products/ghost.md",
    ]);
  });

  it.each([
    ["an impossible date", "2025-02-30"],
    ["a malformed date", "yesterday"],
  ])("rejects %s", (_label, date) => {
    write("products/alpha.md", PRODUCT);
    write("changelog/alpha/v1.0.0.md", release(date));

    expect(problemsOf(() => loadContent(root))[0]).toContain("date");
  });

  it("rejects a version that is not URL-safe", () => {
    write("products/alpha.md", PRODUCT);
    write("changelog/alpha/v1 0.md", release("2025-01-01"));

    expect(problemsOf(() => loadContent(root))[0]).toContain("not a valid version");
  });

  it("rejects a file with no front-matter", () => {
    write("products/alpha.md", "# Just markdown\n");

    expect(problemsOf(() => loadContent(root))[0]).toContain("missing front-matter");
  });

  it("rejects malformed YAML", () => {
    write("products/alpha.md", "---\nname: [unclosed\n---\n");

    expect(problemsOf(() => loadContent(root))[0]).toContain("invalid YAML");
  });

  it("rejects a release named after the reserved `page` segment", () => {
    write("products/alpha.md", PRODUCT);
    write("changelog/alpha/page.md", release("2025-01-01"));

    expect(problemsOf(() => loadContent(root))[0]).toContain("not a valid version");
  });

  it("rejects non-markdown files", () => {
    write("products/alpha.md", PRODUCT);
    write("changelog/alpha/notes.txt", "hello");

    expect(problemsOf(() => loadContent(root))[0]).toContain("expected a .md file");
  });

  it("reports every problem at once", () => {
    write("products/alpha.md", PRODUCT);
    write("changelog/alpha/v1.0.0.md", release("nope"));
    write("changelog/alpha/v1.1.0.md", release("also-nope"));

    expect(problemsOf(() => loadContent(root))).toHaveLength(2);
  });

  it("ignores dotfiles such as .DS_Store", () => {
    write("products/alpha.md", PRODUCT);
    write("products/.DS_Store", "");

    expect(loadContent(root).products).toHaveLength(1);
  });
});
