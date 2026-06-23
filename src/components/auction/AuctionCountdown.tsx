import { useEffect, useState } from "react";
import type { Auction } from "../../lib/types";
import { formatCountdown } from "../../lib/format";

interface AuctionCountdownProps {
  auction: Auction;
}

export function AuctionCountdown({ auction }: AuctionCountdownProps) {
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  return <span className="font-bold">{formatCountdown(auction.endTime, now)}</span>;
}
