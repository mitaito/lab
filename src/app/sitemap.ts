import type { MetadataRoute } from "next";
import { changelogStaticPaths, getContent } from "@/lib/content";
import { absoluteUrl } from "@/lib/site";

/**
 * Every prerendered URL, straight from the same list that drives
 * generateStaticParams, so the sitemap cannot drift from what exists.
 * `lastModified` is the date of the newest release the page shows.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const content = getContent();
  const newest = content.releases[0]?.date;

  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: newest },
  ];

  for (const segments of changelogStaticPaths(content)) {
    const [product, version] = segments;
    const isRelease =
      segments.length === 2 && product !== "page" && version !== undefined;
    const release = isRelease
      ? content.releaseIndex.get(`${product}/${version}`)
      : undefined;
    const scoped = product && product !== "page" ? product : undefined;
    const lastModified =
      release?.date ??
      (scoped ? content.releasesByProduct.get(scoped)?.[0]?.date : newest);

    entries.push({
      url: absoluteUrl(`/changelog${segments.length ? `/${segments.join("/")}` : ""}`),
      lastModified,
    });
  }

  return entries;
}
