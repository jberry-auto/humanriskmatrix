"use client";

import type { ReactNode } from "react";

import { Tab, TabList, TabPanel, Tabs as AriaTabs } from "react-aria-components";

import { cn } from "@/lib/cn";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  /** Accessible name for the tab list. */
  label: string;
  className?: string;
}

export function Tabs({ items, label, className }: TabsProps) {
  return (
    <AriaTabs className={cn("flex flex-col gap-4", className)}>
      <TabList aria-label={label} className="flex gap-1 border-b border-border">
        {items.map((item) => (
          <Tab
            key={item.id}
            id={item.id}
            className="-mb-px cursor-pointer border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted hovered:text-ink selected:border-accent selected:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {item.label}
          </Tab>
        ))}
      </TabList>
      {items.map((item) => (
        <TabPanel key={item.id} id={item.id} className="focus-visible:outline-none">
          {item.content}
        </TabPanel>
      ))}
    </AriaTabs>
  );
}
