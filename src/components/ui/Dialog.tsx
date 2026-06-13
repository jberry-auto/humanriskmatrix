"use client";

import type { ReactNode } from "react";

import {
  Dialog as AriaDialog,
  DialogTrigger,
  Heading,
  Modal,
  ModalOverlay,
} from "react-aria-components";

import { Button } from "./Button";

interface DialogProps {
  /** The element that opens the dialog — a React Aria pressable, e.g. <Button>. */
  trigger: ReactNode;
  title: string;
  children: ReactNode;
}

export function Dialog({ trigger, title, children }: DialogProps) {
  return (
    <DialogTrigger>
      {trigger}
      <ModalOverlay
        isDismissable
        className="fixed inset-0 z-50 flex min-h-full items-center justify-center bg-ink/40 p-4"
      >
        <Modal className="w-full max-w-lg rounded-lg border border-border bg-surface p-6 shadow-lg">
          <AriaDialog className="outline-none">
            {({ close }) => (
              <>
                <Heading slot="title" className="text-xl font-semibold">
                  {title}
                </Heading>
                <div className="mt-3 text-muted">{children}</div>
                <div className="mt-6 flex justify-end">
                  <Button variant="secondary" onPress={close}>
                    Close
                  </Button>
                </div>
              </>
            )}
          </AriaDialog>
        </Modal>
      </ModalOverlay>
    </DialogTrigger>
  );
}
