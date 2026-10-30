"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "./icon";

type Theme = "dark" | "light";

/** The theme lives on <html> (set before paint by the script in layout). */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getTheme(): Theme {
  return document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore<Theme>(subscribe, getTheme, () => "dark");
  const isDark = theme === "dark";

  function toggle() {
    const next: Theme = isDark ? "light" : "dark";
    const apply = () =>
      document.documentElement.classList.toggle("light", next === "light");

    // Cross-fade where supported; otherwise (or with reduced motion) just switch.
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduce && "startViewTransition" in document) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
    try {
      localStorage.setItem("mitaito_theme", next);
    } catch {
      // Storage can be blocked; the toggle still works for this visit.
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      onClick={toggle}
      className="group relative flex h-8 w-16 items-center justify-between rounded-full border border-surface-container-highest/60 bg-surface-container-low p-1 shadow-chip transition-colors hover:bg-surface-container-high"
    >
      <Icon
        name="light_mode"
        className="absolute left-2 text-[13px] text-amber-500 opacity-60 transition-opacity group-hover:opacity-100"
      />
      <Icon
        name="dark_mode"
        className="absolute right-2 text-[13px] text-tertiary opacity-70 transition-opacity group-hover:opacity-100"
      />
      <span
        className={`relative z-10 flex size-6 items-center justify-center rounded-full bg-primary text-on-primary shadow-chip transition-transform duration-300 ${
          isDark ? "translate-x-8" : "translate-x-0"
        }`}
      >
        <Icon name={isDark ? "dark_mode" : "light_mode"} className="text-[14px]" />
      </span>
    </button>
  );
}
