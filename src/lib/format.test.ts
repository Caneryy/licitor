import { describe, expect, it } from "vitest";
import {
  decimalStringToStroops,
  formatTokenAmount,
  formatTokenWithSymbol,
  suggestedNextBidXlm,
  truncateMiddle,
  xlmToStroops,
} from "./format";

describe("format", () => {
  it("converts token amounts", () => {
    expect(xlmToStroops("1.5")).toBe(15_000_000n);
    expect(formatTokenAmount(15_000_000n)).toBe("1.5");
    expect(formatTokenWithSymbol(10_000_000n)).toBe("1 USDC");
  });

  it("suggests next whole token bid", () => {
    expect(suggestedNextBidXlm(20_000_000n)).toBe("3");
  });

  it("parses horizon decimal balances", () => {
    expect(decimalStringToStroops("20.0000000")).toBe(200_000_000n);
    expect(decimalStringToStroops("3")).toBe(30_000_000n);
  });

  it("truncates long addresses", () => {
    expect(truncateMiddle("GABCDEFGHIJKLMNOPQRSTUVWXYZ", 4, 4)).toBe("GABC…WXYZ");
  });
});
