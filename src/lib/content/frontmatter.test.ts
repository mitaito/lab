import { describe, expect, it } from "vitest";
import { parseFrontMatter } from "./frontmatter";

describe("parseFrontMatter", () => {
  it("splits the YAML block from the body", () => {
    expect(parseFrontMatter("---\ntitle: Hi\n---\n\nBody\n")).toEqual({
      data: { title: "Hi" },
      content: "\nBody\n",
    });
  });

  it("keeps dates as plain strings", () => {
    expect(parseFrontMatter("---\ndate: 2025-02-18\n---\n")?.data).toEqual({
      date: "2025-02-18",
    });
  });

  it.each(["2048", "1e5", "0123", "1.0", "true", "null"])(
    "keeps %s exactly as typed instead of turning it into a number or boolean",
    (value) => {
      expect(parseFrontMatter(`---\nname: ${value}\n---\n`)?.data).toEqual({
        name: value,
      });
    },
  );

  it("accepts an empty block", () => {
    expect(parseFrontMatter("---\n---\nBody")).toEqual({
      data: {},
      content: "Body",
    });
  });

  it("handles CRLF line endings and a BOM", () => {
    expect(parseFrontMatter("﻿---\r\na: 1\r\n---\r\nBody")).toEqual({
      data: { a: "1" },
      content: "Body",
    });
  });

  it("only treats the first closing delimiter as the end", () => {
    const parsed = parseFrontMatter("---\na: 1\n---\nText\n---\nMore\n");

    expect(parsed?.content).toBe("Text\n---\nMore\n");
  });

  it("returns null when there is no block", () => {
    expect(parseFrontMatter("# Just markdown\n")).toBeNull();
    expect(parseFrontMatter("---\na: 1\n")).toBeNull();
  });

  it("does not run `---js` front-matter", () => {
    const hostile = '---js\n{ "x": (() => { throw new Error("ran"); })() }\n---\n';

    expect(parseFrontMatter(hostile)).toBeNull();
  });

  it("treats code-building YAML tags as plain strings", () => {
    expect(parseFrontMatter("---\na: !!js/function 'x'\n---\n")?.data).toEqual({
      a: "x",
    });
  });

  it("throws on malformed YAML and on duplicate keys", () => {
    expect(() => parseFrontMatter("---\na: [1, 2\n---\n")).toThrow();
    expect(() => parseFrontMatter("---\na: 1\na: 2\n---\n")).toThrow();
  });
});
