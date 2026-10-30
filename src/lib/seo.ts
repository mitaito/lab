import type { Metadata } from "next";
import { SITE_NAME } from "./site";

/** The share card from src/app/opengraph-image.tsx (1200x630). */
const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME}: interactive research in game theory, simulation and emergent systems`,
};

/**
 * Per-page metadata with a canonical URL and matching Open Graph / Twitter
 * tags. A page's `openGraph` replaces the layout's wholesale (including the
 * file-based share image), so every page that sets one must go through here to
 * keep siteName, locale and the image.
 */
export function pageMetadata({
  title,
  description,
  path,
  publishedTime,
}: {
  title: string;
  description: string;
  /** Path of this page, e.g. `/changelog/mi-caro`. */
  path: string;
  /** Set for article-like pages such as a release. */
  publishedTime?: string;
}): Metadata {
  const fullTitle = `${title} — ${SITE_NAME}`;
  const base = {
    siteName: SITE_NAME,
    locale: "en_US",
    title: fullTitle,
    description,
    url: path,
    images: [SHARE_IMAGE],
  };

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: publishedTime
      ? { ...base, type: "article", publishedTime }
      : { ...base, type: "website" },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}
