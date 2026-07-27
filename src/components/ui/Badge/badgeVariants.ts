import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium capitalize",
  {
    variants: {
      variant: {
        open: "bg-green-100 text-green-700",
        pending: "bg-yellow-100 text-yellow-700",
        closed: "bg-gray-200 text-gray-700",
        cancelled: "bg-red-100 text-red-700",

        low: "bg-sky-100 text-sky-700",
        medium: "bg-orange-100 text-orange-700",
        high: "bg-red-100 text-red-700",

        hardware: "bg-blue-100 text-blue-700",
        software: "bg-purple-100 text-purple-700",
        facilities: "bg-emerald-100 text-emerald-700",
        access: "bg-indigo-100 text-indigo-700",
      },
    },
  }
);