"use client";

import { setTheme, useTheme } from "@/lib/use-theme";
import { Icon } from "./icon";
import { HUD_SWITCH_CHIP, SwitchTrack } from "./switch-chip";

/**
 * The theme switch for pages with no header (the 3D view): the same switch as
 * <ThemeToggle>, drawn as a HUD chip.
 */
export function ThemeSwitchChip() {
  const isDark = useTheme() === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Dark mode"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={HUD_SWITCH_CHIP}
    >
      <Icon name={isDark ? "dark_mode" : "light_mode"} className="text-xs" />
      DARK MODE
      <SwitchTrack on={isDark} />
    </button>
  );
}
