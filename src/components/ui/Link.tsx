"use client";

import { Link as AriaLink, type LinkProps as AriaLinkProps } from "react-aria-components";

import { cn } from "@/lib/cn";

type Variant = "default" | "nav";

interface LinkProps extends Omit<AriaLinkProps, "className"> {
  variant?: Variant;
  className?: string;
}

const base =
  "rounded-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const variantClass: Record<Variant, string> = {
  default: "text-accent underline underline-offset-2 hovered:text-accent-hover",
  nav: "text-ink hovered:text-accent",
};

/**
 * A link. Internal hrefs are client-routed via the RouterProvider (app/providers.tsx);
 * external/cross-origin links fall back to normal browser navigation automatically.
 */
export function Link({ variant = "default", className, ...props }: LinkProps) {
  return <AriaLink {...props} className={cn(base, variantClass[variant], className)} />;
}
