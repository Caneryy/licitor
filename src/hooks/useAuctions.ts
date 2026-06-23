import { useCallback, useEffect, useState } from "react";
import { readAllAuctions, readAuction, readRecentBids } from "../lib/auction";
import type { Auction, BidEntry } from "../lib/types";

export function useAuctions(reader?: string | null) {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAuctions(await readAllAuctions(reader ?? undefined));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load auctions.");
    } finally {
      setLoading(false);
    }
  }, [reader]);

  useEffect(() => {
    void refreshList();
  }, [refreshList]);

  return { auctions, loading, error, refreshList };
}

export function useAuctionDetail(auctionId: number | null, reader?: string | null) {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<BidEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDetail = useCallback(async () => {
    if (!auctionId) return;
    setLoading(true);
    setError(null);
    try {
      const [nextAuction, nextBids] = await Promise.all([
        readAuction(auctionId, reader ?? undefined),
        readRecentBids(auctionId, reader ?? undefined),
      ]);
      setAuction(nextAuction);
      setBids(nextBids);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load auction.");
    } finally {
      setLoading(false);
    }
  }, [auctionId, reader]);

  useEffect(() => {
    void refreshDetail();
  }, [refreshDetail]);

  return { auction, bids, loading, error, refreshDetail, setBids };
}
