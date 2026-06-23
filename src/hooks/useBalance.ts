import { useCallback, useEffect, useState } from "react";
import { getNativeBalance } from "../lib/balance";
import { MIN_FEE_XLM } from "../lib/stellar";

export function useBalance(address: string | null) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!address) {
      setBalance(null);
      return;
    }
    setLoading(true);
    try {
      setBalance(await getNativeBalance(address));
    } catch {
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    balance,
    loading,
    hasFeeBalance: balance !== null ? balance >= MIN_FEE_XLM : false,
    refresh,
  };
}
