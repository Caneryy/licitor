import { useStellarWallet } from "../../hooks/useStellarWallet";
import { useBalance } from "../../hooks/useBalance";
import { truncateMiddle } from "../../lib/format";

export function WalletBar() {
  const { address, connected } = useStellarWallet();
  const { balance, loading } = useBalance(address);

  if (!connected || !address) return null;

  return (
    <div className="border-t-2 border-[var(--border)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 text-sm">
        <span className="text-[var(--ink-muted)]">Wallet</span>
        <code className="font-bold">{truncateMiddle(address, 10, 8)}</code>
        <span className="hidden text-[var(--ink-muted)] sm:inline">·</span>
        <span className="text-[var(--ink-muted)]">Balance</span>
        <span className="font-bold">
          {loading ? (
            <span className="inline-block h-4 w-16 animate-pulse bg-[var(--ink-muted)] opacity-30" />
          ) : balance !== null ? (
            `${balance.toFixed(4)} XLM`
          ) : (
            "n/a"
          )}
        </span>
      </div>
    </div>
  );
}
