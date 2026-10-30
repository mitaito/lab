# Development guide

How to build, run and change the Mitaito Lab website: one Next.js 16 app. All
content is Markdown in this repo and every page is prerendered at build time.
There is no backend and no database. To deploy it, see
[deployment.md](deployment.md).

## Getting started

Requires Node 22+ and pnpm 10.

```bash
pnpm install
pnpm dev        # http://localhost:3000, re-reads /content on each request
```

### Docker

```bash
docker compose up -d --build   # build the image and serve http://localhost:3000
docker compose logs -f web
docker compose down
```

Set `SITE_URL` to the public origin when you deploy (see
[Brand and SEO](#brand-and-seo)):

```bash
SITE_URL=https://lab.example.com docker compose up -d --build
```

The image is a multi-stage standalone build (about 385 MB) that runs as a
non-root user and reports health at `/`. Pages are prerendered when the image
is built, so **rebuild the image after editing `content/`**. The Dockerfile
copies `content/` into the image explicitly, because the server reads it to
resolve URLs and Next's file tracing cannot see that path. It copies `public/`
the same way, because standalone output leaves it out.

| Script       | Does                                              |
| ------------ | ------------------------------------------------- |
| `pnpm dev`   | Development server                                |
| `pnpm build` | Validate the content and prerender every page     |
| `pnpm start` | Serve the production build                        |
| `pnpm lint`  | ESLint                                            |
| `pnpm test`  | Unit tests for the content loader and URL routing |

## Content

Everything the site shows about products and releases lives in `content/`.
`pnpm build` validates it and fails with every problem listed (file, field and
reason), so a bad edit never ships.

### Add a product: `content/products/<slug>.md`

The file name is the slug: lowercase letters, digits and dashes (`page` is
reserved). The file is only front-matter:

```md
---
name: Mi caro (Gomoku)
shortName: Mi caro            # filter pills
order: 1                      # position in the directory, ascending
status: prod                  # prod | beta | alpha
summary: One or two sentences for the product card.
tags: [Game Theory, Rust]
preview: gomoku               # gomoku | waveform | agents | force | lenia | crdt
icon: sports_esports          # a Material Symbols name
metric: "<16ms/ply"
demoUrl: https://example.com/play   # optional; "Demo soon" is shown without it
experiment:                   # optional; lists it in the experiment explorer
  id: EXP-014
  title: Mi caro Bitboard WASM
  domain: "GOMOKU // MINIMAX"
  summary: One line.
  metric: "Eval: 16ms/ply"
---
```

### Add a release: `content/changelog/<product-slug>/<version>.md`

The file name is the version (`v2.4.0.md`) and the folder must match a product.
A product's current version is its newest release, so there is nothing to keep
in sync by hand.

```md
---
date: 2025-02-18              # YYYY-MM-DD
status: merged                # merged | live | beta | stable | alpha
summary: One line, shown in changelog tables.
scope: Mi caro (Gomoku)       # optional; defaults to the product name
---
Optional release notes in Markdown, shown on the release's own page.

## Added

- Something new.
```

Good to know:

- Unknown front-matter keys are rejected, which catches typos.
- Quote a value that contains `: ` (a colon and a space), for example
  `summary: "Fixed a bug: it crashed"`.
- Every value is read as plain text, so a `scope` like `2048` stays `2048`.
- Release notes are rendered without raw HTML, so HTML in the Markdown is
  dropped rather than injected.

## URLs

```
/changelog                  all products, newest first, 20 per page
/changelog/page/2           page 2
/changelog/mi-caro          one product
/changelog/mi-caro/page/2   page 2 of one product
/changelog/mi-caro/v2.4.0   one release
```

The landing page shows only the latest six releases and links to `/changelog`.
Filtering by product is a link to a prerendered page, not client-side
filtering, so no changelog page ships a data array to the browser.

## Feedback and partners

Visitors report bugs, suggest features and ask about partnerships through
GitHub issues. The site never calls the GitHub API; its buttons (in the
Manifesto, the footer, and on each release page) just open GitHub's "new issue"
page with a form:

| Button            | Form                                       |
| ----------------- | ------------------------------------------ |
| Report a bug      | `.github/ISSUE_TEMPLATE/bug_report.yml`    |
| Suggest a feature | `.github/ISSUE_TEMPLATE/feature_request.yml` |
| Partner with us   | `.github/ISSUE_TEMPLATE/partnership.yml`   |

On a release page the title is prefilled, for example `[Mi caro (Gomoku)
v2.4.0] `. The repository URL lives in `GITHUB_URL` in `src/lib/site.ts`, and
links are built by `issueUrl` in `src/lib/issues.ts`.

To make the buttons work:

- Push `.github/ISSUE_TEMPLATE` to the default branch and keep Issues enabled
  in the repository settings. Until then GitHub ignores the `template` link.
- Create the labels the forms apply: `bug` and `enhancement` exist by default;
  add `partnership`.
- When you add a product, add its name to the Product dropdown in the bug and
  feature forms. `src/lib/issue-templates.test.ts` fails until you do.

Issues are public, so the forms and the Manifesto tell people not to post
confidential details; partnership replies should move to a private channel.

## Responsive design

Three tiers, tested at 320, 360, 390, 768, 820, 1024, 1280, 1536 and 1920 px:

| Tier    | Width       | Layout                                                              |
| ------- | ----------- | ------------------------------------------------------------------- |
| Phone   | under 640   | One column, 16px gutters, icon-only header link, stacked release cards, full-width buttons |
| Tablet  | 640 to 1023 | 32px gutters, two-column product and pillar grids, full header (label, version, Source) |
| Desktop | 1024 up     | Three-column grids, four-column release grid with a header row, decorative hero art. The content column stops at 1280px and centres on wider screens |

The changelog is one list with two layouts rather than a table that is
squeezed on small screens, so nothing scrolls sideways and there is no
duplicated markup.

## Brand and SEO

- **Logo:** `src/components/logo.tsx` is the single source for the mark (a
  green tile with an "M" and a bubble). `src/app/icon.svg` is the same shape
  as a file. The Apple touch icon, `/favicon.ico` (16, 32 and 48 px) and the
  1200x630 share image used by Open Graph and Twitter are generated from that
  component at build time. The exception is `public/`: `icon-192.png`,
  `icon-512.png`, `icon-maskable-512.png` (listed in the web app manifest) and
  `logo.png` are rasterized from `icon.svg`, so **regenerate them if the logo
  changes**. The maskable icon is the `bleed` variant of the mark.
- **Metadata:** `src/app/layout.tsx` sets the site-wide title template,
  description, robots and social tags. Pages that set their own (`/changelog/*`)
  go through `pageMetadata` in `src/lib/seo.ts`, which adds the canonical URL
  and keeps the share image. Rendering `openGraph` on a page replaces the
  layout's, so do not set it by hand.
- **Crawling:** `/sitemap.xml` is built from the same list of URLs that is
  prerendered, `/robots.txt` points to it, and `/manifest.webmanifest` is
  included. The home page has `WebSite` and `Organization` structured data, and
  changelog pages have breadcrumbs.
- **`SITE_URL`:** the canonical origin, for example `https://lab.example.com`.
  It is baked in at build time and defaults to `http://localhost:3000`, so
  **set it for production builds**, otherwise canonical URLs, the sitemap and
  share images point at localhost.

## Motion

Animation is CSS-only and purely visual, so it cannot hurt crawling or Core
Web Vitals. The rules, enforced by `src/app/motion-policy.test.ts`:

- **Only `transform`.** Never animate from `opacity: 0`, `visibility` or
  `display`: text must never be invisible, and layout must never move.
- **`backwards` fill** (never `forwards` or `both`), so the starting pose is
  released afterwards and hover and tilt transforms keep working.
- **Scroll reveals are progressive.** `.reveal` runs only inside
  `@supports (animation-timeline: view())`; other browsers just show the
  content. Do not put `overflow-x: hidden` on an ancestor of a `.reveal`
  element: it becomes a scroll container and silently disables the reveal. Use
  `overflow-x: clip`.
- **Reduced motion** switches `.enter` and `.reveal` off.

What moves: the hero rises in on load (`.enter`, staggered with `--d`), blocks
below it ease in as they scroll into view (`.reveal`), and card previews, arrows,
release rows and the logo react to hover and focus, which costs nothing while
idle. The theme toggle cross-fades with the View Transitions API where
supported.

## Icons

Material Symbols are loaded as a subset (about 8 KB; the full font is over
1 MB and was 82% of the home page's download). Icons chosen in
`content/products/*.md` are included automatically. If a component uses a new
icon, add its name to `UI_ICONS` in `src/lib/icons.ts`; a test fails until you
do.

## Performance

Lighthouse (mobile emulation, 5 runs per page, production build): home,
changelog and release pages all score 100 for Performance, Accessibility, Best
Practices and SEO, with largest paint at 0.76 to 0.91 s, CLS 0.000 and
Total Blocking Time under 10 ms.

Measured with a synthetic 5,000-release changelog (six products, realistic
Markdown bodies) on a laptop, production build:

| Measure                          | Result                                    |
| -------------------------------- | ----------------------------------------- |
| Build                            | 47 s for 5,504 pages                      |
| Changelog list page (gzip)       | 8 KB HTML, the same on page 1 and page 20 |
| Release page (gzip)              | 5 KB HTML                                 |
| Landing page (gzip)              | 16 KB HTML, unaffected by release count   |
| First byte, local `next start`   | 6 to 14 ms                                |
| JavaScript (gzip)                | about 175 KB on every page                |

- Page weight does not grow with the number of releases. The JavaScript is the
  React and Next runtime; Markdown, zod and the YAML parser stay on the server.
- Build time and build output grow with the number of releases: about 8 ms and
  76 KB per release page (5,000 releases is about 380 MB in `.next`). That is
  fine for years of changelog. If it ever matters, return fewer paths from
  `changelogStaticPaths` (for example only the newest releases per product);
  the rest render on first visit and are cached. Make sure `content/` is
  available to the server at runtime when you do.
- `ensureStatic = "navigation"` in `src/app/layout.tsx` fails the build if
  anything adds per-request work (uncached fetches, cookies, headers). It also
  makes the first request for an unknown URL a real 404 instead of a fallback
  page with a 200 status.

To try your own scale, point the app at another content tree:

```bash
CONTENT_DIR=/path/to/content pnpm build
```

## Themes

Light and dark are CSS variables in `src/app/globals.css`. The choice is stored
in `localStorage` under `mitaito_theme`.
