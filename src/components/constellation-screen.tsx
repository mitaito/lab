"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import {
  CONSTELLATION_MIN_WIDTH,
  type LabInfo,
  type Satellite,
} from "@/lib/constellation";
import { useMediaQuery } from "@/lib/use-media-query";

function Status({ children }: { children: ReactNode }) {
  return (
    <p
      role="status"
      className="grid size-full place-items-center font-mono text-label-sm text-outline"
    >
      {children}
    </p>
  );
}

/**
 * The only way the scene is reached. A dynamic import keeps Three.js out of
 * every other page's JavaScript, and `ssr: false` keeps it out of the
 * prerendered HTML.
 */
const ConstellationScene = dynamic(() => import("./constellation-scene"), {
  ssr: false,
  loading: () => <Status>Initializing orbital matrix…</Status>,
});

/**
 * The /3d page: the 3D layer and nothing else. It fills the window, locks
 * scrolling, and Esc leaves for the home page. `children` is the server-
 * rendered, screen-reader-only list of the products, so the page is never
 * just a canvas.
 */
export function ConstellationScreen({
  satellites,
  lab,
  children,
}: {
  satellites: Satellite[];
  lab: LabInfo;
  children: ReactNode;
}) {
  const router = useRouter();
  const desktop = useMediaQuery(CONSTELLATION_MIN_WIDTH);

  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") router.push("/");
    }
    window.addEventListener("keydown", onKeyDown);

    return () => {
      root.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [router]);

  return (
    <main
      id="main"
      className="fixed inset-0 overflow-hidden overscroll-none bg-surface-container-lowest"
    >
      {children}

      {/* Both branches are in the prerendered HTML and picked by CSS, so a
          desktop window never flashes the small-window notice. The scene
          itself waits for the media query before loading anything. */}
      <div className="hidden size-full lg:block">
        {desktop ? (
          <ConstellationScene satellites={satellites} lab={lab} />
        ) : (
          <Status>Initializing orbital matrix…</Status>
        )}
      </div>
      <div className="grid size-full place-items-center p-space-lg text-center lg:hidden">
        <div className="flex max-w-sm flex-col items-center gap-space-md">
          <p className="font-mono text-label-sm text-outline">
            3D mode needs a window at least 1024px wide.
          </p>
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-xs bg-primary px-4 text-body-sm font-medium text-on-primary shadow-button"
          >
            Back to the lab
          </Link>
        </div>
      </div>
    </main>
  );
}
