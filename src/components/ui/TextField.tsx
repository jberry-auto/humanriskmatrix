"use client";

import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  FieldError,
  Input,
  Label,
  Text,
} from "react-aria-components";

import { cn } from "@/lib/cn";

interface TextFieldProps extends Omit<AriaTextFieldProps, "className" | "children"> {
  label: string;
  description?: string;
  errorMessage?: string;
  placeholder?: string;
  className?: string;
}

export function TextField({
  label,
  description,
  errorMessage,
  placeholder,
  className,
  ...props
}: TextFieldProps) {
  return (
    <AriaTextField {...props} className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-sm font-medium text-ink">{label}</Label>
      <Input
        {...(placeholder !== undefined ? { placeholder } : {})}
        className="rounded-md border border-border bg-surface px-3 py-2 text-ink placeholder:text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
      {description ? (
        <Text slot="description" className="text-sm text-muted">
          {description}
        </Text>
      ) : null}
      <FieldError className="text-sm text-phase-alignment">{errorMessage}</FieldError>
    </AriaTextField>
  );
}
