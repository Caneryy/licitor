# Licitor Demo Script (5 minutes)

## Setup

- Two browsers (or normal + incognito)
- Two testnet wallets with XLM (fees) and testnet USDC
- App URL: production or `npm run dev`
- Env points to escrow-enabled auction contract

## 1. Intro (30s)

> Licitor is a production-ready Stellar auction dApp. Bids lock real testnet USDC in an escrow contract. When someone outbids you, your funds are refunded on-chain.

## 2. Browse auctions (30s)

1. Open `/auctions`
2. Point out **Escrow** badge and live sync indicator
3. Open an active auction

## 3. Live bidding — two browsers (2 min)

1. **Browser A:** Open auction detail — note highest bid
2. **Browser B:** Connect wallet B, place bid (approve USDC transfer in wallet)
3. **Browser A:** Within ~2s, bid history and highest bid update via `getEvents` polling
4. **Browser B:** Place higher bid from wallet A (if available) — show refund in wallet balance

## 4. Transaction phases (30s)

Show CTA button states: Confirm in wallet → Submitting → Confirming → Success with explorer link.

## 5. Finalize (1 min)

1. Wait for auction end (or use short-duration test auction)
2. Seller wallet clicks **Finalize auction**
3. Show seller USDC balance increased; auction status **Ended**

## 6. Engineering highlights (30s)

- Two Soroban contracts (auction + escrow CPI)
- GitHub Actions CI: contract tests + frontend tests
- Ledger cursor event streaming (no WebSocket)
- Multi-wallet: Freighter, xBull, Lobstr

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Bid fails simulation | Add USDC trustline; fund USDC on testnet |
| Live updates stuck | Click **Reconnect**; check RPC |
| Finalize rejected | Only seller can finalize after end time |
