import type { ProductPreview as PreviewKind } from "@/lib/content";
import { Icon } from "@/components/ui/icon";

/** Mini 2.5D illustration shown at the top of each project card. */
export function ProjectPreview({ kind }: { kind: PreviewKind }) {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border border-surface-container-highest/40 bg-surface-container-lowest/80 transition-colors group-hover:border-secondary/40"
    >
      <div className="bg-isometric-dots absolute inset-0 opacity-40" />
      <div className="relative rotate-x-12 rotate-y-6">{PREVIEWS[kind]}</div>
    </div>
  );
}

const PREVIEWS: Record<PreviewKind, React.ReactNode> = {
  gomoku: (
    <div className="flex items-center justify-center gap-2">
      <div className="size-6 rounded-full border-2 border-zinc-700 bg-zinc-900 group-hover:animate-bob shadow-[0_6px_10px_rgb(0_0_0/0.8),inset_0_2px_4px_rgb(255_255_255/0.3)]" />
      <div className="size-6 rounded-full border-2 border-zinc-300 bg-white group-hover:animate-bob [animation-delay:120ms] shadow-[0_6px_10px_rgb(0_0_0/0.6),inset_0_2px_4px_rgb(255_255_255/0.8)]" />
      <div className="flex size-6 animate-pulse items-center justify-center rounded-full border-2 border-secondary group-hover:animate-bob [animation-delay:240ms] bg-secondary/30 font-mono text-[10px] text-secondary shadow-[0_0_12px_rgb(74_225_118/0.6)]">
        5
      </div>
    </div>
  ),
  waveform: (
    <div className="flex items-end gap-1.5">
      <div className="h-6 w-1.5 origin-bottom rounded-t bg-secondary/40 group-hover:animate-eq" />
      <div className="h-12 w-1.5 origin-bottom animate-pulse rounded-t bg-secondary/70 group-hover:animate-eq [animation-delay:100ms]" />
      <div className="h-16 w-1.5 origin-bottom rounded-t bg-secondary shadow-[0_4px_12px_rgb(74_225_118/0.5)] group-hover:animate-eq [animation-delay:200ms]" />
      <div className="h-9 w-1.5 origin-bottom rounded-t bg-secondary/80 group-hover:animate-eq [animation-delay:300ms]" />
      <div className="h-4 w-1.5 origin-bottom rounded-t bg-secondary/30 group-hover:animate-eq [animation-delay:400ms]" />
    </div>
  ),
  agents: (
    <div className="flex items-center gap-4">
      <div className="rounded-lg border border-cyan-400/50 bg-surface-container-high p-1.5 shadow-[0_4px_10px_rgb(0_0_0/0.4)] group-hover:animate-node">
        <Icon name="smart_toy" className="text-sm text-cyan-500" />
      </div>
      <div className="w-6 border-t-2 border-dashed border-cyan-400/50" />
      <div className="rounded-lg border border-secondary/50 bg-surface-container-high p-1.5 shadow-[0_4px_10px_rgb(0_0_0/0.4)] group-hover:animate-node [animation-delay:600ms]">
        <Icon name="psychology" className="text-sm text-secondary" />
      </div>
    </div>
  ),
  force: (
    <div className="relative flex items-center justify-center">
      <div className="flex size-10 animate-[spin_14s_linear_infinite] items-center justify-center rounded-full border border-secondary/40">
        <div className="size-2.5 rounded-full bg-secondary shadow-[0_0_8px_var(--secondary)]" />
      </div>
      <div className="absolute -top-2 left-6 size-2 rounded-full bg-primary" />
      <div className="absolute -bottom-1 -right-2 size-2 rounded-full bg-tertiary" />
    </div>
  ),
  lenia: (
    <div className="relative flex size-14 items-center justify-center rounded-full border border-secondary/30">
      <div className="absolute inset-0 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full border border-secondary/30" />
      <div className="flex size-8 items-center justify-center rounded-full border border-secondary/60">
        <div className="size-3.5 rounded-full bg-secondary/80 shadow-[0_0_10px_var(--secondary)]" />
      </div>
    </div>
  ),
  crdt: (
    <div className="flex items-center gap-3">
      <div className="flex size-7 items-center justify-center rounded-xs border border-purple/60 bg-surface-container-high font-mono text-[10px] text-purple shadow-[0_4px_8px_rgb(0_0_0/0.4)] group-hover:animate-node">
        P1
      </div>
      <div className="h-0.5 w-6 bg-gradient-to-r from-purple to-secondary" />
      <div className="flex size-7 items-center justify-center rounded-xs border border-secondary/60 bg-surface-container-high font-mono text-[10px] text-secondary shadow-[0_4px_8px_rgb(0_0_0/0.4)] group-hover:animate-node [animation-delay:600ms]">
        P2
      </div>
    </div>
  ),
};
