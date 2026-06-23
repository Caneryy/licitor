import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc } from "./stellar";
import type { ParsedBidEvent } from "./types";

const POLL_LEDGER_LOOKBACK = 500;

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

function parseEventValue(value: unknown): {
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

export async function fetchBidEvents(
  contractId: string,
  auctionId: number,
): Promise<ParsedBidEvent[]> {
  const latest = await rpc.getLatestLedger();
  const endLedger = latest.sequence;
  const startLedger = Math.max(1, endLedger - POLL_LEDGER_LOOKBACK);

  const response = await rpc.getEvents({
    startLedger,
    endLedger,
    filters: [
      {
        type: "contract",
        contractIds: [contractId],
        topics: [[encodeSymbolTopic("bid_placed")]],
      },
    ],
  });

  const events: ParsedBidEvent[] = [];

  for (const event of response.events) {
    const body = parseEventValue(event.value);
    if (!body || body.auction_id !== auctionId) continue;

    events.push({
      id: `${event.txHash}:${body.bidder}:${body.amount.toString()}`,
      auctionId: body.auction_id,
      bidder: body.bidder,
      amount: BigInt(body.amount),
      ledger: body.ledger || event.ledger,
      txHash: event.txHash,
    });
  }

  return events;
}
