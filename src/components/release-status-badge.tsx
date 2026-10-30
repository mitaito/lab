import type { Release, ReleaseStatus } from "@/lib/content";

const STYLE: Record<ReleaseStatus, { dot: boolean; text: string }> = {
  merged: { dot: true, text: "text-secondary" },
  live: { dot: true, text: "text-secondary" },
  beta: { dot: false, text: "text-primary" },
  stable: { dot: false, text: "text-on-surface-variant" },
  alpha: { dot: false, text: "text-outline" },
};

export function ReleaseStatusBadge({
  release,
}: {
  release: Pick<Release, "version" | "status">;
}) {
  const style = STYLE[release.status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xs border border-surface-container-highest/50 bg-surface-container-high px-2 py-0.5 font-mono text-[11px] ${style.text}`}
    >
      {style.dot && <span className="size-1.5 rounded-full bg-secondary" />}
      {release.version} <span className="capitalize">{release.status}</span>
    </span>
  );
}
