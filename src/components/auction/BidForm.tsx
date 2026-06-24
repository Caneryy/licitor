import { useEffect, useState } from "react";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
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
import { suggestedNextBidXlm, TOKEN_SYMBOL, xlmToStroops } from "../../lib/format";
import { getTestnetUsdcFaucetUrl, submitChangeTrust } from "../../lib/token";
import { getExplorerTxUrl } from "../../lib/explorer";
import { classifyError } from "../../lib/errors";
import { AnimatedHighestBid } from "./AnimatedHighestBid";
import { useAuctionNow } from "./AuctionStatus";
import type { Auction, PlacedBid } from "../../lib/types";

interface BidFormProps {
  auction: Auction;
  onBidPlaced: (bid: PlacedBid) => void;
}

export function BidForm({ auction, onBidPlaced }: BidFormProps) {
  const { address, connected, sign } = useStellarWallet();
  const { hasFeeBalance, tokenBalanceLabel, hasTokenBalance, hasTrustline, tokenBalance, refresh } =
    useBalance(address);
  const { phase, error, txHash, run, reset } = useSubmitAction();
  const now = useAuctionNow();
  const biddingOpen = isBiddingOpen(auction, now);

  const [amount, setAmount] = useState(() => suggestedNextBidXlm(auction.highestBid));
  const [localError, setLocalError] = useState<string | null>(null);
  const [trustlineBusy, setTrustlineBusy] = useState(false);
  const [trustlineTxHash, setTrustlineTxHash] = useState<string | null>(null);

  const needsTrustline =
    connected && hasTrustline === false && (tokenBalance === null || tokenBalance === 0n);
  const needsUsdcFunds =
    connected && hasTrustline === true && tokenBalance !== null && tokenBalance === 0n;

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

  const handleAddTrustline = async () => {
    if (!address) return;
    setTrustlineBusy(true);
    setLocalError(null);
    setTrustlineTxHash(null);
    try {
      const hash = await submitChangeTrust(address, sign);
      if (hash === "trustline_exists") {
        setTrustlineTxHash(null);
      } else {
        setTrustlineTxHash(hash);
      }
      await refresh();
      window.setTimeout(() => {
        void refresh();
      }, 3000);
    } catch (err) {
      setLocalError(classifyError(err).message);
    } finally {
      setTrustlineBusy(false);
    }
  };

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

    if (!hasTokenBalance(stroops)) {
      if (needsTrustline) {
        setLocalError("Add a USDC trustline before placing a bid.");
        return;
      }
      setLocalError(validationErrors.insufficientTokenBalance.message);
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
      void refresh();
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-black">Place Bid</h2>
        <Badge>Escrow secured</Badge>
      </div>
      <p className="text-sm">
        Current highest: <AnimatedHighestBid amount={auction.highestBid} />
      </p>
      {tokenBalanceLabel && (
        <p className="text-xs text-[var(--ink-muted)]">Your balance: {tokenBalanceLabel}</p>
      )}

      {!connected && <InfoBanner message="Connect your wallet to place a bid." />}
      {needsTrustline && (
        <div className="space-y-2">
          <InfoBanner message="Add a testnet USDC trustline to receive USDC for escrow-protected bids." />
          <button
            type="button"
            className="neo-button px-4 py-2 text-sm font-bold"
            disabled={trustlineBusy}
            onClick={() => void handleAddTrustline()}
          >
            {trustlineBusy ? "Signing & submitting…" : "Add USDC trustline"}
          </button>
        </div>
      )}
      {trustlineTxHash && (
        <div className="space-y-2">
          <InfoBanner message="USDC trustline added successfully." />
          <a
            className="text-sm font-bold underline"
            href={getExplorerTxUrl(trustlineTxHash)}
            target="_blank"
            rel="noreferrer"
          >
            View trustline transaction
          </a>
        </div>
      )}
      {needsUsdcFunds && (
        <div className="space-y-2">
          <InfoBanner message="Trustline is ready. Fund testnet USDC to place bids." />
          <a
            className="text-sm font-bold underline"
            href={getTestnetUsdcFaucetUrl()}
            target="_blank"
            rel="noreferrer"
          >
            Get testnet USDC from Circle Faucet
          </a>
        </div>
      )}
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
        Your bid ({TOKEN_SYMBOL})
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={disabled}
          inputMode="decimal"
          min="0"
          step="any"
        />
        <span className="block text-xs font-normal text-[var(--ink-muted)]">
          Minimum: {suggestedNextBidXlm(auction.highestBid)} {TOKEN_SYMBOL}
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
