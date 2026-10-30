import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/ui/page-container";
import { SiteShell } from "@/components/layout/site-shell";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

// Unmatched URLs render inside the root layout only, so this page brings the
// header and footer itself.
export default function NotFound() {
  return (
    <SiteShell>
      <PageContainer>
        <div className="flex flex-col items-start gap-space-md py-space-xl">
          <span className="font-mono text-label-sm uppercase text-secondary">
            {"// 404"}
          </span>
          <h1 className="text-headline-lg text-primary">Page not found</h1>
          <p className="max-w-xl text-body-lg text-on-surface-variant">
            That page does not exist, or a release was renamed. Try the home
            page or the full changelog.
          </p>
          <div className="flex flex-wrap gap-space-sm">
            <Link
              href="/"
              className="inline-flex h-10 items-center rounded-xs bg-primary px-4 text-body-sm font-medium text-on-primary shadow-button"
            >
              Back to home
            </Link>
            <Link
              href="/changelog"
              className="inline-flex h-10 items-center rounded-xs bg-surface-container-high px-4 text-body-sm font-medium text-on-surface shadow-chip hover:bg-surface-bright"
            >
              Browse the changelog
            </Link>
          </div>
        </div>
      </PageContainer>
    </SiteShell>
  );
}
