import Link from "next/link";
import { Icon } from "./icon";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

/**
 * Phone: logo + icon-only Changelog link + toggle (fits down to 320px).
 * Tablet: adds the text label, version badge and Source link.
 * Desktop: adds the descriptive subtitle.
 */
export function Header() {
  // No display class here: each link sets its own, so `hidden` is not
  // overridden by a shared `inline-flex`.
  const action =
    "h-9 items-center justify-center gap-1.5 rounded-xs px-2.5 font-mono text-label-sm text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-primary";

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-surface-container-highest/60 bg-surface/90 shadow-[0_1px_8px_rgb(0_0_0/0.25)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between gap-space-sm px-margin-mobile sm:gap-space-md sm:px-margin">
        <Link
          href="/"
          aria-label="Mitaito Lab, home"
          className="flex min-w-0 items-center gap-space-sm rounded-xs"
        >
          <Logo />
          <span className="hidden flex-col sm:flex">
            <span className="w-fit rounded-xs border border-surface-container-highest/60 bg-surface-container-lowest px-space-xs py-0.5 font-mono text-label-sm text-outline">
              v0.94-alpha
            </span>
          </span>
          <span className="hidden font-mono text-label-sm text-on-surface-variant xl:inline">
            Unrestricted Research &amp; Experiments
          </span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-space-sm">
          <Link
            href="/changelog"
            className={`${action} inline-flex`}
            aria-label="Changelog"
          >
            <Icon name="update" className="text-base sm:text-sm" />
            <span className="hidden sm:inline">Changelog</span>
          </Link>
          <a
            href="https://github.com/mitaito/mi-lab"
            target="_blank"
            rel="noopener noreferrer"
            className={`${action} hidden sm:inline-flex`}
          >
            <Icon name="code" className="text-sm" />
            Source
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
