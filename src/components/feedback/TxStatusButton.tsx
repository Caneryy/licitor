import type { TxPhase } from "../../lib/types";

const LABELS: Record<TxPhase, string> = {
  idle: "",
  signing: "Confirm in wallet…",
  submitting: "Submitting…",
  confirming: "Confirming on network…",
  success: "Success",
  error: "Try again",
};

interface TxStatusButtonProps {
  phase: TxPhase;
  idleLabel: string;
  successLabel?: string;
  disabled?: boolean;
  onClick: () => void;
}

export function TxStatusButton({
  phase,
  idleLabel,
  successLabel = "Done",
  disabled,
  onClick,
}: TxStatusButtonProps) {
  const label =
    phase === "idle"
      ? idleLabel
      : phase === "success"
        ? successLabel
        : LABELS[phase] || idleLabel;

  const isBusy = phase === "signing" || phase === "submitting" || phase === "confirming";

  return (
    <button
      type="button"
      className="neo-button w-full px-4 py-3 min-h-11"
      onClick={onClick}
      disabled={disabled || isBusy}
      aria-live="polite"
    >
      {isBusy ? (
        <>
          <span className="tx-spinner" aria-hidden="true" />
          {label}
        </>
      ) : (
        label
      )}
    </button>
  );
}
