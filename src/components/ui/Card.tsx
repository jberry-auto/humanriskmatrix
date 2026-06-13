import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/cn";

type CardProps = ComponentPropsWithoutRef<"div">;

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("rounded-md border border-border bg-surface p-6", className)} {...props}>
      {children}
    </div>
  );
}
