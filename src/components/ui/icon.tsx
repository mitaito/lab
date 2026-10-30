/**
 * Material Symbols glyph by ligature name. Size it with a `text-*` class.
 *
 * `leading-none` is required, not cosmetic: `text-sm`, `text-base` etc. also
 * set a line-height (20px, 24px...) that beats the `line-height: 1` in
 * `.icon`. The glyph then sits in a taller line box and drops by half the
 * difference, so a 16px icon rendered 3-4px below its label.
 */
export function Icon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span aria-hidden="true" className={`icon leading-none ${className}`}>
      {name}
    </span>
  );
}
