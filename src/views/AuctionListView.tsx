import { AuctionCard } from "../components/auction/AuctionCard";
import { EmptyState } from "../components/feedback/EmptyState";
import { ErrorBanner } from "../components/feedback/ErrorBanner";
import { LoadingSkeleton } from "../components/feedback/LoadingSkeleton";
import { Button } from "../components/ui/Button";
import { useAuctions } from "../hooks/useAuctions";

interface AuctionListViewProps {
  onOpen: (auctionId: number) => void;
  onCreate: () => void;
}

export function AuctionListView({ onOpen, onCreate }: AuctionListViewProps) {
  const { auctions, loading, error } = useAuctions();

  if (loading) {
    return <LoadingSkeleton variant="list" />;
  }

  if (error) {
    return <ErrorBanner message={error} />;
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
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={onCreate}>
          + New auction
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {auctions.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
}
