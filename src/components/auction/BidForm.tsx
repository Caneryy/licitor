import { useState } from "react";
import { Input } from "../ui/Input";
import { ErrorBanner } from "../feedback/ErrorBanner";
import { TxStatusButton } from "../feedback/TxStatusButton";
import { TxSuccessCard } from "../feedback/TxSuccessCard";
import { useSubmitAction } from "../../hooks/useSubmitAction";
import { useStellarWallet } from "../../hooks/useStellarWallet";
import { useBalance } from "../../hooks/useBalance";
import { buildPlaceBidArgs } from "../../lib/auction";
import { validationErrors } from "../../lib/errors";
import { stroopsToXlm, xlmToStroops } from "../../lib/format";
import type { Auction } from "../../lib/types";

interface BidFormProps {
  auction: Auction;
  onBidPlaced: () => void;
}

export function BidForm({ auction, onBidPlaced }: BidFormProps) {
  const { address, connected, sign } = useStellarWallet();
  const { hasFeeBalance } = useBalance(address);
  const { phase, error, txHash, run, reset } = useSubmitAction();

  const minBid = auction.highestBid + 1n;
  const [amount, setAmount] = useState(stroopsToXlm(minBid));
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLocalError(null);
    if (!connected || !address) {
      setLocalError("Connect a wallet first.");
      return;
    }
    if (auction.status === "Ended") {
      setLocalError("Auction has ended.");
      return;
    }
    if (!hasFeeBalance) {
      setLocalError("Insufficient XLM for transaction fees.");
      return;
    }

    let stroops: bigint;
    try {
      stroops = xlmToStroops(amount);
      if (stroops <= auction.highestBid) {
        setLocalError(validationErrors.invalidBidAmount.message);
        return;
      }
    } catch {
      setLocalError(validationErrors.invalidBidAmount.message);
      return;
    }

    try {
      await run({
        sourceAddress: address,
        method: "place_bid",
        args: buildPlaceBidArgs(address, auction.id, stroops),
        sign,
      });
      onBidPlaced();
    } catch {
      // Error handled by hook.
    }
  };

  const disabled =
    auction.status === "Ended" ||
    phase === "signing" ||
    phase === "submitting" ||
    phase === "confirming";

  return (
    <form
      className="neo-card space-y-4 p-4"
      onSubmit={(event) => {
        event.preventDefault();
        void handleSubmit();
      }}
    >
      <h2 className="text-2xl font-black">Place Bid</h2>
      <p className="text-sm">
        Current highest: <strong>{stroopsToXlm(auction.highestBid)} XLM</strong>
      </p>
      <ErrorBanner message={localError ?? error?.message ?? ""} onDismiss={() => setLocalError(null)} />

      <label className="block space-y-2 text-sm font-bold">
        Your bid (XLM)
        <Input value={amount} onChange={(e) => setAmount(e.target.value)} disabled={disabled} />
      </label>

      {phase === "success" && txHash ? (
        <TxSuccessCard hash={txHash} onReset={reset} />
      ) : (
        <TxStatusButton phase={phase} idleLabel="Place bid" onClick={() => void handleSubmit()} disabled={disabled} />
      )}
    </form>
  );
}
