"use client";

import { useEffect, useRef } from "react";

/**
 * Centered snap carousel on mobile — one full card in the middle, half of the
 * previous card visible on the left and half of the next on the right.
 * Cards are 52% wide with 24% side padding, so every snap lands a card dead
 * center with the same half/half structure on both sides.
 * On sm+ it becomes a normal grid.
 */
export function PeekRail({
  children,
  cols = "sm:grid-cols-4",
}: {
  children: React.ReactNode;
  cols?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Open on the second card so the "half prev | full | half next" structure
  // is visible immediately instead of blank padding on the left.
  useEffect(() => {
    const el = ref.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 10;
    el.scrollLeft = first.offsetWidth + gap;
  }, []);

  return (
    <div
      ref={ref}
      className={`-mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-[24%] pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 ${cols} [&>*]:w-[52%] [&>*]:shrink-0 [&>*]:snap-center sm:[&>*]:w-auto sm:[&>*]:shrink`}
    >
      {children}
    </div>
  );
}
