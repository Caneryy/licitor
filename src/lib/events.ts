import * as StellarSdk from "@stellar/stellar-sdk";
import {
  computeEventStartLedger,
  getStoredEventCursor,
  setStoredEventCursor,
} from "./eventCursor";
import { EVENT_LEDGER_FALLBACK, rpc } from "./stellar";
import type { ParsedBidEvent } from "./types";

function encodeSymbolTopic(symbol: string): string {
  return StellarSdk.xdr.ScVal.scvSymbol(symbol).toXDR("base64");
}

function normalizeEventValue(value: unknown): unknown {
  if (typeof value === "string") {
    return StellarSdk.scValToNative(StellarSdk.xdr.ScVal.fromXDR(value, "base64"));
  }
  if (value && typeof value === "object" && "_switch" in value) {
    return StellarSdk.scValToNative(value as unknown as StellarSdk.xdr.ScVal);
  }
  return value;
}

function parseBidEventValue(value: unknown): {
  auction_id: number;
  bidder: string;
  amount: bigint | number;
  ledger: number;
} | null {
  const normalized = normalizeEventValue(value);
  if (!normalized || typeof normalized !== "object") return null;

  const record = normalized as Record<string, unknown>;
  if (!("auction_id" in record) || !("bidder" in record) || !("amount" in record)) {
    return null;
  }

  return {
    auction_id: Number(record.auction_id),
    bidder: String(record.bidder),
    amount: BigInt(record.amount as string | number | bigint),
    ledger: Number(record.ledger ?? 0),
  };
}

function parseAuctionIdEvent(value: unknown): number | null {
  const normalized = normalizeEventValue(value);
  if (!normalized || typeof normalized !== "object") return null;
  const record = normalized as Record<string, unknown>;
  if (!("auction_id" in record)) return null;
  return Number(record.auction_id);
}

async function fetchContractEvents(
  contractId: string,
  topic: string,
): Promise<StellarSdk.rpc.Api.GetEventsResponse["events"]> {
  const latest = await rpc.getLatestLedger();
  const endLedger = latest.sequence;
  const startLedger = computeEventStartLedger(
    getStoredEventCursor(),
    endLedger,
    EVENT_LEDGER_FALLBACK,
  );

  const response = await rpc.getEvents({
    startLedger,
    endLedger,
    filters: [
      {
        type: "contract",
        contractIds: [contractId],
        topics: [[encodeSymbolTopic(topic)]],
      },
    ],
  });

  if (response.events.length > 0) {
    const maxLedger = response.events.reduce(
      (max, event) => Math.max(max, event.ledger),
      startLedger,
    );
    setStoredEventCursor(maxLedger);
  }

  return response.events;
}

export async function fetchBidEvents(
  contractId: string,
  auctionId: number,
): Promise<ParsedBidEvent[]> {
  const events = await fetchContractEvents(contractId, "bid_placed");
  const parsed: ParsedBidEvent[] = [];

  for (const event of events) {
    const body = parseBidEventValue(event.value);
    if (!body || body.auction_id !== auctionId) continue;

    parsed.push({
      id: `${event.txHash}:${body.bidder}:${body.amount.toString()}`,
      auctionId: body.auction_id,
      bidder: body.bidder,
      amount: BigInt(body.amount),
      ledger: body.ledger || event.ledger,
      txHash: event.txHash,
    });
  }

  return parsed;
}

export async function fetchAuctionCreatedIds(contractId: string): Promise<number[]> {
  const events = await fetchContractEvents(contractId, "auction_created");
  const ids: number[] = [];
  for (const event of events) {
    const id = parseAuctionIdEvent(event.value);
    if (id !== null) ids.push(id);
  }
  return ids;
}

export async function fetchAuctionFinalizedIds(contractId: string): Promise<number[]> {
  const events = await fetchContractEvents(contractId, "auction_finalized");
  const ids: number[] = [];
  for (const event of events) {
    const id = parseAuctionIdEvent(event.value);
    if (id !== null) ids.push(id);
  }
  return ids;
}
