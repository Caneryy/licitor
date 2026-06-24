import { AuctionCard } from "../components/auction/AuctionCard";
import { EmptyState } from "../components/feedback/EmptyState";
import { ErrorBanner } from "../components/feedback/ErrorBanner";
import { InfoBanner } from "../components/feedback/InfoBanner";
import { LoadingSkeleton } from "../components/feedback/LoadingSkeleton";
import { Button } from "../components/ui/Button";
import { useAuctions } from "../hooks/useAuctions";
import { useAuctionListEvents } from "../hooks/useAuctionListEvents";

interface AuctionListViewProps {
  onOpen: (auctionId: number) => void;
  onCreate: () => void;
}

export function AuctionListView({ onOpen, onCreate }: AuctionListViewProps) {
  const { auctions, loading, error, refreshList } = useAuctions();
  const { syncError, reconnect, live } = useAuctionListEvents(!loading && !error, refreshList);

  if (loading) {
    return <LoadingSkeleton variant="list" />;
  }

  if (error) {
    return (
      <div className="space-y-3">
        <ErrorBanner message={error} />
        <Button type="button" onClick={() => void refreshList()}>
          Retry
        </Button>
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <EmptyState
        title="No auctions yet"
        description="Create the first auction to start live bidding on Stellar testnet."
        action={
          <Button type="button" onClick={onCreate}>
            Create auction
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">Open auctions</h2>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            {auctions.length} auction{auctions.length === 1 ? "" : "s"} available
            {live ? " · Live sync on" : " · Live sync paused"}
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={onCreate}>
          + New auction
        </Button>
      </div>
      {syncError && (
        <div className="flex flex-wrap items-center gap-3">
          <InfoBanner message={`Live updates paused: ${syncError}`} />
          <Button type="button" variant="ghost" onClick={() => void reconnect()}>
            Reconnect
          </Button>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2">
        {auctions.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}
