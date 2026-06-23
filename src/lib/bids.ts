import type { BidEntry } from "./types";

export function bidKey(bid: BidEntry): string {
  return `${bid.bidder}:${bid.amount.toString()}:${bid.timestamp}:${bid.ledger}`;
}
