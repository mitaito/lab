import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { getProducts } from "@/lib/content";
import { materialSymbolsHref } from "@/lib/icons";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  // Declared explicitly: setting `icons` here would otherwise replace the
  // file-based ones. All three are generated from the same logo.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_US",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#12131a" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
};

/**
 * Every page is prerendered from the Markdown in /content. This fails the
 * build if request-time work (uncached fetches, cookies, headers) is ever
 * added, and makes the first hit on an unknown URL a real 404 instead of a
 * fallback shell with a 200 status.
 */
export const ensureStatic = "navigation";

/** Applies the saved theme before first paint so there is no flash. */
const THEME_INIT = `try{if(localStorage.getItem("mitaito_theme")==="light")document.documentElement.classList.add("light")}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  const iconFont = materialSymbolsHref(getProducts().map((p) => p.icon));

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Icon font subset (see src/lib/icons.ts). `display=block` keeps ligature names from flashing as text, and the root layout is the right place for it in the App Router. */}
        <link
          rel="stylesheet"
          href={iconFont}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-surface font-sans text-body-md text-on-surface antialiased">
        <a
          href="#main"
          className="sr-only rounded-xs bg-primary text-body-sm font-medium text-on-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <Header />
        {/* overflow-x-clip, not -hidden: hidden makes <main> a scroll container, which
            silently disables the scroll-driven .reveal animations inside it. */}
        <main id="main" className="flex-1 overflow-x-clip pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
