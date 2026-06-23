import { useMemo } from "react";
import { AuctionCountdown } from "../components/auction/AuctionCountdown";
import { BidForm } from "../components/auction/BidForm";
import { BidHistoryList } from "../components/auction/BidHistoryList";
import { LiveBidFeed } from "../components/auction/LiveBidFeed";
import { ErrorBanner } from "../components/feedback/ErrorBanner";
import { TxStatusButton } from "../components/feedback/TxStatusButton";
import { TxSuccessCard } from "../components/feedback/TxSuccessCard";
import { useAuctionDetail } from "../hooks/useAuctions";
import { useAuctionEvents } from "../hooks/useAuctionEvents";
import { useSubmitAction } from "../hooks/useSubmitAction";
import { useStellarWallet } from "../hooks/useStellarWallet";
import { buildFinalizeArgs } from "../lib/auction";
import { stroopsToXlm, truncateMiddle } from "../lib/format";
import { Badge } from "../components/ui/Badge";
import type { PlacedBid } from "../lib/types";

interface AuctionDetailViewProps {
  auctionId: number;
  onBack: () => void;
}

export function AuctionDetailView({ auctionId, onBack }: AuctionDetailViewProps) {
  const { address, sign } = useStellarWallet();
  const { auction, bids, loading, error, refreshDetail } = useAuctionDetail(auctionId, undefined, true);
  const listenerEnabled = auction?.status === "Active";
  const { events: liveEvents, live, pushBidEvent, refreshEvents } = useAuctionEvents(
    auctionId,
    listenerEnabled,
  );
  const finalizeAction = useSubmitAction();

  const mergedBids = useMemo(() => {
    const txMap = new Map(liveEvents.map((event) => [event.id, event.txHash]));
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
    return <p className="text-sm">Loading auction…</p>;
  }

  if (!auction) {
    return <ErrorBanner message={error ?? "Auction not found."} />;
  }

  const canFinalize =
    auction.status === "Active" && Math.floor(Date.now() / 1000) >= auction.endTime;

  return (
    <div className="space-y-4">
      <button type="button" className="font-bold underline" onClick={onBack}>
        ← Back to auctions
      </button>

      <section className="neo-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-3xl font-black">{auction.title}</h2>
          <Badge>{auction.status}</Badge>
        </div>
        <p className="text-sm">
          Seller: <strong>{truncateMiddle(auction.seller, 8, 6)}</strong>
        </p>
        <p className="text-sm">
          Highest bid: <strong>{stroopsToXlm(auction.highestBid)} XLM</strong>
        </p>
        <p className="text-sm">
          Ends in: <AuctionCountdown auction={auction} />
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <BidForm auction={auction} onBidPlaced={handleBidPlaced} />
        <LiveBidFeed events={liveEvents} live={live} />
      </div>

      <BidHistoryList bids={mergedBids} />

      {canFinalize && (
        <section className="neo-card space-y-3 p-4">
          <h3 className="text-xl font-black">Finalize Auction</h3>
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
