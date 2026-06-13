"use client";

import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md";

interface ButtonProps extends Omit<AriaButtonProps, "className"> {
  variant?: Variant;
  size?: Size;
  className?: string;
}

const base =
  "inline-flex items-center justify-center rounded-md font-medium cursor-pointer transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const variantClass: Record<Variant, string> = {
  primary: "bg-accent text-accent-contrast hovered:bg-accent-hover pressed:bg-accent-hover",
  secondary: "border border-border-strong bg-surface text-ink hovered:bg-bg pressed:bg-border/40",
  ghost: "text-accent hovered:bg-accent-subtle pressed:bg-accent-subtle",
};

const sizeClass: Record<Size, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={cn(base, variantClass[variant], sizeClass[size], className)}
    />
  );
}
