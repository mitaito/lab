import { describe, expect, it } from "vitest";
import { pageMetadata } from "./seo";

describe("pageMetadata", () => {
  const meta = pageMetadata({
    title: "Mi caro v2.4.0",
    description: "A release.",
    path: "/changelog/mi-caro/v2.4.0",
  });

  it("sets a canonical URL for the page", () => {
    expect(meta.alternates?.canonical).toBe("/changelog/mi-caro/v2.4.0");
  });

  it("keeps the share image, since a page's openGraph replaces the layout's", () => {
    const og = meta.openGraph as { images?: { url: string }[] };
    expect(og.images?.[0]?.url).toBe("/opengraph-image");
    expect((meta.twitter as { images?: string[] }).images).toEqual([
      "/opengraph-image",
    ]);
  });

  it("brands the social titles but leaves the page title to the template", () => {
    expect(meta.title).toBe("Mi caro v2.4.0");
    expect(meta.openGraph?.title).toBe("Mi caro v2.4.0 — Mitaito Lab");
    expect(meta.openGraph).toMatchObject({
      siteName: "Mitaito Lab",
      locale: "en_US",
      type: "website",
    });
  });

  it("marks releases as articles with their publish date", () => {
    const article = pageMetadata({
      title: "T",
      description: "D",
      path: "/x",
      publishedTime: "2025-02-18",
    });

    expect(article.openGraph).toMatchObject({
      type: "article",
      publishedTime: "2025-02-18",
    });
  });
});
