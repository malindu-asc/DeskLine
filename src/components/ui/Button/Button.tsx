import type { ButtonHTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";
import clsx from "clsx";

import { buttonVariants } from "./buttonVariants";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

function Button({
  className,
  variant,
  size,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export default Button;