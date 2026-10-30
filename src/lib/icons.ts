/**
 * Icons used by the UI itself (components and src/data). The Material Symbols
 * font is loaded as a subset of these plus the icons named in product content:
 * the full font is over 1 MB, the subset is about 8 KB.
 *
 * Add a name here when a component uses a new icon; src/lib/icons.test.ts
 * fails if one is missing. Icons chosen in content/products/*.md need nothing.
 */
export const UI_ICONS = [
  "arrow_back",
  "arrow_forward",
  "arrow_outward",
  "bug_report",
  "code",
  "dark_mode",
  "deployed_code",
  "explore",
  "folder_code",
  "games",
  "grid_view",
  "handshake",
  "history",
  "hub",
  "light_mode",
  "lightbulb",
  "psychology",
  "search",
  "smart_toy",
  "speed",
  "token",
  "update",
] as const;

/**
 * Google Fonts URL for the icon subset. `opsz` keeps its 20-48 range so small
 * icons stay as light as they were with the full font; weight and fill are
 * fixed because nothing varies them. Names are sorted, as the API expects.
 */
export function materialSymbolsHref(contentIcons: readonly string[] = []): string {
  const names = [...new Set<string>([...UI_ICONS, ...contentIcons])].sort();
  return (
    "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,400,0,0" +
    `&icon_names=${names.map(encodeURIComponent).join(",")}&display=block`
  );
}
