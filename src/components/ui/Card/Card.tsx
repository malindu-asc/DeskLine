import type { ReactNode } from "react";
import { cn } from "../../../shared/utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
}

function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export default Card;