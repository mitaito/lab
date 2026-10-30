import path from "node:path";
import { cache } from "react";
import { loadContent, type Content } from "./load";
import type { Product, Release } from "./schema";

export type { Content } from "./load";
export type {
  Product,
  ProductExperiment,
  ProductPreview,
  ProductStatus,
  Release,
  ReleaseStatus,
} from "./schema";
export { PAGE_SIZE, paginate, type Page } from "./paginate";
export {
  changelogPath,
  changelogStaticPaths,
  parseChangelogPath,
  releasePath,
  type ChangelogRoute,
} from "./routes";

/** `CONTENT_DIR` lets tests and benchmarks point at another content tree. */
const contentDir = () =>
  process.env.CONTENT_DIR ?? path.join(process.cwd(), "content");

const loadPerRequest = cache(() => loadContent(contentDir()));
let loaded: Content | undefined;

/**
 * Production parses the files once per process (the build, then nothing at
 * runtime since every page is prerendered). Development re-reads per request
 * so edits to the Markdown show up on refresh.
 */
export function getContent(): Content {
  if (process.env.NODE_ENV !== "production") return loadPerRequest();
  return (loaded ??= loadContent(contentDir()));
}

export function getProducts(): Product[] {
  return getContent().products;
}

/** Newest first; all products unless one is given. */
export function getReleases(product?: string): Release[] {
  const content = getContent();
  return product
    ? (content.releasesByProduct.get(product) ?? [])
    : content.releases;
}

export function getRelease(
  product: string,
  version: string,
): Release | undefined {
  return getContent().releaseIndex.get(`${product}/${version}`);
}
