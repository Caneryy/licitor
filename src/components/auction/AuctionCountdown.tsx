import { useEffect, useState } from "react";
import type { Auction } from "../../lib/types";
import { getAuctionTimingLabel } from "../../lib/auctionDisplay";

interface AuctionCountdownProps {
  auction: Auction;
}

export function AuctionCountdown({ auction }: AuctionCountdownProps) {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return <span className="font-bold">{getAuctionTimingLabel(auction, now)}</span>;
}
