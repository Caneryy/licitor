import { config } from "./stellar";

export function getExplorerTxUrl(hash: string): string {
  return `https://stellar.expert/explorer/testnet/tx/${hash}`;
}

export function getExplorerContractUrl(contractId: string): string {
  return `https://stellar.expert/explorer/testnet/contract/${contractId}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `https://stellar.expert/explorer/testnet/account/${address}`;
}

export function isTestnetPassphrase(passphrase: string): boolean {
  return passphrase === config.networkPassphrase;
}
