import { useCallback, useEffect } from "react";
import { SYNC_CHANNEL_NAME } from "../lib/stellar";

export function useAuctionSync(onSync: () => void, enabled = true) {
  const notify = useCallback(
    (auctionId?: number) => {
      onSync();
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channel.postMessage({ type: "auction-updated", auctionId });
        channel.close();
      }
    },
    [onSync],
  );

  useEffect(() => {
    if (!enabled) return undefined;

    const handleVisibility = () => {
      if (!document.hidden) {
        onSync();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    let channel: BroadcastChannel | undefined;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.onmessage = () => onSync();
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      channel?.close();
    };
  }, [enabled, onSync]);

  return { notify };
}
