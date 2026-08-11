import { Laptop, AppWindow, Building2, KeyRound, type LucideIcon } from "lucide-react";
import type { RequestCategory } from "../../../shared/types";

const CATEGORY_ICONS: Record<RequestCategory, LucideIcon> = {
  hardware: Laptop,
  software: AppWindow,
  facilities: Building2,
  access: KeyRound,
};

// Mirrors the category color families already used in badgeVariants.ts, so
// the leading icon and the category badge below it reinforce the same
// color coding instead of introducing an unrelated second color system.
const CATEGORY_ICON_STYLES: Record<RequestCategory, string> = {
  hardware: "bg-blue-100 text-blue-700",
  software: "bg-purple-100 text-purple-700",
  facilities: "bg-emerald-100 text-emerald-700",
  access: "bg-indigo-100 text-indigo-700",
};

export function getCategoryIcon(category: RequestCategory): LucideIcon {
  return CATEGORY_ICONS[category];
}

export function getCategoryIconStyles(category: RequestCategory): string {
  return CATEGORY_ICON_STYLES[category];
}
