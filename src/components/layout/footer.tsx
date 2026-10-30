import { IssueLink } from "@/components/ui/issue-link";

export function Footer() {
  const link =
    "inline-flex min-h-6 items-center rounded-xs transition-colors hover:text-primary";

  return (
    <footer className="w-full border-t border-surface-container-highest/50 bg-surface-container-lowest">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-space-sm px-margin-mobile py-space-md text-center font-mono text-label-sm text-on-surface-variant sm:px-margin md:flex-row md:justify-between md:text-left">
        <div className="flex flex-wrap items-center justify-center gap-x-space-md gap-y-space-xs">
          <span className="flex items-center gap-space-xs">
            <span className="size-1.5 rounded-full bg-secondary" />
            <span className="text-outline">TELEMETRY</span>
            <span className="text-on-surface">14ms RTT</span>
          </span>
          <span className="flex items-center gap-space-xs">
            <span className="text-outline">ENGINE</span>
            <span className="text-on-surface">MCTS/AlphaBeta-v4</span>
          </span>
        </div>
        <nav
          aria-label="Get involved"
          className="flex flex-wrap items-center justify-center gap-x-space-md gap-y-space-xs"
        >
          <span className="text-outline">© Mitaito Lab</span>
          <IssueLink template="bug_report" className={link}>
            Report a bug
          </IssueLink>
          <IssueLink template="feature_request" className={link}>
            Suggest a feature
          </IssueLink>
          <IssueLink template="partnership" className={link}>
            Partner with us
          </IssueLink>
        </nav>
      </div>
    </footer>
  );
}
