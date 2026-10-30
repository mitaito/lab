import { GITHUB_URL } from "./site";

/**
 * The issue forms in .github/ISSUE_TEMPLATE (file name without `.yml`). The
 * site never calls the GitHub API: buttons just link to GitHub's "new issue"
 * page with the right form, and GitHub does the rest.
 */
export const ISSUE_TEMPLATES = [
  "bug_report",
  "feature_request",
  "partnership",
] as const;
export type IssueTemplate = (typeof ISSUE_TEMPLATES)[number];

/** Link that opens a prefilled new-issue form. `title` is an optional prefix. */
export function issueUrl(template: IssueTemplate, title?: string): string {
  const params = new URLSearchParams({ template: `${template}.yml` });
  if (title) params.set("title", title);
  return `${GITHUB_URL}/issues/new?${params}`;
}
