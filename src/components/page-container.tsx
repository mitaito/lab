import type { ReactNode } from "react";

/** Centred content column: 16px gutters on phones, 32px from tablet up. */
export function PageContainer({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[1280px] px-margin-mobile sm:px-margin">
      {children}
    </div>
  );
}
