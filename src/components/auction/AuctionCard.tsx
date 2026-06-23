import type { Auction } from "../../lib/types";
import { stroopsToXlm } from "../../lib/format";
import { AuctionStatusBadge, AuctionTimingLine } from "./AuctionStatus";

interface AuctionCardProps {
  auction: Auction;
  onOpen: (auctionId: number) => void;
}

export function AuctionCard({ auction, onOpen }: AuctionCardProps) {
  return (
    <button
      type="button"
      className="neo-card neo-card-interactive w-full p-4 text-left"
      onClick={() => onOpen(auction.id)}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <h3 className="text-xl font-black">{auction.title}</h3>
        <AuctionStatusBadge auction={auction} />
      </div>
      <div className="space-y-1 text-sm">
        <p>
          Highest bid: <strong>{stroopsToXlm(auction.highestBid)} XLM</strong>
        </p>
        <AuctionTimingLine auction={auction} />
      </div>
    </button>
  );
}
