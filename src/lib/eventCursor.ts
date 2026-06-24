export const EVENT_CURSOR_STORAGE_KEY = "licitor_event_cursor";

export function getStoredEventCursor(): number | null {
  if (typeof sessionStorage === "undefined") return null;
  const raw = sessionStorage.getItem(EVENT_CURSOR_STORAGE_KEY);
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function setStoredEventCursor(ledger: number): void {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.setItem(EVENT_CURSOR_STORAGE_KEY, String(ledger));
}

export function computeEventStartLedger(
  storedCursor: number | null,
  latestLedger: number,
  fallbackLookback: number,
): number {
  if (storedCursor !== null && storedCursor < latestLedger) {
    return storedCursor + 1;
  }
  return Math.max(1, latestLedger - fallbackLookback);
}
