import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost";
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  const styles =
    variant === "primary"
      ? "neo-button px-4 py-3 min-h-11"
      : "border-2 border-[var(--border)] bg-[var(--surface)] px-4 py-3 min-h-11 shadow-[2px_2px_0_var(--ink)]";

  return <button className={`${styles} ${className}`} {...props} />;
}
