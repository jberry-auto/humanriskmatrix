"use client";

import type { ReactNode } from "react";

import { useRouter } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { RouterProvider } from "react-aria-components";

// Wire React Aria's client-side navigation to the Next.js App Router so RAC
// <Link> and link-like components do client routing. (react-aria.adobe.com/routing)
declare module "react-aria-components" {
  interface RouterConfig {
    routerOptions: NonNullable<Parameters<ReturnType<typeof useRouter>["push"]>[1]>;
  }
}

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  return (
    // Light is the default; users can switch to dark via the header toggle.
    // `class` strategy toggles `.dark` on <html>; tokens override there (globals.css).
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <RouterProvider navigate={router.push}>{children}</RouterProvider>
    </ThemeProvider>
  );
}
