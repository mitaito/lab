import type { Product, ProductPreview as PreviewKind } from "@/lib/content";
import Link from "next/link";
import { changelogPath } from "@/lib/content";
import { Icon } from "./icon";
import { IsoCard } from "./iso-card";
import { ProjectPreview } from "./project-preview";

/** Ambient glow behind the top-right corner of each card. */
const GLOW: Record<PreviewKind, string> = {
  gomoku: "bg-secondary/10 group-hover:bg-secondary/20",
  waveform: "bg-emerald-500/10 group-hover:bg-emerald-500/20",
  agents: "bg-cyan-500/10 group-hover:bg-cyan-500/20",
  force: "bg-secondary/10 group-hover:bg-secondary/20",
  lenia: "bg-emerald-400/10 group-hover:bg-emerald-400/20",
  crdt: "bg-purple-500/10 group-hover:bg-purple-500/20",
};

export function ProjectCard({ project }: { project: Product }) {
  return (
    <IsoCard className="reveal group relative flex flex-col justify-between overflow-hidden rounded-lg border border-surface-container-highest/70 bg-surface-container-low p-space-md shadow-depth hover:border-secondary/50">
      <div
        className={`pointer-events-none absolute -right-8 -top-8 size-28 rounded-full blur-2xl transition-all ${GLOW[project.preview]}`}
      />

      <div className="relative z-10 flex flex-col gap-space-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {project.version && (
              <span className="rounded-xs border border-surface-container-highest bg-surface-container-highest px-1.5 py-0.5 font-mono text-[11px] text-primary">
                {project.version}
              </span>
            )}
            <span
              className={`font-mono text-label-sm uppercase ${
                project.status === "prod" ? "text-outline" : "text-secondary"
              }`}
            >
              {project.status}
            </span>
          </div>
          <Link
            href={changelogPath(project.slug)}
            prefetch={false}
            className="-my-2 flex items-center gap-1 py-2 font-mono text-[11px] text-outline transition-colors hover:text-secondary"
          >
            Changelog
            <Icon name="history" className="text-xs" />
          </Link>
        </div>

        <ProjectPreview kind={project.preview} />

        <div>
          <h3 className="text-headline-sm text-primary transition-colors group-hover:text-secondary">
            {project.name}
          </h3>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {project.summary}
          </p>
        </div>

        <ul className="flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <li
              key={tag}
              className="rounded-xs bg-surface-container px-2 py-0.5 font-mono text-label-sm text-on-surface-variant"
            >
              {tag}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative z-10 mt-space-md flex items-center justify-between border-t border-surface-container-highest/40 pt-space-sm">
        {project.demoUrl ? (
          <a
            href={project.demoUrl}
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-primary transition-colors hover:text-secondary"
          >
            <Icon name={project.icon} className="text-sm" />
            Launch Demo
          </a>
        ) : (
          <span
            title="Demo not published yet"
            className="inline-flex items-center gap-1.5 text-body-sm font-medium text-outline"
          >
            <Icon name={project.icon} className="text-sm" />
            Demo soon
          </span>
        )}
        <span className="font-mono text-[11px] text-outline">
          {project.metric}
        </span>
      </div>
    </IsoCard>
  );
}
