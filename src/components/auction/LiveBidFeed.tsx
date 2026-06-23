import type { ParsedBidEvent } from "../../lib/types";
import { stroopsToXlm, truncateMiddle } from "../../lib/format";
import { getExplorerTxUrl } from "../../lib/explorer";
import { Badge } from "../ui/Badge";

interface LiveBidFeedProps {
  events: ParsedBidEvent[];
  live: boolean;
}

export function LiveBidFeed({ events, live }: LiveBidFeedProps) {
  return (
    <section className="neo-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-black">Live Bids</h3>
        {live ? <Badge live>Live</Badge> : <Badge>Paused</Badge>}
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-neutral-700">Waiting for bids…</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li key={event.id} className="border-2 border-[var(--border)] bg-[var(--paper)] p-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{truncateMiddle(event.bidder, 8, 6)}</strong>
                <span>{stroopsToXlm(event.amount)} XLM</span>
              </div>
              <a
                href={getExplorerTxUrl(event.txHash)}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-xs font-bold underline"
              >
                View tx
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
