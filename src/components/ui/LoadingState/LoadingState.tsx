import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--color-border)] p-10 text-center"
    >
      <Loader2 className="size-6 animate-spin text-[var(--color-info)]" aria-hidden="true" />
      <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
    </div>
  );
}

export default LoadingState;
