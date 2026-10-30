import { Icon } from "./icon";
import { IssueLink } from "./issue-link";
import type { IssueTemplate } from "@/lib/issues";

const ACTIONS: readonly {
  template: IssueTemplate;
  icon: string;
  title: string;
  text: string;
}[] = [
  {
    template: "bug_report",
    icon: "bug_report",
    title: "Report a bug",
    text: "Something broken or confusing? Tell us what happened.",
  },
  {
    template: "feature_request",
    icon: "lightbulb",
    title: "Suggest a feature",
    text: "Got an idea? Describe the problem it would solve.",
  },
  {
    template: "partnership",
    icon: "handshake",
    title: "Partner with us",
    text: "Research, integration or early access: let's build together.",
  },
];

export function Manifesto() {
  return (
    <section
      id="get-involved"
      className="reveal my-space-lg flex scroll-mt-20 flex-col gap-space-lg rounded-lg border border-surface-container-highest/60 bg-surface-container-lowest p-space-lg shadow-panel"
    >
      <div className="flex min-w-0 max-w-2xl flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-xs bg-secondary shadow-[0_0_6px_var(--secondary)]" />
          <span className="font-mono text-label-sm uppercase tracking-wider text-outline">
            Mitaito Lab Manifesto
          </span>
        </div>
        <h2 className="text-headline-md text-primary">
          &ldquo;Software is not merely an instrument; it is an experimental
          medium.&rdquo;
        </h2>
        <p className="text-pretty text-body-md text-on-surface-variant">
          Some of what we build is open for dissection and forkable play. Some
          stays private while it matures. Either way, the work is better with
          other people in it: we welcome partners, bug reports and ideas.
        </p>
      </div>

      <div className="flex flex-col gap-space-sm">
        <ul className="grid grid-cols-1 gap-space-sm lg:grid-cols-3">
          {ACTIONS.map((action) => (
            <li key={action.template}>
              <IssueLink
                template={action.template}
                className="group/action flex h-full items-start gap-3 rounded-lg border border-surface-container-highest/60 bg-surface-container-low p-space-md shadow-chip transition-all hover:-translate-y-0.5 hover:border-secondary/50 hover:bg-surface-container"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-secondary/30 bg-secondary/10 text-secondary">
                  <Icon name={action.icon} className="text-lg" />
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="flex items-center gap-1 whitespace-nowrap text-body-md font-medium text-primary">
                    {action.title}
                    <Icon
                      name="arrow_outward"
                      className="text-sm text-outline transition-transform group-hover/action:-translate-y-0.5 group-hover/action:translate-x-0.5 group-hover/action:text-secondary"
                    />
                  </span>
                  <span className="text-pretty text-body-sm text-on-surface-variant">
                    {action.text}
                  </span>
                </span>
              </IssueLink>
            </li>
          ))}
        </ul>
        <p className="font-mono text-label-sm text-outline">
          Opens GitHub. Issues are public, so please keep confidential details
          out.
        </p>
      </div>
    </section>
  );
}
