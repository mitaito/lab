import type { Metadata } from "next";
import Link from "next/link";
import { ConstellationScreen } from "@/components/3d/constellation-screen";
import { type LabInfo, toSatellites } from "@/lib/constellation";
import { changelogPath, getProducts, getReleases } from "@/lib/content";
import { LAB_SUMMARY, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "3D constellation",
  description:
    "Every Mitaito Lab product as a satellite orbiting the central research nucleus, in an interactive full-window 3D view.",
  // The page is a canvas with no copy of its own; the same products are
  // indexed on the home page. `follow` stays on, and robots.txt must keep
  // allowing the URL so crawlers can read this directive.
  robots: { index: false, follow: true },
};

export default function ConstellationPage() {
  const products = getProducts();
  // What the nucleus's hover card says: the lab, with real counts.
  const lab: LabInfo = {
    name: SITE_NAME,
    summary: LAB_SUMMARY,
    products: products.length,
    releases: getReleases().length,
  };

  return (
    <ConstellationScreen satellites={toSatellites(products)} lab={lab}>
      <h1 className="sr-only">Mitaito Lab: 3D constellation of lab products</h1>
      <p className="sr-only">{LAB_SUMMARY}</p>
      <ul className="sr-only">
        {products.map((product) => (
          <li key={product.slug}>
            <Link href={changelogPath(product.slug)} prefetch={false}>
              {product.name}
            </Link>
            : {product.summary}
          </li>
        ))}
      </ul>
    </ConstellationScreen>
  );
}
