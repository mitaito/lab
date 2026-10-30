import Link from "next/link";
import { changelogPath, type Product } from "@/lib/content";

/**
 * Product filter as plain links to prerendered pages: no client JS, and the
 * cost of a click does not grow with the number of releases.
 */
export function ProductFilter({
  products,
  active,
}: {
  products: readonly Pick<Product, "slug" | "shortName">[];
  /** A product slug, "all", or undefined when nothing is selected. */
  active?: string;
}) {
  const link = (selected: boolean) =>
    `inline-flex min-h-9 items-center rounded-xs px-3 text-label-sm transition-colors ${
      selected
        ? "bg-surface-container-high font-medium text-primary"
        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
    }`;

  return (
    <nav
      aria-label="Filter by product"
      className="flex flex-wrap items-center gap-1 rounded-lg border border-surface-container-highest/60 bg-surface-container-lowest p-1.5 font-mono"
    >
      <Link
        href={changelogPath()}
        aria-current={active === "all" ? "page" : undefined}
        className={link(active === "all")}
      >
        All Products
      </Link>
      {products.map((product) => (
        <Link
          key={product.slug}
          href={changelogPath(product.slug)}
          aria-current={active === product.slug ? "page" : undefined}
          className={link(active === product.slug)}
        >
          {product.shortName}
        </Link>
      ))}
    </nav>
  );
}
