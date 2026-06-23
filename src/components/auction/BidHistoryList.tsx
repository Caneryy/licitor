import type { BidEntry } from "../../lib/types";
import { bidKey } from "../../lib/bids";
import { formatDateTime, stroopsToXlm, truncateMiddle } from "../../lib/format";
import { getExplorerTxUrl } from "../../lib/explorer";
import { useNewBidKeys } from "../../hooks/useNewBidKeys";
import { Badge } from "../ui/Badge";

interface BidHistoryListProps {
  auctionId: number;
  bids: BidEntry[];
  live?: boolean;
}

export function BidHistoryList({ auctionId, bids, live = false }: BidHistoryListProps) {
  const { highlightedKeys, latestBid } = useNewBidKeys(auctionId, bids);

  return (
    <section className="neo-card p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-black">Bid History</h3>
        {live ? <Badge live>Live</Badge> : <Badge>Paused</Badge>}
      </div>

      {latestBid && (
        <div className="bid-toast mb-4" role="status" aria-live="polite">
          <span className="bid-toast-label">New bid</span>
          <strong>{stroopsToXlm(latestBid.amount)} XLM</strong>
          <span className="text-xs">from {truncateMiddle(latestBid.bidder, 8, 6)}</span>
        </div>
      )}

      {bids.length === 0 ? (
        <div className="rounded-none border-2 border-dashed border-[var(--border)] bg-[var(--paper)] p-6 text-center">
          <p className="text-2xl" aria-hidden="true">
            ◇
          </p>
          <p className="mt-2 font-bold">No bids yet</p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            Be the first to place a bid on this auction.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {bids.map((bid) => {
            const key = bidKey(bid);
            const isNew = highlightedKeys.has(key);

            return (
              <li
                key={key}
                className={`border-2 border-[var(--border)] bg-[var(--paper)] p-3 text-sm ${isNew ? "bid-item-new" : ""}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong>{truncateMiddle(bid.bidder, 8, 6)}</strong>
                    {isNew && <span className="bid-new-badge">NEW</span>}
                  </div>
                  <span className={isNew ? "bid-amount-pop font-black" : "font-bold"}>
                    {stroopsToXlm(bid.amount)} XLM
                  </span>
                </div>
                <p className="mt-1 text-xs text-[var(--ink-muted)]">{formatDateTime(bid.timestamp)}</p>
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
            );
          })}
        </ul>
      )}
    </section>
  );
}
