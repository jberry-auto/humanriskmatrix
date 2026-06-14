"use client";

import type { ReactNode } from "react";

import { Button as AriaButton, Dialog, Heading, Modal, ModalOverlay } from "react-aria-components";

interface SideSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  title: ReactNode;
  children: ReactNode;
}

/** A right-anchored, full-height modal drawer (focus-trapped, Esc / click-away to close). */
export function SideSheet({ isOpen, onOpenChange, title, children }: SideSheetProps) {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
      className="fixed inset-0 z-50 flex justify-end bg-ink/40 transition-opacity duration-200 entering:opacity-0 exiting:opacity-0"
    >
      <Modal className="h-full w-full border-l border-border bg-surface shadow-lg outline-none transition-transform duration-200 ease-out entering:translate-x-full exiting:translate-x-full md:w-2/5">
        <Dialog className="flex h-full flex-col outline-none">
          {({ close }) => (
            <>
              <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
                <Heading slot="title" className="text-lg font-semibold">
                  {title}
                </Heading>
                <AriaButton
                  onPress={close}
                  aria-label="Close panel"
                  className="-mr-1 shrink-0 cursor-pointer rounded-md p-1 text-muted hovered:bg-bg hovered:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <svg
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    className="size-5"
                  >
                    <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
                  </svg>
                </AriaButton>
              </div>
              <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
            </>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
}
