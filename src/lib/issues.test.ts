import { describe, expect, it } from "vitest";
import { issueUrl } from "./issues";
import { GITHUB_URL } from "./site";

describe("issueUrl", () => {
  it("opens the chosen issue form on the repository", () => {
    const url = new URL(issueUrl("bug_report"));

    expect(url.origin + url.pathname).toBe(`${GITHUB_URL}/issues/new`);
    expect(url.searchParams.get("template")).toBe("bug_report.yml");
    expect(url.searchParams.has("title")).toBe(false);
  });

  it("prefills the title and encodes it", () => {
    const url = new URL(issueUrl("feature_request", "[Mi caro v2.4.0] & more=1"));

    expect(url.searchParams.get("title")).toBe("[Mi caro v2.4.0] & more=1");
    expect(url.searchParams.get("template")).toBe("feature_request.yml");
    expect(url.searchParams.has("more")).toBe(false);
  });
});
