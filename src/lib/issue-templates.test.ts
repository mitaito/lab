import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { getProducts } from "./content";
import { ISSUE_TEMPLATES } from "./issues";

/**
 * The GitHub issue forms behind the site's "Report a bug", "Suggest a feature"
 * and "Partner with us" buttons. GitHub silently ignores a malformed form and
 * falls back to a blank page, so check them here.
 */
const DIR = path.join(process.cwd(), ".github", "ISSUE_TEMPLATE");
const FIELD_TYPES = ["markdown", "input", "textarea", "dropdown", "checkboxes"];

interface Field {
  type: string;
  id?: string;
  attributes?: { label?: string; options?: unknown[]; value?: string };
}
interface Form {
  name: string;
  description: string;
  title?: string;
  labels?: string[];
  body: Field[];
}

const load = (name: string): Form =>
  parse(fs.readFileSync(path.join(DIR, `${name}.yml`), "utf8")) as Form;

describe.each(ISSUE_TEMPLATES)("issue form %s", (template) => {
  const form = load(template);

  it("has the fields GitHub requires", () => {
    expect(form.name).toBeTruthy();
    expect(form.description).toBeTruthy();
    expect(form.body.length).toBeGreaterThan(0);
  });

  it("is labelled, so reports can be triaged", () => {
    expect(form.labels?.length ?? 0).toBeGreaterThan(0);
  });

  it("uses only valid field types, each with a label and unique id", () => {
    const ids = form.body.flatMap((field) => (field.id ? [field.id] : []));

    expect(new Set(ids).size).toBe(ids.length);
    for (const field of form.body) {
      expect(FIELD_TYPES).toContain(field.type);
      if (field.type !== "markdown") {
        expect(field.attributes?.label, `${field.type} ${field.id}`).toBeTruthy();
        expect(field.id, `${field.type} ${field.attributes?.label}`).toBeTruthy();
      }
    }
  });

  it("warns that issues are public", () => {
    const notice = form.body.find((field) => field.type === "markdown");

    expect(notice?.attributes?.value).toMatch(/public/i);
  });
});

describe("product dropdowns", () => {
  it.each(["bug_report", "feature_request"])(
    "%s lists every product in /content",
    (template) => {
      const dropdown = load(template).body.find((f) => f.id === "product");
      const options = (dropdown?.attributes?.options ?? []) as string[];
      const missing = getProducts()
        .map((product) => product.name)
        .filter((name) => !options.includes(name));

      expect(
        missing,
        `Add these products to .github/ISSUE_TEMPLATE/${template}.yml`,
      ).toEqual([]);
    },
  );
});

describe("config", () => {
  it("sends everyone through a form", () => {
    const config = parse(
      fs.readFileSync(path.join(DIR, "config.yml"), "utf8"),
    ) as { blank_issues_enabled: boolean };

    expect(config.blank_issues_enabled).toBe(false);
  });
});
