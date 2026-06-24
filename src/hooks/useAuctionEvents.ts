import { useCallback, useEffect, useRef, useState } from "react";
import { fetchBidEvents } from "../lib/events";
import { EVENT_FETCH_INTERVAL_MS, getAuctionContractId } from "../lib/stellar";
import type { ParsedBidEvent, PlacedBid } from "../lib/types";

function sortEvents(events: ParsedBidEvent[]): ParsedBidEvent[] {
  return [...events]
    .sort((a, b) => b.ledger - a.ledger || (b.amount > a.amount ? 1 : b.amount < a.amount ? -1 : 0))
    .slice(0, 20);
}

function toParsedBidEvent(bid: PlacedBid): ParsedBidEvent {
  return {
    id: `${bid.txHash}:${bid.bidder}:${bid.amount.toString()}`,
    auctionId: bid.auctionId,
    bidder: bid.bidder,
    amount: bid.amount,
    ledger: bid.ledger ?? 0,
    txHash: bid.txHash,
  };
}

export function useAuctionEvents(auctionId: number | null, enabled: boolean) {
  const [events, setEvents] = useState<ParsedBidEvent[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [visible, setVisible] = useState(
    typeof document === "undefined" ? true : !document.hidden,
  );
  const seenRef = useRef<Set<string>>(new Set());
  const auctionIdRef = useRef(auctionId);
  const pollRef = useRef<(() => Promise<void>) | null>(null);
  auctionIdRef.current = auctionId;

  const active = enabled && visible;

  const syncFromRpc = useCallback(async (replace = false) => {
    const currentAuctionId = auctionIdRef.current;
    if (!currentAuctionId) return;

    const incoming = await fetchBidEvents(getAuctionContractId(), currentAuctionId);
    setSyncError(null);
    const fresh = incoming.filter((event) => !seenRef.current.has(event.id));

    if (replace) {
      seenRef.current = new Set(incoming.map((event) => event.id));
      setEvents(sortEvents(incoming));
      return;
    }

    if (fresh.length === 0) return;

    fresh.forEach((event) => seenRef.current.add(event.id));
    setEvents((current) => sortEvents([...fresh, ...current]));
  }, []);

  const pushBidEvent = useCallback((bid: PlacedBid) => {
    const event = toParsedBidEvent(bid);
    seenRef.current.add(event.id);
    setEvents((current) => sortEvents([event, ...current.filter((entry) => entry.id !== event.id)]));
  }, []);

  const refreshEvents = useCallback(async () => {
    try {
      await syncFromRpc(true);
    } catch {
      // Retry once RPC indexes the event.
    }
    window.setTimeout(() => {
      void syncFromRpc(true).catch(() => undefined);
    }, 2000);
  }, [syncFromRpc]);

  const reconnect = useCallback(async () => {
    setSyncError(null);
    try {
      await syncFromRpc(true);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Live updates paused.");
    }
  }, [syncFromRpc]);

  useEffect(() => {
    const onVisibility = () => {
      const isVisible = !document.hidden;
      setVisible(isVisible);
      if (isVisible) {
        void pollRef.current?.();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!auctionId || !active) return undefined;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        await syncFromRpc(false);
        setSyncError(null);
      } catch (err) {
        setSyncError(err instanceof Error ? err.message : "Live updates paused.");
      }
    };

    pollRef.current = poll;

    const tick = async () => {
      await poll();
      if (!cancelled) {
        timer = setTimeout(() => {
          void tick();
        }, EVENT_FETCH_INTERVAL_MS);
      }
    };

    void syncFromRpc(true)
      .catch((err) => {
        setSyncError(err instanceof Error ? err.message : "Live updates paused.");
      })
      .finally(() => {
        if (!cancelled) void tick();
      });

    return () => {
      cancelled = true;
      pollRef.current = null;
      if (timer) clearTimeout(timer);
    };
  }, [auctionId, active, syncFromRpc]);

  useEffect(() => {
    seenRef.current = new Set();
    setEvents([]);
    setSyncError(null);
  }, [auctionId]);

  return { events, live: active, syncError, pushBidEvent, refreshEvents, reconnect };
}
