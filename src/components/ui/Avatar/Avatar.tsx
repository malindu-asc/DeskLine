import { cn } from "../../../shared/utils/cn";

interface AvatarProps {
  name: string;
  size?: "sm" | "md";
  className?: string;
}

// Full class strings per size, not a single overridden `size-*` utility -
// this project's `cn()` is plain clsx (no tailwind-merge), so appending a
// conflicting size class via `className` wouldn't reliably win the cascade.
const sizeClasses: Record<NonNullable<AvatarProps["size"]>, string> = {
  sm: "size-6 text-[10px]",
  md: "size-8 text-xs",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

  return (first + last).toUpperCase();
}

// aria-hidden: the name is always rendered as visible text right next to
// this, so a screen reader announcing "JD" here too would just be noise.
function Avatar({ name, size = "md", className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-[var(--color-primary)] font-semibold text-white",
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}

export default Avatar;
