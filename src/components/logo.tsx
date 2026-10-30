/**
 * The Mitaito Lab mark: a green tile with a bold "M" whose middle dips like a
 * flask neck, plus a bubble. The same geometry is in src/app/icon.svg (the
 * favicon) and the generated apple-icon / share images; keep them in step.
 */
export function LogoMark({
  size = 32,
  bleed = false,
  className,
}: {
  size?: number;
  /** Fill the whole square (no rounded corners), for icons the OS masks. */
  bleed?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient
          id="lab-logo-fill"
          x1="3"
          y1="0"
          x2="29"
          y2="32"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6bff8f" />
          <stop offset="1" stopColor="#00b954" />
        </linearGradient>
      </defs>
      <rect
        width="32"
        height="32"
        rx={bleed ? 0 : 8}
        fill="url(#lab-logo-fill)"
      />
      {!bleed && (
        <rect
          x="0.5"
          y="0.5"
          width="31"
          height="31"
          rx="7.5"
          stroke="#fff"
          strokeOpacity="0.3"
        />
      )}
      {/* Bleed icons get padding so the OS mask never clips the M. */}
      <g transform={bleed ? "translate(3.2 3.2) scale(0.8)" : undefined}>
        <path
          d="M8.5 23.5V9.5L16 18l7.5-8.5v14"
          stroke="#052e16"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle className="logo-bubble" cx="26" cy="6.5" r="1.7" fill="#052e16" />
      </g>
    </svg>
  );
}

/** Mark plus wordmark, with "Lab" in the brand green. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark size={32} />
      <span className="text-headline-sm font-semibold tracking-tight text-primary">
        Mitaito<span className="text-secondary"> Lab</span>
      </span>
    </span>
  );
}
