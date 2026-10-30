import { getProducts } from "@/lib/content";
import { ConstellationSwitch } from "@/components/3d/constellation-switch";
import { Icon } from "@/components/ui/icon";

export function Hero() {
  return (
    <>
      <div className="pointer-events-none absolute left-1/2 top-0 h-[340px] w-[780px] -translate-x-1/2 -translate-y-32 rounded-full bg-secondary/10 blur-[130px]" />
      <HeroArt />

      <section className="relative flex flex-col gap-space-lg py-space-xl">
        <div className="enter flex flex-wrap items-center gap-space-sm">
          <div className="inline-flex items-center gap-2 rounded-xs border border-surface-container-highest/60 bg-surface-container-high px-2.5 py-1 shadow-chip">
            <span className="size-2 animate-pulse rounded-full bg-secondary shadow-[0_0_8px_var(--secondary)]" />
            <span className="font-mono text-label-sm uppercase tracking-wider text-on-surface-variant">
              Mitaito Lab Manifesto
            </span>
          </div>
          <div className="hidden items-center gap-1.5 rounded-xs border border-surface-container-highest/40 bg-surface-container px-2 py-0.5 font-mono text-label-sm text-outline sm:inline-flex">
            <Icon name="deployed_code" className="text-xs" />
            KERNEL: V0.94-RELEASE
          </div>
          {/* Desktop windows only; opens the full-window 3D view at /3d. */}
          <ConstellationSwitch className="hidden lg:inline-flex" />
        </div>

        <div className="enter relative z-10 flex max-w-4xl flex-col gap-space-sm [--d:70ms]">
          <h1 className="text-display-mobile text-primary sm:text-display">
            Curiosity without boundaries.
            <br className="hidden sm:block" />{" "}
            <span className="text-on-surface-variant">
              Rigor without orthodoxy.
            </span>
          </h1>
          <p className="max-w-2xl text-body-lg text-on-surface-variant">
            An independent research lab probing game theory, dynamic
            simulations, computational media, and emergent systems. Code is
            the primary hypothesis.
          </p>
        </div>

        <div className="enter relative z-10 flex flex-col gap-space-sm pt-space-xs [--d:150ms] sm:flex-row sm:flex-wrap sm:items-center">
          <a
            href="#products-directory"
            className="inline-flex h-11 w-full items-center justify-center gap-2 sm:h-9 sm:w-auto rounded-xs bg-primary px-4 text-body-sm font-medium text-on-primary shadow-button transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Icon name="grid_view" className="text-base" />
            Browse Product Directory
          </a>
          <a
            href="#research-pillars"
            className="inline-flex h-11 w-full items-center justify-center gap-2 sm:h-9 sm:w-auto rounded-xs bg-surface-container-high px-4 text-body-sm font-medium text-on-surface shadow-chip transition-all hover:-translate-y-0.5 hover:bg-surface-bright active:scale-[0.98]"
          >
            <Icon name="explore" className="text-base" />
            Research Vectors
          </a>
          <a
            href="#release-notes"
            className="inline-flex h-11 w-full items-center justify-center gap-2 sm:h-9 sm:w-auto rounded-xs bg-surface-container-low px-4 text-body-sm font-medium text-on-surface-variant transition-all hover:bg-surface-container hover:text-primary"
          >
            <Icon name="update" className="text-base" />
            Release Notes &amp; Changelog
          </a>
        </div>

        <dl className="enter relative z-10 mt-space-md grid [--d:230ms] w-full grid-cols-1 gap-space-sm rounded-xs border border-surface-container-highest/50 bg-surface-container-lowest p-space-sm font-mono text-label-sm shadow-panel min-[420px]:grid-cols-2 lg:grid-cols-4">
          <Stat label="Active Nodes">
            <span className="mt-[5px] size-1.5 shrink-0 rounded-full bg-secondary shadow-[0_0_6px_var(--secondary)]" />
            {String(getProducts().length).padStart(2, "0")} Cluster Instances
          </Stat>
          <Stat label="Open Artifacts">
            <Icon name="folder_code" className="mt-0.5 shrink-0 text-xs text-outline" />
            18 Interactive Probes
          </Stat>
          <Stat label="Collaboration">
            <Icon name="handshake" className="mt-0.5 shrink-0 text-xs text-secondary" />
            Open to partners
          </Stat>
          <Stat label="Current Research Focus">Unrestricted Multi-Domain</Stat>
        </dl>
      </section>
    </>
  );
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 rounded-xs border border-surface-container-highest/30 bg-surface-container-low/60 p-2">
      <dt className="text-[10px] uppercase text-outline">{label}</dt>
      <dd className="flex items-start gap-1.5 break-words font-medium text-primary">
        {children}
      </dd>
    </div>
  );
}

/** Decorative floating 2.5D wireframe on the right of the hero. */
function HeroArt() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-margin top-6 z-0 hidden h-[340px] w-[460px] opacity-40 lg:block"
    >
      <div className="relative size-full [perspective:1200px]">
        <div className="bg-isometric-dots absolute inset-0 animate-iso-plane rounded-2xl border border-secondary/20 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]" />
        <div className="absolute right-16 top-8 size-28 animate-iso-float-slow rounded-lg border border-secondary/40 bg-gradient-to-br from-secondary/15 to-transparent shadow-[0_20px_35px_rgb(0_0_0/0.5),inset_0_1px_0_0_rgb(255_255_255/0.3)] backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-secondary/20 p-2 font-mono text-[9px] text-secondary">
            <span>ISO::NODE_A</span>
            <span className="size-1.5 animate-ping rounded-full bg-secondary" />
          </div>
          <div className="space-y-1 p-2 font-mono text-[10px] text-on-surface-variant">
            <div>Z_ELEV: +32px</div>
            <div>TENSOR: 0.941</div>
          </div>
        </div>
        <div className="absolute bottom-4 right-36 h-20 w-32 animate-iso-float-fast rounded-lg border border-tertiary/40 bg-surface-container-high/80 shadow-[0_16px_28px_rgb(0_0_0/0.6),inset_0_1px_0_0_rgb(255_255_255/0.2)] backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-surface-container-highest/60 p-2 font-mono text-[9px] text-tertiary">
            <span>VECT::DISCRETE</span>
            <Icon name="token" className="text-[11px]" />
          </div>
          <div className="flex items-center gap-1.5 p-1.5 font-mono text-[10px] text-on-surface">
            <span className="size-1.5 rounded-full bg-secondary" />
            Minimax • d=9
          </div>
        </div>
      </div>
    </div>
  );
}
