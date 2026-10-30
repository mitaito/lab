import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/** Page numbers to show: the ends and the current page's neighbours. */
function visiblePages(page: number, pageCount: number): (number | "gap")[] {
  const wanted = new Set([1, pageCount, page - 1, page, page + 1]);
  const pages = [...wanted]
    .filter((candidate) => candidate >= 1 && candidate <= pageCount)
    .toSorted((a, b) => a - b);

  const result: (number | "gap")[] = [];
  pages.forEach((current, index) => {
    if (index > 0 && current - pages[index - 1]! > 1) result.push("gap");
    result.push(current);
  });
  return result;
}

export function Pagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  const edge = "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-xs px-2";
  const idle = `${edge} text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary`;

  return (
    <nav aria-label="Pagination" className="font-mono text-label-md">
      <ul className="flex flex-wrap items-center gap-1">
        {page > 1 && (
          <li>
            <Link href={hrefFor(page - 1)} rel="prev" className={idle}>
              <Icon name="arrow_back" className="text-sm" />
              Prev
            </Link>
          </li>
        )}
        {visiblePages(page, pageCount).map((item, index) =>
          item === "gap" ? (
            <li key={`gap-${index}`} aria-hidden="true" className="px-1 text-outline">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                href={hrefFor(item)}
                aria-current={item === page ? "page" : undefined}
                aria-label={`Page ${item}`}
                className={
                  item === page
                    ? `${edge} bg-surface-container-high font-medium text-primary`
                    : idle
                }
              >
                {item}
              </Link>
            </li>
          ),
        )}
        {page < pageCount && (
          <li>
            <Link href={hrefFor(page + 1)} rel="next" className={idle}>
              Next
              <Icon name="arrow_forward" className="text-sm" />
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
