import * as StellarSdk from "@stellar/stellar-sdk";
import { simulateRead } from "./contract";
import { config, getTokenContractId, horizon } from "./stellar";

export async function getTokenBalance(address: string): Promise<bigint> {
  const tokenId = getTokenContractId();
  return simulateRead(
    address,
    tokenId,
    "balance",
    [StellarSdk.nativeToScVal(address, { type: "address" })],
    (value) => {
      if (!value) return 0n;
      return BigInt(StellarSdk.scValToNative(value) as string | number | bigint);
    },
  );
}

export async function hasUsdcTrustline(address: string): Promise<boolean> {
  try {
    const account = await horizon.loadAccount(address);
    const asset = new StellarSdk.Asset(config.usdcAssetCode, config.usdcIssuer);
    return account.balances.some((balance) => {
      if (balance.asset_type === "native" || balance.asset_type === "liquidity_pool_shares") {
        return false;
      }
      return balance.asset_code === asset.getCode() && balance.asset_issuer === asset.getIssuer();
    });
  } catch {
    return false;
  }
}

export async function buildChangeTrustXdr(sourceAddress: string): Promise<string> {
  const account = await horizon.loadAccount(sourceAddress);
  const asset = new StellarSdk.Asset(config.usdcAssetCode, config.usdcIssuer);
  const transaction = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset,
        limit: "1000000",
      }),
    )
    .setTimeout(180)
    .build();
  return transaction.toXDR();
}

export async function readTokenBalanceForDisplay(address: string | null): Promise<bigint | null> {
  if (!address) return null;
  try {
    return await getTokenBalance(address);
  } catch {
    return null;
  }
}
