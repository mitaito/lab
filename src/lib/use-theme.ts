import { useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

/** The theme lives on <html> (set before paint by the script in layout). */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getTheme(): Theme {
  return document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
}

/** The current theme, kept in step with the toggle. "dark" on the server. */
export function useTheme(): Theme {
  return useSyncExternalStore<Theme>(subscribe, getTheme, () => "dark");
}

/** Switches the page to `next` and remembers it (see the script in layout). */
export function setTheme(next: Theme) {
  const apply = () =>
    document.documentElement.classList.toggle("light", next === "light");

  // Cross-fade where supported; otherwise (or with reduced motion) just switch.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "startViewTransition" in document) {
    document.startViewTransition(apply);
  } else {
    apply();
  }
  try {
    localStorage.setItem("mitaito_theme", next);
  } catch {
    // Storage can be blocked; the switch still works for this visit.
  }
}
