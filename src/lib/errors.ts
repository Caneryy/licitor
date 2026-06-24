import * as StellarSdk from "@stellar/stellar-sdk";

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
  8: { id: "unauthorized_finalizer", category: "contract", message: "Only the seller can finalize this auction." },
  9: { id: "escrow_failed", category: "contract", message: "Escrow settlement failed. Check your USDC balance and try again." },
};

const TX_RESULT_ERRORS: Record<string, ClassifiedError> = {
  txBadAuth: {
    id: "tx_bad_auth",
    category: "transaction",
    message:
      "Transaction signature is invalid. Reconnect your wallet, switch Freighter to Testnet, and try again.",
  },
  txBadSeq: {
    id: "tx_bad_seq",
    category: "transaction",
    message: "Account sequence is out of date. Please retry the transaction.",
  },
  txInsufficientFee: {
    id: "insufficient_fee",
    category: "transaction",
    message: "Transaction fee is too low. Please retry.",
  },
  txTooEarly: {
    id: "tx_too_early",
    category: "transaction",
    message: "Transaction time bounds are invalid. Please retry.",
  },
};

function parseTxSubmissionError(message: string): ClassifiedError | null {
  const match = message.match(/tx_submission_failed:\s*(\S+)/);
  if (!match) return null;

  try {
    const result = StellarSdk.xdr.TransactionResult.fromXDR(match[1], "base64");
    const code = result.result().switch().name;
    return (
      TX_RESULT_ERRORS[code] ?? {
        id: "tx_submission_failed",
        category: "transaction",
        message: `Transaction was rejected by the network (${code}).`,
      }
    );
  } catch {
    return {
      id: "tx_submission_failed",
      category: "transaction",
      message: "Transaction submission failed. Please retry.",
    };
  }
}

function fromMessage(message: string): ClassifiedError | null {
  const lower = message.toLowerCase();
  const txError = parseTxSubmissionError(message);
  if (txError) return txError;
  if (lower.includes("not installed") || lower.includes("wallet not found") || lower.includes("no wallet")) {
    return { id: "wallet_not_found", category: "wallet", message: "Install Freighter, xBull, or Lobstr to continue." };
  }
  if (lower.includes("user rejected") || lower.includes("denied") || lower.includes("cancel")) {
    return { id: "user_rejected", category: "wallet", message: "Transaction cancelled in wallet." };
  }
  if (lower.includes("insufficient") && lower.includes("balance")) {
    return {
      id: "insufficient_balance",
      category: "wallet",
      message: "Insufficient USDC for this bid or XLM for transaction fees.",
    };
  }
  if (lower.includes("wrong network") || lower.includes("network mismatch")) {
    return { id: "wrong_network", category: "wallet", message: "Wallet is connected to the wrong network. Switch to testnet." };
  }
  if (lower.includes("wallet_address_mismatch")) {
    return {
      id: "wallet_address_mismatch",
      category: "wallet",
      message: "Wallet account changed. Reconnect your wallet and try again.",
    };
  }
  if (lower.includes("tx_not_signed")) {
    return {
      id: "tx_not_signed",
      category: "wallet",
      message: "Wallet did not sign the transaction. Approve the request in your wallet and try again.",
    };
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
  if (lower.includes("missing vite_contract_id") || lower.includes("missing vite_auction_contract_id")) {
    return { id: "missing_contract_id", category: "transaction", message: "Contract ID is not configured." };
  }
  return null;
}

function parseHorizonError(error: unknown): ClassifiedError | null {
  const response = error as {
    response?: {
      data?: {
        detail?: string;
        extras?: { result_codes?: { transaction?: string; operations?: string[] } };
      };
    };
  };
  const detail = response.response?.data?.detail;
  const txCode = response.response?.data?.extras?.result_codes?.transaction;
  const opCodes = response.response?.data?.extras?.result_codes?.operations ?? [];

  if (opCodes.includes("op_no_trust")) {
    return {
      id: "no_trustline",
      category: "wallet",
      message: "Add a USDC trustline before receiving or sending this asset.",
    };
  }
  if (opCodes.includes("op_underfunded")) {
    return {
      id: "underfunded",
      category: "wallet",
      message: "Insufficient XLM to cover the trustline reserve and fees.",
    };
  }
  if (detail) {
    return {
      id: "horizon_error",
      category: "transaction",
      message: detail,
    };
  }
  if (txCode) {
    return {
      id: "horizon_tx_failed",
      category: "transaction",
      message: `Transaction failed on network (${txCode}).`,
    };
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
    parseHorizonError(error) ??
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
  insufficientTokenBalance: {
    id: "insufficient_token_balance",
    category: "validation" as const,
    message: "Insufficient USDC balance for this bid.",
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
