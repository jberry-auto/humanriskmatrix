"use client";

import type { ReactNode } from "react";

import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";

import { cn } from "@/lib/cn";

interface CheckboxProps extends Omit<AriaCheckboxProps, "className" | "children"> {
  className?: string;
  children?: ReactNode;
}

export function Checkbox({ className, children, ...props }: CheckboxProps) {
  return (
    <AriaCheckbox
      {...props}
      className={cn("flex cursor-pointer items-center gap-2 text-sm", className)}
    >
      {({ isSelected, isFocusVisible }) => (
        <>
          <span
            aria-hidden="true"
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded-sm border border-border-strong transition-colors",
              isSelected && "border-accent bg-accent text-accent-contrast",
              isFocusVisible && "outline-2 outline-offset-2 outline-accent",
            )}
          >
            {isSelected ? (
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="size-3"
              >
                <path d="M3 8.5l3.5 3.5L13 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </span>
          {children}
        </>
      )}
    </AriaCheckbox>
  );
}
