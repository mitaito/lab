"use client";

import type { MouseEvent, ReactNode } from "react";

/** Card that tilts toward the pointer; falls back to the CSS hover otherwise. */
export function IsoCard({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  function handleMove(event: MouseEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    const rotateX = -(y / rect.height) * 10;
    const rotateY = (x / rect.width) * 10;
    card.style.transform = `perspective(1000px) translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  }

  function handleLeave(event: MouseEvent<HTMLDivElement>) {
    event.currentTarget.style.transform = "";
  }

  return (
    <div
      className={`iso-card ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}
