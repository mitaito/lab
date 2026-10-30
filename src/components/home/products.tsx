import { getProducts } from "@/lib/content";
import { ProjectCard } from "./project-card";
import { SectionHeading } from "@/components/ui/section-heading";

export function Products() {
  const products = getProducts();

  return (
    <section
      id="products-directory"
      className="flex scroll-mt-20 flex-col gap-space-lg py-space-xl"
    >
      <SectionHeading
        eyebrow="Laboratory Products • 2.5D Projections"
        title="Live Artifacts & Interactive Tools"
        description="Independent instruments designed with zero domain constraints—spanning zero-sum heuristics, granular sound synthesis, spatial topology, and local intelligence."
        aside={
          <span className="flex items-center gap-1.5 self-start rounded-xs border border-surface-container-highest/60 bg-surface-container-high px-2.5 py-1 font-mono text-label-sm text-on-surface shadow-chip sm:self-auto">
            <span className="size-2 rounded-full bg-secondary" />
            {String(products.length).padStart(2, "0")} Deployments
          </span>
        }
      />
      <div className="grid grid-cols-1 gap-space-lg md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProjectCard key={product.slug} project={product} />
        ))}
      </div>
    </section>
  );
}
