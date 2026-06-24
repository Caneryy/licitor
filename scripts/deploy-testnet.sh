#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

NETWORK="${STELLAR_NETWORK:-testnet}"
SOURCE="${STELLAR_SOURCE:-}"
TOKEN_ID="${TOKEN_CONTRACT_ID:-}"
# Circle testnet USDC issuer — used to resolve the SAC contract id when TOKEN_CONTRACT_ID is unset.
USDC_ASSET="USDC:GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5"

if [[ -z "$SOURCE" ]]; then
  echo "Set STELLAR_SOURCE to a funded testnet identity (stellar keys address)." >&2
  exit 1
fi

echo "Building contracts..."
CARGO_TARGET_DIR=./target stellar contract build

ESCROW_WASM="target/wasm32v1-none/release/escrow.wasm"
AUCTION_WASM="target/wasm32v1-none/release/auction.wasm"

if [[ ! -f "$ESCROW_WASM" ]] || [[ ! -f "$AUCTION_WASM" ]]; then
  echo "WASM artifacts not found after build." >&2
  exit 1
fi

if [[ -z "$TOKEN_ID" ]]; then
  echo "TOKEN_CONTRACT_ID not set. Resolving testnet USDC SAC for $USDC_ASSET ..."
  TOKEN_ID=$(stellar contract id asset --asset "$USDC_ASSET" --network "$NETWORK")
  echo "Resolved token SAC: $TOKEN_ID"
fi

echo "Deploying escrow (admin=$SOURCE, token=$TOKEN_ID)..."
ESCROW_ID=$(stellar contract deploy \
  --source-account "$SOURCE" \
  --network "$NETWORK" \
  --wasm "$ESCROW_WASM" \
  -- \
  --admin "$SOURCE" \
  --token_contract "$TOKEN_ID")

echo "Deploying auction (escrow=$ESCROW_ID)..."
AUCTION_ID=$(stellar contract deploy \
  --source-account "$SOURCE" \
  --network "$NETWORK" \
  --wasm "$AUCTION_WASM" \
  -- \
  --escrow_address "$ESCROW_ID")

echo "Linking escrow to auction..."
stellar contract invoke \
  --source-account "$SOURCE" \
  --network "$NETWORK" \
  --id "$ESCROW_ID" \
  -- \
  set_auction_contract \
  --admin "$SOURCE" \
  --auction "$AUCTION_ID"

mkdir -p deployments
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
cat > deployments/testnet.json <<EOF
{
  "network": "$NETWORK",
  "deployedAt": "$TIMESTAMP",
  "tokenContractId": "$TOKEN_ID",
  "escrowContractId": "$ESCROW_ID",
  "auctionContractId": "$AUCTION_ID",
  "legacyContractId": "CBKLZBSTFM5YQ27LRDHDA4VTEY4CDCWVSHKOYWZN2X7AIKBKVRRPFGBQ"
}
EOF

echo ""
echo "Deployment complete:"
echo "  Token SAC:  $TOKEN_ID"
echo "  Escrow:     $ESCROW_ID"
echo "  Auction:    $AUCTION_ID"
echo ""
echo "Frontend .env:"
echo "  VITE_AUCTION_CONTRACT_ID=$AUCTION_ID"
echo "  VITE_ESCROW_CONTRACT_ID=$ESCROW_ID"
echo "  VITE_TOKEN_CONTRACT_ID=$TOKEN_ID"
echo "  VITE_CONTRACT_ID=$AUCTION_ID"
echo "  VITE_STELLAR_NETWORK=testnet"
