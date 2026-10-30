/**
 * A chip in the 3D view's HUD. Every control in the HUD (the text chips and
 * both switches) is built from this one box definition, so they are the same
 * height and weight and cannot drift apart. The HUD rows set the font.
 */
export const HUD_CHIP =
  "inline-flex items-center gap-1.5 rounded-xs border border-surface-container-highest/60 bg-surface-container-high/90 px-2.5 py-1 font-mono text-[10px] backdrop-blur";

/** A switch in the HUD: the HUD chip, but clickable (the HUD rows are not). */
export const HUD_SWITCH_CHIP = `${HUD_CHIP} pointer-events-auto relative z-10 text-on-surface-variant transition-colors hover:text-primary`;

/**
 * A switch among the small chips of the home page hero. The caller adds its
 * display class, as <Header> does for its links.
 */
export const HERO_SWITCH_CHIP =
  "relative z-10 items-center gap-1.5 rounded-xs border border-surface-container-highest/40 bg-surface-container px-2 py-0.5 font-mono text-label-sm text-on-surface-variant transition-colors hover:text-primary";

/** The mini track and thumb drawn inside a switch chip. */
export function SwitchTrack({ on }: { on: boolean }) {
  return (
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
  );
}
