"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";

export interface ExperimentTile {
  id: string;
  title: string;
  domain: string;
  summary: string;
  metric: string;
  demoUrl: string | null;
}

/** Only "Featured" has content so far; the others are placeholders. */
const TABS = ["Featured", "Active Tracks", "Methodology", "System Specs"];

export function ExperimentExplorer({
  experiments,
}: {
  experiments: ExperimentTile[];
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const needle = query.trim().toLowerCase();
  const visible = experiments.filter((experiment) =>
    [experiment.id, experiment.title, experiment.domain, experiment.summary]
      .join(" ")
      .toLowerCase()
      .includes(needle),
  );

  return (
    <div className="reveal flex flex-col gap-space-md rounded-lg border border-surface-container-highest/60 bg-surface-container-low p-space-md shadow-panel">
      <div className="flex flex-wrap items-center justify-between gap-space-sm border-b border-surface-container-highest/40 pb-space-sm">
        <div
          role="tablist"
          aria-label="Experiment views"
          className="inline-flex max-w-full overflow-x-auto rounded-lg border border-surface-container-highest/50 bg-surface-container-lowest p-1 font-mono text-body-sm"
        >
          {TABS.map((tab, index) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={index === 0}
              disabled={index !== 0}
              title={index === 0 ? undefined : "Coming soon"}
              className={
                index === 0
                  ? "shrink-0 rounded-xs bg-surface-container-high px-3 py-1.5 font-medium text-primary"
                  : "shrink-0 rounded-xs px-3 py-1.5 text-on-surface-variant opacity-60"
              }
            >
              {tab}
            </button>
          ))}
        </div>

        <label className="flex w-full items-center gap-2 rounded-lg sm:w-auto border border-surface-container-highest/50 bg-surface-container-lowest px-3 py-1.5 font-mono text-label-sm text-outline focus-within:border-outline">
          <Icon name="search" className="text-sm" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter experiments..."
            aria-label="Filter experiments"
            className="min-w-0 flex-1 bg-transparent py-1.5 text-on-surface outline-none placeholder:text-outline sm:w-44 sm:flex-none"
          />
          <kbd className="rounded-xs bg-surface-container-high px-1.5 py-0.5 text-[10px] text-on-surface">
            ⌘K
          </kbd>
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="py-space-lg text-center font-mono text-body-sm text-outline">
          No experiments match &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-space-sm font-mono md:grid-cols-2 lg:grid-cols-3">
          {visible.map((experiment) => (
            <li
              key={experiment.id}
              className="flex flex-col justify-between gap-2 rounded-lg border border-surface-container-highest/40 bg-surface-container p-space-sm transition-all hover:-translate-y-0.5 hover:border-secondary/40"
            >
              <div className="flex items-start justify-between">
                <span className="text-label-sm text-secondary">
                  #{experiment.id}
                </span>
                <span className="rounded-xs border border-surface-container-highest/40 bg-surface-container-lowest px-1.5 py-0.5 text-[10px] text-outline">
                  {experiment.domain}
                </span>
              </div>
              <div>
                <h3 className="font-sans text-body-lg font-medium text-primary">
                  {experiment.title}
                </h3>
                <p className="mt-0.5 font-sans text-[12px] text-on-surface-variant">
                  {experiment.summary}
                </p>
              </div>
              <div className="flex items-center justify-between border-t border-surface-container-highest/30 pt-2 text-[11px] text-outline">
                <span>{experiment.metric}</span>
                {experiment.demoUrl ? (
                  <a
                    href={experiment.demoUrl}
                    className="text-primary transition-colors hover:text-secondary hover:underline"
                  >
                    Launch →
                  </a>
                ) : (
                  <span title="Demo not published yet">Soon</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
