import { useEffect, useState } from "react";
import { Input } from "../ui/Input";
import { ErrorBanner } from "../feedback/ErrorBanner";
import { InfoBanner } from "../feedback/InfoBanner";
import { TxStatusButton } from "../feedback/TxStatusButton";
import { TxSuccessCard } from "../feedback/TxSuccessCard";
import { useSubmitAction } from "../../hooks/useSubmitAction";
import { useStellarWallet } from "../../hooks/useStellarWallet";
import { useBalance } from "../../hooks/useBalance";
import { buildPlaceBidArgs } from "../../lib/auction";
import { validationErrors } from "../../lib/errors";
import { isBiddingOpen } from "../../lib/auctionDisplay";
import { suggestedNextBidXlm, xlmToStroops } from "../../lib/format";
import { AnimatedHighestBid } from "./AnimatedHighestBid";
import { useAuctionNow } from "./AuctionStatus";
import type { Auction, PlacedBid } from "../../lib/types";

interface BidFormProps {
  auction: Auction;
  onBidPlaced: (bid: PlacedBid) => void;
}

export function BidForm({ auction, onBidPlaced }: BidFormProps) {
  const { address, connected, sign } = useStellarWallet();
  const { hasFeeBalance } = useBalance(address);
  const { phase, error, txHash, run, reset } = useSubmitAction();
  const now = useAuctionNow();
  const biddingOpen = isBiddingOpen(auction, now);

  const [amount, setAmount] = useState(() => suggestedNextBidXlm(auction.highestBid));
  const [localError, setLocalError] = useState<string | null>(null);

  const handleReset = () => {
    reset();
    setAmount(suggestedNextBidXlm(auction.highestBid));
  };

  useEffect(() => {
    try {
      if (xlmToStroops(amount) <= auction.highestBid) {
        setAmount(suggestedNextBidXlm(auction.highestBid));
      }
    } catch {
      setAmount(suggestedNextBidXlm(auction.highestBid));
    }
  }, [auction.highestBid]);

  const handleSubmit = async () => {
    setLocalError(null);
    if (!connected || !address) {
      setLocalError("Connect a wallet first.");
      return;
    }
    if (!biddingOpen) {
      setLocalError(auction.status === "Ended" ? "Auction has ended." : "Bidding is closed for this auction.");
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
      const result = await run({
        sourceAddress: address,
        method: "place_bid",
        args: buildPlaceBidArgs(address, auction.id, stroops),
        sign,
      });
      onBidPlaced({
        auctionId: auction.id,
        bidder: address,
        amount: stroops,
        txHash: result.hash,
      });
    } catch {
      // Error handled by hook.
    }
  };

  const disabled =
    !biddingOpen ||
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
        Current highest: <AnimatedHighestBid amount={auction.highestBid} />
      </p>

      {!connected && <InfoBanner message="Connect your wallet to place a bid." />}
      {connected && !biddingOpen && (
        <InfoBanner
          message={
            auction.status === "Ended"
              ? "This auction has ended."
              : "Bidding is closed for this auction."
          }
        />
      )}
      <ErrorBanner message={localError ?? error?.message ?? ""} onDismiss={() => setLocalError(null)} />

      <label className="block space-y-2 text-sm font-bold">
        Your bid (XLM)
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={disabled}
          inputMode="decimal"
          min="0"
          step="any"
        />
        <span className="block text-xs font-normal text-[var(--ink-muted)]">
          Minimum: {suggestedNextBidXlm(auction.highestBid)} XLM
        </span>
      </label>

      {phase === "success" && txHash ? (
        <TxSuccessCard hash={txHash} onReset={handleReset} resetLabel="Place another bid" />
      ) : (
        <TxStatusButton phase={phase} idleLabel="Place bid" onClick={() => void handleSubmit()} disabled={disabled} />
      )}
    </form>
  );
}
