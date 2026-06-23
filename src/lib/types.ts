export type AuctionStatus = "Active" | "Ended";

export interface Auction {
  id: number;
  seller: string;
  title: string;
  startingBid: bigint;
  highestBid: bigint;
  highestBidder: string | null;
  endTime: number;
  status: AuctionStatus;
}

export interface BidEntry {
  bidder: string;
  amount: bigint;
  timestamp: number;
  ledger: number;
  txHash?: string;
}

export interface PlacedBid {
  auctionId: number;
  bidder: string;
  amount: bigint;
  txHash: string;
  ledger?: number;
}

export interface ParsedBidEvent {
  id: string;
  auctionId: number;
  bidder: string;
  amount: bigint;
  ledger: number;
  txHash: string;
}

export type TxPhase =
  | "idle"
  | "signing"
  | "submitting"
  | "confirming"
  | "success"
  | "error";

export type AppView = "home" | "auctions" | "create" | "detail";
