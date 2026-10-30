import { parse } from "yaml";

export interface FrontMatter {
  /** The parsed YAML mapping; an empty block yields `{}`. */
  data: unknown;
  /** Everything after the closing delimiter. */
  content: string;
}

const BLOCK = /^---[ \t]*\r?\n(?:([\s\S]*?)\r?\n)?---[ \t]*(?:\r?\n|$)/;

/**
 * Splits `---`-delimited YAML front-matter from a Markdown file. Returns null
 * when the file has no such block.
 *
 * The YAML uses the failsafe schema: every scalar stays the exact string that
 * was typed, and there is no code execution. That matters for values YAML
 * would otherwise turn into numbers or booleans, such as a scope named `2048`
 * or `1e5` (which becomes Infinity). Numeric fields are converted by the
 * content schema instead.
 *
 * Throws the `yaml` parse error for malformed YAML.
 */
export function parseFrontMatter(raw: string): FrontMatter | null {
  const source = raw.replace(/^﻿/, "");
  const match = BLOCK.exec(source);
  if (!match) return null;

  return {
    // "error" keeps real errors fatal but silences warnings (unknown tags).
    data: parse(match[1] ?? "", { schema: "failsafe", logLevel: "error" }) ?? {},
    content: source.slice(match[0].length),
  };
}
