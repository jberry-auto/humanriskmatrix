"use client";

import { useSyncExternalStore } from "react";

import { useTheme } from "next-themes";
import { Button } from "react-aria-components";

import { cn } from "@/lib/cn";

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-5">
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-5">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
      />
    </svg>
  );
}

const noop = () => () => {};

// Returns false during SSR + the hydration render, true thereafter — without a
// setState-in-effect. Lets us avoid a hydration mismatch on the theme-dependent icon.
function useHydrated(): boolean {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const hydrated = useHydrated();

  // Until hydrated, mirror the server (light default) so the aria-label and icon
  // match the SSR output — otherwise a stored dark theme causes a hydration mismatch.
  const isDark = hydrated && resolvedTheme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <Button
      aria-label={label}
      onPress={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-ink hovered:bg-accent-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        className,
      )}
    >
      {hydrated ? (
        isDark ? (
          <MoonIcon />
        ) : (
          <SunIcon />
        )
      ) : (
        <span className="size-5" aria-hidden="true" />
      )}
    </Button>
  );
}
