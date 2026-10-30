import Link from "next/link";
import { CONSTELLATION_PATH } from "@/lib/constellation";
import { Icon } from "./icon";

/**
 * Looks like a switch, is a link: turning it on goes to the full-window 3D
 * view, turning it off there goes home. Being a plain link it works before
 * (and without) JavaScript. `prefetch={false}` so nothing 3D is fetched until
 * it is used. Each caller sets the display class, as <Header> does for its
 * links: the hero hides it below `lg`, the 3D view always shows it.
 */
export function ConstellationSwitch({
  on = false,
  className = "",
}: {
  on?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={on ? "/" : CONSTELLATION_PATH}
      prefetch={false}
      aria-label={on ? "Exit 3D mode" : "Enter 3D mode"}
      title={on ? "Exit 3D mode (Esc)" : "Enter 3D mode"}
      className={`relative z-10 items-center gap-1.5 rounded-xs border border-surface-container-highest/40 bg-surface-container px-2 py-0.5 font-mono text-label-sm text-on-surface-variant transition-colors hover:text-primary ${className}`}
    >
      <Icon name="view_in_ar" className="text-xs" />
      3D MODE
      <span
        aria-hidden="true"
        className={`relative h-4 w-7 rounded-full border transition-colors ${
          on
            ? "border-secondary/60 bg-secondary/25"
            : "border-surface-container-highest bg-surface-container-high"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 size-2.5 rounded-full transition-transform duration-200 ${
            on
              ? "translate-x-3 bg-secondary shadow-[0_0_6px_var(--secondary)]"
              : "translate-x-0 bg-outline"
          }`}
        />
      </span>
    </Link>
  );
}
