# Licitor - Real-time Auction

[![CI](https://github.com/Caneryy/licitor/actions/workflows/ci.yml/badge.svg?branch=main&event=push)](https://github.com/Caneryy/licitor/actions/workflows/ci.yml)
[![Deploy Contracts (Testnet)](https://github.com/Caneryy/licitor/actions/workflows/deploy-contract.yml/badge.svg)](https://github.com/Caneryy/licitor/actions/workflows/deploy-contract.yml)

Stellar testnet live bidding dApp with **escrow-backed USDC bids**, Soroban inter-contract calls, cursor-based `getEvents` sync, and production CI/CD.

**Production:** [https://licitor-psi.vercel.app](https://licitor-psi.vercel.app)

## Features

- **Escrow + SAC payments** — bids lock testnet USDC; outbid users refunded on-chain
- **Two Soroban contracts** — auction orchestration + escrow custody (CPI)
- Multi-wallet support: Freighter, xBull, Lobstr
- Real-time updates via scoped event polling (`bid_placed`, `auction_created`, `auction_finalized`)
- Transaction status tracking (signing → submitting → confirming)
- GitHub Actions CI: contract tests, lint, typecheck, vitest, build
- Manual testnet contract deploy workflow
- Neo-brutalist responsive UI

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for contract APIs, event flow, and security decisions.

## Demo

Follow [docs/DEMO.md](docs/DEMO.md) for a 5-minute live presentation script.

## Prerequisites

- Node.js 20+
- Rust + Stellar CLI
- Funded testnet wallet (XLM for fees + USDC for bids)

## Setup

```bash
npm install
cp .env.example .env
```

After deploying contracts (see below), set:

```
VITE_AUCTION_CONTRACT_ID=<auction_id>
VITE_ESCROW_CONTRACT_ID=<escrow_id>
VITE_TOKEN_CONTRACT_ID=<usdc_sac_id>
VITE_CONTRACT_ID=<auction_id>
VITE_STELLAR_NETWORK=testnet
```

## Contracts

```bash
make test-contracts
make build-contracts
```

### Deploy to testnet

```bash
export STELLAR_SOURCE=<your-identity>
./scripts/deploy-testnet.sh
```

Writes `deployments/testnet.json`. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

### Legacy contract (pre-escrow)

`CBKLZBSTFM5YQ27LRDHDA4VTEY4CDCWVSHKOYWZN2X7AIKBKVRRPFGBQ` — [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CBKLZBSTFM5YQ27LRDHDA4VTEY4CDCWVSHKOYWZN2X7AIKBKVRRPFGBQ)

New escrow-enabled deploy replaces this for live bidding.

## Development

```bash
npm run dev
npm run test
npm run typecheck
npm run lint
npm run build
```

## Deploy to Vercel

SPA routes need fallback to `index.html` (`vercel.json`).

1. Import repo at [vercel.com/new](https://vercel.com/new)
2. Set `VITE_*` env vars from `deployments/testnet.json`
3. Deploy

## Live bidding across browsers

1. Open the same auction detail in Browser A and B
2. Browser B places a USDC bid
3. Browser A updates within ~2s via `getEvents` + ledger cursor
4. Bidder sees immediate post-tx refresh locally

## Error handling

- Wallet: not found, rejected, insufficient fee balance, wrong network
- Token: USDC trustline, insufficient USDC for bid
- Contract: auction state errors (#1–#9) mapped from simulation
- Transaction: submission, timeout, restore-required
- UI: Error boundary, retry on list/detail, reconnect for live sync

## Submission checklist

- [x] Multi-wallet dApp on testnet
- [x] Advanced contracts with inter-contract communication (auction ↔ escrow ↔ SAC)
- [x] Event streaming with ledger cursor
- [x] CI/CD pipeline
- [x] Contract + frontend tests
- [x] Deployment scripts + documentation
- [ ] Deploy new escrow contracts and update Vercel env (run `./scripts/deploy-testnet.sh`)
