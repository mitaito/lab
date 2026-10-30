"use client";

import { setTheme, useTheme } from "@/lib/use-theme";
import { Icon } from "@/components/ui/icon";

export function ThemeToggle() {
  const theme = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
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
