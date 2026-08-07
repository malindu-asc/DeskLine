import { cn } from "../../../shared/utils/cn";

interface AvatarProps {
  name: string;
  className?: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

  return (first + last).toUpperCase();
}

// aria-hidden: the name is always rendered as visible text right next to
// this, so a screen reader announcing "JD" here too would just be noise.
function Avatar({ name, className }: AvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full bg-[var(--color-primary)] text-xs font-semibold text-white",
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}

export default Avatar;
