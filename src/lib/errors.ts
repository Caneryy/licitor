export type ErrorCategory =
  | "wallet"
  | "contract"
  | "transaction"
  | "validation"
  | "unknown";

export interface ClassifiedError {
  id: string;
  category: ErrorCategory;
  message: string;
}

const CONTRACT_ERRORS: Record<number, ClassifiedError> = {
  1: { id: "auction_not_found", category: "contract", message: "Auction not found." },
  2: { id: "auction_ended", category: "contract", message: "This auction has already ended." },
  3: { id: "bid_too_low", category: "contract", message: "Your bid must be higher than the current highest bid." },
  4: { id: "auction_still_active", category: "contract", message: "Auction is still active and cannot be finalized yet." },
  5: { id: "auction_expired", category: "contract", message: "Auction has expired and no longer accepts bids." },
  6: { id: "invalid_starting_bid", category: "contract", message: "Starting bid must be greater than zero." },
  7: { id: "invalid_duration", category: "contract", message: "Auction duration must be greater than zero." },
};

function fromMessage(message: string): ClassifiedError | null {
  const lower = message.toLowerCase();
  if (lower.includes("not installed") || lower.includes("wallet not found") || lower.includes("no wallet")) {
    return { id: "wallet_not_found", category: "wallet", message: "Install Freighter, xBull, or Lobstr to continue." };
  }
  if (lower.includes("user rejected") || lower.includes("denied") || lower.includes("cancel")) {
    return { id: "user_rejected", category: "wallet", message: "Transaction cancelled in wallet." };
  }
  if (lower.includes("insufficient") && lower.includes("balance")) {
    return { id: "insufficient_balance", category: "wallet", message: "Insufficient XLM for transaction fees." };
  }
  if (lower.includes("wrong network") || lower.includes("network mismatch")) {
    return { id: "wrong_network", category: "wallet", message: "Wallet is connected to the wrong network. Switch to testnet." };
  }
  if (lower.includes("not funded") || lower.includes("account not found")) {
    return { id: "account_not_found", category: "transaction", message: "Account not found. Fund it with Friendbot first." };
  }
  if (lower.includes("restore")) {
    return { id: "contract_restore_required", category: "transaction", message: "Contract state restore is required. Retry the transaction." };
  }
  if (lower.includes("simulation")) {
    return { id: "simulation_failed", category: "contract", message: "Transaction simulation failed." };
  }
  if (lower.includes("timeout")) {
    return { id: "tx_timeout", category: "transaction", message: "Transaction confirmation timed out." };
  }
  if (lower.includes("missing vite_contract_id")) {
    return { id: "missing_contract_id", category: "transaction", message: "Contract ID is not configured." };
  }
  return null;
}

function parseContractCode(message: string): ClassifiedError | null {
  const match = message.match(/Error\(Contract,\s*#(\d+)\)/);
  if (!match) return null;
  return CONTRACT_ERRORS[Number(match[1])] ?? {
    id: "contract_error",
    category: "contract",
    message: "Contract execution failed.",
  };
}

export function classifyError(error: unknown): ClassifiedError {
  if (typeof error === "object" && error && "id" in error && "message" in error) {
    return error as ClassifiedError;
  }

  const message = error instanceof Error ? error.message : String(error);
  return (
    parseContractCode(message) ??
    fromMessage(message) ?? {
      id: "unknown_error",
      category: "unknown",
      message: message || "Something went wrong.",
    }
  );
}

export function getUserMessage(error: unknown): string {
  return classifyError(error).message;
}

export const validationErrors = {
  invalidBidAmount: {
    id: "invalid_bid_amount",
    category: "validation" as const,
    message: "Enter a valid bid amount greater than zero.",
  },
  invalidTitle: {
    id: "invalid_title",
    category: "validation" as const,
    message: "Auction title is required.",
  },
  invalidDuration: {
    id: "invalid_duration",
    category: "validation" as const,
    message: "Duration must be greater than zero.",
  },
};
