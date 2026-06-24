import * as StellarSdk from "@stellar/stellar-sdk";
import { decimalStringToStroops } from "./format";
import { classifyError } from "./errors";
import { simulateRead } from "./contract";
import { config, getTokenContractId, horizon } from "./stellar";

const TRUSTLINE_LIMIT = "1000000";

function isTrustlineAlreadyExists(error: unknown): boolean {
  const response = error as {
    response?: { data?: { extras?: { result_codes?: { operations?: string[] } } } };
  };
  const codes = response.response?.data?.extras?.result_codes?.operations ?? [];
  return codes.includes("op_already_exists");
}

export async function getSacTokenBalance(address: string): Promise<bigint> {
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

/** @deprecated Use getSacTokenBalance */
export async function getTokenBalance(address: string): Promise<bigint> {
  return getSacTokenBalance(address);
}

export async function getClassicUsdcBalance(address: string): Promise<bigint> {
  const account = await horizon.loadAccount(address);
  const asset = new StellarSdk.Asset(config.usdcAssetCode, config.usdcIssuer);
  const line = account.balances.find((balance) => {
    if (balance.asset_type === "native" || balance.asset_type === "liquidity_pool_shares") {
      return false;
    }
    return balance.asset_code === asset.getCode() && balance.asset_issuer === asset.getIssuer();
  });

  if (!line || !("balance" in line)) {
    return 0n;
  }

  return decimalStringToStroops(line.balance);
}

/**
 * USDC balance for bidding: max of Horizon trustline (faucet) and SAC contract read.
 * Circle faucet credits classic trustline balance; escrow reads via SAC.
 */
export async function getUsdcBalance(address: string): Promise<bigint> {
  const [classic, sac] = await Promise.all([
    getClassicUsdcBalance(address).catch(() => 0n),
    getSacTokenBalance(address).catch(() => 0n),
  ]);
  return classic > sac ? classic : sac;
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
    fee: (Number(StellarSdk.BASE_FEE) * 100).toString(),
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset,
        limit: TRUSTLINE_LIMIT,
      }),
    )
    .setTimeout(180)
    .build();
  return transaction.toXDR();
}

export async function submitChangeTrust(
  sourceAddress: string,
  sign: (xdr: string, sourceAddress: string) => Promise<string>,
): Promise<string> {
  const unsignedXdr = await buildChangeTrustXdr(sourceAddress);
  const signedXdr = await sign(unsignedXdr, sourceAddress);

  const transaction = StellarSdk.TransactionBuilder.fromXDR(
    signedXdr,
    config.networkPassphrase,
  ) as StellarSdk.Transaction;

  try {
    const response = await horizon.submitTransaction(transaction);
    return response.hash;
  } catch (error) {
    if (isTrustlineAlreadyExists(error)) {
      return "trustline_exists";
    }
    throw classifyError(error);
  }
}

export function getTestnetUsdcFaucetUrl(): string {
  return "https://faucet.circle.com/";
}

export async function readTokenBalanceForDisplay(address: string | null): Promise<bigint | null> {
  if (!address) return null;
  try {
    return await getUsdcBalance(address);
  } catch {
    return null;
  }
}
