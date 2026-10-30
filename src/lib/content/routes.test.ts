import { describe, expect, it } from "vitest";
import type { Content } from "./load";
import { paginate } from "./paginate";
import {
  changelogPath,
  changelogStaticPaths,
  parseChangelogPath,
  releasePath,
} from "./routes";
import type { Product, Release } from "./schema";

const products = new Set(["mi-caro", "lenia"]);

describe("paginate", () => {
  const items = Array.from({ length: 45 }, (_, index) => index);

  it("slices a page and reports the totals", () => {
    const page = paginate(items, 3, 20);

    expect(page?.items).toEqual(items.slice(40));
    expect(page).toMatchObject({ page: 3, pageCount: 3, total: 45 });
  });

  it("treats an empty list as one empty page", () => {
    expect(paginate([], 1)).toMatchObject({ items: [], page: 1, pageCount: 1 });
  });

  it.each([0, -1, 4, 1.5, Number.NaN])("rejects page %s", (page) => {
    expect(paginate(items, page, 20)).toBeNull();
  });
});

describe("changelog URLs", () => {
  it("builds paths with the first page on the bare URL", () => {
    expect(changelogPath()).toBe("/changelog");
    expect(changelogPath(undefined, 1)).toBe("/changelog");
    expect(changelogPath(undefined, 3)).toBe("/changelog/page/3");
    expect(changelogPath("mi-caro")).toBe("/changelog/mi-caro");
    expect(changelogPath("mi-caro", 2)).toBe("/changelog/mi-caro/page/2");
    expect(releasePath("mi-caro", "v2.4.0")).toBe("/changelog/mi-caro/v2.4.0");
  });

  it.each([
    [undefined, { kind: "list", page: 1 }],
    [[], { kind: "list", page: 1 }],
    [["page", "2"], { kind: "list", page: 2 }],
    [["mi-caro"], { kind: "list", product: "mi-caro", page: 1 }],
    [["mi-caro", "page", "12"], { kind: "list", product: "mi-caro", page: 12 }],
    [["mi-caro", "v2.4.0"], { kind: "release", product: "mi-caro", version: "v2.4.0" }],
  ])("parses %j", (segments, expected) => {
    expect(parseChangelogPath(segments, products)).toEqual(expected);
  });

  it.each([
    [["page"]],
    [["page", "1"]],
    [["page", "0"]],
    [["page", "two"]],
    [["page", "02"]],
    [["nope"]],
    [["mi-caro", "page", "1"]],
    [["mi-caro", "page"]],
    [["mi-caro", "v1", "extra"]],
  ])("rejects %j", (segments) => {
    expect(parseChangelogPath(segments, products)).toBeNull();
  });
});

describe("changelogStaticPaths", () => {
  const product = (slug: string): Product => ({
    slug,
    name: slug,
    shortName: slug,
    order: 1,
    status: "prod",
    summary: "s",
    tags: ["t"],
    preview: "gomoku",
    icon: "bolt",
    metric: "m",
    version: null,
  });
  const release = (productSlug: string, version: string): Release => ({
    product: productSlug,
    version,
    date: "2025-01-01",
    status: "live",
    scope: productSlug,
    summary: "s",
    body: "",
  });

  function contentWith(counts: Record<string, number>): Content {
    const releases: Release[] = [];
    const releasesByProduct = new Map<string, Release[]>();
    for (const [slug, count] of Object.entries(counts)) {
      const list = Array.from({ length: count }, (_, i) => release(slug, `v1.${i}.0`));
      releasesByProduct.set(slug, list);
      releases.push(...list);
    }
    return {
      products: Object.keys(counts).map(product),
      releases,
      releasesByProduct,
      releaseIndex: new Map(),
    };
  }

  it("always includes the index, even with no releases", () => {
    expect(changelogStaticPaths(contentWith({ a: 0 }))).toEqual([[], ["a"]]);
  });

  it("covers list pages and every release", () => {
    const paths = changelogStaticPaths(contentWith({ a: 45, b: 3 })).map((p) =>
      p.join("/"),
    );

    expect(paths).toContain("page/3"); // 48 releases -> 3 pages
    expect(paths).not.toContain("page/4");
    expect(paths).toContain("a/page/3"); // 45 releases -> 3 pages
    expect(paths).not.toContain("b/page/2");
    expect(paths).toContain("a/v1.44.0");
    // index + 2 list pages + (a: 1 + 2 pages + 45 releases) + (b: 1 + 3 releases)
    expect(paths).toHaveLength(1 + 2 + (1 + 2 + 45) + (1 + 3));
  });

  it("round-trips through the parser", () => {
    const content = contentWith({ a: 45, b: 3 });
    const known = new Set(content.products.map((p) => p.slug));

    for (const segments of changelogStaticPaths(content)) {
      expect(parseChangelogPath(segments, known)).not.toBeNull();
    }
  });
});
