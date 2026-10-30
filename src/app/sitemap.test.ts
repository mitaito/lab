import { describe, expect, it } from "vitest";
import { changelogStaticPaths, getContent } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import sitemap from "./sitemap";

describe("sitemap", () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);

  it("lists the home page and every prerendered changelog URL", () => {
    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls).toContain(`${SITE_URL}/changelog`);
    expect(entries).toHaveLength(1 + changelogStaticPaths(getContent()).length);
  });

  it("uses absolute, unique URLs", () => {
    expect(urls.every((url) => url.startsWith(`${SITE_URL}/`))).toBe(true);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("dates each release page with the release date", () => {
    const [release] = getContent().releases;
    const entry = entries.find(
      (candidate) =>
        candidate.url ===
        `${SITE_URL}/changelog/${release!.product}/${release!.version}`,
    );

    expect(entry?.lastModified).toBe(release!.date);
  });
});
