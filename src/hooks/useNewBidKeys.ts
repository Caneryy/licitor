import { useEffect, useRef, useState } from "react";
import { bidKey } from "../lib/bids";
import type { BidEntry } from "../lib/types";

const HIGHLIGHT_MS = 3000;

export function useNewBidKeys(auctionId: number, bids: BidEntry[]) {
  const seenKeysRef = useRef<Set<string>>(new Set());
  const isInitialRef = useRef(true);
  const [highlightedKeys, setHighlightedKeys] = useState<Set<string>>(() => new Set());
  const [latestBid, setLatestBid] = useState<BidEntry | null>(null);

  useEffect(() => {
    seenKeysRef.current = new Set();
    isInitialRef.current = true;
    setHighlightedKeys(new Set());
    setLatestBid(null);
  }, [auctionId]);

  useEffect(() => {
    if (bids.length === 0) return undefined;

    const keys = bids.map(bidKey);

    if (isInitialRef.current) {
      keys.forEach((key) => seenKeysRef.current.add(key));
      isInitialRef.current = false;
      return undefined;
    }

    const newBids = bids.filter((bid) => !seenKeysRef.current.has(bidKey(bid)));
    if (newBids.length === 0) return undefined;

    const newKeys = newBids.map(bidKey);
    newKeys.forEach((key) => seenKeysRef.current.add(key));

    setLatestBid(newBids[0] ?? null);
    setHighlightedKeys((current) => new Set([...current, ...newKeys]));

    const timer = window.setTimeout(() => {
      setHighlightedKeys((current) => {
        const next = new Set(current);
        newKeys.forEach((key) => next.delete(key));
        return next;
      });
      setLatestBid(null);
    }, HIGHLIGHT_MS);

    return () => window.clearTimeout(timer);
  }, [bids]);

  return { highlightedKeys, latestBid };
}
