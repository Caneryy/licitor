import { useEffect, useRef, useState } from "react";
import { fetchBidEvents } from "../lib/events";
import { EVENT_FETCH_INTERVAL_MS, getContractId } from "../lib/stellar";
import type { ParsedBidEvent } from "../lib/types";

export function useAuctionEvents(auctionId: number | null, enabled: boolean) {
  const [events, setEvents] = useState<ParsedBidEvent[]>([]);
  const [visible, setVisible] = useState(
    typeof document === "undefined" ? true : !document.hidden,
  );
  const cursorRef = useRef<number | null>(null);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const active = enabled && visible;

  useEffect(() => {
    if (!auctionId || !active) return undefined;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const contractId = getContractId();
        if (cursorRef.current === null) {
          const initial = await fetchBidEvents(contractId, auctionId, 1);
          cursorRef.current = initial.latestLedger + 1;

          const seeded = initial.events.filter((event) => !seenRef.current.has(event.id));
          if (seeded.length > 0) {
            seeded.forEach((event) => seenRef.current.add(event.id));
            setEvents(seeded.slice(-20).reverse());
          }
        } else {
          const { events: incoming, latestLedger } = await fetchBidEvents(
            contractId,
            auctionId,
            cursorRef.current,
          );

          cursorRef.current = latestLedger + 1;

          const fresh = incoming.filter((event) => !seenRef.current.has(event.id));
          if (fresh.length > 0) {
            fresh.forEach((event) => seenRef.current.add(event.id));
            setEvents((current) => [...fresh, ...current].slice(0, 20));
          }
        }
      } catch {
        // Ignore transient RPC errors during background sync.
      }

      if (!cancelled) {
        timer = setTimeout(() => {
          void poll();
        }, EVENT_FETCH_INTERVAL_MS);
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [auctionId, active]);

  useEffect(() => {
    seenRef.current = new Set();
    setEvents([]);
    cursorRef.current = null;
  }, [auctionId]);

  return { events, live: active };
}
