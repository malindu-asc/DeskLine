import type { VariantProps } from "class-variance-authority";
import { badgeVariants } from "./badgeVariants";
import { cn } from "../../../shared/utils/cn";

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode;
}

function Badge({
  children,
  variant,
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }))}>
      {children}
    </span>
  );
}

export default Badge;