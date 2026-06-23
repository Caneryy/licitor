export const STROOPS_PER_XLM = 10_000_000n;

export function xlmToStroops(xlm: string): bigint {
  const trimmed = xlm.trim();
  if (!trimmed || Number.isNaN(Number(trimmed))) {
    throw new Error("Invalid amount");
  }
  const [whole, fraction = ""] = trimmed.split(".");
  const padded = (fraction + "0000000").slice(0, 7);
  return BigInt(whole) * STROOPS_PER_XLM + BigInt(padded);
}

export function stroopsToXlm(stroops: bigint): string {
  const negative = stroops < 0n;
  const value = negative ? -stroops : stroops;
  const whole = value / STROOPS_PER_XLM;
  const fraction = value % STROOPS_PER_XLM;
  const fractionStr = fraction.toString().padStart(7, "0").replace(/0+$/, "");
  const formatted = fractionStr ? `${whole}.${fractionStr}` : whole.toString();
  return negative ? `-${formatted}` : formatted;
}

export function truncateMiddle(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

export function formatDateTime(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

export function formatCountdown(endTime: number, now = Math.floor(Date.now() / 1000)): string {
  const remaining = endTime - now;
  if (remaining <= 0) return "Ended";
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export async function copyToClipboard(value: string): Promise<void> {
  await navigator.clipboard.writeText(value);
}
