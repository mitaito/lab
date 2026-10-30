import fs from "node:fs";
import path from "node:path";
import type { z } from "zod";
import { parseFrontMatter, type FrontMatter } from "./frontmatter";
import {
  productSchema,
  releaseSchema,
  RESERVED_SEGMENTS,
  SLUG_PATTERN,
  VERSION_PATTERN,
  type Product,
  type Release,
} from "./schema";

export interface Content {
  /** In display order. */
  products: Product[];
  /** Every release, newest first. */
  releases: Release[];
  releasesByProduct: Map<string, Release[]>;
  /** Keyed by `<product>/<version>`. */
  releaseIndex: Map<string, Release>;
}

export class ContentError extends Error {
  constructor(readonly problems: string[]) {
    super(
      `Invalid content (${problems.length} problem${problems.length === 1 ? "" : "s"}):\n` +
        problems.map((problem) => `  - ${problem}`).join("\n"),
    );
    this.name = "ContentError";
  }
}

const EXTENSION = ".md";

/** Newest first; ties broken by product, then version (numeric-aware). */
function compareReleases(a: Release, b: Release): number {
  return (
    b.date.localeCompare(a.date) ||
    a.product.localeCompare(b.product) ||
    b.version.localeCompare(a.version, undefined, { numeric: true })
  );
}

function describe(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const field = issue.path.join(".");
      return field ? `${field}: ${issue.message}` : issue.message;
    })
    .join("; ");
}

/** Parsed front-matter, or a one-line reason why the file can't be read. */
function readFrontMatter(file: string): FrontMatter | string {
  try {
    return (
      parseFrontMatter(fs.readFileSync(file, "utf8")) ??
      "missing front-matter: the file must start with a --- block"
    );
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    return `invalid YAML: ${reason.split("\n")[0]}`;
  }
}

/** Names of the visible entries of `dir`; an absent dir yields nothing. */
function entries(dir: string): fs.Dirent[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith("."))
    .toSorted((a, b) => a.name.localeCompare(b.name));
}

/**
 * Reads and validates `<root>/products` and `<root>/changelog`. Every problem
 * is collected so a contributor sees all of them at once, with file paths.
 */
export function loadContent(root: string): Content {
  const problems: string[] = [];
  const where = (file: string) => path.relative(root, file);

  const productsDir = path.join(root, "products");
  if (!fs.existsSync(productsDir)) {
    throw new ContentError([`missing directory: ${where(productsDir)}`]);
  }

  const products = new Map<string, Product>();
  const knownSlugs = new Set<string>();

  for (const entry of entries(productsDir)) {
    const file = path.join(productsDir, entry.name);
    if (!entry.isFile() || !entry.name.endsWith(EXTENSION)) {
      problems.push(`${where(file)}: expected a ${EXTENSION} file`);
      continue;
    }
    const slug = entry.name.slice(0, -EXTENSION.length);
    knownSlugs.add(slug);

    if (!SLUG_PATTERN.test(slug) || RESERVED_SEGMENTS.includes(slug)) {
      problems.push(
        `${where(file)}: "${slug}" is not a valid product slug (lowercase letters, digits and dashes; not ${RESERVED_SEGMENTS.join(", ")})`,
      );
      continue;
    }

    const frontMatter = readFrontMatter(file);
    if (typeof frontMatter === "string") {
      problems.push(`${where(file)}: ${frontMatter}`);
      continue;
    }
    const parsed = productSchema.safeParse(frontMatter.data);
    if (!parsed.success) {
      problems.push(`${where(file)}: ${describe(parsed.error)}`);
      continue;
    }
    products.set(slug, { ...parsed.data, slug, version: null });
  }

  const releases: Release[] = [];
  const changelogDir = path.join(root, "changelog");

  for (const folder of entries(changelogDir)) {
    const folderPath = path.join(changelogDir, folder.name);
    if (!folder.isDirectory()) {
      problems.push(`${where(folderPath)}: expected a product folder`);
      continue;
    }
    if (!knownSlugs.has(folder.name)) {
      problems.push(
        `${where(folderPath)}: no matching products/${folder.name}${EXTENSION}`,
      );
      continue;
    }
    const product = products.get(folder.name);

    for (const entry of entries(folderPath)) {
      const file = path.join(folderPath, entry.name);
      if (!entry.isFile() || !entry.name.endsWith(EXTENSION)) {
        problems.push(`${where(file)}: expected a ${EXTENSION} file`);
        continue;
      }
      const version = entry.name.slice(0, -EXTENSION.length);
      if (!VERSION_PATTERN.test(version) || RESERVED_SEGMENTS.includes(version)) {
        problems.push(
          `${where(file)}: "${version}" is not a valid version (letters, digits, ".", "_" and "-"; not ${RESERVED_SEGMENTS.join(", ")})`,
        );
        continue;
      }

      const frontMatter = readFrontMatter(file);
      if (typeof frontMatter === "string") {
        problems.push(`${where(file)}: ${frontMatter}`);
        continue;
      }
      const parsed = releaseSchema.safeParse(frontMatter.data);
      if (!parsed.success) {
        problems.push(`${where(file)}: ${describe(parsed.error)}`);
        continue;
      }
      if (!product) continue; // the product's own error is already reported

      const { scope, ...rest } = parsed.data;
      releases.push({
        ...rest,
        product: folder.name,
        version,
        scope: scope ?? product.name,
        body: frontMatter.content.trim(),
      });
    }
  }

  if (problems.length > 0) throw new ContentError(problems);

  releases.sort(compareReleases);

  const releasesByProduct = new Map<string, Release[]>();
  const releaseIndex = new Map<string, Release>();
  for (const release of releases) {
    const list = releasesByProduct.get(release.product) ?? [];
    list.push(release);
    releasesByProduct.set(release.product, list);
    releaseIndex.set(`${release.product}/${release.version}`, release);
  }

  for (const product of products.values()) {
    product.version = releasesByProduct.get(product.slug)?.[0]?.version ?? null;
  }

  return {
    products: [...products.values()].toSorted(
      (a, b) => a.order - b.order || a.slug.localeCompare(b.slug),
    ),
    releases,
    releasesByProduct,
    releaseIndex,
  };
}
