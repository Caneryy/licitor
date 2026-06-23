import { getExplorerTxUrl } from "../../lib/explorer";

interface TxSuccessCardProps {
  hash: string;
  onReset?: () => void;
  resetLabel?: string;
}

export function TxSuccessCard({
  hash,
  onReset,
  resetLabel = "Dismiss",
}: TxSuccessCardProps) {
  return (
    <div className="tx-success space-y-3 border-2 border-[var(--border)] bg-[var(--paper)] p-4">
      <p className="font-bold text-[var(--accent)]">Transaction confirmed</p>
      <div className="flex flex-col items-start gap-2">
        <a
          href={getExplorerTxUrl(hash)}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-bold underline"
        >
          View on Stellar Expert
        </a>
        {onReset && (
          <button type="button" className="text-sm font-bold underline" onClick={onReset}>
            {resetLabel}
          </button>
        )}
      </div>
    </div>
  );
}
