import Link from "next/link";
import { getProducts, getReleases } from "@/lib/content";
import { Icon } from "@/components/ui/icon";
import { ProductFilter } from "@/components/changelog/product-filter";
import { ReleaseList } from "@/components/changelog/release-list";
import { SectionHeading } from "@/components/ui/section-heading";

/** The landing page shows only the newest releases; /changelog has the rest. */
const LATEST = 6;

export function ChangelogSection() {
  const releases = getReleases();
  const withReleases = getProducts().filter((product) =>
    getReleases(product.slug).length > 0,
  );

  return (
    <section
      id="release-notes"
      className="flex scroll-mt-20 flex-col gap-space-md py-space-xl"
    >
      <SectionHeading
        eyebrow="Continuous Delivery"
        title="Release Notes & Changelog"
        description="Chronological changelog and dispatch notes across all lab tools, engines, and prototypes."
      />
      <ProductFilter products={withReleases} />
      <ReleaseList
        releases={releases.slice(0, LATEST)}
        label="Latest releases across all products"
      />
      {releases.length > LATEST && (
        <Link
          href="/changelog"
          className="group/link inline-flex min-h-9 items-center gap-1 self-start font-mono text-body-sm font-medium text-primary transition-colors hover:text-secondary"
        >
          View all {releases.length} releases
          <Icon
            name="arrow_forward"
            className="text-sm transition-transform group-hover/link:translate-x-0.5"
          />
        </Link>
      )}
    </section>
  );
}
