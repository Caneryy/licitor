import * as StellarSdk from "@stellar/stellar-sdk";

const NETWORK = import.meta.env.VITE_STELLAR_NETWORK || "testnet";

const configs = {
  testnet: {
    horizonUrl: "https://horizon-testnet.stellar.org",
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: StellarSdk.Networks.TESTNET,
    friendbotUrl: "https://friendbot.stellar.org",
    usdcIssuer: "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5",
    usdcAssetCode: "USDC",
  },
} as const;

export const config = configs[NETWORK as keyof typeof configs] ?? configs.testnet;

export const rpc = new StellarSdk.rpc.Server(config.rpcUrl);
export const horizon = new StellarSdk.Horizon.Server(config.horizonUrl);

export const TOKEN_SYMBOL = "USDC";
export const EVENT_FETCH_INTERVAL_MS = 2000;
export const DETAIL_POLL_INTERVAL_MS = 2000;
export const MIN_FEE_XLM = 0.5;
export const EVENT_LEDGER_FALLBACK = 500;

/** Default testnet USDC SAC when VITE_TOKEN_CONTRACT_ID is unset. */
export const DEFAULT_TESTNET_USDC_SAC =
  "CCW67TSZV3SSFYW5YT6L4GQIETBZNMXRJZKCZBU6O6MYPAAJMR7WAS6";

function requireEnv(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

export function getAuctionContractId(): string {
  return requireEnv(
    "VITE_AUCTION_CONTRACT_ID",
    import.meta.env.VITE_AUCTION_CONTRACT_ID ?? import.meta.env.VITE_CONTRACT_ID,
  );
}

export function getEscrowContractId(): string | null {
  return import.meta.env.VITE_ESCROW_CONTRACT_ID ?? null;
}

export function getTokenContractId(): string {
  return import.meta.env.VITE_TOKEN_CONTRACT_ID ?? DEFAULT_TESTNET_USDC_SAC;
}

/** @deprecated Use getAuctionContractId */
export function getContractId(): string {
  return getAuctionContractId();
}
