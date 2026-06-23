import { useCallback, useEffect, useRef, useState } from "react";
import { readAllAuctions, readAuction, readRecentBids } from "../lib/auction";
import { DETAIL_POLL_INTERVAL_MS } from "../lib/stellar";
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

export function useAuctionDetail(
  auctionId: number | null,
  reader?: string | null,
  poll = false,
) {
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<BidEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDetail = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!auctionId) return;
      const silent = options?.silent ?? false;
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const [nextAuction, nextBids] = await Promise.all([
          readAuction(auctionId, reader ?? undefined),
          readRecentBids(auctionId, reader ?? undefined),
        ]);
        setAuction(nextAuction);
        setBids(nextBids);
      } catch (err) {
        if (!silent) {
          setError(err instanceof Error ? err.message : "Failed to load auction.");
        }
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [auctionId, reader],
  );

  const refreshDetailRef = useRef(refreshDetail);
  refreshDetailRef.current = refreshDetail;

  useEffect(() => {
    void refreshDetail();
  }, [refreshDetail]);

  useEffect(() => {
    if (!auctionId || !poll) return undefined;

    const tick = () => {
      void refreshDetailRef.current({ silent: true });
    };

    tick();
    const timer = window.setInterval(tick, DETAIL_POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [auctionId, poll]);

  return { auction, bids, loading, error, refreshDetail, setBids };
}
