import { describe, expect, it } from "vitest";
import { classifyError } from "./errors";

describe("classifyError", () => {
  it("maps contract error codes", () => {
    const result = classifyError(new Error("Error(Contract, #3)"));
    expect(result.id).toBe("bid_too_low");
    expect(result.category).toBe("contract");
  });

  it("maps unauthorized finalizer", () => {
    const result = classifyError(new Error("Error(Contract, #8)"));
    expect(result.id).toBe("unauthorized_finalizer");
  });

  it("maps wallet rejection", () => {
    const result = classifyError(new Error("User rejected the request"));
    expect(result.id).toBe("user_rejected");
    expect(result.category).toBe("wallet");
  });

  it("maps tx timeout", () => {
    const result = classifyError(new Error("tx_timeout"));
    expect(result.id).toBe("tx_timeout");
  });
});
