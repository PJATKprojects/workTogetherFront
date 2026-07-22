"use client";

import { useId, type ReactNode } from "react";

import { useDialogFocus } from "@/hooks/use-dialog-focus";

import { Button } from "./button";

export function ConfirmDialog({
  open,
  title,
  description,
  children,
  confirmLabel,
  cancelLabel,
  danger = false,
  pending = false,
  confirmDisabled = false,
  onConfirm,
  onCancel,
}: Readonly<{
  open: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  pending?: boolean;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}>) {
  const id = useId();
  const titleId = `${id}-title`;
  const descriptionId = `${id}-description`;
  const dialogRef = useDialogFocus<HTMLDivElement>(open, pending ? () => undefined : onCancel);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[100] grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm"
      onClick={pending ? undefined : onCancel}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        aria-busy={pending}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
        className="login-fade-up glass-panel w-full max-w-md rounded-3xl p-6"
      >
        <h2 id={titleId} className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="mt-3 text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        ) : null}
        {children ? <div className="mt-5">{children}</div> : null}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            disabled={pending}
            onClick={onCancel}
            data-dialog-initial-focus
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={danger ? "danger" : "primary"}
            disabled={pending || confirmDisabled}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
