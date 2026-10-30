import type { Content } from "./load";
import { PAGE_SIZE } from "./paginate";
import { RESERVED_SEGMENTS } from "./schema";

/**
 * URL scheme of the changelog, all served by one optional catch-all route:
 *
 *   /changelog                       all products, page 1
 *   /changelog/page/2                all products, page 2
 *   /changelog/mi-caro               one product, page 1
 *   /changelog/mi-caro/page/2        one product, page 2
 *   /changelog/mi-caro/v2.4.0        one release
 */
export type ChangelogRoute =
  | { kind: "list"; product?: string; page: number }
  | { kind: "release"; product: string; version: string };

export function changelogPath(product?: string, page = 1): string {
  const base = product ? `/changelog/${product}` : "/changelog";
  return page > 1 ? `${base}/page/${page}` : base;
}

export function releasePath(product: string, version: string): string {
  return `/changelog/${product}/${version}`;
}

/** Page 1 is the bare path, so `/page/1` is not a valid URL. */
function pageNumber(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const page = Number(value);
  return page >= 2 ? page : null;
}

/**
 * Maps the catch-all segments to a route. This only checks the shape and that
 * the product exists; the caller still checks the page/version is in range.
 */
export function parseChangelogPath(
  segments: readonly string[] | undefined,
  knownProducts: ReadonlySet<string>,
): ChangelogRoute | null {
  const parts = segments ?? [];

  if (parts.length === 0) return { kind: "list", page: 1 };

  if (parts[0] === "page") {
    const page = parts.length === 2 ? pageNumber(parts[1]!) : null;
    return page ? { kind: "list", page } : null;
  }

  const product = parts[0]!;
  if (!knownProducts.has(product)) return null;

  if (parts.length === 1) return { kind: "list", product, page: 1 };

  if (parts.length === 2) {
    const version = parts[1]!;
    return RESERVED_SEGMENTS.includes(version)
      ? null
      : { kind: "release", product, version };
  }

  if (parts.length === 3 && parts[1] === "page") {
    const page = pageNumber(parts[2]!);
    return page ? { kind: "list", product, page } : null;
  }

  return null;
}

/** Every changelog URL to prerender, as catch-all segment arrays. */
export function changelogStaticPaths(content: Content): string[][] {
  const paths: string[][] = [[]];
  const pagesOf = (count: number) =>
    Math.max(1, Math.ceil(count / PAGE_SIZE));

  for (let page = 2; page <= pagesOf(content.releases.length); page++) {
    paths.push(["page", String(page)]);
  }

  for (const product of content.products) {
    const releases = content.releasesByProduct.get(product.slug) ?? [];
    paths.push([product.slug]);
    for (let page = 2; page <= pagesOf(releases.length); page++) {
      paths.push([product.slug, "page", String(page)]);
    }
    for (const release of releases) {
      paths.push([product.slug, release.version]);
    }
  }

  return paths;
}
