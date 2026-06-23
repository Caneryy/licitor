import { Button } from "../ui/Button";
import { getExplorerTxUrl } from "../../lib/explorer";
import { truncateMiddle } from "../../lib/format";

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
    <div className="tx-success-card" role="status" aria-live="polite">
      <div className="flex items-start gap-3">
        <span className="tx-success-icon" aria-hidden="true">
          ✓
        </span>
        <div className="min-w-0 flex-1 space-y-1">
          <p className="tx-success-title">Transaction confirmed</p>
          <p className="text-xs text-neutral-700">
            Hash: <span className="font-mono font-bold">{truncateMiddle(hash, 8, 8)}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <a
          href={getExplorerTxUrl(hash)}
          target="_blank"
          rel="noreferrer"
          className="neo-button inline-flex min-h-11 flex-1 items-center justify-center px-4 py-3 text-center no-underline"
        >
          View on Stellar Expert ↗
        </a>
        {onReset && (
          <Button type="button" variant="ghost" className="w-full flex-1" onClick={onReset}>
            {resetLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
