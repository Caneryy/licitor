import type { Auction } from "./types";
import { formatCountdown } from "./format";

export type AuctionPhase = "live" | "expired" | "finalized";

export function getAuctionPhase(
  auction: Auction,
  now = Math.floor(Date.now() / 1000),
): AuctionPhase {
  if (auction.status === "Ended") return "finalized";
  if (now >= auction.endTime) return "expired";
  return "live";
}

export function getAuctionBadgeLabel(phase: AuctionPhase): string {
  switch (phase) {
    case "live":
      return "Active";
    case "expired":
      return "Bidding closed";
    case "finalized":
      return "Ended";
  }
}

export function getAuctionTimingLabel(
  auction: Auction,
  now = Math.floor(Date.now() / 1000),
): string {
  const phase = getAuctionPhase(auction, now);
  if (phase === "finalized") return "Finalized";
  if (phase === "expired") return "Awaiting finalize";
  return formatCountdown(auction.endTime, now);
}

export function getAuctionTimingCaption(phase: AuctionPhase): string {
  return phase === "live" ? "Ends in" : "Status";
}

export function isBiddingOpen(
  auction: Auction,
  now = Math.floor(Date.now() / 1000),
): boolean {
  return getAuctionPhase(auction, now) === "live";
}
