"use client";

import { useEffect, useRef } from "react";

/**
 * Swipeable rail on mobile: cards are ~62% wide with the previous card half
 * visible on the left and the next peeking on the right — the classic "this
 * is a carousel" affordance. On sm+ it becomes a normal grid.
 *
 * cols should match the Tailwind grid classes you want on desktop, e.g.
 * "sm:grid-cols-4".
 */
export function PeekRail({
  children,
  cols = "sm:grid-cols-4",
}: {
  children: React.ReactNode;
  cols?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Start scrolled so card 1 is half-visible on the left — signals swipe.
  useEffect(() => {
    const el = ref.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 10;
    el.scrollLeft = (first.offsetWidth + gap) * 0.45;
  }, []);

  return (
    <div
      ref={ref}
      className={`-mx-4 flex snap-x snap-proximity gap-2.5 overflow-x-auto px-[16%] pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0 ${cols} [&>*]:w-[62%] [&>*]:shrink-0 [&>*]:snap-center sm:[&>*]:w-auto sm:[&>*]:shrink`}
    >
      {children}
    </div>
  );
}
