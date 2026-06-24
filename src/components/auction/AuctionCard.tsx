import type { Auction } from "../../lib/types";
import { formatTokenWithSymbol } from "../../lib/format";
import { Badge } from "../ui/Badge";
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
        <div className="flex flex-col items-end gap-1">
          <AuctionStatusBadge auction={auction} />
          <Badge>Escrow</Badge>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        <p>
          Highest bid: <strong>{formatTokenWithSymbol(auction.highestBid)}</strong>
        </p>
        <AuctionTimingLine auction={auction} />
      </div>
    </button>
  );
}
