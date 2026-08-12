import type { ReactNode } from "react";
import { Button } from "../Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "danger";
  // True while the confirmed action is actually in flight - disables both
  // buttons and the backdrop-dismiss, so a click mid-request can't fire a
  // second mutation or close the dialog while the first one is still
  // pending (which would strand the user with no visible confirmation of
  // whether the action ever actually completed).
  confirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  confirming = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="motion-fade fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={confirming ? undefined : onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="motion-scale-in w-full max-w-sm rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 shadow-md"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold text-[var(--color-text)]"
        >
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            {description}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel} disabled={confirming}>
            {cancelLabel}
          </Button>

          <Button
            variant={variant === "danger" ? "danger" : "primary"}
            onClick={onConfirm}
            disabled={confirming}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
