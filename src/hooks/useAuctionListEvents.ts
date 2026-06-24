import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAuctionCreatedIds, fetchAuctionFinalizedIds } from "../lib/events";
import { EVENT_FETCH_INTERVAL_MS, getAuctionContractId } from "../lib/stellar";

export function useAuctionListEvents(enabled: boolean, onRefresh: () => void) {
  const [syncError, setSyncError] = useState<string | null>(null);
  const [visible, setVisible] = useState(
    typeof document === "undefined" ? true : !document.hidden,
  );
  const seenCreatedRef = useRef<Set<number>>(new Set());
  const seenFinalizedRef = useRef<Set<number>>(new Set());
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const active = enabled && visible;

  const poll = useCallback(async () => {
    const contractId = getAuctionContractId();
    const [created, finalized] = await Promise.all([
      fetchAuctionCreatedIds(contractId),
      fetchAuctionFinalizedIds(contractId),
    ]);

    let hasNew = false;
    for (const id of created) {
      if (!seenCreatedRef.current.has(id)) {
        seenCreatedRef.current.add(id);
        hasNew = true;
      }
    }
    for (const id of finalized) {
      if (!seenFinalizedRef.current.has(id)) {
        seenFinalizedRef.current.add(id);
        hasNew = true;
      }
    }

    if (hasNew) {
      onRefreshRef.current();
    }
    setSyncError(null);
  }, []);

  const reconnect = useCallback(async () => {
    try {
      await poll();
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Live updates paused.");
    }
  }, [poll]);

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!active) return undefined;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      try {
        await poll();
      } catch (err) {
        setSyncError(err instanceof Error ? err.message : "Live updates paused.");
      }
      if (!cancelled) {
        timer = setTimeout(() => {
          void tick();
        }, EVENT_FETCH_INTERVAL_MS);
      }
    };

    void tick();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [active, poll]);

  return { syncError, reconnect, live: active };
}
