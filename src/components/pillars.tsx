import { PILLARS } from "@/data/pillars";
import { Icon } from "./icon";
import { IsoCard } from "./iso-card";
import { SectionHeading } from "./section-heading";

export function Pillars() {
  return (
    <section
      id="research-pillars"
      className="flex scroll-mt-20 flex-col gap-space-lg py-space-xl"
    >
      <SectionHeading
        eyebrow="03 Thematic Vectors"
        title="Active Research Pillars"
        description="Systematic explorations mapped against computational expressiveness, human interaction bounds, and emergent algorithmic dynamics."
      />
      <div className="grid grid-cols-1 gap-space-md md:grid-cols-2 lg:grid-cols-3">
        {PILLARS.map((pillar) => (
          <IsoCard
            key={pillar.track}
            className="reveal group flex flex-col justify-between rounded-lg border border-surface-container-highest/60 bg-surface-container-low p-space-md shadow-panel transition-colors hover:border-secondary/40"
          >
            <div className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <span className="rounded-xs bg-surface-container-highest px-2 py-0.5 font-mono text-[11px] text-primary">
                  {pillar.track}
                </span>
                <Icon
                  name={pillar.icon}
                  className="text-lg text-outline transition-colors group-hover:text-primary"
                />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-headline-sm text-primary">{pillar.title}</h3>
                <p className="text-body-sm text-on-surface-variant">
                  {pillar.description}
                </p>
              </div>
            </div>
            <dl className="mt-space-md flex flex-col gap-2 border-t border-surface-container-highest/40 pt-space-sm font-mono text-label-sm">
              <Row label="Active Artifacts" value={pillar.experiments} />
              <Row label="Primary Stack" value={pillar.stack} />
            </dl>
            <a
              href="#products-directory"
              className="group/link mt-2 inline-flex min-h-9 items-center gap-1 self-start rounded-xs text-body-sm font-medium text-primary transition-colors hover:text-secondary"
            >
              Explore Track
              <Icon
                name="arrow_forward"
                className="text-sm transition-transform group-hover/link:translate-x-0.5"
              />
            </a>
          </IsoCard>
        ))}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-outline">
      <dt>{label}</dt>
      <dd className="text-on-surface">{value}</dd>
    </div>
  );
}
