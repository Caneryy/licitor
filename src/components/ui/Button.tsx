import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const styles =
    variant === "primary"
      ? "neo-button px-4 py-3 min-h-11"
      : "neo-button-ghost px-4 py-3 min-h-11";

  return <button className={`${styles} ${className}`} {...props} />;
}
