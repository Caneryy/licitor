import * as StellarSdk from "@stellar/stellar-sdk";
import { simulateRead } from "./contract";
import { getContractId } from "./stellar";
import type { Auction, AuctionStatus, BidEntry } from "./types";

const PUBLIC_ADDRESS = "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF";

function scvToAuction(id: number, value: StellarSdk.xdr.ScVal): Auction {
  const raw = StellarSdk.scValToNative(value) as {
    seller: string;
    title: string;
    starting_bid: bigint | number;
    highest_bid: bigint | number;
    highest_bidder: string | null;
    end_time: bigint | number;
    status: AuctionStatus;
  };

  return {
    id,
    seller: raw.seller,
    title: raw.title,
    startingBid: BigInt(raw.starting_bid),
    highestBid: BigInt(raw.highest_bid),
    highestBidder: raw.highest_bidder,
    endTime: Number(raw.end_time),
    status: raw.status,
  };
}

function scvToBidEntries(value: StellarSdk.xdr.ScVal | undefined): BidEntry[] {
  if (!value) return [];
  const entries = StellarSdk.scValToNative(value) as Array<{
    bidder: string;
    amount: bigint | number;
    timestamp: bigint | number;
    ledger: number;
  }>;

  return entries.map((entry) => ({
    bidder: entry.bidder,
    amount: BigInt(entry.amount),
    timestamp: Number(entry.timestamp),
    ledger: entry.ledger,
  }));
}

export async function readAuctionCount(reader = PUBLIC_ADDRESS): Promise<number> {
  const contractId = getContractId();
  return simulateRead(
    reader,
    contractId,
    "get_auction_count",
    [],
    (value) => Number(StellarSdk.scValToNative(value ?? StellarSdk.xdr.ScVal.scvU32(0))),
  );
}

export async function readAuction(auctionId: number, reader = PUBLIC_ADDRESS): Promise<Auction> {
  const contractId = getContractId();
  const auction = await simulateRead(
    reader,
    contractId,
    "get_auction",
    [StellarSdk.nativeToScVal(auctionId, { type: "u32" })],
    (value) => scvToAuction(auctionId, value!),
  );
  return auction;
}

export async function readRecentBids(auctionId: number, reader = PUBLIC_ADDRESS): Promise<BidEntry[]> {
  const contractId = getContractId();
  return simulateRead(
    reader,
    contractId,
    "get_recent_bids",
    [StellarSdk.nativeToScVal(auctionId, { type: "u32" })],
    scvToBidEntries,
  );
}

export async function readAllAuctions(reader = PUBLIC_ADDRESS): Promise<Auction[]> {
  const count = await readAuctionCount(reader);
  const auctions: Auction[] = [];
  for (let id = 1; id <= count; id += 1) {
    try {
      auctions.push(await readAuction(id, reader));
    } catch {
      // Skip missing auctions if count desyncs temporarily.
    }
  }
  return auctions.reverse();
}

export function buildCreateAuctionArgs(
  seller: string,
  title: string,
  startingBid: bigint,
  durationSecs: number,
): StellarSdk.xdr.ScVal[] {
  return [
    StellarSdk.Address.fromString(seller).toScVal(),
    StellarSdk.nativeToScVal(title, { type: "string" }),
    StellarSdk.nativeToScVal(startingBid, { type: "i128" }),
    StellarSdk.nativeToScVal(durationSecs, { type: "u64" }),
  ];
}

export function buildPlaceBidArgs(
  bidder: string,
  auctionId: number,
  amount: bigint,
): StellarSdk.xdr.ScVal[] {
  return [
    StellarSdk.Address.fromString(bidder).toScVal(),
    StellarSdk.nativeToScVal(auctionId, { type: "u32" }),
    StellarSdk.nativeToScVal(amount, { type: "i128" }),
  ];
}

export function buildFinalizeArgs(caller: string, auctionId: number): StellarSdk.xdr.ScVal[] {
  return [
    StellarSdk.Address.fromString(caller).toScVal(),
    StellarSdk.nativeToScVal(auctionId, { type: "u32" }),
  ];
}

export function parseCreateAuctionResult(returnValue?: StellarSdk.xdr.ScVal): number {
  return Number(StellarSdk.scValToNative(returnValue ?? StellarSdk.xdr.ScVal.scvU32(0)));
}
