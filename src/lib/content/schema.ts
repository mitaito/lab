import { z } from "zod";

export const PRODUCT_STATUSES = ["prod", "beta", "alpha"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

/** Which mini 2.5D illustration a product card renders. */
export const PRODUCT_PREVIEWS = [
  "gomoku",
  "waveform",
  "agents",
  "force",
  "lenia",
  "crdt",
] as const;
export type ProductPreview = (typeof PRODUCT_PREVIEWS)[number];

export const RELEASE_STATUSES = [
  "merged",
  "live",
  "beta",
  "stable",
  "alpha",
] as const;
export type ReleaseStatus = (typeof RELEASE_STATUSES)[number];

/** Slugs and versions end up in URLs, so keep them URL-safe. */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const VERSION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
/**
 * `/changelog/page/<n>` is the pagination route, so neither a product slug nor
 * a release version may be `page`.
 */
export const RESERVED_SEGMENTS: readonly string[] = ["page"];

const text = z.string().trim().min(1);

/** A real calendar date; `2025-02-30` is rejected rather than rolled over. */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "expected a date like 2025-02-18")
  .refine((value) => {
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, "not a real calendar date");

const experimentSchema = z.strictObject({
  id: text,
  title: text,
  domain: text,
  summary: text,
  metric: text,
});

/**
 * Front-matter of `content/products/<slug>.md`. Unknown keys are rejected.
 * Values arrive as strings (see parseFrontMatter), so numbers are converted
 * here.
 */
export const productSchema = z.strictObject({
  name: text,
  shortName: text,
  /** Position in the product directory, ascending. */
  order: z
    .string()
    .regex(/^-?\d+$/, "expected a whole number")
    .transform(Number),
  status: z.enum(PRODUCT_STATUSES),
  summary: text,
  tags: z.array(text).min(1),
  preview: z.enum(PRODUCT_PREVIEWS),
  /** Material Symbols icon name, e.g. `sports_esports`. */
  icon: z.string().regex(/^[a-z0-9_]+$/, "expected a Material Symbols name like sports_esports"),
  metric: text,
  demoUrl: z
    .string()
    .regex(/^(https?:\/\/|\/)/, "expected an http(s) URL or a /path")
    .optional(),
  experiment: experimentSchema.optional(),
});

/** Front-matter of `content/changelog/<product>/<version>.md`. */
export const releaseSchema = z.strictObject({
  date: isoDate,
  status: z.enum(RELEASE_STATUSES),
  /** One line, shown in changelog tables. */
  summary: text,
  /** Label in the table; defaults to the product name. */
  scope: text.optional(),
});

export type ProductFrontMatter = z.output<typeof productSchema>;
export type ProductExperiment = NonNullable<ProductFrontMatter["experiment"]>;
export type ReleaseFrontMatter = z.output<typeof releaseSchema>;

export interface Product extends ProductFrontMatter {
  slug: string;
  /** Version of the newest release, or null if there are none yet. */
  version: string | null;
}

export interface Release {
  product: string;
  /** The file name without `.md`, e.g. `v2.4.0`. */
  version: string;
  date: string;
  status: ReleaseStatus;
  scope: string;
  summary: string;
  /** Markdown notes below the front-matter; may be empty. */
  body: string;
}
