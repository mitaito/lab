import Link from "next/link";
import { changelogPath, releasePath, type Release } from "@/lib/content";
import { ReleaseStatusBadge } from "./release-status-badge";

/**
 * Server-rendered, so a page of releases costs HTML only. Row links skip
 * prefetching: with hundreds of releases that would be a request storm.
 *
 * One markup, two layouts. Below `lg` each release is a stacked card (scope
 * and version on the first line, then date, then summary), which reads well
 * from 320px up. From `lg` it is a four-column grid whose cells share a text
 * baseline.
 */
// The last track is fixed (not `auto`): every row is its own grid, so an auto
// track would size to each row's badge and leave the version column ragged.
const COLUMNS = "lg:grid-cols-[6.5rem_13rem_minmax(0,1fr)_10rem]";

export function ReleaseList({
  releases,
  label,
}: {
  releases: readonly Release[];
  label: string;
}) {
  if (releases.length === 0) {
    return (
      <p className="rounded-lg border border-surface-container-highest/60 bg-surface-container-low p-space-lg font-mono text-body-sm text-outline">
        No releases yet.
      </p>
    );
  }

  return (
    <div className="reveal overflow-hidden rounded-lg border border-surface-container-highest/60 bg-surface-container-low shadow-panel">
      <div
        aria-hidden="true"
        className={`hidden gap-x-4 border-b border-surface-container-highest/60 px-4 py-3 font-mono text-label-sm uppercase text-outline lg:grid ${COLUMNS}`}
      >
        <span>Date</span>
        <span>Product / Scope</span>
        <span>Changelog &amp; Dispatch Summary</span>
        <span>Version</span>
      </div>

      <ol
        aria-label={label}
        className="divide-y divide-surface-container-high/60"
      >
        {releases.map((release) => (
          <li
            key={`${release.product}/${release.version}`}
            className={`relative grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1.5 px-4 py-4 transition-colors before:absolute before:inset-y-2 before:left-0 before:w-0.5 before:origin-center before:scale-y-0 before:rounded-full before:bg-secondary before:transition-transform before:duration-300 hover:bg-surface-container/60 hover:before:scale-y-100 lg:items-baseline lg:gap-y-0 lg:py-3.5 ${COLUMNS}`}
          >
            <time
              dateTime={release.date}
              className="col-span-2 row-start-2 font-mono text-[12px] text-outline lg:col-span-1 lg:col-start-1 lg:row-start-1"
            >
              {release.date.replaceAll("-", ".")}
            </time>
            <Link
              href={changelogPath(release.product)}
              prefetch={false}
              className="col-start-1 row-start-1 -my-1.5 self-center rounded-xs py-1.5 font-mono text-body-sm font-medium text-primary hover:underline lg:col-start-2 lg:self-auto"
            >
              {release.scope}
            </Link>
            <p className="col-span-2 row-start-3 text-body-sm text-on-surface-variant lg:col-span-1 lg:col-start-3 lg:row-start-1">
              {release.summary}
            </p>
            <Link
              href={releasePath(release.product, release.version)}
              prefetch={false}
              aria-label={`${release.scope} ${release.version} release notes`}
              className="col-start-2 row-start-1 justify-self-end rounded-xs hover:underline lg:col-start-4 lg:justify-self-start"
            >
              <ReleaseStatusBadge release={release} />
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
