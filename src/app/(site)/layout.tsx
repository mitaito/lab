import type { ReactNode } from "react";
import { SiteShell } from "@/components/site-shell";

/** Everything except the full-window routes in (immersive). */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
