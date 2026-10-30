import Link from "next/link";
import { CONSTELLATION_PATH } from "@/lib/constellation";
import { Icon } from "./icon";
import { HERO_SWITCH_CHIP, HUD_SWITCH_CHIP, SwitchTrack } from "./switch-chip";

/**
 * Looks like a switch, is a link: turning it on goes to the full-window 3D
 * view, turning it off there goes home. Being a plain link it works before
 * (and without) JavaScript. `prefetch={false}` so nothing 3D is fetched until
 * it is used.
 *
 * `variant` picks the box it is drawn in: "hero" (the default) matches the
 * small chips of the home page hero, and the caller sets its display class, as
 * <Header> does for its links; "hud" is the same box as every other chip in the
 * 3D view's HUD.
 */
export function ConstellationSwitch({
  on = false,
  variant = "hero",
  className = "",
}: {
  on?: boolean;
  variant?: "hero" | "hud";
  className?: string;
}) {
  const box = variant === "hud" ? HUD_SWITCH_CHIP : HERO_SWITCH_CHIP;

  return (
    <Link
      href={on ? "/" : CONSTELLATION_PATH}
      prefetch={false}
      aria-label={on ? "Exit 3D mode" : "Enter 3D mode"}
      title={on ? "Exit 3D mode (Esc)" : "Enter 3D mode"}
      className={`${box} ${className}`}
    >
      <Icon name="view_in_ar" className="text-xs" />
      3D MODE
      <SwitchTrack on={on} />
    </Link>
  );
}
