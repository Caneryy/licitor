import { horizon } from "./stellar";

export async function getNativeBalance(address: string): Promise<number> {
  const account = await horizon.loadAccount(address);
  const native = account.balances.find((b) => b.asset_type === "native");
  return native ? Number(native.balance) : 0;
}
