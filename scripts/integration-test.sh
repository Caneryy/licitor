#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ ! -f deployments/testnet.json ]]; then
  echo "Run scripts/deploy-testnet.sh first." >&2
  exit 1
fi

AUCTION_ID=$(node -e "console.log(JSON.parse(require('fs').readFileSync('deployments/testnet.json','utf8')).auctionContractId)")
SOURCE="${STELLAR_SOURCE:?Set STELLAR_SOURCE}"
NETWORK="${STELLAR_NETWORK:-testnet}"

echo "Integration smoke: create auction on $AUCTION_ID"

stellar contract invoke \
  --source-account "$SOURCE" \
  --network "$NETWORK" \
  --id "$AUCTION_ID" \
  -- \
  create_auction \
  --seller "$SOURCE" \
  --title '"CI Smoke Auction"' \
  --starting_bid 1000000 \
  --duration_secs 3600

COUNT=$(stellar contract invoke \
  --network "$NETWORK" \
  --id "$AUCTION_ID" \
  -- \
  get_auction_count)

echo "Auction count: $COUNT"
echo "Integration smoke passed."
