"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface HeroSlide {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  overlay_opacity: number;
  cta_primary_label: string | null;
  cta_primary_href: string | null;
  cta_secondary_label: string | null;
  cta_secondary_href: string | null;
}

const SLIDE_MS = 6000;

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback(
    (i: number) => setIndex((i + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (slides.length <= 1) return;
    timer.current = setInterval(() => setIndex((i) => (i + 1) % slides.length), SLIDE_MS);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [slides.length, index]);

  if (!slides.length) return null;

  return (
    <section
      className="relative -mt-px h-[380px] overflow-hidden sm:h-[440px] lg:h-[500px]"
      aria-roledescription="carousel"
      aria-label="Featured"
    >
      {slides.map((s, i) => {
        const active = i === index;
        return (
          <div
            key={s.id}
            aria-hidden={!active}
            className={cn(
              "absolute inset-0 transition-opacity duration-700",
              active ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {s.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={s.image_url}
                alt=""
                className="h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-ink-900 to-brand-900" />
            )}
            {/* Overlay — per-slide opacity 60–80% */}
            <div
              className="absolute inset-0 bg-ink-950"
              style={{ opacity: Math.min(80, Math.max(60, s.overlay_opacity)) / 100 }}
            />
            <div className="absolute inset-0 flex items-center">
              <div className="mx-auto w-full max-w-7xl px-4">
                <div className="max-w-2xl">
                  <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
                    {s.title}
                  </h1>
                  {s.description ? (
                    <p className="mt-3 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                      {s.description}
                    </p>
                  ) : null}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {s.cta_primary_label && s.cta_primary_href ? (
                      <Link
                        href={s.cta_primary_href}
                        className="tap rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-brand-700"
                      >
                        {s.cta_primary_label}
                      </Link>
                    ) : null}
                    {s.cta_secondary_label && s.cta_secondary_href ? (
                      <Link
                        href={s.cta_secondary_href}
                        className="tap rounded-lg border border-white/40 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20"
                      >
                        {s.cta_secondary_label}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Dots */}
      {/* Raised on mobile so the overlapping search card doesn't cover them */}
      <div className="absolute bottom-12 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className={cn(
              "h-2 rounded-full transition-all",
              i === index ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70",
            )}
          />
        ))}
      </div>

      {/* Arrows */}
      {slides.length > 1 ? (
        <>
          <button
            onClick={() => go(index - 1)}
            aria-label="Previous slide"
            className="tap absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm hover:bg-black/50 sm:block"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5"><path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <button
            onClick={() => go(index + 1)}
            aria-label="Next slide"
            className="tap absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/30 p-2.5 text-white backdrop-blur-sm hover:bg-black/50 sm:block"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5"><path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </>
      ) : null}
    </section>
  );
}
