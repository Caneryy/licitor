import { describe, expect, it } from "vitest";
import {
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

  it("truncates long addresses", () => {
    expect(truncateMiddle("GABCDEFGHIJKLMNOPQRSTUVWXYZ", 4, 4)).toBe("GABC…WXYZ");
  });
});
