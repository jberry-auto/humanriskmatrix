"use client";

import { Link as AriaLink, type LinkProps as AriaLinkProps } from "react-aria-components";

import { cn } from "@/lib/cn";

type Variant = "default" | "nav" | "button";

interface LinkProps extends Omit<AriaLinkProps, "className"> {
  variant?: Variant;
  className?: string;
}

const base =
  "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const variantClass: Record<Variant, string> = {
  default: "rounded-sm text-accent underline underline-offset-2 hovered:text-accent-hover",
  nav: "rounded-sm text-ink hovered:text-accent",
  button:
    "inline-flex items-center justify-center rounded-md bg-accent px-5 py-2.5 font-medium text-accent-contrast hovered:bg-accent-hover",
};

/**
 * A link. Internal hrefs are client-routed via the RouterProvider (app/providers.tsx);
 * external/cross-origin links fall back to normal browser navigation automatically.
 */
export function Link({ variant = "default", className, ...props }: LinkProps) {
  return <AriaLink {...props} className={cn(base, variantClass[variant], className)} />;
}
