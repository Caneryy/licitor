# Licitor — Real-time Auction

Stellar testnet live bidding dApp built with Soroban, StellarWalletsKit, and cursor-based `getEvents` synchronization.

## Features

- Multi-wallet support: Freighter, xBull, Lobstr
- Soroban auction contract with on-chain bid history and contract events
- Real-time detail page updates via scoped event listener (`bid_placed`)
- Transaction status tracking in CTA buttons (signing → submitting → confirming)
- Neo-brutalist Lumen UI (responsive)

## Prerequisites

- Node.js 20+
- Rust + Stellar CLI
- A funded testnet wallet

## Setup

```bash
npm install
cp .env.example .env
```

Set `VITE_CONTRACT_ID` after deploying the contract.

## Contract

```bash
CARGO_TARGET_DIR=./target stellar contract build
cargo test -p auction
stellar contract deploy \
  --source-account <your-identity> \
  --network testnet \
  --wasm target/wasm32v1-none/release/auction.wasm
```

Deployed testnet contract for this repo:

`CBKLZBSTFM5YQ27LRDHDA4VTEY4CDCWVSHKOYWZN2X7AIKBKVRRPFGBQ`

## Development

```bash
npm run dev
```

## Demo: live bidding across browsers

1. Open the same auction detail page in Browser A and Browser B
2. Browser B places a bid
3. Browser A updates automatically within ~5 seconds via `getEvents`
4. Bidder sees immediate post-tx refresh on their own browser

## Architecture notes

Soroban RPC does not provide browser push/WebSocket for contract events. Licitor uses Stellar's recommended pattern: contract emits events on-chain, and open detail pages poll `getEvents` with a ledger cursor while the tab is visible.

## Error handling

Wallet: not found, rejected, insufficient fee balance, wrong network

Contract: auction state errors mapped from simulation

Transaction: submission, timeout, restore-required, account not funded
