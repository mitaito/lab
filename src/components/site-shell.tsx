import type { ReactNode } from "react";
import { Footer } from "./footer";
import { Header } from "./header";

/**
 * The header, footer and main landmark around ordinary pages. Routes that
 * want the whole window (see /3d) sit outside it, in their own route group.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
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
    </>
  );
}
