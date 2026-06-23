import { useCallback, useState } from "react";
import { invokeContract } from "../lib/contract";
import { getContractId } from "../lib/stellar";
import type { ClassifiedError } from "../lib/errors";
import { classifyError } from "../lib/errors";
import type { TxPhase } from "../lib/types";

interface RunOptions {
  sourceAddress: string;
  method: string;
  args: Parameters<typeof invokeContract>[3];
  sign: (xdr: string) => Promise<string>;
}

export function useSubmitAction() {
  const [phase, setPhase] = useState<TxPhase>("idle");
  const [error, setError] = useState<ClassifiedError | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhase("idle");
    setError(null);
    setTxHash(null);
  }, []);

  const run = useCallback(async ({ sourceAddress, method, args, sign }: RunOptions) => {
    setPhase("signing");
    setError(null);
    setTxHash(null);

    try {
      const result = await invokeContract(
        sourceAddress,
        getContractId(),
        method,
        args,
        sign,
        (nextPhase) => setPhase(nextPhase),
      );
      setTxHash(result.hash);
      setPhase("success");
      return result;
    } catch (err) {
      const classified = classifyError(err);
      setError(classified);
      setPhase("error");
      throw classified;
    }
  }, []);

  return { phase, error, txHash, run, reset, isBusy: phase !== "idle" && phase !== "success" && phase !== "error" };
}
