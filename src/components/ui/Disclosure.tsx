"use client";

import type { ReactNode } from "react";

import {
  Button as AriaButton,
  Disclosure as AriaDisclosure,
  DisclosurePanel,
  Heading,
} from "react-aria-components";

import { cn } from "@/lib/cn";

interface DisclosureProps {
  title: ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  children: ReactNode;
}

export function Disclosure({
  title,
  defaultExpanded = false,
  className,
  children,
}: DisclosureProps) {
  return (
    <AriaDisclosure
      defaultExpanded={defaultExpanded}
      className={cn("group border-b border-border", className)}
    >
      <Heading>
        <AriaButton
          slot="trigger"
          className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-sm py-3 text-left font-medium text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {title}
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="size-4 shrink-0 text-muted transition-transform group-data-[expanded]:rotate-90"
          >
            <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </AriaButton>
      </Heading>
      <DisclosurePanel className="pb-4 text-muted">{children}</DisclosurePanel>
    </AriaDisclosure>
  );
}
