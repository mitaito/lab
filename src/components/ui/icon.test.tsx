import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Icon } from "./icon";

describe("Icon", () => {
  // Without leading-none, `text-base` and friends set a taller line-height
  // than `.icon` does, and the glyph renders several px below its label.
  it.each(["text-xs", "text-sm", "text-base", "text-lg", "text-[13px]"])(
    "forces line-height 1 alongside %s",
    (size) => {
      const html = renderToStaticMarkup(<Icon name="update" className={size} />);

      expect(html).toContain("leading-none");
      expect(html).toContain(size);
      expect(html).toContain(">update<");
    },
  );
});
