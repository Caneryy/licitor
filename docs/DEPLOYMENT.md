# Licitor Deployment

## Prerequisites

- Node.js 20+
- Rust + `stellar` CLI (`cargo install stellar-cli`)
- Funded testnet identity

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_AUCTION_CONTRACT_ID` | Deployed auction contract |
| `VITE_ESCROW_CONTRACT_ID` | Deployed escrow contract |
| `VITE_TOKEN_CONTRACT_ID` | Testnet USDC SAC (optional; default in code) |
| `VITE_CONTRACT_ID` | Alias for auction ID (backward compatible) |
| `VITE_STELLAR_NETWORK` | `testnet` |

## Local contract workflow

```bash
make test-contracts
make build-contracts
```

## Testnet deploy

```bash
export STELLAR_SOURCE=<your-stellar-identity>
export TOKEN_CONTRACT_ID=CCW67TSZV3SSFYW5YT6L4GQIETBZNMXRJZKCZBU6O6MYPAAJMR7WAS6  # optional
./scripts/deploy-testnet.sh
```

Output: `deployments/testnet.json` + `.env` values to copy.

## Integration smoke test

After deploy:

```bash
export STELLAR_SOURCE=<identity>
./scripts/integration-test.sh
```

## Vercel frontend

1. Import repo at [vercel.com/new](https://vercel.com/new)
2. Set env vars from deploy output
3. Deploy — `vercel.json` handles SPA rewrites

## CI/CD

- **CI** (`.github/workflows/ci.yml`) — runs on every PR: contract tests, lint, typecheck, vitest, build
- **Deploy contracts** (`.github/workflows/deploy-contract.yml`) — manual `workflow_dispatch`, requires `STELLAR_DEPLOYER_SECRET` GitHub secret

## Mainnet checklist

Before mainnet:

- [ ] All contract tests green
- [ ] Integration test on testnet copy
- [ ] Auth paths reviewed (seller finalize, escrow CPI)
- [ ] Admin keys in hardware wallet (not CI)
- [ ] Document upgrade vs immutable decision
- [ ] Third-party audit if holding real funds

See Stellar deploy-stellar-mainnet skill for full gates.
