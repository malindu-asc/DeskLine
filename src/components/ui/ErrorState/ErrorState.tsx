import { AlertTriangle } from "lucide-react";
import { Button } from "../Button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

function ErrorState({ message = "Something went wrong.", onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-red-500/20 bg-red-50 p-10 text-center"
    >
      <AlertTriangle className="size-6 text-red-700" aria-hidden="true" />
      <p className="text-sm text-[var(--color-text-secondary)]">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
