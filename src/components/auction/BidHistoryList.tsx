import type { BidEntry } from "../../lib/types";
import { formatDateTime, stroopsToXlm, truncateMiddle } from "../../lib/format";
import { getExplorerTxUrl } from "../../lib/explorer";
import { Badge } from "../ui/Badge";

interface BidHistoryListProps {
  bids: BidEntry[];
  live?: boolean;
}

export function BidHistoryList({ bids, live = false }: BidHistoryListProps) {
  return (
    <section className="neo-card p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-xl font-black">Bid History</h3>
        {live ? <Badge live>Live</Badge> : <Badge>Paused</Badge>}
      </div>

      {bids.length === 0 ? (
        <p className="text-sm text-neutral-700">No bids yet.</p>
      ) : (
        <ul className="space-y-3">
          {bids.map((bid, index) => (
            <li
              key={`${bid.bidder}-${bid.timestamp}-${index}`}
              className="border-2 border-[var(--border)] bg-[var(--paper)] p-3 text-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{truncateMiddle(bid.bidder, 8, 6)}</strong>
                <span>{stroopsToXlm(bid.amount)} XLM</span>
              </div>
              <p className="mt-1 text-xs text-neutral-700">{formatDateTime(bid.timestamp)}</p>
              {bid.txHash && (
                <a
                  href={getExplorerTxUrl(bid.txHash)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs font-bold underline"
                >
                  View tx
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
