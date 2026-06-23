import { useEffect, useState } from "react";
import type { Auction } from "../../lib/types";
import {
  getAuctionBadgeLabel,
  getAuctionPhase,
  getAuctionTimingCaption,
  getAuctionTimingLabel,
} from "../../lib/auctionDisplay";
import { Badge } from "../ui/Badge";

export function useAuctionNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), intervalMs);
    return () => window.clearInterval(timer);
  }, [intervalMs]);

  return now;
}

interface AuctionStatusBadgeProps {
  auction: Auction;
}

export function AuctionStatusBadge({ auction }: AuctionStatusBadgeProps) {
  const now = useAuctionNow();
  const phase = getAuctionPhase(auction, now);
  return <Badge>{getAuctionBadgeLabel(phase)}</Badge>;
}

interface AuctionTimingLineProps {
  auction: Auction;
}

export function AuctionTimingLine({ auction }: AuctionTimingLineProps) {
  const now = useAuctionNow();
  const phase = getAuctionPhase(auction, now);

  return (
    <p>
      {getAuctionTimingCaption(phase)}:{" "}
      <strong className="font-bold">{getAuctionTimingLabel(auction, now)}</strong>
    </p>
  );
}
