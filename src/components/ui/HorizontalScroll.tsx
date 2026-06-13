"use client";

import { useCallback, useState, type ReactNode } from "react";

import { cn } from "@/lib/cn";

interface HorizontalScrollProps {
  children: ReactNode;
  className?: string;
  /** Accessible description of what scrolls (used on the scroll buttons). */
  label?: string;
}

interface Edges {
  left: boolean;
  right: boolean;
}

/**
 * Wraps wide content in a horizontal scroller with clear affordances: edge fades and
 * chevron buttons that appear only when there is more content to reveal.
 */
export function HorizontalScroll({
  children,
  className,
  label = "content",
}: HorizontalScrollProps) {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const [edges, setEdges] = useState<Edges>({ left: false, right: false });

  const measure = useCallback((el: HTMLDivElement) => {
    setEdges({
      left: el.scrollLeft > 1,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
    });
  }, []);

  const ref = useCallback(
    (el: HTMLDivElement | null) => {
      setNode(el);
      if (!el) return;
      const onScroll = () => measure(el);
      measure(el);
      el.addEventListener("scroll", onScroll, { passive: true });
      let observer: ResizeObserver | undefined;
      if (typeof ResizeObserver !== "undefined") {
        observer = new ResizeObserver(() => measure(el));
        observer.observe(el);
      }
      return () => {
        el.removeEventListener("scroll", onScroll);
        observer?.disconnect();
      };
    },
    [measure],
  );

  const scrollByPage = (direction: 1 | -1) => {
    node?.scrollBy({ left: direction * node.clientWidth * 0.85, behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <div ref={ref} className="overflow-x-auto pb-2">
        {children}
      </div>

      {edges.left ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 w-16 rounded-l-md bg-linear-to-r from-bg to-transparent"
          />
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label={`Scroll ${label} left`}
            className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-ink shadow-md hovered:bg-accent-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="size-5"
            >
              <path d="M10 4l-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      ) : null}

      {edges.right ? (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-16 rounded-r-md bg-linear-to-l from-bg to-transparent"
          />
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label={`Scroll ${label} right`}
            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-accent text-accent-contrast shadow-md hovered:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="size-5"
            >
              <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </>
      ) : null}
    </div>
  );
}
