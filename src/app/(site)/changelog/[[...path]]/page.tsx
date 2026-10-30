import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/icon";
import { IssueLink } from "@/components/ui/issue-link";
import { JsonLd } from "@/components/ui/json-ld";
import { PageContainer } from "@/components/ui/page-container";
import { Pagination } from "@/components/changelog/pagination";
import { ProductFilter } from "@/components/changelog/product-filter";
import { ReleaseNotes } from "@/components/changelog/release-notes";
import { ReleaseStatusBadge } from "@/components/changelog/release-status-badge";
import { ReleaseList } from "@/components/changelog/release-list";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  changelogPath,
  changelogStaticPaths,
  getContent,
  getRelease,
  getReleases,
  PAGE_SIZE,
  paginate,
  parseChangelogPath,
  releasePath,
  type Page,
  type Product,
  type Release,
} from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

type Props = PageProps<"/changelog/[[...path]]">;

type Resolved =
  | { kind: "list"; product?: Product; page: Page<Release> }
  | { kind: "release"; product: Product; release: Release };

/** Every URL is prerendered; anything else resolves to null -> 404. */
export function generateStaticParams() {
  return changelogStaticPaths(getContent()).map((path) => ({ path }));
}

function resolve(segments: string[] | undefined): Resolved | null {
  const { products } = getContent();
  const bySlug = new Map(products.map((product) => [product.slug, product]));

  const route = parseChangelogPath(segments, new Set(bySlug.keys()));
  if (!route) return null;

  const product = route.product ? bySlug.get(route.product) : undefined;

  if (route.kind === "release") {
    const release = getRelease(route.product, route.version);
    return release && product ? { kind: "release", product, release } : null;
  }

  const page = paginate(getReleases(route.product), route.page);
  return page ? { kind: "list", product, page } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolved = resolve((await params).path);
  if (!resolved) return {};

  if (resolved.kind === "release") {
    const { release } = resolved;
    return pageMetadata({
      title: `${release.scope} ${release.version}`,
      description: release.summary,
      path: releasePath(release.product, release.version),
      publishedTime: release.date,
    });
  }

  const { product, page } = resolved;
  const base = product ? `${product.name} Changelog` : "Release Notes & Changelog";
  return pageMetadata({
    title: page.page > 1 ? `${base} (page ${page.page})` : base,
    description: product
      ? `Every release of ${product.name}. ${product.summary}`
      : "Chronological changelog and dispatch notes across all Mitaito Lab tools, engines, and prototypes.",
    path: changelogPath(product?.slug, page.page),
  });
}

/** Breadcrumb trail for search results: Home > Changelog > Product > Release. */
function Breadcrumbs({ trail }: { trail: { name: string; path: string }[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: trail.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: absoluteUrl(item.path),
        })),
      }}
    />
  );
}

export default async function ChangelogPage({ params }: Props) {
  const resolved = resolve((await params).path);
  if (!resolved) notFound();

  return (
    <PageContainer>
      {resolved.kind === "release" ? (
        <ReleaseView product={resolved.product} release={resolved.release} />
      ) : (
        <ListView product={resolved.product} page={resolved.page} />
      )}
    </PageContainer>
  );
}

function ListView({ product, page }: { product?: Product; page: Page<Release> }) {
  const { products } = getContent();
  const first = (page.page - 1) * PAGE_SIZE + 1;
  const last = first + page.items.length - 1;

  return (
    <div className="flex flex-col gap-space-md py-space-xl">
      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Changelog", path: changelogPath() },
          ...(product
            ? [{ name: product.name, path: changelogPath(product.slug) }]
            : []),
        ]}
      />
      <SectionHeading
        as="h1"
        eyebrow="Continuous Delivery"
        title={product ? `${product.name} Changelog` : "Release Notes & Changelog"}
        description={
          product
            ? product.summary
            : "Chronological changelog and dispatch notes across all lab tools, engines, and prototypes."
        }
      />
      <ProductFilter
        products={products.filter(
          (candidate) => getReleases(candidate.slug).length > 0,
        )}
        active={product?.slug ?? "all"}
      />
      <ReleaseList
        releases={page.items}
        label={`${product?.name ?? "All products"} releases, page ${page.page} of ${page.pageCount}`}
      />
      <div className="flex flex-wrap items-center justify-between gap-space-sm">
        <p className="font-mono text-label-sm text-outline">
          {page.total === 0
            ? "0 releases"
            : `Showing ${first}–${last} of ${page.total} releases`}
        </p>
        <Pagination
          page={page.page}
          pageCount={page.pageCount}
          hrefFor={(target) => changelogPath(product?.slug, target)}
        />
      </div>
    </div>
  );
}

function ReleaseView({ product, release }: { product: Product; release: Release }) {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-space-md py-space-xl">
      <Breadcrumbs
        trail={[
          { name: "Home", path: "/" },
          { name: "Changelog", path: changelogPath() },
          { name: product.name, path: changelogPath(product.slug) },
          {
            name: release.version,
            path: releasePath(release.product, release.version),
          },
        ]}
      />
      <Link
        href={changelogPath(product.slug)}
        className="inline-flex items-center gap-1 self-start font-mono text-label-md text-outline transition-colors hover:text-primary"
      >
        <Icon name="arrow_back" className="text-sm" />
        {product.name} changelog
      </Link>

      <header className="flex flex-col gap-space-sm">
        <h1 className="text-headline-lg text-primary">
          {release.scope}{" "}
          <span className="font-mono text-headline-md text-on-surface-variant">
            {release.version}
          </span>
        </h1>
        <div className="flex flex-wrap items-center gap-space-sm font-mono text-label-md text-outline">
          <time dateTime={release.date}>{release.date.replaceAll("-", ".")}</time>
          <ReleaseStatusBadge release={release} />
        </div>
        <p className="text-body-lg text-on-surface-variant">{release.summary}</p>
      </header>

      <ReleaseNotes markdown={release.body} />

      <aside className="mt-space-md flex flex-wrap items-center gap-x-space-md gap-y-space-xs border-t border-surface-container-highest/40 pt-space-md font-mono text-label-md text-outline">
        <span>Found a problem with {release.version}?</span>
        <IssueLink
          template="bug_report"
          title={`[${product.name} ${release.version}] `}
          className="inline-flex min-h-6 items-center text-primary underline underline-offset-4 hover:text-secondary"
        >
          Report a bug
        </IssueLink>
        <IssueLink
          template="feature_request"
          title={`[${product.name}] `}
          className="inline-flex min-h-6 items-center text-primary underline underline-offset-4 hover:text-secondary"
        >
          Suggest a feature
        </IssueLink>
      </aside>
    </article>
  );
}
