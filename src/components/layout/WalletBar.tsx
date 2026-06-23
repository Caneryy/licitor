import { useStellarWallet } from "../../hooks/useStellarWallet";
import { useBalance } from "../../hooks/useBalance";
import { truncateMiddle } from "../../lib/format";

export function WalletBar() {
  const { address, connected } = useStellarWallet();
  const { balance, loading } = useBalance(address);

  if (!connected || !address) return null;

  return (
    <div className="border-t-2 border-[var(--border)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-4 py-2 text-sm">
        <span className="font-bold">Connected:</span>
        <code>{truncateMiddle(address, 8, 6)}</code>
        <span className="font-bold">Balance:</span>
        <span>{loading ? "…" : balance !== null ? `${balance.toFixed(4)} XLM` : "—"}</span>
      </div>
    </div>
  );
}
