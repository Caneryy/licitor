import { useMemo, useState } from "react";
import { AuctionCountdown } from "../components/auction/AuctionCountdown";
import { AuctionStatusBadge } from "../components/auction/AuctionStatus";
import { BidForm } from "../components/auction/BidForm";
import { BidHistoryList } from "../components/auction/BidHistoryList";
import { AnimatedHighestBid } from "../components/auction/AnimatedHighestBid";
import { ErrorBanner } from "../components/feedback/ErrorBanner";
import { InfoBanner } from "../components/feedback/InfoBanner";
import { LoadingSkeleton } from "../components/feedback/LoadingSkeleton";
import { TxStatusButton } from "../components/feedback/TxStatusButton";
import { TxSuccessCard } from "../components/feedback/TxSuccessCard";
import { Button } from "../components/ui/Button";
import { useAuctionDetail } from "../hooks/useAuctions";
import { useAuctionEvents } from "../hooks/useAuctionEvents";
import { useSubmitAction } from "../hooks/useSubmitAction";
import { useStellarWallet } from "../hooks/useStellarWallet";
import { buildFinalizeArgs } from "../lib/auction";
import { getAuctionPhase } from "../lib/auctionDisplay";
import { formatTokenWithSymbol, formatDateTime, truncateMiddle } from "../lib/format";
import { auctionUrl } from "../lib/routes";
import type { PlacedBid } from "../lib/types";

interface AuctionDetailViewProps {
  auctionId: number;
  onBack: () => void;
}

export function AuctionDetailView({ auctionId, onBack }: AuctionDetailViewProps) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const { address, sign } = useStellarWallet();
  const { auction, bids, loading, error, refreshDetail } = useAuctionDetail(auctionId, undefined, true);
  const listenerEnabled = auction ? getAuctionPhase(auction) === "live" : false;
  const { events: liveEvents, live, syncError, pushBidEvent, refreshEvents, reconnect } = useAuctionEvents(
    auctionId,
    listenerEnabled,
  );
  const finalizeAction = useSubmitAction();

  const mergedBids = useMemo(() => {
    const txMap = new Map(
      liveEvents.map((event) => [`${event.bidder}:${event.amount.toString()}`, event.txHash]),
    );
    return bids.map((bid, index) => ({
      ...bid,
      txHash: bid.txHash ?? txMap.get(`${bid.bidder}:${bid.amount.toString()}`),
      key: `${bid.bidder}-${bid.timestamp}-${index}`,
    }));
  }, [bids, liveEvents]);

  const handleBidPlaced = (bid: PlacedBid) => {
    pushBidEvent(bid);
    void refreshDetail();
    void refreshEvents();
  };

  const handleFinalize = async () => {
    if (!address || !auction) return;
    try {
      await finalizeAction.run({
        sourceAddress: address,
        method: "finalize_auction",
        args: buildFinalizeArgs(address, auction.id),
        sign,
      });
      void refreshDetail();
      void refreshEvents();
    } catch {
      // handled in hook
    }
  };

  if (loading && !auction) {
    return <LoadingSkeleton variant="detail" />;
  }

  if (!auction) {
    return (
      <div className="space-y-4">
        <Button type="button" variant="ghost" onClick={onBack}>
          ← Back to auctions
        </Button>
        <ErrorBanner message={error ?? "Auction not found."} />
        <Button type="button" onClick={() => void refreshDetail()}>
          Retry
        </Button>
      </div>
    );
  }

  const phase = getAuctionPhase(auction);
  const canFinalize = phase === "expired";

  const copyShareLink = async () => {
    setCopyError(null);
    try {
      await navigator.clipboard.writeText(auctionUrl(auctionId));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError("Could not copy link. Copy the URL from your browser address bar.");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack}>
          ← Back to auctions
        </Button>
        <Button type="button" variant="ghost" onClick={() => void copyShareLink()}>
          {copied ? "Link copied ✓" : "Copy share link"}
        </Button>
      </div>
      {copyError && <ErrorBanner message={copyError} onDismiss={() => setCopyError(null)} />}

      <section className="neo-card space-y-3 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-black">{auction.title}</h2>
          <AuctionStatusBadge auction={auction} />
        </div>
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-[var(--ink-muted)]">Seller</dt>
            <dd className="font-bold">{truncateMiddle(auction.seller, 8, 6)}</dd>
          </div>
          <div>
            <dt className="text-[var(--ink-muted)]">Starting bid</dt>
            <dd className="font-bold">{formatTokenWithSymbol(auction.startingBid)}</dd>
          </div>
          <div>
            <dt className="text-[var(--ink-muted)]">Highest bid</dt>
            <dd className="font-bold">
              <AnimatedHighestBid amount={auction.highestBid} />
            </dd>
          </div>
          <div>
            <dt className="text-[var(--ink-muted)]">Leading bidder</dt>
            <dd className="font-bold">
              {auction.highestBidder
                ? truncateMiddle(auction.highestBidder, 8, 6)
                : "No bids yet"}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--ink-muted)]">Ends at</dt>
            <dd className="font-bold">{formatDateTime(auction.endTime)}</dd>
          </div>
          <div>
            <dt className="text-[var(--ink-muted)]">
              {phase === "live" ? "Time remaining" : "Status"}
            </dt>
            <dd className="font-bold">
              <AuctionCountdown auction={auction} />
            </dd>
          </div>
        </dl>
      </section>

      {syncError && (
        <InfoBanner message={`Live updates paused: ${syncError}`} />
      )}
      {syncError && (
        <Button type="button" variant="ghost" onClick={() => void reconnect()}>
          Reconnect live updates
        </Button>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <BidForm auction={auction} onBidPlaced={handleBidPlaced} />
        <BidHistoryList auctionId={auctionId} bids={mergedBids} live={live} />
      </div>

      {canFinalize && (
        <section className="neo-card space-y-3 p-4">
          <h3 className="text-xl font-black">Finalize Auction</h3>
          <p className="text-sm text-[var(--ink-muted)]">
            Bidding has closed. Finalize to settle the winner on-chain.
          </p>
          <ErrorBanner message={finalizeAction.error?.message ?? ""} />
          {finalizeAction.phase === "success" && finalizeAction.txHash ? (
            <TxSuccessCard hash={finalizeAction.txHash} onReset={finalizeAction.reset} />
          ) : (
            <TxStatusButton
              phase={finalizeAction.phase}
              idleLabel="Finalize auction"
              onClick={() => void handleFinalize()}
            />
          )}
        </section>
      )}
    </div>
  );
}
