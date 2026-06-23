import { getExplorerTxUrl } from "../../lib/explorer";

interface TxSuccessCardProps {
  hash: string;
  onReset?: () => void;
}

export function TxSuccessCard({ hash, onReset }: TxSuccessCardProps) {
  return (
    <div className="neo-card space-y-3 p-4">
      <p className="font-bold">Transaction confirmed</p>
      <a
        href={getExplorerTxUrl(hash)}
        target="_blank"
        rel="noreferrer"
        className="break-all text-sm underline"
      >
        View on Stellar Expert
      </a>
      {onReset && (
        <button type="button" className="text-sm font-bold underline" onClick={onReset}>
          Make another action
        </button>
      )}
    </div>
  );
}
