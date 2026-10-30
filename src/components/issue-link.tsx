import type { ReactNode } from "react";
import { issueUrl, type IssueTemplate } from "@/lib/issues";

/** Link to a prefilled GitHub issue form; opens in a new tab. */
export function IssueLink({
  template,
  title,
  className,
  children,
}: {
  template: IssueTemplate;
  title?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={issueUrl(template, title)}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
      <span className="sr-only"> (opens GitHub in a new tab)</span>
    </a>
  );
}
