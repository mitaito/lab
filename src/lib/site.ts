/**
 * Public site identity. SITE_URL must be the canonical origin in production
 * (for example https://lab.example.com): it is baked into canonical URLs, the
 * sitemap and share images at build time.
 */
export const SITE_URL = (process.env.SITE_URL || "http://localhost:3000").replace(
  /\/+$/,
  "",
);

export const SITE_NAME = "Mitaito Lab";
export const SITE_TITLE =
  "Mitaito Lab — Interactive Game Theory & Simulation Research";
/** What the lab is, in one sentence. The 3D view's lab card shows it too. */
export const LAB_SUMMARY =
  "Independent research lab building interactive tools for game theory, simulation, computational media and emergent systems.";
export const SITE_DESCRIPTION = `${LAB_SUMMARY} Browse every product and release.`;
export const GITHUB_URL = "https://github.com/mitaito/mi-lab";

export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path}`;
}
