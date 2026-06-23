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
      onClick={() => onOpen(auction.id)}
      className="neo-card w-full p-4 text-left transition hover:-translate-y-0.5"
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
