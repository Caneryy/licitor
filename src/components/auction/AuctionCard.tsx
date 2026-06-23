import type { Auction } from "../../lib/types";
import { formatCountdown, stroopsToXlm } from "../../lib/format";
import { Badge } from "../ui/Badge";

interface AuctionCardProps {
  auction: Auction;
  onOpen: (auctionId: number) => void;
}

export function AuctionCard({ auction, onOpen }: AuctionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(auction.id)}
      className="neo-card w-full p-4 text-left transition hover:-translate-y-0.5"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-xl font-black">{auction.title}</h3>
        <Badge>{auction.status}</Badge>
      </div>
      <div className="space-y-1 text-sm">
        <p>
          Highest bid: <strong>{stroopsToXlm(auction.highestBid)} XLM</strong>
        </p>
        <p>Ends in: {formatCountdown(auction.endTime)}</p>
      </div>
    </button>
  );
}
