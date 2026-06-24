import { describe, expect, it } from "vitest";
import { computeEventStartLedger } from "./eventCursor";

describe("computeEventStartLedger", () => {
  it("uses cursor + 1 when cursor is behind latest", () => {
    expect(computeEventStartLedger(100, 200, 500)).toBe(101);
  });

  it("falls back to lookback when cursor is missing", () => {
    expect(computeEventStartLedger(null, 1000, 500)).toBe(500);
  });

  it("falls back when cursor equals latest", () => {
    expect(computeEventStartLedger(1000, 1000, 100)).toBe(900);
  });
});
