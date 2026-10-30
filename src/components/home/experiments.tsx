import { getProducts } from "@/lib/content";
import { ExperimentExplorer } from "./experiment-explorer";

export function Experiments() {
  const experiments = getProducts().flatMap((product) =>
    product.experiment
      ? [{ ...product.experiment, demoUrl: product.demoUrl ?? null }]
      : [],
  );
  if (experiments.length === 0) return null;

  return (
    <section aria-labelledby="experiments-heading" className="py-space-lg">
      <h2 id="experiments-heading" className="sr-only">
        Featured experiments
      </h2>
      <ExperimentExplorer experiments={experiments} />
    </section>
  );
}
