import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders a release's Markdown body. react-markdown builds React elements
 * (no `dangerouslySetInnerHTML`), drops raw HTML and blocks `javascript:`
 * URLs, so contributed content cannot inject markup or script.
 */
export function ReleaseNotes({ markdown }: { markdown: string }) {
  if (!markdown) return null;

  return (
    <div className="release-notes">
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) =>
            href?.startsWith("http") ? (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ) : (
              <a href={href}>{children}</a>
            ),
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}
