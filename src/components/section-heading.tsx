import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  aside,
  as: Heading = "h2",
}: {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
  /** Use "h1" on pages where this is the main heading. */
  as?: "h1" | "h2";
}) {
  return (
    <div className="reveal flex flex-col justify-between gap-space-sm sm:flex-row sm:items-end">
      <div className="flex max-w-2xl flex-col gap-1">
        <span className="font-mono text-label-sm uppercase text-secondary">
          {`// ${eyebrow}`}
        </span>
        <Heading className="text-headline-lg text-primary">{title}</Heading>
        <p className="text-body-md text-on-surface-variant">{description}</p>
      </div>
      {aside}
    </div>
  );
}
