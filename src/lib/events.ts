import * as StellarSdk from "@stellar/stellar-sdk";
import { rpc } from "./stellar";
import type { ParsedBidEvent } from "./types";

function parseEventValue(value: unknown): {
  auction_id: number;
  bidder: string;
  amount: bigint | number;
  ledger: number;
} | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
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
  startLedger: number,
): Promise<{ events: ParsedBidEvent[]; latestLedger: number }> {
  const latest = await rpc.getLatestLedger();
  const response = await rpc.getEvents({
    startLedger,
    endLedger: latest.sequence,
    filters: [
      {
        type: "contract",
        contractIds: [contractId],
        topics: [["bid_placed"]],
      },
    ],
  });

  const events: ParsedBidEvent[] = [];

  for (const event of response.events) {
    let parsedValue: unknown = event.value;
    if (typeof event.value === "string") {
      try {
        parsedValue = StellarSdk.scValToNative(
          StellarSdk.xdr.ScVal.fromXDR(event.value, "base64"),
        );
      } catch {
        parsedValue = event.value;
      }
    }

    const body = parseEventValue(parsedValue);
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

  return {
    events,
    latestLedger: response.latestLedger ?? latest.sequence,
  };
}
