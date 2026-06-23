import * as StellarSdk from "@stellar/stellar-sdk";

const NETWORK = import.meta.env.VITE_STELLAR_NETWORK || "testnet";

const configs = {
  testnet: {
    horizonUrl: "https://horizon-testnet.stellar.org",
    rpcUrl: "https://soroban-testnet.stellar.org",
    networkPassphrase: StellarSdk.Networks.TESTNET,
    friendbotUrl: "https://friendbot.stellar.org",
  },
} as const;

export const config = configs[NETWORK as keyof typeof configs] ?? configs.testnet;

export const rpc = new StellarSdk.rpc.Server(config.rpcUrl);
export const horizon = new StellarSdk.Horizon.Server(config.horizonUrl);

export function getContractId(): string {
  const id = import.meta.env.VITE_CONTRACT_ID;
  if (!id) {
    throw new Error("Missing VITE_CONTRACT_ID");
  }
  return id;
}

export const EVENT_FETCH_INTERVAL_MS = 2000;
export const DETAIL_POLL_INTERVAL_MS = 2000;
export const MIN_FEE_XLM = 0.5;
