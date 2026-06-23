import type { InputHTMLAttributes } from "react";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input className="neo-input w-full px-3 py-3 min-h-11" {...props} />;
}
