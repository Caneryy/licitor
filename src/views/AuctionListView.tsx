import { AuctionCard } from "../components/auction/AuctionCard";
import { useAuctions } from "../hooks/useAuctions";

interface AuctionListViewProps {
  onOpen: (auctionId: number) => void;
}

export function AuctionListView({ onOpen }: AuctionListViewProps) {
  const { auctions, loading, error } = useAuctions();

  if (loading) {
    return <p className="text-sm">Loading auctions…</p>;
  }

  if (error) {
    return <p className="text-sm text-red-700">{error}</p>;
  }

  if (auctions.length === 0) {
    return (
      <div className="neo-card p-6">
        <h2 className="text-2xl font-black">No auctions yet</h2>
        <p className="mt-2 text-sm">Create the first auction to start live bidding.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {auctions.map((auction) => (
        <AuctionCard key={auction.id} auction={auction} onOpen={onOpen} />
      ))}
    </div>
  );
}
